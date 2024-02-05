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
exports.SubscriptionSet = void 0;
var Subscription_1 = require("./Subscription");
var SubscriptionSet = /** @class */ (function () {
    function SubscriptionSet(_a) {
        var _b = _a.channels, channels = _b === void 0 ? [] : _b, _c = _a.channelGroups, channelGroups = _c === void 0 ? [] : _c, subscriptionOptions = _a.subscriptionOptions, eventEmitter = _a.eventEmitter, pubnub = _a.pubnub;
        this.channelNames = [];
        this.groupNames = [];
        this.channelNames = __spreadArray(__spreadArray([], __read(this.channelNames), false), __read(channels), false);
        this.groupNames = __spreadArray(__spreadArray([], __read(this.groupNames), false), __read(channelGroups), false);
        this.options = subscriptionOptions;
        this.eventEmitter = eventEmitter;
        this.pubnub = pubnub;
        this._subscriptions = [
            new Subscription_1.Subscription({
                channels: this.channelNames,
                channelGroups: this.groupNames,
                subscriptionOptions: this.options,
                eventEmitter: this.eventEmitter,
                pubnub: this.pubnub,
            }),
        ];
    }
    SubscriptionSet.prototype.subscribe = function () {
        var _a, _b;
        this.pubnub.subscribe(__assign({ channels: this.channelNames, channelGroups: this.groupNames }, (((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.cursor) === null || _b === void 0 ? void 0 : _b.timetoken) && { timetoken: this.options.cursor.timetoken })));
    };
    SubscriptionSet.prototype.unsubscribe = function () {
        this.pubnub.unsubscribe({ channels: this.channelNames, channelGroups: this.groupNames });
    };
    SubscriptionSet.prototype.addListener = function (listener) {
        this.eventEmitter.addListener(listener, this.channelNames.filter(function (c) { return !c.endsWith('-pnpres'); }), this.groupNames.filter(function (cg) { return !cg.endsWith('-pnpres'); }));
    };
    SubscriptionSet.prototype.removeListener = function (listener) {
        this.eventEmitter.removeListener(listener, this.channelNames, this.groupNames);
    };
    SubscriptionSet.prototype.addSubscription = function (subscription) {
        this._subscriptions.push(subscription);
        this.channelNames = __spreadArray(__spreadArray([], __read(this.channelNames), false), __read(subscription.channels), false);
        this.groupNames = __spreadArray(__spreadArray([], __read(this.groupNames), false), __read(subscription.channelGroups), false);
    };
    SubscriptionSet.prototype.removeSubscription = function (subscription) {
        var channelsToRemove = subscription.channels;
        var groupsToRemove = subscription.channelGroups;
        this.channelNames = this.channelNames.filter(function (c) { return !channelsToRemove.includes(c); });
        this.groupNames = this.groupNames.filter(function (cg) { return !groupsToRemove.includes(cg); });
        this._subscriptions = this._subscriptions.filter(function (s) { return s !== subscription; });
    };
    SubscriptionSet.prototype.addSubscriptionSet = function (subscriptionSet) {
        this._subscriptions = __spreadArray(__spreadArray([], __read(this._subscriptions), false), __read(subscriptionSet.subscriptions), false);
        this.channelNames = __spreadArray(__spreadArray([], __read(this.channelNames), false), __read(subscriptionSet.channels), false);
        this.groupNames = __spreadArray(__spreadArray([], __read(this.groupNames), false), __read(subscriptionSet.channelGroups), false);
    };
    SubscriptionSet.prototype.removeSubscriptionSet = function (subscriptionSet) {
        var channelsToRemove = subscriptionSet.channels;
        var groupsToRemove = subscriptionSet.channelGroups;
        this.channelNames = this.channelNames.filter(function (c) { return !channelsToRemove.includes(c); });
        this.groupNames = this.groupNames.filter(function (cg) { return !groupsToRemove.includes(cg); });
        this._subscriptions = this._subscriptions.filter(function (s) { return !subscriptionSet.subscriptions.includes(s); });
    };
    Object.defineProperty(SubscriptionSet.prototype, "channels", {
        get: function () {
            return this.channelNames.slice(0);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SubscriptionSet.prototype, "channelGroups", {
        get: function () {
            return this.groupNames.slice(0);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SubscriptionSet.prototype, "subscriptions", {
        get: function () {
            return this._subscriptions.slice(0);
        },
        enumerable: false,
        configurable: true
    });
    return SubscriptionSet;
}());
exports.SubscriptionSet = SubscriptionSet;
