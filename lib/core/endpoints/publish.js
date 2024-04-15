var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createValidationError, PubNubError } from '../../errors/pubnub-error';
import { TransportMethod } from '../types/transport-request';
import { AbstractRequest } from '../components/request';
import RequestOperation from '../constants/operations';
import { encode } from '../components/base64_codec';
import { encodeString } from '../utils';
const SEND_BY_POST = false;
export class PublishRequest extends AbstractRequest {
    constructor(parameters) {
        var _a;
        var _b;
        super({ method: parameters.sendByPost ? TransportMethod.POST : TransportMethod.GET });
        this.parameters = parameters;
        (_a = (_b = this.parameters).sendByPost) !== null && _a !== void 0 ? _a : (_b.sendByPost = SEND_BY_POST);
    }
    operation() {
        return RequestOperation.PNPublishOperation;
    }
    validate() {
        const { message, channel, keySet: { publishKey }, } = this.parameters;
        if (!channel)
            return "Missing 'channel'";
        if (!message)
            return "Missing 'message'";
        if (!publishKey)
            return "Missing 'publishKey'";
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse)
                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
            return { timetoken: serviceResponse[2] };
        });
    }
    get path() {
        const { message, channel, keySet } = this.parameters;
        const stringifiedPayload = this.prepareMessagePayload(message);
        return `/publish/${keySet.publishKey}/${keySet.subscribeKey}/0/${encodeString(channel)}/0${!this.parameters.sendByPost ? `/${encodeString(stringifiedPayload)}` : ''}`;
    }
    get queryParameters() {
        const { meta, replicate, storeInHistory, ttl } = this.parameters;
        const query = {};
        if (storeInHistory !== undefined)
            query.store = storeInHistory ? '1' : '0';
        if (ttl !== undefined)
            query.ttl = ttl;
        if (replicate !== undefined && !replicate)
            query.norep = 'true';
        if (meta && typeof meta === 'object')
            query.meta = JSON.stringify(meta);
        return query;
    }
    get headers() {
        return { 'Content-Type': 'application/json' };
    }
    get body() {
        return this.prepareMessagePayload(this.parameters.message);
    }
    prepareMessagePayload(payload) {
        const { crypto } = this.parameters;
        if (!crypto)
            return JSON.stringify(payload) || '';
        const encrypted = crypto.encrypt(JSON.stringify(payload));
        return JSON.stringify(typeof encrypted === 'string' ? encrypted : encode(encrypted));
    }
}
