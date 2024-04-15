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
import { TransportMethod } from '../../../types/transport-request';
import { AbstractRequest } from '../../../components/request';
import RequestOperation from '../../../constants/operations';
import { encodeString } from '../../../utils';
const INCLUDE_CUSTOM_FIELDS = false;
const INCLUDE_TOTAL_COUNT = false;
const INCLUDE_CHANNEL_FIELDS = false;
const INCLUDE_CHANNEL_CUSTOM_FIELDS = false;
const LIMIT = 100;
export class SetUUIDMembershipsRequest extends AbstractRequest {
    constructor(parameters) {
        var _a, _b, _c, _d, _e, _f;
        var _g, _h, _j, _k;
        super({ method: TransportMethod.PATCH });
        this.parameters = parameters;
        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
        (_b = (_g = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_g.customFields = INCLUDE_CUSTOM_FIELDS);
        (_c = (_h = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_h.totalCount = INCLUDE_TOTAL_COUNT);
        (_d = (_j = parameters.include).channelFields) !== null && _d !== void 0 ? _d : (_j.channelFields = INCLUDE_CHANNEL_FIELDS);
        (_e = (_k = parameters.include).customChannelFields) !== null && _e !== void 0 ? _e : (_k.customChannelFields = INCLUDE_CHANNEL_CUSTOM_FIELDS);
        (_f = parameters.limit) !== null && _f !== void 0 ? _f : (parameters.limit = LIMIT);
        if (this.parameters.userId)
            this.parameters.uuid = this.parameters.userId;
    }
    operation() {
        return RequestOperation.PNSetMembershipsOperation;
    }
    validate() {
        const { uuid, channels } = this.parameters;
        if (!uuid)
            return "'uuid' cannot be empty";
        if (!channels || channels.length === 0)
            return 'Channels cannot be empty';
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
        const includeFlags = ['channel.status', 'channel.type', 'status'];
        if (include.customFields)
            includeFlags.push('custom');
        if (include.channelFields)
            includeFlags.push('channel');
        if (include.customChannelFields)
            includeFlags.push('channel.custom');
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ count: `${include.totalCount}` }, (includeFlags.length > 0 ? { include: includeFlags.join(',') } : {})), (filter ? { filter } : {})), ((page === null || page === void 0 ? void 0 : page.next) ? { start: page.next } : {})), ((page === null || page === void 0 ? void 0 : page.prev) ? { end: page.prev } : {})), (limit ? { limit } : {})), (sorting.length ? { sort: sorting } : {}));
    }
    get body() {
        const { channels, type } = this.parameters;
        return JSON.stringify({
            [`${type}`]: channels.map((channel) => {
                if (typeof channel === 'string') {
                    return { channel: { id: channel } };
                }
                else {
                    return { channel: { id: channel.id }, status: channel.status, custom: channel.custom };
                }
            }),
        });
    }
}
