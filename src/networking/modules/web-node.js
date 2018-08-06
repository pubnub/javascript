/* @flow */
/* global window */

import superagent from 'superagent';
import { EndpointDefinition, StatusAnnouncement } from '../../core/flow_interfaces';

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
    superagentConstruct = this._modules.keepAlive(superagentConstruct);
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
          if (err.response && err.response.text && !this._config.logVerbosity) {
            try {
              status.errorData = JSON.parse(err.response.text);
            } catch (e) {
              status.errorData = err;
            }
          } else {
            status.errorData = err;
          }
          status.category = this._detectErrorCategory(err);
          return callback(status, null);
        }

        let parsedResponse = JSON.parse(resp.text);

        if (parsedResponse.error && parsedResponse.error === 1 && parsedResponse.status && parsedResponse.message && parsedResponse.service) {
          status.errorData = parsedResponse;
          status.statusCode = parsedResponse.status;
          status.error = true;
          status.category = this._detectErrorCategory(status);
          return callback(status, null);
        }

        return callback(status, parsedResponse);
      });
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

export function del(params: Object, endpoint: EndpointDefinition, callback: Function): superagent {
  let superagentConstruct = superagent
    .delete(this.getStandardOrigin() + endpoint.url)
    .query(params);
  return xdr.call(this, superagentConstruct, endpoint, callback);
}
