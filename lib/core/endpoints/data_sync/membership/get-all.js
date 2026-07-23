"use strict";
/**
 * Get All Memberships REST API module.
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
exports.GetAllMembershipsRequest = void 0;
const request_1 = require("../../../components/request");
const operations_1 = __importDefault(require("../../../constants/operations"));
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Default number of items per page.
 */
const DEFAULT_LIMIT = 20;
// endregion
/**
 * Get All Memberships request.
 *
 * @internal
 */
class GetAllMembershipsRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        var _a;
        super();
        this.parameters = parameters;
        // Apply defaults.
        (_a = parameters.limit) !== null && _a !== void 0 ? _a : (parameters.limit = DEFAULT_LIMIT);
    }
    operation() {
        return operations_1.default.PNGetAllMembershipsOperation;
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            // The DataSync service returns the object envelope ({ data } or { data, meta }) without a
            // top-level HTTP status; surface `response.status` so callers can inspect it (parity with remove).
            const parsed = this.deserializeResponse(response);
            return Object.assign(Object.assign({}, parsed), { status: response.status });
        });
    }
    get path() {
        return `/v1/datasync/subkeys/${this.parameters.keySet.subscribeKey}/memberships`;
    }
    get queryParameters() {
        const { userId, channelId, relationshipClassVersion, cursor, limit, filter, sort, filterAdvanced } = this.parameters;
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (userId ? { user_id: userId } : {})), (channelId ? { channel_id: channelId } : {})), (relationshipClassVersion !== undefined ? { relationship_class_version: `${relationshipClassVersion}` } : {})), (cursor ? { cursor } : {})), (limit ? { limit: `${limit}` } : {})), (filter ? { filter } : {})), (sort ? { sort } : {})), (filterAdvanced ? { filter_advanced: filterAdvanced } : {}));
    }
}
exports.GetAllMembershipsRequest = GetAllMembershipsRequest;
