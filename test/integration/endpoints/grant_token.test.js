/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import sinon from 'sinon';
import utils from '../../utils';
import PubNub from '../../../src/node/index';

describe('grant token endpoint', () => {
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
            signature: 'v2.CLurDTyT2OL1mMlQEUHEwfXqXvjSJ_NHTgJvgkG_5ek',
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

      it('fail on resources without any user resource permissions', (done) => {
        const scope = utils
          .createNock()
          .post('/v3/pam/mySubscribeKey/grant')
          .query({
            uuid: 'myUUID',
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            timestamp: 1571360790,
            signature: 'v2.CLurDTyT2OL1mMlQEUHEwfXqXvjSJ_NHTgJvgkG_5ek',
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
              users: {

              }
            },
          }
        ).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing values for either Resources or Patterns.');
          done();
        });
      });

      it('fail on resources without any user pattern permissions', (done) => {
        const scope = utils
          .createNock()
          .post('/v3/pam/mySubscribeKey/grant')
          .query({
            uuid: 'myUUID',
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            timestamp: 1571360790,
            signature: 'v2.CLurDTyT2OL1mMlQEUHEwfXqXvjSJ_NHTgJvgkG_5ek',
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
              users: {

              }
            },
          }
        ).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing values for either Resources or Patterns.');
          done();
        });
      });

      it('fail on resources without any space resource permissions', (done) => {
        const scope = utils
          .createNock()
          .post('/v3/pam/mySubscribeKey/grant')
          .query({
            uuid: 'myUUID',
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            timestamp: 1571360790,
            signature: 'v2.CLurDTyT2OL1mMlQEUHEwfXqXvjSJ_NHTgJvgkG_5ek',
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
              spaces: {

              }
            },
          }
        ).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing values for either Resources or Patterns.');
          done();
        });
      });

      it('fail on resources without any space pattern permissions', (done) => {
        const scope = utils
          .createNock()
          .post('/v3/pam/mySubscribeKey/grant')
          .query({
            uuid: 'myUUID',
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            timestamp: 1571360790,
            signature: 'v2.CLurDTyT2OL1mMlQEUHEwfXqXvjSJ_NHTgJvgkG_5ek',
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
              spaces: {

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

    it('issues the correct RESTful request for users and spaces', (done) => {
      const scope = utils
        .createNock()
        .post('/v3/pam/mySubscribeKey/grant', '{"ttl":1440,"permissions":{"resources":{"channels":{},"groups":{},"users":{"user1":1},"spaces":{"space1":1}},"patterns":{"channels":{},"groups":{},"users":{".*":1},"spaces":{".*":1}},"meta":{}}}')
        .query({
          uuid: 'myUUID',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          timestamp: 1571360790,
          signature: 'v2.CLurDTyT2OL1mMlQEUHEwfXqXvjSJ_NHTgJvgkG_5ek',
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
            users: {
              user1: {
                read: true
              },
            },
            spaces: {
              space1: {
                read: true
              },
            },
          },
          patterns: {
            users: {
              '.*': {
                read: true
              },
            },
            spaces: {
              '.*': {
                read: true
              },
            },
          }
        },
        (status) => {
          assert.equal(scope.isDone(), true);
          assert.equal(status.error, false);
          done();
        }
      );
    });
  });
});
