"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSyncSubscribable = exports.normalizedProjection = void 0;
const entity_1 = require("./entity");
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
const normalizedProjection = (projection) => {
    if (!projection)
        return undefined;
    const trimmed = projection.trim();
    if (trimmed.length === 0 || BASE_PROJECTIONS.includes(trimmed.toLowerCase()))
        return undefined;
    return trimmed;
};
exports.normalizedProjection = normalizedProjection;
/**
 * Base class for DataSync objects which can be observed with the subscribe REST API.
 *
 * A DataSync object is observed on a data channel named after its identifier, optionally prefixed
 * with the name of an observed projection: `__{projection}__{id}`.
 *
 * **Note:** The identifier is used verbatim, so an identifier which already looks prefixed
 * (`__admin__u1`) will be prefixed again when a projection is requested (`__admin____admin__u1`).
 */
class DataSyncSubscribable extends entity_1.Entity {
    /**
     * Create a DataSync object entity.
     *
     * @param nameOrId - Unique DataSync object identifier (used verbatim).
     * @param client - PubNub instance which has been used to create this entity.
     * @param [projection] - Name of the projection which should be observed by this entity.
     *
     * @internal
     */
    constructor(nameOrId, client, projection) {
        super(nameOrId, client);
        this._projection = (0, exports.normalizedProjection)(projection);
    }
    /**
     * Get unique DataSync object identifier.
     *
     * @returns DataSync object identifier.
     */
    get id() {
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
    get projection() {
        return this._projection;
    }
    /**
     * Name of the data channel which is used with multiplexed subscribe REST API calls.
     *
     * @returns Name of the observed data channel.
     *
     * @internal
     */
    get subscriptionChannel() {
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
    subscriptionNames(_receivePresenceEvents) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled')
            return [this.subscriptionChannel];
        else
            throw new Error('Subscription names error: subscription module disabled');
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
    subscription(subscriptionOptions) {
        if (process.env.SUBSCRIBE_MODULE !== 'disabled' && process.env.DATA_SYNC_MODULE !== 'disabled') {
            const entity = this.entityForProjection((0, exports.normalizedProjection)(subscriptionOptions === null || subscriptionOptions === void 0 ? void 0 : subscriptionOptions.projection));
            // Each projection is observed on its own data channel, so it must be represented by its own
            // entity instance (see `variants`). Let the entity which owns the requested projection create
            // the subscription object for itself: it resolves that same projection to itself, so this
            // delegation is always a single hop.
            if (entity !== this)
                return entity.subscription(subscriptionOptions);
            return super.subscription(subscriptionOptions);
        }
        else
            throw new Error('Subscription error: subscription or DataSync module disabled');
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
    entityForProjection(projection) {
        var _a, _b, _c;
        var _d;
        if (projection === this._projection)
            return this;
        // Register the receiver in the shared registry, so that it can be resolved back from siblings.
        //
        // Note: the receiver is added with an element assignment and never as part of an object literal
        // which is assigned to `variants`. Declaration files for this module are inferred from the
        // compiled JavaScript (`allowJs`), where a `this.variants = { ...: this }` statement would make
        // the inferred member type reference the inaccessible polymorphic `this` type (TS2527).
        const variants = ((_a = this.variants) !== null && _a !== void 0 ? _a : (this.variants = {}));
        (_c = variants[_d = (_b = this._projection) !== null && _b !== void 0 ? _b : BASE_PROJECTION_KEY]) !== null && _c !== void 0 ? _c : (variants[_d] = this);
        const key = projection !== null && projection !== void 0 ? projection : BASE_PROJECTION_KEY;
        let entity = variants[key];
        if (!entity) {
            entity = variants[key] = this.withProjection(projection);
            entity.variants = variants;
        }
        return entity;
    }
    /**
     * Stringify entity object.
     *
     * @returns Serialized entity object.
     */
    toString() {
        var _a;
        return (`${this.entityType} { id: ${this._nameOrId}, projection: ${(_a = this._projection) !== null && _a !== void 0 ? _a : 'none'}, ` +
            `channel: ${this.subscriptionChannel}, subscriptionsCount: ${this.subscriptionsCount} }`);
    }
}
exports.DataSyncSubscribable = DataSyncSubscribable;
