"use strict";
/**
 * Get history REST API module.
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
exports.GetHistoryRequest = void 0;
const pubnub_error_1 = require("../../../errors/pubnub-error");
const request_1 = require("../../components/request");
const operations_1 = __importDefault(require("../../constants/operations"));
const utils_1 = require("../../utils");
// --------------------------------------------------------
// ---------------------- Defaults ------------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether verbose logging enabled or not.
 */
const LOG_VERBOSITY = false;
/**
 * Whether associated message metadata should be returned or not.
 */
const INCLUDE_METADATA = false;
/**
 * Whether timetokens should be returned as strings by default or not.
 */
const STRINGIFY_TIMETOKENS = false;
/**
 * Default and maximum number of messages which should be returned.
 */
const MESSAGES_COUNT = 100;
// endregion
/**
 * Get single channel messages request.
 *
 * @internal
 */
class GetHistoryRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        var _a, _b, _c;
        super();
        this.parameters = parameters;
        // Apply defaults.
        if (parameters.count)
            parameters.count = Math.min(parameters.count, MESSAGES_COUNT);
        else
            parameters.count = MESSAGES_COUNT;
        (_a = parameters.stringifiedTimeToken) !== null && _a !== void 0 ? _a : (parameters.stringifiedTimeToken = STRINGIFY_TIMETOKENS);
        (_b = parameters.includeMeta) !== null && _b !== void 0 ? _b : (parameters.includeMeta = INCLUDE_METADATA);
        (_c = parameters.logVerbosity) !== null && _c !== void 0 ? _c : (parameters.logVerbosity = LOG_VERBOSITY);
    }
    operation() {
        return operations_1.default.PNHistoryOperation;
    }
    validate() {
        if (!this.parameters.keySet.subscribeKey)
            return 'Missing Subscribe Key';
        if (!this.parameters.channel)
            return 'Missing channel';
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse)
                throw new pubnub_error_1.PubNubError('Service response error, check status for details', (0, pubnub_error_1.createValidationError)('Unable to deserialize service response'));
            const messages = serviceResponse[0];
            const startTimeToken = serviceResponse[1];
            const endTimeToken = serviceResponse[2];
            // Handle malformed get history response.
            if (!Array.isArray(messages))
                return { messages: [], startTimeToken, endTimeToken };
            return {
                messages: messages.map((payload) => {
                    const processedPayload = this.processPayload(payload.message);
                    const item = {
                        entry: processedPayload.payload,
                        timetoken: payload.timetoken,
                    };
                    if (processedPayload.error)
                        item.error = processedPayload.error;
                    if (payload.meta)
                        item.meta = payload.meta;
                    return item;
                }),
                startTimeToken,
                endTimeToken,
            };
        });
    }
    get path() {
        const { keySet: { subscribeKey }, channel, } = this.parameters;
        return `/v2/history/sub-key/${subscribeKey}/channel/${(0, utils_1.encodeString)(channel)}`;
    }
    get queryParameters() {
        const { start, end, reverse, count, stringifiedTimeToken, includeMeta } = this.parameters;
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ count: count, include_token: 'true' }, (start ? { start } : {})), (end ? { end } : {})), (stringifiedTimeToken ? { string_message_token: 'true' } : {})), (reverse !== undefined && reverse !== null ? { reverse: reverse.toString() } : {})), (includeMeta ? { include_meta: 'true' } : {}));
    }
    processPayload(payload) {
        const { crypto, logVerbosity } = this.parameters;
        if (!crypto || typeof payload !== 'string')
            return { payload };
        let decryptedPayload;
        let error;
        try {
            const decryptedData = crypto.decrypt(payload);
            decryptedPayload =
                decryptedData instanceof ArrayBuffer
                    ? JSON.parse(GetHistoryRequest.decoder.decode(decryptedData))
                    : decryptedData;
        }
        catch (err) {
            if (logVerbosity)
                console.log(`decryption error`, err.message);
            decryptedPayload = payload;
            error = `Error while decrypting message content: ${err.message}`;
        }
        return {
            payload: decryptedPayload,
            error,
        };
    }
}
exports.GetHistoryRequest = GetHistoryRequest;
