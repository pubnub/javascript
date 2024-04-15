import { Subject } from '../../core/components/subject';
import { State } from './state';
export class Engine extends Subject {
    describe(label) {
        return new State(label);
    }
    start(initialState, initialContext) {
        this.currentState = initialState;
        this.currentContext = initialContext;
        this.notify({
            type: 'engineStarted',
            state: initialState,
            context: initialContext,
        });
        return;
    }
    transition(event) {
        if (!this.currentState) {
            throw new Error('Start the engine first');
        }
        this.notify({
            type: 'eventReceived',
            event: event,
        });
        const transition = this.currentState.transition(this.currentContext, event);
        if (transition) {
            const [newState, newContext, effects] = transition;
            for (const effect of this.currentState.exitEffects) {
                this.notify({
                    type: 'invocationDispatched',
                    invocation: effect(this.currentContext),
                });
            }
            const oldState = this.currentState;
            this.currentState = newState;
            const oldContext = this.currentContext;
            this.currentContext = newContext;
            this.notify({
                type: 'transitionDone',
                fromState: oldState,
                fromContext: oldContext,
                toState: newState,
                toContext: newContext,
                event: event,
            });
            for (const effect of effects) {
                this.notify({
                    type: 'invocationDispatched',
                    invocation: effect,
                });
            }
            for (const effect of this.currentState.enterEffects) {
                this.notify({
                    type: 'invocationDispatched',
                    invocation: effect(this.currentContext),
                });
            }
        }
    }
}
