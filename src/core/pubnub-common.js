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

    this._config = new Config(setup);
    this._crypto = new Crypto({ config: this._config });
    this._networking = new Networking({ config: this._config, crypto: this._crypto, sendBeacon });

    const subscribeEndpoints = new SubscribeEndpoints({ networking: this._networking, config: this._config });
    const presenceEndpoints = new PresenceEndpoints({ networking: this._networking, config: this._config });
    const timeEndpoint = new TimeEndpoint({ networking: this._networking, config: this._config });
    const pushEndpoints = new PushEndpoint({ networking: this._networking, config: this._config });
    const channelGroupEndpoints = new ChannelGroupEndpoints({ networking: this._networking, config: this._config });
    const publishEndpoints = new PublishEndpoints({ networking: this._networking, config: this._config, crypto: this._crypto });
    const historyEndpoint = new HistoryEndpoint({ networking: this._networking, config: this._config, crypto: this._crypto });
    const accessEndpoints = new AccessEndpoints({ config: this._config, networking: this._networking, crypto: this._crypto });

    const subscriptionManager = new SubscriptionManager({ subscribeEndpoints, config: this._config, presenceEndpoints });

    // write the new key to storage
    db.set(this._config.subscribeKey + 'uuid', this._config.UUID);

    // mount up the endpoints
    /** channel groups **/
    this.listAllChannelGroups = channelGroupEndpoints.listGroups.bind(channelGroupEndpoints);
    this.listChannelsForChannelGroup = channelGroupEndpoints.listChannels.bind(channelGroupEndpoints);
    this.addChannelsToChannelGroup = channelGroupEndpoints.addChannels.bind(channelGroupEndpoints);
    this.removeChannelsFromChannelGroup = channelGroupEndpoints.removeChannels.bind(channelGroupEndpoints);
    this.deleteChannelGroup = channelGroupEndpoints.deleteGroup.bind(channelGroupEndpoints);
    /** push **/
    this.addPushNotificationsOnChannels = pushEndpoints.addDeviceToPushChannels.bind(pushEndpoints);
    this.removePushNotificationsFromChannels = pushEndpoints.removeDeviceFromPushChannels.bind(pushEndpoints);
    this.removeAllPushNotificationsFromDeviceWithPushToken = pushEndpoints.removeDevice.bind(pushEndpoints);
    this.auditPushChannelProvisions = pushEndpoints.listChannelsForDevice.bind(pushEndpoints);
    /** presence **/
    this.hereNow = presenceEndpoints.hereNow.bind(presenceEndpoints);
    this.whereNow = presenceEndpoints.whereNow.bind(presenceEndpoints);
    this.getState = presenceEndpoints.getState.bind(presenceEndpoints);
    this.setState = subscriptionManager.adaptStateChange.bind(subscriptionManager);
    /** PAM **/
    this.grant = accessEndpoints.grant.bind(accessEndpoints);
    this.audit = accessEndpoints.audit.bind(accessEndpoints);

    this.publish = publishEndpoints.publish.bind(publishEndpoints);
    this.history = historyEndpoint.fetch.bind(historyEndpoint);
    this.time = timeEndpoint.fetch.bind(timeEndpoint);

    // subscription related methods
    this.subscribe = subscriptionManager.adaptSubscribeChange.bind(subscriptionManager);
    this.unsubscribe = subscriptionManager.adaptUnsubscribeChange.bind(subscriptionManager);
    this.reconnect = subscriptionManager.reconnect.bind(subscriptionManager);

    this.stop = subscriptionManager.disconnect.bind(this.subscriptionManager);
    this.reconnect = subscriptionManager.reconnect.bind(this.SubscriptionManager);

    this.addListener = subscriptionManager.addListener.bind(subscriptionManager);
    this.removeListener = subscriptionManager.removeListener.bind(subscriptionManager);
    /** config **/
    this.setCipherKey = this._config.setCipherKey.bind(this._config);
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
