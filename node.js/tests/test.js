var assert = require('assert');
var PUBNUB = require('../pubnub.js');

var pubnub = PUBNUB.init({
    publish_key     : 'demo',
    subscribe_key     : 'demo'
});

var channel = 'javascript-test-channel-' + Date.now();
var count = 0;

var message_string = 'Hi from Javascript';
var message_jsono = {'message': 'Hi Hi from Javascript'};
var message_jsona = ['message' , 'Hi Hi from javascript'];

describe('Pubnub', function() {

    this.timeout(60000);

    describe('#publish()', function(){
        it('should publish strings without error', function(done){
            var ch = channel + '-' + ++count;
            pubnub.subscribe({channel : ch ,
                connect : function(response) {
                    pubnub.publish({channel: ch , message : message_string,
                        callback : function(response) {
                            assert.deepEqual(response[0],1);
                        }
                    });
                },
                callback : function(response) {
                    assert.deepEqual(response,message_string);
                    pubnub.unsubscribe({channel : ch});
                    done();
                }

            })
        })
        it('should publish json objects without error', function(done){
            var ch = channel + '-' + ++count;
            pubnub.subscribe({channel : ch ,
                connect : function(response) {
                    pubnub.publish({channel: ch , message : message_jsono,
                        callback : function(response) {
                            assert.deepEqual(response[0],1);
                        }
                    });
                },
                callback : function(response) {
                    assert.deepEqual(response,message_jsono);
                    pubnub.unsubscribe({channel : ch});
                    done();
                }

            })
        })
        it('should publish json arrays without error', function(done){
            var ch = channel + '-' + ++count ;
            pubnub.subscribe({channel : ch ,
                connect : function(response) {
                    pubnub.publish({channel: ch , message : message_jsona,
                        callback : function(response) {
                            assert.deepEqual(response[0],1);
                        }
                    });
                },
                callback : function(response) {
                    assert.deepEqual(response,message_jsona);
                    pubnub.unsubscribe({channel : ch});
                    done();
                }

            })
        })
    })
    describe('#time()', function() {
        it('should return time successfully when called', function(done){
            pubnub.time(function(time) {
                assert.ok(time);
                done();
            })
        })

    })
    describe('#uuid()', function() {
        it('should return uuid successfully when called', function(done){
            pubnub.uuid(function(uuid) {
                assert.ok(uuid);
                done();
            })
        })

    })
    describe('#here_now()', function() {
        this.timeout(80000);
        it('should show occupancy 1 user if 1 user is subscribed to channel', function(done){
            var ch = channel + '-' + 'here-now' ;
                pubnub.subscribe({channel : ch ,
                    connect : function(response) {
                        setTimeout(function() {
                            pubnub.here_now( {channel : ch, callback : function(data) {
                                assert.deepEqual(data.occupancy, 1);
                                pubnub.unsubscribe({channel : ch});
                                done();
                            }})}, 10000
                        );
                        pubnub.publish({channel: ch , message : message_jsona,
                            callback : function(response) {
                                assert.deepEqual(response[0],1);
                            }
                        });
                    },
                    callback : function(response) {
                        assert.deepEqual(response,message_jsona);
                    }

                })

        })

    })

    describe('#grant()', function(){
        var grant_channel = channel + '-grant';
        var auth_key = "abcd";
        var pubnub = PUBNUB.init({
            origin            : 'uls-test.pubnub.co',
            publish_key       : 'pub-c-a2650a22-deb1-44f5-aa87-1517049411d5',
            subscribe_key     : 'sub-c-a478dd2a-c33d-11e2-883f-02ee2ddab7fe',
            secret_key        : 'sec-c-YjFmNzYzMGMtYmI3NC00NzJkLTlkYzYtY2MwMzI4YTJhNDVh'
        });

        it('should be able to grant read write access', function(done) {
            setTimeout(function() {
                pubnub.grant({
                    channel : grant_channel,
                    auth_key : auth_key,
                    read : true,
                    write : true,
                    callback : function(response) {
                        assert.deepEqual(response.status,200);
                        pubnub.audit({
                            channel : grant_channel,
                            auth_key : auth_key,
                            callback : function(response) {
                                assert.deepEqual(response.status,200);
                                assert.deepEqual(response.payload.auths.abcd.r,1);
                                assert.deepEqual(response.payload.auths.abcd.w,1);
                                done();
                            }
                        });

                    }
                })
            },5000);
        })
        it('should be able to grant read access revoke write access', function(done) {
            setTimeout(function() {
                pubnub.grant({
                    channel : grant_channel,
                    auth_key : auth_key,
                    read : true,
                    write : false,
                    callback : function(response) {
                        assert.deepEqual(response.status,200);
                        pubnub.audit({
                            channel : grant_channel,
                            auth_key : auth_key,
                            callback : function(response) {
                                assert.deepEqual(response.status,200);
                                assert.deepEqual(response.payload.auths.abcd.r,1);
                                assert.deepEqual(response.payload.auths.abcd.w,0);
                                done();
                            }
                        });

                    }
                })
            },5000);
        })
        it('should be able to revoke read access grant write access', function(done) {
            setTimeout(function() {
                pubnub.grant({
                    channel : grant_channel,
                    auth_key : auth_key,
                    read : false,
                    write : true,
                    callback : function(response) {
                        assert.deepEqual(response.status,200);
                        pubnub.audit({
                            channel : grant_channel,
                            auth_key : auth_key,
                            callback : function(response) {
                                assert.deepEqual(response.status,200);
                                assert.deepEqual(response.payload.auths.abcd.r,0);
                                assert.deepEqual(response.payload.auths.abcd.w,1);
                                done();
                            }
                        });

                    }
                })
            },5000);
        })
        it('should be able to revoke read and write access', function(done) {
            setTimeout(function() {
                pubnub.grant({
                    channel : grant_channel,
                    auth_key : auth_key,
                    read : false,
                    write : false,
                    callback : function(response) {
                        assert.deepEqual(response.status,200);
                        pubnub.audit({
                            channel : grant_channel,
                            auth_key : auth_key,
                            callback : function(response) {
                                assert.deepEqual(response.status,200);
                                assert.deepEqual(response.payload.auths.abcd.r,0);
                                assert.deepEqual(response.payload.auths.abcd.w,0);
                                done();
                            }
                        });

                    }
                })
            },5000);
        })

    })
    describe('#revoke()', function(){
        var revoke_channel = channel + '-revoke';
        var auth_key = "abcd";
        var pubnub = PUBNUB.init({
            origin            : 'uls-test.pubnub.co',
            publish_key       : 'pub-c-a2650a22-deb1-44f5-aa87-1517049411d5',
            subscribe_key     : 'sub-c-a478dd2a-c33d-11e2-883f-02ee2ddab7fe',
            secret_key        : 'sec-c-YjFmNzYzMGMtYmI3NC00NzJkLTlkYzYtY2MwMzI4YTJhNDVh'
        });


        it('should be able to revoke access', function(done) {
            setTimeout(function() {
                pubnub.revoke({
                    channel : revoke_channel,
                    auth_key : auth_key,
                    callback : function(response) {
                        assert.deepEqual(response.status,200);
                        pubnub.audit({
                            channel : revoke_channel,
                            auth_key : auth_key,
                            callback : function(response) {
                                assert.deepEqual(response.status,200);
                                assert.deepEqual(response.payload.auths.abcd.r,0);
                                assert.deepEqual(response.payload.auths.abcd.w,0);
                                done();
                            }
                        });

                    }
                })
            },5000);
        })

    })

})
