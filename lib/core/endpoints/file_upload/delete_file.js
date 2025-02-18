"use strict";
/**
 * Delete file REST API module.
 *
 * @internal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteFileRequest = void 0;
const transport_request_1 = require("../../types/transport-request");
const request_1 = require("../../components/request");
const operations_1 = __importDefault(require("../../constants/operations"));
const utils_1 = require("../../utils");
// endregion
/**
 * Delete File request.
 *
 * @internal
 */
class DeleteFileRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super({ method: transport_request_1.TransportMethod.DELETE });
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNDeleteFileOperation;
    }
    validate() {
        const { channel, id, name } = this.parameters;
        if (!channel)
            return "channel can't be empty";
        if (!id)
            return "file id can't be empty";
        if (!name)
            return "file name can't be empty";
    }
    get path() {
        const { keySet: { subscribeKey }, id, channel, name, } = this.parameters;
        return `/v1/files/${subscribeKey}/channels/${(0, utils_1.encodeString)(channel)}/files/${id}/${name}`;
    }
}
exports.DeleteFileRequest = DeleteFileRequest;
