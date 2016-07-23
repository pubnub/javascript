/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../lib/node/index.js';

describe('history endpoints', () => {
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

  it('supports payload without timetoken', (done) => {
    const scope = utils.createNock().get('/v2/history/sub-key/mySubKey/channel/ch1')
      .query({ count: '100', pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID' })
      .reply(200, '[[{"text":"hey"},{"text2":"hey2"}],14648503433058358,14648990164932163]');


    pubnub.history({ channel: 'ch1' }, (status, response) => {
      assert.equal(status.error, false);
      assert.deepEqual(response.startTimeToken, 14648503433058358);
      assert.deepEqual(response.endTimeToken, 14648990164932163);
      assert.deepEqual(response.messages, [
        { timetoken: null, entry: { text: 'hey' } },
        { timetoken: null, entry: { text2: 'hey2' } }
      ]);
      assert.equal(scope.isDone(), true);
      done();
    });
  });

  it('supports payload with timetoken', (done) => {
    const scope = utils.createNock().get('/v2/history/sub-key/mySubKey/channel/ch1')
      .query({ count: '100', include_token: 'true', pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID' })
      .reply(200, '[[{"message":{"text":"hey"},"timetoken":14648503433058358},{"message":{"text2":"hey2"},"timetoken":14648503433058359}],14648503433058358,14649346364851578]');

    pubnub.history({ channel: 'ch1', includeTimetoken: true }, (status, response) => {
      assert.equal(status.error, false);
      assert.deepEqual(response.startTimeToken, 14648503433058358);
      assert.deepEqual(response.endTimeToken, 14649346364851578);
      assert.deepEqual(response.messages, [
        { timetoken: 14648503433058358, entry: { text: 'hey' } },
        { timetoken: 14648503433058360, entry: { text2: 'hey2' } },
      ]);
      assert.equal(scope.isDone(), true);
      done();
    });
  });

  it('supports encrypted payload without timetoken', (done) => {
    const scope = utils.createNock().get('/v2/history/sub-key/mySubKey/channel/ch1')
      .query({ count: '100', pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID' })
      .reply(200, '[["zFJeF9BVABL80GUiQEBjLg==","HIq4MTi9nk/KEYlHOKpMCaH78ZXppGynDHrgY9nAd3s="],14649369736959785,14649369766426772]');


    pubnub.setCipherKey('cipherKey');
    pubnub.history({ channel: 'ch1' }, (status, response) => {
      assert.equal(status.error, false);
      assert.deepEqual(response.startTimeToken, 14649369736959785);
      assert.deepEqual(response.endTimeToken, 14649369766426772);
      assert.deepEqual(response.messages, [
        { timetoken: null, entry: { text: 'hey' } },
        { timetoken: null, entry: { text2: 'hey2' } }
      ]);
      assert.equal(scope.isDone(), true);
      done();
    });
  });

  it('supports encrypted payload with timetoken', (done) => {
    const scope = utils.createNock().get('/v2/history/sub-key/mySubKey/channel/ch1')
      .query({ count: '100', include_token: 'true', pnsdk: 'PubNub-JS-Nodejs/' + pubnub.getVersion(), uuid: 'myUUID' })
      .reply(200, '[[{"message":"zFJeF9BVABL80GUiQEBjLg==","timetoken":14649369736959785},{"message":"HIq4MTi9nk/KEYlHOKpMCaH78ZXppGynDHrgY9nAd3s=","timetoken":14649369766426772}],14649369736959785,14649369766426772]');

    pubnub.setCipherKey('cipherKey');
    pubnub.history({ channel: 'ch1', includeTimetoken: true }, (status, response) => {
      assert.equal(status.error, false);
      assert.deepEqual(response.startTimeToken, 14649369736959785);
      assert.deepEqual(response.endTimeToken, 14649369766426772);
      assert.deepEqual(response.messages, [
        { timetoken: 14649369736959784, entry: { text: 'hey' } },
        { timetoken: 14649369766426772, entry: { text2: 'hey2' } },
      ]);
      assert.equal(scope.isDone(), true);
      done();
    });
  });
});
