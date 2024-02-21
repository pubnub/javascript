"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var SubscribeCapable_1 = require("./SubscribeCapable");
var SubscriptionSet = /** @class */ (function (_super) {
    __extends(SubscriptionSet, _super);
    function SubscriptionSet(_a) {
        var _b = _a.channels, channels = _b === void 0 ? [] : _b, _c = _a.channelGroups, channelGroups = _c === void 0 ? [] : _c, subscriptionOptions = _a.subscriptionOptions, eventEmitter = _a.eventEmitter, pubnub = _a.pubnub;
        var _this = _super.call(this) || this;
        _this.channelNames = [];
        _this.groupNames = [];
        _this.subscriptionList = [];
        _this.options = subscriptionOptions;
        _this.eventEmitter = eventEmitter;
        _this.pubnub = pubnub;
        channels.forEach(function (c) {
            var subscription = _this.pubnub.channel(c).subscription(_this.options);
            _this.channelNames = __spreadArray(__spreadArray([], __read(_this.channelNames), false), __read(subscription.channels), false);
            _this.subscriptionList.push(subscription);
        });
        channelGroups.forEach(function (cg) {
            var subscription = _this.pubnub.channelGroup(cg).subscription(_this.options);
            _this.groupNames = __spreadArray(__spreadArray([], __read(_this.groupNames), false), __read(subscription.channelGroups), false);
            _this.subscriptionList.push(subscription);
        });
        _this.listener = {};
        eventEmitter.addListener(_this.listener, _this.channelNames.filter(function (c) { return !c.endsWith('-pnpres'); }), _this.groupNames.filter(function (cg) { return !cg.endsWith('-pnpres'); }));
        return _this;
    }
    SubscriptionSet.prototype.addSubscription = function (subscription) {
        this.subscriptionList.push(subscription);
        this.channelNames = __spreadArray(__spreadArray([], __read(this.channelNames), false), __read(subscription.channels), false);
        this.groupNames = __spreadArray(__spreadArray([], __read(this.groupNames), false), __read(subscription.channelGroups), false);
    };
    SubscriptionSet.prototype.removeSubscription = function (subscription) {
        var channelsToRemove = subscription.channels;
        var groupsToRemove = subscription.channelGroups;
        this.channelNames = this.channelNames.filter(function (c) { return !channelsToRemove.includes(c); });
        this.groupNames = this.groupNames.filter(function (cg) { return !groupsToRemove.includes(cg); });
        this.subscriptionList = this.subscriptionList.filter(function (s) { return s !== subscription; });
    };
    SubscriptionSet.prototype.addSubscriptionSet = function (subscriptionSet) {
        this.subscriptionList = __spreadArray(__spreadArray([], __read(this.subscriptionList), false), __read(subscriptionSet.subscriptions), false);
        this.channelNames = __spreadArray(__spreadArray([], __read(this.channelNames), false), __read(subscriptionSet.channels), false);
        this.groupNames = __spreadArray(__spreadArray([], __read(this.groupNames), false), __read(subscriptionSet.channelGroups), false);
    };
    SubscriptionSet.prototype.removeSubscriptionSet = function (subscriptionSet) {
        var channelsToRemove = subscriptionSet.channels;
        var groupsToRemove = subscriptionSet.channelGroups;
        this.channelNames = this.channelNames.filter(function (c) { return !channelsToRemove.includes(c); });
        this.groupNames = this.groupNames.filter(function (cg) { return !groupsToRemove.includes(cg); });
        this.subscriptionList = this.subscriptionList.filter(function (s) { return !subscriptionSet.subscriptions.includes(s); });
    };
    Object.defineProperty(SubscriptionSet.prototype, "subscriptions", {
        get: function () {
            return this.subscriptionList.slice(0);
        },
        enumerable: false,
        configurable: true
    });
    return SubscriptionSet;
}(SubscribeCapable_1.SubscribeCapable));
exports.SubscriptionSet = SubscriptionSet;
