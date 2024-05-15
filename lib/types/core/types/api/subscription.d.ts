import { RequestParameters as SubscribeRequestParameters, VSPMembershipObjectData, AppContextObjectData, MessageActionData, PubNubEventType, SpaceObjectData, UserObjectData, PresenceData, FileData } from '../../endpoints/subscribe';
import { AbortSignal } from '../../components/abort_signal';
import { Payload } from './index';
export type SubscriptionCursor = {
    timetoken: string | number;
    region?: number;
};
type Event = {
    channel: string;
    subscription: string | null;
    timetoken: string;
};
type LegacyEvent = Event & {
    actualChannel?: string | null;
    subscribedChannel?: string;
};
export type Presence = LegacyEvent & PresenceData;
type PresenceEvent = {
    type: PubNubEventType.Presence;
    data: Presence;
};
type PublishedData = {
    publisher?: string;
    userMetadata?: {
        [p: string]: Payload;
    };
    message: Payload;
};
export type Message = LegacyEvent & PublishedData & {
    error?: string;
};
type MessageEvent = {
    type: PubNubEventType.Message;
    data: Message;
};
export type Signal = Event & PublishedData;
type SignalEvent = {
    type: PubNubEventType.Signal;
    data: Signal;
};
export type MessageAction = Event & Omit<MessageActionData, 'source' | 'version' | 'data'> & {
    publisher?: string;
    data: MessageActionData['data'] & {
        uuid: string;
    };
};
type MessageActionEvent = {
    type: PubNubEventType.MessageAction;
    data: MessageAction;
};
export type AppContextObject = Event & {
    message: AppContextObjectData;
};
export type UserAppContextObject = Omit<Event, 'channel'> & {
    spaceId: string;
    message: UserObjectData;
};
export type SpaceAppContextObject = Omit<Event, 'channel'> & {
    spaceId: string;
    message: SpaceObjectData;
};
export type VSPMembershipAppContextObject = Omit<Event, 'channel'> & {
    spaceId: string;
    message: VSPMembershipObjectData;
};
type AppContextEvent = {
    type: PubNubEventType.AppContext;
    data: AppContextObject;
};
export type File = Event & Omit<PublishedData, 'message'> & Omit<FileData, 'file'> & {
    message?: Payload;
    file?: FileData['file'] & {
        url: string;
    };
    error?: string;
};
type FileEvent = {
    type: PubNubEventType.Files;
    data: File;
};
export type CancelableSubscribeParameters = Omit<SubscribeRequestParameters, 'crypto' | 'timeout' | 'keySet' | 'getFileUrl'> & {
    abortSignal: AbortSignal;
};
export type SubscribeParameters = {
    channels?: string[];
    channelGroups?: string[];
    timetoken?: string | number;
    withPresence?: boolean;
    state?: Record<string, Payload>;
    withHeartbeats?: boolean;
};
export type SubscriptionResponse = {
    cursor: SubscriptionCursor;
    messages: (PresenceEvent | MessageEvent | SignalEvent | MessageActionEvent | AppContextEvent | FileEvent)[];
};
export {};
