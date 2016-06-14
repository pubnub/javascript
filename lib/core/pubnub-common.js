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

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

var _time = require('./endpoints/time');

var _time2 = _interopRequireDefault(_time);

var _presence = require('./endpoints/presence');

var _presence2 = _interopRequireDefault(_presence);

var _history = require('./endpoints/history');

var _history2 = _interopRequireDefault(_history);

var _push = require('./endpoints/push');

var _push2 = _interopRequireDefault(_push);

var _access = require('./endpoints/access');

var _access2 = _interopRequireDefault(_access);

var _channel_groups = require('./endpoints/channel_groups');

var _channel_groups2 = _interopRequireDefault(_channel_groups);

var _subscribe = require('./endpoints/subscribe');

var _subscribe2 = _interopRequireDefault(_subscribe);

var _publish = require('./endpoints/publish');

var _publish2 = _interopRequireDefault(_publish);

var _flow_interfaces = require('./flow_interfaces');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(setup) {
    _classCallCheck(this, _class);

    var sendBeacon = setup.sendBeacon;
    var db = setup.db;


    this._config = new _config2.default(setup);
    this._crypto = new _index2.default({ config: this._config });
    this._networking = new _networking2.default({ config: this._config, crypto: this._crypto, sendBeacon: sendBeacon });

    var subscribeEndpoints = new _subscribe2.default({ networking: this._networking, config: this._config });
    var presenceEndpoints = new _presence2.default({ networking: this._networking, config: this._config });
    var timeEndpoint = new _time2.default({ networking: this._networking, config: this._config });
    var pushEndpoints = new _push2.default({ networking: this._networking, config: this._config });
    var channelGroupEndpoints = new _channel_groups2.default({ networking: this._networking, config: this._config });
    var publishEndpoints = new _publish2.default({ networking: this._networking, config: this._config, crypto: this._crypto });
    var historyEndpoint = new _history2.default({ networking: this._networking, config: this._config, crypto: this._crypto });
    var accessEndpoints = new _access2.default({ config: this._config, networking: this._networking, crypto: this._crypto });

    var subscriptionManager = new _subscription_manager2.default({ subscribeEndpoints: subscribeEndpoints, config: this._config, presenceEndpoints: presenceEndpoints });

    db.set(this._config.subscribeKey + 'uuid', this._config.UUID);

    this.listAllChannelGroups = channelGroupEndpoints.listGroups.bind(channelGroupEndpoints);
    this.listChannelsForChannelGroup = channelGroupEndpoints.listChannels.bind(channelGroupEndpoints);
    this.addChannelsToChannelGroup = channelGroupEndpoints.addChannels.bind(channelGroupEndpoints);
    this.removeChannelsFromChannelGroup = channelGroupEndpoints.removeChannels.bind(channelGroupEndpoints);
    this.deleteChannelGroup = channelGroupEndpoints.deleteGroup.bind(channelGroupEndpoints);

    this.addPushNotificationsOnChannels = pushEndpoints.addDeviceToPushChannels.bind(pushEndpoints);
    this.removePushNotificationsFromChannels = pushEndpoints.removeDeviceFromPushChannels.bind(pushEndpoints);
    this.removeAllPushNotificationsFromDeviceWithPushToken = pushEndpoints.removeDevice.bind(pushEndpoints);
    this.auditPushChannelProvisions = pushEndpoints.listChannelsForDevice.bind(pushEndpoints);

    this.hereNow = presenceEndpoints.hereNow.bind(presenceEndpoints);
    this.whereNow = presenceEndpoints.whereNow.bind(presenceEndpoints);
    this.getState = presenceEndpoints.getState.bind(presenceEndpoints);
    this.setState = subscriptionManager.adaptStateChange.bind(subscriptionManager);

    this.grant = accessEndpoints.grant.bind(accessEndpoints);
    this.audit = accessEndpoints.audit.bind(accessEndpoints);

    this.publish = publishEndpoints.publish.bind(publishEndpoints);
    this.history = historyEndpoint.fetch.bind(historyEndpoint);
    this.time = timeEndpoint.fetch.bind(timeEndpoint);

    this.subscribe = subscriptionManager.adaptSubscribeChange.bind(subscriptionManager);
    this.unsubscribe = subscriptionManager.adaptUnsubscribeChange.bind(subscriptionManager);
    this.reconnect = subscriptionManager.reconnect.bind(subscriptionManager);

    this.stop = subscriptionManager.disconnect.bind(this.subscriptionManager);
    this.reconnect = subscriptionManager.reconnect.bind(this.SubscriptionManager);

    this.addListener = subscriptionManager.addListener.bind(subscriptionManager);
    this.removeListener = subscriptionManager.removeListener.bind(subscriptionManager);

    this.setCipherKey = this._config.setCipherKey.bind(this._config);
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