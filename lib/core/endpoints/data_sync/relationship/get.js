"use strict";
/**
 * Get Relationship REST API module.
 *
 * @internal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRelationshipRequest = void 0;
const request_1 = require("../../../components/request");
const operations_1 = __importDefault(require("../../../constants/operations"));
const utils_1 = require("../../../utils");
// endregion
/**
 * Get Relationship request.
 *
 * @internal
 */
class GetRelationshipRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super();
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNGetRelationshipOperation;
    }
    validate() {
        if (!this.parameters.id)
            return 'Relationship id cannot be empty';
    }
    get path() {
        const { keySet: { subscribeKey }, id, } = this.parameters;
        return `/subkeys/${subscribeKey}/relationships/${(0, utils_1.encodeString)(id)}`;
    }
}
exports.GetRelationshipRequest = GetRelationshipRequest;
