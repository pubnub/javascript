"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const remove_push_channels_1 = require("./endpoints/push/remove_push_channels");
const list_push_channels_1 = require("./endpoints/push/list_push_channels");
const add_push_channels_1 = require("./endpoints/push/add_push_channels");
const remove_device_1 = require("./endpoints/push/remove_device");
/**
 * PubNub Push Notifications API interface.
 */
class PubNubPushNotifications {
    /**
     * Create mobile push notifications API access object.
     *
     * @param logger - Registered loggers' manager.
     * @param keySet - PubNub account keys set which should be used for REST API calls.
     * @param sendRequest - Function which should be used to send REST API calls.
     *
     * @internal
     */
    constructor(logger, keySet, 
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    sendRequest) {
        this.sendRequest = sendRequest;
        this.logger = logger;
        this.keySet = keySet;
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
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: `List push-enabled channels with parameters:`,
            }));
            const request = new list_push_channels_1.ListDevicePushNotificationChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            const logResponse = (response) => {
                if (!response)
                    return;
                this.logger.debug('PubNub', `List push-enabled channels success. Received ${response.channels.length} channels.`);
            };
            if (callback)
                return this.sendRequest(request, (status, response) => {
                    logResponse(response);
                    callback(status, response);
                });
            return this.sendRequest(request).then((response) => {
                logResponse(response);
                return response;
            });
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
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: `Add push-enabled channels with parameters:`,
            }));
            const request = new add_push_channels_1.AddDevicePushNotificationChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            const logResponse = () => {
                this.logger.debug('PubNub', `Add push-enabled channels success.`);
            };
            if (callback)
                return this.sendRequest(request, (status) => {
                    if (!status.error)
                        logResponse();
                    callback(status);
                });
            return this.sendRequest(request).then((response) => {
                logResponse();
                return response;
            });
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
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: `Remove push-enabled channels with parameters:`,
            }));
            const request = new remove_push_channels_1.RemoveDevicePushNotificationChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            const logResponse = () => {
                this.logger.debug('PubNub', `Remove push-enabled channels success.`);
            };
            if (callback)
                return this.sendRequest(request, (status) => {
                    if (!status.error)
                        logResponse();
                    callback(status);
                });
            return this.sendRequest(request).then((response) => {
                logResponse();
                return response;
            });
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
            this.logger.debug('PubNub', () => ({
                messageType: 'object',
                message: Object.assign({}, parameters),
                details: `Remove push notifications for device with parameters:`,
            }));
            const request = new remove_device_1.RemoveDevicePushNotificationRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
            const logResponse = () => {
                this.logger.debug('PubNub', `Remove push notifications for device success.`);
            };
            if (callback)
                return this.sendRequest(request, (status) => {
                    if (!status.error)
                        logResponse();
                    callback(status);
                });
            return this.sendRequest(request).then((response) => {
                logResponse();
                return response;
            });
        });
    }
}
exports.default = PubNubPushNotifications;
