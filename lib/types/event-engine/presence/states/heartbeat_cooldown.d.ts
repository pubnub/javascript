import { State } from '../../core/state';
import { Events } from '../events';
import { Effects } from '../effects';
export type HeartbeatCooldownStateContext = {
    channels: string[];
    groups: string[];
};
export declare const HeartbeatCooldownState: State<HeartbeatCooldownStateContext, Events, Effects>;
