"use strict";
/**
 * Fetch messages REST API module.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.FetchMessagesRequest = void 0;
const pubnub_error_1 = require("../../errors/pubnub-error");
const pubnub_api_error_1 = require("../../errors/pubnub-api-error");
const request_1 = require("../components/request");
const operations_1 = __importDefault(require("../constants/operations"));
const History = __importStar(require("../types/api/history"));
const utils_1 = require("../utils");
// --------------------------------------------------------
// ---------------------- Defaults ------------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether verbose logging enabled or not.
 */
const LOG_VERBOSITY = false;
/**
 * Whether message type should be returned or not.
 */
const INCLUDE_MESSAGE_TYPE = true;
/**
 * Whether timetokens should be returned as strings by default or not.
 */
const STRINGIFY_TIMETOKENS = false;
/**
 * Whether message publisher `uuid` should be returned or not.
 */
const INCLUDE_UUID = true;
/**
 * Default number of messages which can be returned for single channel, and it is maximum as well.
 */
const SINGLE_CHANNEL_MESSAGES_COUNT = 100;
/**
 * Default number of messages which can be returned for multiple channels or when fetched
 * message actions.
 */
const MULTIPLE_CHANNELS_MESSAGES_COUNT = 25;
// endregion
/**
 * Fetch messages from channels request.
 *
 * @internal
 */
class FetchMessagesRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        var _a, _b, _c, _d, _e;
        super();
        this.parameters = parameters;
        // Apply defaults.
        const includeMessageActions = (_a = parameters.includeMessageActions) !== null && _a !== void 0 ? _a : false;
        const defaultCount = parameters.channels.length > 1 || includeMessageActions
            ? MULTIPLE_CHANNELS_MESSAGES_COUNT
            : SINGLE_CHANNEL_MESSAGES_COUNT;
        if (!parameters.count)
            parameters.count = defaultCount;
        else
            parameters.count = Math.min(parameters.count, defaultCount);
        if (parameters.includeUuid)
            parameters.includeUUID = parameters.includeUuid;
        else
            (_b = parameters.includeUUID) !== null && _b !== void 0 ? _b : (parameters.includeUUID = INCLUDE_UUID);
        (_c = parameters.stringifiedTimeToken) !== null && _c !== void 0 ? _c : (parameters.stringifiedTimeToken = STRINGIFY_TIMETOKENS);
        (_d = parameters.includeMessageType) !== null && _d !== void 0 ? _d : (parameters.includeMessageType = INCLUDE_MESSAGE_TYPE);
        (_e = parameters.logVerbosity) !== null && _e !== void 0 ? _e : (parameters.logVerbosity = LOG_VERBOSITY);
    }
    operation() {
        return operations_1.default.PNFetchMessagesOperation;
    }
    validate() {
        const { keySet: { subscribeKey }, channels, includeMessageActions, } = this.parameters;
        if (!subscribeKey)
            return 'Missing Subscribe Key';
        if (!channels)
            return 'Missing channels';
        if (includeMessageActions !== undefined && includeMessageActions && channels.length > 1)
            return ('History can return actions data for a single channel only. Either pass a single channel ' +
                'or disable the includeMessageActions flag.');
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse) {
                throw new pubnub_error_1.PubNubError('Service response error, check status for details', (0, pubnub_error_1.createValidationError)('Unable to deserialize service response'));
            }
            else if (serviceResponse.status >= 400)
                throw pubnub_api_error_1.PubNubAPIError.create(response);
            const responseChannels = (_a = serviceResponse.channels) !== null && _a !== void 0 ? _a : {};
            const channels = {};
            Object.keys(responseChannels).forEach((channel) => {
                // Map service response to expected data object type structure.
                channels[channel] = responseChannels[channel].map((payload) => {
                    // `null` message type means regular message.
                    if (payload.message_type === null)
                        payload.message_type = History.PubNubMessageType.Message;
                    const processedPayload = this.processPayload(channel, payload);
                    const item = {
                        channel,
                        timetoken: payload.timetoken,
                        message: processedPayload.payload,
                        messageType: payload.message_type,
                        uuid: payload.uuid,
                    };
                    if (payload.actions) {
                        const itemWithActions = item;
                        itemWithActions.actions = payload.actions;
                        // Backward compatibility for existing users.
                        // TODO: Remove in next release.
                        itemWithActions.data = payload.actions;
                    }
                    if (payload.meta)
                        item.meta = payload.meta;
                    if (processedPayload.error)
                        item.error = processedPayload.error;
                    return item;
                });
            });
            if (serviceResponse.more)
                return { channels, more: serviceResponse.more };
            return { channels };
        });
    }
    get path() {
        const { keySet: { subscribeKey }, channels, includeMessageActions, } = this.parameters;
        const endpoint = !includeMessageActions ? 'history' : 'history-with-actions';
        return `/v3/${endpoint}/sub-key/${subscribeKey}/channel/${(0, utils_1.encodeNames)(channels)}`;
    }
    get queryParameters() {
        const { start, end, count, includeMessageType, includeMeta, includeUUID, stringifiedTimeToken } = this.parameters;
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ max: count }, (start ? { start } : {})), (end ? { end } : {})), (stringifiedTimeToken ? { string_message_token: 'true' } : {})), (includeMeta !== undefined && includeMeta ? { include_meta: 'true' } : {})), (includeUUID ? { include_uuid: 'true' } : {})), (includeMessageType ? { include_message_type: 'true' } : {}));
    }
    /**
     * Parse single channel data entry.
     *
     * @param channel - Channel for which {@link payload} should be processed.
     * @param payload - Source payload which should be processed and parsed to expected type.
     *
     * @returns
     */
    processPayload(channel, payload) {
        const { crypto, logVerbosity } = this.parameters;
        if (!crypto || typeof payload.message !== 'string')
            return { payload: payload.message };
        let decryptedPayload;
        let error;
        try {
            const decryptedData = crypto.decrypt(payload.message);
            decryptedPayload =
                decryptedData instanceof ArrayBuffer
                    ? JSON.parse(FetchMessagesRequest.decoder.decode(decryptedData))
                    : decryptedData;
        }
        catch (err) {
            if (logVerbosity)
                console.log(`decryption error`, err.message);
            decryptedPayload = payload.message;
            error = `Error while decrypting message content: ${err.message}`;
        }
        if (!error &&
            decryptedPayload &&
            payload.message_type == History.PubNubMessageType.Files &&
            typeof decryptedPayload === 'object' &&
            this.isFileMessage(decryptedPayload)) {
            const fileMessage = decryptedPayload;
            return {
                payload: {
                    message: fileMessage.message,
                    file: Object.assign(Object.assign({}, fileMessage.file), { url: this.parameters.getFileUrl({ channel, id: fileMessage.file.id, name: fileMessage.file.name }) }),
                },
                error,
            };
        }
        return { payload: decryptedPayload, error };
    }
    /**
     * Check whether `payload` potentially represents file message.
     *
     * @param payload - Fetched message payload.
     *
     * @returns `true` if payload can be {@link History#FileMessage|FileMessage}.
     */
    isFileMessage(payload) {
        return payload.file !== undefined;
    }
}
exports.FetchMessagesRequest = FetchMessagesRequest;
