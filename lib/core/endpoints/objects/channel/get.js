"use strict";
/**
 * Get Channel Metadata REST API module.
 *
 * @internal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetChannelMetadataRequest = void 0;
const request_1 = require("../../../components/request");
const operations_1 = __importDefault(require("../../../constants/operations"));
const utils_1 = require("../../../utils");
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether `Channel` custom field should be included by default or not.
 */
const INCLUDE_CUSTOM_FIELDS = true;
// endregion
/**
 * Get Channel Metadata request.
 *
 * @internal
 */
class GetChannelMetadataRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        var _a, _b;
        var _c;
        super();
        this.parameters = parameters;
        // Apply default request parameters.
        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
        (_b = (_c = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_c.customFields = INCLUDE_CUSTOM_FIELDS);
    }
    operation() {
        return operations_1.default.PNGetChannelMetadataOperation;
    }
    validate() {
        if (!this.parameters.channel)
            return 'Channel cannot be empty';
    }
    get path() {
        const { keySet: { subscribeKey }, channel, } = this.parameters;
        return `/v2/objects/${subscribeKey}/channels/${(0, utils_1.encodeString)(channel)}`;
    }
    get queryParameters() {
        return {
            include: ['status', 'type', ...(this.parameters.include.customFields ? ['custom'] : [])].join(','),
        };
    }
}
exports.GetChannelMetadataRequest = GetChannelMetadataRequest;
