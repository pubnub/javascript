/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../src/node/index';

describe('memberships endpoints', () => {
  const membership = {
    id: 'membership-test-1',
    custom: {
      testString: 'test',
      testNum: 123,
      testBool: true,
    },
    space: {
      id: 'main',
      name: 'Main space',
      description: 'The main space',
      custom: {
        public: true,
        motd: 'Always check your spelling!'
      }
    }
  };
  const created = new Date().toISOString();
  const updated = new Date().toISOString();
  const eTag = 'MDcyQ0REOTUtNEVBOC00QkY2LTgwOUUtNDkwQzI4MjgzMTcwCg==';
  const membership2 = {
    id: 'membership-test-2',
    custom: {
      testString: 'test2',
      testNum: 456,
      testBool: true,
    },
    space: {
      id: 'main2',
      name: 'Main space 2',
      description: 'The main space 2',
      custom: {
        public: true,
        motd: 'Always check your spelling 2!'
      }
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

  describe('getMemberships', () => {
    describe('##validation', () => {
      it('fails if userId is missing', (done) => {
        const scope = utils
          .createNock()
          .get('/v1/objects/mySubKey/users/myUserId/spaces')
          .query({
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
            auth: 'myAuthKey',
            count: true,
            filter: 'space.name != "Main space"',
            limit: 2
          })
          .reply(200, {
            data: [
              {
                ...membership,
                created,
                updated,
                eTag,
              },
              {
                ...membership2,
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

        pubnub.getMemberships({
          limit: 2,
          include: {
            totalCount: true
          },
          filter: 'space.name != "Main space"'
        }).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing userId');
          done();
        });
      });
    });

    it('gets a list of membership objects', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/objects/mySubKey/users/myUserId/spaces')
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
              ...membership,
              created,
              updated,
              eTag,
            },
            {
              ...membership2,
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

      pubnub.getMemberships({
        userId: 'myUserId',
        limit: 2,
        include: {
          totalCount: true
        }
      },
      (status, response) => {
        assert.equal(status.error, false);

        assert.equal(response.data[0].id, 'membership-test-1');
        assert.equal(response.data[0].eTag, eTag);

        assert.equal(response.data[1].id, 'membership-test-2');
        assert.equal(response.data[1].eTag, eTag2);

        assert.equal(response.totalCount, 9);

        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('should add list membership objects API telemetry information', (done) => {
      let scope = utils.createNock().get('/v1/objects/mySubKey/users/myUserId/spaces').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        { data: {} },
        delays,
        (completion) => {
          pubnub.getMemberships(
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

  describe('joinSpaces', () => {
    describe('##validation', () => {
      it('fails if userId is missing', (done) => {
        const scope = utils
          .createNock()
          .get('/v1/objects/mySubKey/users/myUserId/spaces')
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

        pubnub.joinSpaces({
          spaces: [
            { id: 'main' },
            { id: 'main2' },
          ],
          limit: 2,
          include: {
            totalCount: true
          }
        }).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing userId');
          done();
        });
      });

      it('fails if spaces is missing', (done) => {
        const scope = utils
          .createNock()
          .get('/v1/objects/mySubKey/users/myUserId/spaces')
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

        pubnub.joinSpaces({
          userId: 'myUserId',
          limit: 2,
          include: {
            totalCount: true
          }
        }).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing spaces');
          done();
        });
      });
    });

    it('add a user to a list of spaces', (done) => {
      const scope = utils
        .createNock()
        .patch('/v1/objects/mySubKey/users/myUserId/spaces')
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

      pubnub.joinSpaces({
        userId: 'myUserId',
        spaces: [
          { id: 'main' },
          { id: 'main2' },
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

    it('should add join spaces object API telemetry information', (done) => {
      let scope = utils.createNock().patch('/v1/objects/mySubKey/users/myUserId/spaces').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        { data: {} },
        delays,
        (completion) => {
          pubnub.joinSpaces(
            { userId: 'myUserId', spaces: [{ id: 'main' }] },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_obj', average, leeway);
          done();
        });
    }).timeout(60000);
  });

  describe('leaveSpaces', () => {
    describe('##validation', () => {
      it('fails if userId is missing', (done) => {
        const scope = utils
          .createNock()
          .get('/v1/objects/mySubKey/users/myUserId/spaces')
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

        pubnub.leaveSpaces({
          spaces: [
            { id: 'main' },
            { id: 'main2' },
          ],
          limit: 2,
          include: {
            totalCount: true
          }
        }).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing userId');
          done();
        });
      });

      it('fails if spaces is missing', (done) => {
        const scope = utils
          .createNock()
          .get('/v1/objects/mySubKey/users/myUserId/spaces')
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

        pubnub.leaveSpaces({
          userId: 'myUserId',
          limit: 2,
          include: {
            totalCount: true
          }
        }).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing spaces');
          done();
        });
      });
    });

    it('remove a user from a list of spaces', (done) => {
      const scope = utils
        .createNock()
        .patch('/v1/objects/mySubKey/users/myUserId/spaces')
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

      pubnub.leaveSpaces({
        userId: 'myUserId',
        spaces: [
          { id: 'main' },
          { id: 'main2' },
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

    it('should add leave spaces object API telemetry information', (done) => {
      let scope = utils.createNock().patch('/v1/objects/mySubKey/users/myUserId/spaces').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        { data: {} },
        delays,
        (completion) => {
          pubnub.leaveSpaces(
            { userId: 'myUserId', spaces: [{ id: 'main' }] },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_obj', average, leeway);
          done();
        });
    }).timeout(60000);
  });

  describe('updateMemberships', () => {
    describe('##validation', () => {
      it('fails if userId is missing', (done) => {
        const scope = utils
          .createNock()
          .get('/v1/objects/mySubKey/users/myUserId/spaces')
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

        pubnub.updateMemberships({
          spaces: [
            { id: 'main' },
            { id: 'main2' },
          ],
          limit: 2,
          include: {
            totalCount: true
          }
        }).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing userId');
          done();
        });
      });

      it('fails if spaces is missing', (done) => {
        const scope = utils
          .createNock()
          .get('/v1/objects/mySubKey/users/myUserId/spaces')
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

        pubnub.updateMemberships({
          userId: 'myUserId',
          limit: 2,
          include: {
            totalCount: true
          }
        }).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing spaces');
          done();
        });
      });
    });

    it('update a users space memberships', (done) => {
      const scope = utils
        .createNock()
        .patch('/v1/objects/mySubKey/users/myUserId/spaces')
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

      pubnub.updateMemberships({
        userId: 'myUserId',
        spaces: [
          { id: 'main', custom: { foo: 'fum' } },
          { id: 'main2', custom: { foo: 'fee' }  },
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

    it('should add update memberships object API telemetry information', (done) => {
      let scope = utils.createNock().patch('/v1/objects/mySubKey/users/myUserId/spaces').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        { data: {} },
        delays,
        (completion) => {
          pubnub.updateMemberships(
            { userId: 'myUserId', spaces: [{ id: 'main', custom: { foo: 'fum' } }] },
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
