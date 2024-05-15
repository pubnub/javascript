import { KeySet, ResultCallback, SendRequestFunction, StatusCallback } from './types/api';
import * as Push from './types/api/push';
export default class PubNubPushNotifications {
    private readonly keySet;
    private readonly sendRequest;
    constructor(keySet: KeySet, sendRequest: SendRequestFunction<any>);
    listChannels(parameters: Push.ListDeviceChannelsParameters, callback: ResultCallback<Push.ListDeviceChannelsResponse>): void;
    listChannels(parameters: Push.ListDeviceChannelsParameters): Promise<Push.ListDeviceChannelsResponse>;
    addChannels(parameters: Push.ManageDeviceChannelsParameters, callback: StatusCallback): void;
    addChannels(parameters: Push.ManageDeviceChannelsParameters): Promise<void>;
    removeChannels(parameters: Push.ManageDeviceChannelsParameters, callback: StatusCallback): void;
    removeChannels(parameters: Push.ManageDeviceChannelsParameters): Promise<void>;
    deleteDevice(parameters: Push.RemoveDeviceParameters, callback: StatusCallback): void;
    deleteDevice(parameters: Push.RemoveDeviceParameters): Promise<void>;
}
