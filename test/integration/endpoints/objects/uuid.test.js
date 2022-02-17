/*       */

import nock from 'nock';
import utils from '../../../utils';
import PubNub from '../../../../src/node/index';

import { asResponse, allUsers, user1 } from './fixtures';

describe('objects UUID', () => {
  const SUBSCRIBE_KEY = 'mySubKey';
  const PUBLISH_KEY = 'myPublishKey';
  const UUID = 'myUUID';
  const AUTH_KEY = 'myAuthKey';

  let pubnub;
  let PNSDK;

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({
      subscribeKey: SUBSCRIBE_KEY,
      publishKey: PUBLISH_KEY,
      uuid: UUID,
      authKey: AUTH_KEY,
    });
    PNSDK = `PubNub-JS-Nodejs/${pubnub.getVersion()}`;
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
          limit: 100,
        })
        .reply(200, {
          status: 200,
          data: allUsers.map(asResponse),
        });

      const result = await pubnub.objects.getAllUUIDMetadata();

      scope.done();
      await expect(result).toEqual({
        status: 200,
        data: allUsers.map(asResponse),
        prev: undefined,
        next: undefined,
        totalCount: undefined,
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
          limit: 100,
        })
        .reply(403, {
          status: 403,
          error: {},
        });

      const resultP = pubnub.objects.getAllUUIDMetadata();

      scope.done();
      await expect(resultP).rejects.toThrowError();
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
          include: 'custom',
        })
        .reply(200, {
          status: 200,
          data: asResponse(user1),
        });

      const result = await pubnub.objects.getUUIDMetadata();

      scope.done();
      await expect(result).toEqual({
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
          include: 'custom',
        })
        .reply(200, {
          status: 200,
          data: asResponse(user1),
        });

      const result = await pubnub.objects.getUUIDMetadata({
        uuid: otherUUID,
        include: { customFields: true },
      });

      scope.done();
      await expect(result).toEqual({
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
          include: 'custom',
        })
        .reply(200, {
          status: 200,
          data: asResponse(user1),
        });

      const result = await pubnub.objects.getUUIDMetadata({
        uuid: otherUUID,
        include: { customFields: true },
      });

      scope.done();
      await expect(result).toEqual({
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
          include: 'custom',
        })
        .reply(200, {
          status: 200,
          data: asResponse(user1),
        });

      const result = await pubnub.objects.setUUIDMetadata({ data: user1.data });

      scope.done();
      await expect(result).toEqual({
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
          include: 'custom',
        })
        .reply(200, {
          status: 200,
          data: asResponse(user1),
        });

      const result = await pubnub.objects.setUUIDMetadata({ data: user1.data });

      scope.done();
      await expect(result).toEqual({
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
          include: 'custom',
        })
        .reply(200, {
          status: 200,
          data: asResponse(user1),
        });

      const result = await pubnub.objects.setUUIDMetadata({
        uuid: otherUUID,
        data: user1.data,
      });

      scope.done();
      await expect(result).toEqual({
        status: 200,
        data: asResponse(user1),
      });
    });

    it('should reject if data is missing', async () => {
      // $FlowFixMe This is intentional to suppress Flow error
      const result = pubnub.objects.setUUIDMetadata();

      await expect(result).rejects.toThrowError();
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

      const result = await pubnub.objects.removeUUIDMetadata();

      scope.done();
      await expect(result).toEqual({
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

      const result = await pubnub.objects.removeUUIDMetadata({
        uuid: otherUUID,
      });

      scope.done();
      await expect(result).toEqual({
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

      const result = await pubnub.objects.removeUUIDMetadata({
        uuid: otherUUID,
      });

      scope.done();
      await expect(result).toEqual({
        status: 200,
        data: {},
      });
    });

    it('should reject if uuid is missing', async () => {
      // $FlowFixMe This is intentional to suppress Flow error
      const result = pubnub.objects.removeUUIDMetadata();

      await expect(result).rejects.toThrowError();
    });
  });
});
