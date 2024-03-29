"use strict";
/**
 * Fetch messages REST API module.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchMessagesRequest = void 0;
var PubNubError_1 = require("../../models/PubNubError");
var request_1 = require("../components/request");
var operations_1 = __importDefault(require("../constants/operations"));
var History = __importStar(require("../types/api/history"));
var utils_1 = require("../utils");
// --------------------------------------------------------
// ---------------------- Defaults ------------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether verbose logging enabled or not.
 */
var LOG_VERBOSITY = false;
/**
 * Whether associated message metadata should be returned or not.
 */
var INCLUDE_METADATA = true;
/**
 * Whether message type should be returned or not.
 */
var INCLUDE_MESSAGE_TYPE = true;
/**
 * Whether timetokens should be returned as strings by default or not.
 */
var STRINGIFY_TIMETOKENS = false;
/**
 * Whether message publisher `uuid` should be returned or not.
 */
var INCLUDE_UUID = true;
/**
 * Default number of messages which can be returned for single channel, and it is maximum as well.
 */
var SINGLE_CHANNEL_MESSAGES_COUNT = 100;
/**
 * Default number of messages which can be returned for multiple channels or when fetched
 * message actions.
 */
var MULTIPLE_CHANNELS_MESSAGES_COUNT = 25;
// endregion
/**
 * Fetch messages from channels request.
 */
var FetchMessagesRequest = /** @class */ (function (_super) {
    __extends(FetchMessagesRequest, _super);
    function FetchMessagesRequest(parameters) {
        var _a, _b, _c, _d, _e, _f;
        var _this = _super.call(this) || this;
        _this.parameters = parameters;
        // Apply defaults.
        var includeMessageActions = (_a = parameters.includeMessageActions) !== null && _a !== void 0 ? _a : false;
        var defaultCount = parameters.channels.length === 1 && includeMessageActions
            ? SINGLE_CHANNEL_MESSAGES_COUNT
            : MULTIPLE_CHANNELS_MESSAGES_COUNT;
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
        (_e = parameters.includeMeta) !== null && _e !== void 0 ? _e : (parameters.includeMeta = INCLUDE_METADATA);
        (_f = parameters.logVerbosity) !== null && _f !== void 0 ? _f : (parameters.logVerbosity = LOG_VERBOSITY);
        return _this;
    }
    FetchMessagesRequest.prototype.operation = function () {
        return operations_1.default.PNFetchMessagesOperation;
    };
    FetchMessagesRequest.prototype.validate = function () {
        var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channels = _a.channels, includeMessageActions = _a.includeMessageActions;
        if (!subscribeKey)
            return 'Missing Subscribe Key';
        if (!channels)
            return 'Missing channels';
        if (includeMessageActions && channels.length > 1)
            return ('History can return actions data for a single channel only. Either pass a single channel ' +
                'or disable the includeMessageActions flag.');
    };
    FetchMessagesRequest.prototype.parse = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var serviceResponse, responseChannels, channels;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                serviceResponse = this.deserializeResponse(response);
                if (!serviceResponse)
                    throw new PubNubError_1.PubNubError('Service response error, check status for details', (0, PubNubError_1.createValidationError)('Unable to deserialize service response'));
                responseChannels = (_a = serviceResponse.channels) !== null && _a !== void 0 ? _a : {};
                channels = {};
                Object.keys(responseChannels).forEach(function (channel) {
                    // Map service response to expected data object type structure.
                    channels[channel] = responseChannels[channel].map(function (payload) {
                        // `null` message type means regular message.
                        if (payload.message_type === null)
                            payload.message_type = History.PubNubMessageType.Message;
                        var processedPayload = _this.processPayload(channel, payload);
                        var item = {
                            channel: channel,
                            timetoken: payload.timetoken,
                            message: processedPayload.payload,
                            messageType: payload.message_type,
                            uuid: payload.uuid,
                        };
                        if (payload.actions) {
                            var itemWithActions = item;
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
                    return [2 /*return*/, { channels: responseChannels, more: serviceResponse.more }];
                return [2 /*return*/, { channels: responseChannels }];
            });
        });
    };
    Object.defineProperty(FetchMessagesRequest.prototype, "path", {
        get: function () {
            var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channels = _a.channels, includeMessageActions = _a.includeMessageActions;
            var endpoint = !includeMessageActions ? 'history' : 'history-with-actions';
            return "/v3/".concat(endpoint, "/sub-key/").concat(subscribeKey, "/channel/").concat((0, utils_1.encodeString)(channels.join(',')));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FetchMessagesRequest.prototype, "queryParameters", {
        get: function () {
            var _a = this.parameters, start = _a.start, end = _a.end, count = _a.count, includeMessageType = _a.includeMessageType, includeMeta = _a.includeMeta, includeUUID = _a.includeUUID, stringifiedTimeToken = _a.stringifiedTimeToken;
            return __assign(__assign(__assign(__assign(__assign(__assign({ max: count }, (start ? { start: start } : {})), (end ? { end: end } : {})), (stringifiedTimeToken ? { string_message_token: 'true' } : {})), (includeMeta ? { include_meta: 'true' } : {})), (includeUUID ? { include_uuid: 'true' } : {})), (includeMessageType ? { include_message_type: 'true' } : {}));
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Parse single channel data entry.
     *
     * @param channel - Channel for which {@link payload} should be processed.
     * @param payload - Source payload which should be processed and parsed to expected type.
     *
     * @returns
     */
    FetchMessagesRequest.prototype.processPayload = function (channel, payload) {
        var _a = this.parameters, crypto = _a.crypto, logVerbosity = _a.logVerbosity;
        if (!crypto || typeof payload.message !== 'string')
            return { payload: payload.message };
        var decryptedPayload;
        var error;
        try {
            var decryptedData = crypto.decrypt(payload.message);
            decryptedPayload =
                decryptedData instanceof ArrayBuffer
                    ? JSON.parse(FetchMessagesRequest.decoder.decode(decryptedData))
                    : decryptedData;
        }
        catch (err) {
            if (logVerbosity)
                console.log("decryption error", err.message);
            decryptedPayload = payload.message;
            error = "Error while decrypting message content: ".concat(err.message);
        }
        if (!error &&
            decryptedPayload &&
            payload.message_type == History.PubNubMessageType.Files &&
            typeof decryptedPayload === 'object' &&
            this.isFileMessage(decryptedPayload)) {
            var fileMessage = decryptedPayload;
            return {
                payload: {
                    message: fileMessage.message,
                    file: __assign(__assign({}, fileMessage.file), { url: this.parameters.getFileUrl({ channel: channel, id: fileMessage.file.id, name: fileMessage.file.name }) }),
                },
                error: error,
            };
        }
        return { payload: decryptedPayload, error: error };
    };
    /**
     * Check whether `payload` potentially represents file message.
     *
     * @param payload - Fetched message payload.
     *
     * @returns `true` if payload can be {@link History#FileMessage|FileMessage}.
     */
    FetchMessagesRequest.prototype.isFileMessage = function (payload) {
        return payload.file !== undefined;
    };
    return FetchMessagesRequest;
}(request_1.AbstractRequest));
exports.FetchMessagesRequest = FetchMessagesRequest;
