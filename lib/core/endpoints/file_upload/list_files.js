"use strict";
/**
 * List Files REST API module.
 *
 * @internal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesListRequest = void 0;
const request_1 = require("../../components/request");
const operations_1 = __importDefault(require("../../constants/operations"));
const utils_1 = require("../../utils");
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Number of files to return in response.
 */
const LIMIT = 100;
// endregion
/**
 * Files List request.
 *
 * @internal
 */
class FilesListRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        var _a;
        var _b;
        super();
        this.parameters = parameters;
        // Apply default request parameters.
        (_a = (_b = this.parameters).limit) !== null && _a !== void 0 ? _a : (_b.limit = LIMIT);
    }
    operation() {
        return operations_1.default.PNListFilesOperation;
    }
    validate() {
        if (!this.parameters.channel)
            return "channel can't be empty";
    }
    get path() {
        const { keySet: { subscribeKey }, channel, } = this.parameters;
        return `/v1/files/${subscribeKey}/channels/${(0, utils_1.encodeString)(channel)}/files`;
    }
    get queryParameters() {
        const { limit, next } = this.parameters;
        return Object.assign({ limit: limit }, (next ? { next } : {}));
    }
}
exports.FilesListRequest = FilesListRequest;
