'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _agentkeepalive = require('agentkeepalive');

var _agentkeepalive2 = _interopRequireDefault(_agentkeepalive);

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function agentKeepAlive(superagentConstruct) {
  var Agent = null;
  var agent = null;

  if (this._config.secure) {
    Agent = _agentkeepalive2.default.HttpsAgent;
  } else {
    Agent = _agentkeepalive2.default;
  }

  if (this._config.keepAliveSettings) {
    agent = new Agent(this._config.keepAliveSettings);
  } else {
    agent = new Agent();
  }

  return superagentConstruct.set('Connection', 'keep-alive').agent(agent);
}

var _class = function (_Networking) {
  _inherits(_class, _Networking);

  function _class() {
    _classCallCheck(this, _class);

    var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this));

    _this._agentKeepAlive = agentKeepAlive;
    return _this;
  }

  return _class;
}(_base2.default);

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=node.js.map
