'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _config = require('./components/config');

var _config2 = _interopRequireDefault(_config);

var _index = require('./components/cryptography/index');

var _index2 = _interopRequireDefault(_index);

var _subscription_manager = require('./components/subscription_manager');

var _subscription_manager2 = _interopRequireDefault(_subscription_manager);

var _listener_manager = require('./components/listener_manager');

var _listener_manager2 = _interopRequireDefault(_listener_manager);

var _endpoint = require('./components/endpoint');

var _endpoint2 = _interopRequireDefault(_endpoint);

var _add_channels = require('./endpoints/channel_groups/add_channels');

var addChannelsChannelGroupConfig = _interopRequireWildcard(_add_channels);

var _remove_channels = require('./endpoints/channel_groups/remove_channels');

var removeChannelsChannelGroupConfig = _interopRequireWildcard(_remove_channels);

var _delete_group = require('./endpoints/channel_groups/delete_group');

var deleteChannelGroupConfig = _interopRequireWildcard(_delete_group);

var _list_groups = require('./endpoints/channel_groups/list_groups');

var listChannelGroupsConfig = _interopRequireWildcard(_list_groups);

var _list_channels = require('./endpoints/channel_groups/list_channels');

var listChannelsInChannelGroupConfig = _interopRequireWildcard(_list_channels);

var _add_push_channels = require('./endpoints/push/add_push_channels');

var addPushChannelsConfig = _interopRequireWildcard(_add_push_channels);

var _remove_push_channels = require('./endpoints/push/remove_push_channels');

var removePushChannelsConfig = _interopRequireWildcard(_remove_push_channels);

var _list_push_channels = require('./endpoints/push/list_push_channels');

var listPushChannelsConfig = _interopRequireWildcard(_list_push_channels);

var _remove_device = require('./endpoints/push/remove_device');

var removeDevicePushConfig = _interopRequireWildcard(_remove_device);

var _leave = require('./endpoints/presence/leave');

var presenceLeaveEndpointConfig = _interopRequireWildcard(_leave);

var _where_now = require('./endpoints/presence/where_now');

var presenceWhereNowEndpointConfig = _interopRequireWildcard(_where_now);

var _heartbeat = require('./endpoints/presence/heartbeat');

var presenceHeartbeatEndpointConfig = _interopRequireWildcard(_heartbeat);

var _get_state = require('./endpoints/presence/get_state');

var presenceGetStateConfig = _interopRequireWildcard(_get_state);

var _set_state = require('./endpoints/presence/set_state');

var presenceSetStateConfig = _interopRequireWildcard(_set_state);

var _here_now = require('./endpoints/presence/here_now');

var presenceHereNowConfig = _interopRequireWildcard(_here_now);

var _audit = require('./endpoints/access_manager/audit');

var auditEndpointConfig = _interopRequireWildcard(_audit);

var _grant = require('./endpoints/access_manager/grant');

var grantEndpointConfig = _interopRequireWildcard(_grant);

var _publish = require('./endpoints/publish');

var publishEndpointConfig = _interopRequireWildcard(_publish);

var _get_history = require('./endpoints/history/get_history');

var historyEndpointConfig = _interopRequireWildcard(_get_history);

var _delete_messages = require('./endpoints/history/delete_messages');

var deleteMessagesEndpointConfig = _interopRequireWildcard(_delete_messages);

var _fetch_messages = require('./endpoints/fetch_messages');

var fetchMessagesEndpointConfig = _interopRequireWildcard(_fetch_messages);

var _time = require('./endpoints/time');

var timeEndpointConfig = _interopRequireWildcard(_time);

var _subscribe = require('./endpoints/subscribe');

var subscribeEndpointConfig = _interopRequireWildcard(_subscribe);

var _operations = require('./constants/operations');

var _operations2 = _interopRequireDefault(_operations);

var _categories = require('./constants/categories');

var _categories2 = _interopRequireDefault(_categories);

var _flow_interfaces = require('./flow_interfaces');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(setup) {
    var _this = this;

    _classCallCheck(this, _class);

    var db = setup.db,
        networking = setup.networking;


    var config = this._config = new _config2.default({ setup: setup, db: db });
    var crypto = new _index2.default({ config: config });

    networking.init(config);

    var modules = { config: config, networking: networking, crypto: crypto };

    var timeEndpoint = _endpoint2.default.bind(this, modules, timeEndpointConfig);
    var leaveEndpoint = _endpoint2.default.bind(this, modules, presenceLeaveEndpointConfig);
    var heartbeatEndpoint = _endpoint2.default.bind(this, modules, presenceHeartbeatEndpointConfig);
    var setStateEndpoint = _endpoint2.default.bind(this, modules, presenceSetStateConfig);
    var subscribeEndpoint = _endpoint2.default.bind(this, modules, subscribeEndpointConfig);

    var listenerManager = this._listenerManager = new _listener_manager2.default();

    var subscriptionManager = new _subscription_manager2.default({
      timeEndpoint: timeEndpoint,
      leaveEndpoint: leaveEndpoint,
      heartbeatEndpoint: heartbeatEndpoint,
      setStateEndpoint: setStateEndpoint,
      subscribeEndpoint: subscribeEndpoint,
      crypto: modules.crypto,
      config: modules.config,
      listenerManager: listenerManager
    });

    this.addListener = listenerManager.addListener.bind(listenerManager);
    this.removeListener = listenerManager.removeListener.bind(listenerManager);
    this.removeAllListeners = listenerManager.removeAllListeners.bind(listenerManager);

    this.channelGroups = {
      listGroups: _endpoint2.default.bind(this, modules, listChannelGroupsConfig),
      listChannels: _endpoint2.default.bind(this, modules, listChannelsInChannelGroupConfig),
      addChannels: _endpoint2.default.bind(this, modules, addChannelsChannelGroupConfig),
      removeChannels: _endpoint2.default.bind(this, modules, removeChannelsChannelGroupConfig),
      deleteGroup: _endpoint2.default.bind(this, modules, deleteChannelGroupConfig)
    };

    this.push = {
      addChannels: _endpoint2.default.bind(this, modules, addPushChannelsConfig),
      removeChannels: _endpoint2.default.bind(this, modules, removePushChannelsConfig),
      deleteDevice: _endpoint2.default.bind(this, modules, removeDevicePushConfig),
      listChannels: _endpoint2.default.bind(this, modules, listPushChannelsConfig)
    };

    this.hereNow = _endpoint2.default.bind(this, modules, presenceHereNowConfig);
    this.whereNow = _endpoint2.default.bind(this, modules, presenceWhereNowEndpointConfig);
    this.getState = _endpoint2.default.bind(this, modules, presenceGetStateConfig);
    this.setState = subscriptionManager.adaptStateChange.bind(subscriptionManager);

    this.grant = _endpoint2.default.bind(this, modules, grantEndpointConfig);
    this.audit = _endpoint2.default.bind(this, modules, auditEndpointConfig);

    this.publish = _endpoint2.default.bind(this, modules, publishEndpointConfig);

    this.fire = function (args, callback) {
      args.replicate = false;
      args.storeInHistory = false;
      return _this.publish(args, callback);
    };

    this.history = _endpoint2.default.bind(this, modules, historyEndpointConfig);
    this.deleteMessages = _endpoint2.default.bind(this, modules, deleteMessagesEndpointConfig);
    this.fetchMessages = _endpoint2.default.bind(this, modules, fetchMessagesEndpointConfig);

    this.time = timeEndpoint;

    this.subscribe = subscriptionManager.adaptSubscribeChange.bind(subscriptionManager);
    this.unsubscribe = subscriptionManager.adaptUnsubscribeChange.bind(subscriptionManager);
    this.disconnect = subscriptionManager.disconnect.bind(subscriptionManager);
    this.reconnect = subscriptionManager.reconnect.bind(subscriptionManager);

    this.destroy = function (isOffline) {
      subscriptionManager.unsubscribeAll(isOffline);
      subscriptionManager.disconnect();
    };

    this.stop = this.destroy;

    this.unsubscribeAll = subscriptionManager.unsubscribeAll.bind(subscriptionManager);

    this.getSubscribedChannels = subscriptionManager.getSubscribedChannels.bind(subscriptionManager);
    this.getSubscribedChannelGroups = subscriptionManager.getSubscribedChannelGroups.bind(subscriptionManager);

    this.encrypt = crypto.encrypt.bind(crypto);
    this.decrypt = crypto.decrypt.bind(crypto);

    this.getAuthKey = modules.config.getAuthKey.bind(modules.config);
    this.setAuthKey = modules.config.setAuthKey.bind(modules.config);
    this.setCipherKey = modules.config.setCipherKey.bind(modules.config);
    this.getUUID = modules.config.getUUID.bind(modules.config);
    this.setUUID = modules.config.setUUID.bind(modules.config);
    this.getFilterExpression = modules.config.getFilterExpression.bind(modules.config);
    this.setFilterExpression = modules.config.setFilterExpression.bind(modules.config);

    this.setHeartbeatInterval = modules.config.setHeartbeatInterval.bind(modules.config);
  }

  _createClass(_class, [{
    key: 'getVersion',
    value: function getVersion() {
      return this._config.getVersion();
    }
  }, {
    key: 'networkDownDetected',
    value: function networkDownDetected() {
      this._listenerManager.announceNetworkDown();

      if (this._config.restore) {
        this.disconnect();
      } else {
        this.destroy(true);
      }
    }
  }, {
    key: 'networkUpDetected',
    value: function networkUpDetected() {
      this._listenerManager.announceNetworkUp();
      this.reconnect();
    }
  }], [{
    key: 'generateUUID',
    value: function generateUUID() {
      return _uuid2.default.v4();
    }
  }]);

  return _class;
}();

_class.OPERATIONS = _operations2.default;
_class.CATEGORIES = _categories2.default;
exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=pubnub-common.js.map
