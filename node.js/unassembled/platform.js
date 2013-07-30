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
    ,   done    = function(failed) {
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
            failed && fail();
        }
        ,   timer  = timeout( function(){done(1);} , xhrtme );

    data['pnsdk'] = PNSDK;
    var url = build_url(setup.url, data);

    var options = {
        hostname : setup.url[0].split("//")[1],
        port : ssl ? 443 : 80,
        path : url,
        method : 'GET'
    };
    try {
        request = (ssl ? https : http).request(options, function(response) {
            response.setEncoding('utf8');
            response.on( 'error', function(){done(1)});
            response.on( 'abort', function(){done(1)});
            response.on( 'data', function (chunk) {
                if (chunk) body += chunk;
            } );
            response.on( 'end', function(){finished();});
        });
        request.end();
        request.timeout = xhrtme;

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

/* =-=====================================================================-= */
/* =-=====================================================================-= */
/* =-=========================     PUBNUB     ============================-= */
/* =-=====================================================================-= */
/* =-=====================================================================-= */

exports.init = function(setup) {
    var PN = {};
    setup['xdr'] = xdr;
    setup['db'] = db;
    setup['error'] = error;
    setup['PNSDK'] = PNSDK;
    setup['hmac_SHA256'] = get_hmac_SHA256;
    PN = PN_API(setup);
    PN.ready();
    return PN;
}
PUBNUB = exports.init({});

exports.secure = function(setup) {
    var iv = "0123456789012345";
    var cipher_key = setup['cipher_key'];
    var padded_cipher_key = crypto.createHash('sha256').update(cipher_key).digest("hex").slice(0,32);
    var pubnub = exports.init(setup);

    function encrypt(data) {
        var plain_text = JSON.stringify(data);
        var cipher = crypto.createCipheriv('aes-256-cbc', padded_cipher_key, iv);
        var base_64_encrypted = cipher.update(plain_text, 'utf8', 'base64') + cipher.final('base64');
        return base_64_encrypted || data;
    }
    function decrypt(data) {
        var decipher = crypto.createDecipheriv('aes-256-cbc', padded_cipher_key, iv);
        var decrypted = decipher.update(data, 'base64', 'utf8') + decipher.final('utf8');
        return JSON.parse(decrypted);
    }

    SELF =
    {
        raw_encrypt : encrypt,
        raw_decrypt : decrypt,
        ready       : pubnub.ready,
        time        : PUBNUB.time,
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
                decrypted && callback(decrypted, envelope, channel);
            }
            return pubnub.subscribe(args);
        },
        history     : function (args) {
            var encrypted_messages = "";
            var old_callback = args.callback;

            function new_callback(response) {
                encrypted_messages     = response[0];
                var decrypted_messages = [];

                for (a = 0; a < encrypted_messages.length; a++) {
                    var new_message = decrypt( encrypted_messages[a], {
                        "parse_error":"DECRYPT_ERROR"
                    } );
                    decrypted_messages.push((new_message));
                }

                old_callback([
                    decrypted_messages,
                    response[1],
                    response[2]
                ]);
            }

            args.callback = new_callback;
            pubnub.history(args);
            return true;
        }
    };
    return SELF;
}
exports.unique = unique
