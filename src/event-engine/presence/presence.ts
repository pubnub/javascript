import { Dispatcher, Engine } from "../core"
import * as events from "./events"
import * as effects from "./effects"
import { Dependencies, PresenceEventEngineDispatcher } from "./dispatcher";

export class PresenceEventEngine {
  private engine: Engine<events.Events, effects.Effects> = new Engine();
  private dispatcher: Dispatcher<effects.Effects, Dependencies>;

  get _engine() {
    return this.engine;
  }

  /**
   *
   */
  constructor(dependencies: Dependencies) {
    this.dispatcher = new PresenceEventEngineDispatcher(this.engine, dependencies);
    
  }
}