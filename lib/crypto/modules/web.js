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

function concatArrayBuffer(ab1, ab2) {
  var tmp = new Uint8Array(ab1.byteLength + ab2.byteLength);
  tmp.set(new Uint8Array(ab1), 0);
  tmp.set(new Uint8Array(ab2), ab1.byteLength);
  return tmp.buffer;
}

var WebCryptography = function () {
  function WebCryptography() {
    (0, _classCallCheck2["default"])(this, WebCryptography);
  }

  (0, _createClass2["default"])(WebCryptography, [{
    key: "algo",
    get: function get() {
      return 'aes-256-cbc';
    }
  }, {
    key: "encrypt",
    value: function () {
      var _encrypt = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee(key, input) {
        var cKey;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.getKey(key);

              case 2:
                cKey = _context.sent;

                if (!(input instanceof ArrayBuffer)) {
                  _context.next = 7;
                  break;
                }

                return _context.abrupt("return", this.encryptArrayBuffer(cKey, input));

              case 7:
                if (!(typeof input === 'string')) {
                  _context.next = 11;
                  break;
                }

                return _context.abrupt("return", this.encryptString(cKey, input));

              case 11:
                throw new Error('Cannot encrypt this file. In browsers file encryption supports only string or ArrayBuffer');

              case 12:
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
        var cKey;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.getKey(key);

              case 2:
                cKey = _context2.sent;

                if (!(input instanceof ArrayBuffer)) {
                  _context2.next = 7;
                  break;
                }

                return _context2.abrupt("return", this.decryptArrayBuffer(cKey, input));

              case 7:
                if (!(typeof input === 'string')) {
                  _context2.next = 11;
                  break;
                }

                return _context2.abrupt("return", this.decryptString(cKey, input));

              case 11:
                throw new Error('Cannot decrypt this file. In browsers file decryption supports only string or ArrayBuffer');

              case 12:
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
        var bKey, abPlaindata, abCipherdata;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.getKey(key);

              case 2:
                bKey = _context3.sent;
                _context3.next = 5;
                return file.toArrayBuffer();

              case 5:
                abPlaindata = _context3.sent;
                _context3.next = 8;
                return this.encryptArrayBuffer(bKey, abPlaindata);

              case 8:
                abCipherdata = _context3.sent;
                return _context3.abrupt("return", File.create({
                  name: file.name,
                  mimeType: 'application/octet-stream',
                  data: abCipherdata
                }));

              case 10:
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
        var bKey, abCipherdata, abPlaindata;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.getKey(key);

              case 2:
                bKey = _context4.sent;
                _context4.next = 5;
                return file.toArrayBuffer();

              case 5:
                abCipherdata = _context4.sent;
                _context4.next = 8;
                return this.decryptArrayBuffer(bKey, abCipherdata);

              case 8:
                abPlaindata = _context4.sent;
                return _context4.abrupt("return", File.create({
                  name: file.name,
                  data: abPlaindata
                }));

              case 10:
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
    value: function () {
      var _getKey = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee5(key) {
        var bKey, abHash, abKey;
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                bKey = Buffer.from(key);
                _context5.next = 3;
                return crypto.subtle.digest('SHA-256', bKey.buffer);

              case 3:
                abHash = _context5.sent;
                abKey = Buffer.from(Buffer.from(abHash).toString('hex').slice(0, 32), 'utf8').buffer;
                return _context5.abrupt("return", crypto.subtle.importKey('raw', abKey, 'AES-CBC', true, ['encrypt', 'decrypt']));

              case 6:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function getKey(_x11) {
        return _getKey.apply(this, arguments);
      }

      return getKey;
    }()
  }, {
    key: "encryptArrayBuffer",
    value: function () {
      var _encryptArrayBuffer = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee6(key, plaintext) {
        var abIv;
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                abIv = crypto.getRandomValues(new Uint8Array(16));
                _context6.t0 = concatArrayBuffer;
                _context6.t1 = abIv.buffer;
                _context6.next = 5;
                return crypto.subtle.encrypt({
                  name: 'AES-CBC',
                  iv: abIv
                }, key, plaintext);

              case 5:
                _context6.t2 = _context6.sent;
                return _context6.abrupt("return", (0, _context6.t0)(_context6.t1, _context6.t2));

              case 7:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      function encryptArrayBuffer(_x12, _x13) {
        return _encryptArrayBuffer.apply(this, arguments);
      }

      return encryptArrayBuffer;
    }()
  }, {
    key: "decryptArrayBuffer",
    value: function () {
      var _decryptArrayBuffer = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee7(key, ciphertext) {
        var abIv;
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                abIv = ciphertext.slice(0, 16);
                return _context7.abrupt("return", crypto.subtle.decrypt({
                  name: 'AES-CBC',
                  iv: abIv
                }, key, ciphertext.slice(16)));

              case 2:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }));

      function decryptArrayBuffer(_x14, _x15) {
        return _decryptArrayBuffer.apply(this, arguments);
      }

      return decryptArrayBuffer;
    }()
  }, {
    key: "encryptString",
    value: function () {
      var _encryptString = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee8(key, plaintext) {
        var abIv, abPlaintext, abPayload, ciphertext;
        return _regenerator["default"].wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                abIv = crypto.getRandomValues(new Uint8Array(16));
                abPlaintext = Buffer.from(plaintext).buffer;
                _context8.next = 4;
                return crypto.subtle.encrypt({
                  name: 'AES-CBC',
                  iv: abIv
                }, key, abPlaintext);

              case 4:
                abPayload = _context8.sent;
                ciphertext = concatArrayBuffer(abIv.buffer, abPayload);
                return _context8.abrupt("return", Buffer.from(ciphertext).toString('utf8'));

              case 7:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8);
      }));

      function encryptString(_x16, _x17) {
        return _encryptString.apply(this, arguments);
      }

      return encryptString;
    }()
  }, {
    key: "decryptString",
    value: function () {
      var _decryptString = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee9(key, ciphertext) {
        var abCiphertext, abIv, abPayload, abPlaintext;
        return _regenerator["default"].wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                abCiphertext = Buffer.from(ciphertext);
                abIv = abCiphertext.slice(0, 16);
                abPayload = abCiphertext.slice(16);
                _context9.next = 5;
                return crypto.subtle.decrypt({
                  name: 'AES-CBC',
                  iv: abIv
                }, key, abPayload);

              case 5:
                abPlaintext = _context9.sent;
                return _context9.abrupt("return", Buffer.from(abPlaintext).toString('utf8'));

              case 7:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9);
      }));

      function decryptString(_x18, _x19) {
        return _decryptString.apply(this, arguments);
      }

      return decryptString;
    }()
  }]);
  return WebCryptography;
}();

exports["default"] = WebCryptography;
(0, _defineProperty2["default"])(WebCryptography, "IV_LENGTH", 16);
module.exports = exports.default;
//# sourceMappingURL=web.js.map
