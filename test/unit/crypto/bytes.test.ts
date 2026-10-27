/* global describe, it, afterEach */
/* eslint-disable @typescript-eslint/no-require-imports */

import { expect } from 'chai';

import NobleCryptoPrimitives from '../../../src/react_native/crypto/noble-primitives';
import vectors from '../../fixtures/crypto/legacy-vectors';

type BytesModule = typeof import('../../../src/core/components/cryptography/bytes');
type LegacyCryptoModule = typeof import('../../../src/core/components/cryptography/index');
type Codecs = { TextEncoder: typeof TextEncoder; TextDecoder: typeof TextDecoder };

const globals = globalThis as unknown as Record<string, unknown>;
const nativeCodecs: Codecs = { TextEncoder: globalThis.TextEncoder, TextDecoder: globalThis.TextDecoder };
const bytesPath = require.resolve('../../../src/core/components/cryptography/bytes');
const legacyCryptoPath = require.resolve('../../../src/core/components/cryptography/index');

/**
 * Load real `fast-text-encoding` polyfill the way it initialises on React Native: without native
 * `TextEncoder` / `TextDecoder` and without `Buffer` (otherwise it delegates to `Buffer`).
 */
const loadPolyfillCodecs = (): Codecs => {
  const polyfillPath = require.resolve('fast-text-encoding');
  const saved = { TextEncoder: globals.TextEncoder, TextDecoder: globals.TextDecoder, Buffer: globals.Buffer };
  delete require.cache[polyfillPath];
  delete globals.TextEncoder;
  delete globals.TextDecoder;
  delete globals.Buffer;

  try {
    require(polyfillPath);
    const codecs = { TextEncoder: globals.TextEncoder, TextDecoder: globals.TextDecoder } as Codecs;
    if (codecs.TextDecoder === saved.TextDecoder) throw new Error('fast-text-encoding polyfill not installed');
    return codecs;
  } finally {
    Object.assign(globals, saved);
    delete require.cache[polyfillPath];
  }
};

/**
 * Run `callback` with fresh SDK crypto modules evaluated while `codecs` are installed as globals.
 */
const withCodecs = async <T>(
  codecs: Codecs,
  callback: (modules: { bytes: BytesModule; legacy: LegacyCryptoModule }) => T | Promise<T>,
): Promise<T> => {
  const saved = { TextEncoder: globals.TextEncoder, TextDecoder: globals.TextDecoder };
  const cached = [bytesPath, legacyCryptoPath].map((path) => [path, require.cache[path]] as const);
  Object.assign(globals, codecs);
  cached.forEach(([path]) => delete require.cache[path]);

  try {
    return await callback({ bytes: require(bytesPath), legacy: require(legacyCryptoPath) });
  } finally {
    Object.assign(globals, saved);
    cached.forEach(([path, module]) => {
      if (module) require.cache[path] = module;
      else delete require.cache[path];
    });
  }
};

/**
 * Reference implementation: CryptoJS `Utf8.stringify` (`decodeURIComponent(escape(latin1))`).
 */
const cryptoJSUtf8 = (bytes: Uint8Array): { ok: true; value: string } | { ok: false } => {
  try {
    return { ok: true, value: decodeURIComponent(escape(String.fromCharCode(...bytes))) };
  } catch (_error) {
    return { ok: false };
  }
};

const decodeResult = (bytes: BytesModule, input: Uint8Array): { ok: true; value: string } | { ok: false } => {
  try {
    return { ok: true, value: bytes.decodeUtf8Strict(input) };
  } catch (error) {
    expect((error as Error).message).to.equal('Malformed UTF-8 data');
    return { ok: false };
  }
};

const hex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(' ');

/**
 * Edge cases covering every rule of Unicode well-formed UTF-8 (Table 3-7).
 */
const edgeCases: Record<string, number[]> = {
  empty: [],
  'ASCII and NUL': [0x22, 0x41, 0x00, 0x7f, 0x22],
  'two-byte (C2 80, DF BF)': [0xc2, 0x80, 0xdf, 0xbf],
  'three-byte boundaries (E0 A0 80, EF BF BF)': [0xe0, 0xa0, 0x80, 0xef, 0xbf, 0xbf],
  'last BMP code point before surrogates (ED 9F BF)': [0xed, 0x9f, 0xbf],
  'first code point after surrogates (EE 80 80)': [0xee, 0x80, 0x80],
  'U+FFFD (EF BF BD)': [0xef, 0xbf, 0xbd],
  'four-byte boundaries (F0 90 80 80, F4 8F BF BF)': [0xf0, 0x90, 0x80, 0x80, 0xf4, 0x8f, 0xbf, 0xbf],
  'emoji (F0 9F 8C 8D)': [0xf0, 0x9f, 0x8c, 0x8d],
  'leading BOM (EF BB BF 41)': [0xef, 0xbb, 0xbf, 0x41],
  'two leading BOMs (EF BB BF EF BB BF)': [0xef, 0xbb, 0xbf, 0xef, 0xbb, 0xbf],
  'BOM only (EF BB BF)': [0xef, 0xbb, 0xbf],
  'lone low surrogate (review finding: 22 ED B0 80 22)': [0x22, 0xed, 0xb0, 0x80, 0x22],
  'lone high surrogate (ED A0 80)': [0xed, 0xa0, 0x80],
  'last surrogate (ED BF BF)': [0xed, 0xbf, 0xbf],
  'CESU-8 surrogate pair (ED A0 BD ED B8 80)': [0xed, 0xa0, 0xbd, 0xed, 0xb8, 0x80],
  'overlong two-byte (C0 AF)': [0xc0, 0xaf],
  'overlong C1 (C1 BF)': [0xc1, 0xbf],
  'overlong three-byte (E0 9F BF)': [0xe0, 0x9f, 0xbf],
  'overlong four-byte (F0 8F BF BF)': [0xf0, 0x8f, 0xbf, 0xbf],
  'above U+10FFFF (F4 90 80 80)': [0xf4, 0x90, 0x80, 0x80],
  'invalid lead byte F5': [0xf5, 0x80, 0x80, 0x80],
  'invalid lead byte FF': [0xff],
  'stray continuation (41 80)': [0x41, 0x80],
  'truncated two-byte (C3)': [0x41, 0xc3],
  'truncated three-byte (E2 82)': [0xe2, 0x82],
  'truncated four-byte (F0 9F 8C)': [0xf0, 0x9f, 0x8c],
  'interrupted sequence (E2 41 82)': [0xe2, 0x41, 0x82],
  'continuation byte out of range (C3 C0)': [0xc3, 0xc0],
};

/**
 * Deterministic pseudo-random generator (mulberry32).
 */
const random = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/**
 * Seeded corpus: random byte arrays biased toward UTF-8 boundary bytes, lead + continuation byte sequences and
 * random well-formed strings.
 */
const randomCorpus = (): Uint8Array[] => {
  const next = random(0x5eed);
  const interesting = [
    0x00, 0x22, 0x41, 0x7f, 0x80, 0x8f, 0x90, 0x9f, 0xa0, 0xbb, 0xbd, 0xbf, 0xc0, 0xc1, 0xc2, 0xdf, 0xe0, 0xe1, 0xec,
    0xed, 0xee, 0xef, 0xf0, 0xf1, 0xf3, 0xf4, 0xf5, 0xfe, 0xff,
  ];
  const corpus: Uint8Array[] = [];

  for (let i = 0; i < 5000; i++) {
    const bytes = new Uint8Array(Math.floor(next() * 12));
    for (let j = 0; j < bytes.length; j++)
      bytes[j] = next() < 0.6 ? interesting[Math.floor(next() * interesting.length)] : Math.floor(next() * 256);
    corpus.push(bytes);
  }

  // Lead byte followed by 1-3 continuation bytes (exercises second-byte range rules: E0, ED, F0, F4).
  const leads = [0xc0, 0xc1, 0xc2, 0xdf, 0xe0, 0xe1, 0xed, 0xee, 0xef, 0xf0, 0xf1, 0xf4, 0xf5];
  for (let i = 0; i < 3000; i++) {
    const bytes = new Uint8Array(2 + Math.floor(next() * 3));
    bytes[0] = leads[Math.floor(next() * leads.length)];
    for (let j = 1; j < bytes.length; j++) bytes[j] = 0x80 + Math.floor(next() * 0x40);
    corpus.push(bytes);
  }

  const ranges = [
    [0x00, 0x7f],
    [0x80, 0x7ff],
    [0x800, 0xd7ff],
    [0xe000, 0xffff],
    [0x10000, 0x10ffff],
  ];
  for (let i = 0; i < 1000; i++) {
    let text = '';
    for (let j = Math.floor(next() * 8); j > 0; j--) {
      const [min, max] = ranges[Math.floor(next() * ranges.length)];
      text += String.fromCodePoint(min + Math.floor(next() * (max - min + 1)));
    }
    corpus.push(new nativeCodecs.TextEncoder().encode(text));
  }

  return corpus;
};

describe('strict UTF-8 decoding (CryptoJS Utf8.stringify parity)', () => {
  const environments: Record<string, () => Codecs> = {
    'native codecs': () => nativeCodecs,
    'fast-text-encoding polyfill (React Native, no Buffer)': loadPolyfillCodecs,
  };
  const corpus = randomCorpus();

  afterEach(() => {
    Object.assign(globals, nativeCodecs);
  });

  Object.entries(environments).forEach(([environment, codecs]) => {
    describe(environment, () => {
      it('matches CryptoJS for every well-formedness rule', async () => {
        await withCodecs(codecs(), ({ bytes }) => {
          for (const [name, values] of Object.entries(edgeCases)) {
            const input = new Uint8Array(values);
            expect(decodeResult(bytes, input), `${name} [${hex(input)}]`).to.deep.equal(cryptoJSUtf8(input));
          }
        });
      });

      it('matches CryptoJS for a seeded random corpus', async () => {
        await withCodecs(codecs(), ({ bytes }) => {
          for (const input of corpus)
            expect(decodeResult(bytes, input), `[${hex(input)}]`).to.deep.equal(cryptoJSUtf8(input));
        });
      });

      it('preserves leading BOM (same as CryptoJS)', async () => {
        await withCodecs(codecs(), ({ bytes }) => {
          expect(bytes.decodeUtf8Strict(new Uint8Array([0xef, 0xbb, 0xbf, 0x41]))).to.equal('﻿A');
        });
      });

      it('legacy decryption resolves to null for malformed UTF-8 and decrypts golden vectors', async () => {
        await withCodecs(codecs(), async ({ legacy }) => {
          const primitives = new NobleCryptoPrimitives();
          const crypto = new legacy.default({ cipherKey: 'customKey', useRandomIVs: false }, primitives);
          const digest = await primitives.sha256(new nativeCodecs.TextEncoder().encode('customKey'));
          const key = new Uint8Array(Array.from(hex(digest).replace(/ /g, '').slice(0, 32), (c) => c.charCodeAt(0)));
          const iv = new Uint8Array(Array.from('0123456789012345', (c) => c.charCodeAt(0)));
          const encrypt = async (values: number[]) =>
            Buffer.from(await primitives.aesCbcEncrypt(key, iv, new Uint8Array(values))).toString('base64');

          // Review finding: `"\uDC00"` encoded as lone surrogate bytes.
          expect(await crypto.decrypt(await encrypt([0x22, 0xed, 0xb0, 0x80, 0x22]))).to.equal(null);
          // BOM is preserved, so JSON.parse fails (same as v13).
          expect(await crypto.decrypt(await encrypt([0xef, 0xbb, 0xbf, 0x22, 0x22]))).to.equal(null);
          // Valid non-ASCII payload still decrypts.
          expect(await crypto.decrypt(await encrypt([0x22, 0xf0, 0x9f, 0x8c, 0x8d, 0x22]))).to.equal('🌍');

          for (const vector of vectors.legacy.filter((v) => v.cipherKey === 'customKey')) {
            expect(await crypto.decrypt(vector.staticIV)).to.deep.equal(JSON.parse(vector.plaintext));
          }
        });
      });
    });
  });

  it('preserves leading BOM with decoders which ignore `ignoreBOM` option', async () => {
    class StrippingTextDecoder extends nativeCodecs.TextDecoder {
      constructor(label?: string) {
        super(label);
      }
    }

    await withCodecs({ TextEncoder: nativeCodecs.TextEncoder, TextDecoder: StrippingTextDecoder }, ({ bytes }) => {
      expect(bytes.decodeUtf8Strict(new Uint8Array([0xef, 0xbb, 0xbf, 0x41]))).to.equal('\uFEFFA');
      expect(bytes.decodeUtf8Strict(new Uint8Array([0xef, 0xbb, 0xbf, 0xef, 0xbb, 0xbf]))).to.equal('\uFEFF\uFEFF');
      expect(bytes.decodeUtf8Strict(new Uint8Array([0x41]))).to.equal('A');
    });
  });

  it('module can be loaded with TextDecoder polyfills which reject `fatal` option', async () => {
    // Same behaviour as `fast-text-encoding` used on React Native.
    class NoFatalTextDecoder extends nativeCodecs.TextDecoder {
      constructor(label?: string, options?: TextDecoderOptions) {
        if (options?.fatal)
          throw new RangeError("Failed to construct 'TextDecoder': the 'fatal' option is unsupported.");
        super(label, options);
      }
    }

    await withCodecs({ TextEncoder: nativeCodecs.TextEncoder, TextDecoder: NoFatalTextDecoder }, ({ bytes }) => {
      expect(bytes.decodeUtf8Strict(new Uint8Array([0x22, 0x41, 0x22]))).to.equal('"A"');
    });
  });
});
