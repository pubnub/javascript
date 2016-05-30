'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventEmitter = require('event-emitter');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class() {
    _classCallCheck(this, _class);

    this._channelStorage = {};
    this._channelGroupStorage = {};
    this._presenceState = {};

    this._eventEmitter = new _eventEmitter2.default();
    this._subscribeTimeToken = '0';
    this.filterExpression = '';
  }

  _createClass(_class, [{
    key: 'containsChannel',
    value: function containsChannel(name) {
      return name in this._channelStorage;
    }
  }, {
    key: 'containsChannelGroup',
    value: function containsChannelGroup(name) {
      return name in this._channelGroupStorage;
    }
  }, {
    key: 'getChannel',
    value: function getChannel(name) {
      return this._channelStorage[name];
    }
  }, {
    key: 'getChannelGroup',
    value: function getChannelGroup(name) {
      return this._channelGroupStorage[name];
    }
  }, {
    key: 'addChannel',
    value: function addChannel(name, metadata) {
      this._channelStorage[name] = metadata;
    }
  }, {
    key: 'removeChannel',
    value: function removeChannel(key) {
      delete this._channelStorage[key];
    }
  }, {
    key: 'addChannelGroup',
    value: function addChannelGroup(name, metadata) {
      this._channelGroupStorage[name] = metadata;
    }
  }, {
    key: 'removeFromPresenceState',
    value: function removeFromPresenceState(name) {
      delete this._presenceState[name];
    }
  }, {
    key: 'isInPresenceState',
    value: function isInPresenceState(name) {
      return name in this._presenceState;
    }
  }, {
    key: 'removeChannelGroup',
    value: function removeChannelGroup(key) {
      delete this._channelGroupStorage[key];
    }
  }, {
    key: 'addToPresenceState',
    value: function addToPresenceState(key, value) {
      this._presenceState[key] = value;
    }
  }, {
    key: 'getPresenceState',
    value: function getPresenceState() {
      return this._presenceState;
    }
  }, {
    key: 'setSubscribeTimeToken',
    value: function setSubscribeTimeToken(newTimeToken) {
      this._subscribeTimeToken = newTimeToken;
    }
  }, {
    key: 'getSubscribeTimeToken',
    value: function getSubscribeTimeToken() {
      return this._subscribeTimeToken;
    }
  }, {
    key: 'onStateChange',
    value: function onStateChange(callback) {
      this._eventEmitter.on('onStateChange', callback);
    }
  }, {
    key: 'onSubscriptionChange',
    value: function onSubscriptionChange(callback) {
      this._eventEmitter.on('onSubscriptionChange', callback);
    }
  }, {
    key: 'onPresenceConfigChange',
    value: function onPresenceConfigChange(callback) {
      this._eventEmitter.on('onPresenceConfigChange', callback);
    }
  }, {
    key: 'announceStateChange',
    value: function announceStateChange() {
      this._eventEmitter.emit('onStateChange');
    }
  }, {
    key: 'announceSubscriptionChange',
    value: function announceSubscriptionChange() {
      this._subscribeTimeToken = '0';
      this._eventEmitter.emit('onSubscriptionChange');
    }
  }, {
    key: 'announcePresenceConfigChange',
    value: function announcePresenceConfigChange() {
      this._eventEmitter.emit('onPresenceConfigChange');
    }
  }, {
    key: 'getSubscribedChannels',
    value: function getSubscribedChannels() {
      return Object.keys(this._channelStorage);
    }
  }, {
    key: 'getSubscribedChannelGroups',
    value: function getSubscribedChannelGroups() {
      return Object.keys(this._channelGroupStorage);
    }
  }, {
    key: 'getChannelsWithPresence',
    value: function getChannelsWithPresence() {
      var _this = this;

      var channels = [];

      Object.keys(this._channelStorage).forEach(function (channelName) {
        var channel = _this._channelStorage[channelName];

        if (channel.enablePresence === true) {
          channels.push(channelName);
        }
      });

      return channels;
    }
  }, {
    key: 'getChannelGroupsWithPresence',
    value: function getChannelGroupsWithPresence() {
      var _this2 = this;

      var channelGroups = [];

      Object.keys(this._channelGroupStorage).forEach(function (channelGroupName) {
        var channelGroup = _this2._channelGroupStorage[channelGroupName];

        if (channelGroup.enablePresence === true) {
          channelGroups.push(channelGroupName);
        }
      });

      return channelGroups;
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];