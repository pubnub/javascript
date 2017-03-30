/* @flow */
/* global Ti, XMLHttpRequest, window, console */

import { EndpointDefinition, StatusAnnouncement } from '../../core/flow_interfaces';

declare var Ti: any;

function log(url, qs, res) {
  let _pickLogger = () => {
    if (Ti && Ti.API && Ti.API.log) return Ti.API; // eslint-disable-line no-console
    if (window && window.console && window.console.log) return window.console;
    return console;
  };

  let start = new Date().getTime();
  let timestamp = new Date().toISOString();
  let logger = _pickLogger();
  logger.log('<<<<<');                                               // eslint-disable-line no-console
  logger.log(`[${timestamp}]`, '\n', url, '\n', qs);    // eslint-disable-line no-console
  logger.log('-----');                                               // eslint-disable-line no-console

  let now = new Date().getTime();
  let elapsed = now - start;
  let timestampDone = new Date().toISOString();

  logger.log('>>>>>>');                                                                                  // eslint-disable-line no-console
  logger.log(`[${timestampDone} / ${elapsed}]`, '\n', url, '\n', qs, '\n', res);  // eslint-disable-line no-console
  logger.log('-----');
}

function getHttpClient(): any {
  if (Ti.Platform.osname === 'mobileweb') {
    return new XMLHttpRequest();
  } else {
    return Ti.Network.createHTTPClient();
  }
}

function keepAlive(xhr: any): void {
  if (Ti.Platform.osname !== 'mobileweb' && this._config.keepAlive) {
    xhr.enableKeepAlive = true;
  }
}

function encodedKeyValuePair(pairs, key: string, value: Object): void {
  if (value != null) {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        encodedKeyValuePair(pairs, key, item);
      });
    } else if (typeof value === 'object') {
      Object.keys(value).forEach((subkey) => {
        encodedKeyValuePair(pairs, `${key}[${subkey}]`, value[subkey]);
      });
    } else {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  } else if (value === null) {
    pairs.push(encodeURIComponent(`${encodeURIComponent(key)}`));
  }
}

function buildUrl(url: string, params: Object) {
  let pairs = [];

  Object.keys(params).forEach((key) => {
    encodedKeyValuePair(pairs, key, params[key]);
  });

  return `${url}?${pairs.join('&')}`;
}

function xdr(xhr: any, method: string, url: string, params: Object, body: Object, endpoint: EndpointDefinition, callback: Function): void {
  let status: StatusAnnouncement = {};
  status.operation = endpoint.operation;

  xhr.open(method, buildUrl(url, params), true);

  keepAlive.call(this, xhr);

  xhr.onload = () => {
    status.error = false;

    if (xhr.status) {
      status.statusCode = xhr.status;
    }

    let resp = JSON.parse(xhr.responseText);

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

  xhr.timeout = Infinity;

  xhr.send(body);
}

export function get(params: Object, endpoint: EndpointDefinition, callback: Function) {
  let xhr = getHttpClient();

  let url = this.getStandardOrigin() + endpoint.url;

  return xdr.call(this, xhr, 'GET', url, params, {}, endpoint, callback);
}

export function post(params: Object, body: string, endpoint: EndpointDefinition, callback: Function) {
  let xhr = getHttpClient();

  let url = this.getStandardOrigin() + endpoint.url;

  return xdr.call(this, xhr, 'POST', url, params, JSON.parse(body), endpoint, callback);
}
