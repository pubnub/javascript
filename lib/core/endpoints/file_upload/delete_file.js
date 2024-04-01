/**
 * Delete file REST API module.
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
 * Delete File request.
 */
export class DeleteFileRequest extends AbstractRequest {
    constructor(parameters) {
        super({ method: TransportMethod.DELETE });
        this.parameters = parameters;
    }
    operation() {
        return RequestOperation.PNDeleteFileOperation;
    }
    validate() {
        const { channel, id, name } = this.parameters;
        if (!channel)
            return "channel can't be empty";
        if (!id)
            return "file id can't be empty";
        if (!name)
            return "file name can't be empty";
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
        const { keySet: { subscribeKey }, id, channel, name, } = this.parameters;
        return `/v1/files/${subscribeKey}/channels/${encodeString(channel)}/files/${id}/${name}`;
    }
}
