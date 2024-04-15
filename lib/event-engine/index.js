import { Engine } from './core';
import { EventEngineDispatcher } from './dispatcher';
import * as events from './events';
import { UnsubscribedState } from './states/unsubscribed';
import * as utils from '../core/utils';
export class EventEngine {
    get _engine() {
        return this.engine;
    }
    constructor(dependencies) {
        this.engine = new Engine();
        this.channels = [];
        this.groups = [];
        this.dependencies = dependencies;
        this.dispatcher = new EventEngineDispatcher(this.engine, dependencies);
        this._unsubscribeEngine = this.engine.subscribe((change) => {
            if (change.type === 'invocationDispatched') {
                this.dispatcher.dispatch(change.invocation);
            }
        });
        this.engine.start(UnsubscribedState, undefined);
    }
    subscribe({ channels, channelGroups, timetoken, withPresence, }) {
        this.channels = [...this.channels, ...(channels !== null && channels !== void 0 ? channels : [])];
        this.groups = [...this.groups, ...(channelGroups !== null && channelGroups !== void 0 ? channelGroups : [])];
        if (withPresence) {
            this.channels.map((c) => this.channels.push(`${c}-pnpres`));
            this.groups.map((g) => this.groups.push(`${g}-pnpres`));
        }
        if (timetoken) {
            this.engine.transition(events.restore(Array.from(new Set([...this.channels, ...(channels !== null && channels !== void 0 ? channels : [])])), Array.from(new Set([...this.groups, ...(channelGroups !== null && channelGroups !== void 0 ? channelGroups : [])])), timetoken));
        }
        else {
            this.engine.transition(events.subscriptionChange(Array.from(new Set([...this.channels, ...(channels !== null && channels !== void 0 ? channels : [])])), Array.from(new Set([...this.groups, ...(channelGroups !== null && channelGroups !== void 0 ? channelGroups : [])]))));
        }
        if (this.dependencies.join) {
            this.dependencies.join({
                channels: Array.from(new Set(this.channels.filter((c) => !c.endsWith('-pnpres')))),
                groups: Array.from(new Set(this.groups.filter((g) => !g.endsWith('-pnpres')))),
            });
        }
    }
    unsubscribe({ channels = [], channelGroups = [] }) {
        const filteredChannels = utils.removeSingleOccurance(this.channels, [
            ...channels,
            ...channels.map((c) => `${c}-pnpres`),
        ]);
        const filteredGroups = utils.removeSingleOccurance(this.groups, [
            ...channelGroups,
            ...channelGroups.map((c) => `${c}-pnpres`),
        ]);
        if (new Set(this.channels).size !== new Set(filteredChannels).size ||
            new Set(this.groups).size !== new Set(filteredGroups).size) {
            const channelsToLeave = utils.findUniqueCommonElements(this.channels, channels);
            const groupstoLeave = utils.findUniqueCommonElements(this.groups, channelGroups);
            if (this.dependencies.presenceState) {
                channelsToLeave === null || channelsToLeave === void 0 ? void 0 : channelsToLeave.forEach((c) => delete this.dependencies.presenceState[c]);
                groupstoLeave === null || groupstoLeave === void 0 ? void 0 : groupstoLeave.forEach((g) => delete this.dependencies.presenceState[g]);
            }
            this.channels = filteredChannels;
            this.groups = filteredGroups;
            this.engine.transition(events.subscriptionChange(Array.from(new Set(this.channels.slice(0))), Array.from(new Set(this.groups.slice(0)))));
            if (this.dependencies.leave) {
                this.dependencies.leave({
                    channels: channelsToLeave.slice(0),
                    groups: groupstoLeave.slice(0),
                });
            }
        }
    }
    unsubscribeAll() {
        this.channels = [];
        this.groups = [];
        if (this.dependencies.presenceState) {
            Object.keys(this.dependencies.presenceState).forEach((objectName) => {
                delete this.dependencies.presenceState[objectName];
            });
        }
        this.engine.transition(events.subscriptionChange(this.channels.slice(0), this.groups.slice(0)));
        if (this.dependencies.leaveAll) {
            this.dependencies.leaveAll();
        }
    }
    reconnect({ timetoken, region }) {
        this.engine.transition(events.reconnect(timetoken, region));
    }
    disconnect() {
        this.engine.transition(events.disconnect());
        if (this.dependencies.leaveAll) {
            this.dependencies.leaveAll();
        }
    }
    getSubscribedChannels() {
        return Array.from(new Set(this.channels.slice(0)));
    }
    getSubscribedChannelGroups() {
        return Array.from(new Set(this.groups.slice(0)));
    }
    dispose() {
        this.disconnect();
        this._unsubscribeEngine();
        this.dispatcher.dispose();
    }
}
