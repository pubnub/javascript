"use strict";
/**
 * Add Message Action REST API module.
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
exports.AddMessageActionRequest = void 0;
const pubnub_error_1 = require("../../../errors/pubnub-error");
const pubnub_api_error_1 = require("../../../errors/pubnub-api-error");
const transport_request_1 = require("../../types/transport-request");
const request_1 = require("../../components/request");
const operations_1 = __importDefault(require("../../constants/operations"));
const utils_1 = require("../../utils");
// endregion
/**
 * Add Message Reaction request.
 *
 * @internal
 */
class AddMessageActionRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super({ method: transport_request_1.TransportMethod.POST });
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNAddMessageActionOperation;
    }
    validate() {
        const { keySet: { subscribeKey }, action, channel, messageTimetoken, } = this.parameters;
        if (!subscribeKey)
            return 'Missing Subscribe Key';
        if (!channel)
            return 'Missing message channel';
        if (!messageTimetoken)
            return 'Missing message timetoken';
        if (!action)
            return 'Missing Action';
        if (!action.value)
            return 'Missing Action.value';
        if (!action.type)
            return 'Missing Action.type';
        if (action.type.length > 15)
            return 'Action.type value exceed maximum length of 15';
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse) {
                throw new pubnub_error_1.PubNubError('Service response error, check status for details', (0, pubnub_error_1.createValidationError)('Unable to deserialize service response'));
            }
            else if (serviceResponse.status >= 400)
                throw pubnub_api_error_1.PubNubAPIError.create(response);
            return { data: serviceResponse.data };
        });
    }
    get path() {
        const { keySet: { subscribeKey }, channel, messageTimetoken, } = this.parameters;
        return `/v1/message-actions/${subscribeKey}/channel/${(0, utils_1.encodeString)(channel)}/message/${messageTimetoken}`;
    }
    get headers() {
        return { 'Content-Type': 'application/json' };
    }
    get body() {
        return JSON.stringify(this.parameters.action);
    }
}
exports.AddMessageActionRequest = AddMessageActionRequest;
