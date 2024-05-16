import { Engine } from './core';
import { Dependencies } from './dispatcher';
import * as effects from './effects';
import * as events from './events';
export declare class EventEngine {
    private engine;
    private dispatcher;
    private dependencies;
    get _engine(): Engine<events.Events, effects.Effects>;
    private readonly _unsubscribeEngine;
    constructor(dependencies: Dependencies);
    channels: string[];
    groups: string[];
    subscribe({ channels, channelGroups, timetoken, withPresence, }: {
        channels?: string[];
        channelGroups?: string[];
        timetoken?: string | number;
        withPresence?: boolean;
    }): void;
    unsubscribe({ channels, channelGroups }: {
        channels?: string[];
        channelGroups?: string[];
    }): void;
    unsubscribeAll(): void;
    reconnect({ timetoken, region }: {
        timetoken?: string;
        region?: number;
    }): void;
    disconnect(): void;
    getSubscribedChannels(): string[];
    getSubscribedChannelGroups(): string[];
    dispose(): void;
}
