"use strict";
/**
 * PubNub Access Token Manager module.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenManager = void 0;
// endregion
/**
 * REST API access token manager.
 *
 * Manager maintains active access token and let parse it to get information about permissions.
 *
 * @internal
 */
class TokenManager {
    constructor(cbor) {
        this.cbor = cbor;
    }
    /**
     * Update REST API access token.
     *
     * **Note:** Token will be applied only for next requests and won't affect ongoing requests.
     *
     * @param [token] - Access token which should be used to access PubNub REST API.
     */
    setToken(token) {
        if (token && token.length > 0)
            this.token = token;
        else
            this.token = undefined;
    }
    /**
     * REST API access token.
     *
     * @returns Previously configured REST API access token.
     */
    getToken() {
        return this.token;
    }
    /**
     * Parse Base64-encoded access token.
     *
     * @param tokenString - Base64-encoded access token.
     *
     * @returns Information about resources and permissions which has been granted for them.
     */
    parseToken(tokenString) {
        const parsed = this.cbor.decodeToken(tokenString);
        if (parsed !== undefined) {
            const uuidResourcePermissions = parsed.res.uuid ? Object.keys(parsed.res.uuid) : [];
            const channelResourcePermissions = Object.keys(parsed.res.chan);
            const groupResourcePermissions = Object.keys(parsed.res.grp);
            const uuidPatternPermissions = parsed.pat.uuid ? Object.keys(parsed.pat.uuid) : [];
            const channelPatternPermissions = Object.keys(parsed.pat.chan);
            const groupPatternPermissions = Object.keys(parsed.pat.grp);
            const result = {
                version: parsed.v,
                timestamp: parsed.t,
                ttl: parsed.ttl,
                authorized_uuid: parsed.uuid,
                signature: parsed.sig,
            };
            const uuidResources = uuidResourcePermissions.length > 0;
            const channelResources = channelResourcePermissions.length > 0;
            const groupResources = groupResourcePermissions.length > 0;
            if (uuidResources || channelResources || groupResources) {
                result.resources = {};
                if (uuidResources) {
                    const uuids = (result.resources.uuids = {});
                    uuidResourcePermissions.forEach((id) => (uuids[id] = this.extractPermissions(parsed.res.uuid[id])));
                }
                if (channelResources) {
                    const channels = (result.resources.channels = {});
                    channelResourcePermissions.forEach((id) => (channels[id] = this.extractPermissions(parsed.res.chan[id])));
                }
                if (groupResources) {
                    const groups = (result.resources.groups = {});
                    groupResourcePermissions.forEach((id) => (groups[id] = this.extractPermissions(parsed.res.grp[id])));
                }
            }
            const uuidPatterns = uuidPatternPermissions.length > 0;
            const channelPatterns = channelPatternPermissions.length > 0;
            const groupPatterns = groupPatternPermissions.length > 0;
            if (uuidPatterns || channelPatterns || groupPatterns) {
                result.patterns = {};
                if (uuidPatterns) {
                    const uuids = (result.patterns.uuids = {});
                    uuidPatternPermissions.forEach((id) => (uuids[id] = this.extractPermissions(parsed.pat.uuid[id])));
                }
                if (channelPatterns) {
                    const channels = (result.patterns.channels = {});
                    channelPatternPermissions.forEach((id) => (channels[id] = this.extractPermissions(parsed.pat.chan[id])));
                }
                if (groupPatterns) {
                    const groups = (result.patterns.groups = {});
                    groupPatternPermissions.forEach((id) => (groups[id] = this.extractPermissions(parsed.pat.grp[id])));
                }
            }
            if (parsed.meta && Object.keys(parsed.meta).length > 0)
                result.meta = parsed.meta;
            return result;
        }
        return undefined;
    }
    /**
     * Extract resource access permission information.
     *
     * @param permissions - Bit-encoded resource permissions.
     *
     * @returns Human-readable resource permissions.
     */
    extractPermissions(permissions) {
        const permissionsResult = {
            read: false,
            write: false,
            manage: false,
            delete: false,
            get: false,
            update: false,
            join: false,
        };
        if ((permissions & 128) === 128)
            permissionsResult.join = true;
        if ((permissions & 64) === 64)
            permissionsResult.update = true;
        if ((permissions & 32) === 32)
            permissionsResult.get = true;
        if ((permissions & 8) === 8)
            permissionsResult.delete = true;
        if ((permissions & 4) === 4)
            permissionsResult.manage = true;
        if ((permissions & 2) === 2)
            permissionsResult.write = true;
        if ((permissions & 1) === 1)
            permissionsResult.read = true;
        return permissionsResult;
    }
}
exports.TokenManager = TokenManager;
