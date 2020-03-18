/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../src/node/index';

describe('members endpoints', () => {
  const member = {
    id: 'member-test-1',
    custom: {
      testString: 'test',
      testNum: 123,
      testBool: true,
    },
    user: {
      id: 'user-1',
      name: 'Bob Cat',
      externalId: null,
      profileUrl: null,
      email: 'bobc@example.com',
      custom: {
        phone: '999-999-9999'
      },
    }
  };
  const created = new Date().toISOString();
  const updated = new Date().toISOString();
  const eTag = 'MDcyQ0REOTUtNEVBOC00QkY2LTgwOUUtNDkwQzI4MjgzMTcwCg==';

  const member2 = {
    id: 'member-test-2',
    custom: {
      testString: 'test2',
      testNum: 456,
      testBool: true,
    },
    user: {
      id: 'user-2',
      name: 'Bob Cat 2',
      externalId: null,
      profileUrl: null,
      email: 'bobc2@example.com',
      custom: {
        phone: '999-999-9999'
      },
    }
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

  describe('getMembers', () => {
    describe('##validation', () => {
      it('fails if spaceId is missing', (done) => {
        const scope = utils
          .createNock()
          .get('/v1/objects/mySubKey/spaces/mySpaceId/users')
          .query({
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
            auth: 'myAuthKey',
            count: true,
            limit: 2
          })
          .reply(200, {
            data: [
              {
                ...member,
                created,
                updated,
                eTag,
              },
              {
                ...member2,
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

        pubnub.getMembers({
          limit: 2,
          include: {
            totalCount: true
          }
        }).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing spaceId');
          done();
        });
      });
    });

    it('gets a list of members objects', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/objects/mySubKey/spaces/mySpaceId/users')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
          count: true,
          filter: 'user.name != "Bob Cat"',
          limit: 2
        })
        .reply(200, {
          data: [
            {
              ...member,
              created,
              updated,
              eTag,
            },
            {
              ...member2,
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

      pubnub.getMembers({
        spaceId: 'mySpaceId',
        limit: 2,
        include: {
          totalCount: true
        },
        filter: 'user.name != "Bob Cat"'
      },
      (status, response) => {
        assert.equal(status.error, false);

        assert.equal(response.data[0].id, 'member-test-1');
        assert.equal(response.data[0].eTag, eTag);

        assert.equal(response.data[1].id, 'member-test-2');
        assert.equal(response.data[1].eTag, eTag2);

        assert.equal(response.totalCount, 9);

        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('should add list members objects API telemetry information', (done) => {
      let scope = utils.createNock().get('/v1/objects/mySubKey/spaces/mySpaceId/users').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        { data: {} },
        delays,
        (completion) => {
          pubnub.getMembers(
            { spaceId: 'mySpaceId' },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_obj', average, leeway);
          done();
        });
    }).timeout(60000);
  });

  describe('addMembers', () => {
    describe('##validation', () => {
      it('fails if spaceId is missing', (done) => {
        const scope = utils
          .createNock()
          .get('/v1/objects/mySubKey/spaces/mySpaceId/users')
          .query({
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
            auth: 'myAuthKey',
            count: true,
            limit: 2
          })
          .reply(200, {
            data: [],
            next: 'MUIwQTAwMUItQkRBRC00NDkyLTgyMEMtODg2OUU1N0REMTNBCg==',
            prev: 'M0FFODRENzMtNjY2Qy00RUExLTk4QzktNkY1Q0I2MUJFNDRCCg==',
            status: 200,
            totalCount: 9
          });

        pubnub.addMembers({
          users: [
            { id: 'user-1' },
            { id: 'user-2' },
          ],
          limit: 2,
          include: {
            totalCount: true
          }
        }).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing spaceId');
          done();
        });
      });

      it('fails if users is missing', (done) => {
        const scope = utils
          .createNock()
          .get('/v1/objects/mySubKey/spaces/mySpaceId/users')
          .query({
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
            auth: 'myAuthKey',
            count: true,
            limit: 2
          })
          .reply(200, {
            data: [],
            next: 'MUIwQTAwMUItQkRBRC00NDkyLTgyMEMtODg2OUU1N0REMTNBCg==',
            prev: 'M0FFODRENzMtNjY2Qy00RUExLTk4QzktNkY1Q0I2MUJFNDRCCg==',
            status: 200,
            totalCount: 9
          });

        pubnub.addMembers({
          spaceId: 'mySpaceId',
          limit: 2,
          include: {
            totalCount: true
          }
        }).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing users');
          done();
        });
      });
    });

    it('add a list of users to a space', (done) => {
      const scope = utils
        .createNock()
        .patch('/v1/objects/mySubKey/spaces/mySpaceId/users')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
          count: true,
          limit: 2
        })
        .reply(200, {
          data: [],
          next: 'MUIwQTAwMUItQkRBRC00NDkyLTgyMEMtODg2OUU1N0REMTNBCg==',
          prev: 'M0FFODRENzMtNjY2Qy00RUExLTk4QzktNkY1Q0I2MUJFNDRCCg==',
          status: 200,
          totalCount: 0
        });

      pubnub.addMembers({
        spaceId: 'mySpaceId',
        users: [
          { id: 'user-1' },
          { id: 'user-2' },
        ],
        limit: 2,
        include: {
          totalCount: true
        }
      },
      (status, response) => {
        assert.equal(status.error, false);

        assert.equal(response.data.length, 0);

        assert.equal(response.totalCount, 0);

        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('should add members object add API telemetry information', (done) => {
      let scope = utils.createNock().patch('/v1/objects/mySubKey/spaces/mySpaceId/users').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        { data: {} },
        delays,
        (completion) => {
          pubnub.addMembers(
            { spaceId: 'mySpaceId', users: [{ id: 'user-1' }] },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_obj', average, leeway);
          done();
        });
    }).timeout(60000);
  });

  describe('removeMembers', () => {
    describe('##validation', () => {
      it('fails if spaceId is missing', (done) => {
        const scope = utils
          .createNock()
          .get('/v1/objects/mySubKey/spaces/mySpaceId/users')
          .query({
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
            auth: 'myAuthKey',
            count: true,
            limit: 2
          })
          .reply(200, {
            data: [],
            next: 'MUIwQTAwMUItQkRBRC00NDkyLTgyMEMtODg2OUU1N0REMTNBCg==',
            prev: 'M0FFODRENzMtNjY2Qy00RUExLTk4QzktNkY1Q0I2MUJFNDRCCg==',
            status: 200,
            totalCount: 9
          });

        pubnub.removeMembers({
          users: [
            { id: 'user-1' },
            { id: 'user-2' },
          ],
          limit: 2,
          include: {
            totalCount: true
          }
        }).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing spaceId');
          done();
        });
      });

      it('fails if users is missing', (done) => {
        const scope = utils
          .createNock()
          .get('/v1/objects/mySubKey/spaces/mySpaceId/users')
          .query({
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
            auth: 'myAuthKey',
            count: true,
            limit: 2
          })
          .reply(200, {
            data: [],
            next: 'MUIwQTAwMUItQkRBRC00NDkyLTgyMEMtODg2OUU1N0REMTNBCg==',
            prev: 'M0FFODRENzMtNjY2Qy00RUExLTk4QzktNkY1Q0I2MUJFNDRCCg==',
            status: 200,
            totalCount: 9
          });

        pubnub.removeMembers({
          spaceId: 'mySpaceId',
          limit: 2,
          include: {
            totalCount: true
          }
        }).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing users');
          done();
        });
      });
    });

    it('remove a space from a list of users', (done) => {
      const scope = utils
        .createNock()
        .patch('/v1/objects/mySubKey/spaces/mySpaceId/users')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
          count: true,
          limit: 2
        })
        .reply(200, {
          data: [],
          next: 'MUIwQTAwMUItQkRBRC00NDkyLTgyMEMtODg2OUU1N0REMTNBCg==',
          prev: 'M0FFODRENzMtNjY2Qy00RUExLTk4QzktNkY1Q0I2MUJFNDRCCg==',
          status: 200,
          totalCount: 0
        });

      pubnub.removeMembers({
        spaceId: 'mySpaceId',
        users: [
          { id: 'user-1' },
          { id: 'user-2' },
        ],
        limit: 2,
        include: {
          totalCount: true
        }
      },
      (status, response) => {
        assert.equal(status.error, false);

        assert.equal(response.data.length, 0);

        assert.equal(response.totalCount, 0);

        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('should add remove members object API telemetry information', (done) => {
      let scope = utils.createNock().patch('/v1/objects/mySubKey/spaces/mySpaceId/users').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        { data: {} },
        delays,
        (completion) => {
          pubnub.removeMembers(
            { spaceId: 'mySpaceId', users: [{ id: 'user-1' }] },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_obj', average, leeway);
          done();
        });
    }).timeout(60000);
  });

  describe('updateMembers', () => {
    describe('##validation', () => {
      it('fails if spaced is missing', (done) => {
        const scope = utils
          .createNock()
          .get('/v1/objects/mySubKey/spaces/mySpaceId/users')
          .query({
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
            auth: 'myAuthKey',
            count: true,
            limit: 2
          })
          .reply(200, {
            data: [],
            next: 'MUIwQTAwMUItQkRBRC00NDkyLTgyMEMtODg2OUU1N0REMTNBCg==',
            prev: 'M0FFODRENzMtNjY2Qy00RUExLTk4QzktNkY1Q0I2MUJFNDRCCg==',
            status: 200,
            totalCount: 9
          });

        pubnub.updateMembers({
          users: [
            { id: 'user-1' },
            { id: 'user-2' },
          ],
          limit: 2,
          include: {
            totalCount: true
          }
        }).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing spaceId');
          done();
        });
      });

      it('fails if users is missing', (done) => {
        const scope = utils
          .createNock()
          .get('/v1/objects/mySubKey/spaces/mySpaceId/users')
          .query({
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
            auth: 'myAuthKey',
            count: true,
            limit: 2
          })
          .reply(200, {
            data: [],
            next: 'MUIwQTAwMUItQkRBRC00NDkyLTgyMEMtODg2OUU1N0REMTNBCg==',
            prev: 'M0FFODRENzMtNjY2Qy00RUExLTk4QzktNkY1Q0I2MUJFNDRCCg==',
            status: 200,
            totalCount: 9
          });

        pubnub.updateMembers({
          spaceId: 'mySpaceId',
          limit: 2,
          include: {
            totalCount: true
          }
        }).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing users');
          done();
        });
      });
    });

    it('update a spaces user members', (done) => {
      const scope = utils
        .createNock()
        .patch('/v1/objects/mySubKey/spaces/mySpaceId/users')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
          count: true,
          limit: 2
        })
        .reply(200, {
          data: [],
          next: 'MUIwQTAwMUItQkRBRC00NDkyLTgyMEMtODg2OUU1N0REMTNBCg==',
          prev: 'M0FFODRENzMtNjY2Qy00RUExLTk4QzktNkY1Q0I2MUJFNDRCCg==',
          status: 200,
          totalCount: 0
        });

      pubnub.updateMembers({
        spaceId: 'mySpaceId',
        users: [
          { id: 'user-1', custom: { foo: 'fum' } },
          { id: 'user-2', custom: { foo: 'fee' }  },
        ],
        limit: 2,
        include: {
          totalCount: true
        }
      },
      (status, response) => {
        assert.equal(status.error, false);

        assert.equal(response.data.length, 0);

        assert.equal(response.totalCount, 0);

        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('should add update members object API telemetry information', (done) => {
      let scope = utils.createNock().patch('/v1/objects/mySubKey/spaces/mySpaceId/users').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        { data: {} },
        delays,
        (completion) => {
          pubnub.updateMembers(
            { spaceId: 'mySpaceId', users: [{ id: 'user-1', custom: { foo: 'fum' } }] },
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
