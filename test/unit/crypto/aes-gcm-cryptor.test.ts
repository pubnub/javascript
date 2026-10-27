/* global describe, it */

import { createCipheriv, createHash } from 'crypto';
import { PassThrough, Readable } from 'stream';
import { expect } from 'chai';

import { WebCryptoModule } from '../../../src/crypto/modules/WebCryptoModule/webCryptoModule';
import { NodeCryptoModule } from '../../../src/crypto/modules/NodeCryptoModule/nodeCryptoModule';
import WebAesGcmCryptor from '../../../src/crypto/modules/WebCryptoModule/aesGcmCryptor';
import NodeAesGcmCryptor from '../../../src/crypto/modules/NodeCryptoModule/aesGcmCryptor';
import NobleCryptoPrimitives from '../../../src/react_native/crypto/noble-primitives';
import { CryptoPrimitives } from '../../../src/core/interfaces/crypto-primitives';
import NodeCryptoPrimitives from '../../../src/crypto/primitives/node';
import WebCryptoPrimitives from '../../../src/crypto/primitives/web';
import { PubNubFile as WebPubNubFile } from '../../../src/file/modules/web';
import NodePubNubFile from '../../../src/file/modules/node';
import PubNub from '../../../src/node';
import fixtures from '../../fixtures/crypto/aes-gcm-vectors';

/**
 * Vectors were produced by the C# SDK reference implementation. Expected values are never computed with the code
 * under test (independent `node:crypto` is used only to check fixture integrity and to build extra payloads).
 */
const { vectors } = fixtures;
const DECRYPTION_ERROR = 'Decryption error: unable to decrypt data';

const fromHex = (hex: string) => new Uint8Array(Buffer.from(hex, 'hex'));
const toHex = (data: ArrayBuffer | Uint8Array) =>
  Buffer.from(data instanceof Uint8Array ? data : new Uint8Array(data)).toString('hex');
const arrayBuffer = (hex: string) => fromHex(hex).buffer as ArrayBuffer;
const base64 = (hex: string) => Buffer.from(hex, 'hex').toString('base64');

/**
 * Flip lowest bit of the byte at `offset` in HEX string.
 */
const flipBit = (hex: string, offset: number) => {
  const bytes = fromHex(hex);
  bytes[offset] ^= 0x01;
  return toHex(bytes);
};

/**
 * Build `ACGM` payload: `PNED | 0x01 | ACGM | metadata length | metadata | ciphertext`.
 */
const acgmPayload = (metadataHex: string, ciphertextHex: string) =>
  Buffer.from('PNED').toString('hex') +
  '01' +
  Buffer.from('ACGM').toString('hex') +
  (metadataHex.length / 2).toString(16).padStart(2, '0') +
  metadataHex +
  ciphertextHex;

/**
 * Independent AES-256-GCM encryption (used only to build payloads which aren't covered by reference vectors).
 */
const referenceEncrypt = (cipherKey: string, plaintext: string, nonceHex: string) => {
  const key = createHash('sha256').update(cipherKey, 'utf8').digest();
  const cipher = createCipheriv('aes-256-gcm', key, Buffer.from(nonceHex, 'hex'));
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

  return acgmPayload(nonceHex + cipher.getAuthTag().toString('hex'), ciphertext.toString('hex'));
};

/**
 * Await promise rejection and return error.
 */
const rejection = async (promise: Promise<unknown> | (() => unknown)) => {
  try {
    await (typeof promise === 'function' ? promise() : promise);
  } catch (error) {
    return error as Error;
  }

  throw new Error('Expected promise to be rejected');
};

/**
 * Read whole stream content (rejects if stream emits error).
 */
const readStream = (stream: NodeJS.ReadableStream) =>
  new Promise<{ data: Buffer; chunks: number }>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve({ data: Buffer.concat(chunks), chunks: chunks.length }));
  });

const primitives: Record<string, () => CryptoPrimitives> = {
  web: () => new WebCryptoPrimitives(),
  node: () => new NodeCryptoPrimitives(),
  noble: () => new NobleCryptoPrimitives(),
};

const cryptors = {
  web: (cipherKey: string) => WebCryptoModule.aesGcmCryptor({ cipherKey }),
  node: (cipherKey: string) => NodeCryptoModule.aesGcmCryptor({ cipherKey }),
};

/**
 * Cryptor input in format used by crypto modules for specific platform.
 */
const cryptorInput = (platform: keyof typeof cryptors, dataHex: string, metadataHex: string | null) =>
  platform === 'web'
    ? { data: arrayBuffer(dataHex), metadata: metadataHex === null ? null : arrayBuffer(metadataHex) }
    : { data: Buffer.from(dataHex, 'hex'), metadata: metadataHex === null ? null : Buffer.from(metadataHex, 'hex') };

const modules = {
  'web aesCbcCryptoModule': (cipherKey: string) => WebCryptoModule.aesCbcCryptoModule({ cipherKey }),
  'web legacyCryptoModule': (cipherKey: string) => WebCryptoModule.legacyCryptoModule({ cipherKey }),
  'node aesCbcCryptoModule': (cipherKey: string) => NodeCryptoModule.aesCbcCryptoModule({ cipherKey }),
  'node legacyCryptoModule': (cipherKey: string) => NodeCryptoModule.legacyCryptoModule({ cipherKey }),
};

describe('AES-GCM (ACGM) decrypt-only cryptor', () => {
  describe('reference vectors', () => {
    it('are internally consistent (checked with node:crypto)', () => {
      for (const vector of vectors) {
        expect(createHash('sha256').update(vector.cipherKey, 'utf8').digest('hex'), vector.name).to.equal(
          vector.keySha256,
        );
        expect(vector.metadata, vector.name).to.equal(vector.nonce + vector.tag);
        expect(vector.payload, vector.name).to.equal(acgmPayload(vector.metadata, vector.ciphertext));
        if (vector.plaintext !== undefined)
          expect(Buffer.from(vector.plaintext, 'utf8').toString('hex'), vector.name).to.equal(vector.plaintextHex);
      }
    });
  });

  describe('aesGcmDecrypt primitive', () => {
    Object.entries(primitives).forEach(([name, create]) => {
      it(`${name} decrypts every reference vector`, async () => {
        for (const vector of vectors) {
          const decrypted = await create().aesGcmDecrypt(
            fromHex(vector.keySha256),
            fromHex(vector.nonce),
            fromHex(vector.ciphertext),
            fromHex(vector.tag),
          );
          expect(toHex(decrypted), `${name}: ${vector.name}`).to.equal(vector.plaintextHex);
        }
      });

      it(`${name} rejects modified tag`, async () => {
        const [vector] = vectors;
        await rejection(
          create().aesGcmDecrypt(
            fromHex(vector.keySha256),
            fromHex(vector.nonce),
            fromHex(vector.ciphertext),
            fromHex(flipBit(vector.tag, 0)),
          ),
        );
      });
    });
  });

  describe('cryptor', () => {
    (Object.keys(cryptors) as (keyof typeof cryptors)[]).forEach((platform) => {
      describe(platform, () => {
        it('has ACGM identifier', () => {
          expect(cryptors[platform]('enigma').identifier).to.equal('ACGM');
        });

        it('decrypts every reference vector', async () => {
          for (const vector of vectors) {
            const cryptor = cryptors[platform](vector.cipherKey);
            const decrypted = await cryptor.decrypt(
              cryptorInput(platform, vector.ciphertext, vector.metadata) as never,
            );
            expect(toHex(decrypted), vector.name).to.equal(vector.plaintextHex);

            if (platform === 'web') {
              const fileData = await (cryptor as WebAesGcmCryptor).decryptFileData(
                cryptorInput('web', vector.ciphertext, vector.metadata) as never,
              );
              expect(toHex(fileData), vector.name).to.equal(vector.plaintextHex);
            }
          }
        });

        it('rejects wrong key and modified nonce, tag or ciphertext with the same generic error', async () => {
          for (const vector of vectors) {
            const cases: [string, string, string, string][] = [
              ['wrong key', 'wrong', vector.ciphertext, vector.metadata],
              ['modified nonce', vector.cipherKey, vector.ciphertext, flipBit(vector.metadata, 0)],
              ['modified tag', vector.cipherKey, vector.ciphertext, flipBit(vector.metadata, 27)],
              ['modified ciphertext', vector.cipherKey, flipBit(vector.ciphertext, 0), vector.metadata],
            ];

            for (const [name, cipherKey, ciphertext, metadata] of cases) {
              const error = await rejection(
                async () =>
                  await cryptors[platform](cipherKey).decrypt(cryptorInput(platform, ciphertext, metadata) as never),
              );
              expect(error.message, `${vector.name}: ${name}`).to.equal(DECRYPTION_ERROR);
              expect((error as Error & { cause?: unknown }).cause, `${vector.name}: ${name}`).to.equal(undefined);
            }
          }
        });

        it('rejects invalid metadata and empty content', async () => {
          const [vector] = vectors;
          const cryptor = cryptors[platform](vector.cipherKey);

          for (const metadata of [null, vector.nonce, vector.metadata + '00']) {
            const error = await rejection(
              async () => await cryptor.decrypt(cryptorInput(platform, vector.ciphertext, metadata) as never),
            );
            expect(error.message).to.equal('Decryption error: invalid metadata');
          }

          const error = await rejection(
            async () => await cryptor.decrypt(cryptorInput(platform, '', vector.metadata) as never),
          );
          expect(error.message).to.equal('Decryption error: empty content');
        });

        it('refuses encryption', async () => {
          const cryptor = cryptors[platform]('enigma');
          const message = 'Encryption error: AES-GCM cryptor (ACGM) supports decryption only.';

          expect(() => cryptor.encrypt('hello')).to.throw(message);
          if (platform === 'web')
            expect(
              (await rejection((cryptor as WebAesGcmCryptor).encryptFileData(new ArrayBuffer(4)))).message,
            ).to.equal(message);
          else
            expect(
              (await rejection((cryptor as NodeAesGcmCryptor).encryptStream(Readable.from([Buffer.from('a')]))))
                .message,
            ).to.equal(message);
        });

        it('factory requires cipher key', () => {
          expect(() => (platform === 'web' ? WebCryptoModule : NodeCryptoModule).aesGcmCryptor({})).to.throw(
            'Crypto module error: cipher key not set.',
          );
        });
      });
    });
  });

  describe('crypto module', () => {
    Object.entries(modules).forEach(([name, create]) => {
      it(`${name} routes ACGM payloads (ArrayBuffer and base64)`, async () => {
        for (const vector of vectors) {
          const module = create(vector.cipherKey);

          for (const payload of [arrayBuffer(vector.payload), base64(vector.payload)]) {
            const decrypted = await module.decrypt(payload);
            expect(decrypted, vector.name).to.be.instanceOf(ArrayBuffer);
            expect(toHex(decrypted as ArrayBuffer), vector.name).to.equal(vector.plaintextHex);
            if (vector.plaintext !== undefined)
              expect(new TextDecoder().decode(decrypted as ArrayBuffer), vector.name).to.equal(vector.plaintext);
          }
        }
      });

      it(`${name} rejects tampered payload and wrong key with the generic error`, async () => {
        const [vector] = vectors;
        const tampered = acgmPayload(vector.metadata, flipBit(vector.ciphertext, 3));

        expect((await rejection(create(vector.cipherKey).decrypt(base64(tampered)))).message).to.equal(
          DECRYPTION_ERROR,
        );
        expect((await rejection(create('wrong').decrypt(base64(vector.payload)))).message).to.equal(DECRYPTION_ERROR);
      });

      it(`${name} rejects malformed ACGM payloads`, async () => {
        const [vector] = vectors;
        const module = create(vector.cipherKey);

        const shortMetadata = acgmPayload(vector.nonce, vector.ciphertext);
        expect((await rejection(module.decrypt(base64(shortMetadata)))).message).to.match(/^Decryption error/);

        const headerOnly = acgmPayload(vector.metadata, '');
        expect((await rejection(module.decrypt(base64(headerOnly)))).message).to.equal(
          'Decryption error: empty content',
        );
      });

      it(`${name} keeps encrypting with its default cryptor`, async () => {
        const module = create('enigma');
        const encrypted = await module.encrypt('"hi"');
        const bytes = new Uint8Array(typeof encrypted === 'string' ? Buffer.from(encrypted, 'base64') : encrypted);
        const isLegacy = name.includes('legacy');

        if (isLegacy) expect(Buffer.from(bytes.slice(0, 4)).toString()).to.not.equal('PNED');
        else expect(Buffer.from(bytes.slice(5, 9)).toString()).to.equal('ACRH');
      });
    });

    it('refuses ACGM cryptor as default cryptor', () => {
      const message = "Crypto module error: AES-GCM cryptor (ACGM) can't be used as default cryptor.";

      expect(() => new WebCryptoModule({ default: cryptors.web('enigma') })).to.throw(message);
      expect(() => WebCryptoModule.withDefaultCryptor(cryptors.web('enigma'))).to.throw(message);
      expect(() => new NodeCryptoModule({ default: cryptors.node('enigma') })).to.throw(message);
      expect(() => NodeCryptoModule.withDefaultCryptor(cryptors.node('enigma'))).to.throw(message);
    });

    it('requires explicit ACGM registration in custom modules', async () => {
      const [vector] = vectors;
      const withoutGcm = WebCryptoModule.withDefaultCryptor(
        WebCryptoModule.aesCbcCryptoModule({ cipherKey: vector.cipherKey }).defaultCryptor,
      );
      expect((await rejection(withoutGcm.decrypt(base64(vector.payload)))).message).to.equal('Unknown cryptor error');

      const withGcm = new NodeCryptoModule({
        default: NodeCryptoModule.aesCbcCryptoModule({ cipherKey: vector.cipherKey }).defaultCryptor,
        cryptors: [NodeCryptoModule.aesGcmCryptor({ cipherKey: vector.cipherKey })],
      });
      expect(toHex((await withGcm.decrypt(base64(vector.payload))) as ArrayBuffer)).to.equal(vector.plaintextHex);
    });

    it('keeps the first registered cryptor when identifiers repeat', async () => {
      const [vector] = vectors;
      const marker = new TextEncoder().encode('first').buffer;
      const first = {
        identifier: 'ACGM',
        encrypt: () => ({ data: new ArrayBuffer(0), metadata: null }),
        encryptFileData: async () => ({ data: new ArrayBuffer(0), metadata: null }),
        decrypt: () => marker,
        decryptFileData: async () => marker,
      };
      const module = new WebCryptoModule({
        default: WebCryptoModule.aesCbcCryptoModule({ cipherKey: vector.cipherKey }).defaultCryptor,
        cryptors: [first, WebCryptoModule.aesGcmCryptor({ cipherKey: vector.cipherKey })],
      });

      expect(await module.decrypt(base64(vector.payload))).to.equal(marker);
    });
  });

  describe('client configured with cipherKey', () => {
    it('decrypts ACGM payload produced by another SDK', async () => {
      const pubnub = new PubNub({ subscribeKey: 'demo', publishKey: 'demo', userId: 'myUUID', cipherKey: 'enigma' });
      const payload = referenceEncrypt('enigma', JSON.stringify({ text: 'hi' }), '0f0e0d0c0b0a090807060504');

      expect(await pubnub.decrypt(base64(payload))).to.deep.equal({ text: 'hi' });
      pubnub.destroy();
    });
  });

  describe('files', () => {
    it('web module decrypts ACGM file with the routed cryptor', async () => {
      for (const vector of vectors) {
        const module = WebCryptoModule.aesCbcCryptoModule({ cipherKey: vector.cipherKey });
        const file = WebPubNubFile.create({ name: 'file.bin', data: arrayBuffer(vector.payload) } as never);
        const decrypted = await module.decryptFile(file, WebPubNubFile);

        expect(toHex(await decrypted!.data.arrayBuffer()), vector.name).to.equal(vector.plaintextHex);
      }
    });

    it('node module decrypts ACGM file from Buffer', async () => {
      for (const vector of vectors) {
        const module = NodeCryptoModule.aesCbcCryptoModule({ cipherKey: vector.cipherKey });
        const file = NodePubNubFile.create({ name: 'file.bin', data: Buffer.from(vector.payload, 'hex') });
        const decrypted = await module.decryptFile(file, NodePubNubFile);

        expect((await decrypted!.toBuffer()).toString('hex'), vector.name).to.equal(vector.plaintextHex);
      }
    });

    /**
     * Create stream-based file. `chunked` delivers header and body in separate delayed chunks (like a download),
     * otherwise the whole payload is buffered before decryption starts.
     */
    const streamFile = (payloadHex: string, chunked = false) => {
      const stream = new PassThrough();
      const file = NodePubNubFile.create({ name: 'file.bin', stream });
      const payload = Buffer.from(payloadHex, 'hex');
      file.contentLength = payload.byteLength;

      if (!chunked) stream.end(payload);
      else {
        stream.write(payload.subarray(0, 12));
        setTimeout(() => stream.write(payload.subarray(12, 30)), 5);
        setTimeout(() => stream.end(payload.subarray(30)), 10);
      }

      return file;
    };

    [false, true].forEach((chunked) => {
      it(`node module decrypts ACGM file from ${chunked ? 'chunked' : 'buffered'} stream`, async () => {
        for (const vector of vectors) {
          const module = NodeCryptoModule.aesCbcCryptoModule({ cipherKey: vector.cipherKey });
          const decrypted = await module.decryptFile(streamFile(vector.payload, chunked), NodePubNubFile);
          const { data } = await readStream(decrypted!.data as Readable);

          expect(data.toString('hex'), vector.name).to.equal(vector.plaintextHex);
        }
      });
    });

    it('node module never releases plaintext from tampered stream', async () => {
      const [vector] = vectors;
      const module = NodeCryptoModule.aesCbcCryptoModule({ cipherKey: vector.cipherKey });
      const tampered = acgmPayload(flipBit(vector.metadata, 20), vector.ciphertext);
      const decrypted = await module.decryptFile(streamFile(tampered), NodePubNubFile);
      const stream = decrypted!.data as Readable;
      let chunks = 0;
      stream.on('data', () => chunks++);

      const error = await new Promise<Error>((resolve) => stream.on('error', resolve));
      expect(error.message).to.equal(DECRYPTION_ERROR);
      expect(chunks).to.equal(0);
    });
  });
});
