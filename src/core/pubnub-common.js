import Config from './components/config';
import Crypto from './components/cryptography/index';
import SubscriptionManager from './components/subscription_manager';
import TelemetryManager from './components/telemetry_manager';
import NotificationsPayload from './components/push_payload';
import ListenerManager from './components/listener_manager';
import TokenManager from './components/token_manager';

import endpointCreator from './components/endpoint';

import { deprecated } from './utils';

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

// Actions API

import * as addMessageActionEndpointConfig from './endpoints/actions/add_message_action';
import * as removeMessageActionEndpointConfig from './endpoints/actions/remove_message_action';
import * as getMessageActionEndpointConfig from './endpoints/actions/get_message_actions';

// File Upload API v1

import listFilesEndpointConfig from './endpoints/file_upload/list_files';
import generateUploadUrlEndpointConfig from './endpoints/file_upload/generate_upload_url';
import publishFileEndpointConfig from './endpoints/file_upload/publish_file';
import sendFileFunction from './endpoints/file_upload/send_file';
import getFileUrlFunction from './endpoints/file_upload/get_file_url';
import downloadFileEndpointConfig from './endpoints/file_upload/download_file';
import deleteFileEndpointConfig from './endpoints/file_upload/delete_file';

// Object API v2
import getAllUUIDMetadataEndpointConfig from './endpoints/objects/uuid/get_all';

import getUUIDMetadataEndpointConfig from './endpoints/objects/uuid/get';

import setUUIDMetadataEndpointConfig from './endpoints/objects/uuid/set';

import removeUUIDMetadataEndpointConfig from './endpoints/objects/uuid/remove';

import getAllChannelMetadataEndpointConfig from './endpoints/objects/channel/get_all';

import getChannelMetadataEndpointConfig from './endpoints/objects/channel/get';

import setChannelMetadataEndpointConfig from './endpoints/objects/channel/set';

import removeChannelMetadataEndpointConfig from './endpoints/objects/channel/remove';

import getMembersV2EndpointConfig from './endpoints/objects/member/get';

import setMembersV2EndpointConfig from './endpoints/objects/member/set';

import getMembershipsV2EndpointConfig from './endpoints/objects/membership/get';

import setMembershipsV2EndpointConfig from './endpoints/objects/membership/set';

// Objects API

import * as createUserEndpointConfig from './endpoints/users/create_user';
import * as updateUserEndpointConfig from './endpoints/users/update_user';
import * as deleteUserEndpointConfig from './endpoints/users/delete_user';
import * as getUserEndpointConfig from './endpoints/users/get_user';
import * as getUsersEndpointConfig from './endpoints/users/get_users';
import * as createSpaceEndpointConfig from './endpoints/spaces/create_space';
import * as updateSpaceEndpointConfig from './endpoints/spaces/update_space';
import * as deleteSpaceEndpointConfig from './endpoints/spaces/delete_space';
import * as getSpacesEndpointConfig from './endpoints/spaces/get_spaces';
import * as getSpaceEndpointConfig from './endpoints/spaces/get_space';
import * as getMembersEndpointConfig from './endpoints/memberships/get_members';
import * as addMembersEndpointConfig from './endpoints/memberships/add_members';
import * as updateMembersEndpointConfig from './endpoints/memberships/update_members';
import * as removeMembersEndpointConfig from './endpoints/memberships/remove_members';
import * as getMembershipsEndpointConfig from './endpoints/memberships/get_memberships';
import * as updateMembershipsEndpointConfig from './endpoints/memberships/update_memberships';
import * as joinSpacesEndpointConfig from './endpoints/memberships/join_spaces';
import * as leaveSpacesEndpointConfig from './endpoints/memberships/leave_spaces';

import * as auditEndpointConfig from './endpoints/access_manager/audit';
import * as grantEndpointConfig from './endpoints/access_manager/grant';
import * as grantTokenEndpointConfig from './endpoints/access_manager/grant_token';
import revokeTokenEndpointConfig from './endpoints/access_manager/revoke_token';

import * as publishEndpointConfig from './endpoints/publish';
import * as signalEndpointConfig from './endpoints/signal';
import * as historyEndpointConfig from './endpoints/history/get_history';
import * as deleteMessagesEndpointConfig from './endpoints/history/delete_messages';
import * as messageCountsEndpointConfig from './endpoints/history/message_counts';
import * as fetchMessagesEndpointConfig from './endpoints/fetch_messages';
import * as timeEndpointConfig from './endpoints/time';
import * as subscribeEndpointConfig from './endpoints/subscribe';

// subscription utilities
import handshakeEndpointConfig from './endpoints/subscriptionUtils/handshake';
import receiveMessagesConfig from './endpoints/subscriptionUtils/receiveMessages';

import OPERATIONS from './constants/operations';
import CATEGORIES from './constants/categories';

import uuidGenerator from './components/uuid';

export default class {
  _config;

  _telemetryManager;

  _listenerManager;

  _tokenManager;

  // tell flow about the mounted endpoint
  time;

  publish;

  fire;

  history;

  deleteMessages;

  messageCounts;

  fetchMessages;

  //
  channelGroups;

  //
  push;

  //
  hereNow;

  whereNow;

  getState;

  setState;

  //
  grant;

  grantToken;

  audit;

  revokeToken;

  //
  subscribe;

  signal;

  presence;

  unsubscribe;

  unsubscribeAll;

  // Actions API
  addMessageAction;

  removeMessageAction;

  getMessageActions;

  // File Upload API v1

  File;

  encryptFile;

  decryptFile;

  listFiles;

  sendFile;

  downloadFile;

  getFileUrl;

  deleteFile;

  publishFile;

  // Objects API v2

  objects;

  // Objects API

  createUser;

  updateUser;

  deleteUser;

  getUser;

  getUsers;

  createSpace;

  updateSpace;

  deleteSpace;

  getSpaces;

  getSpace;

  getMembers;

  addMembers;

  updateMembers;

  removeMembers;

  getMemberships;

  joinSpaces;

  updateMemberships;

  leaveSpaces;

  disconnect;

  reconnect;

  destroy;

  stop;

  getSubscribedChannels;

  getSubscribedChannelGroups;

  addListener;

  removeListener;

  removeAllListeners;

  parseToken;

  setToken;

  getToken;

  getAuthKey;

  setAuthKey;

  setCipherKey;

  setUUID;

  getUUID;

  getFilterExpression;

  setFilterExpression;

  setHeartbeatInterval;

  setProxy;

  encrypt;

  decrypt;

  //

  constructor(setup) {
    const { networking, cbor } = setup;

    const config = new Config({ setup });
    this._config = config;
    const crypto = new Crypto({ config }); // LEGACY

    const { cryptography } = setup;

    networking.init(config);

    const tokenManager = new TokenManager(config, cbor);
    this._tokenManager = tokenManager;

    const telemetryManager = new TelemetryManager({
      maximumSamplesCount: 60000,
    });

    this._telemetryManager = telemetryManager;

    const modules = {
      config,
      networking,
      crypto,
      cryptography,
      tokenManager,
      telemetryManager,
      PubNubFile: setup.PubNubFile,
    };

    this.File = setup.PubNubFile;

    this.encryptFile = (key, file) => cryptography.encryptFile(key, file, this.File);
    this.decryptFile = (key, file) => cryptography.decryptFile(key, file, this.File);

    const timeEndpoint = endpointCreator.bind(this, modules, timeEndpointConfig);
    const leaveEndpoint = endpointCreator.bind(this, modules, presenceLeaveEndpointConfig);
    const heartbeatEndpoint = endpointCreator.bind(this, modules, presenceHeartbeatEndpointConfig);
    const setStateEndpoint = endpointCreator.bind(this, modules, presenceSetStateConfig);
    const subscribeEndpoint = endpointCreator.bind(this, modules, subscribeEndpointConfig);

    // managers
    const listenerManager = new ListenerManager();
    this._listenerManager = listenerManager;

    const subscriptionManager = new SubscriptionManager({
      timeEndpoint,
      leaveEndpoint,
      heartbeatEndpoint,
      setStateEndpoint,
      subscribeEndpoint,
      crypto: modules.crypto,
      config: modules.config,
      listenerManager,
      getFileUrl: (params) => getFileUrlFunction(modules, params),
    });

    this.addListener = listenerManager.addListener.bind(listenerManager);
    this.removeListener = listenerManager.removeListener.bind(listenerManager);
    this.removeAllListeners = listenerManager.removeAllListeners.bind(listenerManager);

    this.parseToken = tokenManager.parseToken.bind(tokenManager);
    this.setToken = tokenManager.setToken.bind(tokenManager);
    this.getToken = tokenManager.getToken.bind(tokenManager);

    /* channel groups */
    this.channelGroups = {
      listGroups: endpointCreator.bind(this, modules, listChannelGroupsConfig),
      listChannels: endpointCreator.bind(this, modules, listChannelsInChannelGroupConfig),
      addChannels: endpointCreator.bind(this, modules, addChannelsChannelGroupConfig),
      removeChannels: endpointCreator.bind(this, modules, removeChannelsChannelGroupConfig),
      deleteGroup: endpointCreator.bind(this, modules, deleteChannelGroupConfig),
    };
    /* push */
    this.push = {
      addChannels: endpointCreator.bind(this, modules, addPushChannelsConfig),
      removeChannels: endpointCreator.bind(this, modules, removePushChannelsConfig),
      deleteDevice: endpointCreator.bind(this, modules, removeDevicePushConfig),
      listChannels: endpointCreator.bind(this, modules, listPushChannelsConfig),
    };
    /* presence */
    this.hereNow = endpointCreator.bind(this, modules, presenceHereNowConfig);
    this.whereNow = endpointCreator.bind(this, modules, presenceWhereNowEndpointConfig);
    this.getState = endpointCreator.bind(this, modules, presenceGetStateConfig);
    this.setState = subscriptionManager.adaptStateChange.bind(subscriptionManager);

    /* presence utilities */
    this.iAmHere = endpointCreator.bind(this, modules, presenceHeartbeatEndpointConfig);
    this.iAmAway = endpointCreator.bind(this, modules, presenceLeaveEndpointConfig);
    this.setPresenceState = endpointCreator.bind(this, modules, presenceSetStateConfig);

    /* PAM */
    this.grant = endpointCreator.bind(this, modules, grantEndpointConfig);
    this.grantToken = endpointCreator.bind(this, modules, grantTokenEndpointConfig);
    this.audit = endpointCreator.bind(this, modules, auditEndpointConfig);
    this.revokeToken = endpointCreator.bind(this, modules, revokeTokenEndpointConfig);
    //
    this.publish = endpointCreator.bind(this, modules, publishEndpointConfig);

    this.fire = (args, callback) => {
      args.replicate = false;
      args.storeInHistory = false;
      return this.publish(args, callback);
    };

    this.signal = endpointCreator.bind(this, modules, signalEndpointConfig);

    this.history = endpointCreator.bind(this, modules, historyEndpointConfig);
    this.deleteMessages = endpointCreator.bind(this, modules, deleteMessagesEndpointConfig);
    this.messageCounts = endpointCreator.bind(this, modules, messageCountsEndpointConfig);
    this.fetchMessages = endpointCreator.bind(this, modules, fetchMessagesEndpointConfig);

    // Actions API

    this.addMessageAction = endpointCreator.bind(this, modules, addMessageActionEndpointConfig);

    this.removeMessageAction = endpointCreator.bind(this, modules, removeMessageActionEndpointConfig);

    this.getMessageActions = endpointCreator.bind(this, modules, getMessageActionEndpointConfig);

    // File Upload API v1

    this.listFiles = endpointCreator.bind(this, modules, listFilesEndpointConfig);

    const generateUploadUrl = endpointCreator.bind(this, modules, generateUploadUrlEndpointConfig);
    this.publishFile = endpointCreator.bind(this, modules, publishFileEndpointConfig);

    this.sendFile = sendFileFunction({
      generateUploadUrl,
      publishFile: this.publishFile,
      modules,
    });

    this.getFileUrl = (params) => getFileUrlFunction(modules, params);

    this.downloadFile = endpointCreator.bind(this, modules, downloadFileEndpointConfig);

    this.deleteFile = endpointCreator.bind(this, modules, deleteFileEndpointConfig);

    this.handshake = endpointCreator.bind(this, modules, handshakeEndpointConfig);

    this.receiveMessages = endpointCreator.bind(this, modules, receiveMessagesConfig);

    // Objects API v2

    this.objects = {
      getAllUUIDMetadata: endpointCreator.bind(this, modules, getAllUUIDMetadataEndpointConfig),
      getUUIDMetadata: endpointCreator.bind(this, modules, getUUIDMetadataEndpointConfig),
      setUUIDMetadata: endpointCreator.bind(this, modules, setUUIDMetadataEndpointConfig),
      removeUUIDMetadata: endpointCreator.bind(this, modules, removeUUIDMetadataEndpointConfig),

      getAllChannelMetadata: endpointCreator.bind(this, modules, getAllChannelMetadataEndpointConfig),
      getChannelMetadata: endpointCreator.bind(this, modules, getChannelMetadataEndpointConfig),
      setChannelMetadata: endpointCreator.bind(this, modules, setChannelMetadataEndpointConfig),
      removeChannelMetadata: endpointCreator.bind(this, modules, removeChannelMetadataEndpointConfig),

      getChannelMembers: endpointCreator.bind(this, modules, getMembersV2EndpointConfig),
      setChannelMembers: (parameters, ...rest) =>
        endpointCreator.call(
          this,
          modules,
          setMembersV2EndpointConfig,
          {
            type: 'set',
            ...parameters,
          },
          ...rest,
        ),
      removeChannelMembers: (parameters, ...rest) =>
        endpointCreator.call(
          this,
          modules,
          setMembersV2EndpointConfig,
          {
            type: 'delete',
            ...parameters,
          },
          ...rest,
        ),

      getMemberships: endpointCreator.bind(this, modules, getMembershipsV2EndpointConfig),
      setMemberships: (parameters, ...rest) =>
        endpointCreator.call(
          this,
          modules,
          setMembershipsV2EndpointConfig,
          {
            type: 'set',
            ...parameters,
          },
          ...rest,
        ),
      removeMemberships: (parameters, ...rest) =>
        endpointCreator.call(
          this,
          modules,
          setMembershipsV2EndpointConfig,
          {
            type: 'delete',
            ...parameters,
          },
          ...rest,
        ),
    };

    // Objects API

    this.createUser = deprecated(endpointCreator.bind(this, modules, createUserEndpointConfig));

    this.updateUser = deprecated(endpointCreator.bind(this, modules, updateUserEndpointConfig));

    this.deleteUser = deprecated(endpointCreator.bind(this, modules, deleteUserEndpointConfig));

    this.getUser = deprecated(endpointCreator.bind(this, modules, getUserEndpointConfig));

    this.getUsers = deprecated(endpointCreator.bind(this, modules, getUsersEndpointConfig));

    this.createSpace = deprecated(endpointCreator.bind(this, modules, createSpaceEndpointConfig));

    this.updateSpace = deprecated(endpointCreator.bind(this, modules, updateSpaceEndpointConfig));

    this.deleteSpace = deprecated(endpointCreator.bind(this, modules, deleteSpaceEndpointConfig));

    this.getSpaces = deprecated(endpointCreator.bind(this, modules, getSpacesEndpointConfig));

    this.getSpace = deprecated(endpointCreator.bind(this, modules, getSpaceEndpointConfig));

    this.addMembers = deprecated(endpointCreator.bind(this, modules, addMembersEndpointConfig));

    this.updateMembers = deprecated(endpointCreator.bind(this, modules, updateMembersEndpointConfig));

    this.removeMembers = deprecated(endpointCreator.bind(this, modules, removeMembersEndpointConfig));

    this.getMembers = deprecated(endpointCreator.bind(this, modules, getMembersEndpointConfig));

    this.getMemberships = deprecated(endpointCreator.bind(this, modules, getMembershipsEndpointConfig));

    this.joinSpaces = deprecated(endpointCreator.bind(this, modules, joinSpacesEndpointConfig));

    this.updateMemberships = deprecated(endpointCreator.bind(this, modules, updateMembershipsEndpointConfig));

    this.leaveSpaces = deprecated(endpointCreator.bind(this, modules, leaveSpacesEndpointConfig));

    this.time = timeEndpoint;

    // subscription related methods
    this.subscribe = subscriptionManager.adaptSubscribeChange.bind(subscriptionManager);
    this.presence = subscriptionManager.adaptPresenceChange.bind(subscriptionManager);
    this.unsubscribe = subscriptionManager.adaptUnsubscribeChange.bind(subscriptionManager);
    this.disconnect = subscriptionManager.disconnect.bind(subscriptionManager);
    this.reconnect = subscriptionManager.reconnect.bind(subscriptionManager);

    this.destroy = (isOffline) => {
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

  getVersion() {
    return this._config.getVersion();
  }

  _addPnsdkSuffix(name, suffix) {
    this._config._addPnsdkSuffix(name, suffix);
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

  static notificationPayload(title, body) {
    return new NotificationsPayload(title, body);
  }

  static generateUUID() {
    return uuidGenerator.createUUID();
  }

  static OPERATIONS = OPERATIONS;

  static CATEGORIES = CATEGORIES;
}
