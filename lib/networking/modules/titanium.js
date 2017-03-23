'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.get = get;
exports.post = post;


function log(req) {
  var _pickLogger = function _pickLogger() {
    if (console && console.log) return console;
    if (window && window.console && window.console.log) return window.console;
    return console;
  };

  var start = new Date().getTime();
  var timestamp = new Date().toISOString();
  var logger = _pickLogger();
  logger.log('<<<<<');
  logger.log('[' + timestamp + ']', '\n', req.url, '\n', req.qs);
  logger.log('-----');

  req.on('response', function (res) {
    var now = new Date().getTime();
    var elapsed = now - start;
    var timestampDone = new Date().toISOString();

    logger.log('>>>>>>');
    logger.log('[' + timestampDone + ' / ' + elapsed + ']', '\n', req.url, '\n', req.qs, '\n', res.text);
    logger.log('-----');
  });
}

function xdr(xhr, body, endpoint, callback) {
  var status = {};
  status.operation = endpoint.operation;

  xhr.enableKeepAlive = this._config.keepAlive || false;

  xhr.onload = function (e) {
    status.error = false;

    if (resp && resp.status) {
      status.statusCode = resp.status;
    }

    return callback(status, JSON.parse(this.responseText));
  };

  xhr.onerror = function (e) {
    status.error = true;
    status.errorData = e.error;
    status.category = this._detectErrorCategory(e.error);
    return callback(status, null);
  };

  xhr.timeout = 5000;

  xhr.send(body);
}

function get(params, endpoint, callback) {
  var xhr = Ti.Network.createHTTPClient();

  xhr.open("GET", this.getStandardOrigin() + endpoint.url);

  return xdr.call(this, xhr, {}, endpoint, callback);
}

function post(params, body, endpoint, callback) {
  var xhr = Ti.Network.createHTTPClient();

  xhr.open("POST", this.getStandardOrigin() + endpoint.url);

  return xdr.call(this, xhr, JSON.parse(body), endpoint, callback);
}
//# sourceMappingURL=titanium.js.map
