pubnub = require('../../pubnub.js');
sinon = require("sinon");
assert = require('assert');

var fixture = {};

describe("#unsubscribe", function(){
  beforeEach(function(done) {
    this.timeout(3000);
    fixture = {};

    fixture.pubnubInstance = pubnub.init({
      publish_key: 'ds',
      subscribe_key: 'ds',
      origin: 'pubsub.pubnub.com',
      build_u: true
    });

    fixture.stubbedLeave = sinon.stub(fixture.pubnubInstance.__PN, "LEAVE", function (channel, intz , authKey, callback, err){
      callback();
      return true;
    });

    fixture.stubbedLeaveGroup = sinon.stub(fixture.pubnubInstance.__PN, "LEAVE_GROUP", function (channel, intz , authKey, callback, err){
      callback();
      return true;
    });

    //console.log(pubnubInstance.LEAVE);

    fixture.pubnubInstance.ready();
    setTimeout(done, 1500)

  });

  describe("leaving a channel", function(){
    it("supports leaving of a singular channel", function(done){
      fixture.pubnubInstance.unsubscribe({channel: "max"}, function(){
        assert.equal(fixture.stubbedLeave.callCount, 1);
        assert.equal(fixture.stubbedLeaveGroup.callCount, 0);
        assert.deepEqual(fixture.stubbedLeave.firstCall.args[0], [ 'max', 'max-pnpres' ]);
        done()
      });
    });

    it("supports leaving of multiple channels", function(done){
      fixture.pubnubInstance.unsubscribe({channel: ["max", "max2"]}, function(){
        assert.equal(fixture.stubbedLeave.callCount, 1);
        assert.equal(fixture.stubbedLeaveGroup.callCount, 0);
        assert.deepEqual(fixture.stubbedLeave.firstCall.args[0], [ 'max', 'max2', 'max-pnpres', 'max2-pnpres' ]);
        done()
      });
    });
  });

  describe("leaving a channel group", function(){
    it("supports leaving of a singular channel group", function(){
      fixture.pubnubInstance.unsubscribe({'channel-group': "max"}, function(){
        assert.equal(fixture.stubbedLeave.callCount, 0);
        assert.equal(fixture.stubbedLeaveGroup.callCount, 1);
        assert.deepEqual(fixture.stubbedLeaveGroup.firstCall.args[0], [ 'max', 'max-pnpres' ]);
        done()
      });
    });

    it("supports leaving of multiple channel groups", function(){
      fixture.pubnubInstance.unsubscribe({'channel-group': ["max", "max2"]}, function(){
        assert.equal(fixture.stubbedLeave.callCount, 0);
        assert.equal(fixture.stubbedLeaveGroup.callCount, 1);
        assert.deepEqual(fixture.stubbedLeaveGroup.firstCall.args[0], [ 'max', 'max2', 'max-pnpres', 'max2-pnpres' ]);
        done()
      });
    });
  });

});