/**
 * Typed access to AES-GCM (`ACGM`) decryption vectors produced by the PubNub C# SDK reference implementation.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

export type AesGcmVector = {
  name: string;
  expect: 'decrypt';
  cipherKey: string;
  keySha256: string;
  plaintext?: string;
  plaintextHex: string;
  nonce: string;
  tag: string;
  ciphertext: string;
  metadata: string;
  payload: string;
};

const vectors: { source: string; vectors: AesGcmVector[] } = JSON.parse(
  readFileSync(join(__dirname, 'aes-gcm-vectors.json'), 'utf8'),
);

export default vectors;
