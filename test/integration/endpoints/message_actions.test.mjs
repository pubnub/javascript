/* global describe, beforeEach, afterEach, it, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import PubNub from '../../../src/node/index';
import utils from '../../utils';


function publishMessages(client        , count        , channel        , completion          ) {
  let publishCompleted = 0;
  let timetokens = [];

  const publish = (messageIdx) => {
    const message = { messageIdx, time: Date.now() };

    client.publish(
      { message, channel },
      (status, response) => {
        publishCompleted += 1;

        if (!status.error) {
          timetokens.push(response.timetoken);
        } else {
          console.error('Publish did fail:', status);
        }

        if (publishCompleted < count) {
          publish(publishCompleted);
        } else if (publishCompleted === count) {
          completion(timetokens.sort((left, right) => left - right));
        }
      }
    );
  };

  publish(publishCompleted);
}

function addActions(client        , count        , messageTimetokens               , channel        , completion          ) {
  const types = ['reaction', 'receipt', 'custom'];
  const values = [
    PubNub.generateUUID(), PubNub.generateUUID(), PubNub.generateUUID(), PubNub.generateUUID(), PubNub.generateUUID(),
    PubNub.generateUUID(), PubNub.generateUUID(), PubNub.generateUUID(), PubNub.generateUUID(), PubNub.generateUUID()
  ];
  let actionsToAdd = [];
  let actionsAdded = 0;
  let timetokens = [];

  for (let messageIdx = 0; messageIdx < messageTimetokens.length; messageIdx += 1) {
    const messageTimetoken = messageTimetokens[messageIdx];

    for (let messageActionIdx = 0; messageActionIdx < count; messageActionIdx += 1) {
      /** @type MessageAction */
      const action = { type: types[(messageActionIdx + 1) % 3], value: values[(messageActionIdx + 1) % 10] };

      actionsToAdd.push({ messageTimetoken, action });
    }
  }

  const addAction = (actionIdx) => {
    const { messageTimetoken, action } = actionsToAdd[actionIdx];

    client.addMessageAction(
      { channel, messageTimetoken, action },
      (status, response) => {
        actionsAdded += 1;

        if (!status.error) {
          timetokens.push(response.data.actionTimetoken);
        } else {
          console.error('Action add did fail:', action, '\n', status);
        }

        if (actionsAdded < actionsToAdd.length) {
          addAction(actionsAdded);
        } else if (actionsAdded === actionsToAdd.length) {
          completion(timetokens.sort((left, right) => left - right));
        }
      }
    );
  };

  addAction(actionsAdded);
}


describe('message actions endpoints', () => {
  const subscribeKey = process.env.SUBSCRIBE_KEY || 'demo';
  const publishKey = process.env.PUBLISH_KEY || 'demo';
  let pubnub;

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
    });
  });

  describe('addMessageAction', () => {
    describe('##validation', () => {
      it('fails if \'action\' is missing', (done) => {
        nock.disableNetConnect();
        const scope = utils
          .createNock()
          .post(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890`)
          .reply(200, {});

        pubnub.addMessageAction({
          channel: 'test-channel',
          messageTimetoken: '1234567890',
        })
          .catch((err) => {
            assert.equal(scope.isDone(), false);
            assert.equal(err.status.message, 'Missing Action');
            done();
          });
      });

      it('fails if \'type\' is missing', (done) => {
        nock.disableNetConnect();
        const scope = utils
          .createNock()
          .post(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890`)
          .reply(200, {});
        const action = { value: 'test value' };

        pubnub.addMessageAction({
          channel: 'test-channel',
          messageTimetoken: '1234567890',
          action,
        })
          .catch((err) => {
            assert.equal(scope.isDone(), false);
            assert.equal(err.status.message, 'Missing Action.type');
            done();
          });
      });

      it('fails if \'type\' is too long', (done) => {
        nock.disableNetConnect();
        const scope = utils
          .createNock()
          .post(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890`)
          .reply(200, {});
        const action = { type: PubNub.generateUUID(), value: 'test value' };

        pubnub.addMessageAction({
          channel: 'test-channel',
          messageTimetoken: '1234567890',
          action,
        })
          .catch((err) => {
            assert.equal(scope.isDone(), false);
            assert.equal(err.status.message, 'Action.type value exceed maximum length of 15');
            done();
          });
      });

      it('fails if \'value\' is missing', (done) => {
        nock.disableNetConnect();
        const scope = utils
          .createNock()
          .post(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890`)
          .reply(200, {});
        const action = { type: 'custom' };

        pubnub.addMessageAction({
          channel: 'test-channel',
          messageTimetoken: '1234567890',
          action,
        })
          .catch((err) => {
            assert.equal(scope.isDone(), false);
            assert.equal(err.status.message, 'Missing Action.value');
            done();
          });
      });

      it('fails if \'messageTimetoken\' is missing', (done) => {
        nock.disableNetConnect();
        const scope = utils
          .createNock()
          .post(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/`)
          .reply(200, {});
        const action = { type: 'custom', value: 'test value' };

        pubnub.addMessageAction({
          channel: 'test-channel',
          action,
        })
          .catch((err) => {
            assert.equal(scope.isDone(), false);
            assert.equal(err.status.message, 'Missing message timetoken');
            done();
          });
      });

      it('fails if \'channel\' is missing', (done) => {
        nock.disableNetConnect();
        const scope = utils
          .createNock()
          .post(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890`)
          .reply(200, {});
        const action = { type: 'custom', value: 'test value' };

        pubnub.addMessageAction({
          messageTimetoken: '1234567890',
          action,
        })
          .catch((err) => {
            assert.equal(scope.isDone(), false);
            assert.equal(err.status.message, 'Missing message channel');
            done();
          });
      });
    });

    it('add message action', (done) => {
      /** @type MessageAction */
      const messageAction = { type: 'custom', value: PubNub.generateUUID() };
      const channel = PubNub.generateUUID();

      publishMessages(pubnub, 1, channel, (timetokens) => {
        pubnub.addMessageAction(
          { channel, messageTimetoken: timetokens[0], action: messageAction },
          (status, response) => {
            assert.equal(status.error, false);
            assert.equal(response.data.type, messageAction.type);
            assert.equal(response.data.value, messageAction.value);
            assert.equal(response.data.uuid, pubnub.getUUID());
            assert.equal(response.data.messageTimetoken, timetokens[0]);
            assert(response.data.actionTimetoken);

            done();
          }
        );
      });
    }).timeout(60000);

    it('add message action with encoded channel', (done) => {
      /** @type MessageAction */
      const messageAction = { type: 'custom', value: PubNub.generateUUID() };
      const channel = `${PubNub.generateUUID()}#1`;

      publishMessages(pubnub, 1, channel, (timetokens) => {
        pubnub.addMessageAction(
          { channel, messageTimetoken: timetokens[0], action: messageAction },
          (status, response) => {
            assert.equal(status.error, false);
            assert.equal(response.data.type, messageAction.type);
            assert.equal(response.data.value, messageAction.value);
            assert.equal(response.data.uuid, pubnub.getUUID());
            assert.equal(response.data.messageTimetoken, timetokens[0]);
            assert(response.data.actionTimetoken);

            done();
          }
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
          auth: 'myAuthKey'
        })
        .reply(207, {
          status: 207,
          data: {
            type: 'reaction',
            value: 'smiley_face',
            uuid: 'user-456',
            actionTimetoken: '15610547826970050',
            messageTimetoken: '15610547826969050'
          },
          error: {
            message: 'Stored but failed to publish message action.',
            source: 'actions'
          }
        });

      pubnub.addMessageAction(
        { channel: 'test-channel', messageTimetoken: '1234567890', action: { type: 'custom', value: 'test' } },
        (status) => {
          assert.equal(scope.isDone(), true);
          assert.equal(status.statusCode, 207);
          assert(status.errorData.message);

          done();
        }
      );
    });

    it('add message action should trigger event', (done) => {
      /** @type MessageAction */
      const messageAction = { type: 'custom', value: PubNub.generateUUID() };
      const channel = PubNub.generateUUID();
      let messageTimetoken = null;

      pubnub.addListener({
        status: (status) => {
          if (status.category === 'PNConnectedCategory') {
            pubnub.publish(
              { channel, message: { hello: 'test' }, sendByPost: true },
              (publishStatus, response) => {
                messageTimetoken = response.timetoken;

                pubnub.addMessageAction(
                  { channel, messageTimetoken, action: messageAction }
                );
              }
            );
          }
        },
        messageAction: (messageActionEvent) => {
          assert(messageActionEvent.data);
          assert.equal(messageActionEvent.data.type, messageAction.type);
          assert.equal(messageActionEvent.data.value, messageAction.value);
          assert.equal(messageActionEvent.data.uuid, pubnub.getUUID());
          assert.equal(messageActionEvent.data.messageTimetoken, messageTimetoken);
          assert(messageActionEvent.data.actionTimetoken);
          assert.equal(messageActionEvent.event, 'added');
          pubnub.unsubscribeAll()

          done();
        }
      });

      pubnub.subscribe({ channels: [channel] });
    }).timeout(60000);
  });

  describe('removeMessageAction', () => {
    describe('##validation', () => {
      it('fails if \'messageTimetoken\' is missing', (done) => {
        nock.disableNetConnect();
        const scope = utils
          .createNock()
          .delete(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890/action/12345678901`)
          .reply(200, {});

        pubnub.removeMessageAction({
          channel: 'test-channel',
          actionTimetoken: '1234567890',
        })
          .catch((err) => {
            assert.equal(scope.isDone(), false);
            assert.equal(err.status.message, 'Missing message timetoken');

            done();
          });
      });

      it('fails if \'actionTimetoken\' is missing', (done) => {
        nock.disableNetConnect();
        const scope = utils
          .createNock()
          .delete(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890/action/12345678901`)
          .reply(200, {});

        pubnub.removeMessageAction({
          channel: 'test-channel',
          messageTimetoken: '1234567890',
        })
          .catch((err) => {
            assert.equal(scope.isDone(), false);
            assert.equal(err.status.message, 'Missing action timetoken');

            done();
          });
      });

      it('fails if \'channel\' is missing', (done) => {
        nock.disableNetConnect();
        const scope = utils
          .createNock()
          .delete(`/v1/message-actions/${subscribeKey}/channel/test-channel/message/1234567890/action/12345678901`)
          .reply(200, {});

        pubnub.removeMessageAction({
          messageTimetoken: '1234567890',
          actionTimetoken: '12345678901',
        })
          .catch((err) => {
            assert.equal(scope.isDone(), false);
            assert.equal(err.status.message, 'Missing message channel');

            done();
          });
      });
    });

    it('remove message action', (done) => {
      const channel = PubNub.generateUUID();

      publishMessages(pubnub, 1, channel, (messageTimetokens) => {
        addActions(pubnub, 1, messageTimetokens, channel, (actionTimetokens) => {
          pubnub.getMessageActions({ channel }, (status, response) => {
            assert.equal(status.error, false);
            assert.equal(response.data.length, actionTimetokens.length);

            pubnub.removeMessageAction(
              { channel, actionTimetoken: actionTimetokens[0], messageTimetoken: messageTimetokens[0] },
              (removeMessageStatus) => {
                assert.equal(removeMessageStatus.error, false);

                setTimeout(() => {
                  pubnub.getMessageActions({ channel }, (getMessagesStatus, getMessagesResponse) => {
                    assert.equal(getMessagesStatus.error, false);
                    assert.equal(getMessagesResponse.data.length, 0);

                    done();
                  });
                }, 2000);
              }
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
            assert.equal(response.data.length, actionTimetokens.length);

            pubnub.removeMessageAction(
              { channel, actionTimetoken: actionTimetokens[0], messageTimetoken: messageTimetokens[0] },
              (removeMessageStatus) => {
                assert.equal(removeMessageStatus.error, false);

                setTimeout(() => {
                  pubnub.getMessageActions({ channel }, (getMessagesStatus, getMessagesResponse) => {
                    assert.equal(getMessagesStatus.error, false);
                    assert.equal(getMessagesResponse.data.length, 0);

                    done();
                  });
                }, 2000);
              }
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
                  }
                );
              }
            },
            messageAction: (messageActionEvent) => {
              assert(messageActionEvent.data);
              assert.equal(messageActionEvent.data.uuid, pubnub.getUUID());
              assert.equal(messageActionEvent.data.messageTimetoken, messageTimetokens[0]);
              assert.equal(messageActionEvent.data.actionTimetoken, actionTimetokens[0]);
              assert.equal(messageActionEvent.event, 'removed');
              pubnub.unsubscribeAll()

              done();
            }
          });

          pubnub.subscribe({ channels: [channel] });
        });
      });
    }).timeout(60000);
  });

  describe('getMessageAction', () => {
    describe('##validation', () => {
      it('fails if \'channel\' is missing', (done) => {
        nock.disableNetConnect();
        const scope = utils
          .createNock()
          .get(`/v1/message-actions/${subscribeKey}/channel/test-channel`)
          .reply(200, {});

        pubnub.getMessageActions({}).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing message channel');

          done();
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
            assert.equal(status.error, false);
            const firstFetchedActionTimetoken = response.data[0].actionTimetoken;
            const lastFetchedActionTimetoken = response.data[response.data.length - 1].actionTimetoken;
            assert.equal(firstFetchedActionTimetoken, firstPublishedActionTimetoken);
            assert.equal(lastFetchedActionTimetoken, lastPublishedActionTimetoken);
            assert.equal(response.data.length, actionTimetokens.length);
            assert.equal(response.start, firstPublishedActionTimetoken);
            assert.equal(response.end, lastPublishedActionTimetoken);

            done();
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
            assert.equal(status.error, false);
            const firstFetchedActionTimetoken = response.data[0].actionTimetoken;
            const lastFetchedActionTimetoken = response.data[response.data.length - 1].actionTimetoken;
            assert.equal(firstFetchedActionTimetoken, firstPublishedActionTimetoken);
            assert.equal(lastFetchedActionTimetoken, lastPublishedActionTimetoken);
            assert.equal(response.data.length, actionTimetokens.length);
            assert.equal(response.start, firstPublishedActionTimetoken);
            assert.equal(response.end, lastPublishedActionTimetoken);

            done();
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
                assert.equal(getMessageActionsStatus.error, false);
                firstFetchedActionTimetoken = getMessageActionsResponse.data[0].actionTimetoken;
                lastFetchedActionTimetoken = getMessageActionsResponse.data[getMessageActionsResponse.data.length - 1].actionTimetoken;
                assert.equal(firstFetchedActionTimetoken, firstPublishedActionTimetoken);
                assert.equal(lastFetchedActionTimetoken, middleMinusOnePublishedActionTimetoken);
                assert.equal(getMessageActionsResponse.data.length, halfSize);
                assert.equal(getMessageActionsResponse.start, firstPublishedActionTimetoken);
                assert.equal(getMessageActionsResponse.end, middleMinusOnePublishedActionTimetoken);

                done();
              }
            );
          });
        });
      });
    }).timeout(60000);
  });
});
