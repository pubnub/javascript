"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _config = _interopRequireDefault(require("../config"));

var _hmacSha = _interopRequireDefault(require("./hmac-sha256"));

function bufferToWordArray(b) {
  var wa = [];
  var i;

  for (i = 0; i < b.length; i += 1) {
    wa[i / 4 | 0] |= b[i] << 24 - 8 * i;
  }

  return _hmacSha["default"].lib.WordArray.create(wa, b.length);
}

var _default = function () {
  function _default(_ref) {
    var config = _ref.config;
    (0, _classCallCheck2["default"])(this, _default);
    (0, _defineProperty2["default"])(this, "_config", void 0);
    (0, _defineProperty2["default"])(this, "_iv", void 0);
    (0, _defineProperty2["default"])(this, "_allowedKeyEncodings", void 0);
    (0, _defineProperty2["default"])(this, "_allowedKeyLengths", void 0);
    (0, _defineProperty2["default"])(this, "_allowedModes", void 0);
    (0, _defineProperty2["default"])(this, "_defaultOptions", void 0);
    this._config = config;
    this._iv = '0123456789012345';
    this._allowedKeyEncodings = ['hex', 'utf8', 'base64', 'binary'];
    this._allowedKeyLengths = [128, 256];
    this._allowedModes = ['ecb', 'cbc'];
    this._defaultOptions = {
      encryptKey: true,
      keyEncoding: 'utf8',
      keyLength: 256,
      mode: 'cbc'
    };
  }

  (0, _createClass2["default"])(_default, [{
    key: "HMACSHA256",
    value: function HMACSHA256(data) {
      var hash = _hmacSha["default"].HmacSHA256(data, this._config.secretKey);

      return hash.toString(_hmacSha["default"].enc.Base64);
    }
  }, {
    key: "SHA256",
    value: function SHA256(s) {
      return _hmacSha["default"].SHA256(s).toString(_hmacSha["default"].enc.Hex);
    }
  }, {
    key: "_parseOptions",
    value: function _parseOptions(incomingOptions) {
      var options = incomingOptions || {};
      if (!options.hasOwnProperty('encryptKey')) options.encryptKey = this._defaultOptions.encryptKey;
      if (!options.hasOwnProperty('keyEncoding')) options.keyEncoding = this._defaultOptions.keyEncoding;
      if (!options.hasOwnProperty('keyLength')) options.keyLength = this._defaultOptions.keyLength;
      if (!options.hasOwnProperty('mode')) options.mode = this._defaultOptions.mode;

      if (this._allowedKeyEncodings.indexOf(options.keyEncoding.toLowerCase()) === -1) {
        options.keyEncoding = this._defaultOptions.keyEncoding;
      }

      if (this._allowedKeyLengths.indexOf(parseInt(options.keyLength, 10)) === -1) {
        options.keyLength = this._defaultOptions.keyLength;
      }

      if (this._allowedModes.indexOf(options.mode.toLowerCase()) === -1) {
        options.mode = this._defaultOptions.mode;
      }

      return options;
    }
  }, {
    key: "_decodeKey",
    value: function _decodeKey(key, options) {
      if (options.keyEncoding === 'base64') {
        return _hmacSha["default"].enc.Base64.parse(key);
      } else if (options.keyEncoding === 'hex') {
        return _hmacSha["default"].enc.Hex.parse(key);
      } else {
        return key;
      }
    }
  }, {
    key: "_getPaddedKey",
    value: function _getPaddedKey(key, options) {
      key = this._decodeKey(key, options);

      if (options.encryptKey) {
        return _hmacSha["default"].enc.Utf8.parse(this.SHA256(key).slice(0, 32));
      } else {
        return key;
      }
    }
  }, {
    key: "_getMode",
    value: function _getMode(options) {
      if (options.mode === 'ecb') {
        return _hmacSha["default"].mode.ECB;
      } else {
        return _hmacSha["default"].mode.CBC;
      }
    }
  }, {
    key: "_getIV",
    value: function _getIV(options) {
      return options.mode === 'cbc' ? _hmacSha["default"].enc.Utf8.parse(this._iv) : null;
    }
  }, {
    key: "_getRandomIV",
    value: function _getRandomIV() {
      return _hmacSha["default"].lib.WordArray.random(16);
    }
  }, {
    key: "encrypt",
    value: function encrypt(data, customCipherKey, options) {
      if (this._config.customEncrypt) {
        return this._config.customEncrypt(data);
      } else {
        return this.pnEncrypt(data, customCipherKey, options);
      }
    }
  }, {
    key: "decrypt",
    value: function decrypt(data, customCipherKey, options) {
      if (this._config.customDecrypt) {
        return this._config.customDecrypt(data);
      } else {
        return this.pnDecrypt(data, customCipherKey, options);
      }
    }
  }, {
    key: "pnEncrypt",
    value: function pnEncrypt(data, customCipherKey, options) {
      if (!customCipherKey && !this._config.cipherKey) return data;
      options = this._parseOptions(options);

      var mode = this._getMode(options);

      var cipherKey = this._getPaddedKey(customCipherKey || this._config.cipherKey, options);

      if (this._config.useRandomIVs) {
        var waIv = this._getRandomIV();

        var waPayload = _hmacSha["default"].AES.encrypt(data, cipherKey, {
          iv: waIv,
          mode: mode
        }).ciphertext;

        return waIv.clone().concat(waPayload.clone()).toString(_hmacSha["default"].enc.Base64);
      } else {
        var iv = this._getIV(options);

        var encryptedHexArray = _hmacSha["default"].AES.encrypt(data, cipherKey, {
          iv: iv,
          mode: mode
        }).ciphertext;

        var base64Encrypted = encryptedHexArray.toString(_hmacSha["default"].enc.Base64);
        return base64Encrypted || data;
      }
    }
  }, {
    key: "pnDecrypt",
    value: function pnDecrypt(data, customCipherKey, options) {
      if (!customCipherKey && !this._config.cipherKey) return data;
      options = this._parseOptions(options);

      var mode = this._getMode(options);

      var cipherKey = this._getPaddedKey(customCipherKey || this._config.cipherKey, options);

      if (this._config.useRandomIVs) {
        var ciphertext = Buffer.from(data, 'base64');
        var iv = bufferToWordArray(ciphertext.slice(0, 16));
        var payload = bufferToWordArray(ciphertext.slice(16));

        try {
          var plainJSON = _hmacSha["default"].AES.decrypt({
            ciphertext: payload
          }, cipherKey, {
            iv: iv,
            mode: mode
          }).toString(_hmacSha["default"].enc.Utf8);

          var plaintext = JSON.parse(plainJSON);
          return plaintext;
        } catch (e) {
          return null;
        }
      } else {
        var _iv = this._getIV(options);

        try {
          var _ciphertext = _hmacSha["default"].enc.Base64.parse(data);

          var _plainJSON = _hmacSha["default"].AES.decrypt({
            ciphertext: _ciphertext
          }, cipherKey, {
            iv: _iv,
            mode: mode
          }).toString(_hmacSha["default"].enc.Utf8);

          var _plaintext = JSON.parse(_plainJSON);

          return _plaintext;
        } catch (e) {
          return null;
        }
      }
    }
  }]);
  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=index.js.map
