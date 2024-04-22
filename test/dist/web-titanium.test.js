/* global describe, beforeEach, it, before, afterEach, after, PubNub, chai */
/* eslint no-console: 0 */

var expect = chai.expect;
var pubnub;

var listener = null;

var channelSuffix = new Date().getTime();

var myChannel1 = 'mychannel1' + channelSuffix;
var myChannel2 = 'mychannel2' + channelSuffix;
var myChanneGroup1 = 'myChannelGroup1' + channelSuffix;

describe('#distribution test (titanium)', function () {
  before(function () {
    pubnub = new PubNub({
      subscribeKey: 'demo',
      publishKey: 'demo',
      uuid: 'myUUID',
    });
  });

  after(function () {
    pubnub.destroy();
  });

  it('should have to subscribe a channel', function (done) {
    listener = {
      status: function (st) {
        try {
          expect(st.operation).to.be.equal("PNSubscribeOperation");
          done();
        } catch (error) {
          done(error);
        }
      },
    };

    pubnub.addListener(listener);
    pubnub.subscribe({ channels: [myChannel1] });
  });

  it('should have to receive message from a channel', function (done) {
    pubnub.disconnect();
    pubnub.removeListener(listener);
    pubnub.reconnect();

    listener = pubnub.addListener({
      message: function (m) {
        try {
          expect(m.channel).to.be.equal(myChannel2);
          expect(m.message.text).to.be.equal("hello Titanium SDK");
          done();
        } catch (error) {
          done(error);
        }
      },
    });

    pubnub.subscribe({ channels: [myChannel2] });
    setTimeout(function () {
      pubnub.publish({ channel: myChannel2, message: { text: 'hello Titanium SDK' } });
    }, 1000);
  });

  it('should have to set state', function (done) {
    pubnub.setState({ channels: [myChannel1], state: { hello: 'there' } }, function (status, response) {
      try {
        expect(status.error).to.be.equal(false);
        expect(response.state.hello).to.be.equal("there");
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('should have to get the time', function (done) {
    pubnub.time(function (status) {
      try {
        expect(status.operation).to.be.equal("PNTimeOperation");
        expect(status.statusCode).to.be.equal(200);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  it('should have to get the last message', function (done) {
    // add delay to ensure publish completes
    setTimeout(function () {
      pubnub.history(
        {
          channel: myChannel2,
          count: 1,
          reverse: false,
        },
        function (status, response) {
          try {
            expect(response.messages).to.have.length(1);
            done();
          } catch (error) {
            done(error);
          }
        },
      );
    }, 3000);
  });

  // TODO: fix test account for channel groups
  // currently failing since too many channel groups exist

  // it('should have to add a channel group', function (done) {
  //   pubnub.channelGroups.addChannels(
  //     {
  //       channels: ['ch1', 'ch2'],
  //       channelGroup: myChanneGroup1
  //     },
  //     function(status) {
  //       expect(status.error).to.be.equal(false);
  //       done();
  //     }
  //   );
  // });

  // it('should have to list the channels', function (done) {
  //   pubnub.channelGroups.listChannels(
  //     {
  //       channelGroup: myChanneGroup1
  //     },
  //     function (status, response) {
  //       expect(status.error).to.be.equal(false);
  //       expect(response.channels).to.have.length(2);
  //       done();
  //     }
  //   );
  // });

  it('should have to change the UUID', function (done) {
    pubnub.setUUID('CustomUUID');

    try {
      expect(pubnub.getUUID()).to.be.equal("CustomUUID");
      done();
    } catch (error) {
      done(error);
    }
  });

  it('should have to unsubscribe', function (done) {
    pubnub.disconnect();
    pubnub.removeListener(listener);
    pubnub.reconnect();

    var finished = false;

    pubnub.addListener({
      status: function (st) {
        try {
          expect(st.operation).to.be.equal("PNUnsubscribeOperation");

          if (!finished) {
            // prevent calling done twice
            finished = true;
            done();
          }
        } catch (error) {
          done(error);
        }
      },
    });
    pubnub.unsubscribe({ channels: [myChannel1] });
  });
});
