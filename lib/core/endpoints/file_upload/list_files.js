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
import { encodeString } from '../../utils';
const LIMIT = 100;
export class FilesListRequest extends AbstractRequest {
    constructor(parameters) {
        var _a;
        var _b;
        super();
        this.parameters = parameters;
        (_a = (_b = this.parameters).limit) !== null && _a !== void 0 ? _a : (_b.limit = LIMIT);
    }
    operation() {
        return RequestOperation.PNListFilesOperation;
    }
    validate() {
        if (!this.parameters.channel)
            return "channel can't be empty";
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
        const { keySet: { subscribeKey }, channel, } = this.parameters;
        return `/v1/files/${subscribeKey}/channels/${encodeString(channel)}/files`;
    }
    get queryParameters() {
        const { limit, next } = this.parameters;
        return Object.assign({ limit: limit }, (next ? { next } : {}));
    }
}
