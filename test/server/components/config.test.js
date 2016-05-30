/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import Config from '../../../../../src/core/components/config';
const assert = require('assert');


describe('#components/config', () => {
  it('supports correct defaults', () => {
    let config = new Config();
    assert.equal(config.isInstanceIdEnabled(), false);
    assert.equal(config.isRequestIdEnabled(), false);
  });

  it('supports instance id configuration', () => {
    let config = new Config().setInstanceIdConfig(true);
    assert.equal(config.isInstanceIdEnabled(), true);
  });

  it('supports request id configuration', () => {
    let config = new Config().setRequestIdConfig(true);
    assert.equal(config.isRequestIdEnabled(), true);
  });
});
