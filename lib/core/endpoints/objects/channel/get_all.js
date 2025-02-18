"use strict";
/**
 * Get All Channel Metadata REST API module.
 *
 * @internal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllChannelsMetadataRequest = void 0;
const request_1 = require("../../../components/request");
const operations_1 = __importDefault(require("../../../constants/operations"));
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether `Channel` custom fields should be included in response or not.
 */
const INCLUDE_CUSTOM_FIELDS = false;
/**
 * Whether total number of channels should be included in response or not.
 */
const INCLUDE_TOTAL_COUNT = false;
/**
 * Number of objects to return in response.
 */
const LIMIT = 100;
// endregion
/**
 * Get All Channels Metadata request.
 *
 * @internal
 */
class GetAllChannelsMetadataRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        var _a, _b, _c, _d;
        var _e, _f;
        super();
        this.parameters = parameters;
        // Apply default request parameters.
        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
        (_b = (_e = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_e.customFields = INCLUDE_CUSTOM_FIELDS);
        (_c = (_f = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_f.totalCount = INCLUDE_TOTAL_COUNT);
        (_d = parameters.limit) !== null && _d !== void 0 ? _d : (parameters.limit = LIMIT);
    }
    operation() {
        return operations_1.default.PNGetAllChannelMetadataOperation;
    }
    get path() {
        return `/v2/objects/${this.parameters.keySet.subscribeKey}/channels`;
    }
    get queryParameters() {
        const { include, page, filter, sort, limit } = this.parameters;
        let sorting = '';
        if (typeof sort === 'string')
            sorting = sort;
        else
            sorting = Object.entries(sort !== null && sort !== void 0 ? sort : {}).map(([option, order]) => (order !== null ? `${option}:${order}` : option));
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ include: ['status', 'type', ...(include.customFields ? ['custom'] : [])].join(','), count: `${include.totalCount}` }, (filter ? { filter } : {})), ((page === null || page === void 0 ? void 0 : page.next) ? { start: page.next } : {})), ((page === null || page === void 0 ? void 0 : page.prev) ? { end: page.prev } : {})), (limit ? { limit } : {})), (sorting.length ? { sort: sorting } : {}));
    }
}
exports.GetAllChannelsMetadataRequest = GetAllChannelsMetadataRequest;
