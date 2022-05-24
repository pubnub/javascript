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
    return operations_1.default.PNRemoveMessageActionOperation;
}
exports.getOperation = getOperation;
function validateParams(_a, incomingParams) {
    var config = _a.config;
    var channel = incomingParams.channel, actionTimetoken = incomingParams.actionTimetoken, messageTimetoken = incomingParams.messageTimetoken;
    if (!messageTimetoken)
        return 'Missing message timetoken';
    if (!actionTimetoken)
        return 'Missing action timetoken';
    if (!config.subscribeKey)
        return 'Missing Subscribe Key';
    if (!channel)
        return 'Missing message channel';
}
exports.validateParams = validateParams;
function useDelete() {
    return true;
}
exports.useDelete = useDelete;
function getURL(_a, incomingParams) {
    var config = _a.config;
    var channel = incomingParams.channel, actionTimetoken = incomingParams.actionTimetoken, messageTimetoken = incomingParams.messageTimetoken;
    return "/v1/message-actions/".concat(config.subscribeKey, "/channel/").concat(utils_1.default.encodeString(channel), "/message/").concat(messageTimetoken, "/action/").concat(actionTimetoken);
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
    return {};
}
exports.prepareParams = prepareParams;
function handleResponse(modules, removeMessageActionResponse) {
    return { data: removeMessageActionResponse.data };
}
exports.handleResponse = handleResponse;
