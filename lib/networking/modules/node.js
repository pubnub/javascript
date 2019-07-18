"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.proxy = proxy;
exports.keepAlive = keepAlive;

var _superagent = _interopRequireDefault(require("superagent"));

var _superagentProxy = _interopRequireDefault(require("superagent-proxy"));

var _agentkeepalive = _interopRequireDefault(require("agentkeepalive"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var keepAliveAgent = null;
var keepAliveSecureAgent = null;
(0, _superagentProxy["default"])(_superagent["default"]);

function proxy(superagentConstruct) {
  return superagentConstruct.proxy(this._config.proxy);
}

function keepAlive(superagentConstruct) {
  var agent = this._config.secure ? keepAliveSecureAgent : keepAliveAgent;

  if (agent === null) {
    var AgentClass = this._config.secure ? _agentkeepalive["default"].HttpsAgent : _agentkeepalive["default"];
    agent = new AgentClass(this._config.keepAliveSettings);

    if (this._config.secure) {
      keepAliveSecureAgent = agent;
    } else {
      keepAliveAgent = agent;
    }
  }

  return superagentConstruct.agent(agent);
}
//# sourceMappingURL=node.js.map
