/* global describe, it */

import assert from 'assert';

import { RetryPolicy } from '../../src/core/components/retry-policy';
import PubNub from '../../src/node/index';

describe('retry configuration', () => {
  const basePubNubConfig = {
    subscribeKey: 'demo',
    publishKey: 'demo',
    uuid: 'retry-configuration-test-uuid',
  };

  it('accepts LinearRetryPolicy with maximumRetry = 1300 (validate + PubNub init)', () => {
    const policy = RetryPolicy.LinearRetryPolicy({ delay: 2, maximumRetry: 1300 });

    assert.doesNotThrow(() => policy.validate());
    assert.strictEqual(policy.maximumRetry, 1300);
    assert.strictEqual(policy.delay, 2);

    assert.doesNotThrow(() => {
      const pubnub = new PubNub({
        ...basePubNubConfig,
        retryConfiguration: policy,
      });
      pubnub.destroy(true);
    });
  });

  it('accepts ExponentialRetryPolicy with maximumRetry = 1300 (validate + PubNub init)', () => {
    const policy = RetryPolicy.ExponentialRetryPolicy({
      minimumDelay: 2,
      maximumDelay: 150,
      maximumRetry: 1300,
    });

    assert.doesNotThrow(() => policy.validate());
    assert.strictEqual(policy.maximumRetry, 1300);
    assert.strictEqual(policy.minimumDelay, 2);
    assert.strictEqual(policy.maximumDelay, 150);

    assert.doesNotThrow(() => {
      const pubnub = new PubNub({
        ...basePubNubConfig,
        retryConfiguration: policy,
      });
      pubnub.destroy(true);
    });
  });

  it('accepts None retry policy from RetryPolicy.None and PubNub.NoneRetryPolicy', () => {
    const fromRetryPolicy = RetryPolicy.None();
    assert.doesNotThrow(() => fromRetryPolicy.validate());
    // @ts-expect-error Intentional access for assertion.
    assert.strictEqual(fromRetryPolicy.shouldRetry(), false);
    // @ts-expect-error Intentional access for assertion.
    assert.strictEqual(fromRetryPolicy.getDelay(), -1);

    const fromPubNub = PubNub.NoneRetryPolicy();
    assert.doesNotThrow(() => fromPubNub.validate());
    // @ts-expect-error Intentional access for assertion.
    assert.strictEqual(fromPubNub.shouldRetry(), false);

    assert.doesNotThrow(() => {
      const pubnub = new PubNub({
        ...basePubNubConfig,
        retryConfiguration: PubNub.NoneRetryPolicy(),
      });
      pubnub.destroy(true);
    });
  });
});
