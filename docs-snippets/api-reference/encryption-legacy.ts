import assert from '../harness/assert.js';
import PubNub from 'pubnub';
import { page, step, check } from '../harness/step.js';

/**
 * docs/sdks/javascript/api-reference/encryption-legacy.md
 *
 * Deprecated `pubnub.encrypt()` and `pubnub.decrypt()` plus the cipher key arguments. Local work on the open
 * keyset clients. The only embedded sample is `decryptBasicUsage`, the page's other code blocks are signatures,
 * so the rest is asserted in checks. Both deprecated methods log a warning on every call, which is expected.
 *
 * Keyset: open. Phase: P8 (legacy pages). Sneaker Drop story: an old client still decrypts order notes with a
 * cipher key argument. Proves: the real behavior of the deprecated methods, including the surprises the checks
 * record as docs notes (object payloads throw, a wrong key returns null). Deliberately does not prove: the
 * modern crypto module (encryption.ts) or any network traffic.
 */
export default page('api-reference/encryption-legacy', 'P8', (world) => {
  // Open keyset client with an AES-CBC crypto module, the setup the legacy methods fall back to.
  const withModule = (label: string): PubNub =>
    world.client('open', label, { cryptoModule: PubNub.CryptoModule.aesCbcCryptoModule({ cipherKey: 'pubnubenigma' }) });

  // The only embedded sample of the page. Encrypting happens before the snippet (outside the markers) so the snippet
  // can show just decrypt(). The plain text is JSON because decrypt() JSON-parses the result.
  step('decryptBasicUsage', { proves: 'The legacy decrypt returns the original JSON for text encrypted with the same cipher key.' }, () => {
    const pubnub = withModule('legacy-decrypt');
    // `decrypt()` JSON-parses the plain text, so the input has to be a JSON document.
    const encrypted = pubnub.encrypt(JSON.stringify({ item: 'sneaker' })) as string;
    // snippet.decryptBasicUsage
    const decrypted = pubnub.decrypt(encrypted); // Pass the encrypted data as the first parameter in decrypt Method
    // snippet.end
    assert.deepEqual(decrypted, { item: 'sneaker' });
  });

  // Records the behavior of the optional customCipherKey argument. Each assertion below is a fact the page has to
  // state or the signature has to match.
  check('encryptionLegacyCipherKeyArguments', { proves: 'The optional customCipherKey argument of encrypt and decrypt behaves as the page states.' }, () => {
    const pubnub = withModule('legacy-cipher-key');
    const secret = { item: 'sneaker', size: 42 };
    // customCipherKey overrides the configured module and uses the legacy encryption.
    const encrypted = pubnub.encrypt(JSON.stringify(secret), 'another-key');
    assert.equal(typeof encrypted, 'string');
    // The signature on the page takes `string | Payload`, but an object payload throws (live finding).
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

  // Legacy file encryption with an explicit key argument. The last assertion records a docs bug candidate: the
  // method needs a configured module even though the key argument does the work.
  check('encryptionLegacyFileCipherKey', { proves: 'Legacy file encryption with an explicit key works, and records that it still needs a configured module.' }, async () => {
    const pubnub = world.client('open', 'legacy-file', { cipherKey: 'pubnubenigma' });
    const content = Buffer.from('legacy file content');
    const file = pubnub.File.create({ data: content, name: 'legacy.txt', mimeType: 'text/plain' });
    const encrypted = await pubnub.encryptFile('file-key', file);
    assert.notDeepEqual(Buffer.from(await encrypted.toArrayBuffer()), content);
    const decrypted = await pubnub.decryptFile('file-key', encrypted);
    assert.deepEqual(Buffer.from(await decrypted.toArrayBuffer()), content);
    // The page: decryptFile(key, file) rejects when the client has no cryptoModule, even though the legacy
    // decryption does not use it. A client with only a cipherKey has one built in, so this one has none.
    const noModule = world.client('open', 'legacy-file-none');
    await assert.rejects(noModule.decryptFile('file-key', encrypted), /File decryption error\. Crypto module not configured\./);
  });
});
