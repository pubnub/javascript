/**
 * PubNub DataSync API module.
 */

import { CreateUserRequest } from './endpoints/data_sync/user/create';
import { GetAllUsersRequest } from './endpoints/data_sync/user/get-all';
import { UpdateUserRequest } from './endpoints/data_sync/user/update';
import { RemoveUserRequest } from './endpoints/data_sync/user/remove';
import { PatchUserRequest } from './endpoints/data_sync/user/patch';
import { GetUserRequest } from './endpoints/data_sync/user/get';
import { CreateChannelRequest } from './endpoints/data_sync/channel/create';
import { GetAllChannelsRequest } from './endpoints/data_sync/channel/get-all';
import { UpdateChannelRequest } from './endpoints/data_sync/channel/update';
import { RemoveChannelRequest } from './endpoints/data_sync/channel/remove';
import { PatchChannelRequest } from './endpoints/data_sync/channel/patch';
import { GetChannelRequest } from './endpoints/data_sync/channel/get';
import { CreateMembershipRequest } from './endpoints/data_sync/membership/create';
import { GetAllMembershipsRequest } from './endpoints/data_sync/membership/get-all';
import { UpdateMembershipRequest } from './endpoints/data_sync/membership/update';
import { RemoveMembershipRequest } from './endpoints/data_sync/membership/remove';
import { PatchMembershipRequest } from './endpoints/data_sync/membership/patch';
import { GetMembershipRequest } from './endpoints/data_sync/membership/get';
import { CreateRelationshipRequest } from './endpoints/data_sync/relationship/create';
import { GetAllRelationshipsRequest } from './endpoints/data_sync/relationship/get-all';
import { UpdateRelationshipRequest } from './endpoints/data_sync/relationship/update';
import { RemoveRelationshipRequest } from './endpoints/data_sync/relationship/remove';
import { PatchRelationshipRequest } from './endpoints/data_sync/relationship/patch';
import { GetRelationshipRequest } from './endpoints/data_sync/relationship/get';
import { CreateEntityRequest } from './endpoints/data_sync/entity/create';
import { GetAllEntitiesRequest } from './endpoints/data_sync/entity/get-all';
import { UpdateEntityRequest } from './endpoints/data_sync/entity/update';
import { RemoveEntityRequest } from './endpoints/data_sync/entity/remove';
import { PatchEntityRequest } from './endpoints/data_sync/entity/patch';
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
   * Fetch a specific Entity.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getEntity(
    parameters: DataSync.GetEntityParameters,
    callback: ResultCallback<DataSync.GetEntityResponse>,
  ): void;

  /**
   * Fetch a specific Entity.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get entity response.
   */
  public async getEntity(parameters: DataSync.GetEntityParameters): Promise<DataSync.GetEntityResponse>;

  /**
   * Fetch a specific Entity.
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
  // region Get All Entities

  /**
   * Fetch a paginated list of Entities for a given Entity Class.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getAllEntities(
    parameters: DataSync.GetAllEntitiesParameters,
    callback: ResultCallback<DataSync.GetAllEntitiesResponse>,
  ): void;

  /**
   * Fetch a paginated list of Entities for a given Entity Class.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get all entities response.
   */
  public async getAllEntities(parameters: DataSync.GetAllEntitiesParameters): Promise<DataSync.GetAllEntitiesResponse>;

  /**
   * Fetch a paginated list of Entities for a given Entity Class.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get all entities response or `void` in case if `callback` provided.
   */
  async getAllEntities(
    parameters: DataSync.GetAllEntitiesParameters,
    callback?: ResultCallback<DataSync.GetAllEntitiesResponse>,
  ): Promise<DataSync.GetAllEntitiesResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Get all Entities with parameters:',
    }));

    const request = new GetAllEntitiesRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Update Entity

  /**
   * Update an Entity (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public updateEntity(
    parameters: DataSync.UpdateEntityParameters,
    callback: ResultCallback<DataSync.UpdateEntityResponse>,
  ): void;

  /**
   * Update an Entity (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous update entity response.
   */
  public async updateEntity(parameters: DataSync.UpdateEntityParameters): Promise<DataSync.UpdateEntityResponse>;

  /**
   * Update an Entity (full replacement via PUT).
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
  // region Patch Entity

  /**
   * Patch an Entity (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public patchEntity(
    parameters: DataSync.PatchEntityParameters,
    callback: ResultCallback<DataSync.PatchEntityResponse>,
  ): void;

  /**
   * Patch an Entity (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous patch entity response.
   */
  public async patchEntity(parameters: DataSync.PatchEntityParameters): Promise<DataSync.PatchEntityResponse>;

  /**
   * Patch an Entity (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous patch entity response or `void` in case if `callback` provided.
   */
  async patchEntity(
    parameters: DataSync.PatchEntityParameters,
    callback?: ResultCallback<DataSync.PatchEntityResponse>,
  ): Promise<DataSync.PatchEntityResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Patch Entity with parameters:',
    }));

    const request = new PatchEntityRequest({ ...parameters, keySet: this.keySet });

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
   * Fetch a specific Relationship.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getRelationship(
    parameters: DataSync.GetRelationshipParameters,
    callback: ResultCallback<DataSync.GetRelationshipResponse>,
  ): void;

  /**
   * Fetch a specific Relationship.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get relationship response.
   */
  public async getRelationship(
    parameters: DataSync.GetRelationshipParameters,
  ): Promise<DataSync.GetRelationshipResponse>;

  /**
   * Fetch a specific Relationship.
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
  // region Get All Relationships

  /**
   * Fetch a paginated list of Relationships.
   *
   * @param callback - Request completion handler callback.
   */
  public getAllRelationships(callback: ResultCallback<DataSync.GetAllRelationshipsResponse>): void;

  /**
   * Fetch a paginated list of Relationships.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getAllRelationships(
    parameters: DataSync.GetAllRelationshipsParameters,
    callback: ResultCallback<DataSync.GetAllRelationshipsResponse>,
  ): void;

  /**
   * Fetch a paginated list of Relationships.
   *
   * @param [parameters] - Request configuration parameters.
   *
   * @returns Asynchronous get all relationships response.
   */
  public async getAllRelationships(
    parameters?: DataSync.GetAllRelationshipsParameters,
  ): Promise<DataSync.GetAllRelationshipsResponse>;

  /**
   * Fetch a paginated list of Relationships.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get all relationships response or `void` in case if `callback` provided.
   */
  async getAllRelationships(
    parametersOrCallback?:
      | DataSync.GetAllRelationshipsParameters
      | ResultCallback<DataSync.GetAllRelationshipsResponse>,
    callback?: ResultCallback<DataSync.GetAllRelationshipsResponse>,
  ): Promise<DataSync.GetAllRelationshipsResponse | void> {
    const parameters: DataSync.GetAllRelationshipsParameters =
      parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
    callback ??= typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined;

    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Get all Relationships with parameters:',
    }));

    const request = new GetAllRelationshipsRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Update Relationship

  /**
   * Update a Relationship (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public updateRelationship(
    parameters: DataSync.UpdateRelationshipParameters,
    callback: ResultCallback<DataSync.UpdateRelationshipResponse>,
  ): void;

  /**
   * Update a Relationship (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous update relationship response.
   */
  public async updateRelationship(
    parameters: DataSync.UpdateRelationshipParameters,
  ): Promise<DataSync.UpdateRelationshipResponse>;

  /**
   * Update a Relationship (full replacement via PUT).
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
  // region Patch Relationship

  /**
   * Patch a Relationship (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public patchRelationship(
    parameters: DataSync.PatchRelationshipParameters,
    callback: ResultCallback<DataSync.PatchRelationshipResponse>,
  ): void;

  /**
   * Patch a Relationship (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous patch relationship response.
   */
  public async patchRelationship(
    parameters: DataSync.PatchRelationshipParameters,
  ): Promise<DataSync.PatchRelationshipResponse>;

  /**
   * Patch a Relationship (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous patch relationship response or `void` in case if `callback` provided.
   */
  async patchRelationship(
    parameters: DataSync.PatchRelationshipParameters,
    callback?: ResultCallback<DataSync.PatchRelationshipResponse>,
  ): Promise<DataSync.PatchRelationshipResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Patch Relationship with parameters:',
    }));

    const request = new PatchRelationshipRequest({ ...parameters, keySet: this.keySet });

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
   * Fetch a specific User.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getUser(parameters: DataSync.GetUserParameters, callback: ResultCallback<DataSync.GetUserResponse>): void;

  /**
   * Fetch a specific User.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get user response.
   */
  public async getUser(parameters: DataSync.GetUserParameters): Promise<DataSync.GetUserResponse>;

  /**
   * Fetch a specific User.
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
  // region Get All Users

  /**
   * Fetch a paginated list of Users.
   *
   * @param callback - Request completion handler callback.
   */
  public getAllUsers(callback: ResultCallback<DataSync.GetAllUsersResponse>): void;

  /**
   * Fetch a paginated list of Users.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getAllUsers(
    parameters: DataSync.GetAllUsersParameters,
    callback: ResultCallback<DataSync.GetAllUsersResponse>,
  ): void;

  /**
   * Fetch a paginated list of Users.
   *
   * @param [parameters] - Request configuration parameters.
   *
   * @returns Asynchronous get all users response.
   */
  public async getAllUsers(parameters?: DataSync.GetAllUsersParameters): Promise<DataSync.GetAllUsersResponse>;

  /**
   * Fetch a paginated list of Users.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get all users response or `void` in case if `callback` provided.
   */
  async getAllUsers(
    parametersOrCallback?: DataSync.GetAllUsersParameters | ResultCallback<DataSync.GetAllUsersResponse>,
    callback?: ResultCallback<DataSync.GetAllUsersResponse>,
  ): Promise<DataSync.GetAllUsersResponse | void> {
    const parameters: DataSync.GetAllUsersParameters =
      parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
    callback ??= typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined;

    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Get all Users with parameters:',
    }));

    const request = new GetAllUsersRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Update User

  /**
   * Update a User (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public updateUser(
    parameters: DataSync.UpdateUserParameters,
    callback: ResultCallback<DataSync.UpdateUserResponse>,
  ): void;

  /**
   * Update a User (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous update user response.
   */
  public async updateUser(parameters: DataSync.UpdateUserParameters): Promise<DataSync.UpdateUserResponse>;

  /**
   * Update a User (full replacement via PUT).
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
  // region Patch User

  /**
   * Patch a User (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public patchUser(
    parameters: DataSync.PatchUserParameters,
    callback: ResultCallback<DataSync.PatchUserResponse>,
  ): void;

  /**
   * Patch a User (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous patch user response.
   */
  public async patchUser(parameters: DataSync.PatchUserParameters): Promise<DataSync.PatchUserResponse>;

  /**
   * Patch a User (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous patch user response or `void` in case if `callback` provided.
   */
  async patchUser(
    parameters: DataSync.PatchUserParameters,
    callback?: ResultCallback<DataSync.PatchUserResponse>,
  ): Promise<DataSync.PatchUserResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Patch User with parameters:',
    }));

    const request = new PatchUserRequest({ ...parameters, keySet: this.keySet });

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
   * Fetch a specific Channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getChannel(
    parameters: DataSync.GetChannelParameters,
    callback: ResultCallback<DataSync.GetChannelResponse>,
  ): void;

  /**
   * Fetch a specific Channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get channel response.
   */
  public async getChannel(parameters: DataSync.GetChannelParameters): Promise<DataSync.GetChannelResponse>;

  /**
   * Fetch a specific Channel.
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
  // region Get All Channels

  /**
   * Fetch a paginated list of Channels.
   *
   * @param callback - Request completion handler callback.
   */
  public getAllChannels(callback: ResultCallback<DataSync.GetAllChannelsResponse>): void;

  /**
   * Fetch a paginated list of Channels.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getAllChannels(
    parameters: DataSync.GetAllChannelsParameters,
    callback: ResultCallback<DataSync.GetAllChannelsResponse>,
  ): void;

  /**
   * Fetch a paginated list of Channels.
   *
   * @param [parameters] - Request configuration parameters.
   *
   * @returns Asynchronous get all channels response.
   */
  public async getAllChannels(parameters?: DataSync.GetAllChannelsParameters): Promise<DataSync.GetAllChannelsResponse>;

  /**
   * Fetch a paginated list of Channels.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get all channels response or `void` in case if `callback` provided.
   */
  async getAllChannels(
    parametersOrCallback?: DataSync.GetAllChannelsParameters | ResultCallback<DataSync.GetAllChannelsResponse>,
    callback?: ResultCallback<DataSync.GetAllChannelsResponse>,
  ): Promise<DataSync.GetAllChannelsResponse | void> {
    const parameters: DataSync.GetAllChannelsParameters =
      parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
    callback ??= typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined;

    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Get all Channels with parameters:',
    }));

    const request = new GetAllChannelsRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Update Channel

  /**
   * Update a Channel (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public updateChannel(
    parameters: DataSync.UpdateChannelParameters,
    callback: ResultCallback<DataSync.UpdateChannelResponse>,
  ): void;

  /**
   * Update a Channel (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous update channel response.
   */
  public async updateChannel(parameters: DataSync.UpdateChannelParameters): Promise<DataSync.UpdateChannelResponse>;

  /**
   * Update a Channel (full replacement via PUT).
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
  // region Patch Channel

  /**
   * Patch a Channel (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public patchChannel(
    parameters: DataSync.PatchChannelParameters,
    callback: ResultCallback<DataSync.PatchChannelResponse>,
  ): void;

  /**
   * Patch a Channel (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous patch channel response.
   */
  public async patchChannel(parameters: DataSync.PatchChannelParameters): Promise<DataSync.PatchChannelResponse>;

  /**
   * Patch a Channel (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous patch channel response or `void` in case if `callback` provided.
   */
  async patchChannel(
    parameters: DataSync.PatchChannelParameters,
    callback?: ResultCallback<DataSync.PatchChannelResponse>,
  ): Promise<DataSync.PatchChannelResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Patch Channel with parameters:',
    }));

    const request = new PatchChannelRequest({ ...parameters, keySet: this.keySet });

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
   * Fetch a specific Membership.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getMembership(
    parameters: DataSync.GetMembershipParameters,
    callback: ResultCallback<DataSync.GetMembershipResponse>,
  ): void;

  /**
   * Fetch a specific Membership.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous get membership response.
   */
  public async getMembership(parameters: DataSync.GetMembershipParameters): Promise<DataSync.GetMembershipResponse>;

  /**
   * Fetch a specific Membership.
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
  // region Get All Memberships

  /**
   * Fetch a paginated list of Memberships.
   *
   * @param callback - Request completion handler callback.
   */
  public getAllMemberships(callback: ResultCallback<DataSync.GetAllMembershipsResponse>): void;

  /**
   * Fetch a paginated list of Memberships.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public getAllMemberships(
    parameters: DataSync.GetAllMembershipsParameters,
    callback: ResultCallback<DataSync.GetAllMembershipsResponse>,
  ): void;

  /**
   * Fetch a paginated list of Memberships.
   *
   * @param [parameters] - Request configuration parameters.
   *
   * @returns Asynchronous get all memberships response.
   */
  public async getAllMemberships(
    parameters?: DataSync.GetAllMembershipsParameters,
  ): Promise<DataSync.GetAllMembershipsResponse>;

  /**
   * Fetch a paginated list of Memberships.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous get all memberships response or `void` in case if `callback` provided.
   */
  async getAllMemberships(
    parametersOrCallback?: DataSync.GetAllMembershipsParameters | ResultCallback<DataSync.GetAllMembershipsResponse>,
    callback?: ResultCallback<DataSync.GetAllMembershipsResponse>,
  ): Promise<DataSync.GetAllMembershipsResponse | void> {
    const parameters: DataSync.GetAllMembershipsParameters =
      parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
    callback ??= typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined;

    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Get all Memberships with parameters:',
    }));

    const request = new GetAllMembershipsRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Update Membership

  /**
   * Update a Membership (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public updateMembership(
    parameters: DataSync.UpdateMembershipParameters,
    callback: ResultCallback<DataSync.UpdateMembershipResponse>,
  ): void;

  /**
   * Update a Membership (full replacement via PUT).
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous update membership response.
   */
  public async updateMembership(
    parameters: DataSync.UpdateMembershipParameters,
  ): Promise<DataSync.UpdateMembershipResponse>;

  /**
   * Update a Membership (full replacement via PUT).
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
  // region Patch Membership

  /**
   * Patch a Membership (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public patchMembership(
    parameters: DataSync.PatchMembershipParameters,
    callback: ResultCallback<DataSync.PatchMembershipResponse>,
  ): void;

  /**
   * Patch a Membership (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous patch membership response.
   */
  public async patchMembership(
    parameters: DataSync.PatchMembershipParameters,
  ): Promise<DataSync.PatchMembershipResponse>;

  /**
   * Patch a Membership (partial update via JSON Patch RFC 6902).
   *
   * Uses `add`, `replace`, and `remove` with dot-notation field paths.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous patch membership response or `void` in case if `callback` provided.
   */
  async patchMembership(
    parameters: DataSync.PatchMembershipParameters,
    callback?: ResultCallback<DataSync.PatchMembershipResponse>,
  ): Promise<DataSync.PatchMembershipResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Patch Membership with parameters:',
    }));

    const request = new PatchMembershipRequest({ ...parameters, keySet: this.keySet });

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
