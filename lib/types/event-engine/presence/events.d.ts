import { PubNubError } from '../../errors/pubnub-error';
import { MapOf } from '../core';
export declare const reconnect: {
    (): import("../core/types").Event<"RECONNECT", {}>;
    type: "RECONNECT";
};
export declare const disconnect: {
    (): import("../core/types").Event<"DISCONNECT", {}>;
    type: "DISCONNECT";
};
export declare const joined: {
    (channels: string[], groups: string[]): import("../core/types").Event<"JOINED", {
        channels: string[];
        groups: string[];
    }>;
    type: "JOINED";
};
export declare const left: {
    (channels: string[], groups: string[]): import("../core/types").Event<"LEFT", {
        channels: string[];
        groups: string[];
    }>;
    type: "LEFT";
};
export declare const leftAll: {
    (): import("../core/types").Event<"LEFT_ALL", {}>;
    type: "LEFT_ALL";
};
export declare const heartbeatSuccess: {
    (statusCode: number): import("../core/types").Event<"HEARTBEAT_SUCCESS", {
        statusCode: number;
    }>;
    type: "HEARTBEAT_SUCCESS";
};
export declare const heartbeatFailure: {
    (error: PubNubError): import("../core/types").Event<"HEARTBEAT_FAILURE", PubNubError>;
    type: "HEARTBEAT_FAILURE";
};
export declare const heartbeatGiveup: {
    (): import("../core/types").Event<"HEARTBEAT_GIVEUP", {}>;
    type: "HEARTBEAT_GIVEUP";
};
export declare const timesUp: {
    (): import("../core/types").Event<"TIMES_UP", {}>;
    type: "TIMES_UP";
};
export type Events = MapOf<typeof reconnect | typeof disconnect | typeof leftAll | typeof heartbeatSuccess | typeof heartbeatFailure | typeof heartbeatGiveup | typeof joined | typeof left | typeof timesUp>;
