"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.postPayload = exports.prepareParams = exports.isAuthSupported = exports.getRequestTimeout = exports.usePost = exports.postURL = exports.validateParams = exports.extractPermissions = exports.getOperation = void 0;
var operations_1 = __importDefault(require("../../constants/operations"));
function getOperation() {
    return operations_1.default.PNAccessManagerGrantToken;
}
exports.getOperation = getOperation;
function hasVspTerms(incomingParams) {
    var _a, _b, _c, _d;
    var hasAuthorizedUserId = (incomingParams === null || incomingParams === void 0 ? void 0 : incomingParams.authorizedUserId) !== undefined;
    var hasUserResources = ((_a = incomingParams === null || incomingParams === void 0 ? void 0 : incomingParams.resources) === null || _a === void 0 ? void 0 : _a.users) !== undefined;
    var hasSpaceResources = ((_b = incomingParams === null || incomingParams === void 0 ? void 0 : incomingParams.resources) === null || _b === void 0 ? void 0 : _b.spaces) !== undefined;
    var hasUserPatterns = ((_c = incomingParams === null || incomingParams === void 0 ? void 0 : incomingParams.patterns) === null || _c === void 0 ? void 0 : _c.users) !== undefined;
    var hasSpacePatterns = ((_d = incomingParams === null || incomingParams === void 0 ? void 0 : incomingParams.patterns) === null || _d === void 0 ? void 0 : _d.spaces) !== undefined;
    return hasUserPatterns || hasUserResources || hasSpacePatterns || hasSpaceResources || hasAuthorizedUserId;
}
function extractPermissions(permissions) {
    var permissionsResult = 0;
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
    return permissionsResult;
}
exports.extractPermissions = extractPermissions;
function prepareMessagePayloadVsp(_modules, _a) {
    var ttl = _a.ttl, resources = _a.resources, patterns = _a.patterns, meta = _a.meta, authorizedUserId = _a.authorizedUserId;
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
        var users_1 = resources.users, spaces_1 = resources.spaces, groups_1 = resources.groups;
        if (users_1) {
            Object.keys(users_1).forEach(function (userID) {
                params.permissions.resources.uuids[userID] = extractPermissions(users_1[userID]);
            });
        }
        if (spaces_1) {
            Object.keys(spaces_1).forEach(function (spaceId) {
                params.permissions.resources.channels[spaceId] = extractPermissions(spaces_1[spaceId]);
            });
        }
        if (groups_1) {
            Object.keys(groups_1).forEach(function (group) {
                params.permissions.resources.groups[group] = extractPermissions(groups_1[group]);
            });
        }
    }
    if (patterns) {
        var users_2 = patterns.users, spaces_2 = patterns.spaces, groups_2 = patterns.groups;
        if (users_2) {
            Object.keys(users_2).forEach(function (userId) {
                params.permissions.patterns.uuids[userId] = extractPermissions(users_2[userId]);
            });
        }
        if (spaces_2) {
            Object.keys(spaces_2).forEach(function (spaceId) {
                params.permissions.patterns.channels[spaceId] = extractPermissions(spaces_2[spaceId]);
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
    if (authorizedUserId) {
        params.permissions.uuid = "".concat(authorizedUserId); // ensure this is a string
    }
    return params;
}
function prepareMessagePayload(_modules, incomingParams) {
    if (hasVspTerms(incomingParams)) {
        return prepareMessagePayloadVsp(_modules, incomingParams);
    }
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
        var uuids_1 = resources.uuids, channels_1 = resources.channels, groups_3 = resources.groups;
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
        if (groups_3) {
            Object.keys(groups_3).forEach(function (group) {
                params.permissions.resources.groups[group] = extractPermissions(groups_3[group]);
            });
        }
    }
    if (patterns) {
        var uuids_2 = patterns.uuids, channels_2 = patterns.channels, groups_4 = patterns.groups;
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
        if (groups_4) {
            Object.keys(groups_4).forEach(function (group) {
                params.permissions.patterns.groups[group] = extractPermissions(groups_4[group]);
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
    var _a, _b, _c, _d, _e, _f;
    var config = modules.config;
    if (!config.subscribeKey)
        return 'Missing Subscribe Key';
    if (!config.publishKey)
        return 'Missing Publish Key';
    if (!config.secretKey)
        return 'Missing Secret Key';
    if (!incomingParams.resources && !incomingParams.patterns)
        return 'Missing either Resources or Patterns.';
    var hasAuthorizedUuid = (incomingParams === null || incomingParams === void 0 ? void 0 : incomingParams.authorized_uuid) !== undefined;
    var hasUuidResources = ((_a = incomingParams === null || incomingParams === void 0 ? void 0 : incomingParams.resources) === null || _a === void 0 ? void 0 : _a.uuids) !== undefined;
    var hasChannelResources = ((_b = incomingParams === null || incomingParams === void 0 ? void 0 : incomingParams.resources) === null || _b === void 0 ? void 0 : _b.channels) !== undefined;
    var hasGroupResources = ((_c = incomingParams === null || incomingParams === void 0 ? void 0 : incomingParams.resources) === null || _c === void 0 ? void 0 : _c.groups) !== undefined;
    var hasUuidPatterns = ((_d = incomingParams === null || incomingParams === void 0 ? void 0 : incomingParams.patterns) === null || _d === void 0 ? void 0 : _d.uuids) !== undefined;
    var hasChannelPatterns = ((_e = incomingParams === null || incomingParams === void 0 ? void 0 : incomingParams.patterns) === null || _e === void 0 ? void 0 : _e.channels) !== undefined;
    var hasGroupPatterns = ((_f = incomingParams === null || incomingParams === void 0 ? void 0 : incomingParams.patterns) === null || _f === void 0 ? void 0 : _f.groups) !== undefined;
    var hasLegacyTerms = hasAuthorizedUuid ||
        hasUuidResources ||
        hasUuidPatterns ||
        hasChannelResources ||
        hasChannelPatterns ||
        hasGroupResources ||
        hasGroupPatterns;
    if (hasVspTerms(incomingParams) && hasLegacyTerms) {
        return ('Cannot mix `users`, `spaces` and `authorizedUserId` ' +
            'with `uuids`, `channels`, `groups` and `authorized_uuid`');
    }
    if ((incomingParams.resources &&
        (!incomingParams.resources.uuids || Object.keys(incomingParams.resources.uuids).length === 0) &&
        (!incomingParams.resources.channels || Object.keys(incomingParams.resources.channels).length === 0) &&
        (!incomingParams.resources.groups || Object.keys(incomingParams.resources.groups).length === 0) &&
        (!incomingParams.resources.users || Object.keys(incomingParams.resources.users).length === 0) &&
        (!incomingParams.resources.spaces || Object.keys(incomingParams.resources.spaces).length === 0)) ||
        (incomingParams.patterns &&
            (!incomingParams.patterns.uuids || Object.keys(incomingParams.patterns.uuids).length === 0) &&
            (!incomingParams.patterns.channels || Object.keys(incomingParams.patterns.channels).length === 0) &&
            (!incomingParams.patterns.groups || Object.keys(incomingParams.patterns.groups).length === 0) &&
            (!incomingParams.patterns.users || Object.keys(incomingParams.patterns.users).length === 0) &&
            (!incomingParams.patterns.spaces || Object.keys(incomingParams.patterns.spaces).length === 0))) {
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
