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
const create_1 = require("./endpoints/data_sync/relationship/create");
const get_all_1 = require("./endpoints/data_sync/relationship/get-all");
const update_1 = require("./endpoints/data_sync/relationship/update");
const remove_1 = require("./endpoints/data_sync/relationship/remove");
const patch_1 = require("./endpoints/data_sync/relationship/patch");
const get_1 = require("./endpoints/data_sync/relationship/get");
const create_2 = require("./endpoints/data_sync/entity/create");
const get_all_2 = require("./endpoints/data_sync/entity/get-all");
const update_2 = require("./endpoints/data_sync/entity/update");
const remove_2 = require("./endpoints/data_sync/entity/remove");
const patch_2 = require("./endpoints/data_sync/entity/patch");
const get_2 = require("./endpoints/data_sync/entity/get");
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
            const request = new create_2.CreateEntityRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
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
            const request = new get_2.GetEntityRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
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
            const request = new get_all_2.GetAllEntitiesRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
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
            const request = new update_2.UpdateEntityRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Patch an Entity (partial update via JSON Patch RFC 6902).
     *
     * Uses `set` and `remove` with dot-notation field paths.
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
            const request = new patch_2.PatchEntityRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
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
            const request = new remove_2.RemoveEntityRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
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
            const request = new create_1.CreateRelationshipRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
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
            const request = new get_1.GetRelationshipRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Fetch a paginated list of Relationships.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get all relationships response or `void` in case if `callback` provided.
     */
    getAllRelationships(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
            callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Get all Relationships with parameters:',
            }));
            const request = new get_all_1.GetAllRelationshipsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
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
            const request = new update_1.UpdateRelationshipRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Patch a Relationship (partial update via JSON Patch RFC 6902).
     *
     * Uses `set` and `remove` with dot-notation field paths.
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
            const request = new patch_1.PatchRelationshipRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
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
            const request = new remove_1.RemoveRelationshipRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
}
exports.default = PubNubDataSync;
