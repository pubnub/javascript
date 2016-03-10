/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import Keychain from '../../../../../src/core/components/keychain';
const assert = require('assert');


describe('#components/keychain', () => {
  let keychain;

  before(() => {
    keychain = new Keychain()
      .setSubscribeKey('subKey')
      .setAuthKey('authKey')
      .setSecretKey('secretKey')
      .setPublishKey('pubKey')
      .setInstanceId('instanceId')
      .setCipherKey('cipherKey')
      .setUUID('UUID');
  });

  it('supports subscribe keys', () => {
    assert.equal(keychain.getSubscribeKey(), 'subKey');
  });

  it('supports auth keys', () => {
    assert.equal(keychain.getAuthKey(), 'authKey');
  });

  it('supports secret keys', () => {
    assert.equal(keychain.getSecretKey(), 'secretKey');
  });

  it('supports publish keys', () => {
    assert.equal(keychain.getPublishKey(), 'pubKey');
  });

  it('supports instance ids', () => {
    assert.equal(keychain.getInstanceId(), 'instanceId');
  });

  it('supports UUID storage', () => {
    assert.equal(keychain.getUUID(), 'UUID');
  });

  it('supports cipher key', () => {
    assert.equal(keychain.getCipherKey(), 'cipherKey');
  });
});
