'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('../components/networking');

var _networking2 = _interopRequireDefault(_networking);

var _keychain = require('../components/keychain');

var _keychain2 = _interopRequireDefault(_keychain);

var _config = require('../components/config');

var _config2 = _interopRequireDefault(_config);

var _responders = require('../presenters/responders');

var _responders2 = _interopRequireDefault(_responders);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var networking = _ref.networking;
    var keychain = _ref.keychain;
    var config = _ref.config;
    var jsonp_cb = _ref.jsonp_cb;
    var error = _ref.error;

    _classCallCheck(this, _class);

    this._networking = networking;
    this._keychain = keychain;
    this._config = config;
    this._jsonp_cb = jsonp_cb;
    this._error = error;
  }

  // generic function to handle all channel group operations


  _createClass(_class, [{
    key: 'channelGroup',
    value: function channelGroup(args, argumentCallback) {
      var ns_ch = args.channel_group;
      var callback = args.callback || argumentCallback;
      var channels = args.channels || args.channel;
      var channel_group = '';

      var data = {};
      var mode = args.mode || 'add';
      var err = args.error || this._error;
      var jsonp = this._jsonp_cb();

      if (ns_ch) {
        var ns_ch_a = ns_ch.split(':');

        if (ns_ch_a.length > 1) {
          channel_group = ns_ch_a[1];
        } else {
          channel_group = ns_ch_a[0];
        }
      }

      if (channels) {
        if (_utils2.default.isArray(channels)) {
          channels = channels.join(',');
        }
        data[mode] = channels;
      }

      if (!data.auth) {
        data.auth = args.auth_key || this._keychain.getAuthKey();
      }

      if (jsonp) data.callback = jsonp;

      this._networking.performChannelGroupOperation(channel_group, mode, {
        callback: jsonp,
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
    key: 'listChannels',
    value: function listChannels(args, callback) {
      if (!args.channel_group) return this._error('Missing Channel Group');
      this.channelGroup(args, callback);
    }
  }, {
    key: 'removeGroup',
    value: function removeGroup(args, callback) {
      var errorMessage = 'Use channel_group_remove_channel if you want to remove a channel from a group.';
      if (!args.channel_group) return this._error('Missing Channel Group');
      if (args.channel) return this._error(errorMessage);

      args.mode = 'remove';
      this.channelGroup(args, callback);
    }
  }, {
    key: 'listGroups',
    value: function listGroups(args, callback) {
      this.channelGroup(args, callback);
    }
  }, {
    key: 'addChannel',
    value: function addChannel(args, callback) {
      if (!args.channel_group) return this._error('Missing Channel Group');
      if (!args.channel && !args.channels) return this._error('Missing Channel');
      this.channelGroup(args, callback);
    }
  }, {
    key: 'removeChannel',
    value: function removeChannel(args, callback) {
      if (!args.channel_group) return this._error('Missing Channel Group');
      if (!args.channel && !args.channels) return this._error('Missing Channel');

      args.mode = 'remove';
      this.channelGroup(args, callback);
    }
  }]);

  return _class;
}();

exports.default = _class;
//# sourceMappingURL=channel_groups.js.map
