/**
 * Golden vectors generator.
 *
 * Captured once from the CryptoJS-based implementation (SDK v13.x) before it was removed. Output is
 * committed as `legacy-vectors.json` and used by parity tests to guarantee that the native crypto
 * implementations produce / accept exactly the same ciphertexts.
 *
 * Usage (only meaningful against the v13 sources): `npx tsx test/fixtures/crypto/generate-legacy-vectors.ts`
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

import LegacyCrypto from '../../../src/core/components/cryptography/index';
import { WebCryptoModule } from '../../../src/crypto/modules/WebCryptoModule/webCryptoModule';
import { NodeCryptoModule } from '../../../src/crypto/modules/NodeCryptoModule/nodeCryptoModule';
import { encode } from '../../../src/core/components/base64_codec';

const keys = ['customKey', 'enigma', 'ключ-🔑-κλειδί', 'k'.repeat(37) + '0123456789'.repeat(6) + '!@#'];
const plaintexts: unknown[] = [
  { hi: 'there' },
  { nested: { list: [1, 2, 3, { deep: true }], text: 'value', n: null } },
  'Hello, 世界! 🌍🚀 ñáéíóú',
  '',
  42,
  3.14159,
  'x'.repeat(16384),
  'with\u0000null\u0000bytes',
  ['array', 1, false],
];

/* eslint-disable @typescript-eslint/no-explicit-any */
const toB64 = (data: ArrayBuffer | string) => (typeof data === 'string' ? data : encode(data));

const main = async () => {
  const legacy: any[] = [];
  const cryptoModule: any[] = [];

  for (const cipherKey of keys) {
    const staticIV = new LegacyCrypto({ cipherKey, useRandomIVs: false });
    const randomIV = new LegacyCrypto({ cipherKey, useRandomIVs: true });

    for (const value of plaintexts) {
      const plaintext = JSON.stringify(value);
      // Keep fixture size reasonable: large payload only for the first key.
      if (plaintext.length > 1024 && cipherKey !== keys[0]) continue;

      legacy.push({
        cipherKey,
        plaintext,
        staticIV: staticIV.encrypt(plaintext),
        randomIV: [randomIV.encrypt(plaintext), randomIV.encrypt(plaintext)],
      });

      const webAes = WebCryptoModule.aesCbcCryptoModule({ cipherKey });
      const webLegacy = WebCryptoModule.legacyCryptoModule({ cipherKey });
      const nodeAes = NodeCryptoModule.aesCbcCryptoModule({ cipherKey });
      const nodeLegacy = NodeCryptoModule.legacyCryptoModule({ cipherKey });
      cryptoModule.push({
        cipherKey,
        plaintext,
        webAesCbc: toB64(webAes.encrypt(plaintext)),
        webLegacy: toB64(webLegacy.encrypt(plaintext)),
        nodeAesCbc: toB64(nodeAes.encrypt(plaintext)),
        nodeLegacy: toB64(nodeLegacy.encrypt(plaintext)),
      });
    }
  }

  const signatureInputs = [
    'GET\npub-c-key\n/publish/pub-c-key/sub-c-key/0/channel/0/%22hello%22\nauth=token&pnsdk=PubNub-JS-Nodejs%2F13.1.3&timestamp=1700000000&uuid=user\n',
    'POST\npub-c-key\n/v3/pam/sub-c-key/grant\npnsdk=PubNub-JS-Nodejs%2F13.1.3&timestamp=1700000000&uuid=user\n{"ttl":15,"permissions":{"resources":{"channels":{"ch-ünïcode":1}}}}',
  ];
  const secretKeys = ['sec-c-test-only-not-a-real-key', 'sëcret-🔐'];
  const hmac: any[] = [];
  for (const secretKey of secretKeys) {
    const crypto = new LegacyCrypto({ secretKey });
    for (const input of signatureInputs) hmac.push({ secretKey, input, signature: crypto.HMACSHA256(input) });
  }

  const output = { generatedWith: 'CryptoJS v3.1.2 (pubnub v13.1.3)', legacy, cryptoModule, hmac };
  writeFileSync(join(__dirname, 'legacy-vectors.json'), JSON.stringify(output, null, 2) + '\n');
  console.log(`legacy: ${legacy.length}, cryptoModule: ${cryptoModule.length}, hmac: ${hmac.length}`);
};

main();
