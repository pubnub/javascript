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
