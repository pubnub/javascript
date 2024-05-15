import { State } from '../../core/state';
import { Events } from '../events';
import { Effects } from '../effects';
export type HeartbeatFailedStateContext = {
    channels: string[];
    groups: string[];
};
export declare const HeartbeatFailedState: State<HeartbeatFailedStateContext, Events, Effects>;
