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
    var crypto = _ref.crypto;
    var config = _ref.config;

    _classCallCheck(this, _class);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, { config: config }));

    _this.networking = networking;
    _this.crypto = crypto;
    _this.config = config;
    return _this;
  }

  _createClass(_class, [{
    key: 'fetch',
    value: function fetch(args, callback) {
      var _this2 = this;

      var channel = args.channel;
      var start = args.start;
      var end = args.end;
      var includeTimetoken = args.includeTimetoken;
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

      if (!channel) return callback(this.createValidationError('Missing channel'));
      if (!callback) return this.log('Missing Callback');

      if (!this.validateEndpointConfig(endpointConfig)) {
        return;
      }

      var params = this.createBaseParams(endpointConfig);
      params.count = count;

      if (start) params.start = start;
      if (end) params.end = end;
      if (includeTimetoken != null) params.include_token = includeTimetoken.toString();
      if (reverse != null) params.reverse = reverse.toString();

      this.networking.GET(params, endpointConfig, function (status, payload) {
        if (status.error) return callback(status);

        callback(status, _this2._parseResponse(payload, includeTimetoken));
      });
    }
  }, {
    key: '_parseResponse',
    value: function _parseResponse(payload, includeTimetoken) {
      var _this3 = this;

      var response = {
        messages: [],
        startTimeToken: parseInt(payload[1], 10),
        endTimeToken: parseInt(payload[2], 10)
      };

      payload[0].forEach(function (serverHistoryItem) {
        var item = {
          timetoken: null,
          entry: null
        };

        if (includeTimetoken) {
          item.timetoken = serverHistoryItem.timetoken;
          item.entry = _this3.__processMessage(serverHistoryItem.message);
        } else {
          item.entry = _this3.__processMessage(serverHistoryItem);
        }

        response.messages.push(item);
      });

      return response;
    }
  }, {
    key: '__processMessage',
    value: function __processMessage(message) {
      if (!this.config.cipherKey) return message;

      try {
        return this.crypto.decrypt(message);
      } catch (e) {
        return message;
      }
    }
  }]);

  return _class;
}(_base2.default);

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=history.js.map
