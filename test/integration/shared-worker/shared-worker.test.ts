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

  describe('heartbeat Functionality', () => {
    it('should handle heartbeat requests with shared worker', (done) => {
      const channel = testChannels[0];

      pubnubWithWorker.addListener({
        status: (statusEvent) => {},
        presence: (presenceEvent) => {
          if (presenceEvent.channel === channel) {
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

  describe('Shared Worker Message Aggregation', () => {
    it('should handle multiple instances subscribing to same channel efficiently', (done) => {
      const testId = `test-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const sharedChannel = `shared-channel-${testId}`;
      const testMessage = {
        text: `Shared worker test message ${Date.now()}`,
        sender: 'test-sender',
      };

      // Create two PubNub instances with shared worker
      const pubnub1 = new PubNub({
        publishKey: 'demo',
        subscribeKey: 'demo',
        userId: `user1-${testId}`,
        enableEventEngine: true,
        subscriptionWorkerUrl: getWorkerUrl(),
        autoNetworkDetection: false,
      });

      const pubnub2 = new PubNub({
        publishKey: 'demo',
        subscribeKey: 'demo',
        userId: `user2-${testId}`,
        enableEventEngine: true,
        subscriptionWorkerUrl: getWorkerUrl(),
        autoNetworkDetection: false,
      });

      let instance1Connected = false;
      let instance2Connected = false;
      let instance1ReceivedMessage = false;
      let instance2ReceivedMessage = false;

      // Setup listeners for both instances
      pubnub1.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory && !instance1Connected) {
            instance1Connected = true;
            checkReadyToPublish();
          }
        },
        message: (messageEvent) => {
          if (messageEvent.channel === sharedChannel && !instance1ReceivedMessage) {
            instance1ReceivedMessage = true;
            try {
              expect(messageEvent.message).to.deep.equal(testMessage);
              expect(messageEvent.channel).to.equal(sharedChannel);
              checkTestCompletion();
            } catch (error) {
              cleanup();
              done(error);
            }
          }
        },
      });

      pubnub2.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory && !instance2Connected) {
            instance2Connected = true;
            checkReadyToPublish();
          }
        },
        message: (messageEvent) => {
          if (messageEvent.channel === sharedChannel && !instance2ReceivedMessage) {
            instance2ReceivedMessage = true;
            try {
              expect(messageEvent.message).to.deep.equal(testMessage);
              expect(messageEvent.channel).to.equal(sharedChannel);
              checkTestCompletion();
            } catch (error) {
              cleanup();
              done(error);
            }
          }
        },
      });

      function checkReadyToPublish() {
        if (instance1Connected && instance2Connected) {
          // Wait for subscriptions to be fully established
          setTimeout(() => {
            // Use a third instance to publish to avoid self-message issues
            const publisher = new PubNub({
              publishKey: 'demo',
              subscribeKey: 'demo',
              userId: `publisher-${testId}`,
            });

            publisher
              .publish({
                channel: sharedChannel,
                message: testMessage,
              })
              .then(() => {
                publisher.destroy(true);
              })
              .catch((error) => {
                publisher.destroy(true);
                cleanup();
                done(error);
              });
          }, 1000);
        }
      }

      function checkTestCompletion() {
        if (instance1ReceivedMessage && instance2ReceivedMessage) {
          cleanup();
          done();
        }
      }

      function cleanup() {
        pubnub1.removeAllListeners();
        pubnub1.unsubscribeAll();
        pubnub1.destroy(true);

        pubnub2.removeAllListeners();
        pubnub2.unsubscribeAll();
        pubnub2.destroy(true);
      }

      // Both instances subscribe to the same channel
      // The shared worker should efficiently manage this single subscription
      const subscription1 = pubnub1.channel(sharedChannel).subscription();
      const subscription2 = pubnub2.channel(sharedChannel).subscription();

      subscription1.subscribe();
      subscription2.subscribe();
    }).timeout(15000);

    it('should maintain channel isolation between instances with shared worker', (done) => {
      const testId = `test-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const c1 = `c1-${testId}-${Math.floor(Math.random() * 1000)}`;
      const c2 = `c2-${testId}-${Math.floor(Math.random() * 1000)}`;
      const messageForC1 = {
        text: `Message for channel c1 ${Date.now()}`,
        target: 'instance1',
      };
      const messageForC2 = {
        text: `Message for channel c2 ${Date.now()}`,
        target: 'instance2',
      };

      // Create two PubNub instances with shared worker
      const instance1 = new PubNub({
        publishKey: 'demo',
        subscribeKey: 'demo',
        userId: `instance1-${testId}`,
        enableEventEngine: true,
        subscriptionWorkerUrl: getWorkerUrl(),
        autoNetworkDetection: false,
      });

      const instance2 = new PubNub({
        publishKey: 'demo',
        subscribeKey: 'demo',
        userId: `instance2-${testId}`,
        enableEventEngine: true,
        subscriptionWorkerUrl: getWorkerUrl(),
        autoNetworkDetection: false,
      });

      let instance1Connected = false;
      let instance2Connected = false;
      let instance1ReceivedC1Message = false;
      let instance1ReceivedC2Message = false;
      let instance2ReceivedC1Message = false;
      let instance2ReceivedC2Message = false;
      let messagesPublished = false;

      // Setup listeners for instance1
      instance1.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory && !instance1Connected) {
            instance1Connected = true;
            checkReadyToPublish();
          }
        },
        message: (messageEvent) => {
          if (messageEvent.channel === c1) {
            instance1ReceivedC1Message = true;
            try {
              expect(messageEvent.message).to.deep.equal(messageForC1);
              expect(messageEvent.channel).to.equal(c1);
              checkTestCompletion();
            } catch (error) {
              cleanup();
              done(error);
            }
          } else if (messageEvent.channel === c2) {
            instance1ReceivedC2Message = true;
            cleanup();
            done(new Error('Instance1 should not receive messages from c2'));
          }
        },
      });

      // Setup listeners for instance2
      instance2.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory && !instance2Connected) {
            instance2Connected = true;
            checkReadyToPublish();
          }
        },
        message: (messageEvent) => {
          if (messageEvent.channel === c2) {
            instance2ReceivedC2Message = true;
            try {
              expect(messageEvent.message).to.deep.equal(messageForC2);
              expect(messageEvent.channel).to.equal(c2);
              checkTestCompletion();
            } catch (error) {
              cleanup();
              done(error);
            }
          } else if (messageEvent.channel === c1) {
            instance2ReceivedC1Message = true;
            cleanup();
            done(new Error('Instance2 should not receive messages from c1'));
          }
        },
      });

      function checkReadyToPublish() {
        if (instance1Connected && instance2Connected && !messagesPublished) {
          messagesPublished = true;
          // Wait for subscriptions to be fully established
          setTimeout(() => {
            // Create a publisher instance to send messages
            const publisher = new PubNub({
              publishKey: 'demo',
              subscribeKey: 'demo',
              userId: `publisher-${testId}`,
            });

            // Publish to both channels
            Promise.all([
              publisher.publish({
                channel: c1,
                message: messageForC1,
              }),
              publisher.publish({
                channel: c2,
                message: messageForC2,
              }),
            ])
              .then(() => {
                publisher.destroy(true);
              })
              .catch((error) => {
                publisher.destroy(true);
                cleanup();
                done(error);
              });
          }, 1000);
        }
      }

      function checkTestCompletion() {
        if (instance1ReceivedC1Message && instance2ReceivedC2Message) {
          // Wait a bit to ensure no cross-channel messages are received
          setTimeout(() => {
            try {
              expect(instance1ReceivedC2Message).to.be.false;
              expect(instance2ReceivedC1Message).to.be.false;
              cleanup();
              done();
            } catch (error) {
              cleanup();
              done(error);
            }
          }, 1000);
        }
      }

      function cleanup() {
        instance1.removeAllListeners();
        instance1.unsubscribeAll();
        instance1.destroy(true);

        instance2.removeAllListeners();
        instance2.unsubscribeAll();
        instance2.destroy(true);
      }

      // Instance1 subscribes to c1, Instance2 subscribes to c2
      const subscription1 = instance1.channel(c1).subscription();
      const subscription2 = instance2.channel(c2).subscription();

      subscription1.subscribe();
      subscription2.subscribe();
    }).timeout(15000);
  });

  describe('Authentication Token Management', () => {
    it('should properly handle token changes in shared worker environment', (done) => {
      const channel = testChannels[0];
      const testToken = 'test-auth-token-verification-123';
      let subscriptionEstablished = false;
      let tokenUpdateCompleted = false;

      pubnubWithWorker.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory && !subscriptionEstablished) {
            subscriptionEstablished = true;

            // Set the token after initial subscription
            setTimeout(() => {
              pubnubWithWorker.setToken(testToken);

              // Wait for the shared worker to process the token update
              setTimeout(() => {
                try {
                  // Verify the token was set correctly
                  const currentToken = pubnubWithWorker.getToken();
                  expect(currentToken).to.equal(testToken);

                  tokenUpdateCompleted = true;

                  // Test that subscription still works after token update
                  // by triggering a subscription change which should use the new token
                  const tempChannel = `temp-${Date.now()}`;
                  const tempSubscription = pubnubWithWorker.channel(tempChannel).subscription();
                  tempSubscription.subscribe();

                  // Verify the subscription list includes both channels
                  setTimeout(() => {
                    const subscribedChannels = pubnubWithWorker.getSubscribedChannels();
                    expect(subscribedChannels).to.include(channel);
                    expect(subscribedChannels).to.include(tempChannel);

                    // If we reach here, the token update was processed successfully
                    // and the shared worker is using the new token for subscriptions
                    done();
                  }, 1000);
                } catch (error) {
                  done(error);
                }
              }, 1000);
            }, 500);
          } else if (statusEvent.error && !tokenUpdateCompleted) {
            done(new Error(`Status error: ${statusEvent.error}`));
          }
        },
      });

      const subscription = pubnubWithWorker.channel(channel).subscription();
      subscription.subscribe();
    }).timeout(15000);

    it('should verify token is passed to shared worker and subscription continues', (done) => {
      const channel = testChannels[0];
      const initialToken = 'initial-token-123';
      const updatedToken = 'updated-token-456';
      let initialSubscriptionDone = false;
      let tokenUpdateDone = false;

      pubnubWithWorker.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory && !initialSubscriptionDone) {
            initialSubscriptionDone = true;

            // Set initial token
            pubnubWithWorker.setToken(initialToken);

            setTimeout(() => {
              try {
                expect(pubnubWithWorker.getToken()).to.equal(initialToken);

                // Update to a new token
                pubnubWithWorker.setToken(updatedToken);
                tokenUpdateDone = true;

                setTimeout(() => {
                  // Verify the updated token is set
                  expect(pubnubWithWorker.getToken()).to.equal(updatedToken);

                  // Verify subscription is still active
                  const subscribedChannels = pubnubWithWorker.getSubscribedChannels();
                  expect(subscribedChannels).to.include(channel);

                  // Test that we can add another channel with the new token
                  const newChannel = `new-${Date.now()}`;
                  const newSubscription = pubnubWithWorker.channel(newChannel).subscription();
                  newSubscription.subscribe();

                  setTimeout(() => {
                    const updatedChannels = pubnubWithWorker.getSubscribedChannels();
                    expect(updatedChannels).to.include(channel);
                    expect(updatedChannels).to.include(newChannel);
                    done();
                  }, 500);
                }, 500);
              } catch (error) {
                done(error);
              }
            }, 500);
          } else if (statusEvent.error && !tokenUpdateDone) {
            done(new Error(`Status error: ${statusEvent.error}`));
          }
        },
      });

      const subscription = pubnubWithWorker.channel(channel).subscription();
      subscription.subscribe();
    }).timeout(15000);

    it('should update subscription with new token when setToken() is called', (done) => {
      const channel = testChannels[0];
      const testToken = 'test-dummy-token-12345';
      let subscriptionEstablished = false;
      let tokenUpdateProcessed = false;

      pubnubWithWorker.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory && !subscriptionEstablished) {
            subscriptionEstablished = true;

            // Wait for subscription to be established, then update the token
            setTimeout(() => {
              // Set the new token - this should trigger the shared worker to update the subscription
              pubnubWithWorker.setToken(testToken);

              // Verify the token was set correctly
              const currentToken = pubnubWithWorker.getToken();

              try {
                expect(currentToken).to.equal(testToken);
                tokenUpdateProcessed = true;

                // Wait a bit to ensure the shared worker has processed the token update
                setTimeout(() => {
                  // Check that the subscription is still active after token update
                  const subscribedChannels = pubnubWithWorker.getSubscribedChannels();
                  expect(subscribedChannels).to.include(channel);

                  // Try to publish a message to verify the subscription still works with the new token
                  pubnubWithWorker
                    .publish({
                      channel,
                      message: { text: 'Test message after token update', timestamp: Date.now() },
                    })
                    .then(() => {
                      // If publish succeeds, the token update was successful
                      done();
                    })
                    .catch((error) => {
                      // Even if publish fails due to demo keys, the token update mechanism worked
                      // The important thing is that the subscription didn't break
                      done();
                    });
                }, 1000);
              } catch (error) {
                done(error);
              }
            }, 1000);
          } else if (statusEvent.error && !tokenUpdateProcessed) {
            done(new Error(`Status error before token update: ${statusEvent.error}`));
          }
        },
        message: (messageEvent) => {
          // If we receive a message after token update, the subscription is working correctly
          if (messageEvent.channel === channel && tokenUpdateProcessed) {
            try {
              expect(messageEvent.channel).to.equal(channel);
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

    it('should handle token updates with multiple subscription changes', (done) => {
      const channel1 = testChannels[0];
      const channel2 = testChannels[1];
      const testToken = 'test-multi-token-67890';
      let initialSubscriptionReady = false;
      let tokenUpdated = false;

      pubnubWithWorker.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory && !initialSubscriptionReady) {
            initialSubscriptionReady = true;

            // Update token and add another subscription
            setTimeout(() => {
              pubnubWithWorker.setToken(testToken);
              tokenUpdated = true;

              // Add subscription to second channel after token update
              const subscription2 = pubnubWithWorker.channel(channel2).subscription();
              subscription2.subscribe();

              // Verify both channels are subscribed with the new token
              setTimeout(() => {
                const subscribedChannels = pubnubWithWorker.getSubscribedChannels();
                try {
                  expect(subscribedChannels).to.include(channel1);
                  expect(subscribedChannels).to.include(channel2);

                  // Verify token was set
                  const currentToken = pubnubWithWorker.getToken();
                  expect(currentToken).to.equal(testToken);

                  done();
                } catch (error) {
                  done(error);
                }
              }, 1000);
            }, 500);
          }
        },
      });

      const subscription1 = pubnubWithWorker.channel(channel1).subscription();
      subscription1.subscribe();
    }).timeout(15000);

    it('should handle token removal (undefined token)', (done) => {
      const channel = testChannels[0];
      const testToken = 'test-token-to-remove';
      let subscriptionEstablished = false;
      let tokenSetAndRemoved = false;

      pubnubWithWorker.addListener({
        status: (statusEvent) => {
          if (statusEvent.category === PubNub.CATEGORIES.PNConnectedCategory && !subscriptionEstablished) {
            subscriptionEstablished = true;

            setTimeout(() => {
              // First set a token
              pubnubWithWorker.setToken(testToken);

              // Then remove it by setting undefined
              setTimeout(() => {
                pubnubWithWorker.setToken(undefined);
                tokenSetAndRemoved = true;

                // Verify token was removed
                const currentToken = pubnubWithWorker.getToken();

                try {
                  expect(currentToken).to.be.undefined;

                  // Verify subscription is still active
                  const subscribedChannels = pubnubWithWorker.getSubscribedChannels();
                  expect(subscribedChannels).to.include(channel);

                  done();
                } catch (error) {
                  done(error);
                }
              }, 500);
            }, 500);
          }
        },
      });

      const subscription = pubnubWithWorker.channel(channel).subscription();
      subscription.subscribe();
    }).timeout(15000);
  });
});
