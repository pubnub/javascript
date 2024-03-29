"use strict";
/**
 * PubNub Push Notifications API module.
 */
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var remove_push_channels_1 = require("./endpoints/push/remove_push_channels");
var list_push_channels_1 = require("./endpoints/push/list_push_channels");
var add_push_channels_1 = require("./endpoints/push/add_push_channels");
var remove_device_1 = require("./endpoints/push/remove_device");
var PubNubPushNotifications = /** @class */ (function () {
    function PubNubPushNotifications(keySet, 
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    sendRequest) {
        this.keySet = keySet;
        this.sendRequest = sendRequest;
    }
    /**
     * Fetch device's push notification enabled channels.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get device channels response or `void` in case if `callback` provided.
     */
    PubNubPushNotifications.prototype.listChannels = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new list_push_channels_1.ListDevicePushNotificationChannelsRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Enable push notifications on channels for device.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     */
    PubNubPushNotifications.prototype.addChannels = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new add_push_channels_1.AddDevicePushNotificationChannelsRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Disable push notifications on channels for device.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     */
    PubNubPushNotifications.prototype.removeChannels = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new remove_push_channels_1.RemoveDevicePushNotificationChannelsRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    /**
     * Disable push notifications for device.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     */
    PubNubPushNotifications.prototype.deleteDevice = function (parameters, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new remove_device_1.RemoveDevicePushNotificationRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                if (callback)
                    return [2 /*return*/, this.sendRequest(request, callback)];
                return [2 /*return*/, this.sendRequest(request)];
            });
        });
    };
    return PubNubPushNotifications;
}());
exports.default = PubNubPushNotifications;
