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
var SubscribeCapable_1 = require("./SubscribeCapable");
var Subscription = /** @class */ (function (_super) {
    __extends(Subscription, _super);
    function Subscription(_a) {
        var channels = _a.channels, channelGroups = _a.channelGroups, subscriptionOptions = _a.subscriptionOptions, eventEmitter = _a.eventEmitter, pubnub = _a.pubnub;
        var _this = _super.call(this) || this;
        _this.channelNames = [];
        _this.groupNames = [];
        _this.channelNames = channels;
        _this.groupNames = channelGroups;
        _this.options = subscriptionOptions;
        _this.pubnub = pubnub;
        _this.eventEmitter = eventEmitter;
        _this.listener = {};
        eventEmitter.addListener(_this.listener, _this.channelNames.filter(function (c) { return !c.endsWith('-pnpres'); }), _this.groupNames.filter(function (cg) { return !cg.endsWith('-pnpres'); }));
        return _this;
    }
    Subscription.prototype.addSubscription = function (subscription) {
        return new SubscriptionSet_1.SubscriptionSet({
            channels: __spreadArray(__spreadArray([], __read(this.channelNames), false), __read(subscription.channels), false),
            channelGroups: __spreadArray(__spreadArray([], __read(this.groupNames), false), __read(subscription.channelGroups), false),
            subscriptionOptions: __assign(__assign({}, this.options), subscription === null || subscription === void 0 ? void 0 : subscription.options),
            eventEmitter: this.eventEmitter,
            pubnub: this.pubnub,
        });
    };
    return Subscription;
}(SubscribeCapable_1.SubscribeCapable));
exports.Subscription = Subscription;
