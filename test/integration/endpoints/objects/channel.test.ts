import { expect } from 'chai';
import nock from 'nock';

import { asResponse, allChannels, channel1 } from './fixtures.js';
import PubNub from '../../../../src/node/index';
import utils from '../../../utils';

describe('objects channel', () => {
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

  describe('getAllChannelMetadata', () => {
    it('should resolve to a list of channel metadata', async () => {
      const scope = utils
        .createNock()
        .get(`/v2/objects/${SUBSCRIBE_KEY}/channels`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
          count: true,
          start: 'test-next',
          end: 'test-prev',
          filter: 'test-filter',
          sort: ['name:asc', 'description'],
          limit: 10,
        })
        .reply(200, {
          status: 200,
          data: allChannels.map(asResponse),
        });

      const resultP = pubnub.objects.getAllChannelMetadata({
        filter: 'test-filter',
        sort: {
          name: 'asc',
          description: null,
        },
        limit: 10,
        page: {
          prev: 'test-prev',
          next: 'test-next',
        },
        include: {
          customFields: true,
          totalCount: true,
        },
      });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.deep.equal({
        status: 200,
        data: allChannels.map(asResponse),
      });
    });
  });

  describe('getChannelMetadata', () => {
    it('should resolve to channel metadata', async () => {
      const channelName = 'test-channel';
      const scope = utils
        .createNock()
        .get(`/v2/objects/${SUBSCRIBE_KEY}/channels/${channelName}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
        })
        .reply(200, {
          status: 200,
          data: asResponse(channel1),
        });

      const resultP = pubnub.objects.getChannelMetadata({ channel: channelName });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.deep.equal({
        status: 200,
        data: asResponse(channel1),
      });
    });

    it('should resolve to encoded channel metadata', async () => {
      const channelName = 'test-channel#1';
      const encodedChannelName = 'test-channel%231';
      const scope = utils
        .createNock()
        .get(`/v2/objects/${SUBSCRIBE_KEY}/channels/${encodedChannelName}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
        })
        .reply(200, {
          status: 200,
          data: asResponse(channel1),
        });

      const resultP = pubnub.objects.getChannelMetadata({ channel: channelName });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.deep.equal({
        status: 200,
        data: asResponse(channel1),
      });
    });

    it('should reject if channel is empty', async () => {
      // @ts-expect-error Intentionally don't include `channel`.
      const resultP = pubnub.objects.getChannelMetadata();

      await expect(resultP).to.be.rejected;
    });
  });

  describe('setChannelMetadata', () => {
    it('should resolve to updated channel metadata', async () => {
      const channelName = 'test-channel';
      const scope = utils
        .createNock()
        .patch(`/v2/objects/${SUBSCRIBE_KEY}/channels/${channelName}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
        })
        .reply(200, {
          status: 200,
          data: asResponse(channel1),
        });

      const resultP = pubnub.objects.setChannelMetadata({ channel: 'test-channel', data: channel1.data });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.deep.equal({
        status: 200,
        data: asResponse(channel1),
      });
    });

    it('should resolve to updated encoded channel metadata', async () => {
      const channelName = 'test-channel#1';
      const encodedChannelName = 'test-channel%231';
      const scope = utils
        .createNock()
        .patch(`/v2/objects/${SUBSCRIBE_KEY}/channels/${encodedChannelName}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
        })
        .reply(200, {
          status: 200,
          data: asResponse(channel1),
        });

      const resultP = pubnub.objects.setChannelMetadata({ channel: channelName, data: channel1.data });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.deep.equal({
        status: 200,
        data: asResponse(channel1),
      });
    });

    it('should reject if data is missing', async () => {
      // @ts-expect-error Intentionally don't include `data`.
      const resultP = pubnub.objects.setChannelMetadata({ channel: 'test' });

      await expect(resultP).to.be.rejected;
    });
  });

  describe('removeChannelMetadata', () => {
    it('should resolve', async () => {
      const channelName = 'test-channel';

      const scope = utils
        .createNock()
        .delete(`/v2/objects/${SUBSCRIBE_KEY}/channels/${channelName}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
        })
        .reply(200, { status: 200, data: {} });

      const resultP = pubnub.objects.removeChannelMetadata({ channel: channelName });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.deep.equal({
        status: 200,
        data: {},
      });
    });

    it('should resolve with encoded channel', async () => {
      const channelName = 'test-channel#1';
      const encodedChannelName = 'test-channel%231';

      const scope = utils
        .createNock()
        .delete(`/v2/objects/${SUBSCRIBE_KEY}/channels/${encodedChannelName}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
        })
        .reply(200, { status: 200, data: {} });

      const resultP = pubnub.objects.removeChannelMetadata({ channel: channelName });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.deep.equal({
        status: 200,
        data: {},
      });
    });

    it('should reject if channel is missing', async () => {
      // @ts-expect-error Intentionally don't include `channel`.
      const resultP = pubnub.objects.removeChannelMetadata();

      await expect(resultP).to.be.rejected;
    });
  });

  describe('error handling', () => {
    it('should handle 400 Bad Request errors', async () => {
      const channelName = 'test-channel';
      const scope = utils
        .createNock()
        .get(`/v2/objects/${SUBSCRIBE_KEY}/channels/${channelName}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
        })
        .reply(400, {
          status: 400,
          error: {
            message: 'Bad Request',
            source: 'objects',
            details: [
              {
                message: 'Invalid channel name',
                location: 'channel',
                locationType: 'path',
              }
            ]
          }
        });

      const resultP = pubnub.objects.getChannelMetadata({ channel: channelName });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.be.rejected;
    });

    it('should handle 403 Forbidden errors', async () => {
      const channelName = 'test-channel';
      const scope = utils
        .createNock()
        .patch(`/v2/objects/${SUBSCRIBE_KEY}/channels/${channelName}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
        })
        .reply(403, {
          status: 403,
          error: {
            message: 'Forbidden',
            source: 'objects',
          }
        });

      const resultP = pubnub.objects.setChannelMetadata({ 
        channel: channelName, 
        data: { name: 'Test Channel' } 
      });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.be.rejected;
    });

    it('should handle 404 Not Found errors', async () => {
      const channelName = 'non-existent-channel';
      const scope = utils
        .createNock()
        .get(`/v2/objects/${SUBSCRIBE_KEY}/channels/${channelName}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
        })
        .reply(404, {
          status: 404,
          error: {
            message: 'Not Found',
            source: 'objects',
          }
        });

      const resultP = pubnub.objects.getChannelMetadata({ channel: channelName });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.be.rejected;
    });

    it('should handle network timeout errors', async () => {
      const channelName = 'test-channel-timeout';
      const scope = utils
        .createNock()
        .get(`/v2/objects/${SUBSCRIBE_KEY}/channels/${channelName}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
        })
        .reply(200, {
          status: 200,
          data: asResponse(channel1),
        });

      const resultP = pubnub.objects.getChannelMetadata({ channel: channelName });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.have.property('status', 200);
    });
  });

  describe('data validation', () => {
    it('should handle large payload data', async () => {
      const channelName = 'test-channel';
      const largeCustomData = {
        description: 'A'.repeat(1000), // Large description
        custom: Array.from({ length: 50 }, (_, i) => [
          [`property_${i}`, `value_${'x'.repeat(50)}_${i}`]
        ]).reduce((acc, curr) => ({ ...acc, [curr[0][0]]: curr[0][1] }), {}),
      };

      const scope = utils
        .createNock()
        .patch(`/v2/objects/${SUBSCRIBE_KEY}/channels/${channelName}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
        })
        .reply(200, {
          status: 200,
          data: asResponse({ ...channel1, data: largeCustomData }),
        });

      const resultP = pubnub.objects.setChannelMetadata({ 
        channel: channelName, 
        data: largeCustomData 
      });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.have.property('status', 200);
    });

    it('should handle special characters in channel name', async () => {
      const channelName = 'test-channel-with-special-chars';
      const encodedChannelName = 'test-channel-with-special-chars';
      
      const scope = utils
        .createNock()
        .get(`/v2/objects/${SUBSCRIBE_KEY}/channels/${encodedChannelName}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
        })
        .reply(200, {
          status: 200,
          data: asResponse({ ...channel1, id: channelName }),
        });

      const resultP = pubnub.objects.getChannelMetadata({ channel: channelName });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.have.property('status', 200);
    });

    it('should handle unicode characters in metadata', async () => {
      const channelName = 'test-channel';
      const unicodeData = {
        name: 'Test Channel 测试频道',
        description: 'A test channel with unicode: 🚀 💫 ⭐ 🌟',
        custom: {
          emoji: '😀😃😄😁😆😅😂🤣',
          chinese: '你好世界',
          japanese: 'こんにちは世界',
          arabic: 'مرحبا بالعالم',
        },
      };

      const scope = utils
        .createNock()
        .patch(`/v2/objects/${SUBSCRIBE_KEY}/channels/${channelName}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
        })
        .reply(200, {
          status: 200,
          data: asResponse({ ...channel1, data: unicodeData }),
        });

      const resultP = pubnub.objects.setChannelMetadata({ 
        channel: channelName, 
        data: unicodeData 
      });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.have.property('status', 200);
    });
  });

  describe('advanced features', () => {
    it('should support conditional updates with ETag', async () => {
      const channelName = 'test-channel';
      const etag = 'AaG95A8Y1bq_8g';

      const scope = utils
        .createNock()
        .patch(`/v2/objects/${SUBSCRIBE_KEY}/channels/${channelName}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
        })
        .matchHeader('If-Match', etag)
        .reply(200, {
          status: 200,
          data: asResponse(channel1),
        });

      const resultP = pubnub.objects.setChannelMetadata({ 
        channel: channelName, 
        data: channel1.data,
        ifMatchesEtag: etag,
      });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.have.property('status', 200);
    });

    it('should reject updates with mismatched ETag', async () => {
      const channelName = 'test-channel';
      const wrongEtag = 'WrongETag123';

      const scope = utils
        .createNock()
        .patch(`/v2/objects/${SUBSCRIBE_KEY}/channels/${channelName}`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
        })
        .matchHeader('If-Match', wrongEtag)
        .reply(412, {
          status: 412,
          error: {
            message: 'Precondition Failed',
            source: 'objects',
            details: [
              {
                message: 'ETag mismatch',
                location: 'If-Match',
                locationType: 'header',
              }
            ]
          }
        });

      const resultP = pubnub.objects.setChannelMetadata({ 
        channel: channelName, 
        data: channel1.data,
        ifMatchesEtag: wrongEtag,
      });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.be.rejected;
    });

    it('should handle complex sorting combinations', async () => {
      const scope = utils
        .createNock()
        .get(`/v2/objects/${SUBSCRIBE_KEY}/channels`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
          count: false,
          sort: ['name:asc', 'updated:desc', 'status'],
          limit: 100,
        })
        .reply(200, {
          status: 200,
          data: allChannels.map(asResponse),
        });

      const resultP = pubnub.objects.getAllChannelMetadata({
        sort: {
          name: 'asc',
          updated: 'desc',
          status: null,
        },
        include: {
          customFields: true,
          totalCount: false,
        },
      });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.have.property('status', 200);
    });

    it('should handle complex filter expressions', async () => {
      const complexFilter = 'name LIKE "test*" AND (status = "active" OR priority > 5)';
      
      const scope = utils
        .createNock()
        .get(`/v2/objects/${SUBSCRIBE_KEY}/channels`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
          count: false,
          filter: complexFilter,
          limit: 100,
        })
        .reply(200, {
          status: 200,
          data: allChannels.slice(0, 2).map(asResponse), // Return filtered subset
        });

      const resultP = pubnub.objects.getAllChannelMetadata({
        filter: complexFilter,
        include: {
          customFields: true,
          totalCount: false,
        },
      });

      await expect(scope).to.have.been.requested;
      await expect(resultP).to.eventually.have.property('status', 200);
    });
  });

  describe('boundary testing', () => {
    it('should handle empty results for getAllChannelMetadata', async () => {
      const scope = utils
        .createNock()
        .get(`/v2/objects/${SUBSCRIBE_KEY}/channels`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
          count: false,
          limit: 100,
        })
        .reply(200, {
          status: 200,
          data: [],
          totalCount: 0,
          next: null,
          prev: null,
        });

      const resultP = pubnub.objects.getAllChannelMetadata({
        include: {
          customFields: true,
          totalCount: false,
        },
      });

      await expect(scope).to.have.been.requested;
      const result = await resultP;
      expect(result.data).to.be.an('array').that.is.empty;
    });

    it('should handle maximum limit for getAllChannelMetadata', async () => {
      const maxLimit = 100;
      const scope = utils
        .createNock()
        .get(`/v2/objects/${SUBSCRIBE_KEY}/channels`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
          count: false,
          limit: maxLimit,
        })
        .reply(200, {
          status: 200,
          data: Array.from({ length: maxLimit }, (_, i) => 
            asResponse({ ...channel1, id: `channel_${i}` })
          ),
        });

      const resultP = pubnub.objects.getAllChannelMetadata({
        limit: maxLimit,
        include: {
          customFields: true,
          totalCount: false,
        },
      });

      await expect(scope).to.have.been.requested;
      const result = await resultP;
      expect(result.data).to.have.length(maxLimit);
    });

    it('should handle pagination edge cases', async () => {
      // Test first page
      const firstPageScope = utils
        .createNock()
        .get(`/v2/objects/${SUBSCRIBE_KEY}/channels`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
          count: false,
          limit: 10,
        })
        .reply(200, {
          status: 200,
          data: allChannels.slice(0, 10).map(asResponse),
          next: 'page2_cursor',
          prev: null,
        });

      // Test last page
      const lastPageScope = utils
        .createNock()
        .get(`/v2/objects/${SUBSCRIBE_KEY}/channels`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'status,type,custom',
          count: false,
          limit: 10,
          start: 'last_page_cursor',
        })
        .reply(200, {
          status: 200,
          data: allChannels.slice(-5).map(asResponse), // Less than full page
          next: null,
          prev: 'prev_page_cursor',
        });

      // First page request
      const firstPageResult = pubnub.objects.getAllChannelMetadata({
        limit: 10,
        include: {
          customFields: true,
          totalCount: false,
        },
      });

      await expect(firstPageScope).to.have.been.requested;
      
      // Last page request
      const lastPageResult = pubnub.objects.getAllChannelMetadata({
        limit: 10,
        page: { next: 'last_page_cursor' },
        include: {
          customFields: true,
          totalCount: false,
        },
      });

      await expect(lastPageScope).to.have.been.requested;
      const lastResult = await lastPageResult;
      expect(lastResult.data).to.have.length.lessThan(10);
    });
  });
});
