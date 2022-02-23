"use strict";
/*       */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.prepareParams = exports.isAuthSupported = exports.getRequestTimeout = exports.getURL = exports.validateParams = exports.getOperation = void 0;
var operations_1 = require("../../constants/operations");
var utils_1 = require("../../utils");
function getOperation() {
    return operations_1.default.PNGetUserOperation;
}
exports.getOperation = getOperation;
function validateParams(modules, incomingParams) {
    var userId = incomingParams.userId;
    if (!userId)
        return 'Missing userId';
}
exports.validateParams = validateParams;
function getURL(modules, incomingParams) {
    var config = modules.config;
    return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(utils_1.default.encodeString(incomingParams.userId));
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
function handleResponse(modules, usersResponse) {
    return usersResponse;
}
exports.handleResponse = handleResponse;
