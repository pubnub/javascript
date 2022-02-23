"use strict";
/*       */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.patchPayload = exports.prepareParams = exports.isAuthSupported = exports.getRequestTimeout = exports.usePatch = exports.patchURL = exports.getURL = exports.validateParams = exports.getOperation = void 0;
var operations_1 = require("../../constants/operations");
var utils_1 = require("../../utils");
function prepareMessagePayload(modules, incomingParams) {
    var users = incomingParams.users;
    var payload = {};
    if (users && users.length > 0) {
        payload.add = [];
        users.forEach(function (addMember) {
            var currentAdd = { id: addMember.id };
            if (addMember.custom) {
                currentAdd.custom = addMember.custom;
            }
            payload.add.push(currentAdd);
        });
    }
    return payload;
}
function getOperation() {
    return operations_1.default.PNUpdateMembersOperation;
}
exports.getOperation = getOperation;
function validateParams(modules, incomingParams) {
    var spaceId = incomingParams.spaceId, users = incomingParams.users;
    if (!spaceId)
        return 'Missing spaceId';
    if (!users)
        return 'Missing users';
}
exports.validateParams = validateParams;
function getURL(modules, incomingParams) {
    var config = modules.config;
    return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(utils_1.default.encodeString(incomingParams.spaceId), "/users");
}
exports.getURL = getURL;
function patchURL(modules, incomingParams) {
    var config = modules.config;
    return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(utils_1.default.encodeString(incomingParams.spaceId), "/users");
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
function handleResponse(modules, membersResponse) {
    return membersResponse;
}
exports.handleResponse = handleResponse;
