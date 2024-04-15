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
    constructor(keySet, sendRequest) {
        this.keySet = keySet;
        this.sendRequest = sendRequest;
    }
    listChannels(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new ListChannelGroupChannels(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    listGroups(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new ListChannelGroupsRequest({ keySet: this.keySet });
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    addChannels(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new AddChannelGroupChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    removeChannels(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new RemoveChannelGroupChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    deleteGroup(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new DeleteChannelGroupRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
}
