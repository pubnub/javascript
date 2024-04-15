var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createValidationError, PubNubError } from '../../../../errors/pubnub-error';
import { PubNubAPIError } from '../../../../errors/pubnub-api-error';
import { AbstractRequest } from '../../../components/request';
import RequestOperation from '../../../constants/operations';
import { encodeString } from '../../../utils';
const INCLUDE_CUSTOM_FIELDS = true;
export class GetUUIDMetadataRequest extends AbstractRequest {
    constructor(parameters) {
        var _a, _b;
        var _c;
        super();
        this.parameters = parameters;
        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
        (_b = (_c = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_c.customFields = INCLUDE_CUSTOM_FIELDS);
        if (this.parameters.userId)
            this.parameters.uuid = this.parameters.userId;
    }
    operation() {
        return RequestOperation.PNGetUUIDMetadataOperation;
    }
    validate() {
        if (!this.parameters.uuid)
            return "'uuid' cannot be empty";
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse) {
                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
            }
            else if (serviceResponse.status >= 400)
                throw PubNubAPIError.create(response);
            return serviceResponse;
        });
    }
    get path() {
        const { keySet: { subscribeKey }, uuid, } = this.parameters;
        return `/v2/objects/${subscribeKey}/uuids/${encodeString(uuid)}`;
    }
    get queryParameters() {
        const { include } = this.parameters;
        return { include: ['status', 'type', ...(include.customFields ? ['custom'] : [])].join(',') };
    }
}
