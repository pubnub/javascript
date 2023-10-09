import { ICryptor, EncryptedDataType } from './ICryptor';
import cryptoJS from '../../../core/components/cryptography/hmac-sha256';
import { decode } from '../../../core/components/base64_codec';

// ts check disabled: CryptoJs does not have types specified
export default class AesCbcCryptor implements ICryptor {
  static BLOCK_SIZE = 16;
  static encoder = new TextEncoder();
  static decoder = new TextDecoder();

  cipherKey: string;
  encryptedKey: any;
  CryptoJS: any;

  constructor(configuration: { cipherKey: string }) {
    this.cipherKey = configuration.cipherKey;
    this.CryptoJS = cryptoJS;
    this.encryptedKey = this.CryptoJS.SHA256(this.cipherKey);
  }

  get algo() {
    return 'AES-CBC';
  }

  get identifier() {
    return 'ACRH';
  }

  private getIv() {
    return crypto.getRandomValues(new Uint8Array(AesCbcCryptor.BLOCK_SIZE));
  }

  private async getKey() {
    const bKey = AesCbcCryptor.encoder.encode(this.cipherKey);
    const abHash = await crypto.subtle.digest('SHA-256', bKey.buffer);
    return crypto.subtle.importKey('raw', abHash, this.algo, true, ['encrypt', 'decrypt']);
  }

  encrypt(data: ArrayBuffer | string) {
    const stringData = typeof data === 'string' ? data : AesCbcCryptor.decoder.decode(data);
    if (stringData.length === 0) throw new Error('encryption error. empty content');
    const abIv = this.getIv();
    return {
      metadata: abIv,
      data: decode(
        this.CryptoJS.AES.encrypt(data, this.encryptedKey, {
          iv: this.bufferToWordArray(abIv),
          mode: this.CryptoJS.mode.CBC,
        }).ciphertext.toString(this.CryptoJS.enc.Base64),
      ),
    };
  }

  decrypt(encryptedData: EncryptedDataType) {
    const iv = this.bufferToWordArray(new Uint8ClampedArray(encryptedData.metadata!));
    const data = this.bufferToWordArray(new Uint8ClampedArray(encryptedData.data));
    return AesCbcCryptor.encoder.encode(
      this.CryptoJS.AES.decrypt({ ciphertext: data }, this.encryptedKey, {
        iv,
        mode: this.CryptoJS.mode.CBC,
      }).toString(this.CryptoJS.enc.Utf8),
    ).buffer;
  }

  async encryptFileData(data: ArrayBuffer): Promise<EncryptedDataType> {
    const key = await this.getKey();
    const iv = this.getIv();
    return {
      data: await crypto.subtle.encrypt({ name: this.algo, iv: iv }, key, data),
      metadata: iv,
    };
  }

  async decryptFileData(encryptedData: EncryptedDataType): Promise<ArrayBuffer> {
    const key = await this.getKey();
    return crypto.subtle.decrypt({ name: this.algo, iv: encryptedData.metadata! }, key, encryptedData.data);
  }

  private bufferToWordArray(b: any) {
    const wa: any[] = [];
    let i;
    for (i = 0; i < b.length; i += 1) {
      wa[(i / 4) | 0] |= b[i] << (24 - 8 * i);
    }
    return this.CryptoJS.lib.WordArray.create(wa, b.length);
  }
}
