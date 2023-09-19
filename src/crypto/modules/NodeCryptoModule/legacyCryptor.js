import Crypto from '../../../core/components/cryptography/index';
import FileCryptor from '../node';

export default class LegacyCryptor {
  config;
  cipherKey;
  useRandomIVs;

  cryptor;
  fileCryptor;

  constructor({ pnConfig }) {
    this.config = pnConfig
    this.cryptor = new Crypto({ pnConfig });
    this.fileCryptor = new FileCryptor();
  }

  get identifier() {
    return '';
  }
  async encrypt(data) {
    return this.cryptor.encrypt(data);
  }

  async decrypt(encryptedData) {
    return this.cryptor.decrypt(encryptedData);
  }

  async encryptFile(file, File) {
    return this.fileCryptor.encryptFile(this.config.cipherKey, file, File);
  }

  async decryptFile(file, File) {
    return this.fileCryptor.decryptFile(this.config.cipherKey, file, File);
  }
}
