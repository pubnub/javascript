/**
 * Typed access to CryptoJS golden vectors (see `generate-legacy-vectors.ts`).
 */

import { readFileSync } from 'fs';
import { join } from 'path';

export type LegacyVector = { cipherKey: string; plaintext: string; staticIV: string; randomIV: string[] };

export type CryptoModuleVector = {
  cipherKey: string;
  plaintext: string;
  webAesCbc: string;
  webLegacy: string;
  nodeAesCbc: string;
  nodeLegacy: string;
};

export type HmacVector = { secretKey: string; input: string; signature: string };

const vectors: {
  generatedWith: string;
  legacy: LegacyVector[];
  cryptoModule: CryptoModuleVector[];
  hmac: HmacVector[];
} = JSON.parse(readFileSync(join(__dirname, 'legacy-vectors.json'), 'utf8'));

export default vectors;
