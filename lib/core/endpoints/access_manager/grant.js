"use strict";
/**
 * PAM Grant REST API module.
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
const pubnub_error_1 = require("../../../errors/pubnub-error");
const pubnub_api_error_1 = require("../../../errors/pubnub-api-error");
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        var _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        super();
        this.parameters = parameters;
        // Apply defaults.
        (_a = (_l = this.parameters).channels) !== null && _a !== void 0 ? _a : (_l.channels = []);
        (_b = (_m = this.parameters).channelGroups) !== null && _b !== void 0 ? _b : (_m.channelGroups = []);
        (_c = (_o = this.parameters).uuids) !== null && _c !== void 0 ? _c : (_o.uuids = []);
        (_d = (_p = this.parameters).read) !== null && _d !== void 0 ? _d : (_p.read = READ_PERMISSION);
        (_e = (_q = this.parameters).write) !== null && _e !== void 0 ? _e : (_q.write = WRITE_PERMISSION);
        (_f = (_r = this.parameters).delete) !== null && _f !== void 0 ? _f : (_r.delete = DELETE_PERMISSION);
        (_g = (_s = this.parameters).get) !== null && _g !== void 0 ? _g : (_s.get = GET_PERMISSION);
        (_h = (_t = this.parameters).update) !== null && _h !== void 0 ? _h : (_t.update = UPDATE_PERMISSION);
        (_j = (_u = this.parameters).manage) !== null && _j !== void 0 ? _j : (_u.manage = MANAGE_PERMISSION);
        (_k = (_v = this.parameters).join) !== null && _k !== void 0 ? _k : (_v.join = JOIN_PERMISSION);
    }
    operation() {
        return operations_1.default.PNAccessManagerGrant;
    }
    validate() {
        const { keySet: { subscribeKey, publishKey, secretKey }, uuids = [], channels = [], channelGroups = [], authKeys = [], } = this.parameters;
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
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse) {
                throw new pubnub_error_1.PubNubError('Service response error, check status for details', (0, pubnub_error_1.createValidationError)('Unable to deserialize service response'));
            }
            else if (serviceResponse.status >= 400)
                throw pubnub_api_error_1.PubNubAPIError.create(response);
            return serviceResponse.payload;
        });
    }
    get path() {
        return `/v2/auth/grant/sub-key/${this.parameters.keySet.subscribeKey}`;
    }
    get queryParameters() {
        const { channels, channelGroups, authKeys, uuids, read, write, manage, delete: del, get, join, update, ttl, } = this.parameters;
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (channels && (channels === null || channels === void 0 ? void 0 : channels.length) > 0 ? { channel: channels.join(',') } : {})), (channelGroups && (channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.length) > 0 ? { 'channel-group': channelGroups.join(',') } : {})), (authKeys && (authKeys === null || authKeys === void 0 ? void 0 : authKeys.length) > 0 ? { auth: authKeys.join(',') } : {})), (uuids && (uuids === null || uuids === void 0 ? void 0 : uuids.length) > 0 ? { 'target-uuid': uuids.join(',') } : {})), { r: read ? '1' : '0', w: write ? '1' : '0', m: manage ? '1' : '0', d: del ? '1' : '0', g: get ? '1' : '0', j: join ? '1' : '0', u: update ? '1' : '0' }), (ttl || ttl === 0 ? { ttl } : {}));
    }
}
exports.GrantRequest = GrantRequest;
