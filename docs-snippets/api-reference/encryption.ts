import assert from '../harness/assert.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import PubNub from 'pubnub';
import { page, step, check } from '../harness/step.js';

/**
 * docs/sdks/javascript/api-reference/encryption.md
 *
 * Local work: nothing goes over the network, but the clients need keys, so they use the open keyset. The page
 * also embeds `configurationCryptoModule` and the two init snippets, which the configuration and shared modules
 * already run. The file samples read `./cat_picture.jpg` from the working directory, so the steps change into a
 * temporary directory that holds a random 2 KiB "picture" and restore the old directory afterwards.
 *
 * Keyset: open. Phase: P4. Sneaker Drop story: a shopper encrypts and decrypts a product photo before sharing it.
 * Proves: the AES-CBC crypto module round trip for text and for files, and the documented error table.
 * Deliberately does not prove: encrypted publish or subscribe traffic (the publish and subscribe modules use the
 * crypto module snippet) and interop with other SDKs' cipher text.
 */
export default page('api-reference/encryption', 'P4', (world) => {
  // One scratch directory for the whole page: the encrypt step writes a file the decrypt step reads back.
  // It sits outside the repo, so the tracked fixture is never touched.
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pn-docs-encryption-'));
  const picture = crypto.randomBytes(2048);

  /** Runs `fn` with `workDir` as the working directory, as the docs file samples assume. */
  const inWorkDir = async <T>(fn: () => Promise<T>): Promise<T> => {
    const previous = process.cwd();
    process.chdir(workDir);
    try {
      return await fn();
    } finally {
      process.chdir(previous);
    }
  };

  // Open keyset client with a crypto module. `label` becomes the user id (run-suffixed by world.client).
  const cryptoClient = (label: string): PubNub =>
    world.client('open', label, { cryptoModule: PubNub.CryptoModule.aesCbcCryptoModule({ cipherKey: 'pubnubenigma' }) });

  // Pure local crypto: no network, no wait. After the closing marker it checks the cipher text differs from the
  // plain text and that the same module reads it back. decrypt() returns an ArrayBuffer of the JSON bytes, not a string.
  step('encryptMessageBasicUsage', { proves: 'encrypt turns a message into cipher text that differs from the plain text, and decrypt reads it back.' }, () => {
    // snippet.encryptMessageBasicUsage
    // Create a crypto module instance with AES-CBC encryption
    const cryptoModule = PubNub.CryptoModule.aesCbcCryptoModule({
      cipherKey: 'pubnubenigma',
    });

    const msgContent = 'This is the data I wish to encrypt.';
    console.log(`Original Message: ${msgContent}`);

    // Encrypt the message
    const encryptedMessage = cryptoModule.encrypt(JSON.stringify(msgContent));
    console.log('message encrypted successfully');

    // Decrypt with the same instance. decrypt() returns an ArrayBuffer with the bytes of the JSON string
    const decryptedBytes = cryptoModule.decrypt(encryptedMessage) as ArrayBuffer;
    const decryptedMessage = JSON.parse(new TextDecoder().decode(decryptedBytes));
    console.log(`Decrypted Message: ${decryptedMessage}`);
    // snippet.end
    assert.notEqual(encryptedMessage, JSON.stringify(msgContent), 'the output is not the plain text');
    // decrypt() returns the bytes of the JSON string that went in, not the string (live finding).
    assert.ok(decryptedBytes instanceof ArrayBuffer, 'decrypt returns an ArrayBuffer');
    assert.equal(decryptedMessage, msgContent, 'the decoded bytes are the original message');
  });

  // Writes the random picture into the scratch dir because the docs sample reads './cat_picture.jpg'. Afterwards it
  // saves the cipher text as './cat_picture_encrypted.jpg' for the next step, which is why that step `needs` this one.
  step('encryptFileBasicUsage', { timeout: 30_000, proves: 'encryptFile produces an encrypted copy of the picture that is saved for the decrypt step.' }, async () => {
    const pubnub = cryptoClient('crypto-file');
    fs.writeFileSync(path.join(workDir, 'cat_picture.jpg'), picture);
    await inWorkDir(async () => {
      // snippet.encryptFileBasicUsage
      // Node.js example
      // import fs from 'fs';

      const fileBuffer = fs.readFileSync('./cat_picture.jpg');

      const file = pubnub.File.create({ data: fileBuffer, name: 'cat_picture.jpg', mimeType: 'image/jpeg' });

      const encryptedFile = await pubnub.encryptFile(file);
      // snippet.end
      const encrypted = Buffer.from(await encryptedFile.toArrayBuffer());
      assert.notDeepEqual(encrypted, picture, 'the file content changed');
      assert.ok(encrypted.length > picture.length, 'the cipher text carries a header and padding');
      // The next step reads this file, as the docs sample does.
      fs.writeFileSync('./cat_picture_encrypted.jpg', encrypted);
    });
  });

  // Reads the file the previous step wrote and proves a byte-for-byte round trip with a second client that has the
  // same cipher key (the key, not the client, decides the result).
  step('decryptFileBasicUsage', { needs: ['encryptFileBasicUsage'], timeout: 30_000, proves: 'decryptFile restores the picture byte for byte with a second client that has the same cipher key.' }, async () => {
    const pubnub = cryptoClient('crypto-file-reader');
    await inWorkDir(async () => {
      // snippet.decryptFileBasicUsage
      // Node.js example.
      // import fs from 'fs';
      const fileBufferData = fs.readFileSync('./cat_picture_encrypted.jpg');

      const fileData = pubnub.File.create({ data: fileBufferData, name: 'cat_picture.jpg', mimeType: 'image/jpeg' });

      const decryptedFile = await pubnub.decryptFile(fileData);
      // snippet.end
      const decrypted = Buffer.from(await decryptedFile.toArrayBuffer());
      assert.deepEqual(decrypted, picture, 'the round trip returns the original bytes');
    });
  });

  // Harness-only check, no snippet. Each assertion mirrors a row of the error table or the prose of the file sections.
  // Error table of the Encrypt file and Decrypt file sections.
  check('encryptionFileErrors', { proves: 'Each row of the file encryption error table is raised for the matching bad call.' }, async () => {
    const withModule = cryptoClient('crypto-errors');
    const file = withModule.File.create({ data: Buffer.from('abc'), name: 'a.txt', mimeType: 'text/plain' });
    await assert.rejects(withModule.encryptFile(undefined as never), /File encryption error\. Source file is missing\./);

    const noModule = world.client('open', 'crypto-none');
    await assert.rejects(noModule.encryptFile(file), /File encryption error\. Crypto module not configured\./);
    // The page says decryptFile resolves with undefined when the client has no cryptoModule.
    assert.equal(await noModule.decryptFile(file), undefined);
  });
});
