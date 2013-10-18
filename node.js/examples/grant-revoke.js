/* ---------------------------------------------------------------------------
Init Supervisor Client
--------------------------------------------------------------------------- */
var PUBNUB     = require("./../pubnub.js")
,   auth_key   = 'NzVqS3NsMmJOZGtsM2pzbEhEamxrczNnamFrbHM'
,   channel    = 'mychannel'
,   pubnub     = PUBNUB.init({
    publish_key   : 'pub-c-a2650a22-deb1-44f5-aa87-1517049411d5',
    subscribe_key : 'sub-c-a478dd2a-c33d-11e2-883f-02ee2ddab7fe',
    secret_key    : 'sec-c-YjFmNzYzMGMtYmI3NC00NzJkLTlkYzYtY2MwMzI4YTJhNDVh'
});

/* ---------------------------------------------------------------------------
 - Main - 
--------------------------------------------------------------------------- */
grant(open_stream_listen);

/* ---------------------------------------------------------------------------
Open Stream Listener.
--------------------------------------------------------------------------- */
function open_stream_listen(cb) {
    log('connecting');
    pubnub.auth(auth_key);
    pubnub.subscribe({
        channel  : channel,
        callback : stream_receiver,
        connect  : client_test_grant
    });
}


/* ---------------------------------------------------------------------------
Client Test - Access Granted
--------------------------------------------------------------------------- */
function client_test_grant() {
    log('client_test: granted');
    pubnub.publish({
        channel  : channel,
        message  : 'test-data',
        callback : revoke
    });
}

/* ---------------------------------------------------------------------------
Client Test - Access Denied
--------------------------------------------------------------------------- */
function client_test_deny() {
    log('client_test: denied');
    pubnub.publish({
        channel  : 'foo',
        message  : 'test-data',
        error    : stream_receiver
    });
}

/* ---------------------------------------------------------------------------
Grant
--------------------------------------------------------------------------- */
function grant(cb) {
    log('grant');
    pubnub.grant({
        channel  : channel,
        auth_key : auth_key,
        ttl      : 300,
        read     : true,
        write    : true,
        callback : cb
    });
}

/* ---------------------------------------------------------------------------
Revoke
--------------------------------------------------------------------------- */
function revoke(cb) {
    log('revoke');
    pubnub.revoke({
        channel  : channel,
        auth_key : auth_key,
        callback : client_test_deny
    });
}

/* ---------------------------------------------------------------------------
Stream Receiver
--------------------------------------------------------------------------- */
function log(d) { console.log(d) }
function stream_receiver(message) { log( " > " + JSON.stringify(message) ) }
