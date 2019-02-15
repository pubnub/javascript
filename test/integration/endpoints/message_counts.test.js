/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../src/node/index';

describe('history with messages endpoints', () => {
  let pubnub;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({ subscribeKey: 'mySubKey', publishKey: 'myPublishKey', uuid: 'myUUID' });
  });

  it('get history with messages for a channel', (done) => {
    const scope = utils.createNock().get('/v3/history/sub-key/mySubKey/message-counts/ch1')
      .query({ timetoken: 15495750401727535, pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, uuid: 'myUUID' })
      .reply(200, '{"status": 200, "error": false, "error_message": "", "channels": {"ch1":0}}');

    pubnub.messagesCounts({ channels: ['ch1'], timetoken: 15495750401727535 }, (status, response) => {
      assert.equal(status.error, false);
      assert.deepEqual(response.channels, { ch1: 0 });
      assert.equal(scope.isDone(), true);
      done();
    });
  });

  it('get history with messages for multiple channels using timetoken', (done) => {
    const scope = utils.createNock().get('/v3/history/sub-key/mySubKey/message-counts/ch1%2Cch2%2Cch3')
      .query({ timetoken: 15495750401727535, pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, uuid: 'myUUID' })
      .reply(200, '{"status": 200, "error": false, "error_message": "", "channels": {"ch1":0,"ch2":0,"ch3":0}}');

    pubnub.messagesCounts({ channels: ['ch1', 'ch2', 'ch3'], timetoken: 15495750401727535 }, (status, response) => {
      assert.equal(status.error, false);
      assert.deepEqual(response.channels, { ch1: 0, ch2: 0, ch3: 0 });
      assert.equal(scope.isDone(), true);
      done();
    });
  });

  it('get history with messages for multiple channels using channelTimetokens', (done) => {
    const scope = utils.createNock().get('/v3/history/sub-key/mySubKey/message-counts/ch1%2Cch2%2Cch3')
      .query({ channelTimetokens: '15495750401727535%2C15495750401727536%2C15495750401727537', pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, uuid: 'myUUID' })
      .reply(200, '{"status": 200, "error": false, "error_message": "", "channels": {"ch1":0,"ch2":0,"ch3":0}}');

    pubnub.messagesCounts({ channels: ['ch1', 'ch2', 'ch3'], channelTimetokens: ['15495750401727535', '15495750401727536', '15495750401727537'] }, (status, response) => {
      assert.equal(status.error, false);
      assert.deepEqual(response.channels, { ch1: 0, ch2: 0, ch3: 0 });
      assert.equal(scope.isDone(), true);
      done();
    });
  });
});