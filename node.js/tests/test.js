var assert = require('assert');
var PUBNUB = require('../pubnub.js');

var pubnub = PUBNUB.init({
    publish_key     : 'demo',
    subscribe_key     : 'demo'
});

var pubnub_enc = PUBNUB({
    publish_key     : 'demo',
    subscribe_key   : 'demo',
    cipher_key      : 'enigma'
});

var channel = 'javascript-test-channel-' + Date.now();
var count = 0;

var message_string = "Hi from Javascript";
var message_jsono = {'message': 'Hi from Javascript'};
var message_jsona = ['message' , 'Hi from javascript'];

function in_list(list,str) {
    for (var x in list) {
        if (list[x] === str) return true;
    }
    return false;
 }
  function in_list_deep(list,str) {
    for (var x in list) {
        if (JSON.stringify(list[x]) === JSON.stringify(str)) return true;
    }
    return false;
 }


describe('Pubnub', function() {

    this.timeout(180000);

    describe('#subscribe()', function(){
        it('should pass plain text to callback on decryption error', function(done){
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
                    assert.deepEqual(response,message_string);
                    pubnub_enc.unsubscribe({channel : ch});
                    done();
                },
                error : function(response) {
                    assert.ok(false);
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
        it('should pass on plain text for messages which could not be decrypted when encryption is enabled', function(done) {
            this.timeout(40000);
            setTimeout(function() {
                pubnub_enc.history({channel : history_channel,
                    callback : function(response) {
                        assert.deepEqual(response[0].length, 6);
                        done();
                    },
                    error : function(response) {
                        assert.ok(false);
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
    describe('#where_now()', function() {
        var uuid = Date.now();
        var pubnub = PUBNUB.init({
            publish_key       : 'demo',
            subscribe_key     : 'demo',
            uuid              :  uuid,
            origin            : 'dara.devbuild.pubnub.com'
        });
        this.timeout(80000);
        it('should return channel x in result for uuid y, when uuid y subscribed to channel x', function(done){
            var ch = channel + '-' + 'where-now' ;
                pubnub.subscribe({
                    channel: ch ,
                    connect : function(response) {
                        setTimeout(function() {
                            pubnub.where_now({
                                uuid: uuid,
                                callback : function(data) {
                                    assert.deepEqual(data.status, 200);
                                    assert.ok(in_list(data.payload.channels,ch), "subscribed Channel should be there in where now list");
                                    pubnub.unsubscribe({channel : ch});
                                    done();
                                },
                                error : function(error) {
                                    assert.ok(false, "Error occurred in where_now");
                                    done();
                                }
                            })
                        }, 3000);
                    },
                    callback : function(response) {
                    },
                    error : function(error) {
                        assert.ok(false, "Error occurred in subscribe");
                    }

                })

        })
        it('should return channel a,b,c in result for uuid y, when uuid y subscribed to channel x', function(done){
            var ch1 = channel + '-' + 'where-now' + '-1' ;
            var ch2 = channel + '-' + 'where-now' + '-2' ;
            var ch3 = channel + '-' + 'where-now' + '-3' ;
            var where_now_set = false;
            pubnub.subscribe({
                channel: [ch1,ch2,ch3] ,
                connect : function(response) {
                    if (!where_now_set) {
                        setTimeout(function() {
                            pubnub.where_now( {
                                uuid: uuid,
                                callback : function(data) {
                                    assert.deepEqual(data.status, 200);
                                    assert.ok(in_list(data.payload.channels,ch1), "subscribed Channel 1 should be there in where now list");
                                    assert.ok(in_list(data.payload.channels,ch2), "subscribed Channel 2 should be there in where now list");
                                    assert.ok(in_list(data.payload.channels,ch3), "subscribed Channel 3 should be there in where now list");
                                    pubnub.unsubscribe({channel : ch1});
                                    pubnub.unsubscribe({channel : ch2});
                                    pubnub.unsubscribe({channel : ch3});
                                    done();
                                },
                                error : function(error) {
                                    assert.ok(false, "Error occurred in where_now " + JSON.stringify(error));
                                    done();
                                }
                            })
                        }, 3000);
                        where_now_set = true;
                    }
                },
                callback : function(response) {
                },
                error : function(error) {
                    assert.ok(false, "Error occurred in subscribe " + JSON.stringify(error));
                    done();
                }

            })

        })

    })



    describe('#subscriber.setstate()', function() {
        var uuid = Date.now();
        var pubnub = PUBNUB.init({
            publish_key       : 'demo',
            subscribe_key     : 'demo',
            uuid              :  uuid,
            origin            : 'dara.devbuild.pubnub.com'
        });
        this.timeout(80000);
        it('should be able to set metadata for uuid', function(done){
            var ch = channel + '-' + 'setstate' ;
            var uuid = pubnub.uuid();
            var metadata = { 'name' : 'name-' + uuid};
            pubnub.subscriber.setstate({
                channel  : ch ,
                uuid     : uuid,
                metadata : metadata,
                callback : function(response) {
                    assert.deepEqual(response.status, 200);
                    assert.deepEqual(response.payload,metadata);
                    pubnub.subscriber.getstate({
                        channel  : ch ,
                        uuid     : uuid,
                        callback : function(response) {
                            assert.deepEqual(response.status, 200);
                            assert.deepEqual(response.payload,metadata);
                            done();
                        },
                        error    : function(error) {
                            assert.ok(false, "Error occurred in subscriber.getstate " + JSON.stringify(error));
                            done();
                        }
                     });
                },
                error : function(error) {
                    assert.ok(false, "Error occurred in subscriber.setstate " + JSON.stringify(error));
                    done();
                }
            })
        })
        it('should be able to delete metadata for uuid', function(done){
            var ch = channel + '-' + 'setstate' ;
            var uuid = pubnub.uuid();
            var metadata = { 'name' : 'name-' + uuid, "age" : "50"};
            pubnub.subscriber.setstate({
                channel  : ch ,
                uuid     : uuid,
                metadata : metadata,
                callback : function(response) {
                    assert.deepEqual(response.status, 200);
                    assert.deepEqual(response.payload,metadata);
                    pubnub.subscriber.getstate({
                        channel  : ch ,
                        uuid     : uuid,
                        callback : function(response) {
                            assert.deepEqual(response.status, 200);
                            assert.deepEqual(response.payload,metadata);
                            delete metadata["age"];
                            pubnub.subscriber.setstate({
                                channel  : ch ,
                                uuid     : uuid,
                                metadata : { "age" : "null"},
                                callback : function(response) {
                                    assert.deepEqual(response.status, 200);
                                    assert.deepEqual(response.payload,metadata);
                                    pubnub.subscriber.getstate({
                                        channel  : ch ,
                                        uuid     : uuid,
                                        callback : function(response) {
                                            assert.deepEqual(response.status, 200);
                                            assert.deepEqual(response.payload,metadata);
                                            done();
                                        },
                                        error    : function(error) {
                                            assert.ok(false, "Error occurred in subscriber.getstate " + JSON.stringify(error));
                                            done();
                                        }
                                     });
                                },
                                error : function(error) {
                                    assert.ok(false, "Error occurred in subscriber.setstate " + JSON.stringify(error));
                                    done();
                                }
                            })
                        },
                        error    : function(error) {
                            assert.ok(false, "Error occurred in subscriber.getstate " + JSON.stringify(error));
                            done();
                        }
                     });
                },
                error : function(error) {
                    assert.ok(false, "Error occurred in subscriber.setstate " + JSON.stringify(error));
                    done();
                }
            })
        })
    }),
/*
    describe('#subscribe()', function(){
        var uuid  = Date.now()
        ,   uuid1 = uuid + '-1'
        ,   uuid2 = uuid + '-2'
        ,   uuid3 = uuid + '-3';

        var pubnub_pres = PUBNUB.init({
            origin            : 'dara.devbuild.pubnub.com',
            publish_key       : 'demo',
            subscribe_key     : 'demo',
            uuid              : uuid
        });
        it("should not generate spurious presence events when adding new channels to subscribe list", function() {
            var ch1 = channel + '-subscribe-' + Date.now();
            var ch2 = ch1 + '-2';
            var events_count = 0;
            pubnub_pres.subscribe({ channel : ch1,
                connect : function(response)  {
                    setTimeout(function(){
                        pubnub_pres.subscribe({
                            channel  : ch2,
                            connect  : function() {

                            },
                            callback : function(message) {
                                
                            },
                            error : function(error) {
                                assert.ok(false, "Error in subscribe 2")
                            },
                            presence : function(response) {
                                events_count++;
                                assert.deepEqual(response.action,"join");
                                assert.deepEqual(response.uuid, JSON.stringify(pubnub_pres.get_uuid()));
                                setTimeout(function(){
                                    asser.deepEqual(events_count,2);
                                    done();
                                }, 5000);
                            }
                        });
                    },5000);
                },
                presence : function(response) {
                    events_count++;
                    assert.deepEqual(response.action,"join");
                    assert.deepEqual(response.uuid + '', JSON.stringify(pubnub_pres.get_uuid()));
                },
                callback : function(response) {

                },
                error : function(response) {
                    assert.ok(false, "Error occurred in subscribe 1");
                    done();
                }
            });
        })
    }),
*/
    describe('#here_now()', function(){
        var uuid  = Date.now()
        ,   uuid1 = uuid + '-1'
        ,   uuid2 = uuid + '-2'
        ,   uuid3 = uuid + '-3';

        var pubnub_pres = PUBNUB.init({
            origin            : 'dara.devbuild.pubnub.com',
            publish_key       : 'demo',
            subscribe_key     : 'demo',
            uuid              : uuid
        });
        var pubnub_pres_1 = PUBNUB.init({
            origin            : 'dara.devbuild.pubnub.com',
            publish_key       : 'demo',
            subscribe_key     : 'demo',
            uuid              : uuid1
        });
        var pubnub_pres_2 = PUBNUB.init({
            origin            : 'dara.devbuild.pubnub.com',
            publish_key       : 'demo',
            subscribe_key     : 'demo',
            uuid              : uuid2
        });
        var pubnub_pres_3 = PUBNUB.init({
            origin            : 'dara.devbuild.pubnub.com',
            publish_key       : 'demo',
            subscribe_key     : 'demo',
            uuid              : uuid3
        });

        it("should return channel channel list with occupancy details and uuids for a subscribe key", function() {
            var ch = channel + '-' + 'here-now-' + Date.now();
            var ch1 = ch + '-1' ;
            var ch2 = ch + '-2' ;
            var ch3 = ch + '-3' ;

            pubnub_pres.subscribe({
                channel: ch ,
                connect : function(response) {
                    pubnub_pres_1.subscribe({
                        channel: ch1 ,
                        connect : function(response) {
                            pubnub_pres_2.subscribe({
                                channel: ch2 ,
                                connect : function(response) {
                                    pubnub_pres_3.subscribe({
                                        channel: ch3 ,
                                        connect : function(response) {
                                            setTimeout(function() {
                                                pubnub_pres.here_now({
                                                    callback : function(response) {
                                                        assert.deepEqual(response.status, 200);
                                                        assert.ok(response.payload.channels[ch], "subscribed channel should be present in payload");
                                                        assert.ok(response.payload.channels[ch1], "subscribed 1 channel should be present in payload");
                                                        assert.ok(response.payload.channels[ch2], "subscribed 2 channel should be present in payload");
                                                        assert.ok(response.payload.channels[ch3], "subscribed 3 channel should be present in payload");
                                                        assert.ok(in_list(response.payload.channels[ch].uuids, uuid), "uuid should be there in the uuids list");
                                                        assert.ok(in_list(response.payload.channels[ch1].uuids,uuid1), "uuid 1 should be there in the uuids list");
                                                        assert.ok(in_list(response.payload.channels[ch2].uuids,uuid2), "uuid 2 should be there in the uuids list");
                                                        assert.ok(in_list(response.payload.channels[ch3].uuids,uuid3), "uuid 3 should be there in the uuids list");
                                                        assert.deepEqual(response.payload.channels[ch].occupancy,1);
                                                        assert.deepEqual(response.payload.channels[ch1].occupancy,1);
                                                        assert.deepEqual(response.payload.channels[ch2].occupancy,1);
                                                        assert.deepEqual(response.payload.channels[ch3].occupancy,1);
                                                        pubnub_pres.unsubscribe({channel : ch});
                                                        pubnub_pres_1.unsubscribe({channel : ch1});
                                                        pubnub_pres_2.unsubscribe({channel : ch2});
                                                        pubnub_pres_3.unsubscribe({channel : ch3});
                                                        done();
                                                    },
                                                    error : function(error) {
                                                        assert.ok(false, "Error occurred in subscribe 3");
                                                        assert.done();
                                                    }
                                                });
                                            },3000);
                                        },
                                        callback : function(response) {
                                        },
                                        error : function(error) {
                                            assert.ok(false, "Error occurred in subscribe 3");
                                            assert.done();
                                        }
                                    })
                                },
                                callback : function(response) {
                                },
                                error : function(error) {
                                    assert.ok(false, "Error occurred in subscribe 2");
                                    assert.done();
                                }
                            })
                        },
                        callback : function(response) {
                        },
                        error : function(error) {
                            assert.ok(false, "Error occurred in subscribe 1");
                            assert.done();
                        }
                    })
                },
                callback : function(response) {
                },
                error : function(error) {
                    assert.ok(false, "Error occurred in subscribe");
                    assert.done();
                }
            })
        })

        it("should return channel channel list with occupancy details and uuids + metadata for a subscribe key", function() {

            var ch = channel + '-' + 'here-now-' + Date.now();
            var ch1 = ch + '-1' ;
            var ch2 = ch + '-2' ;
            var ch3 = ch + '-3' ;

            pubnub_pres.subscriber.setstate({
                channel : ch,
                uuid : uuid,
                metadata : {
                    name : 'name-' + uuid
                },
                callback : function(r) {
                    assert.deepEqual(r.status,200);
                },
                error : function(e) {
                    assert.ok(false,"Error in setstate")
                }
            });
            pubnub_pres_1.subscriber.setstate({
                channel : ch1,
                uuid : uuid1,
                metadata : {
                    name : 'name-' + uuid1
                },
                callback : function(r) {
                    assert.deepEqual(r.status,200);
                },
                error : function(e) {
                    assert.ok(false,"Error in setstate")
                }
            });
            pubnub_pres_2.subscriber.setstate({
                channel : ch2,
                uuid : uuid2,
                metadata : {
                    name : 'name-' + uuid2
                },
                callback : function(r) {
                    assert.deepEqual(r.status,200);
                },
                error : function(e) {
                    assert.ok(false,"Error in setstate")
                }
            });
            pubnub_pres_3.subscriber.setstate({
                channel : ch3,
                uuid : uuid3,
                metadata : {
                    name : 'name-' + uuid3
                },
                callback : function(r) {
                    assert.deepEqual(r.status,200);
                },
                error : function(e) {
                    assert.ok(false,"Error in setstate")
                }
            });

            setTimeout(function() {
                pubnub_pres.subscribe({
                    channel: ch ,
                    connect : function(response) {
                        pubnub_pres_1.subscribe({
                            channel: ch1 ,
                            connect : function(response) {
                                pubnub_pres_2.subscribe({
                                    channel: ch2 ,
                                    connect : function(response) {
                                        pubnub_pres_3.subscribe({
                                            channel: ch3 ,
                                            connect : function(response) {
                                                setTimeout(function() {
                                                    pubnub_pres.here_now({
                                                        metadata : true,
                                                        callback : function(response) {
                                                            assert.deepEqual(response.status, 200);
                                                            assert.ok(response.payload.channels[ch], "subscribed channel should be present in payload");
                                                            assert.ok(response.payload.channels[ch1], "subscribed 1 channel should be present in payload");
                                                            assert.ok(response.payload.channels[ch2], "subscribed 2 channel should be present in payload");
                                                            assert.ok(response.payload.channels[ch3], "subscribed 3 channel should be present in payload");
                                                            assert.ok(in_list_deep(response.payload.channels[ch].uuids, { uuid : uuid , metadata : { name : 'name-' + uuid } } ), "uuid should be there in the uuids list");
                                                            assert.ok(in_list_deep(response.payload.channels[ch1].uuids,{ uuid : uuid1 , metadata : {name : 'name-' + uuid1 }}), "uuid 1 should be there in the uuids list");
                                                            assert.ok(in_list_deep(response.payload.channels[ch2].uuids,{ uuid : uuid2 , metadata : {name : 'name-' + uuid2 }}), "uuid 2 should be there in the uuids list");
                                                            assert.ok(in_list_deep(response.payload.channels[ch3].uuids,{ uuid : uuid3 , metadata : {name : 'name-' + uuid3 }}), "uuid 3 should be there in the uuids list");
                                                            assert.deepEqual(response.payload.channels[ch].occupancy,1);
                                                            assert.deepEqual(response.payload.channels[ch1].occupancy,1);
                                                            assert.deepEqual(response.payload.channels[ch2].occupancy,1);
                                                            assert.deepEqual(response.payload.channels[ch3].occupancy,1);
                                                            pubnub_pres.unsubscribe({channel : ch});
                                                            pubnub_pres_1.unsubscribe({channel : ch1});
                                                            pubnub_pres_2.unsubscribe({channel : ch2});
                                                            pubnub_pres_3.unsubscribe({channel : ch3});
                                                            done();
                                                        },
                                                        error : function(error) {
                                                            assert.ok(false, "Error occurred in subscribe 3");
                                                            done();
                                                        }
                                                    });
                                                },3000);
                                            },
                                            callback : function(response) {
                                            },
                                            error : function(error) {
                                                assert.ok(false, "Error occurred in subscribe 3");
                                                done();
                                            }
                                        })
                                    },
                                    callback : function(response) {
                                    },
                                    error : function(error) {
                                        assert.ok(false, "Error occurred in subscribe 2");
                                        done();
                                    }
                                })
                            },
                            callback : function(response) {
                            },
                            error : function(error) {
                                assert.ok(false, "Error occurred in subscribe 1");
                                done();
                            }
                        })
                    },
                    callback : function(response) {
                    },
                    error : function(error) {
                        assert.ok(false, "Error occurred in subscribe");
                        done();
                    }
                })
            },5000);
        })
        it("should return correct metadata for uuid in different channels", function() {

            var ch = channel + '-' + 'here-now-' + Date.now();
            var ch1 = ch + '-1' ;
            var ch2 = ch + '-2' ;
            var ch3 = ch + '-3' ;

            pubnub_pres.subscriber.setstate({
                channel : ch,
                uuid : uuid,
                metadata : {
                    name : 'name-' + uuid
                },
                callback : function(r) {
                    assert.deepEqual(r.status,200);
                },
                error : function(e) {
                    assert.ok(false,"Error in setstate")
                }
            });
            pubnub_pres.subscriber.setstate({
                channel : ch1,
                uuid : uuid,
                metadata : {
                    name : 'name-' + uuid1
                },
                callback : function(r) {
                    assert.deepEqual(r.status,200);
                },
                error : function(e) {
                    assert.ok(false,"Error in setstate")
                }
            });
            pubnub_pres.subscriber.setstate({
                channel : ch2,
                uuid : uuid,
                metadata : {
                    name : 'name-' + uuid2
                },
                callback : function(r) {
                    assert.deepEqual(r.status,200);
                },
                error : function(e) {
                    assert.ok(false,"Error in setstate")
                }
            });
            pubnub_pres.subscriber.setstate({
                channel : ch3,
                uuid : uuid,
                metadata : {
                    name : 'name-' + uuid3
                },
                callback : function(r) {
                    assert.deepEqual(r.status,200);
                },
                error : function(e) {
                    assert.ok(false,"Error in setstate")
                }
            });

            setTimeout(function() {
                pubnub_pres.subscribe({
                    channel: ch ,
                    connect : function(response) {
                        pubnub_pres.subscribe({
                            channel: ch1 ,
                            connect : function(response) {
                                pubnub_pres.subscribe({
                                    channel: ch2 ,
                                    connect : function(response) {
                                        pubnub_pres.subscribe({
                                            channel: ch3 ,
                                            connect : function(response) {
                                                setTimeout(function() {
                                                    pubnub_pres.here_now({
                                                        metadata : true,
                                                        callback : function(response) {
                                                            assert.deepEqual(response.status, 200);
                                                            assert.ok(response.payload.channels[ch], "subscribed channel should be present in payload");
                                                            assert.ok(response.payload.channels[ch1], "subscribed 1 channel should be present in payload");
                                                            assert.ok(response.payload.channels[ch2], "subscribed 2 channel should be present in payload");
                                                            assert.ok(response.payload.channels[ch3], "subscribed 3 channel should be present in payload");
                                                            assert.ok(in_list_deep(response.payload.channels[ch].uuids, { uuid : uuid , metadata : { name : 'name-' + uuid } } ), "uuid should be there in the uuids list");
                                                            assert.ok(in_list_deep(response.payload.channels[ch1].uuids,{ uuid : uuid , metadata : {name : 'name-' + uuid1 }}), "uuid should be there in the uuids list");
                                                            assert.ok(in_list_deep(response.payload.channels[ch2].uuids,{ uuid : uuid , metadata : {name : 'name-' + uuid2 }}), "uuid should be there in the uuids list");
                                                            assert.ok(in_list_deep(response.payload.channels[ch3].uuids,{ uuid : uuid , metadata : {name : 'name-' + uuid3 }}), "uuid should be there in the uuids list");
                                                            assert.deepEqual(response.payload.channels[ch].occupancy,1);
                                                            assert.deepEqual(response.payload.channels[ch1].occupancy,1);
                                                            assert.deepEqual(response.payload.channels[ch2].occupancy,1);
                                                            assert.deepEqual(response.payload.channels[ch3].occupancy,1);
                                                            pubnub_pres.unsubscribe({channel : ch});
                                                            pubnub_pres.unsubscribe({channel : ch1});
                                                            pubnub_pres.unsubscribe({channel : ch2});
                                                            pubnub_pres.unsubscribe({channel : ch3});
                                                            done();
                                                        },
                                                        error : function(error) {
                                                            assert.ok(false, "Error occurred in subscribe 3");
                                                            done();
                                                        }
                                                    });
                                                },3000);
                                            },
                                            callback : function(response) {
                                            },
                                            error : function(error) {
                                                assert.ok(false, "Error occurred in subscribe 3");
                                                done();
                                            }
                                        })
                                    },
                                    callback : function(response) {
                                    },
                                    error : function(error) {
                                        assert.ok(false, "Error occurred in subscribe 2");
                                        done();
                                    }
                                })
                            },
                            callback : function(response) {
                            },
                            error : function(error) {
                                assert.ok(false, "Error occurred in subscribe 1");
                                done();
                            }
                        })
                    },
                    callback : function(response) {
                    },
                    error : function(error) {
                        assert.ok(false, "Error occurred in subscribe");
                        done();
                    }
                })
            },5000);
        })
        it("should return correct metadata for multiple uuids in single channel", function() {

            var ch = channel + '-' + 'here-now-' + Date.now();

            pubnub_pres.subscriber.setstate({
                channel : ch,
                uuid : uuid,
                metadata : {
                    name : 'name-' + uuid
                },
                callback : function(r) {
                    assert.deepEqual(r.status,200);
                },
                error : function(e) {
                    assert.ok(false,"Error in setstate")
                }
            });
            pubnub_pres.subscriber.setstate({
                channel : ch,
                uuid : uuid1,
                metadata : {
                    name : 'name-' + uuid1
                },
                callback : function(r) {
                    assert.deepEqual(r.status,200);
                },
                error : function(e) {
                    assert.ok(false,"Error in setstate")
                }
            });
            pubnub_pres.subscriber.setstate({
                channel : ch,
                uuid : uuid2,
                metadata : {
                    name : 'name-' + uuid2
                },
                callback : function(r) {
                    assert.deepEqual(r.status,200);
                },
                error : function(e) {
                    assert.ok(false,"Error in setstate")
                }
            });
            pubnub_pres.subscriber.setstate({
                channel : ch,
                uuid : uuid3,
                metadata : {
                    name : 'name-' + uuid3
                },
                callback : function(r) {
                    assert.deepEqual(r.status,200);
                },
                error : function(e) {
                    assert.ok(false,"Error in setstate")
                }
            });

            setTimeout(function() {
                pubnub_pres.subscribe({
                    channel: ch ,
                    connect : function(response) {
                        pubnub_pres_1.subscribe({
                            channel: ch ,
                            connect : function(response) {
                                pubnub_pres_2.subscribe({
                                    channel: ch ,
                                    connect : function(response) {
                                        pubnub_pres_3.subscribe({
                                            channel: ch ,
                                            connect : function(response) {
                                                setTimeout(function() {
                                                    pubnub_pres.here_now({
                                                        metadata : true,
                                                        callback : function(response) {
                                                            assert.deepEqual(response.status, 200);
                                                            assert.ok(response.payload.channels[ch], "subscribed channel should be present in payload"); 
                                                            assert.ok(in_list_deep(response.payload.channels[ch].uuids, { uuid : uuid , metadata : { name : 'name-' + uuid } } ), "uuid should be there in the uuids list");
                                                            assert.ok(in_list_deep(response.payload.channels[ch].uuids,{ uuid : uuid1 , metadata : {name : 'name-' + uuid1 }}), "uuid should be there in the uuids list");
                                                            assert.ok(in_list_deep(response.payload.channels[ch].uuids,{ uuid : uuid2 , metadata : {name : 'name-' + uuid2 }}), "uuid should be there in the uuids list");
                                                            assert.ok(in_list_deep(response.payload.channels[ch].uuids,{ uuid : uuid3 , metadata : {name : 'name-' + uuid3 }}), "uuid should be there in the uuids list");
                                                            assert.deepEqual(response.payload.channels[ch].occupancy,1);
                                                            pubnub_pres.unsubscribe({channel : ch});
                                                            pubnub_pres_1.unsubscribe({channel : ch});
                                                            pubnub_pres_2.unsubscribe({channel : ch});
                                                            pubnub_pres_3.unsubscribe({channel : ch});
                                                            done();
                                                        },
                                                        error : function(error) {
                                                            assert.ok(false, "Error occurred in subscribe 3");
                                                            done();
                                                        }
                                                    });
                                                },3000);
                                            },
                                            callback : function(response) {
                                            },
                                            error : function(error) {
                                                assert.ok(false, "Error occurred in subscribe 3");
                                                done();
                                            }
                                        })
                                    },
                                    callback : function(response) {
                                    },
                                    error : function(error) {
                                        assert.ok(false, "Error occurred in subscribe 2");
                                        done();
                                    }
                                })
                            },
                            callback : function(response) {
                            },
                            error : function(error) {
                                assert.ok(false, "Error occurred in subscribe 1");
                                done();
                            }
                        })
                    },
                    callback : function(response) {
                    },
                    error : function(error) {
                        assert.ok(false, "Error occurred in subscribe");
                        done();
                    }
                })
            },5000);
        })

    })
})
