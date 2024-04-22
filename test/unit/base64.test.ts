import assert from 'assert';

import { decode } from '../../src/core/components/base64_codec';

function assertBufferEqual(actual: ArrayBuffer, expected: number[]) {
  assert.deepStrictEqual(new Uint8Array(actual), Uint8Array.from(expected));
}

describe('base64 codec', () => {
  it('should properly handle padding with zero bytes at the end of the data', () => {
    const helloWorld = [72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 33];
    const noZeroBytesResult = decode('SGVsbG8gd29ybGQh');
    const oneZeroBytesResult = decode('SGVsbG8gd29ybGQhAA==');
    const twoZeroBytesResult = decode('SGVsbG8gd29ybGQhAAA=');
    const threeZeroBytesResult = decode('SGVsbG8gd29ybGQhAAAA');

    assertBufferEqual(noZeroBytesResult, helloWorld);
    assertBufferEqual(oneZeroBytesResult, [...helloWorld, 0]);
    assertBufferEqual(twoZeroBytesResult, [...helloWorld, 0, 0]);
    assertBufferEqual(threeZeroBytesResult, [...helloWorld, 0, 0, 0]);
  });

  it('should throw when illegal characters are encountered', () => {
    assert.throws(() => {
      decode('SGVsbG8g-d29ybGQhAA==');
    });
  });
});
