import { Interpreter } from '../xfsm';
import description from './description';
import { Signature } from './signature';
import { Cursor } from './types';

export type Context = {
  channels: string[];
  channelGroups: string[];

  cursor: Cursor | undefined;
};

export default () =>
  new Interpreter<Signature, Context>(description, {
    initialState: 'UNSUBSCRIBED',
    initialContext: {
      channels: [],
      channelGroups: [],
      cursor: undefined,
    },
    actions: {
      SET_CHANNELS: (context, event) => {
        return {
          ...context,
          channels: event?.payload.channels ?? [],
          channelGroups: event?.payload.channelGroups ?? [],
        };
      },
      SET_CURSOR: (context, event) => {
        return {
          ...context,
          cursor: event?.payload.cursor,
        };
      },

      SET_PARTIAL_CURSOR: (context, event) => {
        if (event?.payload.cursor) {
          return {
            ...context,
            cursor: {
              ...context.cursor,
              timetoken: event.payload.cursor.timetoken!,
              region: event?.payload.cursor.region,
            },
          };
        }
      },
    },
  });
