/**
 * Get All UUID Metadata REST API module.
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
import { createValidationError, PubnubError } from '../../../../errors/pubnub-error';
import { AbstractRequest } from '../../../components/request';
import RequestOperation from '../../../constants/operations';
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether `Channel` custom field should be included by default or not.
 */
const INCLUDE_CUSTOM_FIELDS = false;
/**
 * Whether to fetch total count or not.
 */
const INCLUDE_TOTAL_COUNT = false;
/**
 * Number of objects to return in response.
 */
const LIMIT = 100;
// endregion
export class GetAllUUIDMetadataRequest extends AbstractRequest {
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
        return RequestOperation.PNGetAllUUIDMetadataOperation;
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse)
                throw new PubnubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
            return serviceResponse;
        });
    }
    get path() {
        return `/v2/objects/${this.parameters.keySet.subscribeKey}/uuids`;
    }
    get queryParameters() {
        const { include, page, filter, sort, limit } = this.parameters;
        const sorting = Object.entries(sort !== null && sort !== void 0 ? sort : {}).map(([option, order]) => order !== null ? `${option}:${order}` : option);
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ include: ['status', 'type', ...(include.customFields ? ['custom'] : [])].join(','), count: `${include.totalCount}` }, (filter ? { filter } : {})), ((page === null || page === void 0 ? void 0 : page.next) ? { start: page.next } : {})), ((page === null || page === void 0 ? void 0 : page.prev) ? { end: page.prev } : {})), (limit ? { limit } : {})), (sorting.length ? { sort: sorting } : {}));
    }
}
