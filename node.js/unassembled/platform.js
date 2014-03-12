/* ---------------------------------------------------------------------------
WAIT! - This file depends on instructions from the PUBNUB Cloud.
http://www.pubnub.com/account
--------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
PubNub Real-time Cloud-Hosted Push API and Push Notification Client Frameworks
Copyright (c) 2011 TopMambo Inc.
http://www.pubnub.com/
http://www.pubnub.com/terms
--------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
--------------------------------------------------------------------------- */
/**
 * UTIL LOCALS
 */
var NOW                = 1
,   http               = require('http')
,   https              = require('https')
,   XHRTME             = 310000
,   DEF_TIMEOUT     = 10000
,   SECOND          = 1000
,   PNSDK           = 'PubNub-JS-' + PLATFORM + '/' +  VERSION
,   crypto           = require('crypto')
,   XORIGN             = 1;


function get_hmac_SHA256(data, key) {
    return crypto.createHmac('sha256',
                    new Buffer(key, 'utf8')).update(data).digest('base64');
}


/**
 * ERROR
 * ===
 * error('message');
 */
function error(message) { console['error'](message) }

/**
 * Request
 * =======
 *  xdr({
 *     url     : ['http://www.blah.com/url'],
 *     success : function(response) {},
 *     fail    : function() {}
 *  });
 */
function xdr( setup ) {
    var request
    ,   response
    ,   success  = setup.success || function(){}
    ,   fail     = setup.fail    || function(){}
    ,   origin   = setup.origin || 'pubsub.pubnub.com'
    ,   ssl      = setup.ssl
    ,   failed   = 0
    ,   complete = 0
    ,   loaded   = 0
    ,   data     = setup['data'] || {}
    ,   xhrtme   = setup.timeout || DEF_TIMEOUT
    ,   body = ''
    ,   finished = function() {
            if (loaded) return;
                loaded = 1;

            clearTimeout(timer);
            try       { response = JSON['parse'](body); }
            catch (r) { return done(1); }
            success(response);
        }
    ,   done    = function(failed, response) {
            if (complete) return;
                complete = 1;

            clearTimeout(timer);

            if (request) {
                request.on('error', function(){});
                request.on('data', function(){});
                request.on('end', function(){});
                request.abort && request.abort();
                request = null;
            }
            failed && fail(response);
        }
        ,   timer  = timeout( function(){done(1);} , xhrtme );

    data['pnsdk'] = PNSDK;

    var publish = setup.url[1] === 'publish';
    var mode    = publish ? 'POST' : 'GET';
    var options = {};
    var headers = {};
    var payload = '';

    if (publish && mode == 'POST')
        payload = decodeURIComponent(setup.url.pop());

    var url = build_url( setup.url, data );
    url = '/' + url.split('/').slice(3).join('/');

    options.hostname = setup.url[0].split("//")[1];
    options.port     = ssl ? 443 : 80;
    options.path     = url;
    options.method   = mode;
    options.agent    = false;
    options.body     = payload;


    require('http').globalAgent.maxSockets = Infinity;
    try {
        request = (ssl ? https : http)['request'](options, function(response) {
            response.setEncoding('utf8');
            response.on( 'error', function(){done(1, body || { "error" : "Network Connection Error"})});
            response.on( 'abort', function(){done(1, body || { "error" : "Network Connection Error"})});
            response.on( 'data', function (chunk) {
                if (chunk) body += chunk;
            } );
            response.on( 'end', function(){
                var statusCode = response.statusCode;

                switch(statusCode) {
                    case 401:
                    case 402:
                    case 403:
                        try {
                            response = JSON['parse'](body);
                            done(1,response);
                        }
                        catch (r) { return done(1, body); }
                        return;
                    default:
                        break;
                }

                finished();
            });
        });
        request.timeout = xhrtme;
        request.on( 'error', function() {
            done( 1, {"error":"Network Connection Error"} );
        } );

        if (mode == 'POST') request.write(payload);
        request.end();

    } catch(e) {
        done(0);
        return xdr(setup);
    }

    return done;
}

/**
 * LOCAL STORAGE
 */
var db = (function(){
    var store = {};
    return {
        'get' : function(key) {
            return store[key];
        },
        'set' : function( key, value ) {
            db[key] = value;
        }
    };
})();

function crypto_obj() {
    var iv = "0123456789012345";
    function get_padded_key(key) {
        return crypto.createHash('sha256').update(key).digest("hex").slice(0,32);
    }

    return {
        'encrypt' : function(input, key) {
            if (!key) return input;
            var plain_text = JSON['stringify'](input);
            var cipher = crypto.createCipheriv('aes-256-cbc', get_padded_key(key), iv);
            var base_64_encrypted = cipher.update(plain_text, 'utf8', 'base64') + cipher.final('base64');
            return base_64_encrypted || input;
        },
        'decrypt' : function(input, key) {
            if (!key) return input;
            var decipher = crypto.createDecipheriv('aes-256-cbc', get_padded_key(key), iv);
            try {
                var decrypted = decipher.update(input, 'base64', 'utf8') + decipher.final('utf8');
            } catch (e) {
                return null;
            }
            return decrypted;
        }
    }
}

/* =-=====================================================================-= */
/* =-=====================================================================-= */
/* =-=========================     PUBNUB     ============================-= */
/* =-=====================================================================-= */
/* =-=====================================================================-= */
var secure = function(setup) {
    var iv = "0123456789012345";
    var cipher_key = setup['cipher_key'];
    var padded_cipher_key = crypto.createHash('sha256').update(cipher_key).digest("hex").slice(0,32);
    var pubnub = CREATE_PUBNUB(setup);

    function encrypt(data) {
        var plain_text = JSON.stringify(data);
        var cipher = crypto.createCipheriv('aes-256-cbc', padded_cipher_key, iv);
        var base_64_encrypted = cipher.update(plain_text, 'utf8', 'base64') + cipher.final('base64');
        return base_64_encrypted || data;
    }
    function decrypt(data) {
        var decipher = crypto.createDecipheriv('aes-256-cbc', padded_cipher_key, iv);
        try {
            var decrypted = decipher.update(data, 'base64', 'utf8') + decipher.final('utf8');
        } catch (e) {
            return null;
        }

        return JSON.parse(decrypted);
    }

    SELF =
    {
        raw_encrypt : encrypt,
        raw_decrypt : decrypt,
        ready       : pubnub.ready,
        time        : pubnub.time,
        publish     : function (args) {
            args.message = encrypt(args.message);
            return pubnub.publish(args);
        },
        unsubscribe : function (args) {
            return pubnub.unsubscribe(args);
        },
        subscribe   : function (args) {
            var callback = args.callback || args.message;
            args.callback = function (message, envelope, channel) {
                var decrypted = decrypt(message);
                if(decrypted) {
                    callback(decrypted, envelope, channel);
                } else {
                    args.error && args.error({"error":"DECRYPT_ERROR", "message" : message});
                }
            }
            return pubnub.subscribe(args);
        },
        history     : function (args) {
            var encrypted_messages = "";
            var old_callback = args.callback;
            var error_callback = args.error;

            function new_callback(response) {
                encrypted_messages     = response[0];
                var decrypted_messages = [];
                var decrypted_error_messages = [];
                var a;
                for (a = 0; a < encrypted_messages.length; a++) {
                    var new_message = decrypt( encrypted_messages[a]);
                    if(new_message) {
                        decrypted_messages.push((new_message));
                    } else {
                        decrypted_error_messages.push({"error":"DECRYPT_ERROR", "message" : encrypted_messages[a]});
                    }

                }

                old_callback([
                    decrypted_messages,
                    response[1],
                    response[2]
                ]);
                error_callback && error_callback([
                    decrypted_error_messages,
                    response[1],
                    response[2]
                ]);
            }

            args.callback = new_callback;
            pubnub.history(args);
            return true;
        }
    };
    SELF.secure = secure;
    SELF.init = CREATE_PUBNUB;
    return SELF;
}

var CREATE_PUBNUB = function(setup) {
    setup['xdr'] = xdr;
    setup['db'] = db;
    setup['error'] = setup['error'] || error;
    setup['PNSDK'] = PNSDK;
    setup['hmac_SHA256'] = get_hmac_SHA256;
    setup['crypto_obj'] = crypto_obj();
    SELF = function(setup) {
        return CREATE_PUBNUB(setup);
    }
    var PN = PN_API(setup);
    for (var prop in PN) {
        if (PN.hasOwnProperty(prop)) {
            SELF[prop] = PN[prop];
        }
    }
    SELF.init = SELF;
    SELF.secure = secure;
    SELF.ready();
    return SELF;
}
CREATE_PUBNUB.init = CREATE_PUBNUB;

CREATE_PUBNUB.unique = unique
CREATE_PUBNUB.secure = secure
module.exports = CREATE_PUBNUB
