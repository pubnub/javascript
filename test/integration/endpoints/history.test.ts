/* global describe, beforeEach, afterEach, it, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';

import PubNub from '../../../src/node/index';
import utils from '../../utils';

describe('history endpoints', () => {
  // Fake keys: every test of this file is nock-mocked. Real-network tests: test/integration/live/endpoints/.
  const subscribeKey = 'demo';
  const publishKey = 'demo';
  let pubnub: PubNub;

  afterEach(() => {
    pubnub.removeAllListeners();
    pubnub.unsubscribeAll();
    pubnub.destroy(true);
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({
      subscribeKey,
      publishKey,
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
      useRandomIVs: false,
    });
  });

  it('supports payload with timetoken', (done) => {
    nock.disableNetConnect();
    const scope = utils
      .createNock()
      .get(`/v2/history/sub-key/${subscribeKey}/channel/ch1`)
      .query({
        count: '100',
        include_token: 'true',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        string_message_token: true,
      })
      .reply(
        200,
        '[[{"message":{"text":"hey"},"timetoken":"14648503433058358"},{"message":{"text2":"hey2"},"timetoken":"14648503433058359"}],"14648503433058358","14649346364851578"]',
        { 'content-type': 'text/javascript' },
      );

    pubnub.history({ channel: 'ch1', stringifiedTimeToken: true }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        assert.deepEqual(response.startTimeToken, '14648503433058358');
        assert.deepEqual(response.endTimeToken, '14649346364851578');
        assert.deepEqual(response.messages, [
          { timetoken: '14648503433058358', entry: { text: 'hey' } },
          { timetoken: '14648503433058359', entry: { text2: 'hey2' } },
        ]);
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('supports encrypted payload with timetoken', (done) => {
    nock.disableNetConnect();
    const scope = utils
      .createNock()
      .get(`/v2/history/sub-key/${subscribeKey}/channel/ch1`)
      .query({
        count: '100',
        include_token: 'true',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        string_message_token: true,
      })
      .reply(
        200,
        '[[{"message":"zFJeF9BVABL80GUiQEBjLg==","timetoken":"14649369736959785"},{"message":"HIq4MTi9nk/KEYlHOKpMCaH78ZXppGynDHrgY9nAd3s=","timetoken":"14649369766426772"}],"14649369736959785","14649369766426772"]',
        { 'content-type': 'text/javascript' },
      );

    pubnub.setCipherKey('cipherKey');
    pubnub.history({ channel: 'ch1', stringifiedTimeToken: true }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        assert.deepEqual(response.startTimeToken, '14649369736959785');
        assert.deepEqual(response.endTimeToken, '14649369766426772');
        assert.deepEqual(response.messages, [
          { timetoken: '14649369736959785', entry: { text: 'hey' } },
          { timetoken: '14649369766426772', entry: { text2: 'hey2' } },
        ]);
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('handles unencrypted payload with cryptoModule', (done) => {
    nock.disableNetConnect();
    const scope = utils
      .createNock()
      .get(`/v2/history/sub-key/${subscribeKey}/channel/ch1`)
      .query({
        count: '100',
        include_token: 'true',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        string_message_token: true,
      })
      .reply(
        200,
        '[[{"message":"zFJeF9BVABL80GUiQEBjLg==","timetoken":"14648503433058358"},{"message":"hello","timetoken":"14648503433058359"}],"14648503433058358","14649346364851578"]',
        { 'content-type': 'text/javascript' },
      );
    pubnub.setCipherKey('cipherKey');
    pubnub.history({ channel: 'ch1', stringifiedTimeToken: true }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        assert.deepEqual(response.startTimeToken, '14648503433058358');
        assert.deepEqual(response.endTimeToken, '14649346364851578');
        assert.deepEqual(response.messages, [
          { timetoken: '14648503433058358', entry: { text: 'hey' } },
          {
            timetoken: '14648503433058359',
            entry: 'hello',
            error: 'Error while decrypting message content: Decryption error: invalid header version',
          },
        ]);
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});
