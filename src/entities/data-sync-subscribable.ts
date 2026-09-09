import { DataSyncSubscriptionOptions } from './interfaces/subscription-capable';
import type { PubNubCore as PubNub } from '../core/pubnub-common';
import { Subscription } from './subscription';
import { Entity } from './entity';

/**
 * Projection names which are observed on the object's base (un-prefixed) data channel.
 *
 * @internal
 */
const BASE_PROJECTIONS = ['default', '__default__'];

/**
 * Key under which the base (un-prefixed) projection is stored in the variants registry.
 *
 * @internal
 */
const BASE_PROJECTION_KEY = '';

/**
 * Normalize a user-provided DataSync projection name.
 *
 * **Note:** Only the projection name is normalized. A DataSync object identifier is always used
 * verbatim (so wildcard identifiers keep working by construction).
 *
 * @param [projection] - Projection name as provided by the user.
 *
 * @returns Trimmed projection name or `undefined` when the base projection is requested.
 *
 * @internal
 */
export const normalizedProjection = (projection?: string): string | undefined => {
  if (!projection) return undefined;

  const trimmed = projection.trim();
  if (trimmed.length === 0 || BASE_PROJECTIONS.includes(trimmed.toLowerCase())) return undefined;

  return trimmed;
};

/**
 * Base class for DataSync objects which can be observed with the subscribe REST API.
 *
 * A DataSync object is observed on a data channel named after its identifier, optionally prefixed
 * with the name of an observed projection: `__{projection}__{id}`.
 *
 * **Note:** The identifier is used verbatim, so an identifier which already looks prefixed
 * (`__admin__u1`) will be prefixed again when a projection is requested (`__admin____admin__u1`).
 */
export abstract class DataSyncSubscribable extends Entity {
  /**
   * Registry of the entities which observe the same DataSync object through different projections.
   *
   * The registry is **shared** by all entities created for the same object (keyed by normalized
   * projection name, with {@link BASE_PROJECTION_KEY} used for the base projection), so a specific
   * (object, projection) pair is always represented by a single entity instance. That is required
   * for correct per-entity subscription ref-counting: {@link Entity#subscriptionsCount} is what
   * {@link Subscription#subscriptionInput} uses to decide whether a channel may leave the
   * subscription loop.
   *
   * @internal
   */
  private variants?: Record<string, DataSyncSubscribable | undefined>;

  /**
   * Normalized name of the projection this entity observes.
   *
   * @internal
   */
  private readonly _projection?: string;

  /**
   * Create a DataSync object entity.
   *
   * @param nameOrId - Unique DataSync object identifier (used verbatim).
   * @param client - PubNub instance which has been used to create this entity.
   * @param [projection] - Name of the projection which should be observed by this entity.
   *
   * @internal
   */
  constructor(nameOrId: string, client: PubNub<unknown, unknown>, projection?: string) {
    super(nameOrId, client);

    this._projection = normalizedProjection(projection);
  }

  /**
   * Get unique DataSync object identifier.
   *
   * @returns DataSync object identifier.
   */
  get id(): string {
    return this._nameOrId;
  }

  /**
   * Get the name of the projection which is observed by this entity.
   *
   * **Note:** A projection is chosen per subscription
   * ({@link DataSyncSubscriptionOptions#projection}), so an entity created by the PubNub client
   * always reports `undefined` here: it is the base-projection entity, and the entities bound to
   * other projections are internal to it.
   *
   * @returns Observed projection name or `undefined` when the object is observed through its base
   * projection.
   */
  get projection(): string | undefined {
    return this._projection;
  }

  /**
   * Name of the data channel which is used with multiplexed subscribe REST API calls.
   *
   * @returns Name of the observed data channel.
   *
   * @internal
   */
  get subscriptionChannel(): string {
    return this._projection ? `__${this._projection}__${this._nameOrId}` : this._nameOrId;
  }

  /**
   * Names for an object to be used in subscription.
   *
   * **Note:** A DataSync object is observed on a single data channel; presence events are not
   * supported for it and `_receivePresenceEvents` is ignored.
   *
   * @param _receivePresenceEvents - Whether presence events should be observed or not.
   *
   * @returns List of names with multiplexed subscribe REST API calls.
   *
   * @internal
   */
  override subscriptionNames(_receivePresenceEvents?: boolean): string[] {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled') return [this.subscriptionChannel];
    else throw new Error('Subscription names error: subscription module disabled');
  }

  /**
   * Create a DataSync object's subscription object for real-time updates.
   *
   * @param [subscriptionOptions] - Subscription object behavior customization options.
   *
   * @returns Configured and ready to use DataSync object's subscription object.
   *
   * @example
   * ```typescript
   * // Observe the object itself.
   * pubnub.dataSyncUser('u1').subscription().subscribe();
   *
   * // Observe the `admin` projection of the object (the `__admin__u1` data channel).
   * pubnub.dataSyncUser('u1').subscription({ projection: 'admin' }).subscribe();
   * ```
   */
  override subscription(subscriptionOptions?: DataSyncSubscriptionOptions): Subscription {
    if (process.env.SUBSCRIBE_MODULE !== 'disabled' && process.env.DATA_SYNC_MODULE !== 'disabled') {
      const entity = this.entityForProjection(normalizedProjection(subscriptionOptions?.projection));

      // Each projection is observed on its own data channel, so it must be represented by its own
      // entity instance (see `variants`). Let the entity which owns the requested projection create
      // the subscription object for itself: it resolves that same projection to itself, so this
      // delegation is always a single hop.
      if (entity !== this) return entity.subscription(subscriptionOptions);

      return super.subscription(subscriptionOptions);
    } else throw new Error('Subscription error: subscription or DataSync module disabled');
  }

  /**
   * Resolve the entity which observes the same DataSync object through `projection`.
   *
   * @param [projection] - Normalized name of the projection to observe.
   *
   * @returns Receiver itself, or the memoized sibling entity bound to `projection`.
   *
   * @internal
   */
  private entityForProjection(projection?: string): DataSyncSubscribable {
    if (projection === this._projection) return this;

    // Register the receiver in the shared registry, so that it can be resolved back from siblings.
    //
    // Note: the receiver is added with an element assignment and never as part of an object literal
    // which is assigned to `variants`. Declaration files for this module are inferred from the
    // compiled JavaScript (`allowJs`), where a `this.variants = { ...: this }` statement would make
    // the inferred member type reference the inaccessible polymorphic `this` type (TS2527).
    const variants = (this.variants ??= {});
    variants[this._projection ?? BASE_PROJECTION_KEY] ??= this;
    const key = projection ?? BASE_PROJECTION_KEY;

    let entity = variants[key];
    if (!entity) {
      entity = variants[key] = this.withProjection(projection);
      entity.variants = variants;
    }

    return entity;
  }

  /**
   * Create a copy of the receiver which observes `projection` of the same DataSync object.
   *
   * **Note:** Implementation should always build the copy from `this._nameOrId`, which is the bare
   * object identifier for any projection, so that a projection prefix can't be applied twice.
   *
   * @param [projection] - Normalized name of the projection to observe.
   *
   * @returns Entity of the same type bound to `projection`.
   *
   * @internal
   */
  protected abstract withProjection(projection?: string): DataSyncSubscribable;

  /**
   * Stringify entity object.
   *
   * @returns Serialized entity object.
   */
  override toString(): string {
    return (
      `${this.entityType} { id: ${this._nameOrId}, projection: ${this._projection ?? 'none'}, ` +
      `channel: ${this.subscriptionChannel}, subscriptionsCount: ${this.subscriptionsCount} }`
    );
  }
}
