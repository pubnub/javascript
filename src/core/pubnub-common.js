/* @flow */

import Networking from './components/networking';
import Config from './components/config';
import Crypto from './components/cryptography/index';
import packageJSON from '../../package.json';

/*
import PresenceHeartbeat from './iterators/presence_heartbeat';
import SubscribeEndpoints from './endpoints/subscribe';
import Subscriber from './iterators/subscriber';
*/

import TimeEndpoint from './endpoints/time';
import PresenceEndpoints from './endpoints/presence';
import HistoryEndpoint from './endpoints/history';
import PushEndpoint from './endpoints/push';
import AccessEndpoints from './endpoints/access';
import ChannelGroupEndpoints from './endpoints/channel_groups';

import PublishEndpoints from './endpoints/publish';


import { internalSetupStruct } from './flow_interfaces';

export default class {

  config: Config;
  crypto: Crypto;
  networking: Networking;

  // tell flow about the mounted endpoint
  time: Function;
  publish: Function;

  constructor(setup: internalSetupStruct) {
    let { sendBeacon, db } = setup;

    this.config = new Config(setup);
    this.crypto = new Crypto({ config: this.config });
    this.networking = new Networking({ config: this.config, crypto: this.crypto, sendBeacon });

    // write the new key to storage
    db.set(this.config.subscribeKey + 'uuid', this.config.UUID);

    // mount up the endpoints
    const timeEndpoint = new TimeEndpoint({ networking: this.networking, config: this.config });
    this.time = timeEndpoint.fetch.bind(timeEndpoint);

    const channelGroupEndpoints = new ChannelGroupEndpoints({ networking: this.networking, config: this.config });
    this.channelGroups = {
      listChannels: channelGroupEndpoints.listChannels.bind(channelGroupEndpoints),
      listAll: channelGroupEndpoints.listGroups.bind(channelGroupEndpoints),
      addChannels: channelGroupEndpoints.addChannels.bind(channelGroupEndpoints),
      removeChannels: channelGroupEndpoints.removeChannels.bind(channelGroupEndpoints),
      deleteGroup: channelGroupEndpoints.deleteGroup.bind(channelGroupEndpoints),
    };


    // const publishEndpoints = new PublishEndpoints({ networking: this.networking });
    // this.publish = publishEndpoints.publish.bind(publishEndpoints);
  }

  getVersion(): String { return packageJSON.version; }

}
  /*
  let

  let callbacks: callbackStruct = {
    onMessage: setup.onMessage,
    onStatus: setup.onStatus,
    onPresence: setup.onPresence
  };

  // let state = new State();
  // let subscriber = new Subscriber({ networking, state, callbacks });
  // let connectivity = new Connectivity({ eventEmitter, networking, timeEndpoint });
  // let presenceHeartbeat = new PresenceHeartbeat({ callbacks, state, presenceEndpoints });

  // init the endpoints
  let historyEndpoint = new HistoryEndpoint({ networking, crypto });
  let channelGroupEndpoints = new ChannelGroupEndpoints({ networking });
  let pushEndpoints = new PushEndpoint({ networking });
  let presenceEndpoints = new PresenceEndpoints({ config, networking });
  let accessEndpoints = new AccessEndpoints({ config, networking });
  // let subscribeEndpoints = new SubscribeEndpoints({ networking, callbacks, config });

  let SELF = {

    accessManager: {
      grant: accessEndpoints.grant.bind(accessEndpoints),
      audit: accessEndpoints.audit.bind(accessEndpoints),
      revoke: accessEndpoints.revoke.bind(accessEndpoints),
    },

    history: historyEndpoint.fetch.bind(historyEndpoint),

    // subscribe: subscribeEndpoints.subscribe.bind(subscribeEndpoints),
    // unsubscribe: subscribeEndpoints.unsubscribe.bind(subscribeEndpoints),

    presence: {
      hereNow: presenceEndpoints.hereNow.bind(presenceEndpoints),
      whereNow: presenceEndpoints.whereNow.bind(presenceEndpoints),
      getState: presenceEndpoints.getState.bind(presenceEndpoints),
      setState: presenceEndpoints.setState.bind(presenceEndpoints),
    },

    push: {
      addDeviceToPushChannel: pushEndpoints.addDeviceToPushChannel.bind(pushEndpoints),
      removeDeviceFromPushChannel: pushEndpoints.removeDeviceFromPushChannel.bind(pushEndpoints)
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

    // getSubscribedChannels: state.getSubscribedChannels.bind(state),

    stopTimers() {
      // connectivity.stop();
      // presenceHeartbeat.stop();
    },

    shutdown() {
      SELF.stopTimers();
      if (shutdown) shutdown();
    }
  };
}
*/
