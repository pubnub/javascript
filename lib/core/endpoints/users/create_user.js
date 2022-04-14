"use strict";
/*       */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.postPayload = exports.prepareParams = exports.isAuthSupported = exports.getRequestTimeout = exports.postURL = exports.getURL = exports.usePost = exports.validateParams = exports.getOperation = void 0;
var operations_1 = require("../../constants/operations");
function prepareMessagePayload(modules, incomingParams) {
    return incomingParams;
}
function getOperation() {
    return operations_1.default.PNCreateUserOperation;
}
exports.getOperation = getOperation;
function validateParams(_a, incomingParams) {
    var config = _a.config;
    var id = incomingParams.id, name = incomingParams.name, custom = incomingParams.custom;
    if (!id)
        return 'Missing User.id';
    if (!name)
        return 'Missing User.name';
    if (!config.subscribeKey)
        return 'Missing Subscribe Key';
    if (custom) {
        if (!Object.values(custom).every(function (value) { return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'; })) {
            return 'Invalid custom type, only string, number and boolean values are allowed.';
        }
    }
}
exports.validateParams = validateParams;
function usePost() {
    return true;
}
exports.usePost = usePost;
function getURL(modules) {
    var config = modules.config;
    return "/v1/objects/".concat(config.subscribeKey, "/users");
}
exports.getURL = getURL;
function postURL(modules) {
    var config = modules.config;
    return "/v1/objects/".concat(config.subscribeKey, "/users");
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
function prepareParams(modules, incomingParams) {
    var include = incomingParams.include;
    var params = {};
    // default to include custom fields in response
    if (!include) {
        include = {
            customFields: true,
        };
    }
    else if (include.customFields === undefined) {
        include.customFields = true;
    }
    if (include) {
        var includes = [];
        if (include.customFields) {
            includes.push('custom');
        }
        var includesString = includes.join(',');
        if (includesString.length > 0) {
            params.include = includesString;
        }
    }
    return params;
}
exports.prepareParams = prepareParams;
function postPayload(modules, incomingParams) {
    return prepareMessagePayload(modules, incomingParams);
}
exports.postPayload = postPayload;
function handleResponse(modules, usersResponse) {
    return usersResponse;
}
exports.handleResponse = handleResponse;
