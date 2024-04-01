/**
 * Announce leave REST API module.
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
export class PresenceLeaveRequest extends AbstractRequest {
    constructor(parameters) {
        super();
        this.parameters = parameters;
    }
    operation() {
        return RequestOperation.PNUnsubscribeOperation;
    }
    validate() {
        const { keySet: { subscribeKey }, channels, channelGroups, } = this.parameters;
        if (!subscribeKey)
            return 'Missing Subscribe Key';
        if ((channels === null || channels === void 0 ? void 0 : channels.length) === 0 && (channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.length) === 0)
            return 'At least one `channel` or `channel group` should be provided.';
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse)
                throw new PubnubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
            return {};
        });
    }
    get path() {
        const { keySet: { subscribeKey }, channels, } = this.parameters;
        const stringifiedChannels = channels && channels.length > 0 ? encodeString(channels.join(',')) : ',';
        return `/v2/presence/sub-key/${subscribeKey}/channel/${stringifiedChannels}/leave`;
    }
    get queryParameters() {
        const { channelGroups } = this.parameters;
        if (!channelGroups || channelGroups.length === 0)
            return {};
        return { 'channel-group': channelGroups.join(',') };
    }
}
