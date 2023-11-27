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
    getOperation: function () { return operations_1.default.PNGetMembersOperation; },
    validateParams: function (_, params) {
        if (!(params === null || params === void 0 ? void 0 : params.channel)) {
            return 'channel cannot be empty';
        }
    },
    getURL: function (_a, params) {
        var config = _a.config;
        return "/v2/objects/".concat(config.subscribeKey, "/channels/").concat(utils_1.default.encodeString(params.channel), "/uuids");
    },
    getRequestTimeout: function (_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    },
    isAuthSupported: function () { return true; },
    prepareParams: function (_modules, params) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        var queryParams = {};
        queryParams.include = [];
        if (params === null || params === void 0 ? void 0 : params.include) {
            if ((_a = params.include) === null || _a === void 0 ? void 0 : _a.statusField) {
                queryParams.include.push('status');
            }
            if ((_b = params.include) === null || _b === void 0 ? void 0 : _b.customFields) {
                queryParams.include.push('custom');
            }
            if ((_c = params.include) === null || _c === void 0 ? void 0 : _c.UUIDFields) {
                queryParams.include.push('uuid');
            }
            if ((_d = params.include) === null || _d === void 0 ? void 0 : _d.customUUIDFields) {
                queryParams.include.push('uuid.custom');
            }
            if ((_e = params.include) === null || _e === void 0 ? void 0 : _e.UUIDStatusField) {
                queryParams.include.push('uuid.status');
            }
            if ((_f = params.include) === null || _f === void 0 ? void 0 : _f.UUIDTypeField) {
                queryParams.include.push('uuid.type');
            }
        }
        queryParams.include = queryParams.include.join(',');
        if ((_g = params === null || params === void 0 ? void 0 : params.include) === null || _g === void 0 ? void 0 : _g.totalCount) {
            queryParams.count = (_h = params.include) === null || _h === void 0 ? void 0 : _h.totalCount;
        }
        if ((_j = params === null || params === void 0 ? void 0 : params.page) === null || _j === void 0 ? void 0 : _j.next) {
            queryParams.start = (_k = params.page) === null || _k === void 0 ? void 0 : _k.next;
        }
        if ((_l = params === null || params === void 0 ? void 0 : params.page) === null || _l === void 0 ? void 0 : _l.prev) {
            queryParams.end = (_m = params.page) === null || _m === void 0 ? void 0 : _m.prev;
        }
        if (params === null || params === void 0 ? void 0 : params.filter) {
            queryParams.filter = params.filter;
        }
        queryParams.limit = (_o = params === null || params === void 0 ? void 0 : params.limit) !== null && _o !== void 0 ? _o : 100;
        if (params === null || params === void 0 ? void 0 : params.sort) {
            queryParams.sort = Object.entries((_p = params.sort) !== null && _p !== void 0 ? _p : {}).map(function (_a) {
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
