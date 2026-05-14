/* global describe, it */
/* eslint no-console: 0 */

import { expect } from 'chai';
import PubNub from '../../../src/web/index';

describe('PubNub Shared Worker Suspension Tests', () => {
  const subscribeKey = process.env.SUBSCRIBE_KEY ?? 'demo';
  const publishKey = process.env.PUBLISH_KEY ?? 'demo';

  const getWorkerUrl = () => {
    if (typeof window !== 'undefined' && window.location) {
      return '/dist/web/pubnub.worker.js';
    }
    return './dist/web/pubnub.worker.js';
  };

  describe('Presence Timeout with Shared Worker', () => {
    it('should receive timeout presence events when browser tabs are closed', (done) => {
      const testId = `test-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const testChannel = `channel-${testId}`;
      let testCompleted = false;
      let timeoutPresenceReceived = false;

      const tab1 = new PubNub({
        publishKey,
        subscribeKey,
        enableEventEngine: false,
        heartbeatInterval: 1.5,
        presenceTimeout: 5,
        autoNetworkDetection: false,
        userId: `tab1-${Date.now()}`,
        subscriptionWorkerUrl: getWorkerUrl(),
      });

      const tab2 = new PubNub({
        publishKey,
        subscribeKey,
        enableEventEngine: false,
        heartbeatInterval: 1.5,
        presenceTimeout: 5,
        autoNetworkDetection: false,
        userId: `tab2-${Date.now()}`,
        subscriptionWorkerUrl: getWorkerUrl(),
      });

      const tab3 = new PubNub({
        publishKey,
        subscribeKey,
        enableEventEngine: false,
        heartbeatInterval: 1.5,
        presenceTimeout: 5,
        autoNetworkDetection: false,
        userId: `tab3-${Date.now()}`,
        subscriptionWorkerUrl: getWorkerUrl(),
      });

      let joinEventsReceived = 0;
      let leaveEventsReceived = 0;
      let tab2Closed = false;
      const expectedJoinEvents = 3;
      const tab2UserId = tab2.getUserId();
      const receivedPresenceEvents: string[] = [];

      tab1.addListener({
        presence: (presenceEvent) => {
          if (testCompleted) return;

          const eventInfo = `${presenceEvent.action}:${(presenceEvent as any).uuid}:${presenceEvent.channel}`;
          receivedPresenceEvents.push(eventInfo);

          if (presenceEvent.action === 'join' && presenceEvent.channel === testChannel) {
            joinEventsReceived++;

            if (joinEventsReceived >= expectedJoinEvents && !tab2Closed) {
              tab2Closed = true;

              setTimeout(() => {
                if (!testCompleted) {
                  tab2.removeAllListeners();
                  tab2.unsubscribeAll();
                  tab2.destroy(true);
                }
              }, 1500);
            }
          }

          if (presenceEvent.action === 'leave' && presenceEvent.channel === testChannel) {
            leaveEventsReceived++;
            if ((presenceEvent as any).uuid === tab2UserId) {
              timeoutPresenceReceived = true;
              testCompleted = true;

              try {
                expect(presenceEvent.action).to.equal('leave');
                expect(presenceEvent.channel).to.equal(testChannel);
                expect((presenceEvent as any).uuid).to.equal(tab2UserId);

                cleanupTabs();
                done();
              } catch (error) {
                cleanupTabs();
                done(error);
              }
            }
          }

          if (presenceEvent.action === 'timeout' && presenceEvent.channel === testChannel) {
            if ((presenceEvent as any).uuid === tab2UserId) {
              timeoutPresenceReceived = true;
              testCompleted = true;

              try {
                expect(presenceEvent.action).to.equal('timeout');
                expect(presenceEvent.channel).to.equal(testChannel);
                expect((presenceEvent as any).uuid).to.equal(tab2UserId);

                cleanupTabs();
                done();
              } catch (error) {
                cleanupTabs();
                done(error);
              }
            }
          }
        },
      });

      function cleanupTabs() {
        [tab1, tab3].forEach((tab) => {
          if (tab) {
            tab.removeAllListeners();
            tab.unsubscribeAll();
            tab.destroy(true);
          }
        });
      }

      const tab1Subscription = tab1.channel(testChannel).subscription({ receivePresenceEvents: true });
      const tab2Subscription = tab2.channel(testChannel).subscription({ receivePresenceEvents: true });
      const tab3Subscription = tab3.channel(testChannel).subscription({ receivePresenceEvents: true });

      tab1Subscription.subscribe();
      setTimeout(() => tab2Subscription.subscribe(), 200);
      setTimeout(() => tab3Subscription.subscribe(), 400);

      setTimeout(() => {
        if (!testCompleted) {
          testCompleted = true;
          cleanupTabs();

          const debugInfo = {
            joinEventsReceived,
            leaveEventsReceived,
            expectedJoinEvents,
            tab2Closed,
            timeoutPresenceReceived,
            tab2UserId,
            receivedPresenceEvents,
          };

          if (joinEventsReceived < expectedJoinEvents) {
            done(
              new Error(
                `Not all tabs joined. Expected ${expectedJoinEvents}, got ${joinEventsReceived}. Debug: ${JSON.stringify(debugInfo)}`,
              ),
            );
          } else if (!tab2Closed) {
            done(new Error(`Tab2 was not closed as expected. Debug: ${JSON.stringify(debugInfo)}`));
          } else if (!timeoutPresenceReceived) {
            done(
              new Error(
                `Neither timeout nor leave presence event was received for tab2. Debug: ${JSON.stringify(debugInfo)}`,
              ),
            );
          } else {
            done(new Error(`Test completed but outcome unclear. Debug: ${JSON.stringify(debugInfo)}`));
          }
        }
      }, 10000);
    }).timeout(15000);
  });

  describe('Client Suspension and Reactivation', () => {
    it('should recover subscription after client suspension (missed ping-pong)', (done) => {
      const testId = `test-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const channel = `suspension-test-${testId}`;
      const testMessage = { text: `Recovery message ${Date.now()}`, type: 'suspension-test' };

      let subscriptionEstablished = false;
      let suspensionDetected = false;
      let resubscribed = false;
      let testCompleted = false;

      const pubnub = new PubNub({
        publishKey,
        subscribeKey,
        userId: `suspension-user-${testId}`,
        enableEventEngine: true,
        subscriptionWorkerUrl: getWorkerUrl(),
        heartbeatInterval: 10,
        autoNetworkDetection: false,
        subscriptionWorkerOfflineClientsCheckInterval: 2,
        subscriptionWorkerUnsubscribeOfflineClients: false,
        retryConfiguration: PubNub.NoneRetryPolicy(),
      });

      pubnub.addListener({
        status: (statusEvent) => {
          if (testCompleted) return;

          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory && !subscriptionEstablished) {
            subscriptionEstablished = true;

            setTimeout(() => {
              if (testCompleted) return;

              const pubNubMiddleware = (pubnub as any).transport;
              const swMiddleware = pubNubMiddleware.configuration.transport;

              if (swMiddleware.subscriptionWorker) {
                const originalOnMessage = swMiddleware.subscriptionWorker.port.onmessage;
                swMiddleware.subscriptionWorker.port.onmessage = (event: any) => {
                  if (event.data.type === 'shared-worker-ping') {
                    return;
                  }
                  if (originalOnMessage) originalOnMessage.call(swMiddleware.subscriptionWorker.port, event);
                };
              }
            }, 500);
          }

          if (
            (statusEvent.category === PubNub.CATEGORIES.PNTimeoutCategory ||
              statusEvent.category === PubNub.CATEGORIES.PNDisconnectedUnexpectedlyCategory) &&
            !suspensionDetected
          ) {
            suspensionDetected = true;

            const pubNubMiddleware = (pubnub as any).transport;
            const swMiddleware = pubNubMiddleware.configuration.transport;
            if (swMiddleware.subscriptionWorker) {
              swMiddleware.subscriptionWorker.port.onmessage = (event: any) =>
                swMiddleware.handleWorkerEvent(event);
            }

            pubnub.reconnect();
          }

          if (
            suspensionDetected &&
            !resubscribed &&
            (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory ||
              statusEvent.category === PubNub.CATEGORIES.PNReconnectedCategory ||
              statusEvent.category === PubNub.CATEGORIES.PNSubscriptionChangedCategory)
          ) {
            resubscribed = true;

            setTimeout(() => {
              if (testCompleted) return;
              pubnub.publish({ channel, message: testMessage }).catch(() => {
                if (!testCompleted) {
                  testCompleted = true;
                  cleanup();
                  done();
                }
              });
            }, 500);
          }
        },
        message: (messageEvent) => {
          if (testCompleted) return;

          if (messageEvent.channel === channel && resubscribed) {
            testCompleted = true;
            try {
              expect(messageEvent.message).to.deep.equal(testMessage);
              expect(subscriptionEstablished).to.be.true;
              expect(suspensionDetected).to.be.true;
              expect(resubscribed).to.be.true;
              cleanup();
              done();
            } catch (error) {
              cleanup();
              done(error);
            }
          }
        },
      });

      function cleanup() {
        pubnub.removeAllListeners();
        pubnub.unsubscribeAll();
        pubnub.destroy(true);
      }

      const subscription = pubnub.channel(channel).subscription();
      subscription.subscribe();

      setTimeout(() => {
        if (!testCompleted) {
          testCompleted = true;
          cleanup();

          if (!subscriptionEstablished) {
            done(new Error('Subscription was never established'));
          } else if (!suspensionDetected) {
            done(new Error('Suspension was never detected — ping-pong timeout may not have fired'));
          } else if (!resubscribed) {
            done(new Error('Client did not resubscribe after suspension'));
          } else {
            done();
          }
        }
      }, 20000);
    }).timeout(25000);

    it('should not lose subscription for other clients when one client is suspended', (done) => {
      const testId = `test-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const sharedChannel = `shared-suspension-${testId}`;
      const testMessage = { text: `Shared channel message ${Date.now()}`, type: 'shared-suspension' };

      let client1Connected = false;
      let client2Connected = false;
      let client2ReceivedMessage = false;
      let testCompleted = false;

      const client1 = new PubNub({
        publishKey,
        subscribeKey,
        userId: `client1-${testId}`,
        enableEventEngine: true,
        subscriptionWorkerUrl: getWorkerUrl(),
        autoNetworkDetection: false,
        subscriptionWorkerOfflineClientsCheckInterval: 2,
        subscriptionWorkerUnsubscribeOfflineClients: false,
      });

      const client2 = new PubNub({
        publishKey,
        subscribeKey,
        userId: `client2-${testId}`,
        enableEventEngine: true,
        subscriptionWorkerUrl: getWorkerUrl(),
        autoNetworkDetection: false,
        subscriptionWorkerOfflineClientsCheckInterval: 2,
        subscriptionWorkerUnsubscribeOfflineClients: false,
      });

      client1.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory && !client1Connected) {
            client1Connected = true;
            checkBothConnected();
          }
        },
      });

      client2.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory && !client2Connected) {
            client2Connected = true;
            checkBothConnected();
          }
        },
        message: (messageEvent) => {
          if (testCompleted) return;
          if (messageEvent.channel === sharedChannel && !client2ReceivedMessage) {
            client2ReceivedMessage = true;
            testCompleted = true;
            try {
              expect(messageEvent.message).to.deep.equal(testMessage);
              cleanup();
              done();
            } catch (error) {
              cleanup();
              done(error);
            }
          }
        },
      });

      function checkBothConnected() {
        if (!client1Connected || !client2Connected) return;

        const transport1 = (client1 as any).transport;
        const middleware1 = transport1.configuration.transport as any;
        const originalHandler = middleware1.handleWorkerEvent.bind(middleware1);
        middleware1.handleWorkerEvent = function (event: any) {
          if (event.data.type === 'shared-worker-ping') return;
          originalHandler(event);
        };
        if (middleware1.subscriptionWorker) {
          middleware1.subscriptionWorker.port.onmessage = (event: any) => middleware1.handleWorkerEvent(event);
        }

        setTimeout(() => {
          if (testCompleted) return;
          const publisher = new PubNub({
            publishKey,
            subscribeKey,
            userId: `publisher-${testId}`,
          });

          publisher
            .publish({ channel: sharedChannel, message: testMessage })
            .then(() => publisher.destroy(true))
            .catch(() => {
              publisher.destroy(true);
              if (!testCompleted) {
                testCompleted = true;
                cleanup();
                done(new Error('Failed to publish test message'));
              }
            });
        }, 5000);
      }

      function cleanup() {
        client1.removeAllListeners();
        client1.unsubscribeAll();
        client1.destroy(true);

        client2.removeAllListeners();
        client2.unsubscribeAll();
        client2.destroy(true);
      }

      const sub1 = client1.channel(sharedChannel).subscription();
      const sub2 = client2.channel(sharedChannel).subscription();
      sub1.subscribe();
      sub2.subscribe();

      setTimeout(() => {
        if (!testCompleted) {
          testCompleted = true;
          cleanup();
          if (!client1Connected || !client2Connected) {
            done(new Error(`Not all clients connected: client1=${client1Connected}, client2=${client2Connected}`));
          } else if (!client2ReceivedMessage) {
            done(new Error('Client2 did not receive message after client1 suspension'));
          } else {
            done();
          }
        }
      }, 15000);
    }).timeout(20000);
  });
});
