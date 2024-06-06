"use strict";
/**
 * Set Channel Members REST API module.
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
exports.SetChannelMembersRequest = void 0;
const pubnub_error_1 = require("../../../../errors/pubnub-error");
const pubnub_api_error_1 = require("../../../../errors/pubnub-api-error");
const transport_request_1 = require("../../../types/transport-request");
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
 * Whether total number of members should be included in response or not.
 */
const INCLUDE_TOTAL_COUNT = false;
/**
 * Whether `UUID` fields should be included in response or not.
 */
const INCLUDE_UUID_FIELDS = false;
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
 * Set Channel Members request.
 *
 * @internal
 */
class SetChannelMembersRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        var _a, _b, _c, _d, _e, _f;
        var _g, _h, _j, _k;
        super({ method: transport_request_1.TransportMethod.PATCH });
        this.parameters = parameters;
        // Apply default request parameters.
        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
        (_b = (_g = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_g.customFields = INCLUDE_CUSTOM_FIELDS);
        (_c = (_h = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_h.totalCount = INCLUDE_TOTAL_COUNT);
        (_d = (_j = parameters.include).UUIDFields) !== null && _d !== void 0 ? _d : (_j.UUIDFields = INCLUDE_UUID_FIELDS);
        (_e = (_k = parameters.include).customUUIDFields) !== null && _e !== void 0 ? _e : (_k.customUUIDFields = INCLUDE_UUID_CUSTOM_FIELDS);
        (_f = parameters.limit) !== null && _f !== void 0 ? _f : (parameters.limit = LIMIT);
    }
    operation() {
        return operations_1.default.PNSetMembersOperation;
    }
    validate() {
        const { channel, uuids } = this.parameters;
        if (!channel)
            return 'Channel cannot be empty';
        if (!uuids || uuids.length === 0)
            return 'UUIDs cannot be empty';
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
        const includeFlags = ['uuid.status', 'uuid.type', 'type'];
        if (include.customFields)
            includeFlags.push('custom');
        if (include.UUIDFields)
            includeFlags.push('uuid');
        if (include.customUUIDFields)
            includeFlags.push('uuid.custom');
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ count: `${include.totalCount}` }, (includeFlags.length > 0 ? { include: includeFlags.join(',') } : {})), (filter ? { filter } : {})), ((page === null || page === void 0 ? void 0 : page.next) ? { start: page.next } : {})), ((page === null || page === void 0 ? void 0 : page.prev) ? { end: page.prev } : {})), (limit ? { limit } : {})), (sorting.length ? { sort: sorting } : {}));
    }
    get body() {
        const { uuids, type } = this.parameters;
        return JSON.stringify({
            [`${type}`]: uuids.map((uuid) => {
                if (typeof uuid === 'string') {
                    return { uuid: { id: uuid } };
                }
                else {
                    return { uuid: { id: uuid.id }, status: uuid.status, custom: uuid.custom };
                }
            }),
        });
    }
}
exports.SetChannelMembersRequest = SetChannelMembersRequest;
