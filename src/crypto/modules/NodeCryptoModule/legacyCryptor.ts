import Crypto from '../../../core/components/cryptography/index';
import FileCryptor from '../node';
import { EncryptedDataType } from './ICryptor';
import { ILegacyCryptor, PubnubFile } from './ILegacyCryptor';

export default class LegacyCryptor implements ILegacyCryptor<PubnubFile> {
  config;

  cryptor;
  fileCryptor;

  constructor(config: any) {
    this.config = config;
    this.cryptor = new Crypto({ config });
    this.fileCryptor = new FileCryptor();
  }

  get identifier() {
    return '';
  }
  async encrypt(data: ArrayBuffer) {
    return {
      data: this.cryptor.encrypt(data),
      metadata: null,
    };
  }

  async decrypt(encryptedData: EncryptedDataType) {
    return this.cryptor.decrypt(encryptedData.data.toString());
  }

  async encryptFile(file: PubnubFile, File: PubnubFile) {
    return this.fileCryptor.encryptFile(this.config.cipherKey, file, File);
  }

  async decryptFile(file: PubnubFile, File: PubnubFile) {
    return this.fileCryptor.decryptFile(this.config.cipherKey, file, File);
  }
}
