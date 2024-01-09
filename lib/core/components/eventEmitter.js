"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var EventEmitter = /** @class */ (function () {
    function EventEmitter(_a) {
        var modules = _a.modules, listenerManager = _a.listenerManager, getFileUrl = _a.getFileUrl;
        this.modules = modules;
        this.listenerManager = listenerManager;
        this.getFileUrl = getFileUrl;
        if (modules.cryptoModule)
            this._decoder = new TextDecoder();
    }
    EventEmitter.prototype.emitEvent = function (e) {
        var channel = e.channel, publishMetaData = e.publishMetaData;
        var subscriptionMatch = e.subscriptionMatch;
        if (channel === subscriptionMatch) {
            subscriptionMatch = null;
        }
        if (e.channel.endsWith('-pnpres')) {
            var announce = {};
            announce.channel = null;
            announce.subscription = null;
            if (channel) {
                announce.channel = channel.substring(0, channel.lastIndexOf('-pnpres'));
            }
            if (subscriptionMatch) {
                announce.subscription = subscriptionMatch.substring(0, subscriptionMatch.lastIndexOf('-pnpres'));
            }
            announce.action = e.payload.action;
            announce.state = e.payload.data;
            announce.timetoken = publishMetaData.publishTimetoken;
            announce.occupancy = e.payload.occupancy;
            announce.uuid = e.payload.uuid;
            announce.timestamp = e.payload.timestamp;
            if (e.payload.join) {
                announce.join = e.payload.join;
            }
            if (e.payload.leave) {
                announce.leave = e.payload.leave;
            }
            if (e.payload.timeout) {
                announce.timeout = e.payload.timeout;
            }
            this.listenerManager.announcePresence(announce);
        }
        else if (e.messageType === 1) {
            var announce = {};
            announce.channel = null;
            announce.subscription = null;
            announce.channel = channel;
            announce.subscription = subscriptionMatch;
            announce.timetoken = publishMetaData.publishTimetoken;
            announce.publisher = e.issuingClientId;
            if (e.userMetadata) {
                announce.userMetadata = e.userMetadata;
            }
            announce.message = e.payload;
            this.listenerManager.announceSignal(announce);
        }
        else if (e.messageType === 2) {
            var announce = {};
            announce.channel = null;
            announce.subscription = null;
            announce.channel = channel;
            announce.subscription = subscriptionMatch;
            announce.timetoken = publishMetaData.publishTimetoken;
            announce.publisher = e.issuingClientId;
            if (e.userMetadata) {
                announce.userMetadata = e.userMetadata;
            }
            announce.message = {
                event: e.payload.event,
                type: e.payload.type,
                data: e.payload.data,
            };
            this.listenerManager.announceObjects(announce);
            if (e.payload.type === 'uuid') {
                var eventData = this._renameChannelField(announce);
                this.listenerManager.announceUser(__assign(__assign({}, eventData), { message: __assign(__assign({}, eventData.message), { event: this._renameEvent(eventData.message.event), type: 'user' }) }));
            }
            else if (message.payload.type === 'channel') {
                var eventData = this._renameChannelField(announce);
                this.listenerManager.announceSpace(__assign(__assign({}, eventData), { message: __assign(__assign({}, eventData.message), { event: this._renameEvent(eventData.message.event), type: 'space' }) }));
            }
            else if (message.payload.type === 'membership') {
                var eventData = this._renameChannelField(announce);
                var _a = eventData.message.data, user = _a.uuid, space = _a.channel, membershipData = __rest(_a, ["uuid", "channel"]);
                membershipData.user = user;
                membershipData.space = space;
                this.listenerManager.announceMembership(__assign(__assign({}, eventData), { message: __assign(__assign({}, eventData.message), { event: this._renameEvent(eventData.message.event), data: membershipData }) }));
            }
        }
        else if (e.messageType === 3) {
            var announce = {};
            announce.channel = channel;
            announce.subscription = subscriptionMatch;
            announce.timetoken = publishMetaData.publishTimetoken;
            announce.publisher = e.issuingClientId;
            announce.data = {
                messageTimetoken: e.payload.data.messageTimetoken,
                actionTimetoken: e.payload.data.actionTimetoken,
                type: e.payload.data.type,
                uuid: e.issuingClientId,
                value: e.payload.data.value,
            };
            announce.event = e.payload.event;
            this.listenerManager.announceMessageAction(announce);
        }
        else if (e.messageType === 4) {
            var announce = {};
            announce.channel = channel;
            announce.subscription = subscriptionMatch;
            announce.timetoken = publishMetaData.publishTimetoken;
            announce.publisher = e.issuingClientId;
            var msgPayload = e.payload;
            if (this.modules.cryptoModule) {
                var decryptedPayload = void 0;
                try {
                    var decryptedData = this.modules.cryptoModule.decrypt(e.payload);
                    decryptedPayload =
                        decryptedData instanceof ArrayBuffer ? JSON.parse(this._decoder.decode(decryptedData)) : decryptedData;
                }
                catch (e) {
                    decryptedPayload = null;
                    announce.error = "Error while decrypting message content: ".concat(e.message);
                }
                if (decryptedPayload !== null) {
                    msgPayload = decryptedPayload;
                }
            }
            if (e.userMetadata) {
                announce.userMetadata = e.userMetadata;
            }
            announce.message = msgPayload.message;
            announce.file = {
                id: msgPayload.file.id,
                name: msgPayload.file.name,
                url: this.getFileUrl({
                    id: msgPayload.file.id,
                    name: msgPayload.file.name,
                    channel: channel,
                }),
            };
            this.listenerManager.announceFile(announce);
        }
        else {
            var announce = {};
            announce.channel = null;
            announce.subscription = null;
            announce.channel = channel;
            announce.subscription = subscriptionMatch;
            announce.timetoken = publishMetaData.publishTimetoken;
            announce.publisher = e.issuingClientId;
            if (e.userMetadata) {
                announce.userMetadata = e.userMetadata;
            }
            if (this.modules.cryptoModule) {
                var decryptedPayload = void 0;
                try {
                    var decryptedData = this.modules.cryptoModule.decrypt(e.payload);
                    decryptedPayload =
                        decryptedData instanceof ArrayBuffer ? JSON.parse(this._decoder.decode(decryptedData)) : decryptedData;
                }
                catch (e) {
                    decryptedPayload = null;
                    announce.error = "Error while decrypting message content: ".concat(e.message);
                }
                if (decryptedPayload != null) {
                    announce.message = decryptedPayload;
                }
                else {
                    announce.message = e.payload;
                }
            }
            else {
                announce.message = e.payload;
            }
            this.listenerManager.announceMessage(announce);
        }
    };
    EventEmitter.prototype.emitStatus = function (s) {
    };
    EventEmitter.prototype._renameEvent = function (e) {
        return e === 'set' ? 'updated' : 'removed';
    };
    EventEmitter.prototype._renameChannelField = function (announce) {
        var channel = announce.channel, eventData = __rest(announce, ["channel"]);
        eventData.spaceId = channel;
        return eventData;
    };
    return EventEmitter;
}());
exports.default = EventEmitter;
