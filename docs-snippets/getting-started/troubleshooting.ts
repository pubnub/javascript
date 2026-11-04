import assert from '../harness/assert.js';
import PubNub from 'pubnub';
import { page, check } from '../harness/step.js';
import { rejectsValidation, rejectsWithCategory } from '../harness/assertions.js';

/**
 * docs/sdks/javascript/troubleshooting.md
 *
 * The page has no code sample. Each entry states a symptom, a cause and a fix, so the checks reproduce the symptoms the
 * app can reproduce and assert the category, status code and message that the page promises. Entries that need an
 * outage or a scripted origin are proven in `getting-started/status-events.ts` and listed here as references:
 * `PNDisconnectedUnexpectedlyCategory` (statusEventsUnexpectedDisconnectAndReconnect), `PNConnectionErrorCategory`
 * (statusEventsConnectionErrorOnInitialConnect, statusEventsAccessDeniedOnSubscribe), `PNUnknownCategory` and
 * `PNMalformedResponseCategory` (statusEventsRequestCategories), and the `PNConnectedCategory` upgrade note
 * (statusEventsMigrationBefore, statusEventsMigrationAfter).
 *
 * Phase P0, open keyset (only `troubleshootingAccessDenied` uses the secured one and skips as `missing-env:secured` without it).
 * In the Sneaker Drop story this is the support desk: a shopper's client is misconfigured and the page tells them why.
 * Proves the category, status code and message the page promises for each symptom the app can reproduce. Deliberately does
 * not prove browser-only symptoms (CORS, shared worker) or anything that needs a real device. Checks only, no snippets, so
 * nothing here is embedded in the docs.
 */
export default page('getting-started/troubleshooting', 'P0', (world) => {
  // Each row is one documented cause of "the constructor throws". The SDK throws a PubNubError synchronously, before any request.
  check('troubleshootingConstructorThrows', { proves: 'Each documented cause of a constructor failure throws a PubNubError before any request.' }, () => {
    const keys = { subscribeKey: world.env.open!.subscribeKey };
    // "userId is omitted, is empty or only whitespace, or is set together with uuid."
    for (const [config, pattern] of [
      [{ ...keys }, /'userId' not set/],
      [{ ...keys, userId: '' }, /'userId' not set/],
      [{ ...keys, userId: '   ' }, /'userId' is empty/],
      [{ ...keys, userId: 'a', uuid: 'b' }, /use only 'userId'/],
    ] as const) {
      assert.throws(
        () => new PubNub(config as unknown as PubNub.PubNubConfiguration),
        (error: unknown) => (error as Error).name === 'PubNubError' && pattern.test((error as Error).message),
      );
    }
  });

  // Records a docs bug: the page says PNBadRequestCategory for a missing publishKey, the SDK reports PNValidationErrorCategory.
  // No network: the validation runs before the request is built.
  check('troubleshootingPublishValidation', { proves: 'A publish without a publish key fails local validation, and the category differs from what the page states.' }, async () => {
    const withoutPublishKey = world.track(new PubNub({ subscribeKey: world.env.open!.subscribeKey, userId: world.n('trouble-nokey') }));
    // The page says PNBadRequestCategory for a missing publishKey. The SDK reports PNValidationErrorCategory (live finding).
    await rejectsValidation(withoutPublishKey.publish({ channel: 'x', message: 'm' }), /Missing 'publishKey'/);
    await rejectsValidation(world.shopper.publish({ message: 'm' } as unknown as PubNub.Publish.PublishParameters), /Missing 'channel'/);
    await rejectsValidation(world.shopper.publish({ channel: 'x' } as unknown as PubNub.Publish.PublishParameters), /Missing 'message'/);
  });

  // "Publish fails with Message Too Large ... PubNub rejects the publish with HTTP 400." Record what the service does.
  check('troubleshootingMessageTooLarge', { timeout: 60_000, proves: 'The service rejects an oversized publish and the step records the answer.' }, async () => {
    const channel = world.n('my_channel');
    const outcome = async (size: number, sendByPost: boolean): Promise<{ statusCode?: number; category?: string; message?: string } | 'published'> => {
      try {
        await world.shopper.publish({ channel, message: 'a'.repeat(size), sendByPost, storeInHistory: false });
        return 'published';
      } catch (error) {
        const status = (error as { status?: { statusCode?: number; category?: string; errorData?: { message?: string } } }).status;
        return { statusCode: status?.statusCode, category: status?.category, message: status?.errorData?.message };
      }
    };
    assert.equal(await outcome(30_000, true), 'published', 'a message below 32 KiB is published');
    const post = await outcome(33_000, true);
    const get = await outcome(33_000, false);
    console.log(`message above the limit: POST ${JSON.stringify(post)}, GET ${JSON.stringify(get)}`);
    // The page promises HTTP 400 with the text "Message Too Large". The service answers 413 for POST and 414 for GET (live finding).
    assert.notEqual(post, 'published');
    assert.notEqual(get, 'published');
    assert.equal((post as { statusCode?: number }).statusCode, 413);
    assert.equal((get as { statusCode?: number }).statusCode, 414);
  });

  // "Access is denied (403)": a client without a token on the Access Manager keyset.
  // Uses the secured keyset because the open keyset has Access Manager (v2/v3) off, so a missing token is only denied here. The client is
  // created without `setToken`, so every call is denied. The service name in errorData proves the 403 comes from Access Manager.
  check('troubleshootingAccessDenied', { keyset: 'pam', timeout: 30_000, proves: 'A client without a token is denied on the secured keyset, and the error names Access Manager as the source.' }, async () => {
    const pubnub = world.client('secured', 'trouble-denied');
    await assert.rejects(pubnub.publish({ channel: world.n('am_room'), message: 'm' }), (error: unknown) => {
      const status = (error as { status?: { category?: string; statusCode?: number; errorData?: { service?: string } } }).status;
      assert.equal(status?.category, 'PNAccessDeniedCategory');
      assert.equal(status?.statusCode, 403);
      assert.equal(status?.errorData?.service, 'Access Manager');
      return true;
    });
    await rejectsWithCategory(pubnub.fetchMessages({ channels: [world.n('am_room')] }), 'PNAccessDeniedCategory');
  });
});
