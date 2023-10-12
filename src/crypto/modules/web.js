/* global crypto */

function concatArrayBuffer(ab1, ab2) {
  const tmp = new Uint8Array(ab1.byteLength + ab2.byteLength);

  tmp.set(new Uint8Array(ab1), 0);
  tmp.set(new Uint8Array(ab2), ab1.byteLength);

  return tmp.buffer;
}

export default class WebCryptography {
  static IV_LENGTH = 16;
  static encoder = new TextEncoder();
  static decoder = new TextDecoder();

  get algo() {
    return 'aes-256-cbc';
  }

  async encrypt(key, input) {
    const cKey = await this.getKey(key);

    if (input instanceof ArrayBuffer) {
      return this.encryptArrayBuffer(cKey, input);
    }
    if (typeof input === 'string') {
      return this.encryptString(cKey, input);
    }
    throw new Error('Cannot encrypt this file. In browsers file encryption supports only string or ArrayBuffer');
  }

  async decrypt(key, input) {
    const cKey = await this.getKey(key);
    if (input instanceof ArrayBuffer) {
      return this.decryptArrayBuffer(cKey, input);
    }
    if (typeof input === 'string') {
      return this.decryptString(cKey, input);
    }
    throw new Error('Cannot decrypt this file. In browsers file decryption supports only string or ArrayBuffer');
  }

  async encryptFile(key, file, File) {
    if (file.data.byteLength <= 0) throw new Error('encryption error. empty content');
    const bKey = await this.getKey(key);

    const abPlaindata = await file.data.arrayBuffer();

    const abCipherdata = await this.encryptArrayBuffer(bKey, abPlaindata);

    return File.create({
      name: file.name,
      mimeType: 'application/octet-stream',
      data: abCipherdata,
    });
  }

  async decryptFile(key, file, File) {
    const bKey = await this.getKey(key);

    const abCipherdata = await file.data.arrayBuffer();
    const abPlaindata = await this.decryptArrayBuffer(bKey, abCipherdata);

    return File.create({
      name: file.name,
      data: abPlaindata,
    });
  }

  async getKey(key) {
    const digest = await crypto.subtle.digest('SHA-256', WebCryptography.encoder.encode(key));
    const hashHex = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const abKey = WebCryptography.encoder.encode(hashHex.slice(0, 32)).buffer;
    return crypto.subtle.importKey('raw', abKey, 'AES-CBC', true, ['encrypt', 'decrypt']);
  }

  async encryptArrayBuffer(key, plaintext) {
    const abIv = crypto.getRandomValues(new Uint8Array(16));

    return concatArrayBuffer(abIv.buffer, await crypto.subtle.encrypt({ name: 'AES-CBC', iv: abIv }, key, plaintext));
  }

  async decryptArrayBuffer(key, ciphertext) {
    const abIv = ciphertext.slice(0, 16);
    if (ciphertext.slice(WebCryptography.IV_LENGTH).byteLength <= 0) throw new Error('decryption error: empty content');
    const data = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: abIv },
      key,
      ciphertext.slice(WebCryptography.IV_LENGTH),
    );
    return data;
  }

  async encryptString(key, plaintext) {
    const abIv = crypto.getRandomValues(new Uint8Array(16));

    const abPlaintext = WebCryptography.encoder.encode(plaintext).buffer;
    const abPayload = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: abIv }, key, abPlaintext);

    const ciphertext = concatArrayBuffer(abIv.buffer, abPayload);

    return WebCryptography.decoder.decode(ciphertext);
  }

  async decryptString(key, ciphertext) {
    const abCiphertext = WebCryptography.encoder.encode(ciphertext).buffer;
    const abIv = abCiphertext.slice(0, 16);
    const abPayload = abCiphertext.slice(16);

    const abPlaintext = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: abIv }, key, abPayload);

    return WebCryptography.decoder.decode(abPlaintext);
  }
}
