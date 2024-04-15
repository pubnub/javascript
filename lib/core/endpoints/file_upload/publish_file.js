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
import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import { encode } from '../../components/base64_codec';
import { encodeString } from '../../utils';
const STORE_IN_HISTORY = true;
export class PublishFileMessageRequest extends AbstractRequest {
    constructor(parameters) {
        var _a;
        var _b;
        super();
        this.parameters = parameters;
        (_a = (_b = this.parameters).storeInHistory) !== null && _a !== void 0 ? _a : (_b.storeInHistory = STORE_IN_HISTORY);
    }
    operation() {
        return RequestOperation.PNPublishFileMessageOperation;
    }
    validate() {
        const { channel, fileId, fileName } = this.parameters;
        if (!channel)
            return "channel can't be empty";
        if (!fileId)
            return "file id can't be empty";
        if (!fileName)
            return "file name can't be empty";
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse)
                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
            return { timetoken: serviceResponse[2] };
        });
    }
    get path() {
        const { message, channel, keySet: { publishKey, subscribeKey }, fileId, fileName, } = this.parameters;
        const fileMessage = Object.assign({ file: {
                name: fileName,
                id: fileId,
            } }, (message ? { message } : {}));
        return `/v1/files/publish-file/${publishKey}/${subscribeKey}/0/${encodeString(channel)}/0/${encodeString(this.prepareMessagePayload(fileMessage))}`;
    }
    get queryParameters() {
        const { storeInHistory, ttl, meta } = this.parameters;
        return Object.assign(Object.assign({ store: storeInHistory ? '1' : '0' }, (ttl ? { ttl } : {})), (meta && typeof meta === 'object' ? { meta: JSON.stringify(meta) } : {}));
    }
    prepareMessagePayload(payload) {
        const { crypto } = this.parameters;
        if (!crypto)
            return JSON.stringify(payload) || '';
        const encrypted = crypto.encrypt(JSON.stringify(payload));
        return JSON.stringify(typeof encrypted === 'string' ? encrypted : encode(encrypted));
    }
}
