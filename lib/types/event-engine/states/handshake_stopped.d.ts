import { State } from '../core/state';
import { Effects } from '../effects';
import { Events } from '../events';
import * as Subscription from '../../core/types/api/subscription';
type HandshakeStoppedStateContext = {
    channels: string[];
    groups: string[];
    cursor?: Subscription.SubscriptionCursor;
};
export declare const HandshakeStoppedState: State<HandshakeStoppedStateContext, Events, Effects>;
export {};
