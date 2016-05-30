/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import assert from 'assert';
import sinon from 'sinon';

import TimeEndpoint from '../../../../../src/core/endpoints/time';
import Networking from '../../../../../src/core/components/networking';
import Config from '../../../../../src/core/components/config';

describe('time endpoints', () => {
  let networking;
  let config;

  beforeEach(() => {
    config = new Config({});
    networking = new Networking({ config });
  });

  it('calls networking #XDR', () => {
    const fetchTimeStub = sinon.stub(networking, 'XDR');

    const timeEndpoint = new TimeEndpoint({ networking, config });
    timeEndpoint.fetch();
    assert.equal(fetchTimeStub.called, 1);
  });

  it('calls base #validateEndpointConfig', () => {
    const fetchTimeStub = sinon.stub(networking, 'XDR');
    const timeEndpoint = new TimeEndpoint({ networking, config });
    const validateStub = sinon.spy(timeEndpoint, 'validateEndpointConfig');

    timeEndpoint.fetch();
    assert.equal(fetchTimeStub.called, 1);
    assert.equal(validateStub.called, 1);
  });

  it('calls base #createBaseParams', () => {
    const fetchTimeStub = sinon.stub(networking, 'XDR');
    const timeEndpoint = new TimeEndpoint({ networking, config });
    const createBaseStub = sinon.spy(timeEndpoint, 'createBaseParams');

    timeEndpoint.fetch();
    assert.equal(fetchTimeStub.called, 1);
    assert.equal(createBaseStub.called, 1);
  });

  it('calls the callback function when time is fetched', (done) => {
    sinon.stub(networking, 'XDR', (data, endpointConfig, callback) => {
      callback(null, [14570763868573725]);
    });

    const timeEndpoint = new TimeEndpoint({ networking, config });
    timeEndpoint.fetch((err, response) => {
      assert.equal(err, null);
      assert.deepEqual(response, 14570763868573725);
      done();
    });
  });

  it('calls the callback function when fetch failed', (done) => {
    sinon.stub(networking, 'XDR', (data, endpointConfig, callback) => {
      callback({ some: 'horribleError' }, null);
    });

    const timeEndpoint = new TimeEndpoint({ networking, config });
    timeEndpoint.fetch((err, response) => {
      assert.equal(response, null);
      assert.deepEqual(err, { some: 'horribleError' });
      done();
    });
  });
});
