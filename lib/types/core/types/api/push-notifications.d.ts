type PushGateway = 'apns2' | 'gcm';
type DevicePush = {
    device: string;
    pushGateway: PushGateway;
};
export type ManageDeviceChannelsParameters = {
    channels: string[];
} & DevicePush;
export type ListDeviceChannelsParameters = DevicePush;
export type ListDeviceChannelsResponse = {
    channels: string[];
};
export type DeleteDeviceParameters = DevicePush;
export {};
