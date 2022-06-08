import Config from './components/config';
import Crypto from './components/cryptography/index';
import SubscriptionManager from './components/subscription_manager';
import TelemetryManager from './components/telemetry_manager';
import NotificationsPayload from './components/push_payload';
import ListenerManager from './components/listener_manager';
import TokenManager from './components/token_manager';

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
import { EventEngine } from '../event-engine';

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
  // presence utility methods
  iAmHere;
  iAmAway;
  setPresenceState;

  // subscription utility methods
  handshake;
  receiveMessages;

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

  // User
  createUser;

  updateUser;

  fetchUser;

  removeUser;

  fetchUsers;

  // Space
  createSpace;

  updateSpace;

  fetchSpace;

  removeSpace;

  fetchSpaces;

  // Membership
  addMemberships;

  updateMemberships;

  fetchMemberships;

  removeMemberships;

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

    this.iAmHere = endpointCreator.bind(this, modules, presenceHeartbeatEndpointConfig);
    this.iAmAway = endpointCreator.bind(this, modules, presenceLeaveEndpointConfig);
    this.setPresenceState = endpointCreator.bind(this, modules, presenceSetStateConfig);
    this.handshake = endpointCreator.bind(this, modules, handshakeEndpointConfig);
    this.receiveMessages = endpointCreator.bind(this, modules, receiveMessagesConfig);

    if (config.enableSubscribeBeta === true) {
      const eventEngine = new EventEngine({ handshake: this.handshake, receiveEvents: this.receiveMessages });

      this.subscribe = eventEngine.subscribe.bind(eventEngine);
      this.unsubscribe = eventEngine.unsubscribe.bind(eventEngine);

      this.eventEngine = eventEngine;
    } else {
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

      this.subscribe = subscriptionManager.adaptSubscribeChange.bind(subscriptionManager);
      this.unsubscribe = subscriptionManager.adaptUnsubscribeChange.bind(subscriptionManager);
      this.disconnect = subscriptionManager.disconnect.bind(subscriptionManager);
      this.reconnect = subscriptionManager.reconnect.bind(subscriptionManager);
      this.unsubscribeAll = subscriptionManager.unsubscribeAll.bind(subscriptionManager);
      this.getSubscribedChannels = subscriptionManager.getSubscribedChannels.bind(subscriptionManager);
      this.getSubscribedChannelGroups = subscriptionManager.getSubscribedChannelGroups.bind(subscriptionManager);

      this.setState = subscriptionManager.adaptStateChange.bind(subscriptionManager);
      this.presence = subscriptionManager.adaptPresenceChange.bind(subscriptionManager);

      this.destroy = (isOffline) => {
        subscriptionManager.unsubscribeAll(isOffline);
        subscriptionManager.disconnect();
      };
    }

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
    /* PAM */
    this.grant = endpointCreator.bind(this, modules, grantEndpointConfig);
    this.grantToken = endpointCreator.bind(this, modules, grantTokenEndpointConfig);
    this.audit = endpointCreator.bind(this, modules, auditEndpointConfig);
    this.revokeToken = endpointCreator.bind(this, modules, revokeTokenEndpointConfig);
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

    // User Apis
    this.createUser = (args) =>
      this.objects.setUUIDMetadata({
        uuid: args.userId,
        data: args.data,
        include: args.include,
      });

    this.updateUser = this.createUser;

    this.removeUser = (args) =>
      this.objects.removeUUIDMetadata({
        uuid: args?.userId,
      });

    this.fetchUser = (args) =>
      this.objects.getUUIDMetadata({
        uuid: args?.userId,
        include: args?.include,
      });

    this.fetchUsers = this.objects.getAllUUIDMetadata;

    // Space apis
    this.createSpace = (args) =>
      this.objects.setChannelMetadata({
        channel: args.spaceId,
        data: args.data,
        include: args.include,
      });

    this.updateSpace = this.createSpace;

    this.removeSpace = (args) =>
      this.objects.removeChannelMetadata({
        channel: args.spaceId,
      });

    this.fetchSpace = (args) =>
      this.objects.getChannelMetadata({
        channel: args.spaceId,
        include: args.include,
      });

    this.fetchSpaces = this.objects.getAllChannelMetadata;

    // Membership apis
    this.addMemberships = (parameters) => {
      if (typeof parameters.spaceId === 'string') {
        return this.objects.setChannelMembers({
          channel: parameters.spaceId,
          uuids: parameters.users?.map((user) => {
            if (typeof user === 'string') {
              return user;
            }
            return {
              id: user.userId,
              custom: user.custom,
              status: user.status,
            };
          }),
          limit: 0,
        });
      } else {
        return this.objects.setMemberships({
          uuid: parameters.userId,
          channels: parameters.spaces?.map((space) => {
            if (typeof space === 'string') {
              return space;
            }
            return {
              id: space.spaceId,
              custom: space.custom,
              status: space.status,
            };
          }),
          limit: 0,
        });
      }
    };

    this.updateMemberships = this.addMemberships;

    this.removeMemberships = (parameters) => {
      if (typeof parameters.spaceId === 'string') {
        return this.objects.removeChannelMembers({
          channel: parameters.spaceId,
          uuids: parameters.userIds,
          limit: 0,
        });
      } else {
        return this.objects.removeMemberships({
          uuid: parameters.userId,
          channels: parameters.spaceIds,
          limit: 0,
        });
      }
    };

    this.fetchMemberships = (params) => {
      if (typeof params.spaceId === 'string') {
        return this.objects
          .getChannelMembers({
            channel: params.spaceId,
            filter: params.filter,
            limit: params.limit,
            page: params.page,
            include: {
              customFields: params.include.customFields,
              UUIDFields: params.include.userFields,
              customUUIDFields: params.include.customUserFields,
              totalCount: params.include.totalCount,
            },
            sort:
              params.sort != null
                ? Object.fromEntries(Object.entries(params.sort).map(([k, v]) => [k.replace('user', 'uuid'), v]))
                : null,
          })
          .then((res) => {
            res.data = res.data?.map((m) => {
              return {
                user: m.uuid,
                custom: m.custom,
                updated: m.updated,
                eTag: m.eTag,
              };
            });
            return res;
          });
      } else {
        return this.objects
          .getMemberships({
            uuid: params.userId,
            filter: params.filter,
            limit: params.limit,
            page: params.page,
            include: {
              customFields: params.include.customFields,
              channelFields: params.include.spaceFields,
              customChannelFields: params.include.customSpaceFields,
              totalCount: params.include.totalCount,
            },
            sort:
              params.sort != null
                ? Object.fromEntries(Object.entries(params.sort).map(([k, v]) => [k.replace('space', 'channel'), v]))
                : null,
          })
          .then((res) => {
            res.data = res.data?.map((m) => {
              return {
                space: m.channel,
                custom: m.custom,
                updated: m.updated,
                eTag: m.eTag,
              };
            });
            return res;
          });
      }
    };

    this.time = timeEndpoint;

    // --- deprecated  ------------------
    this.stop = this.destroy; // --------
    // --- deprecated  ------------------

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
