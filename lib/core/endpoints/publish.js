"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishRequest = void 0;
const pubnub_error_1 = require("../../errors/pubnub-error");
const transport_request_1 = require("../types/transport-request");
const request_1 = require("../components/request");
const operations_1 = __importDefault(require("../constants/operations"));
const base64_codec_1 = require("../components/base64_codec");
const utils_1 = require("../utils");
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether data is published used `POST` body or not.
 */
const SEND_BY_POST = false;
// endregion
/**
 * Data publish request.
 *
 * Request will normalize and encrypt (if required) provided data and push it to the specified
 * channel.
 *
 * @internal
 */
class PublishRequest extends request_1.AbstractRequest {
    /**
     * Construct data publish request.
     *
     * @param parameters - Request configuration.
     */
    constructor(parameters) {
        var _a;
        var _b;
        super({ method: parameters.sendByPost ? transport_request_1.TransportMethod.POST : transport_request_1.TransportMethod.GET });
        this.parameters = parameters;
        // Apply default request parameters.
        (_a = (_b = this.parameters).sendByPost) !== null && _a !== void 0 ? _a : (_b.sendByPost = SEND_BY_POST);
    }
    operation() {
        return operations_1.default.PNPublishOperation;
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
                throw new pubnub_error_1.PubNubError('Service response error, check status for details', (0, pubnub_error_1.createValidationError)('Unable to deserialize service response'));
            return { timetoken: serviceResponse[2] };
        });
    }
    get path() {
        const { message, channel, keySet } = this.parameters;
        const stringifiedPayload = this.prepareMessagePayload(message);
        return `/publish/${keySet.publishKey}/${keySet.subscribeKey}/0/${(0, utils_1.encodeString)(channel)}/0${!this.parameters.sendByPost ? `/${(0, utils_1.encodeString)(stringifiedPayload)}` : ''}`;
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
        return JSON.stringify(typeof encrypted === 'string' ? encrypted : (0, base64_codec_1.encode)(encrypted));
    }
}
exports.PublishRequest = PublishRequest;
