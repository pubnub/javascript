"use strict";
/**
 * Event Engine Core module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = void 0;
const subject_1 = require("../../core/components/subject");
const state_1 = require("./state");
/**
 * Generic event engine.
 *
 * @internal
 */
class Engine extends subject_1.Subject {
    constructor(logger) {
        super(true);
        this.logger = logger;
        this._pendingEvents = [];
        this._inTransition = false;
    }
    get currentState() {
        return this._currentState;
    }
    get currentContext() {
        return this._currentContext;
    }
    describe(label) {
        return new state_1.State(label);
    }
    start(initialState, initialContext) {
        this._currentState = initialState;
        this._currentContext = initialContext;
        this.notify({
            type: 'engineStarted',
            state: initialState,
            context: initialContext,
        });
        return;
    }
    transition(event) {
        if (!this._currentState) {
            this.logger.error('Engine', 'Finite state machine is not started');
            throw new Error('Start the engine first');
        }
        if (this._inTransition) {
            this.logger.trace('Engine', () => ({
                messageType: 'object',
                message: event,
                details: 'Event engine in transition. Enqueue received event:',
            }));
            this._pendingEvents.push(event);
            return;
        }
        else
            this._inTransition = true;
        this.logger.trace('Engine', () => ({
            messageType: 'object',
            message: event,
            details: 'Event engine received event:',
        }));
        this.notify({
            type: 'eventReceived',
            event: event,
        });
        const transition = this._currentState.transition(this._currentContext, event);
        if (transition) {
            const [newState, newContext, effects] = transition;
            this.logger.trace('Engine', `Exiting state: ${this._currentState.label}`);
            for (const effect of this._currentState.exitEffects) {
                this.notify({
                    type: 'invocationDispatched',
                    invocation: effect(this._currentContext),
                });
            }
            this.logger.trace('Engine', () => ({
                messageType: 'object',
                details: `Entering '${newState.label}' state with context:`,
                message: newContext,
            }));
            const oldState = this._currentState;
            this._currentState = newState;
            const oldContext = this._currentContext;
            this._currentContext = newContext;
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
            for (const effect of this._currentState.enterEffects) {
                this.notify({
                    type: 'invocationDispatched',
                    invocation: effect(this._currentContext),
                });
            }
        }
        else
            this.logger.warn('Engine', `No transition from '${this._currentState.label}' found for event: ${event.type}`);
        this._inTransition = false;
        // Check whether a pending task should be dequeued.
        if (this._pendingEvents.length > 0) {
            const nextEvent = this._pendingEvents.shift();
            if (nextEvent) {
                this.logger.trace('Engine', () => ({
                    messageType: 'object',
                    message: nextEvent,
                    details: 'De-queueing pending event:',
                }));
                this.transition(nextEvent);
            }
        }
    }
}
exports.Engine = Engine;
