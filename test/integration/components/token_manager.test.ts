/* global describe, beforeEach, it */
/* eslint no-console: 0 */

import assert from 'assert';

import PubNub from '../../../src/node/index';

describe('#components/token_manager', () => {
  let pubnub: PubNub;

  beforeEach(() => {
    pubnub = new PubNub({
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey',
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
    });
  });

  afterEach(() => {
    pubnub.destroy(true);
  });

  describe('parse token', () => {
    it('ignore invalid tokens', () => {
      const noPermissions = pubnub.parseToken('bad-token');

      assert(noPermissions === undefined);
    });

    it('contains correct permissions', () => {
      const tokenWithAll =
        'p0F2AkF0GmEK-4NDdHRsGDxDcmVzpURjaGFuoWhjaGFubmVsMQFDZ3JwoWZncm91cDEBQ3VzcqBDc3BjoER1dWlkoWV1c2VyMQFDcGF0pURjaGFuoWIuKgFDZ3JwoWIuKgFDdXNyoENzcGOgRHV1aWShYi4qAURtZXRhoENzaWdYII5bQpWLi6Z-l5jbShWxZ7QL6o8Dz6_vxluhxrMGzQCN';
      const permissions = pubnub.parseToken(tokenWithAll)!;

      assert(permissions.version === 2);
      assert(permissions.timestamp === 1628109699);
      assert(permissions.ttl === 60);
      assert(permissions.meta === undefined);
      assert(permissions.signature instanceof Buffer);

      assert(permissions.resources !== undefined);
      assert(typeof permissions.resources === 'object');
      assert(typeof permissions.resources.uuids === 'object');
      assert(typeof permissions.resources.channels === 'object');
      assert(typeof permissions.resources.groups === 'object');

      assert(typeof permissions.patterns === 'object');
      assert(typeof permissions.patterns.uuids === 'object');
      assert(typeof permissions.patterns.channels === 'object');
      assert(typeof permissions.patterns.groups === 'object');

      assert(permissions.resources.uuids.user1 !== undefined);
      assert(permissions.resources.uuids.user1.read === true);
      assert(permissions.resources.channels.channel1 !== undefined);
      assert(permissions.resources.channels.channel1.read === true);
      assert(permissions.resources.groups.group1 !== undefined);
      assert(permissions.resources.groups.group1.read === true);

      assert(permissions.patterns.uuids['.*'] !== undefined);
      assert(permissions.patterns.uuids['.*'].read === true);
      assert(permissions.patterns.channels['.*'] !== undefined);
      assert(permissions.patterns.channels['.*'].read === true);
      assert(permissions.patterns.groups['.*'] !== undefined);
      assert(permissions.patterns.groups['.*'].read === true);
    });

    it('contains correct `users` scope permissions', () => {
      // Token granting `users` scope permissions (wire key `usr`) as resources (get / update /
      // delete on `user-alice-042`) and as a pattern (full CRUD on `user-.*`), alongside a classic
      // channel resource permission.
      const tokenWithUsers =
        'qGF2AmF0GmpmPWBjdHRsGDxjcmVzpWRjaGFuoWljaGFubmVsLTEBY2dycKBkdXVpZKBjdXNyoW51c2VyLWFsaWNlLT' +
        'A0MhhoY3NwY6BjcGF0pWRjaGFuoGNncnCgZHV1aWSgY3VzcqFndXNlci0uKhh4Y3NwY6BkdXVpZG9kYXRhU3luYy10' +
        'ZXN0ZXJkbWV0YaBjc2lnWCAHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBw';
      const permissions = pubnub.parseToken(tokenWithUsers)!;

      assert(permissions.authorized_uuid === 'dataSync-tester');

      // Resource-level `users` permissions.
      assert(permissions.resources !== undefined);
      assert(typeof permissions.resources.users === 'object');
      assert.deepEqual(permissions.resources.users!['user-alice-042'], {
        create: false,
        get: true,
        update: true,
        delete: true,
      });

      // `users` is a distinct scope from the legacy App Context `uuids` scope.
      assert(permissions.resources.uuids === undefined);

      // Non-`users` scopes in the same token are unaffected.
      assert(permissions.resources.channels!['channel-1']!.read === true);

      // Pattern-level `users` permissions.
      assert(permissions.patterns !== undefined);
      assert(typeof permissions.patterns.users === 'object');
      assert.deepEqual(permissions.patterns.users!['user-.*'], {
        create: true,
        get: true,
        update: true,
        delete: true,
      });
    });

    it('contains correct DataSync permissions', () => {
      // Token granting DataSync resource permissions (entities / relationships / memberships) and a
      // DataSync entity pattern permission.
      const tokenWithDataSync =
        'qEF2AkF0GmpjVu5DdHRsGDxDcmVzqERjaGFuoENncnCgQ3NwY6BDdXNyoER1dWlkoFFkYXRhc3luYzplbnRpdGllc6' +
        'FpaHVtYW4tMDEyGCBWZGF0YXN5bmM6cmVsYXRpb25zaGlwc6F4JnN0dWRlbnQtYWxpY2UtMDQyOnNjaG9vbC1ncmVl' +
        'bndvb2QtMDAxGCBUZGF0YXN5bmM6bWVtYmVyc2hpcHOheCZ1c2VyLWFsaWNlLTA0MjpjaGFubmVsLWVuZ2luZWVyaW' +
        '5nLTAwMRhgQ3BhdKZEY2hhbqBDZ3JwoENzcGOgQ3VzcqBEdXVpZKBRZGF0YXN5bmM6ZW50aXRpZXOhZ2h1bWFuLSoY' +
        'eERtZXRhoER1dWlkb2RhdGFTeW5jLXRlc3RlckNzaWdYIIpWPzFf3TIyaoHMONNbwce9IeFNwdmyZKo-y4CB5qi-';
      const permissions = pubnub.parseToken(tokenWithDataSync)!;

      assert(permissions.authorized_uuid === 'dataSync-tester');

      // Resource-level DataSync permissions.
      assert(permissions.resources !== undefined);
      const resourceDataSync = permissions.resources.dataSync;
      assert(typeof resourceDataSync === 'object');

      assert(resourceDataSync!.entities !== undefined);
      assert.deepEqual(resourceDataSync!.entities!['human-012'], {
        create: false,
        get: true,
        update: false,
        delete: false,
      });

      assert(resourceDataSync!.relationships !== undefined);
      assert.deepEqual(resourceDataSync!.relationships!['student-alice-042:school-greenwood-001'], {
        create: false,
        get: true,
        update: false,
        delete: false,
      });

      assert(resourceDataSync!.memberships !== undefined);
      assert.deepEqual(resourceDataSync!.memberships!['user-alice-042:channel-engineering-001'], {
        create: false,
        get: true,
        update: true,
        delete: false,
      });

      // Pattern-level DataSync permissions.
      assert(permissions.patterns !== undefined);
      const patternDataSync = permissions.patterns.dataSync;
      assert(typeof patternDataSync === 'object');
      assert.deepEqual(patternDataSync!.entities!['human-*'], {
        create: true,
        get: true,
        update: true,
        delete: true,
      });
    });
  });

  describe('supports token update', () => {
    it('support get and set token', () => {
      const token =
        'p0F2AkF0GmEK8NZDdHRsGDxDcmVzpURjaGFuoENncnCgQ3VzcqBDc3BjoER1dWlkoWV1c2VyMRhoQ3BhdKVEY2hhbqBDZ3JwoEN1c3KgQ3NwY6BEdXVpZKBEbWV0YaBDc2lnWCB6sYaT3ZbNVV6TBxDKGvdOk6TSQRMoRZir4cwoN9-_dA==';

      // has uuid id 'user1'
      pubnub.setToken(token);

      const tokenCheck = pubnub.getToken();

      assert(tokenCheck === token);
    });

    it('adding new token replaces previous', () => {
      const token =
        'p0F2AkF0GmEK8NZDdHRsGDxDcmVzpURjaGFuoENncnCgQ3VzcqBDc3BjoER1dWlkoWV1c2VyMRhoQ3BhdKVEY2hhbqBDZ3JwoEN1c3KgQ3NwY6BEdXVpZKBEbWV0YaBDc2lnWCB6sYaT3ZbNVV6TBxDKGvdOk6TSQRMoRZir4cwoN9-_dA==';
      const token2 =
        'p0F2AkF0GmEK8LFDdHRsGDxDcmVzpURjaGFuoENncnCgQ3VzcqBDc3BjoER1dWlkoWV1c2VyMhhoQ3BhdKVEY2hhbqBDZ3JwoEN1c3KgQ3NwY6BEdXVpZKBEbWV0YaBDc2lnWCDq63hdreA9JbHVnHLDJuHzK-AWSdcVFZKG0nse79JMZw==';

      // has uuid id 'uuid1'
      pubnub.setToken(token);

      let tokenCheck = pubnub.getToken();

      assert(tokenCheck === token);

      // has uuid id 'uuid2'
      pubnub.setToken(token2);

      tokenCheck = pubnub.getToken();

      assert(tokenCheck === token2);
    });
  });
});
