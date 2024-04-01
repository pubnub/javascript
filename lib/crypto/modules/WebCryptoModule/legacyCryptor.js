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
import Crypto from '../../../core/components/cryptography/index';
import { encode } from '../../../core/components/base64_codec';
import { PubnubError } from '../../../errors/pubnub-error';
import FileCryptor from '../web';
/**
 * Legacy cryptor.
 */
class LegacyCryptor {
    constructor(config) {
        this.config = config;
        this.cryptor = new Crypto(Object.assign({}, config));
        this.fileCryptor = new FileCryptor();
    }
    // --------------------------------------------------------
    // --------------------- Encryption -----------------------
    // --------------------------------------------------------
    // region Encryption
    encrypt(data) {
        const stringData = typeof data === 'string' ? data : LegacyCryptor.decoder.decode(data);
        return {
            data: LegacyCryptor.encoder.encode(this.cryptor.encrypt(stringData)),
            metadata: null,
        };
    }
    encryptFile(file, File) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this.config.cipherKey)
                throw new PubnubError('File encryption error: cipher key not set.');
            return this.fileCryptor.encryptFile((_a = this.config) === null || _a === void 0 ? void 0 : _a.cipherKey, file, File);
        });
    }
    // endregion
    // --------------------------------------------------------
    // --------------------- Decryption -----------------------
    // --------------------------------------------------------
    // region Decryption
    decrypt(encryptedData) {
        const data = typeof encryptedData.data === 'string' ? encryptedData.data : encode(encryptedData.data);
        return this.cryptor.decrypt(data);
    }
    decryptFile(file, File) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.config.cipherKey)
                throw new PubnubError('File encryption error: cipher key not set.');
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
/**
 * `string` to {@link ArrayBuffer} response decoder.
 */
LegacyCryptor.encoder = new TextEncoder();
/**
 *  {@link ArrayBuffer} to {@link string} decoder.
 */
LegacyCryptor.decoder = new TextDecoder();
export default LegacyCryptor;
