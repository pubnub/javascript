import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import PubNub from 'pubnub';
import { observer, track } from '../support/clients';
import { captureConsole } from '../support/console';
import { keysOf, openKeys } from '../support/env';
import { makeScratch, SDK_ROOT } from '../support/tsc-scratch';
import { eventually, watch } from '../support/wait';

/**
 * Node.js quickstart examples. Port of docs-snippets/getting-started/quickstart-node.ts.
 * The docs embed quickstart-node.mjs as a whole file, and the test runs that file in a child process. It sits next to this
 * test and is a byte for byte copy of the file of the docs.
 */

describe('getting-started/quickstart-node', () => {
  it('gettingStartedInitPubnub, quickstartNodeListeners, gettingStartedCreateSubscription, quickstartNodePublish: the Node quickstart script connects, publishes and receives, and prints the lines the page promises', async () => {
    const logs = captureConsole('log');
    try {
      // snippet.gettingStartedInitPubnub
      const pubnub = new PubNub({
        publishKey: 'YOUR_PUBLISH_KEY',
        subscribeKey: 'YOUR_SUBSCRIBE_KEY',
        userId: 'YOUR_USER_ID',
        // snippet.hide
        ...openKeys(),
        // snippet.show
      });
      // snippet.end
      track(pubnub);

      // snippet.quickstartNodeListeners
      pubnub.addListener({
        message: (event) => {
          console.log(`Received on ${event.channel}: ${event.message}`);
        },
        status: (event) => {
          if (event.category === 'PNConnectedCategory') {
            console.log('Connected to PubNub');
          }
        },
      });
      // snippet.end

      // snippet.gettingStartedCreateSubscription
      // Create a channel entity
      const channel = pubnub.channel('hello_world');

      // Create a subscription
      const subscription = channel.subscription({
        receivePresenceEvents: true, // to receive presence events
      });

      // Subscribe
      subscription.subscribe();
      // snippet.end

      // snippet.quickstartNodePublish
      pubnub.addListener({
        status: async (event) => {
          if (event.category !== 'PNConnectedCategory') return;
          try {
            const result = await pubnub.publish({
              channel: 'hello_world',
              message: 'Hello, world!',
            });
            console.log(`Published, timetoken: ${result.timetoken}`);
          } catch (error) {
            console.error(`Publish failed: ${error}`);
          }
        },
      });
      // snippet.end

      // The channel is shared, so bind the check to this run's own message: the timetoken in the "Published" line. This
      // listener is added after the sample's, so by the time it sees the message the sample has printed its "Received" line.
      const receivedTimetokens: string[] = [];
      pubnub.addListener({ message: (event) => receivedTimetokens.push(event.timetoken) });

      assert.equal(pubnub.getUserId(), 'YOUR_USER_ID');
      const published = await eventually(
        () => {
          const line = logs.lines.find((l) => l.startsWith('Published, timetoken: ')) ?? '';
          assert.match(line, /^Published, timetoken: \d{17}$/);
          return line.slice('Published, timetoken: '.length);
        },
        { label: 'published line printed' },
      );
      await eventually(() => assert.ok(receivedTimetokens.includes(published), 'own message received'), {
        label: 'own message received',
      });
      assert.ok(logs.lines.includes('Received on hello_world: Hello, world!'), `Received line. Saw: ${logs.lines}`);
      assert.ok(logs.lines.includes('Connected to PubNub'), `Connected line. Saw: ${logs.lines}`);
      subscription.unsubscribe();
    } finally {
      logs.restore();
    }
  });

  it('quickstartNodeRun: the complete quickstart file runs in a Node process, prints Connected and Published, receives its own message, and receives a message from another client', async function () {
    this.timeout(60_000);
    const open = keysOf('open');
    // The file holds the placeholder keys the readers see. A copy in a scratch directory gets the real keys, the way the old
    // suite ran it. The scratch directory has node_modules/pubnub linked to this checkout so that `import 'pubnub'` resolves.
    const source = fs
      .readFileSync(path.join(__dirname, 'quickstart-node.mjs'), 'utf8')
      .replace('YOUR_PUBLISH_KEY', open.publishKey)
      .replace('YOUR_SUBSCRIBE_KEY', open.subscribeKey);
    assert.ok(!source.includes('YOUR_PUBLISH_KEY') && !source.includes('YOUR_SUBSCRIBE_KEY'), 'both keys replaced');
    const dir = makeScratch('pn-live-quickstart-');
    const file = path.join(dir, 'index.mjs');
    fs.writeFileSync(file, source);
    // Independent view of the channel: proves the service got the script's message.
    const listening = await watch(observer(), ['hello_world']);
    const child = spawn(process.execPath, [file], { stdio: ['ignore', 'pipe', 'pipe'], cwd: dir });
    let out = '';
    let err = '';
    child.stdout.on('data', (chunk) => (out += chunk));
    child.stderr.on('data', (chunk) => (err += chunk));
    try {
      // The script publishes only after the connected status, so its own message reaches an active subscription. All three
      // documented lines are asserted. The channel is shared, so the "Received" line cannot be bound to the timetoken
      // (the script does not print it): the message published by the script is bound through the observer below.
      const published = await eventually(
        () => {
          const lines = out.split('\n');
          assert.ok(lines.includes('Connected to PubNub'), `Connected line. Output: ${out} ${err}`);
          const line = lines.find((l) => /^Published, timetoken: \d{17}$/.test(l));
          assert.ok(line, `Published line. Output: ${out} ${err}`);
          assert.ok(lines.includes('Received on hello_world: Hello, world!'), `Received line. Output: ${out} ${err}`);
          return line.slice('Published, timetoken: '.length);
        },
        { timeout: 30_000, label: 'quickstart script connected, published and received its own message' },
      );
      const seen = await listening.next('message', (m) => m.timetoken === published);
      assert.equal(seen.message, 'Hello, world!');
      assert.equal(seen.publisher, 'YOUR_USER_ID');
      // The listener keeps working: a message from another client arrives too. The text is unique to this run.
      const text = `Hello from the test ${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      await observer().publish({ channel: 'hello_world', message: text });
      await eventually(
        () =>
          assert.ok(
            out.split('\n').includes(`Received on hello_world: ${text}`),
            `Received line. Output: ${out} ${err}`,
          ),
        {
          timeout: 30_000,
          label: 'quickstart script receives a message from another client',
        },
      );
      // "The script keeps running because the subscription stays open."
      assert.equal(child.exitCode, null, 'the script keeps running');
    } finally {
      const exited = new Promise<void>((resolve) => child.once('exit', () => resolve()));
      child.kill('SIGKILL');
      await exited;
      fs.rmSync(dir, { recursive: true, force: true });
      listening.stop();
    }
  });

  // The "Before you begin" claim: Node.js 22 or later. The SDK declares the same minimum.
  it('quickstartNodeVersion: the SDK declares the same minimum Node.js version as the quickstart states', () => {
    const engines = JSON.parse(fs.readFileSync(path.join(SDK_ROOT, 'package.json'), 'utf8')).engines;
    assert.equal(engines.node, '>=22.0.0');
    assert.ok(Number(process.versions.node.split('.')[0]) >= 22, 'the app itself runs on Node.js 22 or later');
  });
});
