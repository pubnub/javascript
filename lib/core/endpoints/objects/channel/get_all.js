var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createValidationError, PubNubError } from '../../../../errors/pubnub-error';
import { PubNubAPIError } from '../../../../errors/pubnub-api-error';
import { AbstractRequest } from '../../../components/request';
import RequestOperation from '../../../constants/operations';
const INCLUDE_CUSTOM_FIELDS = false;
const INCLUDE_TOTAL_COUNT = false;
const LIMIT = 100;
export class GetAllChannelsMetadataRequest extends AbstractRequest {
    constructor(parameters) {
        var _a, _b, _c, _d;
        var _e, _f;
        super();
        this.parameters = parameters;
        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
        (_b = (_e = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_e.customFields = INCLUDE_CUSTOM_FIELDS);
        (_c = (_f = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_f.totalCount = INCLUDE_TOTAL_COUNT);
        (_d = parameters.limit) !== null && _d !== void 0 ? _d : (parameters.limit = LIMIT);
    }
    operation() {
        return RequestOperation.PNGetAllChannelMetadataOperation;
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse) {
                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
            }
            else if (serviceResponse.status >= 400)
                throw PubNubAPIError.create(response);
            return serviceResponse;
        });
    }
    get path() {
        return `/v2/objects/${this.parameters.keySet.subscribeKey}/channels`;
    }
    get queryParameters() {
        const { include, page, filter, sort, limit } = this.parameters;
        const sorting = Object.entries(sort !== null && sort !== void 0 ? sort : {}).map(([option, order]) => order !== null ? `${option}:${order}` : option);
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ include: ['status', 'type', ...(include.customFields ? ['custom'] : [])].join(','), count: `${include.totalCount}` }, (filter ? { filter } : {})), ((page === null || page === void 0 ? void 0 : page.next) ? { start: page.next } : {})), ((page === null || page === void 0 ? void 0 : page.prev) ? { end: page.prev } : {})), (limit ? { limit } : {})), (sorting.length ? { sort: sorting } : {}));
    }
}
