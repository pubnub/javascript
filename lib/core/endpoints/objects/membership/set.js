"use strict";
/**       */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var operations_1 = __importDefault(require("../../../constants/operations"));
var utils_1 = __importDefault(require("../../../utils"));
var endpoint = {
    getOperation: function () { return operations_1.default.PNSetMembershipsOperation; },
    validateParams: function (_, params) {
        if (!(params === null || params === void 0 ? void 0 : params.channels) || (params === null || params === void 0 ? void 0 : params.channels.length) === 0) {
            return 'Channels cannot be empty';
        }
    },
    usePatch: function () { return true; },
    patchURL: function (_a, params) {
        var _b;
        var config = _a.config;
        return "/v2/objects/".concat(config.subscribeKey, "/uuids/").concat(utils_1.default.encodeString((_b = params.uuid) !== null && _b !== void 0 ? _b : config.getUUID()), "/channels");
    },
    patchPayload: function (_, params) {
        var _a;
        return (_a = {
                set: [],
                delete: []
            },
            _a[params.type] = params.channels.map(function (channel) {
                if (typeof channel === 'string') {
                    return {
                        channel: {
                            id: channel,
                        },
                    };
                }
                return {
                    channel: { id: channel.id },
                    custom: channel.custom,
                    status: channel.status,
                };
            }),
            _a);
    },
    getRequestTimeout: function (_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    },
    isAuthSupported: function () { return true; },
    prepareParams: function (_modules, params) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        var queryParams = {};
        queryParams.include = ['channel.status', 'channel.type', 'status'];
        if (params === null || params === void 0 ? void 0 : params.include) {
            if ((_a = params.include) === null || _a === void 0 ? void 0 : _a.customFields) {
                queryParams.include.push('custom');
            }
            if ((_b = params.include) === null || _b === void 0 ? void 0 : _b.customChannelFields) {
                queryParams.include.push('channel.custom');
            }
            if ((_c = params.include) === null || _c === void 0 ? void 0 : _c.channelFields) {
                queryParams.include.push('channel');
            }
        }
        queryParams.include = queryParams.include.join(',');
        if ((_d = params === null || params === void 0 ? void 0 : params.include) === null || _d === void 0 ? void 0 : _d.totalCount) {
            queryParams.count = true;
        }
        if ((_e = params === null || params === void 0 ? void 0 : params.page) === null || _e === void 0 ? void 0 : _e.next) {
            queryParams.start = (_f = params.page) === null || _f === void 0 ? void 0 : _f.next;
        }
        if ((_g = params === null || params === void 0 ? void 0 : params.page) === null || _g === void 0 ? void 0 : _g.prev) {
            queryParams.end = (_h = params.page) === null || _h === void 0 ? void 0 : _h.prev;
        }
        if (params === null || params === void 0 ? void 0 : params.filter) {
            queryParams.filter = params.filter;
        }
        if (params.limit != null) {
            queryParams.limit = params.limit;
        }
        if (params === null || params === void 0 ? void 0 : params.sort) {
            queryParams.sort = Object.entries((_j = params.sort) !== null && _j !== void 0 ? _j : {}).map(function (_a) {
                var _b = __read(_a, 2), key = _b[0], value = _b[1];
                if (value === 'asc' || value === 'desc') {
                    return "".concat(key, ":").concat(value);
                }
                return key;
            });
        }
        return queryParams;
    },
    handleResponse: function (_, response) { return ({
        status: response.status,
        data: response.data,
        totalCount: response.totalCount,
        prev: response.prev,
        next: response.next,
    }); },
};
exports.default = endpoint;
