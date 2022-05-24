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
    return operations_1.default.PNSetStateOperation;
}
exports.getOperation = getOperation;
function validateParams(modules, incomingParams) {
    var config = modules.config;
    var state = incomingParams.state, _a = incomingParams.channels, channels = _a === void 0 ? [] : _a, _b = incomingParams.channelGroups, channelGroups = _b === void 0 ? [] : _b;
    if (!state)
        return 'Missing State';
    if (!config.subscribeKey)
        return 'Missing Subscribe Key';
    if (channels.length === 0 && channelGroups.length === 0) {
        return 'Please provide a list of channels and/or channel-groups';
    }
}
exports.validateParams = validateParams;
function getURL(modules, incomingParams) {
    var config = modules.config;
    var _a = incomingParams.channels, channels = _a === void 0 ? [] : _a;
    var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
    return "/v2/presence/sub-key/".concat(config.subscribeKey, "/channel/").concat(utils_1.default.encodeString(stringifiedChannels), "/uuid/").concat(utils_1.default.encodeString(config.UUID), "/data");
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
    var state = incomingParams.state, _a = incomingParams.channelGroups, channelGroups = _a === void 0 ? [] : _a;
    var params = {};
    params.state = JSON.stringify(state);
    if (channelGroups.length > 0) {
        params['channel-group'] = channelGroups.join(',');
    }
    return params;
}
exports.prepareParams = prepareParams;
function handleResponse(modules, serverResponse) {
    return { state: serverResponse.payload };
}
exports.handleResponse = handleResponse;
