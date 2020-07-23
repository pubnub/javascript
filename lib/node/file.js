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

var _mimeTypes = require("mime-types");

var _stream = require("stream");

var _fs = require("fs");

var _path = require("path");

var _file = require("../core/components/file");

var _class, _temp;

var PubNubFile = (_temp = _class = function () {
  (0, _createClass2["default"])(PubNubFile, [{
    key: "toBuffer",
    value: function toBuffer() {
      if (this.input instanceof Buffer) {
        return Promise.resolve(Buffer.from(this.input));
      }

      if (this.input instanceof _stream.Readable) {
        var stream = this.input;
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

      if (typeof this.input === 'string') {
        return Promise.resolve(Buffer.from(this.input));
      }

      throw new Error("Can't cast to 'buffer'.");
    }
  }, {
    key: "toString",
    value: function () {
      var _toString = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee() {
        var encoding,
            buffer,
            _args = arguments;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                encoding = _args.length > 0 && _args[0] !== undefined ? _args[0] : 'utf8';
                _context.next = 3;
                return this.toBuffer();

              case 3:
                buffer = _context.sent;
                return _context.abrupt("return", buffer.toString(encoding));

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function toString() {
        return _toString.apply(this, arguments);
      }

      return toString;
    }()
  }, {
    key: "toStream",
    value: function () {
      var _toStream = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee2() {
        var stream;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(this.inputType !== 'stream')) {
                  _context2.next = 2;
                  break;
                }

                throw new Error("Can't cast from '".concat(this.inputType, "' to 'stream'."));

              case 2:
                stream = new _stream.PassThrough();

                if (this.input instanceof _stream.Readable) {
                  this.input.pipe(stream);
                }

                return _context2.abrupt("return", stream);

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function toStream() {
        return _toStream.apply(this, arguments);
      }

      return toStream;
    }()
  }, {
    key: "toFile",
    value: function () {
      var _toFile = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee3() {
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                throw new Error('This feature is only supported in browser environments.');

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function toFile() {
        return _toFile.apply(this, arguments);
      }

      return toFile;
    }()
  }], [{
    key: "create",
    value: function create(config) {
      return new this(config);
    }
  }]);

  function PubNubFile(_ref) {
    var stream = _ref.stream,
        buffer = _ref.buffer,
        data = _ref.data,
        encoding = _ref.encoding,
        name = _ref.name,
        mimeType = _ref.mimeType;
    (0, _classCallCheck2["default"])(this, PubNubFile);
    (0, _defineProperty2["default"])(this, "input", void 0);
    (0, _defineProperty2["default"])(this, "inputType", void 0);
    (0, _defineProperty2["default"])(this, "name", void 0);
    (0, _defineProperty2["default"])(this, "mimeType", void 0);

    if (stream instanceof _stream.Readable) {
      if (stream instanceof _fs.ReadStream) {
        this.name = (0, _path.basename)(stream.path);
        this.mimeType = (0, _mimeTypes.lookup)(stream.path);
      }

      this.inputType = 'stream';
      this.input = stream;
    }

    if (buffer instanceof Buffer) {
      this.inputType = 'buffer';
      this.input = buffer;
    }

    if (typeof data === 'string') {
      this.inputType = 'buffer';
      this.input = Buffer.from(data, encoding !== null && encoding !== void 0 ? encoding : 'utf8');
    }

    if (name) {
      this.name = (0, _path.basename)(name);
      this.mimeType = (0, _mimeTypes.lookup)(name);
    }

    if (mimeType) {
      this.mimeType = mimeType;
    }

    if (this.input === undefined) {
      throw new Error("Couldn't construct a file out of supplied options.");
    }

    if (this.name === undefined) {
      throw new Error("Couldn't guess filename out of the options. Please provide one.");
    }
  }

  return PubNubFile;
}(), (0, _defineProperty2["default"])(_class, "supportsFile", false), (0, _defineProperty2["default"])(_class, "supportsBuffer", typeof Buffer !== 'undefined'), (0, _defineProperty2["default"])(_class, "supportsStream", true), (0, _defineProperty2["default"])(_class, "supportsString", true), _temp);
var _default = PubNubFile;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=file.js.map
