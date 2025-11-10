import fetch from 'node-fetch';
import { expect } from 'chai';
import PubNub from '../../src/react_native';
import nock from "nock";

global.fetch = fetch;

let pubnub;

let channelSuffix = new Date().getTime() + (Math.random());

let myChannel1 = `mychannel1${channelSuffix}`;
let myChannel2 = `mychannel2${channelSuffix}`;
// let myChanneGroup1 = `myChannelGroup1${channelSuffix}`;

describe('#distribution test (rkt-native)', function () {
  after(function () {
    pubnub.destroy();
  });

  beforeEach(() => {
    pubnub = new PubNub({ subscribeKey: 'demo', publishKey: 'demo', uuid: 'myUUID' });
  });

  afterEach(() => {
    pubnub.removeAllListeners();
    pubnub.unsubscribeAll();
    pubnub.stop();
  });

  it('should have to subscribe a channel', (done) => {
    pubnub.addListener({
      status: (st) => {
        try {
          expect(st.operation).to.be.equal('PNSubscribeOperation');
          pubnub.unsubscribeAll()
          done();
        } catch (error) {
          done(error);
        }
      }
    });
    pubnub.subscribe({channels: [myChannel1]});
  });

  it('should have to receive message from a channel', (done) => {
    pubnub.addListener({
      status: (st) => {
        if (st.operation === 'PNSubscribeOperation') {
          pubnub.publish({ channel: myChannel2, message: { text: 'hello React-Native SDK' }});
        }
      },
      message: (m) => {
        try {
          expect(m.channel).to.be.equal(myChannel2);
          expect(m.message.text).to.be.equal('hello React-Native SDK');
          pubnub.unsubscribeAll()
          done();
        } catch (error) {
          done(error);
        }
      }
    });
    pubnub.subscribe({channels: [myChannel2]});
  });

  it('should have to set state', (done) => {
    pubnub.setState({ channels: [myChannel1], state: { hello: 'there' } }, (status, response) => {
      try {
        expect(status.error).to.be.equal(false);
        expect(response.state.hello).to.be.equal("there");
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('should have to get the time', (done) => {
    pubnub.time((status) => {
      try {
        expect(status.operation).to.be.equal("PNTimeOperation");
        expect(status.statusCode).to.be.equal(200);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('should have to get the last message', (done) => {
    // add delay to ensure publish completes
    setTimeout(function () {
      pubnub.history({
        channel: myChannel2,
        count: 1,
        reverse: false
      }, function(status, response) {
        try {
          expect(response.messages).to.have.length(1);
          done();
        } catch (error) {
          done(error);
        }
      });
    }, 3000);
  });

  // TODO: fix test account for channel groups
  // currently failing since too many channel groups exist

  // it('should have to add a channel group', (done) => {
  //   pubnub.channelGroups.addChannels(
  //     {
  //       channels: ['ch1', 'ch2'],
  //       channelGroup: myChannelGroup1
  //     },
  //     (status) => {
  //       expect(status.error).to.be.equal(false);
  //       done();
  //     }
  //   );
  // });

  // it('should have to list the channels', (done) => {
  //   pubnub.channelGroups.listChannels(
  //     {
  //       channelGroup: myChannelGroup1
  //     },
  //     (status, response) => {
  //       expect(status.error).to.be.equal(false);
  //       expect(response.channels).to.have.length(2);
  //       done();
  //     }
  //   );
  // });

  it('should have to change the UUID', function (done) {
    pubnub.setUUID("CustomUUID");

    expect(pubnub.getUUID()).to.be.equal("CustomUUID");
    done();
  });

  // TODO: fix test. it shouldn't rely on previous steps outcome.
  it('should have to unsubscribe', function (done) {
    let finished = false;

    pubnub.addListener({
      status: function (st) {
        if (st.operation === 'PNSubscribeOperation') {
          pubnub.unsubscribe({channels: [myChannel1]});
        } else {
          expect(st.operation).to.be.equal('PNUnsubscribeOperation');

          if (!finished) {
            // prevent calling done twice
            finished = true;
            pubnub.unsubscribeAll()
            done();
          }
        }
      }
    });
    pubnub.subscribe({channels: [myChannel1]});
  });

  describe('#static members', function () {
    it('should have access to ExponentialRetryPolicy', function () {
      expect(PubNub.ExponentialRetryPolicy).to.be.a('function');
      
      const retryPolicy = PubNub.ExponentialRetryPolicy({
        minimumDelay: 2,
        maximumDelay: 150,
        maximumRetry: 6
      });
      
      expect(retryPolicy).to.have.property('shouldRetry');
      expect(retryPolicy).to.have.property('getDelay');
      expect(retryPolicy).to.have.property('validate');
      expect(retryPolicy.minimumDelay).to.equal(2);
      expect(retryPolicy.maximumDelay).to.equal(150);
      expect(retryPolicy.maximumRetry).to.equal(6);
    });

    it('should have access to LinearRetryPolicy', function () {
      expect(PubNub.LinearRetryPolicy).to.be.a('function');
      
      const retryPolicy = PubNub.LinearRetryPolicy({
        delay: 5,
        maximumRetry: 10
      });
      
      expect(retryPolicy).to.have.property('shouldRetry');
      expect(retryPolicy).to.have.property('getDelay');
      expect(retryPolicy).to.have.property('validate');
      expect(retryPolicy.delay).to.equal(5);
      expect(retryPolicy.maximumRetry).to.equal(10);
    });

    it('should have access to NoneRetryPolicy', function () {
      expect(PubNub.NoneRetryPolicy).to.be.a('function');
      
      const retryPolicy = PubNub.NoneRetryPolicy();
      
      expect(retryPolicy).to.have.property('shouldRetry');
      expect(retryPolicy).to.have.property('getDelay');
      expect(retryPolicy).to.have.property('validate');
      expect(retryPolicy.shouldRetry()).to.be.false;
      expect(retryPolicy.getDelay()).to.equal(-1);
    });



    it('should have access to CATEGORIES enum', function () {
      expect(PubNub.CATEGORIES).to.be.an('object');
      expect(PubNub.CATEGORIES).to.have.property('PNNetworkUpCategory');
      expect(PubNub.CATEGORIES).to.have.property('PNNetworkDownCategory');
      expect(PubNub.CATEGORIES).to.have.property('PNReconnectedCategory');
      expect(PubNub.CATEGORIES).to.have.property('PNConnectedCategory');
      expect(PubNub.CATEGORIES).to.have.property('PNAccessDeniedCategory');
      expect(PubNub.CATEGORIES).to.have.property('PNTimeoutCategory');
    });

    it('should have access to OPERATIONS enum', function () {
      expect(PubNub.OPERATIONS).to.be.an('object');
      expect(PubNub.OPERATIONS).to.have.property('PNSubscribeOperation');
      expect(PubNub.OPERATIONS).to.have.property('PNUnsubscribeOperation');
      expect(PubNub.OPERATIONS).to.have.property('PNPublishOperation');
      expect(PubNub.OPERATIONS).to.have.property('PNHistoryOperation');
      expect(PubNub.OPERATIONS).to.have.property('PNTimeOperation');
    });

    it('should have access to Endpoint enum', function () {
      expect(PubNub.Endpoint).to.be.an('object');
      expect(PubNub.Endpoint).to.have.property('MessageSend');
      expect(PubNub.Endpoint).to.have.property('Presence');
      expect(PubNub.Endpoint).to.have.property('Files');
      expect(PubNub.Endpoint).to.have.property('MessageStorage');
      expect(PubNub.Endpoint).to.have.property('ChannelGroups');
    });

    it('should have access to LogLevel enum', function () {
      expect(PubNub.LogLevel).to.be.an('object');
      expect(PubNub.LogLevel).to.have.property('Verbose');
      expect(PubNub.LogLevel).to.have.property('Debug');
      expect(PubNub.LogLevel).to.have.property('Info');
      expect(PubNub.LogLevel).to.have.property('Warn');
      expect(PubNub.LogLevel).to.have.property('Error');
      expect(PubNub.LogLevel).to.have.property('Critical');
    });

    it('should have access to generateUUID static method', function () {
      expect(PubNub.generateUUID).to.be.a('function');
      
      const uuid1 = PubNub.generateUUID();
      const uuid2 = PubNub.generateUUID();
      
      expect(uuid1).to.be.a('string');
      expect(uuid2).to.be.a('string');
      expect(uuid1).to.have.length.above(0);
      expect(uuid1).to.not.equal(uuid2); // UUIDs should be unique
    });

    it('should have access to notificationPayload static method', function () {
      expect(PubNub.notificationPayload).to.be.a('function');
      
      const payload = PubNub.notificationPayload('Test Title', 'Test Body');
      
      expect(payload).to.be.an('object');
      expect(payload).to.have.property('pn_apns');
      expect(payload).to.have.property('pn_gcm');
      expect(payload.pn_apns.aps.alert.title).to.equal('Test Title');
      expect(payload.pn_apns.aps.alert.body).to.equal('Test Body');
    });

    it('should be able to use retry policies in configuration', function (done) {
      // Test with ExponentialRetryPolicy
      const exponentialPubNub = new PubNub({
        subscribeKey: 'demo',
        publishKey: 'demo',
        uuid: 'testUUID',
        retryConfiguration: PubNub.ExponentialRetryPolicy({
          minimumDelay: 2,
          maximumDelay: 10,
          maximumRetry: 3,
          excluded: [PubNub.Endpoint.MessageSend]
        })
      });
      
      expect(exponentialPubNub._configuration.retryConfiguration).to.be.an('object');
      expect(exponentialPubNub._configuration.retryConfiguration.minimumDelay).to.equal(2);
      exponentialPubNub.destroy();

      // Test with LinearRetryPolicy
      const linearPubNub = new PubNub({
        subscribeKey: 'demo',
        publishKey: 'demo',
        uuid: 'testUUID',
        retryConfiguration: PubNub.LinearRetryPolicy({
          delay: 3,
          maximumRetry: 5
        })
      });
      
      expect(linearPubNub._configuration.retryConfiguration).to.be.an('object');
      expect(linearPubNub._configuration.retryConfiguration.delay).to.equal(3);
      linearPubNub.destroy();

      // Test with NoneRetryPolicy (disable retries)
      const nonePubNub = new PubNub({
        subscribeKey: 'demo',
        publishKey: 'demo',
        uuid: 'testUUID',
        retryConfiguration: PubNub.NoneRetryPolicy()
      });
      
      expect(nonePubNub._configuration.retryConfiguration).to.be.an('object');
      expect(nonePubNub._configuration.retryConfiguration.shouldRetry()).to.be.false;
      nonePubNub.destroy();

      done();
    });

    it('should maintain compatibility with all static method signatures', function () {
      // Test that all methods match expected signatures from Web/Node

      // Retry policy methods should accept configuration objects
      expect(() => {
        PubNub.ExponentialRetryPolicy({
          minimumDelay: 2,
          maximumDelay: 150,
          maximumRetry: 6,
          excluded: [PubNub.Endpoint.MessageSend, PubNub.Endpoint.Presence]
        });
      }).to.not.throw();

      expect(() => {
        PubNub.LinearRetryPolicy({
          delay: 5,
          maximumRetry: 10,
          excluded: [PubNub.Endpoint.Files]
        });
      }).to.not.throw();

      expect(() => {
        PubNub.NoneRetryPolicy();
      }).to.not.throw();

      // generateUUID should return string
      expect(PubNub.generateUUID()).to.be.a('string');

      // notificationPayload should accept two strings
      expect(() => {
        PubNub.notificationPayload('title', 'body');
      }).to.not.throw();
    });
  });

  describe('#File', function () {
    it('should have access to File property on pubnub instance', function () {
      expect(pubnub.File).to.be.a('function');
      expect(pubnub.File).to.have.property('create');
    });

    it('should be able to create a PubNubFile using pubnub.File.create() with data object', function () {
      const fileData = {
        data: 'Hello World',
        name: 'test.txt',
        mimeType: 'text/plain'
      };

      const file = pubnub.File.create(fileData);

      expect(file).to.be.an('object');
      expect(file).to.have.property('name').equal('test.txt');
      expect(file).to.have.property('mimeType').equal('text/plain');
      expect(file).to.have.property('data');
    });

    it('should be able to create a PubNubFile using pubnub.File.create() with Blob', function () {
      const blob = new Blob(['test content'], { type: 'text/plain' });
      const fileData = {
        data: blob,
        name: 'blob-test.txt',
        mimeType: 'text/plain'
      };

      const file = pubnub.File.create(fileData);

      expect(file).to.be.an('object');
      expect(file).to.have.property('name').equal('blob-test.txt');
      expect(file).to.have.property('mimeType').equal('text/plain');
    });

    it('should be able to create a PubNubFile using pubnub.File.create() with uri', function () {
      const fileData = {
        uri: 'file:///path/to/file.txt',
        name: 'uri-test.txt',
        mimeType: 'text/plain'
      };

      const file = pubnub.File.create(fileData);

      expect(file).to.be.an('object');
      expect(file).to.have.property('name').equal('uri-test.txt');
      expect(file).to.have.property('mimeType').equal('text/plain');
    });

    it('should throw error when creating PubNubFile without required parameters', function () {
      expect(() => {
        pubnub.File.create({});
      }).to.throw();
    });
  });
});
