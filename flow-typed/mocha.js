declare function describe(name: string, callback: () => void): void;

declare function before(callback: () => void): void;
declare function beforeEach(callback: () => void): void;

declare function after(callback: () => void): void;
declare function afterEach(callback: () => void): void;

declare interface TestCase {
  timeout: (timeout: number) => void;
}

declare var it: {
  (name: string, callback: (done: () => void) => void | Promise): TestCase,
  skip(name: string, callback: (done: () => void) => void | Promise): TestCase,
};
