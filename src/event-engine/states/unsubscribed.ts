import { State } from '../core/state';
import { Effects } from '../effects';
import { Events, subscriptionChange, restore } from '../events';
import { HandshakingState } from './handshaking';

export const UnsubscribedState = new State<void, Events, Effects>('UNSUBSCRIBED');

UnsubscribedState.on(subscriptionChange.type, (_, event) =>
  HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    timetoken: event.payload.timetoken,
  }),
);

UnsubscribedState.on(restore.type, (_, event) =>
  HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    timetoken: event.payload.timetoken,
  }),
);
