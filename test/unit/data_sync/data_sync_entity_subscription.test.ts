/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'assert';

import { DataSyncUser } from '../../../src/entities/data-sync-user';
import PubNub from '../../../src/node/index';

/**
 * Subscription ref-counting for DataSync entities.
 *
 * These tests pin down *why* `DataSyncSubscribable` memoizes one entity instance per
 * (object, projection) pair in a registry shared by all siblings of the same object, instead of
 * relying only on the `PubNubCore#entities` cache (which is keyed by id + type and has no notion of
 * a projection).
 *
 * Two independent guards decide whether a channel may leave the subscribe loop:
 *
 *  1. per-entity: `Subscription#subscriptionInput(true)` returns an empty input when
 *     `Entity#subscriptionsCount > 0`, i.e. when another subscription state still uses that entity;
 *  2. per-channel: `PubNubCore#unregisterEventHandleCapable` subtracts every channel which is still
 *     present in any other registered `eventHandleCapable` from the leave set.
 *
 * Guard 2 is what makes premature unsubscription impossible; guard 1 is a fast path which *also*
 * requires one-entity-per-channel, otherwise it over-retains (see the `H.` counterfactual).
 *
 * The tests spy on the subscription loop boundary (`subscriptionManager` / `eventEngine`) to observe
 * the channels which actually join and leave the loop.
 */
type Trace = { op: 'subscribe' | 'unsubscribe'; channels: string[] };

/**
 * Active clients which have to be torn down after a test.
 */
const clients: PubNub[] = [];

/**
 * Create a PubNub client with a stubbed subscription loop.
 *
 * @returns Client and the trace of the channels which joined / left the subscription loop.
 */
const makeClient = () => {
  const pubnub = new PubNub({
    subscribeKey: 'demo',
    publishKey: 'demo',
    userId: 'ds-refcount-verifier',
    autoNetworkDetection: false,
  });
  clients.push(pubnub);

  const trace: Trace[] = [];
  const target = (pubnub as any).subscriptionManager ?? (pubnub as any).eventEngine;
  assert.ok(target, 'neither subscriptionManager nor eventEngine is present');

  // Replace the loop with a recorder, so that no request is ever made.
  target.subscribe = (parameters: any) => trace.push({ op: 'subscribe', channels: [...(parameters.channels ?? [])] });
  target.unsubscribe = (parameters: any) =>
    trace.push({ op: 'unsubscribe', channels: [...(parameters.channels ?? [])] });
  target.unsubscribeAll = () => trace.push({ op: 'unsubscribe', channels: [] });
  target.disconnect = () => {};

  return { pubnub, trace };
};

/**
 * Channels which have been asked to leave the subscription loop.
 */
const leaves = (trace: Trace[]) =>
  trace
    .filter((t) => t.op === 'unsubscribe')
    .flatMap((t) => t.channels)
    .sort();

/**
 * Channels which have been added to the subscription loop.
 */
const joins = (trace: Trace[]) =>
  trace
    .filter((t) => t.op === 'subscribe')
    .flatMap((t) => t.channels)
    .sort();

/**
 * Entity which backs a subscription object.
 */
const entityOf = (subscription: unknown) => (subscription as any).state.entity;

describe('DataSync entities subscription ref-counting', () => {
  afterEach(() => {
    clients.splice(0, clients.length).forEach((pubnub) => pubnub.destroy());
  });

  describe('entity identity', () => {
    it('resolves the same (object, projection) pair to a single entity instance', () => {
      const { pubnub } = makeClient();
      const user = pubnub.dataSyncUser('u1');

      const first = entityOf(user.subscription({ projection: 'admin' }));
      const second = entityOf(user.subscription({ projection: 'admin' }));

      assert.strictEqual(first, second, 'a projection must be represented by one entity instance');
      assert.notStrictEqual(first, user, 'a projection entity is not the base entity');
      assert.deepStrictEqual(first.subscriptionNames(), ['__admin__u1']);
    });

    it('memoizes the projection entity across separate client factory calls', () => {
      const { pubnub } = makeClient();

      const first = entityOf(pubnub.dataSyncUser('u1').subscription({ projection: 'admin' }));
      const second = entityOf(pubnub.dataSyncUser('u1').subscription({ projection: 'admin' }));

      assert.strictEqual(first, second, 'the client entities cache and the variants registry must agree');
    });

    it('uses the client-cached entity for the base projection', () => {
      const { pubnub } = makeClient();
      const user = pubnub.dataSyncUser('u1');

      assert.strictEqual(entityOf(user.subscription()), user);
      assert.deepStrictEqual(user.subscriptionNames(), ['u1']);
    });

    it('collapses base projection aliases onto the base entity', () => {
      const { pubnub } = makeClient();
      const user = pubnub.dataSyncUser('u1');

      for (const projection of [undefined, '', '   ', 'default', 'DEFAULT', '__default__'])
        assert.strictEqual(
          entityOf(user.subscription({ projection })),
          user,
          `projection ${JSON.stringify(projection)} must resolve to the base entity`,
        );

      assert.strictEqual(
        entityOf(user.subscription({ projection: '  admin ' })),
        entityOf(user.subscription({ projection: 'admin' })),
        'a projection name is trimmed before it is used as a registry key',
      );
    });

    it('gives each projection of an object its own entity and data channel', () => {
      const { pubnub } = makeClient();
      const user = pubnub.dataSyncUser('u1');

      const base = entityOf(user.subscription());
      const admin = entityOf(user.subscription({ projection: 'admin' }));

      assert.notStrictEqual(base, admin, 'different projections must not share an entity instance');
      assert.deepStrictEqual(base.subscriptionNames(), ['u1']);
      assert.deepStrictEqual(admin.subscriptionNames(), ['__admin__u1']);
    });
  });

  describe('unsubscription', () => {
    it("doesn't leave a channel while another subscription object uses the entity", () => {
      const { pubnub, trace } = makeClient();
      const user = pubnub.dataSyncUser('u1');

      const first = user.subscription({ projection: 'admin' });
      const second = user.subscription({ projection: 'admin' });
      const entity = entityOf(first);

      first.subscribe();
      second.subscribe();
      assert.strictEqual(entity.subscriptionsCount, 2, 'both subscription states must be counted');
      assert.deepStrictEqual(joins(trace), ['__admin__u1', '__admin__u1']);

      first.unsubscribe();
      assert.strictEqual(entity.subscriptionsCount, 1, 'one subscription state still uses the entity');
      assert.deepStrictEqual(leaves(trace), [], 'the channel must stay in the subscription loop');

      second.unsubscribe();
      assert.strictEqual(entity.subscriptionsCount, 0);
      assert.deepStrictEqual(leaves(trace), ['__admin__u1'], 'the last subscription object frees the channel');
    });

    it('leaves the projections of one object independently', () => {
      const { pubnub, trace } = makeClient();
      const user = pubnub.dataSyncUser('u1');

      const base = user.subscription();
      const admin = user.subscription({ projection: 'admin' });

      base.subscribe();
      admin.subscribe();
      assert.deepStrictEqual(joins(trace), ['__admin__u1', 'u1']);

      base.unsubscribe();
      assert.deepStrictEqual(leaves(trace), ['u1'], 'only the base data channel leaves');

      admin.unsubscribe();
      assert.deepStrictEqual(leaves(trace), ['__admin__u1', 'u1']);
    });

    it("doesn't leave a channel which is shared by two DataSync object types", () => {
      // Different DataSync types are cached under different keys, so the per-entity guard can't
      // help here: the per-channel check in `unregisterEventHandleCapable` is what protects.
      const { pubnub, trace } = makeClient();
      const asUser = pubnub.dataSyncUser('shared-id');
      const asChannel = pubnub.dataSyncChannel('shared-id');

      assert.notStrictEqual(asUser, asChannel, 'different DataSync types are different entity instances');
      assert.deepStrictEqual(asUser.subscriptionNames(), asChannel.subscriptionNames(), 'same data channel though');

      const userSubscription = asUser.subscription();
      const channelSubscription = asChannel.subscription();
      userSubscription.subscribe();
      channelSubscription.subscribe();

      userSubscription.unsubscribe();
      assert.strictEqual(entityOf(asUser.subscription()).subscriptionsCount, 0, 'the user entity looks free...');
      assert.deepStrictEqual(leaves(trace), [], '...but the channel is still needed by the channel subscription');

      channelSubscription.unsubscribe();
      assert.deepStrictEqual(leaves(trace), ['shared-id']);
    });

    it("doesn't leave a channel which a subscription object outside of the set still uses", () => {
      const { pubnub, trace } = makeClient();
      const user = pubnub.dataSyncUser('u1');

      const inSet = user.subscription({ projection: 'admin' });
      const standalone = user.subscription({ projection: 'admin' });

      const set = pubnub.subscriptionSet({ channels: [] });
      set.addSubscription(inSet);
      set.subscribe();
      standalone.subscribe();

      set.removeSubscription(inSet);
      assert.deepStrictEqual(leaves(trace), [], 'the standalone subscription object still needs the channel');

      standalone.unsubscribe();
      assert.deepStrictEqual(leaves(trace), ['__admin__u1']);
    });

    it('counts subscription object clones once and ignores a clone dispose', () => {
      const { pubnub, trace } = makeClient();
      const user = pubnub.dataSyncUser('u1');

      const subscription = user.subscription({ projection: 'admin' });
      const clone = subscription.cloneEmpty();
      const entity = entityOf(subscription);

      subscription.subscribe();
      assert.strictEqual(entity.subscriptionsCount, 1, 'clones share one subscription state identifier');
      assert.strictEqual((clone as any).state, (subscription as any).state);

      clone.dispose();
      assert.deepStrictEqual(leaves(trace), [], 'disposing a clone must not tear the subscription down');

      subscription.unsubscribe();
      assert.deepStrictEqual(leaves(trace), ['__admin__u1']);
    });
  });

  describe('design rationale', () => {
    it('over-retains a channel when one entity instance backs several data channels', () => {
      // Counterfactual for the rejected design in which `projection` is threaded through
      // `subscriptionNames()` and a single entity instance backs every projection of the object.
      const { pubnub, trace } = makeClient();
      const user: any = pubnub.dataSyncUser('u1');

      const base = user.subscription();

      // Build a second subscription object on the *same* entity but with a different channel.
      const subscriptionNames = user.subscriptionNames.bind(user);
      user.subscriptionNames = () => ['__admin__u1'];
      const admin = user.subscription();
      user.subscriptionNames = subscriptionNames;

      assert.strictEqual(entityOf(base), entityOf(admin), 'one entity backs both data channels');
      assert.deepStrictEqual((admin as any).state.subscriptionInput.channels, ['__admin__u1']);

      base.subscribe();
      admin.subscribe();
      assert.strictEqual(user.subscriptionsCount, 2);

      base.unsubscribe();
      // Nothing needs `u1` anymore, but the shared entity still reports usage, so
      // `Subscription#subscriptionInput(true)` returns an empty input and no leave is issued.
      assert.deepStrictEqual(leaves(trace), [], '`u1` is leaked: it can never leave the subscription loop');
    });

    it('never leaves a channel prematurely even without the shared variants registry', () => {
      // Counterfactual for the world without `variants`, where every `subscription({ projection })`
      // call would build a fresh entity instance for the same data channel.
      const { pubnub, trace } = makeClient();
      const first: any = new DataSyncUser('u1', pubnub as any, 'admin');
      const second: any = new DataSyncUser('u1', pubnub as any, 'admin');

      assert.notStrictEqual(first, second);
      assert.deepStrictEqual(first.subscriptionNames(), second.subscriptionNames());

      const firstSubscription = first.subscription({ projection: 'admin' });
      const secondSubscription = second.subscription({ projection: 'admin' });
      assert.strictEqual(entityOf(firstSubscription), first, 'an entity resolves its own projection to itself');

      firstSubscription.subscribe();
      secondSubscription.subscribe();
      assert.strictEqual(first.subscriptionsCount, 1, 'the ref count is not shared between the instances');
      assert.strictEqual(second.subscriptionsCount, 1);

      firstSubscription.unsubscribe();
      assert.strictEqual(first.subscriptionsCount, 0, 'the per-entity guard considers the channel free...');
      assert.deepStrictEqual(leaves(trace), [], '...and the per-channel check keeps it in the loop anyway');

      secondSubscription.unsubscribe();
      assert.deepStrictEqual(leaves(trace), ['__admin__u1']);
    });
  });

  describe('known limitations', () => {
    it('keeps a stale ref count after unsubscribeAll, exactly like a plain channel entity', () => {
      // `unsubscribeAll` invalidates with `forDestroy: false`, and only `invalidate(true)` decreases
      // the entity ref count. This is shared with every other entity type and is not specific to
      // DataSync entities.
      const cycle = (entity: any) => {
        const first = entity.subscription();
        first.subscribe();
        assert.strictEqual(entity.subscriptionsCount, 1);

        entity.client.unsubscribeAll();
        const staleCount = entity.subscriptionsCount;

        const second = entity.subscription();
        second.subscribe();
        second.unsubscribe();

        return staleCount;
      };

      const { pubnub, trace } = makeClient();
      assert.strictEqual(cycle(pubnub.dataSyncUser('u1')), 1, 'the DataSync entity keeps a stale state identifier');
      assert.strictEqual(cycle(pubnub.channel('c1')), 1, 'the plain channel entity behaves identically');
      assert.deepStrictEqual(leaves(trace), [], 'neither channel can leave the loop after the cycle');
    });
  });
});
