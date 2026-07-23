"use strict";
/**
 * PubNub DataSync API module.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const create_1 = require("./endpoints/data_sync/user/create");
const get_all_1 = require("./endpoints/data_sync/user/get-all");
const update_1 = require("./endpoints/data_sync/user/update");
const remove_1 = require("./endpoints/data_sync/user/remove");
const patch_1 = require("./endpoints/data_sync/user/patch");
const get_1 = require("./endpoints/data_sync/user/get");
const create_2 = require("./endpoints/data_sync/channel/create");
const get_all_2 = require("./endpoints/data_sync/channel/get-all");
const update_2 = require("./endpoints/data_sync/channel/update");
const remove_2 = require("./endpoints/data_sync/channel/remove");
const patch_2 = require("./endpoints/data_sync/channel/patch");
const get_2 = require("./endpoints/data_sync/channel/get");
const create_3 = require("./endpoints/data_sync/membership/create");
const get_all_3 = require("./endpoints/data_sync/membership/get-all");
const update_3 = require("./endpoints/data_sync/membership/update");
const remove_3 = require("./endpoints/data_sync/membership/remove");
const patch_3 = require("./endpoints/data_sync/membership/patch");
const get_3 = require("./endpoints/data_sync/membership/get");
const create_4 = require("./endpoints/data_sync/relationship/create");
const get_all_4 = require("./endpoints/data_sync/relationship/get-all");
const update_4 = require("./endpoints/data_sync/relationship/update");
const remove_4 = require("./endpoints/data_sync/relationship/remove");
const patch_4 = require("./endpoints/data_sync/relationship/patch");
const get_4 = require("./endpoints/data_sync/relationship/get");
const create_5 = require("./endpoints/data_sync/entity/create");
const get_all_5 = require("./endpoints/data_sync/entity/get-all");
const update_5 = require("./endpoints/data_sync/entity/update");
const remove_5 = require("./endpoints/data_sync/entity/remove");
const patch_5 = require("./endpoints/data_sync/entity/patch");
const get_5 = require("./endpoints/data_sync/entity/get");
/**
 * PubNub DataSync API interface.
 */
class PubNubDataSync {
    /**
     * Create DataSync API access object.
     *
     * @param configuration - Extended PubNub client configuration object.
     * @param sendRequest - Function which should be used to send REST API calls.
     *
     * @internal
     */
    constructor(configuration, 
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    sendRequest) {
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
    get logger() {
        return this.configuration.logger();
    }
    /**
     * Create a new Entity.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous create entity response or `void` in case if `callback` provided.
     */
    createEntity(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Create Entity with parameters:',
            }));
            const request = new create_5.CreateEntityRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Fetch a specific Entity.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get entity response or `void` in case if `callback` provided.
     */
    getEntity(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Get Entity with parameters:',
            }));
            const request = new get_5.GetEntityRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Fetch a paginated list of Entities for a given Entity Class.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get all entities response or `void` in case if `callback` provided.
     */
    getAllEntities(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Get all Entities with parameters:',
            }));
            const request = new get_all_5.GetAllEntitiesRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Update an Entity (full replacement via PUT).
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous update entity response or `void` in case if `callback` provided.
     */
    updateEntity(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Update Entity with parameters:',
            }));
            const request = new update_5.UpdateEntityRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
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
    patchEntity(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Patch Entity with parameters:',
            }));
            const request = new patch_5.PatchEntityRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Remove an Entity.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous remove entity response or `void` in case if `callback` provided.
     */
    removeEntity(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Remove Entity with parameters:',
            }));
            const request = new remove_5.RemoveEntityRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Create a new Relationship.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous create relationship response or `void` in case if `callback` provided.
     */
    createRelationship(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Create Relationship with parameters:',
            }));
            const request = new create_4.CreateRelationshipRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Fetch a specific Relationship.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get relationship response or `void` in case if `callback` provided.
     */
    getRelationship(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Get Relationship with parameters:',
            }));
            const request = new get_4.GetRelationshipRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Fetch a paginated list of Relationships.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get all relationships response or `void` in case if `callback` provided.
     */
    getAllRelationships(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Get all Relationships with parameters:',
            }));
            const request = new get_all_4.GetAllRelationshipsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Update a Relationship (full replacement via PUT).
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous update relationship response or `void` in case if `callback` provided.
     */
    updateRelationship(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Update Relationship with parameters:',
            }));
            const request = new update_4.UpdateRelationshipRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
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
    patchRelationship(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Patch Relationship with parameters:',
            }));
            const request = new patch_4.PatchRelationshipRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Remove a Relationship.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous remove relationship response or `void` in case if `callback` provided.
     */
    removeRelationship(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Remove Relationship with parameters:',
            }));
            const request = new remove_4.RemoveRelationshipRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Create a new User.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous create user response or `void` in case if `callback` provided.
     */
    createUser(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Create User with parameters:',
            }));
            const request = new create_1.CreateUserRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Fetch a specific User.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get user response or `void` in case if `callback` provided.
     */
    getUser(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Get User with parameters:',
            }));
            const request = new get_1.GetUserRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Fetch a paginated list of Users.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get all users response or `void` in case if `callback` provided.
     */
    getAllUsers(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
            callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Get all Users with parameters:',
            }));
            const request = new get_all_1.GetAllUsersRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Update a User (full replacement via PUT).
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous update user response or `void` in case if `callback` provided.
     */
    updateUser(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Update User with parameters:',
            }));
            const request = new update_1.UpdateUserRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
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
    patchUser(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Patch User with parameters:',
            }));
            const request = new patch_1.PatchUserRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Remove a User.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous remove user response or `void` in case if `callback` provided.
     */
    removeUser(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Remove User with parameters:',
            }));
            const request = new remove_1.RemoveUserRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Create a new Channel.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous create channel response or `void` in case if `callback` provided.
     */
    createChannel(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Create Channel with parameters:',
            }));
            const request = new create_2.CreateChannelRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Fetch a specific Channel.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get channel response or `void` in case if `callback` provided.
     */
    getChannel(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Get Channel with parameters:',
            }));
            const request = new get_2.GetChannelRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Fetch a paginated list of Channels.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get all channels response or `void` in case if `callback` provided.
     */
    getAllChannels(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
            callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Get all Channels with parameters:',
            }));
            const request = new get_all_2.GetAllChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Update a Channel (full replacement via PUT).
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous update channel response or `void` in case if `callback` provided.
     */
    updateChannel(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Update Channel with parameters:',
            }));
            const request = new update_2.UpdateChannelRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
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
    patchChannel(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Patch Channel with parameters:',
            }));
            const request = new patch_2.PatchChannelRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Remove a Channel.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous remove channel response or `void` in case if `callback` provided.
     */
    removeChannel(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Remove Channel with parameters:',
            }));
            const request = new remove_2.RemoveChannelRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Create a new Membership (associates a User with a Channel).
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous create membership response or `void` in case if `callback` provided.
     */
    createMembership(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Create Membership with parameters:',
            }));
            const request = new create_3.CreateMembershipRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Fetch a specific Membership.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get membership response or `void` in case if `callback` provided.
     */
    getMembership(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Get Membership with parameters:',
            }));
            const request = new get_3.GetMembershipRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Fetch a paginated list of Memberships.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get all memberships response or `void` in case if `callback` provided.
     */
    getAllMemberships(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
            callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Get all Memberships with parameters:',
            }));
            const request = new get_all_3.GetAllMembershipsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Update a Membership (full replacement via PUT).
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous update membership response or `void` in case if `callback` provided.
     */
    updateMembership(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Update Membership with parameters:',
            }));
            const request = new update_3.UpdateMembershipRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
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
    patchMembership(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Patch Membership with parameters:',
            }));
            const request = new patch_3.PatchMembershipRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Remove a Membership.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous remove membership response or `void` in case if `callback` provided.
     */
    removeMembership(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Remove Membership with parameters:',
            }));
            const request = new remove_3.RemoveMembershipRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
}
exports.default = PubNubDataSync;
