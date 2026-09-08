"use strict";
/**
 * Get Membership REST API module.
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
exports.GetMembershipRequest = void 0;
const request_1 = require("../../../components/request");
const operations_1 = __importDefault(require("../../../constants/operations"));
const utils_1 = require("../../../utils");
// endregion
/**
 * Get Membership request.
 *
 * @internal
 */
class GetMembershipRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super();
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNGetDataSyncMembershipOperation;
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
            return 'Membership id cannot be empty';
    }
    get path() {
        const { keySet: { subscribeKey }, id, } = this.parameters;
        return `/v1/datasync/subkeys/${subscribeKey}/memberships/${(0, utils_1.encodeString)(id)}`;
    }
}
exports.GetMembershipRequest = GetMembershipRequest;
