/* @flow */

import Config from '../config';
import CryptoJS from './hmac-sha256';

type CryptoConstruct = {
  config: Config,
}

export default class {

  _config: Config;
  _iv: string;
  _allowedKeyEncodings: Array<string>;
  _allowedKeyLengths: Array<number>;
  _allowedModes: Array<string>;
  _defaultOptions: Object;

  constructor({ config }: CryptoConstruct) {
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

  HMACSHA256(data: string): string {
    let hash = CryptoJS.HmacSHA256(data, this._config.secretKey);
    return hash.toString(CryptoJS.enc.Base64);
  }

  SHA256(s: string): string {
    return CryptoJS.SHA256(s).toString(CryptoJS.enc.Hex);
  }

  _parseOptions(incomingOptions: ?Object): Object {
    // Defaults
    let options = incomingOptions || {};
    if (!options.hasOwnProperty('encryptKey')) options.encryptKey = this._defaultOptions.encryptKey;
    if (!options.hasOwnProperty('keyEncoding')) options.keyEncoding = this._defaultOptions.keyEncoding;
    if (!options.hasOwnProperty('keyLength')) options.keyLength = this._defaultOptions.keyLength;
    if (!options.hasOwnProperty('mode')) options.mode = this._defaultOptions.mode;

    // Validation
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

  _decodeKey(key: string, options: Object): string {
    if (options.keyEncoding === 'base64') {
      return CryptoJS.enc.Base64.parse(key);
    } else if (options.keyEncoding === 'hex') {
      return CryptoJS.enc.Hex.parse(key);
    } else {
      return key;
    }
  }

  _getPaddedKey(key: string, options: Object): string {
    key = this._decodeKey(key, options);
    if (options.encryptKey) {
      return CryptoJS.enc.Utf8.parse(this.SHA256(key).slice(0, 32));
    } else {
      return key;
    }
  }

  _getMode(options: Object): string {
    if (options.mode === 'ecb') {
      return CryptoJS.mode.ECB;
    } else {
      return CryptoJS.mode.CBC;
    }
  }

  _getIV(options: Object): string | null {
    return (options.mode === 'cbc') ? CryptoJS.enc.Utf8.parse(this._iv) : null;
  }

  encrypt(data: string, customCipherKey: ?string, options: ?Object): Object | string | null {
    if (!customCipherKey && !this._config.cipherKey) return data;
    options = this._parseOptions(options);
    let iv = this._getIV(options);
    let mode = this._getMode(options);
    let cipherKey = this._getPaddedKey(customCipherKey || this._config.cipherKey, options);
    let encryptedHexArray = CryptoJS.AES.encrypt(data, cipherKey, { iv, mode }).ciphertext;
    let base64Encrypted = encryptedHexArray.toString(CryptoJS.enc.Base64);
    return base64Encrypted || data;
  }

  decrypt(data: Object, customCipherKey: ?string, options: ?Object): Object | null {
    if (!customCipherKey && !this._config.cipherKey) return data;
    options = this._parseOptions(options);
    let iv = this._getIV(options);
    let mode = this._getMode(options);
    let cipherKey = this._getPaddedKey(customCipherKey || this._config.cipherKey, options);
    try {
      let ciphertext = CryptoJS.enc.Base64.parse(data);
      let plainJSON = CryptoJS.AES.decrypt({ ciphertext }, cipherKey, { iv, mode }).toString(CryptoJS.enc.Utf8);
      let plaintext = JSON.parse(plainJSON);
      return plaintext;
    } catch (e) {
      return null;
    }
  }

}
