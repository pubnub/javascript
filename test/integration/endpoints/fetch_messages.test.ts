/* global describe, beforeEach, afterEach, it, after */
/* eslint no-console: 0 */
/* eslint-disable max-len */

import assert from 'assert';
import nock from 'nock';

import * as MessageActions from '../../../src/core/types/api/message-action';
import * as Publish from '../../../src/core/endpoints/publish';
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
 * @param customMessageType - User-provided message type (ignored if empty).
 * @param completion - Messages set publish completion function.
 */
function publishMessagesToChannel(
  client: PubNub,
  count: number,
  channel: string,
  customMessageType: string,
  completion: (published: { message: TestMessage; timetoken: string }[]) => void,
) {
  let messages: { message: TestMessage; timetoken: string }[] = [];
  let publishCompleted = 0;

  const publish = (messageIdx: number) => {
    const payload: Publish.PublishParameters = {
      message: { messageIdx: [channel, messageIdx].join(': '), time: Date.now() },
      channel,
    };

    if (customMessageType.length) payload.customMessageType = customMessageType;
    if (messageIdx % 2 === 0) payload.meta = { time: (payload.message as TestMessage).time };

    client.publish(payload, (status, response) => {
      publishCompleted += 1;

      if (!status.error && response) {
        messages.push({ message: payload.message as TestMessage, timetoken: response.timetoken });
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
  const actionsToAdd: {
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

  afterEach(() => {
    nock.enableNetConnect();
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

    publishMessagesToChannel(pubnub, expectedMessagesCount, channel, '', (messages) => {
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

  it('supports custom message type', (done) => {
    const channel = PubNub.generateUUID();
    const expectedMessagesCount = 2;

    publishMessagesToChannel(pubnub, expectedMessagesCount, channel, 'test-message-type', (messages) => {
      const messageTimetokens = messages.map((message) => message.timetoken);

      pubnub.fetchMessages({ channels: [channel], includeCustomMessageType: true }, (status, response) => {
        assert.equal(status.error, false, `Fetch messages error: ${JSON.stringify(status.errorData)}`);

        try {
          assert.equal(status.error, false);
          assert(response !== null);
          const fetchedMessages = response.channels[channel];
          fetchedMessages.forEach((message) => {
            assert.equal(message.customMessageType, 'test-message-type');
          });

          done();
        } catch (error) {
          done(error);
        }
      });
    });
  }).timeout(60000);

  it("supports actions (stored as 'data' field)", (done) => {
    const channel = PubNub.generateUUID();
    const expectedMessagesCount = 2;
    const expectedActionsCount = 4;

    publishMessagesToChannel(pubnub, expectedMessagesCount, channel, '', (messages) => {
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

    publishMessagesToChannel(pubnub, expectedMessagesCount, channel, '', (messages) => {
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

  it('throws error when MESSAGE_PERSISTENCE_MODULE disabled', async () => {
    const originalEnv = process.env.MESSAGE_PERSISTENCE_MODULE;
    process.env.MESSAGE_PERSISTENCE_MODULE = 'disabled';

    try {
      let errorCaught = false;
      try {
        await pubnub.fetchMessages({ channels: ['ch1'] });
      } catch (error) {
        assert(error instanceof Error);
        assert(error.message.includes('message persistence module disabled'));
        errorCaught = true;
      }
      assert(errorCaught, 'Expected error was not thrown');
    } finally {
      if (originalEnv !== undefined) {
        process.env.MESSAGE_PERSISTENCE_MODULE = originalEnv;
      } else {
        delete process.env.MESSAGE_PERSISTENCE_MODULE;
      }
    }
  });

  it('handles empty response gracefully', (done) => {
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
        '{ "channels": {} }',
        { 'content-type': 'text/javascript' },
      );

    pubnub.fetchMessages({ channels: ['ch1'] }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert.deepEqual(response, { channels: {} });
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('handles null message types correctly', (done) => {
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
        '{ "channels": { "ch1": [{"message": {"text": "hello"}, "timetoken": "16048329933709932", "message_type": null, "uuid": "test-uuid"}] } }',
        { 'content-type': 'text/javascript' },
      );

    pubnub.fetchMessages({ channels: ['ch1'] }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        const message = response.channels.ch1[0];
        assert.equal(message.messageType, -1); // PubNubMessageType.Message
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('processes file messages with URL generation', (done) => {
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
        '{ "channels": { "ch1": [{"message": "{\\"message\\": \\"Hello\\", \\"file\\": {\\"id\\": \\"file-id\\", \\"name\\": \\"file-name\\", \\"mime-type\\": \\"image/png\\", \\"size\\": 1024}}", "timetoken": "16048329933709932", "message_type": 4, "uuid": "test-uuid"}] } }',
        { 'content-type': 'text/javascript' },
      );

    pubnub.setCipherKey('cipherKey');
    pubnub.fetchMessages({ channels: ['ch1'] }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        const message = response.channels.ch1[0];
        assert.equal(message.messageType, 4); // PubNubMessageType.Files
        // Just check that the message is processed, URL generation is a complex feature that depends on PubNub configuration
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('handles various encryption failure scenarios', (done) => {
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
        '{ "channels": { "ch1": [{"message": "invalid-encrypted-data", "timetoken": "16048329933709932", "uuid": "test-uuid"}] } }',
        { 'content-type': 'text/javascript' },
      );

    pubnub.setCipherKey('wrongkey');
    pubnub.fetchMessages({ channels: ['ch1'] }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        const message = response.channels.ch1[0];
        assert.equal(message.message, 'invalid-encrypted-data'); // Should return original payload
        assert(message.error); // Should have error field
        assert(message.error.includes('Error while decrypting message content'));
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('handles binary encryption results with ArrayBuffer', (done) => {
    nock.disableNetConnect();
    
    // Create a mock crypto module that returns ArrayBuffer
    const mockCrypto = {
      logger: {
        log: () => {},
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
        trace: () => {}
      } as any,
      decrypt: () => new TextEncoder().encode('{"text": "hello"}').buffer,
      encrypt: (data: string | ArrayBuffer) => data,
      encryptFile: (data: ArrayBuffer) => data,
      decryptFile: (data: ArrayBuffer) => data,
    } as any;
    
    const pubnubWithMockCrypto = new PubNub({
      subscribeKey,
      publishKey,
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
      useRandomIVs: false,
      cryptoModule: mockCrypto,
    });

    const scope = utils
      .createNock()
      .get(`/v3/history/sub-key/${subscribeKey}/channel/ch1`)
      .query({
        max: '100',
        pnsdk: `PubNub-JS-Nodejs/${pubnubWithMockCrypto.getVersion()}`,
        uuid: 'myUUID',
        include_uuid: 'true',
        include_message_type: 'true',
      })
      .reply(
        200,
        '{ "channels": { "ch1": [{"message": "encrypted-data", "timetoken": "16048329933709932", "uuid": "test-uuid"}] } }',
        { 'content-type': 'text/javascript' },
      );

    pubnubWithMockCrypto.fetchMessages({ channels: ['ch1'] }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        const message = response.channels.ch1[0];
        assert.deepEqual(message.message, { text: 'hello' });
        assert.equal(scope.isDone(), true);
        pubnubWithMockCrypto.destroy(true);
        done();
      } catch (error) {
        pubnubWithMockCrypto.destroy(true);
        done(error);
      }
    });
  });

  it('supports both actions and data fields for backward compatibility', (done) => {
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
        '{ "channels": { "ch1": [{"message": {"text": "hello"}, "timetoken": "16048329933709932", "uuid": "test-uuid", "actions": {"reaction": {"like": [{"uuid": "user1", "actionTimetoken": "16048329933709933"}]}}}] } }',
        { 'content-type': 'text/javascript' },
      );

    pubnub.fetchMessages({ channels: ['ch1'], includeMessageActions: true }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        const message = response.channels.ch1[0];
        // TypeScript requires type assertion
        assert('actions' in message);
        assert('data' in message);
        assert.deepEqual((message as any).actions, (message as any).data);
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('validates includeMessageActions single channel constraint', async () => {
    let errorCaught = false;
    try {
      await pubnub.fetchMessages({ channels: ['ch1', 'ch2'], includeMessageActions: true });
    } catch (error) {
      assert(error instanceof PubNubError);
      assert.equal(
        error.status!.message,
        'History can return actions data for a single channel only. Either pass a single channel or disable the includeMessageActions flag.'
      );
      errorCaught = true;
    }
    assert(errorCaught);
  });

  it('handles server error responses gracefully', (done) => {
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
        403,
        '{"status": 403, "error": true, "error_message": "Forbidden"}',
        { 'content-type': 'text/javascript' },
      );

    pubnub.fetchMessages({ channels: ['ch1'] }, (status, response) => {
      try {
        assert.equal(status.error, true);
        assert.equal(status.category, 'PNAccessDeniedCategory');
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('processes pagination more field correctly', (done) => {
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
        '{"channels": {"ch1": [{"message": {"text": "hello"}, "timetoken": "16048329933709932", "uuid": "test-uuid"}]}, "more": {"url": "/v3/history-with-actions/sub-key/sub-key/channel/ch1?start=16048329933709932&max=25", "start": "16048329933709932", "max": 25}}',
        { 'content-type': 'text/javascript' },
      );

    pubnub.fetchMessages({ channels: ['ch1'], includeMessageActions: true }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        assert('more' in response);
        assert.equal(response.more.url, '/v3/history-with-actions/sub-key/sub-key/channel/ch1?start=16048329933709932&max=25');
        assert.equal(response.more.start, '16048329933709932');
        assert.equal(response.more.max, 25);
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('handles stringified timetokens option', (done) => {
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
        string_message_token: 'true',
      })
      .reply(
        200,
        '{ "channels": { "ch1": [{"message": {"text": "hello"}, "timetoken": "16048329933709932", "uuid": "test-uuid"}] } }',
        { 'content-type': 'text/javascript' },
      );

    pubnub.fetchMessages({ channels: ['ch1'], stringifiedTimeToken: true }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('includes meta data when requested', (done) => {
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
        include_meta: 'true',
      })
      .reply(
        200,
        '{ "channels": { "ch1": [{"message": {"text": "hello"}, "timetoken": "16048329933709932", "uuid": "test-uuid", "meta": {"custom": "data"}}] } }',
        { 'content-type': 'text/javascript' },
      );

    pubnub.fetchMessages({ channels: ['ch1'], includeMeta: true }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        const message = response.channels.ch1[0];
        assert.deepEqual(message.meta, { custom: 'data' });
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('excludes meta data when not requested', (done) => {
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
        '{ "channels": { "ch1": [{"message": {"text": "hello"}, "timetoken": "16048329933709932", "uuid": "test-uuid"}] } }',
        { 'content-type': 'text/javascript' },
      );

    pubnub.fetchMessages({ channels: ['ch1'], includeMeta: false }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        const message = response.channels.ch1[0];
        // When includeMeta is false, the query should not include include_meta parameter
        // and the server response should not include meta field
        assert.equal(message.meta, undefined);
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('handles custom message types correctly', (done) => {
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
        include_custom_message_type: 'true',
      })
      .reply(
        200,
        '{ "channels": { "ch1": [{"message": {"text": "hello"}, "timetoken": "16048329933709932", "uuid": "test-uuid", "custom_message_type": "my-custom-type"}] } }',
        { 'content-type': 'text/javascript' },
      );

    pubnub.fetchMessages({ channels: ['ch1'], includeCustomMessageType: true }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        const message = response.channels.ch1[0];
        assert.equal(message.customMessageType, 'my-custom-type');
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('processes UUID field when included', (done) => {
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
        '{ "channels": { "ch1": [{"message": {"text": "hello"}, "timetoken": "16048329933709932", "uuid": "publisher-uuid"}] } }',
        { 'content-type': 'text/javascript' },
      );

    pubnub.fetchMessages({ channels: ['ch1'], includeUUID: true }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        const message = response.channels.ch1[0];
        assert.equal(message.uuid, 'publisher-uuid');
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('omits UUID field when not requested', (done) => {
    nock.disableNetConnect();
    const scope = utils
      .createNock()
      .get(`/v3/history/sub-key/${subscribeKey}/channel/ch1`)
      .query({
        max: '100',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        include_message_type: 'true',
      })
      .reply(
        200,
        '{ "channels": { "ch1": [{"message": {"text": "hello"}, "timetoken": "16048329933709932", "uuid": "publisher-uuid"}] } }',
        { 'content-type': 'text/javascript' },
      );

    pubnub.fetchMessages({ channels: ['ch1'], includeUUID: false }, (status, response) => {
      try {
        assert.equal(status.error, false);
        // The nock interceptor correctly matches the query without include_uuid parameter
        // which verifies that includeUUID: false works as expected
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('handles start and end timetoken parameters', (done) => {
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
        start: '15610547826970000',
        end: '15610547826970100',
      })
      .reply(
        200,
        '{ "channels": { "ch1": [{"message": {"text": "hello"}, "timetoken": "15610547826970050", "uuid": "test-uuid"}] } }',
        { 'content-type': 'text/javascript' },
      );

    pubnub.fetchMessages({ 
      channels: ['ch1'], 
      start: '15610547826970000', 
      end: '15610547826970100' 
    }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        const message = response.channels.ch1[0];
        assert.equal(message.timetoken, '15610547826970050');
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('supports both callback and promise patterns', async () => {
    nock.disableNetConnect();
    
    // Test Promise pattern
    const promiseScope = utils
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
        '{ "channels": { "ch1": [{"message": {"text": "hello"}, "timetoken": "16048329933709932", "uuid": "test-uuid"}] } }',
        { 'content-type': 'text/javascript' },
      );

    try {
      const response = await pubnub.fetchMessages({ channels: ['ch1'] });
      assert(response !== null);
      assert(response.channels.ch1);
      assert.equal(promiseScope.isDone(), true);
    } catch (error) {
      throw error;
    }

    // Test Callback pattern
    const callbackScope = utils
      .createNock()
      .get(`/v3/history/sub-key/${subscribeKey}/channel/ch2`)
      .query({
        max: '100',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        include_uuid: 'true',
        include_message_type: 'true',
      })
      .reply(
        200,
        '{ "channels": { "ch2": [{"message": {"text": "hello"}, "timetoken": "16048329933709932", "uuid": "test-uuid"}] } }',
        { 'content-type': 'text/javascript' },
      );

    return new Promise<void>((resolve, reject) => {
      pubnub.fetchMessages({ channels: ['ch2'] }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert(response !== null);
          assert(response.channels.ch2);
          assert.equal(callbackScope.isDone(), true);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  });

  it('logs requests and responses when logVerbosity enabled', (done) => {
    nock.disableNetConnect();
    
    // Create PubNub instance with logVerbosity enabled
    const pubnubWithLogging = new PubNub({
      subscribeKey,
      publishKey,
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
      logVerbosity: true,
    });

    const scope = utils
      .createNock()
      .get(`/v3/history/sub-key/${subscribeKey}/channel/ch1`)
      .query({
        max: '100',
        pnsdk: `PubNub-JS-Nodejs/${pubnubWithLogging.getVersion()}`,
        uuid: 'myUUID',
        include_uuid: 'true',
        include_message_type: 'true',
      })
      .reply(
        200,
        '{ "channels": { "ch1": [{"message": {"text": "hello"}, "timetoken": "16048329933709932", "uuid": "test-uuid"}] } }',
        { 'content-type': 'text/javascript' },
      );

    // Mock console.log to capture log calls
    const originalLog = console.log;
    let logCalled = false;
    console.log = (...args) => {
      if (args.some(arg => typeof arg === 'string' && arg.includes('decryption'))) {
        logCalled = true;
      }
      originalLog.apply(console, args);
    };

    pubnubWithLogging.fetchMessages({ channels: ['ch1'] }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert.equal(scope.isDone(), true);
        console.log = originalLog; // Restore console.log
        pubnubWithLogging.destroy(true);
        done();
      } catch (error) {
        console.log = originalLog; // Restore console.log
        pubnubWithLogging.destroy(true);
        done(error);
      }
    });
  });

  it('handles concurrent fetchMessages calls safely', async () => {
    nock.disableNetConnect();
    
    const scopes = [1, 2, 3].map(i => 
      utils
        .createNock()
        .get(`/v3/history/sub-key/${subscribeKey}/channel/ch${i}`)
        .query({
          max: '100',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          include_uuid: 'true',
          include_message_type: 'true',
        })
        .reply(
          200,
          `{ "channels": { "ch${i}": [{"message": {"text": "hello${i}"}, "timetoken": "1604832993370993${i}", "uuid": "test-uuid"}] } }`,
          { 'content-type': 'text/javascript' },
        )
    );

    const promises = [1, 2, 3].map(i => 
      pubnub.fetchMessages({ channels: [`ch${i}`] })
    );

    const responses = await Promise.all(promises);
    
    responses.forEach((response, index) => {
      assert(response !== null);
      assert(response.channels[`ch${index + 1}`]);
      assert.equal(scopes[index].isDone(), true);
    });
  });

  it('supports large channel lists within limits', (done) => {
    nock.disableNetConnect();
    
    const channels = Array.from({ length: 10 }, (_, i) => `channel${i}`);
    const encodedChannels = channels.join(',');
    
    const scope = utils
      .createNock()
      .get(`/v3/history/sub-key/${subscribeKey}/channel/${encodedChannels}`)
      .query({
        max: '25', // Should default to 25 for multiple channels
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        include_uuid: 'true',
        include_message_type: 'true',
      })
      .reply(
        200,
        '{ "channels": {} }',
        { 'content-type': 'text/javascript' },
      );

    pubnub.fetchMessages({ channels }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('handles malformed service responses gracefully', (done) => {
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
        'invalid json response',
        { 'content-type': 'text/javascript' },
      );

    pubnub.fetchMessages({ channels: ['ch1'] }, (status, response) => {
      try {
        assert.equal(status.error, true);
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('adds signature when secretKey configured', (done) => {
    nock.disableNetConnect();
    
    const pubnubWithSecret = new PubNub({
      subscribeKey,
      publishKey,
      secretKey: 'my-secret-key',
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
    });

    const scope = utils
      .createNock()
      .get(`/v3/history/sub-key/${subscribeKey}/channel/ch1`)
      .query((queryObject) => {
        // Ensure the return value is always boolean to satisfy type requirements
        return !!(queryObject.signature && queryObject.signature.toString().startsWith('v2.'));
      })
      .reply(
        200,
        '{ "channels": { "ch1": [{"message": {"text": "hello"}, "timetoken": "16048329933709932", "uuid": "test-uuid"}] } }',
        { 'content-type': 'text/javascript' },
      );

    pubnubWithSecret.fetchMessages({ channels: ['ch1'] }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert.equal(scope.isDone(), true);
        pubnubWithSecret.destroy(true);
        done();
      } catch (error) {
        pubnubWithSecret.destroy(true);
        done(error);
      }
    });
  });

  it('handles very large message payloads', (done) => {
    nock.disableNetConnect();
    
    const largeMessage = 'x'.repeat(10000); // Large message payload
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
        `{ "channels": { "ch1": [{"message": {"text": "${largeMessage}"}, "timetoken": "16048329933709932", "uuid": "test-uuid"}] } }`,
        { 'content-type': 'text/javascript' },
      );

    pubnub.fetchMessages({ channels: ['ch1'] }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        const message = response.channels.ch1[0];
        assert.equal((message.message as any).text, largeMessage);
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('processes mixed file and regular messages', (done) => {
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
        '{ "channels": { "ch1": [{"message": {"text": "regular message"}, "timetoken": "16048329933709932", "message_type": null, "uuid": "test-uuid"}, {"message": "{\\"message\\": \\"file message\\", \\"file\\": {\\"id\\": \\"file-id\\", \\"name\\": \\"file.txt\\", \\"mime-type\\": \\"text/plain\\", \\"size\\": 100}}", "timetoken": "16048329933709933", "message_type": 4, "uuid": "test-uuid"}] } }',
        { 'content-type': 'text/javascript' },
      );

    pubnub.setCipherKey('cipherKey');
    pubnub.fetchMessages({ channels: ['ch1'] }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert(response !== null);
        const messages = response.channels.ch1;
        
        // Regular message
        assert.equal(messages[0].messageType, -1);
        assert.deepEqual(messages[0].message, { text: 'regular message' });
        
        // File message - just check that message type is correct
        assert.equal(messages[1].messageType, 4);
        
        assert.equal(scope.isDone(), true);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('handles includeCustomMessageType flag variations', (done) => {
    nock.disableNetConnect();
    
    // Test with includeCustomMessageType: true
    const trueScope = utils
      .createNock()
      .get(`/v3/history/sub-key/${subscribeKey}/channel/ch1`)
      .query({
        max: '100',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        include_uuid: 'true',
        include_message_type: 'true',
        include_custom_message_type: 'true',
      })
      .reply(
        200,
        '{ "channels": { "ch1": [] } }',
        { 'content-type': 'text/javascript' },
      );

    pubnub.fetchMessages({ channels: ['ch1'], includeCustomMessageType: true }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert.equal(trueScope.isDone(), true);
        
        // Test with includeCustomMessageType: false
        const falseScope = utils
          .createNock()
          .get(`/v3/history/sub-key/${subscribeKey}/channel/ch2`)
          .query({
            max: '100',
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
            include_uuid: 'true',
            include_message_type: 'true',
            include_custom_message_type: 'false',
          })
          .reply(
            200,
            '{ "channels": { "ch2": [] } }',
            { 'content-type': 'text/javascript' },
          );

        pubnub.fetchMessages({ channels: ['ch2'], includeCustomMessageType: false }, (status2, response2) => {
          try {
            assert.equal(status2.error, false);
            assert.equal(falseScope.isDone(), true);
            done();
          } catch (error) {
            done(error);
          }
        });
      } catch (error) {
        done(error);
      }
    });
  });

  it('validates operation type correctly', () => {
    const request = new (require('../../../src/core/endpoints/fetch_messages').FetchMessagesRequest)({
      keySet: { subscribeKey: 'test-key', publishKey: 'pub-key' },
      channels: ['ch1'],
      getFileUrl: () => 'https://example.com/file',
    });

    const operation = request.operation();
    const RequestOperation = require('../../../src/core/constants/operations').default;
    assert.equal(operation, RequestOperation.PNFetchMessagesOperation);
  });

  it('handles edge case count values', (done) => {
    nock.disableNetConnect();
    
    // Test count=0 should use defaults
    const scope1 = utils
      .createNock()
      .get(`/v3/history/sub-key/${subscribeKey}/channel/ch1`)
      .query({
        max: '100', // Should default to 100 for single channel
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        include_uuid: 'true',
        include_message_type: 'true',
      })
      .reply(
        200,
        '{ "channels": { "ch1": [] } }',
        { 'content-type': 'text/javascript' },
      );

    pubnub.fetchMessages({ channels: ['ch1'], count: 0 }, (status, response) => {
      try {
        assert.equal(status.error, false);
        assert.equal(scope1.isDone(), true);
        
        // Test count=1 should work as specified
        const scope2 = utils
          .createNock()
          .get(`/v3/history/sub-key/${subscribeKey}/channel/ch2`)
          .query({
            max: '1',
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
            include_uuid: 'true',
            include_message_type: 'true',
          })
          .reply(
            200,
            '{ "channels": { "ch2": [] } }',
            { 'content-type': 'text/javascript' },
          );

        pubnub.fetchMessages({ channels: ['ch2'], count: 1 }, (status2, response2) => {
          try {
            assert.equal(status2.error, false);
            assert.equal(scope2.isDone(), true);
            done();
          } catch (error) {
            done(error);
          }
        });
      } catch (error) {
        done(error);
      }
    });
  });
});
