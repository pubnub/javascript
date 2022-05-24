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
    return operations_1.default.PNGetMessageActionsOperation;
}
exports.getOperation = getOperation;
function validateParams(_a, incomingParams) {
    var config = _a.config;
    var channel = incomingParams.channel;
    if (!config.subscribeKey)
        return 'Missing Subscribe Key';
    if (!channel)
        return 'Missing message channel';
}
exports.validateParams = validateParams;
function getURL(_a, incomingParams) {
    var config = _a.config;
    var channel = incomingParams.channel;
    return "/v1/message-actions/".concat(config.subscribeKey, "/channel/").concat(utils_1.default.encodeString(channel));
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
    var limit = incomingParams.limit, start = incomingParams.start, end = incomingParams.end;
    var outgoingParams = {};
    if (limit)
        outgoingParams.limit = limit;
    if (start)
        outgoingParams.start = start;
    if (end)
        outgoingParams.end = end;
    return outgoingParams;
}
exports.prepareParams = prepareParams;
function handleResponse(modules, getMessageActionsResponse) {
    /** @type GetMessageActionsResponse */
    var response = { data: getMessageActionsResponse.data, start: null, end: null };
    if (response.data.length) {
        response.end = response.data[response.data.length - 1].actionTimetoken;
        response.start = response.data[0].actionTimetoken;
    }
    return response;
}
exports.handleResponse = handleResponse;
