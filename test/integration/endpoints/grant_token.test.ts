import assert from 'assert';
import nock from 'nock';
import sinon from 'sinon';
import utils from '../../utils';
import PubNub from '../../../src/node/index';
import { PubNubError } from '../../../src/errors/pubnub-error';

describe('grant token endpoint', () => {
  let originalVersionFunction: (() => string) | null = null;
  let clock: sinon.SinonFakeTimers;
  let pubnub: PubNub;

  before(() => {
    nock.disableNetConnect();
    clock = sinon.useFakeTimers(new Date(Date.UTC(2019, 9, 18, 1, 6, 30)).getTime());
  });

  after(() => {
    clock.restore();
    nock.enableNetConnect();
    pubnub._config.getVersion = originalVersionFunction!;
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
      autoNetworkDetection: false,
    });

    if (originalVersionFunction === null) {
      originalVersionFunction = pubnub._config.getVersion;
      pubnub._config.getVersion = () => 'testVersion';
    } else pubnub._config.getVersion = () => 'testVersion';
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
          .reply(200, {
            message: 'Success',
            data: {
              token: 'token',
            },
          });

        pubnub
          .grantToken({
            ttl: 1440,
          })
          .catch((err) => {
            try {
              assert.equal(scope.isDone(), false);
              assert.equal(err.status.message, "Missing values for either Resources or Patterns");
              done();
            } catch (error) {
              done(error);
            }
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
          .reply(200, {
            message: 'Success',
            data: {
              token: 'token',
            },
          });

        pubnub
          .grantToken({
            ttl: 1440,
            resources: {
              channels: {},
              groups: {},
              uuids: {},
            },
          })
          .catch((err) => {
            try {
              assert.equal(scope.isDone(), false);
              assert.equal(err.status.message, "Missing values for either Resources or Patterns");
              done();
            } catch (error) {
              done(error);
            }
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
          .reply(200, {
            message: 'Success',
            data: {
              token: 'token',
            },
          });

        pubnub
          .grantToken({
            ttl: 1440,
            patterns: {
              channels: {},
              groups: {},
              uuids: {},
            },
          })
          .catch((err) => {
            try {
              assert.equal(scope.isDone(), false);
              assert.equal(err.status.message, "Missing values for either Resources or Patterns");
              done();
            } catch (error) {
              done(error);
            }
          });
      });

      it('should throw when mixing legacy and VSP terms', async () => {
        try {
          await pubnub.grantToken({
            ttl: 1440,
            resources: {
              // @ts-expect-error It is not allowed to mix in VSP and new permissions type.
              users: { user1: { read: true } },
            },
            patterns: {
              channels: { '.*': { read: true } },
            },
          });
        } catch (e) {
          assert(e instanceof PubNubError);
          assert.strictEqual(
            e.status!.message,
            // eslint-disable-next-line max-len
            'Cannot mix `users`, `spaces` and `authorizedUserId` with `uuids`, `channels`, `groups` and `authorized_uuid`',
          );
        }
      });

      it('should correctly translate VSP terms into legacy terms', async () => {
        let scope = utils
          .createNock()
          .post(
            '/v3/pam/mySubscribeKey/grant',
            // eslint-disable-next-line max-len
            '{"ttl":1440,"permissions":{"resources":{"channels":{},"groups":{},"uuids":{"user1":1},"users":{},"spaces":{}},"patterns":{"channels":{},"groups":{},"uuids":{".*":1},"users":{},"spaces":{}},"meta":{}}}',
          )
          .query({
            uuid: 'myUUID',
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            timestamp: 1571360790,
            signature: 'v2.A1ldFjcfAiD0rw7-kFKKwY5j0Mpq1R5u8JDeej7P3jo',
          })
          .reply(200, {
            message: 'Success',
            data: {
              token: 'token',
            },
          });

        try {
          await pubnub.grantToken({
            ttl: 1440,
            resources: {
              // @ts-expect-error Intentianally using VSP types.
              users: { user1: { read: true } },
            },
            patterns: {
              // @ts-expect-error Intentianally using VSP types.
              users: { '.*': { read: true } },
            },
          });
        } catch (e) {
          assert(e instanceof PubNubError);
          console.log(e.status);
        }

        assert.strictEqual(scope.isDone(), true);
      });
    });
  });
});
