/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';

import PubNub from '../../../src/node/index';
import utils from '../../utils';

describe('message counts', () => {
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
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey',
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
    });
  });

  it('get history with messages for a channel', (done) => {
    const scope = utils
      .createNock()
      .get('/v3/history/sub-key/mySubKey/message-counts/ch1')
      .query({
        timetoken: '15495750401727535',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
      })
      .reply(200, '{"status": 200, "error": false, "error_message": "", "channels": {"ch1":0}}', {
        'content-type': 'text/javascript',
      });

    pubnub.messageCounts({ channels: ['ch1'], timetoken: '15495750401727535' }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        assert.deepEqual(response.channels, { ch1: 0 });
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('get history with messages for multiple channels using timetoken', (done) => {
    const scope = utils
      .createNock()
      .get('/v3/history/sub-key/mySubKey/message-counts/ch1,ch2,ch3')
      .query({
        timetoken: '15495750401727535',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
      })
      .reply(200, '{"status": 200, "error": false, "error_message": "", "channels": {"ch1":0,"ch2":0,"ch3":0}}', {
        'content-type': 'text/javascript',
      });

    pubnub.messageCounts({ channels: ['ch1', 'ch2', 'ch3'], timetoken: '15495750401727535' }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        assert.deepEqual(response.channels, { ch1: 0, ch2: 0, ch3: 0 });
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('get history with messages for a channel using channelTimetokens', (done) => {
    const scope = utils
      .createNock()
      .get('/v3/history/sub-key/mySubKey/message-counts/ch1')
      .query({
        timetoken: '15495750401727535',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
      })
      .reply(200, '{"status": 200, "error": false, "error_message": "", "channels": {"ch1":2}}', {
        'content-type': 'text/javascript',
      });

    pubnub.messageCounts({ channels: ['ch1'], channelTimetokens: ['15495750401727535'] }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        assert.deepEqual(response.channels, { ch1: 2 });
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('get history with messages for multiple channels using channelTimetokens', (done) => {
    const scope = utils
      .createNock()
      .get('/v3/history/sub-key/mySubKey/message-counts/ch1,ch2,ch3')
      .query({
        timetoken: '15495750401727535',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
      })
      .reply(200, '{"status": 200, "error": false, "error_message": "", "channels": {"ch1":0,"ch2":3,"ch3":0}}', {
        'content-type': 'text/javascript',
      });

    pubnub.messageCounts(
      {
        channels: ['ch1', 'ch2', 'ch3'],
        channelTimetokens: ['15495750401727535'],
      },
      (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.channels, { ch1: 0, ch2: 3, ch3: 0 });
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      },
    );
  });

  it('get history with messages for multiple channels using multiple channelTimetokens', (done) => {
    const scope = utils
      .createNock()
      .get('/v3/history/sub-key/mySubKey/message-counts/ch1,ch2,ch3')
      .query({
        channelsTimetoken: '15495750401727535,15495750401727536,15495750401727537',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
      })
      .reply(200, '{"status": 200, "error": false, "error_message": "", "channels": {"ch1":0,"ch2":0,"ch3":4}}', {
        'content-type': 'text/javascript',
      });

    pubnub.messageCounts(
      {
        channels: ['ch1', 'ch2', 'ch3'],
        channelTimetokens: ['15495750401727535', '15495750401727536', '15495750401727537'],
      },
      (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert.deepEqual(response.channels, { ch1: 0, ch2: 0, ch3: 4 });
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      },
    );
  });
});
