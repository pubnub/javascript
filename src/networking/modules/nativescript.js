/* @flow */
/* global console */

import { request as HttpRequest } from 'http';
import { EndpointDefinition, StatusAnnouncement } from '../../core/flow_interfaces';
import { buildUrl } from '../utils';

function log(url, qs, res) {
  let _pickLogger = () => {
    if (console && console.log) return console; // eslint-disable-line no-console
    return console;
  };

  let start = new Date().getTime();
  let timestamp = new Date().toISOString();
  let logger = _pickLogger();
  logger.log('<<<<<'); // eslint-disable-line no-console
  logger.log(`[${timestamp}]`, '\n', url, '\n', qs); // eslint-disable-line no-console
  logger.log('-----'); // eslint-disable-line no-console

  let now = new Date().getTime();
  let elapsed = now - start;
  let timestampDone = new Date().toISOString();

  logger.log('>>>>>>'); // eslint-disable-line no-console
  logger.log(`[${timestampDone} / ${elapsed}]`, '\n', url, '\n', qs, '\n', res); // eslint-disable-line no-console
  logger.log('-----'); // eslint-disable-line no-console
}

function xdr(method: string, url: string, params: Object, body: string, endpoint: EndpointDefinition, callback: Function): void {
  let status: StatusAnnouncement = {};
  status.operation = endpoint.operation;

  const httpConfig = {
    method,
    url: buildUrl(url, params),
    timeout: endpoint.timeout,
    content: body
  };

  // $FlowFixMe
  return HttpRequest(httpConfig).then((response) => {
    status.error = false;

    if (response.statusCode) {
      status.statusCode = response.statusCode;
    }

    return response.content.toJSON();
  }).then((response) => {
    let resp = response;

    if (this._config.logVerbosity) {
      log(url, params, resp);
    }

    callback(status, resp);
  }).catch((e) => {
    status.error = true;
    status.errorData = e;
    status.category = this._detectErrorCategory(e);
    callback(status, null);
  });
}

export function get(params: Object, endpoint: EndpointDefinition, callback: Function) {
  let url = this.getStandardOrigin() + endpoint.url;
  return xdr.call(this, 'GET', url, params, null, endpoint, callback);
}

export function post(params: Object, body: string, endpoint: EndpointDefinition, callback: Function) {
  let url = this.getStandardOrigin() + endpoint.url;
  return xdr.call(this, 'POST', url, params, body, endpoint, callback);
}

export function del(params: Object, endpoint: EndpointDefinition, callback: Function) {
  let url = this.getStandardOrigin() + endpoint.url;
  return xdr.call(this, 'DELETE', url, params, null, endpoint, callback);
}
