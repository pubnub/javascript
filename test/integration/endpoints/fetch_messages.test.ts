/* global describe, beforeEach, afterEach, it, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';

import * as MessageActions from '../../../src/core/types/api/message-action';
import { Payload } from '../../../src/core/types/api';
import PubNub from '../../../src/node/index';
import utils from '../../utils';
import { PubNubError } from '../../../src/errors/pubnub-error';

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

/**
 * Attach message actions to the previously published messages.
 *
 * @param client - PubNub client instance which should be used to add message action to the message.
 * @param count - How many message actions should be added to each referenced message.
 * @param messageTimetokens - List of referenced messages' timetokens.
 * @param channel - Name of the channel where referenced messages has been published.
 * @param completion - Message actions addition completion function.
 */
function addActionsInChannel(
  client: PubNub,
  count: number,
  messageTimetokens: string[],
  channel: string,
  completion: (added: MessageActions.MessageAction[]) => void,
) {
  const types = ['reaction', 'receipt', 'custom'];
  const values = [
    PubNub.generateUUID(),
    PubNub.generateUUID(),
    PubNub.generateUUID(),
    PubNub.generateUUID(),
    PubNub.generateUUID(),
    PubNub.generateUUID(),
    PubNub.generateUUID(),
    PubNub.generateUUID(),
    PubNub.generateUUID(),
    PubNub.generateUUID(),
  ];
  let actions: MessageActions.MessageAction[] = [];
  let actionsToAdd: {
    messageTimetoken: string;
    action: Pick<MessageActions.AddMessageActionParameters['action'], 'type' | 'value'>;
  }[] = [];
  let actionsAdded = 0;

  for (let messageIdx = 0; messageIdx < messageTimetokens.length; messageIdx += 1) {
    const messageTimetoken = messageTimetokens[messageIdx];

    for (let messageActionIdx = 0; messageActionIdx < count; messageActionIdx += 1) {
      const action = { type: types[(messageActionIdx + 1) % 3], value: values[(messageActionIdx + 1) % 10] };

      actionsToAdd.push({ messageTimetoken, action });
    }
  }

  /**
   * Attach set of message actions.
   *
   * @param actionIdx - Index of currently adding message action.
   */
  const addAction = (actionIdx: number) => {
    const { messageTimetoken, action } = actionsToAdd[actionIdx];

    client.addMessageAction({ channel, messageTimetoken, action }, (status, response) => {
      actionsAdded += 1;

      if (!status.error && response) {
        actions.push(response.data);
        actions = actions.sort(
          (left, right) => parseInt(left.actionTimetoken, 10) - parseInt(right.actionTimetoken, 10),
        );
      } else {
        console.error('Action add did fail:', status);
      }

      if (actionsAdded < actionsToAdd.length) {
        addAction(actionsAdded);
      } else if (actionsAdded === actionsToAdd.length) {
        completion(actions);
      }
    });
  };

  addAction(actionsAdded);
}

describe('fetch messages endpoints', () => {
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

  it('supports payload', (done) => {
    nock.disableNetConnect();
    const scope = utils
      .createNock()
      .get(`/v3/history/sub-key/${subscribeKey}/channel/ch1,ch2`)
      .query({
        max: '10',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        include_uuid: 'true',
        include_message_type: 'true',
      })
      .reply(
        200,
        '{ "channels": { "ch1": [{"message":{"text":"hey1"},"timetoken":"11"}, {"message":{"text":"hey2"},"timetoken":"12"}], "ch2": [{"message":{"text":"hey3"},"timetoken":"21"}, {"message":{"text":"hey2"},"timetoken":"22"}] } }',
        { 'content-type': 'text/javascript' },
      );

    pubnub.fetchMessages({ channels: ['ch1', 'ch2'], count: 10 }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert.deepEqual(response, {
          channels: {
            ch1: [
              {
                channel: 'ch1',
                message: {
                  text: 'hey1',
                },
                timetoken: '11',
                messageType: undefined,
                uuid: undefined,
              },
              {
                channel: 'ch1',
                message: {
                  text: 'hey2',
                },
                timetoken: '12',
                messageType: undefined,
                uuid: undefined,
              },
            ],
            ch2: [
              {
                channel: 'ch2',
                message: {
                  text: 'hey3',
                },
                timetoken: '21',
                messageType: undefined,
                uuid: undefined,
              },
              {
                channel: 'ch2',
                message: {
                  text: 'hey2',
                },
                timetoken: '22',
                messageType: undefined,
                uuid: undefined,
              },
            ],
          },
        });
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('supports encrypted payload', (done) => {
    nock.disableNetConnect();
    const scope = utils
      .createNock()
      .get(`/v3/history/sub-key/${subscribeKey}/channel/ch1,ch2`)
      .query({
        max: '10',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        include_uuid: 'true',
        include_message_type: 'true',
      })
      .reply(
        200,
        '{ "channels": { "ch1": [{"message":"zFJeF9BVABL80GUiQEBjLg==","timetoken":"11"}, {"message":"zFJeF9BVABL80GUiQEBjLg==","timetoken":"12"}], "ch2": [{"message":"HIq4MTi9nk/KEYlHOKpMCaH78ZXppGynDHrgY9nAd3s=","timetoken":"21"}, {"message":"HIq4MTi9nk/KEYlHOKpMCaH78ZXppGynDHrgY9nAd3s=","timetoken":"22"}] } }',
        { 'content-type': 'text/javascript' },
      );

    pubnub.setCipherKey('cipherKey');
    pubnub.fetchMessages({ channels: ['ch1', 'ch2'], count: 10 }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert.deepEqual(response, {
          channels: {
            ch1: [
              {
                channel: 'ch1',
                message: {
                  text: 'hey',
                },
                timetoken: '11',
                messageType: undefined,
                uuid: undefined,
              },
              {
                channel: 'ch1',
                message: {
                  text: 'hey',
                },
                timetoken: '12',
                messageType: undefined,
                uuid: undefined,
              },
            ],
            ch2: [
              {
                channel: 'ch2',
                message: {
                  text2: 'hey2',
                },
                timetoken: '21',
                messageType: undefined,
                uuid: undefined,
              },
              {
                channel: 'ch2',
                message: {
                  text2: 'hey2',
                },
                timetoken: '22',
                messageType: undefined,
                uuid: undefined,
              },
            ],
          },
        });
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
      pubnub.fetchMessages({ channels: [channel], count: 25, includeMeta: true }, (_, response) => {
        try {
          assert(response !== null);
          const channelMessages = response.channels[channel];

          assert.deepEqual(channelMessages[0].meta, { time: messages[0].message.time });
          assert(!channelMessages[1].meta);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  }).timeout(60000);

  it('throws when requested actions for multiple channels', async () => {
    let errorCatched = false;

    try {
      await pubnub.fetchMessages({ channels: ['channelA', 'channelB'], includeMessageActions: true });
    } catch (error) {
      assert(error instanceof PubNubError);
      assert.equal(
        error.status!.message,
        'History can return actions data for a single channel only. Either pass a single channel or disable the includeMessageActions flag.',
      );
      errorCatched = true;
    }

    assert(errorCatched);
  });

  it("supports actions (stored as 'data' field)", (done) => {
    const channel = PubNub.generateUUID();
    const expectedMessagesCount = 2;
    const expectedActionsCount = 4;

    publishMessagesToChannel(pubnub, expectedMessagesCount, channel, (messages) => {
      const messageTimetokens = messages.map((message) => message.timetoken);

      addActionsInChannel(pubnub, expectedActionsCount, messageTimetokens, channel, (actions) => {
        setTimeout(() => {
          pubnub.fetchMessages({ channels: [channel], includeMessageActions: true }, (status, response) => {
            try {
              assert.equal(status.error, false);
              assert(response !== null);
              const fetchedMessages = response.channels[channel];
              // TypeScript types system now requires to figure out type of object before using it.
              assert('actions' in fetchedMessages[0]);
              const actionsByType = fetchedMessages[0].data ?? {};
              let historyActionsCount = 0;

              Object.keys(actionsByType).forEach((actionType) => {
                Object.keys(actionsByType[actionType]).forEach((actionValue) => {
                  let actionFound = false;
                  historyActionsCount += 1;

                  actions.forEach((action) => {
                    if (action.value === actionValue) actionFound = true;
                  });

                  assert.equal(actionFound, true);
                });
              });

              assert.equal(historyActionsCount, expectedActionsCount);
              assert.equal(fetchedMessages[0].timetoken, messageTimetokens[0]);
              assert.equal(
                fetchedMessages[fetchedMessages.length - 1].timetoken,
                messageTimetokens[messageTimetokens.length - 1],
              );

              done();
            } catch (error) {
              done(error);
            }
          });
        }, 2000);
      });
    });
  }).timeout(60000);

  it("supports actions (stored as 'actions' field)", (done) => {
    const channel = PubNub.generateUUID();
    const expectedMessagesCount = 2;
    const expectedActionsCount = 4;

    publishMessagesToChannel(pubnub, expectedMessagesCount, channel, (messages) => {
      const messageTimetokens = messages.map((message) => message.timetoken);

      addActionsInChannel(pubnub, expectedActionsCount, messageTimetokens, channel, (actions) => {
        setTimeout(() => {
          pubnub.fetchMessages({ channels: [channel], includeMessageActions: true }, (status, response) => {
            try {
              assert.equal(status.error, false);
              assert(response !== null);
              const fetchedMessages = response.channels[channel];
              // TypeScript types system now requires to figure out type of object before using it.
              assert('actions' in fetchedMessages[0]);
              const actionsByType = fetchedMessages[0].actions ?? {};
              let historyActionsCount = 0;

              Object.keys(actionsByType).forEach((actionType) => {
                Object.keys(actionsByType[actionType]).forEach((actionValue) => {
                  let actionFound = false;
                  historyActionsCount += 1;

                  actions.forEach((action) => {
                    if (action.value === actionValue) {
                      actionFound = true;
                    }
                  });

                  assert.equal(actionFound, true);
                });
              });

              assert.equal(historyActionsCount, expectedActionsCount);
              assert.equal(fetchedMessages[0].timetoken, messageTimetokens[0]);
              assert.equal(
                fetchedMessages[fetchedMessages.length - 1].timetoken,
                messageTimetokens[messageTimetokens.length - 1],
              );

              done();
            } catch (error) {
              done(error);
            }
          });
        }, 2000);
      });
    });
  }).timeout(60000);

  it('should return "more" field when server sends it', (done) => {
    nock.disableNetConnect();
    const scope = utils
      .createNock()
      .get(`/v3/history-with-actions/sub-key/${subscribeKey}/channel/ch1`)
      .query({
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        max: '25',
        include_uuid: 'true',
        include_message_type: 'true',
      })
      .reply(
        200,
        '{"status":200,"error":false,"error_message":"","channels":{"demo-channel":[{"message":"Hi","timetoken":15610547826970040,"actions":{"receipt":{"read":[{"uuid":"user-7","actionTimetoken":15610547826970044}]}}},{"message":"Hello","timetoken":15610547826970000,"actions":{"reaction":{"smiley_face":[{"uuid":"user-456","actionTimetoken":15610547826970050}]}}}]},"more":{"url":"/v3/history-with-actions/sub-key/s/channel/c?start=15610547826970000&max=98","start":"15610547826970000","max":98}}',
        { 'content-type': 'text/javascript' },
      );

    pubnub.fetchMessages({ channels: ['ch1'], includeMessageActions: true }, (status, response) => {
      try {
        assert.equal(scope.isDone(), true);
        assert.equal(status.error, false);
        assert(response !== null);
        // TypeScript types system now requires to figure out type of object before using it.
        assert('more' in response);
        assert.equal(response.more.url, '/v3/history-with-actions/sub-key/s/channel/c?start=15610547826970000&max=98');
        assert.equal(response.more.start, '15610547826970000');
        assert.equal(response.more.max, 98);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('should request 100 messages when count not provided with single channel', (done) => {
    nock.disableNetConnect();
    const scope = utils
      .createNock()
      .get(`/v3/history/sub-key/${subscribeKey}/channel/ch1`)
      .query({
        max: '100',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        include_uuid: 'true',
        include_message_type: 'true',
      })
      .reply(
        200,
        '{ "error": false, "error_message": "", "channels": { "ch1": [ { "message_type": null, "message": "hello world", "timetoken": "16048329933709932", "uuid": "test-uuid"} ] } }',
        { 'content-type': 'text/javascript' },
      );
    pubnub.fetchMessages({ channels: ['ch1'] }, (status) => {
      try {
        assert.equal(scope.isDone(), true);
        assert.equal(status.error, false);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('should request 25 messages when count not provided with multiple channels', (done) => {
    nock.disableNetConnect();
    const scope = utils
      .createNock()
      .get(`/v3/history/sub-key/${subscribeKey}/channel/ch1,ch2`)
      .query({
        max: '25',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        include_uuid: 'true',
        include_message_type: 'true',
      })
      .reply(
        200,
        '{ "error": false, "error_message": "", "channels": { "ch1": [ { "message_type": null, "message": "hello world", "timetoken": "16048329933709932", "uuid": "test-uuid"} ] } }',
        { 'content-type': 'text/javascript' },
      );
    pubnub.fetchMessages({ channels: ['ch1', 'ch2'] }, (status) => {
      try {
        assert.equal(scope.isDone(), true);
        assert.equal(status.error, false);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('should request 25 messages when count not provided for history-with-actions', (done) => {
    nock.disableNetConnect();
    const scope = utils
      .createNock()
      .get(`/v3/history-with-actions/sub-key/${subscribeKey}/channel/ch1`)
      .query({
        max: '25',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        include_uuid: 'true',
        include_message_type: 'true',
      })
      .reply(
        200,
        '{ "error": false, "error_message": "", "channels": { "ch1": [ { "message_type": null, "message": "hello world", "timetoken": "16048329933709932", "uuid": "test-uuid"} ] } }',
        { 'content-type': 'text/javascript' },
      );
    pubnub.fetchMessages({ channels: ['ch1'], includeMessageActions: true }, (status) => {
      try {
        assert.equal(scope.isDone(), true);
        assert.equal(status.error, false);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('should request provided number of messages when count is specified for history-with-actions', (done) => {
    nock.disableNetConnect();
    const scope = utils
      .createNock()
      .get(`/v3/history-with-actions/sub-key/${subscribeKey}/channel/ch1`)
      .query({
        max: '10',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        include_uuid: 'true',
        include_message_type: 'true',
      })
      .reply(
        200,
        '{ "error": false, "error_message": "", "channels": { "ch1": [ { "message_type": null, "message": "hello world", "timetoken": "16048329933709932", "uuid": "test-uuid"} ] } }',
        { 'content-type': 'text/javascript' },
      );
    pubnub.fetchMessages({ channels: ['ch1'], includeMessageActions: true, count: 10 }, (status) => {
      try {
        assert.equal(scope.isDone(), true);
        assert.equal(status.error, false);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('should request provided number of messages when count is specified for batch history with single channel', (done) => {
    nock.disableNetConnect();
    const scope = utils
      .createNock()
      .get(`/v3/history/sub-key/${subscribeKey}/channel/ch1`)
      .query({
        max: '10',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        include_uuid: 'true',
        include_message_type: 'true',
      })
      .reply(
        200,
        '{ "error": false, "error_message": "", "channels": { "ch1": [ { "message_type": null, "message": "hello world", "timetoken": "16048329933709932", "uuid": "test-uuid"} ] } }',
        { 'content-type': 'text/javascript' },
      );
    pubnub.fetchMessages({ channels: ['ch1'], count: 10 }, (status) => {
      try {
        assert.equal(scope.isDone(), true);
        assert.equal(status.error, false);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('should request provided number of messages when count is specified for batch history with multiple channels', (done) => {
    nock.disableNetConnect();
    const scope = utils
      .createNock()
      .get(`/v3/history/sub-key/${subscribeKey}/channel/ch1,ch2`)
      .query({
        max: '10',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        include_uuid: 'true',
        include_message_type: 'true',
      })
      .reply(
        200,
        '{ "error": false, "error_message": "", "channels": { "ch1": [ { "message_type": null, "message": "hello world", "timetoken": "16048329933709932", "uuid": "test-uuid"} ] } }',
        { 'content-type': 'text/javascript' },
      );
    pubnub.fetchMessages({ channels: ['ch1', 'ch2'], count: 10 }, (status) => {
      try {
        assert.equal(scope.isDone(), true);
        assert.equal(status.error, false);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('handles unencrypted payload when cryptomodule configured', (done) => {
    nock.disableNetConnect();
    const scope = utils
      .createNock()
      .get(`/v3/history/sub-key/${subscribeKey}/channel/ch1`)
      .query({
        max: '10',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        include_uuid: 'true',
        include_message_type: 'true',
      })
      .reply(
        200,
        '{ "channels": { "ch1": [{"message":"hello","timetoken":"11"}, {"message":"hey","timetoken":"12"}] } }',
        { 'content-type': 'text/javascript' },
      );

    pubnub.setCipherKey('cipherKey');
    pubnub.fetchMessages({ channels: ['ch1'], count: 10 }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert.deepEqual(response, {
          channels: {
            ch1: [
              {
                channel: 'ch1',
                message: 'hello',
                timetoken: '11',
                messageType: undefined,
                uuid: undefined,
                error: 'Error while decrypting message content: Decryption error: invalid header version',
              },
              {
                channel: 'ch1',
                message: 'hey',
                timetoken: '12',
                messageType: undefined,
                uuid: undefined,
                error: 'Error while decrypting message content: Decryption error: invalid header version',
              },
            ],
          },
        });
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});
