import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createClient, shopper } from '../support/clients';
import { withPlaceholders } from '../support/placeholders';
import { enterWorkdir, FIXTURE_FILE } from '../support/file-workdir';

/**
 * Example for the deprecated per-call `cipherKey` parameter of file sharing.
 *
 * Files persist on the shared channel 'my_channel', so each test asserts
 * on the id it got back and an `afterEach` deletes the files the test uploaded. The download sample shows the id placeholder
 * '...': it runs unchanged through a client wrapper (`withPlaceholders`) that swaps it for the real id.
 */
describe('api-reference/file-sharing-legacy', () => {
  // Plain bytes of the fixture, the reference for the round trip comparison.
  const original = fs.readFileSync(FIXTURE_FILE);
  let uploads: string[] = [];

  afterEach(async () => {
    const cleaner = createClient('open', 'file-cleaner');
    const pending = uploads;
    uploads = [];
    for (const id of pending) {
      try {
        await cleaner.deleteFile({ channel: 'my_channel', id, name: 'cat_picture.jpg' });
      } catch {
        // Already deleted by the test itself.
      }
    }
  });

  it('sendFileCustomCipherKey: sendFile with a custom cipher key uploads the picture from a working directory', async function () {
    this.timeout(60_000);
    const pubnub = shopper();
    const workdir = enterWorkdir();
    try {
      // snippet.sendFileCustomCipherKey
      // in Node.js

      const myFile = fs.readFileSync('./cat_picture.jpg');

      const response = await pubnub.sendFile({
        channel: 'my_channel',
        message: 'Look at this picture!',
        file: { data: myFile, name: 'cat_picture.jpg', mimeType: 'image/jpeg' },
        cipherKey: 'myCipherKey',
      });
      console.log('File sent successfully:', response);
      // snippet.end
      assert.ok(response.id);
      uploads.push(response.id);
      // The upload is encrypted: downloading with the key returns the picture, without it the stored payload differs.
      const withKey = await pubnub.downloadFile({
        channel: 'my_channel',
        id: response.id,
        name: 'cat_picture.jpg',
        cipherKey: 'myCipherKey',
      });
      assert.deepEqual(await withKey.toBuffer(), original, 'the uploaded file decrypts with the cipher key');
    } finally {
      workdir.restore();
    }
  });

  it('downloadFileCustomCipherKey: downloadFile with the right custom cipher key returns the file and without the key it does not', async function () {
    this.timeout(60_000);
    const uploader = shopper();
    const sent = await uploader.sendFile({
      channel: 'my_channel',
      message: 'Look at this picture!',
      file: { data: original, name: 'cat_picture.jpg', mimeType: 'image/jpeg' },
      cipherKey: 'myCipherKey',
    });
    uploads.push(sent.id);
    const pubnub = withPlaceholders(shopper(), { '...': sent.id });
    // snippet.downloadFileCustomCipherKey
    const file = await pubnub.downloadFile({
      channel: 'my_channel',
      id: '...',
      name: 'cat_picture.jpg',
      cipherKey: 'myCipherKey',
    });
    // snippet.end
    assert.deepEqual(await file.toBuffer(), original, 'the cipher key decrypts the upload');
    // Without the key the content is the encrypted payload.
    const raw = await uploader.downloadFile({ channel: 'my_channel', id: sent.id, name: 'cat_picture.jpg' });
    assert.notDeepEqual(await raw.toBuffer(), original, 'no key, no plain file');
  });
});
