import Crypto from '../../../core/components/cryptography/index';
import FileCryptor from '../node';
import { EncryptedDataType } from './ICryptor';
import { ILegacyCryptor, PubNubFileType } from './ILegacyCryptor';

export default class LegacyCryptor implements ILegacyCryptor<PubNubFileType> {
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

  async encryptFile(file: PubNubFileType, File: PubNubFileType) {
    return this.fileCryptor.encryptFile(this.config.cipherKey, file, File);
  }

  async decryptFile(file: PubNubFileType, File: PubNubFileType) {
    return this.fileCryptor.decryptFile(this.config.cipherKey, file, File);
  }
}
