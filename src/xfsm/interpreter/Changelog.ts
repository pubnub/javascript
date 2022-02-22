import { Interpreter } from '.'
import { AnySignature } from '../description'

export type StartEntry<S extends AnySignature> = {
  type: 'interpreter-started'

  initialState: S['stateType']

  actions: Array<S['actionType']>
  startedEffects: Array<S['effectType']>
}

export type TransitionEntry<S extends AnySignature> = {
  type: 'transition'

  event: S['eventMap'][S['eventType']]

  from: S['stateType']
  to: S['stateType']

  exitActions: Array<S['actionType']>
  transitionActions: Array<S['actionType']>
  enterActions: Array<S['actionType']>

  startedEffects: Array<S['effectType']>
  transitionEffects: Array<S['effectType']>
  disposedEffects: Array<S['effectType']>
}

export type InvalidTransitionEntry<S extends AnySignature> = {
  type: 'invalid-transition'

  event: S['eventMap'][S['eventType']]

  state: S['stateType']
}

export type ActionAppliedEntry<S extends AnySignature> = {
  type: 'action-applied'

  event?: S['eventMap'][S['eventType']]
  action: S['actionType']
}

export type EffectLifecycleEntry<S extends AnySignature> = {
  type: 'effect-emitted'

  event?: S['eventMap'][S['eventType']]

  state: S['stateType']

  effect: S['effectType']
  effectIndex: number
  lifecycle: 'start' | 'dispose' | 'one-shot'
}

export type EventReceived<S extends AnySignature> = {
  type: 'event-received'

  event: S['eventMap'][S['eventType']]
}

export type ChangelogEntry<S extends AnySignature> =
  | StartEntry<S>
  | TransitionEntry<S>
  | InvalidTransitionEntry<S>
  | ActionAppliedEntry<S>
  | EffectLifecycleEntry<S>
  | EventReceived<S>

export type Listener<S extends AnySignature, C> = (entry: ChangelogEntry<S>, interpreter: Interpreter<S, C>) => void
