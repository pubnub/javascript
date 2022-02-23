/*       */
/* global XMLHttpRequest, Ti */

import { EndpointDefinition, StatusAnnouncement } from '../../core/flow_interfaces';
import { buildUrl } from '../utils';

function log(url, qs, res) {
  const _pickLogger = () => {
    if (Ti && Ti.API && Ti.API.log) return Ti.API;
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
  logger.log('-----');
}

function getHttpClient() {
  if (Ti.Platform.osname === 'mobileweb') {
    return new XMLHttpRequest();
  }
  return Ti.Network.createHTTPClient();
}

function keepAlive(xhr) {
  if (Ti.Platform.osname !== 'mobileweb' && this._config.keepAlive) {
    xhr.enableKeepAlive = true;
  }
}

function xdr(xhr, method, url, params, body, endpoint, callback) {
  const status = {};
  status.operation = endpoint.operation;

  xhr.open(method, buildUrl(url, params), true);

  keepAlive.call(this, xhr);

  xhr.onload = () => {
    status.error = false;

    if (xhr.status) {
      status.statusCode = xhr.status;
    }

    const resp = JSON.parse(xhr.responseText);

    if (this._config.logVerbosity) {
      log(url, params, xhr.responseText);
    }

    return callback(status, resp);
  };

  xhr.onerror = (e) => {
    status.error = true;
    status.errorData = e.error;
    status.category = this._detectErrorCategory(e.error);
    return callback(status, null);
  };

  xhr.timeout = Ti.Platform.osname === 'android' ? 2147483647 : Infinity;

  xhr.send(body);
}

export function get(params, endpoint, callback) {
  const xhr = getHttpClient();

  const url = this.getStandardOrigin() + endpoint.url;

  return xdr.call(this, xhr, 'GET', url, params, {}, endpoint, callback);
}

export function post(params, body, endpoint, callback) {
  const xhr = getHttpClient();

  const url = this.getStandardOrigin() + endpoint.url;

  return xdr.call(this, xhr, 'POST', url, params, JSON.parse(body), endpoint, callback);
}

export function patch(params, body, endpoint, callback) {
  const xhr = getHttpClient();

  const url = this.getStandardOrigin() + endpoint.url;

  return xdr.call(this, xhr, 'PATCH', url, params, JSON.parse(body), endpoint, callback);
}

export function del(params, endpoint, callback) {
  const xhr = getHttpClient();

  const url = this.getStandardOrigin() + endpoint.url;

  return xdr.call(this, xhr, 'DELETE', url, params, {}, endpoint, callback);
}
