"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscribeCapable = void 0;
class SubscribeCapable {
    subscribe(subscribeParameters) {
        const timetoken = subscribeParameters === null || subscribeParameters === void 0 ? void 0 : subscribeParameters.timetoken;
        this.pubnub.subscribe(Object.assign({ channels: this.channelNames, channelGroups: this.groupNames }, (timetoken !== null && timetoken !== '' && { timetoken: timetoken })));
    }
    unsubscribe() {
        this.pubnub.unsubscribe({
            channels: this.channelNames,
            channelGroups: this.groupNames,
        });
    }
    set onMessage(onMessageListener) {
        this.listener.message = onMessageListener;
    }
    set onPresence(onPresenceListener) {
        this.listener.presence = onPresenceListener;
    }
    set onSignal(onSignalListener) {
        this.listener.signal = onSignalListener;
    }
    set onObjects(onObjectsListener) {
        this.listener.objects = onObjectsListener;
    }
    set onMessageAction(messageActionEventListener) {
        this.listener.messageAction = messageActionEventListener;
    }
    set onFile(fileEventListener) {
        this.listener.file = fileEventListener;
    }
    addListener(listener) {
        this.eventEmitter.addListener(listener, this.channelNames.filter((c) => !c.endsWith('-pnpres')), this.groupNames.filter((cg) => !cg.endsWith('-pnpres')));
    }
    removeListener(listener) {
        this.eventEmitter.removeListener(listener, this.channelNames, this.groupNames);
    }
    get channels() {
        return this.channelNames.slice(0);
    }
    get channelGroups() {
        return this.groupNames.slice(0);
    }
}
exports.SubscribeCapable = SubscribeCapable;
