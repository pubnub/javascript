/* global describe, it */

import { expect } from 'chai';

import { hmacSha256 } from '../../../src/crypto/primitives/node';
import vectors from '../../fixtures/crypto/legacy-vectors';

describe('request signature HMAC-SHA256 parity with CryptoJS', () => {
  it('produces identical base64 digests', () => {
    for (const vector of vectors.hmac) expect(hmacSha256(vector.input, vector.secretKey)).to.equal(vector.signature);
  });
});
