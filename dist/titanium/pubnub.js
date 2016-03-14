/*! 4.0.0-beta1 / Titanium */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["PUBNUB"] = factory();
	else
		root["PUBNUB"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/* globals window, console, PLATFORM, Ti */
	/* eslint no-unused-expressions: 0, no-console: 0, camelcase: 0, curly: 0, no-redeclare: 0 */

	var crypto_obj = __webpack_require__(1);
	var packageJSON = __webpack_require__(3);
	var pubNubCore = __webpack_require__(4);
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

	/**
	 * UTIL LOCALS
	 */
	var PNSDK = 'PubNub-JS-' + 'Titanium' + '/' + packageJSON.version;

	/**
	 * LOCAL STORAGE OR COOKIE
	 */
	var db = function () {
	  return {
	    get: function get(key) {
	      Ti.App.Properties.getString('' + key);
	    },
	    set: function set(key, value) {
	      Ti.App.Properties.setString('' + key, '' + value);
	    }
	  };
	}();

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
	  var sock;
	  var data = setup.data || {};
	  data['pnsdk'] = PNSDK;
	  var url = pubNubCore.build_url(setup.url, data);
	  var body = [];
	  var data = '';
	  var rbuffer = Ti.createBuffer({ length: 2048 });
	  var wbuffer = Ti.createBuffer({ value: 'GET ' + url + ' HTTP/1.0\n\n' });
	  var failed = 0;

	  var fail = function fail() {
	    if (failed) return;
	    failed = 1;
	    (setup.fail || function () {})();
	  };

	  var success = setup.success || function () {};

	  function read() {
	    Ti.Stream.read(sock, rbuffer, function (stream) {
	      if (+stream.bytesProcessed > -1) {
	        data = Ti.Codec.decodeString({
	          source: rbuffer,
	          length: +stream.bytesProcessed
	        });

	        body.push(data);
	        rbuffer.clear();

	        return pubNubCore.timeout(read, 1);
	      }

	      try {
	        data = JSON['parse'](body.join('').split('\r\n').slice(-1));
	      } catch (r) {
	        return fail();
	      }

	      sock.close();
	      success(data);
	    });
	  }

	  sock = Ti.Network.Socket.createTCP({
	    host: url.split(pubNubCore.URLBIT)[2],
	    port: 80,
	    mode: Ti.Network.READ_WRITE_MODE,
	    timeout: pubNubCore.XHRTME,
	    error: fail,
	    connected: function connected() {
	      sock.write(wbuffer);
	      read();
	    }
	  });

	  try {
	    sock.connect();
	  } catch (k) {
	    return fail();
	  }
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
	function xdr_http_client(setup) {
	  var data = setup.data || {};
	  data['pnsdk'] = PNSDK;
	  var url = pubNubCore.build_url(setup.url, data);
	  var xhr;
	  var timer;
	  var complete = 0;
	  var loaded = 0;
	  var fail = setup.fail || function () {};
	  var success = setup.success || function () {};

	  var done = function done(failed) {
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

	  var finished = function finished() {
	    var response;
	    if (loaded) return;
	    loaded = 1;

	    clearTimeout(timer);

	    try {
	      response = JSON['parse'](xhr.responseText);
	    } catch (r) {
	      return done(1);
	    }

	    success(response);
	  };

	  timer = pubNubCore.timeout(function () {
	    done(1);
	  }, pubNubCore.XHRTME);

	  // Send
	  try {
	    xhr = Ti.Network.createHTTPClient();
	    xhr.onerror = function () {
	      done(1);
	    };
	    xhr.onload = finished;
	    xhr.timeout = pubNubCore.XHRTME;

	    xhr.open('GET', url, true);
	    xhr.send();
	  } catch (eee) {
	    done(1, { error: 'XHR Failed', stacktrace: eee });
	  }

	  // Return 'done'
	  return done;
	}

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
	  list: {},
	  unbind: function unbind(name) {
	    events.list[name] = [];
	  },
	  bind: function bind(name, fun) {
	    (events.list[name] = events.list[name] || []).push(fun);
	  },
	  fire: function fire(name, data) {
	    pubNubCore.each(events.list[name] || [], function (fun) {
	      fun(data);
	    });
	  }
	};

	/* =-====================================================================-= */
	/* =-====================================================================-= */
	/* =-=========================     PUBNUB     ===========================-= */
	/* =-====================================================================-= */
	/* =-====================================================================-= */

	function CREATE_PUBNUB(setup) {
	  setup['db'] = db;
	  setup['xdr'] = setup['native_tcp_socket'] ? xdr_tcp : xdr_http_client;
	  setup['crypto_obj'] = crypto_obj();
	  setup['params'] = { pnsdk: PNSDK };

	  var SELF = function SELF(setup) {
	    return CREATE_PUBNUB(setup);
	  };

	  var PN = pubNubCore.PN_API(setup);
	  for (var prop in PN) {
	    if (PN.hasOwnProperty(prop)) {
	      SELF[prop] = PN[prop];
	    }
	  }

	  SELF['init'] = SELF;
	  SELF['crypto_obj'] = crypto_obj();

	  // Return without Testing
	  if (setup['notest']) return SELF;

	  SELF['ready']();
	  return SELF;
	}

	CREATE_PUBNUB['init'] = CREATE_PUBNUB;
	CREATE_PUBNUB['crypto_obj'] = crypto_obj();

	module.exports = CREATE_PUBNUB;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint camelcase: 0 eqeqeq: 0 */

	var CryptoJS = __webpack_require__(2);

	function crypto_obj() {
	  function SHA256(s) {
	    return CryptoJS['SHA256'](s)['toString'](CryptoJS['enc']['Hex']);
	  }

	  var iv = '0123456789012345';

	  var allowedKeyEncodings = ['hex', 'utf8', 'base64', 'binary'];
	  var allowedKeyLengths = [128, 256];
	  var allowedModes = ['ecb', 'cbc'];

	  var defaultOptions = {
	    encryptKey: true,
	    keyEncoding: 'utf8',
	    keyLength: 256,
	    mode: 'cbc'
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
	    if (options['keyEncoding'] === 'base64') {
	      return CryptoJS['enc']['Base64']['parse'](key);
	    } else if (options['keyEncoding'] === 'hex') {
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
	    if (options['mode'] === 'ecb') {
	      return CryptoJS['mode']['ECB'];
	    } else {
	      return CryptoJS['mode']['CBC'];
	    }
	  }

	  function get_iv(options) {
	    return (options['mode'] === 'cbc') ? CryptoJS['enc']['Utf8']['parse'](iv) : null;
	  }

	  return {
	    encrypt: function (data, key, options) {
	      if (!key) return data;
	      options = parse_options(options);
	      var iv = get_iv(options);
	      var mode = get_mode(options);
	      var cipher_key = get_padded_key(key, options);
	      var hex_message = JSON['stringify'](data);
	      var encryptedHexArray = CryptoJS['AES']['encrypt'](hex_message, cipher_key, { iv: iv, mode: mode })['ciphertext'];
	      var base_64_encrypted = encryptedHexArray['toString'](CryptoJS['enc']['Base64']);
	      return base_64_encrypted || data;
	    },

	    decrypt: function (data, key, options) {
	      if (!key) return data;
	      options = parse_options(options);
	      var iv = get_iv(options);
	      var mode = get_mode(options);
	      var cipher_key = get_padded_key(key, options);
	      try {
	        var binary_enc = CryptoJS['enc']['Base64']['parse'](data);
	        var json_plain = CryptoJS['AES']['decrypt']({ ciphertext: binary_enc }, cipher_key, { iv: iv, mode: mode })['toString'](CryptoJS['enc']['Utf8']);
	        var plaintext = JSON['parse'](json_plain);
	        return plaintext;
	      } catch (e) {
	        return undefined;
	      }
	    }
	  };
	}

	module.exports = crypto_obj;


/***/ },
/* 2 */
/***/ function(module, exports) {

	/*
	 CryptoJS v3.1.2
	 code.google.com/p/crypto-js
	 (c) 2009-2013 by Jeff Mott. All rights reserved.
	 code.google.com/p/crypto-js/wiki/License
	 */
	var CryptoJS=CryptoJS||function(h,s){var f={},g=f.lib={},q=function(){},m=g.Base={extend:function(a){q.prototype=this;var c=new q;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
	    r=g.WordArray=m.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=s?c:4*a.length},toString:function(a){return(a||k).stringify(this)},concat:function(a){var c=this.words,d=a.words,b=this.sigBytes;a=a.sigBytes;this.clamp();if(b%4)for(var e=0;e<a;e++)c[b+e>>>2]|=(d[e>>>2]>>>24-8*(e%4)&255)<<24-8*((b+e)%4);else if(65535<d.length)for(e=0;e<a;e+=4)c[b+e>>>2]=d[e>>>2];else c.push.apply(c,d);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
	      32-8*(c%4);a.length=h.ceil(c/4)},clone:function(){var a=m.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],d=0;d<a;d+=4)c.push(4294967296*h.random()|0);return new r.init(c,a)}}),l=f.enc={},k=l.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++){var e=c[b>>>2]>>>24-8*(b%4)&255;d.push((e>>>4).toString(16));d.push((e&15).toString(16))}return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b+=2)d[b>>>3]|=parseInt(a.substr(b,
	        2),16)<<24-4*(b%8);return new r.init(d,c/2)}},n=l.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++)d.push(String.fromCharCode(c[b>>>2]>>>24-8*(b%4)&255));return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b++)d[b>>>2]|=(a.charCodeAt(b)&255)<<24-8*(b%4);return new r.init(d,c)}},j=l.Utf8={stringify:function(a){try{return decodeURIComponent(escape(n.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return n.parse(unescape(encodeURIComponent(a)))}},
	    u=g.BufferedBlockAlgorithm=m.extend({reset:function(){this._data=new r.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=j.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,d=c.words,b=c.sigBytes,e=this.blockSize,f=b/(4*e),f=a?h.ceil(f):h.max((f|0)-this._minBufferSize,0);a=f*e;b=h.min(4*a,b);if(a){for(var g=0;g<a;g+=e)this._doProcessBlock(d,g);g=d.splice(0,a);c.sigBytes-=b}return new r.init(g,b)},clone:function(){var a=m.clone.call(this);
	      a._data=this._data.clone();return a},_minBufferSize:0});g.Hasher=u.extend({cfg:m.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){u.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(c,d){return(new a.init(d)).finalize(c)}},_createHmacHelper:function(a){return function(c,d){return(new t.HMAC.init(a,
	    d)).finalize(c)}}});var t=f.algo={};return f}(Math);

	// SHA256
	(function(h){for(var s=CryptoJS,f=s.lib,g=f.WordArray,q=f.Hasher,f=s.algo,m=[],r=[],l=function(a){return 4294967296*(a-(a|0))|0},k=2,n=0;64>n;){var j;a:{j=k;for(var u=h.sqrt(j),t=2;t<=u;t++)if(!(j%t)){j=!1;break a}j=!0}j&&(8>n&&(m[n]=l(h.pow(k,0.5))),r[n]=l(h.pow(k,1/3)),n++);k++}var a=[],f=f.SHA256=q.extend({_doReset:function(){this._hash=new g.init(m.slice(0))},_doProcessBlock:function(c,d){for(var b=this._hash.words,e=b[0],f=b[1],g=b[2],j=b[3],h=b[4],m=b[5],n=b[6],q=b[7],p=0;64>p;p++){if(16>p)a[p]=
	  c[d+p]|0;else{var k=a[p-15],l=a[p-2];a[p]=((k<<25|k>>>7)^(k<<14|k>>>18)^k>>>3)+a[p-7]+((l<<15|l>>>17)^(l<<13|l>>>19)^l>>>10)+a[p-16]}k=q+((h<<26|h>>>6)^(h<<21|h>>>11)^(h<<7|h>>>25))+(h&m^~h&n)+r[p]+a[p];l=((e<<30|e>>>2)^(e<<19|e>>>13)^(e<<10|e>>>22))+(e&f^e&g^f&g);q=n;n=m;m=h;h=j+k|0;j=g;g=f;f=e;e=k+l|0}b[0]=b[0]+e|0;b[1]=b[1]+f|0;b[2]=b[2]+g|0;b[3]=b[3]+j|0;b[4]=b[4]+h|0;b[5]=b[5]+m|0;b[6]=b[6]+n|0;b[7]=b[7]+q|0},_doFinalize:function(){var a=this._data,d=a.words,b=8*this._nDataBytes,e=8*a.sigBytes;
	  d[e>>>5]|=128<<24-e%32;d[(e+64>>>9<<4)+14]=h.floor(b/4294967296);d[(e+64>>>9<<4)+15]=b;a.sigBytes=4*d.length;this._process();return this._hash},clone:function(){var a=q.clone.call(this);a._hash=this._hash.clone();return a}});s.SHA256=q._createHelper(f);s.HmacSHA256=q._createHmacHelper(f)})(Math);

	// HMAC SHA256
	(function(){var h=CryptoJS,s=h.enc.Utf8;h.algo.HMAC=h.lib.Base.extend({init:function(f,g){f=this._hasher=new f.init;"string"==typeof g&&(g=s.parse(g));var h=f.blockSize,m=4*h;g.sigBytes>m&&(g=f.finalize(g));g.clamp();for(var r=this._oKey=g.clone(),l=this._iKey=g.clone(),k=r.words,n=l.words,j=0;j<h;j++)k[j]^=1549556828,n[j]^=909522486;r.sigBytes=l.sigBytes=m;this.reset()},reset:function(){var f=this._hasher;f.reset();f.update(this._iKey)},update:function(f){this._hasher.update(f);return this},finalize:function(f){var g=
	  this._hasher;f=g.finalize(f);g.reset();return g.finalize(this._oKey.clone().concat(f))}})})();

	// Base64
	(function(){var u=CryptoJS,p=u.lib.WordArray;u.enc.Base64={stringify:function(d){var l=d.words,p=d.sigBytes,t=this._map;d.clamp();d=[];for(var r=0;r<p;r+=3)for(var w=(l[r>>>2]>>>24-8*(r%4)&255)<<16|(l[r+1>>>2]>>>24-8*((r+1)%4)&255)<<8|l[r+2>>>2]>>>24-8*((r+2)%4)&255,v=0;4>v&&r+0.75*v<p;v++)d.push(t.charAt(w>>>6*(3-v)&63));if(l=t.charAt(64))for(;d.length%4;)d.push(l);return d.join("")},parse:function(d){var l=d.length,s=this._map,t=s.charAt(64);t&&(t=d.indexOf(t),-1!=t&&(l=t));for(var t=[],r=0,w=0;w<
	l;w++)if(w%4){var v=s.indexOf(d.charAt(w-1))<<2*(w%4),b=s.indexOf(d.charAt(w))>>>6-2*(w%4);t[r>>>2]|=(v|b)<<24-8*(r%4);r++}return p.create(t,r)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}})();

	// BlockCipher
	(function(u){function p(b,n,a,c,e,j,k){b=b+(n&a|~n&c)+e+k;return(b<<j|b>>>32-j)+n}function d(b,n,a,c,e,j,k){b=b+(n&c|a&~c)+e+k;return(b<<j|b>>>32-j)+n}function l(b,n,a,c,e,j,k){b=b+(n^a^c)+e+k;return(b<<j|b>>>32-j)+n}function s(b,n,a,c,e,j,k){b=b+(a^(n|~c))+e+k;return(b<<j|b>>>32-j)+n}for(var t=CryptoJS,r=t.lib,w=r.WordArray,v=r.Hasher,r=t.algo,b=[],x=0;64>x;x++)b[x]=4294967296*u.abs(u.sin(x+1))|0;r=r.MD5=v.extend({_doReset:function(){this._hash=new w.init([1732584193,4023233417,2562383102,271733878])},
	  _doProcessBlock:function(q,n){for(var a=0;16>a;a++){var c=n+a,e=q[c];q[c]=(e<<8|e>>>24)&16711935|(e<<24|e>>>8)&4278255360}var a=this._hash.words,c=q[n+0],e=q[n+1],j=q[n+2],k=q[n+3],z=q[n+4],r=q[n+5],t=q[n+6],w=q[n+7],v=q[n+8],A=q[n+9],B=q[n+10],C=q[n+11],u=q[n+12],D=q[n+13],E=q[n+14],x=q[n+15],f=a[0],m=a[1],g=a[2],h=a[3],f=p(f,m,g,h,c,7,b[0]),h=p(h,f,m,g,e,12,b[1]),g=p(g,h,f,m,j,17,b[2]),m=p(m,g,h,f,k,22,b[3]),f=p(f,m,g,h,z,7,b[4]),h=p(h,f,m,g,r,12,b[5]),g=p(g,h,f,m,t,17,b[6]),m=p(m,g,h,f,w,22,b[7]),
	    f=p(f,m,g,h,v,7,b[8]),h=p(h,f,m,g,A,12,b[9]),g=p(g,h,f,m,B,17,b[10]),m=p(m,g,h,f,C,22,b[11]),f=p(f,m,g,h,u,7,b[12]),h=p(h,f,m,g,D,12,b[13]),g=p(g,h,f,m,E,17,b[14]),m=p(m,g,h,f,x,22,b[15]),f=d(f,m,g,h,e,5,b[16]),h=d(h,f,m,g,t,9,b[17]),g=d(g,h,f,m,C,14,b[18]),m=d(m,g,h,f,c,20,b[19]),f=d(f,m,g,h,r,5,b[20]),h=d(h,f,m,g,B,9,b[21]),g=d(g,h,f,m,x,14,b[22]),m=d(m,g,h,f,z,20,b[23]),f=d(f,m,g,h,A,5,b[24]),h=d(h,f,m,g,E,9,b[25]),g=d(g,h,f,m,k,14,b[26]),m=d(m,g,h,f,v,20,b[27]),f=d(f,m,g,h,D,5,b[28]),h=d(h,f,
	      m,g,j,9,b[29]),g=d(g,h,f,m,w,14,b[30]),m=d(m,g,h,f,u,20,b[31]),f=l(f,m,g,h,r,4,b[32]),h=l(h,f,m,g,v,11,b[33]),g=l(g,h,f,m,C,16,b[34]),m=l(m,g,h,f,E,23,b[35]),f=l(f,m,g,h,e,4,b[36]),h=l(h,f,m,g,z,11,b[37]),g=l(g,h,f,m,w,16,b[38]),m=l(m,g,h,f,B,23,b[39]),f=l(f,m,g,h,D,4,b[40]),h=l(h,f,m,g,c,11,b[41]),g=l(g,h,f,m,k,16,b[42]),m=l(m,g,h,f,t,23,b[43]),f=l(f,m,g,h,A,4,b[44]),h=l(h,f,m,g,u,11,b[45]),g=l(g,h,f,m,x,16,b[46]),m=l(m,g,h,f,j,23,b[47]),f=s(f,m,g,h,c,6,b[48]),h=s(h,f,m,g,w,10,b[49]),g=s(g,h,f,m,
	      E,15,b[50]),m=s(m,g,h,f,r,21,b[51]),f=s(f,m,g,h,u,6,b[52]),h=s(h,f,m,g,k,10,b[53]),g=s(g,h,f,m,B,15,b[54]),m=s(m,g,h,f,e,21,b[55]),f=s(f,m,g,h,v,6,b[56]),h=s(h,f,m,g,x,10,b[57]),g=s(g,h,f,m,t,15,b[58]),m=s(m,g,h,f,D,21,b[59]),f=s(f,m,g,h,z,6,b[60]),h=s(h,f,m,g,C,10,b[61]),g=s(g,h,f,m,j,15,b[62]),m=s(m,g,h,f,A,21,b[63]);a[0]=a[0]+f|0;a[1]=a[1]+m|0;a[2]=a[2]+g|0;a[3]=a[3]+h|0},_doFinalize:function(){var b=this._data,n=b.words,a=8*this._nDataBytes,c=8*b.sigBytes;n[c>>>5]|=128<<24-c%32;var e=u.floor(a/
	    4294967296);n[(c+64>>>9<<4)+15]=(e<<8|e>>>24)&16711935|(e<<24|e>>>8)&4278255360;n[(c+64>>>9<<4)+14]=(a<<8|a>>>24)&16711935|(a<<24|a>>>8)&4278255360;b.sigBytes=4*(n.length+1);this._process();b=this._hash;n=b.words;for(a=0;4>a;a++)c=n[a],n[a]=(c<<8|c>>>24)&16711935|(c<<24|c>>>8)&4278255360;return b},clone:function(){var b=v.clone.call(this);b._hash=this._hash.clone();return b}});t.MD5=v._createHelper(r);t.HmacMD5=v._createHmacHelper(r)})(Math);
	(function(){var u=CryptoJS,p=u.lib,d=p.Base,l=p.WordArray,p=u.algo,s=p.EvpKDF=d.extend({cfg:d.extend({keySize:4,hasher:p.MD5,iterations:1}),init:function(d){this.cfg=this.cfg.extend(d)},compute:function(d,r){for(var p=this.cfg,s=p.hasher.create(),b=l.create(),u=b.words,q=p.keySize,p=p.iterations;u.length<q;){n&&s.update(n);var n=s.update(d).finalize(r);s.reset();for(var a=1;a<p;a++)n=s.finalize(n),s.reset();b.concat(n)}b.sigBytes=4*q;return b}});u.EvpKDF=function(d,l,p){return s.create(p).compute(d,
	  l)}})();

	// Cipher
	CryptoJS.lib.Cipher||function(u){var p=CryptoJS,d=p.lib,l=d.Base,s=d.WordArray,t=d.BufferedBlockAlgorithm,r=p.enc.Base64,w=p.algo.EvpKDF,v=d.Cipher=t.extend({cfg:l.extend(),createEncryptor:function(e,a){return this.create(this._ENC_XFORM_MODE,e,a)},createDecryptor:function(e,a){return this.create(this._DEC_XFORM_MODE,e,a)},init:function(e,a,b){this.cfg=this.cfg.extend(b);this._xformMode=e;this._key=a;this.reset()},reset:function(){t.reset.call(this);this._doReset()},process:function(e){this._append(e);return this._process()},
	  finalize:function(e){e&&this._append(e);return this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(e){return{encrypt:function(b,k,d){return("string"==typeof k?c:a).encrypt(e,b,k,d)},decrypt:function(b,k,d){return("string"==typeof k?c:a).decrypt(e,b,k,d)}}}});d.StreamCipher=v.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var b=p.mode={},x=function(e,a,b){var c=this._iv;c?this._iv=u:c=this._prevBlock;for(var d=0;d<b;d++)e[a+d]^=
	  c[d]},q=(d.BlockCipherMode=l.extend({createEncryptor:function(e,a){return this.Encryptor.create(e,a)},createDecryptor:function(e,a){return this.Decryptor.create(e,a)},init:function(e,a){this._cipher=e;this._iv=a}})).extend();q.Encryptor=q.extend({processBlock:function(e,a){var b=this._cipher,c=b.blockSize;x.call(this,e,a,c);b.encryptBlock(e,a);this._prevBlock=e.slice(a,a+c)}});q.Decryptor=q.extend({processBlock:function(e,a){var b=this._cipher,c=b.blockSize,d=e.slice(a,a+c);b.decryptBlock(e,a);x.call(this,
	  e,a,c);this._prevBlock=d}});b=b.CBC=q;q=(p.pad={}).Pkcs7={pad:function(a,b){for(var c=4*b,c=c-a.sigBytes%c,d=c<<24|c<<16|c<<8|c,l=[],n=0;n<c;n+=4)l.push(d);c=s.create(l,c);a.concat(c)},unpad:function(a){a.sigBytes-=a.words[a.sigBytes-1>>>2]&255}};d.BlockCipher=v.extend({cfg:v.cfg.extend({mode:b,padding:q}),reset:function(){v.reset.call(this);var a=this.cfg,b=a.iv,a=a.mode;if(this._xformMode==this._ENC_XFORM_MODE)var c=a.createEncryptor;else c=a.createDecryptor,this._minBufferSize=1;this._mode=c.call(a,
	  this,b&&b.words)},_doProcessBlock:function(a,b){this._mode.processBlock(a,b)},_doFinalize:function(){var a=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){a.pad(this._data,this.blockSize);var b=this._process(!0)}else b=this._process(!0),a.unpad(b);return b},blockSize:4});var n=d.CipherParams=l.extend({init:function(a){this.mixIn(a)},toString:function(a){return(a||this.formatter).stringify(this)}}),b=(p.format={}).OpenSSL={stringify:function(a){var b=a.ciphertext;a=a.salt;return(a?s.create([1398893684,
	  1701076831]).concat(a).concat(b):b).toString(r)},parse:function(a){a=r.parse(a);var b=a.words;if(1398893684==b[0]&&1701076831==b[1]){var c=s.create(b.slice(2,4));b.splice(0,4);a.sigBytes-=16}return n.create({ciphertext:a,salt:c})}},a=d.SerializableCipher=l.extend({cfg:l.extend({format:b}),encrypt:function(a,b,c,d){d=this.cfg.extend(d);var l=a.createEncryptor(c,d);b=l.finalize(b);l=l.cfg;return n.create({ciphertext:b,key:c,iv:l.iv,algorithm:a,mode:l.mode,padding:l.padding,blockSize:a.blockSize,formatter:d.format})},
	  decrypt:function(a,b,c,d){d=this.cfg.extend(d);b=this._parse(b,d.format);return a.createDecryptor(c,d).finalize(b.ciphertext)},_parse:function(a,b){return"string"==typeof a?b.parse(a,this):a}}),p=(p.kdf={}).OpenSSL={execute:function(a,b,c,d){d||(d=s.random(8));a=w.create({keySize:b+c}).compute(a,d);c=s.create(a.words.slice(b),4*c);a.sigBytes=4*b;return n.create({key:a,iv:c,salt:d})}},c=d.PasswordBasedCipher=a.extend({cfg:a.cfg.extend({kdf:p}),encrypt:function(b,c,d,l){l=this.cfg.extend(l);d=l.kdf.execute(d,
	  b.keySize,b.ivSize);l.iv=d.iv;b=a.encrypt.call(this,b,c,d.key,l);b.mixIn(d);return b},decrypt:function(b,c,d,l){l=this.cfg.extend(l);c=this._parse(c,l.format);d=l.kdf.execute(d,b.keySize,b.ivSize,c.salt);l.iv=d.iv;return a.decrypt.call(this,b,c,d.key,l)}})}();

	// AES
	(function(){for(var u=CryptoJS,p=u.lib.BlockCipher,d=u.algo,l=[],s=[],t=[],r=[],w=[],v=[],b=[],x=[],q=[],n=[],a=[],c=0;256>c;c++)a[c]=128>c?c<<1:c<<1^283;for(var e=0,j=0,c=0;256>c;c++){var k=j^j<<1^j<<2^j<<3^j<<4,k=k>>>8^k&255^99;l[e]=k;s[k]=e;var z=a[e],F=a[z],G=a[F],y=257*a[k]^16843008*k;t[e]=y<<24|y>>>8;r[e]=y<<16|y>>>16;w[e]=y<<8|y>>>24;v[e]=y;y=16843009*G^65537*F^257*z^16843008*e;b[k]=y<<24|y>>>8;x[k]=y<<16|y>>>16;q[k]=y<<8|y>>>24;n[k]=y;e?(e=z^a[a[a[G^z]]],j^=a[a[j]]):e=j=1}var H=[0,1,2,4,8,
	  16,32,64,128,27,54],d=d.AES=p.extend({_doReset:function(){for(var a=this._key,c=a.words,d=a.sigBytes/4,a=4*((this._nRounds=d+6)+1),e=this._keySchedule=[],j=0;j<a;j++)if(j<d)e[j]=c[j];else{var k=e[j-1];j%d?6<d&&4==j%d&&(k=l[k>>>24]<<24|l[k>>>16&255]<<16|l[k>>>8&255]<<8|l[k&255]):(k=k<<8|k>>>24,k=l[k>>>24]<<24|l[k>>>16&255]<<16|l[k>>>8&255]<<8|l[k&255],k^=H[j/d|0]<<24);e[j]=e[j-d]^k}c=this._invKeySchedule=[];for(d=0;d<a;d++)j=a-d,k=d%4?e[j]:e[j-4],c[d]=4>d||4>=j?k:b[l[k>>>24]]^x[l[k>>>16&255]]^q[l[k>>>
	8&255]]^n[l[k&255]]},encryptBlock:function(a,b){this._doCryptBlock(a,b,this._keySchedule,t,r,w,v,l)},decryptBlock:function(a,c){var d=a[c+1];a[c+1]=a[c+3];a[c+3]=d;this._doCryptBlock(a,c,this._invKeySchedule,b,x,q,n,s);d=a[c+1];a[c+1]=a[c+3];a[c+3]=d},_doCryptBlock:function(a,b,c,d,e,j,l,f){for(var m=this._nRounds,g=a[b]^c[0],h=a[b+1]^c[1],k=a[b+2]^c[2],n=a[b+3]^c[3],p=4,r=1;r<m;r++)var q=d[g>>>24]^e[h>>>16&255]^j[k>>>8&255]^l[n&255]^c[p++],s=d[h>>>24]^e[k>>>16&255]^j[n>>>8&255]^l[g&255]^c[p++],t=
	  d[k>>>24]^e[n>>>16&255]^j[g>>>8&255]^l[h&255]^c[p++],n=d[n>>>24]^e[g>>>16&255]^j[h>>>8&255]^l[k&255]^c[p++],g=q,h=s,k=t;q=(f[g>>>24]<<24|f[h>>>16&255]<<16|f[k>>>8&255]<<8|f[n&255])^c[p++];s=(f[h>>>24]<<24|f[k>>>16&255]<<16|f[n>>>8&255]<<8|f[g&255])^c[p++];t=(f[k>>>24]<<24|f[n>>>16&255]<<16|f[g>>>8&255]<<8|f[h&255])^c[p++];n=(f[n>>>24]<<24|f[g>>>16&255]<<16|f[h>>>8&255]<<8|f[k&255])^c[p++];a[b]=q;a[b+1]=s;a[b+2]=t;a[b+3]=n},keySize:8});u.AES=p._createHelper(d)})();

	// Mode ECB
	CryptoJS.mode.ECB = (function () {
	  var ECB = CryptoJS.lib.BlockCipherMode.extend();

	  ECB.Encryptor = ECB.extend({
	    processBlock: function (words, offset) {
	      this._cipher.encryptBlock(words, offset);
	    }
	  });

	  ECB.Decryptor = ECB.extend({
	    processBlock: function (words, offset) {
	      this._cipher.decryptBlock(words, offset);
	    }
	  });

	  return ECB;
	}());

	module.exports = CryptoJS;


/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = {
		"name": "pubnub",
		"preferGlobal": false,
		"version": "4.0.0-beta1",
		"author": "PubNub <support@pubnub.com>",
		"description": "Publish & Subscribe Real-time Messaging with PubNub",
		"contributors": [
			{
				"name": "Stephen Blum",
				"email": "stephen@pubnub.com"
			}
		],
		"bin": {},
		"scripts": {
			"test": "grunt test --force"
		},
		"main": "./node.js/pubnub.js",
		"browser": "./modern/dist/pubnub.js",
		"repository": {
			"type": "git",
			"url": "git://github.com/pubnub/javascript.git"
		},
		"keywords": [
			"cloud",
			"publish",
			"subscribe",
			"websockets",
			"comet",
			"bosh",
			"xmpp",
			"real-time",
			"messaging"
		],
		"dependencies": {
			"agentkeepalive": "~0.2",
			"event-emitter": "^0.3.4",
			"lodash": "^4.1.0",
			"loglevel": "^1.4.0",
			"q": "^1.4.1",
			"sinon-as-promised": "^4.0.0",
			"superagent": "^1.8.0",
			"uuid": "^2.0.1"
		},
		"noAnalyze": false,
		"devDependencies": {
			"babel-core": "^6.6.5",
			"babel-eslint": "5.0.0",
			"babel-plugin-transform-class-properties": "^6.6.0",
			"babel-plugin-transform-flow-strip-types": "^6.6.5",
			"babel-preset-es2015": "^6.6.0",
			"babel-register": "^6.6.5",
			"chai": "^3.5.0",
			"chai-as-promised": "^5.2.0",
			"eslint": "2.2.0",
			"eslint-config-airbnb": "6.0.2",
			"eslint-plugin-flowtype": "2.1.0",
			"eslint-plugin-mocha": "2.0.0",
			"eslint-plugin-react": "4.1.0",
			"flow-bin": "^0.22.1",
			"gulp": "^3.9.1",
			"gulp-babel": "^6.1.2",
			"gulp-clean": "^0.3.2",
			"gulp-exec": "^2.1.2",
			"gulp-flowtype": "^0.4.9",
			"gulp-mocha": "^2.2.0",
			"gulp-rename": "^1.2.2",
			"gulp-webpack": "^1.5.0",
			"imports-loader": "0.6.5",
			"json-loader": "0.5.4",
			"karma": "0.13.21",
			"karma-chai": "0.1.0",
			"karma-mocha": "^0.2.2",
			"karma-phantomjs-launcher": "1.0.0",
			"karma-spec-reporter": "0.0.24",
			"mocha": "2.4.5",
			"node-uuid": "1.4.7",
			"phantomjs-prebuilt": "2.1.4",
			"proxyquire": "1.7.4",
			"run-sequence": "^1.1.5",
			"sinon": "^1.17.3",
			"uglify-js": "^2.6.2",
			"underscore": "1.7.0",
			"webpack": "^1.12.14",
			"webpack-dev-server": "1.14.1"
		},
		"bundleDependencies": [],
		"license": "MIT",
		"engine": {
			"node": ">=0.8"
		}
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = createInstance;

	var _uuid = __webpack_require__(5);

	var _uuid2 = _interopRequireDefault(_uuid);

	var _eventEmitter = __webpack_require__(7);

	var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

	var _networking = __webpack_require__(22);

	var _networking2 = _interopRequireDefault(_networking);

	var _keychain = __webpack_require__(30);

	var _keychain2 = _interopRequireDefault(_keychain);

	var _config = __webpack_require__(32);

	var _config2 = _interopRequireDefault(_config);

	var _state = __webpack_require__(35);

	var _state2 = _interopRequireDefault(_state);

	var _publish_queue = __webpack_require__(36);

	var _publish_queue2 = _interopRequireDefault(_publish_queue);

	var _presence_heartbeat = __webpack_require__(37);

	var _presence_heartbeat2 = _interopRequireDefault(_presence_heartbeat);

	var _connectivity = __webpack_require__(41);

	var _connectivity2 = _interopRequireDefault(_connectivity);

	var _time = __webpack_require__(42);

	var _time2 = _interopRequireDefault(_time);

	var _presence = __webpack_require__(38);

	var _presence2 = _interopRequireDefault(_presence);

	var _history = __webpack_require__(43);

	var _history2 = _interopRequireDefault(_history);

	var _push = __webpack_require__(44);

	var _push2 = _interopRequireDefault(_push);

	var _access = __webpack_require__(48);

	var _access2 = _interopRequireDefault(_access);

	var _channel_groups = __webpack_require__(49);

	var _channel_groups2 = _interopRequireDefault(_channel_groups);

	var _pubsub = __webpack_require__(50);

	var _pubsub2 = _interopRequireDefault(_pubsub);

	var _publish = __webpack_require__(51);

	var _publish2 = _interopRequireDefault(_publish);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var packageJSON = __webpack_require__(3);
	var utils = __webpack_require__(33);

	var DEF_WINDOWING = 10; // MILLISECONDS.
	var DEF_TIMEOUT = 15000; // MILLISECONDS.
	var DEF_SUB_TIMEOUT = 310; // SECONDS.
	var DEF_KEEPALIVE = 60; // SECONDS (FOR TIMESYNC).

	// function to call when pubnub is shutting down.
	function createInstance(setup) {
	  var shutdown = setup.shutdown;
	  var useSendBeacon = typeof setup.use_send_beacon !== 'undefined' ? setup.use_send_beacon : true;
	  var sendBeacon = useSendBeacon ? setup.sendBeacon : null;
	  var db = setup.db || { get: function get() {}, set: function set() {} };
	  var error = setup.error || function () {};
	  var hmac_SHA256 = setup.hmac_SHA256;
	  var crypto_obj = setup.crypto_obj || {
	    encrypt: function encrypt(a) {
	      return a;
	    },
	    decrypt: function decrypt(b) {
	      return b;
	    }
	  };

	  var keychain = new _keychain2.default().setInstanceId(_uuid2.default.v4()).setAuthKey(setup.authKey || '').setSecretKey(setup.secretKey || '').setSubscribeKey(setup.subscribeKey).setPublishKey(setup.publishKey).setCipherKey(setup.cipherKey);

	  keychain.setUUID(setup.uuid || !setup.unique_uuid && db.get(keychain.getSubscribeKey() + 'uuid') || _uuid2.default.v4());

	  // write the new key to storage
	  db.set(keychain.getSubscribeKey() + 'uuid', keychain.getUUID());

	  var config = new _config2.default().setRequestIdConfig(setup.use_request_id || false).setPresenceTimeout(utils.validateHeartbeat(setup.heartbeat || setup.pnexpires || 0, error)).setSupressLeaveEvents(setup.noleave || 0)
	  // .setSubscribeWindow(+setup.windowing || DEF_WINDOWING)
	  // .setSubscribeTimeout((+setup.timeout || DEF_SUB_TIMEOUT) * constants.SECOND)
	  .setInstanceIdConfig(setup.instance_id || false);

	  config.setHeartbeatInterval(setup.heartbeat_interval || config.getPresenceTimeout() / 2 - 1);

	  var stateStorage = new _state2.default();

	  var networking = new _networking2.default(config, keychain, setup.ssl, setup.origin).addBeaconDispatcher(sendBeacon)
	  // .setRequestTimeout(setup.timeout || DEF_TIMEOUT)
	  .setCoreParams(setup.params || {});

	  var publishQueue = new _publish_queue2.default({ networking: networking });

	  // initialize the encryption and decryption logic
	  function encrypt(input, key) {
	    return crypto_obj.encrypt(input, key || keychain.getCipherKey()) || input;
	  }

	  function decrypt(input, key) {
	    return crypto_obj['decrypt'](input, key || keychain.getCipherKey()) || crypto_obj['decrypt'](input, keychain.getCipherKey()) || input;
	  }

	  var eventEmitter = (0, _eventEmitter2.default)({});

	  // initalize the endpoints
	  var timeEndpoint = new _time2.default({ networking: networking });
	  var historyEndpoint = new _history2.default({ networking: networking, decrypt: decrypt });
	  var channelGroupEndpoints = new _channel_groups2.default({ networking: networking });
	  var publishEndpoints = new _publish2.default({ publishQueue: publishQueue, encrypt: encrypt });

	  var pushEndpoint = new _push2.default({ keychain: keychain, config: config, networking: networking, error: error });
	  var presenceEndpoints = new _presence2.default({ keychain: keychain, config: config, networking: networking, error: error, state: stateStorage });

	  var accessEndpoints = new _access2.default({ keychain: keychain, config: config, networking: networking, error: error, hmac_SHA256: hmac_SHA256 });

	  var pubsubEndpoints = new _pubsub2.default({ keychain: keychain, networking: networking, presenceEndpoints: presenceEndpoints, error: error, config: config, state: stateStorage });

	  var presenceHeartbeat = new _presence_heartbeat2.default(config, stateStorage, presenceEndpoints, eventEmitter, error);
	  var connectivity = new _connectivity2.default({ eventEmitter: eventEmitter, networking: networking, timeEndpoint: timeEndpoint });

	  if (config.getPresenceTimeout() === 2) {
	    config.setHeartbeatInterval(1);
	  }

	  var SELF = {

	    accessManager: {
	      grant: accessEndpoints.grant.bind(accessEndpoints),
	      audit: accessEndpoints.audit.bind(accessEndpoints),
	      revoke: accessEndpoints.revoke.bind(accessEndpoints)
	    },

	    channelGroups: {
	      listGroups: channelGroupEndpoints.listGroups.bind(channelGroupEndpoints),
	      deleteGroup: channelGroupEndpoints.removeGroup.bind(channelGroupEndpoints),
	      listChannels: channelGroupEndpoints.listChannels.bind(channelGroupEndpoints),
	      addChannel: channelGroupEndpoints.addChannel.bind(channelGroupEndpoints),
	      removeChannel: channelGroupEndpoints.addChannel.bind(channelGroupEndpoints)
	    },

	    history: historyEndpoint.fetch.bind(historyEndpoint),
	    time: timeEndpoint.fetch.bind(timeEndpoint),
	    publish: publishEndpoints.publish.bind(publishEndpoints),

	    presence: {
	      hereNow: function hereNow(args, callback) {
	        presenceEndpoints.hereNow(args, callback);
	      },
	      whereNow: function whereNow(args, callback) {
	        presenceEndpoints.whereNow(args, callback);
	      },
	      state: function state(args, callback) {
	        presenceEndpoints.performState(args, callback);
	      }
	    },

	    push: {
	      provisionDevice: function provisionDevice(args) {
	        pushEndpoint.provisionDevice(args);
	      },
	      sendPushNotification: function sendPushNotification(args) {
	        return args;
	      }
	    },

	    unsubscribe: function unsubscribe(args, callback) {
	      TIMETOKEN = 0;
	      SUB_RESTORE = 1; // REVISIT !!!!

	      pubsubEndpoints.performUnsubscribe(args, callback);

	      CONNECT();
	    },


	    subscribe: function subscribe(args, callback) {},

	    getCipherKey: function getCipherKey() {
	      return keychain.getCipherKey();
	    },
	    setCipherKey: function setCipherKey(key) {
	      keychain.setCipherKey(key);
	    },
	    rawEncrypt: function rawEncrypt(input, key) {
	      return encrypt(input, key);
	    },
	    rawDecrypt: function rawDecrypt(input, key) {
	      return decrypt(input, key);
	    },
	    getHeartbeat: function getHeartbeat() {
	      return config.getPresenceTimeout();
	    },
	    setHeartbeat: function setHeartbeat(heartbeat, heartbeat_interval) {
	      config.setPresenceTimeout(utils.validateHeartbeat(heartbeat, config.getPresenceTimeout(), error));
	      config.setHeartbeatInterval(heartbeat_interval || config.getPresenceTimeout() / 2 - 1);
	      if (config.getPresenceTimeout() === 2) {
	        config.setHeartbeatInterval(1);
	      }

	      // emit the event
	      eventEmitter.emit('presenceHeartbeatChanged');
	    },
	    getHeartbeatInterval: function getHeartbeatInterval() {
	      return config.getHeartbeatInterval();
	    },
	    setHeartbeatInterval: function setHeartbeatInterval(heartbeatInterval) {
	      config.setHeartbeatInterval(heartbeatInterval);
	      eventEmitter.emit('presenceHeartbeatChanged');
	    },
	    getVersion: function getVersion() {
	      return packageJSON.version;
	    },
	    addParam: function addParam(key, val) {
	      networking.addCoreParam(key, val);
	    },
	    setAuthKey: function setAuthKey(auth) {
	      keychain.setAuthKey(auth);
	      eventEmitter.emit('keychainChanged');
	    },
	    setUUID: function setUUID(uuid) {
	      keychain.setUUID(uuid);
	      eventEmitter.emit('keychainChanged');
	    },
	    getUUID: function getUUID() {
	      return keychain.getUUID();
	    },
	    getSubscribedChannels: function getSubscribedChannels() {
	      return stateStorage.generate_channel_list(true);
	    },
	    stopTimers: function stopTimers() {
	      connectivity.stop();
	      presenceHeartbeat.stop();
	    },
	    shutdown: function (_shutdown) {
	      function shutdown() {
	        return _shutdown.apply(this, arguments);
	      }

	      shutdown.toString = function () {
	        return _shutdown.toString();
	      };

	      return shutdown;
	    }(function () {
	      SELF.stopTimers();
	      if (shutdown) shutdown();
	    })
	  };

	  /*
	    create the connectivity element last, this will signal to other elements
	    that the SDK is connected to internet.
	  */
	  // connectivity.start();
	  // presenceHeartbeat.start();

	  return SELF;
	}

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	//     uuid.js
	//
	//     Copyright (c) 2010-2012 Robert Kieffer
	//     MIT License - http://opensource.org/licenses/mit-license.php

	// Unique ID creation requires a high quality random # generator.  We feature
	// detect to determine the best RNG source, normalizing to a function that
	// returns 128-bits of randomness, since that's what's usually required
	var _rng = __webpack_require__(6);

	// Maps for number <-> hex string conversion
	var _byteToHex = [];
	var _hexToByte = {};
	for (var i = 0; i < 256; i++) {
	  _byteToHex[i] = (i + 0x100).toString(16).substr(1);
	  _hexToByte[_byteToHex[i]] = i;
	}

	// **`parse()` - Parse a UUID into it's component bytes**
	function parse(s, buf, offset) {
	  var i = (buf && offset) || 0, ii = 0;

	  buf = buf || [];
	  s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
	    if (ii < 16) { // Don't overflow!
	      buf[i + ii++] = _hexToByte[oct];
	    }
	  });

	  // Zero out remaining bytes if string was short
	  while (ii < 16) {
	    buf[i + ii++] = 0;
	  }

	  return buf;
	}

	// **`unparse()` - Convert UUID byte array (ala parse()) into a string**
	function unparse(buf, offset) {
	  var i = offset || 0, bth = _byteToHex;
	  return  bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]];
	}

	// **`v1()` - Generate time-based UUID**
	//
	// Inspired by https://github.com/LiosK/UUID.js
	// and http://docs.python.org/library/uuid.html

	// random #'s we need to init node and clockseq
	var _seedBytes = _rng();

	// Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
	var _nodeId = [
	  _seedBytes[0] | 0x01,
	  _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
	];

	// Per 4.2.2, randomize (14 bit) clockseq
	var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

	// Previous uuid creation time
	var _lastMSecs = 0, _lastNSecs = 0;

	// See https://github.com/broofa/node-uuid for API details
	function v1(options, buf, offset) {
	  var i = buf && offset || 0;
	  var b = buf || [];

	  options = options || {};

	  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

	  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
	  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
	  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
	  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
	  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

	  // Per 4.2.1.2, use count of uuid's generated during the current clock
	  // cycle to simulate higher resolution clock
	  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

	  // Time since last uuid creation (in msecs)
	  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

	  // Per 4.2.1.2, Bump clockseq on clock regression
	  if (dt < 0 && options.clockseq === undefined) {
	    clockseq = clockseq + 1 & 0x3fff;
	  }

	  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
	  // time interval
	  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
	    nsecs = 0;
	  }

	  // Per 4.2.1.2 Throw error if too many uuids are requested
	  if (nsecs >= 10000) {
	    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
	  }

	  _lastMSecs = msecs;
	  _lastNSecs = nsecs;
	  _clockseq = clockseq;

	  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
	  msecs += 12219292800000;

	  // `time_low`
	  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
	  b[i++] = tl >>> 24 & 0xff;
	  b[i++] = tl >>> 16 & 0xff;
	  b[i++] = tl >>> 8 & 0xff;
	  b[i++] = tl & 0xff;

	  // `time_mid`
	  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
	  b[i++] = tmh >>> 8 & 0xff;
	  b[i++] = tmh & 0xff;

	  // `time_high_and_version`
	  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
	  b[i++] = tmh >>> 16 & 0xff;

	  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
	  b[i++] = clockseq >>> 8 | 0x80;

	  // `clock_seq_low`
	  b[i++] = clockseq & 0xff;

	  // `node`
	  var node = options.node || _nodeId;
	  for (var n = 0; n < 6; n++) {
	    b[i + n] = node[n];
	  }

	  return buf ? buf : unparse(b);
	}

	// **`v4()` - Generate random UUID**

	// See https://github.com/broofa/node-uuid for API details
	function v4(options, buf, offset) {
	  // Deprecated - 'format' argument, as supported in v1.2
	  var i = buf && offset || 0;

	  if (typeof(options) == 'string') {
	    buf = options == 'binary' ? new Array(16) : null;
	    options = null;
	  }
	  options = options || {};

	  var rnds = options.random || (options.rng || _rng)();

	  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
	  rnds[6] = (rnds[6] & 0x0f) | 0x40;
	  rnds[8] = (rnds[8] & 0x3f) | 0x80;

	  // Copy bytes to buffer, if provided
	  if (buf) {
	    for (var ii = 0; ii < 16; ii++) {
	      buf[i + ii] = rnds[ii];
	    }
	  }

	  return buf || unparse(rnds);
	}

	// Export public API
	var uuid = v4;
	uuid.v1 = v1;
	uuid.v4 = v4;
	uuid.parse = parse;
	uuid.unparse = unparse;

	module.exports = uuid;


/***/ },
/* 6 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {
	var rng;

	if (global.crypto && crypto.getRandomValues) {
	  // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
	  // Moderately fast, high quality
	  var _rnds8 = new Uint8Array(16);
	  rng = function whatwgRNG() {
	    crypto.getRandomValues(_rnds8);
	    return _rnds8;
	  };
	}

	if (!rng) {
	  // Math.random()-based (RNG)
	  //
	  // If all else fails, use Math.random().  It's fast, but is of unspecified
	  // quality.
	  var  _rnds = new Array(16);
	  rng = function() {
	    for (var i = 0, r; i < 16; i++) {
	      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
	      _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
	    }

	    return _rnds;
	  };
	}

	module.exports = rng;


	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var d        = __webpack_require__(8)
	  , callable = __webpack_require__(21)

	  , apply = Function.prototype.apply, call = Function.prototype.call
	  , create = Object.create, defineProperty = Object.defineProperty
	  , defineProperties = Object.defineProperties
	  , hasOwnProperty = Object.prototype.hasOwnProperty
	  , descriptor = { configurable: true, enumerable: false, writable: true }

	  , on, once, off, emit, methods, descriptors, base;

	on = function (type, listener) {
		var data;

		callable(listener);

		if (!hasOwnProperty.call(this, '__ee__')) {
			data = descriptor.value = create(null);
			defineProperty(this, '__ee__', descriptor);
			descriptor.value = null;
		} else {
			data = this.__ee__;
		}
		if (!data[type]) data[type] = listener;
		else if (typeof data[type] === 'object') data[type].push(listener);
		else data[type] = [data[type], listener];

		return this;
	};

	once = function (type, listener) {
		var once, self;

		callable(listener);
		self = this;
		on.call(this, type, once = function () {
			off.call(self, type, once);
			apply.call(listener, this, arguments);
		});

		once.__eeOnceListener__ = listener;
		return this;
	};

	off = function (type, listener) {
		var data, listeners, candidate, i;

		callable(listener);

		if (!hasOwnProperty.call(this, '__ee__')) return this;
		data = this.__ee__;
		if (!data[type]) return this;
		listeners = data[type];

		if (typeof listeners === 'object') {
			for (i = 0; (candidate = listeners[i]); ++i) {
				if ((candidate === listener) ||
						(candidate.__eeOnceListener__ === listener)) {
					if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
					else listeners.splice(i, 1);
				}
			}
		} else {
			if ((listeners === listener) ||
					(listeners.__eeOnceListener__ === listener)) {
				delete data[type];
			}
		}

		return this;
	};

	emit = function (type) {
		var i, l, listener, listeners, args;

		if (!hasOwnProperty.call(this, '__ee__')) return;
		listeners = this.__ee__[type];
		if (!listeners) return;

		if (typeof listeners === 'object') {
			l = arguments.length;
			args = new Array(l - 1);
			for (i = 1; i < l; ++i) args[i - 1] = arguments[i];

			listeners = listeners.slice();
			for (i = 0; (listener = listeners[i]); ++i) {
				apply.call(listener, this, args);
			}
		} else {
			switch (arguments.length) {
			case 1:
				call.call(listeners, this);
				break;
			case 2:
				call.call(listeners, this, arguments[1]);
				break;
			case 3:
				call.call(listeners, this, arguments[1], arguments[2]);
				break;
			default:
				l = arguments.length;
				args = new Array(l - 1);
				for (i = 1; i < l; ++i) {
					args[i - 1] = arguments[i];
				}
				apply.call(listeners, this, args);
			}
		}
	};

	methods = {
		on: on,
		once: once,
		off: off,
		emit: emit
	};

	descriptors = {
		on: d(on),
		once: d(once),
		off: d(off),
		emit: d(emit)
	};

	base = defineProperties({}, descriptors);

	module.exports = exports = function (o) {
		return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
	};
	exports.methods = methods;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var assign        = __webpack_require__(9)
	  , normalizeOpts = __webpack_require__(16)
	  , isCallable    = __webpack_require__(17)
	  , contains      = __webpack_require__(18)

	  , d;

	d = module.exports = function (dscr, value/*, options*/) {
		var c, e, w, options, desc;
		if ((arguments.length < 2) || (typeof dscr !== 'string')) {
			options = value;
			value = dscr;
			dscr = null;
		} else {
			options = arguments[2];
		}
		if (dscr == null) {
			c = w = true;
			e = false;
		} else {
			c = contains.call(dscr, 'c');
			e = contains.call(dscr, 'e');
			w = contains.call(dscr, 'w');
		}

		desc = { value: value, configurable: c, enumerable: e, writable: w };
		return !options ? desc : assign(normalizeOpts(options), desc);
	};

	d.gs = function (dscr, get, set/*, options*/) {
		var c, e, options, desc;
		if (typeof dscr !== 'string') {
			options = set;
			set = get;
			get = dscr;
			dscr = null;
		} else {
			options = arguments[3];
		}
		if (get == null) {
			get = undefined;
		} else if (!isCallable(get)) {
			options = get;
			get = set = undefined;
		} else if (set == null) {
			set = undefined;
		} else if (!isCallable(set)) {
			options = set;
			set = undefined;
		}
		if (dscr == null) {
			c = true;
			e = false;
		} else {
			c = contains.call(dscr, 'c');
			e = contains.call(dscr, 'e');
		}

		desc = { get: get, set: set, configurable: c, enumerable: e };
		return !options ? desc : assign(normalizeOpts(options), desc);
	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(10)()
		? Object.assign
		: __webpack_require__(11);


/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
		var assign = Object.assign, obj;
		if (typeof assign !== 'function') return false;
		obj = { foo: 'raz' };
		assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
		return (obj.foo + obj.bar + obj.trzy) === 'razdwatrzy';
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var keys  = __webpack_require__(12)
	  , value = __webpack_require__(15)

	  , max = Math.max;

	module.exports = function (dest, src/*, …srcn*/) {
		var error, i, l = max(arguments.length, 2), assign;
		dest = Object(value(dest));
		assign = function (key) {
			try { dest[key] = src[key]; } catch (e) {
				if (!error) error = e;
			}
		};
		for (i = 1; i < l; ++i) {
			src = arguments[i];
			keys(src).forEach(assign);
		}
		if (error !== undefined) throw error;
		return dest;
	};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(13)()
		? Object.keys
		: __webpack_require__(14);


/***/ },
/* 13 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
		try {
			Object.keys('primitive');
			return true;
		} catch (e) { return false; }
	};


/***/ },
/* 14 */
/***/ function(module, exports) {

	'use strict';

	var keys = Object.keys;

	module.exports = function (object) {
		return keys(object == null ? object : Object(object));
	};


/***/ },
/* 15 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (value) {
		if (value == null) throw new TypeError("Cannot use null or undefined");
		return value;
	};


/***/ },
/* 16 */
/***/ function(module, exports) {

	'use strict';

	var forEach = Array.prototype.forEach, create = Object.create;

	var process = function (src, obj) {
		var key;
		for (key in src) obj[key] = src[key];
	};

	module.exports = function (options/*, …options*/) {
		var result = create(null);
		forEach.call(arguments, function (options) {
			if (options == null) return;
			process(Object(options), result);
		});
		return result;
	};


/***/ },
/* 17 */
/***/ function(module, exports) {

	// Deprecated

	'use strict';

	module.exports = function (obj) { return typeof obj === 'function'; };


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(19)()
		? String.prototype.contains
		: __webpack_require__(20);


/***/ },
/* 19 */
/***/ function(module, exports) {

	'use strict';

	var str = 'razdwatrzy';

	module.exports = function () {
		if (typeof str.contains !== 'function') return false;
		return ((str.contains('dwa') === true) && (str.contains('foo') === false));
	};


/***/ },
/* 20 */
/***/ function(module, exports) {

	'use strict';

	var indexOf = String.prototype.indexOf;

	module.exports = function (searchString/*, position*/) {
		return indexOf.call(this, searchString, arguments[1]) > -1;
	};


/***/ },
/* 21 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (fn) {
		if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
		return fn;
	};


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _superagent = __webpack_require__(23);

	var _superagent2 = _interopRequireDefault(_superagent);

	var _keychain = __webpack_require__(30);

	var _keychain2 = _interopRequireDefault(_keychain);

	var _responders = __webpack_require__(31);

	var _responders2 = _interopRequireDefault(_responders);

	var _config = __webpack_require__(32);

	var _config2 = _interopRequireDefault(_config);

	var _utils = __webpack_require__(33);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(config, keychain) {
	    var ssl = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
	    var origin = arguments.length <= 3 || arguments[3] === undefined ? 'pubsub.pubnub.com' : arguments[3];

	    _classCallCheck(this, _class);

	    this._config = config;
	    this._keychain = keychain;
	    this._r = new _responders2.default('#networking');

	    this._maxSubDomain = 20;
	    this._currentSubDomain = Math.floor(Math.random() * this._maxSubDomain);

	    this._providedFQDN = (ssl ? 'https://' : 'http://') + origin;
	    this._coreParams = {};

	    // create initial origins
	    this.shiftStandardOrigin(false);
	    this.shiftSubscribeOrigin(false);
	  } /* items that must be passed with each request. */

	  _createClass(_class, [{
	    key: 'setCoreParams',
	    value: function setCoreParams(params) {
	      this._coreParams = params;
	      return this;
	    }
	  }, {
	    key: 'addCoreParam',
	    value: function addCoreParam(key, value) {
	      this._coreParams[key] = value;
	    }
	  }, {
	    key: 'addBeaconDispatcher',
	    value: function addBeaconDispatcher(sendBeacon) {
	      this._sendBeacon = sendBeacon;
	      return this;
	    }

	    /*
	      Fuses the provided endpoint specific params (from data) with instance params
	    */

	  }, {
	    key: 'prepareParams',
	    value: function prepareParams(data) {
	      if (!data) data = {};

	      _utils2.default.each(this._coreParams, function (key, value) {
	        if (!(key in data)) data[key] = value;
	      });

	      if (this._config.isInstanceIdEnabled()) {
	        data.instanceid = this._keychain.getInstanceId();
	      }

	      return data;
	    }
	  }, {
	    key: 'nextOrigin',
	    value: function nextOrigin(failover) {
	      // if a custom origin is supplied, use do not bother with shuffling subdomains
	      if (this._providedFQDN.indexOf('pubsub.') === -1) {
	        return this._providedFQDN;
	      }

	      var newSubDomain = void 0;

	      if (failover) {
	        newSubDomain = _utils2.default.generateUUID().split('-')[0];
	      } else {
	        this._currentSubDomain = this._currentSubDomain + 1;

	        if (this._currentSubDomain >= this._maxSubDomain) {
	          this._currentSubDomain = 1;
	        }

	        newSubDomain = this._currentSubDomain.toString();
	      }

	      return this._providedFQDN.replace('pubsub', 'ps' + newSubDomain);
	    }

	    // origin operations

	  }, {
	    key: 'shiftStandardOrigin',
	    value: function shiftStandardOrigin() {
	      var failover = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

	      this._standardOrigin = this.nextOrigin(failover);

	      return this._standardOrigin;
	    }
	  }, {
	    key: 'shiftSubscribeOrigin',
	    value: function shiftSubscribeOrigin() {
	      var failover = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

	      this._subscribeOrigin = this.nextOrigin(failover);

	      return this._subscribeOrigin;
	    }

	    // method based URL's

	  }, {
	    key: 'fetchHistory',
	    value: function fetchHistory(channel, incomingData, callback) {
	      if (!this._keychain.getSubscribeKey()) {
	        return callback(this._r.validationError('Missing Subscribe Key'));
	      }

	      var url = [this.getStandardOrigin(), 'v2', 'history', 'sub-key', this._keychain.getSubscribeKey(), 'channel', _utils2.default.encode(channel)];

	      var data = this.prepareParams(incomingData);

	      if (this._keychain.getAuthKey()) {
	        data.auth = this._keychain.getAuthKey();
	      }

	      this._xdr({ data: data, callback: callback, url: url });
	    }
	  }, {
	    key: 'performChannelGroupOperation',
	    value: function performChannelGroupOperation(channelGroup, mode, incomingData, callback) {
	      if (!this._keychain.getSubscribeKey()) {
	        return callback(this._r.validationError('Missing Subscribe Key'));
	      }

	      var url = [this.getStandardOrigin(), 'v1', 'channel-registration', 'sub-key', this._keychain.getSubscribeKey(), 'channel-group'];

	      if (channelGroup && channelGroup !== '*') {
	        url.push(channelGroup);
	      }

	      if (mode === 'remove') {
	        url.push('remove');
	      }

	      var data = this.prepareParams(incomingData);

	      if (this._keychain.getAuthKey()) {
	        data.auth = this._keychain.getAuthKey();
	      }

	      this._xdr({ data: data, callback: callback, url: url });
	    }
	  }, {
	    key: 'provisionDeviceForPush',
	    value: function provisionDeviceForPush(deviceId, data) {
	      var url = [this.getStandardOrigin(), 'v1', 'push', 'sub-key', this._keychain.getSubscribeKey(), 'devices', deviceId];

	      data.uuid = this._keychain.getUUID();
	      data.auth = this._keychain.getAuthKey();

	      return this._xdr({ data: data, url: url });
	    }
	  }, {
	    key: 'performGrant',
	    value: function performGrant(_ref) {
	      var data = _ref.data;
	      var success = _ref.success;
	      var fail = _ref.fail;

	      var url = [this.getStandardOrigin(), 'v1', 'auth', 'grant', 'sub-key', this._keychain.getSubscribeKey()];

	      this._xdr({ data: data, success: success, fail: fail, url: url });
	    }
	  }, {
	    key: 'performHeartbeat',
	    value: function performHeartbeat(channels, _ref2) {
	      var data = _ref2.data;
	      var success = _ref2.success;
	      var fail = _ref2.fail;

	      var url = [this.getStandardOrigin(), 'v2', 'presence', 'sub-key', this._keychain.getSubscribeKey(), 'channel', channels, 'heartbeat'];

	      this._xdr({ data: data, success: success, fail: fail, url: url });
	    }
	  }, {
	    key: 'performState',
	    value: function performState(state, channel, uuid, _ref3) {
	      var data = _ref3.data;
	      var success = _ref3.success;
	      var fail = _ref3.fail;

	      var url = [this.getStandardOrigin(), 'v2', 'presence', 'sub-key', this._keychain.getSubscribeKey(), 'channel', channel];

	      if (state) {
	        url.push('uuid', uuid, 'data');
	      } else {
	        url.push('uuid', _utils2.default.encode(uuid));
	      }

	      this._xdr({ data: data, success: success, fail: fail, url: url });
	    }
	  }, {
	    key: 'performAudit',
	    value: function performAudit(_ref4) {
	      var data = _ref4.data;
	      var success = _ref4.success;
	      var fail = _ref4.fail;

	      var url = [this.getStandardOrigin(), 'v1', 'auth', 'audit', 'sub-key', this._keychain.getSubscribeKey()];

	      this._xdr({ data: data, success: success, fail: fail, url: url });
	    }
	  }, {
	    key: 'performChannelLeave',
	    value: function performChannelLeave(channel, _ref5) {
	      var data = _ref5.data;
	      var success = _ref5.success;
	      var fail = _ref5.fail;

	      var origin = this.nextOrigin(false);
	      var url = [origin, 'v2', 'presence', 'sub_key', this._keychain.getSubscribeKey(), 'channel', _utils2.default.encode(channel), 'leave'];

	      if (this._sendBeacon) {
	        if (this._sendBeacon(_utils2.default.buildURL(url, data))) {
	          success({ status: 200, action: 'leave', message: 'OK', service: 'Presence' });
	        }
	      } else {
	        this._xdr({ data: data, success: success, fail: fail, url: url });
	      }
	    }
	  }, {
	    key: 'performChannelGroupLeave',
	    value: function performChannelGroupLeave(_ref6) {
	      var data = _ref6.data;
	      var success = _ref6.success;
	      var fail = _ref6.fail;

	      var origin = this.nextOrigin(false);
	      var url = [origin, 'v2', 'presence', 'sub_key', this._keychain.getSubscribeKey(), 'channel', _utils2.default.encode(','), 'leave'];

	      if (typeof this._sendBeacon !== 'undefined') {
	        if (this._sendBeacon(_utils2.default.buildURL(url, data))) {
	          success({ status: 200, action: 'leave', message: 'OK', service: 'Presence' });
	        }
	      } else {
	        this._xdr({ data: data, success: success, fail: fail, url: url });
	      }
	    }
	  }, {
	    key: 'fetchTime',
	    value: function fetchTime(callback) {
	      var data = this.prepareParams({});
	      var url = [this.getStandardOrigin(), 'time', 0];

	      if (this._keychain.getUUID()) {
	        data.uuid = this._keychain.getUUID();
	      }

	      if (this._keychain.getAuthKey()) {
	        data.auth = this._keychain.getAuthKey();
	      }

	      this._xdr({ data: data, callback: callback, url: url });
	    }
	  }, {
	    key: 'fetchWhereNow',
	    value: function fetchWhereNow(uuid, _ref7) {
	      var data = _ref7.data;
	      var success = _ref7.success;
	      var fail = _ref7.fail;

	      var url = [this.getStandardOrigin(), 'v2', 'presence', 'sub_key', this._keychain.getSubscribeKey(), 'uuid', _utils2.default.encode(uuid)];

	      this._xdr({ data: data, success: success, fail: fail, url: url });
	    }
	  }, {
	    key: 'fetchHereNow',
	    value: function fetchHereNow(channel, channelGroup, _ref8) {
	      var data = _ref8.data;
	      var success = _ref8.success;
	      var fail = _ref8.fail;

	      var url = [this.getStandardOrigin(), 'v2', 'presence', 'sub_key', this._keychain.getSubscribeKey()];

	      if (channel) {
	        url.push('channel');
	        url.push(_utils2.default.encode(channel));
	      }

	      if (channelGroup && !channel) {
	        url.push('channel');
	        url.push(',');
	      }

	      this._xdr({ data: data, success: success, fail: fail, url: url });
	    }
	  }, {
	    key: 'performPublish',
	    value: function performPublish(channel, msg, incomingData, mode, callback) {
	      if (!this._keychain.getSubscribeKey()) {
	        return callback(this._r.validationError('Missing Subscribe Key'));
	      }

	      if (!this._keychain.getPublishKey()) {
	        return callback(this._r.validationError('Missing Publish Key'));
	      }

	      var url = [this.getStandardOrigin(), 'publish', this._keychain.getPublishKey(), this._keychain.getSubscribeKey(), 0, _utils2.default.encode(channel), 0, _utils2.default.encode(msg)];

	      var data = this.prepareParams(incomingData);

	      if (this._keychain.getUUID()) {
	        data.uuid = this._keychain.getUUID();
	      }

	      if (this._keychain.getAuthKey()) {
	        data.auth = this._keychain.getAuthKey();
	      }

	      if (mode === 'POST') {
	        this._postXDR({ data: data, callback: callback, url: url });
	      } else {
	        this._xdr({ data: data, callback: callback, url: url });
	      }
	    }
	  }, {
	    key: 'getOrigin',
	    value: function getOrigin() {
	      return this._providedFQDN;
	    }
	  }, {
	    key: 'getStandardOrigin',
	    value: function getStandardOrigin() {
	      return this._standardOrigin;
	    }
	  }, {
	    key: 'getSubscribeOrigin',
	    value: function getSubscribeOrigin() {
	      return this._subscribeOrigin;
	    }
	  }, {
	    key: '_postXDR',
	    value: function _postXDR(_ref9) {
	      var data = _ref9.data;
	      var url = _ref9.url;
	      var callback = _ref9.callback;

	      var superagentConstruct = _superagent2.default.post(url.join('/')).query(data);
	      this._abstractedXDR(superagentConstruct, callback);
	    }
	  }, {
	    key: '_xdr',
	    value: function _xdr(_ref10) {
	      var data = _ref10.data;
	      var url = _ref10.url;
	      var callback = _ref10.callback;

	      var superagentConstruct = _superagent2.default.get(url.join('/')).query(data);
	      this._abstractedXDR(superagentConstruct, callback);
	    }
	  }, {
	    key: '_abstractedXDR',
	    value: function _abstractedXDR(superagentConstruct, callback) {
	      superagentConstruct.type('json').end(function (err, resp) {
	        if (err) return callback(err, null);

	        if ((typeof resp === 'undefined' ? 'undefined' : _typeof(resp)) === 'object' && resp.error) {
	          callback(resp.error, null);
	          return;
	        }

	        callback(null, JSON.parse(resp.text));
	      });
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */

	var Emitter = __webpack_require__(24);
	var reduce = __webpack_require__(25);
	var requestBase = __webpack_require__(26);
	var isObject = __webpack_require__(27);

	/**
	 * Root reference for iframes.
	 */

	var root;
	if (typeof window !== 'undefined') { // Browser window
	  root = window;
	} else if (typeof self !== 'undefined') { // Web Worker
	  root = self;
	} else { // Other environments
	  root = this;
	}

	/**
	 * Noop.
	 */

	function noop(){};

	/**
	 * Check if `obj` is a host object,
	 * we don't want to serialize these :)
	 *
	 * TODO: future proof, move to compoent land
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */

	function isHost(obj) {
	  var str = {}.toString.call(obj);

	  switch (str) {
	    case '[object File]':
	    case '[object Blob]':
	    case '[object FormData]':
	      return true;
	    default:
	      return false;
	  }
	}

	/**
	 * Expose `request`.
	 */

	var request = module.exports = __webpack_require__(29).bind(null, Request);

	/**
	 * Determine XHR.
	 */

	request.getXHR = function () {
	  if (root.XMLHttpRequest
	      && (!root.location || 'file:' != root.location.protocol
	          || !root.ActiveXObject)) {
	    return new XMLHttpRequest;
	  } else {
	    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
	  }
	  return false;
	};

	/**
	 * Removes leading and trailing whitespace, added to support IE.
	 *
	 * @param {String} s
	 * @return {String}
	 * @api private
	 */

	var trim = ''.trim
	  ? function(s) { return s.trim(); }
	  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

	/**
	 * Serialize the given `obj`.
	 *
	 * @param {Object} obj
	 * @return {String}
	 * @api private
	 */

	function serialize(obj) {
	  if (!isObject(obj)) return obj;
	  var pairs = [];
	  for (var key in obj) {
	    if (null != obj[key]) {
	      pushEncodedKeyValuePair(pairs, key, obj[key]);
	        }
	      }
	  return pairs.join('&');
	}

	/**
	 * Helps 'serialize' with serializing arrays.
	 * Mutates the pairs array.
	 *
	 * @param {Array} pairs
	 * @param {String} key
	 * @param {Mixed} val
	 */

	function pushEncodedKeyValuePair(pairs, key, val) {
	  if (Array.isArray(val)) {
	    return val.forEach(function(v) {
	      pushEncodedKeyValuePair(pairs, key, v);
	    });
	  }
	  pairs.push(encodeURIComponent(key)
	    + '=' + encodeURIComponent(val));
	}

	/**
	 * Expose serialization method.
	 */

	 request.serializeObject = serialize;

	 /**
	  * Parse the given x-www-form-urlencoded `str`.
	  *
	  * @param {String} str
	  * @return {Object}
	  * @api private
	  */

	function parseString(str) {
	  var obj = {};
	  var pairs = str.split('&');
	  var parts;
	  var pair;

	  for (var i = 0, len = pairs.length; i < len; ++i) {
	    pair = pairs[i];
	    parts = pair.split('=');
	    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
	  }

	  return obj;
	}

	/**
	 * Expose parser.
	 */

	request.parseString = parseString;

	/**
	 * Default MIME type map.
	 *
	 *     superagent.types.xml = 'application/xml';
	 *
	 */

	request.types = {
	  html: 'text/html',
	  json: 'application/json',
	  xml: 'application/xml',
	  urlencoded: 'application/x-www-form-urlencoded',
	  'form': 'application/x-www-form-urlencoded',
	  'form-data': 'application/x-www-form-urlencoded'
	};

	/**
	 * Default serialization map.
	 *
	 *     superagent.serialize['application/xml'] = function(obj){
	 *       return 'generated xml here';
	 *     };
	 *
	 */

	 request.serialize = {
	   'application/x-www-form-urlencoded': serialize,
	   'application/json': JSON.stringify
	 };

	 /**
	  * Default parsers.
	  *
	  *     superagent.parse['application/xml'] = function(str){
	  *       return { object parsed from str };
	  *     };
	  *
	  */

	request.parse = {
	  'application/x-www-form-urlencoded': parseString,
	  'application/json': JSON.parse
	};

	/**
	 * Parse the given header `str` into
	 * an object containing the mapped fields.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */

	function parseHeader(str) {
	  var lines = str.split(/\r?\n/);
	  var fields = {};
	  var index;
	  var line;
	  var field;
	  var val;

	  lines.pop(); // trailing CRLF

	  for (var i = 0, len = lines.length; i < len; ++i) {
	    line = lines[i];
	    index = line.indexOf(':');
	    field = line.slice(0, index).toLowerCase();
	    val = trim(line.slice(index + 1));
	    fields[field] = val;
	  }

	  return fields;
	}

	/**
	 * Check if `mime` is json or has +json structured syntax suffix.
	 *
	 * @param {String} mime
	 * @return {Boolean}
	 * @api private
	 */

	function isJSON(mime) {
	  return /[\/+]json\b/.test(mime);
	}

	/**
	 * Return the mime type for the given `str`.
	 *
	 * @param {String} str
	 * @return {String}
	 * @api private
	 */

	function type(str){
	  return str.split(/ *; */).shift();
	};

	/**
	 * Return header field parameters.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */

	function params(str){
	  return reduce(str.split(/ *; */), function(obj, str){
	    var parts = str.split(/ *= */)
	      , key = parts.shift()
	      , val = parts.shift();

	    if (key && val) obj[key] = val;
	    return obj;
	  }, {});
	};

	/**
	 * Initialize a new `Response` with the given `xhr`.
	 *
	 *  - set flags (.ok, .error, etc)
	 *  - parse header
	 *
	 * Examples:
	 *
	 *  Aliasing `superagent` as `request` is nice:
	 *
	 *      request = superagent;
	 *
	 *  We can use the promise-like API, or pass callbacks:
	 *
	 *      request.get('/').end(function(res){});
	 *      request.get('/', function(res){});
	 *
	 *  Sending data can be chained:
	 *
	 *      request
	 *        .post('/user')
	 *        .send({ name: 'tj' })
	 *        .end(function(res){});
	 *
	 *  Or passed to `.send()`:
	 *
	 *      request
	 *        .post('/user')
	 *        .send({ name: 'tj' }, function(res){});
	 *
	 *  Or passed to `.post()`:
	 *
	 *      request
	 *        .post('/user', { name: 'tj' })
	 *        .end(function(res){});
	 *
	 * Or further reduced to a single call for simple cases:
	 *
	 *      request
	 *        .post('/user', { name: 'tj' }, function(res){});
	 *
	 * @param {XMLHTTPRequest} xhr
	 * @param {Object} options
	 * @api private
	 */

	function Response(req, options) {
	  options = options || {};
	  this.req = req;
	  this.xhr = this.req.xhr;
	  // responseText is accessible only if responseType is '' or 'text' and on older browsers
	  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
	     ? this.xhr.responseText
	     : null;
	  this.statusText = this.req.xhr.statusText;
	  this.setStatusProperties(this.xhr.status);
	  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
	  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
	  // getResponseHeader still works. so we get content-type even if getting
	  // other headers fails.
	  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
	  this.setHeaderProperties(this.header);
	  this.body = this.req.method != 'HEAD'
	    ? this.parseBody(this.text ? this.text : this.xhr.response)
	    : null;
	}

	/**
	 * Get case-insensitive `field` value.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */

	Response.prototype.get = function(field){
	  return this.header[field.toLowerCase()];
	};

	/**
	 * Set header related properties:
	 *
	 *   - `.type` the content type without params
	 *
	 * A response of "Content-Type: text/plain; charset=utf-8"
	 * will provide you with a `.type` of "text/plain".
	 *
	 * @param {Object} header
	 * @api private
	 */

	Response.prototype.setHeaderProperties = function(header){
	  // content-type
	  var ct = this.header['content-type'] || '';
	  this.type = type(ct);

	  // params
	  var obj = params(ct);
	  for (var key in obj) this[key] = obj[key];
	};

	/**
	 * Parse the given body `str`.
	 *
	 * Used for auto-parsing of bodies. Parsers
	 * are defined on the `superagent.parse` object.
	 *
	 * @param {String} str
	 * @return {Mixed}
	 * @api private
	 */

	Response.prototype.parseBody = function(str){
	  var parse = request.parse[this.type];
	  return parse && str && (str.length || str instanceof Object)
	    ? parse(str)
	    : null;
	};

	/**
	 * Set flags such as `.ok` based on `status`.
	 *
	 * For example a 2xx response will give you a `.ok` of __true__
	 * whereas 5xx will be __false__ and `.error` will be __true__. The
	 * `.clientError` and `.serverError` are also available to be more
	 * specific, and `.statusType` is the class of error ranging from 1..5
	 * sometimes useful for mapping respond colors etc.
	 *
	 * "sugar" properties are also defined for common cases. Currently providing:
	 *
	 *   - .noContent
	 *   - .badRequest
	 *   - .unauthorized
	 *   - .notAcceptable
	 *   - .notFound
	 *
	 * @param {Number} status
	 * @api private
	 */

	Response.prototype.setStatusProperties = function(status){
	  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
	  if (status === 1223) {
	    status = 204;
	  }

	  var type = status / 100 | 0;

	  // status / class
	  this.status = this.statusCode = status;
	  this.statusType = type;

	  // basics
	  this.info = 1 == type;
	  this.ok = 2 == type;
	  this.clientError = 4 == type;
	  this.serverError = 5 == type;
	  this.error = (4 == type || 5 == type)
	    ? this.toError()
	    : false;

	  // sugar
	  this.accepted = 202 == status;
	  this.noContent = 204 == status;
	  this.badRequest = 400 == status;
	  this.unauthorized = 401 == status;
	  this.notAcceptable = 406 == status;
	  this.notFound = 404 == status;
	  this.forbidden = 403 == status;
	};

	/**
	 * Return an `Error` representative of this response.
	 *
	 * @return {Error}
	 * @api public
	 */

	Response.prototype.toError = function(){
	  var req = this.req;
	  var method = req.method;
	  var url = req.url;

	  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
	  var err = new Error(msg);
	  err.status = this.status;
	  err.method = method;
	  err.url = url;

	  return err;
	};

	/**
	 * Expose `Response`.
	 */

	request.Response = Response;

	/**
	 * Initialize a new `Request` with the given `method` and `url`.
	 *
	 * @param {String} method
	 * @param {String} url
	 * @api public
	 */

	function Request(method, url) {
	  var self = this;
	  this._query = this._query || [];
	  this.method = method;
	  this.url = url;
	  this.header = {}; // preserves header name case
	  this._header = {}; // coerces header names to lowercase
	  this.on('end', function(){
	    var err = null;
	    var res = null;

	    try {
	      res = new Response(self);
	    } catch(e) {
	      err = new Error('Parser is unable to parse the response');
	      err.parse = true;
	      err.original = e;
	      // issue #675: return the raw response if the response parsing fails
	      err.rawResponse = self.xhr && self.xhr.responseText ? self.xhr.responseText : null;
	      // issue #876: return the http status code if the response parsing fails
	      err.statusCode = self.xhr && self.xhr.status ? self.xhr.status : null;
	      return self.callback(err);
	    }

	    self.emit('response', res);

	    if (err) {
	      return self.callback(err, res);
	    }

	    if (res.status >= 200 && res.status < 300) {
	      return self.callback(err, res);
	    }

	    var new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
	    new_err.original = err;
	    new_err.response = res;
	    new_err.status = res.status;

	    self.callback(new_err, res);
	  });
	}

	/**
	 * Mixin `Emitter` and `requestBase`.
	 */

	Emitter(Request.prototype);
	for (var key in requestBase) {
	  Request.prototype[key] = requestBase[key];
	}

	/**
	 * Abort the request, and clear potential timeout.
	 *
	 * @return {Request}
	 * @api public
	 */

	Request.prototype.abort = function(){
	  if (this.aborted) return;
	  this.aborted = true;
	  this.xhr.abort();
	  this.clearTimeout();
	  this.emit('abort');
	  return this;
	};

	/**
	 * Set Content-Type to `type`, mapping values from `request.types`.
	 *
	 * Examples:
	 *
	 *      superagent.types.xml = 'application/xml';
	 *
	 *      request.post('/')
	 *        .type('xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 *      request.post('/')
	 *        .type('application/xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 * @param {String} type
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.type = function(type){
	  this.set('Content-Type', request.types[type] || type);
	  return this;
	};

	/**
	 * Set responseType to `val`. Presently valid responseTypes are 'blob' and 
	 * 'arraybuffer'.
	 *
	 * Examples:
	 *
	 *      req.get('/')
	 *        .responseType('blob')
	 *        .end(callback);
	 *
	 * @param {String} val
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.responseType = function(val){
	  this._responseType = val;
	  return this;
	};

	/**
	 * Set Accept to `type`, mapping values from `request.types`.
	 *
	 * Examples:
	 *
	 *      superagent.types.json = 'application/json';
	 *
	 *      request.get('/agent')
	 *        .accept('json')
	 *        .end(callback);
	 *
	 *      request.get('/agent')
	 *        .accept('application/json')
	 *        .end(callback);
	 *
	 * @param {String} accept
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.accept = function(type){
	  this.set('Accept', request.types[type] || type);
	  return this;
	};

	/**
	 * Set Authorization field value with `user` and `pass`.
	 *
	 * @param {String} user
	 * @param {String} pass
	 * @param {Object} options with 'type' property 'auto' or 'basic' (default 'basic')
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.auth = function(user, pass, options){
	  if (!options) {
	    options = {
	      type: 'basic'
	    }
	  }

	  switch (options.type) {
	    case 'basic':
	      var str = btoa(user + ':' + pass);
	      this.set('Authorization', 'Basic ' + str);
	    break;

	    case 'auto':
	      this.username = user;
	      this.password = pass;
	    break;
	  }
	  return this;
	};

	/**
	* Add query-string `val`.
	*
	* Examples:
	*
	*   request.get('/shoes')
	*     .query('size=10')
	*     .query({ color: 'blue' })
	*
	* @param {Object|String} val
	* @return {Request} for chaining
	* @api public
	*/

	Request.prototype.query = function(val){
	  if ('string' != typeof val) val = serialize(val);
	  if (val) this._query.push(val);
	  return this;
	};

	/**
	 * Queue the given `file` as an attachment to the specified `field`,
	 * with optional `filename`.
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
	 *   .end(callback);
	 * ```
	 *
	 * @param {String} field
	 * @param {Blob|File} file
	 * @param {String} filename
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.attach = function(field, file, filename){
	  if (!this._formData) this._formData = new root.FormData();
	  this._formData.append(field, file, filename || file.name);
	  return this;
	};

	/**
	 * Send `data` as the request body, defaulting the `.type()` to "json" when
	 * an object is given.
	 *
	 * Examples:
	 *
	 *       // manual json
	 *       request.post('/user')
	 *         .type('json')
	 *         .send('{"name":"tj"}')
	 *         .end(callback)
	 *
	 *       // auto json
	 *       request.post('/user')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // manual x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send('name=tj')
	 *         .end(callback)
	 *
	 *       // auto x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // defaults to x-www-form-urlencoded
	  *      request.post('/user')
	  *        .send('name=tobi')
	  *        .send('species=ferret')
	  *        .end(callback)
	 *
	 * @param {String|Object} data
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.send = function(data){
	  var obj = isObject(data);
	  var type = this._header['content-type'];

	  // merge
	  if (obj && isObject(this._data)) {
	    for (var key in data) {
	      this._data[key] = data[key];
	    }
	  } else if ('string' == typeof data) {
	    if (!type) this.type('form');
	    type = this._header['content-type'];
	    if ('application/x-www-form-urlencoded' == type) {
	      this._data = this._data
	        ? this._data + '&' + data
	        : data;
	    } else {
	      this._data = (this._data || '') + data;
	    }
	  } else {
	    this._data = data;
	  }

	  if (!obj || isHost(data)) return this;
	  if (!type) this.type('json');
	  return this;
	};

	/**
	 * Invoke the callback with `err` and `res`
	 * and handle arity check.
	 *
	 * @param {Error} err
	 * @param {Response} res
	 * @api private
	 */

	Request.prototype.callback = function(err, res){
	  var fn = this._callback;
	  this.clearTimeout();
	  fn(err, res);
	};

	/**
	 * Invoke callback with x-domain error.
	 *
	 * @api private
	 */

	Request.prototype.crossDomainError = function(){
	  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
	  err.crossDomain = true;

	  err.status = this.status;
	  err.method = this.method;
	  err.url = this.url;

	  this.callback(err);
	};

	/**
	 * Invoke callback with timeout error.
	 *
	 * @api private
	 */

	Request.prototype.timeoutError = function(){
	  var timeout = this._timeout;
	  var err = new Error('timeout of ' + timeout + 'ms exceeded');
	  err.timeout = timeout;
	  this.callback(err);
	};

	/**
	 * Enable transmission of cookies with x-domain requests.
	 *
	 * Note that for this to work the origin must not be
	 * using "Access-Control-Allow-Origin" with a wildcard,
	 * and also must set "Access-Control-Allow-Credentials"
	 * to "true".
	 *
	 * @api public
	 */

	Request.prototype.withCredentials = function(){
	  this._withCredentials = true;
	  return this;
	};

	/**
	 * Initiate request, invoking callback `fn(res)`
	 * with an instanceof `Response`.
	 *
	 * @param {Function} fn
	 * @return {Request} for chaining
	 * @api public
	 */

	Request.prototype.end = function(fn){
	  var self = this;
	  var xhr = this.xhr = request.getXHR();
	  var query = this._query.join('&');
	  var timeout = this._timeout;
	  var data = this._formData || this._data;

	  // store callback
	  this._callback = fn || noop;

	  // state change
	  xhr.onreadystatechange = function(){
	    if (4 != xhr.readyState) return;

	    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
	    // result in the error "Could not complete the operation due to error c00c023f"
	    var status;
	    try { status = xhr.status } catch(e) { status = 0; }

	    if (0 == status) {
	      if (self.timedout) return self.timeoutError();
	      if (self.aborted) return;
	      return self.crossDomainError();
	    }
	    self.emit('end');
	  };

	  // progress
	  var handleProgress = function(e){
	    if (e.total > 0) {
	      e.percent = e.loaded / e.total * 100;
	    }
	    e.direction = 'download';
	    self.emit('progress', e);
	  };
	  if (this.hasListeners('progress')) {
	    xhr.onprogress = handleProgress;
	  }
	  try {
	    if (xhr.upload && this.hasListeners('progress')) {
	      xhr.upload.onprogress = handleProgress;
	    }
	  } catch(e) {
	    // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
	    // Reported here:
	    // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
	  }

	  // timeout
	  if (timeout && !this._timer) {
	    this._timer = setTimeout(function(){
	      self.timedout = true;
	      self.abort();
	    }, timeout);
	  }

	  // querystring
	  if (query) {
	    query = request.serializeObject(query);
	    this.url += ~this.url.indexOf('?')
	      ? '&' + query
	      : '?' + query;
	  }

	  // initiate request
	  if (this.username && this.password) {
	    xhr.open(this.method, this.url, true, this.username, this.password);
	  } else {
	    xhr.open(this.method, this.url, true);
	  }

	  // CORS
	  if (this._withCredentials) xhr.withCredentials = true;

	  // body
	  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
	    // serialize stuff
	    var contentType = this._header['content-type'];
	    var serialize = this._parser || request.serialize[contentType ? contentType.split(';')[0] : ''];
	    if (!serialize && isJSON(contentType)) serialize = request.serialize['application/json'];
	    if (serialize) data = serialize(data);
	  }

	  // set header fields
	  for (var field in this.header) {
	    if (null == this.header[field]) continue;
	    xhr.setRequestHeader(field, this.header[field]);
	  }

	  if (this._responseType) {
	    xhr.responseType = this._responseType;
	  }

	  // send stuff
	  this.emit('request', this);

	  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
	  // We need null here if data is undefined
	  xhr.send(typeof data !== 'undefined' ? data : null);
	  return this;
	};


	/**
	 * Expose `Request`.
	 */

	request.Request = Request;

	/**
	 * GET `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} data or fn
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	request.get = function(url, data, fn){
	  var req = request('GET', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.query(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * HEAD `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} data or fn
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	request.head = function(url, data, fn){
	  var req = request('HEAD', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * DELETE `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	function del(url, fn){
	  var req = request('DELETE', url);
	  if (fn) req.end(fn);
	  return req;
	};

	request['del'] = del;
	request['delete'] = del;

	/**
	 * PATCH `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} data
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	request.patch = function(url, data, fn){
	  var req = request('PATCH', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * POST `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} data
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	request.post = function(url, data, fn){
	  var req = request('POST', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};

	/**
	 * PUT `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} data or fn
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */

	request.put = function(url, data, fn){
	  var req = request('PUT', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};


/***/ },
/* 24 */
/***/ function(module, exports) {

	
	/**
	 * Expose `Emitter`.
	 */

	module.exports = Emitter;

	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */

	function Emitter(obj) {
	  if (obj) return mixin(obj);
	};

	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */

	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}

	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.on =
	Emitter.prototype.addEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
	    .push(fn);
	  return this;
	};

	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.once = function(event, fn){
	  function on() {
	    this.off(event, on);
	    fn.apply(this, arguments);
	  }

	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};

	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */

	Emitter.prototype.off =
	Emitter.prototype.removeListener =
	Emitter.prototype.removeAllListeners =
	Emitter.prototype.removeEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};

	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }

	  // specific event
	  var callbacks = this._callbacks['$' + event];
	  if (!callbacks) return this;

	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks['$' + event];
	    return this;
	  }

	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	  return this;
	};

	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */

	Emitter.prototype.emit = function(event){
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1)
	    , callbacks = this._callbacks['$' + event];

	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }

	  return this;
	};

	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */

	Emitter.prototype.listeners = function(event){
	  this._callbacks = this._callbacks || {};
	  return this._callbacks['$' + event] || [];
	};

	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */

	Emitter.prototype.hasListeners = function(event){
	  return !! this.listeners(event).length;
	};


/***/ },
/* 25 */
/***/ function(module, exports) {

	
	/**
	 * Reduce `arr` with `fn`.
	 *
	 * @param {Array} arr
	 * @param {Function} fn
	 * @param {Mixed} initial
	 *
	 * TODO: combatible error handling?
	 */

	module.exports = function(arr, fn, initial){  
	  var idx = 0;
	  var len = arr.length;
	  var curr = arguments.length == 3
	    ? initial
	    : arr[idx++];

	  while (idx < len) {
	    curr = fn.call(null, curr, arr[idx], ++idx, arr);
	  }
	  
	  return curr;
	};

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module of mixed-in functions shared between node and client code
	 */
	var isObject = __webpack_require__(27);

	var FormData = __webpack_require__(28); // browserify compatible

	/**
	 * Clear previous timeout.
	 *
	 * @return {Request} for chaining
	 * @api public
	 */

	exports.clearTimeout = function _clearTimeout(){
	  this._timeout = 0;
	  clearTimeout(this._timer);
	  return this;
	};

	/**
	 * Force given parser
	 *
	 * Sets the body parser no matter type.
	 *
	 * @param {Function}
	 * @api public
	 */

	exports.parse = function parse(fn){
	  this._parser = fn;
	  return this;
	};

	/**
	 * Set timeout to `ms`.
	 *
	 * @param {Number} ms
	 * @return {Request} for chaining
	 * @api public
	 */

	exports.timeout = function timeout(ms){
	  this._timeout = ms;
	  return this;
	};

	/**
	 * Faux promise support
	 *
	 * @param {Function} fulfill
	 * @param {Function} reject
	 * @return {Request}
	 */

	exports.then = function then(fulfill, reject) {
	  return this.end(function(err, res) {
	    err ? reject(err) : fulfill(res);
	  });
	}

	/**
	 * Allow for extension
	 */

	exports.use = function use(fn) {
	  fn(this);
	  return this;
	}


	/**
	 * Get request header `field`.
	 * Case-insensitive.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */

	exports.get = function(field){
	  return this._header[field.toLowerCase()];
	};

	/**
	 * Get case-insensitive header `field` value.
	 * This is a deprecated internal API. Use `.get(field)` instead.
	 *
	 * (getHeader is no longer used internally by the superagent code base)
	 *
	 * @param {String} field
	 * @return {String}
	 * @api private
	 * @deprecated
	 */

	exports.getHeader = exports.get;

	/**
	 * Set header `field` to `val`, or multiple fields with one object.
	 * Case-insensitive.
	 *
	 * Examples:
	 *
	 *      req.get('/')
	 *        .set('Accept', 'application/json')
	 *        .set('X-API-Key', 'foobar')
	 *        .end(callback);
	 *
	 *      req.get('/')
	 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
	 *        .end(callback);
	 *
	 * @param {String|Object} field
	 * @param {String} val
	 * @return {Request} for chaining
	 * @api public
	 */

	exports.set = function(field, val){
	  if (isObject(field)) {
	    for (var key in field) {
	      this.set(key, field[key]);
	    }
	    return this;
	  }
	  this._header[field.toLowerCase()] = val;
	  this.header[field] = val;
	  return this;
	};

	/**
	 * Remove header `field`.
	 * Case-insensitive.
	 *
	 * Example:
	 *
	 *      req.get('/')
	 *        .unset('User-Agent')
	 *        .end(callback);
	 *
	 * @param {String} field
	 */
	exports.unset = function(field){
	  delete this._header[field.toLowerCase()];
	  delete this.header[field];
	  return this;
	};

	/**
	 * Write the field `name` and `val` for "multipart/form-data"
	 * request bodies.
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .field('foo', 'bar')
	 *   .end(callback);
	 * ```
	 *
	 * @param {String} name
	 * @param {String|Blob|File|Buffer|fs.ReadStream} val
	 * @return {Request} for chaining
	 * @api public
	 */
	exports.field = function(name, val) {
	  if (!this._formData) this._formData = new FormData();
	  this._formData.append(name, val);
	  return this;
	};


/***/ },
/* 27 */
/***/ function(module, exports) {

	/**
	 * Check if `obj` is an object.
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */

	function isObject(obj) {
	  return null != obj && 'object' == typeof obj;
	}

	module.exports = isObject;


/***/ },
/* 28 */
/***/ function(module, exports) {

	module.exports = FormData;

/***/ },
/* 29 */
/***/ function(module, exports) {

	// The node and browser modules expose versions of this with the
	// appropriate constructor function bound as first argument
	/**
	 * Issue a request:
	 *
	 * Examples:
	 *
	 *    request('GET', '/users').end(callback)
	 *    request('/users').end(callback)
	 *    request('/users', callback)
	 *
	 * @param {String} method
	 * @param {String|Function} url or callback
	 * @return {Request}
	 * @api public
	 */

	function request(RequestConstructor, method, url) {
	  // callback
	  if ('function' == typeof url) {
	    return new RequestConstructor('GET', method).end(url);
	  }

	  // url first
	  if (2 == arguments.length) {
	    return new RequestConstructor('GET', method);
	  }

	  return new RequestConstructor(method, url);
	}

	module.exports = request;


/***/ },
/* 30 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class() {
	    _classCallCheck(this, _class);
	  }

	  _createClass(_class, [{
	    key: "setUUID",
	    value: function setUUID(UUID) {
	      this._UUID = UUID;
	      return this;
	    }
	  }, {
	    key: "setCipherKey",
	    value: function setCipherKey(cipherKey) {
	      this._cipherKey = cipherKey;
	      return this;
	    }
	  }, {
	    key: "setSubscribeKey",
	    value: function setSubscribeKey(subscribeKey) {
	      this._subscribeKey = subscribeKey;
	      return this;
	    }
	  }, {
	    key: "setPublishKey",
	    value: function setPublishKey(publishkey) {
	      this._publishKey = publishkey;
	      return this;
	    }
	  }, {
	    key: "setAuthKey",
	    value: function setAuthKey(authKey) {
	      this._authKey = authKey;
	      return this;
	    }
	  }, {
	    key: "setInstanceId",
	    value: function setInstanceId(instanceId) {
	      this._instanceId = instanceId;
	      return this;
	    }
	  }, {
	    key: "setSecretKey",
	    value: function setSecretKey(secretKey) {
	      this._secretKey = secretKey;
	      return this;
	    }

	    //

	  }, {
	    key: "getCipherKey",
	    value: function getCipherKey() {
	      return this._cipherKey;
	    }
	  }, {
	    key: "getSubscribeKey",
	    value: function getSubscribeKey() {
	      return this._subscribeKey;
	    }
	  }, {
	    key: "getPublishKey",
	    value: function getPublishKey() {
	      return this._publishKey;
	    }
	  }, {
	    key: "getAuthKey",
	    value: function getAuthKey() {
	      return this._authKey;
	    }
	  }, {
	    key: "getInstanceId",
	    value: function getInstanceId() {
	      return this._instanceId;
	    }
	  }, {
	    key: "getSecretKey",
	    value: function getSecretKey() {
	      return this._secretKey;
	    }
	  }, {
	    key: "getUUID",
	    value: function getUUID() {
	      return this._UUID;
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 31 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(componenetName) {
	    _classCallCheck(this, _class);

	    this._componentName = componenetName;
	  }

	  _createClass(_class, [{
	    key: 'callback',
	    value: function callback(response, _callback) {
	      if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object') {
	        if (response.error) {
	          this.error(response, _callback);
	          return;
	        }
	        if (response.payload) {
	          if (response.next_page) {
	            if (_callback) _callback(response.payload, response.next_page);
	          } else {
	            if (_callback) _callback(response.payload);
	          }
	          return;
	        }
	      }
	      if (_callback) _callback(response);
	    }
	  }, {
	    key: 'error',
	    value: function error(response, callback) {
	      if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object' && response.error) {
	        var preparedData = _pick(response, ['message', 'payload']);
	        return this._createError(callback, preparedData, 'httpResultError');
	      } else {
	        return this._createError(callback, { message: response }, 'httpResultError');
	      }
	    }
	  }, {
	    key: 'validationError',
	    value: function validationError(message) {
	      return this._createError({ message: message }, 'validationError');
	    }
	  }, {
	    key: '_createError',
	    value: function _createError(errorPayload, type) {
	      errorPayload.component = this._componentName;
	      errorPayload.type = type;
	      return errorPayload;
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 32 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {

	  /*
	    how often (in seconds) the client should announce its presence to server
	  */


	  /*
	    if requestId config is true, the SDK will pass a unique request identifier
	    with each request as request_id=<UUID>
	  */

	  function _class() {
	    _classCallCheck(this, _class);

	    this._instanceId = false;
	    this._requestId = false;
	  }

	  /*
	    configuration to supress leave events; when a presence leave is performed
	    this configuration will disallow the leave event from happening
	  */


	  /*
	    how long the server will wait before declaring that the client is gone.
	  */


	  /*
	    if instanceId config is true, the SDK will pass the unique instance
	    identifier to the server as instanceId=<UUID>
	  */


	  _createClass(_class, [{
	    key: "setInstanceIdConfig",
	    value: function setInstanceIdConfig(configValue) {
	      this._instanceId = configValue;
	      return this;
	    }
	  }, {
	    key: "setRequestIdConfig",
	    value: function setRequestIdConfig(configValue) {
	      this._requestId = configValue;
	      return this;
	    }
	  }, {
	    key: "setHeartbeatInterval",
	    value: function setHeartbeatInterval(configValue) {
	      this._heartbeatInterval = configValue;
	      return this;
	    }
	  }, {
	    key: "setPresenceTimeout",
	    value: function setPresenceTimeout(configValue) {
	      this._presenceTimeout = configValue;
	      return this;
	    }
	  }, {
	    key: "setSupressLeaveEvents",
	    value: function setSupressLeaveEvents(configValue) {
	      this._suppressLeaveEvents = configValue;
	      return this;
	    }
	  }, {
	    key: "isInstanceIdEnabled",
	    value: function isInstanceIdEnabled() {
	      return this._instanceId;
	    }
	  }, {
	    key: "isRequestIdEnabled",
	    value: function isRequestIdEnabled() {
	      return this._requestId;
	    }
	  }, {
	    key: "isSuppressingLeaveEvents",
	    value: function isSuppressingLeaveEvents() {
	      return this._suppressLeaveEvents;
	    }
	  }, {
	    key: "getHeartbeatInterval",
	    value: function getHeartbeatInterval() {
	      return this._heartbeatInterval;
	    }
	  }, {
	    key: "getPresenceTimeout",
	    value: function getPresenceTimeout() {
	      return this._presenceTimeout;
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _uuid = __webpack_require__(5);

	var _uuid2 = _interopRequireDefault(_uuid);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/* eslint no-unused-expressions: 0, block-scoped-var: 0, no-redeclare: 0, guard-for-in: 0 */

	var defaultConfiguration = __webpack_require__(34);
	var NOW = 1;

	function rnow() {
	  return +new Date();
	}

	function unique() {
	  return 'x' + ++NOW + '' + +new Date();
	}

	function isArray(arg) {
	  return !!arg && typeof arg !== 'string' && (Array.isArray && Array.isArray(arg) || typeof arg.length === 'number');
	  // return !!arg && (Array.isArray && Array.isArray(arg) || typeof(arg.length) === "number")
	}

	/**
	 * EACH
	 * ====
	 * each( [1,2,3], function(item) { } )
	 */
	function each(o, f) {
	  if (!o || !f) {
	    return;
	  }

	  if (isArray(o)) {
	    for (var i = 0, l = o.length; i < l;) {
	      f.call(o[i], o[i], i++);
	    }
	  } else {
	    for (var i in o) {
	      o.hasOwnProperty && o.hasOwnProperty(i) && f.call(o[i], i, o[i]);
	    }
	  }
	}

	/**
	 * ENCODE
	 * ======
	 * var encoded_data = encode('path');
	 */
	function encode(path) {
	  return encodeURIComponent(path);
	}

	/**
	 * Build Url
	 * =======
	 *
	 */
	function buildURL(urlComponents, urlParams) {
	  var url = urlComponents.join(defaultConfiguration.URLBIT);
	  var params = [];

	  if (!urlParams) return url;

	  each(urlParams, function (key, value) {
	    var valueStr = (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' ? JSON.stringify(value) : value;
	    typeof value !== 'undefined' && value !== null && encode(valueStr).length > 0 && params.push(key + '=' + encode(valueStr));
	  });

	  url += '?' + params.join(defaultConfiguration.PARAMSBIT);
	  return url;
	}

	/**
	 * timeout
	 * =======
	 * timeout( function(){}, 100 );
	 */
	function timeout(fun, wait) {
	  if (typeof setTimeout === 'undefined') {
	    return;
	  }

	  return setTimeout(fun, wait);
	}

	/**
	 * uuid
	 * ====
	 * var my_uuid = generateUUID();
	 */
	function generateUUID(callback) {
	  var u = _uuid2.default.v4();
	  if (callback) callback(u);
	  return u;
	}

	/**
	 * MAP
	 * ===
	 * var list = map( [1,2,3], function(item) { return item + 1 } )
	 */
	function map(list, fun) {
	  var fin = [];
	  each(list || [], function (k, v) {
	    fin.push(fun(k, v));
	  });
	  return fin;
	}

	function pamEncode(str) {
	  return encodeURIComponent(str).replace(/[!'()*~]/g, function (c) {
	    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
	  });
	}

	function _object_to_key_list(o) {
	  var l = [];
	  each(o, function (key) {
	    l.push(key);
	  });
	  return l;
	}

	function _object_to_key_list_sorted(o) {
	  return _object_to_key_list(o).sort();
	}

	function _get_pam_sign_input_from_params(params) {
	  var l = _object_to_key_list_sorted(params);
	  return map(l, function (paramKey) {
	    return paramKey + '=' + pamEncode(params[paramKey]);
	  }).join('&');
	}

	function validateHeartbeat(heartbeat, cur_heartbeat, error) {
	  var err = false;

	  if (typeof heartbeat === 'undefined') {
	    return cur_heartbeat;
	  }

	  if (typeof heartbeat === 'number') {
	    if (heartbeat > defaultConfiguration._minimumHeartbeatInterval || heartbeat === 0) {
	      err = false;
	    } else {
	      err = true;
	    }
	  } else if (typeof heartbeat === 'boolean') {
	    if (!heartbeat) {
	      return 0;
	    } else {
	      return defaultConfiguration._defaultHeartbeatInterval;
	    }
	  } else {
	    err = true;
	  }

	  if (err) {
	    if (error) {
	      var errorMessage = 'Presence Heartbeat value invalid. Valid range ( x >';
	      errorMessage += defaultConfiguration._minimumHeartbeatInterval + ' or x = 0). Current Value : ';
	      errorMessage += cur_heartbeat || defaultConfiguration._minimumHeartbeatInterval;

	      error(errorMessage);
	    }
	    return cur_heartbeat || defaultConfiguration._minimumHeartbeatInterval;
	  } else return heartbeat;
	}

	module.exports = {
	  buildURL: buildURL,
	  encode: encode,
	  each: each,
	  rnow: rnow,
	  isArray: isArray,
	  map: map,
	  pamEncode: pamEncode,
	  generateUUID: generateUUID,
	  timeout: timeout,
	  _get_pam_sign_input_from_params: _get_pam_sign_input_from_params,
	  _object_to_key_list_sorted: _object_to_key_list_sorted,
	  _object_to_key_list: _object_to_key_list,
	  validateHeartbeat: validateHeartbeat,
	  unique: unique
	};

/***/ },
/* 34 */
/***/ function(module, exports) {

	module.exports = {
		"PARAMSBIT": "&",
		"URLBIT": "/",
		"defaultHeartbeatInterval": 30,
		"minimumHeartbeatInterval": 5,
		"PRESENCE_SUFFIX": "-pnpres",
		"SECOND": 1000
	};

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _utils = __webpack_require__(33);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class() {
	    _classCallCheck(this, _class);

	    this._channelStorage = {};
	    this._channelGroupStorage = {};
	    this._presenceState = {};
	  }

	  /*
	    a relic mutex to keep track if the client is ready
	  */


	  _createClass(_class, [{
	    key: 'containsChannel',
	    value: function containsChannel(name) {
	      return name in this._channelStorage;
	    }
	  }, {
	    key: 'containsChannelGroup',
	    value: function containsChannelGroup(name) {
	      return name in this._channelGroupStorage;
	    }
	  }, {
	    key: 'getChannel',
	    value: function getChannel(name) {
	      return this._channelStorage[name];
	    }
	  }, {
	    key: 'getChannelGroup',
	    value: function getChannelGroup(name) {
	      return this._channelGroupStorage[name];
	    }
	  }, {
	    key: 'addChannel',
	    value: function addChannel(name, metadata) {
	      this._channelStorage[name] = metadata;
	    }
	  }, {
	    key: 'addChannelGroup',
	    value: function addChannelGroup(name, metadata) {
	      this._channelGroupStorage[name] = metadata;
	    }
	  }, {
	    key: 'addToPresenceState',
	    value: function addToPresenceState(key, value) {
	      this._presenceState[key] = value;
	    }
	  }, {
	    key: 'isInPresenceState',
	    value: function isInPresenceState(key) {
	      return key in this._presenceState;
	    }
	  }, {
	    key: 'removeFromPresenceState',
	    value: function removeFromPresenceState(key) {
	      delete this._presenceState[key];
	    }
	  }, {
	    key: 'getPresenceState',
	    value: function getPresenceState() {
	      return this._presenceState;
	    }
	  }, {
	    key: 'setIsReady',
	    value: function setIsReady(readyValue) {
	      this._ready = readyValue;
	    }
	  }, {
	    key: 'getIsReady',
	    value: function getIsReady() {
	      return this._ready;
	    }

	    /**
	     * Generate Subscription Channel List
	     * ==================================
	     * generate_channel_list(channels_object);
	     * nopresence (==include-presence) == false --> presence True
	     */

	  }, {
	    key: 'getChannels',
	    value: function getChannels(nopresence) {
	      var list = [];
	      _utils2.default.each(this._channelStorage, function (channel, status) {
	        if (nopresence) {
	          if (channel.search('-pnpres') < 0) {
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

	  }, {
	    key: 'getChannelGroups',
	    value: function getChannelGroups(nopresence) {
	      var list = [];
	      _utils2.default.each(this._channelGroupStorage, function (channel_group, status) {
	        if (nopresence) {
	          if (channel_group.search('-pnpres') < 0) {
	            if (status.subscribed) list.push(channel_group);
	          }
	        } else {
	          if (status.subscribed) list.push(channel_group);
	        }
	      });
	      return list.sort();
	    }
	  }, {
	    key: 'each_channel_group',
	    value: function each_channel_group(callback) {
	      var count = 0;

	      _utils2.default.each(this.getChannelGroups(), function (channel_group) {
	        var chang = this.getChannelGroup(channel_group);

	        if (!chang) return;

	        count++;
	        (callback || function () {})(chang);
	      });

	      return count;
	    }
	  }, {
	    key: 'each_channel',
	    value: function each_channel(callback) {
	      var count = 0;

	      _utils2.default.each(this.getChannels(), function (channel) {
	        var chan = this.getChannel(channel);

	        if (!chan) return;

	        count++;
	        (callback || function () {})(chan);
	      });

	      return count;
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(22);

	var _networking2 = _interopRequireDefault(_networking);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// disable one-at-a-time publishing queue and publish on call.

	var PublishItem = function PublishItem() {
	  _classCallCheck(this, PublishItem);
	};

	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;
	    var _ref$parallelPublish = _ref.parallelPublish;
	    var parallelPublish = _ref$parallelPublish === undefined ? false : _ref$parallelPublish;

	    _classCallCheck(this, _class);

	    this._publishQueue = [];
	    this._networking = networking;
	    this._parallelPublish = parallelPublish;
	    this._isSending = false;
	  }

	  _createClass(_class, [{
	    key: 'newQueueable',
	    value: function newQueueable() {
	      return new PublishItem();
	    }
	  }, {
	    key: 'queueItem',
	    value: function queueItem(publishItem) {
	      this._publishQueue.push(publishItem);
	      this._sendNext();
	    }
	  }, {
	    key: '_sendNext',
	    value: function _sendNext() {
	      // if we have nothing to send, return right away.
	      if (this._publishQueue.length === 0) {
	        return;
	      }

	      // if parallel publish is enabled, always send.
	      if (this._parallelPublish) {
	        return this.__publishNext();
	      }

	      // if something is sending, wait for it to finish up.
	      if (this._isSending) {
	        return;
	      }

	      this._isSending = true;
	      this.__publishNext();
	    }
	  }, {
	    key: '__publishNext',
	    value: function __publishNext() {
	      var _this = this;

	      var _publishQueue$shift = this._publishQueue.shift();

	      var channel = _publishQueue$shift.channel;
	      var payload = _publishQueue$shift.payload;
	      var params = _publishQueue$shift.params;
	      var httpMethod = _publishQueue$shift.httpMethod;
	      var callback = _publishQueue$shift.callback;


	      var onPublish = function onPublish(err, response) {
	        _this._isSending = false;
	        _this._sendNext();
	        callback(err, response);
	      };

	      this._networking.performPublish(channel, payload, params, httpMethod, onPublish);
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* flow */

	var _config = __webpack_require__(32);

	var _config2 = _interopRequireDefault(_config);

	var _state = __webpack_require__(35);

	var _state2 = _interopRequireDefault(_state);

	var _presence = __webpack_require__(38);

	var _presence2 = _interopRequireDefault(_presence);

	var _logger = __webpack_require__(39);

	var _logger2 = _interopRequireDefault(_logger);

	var _eventEmitter = __webpack_require__(7);

	var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var constants = __webpack_require__(34);
	var logger = _logger2.default.getLogger('component/presenceHeartbeat');

	var _class = function () {
	  function _class(config, state, presence, eventEmitter, error) {
	    _classCallCheck(this, _class);

	    this._error = error;
	    this._state = state;
	    this._config = config;
	    this._presence = presence;
	    logger.debug('init', { config: config, state: state, presence: presence, error: error });

	    /*
	      listen to two events:
	        1) internetConnected: call presence.
	        2) presenceHeartbeatChanged: change the rate at which we are heartbeating
	        3) subscriptionChange: channel / channel group was adjusted
	        4) internetDisconnected: do not bother calling presence.
	    */
	    eventEmitter.on('internetConnected', this.__start);
	    eventEmitter.on('internetDisconnected', this.__stop);
	    eventEmitter.on('presenceHeartbeatChanged', this.__start);
	    eventEmitter.on('subscriptionChange', this.__start);
	  }

	  /**
	    removes scheduled presence heartbeat executions and executes
	    a new presence heartbeat with the new interval
	  */


	  _createClass(_class, [{
	    key: '__start',
	    value: function __start() {
	      logger.debug('(re-)starting presence heartbeat');
	      this.__start();
	      this.__periodicHeartbeat();
	    }

	    /**
	      remove presence heartbeat schedules;
	    */

	  }, {
	    key: '__stop',
	    value: function __stop() {
	      logger.debug('stopping presence heartbeat');
	      clearTimeout(this._intervalId);
	      this._intervalId = null;
	    }
	  }, {
	    key: '__periodicHeartbeat',
	    value: function __periodicHeartbeat() {
	      var timeoutInterval = this._config.getHeartbeatInterval() * constants.SECOND;

	      // if the heartbeat interval is not within the allowed range, exit early
	      if (!_range(this._config.getHeartbeatInterval(), 1, 501)) {
	        logger.debug('interval is greater than 500 or below 1; aborting');
	        return;
	      }

	      // if there are no active channel / channel groups, bail out.
	      if (!this._state.getChannels(true).length && !this._state.getChannelGroups(true).length) {
	        logger.debug('there are no channels / channel groups to heartbeat; aborting');
	        return;
	      }

	      this._presence.heartbeat({
	        callback: function callback() {
	          this._intervalId = setTimeout(this._presence_heartbeat, timeoutInterval);
	        },
	        error: function error(e) {
	          if (this._error) {
	            this._error('Presence Heartbeat unable to reach Pubnub servers', e);
	          }

	          this._intervalId = setTimeout(this._presence_heartbeat, timeoutInterval);
	        }
	      });
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(22);

	var _networking2 = _interopRequireDefault(_networking);

	var _config = __webpack_require__(32);

	var _config2 = _interopRequireDefault(_config);

	var _keychain = __webpack_require__(30);

	var _keychain2 = _interopRequireDefault(_keychain);

	var _state = __webpack_require__(35);

	var _state2 = _interopRequireDefault(_state);

	var _responders = __webpack_require__(31);

	var _responders2 = _interopRequireDefault(_responders);

	var _utils = __webpack_require__(33);

	var _utils2 = _interopRequireDefault(_utils);

	var _defaults = __webpack_require__(34);

	var _defaults2 = _interopRequireDefault(_defaults);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;
	    var config = _ref.config;
	    var keychain = _ref.keychain;
	    var state = _ref.state;
	    var error = _ref.error;

	    _classCallCheck(this, _class);

	    this._networking = networking;
	    this._config = config;
	    this._keychain = keychain;
	    this._state = state;
	    this._error = error;
	  }

	  _createClass(_class, [{
	    key: 'hereNow',
	    value: function hereNow(args, argumentCallback) {
	      var callback = args.callback || argumentCallback;
	      var err = args.error || function () {};
	      var authkey = args.auth_key || this._keychain.getAuthKey();
	      var channel = args.channel;
	      var channelGroup = args.channel_group;
	      var uuids = 'uuids' in args ? args.uuids : true;
	      var state = args.state;
	      var data = {
	        uuid: this._keychain.getUUID(),
	        auth: authkey
	      };

	      if (!uuids) data.disable_uuids = 1;
	      if (state) data.state = 1;

	      // Make sure we have a Channel
	      if (!callback) return this._error('Missing Callback');
	      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');

	      if (channelGroup) {
	        data['channel-group'] = channelGroup;
	      }

	      if (this._config.isInstanceIdEnabled()) {
	        data.instanceid = this._keychain.getInstanceId();
	      }

	      this._networking.fetchHereNow(channel, channelGroup, {
	        data: this._networking.prepareParams(data),
	        success: function success(response) {
	          _responders2.default.callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _responders2.default.error(response, err);
	        }
	      });
	    }
	  }, {
	    key: 'whereNow',
	    value: function whereNow(args, argumentCallback) {
	      var callback = args.callback || argumentCallback;
	      var err = args.error || function () {};
	      var authKey = args.auth_key || this._keychain.getAuthKey();
	      var uuid = args.uuid || this._keychain.getUUID();
	      var data = {
	        auth: authKey
	      };

	      // Make sure we have a Channel
	      if (!callback) return this._error('Missing Callback');
	      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');

	      if (this._config.isInstanceIdEnabled()) {
	        data.instanceid = this._keychain.getInstanceId();
	      }

	      this._networking.fetchWhereNow(uuid, {
	        data: this._networking.prepareParams(data),
	        success: function success(response) {
	          _responders2.default.callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _responders2.default.error(response, err);
	        }
	      });
	    }
	  }, {
	    key: 'heartbeat',
	    value: function heartbeat(args) {
	      var callback = args.callback || function () {};
	      var err = args.error || function () {};
	      var data = {
	        uuid: this._keychain.getUUID(),
	        auth: this._keychain.getAuthKey()
	      };

	      var st = JSON.stringify(this._state.getPresenceState());
	      if (st.length > 2) {
	        data.state = JSON.stringify(this._state.getPresenceState());
	      }

	      if (this._config.getPresenceTimeout() > 0 && this._config.getPresenceTimeout() < 320) {
	        data.heartbeat = this._config.getPresenceTimeout();
	      }

	      var channels = _utils2.default.encode(this._state.generate_channel_list(true).join(','));
	      var channelGroups = this._state.generate_channel_group_list(true).join(',');

	      if (!channels) channels = ',';
	      if (channelGroups) data['channel-group'] = channelGroups;

	      if (this._config.isInstanceIdEnabled()) {
	        data.instanceid = this._keychain.getInstanceId();
	      }

	      if (this._config.isRequestIdEnabled()) {
	        data.requestid = _utils2.default.generateUUID();
	      }

	      this._networking.performHeartbeat(channels, {
	        data: this._networking.prepareParams(data),
	        success: function success(response) {
	          _responders2.default.callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _responders2.default.error(response, err);
	        }
	      });
	    }
	  }, {
	    key: 'performState',
	    value: function performState(args, argumentCallback) {
	      var callback = args.callback || argumentCallback || function () {};
	      var err = args.error || function () {};
	      var authKey = args.auth_key || this._keychain.getAuthKey();
	      var state = args.state;
	      var uuid = args.uuid || this._keychain.getUUID();
	      var channel = args.channel;
	      var channelGroup = args.channel_group;
	      var data = this._networking.prepareParams({ auth: authKey });

	      // Make sure we have a Channel
	      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');
	      if (!uuid) return this._error('Missing UUID');
	      if (!channel && !channelGroup) return this._error('Missing Channel');

	      if (typeof channel !== 'undefined' && this._state.getChannel(channel) && this._state.getChannel(channel).subscribed) {
	        if (state) {
	          this._state.addToPresenceState(channel, state);
	        }
	      }

	      if (typeof channelGroup !== 'undefined' && this._state.getChannelGroup(channelGroup) && this._state.getChannelGroup(channelGroup).subscribed) {
	        if (state) {
	          this._state.addToPresenceState(channelGroup, state);
	        }
	        data['channel-group'] = channelGroup;

	        if (!channel) {
	          channel = ',';
	        }
	      }

	      data.state = JSON.stringify(state);

	      if (this._config.isInstanceIdEnabled()) {
	        data.instanceid = this._keychain.getInstanceId();
	      }

	      this._networking.performState(state, channel, uuid, {
	        data: this._networking.prepareParams(data),
	        success: function success(response) {
	          _responders2.default.callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _responders2.default.error(response, err);
	        }
	      });
	    }
	  }, {
	    key: 'announceChannelLeave',
	    value: function announceChannelLeave(channel, authKey, argCallback, error) {
	      var data = {
	        uuid: this._keychain.getUUID(),
	        auth: authKey || this._keychain.getAuthKey()
	      };

	      var callback = argCallback || function () {};
	      var err = error || function () {};

	      // Prevent Leaving a Presence Channel
	      if (channel.indexOf(_defaults2.default.PRESENCE_SUFFIX) > 0) {
	        return true;
	      }

	      /* TODO move me to unsubscribe */
	      if (this._config.isSuppressingLeaveEvents()) {
	        return false;
	      }

	      if (this._config.isInstanceIdEnabled()) {
	        data.instanceid = this._keychain.getInstanceId();
	      }
	      /* TODO: move me to unsubscribe */

	      this._networking.performChannelLeave(channel, {
	        data: this._networking.prepareParams(data),
	        success: function success(response) {
	          _responders2.default.callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _responders2.default.error(response, err);
	        }
	      });
	    }
	  }, {
	    key: 'announceChannelGroupLeave',
	    value: function announceChannelGroupLeave(channelGroup, authKey, argCallback, error) {
	      var data = {
	        uuid: this._keychain.getUUID(),
	        auth: authKey || this._keychain.getAuthKey()
	      };

	      var callback = argCallback || function () {};
	      var err = error || function () {};

	      // Prevent Leaving a Presence Channel Group
	      if (channelGroup.indexOf(_defaults2.default.PRESENCE_SUFFIX) > 0) {
	        return true;
	      }

	      if (this._config.isSuppressingLeaveEvents()) {
	        return false;
	      }

	      /* TODO move me to unsubscribe */
	      if (channelGroup && channelGroup.length > 0) {
	        data['channel-group'] = channelGroup;
	      }

	      if (this._config.isInstanceIdEnabled()) {
	        data.instanceid = this._keychain.getInstanceId();
	      }
	      /* TODO move me to unsubscribe */

	      this._networking.performChannelGroupLeave({
	        data: this._networking.prepareParams(data),
	        success: function success(response) {
	          _responders2.default.callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _responders2.default.error(response, err);
	        }
	      });
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _loglevel = __webpack_require__(40);

	var _loglevel2 = _interopRequireDefault(_loglevel);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var moduleLogger = function () {
	  function moduleLogger(moduleName) {
	    _classCallCheck(this, moduleLogger);

	    this._moduleName = moduleName;
	  }

	  _createClass(moduleLogger, [{
	    key: '__commonLogger',
	    value: function __commonLogger(level, payload) {
	      _loglevel2.default[level]({
	        component: this._moduleName,
	        data: payload,
	        timestamp: new Date()
	      });
	    }
	  }, {
	    key: 'error',
	    value: function error(payload) {
	      this.__commonLogger('error', payload);
	    }
	  }, {
	    key: 'debug',
	    value: function debug(payload) {
	      this.__commonLogger('debug', payload);
	    }
	  }]);

	  return moduleLogger;
	}();

	exports.default = {
	  getLogger: function getLogger(moduleName) {
	    return new moduleLogger(moduleName);
	  }
	};

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
	* loglevel - https://github.com/pimterry/loglevel
	*
	* Copyright (c) 2013 Tim Perry
	* Licensed under the MIT license.
	*/
	(function (root, definition) {
	    "use strict";
	    if (typeof module === 'object' && module.exports && "function" === 'function') {
	        module.exports = definition();
	    } else if (true) {
	        !(__WEBPACK_AMD_DEFINE_FACTORY__ = (definition), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else {
	        root.log = definition();
	    }
	}(this, function () {
	    "use strict";
	    var noop = function() {};
	    var undefinedType = "undefined";

	    function realMethod(methodName) {
	        if (typeof console === undefinedType) {
	            return false; // We can't build a real method without a console to log to
	        } else if (console[methodName] !== undefined) {
	            return bindMethod(console, methodName);
	        } else if (console.log !== undefined) {
	            return bindMethod(console, 'log');
	        } else {
	            return noop;
	        }
	    }

	    function bindMethod(obj, methodName) {
	        var method = obj[methodName];
	        if (typeof method.bind === 'function') {
	            return method.bind(obj);
	        } else {
	            try {
	                return Function.prototype.bind.call(method, obj);
	            } catch (e) {
	                // Missing bind shim or IE8 + Modernizr, fallback to wrapping
	                return function() {
	                    return Function.prototype.apply.apply(method, [obj, arguments]);
	                };
	            }
	        }
	    }

	    // these private functions always need `this` to be set properly

	    function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
	        return function () {
	            if (typeof console !== undefinedType) {
	                replaceLoggingMethods.call(this, level, loggerName);
	                this[methodName].apply(this, arguments);
	            }
	        };
	    }

	    function replaceLoggingMethods(level, loggerName) {
	        /*jshint validthis:true */
	        for (var i = 0; i < logMethods.length; i++) {
	            var methodName = logMethods[i];
	            this[methodName] = (i < level) ?
	                noop :
	                this.methodFactory(methodName, level, loggerName);
	        }
	    }

	    function defaultMethodFactory(methodName, level, loggerName) {
	        /*jshint validthis:true */
	        return realMethod(methodName) ||
	               enableLoggingWhenConsoleArrives.apply(this, arguments);
	    }

	    var logMethods = [
	        "trace",
	        "debug",
	        "info",
	        "warn",
	        "error"
	    ];

	    function Logger(name, defaultLevel, factory) {
	      var self = this;
	      var currentLevel;
	      var storageKey = "loglevel";
	      if (name) {
	        storageKey += ":" + name;
	      }

	      function persistLevelIfPossible(levelNum) {
	          var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

	          // Use localStorage if available
	          try {
	              window.localStorage[storageKey] = levelName;
	              return;
	          } catch (ignore) {}

	          // Use session cookie as fallback
	          try {
	              window.document.cookie =
	                encodeURIComponent(storageKey) + "=" + levelName + ";";
	          } catch (ignore) {}
	      }

	      function getPersistedLevel() {
	          var storedLevel;

	          try {
	              storedLevel = window.localStorage[storageKey];
	          } catch (ignore) {}

	          if (typeof storedLevel === undefinedType) {
	              try {
	                  var cookie = window.document.cookie;
	                  var location = cookie.indexOf(
	                      encodeURIComponent(storageKey) + "=");
	                  if (location) {
	                      storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
	                  }
	              } catch (ignore) {}
	          }

	          // If the stored level is not valid, treat it as if nothing was stored.
	          if (self.levels[storedLevel] === undefined) {
	              storedLevel = undefined;
	          }

	          return storedLevel;
	      }

	      /*
	       *
	       * Public API
	       *
	       */

	      self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
	          "ERROR": 4, "SILENT": 5};

	      self.methodFactory = factory || defaultMethodFactory;

	      self.getLevel = function () {
	          return currentLevel;
	      };

	      self.setLevel = function (level, persist) {
	          if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
	              level = self.levels[level.toUpperCase()];
	          }
	          if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
	              currentLevel = level;
	              if (persist !== false) {  // defaults to true
	                  persistLevelIfPossible(level);
	              }
	              replaceLoggingMethods.call(self, level, name);
	              if (typeof console === undefinedType && level < self.levels.SILENT) {
	                  return "No console available for logging";
	              }
	          } else {
	              throw "log.setLevel() called with invalid level: " + level;
	          }
	      };

	      self.setDefaultLevel = function (level) {
	          if (!getPersistedLevel()) {
	              self.setLevel(level, false);
	          }
	      };

	      self.enableAll = function(persist) {
	          self.setLevel(self.levels.TRACE, persist);
	      };

	      self.disableAll = function(persist) {
	          self.setLevel(self.levels.SILENT, persist);
	      };

	      // Initialize with the right level
	      var initialLevel = getPersistedLevel();
	      if (initialLevel == null) {
	          initialLevel = defaultLevel == null ? "WARN" : defaultLevel;
	      }
	      self.setLevel(initialLevel, false);
	    }

	    /*
	     *
	     * Package-level API
	     *
	     */

	    var defaultLogger = new Logger();

	    var _loggersByName = {};
	    defaultLogger.getLogger = function getLogger(name) {
	        if (typeof name !== "string" || name === "") {
	          throw new TypeError("You must supply a name when creating a logger.");
	        }

	        var logger = _loggersByName[name];
	        if (!logger) {
	          logger = _loggersByName[name] = new Logger(
	            name, defaultLogger.getLevel(), defaultLogger.methodFactory);
	        }
	        return logger;
	    };

	    // Grab the current global log variable in case of overwrite
	    var _log = (typeof window !== undefinedType) ? window.log : undefined;
	    defaultLogger.noConflict = function() {
	        if (typeof window !== undefinedType &&
	               window.log === defaultLogger) {
	            window.log = _log;
	        }

	        return defaultLogger;
	    };

	    return defaultLogger;
	}));


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _eventEmitter = __webpack_require__(7);

	var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

	var _utils = __webpack_require__(33);

	var _utils2 = _interopRequireDefault(_utils);

	var _networking = __webpack_require__(22);

	var _networking2 = _interopRequireDefault(_networking);

	var _logger = __webpack_require__(39);

	var _logger2 = _interopRequireDefault(_logger);

	var _time = __webpack_require__(42);

	var _time2 = _interopRequireDefault(_time);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var logger = _logger2.default.getLogger('component/Connectivity');

	var _class = function () {
	  function _class(_ref) {
	    var eventEmitter = _ref.eventEmitter;
	    var networking = _ref.networking;
	    var timeEndpoint = _ref.timeEndpoint;

	    _classCallCheck(this, _class);

	    this._eventEmitter = eventEmitter;
	    this._networking = networking;
	    this._timeEndpoint = timeEndpoint;

	    /* listen to failed HttpEvents */
	    this._eventEmitter.on('unreachableHTTP', this.__onUnreachableHTTP);
	  }

	  // Detect Age of Message


	  _createClass(_class, [{
	    key: 'detect_latency',
	    value: function detect_latency(tt) {
	      var adjusted_time = _utils2.default.rnow() - this._timeDrift;
	      return adjusted_time - tt / 10000;
	    }
	  }, {
	    key: 'start',
	    value: function start() {
	      this.__detect_time_delta(function () {}, null);
	    }
	  }, {
	    key: 'stop',
	    value: function stop() {}
	  }, {
	    key: '__onUnreachableHTTP',
	    value: function __onUnreachableHTTP() {
	      console.log('HTTP FAILED');
	    }
	  }, {
	    key: '__poll_online',
	    value: function __poll_online() {
	      _is_online() || _reset_offline(1, { error: 'Offline. Please check your network settings.' });
	      _poll_timer && clearTimeout(_poll_timer);
	      _poll_timer = _utils2.default.timeout(_poll_online, constants.SECOND);
	    }
	  }, {
	    key: '__poll_online2',
	    value: function __poll_online2() {
	      SELF['time'](function (success) {
	        detect_time_detla(function () {}, success);
	        success || _reset_offline(1, {
	          error: 'Heartbeat failed to connect to Pubnub Servers.' + 'Please check your network settings.'
	        });
	        _poll_timer2 && clearTimeout(_poll_timer2);
	        _poll_timer2 = _utils2.default.timeout(_poll_online2, KEEPALIVE);
	      });
	    }
	  }, {
	    key: '__detect_time_delta',
	    value: function __detect_time_delta(cb, time) {
	      var _this = this;

	      var stime = _utils2.default.rnow();

	      var calculate = function calculate(time) {
	        if (!time) return;
	        var ptime = time / 10000;
	        var latency = (_utils2.default.rnow() - stime) / 2;
	        _this._timeDrift = _utils2.default.rnow() - (ptime + latency);
	        if (cb) cb(_this._timeDrift);
	      };

	      if (time) {
	        calculate(time);
	      } else {
	        this._timeEndpoint.fetchTime(calculate);
	      }
	    }
	  }]);

	  return _class;
	}();

	/*
	// Test Network Connection
	function _test_connection(success) {
	  if (success) {
	    // Begin Next Socket Connection
	    utils.timeout(CONNECT, windowing);
	  } else {
	    // New Origin on Failed Connection
	    networking.shiftStandardOrigin(true);
	    networking.shiftSubscribeOrigin(true);

	    // Re-test Connection
	    utils.timeout(function () {
	      SELF['time'](_test_connection);
	    }, constants.SECOND);
	  }

	  // Disconnect & Reconnect
	  each_channel(function (channel) {
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
	  each_channel_group(function (channel_group) {
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
	*/


	exports.default = _class;

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(22);

	var _networking2 = _interopRequireDefault(_networking);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;

	    _classCallCheck(this, _class);

	    this._networking = networking;
	  }

	  _createClass(_class, [{
	    key: 'fetch',
	    value: function fetch(callback) {
	      this._networking.fetchTime(function (err, response) {
	        if (err) return callback(err);
	        callback(null, response[0]);
	      });
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(22);

	var _networking2 = _interopRequireDefault(_networking);

	var _responders = __webpack_require__(31);

	var _responders2 = _interopRequireDefault(_responders);

	var _logger = __webpack_require__(39);

	var _logger2 = _interopRequireDefault(_logger);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// TODO:
	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;
	    var decrypt = _ref.decrypt;

	    _classCallCheck(this, _class);

	    this._networking = networking;
	    this._decrypt = decrypt;
	    this._r = new _responders2.default('#endpoints/history');
	    this._l = _logger2.default.getLogger('#endpoints/history');
	  }

	  _createClass(_class, [{
	    key: 'fetch',
	    value: function fetch(args, callback) {
	      var _this = this;

	      var channel = args.channel;
	      var channelGroup = args.channelGroup;
	      var cipherKey = args.cipherKey;
	      var start = args.start;
	      var end = args.end;
	      var includeToken = args.includeToken;


	      var count = args.count || args.limit || 100;
	      var reverse = args.reverse || 'false';
	      var stringMessageToken = args.stringMessageToken || false;

	      if (!channel && !channelGroup) {
	        return callback(this._r.validationError('Missing channel and/or channel group'));
	      }

	      if (!callback) {
	        return this._l.error('Missing Callback');
	      }

	      var params = { count: count, reverse: reverse, stringtoken: 'true' };

	      if (channelGroup) {
	        params['channel-group'] = channelGroup;
	        if (!channel) {
	          channel = ',';
	        }
	      }

	      if (start) params.start = start;
	      if (end) params.end = end;
	      if (includeToken) params.include_token = 'true';
	      if (stringMessageToken) params.string_message_token = 'true';

	      // Send Message
	      this._networking.fetchHistory(channel, params, function (err, resp) {
	        if (err) return callback(err, null);
	        callback(null, _this._parseResponse(resp, includeToken, cipherKey));
	      });
	    }
	  }, {
	    key: '_parseResponse',
	    value: function _parseResponse(response, includeToken, cipherKey) {
	      var _this2 = this;

	      var messages = response[0];
	      var decryptedMessages = [];
	      messages.forEach(function (payload) {
	        if (includeToken) {
	          var decryptedMessage = _this2._decrypt(payload.message, cipherKey);
	          var timetoken = payload.timetoken;

	          try {
	            decryptedMessages.push({ timetoken: timetoken, message: JSON.parse(decryptedMessage) });
	          } catch (e) {
	            decryptedMessages.push({ timetoken: timetoken, message: decryptedMessage });
	          }
	        } else {
	          var _decryptedMessage = _this2._decrypt(payload, cipherKey);
	          try {
	            decryptedMessages.push(JSON.parse(_decryptedMessage));
	          } catch (e) {
	            decryptedMessages.push(_decryptedMessage);
	          }
	        }
	      });
	      return [decryptedMessages, response[1], response[2]];
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(22);

	var _networking2 = _interopRequireDefault(_networking);

	var _keychain = __webpack_require__(30);

	var _keychain2 = _interopRequireDefault(_keychain);

	var _responders = __webpack_require__(31);

	var _responders2 = _interopRequireDefault(_responders);

	var _Q = __webpack_require__(45);

	var _Q2 = _interopRequireDefault(_Q);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var checkParam = function checkParam(_checkParam, message) {
	  var q = _Q2.default.defer();

	  if (_checkParam) {
	    q.resolve();
	  } else {
	    q.reject(message);
	  }

	  return q.promise;
	};

	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;

	    _classCallCheck(this, _class);

	    this._networking = networking;
	    this._r = new _responders2.default('endpoints/push');
	  }

	  _createClass(_class, [{
	    key: 'addDevice',
	    value: function addDevice(_ref2) {
	      var pushGateway = _ref2.pushGateway;
	      var device = _ref2.device;
	      var channel = _ref2.channel;

	      var payload = { operation: 'add', pushGateway: pushGateway, device: device, channel: channel };
	      return this.__provisionDevice(payload);
	    }
	  }, {
	    key: 'removeDevice',
	    value: function removeDevice(_ref3) {
	      var pushGateway = _ref3.pushGateway;
	      var device = _ref3.device;
	      var channel = _ref3.channel;

	      var payload = { operation: 'remove', pushGateway: pushGateway, device: device, channel: channel };
	      return this.__provisionDevice(payload);
	    }
	  }, {
	    key: '__provisionDevice',
	    value: function __provisionDevice(_ref4) {
	      var _this = this;

	      var operation = _ref4.operation;
	      var pushGateway = _ref4.pushGateway;
	      var device = _ref4.device;
	      var channel = _ref4.channel;

	      var q = _Q2.default.defer();

	      checkParam(device, 'Missing Device ID (device)').then(checkParam(pushGateway, 'Missing GW Type (pushGateway: gcm or apns)')).then(checkParam(operation, 'Missing GW Operation (operation: add or remove)')).then(checkParam(channel, 'Missing gw destination Channel (channel)')).then(checkParam(this._networking.validateSubscribeKey(), 'Missing Subscribe Key')).then(checkParam(this._networking.validatePublishKey(), 'Missing Publish Key')).fail(function (error) {
	        q.reject(_this._r.validationError(error));
	      });

	      return q.promise;

	      /*
	      let data: Object = {
	        type: pushGateway
	      };
	       switch (operation) {
	        case 'add': data.add = channel; break;
	        case 'remove': data.remove = channel; break;
	        default:
	      }
	       this._networking.provisionDeviceForPush(device, data)
	        .then((response) => q.resolve(this._r.callback(response)))
	        .fail((response) => q.fail(this._r.error(response)));
	      });
	      */
	    }
	  }, {
	    key: 'createNotification',
	    value: function createNotification() {
	      // return callback;
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, setImmediate) {// vim:ts=4:sts=4:sw=4:
	/*!
	 *
	 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
	 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
	 *
	 * With parts by Tyler Close
	 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
	 * at http://www.opensource.org/licenses/mit-license.html
	 * Forked at ref_send.js version: 2009-05-11
	 *
	 * With parts by Mark Miller
	 * Copyright (C) 2011 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 *
	 */

	(function (definition) {
	    "use strict";

	    // This file will function properly as a <script> tag, or a module
	    // using CommonJS and NodeJS or RequireJS module formats.  In
	    // Common/Node/RequireJS, the module exports the Q API and when
	    // executed as a simple <script>, it creates a Q global instead.

	    // Montage Require
	    if (typeof bootstrap === "function") {
	        bootstrap("promise", definition);

	    // CommonJS
	    } else if (true) {
	        module.exports = definition();

	    // RequireJS
	    } else if (typeof define === "function" && define.amd) {
	        define(definition);

	    // SES (Secure EcmaScript)
	    } else if (typeof ses !== "undefined") {
	        if (!ses.ok()) {
	            return;
	        } else {
	            ses.makeQ = definition;
	        }

	    // <script>
	    } else if (typeof window !== "undefined" || typeof self !== "undefined") {
	        // Prefer window over self for add-on scripts. Use self for
	        // non-windowed contexts.
	        var global = typeof window !== "undefined" ? window : self;

	        // Get the `window` object, save the previous Q global
	        // and initialize Q as a global.
	        var previousQ = global.Q;
	        global.Q = definition();

	        // Add a noConflict function so Q can be removed from the
	        // global namespace.
	        global.Q.noConflict = function () {
	            global.Q = previousQ;
	            return this;
	        };

	    } else {
	        throw new Error("This environment was not anticipated by Q. Please file a bug.");
	    }

	})(function () {
	"use strict";

	var hasStacks = false;
	try {
	    throw new Error();
	} catch (e) {
	    hasStacks = !!e.stack;
	}

	// All code after this point will be filtered from stack traces reported
	// by Q.
	var qStartingLine = captureLine();
	var qFileName;

	// shims

	// used for fallback in "allResolved"
	var noop = function () {};

	// Use the fastest possible means to execute a task in a future turn
	// of the event loop.
	var nextTick =(function () {
	    // linked list of tasks (single, with head node)
	    var head = {task: void 0, next: null};
	    var tail = head;
	    var flushing = false;
	    var requestTick = void 0;
	    var isNodeJS = false;
	    // queue for late tasks, used by unhandled rejection tracking
	    var laterQueue = [];

	    function flush() {
	        /* jshint loopfunc: true */
	        var task, domain;

	        while (head.next) {
	            head = head.next;
	            task = head.task;
	            head.task = void 0;
	            domain = head.domain;

	            if (domain) {
	                head.domain = void 0;
	                domain.enter();
	            }
	            runSingle(task, domain);

	        }
	        while (laterQueue.length) {
	            task = laterQueue.pop();
	            runSingle(task);
	        }
	        flushing = false;
	    }
	    // runs a single function in the async queue
	    function runSingle(task, domain) {
	        try {
	            task();

	        } catch (e) {
	            if (isNodeJS) {
	                // In node, uncaught exceptions are considered fatal errors.
	                // Re-throw them synchronously to interrupt flushing!

	                // Ensure continuation if the uncaught exception is suppressed
	                // listening "uncaughtException" events (as domains does).
	                // Continue in next event to avoid tick recursion.
	                if (domain) {
	                    domain.exit();
	                }
	                setTimeout(flush, 0);
	                if (domain) {
	                    domain.enter();
	                }

	                throw e;

	            } else {
	                // In browsers, uncaught exceptions are not fatal.
	                // Re-throw them asynchronously to avoid slow-downs.
	                setTimeout(function () {
	                    throw e;
	                }, 0);
	            }
	        }

	        if (domain) {
	            domain.exit();
	        }
	    }

	    nextTick = function (task) {
	        tail = tail.next = {
	            task: task,
	            domain: isNodeJS && process.domain,
	            next: null
	        };

	        if (!flushing) {
	            flushing = true;
	            requestTick();
	        }
	    };

	    if (typeof process === "object" &&
	        process.toString() === "[object process]" && process.nextTick) {
	        // Ensure Q is in a real Node environment, with a `process.nextTick`.
	        // To see through fake Node environments:
	        // * Mocha test runner - exposes a `process` global without a `nextTick`
	        // * Browserify - exposes a `process.nexTick` function that uses
	        //   `setTimeout`. In this case `setImmediate` is preferred because
	        //    it is faster. Browserify's `process.toString()` yields
	        //   "[object Object]", while in a real Node environment
	        //   `process.nextTick()` yields "[object process]".
	        isNodeJS = true;

	        requestTick = function () {
	            process.nextTick(flush);
	        };

	    } else if (typeof setImmediate === "function") {
	        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
	        if (typeof window !== "undefined") {
	            requestTick = setImmediate.bind(window, flush);
	        } else {
	            requestTick = function () {
	                setImmediate(flush);
	            };
	        }

	    } else if (typeof MessageChannel !== "undefined") {
	        // modern browsers
	        // http://www.nonblocking.io/2011/06/windownexttick.html
	        var channel = new MessageChannel();
	        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
	        // working message ports the first time a page loads.
	        channel.port1.onmessage = function () {
	            requestTick = requestPortTick;
	            channel.port1.onmessage = flush;
	            flush();
	        };
	        var requestPortTick = function () {
	            // Opera requires us to provide a message payload, regardless of
	            // whether we use it.
	            channel.port2.postMessage(0);
	        };
	        requestTick = function () {
	            setTimeout(flush, 0);
	            requestPortTick();
	        };

	    } else {
	        // old browsers
	        requestTick = function () {
	            setTimeout(flush, 0);
	        };
	    }
	    // runs a task after all other tasks have been run
	    // this is useful for unhandled rejection tracking that needs to happen
	    // after all `then`d tasks have been run.
	    nextTick.runAfter = function (task) {
	        laterQueue.push(task);
	        if (!flushing) {
	            flushing = true;
	            requestTick();
	        }
	    };
	    return nextTick;
	})();

	// Attempt to make generics safe in the face of downstream
	// modifications.
	// There is no situation where this is necessary.
	// If you need a security guarantee, these primordials need to be
	// deeply frozen anyway, and if you don’t need a security guarantee,
	// this is just plain paranoid.
	// However, this **might** have the nice side-effect of reducing the size of
	// the minified code by reducing x.call() to merely x()
	// See Mark Miller’s explanation of what this does.
	// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
	var call = Function.call;
	function uncurryThis(f) {
	    return function () {
	        return call.apply(f, arguments);
	    };
	}
	// This is equivalent, but slower:
	// uncurryThis = Function_bind.bind(Function_bind.call);
	// http://jsperf.com/uncurrythis

	var array_slice = uncurryThis(Array.prototype.slice);

	var array_reduce = uncurryThis(
	    Array.prototype.reduce || function (callback, basis) {
	        var index = 0,
	            length = this.length;
	        // concerning the initial value, if one is not provided
	        if (arguments.length === 1) {
	            // seek to the first value in the array, accounting
	            // for the possibility that is is a sparse array
	            do {
	                if (index in this) {
	                    basis = this[index++];
	                    break;
	                }
	                if (++index >= length) {
	                    throw new TypeError();
	                }
	            } while (1);
	        }
	        // reduce
	        for (; index < length; index++) {
	            // account for the possibility that the array is sparse
	            if (index in this) {
	                basis = callback(basis, this[index], index);
	            }
	        }
	        return basis;
	    }
	);

	var array_indexOf = uncurryThis(
	    Array.prototype.indexOf || function (value) {
	        // not a very good shim, but good enough for our one use of it
	        for (var i = 0; i < this.length; i++) {
	            if (this[i] === value) {
	                return i;
	            }
	        }
	        return -1;
	    }
	);

	var array_map = uncurryThis(
	    Array.prototype.map || function (callback, thisp) {
	        var self = this;
	        var collect = [];
	        array_reduce(self, function (undefined, value, index) {
	            collect.push(callback.call(thisp, value, index, self));
	        }, void 0);
	        return collect;
	    }
	);

	var object_create = Object.create || function (prototype) {
	    function Type() { }
	    Type.prototype = prototype;
	    return new Type();
	};

	var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

	var object_keys = Object.keys || function (object) {
	    var keys = [];
	    for (var key in object) {
	        if (object_hasOwnProperty(object, key)) {
	            keys.push(key);
	        }
	    }
	    return keys;
	};

	var object_toString = uncurryThis(Object.prototype.toString);

	function isObject(value) {
	    return value === Object(value);
	}

	// generator related shims

	// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
	function isStopIteration(exception) {
	    return (
	        object_toString(exception) === "[object StopIteration]" ||
	        exception instanceof QReturnValue
	    );
	}

	// FIXME: Remove this helper and Q.return once ES6 generators are in
	// SpiderMonkey.
	var QReturnValue;
	if (typeof ReturnValue !== "undefined") {
	    QReturnValue = ReturnValue;
	} else {
	    QReturnValue = function (value) {
	        this.value = value;
	    };
	}

	// long stack traces

	var STACK_JUMP_SEPARATOR = "From previous event:";

	function makeStackTraceLong(error, promise) {
	    // If possible, transform the error stack trace by removing Node and Q
	    // cruft, then concatenating with the stack trace of `promise`. See #57.
	    if (hasStacks &&
	        promise.stack &&
	        typeof error === "object" &&
	        error !== null &&
	        error.stack &&
	        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
	    ) {
	        var stacks = [];
	        for (var p = promise; !!p; p = p.source) {
	            if (p.stack) {
	                stacks.unshift(p.stack);
	            }
	        }
	        stacks.unshift(error.stack);

	        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
	        error.stack = filterStackString(concatedStacks);
	    }
	}

	function filterStackString(stackString) {
	    var lines = stackString.split("\n");
	    var desiredLines = [];
	    for (var i = 0; i < lines.length; ++i) {
	        var line = lines[i];

	        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
	            desiredLines.push(line);
	        }
	    }
	    return desiredLines.join("\n");
	}

	function isNodeFrame(stackLine) {
	    return stackLine.indexOf("(module.js:") !== -1 ||
	           stackLine.indexOf("(node.js:") !== -1;
	}

	function getFileNameAndLineNumber(stackLine) {
	    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
	    // In IE10 function name can have spaces ("Anonymous function") O_o
	    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
	    if (attempt1) {
	        return [attempt1[1], Number(attempt1[2])];
	    }

	    // Anonymous functions: "at filename:lineNumber:columnNumber"
	    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
	    if (attempt2) {
	        return [attempt2[1], Number(attempt2[2])];
	    }

	    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
	    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
	    if (attempt3) {
	        return [attempt3[1], Number(attempt3[2])];
	    }
	}

	function isInternalFrame(stackLine) {
	    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

	    if (!fileNameAndLineNumber) {
	        return false;
	    }

	    var fileName = fileNameAndLineNumber[0];
	    var lineNumber = fileNameAndLineNumber[1];

	    return fileName === qFileName &&
	        lineNumber >= qStartingLine &&
	        lineNumber <= qEndingLine;
	}

	// discover own file name and line number range for filtering stack
	// traces
	function captureLine() {
	    if (!hasStacks) {
	        return;
	    }

	    try {
	        throw new Error();
	    } catch (e) {
	        var lines = e.stack.split("\n");
	        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
	        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
	        if (!fileNameAndLineNumber) {
	            return;
	        }

	        qFileName = fileNameAndLineNumber[0];
	        return fileNameAndLineNumber[1];
	    }
	}

	function deprecate(callback, name, alternative) {
	    return function () {
	        if (typeof console !== "undefined" &&
	            typeof console.warn === "function") {
	            console.warn(name + " is deprecated, use " + alternative +
	                         " instead.", new Error("").stack);
	        }
	        return callback.apply(callback, arguments);
	    };
	}

	// end of shims
	// beginning of real work

	/**
	 * Constructs a promise for an immediate reference, passes promises through, or
	 * coerces promises from different systems.
	 * @param value immediate reference or promise
	 */
	function Q(value) {
	    // If the object is already a Promise, return it directly.  This enables
	    // the resolve function to both be used to created references from objects,
	    // but to tolerably coerce non-promises to promises.
	    if (value instanceof Promise) {
	        return value;
	    }

	    // assimilate thenables
	    if (isPromiseAlike(value)) {
	        return coerce(value);
	    } else {
	        return fulfill(value);
	    }
	}
	Q.resolve = Q;

	/**
	 * Performs a task in a future turn of the event loop.
	 * @param {Function} task
	 */
	Q.nextTick = nextTick;

	/**
	 * Controls whether or not long stack traces will be on
	 */
	Q.longStackSupport = false;

	// enable long stacks if Q_DEBUG is set
	if (typeof process === "object" && process && process.env && process.env.Q_DEBUG) {
	    Q.longStackSupport = true;
	}

	/**
	 * Constructs a {promise, resolve, reject} object.
	 *
	 * `resolve` is a callback to invoke with a more resolved value for the
	 * promise. To fulfill the promise, invoke `resolve` with any value that is
	 * not a thenable. To reject the promise, invoke `resolve` with a rejected
	 * thenable, or invoke `reject` with the reason directly. To resolve the
	 * promise to another thenable, thus putting it in the same state, invoke
	 * `resolve` with that other thenable.
	 */
	Q.defer = defer;
	function defer() {
	    // if "messages" is an "Array", that indicates that the promise has not yet
	    // been resolved.  If it is "undefined", it has been resolved.  Each
	    // element of the messages array is itself an array of complete arguments to
	    // forward to the resolved promise.  We coerce the resolution value to a
	    // promise using the `resolve` function because it handles both fully
	    // non-thenable values and other thenables gracefully.
	    var messages = [], progressListeners = [], resolvedPromise;

	    var deferred = object_create(defer.prototype);
	    var promise = object_create(Promise.prototype);

	    promise.promiseDispatch = function (resolve, op, operands) {
	        var args = array_slice(arguments);
	        if (messages) {
	            messages.push(args);
	            if (op === "when" && operands[1]) { // progress operand
	                progressListeners.push(operands[1]);
	            }
	        } else {
	            Q.nextTick(function () {
	                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
	            });
	        }
	    };

	    // XXX deprecated
	    promise.valueOf = function () {
	        if (messages) {
	            return promise;
	        }
	        var nearerValue = nearer(resolvedPromise);
	        if (isPromise(nearerValue)) {
	            resolvedPromise = nearerValue; // shorten chain
	        }
	        return nearerValue;
	    };

	    promise.inspect = function () {
	        if (!resolvedPromise) {
	            return { state: "pending" };
	        }
	        return resolvedPromise.inspect();
	    };

	    if (Q.longStackSupport && hasStacks) {
	        try {
	            throw new Error();
	        } catch (e) {
	            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
	            // accessor around; that causes memory leaks as per GH-111. Just
	            // reify the stack trace as a string ASAP.
	            //
	            // At the same time, cut off the first line; it's always just
	            // "[object Promise]\n", as per the `toString`.
	            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
	        }
	    }

	    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
	    // consolidating them into `become`, since otherwise we'd create new
	    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

	    function become(newPromise) {
	        resolvedPromise = newPromise;
	        promise.source = newPromise;

	        array_reduce(messages, function (undefined, message) {
	            Q.nextTick(function () {
	                newPromise.promiseDispatch.apply(newPromise, message);
	            });
	        }, void 0);

	        messages = void 0;
	        progressListeners = void 0;
	    }

	    deferred.promise = promise;
	    deferred.resolve = function (value) {
	        if (resolvedPromise) {
	            return;
	        }

	        become(Q(value));
	    };

	    deferred.fulfill = function (value) {
	        if (resolvedPromise) {
	            return;
	        }

	        become(fulfill(value));
	    };
	    deferred.reject = function (reason) {
	        if (resolvedPromise) {
	            return;
	        }

	        become(reject(reason));
	    };
	    deferred.notify = function (progress) {
	        if (resolvedPromise) {
	            return;
	        }

	        array_reduce(progressListeners, function (undefined, progressListener) {
	            Q.nextTick(function () {
	                progressListener(progress);
	            });
	        }, void 0);
	    };

	    return deferred;
	}

	/**
	 * Creates a Node-style callback that will resolve or reject the deferred
	 * promise.
	 * @returns a nodeback
	 */
	defer.prototype.makeNodeResolver = function () {
	    var self = this;
	    return function (error, value) {
	        if (error) {
	            self.reject(error);
	        } else if (arguments.length > 2) {
	            self.resolve(array_slice(arguments, 1));
	        } else {
	            self.resolve(value);
	        }
	    };
	};

	/**
	 * @param resolver {Function} a function that returns nothing and accepts
	 * the resolve, reject, and notify functions for a deferred.
	 * @returns a promise that may be resolved with the given resolve and reject
	 * functions, or rejected by a thrown exception in resolver
	 */
	Q.Promise = promise; // ES6
	Q.promise = promise;
	function promise(resolver) {
	    if (typeof resolver !== "function") {
	        throw new TypeError("resolver must be a function.");
	    }
	    var deferred = defer();
	    try {
	        resolver(deferred.resolve, deferred.reject, deferred.notify);
	    } catch (reason) {
	        deferred.reject(reason);
	    }
	    return deferred.promise;
	}

	promise.race = race; // ES6
	promise.all = all; // ES6
	promise.reject = reject; // ES6
	promise.resolve = Q; // ES6

	// XXX experimental.  This method is a way to denote that a local value is
	// serializable and should be immediately dispatched to a remote upon request,
	// instead of passing a reference.
	Q.passByCopy = function (object) {
	    //freeze(object);
	    //passByCopies.set(object, true);
	    return object;
	};

	Promise.prototype.passByCopy = function () {
	    //freeze(object);
	    //passByCopies.set(object, true);
	    return this;
	};

	/**
	 * If two promises eventually fulfill to the same value, promises that value,
	 * but otherwise rejects.
	 * @param x {Any*}
	 * @param y {Any*}
	 * @returns {Any*} a promise for x and y if they are the same, but a rejection
	 * otherwise.
	 *
	 */
	Q.join = function (x, y) {
	    return Q(x).join(y);
	};

	Promise.prototype.join = function (that) {
	    return Q([this, that]).spread(function (x, y) {
	        if (x === y) {
	            // TODO: "===" should be Object.is or equiv
	            return x;
	        } else {
	            throw new Error("Can't join: not the same: " + x + " " + y);
	        }
	    });
	};

	/**
	 * Returns a promise for the first of an array of promises to become settled.
	 * @param answers {Array[Any*]} promises to race
	 * @returns {Any*} the first promise to be settled
	 */
	Q.race = race;
	function race(answerPs) {
	    return promise(function (resolve, reject) {
	        // Switch to this once we can assume at least ES5
	        // answerPs.forEach(function (answerP) {
	        //     Q(answerP).then(resolve, reject);
	        // });
	        // Use this in the meantime
	        for (var i = 0, len = answerPs.length; i < len; i++) {
	            Q(answerPs[i]).then(resolve, reject);
	        }
	    });
	}

	Promise.prototype.race = function () {
	    return this.then(Q.race);
	};

	/**
	 * Constructs a Promise with a promise descriptor object and optional fallback
	 * function.  The descriptor contains methods like when(rejected), get(name),
	 * set(name, value), post(name, args), and delete(name), which all
	 * return either a value, a promise for a value, or a rejection.  The fallback
	 * accepts the operation name, a resolver, and any further arguments that would
	 * have been forwarded to the appropriate method above had a method been
	 * provided with the proper name.  The API makes no guarantees about the nature
	 * of the returned object, apart from that it is usable whereever promises are
	 * bought and sold.
	 */
	Q.makePromise = Promise;
	function Promise(descriptor, fallback, inspect) {
	    if (fallback === void 0) {
	        fallback = function (op) {
	            return reject(new Error(
	                "Promise does not support operation: " + op
	            ));
	        };
	    }
	    if (inspect === void 0) {
	        inspect = function () {
	            return {state: "unknown"};
	        };
	    }

	    var promise = object_create(Promise.prototype);

	    promise.promiseDispatch = function (resolve, op, args) {
	        var result;
	        try {
	            if (descriptor[op]) {
	                result = descriptor[op].apply(promise, args);
	            } else {
	                result = fallback.call(promise, op, args);
	            }
	        } catch (exception) {
	            result = reject(exception);
	        }
	        if (resolve) {
	            resolve(result);
	        }
	    };

	    promise.inspect = inspect;

	    // XXX deprecated `valueOf` and `exception` support
	    if (inspect) {
	        var inspected = inspect();
	        if (inspected.state === "rejected") {
	            promise.exception = inspected.reason;
	        }

	        promise.valueOf = function () {
	            var inspected = inspect();
	            if (inspected.state === "pending" ||
	                inspected.state === "rejected") {
	                return promise;
	            }
	            return inspected.value;
	        };
	    }

	    return promise;
	}

	Promise.prototype.toString = function () {
	    return "[object Promise]";
	};

	Promise.prototype.then = function (fulfilled, rejected, progressed) {
	    var self = this;
	    var deferred = defer();
	    var done = false;   // ensure the untrusted promise makes at most a
	                        // single call to one of the callbacks

	    function _fulfilled(value) {
	        try {
	            return typeof fulfilled === "function" ? fulfilled(value) : value;
	        } catch (exception) {
	            return reject(exception);
	        }
	    }

	    function _rejected(exception) {
	        if (typeof rejected === "function") {
	            makeStackTraceLong(exception, self);
	            try {
	                return rejected(exception);
	            } catch (newException) {
	                return reject(newException);
	            }
	        }
	        return reject(exception);
	    }

	    function _progressed(value) {
	        return typeof progressed === "function" ? progressed(value) : value;
	    }

	    Q.nextTick(function () {
	        self.promiseDispatch(function (value) {
	            if (done) {
	                return;
	            }
	            done = true;

	            deferred.resolve(_fulfilled(value));
	        }, "when", [function (exception) {
	            if (done) {
	                return;
	            }
	            done = true;

	            deferred.resolve(_rejected(exception));
	        }]);
	    });

	    // Progress propagator need to be attached in the current tick.
	    self.promiseDispatch(void 0, "when", [void 0, function (value) {
	        var newValue;
	        var threw = false;
	        try {
	            newValue = _progressed(value);
	        } catch (e) {
	            threw = true;
	            if (Q.onerror) {
	                Q.onerror(e);
	            } else {
	                throw e;
	            }
	        }

	        if (!threw) {
	            deferred.notify(newValue);
	        }
	    }]);

	    return deferred.promise;
	};

	Q.tap = function (promise, callback) {
	    return Q(promise).tap(callback);
	};

	/**
	 * Works almost like "finally", but not called for rejections.
	 * Original resolution value is passed through callback unaffected.
	 * Callback may return a promise that will be awaited for.
	 * @param {Function} callback
	 * @returns {Q.Promise}
	 * @example
	 * doSomething()
	 *   .then(...)
	 *   .tap(console.log)
	 *   .then(...);
	 */
	Promise.prototype.tap = function (callback) {
	    callback = Q(callback);

	    return this.then(function (value) {
	        return callback.fcall(value).thenResolve(value);
	    });
	};

	/**
	 * Registers an observer on a promise.
	 *
	 * Guarantees:
	 *
	 * 1. that fulfilled and rejected will be called only once.
	 * 2. that either the fulfilled callback or the rejected callback will be
	 *    called, but not both.
	 * 3. that fulfilled and rejected will not be called in this turn.
	 *
	 * @param value      promise or immediate reference to observe
	 * @param fulfilled  function to be called with the fulfilled value
	 * @param rejected   function to be called with the rejection exception
	 * @param progressed function to be called on any progress notifications
	 * @return promise for the return value from the invoked callback
	 */
	Q.when = when;
	function when(value, fulfilled, rejected, progressed) {
	    return Q(value).then(fulfilled, rejected, progressed);
	}

	Promise.prototype.thenResolve = function (value) {
	    return this.then(function () { return value; });
	};

	Q.thenResolve = function (promise, value) {
	    return Q(promise).thenResolve(value);
	};

	Promise.prototype.thenReject = function (reason) {
	    return this.then(function () { throw reason; });
	};

	Q.thenReject = function (promise, reason) {
	    return Q(promise).thenReject(reason);
	};

	/**
	 * If an object is not a promise, it is as "near" as possible.
	 * If a promise is rejected, it is as "near" as possible too.
	 * If it’s a fulfilled promise, the fulfillment value is nearer.
	 * If it’s a deferred promise and the deferred has been resolved, the
	 * resolution is "nearer".
	 * @param object
	 * @returns most resolved (nearest) form of the object
	 */

	// XXX should we re-do this?
	Q.nearer = nearer;
	function nearer(value) {
	    if (isPromise(value)) {
	        var inspected = value.inspect();
	        if (inspected.state === "fulfilled") {
	            return inspected.value;
	        }
	    }
	    return value;
	}

	/**
	 * @returns whether the given object is a promise.
	 * Otherwise it is a fulfilled value.
	 */
	Q.isPromise = isPromise;
	function isPromise(object) {
	    return object instanceof Promise;
	}

	Q.isPromiseAlike = isPromiseAlike;
	function isPromiseAlike(object) {
	    return isObject(object) && typeof object.then === "function";
	}

	/**
	 * @returns whether the given object is a pending promise, meaning not
	 * fulfilled or rejected.
	 */
	Q.isPending = isPending;
	function isPending(object) {
	    return isPromise(object) && object.inspect().state === "pending";
	}

	Promise.prototype.isPending = function () {
	    return this.inspect().state === "pending";
	};

	/**
	 * @returns whether the given object is a value or fulfilled
	 * promise.
	 */
	Q.isFulfilled = isFulfilled;
	function isFulfilled(object) {
	    return !isPromise(object) || object.inspect().state === "fulfilled";
	}

	Promise.prototype.isFulfilled = function () {
	    return this.inspect().state === "fulfilled";
	};

	/**
	 * @returns whether the given object is a rejected promise.
	 */
	Q.isRejected = isRejected;
	function isRejected(object) {
	    return isPromise(object) && object.inspect().state === "rejected";
	}

	Promise.prototype.isRejected = function () {
	    return this.inspect().state === "rejected";
	};

	//// BEGIN UNHANDLED REJECTION TRACKING

	// This promise library consumes exceptions thrown in handlers so they can be
	// handled by a subsequent promise.  The exceptions get added to this array when
	// they are created, and removed when they are handled.  Note that in ES6 or
	// shimmed environments, this would naturally be a `Set`.
	var unhandledReasons = [];
	var unhandledRejections = [];
	var reportedUnhandledRejections = [];
	var trackUnhandledRejections = true;

	function resetUnhandledRejections() {
	    unhandledReasons.length = 0;
	    unhandledRejections.length = 0;

	    if (!trackUnhandledRejections) {
	        trackUnhandledRejections = true;
	    }
	}

	function trackRejection(promise, reason) {
	    if (!trackUnhandledRejections) {
	        return;
	    }
	    if (typeof process === "object" && typeof process.emit === "function") {
	        Q.nextTick.runAfter(function () {
	            if (array_indexOf(unhandledRejections, promise) !== -1) {
	                process.emit("unhandledRejection", reason, promise);
	                reportedUnhandledRejections.push(promise);
	            }
	        });
	    }

	    unhandledRejections.push(promise);
	    if (reason && typeof reason.stack !== "undefined") {
	        unhandledReasons.push(reason.stack);
	    } else {
	        unhandledReasons.push("(no stack) " + reason);
	    }
	}

	function untrackRejection(promise) {
	    if (!trackUnhandledRejections) {
	        return;
	    }

	    var at = array_indexOf(unhandledRejections, promise);
	    if (at !== -1) {
	        if (typeof process === "object" && typeof process.emit === "function") {
	            Q.nextTick.runAfter(function () {
	                var atReport = array_indexOf(reportedUnhandledRejections, promise);
	                if (atReport !== -1) {
	                    process.emit("rejectionHandled", unhandledReasons[at], promise);
	                    reportedUnhandledRejections.splice(atReport, 1);
	                }
	            });
	        }
	        unhandledRejections.splice(at, 1);
	        unhandledReasons.splice(at, 1);
	    }
	}

	Q.resetUnhandledRejections = resetUnhandledRejections;

	Q.getUnhandledReasons = function () {
	    // Make a copy so that consumers can't interfere with our internal state.
	    return unhandledReasons.slice();
	};

	Q.stopUnhandledRejectionTracking = function () {
	    resetUnhandledRejections();
	    trackUnhandledRejections = false;
	};

	resetUnhandledRejections();

	//// END UNHANDLED REJECTION TRACKING

	/**
	 * Constructs a rejected promise.
	 * @param reason value describing the failure
	 */
	Q.reject = reject;
	function reject(reason) {
	    var rejection = Promise({
	        "when": function (rejected) {
	            // note that the error has been handled
	            if (rejected) {
	                untrackRejection(this);
	            }
	            return rejected ? rejected(reason) : this;
	        }
	    }, function fallback() {
	        return this;
	    }, function inspect() {
	        return { state: "rejected", reason: reason };
	    });

	    // Note that the reason has not been handled.
	    trackRejection(rejection, reason);

	    return rejection;
	}

	/**
	 * Constructs a fulfilled promise for an immediate reference.
	 * @param value immediate reference
	 */
	Q.fulfill = fulfill;
	function fulfill(value) {
	    return Promise({
	        "when": function () {
	            return value;
	        },
	        "get": function (name) {
	            return value[name];
	        },
	        "set": function (name, rhs) {
	            value[name] = rhs;
	        },
	        "delete": function (name) {
	            delete value[name];
	        },
	        "post": function (name, args) {
	            // Mark Miller proposes that post with no name should apply a
	            // promised function.
	            if (name === null || name === void 0) {
	                return value.apply(void 0, args);
	            } else {
	                return value[name].apply(value, args);
	            }
	        },
	        "apply": function (thisp, args) {
	            return value.apply(thisp, args);
	        },
	        "keys": function () {
	            return object_keys(value);
	        }
	    }, void 0, function inspect() {
	        return { state: "fulfilled", value: value };
	    });
	}

	/**
	 * Converts thenables to Q promises.
	 * @param promise thenable promise
	 * @returns a Q promise
	 */
	function coerce(promise) {
	    var deferred = defer();
	    Q.nextTick(function () {
	        try {
	            promise.then(deferred.resolve, deferred.reject, deferred.notify);
	        } catch (exception) {
	            deferred.reject(exception);
	        }
	    });
	    return deferred.promise;
	}

	/**
	 * Annotates an object such that it will never be
	 * transferred away from this process over any promise
	 * communication channel.
	 * @param object
	 * @returns promise a wrapping of that object that
	 * additionally responds to the "isDef" message
	 * without a rejection.
	 */
	Q.master = master;
	function master(object) {
	    return Promise({
	        "isDef": function () {}
	    }, function fallback(op, args) {
	        return dispatch(object, op, args);
	    }, function () {
	        return Q(object).inspect();
	    });
	}

	/**
	 * Spreads the values of a promised array of arguments into the
	 * fulfillment callback.
	 * @param fulfilled callback that receives variadic arguments from the
	 * promised array
	 * @param rejected callback that receives the exception if the promise
	 * is rejected.
	 * @returns a promise for the return value or thrown exception of
	 * either callback.
	 */
	Q.spread = spread;
	function spread(value, fulfilled, rejected) {
	    return Q(value).spread(fulfilled, rejected);
	}

	Promise.prototype.spread = function (fulfilled, rejected) {
	    return this.all().then(function (array) {
	        return fulfilled.apply(void 0, array);
	    }, rejected);
	};

	/**
	 * The async function is a decorator for generator functions, turning
	 * them into asynchronous generators.  Although generators are only part
	 * of the newest ECMAScript 6 drafts, this code does not cause syntax
	 * errors in older engines.  This code should continue to work and will
	 * in fact improve over time as the language improves.
	 *
	 * ES6 generators are currently part of V8 version 3.19 with the
	 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
	 * for longer, but under an older Python-inspired form.  This function
	 * works on both kinds of generators.
	 *
	 * Decorates a generator function such that:
	 *  - it may yield promises
	 *  - execution will continue when that promise is fulfilled
	 *  - the value of the yield expression will be the fulfilled value
	 *  - it returns a promise for the return value (when the generator
	 *    stops iterating)
	 *  - the decorated function returns a promise for the return value
	 *    of the generator or the first rejected promise among those
	 *    yielded.
	 *  - if an error is thrown in the generator, it propagates through
	 *    every following yield until it is caught, or until it escapes
	 *    the generator function altogether, and is translated into a
	 *    rejection for the promise returned by the decorated generator.
	 */
	Q.async = async;
	function async(makeGenerator) {
	    return function () {
	        // when verb is "send", arg is a value
	        // when verb is "throw", arg is an exception
	        function continuer(verb, arg) {
	            var result;

	            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
	            // engine that has a deployed base of browsers that support generators.
	            // However, SM's generators use the Python-inspired semantics of
	            // outdated ES6 drafts.  We would like to support ES6, but we'd also
	            // like to make it possible to use generators in deployed browsers, so
	            // we also support Python-style generators.  At some point we can remove
	            // this block.

	            if (typeof StopIteration === "undefined") {
	                // ES6 Generators
	                try {
	                    result = generator[verb](arg);
	                } catch (exception) {
	                    return reject(exception);
	                }
	                if (result.done) {
	                    return Q(result.value);
	                } else {
	                    return when(result.value, callback, errback);
	                }
	            } else {
	                // SpiderMonkey Generators
	                // FIXME: Remove this case when SM does ES6 generators.
	                try {
	                    result = generator[verb](arg);
	                } catch (exception) {
	                    if (isStopIteration(exception)) {
	                        return Q(exception.value);
	                    } else {
	                        return reject(exception);
	                    }
	                }
	                return when(result, callback, errback);
	            }
	        }
	        var generator = makeGenerator.apply(this, arguments);
	        var callback = continuer.bind(continuer, "next");
	        var errback = continuer.bind(continuer, "throw");
	        return callback();
	    };
	}

	/**
	 * The spawn function is a small wrapper around async that immediately
	 * calls the generator and also ends the promise chain, so that any
	 * unhandled errors are thrown instead of forwarded to the error
	 * handler. This is useful because it's extremely common to run
	 * generators at the top-level to work with libraries.
	 */
	Q.spawn = spawn;
	function spawn(makeGenerator) {
	    Q.done(Q.async(makeGenerator)());
	}

	// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
	/**
	 * Throws a ReturnValue exception to stop an asynchronous generator.
	 *
	 * This interface is a stop-gap measure to support generator return
	 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
	 * generators like Chromium 29, just use "return" in your generator
	 * functions.
	 *
	 * @param value the return value for the surrounding generator
	 * @throws ReturnValue exception with the value.
	 * @example
	 * // ES6 style
	 * Q.async(function* () {
	 *      var foo = yield getFooPromise();
	 *      var bar = yield getBarPromise();
	 *      return foo + bar;
	 * })
	 * // Older SpiderMonkey style
	 * Q.async(function () {
	 *      var foo = yield getFooPromise();
	 *      var bar = yield getBarPromise();
	 *      Q.return(foo + bar);
	 * })
	 */
	Q["return"] = _return;
	function _return(value) {
	    throw new QReturnValue(value);
	}

	/**
	 * The promised function decorator ensures that any promise arguments
	 * are settled and passed as values (`this` is also settled and passed
	 * as a value).  It will also ensure that the result of a function is
	 * always a promise.
	 *
	 * @example
	 * var add = Q.promised(function (a, b) {
	 *     return a + b;
	 * });
	 * add(Q(a), Q(B));
	 *
	 * @param {function} callback The function to decorate
	 * @returns {function} a function that has been decorated.
	 */
	Q.promised = promised;
	function promised(callback) {
	    return function () {
	        return spread([this, all(arguments)], function (self, args) {
	            return callback.apply(self, args);
	        });
	    };
	}

	/**
	 * sends a message to a value in a future turn
	 * @param object* the recipient
	 * @param op the name of the message operation, e.g., "when",
	 * @param args further arguments to be forwarded to the operation
	 * @returns result {Promise} a promise for the result of the operation
	 */
	Q.dispatch = dispatch;
	function dispatch(object, op, args) {
	    return Q(object).dispatch(op, args);
	}

	Promise.prototype.dispatch = function (op, args) {
	    var self = this;
	    var deferred = defer();
	    Q.nextTick(function () {
	        self.promiseDispatch(deferred.resolve, op, args);
	    });
	    return deferred.promise;
	};

	/**
	 * Gets the value of a property in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of property to get
	 * @return promise for the property value
	 */
	Q.get = function (object, key) {
	    return Q(object).dispatch("get", [key]);
	};

	Promise.prototype.get = function (key) {
	    return this.dispatch("get", [key]);
	};

	/**
	 * Sets the value of a property in a future turn.
	 * @param object    promise or immediate reference for object object
	 * @param name      name of property to set
	 * @param value     new value of property
	 * @return promise for the return value
	 */
	Q.set = function (object, key, value) {
	    return Q(object).dispatch("set", [key, value]);
	};

	Promise.prototype.set = function (key, value) {
	    return this.dispatch("set", [key, value]);
	};

	/**
	 * Deletes a property in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of property to delete
	 * @return promise for the return value
	 */
	Q.del = // XXX legacy
	Q["delete"] = function (object, key) {
	    return Q(object).dispatch("delete", [key]);
	};

	Promise.prototype.del = // XXX legacy
	Promise.prototype["delete"] = function (key) {
	    return this.dispatch("delete", [key]);
	};

	/**
	 * Invokes a method in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of method to invoke
	 * @param value     a value to post, typically an array of
	 *                  invocation arguments for promises that
	 *                  are ultimately backed with `resolve` values,
	 *                  as opposed to those backed with URLs
	 *                  wherein the posted value can be any
	 *                  JSON serializable object.
	 * @return promise for the return value
	 */
	// bound locally because it is used by other methods
	Q.mapply = // XXX As proposed by "Redsandro"
	Q.post = function (object, name, args) {
	    return Q(object).dispatch("post", [name, args]);
	};

	Promise.prototype.mapply = // XXX As proposed by "Redsandro"
	Promise.prototype.post = function (name, args) {
	    return this.dispatch("post", [name, args]);
	};

	/**
	 * Invokes a method in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of method to invoke
	 * @param ...args   array of invocation arguments
	 * @return promise for the return value
	 */
	Q.send = // XXX Mark Miller's proposed parlance
	Q.mcall = // XXX As proposed by "Redsandro"
	Q.invoke = function (object, name /*...args*/) {
	    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
	};

	Promise.prototype.send = // XXX Mark Miller's proposed parlance
	Promise.prototype.mcall = // XXX As proposed by "Redsandro"
	Promise.prototype.invoke = function (name /*...args*/) {
	    return this.dispatch("post", [name, array_slice(arguments, 1)]);
	};

	/**
	 * Applies the promised function in a future turn.
	 * @param object    promise or immediate reference for target function
	 * @param args      array of application arguments
	 */
	Q.fapply = function (object, args) {
	    return Q(object).dispatch("apply", [void 0, args]);
	};

	Promise.prototype.fapply = function (args) {
	    return this.dispatch("apply", [void 0, args]);
	};

	/**
	 * Calls the promised function in a future turn.
	 * @param object    promise or immediate reference for target function
	 * @param ...args   array of application arguments
	 */
	Q["try"] =
	Q.fcall = function (object /* ...args*/) {
	    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
	};

	Promise.prototype.fcall = function (/*...args*/) {
	    return this.dispatch("apply", [void 0, array_slice(arguments)]);
	};

	/**
	 * Binds the promised function, transforming return values into a fulfilled
	 * promise and thrown errors into a rejected one.
	 * @param object    promise or immediate reference for target function
	 * @param ...args   array of application arguments
	 */
	Q.fbind = function (object /*...args*/) {
	    var promise = Q(object);
	    var args = array_slice(arguments, 1);
	    return function fbound() {
	        return promise.dispatch("apply", [
	            this,
	            args.concat(array_slice(arguments))
	        ]);
	    };
	};
	Promise.prototype.fbind = function (/*...args*/) {
	    var promise = this;
	    var args = array_slice(arguments);
	    return function fbound() {
	        return promise.dispatch("apply", [
	            this,
	            args.concat(array_slice(arguments))
	        ]);
	    };
	};

	/**
	 * Requests the names of the owned properties of a promised
	 * object in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @return promise for the keys of the eventually settled object
	 */
	Q.keys = function (object) {
	    return Q(object).dispatch("keys", []);
	};

	Promise.prototype.keys = function () {
	    return this.dispatch("keys", []);
	};

	/**
	 * Turns an array of promises into a promise for an array.  If any of
	 * the promises gets rejected, the whole array is rejected immediately.
	 * @param {Array*} an array (or promise for an array) of values (or
	 * promises for values)
	 * @returns a promise for an array of the corresponding values
	 */
	// By Mark Miller
	// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
	Q.all = all;
	function all(promises) {
	    return when(promises, function (promises) {
	        var pendingCount = 0;
	        var deferred = defer();
	        array_reduce(promises, function (undefined, promise, index) {
	            var snapshot;
	            if (
	                isPromise(promise) &&
	                (snapshot = promise.inspect()).state === "fulfilled"
	            ) {
	                promises[index] = snapshot.value;
	            } else {
	                ++pendingCount;
	                when(
	                    promise,
	                    function (value) {
	                        promises[index] = value;
	                        if (--pendingCount === 0) {
	                            deferred.resolve(promises);
	                        }
	                    },
	                    deferred.reject,
	                    function (progress) {
	                        deferred.notify({ index: index, value: progress });
	                    }
	                );
	            }
	        }, void 0);
	        if (pendingCount === 0) {
	            deferred.resolve(promises);
	        }
	        return deferred.promise;
	    });
	}

	Promise.prototype.all = function () {
	    return all(this);
	};

	/**
	 * Returns the first resolved promise of an array. Prior rejected promises are
	 * ignored.  Rejects only if all promises are rejected.
	 * @param {Array*} an array containing values or promises for values
	 * @returns a promise fulfilled with the value of the first resolved promise,
	 * or a rejected promise if all promises are rejected.
	 */
	Q.any = any;

	function any(promises) {
	    if (promises.length === 0) {
	        return Q.resolve();
	    }

	    var deferred = Q.defer();
	    var pendingCount = 0;
	    array_reduce(promises, function (prev, current, index) {
	        var promise = promises[index];

	        pendingCount++;

	        when(promise, onFulfilled, onRejected, onProgress);
	        function onFulfilled(result) {
	            deferred.resolve(result);
	        }
	        function onRejected() {
	            pendingCount--;
	            if (pendingCount === 0) {
	                deferred.reject(new Error(
	                    "Can't get fulfillment value from any promise, all " +
	                    "promises were rejected."
	                ));
	            }
	        }
	        function onProgress(progress) {
	            deferred.notify({
	                index: index,
	                value: progress
	            });
	        }
	    }, undefined);

	    return deferred.promise;
	}

	Promise.prototype.any = function () {
	    return any(this);
	};

	/**
	 * Waits for all promises to be settled, either fulfilled or
	 * rejected.  This is distinct from `all` since that would stop
	 * waiting at the first rejection.  The promise returned by
	 * `allResolved` will never be rejected.
	 * @param promises a promise for an array (or an array) of promises
	 * (or values)
	 * @return a promise for an array of promises
	 */
	Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
	function allResolved(promises) {
	    return when(promises, function (promises) {
	        promises = array_map(promises, Q);
	        return when(all(array_map(promises, function (promise) {
	            return when(promise, noop, noop);
	        })), function () {
	            return promises;
	        });
	    });
	}

	Promise.prototype.allResolved = function () {
	    return allResolved(this);
	};

	/**
	 * @see Promise#allSettled
	 */
	Q.allSettled = allSettled;
	function allSettled(promises) {
	    return Q(promises).allSettled();
	}

	/**
	 * Turns an array of promises into a promise for an array of their states (as
	 * returned by `inspect`) when they have all settled.
	 * @param {Array[Any*]} values an array (or promise for an array) of values (or
	 * promises for values)
	 * @returns {Array[State]} an array of states for the respective values.
	 */
	Promise.prototype.allSettled = function () {
	    return this.then(function (promises) {
	        return all(array_map(promises, function (promise) {
	            promise = Q(promise);
	            function regardless() {
	                return promise.inspect();
	            }
	            return promise.then(regardless, regardless);
	        }));
	    });
	};

	/**
	 * Captures the failure of a promise, giving an oportunity to recover
	 * with a callback.  If the given promise is fulfilled, the returned
	 * promise is fulfilled.
	 * @param {Any*} promise for something
	 * @param {Function} callback to fulfill the returned promise if the
	 * given promise is rejected
	 * @returns a promise for the return value of the callback
	 */
	Q.fail = // XXX legacy
	Q["catch"] = function (object, rejected) {
	    return Q(object).then(void 0, rejected);
	};

	Promise.prototype.fail = // XXX legacy
	Promise.prototype["catch"] = function (rejected) {
	    return this.then(void 0, rejected);
	};

	/**
	 * Attaches a listener that can respond to progress notifications from a
	 * promise's originating deferred. This listener receives the exact arguments
	 * passed to ``deferred.notify``.
	 * @param {Any*} promise for something
	 * @param {Function} callback to receive any progress notifications
	 * @returns the given promise, unchanged
	 */
	Q.progress = progress;
	function progress(object, progressed) {
	    return Q(object).then(void 0, void 0, progressed);
	}

	Promise.prototype.progress = function (progressed) {
	    return this.then(void 0, void 0, progressed);
	};

	/**
	 * Provides an opportunity to observe the settling of a promise,
	 * regardless of whether the promise is fulfilled or rejected.  Forwards
	 * the resolution to the returned promise when the callback is done.
	 * The callback can return a promise to defer completion.
	 * @param {Any*} promise
	 * @param {Function} callback to observe the resolution of the given
	 * promise, takes no arguments.
	 * @returns a promise for the resolution of the given promise when
	 * ``fin`` is done.
	 */
	Q.fin = // XXX legacy
	Q["finally"] = function (object, callback) {
	    return Q(object)["finally"](callback);
	};

	Promise.prototype.fin = // XXX legacy
	Promise.prototype["finally"] = function (callback) {
	    callback = Q(callback);
	    return this.then(function (value) {
	        return callback.fcall().then(function () {
	            return value;
	        });
	    }, function (reason) {
	        // TODO attempt to recycle the rejection with "this".
	        return callback.fcall().then(function () {
	            throw reason;
	        });
	    });
	};

	/**
	 * Terminates a chain of promises, forcing rejections to be
	 * thrown as exceptions.
	 * @param {Any*} promise at the end of a chain of promises
	 * @returns nothing
	 */
	Q.done = function (object, fulfilled, rejected, progress) {
	    return Q(object).done(fulfilled, rejected, progress);
	};

	Promise.prototype.done = function (fulfilled, rejected, progress) {
	    var onUnhandledError = function (error) {
	        // forward to a future turn so that ``when``
	        // does not catch it and turn it into a rejection.
	        Q.nextTick(function () {
	            makeStackTraceLong(error, promise);
	            if (Q.onerror) {
	                Q.onerror(error);
	            } else {
	                throw error;
	            }
	        });
	    };

	    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
	    var promise = fulfilled || rejected || progress ?
	        this.then(fulfilled, rejected, progress) :
	        this;

	    if (typeof process === "object" && process && process.domain) {
	        onUnhandledError = process.domain.bind(onUnhandledError);
	    }

	    promise.then(void 0, onUnhandledError);
	};

	/**
	 * Causes a promise to be rejected if it does not get fulfilled before
	 * some milliseconds time out.
	 * @param {Any*} promise
	 * @param {Number} milliseconds timeout
	 * @param {Any*} custom error message or Error object (optional)
	 * @returns a promise for the resolution of the given promise if it is
	 * fulfilled before the timeout, otherwise rejected.
	 */
	Q.timeout = function (object, ms, error) {
	    return Q(object).timeout(ms, error);
	};

	Promise.prototype.timeout = function (ms, error) {
	    var deferred = defer();
	    var timeoutId = setTimeout(function () {
	        if (!error || "string" === typeof error) {
	            error = new Error(error || "Timed out after " + ms + " ms");
	            error.code = "ETIMEDOUT";
	        }
	        deferred.reject(error);
	    }, ms);

	    this.then(function (value) {
	        clearTimeout(timeoutId);
	        deferred.resolve(value);
	    }, function (exception) {
	        clearTimeout(timeoutId);
	        deferred.reject(exception);
	    }, deferred.notify);

	    return deferred.promise;
	};

	/**
	 * Returns a promise for the given value (or promised value), some
	 * milliseconds after it resolved. Passes rejections immediately.
	 * @param {Any*} promise
	 * @param {Number} milliseconds
	 * @returns a promise for the resolution of the given promise after milliseconds
	 * time has elapsed since the resolution of the given promise.
	 * If the given promise rejects, that is passed immediately.
	 */
	Q.delay = function (object, timeout) {
	    if (timeout === void 0) {
	        timeout = object;
	        object = void 0;
	    }
	    return Q(object).delay(timeout);
	};

	Promise.prototype.delay = function (timeout) {
	    return this.then(function (value) {
	        var deferred = defer();
	        setTimeout(function () {
	            deferred.resolve(value);
	        }, timeout);
	        return deferred.promise;
	    });
	};

	/**
	 * Passes a continuation to a Node function, which is called with the given
	 * arguments provided as an array, and returns a promise.
	 *
	 *      Q.nfapply(FS.readFile, [__filename])
	 *      .then(function (content) {
	 *      })
	 *
	 */
	Q.nfapply = function (callback, args) {
	    return Q(callback).nfapply(args);
	};

	Promise.prototype.nfapply = function (args) {
	    var deferred = defer();
	    var nodeArgs = array_slice(args);
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.fapply(nodeArgs).fail(deferred.reject);
	    return deferred.promise;
	};

	/**
	 * Passes a continuation to a Node function, which is called with the given
	 * arguments provided individually, and returns a promise.
	 * @example
	 * Q.nfcall(FS.readFile, __filename)
	 * .then(function (content) {
	 * })
	 *
	 */
	Q.nfcall = function (callback /*...args*/) {
	    var args = array_slice(arguments, 1);
	    return Q(callback).nfapply(args);
	};

	Promise.prototype.nfcall = function (/*...args*/) {
	    var nodeArgs = array_slice(arguments);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.fapply(nodeArgs).fail(deferred.reject);
	    return deferred.promise;
	};

	/**
	 * Wraps a NodeJS continuation passing function and returns an equivalent
	 * version that returns a promise.
	 * @example
	 * Q.nfbind(FS.readFile, __filename)("utf-8")
	 * .then(console.log)
	 * .done()
	 */
	Q.nfbind =
	Q.denodeify = function (callback /*...args*/) {
	    var baseArgs = array_slice(arguments, 1);
	    return function () {
	        var nodeArgs = baseArgs.concat(array_slice(arguments));
	        var deferred = defer();
	        nodeArgs.push(deferred.makeNodeResolver());
	        Q(callback).fapply(nodeArgs).fail(deferred.reject);
	        return deferred.promise;
	    };
	};

	Promise.prototype.nfbind =
	Promise.prototype.denodeify = function (/*...args*/) {
	    var args = array_slice(arguments);
	    args.unshift(this);
	    return Q.denodeify.apply(void 0, args);
	};

	Q.nbind = function (callback, thisp /*...args*/) {
	    var baseArgs = array_slice(arguments, 2);
	    return function () {
	        var nodeArgs = baseArgs.concat(array_slice(arguments));
	        var deferred = defer();
	        nodeArgs.push(deferred.makeNodeResolver());
	        function bound() {
	            return callback.apply(thisp, arguments);
	        }
	        Q(bound).fapply(nodeArgs).fail(deferred.reject);
	        return deferred.promise;
	    };
	};

	Promise.prototype.nbind = function (/*thisp, ...args*/) {
	    var args = array_slice(arguments, 0);
	    args.unshift(this);
	    return Q.nbind.apply(void 0, args);
	};

	/**
	 * Calls a method of a Node-style object that accepts a Node-style
	 * callback with a given array of arguments, plus a provided callback.
	 * @param object an object that has the named method
	 * @param {String} name name of the method of object
	 * @param {Array} args arguments to pass to the method; the callback
	 * will be provided by Q and appended to these arguments.
	 * @returns a promise for the value or error
	 */
	Q.nmapply = // XXX As proposed by "Redsandro"
	Q.npost = function (object, name, args) {
	    return Q(object).npost(name, args);
	};

	Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
	Promise.prototype.npost = function (name, args) {
	    var nodeArgs = array_slice(args || []);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};

	/**
	 * Calls a method of a Node-style object that accepts a Node-style
	 * callback, forwarding the given variadic arguments, plus a provided
	 * callback argument.
	 * @param object an object that has the named method
	 * @param {String} name name of the method of object
	 * @param ...args arguments to pass to the method; the callback will
	 * be provided by Q and appended to these arguments.
	 * @returns a promise for the value or error
	 */
	Q.nsend = // XXX Based on Mark Miller's proposed "send"
	Q.nmcall = // XXX Based on "Redsandro's" proposal
	Q.ninvoke = function (object, name /*...args*/) {
	    var nodeArgs = array_slice(arguments, 2);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};

	Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
	Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
	Promise.prototype.ninvoke = function (name /*...args*/) {
	    var nodeArgs = array_slice(arguments, 1);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};

	/**
	 * If a function would like to support both Node continuation-passing-style and
	 * promise-returning-style, it can end its internal promise chain with
	 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
	 * elects to use a nodeback, the result will be sent there.  If they do not
	 * pass a nodeback, they will receive the result promise.
	 * @param object a result (or a promise for a result)
	 * @param {Function} nodeback a Node.js-style callback
	 * @returns either the promise or nothing
	 */
	Q.nodeify = nodeify;
	function nodeify(object, nodeback) {
	    return Q(object).nodeify(nodeback);
	}

	Promise.prototype.nodeify = function (nodeback) {
	    if (nodeback) {
	        this.then(function (value) {
	            Q.nextTick(function () {
	                nodeback(null, value);
	            });
	        }, function (error) {
	            Q.nextTick(function () {
	                nodeback(error);
	            });
	        });
	    } else {
	        return this;
	    }
	};

	Q.noConflict = function() {
	    throw new Error("Q.noConflict only works when Q is used as a global");
	};

	// All code before this point will be filtered from stack traces.
	var qEndingLine = captureLine();

	return Q;

	});

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(46), __webpack_require__(47).setImmediate))

/***/ },
/* 46 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(46).nextTick;
	var apply = Function.prototype.apply;
	var slice = Array.prototype.slice;
	var immediateIds = {};
	var nextImmediateId = 0;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) { timeout.close(); };

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// That's not how node.js implements it but the exposed api is the same.
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
	  var id = nextImmediateId++;
	  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

	  immediateIds[id] = true;

	  nextTick(function onNextTick() {
	    if (immediateIds[id]) {
	      // fn.call() is faster so we optimize for the common use-case
	      // @see http://jsperf.com/call-apply-segu
	      if (args) {
	        fn.apply(null, args);
	      } else {
	        fn.call(null);
	      }
	      // Prevent ids from leaking
	      exports.clearImmediate(id);
	    }
	  });

	  return id;
	};

	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
	  delete immediateIds[id];
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(47).setImmediate, __webpack_require__(47).clearImmediate))

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(22);

	var _networking2 = _interopRequireDefault(_networking);

	var _config = __webpack_require__(32);

	var _config2 = _interopRequireDefault(_config);

	var _keychain = __webpack_require__(30);

	var _keychain2 = _interopRequireDefault(_keychain);

	var _responders = __webpack_require__(31);

	var _responders2 = _interopRequireDefault(_responders);

	var _utils = __webpack_require__(33);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;
	    var config = _ref.config;
	    var keychain = _ref.keychain;
	    var error = _ref.error;
	    var hmac_SHA256 = _ref.hmac_SHA256;

	    _classCallCheck(this, _class);

	    this._networking = networking;
	    this._keychain = keychain;
	    this._config = config;
	    this._error = error;
	    this._hmac_SHA256 = hmac_SHA256;
	  }

	  _createClass(_class, [{
	    key: 'revoke',
	    value: function revoke(args, argumentCallback) {
	      args['read'] = false;
	      args['write'] = false;
	      SELF['grant'](args, callback);
	    }
	  }, {
	    key: 'grant',
	    value: function grant(args, argumentCallback) {
	      var callback = args.callback || argumentCallback;
	      var err = args.error || function () {};
	      var channel = args.channel || args.channels;
	      var channel_group = args.channel_group;
	      var ttl = args.ttl;
	      var r = args.read ? '1' : '0';
	      var w = args.write ? '1' : '0';
	      var m = args.manage ? '1' : '0';
	      var auth_key = args.auth_key || args.auth_keys;

	      if (!callback) return this._error('Missing Callback');
	      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');
	      if (!this._keychain.getPublishKey()) return this._error('Missing Publish Key');
	      if (!this._keychain.getSecretKey()) return this._error('Missing Secret Key');

	      var timestamp = Math.floor(new Date().getTime() / 1000);
	      var sign_input = this._keychain.getSubscribeKey() + '\n' + this._keychain.getPublishKey() + '\n' + 'grant' + '\n';

	      var data = { w: w, r: r, timestamp: timestamp };

	      if (args.manage) {
	        data.m = m;
	      }
	      if (_utils2.default.isArray(channel)) {
	        channel = channel.join(',');
	      }
	      if (_utils2.default.isArray(auth_key)) {
	        auth_key = auth_key.join(',');
	      }

	      if (typeof channel !== 'undefined' && channel !== null && channel.length > 0) {
	        data.channel = channel;
	      }

	      if (typeof channel_group !== 'undefined' && channel_group !== null && channel_group.length > 0) {
	        data['channel-group'] = channel_group;
	      }

	      if (ttl || ttl === 0) data.ttl = ttl;

	      if (auth_key) data.auth = auth_key;

	      data = this._networking.prepareParams(data);

	      if (!auth_key) delete data.auth;

	      sign_input += _utils2.default._get_pam_sign_input_from_params(data);

	      var signature = this._hmac_SHA256(sign_input, this._keychain.getSecretKey());

	      signature = signature.replace(/\+/g, '-');
	      signature = signature.replace(/\//g, '_');

	      data.signature = signature;

	      this._networking.performGrant({
	        data: data,
	        success: function success(response) {
	          _responders2.default.callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _responders2.default.error(response, err);
	        }
	      });
	    }
	  }, {
	    key: 'audit',
	    value: function audit(args, argumentCallback) {
	      var callback = args.callback || argumentCallback;
	      var err = args.error || function () {};
	      var channel = args.channel;
	      var channel_group = args.channel_group;
	      var auth_key = args.auth_key;

	      // Make sure we have a Channel
	      if (!callback) return this._error('Missing Callback');
	      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');
	      if (!this._keychain.getPublishKey()) return this._error('Missing Publish Key');
	      if (!this._keychain.getSecretKey()) return this._error('Missing Secret Key');

	      var timestamp = Math.floor(new Date().getTime() / 1000);
	      var sign_input = this._keychain.getSubscribeKey() + '\n' + this._keychain.getPublishKey() + '\n' + 'audit' + '\n';

	      var data = { timestamp: timestamp };

	      if (typeof channel !== 'undefined' && channel !== null && channel.length > 0) {
	        data.channel = channel;
	      }

	      if (typeof channel_group !== 'undefined' && channel_group !== null && channel_group.length > 0) {
	        data['channel-group'] = channel_group;
	      }

	      if (auth_key) data.auth = auth_key;

	      data = this._networking.prepareParams(data);

	      if (!auth_key) delete data.auth;

	      sign_input += _utils2.default._get_pam_sign_input_from_params(data);

	      var signature = this._hmac_SHA256(sign_input, this._keychain.getSecretKey());

	      signature = signature.replace(/\+/g, '-');
	      signature = signature.replace(/\//g, '_');

	      data.signature = signature;
	      this._networking.performAudit({
	        data: data,
	        success: function success(response) {
	          _responders2.default.callback(response, callback, err);
	        },
	        fail: function fail(response) {
	          _responders2.default.error(response, err);
	        }
	      });
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(22);

	var _networking2 = _interopRequireDefault(_networking);

	var _logger = __webpack_require__(39);

	var _logger2 = _interopRequireDefault(_logger);

	var _responders = __webpack_require__(31);

	var _responders2 = _interopRequireDefault(_responders);

	var _utils = __webpack_require__(33);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;

	    _classCallCheck(this, _class);

	    this._networking = networking;
	    this._r = new _responders2.default('#endpoints/history');
	    this._l = _logger2.default.getLogger('#endpoints/history');
	  }

	  // generic function to handle all channel group operations


	  _createClass(_class, [{
	    key: 'channelGroup',
	    value: function channelGroup(args, callback) {
	      var providedChannelGroupName = args.channelGroup;
	      var channels = args.channels || args.channel;
	      var effectiveChannelGroupName = '';

	      var data = {};
	      var mode = args.mode || 'add';

	      if (providedChannelGroupName) {
	        var splitChannelGroupName = providedChannelGroupName.split(':');

	        if (splitChannelGroupName.length > 1) {
	          effectiveChannelGroupName = splitChannelGroupName[1];
	        } else {
	          effectiveChannelGroupName = splitChannelGroupName[0];
	        }
	      }

	      if (channels) {
	        if (_utils2.default.isArray(channels)) {
	          channels = channels.join(',');
	        }
	        data[mode] = channels;
	      }

	      this._networking.performChannelGroupOperation(effectiveChannelGroupName, mode, data, callback);
	    }
	  }, {
	    key: 'listChannels',
	    value: function listChannels(args, callback) {
	      if (!args.channelGroup) {
	        return callback(this._r.validationError('Missing Channel Group'));
	      }

	      this.channelGroup(args, callback);
	    }
	  }, {
	    key: 'removeGroup',
	    value: function removeGroup(args, callback) {
	      var errorMessage = 'Use channel_group_remove_channel if you want to remove a channel from a group.';
	      if (!args.channelGroup) {
	        return callback(this._r.validationError('Missing Channel Group'));
	      }

	      if (args.channel) {
	        return callback(this._r.validationError(errorMessage));
	      }

	      args.mode = 'remove';
	      this.channelGroup(args, callback);
	    }
	  }, {
	    key: 'listGroups',
	    value: function listGroups(args, callback) {
	      this.channelGroup(args, callback);
	    }
	  }, {
	    key: 'addChannel',
	    value: function addChannel(args, callback) {
	      if (!args.channelGroup) {
	        return callback(this._r.validationError('Missing Channel Group'));
	      }

	      if (!args.channel && !args.channels) {
	        return callback(this._r.validationError('Missing Channel'));
	      }
	      this.channelGroup(args, callback);
	    }
	  }, {
	    key: 'removeChannel',
	    value: function removeChannel(args, callback) {
	      if (!args.channelGroup) {
	        return callback(this._r.validationError('Missing Channel Group'));
	      }
	      if (!args.channel && !args.channels) {
	        return callback(this._r.validationError('Missing Channel'));
	      }

	      args.mode = 'remove';
	      this.channelGroup(args, callback);
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _networking = __webpack_require__(22);

	var _networking2 = _interopRequireDefault(_networking);

	var _config = __webpack_require__(32);

	var _config2 = _interopRequireDefault(_config);

	var _keychain = __webpack_require__(30);

	var _keychain2 = _interopRequireDefault(_keychain);

	var _state = __webpack_require__(35);

	var _state2 = _interopRequireDefault(_state);

	var _publish_queue = __webpack_require__(36);

	var _publish_queue2 = _interopRequireDefault(_publish_queue);

	var _presence = __webpack_require__(38);

	var _presence2 = _interopRequireDefault(_presence);

	var _responders = __webpack_require__(31);

	var _responders2 = _interopRequireDefault(_responders);

	var _utils = __webpack_require__(33);

	var _utils2 = _interopRequireDefault(_utils);

	var _defaults = __webpack_require__(34);

	var _defaults2 = _interopRequireDefault(_defaults);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _class = function () {
	  function _class(_ref) {
	    var networking = _ref.networking;
	    var config = _ref.config;
	    var keychain = _ref.keychain;
	    var presenceEndpoints = _ref.presenceEndpoints;
	    var publishQueue = _ref.publishQueue;
	    var state = _ref.state;
	    var error = _ref.error;

	    _classCallCheck(this, _class);

	    this._networking = networking;
	    this._config = config;
	    this._keychain = keychain;
	    this._state = state;
	    this._error = error;
	    this._presence = presenceEndpoints;
	    this._publishQueue = publishQueue;
	  }

	  _createClass(_class, [{
	    key: 'subscribe',
	    value: function subscribe(args, subscribeCallback, presenceCallback) {
	      var _this = this;

	      var channel = args.channel;
	      var channelGroup = args.channel_group;
	      var timetoken = args.timetoken || 0;
	      var cipherKey = args.cipher_key;

	      var sub_timeout = args.timeout || SUB_TIMEOUT;
	      var windowing = args.windowing || SUB_WINDOWING;

	      // Make sure we have a Channel
	      if (!channel && !channelGroup) {
	        return this._error('Missing Channel');
	      }

	      if (!subscribeCallback) {
	        return this._error('Missing Callback');
	      }
	      if (!this._keychain.getSubscribeKey()) {
	        return this._error('Missing Subscribe Key');
	      }

	      // Setup Channel(s)
	      if (channel) {
	        var channelList = (channel.join ? channel.join(',') : '' + channel).split(',');
	        _utils2.default.each(channelList, function (channel) {
	          _this.__subscribeToChannel(channel, cipherKey, subscribeCallback, presenceCallback);
	        });
	      }

	      // Setup Channel Groups
	      if (channelGroup) {
	        var ChannelGroupList = (channelGroup.join ? channelGroup.join(',') : '' + channelGroup).split(',');
	        _utils2.default.each(ChannelGroupList, function (channelGroup) {
	          _this.__subscribeToChannelGroup(channelGroup, cipherKey, subscribeCallback, presenceCallback);
	        });
	      }
	    }
	  }, {
	    key: '__restartSubscribeLoop',
	    value: function __restartSubscribeLoop() {
	      var channels = this._state.generate_channel_list().join(',');
	      var channel_groups = stateStorage.generate_channel_group_list().join(',');

	      // Stop Connection
	      if (!channels && !channel_groups) return;

	      if (!channels) channels = ',';

	      // Connect to PubNub Subscribe Servers
	      _reset_offline();

	      var data = networking.prepareParams({ uuid: keychain.getUUID(), auth: keychain.getAuthKey() });

	      if (channel_groups) {
	        data['channel-group'] = channel_groups;
	      }

	      var st = JSON.stringify(stateStorage.getPresenceState());
	      if (st.length > 2) data['state'] = JSON.stringify(stateStorage.getPresenceState());

	      if (config.getPresenceTimeout()) {
	        data['heartbeat'] = config.getPresenceTimeout();
	      }

	      if (config.isInstanceIdEnabled()) {
	        data['instanceid'] = keychain.getInstanceId();
	      }

	      SUB_RECEIVER = xdr({
	        timeout: sub_timeout,
	        fail: function fail(response) {
	          if (response && response['error'] && response['service']) {
	            _responders2.default.error(response, SUB_ERROR);
	            _test_connection(false);
	          } else {
	            SELF['time'](function (success) {
	              !success && _responders2.default.error(response, SUB_ERROR);
	              _test_connection(success);
	            });
	          }
	        },
	        data: networking.prepareParams(data),
	        url: [networking.getSubscribeOrigin(), 'subscribe', keychain.getSubscribeKey(), _utils2.default.encode(channels), 0, TIMETOKEN],
	        success: function success(messages) {
	          // Check for Errors
	          if (!messages || (typeof messages === 'undefined' ? 'undefined' : _typeof(messages)) == 'object' && 'error' in messages && messages['error']) {
	            SUB_ERROR(messages);
	            return _utils2.default.timeout(CONNECT, _defaults2.default.SECOND);
	          }

	          // Restore Previous Connection Point if Needed
	          TIMETOKEN = !TIMETOKEN && SUB_RESTORE && db['get'](keychain.getSubscribeKey()) || messages[1];

	          /*
	           // Connect
	           each_channel_registry(function(registry){
	           if (registry.connected) return;
	           registry.connected = 1;
	           registry.connect(channel.name);
	           });
	           */

	          // Route Channel <---> Callback for Message
	          /*
	          var next_callback = (function () {
	            var channels = '';
	            var channels2 = '';
	             if (messages.length > 3) {
	              channels = messages[3];
	              channels2 = messages[2];
	            } else if (messages.length > 2) {
	              channels = messages[2];
	            } else {
	              channels = utils.map(
	                this._state.getChannels(), function (chan) {
	                  return utils.map(
	                    Array(messages[0].length)
	                      .join(',').split(','),
	                    function () {
	                      return chan;
	                    }
	                  );
	                }).join(',');
	            }
	             var list = channels.split(',');
	            var list2 = (channels2) ? channels2.split(',') : [];
	             return function () {
	              var channel = list.shift() || SUB_CHANNEL;
	              var channel2 = list2.shift();
	               var chobj = {};
	               if (channel2) {
	                if (channel && channel.indexOf('-pnpres') >= 0
	                  && channel2.indexOf('-pnpres') < 0) {
	                  channel2 += '-pnpres';
	                }
	                chobj = stateStorage.getChannelGroup(channel2) || stateStorage.getChannel(channel2) || { callback: function () {} };
	              } else {
	                chobj = stateStorage.getChannel(channel);
	              }
	               var r = [
	                chobj
	                  .callback || SUB_CALLBACK,
	                channel.split(constants.PRESENCE_SUFFIX)[0],
	              ];
	              channel2 && r.push(channel2.split(constants.PRESENCE_SUFFIX)[0]);
	              return r;
	            };
	          })();
	          */

	          var latency = _utils2.default.detect_latency(+messages[1]);
	          _utils2.default.each(messages[0], function (msg) {
	            var next = next_callback();
	            var decrypted_msg = decrypt(msg, stateStorage.getChannel(next[1]) ? stateStorage.getChannel(next[1])['cipher_key'] : null);
	            next[0] && next[0](decrypted_msg, messages, next[2] || next[1], latency, next[1]);
	          });

	          _utils2.default.timeout(_connect, windowing);
	        }
	      });
	    }
	  }, {
	    key: '__subscribeToChannel',
	    value: function __subscribeToChannel(channelName, cipherKey, subscribeCallback, presenceCallback) {
	      this._state.addChannel(channelName, {
	        name: channelName,
	        subscribed: 1,
	        callback: subscribeCallback,
	        cipher_key: cipherKey
	      });

	      // Presence Enabled?
	      if (!presenceCallback) {
	        return;
	      }

	      this._state.addChannel(channelName, {
	        name: channelName + _defaults2.default.PRESENCE_SUFFIX,
	        subscribed: 1,
	        callback: presenceCallback
	      });
	    }
	  }, {
	    key: '__subscribeToChannelGroup',
	    value: function __subscribeToChannelGroup(channelGroupName, cipherKey, subscribeCallback, presenceCallback) {
	      this._state.addChannelGroup(channelGroupName, {
	        name: channelGroupName,
	        subscribed: 1,
	        callback: subscribeCallback,
	        cipher_key: cipherKey
	      });

	      // Presence Enabled?
	      if (!presenceCallback) {
	        return;
	      }

	      this._state.addChannel(channelGroupName, {
	        name: channelGroupName + _defaults2.default.PRESENCE_SUFFIX,
	        subscribed: 1,
	        callback: presenceCallback
	      });
	    }
	  }, {
	    key: 'performUnsubscribe',
	    value: function performUnsubscribe(args, argCallback) {
	      var channelArg = args['channel'];
	      var channelGroupArg = args['channel_group'];
	      var authKey = args.auth_key || this._keychain.getAuthKey();
	      var callback = argCallback || args.callback || function () {};
	      var err = args.error || function () {};

	      if (!channelArg && !channelGroupArg) {
	        return this._error('Missing Channel or Channel Group');
	      }

	      if (!this._keychain.getSubscribeKey()) {
	        return this._error('Missing Subscribe Key');
	      }

	      if (channelArg) {
	        var channels = _utils2.default.isArray(channelArg) ? channelArg : ('' + channelArg).split(',');
	        var existingChannels = [];
	        var presenceChannels = [];

	        _utils2.default.each(channels, function (channel) {
	          if (this._state.getChannel(channel)) {
	            existingChannels.push(channel);
	          }
	        });

	        // if we do not have any channels to unsubscribe from, trigger a callback.
	        if (existingChannels.length === 0) {
	          callback({ action: 'leave' });
	          return;
	        }

	        // Prepare presence channels
	        _utils2.default.each(existingChannels, function (channel) {
	          presenceChannels.push(channel + _defaults2.default.PRESENCE_SUFFIX);
	        });

	        _utils2.default.each(existingChannels.concat(presenceChannels), function (channel) {
	          if (this._state.containsChannel(channel)) {
	            this._state.removeChannel(channel);
	          }

	          if (this._state.isInPresenceState(channel)) {
	            this._state.removeFromPresenceState(channel);
	          }
	        });

	        this._presence.announceChannelLeave(existingChannels.join(','), authKey, callback, err);
	      }

	      if (channelGroupArg) {
	        var channelGroups = _utils2.default.isArray(channelGroupArg) ? channelGroupArg : ('' + channelGroupArg).split(',');
	        var existingChannelGroups = [];
	        var presenceChannelGroups = [];

	        _utils2.default.each(channelGroups, function (channelGroup) {
	          if (this._state.getChannelGroup(channelGroup)) {
	            existingChannelGroups.push(channelGroup);
	          }
	        });

	        // if we do not have any channel groups to unsubscribe from, trigger a callback.
	        if (existingChannelGroups.length === 0) {
	          callback({ action: 'leave' });
	          return;
	        }

	        // Prepare presence channels
	        _utils2.default.each(existingChannelGroups, function (channelGroup) {
	          presenceChannelGroups.push(channelGroup + _defaults2.default.PRESENCE_SUFFIX);
	        });

	        _utils2.default.each(existingChannelGroups.concat(presenceChannelGroups), function (channelGroup) {
	          if (this._state.containsChannelGroup(channelGroup)) {
	            this._state.removeChannelGroup(channelGroup);
	          }
	          if (this._state.isInPresenceState(channelGroup)) {
	            this._state.removeFromPresenceState(channelGroup);
	          }
	        });

	        this._presence.announceChannelGroupLeave(existingChannelGroups.join(','), authKey, callback, err);
	      }
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _publish_queue = __webpack_require__(36);

	var _publish_queue2 = _interopRequireDefault(_publish_queue);

	var _responders = __webpack_require__(31);

	var _responders2 = _interopRequireDefault(_responders);

	var _logger = __webpack_require__(39);

	var _logger2 = _interopRequireDefault(_logger);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// psv2 supports filtering by metadata

	var _class = function () {
	  function _class(_ref) {
	    var encrypt = _ref.encrypt;
	    var publishQueue = _ref.publishQueue;

	    _classCallCheck(this, _class);

	    this._encrypt = encrypt;
	    this._publishQueue = publishQueue;
	    this._r = new _responders2.default('#endpoints/publish');
	    this._l = _logger2.default.getLogger('#endpoints/publish');
	  }

	  _createClass(_class, [{
	    key: 'publish',
	    value: function publish(args, callback) {
	      var message = args.message;
	      var channel = args.channel;
	      var meta = args.meta;
	      var cipherKey = args.cipherKey;
	      var _args$sendByPost = args.sendByPost;
	      var sendByPost = _args$sendByPost === undefined ? false : _args$sendByPost;
	      var _args$storeInHistory = args.storeInHistory;
	      var storeInHistory = _args$storeInHistory === undefined ? true : _args$storeInHistory;


	      if (!message) {
	        return callback(this._r.validationError('Missing Message'));
	      }

	      if (!channel) {
	        return callback(this._r.validationError('Missing Channel'));
	      }

	      var params = {};
	      var publishItem = this._publishQueue.newQueueable();

	      if (!storeInHistory) {
	        params.store = '0';
	      }

	      if (meta && (typeof meta === 'undefined' ? 'undefined' : _typeof(meta)) === 'object') {
	        params.meta = JSON.stringify(meta);
	      }

	      publishItem.payload = JSON.stringify(this._encrypt(message, cipherKey));
	      publishItem.channel = channel;
	      publishItem.params = params;
	      publishItem.httpMethod = sendByPost ? 'POST' : 'GET';
	      publishItem.callback = callback;

	      // Queue Message Send
	      this._publishQueue.queueItem(publishItem);
	    }
	  }]);

	  return _class;
	}();

	exports.default = _class;

/***/ }
/******/ ])
});
;