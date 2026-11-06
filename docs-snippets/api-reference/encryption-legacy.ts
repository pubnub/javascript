import assert from '../harness/assert.js';
import PubNub from 'pubnub';
import { page, step, check } from '../harness/step.js';

/**
 * Examples for the deprecated `encrypt()` and `decrypt()` methods and the cipher key arguments. Both methods log a
 * deprecation warning on every call.
 */
export default page('api-reference/encryption-legacy', 'P8', (world) => {
  // Open keyset client with an AES-CBC crypto module, the setup the legacy methods fall back to.
  const withModule = (label: string): PubNub =>
    world.client('open', label, { cryptoModule: PubNub.CryptoModule.aesCbcCryptoModule({ cipherKey: 'pubnubenigma' }) });

  step('decryptBasicUsage', { proves: 'The legacy decrypt returns the original JSON for text encrypted with the same cipher key.' }, () => {
    const pubnub = withModule('legacy-decrypt');
    // `decrypt()` JSON-parses the plain text, so the input has to be a JSON document.
    const encrypted = pubnub.encrypt(JSON.stringify({ item: 'sneaker' })) as string;
    // snippet.decryptBasicUsage
    const decrypted = pubnub.decrypt(encrypted); // Pass the encrypted data as the first parameter in decrypt Method
    // snippet.end
    assert.deepEqual(decrypted, { item: 'sneaker' });
  });

  check('encryptionLegacyCipherKeyArguments', { proves: 'The optional customCipherKey argument of encrypt and decrypt behaves as the page states.' }, () => {
    const pubnub = withModule('legacy-cipher-key');
    const secret = { item: 'sneaker', size: 42 };
    // customCipherKey overrides the configured module and uses the legacy encryption.
    const encrypted = pubnub.encrypt(JSON.stringify(secret), 'another-key');
    assert.equal(typeof encrypted, 'string');
    assert.throws(() => pubnub.encrypt(secret as never, 'another-key'), TypeError);
    assert.deepEqual(pubnub.decrypt(encrypted, 'another-key'), secret);
    // A wrong key does not throw with the legacy encryption: decrypt() returns null.
    assert.equal(pubnub.decrypt(encrypted, 'wrong-key'), null);
    // Without a configured module or a key, the data comes back unchanged.
    const bare = world.client('open', 'legacy-bare');
    assert.equal(bare.encrypt('plain'), 'plain');
  });

  // The error row of the decrypt section: unreadable input throws instead of returning garbage.
  check('encryptionLegacyDecryptError', { proves: 'Decrypting unreadable input throws instead of returning garbage.' }, () => {
    const pubnub = withModule('legacy-decrypt-error');
    // cryptoModule rejects data it cannot read with an Error that describes the reason.
    assert.throws(() => pubnub.decrypt(''), /Decryption error/);
  });

  check('encryptionLegacyFileCipherKey', { proves: 'Legacy file encryption with an explicit key works, and records that it still needs a configured module.' }, async () => {
    const pubnub = world.client('open', 'legacy-file', { cipherKey: 'pubnubenigma' });
    const content = Buffer.from('legacy file content');
    const file = pubnub.File.create({ data: content, name: 'legacy.txt', mimeType: 'text/plain' });
    const encrypted = await pubnub.encryptFile('file-key', file);
    assert.notDeepEqual(Buffer.from(await encrypted.toArrayBuffer()), content);
    const decrypted = await pubnub.decryptFile('file-key', encrypted);
    assert.deepEqual(Buffer.from(await decrypted.toArrayBuffer()), content);
    const noModule = world.client('open', 'legacy-file-none');
    await assert.rejects(noModule.decryptFile('file-key', encrypted), /File decryption error\. Crypto module not configured\./);
  });
});
