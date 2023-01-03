"use strict";
/*       */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.prepareParams = exports.isAuthSupported = exports.getRequestTimeout = exports.getURL = exports.validateParams = exports.getOperation = void 0;
var operations_1 = __importDefault(require("../../constants/operations"));
function getOperation() {
    return operations_1.default.PNAccessManagerAudit;
}
exports.getOperation = getOperation;
function validateParams(modules) {
    var config = modules.config;
    if (!config.subscribeKey)
        return 'Missing Subscribe Key';
}
exports.validateParams = validateParams;
function getURL(modules) {
    var config = modules.config;
    return "/v2/auth/audit/sub-key/".concat(config.subscribeKey);
}
exports.getURL = getURL;
function getRequestTimeout(_a) {
    var config = _a.config;
    return config.getTransactionTimeout();
}
exports.getRequestTimeout = getRequestTimeout;
function isAuthSupported() {
    return false;
}
exports.isAuthSupported = isAuthSupported;
function prepareParams(modules, incomingParams) {
    var channel = incomingParams.channel, channelGroup = incomingParams.channelGroup, _a = incomingParams.authKeys, authKeys = _a === void 0 ? [] : _a;
    var params = {};
    if (channel) {
        params.channel = channel;
    }
    if (channelGroup) {
        params['channel-group'] = channelGroup;
    }
    if (authKeys.length > 0) {
        params.auth = authKeys.join(',');
    }
    return params;
}
exports.prepareParams = prepareParams;
function handleResponse(modules, serverResponse) {
    return serverResponse.payload;
}
exports.handleResponse = handleResponse;
