/* @flow */

import uuidGenerator from 'uuid';
import EventEmitter from 'event-emitter';

import Networking from './components/networking';
import Keychain from './components/keychain';
import Config from './components/config';
import State from './components/state';
import PublishQueue from './components/publish_queue';

import PresenceHeartbeat from './components/presence_heartbeat';
import Connectivity from './components/connectivity';

import TimeEndpoint from './endpoints/time';
import PresenceEndpoints from './endpoints/presence';
import HistoryEndpoint from './endpoints/history';
import PushEndpoint from './endpoints/push';
import AccessEndpoints from './endpoints/access';
import ChannelGroupEndpoints from './endpoints/channel_groups';

import PubSubEndpoints from './endpoints/pubsub';
import PublishEndpoints from './endpoints/publish';

let packageJSON = require('../../package.json');
let utils = require('./utils');

let DEF_WINDOWING = 10; // MILLISECONDS.
let DEF_TIMEOUT = 15000; // MILLISECONDS.
let DEF_SUB_TIMEOUT = 310; // SECONDS.
let DEF_KEEPALIVE = 60; // SECONDS (FOR TIMESYNC).

type setupObject = {
  use_send_beacon: ?boolean, // configuration on beacon usage
  sendBeacon: ?Function, // executes a call against the Beacon API
  publishKey: ?string, // API key required for publishing
  subscribeKey: string, // API key required to subscribe
  cipherKey: string, // decryption keys
  origin: ?string, // an optional FQDN which will recieve calls from the SDK.
  hmac_SHA256: Function, // hashing function required for Access Manager
  ssl: boolean, // is SSL enabled?
  shutdown: Function // function to call when pubnub is shutting down.
}

export default function createInstance(setup: setupObject): Object {
  let shutdown = setup.shutdown;
  let useSendBeacon = (typeof setup.use_send_beacon !== 'undefined') ? setup.use_send_beacon : true;
  let sendBeacon = (useSendBeacon) ? setup.sendBeacon : null;
  let db = setup.db || { get: function () {}, set: function () {} };
  let error = setup.error || function () {};
  let hmac_SHA256 = setup.hmac_SHA256;
  let crypto_obj = setup.crypto_obj || {
    encrypt(a) { return a; },
    decrypt(b) { return b; },
  };

  // initialize the encryption and decryption logic
  function encrypt(input, key) {
    return crypto_obj.encrypt(input, key || keychain.getCipherKey()) || input;
  }

  function decrypt(input, key) {
    return crypto_obj['decrypt'](input, key || keychain.getCipherKey()) ||
      crypto_obj['decrypt'](input, keychain.getCipherKey()) ||
      input;
  }

  let keychain = new Keychain()
    .setInstanceId(uuidGenerator.v4())
    .setAuthKey(setup.authKey || '')
    .setSecretKey(setup.secretKey || '')
    .setSubscribeKey(setup.subscribeKey)
    .setPublishKey(setup.publishKey)
    .setCipherKey(setup.cipherKey);

  keychain.setUUID(
    setup.uuid ||
    (!setup.unique_uuid && db.get(keychain.getSubscribeKey() + 'uuid') || uuidGenerator.v4())
  );

  // write the new key to storage
  db.set(keychain.getSubscribeKey() + 'uuid', keychain.getUUID());

  let config = new Config()
    .setRequestIdConfig(setup.use_request_id || false)
    .setPresenceTimeout(utils.validateHeartbeat(setup.heartbeat || setup.pnexpires || 0, error))
    .setSupressLeaveEvents(setup.noleave || 0)
    // .setSubscribeWindow(+setup.windowing || DEF_WINDOWING)
    // .setSubscribeTimeout((+setup.timeout || DEF_SUB_TIMEOUT) * constants.SECOND)
    .setInstanceIdConfig(setup.instance_id || false);

  config
    .setHeartbeatInterval(setup.heartbeat_interval || (config.getPresenceTimeout() / 2) - 1);

  let stateStorage = new State();

  let networking = new Networking({ config, keychain, encrypt }, setup.ssl, setup.origin)
    .addBeaconDispatcher(sendBeacon)
    // .setRequestTimeout(setup.timeout || DEF_TIMEOUT)
    .setCoreParams(setup.params || {});

  let publishQueue = new PublishQueue({ networking });
  let eventEmitter = EventEmitter({});

  // initalize the endpoints
  let timeEndpoint = new TimeEndpoint({ networking });
  let historyEndpoint = new HistoryEndpoint({ networking, decrypt });
  let channelGroupEndpoints = new ChannelGroupEndpoints({ networking });
  let publishEndpoints = new PublishEndpoints({ publishQueue });
  let pushEndpoints = new PushEndpoint({ networking, publishQueue });

  let presenceEndpoints = new PresenceEndpoints({ keychain, config, networking, error, state: stateStorage });

  let accessEndpoints = new AccessEndpoints({ keychain, config, networking, error, hmac_SHA256 });

  let pubsubEndpoints = new PubSubEndpoints({ keychain, networking, presenceEndpoints, error, config, state: stateStorage });

  let presenceHeartbeat = new PresenceHeartbeat(config, stateStorage, presenceEndpoints, eventEmitter, error);
  let connectivity = new Connectivity({ eventEmitter, networking, timeEndpoint });

  if (config.getPresenceTimeout() === 2) {
    config.setHeartbeatInterval(1);
  }

  let SELF = {

    accessManager: {
      grant: accessEndpoints.grant.bind(accessEndpoints),
      audit: accessEndpoints.audit.bind(accessEndpoints),
      revoke: accessEndpoints.revoke.bind(accessEndpoints),
    },

    channelGroups: {
      listGroups: channelGroupEndpoints.listGroups.bind(channelGroupEndpoints),
      deleteGroup: channelGroupEndpoints.removeGroup.bind(channelGroupEndpoints),
      listChannels: channelGroupEndpoints.listChannels.bind(channelGroupEndpoints),
      addChannel: channelGroupEndpoints.addChannel.bind(channelGroupEndpoints),
      removeChannel: channelGroupEndpoints.addChannel.bind(channelGroupEndpoints)
    },

    history: historyEndpoint.fetch.bind(historyEndpoint),
    time: timeEndpoint.fetch.bind(timeEndpoint),
    publish: publishEndpoints.publish.bind(publishEndpoints),

    presence: {
      hereNow: presenceEndpoints.hereNow.bind(presenceEndpoints),
      whereNow: presenceEndpoints.whereNow.bind(presenceEndpoints),
      getState: presenceEndpoints.getState.bind(presenceEndpoints),
      setState: presenceEndpoints.setState.bind(presenceEndpoints),
    },

    push: {
      addDeviceToChannel: pushEndpoints.addDeviceToChannel.bind(pushEndpoints),
      removeDeviceFromChannel: pushEndpoints.removeDeviceFromChannel.bind(pushEndpoints),
      sendNotification: pushEndpoints.sendNotification.bind(pushEndpoints),
    },

    // dark zone

    unsubscribe(args: Object, callback: Function) {
      TIMETOKEN = 0;
      SUB_RESTORE = 1;   // REVISIT !!!!

      pubsubEndpoints.performUnsubscribe(args, callback);

      CONNECT();
    },

    subscribe: function (args, callback) {

    },

    getCipherKey() {
      return keychain.getCipherKey();
    },

    setCipherKey(key: string) {
      keychain.setCipherKey(key);
    },

    rawEncrypt(input: string, key: string): string {
      return encrypt(input, key);
    },

    rawDecrypt(input: string, key: string): string {
      return decrypt(input, key);
    },

    getHeartbeat() {
      return config.getPresenceTimeout();
    },

    setHeartbeat(heartbeat, heartbeat_interval) {
      config.setPresenceTimeout(utils.validateHeartbeat(heartbeat, config.getPresenceTimeout(), error));
      config.setHeartbeatInterval(heartbeat_interval || (config.getPresenceTimeout() / 2) - 1);
      if (config.getPresenceTimeout() === 2) {
        config.setHeartbeatInterval(1);
      }

      // emit the event
      eventEmitter.emit('presenceHeartbeatChanged');
    },

    getHeartbeatInterval() {
      return config.getHeartbeatInterval();
    },

    setHeartbeatInterval(heartbeatInterval) {
      config.setHeartbeatInterval(heartbeatInterval);
      eventEmitter.emit('presenceHeartbeatChanged');
    },

    getVersion() {
      return packageJSON.version;
    },

    addParam(key: string, val: any) {
      networking.addCoreParam(key, val);
    },

    setAuthKey(auth) {
      keychain.setAuthKey(auth);
      eventEmitter.emit('keychainChanged');
    },

    setUUID(uuid) {
      keychain.setUUID(uuid);
      eventEmitter.emit('keychainChanged');
    },

    getUUID() {
      return keychain.getUUID();
    },

    getSubscribedChannels() {
      return stateStorage.generate_channel_list(true);
    },

    stopTimers() {
      connectivity.stop();
      presenceHeartbeat.stop();
    },

    shutdown() {
      SELF.stopTimers();
      if (shutdown) shutdown();
    }
  };

  /*
    create the connectivity element last, this will signal to other elements
    that the SDK is connected to internet.
  */
  // connectivity.start();
  // presenceHeartbeat.start();

  return SELF;
}
