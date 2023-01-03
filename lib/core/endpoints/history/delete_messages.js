"use strict";
/*       */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.prepareParams = exports.isAuthSupported = exports.getRequestTimeout = exports.getURL = exports.useDelete = exports.validateParams = exports.getOperation = void 0;
var operations_1 = __importDefault(require("../../constants/operations"));
var utils_1 = __importDefault(require("../../utils"));
function getOperation() {
    return operations_1.default.PNDeleteMessagesOperation;
}
exports.getOperation = getOperation;
function validateParams(modules, incomingParams) {
    var channel = incomingParams.channel;
    var config = modules.config;
    if (!channel)
        return 'Missing channel';
    if (!config.subscribeKey)
        return 'Missing Subscribe Key';
}
exports.validateParams = validateParams;
function useDelete() {
    return true;
}
exports.useDelete = useDelete;
function getURL(modules, incomingParams) {
    var channel = incomingParams.channel;
    var config = modules.config;
    return "/v3/history/sub-key/".concat(config.subscribeKey, "/channel/").concat(utils_1.default.encodeString(channel));
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
    var start = incomingParams.start, end = incomingParams.end;
    var outgoingParams = {};
    if (start)
        outgoingParams.start = start;
    if (end)
        outgoingParams.end = end;
    return outgoingParams;
}
exports.prepareParams = prepareParams;
function handleResponse(modules, serverResponse) {
    return serverResponse.payload;
}
exports.handleResponse = handleResponse;
