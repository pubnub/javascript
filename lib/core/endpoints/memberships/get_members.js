"use strict";
/*       */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.prepareParams = exports.isAuthSupported = exports.getRequestTimeout = exports.getURL = exports.validateParams = exports.getOperation = void 0;
var operations_1 = require("../../constants/operations");
var utils_1 = require("../../utils");
function getOperation() {
    return operations_1.default.PNGetMembersOperation;
}
exports.getOperation = getOperation;
function validateParams(modules, incomingParams) {
    var spaceId = incomingParams.spaceId;
    if (!spaceId)
        return 'Missing spaceId';
}
exports.validateParams = validateParams;
function getURL(modules, incomingParams) {
    var config = modules.config;
    return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(utils_1.default.encodeString(incomingParams.spaceId), "/users");
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
    var include = incomingParams.include, limit = incomingParams.limit, page = incomingParams.page, filter = incomingParams.filter;
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
        if (include.userFields) {
            includes.push('user');
        }
        if (include.customUserFields) {
            includes.push('user.custom');
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
    if (filter) {
        params.filter = filter;
    }
    return params;
}
exports.prepareParams = prepareParams;
function handleResponse(modules, membersResponse) {
    return membersResponse;
}
exports.handleResponse = handleResponse;
