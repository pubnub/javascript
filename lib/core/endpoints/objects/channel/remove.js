"use strict";
/**
 * Remove Channel Metadata REST API module.
 *
 * @internal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveChannelMetadataRequest = void 0;
const transport_request_1 = require("../../../types/transport-request");
const request_1 = require("../../../components/request");
const operations_1 = __importDefault(require("../../../constants/operations"));
const utils_1 = require("../../../utils");
// endregion
/**
 * Remove Channel Metadata request.
 *
 * @internal
 */
class RemoveChannelMetadataRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super({ method: transport_request_1.TransportMethod.DELETE });
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNRemoveChannelMetadataOperation;
    }
    validate() {
        if (!this.parameters.channel)
            return 'Channel cannot be empty';
    }
    get path() {
        const { keySet: { subscribeKey }, channel, } = this.parameters;
        return `/v2/objects/${subscribeKey}/channels/${(0, utils_1.encodeString)(channel)}`;
    }
}
exports.RemoveChannelMetadataRequest = RemoveChannelMetadataRequest;
