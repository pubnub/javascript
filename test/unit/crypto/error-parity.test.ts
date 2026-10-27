/* global describe, it */

import { expect } from 'chai';

import { WebCryptoModule } from '../../../src/crypto/modules/WebCryptoModule/webCryptoModule';
import { NodeCryptoModule } from '../../../src/crypto/modules/NodeCryptoModule/nodeCryptoModule';
import NobleCryptoPrimitives from '../../../src/react_native/crypto/noble-primitives';
import { CryptoPrimitives } from '../../../src/core/interfaces/crypto-primitives';
import LegacyCrypto from '../../../src/core/components/cryptography/index';
import NodeCryptoPrimitives from '../../../src/crypto/primitives/node';
import WebCryptoPrimitives from '../../../src/crypto/primitives/web';
import vectors from '../../fixtures/crypto/legacy-vectors';

const implementations: Record<string, () => CryptoPrimitives> = {
  web: () => new WebCryptoPrimitives(),
  node: () => new NodeCryptoPrimitives(),
  noble: () => new NobleCryptoPrimitives(),
};

/**
 * Await promise rejection and return error.
 */
const rejection = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error) {
    return error as Error;
  }
  throw new Error('Expected promise to be rejected');
};

describe('crypto error handling parity', () => {
  describe('legacy cryptor resolves to null on undecryptable data (same as CryptoJS)', () => {
    Object.entries(implementations).forEach(([name, primitives]) => {
      it(`${name}: wrong key, truncated, non-base64 and malformed data`, async () => {
        const vector = vectors.legacy.find((v) => v.cipherKey === 'customKey' && v.plaintext.length > 40)!;
        const staticIV = new LegacyCrypto({ cipherKey: 'wrong-key', useRandomIVs: false }, primitives());
        const randomIV = new LegacyCrypto({ cipherKey: 'customKey', useRandomIVs: true }, primitives());

        expect(await staticIV.decrypt(vector.staticIV)).to.equal(null);
        expect(await randomIV.decrypt(vector.randomIV[0].slice(0, 20))).to.equal(null);
        expect(await randomIV.decrypt('not base64 at all!')).to.equal(null);
        expect(await randomIV.decrypt('')).to.equal(null);
      });

      it(`${name}: invalid UTF-8 plaintext`, async () => {
        const instance = primitives();
        const crypto = new LegacyCrypto({ cipherKey: 'customKey', useRandomIVs: false }, instance);
        // Derive legacy key the same way as cryptor does and encrypt invalid UTF-8 bytes.
        const digest = Buffer.from(await instance.sha256(new TextEncoder().encode('customKey'))).toString('hex');
        const key = new TextEncoder().encode(digest.slice(0, 32));
        const iv = new TextEncoder().encode('0123456789012345');
        const ciphertext = await instance.aesCbcEncrypt(key, iv, new Uint8Array([0x22, 0xff, 0xfe, 0x22]));

        expect(await crypto.decrypt(Buffer.from(ciphertext).toString('base64'))).to.equal(null);
      });

      it(`${name}: leading BOM is not stripped (JSON.parse fails as with CryptoJS)`, async () => {
        const instance = primitives();
        const crypto = new LegacyCrypto({ cipherKey: 'customKey', useRandomIVs: false }, instance);
        const digest = Buffer.from(await instance.sha256(new TextEncoder().encode('customKey'))).toString('hex');
        const key = new TextEncoder().encode(digest.slice(0, 32));
        const iv = new TextEncoder().encode('0123456789012345');
        const ciphertext = await instance.aesCbcEncrypt(key, iv, new TextEncoder().encode('\uFEFF{"a":1}'));

        expect(await crypto.decrypt(Buffer.from(ciphertext).toString('base64'))).to.equal(null);
      });
    });
  });

  describe('crypto module errors keep "Decryption error" prefix', () => {
    const vector = vectors.cryptoModule.find((v) => v.cipherKey === 'customKey')!;

    it('web AES-CBC cryptor with wrong key', async () => {
      const module = WebCryptoModule.aesCbcCryptoModule({ cipherKey: 'enigma' });
      const error = await rejection(module.decrypt(vector.webAesCbc));

      expect(error.message).to.match(/^Decryption error: /);
    });

    it('unknown header version (messages unchanged from v13)', async () => {
      const data = new Uint8Array([...new TextEncoder().encode('PNED'), 2, ...new TextEncoder().encode('ACRH'), 0]);
      const web = WebCryptoModule.aesCbcCryptoModule({ cipherKey: 'enigma' });
      const node = NodeCryptoModule.aesCbcCryptoModule({ cipherKey: 'enigma' });

      expect((await rejection(web.decrypt(data.buffer))).message).to.equal('Decryption error: Unknown cryptor error');
      expect((await rejection(node.decrypt(data.buffer))).message).to.equal('unknown cryptor error');
    });

    it('empty content', async () => {
      for (const module of [
        WebCryptoModule.aesCbcCryptoModule({ cipherKey: 'enigma' }),
        NodeCryptoModule.aesCbcCryptoModule({ cipherKey: 'enigma' }),
      ]) {
        const header = new Uint8Array([...new TextEncoder().encode('PNED'), 1, ...new TextEncoder().encode('ACRH'), 0]);
        const error = await rejection(module.decrypt(header.buffer));
        expect(error.message).to.equal('Decryption error: empty content');
      }
    });
  });
});
