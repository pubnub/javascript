import assert from '../harness/assert.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import PubNub from 'pubnub';
import { page, step, check } from '../harness/step.js';

/**
 * Encryption examples.
 */
export default page('api-reference/encryption', 'P4', (world) => {
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

  const cryptoClient = (label: string): PubNub =>
    world.client('open', label, { cryptoModule: PubNub.CryptoModule.aesCbcCryptoModule({ cipherKey: 'pubnubenigma' }) });

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
    assert.ok(decryptedBytes instanceof ArrayBuffer, 'decrypt returns an ArrayBuffer');
    assert.equal(decryptedMessage, msgContent, 'the decoded bytes are the original message');
  });

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
      fs.writeFileSync('./cat_picture_encrypted.jpg', encrypted);
    });
  });

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

  check('encryptionFileErrors', { proves: 'Each row of the file encryption error table is raised for the matching bad call.' }, async () => {
    const withModule = cryptoClient('crypto-errors');
    const file = withModule.File.create({ data: Buffer.from('abc'), name: 'a.txt', mimeType: 'text/plain' });
    await assert.rejects(withModule.encryptFile(undefined as never), /File encryption error\. Source file is missing\./);

    const noModule = world.client('open', 'crypto-none');
    await assert.rejects(noModule.encryptFile(file), /File encryption error\. Crypto module not configured\./);
    assert.equal(await noModule.decryptFile(file), undefined);
  });
});
