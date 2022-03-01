import { Interpreter, Scheduler } from '../xfsm';

import createInterpreter, { Context } from './interpreter';
import createScheduler, { Dependencies } from './scheduler';
import { Signature } from './signature';

export class EventEngine {
  public interpreter: Interpreter<Signature, Context>;
  private scheduler: Scheduler<Signature, Context, Dependencies>;

  constructor(public dependencies: Dependencies) {
    this.interpreter = createInterpreter();
    this.scheduler = createScheduler(this.dependencies);

    this.scheduler.subscribe(this.interpreter);

    this.interpreter.start();
  }

  subscribe(channels: string[], channelGroups: string[]) {
    const context = this.interpreter.getContext();

    this.interpreter.dispatch.SUBSCRIPTION_CHANGE({
      channels: [...context.channels, ...channels],
      channelGroups: [...context.channelGroups, ...channelGroups],
    });
  }

  unsubscribe(channels: string[], channelGroups: string[]) {
    const context = this.interpreter.getContext();

    this.interpreter.dispatch.SUBSCRIPTION_CHANGE({
      channels: context.channels.filter((channel) => !channels.includes(channel)),
      channelGroups: context.channelGroups.filter((channelGroup) => !channelGroups.includes(channelGroup)),
    });
  }

  reconnect() {
    this.interpreter.dispatch.RECONNECT();
  }

  disconnect() {
    this.interpreter.dispatch.DISCONNECT();
  }

  unsubscribeAll() {
    this.interpreter.dispatch.UNSUBSCRIBE_ALL();
  }

  getSubscribedChannels() {
    return this.interpreter.getContext().channels;
  }

  getSubscribedChannelGroups() {
    return this.interpreter.getContext().channelGroups;
  }
}
