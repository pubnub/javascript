type ManagedDeviceChannels = {
    channels: string[];
    device: string;
    start?: string;
    count?: number;
};
type ListFCMDeviceChannelsParameters = Omit<ManageFCMDeviceChannelsParameters, 'channels'>;
type ListAPNSDeviceChannelsParameters = Omit<ManageAPNSDeviceChannelsParameters, 'channels'>;
type ListAPNS2DeviceChannelsParameters = Omit<ManageAPNS2DeviceChannelsParameters, 'channels'>;
export type ListDeviceChannelsParameters = ListFCMDeviceChannelsParameters | ListAPNSDeviceChannelsParameters | ListAPNS2DeviceChannelsParameters;
export type ListDeviceChannelsResponse = {
    channels: string[];
};
type ManageFCMDeviceChannelsParameters = ManagedDeviceChannels & {
    pushGateway: 'gcm';
};
type ManageAPNSDeviceChannelsParameters = ManagedDeviceChannels & {
    pushGateway: 'apns';
};
type ManageAPNS2DeviceChannelsParameters = ManagedDeviceChannels & {
    pushGateway: 'apns2';
    environment?: 'development' | 'production';
    topic: string;
};
export type ManageDeviceChannelsParameters = ManageFCMDeviceChannelsParameters | ManageAPNSDeviceChannelsParameters | ManageAPNS2DeviceChannelsParameters;
export type ManageDeviceChannelsResponse = Record<string, unknown>;
type RemoveFCMDeviceParameters = Omit<ManageFCMDeviceChannelsParameters, 'channels'>;
type RemoveAPNSDeviceParameters = Omit<ManageAPNSDeviceChannelsParameters, 'channels'>;
type RemoveAPNS2DeviceParameters = Omit<ManageAPNS2DeviceChannelsParameters, 'channels'>;
export type RemoveDeviceParameters = RemoveFCMDeviceParameters | RemoveAPNSDeviceParameters | RemoveAPNS2DeviceParameters;
export type RemoveDeviceResponse = Record<string, unknown>;
export {};
