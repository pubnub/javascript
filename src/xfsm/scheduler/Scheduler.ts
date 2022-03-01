import { AnySignature, Interpreter } from '..'
import { ChangelogEntry, EffectLifecycleEntry } from '../interpreter/Changelog'
import { Handler, Handlers, ManagedHandler, OneshotHandler } from './Handler'

export type SchedulerOptions<S extends AnySignature, C, D extends {}> = {
  dependencies: D
  effects: Handlers<S, C, D>
}

export class Scheduler<S extends AnySignature, C, D extends {} = {}> {
  private dependencies: D
  private effects: Handlers<S, C, D>

  private subscriptions: Map<Interpreter<S, C>, () => void> = new Map()

  private pendingEffects: Map<Interpreter<S, C>, Map<string, Handler<S, C, D, any>>> = new Map()

  constructor(options: SchedulerOptions<S, C, D>) {
    this.dependencies = options.dependencies
    this.effects = options.effects
  }

  subscribe(interpreter: Interpreter<S, C>) {
    if (this.subscriptions.has(interpreter)) {
      throw new Error('This scheduler is already connected to this interpreter.')
    }

    this.pendingEffects.set(interpreter, new Map())

    const unsubscribe = interpreter.listen(this.handleChangelog.bind(this, interpreter))

    this.subscriptions.set(interpreter, unsubscribe)
  }

  unsubscribe(interpreter: Interpreter<S, C>) {
    if (this.subscriptions.has(interpreter)) {
      const unsubscribe = this.subscriptions.get(interpreter)!

      unsubscribe()
    }
  }

  private handleChangelog(interpreter: Interpreter<S, C>, log: ChangelogEntry<S>) {
    if (log.type === 'effect-emitted') {
      if (log.lifecycle === 'start') {
        return this.handleEffectStart(interpreter, log)
      } else if (log.lifecycle === 'dispose') {
        return this.handleEffectDispose(interpreter, log)
      } else if (log.lifecycle === 'one-shot') {
        return this.handleEffectOneshot(interpreter, log)
      }
    }
  }

  private deriveEffectKey(log: EffectLifecycleEntry<S>): string {
    return `${log.effect}:${log.state}:${log.effectIndex}`
  }

  private handleEffectStart(interpreter: Interpreter<S, C>, log: EffectLifecycleEntry<S>) {
    const pendingEffectsForInterpreter = this.pendingEffects.get(interpreter)!
    const handler = this.effects[log.effect]() as ManagedHandler<S, C, D, any>

    pendingEffectsForInterpreter.set(this.deriveEffectKey(log), handler)

    handler.start({
      dependencies: this.dependencies,
      dispatch: interpreter.dispatch,
      event: log.event as any,
      getContext: interpreter.getContext.bind(interpreter),
      getCurrentState: interpreter.getCurrentState.bind(interpreter),
    })
  }

  private handleEffectDispose(interpreter: Interpreter<S, C>, log: EffectLifecycleEntry<S>) {
    const pendingEffectsForInterpreter = this.pendingEffects.get(interpreter)!
    const handler = pendingEffectsForInterpreter.get(this.deriveEffectKey(log)) as ManagedHandler<S, C, D, any>

    pendingEffectsForInterpreter.delete(this.deriveEffectKey(log))

    handler?.dispose({
      dependencies: this.dependencies,
      dispatch: interpreter.dispatch,
      event: log.event as any,
      getContext: interpreter.getContext.bind(interpreter),
      getCurrentState: interpreter.getCurrentState.bind(interpreter),
    })
  }

  private handleEffectOneshot(interpreter: Interpreter<S, C>, log: EffectLifecycleEntry<S>) {
    const handler = this.effects[log.effect]() as OneshotHandler<S, C, D, any>

    handler.run({
      dependencies: this.dependencies,
      dispatch: interpreter.dispatch,
      event: log.event as any,
      getContext: interpreter.getContext.bind(interpreter),
      getCurrentState: interpreter.getCurrentState.bind(interpreter),
    })
  }
}
