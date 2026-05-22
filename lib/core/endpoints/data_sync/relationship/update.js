"use strict";
/**
 * Update Relationship REST API module.
 *
 * Full resource replacement via PUT.
 *
 * @internal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRelationshipRequest = void 0;
const transport_request_1 = require("../../../types/transport-request");
const request_1 = require("../../../components/request");
const operations_1 = __importDefault(require("../../../constants/operations"));
const utils_1 = require("../../../utils");
// endregion
/**
 * Update Relationship request.
 *
 * @internal
 */
class UpdateRelationshipRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super({ method: transport_request_1.TransportMethod.PUT });
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNUpdateRelationshipOperation;
    }
    validate() {
        if (!this.parameters.id)
            return 'Relationship id cannot be empty';
        if (!this.parameters.relationship)
            return 'Relationship cannot be empty';
        if (!this.parameters.relationship.entityAId)
            return 'Entity A id cannot be empty';
        if (!this.parameters.relationship.entityBId)
            return 'Entity B id cannot be empty';
    }
    get headers() {
        var _a;
        let headers = (_a = super.headers) !== null && _a !== void 0 ? _a : {};
        if (this.parameters.ifMatchesEtag)
            headers = Object.assign(Object.assign({}, headers), { 'If-Match': this.parameters.ifMatchesEtag });
        return Object.assign(Object.assign({}, headers), { 'Content-Type': 'application/vnd.pubnub.objects.relationship+json;version=1' });
    }
    get path() {
        const { keySet: { subscribeKey }, id, } = this.parameters;
        return `/subkeys/${subscribeKey}/relationships/${(0, utils_1.encodeString)(id)}`;
    }
    get body() {
        return JSON.stringify({ data: this.parameters.relationship });
    }
}
exports.UpdateRelationshipRequest = UpdateRelationshipRequest;
