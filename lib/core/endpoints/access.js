'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('../components/networking');

var _networking2 = _interopRequireDefault(_networking);

var _config = require('../components/config');

var _config2 = _interopRequireDefault(_config);

var _cryptography = require('../components/cryptography');

var _cryptography2 = _interopRequireDefault(_cryptography);

var _logger = require('../components/logger');

var _logger2 = _interopRequireDefault(_logger);

var _responders = require('../presenters/responders');

var _responders2 = _interopRequireDefault(_responders);

var _base = require('./base.js');

var _base2 = _interopRequireDefault(_base);

var _utils = require('../utils.js');

var _utils2 = _interopRequireDefault(_utils);

var _flow_interfaces = require('../flow_interfaces');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _class = function (_BaseEndoint) {
  _inherits(_class, _BaseEndoint);

  function _class(_ref) {
    var networking = _ref.networking;
    var config = _ref.config;
    var crypto = _ref.crypto;

    _classCallCheck(this, _class);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, { config: config }));

    _this.networking = networking;
    _this.config = config;
    _this.crypto = crypto;
    _this._r = new _responders2.default('#endpoints/PAM');
    _this._l = _logger2.default.getLogger('#endpoints/PAM');
    return _this;
  }

  _createClass(_class, [{
    key: 'grant',
    value: function grant(args, callback) {
      var _args$channels = args.channels;
      var channels = _args$channels === undefined ? [] : _args$channels;
      var _args$channelGroups = args.channelGroups;
      var channelGroups = _args$channelGroups === undefined ? [] : _args$channelGroups;
      var ttl = args.ttl;
      var _args$read = args.read;
      var read = _args$read === undefined ? false : _args$read;
      var _args$write = args.write;
      var write = _args$write === undefined ? false : _args$write;
      var _args$manage = args.manage;
      var manage = _args$manage === undefined ? false : _args$manage;
      var _args$authKeys = args.authKeys;
      var authKeys = _args$authKeys === undefined ? [] : _args$authKeys;

      var endpointConfig = {
        params: {
          subscribeKey: { required: true },
          publishKey: { required: true },
          uuid: { required: true }
        },
        url: '/v1/auth/grant/sub-key/' + this.config.subscribeKey
      };

      if (!callback) return this._l.error('Missing Callback');

      if (!this.validateEndpointConfig(endpointConfig)) {
        return;
      }

      var params = this.createBaseParams(endpointConfig);

      params.r = read ? '1' : '0';
      params.w = write ? '1' : '0';
      params.m = manage ? '1' : '0';
      params.timestamp = Math.floor(new Date().getTime() / 1000);

      if (channels.length > 0) {
        params.channel = channels.join(',');
      }

      if (channelGroups.length > 0) {
        params['channel-group'] = channelGroups.join(',');
      }

      if (authKeys.length > 0) {
        params.auth = authKeys.join(',');
      }

      if (ttl || ttl === 0) {
        params.ttl = ttl;
      }

      var signInput = this.config.subscribeKey + '\n' + this.config.publishKey + '\ngrant\n';
      signInput += _utils2.default._get_pam_sign_input_from_params(params);

      params.signature = this.crypto.HMACSHA256(signInput);

      this.networking.GET(params, endpointConfig, function (status, payload) {
        if (status.error) return callback(status);

        var channelsResponse = {};
        var channelGroupsResponse = {};

        if (channels.length === 1 && channelGroups.length === 0) {
          channelsResponse[payload.payload.channel] = payload.payload.auths;
        }

        if (channelGroups.length === 1 && channels.length === 0) {
          channelGroupsResponse[payload.payload['channel-groups']] = payload.payload.auths;
        }

        if (channels.length > 1) {
          Object.keys(payload.payload.channels).forEach(function (channelName) {
            channelsResponse[channelName] = payload.payload.channels[channelName].auths;
          });
        }

        if (channelGroups.length > 1) {
          Object.keys(payload.payload['channel-groups']).forEach(function (channelGroupName) {
            channelGroupsResponse[channelGroupName] = payload.payload['channel-groups'][channelGroupName].auths;
          });
        }

        var response = {
          ttl: payload.payload.ttl,
          level: payload.payload.level,
          subscribeKey: payload.payload.subscribe_key,
          channels: channelsResponse,
          channelGroups: channelGroupsResponse
        };

        callback(status, response);
      });
    }
  }, {
    key: 'audit',
    value: function audit(args, callback) {
      var channel = args.channel;
      var channelGroup = args.channelGroup;
      var _args$authKeys2 = args.authKeys;
      var authKeys = _args$authKeys2 === undefined ? [] : _args$authKeys2;

      var endpointConfig = {
        params: {
          subscribeKey: { required: true },
          publishKey: { required: true },
          uuid: { required: true }
        },
        url: '/v1/auth/audit/sub-key/' + this.config.subscribeKey
      };

      if (!callback) return this._l.error('Missing Callback');

      if (!this.validateEndpointConfig(endpointConfig)) {
        return;
      }

      var params = this.createBaseParams(endpointConfig);

      params.timestamp = Math.floor(new Date().getTime() / 1000);

      if (channel) {
        params.channel = channel;
      }

      if (channelGroup) {
        params['channel-group'] = channelGroup;
      }

      if (authKeys.length > 0) {
        params.auth = authKeys.join(',');
      }

      var signInput = this.config.subscribeKey + '\n' + this.config.publishKey + '\naudit\n';
      signInput += _utils2.default._get_pam_sign_input_from_params(params);

      params.signature = this.crypto.HMACSHA256(signInput);

      this.networking.GET(params, endpointConfig, function (status, payload) {
        if (status.error) return callback(status);

        var response = {};

        callback(status, response);
      });
    }
  }]);

  return _class;
}(_base2.default);

exports.default = _class;
module.exports = exports['default'];