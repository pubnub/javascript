import { PubNubError } from '../../errors/pubnub-error';
import { State } from '../core/state';
import { Effects } from '../effects';
import { Events } from '../events';
import * as Subscription from '../../core/types/api/subscription';
export type HandshakeReconnectingStateContext = {
    channels: string[];
    groups: string[];
    cursor?: Subscription.SubscriptionCursor;
    attempts: number;
    reason: PubNubError;
};
export declare const HandshakeReconnectingState: State<HandshakeReconnectingStateContext, Events, Effects>;
