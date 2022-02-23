"use strict";
/*       */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.prepareParams = exports.isAuthSupported = exports.getRequestTimeout = exports.getURL = exports.validateParams = exports.getOperation = void 0;
var operations_1 = require("../../constants/operations");
function getOperation() {
    return operations_1.default.PNGetSpacesOperation;
}
exports.getOperation = getOperation;
function validateParams() {
    // no required parameters
}
exports.validateParams = validateParams;
function getURL(modules) {
    var config = modules.config;
    return "/v1/objects/".concat(config.subscribeKey, "/spaces");
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
function handleResponse(modules, spacesResponse) {
    return spacesResponse;
}
exports.handleResponse = handleResponse;
