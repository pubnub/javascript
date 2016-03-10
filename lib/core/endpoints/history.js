'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('../components/networking');

var _networking2 = _interopRequireDefault(_networking);

var _keychain = require('../components/keychain');

var _keychain2 = _interopRequireDefault(_keychain);

var _responders = require('../presenters/responders');

var _responders2 = _interopRequireDefault(_responders);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var networking = _ref.networking;
    var keychain = _ref.keychain;
    var error = _ref.error;
    var decrypt = _ref.decrypt;

    _classCallCheck(this, _class);

    this._networking = networking;
    this._keychain = keychain;
    this._error = error;
    this._decrypt = decrypt;
  }

  _createClass(_class, [{
    key: 'fetchHistory',
    value: function fetchHistory(args, argumentCallback) {
      var _this = this;

      var callback = args.callback || argumentCallback;
      var count = args.count || args.limit || 100;
      var reverse = args.reverse || 'false';
      var err = args.error || function () {};
      var auth_key = args.auth_key || this._keychain.getAuthKey();
      var cipher_key = args.cipher_key;
      var channel = args.channel;
      var channel_group = args.channel_group;
      var start = args.start;
      var end = args.end;
      var include_token = args.include_token;
      var string_msg_token = args.string_message_token || false;

      // Make sure we have a Channel
      if (!channel && !channel_group) return this._error('Missing Channel');
      if (!callback) return this._error('Missing Callback');
      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');

      var params = {
        stringtoken: 'true',
        count: count,
        reverse: reverse,
        auth: auth_key
      };

      if (channel_group) {
        params['channel-group'] = channel_group;
        if (!channel) {
          channel = ',';
        }
      }

      if (start) params.start = start;
      if (end) params.end = end;
      if (include_token) params.include_token = 'true';
      if (string_msg_token) params.string_message_token = 'true';

      // Send Message
      this._networking.fetchHistory(channel, {
        data: this._networking.prepareParams(params),
        success: function success(response) {
          _this._handleHistoryResponse(response, err, callback, include_token, cipher_key);
        },
        fail: function fail(response) {
          _responders2.default.error(response, err);
        }
      });
    }
  }, {
    key: '_handleHistoryResponse',
    value: function _handleHistoryResponse(response, err, callback, include_token, cipher_key) {
      if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object' && response.error) {
        err({ message: response.message, payload: response.payload });
        return;
      }
      var messages = response[0];
      var decrypted_messages = [];
      for (var a = 0; a < messages.length; a++) {
        if (include_token) {
          var new_message = this._decrypt(messages[a].message, cipher_key);
          var timetoken = messages[a].timetoken;
          try {
            decrypted_messages.push({ message: JSON.parse(new_message), timetoken: timetoken });
          } catch (e) {
            decrypted_messages.push({ message: new_message, timetoken: timetoken });
          }
        } else {
          var _new_message = this._decrypt(messages[a], cipher_key);
          try {
            decrypted_messages.push(JSON.parse(_new_message));
          } catch (e) {
            decrypted_messages.push(_new_message);
          }
        }
      }
      callback([decrypted_messages, response[1], response[2]]);
    }
  }]);

  return _class;
}();

exports.default = _class;