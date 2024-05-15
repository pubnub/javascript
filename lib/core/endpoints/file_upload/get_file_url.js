"use strict";
/**
 * File sharing REST API module.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFileDownloadUrlRequest = void 0;
const transport_request_1 = require("../../types/transport-request");
const request_1 = require("../../components/request");
const operations_1 = __importDefault(require("../../constants/operations"));
const utils_1 = require("../../utils");
// endregion
/**
 * File download Url generation request.
 *
 * Local request which generates Url to download shared file from the specific channel.
 *
 * @internal
 */
class GetFileDownloadUrlRequest extends request_1.AbstractRequest {
    /**
     * Construct file download Url generation request.
     *
     * @param parameters - Request configuration.
     */
    constructor(parameters) {
        super({ method: transport_request_1.TransportMethod.LOCAL });
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNGetFileUrlOperation;
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
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            return response.url;
        });
    }
    get path() {
        const { channel, id, name, keySet: { subscribeKey }, } = this.parameters;
        return `/v1/files/${subscribeKey}/channels/${(0, utils_1.encodeString)(channel)}/files/${id}/${name}`;
    }
}
exports.GetFileDownloadUrlRequest = GetFileDownloadUrlRequest;
