'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('../components/networking');

var _networking2 = _interopRequireDefault(_networking);

var _config = require('../components/config');

var _config2 = _interopRequireDefault(_config);

var _base = require('./base.js');

var _base2 = _interopRequireDefault(_base);

var _flow_interfaces = require('../flow_interfaces');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _class = function (_BaseEndpoint) {
  _inherits(_class, _BaseEndpoint);

  function _class(_ref) {
    var networking = _ref.networking;
    var config = _ref.config;

    _classCallCheck(this, _class);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, { config: config }));

    _this.networking = networking;
    _this.config = config;
    return _this;
  }

  _createClass(_class, [{
    key: 'listChannelsForDevice',
    value: function listChannelsForDevice(args, callback) {
      var pushGateway = args.pushGateway;
      var device = args.device;

      var endpointConfig = {
        params: {
          authKey: { required: false },
          uuid: { required: false }
        },
        url: '/v1/push/sub-key/' + this.config.subscribeKey + '/devices/' + device
      };

      if (!device) {
        return callback(this.createValidationError('Missing Device ID (device)'));
      }

      if (!pushGateway) {
        return callback(this.createValidationError('Missing GW Type (pushGateway: gcm,apns, mpns)'));
      }

      if (!this.validateEndpointConfig(endpointConfig)) {
        return;
      }

      var params = this.createBaseParams(endpointConfig);
      params.type = pushGateway;

      this.networking.GET(params, endpointConfig, function (status, payload) {
        if (status.error) return callback(status);

        var response = {
          channels: payload
        };

        callback(status, response);
      });
    }
  }, {
    key: 'removeDevice',
    value: function removeDevice(args, callback) {
      var pushGateway = args.pushGateway;
      var device = args.device;

      var endpointConfig = {
        params: {
          authKey: { required: false },
          uuid: { required: false }
        },
        url: '/v1/push/sub-key/' + this.config.subscribeKey + '/devices/' + device + '/remove'
      };

      if (!device) {
        return callback(this.createValidationError('Missing Device ID (device)'));
      }

      if (!pushGateway) {
        return callback(this.createValidationError('Missing GW Type (pushGateway: gcm or apns)'));
      }

      if (!this.validateEndpointConfig(endpointConfig)) {
        return;
      }

      var params = this.createBaseParams(endpointConfig);
      params.type = pushGateway;

      this.networking.GET(params, endpointConfig, function (status) {
        callback(status);
      });
    }
  }, {
    key: 'addDeviceToPushChannels',
    value: function addDeviceToPushChannels(args, callback) {
      var pushGateway = args.pushGateway;
      var device = args.device;
      var channels = args.channels;

      var payload = { operation: 'add', pushGateway: pushGateway, device: device, channels: channels };
      this.__provisionDevice(payload, callback);
    }
  }, {
    key: 'removeDeviceFromPushChannels',
    value: function removeDeviceFromPushChannels(args, callback) {
      var pushGateway = args.pushGateway;
      var device = args.device;
      var channels = args.channels;

      var payload = { operation: 'remove', pushGateway: pushGateway, device: device, channels: channels };
      this.__provisionDevice(payload, callback);
    }
  }, {
    key: '__provisionDevice',
    value: function __provisionDevice(args, callback) {
      var operation = args.operation;
      var pushGateway = args.pushGateway;
      var device = args.device;
      var channels = args.channels;

      var endpointConfig = {
        params: {
          authKey: { required: false },
          uuid: { required: false }
        },
        url: '/v1/push/sub-key/' + this.config.subscribeKey + '/devices/' + device
      };

      if (!device) {
        return callback(this.createValidationError('Missing Device ID (device)'));
      }

      if (!pushGateway) {
        return callback(this.createValidationError('Missing GW Type (pushGateway: gcm or apns)'));
      }

      if (!operation) {
        return callback(this.createValidationError('Missing GW Operation (operation: add or remove)'));
      }

      if (!channels) {
        return callback(this.createValidationError('Missing gw destination Channel (channel)'));
      }

      if (!this.validateEndpointConfig(endpointConfig)) {
        return;
      }

      var params = this.createBaseParams(endpointConfig);
      params.type = pushGateway;

      if (operation === 'add') params.add = encodeURIComponent(channels.join(','));
      if (operation === 'remove') params.remove = encodeURIComponent(channels.join(','));

      this.networking.GET(params, endpointConfig, function (status) {
        callback(status);
      });
    }
  }]);

  return _class;
}(_base2.default);

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=push.js.map
