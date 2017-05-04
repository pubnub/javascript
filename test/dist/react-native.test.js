import fetch from 'node-fetch';
import { expect } from 'chai';
import PubNub from '../../src/react_native';

global.fetch = fetch;

let pubnub = new PubNub({ subscribeKey: 'demo', publishKey: 'demo' });

let listener = null;

describe('#distribution test (rkt-native)', function () {
  it('should have to subscribe a channel', (done) => {
    listener = {
      status: (st) => {
        expect(st.operation).to.be.equal('PNSubscribeOperation');
        done();
      }
    };

    pubnub.addListener(listener);
    pubnub.subscribe({channels: ['mychannel1']});
  });

  it('should have to receive message from a channel', (done) => {
    pubnub.removeListener(listener);

    listener = {
      message: (m) => {
        expect(m.channel).to.be.equal('mychannel2');
        expect(m.message.text).to.be.equal('hello React-Native SDK');
        done();
      }
    };

    pubnub.addListener(listener);
    pubnub.subscribe({channels: ['mychannel2']});
    pubnub.publish({ channel: 'mychannel2', message: { text: 'hello React-Native SDK' }});
  });

  it('should have to set state', (done) => {
    pubnub.setState({ channels: ['mychannel1'], state: { hello: 'there' } }, (status, response) => {
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
    pubnub.history({
      channel : 'mychannel2',
      count: 1,
      reverse : false
    }, (status, response) => {
      expect(response.messages).to.have.length(1);
      done();
    });
  });

  it('should have to add a channel group', (done) => {
    pubnub.channelGroups.addChannels(
      {
        channels: ['ch1', 'ch2'],
        channelGroup: "myChannelGroup"
      },
      (status) => {
        expect(status.error).to.be.equal(false);
        done();
      }
    );
  });

  it('should have to list the channels', (done) => {
    pubnub.channelGroups.listChannels(
      {
        channelGroup: "myChannelGroup"
      },
      (status, response) => {
        expect(status.error).to.be.equal(false);
        expect(response.channels).to.have.length(2);
        done();
      }
    );
  });

  it('should have to change the UUID', function (done) {
    pubnub.setUUID("CustomUUID");

    expect(pubnub.getUUID()).to.be.equal("CustomUUID");
    done();
  });

  it('should have to unsubscribe', function (done) {
    pubnub.removeListener(listener);

    pubnub.addListener({
      status: function (st) {
        expect(st.operation).to.be.equal('PNUnsubscribeOperation');
        done();
      }
    });
    pubnub.unsubscribe({channels: ['mychannel1']});
  });
});
