var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GetAllChannelsMetadataRequest } from './endpoints/objects/channel/get_all';
import { RemoveChannelMetadataRequest } from './endpoints/objects/channel/remove';
import { GetUUIDMembershipsRequest } from './endpoints/objects/membership/get';
import { SetUUIDMembershipsRequest } from './endpoints/objects/membership/set';
import { GetAllUUIDMetadataRequest } from './endpoints/objects/uuid/get_all';
import { GetChannelMetadataRequest } from './endpoints/objects/channel/get';
import { SetChannelMetadataRequest } from './endpoints/objects/channel/set';
import { RemoveUUIDMetadataRequest } from './endpoints/objects/uuid/remove';
import { GetChannelMembersRequest } from './endpoints/objects/member/get';
import { SetChannelMembersRequest } from './endpoints/objects/member/set';
import { GetUUIDMetadataRequest } from './endpoints/objects/uuid/get';
import { SetUUIDMetadataRequest } from './endpoints/objects/uuid/set';
export default class PubNubObjects {
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
            const request = new GetAllUUIDMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
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
            const request = new GetUUIDMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
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
            const request = new SetUUIDMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
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
            const request = new RemoveUUIDMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
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
            const request = new GetAllChannelsMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
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
            const request = new GetChannelMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
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
            const request = new SetChannelMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
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
            const request = new RemoveChannelMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    getChannelMembers(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new GetChannelMembersRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    setChannelMembers(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new SetChannelMembersRequest(Object.assign(Object.assign({}, parameters), { type: 'set', keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    removeChannelMembers(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new SetChannelMembersRequest(Object.assign(Object.assign({}, parameters), { type: 'delete', keySet: this.keySet }));
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
            const request = new GetUUIDMembershipsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
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
            const request = new SetUUIDMembershipsRequest(Object.assign(Object.assign({}, parameters), { type: 'set', keySet: this.keySet }));
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
            const request = new SetUUIDMembershipsRequest(Object.assign(Object.assign({}, parameters), { type: 'delete', keySet: this.keySet }));
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
