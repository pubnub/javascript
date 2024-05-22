"use strict";
/**
 * PAM Grant Token REST API module.
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
exports.GrantTokenRequest = void 0;
const pubnub_error_1 = require("../../../errors/pubnub-error");
const pubnub_api_error_1 = require("../../../errors/pubnub-api-error");
const transport_request_1 = require("../../types/transport-request");
const request_1 = require("../../components/request");
const operations_1 = __importDefault(require("../../constants/operations"));
// endregion
/**
 * Grant token permissions request.
 *
 * @internal
 */
class GrantTokenRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        var _a, _b;
        var _c, _d;
        super({ method: transport_request_1.TransportMethod.POST });
        this.parameters = parameters;
        // Apply defaults.
        (_a = (_c = this.parameters).resources) !== null && _a !== void 0 ? _a : (_c.resources = {});
        (_b = (_d = this.parameters).patterns) !== null && _b !== void 0 ? _b : (_d.patterns = {});
    }
    operation() {
        return operations_1.default.PNAccessManagerGrantToken;
    }
    validate() {
        var _a, _b, _c, _d, _e, _f;
        const { keySet: { subscribeKey, publishKey, secretKey }, resources, patterns, } = this.parameters;
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
        let permissionsEmpty = true;
        [this.parameters.resources, this.parameters.patterns].forEach((refPerm) => {
            Object.keys(refPerm !== null && refPerm !== void 0 ? refPerm : {}).forEach((scope) => {
                var _a;
                // @ts-expect-error Permissions with backward compatibility.
                if (refPerm && permissionsEmpty && Object.keys((_a = refPerm[scope]) !== null && _a !== void 0 ? _a : {}).length > 0) {
                    permissionsEmpty = false;
                }
            });
        });
        if (permissionsEmpty)
            return 'Missing values for either Resources or Patterns';
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse) {
                throw new pubnub_error_1.PubNubError('Service response error, check status for details', (0, pubnub_error_1.createValidationError)('Unable to deserialize service response'));
            }
            else if (serviceResponse.status >= 400)
                throw pubnub_api_error_1.PubNubAPIError.create(response);
            return serviceResponse.data.token;
        });
    }
    get path() {
        return `/v3/pam/${this.parameters.keySet.subscribeKey}/grant`;
    }
    get headers() {
        return { 'Content-Type': 'application/json' };
    }
    get body() {
        const { ttl, meta } = this.parameters;
        const body = Object.assign({}, (ttl || ttl === 0 ? { ttl } : {}));
        const uuid = this.isVspPermissions(this.parameters)
            ? this.parameters.authorizedUserId
            : this.parameters.authorized_uuid;
        const permissions = {};
        const resourcePermissions = {};
        const patternPermissions = {};
        const mapPermissions = (name, permissionBit, type, permissions) => {
            if (!permissions[type])
                permissions[type] = {};
            permissions[type][name] = permissionBit;
        };
        const { resources, patterns } = this.parameters;
        [resources, patterns].forEach((refPerm, idx) => {
            var _a, _b, _c, _d, _e;
            const target = idx === 0 ? resourcePermissions : patternPermissions;
            let channelsPermissions = {};
            let channelGroupsPermissions = {};
            let uuidsPermissions = {};
            if (!target.channels)
                target.channels = {};
            if (!target.groups)
                target.groups = {};
            if (!target.uuids)
                target.uuids = {};
            // @ts-expect-error Not used, needed for api backward compatibility
            if (!target.users)
                target.users = {};
            // @ts-expect-error Not used, needed for api backward compatibility
            if (!target.spaces)
                target.spaces = {};
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
            Object.keys(channelsPermissions).forEach((channel) => mapPermissions(channel, this.extractPermissions(channelsPermissions[channel]), 'channels', target));
            Object.keys(channelGroupsPermissions).forEach((groups) => mapPermissions(groups, this.extractPermissions(channelGroupsPermissions[groups]), 'groups', target));
            Object.keys(uuidsPermissions).forEach((uuids) => mapPermissions(uuids, this.extractPermissions(uuidsPermissions[uuids]), 'uuids', target));
        });
        if (uuid)
            permissions.uuid = `${uuid}`;
        permissions.resources = resourcePermissions;
        permissions.patterns = patternPermissions;
        permissions.meta = meta !== null && meta !== void 0 ? meta : {};
        body.permissions = permissions;
        return JSON.stringify(body);
    }
    /**
     * Extract permissions bit from permission configuration object.
     *
     * @param permissions - User provided scope-based permissions.
     *
     * @returns Permissions bit.
     */
    extractPermissions(permissions) {
        let permissionsResult = 0;
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
    }
    /**
     * Check whether provided parameters is part of legacy VSP access token configuration.
     *
     * @param parameters - Parameters which should be checked.
     *
     * @returns VSP request parameters if it is legacy configuration.
     */
    isVspPermissions(parameters) {
        var _a, _b, _c, _d;
        return ('authorizedUserId' in parameters ||
            'spaces' in ((_a = parameters.resources) !== null && _a !== void 0 ? _a : {}) ||
            'users' in ((_b = parameters.resources) !== null && _b !== void 0 ? _b : {}) ||
            'spaces' in ((_c = parameters.patterns) !== null && _c !== void 0 ? _c : {}) ||
            'users' in ((_d = parameters.patterns) !== null && _d !== void 0 ? _d : {}));
    }
}
exports.GrantTokenRequest = GrantTokenRequest;
