'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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
    return _this;
  }

  _createClass(_class, [{
    key: 'publish',
    value: function publish(args, callback) {
      var message = args.message;
      var channel = args.channel;
      var meta = args.meta;
      var _args$sendByPost = args.sendByPost;
      var sendByPost = _args$sendByPost === undefined ? false : _args$sendByPost;
      var storeInHistory = args.storeInHistory;

      var endpointConfig = {
        params: {
          authKey: { required: false },
          subscribeKey: { required: true },
          publishKey: { required: true },
          uuid: { required: false }
        },
        url: '/publish/' + this.config.publishKey + '/' + this.config.subscribeKey + '/0/' + encodeURIComponent(channel) + '/0'
      };

      if (!message) return callback(this.createValidationError('Missing Message'));
      if (!channel) return callback(this.createValidationError('Missing Channel'));

      if (!this.validateEndpointConfig(endpointConfig)) {
        return;
      }

      var params = this.createBaseParams(endpointConfig);

      if (storeInHistory != null) {
        if (storeInHistory) {
          params.store = '1';
        } else {
          params.store = '0';
        }
      }

      if (meta && (typeof meta === 'undefined' ? 'undefined' : _typeof(meta)) === 'object') {
        params.meta = JSON.stringify(meta);
      }

      var onCallback = function onCallback(status, payload) {
        if (status.error) return callback(status);

        var response = {
          timetoken: payload[2]
        };

        callback(status, response);
      };

      var stringifiedPayload = JSON.stringify(message);

      if (this.config.cipherKey) {
        stringifiedPayload = this.crypto.encrypt(stringifiedPayload);
        stringifiedPayload = JSON.stringify(stringifiedPayload);
      }

      if (sendByPost) {
        this.networking.POST(params, stringifiedPayload, endpointConfig, onCallback);
      } else {
        endpointConfig.url += '/' + encodeURIComponent(stringifiedPayload);
        this.networking.GET(params, endpointConfig, onCallback);
      }
    }
  }]);

  return _class;
}(_base2.default);

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=publish.js.map
