declare function describe(name: string, callback: () => void): void;

declare function before(callback: () => void): void;
declare function beforeEach(callback: () => void): void;

declare function after(callback: () => void): void;
declare function afterEach(callback: () => void): void;

declare function it(name: string, callback: (done: () => void) => void | Promise): void;
