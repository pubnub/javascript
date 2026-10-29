/* global describe, it, afterEach */
/* eslint-disable @typescript-eslint/no-require-imports */

import { expect } from 'chai';
import Module from 'module';

import NobleCryptoPrimitives from '../../../src/react_native/crypto/noble-primitives';

describe('React Native noble primitives', () => {
  const cryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');

  afterEach(() => {
    if (cryptoDescriptor) Object.defineProperty(globalThis, 'crypto', cryptoDescriptor);
  });

  it('generates random bytes with crypto.getRandomValues', () => {
    const primitives = new NobleCryptoPrimitives();
    const first = primitives.randomBytes(16);

    expect(first).to.have.length(16);
    expect(first).to.not.deep.equal(primitives.randomBytes(16));
  });

  it('throws helpful error when secure random generator is missing (no Math.random fallback)', () => {
    Object.defineProperty(globalThis, 'crypto', { value: {}, configurable: true, writable: true });

    expect(() => new NobleCryptoPrimitives().randomBytes(16)).to.throw(/react-native-get-random-values/);
  });

  it('can be constructed without @noble packages and fails with install hint on first use', async () => {
    const modulePath = require.resolve('../../../src/react_native/crypto/noble-primitives');
    const moduleLoader = Module as unknown as { _load: (request: string, ...args: unknown[]) => unknown };
    const originalLoad = moduleLoader._load;
    const cached = require.cache[modulePath];

    delete require.cache[modulePath];
    moduleLoader._load = function (request: string, ...args: unknown[]) {
      if (request.startsWith('@noble/')) throw new Error(`Cannot find module '${request}'`);
      return originalLoad.call(this, request, ...args);
    };

    try {
      const { default: IsolatedPrimitives } = require(modulePath) as { default: typeof NobleCryptoPrimitives };
      const primitives = new IsolatedPrimitives();

      try {
        await primitives.sha256(new Uint8Array([1]));
        expect.fail('Expected rejection');
      } catch (error) {
        expect((error as Error).message).to.include('npm install @noble/ciphers @noble/hashes');
      }
    } finally {
      moduleLoader._load = originalLoad;
      if (cached) require.cache[modulePath] = cached;
    }
  });
});
