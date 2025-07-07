/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';

import PubNub from '../../../src/node/index';
import utils from '../../utils';

describe('unsubscribe race condition', () => {
  let pubnub: PubNub;

  before(() => {
    nock.disableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey',
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
      enableEventEngine: true,
    });
  });

  afterEach(() => {
    pubnub.destroy(true);
  });

  it('should handle concurrent subscribe/unsubscribe operations correctly', (done) => {
    const channels = {
      main: 'A106134',
      groupA: ['A106134.TA001', 'A106134.TA002', 'A106134.TA003'],
      groupB: ['A106134.TB001', 'A106134.TB002', 'A106134.TB003'],
      groupC: ['A106134.TC001', 'A106134.TC002', 'A106134.TC003'],
    };
    const scope1 = utils
      .createNock()
      .get('/v2/subscribe/mySubKey/A106134,A106134-pnpres/0')
      .query({
        ee: '',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
      })
      .reply(200, '{"t":{"t":"14607577960932487","r":1},"m":[]}', { 'content-type': 'text/javascript' });
    const finalChannels = [channels.main, 'A106134.TB001', 'A106134.TB003', ...channels.groupC].join(',');
    const finalChannelsWithPresence = [
      channels.main,
      'A106134-pnpres',
      'A106134.TB001',
      'A106134.TB001-pnpres',
      'A106134.TB003',
      'A106134.TB003-pnpres',
      ...channels.groupC.map((ch) => [ch, ch + '-pnpres']).flat(),
    ].join(',');

    const scope2 = utils
      .createNock()
      .get(`/v2/subscribe/mySubKey/${finalChannelsWithPresence}/0`)
      .query({
        ee: '',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        tt: '14607577960932487',
        tr: 1,
      })
      .reply(200, '{"t":{"t":"14607577960932488","r":1},"m":[]}', { 'content-type': 'text/javascript' });

    let connectionEstablished = false;
    let operationsComplete = false;

    pubnub.addListener({
      status: (status) => {
        if (status.category === PubNub.CATEGORIES.PNConnectedCategory && !connectionEstablished) {
          connectionEstablished = true;

          // Start concurrent operations immediately
          setTimeout(() => {
            pubnub.subscribe({ channels: channels.groupA, withPresence: true });
          }, 0);

          setTimeout(() => {
            pubnub.unsubscribe({ channels: ['A106134.TA001'] });
            pubnub.subscribe({ channels: channels.groupB, withPresence: true });
          }, 50);

          setTimeout(() => {
            pubnub.unsubscribe({ channels: [channels.main] });
          }, 100);

          setTimeout(() => {
            pubnub.unsubscribe({ channels: ['A106134.TA002', 'A106134.TA003'] });
            pubnub.subscribe({ channels: channels.groupC, withPresence: true });
            pubnub.unsubscribe({ channels: ['A106134.TB002'] });
            pubnub.subscribe({ channels: [channels.main], withPresence: true });
            setTimeout(() => {
              operationsComplete = true;
              checkFinalState();
            }, 200);
          }, 150);
        }
      },
    });

    function checkFinalState() {
      if (!operationsComplete) return;

      const finalSubscriptions = pubnub.getSubscribedChannels();

      const expectedSubscriptions = [
        'A106134',
        'A106134-pnpres',
        'A106134.TB001',
        'A106134.TB001-pnpres',
        'A106134.TB003',
        'A106134.TB003-pnpres',
        'A106134.TC001',
        'A106134.TC001-pnpres',
        'A106134.TC002',
        'A106134.TC002-pnpres',
        'A106134.TC003',
        'A106134.TC003-pnpres',
      ].sort();

      const actualSubscriptions = finalSubscriptions.sort();

      const shouldNotBeSubscribed = [
        'A106134.TA001',
        'A106134.TA002',
        'A106134.TA003',
        'A106134.TB002',
        'A106134.TA001-pnpres',
        'A106134.TA002-pnpres',
        'A106134.TA003-pnpres',
        'A106134.TB002-pnpres',
      ];

      const incorrectlySubscribed = shouldNotBeSubscribed.filter((channel) => actualSubscriptions.includes(channel));

      try {
        if (incorrectlySubscribed.length > 0) {
        }

        // Check that expected channels are subscribed
        const missingSubscriptions = expectedSubscriptions.filter((channel) => !actualSubscriptions.includes(channel));

        if (missingSubscriptions.length > 0) {
          assert.fail(`Missing subscriptions: ${missingSubscriptions.join(', ')}`);
        }

        // Main assertion - this should pass if the race condition is fixed
        assert.deepEqual(
          actualSubscriptions,
          expectedSubscriptions,
          'Final subscription state should match expected state',
        );

        done();
      } catch (error) {
        done(error);
      }
    }

    pubnub.subscribe({ channels: [channels.main], withPresence: true });
  }).timeout(10000);

  it('should handle simple concurrent unsubscribe operations', (done) => {
    // Simpler test case for basic concurrent unsubscribe
    const testChannels = ['ch1', 'ch2', 'ch3', 'ch4'];

    const scope1 = utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1,ch1-pnpres,ch2,ch2-pnpres,ch3,ch3-pnpres,ch4,ch4-pnpres/0')
      .query({
        ee: '',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
      })
      .reply(200, '{"t":{"t":"14607577960932487","r":1},"m":[]}', { 'content-type': 'text/javascript' });

    const scope2 = utils
      .createNock()
      .get('/v2/subscribe/mySubKey/ch1,ch1-pnpres,ch4,ch4-pnpres/0')
      .query({
        ee: '',
        pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
        uuid: 'myUUID',
        tt: '14607577960932487',
        tr: 1,
      })
      .reply(200, '{"t":{"t":"14607577960932488","r":1},"m":[]}', { 'content-type': 'text/javascript' });

    let connectionEstablished = false;

    pubnub.addListener({
      status: (status) => {
        if (status.category === PubNub.CATEGORIES.PNConnectedCategory && !connectionEstablished) {
          connectionEstablished = true;

          // Concurrent unsubscribe operations
          pubnub.unsubscribe({ channels: ['ch2'] });
          pubnub.unsubscribe({ channels: ['ch3'] });

          // Check final state
          setTimeout(() => {
            try {
              const finalSubscriptions = pubnub.getSubscribedChannels();
              const expectedSubscriptions = ['ch1', 'ch1-pnpres', 'ch4', 'ch4-pnpres'].sort();
              assert.deepEqual(
                finalSubscriptions.sort(),
                expectedSubscriptions,
                'Should have correct subscriptions after concurrent unsubscribe',
              );
              done();
            } catch (error) {
              done(error);
            }
          }, 300);
        }
      },
    });

    pubnub.subscribe({ channels: testChannels, withPresence: true });
  }).timeout(5000);
});
