"use strict";
/**
 * Signal REST API module.
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
exports.SignalRequest = void 0;
const pubnub_error_1 = require("../../errors/pubnub-error");
const request_1 = require("../components/request");
const operations_1 = __importDefault(require("../constants/operations"));
const utils_1 = require("../utils");
// endregion
/**
 * Signal data (size-limited) publish request.
 *
 * @internal
 */
class SignalRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super();
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNSignalOperation;
    }
    validate() {
        const { message, channel, keySet: { publishKey }, } = this.parameters;
        if (!channel)
            return "Missing 'channel'";
        if (!message)
            return "Missing 'message'";
        if (!publishKey)
            return "Missing 'publishKey'";
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse)
                throw new pubnub_error_1.PubNubError('Service response error, check status for details', (0, pubnub_error_1.createValidationError)('Unable to deserialize service response'));
            return { timetoken: serviceResponse[2] };
        });
    }
    get path() {
        const { keySet: { publishKey, subscribeKey }, channel, message, } = this.parameters;
        const stringifiedPayload = JSON.stringify(message);
        return `/signal/${publishKey}/${subscribeKey}/0/${(0, utils_1.encodeString)(channel)}/0/${(0, utils_1.encodeString)(stringifiedPayload)}`;
    }
}
exports.SignalRequest = SignalRequest;
