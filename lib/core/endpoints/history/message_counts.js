"use strict";
/*       */
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.prepareParams = exports.isAuthSupported = exports.getRequestTimeout = exports.getURL = exports.validateParams = exports.getOperation = void 0;
var operations_1 = __importDefault(require("../../constants/operations"));
var utils_1 = __importDefault(require("../../utils"));
function getOperation() {
    return operations_1.default.PNMessageCounts;
}
exports.getOperation = getOperation;
function validateParams(modules, incomingParams) {
    var channels = incomingParams.channels, timetoken = incomingParams.timetoken, channelTimetokens = incomingParams.channelTimetokens;
    var config = modules.config;
    if (!channels)
        return 'Missing channel';
    if (timetoken && channelTimetokens)
        return 'timetoken and channelTimetokens are incompatible together';
    if (timetoken && channelTimetokens && channelTimetokens.length > 1 && channels.length !== channelTimetokens.length) {
        return 'Length of channelTimetokens and channels do not match';
    }
    if (!config.subscribeKey)
        return 'Missing Subscribe Key';
}
exports.validateParams = validateParams;
function getURL(modules, incomingParams) {
    var channels = incomingParams.channels;
    var config = modules.config;
    var stringifiedChannels = channels.join(',');
    return "/v3/history/sub-key/".concat(config.subscribeKey, "/message-counts/").concat(utils_1.default.encodeString(stringifiedChannels));
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
    var timetoken = incomingParams.timetoken, channelTimetokens = incomingParams.channelTimetokens;
    var outgoingParams = {};
    if (channelTimetokens && channelTimetokens.length === 1) {
        var _a = __read(channelTimetokens, 1), tt = _a[0];
        outgoingParams.timetoken = tt;
    }
    else if (channelTimetokens) {
        outgoingParams.channelsTimetoken = channelTimetokens.join(',');
    }
    else if (timetoken) {
        outgoingParams.timetoken = timetoken;
    }
    return outgoingParams;
}
exports.prepareParams = prepareParams;
function handleResponse(modules, serverResponse) {
    return { channels: serverResponse.channels };
}
exports.handleResponse = handleResponse;
