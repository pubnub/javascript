export type ManageChannelGroupChannelsParameters = {
    channelGroup: string;
    channels: string[];
};
export type ManageChannelGroupChannelsResponse = Record<string, unknown>;
export type ListAllChannelGroupsResponse = {
    groups: string[];
};
export type ListChannelGroupChannelsParameters = {
    channelGroup: string;
};
export type ListChannelGroupChannelsResponse = {
    channels: string[];
};
export type DeleteChannelGroupParameters = {
    channelGroup: string;
};
export type DeleteChannelGroupResponse = Record<string, unknown>;
