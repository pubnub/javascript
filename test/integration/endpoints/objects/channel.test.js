/** @flow */

import nock from 'nock';
import utils from '../../../utils';
import PubNub from '../../../../src/node/index';

import { asResponse, allChannels, channel1 } from './fixtures';

describe('objects channel', () => {
  const SUBSCRIBE_KEY = 'mySubKey';
  const PUBLISH_KEY = 'myPublishKey';
  const UUID = 'myUUID';
  const AUTH_KEY = 'myAuthKey';

  let pubnub: PubNub;
  let PNSDK: string;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
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

  describe('getAllChannelMetadata', () => {
    it('should resolve to a list of channel metadata', async () => {
      const scope = utils
        .createNock()
        .get(`/v2/objects/${SUBSCRIBE_KEY}/channels`)
        .query({
          auth: AUTH_KEY,
          uuid: UUID,
          pnsdk: PNSDK,
          include: 'custom',
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
        next: undefined,
        prev: undefined,
        totalCount: undefined
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
          include: 'custom'
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
          include: 'custom'
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
      // $FlowFixMe This is intentional to suppress Flow error
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
          include: 'custom'
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
          include: 'custom'
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
      // $FlowFixMe This is intentional to suppress Flow error
      const resultP = pubnub.objects.setChannelMetadata();

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

    it('should reject if uuid is missing', async () => {
      // $FlowFixMe This is intentional to suppress Flow error
      const resultP = pubnub.objects.removeChannelMetadata();

      await expect(resultP).to.be.rejected;
    });
  });
});
