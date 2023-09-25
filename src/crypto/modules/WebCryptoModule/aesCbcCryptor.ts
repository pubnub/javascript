import { ICryptor, EncryptedDataType } from './ICryptor';

export default class AesCbcCryptor implements ICryptor {
  static BLOCK_SIZE = 16;
  static encoder = new TextEncoder();
  static decoder = new TextDecoder();

  cipherKey: string;

  constructor(configuration: { cipherKey: any }) {
    this.cipherKey = configuration.cipherKey;
  }

  get algo() {
    return 'AES-CBC';
  }

  get identifier() {
    return 'ACRH';
  }

  _getIv() {
    return crypto.getRandomValues(new Uint8Array(AesCbcCryptor.BLOCK_SIZE));
  }

  async _getKey() {
    const bKey = AesCbcCryptor.encoder.encode(this.cipherKey);
    const abHash = await crypto.subtle.digest('SHA-256', bKey.buffer);
    return crypto.subtle.importKey('raw', abHash, 'AES-CBC', true, ['encrypt', 'decrypt']);
  }

  async encrypt(data: BufferSource) {
    const abIv = this._getIv();
    const key = await this._getKey();

    return {
      metadata: abIv,
      data: await crypto.subtle.encrypt({ name: this.algo, iv: abIv }, key, data),
    };
  }

  async decrypt(encryptedData: EncryptedDataType) {
    const key = await this._getKey();
    const decryptedData = await crypto.subtle.decrypt(
      { name: this.algo, iv: encryptedData.metadata! },
      key,
      encryptedData.data,
    );
    return decryptedData;
  }
}
