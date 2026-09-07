"use strict";
/**
 * Subscription REST API module.
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
exports.SubscribeRequest = exports.BaseSubscribeRequest = exports.PubNubEventType = void 0;
const pubnub_error_1 = require("../../errors/pubnub-error");
const utils_1 = require("../utils");
const request_1 = require("../components/request");
const operations_1 = __importDefault(require("../constants/operations"));
// --------------------------------------------------------
// ---------------------- Defaults ------------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether should subscribe to channels / groups presence announcements or not.
 */
const WITH_PRESENCE = false;
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
    /**
     * DataSync object change event.
     *
     * **Note:** Value must equal `5` to match the service wire value (`e: 5`).
     */
    PubNubEventType[PubNubEventType["DataSync"] = 5] = "DataSync";
})(PubNubEventType || (exports.PubNubEventType = PubNubEventType = {}));
/**
 * Event types which this SDK version knows how to parse.
 *
 * Events with any other `e` value are ignored: they most likely originate from a service release newer than
 * the SDK
 */
const KNOWN_EVENT_TYPES = new Set([
    PubNubEventType.Presence,
    PubNubEventType.Message,
    PubNubEventType.Signal,
    PubNubEventType.AppContext,
    PubNubEventType.MessageAction,
    PubNubEventType.Files,
    PubNubEventType.DataSync,
]);
/**
 * Reserved DataSync system class names (lower-cased) → normalized object type.
 *
 * Only consulted for classes the service marks as `Global` (see {@link DataSyncClassLevel}), so a
 * developer-defined class which happens to share one of these names is not mistaken for a typed
 * resource. Keys are compared case-insensitively.
 *
 * @internal
 */
const DATA_SYNC_RESERVED_CLASSES = {
    user: 'user',
    channel: 'channel',
    membership: 'membership',
};
// endregion
/**
 * Base subscription request implementation.
 *
 * Subscription request used in small variations in two cases:
 * - subscription manager
 * - event engine
 *
 * @internal
 */
class BaseSubscribeRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        var _a, _b, _c;
        var _d, _e, _f;
        super({ cancellable: true });
        this.parameters = parameters;
        // Apply default request parameters.
        (_a = (_d = this.parameters).withPresence) !== null && _a !== void 0 ? _a : (_d.withPresence = WITH_PRESENCE);
        (_b = (_e = this.parameters).channelGroups) !== null && _b !== void 0 ? _b : (_e.channelGroups = []);
        (_c = (_f = this.parameters).channels) !== null && _c !== void 0 ? _c : (_f.channels = []);
    }
    operation() {
        return operations_1.default.PNSubscribeOperation;
    }
    validate() {
        const { keySet: { subscribeKey }, channels, channelGroups, } = this.parameters;
        if (!subscribeKey)
            return 'Missing Subscribe Key';
        if (!channels && !channelGroups)
            return '`channels` and `channelGroups` both should not be empty';
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            let serviceResponse;
            let responseText;
            try {
                responseText = request_1.AbstractRequest.decoder.decode(response.body);
                const parsedJson = JSON.parse(responseText);
                serviceResponse = parsedJson;
            }
            catch (error) {
                console.error('Error parsing JSON response:', error);
            }
            if (!serviceResponse) {
                throw new pubnub_error_1.PubNubError('Service response error, check status for details', (0, pubnub_error_1.createMalformedResponseError)(responseText, response.status));
            }
            const events = serviceResponse.m
                .filter((envelope) => {
                const subscribable = envelope.b === undefined ? envelope.c : envelope.b;
                return ((this.parameters.channels && this.parameters.channels.includes(subscribable)) ||
                    (this.parameters.channelGroups && this.parameters.channelGroups.includes(subscribable)));
            })
                .map((envelope) => {
                let { e: eventType } = envelope;
                // Events delivered on a presence channel are always presence events: the `-pnpres` suffix wins over
                // the service-reported type. `envelope.c` is the actual channel (`envelope.b` is the channel group
                // name), so this also covers presence delivered through a subscribed channel group.
                if (envelope.c.endsWith('-pnpres'))
                    eventType = PubNubEventType.Presence;
                // Resolve missing event type.
                else
                    eventType !== null && eventType !== void 0 ? eventType : (eventType = PubNubEventType.Message);
                // Ignore an event type this SDK version cannot parse rather than delivering an unexpected payload.
                if (!KNOWN_EVENT_TYPES.has(eventType))
                    return undefined;
                const pn_mfp = (0, utils_1.messageFingerprint)(envelope.d);
                // Check whether payload is string (potentially encrypted data).
                if (eventType != PubNubEventType.Presence &&
                    eventType != PubNubEventType.Signal &&
                    typeof envelope.d === 'string') {
                    if (eventType == PubNubEventType.Message) {
                        return {
                            type: PubNubEventType.Message,
                            data: this.messageFromEnvelope(envelope),
                            pn_mfp,
                        };
                    }
                    return {
                        type: PubNubEventType.Files,
                        data: this.fileFromEnvelope(envelope),
                        pn_mfp,
                    };
                }
                else if (eventType == PubNubEventType.Message) {
                    return {
                        type: PubNubEventType.Message,
                        data: this.messageFromEnvelope(envelope),
                        pn_mfp,
                    };
                }
                else if (eventType === PubNubEventType.Presence) {
                    return {
                        type: PubNubEventType.Presence,
                        data: this.presenceEventFromEnvelope(envelope),
                        pn_mfp,
                    };
                }
                else if (eventType == PubNubEventType.Signal) {
                    return {
                        type: PubNubEventType.Signal,
                        data: this.signalFromEnvelope(envelope),
                        pn_mfp,
                    };
                }
                else if (eventType === PubNubEventType.AppContext) {
                    return {
                        type: PubNubEventType.AppContext,
                        data: this.appContextFromEnvelope(envelope),
                        pn_mfp,
                    };
                }
                else if (eventType === PubNubEventType.MessageAction) {
                    return {
                        type: PubNubEventType.MessageAction,
                        data: this.messageActionFromEnvelope(envelope),
                        pn_mfp,
                    };
                }
                else if (eventType === PubNubEventType.DataSync) {
                    const dataSync = this.dataSyncFromEnvelope(envelope);
                    // Guard: only treat as DataSync when the service marks it so; otherwise fall back to message.
                    if (dataSync)
                        return { type: PubNubEventType.DataSync, data: dataSync, pn_mfp };
                    return { type: PubNubEventType.Message, data: this.messageFromEnvelope(envelope), pn_mfp };
                }
                // The only known event type left is a file event.
                return {
                    type: PubNubEventType.Files,
                    data: this.fileFromEnvelope(envelope),
                    pn_mfp,
                };
            })
                .filter((event) => event !== undefined);
            return {
                cursor: { timetoken: serviceResponse.t.t, region: serviceResponse.t.r },
                messages: events,
            };
        });
    }
    get headers() {
        var _a;
        return Object.assign(Object.assign({}, ((_a = super.headers) !== null && _a !== void 0 ? _a : {})), { accept: 'text/javascript' });
    }
    // --------------------------------------------------------
    // ------------------ Envelope parsing --------------------
    // --------------------------------------------------------
    // region Envelope parsing
    presenceEventFromEnvelope(envelope) {
        var _a;
        const { d: payload } = envelope;
        const [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);
        // Clean up channel and subscription name from presence suffix.
        const trimmedChannel = channel.replace('-pnpres', '');
        // Backward compatibility with deprecated properties.
        const actualChannel = subscription !== null ? trimmedChannel : null;
        const subscribedChannel = subscription !== null ? subscription : trimmedChannel;
        // Presence payloads are objects. A string can only reach here when a non-presence payload has been published
        // on a `-pnpres` channel: try to read it as JSON and never spread a string (which would add character-indexed
        // keys to the event).
        let presenceData;
        if (typeof payload === 'string') {
            try {
                const parsed = JSON.parse(payload);
                if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed))
                    presenceData = parsed;
            }
            catch (_b) {
                // Not JSON (encrypted or plain-text publish): payload contributes no presence fields.
            }
        }
        else
            presenceData = payload;
        if (presenceData) {
            if ('data' in presenceData) {
                // @ts-expect-error This is `state-change` object which should have `state` field.
                presenceData['state'] = presenceData.data;
                delete presenceData.data;
            }
            else if ('action' in presenceData && presenceData.action === 'interval') {
                presenceData.hereNowRefresh = (_a = presenceData.here_now_refresh) !== null && _a !== void 0 ? _a : false;
                delete presenceData.here_now_refresh;
            }
        }
        return Object.assign({ channel: trimmedChannel, subscription,
            actualChannel,
            subscribedChannel, timetoken: envelope.p.t }, (presenceData !== null && presenceData !== void 0 ? presenceData : {}));
    }
    messageFromEnvelope(envelope) {
        const [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);
        const [message, decryptionError] = this.decryptedData(envelope.d);
        // Backward compatibility with deprecated properties.
        const actualChannel = subscription !== null ? channel : null;
        const subscribedChannel = subscription !== null ? subscription : channel;
        // Basic message event payload.
        const event = {
            channel,
            subscription,
            actualChannel,
            subscribedChannel,
            timetoken: envelope.p.t,
            publisher: envelope.i,
            message,
        };
        if (envelope.u)
            event.userMetadata = envelope.u;
        if (envelope.cmt)
            event.customMessageType = envelope.cmt;
        if (decryptionError)
            event.error = decryptionError;
        return event;
    }
    signalFromEnvelope(envelope) {
        const [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);
        const event = {
            channel,
            subscription,
            timetoken: envelope.p.t,
            publisher: envelope.i,
            message: envelope.d,
        };
        if (envelope.u)
            event.userMetadata = envelope.u;
        if (envelope.cmt)
            event.customMessageType = envelope.cmt;
        return event;
    }
    messageActionFromEnvelope(envelope) {
        const [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);
        const action = envelope.d;
        return {
            channel,
            subscription,
            timetoken: envelope.p.t,
            publisher: envelope.i,
            event: action.event,
            data: Object.assign(Object.assign({}, action.data), { uuid: envelope.i }),
        };
    }
    appContextFromEnvelope(envelope) {
        const [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);
        const object = envelope.d;
        return {
            channel,
            subscription,
            timetoken: envelope.p.t,
            message: object,
        };
    }
    dataSyncFromEnvelope(envelope) {
        var _a;
        const [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);
        const payload = envelope.d;
        const metadata = payload === null || payload === void 0 ? void 0 : payload.metadata;
        // Only treat the envelope as DataSync when the service marks it and carries the required fields.
        if (!metadata || metadata.source !== 'data-sync' || !metadata.event || !metadata.type)
            return undefined;
        // Wire `className` is a bare class name (`User`, `Membership`, `Customer`); the `:`-splitting below
        // is only there to keep tolerating the retired positional composite (`User::` / `::Customer`).
        const classSegments = metadata.className ? metadata.className.split(':') : [];
        const nonEmptySegments = classSegments.filter((segment) => segment.length > 0);
        const className = nonEmptySegments.length > 0 ? nonEmptySegments[nonEmptySegments.length - 1] : undefined;
        const classLevel = metadata.classLevel;
        // `classLevel` authoritatively separates the built-in classes from developer-defined ones, so a
        // developer class named `User` / `Channel` / `Membership` is not mistaken for a typed resource.
        // When it is absent (service predating the field) fall back to the legacy positional heuristic,
        // where the system class was the first segment.
        const systemClass = classLevel === undefined ? classSegments[0] : classLevel === 'Global' ? className : undefined;
        const objectType = (systemClass && DATA_SYNC_RESERVED_CLASSES[systemClass.toLowerCase()]) || metadata.type;
        const parsedVersion = metadata.classVersion !== undefined ? Number.parseInt(`${metadata.classVersion}`, 10) : NaN;
        const classVersion = Number.isNaN(parsedVersion) ? undefined : parsedVersion;
        const raw = ((_a = payload.data) !== null && _a !== void 0 ? _a : {});
        // `data` mirrors the object as sent by the service; class identity is reported once, on the event.
        let data;
        if (metadata.event === 'delete')
            data = { id: raw.id, deletedAt: raw.deletedAt };
        else if (metadata.type === 'relationship')
            data = Object.assign({}, raw);
        else
            data = Object.assign({}, raw);
        return {
            channel,
            subscription,
            timetoken: envelope.p.t,
            message: {
                version: payload.version,
                event: metadata.event,
                source: metadata.source,
                type: metadata.type,
                objectType,
                className,
                classLevel,
                classVersion,
                data,
            },
        };
    }
    fileFromEnvelope(envelope) {
        const [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);
        const [file, decryptionError] = this.decryptedData(envelope.d);
        let errorMessage = decryptionError;
        // Basic file event payload.
        const event = {
            channel,
            subscription,
            timetoken: envelope.p.t,
            publisher: envelope.i,
        };
        if (envelope.u)
            event.userMetadata = envelope.u;
        if (!file)
            errorMessage !== null && errorMessage !== void 0 ? errorMessage : (errorMessage = `File information payload is missing.`);
        else if (typeof file === 'string')
            errorMessage !== null && errorMessage !== void 0 ? errorMessage : (errorMessage = `Unexpected file information payload data type.`);
        else {
            event.message = file.message;
            if (file.file) {
                event.file = {
                    id: file.file.id,
                    name: file.file.name,
                    url: this.parameters.getFileUrl({ id: file.file.id, name: file.file.name, channel }),
                };
            }
        }
        if (envelope.cmt)
            event.customMessageType = envelope.cmt;
        if (errorMessage)
            event.error = errorMessage;
        return event;
    }
    // endregion
    subscriptionChannelFromEnvelope(envelope) {
        return [envelope.c, envelope.b === undefined ? envelope.c : envelope.b];
    }
    /**
     * Decrypt provided `data`.
     *
     * @param [data] - Message or file information which should be decrypted if possible.
     *
     * @returns Tuple with decrypted data and decryption error (if any).
     */
    decryptedData(data) {
        if (!this.parameters.crypto || typeof data !== 'string')
            return [data, undefined];
        let payload;
        let error;
        try {
            const decryptedData = this.parameters.crypto.decrypt(data);
            payload =
                decryptedData instanceof ArrayBuffer
                    ? JSON.parse(SubscribeRequest.decoder.decode(decryptedData))
                    : decryptedData;
        }
        catch (err) {
            payload = null;
            error = `Error while decrypting message content: ${err.message}`;
        }
        return [(payload !== null && payload !== void 0 ? payload : data), error];
    }
}
exports.BaseSubscribeRequest = BaseSubscribeRequest;
/**
 * Subscribe request.
 *
 * @internal
 */
class SubscribeRequest extends BaseSubscribeRequest {
    get path() {
        var _a;
        const { keySet: { subscribeKey }, channels, } = this.parameters;
        return `/v2/subscribe/${subscribeKey}/${(0, utils_1.encodeNames)((_a = channels === null || channels === void 0 ? void 0 : channels.sort()) !== null && _a !== void 0 ? _a : [], ',')}/0`;
    }
    get queryParameters() {
        const { channelGroups, filterExpression, heartbeat, state, timetoken, region, onDemand } = this.parameters;
        const query = {};
        if (onDemand)
            query['on-demand'] = 1;
        if (channelGroups && channelGroups.length > 0)
            query['channel-group'] = channelGroups.sort().join(',');
        if (filterExpression && filterExpression.length > 0)
            query['filter-expr'] = filterExpression;
        if (heartbeat)
            query.heartbeat = heartbeat;
        if (state && Object.keys(state).length > 0)
            query['state'] = JSON.stringify(state);
        if (timetoken !== undefined && typeof timetoken === 'string') {
            if (timetoken.length > 0 && timetoken !== '0')
                query['tt'] = timetoken;
        }
        else if (timetoken !== undefined && timetoken > 0)
            query['tt'] = timetoken;
        if (region)
            query['tr'] = region;
        return query;
    }
}
exports.SubscribeRequest = SubscribeRequest;
