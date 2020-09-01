"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.postfile = postfile;
exports.getfile = getfile;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _superagent = _interopRequireDefault(require("superagent"));

var _flow_interfaces = require("../../core/flow_interfaces");

var _webNode = require("./web-node");

function postfileuri(_x, _x2, _x3) {
  return _postfileuri.apply(this, arguments);
}

function _postfileuri() {
  _postfileuri = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee(url, fields, fileInput) {
    var formData, result;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            formData = new FormData();
            fields.forEach(function (_ref) {
              var key = _ref.key,
                  value = _ref.value;
              formData.append(key, value);
            });
            formData.append('file', fileInput);
            _context.next = 5;
            return fetch(url, {
              method: 'POST',
              body: formData
            });

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
  return _postfileuri.apply(this, arguments);
}

function postfile(_x4, _x5, _x6) {
  return _postfile.apply(this, arguments);
}

function _postfile() {
  _postfile = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee2(url, fields, fileInput) {
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (fileInput.uri) {
              _context2.next = 4;
              break;
            }

            return _context2.abrupt("return", (0, _webNode.postfile)(url, fields, fileInput));

          case 4:
            return _context2.abrupt("return", postfileuri(url, fields, fileInput));

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _postfile.apply(this, arguments);
}

function getfile(params, endpoint, callback) {
  var superagentConstruct = _superagent["default"].get(this.getStandardOrigin() + endpoint.url).set(endpoint.headers).query(params);

  return _webNode.xdr.call(this, superagentConstruct, endpoint, callback);
}
//# sourceMappingURL=react_native.js.map
