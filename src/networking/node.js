/* @flow */
/* global window */
import AgentKeepAlive from 'agentkeepalive';
import Networking from './base';

function agentKeepAlive(superagentConstruct) {
  let Agent = null;
  let agent = null;

  if (this._config.secure) {
    Agent = AgentKeepAlive.HttpsAgent;
  } else {
    Agent = AgentKeepAlive;
  }

  if (this._config.keepAliveSettings) {
    agent = new Agent(this._config.keepAliveSettings);
  } else {
    agent = new Agent();
  }

  return superagentConstruct.set('Connection', 'keep-alive').agent(agent);
}

export default class extends Networking {

  constructor() {
    super();
    this._agentKeepAlive = agentKeepAlive;
  }
}
