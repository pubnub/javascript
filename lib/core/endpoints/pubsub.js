'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('../components/networking');

var _networking2 = _interopRequireDefault(_networking);

var _config = require('../components/config');

var _config2 = _interopRequireDefault(_config);

var _keychain = require('../components/keychain');

var _keychain2 = _interopRequireDefault(_keychain);

var _state = require('../components/state');

var _state2 = _interopRequireDefault(_state);

var _presence = require('./presence');

var _presence2 = _interopRequireDefault(_presence);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

var _defaults = require('../../../defaults.json');

var _defaults2 = _interopRequireDefault(_defaults);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var networking = _ref.networking;
    var config = _ref.config;
    var keychain = _ref.keychain;
    var presenceEndpoints = _ref.presenceEndpoints;
    var state = _ref.state;
    var error = _ref.error;

    _classCallCheck(this, _class);

    this._networking = networking;
    this._config = config;
    this._keychain = keychain;
    this._state = state;
    this._error = error;
    this._presence = presenceEndpoints;
  }

  _createClass(_class, [{
    key: 'performUnsubscribe',
    value: function performUnsubscribe(args, argCallback) {
      var channelArg = args['channel'];
      var channelGroupArg = args['channel_group'];
      var authKey = args.auth_key || this._keychain.getAuthKey();
      var callback = argCallback || args.callback || function () {};
      var err = args.error || function () {};

      if (!channelArg && !channelGroupArg) {
        return this._error('Missing Channel or Channel Group');
      }

      if (!this._keychain.getSubscribeKey()) {
        return this._error('Missing Subscribe Key');
      }

      if (channelArg) {
        var channels = _utils2.default.isArray(channelArg) ? channelArg : ('' + channelArg).split(',');
        var existingChannels = [];
        var presenceChannels = [];

        _utils2.default.each(channels, function (channel) {
          if (this._state.getChannel(channel)) {
            existingChannels.push(channel);
          }
        });

        // if we do not have any channels to unsubscribe from, trigger a callback.
        if (existingChannels.length === 0) {
          callback({ action: 'leave' });
          return;
        }

        // Prepare presence channels
        _utils2.default.each(existingChannels, function (channel) {
          presenceChannels.push(channel + _defaults2.default.PRESENCE_SUFFIX);
        });

        _utils2.default.each(existingChannels.concat(presenceChannels), function (channel) {
          if (this._state.containsChannel(channel)) {
            this._state.removeChannel(channel);
          }

          if (this._state.isInPresenceState(channel)) {
            this._state.removeFromPresenceState(channel);
          }
        });

        this._presence.performChannelLeave(existingChannels.join(','), authKey, callback, err);
      }

      if (channelGroupArg) {
        var channelGroups = _utils2.default.isArray(channelGroupArg) ? channelGroupArg : ('' + channelGroupArg).split(',');
        var existingChannelGroups = [];
        var presenceChannelGroups = [];

        _utils2.default.each(channelGroups, function (channelGroup) {
          if (this._state.getChannelGroup(channelGroup)) {
            existingChannelGroups.push(channelGroup);
          }
        });

        // if we do not have any channel groups to unsubscribe from, trigger a callback.
        if (existingChannelGroups.length === 0) {
          callback({ action: 'leave' });
          return;
        }

        // Prepare presence channels
        _utils2.default.each(existingChannelGroups, function (channelGroup) {
          presenceChannelGroups.push(channelGroup + _defaults2.default.PRESENCE_SUFFIX);
        });

        _utils2.default.each(existingChannelGroups.concat(presenceChannelGroups), function (channelGroup) {
          if (this._state.containsChannelGroup(channelGroup)) {
            this._state.removeChannelGroup(channelGroup);
          }
          if (this._state.isInPresenceState(channelGroup)) {
            this._state.removeFromPresenceState(channelGroup);
          }
        });

        this._presence.performChannelGroupLeave(existingChannelGroups.join(','), authKey, callback, err);
      }
    }
  }]);

  return _class;
}();

exports.default = _class;