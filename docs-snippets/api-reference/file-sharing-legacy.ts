import assert from '../harness/assert.js';
import fs from 'node:fs';
import { page, step } from '../harness/step.js';
import { enterWorkdir, FIXTURE_FILE } from '../fixtures/workdir.js';

/**
 * Example for the deprecated per-call `cipherKey` parameter of file sharing.
 */
export default page('api-reference/file-sharing-legacy', 'P8', (world) => {
  // Plain bytes of the fixture, the reference for the round trip comparison.
  const original = fs.readFileSync(FIXTURE_FILE);
  let uploaded: { id: string } | undefined;

  step('sendFileCustomCipherKey', { timeout: 60_000, proves: 'sendFile with a custom cipher key uploads the picture from a working directory.' }, async () => {
    const pubnub = world.shopper;
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
      uploaded = { id: response.id };
    } finally {
      workdir.restore();
    }
  });

  step('downloadFileCustomCipherKey', { needs: ['sendFileCustomCipherKey'], timeout: 60_000, proves: 'downloadFile with the right custom cipher key returns the file and the wrong key does not.' }, async () => {
    const pubnub = world.shopper;
    assert.ok(uploaded, 'sendFileCustomCipherKey has not run');
    world.setPh('fileId', uploaded.id);
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
    const raw = await pubnub.downloadFile({ channel: world.n('my_channel'), id: uploaded.id, name: 'cat_picture.jpg' });
    assert.notDeepEqual(await raw.toBuffer(), original, 'no key, no plain file');
    await pubnub.deleteFile({ channel: world.n('my_channel'), id: uploaded.id, name: 'cat_picture.jpg' });
  });
});
