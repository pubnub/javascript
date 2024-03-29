"use strict";
/**
 * PubNub Objects API module.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var get_all_1 = require("./endpoints/objects/channel/get_all");
var remove_1 = require("./endpoints/objects/channel/remove");
var get_1 = require("./endpoints/objects/membership/get");
var set_1 = require("./endpoints/objects/membership/set");
var get_all_2 = require("./endpoints/objects/uuid/get_all");
var get_2 = require("./endpoints/objects/channel/get");
var set_2 = require("./endpoints/objects/channel/set");
var remove_2 = require("./endpoints/objects/uuid/remove");
var get_3 = require("./endpoints/objects/member/get");
var set_3 = require("./endpoints/objects/member/set");
var get_4 = require("./endpoints/objects/uuid/get");
var PubNubObjects = /** @class */ (function () {
    function PubNubObjects(configuration, 
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    sendRequest) {
        this.configuration = configuration;
        this.sendRequest = sendRequest;
        this.keySet = configuration.keySet;
    }
    /**
     * Fetch a paginated list of UUID Metadata objects.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get all UUID metadata response or `void` in case if `callback` provided.
     */
    PubNubObjects.prototype.getAllUUIDMetadata = function (parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._getAllUUIDMetadata(parametersOrCallback, callback)];
            });
        });
    };
    /**
     * Fetch a paginated list of UUID Metadata objects.
     *
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get all UUID metadata response or `void` in case if `callback` provided.
     */
    PubNubObjects.prototype._getAllUUIDMetadata = function (parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var parameters, request;
            return __generator(this, function (_a) {
                parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
                callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
                request = new get_all_2.GetAllUUIDMetadataRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Fetch a specific UUID Metadata object.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get UUID metadata response or `void` in case if `callback` provided.
     */
    PubNubObjects.prototype.getUUIDMetadata = function (parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._getUUIDMetadata(parametersOrCallback, callback)];
            });
        });
    };
    /**
     * Fetch a specific UUID Metadata object.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get UUID metadata response or `void` in case if `callback` provided.
     */
    PubNubObjects.prototype._getUUIDMetadata = function (parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var parameters, request;
            var _a;
            return __generator(this, function (_b) {
                parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
                callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
                if (parameters.userId)
                    parameters.uuid = parameters.userId;
                (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
                request = new get_4.GetUUIDMetadataRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Update specific UUID Metadata object.
     *
     * @param parameters - Request configuration parameters. Will set UUID metadata for currently
     * configured PubNub client `uuid` if not set.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous set UUID metadata response or `void` in case if `callback` provided.
     */
    PubNubObjects.prototype.setUUIDMetadata = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._setUUIDMetadata(parameters, callback)];
            });
        });
    };
    /**
     * Update specific UUID Metadata object.
     *
     * @param parameters - Request configuration parameters. Will set UUID metadata for currently
     * configured PubNub client `uuid` if not set.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous set UUID metadata response or `void` in case if `callback` provided.
     */
    PubNubObjects.prototype._setUUIDMetadata = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            var _a;
            return __generator(this, function (_b) {
                if (parameters.userId)
                    parameters.uuid = parameters.userId;
                (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
                request = new get_4.GetUUIDMetadataRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Remove a specific UUID Metadata object.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous UUID metadata remove response or `void` in case if `callback` provided.
     */
    PubNubObjects.prototype.removeUUIDMetadata = function (parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._removeUUIDMetadata(parametersOrCallback, callback)];
            });
        });
    };
    /**
     * Remove a specific UUID Metadata object.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous UUID metadata remove response or `void` in case if `callback` provided.
     */
    PubNubObjects.prototype._removeUUIDMetadata = function (parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var parameters, request;
            var _a;
            return __generator(this, function (_b) {
                parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
                callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
                if (parameters.userId)
                    parameters.uuid = parameters.userId;
                (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
                request = new remove_2.RemoveUUIDMetadataRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Fetch a paginated list of Channel Metadata objects.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get all Channel metadata response or `void` in case if `callback`
     * provided.
     */
    PubNubObjects.prototype.getAllChannelMetadata = function (parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._getAllChannelMetadata(parametersOrCallback, callback)];
            });
        });
    };
    /**
     * Fetch a paginated list of Channel Metadata objects.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get all Channel metadata response or `void` in case if `callback`
     * provided.
     */
    PubNubObjects.prototype._getAllChannelMetadata = function (parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var parameters, request;
            return __generator(this, function (_a) {
                parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
                callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
                request = new get_all_1.GetAllChannelsMetadataRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Fetch Channel Metadata object.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get Channel metadata response or `void` in case if `callback` provided.
     */
    PubNubObjects.prototype.getChannelMetadata = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._getChannelMetadata(parameters, callback)];
            });
        });
    };
    /**
     * Fetch Channel Metadata object.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get Channel metadata response or `void` in case if `callback` provided.
     */
    PubNubObjects.prototype._getChannelMetadata = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new get_2.GetChannelMetadataRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Update specific Channel Metadata object.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous set Channel metadata response or `void` in case if `callback` provided.
     */
    PubNubObjects.prototype.setChannelMetadata = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._setChannelMetadata(parameters, callback)];
            });
        });
    };
    /**
     * Update specific Channel Metadata object.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous set Channel metadata response or `void` in case if `callback` provided.
     */
    PubNubObjects.prototype._setChannelMetadata = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new set_2.SetChannelMetadataRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Remove a specific Channel Metadata object.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous Channel metadata remove response or `void` in case if `callback`
     * provided.
     */
    PubNubObjects.prototype.removeChannelMetadata = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._removeChannelMetadata(parameters, callback)];
            });
        });
    };
    /**
     * Remove a specific Channel Metadata object.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous Channel metadata remove response or `void` in case if `callback`
     * provided.
     */
    PubNubObjects.prototype._removeChannelMetadata = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new remove_1.RemoveChannelMetadataRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Fetch a paginated list of Channel Member objects.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get Channel Members response or `void` in case if `callback` provided.
     */
    PubNubObjects.prototype.getChannelMembers = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new get_3.GetChannelMembersRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Update specific Channel Members list.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous update Channel members list response or `void` in case if `callback`
     * provided.
     */
    PubNubObjects.prototype.setChannelMembers = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new set_3.SetChannelMembersRequest(__assign(__assign({}, parameters), { type: 'set', keySet: this.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Remove Members from the Channel.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous Channel Members remove response or `void` in case if `callback` provided.
     */
    PubNubObjects.prototype.removeChannelMembers = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new set_3.SetChannelMembersRequest(__assign(__assign({}, parameters), { type: 'delete', keySet: this.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Fetch a specific UUID Memberships list.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get UUID Memberships response or `void` in case if `callback` provided.
     */
    PubNubObjects.prototype.getMemberships = function (parametersOrCallback, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var parameters, request;
            var _a;
            return __generator(this, function (_b) {
                parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
                callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
                if (parameters.userId)
                    parameters.uuid = parameters.userId;
                (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
                request = new get_1.GetUUIDMembershipsRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Update specific UUID Memberships list.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous update UUID Memberships list response or `void` in case if `callback`
     * provided.
     */
    PubNubObjects.prototype.setMemberships = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            var _a;
            return __generator(this, function (_b) {
                if (parameters.userId)
                    parameters.uuid = parameters.userId;
                (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
                request = new set_1.SetUUIDMembershipsRequest(__assign(__assign({}, parameters), { type: 'set', keySet: this.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Remove a specific UUID Memberships.
     *
     * @param parameters - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous UUID Memberships remove response or `void` in case if `callback`
     * provided.
     */
    PubNubObjects.prototype.removeMemberships = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            var _a;
            return __generator(this, function (_b) {
                if (parameters.userId)
                    parameters.uuid = parameters.userId;
                (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
                request = new set_1.SetUUIDMembershipsRequest(__assign(__assign({}, parameters), { type: 'delete', keySet: this.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    // endregion
    // endregion
    // --------------------------------------------------------
    // --------------------- Deprecated API -------------------
    // --------------------------------------------------------
    // region Deprecated
    /**
     * Fetch paginated list of specific Space members or specific User memberships.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get specific Space members or specific User memberships response.
     *
     * @deprecated Use {@link PubNubObjects#getChannelMembers} or {@link PubNubObjects#getMemberships} methods instead.
     */
    PubNubObjects.prototype.fetchMemberships = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var spaceParameters, mappedParameters_1, mapMembers_1, userParameters, mappedParameters, mapMemberships;
            var _a, _b;
            return __generator(this, function (_c) {
                if ('spaceId' in parameters) {
                    spaceParameters = parameters;
                    mappedParameters_1 = {
                        channel: (_a = spaceParameters.spaceId) !== null && _a !== void 0 ? _a : spaceParameters.channel,
                        filter: spaceParameters.filter,
                        limit: spaceParameters.limit,
                        page: spaceParameters.page,
                        include: __assign({}, spaceParameters.include),
                        sort: spaceParameters.sort
                            ? Object.fromEntries(Object.entries(spaceParameters.sort).map(function (_a) {
                                var _b = __read(_a, 2), key = _b[0], value = _b[1];
                                return [key.replace('user', 'uuid'), value];
                            }))
                            : undefined,
                    };
                    mapMembers_1 = function (response) {
                        return ({
                            status: response.status,
                            data: response.data.map(function (members) { return ({
                                user: members.uuid,
                                custom: members.custom,
                                updated: members.updated,
                                eTag: members.eTag,
                            }); }),
                            totalCount: response.totalCount,
                            next: response.next,
                            prev: response.prev,
                        });
                    };
                    if (callback)
                        return [2 /*return*/, this.getChannelMembers(mappedParameters_1, function (status, result) {
                                callback(status, result ? mapMembers_1(result) : result);
                            })];
                    return [2 /*return*/, this.getChannelMembers(mappedParameters_1).then(mapMembers_1)];
                }
                userParameters = parameters;
                mappedParameters = {
                    uuid: (_b = userParameters.userId) !== null && _b !== void 0 ? _b : userParameters.uuid,
                    filter: userParameters.filter,
                    limit: userParameters.limit,
                    page: userParameters.page,
                    include: __assign({}, userParameters.include),
                    sort: userParameters.sort
                        ? Object.fromEntries(Object.entries(userParameters.sort).map(function (_a) {
                            var _b = __read(_a, 2), key = _b[0], value = _b[1];
                            return [key.replace('space', 'channel'), value];
                        }))
                        : undefined,
                };
                mapMemberships = function (response) {
                    return ({
                        status: response.status,
                        data: response.data.map(function (membership) { return ({
                            space: membership.channel,
                            custom: membership.custom,
                            updated: membership.updated,
                            eTag: membership.eTag,
                        }); }),
                        totalCount: response.totalCount,
                        next: response.next,
                        prev: response.prev,
                    });
                };
                if (callback)
                    return [2 /*return*/, this.getMemberships(mappedParameters, function (status, result) {
                            callback(status, result ? mapMemberships(result) : result);
                        })];
                return [2 /*return*/, this.getMemberships(mappedParameters).then(mapMemberships)];
            });
        });
    };
    /**
     * Add members to specific Space or memberships specific User.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous add members to specific Space or memberships specific User response or
     * `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubObjects#setChannelMembers} or {@link PubNubObjects#setMemberships} methods instead.
     */
    PubNubObjects.prototype.addMemberships = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var spaceParameters, mappedParameters_2, userParameters, mappedParameters;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                if ('spaceId' in parameters) {
                    spaceParameters = parameters;
                    mappedParameters_2 = {
                        channel: (_a = spaceParameters.spaceId) !== null && _a !== void 0 ? _a : spaceParameters.channel,
                        uuids: (_c = (_b = spaceParameters.users) === null || _b === void 0 ? void 0 : _b.map(function (user) {
                            if (typeof user === 'string')
                                return user;
                            user.userId;
                            return { id: user.userId, custom: user.custom };
                        })) !== null && _c !== void 0 ? _c : spaceParameters.uuids,
                        limit: 0,
                    };
                    if (callback)
                        return [2 /*return*/, this.setChannelMembers(mappedParameters_2, callback)];
                    return [2 /*return*/, this.setChannelMembers(mappedParameters_2)];
                }
                userParameters = parameters;
                mappedParameters = {
                    uuid: (_d = userParameters.userId) !== null && _d !== void 0 ? _d : userParameters.uuid,
                    channels: (_f = (_e = userParameters.spaces) === null || _e === void 0 ? void 0 : _e.map(function (space) {
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
                    return [2 /*return*/, this.setMemberships(mappedParameters, callback)];
                return [2 /*return*/, this.setMemberships(mappedParameters)];
            });
        });
    };
    return PubNubObjects;
}());
exports.default = PubNubObjects;
