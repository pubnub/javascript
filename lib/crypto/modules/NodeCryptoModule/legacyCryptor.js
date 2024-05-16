"use strict";
/**
 * Legacy cryptor module.
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
const index_1 = __importDefault(require("../../../core/components/cryptography/index"));
const base64_codec_1 = require("../../../core/components/base64_codec");
const pubnub_error_1 = require("../../../errors/pubnub-error");
const node_1 = __importDefault(require("../node"));
/**
 * Legacy cryptor.
 */
class LegacyCryptor {
    constructor(config) {
        this.config = config;
        this.cryptor = new index_1.default(Object.assign({}, config));
        this.fileCryptor = new node_1.default();
    }
    // --------------------------------------------------------
    // --------------------- Encryption -----------------------
    // --------------------------------------------------------
    // region Encryption
    encrypt(data) {
        if (data.length === 0)
            throw new Error('Encryption error: empty content');
        return {
            data: this.cryptor.encrypt(data),
            metadata: null,
        };
    }
    encryptFile(file, File) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.config.cipherKey)
                throw new pubnub_error_1.PubNubError('File encryption error: cipher key not set.');
            return this.fileCryptor.encryptFile(this.config.cipherKey, file, File);
        });
    }
    // endregion
    // --------------------------------------------------------
    // --------------------- Decryption -----------------------
    // --------------------------------------------------------
    // region Decryption
    decrypt(encryptedData) {
        const data = typeof encryptedData.data === 'string' ? encryptedData.data : (0, base64_codec_1.encode)(encryptedData.data);
        return this.cryptor.decrypt(data);
    }
    decryptFile(file, File) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.config.cipherKey)
                throw new pubnub_error_1.PubNubError('File decryption error: cipher key not set.');
            return this.fileCryptor.decryptFile(this.config.cipherKey, file, File);
        });
    }
    // endregion
    // --------------------------------------------------------
    // ----------------------- Helpers ------------------------
    // --------------------------------------------------------
    // region Helpers
    get identifier() {
        return '';
    }
}
exports.default = LegacyCryptor;
