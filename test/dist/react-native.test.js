import fetch from 'node-fetch';
import { expect } from 'chai';
import PubNub from '../../src/react_native';

global.fetch = fetch;

let pubnub;

let listener = null;

let channelSuffix = new Date().getTime() + (Math.random());

let myChannel1 = `mychannel1${channelSuffix}`;
let myChannel2 = `mychannel2${channelSuffix}`;
// let myChanneGroup1 = `myChannelGroup1${channelSuffix}`;

describe('#distribution test (rkt-native)', function () {

  before(function () {
    pubnub = new PubNub({ subscribeKey: 'demo', publishKey: 'demo' });
  });

  after(function () {
    pubnub.destroy();
  });

  it('should have to subscribe a channel', (done) => {
    listener = {
      status: (st) => {
        expect(st.operation).to.be.equal('PNSubscribeOperation');
        done();
      }
    };

    pubnub.addListener(listener);
    pubnub.subscribe({channels: [myChannel1]});
  });

  it('should have to receive message from a channel', (done) => {
    pubnub.disconnect();
    pubnub.removeListener(listener);
    pubnub.reconnect();

    listener = {
      message: (m) => {
        expect(m.channel).to.be.equal(myChannel2);
        expect(m.message.text).to.be.equal('hello React-Native SDK');
        done();
      }
    };

    pubnub.addListener(listener);
    pubnub.subscribe({channels: [myChannel2]});
    pubnub.publish({ channel: myChannel2, message: { text: 'hello React-Native SDK' }});
  });

  it('should have to set state', (done) => {
    pubnub.setState({ channels: [myChannel1], state: { hello: 'there' } }, (status, response) => {
      expect(status.error).to.be.equal(false);
      expect(response.state.hello).to.be.equal('there');
      done();
    });
  });

  it('should have to get the time', (done) => {
    pubnub.time((status) => {
      expect(status.operation).to.be.equal('PNTimeOperation');
      expect(status.statusCode).to.be.equal(200);
      done();
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
        expect(response.messages).to.have.length(1);
        done();
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

  it('should have to unsubscribe', function (done) {
    pubnub.disconnect();
    pubnub.removeListener(listener);
    pubnub.reconnect();

    let finished = false;

    pubnub.addListener({
      status: function (st) {
        expect(st.operation).to.be.equal('PNUnsubscribeOperation');

        if (!finished) {
          // prevent calling done twice
          finished = true;
          done();
        }
      }
    });
    pubnub.unsubscribe({channels: [myChannel1]});
  });
});