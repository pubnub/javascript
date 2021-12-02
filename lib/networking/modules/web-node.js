"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.del = del;
exports.get = get;
exports.getfile = getfile;
exports.patch = patch;
exports.post = post;
exports.postfile = postfile;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _superagent = _interopRequireDefault(require("superagent"));

var _flow_interfaces = require("../../core/flow_interfaces");

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

  var sc = superagentConstruct;

  if (endpoint.forceBuffered === true) {
    if (typeof Blob === 'undefined') {
      sc = sc.buffer().responseType('arraybuffer');
    } else {
      sc = sc.responseType('arraybuffer');
    }
  } else if (endpoint.forceBuffered === false) {
    sc = sc.buffer(false);
  }

  sc = sc.timeout(endpoint.timeout);
  sc.end(function (err, resp) {
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

    if (endpoint.ignoreBody) {
      parsedResponse = {
        headers: resp.headers,
        redirects: resp.redirects,
        response: resp
      };
    } else {
      try {
        parsedResponse = JSON.parse(resp.text);
      } catch (e) {
        status.errorData = resp;
        status.error = true;
        return callback(status, null);
      }
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
  return sc;
}

function postfile(_x, _x2, _x3) {
  return _postfile.apply(this, arguments);
}

function _postfile() {
  _postfile = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee(url, fields, fileInput) {
    var agent, result;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            agent = _superagent["default"].post(url);
            fields.forEach(function (_ref) {
              var key = _ref.key,
                  value = _ref.value;
              agent = agent.field(key, value);
            });
            agent.attach('file', fileInput, {
              contentType: 'application/octet-stream'
            });
            _context.next = 5;
            return agent;

          case 5:
            result = _context.sent;
            return _context.abrupt("return", result);

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _postfile.apply(this, arguments);
}

function getfile(params, endpoint, callback) {
  var superagentConstruct = _superagent["default"].get(this.getStandardOrigin() + endpoint.url).set(endpoint.headers).query(params);

  return xdr.call(this, superagentConstruct, endpoint, callback);
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
