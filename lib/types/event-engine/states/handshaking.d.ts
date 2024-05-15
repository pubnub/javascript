import { State } from '../core/state';
import { Effects } from '../effects';
import { Events } from '../events';
import * as Subscription from '../../core/types/api/subscription';
export type HandshakingStateContext = {
    channels: string[];
    groups: string[];
    cursor?: Subscription.SubscriptionCursor;
};
export declare const HandshakingState: State<HandshakingStateContext, Events, Effects>;
