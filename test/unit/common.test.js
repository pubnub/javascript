/* global describe, beforeEach, it, before, afterEach, after */

import assert from 'assert';
import sinon from 'sinon';
import uuidGenerator from 'uuid';
import PubNub from '../../src/node/index';

describe('#core / mounting point', () => {
  beforeEach(() => {
    sinon.stub(uuidGenerator, 'v4').returns('uuidCustom');
  });

  afterEach(() => {
    uuidGenerator.v4.restore();
  });

  it('supports UUID generation', () => {
    assert.equal(PubNub.generateUUID(), 'uuidCustom');
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
});
