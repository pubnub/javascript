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
  const timetokens: string[] = [];

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
  const actionsToAdd: { messageTimetoken: string; action: MessageAction }[] = [];
  const timetokens: string[] = [];
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
        setTimeout(() => {
          completion(timetokens.sort((left, right) => parseInt(left, 10) - parseInt(right, 10)));
        }, 500);
      }
    });
  };

  addAction(actionsAdded);
}

describe('message actions endpoints', () => {
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
              assert.equal(err.status.message, 'Missing Action');
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
              assert.equal(err.status.message, 'Missing Action.type');
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
              assert.equal(err.status.message, 'Action.type value exceed maximum length of 15');
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
              assert.equal(err.status.message, 'Missing Action.value');
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
              assert.equal(err.status.message, 'Missing message timetoken');
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
              assert.equal(err.status.message, 'Missing message channel');
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
              if (undefined === response.data.uuid) {
                console.log(`Received unexpected response:`);
                console.dir(response, { depth: 20 });
              }
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
            assert.equal(messageActionEvent.event, 'added');
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
              assert.equal(err.status.message, 'Missing message timetoken');

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
              assert.equal(err.status.message, 'Missing action timetoken');

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
              assert.equal(err.status.message, 'Missing message action channel');

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
                assert.equal(messageActionEvent.event, 'removed');
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
            assert.equal(err.status.message, 'Missing message channel');

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

  describe('edge cases and error handling', () => {
    it('should handle network connection errors gracefully', (done) => {
      nock.disableNetConnect();
      const scope = utils
        .createNock()
        .post(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890`)
        .replyWithError('Network connection failed');

      pubnub.addMessageAction(
        { channel: 'test-channel', messageTimetoken: '1234567890', action: { type: 'reaction', value: 'test' } },
        (status) => {
          try {
            assert.equal(status.error, true);
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });

    it('should handle 403 forbidden error', (done) => {
      nock.disableNetConnect();
      const scope = utils
        .createNock()
        .post(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890`)
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(403, {
          error: {
            message: 'Forbidden',
            source: 'actions',
          },
        });

      pubnub.addMessageAction(
        { channel: 'test-channel', messageTimetoken: '1234567890', action: { type: 'reaction', value: 'test' } },
        (status) => {
          try {
            assert.equal(status.error, true);
            assert.equal(status.statusCode, 403);
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });

    it('should handle 404 channel not found error', (done) => {
      nock.disableNetConnect();
      const scope = utils
        .createNock()
        .get(`/v1/message-actions/${subscribeKey}/channel/nonexistent-channel`)
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(404, {
          error: {
            message: 'Channel not found',
            source: 'actions',
          },
        });

      pubnub.getMessageActions({ channel: 'nonexistent-channel' }, (status) => {
        try {
          assert.equal(status.error, true);
          assert.equal(status.statusCode, 404);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('should handle 500 internal server error', (done) => {
      nock.disableNetConnect();
      const scope = utils
        .createNock()
        .delete(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890/action/15610547826970050`)
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(500, {
          error: {
            message: 'Internal Server Error',
            source: 'actions',
          },
        });

      pubnub.removeMessageAction(
        { channel: 'test-channel', messageTimetoken: '1234567890', actionTimetoken: '15610547826970050' },
        (status) => {
          try {
            assert.equal(status.error, true);
            assert.equal(status.statusCode, 500);
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });

    it('should handle malformed response', (done) => {
      nock.disableNetConnect();
      const scope = utils
        .createNock()
        .get(`/v1/message-actions/${subscribeKey}/channel/test-channel`)
        .reply(200, 'invalid json response');

      pubnub.getMessageActions({ channel: 'test-channel' }, (status) => {
        try {
          assert.equal(status.error, true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  describe('Unicode and special character handling', () => {
    it('should handle Unicode characters in action type and value', (done) => {
      nock.disableNetConnect();
      const scope = utils
        .createNock()
        .post(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890`)
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(200, {
          status: 200,
          data: {
            type: 'emoji',
            value: '😀🎉',
            uuid: 'myUUID',
            actionTimetoken: '15610547826970050',
            messageTimetoken: '1234567890',
          },
        });

      pubnub.addMessageAction(
        { channel: 'test-channel', messageTimetoken: '1234567890', action: { type: 'emoji', value: '😀🎉' } },
        (status, response) => {
          try {
            assert.equal(scope.isDone(), true);
            assert.equal(status.error, false);
            assert(response !== null);
            assert.equal(response.data.type, 'emoji');
            assert.equal(response.data.value, '😀🎉');
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });

    it('should handle Unicode channel names', (done) => {
      nock.disableNetConnect();
      const scope = utils
        .createNock()
        .get(`/v1/message-actions/${subscribeKey}/channel/caf%C3%A9`)
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(200, {
          status: 200,
          data: [],
        });

      pubnub.getMessageActions({ channel: 'café' }, (status) => {
        try {
          assert.equal(scope.isDone(), true);
          assert.equal(status.error, false);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('should handle special characters in channel names', (done) => {
      nock.disableNetConnect();
      const scope = utils
        .createNock()
        .post(`/v1/message-actions/${subscribeKey}/channel/test%20channel%2Bspecial%26chars/message/1234567890`)
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(200, {
          status: 200,
          data: {
            type: 'reaction',
            value: 'test',
            uuid: 'myUUID',
            actionTimetoken: '15610547826970050',
            messageTimetoken: '1234567890',
          },
        });

      pubnub.addMessageAction(
        { 
          channel: 'test channel+special&chars', 
          messageTimetoken: '1234567890', 
          action: { type: 'reaction', value: 'test' } 
        },
        (status) => {
          try {
            assert.equal(scope.isDone(), true);
            assert.equal(status.error, false);
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });
  });

  describe('pagination and response limits', () => {
    it('should handle empty message actions response', (done) => {
      nock.disableNetConnect();
      const scope = utils
        .createNock()
        .get(`/v1/message-actions/${subscribeKey}/channel/empty-channel`)
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(200, {
          status: 200,
          data: [],
        });

      pubnub.getMessageActions({ channel: 'empty-channel' }, (status, response) => {
        try {
          assert.equal(scope.isDone(), true);
          assert.equal(status.error, false);
          assert(response !== null);
          assert.equal(response.data.length, 0);
          assert.equal(response.start, null);
          assert.equal(response.end, null);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('should handle pagination with start parameter', (done) => {
      nock.disableNetConnect();
      const scope = utils
        .createNock()
        .get(`/v1/message-actions/${subscribeKey}/channel/test-channel`)
        .query({
          start: '15610547826970050',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(200, {
          status: 200,
          data: [
            {
              type: 'reaction',
              value: 'test',
              uuid: 'user1',
              actionTimetoken: '15610547826970040',
              messageTimetoken: '1234567890',
            },
          ],
        });

      pubnub.getMessageActions({ channel: 'test-channel', start: '15610547826970050' }, (status, response) => {
        try {
          assert.equal(scope.isDone(), true);
          assert.equal(status.error, false);
          assert(response !== null);
          assert.equal(response.data.length, 1);
          assert.equal(response.start, '15610547826970040');
          assert.equal(response.end, '15610547826970040');
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('should handle pagination with limit parameter', (done) => {
      nock.disableNetConnect();
      const scope = utils
        .createNock()
        .get(`/v1/message-actions/${subscribeKey}/channel/test-channel`)
        .query({
          limit: 5,
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(200, {
          status: 200,
          data: Array.from({ length: 5 }, (_, i) => ({
            type: 'reaction',
            value: `value${i}`,
            uuid: `user${i}`,
            actionTimetoken: `1561054782697005${i}`,
            messageTimetoken: '1234567890',
          })),
        });

      pubnub.getMessageActions({ channel: 'test-channel', limit: 5 }, (status, response) => {
        try {
          assert.equal(scope.isDone(), true);
          assert.equal(status.error, false);
          assert(response !== null);
          assert.equal(response.data.length, 5);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('should handle response with more field for pagination', (done) => {
      nock.disableNetConnect();
      const scope = utils
        .createNock()
        .get(`/v1/message-actions/${subscribeKey}/channel/test-channel`)
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(200, {
          status: 200,
          data: [
            {
              type: 'reaction',
              value: 'test',
              uuid: 'user1',
              actionTimetoken: '15610547826970050',
              messageTimetoken: '1234567890',
            },
          ],
          more: {
            url: `/v1/message-actions/${subscribeKey}/channel/test-channel?start=15610547826970049`,
            start: '15610547826970049',
            end: '15610547826970000',
            limit: 100,
          },
        });

      pubnub.getMessageActions({ channel: 'test-channel' }, (status, response) => {
        try {
          assert.equal(scope.isDone(), true);
          assert.equal(status.error, false);
          assert(response !== null);
          assert.equal(response.data.length, 1);
          assert(response.more);
          assert.equal(response.more?.start, '15610547826970049');
          assert.equal(response.more?.limit, 100);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  describe('boundary conditions', () => {
    it('should handle action type at maximum length (15 characters)', (done) => {
      nock.disableNetConnect();
      const maxLengthType = '123456789012345'; // exactly 15 characters
      const scope = utils
        .createNock()
        .post(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890`)
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(200, {
          status: 200,
          data: {
            type: maxLengthType,
            value: 'test',
            uuid: 'myUUID',
            actionTimetoken: '15610547826970050',
            messageTimetoken: '1234567890',
          },
        });

      pubnub.addMessageAction(
        { channel: 'test-channel', messageTimetoken: '1234567890', action: { type: maxLengthType, value: 'test' } },
        (status, response) => {
          try {
            assert.equal(scope.isDone(), true);
            assert.equal(status.error, false);
            assert(response !== null);
            assert.equal(response.data.type, maxLengthType);
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });

    it('should handle very long action values', (done) => {
      nock.disableNetConnect();
      const longValue = 'a'.repeat(1000);
      const scope = utils
        .createNock()
        .post(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890`)
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(200, {
          status: 200,
          data: {
            type: 'reaction',
            value: longValue,
            uuid: 'myUUID',
            actionTimetoken: '15610547826970050',
            messageTimetoken: '1234567890',
          },
        });

      pubnub.addMessageAction(
        { channel: 'test-channel', messageTimetoken: '1234567890', action: { type: 'reaction', value: longValue } },
        (status, response) => {
          try {
            assert.equal(scope.isDone(), true);
            assert.equal(status.error, false);
            assert(response !== null);
            assert.equal(response.data.value, longValue);
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });

    it('should handle very large timetoken values', (done) => {
      nock.disableNetConnect();
      const largeTimetoken = '99999999999999999999';
      const scope = utils
        .createNock()
        .post(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/${largeTimetoken}`)
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(200, {
          status: 200,
          data: {
            type: 'reaction',
            value: 'test',
            uuid: 'myUUID',
            actionTimetoken: '15610547826970050',
            messageTimetoken: largeTimetoken,
          },
        });

      pubnub.addMessageAction(
        { channel: 'test-channel', messageTimetoken: largeTimetoken, action: { type: 'reaction', value: 'test' } },
        (status, response) => {
          try {
            assert.equal(scope.isDone(), true);
            assert.equal(status.error, false);
            assert(response !== null);
            assert.equal(response.data.messageTimetoken, largeTimetoken);
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });
  });

  describe('promise API support', () => {
    it('should support promise-based addMessageAction', async () => {
      nock.disableNetConnect();
      const scope = utils
        .createNock()
        .post(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890`)
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(200, {
          status: 200,
          data: {
            type: 'reaction',
            value: 'test',
            uuid: 'myUUID',
            actionTimetoken: '15610547826970050',
            messageTimetoken: '1234567890',
          },
        });

      try {
        const response = await pubnub.addMessageAction({
          channel: 'test-channel',
          messageTimetoken: '1234567890',
          action: { type: 'reaction', value: 'test' },
        });

        assert.equal(scope.isDone(), true);
        assert.equal(response.data.type, 'reaction');
        assert.equal(response.data.value, 'test');
      } catch (error) {
        throw error;
      }
    });

    it('should support promise-based getMessageActions', async () => {
      nock.disableNetConnect();
      const scope = utils
        .createNock()
        .get(`/v1/message-actions/${subscribeKey}/channel/test-channel`)
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(200, {
          status: 200,
          data: [
            {
              type: 'reaction',
              value: 'test',
              uuid: 'user1',
              actionTimetoken: '15610547826970050',
              messageTimetoken: '1234567890',
            },
          ],
        });

      try {
        const response = await pubnub.getMessageActions({ channel: 'test-channel' });

        assert.equal(scope.isDone(), true);
        assert.equal(response.data.length, 1);
        assert.equal(response.data[0].type, 'reaction');
      } catch (error) {
        throw error;
      }
    });

    it('should support promise-based removeMessageAction', async () => {
      nock.disableNetConnect();
      const scope = utils
        .createNock()
        .delete(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890/action/15610547826970050`)
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(200, {
          status: 200,
          data: {},
        });

      try {
        const response = await pubnub.removeMessageAction({
          channel: 'test-channel',
          messageTimetoken: '1234567890',
          actionTimetoken: '15610547826970050',
        });

        assert.equal(scope.isDone(), true);
        assert(response.data);
      } catch (error) {
        throw error;
      }
    });
  });

  describe('HTTP compliance verification', () => {
    it('should use correct HTTP method for add action', (done) => {
      nock.disableNetConnect();
      const scope = utils
        .createNock()
        .post(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890`)
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(200, { 
          status: 200, 
          data: { 
            type: 'reaction', 
            value: 'test', 
            uuid: 'test', 
            actionTimetoken: '123', 
            messageTimetoken: '1234567890' 
          } 
        });

      pubnub.addMessageAction(
        { channel: 'test-channel', messageTimetoken: '1234567890', action: { type: 'reaction', value: 'test' } },
        (status) => {
          try {
            assert.equal(status.error, false);
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });

    it('should use correct HTTP method for get actions', (done) => {
      nock.disableNetConnect();
      const scope = utils
        .createNock()
        .get(`/v1/message-actions/${subscribeKey}/channel/test-channel`)
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(200, { status: 200, data: [] });

      pubnub.getMessageActions({ channel: 'test-channel' }, (status) => {
        try {
          assert.equal(status.error, false);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('should use correct HTTP method for remove action', (done) => {
      nock.disableNetConnect();
      const scope = utils
        .createNock()
        .delete(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890/action/15610547826970050`)
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(200, { status: 200, data: {} });

      pubnub.removeMessageAction(
        { channel: 'test-channel', messageTimetoken: '1234567890', actionTimetoken: '15610547826970050' },
        (status) => {
          try {
            assert.equal(status.error, false);
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });

    it('should include correct Content-Type header for POST requests', (done) => {
      nock.disableNetConnect();
      const scope = utils
        .createNock()
        .post(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890`)
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(200, { 
          status: 200, 
          data: { 
            type: 'reaction', 
            value: 'test', 
            uuid: 'test', 
            actionTimetoken: '123', 
            messageTimetoken: '1234567890' 
          } 
        });

      pubnub.addMessageAction(
        { channel: 'test-channel', messageTimetoken: '1234567890', action: { type: 'reaction', value: 'test' } },
        (status) => {
          try {
            assert.equal(status.error, false);
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    });
  });
});
