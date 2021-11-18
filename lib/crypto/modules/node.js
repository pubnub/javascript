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

var _crypto = require("crypto");

var NodeCryptography = function () {
  function NodeCryptography() {
    (0, _classCallCheck2["default"])(this, NodeCryptography);
  }

  (0, _createClass2["default"])(NodeCryptography, [{
    key: "algo",
    get: function get() {
      return 'aes-256-cbc';
    }
  }, {
    key: "encrypt",
    value: function () {
      var _encrypt = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee(key, input) {
        var bKey;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                bKey = this.getKey(key);

                if (!(input instanceof Buffer)) {
                  _context.next = 5;
                  break;
                }

                return _context.abrupt("return", this.encryptBuffer(bKey, input));

              case 5:
                if (!(input instanceof _stream.Readable)) {
                  _context.next = 9;
                  break;
                }

                return _context.abrupt("return", this.encryptStream(bKey, input));

              case 9:
                if (!(typeof input === 'string')) {
                  _context.next = 13;
                  break;
                }

                return _context.abrupt("return", this.encryptString(bKey, input));

              case 13:
                throw new Error('Unsupported input format');

              case 14:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function encrypt(_x, _x2) {
        return _encrypt.apply(this, arguments);
      }

      return encrypt;
    }()
  }, {
    key: "decrypt",
    value: function () {
      var _decrypt = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee2(key, input) {
        var bKey;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                bKey = this.getKey(key);

                if (!(input instanceof Buffer)) {
                  _context2.next = 5;
                  break;
                }

                return _context2.abrupt("return", this.decryptBuffer(bKey, input));

              case 5:
                if (!(input instanceof _stream.Readable)) {
                  _context2.next = 9;
                  break;
                }

                return _context2.abrupt("return", this.decryptStream(bKey, input));

              case 9:
                if (!(typeof input === 'string')) {
                  _context2.next = 13;
                  break;
                }

                return _context2.abrupt("return", this.decryptString(bKey, input));

              case 13:
                throw new Error('Unsupported input format');

              case 14:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function decrypt(_x3, _x4) {
        return _decrypt.apply(this, arguments);
      }

      return decrypt;
    }()
  }, {
    key: "encryptFile",
    value: function () {
      var _encryptFile = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee3(key, file, File) {
        var bKey;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                bKey = this.getKey(key);

                if (!(file.data instanceof Buffer)) {
                  _context3.next = 11;
                  break;
                }

                _context3.t0 = File;
                _context3.t1 = file.name;
                _context3.next = 6;
                return this.encryptBuffer(bKey, file.data);

              case 6:
                _context3.t2 = _context3.sent;
                _context3.t3 = {
                  name: _context3.t1,
                  mimeType: 'application/octet-stream',
                  data: _context3.t2
                };
                return _context3.abrupt("return", _context3.t0.create.call(_context3.t0, _context3.t3));

              case 11:
                if (!(file.data instanceof _stream.Readable)) {
                  _context3.next = 21;
                  break;
                }

                _context3.t4 = File;
                _context3.t5 = file.name;
                _context3.next = 16;
                return this.encryptStream(bKey, file.data);

              case 16:
                _context3.t6 = _context3.sent;
                _context3.t7 = {
                  name: _context3.t5,
                  mimeType: 'application/octet-stream',
                  stream: _context3.t6
                };
                return _context3.abrupt("return", _context3.t4.create.call(_context3.t4, _context3.t7));

              case 21:
                throw new Error('Cannot encrypt this file. In Node.js file encryption supports only string, Buffer or Stream.');

              case 22:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function encryptFile(_x5, _x6, _x7) {
        return _encryptFile.apply(this, arguments);
      }

      return encryptFile;
    }()
  }, {
    key: "decryptFile",
    value: function () {
      var _decryptFile = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee4(key, file, File) {
        var bKey;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                bKey = this.getKey(key);

                if (!(file.data instanceof Buffer)) {
                  _context4.next = 11;
                  break;
                }

                _context4.t0 = File;
                _context4.t1 = file.name;
                _context4.next = 6;
                return this.decryptBuffer(bKey, file.data);

              case 6:
                _context4.t2 = _context4.sent;
                _context4.t3 = {
                  name: _context4.t1,
                  data: _context4.t2
                };
                return _context4.abrupt("return", _context4.t0.create.call(_context4.t0, _context4.t3));

              case 11:
                if (!(file.data instanceof _stream.Readable)) {
                  _context4.next = 21;
                  break;
                }

                _context4.t4 = File;
                _context4.t5 = file.name;
                _context4.next = 16;
                return this.decryptStream(bKey, file.data);

              case 16:
                _context4.t6 = _context4.sent;
                _context4.t7 = {
                  name: _context4.t5,
                  stream: _context4.t6
                };
                return _context4.abrupt("return", _context4.t4.create.call(_context4.t4, _context4.t7));

              case 21:
                throw new Error('Cannot decrypt this file. In Node.js file decryption supports only string, Buffer or Stream.');

              case 22:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function decryptFile(_x8, _x9, _x10) {
        return _decryptFile.apply(this, arguments);
      }

      return decryptFile;
    }()
  }, {
    key: "getKey",
    value: function getKey(key) {
      var sha = (0, _crypto.createHash)('sha256');
      sha.update(Buffer.from(key, 'utf8'));
      return Buffer.from(sha.digest('hex').slice(0, 32), 'utf8');
    }
  }, {
    key: "getIv",
    value: function getIv() {
      return (0, _crypto.randomBytes)(NodeCryptography.IV_LENGTH);
    }
  }, {
    key: "encryptString",
    value: function encryptString(key, plaintext) {
      var bIv = this.getIv();
      var bPlaintext = Buffer.from(plaintext);
      var aes = (0, _crypto.createCipheriv)(this.algo, key, bIv);
      return Buffer.concat([bIv, aes.update(bPlaintext), aes["final"]()]).toString('utf8');
    }
  }, {
    key: "decryptString",
    value: function decryptString(key, sCiphertext) {
      var ciphertext = Buffer.from(sCiphertext);
      var bIv = ciphertext.slice(0, NodeCryptography.IV_LENGTH);
      var bCiphertext = ciphertext.slice(NodeCryptography.IV_LENGTH);
      var aes = (0, _crypto.createDecipheriv)(this.algo, key, bIv);
      return Buffer.concat([aes.update(bCiphertext), aes["final"]()]).toString('utf8');
    }
  }, {
    key: "encryptBuffer",
    value: function encryptBuffer(key, plaintext) {
      var bIv = this.getIv();
      var aes = (0, _crypto.createCipheriv)(this.algo, key, bIv);
      return Buffer.concat([bIv, aes.update(plaintext), aes["final"]()]);
    }
  }, {
    key: "decryptBuffer",
    value: function decryptBuffer(key, ciphertext) {
      var bIv = ciphertext.slice(0, NodeCryptography.IV_LENGTH);
      var bCiphertext = ciphertext.slice(NodeCryptography.IV_LENGTH);
      var aes = (0, _crypto.createDecipheriv)(this.algo, key, bIv);
      return Buffer.concat([aes.update(bCiphertext), aes["final"]()]);
    }
  }, {
    key: "encryptStream",
    value: function encryptStream(key, stream) {
      var output = new _stream.PassThrough();
      var bIv = this.getIv();
      var aes = (0, _crypto.createCipheriv)(this.algo, key, bIv);
      output.write(bIv);
      stream.pipe(aes).pipe(output);
      return output;
    }
  }, {
    key: "decryptStream",
    value: function decryptStream(key, stream) {
      var _this = this;

      var output = new _stream.PassThrough();
      var bIv = Buffer.alloc(0);
      var aes = null;

      var getIv = function getIv() {
        var data = stream.read();

        while (data !== null) {
          if (data) {
            var bChunk = Buffer.from(data);
            var sliceLen = NodeCryptography.IV_LENGTH - bIv.byteLength;

            if (bChunk.byteLength < sliceLen) {
              bIv = Buffer.concat([bIv, bChunk]);
            } else {
              bIv = Buffer.concat([bIv, bChunk.slice(0, sliceLen)]);
              aes = (0, _crypto.createDecipheriv)(_this.algo, key, bIv);
              aes.pipe(output);
              aes.write(bChunk.slice(sliceLen));
            }
          }

          data = stream.read();
        }
      };

      stream.on('readable', getIv);
      stream.on('end', function () {
        if (aes) {
          aes.end();
        }

        output.end();
      });
      return output;
    }
  }]);
  return NodeCryptography;
}();

exports["default"] = NodeCryptography;
(0, _defineProperty2["default"])(NodeCryptography, "IV_LENGTH", 16);
module.exports = exports.default;
//# sourceMappingURL=node.js.map
