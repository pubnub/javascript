export class SubscribeCapable {
    subscribe() {
        var _a, _b;
        this.pubnub.subscribe(Object.assign({ channels: this.channelNames, channelGroups: this.groupNames }, (((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.cursor) === null || _b === void 0 ? void 0 : _b.timetoken) && { timetoken: this.options.cursor.timetoken })));
    }
    unsubscribe() {
        this.pubnub.unsubscribe({
            channels: this.channelNames.filter((c) => !c.endsWith('-pnpres')),
            channelGroups: this.groupNames.filter((cg) => !cg.endsWith('-pnpres')),
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
