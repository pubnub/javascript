/* global describe, beforeEach, it, before, afterEach, after */

import assert from 'assert';
import sinon from 'sinon';
import uuidGenerator from 'uuid';
import PubNub from '../../lib/node/index.js';

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
});
