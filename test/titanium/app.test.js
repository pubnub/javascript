/* global describe, beforeEach, it, before, afterEach, after, PubNub, chai */
/* eslint no-console: 0 */

var expect = chai.expect;
var pubnub = new PubNub({ subscribeKey: 'demo', publishKey: 'demo' });

describe('#Titanium Integration', function () {
  it('should have to subscribe a channel', function (done) {
    pubnub.addListener({
      status: function (st) {
        expect(st.operation).to.be.equal('PNSubscribeOperation');
        done();
      }
    });
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

  it('should have to notify presence', function (done) {
    pubnub.addListener({
      presence: function (p) {
        expect(p.channel).to.be.equal('mychannel3');
        expect(p.action).to.be.equal('join');
        done();
      }
    });

    pubnub.subscribe({channels: ['mychannel3'], withPresence: true});
  });

  it('should have to set state', function (done) {
    pubnub.setState({ channels: ['mychannel1'], state: { hello: 'there' } }, function (status, response) {
      expect(status.error).to.be.equal(false);
      expect(response.state.hello).to.be.equal('there');
      done();
    });
  });

  it('time', function (done) {
    pubnub.time(function (status, response) {
      expect(status.operation).to.be.equal('PNTimeOperation');
      expect(status.statusCode).to.be.equal(200);
      done();
    });
  });
});
