import { State } from '../core/state';
import { Effects } from '../effects';
import { Events, restore, subscriptionChange } from '../events';
import { HandshakingState } from './handshaking';
import { ReconnectingState } from './reconnecting';

export const UnsubscribedState = new State<void, Events, Effects>('UNSUBSCRIBED');

UnsubscribedState.on(subscriptionChange.type, (_, event) =>
  HandshakingState.with({ channels: event.payload.channels, groups: event.payload.groups }),
);

UnsubscribedState.on(restore.type, (_, event) => ReconnectingState.with({ ...event.payload }));
