"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.prepareParams = exports.isAuthSupported = exports.getRequestTimeout = exports.getURL = exports.validateParams = exports.getOperation = void 0;
var operations_1 = __importDefault(require("../constants/operations"));
var utils_1 = __importDefault(require("../utils"));
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
    return operations_1.default.PNFetchMessagesOperation;
}
exports.getOperation = getOperation;
function validateParams(modules, incomingParams) {
    var channels = incomingParams.channels, _a = incomingParams.includeMessageActions, includeMessageActions = _a === void 0 ? false : _a;
    var config = modules.config;
    if (!channels || channels.length === 0)
        return 'Missing channels';
    if (!config.subscribeKey)
        return 'Missing Subscribe Key';
    if (includeMessageActions && channels.length > 1) {
        throw new TypeError('History can return actions data for a single channel only. ' +
            'Either pass a single channel or disable the includeMessageActions flag.');
    }
}
exports.validateParams = validateParams;
function getURL(modules, incomingParams) {
    var _a = incomingParams.channels, channels = _a === void 0 ? [] : _a, _b = incomingParams.includeMessageActions, includeMessageActions = _b === void 0 ? false : _b;
    var config = modules.config;
    var endpoint = !includeMessageActions ? 'history' : 'history-with-actions';
    var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
    return "/v3/".concat(endpoint, "/sub-key/").concat(config.subscribeKey, "/channel/").concat(utils_1.default.encodeString(stringifiedChannels));
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
    var channels = incomingParams.channels, start = incomingParams.start, end = incomingParams.end, includeMessageActions = incomingParams.includeMessageActions, count = incomingParams.count, _a = incomingParams.stringifiedTimeToken, stringifiedTimeToken = _a === void 0 ? false : _a, _b = incomingParams.includeMeta, includeMeta = _b === void 0 ? false : _b, includeUuid = incomingParams.includeUuid, _c = incomingParams.includeUUID, includeUUID = _c === void 0 ? true : _c, _d = incomingParams.includeMessageType, includeMessageType = _d === void 0 ? true : _d, _e = incomingParams.includeType, includeType = _e === void 0 ? true : _e, _f = incomingParams.includeSpaceId, includeSpaceId = _f === void 0 ? false : _f;
    var outgoingParams = {};
    outgoingParams.include_message_type = 'true';
    outgoingParams.include_type = 'true';
    if (count) {
        outgoingParams.max = count;
    }
    else {
        outgoingParams.max = channels.length > 1 || includeMessageActions === true ? 25 : 100;
    }
    if (start)
        outgoingParams.start = start;
    if (end)
        outgoingParams.end = end;
    if (stringifiedTimeToken)
        outgoingParams.string_message_token = 'true';
    if (includeMeta)
        outgoingParams.include_meta = 'true';
    if (includeUUID && includeUuid !== false)
        outgoingParams.include_uuid = 'true';
    if (!includeMessageType) {
        outgoingParams.include_message_type = 'false';
    }
    if (!includeType) {
        outgoingParams.include_type = 'false';
    }
    if (includeSpaceId)
        outgoingParams.include_space_id = 'true';
    return outgoingParams;
}
exports.prepareParams = prepareParams;
function handleResponse(modules, serverResponse) {
    var response = {
        channels: {},
    };
    Object.keys(serverResponse.channels || {}).forEach(function (channelName) {
        response.channels[channelName] = [];
        (serverResponse.channels[channelName] || []).forEach(function (messageEnvelope) {
            var announce = {};
            announce.channel = channelName;
            announce.timetoken = messageEnvelope.timetoken;
            announce.message = __processMessage(modules, messageEnvelope.message);
            announce.messageType = messageEnvelope.message_type;
            announce.uuid = messageEnvelope.uuid;
            if (messageEnvelope.actions) {
                announce.actions = messageEnvelope.actions;
                // This should be kept for few updates for existing clients consistency.
                announce.data = messageEnvelope.actions;
            }
            if (messageEnvelope.meta) {
                announce.meta = messageEnvelope.meta;
            }
            if (messageEnvelope.type) {
                announce.type = messageEnvelope.type;
            }
            if (messageEnvelope.space_id) {
                announce.spaceId = messageEnvelope.space_id;
            }
            response.channels[channelName].push(announce);
        });
    });
    if (serverResponse.more) {
        response.more = serverResponse.more;
    }
    return response;
}
exports.handleResponse = handleResponse;
