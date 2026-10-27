/* global describe, it, afterEach */

import { expect } from 'chai';

import NobleCryptoPrimitives from '../../../src/react_native/crypto/noble-primitives';
import { CryptoPrimitives } from '../../../src/core/interfaces/crypto-primitives';
import LegacyCrypto from '../../../src/core/components/cryptography/index';
import NodeCryptoPrimitives from '../../../src/crypto/primitives/node';
import WebCryptoPrimitives from '../../../src/crypto/primitives/web';
import vectors from '../../fixtures/crypto/legacy-vectors';

/**
 * Golden vectors were generated with CryptoJS (SDK v13). Every native implementation must produce and accept
 * exactly the same ciphertexts.
 */
const implementations: Record<string, () => CryptoPrimitives> = {
  web: () => new WebCryptoPrimitives(),
  node: () => new NodeCryptoPrimitives(),
  noble: () => new NobleCryptoPrimitives(),
};

describe('legacy crypto parity with CryptoJS', () => {
  const originalRandom = Math.random;

  afterEach(() => {
    Math.random = originalRandom;
  });

  Object.entries(implementations).forEach(([name, primitives]) => {
    describe(`${name} primitives`, () => {
      it('produces byte-identical ciphertext with static IV', async () => {
        for (const vector of vectors.legacy) {
          const crypto = new LegacyCrypto({ cipherKey: vector.cipherKey, useRandomIVs: false }, primitives());
          expect(await crypto.encrypt(vector.plaintext), vector.plaintext.slice(0, 40)).to.equal(vector.staticIV);
        }
      });

      it('decrypts CryptoJS static IV ciphertext', async () => {
        for (const vector of vectors.legacy) {
          const crypto = new LegacyCrypto({ cipherKey: vector.cipherKey, useRandomIVs: false }, primitives());
          expect(await crypto.decrypt(vector.staticIV)).to.deep.equal(JSON.parse(vector.plaintext));
        }
      });

      it('decrypts CryptoJS random IV ciphertext', async () => {
        for (const vector of vectors.legacy) {
          const crypto = new LegacyCrypto({ cipherKey: vector.cipherKey, useRandomIVs: true }, primitives());
          for (const ciphertext of vector.randomIV)
            expect(await crypto.decrypt(ciphertext)).to.deep.equal(JSON.parse(vector.plaintext));
        }
      });

      it('supports custom cipher key per call', async () => {
        const vector = vectors.legacy.find((v) => v.cipherKey === 'enigma')!;
        const crypto = new LegacyCrypto({ cipherKey: 'other-key', useRandomIVs: false }, primitives());

        expect(await crypto.encrypt(vector.plaintext, 'enigma')).to.equal(vector.staticIV);
        expect(await crypto.decrypt(vector.staticIV, 'enigma')).to.deep.equal(JSON.parse(vector.plaintext));
      });

      it('uses secure random IVs (not Math.random)', async () => {
        Math.random = () => {
          throw new Error('Math.random must not be used for IV generation');
        };
        const crypto = new LegacyCrypto({ cipherKey: 'customKey', useRandomIVs: true }, primitives());
        const first = await crypto.encrypt('{"hi":"there"}');
        const second = await crypto.encrypt('{"hi":"there"}');

        expect(first).to.not.equal(second);
        expect(Buffer.from(first, 'base64').subarray(0, 16)).to.not.deep.equal(
          Buffer.from(second, 'base64').subarray(0, 16),
        );
      });

      it('stringifies non-string input before encryption', async () => {
        const crypto = new LegacyCrypto({ cipherKey: 'customKey', useRandomIVs: false }, primitives());
        expect(await crypto.encrypt({ hi: 'there' })).to.equal('TejX6F2JNqH/gIiGHWN4Cw==');
      });

      it('returns data as-is when cipher key not set', async () => {
        const crypto = new LegacyCrypto({ useRandomIVs: false }, primitives());

        expect(await crypto.encrypt('{"hi":"there"}')).to.equal('{"hi":"there"}');
        expect(await crypto.decrypt('{"hi":"there"}')).to.equal('{"hi":"there"}');
      });
    });
  });

  describe('cross-implementation compatibility', () => {
    const names = Object.keys(implementations);

    names.forEach((encryptWith) =>
      names.forEach((decryptWith) => {
        it(`encrypts with ${encryptWith} and decrypts with ${decryptWith}`, async () => {
          const payload = JSON.stringify({ text: 'Hello, 世界! 🌍', list: [1, 2, 3], nested: { flag: true } });
          for (const useRandomIVs of [true, false]) {
            const encryptor = new LegacyCrypto({ cipherKey: 'enigma', useRandomIVs }, implementations[encryptWith]());
            const decryptor = new LegacyCrypto({ cipherKey: 'enigma', useRandomIVs }, implementations[decryptWith]());

            expect(await decryptor.decrypt(await encryptor.encrypt(payload))).to.deep.equal(JSON.parse(payload));
          }
        });
      }),
    );
  });

  describe('custom encrypt / decrypt functions', () => {
    it('supports synchronous and asynchronous functions', async () => {
      const sync = new LegacyCrypto(
        { customEncrypt: (data) => `sync:${data}`, customDecrypt: (data) => ({ decrypted: data }) },
        new NodeCryptoPrimitives(),
      );
      const async = new LegacyCrypto(
        {
          customEncrypt: async (data) => `async:${data}`,
          customDecrypt: async (data) => ({ decrypted: data }),
        },
        new NodeCryptoPrimitives(),
      );

      expect(await sync.encrypt('data')).to.equal('sync:data');
      expect(await sync.decrypt('data')).to.deep.equal({ decrypted: 'data' });
      expect(await async.encrypt('data')).to.equal('async:data');
      expect(await async.decrypt('data')).to.deep.equal({ decrypted: 'data' });
    });
  });
});
