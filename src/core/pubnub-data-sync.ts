/**
 * PubNub DataSync API module.
 */

import { CreateUserRequest } from './endpoints/data_sync/user/create';
import { FetchUsersRequest } from './endpoints/data_sync/user/fetch-all';
import { UpdateUserRequest } from './endpoints/data_sync/user/update';
import { RemoveUserRequest } from './endpoints/data_sync/user/remove';
import { PatchUserRequest } from './endpoints/data_sync/user/patch';
import { FetchUserRequest } from './endpoints/data_sync/user/fetch';
import { CreateChannelRequest } from './endpoints/data_sync/channel/create';
import { FetchChannelsRequest } from './endpoints/data_sync/channel/fetch-all';
import { UpdateChannelRequest } from './endpoints/data_sync/channel/update';
import { RemoveChannelRequest } from './endpoints/data_sync/channel/remove';
import { PatchChannelRequest } from './endpoints/data_sync/channel/patch';
import { FetchChannelRequest } from './endpoints/data_sync/channel/fetch';
import { CreateMembershipRequest } from './endpoints/data_sync/membership/create';
import { FetchMembershipsRequest } from './endpoints/data_sync/membership/fetch-all';
import { UpdateMembershipRequest } from './endpoints/data_sync/membership/update';
import { RemoveMembershipRequest } from './endpoints/data_sync/membership/remove';
import { PatchMembershipRequest } from './endpoints/data_sync/membership/patch';
import { FetchMembershipRequest } from './endpoints/data_sync/membership/fetch';
import { CreateRelationshipRequest } from './endpoints/data_sync/relationship/create';
import { FetchRelationshipsRequest } from './endpoints/data_sync/relationship/fetch-all';
import { UpdateRelationshipRequest } from './endpoints/data_sync/relationship/update';
import { RemoveRelationshipRequest } from './endpoints/data_sync/relationship/remove';
import { PatchRelationshipRequest } from './endpoints/data_sync/relationship/patch';
import { FetchRelationshipRequest } from './endpoints/data_sync/relationship/fetch';
import { CreateEntityRequest } from './endpoints/data_sync/entity/create';
import { FetchEntitiesRequest } from './endpoints/data_sync/entity/fetch-all';
import { UpdateEntityRequest } from './endpoints/data_sync/entity/update';
import { RemoveEntityRequest } from './endpoints/data_sync/entity/remove';
import { PatchEntityRequest } from './endpoints/data_sync/entity/patch';
import { FetchEntityRequest } from './endpoints/data_sync/entity/fetch';
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
  // region Fetch Entity

  /**
   * Fetch a specific Entity.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public fetchEntity(
    parameters: DataSync.FetchEntityParameters,
    callback: ResultCallback<DataSync.FetchEntityResponse>,
  ): void;

  /**
   * Fetch a specific Entity.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous fetch entity response.
   */
  public async fetchEntity(parameters: DataSync.FetchEntityParameters): Promise<DataSync.FetchEntityResponse>;

  /**
   * Fetch a specific Entity.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous fetch entity response or `void` in case if `callback` provided.
   */
  async fetchEntity(
    parameters: DataSync.FetchEntityParameters,
    callback?: ResultCallback<DataSync.FetchEntityResponse>,
  ): Promise<DataSync.FetchEntityResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Fetch Entity with parameters:',
    }));

    const request = new FetchEntityRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Fetch Entities

  /**
   * Fetch a paginated list of Entities for a given Entity Class.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public fetchEntities(
    parameters: DataSync.FetchEntitiesParameters,
    callback: ResultCallback<DataSync.FetchEntitiesResponse>,
  ): void;

  /**
   * Fetch a paginated list of Entities for a given Entity Class.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous fetch entities response.
   */
  public async fetchEntities(parameters: DataSync.FetchEntitiesParameters): Promise<DataSync.FetchEntitiesResponse>;

  /**
   * Fetch a paginated list of Entities for a given Entity Class.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous fetch entities response or `void` in case if `callback` provided.
   */
  async fetchEntities(
    parameters: DataSync.FetchEntitiesParameters,
    callback?: ResultCallback<DataSync.FetchEntitiesResponse>,
  ): Promise<DataSync.FetchEntitiesResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Fetch Entities with parameters:',
    }));

    const request = new FetchEntitiesRequest({ ...parameters, keySet: this.keySet });

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
  // region Fetch Relationship

  /**
   * Fetch a specific Relationship.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public fetchRelationship(
    parameters: DataSync.FetchRelationshipParameters,
    callback: ResultCallback<DataSync.FetchRelationshipResponse>,
  ): void;

  /**
   * Fetch a specific Relationship.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous fetch relationship response.
   */
  public async fetchRelationship(
    parameters: DataSync.FetchRelationshipParameters,
  ): Promise<DataSync.FetchRelationshipResponse>;

  /**
   * Fetch a specific Relationship.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous fetch relationship response or `void` in case if `callback` provided.
   */
  async fetchRelationship(
    parameters: DataSync.FetchRelationshipParameters,
    callback?: ResultCallback<DataSync.FetchRelationshipResponse>,
  ): Promise<DataSync.FetchRelationshipResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Fetch Relationship with parameters:',
    }));

    const request = new FetchRelationshipRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Fetch Relationships

  /**
   * Fetch a paginated list of Relationships.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public fetchRelationships(
    parameters: DataSync.FetchRelationshipsParameters,
    callback: ResultCallback<DataSync.FetchRelationshipsResponse>,
  ): void;

  /**
   * Fetch a paginated list of Relationships.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous fetch relationships response.
   */
  public async fetchRelationships(
    parameters: DataSync.FetchRelationshipsParameters,
  ): Promise<DataSync.FetchRelationshipsResponse>;

  /**
   * Fetch a paginated list of Relationships.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous fetch relationships response or `void` in case if `callback` provided.
   */
  async fetchRelationships(
    parameters: DataSync.FetchRelationshipsParameters,
    callback?: ResultCallback<DataSync.FetchRelationshipsResponse>,
  ): Promise<DataSync.FetchRelationshipsResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Fetch Relationships with parameters:',
    }));

    const request = new FetchRelationshipsRequest({ ...parameters, keySet: this.keySet });

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
  // region Fetch User

  /**
   * Fetch a specific User.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public fetchUser(parameters: DataSync.FetchUserParameters, callback: ResultCallback<DataSync.FetchUserResponse>): void;

  /**
   * Fetch a specific User.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous fetch user response.
   */
  public async fetchUser(parameters: DataSync.FetchUserParameters): Promise<DataSync.FetchUserResponse>;

  /**
   * Fetch a specific User.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous fetch user response or `void` in case if `callback` provided.
   */
  async fetchUser(
    parameters: DataSync.FetchUserParameters,
    callback?: ResultCallback<DataSync.FetchUserResponse>,
  ): Promise<DataSync.FetchUserResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Fetch User with parameters:',
    }));

    const request = new FetchUserRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Fetch Users

  /**
   * Fetch a paginated list of Users.
   *
   * @param callback - Request completion handler callback.
   */
  public fetchUsers(callback: ResultCallback<DataSync.FetchUsersResponse>): void;

  /**
   * Fetch a paginated list of Users.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public fetchUsers(
    parameters: DataSync.FetchUsersParameters,
    callback: ResultCallback<DataSync.FetchUsersResponse>,
  ): void;

  /**
   * Fetch a paginated list of Users.
   *
   * @param [parameters] - Request configuration parameters.
   *
   * @returns Asynchronous fetch users response.
   */
  public async fetchUsers(parameters?: DataSync.FetchUsersParameters): Promise<DataSync.FetchUsersResponse>;

  /**
   * Fetch a paginated list of Users.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous fetch users response or `void` in case if `callback` provided.
   */
  async fetchUsers(
    parametersOrCallback?: DataSync.FetchUsersParameters | ResultCallback<DataSync.FetchUsersResponse>,
    callback?: ResultCallback<DataSync.FetchUsersResponse>,
  ): Promise<DataSync.FetchUsersResponse | void> {
    const parameters: DataSync.FetchUsersParameters =
      parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
    callback ??= typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined;

    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Fetch Users with parameters:',
    }));

    const request = new FetchUsersRequest({ ...parameters, keySet: this.keySet });

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
  // region Fetch Channel

  /**
   * Fetch a specific Channel.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public fetchChannel(
    parameters: DataSync.FetchChannelParameters,
    callback: ResultCallback<DataSync.FetchChannelResponse>,
  ): void;

  /**
   * Fetch a specific Channel.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous fetch channel response.
   */
  public async fetchChannel(parameters: DataSync.FetchChannelParameters): Promise<DataSync.FetchChannelResponse>;

  /**
   * Fetch a specific Channel.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous fetch channel response or `void` in case if `callback` provided.
   */
  async fetchChannel(
    parameters: DataSync.FetchChannelParameters,
    callback?: ResultCallback<DataSync.FetchChannelResponse>,
  ): Promise<DataSync.FetchChannelResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Fetch Channel with parameters:',
    }));

    const request = new FetchChannelRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Fetch Channels

  /**
   * Fetch a paginated list of Channels.
   *
   * @param callback - Request completion handler callback.
   */
  public fetchChannels(callback: ResultCallback<DataSync.FetchChannelsResponse>): void;

  /**
   * Fetch a paginated list of Channels.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public fetchChannels(
    parameters: DataSync.FetchChannelsParameters,
    callback: ResultCallback<DataSync.FetchChannelsResponse>,
  ): void;

  /**
   * Fetch a paginated list of Channels.
   *
   * @param [parameters] - Request configuration parameters.
   *
   * @returns Asynchronous fetch channels response.
   */
  public async fetchChannels(parameters?: DataSync.FetchChannelsParameters): Promise<DataSync.FetchChannelsResponse>;

  /**
   * Fetch a paginated list of Channels.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous fetch channels response or `void` in case if `callback` provided.
   */
  async fetchChannels(
    parametersOrCallback?: DataSync.FetchChannelsParameters | ResultCallback<DataSync.FetchChannelsResponse>,
    callback?: ResultCallback<DataSync.FetchChannelsResponse>,
  ): Promise<DataSync.FetchChannelsResponse | void> {
    const parameters: DataSync.FetchChannelsParameters =
      parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
    callback ??= typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined;

    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Fetch Channels with parameters:',
    }));

    const request = new FetchChannelsRequest({ ...parameters, keySet: this.keySet });

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
  // region Fetch Membership

  /**
   * Fetch a specific Membership.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public fetchMembership(
    parameters: DataSync.FetchMembershipParameters,
    callback: ResultCallback<DataSync.FetchMembershipResponse>,
  ): void;

  /**
   * Fetch a specific Membership.
   *
   * @param parameters - Request configuration parameters.
   *
   * @returns Asynchronous fetch membership response.
   */
  public async fetchMembership(parameters: DataSync.FetchMembershipParameters): Promise<DataSync.FetchMembershipResponse>;

  /**
   * Fetch a specific Membership.
   *
   * @param parameters - Request configuration parameters.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous fetch membership response or `void` in case if `callback` provided.
   */
  async fetchMembership(
    parameters: DataSync.FetchMembershipParameters,
    callback?: ResultCallback<DataSync.FetchMembershipResponse>,
  ): Promise<DataSync.FetchMembershipResponse | void> {
    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Fetch Membership with parameters:',
    }));

    const request = new FetchMembershipRequest({ ...parameters, keySet: this.keySet });

    if (callback) return this.sendRequest(request, callback);
    return this.sendRequest(request);
  }

  // endregion
  // region Fetch Memberships

  /**
   * Fetch a paginated list of Memberships.
   *
   * @param callback - Request completion handler callback.
   */
  public fetchMemberships(callback: ResultCallback<DataSync.FetchMembershipsResponse>): void;

  /**
   * Fetch a paginated list of Memberships.
   *
   * @param parameters - Request configuration parameters.
   * @param callback - Request completion handler callback.
   */
  public fetchMemberships(
    parameters: DataSync.FetchMembershipsParameters,
    callback: ResultCallback<DataSync.FetchMembershipsResponse>,
  ): void;

  /**
   * Fetch a paginated list of Memberships.
   *
   * @param [parameters] - Request configuration parameters.
   *
   * @returns Asynchronous fetch memberships response.
   */
  public async fetchMemberships(
    parameters?: DataSync.FetchMembershipsParameters,
  ): Promise<DataSync.FetchMembershipsResponse>;

  /**
   * Fetch a paginated list of Memberships.
   *
   * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
   * @param [callback] - Request completion handler callback.
   *
   * @returns Asynchronous fetch memberships response or `void` in case if `callback` provided.
   */
  async fetchMemberships(
    parametersOrCallback?: DataSync.FetchMembershipsParameters | ResultCallback<DataSync.FetchMembershipsResponse>,
    callback?: ResultCallback<DataSync.FetchMembershipsResponse>,
  ): Promise<DataSync.FetchMembershipsResponse | void> {
    const parameters: DataSync.FetchMembershipsParameters =
      parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
    callback ??= typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined;

    this.logger.debug('PubNub', () => ({
      messageType: 'object',
      message: { ...parameters },
      details: 'Fetch Memberships with parameters:',
    }));

    const request = new FetchMembershipsRequest({ ...parameters, keySet: this.keySet });

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
