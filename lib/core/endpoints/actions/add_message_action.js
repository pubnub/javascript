"use strict";
/*       */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.postPayload = exports.prepareParams = exports.isAuthSupported = exports.getRequestHeaders = exports.getRequestTimeout = exports.postURL = exports.usePost = exports.validateParams = exports.getOperation = void 0;
var operations_1 = __importDefault(require("../../constants/operations"));
var utils_1 = __importDefault(require("../../utils"));
function getOperation() {
    return operations_1.default.PNAddMessageActionOperation;
}
exports.getOperation = getOperation;
function validateParams(_a, incomingParams) {
    var config = _a.config;
    var action = incomingParams.action, channel = incomingParams.channel, messageTimetoken = incomingParams.messageTimetoken;
    if (!messageTimetoken)
        return 'Missing message timetoken';
    if (!config.subscribeKey)
        return 'Missing Subscribe Key';
    if (!channel)
        return 'Missing message channel';
    if (!action)
        return 'Missing Action';
    if (!action.value)
        return 'Missing Action.value';
    if (!action.type)
        return 'Missing Action.type';
    if (action.type.length > 15)
        return 'Action.type value exceed maximum length of 15';
}
exports.validateParams = validateParams;
function usePost() {
    return true;
}
exports.usePost = usePost;
function postURL(_a, incomingParams) {
    var config = _a.config;
    var channel = incomingParams.channel, messageTimetoken = incomingParams.messageTimetoken;
    return "/v1/message-actions/".concat(config.subscribeKey, "/channel/").concat(utils_1.default.encodeString(channel), "/message/").concat(messageTimetoken);
}
exports.postURL = postURL;
function getRequestTimeout(_a) {
    var config = _a.config;
    return config.getTransactionTimeout();
}
exports.getRequestTimeout = getRequestTimeout;
function getRequestHeaders() {
    return { 'Content-Type': 'application/json' };
}
exports.getRequestHeaders = getRequestHeaders;
function isAuthSupported() {
    return true;
}
exports.isAuthSupported = isAuthSupported;
function prepareParams() {
    return {};
}
exports.prepareParams = prepareParams;
function postPayload(modules, incomingParams) {
    return incomingParams.action;
}
exports.postPayload = postPayload;
function handleResponse(modules, addMessageActionResponse) {
    return { data: addMessageActionResponse.data };
}
exports.handleResponse = handleResponse;
