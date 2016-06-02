'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('../components/networking');

var _networking2 = _interopRequireDefault(_networking);

var _config = require('../components/config');

var _config2 = _interopRequireDefault(_config);

var _index = require('../components/cryptography/index');

var _index2 = _interopRequireDefault(_index);

var _logger = require('../components/logger');

var _logger2 = _interopRequireDefault(_logger);

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
    var crypto = _ref.crypto;
    var config = _ref.config;

    _classCallCheck(this, _class);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, { config: config }));

    _this.networking = networking;
    _this.crypto = crypto;
    _this.config = config;
    _this._l = _logger2.default.getLogger('#endpoints/history');
    return _this;
  }

  _createClass(_class, [{
    key: 'fetch',
    value: function fetch(args, callback) {
      var channel = args.channel;
      var start = args.start;
      var end = args.end;
      var includeToken = args.includeToken;
      var reverse = args.reverse;
      var _args$count = args.count;
      var count = _args$count === undefined ? 100 : _args$count;


      var endpointConfig = {
        params: {
          authKey: { required: false },
          uuid: { required: false },
          subscribeKey: { required: true }
        },
        url: '/v2/history/sub-key/' + this.config.subscribeKey + '/channel/' + encodeURIComponent(channel)
      };

      if (!channel) return callback(this._r.validationError('Missing channel'));
      if (!callback) return this._l.error('Missing Callback');

      var params = { count: count, reverse: reverse, stringtoken: 'true' };

      if (start) params.start = start;
      if (end) params.end = end;
      if (includeToken != null) params.include_token = includeToken.toString();
      if (reverse != null) params.reverse = reverse.toString();

      this.networking.GET(params, endpointConfig, function (status, payload) {
        if (status.error) return callback(status);

        console.log(status, payload);
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
          var _decryptedMessage = _this2._crypto.decrypt(payload);
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
}(_base2.default);

exports.default = _class;
module.exports = exports['default'];