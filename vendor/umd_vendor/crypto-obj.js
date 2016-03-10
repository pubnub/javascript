/* eslint camelcase: 0 eqeqeq: 0 */

var CryptoJS = require('./hmac-sha256.js');

function crypto_obj() {
  function SHA256(s) {
    return CryptoJS['SHA256'](s)['toString'](CryptoJS['enc']['Hex']);
  }

  var iv = '0123456789012345';

  var allowedKeyEncodings = ['hex', 'utf8', 'base64', 'binary'];
  var allowedKeyLengths = [128, 256];
  var allowedModes = ['ecb', 'cbc'];

  var defaultOptions = {
    encryptKey: true,
    keyEncoding: 'utf8',
    keyLength: 256,
    mode: 'cbc'
  };

  function parse_options(options) {
    // Defaults
    options = options || {};
    if (!options['hasOwnProperty']('encryptKey')) options['encryptKey'] = defaultOptions['encryptKey'];
    if (!options['hasOwnProperty']('keyEncoding')) options['keyEncoding'] = defaultOptions['keyEncoding'];
    if (!options['hasOwnProperty']('keyLength')) options['keyLength'] = defaultOptions['keyLength'];
    if (!options['hasOwnProperty']('mode')) options['mode'] = defaultOptions['mode'];

    // Validation
    if (allowedKeyEncodings['indexOf'](options['keyEncoding']['toLowerCase']()) == -1) options['keyEncoding'] = defaultOptions['keyEncoding'];
    if (allowedKeyLengths['indexOf'](parseInt(options['keyLength'], 10)) == -1) options['keyLength'] = defaultOptions['keyLength'];
    if (allowedModes['indexOf'](options['mode']['toLowerCase']()) == -1) options['mode'] = defaultOptions['mode'];

    return options;
  }

  function decode_key(key, options) {
    if (options['keyEncoding'] === 'base64') {
      return CryptoJS['enc']['Base64']['parse'](key);
    } else if (options['keyEncoding'] === 'hex') {
      return CryptoJS['enc']['Hex']['parse'](key);
    } else {
      return key;
    }
  }

  function get_padded_key(key, options) {
    key = decode_key(key, options);
    if (options['encryptKey']) {
      return CryptoJS['enc']['Utf8']['parse'](SHA256(key)['slice'](0, 32));
    } else {
      return key;
    }
  }

  function get_mode(options) {
    if (options['mode'] === 'ecb') {
      return CryptoJS['mode']['ECB'];
    } else {
      return CryptoJS['mode']['CBC'];
    }
  }

  function get_iv(options) {
    return (options['mode'] === 'cbc') ? CryptoJS['enc']['Utf8']['parse'](iv) : null;
  }

  return {
    encrypt: function (data, key, options) {
      if (!key) return data;
      options = parse_options(options);
      var iv = get_iv(options);
      var mode = get_mode(options);
      var cipher_key = get_padded_key(key, options);
      var hex_message = JSON['stringify'](data);
      var encryptedHexArray = CryptoJS['AES']['encrypt'](hex_message, cipher_key, { iv: iv, mode: mode })['ciphertext'];
      var base_64_encrypted = encryptedHexArray['toString'](CryptoJS['enc']['Base64']);
      return base_64_encrypted || data;
    },

    decrypt: function (data, key, options) {
      if (!key) return data;
      options = parse_options(options);
      var iv = get_iv(options);
      var mode = get_mode(options);
      var cipher_key = get_padded_key(key, options);
      try {
        var binary_enc = CryptoJS['enc']['Base64']['parse'](data);
        var json_plain = CryptoJS['AES']['decrypt']({ ciphertext: binary_enc }, cipher_key, { iv: iv, mode: mode })['toString'](CryptoJS['enc']['Utf8']);
        var plaintext = JSON['parse'](json_plain);
        return plaintext;
      } catch (e) {
        return undefined;
      }
    }
  };
}

module.exports = crypto_obj;
