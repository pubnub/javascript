import { KeySet, ResultCallback, SendRequestFunction, StatusCallback } from './types/api';
import * as ChannelGroups from './types/api/channel-groups';
export default class PubnubChannelGroups {
    private readonly keySet;
    private readonly sendRequest;
    constructor(keySet: KeySet, sendRequest: SendRequestFunction<any>);
    listChannels(parameters: ChannelGroups.ListChannelGroupChannelsParameters, callback: ResultCallback<ChannelGroups.ListChannelGroupChannelsResponse>): void;
    listChannels(parameters: ChannelGroups.ListChannelGroupChannelsParameters): Promise<ChannelGroups.ListChannelGroupChannelsResponse>;
    listGroups(callback: ResultCallback<ChannelGroups.ListAllChannelGroupsResponse>): void;
    listGroups(): Promise<ChannelGroups.ListAllChannelGroupsResponse>;
    addChannels(parameters: ChannelGroups.ManageChannelGroupChannelsParameters, callback: StatusCallback): void;
    addChannels(parameters: ChannelGroups.ManageChannelGroupChannelsParameters): Promise<Record<string, unknown>>;
    removeChannels(parameters: ChannelGroups.ManageChannelGroupChannelsParameters, callback: StatusCallback): void;
    removeChannels(parameters: ChannelGroups.ManageChannelGroupChannelsParameters): Promise<Record<string, unknown>>;
    deleteGroup(parameters: ChannelGroups.DeleteChannelGroupParameters, callback: StatusCallback): void;
    deleteGroup(parameters: ChannelGroups.DeleteChannelGroupParameters): Promise<Record<string, unknown>>;
}
