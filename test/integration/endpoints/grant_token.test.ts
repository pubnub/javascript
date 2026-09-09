import assert from 'assert';
import nock from 'nock';
import sinon from 'sinon';
import utils from '../../utils';
import PubNub from '../../../src/node/index';
import { PubNubError } from '../../../src/errors/pubnub-error';

/**
 * Permission bits used by the grant token wire format.
 *
 * `create` (16) is only meaningful for DataSync scopes; `read` / `write` / `manage` / `join` remain
 * classic messaging concepts.
 */
const JOIN = 128;
const UPDATE = 64;
const GET = 32;
const CREATE = 16;
const DELETE = 8;
const MANAGE = 4;
const WRITE = 2;
const READ = 1;

/**
 * Scope maps which the serializer always emits, even when a grant doesn't use them.
 */
const EMPTY_SCOPES = { channels: {}, groups: {}, uuids: {}, users: {}, spaces: {} };

describe('grant token endpoint', () => {
  let originalVersionFunction: (() => string) | null = null;
  let clock: sinon.SinonFakeTimers;
  let pubnub: PubNub;

  before(() => {
    nock.disableNetConnect();
    clock = sinon.useFakeTimers(new Date(Date.UTC(2019, 9, 18, 1, 6, 30)).getTime());
  });

  after(() => {
    clock.restore();
    nock.enableNetConnect();
    pubnub._config.getVersion = originalVersionFunction!;
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({
      subscribeKey: 'mySubscribeKey',
      publishKey: 'myPublishKey',
      secretKey: 'mySecretKey',
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
      autoNetworkDetection: false,
    });

    if (originalVersionFunction === null) {
      originalVersionFunction = pubnub._config.getVersion;
      pubnub._config.getVersion = () => 'testVersion';
    } else pubnub._config.getVersion = () => 'testVersion';
  });

  afterEach(() => {
    pubnub.destroy(true);
  });

  /**
   * Match the stable parts of the grant query string.
   *
   * The `v2` signature is a HMAC over the request body, so pinning its exact value would make every
   * body change fail as an unmatched interceptor (a request timeout) instead of a readable assertion
   * failure. The signature is shape-checked instead.
   */
  const grantQuery = (query: Record<string, unknown>) =>
    query.uuid === 'myUUID' &&
    query.pnsdk === `PubNub-JS-Nodejs/${pubnub.getVersion()}` &&
    query.timestamp === '1571360790' &&
    typeof query.signature === 'string' &&
    (query.signature as string).startsWith('v2.');

  /**
   * Grant request body as it appears on the wire.
   *
   * Every scope map is bit-encoded, so permissions are plain numbers keyed by resource id.
   */
  type GrantRequestBody = {
    ttl?: number;
    permissions: {
      uuid?: string;
      resources: Record<string, Record<string, number>>;
      patterns: Record<string, Record<string, number>>;
      meta: Record<string, unknown>;
    };
  };

  /**
   * Mock a successful grant and capture the request body which the SDK sent.
   */
  const mockGrant = () => {
    let requestBody: GrantRequestBody;
    const scope = utils
      .createNock()
      .post('/v3/pam/mySubscribeKey/grant', (body) => {
        requestBody = body as GrantRequestBody;
        return true;
      })
      .query(grantQuery)
      .reply(200, { message: 'Success', data: { token: 'token' } });

    return { scope, body: () => requestBody };
  };

  /**
   * Assert that a grant is rejected during validation, before any request is sent.
   */
  const assertRejects = async (parameters: unknown, message: string) => {
    const scope = utils
      .createNock()
      .post('/v3/pam/mySubscribeKey/grant')
      .query(() => true)
      .reply(200, { message: 'Success', data: { token: 'token' } });

    await assert.rejects(
      () => pubnub.grantToken(parameters as Parameters<typeof pubnub.grantToken>[0]),
      (err: unknown) => {
        assert(err instanceof PubNubError);
        assert.strictEqual(err.status!.message, message);
        return true;
      },
    );

    assert.strictEqual(scope.isDone(), false, 'no request should be sent when validation fails');
  };

  describe('#grantToken', () => {
    describe('##validation', () => {
      it('ensure resources or patterns', async () => {
        await assertRejects({ ttl: 1440 }, 'Missing values for either Resources or Patterns');
      });

      it('fail on resources without any resource permissions', async () => {
        await assertRejects(
          { ttl: 1440, resources: { channels: {}, groups: {}, uuids: {} } },
          'Missing values for either Resources or Patterns',
        );
      });

      it('fail on resources without any pattern permissions', async () => {
        await assertRejects(
          { ttl: 1440, patterns: { channels: {}, groups: {}, uuids: {} } },
          'Missing values for either Resources or Patterns',
        );
      });

      it('fail on empty `users` and `dataSync` scopes', async () => {
        await assertRejects(
          { ttl: 1440, resources: { users: {}, dataSync: {} } },
          'Missing values for either Resources or Patterns',
        );
      });

      it('should reject mixing `users` with `uuids`', async () => {
        await assertRejects(
          {
            ttl: 1440,
            resources: {
              users: { 'user-alice-042': { get: true } },
              // Mixing the two synonyms is also a compile-time error; see the `users` / `uuids`
              // union in `GrantScopes`.
              uuids: { 'appctx-uuid': { get: true } },
            },
          },
          'Cannot mix `users` with `uuids` — `uuids` is deprecated App Context terminology; use `users`',
        );
      });

      it('should reject mixing `users` in resources with `uuids` in patterns', async () => {
        // Split across sections the type system can't see the conflict, so this is the case the
        // runtime check exists for.
        await assertRejects(
          {
            ttl: 1440,
            resources: { users: { 'user-alice-042': { get: true } } },
            patterns: { uuids: { 'appctx-.*': { get: true } } },
          },
          'Cannot mix `users` with `uuids` — `uuids` is deprecated App Context terminology; use `users`',
        );
      });

      it('should reject mixing `spaces` with `channels`', async () => {
        await assertRejects(
          {
            ttl: 1440,
            resources: {
              spaces: { space1: { read: true } },
              channels: { 'channel-engineering-001': { read: true } },
            },
          },
          'Cannot mix `spaces` with `channels` — `spaces` is deprecated terminology; use `channels`',
        );
      });

      it('should reject mixing `spaces` with `uuids`', async () => {
        // Different targets, but `spaces` is deprecated VSP terminology and `uuids` deprecated App
        // Context terminology — a single grant shouldn't mix the two vocabularies.
        await assertRejects(
          {
            ttl: 1440,
            resources: {
              spaces: { space1: { read: true } },
              uuids: { 'appctx-uuid': { get: true } },
            },
          },
          'Cannot mix `spaces` with `uuids` — mixed deprecated terminology; use `channels` with `users`',
        );
      });

      it('should reject mixing `spaces` in resources with `uuids` in patterns', async () => {
        await assertRejects(
          {
            ttl: 1440,
            resources: { spaces: { space1: { read: true } } },
            patterns: { uuids: { 'appctx-.*': { get: true } } },
          },
          'Cannot mix `spaces` with `uuids` — mixed deprecated terminology; use `channels` with `users`',
        );
      });

      it('should reject mixing `authorizedUserId` with `authorized_uuid`', async () => {
        await assertRejects(
          {
            ttl: 1440,
            authorizedUserId: 'user-alice-042',
            authorized_uuid: 'user-alice-042',
            resources: { users: { 'user-alice-042': { get: true } } },
          },
          'Cannot mix `authorizedUserId` with `authorized_uuid` — use `authorizedUserId`',
        );
      });

      it('should accept a grant which carries only DataSync projections', async () => {
        const { scope, body } = mockGrant();

        const token = await pubnub.grantToken({
          ttl: 1440,
          dataSyncProjections: {
            resources: { entities: { 'user.A': 'proj1' } },
          },
        });

        assert.strictEqual(token, 'token');
        assert.strictEqual(scope.isDone(), true);
        assert.deepEqual(body().permissions.meta, {
          'pn-projections': { res: { 'datasync:entities:user.A': 'proj1' } },
        });
      });
    });

    describe('##App Context (legacy) permissions', () => {
      it('should serialize channels, groups and uuids with `authorized_uuid`', async () => {
        const { scope, body } = mockGrant();

        await pubnub.grantToken({
          ttl: 1440,
          authorized_uuid: 'appctx-uuid',
          resources: {
            channels: { 'channel-engineering-001': { read: true } },
            groups: { 'group-eng': { read: true, manage: true } },
            uuids: { 'appctx-uuid': { get: true, update: true, delete: true } },
          },
        });

        assert.strictEqual(scope.isDone(), true);
        assert.deepEqual(body(), {
          ttl: 1440,
          permissions: {
            uuid: 'appctx-uuid',
            resources: {
              ...EMPTY_SCOPES,
              channels: { 'channel-engineering-001': READ },
              groups: { 'group-eng': READ + MANAGE },
              uuids: { 'appctx-uuid': GET + UPDATE + DELETE },
            },
            patterns: { ...EMPTY_SCOPES },
            meta: {},
          },
        });
      });

      it('should map deprecated `spaces` onto the `channels` wire scope', async () => {
        const { scope, body } = mockGrant();

        await pubnub.grantToken({
          ttl: 1440,
          resources: { spaces: { space1: { read: true, write: true } } },
          patterns: { spaces: { 'space.*': { manage: true } } },
          // `spaces` is legacy VSP terminology which isn't part of `GrantTokenParameters`.
        } as unknown as Parameters<typeof pubnub.grantToken>[0]);

        assert.strictEqual(scope.isDone(), true);
        // `spaces` collapses onto `channels`, and the `spaces` wire map stays empty.
        assert.deepEqual(body().permissions.resources.channels, { space1: READ + WRITE });
        assert.deepEqual(body().permissions.resources.spaces, {});
        assert.deepEqual(body().permissions.patterns.channels, { 'space.*': MANAGE });
        assert.deepEqual(body().permissions.patterns.spaces, {});
      });

      it('should keep classic channel permissions unchanged', async () => {
        const { scope, body } = mockGrant();

        await pubnub.grantToken({
          ttl: 1440,
          resources: {
            channels: {
              'channel-engineering-001': {
                read: true,
                write: true,
                manage: true,
                delete: true,
                get: true,
                update: true,
                join: true,
              },
            },
          },
        });

        assert.strictEqual(scope.isDone(), true);
        assert.strictEqual(
          body().permissions.resources.channels['channel-engineering-001'],
          READ + WRITE + MANAGE + DELETE + GET + UPDATE + JOIN,
        );
      });
    });

    describe('##DataSync permissions', () => {
      it('should serialize `users` into its own wire scope, not `uuids`', async () => {
        const { scope, body } = mockGrant();

        await pubnub.grantToken({
          ttl: 1440,
          resources: { users: { user1: { get: true } } },
          patterns: { users: { '.*': { get: true } } },
        });

        assert.strictEqual(scope.isDone(), true);
        assert.deepEqual(body(), {
          ttl: 1440,
          permissions: {
            resources: { ...EMPTY_SCOPES, users: { user1: GET } },
            patterns: { ...EMPTY_SCOPES, users: { '.*': GET } },
            meta: {},
          },
        });
      });

      it('should serialize the full `users` CRUD set', async () => {
        const { scope, body } = mockGrant();

        await pubnub.grantToken({
          ttl: 1440,
          resources: {
            users: { 'user-alice-042': { create: true, get: true, update: true, delete: true } },
          },
        });

        assert.strictEqual(scope.isDone(), true);
        assert.strictEqual(body().permissions.resources.users['user-alice-042'], CREATE + GET + UPDATE + DELETE);
      });

      it('should use `authorizedUserId` as the token principal', async () => {
        const { scope, body } = mockGrant();

        await pubnub.grantToken({
          ttl: 1440,
          authorizedUserId: 'user-alice-042',
          resources: { users: { 'user-alice-042': { get: true } } },
        });

        assert.strictEqual(scope.isDone(), true);
        assert.strictEqual(body().permissions.uuid, 'user-alice-042');
      });

      it('should serialize dataSync entities, relationships and memberships', async () => {
        const { scope, body } = mockGrant();

        await pubnub.grantToken({
          ttl: 1440,
          resources: {
            dataSync: {
              entities: { 'school-greenwood-001': { get: true } },
              relationships: { 'student-alice-042:school-greenwood-001': { get: true } },
              memberships: { 'user-alice-042:channel-engineering-001': { get: true, update: true } },
            },
          },
        });

        assert.strictEqual(scope.isDone(), true);
        assert.deepEqual(body().permissions.resources, {
          ...EMPTY_SCOPES,
          'datasync:entities': { 'school-greenwood-001': GET },
          'datasync:relationships': { 'student-alice-042:school-greenwood-001': GET },
          'datasync:memberships': { 'user-alice-042:channel-engineering-001': GET + UPDATE },
        });
        // Unused DataSync scopes are omitted from the other section entirely.
        assert.deepEqual(body().permissions.patterns, { ...EMPTY_SCOPES });
      });

      it('should serialize dataSync patterns', async () => {
        const { scope, body } = mockGrant();

        await pubnub.grantToken({
          ttl: 1440,
          patterns: {
            dataSync: {
              entities: { 'human-*': { create: true, get: true, update: true, delete: true } },
            },
          },
        });

        assert.strictEqual(scope.isDone(), true);
        assert.deepEqual(body().permissions.patterns, {
          ...EMPTY_SCOPES,
          'datasync:entities': { 'human-*': CREATE + GET + UPDATE + DELETE },
        });
        assert.deepEqual(body().permissions.resources, { ...EMPTY_SCOPES });
      });

      it('should encode `dataSyncProjections` into meta and preserve user meta', async () => {
        const { scope, body } = mockGrant();

        await pubnub.grantToken({
          ttl: 1440,
          meta: { tenant: 'acme', revision: 7 },
          resources: { channels: { 'channel-engineering-001': { read: true } } },
          dataSyncProjections: {
            resources: { entities: { 'user.A': 'proj1' } },
            patterns: { memberships: { 'user.*': '__default__' } },
          },
        });

        assert.strictEqual(scope.isDone(), true);
        assert.deepEqual(body().permissions.meta, {
          tenant: 'acme',
          revision: 7,
          'pn-projections': {
            res: { 'datasync:entities:user.A': 'proj1' },
            pat: { 'datasync:memberships:user.*': '__default__' },
          },
        });
      });

      it('should encode projections for every DataSync resource kind', async () => {
        const { scope, body } = mockGrant();

        await pubnub.grantToken({
          ttl: 1440,
          dataSyncProjections: {
            resources: {
              entities: { 'school-greenwood-001': 'admin' },
              relationships: { 'student-alice-042:school-greenwood-001': 'admin' },
              users: { 'user-alice-042': 'self-view' },
              channels: { 'channel-engineering-001': 'public-profile' },
              memberships: { 'membership.engineering-001': 'member-basic' },
            },
          },
        });

        assert.strictEqual(scope.isDone(), true);
        // `users` / `channels` projections carry the `datasync:` prefix even though their
        // permissions ride the un-prefixed grant scopes.
        assert.deepEqual(body().permissions.meta, {
          'pn-projections': {
            res: {
              'datasync:entities:school-greenwood-001': 'admin',
              'datasync:relationships:student-alice-042:school-greenwood-001': 'admin',
              'datasync:users:user-alice-042': 'self-view',
              'datasync:channels:channel-engineering-001': 'public-profile',
              'datasync:memberships:membership.engineering-001': 'member-basic',
            },
          },
        });
      });

      it('should encode `users`, `channels` and `memberships` projection patterns', async () => {
        const { scope, body } = mockGrant();

        await pubnub.grantToken({
          ttl: 1440,
          dataSyncProjections: {
            patterns: {
              users: { 'student-*': 'public-profile' },
              channels: { 'channel-*': 'admin' },
              memberships: { 'membership.student-*': '__default__' },
            },
          },
        });

        assert.strictEqual(scope.isDone(), true);
        assert.deepEqual(body().permissions.meta, {
          'pn-projections': {
            pat: {
              'datasync:users:student-*': 'public-profile',
              'datasync:channels:channel-*': 'admin',
              'datasync:memberships:membership.student-*': '__default__',
            },
          },
        });
      });

      it('should accept a grant which carries only `users` / `channels` projections', async () => {
        const { scope, body } = mockGrant();

        const token = await pubnub.grantToken({
          ttl: 1440,
          dataSyncProjections: {
            resources: { users: { 'user.A': 'self-view' } },
            patterns: { channels: { 'chan.*': 'admin' } },
          },
        });

        assert.strictEqual(token, 'token');
        assert.strictEqual(scope.isDone(), true);
        assert.deepEqual(body().permissions.meta, {
          'pn-projections': {
            res: { 'datasync:users:user.A': 'self-view' },
            pat: { 'datasync:channels:chan.*': 'admin' },
          },
        });
      });

      it('should omit `pn-projections` when no projections are set', async () => {
        const { scope, body } = mockGrant();

        await pubnub.grantToken({
          ttl: 1440,
          resources: { channels: { 'channel-engineering-001': { read: true } } },
        });

        assert.strictEqual(scope.isDone(), true);
        assert.deepEqual(body().permissions.meta, {});
      });
    });

    describe('##combined legacy and DataSync permissions', () => {
      it('should grant `users`, `channels`, `groups` and `dataSync` in a single token', async () => {
        const { scope, body } = mockGrant();

        await pubnub.grantToken({
          ttl: 1440,
          authorizedUserId: 'user-alice-042',
          resources: {
            users: { 'user-alice-042': { create: true, get: true, update: true, delete: true } },
            channels: { 'channel-engineering-001': { create: true, get: true, update: true, delete: true } },
            groups: { 'group-eng': { read: true, manage: true } },
            dataSync: {
              entities: { 'school-greenwood-001': { get: true } },
              relationships: { 'student-alice-042:school-greenwood-001': { get: true } },
              memberships: { 'user-alice-042:channel-engineering-001': { get: true, update: true } },
            },
          },
        });

        assert.strictEqual(scope.isDone(), true);
        assert.deepEqual(body(), {
          ttl: 1440,
          permissions: {
            uuid: 'user-alice-042',
            resources: {
              ...EMPTY_SCOPES,
              users: { 'user-alice-042': CREATE + GET + UPDATE + DELETE },
              channels: { 'channel-engineering-001': CREATE + GET + UPDATE + DELETE },
              groups: { 'group-eng': READ + MANAGE },
              'datasync:entities': { 'school-greenwood-001': GET },
              'datasync:relationships': { 'student-alice-042:school-greenwood-001': GET },
              'datasync:memberships': { 'user-alice-042:channel-engineering-001': GET + UPDATE },
            },
            patterns: { ...EMPTY_SCOPES },
            meta: {},
          },
        });
      });

      it('should allow `users` in resources alongside `channels` in patterns', async () => {
        // This combination used to be rejected by the removed VSP / legacy either-or gate.
        const { scope, body } = mockGrant();

        await pubnub.grantToken({
          ttl: 1440,
          resources: { users: { user1: { get: true } } },
          patterns: { channels: { '.*': { read: true } } },
        });

        assert.strictEqual(scope.isDone(), true);
        assert.deepEqual(body().permissions.resources.users, { user1: GET });
        assert.deepEqual(body().permissions.patterns.channels, { '.*': READ });
      });

      it('should allow legacy `uuids` alongside `channels`, `groups` and `dataSync`', async () => {
        const { scope, body } = mockGrant();

        await pubnub.grantToken({
          ttl: 1440,
          authorized_uuid: 'appctx-uuid',
          resources: {
            uuids: { 'appctx-uuid': { get: true, update: true } },
            channels: { 'channel-engineering-001': { read: true } },
            groups: { 'group-eng': { read: true } },
            dataSync: { entities: { 'school-greenwood-001': { get: true } } },
          },
        });

        assert.strictEqual(scope.isDone(), true);
        assert.deepEqual(body().permissions.resources.uuids, { 'appctx-uuid': GET + UPDATE });
        assert.deepEqual(body().permissions.resources.users, {});
        assert.deepEqual(body().permissions.resources['datasync:entities'], {
          'school-greenwood-001': GET,
        });
      });
    });
  });
});
