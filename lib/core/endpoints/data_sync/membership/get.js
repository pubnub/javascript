"use strict";
/**
 * Get Membership REST API module.
 *
 * @internal
 */
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
        return operations_1.default.PNGetMembershipOperation;
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
