/** @flow */
import type { ICryptography } from '../';
import type { IFile, FileClass } from '../../file';

// This version of flow doesn't know about the Web Crypto API
declare var crypto: any;

function concatArrayBuffer(ab1: ArrayBuffer, ab2: ArrayBuffer): ArrayBuffer {
  const tmp = new Uint8Array(ab1.byteLength + ab2.byteLength);

  tmp.set(new Uint8Array(ab1), 0);
  tmp.set(new Uint8Array(ab2), ab1.byteLength);

  return tmp.buffer;
}

export default class WebCryptography implements ICryptography<ArrayBuffer | string> {
  static IV_LENGTH = 16;

  get algo() {
    return 'aes-256-cbc';
  }

  async encrypt(key: string, input: ArrayBuffer | string): Promise<ArrayBuffer | string> {
    const cKey = await this.getKey(key);

    if (input instanceof ArrayBuffer) {
      return this.encryptArrayBuffer(cKey, input);
    } else if (typeof input === 'string') {
      return this.encryptString(cKey, input);
    } else {
      throw new Error('Cannot encrypt this file. In browsers file encryption supports only string or ArrayBuffer');
    }
  }

  async decrypt(key: string, input: ArrayBuffer | string): Promise<ArrayBuffer | string> {
    const cKey = await this.getKey(key);

    if (input instanceof ArrayBuffer) {
      return this.decryptArrayBuffer(cKey, input);
    } else if (typeof input === 'string') {
      return this.decryptString(cKey, input);
    } else {
      throw new Error('Cannot decrypt this file. In browsers file decryption supports only string or ArrayBuffer');
    }
  }

  async encryptFile(key: string, file: IFile, File: FileClass): Promise<IFile> {
    const bKey = await this.getKey(key);

    const abPlaindata = await file.toArrayBuffer();

    const abCipherdata = await this.encryptArrayBuffer(bKey, abPlaindata);

    return File.create({
      name: file.name,
      mimeType: 'application/octet-stream',
      data: abCipherdata,
    });
  }

  async decryptFile(key: string, file: IFile, File: FileClass): Promise<IFile> {
    const bKey = await this.getKey(key);

    const abCipherdata = await file.toArrayBuffer();

    const abPlaindata = await this.decryptArrayBuffer(bKey, abCipherdata);

    return File.create({
      name: file.name,
      data: abPlaindata,
    });
  }

  async getKey(key: string): Promise<any> {
    const bKey = Buffer.from(key);
    const abHash = await crypto.subtle.digest('SHA-256', bKey.buffer);

    const abKey = Buffer.from(Buffer.from(abHash).toString('hex').slice(0, 32), 'utf8').buffer;

    return crypto.subtle.importKey('raw', abKey, 'AES-CBC', true, ['encrypt', 'decrypt']);
  }

  async encryptArrayBuffer(key: any, plaintext: ArrayBuffer) {
    const abIv = crypto.getRandomValues(new Uint8Array(16));

    return concatArrayBuffer(abIv.buffer, await crypto.subtle.encrypt({ name: 'AES-CBC', iv: abIv }, key, plaintext));
  }

  async decryptArrayBuffer(key: any, ciphertext: ArrayBuffer) {
    const abIv = ciphertext.slice(0, 16);

    return crypto.subtle.decrypt({ name: 'AES-CBC', iv: abIv }, key, ciphertext.slice(16));
  }

  async encryptString(key: any, plaintext: string) {
    const abIv = crypto.getRandomValues(new Uint8Array(16));

    const abPlaintext = Buffer.from(plaintext).buffer;
    const abPayload = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: abIv }, key, abPlaintext);

    const ciphertext = concatArrayBuffer(abIv.buffer, abPayload);

    return Buffer.from(ciphertext).toString('utf8');
  }

  async decryptString(key: any, ciphertext: string) {
    const abCiphertext = Buffer.from(ciphertext);
    const abIv = abCiphertext.slice(0, 16);
    const abPayload = abCiphertext.slice(16);

    const abPlaintext = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: abIv }, key, abPayload);

    return Buffer.from(abPlaintext).toString('utf8');
  }
}
