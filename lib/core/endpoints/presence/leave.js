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
    return operations_1.default.PNUnsubscribeOperation;
}
exports.getOperation = getOperation;
function validateParams(modules) {
    var config = modules.config;
    if (!config.subscribeKey)
        return 'Missing Subscribe Key';
}
exports.validateParams = validateParams;
function getURL(modules, incomingParams) {
    var config = modules.config;
    var _a = incomingParams.channels, channels = _a === void 0 ? [] : _a;
    var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
    return "/v2/presence/sub-key/".concat(config.subscribeKey, "/channel/").concat(utils_1.default.encodeString(stringifiedChannels), "/leave");
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
    var _a = incomingParams.channelGroups, channelGroups = _a === void 0 ? [] : _a;
    var params = {};
    if (channelGroups.length > 0) {
        params['channel-group'] = channelGroups.join(',');
    }
    return params;
}
exports.prepareParams = prepareParams;
function handleResponse() {
    return {};
}
exports.handleResponse = handleResponse;
