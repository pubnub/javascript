var pubnub = PUBNUB.init({
    publish_key   : 'demo',
    subscribe_key : 'demo',
    jsonp         : true
});

var pubnub_enc = PUBNUB({
    publish_key: "demo",
    subscribe_key: "demo",
    cipher_key: "enigma",
    jsonp     : true
});

var channel = 'javascript-test-channel-' + Math.random();
var count = 0;

var message_string = 'Hi from Javascript';
var message_jsono = {"message": "Hi Hi from Javascript"};
var message_jsona = ["message" , "Hi Hi from javascript"];
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

test("set_uuid() should set uuid", function() {
    expect(1);
    pubnub.set_uuid("abcd");
    deepEqual(pubnub.get_uuid(), "abcd");
});



/*
test("set_uuid() should set uuid and new presence event should come with new uuid", function() {
    expect(2);
    stop(2);
    var ch = channel + '-' + ++count;
    var uuid;
    var uuid2;
    var uuid1 = uuid = pubnub.get_uuid();
    pubnub.subscribe({ channel : ch,
        connect : function(response)  {
            setTimeout(function() {
                uuid2 = uuid = "efgh"
                pubnub.set_uuid(uuid);
            }, 3000);
        },
        callback : function(response) {

        },
        presence : function(response) {
            if (response.action == "join") {
                deepEqual(response.uuid, uuid);
                if (response.uuid === uuid2) pubnub.unsubscribe({channel : ch});
                start();
            }
        }
    });
});
*/
test("instantiation test 1", function() {
    var pubnub = PUBNUB({
        'publish_key' : 'demo',
        'subscribe_key' : 'demo',
        jsonp           : true
    });
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

test("instantiation test 2", function() {
    var pubnub = PUBNUB.init({
        'publish_key' : 'demo',
        'subscribe_key' : 'demo',
        jsonp           : true
    });
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

test("instantiation test 3", function() {
    var pubnub1 = PUBNUB.init({
        'publish_key' : 'demo',
        'subscribe_key' : 'demo',
        jsonp          : true
    });

    var pubnub = pubnub1.init({
        'publish_key' : 'demo',
        'subscribe_key' : 'demo',
        jsonp         : true
    });

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

test("instantiation test 4", function() {
    var pubnub1 = PUBNUB({
        'publish_key' : 'demo',
        'subscribe_key' : 'demo'
    });

    var pubnub = pubnub1.init({
        'publish_key' : 'demo',
        'subscribe_key' : 'demo'
    });

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

test("instantiation test 5", function() {
    var pubnub1 = PUBNUB.init({
        'publish_key' : 'demo',
        'subscribe_key' : 'demo'
    });

    var pubnub = pubnub1({
        'publish_key' : 'demo',
        'subscribe_key' : 'demo'
    });

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

test("instantiation test 6", function() {
    var pubnub1 = PUBNUB.init({
        'publish_key' : 'demo',
        'subscribe_key' : 'demo'
    });

    var pubnub = pubnub1({
        'publish_key' : 'demo',
        'subscribe_key' : 'demo'
    });

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


test("instantiation test 7", function() {
    var pubnub1 = PUBNUB.init({
        'publish_key' : 'demo',
        'subscribe_key' : 'demo'
    });

    var pubnub2 = pubnub1({
        'publish_key' : 'demo',
        'subscribe_key' : 'demo'
    });

    var pubnub = pubnub2.init({
        'publish_key' : 'demo',
        'subscribe_key' : 'demo'
    });

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
test("publish() should publish strings without error (Encryption Enabled)", function() {
    expect(2);
    stop(2);
    var ch = channel + '-' + ++count;
    pubnub_enc.subscribe({ channel : ch,
        connect : function(response)  {
            pubnub_enc.publish({channel: ch, message: message_string,
                callback : function(response) {
                    equal(response[0],1);
                    start();
                }
            });
        },
        callback : function(response) {
            deepEqual(response, message_string);
            pubnub_enc.unsubscribe({channel : ch});
            start();
        }
    });
});

test("both encrypted and unencrypted messages should be received on a channel with cipher key", function() {
    expect(3);
    stop(2);
    var count = 0;
    var ch = channel + '-both-' + ++count;

    pubnub_enc.subscribe({ channel : ch,
        connect : function(response)  {
            pubnub.publish({channel: ch, message: message_string,
                callback : function(response) {
                    equal(response[0],1);
                    pubnub_enc.publish({channel: ch, message: message_string,
                        callback : function(response) {
                            equal(response[0],1);
                            start();
                        }
                    });
                }
            });
        },
        callback : function(response, channel) {
            deepEqual(response, message_string);
            count++;
            if (count == 2) {
                pubnub_enc.unsubscribe({channel : ch});
                start();
            }
        }
    });
});

test("test global cipher key", function() {
    expect(3);
    stop(2);
    var count = 0;
    var ch = channel + '-global-' + ++count;
    pubnub_enc.subscribe({ channel : ch,
        cipher_key : 'local_cipher_key',
        connect : function(response)  {
            pubnub.publish({channel: ch, message: message_string,
                cipher_key : 'enigma',
                callback : function(response) {
                    equal(response[0],1);
                    pubnub_enc.publish({channel: ch, message: message_string,
                        cipher_key : 'enigma',
                        callback : function(response) {
                            equal(response[0],1);
                            start();
                        }
                    });
                }
            });
        },
        callback : function(response) {
            deepEqual(response, message_string);
            count++;
            if (count == 2) {
                pubnub_enc.unsubscribe({channel : ch});
                start();
            }
        }
    });
});


test("test local cipher key", function() {
    expect(4);
    stop(2);
    var count = 0;
    var ch = channel + '-local-test-' + Date.now();
    pubnub_enc.subscribe({ channel : ch,
        cipher_key : 'local_cipher_key',
        connect : function(response)  {
            pubnub.publish({channel: ch, message: message_string,
                cipher_key : 'local_cipher_key',
                callback : function(response) {
                    equal(response[0],1);
                    pubnub_enc.publish({channel: ch, message: message_string,
                        cipher_key : 'local_cipher_key',
                        callback : function(response) {
                            equal(response[0],1);
                            start();
                        }
                    });
                }
            });
        },
        callback : function(response) {
            deepEqual(response, message_string);
            count++;
            if (count == 2) {
                pubnub_enc.unsubscribe({channel : ch});
                start();
            }
        }
    });
});


test("subscribe() should take heartbeat as argument", function() {
    expect(1);
    stop(1);
    var ch = channel + '-' + ++count;
    pubnub.subscribe({ channel : ch,
        heartbeat : 30,
        connect : function(response)  {
            ok(true,"connect should be called");
            pubnub.unsubscribe({channel : ch});
            start();
        },
        callback : function(response) {

        },
        error : function(response) {
            ok(false, "error should not occur");
            pubnub.unsubscribe({channel : ch});
            start();
        }
    });
});


test("subscribe() should pass on plain text on decryption error", function() {
    expect(2);
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
            deepEqual(response,message_string);
            pubnub_enc.unsubscribe({channel : ch});
            start();
        },
        error : function(response) {
            ok(false, "error should not occur");
            pubnub_enc.unsubscribe({channel : ch});
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

var message_number = 123456;

test("publish() should publish numbers without error", function() {
    expect(2);
    stop(2);
    var ch = channel + '-' + ++count;
    pubnub.subscribe({ channel : ch,
        connect : function(response)  {
            pubnub.publish({channel: ch, message: message_number,
                callback : function(response) {
                    equal(response[0],1);
                    start();
                }
            });
        },
        callback : function(response) {
            deepEqual(response, message_number);
            pubnub.unsubscribe({channel : ch});
            start();
        }
    });
});
test("publish() should publish numbers without error (Encryption Enabled)", function() {
    expect(2);
    stop(2);
    var ch = channel + '-' + ++count;
    pubnub_enc.subscribe({ channel : ch,
        connect : function(response)  {
            pubnub_enc.publish({channel: ch, message: message_number,
                callback : function(response) {
                    equal(response[0],1);
                    start();
                }
            });
        },
        callback : function(response) {
            deepEqual(response, message_number);
            pubnub_enc.unsubscribe({channel : ch});
            start();
        }
    });
});



var message_string_numeric = '12345';
var message_string_array = '[0,1,2,3]';
var message_string_object = '{"foo":"bar"}';


test("subscribe() should receive a string (not a number)", function () {
    expect(2);
    stop(2);
    var ch = channel + '-' + ++count;
    pubnub.subscribe({ channel : ch,
        connect : function(response)  {
            pubnub.publish({channel: ch, message: message_string_numeric,
                callback : function(response) {
                    equal(response[0],1);
                    start();
                }
            });
        },
        callback : function(response) {
            deepEqual(response, message_string_numeric);
            pubnub.unsubscribe({channel : ch});
            start();
        }
    });
});

test("subscribe() should receive a string (not a number) ( encryption enabled )", function () {
    expect(2);
    stop(2);
    var ch = channel + '-' + ++count;
    pubnub_enc.subscribe({ channel : ch,
        connect : function(response)  {
            pubnub_enc.publish({channel: ch, message: message_string_numeric,
                callback : function(response) {
                    equal(response[0],1);
                    start();
                }
            });
        },
        callback : function(response) {
            deepEqual(response, message_string_numeric);
            pubnub_enc.unsubscribe({channel : ch});
            start();
        }
    });
});

test("subscribe() should receive a string (not an array)", function () {
    expect(2);
    stop(2);
    var ch = channel + '-' + ++count;
    pubnub.subscribe({ channel : ch,
        connect : function(response)  {
            pubnub.publish({channel: ch, message: message_string_array,
                callback : function(response) {
                    equal(response[0],1);
                    start();
                }
            });
        },
        callback : function(response) {
            deepEqual(response, message_string_array);
            pubnub.unsubscribe({channel : ch});
            start();
        }
    });
});

test("subscribe() should receive a string (not an array) ( encryption enabled )", function () {
    expect(2);
    stop(2);
    var ch = channel + '-' + ++count;
    pubnub_enc.subscribe({ channel : ch,
        connect : function(response)  {
            pubnub_enc.publish({channel: ch, message: message_string_array,
                callback : function(response) {
                    equal(response[0],1);
                    start();
                }
            });
        },
        callback : function(response) {
            deepEqual(response, message_string_array);
            pubnub_enc.unsubscribe({channel : ch});
            start();
        }
    });
});

test("subscribe() should receive a string (not an object)", function () {
    expect(2);
    stop(2);
    var ch = channel + '-' + ++count;
    pubnub.subscribe({ channel : ch,
        connect : function(response)  {
            pubnub.publish({channel: ch, message: message_string_object,
                callback : function(response) {
                    equal(response[0],1);
                    start();
                }
            });
        },
        callback : function(response) {
            deepEqual(response, message_string_object);
            pubnub.unsubscribe({channel : ch});
            start();
        }
    });
});

test("subscribe() should receive a string (not an object) ( encryption enabled )", function () {
    expect(2);
    stop(2);
    var ch = channel + '-' + ++count;
    pubnub_enc.subscribe({ channel : ch,
        connect : function(response)  {
            pubnub_enc.publish({channel: ch, message: message_string_object,
                callback : function(response) {
                    equal(response[0],1);
                    start();
                }
            });
        },
        callback : function(response) {
            deepEqual(response, message_string_object);
            pubnub_enc.unsubscribe({channel : ch});
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


asyncTest("#here_now() should show occupancy 1 when 1 user subscribed to channel (DEBUG TEST)", function() {
    expect(5);
    var ch = channel + '-' + 'here-now' ;
    pubnub.subscribe({channel : ch ,
        connect : function(response) {
            setTimeout(function() {
                pubnub.here_now( {channel : ch, callback : function(data) {
                    equal(data.occupancy, 1);
                }})}, 15000
            );
            setTimeout(function() {
                pubnub.here_now( {channel : ch, callback : function(data) {
                    equal(data.occupancy, 1);
                }})}, 30000
            );
            setTimeout(function() {
                pubnub.here_now( {channel : ch, callback : function(data) {
                    equal(data.occupancy, 1);
                    start();
                    pubnub.unsubscribe({channel : ch});
                }})}, 45000
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

asyncTest('#history() should pass on plain text in case of decryption failure', function() {
    var history_channel = channel + '-history-3';
    expect(5);
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
                                equal(response[0].length, 2);
                                equal(response[0][0], message_string);
                                equal(response[0][1], message_string);
                                start();
                            },
                            error : function(response) {
                                ok(false,"error should not occur");
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
    var aes = PUBNUB.init({
        publish_key: "demo",
        subscribe_key: "demo",
        cipher_key: "enigma",
        jsonp    : true
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

        presence: function (message, envelope, aes_channel) {

        },

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
    origin            : 'pubsub.pubnub.com',
    publish_key       : 'pub-c-a2650a22-deb1-44f5-aa87-1517049411d5',
    subscribe_key     : 'sub-c-a478dd2a-c33d-11e2-883f-02ee2ddab7fe',
    secret_key        : 'sec-c-YjFmNzYzMGMtYmI3NC00NzJkLTlkYzYtY2MwMzI4YTJhNDVh',
    jsonp             : true
});
test("#grant() should be able to grant read write access", function(done) {
    var grant_channel_1 = grant_channel + '-1';
    expect(4);
    stop(3);
    setTimeout(function() {
        pubnub_pam.grant({
            channel : grant_channel_1,
            auth_key : auth_key,
            read : true,
            write : true,
            ttl : 100,
            callback : function(response) {
                //ok(response.status === 200, 'Grant Response');
                pubnub_pam.audit({
                    channel : grant_channel_1,
                    auth_key : auth_key,
                    callback : function(response) {
                        //ok(response.status === 200, 'Grant Audit Response');
                        ok(response.auths.abcd.r === 1, 'Grant Audit Read should be 1');
                        ok(response.auths.abcd.w === 1, 'Grant Audit Write shoudld be 1');
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
    expect(5);
    stop(3);
    setTimeout(function() {
        pubnub_pam.grant({
            channel : grant_channel_8,
            read : true,
            write : true,
            ttl : 100,
            callback : function(response) {
                //ok(response.status === 200, 'Grant Response');
                pubnub_pam.audit({
                    channel : grant_channel_8,
                    callback : function(response) {
                        //ok(response.status === 200, 'Grant Audit Response');
                        ok(response.channels[grant_channel_8].r === 1, 'Grant Audit Read should be 1');
                        ok(response.channels[grant_channel_8].w === 1, 'Grant Audit Write shoudld be 1');
                        ok(response.subscribe_key === sub_key, 'Grant Audit Response Sub Key should match');
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
    expect(4);
    stop(3);
    setTimeout(function() {
        pubnub_pam.grant({
            channel : grant_channel_2,
            auth_key : auth_key,
            read : true,
            write : false,
            ttl : 5,
            callback : function(response) {
                //ok(response.status === 200, 'Grant Response');
                pubnub_pam.audit({
                    channel : grant_channel_2,
                    auth_key : auth_key,
                    callback : function(response) {
                        //ok(response.status === 200, 'Grant Audit Response');
                        ok(response.auths.abcd.r === 1, 'Grant Audit Read should be 1');
                        ok(response.auths.abcd.w === 0, 'Grant Audit Write should be 0');
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
    expect(4);
    stop(3);
    setTimeout(function() {
        pubnub_pam.grant({
            channel : grant_channel_3,
            auth_key : auth_key,
            read : false,
            write : true,
            ttl : 100,
            callback : function(response) {
                //ok(response.status === 200, 'Grant Response');
                pubnub_pam.audit({
                    channel : grant_channel_3,
                    auth_key : auth_key,
                    callback : function(response) {
                        //ok(response.status === 200, 'Grant Audit Response');
                        ok(response.auths.abcd.r === 0, 'Grant Audit Read should be 0');
                        ok(response.auths.abcd.w === 1, 'Grant Audit Write shoudld be 1');
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
    expect(4);
    stop(3);
    setTimeout(function() {
        pubnub_pam.grant({
            channel : grant_channel_4,
            auth_key : auth_key,
            read : false,
            write : false,
            ttl : 100,
            callback : function(response) {
                //ok(response.status === 200, 'Grant Response');
                pubnub_pam.audit({
                    channel : grant_channel_4,
                    auth_key : auth_key,
                    callback : function(response) {
                        //ok(response.status === 200, 'Grant Audit Response');
                        ok(response.auths.abcd.r === 0, 'Grant Audit Read should be 0');
                        ok(response.auths.abcd.w === 0, 'Grant Audit Write shoudld be 0');
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
    expect(5);
    stop(3);
    setTimeout(function() {
        pubnub_pam.grant({
            channel : grant_channel_7,
            read : false,
            write : false,
            ttl : 100,
            callback : function(response) {
                //ok(response.status === 200, 'Grant Response');
                pubnub_pam.audit({
                    channel : grant_channel_7,
                    callback : function(response) {
                        //ok(response.status === 200, 'Grant Audit Response');
                        ok(response.channels[grant_channel_7].r === 0, 'Grant Audit Read should be 0');
                        ok(response.channels[grant_channel_7].w === 0, 'Grant Audit Write shoudld be 0');
                        ok(response.subscribe_key === sub_key, 'Grant Audit Response Sub Key should match');
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
    expect(4);
    stop(3);
    setTimeout(function() {
        pubnub_pam.revoke({
            channel : grant_channel_5,
            auth_key : auth_key,
            callback : function(response) {
                pubnub_pam.audit({
                    channel : grant_channel_5,
                    auth_key : auth_key,
                    callback : function(response) {
                        ok(response.auths.abcd.r === 0, 'Grant Audit Read should be 0');
                        ok(response.auths.abcd.w === 0, 'Grant Audit Write shoudld be 0');
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

function in_list(list,str) {
    for (var x in list) {
        if (list[x] == str) return true;
    }
    return false;
 }

 function in_list_deep(list,obj) {
    for (var x in list) {
        if (_.isEqual(list[x], obj)) return true;
    }
    return false;
 }

var uuid = Date.now()
var uuid1 = uuid + '-1';
var uuid2 = uuid + '-2';
var uuid3 = uuid + '-3';
var pubnub_pres = PUBNUB.init({
    origin            : 'pubsub.pubnub.com',
    publish_key       : 'demo',
    subscribe_key     : 'demo',
    uuid              : uuid,
    jsonp             : true
});
var pubnub_pres_1 = PUBNUB.init({
    origin            : 'pubsub.pubnub.com',
    publish_key       : 'demo',
    subscribe_key     : 'demo',
    uuid              : uuid1,
    jsonp             : true
});
var pubnub_pres_2 = PUBNUB.init({
    origin            : 'pubsub.pubnub.com',
    publish_key       : 'demo',
    subscribe_key     : 'demo',
    uuid              : uuid2,
    jsonp             : true
});
var pubnub_pres_3 = PUBNUB.init({
    origin            : 'pubsub.pubnub.com',
    publish_key       : 'demo',
    subscribe_key     : 'demo',
    uuid              : uuid3,
    jsonp             : true
});

/*

asyncTest("subscribe() should not generate spurious presence events when adding new channels to subscribe list", function() {
    expect(4);
    var ch1 = channel + '-subscribe-' + Date.now();
    var ch2 = ch1 + '-2';
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
                        ok(false, "Error in subscribe 2")
                    },
                    presence : function(response) {
                        deepEqual(response.action,"join");
                        deepEqual(response.uuid, JSON.stringify(pubnub_pres.get_uuid()));
                        setTimeout(function(){
                            start();
                        }, 5000);
                    }
                });
            },5000);
        },
        presence : function(response) {
            deepEqual(response.action,"join");
            deepEqual(response.uuid + '', JSON.stringify(pubnub_pres.get_uuid()));
        },
        callback : function(response) {

        },
        error : function(response) {
            ok(false, "Error occurred in subscribe 1");
            start();
        }
    });
});
*/
asyncTest("#where_now() should return channel x in result for uuid y, when uuid y subscribed to channel x", function() {
    expect(1);
    var ch = channel + '-' + 'where-now' ;
    pubnub_pres.subscribe({
        channel: ch ,
        connect : function(response) {
            setTimeout(function() {
                pubnub_pres.where_now({
                    uuid: uuid,
                    callback : function(data) {
                        console.log(JSON.stringify(data));
                        ok(in_list(data.channels,ch), "subscribed Channel should be there in where now list");
                        pubnub_pres.unsubscribe({channel : ch});
                        start();
                    },
                    error : function(error) {
                        ok(false, "Error occurred in where now " + JSON.stringify(error));
                        start();
                    }
                })},
                3000
            );
        },
        callback : function(response) {
        },
        error : function(error) {
            ok(false, "Error occurred in subscribe");
            start();
        }
    })
});

asyncTest("#where_now() should return channel a,b,c in result for uuid y, when uuid y subscribed to channel x", function() {
    expect(3);
    var ch1 = channel + '-' + 'where-now' + '-1' ;
    var ch2 = channel + '-' + 'where-now' + '-2' ;
    var ch3 = channel + '-' + 'where-now' + '-3' ;
    var where_now_set = false;
    pubnub_pres.subscribe({
        channel: [ch1,ch2,ch3] ,
        connect : function(response) {
            if (!where_now_set) {
                setTimeout(function() {
                    pubnub_pres.where_now({
                        uuid: uuid,
                        callback : function(data) {
                            ok(in_list(data.channels,ch1), "subscribed Channel 1 should be there in where now list");
                            ok(in_list(data.channels,ch2), "subscribed Channel 2 should be there in where now list");
                            ok(in_list(data.channels,ch3), "subscribed Channel 3 should be there in where now list");
                            pubnub.unsubscribe({channel : ch1});
                            pubnub.unsubscribe({channel : ch2});
                            pubnub.unsubscribe({channel : ch3});
                            start();
                        },
                        error : function(error) {
                            ok(false, "Error occurred in where now " + JSON.stringify(error));
                            start();
                        }
                    });
                }, 3000);
                where_now_set = true;
            }
        },
        callback : function(response) {
        },
        error : function(error) {
            ok(false, "Error occurred in subscribe");
            start();
        }
    })
});

asyncTest('#state() should be able to set state for uuid', function(){
    expect(2);
    var ch = channel + '-' + 'setstate' ;
    var uuid = pubnub.uuid();
    var state = { 'name' : 'name-' + uuid};
    pubnub_pres.state({
        channel  : ch ,
        uuid     : uuid,
        state : state,
        callback : function(response) {
            deepEqual(response,state);
            pubnub_pres.state({
                channel  : ch ,
                uuid     : uuid,
                callback : function(response) {
                    deepEqual(response,state);
                    start();
                },
                error    : function(error) {
                    ok(false, "Error occurred in state " + JSON.stringify(error));
                    start();
                }
             });
        },
        error : function(error) {
            ok(false, "Error occurred in state " + JSON.stringify(error));
            start();
        }
    })
})
/*
asyncTest('#state() should be able to delete state for uuid', function(){
    expect(4);
    var ch = channel + '-' + 'setstate' ;
    var uuid = pubnub.uuid();
    var state = { 'name' : 'name-' + uuid, "age" : "50"};
    pubnub_pres.state({
        channel  : ch ,
        uuid     : uuid,
        state : state,
        callback : function(response) {
            deepEqual(response,state);
            pubnub_pres.state({
                channel  : ch ,
                uuid     : uuid,
                callback : function(response) {
                    deepEqual(response,state);
                    delete state["age"];
                        pubnub_pres.state({
                            channel  : ch ,
                            uuid     : uuid,
                            state : { "age" : "null"},
                            callback : function(response) {
                                deepEqual(response,state);
                                pubnub_pres.state({
                                    channel  : ch ,
                                    uuid     : uuid,
                                    callback : function(response) {
                                        deepEqual(response,state);
                                        start();
                                    },
                                    error    : function(error) {
                                        ok(false, "Error occurred in state " + JSON.stringify(error));
                                        start();
                                    }
                                 });
                            },
                            error : function(error) {
                                ok(false, "Error occurred in state " + JSON.stringify(error));
                                start();
                            }
                        })
                },
                error    : function(error) {
                    ok(false, "Error occurred in state " + JSON.stringify(error));
                    start();
                }
             });
        },
        error : function(error) {
            ok(false, "Error occurred in state " + JSON.stringify(error));
            start();
        }
    })
})
*/
asyncTest("#here_now() should return channel channel list with occupancy details and uuids for a subscribe key", function() {
    expect(12);
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
                                                ok(response.channels[ch], "subscribed channel should be present in payload");
                                                ok(response.channels[ch1], "subscribed 1 channel should be present in payload");
                                                ok(response.channels[ch2], "subscribed 2 channel should be present in payload");
                                                ok(response.channels[ch3], "subscribed 3 channel should be present in payload");
                                                ok(in_list(response.channels[ch].uuids, uuid), "uuid should be there in the uuids list");
                                                ok(in_list(response.channels[ch1].uuids,uuid1), "uuid 1 should be there in the uuids list");
                                                ok(in_list(response.channels[ch2].uuids,uuid2), "uuid 2 should be there in the uuids list");
                                                ok(in_list(response.channels[ch3].uuids,uuid3), "uuid 3 should be there in the uuids list");
                                                deepEqual(response.channels[ch].occupancy,1);
                                                deepEqual(response.channels[ch1].occupancy,1);
                                                deepEqual(response.channels[ch2].occupancy,1);
                                                deepEqual(response.channels[ch3].occupancy,1);
                                                pubnub_pres.unsubscribe({channel : ch});
                                                pubnub_pres_1.unsubscribe({channel : ch1});
                                                pubnub_pres_2.unsubscribe({channel : ch2});
                                                pubnub_pres_3.unsubscribe({channel : ch3});
                                                start();
                                            },
                                            error : function(error) {
                                                ok(false, "Error occurred in subscribe 3");
                                                start();
                                            }
                                        });
                                    },3000);
                                },
                                callback : function(response) {
                                },
                                error : function(error) {
                                    ok(false, "Error occurred in subscribe 3");
                                    start();
                                }
                            })
                        },
                        callback : function(response) {
                        },
                        error : function(error) {
                            ok(false, "Error occurred in subscribe 2");
                            start();
                        }
                    })
                },
                callback : function(response) {
                },
                error : function(error) {
                    ok(false, "Error occurred in subscribe 1");
                    start();
                }
            })
        },
        callback : function(response) {
        },
        error : function(error) {
            ok(false, "Error occurred in subscribe");
            start();
        }
    })
})
/*
asyncTest("#here_now() should return channel list with occupancy details and uuids + state for a subscribe key", function() {
    expect(16);
    var ch = channel + '-' + 'here-now-' + Date.now();
    var ch1 = ch + '-1' ;
    var ch2 = ch + '-2' ;
    var ch3 = ch + '-3' ;

    pubnub_pres.state({
        channel : ch,
        uuid : uuid,
        state : {
            name : 'name-' + uuid
        },
        callback : function(r) {
            JSON.stringify(r);
            ok(true,"Setstate should get success callback");
        },
        error : function(e) {
            ok(false,"Error in setstate")
        }
    });
    pubnub_pres_1.state({
        channel : ch1,
        uuid : uuid + '-1',
        state : {
            name : 'name-' + uuid + '-1'
        },
        callback : function(r) {
            JSON.stringify(r);
            ok(true,"Setstate should get success callback");
        },
        error : function(e) {
            ok(false,"Error in setstate")
        }
    });
    pubnub_pres_2.state({
        channel : ch2,
        uuid : uuid + '-2',
        state : {
            name : 'name-' + uuid + '-2'
        },
        callback : function(r) {
            JSON.stringify(r);
            ok(true,"Setstate should get success callback");
        },
        error : function(e) {
            ok(false,"Error in setstate")
        }
    });
    pubnub_pres_3.state({
        channel : ch3,
        uuid : uuid + '-3',
        state : {
            name : 'name-' + uuid + '-3'
        },
        callback : function(r) {
            JSON.stringify(r);
            ok(true,"Setstate should get success callback");
        },
        error : function(e) {
            ok(false,"Error in setstate")
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
                                                state : true,
                                                callback : function(response) {
                                                    ok(response.channels[ch], "subscribed channel should be present in payload");
                                                    ok(response.channels[ch1], "subscribed 1 channel should be present in payload");
                                                    ok(response.channels[ch2], "subscribed 2 channel should be present in payload");
                                                    ok(response.channels[ch3], "subscribed 3 channel should be present in payload");
                                                    ok(in_list_deep(response.channels[ch].uuids, { uuid : uuid + '', state : { 'name' : 'name-' + uuid } } ), "uuid should be there in the uuids list");
                                                    ok(in_list_deep(response.channels[ch1].uuids,{ uuid : uuid1, state : {name : 'name-' + uuid1}}), "uuid 1 should be there in the uuids list");
                                                    ok(in_list_deep(response.channels[ch2].uuids,{ uuid : uuid2, state : {name : 'name-' + uuid2}}), "uuid 2 should be there in the uuids list");
                                                    ok(in_list_deep(response.channels[ch3].uuids,{ uuid : uuid3, state : {name : 'name-' + uuid3}}), "uuid 3 should be there in the uuids list");
                                                    deepEqual(response.channels[ch].occupancy,1);
                                                    deepEqual(response.channels[ch1].occupancy,1);
                                                    deepEqual(response.channels[ch2].occupancy,1);
                                                    deepEqual(response.channels[ch3].occupancy,1);
                                                    pubnub_pres.unsubscribe({channel : ch});
                                                    pubnub_pres_1.unsubscribe({channel : ch1});
                                                    pubnub_pres_2.unsubscribe({channel : ch2});
                                                    pubnub_pres_3.unsubscribe({channel : ch3});
                                                    start();
                                                },
                                                error : function(error) {
                                                    ok(false, "Error occurred in subscribe 3");
                                                    start();
                                                }
                                            });
                                        },3000);
                                    },
                                    callback : function(response) {
                                    },
                                    error : function(error) {
                                        ok(false, "Error occurred in subscribe 3");
                                        start();
                                    }
                                })
                            },
                            callback : function(response) {
                            },
                            error : function(error) {
                                ok(false, "Error occurred in subscribe 2");
                                start();
                            }
                        })
                    },
                    callback : function(response) {
                    },
                    error : function(error) {
                        ok(false, "Error occurred in subscribe 1");
                        start();
                    }
                })
            },
            callback : function(response) {
            },
            error : function(error) {
                ok(false, "Error occurred in subscribe");
                start();
            }
        })
    },5000);
})

asyncTest("#here_now() should return channel list with occupancy details and uuids + state ( of currently subscribed u) for a subscribe key", function() {
    expect(16);
    var ch = channel + '-' + 'here-now-' + Date.now();
    var ch1 = ch + '-1' ;
    var ch2 = ch + '-2' ;
    var ch3 = ch + '-3' ;

    pubnub_pres.state({
        channel : ch,
        uuid : uuid,
        state : {
            name : 'name-' + uuid
        },
        callback : function(r) {
            JSON.stringify(r);
            ok(true,"Setstate should get success callback");
        },
        error : function(e) {
            ok(false,"Error in setstate")
        }
    });
    pubnub_pres_1.state({
        channel : ch1,
        uuid : uuid1,
        state : {
            name : 'name-' + uuid1
        },
        callback : function(r) {
            JSON.stringify(r);
            ok(true,"Setstate should get success callback");
        },
        error : function(e) {
            ok(false,"Error in setstate")
        }
    });
    pubnub_pres_2.state({
        channel : ch2,
        uuid : uuid2,
        state : {
            name : 'name-' + uuid2
        },
        callback : function(r) {
            JSON.stringify(r);
            ok(true,"Setstate should get success callback");
        },
        error : function(e) {
            ok(false,"Error in setstate")
        }
    });
    pubnub_pres_3.state({
        channel : ch3,
        uuid : uuid3,
        state : {
            name : 'name-' + uuid3
        },
        callback : function(r) {
            JSON.stringify(r);
            ok(true,"Setstate should get success callback");
        },
        error : function(e) {
            ok(false,"Error in setstate")
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
                                                state : true,
                                                callback : function(response) {
                                                    //deepEqual(response.status, 200);
                                                    ok(response.channels[ch], "subscribed channel should be present in payload");
                                                    ok(response.channels[ch1], "subscribed 1 channel should be present in payload");
                                                    ok(response.channels[ch2], "subscribed 2 channel should be present in payload");
                                                    ok(response.channels[ch3], "subscribed 3 channel should be present in payload");
                                                    ok(in_list_deep(response.channels[ch].uuids, { uuid : uuid + '', state : { 'name' : 'name-' + uuid } } ), "uuid should be there in the uuids list");
                                                    ok(in_list_deep(response.channels[ch1].uuids,{ uuid : uuid1, state : {name : 'name-' + uuid1}}), "uuid 1 should be there in the uuids list");
                                                    ok(in_list_deep(response.channels[ch2].uuids,{ uuid : uuid2, state : {name : 'name-' + uuid2}}), "uuid 2 should be there in the uuids list");
                                                    ok(in_list_deep(response.channels[ch3].uuids,{ uuid : uuid3, state : {name : 'name-' + uuid3}}), "uuid 3 should be there in the uuids list");
                                                    deepEqual(response.channels[ch].occupancy,1);
                                                    deepEqual(response.channels[ch1].occupancy,1);
                                                    deepEqual(response.channels[ch2].occupancy,1);
                                                    deepEqual(response.channels[ch3].occupancy,1);
                                                    pubnub_pres.unsubscribe({channel : ch});
                                                    pubnub_pres_1.unsubscribe({channel : ch1});
                                                    pubnub_pres_2.unsubscribe({channel : ch2});
                                                    pubnub_pres_3.unsubscribe({channel : ch3});
                                                    start();
                                                },
                                                error : function(error) {
                                                    ok(false, "Error occurred in subscribe 3");
                                                    start();
                                                }
                                            });
                                        },3000);
                                    },
                                    callback : function(response) {
                                    },
                                    error : function(error) {
                                        ok(false, "Error occurred in subscribe 3");
                                        start();
                                    }
                                })
                            },
                            callback : function(response) {
                            },
                            error : function(error) {
                                ok(false, "Error occurred in subscribe 2");
                                start();
                            }
                        })
                    },
                    callback : function(response) {
                    },
                    error : function(error) {
                        ok(false, "Error occurred in subscribe 1");
                        start();
                    }
                })
            },
            callback : function(response) {
            },
            error : function(error) {
                ok(false, "Error occurred in subscribe");
                start();
            }
        })
    },5000);
})

asyncTest("#here_now() should return correct state for uuid in different channels", function() {
    expect(16);
    var ch = channel + '-' + 'here-now-' + Date.now();
    var ch1 = ch + '-1' ;
    var ch2 = ch + '-2' ;
    var ch3 = ch + '-3' ;

    pubnub_pres.state({
        channel : ch,
        uuid : uuid,
        state : {
            name : 'name-' + uuid
        },
        callback : function(r) {
            JSON.stringify(r);
            ok(true,"Setstate should get success callback");
        },
        error : function(e) {
            ok(false,"Error in setstate")
        }
    });
    pubnub_pres.state({
        channel : ch1,
        uuid : uuid,
        state : {
            name : 'name-' + uuid1
        },
        callback : function(r) {
            JSON.stringify(r);
            ok(true,"Setstate should get success callback");
        },
        error : function(e) {
            ok(false,"Error in setstate")
        }
    });
    pubnub_pres.state({
        channel : ch2,
        uuid : uuid,
        state : {
            name : 'name-' + uuid2
        },
        callback : function(r) {
            JSON.stringify(r);
            ok(true,"Setstate should get success callback");
        },
        error : function(e) {
            ok(false,"Error in setstate")
        }
    });
    pubnub_pres.state({
        channel : ch3,
        uuid : uuid,
        state : {
            name : 'name-' + uuid3
        },
        callback : function(r) {
            JSON.stringify(r);
            ok(true,"Setstate should get success callback");
        },
        error : function(e) {
            ok(false,"Error in setstate")
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
                                                state : true,
                                                callback : function(response) {
                                                    //deepEqual(response.status, 200);
                                                    ok(response.channels[ch], "subscribed channel should be present in payload");
                                                    ok(response.channels[ch1], "subscribed 1 channel should be present in payload");
                                                    ok(response.channels[ch2], "subscribed 2 channel should be present in payload");
                                                    ok(response.channels[ch3], "subscribed 3 channel should be present in payload");
                                                    ok(in_list_deep(response.channels[ch].uuids, { uuid : uuid + '', state : { 'name' : 'name-' + uuid } } ), "uuid should be there in the uuids list");
                                                    ok(in_list_deep(response.channels[ch1].uuids,{ uuid : uuid + '', state : {name : 'name-' + uuid1}}), "uuid 1 should be there in the uuids list");
                                                    ok(in_list_deep(response.channels[ch2].uuids,{ uuid : uuid + '', state : {name : 'name-' + uuid2}}), "uuid 2 should be there in the uuids list");
                                                    ok(in_list_deep(response.channels[ch3].uuids,{ uuid : uuid + '', state : {name : 'name-' + uuid3}}), "uuid 3 should be there in the uuids list");
                                                    deepEqual(response.channels[ch].occupancy,1);
                                                    deepEqual(response.channels[ch1].occupancy,1);
                                                    deepEqual(response.channels[ch2].occupancy,1);
                                                    deepEqual(response.channels[ch3].occupancy,1);
                                                    pubnub_pres.unsubscribe({channel : ch});
                                                    pubnub_pres.unsubscribe({channel : ch1});
                                                    pubnub_pres.unsubscribe({channel : ch2});
                                                    pubnub_pres.unsubscribe({channel : ch3});
                                                    start();
                                                },
                                                error : function(error) {
                                                    ok(false, "Error occurred in subscribe 3");
                                                    start();
                                                }
                                            });
                                        },3000);
                                    },
                                    callback : function(response) {
                                    },
                                    error : function(error) {
                                        ok(false, "Error occurred in subscribe 3");
                                        start();
                                    }
                                })
                            },
                            callback : function(response) {
                            },
                            error : function(error) {
                                ok(false, "Error occurred in subscribe 2");
                                start();
                            }
                        })
                    },
                    callback : function(response) {
                    },
                    error : function(error) {
                        ok(false, "Error occurred in subscribe 1");
                        start();
                    }
                })
            },
            callback : function(response) {
            },
            error : function(error) {
                ok(false, "Error occurred in subscribe");
                start();
            }
        })
    },5000);
})

asyncTest("#here_now() should return correct state for multiple uuids in single channel", function() {
    expect(10);
    var ch = channel + '-' + 'here-now-' + Date.now();

    pubnub_pres.state({
        channel : ch,
        uuid : uuid,
        state : {
            name : 'name-' + uuid
        },
        callback : function(r) {
            JSON.stringify(r);
            ok(true,"Setstate should get success callback");
        },
        error : function(e) {
            ok(false,"Error in setstate")
        }
    });
    pubnub_pres.state({
        channel : ch,
        uuid : uuid1,
        state : {
            name : 'name-' + uuid1
        },
        callback : function(r) {
            JSON.stringify(r);
            ok(true,"Setstate should get success callback");
        },
        error : function(e) {
            ok(false,"Error in setstate")
        }
    });
    pubnub_pres.state({
        channel : ch,
        uuid : uuid2,
        state : {
            name : 'name-' + uuid2
        },
        callback : function(r) {
            JSON.stringify(r);
            ok(true,"Setstate should get success callback");
        },
        error : function(e) {
            ok(false,"Error in setstate")
        }
    });
    pubnub_pres.state({
        channel : ch,
        uuid : uuid3,
        state : {
            name : 'name-' + uuid3
        },
        callback : function(r) {
            JSON.stringify(r);
            ok(true,"Setstate should get success callback");
        },
        error : function(e) {
            ok(false,"Error in setstate")
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
                                                state : true,
                                                callback : function(response) {
                                                    ok(response.channels[ch], "subscribed channel should be present in payload");
                                                    console.log(response.channels[ch]);
                                                    ok(in_list_deep(response.channels[ch].uuids, { uuid : uuid + '', state : { 'name' : 'name-' + uuid } } ), "uuid should be there in the uuids list");
                                                    ok(in_list_deep(response.channels[ch].uuids,{ uuid : uuid1 + '', state : {name : 'name-' + uuid1}}), "uuid 1 should be there in the uuids list");
                                                    ok(in_list_deep(response.channels[ch].uuids,{ uuid : uuid2 + '', state : {name : 'name-' + uuid2}}), "uuid 2 should be there in the uuids list");
                                                    ok(in_list_deep(response.channels[ch].uuids,{ uuid : uuid3 + '', state : {name : 'name-' + uuid3}}), "uuid 3 should be there in the uuids list");
                                                    deepEqual(response.channels[ch].occupancy,4);
                                                    pubnub_pres.unsubscribe({channel : ch});
                                                    pubnub_pres_1.unsubscribe({channel : ch});
                                                    pubnub_pres_2.unsubscribe({channel : ch});
                                                    pubnub_pres_3.unsubscribe({channel : ch});
                                                    start();
                                                },
                                                error : function(error) {
                                                    ok(false, "Error occurred in subscribe 3");
                                                    start();
                                                }
                                            });
                                        },3000);
                                    },
                                    callback : function(response) {
                                    },
                                    error : function(error) {
                                        ok(false, "Error occurred in subscribe 3");
                                        start();
                                    }
                                })
                            },
                            callback : function(response) {
                            },
                            error : function(error) {
                                ok(false, "Error occurred in subscribe 2");
                                start();
                            }
                        })
                    },
                    callback : function(response) {
                    },
                    error : function(error) {
                        ok(false, "Error occurred in subscribe 1");
                        start();
                    }
                })
            },
            callback : function(response) {
            },
            error : function(error) {
                ok(false, "Error occurred in subscribe");
                start();
            }
        })
    },5000);
})
*/
/*
asyncTest("presence heartbeat value validation", function() {
    expect(10);
    var ch = channel + '-pnhb-' + Date.now();

    var pubnub = PUBNUB({
            publish_key   : 'demo',
            subscribe_key : 'demo',
            heartbeat     : 6,
            origin        : 'pubsub.pubnub.com'
    });
    deepEqual(6, pubnub.get_heartbeat());
    pubnub.set_heartbeat(1);
    deepEqual(6, pubnub.get_heartbeat());
    pubnub.set_heartbeat(8);
    deepEqual(8, pubnub.get_heartbeat());
    pubnub.set_heartbeat(0);
    deepEqual(0, pubnub.get_heartbeat());
    pubnub.set_heartbeat(9);
    deepEqual(9, pubnub.get_heartbeat());
    pubnub.set_heartbeat(3);
    deepEqual(9, pubnub.get_heartbeat());

    pubnub.subscribe({
        channel  : 'abcd',
        callback : function(r) {console.log(r);}
    })
    deepEqual(9, pubnub.get_heartbeat());

    pubnub.subscribe({
        channel   : 'abcd1',
        callback  : function(r) {console.log(r);},
        heartbeat : 1
    })
    deepEqual(9, pubnub.get_heartbeat());

    pubnub.subscribe({
        channel   : 'abcd1',
        callback  : function(r) {console.log(r);},
        heartbeat : 7
    })
    deepEqual(7, pubnub.get_heartbeat());

    pubnub.subscribe({
        channel   : 'abcd1',
        callback  : function(r) {console.log(r);},
        heartbeat : 0
    })
    deepEqual(0, pubnub.get_heartbeat());

    start();

})
*/
