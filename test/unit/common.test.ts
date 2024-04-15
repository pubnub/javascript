/* global describe, it */

import lilUUID from 'lil-uuid';
import assert from 'assert';

import CryptoJS from '../../src/core/components/cryptography/hmac-sha256';
import { Payload } from '../../src/core/types/api';
import PubNub from '../../src/node/index';

describe('#core / mounting point', () => {
  it('should have default heartbeat interval undefined', () => {
    let pn = new PubNub({ subscribeKey: 'demo', uuid: 'myUUID' });
    // @ts-expect-error Intentional access to the private configuration fields.
    assert(pn._config.getHeartbeatInterval() === undefined);
  });

  it('should have correct heartbeat interval set when reducing presence timeout', () => {
    let pn = new PubNub({ subscribeKey: 'demo', uuid: 'myUUID' });
    let presenceTimeout = 200;
    let expectedHeartBeat = presenceTimeout / 2 - 1;

    // @ts-expect-error Intentional access to the private configuration fields.
    pn._config.setPresenceTimeout(presenceTimeout);
    // @ts-expect-error Intentional access to the private configuration fields.
    assert(pn._config.getHeartbeatInterval() === expectedHeartBeat);
  });

  it('should support multiple pnsdk suffix', () => {
    let pn = new PubNub({ subscribeKey: 'demo', uuid: 'myUUID' });
    let suffix1 = 'suffix1/0.1';
    let suffix2 = 'suffix2/0.2';

    pn._addPnsdkSuffix('a', suffix1);
    pn._addPnsdkSuffix('b', suffix2);

    // @ts-expect-error Intentional access to the private configuration fields.
    assert(pn._config._getPnsdkSuffix(' ') === ' suffix1/0.1 suffix2/0.2');
  });

  it('should replace duplicate pnsdk suffix by name', () => {
    let pn = new PubNub({ subscribeKey: 'demo', uuid: 'myUUID' });
    let suffix1 = 'suffix1/0.1';
    let suffix2 = 'suffix2/0.2';
    let suffix3 = 'suffix3/0.3';

    pn._addPnsdkSuffix('a', suffix1);
    pn._addPnsdkSuffix('b', suffix2);
    pn._addPnsdkSuffix('a', suffix3); // duplicate name should replace

    // @ts-expect-error Intentional access to the private configuration fields.
    assert(pn._config._getPnsdkSuffix(' ') === ' suffix3/0.3 suffix2/0.2');
  });

  it('should default to empty pnsdk suffix', () => {
    let pn = new PubNub({ subscribeKey: 'demo', uuid: 'myUUID' });
    // @ts-expect-error Intentional access to the private configuration fields.
    assert(pn._config._getPnsdkSuffix(' ') === '');
  });

  it('supports UUID generation', () => {
    assert.equal(lilUUID.isUUID(PubNub.generateUUID()), true);
  });

  it('supports encryption with static IV', () => {
    let pn = new PubNub({
      subscribeKey: 'demo',
      cipherKey: 'customKey',
      useRandomIVs: false,
      uuid: 'myUUID',
    });
    assert.equal(pn.encrypt(JSON.stringify({ hi: 'there' })), 'TejX6F2JNqH/gIiGHWN4Cw==');
  });

  it('supports encryption with random IV', () => {
    let pn = new PubNub({
      subscribeKey: 'demo',
      cipherKey: 'customKey',
      uuid: 'myUUID',
    });
    const data1 = pn.encrypt(JSON.stringify({ hi: 'there' }));
    const data2 = pn.encrypt(JSON.stringify({ hi: 'there' }));

    assert.notEqual(pn.encrypt(JSON.stringify({ hi: 'there' })), 'TejX6F2JNqH/gIiGHWN4Cw==');
    assert.notEqual(data1, data2);
  });

  it('supports encryption with custom key and static IV', () => {
    let pn = new PubNub({
      subscribeKey: 'demo',
      useRandomIVs: false,
      uuid: 'myUUID',
    });
    assert.equal(pn.encrypt(JSON.stringify({ hi: 'there' }), 'customKey'), 'TejX6F2JNqH/gIiGHWN4Cw==');
  });

  it('supports encryption with custom key and random IV', () => {
    let pn = new PubNub({ subscribeKey: 'demo', uuid: 'myUUID' });
    const data1 = pn.encrypt(JSON.stringify({ hi: 'there' }), 'customKey');
    const data2 = pn.encrypt(JSON.stringify({ hi: 'there' }), 'customKey');

    assert.notEqual(pn.encrypt(JSON.stringify({ hi: 'there' }), 'customKey'), 'TejX6F2JNqH/gIiGHWN4Cw==');
    assert.notEqual(data1, data2);
  });

  it('supports decryption with static IV', () => {
    let pn = new PubNub({
      subscribeKey: 'demo',
      cipherKey: 'customKey',
      useRandomIVs: false,
      uuid: 'myUUID',
    });
    assert.deepEqual(pn.decrypt('TejX6F2JNqH/gIiGHWN4Cw=='), { hi: 'there' });
  });

  it('supports decryption with random IV', () => {
    let pn = new PubNub({
      subscribeKey: 'demo',
      cipherKey: 'customKey',
      uuid: 'myUUID',
    });
    const data = pn.encrypt(JSON.stringify({ hi: 'there2' }));

    assert.notDeepEqual(pn.decrypt('TejX6F2JNqH/gIiGHWN4Cw=='), { hi: 'there' });
    assert.deepEqual(pn.decrypt(data), { hi: 'there2' });
  });

  it('supports decryption with custom key and static IV', () => {
    let pn = new PubNub({
      subscribeKey: 'demo',
      useRandomIVs: false,
      uuid: 'myUUID',
    });
    assert.deepEqual(pn.decrypt('TejX6F2JNqH/gIiGHWN4Cw==', 'customKey'), {
      hi: 'there',
    });
  });

  it('supports decryption with custom key and random IV', () => {
    let pn = new PubNub({ subscribeKey: 'demo', uuid: 'myUUID' });
    const data = pn.encrypt(JSON.stringify({ hi: 'there2' }), 'customKey');

    assert.notDeepEqual(pn.decrypt('TejX6F2JNqH/gIiGHWN4Cw==', 'customKey'), {
      hi: 'there',
    });
    assert.deepEqual(pn.decrypt(data, 'customKey'), { hi: 'there2' });
  });

  it('supports custom encryption/decryption', () => {
    let customEncrypt = (data: Payload) => {
      // @ts-expect-error Bundled library without types.
      let cipher = CryptoJS.AES.encrypt(JSON.stringify(data), 'customKey');
      return cipher.toString();
    };

    let customDecrypt = (data: Payload) => {
      // @ts-expect-error Bundled library without types.
      let bytes = CryptoJS.AES.decrypt(data, 'customKey');
      // @ts-expect-error Bundled library without types.
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    };

    let pn = new PubNub({
      subscribeKey: 'demo',
      customEncrypt,
      customDecrypt,
      uuid: 'myUUID',
    });

    let ciphertext = pn.encrypt({ hi: 'there' });

    assert.deepEqual(pn.decrypt(ciphertext), { hi: 'there' });
  });
});
