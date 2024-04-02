/* global describe, beforeEach, it */
/* eslint no-console: 0 */

import assert from 'assert';
import PubNub from '../../../src/node/index';

describe('#components/token_manager', () => {
  let pubnub;

  beforeEach(() => {
    pubnub = new PubNub({
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey',
      uuid: 'myUUID'
    });
  });

  describe('parse token', () => {
    it('ignore invalid tokens', () => {
      let noPermissions = pubnub.parseToken('bad-token');

      assert(noPermissions === undefined);
    });

    it('contains correct permissions', () => {
      let tokenWithAll = 'p0F2AkF0GmEK-4NDdHRsGDxDcmVzpURjaGFuoWhjaGFubmVsMQFDZ3JwoWZncm91cDEBQ3VzcqBDc3BjoER1dWlkoWV1c2VyMQFDcGF0pURjaGFuoWIuKgFDZ3JwoWIuKgFDdXNyoENzcGOgRHV1aWShYi4qAURtZXRhoENzaWdYII5bQpWLi6Z-l5jbShWxZ7QL6o8Dz6_vxluhxrMGzQCN';
      let permissions = pubnub.parseToken(tokenWithAll);

      assert(permissions.version === 2);
      assert(permissions.timestamp === 1628109699);
      assert(permissions.ttl === 60);
      assert(permissions.meta === undefined);
      assert(permissions.signature instanceof Buffer);

      assert(typeof permissions.resources === 'object');
      assert(typeof permissions.resources.uuids === 'object');
      assert(typeof permissions.resources.channels === 'object');
      assert(typeof permissions.resources.groups === 'object');

      assert(typeof permissions.patterns === 'object');
      assert(typeof permissions.patterns.uuids === 'object');
      assert(typeof permissions.patterns.channels === 'object');
      assert(typeof permissions.patterns.groups === 'object');

      assert(permissions.resources.uuids.user1.read === true);
      assert(permissions.resources.channels.channel1.read === true);
      assert(permissions.resources.groups.group1.read === true);

      assert(permissions.patterns.uuids['.*'].read === true);
      assert(permissions.patterns.channels['.*'].read === true);
      assert(permissions.patterns.groups['.*'].read === true);
    });
  });

  describe('supports token update', () => {
    it('support get and set token', () => {
      let token = 'p0F2AkF0GmEK8NZDdHRsGDxDcmVzpURjaGFuoENncnCgQ3VzcqBDc3BjoER1dWlkoWV1c2VyMRhoQ3BhdKVEY2hhbqBDZ3JwoEN1c3KgQ3NwY6BEdXVpZKBEbWV0YaBDc2lnWCB6sYaT3ZbNVV6TBxDKGvdOk6TSQRMoRZir4cwoN9-_dA==';

      // has uuid id 'user1'
      pubnub.setToken(token);

      let tokenCheck = pubnub.getToken();

      assert(tokenCheck === token);
    });

    it('adding new token replaces previous', () => {
      let token = 'p0F2AkF0GmEK8NZDdHRsGDxDcmVzpURjaGFuoENncnCgQ3VzcqBDc3BjoER1dWlkoWV1c2VyMRhoQ3BhdKVEY2hhbqBDZ3JwoEN1c3KgQ3NwY6BEdXVpZKBEbWV0YaBDc2lnWCB6sYaT3ZbNVV6TBxDKGvdOk6TSQRMoRZir4cwoN9-_dA==';
      let token2 = 'p0F2AkF0GmEK8LFDdHRsGDxDcmVzpURjaGFuoENncnCgQ3VzcqBDc3BjoER1dWlkoWV1c2VyMhhoQ3BhdKVEY2hhbqBDZ3JwoEN1c3KgQ3NwY6BEdXVpZKBEbWV0YaBDc2lnWCDq63hdreA9JbHVnHLDJuHzK-AWSdcVFZKG0nse79JMZw==';

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
