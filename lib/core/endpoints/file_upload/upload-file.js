/**
 * Upload file REST API request.
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
import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
/**
 * File Upload request.
 */
export class UploadFileRequest extends AbstractRequest {
    constructor(parameters) {
        super();
        this.parameters = parameters;
        // Use file's actual mime type if available.
        const mimeType = parameters.file.mimeType;
        if (mimeType) {
            parameters.formFields = parameters.formFields.map((entry) => {
                if (entry.name === 'Content-Type')
                    return { name: entry.name, value: mimeType };
                return entry;
            });
        }
    }
    operation() {
        return RequestOperation.PNPublishFileOperation;
    }
    validate() {
        const { fileId, fileName, file, uploadUrl } = this.parameters;
        if (!fileId)
            return "Validation failed: file 'id' can't be empty";
        if (!fileName)
            return "Validation failed: file 'name' can't be empty";
        if (!file)
            return "Validation failed: 'file' can't be empty";
        if (!uploadUrl)
            return "Validation failed: file upload 'url' can't be empty";
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                status: response.status,
                message: response.body ? UploadFileRequest.decoder.decode(response.body) : 'OK',
            };
        });
    }
    request() {
        return Object.assign(Object.assign({}, super.request()), { origin: new URL(this.parameters.uploadUrl).origin });
    }
    get path() {
        const { pathname, search } = new URL(this.parameters.uploadUrl);
        return `${pathname}${search}`;
    }
    get body() {
        return this.parameters.file;
    }
}
