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

var _stream = require("stream");

var _fs = require("fs");

var _path = require("path");

var _ = require("../");

var _class, _temp;

var PubNubFile = (_temp = _class = function () {
  function PubNubFile(_ref) {
    var stream = _ref.stream,
        data = _ref.data,
        encoding = _ref.encoding,
        name = _ref.name,
        mimeType = _ref.mimeType;
    (0, _classCallCheck2["default"])(this, PubNubFile);
    (0, _defineProperty2["default"])(this, "data", void 0);
    (0, _defineProperty2["default"])(this, "name", void 0);
    (0, _defineProperty2["default"])(this, "mimeType", void 0);

    if (stream instanceof _stream.Readable) {
      this.data = stream;

      if (stream instanceof _fs.ReadStream) {
        this.name = (0, _path.basename)(stream.path);
      }
    } else if (data instanceof Buffer) {
      this.data = Buffer.from(data);
    } else if (typeof data === 'string') {
      this.data = Buffer.from(data, encoding !== null && encoding !== void 0 ? encoding : 'utf8');
    }

    if (name) {
      this.name = (0, _path.basename)(name);
    }

    if (mimeType) {
      this.mimeType = mimeType;
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
    value: function toBuffer() {
      if (this.data instanceof Buffer) {
        return Promise.resolve(Buffer.from(this.data));
      }

      if (this.data instanceof _stream.Readable) {
        var stream = this.data;
        return new Promise(function (resolve, reject) {
          var chunks = [];
          stream.on('data', function (chunk) {
            return chunks.push(chunk);
          });
          stream.once('error', reject);
          stream.once('end', function () {
            resolve(Buffer.concat(chunks));
          });
        });
      }

      if (typeof this.data === 'string') {
        return Promise.resolve(Buffer.from(this.data));
      }

      throw new Error("Can't cast to 'buffer'.");
    }
  }, {
    key: "toArrayBuffer",
    value: function () {
      var _toArrayBuffer = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee() {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                throw new Error('This feature is only supported in browser environments.');

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function toArrayBuffer() {
        return _toArrayBuffer.apply(this, arguments);
      }

      return toArrayBuffer;
    }()
  }, {
    key: "toString",
    value: function () {
      var _toString = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee2() {
        var encoding,
            buffer,
            _args2 = arguments;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                encoding = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : 'utf8';
                _context2.next = 3;
                return this.toBuffer();

              case 3:
                buffer = _context2.sent;
                return _context2.abrupt("return", buffer.toString(encoding));

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function toString() {
        return _toString.apply(this, arguments);
      }

      return toString;
    }()
  }, {
    key: "toStream",
    value: function () {
      var _toStream = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee3() {
        var input, stream;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (this.data instanceof _stream.Readable) {
                  _context3.next = 3;
                  break;
                }

                input = this.data;
                return _context3.abrupt("return", new _stream.Readable({
                  read: function read() {
                    this.push(Buffer.from(input));
                    this.push(null);
                  }
                }));

              case 3:
                stream = new _stream.PassThrough();

                if (this.data instanceof _stream.Readable) {
                  this.data.pipe(stream);
                }

                return _context3.abrupt("return", stream);

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function toStream() {
        return _toStream.apply(this, arguments);
      }

      return toStream;
    }()
  }, {
    key: "toFile",
    value: function () {
      var _toFile = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee4() {
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                throw new Error('This feature is only supported in browser environments.');

              case 1:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      function toFile() {
        return _toFile.apply(this, arguments);
      }

      return toFile;
    }()
  }, {
    key: "toFileUri",
    value: function () {
      var _toFileUri = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee5() {
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                throw new Error('This feature is only supported in react native environments.');

              case 1:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function toFileUri() {
        return _toFileUri.apply(this, arguments);
      }

      return toFileUri;
    }()
  }, {
    key: "toBlob",
    value: function () {
      var _toBlob = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee6() {
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                throw new Error('This feature is only supported in browser environments.');

              case 1:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      function toBlob() {
        return _toBlob.apply(this, arguments);
      }

      return toBlob;
    }()
  }], [{
    key: "create",
    value: function create(config) {
      return new this(config);
    }
  }]);
  return PubNubFile;
}(), (0, _defineProperty2["default"])(_class, "supportsBlob", false), (0, _defineProperty2["default"])(_class, "supportsFile", false), (0, _defineProperty2["default"])(_class, "supportsBuffer", typeof Buffer !== 'undefined'), (0, _defineProperty2["default"])(_class, "supportsStream", true), (0, _defineProperty2["default"])(_class, "supportsString", true), (0, _defineProperty2["default"])(_class, "supportsArrayBuffer", false), (0, _defineProperty2["default"])(_class, "supportsEncryptFile", true), (0, _defineProperty2["default"])(_class, "supportsFileUri", false), _temp);
var _default = PubNubFile;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=node.js.map
