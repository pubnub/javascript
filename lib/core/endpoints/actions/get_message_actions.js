"use strict";
/**
 * Get Message Actions REST API module.
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
exports.GetMessageActionsRequest = void 0;
const pubnub_error_1 = require("../../../errors/pubnub-error");
const pubnub_api_error_1 = require("../../../errors/pubnub-api-error");
const request_1 = require("../../components/request");
const operations_1 = __importDefault(require("../../constants/operations"));
const utils_1 = require("../../utils");
// endregion
/**
 * Fetch channel message actions request.
 *
 * @internal
 */
class GetMessageActionsRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super();
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNGetMessageActionsOperation;
    }
    validate() {
        if (!this.parameters.keySet.subscribeKey)
            return 'Missing Subscribe Key';
        if (!this.parameters.channel)
            return 'Missing message channel';
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse) {
                throw new pubnub_error_1.PubNubError('Service response error, check status for details', (0, pubnub_error_1.createValidationError)('Unable to deserialize service response'));
            }
            else if (serviceResponse.status >= 400)
                throw pubnub_api_error_1.PubNubAPIError.create(response);
            let start = null;
            let end = null;
            if (serviceResponse.data.length > 0) {
                start = serviceResponse.data[0].actionTimetoken;
                end = serviceResponse.data[serviceResponse.data.length - 1].actionTimetoken;
            }
            return {
                data: serviceResponse.data,
                more: serviceResponse.more,
                start,
                end,
            };
        });
    }
    get path() {
        const { keySet: { subscribeKey }, channel, } = this.parameters;
        return `/v1/message-actions/${subscribeKey}/channel/${(0, utils_1.encodeString)(channel)}`;
    }
    get queryParameters() {
        const { limit, start, end } = this.parameters;
        return Object.assign(Object.assign(Object.assign({}, (start ? { start } : {})), (end ? { end } : {})), (limit ? { limit } : {}));
    }
}
exports.GetMessageActionsRequest = GetMessageActionsRequest;
