'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.proxy = proxy;
exports.keepAlive = keepAlive;

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _superagentProxy = require('superagent-proxy');

var _superagentProxy2 = _interopRequireDefault(_superagentProxy);

var _agentkeepalive = require('agentkeepalive');

var _agentkeepalive2 = _interopRequireDefault(_agentkeepalive);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var keepAliveAgent = null;
var keepAliveSecureAgent = null;

(0, _superagentProxy2.default)(_superagent2.default);

function proxy(superagentConstruct) {
  return superagentConstruct.proxy(this._config.proxy);
}

function keepAlive(superagentConstruct) {
  var agent = this._config.secure ? keepAliveSecureAgent : keepAliveAgent;
  if (agent === null) {
    var AgentClass = this._config.secure ? _agentkeepalive2.default.HttpsAgent : _agentkeepalive2.default;
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
