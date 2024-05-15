import { Payload } from './index';
export type GetPresenceStateParameters = {
    uuid?: string;
    channels?: string[];
    channelGroups?: string[];
};
export type GetPresenceStateResponse = {
    channels: Record<string, Payload>;
};
export type SetPresenceStateParameters = {
    channels?: string[];
    channelGroups?: string[];
    state: Payload;
};
export type SetPresenceStateWithHeartbeatParameters = {
    channels?: string[];
    state: Payload;
    withHeartbeat: boolean;
};
export type SetPresenceStateResponse = {
    state: Payload;
};
export type PresenceHeartbeatParameters = {
    heartbeat: number;
    channels?: string[];
    channelGroups?: string[];
    state?: Payload;
};
export type PresenceHeartbeatResponse = Record<string, unknown>;
export type PresenceLeaveParameters = {
    channels?: string[];
    channelGroups?: string[];
};
export type PresenceLeaveResponse = Record<string, unknown>;
export type HereNowParameters = {
    channels?: string[];
    channelGroups?: string[];
    includeUUIDs?: boolean;
    includeState?: boolean;
    queryParameters?: Record<string, string>;
};
export type HereNowResponse = {
    totalChannels: number;
    totalOccupancy: number;
    channels: {
        [p: string]: {
            occupants: {
                uuid: string;
                state?: Payload | null;
            }[];
            name: string;
            occupancy: number;
        };
    };
};
export type WhereNowParameters = {
    uuid?: string;
};
export type WhereNowResponse = {
    channels: string[];
};
