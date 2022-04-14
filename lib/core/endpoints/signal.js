"use strict";
/*       */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.prepareParams = exports.isAuthSupported = exports.getRequestTimeout = exports.getURL = exports.validateParams = exports.getOperation = void 0;
var operations_1 = require("../constants/operations");
var utils_1 = require("../utils");
function prepareMessagePayload(modules, messagePayload) {
    var stringifiedPayload = JSON.stringify(messagePayload);
    return stringifiedPayload;
}
function getOperation() {
    return operations_1.default.PNSignalOperation;
}
exports.getOperation = getOperation;
function validateParams(_a, incomingParams) {
    var config = _a.config;
    var message = incomingParams.message, channel = incomingParams.channel;
    if (!channel)
        return 'Missing Channel';
    if (!message)
        return 'Missing Message';
    if (!config.subscribeKey)
        return 'Missing Subscribe Key';
}
exports.validateParams = validateParams;
function getURL(modules, incomingParams) {
    var config = modules.config;
    var channel = incomingParams.channel, message = incomingParams.message;
    var stringifiedPayload = prepareMessagePayload(modules, message);
    return "/signal/".concat(config.publishKey, "/").concat(config.subscribeKey, "/0/").concat(utils_1.default.encodeString(channel), "/0/").concat(utils_1.default.encodeString(stringifiedPayload));
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
function prepareParams() {
    var params = {};
    return params;
}
exports.prepareParams = prepareParams;
function handleResponse(modules, serverResponse) {
    return { timetoken: serverResponse[2] };
}
exports.handleResponse = handleResponse;
