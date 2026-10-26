import assert from 'assert';
import { createCipheriv, createHash, randomBytes } from 'crypto';

import WebAesCbcCryptor from '../../src/crypto/modules/WebCryptoModule/aesCbcCryptor';
import NobleCrypto from '../../src/core/components/cryptography/index';
import NodeCrypto from '../../src/core/components/cryptography/node';

/**
 * Expected results below were captured from the previously bundled CryptoJS 3.1.2 implementation, so the noble /
 * node:crypto replacements must not turn data rejected before into successful (altered) payloads, or vice versa.
 */

const CIPHER_KEY = 'k';
const STATIC_IV = Buffer.from('0123456789012345');
const LEGACY_KEY = Buffer.from(createHash('sha256').update(CIPHER_KEY).digest('hex').slice(0, 32));
const ACRH_KEY = createHash('sha256').update(CIPHER_KEY).digest();

const json = (prefix: string, bytes: number[], suffix = '"}') =>
  Buffer.concat([Buffer.from(prefix), Buffer.from(bytes), Buffer.from(suffix)]);

function pad(data: Buffer, scheme: 'pkcs7' | 'x923' | 'iso10126') {
  const length = 16 - (data.length % 16);
  if (scheme === 'pkcs7') return Buffer.concat([data, Buffer.alloc(length, length)]);
  const filler = scheme === 'x923' ? Buffer.alloc(length - 1, 0) : randomBytes(length - 1);
  return Buffer.concat([data, filler, Buffer.from([length])]);
}

function encrypt(key: Buffer, iv: Buffer, data: Buffer, scheme: 'pkcs7' | 'x923' | 'iso10126' = 'pkcs7') {
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(pad(data, scheme)), cipher.final()]);
}

const legacyImplementations = {
  'noble (web / React Native)': (cipherKey = CIPHER_KEY) => new NobleCrypto({ cipherKey, useRandomIVs: false }),
  'node:crypto (Node.js)': (cipherKey = CIPHER_KEY) => new NodeCrypto({ cipherKey, useRandomIVs: false }),
};

const REPLACEMENT_CHARACTER = String.fromCharCode(0xfffd);
const BOM = String.fromCharCode(0xfeff);

describe('legacy crypto CryptoJS compatibility', () => {
  it('rejects malformed UTF-8 and leading BOM after decryption, keeps legitimate U+FFFD', () => {
    // [label, plaintext bytes, legacy `decrypt` result, whether AES-CBC cryptor `decrypt` throws]
    const cases: [string, Buffer, unknown, boolean][] = [
      ['invalid byte', json('{"a":"', [0xff]), null, true],
      ['overlong sequence', json('{"a":"', [0xc0, 0xaf]), null, true],
      ['encoded surrogate', json('{"a":"', [0xed, 0xa0, 0x80]), null, true],
      ['truncated sequence', json('{"a":"', [0xe4, 0xb8]), null, true],
      ['code point above U+10FFFF', json('{"a":"', [0xf4, 0x90, 0x80, 0x80]), null, true],
      ['leading BOM', json('', [0xef, 0xbb, 0xbf], '{"a":1}'), null, false],
      ['legitimate U+FFFD', json('{"a":"', [0xef, 0xbf, 0xbd]), { a: REPLACEMENT_CHARACTER }, false],
      ['BOM inside string', json('{"a":"', [0xef, 0xbb, 0xbf]), { a: BOM }, false],
    ];

    for (const [name, create] of Object.entries(legacyImplementations)) {
      const crypto = create();
      for (const [label, plaintext, expected] of cases) {
        const ciphertext = encrypt(LEGACY_KEY, STATIC_IV, plaintext).toString('base64');
        assert.deepStrictEqual(crypto.decrypt(ciphertext), expected, `${name}: ${label}`);
      }
    }

    // Web AES-CBC cryptor throws on malformed UTF-8 (as CryptoJS did) and returns the exact bytes otherwise.
    const cryptor = new WebAesCbcCryptor({ cipherKey: CIPHER_KEY });
    for (const [label, plaintext, , throws] of cases) {
      const iv = randomBytes(16);
      const data = encrypt(ACRH_KEY, iv, plaintext);
      const decrypt = () => cryptor.decrypt({ metadata: new Uint8Array(iv).buffer, data: new Uint8Array(data).buffer });
      if (throws) assert.throws(decrypt, /Malformed UTF-8 data/, `AesCbcCryptor: ${label}`);
      else assert.deepStrictEqual(Buffer.from(decrypt()), plaintext, `AesCbcCryptor: ${label}`);
    }
  });

  it('accepts non-PKCS#7 padding on decryption and rejects lone surrogates on encryption', () => {
    for (const [name, create] of Object.entries(legacyImplementations)) {
      const crypto = create();
      for (const scheme of ['x923', 'iso10126'] as const) {
        const ciphertext = encrypt(LEGACY_KEY, STATIC_IV, Buffer.from('{"a":1}'), scheme).toString('base64');
        assert.deepStrictEqual(crypto.decrypt(ciphertext), { a: 1 }, `${name}: ${scheme} padding`);
      }

      assert.throws(() => crypto.encrypt('{"a":"\uD800"}'), URIError, `${name}: lone surrogate in data`);
      assert.throws(() => create('\uDC00k').encrypt('{}'), URIError, `${name}: lone surrogate in cipher key`);

      // Well-formed input still produces the known static-IV vector.
      assert.strictEqual(crypto.encrypt(JSON.stringify({ hi: 'there' }), 'customKey'), 'TejX6F2JNqH/gIiGHWN4Cw==');
    }

    assert.throws(() => new WebAesCbcCryptor({ cipherKey: 'k' }).encrypt('{"a":"\uD800"}'), URIError);
    assert.throws(() => new WebAesCbcCryptor({ cipherKey: '\uDC00k' }), URIError);
  });
});
