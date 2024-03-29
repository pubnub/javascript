"use strict";
/**
 * PAM Grant Token REST API module.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrantTokenRequest = void 0;
var PubNubError_1 = require("../../../models/PubNubError");
var transport_request_1 = require("../../types/transport-request");
var request_1 = require("../../components/request");
var operations_1 = __importDefault(require("../../constants/operations"));
// endregion
/**
 * Grant token permissions request.
 */
var GrantTokenRequest = /** @class */ (function (_super) {
    __extends(GrantTokenRequest, _super);
    function GrantTokenRequest(parameters) {
        var _a, _b;
        var _c, _d;
        var _this = _super.call(this, { method: transport_request_1.TransportMethod.POST }) || this;
        _this.parameters = parameters;
        // Apply defaults.
        (_a = (_c = _this.parameters).resources) !== null && _a !== void 0 ? _a : (_c.resources = {});
        (_b = (_d = _this.parameters).patterns) !== null && _b !== void 0 ? _b : (_d.patterns = {});
        return _this;
    }
    GrantTokenRequest.prototype.operation = function () {
        return operations_1.default.PNAccessManagerGrantToken;
    };
    GrantTokenRequest.prototype.validate = function () {
        var _a, _b, _c, _d, _e, _f;
        var _g = this.parameters, _h = _g.keySet, subscribeKey = _h.subscribeKey, publishKey = _h.publishKey, secretKey = _h.secretKey, resources = _g.resources, patterns = _g.patterns;
        if (!subscribeKey)
            return 'Missing Subscribe Key';
        if (!publishKey)
            return 'Missing Publish Key';
        if (!secretKey)
            return 'Missing Secret Key';
        if (!resources && !patterns)
            return 'Missing either Resources or Patterns';
        if (this.isVspPermissions(this.parameters) &&
            ('channels' in ((_a = this.parameters.resources) !== null && _a !== void 0 ? _a : {}) ||
                'uuids' in ((_b = this.parameters.resources) !== null && _b !== void 0 ? _b : {}) ||
                'groups' in ((_c = this.parameters.resources) !== null && _c !== void 0 ? _c : {}) ||
                'channels' in ((_d = this.parameters.patterns) !== null && _d !== void 0 ? _d : {}) ||
                'uuids' in ((_e = this.parameters.patterns) !== null && _e !== void 0 ? _e : {}) ||
                'groups' in ((_f = this.parameters.patterns) !== null && _f !== void 0 ? _f : {})))
            return ('Cannot mix `users`, `spaces` and `authorizedUserId` with `uuids`, `channels`,' +
                ' `groups` and `authorized_uuid`');
        var permissionsEmpty = true;
        [this.parameters.resources, this.parameters.patterns].forEach(function (refPerm) {
            Object.keys(refPerm !== null && refPerm !== void 0 ? refPerm : {}).forEach(function (scope) {
                var _a;
                // @ts-expect-error Permissions with backward compatibility.
                if (refPerm && permissionsEmpty && Object.keys((_a = refPerm[scope]) !== null && _a !== void 0 ? _a : {}).length > 0) {
                    permissionsEmpty = false;
                }
            });
        });
        if (permissionsEmpty)
            return 'Missing values for either Resources or Patterns';
    };
    GrantTokenRequest.prototype.parse = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var serviceResponse;
            return __generator(this, function (_a) {
                serviceResponse = this.deserializeResponse(response);
                if (!serviceResponse)
                    throw new PubNubError_1.PubNubError('Service response error, check status for details', (0, PubNubError_1.createValidationError)('Unable to deserialize service response'));
                return [2 /*return*/, serviceResponse.data.token];
            });
        });
    };
    Object.defineProperty(GrantTokenRequest.prototype, "path", {
        get: function () {
            return "/v3/pam/".concat(this.parameters.keySet.subscribeKey, "/grant");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GrantTokenRequest.prototype, "body", {
        get: function () {
            var _this = this;
            var _a = this.parameters, ttl = _a.ttl, meta = _a.meta;
            var body = __assign({}, (ttl || ttl === 0 ? { ttl: ttl } : {}));
            var uuid = this.isVspPermissions(this.parameters)
                ? this.parameters.authorizedUserId
                : this.parameters.authorized_uuid;
            var permissions = {};
            var resourcePermissions = {};
            var patternPermissions = {};
            var mapPermissions = function (name, permissionBit, type, permissions) {
                if (!permissions[type])
                    permissions[type] = {};
                permissions[type][name] = permissionBit;
            };
            var _b = this.parameters, resources = _b.resources, patterns = _b.patterns;
            [resources, patterns].forEach(function (refPerm, idx) {
                var _a, _b, _c, _d, _e;
                var target = idx === 0 ? resourcePermissions : patternPermissions;
                var channelsPermissions = {};
                var channelGroupsPermissions = {};
                var uuidsPermissions = {};
                if (refPerm) {
                    // Check whether working with legacy Objects permissions.
                    if ('spaces' in refPerm || 'users' in refPerm) {
                        channelsPermissions = (_a = refPerm.spaces) !== null && _a !== void 0 ? _a : {};
                        uuidsPermissions = (_b = refPerm.users) !== null && _b !== void 0 ? _b : {};
                    }
                    else if ('channels' in refPerm || 'uuids' in refPerm || 'groups' in refPerm) {
                        channelsPermissions = (_c = refPerm.channels) !== null && _c !== void 0 ? _c : {};
                        channelGroupsPermissions = (_d = refPerm.groups) !== null && _d !== void 0 ? _d : {};
                        uuidsPermissions = (_e = refPerm.uuids) !== null && _e !== void 0 ? _e : {};
                    }
                }
                Object.keys(channelsPermissions).forEach(function (channel) {
                    return mapPermissions(channel, _this.extractPermissions(channelsPermissions[channel]), 'channels', target);
                });
                Object.keys(channelGroupsPermissions).forEach(function (groups) {
                    return mapPermissions(groups, _this.extractPermissions(channelGroupsPermissions[groups]), 'groups', target);
                });
                Object.keys(uuidsPermissions).forEach(function (uuids) {
                    return mapPermissions(uuids, _this.extractPermissions(uuidsPermissions[uuids]), 'uuids', target);
                });
            });
            if (uuid)
                permissions.uuid = "".concat(uuid);
            if (meta)
                permissions.meta = meta;
            body.permissions = permissions;
            return JSON.stringify(body);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Extract permissions bit from permission configuration object.
     *
     * @param permissions - User provided scope-based permissions.
     *
     * @returns Permissions bit.
     */
    GrantTokenRequest.prototype.extractPermissions = function (permissions) {
        var permissionsResult = 0;
        if ('join' in permissions && permissions.join)
            permissionsResult |= 128;
        if ('update' in permissions && permissions.update)
            permissionsResult |= 64;
        if ('get' in permissions && permissions.get)
            permissionsResult |= 32;
        if ('delete' in permissions && permissions.delete)
            permissionsResult |= 8;
        if ('manage' in permissions && permissions.manage)
            permissionsResult |= 4;
        if ('write' in permissions && permissions.write)
            permissionsResult |= 2;
        if ('read' in permissions && permissions.read)
            permissionsResult |= 1;
        return permissionsResult;
    };
    /**
     * Check whether provided parameters is part of legacy VSP access token configuration.
     *
     * @param parameters - Parameters which should be checked.
     *
     * @returns VSP request parameters if it is legacy configuration.
     */
    GrantTokenRequest.prototype.isVspPermissions = function (parameters) {
        var _a, _b, _c, _d;
        return ('authorizedUserId' in parameters ||
            'spaces' in ((_a = parameters.resources) !== null && _a !== void 0 ? _a : {}) ||
            'users' in ((_b = parameters.resources) !== null && _b !== void 0 ? _b : {}) ||
            'spaces' in ((_c = parameters.patterns) !== null && _c !== void 0 ? _c : {}) ||
            'users' in ((_d = parameters.patterns) !== null && _d !== void 0 ? _d : {}));
    };
    return GrantTokenRequest;
}(request_1.AbstractRequest));
exports.GrantTokenRequest = GrantTokenRequest;
