import superagent from 'superagent';
import superagentProxy from 'superagent-proxy';
import AgentKeepAlive from 'agentkeepalive';

let keepAliveAgent = null;
let keepAliveSecureAgent = null;

superagentProxy(superagent);

export function proxy(superagentConstruct) {
  return superagentConstruct.proxy(this._config.proxy);
}

export function keepAlive(superagentConstruct) {
  let agent = this._config.secure ? keepAliveSecureAgent : keepAliveAgent;
  if (agent === null) {
    const AgentClass = this._config.secure ? AgentKeepAlive.HttpsAgent : AgentKeepAlive;
    agent = new AgentClass(this._config.keepAliveSettings);
    if (this._config.secure) {
      keepAliveSecureAgent = agent;
    } else {
      keepAliveAgent = agent;
    }
  }

  return superagentConstruct.agent(agent);
}
