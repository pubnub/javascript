/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import sinon from 'sinon';
import PubNub from '../../../lib/node/index.js';

describe('access endpoints', () => {
  let pubnub;
  let clock;

  before(() => {
    nock.disableNetConnect();
    clock = sinon.useFakeTimers(new Date(2011, 9, 1).getTime());
  });

  after(() => {
    clock.restore();
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({ subscribeKey: 'mySubscribeKey', publishKey: 'myPublishKey', secretKey: 'mySecretKey', uuid: 'myUUID', logVerbosity: true });
    pubnub._config.baseParams.pnsdk = 'PubNub-JS-Nodejs/suchJavascript';
  });

  describe('#audit', () => {
    it('issues the correct RESTful request for channels', (done) => {
      const scope = utils.createNock().get('/v1/auth/audit/sub-key/mySubscribeKey')
      .query({ timestamp: 1317452400, channel: 'ch1', uuid: 'myUUID', pnsdk: 'PubNub-JS-Nodejs/suchJavascript', signature: '9H37FYGAsuW3dgW2FISqcVj9bMPy+obPnSr/RzzMLWI=' })
      .reply(200, '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"sub-c-82ab2196-b64f-11e5-8622-0619f8945a4f","channel-group":"cg2","auths":{"key1":{"r":1,"m":1,"w":1}}},"service":"Access Manager","status":200}');

      pubnub.audit({ channel: 'ch1' }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response, {
          level: 'channel-group+auth',
          subscribe_key: 'sub-c-82ab2196-b64f-11e5-8622-0619f8945a4f',
          'channel-group': 'cg2',
          auths: {
            key1: {
              r: 1,
              m: 1,
              w: 1
            }
          }
        });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('issues the correct RESTful request for channel groups', (done) => {
      const scope = utils.createNock().get('/v1/auth/audit/sub-key/mySubscribeKey')
      .query({ timestamp: 1317452400, 'channel-group': 'cg1', uuid: 'myUUID', pnsdk: 'PubNub-JS-Nodejs/suchJavascript', signature: 'Ci+q0jVNlR4F0n2fDdU62q+DNIMRJ8FYIEoF0PyAOT0=' })
      .reply(200, '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"sub-c-82ab2196-b64f-11e5-8622-0619f8945a4f","channel-group":"cg2","auths":{"key1":{"r":1,"m":1,"w":1}}},"service":"Access Manager","status":200}');

      pubnub.audit({ channelGroup: 'cg1' }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response, {
          level: 'channel-group+auth',
          subscribe_key: 'sub-c-82ab2196-b64f-11e5-8622-0619f8945a4f',
          'channel-group': 'cg2',
          auths: {
            key1: {
              r: 1,
              m: 1,
              w: 1
            }
          }
        });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('issues the correct RESTful request for keys', (done) => {
      const scope = utils.createNock().get('/v1/auth/audit/sub-key/mySubscribeKey')
      .query({ timestamp: 1317452400, auth: 'key1,key2', uuid: 'myUUID', pnsdk: 'PubNub-JS-Nodejs/suchJavascript', signature: 'FcpPp2j9rshekMnkVMSeDZrybm2F19hKoQHBhj4RTBE=' })
      .reply(200, '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"sub-c-82ab2196-b64f-11e5-8622-0619f8945a4f","channel-group":"cg2","auths":{"key1":{"r":1,"m":1,"w":1}}},"service":"Access Manager","status":200}');

      pubnub.audit({ authKeys: ['key1', 'key2'] }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response, {
          level: 'channel-group+auth',
          subscribe_key: 'sub-c-82ab2196-b64f-11e5-8622-0619f8945a4f',
          'channel-group': 'cg2',
          auths: {
            key1: {
              r: 1,
              m: 1,
              w: 1
            }
          }
        });
        assert.equal(scope.isDone(), true);
        done();
      });
    });
  });

  describe('#grant', () => {
    it('issues the correct RESTful request for channels', (done) => {
      const scope = utils.createNock().get('/v1/auth/grant/sub-key/mySubscribeKey')
      .query({
        timestamp: 1317452400,
        channel: 'ch1,ch2',
        auth: 'key1,key2',
        uuid: 'myUUID',
        pnsdk: 'PubNub-JS-Nodejs/suchJavascript',
        signature: '2tLHfhekVOliPm5C5sgQgMG7Lc3Tm3lVN2xFh8KpQU4=',
        r: 0, w: 0, m: 0
      })
      .reply(200, '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"sub-c-82ab2196-b64f-11e5-8622-0619f8945a4f","channel-group":"cg2","auths":{"key1":{"r":1,"m":1,"w":1}}},"service":"Access Manager","status":200}');

      pubnub.grant({ channels: ['ch1', 'ch2'], authKeys: ['key1', 'key2'] }, (status) => {
        assert.equal(status.error, false);
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('issues the correct RESTful request for channels groups', (done) => {
      const scope = utils.createNock().get('/v1/auth/grant/sub-key/mySubscribeKey')
      .query({
        timestamp: 1317452400,
        'channel-group': 'cg1,cg2',
        auth: 'key1,key2',
        uuid: 'myUUID',
        pnsdk: 'PubNub-JS-Nodejs/suchJavascript',
        signature: 'vwHrjpyZN19DbARCWS5CCg4neybN5y5Oo58+zJGB4EU=',
        r: 1, w: 1, m: 0
      })
      .reply(200, '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"sub-c-82ab2196-b64f-11e5-8622-0619f8945a4f","channel-group":"cg2","auths":{"key1":{"r":1,"m":1,"w":1}}},"service":"Access Manager","status":200}');

      pubnub.grant({ channelGroups: ['cg1', 'cg2'], authKeys: ['key1', 'key2'], read: true, write: true }, (status) => {
        assert.equal(status.error, false);
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('issues the correct RESTful request for channels groups w/ ttl', (done) => {
      const scope = utils.createNock().get('/v1/auth/grant/sub-key/mySubscribeKey')
      .query({
        timestamp: 1317452400,
        'channel-group': 'cg1,cg2',
        auth: 'key1,key2',
        uuid: 'myUUID',
        pnsdk: 'PubNub-JS-Nodejs/suchJavascript',
        signature: 'V1a6caCWbFO+CfkUUov9mYB9VAf4xseSDUAtpAoLg7I=',
        r: 1, w: 1, m: 0,
        ttl: 1337
      })
      .reply(200, '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"sub-c-82ab2196-b64f-11e5-8622-0619f8945a4f","channel-group":"cg2","auths":{"key1":{"r":1,"m":1,"w":1}}},"service":"Access Manager","status":200}');

      pubnub.grant({ channelGroups: ['cg1', 'cg2'], authKeys: ['key1', 'key2'], read: true, write: true, ttl: 1337 }, (status) => {
        assert.equal(status.error, false);
        assert.equal(scope.isDone(), true);
        done();
      });
    });
  });
});
