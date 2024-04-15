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
const AUTH_KEYS = [];
export class AuditRequest extends AbstractRequest {
    constructor(parameters) {
        var _a;
        var _b;
        super();
        this.parameters = parameters;
        (_a = (_b = this.parameters).authKeys) !== null && _a !== void 0 ? _a : (_b.authKeys = AUTH_KEYS);
    }
    operation() {
        return RequestOperation.PNAccessManagerAudit;
    }
    validate() {
        if (!this.parameters.keySet.subscribeKey)
            return 'Missing Subscribe Key';
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse) {
                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
            }
            else if (serviceResponse.status >= 400)
                throw PubNubAPIError.create(response);
            return serviceResponse.payload;
        });
    }
    get path() {
        return `/v2/auth/audit/sub-key/${this.parameters.keySet.subscribeKey}`;
    }
    get queryParameters() {
        const { channel, channelGroup, authKeys } = this.parameters;
        return Object.assign(Object.assign(Object.assign({}, (channel ? { channel } : {})), (channelGroup ? { 'channel-group': channelGroup } : {})), (authKeys && authKeys.length ? { auth: authKeys.join(',') } : {}));
    }
}
