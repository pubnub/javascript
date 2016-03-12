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

import Responders from './presenters/responders';

import TimeEndpoint from './endpoints/time';
import PresenceEndpoints from './endpoints/presence';
import HistoryEndpoint from './endpoints/history';
import PushEndpoint from './endpoints/push';
import AccessEndpoints from './endpoints/access';
import ReplyEndpoint from './endpoints/replay';
import ChannelGroupEndpoints from './endpoints/channel_groups';
import PubSubEndpoints from './endpoints/pubsub';

let packageJSON = require('../../package.json');
let constants = require('../../defaults.json');
let utils = require('./utils');

let DEF_WINDOWING = 10; // MILLISECONDS.
let DEF_TIMEOUT = 15000; // MILLISECONDS.
let DEF_SUB_TIMEOUT = 310; // SECONDS.
let DEF_KEEPALIVE = 60; // SECONDS (FOR TIMESYNC).

type setupObject = {
  use_send_beacon: ?boolean, // configuration on beacon usage
  sendBeacon: ?Function, // executes a call against the Beacon API
  publish_key: ?string, // API key required for publishing
  subscribe_key: string, // API key required to subscribe
  cipher_key: string, // decryption keys
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

  let keychain = new Keychain()
    .setInstanceId(uuidGenerator.v4())
    .setAuthKey(setup.auth_key || '')
    .setSecretKey(setup.secret_key || '')
    .setSubscribeKey(setup.subscribe_key)
    .setPublishKey(setup.publish_key)
    .setCipherKey(setup.cipher_key);

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

  let networking = new Networking(config, keychain, setup.ssl, setup.origin)
    .addBeaconDispatcher(sendBeacon)
    // .setRequestTimeout(setup.timeout || DEF_TIMEOUT)
    .setCoreParams(setup.params || {});

  let publishQueue = new PublishQueue({ networking });

  // initialize the encryption and decryption logic
  function encrypt(input, key) {
    return crypto_obj.encrypt(input, key || keychain.getCipherKey()) || input;
  }

  function decrypt(input, key) {
    return crypto_obj['decrypt'](input, key || keychain.getCipherKey()) ||
      crypto_obj['decrypt'](input, keychain.getCipherKey()) ||
      input;
  }

  let eventEmitter = EventEmitter({});

  // initalize the endpoints
  let timeEndpoint = new TimeEndpoint({ keychain, config, networking });
  let pushEndpoint = new PushEndpoint({ keychain, config, networking, error });
  let presenceEndpoints = new PresenceEndpoints({ keychain, config, networking, error, state: stateStorage });
  let historyEndpoint = new HistoryEndpoint({ keychain, networking, error, decrypt });
  let accessEndpoints = new AccessEndpoints({ keychain, config, networking, error, hmac_SHA256 });
  let replayEndpoint = new ReplyEndpoint({ keychain, networking, error });
  let channelGroupEndpoints = new ChannelGroupEndpoints({ keychain, networking, config, error });
  let pubsubEndpoints = new PubSubEndpoints({ keychain, networking, presenceEndpoints, error, config, publishQueue, state: stateStorage });

  let presenceHeartbeat = new PresenceHeartbeat(config, stateStorage, presenceEndpoints, eventEmitter, error);
  let connectivity = new Connectivity({ eventEmitter, networking, timeEndpoint });

  if (config.getPresenceTimeout() === 2) {
    config.setHeartbeatInterval(1);
  }

  // Announce Leave Event
  let SELF = {
    history: historyEndpoint.fetchHistory.bind(historyEndpoint),
    replay(args: Object, callback: Function) { replayEndpoint.performReplay(args, callback); },
    time(callback: Function) { timeEndpoint.fetchTime(callback); },

    presence: {
      hereNow(args: Object, callback: Function) { presenceEndpoints.hereNow(args, callback); },
      whereNow(args: Object, callback: Function) { presenceEndpoints.whereNow(args, callback); },
      state(args:Object, callback: Function) { presenceEndpoints.performState(args, callback); },
    },

    accessManager: {
      grant(args: Object, callback: Function) { accessEndpoints.performGrant(args, callback); },
      audit(args: Object, callback: Function) { accessEndpoints.performAudit(args, callback); },
    },

    push: {
      provisionDevice(args: Object) { pushEndpoint.provisionDevice(args); },
      sendPushNotification(args: Object) { return args;}
    },

    channelGroups: {
      listGroups(args: Object, callback: Function) { channelGroupEndpoints.listGroups(args, callback); },
      deleteGroup(args: Object, callback: Function) { channelGroupEndpoints.removeGroup(args, callback); },
      listChannels(args: Object, callback: Function) { channelGroupEndpoints.listChannels(args, callback); },
      addChannel(args: Object, callback: Function) { channelGroupEndpoints.addChannel(args, callback); },
      removeChannel(args: Object, callback: Function) { channelGroupEndpoints.removeChannel(args, callback); },
    },

    getCipherKey() {
      return keychain.getCipherKey();
    },

    setCipherKey(key: string) {
      keychain.setCipherKey(key);
    },

    rawEncrypt(input: string, key: string): string { return encrypt(input, key); },

    rawDecrypt(input: string, key: string): string {
      return decrypt(input, key);
    },

    getHeartbeat: function () {
      return config.getPresenceTimeout();
    },

    setHeartbeat: function (heartbeat, heartbeat_interval) {
      config.setPresenceTimeout(utils.validateHeartbeat(heartbeat, config.getPresenceTimeout(), error));
      config.setHeartbeatInterval(heartbeat_interval || (config.getPresenceTimeout() / 2) - 1);
      if (config.getPresenceTimeout() === 2) {
        config.setHeartbeatInterval(1);
      }
      CONNECT();

      // emit the event
      eventEmitter.emit('presenceHeartbeatChanged');
    },

    getHeartbeatInterval() {
      return config.getHeartbeatInterval();
    },

    setHeartbeatInterval(heartbeat_interval) {
      config.setHeartbeatInterval(heartbeat_interval);
      eventEmitter.emit('presenceHeartbeatChanged');
    },

    get_version() {
      return packageJSON.version;
    },

    getGcmMessageObject(obj) {
      return {
        data: obj,
      };
    },

    getApnsMessageObject(obj) {
      var x = {
        aps: { badge: 1, alert: '' }
      };
      for (var k in obj) {
        k[x] = obj[k];
      }
      return x;
    },

    _addParam(key, val) {
      networking.addCoreParam(key, val);
    },

    auth(auth) {
      keychain.setAuthKey(auth);
      CONNECT();
    },

    publish(args: Object, callback: Function) {
      pubsubEndpoints.performPublish(args, callback);
    },

    unsubscribe(args: Object, callback: Function) {
      TIMETOKEN = 0;
      SUB_RESTORE = 1;   // REVISIT !!!!

      pubsubEndpoints.performUnsubscribe(args, callback);

      CONNECT();
    },

    subscribe: function (args, callback) {

    },

    revoke: function (args, callback) {
      args['read'] = false;
      args['write'] = false;
      SELF['grant'](args, callback);
    },

    setUUID: function (uuid) {
      keychain.setUUID(uuid);
      CONNECT();
    },

    getUUID: function () {
      return keychain.getUUID();
    },

    getSubscribedChannels: function () {
      return stateStorage.generate_channel_list(true);
    },

    stopTimers: function () {
      connectivity.stop();
      presenceHeartbeat.stop();
    },

    shutdown: function () {
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
