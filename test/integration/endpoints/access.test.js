/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import sinon from 'sinon';

import utils from '../../utils';
import PubNub from '../../../src/node/index';

describe('access endpoints', () => {
  let pubnub;
  let clock;

  before(() => {
    nock.disableNetConnect();
    clock = sinon.useFakeTimers(new Date(Date.UTC(2011, 9, 1, 0, 0, 0)).getTime());
  });

  after(() => {
    clock.restore();
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({ subscribeKey: 'mySubscribeKey', publishKey: 'myPublishKey', secretKey: 'mySecretKey', uuid: 'myUUID' });
    pubnub._config.getVersion = () => 'suchJavascript';
  });

  describe('#audit', () => {
    it('issues the correct RESTful request for channels', (done) => {
      const scope = utils.createNock().get('/v2/auth/audit/sub-key/mySubscribeKey')
      .query({ timestamp: 1317427200, channel: 'ch1', uuid: 'myUUID', pnsdk: 'PubNub-JS-Nodejs/suchJavascript', signature: 'T7d76LD7SJJdhaljs8yku5cY04TvynsCVBs2D8FMF8Y=' })
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
      const scope = utils.createNock().get('/v2/auth/audit/sub-key/mySubscribeKey')
      .query({ timestamp: 1317427200, 'channel-group': 'cg1', uuid: 'myUUID', pnsdk: 'PubNub-JS-Nodejs/suchJavascript', signature: 'P3xBKue_zoj23Kc0JcTDmeLO751R_bYtr74LFEyfwZM=' })
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
      const scope = utils.createNock().get('/v2/auth/audit/sub-key/mySubscribeKey')
      .query({ timestamp: 1317427200, auth: 'key1,key2', uuid: 'myUUID', pnsdk: 'PubNub-JS-Nodejs/suchJavascript', signature: 'OlwW-JbL2_pnp9qLaCnQwc2oWAoybQYi4wqLOegc1Kg=' })
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
      const scope = utils.createNock().get('/v2/auth/grant/sub-key/mySubscribeKey')
      .query({
        timestamp: 1317427200,
        channel: 'ch1,ch2',
        auth: 'key1,key2',
        uuid: 'myUUID',
        pnsdk: 'PubNub-JS-Nodejs/suchJavascript',
        signature: 'eHfy2MycQdZySF95iavsSftLDD0oG5umBKgTxHbMFwg=',
        r: 0,
        w: 0,
        m: 0
      })
      .reply(200, '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"sub-c-82ab2196-b64f-11e5-8622-0619f8945a4f","channel-group":"cg2","auths":{"key1":{"r":1,"m":1,"w":1}}},"service":"Access Manager","status":200}');

      pubnub.grant({ channels: ['ch1', 'ch2'], authKeys: ['key1', 'key2'] }, (status) => {
        assert.equal(status.error, false);
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('issues the correct RESTful request for channels groups', (done) => {
      const scope = utils.createNock().get('/v2/auth/grant/sub-key/mySubscribeKey')
      .query({
        timestamp: 1317427200,
        'channel-group': 'cg1,cg2',
        auth: 'key1,key2',
        uuid: 'myUUID',
        pnsdk: 'PubNub-JS-Nodejs/suchJavascript',
        signature: 'B4QZ4K5nd_eI0AT6JAw4Ubk57x87-Ze7jsihw-vV--A=',
        r: 1,
        w: 1,
        m: 0
      })
      .reply(200, '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"sub-c-82ab2196-b64f-11e5-8622-0619f8945a4f","channel-group":"cg2","auths":{"key1":{"r":1,"m":1,"w":1}}},"service":"Access Manager","status":200}');

      pubnub.grant({ channelGroups: ['cg1', 'cg2'], authKeys: ['key1', 'key2'], read: true, write: true }, (status) => {
        assert.equal(status.error, false);
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('issues the correct RESTful request for channels groups w/ ttl', (done) => {
      const scope = utils.createNock().get('/v2/auth/grant/sub-key/mySubscribeKey')
      .query({
        timestamp: 1317427200,
        'channel-group': 'cg1,cg2',
        auth: 'key1,key2',
        uuid: 'myUUID',
        pnsdk: 'PubNub-JS-Nodejs/suchJavascript',
        signature: 'CAPs9l4jliNPnle-Tx7PjZCLTYQYg9CU9YKaiAYTuRQ=',
        r: 1,
        w: 1,
        m: 0,
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
