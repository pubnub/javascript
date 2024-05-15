"use strict";
/**
 * Publish File Message REST API module.
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
exports.PublishFileMessageRequest = void 0;
const pubnub_error_1 = require("../../../errors/pubnub-error");
const request_1 = require("../../components/request");
const operations_1 = __importDefault(require("../../constants/operations"));
const base64_codec_1 = require("../../components/base64_codec");
const utils_1 = require("../../utils");
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether published file messages should be stored in the channel's history.
 */
const STORE_IN_HISTORY = true;
// endregion
/**
 * Publish shared file information request.
 *
 * @internal
 */
class PublishFileMessageRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        var _a;
        var _b;
        super();
        this.parameters = parameters;
        // Apply default request parameters.
        (_a = (_b = this.parameters).storeInHistory) !== null && _a !== void 0 ? _a : (_b.storeInHistory = STORE_IN_HISTORY);
    }
    operation() {
        return operations_1.default.PNPublishFileMessageOperation;
    }
    validate() {
        const { channel, fileId, fileName } = this.parameters;
        if (!channel)
            return "channel can't be empty";
        if (!fileId)
            return "file id can't be empty";
        if (!fileName)
            return "file name can't be empty";
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
        const { message, channel, keySet: { publishKey, subscribeKey }, fileId, fileName, } = this.parameters;
        const fileMessage = Object.assign({ file: {
                name: fileName,
                id: fileId,
            } }, (message ? { message } : {}));
        return `/v1/files/publish-file/${publishKey}/${subscribeKey}/0/${(0, utils_1.encodeString)(channel)}/0/${(0, utils_1.encodeString)(this.prepareMessagePayload(fileMessage))}`;
    }
    get queryParameters() {
        const { storeInHistory, ttl, meta } = this.parameters;
        return Object.assign(Object.assign({ store: storeInHistory ? '1' : '0' }, (ttl ? { ttl } : {})), (meta && typeof meta === 'object' ? { meta: JSON.stringify(meta) } : {}));
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
exports.PublishFileMessageRequest = PublishFileMessageRequest;
