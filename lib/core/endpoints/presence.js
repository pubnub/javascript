'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('../components/networking');

var _networking2 = _interopRequireDefault(_networking);

var _subscription_manager = require('../components/subscription_manager');

var _subscription_manager2 = _interopRequireDefault(_subscription_manager);

var _config = require('../components/config');

var _config2 = _interopRequireDefault(_config);

var _logger = require('../components/logger');

var _logger2 = _interopRequireDefault(_logger);

var _responders = require('../presenters/responders');

var _responders2 = _interopRequireDefault(_responders);

var _base = require('./base.js');

var _base2 = _interopRequireDefault(_base);

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
    var subscriptionManager = _ref.subscriptionManager;

    _classCallCheck(this, _class);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, { config: config }));

    _this.networking = networking;
    _this.config = config;
    _this.subscriptionManager = subscriptionManager;
    _this._r = new _responders2.default('#endpoints/presence');
    _this._l = _logger2.default.getLogger('#endpoints/presence');
    return _this;
  }

  _createClass(_class, [{
    key: 'whereNow',
    value: function whereNow(args, callback) {
      var _args$uuid = args.uuid;
      var uuid = _args$uuid === undefined ? this.config.UUID : _args$uuid;

      var endpointConfig = {
        params: {
          uuid: { required: false },
          authKey: { required: false }
        },
        url: '/v2/presence/sub-key/' + this.config.subscribeKey + '/uuid/' + uuid
      };

      if (!callback) {
        return this._l.error('Missing Callback');
      }

      if (!this.validateEndpointConfig(endpointConfig)) {
        return;
      }

      var params = this.createBaseParams(endpointConfig);

      this.networking.GET(params, endpointConfig, function (status, payload) {
        if (status.error) return callback(status);

        var response = {
          channels: payload.payload.channels
        };

        callback(status, response);
      });
    }
  }, {
    key: 'getState',
    value: function getState(args, callback) {
      var _args$uuid2 = args.uuid;
      var uuid = _args$uuid2 === undefined ? this.config.UUID : _args$uuid2;
      var _args$channels = args.channels;
      var channels = _args$channels === undefined ? [] : _args$channels;
      var _args$channelGroups = args.channelGroups;
      var channelGroups = _args$channelGroups === undefined ? [] : _args$channelGroups;

      var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
      var endpointConfig = {
        params: {
          uuid: { required: false },
          authKey: { required: false }
        },
        url: '/v2/presence/sub-key/' + this.config.subscribeKey + '/channel/' + stringifiedChannels + '/uuid/' + uuid
      };

      if (!callback) {
        return this._l.error('Missing Callback');
      }

      if (channels.length === 0 && channelGroups.length === 0) {
        return callback(this._r.validationError('Channel or Channel Group must be supplied'));
      }

      if (!this.validateEndpointConfig(endpointConfig)) {
        return;
      }

      var params = this.createBaseParams(endpointConfig);

      if (channelGroups.length > 0) {
        params['channel-group'] = channelGroups.join(',');
      }

      this.networking.GET(params, endpointConfig, function (status, payload) {
        if (status.error) return callback(status);

        var channelsResponse = {};

        if (channels.length === 1 && channelGroups.length === 0) {
          channelsResponse[channels[0]] = payload.payload;
        } else {
          channelsResponse = payload.payload;
        }

        var response = {
          channels: channelsResponse
        };

        callback(status, response);
      });
    }
  }, {
    key: 'setState',
    value: function setState(args, callback) {
      var state = args.state;
      var _args$channels2 = args.channels;
      var channels = _args$channels2 === undefined ? [] : _args$channels2;
      var _args$channelGroups2 = args.channelGroups;
      var channelGroups = _args$channelGroups2 === undefined ? [] : _args$channelGroups2;

      var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
      var endpointConfig = {
        params: {
          uuid: { required: false },
          authKey: { required: false }
        },
        url: '/v2/presence/sub-key/' + this.config.subscribeKey + '/channel/' + stringifiedChannels + '/uuid/' + this.config.UUID + '/data'
      };

      if (!callback) {
        return this._l.error('Missing Callback');
      }

      if (channels.length === 0 && channelGroups.length === 0) {
        return callback(this._r.validationError('Channel or Channel Group must be supplied'));
      }

      if (!state) {
        return callback(this._r.validationError('State must be supplied'));
      }

      this.subscriptionManager.adaptStateChange({ channels: channels, state: state, channelGroups: channelGroups });

      if (!this.validateEndpointConfig(endpointConfig)) {
        return;
      }

      var params = this.createBaseParams(endpointConfig);

      params.state = encodeURIComponent(JSON.stringify(state));

      if (channelGroups.length > 0) {
        params['channel-group'] = channelGroups.join(',');
      }

      this.networking.GET(params, endpointConfig, function (status, payload) {
        if (status.error) return callback(status);

        var response = {
          state: payload.payload
        };

        callback(status, response);
      });
    }
  }]);

  return _class;
}(_base2.default);

exports.default = _class;
module.exports = exports['default'];