"use strict";
/**
 * Update Entity REST API module.
 *
 * Full resource replacement via PUT.
 * Note: `entityClass` is immutable and cannot be changed via update.
 *
 * @internal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEntityRequest = void 0;
const transport_request_1 = require("../../../types/transport-request");
const request_1 = require("../../../components/request");
const operations_1 = __importDefault(require("../../../constants/operations"));
const utils_1 = require("../../../utils");
// endregion
/**
 * Update Entity request.
 *
 * @internal
 */
class UpdateEntityRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super({ method: transport_request_1.TransportMethod.PUT });
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNUpdateEntityOperation;
    }
    validate() {
        if (!this.parameters.id)
            return 'Entity id cannot be empty';
        if (!this.parameters.entity)
            return 'Entity cannot be empty';
        if (this.parameters.entity.entityClassVersion === undefined || this.parameters.entity.entityClassVersion === null)
            return 'Entity class version cannot be empty';
    }
    get headers() {
        var _a;
        let headers = (_a = super.headers) !== null && _a !== void 0 ? _a : {};
        if (this.parameters.ifMatchesEtag)
            headers = Object.assign(Object.assign({}, headers), { 'If-Match': this.parameters.ifMatchesEtag });
        return Object.assign(Object.assign({}, headers), { 'Content-Type': 'application/vnd.pubnub.objects.entity+json;version=1' });
    }
    get path() {
        const { keySet: { subscribeKey }, id, } = this.parameters;
        return `/subkeys/${subscribeKey}/entities/${(0, utils_1.encodeString)(id)}`;
    }
    get body() {
        return JSON.stringify({ data: this.parameters.entity });
    }
}
exports.UpdateEntityRequest = UpdateEntityRequest;
