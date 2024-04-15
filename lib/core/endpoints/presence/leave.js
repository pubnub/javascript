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
import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import { encodeNames } from '../../utils';
export class PresenceLeaveRequest extends AbstractRequest {
    constructor(parameters) {
        super();
        this.parameters = parameters;
        if (this.parameters.channelGroups)
            this.parameters.channelGroups = Array.from(new Set(this.parameters.channelGroups));
        if (this.parameters.channels)
            this.parameters.channels = Array.from(new Set(this.parameters.channels));
    }
    operation() {
        return RequestOperation.PNUnsubscribeOperation;
    }
    validate() {
        const { keySet: { subscribeKey }, channels = [], channelGroups = [], } = this.parameters;
        if (!subscribeKey)
            return 'Missing Subscribe Key';
        if (channels.length === 0 && channelGroups.length === 0)
            return 'At least one `channel` or `channel group` should be provided.';
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
        var _a;
        const { keySet: { subscribeKey }, channels, } = this.parameters;
        return `/v2/presence/sub-key/${subscribeKey}/channel/${encodeNames((_a = channels === null || channels === void 0 ? void 0 : channels.sort()) !== null && _a !== void 0 ? _a : [], ',')}/leave`;
    }
    get queryParameters() {
        const { channelGroups } = this.parameters;
        if (!channelGroups || channelGroups.length === 0)
            return {};
        return { 'channel-group': channelGroups.sort().join(',') };
    }
}
