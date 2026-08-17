"use strict";
/**
 * Update User REST API module.
 *
 * Partial update via JSON Patch (RFC 6902).
 * Accepts `add`/`replace`/`test` (dot-notation key-value pairs), `remove`
 * (dot-notation paths), and `move`/`copy` (dot-notation `{ from, path }` pairs)
 * and converts them to JSON Patch operations on the wire.
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
exports.UpdateUserRequest = void 0;
const transport_request_1 = require("../../../types/transport-request");
const request_1 = require("../../../components/request");
const operations_1 = __importDefault(require("../../../constants/operations"));
const data_sync_1 = require("../../../types/api/data-sync");
const utils_1 = require("../../../utils");
// endregion
/**
 * Update User request.
 *
 * @internal
 */
class UpdateUserRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super({ method: transport_request_1.TransportMethod.PATCH });
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNUpdateDataSyncUserOperation;
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
            return 'User id cannot be empty';
        const { add, replace, remove, move, copy, test } = this.parameters;
        const hasAdd = add && Object.keys(add).length > 0;
        const hasReplace = replace && Object.keys(replace).length > 0;
        const hasRemove = remove && remove.length > 0;
        const hasMove = move && move.length > 0;
        const hasCopy = copy && copy.length > 0;
        const hasTest = test && Object.keys(test).length > 0;
        if (!hasAdd && !hasReplace && !hasRemove && !hasMove && !hasCopy && !hasTest)
            return 'At least one of add, replace, remove, move, copy, or test must be provided';
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
        return `/v1/datasync/subkeys/${subscribeKey}/users/${(0, utils_1.encodeString)(id)}`;
    }
    get body() {
        const { add, replace, remove, move, copy, test } = this.parameters;
        // Paths are used exactly as provided by the caller (dot notation -> JSON Pointer). The SDK
        const jsonPatchOps = (0, data_sync_1.toJsonPatchOperations)({ add, replace, remove, move, copy, test });
        return JSON.stringify(jsonPatchOps);
    }
}
exports.UpdateUserRequest = UpdateUserRequest;
