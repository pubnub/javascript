"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const remove_push_channels_1 = require("./endpoints/push/remove_push_channels");
const list_push_channels_1 = require("./endpoints/push/list_push_channels");
const add_push_channels_1 = require("./endpoints/push/add_push_channels");
const remove_device_1 = require("./endpoints/push/remove_device");
class PubNubPushNotifications {
    constructor(keySet, sendRequest) {
        this.keySet = keySet;
        this.sendRequest = sendRequest;
    }
    listChannels(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new list_push_channels_1.ListDevicePushNotificationChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    addChannels(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new add_push_channels_1.AddDevicePushNotificationChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    removeChannels(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new remove_push_channels_1.RemoveDevicePushNotificationChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    deleteDevice(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new remove_device_1.RemoveDevicePushNotificationRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
}
exports.default = PubNubPushNotifications;
