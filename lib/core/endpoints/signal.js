var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createValidationError, PubNubError } from '../../errors/pubnub-error';
import { AbstractRequest } from '../components/request';
import RequestOperation from '../constants/operations';
import { encodeString } from '../utils';
export class SignalRequest extends AbstractRequest {
    constructor(parameters) {
        super();
        this.parameters = parameters;
    }
    operation() {
        return RequestOperation.PNSignalOperation;
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
                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
            return { timetoken: serviceResponse[2] };
        });
    }
    get path() {
        const { keySet: { publishKey, subscribeKey }, channel, message, } = this.parameters;
        const stringifiedPayload = JSON.stringify(message);
        return `/signal/${publishKey}/${subscribeKey}/0/${encodeString(channel)}/0/${encodeString(stringifiedPayload)}`;
    }
}
