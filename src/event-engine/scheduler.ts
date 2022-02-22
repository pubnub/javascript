import { managed, oneshot, Scheduler } from '../xfsm';
import { Context } from './interpreter';
import { Signature } from './signature';

import { HandshakeEndpointResponse, ReceiveEndpointResponse } from './types';

export type Dependencies = {
  handshakeEndpoint: (params: {
    channels: string[];
    channelGroups: string[];
    abortSignal: AbortSignal;
  }) => Promise<HandshakeEndpointResponse>;
  receiveEndpoint: (params: {
    channels: string[];
    channelGroups: string[];
    abortSignal?: AbortSignal;
    timetoken: string;
    region: number;
  }) => Promise<ReceiveEndpointResponse>;
};

export default (dependencies: Dependencies) =>
  new Scheduler<Signature, Context, Dependencies>({
    dependencies,
    effects: {
      EMIT_EVENTS: oneshot.from(({ event }) => {
        console.log(event?.payload.messages);
      }),
      REQUEST_HANDSHAKE: managed.fromAsync(
        async ({ getContext, dependencies: { handshakeEndpoint }, cancelSignal, dispatch }) => {
          const context = getContext();

          try {
            const result = await handshakeEndpoint({
              abortSignal: cancelSignal,
              channelGroups: context.channelGroups,
              channels: context.channels,
            });

            dispatch.HANDSHAKING_SUCCESS({ cursor: result });
          } catch (e) {
            //TODO: implement handshake failure and cancel handling
          }
        }
      ),
      REQUEST_EVENTS: managed.fromAsync(
        async ({ getContext, dependencies: { receiveEndpoint }, cancelSignal, dispatch }) => {
          const context = getContext();

          try {
            const result = await receiveEndpoint({
              // abortSignal: cancelSignal,
              channelGroups: context.channelGroups,
              channels: context.channels,
              timetoken: context.cursor!.timetoken,
              region: context.cursor!.region!,
            });

            dispatch.RECEIVING_SUCCESS({ cursor: result.metadata, messages: result.messages });
          } catch (e) {
            //TODO: implement handshake failure and cancel handling
          }
        }
      ),
    },
  });
