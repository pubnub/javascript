import { State } from '../core/state';
import { Effects } from '../effects';
import { Events } from '../events';

export const ReconnectingState = new State<unknown, Events, Effects>('RECONNECTING');
