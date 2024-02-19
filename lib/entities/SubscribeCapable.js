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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscribeCapable = void 0;
var SubscribeCapable = /** @class */ (function () {
    function SubscribeCapable() {
    }
    SubscribeCapable.prototype.subscribe = function () {
        var _a, _b;
        this.pubnub.subscribe(__assign({ channels: this.channelNames, channelGroups: this.groupNames }, (((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.cursor) === null || _b === void 0 ? void 0 : _b.timetoken) && { timetoken: this.options.cursor.timetoken })));
    };
    SubscribeCapable.prototype.unsubscribe = function () {
        this.pubnub.unsubscribe({
            channels: this.channelNames.filter(function (c) { return !c.endsWith('-pnpres'); }),
            channelGroups: this.groupNames.filter(function (cg) { return !cg.endsWith('-pnpres'); }),
        });
    };
    Object.defineProperty(SubscribeCapable.prototype, "onMessage", {
        set: function (onMessagelistener) {
            this.listener.message = onMessagelistener;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SubscribeCapable.prototype, "onPresence", {
        set: function (onPresencelistener) {
            this.listener.presence = onPresencelistener;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SubscribeCapable.prototype, "onSignal", {
        set: function (onSignalListener) {
            this.listener.signal = onSignalListener;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SubscribeCapable.prototype, "onObjects", {
        set: function (onObjectsListener) {
            this.listener.objects = onObjectsListener;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SubscribeCapable.prototype, "onMessageAction", {
        set: function (messageActionEventListener) {
            this.listener.messageAction = messageActionEventListener;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SubscribeCapable.prototype, "onFile", {
        set: function (fileEventListener) {
            this.listener.file = fileEventListener;
        },
        enumerable: false,
        configurable: true
    });
    SubscribeCapable.prototype.addListener = function (listener) {
        this.eventEmitter.addListener(listener, this.channelNames.filter(function (c) { return !c.endsWith('-pnpres'); }), this.groupNames.filter(function (cg) { return !cg.endsWith('-pnpres'); }));
    };
    SubscribeCapable.prototype.removeListener = function (listener) {
        this.eventEmitter.removeListener(listener, this.channelNames, this.groupNames);
    };
    Object.defineProperty(SubscribeCapable.prototype, "channels", {
        get: function () {
            return this.channelNames.slice(0);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SubscribeCapable.prototype, "channelGroups", {
        get: function () {
            return this.groupNames.slice(0);
        },
        enumerable: false,
        configurable: true
    });
    return SubscribeCapable;
}());
exports.SubscribeCapable = SubscribeCapable;
