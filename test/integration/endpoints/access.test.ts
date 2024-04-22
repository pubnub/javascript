/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import sinon from 'sinon';
import nock from 'nock';

import PubNub from '../../../src/node/index';
import utils from '../../utils';

describe('access endpoints', () => {
  let clock: sinon.SinonFakeTimers;
  let pubnub: PubNub;

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
    pubnub = new PubNub({
      subscribeKey: 'mySubscribeKey',
      publishKey: 'myPublishKey',
      secretKey: 'mySecretKey',
      origin: 'ps.pndsn.com',
      // @ts-expect-error Remove request identifier to match with hardcoded test signature
      useRequestId: false,
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
          '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"mySubscribeKey","channel-group":"cg2","auths":{"key1":{"r":1,"m":1,"w":1,"d":1}}},"service":"Access Manager","status":200}',
          { 'content-type': 'text/javascript' },
        );

      pubnub.audit({ channel: 'ch1' }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert.deepEqual(response, {
            level: "channel-group+auth",
            subscribe_key: "mySubscribeKey",
            "channel-group": "cg2",
            auths: {
              key1: {
                r: 1,
                m: 1,
                w: 1,
                d: 1
              }
            }
          });
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
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
          '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"mySubscribeKey","channel-group":"cg2","auths":{"key1":{"r":1,"m":1,"w":1,"d":1}}},"service":"Access Manager","status":200}',
          { 'content-type': 'text/javascript' },
        );

      pubnub.audit({ channelGroup: 'cg1' }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert.deepEqual(response, {
            level: "channel-group+auth",
            subscribe_key: "mySubscribeKey",
            "channel-group": "cg2",
            auths: {
              key1: {
                r: 1,
                m: 1,
                w: 1,
                d: 1
              }
            }
          });
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
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
          '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"mySubscribeKey","channel-group":"cg2","auths":{"key1":{"r":1,"m":1,"w":1,"d":1}}},"service":"Access Manager","status":200}',
          { 'content-type': 'text/javascript' },
        );

      pubnub.audit({ authKeys: ['key1', 'key2'] }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert.deepEqual(response, {
            level: "channel-group+auth",
            subscribe_key: "mySubscribeKey",
            "channel-group": "cg2",
            auths: {
              key1: {
                r: 1,
                m: 1,
                w: 1,
                d: 1
              }
            }
          });
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
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
          signature: 'v2.LEJCwKOBTApWy5jcdXPmtN1_N2aaJx0ZN3krPY6oLu8',
          r: 0,
          w: 0,
          m: 0,
          d: 0,
          g: 0,
          j: 0,
          u: 0,
        })
        .reply(
          200,
          '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"mySubscribeKey","channel-group":"cg2","auths":{"key1":{"r":0,"m":0,"w":0,"d":0}}},"service":"Access Manager","status":200}',
          { 'content-type': 'text/javascript' },
        );

      pubnub.grant({ channels: ['ch1', 'ch2'], authKeys: ['key1', 'key2'] }, (status) => {
        try {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
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
          signature: 'v2.ju-0ZJpcAk_Qm1vXe5FVsj6pkamMNkd6oatZAW_bLQ0',
          r: 1,
          w: 1,
          m: 0,
          d: 0,
          g: 0,
          j: 0,
          u: 0,
        })
        .reply(
          200,
          '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"mySubscribeKey","channel-group":"cg2","auths":{"key1":{"r":1,"m":1,"w":1,"d":1}}},"service":"Access Manager","status":200}',
          { 'content-type': 'text/javascript' },
        );

      pubnub.grant(
        {
          channelGroups: ['cg1', 'cg2'],
          authKeys: ['key1', 'key2'],
          read: true,
          write: true,
        },
        (status) => {
          try {
            assert.equal(status.error, false);
            assert.equal(scope.isDone(), true);
            done();
          } catch (error) {
            done(error);
          }
        },
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
          signature: 'v2.zneRpaqzdxJPegBrJHWMzj-mD8QVBxqh8Zl15N7n2d4',
          r: 1,
          w: 1,
          m: 0,
          d: 0,
          ttl: 1337,
          g: 0,
          j: 0,
          u: 0,
        })
        .reply(
          200,
          '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"mySubscribeKey","channel-group":"cg2","auths":{"key1":{"r":1,"m":0,"w":1,"d":0}}},"service":"Access Manager","status":200}',
          { 'content-type': 'text/javascript' },
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
          try {
            assert.equal(status.error, false);
            assert.equal(scope.isDone(), true);
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });

    it('issues the correct RESTful request for uuids', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/auth/grant/sub-key/mySubscribeKey')
        .query({
          timestamp: 1317427200,
          'target-uuid': 'uuid-1,uuid-2',
          auth: 'key1,key2',
          uuid: 'myUUID',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          signature: 'v2.v2PTWPil0EaEYHemsVjZFKXeW4n26ZaEND9bfQYoi8M',
          r: 0,
          w: 0,
          m: 0,
          d: 1,
          g: 1,
          j: 0,
          u: 1,
        })
        .reply(
          200,
          '{"message":"Success","payload":{"level":"uuid","subscribe_key":"mySubscribeKey","target-uuid":"uuid-1,uuid-2","auths":{"key1":{"r":0,"m":0,"w":0,"d":0}}},"service":"Access Manager","status":200}',
          { 'content-type': 'text/javascript' },
        );

      pubnub.grant(
        { uuids: ['uuid-1', 'uuid-2'], authKeys: ['key1', 'key2'], get: true, update: true, delete: true },
        (status) => {
          try {
            assert.equal(status.error, false);
            assert.equal(scope.isDone(), true);
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });
    it('issues the correct RESTful request for uuids w/ ttl', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/auth/grant/sub-key/mySubscribeKey')
        .query({
          timestamp: 1317427200,
          'target-uuid': 'uuid-1,uuid-2',
          auth: 'key1,key2',
          uuid: 'myUUID',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          signature: 'v2.rTsZBrWV9IsI7XI6-UpWdO4b3DcrvIF_rcqzw48i_2I',
          r: 0,
          w: 0,
          m: 0,
          d: 1,
          ttl: 1337,
          g: 1,
          j: 0,
          u: 1,
        })
        .reply(
          200,
          '{"message":"Success","payload":{"level":"uuid","subscribe_key":"mySubscribeKey","target-uuid":"uuid-1,uuid-2","auths":{"key1":{"r":0,"m":0,"w":0,"d":1,"j":0,"g":1,"u":1}}},"service":"Access Manager","status":200}',
          { 'content-type': 'text/javascript' },
        );

      pubnub.grant(
        {
          uuids: ['uuid-1', 'uuid-2'],
          authKeys: ['key1', 'key2'],
          get: true,
          update: true,
          delete: true,
          ttl: 1337,
        },
        (status) => {
          try {
            assert.equal(status.error, false);
            assert.equal(scope.isDone(), true);
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });
    describe('##validation', () => {
      it('channelGroups and uuids in single request', (done) => {
        const scope = utils
          .createNock()
          .get('/v2/auth/grant/sub-key/mySubscribeKey')
          .query({
            timestamp: 1317427200,
            'channel-group': 'cg1,cg2',
            'target-uuid': 'uuid-1, uuid-2',
            auth: 'key1,key2',
            uuid: 'myUUID',
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            signature: 'v2.zneRpaqzdxJPegBrJHWMzj-mD8QVBxqh8Zl15N7n2d4',
            r: 1,
            w: 1,
            m: 0,
            d: 0,
            ttl: 1337,
            g: 0,
            j: 0,
            u: 0,
          })
          .reply(
            200,
            '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"mySubscribeKey","channel-group":"cg2","auths":{"key1":{"r":1,"m":0,"w":1,"d":0}}},"service":"Access Manager","status":200}',
            { 'content-type': 'text/javascript' },
          );

        pubnub
          .grant({
            channelGroups: ['cg1', 'cg2'],
            uuids: ['uuid-1', 'uuid-2'],
            authKeys: ['key1', 'key2'],
            read: true,
            write: true,
            ttl: 1337,
          })
          .catch((error) => {
            try {
              assert.equal(scope.isDone(), false);
              assert.equal(
                error.status.message,
                "Both channel/channel group and uuid cannot be used in the same request"
              );
              done();
            } catch (error) {
              done(error);
            }
          });
      });

      it('channels and uuids in single request', (done) => {
        const scope = utils
          .createNock()
          .get('/v2/auth/grant/sub-key/mySubscribeKey')
          .query({
            timestamp: 1317427200,
            channel: 'ch1,ch2',
            'target-uuid': 'uuid-1, uuid-2',
            auth: 'key1,key2',
            uuid: 'myUUID',
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            signature: 'v2.zneRpaqzdxJPegBrJHWMzj-mD8QVBxqh8Zl15N7n2d4',
            r: 1,
            w: 1,
            m: 0,
            d: 0,
            ttl: 1337,
            g: 0,
            j: 0,
            u: 0,
          })
          .reply(
            200,
            '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"mySubscribeKey","channel-group":"cg2","auths":{"key1":{"r":1,"m":0,"w":1,"d":0}}},"service":"Access Manager","status":200}',
            { 'content-type': 'text/javascript' },
          );
        pubnub
          .grant({
            channels: ['ch1', 'ch2'],
            uuids: ['uuid-1', 'uuid-2'],
            authKeys: ['key1', 'key2'],
            read: true,
            write: true,
            ttl: 1337,
          })
          .catch((error) => {
            try {
              assert.equal(scope.isDone(), false);
              assert.equal(
                error.status.message,
                "Both channel/channel group and uuid cannot be used in the same request"
              );
              done();
            } catch (error) {
              done(error);
            }
          });
      });

      it('uuids and empty authKeys', (done) => {
        const scope = utils
          .createNock()
          .get('/v2/auth/grant/sub-key/mySubscribeKey')
          .query({
            timestamp: 1317427200,
            'target-uuid': 'uuid-1,uuid-2',
            uuid: 'myUUID',
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            signature: 'v2.zneRpaqzdxJPegBrJHWMzj-mD8QVBxqh8Zl15N7n2d4',
            r: 1,
            w: 1,
            m: 0,
            d: 0,
            ttl: 1337,
            g: 0,
            j: 0,
            u: 0,
          })
          .reply(
            200,
            '{"message":"Success","payload":{"level":"uuid","subscribe_key":"mySubscribeKey","channel-group":"cg2","auths":{"key1":{"r":1,"m":0,"w":1,"d":0}}},"service":"Access Manager","status":200}',
            { 'content-type': 'text/javascript' },
          );
        pubnub
          .grant({
            uuids: ['uuid-1', 'uuid-2'],
            read: true,
            write: true,
            ttl: 1337,
          })
          .catch((error) => {
            try {
              assert.equal(scope.isDone(), false);
              assert.equal(error.status.message, "authKeys are required for grant request on uuids");
              done();
            } catch (error) {
              done(error);
            }
          });
      });
    });
  });
});

describe('access endpoints telemetry', () => {
  let pubnub: PubNub;

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
      // @ts-expect-error Force override default value.
      useRequestId: false,
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

      utils
        .runAPIWithResponseDelays(
          scope,
          200,
          '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"mySubscribeKey","channel-group":"cg2","auths":{"key1":{"r":1,"m":1,"w":1,"d":1}}},"service":"Access Manager","status":200}',
          delays,
          (completion) => {
            pubnub.audit({ channel: 'ch1' }, () => {
              completion();
            });
          },
        )
        .then((lastRequest) => {
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

      utils
        .runAPIWithResponseDelays(
          scope,
          200,
          '{"message":"Success","payload":{"level":"channel-group+auth","subscribe_key":"mySubscribeKey","channel-group":"cg2","auths":{"key1":{"r":1,"m":1,"w":1,"d":1}}},"service":"Access Manager","status":200}',
          delays,
          (completion) => {
            pubnub.grant({ channels: ['ch1', 'ch2'], authKeys: ['key1', 'key2'] }, () => {
              completion();
            });
          },
        )
        .then((lastRequest) => {
          done();
        });
    }).timeout(20000);
  });
});
