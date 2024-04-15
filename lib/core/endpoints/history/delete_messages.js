var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createValidationError, PubNubError } from '../../../errors/pubnub-error';
import { PubNubAPIError } from '../../../errors/pubnub-api-error';
import { TransportMethod } from '../../types/transport-request';
import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import { encodeString } from '../../utils';
export class DeleteMessageRequest extends AbstractRequest {
    constructor(parameters) {
        super({ method: TransportMethod.DELETE });
        this.parameters = parameters;
    }
    operation() {
        return RequestOperation.PNDeleteMessagesOperation;
    }
    validate() {
        if (!this.parameters.keySet.subscribeKey)
            return 'Missing Subscribe Key';
        if (!this.parameters.channel)
            return 'Missing channel';
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse) {
                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
            }
            else if (serviceResponse.status >= 400)
                throw PubNubAPIError.create(response);
            return {};
        });
    }
    get path() {
        const { keySet: { subscribeKey }, channel, } = this.parameters;
        return `/v3/history/sub-key/${subscribeKey}/channel/${encodeString(channel)}`;
    }
    get queryParameters() {
        const { start, end } = this.parameters;
        return Object.assign(Object.assign({}, (start ? { start } : {})), (end ? { end } : {}));
    }
}
