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
    clock = sinon.useFakeTimers(
      new Date(Date.UTC(2011, 9, 1, 0, 0, 0)).getTime()
    );
  });

  after(() => {
    clock.restore();
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({
      subscribeKey: 'mySubscribeKey',
      publishKey: 'myPublishKey',
      secretKey: 'mySecretKey',
      uuid: 'myUUID',
    });
    pubnub._config.getVersion = () => 'suchJavascript';
  });

  describe('#audit', () => {
    it('issues the correct RESTful request for channels', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/auth/audit/sub-key/mySubscribeKey')
        .query({
          timestamp: 1317427200,
          channel: 'ch1',
          uuid: 'myUUID',
          pnsdk: 'PubNub-JS-Nodejs/suchJavascript',
          signature: 'v2.I7AFqanrAAtwVfvLHyKECTWw7UcZmwbRnwENpXdGB9E',
        })
        .reply(
          200,
          '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"mySubscribeKey","channel-group":"cg2","auths":{"key1":{"r":1,"m":1,"w":1,"d":1}}},"service":"Access Manager","status":200}'
        );

      pubnub.audit({ channel: 'ch1' }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response, {
          level: 'channel-group+auth',
          subscribe_key: 'mySubscribeKey',
          'channel-group': 'cg2',
          auths: {
            key1: {
              r: 1,
              m: 1,
              w: 1,
              d: 1,
            },
          },
        });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('issues the correct RESTful request for channel groups', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/auth/audit/sub-key/mySubscribeKey')
        .query({
          timestamp: 1317427200,
          'channel-group': 'cg1',
          uuid: 'myUUID',
          pnsdk: 'PubNub-JS-Nodejs/suchJavascript',
          signature: 'v2.2hdDeYpF_Hoo4XLK2CMlZApcLin5lJxh6vsKMQnTet8',
        })
        .reply(
          200,
          '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"mySubscribeKey","channel-group":"cg2","auths":{"key1":{"r":1,"m":1,"w":1,"d":1}}},"service":"Access Manager","status":200}'
        );

      pubnub.audit({ channelGroup: 'cg1' }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response, {
          level: 'channel-group+auth',
          subscribe_key: 'mySubscribeKey',
          'channel-group': 'cg2',
          auths: {
            key1: {
              r: 1,
              m: 1,
              w: 1,
              d: 1,
            },
          },
        });
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('issues the correct RESTful request for keys', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/auth/audit/sub-key/mySubscribeKey')
        .query({
          timestamp: 1317427200,
          auth: 'key1,key2',
          uuid: 'myUUID',
          pnsdk: 'PubNub-JS-Nodejs/suchJavascript',
          signature: 'v2.lVKZELiJFleDoPqMkSgojCUsX39AZqop7bKVyHv-T_s',
        })
        .reply(
          200,
          '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"mySubscribeKey","channel-group":"cg2","auths":{"key1":{"r":1,"m":1,"w":1,"d":1}}},"service":"Access Manager","status":200}'
        );

      pubnub.audit({ authKeys: ['key1', 'key2'] }, (status, response) => {
        assert.equal(status.error, false);
        assert.deepEqual(response, {
          level: 'channel-group+auth',
          subscribe_key: 'mySubscribeKey',
          'channel-group': 'cg2',
          auths: {
            key1: {
              r: 1,
              m: 1,
              w: 1,
              d: 1,
            },
          },
        });
        assert.equal(scope.isDone(), true);
        done();
      });
    });
  });

  describe('#grant', () => {
    it('issues the correct RESTful request for channels', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/auth/grant/sub-key/mySubscribeKey')
        .query({
          timestamp: 1317427200,
          channel: 'ch1,ch2',
          auth: 'key1,key2',
          uuid: 'myUUID',
          pnsdk: 'PubNub-JS-Nodejs/suchJavascript',
          signature: 'v2.8TcjX3viAUgXA92Olz7L6JEZJdce7bmHXRvrWYaSf5c',
          r: 0,
          w: 0,
          m: 0,
          d: 0,
        })
        .reply(
          200,
          '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"mySubscribeKey","channel-group":"cg2","auths":{"key1":{"r":0,"m":0,"w":0,"d":0}}},"service":"Access Manager","status":200}'
        );

      pubnub.grant(
        { channels: ['ch1', 'ch2'], authKeys: ['key1', 'key2'] },
        (status) => {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('issues the correct RESTful request for channels groups', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/auth/grant/sub-key/mySubscribeKey')
        .query({
          timestamp: 1317427200,
          'channel-group': 'cg1,cg2',
          auth: 'key1,key2',
          uuid: 'myUUID',
          pnsdk: 'PubNub-JS-Nodejs/suchJavascript',
          signature: 'v2.-3zcZp_1Frmux2e90a49Rcf5oYH1v7SxfVKaCSRzwEo',
          r: 1,
          w: 1,
          m: 0,
          d: 0,
        })
        .reply(
          200,
          '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"mySubscribeKey","channel-group":"cg2","auths":{"key1":{"r":1,"m":1,"w":1,"d":1}}},"service":"Access Manager","status":200}'
        );

      pubnub.grant(
        {
          channelGroups: ['cg1', 'cg2'],
          authKeys: ['key1', 'key2'],
          read: true,
          write: true,
        },
        (status) => {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('issues the correct RESTful request for channels groups w/ ttl', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/auth/grant/sub-key/mySubscribeKey')
        .query({
          timestamp: 1317427200,
          'channel-group': 'cg1,cg2',
          auth: 'key1,key2',
          uuid: 'myUUID',
          pnsdk: 'PubNub-JS-Nodejs/suchJavascript',
          signature: 'v2.eWVAWEi8kDxs0EcgGrGNysjDEJ2nYI9Jhh54f8clA0Q',
          r: 1,
          w: 1,
          m: 0,
          d: 0,
          ttl: 1337,
        })
        .reply(
          200,
          '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"mySubscribeKey","channel-group":"cg2","auths":{"key1":{"r":1,"m":0,"w":1,"d":0}}},"service":"Access Manager","status":200}'
        );

      pubnub.grant(
        {
          channelGroups: ['cg1', 'cg2'],
          authKeys: ['key1', 'key2'],
          read: true,
          write: true,
          ttl: 1337,
        },
        (status) => {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });
  });
});

describe('access endpoints telemetry', () => {
  let pubnub;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({
      subscribeKey: 'mySubscribeKey',
      publishKey: 'myPublishKey',
      secretKey: 'mySecretKey',
      uuid: 'myUUID',
    });
    pubnub._config.getVersion = () => 'suchJavascript';
  });

  describe('#audit', () => {
    it('should add PAM audit API telemetry information', (done) => {
      let scope = utils.createNock().get('/v2/auth/audit/sub-key/mySubscribeKey').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"mySubscribeKey","channel-group":"cg2","auths":{"key1":{"r":1,"m":1,"w":1,"d":1}}},"service":"Access Manager","status":200}',
        delays,
        (completion) => {
          pubnub.audit(
            { channel: 'ch1' },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_pam', average, leeway);
          done();
        });
    }).timeout(20000);
  });

  describe('#grant', () => {
    it('should add PAM grant API telemetry information', (done) => {
      let scope = utils.createNock().get('/v2/auth/grant/sub-key/mySubscribeKey').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"mySubscribeKey","channel-group":"cg2","auths":{"key1":{"r":1,"m":1,"w":1,"d":1}}},"service":"Access Manager","status":200}',
        delays,
        (completion) => {
          pubnub.grant(
            { channels: ['ch1', 'ch2'], authKeys: ['key1', 'key2'] },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_pam', average, leeway);
          done();
        });
    }).timeout(20000);
  });
});
