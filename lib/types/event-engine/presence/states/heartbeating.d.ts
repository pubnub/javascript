import { State } from '../../core/state';
import { Events } from '../events';
import { Effects } from '../effects';
export type HeartbeatingStateContext = {
    channels: string[];
    groups: string[];
};
export declare const HeartbeatingState: State<HeartbeatingStateContext, Events, Effects>;
