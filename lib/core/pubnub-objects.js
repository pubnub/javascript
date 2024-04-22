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
const get_all_1 = require("./endpoints/objects/channel/get_all");
const remove_1 = require("./endpoints/objects/channel/remove");
const get_1 = require("./endpoints/objects/membership/get");
const set_1 = require("./endpoints/objects/membership/set");
const get_all_2 = require("./endpoints/objects/uuid/get_all");
const get_2 = require("./endpoints/objects/channel/get");
const set_2 = require("./endpoints/objects/channel/set");
const remove_2 = require("./endpoints/objects/uuid/remove");
const get_3 = require("./endpoints/objects/member/get");
const set_3 = require("./endpoints/objects/member/set");
const get_4 = require("./endpoints/objects/uuid/get");
const set_4 = require("./endpoints/objects/uuid/set");
class PubNubObjects {
    constructor(configuration, sendRequest) {
        this.configuration = configuration;
        this.sendRequest = sendRequest;
        this.keySet = configuration.keySet;
    }
    getAllUUIDMetadata(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._getAllUUIDMetadata(parametersOrCallback, callback);
        });
    }
    _getAllUUIDMetadata(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
            callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
            const request = new get_all_2.GetAllUUIDMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    getUUIDMetadata(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._getUUIDMetadata(parametersOrCallback, callback);
        });
    }
    _getUUIDMetadata(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
            callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
            if (parameters.userId)
                parameters.uuid = parameters.userId;
            (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
            const request = new get_4.GetUUIDMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    setUUIDMetadata(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._setUUIDMetadata(parameters, callback);
        });
    }
    _setUUIDMetadata(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (parameters.userId)
                parameters.uuid = parameters.userId;
            (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
            const request = new set_4.SetUUIDMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    removeUUIDMetadata(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._removeUUIDMetadata(parametersOrCallback, callback);
        });
    }
    _removeUUIDMetadata(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
            callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
            if (parameters.userId)
                parameters.uuid = parameters.userId;
            (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
            const request = new remove_2.RemoveUUIDMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    getAllChannelMetadata(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._getAllChannelMetadata(parametersOrCallback, callback);
        });
    }
    _getAllChannelMetadata(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
            callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
            const request = new get_all_1.GetAllChannelsMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    getChannelMetadata(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._getChannelMetadata(parameters, callback);
        });
    }
    _getChannelMetadata(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new get_2.GetChannelMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    setChannelMetadata(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._setChannelMetadata(parameters, callback);
        });
    }
    _setChannelMetadata(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new set_2.SetChannelMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    removeChannelMetadata(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._removeChannelMetadata(parameters, callback);
        });
    }
    _removeChannelMetadata(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new remove_1.RemoveChannelMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    getChannelMembers(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new get_3.GetChannelMembersRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    setChannelMembers(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new set_3.SetChannelMembersRequest(Object.assign(Object.assign({}, parameters), { type: 'set', keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    removeChannelMembers(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new set_3.SetChannelMembersRequest(Object.assign(Object.assign({}, parameters), { type: 'delete', keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    getMemberships(parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
            callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
            if (parameters.userId)
                parameters.uuid = parameters.userId;
            (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
            const request = new get_1.GetUUIDMembershipsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    setMemberships(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (parameters.userId)
                parameters.uuid = parameters.userId;
            (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
            const request = new set_1.SetUUIDMembershipsRequest(Object.assign(Object.assign({}, parameters), { type: 'set', keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    removeMemberships(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (parameters.userId)
                parameters.uuid = parameters.userId;
            (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
            const request = new set_1.SetUUIDMembershipsRequest(Object.assign(Object.assign({}, parameters), { type: 'delete', keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    fetchMemberships(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if ('spaceId' in parameters) {
                const spaceParameters = parameters;
                const mappedParameters = {
                    channel: (_a = spaceParameters.spaceId) !== null && _a !== void 0 ? _a : spaceParameters.channel,
                    filter: spaceParameters.filter,
                    limit: spaceParameters.limit,
                    page: spaceParameters.page,
                    include: Object.assign({}, spaceParameters.include),
                    sort: spaceParameters.sort
                        ? Object.fromEntries(Object.entries(spaceParameters.sort).map(([key, value]) => [key.replace('user', 'uuid'), value]))
                        : undefined,
                };
                const mapMembers = (response) => ({
                    status: response.status,
                    data: response.data.map((members) => ({
                        user: members.uuid,
                        custom: members.custom,
                        updated: members.updated,
                        eTag: members.eTag,
                    })),
                    totalCount: response.totalCount,
                    next: response.next,
                    prev: response.prev,
                });
                if (callback)
                    return this.getChannelMembers(mappedParameters, (status, result) => {
                        callback(status, result ? mapMembers(result) : result);
                    });
                return this.getChannelMembers(mappedParameters).then(mapMembers);
            }
            const userParameters = parameters;
            const mappedParameters = {
                uuid: (_b = userParameters.userId) !== null && _b !== void 0 ? _b : userParameters.uuid,
                filter: userParameters.filter,
                limit: userParameters.limit,
                page: userParameters.page,
                include: Object.assign({}, userParameters.include),
                sort: userParameters.sort
                    ? Object.fromEntries(Object.entries(userParameters.sort).map(([key, value]) => [key.replace('space', 'channel'), value]))
                    : undefined,
            };
            const mapMemberships = (response) => ({
                status: response.status,
                data: response.data.map((membership) => ({
                    space: membership.channel,
                    custom: membership.custom,
                    updated: membership.updated,
                    eTag: membership.eTag,
                })),
                totalCount: response.totalCount,
                next: response.next,
                prev: response.prev,
            });
            if (callback)
                return this.getMemberships(mappedParameters, (status, result) => {
                    callback(status, result ? mapMemberships(result) : result);
                });
            return this.getMemberships(mappedParameters).then(mapMemberships);
        });
    }
    addMemberships(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            if ('spaceId' in parameters) {
                const spaceParameters = parameters;
                const mappedParameters = {
                    channel: (_a = spaceParameters.spaceId) !== null && _a !== void 0 ? _a : spaceParameters.channel,
                    uuids: (_c = (_b = spaceParameters.users) === null || _b === void 0 ? void 0 : _b.map((user) => {
                        if (typeof user === 'string')
                            return user;
                        user.userId;
                        return { id: user.userId, custom: user.custom };
                    })) !== null && _c !== void 0 ? _c : spaceParameters.uuids,
                    limit: 0,
                };
                if (callback)
                    return this.setChannelMembers(mappedParameters, callback);
                return this.setChannelMembers(mappedParameters);
            }
            const userParameters = parameters;
            const mappedParameters = {
                uuid: (_d = userParameters.userId) !== null && _d !== void 0 ? _d : userParameters.uuid,
                channels: (_f = (_e = userParameters.spaces) === null || _e === void 0 ? void 0 : _e.map((space) => {
                    if (typeof space === 'string')
                        return space;
                    return {
                        id: space.spaceId,
                        custom: space.custom,
                    };
                })) !== null && _f !== void 0 ? _f : userParameters.channels,
                limit: 0,
            };
            if (callback)
                return this.setMemberships(mappedParameters, callback);
            return this.setMemberships(mappedParameters);
        });
    }
}
exports.default = PubNubObjects;
