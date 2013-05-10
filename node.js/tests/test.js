    var assert = require('assert');
    var PUBNUB = require('../pubnub.js');

    var pubnub = PUBNUB.init({
        publish_key     : 'demo',
        subscribe_key     : 'demo'
    });

    var channel = 'javascript-test-channel-' + Date.now();
    var count = 0;

    var message_string = 'Hi from Javascript';

    describe('Pubnub', function() {
        this.timeout(40000);
        describe('#publish()', function(){
            it('should publish json arrays without error 2', function(done){
                var ch = channel + '-array-' + ++count ;
                var msg = [ 'message' , ch ];
                pubnub.subscribe({channel : ch ,
                    connect : function(response) {
                        pubnub.publish({channel: ch , message : msg,
                            callback : function(response) {
                                assert.deepEqual(response[0],1);
                            }
                        });
                    },
                    callback : function(response) {
                        assert.deepEqual(response,msg);
                        pubnub.unsubscribe({channel : ch});
                        done();
                    }

                })
            })
            it('should publish json objects without error 3', function(done){
                var ch = channel + '-object-' + ++count;
                var msg = { 'message' : ch };
                pubnub.subscribe({channel : ch ,
                    connect : function(response) {
                        pubnub.publish({channel: ch , message : msg,
                            callback : function(response) {
                                assert.deepEqual(response[0],1);
                            }
                        });
                    },
                    callback : function(response) {
                        assert.deepEqual(response,msg);
                        pubnub.unsubscribe({channel : ch});
                        done();
                    }

                })
            })
            it('should publish json arrays without error 4', function(done){
                var ch = channel + '-array-' + ++count ;
                var msg = [ 'message' , ch ];
                pubnub.subscribe({channel : ch ,
                    connect : function(response) {
                        pubnub.publish({channel: ch , message : msg,
                            callback : function(response) {
                                assert.deepEqual(response[0],1);
                            }
                        });
                    },
                    callback : function(response) {
                        assert.deepEqual(response,msg);
                        pubnub.unsubscribe({channel : ch});
                        done();
                    }

                })
            })
            it('should publish json objects without error 5', function(done){
                var ch = channel + '-object-' + ++count;
                var msg = { 'message' : ch };
                pubnub.subscribe({channel : ch ,
                    connect : function(response) {
                        pubnub.publish({channel: ch , message : msg,
                            callback : function(response) {
                                assert.deepEqual(response[0],1);
                            }
                        });
                    },
                    callback : function(response) {
                        assert.deepEqual(response,msg);
                        pubnub.unsubscribe({channel : ch});
                        done();
                    }

                })
            })
	})
})
