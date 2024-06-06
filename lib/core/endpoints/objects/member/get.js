"use strict";
/**
 * Get Channel Members REST API module.
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetChannelMembersRequest = void 0;
const pubnub_error_1 = require("../../../../errors/pubnub-error");
const pubnub_api_error_1 = require("../../../../errors/pubnub-api-error");
const request_1 = require("../../../components/request");
const operations_1 = __importDefault(require("../../../constants/operations"));
const utils_1 = require("../../../utils");
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether `Member` custom field should be included in response or not.
 */
const INCLUDE_CUSTOM_FIELDS = false;
/**
 * Whether member's status field should be included in response or not.
 */
const INCLUDE_STATUS = false;
/**
 * Whether total number of members should be included in response or not.
 */
const INCLUDE_TOTAL_COUNT = false;
/**
 * Whether `UUID` fields should be included in response or not.
 */
const INCLUDE_UUID_FIELDS = false;
/**
 * Whether `UUID` status field should be included in response or not.
 */
const INCLUDE_UUID_STATUS_FIELD = false;
/**
 * Whether `UUID` type field should be included in response or not.
 */
const INCLUDE_UUID_TYPE_FIELD = false;
/**
 * Whether `UUID` custom field should be included in response or not.
 */
const INCLUDE_UUID_CUSTOM_FIELDS = false;
/**
 * Number of objects to return in response.
 */
const LIMIT = 100;
// endregion
/**
 * Get Channel Members request.
 *
 * @internal
 */
class GetChannelMembersRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        var _k, _l, _m, _o, _p, _q, _r;
        super();
        this.parameters = parameters;
        // Apply default request parameters.
        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
        (_b = (_k = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_k.customFields = INCLUDE_CUSTOM_FIELDS);
        (_c = (_l = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_l.totalCount = INCLUDE_TOTAL_COUNT);
        (_d = (_m = parameters.include).statusField) !== null && _d !== void 0 ? _d : (_m.statusField = INCLUDE_STATUS);
        (_e = (_o = parameters.include).UUIDFields) !== null && _e !== void 0 ? _e : (_o.UUIDFields = INCLUDE_UUID_FIELDS);
        (_f = (_p = parameters.include).customUUIDFields) !== null && _f !== void 0 ? _f : (_p.customUUIDFields = INCLUDE_UUID_CUSTOM_FIELDS);
        (_g = (_q = parameters.include).UUIDStatusField) !== null && _g !== void 0 ? _g : (_q.UUIDStatusField = INCLUDE_UUID_STATUS_FIELD);
        (_h = (_r = parameters.include).UUIDTypeField) !== null && _h !== void 0 ? _h : (_r.UUIDTypeField = INCLUDE_UUID_TYPE_FIELD);
        (_j = parameters.limit) !== null && _j !== void 0 ? _j : (parameters.limit = LIMIT);
    }
    operation() {
        return operations_1.default.PNSetMembersOperation;
    }
    validate() {
        if (!this.parameters.channel)
            return 'Channel cannot be empty';
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse) {
                throw new pubnub_error_1.PubNubError('Service response error, check status for details', (0, pubnub_error_1.createValidationError)('Unable to deserialize service response'));
            }
            else if (serviceResponse.status >= 400)
                throw pubnub_api_error_1.PubNubAPIError.create(response);
            return serviceResponse;
        });
    }
    get path() {
        const { keySet: { subscribeKey }, channel, } = this.parameters;
        return `/v2/objects/${subscribeKey}/channels/${(0, utils_1.encodeString)(channel)}/uuids`;
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
        if (include.customFields)
            includeFlags.push('custom');
        if (include.UUIDFields)
            includeFlags.push('uuid');
        if (include.UUIDStatusField)
            includeFlags.push('uuid.status');
        if (include.UUIDTypeField)
            includeFlags.push('uuid.type');
        if (include.customUUIDFields)
            includeFlags.push('uuid.custom');
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ count: `${include.totalCount}` }, (includeFlags.length > 0 ? { include: includeFlags.join(',') } : {})), (filter ? { filter } : {})), ((page === null || page === void 0 ? void 0 : page.next) ? { start: page.next } : {})), ((page === null || page === void 0 ? void 0 : page.prev) ? { end: page.prev } : {})), (limit ? { limit } : {})), (sorting.length ? { sort: sorting } : {}));
    }
}
exports.GetChannelMembersRequest = GetChannelMembersRequest;
