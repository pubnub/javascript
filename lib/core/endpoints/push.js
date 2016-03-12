'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('../components/networking');

var _networking2 = _interopRequireDefault(_networking);

var _keychain = require('../components/keychain');

var _keychain2 = _interopRequireDefault(_keychain);

var _responders = require('../presenters/responders');

var _responders2 = _interopRequireDefault(_responders);

var _Q = require('Q');

var _Q2 = _interopRequireDefault(_Q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var checkParam = function checkParam(_checkParam, message) {
  var q = _Q2.default.defer();

  if (_checkParam) {
    q.resolve();
  } else {
    q.reject(message);
  }

  return q.promise;
};

var _class = function () {
  function _class(_ref) {
    var networking = _ref.networking;

    _classCallCheck(this, _class);

    this._networking = networking;
    this._r = new _responders2.default('endpoints/push');
  }

  _createClass(_class, [{
    key: 'addDevice',
    value: function addDevice(_ref2) {
      var pushGateway = _ref2.pushGateway;
      var device = _ref2.device;
      var channel = _ref2.channel;

      var payload = { operation: 'add', pushGateway: pushGateway, device: device, channel: channel };
      return this.__provisionDevice(payload);
    }
  }, {
    key: 'removeDevice',
    value: function removeDevice(_ref3) {
      var pushGateway = _ref3.pushGateway;
      var device = _ref3.device;
      var channel = _ref3.channel;

      var payload = { operation: 'remove', pushGateway: pushGateway, device: device, channel: channel };
      return this.__provisionDevice(payload);
    }
  }, {
    key: '__provisionDevice',
    value: function __provisionDevice(_ref4) {
      var _this = this;

      var operation = _ref4.operation;
      var pushGateway = _ref4.pushGateway;
      var device = _ref4.device;
      var channel = _ref4.channel;

      var q = _Q2.default.defer();

      checkParam(device, 'Missing Device ID (device)').then(checkParam(pushGateway, 'Missing GW Type (pushGateway: gcm or apns)')).then(checkParam(operation, 'Missing GW Operation (operation: add or remove)')).then(checkParam(channel, 'Missing gw destination Channel (channel)')).then(checkParam(this._networking.validateSubscribeKey(), 'Missing Subscribe Key')).then(checkParam(this._networking.validatePublishKey(), 'Missing Publish Key')).fail(function (error) {
        q.reject(_this._r.validationError(error));
      });

      return q.promise;

      /*
      let data: Object = {
        type: pushGateway
      };
       switch (operation) {
        case 'add': data.add = channel; break;
        case 'remove': data.remove = channel; break;
        default:
      }
       this._networking.provisionDeviceForPush(device, data)
        .then((response) => q.resolve(this._r.callback(response)))
        .fail((response) => q.fail(this._r.error(response)));
      });
      */
    }
  }, {
    key: 'createNotification',
    value: function createNotification() {
      // return callback;
    }
  }]);

  return _class;
}();

exports.default = _class;