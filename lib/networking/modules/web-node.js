'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.get = get;
exports.post = post;

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _flow_interfaces = require('../../core/flow_interfaces');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function xdr(superagentConstruct, endpoint, callback) {
  var _this = this;

  if (this._config.logVerbosity) {
    superagentConstruct = superagentConstruct.use(log);
  }

  if (this._config.proxy && this._modules.proxy) {
    superagentConstruct = this._modules.proxy.call(this, superagentConstruct);
  }

  if (this._config.keepAlive && this._modules.keepAlive) {
    superagentConstruct = this._module.keepAlive(superagentConstruct);
  }

  return superagentConstruct.timeout(endpoint.timeout).end(function (err, resp) {
    var status = {};
    status.error = err !== null;
    status.operation = endpoint.operation;

    if (resp && resp.status) {
      status.statusCode = resp.status;
    }

    if (err) {
      status.errorData = err;
      status.category = _this._detectErrorCategory(err);
      return callback(status, null);
    }

    var parsedResponse = JSON.parse(resp.text);
    return callback(status, parsedResponse);
  });
}

function get(params, endpoint, callback) {
  var superagentConstruct = _superagent2.default.get(this.getStandardOrigin() + endpoint.url).query(params);
  return xdr.call(this, superagentConstruct, endpoint, callback);
}

function post(params, body, endpoint, callback) {
  var superagentConstruct = _superagent2.default.post(this.getStandardOrigin() + endpoint.url).query(params).send(body);
  return xdr.call(this, superagentConstruct, endpoint, callback);
}
//# sourceMappingURL=web-node.js.map
