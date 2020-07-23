"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _file = require("../core/components/file");

var _class, _temp;

var PubNubFile = (_temp = _class = function () {
  (0, _createClass2["default"])(PubNubFile, null, [{
    key: "create",
    value: function create(config) {
      return new this(config);
    }
  }]);

  function PubNubFile(config) {
    (0, _classCallCheck2["default"])(this, PubNubFile);
    (0, _defineProperty2["default"])(this, "input", void 0);
    (0, _defineProperty2["default"])(this, "inputType", void 0);
    (0, _defineProperty2["default"])(this, "name", void 0);
    (0, _defineProperty2["default"])(this, "mimeType", void 0);

    if (config instanceof File) {
      this.input = config;
      this.inputType = 'file';
      this.name = this.input.name;
      this.mimeType = this.input.type;
    } else if (config.response) {
      var _ref, _config$response$name;

      this.input = new File([config.response.text], (_ref = (_config$response$name = config.response.name) !== null && _config$response$name !== void 0 ? _config$response$name : config.name) !== null && _ref !== void 0 ? _ref : '', {
        type: config.response.type
      });
      this.inputType = 'file';
      this.name = this.input.name;
      this.mimeType = this.input.type;
    } else if (config.data) {
      this.input = new File([config.data], config.name, {
        type: config.mimeType
      });
      this.inputType = 'file';
      this.name = config.name;
      this.mimeType = config.mimeType;
    }

    if (this.input === undefined) {
      throw new Error("Couldn't construct a file out of supplied options.");
    }

    if (this.name === undefined) {
      throw new Error("Couldn't guess filename out of the options. Please provide one.");
    }
  }

  (0, _createClass2["default"])(PubNubFile, [{
    key: "toBuffer",
    value: function () {
      var _toBuffer = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee() {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                throw new Error('This feature is only supported in Node.js environments.');

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function toBuffer() {
        return _toBuffer.apply(this, arguments);
      }

      return toBuffer;
    }()
  }, {
    key: "toStream",
    value: function () {
      var _toStream = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee2() {
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                throw new Error('This feature is only supported in Node.js environments.');

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function toStream() {
        return _toStream.apply(this, arguments);
      }

      return toStream;
    }()
  }, {
    key: "toString",
    value: function () {
      var _toString = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee3() {
        var _this = this;

        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt("return", new Promise(function (resolve, reject) {
                  var reader = new FileReader();
                  reader.addEventListener('load', function () {
                    if (typeof reader.result === 'string') {
                      return resolve(reader.result);
                    }
                  });
                  reader.addEventListener('error', function () {
                    reject(reader.error);
                  });
                  reader.readAsText(_this.input);
                }));

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function toString() {
        return _toString.apply(this, arguments);
      }

      return toString;
    }()
  }, {
    key: "toFile",
    value: function () {
      var _toFile = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee4() {
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                return _context4.abrupt("return", this.input);

              case 1:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function toFile() {
        return _toFile.apply(this, arguments);
      }

      return toFile;
    }()
  }]);
  return PubNubFile;
}(), (0, _defineProperty2["default"])(_class, "supportsFile", typeof File !== 'undefined'), (0, _defineProperty2["default"])(_class, "supportsBuffer", false), (0, _defineProperty2["default"])(_class, "supportsStream", false), (0, _defineProperty2["default"])(_class, "supportsString", true), _temp);
var _default = PubNubFile;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=file.js.map
