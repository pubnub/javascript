import { State } from '../core/state';
import { Effects } from '../effects';
import { Events, reconnect, restore, subscriptionChange, unsubscribeAll } from '../events';
import { PubNubError } from '../../core/components/endpoint';
import { HandshakingState } from './handshaking';
import { UnsubscribedState } from './unsubscribed';

export type HandshakeFailedStateContext = {
  channels: string[];
  groups: string[];
  timetoken?: string;

  reason: PubNubError;
};

export const HandshakeFailedState = new State<HandshakeFailedStateContext, Events, Effects>('HANDSHAKE_FAILED');

HandshakeFailedState.on(subscriptionChange.type, (_, event) => {
  return HandshakingState.with({ channels: event.payload.channels, groups: event.payload.groups });
});

HandshakeFailedState.on(reconnect.type, (context, event) =>
  HandshakingState.with({
    channels: context.channels,
    groups: context.groups,
    cursor: {
      timetoken: event.payload?.timetoken ?? context.timetoken ?? '0',
      region: event.payload?.region ?? 0,
    },
  }),
);

HandshakeFailedState.on(restore.type, (_, event) =>
  HandshakingState.with({
    channels: event.payload.channels,
    groups: event.payload.groups,
    cursor: {
      timetoken: event.payload.timetoken,
      region: event.payload?.region ?? 0,
    },
  }),
);

HandshakeFailedState.on(unsubscribeAll.type, (_) => UnsubscribedState.with());
