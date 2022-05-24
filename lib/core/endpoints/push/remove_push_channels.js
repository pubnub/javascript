"use strict";
/*       */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.prepareParams = exports.isAuthSupported = exports.getRequestTimeout = exports.getURL = exports.validateParams = exports.getOperation = void 0;
var operations_1 = __importDefault(require("../../constants/operations"));
function getOperation() {
    return operations_1.default.PNPushNotificationEnabledChannelsOperation;
}
exports.getOperation = getOperation;
function validateParams(modules, incomingParams) {
    var device = incomingParams.device, pushGateway = incomingParams.pushGateway, channels = incomingParams.channels, topic = incomingParams.topic;
    var config = modules.config;
    if (!device)
        return 'Missing Device ID (device)';
    if (!pushGateway)
        return 'Missing GW Type (pushGateway: gcm, apns or apns2)';
    if (pushGateway === 'apns2' && !topic)
        return 'Missing APNS2 topic';
    if (!channels || channels.length === 0)
        return 'Missing Channels';
    if (!config.subscribeKey)
        return 'Missing Subscribe Key';
}
exports.validateParams = validateParams;
function getURL(modules, incomingParams) {
    var device = incomingParams.device, pushGateway = incomingParams.pushGateway;
    var config = modules.config;
    if (pushGateway === 'apns2') {
        return "/v2/push/sub-key/".concat(config.subscribeKey, "/devices-apns2/").concat(device);
    }
    return "/v1/push/sub-key/".concat(config.subscribeKey, "/devices/").concat(device);
}
exports.getURL = getURL;
function getRequestTimeout(_a) {
    var config = _a.config;
    return config.getTransactionTimeout();
}
exports.getRequestTimeout = getRequestTimeout;
function isAuthSupported() {
    return true;
}
exports.isAuthSupported = isAuthSupported;
function prepareParams(modules, incomingParams) {
    var pushGateway = incomingParams.pushGateway, _a = incomingParams.channels, channels = _a === void 0 ? [] : _a, _b = incomingParams.environment, environment = _b === void 0 ? 'development' : _b, topic = incomingParams.topic;
    var parameters = { type: pushGateway, remove: channels.join(',') };
    if (pushGateway === 'apns2') {
        parameters = __assign(__assign({}, parameters), { environment: environment, topic: topic });
        delete parameters.type;
    }
    return parameters;
}
exports.prepareParams = prepareParams;
function handleResponse() {
    return {};
}
exports.handleResponse = handleResponse;
