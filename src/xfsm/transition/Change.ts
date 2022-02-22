import { AnySignature } from '../description'

export type InvalidChange<S extends AnySignature> = {
  type: 'invalid'

  state: S['stateType']
}

type ActionChanges<S extends AnySignature> = {
  exit: Array<S['actionType']>
  enter: Array<S['actionType']>
  transition: Array<S['actionType']>
}

type EffectChanges<S extends AnySignature> = {
  start: Array<S['effectType']>
  dispose: Array<S['effectType']>
  transition: Array<S['effectType']>
}

export type ValidChange<S extends AnySignature> = {
  type: 'valid'

  state: S['stateType']

  actions: ActionChanges<S>
  effects: EffectChanges<S>
}

export type Change<S extends AnySignature> = InvalidChange<S> | ValidChange<S>

export const validChange = <S extends AnySignature>(
  state: S['stateType'],
  actions: ActionChanges<S>,
  effects: EffectChanges<S>
): ValidChange<S> => ({
  type: 'valid',

  state,
  actions: actions,
  effects: effects,
})

export const invalidChange = <S extends AnySignature>(state: S['stateType']): InvalidChange<S> => ({
  type: 'invalid',

  state,
})
