/* @flow */

import Networking from './components/networking';
import Config from './components/config';
import Crypto from './components/cryptography/index';
import SubscriptionManager from './components/subscription_manager';

import packageJSON from '../../package.json';

/*
import PresenceHeartbeat from './iterators/presence_heartbeat';
import Subscriber from './iterators/subscriber';
*/

import TimeEndpoint from './endpoints/time';
import PresenceEndpoints from './endpoints/presence';
import HistoryEndpoint from './endpoints/history';
import PushEndpoint from './endpoints/push';
import AccessEndpoints from './endpoints/access';
import ChannelGroupEndpoints from './endpoints/channel_groups';
import SubscribeEndpoints from './endpoints/subscribe';
import PublishEndpoints from './endpoints/publish';

import { internalSetupStruct } from './flow_interfaces';

export default class {

  config: Config;
  crypto: Crypto;
  networking: Networking;

  // tell flow about the mounted endpoint
  time: Function;
  publish: Function;
  channelGroups: Object;
  pushNotifications: Object;
  presence: Object;
  history: Object;
  accessManager: Object;

  //
  setCipherKey: Function;

  constructor(setup: internalSetupStruct) {
    let { sendBeacon, db } = setup;

    this.config = new Config(setup);
    this.crypto = new Crypto({ config: this.config });
    this.networking = new Networking({ config: this.config, crypto: this.crypto, sendBeacon });

    const subscribeEndpoints = new SubscribeEndpoints({ networking: this.networking, config: this.config });
    const presenceEndpoints = new PresenceEndpoints({ networking: this.networking, config: this.config });
    const timeEndpoint = new TimeEndpoint({ networking: this.networking, config: this.config });
    const pushEndpoints = new PushEndpoint({ networking: this.networking, config: this.config });
    const channelGroupEndpoints = new ChannelGroupEndpoints({ networking: this.networking, config: this.config });
    const publishEndpoints = new PublishEndpoints({ networking: this.networking, config: this.config, crypto: this.crypto });
    const historyEndpoint = new HistoryEndpoint({ networking: this.networking, config: this.config, crypto: this.crypto });
    const accessEndpoints = new AccessEndpoints({ config: this.config, networking: this.networking, crypto: this.crypto });

    const subscriptionManager = new SubscriptionManager({ subscribeEndpoints, config: this.config, presenceEndpoints });

    // write the new key to storage
    db.set(this.config.subscribeKey + 'uuid', this.config.UUID);

    // mount up the endpoints

    this.channelGroups = {
      listChannels: channelGroupEndpoints.listChannels.bind(channelGroupEndpoints),
      listAll: channelGroupEndpoints.listGroups.bind(channelGroupEndpoints),
      addChannels: channelGroupEndpoints.addChannels.bind(channelGroupEndpoints),
      removeChannels: channelGroupEndpoints.removeChannels.bind(channelGroupEndpoints),
      deleteGroup: channelGroupEndpoints.deleteGroup.bind(channelGroupEndpoints),
    };

    this.pushNotifications = {
      listChannelsForDevice: pushEndpoints.listChannelsForDevice.bind(pushEndpoints),
      addDeviceToChannels: pushEndpoints.addDeviceToPushChannels.bind(pushEndpoints),
      removeDeviceFromChannels: pushEndpoints.removeDeviceFromPushChannels.bind(pushEndpoints),
      removeDevice: pushEndpoints.removeDevice.bind(pushEndpoints),
    };


    this.presence = {
      whereNow: presenceEndpoints.whereNow.bind(presenceEndpoints),
      getState: presenceEndpoints.getState.bind(presenceEndpoints),
      setState: subscriptionManager.adaptStateChange.bind(subscriptionManager)
    };

    this.accessManager = {
      grant: accessEndpoints.grant.bind(accessEndpoints),
      audit: accessEndpoints.audit.bind(accessEndpoints)
    };

    this.publish = publishEndpoints.publish.bind(publishEndpoints);
    this.history = historyEndpoint.fetch.bind(historyEndpoint);
    this.time = timeEndpoint.fetch.bind(timeEndpoint);

    // subscription related methods
    this.subscribe = subscriptionManager.adaptSubscribeChange.bind(subscriptionManager);
    this.unsubscribe = subscriptionManager.adaptUnsubscribeChange.bind(subscriptionManager);
    this.reconnect = subscriptionManager.reconnect.bind(subscriptionManager);

    this.addListener = subscriptionManager.addListener.bind(subscriptionManager);
    this.removeListener = subscriptionManager.removeListener.bind(subscriptionManager);
    //

    this.setCipherKey = this.config.setCipherKey.bind(this.config);
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
  // let subscribeEndpoints = new SubscribeEndpoints({ networking, callbacks, config });

  let SELF = {

    // subscribe: subscribeEndpoints.subscribe.bind(subscribeEndpoints),
    // unsubscribe: subscribeEndpoints.unsubscribe.bind(subscribeEndpoints),

    presence: {
      hereNow: presenceEndpoints.hereNow.bind(presenceEndpoints),
    },

    getPresenceTimeout: config.getPresenceTimeout.bind(config),
    setPresenceTimeout: config.setPresenceTimeout.bind(config),

    getPresenceAnnounceInterval: config.getPresenceAnnounceInterval.bind(config),
    setPresenceAnnounceInterval: config.setPresenceAnnounceInterval.bind(config),

    setAuthKey: config.setAuthKey.bind(config),

    setUUID: config.setUUID.bind(config),
    getUUID: config.getUUID.bind(config),

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
