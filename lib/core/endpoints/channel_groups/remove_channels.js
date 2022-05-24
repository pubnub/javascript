"use strict";
/*       */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.prepareParams = exports.isAuthSupported = exports.getRequestTimeout = exports.getURL = exports.validateParams = exports.getOperation = void 0;
var operations_1 = __importDefault(require("../../constants/operations"));
var utils_1 = __importDefault(require("../../utils"));
function getOperation() {
    return operations_1.default.PNRemoveChannelsFromGroupOperation;
}
exports.getOperation = getOperation;
function validateParams(modules, incomingParams) {
    var channels = incomingParams.channels, channelGroup = incomingParams.channelGroup;
    var config = modules.config;
    if (!channelGroup)
        return 'Missing Channel Group';
    if (!channels || channels.length === 0)
        return 'Missing Channels';
    if (!config.subscribeKey)
        return 'Missing Subscribe Key';
}
exports.validateParams = validateParams;
function getURL(modules, incomingParams) {
    var channelGroup = incomingParams.channelGroup;
    var config = modules.config;
    return "/v1/channel-registration/sub-key/".concat(config.subscribeKey, "/channel-group/").concat(utils_1.default.encodeString(channelGroup));
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
    var _a = incomingParams.channels, channels = _a === void 0 ? [] : _a;
    return {
        remove: channels.join(','),
    };
}
exports.prepareParams = prepareParams;
function handleResponse() {
    return {};
}
exports.handleResponse = handleResponse;
