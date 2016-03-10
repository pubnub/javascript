/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import TimeEndpoint from '../../../../../core/src/endpoints/time';
import Networking from '../../../../../core/src/components/networking';
import Config from '../../../../../core/src/components/config';
import Keychain from '../../../../../core/src/components/keychain';

const assert = require('assert');
const sinon = require('sinon');

describe('time endpoints', () => {
  let networking;
  let config;
  let keychain;
  let get_url_params = function (data) {
    return data;
  };

  beforeEach(() => {
    networking = new Networking();
    config = new Config();
    keychain = new Keychain()
      .setAuthKey('authKey')
      .setUUID('uuidKey')
      .setInstanceId('instanceId');
  });

  it('calls networking #fetchTime', () => {
    let fetchTimeStub = sinon.stub(networking, 'fetchTime');

    let timeEndpoint = new TimeEndpoint({ networking, config, keychain, get_url_params });
    timeEndpoint.fetchTime();
    assert.equal(fetchTimeStub.called, 1);
    assert.deepEqual(fetchTimeStub.args[0][0].data, { uuid: 'uuidKey', auth: 'authKey' });
  });

  it('calls networking #fetchTime with instanceId', () => {
    config.setInstanceIdConfig(true);
    let fetchTimeStub = sinon.stub(networking, 'fetchTime');
    let prepareParams = sinon.stub(networking, 'prepareParams').returns({ prepared: 'params' });

    let timeEndpoint = new TimeEndpoint({ networking, config, keychain, get_url_params });
    timeEndpoint.fetchTime();
    assert.equal(fetchTimeStub.called, 1);
    assert.deepEqual(fetchTimeStub.args[0][0].data, { prepared: 'params' });
    assert.equal(prepareParams.called, 1);
    assert.deepEqual(prepareParams.args[0][0], {
      uuid: 'uuidKey',
      auth: 'authKey',
      instanceid: 'instanceId',
    });
  });

  it('calls the callback function when time is fetched', (done) => {
    sinon.stub(networking, 'fetchTime', ({ success }) => {
      success([14570763868573725]);
    });

    let timeEndpoint = new TimeEndpoint({ networking, config, keychain, get_url_params });
    timeEndpoint.fetchTime((response) => {
      assert.equal(response, 14570763868573725);
      done();
    });
  });

  it('calls the callback function when fetch failed', (done) => {
    sinon.stub(networking, 'fetchTime', ({ fail }) => {
      fail();
    });

    let timeEndpoint = new TimeEndpoint({ networking, config, keychain, get_url_params });
    timeEndpoint.fetchTime((response) => {
      assert.equal(response, 0);
      done();
    });
  });
});
