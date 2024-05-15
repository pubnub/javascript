import { State } from '../../core/state';
import { Effects } from '../effects';
import { Events } from '../events';
export type HeartbeatStoppedStateContext = {
    channels: string[];
    groups: string[];
};
export declare const HeartbeatStoppedState: State<HeartbeatStoppedStateContext, Events, Effects>;
