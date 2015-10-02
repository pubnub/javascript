
/**
 * UTIL LOCALS
 */
var NOW        = 1
,    PNSDK      = 'PubNub-JS-' + PLATFORM + '/' + VERSION
,   XHRTME     = 310000;



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
    ,   timer    = timeout( function(){done(1)}, XHRTME )
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
            if (xhr.readyState == 4) {
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
        if (async) xhr.timeout = XHRTME;
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
        bind( 'offline', window,   SELF['_reset_offline'] );
    }

    if (typeof(document) !== 'undefined'){
        bind( 'offline', document, SELF['_reset_offline'] );
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
