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
export class GenerateFileUploadUrlRequest extends AbstractRequest {
    constructor(parameters) {
        super({ method: TransportMethod.POST });
        this.parameters = parameters;
    }
    operation() {
        return RequestOperation.PNGenerateUploadUrlOperation;
    }
    validate() {
        if (!this.parameters.channel)
            return "channel can't be empty";
        if (!this.parameters.name)
            return "'name' can't be empty";
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse) {
                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
            }
            else if (serviceResponse.status >= 400)
                throw PubNubAPIError.create(response);
            return {
                id: serviceResponse.data.id,
                name: serviceResponse.data.name,
                url: serviceResponse.file_upload_request.url,
                formFields: serviceResponse.file_upload_request.form_fields,
            };
        });
    }
    get path() {
        const { keySet: { subscribeKey }, channel, } = this.parameters;
        return `/v1/files/${subscribeKey}/channels/${encodeString(channel)}/generate-upload-url`;
    }
    get body() {
        return JSON.stringify({ name: this.parameters.name });
    }
}
