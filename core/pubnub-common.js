var NOW             = 1
,   READY           = false
,   READY_BUFFER    = []
,   PRESENCE_SUFFIX = '-pnpres'
,   DEF_WINDOWING   = 10     // MILLISECONDS.
,   DEF_TIMEOUT     = 10000  // MILLISECONDS.
,   DEF_SUB_TIMEOUT = 310    // SECONDS.
,   DEF_KEEPALIVE   = 60     // SECONDS (FOR TIMESYNC).
,   SECOND          = 1000   // A THOUSAND MILLISECONDS.
,   URLBIT          = '/'
,   PARAMSBIT       = '&'
,   PRESENCE_HB_THRESHOLD = 5
,   PRESENCE_HB_DEFAULT  = 30
,   SDK_VER         = VERSION
,   REPL            = /{([\w\-]+)}/g;

DEBUG = 0;

function pnlog(r) {
    DEBUG && console.log(r);
}

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

function isArray(arg) {
  return !!arg && (Array.isArray && Array.isArray(arg) || typeof(arg.length) === "number")
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

function isEmpty(val){
    return (typeof val === 'undefined' || val === null || val.length == 0);
}

function isNullOrUndef(val) {
    return (typeof val === 'undefined' || val == null);
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

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function PN_API(setup) {
    var SUB_WINDOWING =  +setup['windowing']   || DEF_WINDOWING
    ,   SUB_TIMEOUT   = (+setup['timeout']     || DEF_SUB_TIMEOUT) * SECOND
    ,   KEEPALIVE     = (+setup['keepalive']   || DEF_KEEPALIVE)   * SECOND
    ,   NOLEAVE       = setup['noleave']       || 0
    ,   PUBLISH_KEY   = setup['publish_key']   || setup['write_key'] || 'demo'
    ,   SUBSCRIBE_KEY = setup['subscribe_key'] || setup['read_key']  || 'demo'
    ,   AUTH_KEY      = setup['auth_key']      || ''
    ,   SECRET_KEY    = setup['secret_key']    || ''
    ,   hmac_SHA256   = setup['hmac_SHA256']
    ,   SSL           = setup['ssl']            ? 's' : ''
    ,   ORIGIN        = 'http'+SSL+'://'+(setup['origin']||'pubsub.pubnub.com')
    ,   STD_ORIGIN    = nextorigin(ORIGIN)
    ,   SUB_ORIGIN    = nextorigin(ORIGIN)
    ,   CONNECT       = function(){}
    ,   PUB_QUEUE     = []
    ,   TIME_DRIFT    = 0
    ,   SUB_CALLBACK  = 0
    ,   SUB_CHANNEL   = 0
    ,   SUB_RECEIVER  = 0
    ,   SUB_RESTORE   = setup['restore'] || 0
    ,   SUB_BUFF_WAIT = 0
    ,   TIMETOKEN     = 0
    ,   RESUMED       = false
    ,   CHANNELS      = {}
    ,   STATE         = {}
    ,   PRESENCE_HB_TIMEOUT  = null
    ,   OBJECTS       = {}
    ,   OBJECTS_SYNC_PENDING = {}
    ,   DS_PATH_TTS   = {}
    ,   DS_CALLBACKS  = {}
    ,   DS_CHANNELS   = {}
    ,   UPDATES       = {}
    ,   PRESENCE_HB          = validate_presence_heartbeat(setup['heartbeat'] || setup['pnexpires'] || 0, setup['error'])
    ,   PRESENCE_HB_INTERVAL = setup['heartbeat_interval'] || PRESENCE_HB - 3
    ,   PRESENCE_HB_RUNNING  = false
    ,   NO_WAIT_FOR_PENDING  = setup['no_wait_for_pending']
    ,   COMPATIBLE_35 = setup['compatible_3.5']  || false
    ,   xdr           = setup['xdr']
    ,   params        = setup['params'] || {}
    ,   error         = setup['error']      || function() {}
    ,   _is_online    = setup['_is_online'] || function() { return 1 }
    ,   _build_u      = setup['build_u']
    ,   jsonp_cb      = setup['jsonp_cb']   || function() { return 0 }
    ,   db            = setup['db']         || {'get': function(){}, 'set': function(){}}
    ,   CIPHER_KEY    = setup['cipher_key']
    ,   UUID          = setup['uuid'] || ( db && db['get'](SUBSCRIBE_KEY+'uuid') || '');

    var crypto_obj    = setup['crypto_obj'] ||
        {
            'encrypt' : function(a,key){ return a},
            'decrypt' : function(b,key){return b}
        };

    function _get_url_params(data) {
        if (!data) data = {};
        if (_build_u) data['pnr'] = '' + Math.floor((Math.random() * 100000000000000000000) + 1);
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
            si += k + "=" + encode(params[k]) ;
            if (i != l.length - 1) si += "&"
        }
        return si;
    }

    function validate_presence_heartbeat(heartbeat, cur_heartbeat, error) {
        var err = false;

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

        if (!PRESENCE_HB_INTERVAL || PRESENCE_HB_INTERVAL >= 500 || PRESENCE_HB_INTERVAL < 1 || !generate_channel_list(CHANNELS,true).length){
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
            if (response['error'] && response['message'] && response['payload']) {
                err({'message' : response['message'], 'payload' : response['payload']});
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
        if (typeof response == 'object' && response['error'] &&
            response['message'] && response['payload']) {
            err && err({'message' : response['message'], 'payload' : response['payload']});
        } else {
            err && err(response);
        }
    }

    function _get_id_and_path_from_full_id(full_object_id) {
        var r = {};

        if (isEmpty(full_object_id) || full_object_id.length == 0) return r;

        var full_object_id_split = full_object_id.split('.')

        if (full_object_id_split.length == 0) return r;

        r['id']     = full_object_id_split.shift();
        r['path']   = full_object_id_split.join('.');

        return r;
    }

    function apply_update(o, update) {

        // get update path from response
        var path    = update.location.split(".");
        var action  = update.action;

        var path_length = path.length;

        // references to nodes in the path
        var pathNodes = [];

        // last node name
        var last = path.pop();
        path.shift();

        // x is the place where data exists
        var x = o;


        //   ????
        var continue_update = true;

        // iterate over path elements

        for (var p in path) {
            try {

                // if x does not contain a node with path reached till now
                // create the node . even if what x contains is not an object
                // create a new node at the location
                if (!x[path[p]] || typeof x[path[p]]  !== 'object') {
                    x[path[p]] = {};
                }
            } catch (e) {
                // add new object at the path, this is to create the same
                // tree structure in our internal object
                x[path[p]] = {};
            }
            // x to next node in the path
            x = x[path[p]];

            // push node to nodes array
            pathNodes.push(x);
        }

        // handle updation
        if (action == 'merge' || action == 'push'  || action == 'replace') {

            if (path_length > 0) {
                try {

                    if (!x[last]['pn_tt'] || x[last]['pn_tt'] < update.timetoken) {
                        x[last]['pn_val'] = update.value;
                        x[last]['pn_tt'] = update.timetoken;
                    } else {
                        return null;
                    }
                } catch (e) {
                    x[last] = {}
                    x[last]['pn_val'] = update.value;
                    x[last]['pn_tt'] = update.timetoken;
                }
            } else {
                try {
                    if (o['pn_tt'] < update.timetoken) {
                        o['pn_val'] = update.value;
                        o['pn_tt'] = update.timetoken;
                    }
                } catch (e) {
                    o = {}
                    o['pn_val'] = update.value;
                    o['pn_tt'] = update.timetoken;
                }
            }
        }
        // handle deletion
        else if (action == 'delete') {

            if (path_length  > 0) {

                // delete the last node

                if (!isEmpty(x[last])) update.value = x[last]['pn_val'];

                delete x[last]

                // now return back to root while examining each node on path
                // if some node has become childless delete that node.

                for (var i = pathNodes.length - 1; i >= 1; i--) {
                    if (pathNodes[i] && Object.keys(pathNodes[i]).length == 0) {
                        delete pathNodes[i-1][path[i]]
                    }
                }

                if ( o[path[0]] && Object.keys(o[path[0]]).length == 0) {
                    delete o[path[0]];
                }
            } else {
                // complete tree empty now due to no non leaf node existence
                o = null;
            }
        }
        // return update at , need to reconsider
        return update.value;
    }
    function apply_updates(o, callback, trans_id) {
        var applied = false;
        var update = UPDATES[trans_id];

        var update_at;

        // apply update if update is complete
        if (update && update.complete == true) {
            var actions_list = update.list;
            var callback_param_list = [];

            // traverse actions list and apply each action
            for (var i in actions_list) {
                // action event
                var action_event = actions_list[i];

                // apply event, update at value will be returned
                //action_event.update_at =
                action_event.value = apply_update(o, action_event);

                if (action_event.value) {
                    applied = true;
                }

                // parse location and set for callback parameter data
                action_event.location = action_event.location.split("pn_ds_")[1];
                action_event.key = action_event.location.split(".")[action_event.location.split(".").length-1];
                // cleanup
                delete action_event.trans_id;
                delete action_event.timetoken;
            }
            // invoke callback with actions_list as argument
            applied && callback && callback(actions_list);

            // delete update

            delete UPDATES[trans_id];
        }
    }

    function apply_all_updates(o, callback) {

        // iterate trhough all updates and apply
        for (var t in UPDATES) {
            apply_updates(o, callback, t);
        }
    }

    /*
        Get to be used in Data sync
    */
    function get(args, callback) {
        var callback         = args['callback'] || callback
        ,   err              = args['error']    || function(){}
        ,   object_id        = args['object_id']
        ,   path             = args['path']
        ,   next_page        = args['next_page']
        ,   obj_at           = args['obj_at']
        ,   page_max_bytes   = args['page_max_bytes']
        ,   jsonp            = jsonp_cb()
        ,   auth_key         = args['auth_key'] || AUTH_KEY
        ,   data             = { 'uuid' : UUID, 'auth' : auth_key };

        // Make sure we have a Channel
        if (!object_id)     return error('Missing Object Id');
        if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

        if (!path || path.length == 0) {
            var object_id_split = object_id.split('.');
            object_id       = object_id_split.shift();
            path            = object_id_split.join('.');
        }

        var url = [
            STD_ORIGIN, 'v1', 'datasync',
            'sub-key', SUBSCRIBE_KEY, 'obj-id', encode(object_id)
        ];

        if (path) {
            url.push(encode(path.split(".").join("/")));
        }

        if (jsonp != '0') { data['callback'] = jsonp; }

        //if (start_at) { data['start_at'] = start_at; }
        //if (obj_at)   { data['obj_at']   = obj_at; }
        if (page_max_bytes)   { data['page_max_bytes']   = page_max_bytes; }

        xdr({
            callback : jsonp,
            data     : _get_url_params(data),
            success  : function(response) {
                callback && callback(response);
            },
            fail     : function(response) {
                _invoke_error(response, err);
            },
            url      : url
        });
    }

    /*
        This method does merge at one level
    */
    function mergeAtOneLevel(a, b) {

        // if a is null , return b

        if ( a == null ) {
            return b;
        }

        // if both a and b exist, then
        if (a && b) {

            // iterate over keys in b
            for (var key in b) {

                // if key does not exist in a, then add add
                // key to a
                if (!a[key] || typeof b[key] !== 'object') {
                    a[key] = b[key];
                }

                // if key exists in a, then do a recursive merge at
                // next level
                else {

                    a[key] = mergeAtOneLevel(a[key], b[key]);

                }
            }
        }

        // returned reference to merged node
        return a;
    }

    function objectToSortedArray(obj) {
        var keys = [];
        var arr = [];
        for(var key in obj){
            if(obj.hasOwnProperty(key)){
                keys.push(key);
            }
        }
        keys.sort();
        for (var k in keys) {
            var v = obj[keys[k]]['pn_val'];
            if (typeof v !== 'undefined') {
                arr.push(v);
            } else if (isPnList(obj[keys[k]])) {
                arr.push(objectToSortedArray(obj[keys[k]]));
            } else {
                arr.push(obj[keys[k]]);
            }
        }
        return arr;
    }

    function getObjectKeysSorted(obj) {
        var keys = [];
        var arr = [];
        for(var key in obj){
            if(obj.hasOwnProperty(key)){
                keys.push(key);
            }
        }
        keys.sort();
        return keys;
    }

    function isPnList(l) {
        for(var key in l){
            if(l.hasOwnProperty(key)){
                if (key.indexOf("-") == 0 && key.indexOf("!") > 0)
                    return true;
            }
        }
        return false;
    }

    function _get_object_id_and_path_from_location(s) {
        var r = {};
        var object_id_split = s['split']('.');

        // prepare object

        r['object_id']          = object_id_split[0];
        object_id_split['shift']();
        r['path']            = object_id_split['join']('.');
        return r;
    }

    function _get_ref(r, path) {

        r['path'] = path;
        return r;
    }




    function _get_object_by_path(object_id, path) {
        var split = [];

        if (path) split = path.split('.');

        var o = OBJECTS[object_id];

        for (var s in split) {
            if (split[s] && split[s].length > 0) {
                try {
                    o = o[split[s]];
                } catch (e) {
                    return null;
                }
            }
        }
        return o;
    }

    function _get_object_by_location(location) {
        var split = [];
        split = location.split('.');

        var object_id = split.shift();
        if (!object_id) return null;

        var path = split.join('.');
        return _get_object_by_path(object_id, path);

    }

    function _get_object_pnval_by_location(location) {
        var split = [];
        split = location.split('.');

        var object_id = split.shift();
        if (!object_id) return null;

        var path = split.join('.');

        var o = _get_object_by_location(location);

        if (!isEmpty(o))
            return o['pn_val'];
        else
            return null;

    }

    function _get_parent_by_path(obj, path) {
        if (!path || path.length == 0) return null;
        var split = path.split('.');
        split.pop()
        var o = OBJECTS[obj];
        for (var s in split) {
            try {
                o = o[split[s]];
            } catch (e) {
                return null;
            }
        }
        return o;
    }

    function _get_object_by_path_with_create(obj, path) {
        var split = path.split('.');
        var o = obj;
        for (var s in split) {
            if (o[split[s]]) {
                o = o[split[s]];
            } else {
                o[split[s]] = {};
                o = o[split[s]];
            }
        }
        return o;
    }



    function _get_parent_by_path_with_create(obj, path) {

        var split = path.split('.');

        if (split[split.length - 1] == '') split.pop();
        split.pop()

        if (split.length == 0) {
            return obj;
        }
        var o = obj;
        for (var s in split) {

            if (o[split[s]]) {
                o = o[split[s]];
            } else {
                o[split[s]] = {};
                o = o[split[s]];
            }

        }
        return o;
    }

    function _get_channels_for_subscribe() {
        var channels = "";
         for (var dsc in DS_CHANNELS) {
            if (DS_CHANNELS[dsc]) {
                if (channels.length > 0) channels += ',';
                var channel = dsc;
                channels +=  'pn_ds_' + channel + ','   +
                             'pn_ds_'  + channel + '.*,' +
                             'pn_dstr_' + channel.split('.')[0];
            }
         }
         return channels;
    }

    function _prepare_new_ds_channel_list(location) {

        if (DS_CHANNELS[location]) {
            // Already synced to the location
            return true;
        }


        var parent_location = false;

        for (var channel in DS_CHANNELS) {

            if (location.indexOf(channel + '.') == 0 ) {
                return channel;
            }

        }

        if (!parent_location) DS_CHANNELS[location] = true;

        // return parent location if we are already listening to parent location
        return parent_location;
    }


    function read_recursive(object_id, path, callback, error, next_page, timetoken, done) {
        get({
            'object_id' : object_id,
            'path'      : path,
            'timetoken' : timetoken,
            'next_page'  : next_page,
            'callback'  : function(r) {
                var location = object_id;
                var last_node_key = object_id;
                if (path && path.length) {
                    location = location + '.' + path;
                    last_node_key = path.split('.').pop();
                }

                var next_page = r['next_page'];

                var payload = r['payload'];

                var parent = _get_parent_by_path_with_create(OBJECTS,location);

                // if payload is object, merge else assign
                if (typeof payload === 'object') {
                    parent[last_node_key] = mergeAtOneLevel(parent[last_node_key], payload);
                } else {
                    parent[last_node_key] = payload;
                }

                // till next_page is null in response keep reading recursively
                if (!next_page || (next_page && next_page == "null")) {

                    done && done(location);


                } else {
                    // sync incomplete
                    synced = false;

                    // read more data
                    read_recursive(object_id, path , callback, error,next_page);
                }

            },
            'error'     : function(r) {

               // error
               error && error(r);
            }
        })
    }

    function resync_all() {

        UPDATES = {};
        for (var c in OBJECTS) {

            read_recursive(c, null, null, null, null, null, function(location){

                var callbacks = _get_all_callbacks_by_object_id(location, 'resync');

                for (var id in callbacks) {
                    var resync_callback     = callbacks[id];

                    var object              = _get_object_by_location(id);
                    var callback_data       = {};

                    callback_data['data']   = object;
                    callback_data['value']  = function(path) {
                        return value(callback_data['data'], path);
                    }

                    resync_callback(callback_data);
                }

            });
        }

    }

    function resync(object_id, callback) {

        read_recursive(object_id, null, null, null, null, null, function(location){

            var callbacks = _get_all_callbacks_by_object_id(location, 'resync');

            callback && callback();
            for (var id in callbacks) {
                var resync_callback     = callbacks[id];

                var object              = _get_object_by_location(id);
                var callback_data       = {};

                callback_data['data']   = object;
                callback_data['value']  = function(path) {
                    return value(callback_data['data'], path);
                }

                resync_callback(callback_data);
            }
        });
    }

    /*
        This is the method which does hardwork in data sync.
        It subscribes to the required channels, fetches initial copy of data
        sync method is wrapper over this method and routes the incoming updates
        to callbacks for various sync locations.
    */

    function get_synced_object(args) {
        var callback         = args['callback']
        ,   err              = args['error']    || function(){}
        ,   connect          = args['connect']
        ,   disconnect       = args['disconnect']
        ,   reconnect        = args['reconnect']
        ,   object_id        = args['object_id']
        ,   path             = args['path'];


        var location            = (!isEmpty(path))?object_id + '.' + path:object_id;
        var split_path          = path.split('.');
        var last_node_key       = split_path[split_path.length -1];


        if (!last_node_key || last_node_key.length == 0) {
            last_node_key = object_id;
        }

        var parent_location = _prepare_new_ds_channel_list(location);

        if (parent_location) {
            /*
                since we are already listening to a parent location,
                it means we already have data for this object id.
                lets find the object based on the path from existing
                tree and return. also if parent_location object is ready
                for use already, then lets mark this object callbacks also
                ready to be invoked.
            */

            var o = OBJECTS[object_id];

            for (var p in split_path) {
                var sp = split_path[p];
                if (sp && sp.length > 0) {
                    if (!o[sp]) o[sp] = {};
                    o = o[sp];
                }
            }

            if (DS_CALLBACKS[location] && DS_CALLBACKS[parent_location] &&
                DS_CALLBACKS[parent_location]['is_ready']) {
                DS_CALLBACKS[location]['is_ready'] = true;
            }
            return o;
        }



        // Is object sync complete ? !!! REFACTORING POTENTIAL
        var synced = false;

        // depth at which we are listening   !!!! REFACTORING POTENTIAL
        var depth = 0;


        // prepare the path argument
        if (path) {
            var split_array = path['split'](".");
            depth = split_array['length'];
        }


        var parent = _get_parent_by_path_with_create(OBJECTS,location);

        if (!parent[last_node_key]) parent[last_node_key] = {};



        /*
            subscribe to 3 channels . for ex. if obj id is 'ab'
            a. normal channel       pn_ds_ab
            b. wildcard channel     pn_ds_ab.*
            c. transaction channel  pn_dstr_ab
        */
        SELF['subscribe']({

            'channel'     : _get_channels_for_subscribe(),

            'connect'     : function(r, timetoken) {

                if (r.indexOf('dstr') < 0 && r.indexOf('*') < 0) {
                    // start reading initial copy of object and populate internal copy

                    var obs = r.split('pn_ds_')[1].split('.');
                    var object_id = obs.shift(); var path = obs.join('.');  // extract object id and path from incoming channel

                    read_recursive(object_id, path, callback, error, null, timetoken, function(location){

                        // all updates recieved , now apply
                        //apply_all_updates(parent[last_node_key], callback);
                        apply_all_updates(OBJECTS[object_id], callback);
                        
                        // sync complete
                        synced = true;

                        // invoke connect callback
                        connect && connect(location);

                    });
                }
            },
            'callback'    : function(r,c,ch) {

                if (!r['location']) {
                    r['location'] = ch;
                }

                if (c[0].length >= 100 && r.location) {
                    var object_id = r.location.split('.')[0].split('pn_ds_')[1];
                    OBJECTS_SYNC_PENDING[object_id] = true;
                }

                var trans_id    = r['trans_id'];
                var action      = r['action'];
                var status      = r['status'];

                if (action) { // if action, store it in list with transaction id as key

                    if (!UPDATES[trans_id])
                        UPDATES[trans_id] = {'complete' : false, 'list' : []}
                    UPDATES[trans_id]['list']['push'](r);

                } else if (status) { // if transaction complete , apply the updates

                    if ( status == 'complete' ) {
                        if (UPDATES[trans_id]) {


                            var location = UPDATES[trans_id].list[0].location;

                            var object_id = (location.split('.')[0]).split('pn_ds_')[1];

                            if (OBJECTS_SYNC_PENDING[object_id]) {
                                resync(object_id, function(){
                                    delete UPDATES[trans_id];
                                    delete OBJECTS_SYNC_PENDING[object_id];
                                });
                            } else {
                                UPDATES[trans_id]['complete'] = true;

                                if (!OBJECTS[object_id]) OBJECTS[object_id] = {};

                                if (synced) apply_updates(OBJECTS[object_id], callback, trans_id);
                            }


                        } else {
                            resync_all();
                        }
                    }
                }
            },
            'error'       : function(r) {
                var errobj = {'message' : 'Data Sync Error'};

                //error
                if (r && r['message']) errobj['message'] = r['message'];

                err(errobj);

            },
            'disconnect'       : function(r) {
                if (r && r.indexOf('pn_dstr_') == 0) {
                    disconnect && disconnect();
                }
            },
            'reconnect'       : function(r) {
                if (r && r.indexOf('pn_dstr_') == 0) {
                    reconnect && reconnect();
                }
            }
        });

        return [parent[last_node_key], resync];
    }

    function get_list_element_ids(object) {

        if (isEmpty(object)) return [];

        if (!isPnList(object) ){
            return [];
        }


        var patha = (path)?path['split']("."):[];

        var d = object;

        for (var p in patha) {
            var key = patha[p];
            try {
                if (!isEmpty(d[key])) d = d[key]
            } catch (e) {
                return null;
            }
        }
        if (!isEmpty(d['pn_val'])) {
            return d['pn_val'];

        } else if (isPnList(d)) { // array

            return objectToSortedArray(d);

        } else { // object

            return d;

        }
    }
    function value(object, path) {

        if (isEmpty(object)) return {};

        if (!path && isEmpty(object['pn_val']) && !isPnList(object) ){
            return object;
        }


        var patha = (path)?path['split']("."):[];

        var d = object;

        for (var p in patha) {
            var key = patha[p];
            try {
                if (!isEmpty(d[key])) {
                    d = d[key];
                } else {
                    return null;
                }
            } catch (e) {
                return null;
            }
        }

        if (!isEmpty(d['pn_val'])) {
            return d['pn_val'];

        } else if (isPnList(d)) { // array

            return objectToSortedArray(d);

        } else { // object
            
            return d;

        }
    }

    function transform(k,v) {

        if (v && !isEmpty(v['pn_val'])) {
            return v['pn_val'];

        } else if (isPnList(v)) { // array

            return objectToSortedArray(v);

        } else { // object

            return v;
        }
    }

    function _get_callback_data(event_type, changes, callback_location, path, update_at) {
        var isplit      = callback_location.split(".");
        var object_id   = isplit.shift();

        var p           = isplit.join('.');
        var data        = _get_object_by_path(object_id, p);

        var callback_data = {};
        callback_data['delta'] = changes;
        callback_data['type'] = 'merge';
        callback_data['data'] = JSON.parse(JSON.stringify(data, transform) || null);

        if (isPnList(data)) {
            callback_data['each'] =  function(callback) {
                if(!isPnList(data)) {
                    return null;
                }
                var keys = Object.keys(data);
                for (var key in keys) {
                    callback && callback(SELF['sync'](location + '.' + keys[key]));
                }
            }
        }
        callback_data['parent'] = _get_parent_by_path(object_id, p);
        callback_data['value'] = 
            (function(local_data){
                return function(path) {
                    return value(local_data, path);
                }
            })(callback_data['data']);

        callback_data['path'] = update_at;
        return callback_data;
    }

    function invoke_ready_callbacks() {
        for (var callback_location in DS_CALLBACKS) {

            var callback_object         = DS_CALLBACKS[callback_location];
            var ready_callback          = callback_object['ready'];

            var callback_location_split = _get_id_and_path_from_full_id(callback_location);

            var oid                     = callback_location_split['id'];
            var path                    = callback_location_split['path'];

            if (callback_object['is_ready'] &&
                !callback_object['ready_called'] &&
                ready_callback) {
                var callback_data       = {};
                var data                = _get_object_by_path(oid, path);
                callback_data['type'] = 'ready';
                callback_data['data'] = JSON.parse(JSON.stringify(data, transform) || null);
                if (isPnList(data)) {
                    callback_data['each'] =  function(callback) {
                        if(!isPnList(data)) {
                            return null;
                        }
                        var keys = getObjectKeysSorted(data);
                        for (var key in keys) {
                            callback && callback(SELF['sync'](callback_location + '.' + keys[key]));
                        }
                    }
                }
                callback_data['value'] = 
                (function(local_data){
                    return function(path) {
                        return value(local_data, path);
                    }
                })(callback_data['data']);

                callback_object['ready_called'] = true;
                ready_callback(callback_data);
            }

        }

    }



    function set_callback(object_id, callback, type) {

        if (!DS_CALLBACKS[object_id]) {
            DS_CALLBACKS[object_id] = {
                'ready_called' : false,
                'is_ready' : false
            };
        }
        DS_CALLBACKS[object_id][type] = callback;
        invoke_ready_callbacks();
    }

    function get_callback(object_id, type) {

        try {
            return DS_CALLBACKS[object_id][type];
        } catch (e)  {
            return null;
        }
    }

    function _get_all_callbacks(type) {
        var callbacks = {};

        for (var c in DS_CALLBACKS) {
            if (DS_CALLBACKS[c][type]) {
                callbacks[c] = DS_CALLBACKS[c][type];
            }
        }
        return callbacks;
    }

    function _get_all_callbacks_by_object_id(object_id, type) {
        var callbacks = {};
        for (var c in DS_CALLBACKS) {
            if (c.indexOf(object_id + '.') == 0 &&  DS_CALLBACKS[c][type]) {
                callbacks[c] = DS_CALLBACKS[c][type];
            }
        }
        return callbacks;
    }

    function _get_callbacks(location, type) {
        var callbacks = [];
        for (var c in DS_CALLBACKS) {
            if (location.indexOf(c) == 0) {
                DS_CALLBACKS[c][type] && callbacks.push(DS_CALLBACKS[c][type]);
            }
        }
        return callbacks;
    }

    function _get_callbacks_with_location(location, type) {

        var callbacks = {};
        for (var c in DS_CALLBACKS) {
            if (location && location.indexOf(c) == 0) {
                if(DS_CALLBACKS[c][type]) {
                    callbacks[c] = DS_CALLBACKS[c][type];
                }
            }
        }

        return callbacks;
    }


    function getKeyByValue(data, value) {
        if (!data) return null;

        var keys = _object_to_key_list(data);

        for (var i in keys) {
            if (data[keys[i]]['pn_val'] === value) return keys[i];
        }
        return null;
    }

    function merge(args, callback) {
        var callback        = args['callback'] || args['success'] || callback
        ,   err              = args['error']    || function(){}
        ,   object_id        = args['object_id']
        ,   content          = args['data']
        ,   jsonp            = jsonp_cb()
        ,   auth_key         = args['auth_key'] || AUTH_KEY
        ,   sort_key         = args['sort_key']
        //,   data             = { 'uuid' : UUID, 'auth' : auth_key, 'test_tr_only' : 1}
        ,   data             = { 'uuid' : UUID, 'auth' : auth_key}
        ,   mode             = args['mode'] || 'PATCH'
        ,   path             = args['path'];

        // Make sure we have a Channel
        if (!object_id)             return error('Missing Object Id');
        if (isNullOrUndef(content)) return error('Missing Data');
        if (!SUBSCRIBE_KEY)         return error('Missing Subscribe Key');
        if (!PUBLISH_KEY)           return error('Missing Publish Key');

        if (!path || path.length == 0) {
            var object_id_split = object_id.split('.');
            object_id       = object_id_split.shift();
            path            = object_id_split.join('.');
        }

        var url = [
            STD_ORIGIN, 'v1', 'datasync','sub-key', SUBSCRIBE_KEY,
             'pub-key', PUBLISH_KEY,'obj-id', encode(object_id)
        ];

        if (path) {
            url['push'](encode(path['split'](".")['join']("/")));
        }

        if (jsonp != '0') { data['callback'] = jsonp; }

        if (sort_key && sort_key.length > 0) data['sort_key'] = sort_key;

        xdr({
            callback : jsonp,
            data     : _get_url_params(data),
            body     : JSON['stringify'](content),
            success  : function(response) {
                _invoke_callback(response, callback, err);
            },
            fail     : function(response) {
                _invoke_error(response, err);
            },
            url      : url,
            mode  : mode
        });
    }
    function remove(args, callback) {
        var callback         = args['callback'] || args['success'] || callback
        ,   err              = args['error']    || function(){}
        ,   jsonp            = jsonp_cb()
        ,   auth_key         = args['auth_key'] || AUTH_KEY
        ,   data             = { 'uuid' : UUID, 'auth' : auth_key }
        ,   object_id        = args['object_id']
        ,   path             = args['path'];

        // Make sure we have a Channel
        if (!object_id)     return error('Missing Object Id');
        if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

        var oid_split = object_id.split('.');
        object_id = oid_split.shift();
        if (!path) {
            path = oid_split.join('.');
        }

        var url = [
            STD_ORIGIN, 'v1', 'datasync','sub-key', SUBSCRIBE_KEY,
             'pub-key', PUBLISH_KEY, 'obj-id', encode(object_id)
        ];

        if (path) {
            url['push'](encodeURI(path['split'](".")['join']("/")));
        }

        if (jsonp != '0') { data['callback'] = jsonp; }

        xdr({
            callback : jsonp,
            data     : _get_url_params(data),
            success  : function(response) {
                _invoke_callback(response, callback, err);
            },
            fail     : function(response) {
                _invoke_error(response, err);
            },
            url      : url,
            mode : 'DELETE'
        });
    }



    function replace(args, callback) {
        args['mode'] = 'PUT'
        merge(args, callback);
    }
    function push(args, callback) {
        args['mode'] = 'POST'
        merge(args, callback);
    }

    function get_wrapper(args, callback) {
         var callback        = args['callback'] || args['success'] || callback
        ,   err              = args['error']    || function(){}
        ,   object_id        = args['object_id']
        ,   path             = args['path']
        ,   start_at         = args['start_at']
        ,   obj_at           = args['obj_at']
        ,   page_max_bytes   = args['page_max_bytes']
        ,   jsonp            = jsonp_cb()
        ,   auth_key         = args['auth_key'] || AUTH_KEY
        ,   data             = { 'uuid' : UUID, 'auth' : auth_key };

        // Make sure we have a Channel
        if (!object_id)     return error('Missing Object Id');
        if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

        var obj = null;
        function read(start_at,callback, error) {
            get({
                'object_id' : object_id,
                'path'      : path,
                'start_at'  : start_at,
                //'page_max_bytes' : 5,
                'callback'  : function(r) {
                    if (obj == null && typeof r['payload'] !== 'object') {
                        callback && callback(r['payload']);
                        return;
                    }
                    obj = mergeAtOneLevel(obj,r['payload']);
                    if (!r['next_page'] || (r['next_page'] && r['next_page'] == "null")) {
                        callback && callback(obj);
                    } else {
                        read(r['next_page'],callback, error);
                    }

                },
                'error'     : error
            })
        }
        read(null,callback, error);
    }

    // Announce Leave Event
    var SELF = {
        'LEAVE' : function( channel, blocking, callback, error ) {

            var data   = { 'uuid' : UUID, 'auth' : AUTH_KEY }
            ,   origin = nextorigin(ORIGIN)
            ,   callback = callback || function(){}
            ,   err      = error    || function(){}
            ,   jsonp  = jsonp_cb();

            // Prevent Leaving a Presence Channel
            if (channel.indexOf(PRESENCE_SUFFIX) > 0) return true;

            if (COMPATIBLE_35) {
                if (!SSL)         return false;
                if (jsonp == '0') return false;
            }

            if (NOLEAVE)  return false;

            if (jsonp != '0') data['callback'] = jsonp;

            xdr({
                blocking : blocking || SSL,
                timeout  : 2000,
                callback : jsonp,
                data     : _get_url_params(data),
                success  : function(response) {
                    _invoke_callback(response, callback, err);
                },
                fail     : function(response) {
                    _invoke_error(response, err);
                },
                url      : [
                    origin, 'v2', 'presence', 'sub_key',
                    SUBSCRIBE_KEY, 'channel', encode(channel), 'leave'
                ]
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
        'set_heartbeat' : function(heartbeat) {
            PRESENCE_HB = validate_presence_heartbeat(heartbeat, PRESENCE_HB_INTERVAL, error);
            PRESENCE_HB_INTERVAL = (PRESENCE_HB - 3 >= 1)?PRESENCE_HB - 3:1;
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

        'snapshot' : function(object_id, success, error) {
            var args = {'error' : error || function(){}};

            var snapshot_callback   = success;

            args['callback'] = function(response){
                var callback_data = {};
                callback_data['data'] = JSON.parse(JSON.stringify(response),transform);
                callback_data['value'] = function(path) {
                    return value(callback_data['data'], path);
                }
                snapshot_callback && snapshot_callback(callback_data);
            };
            args['object_id'] = object_id;

            get_wrapper(args);
        },

        'merge'  : function(object_id, data, success, error) {

            merge({
                'object_id' : object_id,
                'data'      : data,
                'callback'  : success,
                'error'     : error
            });

        },

        'replace' : function(object_id, data, success, error) {

            replace({
                'object_id' : object_id,
                'data'      : data,
                'callback'  : success,
                'error'     : error
            });
        },

        'remove'  : function(object_id, success, error) {
            remove({
                'object_id' : object_id,
                'callback'  : success,
                'error'     : error
            });
        },

        'push'    : function(object_id, data, success, error) {
            merge({
                'object_id' : object_id,
                'data'      : data,
                'callback'  : success,
                'error'     : error,
                'mode'      : 'POST'
            });
        },
        'push_with_sort_key'    : function(object_id, data, sort_key, success, error) {
            merge({
                'object_id' : object_id,
                'sort_key'  : sort_key,
                'data'      : data,
                'callback'  : success,
                'error'     : error,
                'mode'      : 'POST'
            });
        },

        /*
            user facing sync method. returns a reference which can be used for
            setting callbacks . also provides wrappers for merge, remvoe, replace

            This method takes location as input, location is a fully qualified name
            with object_id and path .   location = object_id + '.' + path
        */
        'sync' : function(location) {


            var split_o     = _get_object_id_and_path_from_location(location);


            var object_id   = split_o['object_id'];
            var path        = split_o['path'];

            // DS_CALLBACKS keeps track of callbacks registered at various locations

            if (!DS_CALLBACKS[location]) {
                DS_CALLBACKS[location] = {
                    'ready_called'  : false,
                    'is_ready'      : false
                };
            }

            var internal;

            // ref is the object reference that will be returned
            var ref = {

                // callbacks like change, ready etc can be set here
                'on' : {
                    'change'  : function(callback) {
                        set_callback(location, callback, 'change');
                    },
                    'ready'  : function(callback) {
                        set_callback(location ,callback, 'ready');
                    },
                    'merge'  : function(callback) {
                        set_callback(location, callback, 'merge');
                    },
                    'replace'     : function(callback) {
                        set_callback(location, callback, 'replace');
                    },
                    'remove'  : function(callback) {
                        set_callback(location, callback,'remove');
                    },
                    'error'   : function(callback) {
                        set_callback(location, callback, 'error');
                    },
                    'resync'   : function(callback) {
                        set_callback(location, callback, 'resync');
                    },
                    // network events
                    'network' : {
                        'connect'       : function(callback) {
                            set_callback(location, callback,'network.connect');
                        },
                        'disconnect'    : function(callback) {
                            set_callback(location, callback,'network.disconnect');
                        },
                        'reconnect'     : function(callback) {
                            set_callback(location, callback,'network.reconnect');
                        }
                    }
                },

                'merge'  : function(data, success, error) {

                    merge({
                        'object_id' : object_id,
                        'path'      : path,
                        'data'      : data,
                        'callback'  : success,
                        'error'     : error
                    });

                },

                'replace' : function(data, success, error) {

                    replace({
                        'object_id' : object_id,
                        'path'      : path,
                        'data'      : data,
                        'callback'  : success,
                        'error'     : error
                    });
                },

                'remove'  : function(success, error) {
                    remove({
                        'object_id' : object_id,
                        'path'      : path,
                        'callback'  : success,
                        'error'     : error
                    });
                },

                'push'    : function(data, success, error) {
                    merge({
                        'object_id' : object_id,
                        'path'      : path,
                        'data'      : data,
                        'callback'  : success,
                        'error'     : error,
                        'mode'      : 'POST'
                    });
                },
                'push_with_sort_key'    : function(data, sort_key, success, error) {
                    merge({
                        'object_id' : object_id,
                        'path'      : path,
                        'sort_key'  : sort_key,
                        'data'      : data,
                        'callback'  : success,
                        'error'     : error,
                        'mode'      : 'POST'
                    });
                }

            }


            // prepare internal object

        var so =  get_synced_object({
                    'object_id'  : object_id,
                    'path'       : path,
                    'callback'   : function(r) {
                        internal = _get_object_by_path(object_id,path);

                        if (r[0]) {
                            var action      = r[0]['action'];
                            var location    = r[0]['location'];
                            var update_at   = r[0]['updateAt'];
                            var event_type  = '';



                            if (action === 'merge' || action === 'push') {              // update event

                                event_type = 'merge';

                            } else if (action === 'delete') {       // delete event

                                event_type = 'remove';

                            }

                            else if (action === 'replace-delete' || action === 'replace') {     // set events


                                event_type = 'replace';

                            }


                            var callbacks           = _get_callbacks_with_location(location, event_type);
                            var callbacks_change    = _get_callbacks_with_location(location, 'change');

                            for (var callback_location in callbacks) {

                                var callback = callbacks[callback_location];

                                callback && callback(_get_callback_data(event_type, r, callback_location, path,update_at));

                            }
                            for (var callback_location in callbacks_change) {
                                var change = callbacks_change[callback_location];

                                change && change(_get_callback_data('change', r, callback_location, path,update_at));
                            }
                        }
                    },
                    'error' : function(r) {
                        var error = get_callback(location,'error');
                        //resync_all();
                        error && error(r);
                    },
                    'connect'    : function(r) {
                        var network_connect = get_callback(location, 'network.connect');
                        network_connect && network_connect(r);

                        for (var c in DS_CALLBACKS) {
                            if (c.indexOf(r + '.') == 0 || c === r) {
                                var cbo = DS_CALLBACKS[c];
                                cbo['is_ready'] = true;
                            }
                        }
                        invoke_ready_callbacks();

                    },
                    'reconnect'  : function(r) {
                        var network_reconnect = get_callback(location, 'network.reconnect');
                        resync_all();
                        network_reconnect && network_reconnect(r);
                    },
                    'disconnect' : function(r) {
                        var network_disconnect = get_callback(location, 'network.disconnect');
                        network_disconnect && network_disconnect(r)
                    }

                })


            var resync  = so[1];
            internal    = _get_object_by_path(object_id,path);

            ref['resync'] = function() {
                resync_all();
            };

            if (isPnList(internal)) {
                ref['each'] = function(callback) {
                    internal = _get_object_by_path(object_id,path);
                    if(!isPnList(internal)) {
                        return null;
                    }
                    var keys = getObjectKeysSorted(internal);
                    for (var key in keys) {
                        callback && callback(SELF['sync'](location + '.' + keys[key]));
                    }
                };
            }

            ref['value'] = function(path1) {
                internal = _get_object_by_path(object_id,path);
                return value(internal,path1);
            };

            ref['get'] = function(path) {
                return SELF['sync'](path ? (location + '.' + path) : location);
            };

            ref['pop'] = function(success, error) {
                internal = _get_object_by_path(object_id,path);
                if(!isPnList(internal)) {
                    return null;
                }
                var keys = getObjectKeysSorted(internal);
                var last_key = keys.pop();

                remove({
                    'object_id' : location + '.' + last_key,
                    'callback'  : success,
                    'error'     : error
                });
                return value(internal[last_key]);
            };
            ref['removeByIndex'] = function(index, success, error) {
                internal = _get_object_by_path(object_id,path);
                if(!isPnList(internal)) {
                    return null;
                }
                var keys = getObjectKeysSorted(internal);
                try {
                    var key = keys[index];
                    remove({
                        'object_id' : location + '.' + key,
                        'callback'  : success,
                        'error'     : error
                    });
                    return value(internal[key]);
                } catch (e) {
                    return null;
                }
            };

            ref['replaceByIndex'] = function(index, data, success, error) {
                internal = _get_object_by_path(object_id,path);
                if(!isPnList(internal)) {
                    return null;
                }
                var keys = getObjectKeysSorted(internal);
                try {
                    var key = keys[index];
                    SELF['replace']({
                        'object_id' : location + '.' + key,
                        'data'      : data,
                        'callback'  : success,
                        'error'     : error
                    });
                    return value(internal[key]);
                } catch (e) {
                    return null;
                }
            };

            ref['removeByKey'] = function(key, success, error) {
                internal = _get_object_by_path(object_id,path);
                if(!isPnList(internal)) {
                    return null;
                }
                remove({
                    'object_id' : location + '.' + key,
                    'callback'  : success,
                    'error'     : error
                });
                return value(internal[key]);

            };
            ref['replaceByKey'] = function(key, data, success, error) {
                internal = _get_object_by_path(object_id,path);
                if(!isPnList(internal)) {
                    return null;
                }
                SELF['replace']({
                    'object_id' : location + '.' + key,
                    'data'      : data,
                    'callback'  : success,
                    'error'     : error
                });
                return value(internal[key]);

            };
            ref['removeByValue'] = function(val, success, error) {
                internal = _get_object_by_path(object_id,path);
                if(!isPnList(internal)) {
                    return null;
                }

                var key = getKeyByValue(internal, val);

                if (!key) return null;

                remove({
                    'object_id' : location + '.' + key,
                    'callback'  : success,
                    'error'     : error
                });
                return value(internal[key]);

            };
            ref['getListElementIDFor'] = function(val) {
                internal = _get_object_by_path(object_id,path);
                if(!isPnList(internal)) {
                    return null;
                }
                return getKeyByValue(internal, val);

            };

            ref['replaceByValue'] = function(val, data, success, error) {
                internal = _get_object_by_path(object_id,path);
                if(!isPnList(internal)) {
                    return null;
                }
                var key = getKeyByValue(internal, val);

                if (!key) return null;

                remove({
                    'object_id' : location + '.' + key,
                    'data'      : data,
                    'callback'  : success,
                    'error'     : error
                });
                return value(internal[key]);

            };
            ref['getByIndex'] = function(index) {
                internal = _get_object_by_path(object_id,path);
                if(!isPnList(internal)) {
                    return null;
                }
                var keys = getObjectKeysSorted(internal);
                try {
                    var key = keys[index];
                    return value(internal[key]);
                } catch (e) {
                    return null;
                }
            };
            return ref;
        },
        /*
            PUBNUB.history({
                channel  : 'my_chat_channel',
                limit    : 100,
                callback : function(history) { }
            });
        */
        'history' : function( args, callback ) {
            var callback         = args['callback'] || args['success'] || callback
            ,   count            = args['count']    || args['limit'] || 100
            ,   reverse          = args['reverse']  || "false"
            ,   err              = args['error']    || function(){}
            ,   auth_key         = args['auth_key'] || AUTH_KEY
            ,   cipher_key       = args['cipher_key']
            ,   channel          = args['channel']
            ,   start            = args['start']
            ,   end              = args['end']
            ,   include_token    = args['include_token']
            ,   params           = {}
            ,   jsonp            = jsonp_cb();

            // Make sure we have a Channel
            if (!channel)       return error('Missing Channel');
            if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

            params['stringtoken'] = 'true';
            params['count']       = count;
            params['reverse']     = reverse;
            params['auth']        = auth_key;

            if (jsonp) params['callback']              = jsonp;
            if (start) params['start']                 = start;
            if (end)   params['end']                   = end;
            if (include_token) params['include_token'] = 'true';

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
                        var new_message = decrypt(messages[a],cipher_key);
                        try {
                            decrypted_messages['push'](JSON['parse'](new_message));
                        } catch (e) {
                            decrypted_messages['push']((new_message));
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
            xdr({
                callback : jsonp,
                data     : _get_url_params({ 'uuid' : UUID, 'auth' : AUTH_KEY }),
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
            var msg      = args['message'];
            if (!msg) return error('Missing Message');

            var callback = callback || args['callback'] || msg['callback'] || function(){}
            ,   channel  = args['channel'] || msg['channel']
            ,   auth_key = args['auth_key'] || AUTH_KEY
            ,   cipher_key = args['cipher_key']
            ,   err      = args['error'] || msg['error'] || function() {}
            ,   post     = args['post'] || false
            ,   store    = ('store_in_history' in args) ? args['store_in_history']: true
            ,   jsonp    = jsonp_cb()
            ,   add_msg  = 'push'
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
                jsonp
            ];

            if (!post) url.push(encode(msg));

            params = { 'uuid' : UUID, 'auth' : auth_key }

            if (!store) params['store'] ="0"

            // Queue Message Send
            PUB_QUEUE[add_msg]({
                callback : jsonp,
                timeout  : SECOND * 5,
                url      : url,
                body     : (post)? msg: null,
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
            var channel = args['channel']
            ,   callback      = callback            || args['callback'] || function(){}
            ,   err           = args['error']       || function(){};

            TIMETOKEN   = 0;
            //SUB_RESTORE = 1;    REVISIT !!!!

            // Prepare Channel(s)
            channel = map( (
                channel.join ? channel.join(',') : ''+channel
            ).split(','), function(channel) {
                if (!CHANNELS[channel]) return;
                return channel + ',' + channel + PRESENCE_SUFFIX;
            } ).join(',');

            // Iterate over Channels
            each( channel.split(','), function(channel) {
                var CB_CALLED = true;
                if (!channel) return;
                if (READY) {
                    CB_CALLED = SELF['LEAVE']( channel, 0 , callback, err);
                }
                if (!CB_CALLED) callback({action : "leave"});
                CHANNELS[channel] = 0;
                if (channel in STATE) delete STATE[channel];
            } );

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
            var channel       = args['channel']
            ,   callback      = callback            || args['callback'] || args['success']
            ,   callback      = callback            || args['message']
            ,   auth_key      = args['auth_key']    || AUTH_KEY
            ,   connect       = args['connect']     || function(){}
            ,   reconnect     = args['reconnect']   || function(){}
            ,   disconnect    = args['disconnect']  || function(){}
            ,   errcb         = args['error']       || function(){}
            ,   idlecb        = args['idle']        || function(){}
            ,   presence      = args['presence']    || 0
            ,   noheresync    = args['noheresync']  || 0
            ,   backfill      = args['backfill']    || 0
            ,   timetoken     = args['timetoken']   || 0
            ,   sub_timeout   = args['timeout']     || SUB_TIMEOUT
            ,   windowing     = args['windowing']   || SUB_WINDOWING
            ,   state         = args['state']
            ,   heartbeat     = args['heartbeat'] || args['pnexpires']
            ,   restore       = args['restore'] || SUB_RESTORE;

            // Restore Enabled?
            SUB_RESTORE = restore;

            // Always Reset the TT
            TIMETOKEN = timetoken;

            // Make sure we have a Channel
            if (!channel)       return error('Missing Channel');
            if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

            if (heartbeat || heartbeat === 0) {
                SELF['set_heartbeat'](heartbeat);
            }

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

                var data = _get_url_params({ 'uuid' : UUID, 'auth' : auth_key });

                var st = JSON.stringify(STATE);
                if (st.length > 2) data['state'] = JSON.stringify(STATE);

                if (PRESENCE_HB) data['heartbeat'] = PRESENCE_HB;

                start_presence_heartbeat();
                SUB_RECEIVER = xdr({
                    timeout  : sub_timeout,
                    callback : jsonp,
                    fail     : function(response) {
                        _invoke_error(response, errcb);
                        //SUB_RECEIVER = null;
                        SELF['time'](_test_connection);
                    },
                    data     : _get_url_params(data),
                    url      : [
                        SUB_ORIGIN, 'subscribe',
                        SUBSCRIBE_KEY, encode(channels),
                        jsonp, TIMETOKEN
                    ],
                    success : function(messages) {

                        //SUB_RECEIVER = null;
                        // Check for Errors
                        if (!messages || (
                            typeof messages == 'object' &&
                            'error' in messages         &&
                            messages['error']
                        )) {
                            errcb(messages['error']);
                            return timeout( CONNECT, SECOND );
                        }

                        // User Idle Callback
                        idlecb(messages[1]);

                        // Restore Previous Connection Point if Needed
                        TIMETOKEN = !TIMETOKEN               &&
                                    SUB_RESTORE              &&
                                    db['get'](SUBSCRIBE_KEY) || messages[1];

                        // Connect
                        each_channel(function(channel){
                            if (channel.connected) return;
                            channel.connected = 1;
                            channel.connect(channel.name, messages[1]);
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

                            if (messages.length > 3) {
                                channels = messages[3];
                            } else if (messages.length > 2) {
                                channels = messages[2];
                            } else {
                                channels = map(
                                generate_channel_list(CHANNELS), function(chan) { return map(
                                    Array(messages[0].length)
                                    .join(',').split(','),
                                    function() { return chan; }
                                ) }).join(',');
                            }
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

                        var latency = detect_latency(+messages[1]);
                        each( messages[0], function(msg) {
                            var next = next_callback();
                            var decrypted_msg = decrypt(msg,
                                (CHANNELS[next[1]])?CHANNELS[next[1]]['cipher_key']:null);
                            next[0]( decrypted_msg, messages, next[1], latency);
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
            var callback = args['callback'] || args['success'] || callback
            ,   err      = args['error']    || function(){}
            ,   auth_key = args['auth_key'] || AUTH_KEY
            ,   channel  = args['channel']
            ,   jsonp    = jsonp_cb()
            ,   uuids    = ('uuids' in args) ? args['uuids'] : true
            ,   state    = args['state']
            ,   data     = { 'uuid' : UUID, 'auth' : auth_key };

            if (!uuids) data['disable_uuids'] = 1;
            if (state) data['state'] = 1;

            // Make sure we have a Channel

            if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

            var url = [
                    STD_ORIGIN, 'v2', 'presence',
                    'sub_key', SUBSCRIBE_KEY
                ];

            channel && url.push('channel') && url.push(encode(channel));

            if (jsonp != '0') { data['callback'] = jsonp; }

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
            PUBNUB.current_channels_by_uuid({ channel : 'my_chat', callback : fun });
        */
        'where_now' : function( args, callback ) {
            var callback = args['callback'] || args['success'] || callback
            ,   err      = args['error']    || function(){}
            ,   auth_key = args['auth_key'] || AUTH_KEY
            ,   jsonp    = jsonp_cb()
            ,   uuid     = args['uuid']     || UUID
            ,   data     = { 'auth' : auth_key };

            // Make sure we have a Channel

            if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');

            if (jsonp != '0') { data['callback'] = jsonp; }

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
            ,   url
            ,   data     = _get_url_params({ 'auth' : auth_key });

            // Make sure we have a Channel
            if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');
            if (!uuid) return error('Missing UUID');
            if (!channel) return error('Missing Channel');

            if (jsonp != '0') { data['callback'] = jsonp; }

            if (CHANNELS[channel] && CHANNELS[channel].subscribed && state) STATE[channel] = state;

            data['state'] = JSON.stringify(state);

            if (state) {
                url      = [
                    STD_ORIGIN, 'v2', 'presence',
                    'sub-key', SUBSCRIBE_KEY,
                    'channel', encode(channel),
                    'uuid', uuid, 'data'
                ]
            } else {
                url      = [
                    STD_ORIGIN, 'v2', 'presence',
                    'sub-key', SUBSCRIBE_KEY,
                    'channel', encode(channel),
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
            var callback = args['callback'] || args['success'] || callback
            ,   err      = args['error']    || function(){}
            ,   channel  = args['channel']
            ,   obj_id   = args['object_id']
            ,   jsonp    = jsonp_cb()
            ,   ttl      = args['ttl']
            ,   r        = (args['read'] )?"1":"0"
            ,   w        = (args['write'])?"1":"0"
            ,   auth_key = args['auth_key'];


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
            if (channel != 'undefined' && channel != null && channel.length > 0) data['channel'] = channel;
            if (obj_id != 'undefined' && obj_id != null && obj_id.length > 0) data['obj-id'] = obj_id;

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
            var callback = args['callback'] || args['success'] || callback
            ,   err      = args['error']    || function(){}
            ,   channel  = args['channel']
            ,   obj_id   = args['object_id']
            ,   auth_key = args['auth_key']
            ,   jsonp    = jsonp_cb();

            // Make sure we have a Channel

            if (!SUBSCRIBE_KEY) return error('Missing Subscribe Key');
            if (!PUBLISH_KEY)   return error('Missing Publish Key');
            if (!SECRET_KEY)    return error('Missing Secret Key');

            var timestamp  = Math.floor(new Date().getTime() / 1000)
            ,   sign_input = SUBSCRIBE_KEY + "\n"
                + PUBLISH_KEY + "\n"
                + "audit" + "\n";

            var data = {'timestamp' : timestamp };
            if (jsonp != '0') { data['callback'] = jsonp; }
            if (channel != 'undefined' && channel != null && channel.length > 0) data['channel'] = channel;
            if (obj_id != 'undefined' && obj_id != null && obj_id.length > 0) data['obj-id'] = obj_id;
            if (auth_key) data['auth']    = auth_key;

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
        'presence_heartbeat' : function(args) {
            var callback = args['callback'] || function() {}
            var err      = args['error']    || function() {}
            var jsonp    = jsonp_cb();
            var data     = { 'uuid' : UUID, 'auth' : AUTH_KEY };

            var st = JSON['stringify'](STATE);
            if (st.length > 2) data['state'] = JSON['stringify'](STATE);

            if (PRESENCE_HB > 0 && PRESENCE_HB < 320) data['heartbeat'] = PRESENCE_HB;

            if (jsonp != '0') { data['callback'] = jsonp; }

            xdr({
                callback : jsonp,
                data     : _get_url_params(data),
                timeout  : SECOND * 5,
                url      : [
                    STD_ORIGIN, 'v2', 'presence',
                    'sub-key', SUBSCRIBE_KEY,
                    'channel' , encode(generate_channel_list(CHANNELS, true)['join'](',')),
                    'heartbeat'
                ],
                success  : function(response) {
                    _invoke_callback(response, callback, err);
                },
                fail     : function(response) { _invoke_error(response, err); }
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
        'offline'       : function(){_reset_offline(1, { "message":"Offline. Please check your network settings." })},
        'supplant'      : supplant,
        'now'           : rnow,
        'unique'        : unique,
        'updater'       : updater
    };

    function _poll_online() {
        _is_online() || _reset_offline( 1, {
            "error" : "Offline. Please check your network settings. "
        });
        timeout( _poll_online, SECOND );
    }

    function _poll_online2() {
        SELF['time'](function(success){
            detect_time_detla( function(){}, success );
            success || _reset_offline( 1, {
                "error" : "Heartbeat failed to connect to Pubnub Servers." +
                    "Please check your network settings."
                });
            timeout( _poll_online2, KEEPALIVE );
        });
    }

    function _reset_offline(err, msg) {
        SUB_RECEIVER && SUB_RECEIVER(err, msg);
        SUB_RECEIVER = null;
    }

    if (!UUID) UUID = SELF['uuid']();
    db['set']( SUBSCRIBE_KEY + 'uuid', UUID );

    //timeout( _poll_online,  SECOND    );
    //timeout( _poll_online2, KEEPALIVE );
    PRESENCE_HB_TIMEOUT = timeout( start_presence_heartbeat, ( PRESENCE_HB_INTERVAL - 3 ) * SECOND ) ;

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
