// Version: 3.7.23
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

var NOW             = 1
,   READY           = false
,   READY_BUFFER    = []
,   PRESENCE_SUFFIX = '-pnpres'
,   DEF_WINDOWING   = 10     // MILLISECONDS.
,   DEF_TIMEOUT     = 15000  // MILLISECONDS.
,   DEF_SUB_TIMEOUT = 310    // SECONDS.
,   DEF_KEEPALIVE   = 60     // SECONDS (FOR TIMESYNC).
,   SECOND          = 1000   // A THOUSAND MILLISECONDS.
,   URLBIT          = '/'
,   PARAMSBIT       = '&'
,   PRESENCE_HB_THRESHOLD = 5
,   PRESENCE_HB_DEFAULT  = 30
,   SDK_VER         = '3.7.23'
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
                failover ? generate_uuid().split('-')[0] :
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
        var value_str = (typeof value == 'object')?JSON['stringify'](value):value;
        (typeof value != 'undefined' &&
            value != null && encode(value_str).length > 0
        ) && params.push(key + "=" + encode(value_str));
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
 * var my_uuid = generate_uuid();
 */
function generate_uuid(callback) {
    var u = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
    function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
    if (callback) callback(u);
    return u;
}

function isArray(arg) {
  return !!arg && typeof arg !== 'string' && (Array.isArray && Array.isArray(arg) || typeof(arg.length) === "number")
  //return !!arg && (Array.isArray && Array.isArray(arg) || typeof(arg.length) === "number")
}

/**
 * EACH
 * ====
 * each( [1,2,3], function(item) { } )
 */
function each( o, f) {
    if ( !o || !f ) return;

    if ( isArray(o) )
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


function pam_encode(str) {
  return encodeURIComponent(str).replace(/[!'()*~]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
}

/**
 * ENCODE
 * ======
 * var encoded_data = encode('path');
 */
function encode(path) { return encodeURIComponent(path) }

/**
 * Generate Subscription Channel List
 * ==================================
 * generate_channel_list(channels_object);
 */
function generate_channel_list(channels, nopresence) {
    var list = [];
    each( channels, function( channel, status ) {
        if (nopresence) {
            if(channel.search('-pnpres') < 0) {
                if (status.subscribed) list.push(channel);
            }
        } else {
            if (status.subscribed) list.push(channel);
        }
    });
    return list.sort();
}

/**
 * Generate Subscription Channel Groups List
 * ==================================
 * generate_channel_group_list(channels_groups object);
 */
function generate_channel_group_list(channel_groups, nopresence) {
    var list = [];
    each(channel_groups, function( channel_group, status ) {
        if (nopresence) {
            if(channel_group.search('-pnpres') < 0) {
                if (status.subscribed) list.push(channel_group);
            }
        } else {
            if (status.subscribed) list.push(channel_group);
        }
    });
    return list.sort();
}

// PUBNUB READY TO CONNECT
function ready() { timeout( function() {
    if (READY) return;
    READY = 1;
    each( READY_BUFFER, function(connect) { connect() } );
}, SECOND ); }

function PNmessage(args) {
    msg = args || {'apns' : {}},
    msg['getPubnubMessage'] = function() {
        var m = {};

        if (Object.keys(msg['apns']).length) {
            m['pn_apns'] = {
                    'aps' : {
                        'alert' : msg['apns']['alert'] ,
                        'badge' : msg['apns']['badge']
                    }
            }
            for (var k in msg['apns']) {
                m['pn_apns'][k] = msg['apns'][k];
            }
            var exclude1 = ['badge','alert'];
            for (var k in exclude1) {
                delete m['pn_apns'][exclude1[k]];
            }
        }



        if (msg['gcm']) {
            m['pn_gcm'] = {
                'data' : msg['gcm']
            }
        }

        for (var k in msg) {
            m[k] = msg[k];
        }
        var exclude = ['apns','gcm','publish', 'channel','callback','error'];
        for (var k in exclude) {
            delete m[exclude[k]];
        }

        return m;
    };
    msg['publish'] = function() {

        var m = msg.getPubnubMessage();

        if (msg['pubnub'] && msg['channel']) {
            msg['pubnub'].publish({
                'message' : m,
                'channel' : msg['channel'],
                'callback' : msg['callback'],
                'error' : msg['error']
            })
        }
    };
    return msg;
}

function PN_API(setup) {
    var SUB_WINDOWING =  +setup['windowing']   || DEF_WINDOWING
    ,   SUB_TIMEOUT   = (+setup['timeout']     || DEF_SUB_TIMEOUT) * SECOND
    ,   KEEPALIVE     = (+setup['keepalive']   || DEF_KEEPALIVE)   * SECOND
    ,   TIME_CHECK    = setup['timecheck']     || 0
    ,   NOLEAVE       = setup['noleave']       || 0
    ,   PUBLISH_KEY   = setup['publish_key']
    ,   SUBSCRIBE_KEY = setup['subscribe_key']
    ,   AUTH_KEY      = setup['auth_key']      || ''
    ,   SECRET_KEY    = setup['secret_key']    || ''
    ,   hmac_SHA256   = setup['hmac_SHA256']
    ,   SSL           = setup['ssl']            ? 's' : ''
    ,   ORIGIN        = 'http'+SSL+'://'+(setup['origin']||'pubsub.pubnub.com')
    ,   STD_ORIGIN    = nextorigin(ORIGIN)
    ,   SUB_ORIGIN    = nextorigin(ORIGIN)
    ,   CONNECT       = function(){}
    ,   PUB_QUEUE     = []
    ,   CLOAK         = true
    ,   TIME_DRIFT    = 0
    ,   SUB_CALLBACK  = 0
    ,   SUB_CHANNEL   = 0
    ,   SUB_RECEIVER  = 0
    ,   SUB_RESTORE   = setup['restore'] || 0
    ,   SUB_BUFF_WAIT = 0
    ,   TIMETOKEN     = 0
    ,   RESUMED       = false
    ,   CHANNELS      = {}
    ,   CHANNEL_GROUPS       = {}
    ,   SUB_ERROR     = function(){}
    ,   STATE         = {}
    ,   PRESENCE_HB_TIMEOUT  = null
    ,   PRESENCE_HB          = validate_presence_heartbeat(
        setup['heartbeat'] || setup['pnexpires'] || 0, setup['error']
    )
    ,   PRESENCE_HB_INTERVAL = setup['heartbeat_interval'] || (PRESENCE_HB / 2) -1
    ,   PRESENCE_HB_RUNNING  = false
    ,   NO_WAIT_FOR_PENDING  = setup['no_wait_for_pending']
    ,   COMPATIBLE_35 = setup['compatible_3.5']  || false
    ,   xdr           = setup['xdr']
    ,   params        = setup['params'] || {}
    ,   error         = setup['error']      || function() {}
    ,   _is_online    = setup['_is_online'] || function() { return 1 }
    ,   jsonp_cb      = setup['jsonp_cb']   || function() { return 0 }
    ,   db            = setup['db']         || {'get': function(){}, 'set': function(){}}
    ,   CIPHER_KEY    = setup['cipher_key']
    ,   UUID          = setup['uuid'] || ( !setup['unique_uuid'] && db && db['get'](SUBSCRIBE_KEY+'uuid') || '')
    ,   USE_INSTANCEID = setup['instance_id'] || false
    ,   INSTANCEID    = ''
    ,   shutdown      = setup['shutdown']
    ,   use_send_beacon = (typeof setup['use_send_beacon'] != 'undefined')?setup['use_send_beacon']:true
    ,   sendBeacon    = (use_send_beacon)?setup['sendBeacon']:null
    ,   _poll_timer
    ,   _poll_timer2;

    if (PRESENCE_HB === 2) PRESENCE_HB_INTERVAL = 1;

    var crypto_obj    = setup['crypto_obj'] ||
        {
            'encrypt' : function(a,key){ return a},
            'decrypt' : function(b,key){return b}
        };

    function _get_url_params(data) {
        if (!data) data = {};
        each( params , function( key, value ) {
            if (!(key in data)) data[key] = value;
        });
        return data;
    }

    function _object_to_key_list(o) {
        var l = []
        each( o , function( key, value ) {
            l.push(key);
        });
        return l;
    }
    function _object_to_key_list_sorted(o) {
        return _object_to_key_list(o).sort();
    }

    function _get_pam_sign_input_from_params(params) {
        var si = "";
        var l = _object_to_key_list_sorted(params);

        for (var i in l) {
            var k = l[i]
            si += k + "=" + pam_encode(params[k]) ;
            if (i != l.length - 1) si += "&"
        }
        return si;
    }

    function validate_presence_heartbeat(heartbeat, cur_heartbeat, error) {
        var err = false;

        if (typeof heartbeat === 'undefined') {
            return cur_heartbeat;
        }

        if (typeof heartbeat === 'number') {
            if (heartbeat > PRESENCE_HB_THRESHOLD || heartbeat == 0)
                err = false;
            else
                err = true;
        } else if(typeof heartbeat === 'boolean'){
            if (!heartbeat) {
                return 0;
            } else {
                return PRESENCE_HB_DEFAULT;
            }
        } else {
            err = true;
        }

        if (err) {
            error && error("Presence Heartbeat value invalid. Valid range ( x > " + PRESENCE_HB_THRESHOLD + " or x = 0). Current Value : " + (cur_heartbeat || PRESENCE_HB_THRESHOLD));
            return cur_heartbeat || PRESENCE_HB_THRESHOLD;
        } else return heartbeat;
    }

    function encrypt(input, key) {
        return crypto_obj['encrypt'](input, key || CIPHER_KEY) || input;
    }
    function decrypt(input, key) {
        return crypto_obj['decrypt'](input, key || CIPHER_KEY) ||
               crypto_obj['decrypt'](input, CIPHER_KEY) ||
               input;
    }

    function error_common(message, callback) {
        callback && callback({ 'error' : message || "error occurred"});
        error && error(message);
    }
    function _presence_heartbeat() {

        clearTimeout(PRESENCE_HB_TIMEOUT);

        if (!PRESENCE_HB_INTERVAL || PRESENCE_HB_INTERVAL >= 500 ||
            PRESENCE_HB_INTERVAL < 1 ||
            (!generate_channel_list(CHANNELS,true).length  && !generate_channel_group_list(CHANNEL_GROUPS, true).length ) )
        {
            PRESENCE_HB_RUNNING = false;
            return;
        }

        PRESENCE_HB_RUNNING = true;
        SELF['presence_heartbeat']({
            'callback' : function(r) {
                PRESENCE_HB_TIMEOUT = timeout( _presence_heartbeat, (PRESENCE_HB_INTERVAL) * SECOND );
            },
            'error' : function(e) {
                error && error("Presence Heartbeat unable to reach Pubnub servers." + JSON.stringify(e));
                PRESENCE_HB_TIMEOUT = timeout( _presence_heartbeat, (PRESENCE_HB_INTERVAL) * SECOND );
            }
        });
    }

    function start_presence_heartbeat() {
        !PRESENCE_HB_RUNNING && _presence_heartbeat();
    }

    function publish(next) {

        if (NO_WAIT_FOR_PENDING) {
            if (!PUB_QUEUE.length) return;
        } else {
            if (next) PUB_QUEUE.sending = 0;
            if ( PUB_QUEUE.sending || !PUB_QUEUE.length ) return;
            PUB_QUEUE.sending = 1;
        }

        xdr(PUB_QUEUE.shift());
    }
    function each_channel_group(callback) {
        var count = 0;

        each( generate_channel_group_list(CHANNEL_GROUPS), function(channel_group) {
            var chang = CHANNEL_GROUPS[channel_group];

            if (!chang) return;

            count++;
            (callback||function(){})(chang);
        } );

        return count;
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
    function _invoke_callback(response, callback, err) {
        if (typeof response == 'object') {
            if (response['error']) {
                var callback_data = {};

                if (response['message']) {
                    callback_data['message'] = response['message'];
                }

                if (response['payload']) {
                    callback_data['payload'] = response['payload'];
                }

                err && err(callback_data);
                return;

            }
            if (response['payload']) {
                if (response['next_page'])
                    callback && callback(response['payload'], response['next_page']);
                else
                    callback && callback(response['payload']);
                return;
            }
        }
        callback && callback(response);
    }

    function _invoke_error(response,err) {

        if (typeof response == 'object' && response['error']) {
                var callback_data = {};

                if (response['message']) {
                    callback_data['message'] = response['message'];
                }

                if (response['payload']) {
                    callback_data['payload'] = response['payload'];
                }
                
                err && err(callback_data);
                return;
        } else {
            err && err(response);
        }
    }
    function CR(args, callback, url1, data) {
            var callback        = args['callback']      || callback
            ,   err             = args['error']         || error
            ,   jsonp           = jsonp_cb();

            data = data || {};
            
            if (!data['auth']) {
                data['auth'] = args['auth_key'] || AUTH_KEY;
            }
            
            var url = [
                    STD_ORIGIN, 'v1', 'channel-registration',
                    'sub-key', SUBSCRIBE_KEY
                ];

            url.push.apply(url,url1);
            
            if (jsonp) data['callback']              = jsonp;
            
            xdr({
                callback : jsonp,
                data     : _get_url_params(data),
                success  : function(response) {
                    _invoke_callback(response, callback, err);
                },
                fail     : function(response) {
                    _invoke_error(response, err);
                },
                url      : url
            });

    }

    // Announce Leave Event
    var SELF = {
        'LEAVE' : function( channel, blocking, auth_key, callback, error ) {
            var data   = { 'uuid' : UUID, 'auth' : auth_key || AUTH_KEY }
            ,   origin = nextorigin(ORIGIN)
            ,   callback = callback || function(){}
            ,   err      = error    || function(){}
            ,   url
            ,   params
            ,   jsonp  = jsonp_cb();

            // Prevent Leaving a Presence Channel
            if (channel.indexOf(PRESENCE_SUFFIX) > 0) return true;


            if (COMPATIBLE_35) {
                if (!SSL)         return false;
                if (jsonp == '0') return false;
            }

            if (NOLEAVE)  return false;

            if (jsonp != '0') data['callback'] = jsonp;

            if (USE_INSTANCEID) data['instanceid'] = INSTANCEID;

            url = [
                    origin, 'v2', 'presence', 'sub_key',
                    SUBSCRIBE_KEY, 'channel', encode(channel), 'leave'
                ];

            params = _get_url_params(data);


            if (sendBeacon) {
                url_string = build_url(url, params);
                if (sendBeacon(url_string)) {
                    callback && callback({"status": 200, "action": "leave", "message": "OK", "service": "Presence"});
                    return true;
                }
            }


            xdr({
                blocking : blocking || SSL,
                callback : jsonp,
                data     : params,
                success  : function(response) {
                    _invoke_callback(response, callback, err);
                },
                fail     : function(response) {
                    _invoke_error(response, err);
                },
                url      : url
            });
            return true;
        },
        'LEAVE_GROUP' : function( channel_group, blocking, auth_key, callback, error ) {

            var data   = { 'uuid' : UUID, 'auth' : auth_key || AUTH_KEY }
            ,   origin = nextorigin(ORIGIN)
            ,   url
            ,   params
            ,   callback = callback || function(){}
            ,   err      = error    || function(){}
            ,   jsonp  = jsonp_cb();

            // Prevent Leaving a Presence Channel Group
            if (channel_group.indexOf(PRESENCE_SUFFIX) > 0) return true;

            if (COMPATIBLE_35) {
                if (!SSL)         return false;
                if (jsonp == '0') return false;
            }

            if (NOLEAVE)  return false;

            if (jsonp != '0') data['callback'] = jsonp;

            if (channel_group && channel_group.length > 0) data['channel-group'] = channel_group;

            if (USE_INSTANCEID) data['instanceid'] = INSTANCEID;

            url = [
                    origin, 'v2', 'presence', 'sub_key',
                    SUBSCRIBE_KEY, 'channel', encode(','), 'leave'
            ];

            params = _get_url_params(data);

            if (sendBeacon) {
                url_string = build_url(url, params);
                if (sendBeacon(url_string)) {
                    callback && callback({"status": 200, "action": "leave", "message": "OK", "service": "Presence"});
                    return true;
                }
            }

            xdr({
                blocking : blocking || SSL,
                callback : jsonp,
                data     : params,
                success  : function(response) {
                    _invoke_callback(response, callback, err);
                },
                fail     : function(response) {
                    _invoke_error(response, err);
                },
                url      : url
            });
            return true;
        },
        'set_resumed' : function(resumed) {
                RESUMED = resumed;
        },
        'get_cipher_key' : function() {
            return CIPHER_KEY;
        },
        'set_cipher_key' : function(key) {
            CIPHER_KEY = key;
        },
        'raw_encrypt' : function(input, key) {
            return encrypt(input, key);
        },
        'raw_decrypt' : function(input, key) {
            return decrypt(input, key);
        },
        'get_heartbeat' : function() {
            return PRESENCE_HB;
        },
        
        'set_heartbeat' : function(heartbeat, heartbeat_interval) {
            PRESENCE_HB = validate_presence_heartbeat(heartbeat, PRESENCE_HB, error);
            PRESENCE_HB_INTERVAL = heartbeat_interval || (PRESENCE_HB / 2) - 1;
            if (PRESENCE_HB == 2) {
                PRESENCE_HB_INTERVAL = 1;
            }
            CONNECT();
            _presence_heartbeat();
        },
        
        'get_heartbeat_interval' : function() {
            return PRESENCE_HB_INTERVAL;
        },
        
        'set_heartbeat_interval' : function(heartbeat_interval) {
            PRESENCE_HB_INTERVAL = heartbeat_interval;
            _presence_heartbeat();
        },
        
        'get_version' : function() {
            return SDK_VER;
        },
        'getGcmMessageObject' : function(obj) {
            return {
                'data' : obj
            }
        },
        'getApnsMessageObject' : function(obj) {
            var x =  {
                'aps' : { 'badge' : 1, 'alert' : ''}
            }
            for (k in obj) {
                k[x] = obj[k];
            }
            return x;
        },
        'newPnMessage' : function() {
            var x = {};
            if (gcm) x['pn_gcm'] = gcm;
            if (apns) x['pn_apns'] = apns;
            for ( k in n ) {
                x[k] = n[k];
            }
            return x;
        },

        '_add_param' : function(key,val) {
            params[key] = val;
        },

        'channel_group' : function(args, callback) {
            var ns_ch       = args['channel_group']
            ,   callback    = callback         || args['callback']
            ,   channels    = args['channels'] || args['channel']
            ,   cloak       = args['cloak']
            ,   namespace
            ,   channel_group
            ,   url = []
            ,   data = {}
            ,   mode = args['mode'] || 'add';


            if (ns_ch) {
                var ns_ch_a = ns_ch.split(':');

                if (ns_ch_a.length > 1) {
                    namespace = (ns_ch_a[0] === '*')?null:ns_ch_a[0];

                    channel_group = ns_ch_a[1];
                } else {
                    channel_group = ns_ch_a[0];
                }
            }

            namespace && url.push('namespace') && url.push(encode(namespace));

            url.push('channel-group');

            if (channel_group && channel_group !== '*') {
                url.push(channel_group);
            }

            if (channels ) {
                if (isArray(channels)) {
                    channels = channels.join(',');
                }
                data[mode] = channels;
                data['cloak'] = (CLOAK)?'true':'false';
            } else {
                if (mode === 'remove') url.push('remove');
            }

            if (typeof cloak != 'undefined') data['cloak'] = (cloak)?'true':'false';

            CR(args, callback, url, data);
        },

        'channel_group_list_groups' : function(args, callback) {
            var namespace;

            namespace = args['namespace'] || args['ns'] || args['channel_group'] || null;
            if (namespace) {
                args["channel_group"] = namespace + ":*";
            }

            SELF['channel_group'](args, callback);
        },

        'channel_group_list_channels' : function(args, callback) {
            if (!args['channel_group']) return error('Missing Channel Group');
            SELF['channel_group'](args, callback);
        },

        'channel_group_remove_channel' : function(args, callback) {
            if (!args['channel_group']) return error('Missing Channel Group');
            if (!args['channel'] && !args['channels'] ) return error('Missing Channel');

            args['mode'] = 'remove';
            SELF['channel_group'](args,callback);
        },

        'channel_group_remove_group' : function(args, callback) {
            if (!args['channel_group']) return error('Missing Channel Group');
            if (args['channel']) return error('Use channel_group_remove_channel if you want to remove a channel from a group.');

            args['mode'] = 'remove';
            SELF['channel_group'](args,callback);
        },

        'channel_group_add_channel' : function(args, callback) {
           if (!args['channel_group']) return error('Missing Channel Group');
           if (!args['channel'] && !args['channels'] ) return error('Missing Channel');
            SELF['channel_group'](args,callback);
        },

        'channel_group_cloak' : function(args, callback) {
            if (typeof args['cloak'] == 'undefined') {
                callback(CLOAK);
                return;
            }
            CLOAK = args['cloak'];
            SELF['channel_group'](args,callback);
        },

        'channel_group_list_namespaces' : function(args, callback) {
            var url = ['namespace'];
            CR(args, callback, url);
        },
        'channel_group_remove_namespace' : function(args, callback) {
            var url = ['namespace',args['namespace'],'remove'];
            CR(args, callback, url);
        },

        /*
            PUBNUB.history({
                channel  : 'my_chat_channel',
                limit    : 100,
                callback : function(history) { }
            });
        */
        'history' : function( args, callback ) {
            var callback         = args['callback'] || callback
            ,   count            = args['count']    || args['limit'] || 100
            ,   reverse          = args['reverse']  || "false"
            ,   err              = args['error']    || function(){}
            ,   auth_key         = args['auth_key'] || AUTH_KEY
            ,   cipher_key       = args['cipher_key']
            ,   channel          = args['channel']
            ,   channel_group    = args['channel_group']
            ,   start            = args['start']
            ,   end              = args['end']
            ,   include_token    = args['include_token']
            ,   string_msg_token = args['string_message_token'] || false
            ,   params           = {}
            ,   jsonp            = jsonp_cb();

            // Make sure we have a Channel
            if (!channel && !channel_group) return error('Missing Channel');
            if (!callback)      return error('Missing Callback');
            if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

            params['stringtoken'] = 'true';
            params['count']       = count;
            params['reverse']     = reverse;
            params['auth']        = auth_key;

            if (channel_group) {
                params['channel-group'] = channel_group;
                if (!channel) {
                    channel = ','; 
                }
            }
            if (jsonp) params['callback']              = jsonp;
            if (start) params['start']                 = start;
            if (end)   params['end']                   = end;
            if (include_token) params['include_token'] = 'true';
            if (string_msg_token) params['string_message_token'] = 'true';

            // Send Message
            xdr({
                callback : jsonp,
                data     : _get_url_params(params),
                success  : function(response) {
                    if (typeof response == 'object' && response['error']) {
                        err({'message' : response['message'], 'payload' : response['payload']});
                        return;
                    }
                    var messages = response[0];
                    var decrypted_messages = [];
                    for (var a = 0; a < messages.length; a++) {
                        if (include_token) {
                            var new_message = decrypt(messages[a]['message'],cipher_key);
                            var timetoken = messages[a]['timetoken'];
                            try {
                                decrypted_messages['push']({"message" : JSON['parse'](new_message), "timetoken" : timetoken});
                            } catch (e) {
                                decrypted_messages['push'](({"message" : new_message, "timetoken" : timetoken}));
                            }
                        } else {
                            var new_message = decrypt(messages[a],cipher_key);
                            try {
                                decrypted_messages['push'](JSON['parse'](new_message));
                            } catch (e) {
                                decrypted_messages['push']((new_message));
                            }     
                        }
                    }
                    callback([decrypted_messages, response[1], response[2]]);
                },
                fail     : function(response) {
                    _invoke_error(response, err);
                },
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
        'replay' : function(args, callback) {
            var callback    = callback || args['callback'] || function(){}
            ,   auth_key    = args['auth_key'] || AUTH_KEY
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

            data['auth'] = auth_key;

            // Compose URL Parts
            url = [
                STD_ORIGIN, 'v1', 'replay',
                PUBLISH_KEY, SUBSCRIBE_KEY,
                source, destination
            ];

            // Start (or Stop) Replay!
            xdr({
                callback : jsonp,
                success  : function(response) {
                    _invoke_callback(response, callback, err);
                },
                fail     : function() { callback([ 0, 'Disconnected' ]) },
                url      : url,
                data     : _get_url_params(data)
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

            var data = { 'uuid' : UUID, 'auth' : AUTH_KEY }

            if (USE_INSTANCEID) data['instanceid'] = INSTANCEID;

            xdr({
                callback : jsonp,
                data     : _get_url_params(data),
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
            var msg      = args['message'];
            if (!msg) return error('Missing Message');

            var callback = callback || args['callback'] || msg['callback'] || args['success'] || function(){}
            ,   channel  = args['channel'] || msg['channel']
            ,   auth_key = args['auth_key'] || AUTH_KEY
            ,   cipher_key = args['cipher_key']
            ,   err      = args['error'] || msg['error'] || function() {}
            ,   post     = args['post'] || false
            ,   store    = ('store_in_history' in args) ? args['store_in_history']: true
            ,   jsonp    = jsonp_cb()
            ,   add_msg  = 'push'
            ,   params
            ,   url;

            if (args['prepend']) add_msg = 'unshift'

            if (!channel)       return error('Missing Channel');
            if (!PUBLISH_KEY)   return error('Missing Publish Key');
            if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

            if (msg['getPubnubMessage']) {
                msg = msg['getPubnubMessage']();
            }

            // If trying to send Object
            msg = JSON['stringify'](encrypt(msg, cipher_key));

            // Create URL
            url = [
                STD_ORIGIN, 'publish',
                PUBLISH_KEY, SUBSCRIBE_KEY,
                0, encode(channel),
                jsonp, encode(msg)
            ];

            params = { 'uuid' : UUID, 'auth' : auth_key }

            if (!store) params['store'] ="0"

            if (USE_INSTANCEID) params['instanceid'] = INSTANCEID;

            // Queue Message Send
            PUB_QUEUE[add_msg]({
                callback : jsonp,
                url      : url,
                data     : _get_url_params(params),
                fail     : function(response){
                    _invoke_error(response, err);
                    publish(1);
                },
                success  : function(response) {
                    _invoke_callback(response, callback, err);
                    publish(1);
                },
                mode     : (post)?'POST':'GET'
            });

            // Send Message
            publish();
        },

        /*
            PUBNUB.unsubscribe({ channel : 'my_chat' });
        */
        'unsubscribe' : function(args, callback) {
            var channelArg = args['channel'];
            var channelGroupArg = args['channel_group'];
            var auth_key = args['auth_key'] || AUTH_KEY;
            var callback = callback || args['callback'] || function(){};
            var err = args['error'] || function(){};

            TIMETOKEN   = 0;
            SUB_RESTORE = 1;   // REVISIT !!!!

            if (!channelArg && !channelGroupArg) return error('Missing Channel or Channel Group');
            if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

            if (channelArg) {
                var channels = isArray(channelArg) ? channelArg : ('' + channelArg).split(",");
                var existingChannels = [];
                var presenceChannels = [];

                each(channels, function(channel){
                    if (CHANNELS[channel]) existingChannels.push(channel);
                });

                // if we do not have any channels to unsubscribe from, trigger a callback.
                if (existingChannels.length == 0){
                    callback({action : "leave"});
                    return;
                }

                // Prepare presence channels
                each(existingChannels, function(channel) {
                    presenceChannels.push(channel + PRESENCE_SUFFIX);
                });

                each(existingChannels.concat(presenceChannels), function(channel){
                    if (channel in CHANNELS) CHANNELS[channel] = 0;
                    if (channel in STATE) delete STATE[channel];
                });

                var CB_CALLED = true;
                if (READY) {
                    CB_CALLED = SELF['LEAVE'](existingChannels.join(','), 0 , auth_key, callback, err);
                }
                if (!CB_CALLED) callback({action : "leave"});
            }

            if (channelGroupArg) {
                var channelGroups = isArray(channelGroupArg) ? channelGroupArg : ('' + channelGroupArg).split(",");
                var existingChannelGroups = [];
                var presenceChannelGroups = [];

                each(channelGroups, function(channelGroup){
                    if (CHANNEL_GROUPS[channelGroup]) existingChannelGroups.push(channelGroup);
                });

                // if we do not have any channel groups to unsubscribe from, trigger a callback.
                if (existingChannelGroups.length == 0){
                    callback({action : "leave"});
                    return;
                }

                // Prepare presence channels
                each(existingChannelGroups, function(channelGroup) {
                    presenceChannelGroups.push(channelGroup + PRESENCE_SUFFIX);
                });

                each(existingChannelGroups.concat(presenceChannelGroups), function(channelGroup){
                    if (channelGroup in CHANNEL_GROUPS) CHANNEL_GROUPS[channelGroup] = 0;
                    if (channelGroup in STATE) delete STATE[channelGroup];
                });

                var CB_CALLED = true;
                if (READY) {
                    CB_CALLED = SELF['LEAVE_GROUP'](existingChannelGroups.join(','), 0 , auth_key, callback, err);
                }
                if (!CB_CALLED) callback({action : "leave"});
            }

            // Reset Connection if Count Less
            CONNECT();
        },

        /*
            PUBNUB.subscribe({
                channel  : 'my_chat'
                callback : function(message) { }
            });
        */
        'subscribe' : function( args, callback ) {
            var channel         = args['channel']
            ,   channel_group   = args['channel_group']
            ,   callback        = callback            || args['callback']
            ,   callback        = callback            || args['message']
            ,   connect         = args['connect']     || function(){}
            ,   reconnect       = args['reconnect']   || function(){}
            ,   disconnect      = args['disconnect']  || function(){}
            ,   SUB_ERROR       = args['error']       || SUB_ERROR || function(){}
            ,   idlecb          = args['idle']        || function(){}
            ,   presence        = args['presence']    || 0
            ,   noheresync      = args['noheresync']  || 0
            ,   backfill        = args['backfill']    || 0
            ,   timetoken       = args['timetoken']   || 0
            ,   sub_timeout     = args['timeout']     || SUB_TIMEOUT
            ,   windowing       = args['windowing']   || SUB_WINDOWING
            ,   state           = args['state']
            ,   heartbeat       = args['heartbeat'] || args['pnexpires']
            ,   heartbeat_interval = args['heartbeat_interval']
            ,   restore         = args['restore'] || SUB_RESTORE;

            AUTH_KEY            = args['auth_key']    || AUTH_KEY;

            // Restore Enabled?
            SUB_RESTORE = restore;

            // Always Reset the TT
            TIMETOKEN = timetoken;

            // Make sure we have a Channel
            if (!channel && !channel_group) {
                return error('Missing Channel');
            }

            if (!callback)      return error('Missing Callback');
            if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

            if (heartbeat || heartbeat === 0 || heartbeat_interval || heartbeat_interval === 0) {
                SELF['set_heartbeat'](heartbeat, heartbeat_interval);
            }

            // Setup Channel(s)
            if (channel) {
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
                        'cipher_key' : args['cipher_key'],
                        connect      : connect,
                        disconnect   : disconnect,
                        reconnect    : reconnect
                    };

                    if (state) {
                        if (channel in state) {
                            STATE[channel] = state[channel];
                        } else {
                            STATE[channel] = state;
                        }
                    }

                    // Presence Enabled?
                    if (!presence) return;

                    // Subscribe Presence Channel
                    SELF['subscribe']({
                        'channel'  : channel + PRESENCE_SUFFIX,
                        'callback' : presence,
                        'restore'  : restore
                    });

                    // Presence Subscribed?
                    if (settings.subscribed) return;

                    // See Who's Here Now?
                    if (noheresync) return;
                    SELF['here_now']({
                        'channel'  : channel,
                        'data'     : _get_url_params({ 'uuid' : UUID, 'auth' : AUTH_KEY }),
                        'callback' : function(here) {
                            each( 'uuids' in here ? here['uuids'] : [],
                            function(uid) { presence( {
                                'action'    : 'join',
                                'uuid'      : uid,
                                'timestamp' : Math.floor(rnow() / 1000),
                                'occupancy' : here['occupancy'] || 1
                            }, here, channel ); } );
                        }
                    });
                } );
            }

            // Setup Channel Groups
            if (channel_group) {
                each( (channel_group.join ? channel_group.join(',') : ''+channel_group).split(','),
                function(channel_group) {
                    var settings = CHANNEL_GROUPS[channel_group] || {};

                    CHANNEL_GROUPS[channel_group] = {
                        name         : channel_group,
                        connected    : settings.connected,
                        disconnected : settings.disconnected,
                        subscribed   : 1,
                        callback     : SUB_CALLBACK = callback,
                        'cipher_key' : args['cipher_key'],
                        connect      : connect,
                        disconnect   : disconnect,
                        reconnect    : reconnect
                    };

                    // Presence Enabled?
                    if (!presence) return;

                    // Subscribe Presence Channel
                    SELF['subscribe']({
                        'channel_group'  : channel_group + PRESENCE_SUFFIX,
                        'callback' : presence,
                        'restore'  : restore,
                        'auth_key' : AUTH_KEY
                    });

                    // Presence Subscribed?
                    if (settings.subscribed) return;

                    // See Who's Here Now?
                    if (noheresync) return;
                    SELF['here_now']({
                        'channel_group'  : channel_group,
                        'data'           : _get_url_params({ 'uuid' : UUID, 'auth' : AUTH_KEY }),
                        'callback' : function(here) {
                            each( 'uuids' in here ? here['uuids'] : [],
                            function(uid) { presence( {
                                'action'    : 'join',
                                'uuid'      : uid,
                                'timestamp' : Math.floor(rnow() / 1000),
                                'occupancy' : here['occupancy'] || 1
                            }, here, channel_group ); } );
                        }
                    });
                } );
            }


            // Test Network Connection
            function _test_connection(success) {
                if (success) {
                    // Begin Next Socket Connection
                    timeout( CONNECT, windowing);
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
                
                // Disconnect & Reconnect for channel groups
                each_channel_group(function(channel_group){
                    // Reconnect
                    if (success && channel_group.disconnected) {
                        channel_group.disconnected = 0;
                        return channel_group.reconnect(channel_group.name);
                    }

                    // Disconnect
                    if (!success && !channel_group.disconnected) {
                        channel_group.disconnected = 1;
                        channel_group.disconnect(channel_group.name);
                    }
                });
            }

            // Evented Subscribe
            function _connect() {
                var jsonp           = jsonp_cb()
                ,   channels        = generate_channel_list(CHANNELS).join(',')
                ,   channel_groups  = generate_channel_group_list(CHANNEL_GROUPS).join(',');

                // Stop Connection
                if (!channels && !channel_groups) return;

                if (!channels) channels = ',';

                // Connect to PubNub Subscribe Servers
                _reset_offline();

                var data = _get_url_params({ 'uuid' : UUID, 'auth' : AUTH_KEY });

                if (channel_groups) {
                    data['channel-group'] = channel_groups;
                }


                var st = JSON.stringify(STATE);
                if (st.length > 2) data['state'] = JSON.stringify(STATE);

                if (PRESENCE_HB) data['heartbeat'] = PRESENCE_HB;

                if (USE_INSTANCEID) data['instanceid'] = INSTANCEID;

                start_presence_heartbeat();
                SUB_RECEIVER = xdr({
                    timeout  : sub_timeout,
                    callback : jsonp,
                    fail     : function(response) {
                        if (response && response['error'] && response['service']) {
                            _invoke_error(response, SUB_ERROR);
                            _test_connection(1);
                        } else {
                            SELF['time'](function(success){
                                !success && ( _invoke_error(response, SUB_ERROR));
                                _test_connection(success);
                            });
                        }
                    },
                    data     : _get_url_params(data),
                    url      : [
                        SUB_ORIGIN, 'subscribe',
                        SUBSCRIBE_KEY, encode(channels),
                        jsonp, TIMETOKEN
                    ],
                    success : function(messages) {

                        // Check for Errors
                        if (!messages || (
                            typeof messages == 'object' &&
                            'error' in messages         &&
                            messages['error']
                        )) {
                            SUB_ERROR(messages['error']);
                            return timeout( CONNECT, SECOND );
                        }

                        // User Idle Callback
                        idlecb(messages[1]);

                        // Restore Previous Connection Point if Needed
                        TIMETOKEN = !TIMETOKEN               &&
                                    SUB_RESTORE              &&
                                    db['get'](SUBSCRIBE_KEY) || messages[1];

                        /*
                        // Connect
                        each_channel_registry(function(registry){
                            if (registry.connected) return;
                            registry.connected = 1;
                            registry.connect(channel.name);
                        });
                        */

                        // Connect
                        each_channel(function(channel){
                            if (channel.connected) return;
                            channel.connected = 1;
                            channel.connect(channel.name);
                        });

                        // Connect for channel groups
                        each_channel_group(function(channel_group){
                            if (channel_group.connected) return;
                            channel_group.connected = 1;
                            channel_group.connect(channel_group.name);
                        });

                        if (RESUMED && !SUB_RESTORE) {
                                TIMETOKEN = 0;
                                RESUMED = false;
                                // Update Saved Timetoken
                                db['set']( SUBSCRIBE_KEY, 0 );
                                timeout( _connect, windowing );
                                return;
                        }

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
                            var channels = '';
                            var channels2 = '';

                            if (messages.length > 3) {
                                channels  = messages[3];
                                channels2 = messages[2];
                            } else if (messages.length > 2) {
                                channels = messages[2];
                            } else {
                                channels =  map(
                                    generate_channel_list(CHANNELS), function(chan) { return map(
                                        Array(messages[0].length)
                                        .join(',').split(','),
                                        function() { return chan; }
                                    ) }).join(',')
                            }

                            var list  = channels.split(',');
                            var list2 = (channels2)?channels2.split(','):[];

                            return function() {
                                var channel  = list.shift()||SUB_CHANNEL;
                                var channel2 = list2.shift();

                                var chobj = {};

                                if (channel2) {
                                    if (channel && channel.indexOf('-pnpres') >= 0 
                                        && channel2.indexOf('-pnpres') < 0) {
                                        channel2 += '-pnpres';
                                    }
                                    chobj = CHANNEL_GROUPS[channel2] || CHANNELS[channel2] || {'callback' : function(){}};
                                } else {
                                    chobj = CHANNELS[channel];
                                }

                                var r = [
                                    chobj
                                    .callback||SUB_CALLBACK,
                                    channel.split(PRESENCE_SUFFIX)[0]
                                ];
                                channel2 && r.push(channel2.split(PRESENCE_SUFFIX)[0]);
                                return r;
                            };
                        })();

                        var latency = detect_latency(+messages[1]);
                        each( messages[0], function(msg) {
                            var next = next_callback();
                            var decrypted_msg = decrypt(msg,
                                (CHANNELS[next[1]])?CHANNELS[next[1]]['cipher_key']:null);
                            next[0] && next[0]( decrypted_msg, messages, next[2] || next[1], latency, next[1]);
                        });

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

        /*
            PUBNUB.here_now({ channel : 'my_chat', callback : fun });
        */
        'here_now' : function( args, callback ) {
            var callback = args['callback'] || callback
            ,   debug    = args['debug']
            ,   err      = args['error']    || function(){}
            ,   auth_key = args['auth_key'] || AUTH_KEY
            ,   channel  = args['channel']
            ,   channel_group = args['channel_group']
            ,   jsonp    = jsonp_cb()
            ,   uuids    = ('uuids' in args) ? args['uuids'] : true
            ,   state    = args['state']
            ,   data     = { 'uuid' : UUID, 'auth' : auth_key };

            if (!uuids) data['disable_uuids'] = 1;
            if (state) data['state'] = 1;

            // Make sure we have a Channel
            if (!callback)      return error('Missing Callback');
            if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

            var url = [
                    STD_ORIGIN, 'v2', 'presence',
                    'sub_key', SUBSCRIBE_KEY
                ];

            channel && url.push('channel') && url.push(encode(channel));

            if (jsonp != '0') { data['callback'] = jsonp; }

            if (channel_group) {
                data['channel-group'] = channel_group;
                !channel && url.push('channel') && url.push(','); 
            }

            if (USE_INSTANCEID) data['instanceid'] = INSTANCEID;

            xdr({
                callback : jsonp,
                data     : _get_url_params(data),
                success  : function(response) {
                    _invoke_callback(response, callback, err);
                },
                fail     : function(response) {
                    _invoke_error(response, err);
                },
                debug    : debug,
                url      : url
            });
        },

        /*
            PUBNUB.current_channels_by_uuid({ channel : 'my_chat', callback : fun });
        */
        'where_now' : function( args, callback ) {
            var callback = args['callback'] || callback
            ,   err      = args['error']    || function(){}
            ,   auth_key = args['auth_key'] || AUTH_KEY
            ,   jsonp    = jsonp_cb()
            ,   uuid     = args['uuid']     || UUID
            ,   data     = { 'auth' : auth_key };

            // Make sure we have a Channel
            if (!callback)      return error('Missing Callback');
            if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

            if (jsonp != '0') { data['callback'] = jsonp; }

            if (USE_INSTANCEID) data['instanceid'] = INSTANCEID;

            xdr({
                callback : jsonp,
                data     : _get_url_params(data),
                success  : function(response) {
                    _invoke_callback(response, callback, err);
                },
                fail     : function(response) {
                    _invoke_error(response, err);
                },
                url      : [
                    STD_ORIGIN, 'v2', 'presence',
                    'sub_key', SUBSCRIBE_KEY,
                    'uuid', encode(uuid)
                ]
            });
        },

        'state' : function(args, callback) {
            var callback = args['callback'] || callback || function(r) {}
            ,   err      = args['error']    || function(){}
            ,   auth_key = args['auth_key'] || AUTH_KEY
            ,   jsonp    = jsonp_cb()
            ,   state    = args['state']
            ,   uuid     = args['uuid'] || UUID
            ,   channel  = args['channel']
            ,   channel_group = args['channel_group']
            ,   url
            ,   data     = _get_url_params({ 'auth' : auth_key });

            // Make sure we have a Channel
            if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');
            if (!uuid) return error('Missing UUID');
            if (!channel && !channel_group) return error('Missing Channel');

            if (jsonp != '0') { data['callback'] = jsonp; }

            if (typeof channel != 'undefined'
                && CHANNELS[channel] && CHANNELS[channel].subscribed ) {
                if (state) STATE[channel] = state;
            }

            if (typeof channel_group != 'undefined'
                && CHANNEL_GROUPS[channel_group]
                && CHANNEL_GROUPS[channel_group].subscribed
                ) {
                if (state) STATE[channel_group] = state;
                data['channel-group'] = channel_group;

                if (!channel) {
                    channel = ',';
                }
            }

            data['state'] = JSON.stringify(state);

            if (USE_INSTANCEID) data['instanceid'] = INSTANCEID;

            if (state) {
                url      = [
                    STD_ORIGIN, 'v2', 'presence',
                    'sub-key', SUBSCRIBE_KEY,
                    'channel', channel,
                    'uuid', uuid, 'data'
                ]
            } else {
                url      = [
                    STD_ORIGIN, 'v2', 'presence',
                    'sub-key', SUBSCRIBE_KEY,
                    'channel', channel,
                    'uuid', encode(uuid)
                ]
            }

            xdr({
                callback : jsonp,
                data     : _get_url_params(data),
                success  : function(response) {
                    _invoke_callback(response, callback, err);
                },
                fail     : function(response) {
                    _invoke_error(response, err);
                },
                url      : url

            });

        },

        /*
            PUBNUB.grant({
                channel  : 'my_chat',
                callback : fun,
                error    : fun,
                ttl      : 24 * 60, // Minutes
                read     : true,
                write    : true,
                auth_key : '3y8uiajdklytowsj'
            });
        */
        'grant' : function( args, callback ) {
            var callback        = args['callback'] || callback
            ,   err             = args['error']    || function(){}
            ,   channel         = args['channel']  || args['channels']
            ,   channel_group   = args['channel_group']
            ,   jsonp           = jsonp_cb()
            ,   ttl             = args['ttl']
            ,   r               = (args['read'] )?"1":"0"
            ,   w               = (args['write'])?"1":"0"
            ,   m               = (args['manage'])?"1":"0"
            ,   auth_key        = args['auth_key'] || args['auth_keys'];

            if (!callback)      return error('Missing Callback');
            if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');
            if (!PUBLISH_KEY)   return error('Missing Publish Key');
            if (!SECRET_KEY)    return error('Missing Secret Key');

            var timestamp  = Math.floor(new Date().getTime() / 1000)
            ,   sign_input = SUBSCRIBE_KEY + "\n" + PUBLISH_KEY + "\n"
                    + "grant" + "\n";

            var data = {
                'w'         : w,
                'r'         : r,
                'timestamp' : timestamp
            };
            if (args['manage']) {
                data['m'] = m;
            }
            if (isArray(channel)) {
                channel = channel['join'](',');
            }
            if (isArray(auth_key)) {
                auth_key = auth_key['join'](',');
            }
            if (typeof channel != 'undefined' && channel != null && channel.length > 0) data['channel'] = channel;
            if (typeof channel_group != 'undefined' && channel_group != null && channel_group.length > 0) {
                data['channel-group'] = channel_group;
            }
            if (jsonp != '0') { data['callback'] = jsonp; }
            if (ttl || ttl === 0) data['ttl'] = ttl;

            if (auth_key) data['auth'] = auth_key;

            data = _get_url_params(data)

            if (!auth_key) delete data['auth'];

            sign_input += _get_pam_sign_input_from_params(data);

            var signature = hmac_SHA256( sign_input, SECRET_KEY );

            signature = signature.replace( /\+/g, "-" );
            signature = signature.replace( /\//g, "_" );

            data['signature'] = signature;

            xdr({
                callback : jsonp,
                data     : data,
                success  : function(response) {
                    _invoke_callback(response, callback, err);
                },
                fail     : function(response) {
                    _invoke_error(response, err);
                },
                url      : [
                    STD_ORIGIN, 'v1', 'auth', 'grant' ,
                    'sub-key', SUBSCRIBE_KEY
                ]
            });
        },

        /*
         PUBNUB.mobile_gw_provision ({
         device_id: 'A655FBA9931AB',
         op       : 'add' | 'remove',
         gw_type  : 'apns' | 'gcm',
         channel  : 'my_chat',
         callback : fun,
         error    : fun,
         });
         */

        'mobile_gw_provision' : function( args ) {

            var callback = args['callback'] || function(){}
                ,   auth_key       = args['auth_key'] || AUTH_KEY
                ,   err            = args['error'] || function() {}
                ,   jsonp          = jsonp_cb()
                ,   channel        = args['channel']
                ,   op             = args['op']
                ,   gw_type        = args['gw_type']
                ,   device_id      = args['device_id']
                ,   params
                ,   url;

            if (!device_id)     return error('Missing Device ID (device_id)');
            if (!gw_type)       return error('Missing GW Type (gw_type: gcm or apns)');
            if (!op)            return error('Missing GW Operation (op: add or remove)');
            if (!channel)       return error('Missing gw destination Channel (channel)');
            if (!PUBLISH_KEY)   return error('Missing Publish Key');
            if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

            // Create URL
            url = [
                STD_ORIGIN, 'v1/push/sub-key',
                SUBSCRIBE_KEY, 'devices', device_id
            ];

            params = { 'uuid' : UUID, 'auth' : auth_key, 'type': gw_type};

            if (op == "add") {
                params['add'] = channel;
            } else if (op == "remove") {
                params['remove'] = channel;
            }

            if (USE_INSTANCEID) data['instanceid'] = INSTANCEID;

            xdr({
                callback : jsonp,
                data     : params,
                success  : function(response) {
                    _invoke_callback(response, callback, err);
                },
                fail     : function(response) {
                    _invoke_error(response, err);
                },
                url      : url
            });

        },

        /*
            PUBNUB.audit({
                channel  : 'my_chat',
                callback : fun,
                error    : fun,
                read     : true,
                write    : true,
                auth_key : '3y8uiajdklytowsj'
            });
        */
        'audit' : function( args, callback ) {
            var callback        = args['callback'] || callback
            ,   err             = args['error']    || function(){}
            ,   channel         = args['channel']
            ,   channel_group   = args['channel_group']
            ,   auth_key        = args['auth_key']
            ,   jsonp           = jsonp_cb();

            // Make sure we have a Channel
            if (!callback)      return error('Missing Callback');
            if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');
            if (!PUBLISH_KEY)   return error('Missing Publish Key');
            if (!SECRET_KEY)    return error('Missing Secret Key');

            var timestamp  = Math.floor(new Date().getTime() / 1000)
            ,   sign_input = SUBSCRIBE_KEY + "\n"
                + PUBLISH_KEY + "\n"
                + "audit" + "\n";

            var data = {'timestamp' : timestamp };
            if (jsonp != '0') { data['callback'] = jsonp; }
            if (typeof channel != 'undefined' && channel != null && channel.length > 0) data['channel'] = channel;
            if (typeof channel_group != 'undefined' && channel_group != null && channel_group.length > 0) {
                data['channel-group'] = channel_group;
            }
            if (auth_key) data['auth']    = auth_key;

            data = _get_url_params(data);

            if (!auth_key) delete data['auth'];

            sign_input += _get_pam_sign_input_from_params(data);

            var signature = hmac_SHA256( sign_input, SECRET_KEY );

            signature = signature.replace( /\+/g, "-" );
            signature = signature.replace( /\//g, "_" );

            data['signature'] = signature;
            xdr({
                callback : jsonp,
                data     : data,
                success  : function(response) {
                    _invoke_callback(response, callback, err);
                },
                fail     : function(response) {
                    _invoke_error(response, err);
                },
                url      : [
                    STD_ORIGIN, 'v1', 'auth', 'audit' ,
                    'sub-key', SUBSCRIBE_KEY
                ]
            });
        },

        /*
            PUBNUB.revoke({
                channel  : 'my_chat',
                callback : fun,
                error    : fun,
                auth_key : '3y8uiajdklytowsj'
            });
        */
        'revoke' : function( args, callback ) {
            args['read']  = false;
            args['write'] = false;
            SELF['grant']( args, callback );
        },
        'set_uuid' : function(uuid) {
            UUID = uuid;
            CONNECT();
        },
        'get_uuid' : function() {
            return UUID;
        },
        'isArray'  : function(arg) {
            return isArray(arg);
        },
        'get_subscribed_channels' : function() {
            return generate_channel_list(CHANNELS, true);
        },
        'presence_heartbeat' : function(args) {
            var callback = args['callback'] || function() {}
            var err      = args['error']    || function() {}
            var jsonp    = jsonp_cb();
            var data     = { 'uuid' : UUID, 'auth' : AUTH_KEY };

            var st = JSON['stringify'](STATE);
            if (st.length > 2) data['state'] = JSON['stringify'](STATE);

            if (PRESENCE_HB > 0 && PRESENCE_HB < 320) data['heartbeat'] = PRESENCE_HB;

            if (jsonp != '0') { data['callback'] = jsonp; }

            var channels        = encode(generate_channel_list(CHANNELS, true)['join'](','));
            var channel_groups  = generate_channel_group_list(CHANNEL_GROUPS, true)['join'](',');

            if (!channels) channels = ',';
            if (channel_groups) data['channel-group'] = channel_groups;

            if (USE_INSTANCEID) data['instanceid'] = INSTANCEID;

            xdr({
                callback : jsonp,
                data     : _get_url_params(data),
                url      : [
                    STD_ORIGIN, 'v2', 'presence',
                    'sub-key', SUBSCRIBE_KEY,
                    'channel' , channels,
                    'heartbeat'
                ],
                success  : function(response) {
                    _invoke_callback(response, callback, err);
                },
                fail     : function(response) { _invoke_error(response, err); }
            });
        },
        'stop_timers': function () {
            clearTimeout(_poll_timer);
            clearTimeout(_poll_timer2);
            clearTimeout(PRESENCE_HB_TIMEOUT);
        },
        'shutdown': function () {
            SELF['stop_timers']();
            shutdown && shutdown();
        },

        // Expose PUBNUB Functions
        'xdr'           : xdr,
        'ready'         : ready,
        'db'            : db,
        'uuid'          : generate_uuid,
        'map'           : map,
        'each'          : each,
        'each-channel'  : each_channel,
        'grep'          : grep,
        'offline'       : function(){ _reset_offline(
            1, { "message" : "Offline. Please check your network settings." })
        },
        'supplant'      : supplant,
        'now'           : rnow,
        'unique'        : unique,
        'updater'       : updater
    };

    function _poll_online() {
        _is_online() || _reset_offline( 1, {
            "error" : "Offline. Please check your network settings. "
        });
        _poll_timer && clearTimeout(_poll_timer);
        _poll_timer = timeout( _poll_online, SECOND );
    }

    function _poll_online2() {
        if (!TIME_CHECK) return;
        SELF['time'](function(success){
            detect_time_detla( function(){}, success );
            success || _reset_offline( 1, {
                "error" : "Heartbeat failed to connect to Pubnub Servers." +
                    "Please check your network settings."
                });
            _poll_timer2 && clearTimeout(_poll_timer2);
            _poll_timer2 = timeout( _poll_online2, KEEPALIVE );
        });
    }

    function _reset_offline(err, msg) {
        SUB_RECEIVER && SUB_RECEIVER(err, msg);
        SUB_RECEIVER = null;

        clearTimeout(_poll_timer);
        clearTimeout(_poll_timer2);
    }
    
    if (!UUID) UUID = SELF['uuid']();
    if (!INSTANCEID) INSTANCEID = SELF['uuid']();
    db['set']( SUBSCRIBE_KEY + 'uuid', UUID );

    _poll_timer  = timeout( _poll_online,  SECOND    );
    _poll_timer2 = timeout( _poll_online2, KEEPALIVE );
    PRESENCE_HB_TIMEOUT = timeout(
        start_presence_heartbeat,
        ( PRESENCE_HB_INTERVAL - 3 ) * SECOND
    );

    // Detect Age of Message
    function detect_latency(tt) {
        var adjusted_time = rnow() - TIME_DRIFT;
        return adjusted_time - tt / 10000;
    }

    detect_time_detla();
    function detect_time_detla( cb, time ) {
        var stime = rnow();

        time && calculate(time) || SELF['time'](calculate);

        function calculate(time) {
            if (!time) return;
            var ptime   = time / 10000
            ,   latency = (rnow() - stime) / 2;
            TIME_DRIFT = rnow() - (ptime + latency);
            cb && cb(TIME_DRIFT);
        }
    }

    return SELF;
}
function crypto_obj() {

    function SHA256(s) {
        return CryptoJS['SHA256'](s)['toString'](CryptoJS['enc']['Hex']);
    }

    var iv = "0123456789012345";

    var allowedKeyEncodings = ['hex', 'utf8', 'base64', 'binary'];
    var allowedKeyLengths = [128, 256];
    var allowedModes = ['ecb', 'cbc'];

    var defaultOptions = {
        'encryptKey': true,
        'keyEncoding': 'utf8',
        'keyLength': 256,
        'mode': 'cbc'
    };

    function parse_options(options) {

        // Defaults
        options = options || {};
        if (!options['hasOwnProperty']('encryptKey')) options['encryptKey'] = defaultOptions['encryptKey'];
        if (!options['hasOwnProperty']('keyEncoding')) options['keyEncoding'] = defaultOptions['keyEncoding'];
        if (!options['hasOwnProperty']('keyLength')) options['keyLength'] = defaultOptions['keyLength'];
        if (!options['hasOwnProperty']('mode')) options['mode'] = defaultOptions['mode'];

        // Validation
        if (allowedKeyEncodings['indexOf'](options['keyEncoding']['toLowerCase']()) == -1) options['keyEncoding'] = defaultOptions['keyEncoding'];
        if (allowedKeyLengths['indexOf'](parseInt(options['keyLength'], 10)) == -1) options['keyLength'] = defaultOptions['keyLength'];
        if (allowedModes['indexOf'](options['mode']['toLowerCase']()) == -1) options['mode'] = defaultOptions['mode'];

        return options;

    }

    function decode_key(key, options) {
        if (options['keyEncoding'] == 'base64') {
            return CryptoJS['enc']['Base64']['parse'](key);
        } else if (options['keyEncoding'] == 'hex') {
            return CryptoJS['enc']['Hex']['parse'](key);
        } else {
            return key;
        }
    }

    function get_padded_key(key, options) {
        key = decode_key(key, options);
        if (options['encryptKey']) {
            return CryptoJS['enc']['Utf8']['parse'](SHA256(key)['slice'](0, 32));
        } else {
            return key;
        }
    }

    function get_mode(options) {
        if (options['mode'] == 'ecb') {
            return CryptoJS['mode']['ECB'];
        } else {
            return CryptoJS['mode']['CBC'];
        }
    }

    function get_iv(options) {
        return (options['mode'] == 'cbc') ? CryptoJS['enc']['Utf8']['parse'](iv) : null;
    }

    return {

        'encrypt': function(data, key, options) {
            if (!key) return data;
            options = parse_options(options);
            var iv = get_iv(options);
            var mode = get_mode(options);
            var cipher_key = get_padded_key(key, options);
            var hex_message = JSON['stringify'](data);
            var encryptedHexArray = CryptoJS['AES']['encrypt'](hex_message, cipher_key, {'iv': iv, 'mode': mode})['ciphertext'];
            var base_64_encrypted = encryptedHexArray['toString'](CryptoJS['enc']['Base64']);
            return base_64_encrypted || data;
        },

        'decrypt': function(data, key, options) {
            if (!key) return data;
            options = parse_options(options);
            var iv = get_iv(options);
            var mode = get_mode(options);
            var cipher_key = get_padded_key(key, options);
            try {
                var binary_enc = CryptoJS['enc']['Base64']['parse'](data);
                var json_plain = CryptoJS['AES']['decrypt']({'ciphertext': binary_enc}, cipher_key, {'iv': iv, 'mode': mode})['toString'](CryptoJS['enc']['Utf8']);
                var plaintext = JSON['parse'](json_plain);
                return plaintext;
            }
            catch (e) {
                return undefined;
            }
        }
    };
}

/**
 * UTIL LOCALS
 */
var NOW        = 1
,    PNSDK      = 'PubNub-JS-' + 'Sencha' + '/' + '3.7.23';



/**
 * LOCAL STORAGE
 */
var db = (function(){
    var ls = typeof localStorage != 'undefined' && localStorage;
    return {
        get : function(key) {
            try {
                if (ls) return ls.getItem(key);
                if (document.cookie.indexOf(key) == -1) return null;
                return ((document.cookie||'').match(
                    RegExp(key+'=([^;]+)')
                )||[])[1] || null;
            } catch(e) { return }
        },
        set : function( key, value ) {
            try {
                if (ls) return ls.setItem( key, value ) && 0;
                document.cookie = key + '=' + value +
                    '; expires=Thu, 1 Aug 2030 20:00:00 UTC; path=/';
            } catch(e) { return }
        }
    };
})();


/**
 * CORS XHR Request
 * ================
 *  xdr({
 *     url     : ['http://www.blah.com/url'],
 *     success : function(response) {},
 *     fail    : function() {}
 *  });
 */
function xdr( setup ) {
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
    ,   xhrtme   = setup.timeout || DEF_TIMEOUT
    ,   timer    = timeout( function(){done(1)}, xhrtme )
    ,   data     = setup.data || {}
    ,   fail     = setup.fail    || function(){}
    ,   success  = setup.success || function(){}
    ,   async    = ( typeof(setup.blocking) === 'undefined' )
    ,   done     = function(failed, response) {
            if (complete) return;
                complete = 1;

            clearTimeout(timer);

            if (xhr) {
                xhr.onerror = xhr.onload = null;
                xhr.abort && xhr.abort();
                xhr = null;
            }

            failed && fail(response);
        };

    // Send
    try {
        xhr = typeof XDomainRequest !== 'undefined' &&
              new XDomainRequest()  ||
              new XMLHttpRequest();

        xhr.onerror = xhr.onabort   = function(){ done(1, xhr.responseText || { "error" : "Network Connection Error"}) };
        xhr.onload  = xhr.onloadend = finished;
        xhr.onreadystatechange = function() {
            if (xhr && xhr.readyState == 4) {
                switch(xhr.status) {
                    case 200:
                        break;
                    default:
                        try {
                            response = JSON['parse'](xhr.responseText);
                            done(1,response);
                        }
                        catch (r) { return done(1, {status : xhr.status, payload : null, message : xhr.responseText}); }
                        return;
                }
            }
        }
        data['pnsdk'] = PNSDK;
        url = build_url(setup.url, data);
        xhr.open( 'GET', url, async);
        if (async) xhr.timeout = xhrtme;
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
 * ERROR
 * ===
 * error('message');
 */
function error(message) { console['error'](message) }

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
 * ATTR
 * ====
 * var attribute = attr( node, 'attribute' );
 */
function attr( node, attribute, value ) {
    if (value) node.setAttribute( attribute, value );
    else return node && node.getAttribute && node.getAttribute(attribute);
}

/**
 * $
 * =
 * var div = $('divid');
 */
function $(id) { return document.getElementById(id) }


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


function get_hmac_SHA256(data,key) {
    var hash = CryptoJS['HmacSHA256'](data, key);
    return hash.toString(CryptoJS['enc']['Base64']);
}

/* =-====================================================================-= */
/* =-====================================================================-= */
/* =-=========================     PUBNUB     ===========================-= */
/* =-====================================================================-= */
/* =-====================================================================-= */

function CREATE_PUBNUB(setup) {


    setup['db'] = db;
    setup['xdr'] = xdr;
    setup['error'] = setup['error'] || error;
    setup['hmac_SHA256']= get_hmac_SHA256;
    setup['crypto_obj'] = crypto_obj();
    setup['params']      = { 'pnsdk' : PNSDK }

    SELF = function(setup) {
        return CREATE_PUBNUB(setup);
    }
    var PN = PN_API(setup);
    for (var prop in PN) {
        if (PN.hasOwnProperty(prop)) {
            SELF[prop] = PN[prop];
        }
    }

    SELF['init'] = SELF;
    SELF['$'] = $;
    SELF['attr'] = attr;
    SELF['search'] = search;
    SELF['bind'] = bind;
    SELF['css'] = css;
    SELF['create'] = create;
    SELF['crypto_obj'] = crypto_obj();

    if (typeof(window) !== 'undefined'){
        bind( 'beforeunload', window, function() {
            SELF['each-channel'](function(ch){ SELF['LEAVE']( ch.name, 1 ) });
            return true;
        });
    }

    // Return without Testing
    if (setup['notest']) return SELF;

    if (typeof(window) !== 'undefined'){
        bind( 'offline', window,   SELF['offline'] );
    }

    if (typeof(document) !== 'undefined'){
        bind( 'offline', document, SELF['offline'] );
    }

    SELF['ready']();
    return SELF;
}
CREATE_PUBNUB['init'] = CREATE_PUBNUB
CREATE_PUBNUB['secure'] = CREATE_PUBNUB
CREATE_PUBNUB['crypto_obj'] = crypto_obj()
PUBNUB = CREATE_PUBNUB({})
typeof module  !== 'undefined' && (module.exports = CREATE_PUBNUB) ||
typeof exports !== 'undefined' && (exports.PUBNUB = CREATE_PUBNUB) || (PUBNUB = CREATE_PUBNUB);

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
