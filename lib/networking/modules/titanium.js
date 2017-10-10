'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.get = get;
exports.post = post;
exports.del = del;

var _flow_interfaces = require('../../core/flow_interfaces');

var _utils = require('../utils');

function log(url, qs, res) {
  var _pickLogger = function _pickLogger() {
    if (Ti && Ti.API && Ti.API.log) return Ti.API;
    if (window && window.console && window.console.log) return window.console;
    return console;
  };

  var start = new Date().getTime();
  var timestamp = new Date().toISOString();
  var logger = _pickLogger();
  logger.log('<<<<<');
  logger.log('[' + timestamp + ']', '\n', url, '\n', qs);
  logger.log('-----');

  var now = new Date().getTime();
  var elapsed = now - start;
  var timestampDone = new Date().toISOString();

  logger.log('>>>>>>');
  logger.log('[' + timestampDone + ' / ' + elapsed + ']', '\n', url, '\n', qs, '\n', res);
  logger.log('-----');
}

function getHttpClient() {
  if (Ti.Platform.osname === 'mobileweb') {
    return new XMLHttpRequest();
  } else {
    return Ti.Network.createHTTPClient();
  }
}

function keepAlive(xhr) {
  if (Ti.Platform.osname !== 'mobileweb' && this._config.keepAlive) {
    xhr.enableKeepAlive = true;
  }
}

function xdr(xhr, method, url, params, body, endpoint, callback) {
  var _this = this;

  var status = {};
  status.operation = endpoint.operation;

  xhr.open(method, (0, _utils.buildUrl)(url, params), true);

  keepAlive.call(this, xhr);

  xhr.onload = function () {
    status.error = false;

    if (xhr.status) {
      status.statusCode = xhr.status;
    }

    var resp = JSON.parse(xhr.responseText);

    if (_this._config.logVerbosity) {
      log(url, params, xhr.responseText);
    }

    return callback(status, resp);
  };

  xhr.onerror = function (e) {
    status.error = true;
    status.errorData = e.error;
    status.category = _this._detectErrorCategory(e.error);
    return callback(status, null);
  };

  xhr.timeout = Ti.Platform.osname === 'android' ? 2147483647 : Infinity;

  xhr.send(body);
}

function get(params, endpoint, callback) {
  var xhr = getHttpClient();

  var url = this.getStandardOrigin() + endpoint.url;

  return xdr.call(this, xhr, 'GET', url, params, {}, endpoint, callback);
}

function post(params, body, endpoint, callback) {
  var xhr = getHttpClient();

  var url = this.getStandardOrigin() + endpoint.url;

  return xdr.call(this, xhr, 'POST', url, params, JSON.parse(body), endpoint, callback);
}

function del(params, endpoint, callback) {
  var xhr = getHttpClient();

  var url = this.getStandardOrigin() + endpoint.url;

  return xdr.call(this, xhr, 'DELETE', url, params, {}, endpoint, callback);
}
//# sourceMappingURL=titanium.js.map
