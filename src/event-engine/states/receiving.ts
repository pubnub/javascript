import { State } from '../core/state';
import { Cursor } from '../../models/Cursor';
import { Effects } from '../effects';
import { Events } from '../events';

export type ReceivingStateContext = {
  channels: string[];
  groups: string[];
  cursor: Cursor;
};

export const ReceivingState = new State<ReceivingStateContext, Events, Effects>('RECEIVING');
