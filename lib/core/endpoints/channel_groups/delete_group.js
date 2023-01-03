"use strict";
/*       */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.prepareParams = exports.getRequestTimeout = exports.isAuthSupported = exports.getURL = exports.validateParams = exports.getOperation = void 0;
var operations_1 = __importDefault(require("../../constants/operations"));
var utils_1 = __importDefault(require("../../utils"));
function getOperation() {
    return operations_1.default.PNRemoveGroupOperation;
}
exports.getOperation = getOperation;
function validateParams(modules, incomingParams) {
    var channelGroup = incomingParams.channelGroup;
    var config = modules.config;
    if (!channelGroup)
        return 'Missing Channel Group';
    if (!config.subscribeKey)
        return 'Missing Subscribe Key';
}
exports.validateParams = validateParams;
function getURL(modules, incomingParams) {
    var channelGroup = incomingParams.channelGroup;
    var config = modules.config;
    return "/v1/channel-registration/sub-key/".concat(config.subscribeKey, "/channel-group/").concat(utils_1.default.encodeString(channelGroup), "/remove");
}
exports.getURL = getURL;
function isAuthSupported() {
    return true;
}
exports.isAuthSupported = isAuthSupported;
function getRequestTimeout(_a) {
    var config = _a.config;
    return config.getTransactionTimeout();
}
exports.getRequestTimeout = getRequestTimeout;
function prepareParams() {
    return {};
}
exports.prepareParams = prepareParams;
function handleResponse() {
    return {};
}
exports.handleResponse = handleResponse;
