/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../src/node/index';

describe('spaces endpoints', () => {
  const space = {
    id: 'space-test-1',
    name: 'test-space',
    description: 'test space',
    custom: {
      testString: 'test',
      testNum: 123,
      testBool: true,
    },
  };
  const created = new Date().toISOString();
  const updated = new Date().toISOString();
  const eTag = 'MDcyQ0REOTUtNEVBOC00QkY2LTgwOUUtNDkwQzI4MjgzMTcwCg==';

  const space2 = {
    id: 'space-test-2',
    name: 'test-space2',
    description: 'test space 2',
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

  describe('createSpace', () => {
    describe('##validation', () => {
      it('fails if id is missing', (done) => {
        const scope = utils
          .createNock()
          .post('/v1/objects/mySubKey/spaces')
          .reply(200, {
            ...space,
            created,
            updated,
            eTag,
          });
        const { id, ...noIdSpace } = space;

        pubnub.createSpace(noIdSpace).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing Space.id');
          done();
        });
      });

      it('fails if name is missing', (done) => {
        const scope = utils
          .createNock()
          .post('/v1/objects/mySubKey/spaces')
          .reply(200, {
            ...space,
            id: 'space-test-name',
            created,
            updated,
            eTag,
          });
        const { name, ...noNameSpace } = space;

        pubnub
          .createSpace({
            ...noNameSpace,
            id: 'test-space-name',
          })
          .catch((err) => {
            assert.equal(scope.isDone(), false);
            assert.equal(err.status.message, 'Missing Space.name');
            done();
          });
      });
    });

    it('creates a simple space object', (done) => {
      const testSpace = {
        id: 'simple-space-test',
        name: 'test-space',
      };

      const scope = utils
        .createNock()
        .post('/v1/objects/mySubKey/spaces', '{"id":"simple-space-test","name":"test-space"}')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
          include: 'custom'
        })
        .reply(200, {
          ...space,
          created,
          updated,
          eTag,
        });

      pubnub.createSpace(
        testSpace,
        (status, response) => {
          assert.equal(status.error, false);
          assert.equal(response.name, 'test-space');
          assert.equal(response.eTag, eTag);
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('should add create space object API telemetry information', (done) => {
      let scope = utils.createNock().post('/v1/objects/mySubKey/spaces', '{"id":"simple-space-test","name":"test-space"}').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;
      const testSpace = { id: 'simple-space-test', name: 'test-space' };

      utils.runAPIWithResponseDelays(scope,
        200,
        { data: {} },
        delays,
        (completion) => {
          pubnub.createSpace(
            testSpace,
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_obj', average, leeway);
          done();
        });
    }).timeout(60000);
  });

  describe('updateSpace', () => {
    describe('##validation', () => {
      it('fails if id is missing', (done) => {
        const scope = utils
          .createNock()
          .patch('/v1/objects/mySubKey/spaces')
          .reply(200, {
            ...space,
            created,
            updated,
            eTag,
            include: 'custom'
          });
        const { id, ...noIdSpace } = space;

        pubnub.updateSpace(noIdSpace).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing Space.id');
          done();
        });
      });

      it('fails if name is missing', (done) => {
        const scope = utils
          .createNock()
          .patch('/v1/objects/mySubKey/spaces')
          .reply(200, {
            ...space,
            id: 'space-test-name',
            created,
            updated,
            eTag,
          });
        const { name, ...noNameSpace } = space;

        pubnub
          .updateSpace({
            ...noNameSpace,
            id: 'test-space-name',
          })
          .catch((err) => {
            assert.equal(scope.isDone(), false);
            assert.equal(err.status.message, 'Missing Space.name');
            done();
          });
      });
    });

    it('updates a simple space object', (done) => {
      const scope = utils
        .createNock()
        .patch('/v1/objects/mySubKey/spaces/simple-space-test')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
          include: 'custom'
        })
        .reply(200, {
          ...space,
          name: 'Simple Space',
          created,
          updated,
          eTag,
        });

      pubnub.updateSpace(
        {
          id: 'simple-space-test',
          name: 'Simple Space',
        },
        (status, response) => {
          assert.equal(status.error, false);
          assert.deepEqual(response.name, 'Simple Space');
          assert.ok(typeof response.eTag !== 'undefined');
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('should add update space object API telemetry information', (done) => {
      let scope = utils.createNock().patch('/v1/objects/mySubKey/spaces/simple-space-test').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        { data: {} },
        delays,
        (completion) => {
          pubnub.updateSpace(
            { id: 'simple-space-test', name: 'Simple Space' },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_obj', average, leeway);
          done();
        });
    }).timeout(60000);
  });

  describe('deleteSpace', () => {
    describe('##validation', () => {
      it('fails if id is missing', (done) => {
        const scope = utils
          .createNock()
          .delete('/v1/objects/mySubKey/spaces/mySpaceId')
          .reply(200, {
            status: 'ok',
            data: {},
          });

        pubnub.deleteSpace().catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing SpaceId');
          done();
        });
      });
    });

    it('deletes a space object', (done) => {
      const scope = utils
        .createNock()
        .delete('/v1/objects/mySubKey/spaces/delete-space-1')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey'
        })
        .reply(200, {
          status: 'ok',
          data: {},
        });

      pubnub.deleteSpace('delete-space-1', (status, response) => {
        assert.equal(status.error, false);
        assert.equal(response.status, 'ok');
        assert.equal(Object.keys(response.data).length, 0);
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('should add delete space object API telemetry information', (done) => {
      let scope = utils.createNock().delete('/v1/objects/mySubKey/spaces/delete-space-1').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        { status: 'ok', data: {} },
        delays,
        (completion) => {
          pubnub.deleteSpace(
            'delete-space-1',
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_obj', average, leeway);
          done();
        });
    }).timeout(60000);
  });

  describe('getSpace', () => {
    describe('##validation', () => {
      it('fails if spaceId is missing', (done) => {
        const scope = utils
          .createNock()
          .get('/v1/objects/mySubKey/spaces/mySpaceId')
          .query({
            pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
            uuid: 'myUUID',
            auth: 'myAuthKey',
            include: 'custom'
          })
          .reply(200, {
            ...space,
            created,
            updated,
            eTag,
          });

        pubnub.getSpace({}).catch((err) => {
          assert.equal(scope.isDone(), false);
          assert.equal(err.status.message, 'Missing spaceId');
          done();
        });
      });
    });

    it('gets a single space object', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/objects/mySubKey/spaces/mySpaceId')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
          include: 'custom'
        })
        .reply(200, {
          data: {
            ...space,
            created,
            updated,
            eTag,
          }
        });

      pubnub.getSpace({
        spaceId: 'mySpaceId'
      },
      (status, response) => {
        assert.equal(status.error, false);
        assert.equal(response.data.name, 'test-space');
        assert.equal(response.data.eTag, eTag);
        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('should add get space object API telemetry information', (done) => {
      let scope = utils.createNock().get('/v1/objects/mySubKey/spaces/mySpaceId').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        { data: {} },
        delays,
        (completion) => {
          pubnub.getSpace(
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

  describe('getSpaces', () => {
    it('gets a list of space objects', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/objects/mySubKey/spaces')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          uuid: 'myUUID',
          auth: 'myAuthKey',
          count: true,
          filter: 'name != "test-space2"',
          limit: 2
        })
        .reply(200, {
          data: [
            {
              ...space,
              created,
              updated,
              eTag,
            },
            {
              ...space2,
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

      pubnub.getSpaces({
        limit: 2,
        include: {
          totalCount: true
        },
        filter: 'name != "test-space2"'
      },
      (status, response) => {
        assert.equal(status.error, false);

        assert.equal(response.data[0].name, 'test-space');
        assert.equal(response.data[0].eTag, eTag);

        assert.equal(response.data[1].name, 'test-space2');
        assert.equal(response.data[1].eTag, eTag2);

        assert.equal(response.totalCount, 9);

        assert.equal(scope.isDone(), true);
        done();
      });
    });

    it('should add list space objects API telemetry information', (done) => {
      let scope = utils.createNock().get('/v1/objects/mySubKey/spaces').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        { data: {} },
        delays,
        (completion) => {
          pubnub.getSpaces(
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
