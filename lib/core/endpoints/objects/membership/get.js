"use strict";
/**
 * Get UUID Memberships REST API module.
 *
 * @internal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUUIDMembershipsRequest = void 0;
const request_1 = require("../../../components/request");
const operations_1 = __importDefault(require("../../../constants/operations"));
const utils_1 = require("../../../utils");
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether `Membership` custom field should be included in response or not.
 */
const INCLUDE_CUSTOM_FIELDS = false;
/**
 * Whether membership's `status` field should be included in response or not.
 */
const INCLUDE_STATUS = false;
/**
 * Whether membership's `type` field should be included in response or not.
 */
const INCLUDE_TYPE = false;
/**
 * Whether total number of memberships should be included in response or not.
 */
const INCLUDE_TOTAL_COUNT = false;
/**
 * Whether `Channel` fields should be included in response or not.
 */
const INCLUDE_CHANNEL_FIELDS = false;
/**
 * Whether `Channel` status field should be included in response or not.
 */
const INCLUDE_CHANNEL_STATUS_FIELD = false;
/**
 * Whether `Channel` type field should be included in response or not.
 */
const INCLUDE_CHANNEL_TYPE_FIELD = false;
/**
 * Whether `Channel` custom field should be included in response or not.
 */
const INCLUDE_CHANNEL_CUSTOM_FIELDS = false;
/**
 * Number of objects to return in response.
 */
const LIMIT = 100;
// endregion
/**
 * Get UUID Memberships request.
 *
 * @internal
 */
class GetUUIDMembershipsRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        var _l, _m, _o, _p, _q, _r, _s, _t;
        super();
        this.parameters = parameters;
        // Apply default request parameters.
        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
        (_b = (_l = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_l.customFields = INCLUDE_CUSTOM_FIELDS);
        (_c = (_m = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_m.totalCount = INCLUDE_TOTAL_COUNT);
        (_d = (_o = parameters.include).statusField) !== null && _d !== void 0 ? _d : (_o.statusField = INCLUDE_STATUS);
        (_e = (_p = parameters.include).typeField) !== null && _e !== void 0 ? _e : (_p.typeField = INCLUDE_TYPE);
        (_f = (_q = parameters.include).channelFields) !== null && _f !== void 0 ? _f : (_q.channelFields = INCLUDE_CHANNEL_FIELDS);
        (_g = (_r = parameters.include).customChannelFields) !== null && _g !== void 0 ? _g : (_r.customChannelFields = INCLUDE_CHANNEL_CUSTOM_FIELDS);
        (_h = (_s = parameters.include).channelStatusField) !== null && _h !== void 0 ? _h : (_s.channelStatusField = INCLUDE_CHANNEL_STATUS_FIELD);
        (_j = (_t = parameters.include).channelTypeField) !== null && _j !== void 0 ? _j : (_t.channelTypeField = INCLUDE_CHANNEL_TYPE_FIELD);
        (_k = parameters.limit) !== null && _k !== void 0 ? _k : (parameters.limit = LIMIT);
        // Remap for backward compatibility.
        if (this.parameters.userId)
            this.parameters.uuid = this.parameters.userId;
    }
    operation() {
        return operations_1.default.PNGetMembershipsOperation;
    }
    validate() {
        if (!this.parameters.uuid)
            return "'uuid' cannot be empty";
    }
    get path() {
        const { keySet: { subscribeKey }, uuid, } = this.parameters;
        return `/v2/objects/${subscribeKey}/uuids/${(0, utils_1.encodeString)(uuid)}/channels`;
    }
    get queryParameters() {
        const { include, page, filter, sort, limit } = this.parameters;
        let sorting = '';
        if (typeof sort === 'string')
            sorting = sort;
        else
            sorting = Object.entries(sort !== null && sort !== void 0 ? sort : {}).map(([option, order]) => (order !== null ? `${option}:${order}` : option));
        const includeFlags = [];
        if (include.statusField)
            includeFlags.push('status');
        if (include.typeField)
            includeFlags.push('type');
        if (include.customFields)
            includeFlags.push('custom');
        if (include.channelFields)
            includeFlags.push('channel');
        if (include.channelStatusField)
            includeFlags.push('channel.status');
        if (include.channelTypeField)
            includeFlags.push('channel.type');
        if (include.customChannelFields)
            includeFlags.push('channel.custom');
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ count: `${include.totalCount}` }, (includeFlags.length > 0 ? { include: includeFlags.join(',') } : {})), (filter ? { filter } : {})), ((page === null || page === void 0 ? void 0 : page.next) ? { start: page.next } : {})), ((page === null || page === void 0 ? void 0 : page.prev) ? { end: page.prev } : {})), (limit ? { limit } : {})), (sorting.length ? { sort: sorting } : {}));
    }
}
exports.GetUUIDMembershipsRequest = GetUUIDMembershipsRequest;
