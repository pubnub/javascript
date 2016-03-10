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

var _responders = require('../presenters/responders');

var _responders2 = _interopRequireDefault(_responders);

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
    var state = _ref.state;
    var error = _ref.error;

    _classCallCheck(this, _class);

    this._networking = networking;
    this._config = config;
    this._keychain = keychain;
    this._state = state;
    this._error = error;
  }

  _createClass(_class, [{
    key: 'hereNow',
    value: function hereNow(args, argumentCallback) {
      var callback = args.callback || argumentCallback;
      var err = args.error || function () {};
      var authkey = args.auth_key || this._keychain.getAuthKey();
      var channel = args.channel;
      var channelGroup = args.channel_group;
      var uuids = 'uuids' in args ? args.uuids : true;
      var state = args.state;
      var data = {
        uuid: this._keychain.getUUID(),
        auth: authkey
      };

      if (!uuids) data.disable_uuids = 1;
      if (state) data.state = 1;

      // Make sure we have a Channel
      if (!callback) return this._error('Missing Callback');
      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');

      if (channelGroup) {
        data['channel-group'] = channelGroup;
      }

      if (this._config.isInstanceIdEnabled()) {
        data.instanceid = this._keychain.getInstanceId();
      }

      this._networking.fetchHereNow(channel, channelGroup, {
        data: this._networking.prepareParams(data),
        success: function success(response) {
          _responders2.default.callback(response, callback, err);
        },
        fail: function fail(response) {
          _responders2.default.error(response, err);
        }
      });
    }
  }, {
    key: 'whereNow',
    value: function whereNow(args, argumentCallback) {
      var callback = args.callback || argumentCallback;
      var err = args.error || function () {};
      var authKey = args.auth_key || this._keychain.getAuthKey();
      var uuid = args.uuid || this._keychain.getUUID();
      var data = {
        auth: authKey
      };

      // Make sure we have a Channel
      if (!callback) return this._error('Missing Callback');
      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');

      if (this._config.isInstanceIdEnabled()) {
        data.instanceid = this._keychain.getInstanceId();
      }

      this._networking.fetchWhereNow(uuid, {
        data: this._networking.prepareParams(data),
        success: function success(response) {
          _responders2.default.callback(response, callback, err);
        },
        fail: function fail(response) {
          _responders2.default.error(response, err);
        }
      });
    }
  }, {
    key: 'heartbeat',
    value: function heartbeat(args) {
      var callback = args.callback || function () {};
      var err = args.error || function () {};
      var data = {
        uuid: this._keychain.getUUID(),
        auth: this._keychain.getAuthKey()
      };

      var st = JSON.stringify(this._state.getPresenceState());
      if (st.length > 2) {
        data.state = JSON.stringify(this._state.getPresenceState());
      }

      if (this._config.getPresenceTimeout() > 0 && this._config.getPresenceTimeout() < 320) {
        data.heartbeat = this._config.getPresenceTimeout();
      }

      var channels = _utils2.default.encode(this._state.generate_channel_list(true).join(','));
      var channelGroups = this._state.generate_channel_group_list(true).join(',');

      if (!channels) channels = ',';
      if (channelGroups) data['channel-group'] = channelGroups;

      if (this._config.isInstanceIdEnabled()) {
        data.instanceid = this._keychain.getInstanceId();
      }

      if (this._config.isRequestIdEnabled()) {
        data.requestid = _utils2.default.generateUUID();
      }

      this._networking.performHeartbeat(channels, {
        data: this._networking.prepareParams(data),
        success: function success(response) {
          _responders2.default.callback(response, callback, err);
        },
        fail: function fail(response) {
          _responders2.default.error(response, err);
        }
      });
    }
  }, {
    key: 'performState',
    value: function performState(args, argumentCallback) {
      var callback = args.callback || argumentCallback || function () {};
      var err = args.error || function () {};
      var authKey = args.auth_key || this._keychain.getAuthKey();
      var state = args.state;
      var uuid = args.uuid || this._keychain.getUUID();
      var channel = args.channel;
      var channelGroup = args.channel_group;
      var data = this._networking.prepareParams({ auth: authKey });

      // Make sure we have a Channel
      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');
      if (!uuid) return this._error('Missing UUID');
      if (!channel && !channelGroup) return this._error('Missing Channel');

      if (typeof channel !== 'undefined' && this._state.getChannel(channel) && this._state.getChannel(channel).subscribed) {
        if (state) {
          this._state.addToPresenceState(channel, state);
        }
      }

      if (typeof channelGroup !== 'undefined' && this._state.getChannelGroup(channelGroup) && this._state.getChannelGroup(channelGroup).subscribed) {
        if (state) {
          this._state.addToPresenceState(channelGroup, state);
        }
        data['channel-group'] = channelGroup;

        if (!channel) {
          channel = ',';
        }
      }

      data.state = JSON.stringify(state);

      if (this._config.isInstanceIdEnabled()) {
        data.instanceid = this._keychain.getInstanceId();
      }

      this._networking.performState(state, channel, uuid, {
        data: this._networking.prepareParams(data),
        success: function success(response) {
          _responders2.default.callback(response, callback, err);
        },
        fail: function fail(response) {
          _responders2.default.error(response, err);
        }
      });
    }
  }, {
    key: 'announceChannelLeave',
    value: function announceChannelLeave(channel, authKey, argCallback, error) {
      var data = {
        uuid: this._keychain.getUUID(),
        auth: authKey || this._keychain.getAuthKey()
      };

      var callback = argCallback || function () {};
      var err = error || function () {};

      // Prevent Leaving a Presence Channel
      if (channel.indexOf(_defaults2.default.PRESENCE_SUFFIX) > 0) {
        return true;
      }

      /* TODO move me to unsubscribe */
      if (this._config.isSuppressingLeaveEvents()) {
        return false;
      }

      if (this._config.isInstanceIdEnabled()) {
        data.instanceid = this._keychain.getInstanceId();
      }
      /* TODO: move me to unsubscribe */

      this._networking.performChannelLeave(channel, {
        data: this._networking.prepareParams(data),
        success: function success(response) {
          _responders2.default.callback(response, callback, err);
        },
        fail: function fail(response) {
          _responders2.default.error(response, err);
        }
      });
    }
  }, {
    key: 'announceChannelGroupLeave',
    value: function announceChannelGroupLeave(channelGroup, authKey, argCallback, error) {
      var data = {
        uuid: this._keychain.getUUID(),
        auth: authKey || this._keychain.getAuthKey()
      };

      var callback = argCallback || function () {};
      var err = error || function () {};

      // Prevent Leaving a Presence Channel Group
      if (channelGroup.indexOf(_defaults2.default.PRESENCE_SUFFIX) > 0) {
        return true;
      }

      if (this._config.isSuppressingLeaveEvents()) {
        return false;
      }

      /* TODO move me to unsubscribe */
      if (channelGroup && channelGroup.length > 0) {
        data['channel-group'] = channelGroup;
      }

      if (this._config.isInstanceIdEnabled()) {
        data.instanceid = this._keychain.getInstanceId();
      }
      /* TODO move me to unsubscribe */

      this._networking.performChannelGroupLeave({
        data: this._networking.prepareParams(data),
        success: function success(response) {
          _responders2.default.callback(response, callback, err);
        },
        fail: function fail(response) {
          _responders2.default.error(response, err);
        }
      });
    }
  }]);

  return _class;
}();

exports.default = _class;