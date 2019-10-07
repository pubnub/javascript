"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.get = get;
exports.post = post;
exports.patch = patch;
exports.del = del;

var _superagent = _interopRequireDefault(require("superagent"));

var _flow_interfaces = require("../../core/flow_interfaces");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
  logger.log("[".concat(timestamp, "]"), '\n', req.url, '\n', req.qs);
  logger.log('-----');
  req.on('response', function (res) {
    var now = new Date().getTime();
    var elapsed = now - start;
    var timestampDone = new Date().toISOString();
    logger.log('>>>>>>');
    logger.log("[".concat(timestampDone, " / ").concat(elapsed, "]"), '\n', req.url, '\n', req.qs, '\n', res.text);
    logger.log('-----');
  });
}

function xdr(superagentConstruct, endpoint, callback) {
  var _this = this;

  if (this._config.logVerbosity) {
    superagentConstruct = superagentConstruct.use(log);
  }

  if (this._config.proxy && this._modules.proxy) {
    superagentConstruct = this._modules.proxy.call(this, superagentConstruct);
  }

  if (this._config.keepAlive && this._modules.keepAlive) {
    superagentConstruct = this._modules.keepAlive(superagentConstruct);
  }

  return superagentConstruct.timeout(endpoint.timeout).end(function (err, resp) {
    var parsedResponse;
    var status = {};
    status.error = err !== null;
    status.operation = endpoint.operation;

    if (resp && resp.status) {
      status.statusCode = resp.status;
    }

    if (err) {
      if (err.response && err.response.text && !_this._config.logVerbosity) {
        try {
          status.errorData = JSON.parse(err.response.text);
        } catch (e) {
          status.errorData = err;
        }
      } else {
        status.errorData = err;
      }

      status.category = _this._detectErrorCategory(err);
      return callback(status, null);
    }

    try {
      parsedResponse = JSON.parse(resp.text);
    } catch (e) {
      status.errorData = resp;
      status.error = true;
      return callback(status, null);
    }

    if (parsedResponse.error && parsedResponse.error === 1 && parsedResponse.status && parsedResponse.message && parsedResponse.service) {
      status.errorData = parsedResponse;
      status.statusCode = parsedResponse.status;
      status.error = true;
      status.category = _this._detectErrorCategory(status);
      return callback(status, null);
    } else if (parsedResponse.error && parsedResponse.error.message) {
      status.errorData = parsedResponse.error;
    }

    return callback(status, parsedResponse);
  });
}

function get(params, endpoint, callback) {
  var superagentConstruct = _superagent["default"].get(this.getStandardOrigin() + endpoint.url).set(endpoint.headers).query(params);

  return xdr.call(this, superagentConstruct, endpoint, callback);
}

function post(params, body, endpoint, callback) {
  var superagentConstruct = _superagent["default"].post(this.getStandardOrigin() + endpoint.url).query(params).set(endpoint.headers).send(body);

  return xdr.call(this, superagentConstruct, endpoint, callback);
}

function patch(params, body, endpoint, callback) {
  var superagentConstruct = _superagent["default"].patch(this.getStandardOrigin() + endpoint.url).query(params).set(endpoint.headers).send(body);

  return xdr.call(this, superagentConstruct, endpoint, callback);
}

function del(params, endpoint, callback) {
  var superagentConstruct = _superagent["default"]["delete"](this.getStandardOrigin() + endpoint.url).set(endpoint.headers).query(params);

  return xdr.call(this, superagentConstruct, endpoint, callback);
}
//# sourceMappingURL=web-node.js.map
