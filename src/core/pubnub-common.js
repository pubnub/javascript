/* @flow */

import Networking from './components/networking';
import Config from './components/config';
import Crypto from './components/cryptography/index';
import SubscriptionManager from './components/subscription_manager';
import ListenerManager from './components/listener_manager';

import endpointCreator from './components/endpoint';

import * as addChannelsChannelGroupConfig from './endpoints/channel_groups/add_channels';
import * as removeChannelsChannelGroupConfig from './endpoints/channel_groups/remove_channels';
import * as deleteChannelGroupConfig from './endpoints/channel_groups/delete_group';
import * as listChannelGroupsConfig from './endpoints/channel_groups/list_groups';
import * as listChannelsInChannelGroupConfig from './endpoints/channel_groups/list_channels';

import * as addPushChannelsConfig from './endpoints/push/add_push_channels';
import * as removePushChannelsConfig from './endpoints/push/remove_push_channels';
import * as listPushChannelsConfig from './endpoints/push/list_push_channels';
import * as removeDevicePushConfig from './endpoints/push/remove_device';

import * as publishEndpointConfig from './endpoints/publish';
import * as historyEndpointConfig from './endpoints/history';
import * as timeEndpointConfig from './endpoints/time';

import packageJSON from '../../package.json';

import PresenceEndpoints from './endpoints/presence';
import AccessEndpoints from './endpoints/access';
import SubscribeEndpoints from './endpoints/subscribe';

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

  getFilterExpression: Function;
  setFilterExpression: Function;

  //

  constructor(setup: InternalSetupStruct) {
    let { sendBeacon, db } = setup;

    const config = new Config({ setup, db });
    const crypto = new Crypto({ config });
    const networking = new Networking({ config, crypto, sendBeacon });

    let modules = { config, networking, crypto };

    // old
    const subscribeEndpoints = new SubscribeEndpoints({ networking: modules.networking, config: modules.config });
    const presenceEndpoints = new PresenceEndpoints({ networking: modules.networking, config: modules.config });
    const accessEndpoints = new AccessEndpoints({ config: modules.config, networking: modules.networking, crypto: modules.crypto });
    //

    const listenerManager = new ListenerManager();

    // new
    const timeEndpoint = endpointCreator.bind(this, modules, timeEndpointConfig);

    //

    const subscriptionManager = new SubscriptionManager({ config: modules.config, listenerManager, subscribeEndpoints, presenceEndpoints, timeEndpoints: timeEndpoint });

    this.addListener = listenerManager.addListener.bind(listenerManager);
    this.removeListener = listenerManager.removeListener.bind(listenerManager);

    /** channel groups **/
    this.channelGroups = {
      listGroups: endpointCreator.bind(this, modules, listChannelGroupsConfig),
      listChannels: endpointCreator.bind(this, modules, listChannelsInChannelGroupConfig),
      addChannels: endpointCreator.bind(this, modules, addChannelsChannelGroupConfig),
      removeChannels: endpointCreator.bind(this, modules, removeChannelsChannelGroupConfig),
      deleteGroup: endpointCreator.bind(this, modules, deleteChannelGroupConfig)
    };
    /** push **/
    this.push = {
      addChannels: endpointCreator.bind(this, modules, addPushChannelsConfig),
      removeChannels: endpointCreator.bind(this, modules, removePushChannelsConfig),
      deleteDevice: endpointCreator.bind(this, modules, removeDevicePushConfig),
      listChannels: endpointCreator.bind(this, modules, listPushChannelsConfig)
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
    this.publish = endpointCreator.bind(this, modules, publishEndpointConfig);

    this.fire = (args, callback) => {
      args.replicate = false;
      args.storeInHistory = false;
      this.publish(args, callback);
    };

    this.history = endpointCreator.bind(this, modules, historyEndpointConfig);

    this.time = timeEndpoint;


    // subscription related methods
    this.subscribe = subscriptionManager.adaptSubscribeChange.bind(subscriptionManager);
    this.unsubscribe = subscriptionManager.adaptUnsubscribeChange.bind(subscriptionManager);
    this.reconnect = subscriptionManager.reconnect.bind(subscriptionManager);
    this.stop = subscriptionManager.disconnect.bind(subscriptionManager);

    /** config **/
    this.getAuthKey = modules.config.getAuthKey.bind(modules.config);
    this.setAuthKey = modules.config.setAuthKey.bind(modules.config);
    this.setCipherKey = modules.config.setCipherKey.bind(modules.config);
    this.getUUID = modules.config.getUUID.bind(modules.config);
    this.setUUID = modules.config.setUUID.bind(modules.config);
    this.getFilterExpression = modules.config.getFilterExpression.bind(modules.config);
    this.setFilterExpression = modules.config.setFilterExpression.bind(modules.config);
  }


  getVersion(): String { return packageJSON.version; }

}
