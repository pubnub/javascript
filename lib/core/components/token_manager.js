"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var default_1 = /** @class */ (function () {
    function default_1(config, cbor) {
        this._config = config;
        this._cbor = cbor;
    }
    default_1.prototype.setToken = function (token) {
        if (token && token.length > 0) {
            this._token = token;
        }
        else {
            this._token = undefined;
        }
    };
    default_1.prototype.getToken = function () {
        return this._token;
    };
    default_1.prototype.extractPermissions = function (permissions) {
        var permissionsResult = {
            read: false,
            write: false,
            manage: false,
            delete: false,
            get: false,
            update: false,
            join: false,
        };
        /* eslint-disable */
        if ((permissions & 128) === 128) {
            permissionsResult.join = true;
        }
        if ((permissions & 64) === 64) {
            permissionsResult.update = true;
        }
        if ((permissions & 32) === 32) {
            permissionsResult.get = true;
        }
        if ((permissions & 8) === 8) {
            permissionsResult.delete = true;
        }
        if ((permissions & 4) === 4) {
            permissionsResult.manage = true;
        }
        if ((permissions & 2) === 2) {
            permissionsResult.write = true;
        }
        if ((permissions & 1) === 1) {
            permissionsResult.read = true;
        }
        /* eslint-enable */
        return permissionsResult;
    };
    default_1.prototype.parseToken = function (tokenString) {
        var _this = this;
        var parsed = this._cbor.decodeToken(tokenString);
        if (parsed !== undefined) {
            var uuidResourcePermissions = parsed.res.uuid ? Object.keys(parsed.res.uuid) : [];
            var channelResourcePermissions = Object.keys(parsed.res.chan);
            var groupResourcePermissions = Object.keys(parsed.res.grp);
            var uuidPatternPermissions = parsed.pat.uuid ? Object.keys(parsed.pat.uuid) : [];
            var channelPatternPermissions = Object.keys(parsed.pat.chan);
            var groupPatternPermissions = Object.keys(parsed.pat.grp);
            var result_1 = {
                version: parsed.v,
                timestamp: parsed.t,
                ttl: parsed.ttl,
                authorized_uuid: parsed.uuid,
            };
            var uuidResources = uuidResourcePermissions.length > 0;
            var channelResources = channelResourcePermissions.length > 0;
            var groupResources = groupResourcePermissions.length > 0;
            if (uuidResources || channelResources || groupResources) {
                result_1.resources = {};
                if (uuidResources) {
                    result_1.resources.uuids = {};
                    uuidResourcePermissions.forEach(function (id) {
                        result_1.resources.uuids[id] = _this.extractPermissions(parsed.res.uuid[id]);
                    });
                }
                if (channelResources) {
                    result_1.resources.channels = {};
                    channelResourcePermissions.forEach(function (id) {
                        result_1.resources.channels[id] = _this.extractPermissions(parsed.res.chan[id]);
                    });
                }
                if (groupResources) {
                    result_1.resources.groups = {};
                    groupResourcePermissions.forEach(function (id) {
                        result_1.resources.groups[id] = _this.extractPermissions(parsed.res.grp[id]);
                    });
                }
            }
            var uuidPatterns = uuidPatternPermissions.length > 0;
            var channelPatterns = channelPatternPermissions.length > 0;
            var groupPatterns = groupPatternPermissions.length > 0;
            if (uuidPatterns || channelPatterns || groupPatterns) {
                result_1.patterns = {};
                if (uuidPatterns) {
                    result_1.patterns.uuids = {};
                    uuidPatternPermissions.forEach(function (id) {
                        result_1.patterns.uuids[id] = _this.extractPermissions(parsed.pat.uuid[id]);
                    });
                }
                if (channelPatterns) {
                    result_1.patterns.channels = {};
                    channelPatternPermissions.forEach(function (id) {
                        result_1.patterns.channels[id] = _this.extractPermissions(parsed.pat.chan[id]);
                    });
                }
                if (groupPatterns) {
                    result_1.patterns.groups = {};
                    groupPatternPermissions.forEach(function (id) {
                        result_1.patterns.groups[id] = _this.extractPermissions(parsed.pat.grp[id]);
                    });
                }
            }
            if (Object.keys(parsed.meta).length > 0) {
                result_1.meta = parsed.meta;
            }
            result_1.signature = parsed.sig;
            return result_1;
        }
        return undefined;
    };
    return default_1;
}());
exports.default = default_1;
