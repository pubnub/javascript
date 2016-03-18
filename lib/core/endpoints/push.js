'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('../components/networking');

var _networking2 = _interopRequireDefault(_networking);

var _publish_queue = require('../components/publish_queue');

var _publish_queue2 = _interopRequireDefault(_publish_queue);

var _responders = require('../presenters/responders');

var _responders2 = _interopRequireDefault(_responders);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// push notification destination.

var _class = function () {
  function _class(_ref) {
    var networking = _ref.networking;
    var publishQueue = _ref.publishQueue;

    _classCallCheck(this, _class);

    this._networking = networking;
    this._publishQueue = publishQueue;
    this._r = new _responders2.default('endpoints/push');
  }

  _createClass(_class, [{
    key: 'addDeviceToPushChannel',
    value: function addDeviceToPushChannel(args, callback) {
      var pushGateway = args.pushGateway;
      var device = args.device;
      var channel = args.channel;

      var payload = { operation: 'add', pushGateway: pushGateway, device: device, channel: channel };
      this.__provisionDevice(payload, callback);
    }
  }, {
    key: 'removeDeviceFromPushChannel',
    value: function removeDeviceFromPushChannel(args, callback) {
      var pushGateway = args.pushGateway;
      var device = args.device;
      var channel = args.channel;

      var payload = { operation: 'remove', pushGateway: pushGateway, device: device, channel: channel };
      this.__provisionDevice(payload, callback);
    }
  }, {
    key: 'send',
    value: function send(_ref2, callback) {
      var apns = _ref2.apns;
      var gcm = _ref2.gcm;
      var mpns = _ref2.mpns;
      var channel = _ref2.channel;

      var payload = {};
      var publishItem = this._publishQueue.newQueueable();

      if (!channel) {
        return callback(this._r.validationError('Missing Push Channel (channel)'));
      }

      if (!apns && !gcm && !mpns) {
        return callback(this._r.validationError('Missing Push Payload (apns, gcm, mpns)'));
      }

      if (apns) {
        payload.pn_apns = apns;
      }

      if (gcm) {
        payload.pn_gcm = gcm;
      }

      if (mpns) {
        payload.pn_mpns = mpns;
      }

      publishItem.payload = payload;
      publishItem.channel = channel;
      publishItem.params = {};
      publishItem.httpMethod = 'GET';
      publishItem.callback = callback;

      this._publishQueue.queueItem(publishItem);
    }
  }, {
    key: '__provisionDevice',
    value: function __provisionDevice(args, callback) {
      var operation = args.operation;
      var pushGateway = args.pushGateway;
      var device = args.device;
      var channel = args.channel;


      if (!device) {
        return callback(this._r.validationError('Missing Device ID (device)'));
      }

      if (!pushGateway) {
        return callback(this._r.validationError('Missing GW Type (pushGateway: gcm or apns)'));
      }

      if (!operation) {
        return callback(this._r.validationError('Missing GW Operation (operation: add or remove)'));
      }

      if (!channel) {
        return callback(this._r.validationError('Missing gw destination Channel (channel)'));
      }

      var data = {
        type: pushGateway
      };

      if (operation === 'add') {
        data.add = channel;
      } else if (operation === 'remove') {
        data.remove = channel;
      }

      this._networking.provisionDeviceForPush(device, data, callback);
    }
  }]);

  return _class;
}();

exports.default = _class;