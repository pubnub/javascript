/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../src/node/index';

describe('users endpoints', () => {
  const user = {
    id: 'user-test-1',
    name: 'test-user',
    externalId: 'external-123',
    profileUrl: 'www.test-user.com',
    email: 'test@user.com',
    custom: {
      testString: 'test',
      testNum: 123,
      testBool: true,
    },
  };
  const created = new Date().toISOString();
  const updated = new Date().toISOString();
  const eTag = 'MDcyQ0REOTUtNEVBOC00QkY2LTgwOUUtNDkwQzI4MjgzMTcwCg==';

  const user2 = {
    id: 'user-test-2',
    name: 'test-user2',
    externalId: 'external-456',
    profileUrl: 'www.test-user2.com',
    email: 'test2@user.com',
    custom: {
      testString: 'test2',
      testNum: 456,
      testBool: true,
    },
  };
  const created2 = new Date().toISOString();
  const updated2 = new Date().toISOString();
  const eTag2 = 'MDcyQ0REOTUtNEVBOC00QkY2LTgwOUUtNDkwQzI4MjgzMTcwCg==';

  let pubnub;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({
      subscribeKey: 'mySubKey',
      publishKey: 'myPublishKey',
      uuid: 'myUUID',
      authKey: 'myAuthKey',
    });
  });

  describe('createUser', () => {
    describe('##validation', () => {
      it('fails if id is missing', (done) => {
        const scope = utils
          .createNock()
          .post('/v1/objects/mySubKey/users')
          .reply(200, {
            ...user,
            created,
            updated,
            eTag,
          });
        const { id, ...noIdUser } = user;

        pubnub.createUser(noIdUser).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing User.id');
          done();
        });
      });

      it('fails if name is missing', (done) => {
        const scope = utils
          .createNock()
          .post('/v1/objects/mySubKey/users')
          .reply(200, {
            ...user,
            id: 'user-test-name',
            created,
            updated,
            eTag,
          });
        const { name, ...noNameUser } = user;

        pubnub
          .createUser({
            ...noNameUser,
            id: 'test-user-name',
          })
          .catch((err) => {
            assert.equal(scope.isDone(), false);
            assert.equal(err.status.message, 'Missing User.name');
            done();
          });
      });
    });

    it('creates a simple user object', (done) => {
      const testUser = {
        id: 'simple-user-test',
        name: 'test-user',
      };

      const scope = utils
        .createNock()
        .post('/v1/objects/mySubKey/users', '{"id":"simple-user-test","name":"test-user"}')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
          include: 'custom'
        })
        .reply(200, {
          ...user,
          created,
          updated,
          eTag,
          include: 'custom'
        });

      pubnub.createUser(
        testUser,
        (status, response) => {
          assert.equal(status.error, false);
          assert.equal(response.name, 'test-user');
          assert.equal(response.eTag, eTag);
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('should add create user object API telemetry information', (done) => {
      let scope = utils.createNock().post('/v1/objects/mySubKey/users', '{"id":"simple-user-test","name":"test-user"}').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;
      const testUser = { id: 'simple-user-test', name: 'test-user' };

      utils.runAPIWithResponseDelays(scope,
        200,
        { data: {} },
        delays,
        (completion) => {
          pubnub.createUser(
            testUser,
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_obj', average, leeway);
          done();
        });
    }).timeout(60000);
  });

  describe('updateUser', () => {
    describe('##validation', () => {
      it('fails if id is missing', (done) => {
        const scope = utils
          .createNock()
          .patch('/v1/objects/mySubKey/users')
          .reply(200, {
            ...user,
            created,
            updated,
            eTag,
            include: 'custom'
          });
        const { id, ...noIdUser } = user;

        pubnub.updateUser(noIdUser).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing User.id');
          done();
        });
      });

      it('fails if name is missing', (done) => {
        const scope = utils
          .createNock()
          .patch('/v1/objects/mySubKey/users')
          .reply(200, {
            ...user,
            id: 'user-test-name',
            created,
            updated,
            eTag,
            include: 'custom'
          });
        const { name, ...noNameUser } = user;

        pubnub
          .updateUser({
            ...noNameUser,
            id: 'test-user-name',
          })
          .catch((err) => {
            assert.equal(scope.isDone(), false);
            assert.equal(err.status.message, 'Missing User.name');
            done();
          });
      });
    });

    it('updates a simple user object', (done) => {
      const scope = utils
        .createNock()
        .patch('/v1/objects/mySubKey/users/simple-user-test')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
          include: 'custom'
        })
        .reply(200, {
          ...user,
          name: 'Simple User',
          created,
          updated,
          eTag,
        });

      pubnub.updateUser(
        {
          id: 'simple-user-test',
          name: 'Simple User',
        },
        (status, response) => {
          assert.equal(status.error, false);
          assert.deepEqual(response.name, 'Simple User');
          assert.ok(typeof response.eTag !== 'undefined');
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('should add update user object API telemetry information', (done) => {
      let scope = utils.createNock().patch('/v1/objects/mySubKey/users/simple-user-test').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        { data: {} },
        delays,
        (completion) => {
          pubnub.updateUser(
            { id: 'simple-user-test', name: 'Simple User' },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_obj', average, leeway);
          done();
        });
    }).timeout(60000);
  });

  describe('deleteUser', () => {
    describe('##validation', () => {
      it('fails if id is missing', (done) => {
        const scope = utils
          .createNock()
          .delete('/v1/objects/mySubKey/users/myUserId')
          .query({
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
            auth: 'myAuthKey',
          })
          .reply(200, {
            status: 'ok',
            data: {},
          });

        pubnub.deleteUser().catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing UserId');
          done();
        });
      });
    });

    it('deletes a user object', (done) => {
      const scope = utils
        .createNock()
        .delete('/v1/objects/mySubKey/users/delete-user-1')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
        })
        .reply(200, {
          status: 'ok',
          data: {},
        });

      pubnub.deleteUser('delete-user-1', (status, response) => {
        assert.equal(status.error, false);
        assert.equal(response.status, 'ok');
        assert.equal(Object.keys(response.data).length, 0);
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('should add delete user object API telemetry information', (done) => {
      let scope = utils.createNock().delete('/v1/objects/mySubKey/users/delete-user-1').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        { status: 'ok', data: {} },
        delays,
        (completion) => {
          pubnub.deleteUser(
            'delete-user-1',
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_obj', average, leeway);
          done();
        });
    }).timeout(60000);
  });

  describe('getUser', () => {
    describe('##validation', () => {
      it('fails if userId is missing', (done) => {
        const scope = utils
          .createNock()
          .get('/v1/objects/mySubKey/users/myUserId')
          .query({
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
            auth: 'myAuthKey',
            include: 'custom'
          })
          .reply(200, {
            ...user,
            created,
            updated,
            eTag,
          });

        pubnub.getUser({}).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing userId');
          done();
        });
      });
    });

    it('gets a single user object', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/objects/mySubKey/users/myUserId')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
          include: 'custom'
        })
        .reply(200, {
          data: {
            ...user,
            created,
            updated,
            eTag,
          }
        });

      pubnub.getUser({
        userId: 'myUserId'
      },
      (status, response) => {
        assert.equal(status.error, false);
        assert.equal(response.data.name, 'test-user');
        assert.equal(response.data.eTag, eTag);
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('should add get user object API telemetry information', (done) => {
      let scope = utils.createNock().get('/v1/objects/mySubKey/users/myUserId').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        { data: {} },
        delays,
        (completion) => {
          pubnub.getUser(
            { userId: 'myUserId' },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_obj', average, leeway);
          done();
        });
    }).timeout(60000);
  });

  describe('getUsers', () => {
    it('gets a list of user objects', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/objects/mySubKey/users')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
          count: true,
          filter: "name != 'test-user2'",
          limit: 2
        })
        .reply(200, {
          data: [
            {
              ...user,
              created,
              updated,
              eTag,
            },
            {
              ...user2,
              created: created2,
              updated: updated2,
              eTag: eTag2,
            }
          ],
          next: 'MUIwQTAwMUItQkRBRC00NDkyLTgyMEMtODg2OUU1N0REMTNBCg==',
          prev: 'M0FFODRENzMtNjY2Qy00RUExLTk4QzktNkY1Q0I2MUJFNDRCCg==',
          status: 200,
          totalCount: 9
        });

      pubnub.getUsers({
        limit: 2,
        include: {
          totalCount: true
        },
        filter: "name != 'test-user2'"
      },
      (status, response) => {
        assert.equal(status.error, false);

        assert.equal(response.data[0].name, 'test-user');
        assert.equal(response.data[0].eTag, eTag);

        assert.equal(response.data[1].name, 'test-user2');
        assert.equal(response.data[1].eTag, eTag2);

        assert.equal(response.totalCount, 9);

        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('should add list user objects API telemetry information', (done) => {
      let scope = utils.createNock().get('/v1/objects/mySubKey/users').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        { data: {} },
        delays,
        (completion) => {
          pubnub.getUsers(
            { limit: 2 },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_obj', average, leeway);
          done();
        });
    }).timeout(60000);
  });
});
