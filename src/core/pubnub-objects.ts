/**
 * PubNub Objects API module.
 */

import { GetAllChannelsMetadataRequest } from './endpoints/objects/channel/get_all';
import { RemoveChannelMetadataRequest } from './endpoints/objects/channel/remove';
import { GetUUIDMembershipsRequest } from './endpoints/objects/membership/get';
import { SetUUIDMembershipsRequest } from './endpoints/objects/membership/set';
import { GetAllUUIDMetadataRequest } from './endpoints/objects/uuid/get_all';
import { GetChannelMetadataRequest } from './endpoints/objects/channel/get';
import { SetChannelMetadataRequest } from './endpoints/objects/channel/set';
import { RemoveUUIDMetadataRequest } from './endpoints/objects/uuid/remove';
import { GetChannelMembersRequest } from './endpoints/objects/member/get';
import { SetChannelMembersRequest } from './endpoints/objects/member/set';
import { KeySet, ResultCallback, SendRequestFunction } from './types/api';
import { GetUUIDMetadataRequest } from './endpoints/objects/uuid/get';
import { PrivateClientConfiguration } from './interfaces/configuration';
import * as AppContext from './types/api/app-context';
import { ChannelMetadataObject } from './types/api/app-context';
import { SetUUIDMetadataRequest } from './endpoints/objects/uuid/set';
import { LoggerManager } from './components/logger-manager';

/**
 * PubNub App Context API interface.
 */
export default class PubNubObjects {
  /**
   * Extended PubNub client configuration object.
   *
   * @internal
   */
  private readonly configuration: PrivateClientConfiguration;

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  /**
   * Function which should be used to send REST API calls.
   *
   * @internal
   */
  private readonly sendRequest: SendRequestFunction<any, any>;
  /**
   * REST API endpoints access credentials.
   *
   * @internal
   */
  private readonly keySet: KeySet;

  /**
   * Create app context API access object.
   *
   * @param configuration - Extended PubNub client configuration object.
   * @param sendRequest - Function which should be used to send REST API calls.
   *
   * @internal
   */
  constructor(
    configuration: PrivateClientConfiguration,
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    sendRequest: SendRequestFunction<any, any>,
  ) {
    this.keySet = configuration.keySet;
    this.configuration = configuration;
    this.sendRequest = sendRequest;
  }

  /**
   * Get registered loggers' manager.
   *
   * @returns Registered loggers' manager.
   *
   * @internal
   */
  get logger(): LoggerManager {
    return this.configuration.logger();
  }

  // --------------------------------------------------------
  // ----------------------- UUID API -----------------------
  // --------------------------------------------------------
  // region UUID API
  // region Get Metadata

  /**
   * Fetch a paginated list of UUID Metadata objects.
   *
   * @param callback - Request completion handler callback.
   */
  public getAllUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    callback: ResultCallback<AppContext.GetAllUUIDMetadataResponse<Custom>>,
  ): void;

  /**
   * Fetch a paginated list of UUID Metadata objects.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getAllUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.GetAllMetadataParameters<AppContext.UUIDMetadataObject<Custom>>,
    callback: ResultCallback<AppContext.GetAllUUIDMetadataResponse<Custom>>,
  ): void;

  /**
   * Fetch a paginated list of UUID Metadata objects.
   *
   * @param [parameters] - Request configuration parameters.
   *
   * @returns Asynchronous get all UUID metadata response.
   */
  public async getAllUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters?: AppContext.GetAllMetadataParameters<AppContext.UUIDMetadataObject<Custom>>,
  ): Promise<AppContext.GetAllUUIDMetadataResponse<Custom>>;

  /**
   * Fetch a paginated list of UUID Metadata objects.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get all UUID metadata response or `void` in case if `callback` provided.
   */
  async getAllUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parametersOrCallback?:
      | AppContext.GetAllMetadataParameters<AppContext.UUIDMetadataObject<Custom>>
      | ResultCallback<AppContext.GetAllUUIDMetadataResponse<Custom>>,
    callback?: ResultCallback<AppContext.GetAllUUIDMetadataResponse<Custom>>,
  ): Promise<AppContext.GetAllUUIDMetadataResponse<Custom> | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: !parametersOrCallback || typeof parametersOrCallback === 'function' ? {} : parametersOrCallback,
      details: `Get all UUID metadata objects with parameters:`,
    }));

    return this._getAllUUIDMetadata(parametersOrCallback, callback);
  }

  /**
   * Fetch a paginated list of UUID Metadata objects.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get all UUID metadata response or `void` in case if `callback` provided.
   *
   * @internal
   */
  async _getAllUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parametersOrCallback?:
      | AppContext.GetAllMetadataParameters<AppContext.UUIDMetadataObject<Custom>>
      | ResultCallback<AppContext.GetAllUUIDMetadataResponse<Custom>>,
    callback?: ResultCallback<AppContext.GetAllUUIDMetadataResponse<Custom>>,
  ): Promise<AppContext.GetAllUUIDMetadataResponse<Custom> | void> {
    // Get user request parameters.
    const parameters: AppContext.GetAllMetadataParameters<AppContext.UUIDMetadataObject<Custom>> =
      parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
    callback ??= typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined;

    const request = new GetAllUUIDMetadataRequest({ ...parameters, keySet: this.keySet });
    const logResponse = (response: AppContext.GetAllUUIDMetadataResponse<Custom> | null) => {
      if (!response) return;

      this.logger.debug(
        'PubNub',
        `Get all UUID metadata success. Received ${response.totalCount} UUID metadata objects.`,
      );
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

  /**
   * Fetch a UUID Metadata object for the currently configured PubNub client `uuid`.
   *
   * @param callback - Request completion handler callback.
   */
  public getUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    callback: ResultCallback<AppContext.GetUUIDMetadataResponse<Custom>>,
  ): void;

  /**
   * Fetch a specific UUID Metadata object.
   *
   * @param parameters - Request configuration parameters. Will fetch a UUID metadata object for
   * a currently configured PubNub client `uuid` if not set.
   * @param callback - Request completion handler callback.
   */
  public getUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.GetUUIDMetadataParameters,
    callback: ResultCallback<AppContext.GetUUIDMetadataResponse<Custom>>,
  ): void;

  /**
   * Fetch a specific UUID Metadata object.
   *
   * @param [parameters] - Request configuration parameters. Will fetch UUID Metadata object for
   * currently configured PubNub client `uuid` if not set.
   *
   * @returns Asynchronous get UUID metadata response.
   */
  public async getUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters?: AppContext.GetUUIDMetadataParameters,
  ): Promise<AppContext.GetUUIDMetadataResponse<Custom>>;

  /**
   * Fetch a specific UUID Metadata object.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get UUID metadata response or `void` in case if `callback` provided.
   */
  async getUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parametersOrCallback?:
      | AppContext.GetUUIDMetadataParameters
      | ResultCallback<AppContext.GetUUIDMetadataResponse<Custom>>,
    callback?: ResultCallback<AppContext.GetUUIDMetadataResponse<Custom>>,
  ): Promise<AppContext.GetUUIDMetadataResponse<Custom> | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message:
        !parametersOrCallback || typeof parametersOrCallback === 'function'
          ? { uuid: this.configuration.userId }
          : parametersOrCallback,
      details: `Get ${
        !parametersOrCallback || typeof parametersOrCallback === 'function' ? ' current' : ''
      } UUID metadata object with parameters:`,
    }));

    return this._getUUIDMetadata(parametersOrCallback, callback);
  }

  /**
   * Fetch a specific UUID Metadata object.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get UUID metadata response or `void` in case if `callback` provided.
   *
   * @internal
   */
  async _getUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parametersOrCallback?:
      | AppContext.GetUUIDMetadataParameters
      | ResultCallback<AppContext.GetUUIDMetadataResponse<Custom>>,
    callback?: ResultCallback<AppContext.GetUUIDMetadataResponse<Custom>>,
  ): Promise<AppContext.GetUUIDMetadataResponse<Custom> | void> {
    // Get user request parameters.
    const parameters: AppContext.GetUUIDMetadataParameters =
      parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
    callback ??= typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined;
    if (parameters.userId) {
      this.logger.warn('PubNub', `'userId' parameter is deprecated. Use 'uuid' instead.`);
      parameters.uuid = parameters.userId;
    }
    parameters.uuid ??= this.configuration.userId;

    const request = new GetUUIDMetadataRequest({ ...parameters, keySet: this.keySet });
    const logResponse = (response: AppContext.GetUUIDMetadataResponse<Custom> | null) => {
      if (!response) return;

      this.logger.debug(
        'PubNub',
        `Get UUID metadata object success. Received '${parameters.uuid}' UUID metadata object.`,
      );
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

  // region Set Metadata
  /**
   * Update a specific UUID Metadata object.
   *
   * @param parameters - Request configuration parameters. Will set UUID metadata for a currently
   * configured PubNub client `uuid` if not set.
   * @param callback - Request completion handler callback.
   */
  public setUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetUUIDMetadataParameters<Custom>,
    callback: ResultCallback<AppContext.SetUUIDMetadataResponse<Custom>>,
  ): void;

  /**
   * Update specific UUID Metadata object.
   *
   * @param parameters - Request configuration parameters. Will set UUID metadata for currently
   * configured PubNub client `uuid` if not set.
   *
   * @returns Asynchronous set UUID metadata response.
   */
  public async setUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetUUIDMetadataParameters<Custom>,
  ): Promise<AppContext.SetUUIDMetadataResponse<Custom>>;

  /**
   * Update a specific UUID Metadata object.
   *
   * @param parameters - Request configuration parameters. Will set UUID metadata for currently
   * configured PubNub client `uuid` if not set.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous set UUID metadata response or `void` in case if `callback` provided.
   */
  async setUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetUUIDMetadataParameters<Custom>,
    callback?: ResultCallback<AppContext.SetUUIDMetadataResponse<Custom>>,
  ): Promise<AppContext.SetUUIDMetadataResponse<Custom> | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: `Set UUID metadata object with parameters:`,
    }));

    return this._setUUIDMetadata(parameters, callback);
  }

  /**
   * Update a specific UUID Metadata object.
   *
   * @internal
   *
   * @param parameters - Request configuration parameters. Will set UUID metadata for currently
   * configured PubNub client `uuid` if not set.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous set UUID metadata response or `void` in case if `callback` provided.
   */
  async _setUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetUUIDMetadataParameters<Custom>,
    callback?: ResultCallback<AppContext.SetUUIDMetadataResponse<Custom>>,
  ): Promise<AppContext.SetUUIDMetadataResponse<Custom> | void> {
    if (parameters.userId) {
      this.logger.warn('PubNub', `'userId' parameter is deprecated. Use 'uuid' instead.`);
      parameters.uuid = parameters.userId;
    }
    parameters.uuid ??= this.configuration.userId;

    const request = new SetUUIDMetadataRequest({ ...parameters, keySet: this.keySet });
    const logResponse = (response: AppContext.SetUUIDMetadataResponse<Custom> | null) => {
      if (!response) return;

      this.logger.debug(
        'PubNub',
        `Set UUID metadata object success. Updated '${parameters.uuid}' UUID metadata object.`,
      );
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

  // region Remove Metadata
  /**
   * Remove a UUID Metadata object for currently configured PubNub client `uuid`.
   *
   * @param callback - Request completion handler callback.
   */
  public removeUUIDMetadata(callback: ResultCallback<AppContext.RemoveUUIDMetadataResponse>): void;

  /**
   * Remove a specific UUID Metadata object.
   *
   * @param parameters - Request configuration parameters. Will remove UUID metadata for currently
   * configured PubNub client `uuid` if not set.
   * @param callback - Request completion handler callback.
   */
  public removeUUIDMetadata(
    parameters: AppContext.RemoveUUIDMetadataParameters,
    callback: ResultCallback<AppContext.RemoveUUIDMetadataResponse>,
  ): void;

  /**
   * Remove a specific UUID Metadata object.
   *
   * @param [parameters] - Request configuration parameters. Will remove UUID metadata for currently
   * configured PubNub client `uuid` if not set.
   *
   * @returns Asynchronous UUID metadata remove response.
   */
  public async removeUUIDMetadata(
    parameters?: AppContext.RemoveUUIDMetadataParameters,
  ): Promise<AppContext.RemoveUUIDMetadataResponse>;

  /**
   * Remove a specific UUID Metadata object.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous UUID metadata remove response or `void` in case if `callback` provided.
   */
  public async removeUUIDMetadata(
    parametersOrCallback?:
      | AppContext.RemoveUUIDMetadataParameters
      | ResultCallback<AppContext.RemoveUUIDMetadataResponse>,
    callback?: ResultCallback<AppContext.RemoveUUIDMetadataResponse>,
  ): Promise<AppContext.RemoveUUIDMetadataResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message:
        !parametersOrCallback || typeof parametersOrCallback === 'function'
          ? { uuid: this.configuration.userId }
          : parametersOrCallback,
      details: `Remove${
        !parametersOrCallback || typeof parametersOrCallback === 'function' ? ' current' : ''
      } UUID metadata object with parameters:`,
    }));

    return this._removeUUIDMetadata(parametersOrCallback, callback);
  }

  /**
   * Remove a specific UUID Metadata object.
   *
   * @internal
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous UUID metadata remove response or `void` in case if `callback` provided.
   */
  public async _removeUUIDMetadata(
    parametersOrCallback?:
      | AppContext.RemoveUUIDMetadataParameters
      | ResultCallback<AppContext.RemoveUUIDMetadataResponse>,
    callback?: ResultCallback<AppContext.RemoveUUIDMetadataResponse>,
  ): Promise<AppContext.RemoveUUIDMetadataResponse | void> {
    // Get user request parameters.
    const parameters: AppContext.RemoveUUIDMetadataParameters =
      parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
    callback ??= typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined;
    if (parameters.userId) {
      this.logger.warn('PubNub', `'userId' parameter is deprecated. Use 'uuid' instead.`);
      parameters.uuid = parameters.userId;
    }
    parameters.uuid ??= this.configuration.userId;

    const request = new RemoveUUIDMetadataRequest({ ...parameters, keySet: this.keySet });
    const logResponse = (response: AppContext.RemoveUUIDMetadataResponse | null) => {
      if (!response) return;

      this.logger.debug(
        'PubNub',
        `Remove UUID metadata object success. Removed '${parameters.uuid}' UUID metadata object.`,
      );
    };

    if (callback)
      return this.sendRequest(request, (status, response: AppContext.RemoveUUIDMetadataResponse | null) => {
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
  // --------------------- Channel API ----------------------
  // --------------------------------------------------------
  // region Channel API
  // region Get Metadata

  /**
   * Fetch a paginated list of Channel Metadata objects.
   *
   * @param callback - Request completion handler callback.
   */
  public getAllChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    callback: ResultCallback<AppContext.GetAllChannelMetadataResponse<Custom>>,
  ): void;

  /**
   * Fetch a paginated list of Channel Metadata objects.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getAllChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.GetAllMetadataParameters<AppContext.ChannelMetadataObject<Custom>>,
    callback: ResultCallback<AppContext.GetAllChannelMetadataResponse<Custom>>,
  ): void;

  /**
   * Fetch a paginated list of Channel Metadata objects.
   *
   * @param [parameters] - Request configuration parameters.
   *
   * @returns Asynchronous get all Channel metadata response.
   */
  public async getAllChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters?: AppContext.GetAllMetadataParameters<AppContext.ChannelMetadataObject<Custom>>,
  ): Promise<AppContext.GetAllChannelMetadataResponse<Custom>>;

  /**
   * Fetch a paginated list of Channel Metadata objects.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get all Channel metadata response or `void` in case if `callback`
   * provided.
   */
  async getAllChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parametersOrCallback?:
      | AppContext.GetAllMetadataParameters<AppContext.ChannelMetadataObject<Custom>>
      | ResultCallback<AppContext.GetAllChannelMetadataResponse<Custom>>,
    callback?: ResultCallback<AppContext.GetAllChannelMetadataResponse<Custom>>,
  ): Promise<AppContext.GetAllChannelMetadataResponse<Custom> | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: !parametersOrCallback || typeof parametersOrCallback === 'function' ? {} : parametersOrCallback,
      details: `Get all Channel metadata objects with parameters:`,
    }));

    return this._getAllChannelMetadata(parametersOrCallback, callback);
  }

  /**
   * Fetch a paginated list of Channel Metadata objects.
   *
   * @internal
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get all Channel metadata response or `void` in case if `callback`
   * provided.
   */
  async _getAllChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parametersOrCallback?:
      | AppContext.GetAllMetadataParameters<AppContext.ChannelMetadataObject<Custom>>
      | ResultCallback<AppContext.GetAllChannelMetadataResponse<Custom>>,
    callback?: ResultCallback<AppContext.GetAllChannelMetadataResponse<Custom>>,
  ): Promise<AppContext.GetAllChannelMetadataResponse<Custom> | void> {
    // Get user request parameters.
    const parameters: AppContext.GetAllMetadataParameters<AppContext.ChannelMetadataObject<Custom>> =
      parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
    callback ??= typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined;

    const request = new GetAllChannelsMetadataRequest({ ...parameters, keySet: this.keySet });
    const logResponse = (response: AppContext.GetAllChannelMetadataResponse<Custom> | null) => {
      if (!response) return;

      this.logger.debug(
        'PubNub',
        `Get all Channel metadata objects success. Received ${response.totalCount} Channel metadata objects.`,
      );
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

  /**
   * Fetch Channel Metadata object.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.GetChannelMetadataParameters,
    callback: ResultCallback<AppContext.GetChannelMetadataResponse<Custom>>,
  ): void;

  /**
   * Fetch a specific Channel Metadata object.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get Channel metadata response.
   */
  public async getChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.GetChannelMetadataParameters,
  ): Promise<AppContext.GetChannelMetadataResponse<Custom>>;

  /**
   * Fetch Channel Metadata object.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get Channel metadata response or `void` in case if `callback` provided.
   */
  async getChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.GetChannelMetadataParameters,
    callback?: ResultCallback<AppContext.GetChannelMetadataResponse<Custom>>,
  ): Promise<AppContext.GetChannelMetadataResponse<Custom> | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: `Get Channel metadata object with parameters:`,
    }));

    return this._getChannelMetadata(parameters, callback);
  }

  /**
   * Fetch Channel Metadata object.
   *
   * @internal
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get Channel metadata response or `void` in case if `callback` provided.
   */
  async _getChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.GetChannelMetadataParameters,
    callback?: ResultCallback<AppContext.GetChannelMetadataResponse<Custom>>,
  ): Promise<AppContext.GetChannelMetadataResponse<Custom> | void> {
    const request = new GetChannelMetadataRequest({ ...parameters, keySet: this.keySet });
    const logResponse = (response: AppContext.GetChannelMetadataResponse<Custom> | null) => {
      if (!response) return;

      this.logger.debug(
        'PubNub',
        `Get Channel metadata object success. Received '${parameters.channel}' Channel metadata object.`,
      );
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

  // region Set Metadata
  /**
   * Update specific Channel Metadata object.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public setChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetChannelMetadataParameters<Custom>,
    callback: ResultCallback<AppContext.SetChannelMetadataResponse<Custom>>,
  ): void;

  /**
   * Update specific Channel Metadata object.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous set Channel metadata response.
   */
  public async setChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetChannelMetadataParameters<Custom>,
  ): Promise<AppContext.SetChannelMetadataResponse<Custom>>;

  /**
   * Update specific Channel Metadata object.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous set Channel metadata response or `void` in case if `callback` provided.
   */
  async setChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetChannelMetadataParameters<Custom>,
    callback?: ResultCallback<AppContext.SetChannelMetadataResponse<Custom>>,
  ): Promise<AppContext.SetChannelMetadataResponse<Custom> | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: `Set Channel metadata object with parameters:`,
    }));

    return this._setChannelMetadata(parameters, callback);
  }

  /**
   * Update specific Channel Metadata object.
   *
   * @internal
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous set Channel metadata response or `void` in case if `callback` provided.
   */
  async _setChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(
    parameters: AppContext.SetChannelMetadataParameters<Custom>,
    callback?: ResultCallback<AppContext.SetChannelMetadataResponse<Custom>>,
  ): Promise<AppContext.SetChannelMetadataResponse<Custom> | void> {
    const request = new SetChannelMetadataRequest({ ...parameters, keySet: this.keySet });
    const logResponse = (response: AppContext.SetChannelMetadataResponse<Custom> | null) => {
      if (!response) return;

      this.logger.debug(
        'PubNub',
        `Set Channel metadata object success. Updated '${parameters.channel}' Channel metadata object.`,
      );
    };

    if (callback)
      return this.sendRequest(request, (status, response: AppContext.SetChannelMetadataResponse<Custom> | null) => {
        logResponse(response);
        callback(status, response);
      });

    return this.sendRequest(request).then((response: AppContext.SetChannelMetadataResponse<Custom>) => {
      logResponse(response);
      return response;
    });
  }
  // endregion

  // region Remove Metadata
  /**
   * Remove Channel Metadata object.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public removeChannelMetadata(
    parameters: AppContext.RemoveChannelMetadataParameters,
    callback: ResultCallback<AppContext.RemoveChannelMetadataResponse>,
  ): void;

  /**
   * Remove a specific Channel Metadata object.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous Channel metadata remove response.
   */
  public async removeChannelMetadata(
    parameters: AppContext.RemoveChannelMetadataParameters,
  ): Promise<AppContext.RemoveChannelMetadataResponse>;

  /**
   * Remove a specific Channel Metadata object.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous Channel metadata remove response or `void` in case if `callback`
   * provided.
   */
  async removeChannelMetadata(
    parameters: AppContext.RemoveChannelMetadataParameters,
    callback?: ResultCallback<AppContext.RemoveChannelMetadataResponse>,
  ): Promise<AppContext.RemoveChannelMetadataResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: `Remove Channel metadata object with parameters:`,
    }));

    return this._removeChannelMetadata(parameters, callback);
  }

  /**
   * Remove a specific Channel Metadata object.
   *
   * @internal
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous Channel metadata remove response or `void` in case if `callback`
   * provided.
   */
  async _removeChannelMetadata(
    parameters: AppContext.RemoveChannelMetadataParameters,
    callback?: ResultCallback<AppContext.RemoveChannelMetadataResponse>,
  ): Promise<AppContext.RemoveChannelMetadataResponse | void> {
    const request = new RemoveChannelMetadataRequest({ ...parameters, keySet: this.keySet });
    const logResponse = (response: AppContext.RemoveChannelMetadataResponse | null) => {
      if (!response) return;

      this.logger.debug(
        'PubNub',
        `Remove Channel metadata object success. Removed '${parameters.channel}' Channel metadata object.`,
      );
    };

    if (callback)
      return this.sendRequest(request, (status, response: AppContext.RemoveChannelMetadataResponse | null) => {
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
  // -------------- Members / Membership API ----------------
  // --------------------------------------------------------
  // region Members API
  // region Get Members

  /**
   * Fetch a paginated list of Channel Member objects.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getChannelMembers<
    MemberCustom extends AppContext.CustomData = AppContext.CustomData,
    UUIDCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.GetMembersParameters,
    callback: ResultCallback<AppContext.GetMembersResponse<MemberCustom, UUIDCustom>>,
  ): void;

  /**
   * Fetch a paginated list of Channel Member objects.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get Channel Members response.
   */
  public async getChannelMembers<
    MemberCustom extends AppContext.CustomData = AppContext.CustomData,
    UUIDCustom extends AppContext.CustomData = AppContext.CustomData,
  >(parameters: AppContext.GetMembersParameters): Promise<AppContext.GetMembersResponse<MemberCustom, UUIDCustom>>;

  /**
   * Fetch a paginated list of Channel Member objects.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get Channel Members response or `void` in case if `callback` provided.
   */
  async getChannelMembers<
    MemberCustom extends AppContext.CustomData = AppContext.CustomData,
    UUIDCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.GetMembersParameters,
    callback?: ResultCallback<AppContext.GetMembersResponse<MemberCustom, UUIDCustom>>,
  ): Promise<AppContext.GetMembersResponse<MemberCustom, UUIDCustom> | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: `Get channel members with parameters:`,
    }));

    const request = new GetChannelMembersRequest({ ...parameters, keySet: this.keySet });
    const logResponse = (response: AppContext.GetMembersResponse<MemberCustom, UUIDCustom> | null) => {
      if (!response) return;

      this.logger.debug('PubNub', `Get channel members success. Received ${response.totalCount} channel members.`);
    };

    if (callback)
      return this.sendRequest(
        request,
        (status, response: AppContext.GetMembersResponse<MemberCustom, UUIDCustom> | null) => {
          logResponse(response);
          callback(status, response);
        },
      );

    return this.sendRequest(request).then((response: AppContext.GetMembersResponse<MemberCustom, UUIDCustom>) => {
      logResponse(response);
      return response;
    });
  }
  // endregion

  // region Set Members
  /**
   * Update specific Channel Members list.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public setChannelMembers<
    MemberCustom extends AppContext.CustomData = AppContext.CustomData,
    UUIDCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.SetChannelMembersParameters<MemberCustom>,
    callback: ResultCallback<AppContext.SetMembersResponse<MemberCustom, UUIDCustom>>,
  ): void;

  /**
   * Update specific Channel Members list.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous update Channel Members list response.
   */
  public async setChannelMembers<
    MemberCustom extends AppContext.CustomData = AppContext.CustomData,
    UUIDCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.SetChannelMembersParameters<MemberCustom>,
  ): Promise<AppContext.SetMembersResponse<MemberCustom, UUIDCustom>>;

  /**
   * Update specific Channel Members list.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous update Channel members list response or `void` in case if `callback`
   * provided.
   */
  async setChannelMembers<
    MemberCustom extends AppContext.CustomData = AppContext.CustomData,
    UUIDCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.SetChannelMembersParameters<MemberCustom>,
    callback?: ResultCallback<AppContext.SetMembersResponse<MemberCustom, UUIDCustom>>,
  ): Promise<AppContext.SetMembersResponse<MemberCustom, UUIDCustom> | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: `Set channel members with parameters:`,
    }));

    const request = new SetChannelMembersRequest({ ...parameters, type: 'set', keySet: this.keySet });
    const logResponse = (response: AppContext.SetMembersResponse<MemberCustom, UUIDCustom> | null) => {
      if (!response) return;

      this.logger.debug('PubNub', `Set channel members success. There are ${response.totalCount} channel members now.`);
    };

    if (callback)
      return this.sendRequest(
        request,
        (status, response: AppContext.SetMembersResponse<MemberCustom, UUIDCustom> | null) => {
          logResponse(response);
          callback(status, response);
        },
      );

    return this.sendRequest(request).then((response: AppContext.SetMembersResponse<MemberCustom, UUIDCustom>) => {
      logResponse(response);
      return response;
    });
  }
  // endregion

  // region Remove Members
  /**
   * Remove Members from the Channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public removeChannelMembers<
    MemberCustom extends AppContext.CustomData = AppContext.CustomData,
    UUIDCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.RemoveMembersParameters,
    callback: ResultCallback<AppContext.RemoveMembersResponse<MemberCustom, UUIDCustom>>,
  ): void;

  /**
   * Remove Members from the Channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous Channel Members remove response.
   */
  public async removeChannelMembers<
    MemberCustom extends AppContext.CustomData = AppContext.CustomData,
    UUIDCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.RemoveMembersParameters,
  ): Promise<AppContext.RemoveMembersResponse<MemberCustom, UUIDCustom>>;

  /**
   * Remove Members from the Channel.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous Channel Members remove response or `void` in case if `callback` provided.
   */
  async removeChannelMembers<
    MemberCustom extends AppContext.CustomData = AppContext.CustomData,
    UUIDCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.RemoveMembersParameters,
    callback?: ResultCallback<AppContext.RemoveMembersResponse<MemberCustom, UUIDCustom>>,
  ): Promise<AppContext.RemoveMembersResponse<MemberCustom, UUIDCustom> | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: `Remove channel members with parameters:`,
    }));

    const request = new SetChannelMembersRequest({ ...parameters, type: 'delete', keySet: this.keySet });
    const logResponse = (response: AppContext.RemoveMembersResponse<MemberCustom, UUIDCustom> | null) => {
      if (!response) return;

      this.logger.debug(
        'PubNub',
        `Remove channel members success. There are ${response.totalCount} channel members now.`,
      );
    };

    if (callback)
      return this.sendRequest(
        request,
        (status, response: AppContext.RemoveMembersResponse<MemberCustom, UUIDCustom> | null) => {
          logResponse(response);
          callback(status, response);
        },
      );

    return this.sendRequest(request).then((response: AppContext.RemoveMembersResponse<MemberCustom, UUIDCustom>) => {
      logResponse(response);
      return response;
    });
  }
  // endregion
  // endregion

  // region Membership API
  // region Get Membership
  /**
   * Fetch a specific UUID Memberships list for currently configured PubNub client `uuid`.
   *
   * @param callback - Request completion handler callback.
   *
   * @returns Asynchronous get UUID Memberships list response or `void` in case if `callback`
   * provided.
   */
  public getMemberships<
    MembershipCustom extends AppContext.CustomData = AppContext.CustomData,
    ChannelCustom extends AppContext.CustomData = AppContext.CustomData,
  >(callback: ResultCallback<AppContext.GetMembershipsResponse<MembershipCustom, ChannelCustom>>): void;

  /**
   * Fetch a specific UUID Memberships list.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getMemberships<
    MembershipCustom extends AppContext.CustomData = AppContext.CustomData,
    ChannelCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.GetMembershipsParameters,
    callback: ResultCallback<AppContext.GetMembershipsResponse<MembershipCustom, ChannelCustom>>,
  ): void;

  /**
   * Fetch a specific UUID Memberships list.
   *
   * @param [parameters] - Request configuration parameters. Will fetch UUID Memberships list for
   * currently configured PubNub client `uuid` if not set.
   *
   * @returns Asynchronous get UUID Memberships list response.
   */
  public async getMemberships<
    MembershipCustom extends AppContext.CustomData = AppContext.CustomData,
    ChannelCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters?: AppContext.GetMembershipsParameters,
  ): Promise<AppContext.GetMembershipsResponse<MembershipCustom, ChannelCustom>>;

  /**
   * Fetch a specific UUID Memberships list.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get UUID Memberships response or `void` in case if `callback` provided.
   */
  async getMemberships<
    MembershipCustom extends AppContext.CustomData = AppContext.CustomData,
    ChannelCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parametersOrCallback?:
      | AppContext.GetMembershipsParameters
      | ResultCallback<AppContext.GetMembershipsResponse<MembershipCustom, ChannelCustom>>,
    callback?: ResultCallback<AppContext.GetMembershipsResponse<MembershipCustom, ChannelCustom>>,
  ): Promise<AppContext.GetMembershipsResponse<MembershipCustom, ChannelCustom> | void> {
    // Get user request parameters.
    const parameters: AppContext.GetMembershipsParameters =
      parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
    callback ??= typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined;
    if (parameters.userId) {
      this.logger.warn('PubNub', `'userId' parameter is deprecated. Use 'uuid' instead.`);
      parameters.uuid = parameters.userId;
    }
    parameters.uuid ??= this.configuration.userId;

    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: `Get memberships with parameters:`,
    }));

    const request = new GetUUIDMembershipsRequest({ ...parameters, keySet: this.keySet });
    const logResponse = (response: AppContext.GetMembershipsResponse<MembershipCustom, ChannelCustom> | null) => {
      if (!response) return;

      this.logger.debug('PubNub', `Get memberships success. Received ${response.totalCount} memberships.`);
    };

    if (callback)
      return this.sendRequest(
        request,
        (status, response: AppContext.GetMembershipsResponse<MembershipCustom, ChannelCustom> | null) => {
          logResponse(response);
          callback(status, response);
        },
      );

    return this.sendRequest(request).then(
      (response: AppContext.GetMembershipsResponse<MembershipCustom, ChannelCustom>) => {
        logResponse(response);
        return response;
      },
    );
  }
  // endregion

  // region Set Membership
  /**
   * Update a specific UUID Memberships list.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public setMemberships<
    MembershipCustom extends AppContext.CustomData = AppContext.CustomData,
    ChannelCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.SetMembershipsParameters<MembershipCustom>,
    callback: ResultCallback<AppContext.SetMembershipsResponse<MembershipCustom, ChannelCustom>>,
  ): void;

  /**
   * Update specific UUID Memberships list.
   *
   * @param parameters - Request configuration parameters or callback from overload.
   *
   * @returns Asynchronous update UUID Memberships list response.
   */
  public async setMemberships<
    MembershipCustom extends AppContext.CustomData = AppContext.CustomData,
    ChannelCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.SetMembershipsParameters<MembershipCustom>,
  ): Promise<AppContext.SetMembershipsResponse<MembershipCustom, ChannelCustom>>;

  /**
   * Update specific UUID Memberships list.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous update UUID Memberships list response or `void` in case if `callback`
   * provided.
   */
  async setMemberships<
    MembershipCustom extends AppContext.CustomData = AppContext.CustomData,
    ChannelCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.SetMembershipsParameters<MembershipCustom>,
    callback?: ResultCallback<AppContext.SetMembershipsResponse<MembershipCustom, ChannelCustom>>,
  ): Promise<AppContext.SetMembershipsResponse<MembershipCustom, ChannelCustom> | void> {
    if (parameters.userId) {
      this.logger.warn('PubNub', `'userId' parameter is deprecated. Use 'uuid' instead.`);
      parameters.uuid = parameters.userId;
    }
    parameters.uuid ??= this.configuration.userId;

    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: `Set memberships with parameters:`,
    }));

    const request = new SetUUIDMembershipsRequest({ ...parameters, type: 'set', keySet: this.keySet });
    const logResponse = (response: AppContext.SetMembershipsResponse<MembershipCustom, ChannelCustom> | null) => {
      if (!response) return;

      this.logger.debug('PubNub', `Set memberships success. There are ${response.totalCount} memberships now.`);
    };

    if (callback)
      return this.sendRequest(
        request,
        (status, response: AppContext.SetMembershipsResponse<MembershipCustom, ChannelCustom> | null) => {
          logResponse(response);
          callback(status, response);
        },
      );

    return this.sendRequest(request).then(
      (response: AppContext.SetMembershipsResponse<MembershipCustom, ChannelCustom>) => {
        logResponse(response);
        return response;
      },
    );
  }
  // endregion

  // region Remove Membership
  /**
   * Remove a specific UUID Memberships.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public removeMemberships<
    MembershipCustom extends AppContext.CustomData = AppContext.CustomData,
    ChannelCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.RemoveMembershipsParameters,
    callback: ResultCallback<AppContext.RemoveMembershipsResponse<MembershipCustom, ChannelCustom>>,
  ): void;

  /**
   * Remove a specific UUID Memberships.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous UUID Memberships remove response.
   */
  public async removeMemberships<
    MembershipCustom extends AppContext.CustomData = AppContext.CustomData,
    ChannelCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.RemoveMembershipsParameters,
  ): Promise<AppContext.RemoveMembershipsResponse<MembershipCustom, ChannelCustom>>;

  /**
   * Remove a specific UUID Memberships.
   *
   * @param parameters - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous UUID Memberships remove response or `void` in case if `callback`
   * provided.
   */
  async removeMemberships<
    MembershipCustom extends AppContext.CustomData = AppContext.CustomData,
    ChannelCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.RemoveMembershipsParameters,
    callback?: ResultCallback<AppContext.RemoveMembershipsResponse<MembershipCustom, ChannelCustom>>,
  ): Promise<AppContext.RemoveMembershipsResponse<MembershipCustom, ChannelCustom> | void> {
    if (parameters.userId) {
      this.logger.warn('PubNub', `'userId' parameter is deprecated. Use 'uuid' instead.`);
      parameters.uuid = parameters.userId;
    }
    parameters.uuid ??= this.configuration.userId;

    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: `Remove memberships with parameters:`,
    }));

    const request = new SetUUIDMembershipsRequest({ ...parameters, type: 'delete', keySet: this.keySet });
    const logResponse = (response: AppContext.RemoveMembershipsResponse<MembershipCustom, ChannelCustom> | null) => {
      if (!response) return;

      this.logger.debug('PubNub', `Remove memberships success. There are ${response.totalCount} memberships now.`);
    };

    if (callback)
      return this.sendRequest(
        request,
        (status, response: AppContext.RemoveMembershipsResponse<MembershipCustom, ChannelCustom> | null) => {
          logResponse(response);
          callback(status, response);
        },
      );

    return this.sendRequest(request).then(
      (response: AppContext.RemoveMembershipsResponse<MembershipCustom, ChannelCustom>) => {
        logResponse(response);
        return response;
      },
    );
  }
  // endregion
  // endregion

  // --------------------------------------------------------
  // --------------------- Deprecated API -------------------
  // --------------------------------------------------------
  // region Deprecated

  /**
   * Fetch paginated list of specific Space members or specific User memberships.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get specific Space members or specific User memberships response.
   *
   * @deprecated Use {@link PubNubObjects#getChannelMembers getChannelMembers} or
   * {@link PubNubObjects#getMemberships getMemberships} methods instead.
   */
  public async fetchMemberships<
    RelationCustom extends AppContext.CustomData = AppContext.CustomData,
    MetadataCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.GetMembershipsParameters | AppContext.GetMembersParameters,
    callback?: ResultCallback<
      | AppContext.SpaceMembershipsResponse<RelationCustom, MetadataCustom>
      | AppContext.UserMembersResponse<RelationCustom, MetadataCustom>
    >,
  ): Promise<
    | AppContext.SpaceMembershipsResponse<RelationCustom, MetadataCustom>
    | AppContext.UserMembersResponse<RelationCustom, MetadataCustom>
    | void
  > {
    this.logger.warn(
      'PubNub',
      "'fetchMemberships' is deprecated. Use 'pubnub.objects.getChannelMembers' or 'pubnub.objects.getMemberships'" +
        ' instead.',
    );
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: `Fetch memberships with parameters:`,
    }));

    if ('spaceId' in parameters) {
      const spaceParameters = parameters as AppContext.GetMembersParameters;
      const mappedParameters = {
        channel: spaceParameters.spaceId ?? spaceParameters.channel,
        filter: spaceParameters.filter,
        limit: spaceParameters.limit,
        page: spaceParameters.page,
        include: { ...spaceParameters.include },
        sort: spaceParameters.sort
          ? Object.fromEntries(
              Object.entries(spaceParameters.sort).map(([key, value]) => [key.replace('user', 'uuid'), value]),
            )
          : undefined,
      } as AppContext.GetMembersParameters;

      // Map Members object to the older version.
      const mapMembers = (response: AppContext.GetMembersResponse<AppContext.CustomData, AppContext.CustomData>) =>
        ({
          status: response.status,
          data: response.data.map((members) => ({
            user: members.uuid,
            custom: members.custom,
            updated: members.updated,
            eTag: members.eTag,
          })),
          totalCount: response.totalCount,
          next: response.next,
          prev: response.prev,
        }) as AppContext.UserMembersResponse<RelationCustom, MetadataCustom>;

      if (callback)
        return this.getChannelMembers(mappedParameters, (status, result) => {
          callback(status, result ? mapMembers(result) : result);
        });
      return this.getChannelMembers(mappedParameters).then(mapMembers);
    }

    const userParameters = parameters as AppContext.GetMembershipsParameters;
    const mappedParameters = {
      uuid: userParameters.userId ?? userParameters.uuid,
      filter: userParameters.filter,
      limit: userParameters.limit,
      page: userParameters.page,
      include: { ...userParameters.include },
      sort: userParameters.sort
        ? Object.fromEntries(
            Object.entries(userParameters.sort).map(([key, value]) => [key.replace('space', 'channel'), value]),
          )
        : undefined,
    } as AppContext.GetMembershipsParameters;

    // Map Memberships object to the older version.
    const mapMemberships = (
      response: AppContext.GetMembershipsResponse<AppContext.CustomData, AppContext.CustomData>,
    ) =>
      ({
        status: response.status,
        data: response.data.map((membership) => ({
          space: membership.channel,
          custom: membership.custom,
          updated: membership.updated,
          eTag: membership.eTag,
        })),
        totalCount: response.totalCount,
        next: response.next,
        prev: response.prev,
      }) as AppContext.SpaceMembershipsResponse<RelationCustom, MetadataCustom>;

    if (callback)
      return this.getMemberships(mappedParameters, (status, result) => {
        callback(status, result ? mapMemberships(result) : result);
      });
    return this.getMemberships(mappedParameters).then(mapMemberships);
  }

  /**
   * Add members to specific Space or memberships specific User.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous add members to specific Space or memberships specific User response or
   * `void` in case if `callback` provided.
   *
   * @deprecated Use {@link PubNubObjects#setChannelMembers setChannelMembers} or
   * {@link PubNubObjects#setMemberships setMemberships} methods instead.
   */
  async addMemberships<
    Custom extends AppContext.CustomData = AppContext.CustomData,
    MetadataCustom extends AppContext.CustomData = AppContext.CustomData,
  >(
    parameters: AppContext.SetMembershipsParameters<Custom> | AppContext.SetChannelMembersParameters<Custom>,
    callback?: ResultCallback<
      AppContext.SetMembershipsResponse<Custom, MetadataCustom> | AppContext.SetMembersResponse<Custom, MetadataCustom>
    >,
  ): Promise<
    | AppContext.SetMembershipsResponse<Custom, MetadataCustom>
    | AppContext.SetMembersResponse<Custom, MetadataCustom>
    | void
  > {
    this.logger.warn(
      'PubNub',
      "'addMemberships' is deprecated. Use 'pubnub.objects.setChannelMembers' or 'pubnub.objects.setMemberships'" +
        ' instead.',
    );
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: `Add memberships with parameters:`,
    }));

    if ('spaceId' in parameters) {
      const spaceParameters = parameters as AppContext.SetChannelMembersParameters<Custom>;
      const mappedParameters = {
        channel: spaceParameters.spaceId ?? spaceParameters.channel,
        uuids:
          spaceParameters.users?.map((user) => {
            if (typeof user === 'string') return user;
            return { id: user.userId, custom: user.custom };
          }) ?? spaceParameters.uuids,
        limit: 0,
      };

      if (callback) return this.setChannelMembers(mappedParameters, callback);
      return this.setChannelMembers(mappedParameters);
    }

    const userParameters = parameters as AppContext.SetMembershipsParameters<Custom>;
    const mappedParameters = {
      uuid: userParameters.userId ?? userParameters.uuid,
      channels:
        userParameters.spaces?.map((space) => {
          if (typeof space === 'string') return space;
          return {
            id: space.spaceId,
            custom: space.custom,
          };
        }) ?? userParameters.channels,
      limit: 0,
    };

    if (callback) return this.setMemberships(mappedParameters, callback);
    return this.setMemberships(mappedParameters);
  }
  // endregion
}
