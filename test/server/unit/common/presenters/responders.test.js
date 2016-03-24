/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import Responders from '../../../../../src/core/presenters/responders';
const assert = require('assert');


describe.skip('#presenters/responders', () => {
  describe('#callback', () => {
    it('returns the passed item if it is not an object', (done) => {
      Responders.callback('hello', (reponderResult) => {
        assert.equal(reponderResult, 'hello');
        done();
      });
    });

    describe('error nested inside callback', () => {
      it('prepares the data object', (done) => {
        Responders.callback({
          error: 'scaryError',
          message: 'scaryMessage',
          payload: 'payload!'
        }, null, (reponderResult) => {
          assert.deepEqual(reponderResult, { message: 'scaryMessage', payload: 'payload!' });
          done();
        });
      });

      it('prepares the data object w/o payload', (done) => {
        Responders.callback({
          error: 'scaryError',
          message: 'scaryMessage'
        }, null, (reponderResult) => {
          assert.deepEqual(reponderResult, { message: 'scaryMessage' });
          done();
        });
      });

      it('prepares the data object w/o message', (done) => {
        Responders.callback({
          error: 'scaryError',
          payload: 'payload!'
        }, null, (reponderResult) => {
          assert.deepEqual(reponderResult, { payload: 'payload!' });
          done();
        });
      });
    });

    describe('on success', () => {
      it('a response with only payload', (done) => {
        Responders.callback({
          payload: 'cool-payload'
        }, (reponderResult) => {
          assert.deepEqual(reponderResult, 'cool-payload');
          done();
        });
      });

      it('a response with payload and next_page', (done) => {
        Responders.callback({
          payload: 'cool-payload',
          next_page: 'page100'
        }, (reponderResult, nextPage) => {
          assert.deepEqual(reponderResult, 'cool-payload');
          assert.equal(nextPage, 'page100');
          done();
        });
      });
    });
  });

  describe('#error', () => {
    it('returns the passed item if it is not an object', (done) => {
      Responders.error('hello', (reponderResult) => {
        assert.equal(reponderResult, 'hello');
        done();
      });
    });

    it('returns the passed item if it does not contain error', (done) => {
      Responders.error({ random: 'object' }, (reponderResult) => {
        assert.deepEqual(reponderResult, { random: 'object' });
        done();
      });
    });

    it('prepares the data object', (done) => {
      Responders.error({
        error: 'scaryError',
        message: 'scaryMessage',
        payload: 'payload!'
      }, (reponderResult) => {
        assert.deepEqual(reponderResult, { message: 'scaryMessage', payload: 'payload!' });
        done();
      });
    });

    it('prepares the data object w/o payload', (done) => {
      Responders.error({
        error: 'scaryError',
        message: 'scaryMessage'
      }, (reponderResult) => {
        assert.deepEqual(reponderResult, { message: 'scaryMessage' });
        done();
      });
    });

    it('prepares the data object w/o message', (done) => {
      Responders.error({
        error: 'scaryError',
        payload: 'payload!'
      }, (reponderResult) => {
        assert.deepEqual(reponderResult, { payload: 'payload!' });
        done();
      });
    });
  });
});
