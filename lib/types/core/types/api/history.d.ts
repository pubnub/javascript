import { Payload } from './index';
/**
 * Get history request parameters.
 */
export type GetHistoryParameters = {
    /**
     * Channel to return history messages from.
     */
    channel: string;
    /**
     * Specifies the number of historical messages to return.
     *
     * **Note:** Maximum `100` messages can be returned in single response.
     *
     * @default `100`
     */
    count?: number;
    /**
     * Whether message `meta` information should be fetched or not.
     *
     * @default `false`
     */
    includeMeta?: boolean;
    /**
     * Timetoken delimiting the `start` of `time` slice (exclusive) to pull messages from.
     */
    start?: string;
    /**
     * Timetoken delimiting the `end` of `time` slice (inclusive) to pull messages from.
     */
    end?: string;
    /**
     * Whether timeline should traverse in reverse starting with the oldest message first or not.
     *
     * If both `start` and `end` arguments are provided, `reverse` is ignored and messages are
     * returned starting with the newest message.
     */
    reverse?: boolean;
    /**
     * Whether message timetokens should be stringified or not.
     *
     * @default `false`
     */
    stringifiedTimeToken?: boolean;
};
/**
 * Get history response.
 */
export type GetHistoryResponse = {
    /**
     * List of previously published messages.
     */
    messages: {
        /**
         * Message payload (decrypted).
         */
        entry: Payload;
        /**
         * When message has been received by PubNub service.
         */
        timetoken: string | number;
        /**
         * Additional data which has been published along with message to be used with real-time
         * events filter expression.
         */
        meta?: Payload;
        /**
         * Message decryption error (if attempt has been done).
         */
        error?: string;
    }[];
    /**
     * Received messages timeline start.
     */
    startTimeToken: string | number;
    /**
     * Received messages timeline end.
     */
    endTimeToken: string | number;
};
/**
 * PubNub-defined message type.
 *
 * Types of messages which can be retrieved with fetch messages REST API.
 */
export declare enum PubNubMessageType {
    /**
     * Regular message.
     */
    Message = -1,
    /**
     * File message.
     */
    Files = 4
}
/**
 * Per-message actions information.
 */
export type Actions = {
    /**
     * Message action type.
     */
    [t: string]: {
        /**
         * Message action value.
         */
        [v: string]: {
            /**
             * Unique identifier of the user which reacted on message.
             */
            uuid: string;
            /**
             * High-precision PubNub timetoken with time when {@link uuid} reacted on message.
             */
            actionTimetoken: string;
        };
    };
};
/**
 * Additional message actions fetch information.
 */
export type MoreActions = {
    /**
     * Prepared fetch messages with actions REST API URL.
     */
    url: string;
    /**
     * Next page time offset.
     */
    start: string;
    /**
     * Number of messages to retrieve with next page.
     */
    max: number;
};
/**
 * Common content of the fetched message.
 */
type BaseFetchedMessage = {
    /**
     * Name of channel for which message has been retrieved.
     */
    channel: string;
    /**
     * When message has been received by PubNub service.
     */
    timetoken: string | number;
    /**
     * Message publisher unique identifier.
     */
    uuid?: string;
    /**
     * Additional data which has been published along with message to be used with real-time
     * events filter expression.
     */
    meta?: Payload;
    /**
     * Message decryption error (if attempt has been done).
     */
    error?: string;
};
/**
 * Regular message published to the channel.
 */
export type RegularMessage = BaseFetchedMessage & {
    /**
     * Message payload (decrypted).
     */
    message: Payload;
    /**
     * PubNub-defined message type.
     */
    messageType?: PubNubMessageType.Message;
};
/**
 * File message published to the channel.
 */
export type FileMessage = BaseFetchedMessage & {
    /**
     * Message payload (decrypted).
     */
    message: {
        /**
         * File annotation message.
         */
        message?: Payload;
        /**
         * File information.
         */
        file: {
            /**
             * Unique file identifier.
             */
            id: string;
            /**
             * Name with which file has been stored.
             */
            name: string;
            /**
             * File's content mime-type.
             */
            'mime-type': string;
            /**
             * Stored file size.
             */
            size: number;
            /**
             * Pre-computed file download Url.
             */
            url: string;
        };
    };
    /**
     * PubNub-defined message type.
     */
    messageType?: PubNubMessageType.Files;
};
/**
 * Fetched message entry in channel messages list.
 */
export type FetchedMessage = RegularMessage | FileMessage;
/**
 * Fetched with actions message entry in channel messages list.
 */
export type FetchedMessageWithActions = FetchedMessage & {
    /**
     * List of message reactions.
     */
    actions?: Actions;
    /**
     * List of message reactions.
     *
     * @deprecated Use {@link actions} field instead.
     */
    data?: Actions;
};
/**
 * Fetch messages request parameters.
 */
export type FetchMessagesParameters = {
    /**
     * Specifies channels to return history messages from.
     *
     * **Note:** Maximum of `500` channels are allowed.
     */
    channels: string[];
    /**
     * Specifies the number of historical messages to return per channel.
     *
     * **Note:** Default is `100` per single channel and `25` per multiple channels or per
     * single channel if {@link includeMessageActions} is used.
     *
     * @default `100` or `25`
     */
    count?: number;
    /**
     * Whether message type should be returned with each history message or not.
     *
     * @default `true`
     */
    includeMessageType?: boolean;
    /**
     * Whether publisher `uuid` should be returned with each history message or not.
     *
     * @default `true`
     */
    includeUUID?: boolean;
    /**
     * Whether publisher `uuid` should be returned with each history message or not.
     *
     * @deprecated Use {@link includeUUID} property instead.
     */
    includeUuid?: boolean;
    /**
     * Whether message `meta` information should be fetched or not.
     *
     * @default `false`
     */
    includeMeta?: boolean;
    /**
     * Whether message-added message actions should be fetched or not.
     *
     * If used, the limit of messages retrieved will be `25` per single channel.
     *
     * Each message can have a maximum of `25000` actions attached to it. Consider the example of
     * querying for 10 messages. The first five messages have 5000 actions attached to each of
     * them. The API will return the first 5 messages and all their 25000 actions. The response
     * will also include a `more` link to get the remaining 5 messages.
     *
     * **Important:** Truncation will happen if the number of actions on the messages returned
     * is > 25000.
     *
     * @default `false`
     *
     * @throws Exception if API is called with more than one channel.
     */
    includeMessageActions?: boolean;
    /**
     * Timetoken delimiting the `start` of `time` slice (exclusive) to pull messages from.
     */
    start?: string;
    /**
     * Timetoken delimiting the `end` of `time` slice (inclusive) to pull messages from.
     */
    end?: string;
    /**
     * Whether message timetokens should be stringified or not.
     *
     * @default `false`
     */
    stringifiedTimeToken?: boolean;
};
/**
 * Fetch messages response.
 */
export type FetchMessagesForChannelsResponse = {
    /**
     * List of previously published messages per requested channel.
     */
    channels: {
        [p: string]: FetchedMessage[];
    };
};
/**
 * Fetch messages with reactions response.
 */
export type FetchMessagesWithActionsResponse = {
    channels: {
        [p: string]: FetchedMessageWithActions[];
    };
    /**
     * Additional message actions fetch information.
     */
    more: MoreActions;
};
/**
 * Fetch messages response.
 */
export type FetchMessagesResponse = FetchMessagesForChannelsResponse | FetchMessagesWithActionsResponse;
/**
 * Message count request parameters.
 */
export type MessageCountParameters = {
    /**
     * The channels to fetch the message count.
     */
    channels: string[];
    /**
     * List of timetokens, in order of the {@link channels} list.
     *
     * Specify a single timetoken to apply it to all channels. Otherwise, the list of timetokens
     * must be the same length as the list of {@link channels}, or the function returns an error
     * flag.
     */
    channelTimetokens?: string[];
    /**
     * High-precision PubNub timetoken starting from which number of messages should be counted.
     *
     * Same timetoken will be used to count messages for each passed {@link channels}.
     *
     * @deprecated Use {@link channelTimetokens} field instead.
     */
    timetoken?: string;
};
/**
 * Message count response.
 */
export type MessageCountResponse = {
    /**
     * Map of channel names to the number of counted messages.
     */
    channels: Record<string, number>;
};
/**
 * Delete messages from channel parameters.
 */
export type DeleteMessagesParameters = {
    /**
     * Specifies channel messages to be deleted from history.
     */
    channel: string;
    /**
     * Timetoken delimiting the start of time slice (exclusive) to delete messages from.
     */
    start?: string;
    /**
     * Timetoken delimiting the end of time slice (inclusive) to delete messages from.
     */
    end?: string;
};
/**
 * Delete messages from channel response.
 */
export type DeleteMessagesResponse = Record<string, unknown>;
export {};
