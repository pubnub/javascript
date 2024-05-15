/**
 * Type of Push Notifications gateway which should be used with Push Notifications REST API.
 */
type PushGateway = 'apns2' | 'gcm';
/**
 * Basic information required by Push Notifications REST API about device.
 */
type DevicePush = {
    /**
     * Device ID for which list of registered channel push notifications will be changed.
     */
    device: string;
    /**
     * Push Notifications gateway to use.
     *
     * **Important:** Depends from the source of `device` token and can be `apns2` (for token
     * provided during device registration using Apple's framework) or `gcm` (when used Firebase
     * or similar framework to receive token).
     */
    pushGateway: PushGateway;
};
/**
 * Register and unregister push notifications for device request parameters.
 */
export type ManageDeviceChannelsParameters = {
    /**
     * List of channels to be added or removed.
     */
    channels: string[];
} & DevicePush;
/**
 * List Device Channels request parameters.
 */
export type ListDeviceChannelsParameters = DevicePush;
/**
 * Response with result of the list device channels.
 */
export type ListDeviceChannelsResponse = {
    /**
     * List of the channels for which `device` will receive push notifications.
     */
    channels: string[];
};
/**
 * Delete Push Notification for device request parameters.
 */
export type DeleteDeviceParameters = DevicePush;
export {};
