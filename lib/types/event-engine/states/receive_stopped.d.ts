import { State } from '../core/state';
import { Effects } from '../effects';
import { Events } from '../events';
import * as Subscription from '../../core/types/api/subscription';
type ReceiveStoppedStateContext = {
    channels: string[];
    groups: string[];
    cursor: Subscription.SubscriptionCursor;
};
export declare const ReceiveStoppedState: State<ReceiveStoppedStateContext, Events, Effects>;
export {};
