'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('../components/networking');

var _networking2 = _interopRequireDefault(_networking);

var _logger = require('../components/logger');

var _logger2 = _interopRequireDefault(_logger);

var _responders = require('../presenters/responders');

var _responders2 = _interopRequireDefault(_responders);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var networking = _ref.networking;

    _classCallCheck(this, _class);

    this._networking = networking;
    this._r = new _responders2.default('#endpoints/PAM');
    this._l = _logger2.default.getLogger('#endpoints/PAM');
  }

  _createClass(_class, [{
    key: 'revoke',
    value: function revoke(args, callback) {
      args.read = false;
      args.write = false;
      this.grant(args, callback);
    }
  }, {
    key: 'grant',
    value: function grant(args, callback) {
      var _args$channels = args.channels;
      var channels = _args$channels === undefined ? [] : _args$channels;
      var _args$channelGroups = args.channelGroups;
      var channelGroups = _args$channelGroups === undefined ? [] : _args$channelGroups;
      var ttl = args.ttl;
      var read = args.read;
      var write = args.write;
      var manage = args.manage;
      var _args$authKeys = args.authKeys;
      var authKeys = _args$authKeys === undefined ? [] : _args$authKeys;


      var r = read ? '1' : '0';
      var w = write ? '1' : '0';
      var m = manage ? '1' : '0';

      if (!callback) {
        return this._l.error('Missing Callback');
      }

      var timestamp = Math.floor(new Date().getTime() / 1000);

      var data = { w: w, r: r, timestamp: timestamp };

      if (typeof manage !== 'undefined') {
        data.m = m;
      }

      if (channels.length > 0) {
        data.channel = channels.join(',');
      }

      if (channelGroups.length > 0) {
        data['channel-group'] = channelGroups.join(',');
      }

      if (ttl || ttl === 0) {
        data.ttl = ttl;
      }

      var stringifiedAuthKeys = authKeys.length > 0 ? authKeys.join(',') : null;

      this._networking.performGrant(stringifiedAuthKeys, data, callback);
    }
  }, {
    key: 'audit',
    value: function audit(args, callback) {
      var _args$channels2 = args.channels;
      var channels = _args$channels2 === undefined ? [] : _args$channels2;
      var _args$channelGroups2 = args.channelGroups;
      var channelGroups = _args$channelGroups2 === undefined ? [] : _args$channelGroups2;
      var _args$authKeys2 = args.authKeys;
      var authKeys = _args$authKeys2 === undefined ? [] : _args$authKeys2;

      // Make sure we have a Channel

      if (!callback) {
        return this._l.error('Missing Callback');
      }

      var timestamp = Math.floor(new Date().getTime() / 1000);
      var data = { timestamp: timestamp };

      if (channels.length > 0) {
        data.channel = channels.join(',');
      }

      if (channelGroups.length > 0) {
        data['channel-group'] = channelGroups.join(',');
      }

      var stringifiedAuthKeys = authKeys.length > 0 ? authKeys.join(',') : null;

      this._networking.performAudit(stringifiedAuthKeys, data, callback);
    }
  }]);

  return _class;
}();

exports.default = _class;