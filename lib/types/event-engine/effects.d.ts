import { MapOf } from './core';
import { HandshakeReconnectingStateContext } from './states/handshake_reconnecting';
import { ReceiveReconnectingStateContext } from './states/receive_reconnecting';
import * as Subscription from '../core/types/api/subscription';
import { StatusEvent } from '../core/types/api';
export declare const handshake: {
    (channels: string[], groups: string[]): import("./core/types").Invocation<"HANDSHAKE", {
        channels: string[];
        groups: string[];
    }>;
    type: "HANDSHAKE";
    cancel: import("./core/types").Invocation<"CANCEL", "HANDSHAKE">;
};
export declare const receiveMessages: {
    (channels: string[], groups: string[], cursor: Subscription.SubscriptionCursor): import("./core/types").Invocation<"RECEIVE_MESSAGES", {
        channels: string[];
        groups: string[];
        cursor: Subscription.SubscriptionCursor;
    }>;
    type: "RECEIVE_MESSAGES";
    cancel: import("./core/types").Invocation<"CANCEL", "RECEIVE_MESSAGES">;
};
export declare const emitMessages: {
    (events: ({
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
    })[]): import("./core/types").Invocation<"EMIT_MESSAGES", ({
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
    })[]>;
    type: "EMIT_MESSAGES";
};
export declare const emitStatus: {
    (status: StatusEvent): import("./core/types").Invocation<"EMIT_STATUS", StatusEvent>;
    type: "EMIT_STATUS";
};
export declare const receiveReconnect: {
    (context: ReceiveReconnectingStateContext): import("./core/types").Invocation<"RECEIVE_RECONNECT", ReceiveReconnectingStateContext>;
    type: "RECEIVE_RECONNECT";
    cancel: import("./core/types").Invocation<"CANCEL", "RECEIVE_RECONNECT">;
};
export declare const handshakeReconnect: {
    (context: HandshakeReconnectingStateContext): import("./core/types").Invocation<"HANDSHAKE_RECONNECT", HandshakeReconnectingStateContext>;
    type: "HANDSHAKE_RECONNECT";
    cancel: import("./core/types").Invocation<"CANCEL", "HANDSHAKE_RECONNECT">;
};
export type Effects = MapOf<typeof receiveMessages | typeof handshake | typeof emitMessages | typeof receiveReconnect | typeof handshakeReconnect | typeof emitStatus>;
