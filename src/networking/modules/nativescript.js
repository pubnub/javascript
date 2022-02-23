/*       */

import { request as HttpRequest } from 'http';
import { EndpointDefinition, StatusAnnouncement } from '../../core/flow_interfaces';
import { buildUrl } from '../utils';

function log(url, qs, res) {
  const _pickLogger = () => {
    if (console && console.log) return console; // eslint-disable-line no-console
    return console;
  };

  const start = new Date().getTime();
  const timestamp = new Date().toISOString();
  const logger = _pickLogger();
  logger.log('<<<<<'); // eslint-disable-line no-console
  logger.log(`[${timestamp}]`, '\n', url, '\n', qs); // eslint-disable-line no-console
  logger.log('-----'); // eslint-disable-line no-console

  const now = new Date().getTime();
  const elapsed = now - start;
  const timestampDone = new Date().toISOString();

  logger.log('>>>>>>'); // eslint-disable-line no-console
  logger.log(`[${timestampDone} / ${elapsed}]`, '\n', url, '\n', qs, '\n', res); // eslint-disable-line no-console
  logger.log('-----'); // eslint-disable-line no-console
}

function xdr(method, url, params, body, endpoint, callback) {
  const status = {};
  status.operation = endpoint.operation;

  const httpConfig = {
    method,
    url: buildUrl(url, params),
    timeout: endpoint.timeout,
    content: body,
  };

  // $FlowFixMe
  return HttpRequest(httpConfig)
    .then((response) => {
      status.error = false;

      if (response.statusCode) {
        status.statusCode = response.statusCode;
      }

      return response.content.toJSON();
    })
    .then((response) => {
      const resp = response;

      if (this._config.logVerbosity) {
        log(url, params, resp);
      }

      callback(status, resp);
    })
    .catch((e) => {
      status.error = true;
      status.errorData = e;
      status.category = this._detectErrorCategory(e);
      callback(status, null);
    });
}

export function get(params, endpoint, callback) {
  const url = this.getStandardOrigin() + endpoint.url;
  return xdr.call(this, 'GET', url, params, '', endpoint, callback);
}

export function post(params, body, endpoint, callback) {
  const url = this.getStandardOrigin() + endpoint.url;
  return xdr.call(this, 'POST', url, params, body, endpoint, callback);
}

export function patch(params, body, endpoint, callback) {
  const url = this.getStandardOrigin() + endpoint.url;
  return xdr.call(this, 'PATCH', url, params, body, endpoint, callback);
}

export function del(params, endpoint, callback) {
  const url = this.getStandardOrigin() + endpoint.url;
  return xdr.call(this, 'DELETE', url, params, '', endpoint, callback);
}
