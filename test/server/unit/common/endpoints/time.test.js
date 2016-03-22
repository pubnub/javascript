/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import assert from 'assert';
import sinon from 'sinon';

import TimeEndpoint from '../../../../../src/core/endpoints/time';
import Networking from '../../../../../src/core/components/networking';

describe('time endpoints', () => {
  let networking;

  beforeEach(() => {
    networking = new Networking({});
  });

  it('calls networking #fetchTime', () => {
    const fetchTimeStub = sinon.stub(networking, 'fetchTime');

    const timeEndpoint = new TimeEndpoint({ networking });
    timeEndpoint.fetch();
    assert.equal(fetchTimeStub.called, 1);
  });

  it('calls the callback function when time is fetched', (done) => {
    sinon.stub(networking, 'fetchTime', (callback) => {
      callback(null, [14570763868573725]);
    });

    const timeEndpoint = new TimeEndpoint({ networking });
    timeEndpoint.fetch((err, response) => {
      assert.equal(err, null);
      assert.deepEqual(response, 14570763868573725);
      done();
    });
  });

  it('calls the callback function when fetch failed', (done) => {
    sinon.stub(networking, 'fetchTime', (callback) => {
      callback({ some: 'horribleError' }, null);
    });

    const timeEndpoint = new TimeEndpoint({ networking });
    timeEndpoint.fetch((err, response) => {
      assert.equal(response, null);
      assert.deepEqual(err, { some: 'horribleError' });
      done();
    });
  });
});
