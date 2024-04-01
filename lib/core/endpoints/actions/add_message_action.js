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
import { createValidationError, PubnubError } from '../../../errors/pubnub-error';
import { TransportMethod } from '../../types/transport-request';
import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import { encodeString } from '../../utils';
// endregion
/**
 * Add Message Reaction request.
 */
export class AddMessageActionRequest extends AbstractRequest {
    constructor(parameters) {
        super({ method: TransportMethod.POST });
        this.parameters = parameters;
    }
    operation() {
        return RequestOperation.PNAddMessageActionOperation;
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
            return 'Missing Action.value';
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
            if (!serviceResponse)
                throw new PubnubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
            return { data: serviceResponse.data };
        });
    }
    get headers() {
        return { 'Content-Type': 'application/json' };
    }
    get path() {
        const { keySet: { subscribeKey }, channel, messageTimetoken, } = this.parameters;
        return `/v1/message-actions/${subscribeKey}/channel/${encodeString(channel)}/message/${messageTimetoken}`;
    }
    get body() {
        return JSON.stringify(this.parameters.action);
    }
}
