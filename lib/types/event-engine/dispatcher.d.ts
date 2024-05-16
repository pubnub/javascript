import { PrivateClientConfiguration } from '../core/interfaces/configuration';
import * as Subscription from '../core/types/api/subscription';
import { Dispatcher, Engine } from './core';
import * as effects from './effects';
import * as events from './events';
import { Payload, StatusEvent } from '../core/types/api';
export type Dependencies = {
    handshake: (parameters: Subscription.CancelableSubscribeParameters) => Promise<Subscription.SubscriptionCursor>;
    receiveMessages: (parameters: Subscription.CancelableSubscribeParameters) => Promise<Subscription.SubscriptionResponse>;
    join?: (parameters: {
        channels?: string[];
        groups?: string[];
    }) => void;
    leave?: (parameters: {
        channels?: string[];
        groups?: string[];
    }) => void;
    leaveAll?: () => void;
    presenceState: Record<string, Payload>;
    config: PrivateClientConfiguration;
    delay: (milliseconds: number) => Promise<void>;
    emitMessages: (events: Subscription.SubscriptionResponse['messages']) => void;
    emitStatus: (status: StatusEvent) => void;
};
export declare class EventEngineDispatcher extends Dispatcher<effects.Effects, Dependencies> {
    constructor(engine: Engine<events.Events, effects.Effects>, dependencies: Dependencies);
}
