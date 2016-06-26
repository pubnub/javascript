/* @flow */

import Networking from './components/networking';
import Config from './components/config';
import Crypto from './components/cryptography/index';
import SubscriptionManager from './components/subscription_manager';

import packageJSON from '../../package.json';

import TimeEndpoint from './endpoints/time';
import PresenceEndpoints from './endpoints/presence';
import HistoryEndpoint from './endpoints/history';
import PushEndpoint from './endpoints/push';
import AccessEndpoints from './endpoints/access';
import ChannelGroupEndpoints from './endpoints/channel_groups';
import SubscribeEndpoints from './endpoints/subscribe';
import PublishEndpoints from './endpoints/publish';

import { InternalSetupStruct } from './flow_interfaces';

export default class {

  _config: Config;
  _crypto: Crypto;
  _networking: Networking;

  // tell flow about the mounted endpoint
  time: Function;
  publish: Function;
  fire: Function;
  history: Function;
  //
  channelGroups: Object;
  //
  push: Object;
  //
  hereNow: Function;
  whereNow: Function;
  getState: Function;
  setState: Function;
  //
  grant: Function;
  audit: Function;
  //
  subscribe: Function;
  unsubscribe: Function;
  reconnect: Function;
  stop: Function;

  addListener: Function;
  removeListener: Function;

  getAuthKey: Function;
  setAuthKey: Function;

  setCipherKey: Function;
  setUUID: Function;
  getUUID: Function;

  //

  constructor(setup: InternalSetupStruct) {
    let { sendBeacon, db } = setup;

    this._config = new Config({ setup, db });
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

    this.addListener = subscriptionManager.addListener.bind(subscriptionManager);
    this.removeListener = subscriptionManager.removeListener.bind(subscriptionManager);

    /** channel groups **/
    this.channelGroups = {
      listGroups: channelGroupEndpoints.listGroups.bind(channelGroupEndpoints),
      listChannels: channelGroupEndpoints.listChannels.bind(channelGroupEndpoints),
      addChannels: channelGroupEndpoints.addChannels.bind(channelGroupEndpoints),
      removeChannels: channelGroupEndpoints.removeChannels.bind(channelGroupEndpoints),
      deleteGroup: channelGroupEndpoints.deleteGroup.bind(channelGroupEndpoints)
    };
    /** push **/
    this.push = {
      addChannels: pushEndpoints.addDeviceToPushChannels.bind(pushEndpoints),
      removeChannels: pushEndpoints.removeDeviceFromPushChannels.bind(pushEndpoints),
      deleteDevice: pushEndpoints.removeDevice.bind(pushEndpoints),
      listChannels: pushEndpoints.listChannelsForDevice.bind(pushEndpoints)
    };
    /** presence **/
    this.hereNow = presenceEndpoints.hereNow.bind(presenceEndpoints);
    this.whereNow = presenceEndpoints.whereNow.bind(presenceEndpoints);
    this.getState = presenceEndpoints.getState.bind(presenceEndpoints);
    this.setState = subscriptionManager.adaptStateChange.bind(subscriptionManager);
    /** PAM **/
    this.grant = accessEndpoints.grant.bind(accessEndpoints);
    this.audit = accessEndpoints.audit.bind(accessEndpoints);
    //
    this.publish = publishEndpoints.publish.bind(publishEndpoints);
    this.fire = publishEndpoints.fire.bind(publishEndpoints);
    this.history = historyEndpoint.fetch.bind(historyEndpoint);
    this.time = timeEndpoint.fetch.bind(timeEndpoint);
    // subscription related methods
    this.subscribe = subscriptionManager.adaptSubscribeChange.bind(subscriptionManager);
    this.unsubscribe = subscriptionManager.adaptUnsubscribeChange.bind(subscriptionManager);
    this.reconnect = subscriptionManager.reconnect.bind(subscriptionManager);
    this.stop = subscriptionManager.disconnect.bind(subscriptionManager);
    this.reconnect = subscriptionManager.reconnect.bind(SubscriptionManager);
    /** config **/
    this.getAuthKey = this._config.getAuthKey.bind(this._config);
    this.setAuthKey = this._config.setAuthKey.bind(this._config);

    this.setCipherKey = this._config.setCipherKey.bind(this._config);
    this.getUUID = this._config.getUUID.bind(this._config);
    this.setUUID = this._config.setUUID.bind(this._config);
  }


  getVersion(): String { return packageJSON.version; }

}
