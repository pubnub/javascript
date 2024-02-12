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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
var SubscriptionSet_1 = require("./SubscriptionSet");
var Subscription = /** @class */ (function () {
    function Subscription(_a) {
        var channels = _a.channels, channelGroups = _a.channelGroups, subscriptionOptions = _a.subscriptionOptions, eventEmitter = _a.eventEmitter, pubnub = _a.pubnub;
        this.channelNames = [];
        this.groupNames = [];
        this.channelNames = channels;
        this.groupNames = channelGroups;
        this.options = subscriptionOptions;
        this.pubnub = pubnub;
        this.eventEmitter = eventEmitter;
    }
    Subscription.prototype.subscribe = function () {
        var _a, _b;
        this.pubnub.subscribe(__assign({ channels: this.channelNames, channelGroups: this.groupNames }, (((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.cursor) === null || _b === void 0 ? void 0 : _b.timetoken) && { timetoken: this.options.cursor.timetoken })));
    };
    Subscription.prototype.unsubscribe = function () {
        this.pubnub.unsubscribe({
            channels: this.channelNames.filter(function (c) { return !c.endsWith('-pnpres'); }),
            channelGroups: this.groupNames.filter(function (cg) { return !cg.endsWith('-pnpres'); }),
        });
    };
    Subscription.prototype.addListener = function (listener) {
        this.eventEmitter.addListener(listener, this.channelNames.filter(function (c) { return !c.endsWith('-pnpres'); }), this.groupNames.filter(function (cg) { return !cg.endsWith('-pnpres'); }));
    };
    Subscription.prototype.removeListener = function (listener) {
        this.eventEmitter.removeListener(listener, this.channelNames, this.groupNames);
    };
    Subscription.prototype.addSubscription = function (subscription) {
        return new SubscriptionSet_1.SubscriptionSet({
            channels: __spreadArray(__spreadArray([], __read(this.channelNames), false), __read(subscription.channels), false),
            channelGroups: __spreadArray(__spreadArray([], __read(this.groupNames), false), __read(subscription.channelGroups), false),
            subscriptionOptions: __assign(__assign({}, this.options), subscription === null || subscription === void 0 ? void 0 : subscription.options),
            eventEmitter: this.eventEmitter,
            pubnub: this.pubnub,
        });
    };
    Object.defineProperty(Subscription.prototype, "channels", {
        get: function () {
            return this.channelNames.slice(0);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Subscription.prototype, "channelGroups", {
        get: function () {
            return this.groupNames.slice(0);
        },
        enumerable: false,
        configurable: true
    });
    return Subscription;
}());
exports.Subscription = Subscription;
