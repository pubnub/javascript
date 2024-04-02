/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';
import nock from 'nock';
import utils from '../../utils';
import PubNub from '../../../src/node/index';

describe('push endpoints', () => {
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
    });
  });

  describe('adding channels to device', () => {
    it('supports addition of multiple channels for apple', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/push/sub-key/mySubKey/devices/niceDevice')
        .query({
          add: 'a,b',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          type: 'apns',
          uuid: 'myUUID',
        })
        .reply(200, '[1, "Modified Channels"]');

      pubnub.push.addChannels(
        { channels: ['a', 'b'], device: 'niceDevice', pushGateway: 'apns' },
        (status) => {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('supports addition of multiple channels for apple (APNS2)', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/push/sub-key/mySubKey/devices-apns2/niceDevice')
        .query({
          add: 'a,b',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          environment: 'development',
          topic: 'com.test.apns',
          uuid: 'myUUID',
        })
        .reply(200, '[1, "Modified Channels"]');

      pubnub.push.addChannels(
        { channels: ['a', 'b'], device: 'niceDevice', pushGateway: 'apns2', topic: 'com.test.apns' },
        (status) => {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('supports addition of multiple channels for microsoft', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/push/sub-key/mySubKey/devices/niceDevice')
        .query({
          add: 'a,b',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          type: 'mpns',
          uuid: 'myUUID',
        })
        .reply(200, '[1, "Modified Channels"]');

      pubnub.push.addChannels(
        { channels: ['a', 'b'], device: 'niceDevice', pushGateway: 'mpns' },
        (status) => {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('supports addition of multiple channels for google', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/push/sub-key/mySubKey/devices/niceDevice')
        .query({
          add: 'a,b',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          type: 'gcm',
          uuid: 'myUUID',
        })
        .reply(200, '[1, "Modified Channels"]');

      pubnub.push.addChannels(
        { channels: ['a', 'b'], device: 'niceDevice', pushGateway: 'gcm' },
        (status) => {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('should add push enabled for channels API telemetry information', (done) => {
      let scope = utils.createNock().get('/v1/push/sub-key/mySubKey/devices/niceDevice').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        '[1, "Modified Channels"]',
        delays,
        (completion) => {
          pubnub.push.addChannels(
            { channels: ['a', 'b'], device: 'niceDevice', pushGateway: 'apns' },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_push', average, leeway);
          done();
        });
    }).timeout(60000);

    it('should add APNS2 enabled for channels API telemetry information', (done) => {
      let scope = utils.createNock().get('/v2/push/sub-key/mySubKey/devices-apns2/niceDevice').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        '[1, "Modified Channels"]',
        delays,
        (completion) => {
          pubnub.push.addChannels(
            { channels: ['a', 'b'], device: 'niceDevice', pushGateway: 'apns2', topic: 'com.test.apns' },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_push', average, leeway);
          done();
        });
    }).timeout(60000);
  });

  describe('listing channels for device', () => {
    it('supports channel listing for apple', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/push/sub-key/mySubKey/devices/coolDevice')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          type: 'apns',
          uuid: 'myUUID',
        })
        .reply(200, '["ch1", "ch2", "ch3"]');

      pubnub.push.listChannels(
        { device: 'coolDevice', pushGateway: 'apns' },
        (status, response) => {
          assert.equal(status.error, false);
          assert.deepEqual(response.channels, ['ch1', 'ch2', 'ch3']);
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('supports channel listing for apple (APNS2)', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/push/sub-key/mySubKey/devices-apns2/coolDevice')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          environment: 'production',
          topic: 'com.test.apns',
          uuid: 'myUUID',
        })
        .reply(200, '["ch1", "ch2", "ch3"]');

      pubnub.push.listChannels(
        { device: 'coolDevice', pushGateway: 'apns2', environment: 'production', topic: 'com.test.apns' },
        (status, response) => {
          assert.equal(status.error, false);
          assert.deepEqual(response.channels, ['ch1', 'ch2', 'ch3']);
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('supports channel listing for microsoft', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/push/sub-key/mySubKey/devices/coolDevice')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          type: 'mpns',
          uuid: 'myUUID',
        })
        .reply(200, '["ch1", "ch2", "ch3"]');

      pubnub.push.listChannels(
        { device: 'coolDevice', pushGateway: 'mpns' },
        (status, response) => {
          assert.equal(status.error, false);
          assert.deepEqual(response.channels, ['ch1', 'ch2', 'ch3']);
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('supports channel listing for google', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/push/sub-key/mySubKey/devices/coolDevice')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          type: 'gcm',
          uuid: 'myUUID',
        })
        .reply(200, '["ch1", "ch2", "ch3"]');

      pubnub.push.listChannels(
        { device: 'coolDevice', pushGateway: 'gcm' },
        (status, response) => {
          assert.equal(status.error, false);
          assert.deepEqual(response.channels, ['ch1', 'ch2', 'ch3']);
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('should add push audit API telemetry information', (done) => {
      let scope = utils.createNock().get('/v1/push/sub-key/mySubKey/devices/coolDevice').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        '["ch1", "ch2", "ch3"]',
        delays,
        (completion) => {
          pubnub.push.listChannels(
            { device: 'coolDevice', pushGateway: 'apns' },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_push', average, leeway);
          done();
        });
    }).timeout(60000);

    it('should add APNS2 audit API telemetry information', (done) => {
      let scope = utils.createNock().get('/v2/push/sub-key/mySubKey/devices-apns2/coolDevice').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        '["ch1", "ch2", "ch3"]',
        delays,
        (completion) => {
          pubnub.push.listChannels(
            { device: 'coolDevice', pushGateway: 'apns2', environment: 'production', topic: 'com.test.apns' },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_push', average, leeway);
          done();
        });
    }).timeout(60000);
  });

  describe('supports deletion of channels', () => {
    it('supports removal of multiple channels for apple', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/push/sub-key/mySubKey/devices/niceDevice')
        .query({
          remove: 'a,b',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          type: 'apns',
          uuid: 'myUUID',
        })
        .reply(200, '[1, "Modified Channels"]');

      pubnub.push.removeChannels(
        { channels: ['a', 'b'], device: 'niceDevice', pushGateway: 'apns' },
        (status) => {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('supports removal of multiple channels for apple (APNS2)', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/push/sub-key/mySubKey/devices-apns2/niceDevice')
        .query({
          remove: 'a,b',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          environment: 'development',
          topic: 'com.test.apns',
          uuid: 'myUUID',
        })
        .reply(200, '[1, "Modified Channels"]');

      pubnub.push.removeChannels(
        { channels: ['a', 'b'], device: 'niceDevice', pushGateway: 'apns2', topic: 'com.test.apns' },
        (status) => {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('supports removal of multiple channels for microsoft', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/push/sub-key/mySubKey/devices/niceDevice')
        .query({
          remove: 'a,b',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          type: 'mpns',
          uuid: 'myUUID',
        })
        .reply(200, '[1, "Modified Channels"]');

      pubnub.push.removeChannels(
        { channels: ['a', 'b'], device: 'niceDevice', pushGateway: 'mpns' },
        (status) => {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('supports removal of multiple channels for google', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/push/sub-key/mySubKey/devices/niceDevice')
        .query({
          remove: 'a,b',
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          type: 'gcm',
          uuid: 'myUUID',
        })
        .reply(200, '[1, "Modified Channels"]');

      pubnub.push.removeChannels(
        {
          channels: ['a', 'b'],
          device: 'niceDevice',
          pushGateway: 'gcm',
          uuid: 'myUUID',
        },
        (status) => {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('should add push disable for channels API telemetry information', (done) => {
      let scope = utils.createNock().get('/v1/push/sub-key/mySubKey/devices/niceDevice').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        '[1, "Modified Channels"]',
        delays,
        (completion) => {
          pubnub.push.removeChannels(
            { channels: ['a', 'b'], device: 'niceDevice', pushGateway: 'apns' },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_push', average, leeway);
          done();
        });
    }).timeout(60000);

    it('should add APNS2 disable for channels API telemetry information', (done) => {
      let scope = utils.createNock().get('/v2/push/sub-key/mySubKey/devices-apns2/niceDevice').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        '[1, "Modified Channels"]',
        delays,
        (completion) => {
          pubnub.push.removeChannels(
            { channels: ['a', 'b'], device: 'niceDevice', pushGateway: 'apns2', topic: 'com.test.apns' },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_push', average, leeway);
          done();
        });
    }).timeout(60000);
  });

  describe('supports removal of device', () => {
    it('supports removal of device for apple', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/push/sub-key/mySubKey/devices/niceDevice/remove')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          type: 'apns',
          uuid: 'myUUID',
        })
        .reply(200, '[1, "Modified Channels"]');

      pubnub.push.deleteDevice(
        { device: 'niceDevice', pushGateway: 'apns' },
        (status) => {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('supports removal of device for apple (APNS2)', (done) => {
      const scope = utils
        .createNock()
        .get('/v2/push/sub-key/mySubKey/devices-apns2/niceDevice/remove')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          environment: 'production',
          topic: 'com.test.apns',
          uuid: 'myUUID',
        })
        .reply(200, '[1, "Modified Channels"]');

      pubnub.push.deleteDevice(
        { device: 'niceDevice', pushGateway: 'apns2', environment: 'production', topic: 'com.test.apns' },
        (status) => {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('supports removal of device for microsoft', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/push/sub-key/mySubKey/devices/niceDevice/remove')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          type: 'mpns',
          uuid: 'myUUID',
        })
        .reply(200, '[1, "Modified Channels"]');

      pubnub.push.deleteDevice(
        { device: 'niceDevice', pushGateway: 'mpns' },
        (status) => {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('supports removal of device for google', (done) => {
      const scope = utils
        .createNock()
        .get('/v1/push/sub-key/mySubKey/devices/niceDevice/remove')
        .query({
          pnsdk: `PubNub-JS-Nodejs/${pubnub.getVersion()}`,
          type: 'gcm',
          uuid: 'myUUID',
        })
        .reply(200, '[1, "Modified Channels"]');

      pubnub.push.deleteDevice(
        { device: 'niceDevice', pushGateway: 'gcm' },
        (status) => {
          assert.equal(status.error, false);
          assert.equal(scope.isDone(), true);
          done();
        }
      );
    });

    it('should add push disable for device API telemetry information', (done) => {
      let scope = utils.createNock().get('/v1/push/sub-key/mySubKey/devices/niceDevice/remove').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        '[1, "Modified Channels"]',
        delays,
        (completion) => {
          pubnub.push.deleteDevice(
            { device: 'niceDevice', pushGateway: 'apns' },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_push', average, leeway);
          done();
        });
    }).timeout(60000);

    it('should add APNS2 disable for device API telemetry information', (done) => {
      let scope = utils.createNock().get('/v2/push/sub-key/mySubKey/devices-apns2/niceDevice/remove').query(true);
      const delays = [100, 200, 300, 400];
      const countedDelays = delays.slice(0, delays.length - 1);
      const average = Math.floor(countedDelays.reduce((acc, delay) => acc + delay, 0) / countedDelays.length);
      const leeway = 50;

      utils.runAPIWithResponseDelays(scope,
        200,
        '[1, "Modified Channels"]',
        delays,
        (completion) => {
          pubnub.push.deleteDevice(
            { device: 'niceDevice', pushGateway: 'apns2', environment: 'production', topic: 'com.test.apns' },
            () => { completion(); }
          );
        })
        .then((lastRequest) => {
          utils.verifyRequestTelemetry(lastRequest.path, 'l_push', average, leeway);
          done();
        });
    }).timeout(60000);
  });
});
