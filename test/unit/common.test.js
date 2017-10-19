/* global describe, it */

import assert from 'assert';
import lilUUID from 'lil-uuid';
import PubNub from '../../src/node/index';
import CryptoJS from '../../src/core/components/cryptography/hmac-sha256';

describe('#core / mounting point', () => {
  it('supports UUID generation', () => {
    assert.equal(lilUUID.isUUID(PubNub.generateUUID()), true);
  });

  it('supports encryption', () => {
    let pn = new PubNub({ cipherKey: 'customKey' });
    assert.equal(pn.encrypt(JSON.stringify({ hi: 'there' })), 'TejX6F2JNqH/gIiGHWN4Cw==');
  });

  it('supports encryption with custom key', () => {
    let pn = new PubNub({});
    assert.equal(pn.encrypt(JSON.stringify({ hi: 'there' }), 'customKey'), 'TejX6F2JNqH/gIiGHWN4Cw==');
  });

  it('supports decryption', () => {
    let pn = new PubNub({ cipherKey: 'customKey' });
    assert.deepEqual(pn.decrypt('TejX6F2JNqH/gIiGHWN4Cw=='), { hi: 'there' });
  });

  it('supports decryption with custom key', () => {
    let pn = new PubNub({});
    assert.deepEqual(pn.decrypt('TejX6F2JNqH/gIiGHWN4Cw==', 'customKey'), { hi: 'there' });
  });

  it('supports decryption with custom key', () => {
    let pn = new PubNub({});
    assert.deepEqual(pn.decrypt('TejX6F2JNqH/gIiGHWN4Cw==', 'customKey'), { hi: 'there' });
  });

  it('supports custom encryption/decryption', () => {
    let customEncrypt = (data) => {
      let cipher = CryptoJS.AES.encrypt(JSON.stringify(data), 'customKey');
      return cipher.toString();
    };

    let customDecrypt = (data) => {
      let bytes = CryptoJS.AES.decrypt(data, 'customKey');
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    };

    let pn = new PubNub({ customEncrypt, customDecrypt });

    let ciphertext = pn.encrypt({ hi: 'there' });

    assert.deepEqual(pn.decrypt(ciphertext), { hi: 'there' });
  });
});
