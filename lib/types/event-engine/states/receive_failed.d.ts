import { State } from '../core/state';
import { Effects } from '../effects';
import { Events } from '../events';
import { PubNubError } from '../../errors/pubnub-error';
import * as Subscription from '../../core/types/api/subscription';
export type ReceiveFailedStateContext = {
    channels: string[];
    groups: string[];
    cursor: Subscription.SubscriptionCursor;
    reason: PubNubError;
};
export declare const ReceiveFailedState: State<ReceiveFailedStateContext, Events, Effects>;
