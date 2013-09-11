var pubnub = PUBNUB.init({
    publish_key   : 'demo',
    subscribe_key : 'demo'
});

var pubnub_enc = PUBNUB.secure({
    publish_key: "demo",
    subscribe_key: "demo",
    cipher_key: "enigma"
});

var channel = 'javascript-test-channel-' + Math.random();
var count = 0;

var message_string = 'Hi from Javascript';
var message_jsono = {'message': 'Hi Hi from Javascript'};
var message_jsona = ['message' , 'Hi Hi from javascript'];

test("uuid() response", function() {
    expect(1);
    stop(1);
    pubnub.uuid(function(uuid){
            ok(uuid, "Pass");
            start();
    });
});

test("uuid() response should be long enough", function() {
    expect(1);
    stop(1);
    pubnub.uuid(function(uuid){
        ok(uuid.length > 10, "Pass");
        start();
    });
});

test("publish() should publish strings without error", function() {
    expect(2);
    stop(2);
    var ch = channel + '-' + ++count;
    pubnub.subscribe({ channel : ch,
        connect : function(response)  {
            pubnub.publish({channel: ch, message: message_string,
                callback : function(response) {
                    equal(response[0],1);
                    start();
                }
            });
        },
        callback : function(response) {
            deepEqual(response, message_string);
            pubnub.unsubscribe({channel : ch});
            start();
        }
    });
});
test("subscribe() should invoke error callback on decryption error", function() {
    expect(3);
    stop(2);
    var ch = channel + '-' + ++count;
    pubnub_enc.subscribe({ channel : ch,
        connect : function(response)  {
            pubnub.publish({channel: ch, message: message_string,
                callback : function(response) {
                    equal(response[0],1);
                    start();
                }
            });
        },
        callback : function(response) {
            assert.ok(false);
            pubnub.unsubscribe({channel : ch});
            start();
        },
        error : function(response) {
            deepEqual(response['message'], message_string);
            deepEqual(response['error'], "DECRYPT_ERROR");
            pubnub.unsubscribe({channel : ch});
            start();
        }
    });
});

test("publish() should publish json array without error", function() {
    expect(2);
    stop(2);
    var ch = channel + '-' + ++count;
    pubnub.subscribe({ channel : ch,
        connect : function(response)  {
            pubnub.publish({channel: ch, message: message_jsona,
                callback : function(response) {
                    equal(response[0],1);
                    start();
                }
            });
        },
        callback : function(response) {
            deepEqual(response, message_jsona);
            pubnub.unsubscribe({channel : ch});
            start();
        }
    });
});

test("publish() should publish json object without error", function() {
    expect(2);
    stop(2);
    var ch = channel + '-' + ++count;
    pubnub.subscribe({ channel : ch,
        connect : function(response)  {
            pubnub.publish({channel: ch, message: message_jsono,
                callback : function(response) {
                    equal(response[0],1);
                    start();
                }
            });
        },
        callback : function(response) {
            deepEqual(response, message_jsono);
            pubnub.unsubscribe({channel : ch});
            start();
        }
    });
});


asyncTest("#here_now() should show occupancy 1 when 1 user subscribed to channel", function() {
    expect(3);
    var ch = channel + '-' + 'here-now' ;
    pubnub.subscribe({channel : ch ,
        connect : function(response) {
            setTimeout(function() {
                pubnub.here_now( {channel : ch, callback : function(data) {
                    equal(data.occupancy, 1);
                    start();
                    pubnub.unsubscribe({channel : ch});
                }})}, 10000
            );
            pubnub.publish({channel: ch , message : message_jsona,
                callback : function(response) {
                    equal(response[0],1);
                }
            });
        },
        callback : function(response) {
            deepEqual(response, message_jsona);

        }
    });
});


asyncTest('#history() should return 1 messages when 2 messages were published on channel but count is 1', function() {
    var history_channel = channel + '-history-1';
    expect(3);
    pubnub.publish({channel: history_channel,
        message : message_string,
        callback : function(response){
            equal(response[0],1);
            pubnub.publish({channel: history_channel,
                message : message_string,
                callback : function(response){
                    equal(response[0],1);
                    setTimeout(function() {
                        pubnub.history({channel : history_channel,
                            count : 1,
                            callback : function(response) {
                                equal(response[0].length, 1);
                                start();
                            }
                        });
                    }, 5000);
                }
            });
        }
    });
})
asyncTest('#history() should return 2 messages when 2 messages were published on channel', function() {
    var history_channel = channel + '-history-2';
    expect(3);
    pubnub.publish({channel: history_channel,
        message : message_string,
        callback : function(response){
            equal(response[0],1);
            pubnub.publish({channel: history_channel,
                message : message_string,
                callback : function(response){
                    equal(response[0],1);
                    setTimeout(function() {
                        pubnub.history({channel : history_channel,
                            callback : function(response) {
                                equal(response[0].length, 2);
                                start();
                            }
                        });
                    }, 5000);
                }
            });
        }
    });
})
asyncTest('#history() should call error callback for decryption failure messages', function() {
    var history_channel = channel + '-history-3';
    expect(7);
    pubnub.publish({channel: history_channel,
        message : message_string,
        callback : function(response){
            equal(response[0],1);
            pubnub_enc.publish({channel: history_channel,
                message : message_string,
                callback : function(response){
                    equal(response[0],1);
                    setTimeout(function() {
                        pubnub_enc.history({channel : history_channel,
                            callback : function(response) {
                                equal(response[0].length, 1);
                                equal(response[0][0], message_string);
                                start();
                            },
                            error : function(response) {
                                equal(response[0].length, 1);
                                equal(response[0][0]['message'], message_string);
                                equal(response[0][0]['error'], "DECRYPT_ERROR");
                                start();
                            }
                        });
                    }, 5000);
                }
            });
        }
    });
})
/*
test('connection restore feature', function() {
    var restore_channel = channel + '-restore-channel';
    expect(2);
    stop(2);

    pubnub.subscribe({
        restore: true,
        channel: restore_channel,
        callback: function () {
        },
        connect: function () {
            pubnub.unsubscribe({ channel: restore_channel });

            // Send Message While Not Connected
            pubnub.publish({
                channel: restore_channel,
                message: 'test',
                callback: function (response) {
                    equal(response[0],1);
                    start();
                    pubnub.subscribe({
                        restore: true,
                        channel: restore_channel,
                        callback: function (message, stack) {
                            pubnub.unsubscribe({ channel: restore_channel });
                            equal(message, "test");
                            start();
                        }
                    });
                }
            });
        }
    });
})
*/

asyncTest('Encryption tests', function() {
    var aes = PUBNUB.secure({
        publish_key: "demo",
        subscribe_key: "demo",
        cipher_key: "enigma"
    });
    expect(16);
    var test_plain_string_1 = "Pubnub Messaging API 1";
    var test_plain_string_2 = "Pubnub Messaging API 2";
    var test_plain_object_1 = {"foo": {"bar": "foobar"}};
    var test_plain_object_2 = {"this stuff": {"can get": "complicated!"}};
    var test_plain_unicode_1 = '漢語'
    var test_cipher_string_1 = "f42pIQcWZ9zbTbH8cyLwByD/GsviOE0vcREIEVPARR0=";
    var test_cipher_string_2 = "f42pIQcWZ9zbTbH8cyLwB/tdvRxjFLOYcBNMVKeHS54=";
    var test_cipher_object_1 = "GsvkCYZoYylL5a7/DKhysDjNbwn+BtBtHj2CvzC4Y4g=";
    var test_cipher_object_2 = "zMqH/RTPlC8yrAZ2UhpEgLKUVzkMI2cikiaVg30AyUu7B6J0FLqCazRzDOmrsFsF";
    var test_cipher_unicode_1 = "WvztVJ5SPNOcwrKsDrGlWQ==";

    ok(aes.raw_encrypt(test_plain_string_1) == test_cipher_string_1, "AES String Encryption Test 1");
    ok(aes.raw_encrypt(test_plain_string_2) == test_cipher_string_2, "AES String Encryption Test 2");
    ok(aes.raw_encrypt(test_plain_object_1) == test_cipher_object_1, "AES Object Encryption Test 1");
    ok(aes.raw_encrypt(test_plain_object_2) == test_cipher_object_2, "AES Object Encryption Test 2");
    //ok(aes.raw_encrypt(test_plain_unicode_1) == test_cipher_unicode_1, "AES Unicode Encryption Test 1");
    ok(aes.raw_decrypt(test_cipher_string_1) == test_plain_string_1, "AES String Decryption Test 1");
    ok(aes.raw_decrypt(test_cipher_string_2) == test_plain_string_2, "AES String Decryption Test 2");
    ok(JSON.stringify(aes.raw_decrypt(test_cipher_object_1)) == JSON.stringify(test_plain_object_1), "AES Object Decryption Test 1");
    ok(JSON.stringify(aes.raw_decrypt(test_cipher_object_2)) == JSON.stringify(test_plain_object_2), "AES Object Decryption Test 2");
    ok(aes.raw_decrypt(test_cipher_unicode_1) == test_plain_unicode_1, "AES Unicode Decryption Test 1");

    aes_channel = channel + "aes-channel";
    aes.subscribe({
        channel: aes_channel,
        connect: function() {
            setTimeout(function() {
                aes.publish({
                    channel: aes_channel,
                    message: { test: "test" },
                    callback: function (response) {
                        ok(response[0], 'AES Successful Publish ' + response[0]);
                        ok(response[1], 'AES Success With Demo ' + response[1]);
                        setTimeout(function() {
                            aes.history({
                                limit: 1,
                                reverse: false,
                                channel: aes_channel,
                                callback: function (data) {
                                    ok(data, 'AES History Response');
                                    ok(data[0][0].test === "test", 'AES History Content');
                                    start();
                                }
                            });
                        }, 9000);
                    }
                });
            }, 3000);
        },
        /*
        presence: function (message, envelope, aes_channel) {

        },
        */
        callback: function (message, envelope, aes_channel) {
            ok(message, 'AES Subscribe Message');
            ok(message.test === "test", 'AES Subscribe Message Data');
            ok(envelope[1], 'AES TimeToken Returned: ' + envelope[1]);
        }
    });
})

var grant_channel = channel + '-grant';
var auth_key = "abcd";
var sub_key = 'sub-c-a478dd2a-c33d-11e2-883f-02ee2ddab7fe';
var pubnub_pam = PUBNUB.init({
    origin            : 'pam-beta.pubnub.com',
    publish_key       : 'pub-c-a2650a22-deb1-44f5-aa87-1517049411d5',
    subscribe_key     : 'sub-c-a478dd2a-c33d-11e2-883f-02ee2ddab7fe',
    secret_key        : 'sec-c-YjFmNzYzMGMtYmI3NC00NzJkLTlkYzYtY2MwMzI4YTJhNDVh'
});
test("#grant() should be able to grant read write access", function(done) {
    var grant_channel_1 = grant_channel + '-1';
    expect(6);
    stop(3);
    setTimeout(function() {
        pubnub_pam.grant({
            channel : grant_channel_1,
            auth_key : auth_key,
            read : true,
            write : true,
            ttl : 100,
            callback : function(response) {
                ok(response.status === 200, 'Grant Response');
                pubnub_pam.audit({
                    channel : grant_channel_1,
                    auth_key : auth_key,
                    callback : function(response) {
                        ok(response.status === 200, 'Grant Audit Response');
                        ok(response.payload.auths.abcd.r === 1, 'Grant Audit Read should be 1');
                        ok(response.payload.auths.abcd.w === 1, 'Grant Audit Write shoudld be 1');
                        pubnub_pam.history({
                            'channel'  : grant_channel_1,
                            'auth_key' : auth_key,
                            'callback' : function(response) {
                                ok(true, "Success Callback");
                                pubnub_pam.publish({
                                    'channel' : grant_channel_1,
                                    'auth_key' : auth_key,
                                    'message' : 'Node Test',
                                    'callback': function(response) {
                                        ok(true, "Success callback" );
                                        start();
                                    },
                                    'error'   : function(response) {
                                        ok(false, "Error should not occur if permission granted")
                                        start();
                                    }
                                })
                                start();
                            },
                            'error' : function(response) {
                                console.log(response);
                                ok(false, "Error should not occur if permission granted");
                                pubnub_pam.publish({
                                    'channel' : grant_channel_1,
                                    'message' : 'Node Test',
                                    'auth_key' : auth_key,
                                    'callback': function(response) {
                                        ok(true, "Success Callback");
                                        start();
                                    },
                                    'error'   : function(response) {
                                        ok(false, "Error should not occur if permission granted");
                                        start();
                                    }
                                })
                                start();
                            }
                        });
                        start();
                    }
                });

            }
        })
    },5000);
})
test("#grant() should be able to grant read write access without auth key", function(done) {
    var grant_channel_8 = grant_channel + '-8';
    expect(7);
    stop(3);
    setTimeout(function() {
        pubnub_pam.grant({
            channel : grant_channel_8,
            read : true,
            write : true,
            ttl : 100,
            callback : function(response) {
                ok(response.status === 200, 'Grant Response');
                pubnub_pam.audit({
                    channel : grant_channel_8,
                    callback : function(response) {
                        ok(response.status === 200, 'Grant Audit Response');
                        ok(response.payload.channels[grant_channel_8].r === 1, 'Grant Audit Read should be 1');
                        ok(response.payload.channels[grant_channel_8].w === 1, 'Grant Audit Write shoudld be 1');
                        ok(response.payload.subscribe_key === sub_key, 'Grant Audit Response Sub Key should match');
                        pubnub_pam.history({
                            'channel'  : grant_channel_8,
                            'auth_key' : "",
                            'callback' : function(response) {
                                ok(true, "Success Callback");
                                pubnub_pam.publish({
                                    'channel' : grant_channel_8,
                                    'auth_key' : "",
                                    'message' : 'Node Test',
                                    'callback': function(response) {
                                        ok(true, "Success callback" );
                                        start();
                                    },
                                    'error'   : function(response) {
                                        ok(false, "Error should not occur if permission granted")
                                        start();
                                    }
                                })
                                start();
                            },
                            'error' : function(response) {
                                ok(false, "Error should not occur if permission granted");
                                pubnub_pam.publish({
                                    'channel' : grant_channel_8,
                                    'message' : 'Node Test',
                                    'auth_key' : "",
                                    'callback': function(response) {
                                        ok(true, "Success Callback");
                                        start();
                                    },
                                    'error'   : function(response) {
                                        ok(false, "Error should not occur if permission granted");
                                        start();
                                    }
                                })
                                start();
                            }
                        });
                        start();
                    }
                });

            }
        })
    },5000);
})

test("#grant() should be able to grant read, revoke write access", function(done) {
    var grant_channel_2 = grant_channel + '-2';
    expect(6);
    stop(3);
    setTimeout(function() {
        pubnub_pam.grant({
            channel : grant_channel_2,
            auth_key : auth_key,
            read : true,
            write : false,
            ttl : 5,
            callback : function(response) {
                ok(response.status === 200, 'Grant Response');
                pubnub_pam.audit({
                    channel : grant_channel_2,
                    auth_key : auth_key,
                    callback : function(response) {
                        ok(response.status === 200, 'Grant Audit Response');
                        ok(response.payload.auths.abcd.r === 1, 'Grant Audit Read should be 1');
                        ok(response.payload.auths.abcd.w === 0, 'Grant Audit Write should be 0');
                        pubnub_pam.history({
                            'channel'  : grant_channel_2,
                            'auth_key' : auth_key,
                            'callback' : function(response) {
                                ok(true, "Success Callback");
                                pubnub_pam.publish({
                                    'channel' : grant_channel_2,
                                    'auth_key' : auth_key,
                                    'message' : 'Test',
                                    'callback': function(response) {
                                        ok(false, "Success callback should not be invoked when permission not granted" );
                                        start();
                                    },
                                    'error'   : function(response) {
                                        ok(true, "Error should occur if permission not granted")
                                        start();
                                    }
                                })
                                start();
                            },
                            'error' : function(response) {
                                ok(false, "Error should not occur if permission granted");
                                pubnub_pam.publish({
                                    'channel' : grant_channel_2,
                                    'message' : 'Test',
                                    'auth_key' : auth_key,
                                    'callback': function(response) {
                                        ok(false, "Success callback should not be invoked when permission not granted");
                                        start();
                                    },
                                    'error'   : function(response) {
                                        ok(true, "Error should occur if permission not granted");
                                        start();
                                    }
                                })
                                start();
                            }
                        });
                        start();
                    }
                });

            }
        })
    },5000);
})

test("#grant() should be able to revoke read, grant write access", function(done) {
    var grant_channel_3 = grant_channel + '-3';
    expect(6);
    stop(3);
    setTimeout(function() {
        pubnub_pam.grant({
            channel : grant_channel_3,
            auth_key : auth_key,
            read : false,
            write : true,
            ttl : 100,
            callback : function(response) {
                ok(response.status === 200, 'Grant Response');
                pubnub_pam.audit({
                    channel : grant_channel_3,
                    auth_key : auth_key,
                    callback : function(response) {
                        ok(response.status === 200, 'Grant Audit Response');
                        ok(response.payload.auths.abcd.r === 0, 'Grant Audit Read should be 0');
                        ok(response.payload.auths.abcd.w === 1, 'Grant Audit Write shoudld be 1');
                        pubnub_pam.history({
                            'channel'  : grant_channel_3,
                            'auth_key' : auth_key,
                            'callback' : function(response) {
                                ok(false , "Success Callback should not be invoked when permission not granted");
                                pubnub_pam.publish({
                                    'channel' : grant_channel_3,
                                    'auth_key' : auth_key,
                                    'message' : 'Node Test',
                                    'callback': function(response) {
                                        ok(true, "Success callback" );
                                        start();
                                    },
                                    'error'   : function(response) {
                                        ok(false, "Error should not occur if permission granted")
                                        start();
                                    }
                                })
                                start();
                            },
                            'error' : function(response) {
                                ok(true, "Error should occur if permission not granted");
                                pubnub_pam.publish({
                                    'channel' : grant_channel_3,
                                    'message' : 'Node Test',
                                    'auth_key' : auth_key,
                                    'callback': function(response) {
                                        ok(true, "Success Callback");
                                        start();
                                    },
                                    'error'   : function(response) {
                                        ok(false, "Error should not occur if permission granted");
                                        start();
                                    }
                                })
                                start();
                            }

                        });
                        start();
                    }
                });

            }
        })
    },5000);
})
test("#grant() should be able to revoke read write access", function(done) {
    var grant_channel_4 = grant_channel + '-4';
    expect(6);
    stop(3);
    setTimeout(function() {
        pubnub_pam.grant({
            channel : grant_channel_4,
            auth_key : auth_key,
            read : false,
            write : false,
            ttl : 100,
            callback : function(response) {
                ok(response.status === 200, 'Grant Response');
                pubnub_pam.audit({
                    channel : grant_channel_4,
                    auth_key : auth_key,
                    callback : function(response) {
                        ok(response.status === 200, 'Grant Audit Response');
                        ok(response.payload.auths.abcd.r === 0, 'Grant Audit Read should be 0');
                        ok(response.payload.auths.abcd.w === 0, 'Grant Audit Write shoudld be 0');
                        pubnub_pam.history({
                            'channel'  : grant_channel_4,
                            'auth_key' : auth_key,
                            'callback' : function(response) {
                                ok(false, "Success Callback should not be invoked if permission not granted");
                                pubnub_pam.publish({
                                    'channel' : grant_channel_4,
                                    'auth_key' : auth_key,
                                    'message' : 'Test',
                                    'callback': function(response) {
                                        ok(false , "Success Callback should not be invoked if permission not granted" );
                                        start();
                                    },
                                    'error'   : function(response) {
                                        ok(false, "Error should occur if permission not granted")
                                        start();
                                    }
                                })
                                start();
                            },
                            'error' : function(response) {
                                ok(true, "Error should occur if permission not granted");
                                pubnub_pam.publish({
                                    'channel' : grant_channel_4,
                                    'message' : 'Test',
                                    'auth_key' : auth_key,
                                    'callback': function(response) {
                                        ok(false , "Success Callback should not be invoked if permission not granted");
                                        start();
                                    },
                                    'error'   : function(response) {
                                        ok(true, "Error should occur if permission not granted");
                                        start();
                                    }
                                })
                                start();
                            }
                        });
                        start();
                    }
                });

            }
        })
    },5000);
})
test("#grant() should be able to revoke read write access without auth key", function(done) {
    var grant_channel_7 = grant_channel + '-7';
    expect(7);
    stop(3);
    setTimeout(function() {
        pubnub_pam.grant({
            channel : grant_channel_7,
            read : false,
            write : false,
            ttl : 100,
            callback : function(response) {
                ok(response.status === 200, 'Grant Response');
                pubnub_pam.audit({
                    channel : grant_channel_7,
                    callback : function(response) {
                        ok(response.status === 200, 'Grant Audit Response');
                        ok(response.payload.channels[grant_channel_7].r === 0, 'Grant Audit Read should be 0');
                        ok(response.payload.channels[grant_channel_7].w === 0, 'Grant Audit Write shoudld be 0');
                        ok(response.payload.subscribe_key === sub_key, 'Grant Audit Response Sub Key should match');
                        pubnub_pam.history({
                            'channel'  : grant_channel_7,
                            'auth_key' : "",
                            'callback' : function(response) {
                                ok(false, "Success Callback should not be invoked if permission not granted");
                                pubnub_pam.publish({
                                    'channel' : grant_channel_7,
                                    'auth_key' : "",
                                    'message' : 'Test',
                                    'callback': function(response) {
                                        ok(false , "Success Callback should not be invoked if permission not granted" );
                                        start();
                                    },
                                    'error'   : function(response) {
                                        ok(false, "Error should occur if permission not granted")
                                        start();
                                    }
                                })
                                start();
                            },
                            'error' : function(response) {
                                ok(true, "Error should occur if permission not granted");
                                pubnub_pam.publish({
                                    'channel' : grant_channel_7,
                                    'message' : 'Test',
                                    'auth_key' : "",
                                    'callback': function(response) {
                                        ok(false , "Success Callback should not be invoked if permission not granted");
                                        start();
                                    },
                                    'error'   : function(response) {
                                        ok(true, "Error should occur if permission not granted");
                                        start();
                                    }
                                })
                                start();
                            }
                        });
                        start();
                    }
                });

            }
        })
    },5000);
})
test("#revoke() should be able to revoke access", function(done) {
    var grant_channel_5 = grant_channel + '-5';
    expect(6);
    stop(3);
    setTimeout(function() {
        pubnub_pam.revoke({
            channel : grant_channel_5,
            auth_key : auth_key,
            callback : function(response) {
                ok(response.status === 200, 'Grant Response');
                pubnub_pam.audit({
                    channel : grant_channel_5,
                    auth_key : auth_key,
                    callback : function(response) {
                        ok(response.status === 200, 'Grant Audit Response');
                        ok(response.payload.auths.abcd.r === 0, 'Grant Audit Read should be 0');
                        ok(response.payload.auths.abcd.w === 0, 'Grant Audit Write shoudld be 0');
                        pubnub_pam.history({
                            'channel'  : grant_channel_5,
                            'auth_key' : auth_key,
                            'callback' : function(response) {
                                ok(false, "Success Callback should not be invoked if permission not granted ");
                                pubnub_pam.publish({
                                    'channel' : grant_channel_5,
                                    'auth_key' : auth_key,
                                    'message' : 'Test',
                                    'callback': function(response) {
                                        ok(false , "Success Callback should not be invoked if permission not granted" );
                                        start();
                                    },
                                    'error'   : function(response) {
                                        ok(false, "Error should occur if permission not granted")
                                        start();
                                    }
                                })
                                start();
                            },
                            'error' : function(response) {

                                ok(true, "Error should occur if permission not granted");
                                pubnub_pam.publish({
                                    'channel' : grant_channel_5,
                                    'message' : 'Test',
                                    'auth_key' : auth_key,
                                    'callback': function(response) {
                                        ok(false , "Success Callback should not be invoked if permission not granted");
                                        start();
                                    },
                                    'error'   : function(response) {
                                        ok(true, "Error should occur if permission not granted");
                                        start();
                                    }
                                })
                                start();
                            }
                        });
                        start();
                    }
                });

            }
        })
    },5000);
})
