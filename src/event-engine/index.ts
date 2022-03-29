import { asyncHandler, Dispatcher, Engine } from './core';
import { Effects, handshake } from './effects';
import { Events, subscriptionChange } from './events';

import { UnsubscribedState } from './states/unsubscribed';

export class EventEngine {
  private engine: Engine<Events, Effects> = new Engine();

  constructor(private dispatcher: Dispatcher<Effects>) {
    this.engine.subscribe(dispatcher.dispatch.bind(dispatcher));
    this.engine.start(UnsubscribedState, undefined);
  }

  subscribe({ channels, groups }: { channels?: string[]; groups?: string[] }) {
    this.engine.transition(subscriptionChange(channels ?? [], groups ?? []));
  }

  unsubscribe() {
    return;
  }

  unsubscribeAll() {
    return;
  }

  reconnect() {
    return;
  }

  disconnect() {
    return;
  }
}

const dispatcher = new Dispatcher<Effects>();

dispatcher.on(
  handshake.type,
  asyncHandler(async (event) => {
    console.log(event);
  }),
);

const ee = new EventEngine(dispatcher);

ee.subscribe({ channels: ['test'] });
