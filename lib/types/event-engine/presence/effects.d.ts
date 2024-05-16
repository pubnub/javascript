import { MapOf } from '../core';
import { HeartbeatReconnectingStateContext } from './states/heartbeat_reconnecting';
export declare const heartbeat: {
    (channels: string[], groups: string[]): import("../core/types").Invocation<"HEARTBEAT", {
        channels: string[];
        groups: string[];
    }>;
    type: "HEARTBEAT";
};
export declare const leave: {
    (channels: string[], groups: string[]): import("../core/types").Invocation<"LEAVE", {
        channels: string[];
        groups: string[];
    }>;
    type: "LEAVE";
};
export declare const emitStatus: {
    (status: any): import("../core/types").Invocation<"EMIT_STATUS", any>;
    type: "EMIT_STATUS";
};
export declare const wait: {
    (): import("../core/types").Invocation<"WAIT", {}>;
    type: "WAIT";
    cancel: import("../core/types").Invocation<"CANCEL", "WAIT">;
};
export declare const delayedHeartbeat: {
    (context: HeartbeatReconnectingStateContext): import("../core/types").Invocation<"DELAYED_HEARTBEAT", HeartbeatReconnectingStateContext>;
    type: "DELAYED_HEARTBEAT";
    cancel: import("../core/types").Invocation<"CANCEL", "DELAYED_HEARTBEAT">;
};
export type Effects = MapOf<typeof heartbeat | typeof leave | typeof emitStatus | typeof wait | typeof delayedHeartbeat>;
