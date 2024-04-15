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
import { encodeString } from '../../../utils';
const INCLUDE_CUSTOM_FIELDS = false;
const INCLUDE_STATUS = false;
const INCLUDE_TOTAL_COUNT = false;
const INCLUDE_CHANNEL_FIELDS = false;
const INCLUDE_CHANNEL_STATUS_FIELD = false;
const INCLUDE_CHANNEL_TYPE_FIELD = false;
const INCLUDE_CHANNEL_CUSTOM_FIELDS = false;
const LIMIT = 100;
export class GetUUIDMembershipsRequest extends AbstractRequest {
    constructor(parameters) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        var _k, _l, _m, _o, _p, _q, _r;
        super();
        this.parameters = parameters;
        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
        (_b = (_k = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_k.customFields = INCLUDE_CUSTOM_FIELDS);
        (_c = (_l = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_l.totalCount = INCLUDE_TOTAL_COUNT);
        (_d = (_m = parameters.include).statusField) !== null && _d !== void 0 ? _d : (_m.statusField = INCLUDE_STATUS);
        (_e = (_o = parameters.include).channelFields) !== null && _e !== void 0 ? _e : (_o.channelFields = INCLUDE_CHANNEL_FIELDS);
        (_f = (_p = parameters.include).customChannelFields) !== null && _f !== void 0 ? _f : (_p.customChannelFields = INCLUDE_CHANNEL_CUSTOM_FIELDS);
        (_g = (_q = parameters.include).channelStatusField) !== null && _g !== void 0 ? _g : (_q.channelStatusField = INCLUDE_CHANNEL_STATUS_FIELD);
        (_h = (_r = parameters.include).channelTypeField) !== null && _h !== void 0 ? _h : (_r.channelTypeField = INCLUDE_CHANNEL_TYPE_FIELD);
        (_j = parameters.limit) !== null && _j !== void 0 ? _j : (parameters.limit = LIMIT);
        if (this.parameters.userId)
            this.parameters.uuid = this.parameters.userId;
    }
    operation() {
        return RequestOperation.PNGetMembershipsOperation;
    }
    validate() {
        if (!this.parameters.uuid)
            return "'uuid' cannot be empty";
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
        const { keySet: { subscribeKey }, uuid, } = this.parameters;
        return `/v2/objects/${subscribeKey}/uuids/${encodeString(uuid)}/channels`;
    }
    get queryParameters() {
        const { include, page, filter, sort, limit } = this.parameters;
        const sorting = Object.entries(sort !== null && sort !== void 0 ? sort : {}).map(([option, order]) => order !== null ? `${option}:${order}` : option);
        const includeFlags = [];
        if (include.statusField)
            includeFlags.push('status');
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
