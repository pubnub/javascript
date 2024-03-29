"use strict";
/**
 * PAM Grant REST API module.
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
exports.GrantRequest = void 0;
var PubNubError_1 = require("../../../models/PubNubError");
var request_1 = require("../../components/request");
var operations_1 = __importDefault(require("../../constants/operations"));
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Resources `read` permission.
 */
var READ_PERMISSION = false;
/**
 * Resources `write` permission.
 */
var WRITE_PERMISSION = false;
/**
 * Resources `delete` permission.
 */
var DELETE_PERMISSION = false;
/**
 * Resources `get` permission.
 */
var GET_PERMISSION = false;
/**
 * Resources `update` permission.
 */
var UPDATE_PERMISSION = false;
/**
 * Resources `manage` permission.
 */
var MANAGE_PERMISSION = false;
/**
 * Resources `join` permission.
 */
var JOIN_PERMISSION = false;
// endregion
/**
 * Grant permissions request.
 */
var GrantRequest = /** @class */ (function (_super) {
    __extends(GrantRequest, _super);
    function GrantRequest(parameters) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        var _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        var _this = _super.call(this) || this;
        _this.parameters = parameters;
        // Apply defaults.
        (_a = (_l = _this.parameters).channels) !== null && _a !== void 0 ? _a : (_l.channels = []);
        (_b = (_m = _this.parameters).channelGroups) !== null && _b !== void 0 ? _b : (_m.channelGroups = []);
        (_c = (_o = _this.parameters).uuids) !== null && _c !== void 0 ? _c : (_o.uuids = []);
        (_d = (_p = _this.parameters).read) !== null && _d !== void 0 ? _d : (_p.read = READ_PERMISSION);
        (_e = (_q = _this.parameters).write) !== null && _e !== void 0 ? _e : (_q.write = WRITE_PERMISSION);
        (_f = (_r = _this.parameters).delete) !== null && _f !== void 0 ? _f : (_r.delete = DELETE_PERMISSION);
        (_g = (_s = _this.parameters).get) !== null && _g !== void 0 ? _g : (_s.get = GET_PERMISSION);
        (_h = (_t = _this.parameters).update) !== null && _h !== void 0 ? _h : (_t.update = UPDATE_PERMISSION);
        (_j = (_u = _this.parameters).manage) !== null && _j !== void 0 ? _j : (_u.manage = MANAGE_PERMISSION);
        (_k = (_v = _this.parameters).join) !== null && _k !== void 0 ? _k : (_v.join = JOIN_PERMISSION);
        return _this;
    }
    GrantRequest.prototype.operation = function () {
        return operations_1.default.PNAccessManagerGrant;
    };
    GrantRequest.prototype.validate = function () {
        var _a;
        var _b = this.parameters, _c = _b.keySet, subscribeKey = _c.subscribeKey, publishKey = _c.publishKey, secretKey = _c.secretKey, uuids = _b.uuids, channels = _b.channels, channelGroups = _b.channelGroups;
        if (!subscribeKey)
            return 'Missing Subscribe Key';
        if (!publishKey)
            return 'Missing Publish Key';
        if (!secretKey)
            return 'Missing Secret Key';
        if ((uuids === null || uuids === void 0 ? void 0 : uuids.length) !== 0 && ((_a = this.parameters.authKeys) === null || _a === void 0 ? void 0 : _a.length) === 0)
            return 'authKeys are required for grant request on uuids';
        if ((uuids === null || uuids === void 0 ? void 0 : uuids.length) && ((channels === null || channels === void 0 ? void 0 : channels.length) !== 0 || (channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.length) !== 0))
            return 'Both channel/channel group and uuid cannot be used in the same request';
    };
    GrantRequest.prototype.parse = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var serviceResponse;
            return __generator(this, function (_a) {
                serviceResponse = this.deserializeResponse(response);
                if (!serviceResponse)
                    throw new PubNubError_1.PubNubError('Service response error, check status for details', (0, PubNubError_1.createValidationError)('Unable to deserialize service response'));
                return [2 /*return*/, serviceResponse.payload];
            });
        });
    };
    Object.defineProperty(GrantRequest.prototype, "path", {
        get: function () {
            return "/v2/auth/grant/sub-key/".concat(this.parameters.keySet.subscribeKey);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GrantRequest.prototype, "queryParameters", {
        get: function () {
            var _a = this.parameters, channels = _a.channels, channelGroups = _a.channelGroups, authKeys = _a.authKeys, uuids = _a.uuids, read = _a.read, write = _a.write, manage = _a.manage, del = _a.delete, get = _a.get, join = _a.join, update = _a.update, ttl = _a.ttl;
            return __assign(__assign(__assign(__assign(__assign(__assign({}, (channels && (channels === null || channels === void 0 ? void 0 : channels.length) > 0 ? { channel: channels.join(',') } : {})), (channelGroups && (channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.length) > 0 ? { 'channel-group': channelGroups.join(',') } : {})), (authKeys && (authKeys === null || authKeys === void 0 ? void 0 : authKeys.length) > 0 ? { auth: authKeys.join(',') } : {})), (uuids && (uuids === null || uuids === void 0 ? void 0 : uuids.length) > 0 ? { 'target-uuid': uuids.join(',') } : {})), { r: read ? '1' : '0', w: write ? '1' : '0', m: manage ? '1' : '0', d: del ? '1' : '0', g: get ? '1' : '0', j: join ? '1' : '0', u: update ? '1' : '0' }), (ttl || ttl === 0 ? { ttl: ttl } : {}));
        },
        enumerable: false,
        configurable: true
    });
    return GrantRequest;
}(request_1.AbstractRequest));
exports.GrantRequest = GrantRequest;
