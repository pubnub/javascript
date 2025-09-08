"use strict";
/**
 * PubNub Channel Groups API module.
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
const remove_channels_1 = require("./endpoints/channel_groups/remove_channels");
const add_channels_1 = require("./endpoints/channel_groups/add_channels");
const list_channels_1 = require("./endpoints/channel_groups/list_channels");
const delete_group_1 = require("./endpoints/channel_groups/delete_group");
const list_groups_1 = require("./endpoints/channel_groups/list_groups");
/**
 * PubNub Stream / Channel group API interface.
 */
class PubNubChannelGroups {
    /**
     * Create stream / channel group API access object.
     *
     * @param logger - Registered loggers' manager.
     * @param keySet - PubNub account keys set which should be used for REST API calls.
     * @param sendRequest - Function which should be used to send REST API calls.
     *
     * @internal
     */
    constructor(logger, keySet, 
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    sendRequest) {
        this.sendRequest = sendRequest;
        this.logger = logger;
        this.keySet = keySet;
    }
    /**
     * Fetch channel group channels.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get channel group channels response or `void` in case if `callback`
     * provided.
     */
    listChannels(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'List channel group channels with parameters:',
            }));
            const request = new list_channels_1.ListChannelGroupChannels(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            const logResponse = (response) => {
                if (!response)
                    return;
                this.logger.debug('PubNub', `List channel group channels success. Received ${response.channels.length} channels.`);
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
        });
    }
    /**
     * Fetch all channel groups.
     *
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get all channel groups response or `void` in case if `callback` provided.
     *
     * @deprecated
     */
    listGroups(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', 'List all channel groups.');
            const request = new list_groups_1.ListChannelGroupsRequest({ keySet: this.keySet });
            const logResponse = (response) => {
                if (!response)
                    return;
                this.logger.debug('PubNub', `List all channel groups success. Received ${response.groups.length} groups.`);
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
        });
    }
    /**
     * Add channels to the channel group.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous add channels to the channel group response or `void` in case if
     * `callback` provided.
     */
    addChannels(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Add channels to the channel group with parameters:',
            }));
            const request = new add_channels_1.AddChannelGroupChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            const logResponse = () => {
                this.logger.debug('PubNub', `Add channels to the channel group success.`);
            };
            if (callback)
                return this.sendRequest(request, (status) => {
                    if (!status.error)
                        logResponse();
                    callback(status);
                });
            return this.sendRequest(request).then((response) => {
                logResponse();
                return response;
            });
        });
    }
    /**
     * Remove channels from the channel group.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous remove channels from the channel group response or `void` in
     * case if `callback` provided.
     */
    removeChannels(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Remove channels from the channel group with parameters:',
            }));
            const request = new remove_channels_1.RemoveChannelGroupChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            const logResponse = () => {
                this.logger.debug('PubNub', `Remove channels from the channel group success.`);
            };
            if (callback)
                return this.sendRequest(request, (status) => {
                    if (!status.error)
                        logResponse();
                    callback(status);
                });
            return this.sendRequest(request).then((response) => {
                logResponse();
                return response;
            });
        });
    }
    /**
     * Remove a channel group.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous remove channel group response or `void` in case if `callback` provided.
     */
    deleteGroup(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: 'Remove a channel group with parameters:',
            }));
            const request = new delete_group_1.DeleteChannelGroupRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            const logResponse = () => {
                this.logger.debug('PubNub', `Remove a channel group success. Removed '${parameters.channelGroup}' channel group.'`);
            };
            if (callback)
                return this.sendRequest(request, (status) => {
                    if (!status.error)
                        logResponse();
                    callback(status);
                });
            return this.sendRequest(request).then((response) => {
                logResponse();
                return response;
            });
        });
    }
}
exports.default = PubNubChannelGroups;
