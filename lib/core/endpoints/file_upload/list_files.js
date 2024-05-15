"use strict";
/**
 * List Files REST API module.
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
exports.FilesListRequest = void 0;
const pubnub_error_1 = require("../../../errors/pubnub-error");
const pubnub_api_error_1 = require("../../../errors/pubnub-api-error");
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
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse) {
                throw new pubnub_error_1.PubNubError('Service response error, check status for details', (0, pubnub_error_1.createValidationError)('Unable to deserialize service response'));
            }
            else if (serviceResponse.status >= 400)
                throw pubnub_api_error_1.PubNubAPIError.create(response);
            return serviceResponse;
        });
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
