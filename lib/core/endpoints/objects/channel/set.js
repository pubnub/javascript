/**
 * Set Channel Metadata REST API module.
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
import { createValidationError, PubnubError } from '../../../../errors/pubnub-error';
import { TransportMethod } from '../../../types/transport-request';
import { AbstractRequest } from '../../../components/request';
import RequestOperation from '../../../constants/operations';
import { encodeString } from '../../../utils';
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether `Channel` custom field should be included by default or not.
 */
const INCLUDE_CUSTOM_FIELDS = true;
// endregion
/**
 * Set Channel Metadata request.
 */
export class SetChannelMetadataRequest extends AbstractRequest {
    constructor(parameters) {
        var _a, _b;
        var _c;
        super({ method: TransportMethod.PATCH });
        this.parameters = parameters;
        // Apply default request parameters.
        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
        (_b = (_c = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_c.customFields = INCLUDE_CUSTOM_FIELDS);
    }
    operation() {
        return RequestOperation.PNSetChannelMetadataOperation;
    }
    validate() {
        if (!this.parameters.channel)
            return 'Channel cannot be empty';
        if (!this.parameters.data)
            return 'Data cannot be empty';
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse)
                throw new PubnubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
            return serviceResponse;
        });
    }
    get path() {
        const { keySet: { subscribeKey }, channel, } = this.parameters;
        return `/v2/objects/${subscribeKey}/channels/${encodeString(channel)}`;
    }
    get queryParameters() {
        return {
            include: ['status', 'type', ...(this.parameters.include.customFields ? ['custom'] : [])].join(','),
        };
    }
    get body() {
        return JSON.stringify(this.parameters.data);
    }
}
