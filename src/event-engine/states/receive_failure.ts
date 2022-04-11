import { State } from '../core/state';
import { Cursor } from '../../models/Cursor';
import { Effects } from '../effects';
import { Events, reconnectingRetry } from '../events';
import { ReceiveReconnectingState } from './receive_reconnecting';
import { PubNubError } from '../../core/components/endpoint';

export type ReceiveFailureStateContext = {
  channels: string[];
  groups: string[];
  cursor: Cursor;

  reason: PubNubError;
};

export const ReceiveFailureState = new State<ReceiveFailureStateContext, Events, Effects>('RECEIVE_FAILURE');

ReceiveFailureState.on(reconnectingRetry.type, (context) =>
  ReceiveReconnectingState.with({
    ...context,
    attempts: 0, // TODO: figure out what should be the reason
  }),
);
