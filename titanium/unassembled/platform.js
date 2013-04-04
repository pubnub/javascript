/* ---------------------------------------------------------------------------
--------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
PubNub Real-time Cloud-Hosted Push API and Push Notification Client Frameworks
Copyright (c) 2011 PubNub Inc.
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
(function(){

/**
 * UTIL LOCALS
 */
var NOW        = 1
,   URLBIT     = '/'
,   MAGIC   = /\$?{([\w\-]+)}/g
,   PARAMSBIT  = '&'
,   ANDROID = Ti.Platform.name.toLowerCase().indexOf('android') >= 0
,   XHRTME     = 310000;



/**
 * LOCAL STORAGE OR COOKIE
 */
var db = (function(){
    return {
        get : function(key) {
            Ti.App.Properties.getString(''+key);
        },
        set : function( key, value ) {
            Ti.App.Properties.setString( ''+key, ''+value );
        }
    };
})();


/**
 * Titanium TCP Sockets
 * ====================
 *  xdr({
 *     url     : ['http://www.blah.com/url'],
 *     success : function(response) {},
 *     fail    : function() {}
 *  });
 */
function xdr_tcp(setup) {
 
    var url      = setup.url.join(URLBIT);
    if (setup.data) {
        var params = [];
        url += "?";
        for (key in setup.data) {
            params.push(key+"="+setup.data[key]);
        } 
        url += params.join(PARAMSBIT);
    }
    log(url);
    var body     = []
    ,   data     = ""
    ,   rbuffer  = Ti.createBuffer({ length : 2048 })
    ,   wbuffer  = Ti.createBuffer({ value : "GET " + url + " HTTP/1.0\n\n"})
    ,   failed   = 0
    ,   fail     = function() {
            if (failed) return;
            failed = 1;
            (setup.fail || function(){})();
        }
    ,   success  = setup.success || function(){}
    ,   sock     = Ti.Network.Socket.createTCP({
        host      : url.split(URLBIT)[2],
        port      : 80,
        mode      : Ti.Network.READ_WRITE_MODE,
        timeout   : XHRTME,
        error     : fail,
        connected : function() {
            sock.write(wbuffer);
            read();
        }
    });

    function read() {
        Ti.Stream.read( sock, rbuffer, function(stream) { 
            if (+stream.bytesProcessed > -1) {
                data = Ti.Codec.decodeString({
                    source : rbuffer,
                    length : +stream.bytesProcessed
                });

                body.push(data);
                rbuffer.clear();

                return timeout( read, 1 );
            }

            try {
                data = JSON['parse'](
                    body.join('').split('\r\n').slice(-1)
                );
            }
            catch (r) { 
                return fail();
            }

            sock.close();
            success(data);
        } );
    }
 
    try      { sock.connect() }
    catch(k) { return fail()  }
}

/**
 * Titanium XHR Request 
 * ==============================
 *  xdr({
 *     url     : ['http://www.blah.com/url'],
 *     success : function(response) {},
 *     fail    : function() {}
 *  });
 */
function xdr_http_client( setup ) {

    var url = setup.url.join(URLBIT);
    if (setup.data) {
        var params = [];
        url += "?";
        for (key in setup.data) {
            params.push(key+"="+setup.data[key]);
        } 
        url += params.join(PARAMSBIT);
    }
    var xhr
    ,   finished = function() {
            if (loaded) return;
                loaded = 1;

            clearTimeout(timer);

            try       { response = JSON['parse'](xhr.responseText); }
            catch (r) { return done(1); }

            success(response);
        }
    ,   complete = 0
    ,   loaded   = 0
    ,   timer    = timeout( function(){done(1)}, XHRTME )
    ,   fail     = setup.fail    || function(){}
    ,   success  = setup.success || function(){}
    ,   done     = function(failed) {
            if (complete) return;
                complete = 1;

            clearTimeout(timer);

            if (xhr) {
                xhr.onerror = xhr.onload = null;
                xhr.abort && xhr.abort();
                xhr = null;
            }

            failed && fail();
        };

    // Send
    try {
        xhr         = Ti.Network.createHTTPClient();
        xhr.onerror = function(){ done(1) };
        xhr.onload  = finished;
        xhr.timeout = XHRTME;

        xhr.open( 'GET', url, true );
        xhr.send();
    }
    catch(eee) {
        done(0);
        return xdr(setup);
    }

    // Return 'done'
    return done;
}

/**
 * BIND
 * ====
 * bind( 'keydown', search('a')[0], function(element) {
 *     ...
 * } );
 */
function bind( type, el, fun ) {
    each( type.split(','), function(etype) {
        var rapfun = function(e) {
            if (!e) e = window.event;
            if (!fun(e)) {
                e.cancelBubble = true;
                e.returnValue  = false;
                e.preventDefault && e.preventDefault();
                e.stopPropagation && e.stopPropagation();
            }
        };

        if ( el.addEventListener ) el.addEventListener( etype, rapfun, false );
        else if ( el.attachEvent ) el.attachEvent( 'on' + etype, rapfun );
        else  el[ 'on' + etype ] = rapfun;
    } );
}

/**
 * UNBIND
 * ======
 * unbind( 'keydown', search('a')[0] );
 */
function unbind( type, el, fun ) {
    if ( el.removeEventListener ) el.removeEventListener( type, false );
    else if ( el.detachEvent ) el.detachEvent( 'on' + type, false );
    else  el[ 'on' + type ] = null;
}

/**
 * LOG
 * ===
 * var list = grep( [1,2,3], function(item) { return item % 2 } )
 */
var log = function(){};

/**
 * EVENTS
 * ======
 * PUBNUB.events.bind( 'you-stepped-on-flower', function(message) {
 *     // Do Stuff with message
 * } );
 *
 * PUBNUB.events.fire( 'you-stepped-on-flower', "message-data" );
 * PUBNUB.events.fire( 'you-stepped-on-flower', {message:"data"} );
 * PUBNUB.events.fire( 'you-stepped-on-flower', [1,2,3] );
 *
 */
var events = {
    'list'   : {},
    'unbind' : function( name ) { events.list[name] = [] },
    'bind'   : function( name, fun ) {
        (events.list[name] = events.list[name] || []).push(fun);
    },
    'fire' : function( name, data ) {
        each(
            events.list[name] || [],
            function(fun) { fun(data) }
        );
    }
};

/* =-====================================================================-= */
/* =-====================================================================-= */
/* =-=========================     PUBNUB     ===========================-= */
/* =-====================================================================-= */
/* =-====================================================================-= */

function PN(setup) {


    setup['db'] = db;
    setup['xdr'] = setup['native_tcp_socket'] ? xdr_tcp : xdr_http_client
    var SELF = PN_API(setup);

    SELF['init'] = PN;

    
    // Return without Testing 
    if (setup['notest']) return SELF;
    
	SELF['ready']();
    return SELF;
}

typeof module  !== 'undefined' && (module.exports = PN) ||
typeof exports !== 'undefined' && (exports.PN = PN)     || (PUBNUB = PN);

})();
