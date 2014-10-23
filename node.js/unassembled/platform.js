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
var NOW                 = 1
,   http                = require('http')
,   https               = require('https')
,   keepAliveAgent      = new (keepAliveIsEmbedded() ? http.Agent : require('agentkeepalive'))({
                            keepAlive: true,
                            keepAliveMsecs: 300000,
                            maxSockets: 5
                          })
,   XHRTME              = 310000
,   DEF_TIMEOUT         = 10000
,   SECOND              = 1000
,   PNSDK               = 'PubNub-JS-' + PLATFORM + '/' +  VERSION
,   crypto              = require('crypto')
,   proxy               = null
,   XORIGN              = 1;


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
    ,   mode     = setup['mode'] || 'GET'
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

    var options = {};
    var headers = {};
    var payload = '';

    if (mode == 'POST')
        payload = decodeURIComponent(setup.url.pop());

    var url = build_url( setup.url, data );
    if (!ssl) ssl = (url.split('://')[0] == 'https')?true:false;

    url = '/' + url.split('/').slice(3).join('/');

    var origin       = setup.url[0].split("//")[1]

    options.hostname = proxy ? proxy.hostname : setup.url[0].split("//")[1];
    options.port     = proxy ? proxy.port : ssl ? 443 : 80;
    options.path     = proxy ? "http://" + origin + url:url;
    options.headers  = proxy ? { 'Host': origin }:null;
    options.method   = mode;
    options.keepAlive= !!keepAliveAgent;
    //options.agent    = keepAliveAgent;    
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
            store[key] = value;
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
            return JSON.parse(decrypted);
        }
    }
}

function keepAliveIsEmbedded() {
  return 'EventEmitter' in http.Agent.super_;
}


var CREATE_PUBNUB = function(setup) {
    proxy = setup['proxy'];
    setup['xdr'] = xdr;
    setup['db'] = db;
    setup['error'] = setup['error'] || error;
    setup['hmac_SHA256'] = get_hmac_SHA256;
    setup['crypto_obj'] = crypto_obj();
    setup['params'] = {'pnsdk' : PNSDK};

    if (setup['keepAlive'] === false) {
      keepAliveAgent = undefined;
    }

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
    SELF.secure = SELF;
    SELF.ready();
    return SELF;
}
CREATE_PUBNUB.init = CREATE_PUBNUB;

CREATE_PUBNUB.unique = unique
CREATE_PUBNUB.secure = CREATE_PUBNUB;
module.exports = CREATE_PUBNUB
module.exports.PNmessage = PNmessage;
