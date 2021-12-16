/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import sinon from 'sinon';
import utils from '../../utils';
import PubNub from '../../../src/node/index';

describe('grant token endpoint', () => {
  let originalVersionFunction = null;
  let pubnub;
  let clock;

  before(() => {
    nock.disableNetConnect();
    clock = sinon.useFakeTimers(
      new Date(Date.UTC(2019, 9, 18, 1, 6, 30)).getTime()
    );
  });

  after(() => {
    clock.restore();
    nock.enableNetConnect();
    pubnub._config.getVersion = originalVersionFunction;
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({
      subscribeKey: 'mySubscribeKey',
      publishKey: 'myPublishKey',
      secretKey: 'mySecretKey',
      uuid: 'myUUID',
      autoNetworkDetection: false,
    });

    if (originalVersionFunction === null) {
      originalVersionFunction = pubnub._config.getVersion;
      pubnub._config.getVersion = () => 'testVersion';
    }
  });

  describe('#grantToken', () => {
    describe('##validation', () => {
      it('ensure resources or patterns', (done) => {
        const scope = utils
          .createNock()
          .post('/v3/pam/mySubscribeKey/grant')
          .query({
            uuid: 'myUUID',
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            timestamp: 1571360790,
            signature: 'v2.pJobOYLaDTsauQo8UZa-4Eu4JKYYRuaeyPS8IHpNN-E',
          })
          .reply(
            200,
            {
              message: 'Success',
              data: {
                token: 'token'
              }
            }
          );

        pubnub.grantToken(
          {
            ttl: 1440
          }
        ).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing either Resources or Patterns.');
          done();
        });
      });

      it('fail on resources without any resource permissions', (done) => {
        const scope = utils
          .createNock()
          .post('/v3/pam/mySubscribeKey/grant')
          .query({
            uuid: 'myUUID',
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            timestamp: 1571360790,
            signature: 'v2.pJobOYLaDTsauQo8UZa-4Eu4JKYYRuaeyPS8IHpNN-E',
          })
          .reply(
            200,
            {
              message: 'Success',
              data: {
                token: 'token'
              }
            }
          );

        pubnub.grantToken(
          {
            ttl: 1440,
            resources: {
              channels: {

              },
              groups: {

              },
              uuids: {

              }
            },
          }
        ).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing values for either Resources or Patterns.');
          done();
        });
      });

      it('fail on resources without any pattern permissions', (done) => {
        const scope = utils
          .createNock()
          .post('/v3/pam/mySubscribeKey/grant')
          .query({
            uuid: 'myUUID',
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            timestamp: 1571360790,
            signature: 'v2.pJobOYLaDTsauQo8UZa-4Eu4JKYYRuaeyPS8IHpNN-E',
          })
          .reply(
            200,
            {
              message: 'Success',
              data: {
                token: 'token'
              }
            }
          );

        pubnub.grantToken(
          {
            ttl: 1440,
            patterns: {
              channels: {

              },
              groups: {

              },
              uuids: {

              }
            },
          }
        ).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing values for either Resources or Patterns.');
          done();
        });
      });
    });
  });
});

describe('grant token endpoint telemetry', () => {
  let originalVersionFunction = null;
  let pubnub;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
    pubnub._config.getVersion = originalVersionFunction;
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({
      subscribeKey: 'mySubscribeKey',
      publishKey: 'myPublishKey',
      secretKey: 'mySecretKey',
      uuid: 'myUUID',
      autoNetworkDetection: false,
    });

    if (originalVersionFunction === null) {
      originalVersionFunction = pubnub._config.getVersion;
      pubnub._config.getVersion = () => 'testVersion';
    }
  });

  describe('#grantToken', () => {
    it('should add PAM grant token API telemetry information', (done) => {
      let scope = utils.createNock().post('/v3/pam/mySubscribeKey/grant', '{"ttl":1440,"permissions":{"resources":{"channels":{},"groups":{},"uuids":{"user1":1},"users":{},"spaces":{}},"patterns":{"channels":{},"groups":{},"uuids":{".*":1},"users":{},"spaces":{}},"meta":{}}}').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        { message: 'Success', data: { token: 'token' } },
        delays,
        (completion) => {
          pubnub.grantToken(
            {
              ttl: 1440,
              resources: {
                channels: {},
                groups: {},
                uuids: { user1: { read: true }, },
              },
              patterns: {
                channels: {},
                groups: {},
                uuids: { '.*': { read: true }, },
              }
            },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_pamv3', average, leeway);
          done();
        });
    }).timeout(60000);
  });
});
