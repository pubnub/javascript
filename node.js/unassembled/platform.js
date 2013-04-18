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
var NOW    = 1
,   http   = require('http')
,   https  = require('https')
,   XHRTME = 310000
,   DEF_TIMEOUT     = 10000
,   SECOND          = 1000
,    PNSDK            = 'PubNub-JS-' + PLATFORM + '/' +  VERSION
,   XORIGN = 1;


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
        hostname : origin,
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
    PN = PN_API(setup);
    PN.ready();
    return PN;
}
PUBNUB = exports.init({});
exports.unique = unique
