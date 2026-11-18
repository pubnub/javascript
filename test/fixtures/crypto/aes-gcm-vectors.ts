/**
 * Typed access to AES-GCM (`ACGM`) decryption vectors.
 *
 * Vectors generated with `node:crypto` (independent of the SDK code under test) in the `ACGM` layout:
 * `PNED | 0x01 | ACGM | 0x0c | nonce (12) | ciphertext | auth tag (16)` (metadata is the nonce only).
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
  ciphertextWithTag: string;
  metadata: string;
  payload: string;
};

const vectors: { source: string; vectors: AesGcmVector[] } = JSON.parse(
  readFileSync(join(__dirname, 'aes-gcm-vectors.json'), 'utf8'),
);

export default vectors;
