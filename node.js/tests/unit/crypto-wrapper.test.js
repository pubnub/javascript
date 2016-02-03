/* global describe, beforeEach, it */
/* eslint no-console: 0 */

var cryptoWrapper = require('../../lib/crypto-wrapper');
var assert = require('assert');

describe('node cryptography wrapper', function () {
  it('should be able to encrypt and decrypt messages', function () {
    var key = 'fookey';
    var expectedBase64 = 'sNEP8cQFxiU3FeFXJH9zEJeBQcyhEXLN7SGfVGlaDrM=';
    var expectedObject = { foo: 'bar', baz: 'qux' };

    assert.equal(cryptoWrapper.encrypt(expectedObject, key), expectedBase64, 'Instance pubnub.crypto_obj encrypted message');
    assert.deepEqual(cryptoWrapper.decrypt(expectedBase64, key), expectedObject, 'Instance pubnub.crypto_obj decrypted message');
  });

  it('should allow to pass custom options', function () {
    var expected = {
      timestamp: '2014-03-12T20:47:54.712+0000',
      body: {
        extensionId: 402853446008,
        telephonyStatus: 'OnHold'
      },
      event: '/restapi/v1.0/account/~/extension/402853446008/presence',
      uuid: 'db01e7de-5f3c-4ee5-ab72-f8bd3b77e308'
    };
    var aesMessage = 'gkw8EU4G1SDVa2/hrlv6+0ViIxB7N1i1z5MU/Hu2xkIKzH6yQzhr3vIc27IAN558kTOkacqE5DkLpRdnN1orwtIBsUHmPMkMWTOLDzVr6eRk+2Gcj2Wft7ZKrCD+FCXlKYIoa98tUD2xvoYnRwxiE2QaNywl8UtjaqpTk1+WDImBrt6uabB1WICY/qE0It3DqQ6vdUWISoTfjb+vT5h9kfZxWYUP4ykN2UtUW1biqCjj1Rb6GWGnTx6jPqF77ud0XgV1rk/Q6heSFZWV/GP23/iytDPK1HGJoJqXPx7ErQU=';
    var key = 'e0bMTqmumPfFUbwzppkSbA==';

    assert.equal(cryptoWrapper.encrypt(expected, key, {
      encryptKey: false,
      keyEncoding: 'base64',
      keyLength: 128,
      mode: 'ecb'
    }), aesMessage);

    assert.deepEqual(cryptoWrapper.decrypt(aesMessage, key, {
      encryptKey: false,
      keyEncoding: 'base64',
      keyLength: 128,
      mode: 'ecb'
    }), expected);
  });

  it('should apply default options', function () {
    var expected = {
      timestamp: '2014-03-12T20:47:54.712+0000',
      body: {
        extensionId: 402853446008,
        telephonyStatus: 'OnHold'
      },
      event: '/restapi/v1.0/account/~/extension/402853446008/presence',
      uuid: 'db01e7de-5f3c-4ee5-ab72-f8bd3b77e308'
    };
    var aesMessage = 'FeEkW12O1By4hTgRxQoZ8QmPGwgxqUuS2LiwWnLLefs/+rkiZt2fwWmpZzrV9SEdWFmpCFYa6bmacoMLbi2tnhs16HLkTIUzETHTnXQW3Gb7TQOipv2Tp+GH7sJWn/d9vx4MPDXnn+h5svlYnMI4iantlgVFksGAzIrXMaOB2R0UJhWyKUxT+SR5WTXodNSlovrATzSWXXOzccgFT7d8wOhVHSOojZ1bS3Iv42lDdmz2AOxuAPvHc1+ChbbspODlHbMl5r2zaFPGeyKwa5ysx0/FJF7yzZt5XEtOzWVx7i8=';
    var key = 'e0bMTqmumPfFUbwzppkSbA==';

    assert.equal(cryptoWrapper.encrypt(expected, key, {}), aesMessage);
    assert.deepEqual(cryptoWrapper.decrypt(aesMessage, key, {}), expected);
  });

  it('should correct encoding if incorrect params are passed', function () {
    var expected = {
      timestamp: '2014-03-12T20:47:54.712+0000',
      body: {
        extensionId: 402853446008,
        telephonyStatus: 'OnHold'
      },
      event: '/restapi/v1.0/account/~/extension/402853446008/presence',
      uuid: 'db01e7de-5f3c-4ee5-ab72-f8bd3b77e308'
    };
    var aesMessage = 'FeEkW12O1By4hTgRxQoZ8QmPGwgxqUuS2LiwWnLLefs/+rkiZt2fwWmpZzrV9SEdWFmpCFYa6bmacoMLbi2tnhs16HLkTIUzETHTnXQW3Gb7TQOipv2Tp+GH7sJWn/d9vx4MPDXnn+h5svlYnMI4iantlgVFksGAzIrXMaOB2R0UJhWyKUxT+SR5WTXodNSlovrATzSWXXOzccgFT7d8wOhVHSOojZ1bS3Iv42lDdmz2AOxuAPvHc1+ChbbspODlHbMl5r2zaFPGeyKwa5ysx0/FJF7yzZt5XEtOzWVx7i8=';
    var key = 'e0bMTqmumPfFUbwzppkSbA==';

    assert.equal(cryptoWrapper.encrypt(expected, key, { keyEncoding: 'yiss', keyLength: 'yiss', mode: 'yiss' }), aesMessage);
    assert.deepEqual(cryptoWrapper.decrypt(aesMessage, key, { keyEncoding: 'yiss' }), expected);
  });


  it('should return the input if key is missing when encrypting', function () {
    var expectedObject = { foo: 'bar', baz: 'qux' };

    assert.equal(cryptoWrapper.encrypt(expectedObject, null, {
      encryptKey: false,
      keyEncoding: 'base64',
      keyLength: 128,
      mode: 'ecb'
    }), expectedObject);
  });

  it('should return the input if key is missing when decrypting', function () {
    var expectedObject = { foo: 'bar', baz: 'qux' };

    assert.equal(cryptoWrapper.decrypt(expectedObject, null, {
      encryptKey: false,
      keyEncoding: 'base64',
      keyLength: 128,
      mode: 'ecb'
    }), expectedObject);
  });
});
