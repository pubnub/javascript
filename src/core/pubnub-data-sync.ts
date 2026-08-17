/**
 * PubNub DataSync API module.
 */

import { CreateUserRequest } from './endpoints/data_sync/user/create';
import { GetUsersRequest } from './endpoints/data_sync/user/get-all';
import { SetUserRequest } from './endpoints/data_sync/user/set';
import { RemoveUserRequest } from './endpoints/data_sync/user/remove';
import { UpdateUserRequest } from './endpoints/data_sync/user/update';
import { GetUserRequest } from './endpoints/data_sync/user/get';
import { CreateChannelRequest } from './endpoints/data_sync/channel/create';
import { GetChannelsRequest } from './endpoints/data_sync/channel/get-all';
import { SetChannelRequest } from './endpoints/data_sync/channel/set';
import { RemoveChannelRequest } from './endpoints/data_sync/channel/remove';
import { UpdateChannelRequest } from './endpoints/data_sync/channel/update';
import { GetChannelRequest } from './endpoints/data_sync/channel/get';
import { CreateMembershipRequest } from './endpoints/data_sync/membership/create';
import { GetMembershipsRequest } from './endpoints/data_sync/membership/get-all';
import { SetMembershipRequest } from './endpoints/data_sync/membership/set';
import { RemoveMembershipRequest } from './endpoints/data_sync/membership/remove';
import { UpdateMembershipRequest } from './endpoints/data_sync/membership/update';
import { GetMembershipRequest } from './endpoints/data_sync/membership/get';
import { CreateRelationshipRequest } from './endpoints/data_sync/relationship/create';
import { GetRelationshipsRequest } from './endpoints/data_sync/relationship/get-all';
import { SetRelationshipRequest } from './endpoints/data_sync/relationship/set';
import { RemoveRelationshipRequest } from './endpoints/data_sync/relationship/remove';
import { UpdateRelationshipRequest } from './endpoints/data_sync/relationship/update';
import { GetRelationshipRequest } from './endpoints/data_sync/relationship/get';
import { CreateEntityRequest } from './endpoints/data_sync/entity/create';
import { GetEntitiesRequest } from './endpoints/data_sync/entity/get-all';
import { SetEntityRequest } from './endpoints/data_sync/entity/set';
import { RemoveEntityRequest } from './endpoints/data_sync/entity/remove';
import { UpdateEntityRequest } from './endpoints/data_sync/entity/update';
import { GetEntityRequest } from './endpoints/data_sync/entity/get';
import { KeySet, ResultCallback, SendRequestFunction } from './types/api';
import { PrivateClientConfiguration } from './interfaces/configuration';
import * as DataSync from './types/api/data-sync';
import { LoggerManager } from './components/logger-manager';

/**
 * PubNub DataSync API interface.
 */
export default class PubNubDataSync {
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
   * Create DataSync API access object.
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
  // ------------------- Entity API ------------------------
  // --------------------------------------------------------
  // region Entity API

  // region Create Entity

  /**
   * Create a new Entity.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public createEntity(
    parameters: DataSync.CreateEntityParameters,
    callback: ResultCallback<DataSync.CreateEntityResponse>,
  ): void;

  /**
   * Create a new Entity.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous create entity response.
   */
  public async createEntity(parameters: DataSync.CreateEntityParameters): Promise<DataSync.CreateEntityResponse>;

  /**
   * Create a new Entity.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous create entity response or `void` in case if `callback` provided.
   */
  async createEntity(
    parameters: DataSync.CreateEntityParameters,
    callback?: ResultCallback<DataSync.CreateEntityResponse>,
  ): Promise<DataSync.CreateEntityResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Create Entity with parameters:',
    }));

    const request = new CreateEntityRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Get Entity

  /**
   * Get a specific Entity.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getEntity(
    parameters: DataSync.GetEntityParameters,
    callback: ResultCallback<DataSync.GetEntityResponse>,
  ): void;

  /**
   * Get a specific Entity.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get entity response.
   */
  public async getEntity(parameters: DataSync.GetEntityParameters): Promise<DataSync.GetEntityResponse>;

  /**
   * Get a specific Entity.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get entity response or `void` in case if `callback` provided.
   */
  async getEntity(
    parameters: DataSync.GetEntityParameters,
    callback?: ResultCallback<DataSync.GetEntityResponse>,
  ): Promise<DataSync.GetEntityResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Get Entity with parameters:',
    }));

    const request = new GetEntityRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Get Entities

  /**
   * Get a paginated list of Entities for a given Entity Class.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getEntities(
    parameters: DataSync.GetEntitiesParameters,
    callback: ResultCallback<DataSync.GetEntitiesResponse>,
  ): void;

  /**
   * Get a paginated list of Entities for a given Entity Class.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get entities response.
   */
  public async getEntities(parameters: DataSync.GetEntitiesParameters): Promise<DataSync.GetEntitiesResponse>;

  /**
   * Get a paginated list of Entities for a given Entity Class.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get entities response or `void` in case if `callback` provided.
   */
  async getEntities(
    parameters: DataSync.GetEntitiesParameters,
    callback?: ResultCallback<DataSync.GetEntitiesResponse>,
  ): Promise<DataSync.GetEntitiesResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Get Entities with parameters:',
    }));

    const request = new GetEntitiesRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Set Entity

  /**
   * Set an Entity (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public setEntity(
    parameters: DataSync.SetEntityParameters,
    callback: ResultCallback<DataSync.SetEntityResponse>,
  ): void;

  /**
   * Set an Entity (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous set entity response.
   */
  public async setEntity(parameters: DataSync.SetEntityParameters): Promise<DataSync.SetEntityResponse>;

  /**
   * Set an Entity (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous set entity response or `void` in case if `callback` provided.
   */
  async setEntity(
    parameters: DataSync.SetEntityParameters,
    callback?: ResultCallback<DataSync.SetEntityResponse>,
  ): Promise<DataSync.SetEntityResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Set Entity with parameters:',
    }));

    const request = new SetEntityRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Update Entity

  /**
   * Update an Entity (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public updateEntity(
    parameters: DataSync.UpdateEntityParameters,
    callback: ResultCallback<DataSync.UpdateEntityResponse>,
  ): void;

  /**
   * Update an Entity (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous update entity response.
   */
  public async updateEntity(parameters: DataSync.UpdateEntityParameters): Promise<DataSync.UpdateEntityResponse>;

  /**
   * Update an Entity (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous update entity response or `void` in case if `callback` provided.
   */
  async updateEntity(
    parameters: DataSync.UpdateEntityParameters,
    callback?: ResultCallback<DataSync.UpdateEntityResponse>,
  ): Promise<DataSync.UpdateEntityResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Update Entity with parameters:',
    }));

    const request = new UpdateEntityRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Remove Entity

  /**
   * Remove an Entity.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public removeEntity(
    parameters: DataSync.RemoveEntityParameters,
    callback: ResultCallback<DataSync.RemoveEntityResponse>,
  ): void;

  /**
   * Remove an Entity.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous remove entity response.
   */
  public async removeEntity(parameters: DataSync.RemoveEntityParameters): Promise<DataSync.RemoveEntityResponse>;

  /**
   * Remove an Entity.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous remove entity response or `void` in case if `callback` provided.
   */
  async removeEntity(
    parameters: DataSync.RemoveEntityParameters,
    callback?: ResultCallback<DataSync.RemoveEntityResponse>,
  ): Promise<DataSync.RemoveEntityResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Remove Entity with parameters:',
    }));

    const request = new RemoveEntityRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // endregion

  // --------------------------------------------------------
  // --------------- Relationship API ----------------------
  // --------------------------------------------------------
  // region Relationship API

  // region Create Relationship

  /**
   * Create a new Relationship.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public createRelationship(
    parameters: DataSync.CreateRelationshipParameters,
    callback: ResultCallback<DataSync.CreateRelationshipResponse>,
  ): void;

  /**
   * Create a new Relationship.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous create relationship response.
   */
  public async createRelationship(
    parameters: DataSync.CreateRelationshipParameters,
  ): Promise<DataSync.CreateRelationshipResponse>;

  /**
   * Create a new Relationship.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous create relationship response or `void` in case if `callback` provided.
   */
  async createRelationship(
    parameters: DataSync.CreateRelationshipParameters,
    callback?: ResultCallback<DataSync.CreateRelationshipResponse>,
  ): Promise<DataSync.CreateRelationshipResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Create Relationship with parameters:',
    }));

    const request = new CreateRelationshipRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Get Relationship

  /**
   * Get a specific Relationship.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getRelationship(
    parameters: DataSync.GetRelationshipParameters,
    callback: ResultCallback<DataSync.GetRelationshipResponse>,
  ): void;

  /**
   * Get a specific Relationship.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get relationship response.
   */
  public async getRelationship(
    parameters: DataSync.GetRelationshipParameters,
  ): Promise<DataSync.GetRelationshipResponse>;

  /**
   * Get a specific Relationship.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get relationship response or `void` in case if `callback` provided.
   */
  async getRelationship(
    parameters: DataSync.GetRelationshipParameters,
    callback?: ResultCallback<DataSync.GetRelationshipResponse>,
  ): Promise<DataSync.GetRelationshipResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Get Relationship with parameters:',
    }));

    const request = new GetRelationshipRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Get Relationships

  /**
   * Get a paginated list of Relationships.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getRelationships(
    parameters: DataSync.GetRelationshipsParameters,
    callback: ResultCallback<DataSync.GetRelationshipsResponse>,
  ): void;

  /**
   * Get a paginated list of Relationships.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get relationships response.
   */
  public async getRelationships(
    parameters: DataSync.GetRelationshipsParameters,
  ): Promise<DataSync.GetRelationshipsResponse>;

  /**
   * Get a paginated list of Relationships.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get relationships response or `void` in case if `callback` provided.
   */
  async getRelationships(
    parameters: DataSync.GetRelationshipsParameters,
    callback?: ResultCallback<DataSync.GetRelationshipsResponse>,
  ): Promise<DataSync.GetRelationshipsResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Get Relationships with parameters:',
    }));

    const request = new GetRelationshipsRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Set Relationship

  /**
   * Set a Relationship (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public setRelationship(
    parameters: DataSync.SetRelationshipParameters,
    callback: ResultCallback<DataSync.SetRelationshipResponse>,
  ): void;

  /**
   * Set a Relationship (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous set relationship response.
   */
  public async setRelationship(
    parameters: DataSync.SetRelationshipParameters,
  ): Promise<DataSync.SetRelationshipResponse>;

  /**
   * Set a Relationship (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous set relationship response or `void` in case if `callback` provided.
   */
  async setRelationship(
    parameters: DataSync.SetRelationshipParameters,
    callback?: ResultCallback<DataSync.SetRelationshipResponse>,
  ): Promise<DataSync.SetRelationshipResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Set Relationship with parameters:',
    }));

    const request = new SetRelationshipRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Update Relationship

  /**
   * Update a Relationship (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public updateRelationship(
    parameters: DataSync.UpdateRelationshipParameters,
    callback: ResultCallback<DataSync.UpdateRelationshipResponse>,
  ): void;

  /**
   * Update a Relationship (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous update relationship response.
   */
  public async updateRelationship(
    parameters: DataSync.UpdateRelationshipParameters,
  ): Promise<DataSync.UpdateRelationshipResponse>;

  /**
   * Update a Relationship (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous update relationship response or `void` in case if `callback` provided.
   */
  async updateRelationship(
    parameters: DataSync.UpdateRelationshipParameters,
    callback?: ResultCallback<DataSync.UpdateRelationshipResponse>,
  ): Promise<DataSync.UpdateRelationshipResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Update Relationship with parameters:',
    }));

    const request = new UpdateRelationshipRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Remove Relationship

  /**
   * Remove a Relationship.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public removeRelationship(
    parameters: DataSync.RemoveRelationshipParameters,
    callback: ResultCallback<DataSync.RemoveRelationshipResponse>,
  ): void;

  /**
   * Remove a Relationship.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous remove relationship response.
   */
  public async removeRelationship(
    parameters: DataSync.RemoveRelationshipParameters,
  ): Promise<DataSync.RemoveRelationshipResponse>;

  /**
   * Remove a Relationship.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous remove relationship response or `void` in case if `callback` provided.
   */
  async removeRelationship(
    parameters: DataSync.RemoveRelationshipParameters,
    callback?: ResultCallback<DataSync.RemoveRelationshipResponse>,
  ): Promise<DataSync.RemoveRelationshipResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Remove Relationship with parameters:',
    }));

    const request = new RemoveRelationshipRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // endregion

  // --------------------------------------------------------
  // -------------------- User API -------------------------
  // --------------------------------------------------------
  // region User API

  // region Create User

  /**
   * Create a new User.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public createUser(
    parameters: DataSync.CreateUserParameters,
    callback: ResultCallback<DataSync.CreateUserResponse>,
  ): void;

  /**
   * Create a new User.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous create user response.
   */
  public async createUser(parameters: DataSync.CreateUserParameters): Promise<DataSync.CreateUserResponse>;

  /**
   * Create a new User.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous create user response or `void` in case if `callback` provided.
   */
  async createUser(
    parameters: DataSync.CreateUserParameters,
    callback?: ResultCallback<DataSync.CreateUserResponse>,
  ): Promise<DataSync.CreateUserResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Create User with parameters:',
    }));

    const request = new CreateUserRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Get User

  /**
   * Get a specific User.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getUser(parameters: DataSync.GetUserParameters, callback: ResultCallback<DataSync.GetUserResponse>): void;

  /**
   * Get a specific User.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get user response.
   */
  public async getUser(parameters: DataSync.GetUserParameters): Promise<DataSync.GetUserResponse>;

  /**
   * Get a specific User.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get user response or `void` in case if `callback` provided.
   */
  async getUser(
    parameters: DataSync.GetUserParameters,
    callback?: ResultCallback<DataSync.GetUserResponse>,
  ): Promise<DataSync.GetUserResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Get User with parameters:',
    }));

    const request = new GetUserRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Get Users

  /**
   * Get a paginated list of Users.
   *
   * @param callback - Request completion handler callback.
   */
  public getUsers(callback: ResultCallback<DataSync.GetUsersResponse>): void;

  /**
   * Get a paginated list of Users.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getUsers(parameters: DataSync.GetUsersParameters, callback: ResultCallback<DataSync.GetUsersResponse>): void;

  /**
   * Get a paginated list of Users.
   *
   * @param [parameters] - Request configuration parameters.
   *
   * @returns Asynchronous get users response.
   */
  public async getUsers(parameters?: DataSync.GetUsersParameters): Promise<DataSync.GetUsersResponse>;

  /**
   * Get a paginated list of Users.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get users response or `void` in case if `callback` provided.
   */
  async getUsers(
    parametersOrCallback?: DataSync.GetUsersParameters | ResultCallback<DataSync.GetUsersResponse>,
    callback?: ResultCallback<DataSync.GetUsersResponse>,
  ): Promise<DataSync.GetUsersResponse | void> {
    const parameters: DataSync.GetUsersParameters =
      parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
    callback ??= typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined;

    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Get Users with parameters:',
    }));

    const request = new GetUsersRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Set User

  /**
   * Set a User (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public setUser(parameters: DataSync.SetUserParameters, callback: ResultCallback<DataSync.SetUserResponse>): void;

  /**
   * Set a User (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous set user response.
   */
  public async setUser(parameters: DataSync.SetUserParameters): Promise<DataSync.SetUserResponse>;

  /**
   * Set a User (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous set user response or `void` in case if `callback` provided.
   */
  async setUser(
    parameters: DataSync.SetUserParameters,
    callback?: ResultCallback<DataSync.SetUserResponse>,
  ): Promise<DataSync.SetUserResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Set User with parameters:',
    }));

    const request = new SetUserRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Update User

  /**
   * Update a User (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public updateUser(
    parameters: DataSync.UpdateUserParameters,
    callback: ResultCallback<DataSync.UpdateUserResponse>,
  ): void;

  /**
   * Update a User (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous update user response.
   */
  public async updateUser(parameters: DataSync.UpdateUserParameters): Promise<DataSync.UpdateUserResponse>;

  /**
   * Update a User (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous update user response or `void` in case if `callback` provided.
   */
  async updateUser(
    parameters: DataSync.UpdateUserParameters,
    callback?: ResultCallback<DataSync.UpdateUserResponse>,
  ): Promise<DataSync.UpdateUserResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Update User with parameters:',
    }));

    const request = new UpdateUserRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Remove User

  /**
   * Remove a User.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public removeUser(
    parameters: DataSync.RemoveUserParameters,
    callback: ResultCallback<DataSync.RemoveUserResponse>,
  ): void;

  /**
   * Remove a User.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous remove user response.
   */
  public async removeUser(parameters: DataSync.RemoveUserParameters): Promise<DataSync.RemoveUserResponse>;

  /**
   * Remove a User.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous remove user response or `void` in case if `callback` provided.
   */
  async removeUser(
    parameters: DataSync.RemoveUserParameters,
    callback?: ResultCallback<DataSync.RemoveUserResponse>,
  ): Promise<DataSync.RemoveUserResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Remove User with parameters:',
    }));

    const request = new RemoveUserRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // endregion

  // --------------------------------------------------------
  // ------------------ Channel API ------------------------
  // --------------------------------------------------------
  // region Channel API

  // region Create Channel

  /**
   * Create a new Channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public createChannel(
    parameters: DataSync.CreateChannelParameters,
    callback: ResultCallback<DataSync.CreateChannelResponse>,
  ): void;

  /**
   * Create a new Channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous create channel response.
   */
  public async createChannel(parameters: DataSync.CreateChannelParameters): Promise<DataSync.CreateChannelResponse>;

  /**
   * Create a new Channel.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous create channel response or `void` in case if `callback` provided.
   */
  async createChannel(
    parameters: DataSync.CreateChannelParameters,
    callback?: ResultCallback<DataSync.CreateChannelResponse>,
  ): Promise<DataSync.CreateChannelResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Create Channel with parameters:',
    }));

    const request = new CreateChannelRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Get Channel

  /**
   * Get a specific Channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getChannel(
    parameters: DataSync.GetChannelParameters,
    callback: ResultCallback<DataSync.GetChannelResponse>,
  ): void;

  /**
   * Get a specific Channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get channel response.
   */
  public async getChannel(parameters: DataSync.GetChannelParameters): Promise<DataSync.GetChannelResponse>;

  /**
   * Get a specific Channel.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get channel response or `void` in case if `callback` provided.
   */
  async getChannel(
    parameters: DataSync.GetChannelParameters,
    callback?: ResultCallback<DataSync.GetChannelResponse>,
  ): Promise<DataSync.GetChannelResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Get Channel with parameters:',
    }));

    const request = new GetChannelRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Get Channels

  /**
   * Get a paginated list of Channels.
   *
   * @param callback - Request completion handler callback.
   */
  public getChannels(callback: ResultCallback<DataSync.GetChannelsResponse>): void;

  /**
   * Get a paginated list of Channels.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getChannels(
    parameters: DataSync.GetChannelsParameters,
    callback: ResultCallback<DataSync.GetChannelsResponse>,
  ): void;

  /**
   * Get a paginated list of Channels.
   *
   * @param [parameters] - Request configuration parameters.
   *
   * @returns Asynchronous get channels response.
   */
  public async getChannels(parameters?: DataSync.GetChannelsParameters): Promise<DataSync.GetChannelsResponse>;

  /**
   * Get a paginated list of Channels.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get channels response or `void` in case if `callback` provided.
   */
  async getChannels(
    parametersOrCallback?: DataSync.GetChannelsParameters | ResultCallback<DataSync.GetChannelsResponse>,
    callback?: ResultCallback<DataSync.GetChannelsResponse>,
  ): Promise<DataSync.GetChannelsResponse | void> {
    const parameters: DataSync.GetChannelsParameters =
      parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
    callback ??= typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined;

    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Get Channels with parameters:',
    }));

    const request = new GetChannelsRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Set Channel

  /**
   * Set a Channel (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public setChannel(
    parameters: DataSync.SetChannelParameters,
    callback: ResultCallback<DataSync.SetChannelResponse>,
  ): void;

  /**
   * Set a Channel (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous set channel response.
   */
  public async setChannel(parameters: DataSync.SetChannelParameters): Promise<DataSync.SetChannelResponse>;

  /**
   * Set a Channel (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous set channel response or `void` in case if `callback` provided.
   */
  async setChannel(
    parameters: DataSync.SetChannelParameters,
    callback?: ResultCallback<DataSync.SetChannelResponse>,
  ): Promise<DataSync.SetChannelResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Set Channel with parameters:',
    }));

    const request = new SetChannelRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Update Channel

  /**
   * Update a Channel (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public updateChannel(
    parameters: DataSync.UpdateChannelParameters,
    callback: ResultCallback<DataSync.UpdateChannelResponse>,
  ): void;

  /**
   * Update a Channel (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous update channel response.
   */
  public async updateChannel(parameters: DataSync.UpdateChannelParameters): Promise<DataSync.UpdateChannelResponse>;

  /**
   * Update a Channel (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous update channel response or `void` in case if `callback` provided.
   */
  async updateChannel(
    parameters: DataSync.UpdateChannelParameters,
    callback?: ResultCallback<DataSync.UpdateChannelResponse>,
  ): Promise<DataSync.UpdateChannelResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Update Channel with parameters:',
    }));

    const request = new UpdateChannelRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Remove Channel

  /**
   * Remove a Channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public removeChannel(
    parameters: DataSync.RemoveChannelParameters,
    callback: ResultCallback<DataSync.RemoveChannelResponse>,
  ): void;

  /**
   * Remove a Channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous remove channel response.
   */
  public async removeChannel(parameters: DataSync.RemoveChannelParameters): Promise<DataSync.RemoveChannelResponse>;

  /**
   * Remove a Channel.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous remove channel response or `void` in case if `callback` provided.
   */
  async removeChannel(
    parameters: DataSync.RemoveChannelParameters,
    callback?: ResultCallback<DataSync.RemoveChannelResponse>,
  ): Promise<DataSync.RemoveChannelResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Remove Channel with parameters:',
    }));

    const request = new RemoveChannelRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // endregion

  // --------------------------------------------------------
  // ----------------- Membership API ----------------------
  // --------------------------------------------------------
  // region Membership API

  // region Create Membership

  /**
   * Create a new Membership (associates a User with a Channel).
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public createMembership(
    parameters: DataSync.CreateMembershipParameters,
    callback: ResultCallback<DataSync.CreateMembershipResponse>,
  ): void;

  /**
   * Create a new Membership (associates a User with a Channel).
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous create membership response.
   */
  public async createMembership(
    parameters: DataSync.CreateMembershipParameters,
  ): Promise<DataSync.CreateMembershipResponse>;

  /**
   * Create a new Membership (associates a User with a Channel).
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous create membership response or `void` in case if `callback` provided.
   */
  async createMembership(
    parameters: DataSync.CreateMembershipParameters,
    callback?: ResultCallback<DataSync.CreateMembershipResponse>,
  ): Promise<DataSync.CreateMembershipResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Create Membership with parameters:',
    }));

    const request = new CreateMembershipRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Get Membership

  /**
   * Get a specific Membership.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getMembership(
    parameters: DataSync.GetMembershipParameters,
    callback: ResultCallback<DataSync.GetMembershipResponse>,
  ): void;

  /**
   * Get a specific Membership.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get membership response.
   */
  public async getMembership(parameters: DataSync.GetMembershipParameters): Promise<DataSync.GetMembershipResponse>;

  /**
   * Get a specific Membership.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get membership response or `void` in case if `callback` provided.
   */
  async getMembership(
    parameters: DataSync.GetMembershipParameters,
    callback?: ResultCallback<DataSync.GetMembershipResponse>,
  ): Promise<DataSync.GetMembershipResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Get Membership with parameters:',
    }));

    const request = new GetMembershipRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Get Memberships

  /**
   * Get a paginated list of Memberships.
   *
   * @param callback - Request completion handler callback.
   */
  public getMemberships(callback: ResultCallback<DataSync.GetMembershipsResponse>): void;

  /**
   * Get a paginated list of Memberships.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getMemberships(
    parameters: DataSync.GetMembershipsParameters,
    callback: ResultCallback<DataSync.GetMembershipsResponse>,
  ): void;

  /**
   * Get a paginated list of Memberships.
   *
   * @param [parameters] - Request configuration parameters.
   *
   * @returns Asynchronous get memberships response.
   */
  public async getMemberships(parameters?: DataSync.GetMembershipsParameters): Promise<DataSync.GetMembershipsResponse>;

  /**
   * Get a paginated list of Memberships.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get memberships response or `void` in case if `callback` provided.
   */
  async getMemberships(
    parametersOrCallback?: DataSync.GetMembershipsParameters | ResultCallback<DataSync.GetMembershipsResponse>,
    callback?: ResultCallback<DataSync.GetMembershipsResponse>,
  ): Promise<DataSync.GetMembershipsResponse | void> {
    const parameters: DataSync.GetMembershipsParameters =
      parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
    callback ??= typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined;

    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Get Memberships with parameters:',
    }));

    const request = new GetMembershipsRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Set Membership

  /**
   * Set a Membership (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public setMembership(
    parameters: DataSync.SetMembershipParameters,
    callback: ResultCallback<DataSync.SetMembershipResponse>,
  ): void;

  /**
   * Set a Membership (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous set membership response.
   */
  public async setMembership(parameters: DataSync.SetMembershipParameters): Promise<DataSync.SetMembershipResponse>;

  /**
   * Set a Membership (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous set membership response or `void` in case if `callback` provided.
   */
  async setMembership(
    parameters: DataSync.SetMembershipParameters,
    callback?: ResultCallback<DataSync.SetMembershipResponse>,
  ): Promise<DataSync.SetMembershipResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Set Membership with parameters:',
    }));

    const request = new SetMembershipRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Update Membership

  /**
   * Update a Membership (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public updateMembership(
    parameters: DataSync.UpdateMembershipParameters,
    callback: ResultCallback<DataSync.UpdateMembershipResponse>,
  ): void;

  /**
   * Update a Membership (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous update membership response.
   */
  public async updateMembership(
    parameters: DataSync.UpdateMembershipParameters,
  ): Promise<DataSync.UpdateMembershipResponse>;

  /**
   * Update a Membership (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous update membership response or `void` in case if `callback` provided.
   */
  async updateMembership(
    parameters: DataSync.UpdateMembershipParameters,
    callback?: ResultCallback<DataSync.UpdateMembershipResponse>,
  ): Promise<DataSync.UpdateMembershipResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Update Membership with parameters:',
    }));

    const request = new UpdateMembershipRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Remove Membership

  /**
   * Remove a Membership.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public removeMembership(
    parameters: DataSync.RemoveMembershipParameters,
    callback: ResultCallback<DataSync.RemoveMembershipResponse>,
  ): void;

  /**
   * Remove a Membership.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous remove membership response.
   */
  public async removeMembership(
    parameters: DataSync.RemoveMembershipParameters,
  ): Promise<DataSync.RemoveMembershipResponse>;

  /**
   * Remove a Membership.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous remove membership response or `void` in case if `callback` provided.
   */
  async removeMembership(
    parameters: DataSync.RemoveMembershipParameters,
    callback?: ResultCallback<DataSync.RemoveMembershipResponse>,
  ): Promise<DataSync.RemoveMembershipResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Remove Membership with parameters:',
    }));

    const request = new RemoveMembershipRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // endregion
}
