/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import { expect } from 'chai';
import PubNub from '../../../src/web/index';

describe('PubNub Shared Worker Integration Tests', () => {
  let pubnubWithWorker: PubNub;
  let pubnubWithoutWorker: PubNub;
  let testChannels: string[];

  // Determine the correct worker URL based on the environment
  const getWorkerUrl = () => {
    // In Karma environment, files are served from the test server
    if (typeof window !== 'undefined' && window.location) {
      // Use absolute path that matches Karma proxy configuration
      return '/dist/web/pubnub.worker.js';
    }
    // Fallback for other environments
    return './dist/web/pubnub.worker.js';
  };

  beforeEach(() => {
    // Generate unique test identifiers
    const testId = `test-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    testChannels = [`channel-${testId}`, `channel-${testId}-1`, `channel-${testId}-2`];

    // Create PubNub instance with shared worker
    pubnubWithWorker = new PubNub({
      publishKey: 'demo',
      subscribeKey: 'demo',
      userId: `shared-worker-user-${testId}`,
      enableEventEngine: true,
      subscriptionWorkerUrl: getWorkerUrl(),
      heartbeatInterval: 5, // Short interval for testing
      autoNetworkDetection: false,
    });

    // Create PubNub instance without shared worker for comparison
    pubnubWithoutWorker = new PubNub({
      publishKey: 'demo',
      subscribeKey: 'demo',
      userId: `regular-user-${testId}`,
      heartbeatInterval: 5,
      enableEventEngine: true,
      autoNetworkDetection: false,
    });
  });

  afterEach(() => {
    pubnubWithWorker.removeAllListeners();
    pubnubWithWorker.unsubscribeAll();
    pubnubWithWorker.destroy(true);

    pubnubWithoutWorker.removeAllListeners();
    pubnubWithoutWorker.unsubscribeAll();
    pubnubWithoutWorker.destroy(true);
  });

  describe('Subscription Functionality with shared worker', () => {
    it('should successfully subscribe to channels with shared worker', (done) => {
      const channel = testChannels[0];
      let connectionEstablished = false;
      let errorReceived = false;

      pubnubWithWorker.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory && !connectionEstablished) {
            connectionEstablished = true;
            try {
              // Verify successful connection (error can be undefined or false for success)
              expect(statusEvent.error).to.satisfy((error: any) => error === false || error === undefined);
              if (Array.isArray(statusEvent.affectedChannels)) {
                expect(statusEvent.affectedChannels).to.include(channel);
              }
              done();
            } catch (error) {
              done(error);
            }
          } else if (statusEvent.category === PubNub.CATEGORIES.PNNetworkIssuesCategory && !errorReceived) {
            errorReceived = true;
            console.error('Network/Worker Error:', {
              category: statusEvent.category,
              error: statusEvent.error,
              operation: statusEvent.operation,
            });
            done(new Error(`Shared worker failed to initialize: ${statusEvent.error || 'Unknown error'}`));
          } else if (statusEvent.error && !connectionEstablished && !errorReceived) {
            errorReceived = true;
            done(new Error(`Status error: ${statusEvent.error}`));
          }
        },
      });

      const subscription = pubnubWithWorker.channel(channel).subscription();
      subscription.subscribe();
    }).timeout(10000);

    it('should handle subscription changes correctly', (done) => {
      const channel1 = testChannels[0];
      const channel2 = testChannels[1];
      let firstConnected = false;
      let secondConnected = false;

      pubnubWithWorker.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory) {
            // Check if this is the first subscription
            if (
              !firstConnected &&
              Array.isArray(statusEvent.affectedChannels) &&
              statusEvent.affectedChannels.some((ch) => ch === channel1)
            ) {
              firstConnected = true;

              // Subscribe to second channel after a small delay
              setTimeout(() => {
                const subscription2 = pubnubWithWorker.channel(channel2).subscription();
                subscription2.subscribe();
              }, 100);
            }
            // Check if this is the second subscription
            else if (
              firstConnected &&
              !secondConnected &&
              Array.isArray(statusEvent.affectedChannels) &&
              statusEvent.affectedChannels.some((ch) => ch === channel2)
            ) {
              secondConnected = true;
              try {
                // Verify both channels are now subscribed
                expect(firstConnected).to.be.true;
                expect(secondConnected).to.be.true;
                done();
              } catch (error) {
                done(error);
              }
            }
            // Fallback: if we get a connection with both channels, that's also success
            else if (
              !secondConnected &&
              Array.isArray(statusEvent.affectedChannels) &&
              statusEvent.affectedChannels.includes(channel1) &&
              statusEvent.affectedChannels.includes(channel2)
            ) {
              secondConnected = true;
              try {
                expect(statusEvent.affectedChannels).to.include(channel1);
                expect(statusEvent.affectedChannels).to.include(channel2);
                done();
              } catch (error) {
                done(error);
              }
            }
          }
        },
      });

      const subscription1 = pubnubWithWorker.channel(channel1).subscription();
      subscription1.subscribe();
    }).timeout(15000);

    it('rapic subscription changes', (done) => {
      const c1 = `c1-${Date.now()}`;
      const c2 = `c2-${Date.now()}`;
      const c3 = `c3-${Date.now()}`;
      const c4 = `c4-${Date.now()}`;
      const c5 = `c5-${Date.now()}`;

      pubnubWithWorker.subscribe({
        channels: [c1, c2],
        withPresence: true,
      });
      pubnubWithWorker.subscribe({
        channels: [c3, c4],
        withPresence: true,
      });
      pubnubWithWorker.unsubscribe({ channels: [c1, c2] });
      pubnubWithWorker.subscribe({ channels: [c5] });
      pubnubWithWorker.unsubscribe({ channels: [c3] });
      pubnubWithWorker.subscribe({ channels: [c1] });
      const subscribedChannels = pubnubWithWorker.getSubscribedChannels();
      expect(subscribedChannels.length).to.equal(4);
      expect(subscribedChannels, 'subscribe failed for channel c1').to.include(c1);
      expect(subscribedChannels, 'unsubscribe failed for channel c2').to.not.include(c2);
      expect(subscribedChannels, 'unsubscribe failed for channel c3').to.not.include(c3);
      done();
    });

    it('rapic subscription changes with subscriptionSet', (done) => {
      const c1 = `c1-${Date.now()}`;
      const c2 = `c2-${Date.now()}`;
      const c3 = `c3-${Date.now()}`;
      const c4 = `c4-${Date.now()}`;
      const c5 = `c5-${Date.now()}`;

      const subscription1 = pubnubWithWorker.channel(c1).subscription({ receivePresenceEvents: true });
      const subscription2 = pubnubWithWorker.channel(c2).subscription({ receivePresenceEvents: true });
      const subscription3 = pubnubWithWorker.channel(c3).subscription({ receivePresenceEvents: true });

      subscription1.addSubscription(subscription2);
      subscription1.addSubscription(subscription3);
      subscription1.subscribe();

      subscription2.unsubscribe();
      subscription3.unsubscribe();
      const subscribedChannels = pubnubWithWorker.getSubscribedChannels();
      expect(subscribedChannels, 'subscribe failed for channel c1').to.include(c1);
      expect(subscribedChannels, 'unsubscribe failed for channel c2').to.not.include(c2);
      expect(subscribedChannels, 'unsubscribe failed for channel c3').to.not.include(c3);
      done();
    });
  });

  describe('Message Publishing and Receiving', () => {
    it('should publish and receive messages correctly with shared worker', (done) => {
      const channel = testChannels[0];
      const testMessage = {
        text: `Test message ${Date.now()}`,
        sender: 'test-user',
        timestamp: new Date().toISOString(),
      };
      let messageReceived = false;

      pubnubWithWorker.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory && !messageReceived) {
            // Publish message after connection is established
            pubnubWithWorker
              .publish({
                channel,
                message: testMessage,
              })
              .then((publishResult) => {
                expect(publishResult.timetoken).to.exist;
              })
              .catch(done);
          }
        },
        message: (messageEvent) => {
          if (!messageReceived && messageEvent.channel === channel) {
            messageReceived = true;
            try {
              expect(messageEvent.channel).to.equal(channel);
              expect(messageEvent.message).to.deep.equal(testMessage);
              expect(messageEvent.timetoken).to.exist;
              done();
            } catch (error) {
              done(error);
            }
          }
        },
      });

      const subscription = pubnubWithWorker.channel(channel).subscription();
      subscription.subscribe();
    }).timeout(15000);

    it('should handle subscription changes and receive messages on new channels', (done) => {
      const channel1 = testChannels[0];
      const channel2 = testChannels[1];
      const testMessage = {
        text: `Test message for channel 2: ${Date.now()}`,
        sender: 'test-user',
      };
      let firstConnected = false;
      let secondConnected = false;
      let messageReceived = false;
      let messagePublished = false;

      pubnubWithWorker.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory) {
            // First connection established
            if (
              !firstConnected &&
              Array.isArray(statusEvent.affectedChannels) &&
              statusEvent.affectedChannels.some((ch) => ch === channel1)
            ) {
              firstConnected = true;

              // Subscribe to second channel
              setTimeout(() => {
                const subscription2 = pubnubWithWorker.channel(channel2).subscription();
                subscription2.subscribe();
              }, 100);
            }
            // Second connection established or both channels connected
            else if (
              firstConnected &&
              !secondConnected &&
              !messagePublished &&
              Array.isArray(statusEvent.affectedChannels) &&
              (statusEvent.affectedChannels.some((ch) => ch === channel2) ||
                statusEvent.affectedChannels.includes(channel2))
            ) {
              secondConnected = true;
              messagePublished = true;

              // Give a moment for subscription to be fully established, then publish
              setTimeout(() => {
                pubnubWithWorker
                  .publish({
                    channel: channel2,
                    message: testMessage,
                  })
                  .catch(done);
              }, 500);
            }
            // Fallback: if we get both channels in one status event
            else if (
              !messagePublished &&
              Array.isArray(statusEvent.affectedChannels) &&
              statusEvent.affectedChannels.includes(channel1) &&
              statusEvent.affectedChannels.includes(channel2)
            ) {
              firstConnected = true;
              secondConnected = true;
              messagePublished = true;

              setTimeout(() => {
                pubnubWithWorker
                  .publish({
                    channel: channel2,
                    message: testMessage,
                  })
                  .catch(done);
              }, 500);
            }
          }
        },
        message: (messageEvent) => {
          if (!messageReceived && messageEvent.channel === channel2) {
            messageReceived = true;
            try {
              expect(messageEvent.channel).to.equal(channel2);
              expect(messageEvent.message).to.deep.equal(testMessage);
              done();
            } catch (error) {
              done(error);
            }
          }
        },
      });

      const subscription1 = pubnubWithWorker.channel(channel1).subscription();
      subscription1.subscribe();
    }).timeout(25000);
  });

  describe('Presence Events with Shared Worker', () => {
    it('should receive presence events correctly', (done) => {
      const channel = testChannels[0];
      let presenceReceived = false;

      pubnubWithWorker.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory) {
            // Trigger presence by subscribing with another client
            setTimeout(() => {
              const tempClient = new PubNub({
                publishKey: 'demo',
                subscribeKey: 'demo',
                userId: `temp-user-${Date.now()}`,
              });

              const tempSubscription = tempClient.channel(channel).subscription({
                receivePresenceEvents: true,
              });
              tempSubscription.subscribe();

              // Clean up temp client after a delay
              setTimeout(() => {
                tempClient.destroy(true);
              }, 3000);
            }, 1000);
          }
        },
        presence: (presenceEvent) => {
          if (!presenceReceived && presenceEvent.channel === channel) {
            presenceReceived = true;
            try {
              expect(presenceEvent.channel).to.equal(channel);
              expect(presenceEvent.action).to.exist;
              // @ts-expect-error uuid property exists on presence events
              expect(presenceEvent.uuid).to.exist;
              done();
            } catch (error) {
              done(error);
            }
          }
        },
      });

      const subscription = pubnubWithWorker.channel(channel).subscription({
        receivePresenceEvents: true,
      });
      subscription.subscribe();
    }).timeout(15000);
  });

  describe('Shared Worker vs Regular Client Comparison', () => {
    it('should handle concurrent connections efficiently', (done) => {
      const channel = testChannels[0];
      let workerConnected = false;
      let regularConnected = false;

      // Setup listeners
      pubnubWithWorker.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory && !workerConnected) {
            workerConnected = true;
            checkCompletion();
          }
        },
      });

      pubnubWithoutWorker.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory && !regularConnected) {
            regularConnected = true;
            checkCompletion();
          }
        },
      });

      function checkCompletion() {
        if (workerConnected && regularConnected) {
          try {
            // Both connections should work
            expect(workerConnected).to.be.true;
            expect(regularConnected).to.be.true;
            done();
          } catch (error) {
            done(error);
          }
        }
      }

      // Start subscriptions
      const workerSubscription = pubnubWithWorker.channel(channel).subscription();
      const regularSubscription = pubnubWithoutWorker.channel(channel + '-regular').subscription();

      workerSubscription.subscribe();
      regularSubscription.subscribe();
    }).timeout(20000);
  });

  describe('Heartbeat Functionality', () => {
    it('should handle heartbeat requests with shared worker', (done) => {
      const channel = testChannels[0];

      pubnubWithWorker.addListener({
        status: (statusEvent) => {},
        presence: (presenceEvent) => {
          if (presenceEvent.channel === channel) {
            expect(presenceEvent.action).to.exist;
            expect(presenceEvent.action).to.equal('join');
            done();
          }
        },
      });
      const subscription = pubnubWithWorker.channel(channel).subscription({
        receivePresenceEvents: true,
      });
      subscription.subscribe();
    }).timeout(10000);
  });
});
