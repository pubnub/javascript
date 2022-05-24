"use strict";
/*       */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.prepareParams = exports.isAuthSupported = exports.getRequestTimeout = exports.getURL = exports.validateParams = exports.getOperation = void 0;
var operations_1 = __importDefault(require("../constants/operations"));
var utils_1 = __importDefault(require("../utils"));
function getOperation() {
    return operations_1.default.PNSubscribeOperation;
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
    return "/v2/subscribe/".concat(config.subscribeKey, "/").concat(utils_1.default.encodeString(stringifiedChannels), "/0");
}
exports.getURL = getURL;
function getRequestTimeout(_a) {
    var config = _a.config;
    return config.getSubscribeTimeout();
}
exports.getRequestTimeout = getRequestTimeout;
function isAuthSupported() {
    return true;
}
exports.isAuthSupported = isAuthSupported;
function prepareParams(_a, incomingParams) {
    var config = _a.config;
    var state = incomingParams.state, _b = incomingParams.channelGroups, channelGroups = _b === void 0 ? [] : _b, timetoken = incomingParams.timetoken, filterExpression = incomingParams.filterExpression, region = incomingParams.region;
    var params = {
        heartbeat: config.getPresenceTimeout(),
    };
    if (channelGroups.length > 0) {
        params['channel-group'] = channelGroups.join(',');
    }
    if (filterExpression && filterExpression.length > 0) {
        params['filter-expr'] = filterExpression;
    }
    if (Object.keys(state).length) {
        params.state = JSON.stringify(state);
    }
    if (timetoken) {
        params.tt = timetoken;
    }
    if (region) {
        params.tr = region;
    }
    return params;
}
exports.prepareParams = prepareParams;
function handleResponse(modules, serverResponse) {
    var messages = [];
    serverResponse.m.forEach(function (rawMessage) {
        var publishMetaData = {
            publishTimetoken: rawMessage.p.t,
            region: rawMessage.p.r,
        };
        var parsedMessage = {
            shard: parseInt(rawMessage.a, 10),
            subscriptionMatch: rawMessage.b,
            channel: rawMessage.c,
            messageType: rawMessage.e,
            payload: rawMessage.d,
            flags: rawMessage.f,
            issuingClientId: rawMessage.i,
            subscribeKey: rawMessage.k,
            originationTimetoken: rawMessage.o,
            userMetadata: rawMessage.u,
            publishMetaData: publishMetaData,
        };
        messages.push(parsedMessage);
    });
    var metadata = {
        timetoken: serverResponse.t.t,
        region: serverResponse.t.r,
    };
    return { messages: messages, metadata: metadata };
}
exports.handleResponse = handleResponse;
