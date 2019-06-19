'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.get = get;
exports.post = post;
exports.del = del;

var _http = require('http');

var _flow_interfaces = require('../../core/flow_interfaces');

var _utils = require('../utils');

function log(url, qs, res) {
  var _pickLogger = function _pickLogger() {
    if (console && console.log) return console;
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

function xdr(method, url, params, body, endpoint, callback) {
  var _this = this;

  var status = {};
  status.operation = endpoint.operation;

  var httpConfig = {
    method: method,
    url: (0, _utils.buildUrl)(url, params),
    timeout: endpoint.timeout,
    content: body
  };

  return (0, _http.request)(httpConfig).then(function (response) {
    status.error = false;

    if (response.statusCode) {
      status.statusCode = response.statusCode;
    }

    return response.content.toJSON();
  }).then(function (response) {
    var resp = response;

    if (_this._config.logVerbosity) {
      log(url, params, resp);
    }

    callback(status, resp);
  }).catch(function (e) {
    status.error = true;
    status.errorData = e;
    status.category = _this._detectErrorCategory(e);
    callback(status, null);
  });
}

function get(params, endpoint, callback) {
  var url = this.getStandardOrigin() + endpoint.url;
  return xdr.call(this, 'GET', url, params, null, endpoint, callback);
}

function post(params, body, endpoint, callback) {
  var url = this.getStandardOrigin() + endpoint.url;
  return xdr.call(this, 'POST', url, params, body, endpoint, callback);
}

function del(params, endpoint, callback) {
  var url = this.getStandardOrigin() + endpoint.url;
  return xdr.call(this, 'DELETE', url, params, null, endpoint, callback);
}
//# sourceMappingURL=nativescript.js.map
