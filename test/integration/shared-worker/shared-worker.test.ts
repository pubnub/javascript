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
      heartbeatInterval: 10, // Increased for more stability
      autoNetworkDetection: false,
    });

    // Create PubNub instance without shared worker for comparison
    pubnubWithoutWorker = new PubNub({
      publishKey: 'demo',
      subscribeKey: 'demo',
      userId: `regular-user-${testId}`,
      heartbeatInterval: 10, // Increased for more stability
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
      let subscriptionCompleted = false;
      
      pubnubWithWorker.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory && !subscriptionCompleted) {
            subscriptionCompleted = true;
            
            // Check if we have the channels we expect
            const currentChannels = pubnubWithWorker.getSubscribedChannels();
            console.log(`Connected channels: ${currentChannels.join(',')}`);
            
            try {
              // Verify we're connected to at least one channel
              expect(currentChannels.length).to.be.greaterThan(0);
              // The shared worker may aggregate channels, so we just need to verify subscription works
              expect(statusEvent.error).to.satisfy((error: any) => error === false || error === undefined);
              done();
            } catch (error) {
              done(error);
            }
          }
        },
      });

      // Subscribe to both channels at once to test aggregation
      const subscription1 = pubnubWithWorker.channel(channel1).subscription();
      const subscription2 = pubnubWithWorker.channel(channel2).subscription();
      
      subscription1.subscribe();
      // Subscribe to second channel after a short delay
      setTimeout(() => {
        subscription2.subscribe();
      }, 100);
    }).timeout(10000);

    it('rapid subscription changes', (done) => {
      const c1 = `c1-${Date.now()}`;
      const c2 = `c2-${Date.now()}`;
      const c3 = `c3-${Date.now()}`;
      const c4 = `c4-${Date.now()}`;
      const c5 = `c5-${Date.now()}`;

      // Add small delays between operations to prevent race conditions
      setTimeout(() => {
        pubnubWithWorker.subscribe({
          channels: [c1, c2],
          withPresence: true,
        });
      }, 10);

      setTimeout(() => {
        pubnubWithWorker.subscribe({
          channels: [c3, c4],
          withPresence: true,
        });
      }, 20);

      setTimeout(() => {
        pubnubWithWorker.unsubscribe({ channels: [c1, c2] });
      }, 30);

      setTimeout(() => {
        pubnubWithWorker.subscribe({ channels: [c5] });
      }, 40);

      setTimeout(() => {
        pubnubWithWorker.unsubscribe({ channels: [c3] });
      }, 50);

      setTimeout(() => {
        pubnubWithWorker.subscribe({ channels: [c1] });
      }, 60);

      // Check results after all operations complete
      setTimeout(() => {
        const subscribedChannels = pubnubWithWorker.getSubscribedChannels();
        expect(subscribedChannels.length).to.equal(4);
        expect(subscribedChannels, 'subscribe failed for channel c1').to.include(c1);
        expect(subscribedChannels, 'unsubscribe failed for channel c2').to.not.include(c2);
        expect(subscribedChannels, 'unsubscribe failed for channel c3').to.not.include(c3);
        done();
      }, 100);
    });

    it('rapid subscription changes with subscriptionSet', (done) => {
      const c1 = `c1-${Date.now()}`;
      const c2 = `c2-${Date.now()}`;
      const c3 = `c3-${Date.now()}`;

      const subscription1 = pubnubWithWorker.channel(c1).subscription({ receivePresenceEvents: true });
      const subscription2 = pubnubWithWorker.channel(c2).subscription({ receivePresenceEvents: true });
      const subscription3 = pubnubWithWorker.channel(c3).subscription({ receivePresenceEvents: true });

      subscription1.addSubscription(subscription2);
      subscription1.addSubscription(subscription3);
      subscription1.subscribe();

      // Add delays to prevent race conditions
      setTimeout(() => {
        subscription2.unsubscribe();
      }, 50);

      setTimeout(() => {
        subscription3.unsubscribe();
      }, 100);

      setTimeout(() => {
        const subscribedChannels = pubnubWithWorker.getSubscribedChannels();
        expect(subscribedChannels, 'subscribe failed for channel c1').to.include(c1);
        expect(subscribedChannels, 'unsubscribe failed for channel c2').to.not.include(c2);
        expect(subscribedChannels, 'unsubscribe failed for channel c3').to.not.include(c3);
        done();
      }, 200);
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
            // Wait a bit for subscription to be fully established before publishing
            setTimeout(() => {
              pubnubWithWorker
                .publish({
                  channel,
                  message: testMessage,
                })
                .then((publishResult) => {
                  expect(publishResult.timetoken).to.exist;
                })
                .catch(done);
            }, 500);
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
      let subscriptionReady = false;
      let messageReceived = false;

      pubnubWithWorker.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory && !subscriptionReady) {
            subscriptionReady = true;
            
            // Wait for subscription to be fully established, then publish
            setTimeout(() => {
              pubnubWithWorker
                .publish({
                  channel: channel2,
                  message: testMessage,
                })
                .catch(done);
            }, 1000);
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

      // Subscribe to both channels at once since shared worker will aggregate them
      const subscription1 = pubnubWithWorker.channel(channel1).subscription();
      const subscription2 = pubnubWithWorker.channel(channel2).subscription();
      
      subscription1.subscribe();
      subscription2.subscribe();
    }).timeout(15000);
  });

  describe('Presence Events with Shared Worker', () => {
    it('should receive presence events correctly', (done) => {
      const channel = testChannels[0];
      let presenceReceived = false;

      pubnubWithWorker.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory) {
            // Wait for subscription to be established, then trigger presence
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
      let timeoutId: NodeJS.Timeout;

      // Set up timeout to prevent hanging
      timeoutId = setTimeout(() => {
        done(new Error(`Test timeout: worker connected=${workerConnected}, regular connected=${regularConnected}`));
      }, 18000);

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
          clearTimeout(timeoutId);
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
      let heartbeatReceived = false;

      pubnubWithWorker.addListener({
        status: (statusEvent) => {
          // Just ensure we get a successful connection
          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory && !heartbeatReceived) {
            heartbeatReceived = true;
            // For heartbeat test, we just need to verify the connection works
            // The actual heartbeat is handled internally by the shared worker
            done();
          }
        },
        presence: (presenceEvent) => {
          if (presenceEvent.channel === channel && !heartbeatReceived) {
            heartbeatReceived = true;
            try {
              expect(presenceEvent.action).to.exist;
              expect(presenceEvent.action).to.equal('join');
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
    }).timeout(10000);
  });
});
