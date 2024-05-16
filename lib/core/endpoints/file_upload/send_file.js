"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendFileRequest = void 0;
const generate_upload_url_1 = require("./generate_upload_url");
const pubnub_error_1 = require("../../../errors/pubnub-error");
const operations_1 = __importDefault(require("../../constants/operations"));
const upload_file_1 = require("./upload-file");
const pubnub_api_error_1 = require("../../../errors/pubnub-api-error");
const categories_1 = __importDefault(require("../../constants/categories"));
// endregion
/**
 * Send file composed request.
 *
 * @internal
 */
class SendFileRequest {
    constructor(parameters) {
        var _a;
        this.parameters = parameters;
        this.file = (_a = this.parameters.PubNubFile) === null || _a === void 0 ? void 0 : _a.create(parameters.file);
        if (!this.file)
            throw new Error('File upload error: unable to create File object.');
    }
    /**
     * Process user-input and upload file.
     *
     * @returns File upload request response.
     */
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
                    throw new pubnub_error_1.PubNubError('Upload to bucket was unsuccessful', {
                        error: true,
                        statusCode: result.status,
                        category: categories_1.default.PNUnknownCategory,
                        operation: operations_1.default.PNPublishFileOperation,
                        errorData: { message: result.message },
                    });
                }
            })
                .then(() => this.publishFileMessage(fileId, fileName))
                .catch((error) => {
                if (error instanceof pubnub_error_1.PubNubError)
                    throw error;
                const apiError = !(error instanceof pubnub_api_error_1.PubNubAPIError) ? pubnub_api_error_1.PubNubAPIError.create(error) : error;
                throw new pubnub_error_1.PubNubError('File upload error.', apiError.toStatus(operations_1.default.PNPublishFileOperation));
            });
        });
    }
    /**
     * Generate pre-signed file upload Url.
     *
     * @returns File upload credentials.
     */
    generateFileUploadUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = new generate_upload_url_1.GenerateFileUploadUrlRequest(Object.assign(Object.assign({}, this.parameters), { name: this.file.name, keySet: this.parameters.keySet }));
            return this.parameters.sendRequest(request);
        });
    }
    /**
     * Prepare and upload {@link PubNub} File object to remote storage.
     *
     * @param uploadParameters - File upload request parameters.
     *
     * @returns
     */
    uploadFile(uploadParameters) {
        return __awaiter(this, void 0, void 0, function* () {
            const { cipherKey, PubNubFile, crypto, cryptography } = this.parameters;
            const { id, name, url, formFields } = uploadParameters;
            // Encrypt file if possible.
            if (this.parameters.PubNubFile.supportsEncryptFile) {
                if (!cipherKey && crypto)
                    this.file = (yield crypto.encryptFile(this.file, PubNubFile));
                else if (cipherKey && cryptography)
                    this.file = (yield cryptography.encryptFile(cipherKey, this.file, PubNubFile));
            }
            return this.parameters.sendRequest(new upload_file_1.UploadFileRequest({
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
                    if (error instanceof pubnub_error_1.PubNubError)
                        publishError = error;
                    retries -= 1;
                }
            } while (!wasSuccessful && retries > 0);
            if (!wasSuccessful) {
                throw new pubnub_error_1.PubNubError('Publish failed. You may want to execute that operation manually using pubnub.publishFile', {
                    error: true,
                    category: (_b = (_a = publishError.status) === null || _a === void 0 ? void 0 : _a.category) !== null && _b !== void 0 ? _b : categories_1.default.PNUnknownCategory,
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
exports.SendFileRequest = SendFileRequest;
