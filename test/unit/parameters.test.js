/* global describe, beforeEach, it , afterEach */

import assert from 'assert';
import PubNub from '../../src/node/index';

let pubnub = new PubNub({ subscribeKey: 'mySubKey', publishKey: 'myPublishKey', uuid: 'myUUID', authKey: 'myAuthKey' });

describe('#parameters validator', () => {
  it('prevent to execute publish with a wrong value', (done) => {
    pubnub.publish({ channel: ['ch1', 'ch2'], message: 'Hello World!' }, (status, response) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute publish with an invalid parameter', (done) => {
    pubnub.publish({ channels: 'ch1', message: 'Hello World!' }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute fire with a wrong value', (done) => {
    pubnub.fire({ channel: ['ch1', 'ch2'], message: 'Hello World!' }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute fire with an invalid parameter', (done) => {
    pubnub.publish({ channels: 'ch1', message: 'Hello World!' }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute hereNow with a wrong value', (done) => {
    pubnub.hereNow({ channels: ['ch1'], includeUUIDs: 'Hello World!' }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute hereNow with an invalid parameter', (done) => {
    pubnub.hereNow({ channels: 'ch1', includeUUIDs: true }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute whereNow with a wrong value', (done) => {
    pubnub.whereNow({ uuid: true }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute whereNow with an invalid parameter', (done) => {
    pubnub.whereNow({ channel: 'ch1' }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute setState with a wrong value', (done) => {
    try {
      pubnub.setState({ channels: 'ch1', state: { status: 'typing' } });
    } catch (err) {
      assert.notEqual(err, '');
      done();
    }
  });

  it('prevent to execute setState with an invalid parameter', (done) => {
    try {
      pubnub.setState({ channels: ['ch1'], status: { status: 'typing' } });
    } catch (err) {
      assert.notEqual(err, '');
      done();
    }
  });

  it('prevent to execute getState with a wrong value', (done) => {
    pubnub.getState({ channels: 'ch1' }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute getState with an invalid parameter', (done) => {
    pubnub.getState({ channel: ['ch1'] }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute grand with a wrong value', (done) => {
    pubnub.grant({ channels: 'ch1' }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute grand with an invalid parameter', (done) => {
    pubnub.grant({ channel: ['ch1'] }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute add_channels with a wrong value', (done) => {
    pubnub.channelGroups.addChannels({ channels: 'ch1', channelGroup: 'cg1' }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute add_channels with an invalid parameter', (done) => {
    pubnub.channelGroups.addChannels({ channel: ['ch1'], channelGroup: 'cg1' }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute list_channels with a wrong value', (done) => {
    pubnub.channelGroups.listChannels({ channelGroup: true }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute list_channels with an invalid parameter', (done) => {
    pubnub.channelGroups.listChannels({ channelGroups: 'ch1' }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute remove_channels with a wrong value', (done) => {
    pubnub.channelGroups.removeChannels({ channels: 'ch1' }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute remove_channels with an invalid parameter', (done) => {
    pubnub.channelGroups.removeChannels({ channel: ['ch1'] }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute delete_group with a wrong value', (done) => {
    pubnub.channelGroups.deleteGroup({ channelGroup: true }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute delete_group with an invalid parameter', (done) => {
    pubnub.channelGroups.deleteGroup({ channel: 'cg1' }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute history with a wrong value', (done) => {
    pubnub.history({ channel: true }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute history with an invalid parameter', (done) => {
    pubnub.history({ channels: 'ch1' }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute fetch with a wrong value', (done) => {
    pubnub.fetchMessages({ channels: 'ch1' }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute fetchMessages with an invalid parameter', (done) => {
    pubnub.fetchMessages({ channel: ['ch1'] }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute push_add_channels  with a wrong value', (done) => {
    pubnub.push.addChannels({ channels: 'ch1' }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute push_add_channels with an invalid parameter', (done) => {
    pubnub.push.addChannels({ channel: ['ch1'] }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute push_list_channels  with a wrong value', (done) => {
    pubnub.push.listChannels({ device: true }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute push_list_channels with an invalid parameter', (done) => {
    pubnub.push.listChannels({ devices: 'ch1' }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute push_remove_channels  with a wrong value', (done) => {
    pubnub.push.removeChannels({ channels: 'ch1' }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute push_remove_channels with an invalid parameter', (done) => {
    pubnub.push.removeChannels({ channel: ['ch1'] }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute push_delete_device  with a wrong value', (done) => {
    pubnub.push.deleteDevice({ device: true }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });

  it('prevent to execute push_delete_device with an invalid parameter', (done) => {
    pubnub.push.deleteDevice({ devices: 'ch1' }, (status) => {
      assert.equal(status.error, true);
      assert.equal(status.type, 'validationError');
      done();
    });
  });
});