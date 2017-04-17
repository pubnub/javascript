/* global describe, beforeEach, it, before, afterEach, after, PubNub, chai */
/* eslint no-console: 0 */

var expect = chai.expect;
var pubnub = new PubNub({ subscribeKey: 'demo', publishKey: 'demo' });

var listener = null;

describe('#distribution test (titanium)', function () {
  it('should have to subscribe a channel', function (done) {
    listener = {
      status: function (st) {
        expect(st.operation).to.be.equal('PNSubscribeOperation');
        done();
      }
    };

    pubnub.addListener(listener);
    pubnub.subscribe({channels: ['mychannel1']});
  });

  it('should have to receive message from a channel', function (done) {
    pubnub.addListener({
      message: function (m) {
        expect(m.channel).to.be.equal('mychannel2');
        expect(m.message.text).to.be.equal('hello Titanium SDK');
        done();
      }
    });

    pubnub.subscribe({channels: ['mychannel2']});
    pubnub.publish({ channel: 'mychannel2', message: { text: 'hello Titanium SDK' }});
  });

  it('should have to set state', function (done) {
    pubnub.setState({ channels: ['mychannel1'], state: { hello: 'there' } }, function (status, response) {
      expect(status.error).to.be.equal(false);
      expect(response.state.hello).to.be.equal('there');
      done();
    });
  });

  it('should have to get the time', function (done) {
    pubnub.time(function (status) {
      expect(status.operation).to.be.equal('PNTimeOperation');
      expect(status.statusCode).to.be.equal(200);
      done();
    });
  });

  it('should have to get the last message', function (done) {
    pubnub.history({
      channel : 'mychannel2',
      count: 1,
      reverse : false
    }, function(status, response) {
      expect(response.messages).to.have.length(1);
      done();
    });
  });

  it('should have to add a channel group', function (done) {
    pubnub.channelGroups.addChannels(
      {
        channels: ['ch1', 'ch2'],
        channelGroup: "myChannelGroup"
      },
      function(status) {
        expect(status.error).to.be.equal(false);
        done();
      }
    );
  });

  it('should have to list the channels', function (done) {
    pubnub.channelGroups.listChannels(
      {
        channelGroup: "myChannelGroup"
      },
      function (status, response) {
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
