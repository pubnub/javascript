import { Payload } from './index';
export type GetHistoryParameters = {
    channel: string;
    count?: number;
    includeMeta?: boolean;
    start?: string;
    end?: string;
    reverse?: boolean;
    stringifiedTimeToken?: boolean;
};
export type GetHistoryResponse = {
    messages: {
        entry: Payload;
        timetoken: string | number;
        meta?: Payload;
        error?: string;
    }[];
    startTimeToken: string | number;
    endTimeToken: string | number;
};
export declare enum PubNubMessageType {
    Message = -1,
    Files = 4
}
export type Actions = {
    [t: string]: {
        [v: string]: {
            uuid: string;
            actionTimetoken: string;
        };
    };
};
export type MoreActions = {
    url: string;
    start: string;
    max: number;
};
type BaseFetchedMessage = {
    channel: string;
    timetoken: string | number;
    uuid?: string;
    meta?: Payload;
    error?: string;
};
export type RegularMessage = BaseFetchedMessage & {
    message: Payload;
    messageType?: PubNubMessageType.Message;
};
export type FileMessage = BaseFetchedMessage & {
    message: {
        message?: Payload;
        file: {
            id: string;
            name: string;
            'mime-type': string;
            size: number;
            url: string;
        };
    };
    messageType?: PubNubMessageType.Files;
};
export type FetchedMessage = RegularMessage | FileMessage;
export type FetchedMessageWithActions = FetchedMessage & {
    actions?: Actions;
    data?: Actions;
};
export type FetchMessagesParameters = {
    channels: string[];
    count?: number;
    includeMessageType?: boolean;
    includeUUID?: boolean;
    includeUuid?: boolean;
    includeMeta?: boolean;
    includeMessageActions?: boolean;
    start?: string;
    end?: string;
    stringifiedTimeToken?: boolean;
};
export type FetchMessagesForChannelsResponse = {
    channels: {
        [p: string]: FetchedMessage[];
    };
};
export type FetchMessagesWithActionsResponse = {
    channels: {
        [p: string]: FetchedMessageWithActions[];
    };
    more: MoreActions;
};
export type FetchMessagesResponse = FetchMessagesForChannelsResponse | FetchMessagesWithActionsResponse;
export type MessageCountParameters = {
    channels: string[];
    channelTimetokens?: string[];
    timetoken?: string;
};
export type MessageCountResponse = {
    channels: Record<string, number>;
};
export type DeleteMessagesParameters = {
    channel: string;
    start?: string;
    end?: string;
};
export type DeleteMessagesResponse = Record<string, unknown>;
export {};
