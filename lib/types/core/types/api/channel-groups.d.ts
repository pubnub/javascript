/**
 * Add or remove Channels to the channel group request parameters.
 */
export type ManageChannelGroupChannelsParameters = {
    /**
     * Name of the channel group for which channels list should be changed.
     */
    channelGroup: string;
    /**
     * List of channels to be added or removed.
     */
    channels: string[];
};
/**
 * Channel group channels list manage response.
 */
export type ManageChannelGroupChannelsResponse = Record<string, unknown>;
/**
 * Response with result of the all channel groups list.
 */
export type ListAllChannelGroupsResponse = {
    /**
     * All channel groups with channels.
     */
    groups: string[];
};
/**
 * List Channel Group Channels request parameters.
 */
export type ListChannelGroupChannelsParameters = {
    /**
     * Name of the channel group for which list of channels should be retrieved.
     */
    channelGroup: string;
};
/**
 * Response with result of the list channel group channels.
 */
export type ListChannelGroupChannelsResponse = {
    /**
     * List of the channels registered withing specified channel group.
     */
    channels: string[];
};
/**
 * Delete Channel Group request parameters.
 */
export type DeleteChannelGroupParameters = {
    /**
     * Name of the channel group which should be removed.
     */
    channelGroup: string;
};
/**
 * Delete channel group response.
 */
export type DeleteChannelGroupResponse = Record<string, unknown>;
