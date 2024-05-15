/**
 * PubNub Push Notifications API module.
 */
import { KeySet, ResultCallback, SendRequestFunction, StatusCallback } from './types/api';
import * as Push from './types/api/push';
export default class PubNubPushNotifications {
    private readonly keySet;
    private readonly sendRequest;
    constructor(keySet: KeySet, sendRequest: SendRequestFunction<any>);
    /**
     * Fetch device's push notification enabled channels.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    listChannels(parameters: Push.ListDeviceChannelsParameters, callback: ResultCallback<Push.ListDeviceChannelsResponse>): void;
    /**
     * Fetch device's push notification enabled channels.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous get device channels response.
     */
    listChannels(parameters: Push.ListDeviceChannelsParameters): Promise<Push.ListDeviceChannelsResponse>;
    /**
     * Enable push notifications on channels for device.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    addChannels(parameters: Push.ManageDeviceChannelsParameters, callback: StatusCallback): void;
    /**
     * Enable push notifications on channels for device.
     *
     * @param parameters - Request configuration parameters.
     */
    addChannels(parameters: Push.ManageDeviceChannelsParameters): Promise<void>;
    /**
     * Disable push notifications on channels for device.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    removeChannels(parameters: Push.ManageDeviceChannelsParameters, callback: StatusCallback): void;
    /**
     * Disable push notifications on channels for device.
     *
     * @param parameters - Request configuration parameters.
     */
    removeChannels(parameters: Push.ManageDeviceChannelsParameters): Promise<void>;
    /**
     * Disable push notifications for device.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    deleteDevice(parameters: Push.RemoveDeviceParameters, callback: StatusCallback): void;
    /**
     * Disable push notifications for device.
     *
     * @param parameters - Request configuration parameters.
     */
    deleteDevice(parameters: Push.RemoveDeviceParameters): Promise<void>;
}
