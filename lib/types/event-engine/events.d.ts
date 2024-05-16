import * as Subscription from '../core/types/api/subscription';
import { PubNubError } from '../errors/pubnub-error';
import { MapOf } from './core';
export declare const subscriptionChange: {
    (channels: string[], groups: string[]): import("./core/types").Event<"SUBSCRIPTION_CHANGED", {
        channels: string[];
        groups: string[];
    }>;
    type: "SUBSCRIPTION_CHANGED";
};
export declare const restore: {
    (channels: string[], groups: string[], timetoken: string | number, region?: number | undefined): import("./core/types").Event<"SUBSCRIPTION_RESTORED", {
        channels: string[];
        groups: string[];
        cursor: {
            timetoken: string | number;
            region: number;
        };
    }>;
    type: "SUBSCRIPTION_RESTORED";
};
export declare const handshakeSuccess: {
    (cursor: Subscription.SubscriptionCursor): import("./core/types").Event<"HANDSHAKE_SUCCESS", Subscription.SubscriptionCursor>;
    type: "HANDSHAKE_SUCCESS";
};
export declare const handshakeFailure: {
    (error: PubNubError): import("./core/types").Event<"HANDSHAKE_FAILURE", PubNubError>;
    type: "HANDSHAKE_FAILURE";
};
export declare const handshakeReconnectSuccess: {
    (cursor: Subscription.SubscriptionCursor): import("./core/types").Event<"HANDSHAKE_RECONNECT_SUCCESS", {
        cursor: Subscription.SubscriptionCursor;
    }>;
    type: "HANDSHAKE_RECONNECT_SUCCESS";
};
export declare const handshakeReconnectFailure: {
    (error: PubNubError): import("./core/types").Event<"HANDSHAKE_RECONNECT_FAILURE", PubNubError>;
    type: "HANDSHAKE_RECONNECT_FAILURE";
};
export declare const handshakeReconnectGiveup: {
    (error: PubNubError): import("./core/types").Event<"HANDSHAKE_RECONNECT_GIVEUP", PubNubError>;
    type: "HANDSHAKE_RECONNECT_GIVEUP";
};
export declare const receiveSuccess: {
    (cursor: Subscription.SubscriptionCursor, events: ({
        type: import("../core/endpoints/subscribe").PubNubEventType.Presence;
        data: Subscription.Presence;
    } | {
        type: import("../core/endpoints/subscribe").PubNubEventType.Message;
        data: Subscription.Message;
    } | {
        type: import("../core/endpoints/subscribe").PubNubEventType.Signal;
        data: Subscription.Signal;
    } | {
        type: import("../core/endpoints/subscribe").PubNubEventType.MessageAction;
        data: Subscription.MessageAction;
    } | {
        type: import("../core/endpoints/subscribe").PubNubEventType.AppContext;
        data: Subscription.AppContextObject;
    } | {
        type: import("../core/endpoints/subscribe").PubNubEventType.Files;
        data: Subscription.File;
    })[]): import("./core/types").Event<"RECEIVE_SUCCESS", {
        cursor: Subscription.SubscriptionCursor;
        events: ({
            type: import("../core/endpoints/subscribe").PubNubEventType.Presence;
            data: Subscription.Presence;
        } | {
            type: import("../core/endpoints/subscribe").PubNubEventType.Message;
            data: Subscription.Message;
        } | {
            type: import("../core/endpoints/subscribe").PubNubEventType.Signal;
            data: Subscription.Signal;
        } | {
            type: import("../core/endpoints/subscribe").PubNubEventType.MessageAction;
            data: Subscription.MessageAction;
        } | {
            type: import("../core/endpoints/subscribe").PubNubEventType.AppContext;
            data: Subscription.AppContextObject;
        } | {
            type: import("../core/endpoints/subscribe").PubNubEventType.Files;
            data: Subscription.File;
        })[];
    }>;
    type: "RECEIVE_SUCCESS";
};
export declare const receiveFailure: {
    (error: PubNubError): import("./core/types").Event<"RECEIVE_FAILURE", PubNubError>;
    type: "RECEIVE_FAILURE";
};
export declare const receiveReconnectSuccess: {
    (cursor: Subscription.SubscriptionCursor, events: ({
        type: import("../core/endpoints/subscribe").PubNubEventType.Presence;
        data: Subscription.Presence;
    } | {
        type: import("../core/endpoints/subscribe").PubNubEventType.Message;
        data: Subscription.Message;
    } | {
        type: import("../core/endpoints/subscribe").PubNubEventType.Signal;
        data: Subscription.Signal;
    } | {
        type: import("../core/endpoints/subscribe").PubNubEventType.MessageAction;
        data: Subscription.MessageAction;
    } | {
        type: import("../core/endpoints/subscribe").PubNubEventType.AppContext;
        data: Subscription.AppContextObject;
    } | {
        type: import("../core/endpoints/subscribe").PubNubEventType.Files;
        data: Subscription.File;
    })[]): import("./core/types").Event<"RECEIVE_RECONNECT_SUCCESS", {
        cursor: Subscription.SubscriptionCursor;
        events: ({
            type: import("../core/endpoints/subscribe").PubNubEventType.Presence;
            data: Subscription.Presence;
        } | {
            type: import("../core/endpoints/subscribe").PubNubEventType.Message;
            data: Subscription.Message;
        } | {
            type: import("../core/endpoints/subscribe").PubNubEventType.Signal;
            data: Subscription.Signal;
        } | {
            type: import("../core/endpoints/subscribe").PubNubEventType.MessageAction;
            data: Subscription.MessageAction;
        } | {
            type: import("../core/endpoints/subscribe").PubNubEventType.AppContext;
            data: Subscription.AppContextObject;
        } | {
            type: import("../core/endpoints/subscribe").PubNubEventType.Files;
            data: Subscription.File;
        })[];
    }>;
    type: "RECEIVE_RECONNECT_SUCCESS";
};
export declare const receiveReconnectFailure: {
    (error: PubNubError): import("./core/types").Event<"RECEIVE_RECONNECT_FAILURE", PubNubError>;
    type: "RECEIVE_RECONNECT_FAILURE";
};
export declare const receiveReconnectGiveup: {
    (error: PubNubError): import("./core/types").Event<"RECEIVING_RECONNECT_GIVEUP", PubNubError>;
    type: "RECEIVING_RECONNECT_GIVEUP";
};
export declare const disconnect: {
    (): import("./core/types").Event<"DISCONNECT", {}>;
    type: "DISCONNECT";
};
export declare const reconnect: {
    (timetoken?: string | undefined, region?: number | undefined): import("./core/types").Event<"RECONNECT", {
        cursor: {
            timetoken: string;
            region: number;
        };
    }>;
    type: "RECONNECT";
};
export declare const unsubscribeAll: {
    (): import("./core/types").Event<"UNSUBSCRIBE_ALL", {}>;
    type: "UNSUBSCRIBE_ALL";
};
export type Events = MapOf<typeof subscriptionChange | typeof restore | typeof handshakeSuccess | typeof handshakeFailure | typeof handshakeReconnectSuccess | typeof handshakeReconnectFailure | typeof handshakeReconnectGiveup | typeof receiveSuccess | typeof receiveFailure | typeof receiveReconnectSuccess | typeof receiveReconnectFailure | typeof receiveReconnectGiveup | typeof disconnect | typeof reconnect | typeof unsubscribeAll>;
