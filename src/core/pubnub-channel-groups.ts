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

export default class PubnubChannelGroups {
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
    const request = new ListChannelGroupChannels({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
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
    const request = new ListChannelGroupsRequest({ keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
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
    const request = new AddChannelGroupChannelsRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
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
    const request = new RemoveChannelGroupChannelsRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
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
   * Remove channel group.
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
    const request = new DeleteChannelGroupRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
}
