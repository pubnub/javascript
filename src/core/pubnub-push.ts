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
import { LoggerManager } from './components/logger-manager';

/**
 * PubNub Push Notifications API interface.
 */
export default class PubNubPushNotifications {
  /**
   * Registered loggers' manager.
   *
   * @internal
   */
  private readonly logger: LoggerManager;

  /**
   * PubNub account keys set which should be used for REST API calls.
   *
   * @internal
   */
  private readonly keySet: KeySet;

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  /**
   * Function which should be used to send REST API calls.
   *
   * @internal
   */
  private readonly sendRequest: SendRequestFunction<any, any>;

  /**
   * Create mobile push notifications API access object.
   *
   * @param logger - Registered loggers' manager.
   * @param keySet - PubNub account keys set which should be used for REST API calls.
   * @param sendRequest - Function which should be used to send REST API calls.
   *
   * @internal
   */
  constructor(
    logger: LoggerManager,
    keySet: KeySet,
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    sendRequest: SendRequestFunction<any, any>,
  ) {
    this.sendRequest = sendRequest;
    this.logger = logger;
    this.keySet = keySet;
  }

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
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: `List push-enabled channels with parameters:`,
    }));

    const request = new ListDevicePushNotificationChannelsRequest({ ...parameters, keySet: this.keySet });
    const logResponse = (response: Push.ListDeviceChannelsResponse | null) => {
      if (!response) return;

      this.logger.debug('PubNub', `List push-enabled channels success. Received ${response.channels.length} channels.`);
    };

    if (callback)
      return this.sendRequest(request, (status, response) => {
        logResponse(response);
        callback(status, response);
      });

    return this.sendRequest(request).then((response) => {
      logResponse(response);
      return response;
    });
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
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: `Add push-enabled channels with parameters:`,
    }));

    const request = new AddDevicePushNotificationChannelsRequest({ ...parameters, keySet: this.keySet });
    const logResponse = () => {
      this.logger.debug('PubNub', `Add push-enabled channels success.`);
    };

    if (callback)
      return this.sendRequest(request, (status) => {
        if (!status.error) logResponse();
        callback(status);
      });

    return this.sendRequest(request).then((response) => {
      logResponse();
      return response;
    });
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
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: `Remove push-enabled channels with parameters:`,
    }));

    const request = new RemoveDevicePushNotificationChannelsRequest({ ...parameters, keySet: this.keySet });
    const logResponse = () => {
      this.logger.debug('PubNub', `Remove push-enabled channels success.`);
    };

    if (callback)
      return this.sendRequest(request, (status) => {
        if (!status.error) logResponse();
        callback(status);
      });

    return this.sendRequest(request).then((response) => {
      logResponse();
      return response;
    });
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
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: `Remove push notifications for device with parameters:`,
    }));

    const request = new RemoveDevicePushNotificationRequest({ ...parameters, keySet: this.keySet });
    const logResponse = () => {
      this.logger.debug('PubNub', `Remove push notifications for device success.`);
    };

    if (callback)
      return this.sendRequest(request, (status) => {
        if (!status.error) logResponse();
        callback(status);
      });

    return this.sendRequest(request).then((response) => {
      logResponse();
      return response;
    });
  }

  // endregion
}
