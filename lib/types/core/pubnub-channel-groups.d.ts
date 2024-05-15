/**
 * PubNub Channel Groups API module.
 */
import { KeySet, ResultCallback, SendRequestFunction, StatusCallback } from './types/api';
import * as ChannelGroups from './types/api/channel-groups';
export default class PubnubChannelGroups {
    private readonly keySet;
    private readonly sendRequest;
    constructor(keySet: KeySet, sendRequest: SendRequestFunction<any>);
    /**
     * Fetch channel group channels.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    listChannels(parameters: ChannelGroups.ListChannelGroupChannelsParameters, callback: ResultCallback<ChannelGroups.ListChannelGroupChannelsResponse>): void;
    /**
     * Fetch channel group channels.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous get channel group channels response.
     */
    listChannels(parameters: ChannelGroups.ListChannelGroupChannelsParameters): Promise<ChannelGroups.ListChannelGroupChannelsResponse>;
    /**
     * Fetch all channel groups.
     *
     * @param callback - Request completion handler callback.
     *
     * @deprecated
     */
    listGroups(callback: ResultCallback<ChannelGroups.ListAllChannelGroupsResponse>): void;
    /**
     * Fetch all channel groups.
     *
     * @returns Asynchronous get all channel groups response.
     *
     * @deprecated
     */
    listGroups(): Promise<ChannelGroups.ListAllChannelGroupsResponse>;
    /**
     * Add channels to the channel group.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    addChannels(parameters: ChannelGroups.ManageChannelGroupChannelsParameters, callback: StatusCallback): void;
    /**
     * Add channels to the channel group.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous add channels to the channel group response.
     */
    addChannels(parameters: ChannelGroups.ManageChannelGroupChannelsParameters): Promise<Record<string, unknown>>;
    /**
     * Remove channels from the channel group.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    removeChannels(parameters: ChannelGroups.ManageChannelGroupChannelsParameters, callback: StatusCallback): void;
    /**
     * Remove channels from the channel group.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous remove channels from the channel group response.
     */
    removeChannels(parameters: ChannelGroups.ManageChannelGroupChannelsParameters): Promise<Record<string, unknown>>;
    /**
     * Remove channel group.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    deleteGroup(parameters: ChannelGroups.DeleteChannelGroupParameters, callback: StatusCallback): void;
    /**
     * Remove channel group.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous remove channel group response.
     */
    deleteGroup(parameters: ChannelGroups.DeleteChannelGroupParameters): Promise<Record<string, unknown>>;
}
