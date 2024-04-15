var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Crypto from '../../../core/components/cryptography/index';
import { encode } from '../../../core/components/base64_codec';
import { PubNubError } from '../../../errors/pubnub-error';
import FileCryptor from '../node';
export default class LegacyCryptor {
    constructor(config) {
        this.config = config;
        this.cryptor = new Crypto(Object.assign({}, config));
        this.fileCryptor = new FileCryptor();
    }
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
                throw new PubNubError('File encryption error: cipher key not set.');
            return this.fileCryptor.encryptFile(this.config.cipherKey, file, File);
        });
    }
    decrypt(encryptedData) {
        const data = typeof encryptedData.data === 'string' ? encryptedData.data : encode(encryptedData.data);
        return this.cryptor.decrypt(data);
    }
    decryptFile(file, File) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.config.cipherKey)
                throw new PubNubError('File decryption error: cipher key not set.');
            return this.fileCryptor.decryptFile(this.config.cipherKey, file, File);
        });
    }
    get identifier() {
        return '';
    }
}
