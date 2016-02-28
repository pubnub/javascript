/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import Keychain from '../../../../../core/src/components/keychain';
const assert = require('assert');


describe('#components/keychain', () => {
  it('supports subscribe keys', () => {
    let keychain = new Keychain().setSubscribeKey('subKey');
    assert.equal(keychain.getSubscribeKey(), 'subKey');
  });

  it('supports auth keys', () => {
    let keychain = new Keychain().setAuthKey('authKey');
    assert.equal(keychain.getAuthKey(), 'authKey');
  });

  it('supports publish keys', () => {
    let keychain = new Keychain().setPublishKey('pubKey');
    assert.equal(keychain.getPublishKey(), 'pubKey');
  });
});
