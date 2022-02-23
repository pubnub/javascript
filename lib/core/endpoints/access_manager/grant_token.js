"use strict";
/*       */
/* eslint camelcase: 0 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.postPayload = exports.prepareParams = exports.isAuthSupported = exports.getRequestTimeout = exports.usePost = exports.postURL = exports.validateParams = exports.extractPermissions = exports.getOperation = void 0;
var operations_1 = require("../../constants/operations");
function getOperation() {
    return operations_1.default.PNAccessManagerGrantToken;
}
exports.getOperation = getOperation;
function extractPermissions(permissions) {
    var permissionsResult = 0;
    /* eslint-disable */
    if (permissions.join) {
        permissionsResult |= 128;
    }
    if (permissions.update) {
        permissionsResult |= 64;
    }
    if (permissions.get) {
        permissionsResult |= 32;
    }
    if (permissions.delete) {
        permissionsResult |= 8;
    }
    if (permissions.manage) {
        permissionsResult |= 4;
    }
    if (permissions.write) {
        permissionsResult |= 2;
    }
    if (permissions.read) {
        permissionsResult |= 1;
    }
    /* eslint-enable */
    return permissionsResult;
}
exports.extractPermissions = extractPermissions;
function prepareMessagePayload(modules, incomingParams) {
    var ttl = incomingParams.ttl, resources = incomingParams.resources, patterns = incomingParams.patterns, meta = incomingParams.meta, authorized_uuid = incomingParams.authorized_uuid;
    var params = {
        ttl: 0,
        permissions: {
            resources: {
                channels: {},
                groups: {},
                uuids: {},
                users: {},
                spaces: {}, // not used, needed for api backward compatibility
            },
            patterns: {
                channels: {},
                groups: {},
                uuids: {},
                users: {},
                spaces: {}, // not used, needed for api backward compatibility
            },
            meta: {},
        },
    };
    if (resources) {
        var uuids_1 = resources.uuids, channels_1 = resources.channels, groups_1 = resources.groups;
        if (uuids_1) {
            Object.keys(uuids_1).forEach(function (uuid) {
                params.permissions.resources.uuids[uuid] = extractPermissions(uuids_1[uuid]);
            });
        }
        if (channels_1) {
            Object.keys(channels_1).forEach(function (channel) {
                params.permissions.resources.channels[channel] = extractPermissions(channels_1[channel]);
            });
        }
        if (groups_1) {
            Object.keys(groups_1).forEach(function (group) {
                params.permissions.resources.groups[group] = extractPermissions(groups_1[group]);
            });
        }
    }
    if (patterns) {
        var uuids_2 = patterns.uuids, channels_2 = patterns.channels, groups_2 = patterns.groups;
        if (uuids_2) {
            Object.keys(uuids_2).forEach(function (uuid) {
                params.permissions.patterns.uuids[uuid] = extractPermissions(uuids_2[uuid]);
            });
        }
        if (channels_2) {
            Object.keys(channels_2).forEach(function (channel) {
                params.permissions.patterns.channels[channel] = extractPermissions(channels_2[channel]);
            });
        }
        if (groups_2) {
            Object.keys(groups_2).forEach(function (group) {
                params.permissions.patterns.groups[group] = extractPermissions(groups_2[group]);
            });
        }
    }
    if (ttl || ttl === 0) {
        params.ttl = ttl;
    }
    if (meta) {
        params.permissions.meta = meta;
    }
    if (authorized_uuid) {
        params.permissions.uuid = "".concat(authorized_uuid); // ensure this is a string
    }
    return params;
}
function validateParams(modules, incomingParams) {
    var config = modules.config;
    if (!config.subscribeKey)
        return 'Missing Subscribe Key';
    if (!config.publishKey)
        return 'Missing Publish Key';
    if (!config.secretKey)
        return 'Missing Secret Key';
    if (!incomingParams.resources && !incomingParams.patterns)
        return 'Missing either Resources or Patterns.';
    if ((incomingParams.resources &&
        (!incomingParams.resources.uuids || Object.keys(incomingParams.resources.uuids).length === 0) &&
        (!incomingParams.resources.channels || Object.keys(incomingParams.resources.channels).length === 0) &&
        (!incomingParams.resources.groups || Object.keys(incomingParams.resources.groups).length === 0)) ||
        (incomingParams.patterns &&
            (!incomingParams.patterns.uuids || Object.keys(incomingParams.patterns.uuids).length === 0) &&
            (!incomingParams.patterns.channels || Object.keys(incomingParams.patterns.channels).length === 0) &&
            (!incomingParams.patterns.groups || Object.keys(incomingParams.patterns.groups).length === 0))) {
        return 'Missing values for either Resources or Patterns.';
    }
}
exports.validateParams = validateParams;
function postURL(modules) {
    var config = modules.config;
    return "/v3/pam/".concat(config.subscribeKey, "/grant");
}
exports.postURL = postURL;
function usePost() {
    return true;
}
exports.usePost = usePost;
function getRequestTimeout(_a) {
    var config = _a.config;
    return config.getTransactionTimeout();
}
exports.getRequestTimeout = getRequestTimeout;
function isAuthSupported() {
    return false;
}
exports.isAuthSupported = isAuthSupported;
function prepareParams() {
    return {};
}
exports.prepareParams = prepareParams;
function postPayload(modules, incomingParams) {
    return prepareMessagePayload(modules, incomingParams);
}
exports.postPayload = postPayload;
function handleResponse(modules, response) {
    var token = response.data.token;
    return token;
}
exports.handleResponse = handleResponse;
