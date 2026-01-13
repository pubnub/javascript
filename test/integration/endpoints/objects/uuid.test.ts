import { expect } from 'chai';
import nock from 'nock';

import { asResponse, allUsers, user1 } from './fixtures';
import PubNub from '../../../../src/node/index';
import { RetryPolicy } from '../../../../src/core/components/retry-policy.js';
import utils from '../../../utils';

describe('objects UUID', () => {
  const PUBLISH_KEY = 'myPublishKey';
  const SUBSCRIBE_KEY = 'mySubKey';
  const AUTH_KEY = 'myAuthKey';
  const UUID = 'myUUID';

  let pubnub: PubNub;
  let PNSDK: string;

  before(() => {
    nock.disableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({
      subscribeKey: SUBSCRIBE_KEY,
      publishKey: PUBLISH_KEY,
      uuid: UUID,
      // @ts-expect-error Force override default value.
      useRequestId: false,
      authKey: AUTH_KEY,
    });
    PNSDK = `PubNub-JS-Nodejs/${pubnub.getVersion()}`;
  });

  afterEach(() => {
    pubnub.destroy(true);
  });

  describe('getAllUUIDMetadata', () => {
    it('should resolve to a list of UUID metadata', async () => {
      const scope = utils
        .createNock()
        .get(`/v2/objects/${SUBSCRIBE_KEY}/uuids`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type',
          limit: 100,
        })
        .reply(200, {
          status: 200,
          data: allUsers.map(asResponse),
        });

      const resultP = pubnub.objects.getAllUUIDMetadata();

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.deep.equal({
        status: 200,
        data: allUsers.map(asResponse),
      });
    });

    it('should reject if status is not 200', async () => {
      const scope = utils
        .createNock()
        .get(`/v2/objects/${SUBSCRIBE_KEY}/uuids`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type',
          limit: 100,
        })
        .reply(403, {
          status: 403,
          error: {},
        });

      const resultP = pubnub.objects.getAllUUIDMetadata();

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.be.rejected;
    });
  });

  describe('getUUIDMetadata', () => {
    it('should resolve to UUID metadata without UUID passed in', async () => {
      const scope = utils
        .createNock()
        .get(`/v2/objects/${SUBSCRIBE_KEY}/uuids/${UUID}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
        })
        .reply(200, {
          status: 200,
          data: asResponse(user1),
        });

      const resultP = pubnub.objects.getUUIDMetadata();

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.deep.equal({
        status: 200,
        data: asResponse(user1),
      });
    });

    it('should resolve to UUID metadata with UUID passed in', async () => {
      const otherUUID = 'otherUUID';

      const scope = utils
        .createNock()
        .get(`/v2/objects/${SUBSCRIBE_KEY}/uuids/${otherUUID}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
        })
        .reply(200, {
          status: 200,
          data: asResponse(user1),
        });

      const resultP = pubnub.objects.getUUIDMetadata({
        uuid: otherUUID,
        include: { customFields: true },
      });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.deep.equal({
        status: 200,
        data: asResponse(user1),
      });
    });

    it('should resolve to encoded UUID metadata with UUID passed in', async () => {
      const otherUUID = 'otherUUID#1';
      const encodedOtherUUID = 'otherUUID%231';

      const scope = utils
        .createNock()
        .get(`/v2/objects/${SUBSCRIBE_KEY}/uuids/${encodedOtherUUID}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
        })
        .reply(200, {
          status: 200,
          data: asResponse(user1),
        });

      const resultP = pubnub.objects.getUUIDMetadata({
        uuid: otherUUID,
        include: { customFields: true },
      });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.deep.equal({
        status: 200,
        data: asResponse(user1),
      });
    });
  });

  describe('setUUIDMetadata', () => {
    it('should resolve to updated UUID metadata without UUID passed in', async () => {
      const scope = utils
        .createNock()
        .patch(`/v2/objects/${SUBSCRIBE_KEY}/uuids/${UUID}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
        })
        .reply(200, {
          status: 200,
          data: asResponse(user1),
        });

      const resultP = pubnub.objects.setUUIDMetadata({ data: user1.data });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.deep.equal({
        status: 200,
        data: asResponse(user1),
      });
    });

    it('should resolve to updated UUID metadata with UUID passed in', async () => {
      const scope = utils
        .createNock()
        .patch(`/v2/objects/${SUBSCRIBE_KEY}/uuids/${UUID}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
        })
        .reply(200, {
          status: 200,
          data: asResponse(user1),
        });

      const resultP = pubnub.objects.setUUIDMetadata({ data: user1.data });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.deep.equal({
        status: 200,
        data: asResponse(user1),
      });
    });

    it('should resolve to updated encoded UUID metadata with UUID passed in', async () => {
      const otherUUID = 'otherUUID#1';
      const encodedOtherUUID = 'otherUUID%231';

      const scope = utils
        .createNock()
        .patch(`/v2/objects/${SUBSCRIBE_KEY}/uuids/${encodedOtherUUID}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
        })
        .reply(200, {
          status: 200,
          data: asResponse(user1),
        });

      const resultP = pubnub.objects.setUUIDMetadata({
        uuid: otherUUID,
        data: user1.data,
      });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.deep.equal({
        status: 200,
        data: asResponse(user1),
      });
    });

    it('should reject if data is missing', async () => {
      // @ts-expect-error Intentionally don't include `data`.
      const resultP = pubnub.objects.setUUIDMetadata();

      await expect(resultP).to.be.rejected;
    });
  });

  describe('removeUUIDMetadata', () => {
    it('should resolve to UUID without UUID passed in', async () => {
      const scope = utils
        .createNock()
        .delete(`/v2/objects/${SUBSCRIBE_KEY}/uuids/${UUID}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
        })
        .reply(200, { status: 200, data: {} });

      const resultP = pubnub.objects.removeUUIDMetadata();

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.deep.equal({
        status: 200,
        data: {},
      });
    });

    it('should resolve to UUID with UUID passed in', async () => {
      const otherUUID = 'otherUUID';

      const scope = utils
        .createNock()
        .delete(`/v2/objects/${SUBSCRIBE_KEY}/uuids/${otherUUID}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
        })
        .reply(200, { status: 200, data: {} });

      const resultP = pubnub.objects.removeUUIDMetadata({ uuid: otherUUID });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.deep.equal({
        status: 200,
        data: {},
      });
    });

    it('should resolve to encoded UUID with UUID passed in', async () => {
      const otherUUID = 'otherUUID#1';
      const encodedOtherUUID = 'otherUUID%231';

      const scope = utils
        .createNock()
        .delete(`/v2/objects/${SUBSCRIBE_KEY}/uuids/${encodedOtherUUID}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
        })
        .reply(200, { status: 200, data: {} });

      const resultP = pubnub.objects.removeUUIDMetadata({ uuid: otherUUID });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.deep.equal({
        status: 200,
        data: {},
      });
    });
  });

  describe('retry policy', () => {
    it('should not retry on 404 Not Found error with linear retry policy', async () => {
      const nonExistentUUID = 'non-existent-uuid';

      // Set up nock mock before creating PubNub instance
      const scope = utils
        .createNock()
        .get(`/v2/objects/${SUBSCRIBE_KEY}/uuids/${nonExistentUUID}`)
        .times(1)
        .query(true)
        .reply(404, {
          status: 404,
          error: {
            message: 'Requested object was not found.',
            source: 'objects',
          },
        });

      // Create a new PubNub instance with linear retry policy
      const pubnubWithRetry = new PubNub({
        subscribeKey: SUBSCRIBE_KEY,
        publishKey: PUBLISH_KEY,
        uuid: UUID,
        // @ts-expect-error Force override default value.
        useRequestId: false,
        authKey: AUTH_KEY,
        retryConfiguration: RetryPolicy.LinearRetryPolicy({
          delay: 2,
          maximumRetry: 2,
        }),
      });

      let caughtError: any;
      try {
        await pubnubWithRetry.objects.getUUIDMetadata({ uuid: nonExistentUUID });
      } catch (error) {
        caughtError = error;
      }

      // Verify that an error was thrown
      expect(caughtError).to.exist;

      // Verify the error status code is 404
      expect(caughtError).to.have.property('status');
      expect(caughtError.status.statusCode).to.equal(404);

      // Verify the error message
      expect(caughtError.status.errorData).to.exist;
      expect(caughtError.status.errorData.error).to.exist;
      expect(caughtError.status.errorData.error.message).to.equal('Requested object was not found.');
      expect(caughtError.status.errorData.error.source).to.equal('objects');

      // Verify the scope was called exactly once (no retries on 404)
      expect(scope.isDone()).to.be.true;

      pubnubWithRetry.destroy(true);
    });
  });
});
