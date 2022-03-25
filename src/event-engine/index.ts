import { asyncHandler, createEffect, createEvent, Dispatcher, Engine, MapOf } from './core';

const toggle = createEvent('TOGGLE', () => undefined);
const reset = createEvent('RESET', () => undefined);

const notifyState = createEffect('NOTIFY', (amount: number) => amount);

type Events = MapOf<typeof toggle | typeof reset>;
type Effects = MapOf<typeof notifyState>;

const engine = new Engine<Events, Effects>();
const dispatcher = new Dispatcher<Effects>();

const OffState = engine.describe<{ count: number }>('OFF');
const OnState = engine.describe<{ count: number }>('ON');

OffState.on('TOGGLE', (context) => {
  return OnState.with({ count: context.count + 1 });
}).on('RESET', () => {
  return OnState.with({ count: 0 });
});

OnState.onEnter((context) => notifyState(context.count))
  .on('TOGGLE', (context) => {
    return OffState.with({ count: context.count });
  })
  .on('RESET', () => {
    return OffState.with({ count: 0 });
  });

engine.subscribe(dispatcher.dispatch.bind(dispatcher));

engine.start(OffState, { count: 0 });
engine.transition(toggle());
engine.transition(toggle());
engine.transition(toggle());
engine.transition(toggle());
engine.transition(toggle());
engine.transition(toggle());
engine.transition(toggle());

dispatcher.on(
  'NOTIFY',
  asyncHandler(async (payload) => {
    console.log(`Lamp is on (#${payload})`);
  }),
);
