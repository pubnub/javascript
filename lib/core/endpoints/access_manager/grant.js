"use strict";
/*       */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.prepareParams = exports.isAuthSupported = exports.getRequestTimeout = exports.getURL = exports.validateParams = exports.getOperation = void 0;
var operations_1 = __importDefault(require("../../constants/operations"));
function getOperation() {
    return operations_1.default.PNAccessManagerGrant;
}
exports.getOperation = getOperation;
function validateParams(modules, incomingParams) {
    var config = modules.config;
    if (!config.subscribeKey)
        return 'Missing Subscribe Key';
    if (!config.publishKey)
        return 'Missing Publish Key';
    if (!config.secretKey)
        return 'Missing Secret Key';
    if (incomingParams.uuids != null && !incomingParams.authKeys) {
        return 'authKeys are required for grant request on uuids';
    }
    if (incomingParams.uuids != null && (incomingParams.channels != null || incomingParams.channelGroups != null)) {
        return 'Both channel/channelgroup and uuid cannot be used in the same request';
    }
}
exports.validateParams = validateParams;
function getURL(modules) {
    var config = modules.config;
    return "/v2/auth/grant/sub-key/".concat(config.subscribeKey);
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
    var _a = incomingParams.channels, channels = _a === void 0 ? [] : _a, _b = incomingParams.channelGroups, channelGroups = _b === void 0 ? [] : _b, _c = incomingParams.uuids, uuids = _c === void 0 ? [] : _c, ttl = incomingParams.ttl, _d = incomingParams.read, read = _d === void 0 ? false : _d, _e = incomingParams.write, write = _e === void 0 ? false : _e, _f = incomingParams.manage, manage = _f === void 0 ? false : _f, _g = incomingParams.get, get = _g === void 0 ? false : _g, _h = incomingParams.join, join = _h === void 0 ? false : _h, _j = incomingParams.update, update = _j === void 0 ? false : _j, _k = incomingParams.authKeys, authKeys = _k === void 0 ? [] : _k;
    var deleteParam = incomingParams.delete;
    var params = {};
    params.r = read ? '1' : '0';
    params.w = write ? '1' : '0';
    params.m = manage ? '1' : '0';
    params.d = deleteParam ? '1' : '0';
    params.g = get ? '1' : '0';
    params.j = join ? '1' : '0';
    params.u = update ? '1' : '0';
    if (channels.length > 0) {
        params.channel = channels.join(',');
    }
    if (channelGroups.length > 0) {
        params['channel-group'] = channelGroups.join(',');
    }
    if (authKeys.length > 0) {
        params.auth = authKeys.join(',');
    }
    if (uuids.length > 0) {
        params['target-uuid'] = uuids.join(',');
    }
    if (ttl || ttl === 0) {
        params.ttl = ttl;
    }
    return params;
}
exports.prepareParams = prepareParams;
function handleResponse() {
    return {};
}
exports.handleResponse = handleResponse;
