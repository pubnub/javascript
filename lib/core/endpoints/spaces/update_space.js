"use strict";
/*       */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.patchPayload = exports.prepareParams = exports.isAuthSupported = exports.getRequestTimeout = exports.patchURL = exports.getURL = exports.usePatch = exports.validateParams = exports.getOperation = void 0;
var operations_1 = require("../../constants/operations");
var utils_1 = require("../../utils");
function prepareMessagePayload(modules, incomingParams) {
    return incomingParams;
}
function getOperation() {
    return operations_1.default.PNUpdateSpaceOperation;
}
exports.getOperation = getOperation;
function validateParams(_a, incomingParams) {
    var config = _a.config;
    var id = incomingParams.id, name = incomingParams.name, custom = incomingParams.custom;
    if (!id)
        return 'Missing Space.id';
    if (!name)
        return 'Missing Space.name';
    if (!config.subscribeKey)
        return 'Missing Subscribe Key';
    if (custom) {
        if (!Object.values(custom).every(function (value) { return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'; })) {
            return 'Invalid custom type, only string, number and boolean values are allowed.';
        }
    }
}
exports.validateParams = validateParams;
function usePatch() {
    return true;
}
exports.usePatch = usePatch;
function getURL(modules, incomingParams) {
    var config = modules.config;
    var id = incomingParams.id;
    return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(utils_1.default.encodeString(id));
}
exports.getURL = getURL;
function patchURL(modules, incomingParams) {
    var config = modules.config;
    var id = incomingParams.id;
    return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(utils_1.default.encodeString(id));
}
exports.patchURL = patchURL;
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
function patchPayload(modules, incomingParams) {
    return prepareMessagePayload(modules, incomingParams);
}
exports.patchPayload = patchPayload;
function handleResponse(modules, spacesResponse) {
    return spacesResponse;
}
exports.handleResponse = handleResponse;
