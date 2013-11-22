var assert = require('assert');
var PUBNUB = require('../pubnub.js');

var pubnub = PUBNUB.init({
    publish_key     : 'demo',
    subscribe_key     : 'demo'
});

var pubnub_enc = PUBNUB.secure({
    publish_key     : 'demo',
    subscribe_key   : 'demo',
    cipher_key      : 'enigma'
});

var channel = 'javascript-test-channel-' + Date.now();
var count = 0;

var message_string = "Hi from Javascript";
var message_jsono = {'message': 'Hi from Javascript'};
var message_jsona = ['message' , 'Hi from javascript'];

describe('Pubnub', function() {

    this.timeout(180000);

    describe('#subscribe()', function(){
        it('should call error callback on decryption error', function(done){
            var ch = channel + '-' + ++count;
            pubnub_enc.subscribe({channel : ch ,
                connect : function(response) {
                    pubnub.publish({channel: ch , message : message_string,
                        callback : function(response) {
                            assert.deepEqual(response[0],1);
                        }
                    });
                },
                callback : function(response) {
                    assert.ok(false);
                    pubnub_enc.unsubscribe({channel : ch});
                    done();
                },
                error : function(response) {
                    assert.deepEqual(response['error'],"DECRYPT_ERROR");
                    pubnub_enc.unsubscribe({channel : ch});
                    done();
                }

            })
        })
    })

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
        it('should publish strings without error when encryption is enabled', function(done){
            var ch = channel + '-' + ++count;
            pubnub_enc.subscribe({channel : ch ,
                connect : function(response) {
                    pubnub_enc.publish({channel: ch , message : message_string,
                        callback : function(response) {
                            assert.deepEqual(response[0],1);
                        }
                    });
                },
                callback : function(response) {
                    assert.deepEqual(response,message_string);
                    pubnub_enc.unsubscribe({channel : ch});
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
        it('should publish json objects without error when encryption is enabled', function(done){
            var ch = channel + '-' + ++count;
            pubnub_enc.subscribe({channel : ch ,
                connect : function(response) {
                    pubnub_enc.publish({channel: ch , message : message_jsono,
                        callback : function(response) {
                            assert.deepEqual(response[0],1);
                        }
                    });
                },
                callback : function(response) {
                    assert.deepEqual(response,message_jsono);
                    pubnub_enc.unsubscribe({channel : ch});
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
        it('should publish json arrays without error when encryption is enabled', function(done){
            var ch = channel + '-' + ++count ;
            pubnub_enc.subscribe({channel : ch ,
                connect : function(response) {
                    pubnub_enc.publish({channel: ch , message : message_jsona,
                        callback : function(response) {
                            assert.deepEqual(response[0],1);
                        }
                    });
                },
                callback : function(response) {
                    assert.deepEqual(response,message_jsona);
                    pubnub_enc.unsubscribe({channel : ch});
                    done();
                }

            })
        })
    })

    describe('#history()', function(){
        var history_channel = channel + '-history';

        before(function(done){
            this.timeout(40000);
            var x;
            pubnub.publish({channel: history_channel,
                message : message_string + '-1',
                callback : function(response){
                    assert.deepEqual(response[0], 1);
                    pubnub.publish({channel: history_channel,
                        message : message_string + '-2',
                        callback : function(response){
                            assert.deepEqual(response[0], 1);
                            pubnub_enc.publish({channel: history_channel,
                                message : message_string + '-1',
                                callback : function(response){
                                    assert.deepEqual(response[0], 1);
                                    pubnub_enc.publish({channel: history_channel,
                                        message : message_string + '-2',
                                        callback : function(response){
                                            assert.deepEqual(response[0], 1);
                                            pubnub.publish({channel: history_channel,
                                            message : message_string + '-1',
                                                callback : function(response){
                                                    assert.deepEqual(response[0], 1);
                                                    pubnub.publish({channel: history_channel,
                                                        message : message_string + '-2',
                                                        callback : function(response){
                                                            assert.deepEqual(response[0], 1);
                                                            done();
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });

        })

        it('should return 6 messages when 6 messages were published on channel', function(done) {
            this.timeout(40000);
            setTimeout(function() {
                pubnub.history({channel : history_channel,
                    callback : function(response) {
                        assert.deepEqual(response[0].length, 6);
                        assert.deepEqual(response[0][0], message_string + '-1');
                        assert.deepEqual(response[0][5], message_string + '-2');
                        done();
                    }
                })
            },5000);
        })
        it('should return 1 message when 6 messages were published on channel and count is 1', function(done) {
            this.timeout(40000);
            setTimeout(function() {
                pubnub.history({channel : history_channel,
                    count : 1,
                    callback : function(response) {
                        assert.deepEqual(response[0].length, 1);
                        assert.deepEqual(response[0][0], message_string + '-2');
                        done();
                    }
                })
            },5000);
        })
        it('should return 1 message from reverse when 6 messages were published on channel and count is 1', function(done) {
            this.timeout(40000);
            setTimeout(function() {
                pubnub.history({channel : history_channel,
                    count : 1,
                    reverse : true,
                    callback : function(response) {
                        assert.deepEqual(response[0].length, 1);
                        assert.deepEqual(response[0][0], message_string + '-1');
                        done();
                    }
                })
            },5000);
        })
        it('should call error callbacks for messages which could not be decrypted when encryption is enabled', function(done) {
            this.timeout(40000);
            setTimeout(function() {
                pubnub_enc.history({channel : history_channel,
                    callback : function(response) {
                        assert.deepEqual(response[0].length, 2);
                    },
                    error : function(response) {
                        assert.deepEqual(response[0].length, 4);
                        done();
                    }
                })
            },5000);
        })
    })
    describe('#history() with encryption', function(){
        var history_channel = channel + '-history-enc';

        before(function(done){
            this.timeout(40000);
            var x;
            pubnub_enc.publish({channel: history_channel,
                message : message_string + '-1',
                callback : function(response){
                    assert.deepEqual(response[0], 1);
                    pubnub_enc.publish({channel: history_channel,
                        message : message_string + '-2',
                        callback : function(response){
                            assert.deepEqual(response[0], 1);
                            done();
                        }
                    });
                }
            });

        })
        it('should return 2 messages when 2 messages were published on channel', function(done) {
            this.timeout(40000);
            setTimeout(function() {
                pubnub_enc.history({channel : history_channel,
                    callback : function(response) {
                        assert.deepEqual(response[0].length, 2);
                        assert.deepEqual(response[0][0], message_string + '-1');
                        assert.deepEqual(response[0][1], message_string + '-2');
                        done();
                    }
                })
            },5000);
        })
        it('should return 1 message when 2 messages were published on channel and count is 1', function(done) {
            this.timeout(40000);
            setTimeout(function() {
                pubnub_enc.history({channel : history_channel,
                    count : 1,
                    callback : function(response) {
                        assert.deepEqual(response[0].length, 1);
                        assert.deepEqual(response[0][0], message_string + '-2');
                        done();
                    }
                })
            },5000);
        })
        it('should return 1 message from reverse when 2 messages were published on channel and count is 1', function(done) {
            this.timeout(40000);
            setTimeout(function() {
                pubnub_enc.history({channel : history_channel,
                    count : 1,
                    reverse : true,
                    callback : function(response) {
                        assert.deepEqual(response[0].length, 1);
                        assert.deepEqual(response[0][0], message_string + '-1');
                        done();
                    }
                })
            },5000);
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
        var sub_key = 'sub-c-a478dd2a-c33d-11e2-883f-02ee2ddab7fe';
        var pubnub = PUBNUB.init({
            origin            : 'pam-beta.pubnub.com',
            publish_key       : 'pub-c-a2650a22-deb1-44f5-aa87-1517049411d5',
            subscribe_key     : sub_key,
            secret_key        : 'sec-c-YjFmNzYzMGMtYmI3NC00NzJkLTlkYzYtY2MwMzI4YTJhNDVh'
        });

        it('should be able to grant read write access', function(done) {
            var grant_channel_local = grant_channel + Date.now();
            setTimeout(function() {
                pubnub.grant({
                    channel : grant_channel_local,
                    auth_key : auth_key,
                    read : true,
                    write : true,
                    callback : function(response) {
                        assert.deepEqual(response.status,200);
                        pubnub.audit({
                            channel : grant_channel_local,
                            auth_key : auth_key,
                            callback : function(response) {
                                assert.deepEqual(response.status,200);
                                assert.deepEqual(response.payload.auths.abcd.r,1);
                                assert.deepEqual(response.payload.auths.abcd.w,1);
                                pubnub.history({
                                    'channel'  : grant_channel_local,
                                    'auth_key' : auth_key,
                                    'callback' : function(response) {
                                        assert.ok(true);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'auth_key' : auth_key,
                                            'message' : 'Test',
                                            'callback': function(response) {
                                                assert.ok(true);
                                                done();
                                            },
                                            'error'   : function(response) {
                                                assert.ok(false);
                                            }
                                        })
                                    },
                                    'error' : function(response) {
                                        assert.ok(false);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'message' : 'Test',
                                            'auth_key' : auth_key,
                                            'callback': function(response) {
                                                assert.ok(true);
                                                done();
                                            },
                                            'error'   : function(response) {
                                                assert.ok(false);
                                                done();
                                            }
                                        })
                                    }

                                });
                            }
                        });

                    }
                })
            },5000);
        })
        it('should be able to grant read write access with space in auth key and channel', function(done) {
            var auth_key = "ab cd";
            var grant_channel_local = grant_channel + "   " + Date.now();
            setTimeout(function() {
                pubnub.grant({
                    channel : grant_channel_local,
                    auth_key : auth_key,
                    read : true,
                    write : true,
                    callback : function(response) {
                        assert.deepEqual(response.status,200);
                        pubnub.audit({
                            channel : grant_channel_local,
                            auth_key : auth_key,
                            callback : function(response) {
                                assert.deepEqual(response.status,200);
                                assert.deepEqual(response.payload.auths[auth_key].r,1);
                                assert.deepEqual(response.payload.auths[auth_key].w,1);
                                pubnub.history({
                                    'channel'  : grant_channel_local,
                                    'auth_key' : auth_key,
                                    'callback' : function(response) {
                                        assert.ok(true);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'auth_key' : auth_key,
                                            'message' : 'Test',
                                            'callback': function(response) {
                                                assert.ok(true);
                                                done();
                                            },
                                            'error'   : function(response) {
                                                assert.ok(false);
                                            }
                                        })
                                    },
                                    'error' : function(response) {
                                        assert.ok(false);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'message' : 'Test',
                                            'auth_key' : auth_key,
                                            'callback': function(response) {
                                                assert.ok(true);
                                                done();
                                            },
                                            'error'   : function(response) {
                                                assert.ok(false);
                                                done();
                                            }
                                        })
                                    }

                                });
                            }
                        });

                    }
                })
            },5000);
        })


        it('should be able to grant read write access without auth key', function(done) {
            var grant_channel_local = grant_channel + Date.now();
            setTimeout(function() {
                pubnub.grant({
                    channel : grant_channel_local,
                    read : true,
                    write : true,
                    callback : function(response) {
                        assert.deepEqual(response.status,200);
                        pubnub.audit({
                            channel : grant_channel_local,
                            callback : function(response) {
                                assert.deepEqual(response.status,200);
                                assert.deepEqual(response.payload.channels[grant_channel_local].r,1);
                                assert.deepEqual(response.payload.channels[grant_channel_local].w,1);
                                assert.deepEqual(response.payload.subscribe_key,sub_key);
                                pubnub.history({
                                    'channel'  : grant_channel_local,
                                    'auth_key' : "",
                                    'callback' : function(response) {
                                        assert.ok(true);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'auth_key' : "",
                                            'message' : 'Test',
                                            'callback': function(response) {
                                                assert.ok(true);
                                                done();
                                            },
                                            'error'   : function(response) {
                                                assert.ok(false);
                                            }
                                        })
                                    },
                                    'error' : function(response) {
                                        assert.ok(false);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'message' : 'Test',
                                            'auth_key' : "",
                                            'callback': function(response) {
                                                assert.ok(true);
                                                done();
                                            },
                                            'error'   : function(response) {
                                                assert.ok(false);
                                                done();
                                            }
                                        })
                                    }

                                });
                            }
                        });

                    }
                })
            },5000);
        })

        it('should be able to grant read access revoke write access', function(done) {
            var grant_channel_local = grant_channel + Date.now();
            setTimeout(function() {
                pubnub.grant({
                    channel : grant_channel_local,
                    auth_key : auth_key,
                    read : true,
                    write : false,
                    callback : function(response) {
                        assert.deepEqual(response.status,200);
                        pubnub.audit({
                            channel : grant_channel_local,
                            auth_key : auth_key,
                            callback : function(response) {
                                assert.deepEqual(response.status,200);
                                assert.deepEqual(response.payload.auths.abcd.r,1);
                                assert.deepEqual(response.payload.auths.abcd.w,0);
                                pubnub.history({
                                    'channel'  : grant_channel_local,
                                    'auth_key' : auth_key,
                                    'callback' : function(response) {
                                        assert.ok(true)
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'auth_key' : auth_key,
                                            'message' : 'Test',
                                            'callback': function(response) {
                                                assert.ok(false);
                                                done();
                                            },
                                            'error'   : function(response) {
                                                assert.ok(true);
                                                assert.deepEqual(response.status, 403);
                                                done();
                                            }
                                        })
                                    },
                                    'error' : function(response) {
                                        assert.ok(false);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'message' : 'Test',
                                            'auth_key' : auth_key,
                                            'callback': function(response) {
                                                assert.ok(false);
                                                done();
                                            },
                                            'error'   : function(response) {
                                                assert.ok(true);
                                                assert.deepEqual(response.status, 403);
                                                done();
                                            }
                                        })
                                    }

                                });

                            }
                        });

                    }
                })
            },5000);
        })
        it('should be able to revoke read access grant write access', function(done) {
            var grant_channel_local = grant_channel + Date.now();
            setTimeout(function() {
                pubnub.grant({
                    channel : grant_channel_local,
                    auth_key : auth_key,
                    read : false,
                    write : true,
                    callback : function(response) {
                        assert.deepEqual(response.status,200);
                        pubnub.audit({
                            channel : grant_channel_local,
                            auth_key : auth_key,
                            callback : function(response) {
                                assert.deepEqual(response.status,200);
                                assert.deepEqual(response.payload.auths.abcd.r,0);
                                assert.deepEqual(response.payload.auths.abcd.w,1);
                                pubnub.history({
                                    'channel'  : grant_channel_local,
                                    'auth_key' : auth_key,
                                    'callback' : function(response) {
                                        assert.ok(false);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'auth_key' : auth_key,
                                            'message' : 'Test',
                                            'callback': function(response) {
                                                assert.ok(true);
                                                done();
                                            },
                                            'error'   : function(response) {
                                                assert.ok(false);
                                                done()
                                            }
                                        })
                                    },
                                    'error' : function(response) {
                                        assert.ok(true);
                                        assert.deepEqual(response.status, 403);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'message' : 'Test',
                                            'auth_key' : auth_key,
                                            'callback': function(response) {
                                                assert.ok(true)
                                                done();
                                            },
                                            'error'   : function(response) {
                                                assert.ok(false);
                                                done();
                                            }
                                        })
                                    }

                                });

                            }
                        });

                    }
                })
            },5000);
        })
        it('should be able to revoke read and write access', function(done) {
            var grant_channel_local = grant_channel + Date.now();
            setTimeout(function() {
                pubnub.grant({
                    channel : grant_channel_local,
                    auth_key : auth_key,
                    read : false,
                    write : false,
                    callback : function(response) {
                        assert.deepEqual(response.status,200);
                        pubnub.audit({
                            channel : grant_channel_local,
                            auth_key : auth_key,
                            callback : function(response) {
                                assert.deepEqual(response.status,200);
                                assert.deepEqual(response.payload.auths.abcd.r,0);
                                assert.deepEqual(response.payload.auths.abcd.w,0);
                                pubnub.history({
                                    'channel'  : grant_channel_local,
                                    'auth_key' : auth_key,
                                    'callback' : function(response) {
                                        assert.ok(false);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'auth_key' : auth_key,
                                            'message' : 'Test',
                                            'callback': function(response) {
                                                assert.ok(false);
                                                done();
                                            },
                                            'error'   : function(response) {
                                                assert.ok(true);
                                                assert.deepEqual(response.status, 403);
                                                done();
                                            }
                                        })
                                    },
                                    'error' : function(response) {
                                        assert.ok(true);
                                        assert.deepEqual(response.status, 403);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'message' : 'Test',
                                            'auth_key' : auth_key,
                                            'callback': function(response) {
                                                assert.ok(false);
                                                done();
                                            },
                                            'error'   : function(response) {
                                                assert.ok(true);
                                                assert.deepEqual(response.status, 403);
                                                done();
                                            }
                                        })
                                    }

                                });

                            }
                        });

                    }
                })
            },5000);
        })
        it('should be able to revoke read and write access without auth key', function(done) {
            var grant_channel_local = grant_channel + Date.now();
            setTimeout(function() {
                pubnub.grant({
                    channel : grant_channel_local,
                    read : false,
                    write : false,
                    callback : function(response) {
                        assert.deepEqual(response.status,200);
                        pubnub.audit({
                            channel : grant_channel_local,
                            callback : function(response) {
                                assert.deepEqual(response.status,200);
                                assert.deepEqual(response.payload.channels[grant_channel_local].r,0);
                                assert.deepEqual(response.payload.channels[grant_channel_local].w,0);
                                assert.deepEqual(response.payload.subscribe_key,sub_key);
                                pubnub.history({
                                    'channel'  : grant_channel_local,
                                    'auth_key' : "",
                                    'callback' : function(response) {
                                        assert.ok(false);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'auth_key' : "",
                                            'message' : 'Test',
                                            'callback': function(response) {
                                                assert.ok(false);
                                                done();
                                            },
                                            'error'   : function(response) {
                                                assert.ok(true);
                                                assert.deepEqual(response.status, 403);
                                                done();
                                            }
                                        })
                                    },
                                    'error' : function(response) {
                                        assert.ok(true);
                                        assert.deepEqual(response.status, 403);
                                        pubnub.publish({
                                            'channel' : grant_channel_local,
                                            'message' : 'Test',
                                            'auth_key' : "",
                                            'callback': function(response) {
                                                assert.ok(false);
                                                done();
                                            },
                                            'error'   : function(response) {
                                                assert.ok(true);
                                                assert.deepEqual(response.status, 403);
                                                done();
                                            }
                                        })
                                    }

                                });

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
            origin            : 'pam-beta.pubnub.com',
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
                                pubnub.history({
                                    'channel'  : revoke_channel,
                                    'auth_key' : auth_key,
                                    'callback' : function(response) {
                                        assert.ok(false);
                                        pubnub.publish({
                                            'channel' : revoke_channel,
                                            'auth_key' : auth_key,
                                            'message' : 'Test',
                                            'callback': function(response) {
                                                assert.ok(false);
                                                done();
                                            },
                                            'error'   : function(response) {
                                                assert.ok(true);
                                                assert.deepEqual(response.status, 403);
                                                done();
                                            }
                                        })
                                    },
                                    'error' : function(response) {
                                        assert.ok(true)
                                        assert.deepEqual(response.status, 403);
                                        pubnub.publish({
                                            'channel' : revoke_channel,
                                            'message' : 'Test',
                                            'auth_key' : auth_key,
                                            'callback': function(response) {
                                                assert.ok(false);
                                                done();
                                            },
                                            'error'   : function(response) {
                                                assert.ok(true);
                                                assert.deepEqual(response.status, 403);
                                                done();
                                            }
                                        })
                                    }

                                });

                            }
                        });

                    }
                })
            },5000);
        })

    })

})
