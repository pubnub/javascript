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
import { createValidationError, PubnubError } from '../../errors/pubnub-error';
import { AbstractRequest } from '../components/request';
import RequestOperation from '../constants/operations';
import { encodeString } from '../utils';
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
export var PubNubEventType;
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
})(PubNubEventType || (PubNubEventType = {}));
// endregion
/**
 * Base subscription request implementation.
 *
 * Subscription request used in small variations in two cases:
 * - subscription manager
 * - event engine
 */
export class BaseSubscribeRequest extends AbstractRequest {
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
        return RequestOperation.PNSubscribeOperation;
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
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse)
                throw new PubnubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
            const events = serviceResponse.m.map((envelope) => {
                let { e: eventType } = envelope;
                // Resolve missing event type.
                eventType !== null && eventType !== void 0 ? eventType : (eventType = envelope.c.endsWith('-pnpres') ? PubNubEventType.Presence : PubNubEventType.Message);
                // Check whether payload is string (potentially encrypted data).
                if (typeof envelope.d === 'string') {
                    if (eventType == PubNubEventType.Message) {
                        return {
                            type: PubNubEventType.Message,
                            data: this.messageFromEnvelope(envelope),
                        };
                    }
                    return {
                        type: PubNubEventType.Files,
                        data: this.fileFromEnvelope(envelope),
                    };
                }
                else if (eventType == PubNubEventType.Message) {
                    return {
                        type: PubNubEventType.Message,
                        data: this.messageFromEnvelope(envelope),
                    };
                }
                else if (eventType === PubNubEventType.Presence) {
                    return {
                        type: PubNubEventType.Presence,
                        data: this.presenceEventFromEnvelope(envelope),
                    };
                }
                else if (eventType == PubNubEventType.Signal) {
                    return {
                        type: PubNubEventType.Signal,
                        data: this.signalFromEnvelope(envelope),
                    };
                }
                else if (eventType === PubNubEventType.AppContext) {
                    return {
                        type: PubNubEventType.AppContext,
                        data: this.appContextFromEnvelope(envelope),
                    };
                }
                else if (eventType === PubNubEventType.MessageAction) {
                    return {
                        type: PubNubEventType.MessageAction,
                        data: this.messageActionFromEnvelope(envelope),
                    };
                }
                return {
                    type: PubNubEventType.Files,
                    data: this.fileFromEnvelope(envelope),
                };
            });
            return {
                cursor: { timetoken: serviceResponse.t.t, region: serviceResponse.t.r },
                messages: events,
            };
        });
    }
    // --------------------------------------------------------
    // ------------------ Envelope parsing --------------------
    // --------------------------------------------------------
    // region Envelope parsing
    presenceEventFromEnvelope(envelope) {
        const { d: payload } = envelope;
        let [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);
        // Clean up channel and subscription name from presence suffix.
        channel = channel.replace('-pnpres', '');
        if (subscription)
            subscription = subscription.replace('-pnpres', '');
        // Backward compatibility with deprecated properties.
        const actualChannel = subscription !== null ? channel : null;
        const subscribedChannel = subscription !== null ? subscription : channel;
        return Object.assign({ channel,
            subscription,
            actualChannel,
            subscribedChannel, timetoken: envelope.p.t }, payload);
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
            userMetadata: envelope.u,
            message,
        };
        if (decryptionError)
            event.error = decryptionError;
        return event;
    }
    signalFromEnvelope(envelope) {
        const [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);
        return {
            channel,
            subscription,
            timetoken: envelope.p.t,
            publisher: envelope.i,
            userMetadata: envelope.u,
            message: envelope.d,
        };
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
            userMetadata: envelope.u,
        };
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
        if (errorMessage)
            event.error = errorMessage;
        return event;
    }
    // endregion
    subscriptionChannelFromEnvelope(envelope) {
        return [envelope.c, envelope.b === undefined || envelope.b === envelope.c ? null : envelope.b];
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
            error = `Error while decrypting file message content: ${err.message}`;
        }
        return [(payload !== null && payload !== void 0 ? payload : data), error];
    }
}
/**
 * Subscribe request.
 */
export class SubscribeRequest extends BaseSubscribeRequest {
    get path() {
        const { keySet: { subscribeKey }, channels, } = this.parameters;
        return `/v2/subscribe/${subscribeKey}/${encodeString(channels.length > 0 ? channels.join(',') : ',')}/0`;
    }
    get queryParameters() {
        const { channelGroups, filterExpression, state, timetoken, region } = this.parameters;
        const query = {};
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
    }
}
