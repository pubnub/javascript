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

    _this._networking = networking;
    _this._config = config;
    return _this;
  }

  _createClass(_class, [{
    key: 'subscribe',
    value: function subscribe(args, callback) {
      var _args$channels = args.channels;
      var channels = _args$channels === undefined ? [] : _args$channels;
      var _args$channelGroups = args.channelGroups;
      var channelGroups = _args$channelGroups === undefined ? [] : _args$channelGroups;
      var timetoken = args.timetoken;
      var filterExpression = args.filterExpression;
      var region = args.region;

      var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
      var endpointConfig = {
        params: {
          authKey: { required: false },
          uuid: {},
          subscribeKey: { required: true }
        },
        timeout: this._config.getSubscribeTimeout(),
        url: '/v2/subscribe/' + this._config.subscribeKey + '/' + encodeURIComponent(stringifiedChannels) + '/0'
      };

      if (!this.validateEndpointConfig(endpointConfig)) {
        return;
      }

      var params = this.createBaseParams(endpointConfig);

      if (channelGroups.length > 0) {
        params['channel-group'] = encodeURIComponent(channelGroups.join(','));
      }

      if (filterExpression && filterExpression.length > 0) {
        params['filter-expr'] = encodeURIComponent(filterExpression);
      }

      if (timetoken) {
        params.tt = timetoken;
      }

      if (region) {
        params.tr = region;
      }

      return this._networking.GET(params, endpointConfig, function (status, payload) {
        if (status.error) return callback(status);

        var messages = [];

        payload.m.forEach(function (rawMessage) {
          var publishMetaData = {
            publishTimetoken: rawMessage.p.t,
            region: rawMessage.p.r
          };
          var parsedMessage = {
            shard: parseInt(rawMessage.a, 10),
            subscriptionMatch: rawMessage.b,
            channel: rawMessage.c,
            payload: rawMessage.d,
            flags: rawMessage.f,
            issuingClientId: rawMessage.i,
            subscribeKey: rawMessage.k,
            originationTimetoken: rawMessage.o,
            publishMetaData: publishMetaData
          };
          messages.push(parsedMessage);
        });

        var metadata = {
          timetoken: payload.t.t,
          region: payload.t.r
        };
        var response = { messages: messages, metadata: metadata };

        callback(status, response);
      });
    }
  }]);

  return _class;
}(_base2.default);

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=subscribe.js.map
