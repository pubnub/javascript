// Version: 3.5.3
/* =-====================================================================-= */
/* =-====================================================================-= */
/* =-=========================     JSON     =============================-= */
/* =-====================================================================-= */
/* =-====================================================================-= */

(window['JSON'] && window['JSON']['stringify']) || (function () {
    window['JSON'] || (window['JSON'] = {});

    function toJSON(key) {
        try      { return this.valueOf() }
        catch(e) { return null }
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }

    function str(key, holder) {
        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            partial,
            mind  = gap,
            value = holder[key];

        if (value && typeof value === 'object') {
            value = toJSON.call( value, key );
        }

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':
            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':
            return String(value);

        case 'object':

            if (!value) {
                return 'null';
            }

            gap += indent;
            partial = [];

            if (Object.prototype.toString.apply(value) === '[object Array]') {

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }
            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {
                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

    if (typeof JSON['stringify'] !== 'function') {
        JSON['stringify'] = function (value, replacer, space) {
            var i;
            gap = '';
            indent = '';

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
            } else if (typeof space === 'string') {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
            return str('', {'': value});
        };
    }

    if (typeof JSON['parse'] !== 'function') {
        // JSON is parsed on the server for security.
        JSON['parse'] = function (text) {return eval('('+text+')')};
    }
}());
var NOW             = 1
,   READY           = false
,   READY_BUFFER    = []
,   PRESENCE_SUFFIX = '-pnpres'
,   DEF_WINDOWING   = 10     // MILLISECONDS.
,   DEF_TIMEOUT     = 10000  // MILLISECONDS.
,   DEF_SUB_TIMEOUT = 310    // SECONDS.
,   DEF_KEEPALIVE   = 60     // SECONDS.
,   SECOND          = 1000   // A THOUSAND MILLISECONDS.
,   URLBIT          = '/'
,   PARAMSBIT       = '&'
,   REPL            = /{([\w\-]+)}/g;

/**
 * UTILITIES
 */
function unique() { return'x'+ ++NOW+''+(+new Date) }
function rnow()   { return+new Date }

/**
 * NEXTORIGIN
 * ==========
 * var next_origin = nextorigin();
 */
var nextorigin = (function() {
    var max = 20
    ,   ori = Math.floor(Math.random() * max);
    return function( origin, failover ) {
        return origin.indexOf('pubsub.') > 0
            && origin.replace(
             'pubsub', 'ps' + (
                failover ? uuid().split('-')[0] :
                (++ori < max? ori : ori=1)
            ) ) || origin;
    }
})();


/**
 * Build Url
 * =======
 *
 */
function build_url( url_components, url_params ) {
    var url    = url_components.join(URLBIT)
    ,   params = [];

    if (!url_params) return url;

    each( url_params, function( key, value ) {
         params.push(key + "=" + encode(value));
    } );

    url += "?" + params.join(PARAMSBIT);

    return url;
}

/**
 * UPDATER
 * =======
 * var timestamp = unique();
 */
function updater( fun, rate ) {
    var timeout
    ,   last   = 0
    ,   runnit = function() {
        if (last + rate > rnow()) {
            clearTimeout(timeout);
            timeout = setTimeout( runnit, rate );
        }
        else {
            last = rnow();
            fun();
        }
    };

    return runnit;
}

/**
 * GREP
 * ====
 * var list = grep( [1,2,3], function(item) { return item % 2 } )
 */
function grep( list, fun ) {
    var fin = [];
    each( list || [], function(l) { fun(l) && fin.push(l) } );
    return fin
}

/**
 * SUPPLANT
 * ========
 * var text = supplant( 'Hello {name}!', { name : 'John' } )
 */
function supplant( str, values ) {
    return str.replace( REPL, function( _, match ) {
        return values[match] || _
    } );
}

/**
 * timeout
 * =======
 * timeout( function(){}, 100 );
 */
function timeout( fun, wait ) {
    return setTimeout( fun, wait );
}

/**
 * uuid
 * ====
 * var my_uuid = uuid();
 */
function uuid(callback) {
    var u = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
    function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
    if (callback) callback(u);
    return u;
}

/**
 * EACH
 * ====
 * each( [1,2,3], function(item) { } )
 */
function each( o, f ) {
    if ( !o || !f ) return;

    if ( typeof o[0] != 'undefined' )
        for ( var i = 0, l = o.length; i < l; )
            f.call( o[i], o[i], i++ );
    else
        for ( var i in o )
            o.hasOwnProperty    &&
            o.hasOwnProperty(i) &&
            f.call( o[i], i, o[i] );
}

/**
 * MAP
 * ===
 * var list = map( [1,2,3], function(item) { return item + 1 } )
 */
function map( list, fun ) {
    var fin = [];
    each( list || [], function( k, v ) { fin.push(fun( k, v )) } );
    return fin;
}

/**
 * ENCODE
 * ======
 * var encoded_path = encode('path');
 */
function encode(path) {
    return map( (encodeURIComponent(path)).split(''), function(chr) {
        return "-_.!~*'()".indexOf(chr) < 0 ? chr :
               "%"+chr.charCodeAt(0).toString(16).toUpperCase()
    } ).join('');
}

/**
 * Generate Subscription Channel List
 * ==================================
 * generate_channel_list(channels_object);
 */
function generate_channel_list(channels) {
    var list = [];
    each( channels, function( channel, status ) {
        if (status.subscribed) list.push(channel);
    } );
    return list.sort();
}

// PUBNUB READY TO CONNECT
function ready() { timeout( function() {
    if (READY) return;
    READY = 1;
    each( READY_BUFFER, function(connect) { connect() } );
}, SECOND ); }

function PN_API(setup) {
    var SUB_WINDOWING =  +setup['windowing']   || DEF_WINDOWING
    ,   SUB_TIMEOUT   = (+setup['timeout']     || DEF_SUB_TIMEOUT) * SECOND
    ,   KEEPALIVE     = (+setup['keepalive']   || DEF_KEEPALIVE)   * SECOND
    ,   PUBLISH_KEY   = setup['publish_key']   || ''
    ,   SUBSCRIBE_KEY = setup['subscribe_key'] || ''
    ,   AUTH_KEY      = setup['auth_key']      || ''
    ,   SSL           = setup['ssl']            ? 's' : ''
    ,   ORIGIN        = 'http'+SSL+'://'+(setup['origin']||'pubsub.pubnub.com')
    ,   STD_ORIGIN    = nextorigin(ORIGIN)
    ,   SUB_ORIGIN    = nextorigin(ORIGIN)
    ,   CONNECT       = function(){}
    ,   PUB_QUEUE     = []
    ,   SUB_CALLBACK  = 0
    ,   SUB_CHANNEL   = 0
    ,   SUB_RECEIVER  = 0
    ,   SUB_RESTORE   = 0
    ,   SUB_BUFF_WAIT = 0
    ,   TIMETOKEN     = 0
    ,   CHANNELS      = {}
    ,   xdr           = setup['xdr']
    ,   error         = setup['error']      || function() {}
    ,   _is_online    = setup['_is_online'] || function() { return 1 }
    ,   jsonp_cb      = setup['jsonp_cb']   || function() { return 0 }
    ,   db            = setup['db']         || {'get': function(){}, 'set': function(){}}
    ,   UUID          = setup['uuid']       || ( db && db['get'](SUBSCRIBE_KEY+'uuid') || '');

    function publish(next) {
        if (next) PUB_QUEUE.sending = 0;
        if (PUB_QUEUE.sending || !PUB_QUEUE.length) return;
        PUB_QUEUE.sending = 1;
        xdr(PUB_QUEUE.shift());
    }

    function each_channel(callback) {
        var count = 0;

        each( generate_channel_list(CHANNELS), function(channel) {
            var chan = CHANNELS[channel];

            if (!chan) return;

            count++;
            (callback||function(){})(chan);
        } );

        return count;
    }

    // Announce Leave Event
    var SELF = {
        'LEAVE' : function( channel, blocking ) {
            var data   = { 'uuid' : UUID, 'auth' : AUTH_KEY }
            ,   origin = nextorigin(ORIGIN)
            ,   jsonp  = jsonp_cb();

            // Prevent Leaving a Presence Channel
            if (channel.indexOf(PRESENCE_SUFFIX) > 0) return;

            if (jsonp != '0') data['callback'] = jsonp;

            xdr({
                blocking : blocking || SSL,
                timeout  : 2000,
                callback : jsonp,
                data     : data,
                url      : [
                    origin, 'v2', 'presence', 'sub_key',
                    SUBSCRIBE_KEY, 'channel', encode(channel), 'leave'
                ]
            });
        },
        /*
            PUBNUB.history({
                channel  : 'my_chat_channel',
                limit    : 100,
                callback : function(history) { }
            });
        */
        'history' : function( args, callback ) {
            var callback = args['callback'] || callback
            ,   count    = args['count']    || args['limit'] || 100
            ,   reverse  = args['reverse']  || "false"
            ,   err      = args['error']    || function(){}
            ,   channel  = args['channel']
            ,   start    = args['start']
            ,   end      = args['end']
            ,   params   = {}
            ,   jsonp    = jsonp_cb();

            // Make sure we have a Channel
            if (!channel)       return error('Missing Channel');
            if (!callback)      return error('Missing Callback');
            if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

            params['stringtoken'] = 'true';
            params['count']       = count;
            params['reverse']     = reverse;
            params['auth']        = AUTH_KEY;

            if (jsonp) params['callback'] = jsonp;
            if (start) params['start']    = start;
            if (end)   params['end']      = end;

            // Send Message
            xdr({
                callback : jsonp,
                data     : params,
                success  : function(response) { callback(response) },
                fail     : err,
                url      : [
                    STD_ORIGIN, 'v2', 'history', 'sub-key',
                    SUBSCRIBE_KEY, 'channel', encode(channel)
                ]
            });
        },

        /*
            PUBNUB.replay({
                source      : 'my_channel',
                destination : 'new_channel'
            });
        */
        'replay' : function(args) {
            var callback    = callback || args['callback'] || function(){}
            ,   source      = args['source']
            ,   destination = args['destination']
            ,   stop        = args['stop']
            ,   start       = args['start']
            ,   end         = args['end']
            ,   reverse     = args['reverse']
            ,   limit       = args['limit']
            ,   jsonp       = jsonp_cb()
            ,   data        = {}
            ,   url;

            // Check User Input
            if (!source)        return error('Missing Source Channel');
            if (!destination)   return error('Missing Destination Channel');
            if (!PUBLISH_KEY)   return error('Missing Publish Key');
            if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

            // Setup URL Params
            if (jsonp != '0') data['callback'] = jsonp;
            if (stop)         data['stop']     = 'all';
            if (reverse)      data['reverse']  = 'true';
            if (start)        data['start']    = start;
            if (end)          data['end']      = end;
            if (limit)        data['count']    = limit;

            data['auth'] = AUTH_KEY;

            // Compose URL Parts
            url = [
                STD_ORIGIN, 'v1', 'replay',
                PUBLISH_KEY, SUBSCRIBE_KEY,
                source, destination
            ];

            // Start (or Stop) Replay!
            xdr({
                callback : jsonp,
                success  : function(response) { callback(response) },
                fail     : function() { callback([ 0, 'Disconnected' ]) },
                url      : url,
                data     : data
            });
        },

        /*
            PUBNUB.auth('AJFLKAJSDKLA');
        */
        'auth' : function(auth) {
            AUTH_KEY = auth;
            CONNECT();
        },

        /*
            PUBNUB.time(function(time){ });
        */
        'time' : function(callback) {
            var jsonp = jsonp_cb();
            xdr({
                callback : jsonp,
                data     : { 'uuid' : UUID, 'auth' : AUTH_KEY },
                timeout  : SECOND * 5,
                url      : [STD_ORIGIN, 'time', jsonp],
                success  : function(response) { callback(response[0]) },
                fail     : function() { callback(0) }
            });
        },

        /*
            PUBNUB.publish({
                channel : 'my_chat_channel',
                message : 'hello!'
            });
        */
        'publish' : function( args, callback ) {
            var callback = callback || args['callback'] || function(){}
            ,   msg      = args['message']
            ,   channel  = args['channel']
            ,   jsonp    = jsonp_cb()
            ,   url;

            if (!msg)           return error('Missing Message');
            if (!channel)       return error('Missing Channel');
            if (!PUBLISH_KEY)   return error('Missing Publish Key');
            if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

            // If trying to send Object
            msg = JSON['stringify'](msg);

            // Create URL
            url = [
                STD_ORIGIN, 'publish',
                PUBLISH_KEY, SUBSCRIBE_KEY,
                0, encode(channel),
                jsonp, encode(msg)
            ];

            // Queue Message Send
            PUB_QUEUE.push({
                callback : jsonp,
                timeout  : SECOND * 5,
                url      : url,
                data     : { 'uuid' : UUID, 'auth' : AUTH_KEY },
                success  : function(response){callback(response);publish(1)},
                fail     : function(){callback([0,'Failed',msg]);publish(1)}
            });

            // Send Message
            publish();
        },

        /*
            PUBNUB.unsubscribe({ channel : 'my_chat' });
        */
        'unsubscribe' : function(args) {
            var channel = args['channel'];

            TIMETOKEN   = 0;
            SUB_RESTORE = 1;

            // Prepare Channel(s)
            channel = map( (
                channel.join ? channel.join(',') : ''+channel
            ).split(','), function(channel) {
                return channel + ',' + channel + PRESENCE_SUFFIX;
            } ).join(',');

            // Iterate over Channels
            each( channel.split(','), function(channel) {
                if (READY) SELF['LEAVE']( channel, 0 );
                CHANNELS[channel] = 0;
            } );

            // Reset Connection if Count Less
            //if (each_channel() < 2)
            CONNECT();
        },

        /*
            PUBNUB.subscribe({
                channel  : 'my_chat'
                callback : function(message) { }
            });
        */
        'subscribe' : function( args, callback ) {
            var channel       = args['channel']
            ,   callback      = callback            || args['callback']
            ,   callback      = callback            || args['message']
            ,   connect       = args['connect']     || function(){}
            ,   reconnect     = args['reconnect']   || function(){}
            ,   disconnect    = args['disconnect']  || function(){}
            ,   errcb         = args['error']       || function(){}
            ,   presence      = args['presence']    || 0
            ,   noheresync    = args['noheresync']  || 0
            ,   backfill      = args['backfill']    || 0
            ,   timetoken     = args['timetoken']   || 0
            ,   sub_timeout   = args['timeout']     || SUB_TIMEOUT
            ,   windowing     = args['windowing']   || SUB_WINDOWING
            ,   restore       = args['restore'];

            // Restore Enabled?
            SUB_RESTORE = restore;

            // Always Reset the TT
            TIMETOKEN = timetoken;

            // Make sure we have a Channel
            if (!channel)       return error('Missing Channel');
            if (!callback)      return error('Missing Callback');
            if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

            // Setup Channel(s)
            each( (channel.join ? channel.join(',') : ''+channel).split(','),
            function(channel) {
                var settings = CHANNELS[channel] || {};

                // Store Channel State
                CHANNELS[SUB_CHANNEL = channel] = {
                    name         : channel,
                    connected    : settings.connected,
                    disconnected : settings.disconnected,
                    subscribed   : 1,
                    callback     : SUB_CALLBACK = callback,
                    connect      : connect,
                    disconnect   : disconnect,
                    reconnect    : reconnect
                };

                // Presence Enabled?
                if (!presence) return;

                // Subscribe Presence Channel
                SELF['subscribe']({
                    'channel'  : channel + PRESENCE_SUFFIX,
                    'callback' : presence
                });

                // Presence Subscribed?
                if (settings.subscribed) return;

                // See Who's Here Now?
                if (noheresync) return;
                SELF['here_now']({
                    'channel'  : channel,
                    'callback' : function(here) {
                        each( 'uuids' in here ? here['uuids'] : [],
                        function(uid) { presence( {
                            'action'    : 'join',
                            'uuid'      : uid,
                            'timestamp' : rnow(),
                            'occupancy' : here['occupancy'] || 1
                        }, here, channel ); } );
                    }
                });
            } );

            // Test Network Connection
            function _test_connection(success) {
                if (success) {
                    // Begin Next Socket Connection
                    timeout( CONNECT, SECOND );
                }
                else {
                    // New Origin on Failed Connection
                    STD_ORIGIN = nextorigin( ORIGIN, 1 );
                    SUB_ORIGIN = nextorigin( ORIGIN, 1 );

                    // Re-test Connection
                    timeout( function() {
                        SELF['time'](_test_connection);
                    }, SECOND );
                }

                // Disconnect & Reconnect
                each_channel(function(channel){
                    // Reconnect
                    if (success && channel.disconnected) {
                        channel.disconnected = 0;
                        return channel.reconnect(channel.name);
                    }

                    // Disconnect
                    if (!success && !channel.disconnected) {
                        channel.disconnected = 1;
                        channel.disconnect(channel.name);
                    }
                });
            }

            // Evented Subscribe
            function _connect() {
                var jsonp    = jsonp_cb()
                ,   channels = generate_channel_list(CHANNELS).join(',');

                // Stop Connection
                if (!channels) return;

                // Connect to PubNub Subscribe Servers
                _reset_offline();
                SUB_RECEIVER = xdr({
                    timeout  : sub_timeout,
                    callback : jsonp,
                    fail     : function() { 
                        SUB_RECEIVER = null;
                        SELF['time'](_test_connection);
                    },
                    data     : { 'uuid' : UUID, 'auth' : AUTH_KEY },
                    url      : [
                        SUB_ORIGIN, 'subscribe',
                        SUBSCRIBE_KEY, encode(channels),
                        jsonp, TIMETOKEN
                    ],
                    success : function(messages) {
                        SUB_RECEIVER = null;

                        // Check for Errors
                        if (!messages || (
                            typeof messages == 'object' &&
                            'error' in messages         &&
                            !messages['error'])
                        ) {
                            errcb(messages);
                            return timeout( CONNECT, windowing );
                        }

                        // Restore Previous Connection Point if Needed
                        TIMETOKEN = !TIMETOKEN               &&
                                    SUB_RESTORE              &&
                                    db['get'](SUBSCRIBE_KEY) || messages[1];

                        // Connect
                        each_channel(function(channel){
                            if (channel.connected) return;
                            channel.connected = 1;
                            channel.connect(channel.name);
                        });

                        // Invoke Memory Catchup and Receive Up to 100
                        // Previous Messages from the Queue.
                        if (backfill) {
                            TIMETOKEN = 10000;
                            backfill  = 0;
                        }

                        // Update Saved Timetoken
                        db['set']( SUBSCRIBE_KEY, messages[1] );

                        // Route Channel <---> Callback for Message
                        var next_callback = (function() {
                            var channels = (messages.length>2?messages[2]:map(
                                CHANNELS, function(chan) { return map(
                                    Array(messages[0].length)
                                    .join(',').split(','),
                                    function() { return chan; }
                                ) }).join(','));
                            var list = channels.split(',');

                            return function() {
                                var channel = list.shift()||SUB_CHANNEL;
                                return [
                                    (CHANNELS[channel]||{})
                                    .callback||SUB_CALLBACK,
                                    channel.split(PRESENCE_SUFFIX)[0]
                                ];
                            };
                        })();

                        each( messages[0], function(msg) {
                            var next = next_callback();
                            next[0]( msg, messages, next[1] );
                        } );

                        timeout( _connect, windowing );
                    }
                });
            }

            CONNECT = function() {
                _reset_offline();
                timeout( _connect, windowing );
            };

            // Reduce Status Flicker
            if (!READY) return READY_BUFFER.push(CONNECT);

            // Connect Now
            CONNECT();
        },

        'here_now' : function( args, callback ) {
            var callback = args['callback'] || callback
            ,   err      = args['error']    || function(){}
            ,   channel  = args['channel']
            ,   jsonp    = jsonp_cb()
            ,   data     = { 'uuid' : UUID, 'auth' : AUTH_KEY };

            // Make sure we have a Channel
            if (!channel)       return error('Missing Channel');
            if (!callback)      return error('Missing Callback');
            if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

            if (jsonp != '0') { data['callback'] = jsonp; }

            xdr({
                callback : jsonp,
                data     : data,
                success  : function(response) { callback(response,channel) },
                fail     : err,
                url      : [
                    STD_ORIGIN, 'v2', 'presence',
                    'sub_key', SUBSCRIBE_KEY,
                    'channel', encode(channel)
                ]
            });
        },

        // Expose PUBNUB Functions
        'xdr'           : xdr,
        'ready'         : ready,
        'db'            : db,
        'uuid'          : uuid,
        'map'           : map,
        'each'          : each,
        'each-channel'  : each_channel,
        'grep'          : grep,
        'offline'       : function(){_reset_offline(1)},
        'supplant'      : supplant,
        'now'           : rnow,
        'unique'        : unique,
        'updater'       : updater
    };

    function _poll_online() {
        _is_online() || _reset_offline(1);
        timeout( _poll_online, SECOND );
    }

    function _poll_online2() {
        SELF['time'](function(success){
            success || _reset_offline(1);
            timeout( _poll_online2, KEEPALIVE );
        })
    }

    function _reset_offline(err) {
        SUB_RECEIVER && SUB_RECEIVER(err);
        SUB_RECEIVER = null;
    }

    if (!UUID) UUID = SELF['uuid']();
    db['set']( SUBSCRIBE_KEY + 'uuid', UUID );

    timeout( _poll_online,  SECOND    );
    timeout( _poll_online2, KEEPALIVE );

    SELF['time'](function() {});

    return SELF;
}
/* =-====================================================================-= */
/* =-====================================================================-= */
/* =-=========================     UTIL     =============================-= */
/* =-====================================================================-= */
/* =-====================================================================-= */

window['PUBNUB'] || (function() {

/**
 * UTIL LOCALS
 */

var ASYNC = 'async'
,   PNSDK = 'PubNub-JS-' + 'SmartTV' + '/' + '3.5.3';

/**
 * CONSOLE COMPATIBILITY
 */
window.console || (window.console=window.console||{});
console.log    || (
    console.log   =
    console.error =
    ((window.opera||{}).postError||function(){})
);

/**
 * LOCAL STORAGE OR COOKIE
 */
var db = (function(){
    var ls = window['localStorage'];
    return {
        'get' : function(key) {
            try {
                if (ls) return ls.getItem(key);
                if (document.cookie.indexOf(key) == -1) return null;
                return ((document.cookie||'').match(
                    RegExp(key+'=([^;]+)')
                )||[])[1] || null;
            } catch(e) { return }
        },
        'set' : function( key, value ) {
            try {
                if (ls) return ls.setItem( key, value ) && 0;
                document.cookie = key + '=' + value +
                    '; expires=Thu, 1 Aug 2030 20:00:00 UTC; path=/';
            } catch(e) { return }
        }
    };
})();


/**
 * $
 * =
 * var div = $('divid');
 */
function $(id) { return document.getElementById(id) }

/**
 * ERROR
 * =====
 * error('message');
 */
function error(message) { console['error'](message) }

/**
 * SEARCH
 * ======
 * var elements = search('a div span');
 */
function search( elements, start ) {
    var list = [];
    each( elements.split(/\s+/), function(el) {
        each( (start || document).getElementsByTagName(el), function(node) {
            list.push(node);
        } );
    } );
    return list;
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
 * HEAD
 * ====
 * head().appendChild(elm);
 */
function head() { return search('head')[0] }

/**
 * ATTR
 * ====
 * var attribute = attr( node, 'attribute' );
 */
function attr( node, attribute, value ) {
    if (value) node.setAttribute( attribute, value );
    else return node && node.getAttribute && node.getAttribute(attribute);
}

/**
 * CSS
 * ===
 * var obj = create('div');
 */
function css( element, styles ) {
    for (var style in styles) if (styles.hasOwnProperty(style))
        try {element.style[style] = styles[style] + (
            '|width|height|top|left|'.indexOf(style) > 0 &&
            typeof styles[style] == 'number'
            ? 'px' : ''
        )}catch(e){}
}

/**
 * CREATE
 * ======
 * var obj = create('div');
 */
function create(element) { return document.createElement(element) }


/**
 * jsonp_cb
 * ========
 * var callback = jsonp_cb();
 */
function jsonp_cb() { return unique() }


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

/**
 * XDR Cross Domain Request
 * ========================
 *  xdr({
 *     url     : ['http://www.blah.com/url'],
 *     success : function(response) {},
 *     fail    : function() {}
 *  });
 */
function xdr( setup ) {
    var script    = create('script')
    ,   callback  = setup.callback
    ,   id        = unique()
    ,   finished  = 0
    ,   xhrtme    = setup.timeout || DEF_TIMEOUT
    ,   timer     = timeout( function(){done(1)}, xhrtme )
    ,   fail      = setup.fail    || function(){}
    ,   data      = setup.data    || {}
    ,   success   = setup.success || function(){}
    ,   append    = function() { head().appendChild(script) }
    ,   done      = function( failed, response ) {
            if (finished) return;
            finished = 1;

            script.onerror = null;
            clearTimeout(timer);

            (failed || !response) || success(response);

            timeout( function() {
                failed && fail();
                var s = $(id)
                ,   p = s && s.parentNode;
                p && p.removeChild(s);
            }, SECOND );
        };

    window[callback] = function(response) {
        done( 0, response );
    };

    if (!setup.blocking) script[ASYNC] = ASYNC;

    script.onerror = function() { done(1) };
    data['pnsdk']  = PNSDK;
    script.src     = build_url( setup.url, data );

    attr( script, 'id', id );

    append();
    return done;
}

 // Test Connection State
function _is_online() {
    if (!('onLine' in navigator)) return 1;
    return navigator['onLine'];
}


/* =-====================================================================-= */
/* =-====================================================================-= */
/* =-=========================     PUBNUB     ===========================-= */
/* =-====================================================================-= */
/* =-====================================================================-= */

var PDIV          = $('pubnub') || 0
,   CREATE_PUBNUB = function(setup) {

    // Force JSONP if requested from user.
    XORIGN = 0;

    var SUBSCRIBE_KEY = setup['subscribe_key'] || ''
    ,   KEEPALIVE     = (+setup['keepalive']   || DEF_KEEPALIVE)   * SECOND
    ,   UUID          = setup['uuid'] || db['get'](SUBSCRIBE_KEY+'uuid')||'';

    setup['xdr']        = xdr;
    setup['db']         = db;
    setup['error']      = error;
    setup['_is_online'] = _is_online;
    setup['jsonp_cb']   = jsonp_cb;

    var SELF            = PN_API(setup);
    SELF['css']         = css;
    SELF['$']           = $;
    SELF['create']      = create;
    SELF['bind']        = bind;
    SELF['head']        = head;
    SELF['search']      = search;
    SELF['attr']        = attr;
    SELF['events']      = events;
    SELF['init']        = CREATE_PUBNUB;


    // Add Leave Functions
    bind( 'beforeunload', window, function() {
        SELF['each-channel'](function(ch){ SELF['LEAVE']( ch.name, 1 ) });
        return true;
    } );

    // Return without Testing
    if (setup['notest']) return SELF;

    bind( 'offline', window,   SELF['offline'] );
    bind( 'offline', document, SELF['offline'] );

    // Return PUBNUB Socket Object
    return SELF;
};

// Bind for PUBNUB Readiness to Subscribe
bind( 'load', window, function(){ timeout( ready, 0 ) } );

var pdiv = PDIV || {};

// CREATE A PUBNUB GLOBAL OBJECT
PUBNUB = CREATE_PUBNUB({
    'notest'        : 1,
    'publish_key'   : attr( pdiv, 'pub-key' ),
    'subscribe_key' : attr( pdiv, 'sub-key' ),
    'ssl'           : !document.location.href.indexOf('https') ||
                      attr( pdiv, 'ssl' ) == 'on',
    'origin'        : attr( pdiv, 'origin' ),
    'uuid'          : attr( pdiv, 'uuid' )
});

})();
(function(){

// ---------------------------------------------------------------------------
// WEBSOCKET INTERFACE
// ---------------------------------------------------------------------------
var WS = PUBNUB['ws'] = function( url, protocols ) {
    if (!(this instanceof WS)) return new WS( url, protocols );

    var self     = this
    ,   url      = self.url      = url || ''
    ,   protocol = self.protocol = protocols || 'Sec-WebSocket-Protocol'
    ,   bits     = url.split('/')
    ,   setup    = {
         'ssl'           : bits[0] === 'wss:'
        ,'origin'        : bits[2]
        ,'publish_key'   : bits[3]
        ,'subscribe_key' : bits[4]
        ,'channel'       : bits[5]
    };

    // READY STATES
    self['CONNECTING'] = 0; // The connection is not yet open.
    self['OPEN']       = 1; // The connection is open and ready to communicate.
    self['CLOSING']    = 2; // The connection is in the process of closing.
    self['CLOSED']     = 3; // The connection is closed or couldn't be opened.

    // CLOSE STATES
    self['CLOSE_NORMAL']         = 1000; // Normal Intended Close; completed.
    self['CLOSE_GOING_AWAY']     = 1001; // Closed Unexpecttedly.
    self['CLOSE_PROTOCOL_ERROR'] = 1002; // Server: Not Supported.
    self['CLOSE_UNSUPPORTED']    = 1003; // Server: Unsupported Protocol.
    self['CLOSE_TOO_LARGE']      = 1004; // Server: Too Much Data.
    self['CLOSE_NO_STATUS']      = 1005; // Server: No reason.
    self['CLOSE_ABNORMAL']       = 1006; // Abnormal Disconnect.

    // Events Default
    self['onclose']   = self['onerror'] =
    self['onmessage'] = self['onopen']  =
    self['onsend']    =  function(){};

    // Attributes
    self['binaryType']     = '';
    self['extensions']     = '';
    self['bufferedAmount'] = 0;
    self['trasnmitting']   = false;
    self['buffer']         = [];
    self['readyState']     = self['CONNECTING'];

    // Close if no setup.
    if (!url) {
        self['readyState'] = self['CLOSED'];
        self['onclose']({
            'code'     : self['CLOSE_ABNORMAL'],
            'reason'   : 'Missing URL',
            'wasClean' : true
        });
        return self;
    }

    // PubNub WebSocket Emulation
    self.pubnub       = PUBNUB['init'](setup);
    self.pubnub.setup = setup;
    self.setup        = setup;

    self.pubnub['subscribe']({
        'restore'    : false,
        'channel'    : setup['channel'],
        'disconnect' : self['onerror'],
        'reconnect'  : self['onopen'],
        'error'      : function() {
            self['onclose']({
                'code'     : self['CLOSE_ABNORMAL'],
                'reason'   : 'Missing URL',
                'wasClean' : false
            });
        },
        'callback'   : function(message) {
            self['onmessage']({ 'data' : message });
        },
        'connect'    : function() {
            self['readyState'] = self['OPEN'];
            self['onopen']();
        }
    });
};

// ---------------------------------------------------------------------------
// WEBSOCKET SEND
// ---------------------------------------------------------------------------
WS.prototype.send = function(data) {
    var self = this;
    self.pubnub['publish']({
        'channel'  : self.pubnub.setup['channel'],
        'message'  : data,
        'callback' : function(response) {
            self['onsend']({ 'data' : response });
        }
    });
};

// ---------------------------------------------------------------------------
// WEBSOCKET CLOSE
// ---------------------------------------------------------------------------
WS.prototype.close = function() {
    var self = this;
    self.pubnub['unsubscribe']({ 'channel' : self.pubnub.setup['channel'] });
    self['readyState'] = self['CLOSED'];
    self['onclose']({});
};

})();
