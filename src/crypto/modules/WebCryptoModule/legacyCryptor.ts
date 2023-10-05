import Crypto from '../../../core/components/cryptography/index';
import FileCryptor from '../web';
import { EncryptedDataType } from './ICryptor';
import { ILegacyCryptor, PubNubFileType } from './ILegacyCryptor';

export default class LegacyCryptor implements ILegacyCryptor<PubNubFileType> {
  config;

  cryptor;
  fileCryptor;

  constructor(config: { config: any }) {
    this.config = config;
    this.cryptor = new Crypto({ config });
    this.fileCryptor = new FileCryptor();
  }

  get identifier() {
    return '';
  }
  encrypt(data: ArrayBuffer | string) {
    const stringData = typeof data === 'string' ? data : new TextDecoder().decode(data);
    return {
      data: this.cryptor.encrypt(stringData),
      metadata: null,
    };
  }

  decrypt(encryptedData: EncryptedDataType) {
    return this.cryptor.decrypt(encryptedData.data);
  }

  async encryptFile(file: PubNubFileType, File: PubNubFileType) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore: can not detect cipherKey from old Config
    return this.fileCryptor.encryptFile(this.config?.cipherKey, file, File);
  }

  async decryptFile(file: PubNubFileType, File: PubNubFileType) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore: can not detect cipherKey from old Config
    return this.fileCryptor.decryptFile(this.config.cipherKey, file, File);
  }
}
