import { RequestParameters as SubscribeRequestParameters, VSPMembershipObjectData, AppContextObjectData, MessageActionData, PubNubEventType, SpaceObjectData, UserObjectData, PresenceData, FileData } from '../../endpoints/subscribe';
import { AbortSignal } from '../../components/abort_signal';
import { Payload } from './index';
/**
 * Time cursor.
 *
 * Cursor used by subscription loop to identify point in time after which updates will be
 * delivered.
 */
export type SubscriptionCursor = {
    /**
     * PubNub high-precision timestamp.
     *
     * Aside of specifying exact time of receiving data / event this token used to catchup /
     * follow on real-time updates.
     */
    timetoken: string | number;
    /**
     * Data center region for which `timetoken` has been generated.
     */
    region?: number;
};
/**
 * Common real-time event.
 */
type Event = {
    /**
     * Channel to which real-time event has been sent.
     */
    channel: string;
    /**
     * Actual subscription at which real-time event has been received.
     *
     * PubNub client provide various ways to subscribe to the real-time stream: channel groups,
     * wildcard subscription, and spaces.
     *
     * **Note:** Value will be `null` if it is the same as {@link channel}.
     */
    subscription: string | null;
    /**
     * High-precision PubNub timetoken with time when event has been received by PubNub services.
     */
    timetoken: string;
};
/**
 * Common legacy real-time event for backward compatibility.
 */
type LegacyEvent = Event & {
    /**
     * Channel to which real-time event has been sent.
     *
     * @deprecated Use {@link channel} field instead.
     */
    actualChannel?: string | null;
    /**
     * Actual subscription at which real-time event has been received.
     *
     * @deprecated Use {@link subscription} field instead.
     */
    subscribedChannel?: string;
};
/**
 * Presence change real-time event.
 */
export type Presence = LegacyEvent & PresenceData;
/**
 * Extended presence real-time event.
 *
 * Type extended for listener manager support.
 */
type PresenceEvent = {
    type: PubNubEventType.Presence;
    data: Presence;
};
/**
 * Common published data information.
 */
type PublishedData = {
    /**
     * Unique identifier of the user which sent data.
     */
    publisher?: string;
    /**
     * Additional user-provided metadata which can be used with real-time filtering expression.
     */
    userMetadata?: {
        [p: string]: Payload;
    };
    /**
     * Sent data.
     */
    message: Payload;
};
/**
 * Real-time message event.
 */
export type Message = LegacyEvent & PublishedData & {
    /**
     * Decryption error message in case of failure.
     */
    error?: string;
};
/**
 * Extended real-time message event.
 *
 * Type extended for listener manager support.
 */
type MessageEvent = {
    type: PubNubEventType.Message;
    data: Message;
};
/**
 * Real-time signal event.
 */
export type Signal = Event & PublishedData;
/**
 * Extended real-time signal event.
 *
 * Type extended for listener manager support.
 */
type SignalEvent = {
    type: PubNubEventType.Signal;
    data: Signal;
};
/**
 * Message action real-time event.
 */
export type MessageAction = Event & Omit<MessageActionData, 'source' | 'version' | 'data'> & {
    /**
     * Unique identifier of the user which added message reaction.
     *
     * @deprecated Use `data.uuid` field instead.
     */
    publisher?: string;
    data: MessageActionData['data'] & {
        /**
         * Unique identifier of the user which added message reaction.
         */
        uuid: string;
    };
};
/**
 * Extended message action real-time event.
 *
 * Type extended for listener manager support.
 */
type MessageActionEvent = {
    type: PubNubEventType.MessageAction;
    data: MessageAction;
};
/**
 * App Context Object change real-time event.
 */
export type AppContextObject = Event & {
    /**
     * Information about App Context object for which event received.
     */
    message: AppContextObjectData;
};
/**
 * `User` App Context Object change real-time event.
 */
export type UserAppContextObject = Omit<Event, 'channel'> & {
    /**
     * Space to which real-time event has been sent.
     */
    spaceId: string;
    /**
     * Information about User Object for which event received.
     */
    message: UserObjectData;
};
/**
 * `Space` App Context Object change real-time event.
 */
export type SpaceAppContextObject = Omit<Event, 'channel'> & {
    /**
     * Space to which real-time event has been sent.
     */
    spaceId: string;
    /**
     * Information about `Space` Object for which event received.
     */
    message: SpaceObjectData;
};
/**
 * VSP `Membership` App Context Object change real-time event.
 */
export type VSPMembershipAppContextObject = Omit<Event, 'channel'> & {
    /**
     * Space to which real-time event has been sent.
     */
    spaceId: string;
    /**
     * Information about `Membership` Object for which event received.
     */
    message: VSPMembershipObjectData;
};
/**
 * Extended App Context Object change real-time event.
 *
 * Type extended for listener manager support.
 */
type AppContextEvent = {
    type: PubNubEventType.AppContext;
    data: AppContextObject;
};
/**
 * File real-time event.
 */
export type File = Event & Omit<PublishedData, 'message'> & Omit<FileData, 'file'> & {
    /**
     * Message which has been associated with uploaded file.
     */
    message?: Payload;
    /**
     * Information about uploaded file.
     */
    file?: FileData['file'] & {
        /**
         * File download url.
         */
        url: string;
    };
    /**
     * Decryption error message in case of failure.
     */
    error?: string;
};
/**
 * Extended File real-time event.
 *
 * Type extended for listener manager support.
 */
type FileEvent = {
    type: PubNubEventType.Files;
    data: File;
};
/**
 * Cancelable subscribe request parameters.
 */
export type CancelableSubscribeParameters = Omit<SubscribeRequestParameters, 'crypto' | 'timeout' | 'keySet' | 'getFileUrl'> & {
    /**
     * Long-poll request termination signal.
     */
    abortSignal: AbortSignal;
};
/**
 * Subscribe request parameters.
 */
export type SubscribeParameters = {
    /**
     * List of channels from which real-time events should be delivered.
     *
     * @default `,` if {@link channelGroups} is set.
     */
    channels?: string[];
    /**
     * List of channel groups from which real-time events should be retrieved.
     */
    channelGroups?: string[];
    /**
     * Next subscription loop timetoken.
     */
    timetoken?: string | number;
    /**
     * Whether should subscribe to channels / groups presence announcements or not.
     *
     * @default `false`
     */
    withPresence?: boolean;
    /**
     * Presence information which should be associated with `userId`.
     *
     * `state` information will be associated with `userId` on channels mentioned as keys in
     * this object.
     *
     * @deprecated Use set state methods to specify associated user's data instead of passing to
     * subscribe.
     */
    state?: Record<string, Payload>;
    /**
     * Whether should subscribe to channels / groups presence announcements or not.
     *
     * @default `false`
     */
    withHeartbeats?: boolean;
};
/**
 * Service success response.
 */
export type SubscriptionResponse = {
    cursor: SubscriptionCursor;
    messages: (PresenceEvent | MessageEvent | SignalEvent | MessageActionEvent | AppContextEvent | FileEvent)[];
};
export {};
