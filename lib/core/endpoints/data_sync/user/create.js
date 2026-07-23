"use strict";
/**
 * Create User REST API module.
 *
 * @internal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserRequest = void 0;
const transport_request_1 = require("../../../types/transport-request");
const request_1 = require("../../../components/request");
const operations_1 = __importDefault(require("../../../constants/operations"));
// endregion
/**
 * Create User request.
 *
 * @internal
 */
class CreateUserRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super({ method: transport_request_1.TransportMethod.POST });
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNCreateUserOperation;
    }
    validate() {
        if (!this.parameters.user)
            return 'User cannot be empty';
        if (this.parameters.user.entityClassVersion === undefined || this.parameters.user.entityClassVersion === null)
            return 'Entity class version cannot be empty';
    }
    get headers() {
        var _a;
        const headers = (_a = super.headers) !== null && _a !== void 0 ? _a : {};
        return Object.assign(Object.assign({}, headers), { 'Content-Type': 'application/vnd.pubnub.objects.user+json;version=1' });
    }
    get path() {
        const { keySet: { subscribeKey }, } = this.parameters;
        return `/v1/datasync/subkeys/${subscribeKey}/users`;
    }
    get body() {
        return JSON.stringify({ data: this.parameters.user });
    }
}
exports.CreateUserRequest = CreateUserRequest;
