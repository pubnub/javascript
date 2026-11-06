/* global describe, it */

import { expect } from 'chai';

import { WebCryptoModule } from '../../../src/crypto/modules/WebCryptoModule/webCryptoModule';
import { NodeCryptoModule } from '../../../src/crypto/modules/NodeCryptoModule/nodeCryptoModule';
import { ICryptor as WebICryptor } from '../../../src/crypto/modules/WebCryptoModule/ICryptor';
import { ICryptor as NodeICryptor } from '../../../src/crypto/modules/NodeCryptoModule/ICryptor';
import vectors from '../../fixtures/crypto/legacy-vectors';

const decoder = new TextDecoder();

/**
 * Normalize crypto module decryption result for comparison.
 */
const asPayload = (result: ArrayBuffer | unknown) =>
  result instanceof ArrayBuffer ? JSON.parse(decoder.decode(result)) : result;

const toArrayBuffer = (data: ArrayBuffer | string) =>
  typeof data === 'string' ? new TextEncoder().encode(data).buffer : data;

const modules = {
  'web aesCbcCryptoModule': (cipherKey: string) => WebCryptoModule.aesCbcCryptoModule({ cipherKey }),
  'web legacyCryptoModule': (cipherKey: string) => WebCryptoModule.legacyCryptoModule({ cipherKey }),
  'node aesCbcCryptoModule': (cipherKey: string) => NodeCryptoModule.aesCbcCryptoModule({ cipherKey }),
  'node legacyCryptoModule': (cipherKey: string) => NodeCryptoModule.legacyCryptoModule({ cipherKey }),
};

describe('crypto module parity with CryptoJS', () => {
  Object.entries(modules).forEach(([name, create]) => {
    it(`${name} decrypts every CryptoJS-era payload (web / node, AES-CBC / legacy)`, async () => {
      for (const vector of vectors.cryptoModule) {
        const module = create(vector.cipherKey);
        const expected = JSON.parse(vector.plaintext);

        for (const ciphertext of [vector.webAesCbc, vector.webLegacy, vector.nodeAesCbc, vector.nodeLegacy])
          expect(asPayload(await module.decrypt(ciphertext))).to.deep.equal(expected);
      }
    });
  });

  it('web and node modules decrypt each other output', async () => {
    const payload = JSON.stringify({ text: 'Hello, 世界! 🌍', n: 42 });

    for (const [encryptWith, decryptWith] of [
      ['web aesCbcCryptoModule', 'node aesCbcCryptoModule'],
      ['node aesCbcCryptoModule', 'web aesCbcCryptoModule'],
      ['web legacyCryptoModule', 'node aesCbcCryptoModule'],
      ['node legacyCryptoModule', 'web aesCbcCryptoModule'],
    ] as const) {
      const encrypted = await modules[encryptWith]('enigma').encrypt(payload);
      expect(asPayload(await modules[decryptWith]('enigma').decrypt(encrypted))).to.deep.equal(JSON.parse(payload));
    }
  });

  it('AES-CBC payload keeps PNED header layout', async () => {
    const encrypted = toArrayBuffer(await WebCryptoModule.aesCbcCryptoModule({ cipherKey: 'enigma' }).encrypt('"hi"'));
    const bytes = new Uint8Array(encrypted);

    expect(decoder.decode(bytes.slice(0, 4))).to.equal('PNED');
    expect(bytes[4]).to.equal(1);
    expect(decoder.decode(bytes.slice(5, 9))).to.equal('ACRH');
    expect(bytes[9]).to.equal(16);
    // header (10) + IV (16) + single padded block (16)
    expect(bytes.byteLength).to.equal(42);
  });

  it('web AES-CBC cryptor round-trips binary data', async () => {
    const module = WebCryptoModule.aesCbcCryptoModule({ cipherKey: 'enigma' });
    const binary = new Uint8Array(256).map((_, index) => index);
    const decrypted = await module.decrypt(await module.encrypt(binary.buffer));

    expect(new Uint8Array(decrypted as ArrayBuffer)).to.deep.equal(binary);
  });

  it('web AES-CBC cryptor rejects empty content', async () => {
    const module = WebCryptoModule.aesCbcCryptoModule({ cipherKey: 'enigma' });

    try {
      await module.encrypt('');
      expect.fail('Expected rejection');
    } catch (error) {
      expect((error as Error).message).to.equal('encryption error. empty content');
    }
  });

  describe('custom cryptors', () => {
    const encoder = new TextEncoder();
    const xor = (data: Uint8Array) => data.map((byte) => byte ^ 0x5a);

    it('web module supports synchronous and asynchronous custom cryptors', async () => {
      const sync: WebICryptor = {
        identifier: 'SYNC',
        encrypt: (data) => ({
          data: xor(new Uint8Array(toArrayBuffer(data))).buffer,
          metadata: new Uint8Array([1, 2]).buffer,
        }),
        decrypt: (data) => xor(new Uint8Array(data.data as ArrayBuffer)).buffer,
        encryptFileData: async () => ({ data: new ArrayBuffer(0), metadata: null }),
        decryptFileData: async () => new ArrayBuffer(0),
      };
      const async: WebICryptor = {
        ...sync,
        identifier: 'ASYN',
        encrypt: async (data) => sync.encrypt(data),
        decrypt: async (data) => sync.decrypt(data),
      };

      for (const cryptor of [sync, async]) {
        const module = WebCryptoModule.withDefaultCryptor(cryptor);
        const decrypted = await module.decrypt(await module.encrypt(encoder.encode('"custom"').buffer));
        expect(asPayload(decrypted)).to.equal('custom');
      }
    });

    it('node module supports synchronous and asynchronous custom cryptors', async () => {
      const sync = {
        identifier: 'SYNC',
        encrypt: (data: BufferSource | string) => ({
          data: Buffer.from(xor(new Uint8Array(toArrayBuffer(data as ArrayBuffer | string)))),
          metadata: Buffer.from([1, 2]),
        }),
        decrypt: (data: { data: Buffer | string }) => {
          const bytes = xor(new Uint8Array(data.data as Buffer));
          return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
        },
        encryptStream: async () => ({ stream: process.stdin, metadataLength: 0 }),
        decryptStream: async () => process.stdin,
      } as unknown as NodeICryptor;
      const async = {
        ...sync,
        identifier: 'ASYN',
        encrypt: async (data: BufferSource | string) => sync.encrypt(data),
        decrypt: async (data: Parameters<NodeICryptor['decrypt']>[0]) => sync.decrypt(data),
      } as NodeICryptor;

      for (const cryptor of [sync, async]) {
        const module = NodeCryptoModule.withDefaultCryptor(cryptor);
        const decrypted = await module.decrypt(await module.encrypt(encoder.encode('"custom"').buffer));
        expect(asPayload(decrypted)).to.equal('custom');
      }
    });
  });
});
