"use strict";
/*       */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.prepareParams = exports.isAuthSupported = exports.getRequestTimeout = exports.getURL = exports.validateParams = exports.getOperation = void 0;
var operations_1 = __importDefault(require("../../constants/operations"));
var utils_1 = __importDefault(require("../../utils"));
function __processMessage(modules, message) {
    var config = modules.config, crypto = modules.crypto;
    if (!config.cipherKey)
        return message;
    try {
        return crypto.decrypt(message);
    }
    catch (e) {
        return message;
    }
}
function getOperation() {
    return operations_1.default.PNHistoryOperation;
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
function getURL(modules, incomingParams) {
    var channel = incomingParams.channel;
    var config = modules.config;
    return "/v2/history/sub-key/".concat(config.subscribeKey, "/channel/").concat(utils_1.default.encodeString(channel));
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
    var start = incomingParams.start, end = incomingParams.end, reverse = incomingParams.reverse, _a = incomingParams.count, count = _a === void 0 ? 100 : _a, _b = incomingParams.stringifiedTimeToken, stringifiedTimeToken = _b === void 0 ? false : _b, _c = incomingParams.includeMeta, includeMeta = _c === void 0 ? false : _c;
    var outgoingParams = {
        include_token: 'true',
    };
    outgoingParams.count = count;
    if (start)
        outgoingParams.start = start;
    if (end)
        outgoingParams.end = end;
    if (stringifiedTimeToken)
        outgoingParams.string_message_token = 'true';
    if (reverse != null)
        outgoingParams.reverse = reverse.toString();
    if (includeMeta)
        outgoingParams.include_meta = 'true';
    return outgoingParams;
}
exports.prepareParams = prepareParams;
function handleResponse(modules, serverResponse) {
    var response = {
        messages: [],
        startTimeToken: serverResponse[1],
        endTimeToken: serverResponse[2],
    };
    if (Array.isArray(serverResponse[0])) {
        serverResponse[0].forEach(function (serverHistoryItem) {
            var item = {
                timetoken: serverHistoryItem.timetoken,
                entry: __processMessage(modules, serverHistoryItem.message),
            };
            if (serverHistoryItem.meta) {
                item.meta = serverHistoryItem.meta;
            }
            response.messages.push(item);
        });
    }
    return response;
}
exports.handleResponse = handleResponse;
