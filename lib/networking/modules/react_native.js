"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getfile = getfile;
exports.postfile = postfile;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _flow_interfaces = require("../../core/flow_interfaces");

var _webNode = require("./web-node");

function postfileuri(_x, _x2, _x3) {
  return _postfileuri.apply(this, arguments);
}

function _postfileuri() {
  _postfileuri = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee2(url, fields, fileInput) {
    var formData, result;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            formData = new FormData();
            fields.forEach(function (_ref2) {
              var key = _ref2.key,
                  value = _ref2.value;
              formData.append(key, value);
            });
            formData.append('file', fileInput);
            _context2.next = 5;
            return fetch(url, {
              method: 'POST',
              body: formData
            });

          case 5:
            result = _context2.sent;
            return _context2.abrupt("return", result);

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _postfileuri.apply(this, arguments);
}

function postfile(_x4, _x5, _x6) {
  return _postfile.apply(this, arguments);
}

function _postfile() {
  _postfile = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee3(url, fields, fileInput) {
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (fileInput.uri) {
              _context3.next = 4;
              break;
            }

            return _context3.abrupt("return", (0, _webNode.postfile)(url, fields, fileInput));

          case 4:
            return _context3.abrupt("return", postfileuri(url, fields, fileInput));

          case 5:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _postfile.apply(this, arguments);
}

function getfile(params, endpoint, callback) {
  var _this = this;

  var url = this.getStandardOrigin() + endpoint.url;

  if (params && Object.keys(params).length > 0) {
    var searchParams = new URLSearchParams(params);

    if (endpoint.url.indexOf('?') > -1) {
      url += '&';
    } else {
      url += '?';
    }

    url += searchParams.toString();
  }

  var fetchResult = fetch(url, {
    method: 'GET',
    headers: endpoint.headers
  });
  fetchResult.then(function () {
    var _ref = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee(resp) {
      var parsedResponse, status;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              status = {};
              status.error = false;
              status.operation = endpoint.operation;

              if (resp && resp.status) {
                status.statusCode = resp.status;
              }

              if (!endpoint.ignoreBody) {
                _context.next = 8;
                break;
              }

              parsedResponse = {
                headers: resp.headers,
                redirects: [],
                response: resp
              };
              _context.next = 21;
              break;

            case 8:
              _context.prev = 8;
              _context.t0 = JSON;
              _context.next = 12;
              return resp.text();

            case 12:
              _context.t1 = _context.sent;
              parsedResponse = _context.t0.parse.call(_context.t0, _context.t1);
              _context.next = 21;
              break;

            case 16:
              _context.prev = 16;
              _context.t2 = _context["catch"](8);
              status.errorData = resp;
              status.error = true;
              return _context.abrupt("return", callback(status, null));

            case 21:
              if (!(parsedResponse.error && parsedResponse.error === 1 && parsedResponse.status && parsedResponse.message && parsedResponse.service)) {
                _context.next = 29;
                break;
              }

              status.errorData = parsedResponse;
              status.statusCode = parsedResponse.status;
              status.error = true;
              status.category = _this._detectErrorCategory(status);
              return _context.abrupt("return", callback(status, null));

            case 29:
              if (parsedResponse.error && parsedResponse.error.message) {
                status.errorData = parsedResponse.error;
              }

            case 30:
              return _context.abrupt("return", callback(status, {
                response: {
                  body: resp
                }
              }));

            case 31:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[8, 16]]);
    }));

    return function (_x7) {
      return _ref.apply(this, arguments);
    };
  }());
  fetchResult["catch"](function (err) {
    var status = {};
    status.error = true;
    status.operation = endpoint.operation;

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
  });
  return fetchResult;
}
//# sourceMappingURL=react_native.js.map
