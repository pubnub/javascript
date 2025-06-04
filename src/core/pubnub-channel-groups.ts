/**
 * PubNub Channel Groups API module.
 */

import { RemoveChannelGroupChannelsRequest } from './endpoints/channel_groups/remove_channels';
import { KeySet, ResultCallback, SendRequestFunction, StatusCallback } from './types/api';
import { AddChannelGroupChannelsRequest } from './endpoints/channel_groups/add_channels';
import { ListChannelGroupChannels } from './endpoints/channel_groups/list_channels';
import { DeleteChannelGroupRequest } from './endpoints/channel_groups/delete_group';
import { ListChannelGroupsRequest } from './endpoints/channel_groups/list_groups';
import * as ChannelGroups from './types/api/channel-groups';
import { LoggerManager } from './components/logger-manager';

/**
 * PubNub Stream / Channel group API interface.
 */
export default class PubNubChannelGroups {
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
   * Create stream / channel group API access object.
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
   * Fetch channel group channels.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public listChannels(
    parameters: ChannelGroups.ListChannelGroupChannelsParameters,
    callback: ResultCallback<ChannelGroups.ListChannelGroupChannelsResponse>,
  ): void;

  /**
   * Fetch channel group channels.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get channel group channels response.
   */
  public async listChannels(
    parameters: ChannelGroups.ListChannelGroupChannelsParameters,
  ): Promise<ChannelGroups.ListChannelGroupChannelsResponse>;

  /**
   * Fetch channel group channels.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get channel group channels response or `void` in case if `callback`
   * provided.
   */
  public async listChannels(
    parameters: ChannelGroups.ListChannelGroupChannelsParameters,
    callback?: ResultCallback<ChannelGroups.ListChannelGroupChannelsResponse>,
  ): Promise<ChannelGroups.ListChannelGroupChannelsResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'List channel group channels with parameters:',
    }));

    const request = new ListChannelGroupChannels({ ...parameters, keySet: this.keySet });
    const logResponse = (response: ChannelGroups.ListChannelGroupChannelsResponse | null) => {
      if (!response) return;
      this.logger.info('PubNub', `List channel group channels success. Received ${response.channels.length} channels.`);
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

  // region Deprecated
  /**
   * Fetch all channel groups.
   *
   * @param callback - Request completion handler callback.
   *
   * @deprecated
   */
  public listGroups(callback: ResultCallback<ChannelGroups.ListAllChannelGroupsResponse>): void;

  /**
   * Fetch all channel groups.
   *
   * @returns Asynchronous get all channel groups response.
   *
   * @deprecated
   */
  public async listGroups(): Promise<ChannelGroups.ListAllChannelGroupsResponse>;

  /**
   * Fetch all channel groups.
   *
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get all channel groups response or `void` in case if `callback` provided.
   *
   * @deprecated
   */
  public async listGroups(
    callback?: ResultCallback<ChannelGroups.ListAllChannelGroupsResponse>,
  ): Promise<ChannelGroups.ListAllChannelGroupsResponse | void> {
    this.logger.debug('PubNub', 'List all channel groups.');

    const request = new ListChannelGroupsRequest({ keySet: this.keySet });
    const logResponse = (response: ChannelGroups.ListAllChannelGroupsResponse | null) => {
      if (!response) return;
      this.logger.info('PubNub', `List all channel groups success. Received ${response.groups.length} groups.`);
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
  // endregion

  // --------------------------------------------------------
  // ---------------------- Manage API ----------------------
  // --------------------------------------------------------
  // region Manage API

  /**
   * Add channels to the channel group.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public addChannels(parameters: ChannelGroups.ManageChannelGroupChannelsParameters, callback: StatusCallback): void;

  /**
   * Add channels to the channel group.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous add channels to the channel group response.
   */
  public async addChannels(
    parameters: ChannelGroups.ManageChannelGroupChannelsParameters,
  ): Promise<Record<string, unknown>>;

  /**
   * Add channels to the channel group.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous add channels to the channel group response or `void` in case if
   * `callback` provided.
   */
  public async addChannels(
    parameters: ChannelGroups.ManageChannelGroupChannelsParameters,
    callback?: StatusCallback,
  ): Promise<Record<string, unknown> | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Add channels to the channel group with parameters:',
    }));

    const request = new AddChannelGroupChannelsRequest({ ...parameters, keySet: this.keySet });
    const logResponse = () => {
      this.logger.info('PubNub', `Add channels to the channel group success.`);
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
   * Remove channels from the channel group.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public removeChannels(parameters: ChannelGroups.ManageChannelGroupChannelsParameters, callback: StatusCallback): void;

  /**
   * Remove channels from the channel group.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous remove channels from the channel group response.
   */
  public async removeChannels(
    parameters: ChannelGroups.ManageChannelGroupChannelsParameters,
  ): Promise<Record<string, unknown>>;

  /**
   * Remove channels from the channel group.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous remove channels from the channel group response or `void` in
   * case if `callback` provided.
   */
  public async removeChannels(
    parameters: ChannelGroups.ManageChannelGroupChannelsParameters,
    callback?: StatusCallback,
  ): Promise<Record<string, unknown> | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Remove channels from the channel group with parameters:',
    }));

    const request = new RemoveChannelGroupChannelsRequest({ ...parameters, keySet: this.keySet });
    const logResponse = () => {
      this.logger.info('PubNub', `Remove channels from the channel group success.`);
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
   * Remove channel group.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public deleteGroup(parameters: ChannelGroups.DeleteChannelGroupParameters, callback: StatusCallback): void;

  /**
   * Remove channel group.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous remove channel group response.
   */
  public async deleteGroup(parameters: ChannelGroups.DeleteChannelGroupParameters): Promise<Record<string, unknown>>;

  /**
   * Remove a channel group.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous remove channel group response or `void` in case if `callback` provided.
   */
  public async deleteGroup(
    parameters: ChannelGroups.DeleteChannelGroupParameters,
    callback?: StatusCallback,
  ): Promise<Record<string, unknown> | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Remove a channel group with parameters:',
    }));

    const request = new DeleteChannelGroupRequest({ ...parameters, keySet: this.keySet });
    const logResponse = () => {
      this.logger.info(
        'PubNub',
        `Remove a channel group success. Removed '${parameters.channelGroup}' channel group.'`,
      );
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
