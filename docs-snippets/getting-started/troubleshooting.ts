import assert from '../harness/assert.js';
import PubNub from 'pubnub';
import { page, check } from '../harness/step.js';
import { rejectsValidation, rejectsWithCategory } from '../harness/assertions.js';

/**
 * Troubleshooting examples.
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

  check('troubleshootingPublishValidation', { proves: 'A publish without a publish key fails local validation, and the category differs from what the page states.' }, async () => {
    const withoutPublishKey = world.track(new PubNub({ subscribeKey: world.env.open!.subscribeKey, userId: world.n('trouble-nokey') }));
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
    assert.notEqual(post, 'published');
    assert.notEqual(get, 'published');
    assert.equal((post as { statusCode?: number }).statusCode, 413);
    assert.equal((get as { statusCode?: number }).statusCode, 414);
  });

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
