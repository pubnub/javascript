import { Engine } from '../core';
import * as events from './events';
import { PresenceEventEngineDispatcher } from './dispatcher';
import { HeartbeatInactiveState } from './states/heartbeat_inactive';
export class PresenceEventEngine {
    get _engine() {
        return this.engine;
    }
    constructor(dependencies) {
        this.dependencies = dependencies;
        this.engine = new Engine();
        this.channels = [];
        this.groups = [];
        this.dispatcher = new PresenceEventEngineDispatcher(this.engine, dependencies);
        this._unsubscribeEngine = this.engine.subscribe((change) => {
            if (change.type === 'invocationDispatched') {
                this.dispatcher.dispatch(change.invocation);
            }
        });
        this.engine.start(HeartbeatInactiveState, undefined);
    }
    join({ channels, groups }) {
        this.channels = [...this.channels, ...(channels !== null && channels !== void 0 ? channels : [])];
        this.groups = [...this.groups, ...(groups !== null && groups !== void 0 ? groups : [])];
        this.engine.transition(events.joined(this.channels.slice(0), this.groups.slice(0)));
    }
    leave({ channels, groups }) {
        if (this.dependencies.presenceState) {
            channels === null || channels === void 0 ? void 0 : channels.forEach((c) => delete this.dependencies.presenceState[c]);
            groups === null || groups === void 0 ? void 0 : groups.forEach((g) => delete this.dependencies.presenceState[g]);
        }
        this.engine.transition(events.left(channels !== null && channels !== void 0 ? channels : [], groups !== null && groups !== void 0 ? groups : []));
    }
    leaveAll() {
        this.engine.transition(events.leftAll());
    }
    dispose() {
        this._unsubscribeEngine();
        this.dispatcher.dispose();
    }
}
