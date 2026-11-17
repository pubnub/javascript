"use strict";
/**
 * Publish File Message REST API module.
 *
 * @internal
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
const request_1 = require("../../components/request");
const operations_1 = __importDefault(require("../../constants/operations"));
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
    prepare() {
        const { crypto } = this.parameters;
        if (!crypto)
            return;
        return (0, utils_1.encryptMessagePayload)(crypto, this.fileMessage).then((encrypted) => {
            this.encryptedPayload = encrypted;
        });
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            return { timetoken: this.deserializeResponse(response)[2] };
        });
    }
    get path() {
        const { channel, keySet: { publishKey, subscribeKey }, } = this.parameters;
        return `/v1/files/publish-file/${publishKey}/${subscribeKey}/0/${(0, utils_1.encodeString)(channel)}/0/${(0, utils_1.encodeString)(this.prepareMessagePayload(this.fileMessage))}`;
    }
    /**
     * File message which should be published.
     *
     * @returns File message payload.
     */
    get fileMessage() {
        const { message, fileId, fileName } = this.parameters;
        return Object.assign({ file: {
                name: fileName,
                id: fileId,
            } }, (message ? { message } : {}));
    }
    get queryParameters() {
        const { customMessageType, storeInHistory, ttl, meta } = this.parameters;
        return Object.assign(Object.assign(Object.assign({ store: storeInHistory ? '1' : '0' }, (customMessageType ? { custom_message_type: customMessageType } : {})), (ttl ? { ttl } : {})), (meta && typeof meta === 'object' ? { meta: JSON.stringify(meta) } : {}));
    }
    /**
     * Pre-process provided data.
     *
     * Data will be "normalized" and use encrypted payload computed by {@link prepare} if `cryptoModule` has
     * been provided.
     *
     * @param payload - User-provided data which should be pre-processed before use.
     *
     * @returns Payload which can be used as part of request URL or body.
     *
     * @throws {Error} in case if provided `payload` can't be stringified or request hasn't been prepared.
     */
    prepareMessagePayload(payload) {
        if (!this.parameters.crypto)
            return JSON.stringify(payload) || '';
        if (this.encryptedPayload === undefined)
            throw new Error('Encryption error: request payload not prepared');
        return this.encryptedPayload;
    }
}
exports.PublishFileMessageRequest = PublishFileMessageRequest;
