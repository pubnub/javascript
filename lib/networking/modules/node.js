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

(0, _superagentProxy2.default)(_superagent2.default);

function proxy(superagentConstruct) {
  return superagentConstruct.proxy(this._config.proxy);
}

function keepAlive(superagentConstruct) {
  var AgentClass = null;
  var agent = null;

  if (this._config.secure) {
    AgentClass = _agentkeepalive2.default.HttpsAgent;
  } else {
    AgentClass = _agentkeepalive2.default;
  }

  if (this._config.keepAliveSettings) {
    agent = new AgentClass(this._config.keepAliveSettings);
  } else {
    agent = new AgentClass();
  }

  return superagentConstruct.agent(agent);
}
//# sourceMappingURL=node.js.map
