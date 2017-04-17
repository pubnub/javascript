'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _hmacSha = require('./hmac-sha256');

var _hmacSha2 = _interopRequireDefault(_hmacSha);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var config = _ref.config;

    _classCallCheck(this, _class);

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

  _createClass(_class, [{
    key: 'HMACSHA256',
    value: function HMACSHA256(data) {
      var hash = _hmacSha2.default.HmacSHA256(data, this._config.secretKey);
      return hash.toString(_hmacSha2.default.enc.Base64);
    }
  }, {
    key: 'SHA256',
    value: function SHA256(s) {
      return _hmacSha2.default.SHA256(s).toString(_hmacSha2.default.enc.Hex);
    }
  }, {
    key: '_parseOptions',
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
    key: '_decodeKey',
    value: function _decodeKey(key, options) {
      if (options.keyEncoding === 'base64') {
        return _hmacSha2.default.enc.Base64.parse(key);
      } else if (options.keyEncoding === 'hex') {
        return _hmacSha2.default.enc.Hex.parse(key);
      } else {
        return key;
      }
    }
  }, {
    key: '_getPaddedKey',
    value: function _getPaddedKey(key, options) {
      key = this._decodeKey(key, options);
      if (options.encryptKey) {
        return _hmacSha2.default.enc.Utf8.parse(this.SHA256(key).slice(0, 32));
      } else {
        return key;
      }
    }
  }, {
    key: '_getMode',
    value: function _getMode(options) {
      if (options.mode === 'ecb') {
        return _hmacSha2.default.mode.ECB;
      } else {
        return _hmacSha2.default.mode.CBC;
      }
    }
  }, {
    key: '_getIV',
    value: function _getIV(options) {
      return options.mode === 'cbc' ? _hmacSha2.default.enc.Utf8.parse(this._iv) : null;
    }
  }, {
    key: 'encrypt',
    value: function encrypt(data, customCipherKey, options) {
      if (this._config.customEncrypt) {
        return this._config.customEncrypt(data);
      } else {
        return this.pnEncrypt(data, customCipherKey, options);
      }
    }
  }, {
    key: 'decrypt',
    value: function decrypt(data, customCipherKey, options) {
      if (this._config.customDecrypt) {
        return this._config.customDecrypt(data);
      } else {
        return this.pnDecrypt(data, customCipherKey, options);
      }
    }
  }, {
    key: 'pnEncrypt',
    value: function pnEncrypt(data, customCipherKey, options) {
      if (!customCipherKey && !this._config.cipherKey) return data;
      options = this._parseOptions(options);
      var iv = this._getIV(options);
      var mode = this._getMode(options);
      var cipherKey = this._getPaddedKey(customCipherKey || this._config.cipherKey, options);
      var encryptedHexArray = _hmacSha2.default.AES.encrypt(data, cipherKey, { iv: iv, mode: mode }).ciphertext;
      var base64Encrypted = encryptedHexArray.toString(_hmacSha2.default.enc.Base64);
      return base64Encrypted || data;
    }
  }, {
    key: 'pnDecrypt',
    value: function pnDecrypt(data, customCipherKey, options) {
      if (!customCipherKey && !this._config.cipherKey) return data;
      options = this._parseOptions(options);
      var iv = this._getIV(options);
      var mode = this._getMode(options);
      var cipherKey = this._getPaddedKey(customCipherKey || this._config.cipherKey, options);
      try {
        var ciphertext = _hmacSha2.default.enc.Base64.parse(data);
        var plainJSON = _hmacSha2.default.AES.decrypt({ ciphertext: ciphertext }, cipherKey, { iv: iv, mode: mode }).toString(_hmacSha2.default.enc.Utf8);
        var plaintext = JSON.parse(plainJSON);
        return plaintext;
      } catch (e) {
        return null;
      }
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map
