import Crypto from '../../../core/components/cryptography/index';
import { encode } from '../../../core/components/base64_codec';
import FileCryptor from '../node';
import { EncryptedDataType } from './ICryptor';
import { ILegacyCryptor, PubNubFileType } from './ILegacyCryptor';

export default class LegacyCryptor implements ILegacyCryptor<PubNubFileType> {
  config;

  cryptor;
  fileCryptor;

  constructor(config: any) {
    this.config = config;
    this.cryptor = new Crypto(config);
    this.fileCryptor = new FileCryptor();
  }
  get identifier() {
    return '';
  }
  encrypt(data: string) {
    if (data.length === 0) throw new Error('encryption error. empty content');
    return {
      data: this.cryptor.encrypt(data),
      metadata: null,
    };
  }

  decrypt(encryptedData: EncryptedDataType) {
    const data = typeof encryptedData.data === 'string' ? encryptedData.data : encode(encryptedData.data);
    return this.cryptor.decrypt(data);
  }

  async encryptFile(file: PubNubFileType, File: PubNubFileType) {
    return this.fileCryptor.encryptFile(this.config.cipherKey, file, File);
  }

  async decryptFile(file: PubNubFileType, File: PubNubFileType) {
    return this.fileCryptor.decryptFile(this.config.cipherKey, file, File);
  }
}
