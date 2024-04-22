/**
 * Common managed channels push notification parameters.
 */
type ManagedDeviceChannels = {
  /**
   * Channels to register or unregister with mobile push notifications.
   */
  channels: string[];

  /**
   * The device ID to associate with mobile push notifications.
   */
  device: string;

  /**
   * Starting channel for pagination.
   *
   * **Note:** Use the last channel from the previous page request.
   */
  start?: string;

  /**
   * Number of channels to return for pagination.
   *
   * **Note:** maximum of 1000 tokens at a time.
   *
   * @default `500`
   */
  count?: number;
};

// region List channels
/**
 * List all FCM device push notification enabled channels parameters.
 */
type ListFCMDeviceChannelsParameters = Omit<ManageFCMDeviceChannelsParameters, 'channels'>;

/**
 * List all APNS device push notification enabled channels parameters.
 *
 * @deprecated Use `APNS2`-based endpoints.
 */
type ListAPNSDeviceChannelsParameters = Omit<ManageAPNSDeviceChannelsParameters, 'channels'>;

/**
 * List all APNS2 device push notification enabled channels parameters.
 */
type ListAPNS2DeviceChannelsParameters = Omit<ManageAPNS2DeviceChannelsParameters, 'channels'>;

/**
 * List all device push notification enabled channels parameters.
 */
export type ListDeviceChannelsParameters =
  | ListFCMDeviceChannelsParameters
  | ListAPNSDeviceChannelsParameters
  | ListAPNS2DeviceChannelsParameters;

/**
 * List all device push notification enabled channels response.
 */
export type ListDeviceChannelsResponse = {
  /**
   * List of channels registered for device push notifications.
   */
  channels: string[];
};
// endregion

// region Add / Remove channels
/**
 * Manage FCM device push notification enabled channels parameters.
 */
type ManageFCMDeviceChannelsParameters = ManagedDeviceChannels & {
  /**
   * Push Notifications gateway type.
   */
  pushGateway: 'gcm';
};

/**
 * Manage APNS device push notification enabled channels parameters.
 *
 * @deprecated Use `APNS2`-based endpoints.
 */
type ManageAPNSDeviceChannelsParameters = ManagedDeviceChannels & {
  /**
   * Push Notifications gateway type.
   */
  pushGateway: 'apns';
};

/**
 * Manage APNS2 device push notification enabled channels parameters.
 */
type ManageAPNS2DeviceChannelsParameters = ManagedDeviceChannels & {
  /**
   * Push Notifications gateway type.
   */
  pushGateway: 'apns2';

  /**
   * Environment within which device should manage list of channels with enabled notifications.
   */
  environment?: 'development' | 'production';

  /**
   * Notifications topic name (usually it is bundle identifier of application for Apple platform).
   */
  topic: string;
};

/**
 * Manage device push notification enabled channels parameters.
 */
export type ManageDeviceChannelsParameters =
  | ManageFCMDeviceChannelsParameters
  | ManageAPNSDeviceChannelsParameters
  | ManageAPNS2DeviceChannelsParameters;

/**
 * Manage device push notification enabled channels response.
 */
export type ManageDeviceChannelsResponse = Record<string, unknown>;
// endregion

// region Remove device
/**
 * Remove all FCM device push notification enabled channels parameters.
 */
type RemoveFCMDeviceParameters = Omit<ManageFCMDeviceChannelsParameters, 'channels'>;

/**
 * Manage APNS device push notification enabled channels parameters.
 *
 * @deprecated Use `APNS2`-based endpoints.
 */
type RemoveAPNSDeviceParameters = Omit<ManageAPNSDeviceChannelsParameters, 'channels'>;

/**
 * Manage APNS2 device push notification enabled channels parameters.
 */
type RemoveAPNS2DeviceParameters = Omit<ManageAPNS2DeviceChannelsParameters, 'channels'>;

/**
 * Remove all device push notification enabled channels parameters.
 */
export type RemoveDeviceParameters =
  | RemoveFCMDeviceParameters
  | RemoveAPNSDeviceParameters
  | RemoveAPNS2DeviceParameters;

/**
 * Remove all device push notification enabled channels response.
 */
export type RemoveDeviceResponse = Record<string, unknown>;
// endregion
