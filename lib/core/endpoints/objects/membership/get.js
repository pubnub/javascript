"use strict";
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
    getOperation: function () { return operations_1.default.PNGetMembershipsOperation; },
    validateParams: function () {
        // No required parameters.
    },
    getURL: function (_a, params) {
        var _b;
        var config = _a.config;
        return "/v2/objects/".concat(config.subscribeKey, "/uuids/").concat(utils_1.default.encodeString((_b = params === null || params === void 0 ? void 0 : params.uuid) !== null && _b !== void 0 ? _b : config.getUUID()), "/channels");
    },
    getRequestTimeout: function (_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    },
    isAuthSupported: function () { return true; },
    prepareParams: function (_modules, params) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
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
            queryParams.count = (_e = params.include) === null || _e === void 0 ? void 0 : _e.totalCount;
        }
        if ((_f = params === null || params === void 0 ? void 0 : params.page) === null || _f === void 0 ? void 0 : _f.next) {
            queryParams.start = (_g = params.page) === null || _g === void 0 ? void 0 : _g.next;
        }
        if ((_h = params === null || params === void 0 ? void 0 : params.page) === null || _h === void 0 ? void 0 : _h.prev) {
            queryParams.end = (_j = params.page) === null || _j === void 0 ? void 0 : _j.prev;
        }
        if (params === null || params === void 0 ? void 0 : params.filter) {
            queryParams.filter = params.filter;
        }
        queryParams.limit = (_k = params === null || params === void 0 ? void 0 : params.limit) !== null && _k !== void 0 ? _k : 100;
        if (params === null || params === void 0 ? void 0 : params.sort) {
            queryParams.sort = Object.entries((_l = params.sort) !== null && _l !== void 0 ? _l : {}).map(function (_a) {
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
