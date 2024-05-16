import { Engine } from '../core';
import * as events from './events';
import * as effects from './effects';
import { Dependencies } from './dispatcher';
export declare class PresenceEventEngine {
    private dependencies;
    private engine;
    private dispatcher;
    get _engine(): Engine<events.Events, effects.Effects>;
    private _unsubscribeEngine;
    constructor(dependencies: Dependencies);
    channels: string[];
    groups: string[];
    join({ channels, groups }: {
        channels?: string[];
        groups?: string[];
    }): void;
    leave({ channels, groups }: {
        channels?: string[];
        groups?: string[];
    }): void;
    leaveAll(): void;
    dispose(): void;
}
