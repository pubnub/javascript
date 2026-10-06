"use strict";
/**
 * PAM Grant REST API module.
 *
 * @internal
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrantRequest = void 0;
const request_1 = require("../../components/request");
const operations_1 = __importDefault(require("../../constants/operations"));
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Resources `read` permission.
 */
const READ_PERMISSION = false;
/**
 * Resources `write` permission.
 */
const WRITE_PERMISSION = false;
/**
 * Resources `delete` permission.
 */
const DELETE_PERMISSION = false;
/**
 * Resources `get` permission.
 */
const GET_PERMISSION = false;
/**
 * Resources `update` permission.
 */
const UPDATE_PERMISSION = false;
/**
 * Resources `manage` permission.
 */
const MANAGE_PERMISSION = false;
/**
 * Resources `join` permission.
 */
const JOIN_PERMISSION = false;
// endregion
/**
 * Grant permissions request.
 *
 * @internal
 */
class GrantRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        var _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
        super();
        this.parameters = parameters;
        // Apply defaults.
        (_a = (_m = this.parameters).channels) !== null && _a !== void 0 ? _a : (_m.channels = []);
        (_b = (_o = this.parameters).channelGroups) !== null && _b !== void 0 ? _b : (_o.channelGroups = []);
        (_c = (_p = this.parameters).uuids) !== null && _c !== void 0 ? _c : (_p.uuids = []);
        (_d = (_q = this.parameters).categories) !== null && _d !== void 0 ? _d : (_q.categories = []);
        (_e = (_r = this.parameters).read) !== null && _e !== void 0 ? _e : (_r.read = READ_PERMISSION);
        (_f = (_s = this.parameters).write) !== null && _f !== void 0 ? _f : (_s.write = WRITE_PERMISSION);
        (_g = (_t = this.parameters).delete) !== null && _g !== void 0 ? _g : (_t.delete = DELETE_PERMISSION);
        (_h = (_u = this.parameters).get) !== null && _h !== void 0 ? _h : (_u.get = GET_PERMISSION);
        (_j = (_v = this.parameters).update) !== null && _j !== void 0 ? _j : (_v.update = UPDATE_PERMISSION);
        (_k = (_w = this.parameters).manage) !== null && _k !== void 0 ? _k : (_w.manage = MANAGE_PERMISSION);
        (_l = (_x = this.parameters).join) !== null && _l !== void 0 ? _l : (_x.join = JOIN_PERMISSION);
    }
    operation() {
        return operations_1.default.PNAccessManagerGrant;
    }
    validate() {
        const { keySet: { subscribeKey, publishKey, secretKey }, uuids = [], channels = [], channelGroups = [], categories = [], authKeys = [], read, write, manage, delete: del, update, join, get, ttl, } = this.parameters;
        if (!subscribeKey)
            return 'Missing Subscribe Key';
        if (!publishKey)
            return 'Missing Publish Key';
        if (!secretKey)
            return 'Missing Secret Key';
        if (uuids.length !== 0 && authKeys.length === 0)
            return 'authKeys are required for grant request on uuids';
        if (uuids.length && (channels.length !== 0 || channelGroups.length !== 0))
            return 'Both channel/channel group and uuid cannot be used in the same request';
        if (categories.length > 0) {
            if (authKeys.length === 0)
                return 'authKeys are required for grant request on categories';
            if (categories.some((category) => category !== 'channels' && category !== 'uuids'))
                return 'Invalid category: only channels and uuids are supported';
            if (read || write || manage || del || update || join)
                return 'Category permissions must be exactly the get permission';
            if (ttl === 1 && get)
                return 'One-minute category grants are not supported';
        }
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.deserializeResponse(response).payload;
        });
    }
    get path() {
        return `/v2/auth/grant/sub-key/${this.parameters.keySet.subscribeKey}`;
    }
    get queryParameters() {
        const { channels, channelGroups, categories, authKeys, uuids, read, write, manage, delete: del, get, join, update, ttl, } = this.parameters;
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (channels && (channels === null || channels === void 0 ? void 0 : channels.length) > 0 ? { channel: channels.join(',') } : {})), (channelGroups && (channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.length) > 0 ? { 'channel-group': channelGroups.join(',') } : {})), (authKeys && (authKeys === null || authKeys === void 0 ? void 0 : authKeys.length) > 0 ? { auth: authKeys.join(',') } : {})), (uuids && (uuids === null || uuids === void 0 ? void 0 : uuids.length) > 0 ? { 'target-uuid': uuids.join(',') } : {})), (categories && categories.length > 0 ? { category: categories.join(',') } : {})), { r: read ? '1' : '0', w: write ? '1' : '0', m: manage ? '1' : '0', d: del ? '1' : '0', g: get ? '1' : '0', j: join ? '1' : '0', u: update ? '1' : '0' }), (ttl || ttl === 0 ? { ttl } : {}));
    }
}
exports.GrantRequest = GrantRequest;
