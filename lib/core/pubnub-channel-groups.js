"use strict";
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
class PubnubChannelGroups {
    constructor(keySet, sendRequest) {
        this.keySet = keySet;
        this.sendRequest = sendRequest;
    }
    listChannels(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new list_channels_1.ListChannelGroupChannels(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    listGroups(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new list_groups_1.ListChannelGroupsRequest({ keySet: this.keySet });
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    addChannels(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new add_channels_1.AddChannelGroupChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    removeChannels(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new remove_channels_1.RemoveChannelGroupChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    deleteGroup(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new delete_group_1.DeleteChannelGroupRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
}
exports.default = PubnubChannelGroups;
