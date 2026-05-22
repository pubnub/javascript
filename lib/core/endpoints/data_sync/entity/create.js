"use strict";
/**
 * Create Entity REST API module.
 *
 * @internal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEntityRequest = void 0;
const transport_request_1 = require("../../../types/transport-request");
const request_1 = require("../../../components/request");
const operations_1 = __importDefault(require("../../../constants/operations"));
// endregion
/**
 * Create Entity request.
 *
 * @internal
 */
class CreateEntityRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super({ method: transport_request_1.TransportMethod.POST });
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNCreateEntityOperation;
    }
    validate() {
        if (!this.parameters.entity)
            return 'Entity cannot be empty';
        if (!this.parameters.entity.entityClass)
            return 'Entity class cannot be empty';
        if (this.parameters.entity.entityClassVersion === undefined || this.parameters.entity.entityClassVersion === null)
            return 'Entity class version cannot be empty';
    }
    get headers() {
        var _a;
        let headers = (_a = super.headers) !== null && _a !== void 0 ? _a : {};
        if (this.parameters.idempotencyKey)
            headers = Object.assign(Object.assign({}, headers), { 'Idempotency-Key': this.parameters.idempotencyKey });
        return Object.assign(Object.assign({}, headers), { 'Content-Type': 'application/vnd.pubnub.objects.entity+json;version=1' });
    }
    get path() {
        const { keySet: { subscribeKey }, } = this.parameters;
        return `/subkeys/${subscribeKey}/entities`;
    }
    get body() {
        return JSON.stringify({ data: this.parameters.entity });
    }
}
exports.CreateEntityRequest = CreateEntityRequest;
