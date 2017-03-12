/* @flow */
/* global window */

import superagent from 'superagent';
import superagentProxy from 'superagent-proxy';
import AgentKeepAlive from 'agentkeepalive';
import { EndpointDefinition, StatusAnnouncement } from '../../core/flow_interfaces';

superagentProxy(superagent);

function log(req: Object) {
  let _pickLogger = () => {
    if (console && console.log) return console; // eslint-disable-line no-console
    if (window && window.console && window.console.log) return window.console;
    return console;
  };

  let start = new Date().getTime();
  let timestamp = new Date().toISOString();
  let logger = _pickLogger();
  logger.log('<<<<<');                                               // eslint-disable-line no-console
  logger.log(`[${timestamp}]`, '\n', req.url, '\n', req.qs);    // eslint-disable-line no-console
  logger.log('-----');                                               // eslint-disable-line no-console

  req.on('response', (res) => {
    let now = new Date().getTime();
    let elapsed = now - start;
    let timestampDone = new Date().toISOString();

    logger.log('>>>>>>');                                                                                  // eslint-disable-line no-console
    logger.log(`[${timestampDone} / ${elapsed}]`, '\n', req.url, '\n', req.qs, '\n', res.text);  // eslint-disable-line no-console
    logger.log('-----');                                                                                   // eslint-disable-line no-console
  });
}

function xdr(superagentConstruct: superagent, endpoint: EndpointDefinition, callback: Function): Object {
  if (this._config.logVerbosity) {
    superagentConstruct = superagentConstruct.use(log);
  }

  if (this._config.proxy && this._modules.proxy) {
    superagentConstruct = this._modules.proxy.call(this, superagentConstruct);
  }

  if (this._config.keepAlive && this._modules.keepAlive) {
    superagentConstruct = this._module.keepAlive(superagentConstruct);
  }

  return superagentConstruct
      .timeout(endpoint.timeout)
      .end((err, resp) => {
        let status: StatusAnnouncement = {};
        status.error = err !== null;
        status.operation = endpoint.operation;

        if (resp && resp.status) {
          status.statusCode = resp.status;
        }

        if (err) {
          status.errorData = err;
          status.category = this._detectErrorCategory(err);
          return callback(status, null);
        }

        let parsedResponse = JSON.parse(resp.text);
        return callback(status, parsedResponse);
      });
}

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

export function get(params: Object, endpoint: EndpointDefinition, callback: Function): superagent {
  let superagentConstruct = superagent
    .get(this.getStandardOrigin() + endpoint.url)
    .query(params);
  return xdr.call(this, superagentConstruct, endpoint, callback);
}

export function post(params: Object, body: string, endpoint: EndpointDefinition, callback: Function): superagent {
  let superagentConstruct = superagent
    .post(this.getStandardOrigin() + endpoint.url)
    .query(params)
    .send(body);
  return xdr.call(this, superagentConstruct, endpoint, callback);
}
