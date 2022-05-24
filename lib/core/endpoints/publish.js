"use strict";
/*       */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.prepareParams = exports.postPayload = exports.isAuthSupported = exports.getRequestTimeout = exports.postURL = exports.getURL = exports.usePost = exports.validateParams = exports.getOperation = void 0;
var operations_1 = __importDefault(require("../constants/operations"));
var utils_1 = __importDefault(require("../utils"));
function prepareMessagePayload(modules, messagePayload) {
    var crypto = modules.crypto, config = modules.config;
    var stringifiedPayload = JSON.stringify(messagePayload);
    if (config.cipherKey) {
        stringifiedPayload = crypto.encrypt(stringifiedPayload);
        stringifiedPayload = JSON.stringify(stringifiedPayload);
    }
    return stringifiedPayload;
}
function getOperation() {
    return operations_1.default.PNPublishOperation;
}
exports.getOperation = getOperation;
function validateParams(_a, incomingParams) {
    var config = _a.config;
    var message = incomingParams.message, channel = incomingParams.channel;
    if (!channel)
        return 'Missing Channel';
    if (!message)
        return 'Missing Message';
    if (!config.subscribeKey)
        return 'Missing Subscribe Key';
}
exports.validateParams = validateParams;
function usePost(modules, incomingParams) {
    var _a = incomingParams.sendByPost, sendByPost = _a === void 0 ? false : _a;
    return sendByPost;
}
exports.usePost = usePost;
function getURL(modules, incomingParams) {
    var config = modules.config;
    var channel = incomingParams.channel, message = incomingParams.message;
    var stringifiedPayload = prepareMessagePayload(modules, message);
    return "/publish/".concat(config.publishKey, "/").concat(config.subscribeKey, "/0/").concat(utils_1.default.encodeString(channel), "/0/").concat(utils_1.default.encodeString(stringifiedPayload));
}
exports.getURL = getURL;
function postURL(modules, incomingParams) {
    var config = modules.config;
    var channel = incomingParams.channel;
    return "/publish/".concat(config.publishKey, "/").concat(config.subscribeKey, "/0/").concat(utils_1.default.encodeString(channel), "/0");
}
exports.postURL = postURL;
function getRequestTimeout(_a) {
    var config = _a.config;
    return config.getTransactionTimeout();
}
exports.getRequestTimeout = getRequestTimeout;
function isAuthSupported() {
    return true;
}
exports.isAuthSupported = isAuthSupported;
function postPayload(modules, incomingParams) {
    var message = incomingParams.message;
    return prepareMessagePayload(modules, message);
}
exports.postPayload = postPayload;
function prepareParams(modules, incomingParams) {
    var meta = incomingParams.meta, _a = incomingParams.replicate, replicate = _a === void 0 ? true : _a, storeInHistory = incomingParams.storeInHistory, ttl = incomingParams.ttl;
    var params = {};
    if (storeInHistory != null) {
        if (storeInHistory) {
            params.store = '1';
        }
        else {
            params.store = '0';
        }
    }
    if (ttl) {
        params.ttl = ttl;
    }
    if (replicate === false) {
        params.norep = 'true';
    }
    if (meta && typeof meta === 'object') {
        params.meta = JSON.stringify(meta);
    }
    return params;
}
exports.prepareParams = prepareParams;
function handleResponse(modules, serverResponse) {
    return { timetoken: serverResponse[2] };
}
exports.handleResponse = handleResponse;
