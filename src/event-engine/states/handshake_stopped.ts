import { Cursor } from '../../models/Cursor';
import { State } from '../core/state';
import { Effects } from '../effects';
import { Events, reconnect, restore, subscriptionChange, unsubscribeAll } from '../events';
import { HandshakingState } from './handshaking';
import { UnsubscribedState } from './unsubscribed';

type HandshakeStoppedStateContext = {
  channels: string[];
  groups: string[];
  cursor?: Cursor;
};

export const HandshakeStoppedState = new State<HandshakeStoppedStateContext, Events, Effects>('HANDSHAKE_STOPPED');

HandshakeStoppedState.on(subscriptionChange.type, (context, event) =>
  HandshakeStoppedState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: context.cursor
  }),
);

HandshakeStoppedState.on(reconnect.type, (context, event) =>
  HandshakingState.with({
    ...context,
    cursor: {
      timetoken: event.payload?.timetoken ?? context.cursor?.timetoken ?? '0',
      region: event.payload?.region ?? 0,
    },
  }),
);

HandshakeStoppedState.on(restore.type, (_, event) =>
  HandshakeStoppedState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: {
      timetoken: event.payload.timetoken,
      region: event.payload?.region ?? 0,
    },
  }),
);

HandshakeStoppedState.on(unsubscribeAll.type, (_) => UnsubscribedState.with());
