'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('./components/networking');

var _networking2 = _interopRequireDefault(_networking);

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

var _publish = require('./endpoints/publish');

var publishEndpointConfig = _interopRequireWildcard(_publish);

var _history = require('./endpoints/history');

var historyEndpointConfig = _interopRequireWildcard(_history);

var _time = require('./endpoints/time');

var timeEndpointConfig = _interopRequireWildcard(_time);

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

var _presence = require('./endpoints/presence');

var _presence2 = _interopRequireDefault(_presence);

var _access = require('./endpoints/access');

var _access2 = _interopRequireDefault(_access);

var _subscribe = require('./endpoints/subscribe');

var _subscribe2 = _interopRequireDefault(_subscribe);

var _flow_interfaces = require('./flow_interfaces');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(setup) {
    var _this = this;

    _classCallCheck(this, _class);

    var sendBeacon = setup.sendBeacon;
    var db = setup.db;


    var config = new _config2.default({ setup: setup, db: db });
    var crypto = new _index2.default({ config: config });
    var networking = new _networking2.default({ config: config, crypto: crypto, sendBeacon: sendBeacon });

    var modules = { config: config, networking: networking, crypto: crypto };

    var subscribeEndpoints = new _subscribe2.default({ networking: modules.networking, config: modules.config });
    var presenceEndpoints = new _presence2.default({ networking: modules.networking, config: modules.config });
    var accessEndpoints = new _access2.default({ config: modules.config, networking: modules.networking, crypto: modules.crypto });


    var listenerManager = new _listener_manager2.default();

    var timeEndpoint = _endpoint2.default.bind(this, modules, timeEndpointConfig);

    var subscriptionManager = new _subscription_manager2.default({ config: modules.config, listenerManager: listenerManager, subscribeEndpoints: subscribeEndpoints, presenceEndpoints: presenceEndpoints, timeEndpoints: timeEndpoint });

    this.addListener = listenerManager.addListener.bind(listenerManager);
    this.removeListener = listenerManager.removeListener.bind(listenerManager);

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

    this.hereNow = presenceEndpoints.hereNow.bind(presenceEndpoints);
    this.whereNow = presenceEndpoints.whereNow.bind(presenceEndpoints);
    this.getState = presenceEndpoints.getState.bind(presenceEndpoints);
    this.setState = subscriptionManager.adaptStateChange.bind(subscriptionManager);

    this.grant = accessEndpoints.grant.bind(accessEndpoints);
    this.audit = accessEndpoints.audit.bind(accessEndpoints);

    this.publish = _endpoint2.default.bind(this, modules, publishEndpointConfig);

    this.fire = function (args, callback) {
      args.replicate = false;
      args.storeInHistory = false;
      _this.publish(args, callback);
    };

    this.history = _endpoint2.default.bind(this, modules, historyEndpointConfig);

    this.time = timeEndpoint;

    this.subscribe = subscriptionManager.adaptSubscribeChange.bind(subscriptionManager);
    this.unsubscribe = subscriptionManager.adaptUnsubscribeChange.bind(subscriptionManager);
    this.reconnect = subscriptionManager.reconnect.bind(subscriptionManager);
    this.stop = subscriptionManager.disconnect.bind(subscriptionManager);

    this.getAuthKey = modules.config.getAuthKey.bind(modules.config);
    this.setAuthKey = modules.config.setAuthKey.bind(modules.config);
    this.setCipherKey = modules.config.setCipherKey.bind(modules.config);
    this.getUUID = modules.config.getUUID.bind(modules.config);
    this.setUUID = modules.config.setUUID.bind(modules.config);
    this.getFilterExpression = modules.config.getFilterExpression.bind(modules.config);
    this.setFilterExpression = modules.config.setFilterExpression.bind(modules.config);
  }

  _createClass(_class, [{
    key: 'getVersion',
    value: function getVersion() {
      return _package2.default.version;
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=pubnub-common.js.map
