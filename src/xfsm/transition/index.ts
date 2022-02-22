import { AnySignature, Description, StateDescription, TransitionDescription } from '../description'
import { Change, invalidChange, validChange } from './Change'

export function transition<S extends AnySignature, Ev extends S['eventType']>(
  description: Description<S>,
  state: S['stateType'],
  event: S['eventMap'][Ev]
): Change<S> {
  const extractTransition = (
    state: StateDescription<S>,
    eventType: S['eventType']
  ): TransitionDescription<S> | undefined => {
    return state.transitions?.[eventType]
  }

  // Get current state description
  const currentStateDesc = description[state]

  // Ugly hack, but there is no way (that I know of) to do this without concrete types
  const transition = extractTransition(currentStateDesc, event.type)

  // If no transition is defined for this event, return an invalid change
  if (!transition) {
    return invalidChange(state)
  }

  // If transition target is the same as current state and transition is internal,
  // return valid change without any state actions or effects (only transition actions or effects)
  if (transition.target === state && transition.internal === true) {
    return validChange(
      state,
      {
        exit: [],
        transition: transition.actions ?? [],
        enter: [],
      },
      {
        dispose: [],
        transition: transition.effects ?? [],
        start: [],
      }
    )
  }

  // Get target state description
  const targetStateDesc = description[transition.target]

  // Extract all actions in order:
  //  - current state exit edge actions,
  //  - transition actions,
  //  - target state enter edge actions
  const actions = {
    exit: currentStateDesc.onExit ?? [],
    transition: transition.actions ?? [],
    enter: targetStateDesc.onEnter ?? [],
  }

  // Extract all effects in order:
  //  - current state effects to dispose,
  //  - transition effects (one-shot),
  //  - target state effects to start
  const effects = {
    dispose: currentStateDesc.effects ?? [],
    transition: transition.effects ?? [],
    start: targetStateDesc.effects ?? [],
  }

  // Return valid change with all that data
  return validChange(transition.target, actions, effects)
}
