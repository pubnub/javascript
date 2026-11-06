/* global describe, beforeEach, afterEach, it, before, after */

import * as zlib from 'zlib';
import assert from 'assert';
import nock from 'nock';

import { ICryptoModule } from '../../../src/core/interfaces/crypto-module';
import LegacyCrypto from '../../../src/core/components/cryptography/index';
import NodeCryptoPrimitives from '../../../src/crypto/primitives/node';
import PubNub from '../../../src/node/index';
import vectors from '../../fixtures/crypto/legacy-vectors';
import utils from '../../utils';

/**
 * AES-CBC payload encrypted with `customKey` (deterministically fails to decrypt with `enigma` key).
 */
const wrongKeyPayload = vectors.cryptoModule[0].webAesCbc;

/**
 * Wrap crypto module so decryption of earlier payloads completes later (verifies that asynchronous decryption
 * preserves original message order).
 */
const withReversedDecryptionTiming = (module: ICryptoModule): ICryptoModule => {
  let calls = 0;

  return {
    set logger(_logger: never) {},
    encrypt: (data) => module.encrypt(data),
    decrypt: async (data) => {
      const delay = Math.max(0, 40 - calls++ * 10);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return module.decrypt(data);
    },
    encryptFile: (file, File) => module.encryptFile(file, File),
    decryptFile: (file, File) => module.decryptFile(file, File),
  };
};

/**
 * Legacy (static IV) encryption used to compute expected request paths.
 */
const legacyEncrypt = (cipherKey: string, data: string) =>
  new LegacyCrypto({ cipherKey, useRandomIVs: false }, new NodeCryptoPrimitives()).encrypt(data);

describe('asynchronous crypto in customer-facing APIs (non-breaking)', () => {
  let pubnub: PubNub;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey',
      uuid: 'myUUID',
      cipherKey: 'customKey',
      useRandomIVs: false,
      enableEventEngine: false,
      // @ts-expect-error Force override default value.
      useRequestId: false,
    });
  });

  afterEach(() => {
    pubnub.destroy(true);
  });

  describe('publish', () => {
    const encryptedPath = '/publish/myPublishKey/mySubKey/0/ch1/0/%22TejX6F2JNqH%2FgIiGHWN4Cw%3D%3D%22';

    it('sends byte-identical encrypted payload (Promise API)', async () => {
      const scope = utils
        .createNock()
        .get(encryptedPath)
        .query(true)
        .reply(200, '[1,"Sent","14647523059145592"]', { 'content-type': 'text/javascript' });

      const response = await pubnub.publish({ channel: 'ch1', message: { hi: 'there' } });

      assert.equal(response.timetoken, '14647523059145592');
      assert.equal(scope.isDone(), true);
    });

    it('sends byte-identical encrypted payload (callback API)', (done) => {
      const scope = utils
        .createNock()
        .get(encryptedPath)
        .query(true)
        .reply(200, '[1,"Sent","14647523059145592"]', { 'content-type': 'text/javascript' });

      pubnub.publish({ channel: 'ch1', message: { hi: 'there' } }, (status, response) => {
        try {
          assert.equal(status.error, false);
          assert.equal(response?.timetoken, '14647523059145592');
          assert.equal(scope.isDone(), true);
          done();
        } catch (error) {
          done(error);
        }
      });
    });

    it('sends encrypted payload in POST body', async () => {
      let body: string | undefined;
      const scope = utils
        .createNock()
        .post('/publish/myPublishKey/mySubKey/0/ch1/0', (requestBody) => {
          // Body is deflate-compressed by the SDK (compressible request).
          body = zlib.inflateSync(Buffer.from(requestBody as string, 'hex')).toString('utf8');
          return true;
        })
        .query(true)
        .reply(200, '[1,"Sent","14647523059145592"]', { 'content-type': 'text/javascript' });

      await pubnub.publish({ channel: 'ch1', message: { hi: 'there' }, sendByPost: true });

      assert.equal(scope.isDone(), true);
      assert.equal(body, '"TejX6F2JNqH/gIiGHWN4Cw=="');
    });

    it('fire() uses the same encryption path', async () => {
      const scope = utils
        .createNock()
        .get(encryptedPath)
        .query((query) => query.store === '0' && query.norep === 'true')
        .reply(200, '[1,"Sent","14647523059145592"]', { 'content-type': 'text/javascript' });

      await pubnub.fire({ channel: 'ch1', message: { hi: 'there' } });

      assert.equal(scope.isDone(), true);
    });

    const failingClient = () =>
      new PubNub({
        subscribeKey: 'mySubKey',
        publishKey: 'myPublishKey',
        uuid: 'myUUID',
        logLevel: PubNub.LogLevel.None,
        cryptoModule: {
          set logger(_logger: never) {},
          encrypt: async () => {
            throw new Error('Encryption error: boom');
          },
        } as unknown as ICryptoModule,
      });

    it('rejects with PubNubError status when encryption fails and does not send request', async () => {
      const failing = failingClient();
      const scope = utils.createNock().get(/\/publish\/.*/).query(true).reply(200, '[1,"Sent","1"]');

      try {
        await failing.publish({ channel: 'ch1', message: { hi: 'there' } });
        assert.fail('Expected publish to be rejected');
      } catch (error) {
        const { status } = error as { status?: { error: boolean; operation: string; errorData?: Error } };
        assert.equal(status?.error, true);
        assert.equal(status?.operation, 'PNPublishOperation');
        assert.match(String(status?.errorData?.message ?? error), /Encryption error: boom/);
      } finally {
        assert.equal(scope.isDone(), false);
        failing.destroy(true);
      }
    });

    it('notifies callback with error status when encryption fails', (done) => {
      const failing = failingClient();

      failing.publish({ channel: 'ch1', message: { hi: 'there' } }, (status, response) => {
        try {
          assert.equal(status.error, true);
          assert.equal(status.operation, 'PNPublishOperation');
          assert.equal(response, null);
          done();
        } catch (error) {
          done(error);
        } finally {
          failing.destroy(true);
        }
      });
    });

    it('schedules encrypted publishes in call order even if encryption completes out of order', async () => {
      const cryptoModule = PubNub.CryptoModule.aesCbcCryptoModule({ cipherKey: 'enigma' });
      let call = 0;
      const client = new PubNub({
        subscribeKey: 'mySubKey',
        publishKey: 'myPublishKey',
        uuid: 'myUUID',
        cryptoModule: {
          set logger(_logger: never) {},
          // First publish finishes encryption last.
          encrypt: async (data: ArrayBuffer | string) => {
            const delay = call++ === 0 ? 40 : 0;
            await new Promise((resolve) => setTimeout(resolve, delay));
            return cryptoModule.encrypt(data);
          },
        } as unknown as ICryptoModule,
      });
      const received: string[] = [];
      const scope = utils
        .createNock()
        .get((uri) => {
          if (!uri.startsWith('/publish/myPublishKey/mySubKey/0/ch1/0/')) return false;
          received.push(decodeURIComponent(uri.split('?')[0].split('/').pop()!));
          return true;
        })
        .times(3)
        .query(true)
        .reply(200, '[1,"Sent","1"]', { 'content-type': 'text/javascript' });

      await Promise.all([
        client.publish({ channel: 'ch1', message: 'A' }),
        client.publish({ channel: 'ch1', message: 'B' }),
        client.publish({ channel: 'ch1', message: 'C' }),
      ]);

      const messages = await Promise.all(received.map((payload) => cryptoModule.decrypt(JSON.parse(payload))));
      assert.equal(scope.isDone(), true);
      assert.deepEqual(
        messages.map((message) => JSON.parse(new TextDecoder().decode(message as ArrayBuffer))),
        ['A', 'B', 'C'],
      );
      client.destroy(true);
    });
  });

  describe('publishFile', () => {
    it('sends byte-identical encrypted file message', async () => {
      const plaintext = JSON.stringify({ file: { name: 'cat.jpg', id: 'file-id' }, message: { hi: 'there' } });
      const encrypted = encodeURIComponent(JSON.stringify(await legacyEncrypt('customKey', plaintext)));
      const scope = utils
        .createNock()
        .get(`/v1/files/publish-file/myPublishKey/mySubKey/0/ch1/0/${encrypted}`)
        .query(true)
        .reply(200, '[1,"Sent","14647523059145592"]', { 'content-type': 'text/javascript' });

      const response = await pubnub.publishFile({
        channel: 'ch1',
        fileId: 'file-id',
        fileName: 'cat.jpg',
        message: { hi: 'there' },
      });

      assert.equal(response.timetoken, '14647523059145592');
      assert.equal(scope.isDone(), true);
    });
  });

  describe('subscribe', () => {
    it('delivers decrypted messages in original order with decryption errors', (done) => {
      const cryptoModule = PubNub.CryptoModule.aesCbcCryptoModule({ cipherKey: 'enigma' });

      Promise.all([
        cryptoModule.encrypt(JSON.stringify({ order: 1 })),
        cryptoModule.encrypt(JSON.stringify({ order: 4 })),
        cryptoModule.encrypt(JSON.stringify({ message: 'file', file: { id: 'file-id', name: 'cat.jpg' } })),
      ]).then(([first, fourth, file]) => {
        const b64 = (data: ArrayBuffer | string) =>
          typeof data === 'string' ? data : Buffer.from(data).toString('base64');
        const envelope = (data: unknown, timetoken: string, type?: number) => ({
          a: '4',
          f: 0,
          i: 'client1',
          p: { t: timetoken, r: 1 },
          k: 'mySubKey',
          c: 'ch1',
          d: data,
          ...(type !== undefined ? { e: type } : {}),
        });
        const client = new PubNub({
          subscribeKey: 'mySubKey',
          publishKey: 'myPublishKey',
          uuid: 'myUUID',
          enableEventEngine: false,
          // @ts-expect-error Force override default value.
          useRequestId: false,
          cryptoModule: withReversedDecryptionTiming(cryptoModule),
        });
        const scope = utils
          .createNock()
          .get('/v2/subscribe/mySubKey/ch1/0')
          .query(true)
          .reply(
            200,
            JSON.stringify({
              t: { t: '3', r: 1 },
              m: [
                envelope(b64(first), '1'),
                envelope({ order: 2 }, '2'),
                envelope(wrongKeyPayload, '3'),
                envelope(b64(file), '35', 4),
                envelope(b64(fourth), '4'),
              ],
            }),
            { 'content-type': 'text/javascript' },
          );
        utils.createNock().get('/v2/subscribe/mySubKey/ch1/0').query(true).delay(5000).reply(200, '{}');

        const received: { timetoken: string; message: unknown; error?: string }[] = [];
        const files: { timetoken: string; file?: { id: string } }[] = [];
        const finish = () => {
          if (received.length !== 4 || files.length !== 1) return;
          try {
            assert.equal(scope.isDone(), true);
            assert.deepEqual(
              received.map(({ timetoken }) => timetoken),
              ['1', '2', '3', '4'],
            );
            assert.deepEqual(received[0].message, { order: 1 });
            assert.deepEqual(received[1].message, { order: 2 });
            assert.equal(received[2].message, wrongKeyPayload);
            assert.match(received[2].error!, /^Error while decrypting message content: /);
            assert.deepEqual(received[3].message, { order: 4 });
            assert.equal(files[0].file?.id, 'file-id');
            client.destroy(true);
            done();
          } catch (error) {
            client.destroy(true);
            done(error);
          }
        };

        client.addListener({
          message: (event) => {
            received.push(event);
            finish();
          },
          file: (event) => {
            files.push(event);
            finish();
          },
        });
        client.subscribe({ channels: ['ch1'] });
      }, done);
    });
  });

  describe('history', () => {
    it('fetchMessages keeps channel and message order with asynchronous decryption', async () => {
      const cryptoModule = PubNub.CryptoModule.aesCbcCryptoModule({ cipherKey: 'enigma' });
      const b64 = (data: ArrayBuffer | string) => (typeof data === 'string' ? data : Buffer.from(data).toString('base64'));
      const [a1, a3, b1] = await Promise.all([
        cryptoModule.encrypt('{"n":"a1"}'),
        cryptoModule.encrypt('{"n":"a3"}'),
        cryptoModule.encrypt('{"n":"b1"}'),
      ]);
      const client = new PubNub({
        subscribeKey: 'mySubKey',
        uuid: 'myUUID',
        cryptoModule: withReversedDecryptionTiming(cryptoModule),
      });
      const scope = utils
        .createNock()
        .get('/v3/history/sub-key/mySubKey/channel/chA,chB')
        .query(true)
        .reply(
          200,
          JSON.stringify({
            channels: {
              chA: [
                { message: b64(a1), timetoken: '1' },
                { message: { n: 'a2' }, timetoken: '2' },
                { message: b64(a3), timetoken: '3' },
              ],
              chB: [{ message: b64(b1), timetoken: '4' }],
            },
          }),
          { 'content-type': 'text/javascript' },
        );

      const response = await client.fetchMessages({ channels: ['chA', 'chB'] });

      assert.equal(scope.isDone(), true);
      assert.deepEqual(Object.keys(response.channels), ['chA', 'chB']);
      assert.deepEqual(
        response.channels.chA.map(({ message }) => message),
        [{ n: 'a1' }, { n: 'a2' }, { n: 'a3' }],
      );
      assert.deepEqual(response.channels.chB[0].message, { n: 'b1' });
      client.destroy(true);
    });

    it('history keeps message order with asynchronous decryption', async () => {
      const cryptoModule = PubNub.CryptoModule.aesCbcCryptoModule({ cipherKey: 'enigma' });
      const b64 = (data: ArrayBuffer | string) => (typeof data === 'string' ? data : Buffer.from(data).toString('base64'));
      const [m1, m3] = await Promise.all([cryptoModule.encrypt('{"n":1}'), cryptoModule.encrypt('{"n":3}')]);
      const client = new PubNub({
        subscribeKey: 'mySubKey',
        uuid: 'myUUID',
        cryptoModule: withReversedDecryptionTiming(cryptoModule),
      });
      const scope = utils
        .createNock()
        .get('/v2/history/sub-key/mySubKey/channel/ch1')
        .query(true)
        .reply(
          200,
          JSON.stringify([
            [
              { message: b64(m1), timetoken: '1' },
              { message: wrongKeyPayload, timetoken: '2' },
              { message: b64(m3), timetoken: '3' },
            ],
            '1',
            '3',
          ]),
          { 'content-type': 'text/javascript' },
        );

      const response = await client.history({ channel: 'ch1' });

      assert.equal(scope.isDone(), true);
      assert.deepEqual(
        response.messages.map(({ entry }) => entry),
        [{ n: 1 }, wrongKeyPayload, { n: 3 }],
      );
      assert.match(response.messages[1].error!, /^Error while decrypting message content: /);
      client.destroy(true);
    });
  });

  describe('public encrypt / decrypt (breaking: now asynchronous)', () => {
    it('returns Promises with v13-compatible results', async () => {
      const encrypted = pubnub.encrypt(JSON.stringify({ hi: 'there' }));

      assert.ok(encrypted instanceof Promise);
      assert.equal(await encrypted, 'TejX6F2JNqH/gIiGHWN4Cw==');
      assert.deepEqual(await pubnub.decrypt('TejX6F2JNqH/gIiGHWN4Cw=='), { hi: 'there' });
    });
  });
});
