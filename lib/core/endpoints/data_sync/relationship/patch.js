"use strict";
/**
 * Patch Relationship REST API module.
 *
 * Partial update via JSON Patch (RFC 6902).
 * Accepts `set` (dot-notation key-value pairs) and `remove` (dot-notation paths)
 * and converts them to JSON Patch operations on the wire.
 *
 * @internal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatchRelationshipRequest = void 0;
const transport_request_1 = require("../../../types/transport-request");
const request_1 = require("../../../components/request");
const operations_1 = __importDefault(require("../../../constants/operations"));
const data_sync_1 = require("../../../types/api/data-sync");
const utils_1 = require("../../../utils");
// endregion
/**
 * Patch Relationship request.
 *
 * @internal
 */
class PatchRelationshipRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super({ method: transport_request_1.TransportMethod.PATCH });
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNPatchRelationshipOperation;
    }
    validate() {
        if (!this.parameters.id)
            return 'Relationship id cannot be empty';
        const hasSet = this.parameters.set && Object.keys(this.parameters.set).length > 0;
        const hasRemove = this.parameters.remove && this.parameters.remove.length > 0;
        if (!hasSet && !hasRemove)
            return 'At least one of set or remove must be provided';
    }
    get headers() {
        var _a;
        let headers = (_a = super.headers) !== null && _a !== void 0 ? _a : {};
        if (this.parameters.ifMatchesEtag)
            headers = Object.assign(Object.assign({}, headers), { 'If-Match': this.parameters.ifMatchesEtag });
        if (this.parameters.idempotencyKey)
            headers = Object.assign(Object.assign({}, headers), { 'Idempotency-Key': this.parameters.idempotencyKey });
        return Object.assign(Object.assign({}, headers), { 'Content-Type': 'application/json-patch+json' });
    }
    get path() {
        const { keySet: { subscribeKey }, id, } = this.parameters;
        return `/subkeys/${subscribeKey}/relationships/${(0, utils_1.encodeString)(id)}`;
    }
    get body() {
        // Prefix all field paths with 'payload.' so users write simple field names
        // (e.g., 'role') and the SDK produces '/payload/role' on the wire.
        const prefixedSet = this.parameters.set
            ? Object.fromEntries(Object.entries(this.parameters.set).map(([key, value]) => [`payload.${key}`, value]))
            : undefined;
        const prefixedRemove = this.parameters.remove ? this.parameters.remove.map((key) => `payload.${key}`) : undefined;
        // Convert set/remove (dot notation) to JSON Patch operations (JSON Pointer notation).
        const jsonPatchOps = (0, data_sync_1.toJsonPatchOperations)(prefixedSet, prefixedRemove);
        return JSON.stringify(jsonPatchOps);
    }
}
exports.PatchRelationshipRequest = PatchRelationshipRequest;
