"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionInput = void 0;
/**
 * User-provided channels and groups for subscription.
 *
 * Object contains information about channels and groups for which real-time updates should be retrieved from the
 * PubNub network.
 *
 * @internal
 */
class SubscriptionInput {
    /**
     * Create a subscription input object.
     *
     * @param channels - List of channels which will be used with subscribe REST API to receive real-time updates.
     * @param channelGroups - List of channel groups which will be used with subscribe REST API to receive real-time
     * updates.
     */
    constructor({ channels, channelGroups }) {
        /**
         * Whether the user input is empty or not.
         */
        this.isEmpty = true;
        this._channelGroups = new Set((channelGroups !== null && channelGroups !== void 0 ? channelGroups : []).filter((value) => value.length > 0));
        this._channels = new Set((channels !== null && channels !== void 0 ? channels : []).filter((value) => value.length > 0));
        this.isEmpty = this._channels.size === 0 && this._channelGroups.size === 0;
    }
    /**
     * Retrieve a list of user-provided channel names.
     *
     * @returns List of user-provided channel names.
     */
    get channels() {
        if (this.isEmpty)
            return [];
        return Array.from(this._channels);
    }
    /**
     * Retrieve a list of user-provided channel group names.
     *
     * @returns List of user-provided channel group names.
     */
    get channelGroups() {
        if (this.isEmpty)
            return [];
        return Array.from(this._channelGroups);
    }
    /**
     * Check if the given name is contained in the channel or channel group.
     *
     * @param name - Containing the name to be checked.
     *
     * @returns `true` if the name is found in the channel or channel group, `false` otherwise.
     */
    contains(name) {
        if (this.isEmpty)
            return false;
        return this._channels.has(name) || this._channelGroups.has(name);
    }
    /**
     * Create a new subscription input which will contain all channels and channel groups from both inputs.
     *
     * @param input - Another subscription input that should be used to aggregate data in new instance.
     *
     * @returns New subscription input instance with combined channels and channel groups.
     */
    with(input) {
        return new SubscriptionInput({
            channels: [...this._channels, ...input._channels],
            channelGroups: [...this._channelGroups, ...input._channelGroups],
        });
    }
    /**
     * Create a new subscription input which will contain only channels and groups which not present in the input.
     *
     * @param input - Another subscription input which should be used to filter data in new instance.
     *
     * @returns New subscription input instance with filtered channels and channel groups.
     */
    without(input) {
        return new SubscriptionInput({
            channels: [...this._channels].filter((value) => !input._channels.has(value)),
            channelGroups: [...this._channelGroups].filter((value) => !input._channelGroups.has(value)),
        });
    }
    /**
     * Add data from another subscription input to the receiver.
     *
     * @param input - Another subscription input whose data should be added to the receiver.
     *
     * @returns Receiver instance with updated channels and channel groups.
     */
    add(input) {
        if (input._channelGroups.size > 0)
            this._channelGroups = new Set([...this._channelGroups, ...input._channelGroups]);
        if (input._channels.size > 0)
            this._channels = new Set([...this._channels, ...input._channels]);
        this.isEmpty = this._channels.size === 0 && this._channelGroups.size === 0;
        return this;
    }
    /**
     * Remove data from another subscription input from the receiver.
     *
     * @param input - Another subscription input whose data should be removed from the receiver.
     *
     * @returns Receiver instance with updated channels and channel groups.
     */
    remove(input) {
        if (input._channelGroups.size > 0)
            this._channelGroups = new Set([...this._channelGroups].filter((value) => !input._channelGroups.has(value)));
        if (input._channels.size > 0)
            this._channels = new Set([...this._channels].filter((value) => !input._channels.has(value)));
        return this;
    }
    /**
     * Remove all data from subscription input.
     *
     * @returns Receiver instance with updated channels and channel groups.
     */
    removeAll() {
        this._channels.clear();
        this._channelGroups.clear();
        this.isEmpty = true;
        return this;
    }
    /**
     * Serialize a subscription input to string.
     *
     * @returns Printable string representation of a subscription input.
     */
    toString() {
        return `SubscriptionInput { channels: [${this.channels.join(', ')}], channelGroups: [${this.channelGroups.join(', ')}], is empty: ${this.isEmpty ? 'true' : 'false'}} }`;
    }
}
exports.SubscriptionInput = SubscriptionInput;
// endregion
