/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../src/node/index';

describe('fetch messages endpoints', () => {
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

  it('supports payload', (done) => {
    const scope = utils.createNock().get('/v3/history/sub-key/mySubKey/channel/ch1%2Cch2')
      .query({ max: '10', pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, uuid: 'myUUID' })
      .reply(200, '{ "channels": { "ch1": [{"message":{"text":"hey1"},"timetoken":"11"}, {"message":{"text":"hey2"},"timetoken":"12"}], "ch2": [{"message":{"text":"hey3"},"timetoken":"21"}, {"message":{"text":"hey2"},"timetoken":"22"}] } }');

    pubnub.fetchMessages({ channels: ['ch1', 'ch2'], count: 10 }, (status, response) => {
      assert.equal(status.error, false);
      assert.deepEqual(response, {
        channels: {
          ch1: [{
            channel: 'ch1',
            message: {
              text: 'hey1'
            },
            subscription: null,
            timetoken: '11'
          },
          {
            channel: 'ch1',
            message: {
              text: 'hey2'
            },
            subscription: null,
            timetoken: '12'
          }],
          ch2: [
            {
              channel: 'ch2',
              message: {
                text: 'hey3'
              },
              subscription: null,
              timetoken: '21'
            },
            {
              channel: 'ch2',
              message: {
                text: 'hey2'
              },
              subscription: null,
              timetoken: '22'
            }
          ]
        }
      });
      assert.equal(scope.isDone(), true);
      done();
    });
  });

  it('supports encrypted payload', (done) => {
    const scope = utils.createNock().get('/v3/history/sub-key/mySubKey/channel/ch1%2Cch2')
      .query({ max: '10', pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`, uuid: 'myUUID' })
      .reply(200, '{ "channels": { "ch1": [{"message":"zFJeF9BVABL80GUiQEBjLg==","timetoken":"11"}, {"message":"zFJeF9BVABL80GUiQEBjLg==","timetoken":"12"}], "ch2": [{"message":"HIq4MTi9nk/KEYlHOKpMCaH78ZXppGynDHrgY9nAd3s=","timetoken":"21"}, {"message":"HIq4MTi9nk/KEYlHOKpMCaH78ZXppGynDHrgY9nAd3s=","timetoken":"22"}] } }');

    pubnub.setCipherKey('cipherKey');
    pubnub.fetchMessages({ channels: ['ch1', 'ch2'], count: 10 }, (status, response) => {
      assert.equal(status.error, false);
      assert.deepEqual(response, {
        channels: {
          ch1: [{
            channel: 'ch1',
            message: {
              text: 'hey'
            },
            subscription: null,
            timetoken: '11'
          },
          {
            channel: 'ch1',
            message: {
              text: 'hey'
            },
            subscription: null,
            timetoken: '12'
          }],
          ch2: [
            {
              channel: 'ch2',
              message: {
                text2: 'hey2'
              },
              subscription: null,
              timetoken: '21'
            },
            {
              channel: 'ch2',
              message: {
                text2: 'hey2'
              },
              subscription: null,
              timetoken: '22'
            }
          ]
        }
      });
      assert.equal(scope.isDone(), true);
      done();
    });
  });
});
