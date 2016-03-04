/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

const assert = require('assert');
const sinon = require('sinon');
const uuid = require('uuid');

import utils from '../../../../core/src/utils';

describe('utils', () => {
  describe('#generateUUID', () => {
    it('returns a generated UUID', () => {
      let stubbedUUID = sinon.stub(uuid, 'v4').returns('UUID');
      let returnedUUID = utils.generateUUID();
      assert.equal(returnedUUID, 'UUID');
      assert.equal(stubbedUUID.called, 1);
      uuid.v4.restore();
    });

    it('returns a generated UUID w/ a callback', (done) => {
      let stubbedUUID = sinon.stub(uuid, 'v4').returns('UUID');
      utils.generateUUID((returnedUUID) => {
        assert.equal(returnedUUID, 'UUID');
        assert.equal(stubbedUUID.called, 1);
        uuid.v4.restore();
        done();
      });
    });
  });
});
