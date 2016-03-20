'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('../components/networking');

var _networking2 = _interopRequireDefault(_networking);

var _index = require('../components/cryptography/index');

var _index2 = _interopRequireDefault(_index);

var _responders = require('../presenters/responders');

var _responders2 = _interopRequireDefault(_responders);

var _logger = require('../components/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// TODO:
var _class = function () {
  function _class(_ref) {
    var networking = _ref.networking;
    var crypto = _ref.crypto;

    _classCallCheck(this, _class);

    this._networking = networking;
    this._crypto = crypto;
    this._r = new _responders2.default('#endpoints/history');
    this._l = _logger2.default.getLogger('#endpoints/history');
  }

  _createClass(_class, [{
    key: 'fetch',
    value: function fetch(args, callback) {
      var _this = this;

      var channel = args.channel;
      var channelGroup = args.channelGroup;
      var start = args.start;
      var end = args.end;
      var includeToken = args.includeToken;


      var count = args.count || args.limit || 100;
      var reverse = args.reverse || 'false';
      var stringMessageToken = args.stringMessageToken || false;

      if (!channel && !channelGroup) {
        return callback(this._r.validationError('Missing channel and/or channel group'));
      }

      if (!callback) {
        return this._l.error('Missing Callback');
      }

      var params = { count: count, reverse: reverse, stringtoken: 'true' };

      if (channelGroup) {
        params['channel-group'] = channelGroup;
        if (!channel) {
          channel = ',';
        }
      }

      if (start) params.start = start;
      if (end) params.end = end;
      if (includeToken) params.include_token = 'true';
      if (stringMessageToken) params.string_message_token = 'true';

      // Send Message
      this._networking.fetchHistory(channel, params, function (err, resp) {
        if (err) return callback(err, null);
        callback(null, _this._parseResponse(resp, includeToken));
      });
    }
  }, {
    key: '_parseResponse',
    value: function _parseResponse(response, includeToken) {
      var _this2 = this;

      var messages = response[0];
      var decryptedMessages = [];
      messages.forEach(function (payload) {
        if (includeToken) {
          var decryptedMessage = _this2._crypto.decrypt(payload.message);
          var timetoken = payload.timetoken;

          try {
            decryptedMessages.push({ timetoken: timetoken, message: JSON.parse(decryptedMessage) });
          } catch (e) {
            decryptedMessages.push({ timetoken: timetoken, message: decryptedMessage });
          }
        } else {
          var _decryptedMessage = _this2._crypto.decrypt(payload.message);
          try {
            decryptedMessages.push(JSON.parse(_decryptedMessage));
          } catch (e) {
            decryptedMessages.push(_decryptedMessage);
          }
        }
      });
      return [decryptedMessages, response[1], response[2]];
    }
  }]);

  return _class;
}();

exports.default = _class;