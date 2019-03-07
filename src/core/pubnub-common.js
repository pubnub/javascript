/* @flow */

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

import * as presenceLeaveEndpointConfig from './endpoints/presence/leave';
import * as presenceWhereNowEndpointConfig from './endpoints/presence/where_now';
import * as presenceHeartbeatEndpointConfig from './endpoints/presence/heartbeat';
import * as presenceGetStateConfig from './endpoints/presence/get_state';
import * as presenceSetStateConfig from './endpoints/presence/set_state';
import * as presenceHereNowConfig from './endpoints/presence/here_now';

import * as auditEndpointConfig from './endpoints/access_manager/audit';
import * as grantEndpointConfig from './endpoints/access_manager/grant';

import * as publishEndpointConfig from './endpoints/publish';
import * as historyEndpointConfig from './endpoints/history/get_history';
import * as deleteMessagesEndpointConfig from './endpoints/history/delete_messages';
import * as messageCountsEndpointConfig from './endpoints/history/message_counts';
import * as fetchMessagesEndpointConfig from './endpoints/fetch_messages';
import * as timeEndpointConfig from './endpoints/time';
import * as subscribeEndpointConfig from './endpoints/subscribe';

import OPERATIONS from './constants/operations';
import CATEGORIES from './constants/categories';

import { InternalSetupStruct } from './flow_interfaces';
import uuidGenerator from './components/uuid';

export default class {

  _config: Config;
  _listenerManager: ListenerManager;

  // tell flow about the mounted endpoint
  time: Function;
  publish: Function;
  fire: Function;

  history: Function;
  deleteMessages: Function;
  messageCounts: Function;
  fetchMessages: Function;

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
  presence: Function;
  unsubscribe: Function;
  unsubscribeAll: Function;

  disconnect: Function;
  reconnect: Function;


  destroy: Function;
  stop: Function;

  getSubscribedChannels: Function;
  getSubscribedChannelGroups: Function;

  addListener: Function;
  removeListener: Function;
  removeAllListeners: Function;

  getAuthKey: Function;
  setAuthKey: Function;

  setCipherKey: Function;
  setUUID: Function;
  getUUID: Function;

  getFilterExpression: Function;
  setFilterExpression: Function;

  setHeartbeatInterval: Function;

  setProxy: Function;

  encrypt: Function;
  decrypt: Function;

  //

  constructor(setup: InternalSetupStruct) {
    let { db, networking } = setup;

    const config = this._config = new Config({ setup, db });
    const crypto = new Crypto({ config });

    networking.init(config);

    let modules = { config, networking, crypto };

    const timeEndpoint = endpointCreator.bind(this, modules, timeEndpointConfig);
    const leaveEndpoint = endpointCreator.bind(this, modules, presenceLeaveEndpointConfig);
    const heartbeatEndpoint = endpointCreator.bind(this, modules, presenceHeartbeatEndpointConfig);
    const setStateEndpoint = endpointCreator.bind(this, modules, presenceSetStateConfig);
    const subscribeEndpoint = endpointCreator.bind(this, modules, subscribeEndpointConfig);

    // managers
    const listenerManager = this._listenerManager = new ListenerManager();

    const subscriptionManager = new SubscriptionManager({
      timeEndpoint,
      leaveEndpoint,
      heartbeatEndpoint,
      setStateEndpoint,
      subscribeEndpoint,
      crypto: modules.crypto,
      config: modules.config,
      listenerManager
    });

    this.addListener = listenerManager.addListener.bind(listenerManager);
    this.removeListener = listenerManager.removeListener.bind(listenerManager);
    this.removeAllListeners = listenerManager.removeAllListeners.bind(listenerManager);

    /* channel groups */
    this.channelGroups = {
      listGroups: endpointCreator.bind(this, modules, listChannelGroupsConfig),
      listChannels: endpointCreator.bind(this, modules, listChannelsInChannelGroupConfig),
      addChannels: endpointCreator.bind(this, modules, addChannelsChannelGroupConfig),
      removeChannels: endpointCreator.bind(this, modules, removeChannelsChannelGroupConfig),
      deleteGroup: endpointCreator.bind(this, modules, deleteChannelGroupConfig)
    };
    /* push */
    this.push = {
      addChannels: endpointCreator.bind(this, modules, addPushChannelsConfig),
      removeChannels: endpointCreator.bind(this, modules, removePushChannelsConfig),
      deleteDevice: endpointCreator.bind(this, modules, removeDevicePushConfig),
      listChannels: endpointCreator.bind(this, modules, listPushChannelsConfig)
    };
    /* presence */
    this.hereNow = endpointCreator.bind(this, modules, presenceHereNowConfig);
    this.whereNow = endpointCreator.bind(this, modules, presenceWhereNowEndpointConfig);
    this.getState = endpointCreator.bind(this, modules, presenceGetStateConfig);
    this.setState = subscriptionManager.adaptStateChange.bind(subscriptionManager);
    /* PAM */
    this.grant = endpointCreator.bind(this, modules, grantEndpointConfig);
    this.audit = endpointCreator.bind(this, modules, auditEndpointConfig);
    //
    this.publish = endpointCreator.bind(this, modules, publishEndpointConfig);

    this.fire = (args, callback) => {
      args.replicate = false;
      args.storeInHistory = false;
      return this.publish(args, callback);
    };

    this.history = endpointCreator.bind(this, modules, historyEndpointConfig);
    this.deleteMessages = endpointCreator.bind(this, modules, deleteMessagesEndpointConfig);
    this.messageCounts = endpointCreator.bind(this, modules, messageCountsEndpointConfig);
    this.fetchMessages = endpointCreator.bind(this, modules, fetchMessagesEndpointConfig);

    this.time = timeEndpoint;

    // subscription related methods
    this.subscribe = subscriptionManager.adaptSubscribeChange.bind(subscriptionManager);
    this.presence = subscriptionManager.adaptPresenceChange.bind(subscriptionManager);
    this.unsubscribe = subscriptionManager.adaptUnsubscribeChange.bind(subscriptionManager);
    this.disconnect = subscriptionManager.disconnect.bind(subscriptionManager);
    this.reconnect = subscriptionManager.reconnect.bind(subscriptionManager);

    this.destroy = (isOffline: boolean) => {
      subscriptionManager.unsubscribeAll(isOffline);
      subscriptionManager.disconnect();
    };

    // --- deprecated  ------------------
    this.stop = this.destroy; // --------
    // --- deprecated  ------------------

    this.unsubscribeAll = subscriptionManager.unsubscribeAll.bind(subscriptionManager);

    this.getSubscribedChannels = subscriptionManager.getSubscribedChannels.bind(subscriptionManager);
    this.getSubscribedChannelGroups = subscriptionManager.getSubscribedChannelGroups.bind(subscriptionManager);

    // mount crypto
    this.encrypt = crypto.encrypt.bind(crypto);
    this.decrypt = crypto.decrypt.bind(crypto);

    /* config */
    this.getAuthKey = modules.config.getAuthKey.bind(modules.config);
    this.setAuthKey = modules.config.setAuthKey.bind(modules.config);
    this.setCipherKey = modules.config.setCipherKey.bind(modules.config);
    this.getUUID = modules.config.getUUID.bind(modules.config);
    this.setUUID = modules.config.setUUID.bind(modules.config);
    this.getFilterExpression = modules.config.getFilterExpression.bind(modules.config);
    this.setFilterExpression = modules.config.setFilterExpression.bind(modules.config);

    this.setHeartbeatInterval = modules.config.setHeartbeatInterval.bind(modules.config);

    if (networking.hasModule('proxy')) {
      this.setProxy = (proxy) => {
        modules.config.setProxy(proxy);
        this.reconnect();
      };
    }
  }


  getVersion(): string {
    return this._config.getVersion();
  }

  // network hooks to indicate network changes
  networkDownDetected() {
    this._listenerManager.announceNetworkDown();

    if (this._config.restore) {
      this.disconnect();
    } else {
      this.destroy(true);
    }
  }

  networkUpDetected() {
    this._listenerManager.announceNetworkUp();
    this.reconnect();
  }


  static generateUUID(): string {
    return uuidGenerator.createUUID();
  }

  static OPERATIONS = OPERATIONS;
  static CATEGORIES = CATEGORIES;

}
