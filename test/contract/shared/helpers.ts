import { expect } from 'chai';

export function exists<T>(value: T | undefined): asserts value {
  expect(value).to.exist;
}
