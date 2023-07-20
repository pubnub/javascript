"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var proxy_agent_1 = require("proxy-agent");
function default_1(superagent) {
    var Request = superagent.Request;
    Request.prototype.proxy = proxy;
    return superagent;
}
exports.default = default_1;
function proxy(proxyConfiguration) {
    var agent = new proxy_agent_1.ProxyAgent(proxyConfiguration);
    if (agent)
        this.agent(agent);
    return this;
}
