"use strict";
/**
 * Download File REST API module.
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadFileRequest = void 0;
const request_1 = require("../../components/request");
const operations_1 = __importDefault(require("../../constants/operations"));
const utils_1 = require("../../utils");
// endregion
/**
 * Download File request.
 *
 * @internal
 */
class DownloadFileRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super();
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNDownloadFileOperation;
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
            const { cipherKey, crypto, cryptography, name, PubNubFile } = this.parameters;
            const mimeType = response.headers['content-type'];
            let decryptedFile;
            let body = response.body;
            if (PubNubFile.supportsEncryptFile && (cipherKey || crypto)) {
                if (cipherKey && cryptography)
                    body = yield cryptography.decrypt(cipherKey, body);
                else if (!cipherKey && crypto)
                    decryptedFile = yield crypto.decryptFile(PubNubFile.create({ data: body, name: name, mimeType }), PubNubFile);
            }
            return (decryptedFile
                ? decryptedFile
                : PubNubFile.create({
                    data: body,
                    name,
                    mimeType,
                }));
        });
    }
    get path() {
        const { keySet: { subscribeKey }, channel, id, name, } = this.parameters;
        return `/v1/files/${subscribeKey}/channels/${(0, utils_1.encodeString)(channel)}/files/${id}/${name}`;
    }
}
exports.DownloadFileRequest = DownloadFileRequest;
