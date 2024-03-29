/**
 * PubNub Push Notifications API module.
 */

import { RemoveDevicePushNotificationChannelsRequest } from './endpoints/push/remove_push_channels';
import { ListDevicePushNotificationChannelsRequest } from './endpoints/push/list_push_channels';
import { AddDevicePushNotificationChannelsRequest } from './endpoints/push/add_push_channels';
import { KeySet, ResultCallback, SendRequestFunction, StatusCallback } from './types/api';
import { RemoveDevicePushNotificationRequest } from './endpoints/push/remove_device';
import * as PushNotifications from './types/api/push-notifications';
import * as Push from './types/api/push';

export default class PubNubPushNotifications {
  constructor(
    private readonly keySet: KeySet,
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    private readonly sendRequest: SendRequestFunction<any>,
  ) {}

  // --------------------------------------------------------
  // ---------------------- Audit API -----------------------
  // --------------------------------------------------------
  // region Audit API

  /**
   * Fetch device's push notification enabled channels.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public listChannels(
    parameters: Push.ListDeviceChannelsParameters,
    callback: ResultCallback<Push.ListDeviceChannelsResponse>,
  ): void;

  /**
   * Fetch device's push notification enabled channels.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get device channels response.
   */
  public async listChannels(parameters: Push.ListDeviceChannelsParameters): Promise<Push.ListDeviceChannelsResponse>;

  /**
   * Fetch device's push notification enabled channels.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get device channels response or `void` in case if `callback` provided.
   */
  public async listChannels(
    parameters: Push.ListDeviceChannelsParameters,
    callback?: ResultCallback<PushNotifications.ListDeviceChannelsResponse>,
  ): Promise<Push.ListDeviceChannelsResponse | void> {
    const request = new ListDevicePushNotificationChannelsRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }
  // endregion

  // --------------------------------------------------------
  // ---------------------- Manage API ----------------------
  // --------------------------------------------------------
  // region Manage API

  /**
   * Enable push notifications on channels for device.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public addChannels(parameters: Push.ManageDeviceChannelsParameters, callback: StatusCallback): void;

  /**
   * Enable push notifications on channels for device.
   *
   * @param parameters - Request configuration parameters.
   */
  public async addChannels(parameters: Push.ManageDeviceChannelsParameters): Promise<void>;

  /**
   * Enable push notifications on channels for device.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   */
  public async addChannels(parameters: Push.ManageDeviceChannelsParameters, callback?: StatusCallback): Promise<void> {
    const request = new AddDevicePushNotificationChannelsRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  /**
   * Disable push notifications on channels for device.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public removeChannels(parameters: Push.ManageDeviceChannelsParameters, callback: StatusCallback): void;

  /**
   * Disable push notifications on channels for device.
   *
   * @param parameters - Request configuration parameters.
   */
  public async removeChannels(parameters: Push.ManageDeviceChannelsParameters): Promise<void>;

  /**
   * Disable push notifications on channels for device.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   */
  public async removeChannels(
    parameters: Push.ManageDeviceChannelsParameters,
    callback?: StatusCallback,
  ): Promise<void> {
    const request = new RemoveDevicePushNotificationChannelsRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  /**
   * Disable push notifications for device.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public deleteDevice(parameters: Push.RemoveDeviceParameters, callback: StatusCallback): void;

  /**
   * Disable push notifications for device.
   *
   * @param parameters - Request configuration parameters.
   */
  public async deleteDevice(parameters: Push.RemoveDeviceParameters): Promise<void>;

  /**
   * Disable push notifications for device.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   */
  public async deleteDevice(parameters: Push.RemoveDeviceParameters, callback?: StatusCallback): Promise<void> {
    const request = new RemoveDevicePushNotificationRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
}
