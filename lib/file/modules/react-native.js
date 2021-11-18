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

var _ = require("../");

var _class, _temp;

var PubNubFile = (_temp = _class = function () {
  function PubNubFile(config) {
    (0, _classCallCheck2["default"])(this, PubNubFile);
    (0, _defineProperty2["default"])(this, "data", void 0);
    (0, _defineProperty2["default"])(this, "name", void 0);
    (0, _defineProperty2["default"])(this, "mimeType", void 0);

    if (config instanceof File) {
      this.data = config;
      this.name = this.data.name;
      this.mimeType = this.data.type;
    } else if (config.uri) {
      this.data = {
        uri: config.uri,
        name: config.name,
        type: config.mimeType
      };
      this.name = config.name;

      if (config.mimeType) {
        this.mimeType = config.mimeType;
      }
    } else if (config.data) {
      this.data = config.data;
      this.name = config.name;

      if (config.mimeType) {
        this.mimeType = config.mimeType;
      }
    } else {
      throw new Error("Couldn't construct a file out of supplied options. URI or file data required.");
    }

    if (this.data === undefined) {
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
    key: "toBlob",
    value: function () {
      var _toBlob = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee3() {
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!(this.data && this.data.uri)) {
                  _context3.next = 4;
                  break;
                }

                throw new Error('This file contains a file URI and does not contain the file contents.');

              case 4:
                if (!(this.data instanceof File)) {
                  _context3.next = 8;
                  break;
                }

                return _context3.abrupt("return", this.data);

              case 8:
                return _context3.abrupt("return", this.data.blob());

              case 9:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function toBlob() {
        return _toBlob.apply(this, arguments);
      }

      return toBlob;
    }()
  }, {
    key: "toArrayBuffer",
    value: function () {
      var _toArrayBuffer = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee4() {
        var _this = this;

        var result;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!(this.data && this.data.uri)) {
                  _context4.next = 4;
                  break;
                }

                throw new Error('This file contains a file URI and does not contain the file contents.');

              case 4:
                if (!(this.data instanceof File)) {
                  _context4.next = 8;
                  break;
                }

                return _context4.abrupt("return", new Promise(function (resolve, reject) {
                  var reader = new FileReader();
                  reader.addEventListener('load', function () {
                    if (reader.result instanceof ArrayBuffer) {
                      return resolve(reader.result);
                    }
                  });
                  reader.addEventListener('error', function () {
                    reject(reader.error);
                  });
                  reader.readAsArrayBuffer(_this.data);
                }));

              case 8:
                _context4.prev = 8;
                _context4.next = 11;
                return this.data.arrayBuffer();

              case 11:
                result = _context4.sent;
                _context4.next = 17;
                break;

              case 14:
                _context4.prev = 14;
                _context4.t0 = _context4["catch"](8);
                throw new Error("Unable to support toArrayBuffer in ReactNative environment: ".concat(_context4.t0));

              case 17:
                return _context4.abrupt("return", result);

              case 18:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[8, 14]]);
      }));

      function toArrayBuffer() {
        return _toArrayBuffer.apply(this, arguments);
      }

      return toArrayBuffer;
    }()
  }, {
    key: "toString",
    value: function () {
      var _toString = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee5() {
        var _this2 = this;

        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (!(this.data && this.data.uri)) {
                  _context5.next = 4;
                  break;
                }

                return _context5.abrupt("return", JSON.stringify(this.data));

              case 4:
                if (!(this.data instanceof File)) {
                  _context5.next = 8;
                  break;
                }

                return _context5.abrupt("return", new Promise(function (resolve, reject) {
                  var reader = new FileReader();
                  reader.addEventListener('load', function () {
                    if (typeof reader.result === 'string') {
                      return resolve(reader.result);
                    }
                  });
                  reader.addEventListener('error', function () {
                    reject(reader.error);
                  });
                  reader.readAsBinaryString(_this2.data);
                }));

              case 8:
                return _context5.abrupt("return", this.data.text());

              case 9:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function toString() {
        return _toString.apply(this, arguments);
      }

      return toString;
    }()
  }, {
    key: "toFile",
    value: function () {
      var _toFile = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee6() {
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (!this.data.uri) {
                  _context6.next = 4;
                  break;
                }

                throw new Error('This file contains a file URI and does not contain the file contents.');

              case 4:
                if (!(this.data instanceof File)) {
                  _context6.next = 8;
                  break;
                }

                return _context6.abrupt("return", this.data);

              case 8:
                return _context6.abrupt("return", this.data.blob());

              case 9:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function toFile() {
        return _toFile.apply(this, arguments);
      }

      return toFile;
    }()
  }, {
    key: "toFileUri",
    value: function () {
      var _toFileUri = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee7() {
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                if (!(this.data && this.data.uri)) {
                  _context7.next = 4;
                  break;
                }

                return _context7.abrupt("return", this.data);

              case 4:
                throw new Error('This file does not contain a file URI');

              case 5:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function toFileUri() {
        return _toFileUri.apply(this, arguments);
      }

      return toFileUri;
    }()
  }], [{
    key: "create",
    value: function create(config) {
      return new this(config);
    }
  }]);
  return PubNubFile;
}(), (0, _defineProperty2["default"])(_class, "supportsFile", typeof File !== 'undefined'), (0, _defineProperty2["default"])(_class, "supportsBlob", typeof Blob !== 'undefined'), (0, _defineProperty2["default"])(_class, "supportsArrayBuffer", typeof ArrayBuffer !== 'undefined'), (0, _defineProperty2["default"])(_class, "supportsBuffer", false), (0, _defineProperty2["default"])(_class, "supportsStream", false), (0, _defineProperty2["default"])(_class, "supportsString", true), (0, _defineProperty2["default"])(_class, "supportsEncryptFile", false), (0, _defineProperty2["default"])(_class, "supportsFileUri", true), _temp);
var _default = PubNubFile;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=react-native.js.map
