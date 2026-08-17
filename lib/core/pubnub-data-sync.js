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
const set_1 = require("./endpoints/data_sync/user/set");
const remove_1 = require("./endpoints/data_sync/user/remove");
const update_1 = require("./endpoints/data_sync/user/update");
const get_1 = require("./endpoints/data_sync/user/get");
const create_2 = require("./endpoints/data_sync/channel/create");
const get_all_2 = require("./endpoints/data_sync/channel/get-all");
const set_2 = require("./endpoints/data_sync/channel/set");
const remove_2 = require("./endpoints/data_sync/channel/remove");
const update_2 = require("./endpoints/data_sync/channel/update");
const get_2 = require("./endpoints/data_sync/channel/get");
const create_3 = require("./endpoints/data_sync/membership/create");
const get_all_3 = require("./endpoints/data_sync/membership/get-all");
const set_3 = require("./endpoints/data_sync/membership/set");
const remove_3 = require("./endpoints/data_sync/membership/remove");
const update_3 = require("./endpoints/data_sync/membership/update");
const get_3 = require("./endpoints/data_sync/membership/get");
const create_4 = require("./endpoints/data_sync/relationship/create");
const get_all_4 = require("./endpoints/data_sync/relationship/get-all");
const set_4 = require("./endpoints/data_sync/relationship/set");
const remove_4 = require("./endpoints/data_sync/relationship/remove");
const update_4 = require("./endpoints/data_sync/relationship/update");
const get_4 = require("./endpoints/data_sync/relationship/get");
const create_5 = require("./endpoints/data_sync/entity/create");
const get_all_5 = require("./endpoints/data_sync/entity/get-all");
const set_5 = require("./endpoints/data_sync/entity/set");
const remove_5 = require("./endpoints/data_sync/entity/remove");
const update_5 = require("./endpoints/data_sync/entity/update");
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
     * Get a specific Entity.
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
     * Get a paginated list of Entities for a given Entity Class.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get entities response or `void` in case if `callback` provided.
     */
    getEntities(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Get Entities with parameters:',
            }));
            const request = new get_all_5.GetEntitiesRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Set an Entity (full replacement via PUT).
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous set entity response or `void` in case if `callback` provided.
     */
    setEntity(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Set Entity with parameters:',
            }));
            const request = new set_5.SetEntityRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
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
     * Get a specific Relationship.
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
     * Get a paginated list of Relationships.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get relationships response or `void` in case if `callback` provided.
     */
    getRelationships(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Get Relationships with parameters:',
            }));
            const request = new get_all_4.GetRelationshipsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Set a Relationship (full replacement via PUT).
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous set relationship response or `void` in case if `callback` provided.
     */
    setRelationship(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Set Relationship with parameters:',
            }));
            const request = new set_4.SetRelationshipRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
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
     * Get a specific User.
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
     * Get a paginated list of Users.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get users response or `void` in case if `callback` provided.
     */
    getUsers(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
            callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Get Users with parameters:',
            }));
            const request = new get_all_1.GetUsersRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Set a User (full replacement via PUT).
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous set user response or `void` in case if `callback` provided.
     */
    setUser(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Set User with parameters:',
            }));
            const request = new set_1.SetUserRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
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
     * Get a specific Channel.
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
     * Get a paginated list of Channels.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get channels response or `void` in case if `callback` provided.
     */
    getChannels(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
            callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Get Channels with parameters:',
            }));
            const request = new get_all_2.GetChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Set a Channel (full replacement via PUT).
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous set channel response or `void` in case if `callback` provided.
     */
    setChannel(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Set Channel with parameters:',
            }));
            const request = new set_2.SetChannelRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
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
     * Get a specific Membership.
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
     * Get a paginated list of Memberships.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get memberships response or `void` in case if `callback` provided.
     */
    getMemberships(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
            callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Get Memberships with parameters:',
            }));
            const request = new get_all_3.GetMembershipsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Set a Membership (full replacement via PUT).
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous set membership response or `void` in case if `callback` provided.
     */
    setMembership(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Set Membership with parameters:',
            }));
            const request = new set_3.SetMembershipRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
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
