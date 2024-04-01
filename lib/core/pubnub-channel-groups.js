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
import { RemoveChannelGroupChannelsRequest } from './endpoints/channel_groups/remove_channels';
import { AddChannelGroupChannelsRequest } from './endpoints/channel_groups/add_channels';
import { ListChannelGroupChannels } from './endpoints/channel_groups/list_channels';
import { DeleteChannelGroupRequest } from './endpoints/channel_groups/delete_group';
import { ListChannelGroupsRequest } from './endpoints/channel_groups/list_groups';
export default class PubnubChannelGroups {
    constructor(keySet, 
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    sendRequest) {
        this.keySet = keySet;
        this.sendRequest = sendRequest;
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
            const request = new ListChannelGroupChannels(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
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
            const request = new ListChannelGroupsRequest({ keySet: this.keySet });
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
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
            const request = new AddChannelGroupChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
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
            const request = new RemoveChannelGroupChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Remove channel group.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous remove channel group response or `void` in case if `callback` provided.
     */
    deleteGroup(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new DeleteChannelGroupRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
}
