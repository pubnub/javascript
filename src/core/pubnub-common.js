/* @flow */

import Networking from './components/networking';
import Config from './components/config';
import State from './components/state';
import PublishQueue from './components/publish_queue';
import Crypto from './components/cryptography/index';

import PresenceHeartbeat from './iterators/presence_heartbeat';

import Subscriber from './iterators/subscriber';

import TimeEndpoint from './endpoints/time';
import PresenceEndpoints from './endpoints/presence';
import HistoryEndpoint from './endpoints/history';
import PushEndpoint from './endpoints/push';
import AccessEndpoints from './endpoints/access';
import ChannelGroupEndpoints from './endpoints/channel_groups';

import SubscribeEndpoints from './endpoints/subscribe';
import PublishEndpoints from './endpoints/publish';

let packageJSON = require('../../package.json');
import { callbackStruct, internalSetupStruct } from './flow_interfaces';

export default function createInstance(setup: internalSetupStruct): Object {
  let { sendBeacon, db, shutdown } = setup;

  let config = new Config(setup);

  if (setup.presenceAnnounceInterval) {
    config.setPresenceAnnounceInterval(setup.presenceAnnounceInterval);
  }

  let state = new State();
  let callbacks: callbackStruct = {
    onMessage: setup.onMessage,
    onStatus: setup.onStatus,
    onPresence: setup.onPresence
  };

  // write the new key to storage
  db.set(config.getSubscribeKey() + 'uuid', config.getUUID());

  let crypto = new Crypto({ config });
  let networking = new Networking({ config, crypto, sendBeacon });
  let publishQueue = new PublishQueue({ networking });
  let subscriber = new Subscriber({ networking, state, callbacks });

  // init the endpoints
  let timeEndpoint = new TimeEndpoint({ networking });
  let historyEndpoint = new HistoryEndpoint({ networking, crypto });
  let channelGroupEndpoints = new ChannelGroupEndpoints({ networking });
  let publishEndpoints = new PublishEndpoints({ publishQueue });
  let pushEndpoints = new PushEndpoint({ networking, publishQueue });
  let presenceEndpoints = new PresenceEndpoints({ config, networking, state });
  let accessEndpoints = new AccessEndpoints({ config, networking });
  let subscribeEndpoints = new SubscribeEndpoints({ networking, callbacks, config, state });

  let presenceHeartbeat = new PresenceHeartbeat({ callbacks, state, presenceEndpoints });

  // let connectivity = new Connectivity({ eventEmitter, networking, timeEndpoint });


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
    subscribe: subscribeEndpoints.subscribe.bind(subscribeEndpoints),
    unsubscribe: subscribeEndpoints.unsubscribe.bind(subscribeEndpoints),

    presence: {
      hereNow: presenceEndpoints.hereNow.bind(presenceEndpoints),
      whereNow: presenceEndpoints.whereNow.bind(presenceEndpoints),
      getState: presenceEndpoints.getState.bind(presenceEndpoints),
      setState: presenceEndpoints.setState.bind(presenceEndpoints),
    },

    push: {
      addDeviceToPushChannel: pushEndpoints.addDeviceToPushChannel.bind(pushEndpoints),
      removeDeviceFromPushChannel: pushEndpoints.removeDeviceFromPushChannel.bind(pushEndpoints),
      send: pushEndpoints.send.bind(pushEndpoints),
    },

    getPresenceTimeout: config.getPresenceTimeout.bind(config),
    setPresenceTimeout: config.setPresenceTimeout.bind(config),

    getPresenceAnnounceInterval: config.getPresenceAnnounceInterval.bind(config),
    setPresenceAnnounceInterval: config.setPresenceAnnounceInterval.bind(config),

    setAuthKey: config.setAuthKey.bind(config),

    setUUID: config.setUUID.bind(config),
    getUUID: config.getUUID.bind(config),

    setCipherKey: config.setCipherKey.bind(config),
    getCipherKey: config.getCipherKey.bind(config),

    getSubscribedChannels: state.getSubscribedChannels.bind(state),

    stopTimers() {
      // connectivity.stop();
      presenceHeartbeat.stop();
    },

    getVersion() {
      return packageJSON.version;
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
  subscriber.start();
  presenceHeartbeat.start();

  return SELF;
}
