"use strict";
/**
 * Subscription REST API module.
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscribeRequest = exports.BaseSubscribeRequest = exports.PubNubEventType = void 0;
var PubNubError_1 = require("../../models/PubNubError");
var request_1 = require("../components/request");
var operations_1 = __importDefault(require("../constants/operations"));
var utils_1 = require("../utils");
// --------------------------------------------------------
// ---------------------- Defaults ------------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether should subscribe to channels / groups presence announcements or not.
 */
var WITH_PRESENCE = false;
// endregion
// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types
/**
 * PubNub-defined event types by payload.
 */
var PubNubEventType;
(function (PubNubEventType) {
    /**
     * Presence change event.
     */
    PubNubEventType[PubNubEventType["Presence"] = -2] = "Presence";
    /**
     * Regular message event.
     *
     * **Note:** This is default type assigned for non-presence events if `e` field is missing.
     */
    PubNubEventType[PubNubEventType["Message"] = -1] = "Message";
    /**
     * Signal data event.
     */
    PubNubEventType[PubNubEventType["Signal"] = 1] = "Signal";
    /**
     * App Context object event.
     */
    PubNubEventType[PubNubEventType["AppContext"] = 2] = "AppContext";
    /**
     * Message reaction event.
     */
    PubNubEventType[PubNubEventType["MessageAction"] = 3] = "MessageAction";
    /**
     * Files event.
     */
    PubNubEventType[PubNubEventType["Files"] = 4] = "Files";
})(PubNubEventType || (exports.PubNubEventType = PubNubEventType = {}));
// endregion
/**
 * Base subscription request implementation.
 *
 * Subscription request used in small variations in two cases:
 * - subscription manager
 * - event engine
 */
var BaseSubscribeRequest = /** @class */ (function (_super) {
    __extends(BaseSubscribeRequest, _super);
    function BaseSubscribeRequest(parameters) {
        var _a, _b, _c;
        var _d, _e, _f;
        var _this = _super.call(this, { cancellable: true }) || this;
        _this.parameters = parameters;
        // Apply default request parameters.
        (_a = (_d = _this.parameters).withPresence) !== null && _a !== void 0 ? _a : (_d.withPresence = WITH_PRESENCE);
        (_b = (_e = _this.parameters).channelGroups) !== null && _b !== void 0 ? _b : (_e.channelGroups = []);
        (_c = (_f = _this.parameters).channels) !== null && _c !== void 0 ? _c : (_f.channels = []);
        return _this;
    }
    BaseSubscribeRequest.prototype.operation = function () {
        return operations_1.default.PNSubscribeOperation;
    };
    BaseSubscribeRequest.prototype.validate = function () {
        var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channels = _a.channels, channelGroups = _a.channelGroups;
        if (!subscribeKey)
            return 'Missing Subscribe Key';
        if (!channels && !channelGroups)
            return '`channels` and `channelGroups` both should not be empty';
    };
    BaseSubscribeRequest.prototype.parse = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var serviceResponse, events;
            var _this = this;
            return __generator(this, function (_a) {
                serviceResponse = this.deserializeResponse(response);
                if (!serviceResponse)
                    throw new PubNubError_1.PubNubError('Service response error, check status for details', (0, PubNubError_1.createValidationError)('Unable to deserialize service response'));
                events = serviceResponse.m.map(function (envelope) {
                    var eventType = envelope.e;
                    // Resolve missing event type.
                    eventType !== null && eventType !== void 0 ? eventType : (eventType = envelope.c.endsWith('-pnpres') ? PubNubEventType.Presence : PubNubEventType.Message);
                    // Check whether payload is string (potentially encrypted data).
                    if (typeof envelope.d === 'string') {
                        if (eventType == PubNubEventType.Message) {
                            return {
                                type: PubNubEventType.Message,
                                data: _this.messageFromEnvelope(envelope),
                            };
                        }
                        return {
                            type: PubNubEventType.Files,
                            data: _this.fileFromEnvelope(envelope),
                        };
                    }
                    else if (eventType === PubNubEventType.Presence) {
                        return {
                            type: PubNubEventType.Presence,
                            data: _this.presenceEventFromEnvelope(envelope),
                        };
                    }
                    else if (eventType == PubNubEventType.Signal) {
                        return {
                            type: PubNubEventType.Signal,
                            data: _this.signalFromEnvelope(envelope),
                        };
                    }
                    else if (eventType === PubNubEventType.AppContext) {
                        return {
                            type: PubNubEventType.AppContext,
                            data: _this.appContextFromEnvelope(envelope),
                        };
                    }
                    else if (eventType === PubNubEventType.MessageAction) {
                        return {
                            type: PubNubEventType.MessageAction,
                            data: _this.messageActionFromEnvelope(envelope),
                        };
                    }
                    return {
                        type: PubNubEventType.Files,
                        data: _this.fileFromEnvelope(envelope),
                    };
                });
                return [2 /*return*/, {
                        cursor: { timetoken: serviceResponse.t.t, region: serviceResponse.t.r },
                        messages: events,
                    }];
            });
        });
    };
    // --------------------------------------------------------
    // ------------------ Envelope parsing --------------------
    // --------------------------------------------------------
    // region Envelope parsing
    BaseSubscribeRequest.prototype.presenceEventFromEnvelope = function (envelope) {
        var payload = envelope.d;
        var _a = __read(this.subscriptionChannelFromEnvelope(envelope), 2), channel = _a[0], subscription = _a[1];
        // Clean up channel and subscription name from presence suffix.
        channel = channel.replace('-pnpres', '');
        if (subscription)
            subscription = subscription.replace('-pnpres', '');
        // Backward compatibility with deprecated properties.
        var actualChannel = subscription !== null ? channel : null;
        var subscribedChannel = subscription !== null ? subscription : channel;
        return __assign({ channel: channel, subscription: subscription, actualChannel: actualChannel, subscribedChannel: subscribedChannel, timetoken: envelope.p.t }, payload);
    };
    BaseSubscribeRequest.prototype.messageFromEnvelope = function (envelope) {
        var _a = __read(this.subscriptionChannelFromEnvelope(envelope), 2), channel = _a[0], subscription = _a[1];
        var _b = __read(this.decryptedData(envelope.d), 2), message = _b[0], decryptionError = _b[1];
        // Backward compatibility with deprecated properties.
        var actualChannel = subscription !== null ? channel : null;
        var subscribedChannel = subscription !== null ? subscription : channel;
        // Basic message event payload.
        var event = {
            channel: channel,
            subscription: subscription,
            actualChannel: actualChannel,
            subscribedChannel: subscribedChannel,
            timetoken: envelope.p.t,
            publisher: envelope.i,
            userMetadata: envelope.u,
            message: message,
        };
        if (decryptionError)
            event.error = decryptionError;
        return event;
    };
    BaseSubscribeRequest.prototype.signalFromEnvelope = function (envelope) {
        var _a = __read(this.subscriptionChannelFromEnvelope(envelope), 2), channel = _a[0], subscription = _a[1];
        return {
            channel: channel,
            subscription: subscription,
            timetoken: envelope.p.t,
            publisher: envelope.i,
            userMetadata: envelope.u,
            message: envelope.d,
        };
    };
    BaseSubscribeRequest.prototype.messageActionFromEnvelope = function (envelope) {
        var _a = __read(this.subscriptionChannelFromEnvelope(envelope), 2), channel = _a[0], subscription = _a[1];
        var action = envelope.d;
        return {
            channel: channel,
            subscription: subscription,
            timetoken: envelope.p.t,
            publisher: envelope.i,
            event: action.event,
            data: __assign(__assign({}, action.data), { uuid: envelope.i }),
        };
    };
    BaseSubscribeRequest.prototype.appContextFromEnvelope = function (envelope) {
        var _a = __read(this.subscriptionChannelFromEnvelope(envelope), 2), channel = _a[0], subscription = _a[1];
        var object = envelope.d;
        return {
            channel: channel,
            subscription: subscription,
            timetoken: envelope.p.t,
            message: object,
        };
    };
    BaseSubscribeRequest.prototype.fileFromEnvelope = function (envelope) {
        var _a = __read(this.subscriptionChannelFromEnvelope(envelope), 2), channel = _a[0], subscription = _a[1];
        var _b = __read(this.decryptedData(envelope.d), 2), file = _b[0], decryptionError = _b[1];
        var errorMessage = decryptionError;
        // Basic file event payload.
        var event = {
            channel: channel,
            subscription: subscription,
            timetoken: envelope.p.t,
            publisher: envelope.i,
            userMetadata: envelope.u,
        };
        if (!file)
            errorMessage !== null && errorMessage !== void 0 ? errorMessage : (errorMessage = "File information payload is missing.");
        else if (typeof file === 'string')
            errorMessage !== null && errorMessage !== void 0 ? errorMessage : (errorMessage = "Unexpected file information payload data type.");
        else {
            event.message = file.message;
            if (file.file) {
                event.file = {
                    id: file.file.id,
                    name: file.file.name,
                    url: this.parameters.getFileUrl({ id: file.file.id, name: file.file.name, channel: channel }),
                };
            }
        }
        if (errorMessage)
            event.error = errorMessage;
        return event;
    };
    // endregion
    BaseSubscribeRequest.prototype.subscriptionChannelFromEnvelope = function (envelope) {
        return [envelope.c, envelope.b === undefined || envelope.b === envelope.c ? null : envelope.b];
    };
    /**
     * Decrypt provided `data`.
     *
     * @param [data] - Message or file information which should be decrypted if possible.
     *
     * @returns Tuple with decrypted data and decryption error (if any).
     */
    BaseSubscribeRequest.prototype.decryptedData = function (data) {
        if (!this.parameters.crypto || typeof data !== 'string')
            return [data, undefined];
        var payload;
        var error;
        try {
            var decryptedData = this.parameters.crypto.decrypt(data);
            payload =
                decryptedData instanceof ArrayBuffer
                    ? JSON.parse(SubscribeRequest.decoder.decode(decryptedData))
                    : decryptedData;
        }
        catch (err) {
            payload = null;
            error = "Error while decrypting file message content: ".concat(err.message);
        }
        return [(payload !== null && payload !== void 0 ? payload : data), error];
    };
    return BaseSubscribeRequest;
}(request_1.AbstractRequest));
exports.BaseSubscribeRequest = BaseSubscribeRequest;
/**
 * Subscribe request.
 */
var SubscribeRequest = /** @class */ (function (_super) {
    __extends(SubscribeRequest, _super);
    function SubscribeRequest() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(SubscribeRequest.prototype, "path", {
        get: function () {
            var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channels = _a.channels;
            return "/v2/subscribe/".concat(subscribeKey, "/").concat((0, utils_1.encodeString)(channels.length > 0 ? channels.join(',') : ','), "/0");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SubscribeRequest.prototype, "queryParameters", {
        get: function () {
            var _a = this.parameters, channelGroups = _a.channelGroups, filterExpression = _a.filterExpression, state = _a.state, timetoken = _a.timetoken, region = _a.region;
            var query = {};
            if (channelGroups && channelGroups.length > 0)
                query['channel-group'] = channelGroups.join(',');
            if (filterExpression && filterExpression.length > 0)
                query['filter-expr'] = filterExpression;
            if (state && Object.keys(state).length > 0)
                query['state'] = JSON.stringify(state);
            if (typeof timetoken === 'string') {
                if (timetoken && timetoken.length > 0)
                    query['tt'] = timetoken;
            }
            else if (timetoken && timetoken > 0)
                query['tt'] = timetoken;
            if (region)
                query['tr'] = region;
            return query;
        },
        enumerable: false,
        configurable: true
    });
    return SubscribeRequest;
}(BaseSubscribeRequest));
exports.SubscribeRequest = SubscribeRequest;
