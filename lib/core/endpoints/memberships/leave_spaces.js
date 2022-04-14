"use strict";
/*       */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.patchPayload = exports.prepareParams = exports.isAuthSupported = exports.getRequestTimeout = exports.usePatch = exports.patchURL = exports.getURL = exports.validateParams = exports.getOperation = void 0;
var operations_1 = require("../../constants/operations");
var utils_1 = require("../../utils");
function prepareMessagePayload(modules, incomingParams) {
    var spaces = incomingParams.spaces;
    var payload = {};
    if (spaces && spaces.length > 0) {
        payload.remove = [];
        spaces.forEach(function (removeMembershipId) {
            payload.remove.push({ id: removeMembershipId });
        });
    }
    return payload;
}
function getOperation() {
    return operations_1.default.PNUpdateMembershipsOperation;
}
exports.getOperation = getOperation;
function validateParams(modules, incomingParams) {
    var userId = incomingParams.userId, spaces = incomingParams.spaces;
    if (!userId)
        return 'Missing userId';
    if (!spaces)
        return 'Missing spaces';
}
exports.validateParams = validateParams;
function getURL(modules, incomingParams) {
    var config = modules.config;
    return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(utils_1.default.encodeString(incomingParams.userId), "/spaces");
}
exports.getURL = getURL;
function patchURL(modules, incomingParams) {
    var config = modules.config;
    return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(utils_1.default.encodeString(incomingParams.userId), "/spaces");
}
exports.patchURL = patchURL;
function usePatch() {
    return true;
}
exports.usePatch = usePatch;
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
    var include = incomingParams.include, limit = incomingParams.limit, page = incomingParams.page;
    var params = {};
    if (limit) {
        params.limit = limit;
    }
    if (include) {
        var includes = [];
        if (include.totalCount) {
            params.count = true;
        }
        if (include.customFields) {
            includes.push('custom');
        }
        if (include.spaceFields) {
            includes.push('space');
        }
        if (include.customSpaceFields) {
            includes.push('space.custom');
        }
        var includesString = includes.join(',');
        if (includesString.length > 0) {
            params.include = includesString;
        }
    }
    if (page) {
        if (page.next) {
            params.start = page.next;
        }
        if (page.prev) {
            params.end = page.prev;
        }
    }
    return params;
}
exports.prepareParams = prepareParams;
function patchPayload(modules, incomingParams) {
    return prepareMessagePayload(modules, incomingParams);
}
exports.patchPayload = patchPayload;
function handleResponse(modules, membershipsResponse) {
    return membershipsResponse;
}
exports.handleResponse = handleResponse;
