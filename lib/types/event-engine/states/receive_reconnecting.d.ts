import { PubNubError } from '../../errors/pubnub-error';
import { State } from '../core/state';
import { Effects } from '../effects';
import { Events } from '../events';
import * as Subscription from '../../core/types/api/subscription';
export type ReceiveReconnectingStateContext = {
    channels: string[];
    groups: string[];
    cursor: Subscription.SubscriptionCursor;
    attempts: number;
    reason: PubNubError;
};
export declare const ReceiveReconnectingState: State<ReceiveReconnectingStateContext, Events, Effects>;
