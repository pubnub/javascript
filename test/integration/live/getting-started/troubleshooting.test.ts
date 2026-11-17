import assert from 'node:assert/strict';
import PubNub from 'pubnub';
import { rejectsValidation, rejectsWithCategory } from '../support/assertions';
import { createClient, shopper, track } from '../support/clients';
import { keysOf } from '../support/env';

/**
 * Troubleshooting examples. Port of docs-snippets/getting-started/troubleshooting.ts. The page has no snippet markers.
 * The access denied test needs a secured (pam) keyset on which the secret-less client has no token.
 */
describe('getting-started/troubleshooting', () => {
  // Each row is one documented cause of "the constructor throws". The SDK throws a PubNubError synchronously, before any request.
  it('troubleshootingConstructorThrows: each documented cause of a constructor failure throws a PubNubError before any request', () => {
    const keys = { subscribeKey: keysOf('open').subscribeKey };
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

  it('troubleshootingPublishValidation: a publish without a publish key fails local validation, and the category differs from what the page states', async () => {
    const withoutPublishKey = track(new PubNub({ subscribeKey: keysOf('open').subscribeKey, userId: 'trouble-nokey' }));
    await rejectsValidation(withoutPublishKey.publish({ channel: 'x', message: 'm' }), /Missing 'publishKey'/);
    await rejectsValidation(
      shopper().publish({ message: 'm' } as unknown as PubNub.Publish.PublishParameters),
      /Missing 'channel'/,
    );
    await rejectsValidation(
      shopper().publish({ channel: 'x' } as unknown as PubNub.Publish.PublishParameters),
      /Missing 'message'/,
    );
  });

  // "Publish fails with Message Too Large ... PubNub rejects the publish with HTTP 400." Record what the service does.
  it('troubleshootingMessageTooLarge: the service rejects an oversized publish, with 413 for POST and 414 for GET', async function () {
    this.timeout(60_000);
    // A channel of this run: the oversized payloads are junk that no other test should receive. Nothing is stored.
    const channel = `too_large-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const publisher = shopper();
    const outcome = async (
      size: number,
      sendByPost: boolean,
    ): Promise<{ statusCode?: number; category?: string; message?: string } | 'published'> => {
      try {
        await publisher.publish({ channel, message: 'a'.repeat(size), sendByPost, storeInHistory: false });
        return 'published';
      } catch (error) {
        const status = (
          error as { status?: { statusCode?: number; category?: string; errorData?: { message?: string } } }
        ).status;
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

  it('troubleshootingAccessDenied: a client without a token is denied on the secured keyset, and the error names Access Manager as the source', async function () {
    this.timeout(30_000);
    const pubnub = createClient('pam', 'trouble-denied');
    await assert.rejects(pubnub.publish({ channel: 'am_room', message: 'm' }), (error: unknown) => {
      const status = (
        error as { status?: { category?: string; statusCode?: number; errorData?: { service?: string } } }
      ).status;
      assert.equal(status?.category, 'PNAccessDeniedCategory');
      assert.equal(status?.statusCode, 403);
      assert.equal(status?.errorData?.service, 'Access Manager');
      return true;
    });
    await rejectsWithCategory(pubnub.fetchMessages({ channels: ['am_room'] }), 'PNAccessDeniedCategory');
  });
});
