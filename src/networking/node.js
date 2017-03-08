/* @flow */
import AgentKeepAlive from 'agentkeepalive';
import Networking from './base';

function agentKeepAlive(superagentConstruct) {
  let AgentClass = null;
  let agent = null;

  if (this._config.secure) {
    AgentClass = AgentKeepAlive.HttpsAgent;
  } else {
    AgentClass = AgentKeepAlive;
  }

  if (this._config.keepAliveSettings) {
    agent = new AgentClass(this._config.keepAliveSettings);
  } else {
    agent = new AgentClass();
  }

  return superagentConstruct.agent(agent);
}

export default class extends Networking {

  constructor() {
    super({ agentKeepAliveModule: agentKeepAlive });
  }
}
