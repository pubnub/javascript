/* global describe, beforeEach, afterEach, it, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';

import { Payload } from '../../../src/core/types/api';
import PubNub from '../../../src/node/index';
import utils from '../../utils';

/**
 * Published test message shape.
 */
type TestMessage = { messageIdx: string; time: number };

/**
 * Prepare messages history.
 *
 * @param client - PubNub client instance which will be used to publish messages.
 * @param count - How many messages should be published.
 * @param channel - Name of the channel into which messages should be published.
 * @param completion - Messages set publish completion function.
 */
function publishMessagesToChannel(
  client: PubNub,
  count: number,
  channel: string,
  completion: (published: { message: TestMessage; timetoken: string }[]) => void,
) {
  let messages: { message: TestMessage; timetoken: string }[] = [];
  let publishCompleted = 0;

  const publish = (messageIdx: number) => {
    let payload: { channel: string; message: TestMessage; meta?: Payload } = {
      message: { messageIdx: [channel, messageIdx].join(': '), time: Date.now() },
      channel,
    };

    if (messageIdx % 2 === 0) payload.meta = { time: payload.message.time };

    client.publish(payload, (status, response) => {
      publishCompleted += 1;

      if (!status.error && response) {
        messages.push({ message: payload.message, timetoken: response.timetoken });
        messages = messages.sort((left, right) => parseInt(left.timetoken, 10) - parseInt(right.timetoken, 10));
      } else {
        console.error('Publish did fail:', status);
      }

      if (publishCompleted < count) {
        publish(publishCompleted);
      } else if (publishCompleted === count) {
        completion(messages);
      }
    });
  };

  publish(publishCompleted);
}

describe('history endpoints', () => {
  const subscribeKey = process.env.SUBSCRIBE_KEY || 'demo';
  const publishKey = process.env.PUBLISH_KEY || 'demo';
  let pubnub: PubNub;

  after(() => {
    nock.enableNetConnect();
  });

  afterEach(() => {
    nock.enableNetConnect();
    pubnub.removeAllListeners();
    pubnub.unsubscribeAll();
    pubnub.stop();
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
        assert.deepEqual(response.startTimeToken, "14648503433058358");
        assert.deepEqual(response.endTimeToken, "14649346364851578");
        assert.deepEqual(response.messages, [
          { timetoken: "14648503433058358", entry: { text: "hey" } },
          { timetoken: "14648503433058359", entry: { text2: "hey2" } }
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
        assert.deepEqual(response.startTimeToken, "14649369736959785");
        assert.deepEqual(response.endTimeToken, "14649369766426772");
        assert.deepEqual(response.messages, [
          { timetoken: "14649369736959785", entry: { text: "hey" } },
          { timetoken: "14649369766426772", entry: { text2: "hey2" } }
        ]);
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('supports metadata', (done) => {
    const channel = PubNub.generateUUID();
    const expectedMessagesCount = 10;

    publishMessagesToChannel(pubnub, expectedMessagesCount, channel, (messages) => {
      pubnub.history({ channel, includeMeta: true }, (_, response) => {
        try {
          assert(response !== null);
          assert.deepEqual(response.messages[0].meta, { time: messages[0].message.time });
          assert(!response.messages[1].meta);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  }).timeout(60000);

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
        assert.deepEqual(response.startTimeToken, "14648503433058358");
        assert.deepEqual(response.endTimeToken, "14649346364851578");
        assert.deepEqual(response.messages, [
          { timetoken: "14648503433058358", entry: { text: "hey" } },
          {
            timetoken: "14648503433058359",
            entry: "hello",
            error: "Error while decrypting message content: Decryption error: invalid header version"
          }
        ]);
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});
