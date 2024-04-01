/**
 * Publish REST API module.
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
import { createValidationError, PubnubError } from '../../errors/pubnub-error';
import { TransportMethod } from '../types/transport-request';
import { AbstractRequest } from '../components/request';
import RequestOperation from '../constants/operations';
import { encode } from '../components/base64_codec';
import { encodeString } from '../utils';
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether published data should be stored in history or not.
 */
const STORE_IN_HISTORY = true;
/**
 * Whether data is published used `POST` body or not.
 */
const SEND_BY_POST = false;
/**
 * Whether published data should be replicated across all data centers or not.
 */
const SHOULD_REPLICATE = true;
// endregion
/**
 * Data publish request.
 *
 * Request will normalize and encrypt (if required) provided data and push it to the specified
 * channel.
 */
export class PublishRequest extends AbstractRequest {
    /**
     * Construct data publish request.
     *
     * @param parameters - Request configuration.
     */
    constructor(parameters) {
        var _a, _b, _c;
        var _d, _e, _f;
        super({ method: parameters.sendByPost ? TransportMethod.POST : TransportMethod.GET });
        this.parameters = parameters;
        // Apply default request parameters.
        (_a = (_d = this.parameters).storeInHistory) !== null && _a !== void 0 ? _a : (_d.storeInHistory = STORE_IN_HISTORY);
        (_b = (_e = this.parameters).sendByPost) !== null && _b !== void 0 ? _b : (_e.sendByPost = SEND_BY_POST);
        // Apply defaults to the deprecated parameter.
        (_c = (_f = this.parameters).replicate) !== null && _c !== void 0 ? _c : (_f.replicate = SHOULD_REPLICATE);
    }
    operation() {
        return RequestOperation.PNPublishOperation;
    }
    validate() {
        const { message, channel, keySet: { publishKey }, } = this.parameters;
        if (!channel)
            return "Missing 'channel''";
        if (!message)
            return "Missing 'message'";
        if (!publishKey)
            return "Missing 'publishKey'";
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse)
                throw new PubnubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
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
        return Object.assign(Object.assign(Object.assign({ store: storeInHistory ? '1' : '0' }, (ttl !== undefined ? { ttl } : {})), (!replicate ? { norep: 'true' } : {})), (meta && typeof meta === 'object' ? { meta: JSON.stringify(meta) } : {}));
    }
    get headers() {
        return { 'Content-Type': 'application/json' };
    }
    get body() {
        return this.prepareMessagePayload(this.parameters.message);
    }
    /**
     * Pre-process provided data.
     *
     * Data will be "normalized" and encrypted if `cryptoModule` has been provided.
     *
     * @param payload - User-provided data which should be pre-processed before use.
     *
     * @returns Payload which can be used as part of request URL or body.
     *
     * @throws {Error} in case if provided `payload` or results of `encryption` can't be stringified.
     */
    prepareMessagePayload(payload) {
        const { crypto } = this.parameters;
        if (!crypto)
            return JSON.stringify(payload) || '';
        const encrypted = crypto.encrypt(JSON.stringify(payload));
        return JSON.stringify(typeof encrypted === 'string' ? encrypted : encode(encrypted));
    }
}
