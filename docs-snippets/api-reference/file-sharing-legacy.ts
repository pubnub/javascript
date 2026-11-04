import assert from '../harness/assert.js';
import fs from 'node:fs';
import { page, step } from '../harness/step.js';
import { enterWorkdir, FIXTURE_FILE } from '../fixtures/workdir.js';

/**
 * docs/sdks/javascript/api-reference/file-sharing-legacy.md (deprecated `cipherKey` parameter)
 *
 * Sends the fixture with a per-call cipher key and downloads it again. The round trip proves the key is applied:
 * the same file downloaded without the key is not the plain fixture. `sendFileCustomCipherKey` differs from the old
 * docs body on purpose: its `import fs from 'fs'` line cannot sit inside a function, and the `importFS` snippet on
 * the file sharing page already shows that import.
 *
 * Keyset: open (Files must be on, see README keyset setup). Phase: P8 (deprecated parameter). Sneaker Drop story: a
 * shopper sends a product photo with a cipher key and a friend's client downloads it. Proves: the per-call
 * `cipherKey` encrypts on send and decrypts on download. Deliberately does not prove: the normal file flow
 * (file-sharing.ts) or the crypto module path (encryption.ts).
 */
export default page('api-reference/file-sharing-legacy', 'P8', (world) => {
  // Plain bytes of the fixture, the reference for the round trip comparison.
  const original = fs.readFileSync(FIXTURE_FILE);
  // Hands the file id from the send step to the download step (steps share state only through the page closure).
  let uploaded: { id: string } | undefined;

  // The snippet reads './cat_picture.jpg', so the step enters a temp workdir that holds a copy of the fixture and always
  // restores the old directory in `finally`. 60 s timeout covers upload plus the Files service latency.
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

  // `needs` the send step. The snippet's `id: '...'` is a placeholder, so setPh supplies the live file id before the
  // staged rewrite turns the literal into world.ph('fileId'). After the snippet it proves the key matters, then
  // deletes the file (the janitor would also catch it).
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
