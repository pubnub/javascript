"use strict";
/**
 * PAM Grant Token REST API module.
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
exports.GrantTokenRequest = void 0;
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
        const { keySet: { subscribeKey, publishKey, secretKey }, resources, patterns, } = this.parameters;
        // DataSync projections are a standalone grant target — a request carrying only projections
        // (no resources / patterns permissions) is still valid.
        const hasProjections = this.buildProjections() !== undefined;
        if (!subscribeKey)
            return 'Missing Subscribe Key';
        if (!publishKey)
            return 'Missing Publish Key';
        if (!secretKey)
            return 'Missing Secret Key';
        if (!resources && !patterns && !hasProjections)
            return 'Missing either Resources or Patterns';
        // A grant may not carry two synonyms for the same target: `users` / `uuids` both map to the
        // uuid wire scope, `spaces` / `channels` both map to the channel wire scope, and
        // `authorizedUserId` / `authorized_uuid` both name the principal. Everything else combines
        // freely, so a single token can grant DataSync `users`, `channels`, `groups`, and `dataSync`
        // together. `uuids` / `spaces` / `authorized_uuid` are the deprecated App Context terminology;
        // prefer `users` / `channels` / `authorizedUserId`.
        const hasScope = (scope) => { var _a, _b; return scope in ((_a = this.parameters.resources) !== null && _a !== void 0 ? _a : {}) || scope in ((_b = this.parameters.patterns) !== null && _b !== void 0 ? _b : {}); };
        if (hasScope('users') && hasScope('uuids'))
            return 'Cannot mix `users` with `uuids` — `uuids` is deprecated App Context terminology; use `users`';
        if (hasScope('spaces') && hasScope('channels'))
            return 'Cannot mix `spaces` with `channels` — `spaces` is deprecated terminology; use `channels`';
        if ('authorizedUserId' in this.parameters && 'authorized_uuid' in this.parameters)
            return 'Cannot mix `authorizedUserId` with `authorized_uuid` — use `authorizedUserId`';
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
        if (permissionsEmpty && !hasProjections)
            return 'Missing values for either Resources or Patterns';
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.deserializeResponse(response).data.token;
        });
    }
    get path() {
        return `/v3/pam/${this.parameters.keySet.subscribeKey}/grant`;
    }
    get headers() {
        var _a;
        return Object.assign(Object.assign({}, ((_a = super.headers) !== null && _a !== void 0 ? _a : {})), { 'Content-Type': 'application/json' });
    }
    get body() {
        var _a;
        const { ttl, meta } = this.parameters;
        const body = Object.assign({}, (ttl || ttl === 0 ? { ttl } : {}));
        // `authorizedUserId` is the preferred User-terminology principal; `authorized_uuid` is the
        // legacy App Context name. Either binds the token to a single principal.
        const uuid = (_a = ('authorizedUserId' in this.parameters ? this.parameters.authorizedUserId : undefined)) !== null && _a !== void 0 ? _a : ('authorized_uuid' in this.parameters ? this.parameters.authorized_uuid : undefined);
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
            let usersPermissions = {};
            if (!target.channels)
                target.channels = {};
            if (!target.groups)
                target.groups = {};
            if (!target.uuids)
                target.uuids = {};
            if (!target.users)
                target.users = {};
            // @ts-expect-error Not used, needed for api backward compatibility
            if (!target.spaces)
                target.spaces = {};
            if (refPerm) {
                // `spaces` (deprecated) still collapses onto the channel wire scope. `users` and `uuids`
                // are distinct wire keys: `users` maps to `users`, `uuids` maps to `uuids`. Validation
                // already rejects providing both members of a synonym pair. `spaces` is read intentionally
                // as the legacy fallback for channels.
                const legacyRefPerm = refPerm;
                channelsPermissions =
                    'channels' in legacyRefPerm
                        ? ((_a = legacyRefPerm.channels) !== null && _a !== void 0 ? _a : {})
                        : 'spaces' in legacyRefPerm
                            ? ((_b = legacyRefPerm.spaces) !== null && _b !== void 0 ? _b : {})
                            : {};
                channelGroupsPermissions = 'groups' in legacyRefPerm ? ((_c = legacyRefPerm.groups) !== null && _c !== void 0 ? _c : {}) : {};
                uuidsPermissions = 'uuids' in legacyRefPerm ? ((_d = legacyRefPerm.uuids) !== null && _d !== void 0 ? _d : {}) : {};
                usersPermissions = 'users' in legacyRefPerm ? ((_e = legacyRefPerm.users) !== null && _e !== void 0 ? _e : {}) : {};
            }
            Object.keys(channelsPermissions).forEach((channel) => mapPermissions(channel, this.extractPermissions(channelsPermissions[channel]), 'channels', target));
            Object.keys(channelGroupsPermissions).forEach((groups) => mapPermissions(groups, this.extractPermissions(channelGroupsPermissions[groups]), 'groups', target));
            Object.keys(uuidsPermissions).forEach((uuids) => mapPermissions(uuids, this.extractPermissions(uuidsPermissions[uuids]), 'uuids', target));
            Object.keys(usersPermissions).forEach((users) => mapPermissions(users, this.extractPermissions(usersPermissions[users]), 'users', target));
            if (refPerm && 'dataSync' in refPerm)
                this.mapDataSyncPermissions(refPerm.dataSync, target, mapPermissions);
        });
        if (uuid)
            permissions.uuid = `${uuid}`;
        permissions.resources = resourcePermissions;
        permissions.patterns = patternPermissions;
        // Merge DataSync projections into `meta` under `pn-projections`, preserving user-supplied meta.
        // `pn-projections` is omitted entirely when no projections are set.
        const projections = this.buildProjections();
        permissions.meta = Object.assign(Object.assign({}, (meta !== null && meta !== void 0 ? meta : {})), (projections ? { 'pn-projections': projections } : {}));
        body.permissions = permissions;
        return JSON.stringify(body);
    }
    /**
     * Serialize DataSync entity-level permissions into a resources / patterns target.
     *
     * The `datasync:*` wire keys are only written when their scope map is non-empty, so tokens that
     * don't use DataSync stay byte-for-byte identical.
     *
     * @param dataSync - User provided DataSync permission scopes.
     * @param target - Resources or patterns payload to populate.
     * @param mapPermissions - Helper which writes a single bit-encoded permission into the target.
     */
    mapDataSyncPermissions(dataSync, target, mapPermissions) {
        if (!dataSync)
            return;
        const dataSyncScopes = [
            ['entities', 'datasync:entities'],
            ['relationships', 'datasync:relationships'],
            ['memberships', 'datasync:memberships'],
        ];
        dataSyncScopes.forEach(([scope, wireKey]) => {
            const scopePermissions = dataSync[scope];
            if (!scopePermissions)
                return;
            Object.keys(scopePermissions).forEach((id) => mapPermissions(id, this.extractPermissions(scopePermissions[id]), wireKey, target));
        });
    }
    /**
     * Build the `pn-projections` meta payload from DataSync projection parameters.
     *
     * Each projection scope is encoded into a flat composite key (`datasync:<type>:<id>`) mapped to
     * the projection name. The `res` / `pat` sub-objects are omitted when empty.
     *
     * @returns Encoded projections payload, or `undefined` when no projections are set.
     */
    buildProjections() {
        const projections = 'dataSyncProjections' in this.parameters ? this.parameters.dataSyncProjections : undefined;
        if (!projections)
            return undefined;
        const encodeScope = (scope) => {
            const encoded = {};
            if (!scope)
                return encoded;
            ['entities', 'relationships', 'memberships'].forEach((type) => {
                const assignments = scope[type];
                if (assignments)
                    Object.keys(assignments).forEach((id) => (encoded[`datasync:${type}:${id}`] = assignments[id]));
            });
            return encoded;
        };
        const result = {};
        const res = encodeScope(projections.resources);
        const pat = encodeScope(projections.patterns);
        if (Object.keys(res).length > 0)
            result.res = res;
        if (Object.keys(pat).length > 0)
            result.pat = pat;
        return Object.keys(result).length > 0 ? result : undefined;
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
        if ('create' in permissions && permissions.create)
            permissionsResult |= 16;
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
}
exports.GrantTokenRequest = GrantTokenRequest;
