/**
 * Message reaction object type.
 */
export type MessageAction = {
    /**
     * What feature this message action represents.
     */
    type: string;
    /**
     * Value which should be stored along with message action.
     */
    value: string;
    /**
     * Unique identifier of the user which added message action.
     */
    uuid: string;
    /**
     * Timetoken of when message reaction has been added.
     *
     * **Note:** This token required when it will be required to remove raction.
     */
    actionTimetoken: string;
    /**
     * Timetoken of message to which `action` has been added.
     */
    messageTimetoken: string;
};
/**
 * More message actions fetch information.
 */
export type MoreMessageActions = {
    /**
     * Prepared REST API url to fetch next page with message actions.
     */
    url: string;
    /**
     * Message action timetoken denoting the start of the range requested with next page.
     *
     * **Note:** Return values will be less than {@link start}.
     */
    start: string;
    /**
     * Message action timetoken denoting the end of the range requested with next page.
     *
     * **Note:** Return values will be greater than or equal to {@link end}.
     */
    end: string;
    /**
     * Number of message actions to return in next response.
     */
    limit: number;
};
/**
 * Add Message Action request parameters.
 */
export type AddMessageActionParameters = {
    /**
     * Name of channel which stores the message for which {@link action} should be added.
     */
    channel: string;
    /**
     * Timetoken of message for which {@link action} should be added.
     */
    messageTimetoken: string;
    /**
     * Message `action` information.
     */
    action: {
        /**
         * What feature this message action represents.
         */
        type: string;
        /**
         * Value which should be stored along with message action.
         */
        value: string;
    };
};
/**
 * Response with added message action object.
 */
export type AddMessageActionResponse = {
    data: MessageAction;
};
/**
 * Get Message Actions request parameters.
 */
export type GetMessageActionsParameters = {
    /**
     * Name of channel from which list of messages `actions` should be retrieved.
     */
    channel: string;
    /**
     * Message action timetoken denoting the start of the range requested.
     *
     * **Note:** Return values will be less than {@link start}.
     */
    start?: string;
    /**
     * Message action timetoken denoting the end of the range requested.
     *
     * **Note:** Return values will be greater than or equal to {@link end}.
     */
    end?: string;
    /**
     * Number of message actions to return in response.
     */
    limit?: number;
};
/**
 * Response with message actions in specific `channel`.
 */
export type GetMessageActionsResponse = {
    /**
     * Retrieved list of message actions.
     */
    data: MessageAction[];
    /**
     * Received message actions time frame start.
     */
    start: string | null;
    /**
     * Received message actions time frame end.
     */
    end: string | null;
    /**
     * More message actions fetch information.
     */
    more?: MoreMessageActions;
};
/**
 * Remove Message Action request parameters.
 */
export type RemoveMessageActionParameters = {
    /**
     * Name of channel which store message for which `action` should be removed.
     */
    channel: string;
    /**
     * Timetoken of message for which `action` should be removed.
     */
    messageTimetoken: string;
    /**
     * Action addition timetoken.
     */
    actionTimetoken: string;
};
/**
 * Response with message remove result.
 */
export type RemoveMessageActionResponse = {
    data: Record<string, unknown>;
};
