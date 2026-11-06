/* global describe, it */

import lilUUID from 'lil-uuid';
import assert from 'assert';

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

  it('supports encryption with static IV', async () => {
    let pn = new PubNub({
      subscribeKey: 'demo',
      cipherKey: 'customKey',
      useRandomIVs: false,
      uuid: 'myUUID',
    });
    assert.equal(await pn.encrypt(JSON.stringify({ hi: 'there' })), 'TejX6F2JNqH/gIiGHWN4Cw==');
  });

  it('supports encryption with random IV', async () => {
    let pn = new PubNub({
      subscribeKey: 'demo',
      cipherKey: 'customKey',
      uuid: 'myUUID',
    });
    const data1 = await pn.encrypt(JSON.stringify({ hi: 'there' }));
    const data2 = await pn.encrypt(JSON.stringify({ hi: 'there' }));

    assert.notEqual(await pn.encrypt(JSON.stringify({ hi: 'there' })), 'TejX6F2JNqH/gIiGHWN4Cw==');
    assert.notEqual(data1, data2);
  });

  it('supports encryption with custom key and static IV', async () => {
    let pn = new PubNub({
      subscribeKey: 'demo',
      useRandomIVs: false,
      uuid: 'myUUID',
    });
    assert.equal(await pn.encrypt(JSON.stringify({ hi: 'there' }), 'customKey'), 'TejX6F2JNqH/gIiGHWN4Cw==');
  });

  it('supports encryption with custom key and random IV', async () => {
    let pn = new PubNub({ subscribeKey: 'demo', uuid: 'myUUID' });
    const data1 = await pn.encrypt(JSON.stringify({ hi: 'there' }), 'customKey');
    const data2 = await pn.encrypt(JSON.stringify({ hi: 'there' }), 'customKey');

    assert.notEqual(await pn.encrypt(JSON.stringify({ hi: 'there' }), 'customKey'), 'TejX6F2JNqH/gIiGHWN4Cw==');
    assert.notEqual(data1, data2);
  });

  it('supports decryption with static IV', async () => {
    let pn = new PubNub({
      subscribeKey: 'demo',
      cipherKey: 'customKey',
      useRandomIVs: false,
      uuid: 'myUUID',
    });
    assert.deepEqual(await pn.decrypt('TejX6F2JNqH/gIiGHWN4Cw=='), { hi: 'there' });
  });

  it('supports decryption with random IV', async () => {
    let pn = new PubNub({
      subscribeKey: 'demo',
      cipherKey: 'customKey',
      uuid: 'myUUID',
    });
    const data = await pn.encrypt(JSON.stringify({ hi: 'there2' }));

    assert.notDeepEqual(await pn.decrypt('TejX6F2JNqH/gIiGHWN4Cw=='), { hi: 'there' });
    assert.deepEqual(await pn.decrypt(data), { hi: 'there2' });
  });

  it('supports decryption with custom key and static IV', async () => {
    let pn = new PubNub({
      subscribeKey: 'demo',
      useRandomIVs: false,
      uuid: 'myUUID',
    });
    assert.deepEqual(await pn.decrypt('TejX6F2JNqH/gIiGHWN4Cw==', 'customKey'), {
      hi: 'there',
    });
  });

  it('supports decryption with custom key and random IV', async () => {
    let pn = new PubNub({ subscribeKey: 'demo', uuid: 'myUUID' });
    const data = await pn.encrypt(JSON.stringify({ hi: 'there2' }), 'customKey');

    assert.notDeepEqual(await pn.decrypt('TejX6F2JNqH/gIiGHWN4Cw==', 'customKey'), {
      hi: 'there',
    });
    assert.deepEqual(await pn.decrypt(data, 'customKey'), { hi: 'there2' });
  });

  it('supports custom encryption/decryption', async () => {
    // Simple reversible transformation (custom encryption is user-defined and opaque to the SDK).
    let customEncrypt = (data: Payload) => Buffer.from(JSON.stringify(data)).reverse().toString('base64');

    let customDecrypt = (data: Payload) =>
      JSON.parse(Buffer.from(data as string, 'base64').reverse().toString('utf8'));

    let pn = new PubNub({
      subscribeKey: 'demo',
      customEncrypt,
      customDecrypt,
      uuid: 'myUUID',
    });

    let ciphertext = await pn.encrypt({ hi: 'there' });

    assert.notDeepEqual(ciphertext, JSON.stringify({ hi: 'there' }));
    assert.deepEqual(await pn.decrypt(ciphertext), { hi: 'there' });
  });
});
