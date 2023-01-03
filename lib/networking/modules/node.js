"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.keepAlive = exports.proxy = void 0;
var superagent_1 = __importDefault(require("superagent"));
var superagent_proxy_1 = __importDefault(require("superagent-proxy"));
var agentkeepalive_1 = __importDefault(require("agentkeepalive"));
var keepAliveAgent = null;
var keepAliveSecureAgent = null;
(0, superagent_proxy_1.default)(superagent_1.default);
function proxy(superagentConstruct) {
    return superagentConstruct.proxy(this._config.proxy);
}
exports.proxy = proxy;
function keepAlive(superagentConstruct) {
    var agent = this._config.secure ? keepAliveSecureAgent : keepAliveAgent;
    if (agent === null) {
        var AgentClass = this._config.secure ? agentkeepalive_1.default.HttpsAgent : agentkeepalive_1.default;
        agent = new AgentClass(this._config.keepAliveSettings);
        if (this._config.secure) {
            keepAliveSecureAgent = agent;
        }
        else {
            keepAliveAgent = agent;
        }
    }
    return superagentConstruct.agent(agent);
}
exports.keepAlive = keepAlive;
