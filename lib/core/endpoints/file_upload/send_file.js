var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GenerateFileUploadUrlRequest } from './generate_upload_url';
import { PubNubError } from '../../../errors/pubnub-error';
import RequestOperation from '../../constants/operations';
import { UploadFileRequest } from './upload-file';
import { PubNubAPIError } from '../../../errors/pubnub-api-error';
import StatusCategory from '../../constants/categories';
export class SendFileRequest {
    constructor(parameters) {
        var _a;
        this.parameters = parameters;
        this.file = (_a = this.parameters.PubNubFile) === null || _a === void 0 ? void 0 : _a.create(parameters.file);
        if (!this.file)
            throw new Error('File upload error: unable to create File object.');
    }
    process() {
        return __awaiter(this, void 0, void 0, function* () {
            let fileName;
            let fileId;
            return this.generateFileUploadUrl()
                .then((result) => {
                fileName = result.name;
                fileId = result.id;
                return this.uploadFile(result);
            })
                .then((result) => {
                if (result.status !== 204) {
                    throw new PubNubError('Upload to bucket was unsuccessful', {
                        error: true,
                        statusCode: result.status,
                        category: StatusCategory.PNUnknownCategory,
                        operation: RequestOperation.PNPublishFileOperation,
                        errorData: { message: result.message },
                    });
                }
            })
                .then(() => this.publishFileMessage(fileId, fileName))
                .catch((error) => {
                if (error instanceof PubNubError)
                    throw error;
                const apiError = !(error instanceof PubNubAPIError) ? PubNubAPIError.create(error) : error;
                throw new PubNubError('File upload error.', apiError.toStatus(RequestOperation.PNPublishFileOperation));
            });
        });
    }
    generateFileUploadUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new GenerateFileUploadUrlRequest(Object.assign(Object.assign({}, this.parameters), { name: this.file.name, keySet: this.parameters.keySet }));
            return this.parameters.sendRequest(request);
        });
    }
    uploadFile(uploadParameters) {
        return __awaiter(this, void 0, void 0, function* () {
            const { cipherKey, PubNubFile, crypto, cryptography } = this.parameters;
            const { id, name, url, formFields } = uploadParameters;
            if (this.parameters.PubNubFile.supportsEncryptFile) {
                if (!cipherKey && crypto)
                    this.file = (yield crypto.encryptFile(this.file, PubNubFile));
                else if (cipherKey && cryptography)
                    this.file = (yield cryptography.encryptFile(cipherKey, this.file, PubNubFile));
            }
            return this.parameters.sendRequest(new UploadFileRequest({
                fileId: id,
                fileName: name,
                file: this.file,
                uploadUrl: url,
                formFields,
            }));
        });
    }
    publishFileMessage(fileId, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            let result = { timetoken: '0' };
            let retries = this.parameters.fileUploadPublishRetryLimit;
            let publishError;
            let wasSuccessful = false;
            do {
                try {
                    result = yield this.parameters.publishFile(Object.assign(Object.assign({}, this.parameters), { fileId, fileName }));
                    wasSuccessful = true;
                }
                catch (error) {
                    if (error instanceof PubNubError)
                        publishError = error;
                    retries -= 1;
                }
            } while (!wasSuccessful && retries > 0);
            if (!wasSuccessful) {
                throw new PubNubError('Publish failed. You may want to execute that operation manually using pubnub.publishFile', {
                    error: true,
                    category: (_b = (_a = publishError.status) === null || _a === void 0 ? void 0 : _a.category) !== null && _b !== void 0 ? _b : StatusCategory.PNUnknownCategory,
                    statusCode: (_d = (_c = publishError.status) === null || _c === void 0 ? void 0 : _c.statusCode) !== null && _d !== void 0 ? _d : 0,
                    channel: this.parameters.channel,
                    id: fileId,
                    name: fileName,
                });
            }
            else
                return { status: 200, timetoken: result.timetoken, id: fileId, name: fileName };
        });
    }
}
