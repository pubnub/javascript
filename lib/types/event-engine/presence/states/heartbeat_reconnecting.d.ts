import { PubNubError } from '../../../errors/pubnub-error';
import { State } from '../../core/state';
import { Events } from '../events';
import { Effects } from '../effects';
export type HeartbeatReconnectingStateContext = {
    channels: string[];
    groups: string[];
    attempts: number;
    reason: PubNubError;
};
export declare const HearbeatReconnectingState: State<HeartbeatReconnectingStateContext, Events, Effects>;
