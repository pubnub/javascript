/**
 * Messages count REST API module.
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
import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import { encodeString } from '../../utils';
// endregion
export class MessageCountRequest extends AbstractRequest {
    constructor(parameters) {
        super();
        this.parameters = parameters;
    }
    operation() {
        return RequestOperation.PNMessageCounts;
    }
    validate() {
        const { keySet: { subscribeKey }, channels, timetoken, channelTimetokens, } = this.parameters;
        if (!subscribeKey)
            return 'Missing Subscribe Key';
        if (!channels)
            return 'Missing channels';
        if (timetoken && channelTimetokens)
            return '`timetoken` and `channelTimetokens` are incompatible together';
        if (!timetoken && !channelTimetokens)
            return '`timetoken` or `channelTimetokens` need to be set';
        if (channelTimetokens && channelTimetokens.length && channelTimetokens.length !== channels.length)
            return 'Length of `channelTimetokens` and `channels` do not match';
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse)
                throw new PubnubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
            return { channels: serviceResponse.channels };
        });
    }
    get path() {
        return `/v3/history/sub-key/${this.parameters.keySet.subscribeKey}/message-counts/${encodeString(this.parameters.channels.join(','))}`;
    }
    get queryParameters() {
        let { channelTimetokens } = this.parameters;
        if (this.parameters.timetoken)
            channelTimetokens = [this.parameters.timetoken];
        return Object.assign(Object.assign({}, (channelTimetokens.length === 1 ? { timetoken: channelTimetokens[0] } : {})), (channelTimetokens.length > 1 ? { channelsTimetoken: channelTimetokens.join(',') } : {}));
    }
}
