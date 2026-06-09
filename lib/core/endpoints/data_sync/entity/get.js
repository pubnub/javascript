"use strict";
/**
 * Get Entity REST API module.
 *
 * @internal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetEntityRequest = void 0;
const request_1 = require("../../../components/request");
const operations_1 = __importDefault(require("../../../constants/operations"));
const utils_1 = require("../../../utils");
// endregion
/**
 * Get Entity request.
 *
 * @internal
 */
class GetEntityRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super();
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNGetEntityOperation;
    }
    validate() {
        if (!this.parameters.id)
            return 'Entity id cannot be empty';
    }
    get path() {
        const { keySet: { subscribeKey }, id, } = this.parameters;
        return `/subkeys/${subscribeKey}/entities/${(0, utils_1.encodeString)(id)}`;
    }
}
exports.GetEntityRequest = GetEntityRequest;
