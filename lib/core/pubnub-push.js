/**
 * PubNub Push Notifications API module.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { RemoveDevicePushNotificationChannelsRequest } from './endpoints/push/remove_push_channels';
import { ListDevicePushNotificationChannelsRequest } from './endpoints/push/list_push_channels';
import { AddDevicePushNotificationChannelsRequest } from './endpoints/push/add_push_channels';
import { RemoveDevicePushNotificationRequest } from './endpoints/push/remove_device';
export default class PubNubPushNotifications {
    constructor(keySet, 
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
    listChannels(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new ListDevicePushNotificationChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Enable push notifications on channels for device.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     */
    addChannels(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new AddDevicePushNotificationChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Disable push notifications on channels for device.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     */
    removeChannels(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new RemoveDevicePushNotificationChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
    /**
     * Disable push notifications for device.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     */
    deleteDevice(parameters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new RemoveDevicePushNotificationRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            if (callback)
                return this.sendRequest(request, callback);
            return this.sendRequest(request);
        });
    }
}
