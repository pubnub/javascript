/* global describe, beforeEach, it */
/* eslint no-console: 0 */

import assert from 'assert';
import PubNub from '../../../src/node/index';

describe('#components/token_manager', () => {
  let pubnub;

  beforeEach(() => {
    pubnub = new PubNub({
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey'
    });
  });

  describe('parse token', () => {
    it('ignore invalid tokens', () => {
      let noPermissions = pubnub.parseToken('bad-token');

      assert(noPermissions === undefined);
    });

    it('contains correct permissions', () => {
      let tokenWithAll = 'p0F2AkF0Gl2BgxZDdHRsGQWgQ3Jlc6REY2hhbqBDZ3JwoEN1c3KhZXVzZXIxAUNzcGOhZnNwYWNlMQFDcGF0pERjaGFuoENncnCgQ3VzcqFiLioBQ3NwY6FiLioBRG1ldGGgQ3NpZ1ggG1j7rl-TpxtWYDIcPFvR-cqFGXVWvm8r5YBaCLhy5-Y=';
      let permissions = pubnub.parseToken(tokenWithAll);

      assert(permissions.version === 2);
      assert(permissions.timestamp === 1568768790);
      assert(permissions.ttl === 1440);
      assert(permissions.meta === undefined);
      assert(permissions.signature instanceof Buffer);

      assert(typeof permissions.resources === 'object');
      assert(typeof permissions.resources.users === 'object');
      assert(typeof permissions.resources.spaces === 'object');

      assert(typeof permissions.patterns === 'object');
      assert(typeof permissions.patterns.users === 'object');
      assert(typeof permissions.patterns.spaces === 'object');

      assert(permissions.resources.users.user1.read === true);
      assert(permissions.resources.spaces.space1.read === true);

      assert(permissions.patterns.users['.*'].read === true);
      assert(permissions.patterns.spaces['.*'].read === true);
    });
  });

  describe('supports resource tokens by resource type and id', () => {
    it('support token with user id permissions', () => {
      let tokenWithUserId = 'p0F2AkF0Gl2Bd7BDdHRsGQWgQ3Jlc6REY2hhbqBDZ3JwoEN1c3KhZXVzZXIxAUNzcGOgQ3BhdKREY2hhbqBDZ3JwoEN1c3KgQ3NwY6BEbWV0YaBDc2lnWCABo0jeW03hedEyKmtzJBZZijmt5J7GYJ3X_7VuKbYu7Q==';

      // has user id 'user1'
      pubnub.setToken(tokenWithUserId);

      let token = pubnub.getToken('user', 'user1');

      assert(token === tokenWithUserId);
    });

    it('support token with space id permissions', () => {
      let tokenWithSpaceId = 'p0F2AkF0Gl2Bd_VDdHRsGQWgQ3Jlc6REY2hhbqBDZ3JwoEN1c3KgQ3NwY6Fmc3BhY2UxAUNwYXSkRGNoYW6gQ2dycKBDdXNyoENzcGOgRG1ldGGgQ3NpZ1gg6CscU5C58NHVuuQnW8oFkf8BAZ4VbdCuuWtwZRS6lnY=';

      // has space id 'space1'
      pubnub.setToken(tokenWithSpaceId);

      let token = pubnub.getToken('space', 'space1');

      assert(token === tokenWithSpaceId);
    });

    it('support token with multiple user id permissions', () => {
      let tokenWithMultipleUserId = 'p0F2AkF0Gl2BeDxDdHRsGQWgQ3Jlc6REY2hhbqBDZ3JwoEN1c3KiZXVzZXIxAWV1c2VyMgFDc3BjoENwYXSkRGNoYW6gQ2dycKBDdXNyoENzcGOgRG1ldGGgQ3NpZ1gg0dPv3aKfKjGcPNBfGHuJLatPoUeEUgOGZhPGu0lVP20=';

      // has user id 'user1' and 'user2'
      pubnub.setToken(tokenWithMultipleUserId);

      let token = pubnub.getToken('user', 'user1');

      assert(token === tokenWithMultipleUserId);

      token = pubnub.getToken('user', 'user2');

      assert(token === tokenWithMultipleUserId);
    });

    it('support token with multiple space id permissions', () => {
      let tokenWithMultipleSpaceId = 'p0F2AkF0Gl2BeLhDdHRsGQWgQ3Jlc6REY2hhbqBDZ3JwoEN1c3KgQ3NwY6Jmc3BhY2UxAWZzcGFjZTIBQ3BhdKREY2hhbqBDZ3JwoEN1c3KgQ3NwY6BEbWV0YaBDc2lnWCB8acyHBpil-K7GFp-MOmwlGpl9_6OlWuZa5t8BM4B_CQ==';

      // has space id 'space1' and 'space2'
      pubnub.setToken(tokenWithMultipleSpaceId);

      let token = pubnub.getToken('space', 'space1');

      assert(token === tokenWithMultipleSpaceId);

      token = pubnub.getToken('space', 'space2');

      assert(token === tokenWithMultipleSpaceId);
    });

    it('support multiple tokens of one type with resource id permissions', () => {
      let tokenWithUserId = 'p0F2AkF0Gl2Bd7BDdHRsGQWgQ3Jlc6REY2hhbqBDZ3JwoEN1c3KhZXVzZXIxAUNzcGOgQ3BhdKREY2hhbqBDZ3JwoEN1c3KgQ3NwY6BEbWV0YaBDc2lnWCABo0jeW03hedEyKmtzJBZZijmt5J7GYJ3X_7VuKbYu7Q==';
      let tokenWithUserId2 = 'p0F2AkF0Gl2BeUVDdHRsGQWgQ3Jlc6REY2hhbqBDZ3JwoEN1c3KhZXVzZXIyAUNzcGOgQ3BhdKREY2hhbqBDZ3JwoEN1c3KgQ3NwY6BEbWV0YaBDc2lnWCBJvm-ZwNdKLcS8vaoq2SAcvZ0HOI2OY6G6nGC-xKuzIg==';

      // has user id 'user1' and 'user2'
      pubnub.setTokens([
        tokenWithUserId,
        tokenWithUserId2
      ]);

      // should not be the same token
      assert(tokenWithUserId !== tokenWithUserId2);

      let token = pubnub.getToken('user', 'user1');

      assert(token === tokenWithUserId);

      token = pubnub.getToken('user', 'user2');

      assert(token === tokenWithUserId2);
    });

    it('support multiple tokens of multiple types with resource id permissions', () => {
      let tokenWithUserId = 'p0F2AkF0Gl2Bd7BDdHRsGQWgQ3Jlc6REY2hhbqBDZ3JwoEN1c3KhZXVzZXIxAUNzcGOgQ3BhdKREY2hhbqBDZ3JwoEN1c3KgQ3NwY6BEbWV0YaBDc2lnWCABo0jeW03hedEyKmtzJBZZijmt5J7GYJ3X_7VuKbYu7Q==';
      let tokenWithSpaceId = 'p0F2AkF0Gl2Bd_VDdHRsGQWgQ3Jlc6REY2hhbqBDZ3JwoEN1c3KgQ3NwY6Fmc3BhY2UxAUNwYXSkRGNoYW6gQ2dycKBDdXNyoENzcGOgRG1ldGGgQ3NpZ1gg6CscU5C58NHVuuQnW8oFkf8BAZ4VbdCuuWtwZRS6lnY=';

      // has user id 'user1' and 'user2'
      pubnub.setTokens([
        tokenWithUserId,
        tokenWithSpaceId
      ]);

      // should not be the same token
      assert(tokenWithUserId !== tokenWithSpaceId);

      let token = pubnub.getToken('user', 'user1');

      assert(token === tokenWithUserId);

      token = pubnub.getToken('space', 'space1');

      assert(token === tokenWithSpaceId);
    });

    it('adding new token with permissons for a resource id replaces', () => {
      let tokenWithUserId = 'p0F2AkF0Gl2Bd7BDdHRsGQWgQ3Jlc6REY2hhbqBDZ3JwoEN1c3KhZXVzZXIxAUNzcGOgQ3BhdKREY2hhbqBDZ3JwoEN1c3KgQ3NwY6BEbWV0YaBDc2lnWCABo0jeW03hedEyKmtzJBZZijmt5J7GYJ3X_7VuKbYu7Q==';
      let tokenWithUserIdNewPermissions = 'p0F2AkF0Gl2Bes1DdHRsGQWgQ3Jlc6REY2hhbqBDZ3JwoEN1c3KhZXVzZXIxA0NzcGOgQ3BhdKREY2hhbqBDZ3JwoEN1c3KgQ3NwY6BEbWV0YaBDc2lnWCAuW43somfhnQk13sMTvmrPtgSPI_3PUOWBHwf_wnKYAQ==';

      // has user id 'user1'
      pubnub.setToken(tokenWithUserId);

      let token = pubnub.getToken('user', 'user1');

      assert(token === tokenWithUserId);

      // has user id 'user1'
      pubnub.setToken(tokenWithUserIdNewPermissions);

      token = pubnub.getToken('user', 'user1');

      assert(token === tokenWithUserIdNewPermissions);
    });
  });

  describe('supports pattern tokens by resource type', () => {
    it('support token with user permissions', () => {
      let tokenWithUserType = 'p0F2AkF0Gl2Be3RDdHRsGQWgQ3Jlc6REY2hhbqBDZ3JwoEN1c3KgQ3NwY6BDcGF0pERjaGFuoENncnCgQ3VzcqFiLioBQ3NwY6BEbWV0YaBDc2lnWCCst3N4W6YywI9H-fdvfkYxBOu10wz4CvS6qhfIgaS0fg==';

      // has user id 'user1'
      pubnub.setToken(tokenWithUserType);

      let token = pubnub.getToken('user');

      assert(token === tokenWithUserType);
    });

    it('support token with space permissions', () => {
      let tokenWithSpaceType = 'p0F2AkF0Gl2Be8FDdHRsGQWgQ3Jlc6REY2hhbqBDZ3JwoEN1c3KgQ3NwY6BDcGF0pERjaGFuoENncnCgQ3VzcqBDc3BjoWIuKgFEbWV0YaBDc2lnWCDEwcYp_h7o-XYI8yuX1Eoqmt97pdbKoTjzbBxe6-NIBA==';

      // has space id 'space1'
      pubnub.setToken(tokenWithSpaceType);

      let token = pubnub.getToken('space');

      assert(token === tokenWithSpaceType);
    });

    it('support token with user and space permissions', () => {
      let tokenWithUserAndSpaceType = 'p0F2AkF0Gl2Be_hDdHRsGQWgQ3Jlc6REY2hhbqBDZ3JwoEN1c3KgQ3NwY6BDcGF0pERjaGFuoENncnCgQ3VzcqFiLioBQ3NwY6FiLioBRG1ldGGgQ3NpZ1ggF985UuGyc1TXUaEK3pPBNaPc642ynEFHB4hNDUJ3dBs=';

      // has user id 'user1' and 'user2'
      pubnub.setToken(tokenWithUserAndSpaceType);

      let token = pubnub.getToken('user');

      assert(token === tokenWithUserAndSpaceType);

      token = pubnub.getToken('space');

      assert(token === tokenWithUserAndSpaceType);
    });

    it('support multiple tokens with resource type permissions', () => {
      let tokenWithUserType = 'p0F2AkF0Gl2Be3RDdHRsGQWgQ3Jlc6REY2hhbqBDZ3JwoEN1c3KgQ3NwY6BDcGF0pERjaGFuoENncnCgQ3VzcqFiLioBQ3NwY6BEbWV0YaBDc2lnWCCst3N4W6YywI9H-fdvfkYxBOu10wz4CvS6qhfIgaS0fg==';
      let tokenWithSpaceType = 'p0F2AkF0Gl2Be8FDdHRsGQWgQ3Jlc6REY2hhbqBDZ3JwoEN1c3KgQ3NwY6BDcGF0pERjaGFuoENncnCgQ3VzcqBDc3BjoWIuKgFEbWV0YaBDc2lnWCDEwcYp_h7o-XYI8yuX1Eoqmt97pdbKoTjzbBxe6-NIBA==';

      // has user id 'user1' and 'user2'
      pubnub.setTokens([
        tokenWithUserType,
        tokenWithSpaceType
      ]);

      let token = pubnub.getToken('user');

      assert(token === tokenWithUserType);

      token = pubnub.getToken('space');

      assert(token === tokenWithSpaceType);
    });

    it('adding new token with permissons for a resource type replaces', () => {
      let tokenWithUserType = 'p0F2AkF0Gl2Be3RDdHRsGQWgQ3Jlc6REY2hhbqBDZ3JwoEN1c3KgQ3NwY6BDcGF0pERjaGFuoENncnCgQ3VzcqFiLioBQ3NwY6BEbWV0YaBDc2lnWCCst3N4W6YywI9H-fdvfkYxBOu10wz4CvS6qhfIgaS0fg==';
      let tokenWithUserType2 = 'p0F2AkF0Gl2BfPhDdHRsGQWgQ3Jlc6REY2hhbqBDZ3JwoEN1c3KgQ3NwY6BDcGF0pERjaGFuoENncnCgQ3VzcqFiLioDQ3NwY6BEbWV0YaBDc2lnWCA7lCpBefZe76rK5fppuqIRqXxcGnANS8KM26klBdf14A==';

      // has user id 'user1'
      pubnub.setToken(tokenWithUserType);

      let token = pubnub.getToken('user');

      assert(token === tokenWithUserType);

      // has user id 'user1'
      pubnub.setToken(tokenWithUserType2);

      token = pubnub.getToken('user');

      assert(token === tokenWithUserType2);
    });
  });
});
