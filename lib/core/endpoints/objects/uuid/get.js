"use strict";
/**
 * Get UUID Metadata REST API module.
 *
 * @internal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUUIDMetadataRequest = void 0;
const request_1 = require("../../../components/request");
const operations_1 = __importDefault(require("../../../constants/operations"));
const utils_1 = require("../../../utils");
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether UUID custom field should be included by default or not.
 */
const INCLUDE_CUSTOM_FIELDS = true;
// endregion
/**
 * Get UUID Metadata request.
 *
 * @internal
 */
class GetUUIDMetadataRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        var _a, _b;
        var _c;
        super();
        this.parameters = parameters;
        // Apply default request parameters.
        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
        (_b = (_c = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_c.customFields = INCLUDE_CUSTOM_FIELDS);
        // Remap for backward compatibility.
        if (this.parameters.userId)
            this.parameters.uuid = this.parameters.userId;
    }
    operation() {
        return operations_1.default.PNGetUUIDMetadataOperation;
    }
    validate() {
        if (!this.parameters.uuid)
            return "'uuid' cannot be empty";
    }
    get path() {
        const { keySet: { subscribeKey }, uuid, } = this.parameters;
        return `/v2/objects/${subscribeKey}/uuids/${(0, utils_1.encodeString)(uuid)}`;
    }
    get queryParameters() {
        const { include } = this.parameters;
        return { include: ['status', 'type', ...(include.customFields ? ['custom'] : [])].join(',') };
    }
}
exports.GetUUIDMetadataRequest = GetUUIDMetadataRequest;
