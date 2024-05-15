export type MessageAction = {
    type: string;
    value: string;
    uuid: string;
    actionTimetoken: string;
    messageTimetoken: string;
};
export type MoreMessageActions = {
    url: string;
    start: string;
    end: string;
    limit: number;
};
export type AddMessageActionParameters = {
    channel: string;
    messageTimetoken: string;
    action: {
        type: string;
        value: string;
    };
};
export type AddMessageActionResponse = {
    data: MessageAction;
};
export type GetMessageActionsParameters = {
    channel: string;
    start?: string;
    end?: string;
    limit?: number;
};
export type GetMessageActionsResponse = {
    data: MessageAction[];
    start: string | null;
    end: string | null;
    more?: MoreMessageActions;
};
export type RemoveMessageActionParameters = {
    channel: string;
    messageTimetoken: string;
    actionTimetoken: string;
};
export type RemoveMessageActionResponse = {
    data: Record<string, unknown>;
};
