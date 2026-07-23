"use strict";
/**
 * Create Membership REST API module.
 *
 * @internal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMembershipRequest = void 0;
const transport_request_1 = require("../../../types/transport-request");
const request_1 = require("../../../components/request");
const operations_1 = __importDefault(require("../../../constants/operations"));
// endregion
/**
 * Create Membership request.
 *
 * @internal
 */
class CreateMembershipRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super({ method: transport_request_1.TransportMethod.POST });
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNCreateMembershipOperation;
    }
    validate() {
        if (!this.parameters.membership)
            return 'Membership cannot be empty';
        if (!this.parameters.membership.userId)
            return 'User id cannot be empty';
        if (!this.parameters.membership.channelId)
            return 'Channel id cannot be empty';
        if (!this.parameters.membership.relationshipClassVersion)
            return 'Relationship class version cannot be empty';
    }
    get headers() {
        var _a;
        const headers = (_a = super.headers) !== null && _a !== void 0 ? _a : {};
        return Object.assign(Object.assign({}, headers), { 'Content-Type': 'application/vnd.pubnub.objects.membership+json;version=1' });
    }
    get path() {
        const { keySet: { subscribeKey }, } = this.parameters;
        return `/v1/datasync/subkeys/${subscribeKey}/memberships`;
    }
    get body() {
        return JSON.stringify({ data: this.parameters.membership });
    }
}
exports.CreateMembershipRequest = CreateMembershipRequest;
