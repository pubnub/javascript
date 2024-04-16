/* global describe, beforeEach, afterEach, it, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';

import * as MessageActions from '../../../src/core/types/api/message-action';
import PubNub from '../../../src/node/index';
import utils from '../../utils';

/**
 * Message action object.
 */
type MessageAction = MessageActions.AddMessageActionParameters['action'];

/**
 * Prepare messages history.
 *
 * @param client - PubNub client instance which will be used to publish messages.
 * @param count - How many messages should be published.
 * @param channel - Name of the channel into which messages should be published.
 * @param completion - Messages set publish completion function.
 */
function publishMessages(client: PubNub, count: number, channel: string, completion: (timetokens: string[]) => void) {
  let publishCompleted = 0;
  let timetokens: string[] = [];

  const publish = (messageIdx: number) => {
    const message = { messageIdx, time: Date.now() };

    client.publish({ message, channel }, (status, response) => {
      publishCompleted += 1;

      if (!status.error && response) {
        timetokens.push(response.timetoken);
      } else {
        console.error('Publish did fail:', status);
      }

      if (publishCompleted < count) {
        publish(publishCompleted);
      } else if (publishCompleted === count) {
        completion(timetokens.sort((left, right) => parseInt(left, 10) - parseInt(right, 10)));
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
function addActions(
  client: PubNub,
  count: number,
  messageTimetokens: string[],
  channel: string,
  completion: (timetokens: string[]) => void,
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
  let actionsToAdd: { messageTimetoken: string; action: MessageAction }[] = [];
  let timetokens: string[] = [];
  let actionsAdded = 0;

  for (let messageIdx = 0; messageIdx < messageTimetokens.length; messageIdx += 1) {
    const messageTimetoken = messageTimetokens[messageIdx];

    for (let messageActionIdx = 0; messageActionIdx < count; messageActionIdx += 1) {
      const action: MessageAction = {
        type: types[(messageActionIdx + 1) % 3],
        value: values[(messageActionIdx + 1) % 10],
      };

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
        timetokens.push(response.data.actionTimetoken);
      } else {
        console.error('Action add did fail:', action, '\n', status);
      }

      if (actionsAdded < actionsToAdd.length) {
        addAction(actionsAdded);
      } else if (actionsAdded === actionsToAdd.length) {
        completion(timetokens.sort((left, right) => parseInt(left, 10) - parseInt(right, 10)));
      }
    });
  };

  addAction(actionsAdded);
}

describe('message actions endpoints', () => {
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
      authKey: 'myAuthKey',
      // @ts-expect-error Force override default value.
      useRequestId: false,
    });
  });

  describe('addMessageAction', () => {
    describe('##validation', () => {
      it("fails if 'action' is missing", (done) => {
        nock.disableNetConnect();
        const scope = utils
          .createNock()
          .post(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890`)
          .reply(200, {});

        pubnub
          // @ts-expect-error Intentionally don't include `action`.
          .addMessageAction({
            channel: 'test-channel',
            messageTimetoken: '1234567890',
          })
          .catch((err) => {
            try {
              assert.equal(scope.isDone(), false);
              assert.equal(err.status.message, "Missing Action");
              done();
            } catch (error) {
              done(error);
            }
          });
      });

      it("fails if 'type' is missing", (done) => {
        nock.disableNetConnect();
        const scope = utils
          .createNock()
          .post(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890`)
          .reply(200, {});
        const action = { value: 'test value' };

        pubnub
          .addMessageAction({
            channel: 'test-channel',
            messageTimetoken: '1234567890',
            // @ts-expect-error Intentionally don't include `type` field into `action`.
            action,
          })
          .catch((err) => {
            try {
              assert.equal(scope.isDone(), false);
              assert.equal(err.status.message, "Missing Action.type");
              done();
            } catch (error) {
              done(error);
            }
          });
      });

      it("fails if 'type' is too long", (done) => {
        nock.disableNetConnect();
        const scope = utils
          .createNock()
          .post(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890`)
          .reply(200, {});
        const action: MessageAction = { type: PubNub.generateUUID(), value: 'test value' };

        pubnub
          .addMessageAction({
            channel: 'test-channel',
            messageTimetoken: '1234567890',
            action,
          })
          .catch((err) => {
            try {
              assert.equal(scope.isDone(), false);
              assert.equal(err.status.message, "Action.type value exceed maximum length of 15");
              done();
            } catch (error) {
              done(error);
            }
          });
      });

      it("fails if 'value' is missing", (done) => {
        nock.disableNetConnect();
        const scope = utils
          .createNock()
          .post(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890`)
          .reply(200, {});
        const action = { type: 'custom' };

        pubnub
          .addMessageAction({
            channel: 'test-channel',
            messageTimetoken: '1234567890',
            // @ts-expect-error Intentionally don't include `value` field into `action`.
            action,
          })
          .catch((err) => {
            try {
              assert.equal(scope.isDone(), false);
              assert.equal(err.status.message, "Missing Action.value");
              done();
            } catch (error) {
              done(error);
            }
          });
      });

      it("fails if 'messageTimetoken' is missing", (done) => {
        nock.disableNetConnect();
        const scope = utils
          .createNock()
          .post(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/`)
          .reply(200, {});
        const action: MessageAction = { type: 'custom', value: 'test value' };

        pubnub
          // @ts-expect-error Intentionally don't include `messageTimetoken`.
          .addMessageAction({
            channel: 'test-channel',
            action,
          })
          .catch((err) => {
            try {
              assert.equal(scope.isDone(), false);
              assert.equal(err.status.message, "Missing message timetoken");
              done();
            } catch (error) {
              done(error);
            }
          });
      });

      it("fails if 'channel' is missing", (done) => {
        nock.disableNetConnect();
        const scope = utils
          .createNock()
          .post(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890`)
          .reply(200, {});
        const action: MessageAction = { type: 'custom', value: 'test value' };

        pubnub
          // @ts-expect-error Intentionally don't include `channel`.
          .addMessageAction({
            messageTimetoken: '1234567890',
            action,
          })
          .catch((err) => {
            try {
              assert.equal(scope.isDone(), false);
              assert.equal(err.status.message, "Missing message channel");
              done();
            } catch (error) {
              done(error);
            }
          });
      });
    });

    it('add message action', (done) => {
      const messageAction: MessageAction = { type: 'custom', value: PubNub.generateUUID() };
      const channel = PubNub.generateUUID();

      publishMessages(pubnub, 1, channel, (timetokens) => {
        pubnub.addMessageAction(
          { channel, messageTimetoken: timetokens[0], action: messageAction },
          (status, response) => {
            try {
              assert.equal(status.error, false);
              assert(response !== null);
              assert.equal(response.data.type, messageAction.type);
              assert.equal(response.data.value, messageAction.value);
              assert.equal(response.data.uuid, pubnub.getUUID());
              assert.equal(response.data.messageTimetoken, timetokens[0]);
              assert(response.data.actionTimetoken);

              done();
            } catch (error) {
              done(error);
            }
          },
        );
      });
    }).timeout(60000);

    it('add message action with encoded channel', (done) => {
      const messageAction: MessageAction = { type: 'custom', value: PubNub.generateUUID() };
      const channel = `${PubNub.generateUUID()}#1`;

      publishMessages(pubnub, 1, channel, (timetokens) => {
        pubnub.addMessageAction(
          { channel, messageTimetoken: timetokens[0], action: messageAction },
          (status, response) => {
            try {
              assert.equal(status.error, false);
              assert(response !== null);
              assert.equal(response.data.type, messageAction.type);
              assert.equal(response.data.value, messageAction.value);
              assert.equal(response.data.uuid, pubnub.getUUID());
              assert.equal(response.data.messageTimetoken, timetokens[0]);
              assert(response.data.actionTimetoken);

              done();
            } catch (error) {
              done(error);
            }
          },
        );
      });
    }).timeout(60000);

    it('add message action and 207 status code', (done) => {
      nock.disableNetConnect();
      const scope = utils
        .createNock()
        .post(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890`)
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(207, {
          status: 207,
          data: {
            type: 'reaction',
            value: 'smiley_face',
            uuid: 'user-456',
            actionTimetoken: '15610547826970050',
            messageTimetoken: '15610547826969050',
          },
          error: {
            message: 'Stored but failed to publish message action.',
            source: 'actions',
          },
        });

      pubnub.addMessageAction(
        { channel: 'test-channel', messageTimetoken: '1234567890', action: { type: 'custom', value: 'test' } },
        (status) => {
          try {
            assert.equal(scope.isDone(), true);
            assert.equal(status.statusCode, 207);

            // @ts-expect-error `errorData` may contain a dictionary (Payload) with an arbitrary set of fields.
            assert(status.errorData!.message);

            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });

    it('add message action should trigger event', (done) => {
      const messageAction: MessageAction = { type: 'custom', value: PubNub.generateUUID() };
      const channel = PubNub.generateUUID();
      let messageTimetoken: string | null = null;

      pubnub.addListener({
        status: (status) => {
          if (status.category === 'PNConnectedCategory') {
            pubnub.publish({ channel, message: { hello: 'test' }, sendByPost: true }, (publishStatus, response) => {
              assert(response !== null);
              messageTimetoken = response.timetoken;

              pubnub.addMessageAction({ channel, messageTimetoken, action: messageAction });
            });
          }
        },
        messageAction: (messageActionEvent) => {
          try {
            assert(messageActionEvent.data);
            assert.equal(messageActionEvent.data.type, messageAction.type);
            assert.equal(messageActionEvent.data.value, messageAction.value);
            assert.equal(messageActionEvent.data.uuid, pubnub.getUUID());
            assert.equal(messageActionEvent.data.messageTimetoken, messageTimetoken);
            assert(messageActionEvent.data.actionTimetoken);
            assert.equal(messageActionEvent.event, "added");
            pubnub.unsubscribeAll();

            done();
          } catch (error) {
            done(error);
          }
        },
      });

      pubnub.subscribe({ channels: [channel] });
    }).timeout(60000);
  });

  describe('removeMessageAction', () => {
    describe('##validation', () => {
      it("fails if 'messageTimetoken' is missing", (done) => {
        nock.disableNetConnect();
        const scope = utils
          .createNock()
          .delete(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890/action/12345678901`)
          .reply(200, {});

        pubnub
          // @ts-expect-error Intentionally don't include `messageTimetoken`.
          .removeMessageAction({
            channel: 'test-channel',
            actionTimetoken: '1234567890',
          })
          .catch((err) => {
            try {
              assert.equal(scope.isDone(), false);
              assert.equal(err.status.message, "Missing message timetoken");

              done();
            } catch (error) {
              done(error);
            }
          });
      });

      it("fails if 'actionTimetoken' is missing", (done) => {
        nock.disableNetConnect();
        const scope = utils
          .createNock()
          .delete(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890/action/12345678901`)
          .reply(200, {});

        pubnub
          // @ts-expect-error Intentionally don't include `actionTimetoken`.
          .removeMessageAction({
            channel: 'test-channel',
            messageTimetoken: '1234567890',
          })
          .catch((err) => {
            try {
              assert.equal(scope.isDone(), false);
              assert.equal(err.status.message, "Missing action timetoken");

              done();
            } catch (error) {
              done(error);
            }
          });
      });

      it("fails if 'channel' is missing", (done) => {
        nock.disableNetConnect();
        const scope = utils
          .createNock()
          .delete(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890/action/12345678901`)
          .reply(200, {});

        pubnub
          // @ts-expect-error Intentionally don't include `channel`.
          .removeMessageAction({
            messageTimetoken: '1234567890',
            actionTimetoken: '12345678901',
          })
          .catch((err) => {
            try {
              assert.equal(scope.isDone(), false);
              assert.equal(err.status.message, "Missing message action channel");

              done();
            } catch (error) {
              done(error);
            }
          });
      });
    });

    it('remove message action', (done) => {
      const channel = PubNub.generateUUID();

      publishMessages(pubnub, 1, channel, (messageTimetokens) => {
        addActions(pubnub, 1, messageTimetokens, channel, (actionTimetokens) => {
          pubnub.getMessageActions({ channel }, (status, response) => {
            assert.equal(status.error, false);
            assert(response !== null);
            assert.equal(response.data.length, actionTimetokens.length);

            pubnub.removeMessageAction(
              { channel, actionTimetoken: actionTimetokens[0], messageTimetoken: messageTimetokens[0] },
              (removeMessageStatus) => {
                assert.equal(removeMessageStatus.error, false);

                setTimeout(() => {
                  pubnub.getMessageActions({ channel }, (getMessagesStatus, getMessagesResponse) => {
                    try {
                      assert.equal(getMessagesStatus.error, false);
                      assert(getMessagesResponse !== null);
                      assert.equal(getMessagesResponse.data.length, 0);

                      done();
                    } catch (error) {
                      done(error);
                    }
                  });
                }, 2000);
              },
            );
          });
        });
      });
    }).timeout(60000);

    it('remove message action with encoded channel', (done) => {
      const channel = `${PubNub.generateUUID()}#1`;

      publishMessages(pubnub, 1, channel, (messageTimetokens) => {
        addActions(pubnub, 1, messageTimetokens, channel, (actionTimetokens) => {
          pubnub.getMessageActions({ channel }, (status, response) => {
            assert.equal(status.error, false);
            assert(response !== null);
            assert.equal(response.data.length, actionTimetokens.length);

            pubnub.removeMessageAction(
              { channel, actionTimetoken: actionTimetokens[0], messageTimetoken: messageTimetokens[0] },
              (removeMessageStatus) => {
                assert.equal(removeMessageStatus.error, false);

                setTimeout(() => {
                  pubnub.getMessageActions({ channel }, (getMessagesStatus, getMessagesResponse) => {
                    try {
                      assert.equal(getMessagesStatus.error, false);
                      assert(getMessagesResponse !== null);
                      assert.equal(getMessagesResponse.data.length, 0);

                      done();
                    } catch (error) {
                      done(error);
                    }
                  });
                }, 2000);
              },
            );
          });
        });
      });
    }).timeout(60000);

    it('remove message action should trigger event', (done) => {
      const channel = PubNub.generateUUID();

      publishMessages(pubnub, 1, channel, (messageTimetokens) => {
        addActions(pubnub, 1, messageTimetokens, channel, (actionTimetokens) => {
          pubnub.addListener({
            status: (status) => {
              if (status.category === 'PNConnectedCategory') {
                pubnub.removeMessageAction(
                  { channel, actionTimetoken: actionTimetokens[0], messageTimetoken: messageTimetokens[0] },
                  (removeMessagesStatus) => {
                    assert.equal(removeMessagesStatus.error, false);
                  },
                );
              }
            },
            messageAction: (messageActionEvent) => {
              try {
                assert(messageActionEvent.data);
                assert.equal(messageActionEvent.data.uuid, pubnub.getUUID());
                assert.equal(messageActionEvent.data.messageTimetoken, messageTimetokens[0]);
                assert.equal(messageActionEvent.data.actionTimetoken, actionTimetokens[0]);
                assert.equal(messageActionEvent.event, "removed");
                pubnub.unsubscribeAll();

                done();
              } catch (error) {
                done(error);
              }
            },
          });

          pubnub.subscribe({ channels: [channel] });
        });
      });
    }).timeout(60000);
  });

  describe('getMessageAction', () => {
    describe('##validation', () => {
      it("fails if 'channel' is missing", (done) => {
        nock.disableNetConnect();
        const scope = utils.createNock().get(`/v1/message-actions/${subscribeKey}/channel/test-channel`).reply(200, {});

        // @ts-expect-error Intentionally don't include `channel`.
        pubnub.getMessageActions({}).catch((err) => {
          try {
            assert.equal(scope.isDone(), false);
            assert.equal(err.status.message, "Missing message channel");

            done();
          } catch (error) {
            done(error);
          }
        });
      });
    });

    it('fetch message actions', (done) => {
      const channel = PubNub.generateUUID();

      publishMessages(pubnub, 2, channel, (messageTimetokens) => {
        addActions(pubnub, 3, messageTimetokens, channel, (actionTimetokens) => {
          const lastPublishedActionTimetoken = actionTimetokens[actionTimetokens.length - 1];
          const firstPublishedActionTimetoken = actionTimetokens[0];

          pubnub.getMessageActions({ channel }, (status, response) => {
            try {
              assert.equal(status.error, false);
              assert(response !== null);
              const firstFetchedActionTimetoken = response.data[0].actionTimetoken;
              const lastFetchedActionTimetoken = response.data[response.data.length - 1].actionTimetoken;
              assert.equal(firstFetchedActionTimetoken, firstPublishedActionTimetoken);
              assert.equal(lastFetchedActionTimetoken, lastPublishedActionTimetoken);
              assert.equal(response.data.length, actionTimetokens.length);
              assert.equal(response.start, firstPublishedActionTimetoken);
              assert.equal(response.end, lastPublishedActionTimetoken);

              done();
            } catch (error) {
              done(error);
            }
          });
        });
      });
    }).timeout(60000);

    it('fetch message actions with encoded channel', (done) => {
      const channel = `${PubNub.generateUUID()}#1`;

      publishMessages(pubnub, 2, channel, (messageTimetokens) => {
        addActions(pubnub, 3, messageTimetokens, channel, (actionTimetokens) => {
          const lastPublishedActionTimetoken = actionTimetokens[actionTimetokens.length - 1];
          const firstPublishedActionTimetoken = actionTimetokens[0];

          pubnub.getMessageActions({ channel }, (status, response) => {
            try {
              assert.equal(status.error, false);
              assert(response !== null);
              const firstFetchedActionTimetoken = response.data[0].actionTimetoken;
              const lastFetchedActionTimetoken = response.data[response.data.length - 1].actionTimetoken;
              assert.equal(firstFetchedActionTimetoken, firstPublishedActionTimetoken);
              assert.equal(lastFetchedActionTimetoken, lastPublishedActionTimetoken);
              assert.equal(response.data.length, actionTimetokens.length);
              assert.equal(response.start, firstPublishedActionTimetoken);
              assert.equal(response.end, lastPublishedActionTimetoken);

              done();
            } catch (error) {
              done(error);
            }
          });
        });
      });
    }).timeout(60000);

    it('fetch next message actions page', (done) => {
      const channel = PubNub.generateUUID();

      publishMessages(pubnub, 2, channel, (messageTimetokens) => {
        addActions(pubnub, 5, messageTimetokens, channel, (actionTimetokens) => {
          const lastPublishedActionTimetoken = actionTimetokens[actionTimetokens.length - 1];
          const halfSize = Math.floor(actionTimetokens.length * 0.5);
          const firstPublishedActionTimetoken = actionTimetokens[0];
          const middleMinusOnePublishedActionTimetoken = actionTimetokens[halfSize - 1];
          const middlePublishedActionTimetoken = actionTimetokens[halfSize];

          pubnub.getMessageActions({ channel, limit: halfSize }, (status, response) => {
            assert.equal(status.error, false);
            assert(response !== null);
            let firstFetchedActionTimetoken = response.data[0].actionTimetoken;
            let lastFetchedActionTimetoken = response.data[response.data.length - 1].actionTimetoken;
            assert.equal(firstFetchedActionTimetoken, middlePublishedActionTimetoken);
            assert.equal(lastFetchedActionTimetoken, lastPublishedActionTimetoken);
            assert.equal(response.data.length, halfSize);
            assert.equal(response.start, middlePublishedActionTimetoken);
            assert.equal(response.end, lastPublishedActionTimetoken);

            pubnub.getMessageActions(
              { channel, start: middlePublishedActionTimetoken, limit: halfSize },
              (getMessageActionsStatus, getMessageActionsResponse) => {
                try {
                  assert.equal(getMessageActionsStatus.error, false);
                  assert(getMessageActionsResponse !== null);
                  firstFetchedActionTimetoken = getMessageActionsResponse.data[0].actionTimetoken;
                  lastFetchedActionTimetoken =
                    getMessageActionsResponse.data[getMessageActionsResponse.data.length - 1].actionTimetoken;
                  assert.equal(firstFetchedActionTimetoken, firstPublishedActionTimetoken);
                  assert.equal(lastFetchedActionTimetoken, middleMinusOnePublishedActionTimetoken);
                  assert.equal(getMessageActionsResponse.data.length, halfSize);
                  assert.equal(getMessageActionsResponse.start, firstPublishedActionTimetoken);
                  assert.equal(getMessageActionsResponse.end, middleMinusOnePublishedActionTimetoken);

                  done();
                } catch (error) {
                  done(error);
                }
              },
            );
          });
        });
      });
    }).timeout(60000);
  });
});
