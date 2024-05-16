import { PrivateClientConfiguration } from '../../core/interfaces/configuration';
import { Dispatcher, Engine } from '../core';
import * as Presence from '../../core/types/api/presence';
import { Payload, ResultCallback } from '../../core/types/api';
import * as effects from './effects';
import * as events from './events';
export type Dependencies = {
    heartbeat: (parameters: Presence.PresenceHeartbeatParameters, callback?: ResultCallback<Presence.PresenceHeartbeatResponse>) => Promise<Presence.PresenceHeartbeatResponse | void>;
    leave: (parameters: Presence.PresenceLeaveParameters) => void;
    heartbeatDelay: () => Promise<void>;
    retryDelay: (milliseconds: number) => Promise<void>;
    config: PrivateClientConfiguration;
    presenceState: Record<string, Payload>;
    emitStatus: (status: any) => void;
};
export declare class PresenceEventEngineDispatcher extends Dispatcher<effects.Effects, Dependencies> {
    constructor(engine: Engine<events.Events, effects.Effects>, dependencies: Dependencies);
}
