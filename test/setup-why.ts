/* global before, beforeEach, afterEach, after */
import whyIsNodeRunning from 'why-is-node-running';
import wtf from 'wtfnode';
import nock from 'nock';

/**
 * Offline guard: nothing in this run may reach the real network. Every request that no nock scope matches is refused
 * locally (NetConnectNotAllowedError), which also covers requests of clients a test forgot to destroy.
 *
 * Several mocked test files call `nock.enableNetConnect()` in their own `after` / `afterEach`, which would reopen the
 * network for everything that runs afterwards. Instead of editing every one of them, the block is re-applied by root
 * hooks: before the run, before each test, and after each test (the root `afterEach` runs after the `afterEach` of the
 * suite, so it undoes that call at once). A test that needs the loopback (test/unit/node-transport.test.ts) opts in
 * with `nock.enableNetConnect('127.0.0.1')` inside the test. Real-network tests belong to test/integration/live/,
 * which this run does not load.
 */
const blockNetwork = () => nock.disableNetConnect();

before(blockNetwork);
beforeEach(blockNetwork);
afterEach(blockNetwork);

after(function () {
  nock.enableNetConnect();
  nock.restore();
  setTimeout(() => {
    // whyIsNodeRunning();
    wtf.dump();
  }, 1000);
});
