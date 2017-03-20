/* @flow */
/* global window */

import superagent from 'superagent';
import superagentProxy from 'superagent-proxy';
import AgentKeepAlive from 'agentkeepalive';

superagentProxy(superagent);

export function proxy(superagentConstruct: superagent) {
  return superagentConstruct.proxy(this._config.proxy);
}

export function keepAlive(superagentConstruct: superagent) {
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
