import assert from '../harness/assert.js';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PubNub from 'pubnub';
import { page, step, check } from '../harness/step.js';
import { eventually } from '../harness/wait.js';

/**
 * docs/sdks/javascript/quickstart-node.md
 *
 * P4. The page walks through one script: import, initialize, listeners, subscription, publish. The first step runs those
 * snippets in the order of the page in one scope, the way a reader pastes them into `index.mjs`, and the client publishes and
 * receives its own message. The second step runs the complete `quickstart-node.mjs` file from the "Run" section in a real
 * Node.js process and reads its output. The `importPubNub` import is in `shared/import-pubnub.ts`.
 *
 * `quickstartNodeListeners` is hardcoded on the docs page today. `quickstartNodePublish` holds the status listener that
 * publishes once the client is connected, with the `try` and `catch` of the docs body.
 *
 * Open keyset. In the Sneaker Drop story this is the first script a new developer runs: connect, listen on `hello_world`, say
 * hello. Proves the four step-by-step snippets work in page order in one scope, that the user id and channel placeholders are
 * what the page says, and that the complete `quickstart-node.mjs` runs as a real Node.js child process and prints the three
 * documented lines. `quickstart-node.mjs` carries no comments on purpose, it is the exact text the docs show.
 * The script publishes after the `PNConnectedCategory` status, so the own message is asserted.
 */
export default page('getting-started/quickstart-node', 'P4', (world) => {
  const HERE = path.dirname(fileURLToPath(import.meta.url));

  // One step, four snippet ids, because the page reads as one script. `world.withConsole` captures `console.log` so the lines the
  // page promises ("Connected to PubNub", "Published, timetoken: ...", "Received on ...") can be asserted. The snippets stay in
  // one function scope, so `pubnub` and `subscription` are visible to the later snippets exactly as on the page.
  step('gettingStartedInitPubnub', { snippets: ['gettingStartedInitPubnub', 'quickstartNodeListeners', 'gettingStartedCreateSubscription', 'quickstartNodePublish'], proves: 'The Node quickstart script connects, publishes and receives, and prints the lines the page promises.' }, async () => {
    await world.withConsole(async (logs) => {
      // snippet.gettingStartedInitPubnub
      const pubnub = new PubNub({
        publishKey: 'YOUR_PUBLISH_KEY',
        subscribeKey: 'YOUR_SUBSCRIBE_KEY',
        userId: 'YOUR_USER_ID',
        // snippet.hide
        ...world.live.open,
        // snippet.show
      });
      // snippet.end
      world.track(pubnub);

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

      assert.equal(pubnub.getUserId(), world.n('YOUR_USER_ID'));
      await eventually(() => assert.match(logs.lines.find((l) => l.startsWith('Published, timetoken: ')) ?? '', /^Published, timetoken: \d{17}$/), { label: 'published line printed' });
      await eventually(() => assert.ok(logs.lines.includes(`Received on ${world.n('hello_world')}: Hello, world!`)), { label: 'own message received' });
      subscription.unsubscribe();
    });
  });

  // Why the placeholder replacement is done with `replace`: the file is the docs text with placeholders, so it is never edited
  // on disk. The child process is registered with `world.trackChild`, so a killed run does not leave a subscribed process behind.
  // The complete file of the "Run" section, executed with Node.js. Placeholders get the live keys and run-suffixed names.
  check('quickstartNodeRun', { timeout: 60_000, proves: 'The complete quickstart file runs in a Node process, prints Connected and Published, receives its own message, and receives a message from another client.' }, async () => {
    const open = world.env.open!;
    const source = fs
      .readFileSync(path.join(HERE, 'quickstart-node.mjs'), 'utf8')
      .replace('YOUR_PUBLISH_KEY', open.publishKey)
      .replace('YOUR_SUBSCRIBE_KEY', open.subscribeKey)
      .replace('YOUR_USER_ID', world.n('YOUR_USER_ID'))
      .replaceAll("'hello_world'", `'${world.n('hello_world')}'`);
    // The file sits next to the app so that `import 'pubnub'` resolves the same installation.
    const dir = fs.mkdtempSync(path.join(HERE, '.quickstart-'));
    const file = path.join(dir, 'index.mjs');
    fs.writeFileSync(file, source);
    try {
      const child = world.trackChild(spawn(process.execPath, [file], { stdio: ['ignore', 'pipe', 'pipe'] }));
      let out = '';
      let err = '';
      child.stdout.on('data', (chunk) => (out += chunk));
      child.stderr.on('data', (chunk) => (err += chunk));
      try {
        // The script publishes only after the connected status, so its own message reaches an active subscription and the
        // "Received" line is deterministic. All three documented lines are asserted.
        await eventually(
          () => {
            const lines = out.split('\n');
            assert.ok(lines.includes('Connected to PubNub'), `Connected line. Output: ${out} ${err}`);
            assert.ok(lines.some((l) => /^Published, timetoken: \d{17}$/.test(l)), `Published line. Output: ${out} ${err}`);
            assert.ok(lines.includes(`Received on ${world.n('hello_world')}: Hello, world!`), `Received line. Output: ${out} ${err}`);
          },
          { timeout: 30_000, label: 'quickstart script connected, published and received its own message' },
        );
        // The listener keeps working: a message from another client arrives too.
        await world.friend.publish({ channel: world.n('hello_world'), message: 'Hello from the harness' });
        await eventually(
          () => assert.ok(out.split('\n').includes(`Received on ${world.n('hello_world')}: Hello from the harness`), `Received line. Output: ${out} ${err}`),
          { timeout: 30_000, label: 'quickstart script receives a message from another client' },
        );
        // "The script keeps running because the subscription stays open."
        assert.equal(child.exitCode, null, 'the script keeps running');
      } finally {
        child.kill('SIGINT');
      }
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  // The "Before you begin" claim: Node.js 22 or later. The SDK declares the same minimum.
  check('quickstartNodeVersion', { proves: 'The SDK declares the same minimum Node.js version as the quickstart states.' }, () => {
    const engines = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.resolve('pubnub'))), '..', '..', 'package.json'), 'utf8')).engines;
    assert.equal(engines.node, '>=22.0.0');
    assert.ok(Number(process.versions.node.split('.')[0]) >= 22, 'the app itself runs on Node.js 22 or later');
  });
});
