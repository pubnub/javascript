"use strict";
/**
 * Patch Channel REST API module.
 *
 * Partial update via JSON Patch (RFC 6902).
 * Accepts `add` and `replace` (dot-notation key-value pairs) and `remove`
 * (dot-notation paths) and converts them to JSON Patch operations on the wire.
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
exports.PatchChannelRequest = void 0;
const transport_request_1 = require("../../../types/transport-request");
const request_1 = require("../../../components/request");
const operations_1 = __importDefault(require("../../../constants/operations"));
const data_sync_1 = require("../../../types/api/data-sync");
const utils_1 = require("../../../utils");
// endregion
/**
 * Patch Channel request.
 *
 * @internal
 */
class PatchChannelRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super({ method: transport_request_1.TransportMethod.PATCH });
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNPatchChannelOperation;
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            // The DataSync service returns the object envelope ({ data } or { data, meta }) without a
            // top-level HTTP status; surface `response.status` so callers can inspect it (parity with remove).
            const parsed = this.deserializeResponse(response);
            return Object.assign(Object.assign({}, parsed), { status: response.status });
        });
    }
    validate() {
        if (!this.parameters.id)
            return 'Channel id cannot be empty';
        const hasAdd = this.parameters.add && Object.keys(this.parameters.add).length > 0;
        const hasReplace = this.parameters.replace && Object.keys(this.parameters.replace).length > 0;
        const hasRemove = this.parameters.remove && this.parameters.remove.length > 0;
        if (!hasAdd && !hasReplace && !hasRemove)
            return 'At least one of add, replace, or remove must be provided';
    }
    get headers() {
        var _a;
        let headers = (_a = super.headers) !== null && _a !== void 0 ? _a : {};
        if (this.parameters.ifMatchesEtag)
            headers = Object.assign(Object.assign({}, headers), { 'If-Match': this.parameters.ifMatchesEtag });
        return Object.assign(Object.assign({}, headers), { 'Content-Type': 'application/json-patch+json' });
    }
    get path() {
        const { keySet: { subscribeKey }, id, } = this.parameters;
        return `/v1/datasync/subkeys/${subscribeKey}/channels/${(0, utils_1.encodeString)(id)}`;
    }
    get body() {
        // Prefix all field paths with 'payload.' so users write simple field names
        // and the SDK produces '/payload/<field>' on the wire.
        const prefixWithPayload = (input) => Object.fromEntries(Object.entries(input).map(([key, value]) => [`payload.${key}`, value]));
        const prefixedAdd = this.parameters.add ? prefixWithPayload(this.parameters.add) : undefined;
        const prefixedReplace = this.parameters.replace ? prefixWithPayload(this.parameters.replace) : undefined;
        const prefixedRemove = this.parameters.remove ? this.parameters.remove.map((key) => `payload.${key}`) : undefined;
        // Convert add/replace/remove (dot notation) to JSON Patch operations (JSON Pointer notation).
        const jsonPatchOps = (0, data_sync_1.toJsonPatchOperations)(prefixedAdd, prefixedReplace, prefixedRemove);
        return JSON.stringify(jsonPatchOps);
    }
}
exports.PatchChannelRequest = PatchChannelRequest;
