var crypto = require('crypto');

var IV = '0123456789012345';
var allowedKeyEncodings = ['hex', 'utf8', 'base64', 'binary'];
var allowedKeyLengths = [128, 256];
var allowedModes = ['ecb', 'cbc'];

var defaultOptions = {
  encryptKey: true,
  keyEncoding: 'utf8',
  keyLength: 256,
  mode: 'cbc'
};

function parseOptions(options) {
  // Defaults
  options = options || {};

  if (!options.hasOwnProperty('encryptKey')) {
    options.encryptKey = defaultOptions.encryptKey;
  }
  if (!options.hasOwnProperty('keyEncoding')) {
    options.keyEncoding = defaultOptions.keyEncoding;
  }
  if (!options.hasOwnProperty('keyLength')) {
    options.keyLength = defaultOptions.keyLength;
  }
  if (!options.hasOwnProperty('mode')) {
    options.mode = defaultOptions.mode;
  }

  // Validation
  if (allowedKeyEncodings.indexOf(options.keyEncoding.toLowerCase()) === -1) {
    options.keyEncoding = defaultOptions.keyEncoding;
  }
  if (allowedKeyLengths.indexOf(parseInt(options.keyLength, 10)) === -1) {
    options.keyLength = defaultOptions.keyLength;
  }
  if (allowedModes.indexOf(options.mode.toLowerCase()) === -1) {
    options.mode = defaultOptions.mode;
  }

  return options;
}

function decodeKey(key, options) {
  if (options.keyEncoding === 'base64' || options.keyEncoding === 'hex') {
    return new Buffer(key, options.keyEncoding);
  } else {
    return key;
  }
}

function getPaddedKey(key, options) {
  key = decodeKey(key, options);
  if (options.encryptKey) {
    return crypto.createHash('sha256').update(key).digest('hex').slice(0, 32);
  } else {
    return key;
  }
}

function getAlgorithm(options) {
  return 'aes-' + options.keyLength + '-' + options.mode;
}

function getIV(options) {
  return (options.mode === 'cbc') ? IV : '';
}

function performEncryption(input, key, options) {
  if (!key) return input;
  options = parseOptions(options);
  var plainText = JSON.stringify(input);
  var cipher = crypto.createCipheriv(getAlgorithm(options), getPaddedKey(key, options), getIV(options));
  var base64Encrypted = cipher.update(plainText, 'utf8', 'base64') + cipher.final('base64');
  return base64Encrypted || input;
}

function performDecryption(input, key, options) {
  if (!key) return input;
  options = parseOptions(options);
  var decrypted;
  var decipher = crypto.createDecipheriv(getAlgorithm(options), getPaddedKey(key, options), getIV(options));
  try {
    decrypted = decipher.update(input, 'base64', 'utf8') + decipher.final('utf8');
  } catch (e) {
    return null;
  }
  return JSON.parse(decrypted);
}

module.exports = { encrypt: performEncryption, decrypt: performDecryption };
