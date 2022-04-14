(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.PubNub = factory());
})(this, (function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read$1(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray$1(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    var cbor = {exports: {}};

    /*
     * The MIT License (MIT)
     *
     * Copyright (c) 2014 Patrick Gansterer <paroga@paroga.com>
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     */

    (function (module) {
    (function(global, undefined$1) {var POW_2_24 = Math.pow(2, -24),
        POW_2_32 = Math.pow(2, 32),
        POW_2_53 = Math.pow(2, 53);

    function encode(value) {
      var data = new ArrayBuffer(256);
      var dataView = new DataView(data);
      var lastLength;
      var offset = 0;

      function ensureSpace(length) {
        var newByteLength = data.byteLength;
        var requiredLength = offset + length;
        while (newByteLength < requiredLength)
          newByteLength *= 2;
        if (newByteLength !== data.byteLength) {
          var oldDataView = dataView;
          data = new ArrayBuffer(newByteLength);
          dataView = new DataView(data);
          var uint32count = (offset + 3) >> 2;
          for (var i = 0; i < uint32count; ++i)
            dataView.setUint32(i * 4, oldDataView.getUint32(i * 4));
        }

        lastLength = length;
        return dataView;
      }
      function write() {
        offset += lastLength;
      }
      function writeFloat64(value) {
        write(ensureSpace(8).setFloat64(offset, value));
      }
      function writeUint8(value) {
        write(ensureSpace(1).setUint8(offset, value));
      }
      function writeUint8Array(value) {
        var dataView = ensureSpace(value.length);
        for (var i = 0; i < value.length; ++i)
          dataView.setUint8(offset + i, value[i]);
        write();
      }
      function writeUint16(value) {
        write(ensureSpace(2).setUint16(offset, value));
      }
      function writeUint32(value) {
        write(ensureSpace(4).setUint32(offset, value));
      }
      function writeUint64(value) {
        var low = value % POW_2_32;
        var high = (value - low) / POW_2_32;
        var dataView = ensureSpace(8);
        dataView.setUint32(offset, high);
        dataView.setUint32(offset + 4, low);
        write();
      }
      function writeTypeAndLength(type, length) {
        if (length < 24) {
          writeUint8(type << 5 | length);
        } else if (length < 0x100) {
          writeUint8(type << 5 | 24);
          writeUint8(length);
        } else if (length < 0x10000) {
          writeUint8(type << 5 | 25);
          writeUint16(length);
        } else if (length < 0x100000000) {
          writeUint8(type << 5 | 26);
          writeUint32(length);
        } else {
          writeUint8(type << 5 | 27);
          writeUint64(length);
        }
      }
      
      function encodeItem(value) {
        var i;

        if (value === false)
          return writeUint8(0xf4);
        if (value === true)
          return writeUint8(0xf5);
        if (value === null)
          return writeUint8(0xf6);
        if (value === undefined$1)
          return writeUint8(0xf7);
      
        switch (typeof value) {
          case "number":
            if (Math.floor(value) === value) {
              if (0 <= value && value <= POW_2_53)
                return writeTypeAndLength(0, value);
              if (-POW_2_53 <= value && value < 0)
                return writeTypeAndLength(1, -(value + 1));
            }
            writeUint8(0xfb);
            return writeFloat64(value);

          case "string":
            var utf8data = [];
            for (i = 0; i < value.length; ++i) {
              var charCode = value.charCodeAt(i);
              if (charCode < 0x80) {
                utf8data.push(charCode);
              } else if (charCode < 0x800) {
                utf8data.push(0xc0 | charCode >> 6);
                utf8data.push(0x80 | charCode & 0x3f);
              } else if (charCode < 0xd800) {
                utf8data.push(0xe0 | charCode >> 12);
                utf8data.push(0x80 | (charCode >> 6)  & 0x3f);
                utf8data.push(0x80 | charCode & 0x3f);
              } else {
                charCode = (charCode & 0x3ff) << 10;
                charCode |= value.charCodeAt(++i) & 0x3ff;
                charCode += 0x10000;

                utf8data.push(0xf0 | charCode >> 18);
                utf8data.push(0x80 | (charCode >> 12)  & 0x3f);
                utf8data.push(0x80 | (charCode >> 6)  & 0x3f);
                utf8data.push(0x80 | charCode & 0x3f);
              }
            }

            writeTypeAndLength(3, utf8data.length);
            return writeUint8Array(utf8data);

          default:
            var length;
            if (Array.isArray(value)) {
              length = value.length;
              writeTypeAndLength(4, length);
              for (i = 0; i < length; ++i)
                encodeItem(value[i]);
            } else if (value instanceof Uint8Array) {
              writeTypeAndLength(2, value.length);
              writeUint8Array(value);
            } else {
              var keys = Object.keys(value);
              length = keys.length;
              writeTypeAndLength(5, length);
              for (i = 0; i < length; ++i) {
                var key = keys[i];
                encodeItem(key);
                encodeItem(value[key]);
              }
            }
        }
      }
      
      encodeItem(value);

      if ("slice" in data)
        return data.slice(0, offset);
      
      var ret = new ArrayBuffer(offset);
      var retView = new DataView(ret);
      for (var i = 0; i < offset; ++i)
        retView.setUint8(i, dataView.getUint8(i));
      return ret;
    }

    function decode(data, tagger, simpleValue) {
      var dataView = new DataView(data);
      var offset = 0;
      
      if (typeof tagger !== "function")
        tagger = function(value) { return value; };
      if (typeof simpleValue !== "function")
        simpleValue = function() { return undefined$1; };

      function read(value, length) {
        offset += length;
        return value;
      }
      function readArrayBuffer(length) {
        return read(new Uint8Array(data, offset, length), length);
      }
      function readFloat16() {
        var tempArrayBuffer = new ArrayBuffer(4);
        var tempDataView = new DataView(tempArrayBuffer);
        var value = readUint16();

        var sign = value & 0x8000;
        var exponent = value & 0x7c00;
        var fraction = value & 0x03ff;
        
        if (exponent === 0x7c00)
          exponent = 0xff << 10;
        else if (exponent !== 0)
          exponent += (127 - 15) << 10;
        else if (fraction !== 0)
          return fraction * POW_2_24;
        
        tempDataView.setUint32(0, sign << 16 | exponent << 13 | fraction << 13);
        return tempDataView.getFloat32(0);
      }
      function readFloat32() {
        return read(dataView.getFloat32(offset), 4);
      }
      function readFloat64() {
        return read(dataView.getFloat64(offset), 8);
      }
      function readUint8() {
        return read(dataView.getUint8(offset), 1);
      }
      function readUint16() {
        return read(dataView.getUint16(offset), 2);
      }
      function readUint32() {
        return read(dataView.getUint32(offset), 4);
      }
      function readUint64() {
        return readUint32() * POW_2_32 + readUint32();
      }
      function readBreak() {
        if (dataView.getUint8(offset) !== 0xff)
          return false;
        offset += 1;
        return true;
      }
      function readLength(additionalInformation) {
        if (additionalInformation < 24)
          return additionalInformation;
        if (additionalInformation === 24)
          return readUint8();
        if (additionalInformation === 25)
          return readUint16();
        if (additionalInformation === 26)
          return readUint32();
        if (additionalInformation === 27)
          return readUint64();
        if (additionalInformation === 31)
          return -1;
        throw "Invalid length encoding";
      }
      function readIndefiniteStringLength(majorType) {
        var initialByte = readUint8();
        if (initialByte === 0xff)
          return -1;
        var length = readLength(initialByte & 0x1f);
        if (length < 0 || (initialByte >> 5) !== majorType)
          throw "Invalid indefinite length element";
        return length;
      }

      function appendUtf16data(utf16data, length) {
        for (var i = 0; i < length; ++i) {
          var value = readUint8();
          if (value & 0x80) {
            if (value < 0xe0) {
              value = (value & 0x1f) <<  6
                    | (readUint8() & 0x3f);
              length -= 1;
            } else if (value < 0xf0) {
              value = (value & 0x0f) << 12
                    | (readUint8() & 0x3f) << 6
                    | (readUint8() & 0x3f);
              length -= 2;
            } else {
              value = (value & 0x0f) << 18
                    | (readUint8() & 0x3f) << 12
                    | (readUint8() & 0x3f) << 6
                    | (readUint8() & 0x3f);
              length -= 3;
            }
          }

          if (value < 0x10000) {
            utf16data.push(value);
          } else {
            value -= 0x10000;
            utf16data.push(0xd800 | (value >> 10));
            utf16data.push(0xdc00 | (value & 0x3ff));
          }
        }
      }

      function decodeItem() {
        var initialByte = readUint8();
        var majorType = initialByte >> 5;
        var additionalInformation = initialByte & 0x1f;
        var i;
        var length;

        if (majorType === 7) {
          switch (additionalInformation) {
            case 25:
              return readFloat16();
            case 26:
              return readFloat32();
            case 27:
              return readFloat64();
          }
        }

        length = readLength(additionalInformation);
        if (length < 0 && (majorType < 2 || 6 < majorType))
          throw "Invalid length";

        switch (majorType) {
          case 0:
            return length;
          case 1:
            return -1 - length;
          case 2:
            if (length < 0) {
              var elements = [];
              var fullArrayLength = 0;
              while ((length = readIndefiniteStringLength(majorType)) >= 0) {
                fullArrayLength += length;
                elements.push(readArrayBuffer(length));
              }
              var fullArray = new Uint8Array(fullArrayLength);
              var fullArrayOffset = 0;
              for (i = 0; i < elements.length; ++i) {
                fullArray.set(elements[i], fullArrayOffset);
                fullArrayOffset += elements[i].length;
              }
              return fullArray;
            }
            return readArrayBuffer(length);
          case 3:
            var utf16data = [];
            if (length < 0) {
              while ((length = readIndefiniteStringLength(majorType)) >= 0)
                appendUtf16data(utf16data, length);
            } else
              appendUtf16data(utf16data, length);
            return String.fromCharCode.apply(null, utf16data);
          case 4:
            var retArray;
            if (length < 0) {
              retArray = [];
              while (!readBreak())
                retArray.push(decodeItem());
            } else {
              retArray = new Array(length);
              for (i = 0; i < length; ++i)
                retArray[i] = decodeItem();
            }
            return retArray;
          case 5:
            var retObject = {};
            for (i = 0; i < length || length < 0 && !readBreak(); ++i) {
              var key = decodeItem();
              retObject[key] = decodeItem();
            }
            return retObject;
          case 6:
            return tagger(decodeItem(), length);
          case 7:
            switch (length) {
              case 20:
                return false;
              case 21:
                return true;
              case 22:
                return null;
              case 23:
                return undefined$1;
              default:
                return simpleValue(length);
            }
        }
      }

      var ret = decodeItem();
      if (offset !== data.byteLength)
        throw "Remaining bytes";
      return ret;
    }

    var obj = { encode: encode, decode: decode };

    if (typeof undefined$1 === "function" && undefined$1.amd)
      undefined$1("cbor/cbor", obj);
    else if (module.exports)
      module.exports = obj;
    else if (!global.CBOR)
      global.CBOR = obj;

    })(commonjsGlobal);
    }(cbor));

    var CborReader = cbor.exports;

    var uuid = {exports: {}};

    /*! lil-uuid - v0.1 - MIT License - https://github.com/lil-js/uuid */

    (function (module, exports) {
    (function (root, factory) {
      {
        factory(exports);
        if (module !== null) {
          module.exports = exports.uuid;
        }
      }
    }(commonjsGlobal, function (exports) {
      var VERSION = '0.1.0';
      var uuidRegex = {
        '3': /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
        '4': /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
        '5': /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
        all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i
      };

      function uuid() {
        var uuid = '', i, random;
        for (i = 0; i < 32; i++) {
          random = Math.random() * 16 | 0;
          if (i === 8 || i === 12 || i === 16 || i === 20) uuid += '-';
          uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return uuid
      }

      function isUUID(str, version) {
        var pattern = uuidRegex[version || 'all'];
        return pattern && pattern.test(str) || false
      }

      uuid.isUUID = isUUID;
      uuid.VERSION = VERSION;

      exports.uuid = uuid;
      exports.isUUID = isUUID;
    }));
    }(uuid, uuid.exports));

    var uuidGenerator$1 = uuid.exports;

    var uuidGenerator = {
        createUUID: function () {
            if (uuidGenerator$1.uuid) {
                return uuidGenerator$1.uuid();
            }
            return uuidGenerator$1();
        },
    };

    /*       */
    var PRESENCE_TIMEOUT_MINIMUM = 20;
    var PRESENCE_TIMEOUT_DEFAULT = 300;
    var makeDefaultOrigins = function () { return Array.from({ length: 20 }, function (_, i) { return "ps".concat(i + 1, ".pndsn.com"); }); };
    var default_1$b = /** @class */ (function () {
        function default_1(_a) {
            var setup = _a.setup;
            var _b, _c, _d;
            this._PNSDKSuffix = {};
            this.instanceId = "pn-".concat(uuidGenerator.createUUID());
            this.secretKey = setup.secretKey || setup.secret_key;
            this.subscribeKey = setup.subscribeKey || setup.subscribe_key;
            this.publishKey = setup.publishKey || setup.publish_key;
            this.sdkName = setup.sdkName;
            this.sdkFamily = setup.sdkFamily;
            this.partnerId = setup.partnerId;
            this.setAuthKey(setup.authKey);
            this.setCipherKey(setup.cipherKey);
            this.setFilterExpression(setup.filterExpression);
            if (typeof setup.origin !== 'string' && !Array.isArray(setup.origin) && setup.origin !== undefined) {
                throw new Error('Origin must be either undefined, a string or a list of strings.');
            }
            this.origin = setup.origin || makeDefaultOrigins();
            this.secure = setup.ssl || false;
            this.restore = setup.restore || false;
            this.proxy = setup.proxy;
            this.keepAlive = setup.keepAlive;
            this.keepAliveSettings = setup.keepAliveSettings;
            this.autoNetworkDetection = setup.autoNetworkDetection || false;
            this.dedupeOnSubscribe = setup.dedupeOnSubscribe || false;
            this.maximumCacheSize = setup.maximumCacheSize || 100;
            this.customEncrypt = setup.customEncrypt;
            this.customDecrypt = setup.customDecrypt;
            this.fileUploadPublishRetryLimit = (_b = setup.fileUploadPublishRetryLimit) !== null && _b !== void 0 ? _b : 5;
            this.useRandomIVs = (_c = setup.useRandomIVs) !== null && _c !== void 0 ? _c : true;
            // flag for beta subscribe feature enablement
            this.enableSubscribeBeta = (_d = setup.enableSubscribeBeta) !== null && _d !== void 0 ? _d : false;
            // if location config exist and we are in https, force secure to true.
            if (typeof location !== 'undefined' && location.protocol === 'https:') {
                this.secure = true;
            }
            this.logVerbosity = setup.logVerbosity || false;
            this.suppressLeaveEvents = setup.suppressLeaveEvents || false;
            this.announceFailedHeartbeats = setup.announceFailedHeartbeats || true;
            this.announceSuccessfulHeartbeats = setup.announceSuccessfulHeartbeats || false;
            this.useInstanceId = setup.useInstanceId || false;
            this.useRequestId = setup.useRequestId || false;
            this.requestMessageCountThreshold = setup.requestMessageCountThreshold;
            // set timeout to how long a transaction request will wait for the server (default 15 seconds)
            this.setTransactionTimeout(setup.transactionalRequestTimeout || 15 * 1000);
            // set timeout to how long a subscribe event loop will run (default 310 seconds)
            this.setSubscribeTimeout(setup.subscribeRequestTimeout || 310 * 1000);
            // set config on beacon (https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon) usage
            this.setSendBeaconConfig(setup.useSendBeacon || true);
            // how long the SDK will report the client to be alive before issuing a timeout
            if (setup.presenceTimeout) {
                this.setPresenceTimeout(setup.presenceTimeout);
            }
            else {
                this._presenceTimeout = PRESENCE_TIMEOUT_DEFAULT;
            }
            if (setup.heartbeatInterval != null) {
                this.setHeartbeatInterval(setup.heartbeatInterval);
            }
            this.setUUID(setup.uuid);
        }
        // exposed setters
        default_1.prototype.getAuthKey = function () {
            return this.authKey;
        };
        default_1.prototype.setAuthKey = function (val) {
            this.authKey = val;
            return this;
        };
        default_1.prototype.setCipherKey = function (val) {
            this.cipherKey = val;
            return this;
        };
        default_1.prototype.getUUID = function () {
            return this.UUID;
        };
        default_1.prototype.setUUID = function (val) {
            if (!val || typeof val !== 'string' || val.trim().length === 0) {
                throw new Error('Missing uuid parameter. Provide a valid string uuid');
            }
            this.UUID = val;
            return this;
        };
        default_1.prototype.getFilterExpression = function () {
            return this.filterExpression;
        };
        default_1.prototype.setFilterExpression = function (val) {
            this.filterExpression = val;
            return this;
        };
        default_1.prototype.getPresenceTimeout = function () {
            return this._presenceTimeout;
        };
        default_1.prototype.setPresenceTimeout = function (val) {
            if (val >= PRESENCE_TIMEOUT_MINIMUM) {
                this._presenceTimeout = val;
            }
            else {
                this._presenceTimeout = PRESENCE_TIMEOUT_MINIMUM;
                // eslint-disable-next-line no-console
                console.log('WARNING: Presence timeout is less than the minimum. Using minimum value: ', this._presenceTimeout);
            }
            this.setHeartbeatInterval(this._presenceTimeout / 2 - 1);
            return this;
        };
        default_1.prototype.setProxy = function (proxy) {
            this.proxy = proxy;
        };
        default_1.prototype.getHeartbeatInterval = function () {
            return this._heartbeatInterval;
        };
        default_1.prototype.setHeartbeatInterval = function (val) {
            this._heartbeatInterval = val;
            return this;
        };
        // deprecated setters.
        default_1.prototype.getSubscribeTimeout = function () {
            return this._subscribeRequestTimeout;
        };
        default_1.prototype.setSubscribeTimeout = function (val) {
            this._subscribeRequestTimeout = val;
            return this;
        };
        default_1.prototype.getTransactionTimeout = function () {
            return this._transactionalRequestTimeout;
        };
        default_1.prototype.setTransactionTimeout = function (val) {
            this._transactionalRequestTimeout = val;
            return this;
        };
        default_1.prototype.isSendBeaconEnabled = function () {
            return this._useSendBeacon;
        };
        default_1.prototype.setSendBeaconConfig = function (val) {
            this._useSendBeacon = val;
            return this;
        };
        default_1.prototype.getVersion = function () {
            return '6.0.0';
        };
        default_1.prototype._addPnsdkSuffix = function (name, suffix) {
            this._PNSDKSuffix[name] = suffix;
        };
        default_1.prototype._getPnsdkSuffix = function (separator) {
            var _this = this;
            return Object.keys(this._PNSDKSuffix).reduce(function (result, key) { return result + separator + _this._PNSDKSuffix[key]; }, '');
        };
        return default_1;
    }());

    /*eslint-disable */
    /*
     CryptoJS v3.1.2
     code.google.com/p/crypto-js
     (c) 2009-2013 by Jeff Mott. All rights reserved.
     code.google.com/p/crypto-js/wiki/License
     */
    var CryptoJS = CryptoJS ||
        (function (h, s) {
            var f = {}, g = (f.lib = {}), q = function () { }, m = (g.Base = {
                extend: function (a) {
                    q.prototype = this;
                    var c = new q();
                    a && c.mixIn(a);
                    c.hasOwnProperty('init') ||
                        (c.init = function () {
                            c.$super.init.apply(this, arguments);
                        });
                    c.init.prototype = c;
                    c.$super = this;
                    return c;
                },
                create: function () {
                    var a = this.extend();
                    a.init.apply(a, arguments);
                    return a;
                },
                init: function () { },
                mixIn: function (a) {
                    for (var c in a)
                        a.hasOwnProperty(c) && (this[c] = a[c]);
                    a.hasOwnProperty('toString') && (this.toString = a.toString);
                },
                clone: function () {
                    return this.init.prototype.extend(this);
                },
            }), r = (g.WordArray = m.extend({
                init: function (a, c) {
                    a = this.words = a || [];
                    this.sigBytes = c != s ? c : 4 * a.length;
                },
                toString: function (a) {
                    return (a || k).stringify(this);
                },
                concat: function (a) {
                    var c = this.words, d = a.words, b = this.sigBytes;
                    a = a.sigBytes;
                    this.clamp();
                    if (b % 4)
                        for (var e = 0; e < a; e++)
                            c[(b + e) >>> 2] |= ((d[e >>> 2] >>> (24 - 8 * (e % 4))) & 255) << (24 - 8 * ((b + e) % 4));
                    else if (65535 < d.length)
                        for (e = 0; e < a; e += 4)
                            c[(b + e) >>> 2] = d[e >>> 2];
                    else
                        c.push.apply(c, d);
                    this.sigBytes += a;
                    return this;
                },
                clamp: function () {
                    var a = this.words, c = this.sigBytes;
                    a[c >>> 2] &= 4294967295 << (32 - 8 * (c % 4));
                    a.length = h.ceil(c / 4);
                },
                clone: function () {
                    var a = m.clone.call(this);
                    a.words = this.words.slice(0);
                    return a;
                },
                random: function (a) {
                    for (var c = [], d = 0; d < a; d += 4)
                        c.push((4294967296 * h.random()) | 0);
                    return new r.init(c, a);
                },
            })), l = (f.enc = {}), k = (l.Hex = {
                stringify: function (a) {
                    var c = a.words;
                    a = a.sigBytes;
                    for (var d = [], b = 0; b < a; b++) {
                        var e = (c[b >>> 2] >>> (24 - 8 * (b % 4))) & 255;
                        d.push((e >>> 4).toString(16));
                        d.push((e & 15).toString(16));
                    }
                    return d.join('');
                },
                parse: function (a) {
                    for (var c = a.length, d = [], b = 0; b < c; b += 2)
                        d[b >>> 3] |= parseInt(a.substr(b, 2), 16) << (24 - 4 * (b % 8));
                    return new r.init(d, c / 2);
                },
            }), n = (l.Latin1 = {
                stringify: function (a) {
                    var c = a.words;
                    a = a.sigBytes;
                    for (var d = [], b = 0; b < a; b++)
                        d.push(String.fromCharCode((c[b >>> 2] >>> (24 - 8 * (b % 4))) & 255));
                    return d.join('');
                },
                parse: function (a) {
                    for (var c = a.length, d = [], b = 0; b < c; b++)
                        d[b >>> 2] |= (a.charCodeAt(b) & 255) << (24 - 8 * (b % 4));
                    return new r.init(d, c);
                },
            }), j = (l.Utf8 = {
                stringify: function (a) {
                    try {
                        return decodeURIComponent(escape(n.stringify(a)));
                    }
                    catch (c) {
                        throw Error('Malformed UTF-8 data');
                    }
                },
                parse: function (a) {
                    return n.parse(unescape(encodeURIComponent(a)));
                },
            }), u = (g.BufferedBlockAlgorithm = m.extend({
                reset: function () {
                    this._data = new r.init();
                    this._nDataBytes = 0;
                },
                _append: function (a) {
                    'string' == typeof a && (a = j.parse(a));
                    this._data.concat(a);
                    this._nDataBytes += a.sigBytes;
                },
                _process: function (a) {
                    var c = this._data, d = c.words, b = c.sigBytes, e = this.blockSize, f = b / (4 * e), f = a ? h.ceil(f) : h.max((f | 0) - this._minBufferSize, 0);
                    a = f * e;
                    b = h.min(4 * a, b);
                    if (a) {
                        for (var g = 0; g < a; g += e)
                            this._doProcessBlock(d, g);
                        g = d.splice(0, a);
                        c.sigBytes -= b;
                    }
                    return new r.init(g, b);
                },
                clone: function () {
                    var a = m.clone.call(this);
                    a._data = this._data.clone();
                    return a;
                },
                _minBufferSize: 0,
            }));
            g.Hasher = u.extend({
                cfg: m.extend(),
                init: function (a) {
                    this.cfg = this.cfg.extend(a);
                    this.reset();
                },
                reset: function () {
                    u.reset.call(this);
                    this._doReset();
                },
                update: function (a) {
                    this._append(a);
                    this._process();
                    return this;
                },
                finalize: function (a) {
                    a && this._append(a);
                    return this._doFinalize();
                },
                blockSize: 16,
                _createHelper: function (a) {
                    return function (c, d) {
                        return new a.init(d).finalize(c);
                    };
                },
                _createHmacHelper: function (a) {
                    return function (c, d) {
                        return new t.HMAC.init(a, d).finalize(c);
                    };
                },
            });
            var t = (f.algo = {});
            return f;
        })(Math);
    // SHA256
    (function (h) {
        for (var s = CryptoJS, f = s.lib, g = f.WordArray, q = f.Hasher, f = s.algo, m = [], r = [], l = function (a) {
            return (4294967296 * (a - (a | 0))) | 0;
        }, k = 2, n = 0; 64 > n;) {
            var j;
            a: {
                j = k;
                for (var u = h.sqrt(j), t = 2; t <= u; t++)
                    if (!(j % t)) {
                        j = !1;
                        break a;
                    }
                j = !0;
            }
            j && (8 > n && (m[n] = l(h.pow(k, 0.5))), (r[n] = l(h.pow(k, 1 / 3))), n++);
            k++;
        }
        var a = [], f = (f.SHA256 = q.extend({
            _doReset: function () {
                this._hash = new g.init(m.slice(0));
            },
            _doProcessBlock: function (c, d) {
                for (var b = this._hash.words, e = b[0], f = b[1], g = b[2], j = b[3], h = b[4], m = b[5], n = b[6], q = b[7], p = 0; 64 > p; p++) {
                    if (16 > p)
                        a[p] = c[d + p] | 0;
                    else {
                        var k = a[p - 15], l = a[p - 2];
                        a[p] =
                            (((k << 25) | (k >>> 7)) ^ ((k << 14) | (k >>> 18)) ^ (k >>> 3)) +
                                a[p - 7] +
                                (((l << 15) | (l >>> 17)) ^ ((l << 13) | (l >>> 19)) ^ (l >>> 10)) +
                                a[p - 16];
                    }
                    k =
                        q +
                            (((h << 26) | (h >>> 6)) ^ ((h << 21) | (h >>> 11)) ^ ((h << 7) | (h >>> 25))) +
                            ((h & m) ^ (~h & n)) +
                            r[p] +
                            a[p];
                    l =
                        (((e << 30) | (e >>> 2)) ^ ((e << 19) | (e >>> 13)) ^ ((e << 10) | (e >>> 22))) +
                            ((e & f) ^ (e & g) ^ (f & g));
                    q = n;
                    n = m;
                    m = h;
                    h = (j + k) | 0;
                    j = g;
                    g = f;
                    f = e;
                    e = (k + l) | 0;
                }
                b[0] = (b[0] + e) | 0;
                b[1] = (b[1] + f) | 0;
                b[2] = (b[2] + g) | 0;
                b[3] = (b[3] + j) | 0;
                b[4] = (b[4] + h) | 0;
                b[5] = (b[5] + m) | 0;
                b[6] = (b[6] + n) | 0;
                b[7] = (b[7] + q) | 0;
            },
            _doFinalize: function () {
                var a = this._data, d = a.words, b = 8 * this._nDataBytes, e = 8 * a.sigBytes;
                d[e >>> 5] |= 128 << (24 - (e % 32));
                d[(((e + 64) >>> 9) << 4) + 14] = h.floor(b / 4294967296);
                d[(((e + 64) >>> 9) << 4) + 15] = b;
                a.sigBytes = 4 * d.length;
                this._process();
                return this._hash;
            },
            clone: function () {
                var a = q.clone.call(this);
                a._hash = this._hash.clone();
                return a;
            },
        }));
        s.SHA256 = q._createHelper(f);
        s.HmacSHA256 = q._createHmacHelper(f);
    })(Math);
    // HMAC SHA256
    (function () {
        var h = CryptoJS, s = h.enc.Utf8;
        h.algo.HMAC = h.lib.Base.extend({
            init: function (f, g) {
                f = this._hasher = new f.init();
                'string' == typeof g && (g = s.parse(g));
                var h = f.blockSize, m = 4 * h;
                g.sigBytes > m && (g = f.finalize(g));
                g.clamp();
                for (var r = (this._oKey = g.clone()), l = (this._iKey = g.clone()), k = r.words, n = l.words, j = 0; j < h; j++)
                    (k[j] ^= 1549556828), (n[j] ^= 909522486);
                r.sigBytes = l.sigBytes = m;
                this.reset();
            },
            reset: function () {
                var f = this._hasher;
                f.reset();
                f.update(this._iKey);
            },
            update: function (f) {
                this._hasher.update(f);
                return this;
            },
            finalize: function (f) {
                var g = this._hasher;
                f = g.finalize(f);
                g.reset();
                return g.finalize(this._oKey.clone().concat(f));
            },
        });
    })();
    // Base64
    (function () {
        var u = CryptoJS, p = u.lib.WordArray;
        u.enc.Base64 = {
            stringify: function (d) {
                var l = d.words, p = d.sigBytes, t = this._map;
                d.clamp();
                d = [];
                for (var r = 0; r < p; r += 3)
                    for (var w = (((l[r >>> 2] >>> (24 - 8 * (r % 4))) & 255) << 16) |
                        (((l[(r + 1) >>> 2] >>> (24 - 8 * ((r + 1) % 4))) & 255) << 8) |
                        ((l[(r + 2) >>> 2] >>> (24 - 8 * ((r + 2) % 4))) & 255), v = 0; 4 > v && r + 0.75 * v < p; v++)
                        d.push(t.charAt((w >>> (6 * (3 - v))) & 63));
                if ((l = t.charAt(64)))
                    for (; d.length % 4;)
                        d.push(l);
                return d.join('');
            },
            parse: function (d) {
                var l = d.length, s = this._map, t = s.charAt(64);
                t && ((t = d.indexOf(t)), -1 != t && (l = t));
                for (var t = [], r = 0, w = 0; w < l; w++)
                    if (w % 4) {
                        var v = s.indexOf(d.charAt(w - 1)) << (2 * (w % 4)), b = s.indexOf(d.charAt(w)) >>> (6 - 2 * (w % 4));
                        t[r >>> 2] |= (v | b) << (24 - 8 * (r % 4));
                        r++;
                    }
                return p.create(t, r);
            },
            _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
        };
    })();
    // BlockCipher
    (function (u) {
        function p(b, n, a, c, e, j, k) {
            b = b + ((n & a) | (~n & c)) + e + k;
            return ((b << j) | (b >>> (32 - j))) + n;
        }
        function d(b, n, a, c, e, j, k) {
            b = b + ((n & c) | (a & ~c)) + e + k;
            return ((b << j) | (b >>> (32 - j))) + n;
        }
        function l(b, n, a, c, e, j, k) {
            b = b + (n ^ a ^ c) + e + k;
            return ((b << j) | (b >>> (32 - j))) + n;
        }
        function s(b, n, a, c, e, j, k) {
            b = b + (a ^ (n | ~c)) + e + k;
            return ((b << j) | (b >>> (32 - j))) + n;
        }
        for (var t = CryptoJS, r = t.lib, w = r.WordArray, v = r.Hasher, r = t.algo, b = [], x = 0; 64 > x; x++)
            b[x] = (4294967296 * u.abs(u.sin(x + 1))) | 0;
        r = r.MD5 = v.extend({
            _doReset: function () {
                this._hash = new w.init([1732584193, 4023233417, 2562383102, 271733878]);
            },
            _doProcessBlock: function (q, n) {
                for (var a = 0; 16 > a; a++) {
                    var c = n + a, e = q[c];
                    q[c] = (((e << 8) | (e >>> 24)) & 16711935) | (((e << 24) | (e >>> 8)) & 4278255360);
                }
                var a = this._hash.words, c = q[n + 0], e = q[n + 1], j = q[n + 2], k = q[n + 3], z = q[n + 4], r = q[n + 5], t = q[n + 6], w = q[n + 7], v = q[n + 8], A = q[n + 9], B = q[n + 10], C = q[n + 11], u = q[n + 12], D = q[n + 13], E = q[n + 14], x = q[n + 15], f = a[0], m = a[1], g = a[2], h = a[3], f = p(f, m, g, h, c, 7, b[0]), h = p(h, f, m, g, e, 12, b[1]), g = p(g, h, f, m, j, 17, b[2]), m = p(m, g, h, f, k, 22, b[3]), f = p(f, m, g, h, z, 7, b[4]), h = p(h, f, m, g, r, 12, b[5]), g = p(g, h, f, m, t, 17, b[6]), m = p(m, g, h, f, w, 22, b[7]), f = p(f, m, g, h, v, 7, b[8]), h = p(h, f, m, g, A, 12, b[9]), g = p(g, h, f, m, B, 17, b[10]), m = p(m, g, h, f, C, 22, b[11]), f = p(f, m, g, h, u, 7, b[12]), h = p(h, f, m, g, D, 12, b[13]), g = p(g, h, f, m, E, 17, b[14]), m = p(m, g, h, f, x, 22, b[15]), f = d(f, m, g, h, e, 5, b[16]), h = d(h, f, m, g, t, 9, b[17]), g = d(g, h, f, m, C, 14, b[18]), m = d(m, g, h, f, c, 20, b[19]), f = d(f, m, g, h, r, 5, b[20]), h = d(h, f, m, g, B, 9, b[21]), g = d(g, h, f, m, x, 14, b[22]), m = d(m, g, h, f, z, 20, b[23]), f = d(f, m, g, h, A, 5, b[24]), h = d(h, f, m, g, E, 9, b[25]), g = d(g, h, f, m, k, 14, b[26]), m = d(m, g, h, f, v, 20, b[27]), f = d(f, m, g, h, D, 5, b[28]), h = d(h, f, m, g, j, 9, b[29]), g = d(g, h, f, m, w, 14, b[30]), m = d(m, g, h, f, u, 20, b[31]), f = l(f, m, g, h, r, 4, b[32]), h = l(h, f, m, g, v, 11, b[33]), g = l(g, h, f, m, C, 16, b[34]), m = l(m, g, h, f, E, 23, b[35]), f = l(f, m, g, h, e, 4, b[36]), h = l(h, f, m, g, z, 11, b[37]), g = l(g, h, f, m, w, 16, b[38]), m = l(m, g, h, f, B, 23, b[39]), f = l(f, m, g, h, D, 4, b[40]), h = l(h, f, m, g, c, 11, b[41]), g = l(g, h, f, m, k, 16, b[42]), m = l(m, g, h, f, t, 23, b[43]), f = l(f, m, g, h, A, 4, b[44]), h = l(h, f, m, g, u, 11, b[45]), g = l(g, h, f, m, x, 16, b[46]), m = l(m, g, h, f, j, 23, b[47]), f = s(f, m, g, h, c, 6, b[48]), h = s(h, f, m, g, w, 10, b[49]), g = s(g, h, f, m, E, 15, b[50]), m = s(m, g, h, f, r, 21, b[51]), f = s(f, m, g, h, u, 6, b[52]), h = s(h, f, m, g, k, 10, b[53]), g = s(g, h, f, m, B, 15, b[54]), m = s(m, g, h, f, e, 21, b[55]), f = s(f, m, g, h, v, 6, b[56]), h = s(h, f, m, g, x, 10, b[57]), g = s(g, h, f, m, t, 15, b[58]), m = s(m, g, h, f, D, 21, b[59]), f = s(f, m, g, h, z, 6, b[60]), h = s(h, f, m, g, C, 10, b[61]), g = s(g, h, f, m, j, 15, b[62]), m = s(m, g, h, f, A, 21, b[63]);
                a[0] = (a[0] + f) | 0;
                a[1] = (a[1] + m) | 0;
                a[2] = (a[2] + g) | 0;
                a[3] = (a[3] + h) | 0;
            },
            _doFinalize: function () {
                var b = this._data, n = b.words, a = 8 * this._nDataBytes, c = 8 * b.sigBytes;
                n[c >>> 5] |= 128 << (24 - (c % 32));
                var e = u.floor(a / 4294967296);
                n[(((c + 64) >>> 9) << 4) + 15] = (((e << 8) | (e >>> 24)) & 16711935) | (((e << 24) | (e >>> 8)) & 4278255360);
                n[(((c + 64) >>> 9) << 4) + 14] = (((a << 8) | (a >>> 24)) & 16711935) | (((a << 24) | (a >>> 8)) & 4278255360);
                b.sigBytes = 4 * (n.length + 1);
                this._process();
                b = this._hash;
                n = b.words;
                for (a = 0; 4 > a; a++)
                    (c = n[a]), (n[a] = (((c << 8) | (c >>> 24)) & 16711935) | (((c << 24) | (c >>> 8)) & 4278255360));
                return b;
            },
            clone: function () {
                var b = v.clone.call(this);
                b._hash = this._hash.clone();
                return b;
            },
        });
        t.MD5 = v._createHelper(r);
        t.HmacMD5 = v._createHmacHelper(r);
    })(Math);
    (function () {
        var u = CryptoJS, p = u.lib, d = p.Base, l = p.WordArray, p = u.algo, s = (p.EvpKDF = d.extend({
            cfg: d.extend({ keySize: 4, hasher: p.MD5, iterations: 1 }),
            init: function (d) {
                this.cfg = this.cfg.extend(d);
            },
            compute: function (d, r) {
                for (var p = this.cfg, s = p.hasher.create(), b = l.create(), u = b.words, q = p.keySize, p = p.iterations; u.length < q;) {
                    n && s.update(n);
                    var n = s.update(d).finalize(r);
                    s.reset();
                    for (var a = 1; a < p; a++)
                        (n = s.finalize(n)), s.reset();
                    b.concat(n);
                }
                b.sigBytes = 4 * q;
                return b;
            },
        }));
        u.EvpKDF = function (d, l, p) {
            return s.create(p).compute(d, l);
        };
    })();
    // Cipher
    CryptoJS.lib.Cipher ||
        (function (u) {
            var p = CryptoJS, d = p.lib, l = d.Base, s = d.WordArray, t = d.BufferedBlockAlgorithm, r = p.enc.Base64, w = p.algo.EvpKDF, v = (d.Cipher = t.extend({
                cfg: l.extend(),
                createEncryptor: function (e, a) {
                    return this.create(this._ENC_XFORM_MODE, e, a);
                },
                createDecryptor: function (e, a) {
                    return this.create(this._DEC_XFORM_MODE, e, a);
                },
                init: function (e, a, b) {
                    this.cfg = this.cfg.extend(b);
                    this._xformMode = e;
                    this._key = a;
                    this.reset();
                },
                reset: function () {
                    t.reset.call(this);
                    this._doReset();
                },
                process: function (e) {
                    this._append(e);
                    return this._process();
                },
                finalize: function (e) {
                    e && this._append(e);
                    return this._doFinalize();
                },
                keySize: 4,
                ivSize: 4,
                _ENC_XFORM_MODE: 1,
                _DEC_XFORM_MODE: 2,
                _createHelper: function (e) {
                    return {
                        encrypt: function (b, k, d) {
                            return ('string' == typeof k ? c : a).encrypt(e, b, k, d);
                        },
                        decrypt: function (b, k, d) {
                            return ('string' == typeof k ? c : a).decrypt(e, b, k, d);
                        },
                    };
                },
            }));
            d.StreamCipher = v.extend({
                _doFinalize: function () {
                    return this._process(!0);
                },
                blockSize: 1,
            });
            var b = (p.mode = {}), x = function (e, a, b) {
                var c = this._iv;
                c ? (this._iv = u) : (c = this._prevBlock);
                for (var d = 0; d < b; d++)
                    e[a + d] ^= c[d];
            }, q = (d.BlockCipherMode = l.extend({
                createEncryptor: function (e, a) {
                    return this.Encryptor.create(e, a);
                },
                createDecryptor: function (e, a) {
                    return this.Decryptor.create(e, a);
                },
                init: function (e, a) {
                    this._cipher = e;
                    this._iv = a;
                },
            })).extend();
            q.Encryptor = q.extend({
                processBlock: function (e, a) {
                    var b = this._cipher, c = b.blockSize;
                    x.call(this, e, a, c);
                    b.encryptBlock(e, a);
                    this._prevBlock = e.slice(a, a + c);
                },
            });
            q.Decryptor = q.extend({
                processBlock: function (e, a) {
                    var b = this._cipher, c = b.blockSize, d = e.slice(a, a + c);
                    b.decryptBlock(e, a);
                    x.call(this, e, a, c);
                    this._prevBlock = d;
                },
            });
            b = b.CBC = q;
            q = (p.pad = {}).Pkcs7 = {
                pad: function (a, b) {
                    for (var c = 4 * b, c = c - (a.sigBytes % c), d = (c << 24) | (c << 16) | (c << 8) | c, l = [], n = 0; n < c; n += 4)
                        l.push(d);
                    c = s.create(l, c);
                    a.concat(c);
                },
                unpad: function (a) {
                    a.sigBytes -= a.words[(a.sigBytes - 1) >>> 2] & 255;
                },
            };
            d.BlockCipher = v.extend({
                cfg: v.cfg.extend({ mode: b, padding: q }),
                reset: function () {
                    v.reset.call(this);
                    var a = this.cfg, b = a.iv, a = a.mode;
                    if (this._xformMode == this._ENC_XFORM_MODE)
                        var c = a.createEncryptor;
                    else
                        (c = a.createDecryptor), (this._minBufferSize = 1);
                    this._mode = c.call(a, this, b && b.words);
                },
                _doProcessBlock: function (a, b) {
                    this._mode.processBlock(a, b);
                },
                _doFinalize: function () {
                    var a = this.cfg.padding;
                    if (this._xformMode == this._ENC_XFORM_MODE) {
                        a.pad(this._data, this.blockSize);
                        var b = this._process(!0);
                    }
                    else
                        (b = this._process(!0)), a.unpad(b);
                    return b;
                },
                blockSize: 4,
            });
            var n = (d.CipherParams = l.extend({
                init: function (a) {
                    this.mixIn(a);
                },
                toString: function (a) {
                    return (a || this.formatter).stringify(this);
                },
            })), b = ((p.format = {}).OpenSSL = {
                stringify: function (a) {
                    var b = a.ciphertext;
                    a = a.salt;
                    return (a ? s.create([1398893684, 1701076831]).concat(a).concat(b) : b).toString(r);
                },
                parse: function (a) {
                    a = r.parse(a);
                    var b = a.words;
                    if (1398893684 == b[0] && 1701076831 == b[1]) {
                        var c = s.create(b.slice(2, 4));
                        b.splice(0, 4);
                        a.sigBytes -= 16;
                    }
                    return n.create({ ciphertext: a, salt: c });
                },
            }), a = (d.SerializableCipher = l.extend({
                cfg: l.extend({ format: b }),
                encrypt: function (a, b, c, d) {
                    d = this.cfg.extend(d);
                    var l = a.createEncryptor(c, d);
                    b = l.finalize(b);
                    l = l.cfg;
                    return n.create({
                        ciphertext: b,
                        key: c,
                        iv: l.iv,
                        algorithm: a,
                        mode: l.mode,
                        padding: l.padding,
                        blockSize: a.blockSize,
                        formatter: d.format,
                    });
                },
                decrypt: function (a, b, c, d) {
                    d = this.cfg.extend(d);
                    b = this._parse(b, d.format);
                    return a.createDecryptor(c, d).finalize(b.ciphertext);
                },
                _parse: function (a, b) {
                    return 'string' == typeof a ? b.parse(a, this) : a;
                },
            })), p = ((p.kdf = {}).OpenSSL = {
                execute: function (a, b, c, d) {
                    d || (d = s.random(8));
                    a = w.create({ keySize: b + c }).compute(a, d);
                    c = s.create(a.words.slice(b), 4 * c);
                    a.sigBytes = 4 * b;
                    return n.create({ key: a, iv: c, salt: d });
                },
            }), c = (d.PasswordBasedCipher = a.extend({
                cfg: a.cfg.extend({ kdf: p }),
                encrypt: function (b, c, d, l) {
                    l = this.cfg.extend(l);
                    d = l.kdf.execute(d, b.keySize, b.ivSize);
                    l.iv = d.iv;
                    b = a.encrypt.call(this, b, c, d.key, l);
                    b.mixIn(d);
                    return b;
                },
                decrypt: function (b, c, d, l) {
                    l = this.cfg.extend(l);
                    c = this._parse(c, l.format);
                    d = l.kdf.execute(d, b.keySize, b.ivSize, c.salt);
                    l.iv = d.iv;
                    return a.decrypt.call(this, b, c, d.key, l);
                },
            }));
        })();
    // AES
    (function () {
        for (var u = CryptoJS, p = u.lib.BlockCipher, d = u.algo, l = [], s = [], t = [], r = [], w = [], v = [], b = [], x = [], q = [], n = [], a = [], c = 0; 256 > c; c++)
            a[c] = 128 > c ? c << 1 : (c << 1) ^ 283;
        for (var e = 0, j = 0, c = 0; 256 > c; c++) {
            var k = j ^ (j << 1) ^ (j << 2) ^ (j << 3) ^ (j << 4), k = (k >>> 8) ^ (k & 255) ^ 99;
            l[e] = k;
            s[k] = e;
            var z = a[e], F = a[z], G = a[F], y = (257 * a[k]) ^ (16843008 * k);
            t[e] = (y << 24) | (y >>> 8);
            r[e] = (y << 16) | (y >>> 16);
            w[e] = (y << 8) | (y >>> 24);
            v[e] = y;
            y = (16843009 * G) ^ (65537 * F) ^ (257 * z) ^ (16843008 * e);
            b[k] = (y << 24) | (y >>> 8);
            x[k] = (y << 16) | (y >>> 16);
            q[k] = (y << 8) | (y >>> 24);
            n[k] = y;
            e ? ((e = z ^ a[a[a[G ^ z]]]), (j ^= a[a[j]])) : (e = j = 1);
        }
        var H = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54], d = (d.AES = p.extend({
            _doReset: function () {
                for (var a = this._key, c = a.words, d = a.sigBytes / 4, a = 4 * ((this._nRounds = d + 6) + 1), e = (this._keySchedule = []), j = 0; j < a; j++)
                    if (j < d)
                        e[j] = c[j];
                    else {
                        var k = e[j - 1];
                        j % d
                            ? 6 < d &&
                                4 == j % d &&
                                (k = (l[k >>> 24] << 24) | (l[(k >>> 16) & 255] << 16) | (l[(k >>> 8) & 255] << 8) | l[k & 255])
                            : ((k = (k << 8) | (k >>> 24)),
                                (k = (l[k >>> 24] << 24) | (l[(k >>> 16) & 255] << 16) | (l[(k >>> 8) & 255] << 8) | l[k & 255]),
                                (k ^= H[(j / d) | 0] << 24));
                        e[j] = e[j - d] ^ k;
                    }
                c = this._invKeySchedule = [];
                for (d = 0; d < a; d++)
                    (j = a - d),
                        (k = d % 4 ? e[j] : e[j - 4]),
                        (c[d] =
                            4 > d || 4 >= j ? k : b[l[k >>> 24]] ^ x[l[(k >>> 16) & 255]] ^ q[l[(k >>> 8) & 255]] ^ n[l[k & 255]]);
            },
            encryptBlock: function (a, b) {
                this._doCryptBlock(a, b, this._keySchedule, t, r, w, v, l);
            },
            decryptBlock: function (a, c) {
                var d = a[c + 1];
                a[c + 1] = a[c + 3];
                a[c + 3] = d;
                this._doCryptBlock(a, c, this._invKeySchedule, b, x, q, n, s);
                d = a[c + 1];
                a[c + 1] = a[c + 3];
                a[c + 3] = d;
            },
            _doCryptBlock: function (a, b, c, d, e, j, l, f) {
                for (var m = this._nRounds, g = a[b] ^ c[0], h = a[b + 1] ^ c[1], k = a[b + 2] ^ c[2], n = a[b + 3] ^ c[3], p = 4, r = 1; r < m; r++)
                    var q = d[g >>> 24] ^ e[(h >>> 16) & 255] ^ j[(k >>> 8) & 255] ^ l[n & 255] ^ c[p++], s = d[h >>> 24] ^ e[(k >>> 16) & 255] ^ j[(n >>> 8) & 255] ^ l[g & 255] ^ c[p++], t = d[k >>> 24] ^ e[(n >>> 16) & 255] ^ j[(g >>> 8) & 255] ^ l[h & 255] ^ c[p++], n = d[n >>> 24] ^ e[(g >>> 16) & 255] ^ j[(h >>> 8) & 255] ^ l[k & 255] ^ c[p++], g = q, h = s, k = t;
                q = ((f[g >>> 24] << 24) | (f[(h >>> 16) & 255] << 16) | (f[(k >>> 8) & 255] << 8) | f[n & 255]) ^ c[p++];
                s = ((f[h >>> 24] << 24) | (f[(k >>> 16) & 255] << 16) | (f[(n >>> 8) & 255] << 8) | f[g & 255]) ^ c[p++];
                t = ((f[k >>> 24] << 24) | (f[(n >>> 16) & 255] << 16) | (f[(g >>> 8) & 255] << 8) | f[h & 255]) ^ c[p++];
                n = ((f[n >>> 24] << 24) | (f[(g >>> 16) & 255] << 16) | (f[(h >>> 8) & 255] << 8) | f[k & 255]) ^ c[p++];
                a[b] = q;
                a[b + 1] = s;
                a[b + 2] = t;
                a[b + 3] = n;
            },
            keySize: 8,
        }));
        u.AES = p._createHelper(d);
    })();
    // Mode ECB
    CryptoJS.mode.ECB = (function () {
        var ECB = CryptoJS.lib.BlockCipherMode.extend();
        ECB.Encryptor = ECB.extend({
            processBlock: function (words, offset) {
                this._cipher.encryptBlock(words, offset);
            },
        });
        ECB.Decryptor = ECB.extend({
            processBlock: function (words, offset) {
                this._cipher.decryptBlock(words, offset);
            },
        });
        return ECB;
    })();
    var hmacSha256 = CryptoJS;

    /*       */
    function bufferToWordArray(b) {
        var wa = [];
        var i;
        for (i = 0; i < b.length; i += 1) {
            // eslint-disable-next-line no-bitwise
            wa[(i / 4) | 0] |= b[i] << (24 - 8 * i);
        }
        return hmacSha256.lib.WordArray.create(wa, b.length);
    }
    var default_1$a = /** @class */ (function () {
        function default_1(_a) {
            var config = _a.config;
            this._config = config;
            this._iv = '0123456789012345';
            this._allowedKeyEncodings = ['hex', 'utf8', 'base64', 'binary'];
            this._allowedKeyLengths = [128, 256];
            this._allowedModes = ['ecb', 'cbc'];
            this._defaultOptions = {
                encryptKey: true,
                keyEncoding: 'utf8',
                keyLength: 256,
                mode: 'cbc',
            };
        }
        default_1.prototype.HMACSHA256 = function (data) {
            var hash = hmacSha256.HmacSHA256(data, this._config.secretKey);
            return hash.toString(hmacSha256.enc.Base64);
        };
        default_1.prototype.SHA256 = function (s) {
            return hmacSha256.SHA256(s).toString(hmacSha256.enc.Hex);
        };
        default_1.prototype._parseOptions = function (incomingOptions) {
            // Defaults
            var options = incomingOptions || {};
            if (!options.hasOwnProperty('encryptKey'))
                options.encryptKey = this._defaultOptions.encryptKey;
            if (!options.hasOwnProperty('keyEncoding'))
                options.keyEncoding = this._defaultOptions.keyEncoding;
            if (!options.hasOwnProperty('keyLength'))
                options.keyLength = this._defaultOptions.keyLength;
            if (!options.hasOwnProperty('mode'))
                options.mode = this._defaultOptions.mode;
            // Validation
            if (this._allowedKeyEncodings.indexOf(options.keyEncoding.toLowerCase()) === -1) {
                options.keyEncoding = this._defaultOptions.keyEncoding;
            }
            if (this._allowedKeyLengths.indexOf(parseInt(options.keyLength, 10)) === -1) {
                options.keyLength = this._defaultOptions.keyLength;
            }
            if (this._allowedModes.indexOf(options.mode.toLowerCase()) === -1) {
                options.mode = this._defaultOptions.mode;
            }
            return options;
        };
        default_1.prototype._decodeKey = function (key, options) {
            if (options.keyEncoding === 'base64') {
                return hmacSha256.enc.Base64.parse(key);
            }
            if (options.keyEncoding === 'hex') {
                return hmacSha256.enc.Hex.parse(key);
            }
            return key;
        };
        default_1.prototype._getPaddedKey = function (key, options) {
            key = this._decodeKey(key, options);
            if (options.encryptKey) {
                return hmacSha256.enc.Utf8.parse(this.SHA256(key).slice(0, 32));
            }
            return key;
        };
        default_1.prototype._getMode = function (options) {
            if (options.mode === 'ecb') {
                return hmacSha256.mode.ECB;
            }
            return hmacSha256.mode.CBC;
        };
        default_1.prototype._getIV = function (options) {
            return options.mode === 'cbc' ? hmacSha256.enc.Utf8.parse(this._iv) : null;
        };
        default_1.prototype._getRandomIV = function () {
            return hmacSha256.lib.WordArray.random(16);
        };
        default_1.prototype.encrypt = function (data, customCipherKey, options) {
            if (this._config.customEncrypt) {
                return this._config.customEncrypt(data);
            }
            return this.pnEncrypt(data, customCipherKey, options);
        };
        default_1.prototype.decrypt = function (data, customCipherKey, options) {
            if (this._config.customDecrypt) {
                return this._config.customDecrypt(data);
            }
            return this.pnDecrypt(data, customCipherKey, options);
        };
        default_1.prototype.pnEncrypt = function (data, customCipherKey, options) {
            if (!customCipherKey && !this._config.cipherKey)
                return data;
            options = this._parseOptions(options);
            var mode = this._getMode(options);
            var cipherKey = this._getPaddedKey(customCipherKey || this._config.cipherKey, options);
            if (this._config.useRandomIVs) {
                var waIv = this._getRandomIV();
                var waPayload = hmacSha256.AES.encrypt(data, cipherKey, { iv: waIv, mode: mode }).ciphertext;
                return waIv.clone().concat(waPayload.clone()).toString(hmacSha256.enc.Base64);
            }
            var iv = this._getIV(options);
            var encryptedHexArray = hmacSha256.AES.encrypt(data, cipherKey, { iv: iv, mode: mode }).ciphertext;
            var base64Encrypted = encryptedHexArray.toString(hmacSha256.enc.Base64);
            return base64Encrypted || data;
        };
        default_1.prototype.pnDecrypt = function (data, customCipherKey, options) {
            if (!customCipherKey && !this._config.cipherKey)
                return data;
            options = this._parseOptions(options);
            var mode = this._getMode(options);
            var cipherKey = this._getPaddedKey(customCipherKey || this._config.cipherKey, options);
            if (this._config.useRandomIVs) {
                var ciphertext = Buffer.from(data, 'base64');
                var iv = bufferToWordArray(ciphertext.slice(0, 16));
                var payload = bufferToWordArray(ciphertext.slice(16));
                try {
                    var plainJSON = hmacSha256.AES.decrypt({ ciphertext: payload }, cipherKey, { iv: iv, mode: mode }).toString(hmacSha256.enc.Utf8);
                    var plaintext = JSON.parse(plainJSON);
                    return plaintext;
                }
                catch (e) {
                    return null;
                }
            }
            else {
                var iv = this._getIV(options);
                try {
                    var ciphertext = hmacSha256.enc.Base64.parse(data);
                    var plainJSON = hmacSha256.AES.decrypt({ ciphertext: ciphertext }, cipherKey, { iv: iv, mode: mode }).toString(hmacSha256.enc.Utf8);
                    var plaintext = JSON.parse(plainJSON);
                    return plaintext;
                }
                catch (e) {
                    return null;
                }
            }
        };
        return default_1;
    }());

    var default_1$9 = /** @class */ (function () {
        function default_1(_a) {
            var timeEndpoint = _a.timeEndpoint;
            this._timeEndpoint = timeEndpoint;
        }
        default_1.prototype.onReconnection = function (reconnectionCallback) {
            this._reconnectionCallback = reconnectionCallback;
        };
        default_1.prototype.startPolling = function () {
            this._timeTimer = setInterval(this._performTimeLoop.bind(this), 3000);
        };
        default_1.prototype.stopPolling = function () {
            clearInterval(this._timeTimer);
        };
        default_1.prototype._performTimeLoop = function () {
            var _this = this;
            this._timeEndpoint(function (status) {
                if (!status.error) {
                    clearInterval(_this._timeTimer);
                    _this._reconnectionCallback();
                }
            });
        };
        return default_1;
    }());

    /*       */
    var hashCode = function (payload) {
        var hash = 0;
        if (payload.length === 0)
            return hash;
        for (var i = 0; i < payload.length; i += 1) {
            var character = payload.charCodeAt(i);
            hash = (hash << 5) - hash + character; // eslint-disable-line
            hash = hash & hash; // eslint-disable-line
        }
        return hash;
    };
    var default_1$8 = /** @class */ (function () {
        function default_1(_a) {
            var config = _a.config;
            this.hashHistory = [];
            this._config = config;
        }
        default_1.prototype.getKey = function (message) {
            var hashedPayload = hashCode(JSON.stringify(message.payload)).toString();
            var timetoken = message.publishMetaData.publishTimetoken;
            return "".concat(timetoken, "-").concat(hashedPayload);
        };
        default_1.prototype.isDuplicate = function (message) {
            return this.hashHistory.includes(this.getKey(message));
        };
        default_1.prototype.addEntry = function (message) {
            if (this.hashHistory.length >= this._config.maximumCacheSize) {
                this.hashHistory.shift();
            }
            this.hashHistory.push(this.getKey(message));
        };
        default_1.prototype.clearHistory = function () {
            this.hashHistory = [];
        };
        return default_1;
    }());

    /*       */
    function objectToList(o) {
        var l = [];
        Object.keys(o).forEach(function (key) { return l.push(key); });
        return l;
    }
    function encodeString(input) {
        return encodeURIComponent(input).replace(/[!~*'()]/g, function (x) { return "%".concat(x.charCodeAt(0).toString(16).toUpperCase()); });
    }
    function objectToListSorted(o) {
        return objectToList(o).sort();
    }
    function signPamFromParams(params) {
        var l = objectToListSorted(params);
        return l.map(function (paramKey) { return "".concat(paramKey, "=").concat(encodeString(params[paramKey])); }).join('&');
    }
    function endsWith(searchString, suffix) {
        return searchString.indexOf(suffix, this.length - suffix.length) !== -1;
    }
    function createPromise() {
        var successResolve;
        var failureResolve;
        var promise = new Promise(function (fulfill, reject) {
            successResolve = fulfill;
            failureResolve = reject;
        });
        return { promise: promise, reject: failureResolve, fulfill: successResolve };
    }
    var deprecationMessage = "The Objects v1 API has been deprecated.\nYou can learn more about Objects v2 API at https://www.pubnub.com/docs/web-javascript/api-reference-objects.\nIf you have questions about the Objects v2 API or require additional help with migrating to the new data model,\nplease contact PubNub Support at support@pubnub.com.";
    function deprecated(fn) {
        return function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (typeof process !== 'undefined') {
                if (((_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a.NODE_ENV) !== 'test') {
                    // eslint-disable-next-line no-console
                    console.warn(deprecationMessage);
                }
            }
            return fn.apply(void 0, __spreadArray([], __read(args), false));
        };
    }
    var utils$5 = {
        signPamFromParams: signPamFromParams,
        endsWith: endsWith,
        createPromise: createPromise,
        encodeString: encodeString,
        deprecated: deprecated,
    };

    /*       */
    var categories = {
        // SDK will announce when the network appears to be connected again.
        PNNetworkUpCategory: 'PNNetworkUpCategory',
        // SDK will announce when the network appears to down.
        PNNetworkDownCategory: 'PNNetworkDownCategory',
        // call failed when network was unable to complete the call.
        PNNetworkIssuesCategory: 'PNNetworkIssuesCategory',
        // network call timed out
        PNTimeoutCategory: 'PNTimeoutCategory',
        // server responded with bad response
        PNBadRequestCategory: 'PNBadRequestCategory',
        // server responded with access denied
        PNAccessDeniedCategory: 'PNAccessDeniedCategory',
        // something strange happened; please check the logs.
        PNUnknownCategory: 'PNUnknownCategory',
        // on reconnection
        PNReconnectedCategory: 'PNReconnectedCategory',
        PNConnectedCategory: 'PNConnectedCategory',
        PNRequestMessageCountExceededCategory: 'PNRequestMessageCountExceededCategory',
    };

    var default_1$7 = /** @class */ (function () {
        function default_1(_a) {
            var subscribeEndpoint = _a.subscribeEndpoint, leaveEndpoint = _a.leaveEndpoint, heartbeatEndpoint = _a.heartbeatEndpoint, setStateEndpoint = _a.setStateEndpoint, timeEndpoint = _a.timeEndpoint, getFileUrl = _a.getFileUrl, config = _a.config, crypto = _a.crypto, listenerManager = _a.listenerManager;
            this._listenerManager = listenerManager;
            this._config = config;
            this._leaveEndpoint = leaveEndpoint;
            this._heartbeatEndpoint = heartbeatEndpoint;
            this._setStateEndpoint = setStateEndpoint;
            this._subscribeEndpoint = subscribeEndpoint;
            this._getFileUrl = getFileUrl;
            this._crypto = crypto;
            this._channels = {};
            this._presenceChannels = {};
            this._heartbeatChannels = {};
            this._heartbeatChannelGroups = {};
            this._channelGroups = {};
            this._presenceChannelGroups = {};
            this._pendingChannelSubscriptions = [];
            this._pendingChannelGroupSubscriptions = [];
            this._currentTimetoken = 0;
            this._lastTimetoken = 0;
            this._storedTimetoken = null;
            this._subscriptionStatusAnnounced = false;
            this._isOnline = true;
            this._reconnectionManager = new default_1$9({ timeEndpoint: timeEndpoint });
            this._dedupingManager = new default_1$8({ config: config });
        }
        default_1.prototype.adaptStateChange = function (args, callback) {
            var _this = this;
            var state = args.state, _a = args.channels, channels = _a === void 0 ? [] : _a, _b = args.channelGroups, channelGroups = _b === void 0 ? [] : _b;
            channels.forEach(function (channel) {
                if (channel in _this._channels)
                    _this._channels[channel].state = state;
            });
            channelGroups.forEach(function (channelGroup) {
                if (channelGroup in _this._channelGroups) {
                    _this._channelGroups[channelGroup].state = state;
                }
            });
            return this._setStateEndpoint({ state: state, channels: channels, channelGroups: channelGroups }, callback);
        };
        default_1.prototype.adaptPresenceChange = function (args) {
            var _this = this;
            var connected = args.connected, _a = args.channels, channels = _a === void 0 ? [] : _a, _b = args.channelGroups, channelGroups = _b === void 0 ? [] : _b;
            if (connected) {
                channels.forEach(function (channel) {
                    _this._heartbeatChannels[channel] = { state: {} };
                });
                channelGroups.forEach(function (channelGroup) {
                    _this._heartbeatChannelGroups[channelGroup] = { state: {} };
                });
            }
            else {
                channels.forEach(function (channel) {
                    if (channel in _this._heartbeatChannels) {
                        delete _this._heartbeatChannels[channel];
                    }
                });
                channelGroups.forEach(function (channelGroup) {
                    if (channelGroup in _this._heartbeatChannelGroups) {
                        delete _this._heartbeatChannelGroups[channelGroup];
                    }
                });
                if (this._config.suppressLeaveEvents === false) {
                    this._leaveEndpoint({ channels: channels, channelGroups: channelGroups }, function (status) {
                        _this._listenerManager.announceStatus(status);
                    });
                }
            }
            this.reconnect();
        };
        default_1.prototype.adaptSubscribeChange = function (args) {
            var _this = this;
            var timetoken = args.timetoken, _a = args.channels, channels = _a === void 0 ? [] : _a, _b = args.channelGroups, channelGroups = _b === void 0 ? [] : _b, _c = args.withPresence, withPresence = _c === void 0 ? false : _c, _d = args.withHeartbeats, withHeartbeats = _d === void 0 ? false : _d;
            if (!this._config.subscribeKey || this._config.subscribeKey === '') {
                // eslint-disable-next-line
                if (console && console.log) {
                    console.log('subscribe key missing; aborting subscribe'); //eslint-disable-line
                }
                return;
            }
            if (timetoken) {
                this._lastTimetoken = this._currentTimetoken;
                this._currentTimetoken = timetoken;
            }
            // reset the current timetoken to get a connect event.
            // $FlowFixMe
            if (this._currentTimetoken !== '0' && this._currentTimetoken !== 0) {
                this._storedTimetoken = this._currentTimetoken;
                this._currentTimetoken = 0;
            }
            channels.forEach(function (channel) {
                _this._channels[channel] = { state: {} };
                if (withPresence)
                    _this._presenceChannels[channel] = {};
                if (withHeartbeats || _this._config.getHeartbeatInterval())
                    _this._heartbeatChannels[channel] = {};
                _this._pendingChannelSubscriptions.push(channel);
            });
            channelGroups.forEach(function (channelGroup) {
                _this._channelGroups[channelGroup] = { state: {} };
                if (withPresence)
                    _this._presenceChannelGroups[channelGroup] = {};
                if (withHeartbeats || _this._config.getHeartbeatInterval())
                    _this._heartbeatChannelGroups[channelGroup] = {};
                _this._pendingChannelGroupSubscriptions.push(channelGroup);
            });
            this._subscriptionStatusAnnounced = false;
            this.reconnect();
        };
        default_1.prototype.adaptUnsubscribeChange = function (args, isOffline) {
            var _this = this;
            var _a = args.channels, channels = _a === void 0 ? [] : _a, _b = args.channelGroups, channelGroups = _b === void 0 ? [] : _b;
            // keep track of which channels and channel groups
            // we are going to unsubscribe from.
            var actualChannels = [];
            var actualChannelGroups = [];
            //
            channels.forEach(function (channel) {
                if (channel in _this._channels) {
                    delete _this._channels[channel];
                    actualChannels.push(channel);
                    if (channel in _this._heartbeatChannels) {
                        delete _this._heartbeatChannels[channel];
                    }
                }
                if (channel in _this._presenceChannels) {
                    delete _this._presenceChannels[channel];
                    actualChannels.push(channel);
                }
            });
            channelGroups.forEach(function (channelGroup) {
                if (channelGroup in _this._channelGroups) {
                    delete _this._channelGroups[channelGroup];
                    actualChannelGroups.push(channelGroup);
                    if (channelGroup in _this._heartbeatChannelGroups) {
                        delete _this._heartbeatChannelGroups[channelGroup];
                    }
                }
                if (channelGroup in _this._presenceChannelGroups) {
                    delete _this._presenceChannelGroups[channelGroup];
                    actualChannelGroups.push(channelGroup);
                }
            });
            // no-op if there are no channels and cg's to unsubscribe from.
            if (actualChannels.length === 0 && actualChannelGroups.length === 0) {
                return;
            }
            if (this._config.suppressLeaveEvents === false && !isOffline) {
                this._leaveEndpoint({ channels: actualChannels, channelGroups: actualChannelGroups }, function (status) {
                    status.affectedChannels = actualChannels;
                    status.affectedChannelGroups = actualChannelGroups;
                    status.currentTimetoken = _this._currentTimetoken;
                    status.lastTimetoken = _this._lastTimetoken;
                    _this._listenerManager.announceStatus(status);
                });
            }
            // if we have nothing to subscribe to, reset the timetoken.
            if (Object.keys(this._channels).length === 0 &&
                Object.keys(this._presenceChannels).length === 0 &&
                Object.keys(this._channelGroups).length === 0 &&
                Object.keys(this._presenceChannelGroups).length === 0) {
                this._lastTimetoken = 0;
                this._currentTimetoken = 0;
                this._storedTimetoken = null;
                this._region = null;
                this._reconnectionManager.stopPolling();
            }
            this.reconnect();
        };
        default_1.prototype.unsubscribeAll = function (isOffline) {
            this.adaptUnsubscribeChange({
                channels: this.getSubscribedChannels(),
                channelGroups: this.getSubscribedChannelGroups(),
            }, isOffline);
        };
        default_1.prototype.getHeartbeatChannels = function () {
            return Object.keys(this._heartbeatChannels);
        };
        default_1.prototype.getHeartbeatChannelGroups = function () {
            return Object.keys(this._heartbeatChannelGroups);
        };
        default_1.prototype.getSubscribedChannels = function () {
            return Object.keys(this._channels);
        };
        default_1.prototype.getSubscribedChannelGroups = function () {
            return Object.keys(this._channelGroups);
        };
        default_1.prototype.reconnect = function () {
            this._startSubscribeLoop();
            this._registerHeartbeatTimer();
        };
        default_1.prototype.disconnect = function () {
            this._stopSubscribeLoop();
            this._stopHeartbeatTimer();
            this._reconnectionManager.stopPolling();
        };
        default_1.prototype._registerHeartbeatTimer = function () {
            this._stopHeartbeatTimer();
            // if the interval is 0 or undefined, do not queue up heartbeating
            if (this._config.getHeartbeatInterval() === 0 || this._config.getHeartbeatInterval() === undefined) {
                return;
            }
            this._performHeartbeatLoop();
            // $FlowFixMe
            this._heartbeatTimer = setInterval(this._performHeartbeatLoop.bind(this), this._config.getHeartbeatInterval() * 1000);
        };
        default_1.prototype._stopHeartbeatTimer = function () {
            if (this._heartbeatTimer) {
                // $FlowFixMe
                clearInterval(this._heartbeatTimer);
                this._heartbeatTimer = null;
            }
        };
        default_1.prototype._performHeartbeatLoop = function () {
            var _this = this;
            var heartbeatChannels = this.getHeartbeatChannels();
            var heartbeatChannelGroups = this.getHeartbeatChannelGroups();
            var presenceState = {};
            if (heartbeatChannels.length === 0 && heartbeatChannelGroups.length === 0) {
                return;
            }
            this.getSubscribedChannels().forEach(function (channel) {
                var channelState = _this._channels[channel].state;
                if (Object.keys(channelState).length) {
                    presenceState[channel] = channelState;
                }
            });
            this.getSubscribedChannelGroups().forEach(function (channelGroup) {
                var channelGroupState = _this._channelGroups[channelGroup].state;
                if (Object.keys(channelGroupState).length) {
                    presenceState[channelGroup] = channelGroupState;
                }
            });
            var onHeartbeat = function (status) {
                if (status.error && _this._config.announceFailedHeartbeats) {
                    _this._listenerManager.announceStatus(status);
                }
                if (status.error && _this._config.autoNetworkDetection && _this._isOnline) {
                    _this._isOnline = false;
                    _this.disconnect();
                    _this._listenerManager.announceNetworkDown();
                    _this.reconnect();
                }
                if (!status.error && _this._config.announceSuccessfulHeartbeats) {
                    _this._listenerManager.announceStatus(status);
                }
            };
            this._heartbeatEndpoint({
                channels: heartbeatChannels,
                channelGroups: heartbeatChannelGroups,
                state: presenceState,
            }, onHeartbeat.bind(this));
        };
        default_1.prototype._startSubscribeLoop = function () {
            var _this = this;
            this._stopSubscribeLoop();
            var presenceState = {};
            var channels = [];
            var channelGroups = [];
            Object.keys(this._channels).forEach(function (channel) {
                var channelState = _this._channels[channel].state;
                if (Object.keys(channelState).length) {
                    presenceState[channel] = channelState;
                }
                channels.push(channel);
            });
            Object.keys(this._presenceChannels).forEach(function (channel) {
                channels.push("".concat(channel, "-pnpres"));
            });
            Object.keys(this._channelGroups).forEach(function (channelGroup) {
                var channelGroupState = _this._channelGroups[channelGroup].state;
                if (Object.keys(channelGroupState).length) {
                    presenceState[channelGroup] = channelGroupState;
                }
                channelGroups.push(channelGroup);
            });
            Object.keys(this._presenceChannelGroups).forEach(function (channelGroup) {
                channelGroups.push("".concat(channelGroup, "-pnpres"));
            });
            if (channels.length === 0 && channelGroups.length === 0) {
                return;
            }
            var subscribeArgs = {
                channels: channels,
                channelGroups: channelGroups,
                state: presenceState,
                timetoken: this._currentTimetoken,
                filterExpression: this._config.filterExpression,
                region: this._region,
            };
            this._subscribeCall = this._subscribeEndpoint(subscribeArgs, this._processSubscribeResponse.bind(this));
        };
        default_1.prototype._processSubscribeResponse = function (status, payload) {
            var _this = this;
            if (status.error) {
                // if error comes from request abort, ignore
                if (status.errorData && status.errorData.message === 'Aborted') {
                    return;
                }
                // if we timeout from server, restart the loop.
                if (status.category === categories.PNTimeoutCategory) {
                    this._startSubscribeLoop();
                }
                else if (status.category === categories.PNNetworkIssuesCategory) {
                    // we lost internet connection, alert the reconnection manager and terminate all loops
                    this.disconnect();
                    if (status.error && this._config.autoNetworkDetection && this._isOnline) {
                        this._isOnline = false;
                        this._listenerManager.announceNetworkDown();
                    }
                    this._reconnectionManager.onReconnection(function () {
                        if (_this._config.autoNetworkDetection && !_this._isOnline) {
                            _this._isOnline = true;
                            _this._listenerManager.announceNetworkUp();
                        }
                        _this.reconnect();
                        _this._subscriptionStatusAnnounced = true;
                        var reconnectedAnnounce = {
                            category: categories.PNReconnectedCategory,
                            operation: status.operation,
                            lastTimetoken: _this._lastTimetoken,
                            currentTimetoken: _this._currentTimetoken,
                        };
                        _this._listenerManager.announceStatus(reconnectedAnnounce);
                    });
                    this._reconnectionManager.startPolling();
                    this._listenerManager.announceStatus(status);
                }
                else if (status.category === categories.PNBadRequestCategory) {
                    this._stopHeartbeatTimer();
                    this._listenerManager.announceStatus(status);
                }
                else {
                    this._listenerManager.announceStatus(status);
                }
                return;
            }
            if (this._storedTimetoken) {
                this._currentTimetoken = this._storedTimetoken;
                this._storedTimetoken = null;
            }
            else {
                this._lastTimetoken = this._currentTimetoken;
                this._currentTimetoken = payload.metadata.timetoken;
            }
            if (!this._subscriptionStatusAnnounced) {
                var connectedAnnounce = {};
                connectedAnnounce.category = categories.PNConnectedCategory;
                connectedAnnounce.operation = status.operation;
                connectedAnnounce.affectedChannels = this._pendingChannelSubscriptions;
                connectedAnnounce.subscribedChannels = this.getSubscribedChannels();
                connectedAnnounce.affectedChannelGroups = this._pendingChannelGroupSubscriptions;
                connectedAnnounce.lastTimetoken = this._lastTimetoken;
                connectedAnnounce.currentTimetoken = this._currentTimetoken;
                this._subscriptionStatusAnnounced = true;
                this._listenerManager.announceStatus(connectedAnnounce);
                // clear the pending connections list
                this._pendingChannelSubscriptions = [];
                this._pendingChannelGroupSubscriptions = [];
            }
            var messages = payload.messages || [];
            var _a = this._config, requestMessageCountThreshold = _a.requestMessageCountThreshold, dedupeOnSubscribe = _a.dedupeOnSubscribe;
            if (requestMessageCountThreshold && messages.length >= requestMessageCountThreshold) {
                var countAnnouncement = {};
                countAnnouncement.category = categories.PNRequestMessageCountExceededCategory;
                countAnnouncement.operation = status.operation;
                this._listenerManager.announceStatus(countAnnouncement);
            }
            messages.forEach(function (message) {
                var channel = message.channel;
                var subscriptionMatch = message.subscriptionMatch;
                var publishMetaData = message.publishMetaData;
                if (channel === subscriptionMatch) {
                    subscriptionMatch = null;
                }
                if (dedupeOnSubscribe) {
                    if (_this._dedupingManager.isDuplicate(message)) {
                        return;
                    }
                    _this._dedupingManager.addEntry(message);
                }
                if (utils$5.endsWith(message.channel, '-pnpres')) {
                    var announce = {};
                    announce.channel = null;
                    announce.subscription = null;
                    // deprecated -->
                    announce.actualChannel = subscriptionMatch != null ? channel : null;
                    announce.subscribedChannel = subscriptionMatch != null ? subscriptionMatch : channel;
                    // <-- deprecated
                    if (channel) {
                        announce.channel = channel.substring(0, channel.lastIndexOf('-pnpres'));
                    }
                    if (subscriptionMatch) {
                        announce.subscription = subscriptionMatch.substring(0, subscriptionMatch.lastIndexOf('-pnpres'));
                    }
                    announce.action = message.payload.action;
                    announce.state = message.payload.data;
                    announce.timetoken = publishMetaData.publishTimetoken;
                    announce.occupancy = message.payload.occupancy;
                    announce.uuid = message.payload.uuid;
                    announce.timestamp = message.payload.timestamp;
                    if (message.payload.join) {
                        announce.join = message.payload.join;
                    }
                    if (message.payload.leave) {
                        announce.leave = message.payload.leave;
                    }
                    if (message.payload.timeout) {
                        announce.timeout = message.payload.timeout;
                    }
                    _this._listenerManager.announcePresence(announce);
                }
                else if (message.messageType === 1) {
                    // this is a signal message
                    var announce = {};
                    announce.channel = null;
                    announce.subscription = null;
                    announce.channel = channel;
                    announce.subscription = subscriptionMatch;
                    announce.timetoken = publishMetaData.publishTimetoken;
                    announce.publisher = message.issuingClientId;
                    if (message.userMetadata) {
                        announce.userMetadata = message.userMetadata;
                    }
                    announce.message = message.payload;
                    _this._listenerManager.announceSignal(announce);
                }
                else if (message.messageType === 2) {
                    // this is an object message
                    var announce = {};
                    announce.channel = null;
                    announce.subscription = null;
                    announce.channel = channel;
                    announce.subscription = subscriptionMatch;
                    announce.timetoken = publishMetaData.publishTimetoken;
                    announce.publisher = message.issuingClientId;
                    if (message.userMetadata) {
                        announce.userMetadata = message.userMetadata;
                    }
                    announce.message = {
                        event: message.payload.event,
                        type: message.payload.type,
                        data: message.payload.data,
                    };
                    _this._listenerManager.announceObjects(announce);
                    if (message.payload.type === 'user') {
                        _this._listenerManager.announceUser(announce);
                    }
                    else if (message.payload.type === 'space') {
                        _this._listenerManager.announceSpace(announce);
                    }
                    else if (message.payload.type === 'membership') {
                        _this._listenerManager.announceMembership(announce);
                    }
                }
                else if (message.messageType === 3) {
                    // this is a message action
                    var announce = {};
                    announce.channel = channel;
                    announce.subscription = subscriptionMatch;
                    announce.timetoken = publishMetaData.publishTimetoken;
                    announce.publisher = message.issuingClientId;
                    announce.data = {
                        messageTimetoken: message.payload.data.messageTimetoken,
                        actionTimetoken: message.payload.data.actionTimetoken,
                        type: message.payload.data.type,
                        uuid: message.issuingClientId,
                        value: message.payload.data.value,
                    };
                    announce.event = message.payload.event;
                    _this._listenerManager.announceMessageAction(announce);
                }
                else if (message.messageType === 4) {
                    // this is a file message
                    var announce = {};
                    announce.channel = channel;
                    announce.subscription = subscriptionMatch;
                    announce.timetoken = publishMetaData.publishTimetoken;
                    announce.publisher = message.issuingClientId;
                    var msgPayload = message.payload;
                    if (_this._config.cipherKey) {
                        var decryptedPayload = _this._crypto.decrypt(message.payload);
                        if (typeof decryptedPayload === 'object' && decryptedPayload !== null) {
                            msgPayload = decryptedPayload;
                        }
                    }
                    if (message.userMetadata) {
                        announce.userMetadata = message.userMetadata;
                    }
                    announce.message = msgPayload.message;
                    announce.file = {
                        id: msgPayload.file.id,
                        name: msgPayload.file.name,
                        url: _this._getFileUrl({
                            id: msgPayload.file.id,
                            name: msgPayload.file.name,
                            channel: channel,
                        }),
                    };
                    _this._listenerManager.announceFile(announce);
                }
                else {
                    var announce = {};
                    announce.channel = null;
                    announce.subscription = null;
                    // deprecated -->
                    announce.actualChannel = subscriptionMatch != null ? channel : null;
                    announce.subscribedChannel = subscriptionMatch != null ? subscriptionMatch : channel;
                    // <-- deprecated
                    announce.channel = channel;
                    announce.subscription = subscriptionMatch;
                    announce.timetoken = publishMetaData.publishTimetoken;
                    announce.publisher = message.issuingClientId;
                    if (message.userMetadata) {
                        announce.userMetadata = message.userMetadata;
                    }
                    if (_this._config.cipherKey) {
                        announce.message = _this._crypto.decrypt(message.payload);
                    }
                    else {
                        announce.message = message.payload;
                    }
                    _this._listenerManager.announceMessage(announce);
                }
            });
            this._region = payload.metadata.region;
            this._startSubscribeLoop();
        };
        default_1.prototype._stopSubscribeLoop = function () {
            if (this._subscribeCall) {
                if (typeof this._subscribeCall.abort === 'function') {
                    this._subscribeCall.abort();
                }
                this._subscribeCall = null;
            }
        };
        return default_1;
    }());

    /*       */
    var OPERATIONS = {
        PNTimeOperation: 'PNTimeOperation',
        PNHistoryOperation: 'PNHistoryOperation',
        PNDeleteMessagesOperation: 'PNDeleteMessagesOperation',
        PNFetchMessagesOperation: 'PNFetchMessagesOperation',
        PNMessageCounts: 'PNMessageCountsOperation',
        // pubsub
        PNSubscribeOperation: 'PNSubscribeOperation',
        PNUnsubscribeOperation: 'PNUnsubscribeOperation',
        PNPublishOperation: 'PNPublishOperation',
        PNSignalOperation: 'PNSignalOperation',
        // Actions API
        PNAddMessageActionOperation: 'PNAddActionOperation',
        PNRemoveMessageActionOperation: 'PNRemoveMessageActionOperation',
        PNGetMessageActionsOperation: 'PNGetMessageActionsOperation',
        // Objects API
        PNCreateUserOperation: 'PNCreateUserOperation',
        PNUpdateUserOperation: 'PNUpdateUserOperation',
        PNDeleteUserOperation: 'PNDeleteUserOperation',
        PNGetUserOperation: 'PNGetUsersOperation',
        PNGetUsersOperation: 'PNGetUsersOperation',
        PNCreateSpaceOperation: 'PNCreateSpaceOperation',
        PNUpdateSpaceOperation: 'PNUpdateSpaceOperation',
        PNDeleteSpaceOperation: 'PNDeleteSpaceOperation',
        PNGetSpaceOperation: 'PNGetSpacesOperation',
        PNGetSpacesOperation: 'PNGetSpacesOperation',
        PNGetMembersOperation: 'PNGetMembersOperation',
        PNUpdateMembersOperation: 'PNUpdateMembersOperation',
        PNGetMembershipsOperation: 'PNGetMembershipsOperation',
        PNUpdateMembershipsOperation: 'PNUpdateMembershipsOperation',
        // File Upload API v1
        PNListFilesOperation: 'PNListFilesOperation',
        PNGenerateUploadUrlOperation: 'PNGenerateUploadUrlOperation',
        PNPublishFileOperation: 'PNPublishFileOperation',
        PNGetFileUrlOperation: 'PNGetFileUrlOperation',
        PNDownloadFileOperation: 'PNDownloadFileOperation',
        // Objects API v2
        //   UUID
        PNGetAllUUIDMetadataOperation: 'PNGetAllUUIDMetadataOperation',
        PNGetUUIDMetadataOperation: 'PNGetUUIDMetadataOperation',
        PNSetUUIDMetadataOperation: 'PNSetUUIDMetadataOperation',
        PNRemoveUUIDMetadataOperation: 'PNRemoveUUIDMetadataOperation',
        //   channel
        PNGetAllChannelMetadataOperation: 'PNGetAllChannelMetadataOperation',
        PNGetChannelMetadataOperation: 'PNGetChannelMetadataOperation',
        PNSetChannelMetadataOperation: 'PNSetChannelMetadataOperation',
        PNRemoveChannelMetadataOperation: 'PNRemoveChannelMetadataOperation',
        //   member
        // PNGetMembersOperation: 'PNGetMembersOperation',
        PNSetMembersOperation: 'PNSetMembersOperation',
        // PNGetMembershipsOperation: 'PNGetMembersOperation',
        PNSetMembershipsOperation: 'PNSetMembershipsOperation',
        // push
        PNPushNotificationEnabledChannelsOperation: 'PNPushNotificationEnabledChannelsOperation',
        PNRemoveAllPushNotificationsOperation: 'PNRemoveAllPushNotificationsOperation',
        //
        // presence
        PNWhereNowOperation: 'PNWhereNowOperation',
        PNSetStateOperation: 'PNSetStateOperation',
        PNHereNowOperation: 'PNHereNowOperation',
        PNGetStateOperation: 'PNGetStateOperation',
        PNHeartbeatOperation: 'PNHeartbeatOperation',
        //
        // channel group
        PNChannelGroupsOperation: 'PNChannelGroupsOperation',
        PNRemoveGroupOperation: 'PNRemoveGroupOperation',
        PNChannelsForGroupOperation: 'PNChannelsForGroupOperation',
        PNAddChannelsToGroupOperation: 'PNAddChannelsToGroupOperation',
        PNRemoveChannelsFromGroupOperation: 'PNRemoveChannelsFromGroupOperation',
        //
        // PAM
        PNAccessManagerGrant: 'PNAccessManagerGrant',
        PNAccessManagerGrantToken: 'PNAccessManagerGrantToken',
        PNAccessManagerAudit: 'PNAccessManagerAudit',
        PNAccessManagerRevokeToken: 'PNAccessManagerRevokeToken',
        //
        // subscription utilities
        PNHandshakeOperation: 'PNHandshakeOperation',
        PNReceiveMessagesOperation: 'PNReceiveMessagesOperation',
    };

    /*       */
    var default_1$6 = /** @class */ (function () {
        function default_1(configuration) {
            this._maximumSamplesCount = 100;
            this._trackedLatencies = {};
            this._latencies = {};
            this._maximumSamplesCount = configuration.maximumSamplesCount || this._maximumSamplesCount;
        }
        /**
         * Compose object with latency information of recently used API endpoints.
         *
         * @return {Object} Object with request query key/value pairs.
         */
        default_1.prototype.operationsLatencyForRequest = function () {
            var _this = this;
            var latencies = {};
            Object.keys(this._latencies).forEach(function (endpointName) {
                var operationLatencies = _this._latencies[endpointName];
                var averageLatency = _this._averageLatency(operationLatencies);
                if (averageLatency > 0) {
                    latencies["l_".concat(endpointName)] = averageLatency;
                }
            });
            return latencies;
        };
        default_1.prototype.startLatencyMeasure = function (operationType, identifier) {
            if (operationType === OPERATIONS.PNSubscribeOperation || !identifier) {
                return;
            }
            this._trackedLatencies[identifier] = Date.now();
        };
        default_1.prototype.stopLatencyMeasure = function (operationType, identifier) {
            if (operationType === OPERATIONS.PNSubscribeOperation || !identifier) {
                return;
            }
            var endpointName = this._endpointName(operationType);
            /** @type Array<Number> */
            var endpointLatencies = this._latencies[endpointName];
            var startDate = this._trackedLatencies[identifier];
            if (!endpointLatencies) {
                this._latencies[endpointName] = [];
                endpointLatencies = this._latencies[endpointName];
            }
            endpointLatencies.push(Date.now() - startDate);
            // Truncate samples count if there is more then configured.
            if (endpointLatencies.length > this._maximumSamplesCount) {
                endpointLatencies.splice(0, endpointLatencies.length - this._maximumSamplesCount);
            }
            delete this._trackedLatencies[identifier];
        };
        default_1.prototype._averageLatency = function (latencies) {
            var arrayReduce = function (accumulatedLatency, latency) { return accumulatedLatency + latency; };
            return Math.floor(latencies.reduce(arrayReduce, 0) / latencies.length);
        };
        default_1.prototype._endpointName = function (operationType) {
            var operation = null;
            switch (operationType) {
                case OPERATIONS.PNPublishOperation:
                    operation = 'pub';
                    break;
                case OPERATIONS.PNSignalOperation:
                    operation = 'sig';
                    break;
                case OPERATIONS.PNHistoryOperation:
                case OPERATIONS.PNFetchMessagesOperation:
                case OPERATIONS.PNDeleteMessagesOperation:
                case OPERATIONS.PNMessageCounts:
                    operation = 'hist';
                    break;
                case OPERATIONS.PNUnsubscribeOperation:
                case OPERATIONS.PNWhereNowOperation:
                case OPERATIONS.PNHereNowOperation:
                case OPERATIONS.PNHeartbeatOperation:
                case OPERATIONS.PNSetStateOperation:
                case OPERATIONS.PNGetStateOperation:
                    operation = 'pres';
                    break;
                case OPERATIONS.PNAddChannelsToGroupOperation:
                case OPERATIONS.PNRemoveChannelsFromGroupOperation:
                case OPERATIONS.PNChannelGroupsOperation:
                case OPERATIONS.PNRemoveGroupOperation:
                case OPERATIONS.PNChannelsForGroupOperation:
                    operation = 'cg';
                    break;
                case OPERATIONS.PNPushNotificationEnabledChannelsOperation:
                case OPERATIONS.PNRemoveAllPushNotificationsOperation:
                    operation = 'push';
                    break;
                case OPERATIONS.PNCreateUserOperation:
                case OPERATIONS.PNUpdateUserOperation:
                case OPERATIONS.PNDeleteUserOperation:
                case OPERATIONS.PNGetUserOperation:
                case OPERATIONS.PNGetUsersOperation:
                case OPERATIONS.PNCreateSpaceOperation:
                case OPERATIONS.PNUpdateSpaceOperation:
                case OPERATIONS.PNDeleteSpaceOperation:
                case OPERATIONS.PNGetSpaceOperation:
                case OPERATIONS.PNGetSpacesOperation:
                case OPERATIONS.PNGetMembersOperation:
                case OPERATIONS.PNUpdateMembersOperation:
                case OPERATIONS.PNGetMembershipsOperation:
                case OPERATIONS.PNUpdateMembershipsOperation:
                    operation = 'obj';
                    break;
                case OPERATIONS.PNAddMessageActionOperation:
                case OPERATIONS.PNRemoveMessageActionOperation:
                case OPERATIONS.PNGetMessageActionsOperation:
                    operation = 'msga';
                    break;
                case OPERATIONS.PNAccessManagerGrant:
                case OPERATIONS.PNAccessManagerAudit:
                    operation = 'pam';
                    break;
                case OPERATIONS.PNAccessManagerGrantToken:
                case OPERATIONS.PNAccessManagerRevokeToken:
                    operation = 'pamv3';
                    break;
                default:
                    operation = 'time';
                    break;
            }
            return operation;
        };
        return default_1;
    }());

    var BaseNotificationPayload = /** @class */ (function () {
        function BaseNotificationPayload(payload, title, body) {
            this._payload = payload;
            this._setDefaultPayloadStructure();
            this.title = title;
            this.body = body;
        }
        Object.defineProperty(BaseNotificationPayload.prototype, "payload", {
            get: function () {
                return this._payload;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BaseNotificationPayload.prototype, "title", {
            set: function (value) {
                this._title = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BaseNotificationPayload.prototype, "subtitle", {
            set: function (value) {
                this._subtitle = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BaseNotificationPayload.prototype, "body", {
            set: function (value) {
                this._body = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BaseNotificationPayload.prototype, "badge", {
            set: function (value) {
                this._badge = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BaseNotificationPayload.prototype, "sound", {
            set: function (value) {
                this._sound = value;
            },
            enumerable: false,
            configurable: true
        });
        BaseNotificationPayload.prototype._setDefaultPayloadStructure = function () {
            // Empty.
        };
        BaseNotificationPayload.prototype.toObject = function () {
            return {};
        };
        return BaseNotificationPayload;
    }());
    var APNSNotificationPayload = /** @class */ (function (_super) {
        __extends(APNSNotificationPayload, _super);
        function APNSNotificationPayload() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(APNSNotificationPayload.prototype, "configurations", {
            set: function (value) {
                if (!value || !value.length)
                    return;
                this._configurations = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(APNSNotificationPayload.prototype, "notification", {
            get: function () {
                return this._payload.aps;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(APNSNotificationPayload.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (value) {
                if (!value || !value.length)
                    return;
                this._payload.aps.alert.title = value;
                this._title = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(APNSNotificationPayload.prototype, "subtitle", {
            get: function () {
                return this._subtitle;
            },
            set: function (value) {
                if (!value || !value.length)
                    return;
                this._payload.aps.alert.subtitle = value;
                this._subtitle = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(APNSNotificationPayload.prototype, "body", {
            get: function () {
                return this._body;
            },
            set: function (value) {
                if (!value || !value.length)
                    return;
                this._payload.aps.alert.body = value;
                this._body = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(APNSNotificationPayload.prototype, "badge", {
            get: function () {
                return this._badge;
            },
            set: function (value) {
                if (value === undefined || value === null)
                    return;
                this._payload.aps.badge = value;
                this._badge = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(APNSNotificationPayload.prototype, "sound", {
            get: function () {
                return this._sound;
            },
            set: function (value) {
                if (!value || !value.length)
                    return;
                this._payload.aps.sound = value;
                this._sound = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(APNSNotificationPayload.prototype, "silent", {
            set: function (value) {
                this._isSilent = value;
            },
            enumerable: false,
            configurable: true
        });
        APNSNotificationPayload.prototype._setDefaultPayloadStructure = function () {
            this._payload.aps = { alert: {} };
        };
        APNSNotificationPayload.prototype.toObject = function () {
            var _this = this;
            var payload = __assign({}, this._payload);
            /** @type {{alert: Object, badge: number, sound: string}} */
            var aps = payload.aps;
            var alert = aps.alert;
            if (this._isSilent) {
                aps['content-available'] = 1;
            }
            if (this._apnsPushType === 'apns2') {
                if (!this._configurations || !this._configurations.length) {
                    throw new ReferenceError('APNS2 configuration is missing');
                }
                var configurations_1 = [];
                this._configurations.forEach(function (configuration) {
                    configurations_1.push(_this._objectFromAPNS2Configuration(configuration));
                });
                if (configurations_1.length) {
                    payload.pn_push = configurations_1;
                }
            }
            if (!alert || !Object.keys(alert).length) {
                delete aps.alert;
            }
            if (this._isSilent) {
                delete aps.alert;
                delete aps.badge;
                delete aps.sound;
                alert = {};
            }
            return this._isSilent || Object.keys(alert).length ? payload : null;
        };
        APNSNotificationPayload.prototype._objectFromAPNS2Configuration = function (configuration) {
            var _this = this;
            if (!configuration.targets || !configuration.targets.length) {
                throw new ReferenceError('At least one APNS2 target should be provided');
            }
            var targets = [];
            configuration.targets.forEach(function (target) {
                targets.push(_this._objectFromAPNSTarget(target));
            });
            var collapseId = configuration.collapseId, expirationDate = configuration.expirationDate;
            var objectifiedConfiguration = { auth_method: 'token', targets: targets, version: 'v2' };
            if (collapseId && collapseId.length) {
                objectifiedConfiguration.collapse_id = collapseId;
            }
            if (expirationDate) {
                objectifiedConfiguration.expiration = expirationDate.toISOString();
            }
            return objectifiedConfiguration;
        };
        APNSNotificationPayload.prototype._objectFromAPNSTarget = function (target) {
            if (!target.topic || !target.topic.length) {
                throw new TypeError("Target 'topic' undefined.");
            }
            var topic = target.topic, _a = target.environment, environment = _a === void 0 ? 'development' : _a, _b = target.excludedDevices, excludedDevices = _b === void 0 ? [] : _b;
            var objectifiedTarget = { topic: topic, environment: environment };
            if (excludedDevices.length) {
                objectifiedTarget.excluded_devices = excludedDevices;
            }
            return objectifiedTarget;
        };
        return APNSNotificationPayload;
    }(BaseNotificationPayload));
    var MPNSNotificationPayload = /** @class */ (function (_super) {
        __extends(MPNSNotificationPayload, _super);
        function MPNSNotificationPayload() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(MPNSNotificationPayload.prototype, "backContent", {
            get: function () {
                return this._backContent;
            },
            set: function (value) {
                if (!value || !value.length)
                    return;
                this._payload.back_content = value;
                this._backContent = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MPNSNotificationPayload.prototype, "backTitle", {
            get: function () {
                return this._backTitle;
            },
            set: function (value) {
                if (!value || !value.length)
                    return;
                this._payload.back_title = value;
                this._backTitle = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MPNSNotificationPayload.prototype, "count", {
            get: function () {
                return this._count;
            },
            set: function (value) {
                if (value === undefined || value === null)
                    return;
                this._payload.count = value;
                this._count = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MPNSNotificationPayload.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (value) {
                if (!value || !value.length)
                    return;
                this._payload.title = value;
                this._title = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MPNSNotificationPayload.prototype, "type", {
            get: function () {
                return this._type;
            },
            set: function (value) {
                if (!value || !value.length)
                    return;
                this._payload.type = value;
                this._type = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MPNSNotificationPayload.prototype, "subtitle", {
            get: function () {
                return this.backTitle;
            },
            set: function (value) {
                this.backTitle = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MPNSNotificationPayload.prototype, "body", {
            get: function () {
                return this.backContent;
            },
            set: function (value) {
                this.backContent = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MPNSNotificationPayload.prototype, "badge", {
            get: function () {
                return this.count;
            },
            set: function (value) {
                this.count = value;
            },
            enumerable: false,
            configurable: true
        });
        MPNSNotificationPayload.prototype.toObject = function () {
            return Object.keys(this._payload).length ? __assign({}, this._payload) : null;
        };
        return MPNSNotificationPayload;
    }(BaseNotificationPayload));
    var FCMNotificationPayload = /** @class */ (function (_super) {
        __extends(FCMNotificationPayload, _super);
        function FCMNotificationPayload() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(FCMNotificationPayload.prototype, "notification", {
            get: function () {
                return this._payload.notification;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FCMNotificationPayload.prototype, "data", {
            get: function () {
                return this._payload.data;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FCMNotificationPayload.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (value) {
                if (!value || !value.length)
                    return;
                this._payload.notification.title = value;
                this._title = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FCMNotificationPayload.prototype, "body", {
            get: function () {
                return this._body;
            },
            set: function (value) {
                if (!value || !value.length)
                    return;
                this._payload.notification.body = value;
                this._body = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FCMNotificationPayload.prototype, "sound", {
            get: function () {
                return this._sound;
            },
            set: function (value) {
                if (!value || !value.length)
                    return;
                this._payload.notification.sound = value;
                this._sound = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FCMNotificationPayload.prototype, "icon", {
            get: function () {
                return this._icon;
            },
            set: function (value) {
                if (!value || !value.length)
                    return;
                this._payload.notification.icon = value;
                this._icon = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FCMNotificationPayload.prototype, "tag", {
            get: function () {
                return this._tag;
            },
            set: function (value) {
                if (!value || !value.length)
                    return;
                this._payload.notification.tag = value;
                this._tag = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FCMNotificationPayload.prototype, "silent", {
            set: function (value) {
                this._isSilent = value;
            },
            enumerable: false,
            configurable: true
        });
        FCMNotificationPayload.prototype._setDefaultPayloadStructure = function () {
            this._payload.notification = {};
            this._payload.data = {};
        };
        FCMNotificationPayload.prototype.toObject = function () {
            var data = __assign({}, this._payload.data);
            var notification = null;
            var payload = {};
            /**
             * Check whether additional data has been passed outside of 'data' object
             * and put it into it if required.
             */
            if (Object.keys(this._payload).length > 2) {
                var _a = this._payload; _a.notification; _a.data; var additionalData = __rest(_a, ["notification", "data"]);
                data = __assign(__assign({}, data), additionalData);
            }
            if (this._isSilent) {
                data.notification = this._payload.notification;
            }
            else {
                notification = this._payload.notification;
            }
            if (Object.keys(data).length) {
                payload.data = data;
            }
            if (notification && Object.keys(notification).length) {
                payload.notification = notification;
            }
            return Object.keys(payload).length ? payload : null;
        };
        return FCMNotificationPayload;
    }(BaseNotificationPayload));
    var NotificationsPayload = /** @class */ (function () {
        function NotificationsPayload(title, body) {
            this._payload = { apns: {}, mpns: {}, fcm: {} };
            this._title = title;
            this._body = body;
            this.apns = new APNSNotificationPayload(this._payload.apns, title, body);
            this.mpns = new MPNSNotificationPayload(this._payload.mpns, title, body);
            this.fcm = new FCMNotificationPayload(this._payload.fcm, title, body);
        }
        Object.defineProperty(NotificationsPayload.prototype, "debugging", {
            set: function (value) {
                this._debugging = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(NotificationsPayload.prototype, "title", {
            get: function () {
                return this._title;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(NotificationsPayload.prototype, "body", {
            get: function () {
                return this._body;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(NotificationsPayload.prototype, "subtitle", {
            get: function () {
                return this._subtitle;
            },
            set: function (value) {
                this._subtitle = value;
                this.apns.subtitle = value;
                this.mpns.subtitle = value;
                this.fcm.subtitle = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(NotificationsPayload.prototype, "badge", {
            get: function () {
                return this._badge;
            },
            set: function (value) {
                this._badge = value;
                this.apns.badge = value;
                this.mpns.badge = value;
                this.fcm.badge = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(NotificationsPayload.prototype, "sound", {
            get: function () {
                return this._sound;
            },
            set: function (value) {
                this._sound = value;
                this.apns.sound = value;
                this.mpns.sound = value;
                this.fcm.sound = value;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Build notifications platform for requested platforms.
         *
         * @param {Array<string>} platforms - List of platforms for which payload
         * should be added to final dictionary. Supported values: gcm, apns, apns2,
         * mpns.
         *
         * @returns {Object} Object with data, which can be sent with publish method
         * call and trigger remote notifications for specified platforms.
         */
        NotificationsPayload.prototype.buildPayload = function (platforms) {
            var payload = {};
            if (platforms.includes('apns') || platforms.includes('apns2')) {
                this.apns._apnsPushType = platforms.includes('apns') ? 'apns' : 'apns2';
                var apnsPayload = this.apns.toObject();
                if (apnsPayload && Object.keys(apnsPayload).length) {
                    payload.pn_apns = apnsPayload;
                }
            }
            if (platforms.includes('mpns')) {
                var mpnsPayload = this.mpns.toObject();
                if (mpnsPayload && Object.keys(mpnsPayload).length) {
                    payload.pn_mpns = mpnsPayload;
                }
            }
            if (platforms.includes('fcm')) {
                var fcmPayload = this.fcm.toObject();
                if (fcmPayload && Object.keys(fcmPayload).length) {
                    payload.pn_gcm = fcmPayload;
                }
            }
            if (Object.keys(payload).length && this._debugging) {
                payload.pn_debug = true;
            }
            return payload;
        };
        return NotificationsPayload;
    }());

    var default_1$5 = /** @class */ (function () {
        function default_1() {
            this._listeners = [];
        }
        default_1.prototype.addListener = function (newListeners) {
            this._listeners.push(newListeners);
        };
        default_1.prototype.removeListener = function (deprecatedListener) {
            var newListeners = [];
            this._listeners.forEach(function (listener) {
                if (listener !== deprecatedListener)
                    newListeners.push(listener);
            });
            this._listeners = newListeners;
        };
        default_1.prototype.removeAllListeners = function () {
            this._listeners = [];
        };
        default_1.prototype.announcePresence = function (announce) {
            this._listeners.forEach(function (listener) {
                if (listener.presence)
                    listener.presence(announce);
            });
        };
        default_1.prototype.announceStatus = function (announce) {
            this._listeners.forEach(function (listener) {
                if (listener.status)
                    listener.status(announce);
            });
        };
        default_1.prototype.announceMessage = function (announce) {
            this._listeners.forEach(function (listener) {
                if (listener.message)
                    listener.message(announce);
            });
        };
        default_1.prototype.announceSignal = function (announce) {
            this._listeners.forEach(function (listener) {
                if (listener.signal)
                    listener.signal(announce);
            });
        };
        default_1.prototype.announceMessageAction = function (announce) {
            this._listeners.forEach(function (listener) {
                if (listener.messageAction)
                    listener.messageAction(announce);
            });
        };
        default_1.prototype.announceFile = function (announce) {
            this._listeners.forEach(function (listener) {
                if (listener.file)
                    listener.file(announce);
            });
        };
        default_1.prototype.announceObjects = function (announce) {
            this._listeners.forEach(function (listener) {
                if (listener.objects)
                    listener.objects(announce);
            });
        };
        default_1.prototype.announceUser = function (announce) {
            this._listeners.forEach(function (listener) {
                if (listener.user)
                    listener.user(announce);
            });
        };
        default_1.prototype.announceSpace = function (announce) {
            this._listeners.forEach(function (listener) {
                if (listener.space)
                    listener.space(announce);
            });
        };
        default_1.prototype.announceMembership = function (announce) {
            this._listeners.forEach(function (listener) {
                if (listener.membership)
                    listener.membership(announce);
            });
        };
        default_1.prototype.announceNetworkUp = function () {
            var networkStatus = {};
            networkStatus.category = categories.PNNetworkUpCategory;
            this.announceStatus(networkStatus);
        };
        default_1.prototype.announceNetworkDown = function () {
            var networkStatus = {};
            networkStatus.category = categories.PNNetworkDownCategory;
            this.announceStatus(networkStatus);
        };
        return default_1;
    }());

    var default_1$4 = /** @class */ (function () {
        function default_1(config, cbor) {
            this._config = config;
            this._cbor = cbor;
        }
        default_1.prototype.setToken = function (token) {
            if (token && token.length > 0) {
                this._token = token;
            }
            else {
                this._token = undefined;
            }
        };
        default_1.prototype.getToken = function () {
            return this._token;
        };
        default_1.prototype.extractPermissions = function (permissions) {
            var permissionsResult = {
                read: false,
                write: false,
                manage: false,
                delete: false,
                get: false,
                update: false,
                join: false,
            };
            /* eslint-disable */
            if ((permissions & 128) === 128) {
                permissionsResult.join = true;
            }
            if ((permissions & 64) === 64) {
                permissionsResult.update = true;
            }
            if ((permissions & 32) === 32) {
                permissionsResult.get = true;
            }
            if ((permissions & 8) === 8) {
                permissionsResult.delete = true;
            }
            if ((permissions & 4) === 4) {
                permissionsResult.manage = true;
            }
            if ((permissions & 2) === 2) {
                permissionsResult.write = true;
            }
            if ((permissions & 1) === 1) {
                permissionsResult.read = true;
            }
            /* eslint-enable */
            return permissionsResult;
        };
        default_1.prototype.parseToken = function (tokenString) {
            var _this = this;
            var parsed = this._cbor.decodeToken(tokenString);
            if (parsed !== undefined) {
                var uuidResourcePermissions = parsed.res.uuid ? Object.keys(parsed.res.uuid) : [];
                var channelResourcePermissions = Object.keys(parsed.res.chan);
                var groupResourcePermissions = Object.keys(parsed.res.grp);
                var uuidPatternPermissions = parsed.pat.uuid ? Object.keys(parsed.pat.uuid) : [];
                var channelPatternPermissions = Object.keys(parsed.pat.chan);
                var groupPatternPermissions = Object.keys(parsed.pat.grp);
                var result_1 = {
                    version: parsed.v,
                    timestamp: parsed.t,
                    ttl: parsed.ttl,
                    authorized_uuid: parsed.uuid,
                };
                var uuidResources = uuidResourcePermissions.length > 0;
                var channelResources = channelResourcePermissions.length > 0;
                var groupResources = groupResourcePermissions.length > 0;
                if (uuidResources || channelResources || groupResources) {
                    result_1.resources = {};
                    if (uuidResources) {
                        result_1.resources.uuids = {};
                        uuidResourcePermissions.forEach(function (id) {
                            result_1.resources.uuids[id] = _this.extractPermissions(parsed.res.uuid[id]);
                        });
                    }
                    if (channelResources) {
                        result_1.resources.channels = {};
                        channelResourcePermissions.forEach(function (id) {
                            result_1.resources.channels[id] = _this.extractPermissions(parsed.res.chan[id]);
                        });
                    }
                    if (groupResources) {
                        result_1.resources.groups = {};
                        groupResourcePermissions.forEach(function (id) {
                            result_1.resources.groups[id] = _this.extractPermissions(parsed.res.grp[id]);
                        });
                    }
                }
                var uuidPatterns = uuidPatternPermissions.length > 0;
                var channelPatterns = channelPatternPermissions.length > 0;
                var groupPatterns = groupPatternPermissions.length > 0;
                if (uuidPatterns || channelPatterns || groupPatterns) {
                    result_1.patterns = {};
                    if (uuidPatterns) {
                        result_1.patterns.uuids = {};
                        uuidPatternPermissions.forEach(function (id) {
                            result_1.patterns.uuids[id] = _this.extractPermissions(parsed.pat.uuid[id]);
                        });
                    }
                    if (channelPatterns) {
                        result_1.patterns.channels = {};
                        channelPatternPermissions.forEach(function (id) {
                            result_1.patterns.channels[id] = _this.extractPermissions(parsed.pat.chan[id]);
                        });
                    }
                    if (groupPatterns) {
                        result_1.patterns.groups = {};
                        groupPatternPermissions.forEach(function (id) {
                            result_1.patterns.groups[id] = _this.extractPermissions(parsed.pat.grp[id]);
                        });
                    }
                }
                if (Object.keys(parsed.meta).length > 0) {
                    result_1.meta = parsed.meta;
                }
                result_1.signature = parsed.sig;
                return result_1;
            }
            return undefined;
        };
        return default_1;
    }());

    var PubNubError = /** @class */ (function (_super) {
        __extends(PubNubError, _super);
        function PubNubError(message, status) {
            var _newTarget = this.constructor;
            var _this = _super.call(this, message) || this;
            _this.name = _this.constructor.name;
            _this.status = status;
            _this.message = message;
            Object.setPrototypeOf(_this, _newTarget.prototype);
            return _this;
        }
        return PubNubError;
    }(Error));
    function createError(errorPayload, type) {
        errorPayload.type = type;
        errorPayload.error = true;
        return errorPayload;
    }
    function createValidationError(message) {
        return createError({ message: message }, 'validationError');
    }
    function decideURL(endpoint, modules, incomingParams) {
        if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
            return endpoint.postURL(modules, incomingParams);
        }
        if (endpoint.usePatch && endpoint.usePatch(modules, incomingParams)) {
            return endpoint.patchURL(modules, incomingParams);
        }
        if (endpoint.useGetFile && endpoint.useGetFile(modules, incomingParams)) {
            return endpoint.getFileURL(modules, incomingParams);
        }
        return endpoint.getURL(modules, incomingParams);
    }
    function generatePNSDK(config) {
        if (config.sdkName) {
            return config.sdkName;
        }
        var base = "PubNub-JS-".concat(config.sdkFamily);
        if (config.partnerId) {
            base += "-".concat(config.partnerId);
        }
        base += "/".concat(config.getVersion());
        var pnsdkSuffix = config._getPnsdkSuffix(' ');
        if (pnsdkSuffix.length > 0) {
            base += pnsdkSuffix;
        }
        return base;
    }
    function getHttpMethod(modules, endpoint, incomingParams) {
        if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
            return 'POST';
        }
        if (endpoint.usePatch && endpoint.usePatch(modules, incomingParams)) {
            return 'PATCH';
        }
        if (endpoint.useDelete && endpoint.useDelete(modules, incomingParams)) {
            return 'DELETE';
        }
        if (endpoint.useGetFile && endpoint.useGetFile(modules, incomingParams)) {
            return 'GETFILE';
        }
        return 'GET';
    }
    function signRequest(modules, url, outgoingParams, incomingParams, endpoint) {
        var config = modules.config, crypto = modules.crypto;
        var httpMethod = getHttpMethod(modules, endpoint, incomingParams);
        outgoingParams.timestamp = Math.floor(new Date().getTime() / 1000);
        // This is because of a server-side bug, old publish using post should be deprecated
        if (endpoint.getOperation() === 'PNPublishOperation' &&
            endpoint.usePost &&
            endpoint.usePost(modules, incomingParams)) {
            httpMethod = 'GET';
        }
        if (httpMethod === 'GETFILE') {
            httpMethod = 'GET';
        }
        var signInput = "".concat(httpMethod, "\n").concat(config.publishKey, "\n").concat(url, "\n").concat(utils$5.signPamFromParams(outgoingParams), "\n");
        if (httpMethod === 'POST') {
            var payload = endpoint.postPayload(modules, incomingParams);
            if (typeof payload === 'string') {
                signInput += payload;
            }
            else {
                signInput += JSON.stringify(payload);
            }
        }
        else if (httpMethod === 'PATCH') {
            var payload = endpoint.patchPayload(modules, incomingParams);
            if (typeof payload === 'string') {
                signInput += payload;
            }
            else {
                signInput += JSON.stringify(payload);
            }
        }
        var signature = "v2.".concat(crypto.HMACSHA256(signInput));
        signature = signature.replace(/\+/g, '-');
        signature = signature.replace(/\//g, '_');
        signature = signature.replace(/=+$/, '');
        outgoingParams.signature = signature;
    }
    function endpointCreator (modules, endpoint) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var networking = modules.networking, config = modules.config, telemetryManager = modules.telemetryManager, tokenManager = modules.tokenManager;
        var requestId = uuidGenerator.createUUID();
        var callback = null;
        var promiseComponent = null;
        var incomingParams = {};
        if (endpoint.getOperation() === OPERATIONS.PNTimeOperation ||
            endpoint.getOperation() === OPERATIONS.PNChannelGroupsOperation) {
            callback = args[0];
        }
        else {
            incomingParams = args[0];
            callback = args[1];
        }
        // bridge in Promise support.
        if (typeof Promise !== 'undefined' && !callback) {
            promiseComponent = utils$5.createPromise();
        }
        var validationResult = endpoint.validateParams(modules, incomingParams);
        if (validationResult) {
            if (callback) {
                return callback(createValidationError(validationResult));
            }
            if (promiseComponent) {
                promiseComponent.reject(new PubNubError('Validation failed, check status for details', createValidationError(validationResult)));
                return promiseComponent.promise;
            }
            return;
        }
        var outgoingParams = endpoint.prepareParams(modules, incomingParams);
        var url = decideURL(endpoint, modules, incomingParams);
        var callInstance;
        var networkingParams = {
            url: url,
            operation: endpoint.getOperation(),
            timeout: endpoint.getRequestTimeout(modules),
            headers: endpoint.getRequestHeaders ? endpoint.getRequestHeaders() : {},
            ignoreBody: typeof endpoint.ignoreBody === 'function' ? endpoint.ignoreBody(modules) : false,
            forceBuffered: typeof endpoint.forceBuffered === 'function' ? endpoint.forceBuffered(modules, incomingParams) : null,
            abortSignal: typeof endpoint.getAbortSignal === 'function' ? endpoint.getAbortSignal(modules, incomingParams) : null,
        };
        outgoingParams.uuid = config.UUID;
        outgoingParams.pnsdk = generatePNSDK(config);
        // Add telemetry information (if there is any available).
        var telemetryLatencies = telemetryManager.operationsLatencyForRequest();
        if (Object.keys(telemetryLatencies).length) {
            outgoingParams = __assign(__assign({}, outgoingParams), telemetryLatencies);
        }
        if (config.useInstanceId) {
            outgoingParams.instanceid = config.instanceId;
        }
        if (config.useRequestId) {
            outgoingParams.requestid = requestId;
        }
        if (endpoint.isAuthSupported()) {
            var tokenOrKey = tokenManager.getToken() || config.getAuthKey();
            if (tokenOrKey) {
                outgoingParams.auth = tokenOrKey;
            }
        }
        if (config.secretKey) {
            signRequest(modules, url, outgoingParams, incomingParams, endpoint);
        }
        var onResponse = function (status, payload) {
            if (status.error) {
                if (endpoint.handleError) {
                    endpoint.handleError(modules, incomingParams, status);
                }
                if (callback) {
                    callback(status);
                }
                else if (promiseComponent) {
                    promiseComponent.reject(new PubNubError('PubNub call failed, check status for details', status));
                }
                return;
            }
            // Stop endpoint latency tracking.
            telemetryManager.stopLatencyMeasure(endpoint.getOperation(), requestId);
            var responseP = endpoint.handleResponse(modules, payload, incomingParams);
            if (typeof (responseP === null || responseP === void 0 ? void 0 : responseP.then) !== 'function') {
                responseP = Promise.resolve(responseP);
            }
            responseP
                .then(function (result) {
                if (callback) {
                    callback(status, result);
                }
                else if (promiseComponent) {
                    promiseComponent.fulfill(result);
                }
            })
                .catch(function (e) {
                if (callback) {
                    var errorData = e;
                    if (endpoint.getOperation() === OPERATIONS.PNSubscribeOperation) {
                        errorData = {
                            statusCode: 400,
                            error: true,
                            operation: endpoint.getOperation(),
                            errorData: e,
                            category: categories.PNUnknownCategory,
                        };
                    }
                    callback(errorData, null);
                }
                else if (promiseComponent) {
                    promiseComponent.reject(new PubNubError('PubNub call failed, check status for details', e));
                }
            });
        };
        // Start endpoint latency tracking.
        telemetryManager.startLatencyMeasure(endpoint.getOperation(), requestId);
        if (getHttpMethod(modules, endpoint, incomingParams) === 'POST') {
            var payload = endpoint.postPayload(modules, incomingParams);
            callInstance = networking.POST(outgoingParams, payload, networkingParams, onResponse);
        }
        else if (getHttpMethod(modules, endpoint, incomingParams) === 'PATCH') {
            var payload = endpoint.patchPayload(modules, incomingParams);
            callInstance = networking.PATCH(outgoingParams, payload, networkingParams, onResponse);
        }
        else if (getHttpMethod(modules, endpoint, incomingParams) === 'DELETE') {
            callInstance = networking.DELETE(outgoingParams, networkingParams, onResponse);
        }
        else if (getHttpMethod(modules, endpoint, incomingParams) === 'GETFILE') {
            callInstance = networking.GETFILE(outgoingParams, networkingParams, onResponse);
        }
        else {
            callInstance = networking.GET(outgoingParams, networkingParams, onResponse);
        }
        if (endpoint.getOperation() === OPERATIONS.PNSubscribeOperation) {
            return callInstance;
        }
        if (promiseComponent) {
            return promiseComponent.promise;
        }
    }

    /*       */
    function getOperation$K() {
        return OPERATIONS.PNAddChannelsToGroupOperation;
    }
    function validateParams$K(modules, incomingParams) {
        var channels = incomingParams.channels, channelGroup = incomingParams.channelGroup;
        var config = modules.config;
        if (!channelGroup)
            return 'Missing Channel Group';
        if (!channels || channels.length === 0)
            return 'Missing Channels';
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function getURL$I(modules, incomingParams) {
        var channelGroup = incomingParams.channelGroup;
        var config = modules.config;
        return "/v1/channel-registration/sub-key/".concat(config.subscribeKey, "/channel-group/").concat(utils$5.encodeString(channelGroup));
    }
    function getRequestTimeout$K(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$K() {
        return true;
    }
    function prepareParams$K(modules, incomingParams) {
        var _a = incomingParams.channels, channels = _a === void 0 ? [] : _a;
        return {
            add: channels.join(','),
        };
    }
    function handleResponse$K() {
        return {};
    }

    var addChannelsChannelGroupConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$K,
        validateParams: validateParams$K,
        getURL: getURL$I,
        getRequestTimeout: getRequestTimeout$K,
        isAuthSupported: isAuthSupported$K,
        prepareParams: prepareParams$K,
        handleResponse: handleResponse$K
    });

    /*       */
    function getOperation$J() {
        return OPERATIONS.PNRemoveChannelsFromGroupOperation;
    }
    function validateParams$J(modules, incomingParams) {
        var channels = incomingParams.channels, channelGroup = incomingParams.channelGroup;
        var config = modules.config;
        if (!channelGroup)
            return 'Missing Channel Group';
        if (!channels || channels.length === 0)
            return 'Missing Channels';
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function getURL$H(modules, incomingParams) {
        var channelGroup = incomingParams.channelGroup;
        var config = modules.config;
        return "/v1/channel-registration/sub-key/".concat(config.subscribeKey, "/channel-group/").concat(utils$5.encodeString(channelGroup));
    }
    function getRequestTimeout$J(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$J() {
        return true;
    }
    function prepareParams$J(modules, incomingParams) {
        var _a = incomingParams.channels, channels = _a === void 0 ? [] : _a;
        return {
            remove: channels.join(','),
        };
    }
    function handleResponse$J() {
        return {};
    }

    var removeChannelsChannelGroupConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$J,
        validateParams: validateParams$J,
        getURL: getURL$H,
        getRequestTimeout: getRequestTimeout$J,
        isAuthSupported: isAuthSupported$J,
        prepareParams: prepareParams$J,
        handleResponse: handleResponse$J
    });

    /*       */
    function getOperation$I() {
        return OPERATIONS.PNRemoveGroupOperation;
    }
    function validateParams$I(modules, incomingParams) {
        var channelGroup = incomingParams.channelGroup;
        var config = modules.config;
        if (!channelGroup)
            return 'Missing Channel Group';
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function getURL$G(modules, incomingParams) {
        var channelGroup = incomingParams.channelGroup;
        var config = modules.config;
        return "/v1/channel-registration/sub-key/".concat(config.subscribeKey, "/channel-group/").concat(utils$5.encodeString(channelGroup), "/remove");
    }
    function isAuthSupported$I() {
        return true;
    }
    function getRequestTimeout$I(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function prepareParams$I() {
        return {};
    }
    function handleResponse$I() {
        return {};
    }

    var deleteChannelGroupConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$I,
        validateParams: validateParams$I,
        getURL: getURL$G,
        isAuthSupported: isAuthSupported$I,
        getRequestTimeout: getRequestTimeout$I,
        prepareParams: prepareParams$I,
        handleResponse: handleResponse$I
    });

    /*       */
    function getOperation$H() {
        return OPERATIONS.PNChannelGroupsOperation;
    }
    function validateParams$H(modules) {
        var config = modules.config;
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function getURL$F(modules) {
        var config = modules.config;
        return "/v1/channel-registration/sub-key/".concat(config.subscribeKey, "/channel-group");
    }
    function getRequestTimeout$H(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$H() {
        return true;
    }
    function prepareParams$H() {
        return {};
    }
    function handleResponse$H(modules, serverResponse) {
        return {
            groups: serverResponse.payload.groups,
        };
    }

    var listChannelGroupsConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$H,
        validateParams: validateParams$H,
        getURL: getURL$F,
        getRequestTimeout: getRequestTimeout$H,
        isAuthSupported: isAuthSupported$H,
        prepareParams: prepareParams$H,
        handleResponse: handleResponse$H
    });

    /*       */
    function getOperation$G() {
        return OPERATIONS.PNChannelsForGroupOperation;
    }
    function validateParams$G(modules, incomingParams) {
        var channelGroup = incomingParams.channelGroup;
        var config = modules.config;
        if (!channelGroup)
            return 'Missing Channel Group';
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function getURL$E(modules, incomingParams) {
        var channelGroup = incomingParams.channelGroup;
        var config = modules.config;
        return "/v1/channel-registration/sub-key/".concat(config.subscribeKey, "/channel-group/").concat(utils$5.encodeString(channelGroup));
    }
    function getRequestTimeout$G(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$G() {
        return true;
    }
    function prepareParams$G() {
        return {};
    }
    function handleResponse$G(modules, serverResponse) {
        return {
            channels: serverResponse.payload.channels,
        };
    }

    var listChannelsInChannelGroupConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$G,
        validateParams: validateParams$G,
        getURL: getURL$E,
        getRequestTimeout: getRequestTimeout$G,
        isAuthSupported: isAuthSupported$G,
        prepareParams: prepareParams$G,
        handleResponse: handleResponse$G
    });

    /*       */
    function getOperation$F() {
        return OPERATIONS.PNPushNotificationEnabledChannelsOperation;
    }
    function validateParams$F(modules, incomingParams) {
        var device = incomingParams.device, pushGateway = incomingParams.pushGateway, channels = incomingParams.channels, topic = incomingParams.topic;
        var config = modules.config;
        if (!device)
            return 'Missing Device ID (device)';
        if (!pushGateway)
            return 'Missing GW Type (pushGateway: gcm, apns or apns2)';
        if (pushGateway === 'apns2' && !topic)
            return 'Missing APNS2 topic';
        if (!channels || channels.length === 0)
            return 'Missing Channels';
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function getURL$D(modules, incomingParams) {
        var device = incomingParams.device, pushGateway = incomingParams.pushGateway;
        var config = modules.config;
        if (pushGateway === 'apns2') {
            return "/v2/push/sub-key/".concat(config.subscribeKey, "/devices-apns2/").concat(device);
        }
        return "/v1/push/sub-key/".concat(config.subscribeKey, "/devices/").concat(device);
    }
    function getRequestTimeout$F(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$F() {
        return true;
    }
    function prepareParams$F(modules, incomingParams) {
        var pushGateway = incomingParams.pushGateway, _a = incomingParams.channels, channels = _a === void 0 ? [] : _a, _b = incomingParams.environment, environment = _b === void 0 ? 'development' : _b, topic = incomingParams.topic;
        var parameters = { type: pushGateway, add: channels.join(',') };
        if (pushGateway === 'apns2') {
            parameters = __assign(__assign({}, parameters), { environment: environment, topic: topic });
            delete parameters.type;
        }
        return parameters;
    }
    function handleResponse$F() {
        return {};
    }

    var addPushChannelsConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$F,
        validateParams: validateParams$F,
        getURL: getURL$D,
        getRequestTimeout: getRequestTimeout$F,
        isAuthSupported: isAuthSupported$F,
        prepareParams: prepareParams$F,
        handleResponse: handleResponse$F
    });

    /*       */
    function getOperation$E() {
        return OPERATIONS.PNPushNotificationEnabledChannelsOperation;
    }
    function validateParams$E(modules, incomingParams) {
        var device = incomingParams.device, pushGateway = incomingParams.pushGateway, channels = incomingParams.channels, topic = incomingParams.topic;
        var config = modules.config;
        if (!device)
            return 'Missing Device ID (device)';
        if (!pushGateway)
            return 'Missing GW Type (pushGateway: gcm, apns or apns2)';
        if (pushGateway === 'apns2' && !topic)
            return 'Missing APNS2 topic';
        if (!channels || channels.length === 0)
            return 'Missing Channels';
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function getURL$C(modules, incomingParams) {
        var device = incomingParams.device, pushGateway = incomingParams.pushGateway;
        var config = modules.config;
        if (pushGateway === 'apns2') {
            return "/v2/push/sub-key/".concat(config.subscribeKey, "/devices-apns2/").concat(device);
        }
        return "/v1/push/sub-key/".concat(config.subscribeKey, "/devices/").concat(device);
    }
    function getRequestTimeout$E(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$E() {
        return true;
    }
    function prepareParams$E(modules, incomingParams) {
        var pushGateway = incomingParams.pushGateway, _a = incomingParams.channels, channels = _a === void 0 ? [] : _a, _b = incomingParams.environment, environment = _b === void 0 ? 'development' : _b, topic = incomingParams.topic;
        var parameters = { type: pushGateway, remove: channels.join(',') };
        if (pushGateway === 'apns2') {
            parameters = __assign(__assign({}, parameters), { environment: environment, topic: topic });
            delete parameters.type;
        }
        return parameters;
    }
    function handleResponse$E() {
        return {};
    }

    var removePushChannelsConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$E,
        validateParams: validateParams$E,
        getURL: getURL$C,
        getRequestTimeout: getRequestTimeout$E,
        isAuthSupported: isAuthSupported$E,
        prepareParams: prepareParams$E,
        handleResponse: handleResponse$E
    });

    /*       */
    function getOperation$D() {
        return OPERATIONS.PNPushNotificationEnabledChannelsOperation;
    }
    function validateParams$D(modules, incomingParams) {
        var device = incomingParams.device, pushGateway = incomingParams.pushGateway, topic = incomingParams.topic;
        var config = modules.config;
        if (!device)
            return 'Missing Device ID (device)';
        if (!pushGateway)
            return 'Missing GW Type (pushGateway: gcm, apns or apns2)';
        if (pushGateway === 'apns2' && !topic)
            return 'Missing APNS2 topic';
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function getURL$B(modules, incomingParams) {
        var device = incomingParams.device, pushGateway = incomingParams.pushGateway;
        var config = modules.config;
        if (pushGateway === 'apns2') {
            return "/v2/push/sub-key/".concat(config.subscribeKey, "/devices-apns2/").concat(device);
        }
        return "/v1/push/sub-key/".concat(config.subscribeKey, "/devices/").concat(device);
    }
    function getRequestTimeout$D(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$D() {
        return true;
    }
    function prepareParams$D(modules, incomingParams) {
        var pushGateway = incomingParams.pushGateway, _a = incomingParams.environment, environment = _a === void 0 ? 'development' : _a, topic = incomingParams.topic;
        var parameters = { type: pushGateway };
        if (pushGateway === 'apns2') {
            parameters = __assign(__assign({}, parameters), { environment: environment, topic: topic });
            delete parameters.type;
        }
        return parameters;
    }
    function handleResponse$D(modules, serverResponse) {
        return { channels: serverResponse };
    }

    var listPushChannelsConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$D,
        validateParams: validateParams$D,
        getURL: getURL$B,
        getRequestTimeout: getRequestTimeout$D,
        isAuthSupported: isAuthSupported$D,
        prepareParams: prepareParams$D,
        handleResponse: handleResponse$D
    });

    /*       */
    function getOperation$C() {
        return OPERATIONS.PNRemoveAllPushNotificationsOperation;
    }
    function validateParams$C(modules, incomingParams) {
        var device = incomingParams.device, pushGateway = incomingParams.pushGateway, topic = incomingParams.topic;
        var config = modules.config;
        if (!device)
            return 'Missing Device ID (device)';
        if (!pushGateway)
            return 'Missing GW Type (pushGateway: gcm, apns or apns2)';
        if (pushGateway === 'apns2' && !topic)
            return 'Missing APNS2 topic';
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function getURL$A(modules, incomingParams) {
        var device = incomingParams.device, pushGateway = incomingParams.pushGateway;
        var config = modules.config;
        if (pushGateway === 'apns2') {
            return "/v2/push/sub-key/".concat(config.subscribeKey, "/devices-apns2/").concat(device, "/remove");
        }
        return "/v1/push/sub-key/".concat(config.subscribeKey, "/devices/").concat(device, "/remove");
    }
    function getRequestTimeout$C(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$C() {
        return true;
    }
    function prepareParams$C(modules, incomingParams) {
        var pushGateway = incomingParams.pushGateway, _a = incomingParams.environment, environment = _a === void 0 ? 'development' : _a, topic = incomingParams.topic;
        var parameters = { type: pushGateway };
        if (pushGateway === 'apns2') {
            parameters = __assign(__assign({}, parameters), { environment: environment, topic: topic });
            delete parameters.type;
        }
        return parameters;
    }
    function handleResponse$C() {
        return {};
    }

    var removeDevicePushConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$C,
        validateParams: validateParams$C,
        getURL: getURL$A,
        getRequestTimeout: getRequestTimeout$C,
        isAuthSupported: isAuthSupported$C,
        prepareParams: prepareParams$C,
        handleResponse: handleResponse$C
    });

    /*       */
    function getOperation$B() {
        return OPERATIONS.PNUnsubscribeOperation;
    }
    function validateParams$B(modules) {
        var config = modules.config;
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function getURL$z(modules, incomingParams) {
        var config = modules.config;
        var _a = incomingParams.channels, channels = _a === void 0 ? [] : _a;
        var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
        return "/v2/presence/sub-key/".concat(config.subscribeKey, "/channel/").concat(utils$5.encodeString(stringifiedChannels), "/leave");
    }
    function getRequestTimeout$B(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$B() {
        return true;
    }
    function prepareParams$B(modules, incomingParams) {
        var _a = incomingParams.channelGroups, channelGroups = _a === void 0 ? [] : _a;
        var params = {};
        if (channelGroups.length > 0) {
            params['channel-group'] = channelGroups.join(',');
        }
        return params;
    }
    function handleResponse$B() {
        return {};
    }

    var presenceLeaveEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$B,
        validateParams: validateParams$B,
        getURL: getURL$z,
        getRequestTimeout: getRequestTimeout$B,
        isAuthSupported: isAuthSupported$B,
        prepareParams: prepareParams$B,
        handleResponse: handleResponse$B
    });

    /*       */
    function getOperation$A() {
        return OPERATIONS.PNWhereNowOperation;
    }
    function validateParams$A(modules) {
        var config = modules.config;
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function getURL$y(modules, incomingParams) {
        var config = modules.config;
        var _a = incomingParams.uuid, uuid = _a === void 0 ? config.UUID : _a;
        return "/v2/presence/sub-key/".concat(config.subscribeKey, "/uuid/").concat(utils$5.encodeString(uuid));
    }
    function getRequestTimeout$A(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$A() {
        return true;
    }
    function prepareParams$A() {
        return {};
    }
    function handleResponse$A(modules, serverResponse) {
        // This is a quick fix for when the server does not include a payload
        // in where now responses
        if (!serverResponse.payload) {
            return { channels: [] };
        }
        return { channels: serverResponse.payload.channels };
    }

    var presenceWhereNowEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$A,
        validateParams: validateParams$A,
        getURL: getURL$y,
        getRequestTimeout: getRequestTimeout$A,
        isAuthSupported: isAuthSupported$A,
        prepareParams: prepareParams$A,
        handleResponse: handleResponse$A
    });

    /*       */
    function getOperation$z() {
        return OPERATIONS.PNHeartbeatOperation;
    }
    function validateParams$z(modules) {
        var config = modules.config;
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function getURL$x(modules, incomingParams) {
        var config = modules.config;
        var _a = incomingParams.channels, channels = _a === void 0 ? [] : _a;
        var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
        return "/v2/presence/sub-key/".concat(config.subscribeKey, "/channel/").concat(utils$5.encodeString(stringifiedChannels), "/heartbeat");
    }
    function isAuthSupported$z() {
        return true;
    }
    function getRequestTimeout$z(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function prepareParams$z(modules, incomingParams) {
        var _a = incomingParams.channelGroups, channelGroups = _a === void 0 ? [] : _a, _b = incomingParams.state, state = _b === void 0 ? {} : _b;
        var config = modules.config;
        var params = {};
        if (channelGroups.length > 0) {
            params['channel-group'] = channelGroups.join(',');
        }
        params.state = JSON.stringify(state);
        params.heartbeat = config.getPresenceTimeout();
        return params;
    }
    function handleResponse$z() {
        return {};
    }

    var presenceHeartbeatEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$z,
        validateParams: validateParams$z,
        getURL: getURL$x,
        isAuthSupported: isAuthSupported$z,
        getRequestTimeout: getRequestTimeout$z,
        prepareParams: prepareParams$z,
        handleResponse: handleResponse$z
    });

    /*       */
    function getOperation$y() {
        return OPERATIONS.PNGetStateOperation;
    }
    function validateParams$y(modules) {
        var config = modules.config;
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function getURL$w(modules, incomingParams) {
        var config = modules.config;
        var _a = incomingParams.uuid, uuid = _a === void 0 ? config.UUID : _a, _b = incomingParams.channels, channels = _b === void 0 ? [] : _b;
        var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
        return "/v2/presence/sub-key/".concat(config.subscribeKey, "/channel/").concat(utils$5.encodeString(stringifiedChannels), "/uuid/").concat(uuid);
    }
    function getRequestTimeout$y(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$y() {
        return true;
    }
    function prepareParams$y(modules, incomingParams) {
        var _a = incomingParams.channelGroups, channelGroups = _a === void 0 ? [] : _a;
        var params = {};
        if (channelGroups.length > 0) {
            params['channel-group'] = channelGroups.join(',');
        }
        return params;
    }
    function handleResponse$y(modules, serverResponse, incomingParams) {
        var _a = incomingParams.channels, channels = _a === void 0 ? [] : _a, _b = incomingParams.channelGroups, channelGroups = _b === void 0 ? [] : _b;
        var channelsResponse = {};
        if (channels.length === 1 && channelGroups.length === 0) {
            channelsResponse[channels[0]] = serverResponse.payload;
        }
        else {
            channelsResponse = serverResponse.payload;
        }
        return { channels: channelsResponse };
    }

    var presenceGetStateConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$y,
        validateParams: validateParams$y,
        getURL: getURL$w,
        getRequestTimeout: getRequestTimeout$y,
        isAuthSupported: isAuthSupported$y,
        prepareParams: prepareParams$y,
        handleResponse: handleResponse$y
    });

    /*       */
    function getOperation$x() {
        return OPERATIONS.PNSetStateOperation;
    }
    function validateParams$x(modules, incomingParams) {
        var config = modules.config;
        var state = incomingParams.state, _a = incomingParams.channels, channels = _a === void 0 ? [] : _a, _b = incomingParams.channelGroups, channelGroups = _b === void 0 ? [] : _b;
        if (!state)
            return 'Missing State';
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
        if (channels.length === 0 && channelGroups.length === 0) {
            return 'Please provide a list of channels and/or channel-groups';
        }
    }
    function getURL$v(modules, incomingParams) {
        var config = modules.config;
        var _a = incomingParams.channels, channels = _a === void 0 ? [] : _a;
        var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
        return "/v2/presence/sub-key/".concat(config.subscribeKey, "/channel/").concat(utils$5.encodeString(stringifiedChannels), "/uuid/").concat(utils$5.encodeString(config.UUID), "/data");
    }
    function getRequestTimeout$x(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$x() {
        return true;
    }
    function prepareParams$x(modules, incomingParams) {
        var state = incomingParams.state, _a = incomingParams.channelGroups, channelGroups = _a === void 0 ? [] : _a;
        var params = {};
        params.state = JSON.stringify(state);
        if (channelGroups.length > 0) {
            params['channel-group'] = channelGroups.join(',');
        }
        return params;
    }
    function handleResponse$x(modules, serverResponse) {
        return { state: serverResponse.payload };
    }

    var presenceSetStateConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$x,
        validateParams: validateParams$x,
        getURL: getURL$v,
        getRequestTimeout: getRequestTimeout$x,
        isAuthSupported: isAuthSupported$x,
        prepareParams: prepareParams$x,
        handleResponse: handleResponse$x
    });

    /*       */
    function getOperation$w() {
        return OPERATIONS.PNHereNowOperation;
    }
    function validateParams$w(modules) {
        var config = modules.config;
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function getURL$u(modules, incomingParams) {
        var config = modules.config;
        var _a = incomingParams.channels, channels = _a === void 0 ? [] : _a, _b = incomingParams.channelGroups, channelGroups = _b === void 0 ? [] : _b;
        var baseURL = "/v2/presence/sub-key/".concat(config.subscribeKey);
        if (channels.length > 0 || channelGroups.length > 0) {
            var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
            baseURL += "/channel/".concat(utils$5.encodeString(stringifiedChannels));
        }
        return baseURL;
    }
    function getRequestTimeout$w(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$w() {
        return true;
    }
    function prepareParams$w(modules, incomingParams) {
        var _a = incomingParams.channelGroups, channelGroups = _a === void 0 ? [] : _a, _b = incomingParams.includeUUIDs, includeUUIDs = _b === void 0 ? true : _b, _c = incomingParams.includeState, includeState = _c === void 0 ? false : _c, _d = incomingParams.queryParameters, queryParameters = _d === void 0 ? {} : _d;
        var params = {};
        if (!includeUUIDs)
            params.disable_uuids = 1;
        if (includeState)
            params.state = 1;
        if (channelGroups.length > 0) {
            params['channel-group'] = channelGroups.join(',');
        }
        params = __assign(__assign({}, params), queryParameters);
        return params;
    }
    function handleResponse$w(modules, serverResponse, incomingParams) {
        var _a = incomingParams.channels, channels = _a === void 0 ? [] : _a, _b = incomingParams.channelGroups, channelGroups = _b === void 0 ? [] : _b, _c = incomingParams.includeUUIDs, includeUUIDs = _c === void 0 ? true : _c, _d = incomingParams.includeState, includeState = _d === void 0 ? false : _d;
        var prepareSingularChannel = function () {
            var response = {};
            var occupantsList = [];
            response.totalChannels = 1;
            response.totalOccupancy = serverResponse.occupancy;
            response.channels = {};
            response.channels[channels[0]] = {
                occupants: occupantsList,
                name: channels[0],
                occupancy: serverResponse.occupancy,
            };
            // We have had issues in the past with server returning responses
            // that contain no uuids array
            if (includeUUIDs && serverResponse.uuids) {
                serverResponse.uuids.forEach(function (uuidEntry) {
                    if (includeState) {
                        occupantsList.push({ state: uuidEntry.state, uuid: uuidEntry.uuid });
                    }
                    else {
                        occupantsList.push({ state: null, uuid: uuidEntry });
                    }
                });
            }
            return response;
        };
        var prepareMultipleChannel = function () {
            var response = {};
            response.totalChannels = serverResponse.payload.total_channels;
            response.totalOccupancy = serverResponse.payload.total_occupancy;
            response.channels = {};
            Object.keys(serverResponse.payload.channels).forEach(function (channelName) {
                var channelEntry = serverResponse.payload.channels[channelName];
                var occupantsList = [];
                response.channels[channelName] = {
                    occupants: occupantsList,
                    name: channelName,
                    occupancy: channelEntry.occupancy,
                };
                if (includeUUIDs) {
                    channelEntry.uuids.forEach(function (uuidEntry) {
                        if (includeState) {
                            occupantsList.push({
                                state: uuidEntry.state,
                                uuid: uuidEntry.uuid,
                            });
                        }
                        else {
                            occupantsList.push({ state: null, uuid: uuidEntry });
                        }
                    });
                }
                return response;
            });
            return response;
        };
        var response;
        if (channels.length > 1 || channelGroups.length > 0 || (channelGroups.length === 0 && channels.length === 0)) {
            response = prepareMultipleChannel();
        }
        else {
            response = prepareSingularChannel();
        }
        return response;
    }
    function handleError(modules, params, status) {
        if (status.statusCode === 402 && !this.getURL(modules, params).includes('channel')) {
            status.errorData.message =
                'You have tried to perform a Global Here Now operation, ' +
                    'your keyset configuration does not support that. Please provide a channel, ' +
                    'or enable the Global Here Now feature from the Portal.';
        }
    }

    var presenceHereNowConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$w,
        validateParams: validateParams$w,
        getURL: getURL$u,
        getRequestTimeout: getRequestTimeout$w,
        isAuthSupported: isAuthSupported$w,
        prepareParams: prepareParams$w,
        handleResponse: handleResponse$w,
        handleError: handleError
    });

    /*       */
    function getOperation$v() {
        return OPERATIONS.PNAddMessageActionOperation;
    }
    function validateParams$v(_a, incomingParams) {
        var config = _a.config;
        var action = incomingParams.action, channel = incomingParams.channel, messageTimetoken = incomingParams.messageTimetoken;
        if (!messageTimetoken)
            return 'Missing message timetoken';
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
        if (!channel)
            return 'Missing message channel';
        if (!action)
            return 'Missing Action';
        if (!action.value)
            return 'Missing Action.value';
        if (!action.type)
            return 'Missing Action.type';
        if (action.type.length > 15)
            return 'Action.type value exceed maximum length of 15';
    }
    function usePost$4() {
        return true;
    }
    function postURL$4(_a, incomingParams) {
        var config = _a.config;
        var channel = incomingParams.channel, messageTimetoken = incomingParams.messageTimetoken;
        return "/v1/message-actions/".concat(config.subscribeKey, "/channel/").concat(utils$5.encodeString(channel), "/message/").concat(messageTimetoken);
    }
    function getRequestTimeout$v(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function getRequestHeaders() {
        return { 'Content-Type': 'application/json' };
    }
    function isAuthSupported$v() {
        return true;
    }
    function prepareParams$v() {
        return {};
    }
    function postPayload$4(modules, incomingParams) {
        return incomingParams.action;
    }
    function handleResponse$v(modules, addMessageActionResponse) {
        return { data: addMessageActionResponse.data };
    }

    var addMessageActionEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$v,
        validateParams: validateParams$v,
        usePost: usePost$4,
        postURL: postURL$4,
        getRequestTimeout: getRequestTimeout$v,
        getRequestHeaders: getRequestHeaders,
        isAuthSupported: isAuthSupported$v,
        prepareParams: prepareParams$v,
        postPayload: postPayload$4,
        handleResponse: handleResponse$v
    });

    /*       */
    function getOperation$u() {
        return OPERATIONS.PNRemoveMessageActionOperation;
    }
    function validateParams$u(_a, incomingParams) {
        var config = _a.config;
        var channel = incomingParams.channel, actionTimetoken = incomingParams.actionTimetoken, messageTimetoken = incomingParams.messageTimetoken;
        if (!messageTimetoken)
            return 'Missing message timetoken';
        if (!actionTimetoken)
            return 'Missing action timetoken';
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
        if (!channel)
            return 'Missing message channel';
    }
    function useDelete$3() {
        return true;
    }
    function getURL$t(_a, incomingParams) {
        var config = _a.config;
        var channel = incomingParams.channel, actionTimetoken = incomingParams.actionTimetoken, messageTimetoken = incomingParams.messageTimetoken;
        return "/v1/message-actions/".concat(config.subscribeKey, "/channel/").concat(utils$5.encodeString(channel), "/message/").concat(messageTimetoken, "/action/").concat(actionTimetoken);
    }
    function getRequestTimeout$u(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$u() {
        return true;
    }
    function prepareParams$u() {
        return {};
    }
    function handleResponse$u(modules, removeMessageActionResponse) {
        return { data: removeMessageActionResponse.data };
    }

    var removeMessageActionEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$u,
        validateParams: validateParams$u,
        useDelete: useDelete$3,
        getURL: getURL$t,
        getRequestTimeout: getRequestTimeout$u,
        isAuthSupported: isAuthSupported$u,
        prepareParams: prepareParams$u,
        handleResponse: handleResponse$u
    });

    /*       */
    function getOperation$t() {
        return OPERATIONS.PNGetMessageActionsOperation;
    }
    function validateParams$t(_a, incomingParams) {
        var config = _a.config;
        var channel = incomingParams.channel;
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
        if (!channel)
            return 'Missing message channel';
    }
    function getURL$s(_a, incomingParams) {
        var config = _a.config;
        var channel = incomingParams.channel;
        return "/v1/message-actions/".concat(config.subscribeKey, "/channel/").concat(utils$5.encodeString(channel));
    }
    function getRequestTimeout$t(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$t() {
        return true;
    }
    function prepareParams$t(modules, incomingParams) {
        var limit = incomingParams.limit, start = incomingParams.start, end = incomingParams.end;
        var outgoingParams = {};
        if (limit)
            outgoingParams.limit = limit;
        if (start)
            outgoingParams.start = start;
        if (end)
            outgoingParams.end = end;
        return outgoingParams;
    }
    function handleResponse$t(modules, getMessageActionsResponse) {
        /** @type GetMessageActionsResponse */
        var response = { data: getMessageActionsResponse.data, start: null, end: null };
        if (response.data.length) {
            response.end = response.data[response.data.length - 1].actionTimetoken;
            response.start = response.data[0].actionTimetoken;
        }
        return response;
    }

    var getMessageActionEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$t,
        validateParams: validateParams$t,
        getURL: getURL$s,
        getRequestTimeout: getRequestTimeout$t,
        isAuthSupported: isAuthSupported$t,
        prepareParams: prepareParams$t,
        handleResponse: handleResponse$t
    });

    /**       */
    var endpoint$j = {
        getOperation: function () { return OPERATIONS.PNListFilesOperation; },
        validateParams: function (_, params) {
            if (!(params === null || params === void 0 ? void 0 : params.channel)) {
                return "channel can't be empty";
            }
        },
        getURL: function (_a, params) {
            var config = _a.config;
            return "/v1/files/".concat(config.subscribeKey, "/channels/").concat(utils$5.encodeString(params.channel), "/files");
        },
        getRequestTimeout: function (_a) {
            var config = _a.config;
            return config.getTransactionTimeout();
        },
        isAuthSupported: function () { return true; },
        prepareParams: function (_, params) {
            var outParams = {};
            if (params.limit) {
                outParams.limit = params.limit;
            }
            if (params.next) {
                outParams.next = params.next;
            }
            return outParams;
        },
        handleResponse: function (_, response) { return ({
            status: response.status,
            data: response.data,
            next: response.next,
            count: response.count,
        }); },
    };

    /**       */
    var endpoint$i = {
        getOperation: function () { return OPERATIONS.PNGenerateUploadUrlOperation; },
        validateParams: function (_, params) {
            if (!(params === null || params === void 0 ? void 0 : params.channel)) {
                return "channel can't be empty";
            }
            if (!(params === null || params === void 0 ? void 0 : params.name)) {
                return "name can't be empty";
            }
        },
        usePost: function () { return true; },
        postURL: function (_a, params) {
            var config = _a.config;
            return "/v1/files/".concat(config.subscribeKey, "/channels/").concat(utils$5.encodeString(params.channel), "/generate-upload-url");
        },
        postPayload: function (_, params) { return ({
            name: params.name,
        }); },
        getRequestTimeout: function (_a) {
            var config = _a.config;
            return config.getTransactionTimeout();
        },
        isAuthSupported: function () { return true; },
        prepareParams: function () { return ({}); },
        handleResponse: function (_, response) { return ({
            status: response.status,
            data: response.data,
            file_upload_request: response.file_upload_request,
        }); },
    };

    /**       */
    var preparePayload = function (_a, payload) {
        var crypto = _a.crypto, config = _a.config;
        var stringifiedPayload = JSON.stringify(payload);
        if (config.cipherKey) {
            stringifiedPayload = crypto.encrypt(stringifiedPayload);
            stringifiedPayload = JSON.stringify(stringifiedPayload);
        }
        return stringifiedPayload || '';
    };
    var endpoint$h = {
        getOperation: function () { return OPERATIONS.PNPublishFileOperation; },
        validateParams: function (_, params) {
            if (!(params === null || params === void 0 ? void 0 : params.channel)) {
                return "channel can't be empty";
            }
            if (!(params === null || params === void 0 ? void 0 : params.fileId)) {
                return "file id can't be empty";
            }
            if (!(params === null || params === void 0 ? void 0 : params.fileName)) {
                return "file name can't be empty";
            }
        },
        getURL: function (modules, params) {
            var _a = modules.config, publishKey = _a.publishKey, subscribeKey = _a.subscribeKey;
            var message = {
                message: params.message,
                file: {
                    name: params.fileName,
                    id: params.fileId,
                },
            };
            var payload = preparePayload(modules, message);
            return "/v1/files/publish-file/".concat(publishKey, "/").concat(subscribeKey, "/0/").concat(utils$5.encodeString(params.channel), "/0/").concat(utils$5.encodeString(payload));
        },
        getRequestTimeout: function (_a) {
            var config = _a.config;
            return config.getTransactionTimeout();
        },
        isAuthSupported: function () { return true; },
        prepareParams: function (_, params) {
            var outParams = {};
            if (params.ttl) {
                outParams.ttl = params.ttl;
            }
            if (params.storeInHistory !== undefined) {
                outParams.store = params.storeInHistory ? '1' : '0';
            }
            if (params.meta && typeof params.meta === 'object') {
                outParams.meta = JSON.stringify(params.meta);
            }
            return outParams;
        },
        handleResponse: function (_, response) { return ({
            timetoken: response['2'],
        }); },
    };

    var getErrorFromResponse = function (response) {
        return new Promise(function (resolve) {
            var result = '';
            response.on('data', function (data) {
                result += data.toString('utf8');
            });
            response.on('end', function () {
                resolve(result);
            });
        });
    };
    var sendFile = function (_a) {
        var _this = this;
        var generateUploadUrl = _a.generateUploadUrl, publishFile = _a.publishFile, _b = _a.modules, PubNubFile = _b.PubNubFile, config = _b.config, cryptography = _b.cryptography, networking = _b.networking;
        return function (_a) {
            var channel = _a.channel, input = _a.file, message = _a.message, cipherKey = _a.cipherKey, meta = _a.meta, ttl = _a.ttl, storeInHistory = _a.storeInHistory;
            return __awaiter(_this, void 0, void 0, function () {
                var file, _b, _c, url, formFields, _d, id, name, formFieldsWithMimeType, result, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, e_1, errorBody, reason, retries, wasSuccessful, publishResult;
                return __generator(this, function (_s) {
                    switch (_s.label) {
                        case 0:
                            if (!channel) {
                                throw new PubNubError('Validation failed, check status for details', createValidationError("channel can't be empty"));
                            }
                            if (!input) {
                                throw new PubNubError('Validation failed, check status for details', createValidationError("file can't be empty"));
                            }
                            file = PubNubFile.create(input);
                            return [4 /*yield*/, generateUploadUrl({ channel: channel, name: file.name })];
                        case 1:
                            _b = _s.sent(), _c = _b.file_upload_request, url = _c.url, formFields = _c.form_fields, _d = _b.data, id = _d.id, name = _d.name;
                            if (!(PubNubFile.supportsEncryptFile && (cipherKey !== null && cipherKey !== void 0 ? cipherKey : config.cipherKey))) return [3 /*break*/, 3];
                            return [4 /*yield*/, cryptography.encryptFile(cipherKey !== null && cipherKey !== void 0 ? cipherKey : config.cipherKey, file, PubNubFile)];
                        case 2:
                            file = _s.sent();
                            _s.label = 3;
                        case 3:
                            formFieldsWithMimeType = formFields;
                            if (file.mimeType) {
                                formFieldsWithMimeType = formFields.map(function (entry) {
                                    if (entry.key === 'Content-Type')
                                        return { key: entry.key, value: file.mimeType };
                                    return entry;
                                });
                            }
                            _s.label = 4;
                        case 4:
                            _s.trys.push([4, 18, , 20]);
                            if (!(PubNubFile.supportsFileUri && input.uri)) return [3 /*break*/, 7];
                            _f = (_e = networking).POSTFILE;
                            _g = [url, formFieldsWithMimeType];
                            return [4 /*yield*/, file.toFileUri()];
                        case 5: return [4 /*yield*/, _f.apply(_e, _g.concat([_s.sent()]))];
                        case 6:
                            result = _s.sent();
                            return [3 /*break*/, 17];
                        case 7:
                            if (!PubNubFile.supportsFile) return [3 /*break*/, 10];
                            _j = (_h = networking).POSTFILE;
                            _k = [url, formFieldsWithMimeType];
                            return [4 /*yield*/, file.toFile()];
                        case 8: return [4 /*yield*/, _j.apply(_h, _k.concat([_s.sent()]))];
                        case 9:
                            result = _s.sent();
                            return [3 /*break*/, 17];
                        case 10:
                            if (!PubNubFile.supportsBuffer) return [3 /*break*/, 13];
                            _m = (_l = networking).POSTFILE;
                            _o = [url, formFieldsWithMimeType];
                            return [4 /*yield*/, file.toBuffer()];
                        case 11: return [4 /*yield*/, _m.apply(_l, _o.concat([_s.sent()]))];
                        case 12:
                            result = _s.sent();
                            return [3 /*break*/, 17];
                        case 13:
                            if (!PubNubFile.supportsBlob) return [3 /*break*/, 16];
                            _q = (_p = networking).POSTFILE;
                            _r = [url, formFieldsWithMimeType];
                            return [4 /*yield*/, file.toBlob()];
                        case 14: return [4 /*yield*/, _q.apply(_p, _r.concat([_s.sent()]))];
                        case 15:
                            result = _s.sent();
                            return [3 /*break*/, 17];
                        case 16: throw new Error('Unsupported environment');
                        case 17: return [3 /*break*/, 20];
                        case 18:
                            e_1 = _s.sent();
                            return [4 /*yield*/, getErrorFromResponse(e_1.response)];
                        case 19:
                            errorBody = _s.sent();
                            reason = /<Message>(.*)<\/Message>/gi.exec(errorBody);
                            throw new PubNubError(reason ? "Upload to bucket failed: ".concat(reason[1]) : 'Upload to bucket failed.', e_1);
                        case 20:
                            if (result.status !== 204) {
                                throw new PubNubError('Upload to bucket was unsuccessful', result);
                            }
                            retries = config.fileUploadPublishRetryLimit;
                            wasSuccessful = false;
                            publishResult = { timetoken: '0' };
                            _s.label = 21;
                        case 21:
                            _s.trys.push([21, 23, , 24]);
                            return [4 /*yield*/, publishFile({
                                    channel: channel,
                                    message: message,
                                    fileId: id,
                                    fileName: name,
                                    meta: meta,
                                    storeInHistory: storeInHistory,
                                    ttl: ttl,
                                })];
                        case 22:
                            /* eslint-disable-next-line no-await-in-loop */
                            publishResult = _s.sent();
                            wasSuccessful = true;
                            return [3 /*break*/, 24];
                        case 23:
                            _s.sent();
                            retries -= 1;
                            return [3 /*break*/, 24];
                        case 24:
                            if (!wasSuccessful && retries > 0) return [3 /*break*/, 21];
                            _s.label = 25;
                        case 25:
                            if (!wasSuccessful) {
                                throw new PubNubError('Publish failed. You may want to execute that operation manually using pubnub.publishFile', {
                                    channel: channel,
                                    id: id,
                                    name: name,
                                });
                            }
                            else {
                                return [2 /*return*/, {
                                        timetoken: publishResult.timetoken,
                                        id: id,
                                        name: name,
                                    }];
                            }
                    }
                });
            });
        };
    };
    var sendFileFunction = (function (deps) {
        var f = sendFile(deps);
        return function (params, cb) {
            var resultP = f(params);
            if (typeof cb === 'function') {
                resultP.then(function (result) { return cb(null, result); }).catch(function (error) { return cb(error, null); });
                return resultP;
            }
            return resultP;
        };
    });

    /**       */
    var getFileUrlFunction = (function (modules, _a) {
        var channel = _a.channel, id = _a.id, name = _a.name;
        var config = modules.config, networking = modules.networking;
        if (!channel) {
            throw new PubNubError('Validation failed, check status for details', createValidationError("channel can't be empty"));
        }
        if (!id) {
            throw new PubNubError('Validation failed, check status for details', createValidationError("file id can't be empty"));
        }
        if (!name) {
            throw new PubNubError('Validation failed, check status for details', createValidationError("file name can't be empty"));
        }
        var url = "/v1/files/".concat(config.subscribeKey, "/channels/").concat(utils$5.encodeString(channel), "/files/").concat(id, "/").concat(name);
        var params = {};
        params.uuid = config.getUUID();
        params.pnsdk = generatePNSDK(config);
        if (config.getAuthKey()) {
            params.auth = config.getAuthKey();
        }
        if (config.secretKey) {
            signRequest(modules, url, params, {}, {
                getOperation: function () { return 'PubNubGetFileUrlOperation'; },
            });
        }
        var queryParams = Object.keys(params)
            .map(function (key) { return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(params[key])); })
            .join('&');
        if (queryParams !== '') {
            return "".concat(networking.getStandardOrigin()).concat(url, "?").concat(queryParams);
        }
        return "".concat(networking.getStandardOrigin()).concat(url);
    });

    /**       */
    var endpoint$g = {
        getOperation: function () { return OPERATIONS.PNDownloadFileOperation; },
        validateParams: function (_, params) {
            if (!(params === null || params === void 0 ? void 0 : params.channel)) {
                return "channel can't be empty";
            }
            if (!(params === null || params === void 0 ? void 0 : params.name)) {
                return "name can't be empty";
            }
            if (!(params === null || params === void 0 ? void 0 : params.id)) {
                return "id can't be empty";
            }
        },
        useGetFile: function () { return true; },
        getFileURL: function (_a, params) {
            var config = _a.config;
            return "/v1/files/".concat(config.subscribeKey, "/channels/").concat(utils$5.encodeString(params.channel), "/files/").concat(params.id, "/").concat(params.name);
        },
        getRequestTimeout: function (_a) {
            var config = _a.config;
            return config.getTransactionTimeout();
        },
        isAuthSupported: function () { return true; },
        ignoreBody: function () { return true; },
        forceBuffered: function () { return true; },
        prepareParams: function () { return ({}); },
        handleResponse: function (_a, res, params) {
            var PubNubFile = _a.PubNubFile, config = _a.config, cryptography = _a.cryptography;
            return __awaiter(void 0, void 0, void 0, function () {
                var body;
                var _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            body = res.response.body;
                            if (!(PubNubFile.supportsEncryptFile && ((_b = params.cipherKey) !== null && _b !== void 0 ? _b : config.cipherKey))) return [3 /*break*/, 2];
                            return [4 /*yield*/, cryptography.decrypt((_c = params.cipherKey) !== null && _c !== void 0 ? _c : config.cipherKey, body)];
                        case 1:
                            body = _e.sent();
                            _e.label = 2;
                        case 2: return [2 /*return*/, PubNubFile.create({
                                data: body,
                                name: (_d = res.response.name) !== null && _d !== void 0 ? _d : params.name,
                                mimeType: res.response.type,
                            })];
                    }
                });
            });
        },
    };

    /**       */
    var endpoint$f = {
        getOperation: function () { return OPERATIONS.PNListFilesOperation; },
        validateParams: function (_, params) {
            if (!(params === null || params === void 0 ? void 0 : params.channel)) {
                return "channel can't be empty";
            }
            if (!(params === null || params === void 0 ? void 0 : params.id)) {
                return "file id can't be empty";
            }
            if (!(params === null || params === void 0 ? void 0 : params.name)) {
                return "file name can't be empty";
            }
        },
        useDelete: function () { return true; },
        getURL: function (_a, params) {
            var config = _a.config;
            return "/v1/files/".concat(config.subscribeKey, "/channels/").concat(utils$5.encodeString(params.channel), "/files/").concat(params.id, "/").concat(params.name);
        },
        getRequestTimeout: function (_a) {
            var config = _a.config;
            return config.getTransactionTimeout();
        },
        isAuthSupported: function () { return true; },
        prepareParams: function () { return ({}); },
        handleResponse: function (_, response) { return ({
            status: response.status,
        }); },
    };

    /**       */
    var endpoint$e = {
        getOperation: function () { return OPERATIONS.PNGetAllUUIDMetadataOperation; },
        validateParams: function () {
            // No required parameters.
        },
        getURL: function (_a) {
            var config = _a.config;
            return "/v2/objects/".concat(config.subscribeKey, "/uuids");
        },
        getRequestTimeout: function (_a) {
            var config = _a.config;
            return config.getTransactionTimeout();
        },
        isAuthSupported: function () { return true; },
        prepareParams: function (_modules, params) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            var queryParams = {};
            if ((_a = params === null || params === void 0 ? void 0 : params.include) === null || _a === void 0 ? void 0 : _a.customFields) {
                queryParams.include = 'custom';
            }
            if ((_b = params === null || params === void 0 ? void 0 : params.include) === null || _b === void 0 ? void 0 : _b.totalCount) {
                queryParams.count = (_c = params.include) === null || _c === void 0 ? void 0 : _c.totalCount;
            }
            if ((_d = params === null || params === void 0 ? void 0 : params.page) === null || _d === void 0 ? void 0 : _d.next) {
                queryParams.start = (_e = params.page) === null || _e === void 0 ? void 0 : _e.next;
            }
            if ((_f = params === null || params === void 0 ? void 0 : params.page) === null || _f === void 0 ? void 0 : _f.prev) {
                queryParams.end = (_g = params.page) === null || _g === void 0 ? void 0 : _g.prev;
            }
            if (params === null || params === void 0 ? void 0 : params.filter) {
                queryParams.filter = params.filter;
            }
            queryParams.limit = (_h = params === null || params === void 0 ? void 0 : params.limit) !== null && _h !== void 0 ? _h : 100;
            if (params === null || params === void 0 ? void 0 : params.sort) {
                queryParams.sort = Object.entries((_j = params.sort) !== null && _j !== void 0 ? _j : {}).map(function (_a) {
                    var _b = __read$1(_a, 2), key = _b[0], value = _b[1];
                    if (value === 'asc' || value === 'desc') {
                        return "".concat(key, ":").concat(value);
                    }
                    return key;
                });
            }
            return queryParams;
        },
        handleResponse: function (_, response) { return ({
            status: response.status,
            data: response.data,
            totalCount: response.totalCount,
            next: response.next,
            prev: response.prev,
        }); },
    };

    /**       */
    var endpoint$d = {
        getOperation: function () { return OPERATIONS.PNGetUUIDMetadataOperation; },
        validateParams: function () {
            // No required parameters.
        },
        getURL: function (_a, params) {
            var _b;
            var config = _a.config;
            return "/v2/objects/".concat(config.subscribeKey, "/uuids/").concat(utils$5.encodeString((_b = params === null || params === void 0 ? void 0 : params.uuid) !== null && _b !== void 0 ? _b : config.getUUID()));
        },
        getRequestTimeout: function (_a) {
            var config = _a.config;
            return config.getTransactionTimeout();
        },
        isAuthSupported: function () { return true; },
        prepareParams: function (_a, params) {
            var _b, _c, _d;
            var config = _a.config;
            return ({
                uuid: (_b = params === null || params === void 0 ? void 0 : params.uuid) !== null && _b !== void 0 ? _b : config.getUUID(),
                include: ((_d = (_c = params === null || params === void 0 ? void 0 : params.include) === null || _c === void 0 ? void 0 : _c.customFields) !== null && _d !== void 0 ? _d : true) && 'custom',
            });
        },
        handleResponse: function (_, response) { return ({
            status: response.status,
            data: response.data,
        }); },
    };

    /**       */
    var endpoint$c = {
        getOperation: function () { return OPERATIONS.PNSetUUIDMetadataOperation; },
        validateParams: function (_, params) {
            if (!(params === null || params === void 0 ? void 0 : params.data)) {
                return 'Data cannot be empty';
            }
        },
        usePatch: function () { return true; },
        patchURL: function (_a, params) {
            var _b;
            var config = _a.config;
            return "/v2/objects/".concat(config.subscribeKey, "/uuids/").concat(utils$5.encodeString((_b = params.uuid) !== null && _b !== void 0 ? _b : config.getUUID()));
        },
        patchPayload: function (_, params) { return params.data; },
        getRequestTimeout: function (_a) {
            var config = _a.config;
            return config.getTransactionTimeout();
        },
        isAuthSupported: function () { return true; },
        prepareParams: function (_a, params) {
            var _b, _c, _d;
            var config = _a.config;
            return ({
                uuid: (_b = params === null || params === void 0 ? void 0 : params.uuid) !== null && _b !== void 0 ? _b : config.getUUID(),
                include: ((_d = (_c = params === null || params === void 0 ? void 0 : params.include) === null || _c === void 0 ? void 0 : _c.customFields) !== null && _d !== void 0 ? _d : true) && 'custom',
            });
        },
        handleResponse: function (_, response) { return ({
            status: response.status,
            data: response.data,
        }); },
    };

    /**       */
    var endpoint$b = {
        getOperation: function () { return OPERATIONS.PNRemoveUUIDMetadataOperation; },
        validateParams: function () {
            // No required parameters.
        },
        getURL: function (_a, params) {
            var _b;
            var config = _a.config;
            return "/v2/objects/".concat(config.subscribeKey, "/uuids/").concat(utils$5.encodeString((_b = params === null || params === void 0 ? void 0 : params.uuid) !== null && _b !== void 0 ? _b : config.getUUID()));
        },
        useDelete: function () { return true; },
        getRequestTimeout: function (_a) {
            var config = _a.config;
            return config.getTransactionTimeout();
        },
        isAuthSupported: function () { return true; },
        prepareParams: function (_a, params) {
            var _b;
            var config = _a.config;
            return ({
                uuid: (_b = params === null || params === void 0 ? void 0 : params.uuid) !== null && _b !== void 0 ? _b : config.getUUID(),
            });
        },
        handleResponse: function (_, response) { return ({
            status: response.status,
            data: response.data,
        }); },
    };

    /**       */
    var endpoint$a = {
        getOperation: function () { return OPERATIONS.PNGetAllChannelMetadataOperation; },
        validateParams: function () {
            // No required parameters.
        },
        getURL: function (_a) {
            var config = _a.config;
            return "/v2/objects/".concat(config.subscribeKey, "/channels");
        },
        getRequestTimeout: function (_a) {
            var config = _a.config;
            return config.getTransactionTimeout();
        },
        isAuthSupported: function () { return true; },
        prepareParams: function (_modules, params) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            var queryParams = {};
            if ((_a = params === null || params === void 0 ? void 0 : params.include) === null || _a === void 0 ? void 0 : _a.customFields) {
                queryParams.include = 'custom';
            }
            if ((_b = params === null || params === void 0 ? void 0 : params.include) === null || _b === void 0 ? void 0 : _b.totalCount) {
                queryParams.count = (_c = params.include) === null || _c === void 0 ? void 0 : _c.totalCount;
            }
            if ((_d = params === null || params === void 0 ? void 0 : params.page) === null || _d === void 0 ? void 0 : _d.next) {
                queryParams.start = (_e = params.page) === null || _e === void 0 ? void 0 : _e.next;
            }
            if ((_f = params === null || params === void 0 ? void 0 : params.page) === null || _f === void 0 ? void 0 : _f.prev) {
                queryParams.end = (_g = params.page) === null || _g === void 0 ? void 0 : _g.prev;
            }
            if (params === null || params === void 0 ? void 0 : params.filter) {
                queryParams.filter = params.filter;
            }
            queryParams.limit = (_h = params === null || params === void 0 ? void 0 : params.limit) !== null && _h !== void 0 ? _h : 100;
            if (params === null || params === void 0 ? void 0 : params.sort) {
                queryParams.sort = Object.entries((_j = params.sort) !== null && _j !== void 0 ? _j : {}).map(function (_a) {
                    var _b = __read$1(_a, 2), key = _b[0], value = _b[1];
                    if (value === 'asc' || value === 'desc') {
                        return "".concat(key, ":").concat(value);
                    }
                    return key;
                });
            }
            return queryParams;
        },
        handleResponse: function (_, response) { return ({
            status: response.status,
            data: response.data,
            totalCount: response.totalCount,
            prev: response.prev,
            next: response.next,
        }); },
    };

    /**       */
    var endpoint$9 = {
        getOperation: function () { return OPERATIONS.PNGetChannelMetadataOperation; },
        validateParams: function (_, params) {
            if (!(params === null || params === void 0 ? void 0 : params.channel)) {
                return 'Channel cannot be empty';
            }
        },
        getURL: function (_a, params) {
            var config = _a.config;
            return "/v2/objects/".concat(config.subscribeKey, "/channels/").concat(utils$5.encodeString(params.channel));
        },
        getRequestTimeout: function (_a) {
            var config = _a.config;
            return config.getTransactionTimeout();
        },
        isAuthSupported: function () { return true; },
        prepareParams: function (_, params) {
            var _a, _b;
            return ({
                include: ((_b = (_a = params === null || params === void 0 ? void 0 : params.include) === null || _a === void 0 ? void 0 : _a.customFields) !== null && _b !== void 0 ? _b : true) && 'custom',
            });
        },
        handleResponse: function (_, response) { return ({
            status: response.status,
            data: response.data,
        }); },
    };

    /**       */
    var endpoint$8 = {
        getOperation: function () { return OPERATIONS.PNSetChannelMetadataOperation; },
        validateParams: function (_, params) {
            if (!(params === null || params === void 0 ? void 0 : params.channel)) {
                return 'Channel cannot be empty';
            }
            if (!(params === null || params === void 0 ? void 0 : params.data)) {
                return 'Data cannot be empty';
            }
        },
        usePatch: function () { return true; },
        patchURL: function (_a, params) {
            var config = _a.config;
            return "/v2/objects/".concat(config.subscribeKey, "/channels/").concat(utils$5.encodeString(params.channel));
        },
        patchPayload: function (_, params) { return params.data; },
        getRequestTimeout: function (_a) {
            var config = _a.config;
            return config.getTransactionTimeout();
        },
        isAuthSupported: function () { return true; },
        prepareParams: function (_, params) {
            var _a, _b;
            return ({
                include: ((_b = (_a = params === null || params === void 0 ? void 0 : params.include) === null || _a === void 0 ? void 0 : _a.customFields) !== null && _b !== void 0 ? _b : true) && 'custom',
            });
        },
        handleResponse: function (_, response) { return ({
            status: response.status,
            data: response.data,
        }); },
    };

    /**       */
    var endpoint$7 = {
        getOperation: function () { return OPERATIONS.PNRemoveChannelMetadataOperation; },
        validateParams: function (_, params) {
            if (!(params === null || params === void 0 ? void 0 : params.channel)) {
                return 'Channel cannot be empty';
            }
        },
        getURL: function (_a, params) {
            var config = _a.config;
            return "/v2/objects/".concat(config.subscribeKey, "/channels/").concat(utils$5.encodeString(params.channel));
        },
        useDelete: function () { return true; },
        getRequestTimeout: function (_a) {
            var config = _a.config;
            return config.getTransactionTimeout();
        },
        isAuthSupported: function () { return true; },
        prepareParams: function () { return ({}); },
        handleResponse: function (_, response) { return ({
            status: response.status,
            data: response.data,
        }); },
    };

    /**       */
    var endpoint$6 = {
        getOperation: function () { return OPERATIONS.PNGetMembersOperation; },
        validateParams: function (_, params) {
            if (!(params === null || params === void 0 ? void 0 : params.channel)) {
                return 'UUID cannot be empty';
            }
        },
        getURL: function (_a, params) {
            var config = _a.config;
            return "/v2/objects/".concat(config.subscribeKey, "/channels/").concat(utils$5.encodeString(params.channel), "/uuids");
        },
        getRequestTimeout: function (_a) {
            var config = _a.config;
            return config.getTransactionTimeout();
        },
        isAuthSupported: function () { return true; },
        prepareParams: function (_modules, params) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            var queryParams = {};
            if (params === null || params === void 0 ? void 0 : params.include) {
                queryParams.include = [];
                if ((_a = params.include) === null || _a === void 0 ? void 0 : _a.customFields) {
                    queryParams.include.push('custom');
                }
                if ((_b = params.include) === null || _b === void 0 ? void 0 : _b.customUUIDFields) {
                    queryParams.include.push('uuid.custom');
                }
                if ((_d = (_c = params.include) === null || _c === void 0 ? void 0 : _c.UUIDFields) !== null && _d !== void 0 ? _d : true) {
                    queryParams.include.push('uuid');
                }
                queryParams.include = queryParams.include.join(',');
            }
            if ((_e = params === null || params === void 0 ? void 0 : params.include) === null || _e === void 0 ? void 0 : _e.totalCount) {
                queryParams.count = (_f = params.include) === null || _f === void 0 ? void 0 : _f.totalCount;
            }
            if ((_g = params === null || params === void 0 ? void 0 : params.page) === null || _g === void 0 ? void 0 : _g.next) {
                queryParams.start = (_h = params.page) === null || _h === void 0 ? void 0 : _h.next;
            }
            if ((_j = params === null || params === void 0 ? void 0 : params.page) === null || _j === void 0 ? void 0 : _j.prev) {
                queryParams.end = (_k = params.page) === null || _k === void 0 ? void 0 : _k.prev;
            }
            if (params === null || params === void 0 ? void 0 : params.filter) {
                queryParams.filter = params.filter;
            }
            queryParams.limit = (_l = params === null || params === void 0 ? void 0 : params.limit) !== null && _l !== void 0 ? _l : 100;
            if (params === null || params === void 0 ? void 0 : params.sort) {
                queryParams.sort = Object.entries((_m = params.sort) !== null && _m !== void 0 ? _m : {}).map(function (_a) {
                    var _b = __read$1(_a, 2), key = _b[0], value = _b[1];
                    if (value === 'asc' || value === 'desc') {
                        return "".concat(key, ":").concat(value);
                    }
                    return key;
                });
            }
            return queryParams;
        },
        handleResponse: function (_, response) { return ({
            status: response.status,
            data: response.data,
            totalCount: response.totalCount,
            prev: response.prev,
            next: response.next,
        }); },
    };

    /**       */
    var endpoint$5 = {
        getOperation: function () { return OPERATIONS.PNSetMembersOperation; },
        validateParams: function (_, params) {
            if (!(params === null || params === void 0 ? void 0 : params.channel)) {
                return 'Channel cannot be empty';
            }
            if (!(params === null || params === void 0 ? void 0 : params.uuids) || (params === null || params === void 0 ? void 0 : params.uuids.length) === 0) {
                return 'UUIDs cannot be empty';
            }
        },
        usePatch: function () { return true; },
        patchURL: function (_a, params) {
            var config = _a.config;
            return "/v2/objects/".concat(config.subscribeKey, "/channels/").concat(utils$5.encodeString(params.channel), "/uuids");
        },
        patchPayload: function (_, params) {
            var _a;
            return (_a = {
                    set: [],
                    remove: []
                },
                _a[params.type] = params.uuids.map(function (uuid) {
                    if (typeof uuid === 'string') {
                        return {
                            uuid: {
                                id: uuid,
                            },
                        };
                    }
                    return {
                        uuid: { id: uuid.id },
                        custom: uuid.custom,
                    };
                }),
                _a);
        },
        getRequestTimeout: function (_a) {
            var config = _a.config;
            return config.getTransactionTimeout();
        },
        isAuthSupported: function () { return true; },
        prepareParams: function (_modules, params) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            var queryParams = {};
            if (params === null || params === void 0 ? void 0 : params.include) {
                queryParams.include = [];
                if ((_a = params.include) === null || _a === void 0 ? void 0 : _a.customFields) {
                    queryParams.include.push('custom');
                }
                if ((_b = params.include) === null || _b === void 0 ? void 0 : _b.customUUIDFields) {
                    queryParams.include.push('uuid.custom');
                }
                if ((_c = params.include) === null || _c === void 0 ? void 0 : _c.UUIDFields) {
                    queryParams.include.push('uuid');
                }
                queryParams.include = queryParams.include.join(',');
            }
            if ((_d = params === null || params === void 0 ? void 0 : params.include) === null || _d === void 0 ? void 0 : _d.totalCount) {
                queryParams.count = true;
            }
            if ((_e = params === null || params === void 0 ? void 0 : params.page) === null || _e === void 0 ? void 0 : _e.next) {
                queryParams.start = (_f = params.page) === null || _f === void 0 ? void 0 : _f.next;
            }
            if ((_g = params === null || params === void 0 ? void 0 : params.page) === null || _g === void 0 ? void 0 : _g.prev) {
                queryParams.end = (_h = params.page) === null || _h === void 0 ? void 0 : _h.prev;
            }
            if (params === null || params === void 0 ? void 0 : params.filter) {
                queryParams.filter = params.filter;
            }
            if (params === null || params === void 0 ? void 0 : params.limit) {
                queryParams.limit = params.limit;
            }
            if (params === null || params === void 0 ? void 0 : params.sort) {
                queryParams.sort = Object.entries((_j = params.sort) !== null && _j !== void 0 ? _j : {}).map(function (_a) {
                    var _b = __read$1(_a, 2), key = _b[0], value = _b[1];
                    if (value === 'asc' || value === 'desc') {
                        return "".concat(key, ":").concat(value);
                    }
                    return key;
                });
            }
            return queryParams;
        },
        handleResponse: function (_, response) { return ({
            status: response.status,
            data: response.data,
            totalCount: response.totalCount,
            prev: response.prev,
            next: response.next,
        }); },
    };

    /**       */
    var endpoint$4 = {
        getOperation: function () { return OPERATIONS.PNGetMembershipsOperation; },
        validateParams: function () {
            // No required parameters.
        },
        getURL: function (_a, params) {
            var _b;
            var config = _a.config;
            return "/v2/objects/".concat(config.subscribeKey, "/uuids/").concat(utils$5.encodeString((_b = params === null || params === void 0 ? void 0 : params.uuid) !== null && _b !== void 0 ? _b : config.getUUID()), "/channels");
        },
        getRequestTimeout: function (_a) {
            var config = _a.config;
            return config.getTransactionTimeout();
        },
        isAuthSupported: function () { return true; },
        prepareParams: function (_modules, params) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            var queryParams = {};
            if (params === null || params === void 0 ? void 0 : params.include) {
                queryParams.include = [];
                if ((_a = params.include) === null || _a === void 0 ? void 0 : _a.customFields) {
                    queryParams.include.push('custom');
                }
                if ((_b = params.include) === null || _b === void 0 ? void 0 : _b.customChannelFields) {
                    queryParams.include.push('channel.custom');
                }
                if ((_c = params.include) === null || _c === void 0 ? void 0 : _c.channelFields) {
                    queryParams.include.push('channel');
                }
                queryParams.include = queryParams.include.join(',');
            }
            if ((_d = params === null || params === void 0 ? void 0 : params.include) === null || _d === void 0 ? void 0 : _d.totalCount) {
                queryParams.count = (_e = params.include) === null || _e === void 0 ? void 0 : _e.totalCount;
            }
            if ((_f = params === null || params === void 0 ? void 0 : params.page) === null || _f === void 0 ? void 0 : _f.next) {
                queryParams.start = (_g = params.page) === null || _g === void 0 ? void 0 : _g.next;
            }
            if ((_h = params === null || params === void 0 ? void 0 : params.page) === null || _h === void 0 ? void 0 : _h.prev) {
                queryParams.end = (_j = params.page) === null || _j === void 0 ? void 0 : _j.prev;
            }
            if (params === null || params === void 0 ? void 0 : params.filter) {
                queryParams.filter = params.filter;
            }
            queryParams.limit = (_k = params === null || params === void 0 ? void 0 : params.limit) !== null && _k !== void 0 ? _k : 100;
            if (params === null || params === void 0 ? void 0 : params.sort) {
                queryParams.sort = Object.entries((_l = params.sort) !== null && _l !== void 0 ? _l : {}).map(function (_a) {
                    var _b = __read$1(_a, 2), key = _b[0], value = _b[1];
                    if (value === 'asc' || value === 'desc') {
                        return "".concat(key, ":").concat(value);
                    }
                    return key;
                });
            }
            return queryParams;
        },
        handleResponse: function (_, response) { return ({
            status: response.status,
            data: response.data,
            totalCount: response.totalCount,
            prev: response.prev,
            next: response.next,
        }); },
    };

    /**       */
    var endpoint$3 = {
        getOperation: function () { return OPERATIONS.PNSetMembershipsOperation; },
        validateParams: function (_, params) {
            if (!(params === null || params === void 0 ? void 0 : params.channels) || (params === null || params === void 0 ? void 0 : params.channels.length) === 0) {
                return 'Channels cannot be empty';
            }
        },
        usePatch: function () { return true; },
        patchURL: function (_a, params) {
            var _b;
            var config = _a.config;
            return "/v2/objects/".concat(config.subscribeKey, "/uuids/").concat(utils$5.encodeString((_b = params.uuid) !== null && _b !== void 0 ? _b : config.getUUID()), "/channels");
        },
        patchPayload: function (_, params) {
            var _a;
            return (_a = {
                    set: [],
                    remove: []
                },
                _a[params.type] = params.channels.map(function (channel) {
                    if (typeof channel === 'string') {
                        return {
                            channel: {
                                id: channel,
                            },
                        };
                    }
                    return {
                        channel: { id: channel.id },
                        custom: channel.custom,
                    };
                }),
                _a);
        },
        getRequestTimeout: function (_a) {
            var config = _a.config;
            return config.getTransactionTimeout();
        },
        isAuthSupported: function () { return true; },
        prepareParams: function (_modules, params) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            var queryParams = {};
            if (params === null || params === void 0 ? void 0 : params.include) {
                queryParams.include = [];
                if ((_a = params.include) === null || _a === void 0 ? void 0 : _a.customFields) {
                    queryParams.include.push('custom');
                }
                if ((_b = params.include) === null || _b === void 0 ? void 0 : _b.customChannelFields) {
                    queryParams.include.push('channel.custom');
                }
                if ((_c = params.include) === null || _c === void 0 ? void 0 : _c.channelFields) {
                    queryParams.include.push('channel');
                }
                queryParams.include = queryParams.include.join(',');
            }
            if ((_d = params === null || params === void 0 ? void 0 : params.include) === null || _d === void 0 ? void 0 : _d.totalCount) {
                queryParams.count = true;
            }
            if ((_e = params === null || params === void 0 ? void 0 : params.page) === null || _e === void 0 ? void 0 : _e.next) {
                queryParams.start = (_f = params.page) === null || _f === void 0 ? void 0 : _f.next;
            }
            if ((_g = params === null || params === void 0 ? void 0 : params.page) === null || _g === void 0 ? void 0 : _g.prev) {
                queryParams.end = (_h = params.page) === null || _h === void 0 ? void 0 : _h.prev;
            }
            if (params === null || params === void 0 ? void 0 : params.filter) {
                queryParams.filter = params.filter;
            }
            if (params === null || params === void 0 ? void 0 : params.limit) {
                queryParams.limit = params.limit;
            }
            if (params === null || params === void 0 ? void 0 : params.sort) {
                queryParams.sort = Object.entries((_j = params.sort) !== null && _j !== void 0 ? _j : {}).map(function (_a) {
                    var _b = __read$1(_a, 2), key = _b[0], value = _b[1];
                    if (value === 'asc' || value === 'desc') {
                        return "".concat(key, ":").concat(value);
                    }
                    return key;
                });
            }
            return queryParams;
        },
        handleResponse: function (_, response) { return ({
            status: response.status,
            data: response.data,
            totalCount: response.totalCount,
            prev: response.prev,
            next: response.next,
        }); },
    };

    /*       */
    function prepareMessagePayload$c(modules, incomingParams) {
        return incomingParams;
    }
    function getOperation$s() {
        return OPERATIONS.PNCreateUserOperation;
    }
    function validateParams$s(_a, incomingParams) {
        var config = _a.config;
        var id = incomingParams.id, name = incomingParams.name, custom = incomingParams.custom;
        if (!id)
            return 'Missing User.id';
        if (!name)
            return 'Missing User.name';
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
        if (custom) {
            if (!Object.values(custom).every(function (value) { return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'; })) {
                return 'Invalid custom type, only string, number and boolean values are allowed.';
            }
        }
    }
    function usePost$3() {
        return true;
    }
    function getURL$r(modules) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/users");
    }
    function postURL$3(modules) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/users");
    }
    function getRequestTimeout$s(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$s() {
        return true;
    }
    function prepareParams$s(modules, incomingParams) {
        var include = incomingParams.include;
        var params = {};
        // default to include custom fields in response
        if (!include) {
            include = {
                customFields: true,
            };
        }
        else if (include.customFields === undefined) {
            include.customFields = true;
        }
        if (include) {
            var includes = [];
            if (include.customFields) {
                includes.push('custom');
            }
            var includesString = includes.join(',');
            if (includesString.length > 0) {
                params.include = includesString;
            }
        }
        return params;
    }
    function postPayload$3(modules, incomingParams) {
        return prepareMessagePayload$c(modules, incomingParams);
    }
    function handleResponse$s(modules, usersResponse) {
        return usersResponse;
    }

    var createUserEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$s,
        validateParams: validateParams$s,
        usePost: usePost$3,
        getURL: getURL$r,
        postURL: postURL$3,
        getRequestTimeout: getRequestTimeout$s,
        isAuthSupported: isAuthSupported$s,
        prepareParams: prepareParams$s,
        postPayload: postPayload$3,
        handleResponse: handleResponse$s
    });

    /*       */
    function prepareMessagePayload$b(modules, incomingParams) {
        return incomingParams;
    }
    function getOperation$r() {
        return OPERATIONS.PNUpdateUserOperation;
    }
    function validateParams$r(_a, incomingParams) {
        var config = _a.config;
        var id = incomingParams.id, name = incomingParams.name, custom = incomingParams.custom;
        if (!id)
            return 'Missing User.id';
        if (!name)
            return 'Missing User.name';
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
        if (custom) {
            if (!Object.values(custom).every(function (value) { return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'; })) {
                return 'Invalid custom type, only string, number and boolean values are allowed.';
            }
        }
    }
    function usePatch$7() {
        return true;
    }
    function getURL$q(modules, incomingParams) {
        var config = modules.config;
        var id = incomingParams.id;
        return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(utils$5.encodeString(id));
    }
    function patchURL$7(modules, incomingParams) {
        var config = modules.config;
        var id = incomingParams.id;
        return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(utils$5.encodeString(id));
    }
    function getRequestTimeout$r(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$r() {
        return true;
    }
    function prepareParams$r(modules, incomingParams) {
        var include = incomingParams.include;
        var params = {};
        // default to include custom fields in response
        if (!include) {
            include = {
                customFields: true,
            };
        }
        else if (include.customFields === undefined) {
            include.customFields = true;
        }
        if (include) {
            var includes = [];
            if (include.customFields) {
                includes.push('custom');
            }
            var includesString = includes.join(',');
            if (includesString.length > 0) {
                params.include = includesString;
            }
        }
        return params;
    }
    function patchPayload$7(modules, incomingParams) {
        return prepareMessagePayload$b(modules, incomingParams);
    }
    function handleResponse$r(modules, usersResponse) {
        return usersResponse;
    }

    var updateUserEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$r,
        validateParams: validateParams$r,
        usePatch: usePatch$7,
        getURL: getURL$q,
        patchURL: patchURL$7,
        getRequestTimeout: getRequestTimeout$r,
        isAuthSupported: isAuthSupported$r,
        prepareParams: prepareParams$r,
        patchPayload: patchPayload$7,
        handleResponse: handleResponse$r
    });

    /*       */
    function getOperation$q() {
        return OPERATIONS.PNDeleteUserOperation;
    }
    function validateParams$q(_a, userId) {
        var config = _a.config;
        if (!userId)
            return 'Missing UserId';
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function useDelete$2() {
        return true;
    }
    function getURL$p(modules, userId) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(utils$5.encodeString(userId));
    }
    function getRequestTimeout$q(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$q() {
        return true;
    }
    function prepareParams$q() {
        return {};
    }
    function handleResponse$q(modules, usersResponse) {
        return usersResponse;
    }

    var deleteUserEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$q,
        validateParams: validateParams$q,
        useDelete: useDelete$2,
        getURL: getURL$p,
        getRequestTimeout: getRequestTimeout$q,
        isAuthSupported: isAuthSupported$q,
        prepareParams: prepareParams$q,
        handleResponse: handleResponse$q
    });

    /*       */
    function getOperation$p() {
        return OPERATIONS.PNGetUserOperation;
    }
    function validateParams$p(modules, incomingParams) {
        var userId = incomingParams.userId;
        if (!userId)
            return 'Missing userId';
    }
    function getURL$o(modules, incomingParams) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(utils$5.encodeString(incomingParams.userId));
    }
    function getRequestTimeout$p(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$p() {
        return true;
    }
    function prepareParams$p(modules, incomingParams) {
        var include = incomingParams.include;
        var params = {};
        // default to include custom fields in response
        if (!include) {
            include = {
                customFields: true,
            };
        }
        else if (include.customFields === undefined) {
            include.customFields = true;
        }
        if (include) {
            var includes = [];
            if (include.customFields) {
                includes.push('custom');
            }
            var includesString = includes.join(',');
            if (includesString.length > 0) {
                params.include = includesString;
            }
        }
        return params;
    }
    function handleResponse$p(modules, usersResponse) {
        return usersResponse;
    }

    var getUserEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$p,
        validateParams: validateParams$p,
        getURL: getURL$o,
        getRequestTimeout: getRequestTimeout$p,
        isAuthSupported: isAuthSupported$p,
        prepareParams: prepareParams$p,
        handleResponse: handleResponse$p
    });

    /*       */
    function getOperation$o() {
        return OPERATIONS.PNGetUsersOperation;
    }
    function validateParams$o() {
        // no required parameters
    }
    function getURL$n(modules) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/users");
    }
    function getRequestTimeout$o(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$o() {
        return true;
    }
    function prepareParams$o(modules, incomingParams) {
        var include = incomingParams.include, limit = incomingParams.limit, page = incomingParams.page, filter = incomingParams.filter;
        var params = {};
        if (limit) {
            params.limit = limit;
        }
        if (include) {
            var includes = [];
            if (include.totalCount) {
                params.count = true;
            }
            if (include.customFields) {
                includes.push('custom');
            }
            var includesString = includes.join(',');
            if (includesString.length > 0) {
                params.include = includesString;
            }
        }
        if (page) {
            if (page.next) {
                params.start = page.next;
            }
            if (page.prev) {
                params.end = page.prev;
            }
        }
        if (filter) {
            params.filter = filter;
        }
        return params;
    }
    function handleResponse$o(modules, usersResponse) {
        return usersResponse;
    }

    var getUsersEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$o,
        validateParams: validateParams$o,
        getURL: getURL$n,
        getRequestTimeout: getRequestTimeout$o,
        isAuthSupported: isAuthSupported$o,
        prepareParams: prepareParams$o,
        handleResponse: handleResponse$o
    });

    /*       */
    function prepareMessagePayload$a(modules, incomingParams) {
        return incomingParams;
    }
    function getOperation$n() {
        return OPERATIONS.PNCreateSpaceOperation;
    }
    function validateParams$n(_a, incomingParams) {
        var config = _a.config;
        var id = incomingParams.id, name = incomingParams.name, custom = incomingParams.custom;
        if (!id)
            return 'Missing Space.id';
        if (!name)
            return 'Missing Space.name';
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
        if (custom) {
            if (!Object.values(custom).every(function (value) { return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'; })) {
                return 'Invalid custom type, only string, number and boolean values are allowed.';
            }
        }
    }
    function usePost$2() {
        return true;
    }
    function getURL$m(modules) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/spaces");
    }
    function postURL$2(modules) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/spaces");
    }
    function getRequestTimeout$n(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$n() {
        return true;
    }
    function prepareParams$n(modules, incomingParams) {
        var include = incomingParams.include;
        var params = {};
        // default to include custom fields in response
        if (!include) {
            include = {
                customFields: true,
            };
        }
        else if (include.customFields === undefined) {
            include.customFields = true;
        }
        if (include) {
            var includes = [];
            if (include.customFields) {
                includes.push('custom');
            }
            var includesString = includes.join(',');
            if (includesString.length > 0) {
                params.include = includesString;
            }
        }
        return params;
    }
    function postPayload$2(modules, incomingParams) {
        return prepareMessagePayload$a(modules, incomingParams);
    }
    function handleResponse$n(modules, spacesResponse) {
        return spacesResponse;
    }

    var createSpaceEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$n,
        validateParams: validateParams$n,
        usePost: usePost$2,
        getURL: getURL$m,
        postURL: postURL$2,
        getRequestTimeout: getRequestTimeout$n,
        isAuthSupported: isAuthSupported$n,
        prepareParams: prepareParams$n,
        postPayload: postPayload$2,
        handleResponse: handleResponse$n
    });

    /*       */
    function prepareMessagePayload$9(modules, incomingParams) {
        return incomingParams;
    }
    function getOperation$m() {
        return OPERATIONS.PNUpdateSpaceOperation;
    }
    function validateParams$m(_a, incomingParams) {
        var config = _a.config;
        var id = incomingParams.id, name = incomingParams.name, custom = incomingParams.custom;
        if (!id)
            return 'Missing Space.id';
        if (!name)
            return 'Missing Space.name';
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
        if (custom) {
            if (!Object.values(custom).every(function (value) { return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'; })) {
                return 'Invalid custom type, only string, number and boolean values are allowed.';
            }
        }
    }
    function usePatch$6() {
        return true;
    }
    function getURL$l(modules, incomingParams) {
        var config = modules.config;
        var id = incomingParams.id;
        return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(utils$5.encodeString(id));
    }
    function patchURL$6(modules, incomingParams) {
        var config = modules.config;
        var id = incomingParams.id;
        return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(utils$5.encodeString(id));
    }
    function getRequestTimeout$m(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$m() {
        return true;
    }
    function prepareParams$m(modules, incomingParams) {
        var include = incomingParams.include;
        var params = {};
        // default to include custom fields in response
        if (!include) {
            include = {
                customFields: true,
            };
        }
        else if (include.customFields === undefined) {
            include.customFields = true;
        }
        if (include) {
            var includes = [];
            if (include.customFields) {
                includes.push('custom');
            }
            var includesString = includes.join(',');
            if (includesString.length > 0) {
                params.include = includesString;
            }
        }
        return params;
    }
    function patchPayload$6(modules, incomingParams) {
        return prepareMessagePayload$9(modules, incomingParams);
    }
    function handleResponse$m(modules, spacesResponse) {
        return spacesResponse;
    }

    var updateSpaceEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$m,
        validateParams: validateParams$m,
        usePatch: usePatch$6,
        getURL: getURL$l,
        patchURL: patchURL$6,
        getRequestTimeout: getRequestTimeout$m,
        isAuthSupported: isAuthSupported$m,
        prepareParams: prepareParams$m,
        patchPayload: patchPayload$6,
        handleResponse: handleResponse$m
    });

    /*       */
    function getOperation$l() {
        return OPERATIONS.PNDeleteSpaceOperation;
    }
    function validateParams$l(_a, spaceId) {
        var config = _a.config;
        if (!spaceId)
            return 'Missing SpaceId';
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function useDelete$1() {
        return true;
    }
    function getURL$k(modules, spaceId) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(utils$5.encodeString(spaceId));
    }
    function getRequestTimeout$l(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$l() {
        return true;
    }
    function prepareParams$l() {
        return {};
    }
    function handleResponse$l(modules, spacesResponse) {
        return spacesResponse;
    }

    var deleteSpaceEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$l,
        validateParams: validateParams$l,
        useDelete: useDelete$1,
        getURL: getURL$k,
        getRequestTimeout: getRequestTimeout$l,
        isAuthSupported: isAuthSupported$l,
        prepareParams: prepareParams$l,
        handleResponse: handleResponse$l
    });

    /*       */
    function getOperation$k() {
        return OPERATIONS.PNGetSpacesOperation;
    }
    function validateParams$k() {
        // no required parameters
    }
    function getURL$j(modules) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/spaces");
    }
    function getRequestTimeout$k(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$k() {
        return true;
    }
    function prepareParams$k(modules, incomingParams) {
        var include = incomingParams.include, limit = incomingParams.limit, page = incomingParams.page, filter = incomingParams.filter;
        var params = {};
        if (limit) {
            params.limit = limit;
        }
        if (include) {
            var includes = [];
            if (include.totalCount) {
                params.count = true;
            }
            if (include.customFields) {
                includes.push('custom');
            }
            var includesString = includes.join(',');
            if (includesString.length > 0) {
                params.include = includesString;
            }
        }
        if (page) {
            if (page.next) {
                params.start = page.next;
            }
            if (page.prev) {
                params.end = page.prev;
            }
        }
        if (filter) {
            params.filter = filter;
        }
        return params;
    }
    function handleResponse$k(modules, spacesResponse) {
        return spacesResponse;
    }

    var getSpacesEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$k,
        validateParams: validateParams$k,
        getURL: getURL$j,
        getRequestTimeout: getRequestTimeout$k,
        isAuthSupported: isAuthSupported$k,
        prepareParams: prepareParams$k,
        handleResponse: handleResponse$k
    });

    /*       */
    function getOperation$j() {
        return OPERATIONS.PNGetSpaceOperation;
    }
    function validateParams$j(modules, incomingParams) {
        var spaceId = incomingParams.spaceId;
        if (!spaceId)
            return 'Missing spaceId';
    }
    function getURL$i(modules, incomingParams) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(utils$5.encodeString(incomingParams.spaceId));
    }
    function getRequestTimeout$j(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$j() {
        return true;
    }
    function prepareParams$j(modules, incomingParams) {
        var include = incomingParams.include;
        var params = {};
        // default to include custom fields in response
        if (!include) {
            include = {
                customFields: true,
            };
        }
        else if (include.customFields === undefined) {
            include.customFields = true;
        }
        if (include) {
            var includes = [];
            if (include.customFields) {
                includes.push('custom');
            }
            var includesString = includes.join(',');
            if (includesString.length > 0) {
                params.include = includesString;
            }
        }
        return params;
    }
    function handleResponse$j(modules, spacesResponse) {
        return spacesResponse;
    }

    var getSpaceEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$j,
        validateParams: validateParams$j,
        getURL: getURL$i,
        getRequestTimeout: getRequestTimeout$j,
        isAuthSupported: isAuthSupported$j,
        prepareParams: prepareParams$j,
        handleResponse: handleResponse$j
    });

    /*       */
    function getOperation$i() {
        return OPERATIONS.PNGetMembersOperation;
    }
    function validateParams$i(modules, incomingParams) {
        var spaceId = incomingParams.spaceId;
        if (!spaceId)
            return 'Missing spaceId';
    }
    function getURL$h(modules, incomingParams) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(utils$5.encodeString(incomingParams.spaceId), "/users");
    }
    function getRequestTimeout$i(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$i() {
        return true;
    }
    function prepareParams$i(modules, incomingParams) {
        var include = incomingParams.include, limit = incomingParams.limit, page = incomingParams.page, filter = incomingParams.filter;
        var params = {};
        if (limit) {
            params.limit = limit;
        }
        if (include) {
            var includes = [];
            if (include.totalCount) {
                params.count = true;
            }
            if (include.customFields) {
                includes.push('custom');
            }
            if (include.userFields) {
                includes.push('user');
            }
            if (include.customUserFields) {
                includes.push('user.custom');
            }
            var includesString = includes.join(',');
            if (includesString.length > 0) {
                params.include = includesString;
            }
        }
        if (page) {
            if (page.next) {
                params.start = page.next;
            }
            if (page.prev) {
                params.end = page.prev;
            }
        }
        if (filter) {
            params.filter = filter;
        }
        return params;
    }
    function handleResponse$i(modules, membersResponse) {
        return membersResponse;
    }

    var getMembersEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$i,
        validateParams: validateParams$i,
        getURL: getURL$h,
        getRequestTimeout: getRequestTimeout$i,
        isAuthSupported: isAuthSupported$i,
        prepareParams: prepareParams$i,
        handleResponse: handleResponse$i
    });

    /*       */
    function prepareMessagePayload$8(modules, incomingParams) {
        var users = incomingParams.users;
        var payload = {};
        if (users && users.length > 0) {
            payload.add = [];
            users.forEach(function (addMember) {
                var currentAdd = { id: addMember.id };
                if (addMember.custom) {
                    currentAdd.custom = addMember.custom;
                }
                payload.add.push(currentAdd);
            });
        }
        return payload;
    }
    function getOperation$h() {
        return OPERATIONS.PNUpdateMembersOperation;
    }
    function validateParams$h(modules, incomingParams) {
        var spaceId = incomingParams.spaceId, users = incomingParams.users;
        if (!spaceId)
            return 'Missing spaceId';
        if (!users)
            return 'Missing users';
    }
    function getURL$g(modules, incomingParams) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(utils$5.encodeString(incomingParams.spaceId), "/users");
    }
    function patchURL$5(modules, incomingParams) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(utils$5.encodeString(incomingParams.spaceId), "/users");
    }
    function usePatch$5() {
        return true;
    }
    function getRequestTimeout$h(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$h() {
        return true;
    }
    function prepareParams$h(modules, incomingParams) {
        var include = incomingParams.include, limit = incomingParams.limit, page = incomingParams.page;
        var params = {};
        if (limit) {
            params.limit = limit;
        }
        if (include) {
            var includes = [];
            if (include.totalCount) {
                params.count = true;
            }
            if (include.customFields) {
                includes.push('custom');
            }
            if (include.spaceFields) {
                includes.push('space');
            }
            if (include.customSpaceFields) {
                includes.push('space.custom');
            }
            var includesString = includes.join(',');
            if (includesString.length > 0) {
                params.include = includesString;
            }
        }
        if (page) {
            if (page.next) {
                params.start = page.next;
            }
            if (page.prev) {
                params.end = page.prev;
            }
        }
        return params;
    }
    function patchPayload$5(modules, incomingParams) {
        return prepareMessagePayload$8(modules, incomingParams);
    }
    function handleResponse$h(modules, membersResponse) {
        return membersResponse;
    }

    var addMembersEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$h,
        validateParams: validateParams$h,
        getURL: getURL$g,
        patchURL: patchURL$5,
        usePatch: usePatch$5,
        getRequestTimeout: getRequestTimeout$h,
        isAuthSupported: isAuthSupported$h,
        prepareParams: prepareParams$h,
        patchPayload: patchPayload$5,
        handleResponse: handleResponse$h
    });

    /*       */
    function prepareMessagePayload$7(modules, incomingParams) {
        var addMembers = incomingParams.addMembers, updateMembers = incomingParams.updateMembers, removeMembers = incomingParams.removeMembers, users = incomingParams.users;
        var payload = {};
        if (addMembers && addMembers.length > 0) {
            payload.add = [];
            addMembers.forEach(function (addMember) {
                var currentAdd = { id: addMember.id };
                if (addMember.custom) {
                    currentAdd.custom = addMember.custom;
                }
                payload.add.push(currentAdd);
            });
        }
        if (updateMembers && updateMembers.length > 0) {
            payload.update = [];
            updateMembers.forEach(function (updateMember) {
                var currentUpdate = { id: updateMember.id };
                if (updateMember.custom) {
                    currentUpdate.custom = updateMember.custom;
                }
                payload.update.push(currentUpdate);
            });
        }
        // if users is present then it is an update
        if (users && users.length > 0) {
            payload.update = payload.update || [];
            users.forEach(function (updateMember) {
                var currentUpdate = { id: updateMember.id };
                if (updateMember.custom) {
                    currentUpdate.custom = updateMember.custom;
                }
                payload.update.push(currentUpdate);
            });
        }
        if (removeMembers && removeMembers.length > 0) {
            payload.remove = [];
            removeMembers.forEach(function (removeMemberId) {
                payload.remove.push({ id: removeMemberId });
            });
        }
        return payload;
    }
    function getOperation$g() {
        return OPERATIONS.PNUpdateMembersOperation;
    }
    function validateParams$g(modules, incomingParams) {
        var spaceId = incomingParams.spaceId, users = incomingParams.users;
        if (!spaceId)
            return 'Missing spaceId';
        if (!users)
            return 'Missing users';
    }
    function getURL$f(modules, incomingParams) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(utils$5.encodeString(incomingParams.spaceId), "/users");
    }
    function patchURL$4(modules, incomingParams) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(utils$5.encodeString(incomingParams.spaceId), "/users");
    }
    function usePatch$4() {
        return true;
    }
    function getRequestTimeout$g(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$g() {
        return true;
    }
    function prepareParams$g(modules, incomingParams) {
        var include = incomingParams.include, limit = incomingParams.limit, page = incomingParams.page;
        var params = {};
        if (limit) {
            params.limit = limit;
        }
        if (include) {
            var includes = [];
            if (include.totalCount) {
                params.count = true;
            }
            if (include.customFields) {
                includes.push('custom');
            }
            if (include.spaceFields) {
                includes.push('space');
            }
            if (include.customSpaceFields) {
                includes.push('space.custom');
            }
            var includesString = includes.join(',');
            if (includesString.length > 0) {
                params.include = includesString;
            }
        }
        if (page) {
            if (page.next) {
                params.start = page.next;
            }
            if (page.prev) {
                params.end = page.prev;
            }
        }
        return params;
    }
    function patchPayload$4(modules, incomingParams) {
        return prepareMessagePayload$7(modules, incomingParams);
    }
    function handleResponse$g(modules, membersResponse) {
        return membersResponse;
    }

    var updateMembersEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$g,
        validateParams: validateParams$g,
        getURL: getURL$f,
        patchURL: patchURL$4,
        usePatch: usePatch$4,
        getRequestTimeout: getRequestTimeout$g,
        isAuthSupported: isAuthSupported$g,
        prepareParams: prepareParams$g,
        patchPayload: patchPayload$4,
        handleResponse: handleResponse$g
    });

    /*       */
    function prepareMessagePayload$6(modules, incomingParams) {
        var users = incomingParams.users;
        var payload = {};
        if (users && users.length > 0) {
            payload.remove = [];
            users.forEach(function (removeMemberId) {
                payload.remove.push({ id: removeMemberId });
            });
        }
        return payload;
    }
    function getOperation$f() {
        return OPERATIONS.PNUpdateMembersOperation;
    }
    function validateParams$f(modules, incomingParams) {
        var spaceId = incomingParams.spaceId, users = incomingParams.users;
        if (!spaceId)
            return 'Missing spaceId';
        if (!users)
            return 'Missing users';
    }
    function getURL$e(modules, incomingParams) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(utils$5.encodeString(incomingParams.spaceId), "/users");
    }
    function patchURL$3(modules, incomingParams) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(utils$5.encodeString(incomingParams.spaceId), "/users");
    }
    function usePatch$3() {
        return true;
    }
    function getRequestTimeout$f(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$f() {
        return true;
    }
    function prepareParams$f(modules, incomingParams) {
        var include = incomingParams.include, limit = incomingParams.limit, page = incomingParams.page;
        var params = {};
        if (limit) {
            params.limit = limit;
        }
        if (include) {
            var includes = [];
            if (include.totalCount) {
                params.count = true;
            }
            if (include.customFields) {
                includes.push('custom');
            }
            if (include.spaceFields) {
                includes.push('space');
            }
            if (include.customSpaceFields) {
                includes.push('space.custom');
            }
            var includesString = includes.join(',');
            if (includesString.length > 0) {
                params.include = includesString;
            }
        }
        if (page) {
            if (page.next) {
                params.start = page.next;
            }
            if (page.prev) {
                params.end = page.prev;
            }
        }
        return params;
    }
    function patchPayload$3(modules, incomingParams) {
        return prepareMessagePayload$6(modules, incomingParams);
    }
    function handleResponse$f(modules, membersResponse) {
        return membersResponse;
    }

    var removeMembersEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$f,
        validateParams: validateParams$f,
        getURL: getURL$e,
        patchURL: patchURL$3,
        usePatch: usePatch$3,
        getRequestTimeout: getRequestTimeout$f,
        isAuthSupported: isAuthSupported$f,
        prepareParams: prepareParams$f,
        patchPayload: patchPayload$3,
        handleResponse: handleResponse$f
    });

    /*       */
    function getOperation$e() {
        return OPERATIONS.PNGetMembershipsOperation;
    }
    function validateParams$e(modules, incomingParams) {
        var userId = incomingParams.userId;
        if (!userId)
            return 'Missing userId';
    }
    function getURL$d(modules, incomingParams) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(utils$5.encodeString(incomingParams.userId), "/spaces");
    }
    function getRequestTimeout$e(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$e() {
        return true;
    }
    function prepareParams$e(modules, incomingParams) {
        var include = incomingParams.include, limit = incomingParams.limit, page = incomingParams.page, filter = incomingParams.filter;
        var params = {};
        if (limit) {
            params.limit = limit;
        }
        if (include) {
            var includes = [];
            if (include.totalCount) {
                params.count = true;
            }
            if (include.customFields) {
                includes.push('custom');
            }
            if (include.spaceFields) {
                includes.push('space');
            }
            if (include.customSpaceFields) {
                includes.push('space.custom');
            }
            var includesString = includes.join(',');
            if (includesString.length > 0) {
                params.include = includesString;
            }
        }
        if (page) {
            if (page.next) {
                params.start = page.next;
            }
            if (page.prev) {
                params.end = page.prev;
            }
        }
        if (filter) {
            params.filter = filter;
        }
        return params;
    }
    function handleResponse$e(modules, membershipsResponse) {
        return membershipsResponse;
    }

    var getMembershipsEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$e,
        validateParams: validateParams$e,
        getURL: getURL$d,
        getRequestTimeout: getRequestTimeout$e,
        isAuthSupported: isAuthSupported$e,
        prepareParams: prepareParams$e,
        handleResponse: handleResponse$e
    });

    /*       */
    function prepareMessagePayload$5(modules, incomingParams) {
        var addMemberships = incomingParams.addMemberships, updateMemberships = incomingParams.updateMemberships, removeMemberships = incomingParams.removeMemberships, spaces = incomingParams.spaces;
        var payload = {};
        if (addMemberships && addMemberships.length > 0) {
            payload.add = [];
            addMemberships.forEach(function (addMembership) {
                var currentAdd = { id: addMembership.id };
                if (addMembership.custom) {
                    currentAdd.custom = addMembership.custom;
                }
                payload.add.push(currentAdd);
            });
        }
        if (updateMemberships && updateMemberships.length > 0) {
            payload.update = [];
            updateMemberships.forEach(function (updateMembership) {
                var currentUpdate = { id: updateMembership.id };
                if (updateMembership.custom) {
                    currentUpdate.custom = updateMembership.custom;
                }
                payload.update.push(currentUpdate);
            });
        }
        // if spaces is present then it is an update
        if (spaces && spaces.length > 0) {
            payload.update = payload.update || [];
            spaces.forEach(function (updateMembership) {
                var currentUpdate = { id: updateMembership.id };
                if (updateMembership.custom) {
                    currentUpdate.custom = updateMembership.custom;
                }
                payload.update.push(currentUpdate);
            });
        }
        if (removeMemberships && removeMemberships.length > 0) {
            payload.remove = [];
            removeMemberships.forEach(function (removeMembershipId) {
                payload.remove.push({ id: removeMembershipId });
            });
        }
        return payload;
    }
    function getOperation$d() {
        return OPERATIONS.PNUpdateMembershipsOperation;
    }
    function validateParams$d(modules, incomingParams) {
        var userId = incomingParams.userId, spaces = incomingParams.spaces;
        if (!userId)
            return 'Missing userId';
        if (!spaces)
            return 'Missing spaces';
    }
    function getURL$c(modules, incomingParams) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(utils$5.encodeString(incomingParams.userId), "/spaces");
    }
    function patchURL$2(modules, incomingParams) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(utils$5.encodeString(incomingParams.userId), "/spaces");
    }
    function usePatch$2() {
        return true;
    }
    function getRequestTimeout$d(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$d() {
        return true;
    }
    function prepareParams$d(modules, incomingParams) {
        var include = incomingParams.include, limit = incomingParams.limit, page = incomingParams.page;
        var params = {};
        if (limit) {
            params.limit = limit;
        }
        if (include) {
            var includes = [];
            if (include.totalCount) {
                params.count = true;
            }
            if (include.customFields) {
                includes.push('custom');
            }
            if (include.spaceFields) {
                includes.push('space');
            }
            if (include.customSpaceFields) {
                includes.push('space.custom');
            }
            var includesString = includes.join(',');
            if (includesString.length > 0) {
                params.include = includesString;
            }
        }
        if (page) {
            if (page.next) {
                params.start = page.next;
            }
            if (page.prev) {
                params.end = page.prev;
            }
        }
        return params;
    }
    function patchPayload$2(modules, incomingParams) {
        return prepareMessagePayload$5(modules, incomingParams);
    }
    function handleResponse$d(modules, membershipsResponse) {
        return membershipsResponse;
    }

    var updateMembershipsEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$d,
        validateParams: validateParams$d,
        getURL: getURL$c,
        patchURL: patchURL$2,
        usePatch: usePatch$2,
        getRequestTimeout: getRequestTimeout$d,
        isAuthSupported: isAuthSupported$d,
        prepareParams: prepareParams$d,
        patchPayload: patchPayload$2,
        handleResponse: handleResponse$d
    });

    /*       */
    function prepareMessagePayload$4(modules, incomingParams) {
        var spaces = incomingParams.spaces;
        var payload = {};
        if (spaces && spaces.length > 0) {
            payload.add = [];
            spaces.forEach(function (addMembership) {
                var currentAdd = { id: addMembership.id };
                if (addMembership.custom) {
                    currentAdd.custom = addMembership.custom;
                }
                payload.add.push(currentAdd);
            });
        }
        return payload;
    }
    function getOperation$c() {
        return OPERATIONS.PNUpdateMembershipsOperation;
    }
    function validateParams$c(modules, incomingParams) {
        var userId = incomingParams.userId, spaces = incomingParams.spaces;
        if (!userId)
            return 'Missing userId';
        if (!spaces)
            return 'Missing spaces';
    }
    function getURL$b(modules, incomingParams) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(utils$5.encodeString(incomingParams.userId), "/spaces");
    }
    function patchURL$1(modules, incomingParams) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(utils$5.encodeString(incomingParams.userId), "/spaces");
    }
    function usePatch$1() {
        return true;
    }
    function getRequestTimeout$c(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$c() {
        return true;
    }
    function prepareParams$c(modules, incomingParams) {
        var include = incomingParams.include, limit = incomingParams.limit, page = incomingParams.page;
        var params = {};
        if (limit) {
            params.limit = limit;
        }
        if (include) {
            var includes = [];
            if (include.totalCount) {
                params.count = true;
            }
            if (include.customFields) {
                includes.push('custom');
            }
            if (include.spaceFields) {
                includes.push('space');
            }
            if (include.customSpaceFields) {
                includes.push('space.custom');
            }
            var includesString = includes.join(',');
            if (includesString.length > 0) {
                params.include = includesString;
            }
        }
        if (page) {
            if (page.next) {
                params.start = page.next;
            }
            if (page.prev) {
                params.end = page.prev;
            }
        }
        return params;
    }
    function patchPayload$1(modules, incomingParams) {
        return prepareMessagePayload$4(modules, incomingParams);
    }
    function handleResponse$c(modules, membershipsResponse) {
        return membershipsResponse;
    }

    var joinSpacesEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$c,
        validateParams: validateParams$c,
        getURL: getURL$b,
        patchURL: patchURL$1,
        usePatch: usePatch$1,
        getRequestTimeout: getRequestTimeout$c,
        isAuthSupported: isAuthSupported$c,
        prepareParams: prepareParams$c,
        patchPayload: patchPayload$1,
        handleResponse: handleResponse$c
    });

    /*       */
    function prepareMessagePayload$3(modules, incomingParams) {
        var spaces = incomingParams.spaces;
        var payload = {};
        if (spaces && spaces.length > 0) {
            payload.remove = [];
            spaces.forEach(function (removeMembershipId) {
                payload.remove.push({ id: removeMembershipId });
            });
        }
        return payload;
    }
    function getOperation$b() {
        return OPERATIONS.PNUpdateMembershipsOperation;
    }
    function validateParams$b(modules, incomingParams) {
        var userId = incomingParams.userId, spaces = incomingParams.spaces;
        if (!userId)
            return 'Missing userId';
        if (!spaces)
            return 'Missing spaces';
    }
    function getURL$a(modules, incomingParams) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(utils$5.encodeString(incomingParams.userId), "/spaces");
    }
    function patchURL(modules, incomingParams) {
        var config = modules.config;
        return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(utils$5.encodeString(incomingParams.userId), "/spaces");
    }
    function usePatch() {
        return true;
    }
    function getRequestTimeout$b(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$b() {
        return true;
    }
    function prepareParams$b(modules, incomingParams) {
        var include = incomingParams.include, limit = incomingParams.limit, page = incomingParams.page;
        var params = {};
        if (limit) {
            params.limit = limit;
        }
        if (include) {
            var includes = [];
            if (include.totalCount) {
                params.count = true;
            }
            if (include.customFields) {
                includes.push('custom');
            }
            if (include.spaceFields) {
                includes.push('space');
            }
            if (include.customSpaceFields) {
                includes.push('space.custom');
            }
            var includesString = includes.join(',');
            if (includesString.length > 0) {
                params.include = includesString;
            }
        }
        if (page) {
            if (page.next) {
                params.start = page.next;
            }
            if (page.prev) {
                params.end = page.prev;
            }
        }
        return params;
    }
    function patchPayload(modules, incomingParams) {
        return prepareMessagePayload$3(modules, incomingParams);
    }
    function handleResponse$b(modules, membershipsResponse) {
        return membershipsResponse;
    }

    var leaveSpacesEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$b,
        validateParams: validateParams$b,
        getURL: getURL$a,
        patchURL: patchURL,
        usePatch: usePatch,
        getRequestTimeout: getRequestTimeout$b,
        isAuthSupported: isAuthSupported$b,
        prepareParams: prepareParams$b,
        patchPayload: patchPayload,
        handleResponse: handleResponse$b
    });

    /*       */
    function getOperation$a() {
        return OPERATIONS.PNAccessManagerAudit;
    }
    function validateParams$a(modules) {
        var config = modules.config;
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function getURL$9(modules) {
        var config = modules.config;
        return "/v2/auth/audit/sub-key/".concat(config.subscribeKey);
    }
    function getRequestTimeout$a(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$a() {
        return false;
    }
    function prepareParams$a(modules, incomingParams) {
        var channel = incomingParams.channel, channelGroup = incomingParams.channelGroup, _a = incomingParams.authKeys, authKeys = _a === void 0 ? [] : _a;
        var params = {};
        if (channel) {
            params.channel = channel;
        }
        if (channelGroup) {
            params['channel-group'] = channelGroup;
        }
        if (authKeys.length > 0) {
            params.auth = authKeys.join(',');
        }
        return params;
    }
    function handleResponse$a(modules, serverResponse) {
        return serverResponse.payload;
    }

    var auditEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$a,
        validateParams: validateParams$a,
        getURL: getURL$9,
        getRequestTimeout: getRequestTimeout$a,
        isAuthSupported: isAuthSupported$a,
        prepareParams: prepareParams$a,
        handleResponse: handleResponse$a
    });

    /*       */
    function getOperation$9() {
        return OPERATIONS.PNAccessManagerGrant;
    }
    function validateParams$9(modules, incomingParams) {
        var config = modules.config;
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
        if (!config.publishKey)
            return 'Missing Publish Key';
        if (!config.secretKey)
            return 'Missing Secret Key';
        if (incomingParams.uuids != null && !incomingParams.authKeys) {
            return 'authKeys are required for grant request on uuids';
        }
        if (incomingParams.uuids != null && (incomingParams.channels != null || incomingParams.channelGroups != null)) {
            return 'Both channel/channelgroup and uuid cannot be used in the same request';
        }
    }
    function getURL$8(modules) {
        var config = modules.config;
        return "/v2/auth/grant/sub-key/".concat(config.subscribeKey);
    }
    function getRequestTimeout$9(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$9() {
        return false;
    }
    function prepareParams$9(modules, incomingParams) {
        var _a = incomingParams.channels, channels = _a === void 0 ? [] : _a, _b = incomingParams.channelGroups, channelGroups = _b === void 0 ? [] : _b, _c = incomingParams.uuids, uuids = _c === void 0 ? [] : _c, ttl = incomingParams.ttl, _d = incomingParams.read, read = _d === void 0 ? false : _d, _e = incomingParams.write, write = _e === void 0 ? false : _e, _f = incomingParams.manage, manage = _f === void 0 ? false : _f, _g = incomingParams.get, get = _g === void 0 ? false : _g, _h = incomingParams.join, join = _h === void 0 ? false : _h, _j = incomingParams.update, update = _j === void 0 ? false : _j, _k = incomingParams.authKeys, authKeys = _k === void 0 ? [] : _k;
        var deleteParam = incomingParams.delete;
        var params = {};
        params.r = read ? '1' : '0';
        params.w = write ? '1' : '0';
        params.m = manage ? '1' : '0';
        params.d = deleteParam ? '1' : '0';
        params.g = get ? '1' : '0';
        params.j = join ? '1' : '0';
        params.u = update ? '1' : '0';
        if (channels.length > 0) {
            params.channel = channels.join(',');
        }
        if (channelGroups.length > 0) {
            params['channel-group'] = channelGroups.join(',');
        }
        if (authKeys.length > 0) {
            params.auth = authKeys.join(',');
        }
        if (uuids.length > 0) {
            params['target-uuid'] = uuids.join(',');
        }
        if (ttl || ttl === 0) {
            params.ttl = ttl;
        }
        return params;
    }
    function handleResponse$9() {
        return {};
    }

    var grantEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$9,
        validateParams: validateParams$9,
        getURL: getURL$8,
        getRequestTimeout: getRequestTimeout$9,
        isAuthSupported: isAuthSupported$9,
        prepareParams: prepareParams$9,
        handleResponse: handleResponse$9
    });

    /*       */
    function getOperation$8() {
        return OPERATIONS.PNAccessManagerGrantToken;
    }
    function extractPermissions(permissions) {
        var permissionsResult = 0;
        /* eslint-disable */
        if (permissions.join) {
            permissionsResult |= 128;
        }
        if (permissions.update) {
            permissionsResult |= 64;
        }
        if (permissions.get) {
            permissionsResult |= 32;
        }
        if (permissions.delete) {
            permissionsResult |= 8;
        }
        if (permissions.manage) {
            permissionsResult |= 4;
        }
        if (permissions.write) {
            permissionsResult |= 2;
        }
        if (permissions.read) {
            permissionsResult |= 1;
        }
        /* eslint-enable */
        return permissionsResult;
    }
    function prepareMessagePayload$2(modules, incomingParams) {
        var ttl = incomingParams.ttl, resources = incomingParams.resources, patterns = incomingParams.patterns, meta = incomingParams.meta, authorized_uuid = incomingParams.authorized_uuid;
        var params = {
            ttl: 0,
            permissions: {
                resources: {
                    channels: {},
                    groups: {},
                    uuids: {},
                    users: {},
                    spaces: {}, // not used, needed for api backward compatibility
                },
                patterns: {
                    channels: {},
                    groups: {},
                    uuids: {},
                    users: {},
                    spaces: {}, // not used, needed for api backward compatibility
                },
                meta: {},
            },
        };
        if (resources) {
            var uuids_1 = resources.uuids, channels_1 = resources.channels, groups_1 = resources.groups;
            if (uuids_1) {
                Object.keys(uuids_1).forEach(function (uuid) {
                    params.permissions.resources.uuids[uuid] = extractPermissions(uuids_1[uuid]);
                });
            }
            if (channels_1) {
                Object.keys(channels_1).forEach(function (channel) {
                    params.permissions.resources.channels[channel] = extractPermissions(channels_1[channel]);
                });
            }
            if (groups_1) {
                Object.keys(groups_1).forEach(function (group) {
                    params.permissions.resources.groups[group] = extractPermissions(groups_1[group]);
                });
            }
        }
        if (patterns) {
            var uuids_2 = patterns.uuids, channels_2 = patterns.channels, groups_2 = patterns.groups;
            if (uuids_2) {
                Object.keys(uuids_2).forEach(function (uuid) {
                    params.permissions.patterns.uuids[uuid] = extractPermissions(uuids_2[uuid]);
                });
            }
            if (channels_2) {
                Object.keys(channels_2).forEach(function (channel) {
                    params.permissions.patterns.channels[channel] = extractPermissions(channels_2[channel]);
                });
            }
            if (groups_2) {
                Object.keys(groups_2).forEach(function (group) {
                    params.permissions.patterns.groups[group] = extractPermissions(groups_2[group]);
                });
            }
        }
        if (ttl || ttl === 0) {
            params.ttl = ttl;
        }
        if (meta) {
            params.permissions.meta = meta;
        }
        if (authorized_uuid) {
            params.permissions.uuid = "".concat(authorized_uuid); // ensure this is a string
        }
        return params;
    }
    function validateParams$8(modules, incomingParams) {
        var config = modules.config;
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
        if (!config.publishKey)
            return 'Missing Publish Key';
        if (!config.secretKey)
            return 'Missing Secret Key';
        if (!incomingParams.resources && !incomingParams.patterns)
            return 'Missing either Resources or Patterns.';
        if ((incomingParams.resources &&
            (!incomingParams.resources.uuids || Object.keys(incomingParams.resources.uuids).length === 0) &&
            (!incomingParams.resources.channels || Object.keys(incomingParams.resources.channels).length === 0) &&
            (!incomingParams.resources.groups || Object.keys(incomingParams.resources.groups).length === 0)) ||
            (incomingParams.patterns &&
                (!incomingParams.patterns.uuids || Object.keys(incomingParams.patterns.uuids).length === 0) &&
                (!incomingParams.patterns.channels || Object.keys(incomingParams.patterns.channels).length === 0) &&
                (!incomingParams.patterns.groups || Object.keys(incomingParams.patterns.groups).length === 0))) {
            return 'Missing values for either Resources or Patterns.';
        }
    }
    function postURL$1(modules) {
        var config = modules.config;
        return "/v3/pam/".concat(config.subscribeKey, "/grant");
    }
    function usePost$1() {
        return true;
    }
    function getRequestTimeout$8(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$8() {
        return false;
    }
    function prepareParams$8() {
        return {};
    }
    function postPayload$1(modules, incomingParams) {
        return prepareMessagePayload$2(modules, incomingParams);
    }
    function handleResponse$8(modules, response) {
        var token = response.data.token;
        return token;
    }

    var grantTokenEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$8,
        extractPermissions: extractPermissions,
        validateParams: validateParams$8,
        postURL: postURL$1,
        usePost: usePost$1,
        getRequestTimeout: getRequestTimeout$8,
        isAuthSupported: isAuthSupported$8,
        prepareParams: prepareParams$8,
        postPayload: postPayload$1,
        handleResponse: handleResponse$8
    });

    /**       */
    var endpoint$2 = {
        getOperation: function () { return OPERATIONS.PNAccessManagerRevokeToken; },
        validateParams: function (modules, token) {
            var secretKey = modules.config.secretKey;
            if (!secretKey) {
                return 'Missing Secret Key';
            }
            if (!token) {
                return "token can't be empty";
            }
        },
        getURL: function (_a, token) {
            var config = _a.config;
            return "/v3/pam/".concat(config.subscribeKey, "/grant/").concat(utils$5.encodeString(token));
        },
        useDelete: function () { return true; },
        getRequestTimeout: function (_a) {
            var config = _a.config;
            return config.getTransactionTimeout();
        },
        isAuthSupported: function () { return false; },
        prepareParams: function (_a) {
            var config = _a.config;
            return ({
                uuid: config.getUUID(),
            });
        },
        handleResponse: function (_, response) { return ({
            status: response.status,
            data: response.data,
        }); },
    };

    /*       */
    function prepareMessagePayload$1(modules, messagePayload) {
        var crypto = modules.crypto, config = modules.config;
        var stringifiedPayload = JSON.stringify(messagePayload);
        if (config.cipherKey) {
            stringifiedPayload = crypto.encrypt(stringifiedPayload);
            stringifiedPayload = JSON.stringify(stringifiedPayload);
        }
        return stringifiedPayload;
    }
    function getOperation$7() {
        return OPERATIONS.PNPublishOperation;
    }
    function validateParams$7(_a, incomingParams) {
        var config = _a.config;
        var message = incomingParams.message, channel = incomingParams.channel;
        if (!channel)
            return 'Missing Channel';
        if (!message)
            return 'Missing Message';
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function usePost(modules, incomingParams) {
        var _a = incomingParams.sendByPost, sendByPost = _a === void 0 ? false : _a;
        return sendByPost;
    }
    function getURL$7(modules, incomingParams) {
        var config = modules.config;
        var channel = incomingParams.channel, message = incomingParams.message;
        var stringifiedPayload = prepareMessagePayload$1(modules, message);
        return "/publish/".concat(config.publishKey, "/").concat(config.subscribeKey, "/0/").concat(utils$5.encodeString(channel), "/0/").concat(utils$5.encodeString(stringifiedPayload));
    }
    function postURL(modules, incomingParams) {
        var config = modules.config;
        var channel = incomingParams.channel;
        return "/publish/".concat(config.publishKey, "/").concat(config.subscribeKey, "/0/").concat(utils$5.encodeString(channel), "/0");
    }
    function getRequestTimeout$7(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$7() {
        return true;
    }
    function postPayload(modules, incomingParams) {
        var message = incomingParams.message;
        return prepareMessagePayload$1(modules, message);
    }
    function prepareParams$7(modules, incomingParams) {
        var meta = incomingParams.meta, _a = incomingParams.replicate, replicate = _a === void 0 ? true : _a, storeInHistory = incomingParams.storeInHistory, ttl = incomingParams.ttl;
        var params = {};
        if (storeInHistory != null) {
            if (storeInHistory) {
                params.store = '1';
            }
            else {
                params.store = '0';
            }
        }
        if (ttl) {
            params.ttl = ttl;
        }
        if (replicate === false) {
            params.norep = 'true';
        }
        if (meta && typeof meta === 'object') {
            params.meta = JSON.stringify(meta);
        }
        return params;
    }
    function handleResponse$7(modules, serverResponse) {
        return { timetoken: serverResponse[2] };
    }

    var publishEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$7,
        validateParams: validateParams$7,
        usePost: usePost,
        getURL: getURL$7,
        postURL: postURL,
        getRequestTimeout: getRequestTimeout$7,
        isAuthSupported: isAuthSupported$7,
        postPayload: postPayload,
        prepareParams: prepareParams$7,
        handleResponse: handleResponse$7
    });

    /*       */
    function prepareMessagePayload(modules, messagePayload) {
        var stringifiedPayload = JSON.stringify(messagePayload);
        return stringifiedPayload;
    }
    function getOperation$6() {
        return OPERATIONS.PNSignalOperation;
    }
    function validateParams$6(_a, incomingParams) {
        var config = _a.config;
        var message = incomingParams.message, channel = incomingParams.channel;
        if (!channel)
            return 'Missing Channel';
        if (!message)
            return 'Missing Message';
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function getURL$6(modules, incomingParams) {
        var config = modules.config;
        var channel = incomingParams.channel, message = incomingParams.message;
        var stringifiedPayload = prepareMessagePayload(modules, message);
        return "/signal/".concat(config.publishKey, "/").concat(config.subscribeKey, "/0/").concat(utils$5.encodeString(channel), "/0/").concat(utils$5.encodeString(stringifiedPayload));
    }
    function getRequestTimeout$6(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$6() {
        return true;
    }
    function prepareParams$6() {
        var params = {};
        return params;
    }
    function handleResponse$6(modules, serverResponse) {
        return { timetoken: serverResponse[2] };
    }

    var signalEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$6,
        validateParams: validateParams$6,
        getURL: getURL$6,
        getRequestTimeout: getRequestTimeout$6,
        isAuthSupported: isAuthSupported$6,
        prepareParams: prepareParams$6,
        handleResponse: handleResponse$6
    });

    /*       */
    function __processMessage$1(modules, message) {
        var config = modules.config, crypto = modules.crypto;
        if (!config.cipherKey)
            return message;
        try {
            return crypto.decrypt(message);
        }
        catch (e) {
            return message;
        }
    }
    function getOperation$5() {
        return OPERATIONS.PNHistoryOperation;
    }
    function validateParams$5(modules, incomingParams) {
        var channel = incomingParams.channel;
        var config = modules.config;
        if (!channel)
            return 'Missing channel';
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function getURL$5(modules, incomingParams) {
        var channel = incomingParams.channel;
        var config = modules.config;
        return "/v2/history/sub-key/".concat(config.subscribeKey, "/channel/").concat(utils$5.encodeString(channel));
    }
    function getRequestTimeout$5(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$5() {
        return true;
    }
    function prepareParams$5(modules, incomingParams) {
        var start = incomingParams.start, end = incomingParams.end, reverse = incomingParams.reverse, _a = incomingParams.count, count = _a === void 0 ? 100 : _a, _b = incomingParams.stringifiedTimeToken, stringifiedTimeToken = _b === void 0 ? false : _b, _c = incomingParams.includeMeta, includeMeta = _c === void 0 ? false : _c;
        var outgoingParams = {
            include_token: 'true',
        };
        outgoingParams.count = count;
        if (start)
            outgoingParams.start = start;
        if (end)
            outgoingParams.end = end;
        if (stringifiedTimeToken)
            outgoingParams.string_message_token = 'true';
        if (reverse != null)
            outgoingParams.reverse = reverse.toString();
        if (includeMeta)
            outgoingParams.include_meta = 'true';
        return outgoingParams;
    }
    function handleResponse$5(modules, serverResponse) {
        var response = {
            messages: [],
            startTimeToken: serverResponse[1],
            endTimeToken: serverResponse[2],
        };
        if (Array.isArray(serverResponse[0])) {
            serverResponse[0].forEach(function (serverHistoryItem) {
                var item = {
                    timetoken: serverHistoryItem.timetoken,
                    entry: __processMessage$1(modules, serverHistoryItem.message),
                };
                if (serverHistoryItem.meta) {
                    item.meta = serverHistoryItem.meta;
                }
                response.messages.push(item);
            });
        }
        return response;
    }

    var historyEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$5,
        validateParams: validateParams$5,
        getURL: getURL$5,
        getRequestTimeout: getRequestTimeout$5,
        isAuthSupported: isAuthSupported$5,
        prepareParams: prepareParams$5,
        handleResponse: handleResponse$5
    });

    /*       */
    function getOperation$4() {
        return OPERATIONS.PNDeleteMessagesOperation;
    }
    function validateParams$4(modules, incomingParams) {
        var channel = incomingParams.channel;
        var config = modules.config;
        if (!channel)
            return 'Missing channel';
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function useDelete() {
        return true;
    }
    function getURL$4(modules, incomingParams) {
        var channel = incomingParams.channel;
        var config = modules.config;
        return "/v3/history/sub-key/".concat(config.subscribeKey, "/channel/").concat(utils$5.encodeString(channel));
    }
    function getRequestTimeout$4(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$4() {
        return true;
    }
    function prepareParams$4(modules, incomingParams) {
        var start = incomingParams.start, end = incomingParams.end;
        var outgoingParams = {};
        if (start)
            outgoingParams.start = start;
        if (end)
            outgoingParams.end = end;
        return outgoingParams;
    }
    function handleResponse$4(modules, serverResponse) {
        return serverResponse.payload;
    }

    var deleteMessagesEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$4,
        validateParams: validateParams$4,
        useDelete: useDelete,
        getURL: getURL$4,
        getRequestTimeout: getRequestTimeout$4,
        isAuthSupported: isAuthSupported$4,
        prepareParams: prepareParams$4,
        handleResponse: handleResponse$4
    });

    /*       */
    function getOperation$3() {
        return OPERATIONS.PNMessageCounts;
    }
    function validateParams$3(modules, incomingParams) {
        var channels = incomingParams.channels, timetoken = incomingParams.timetoken, channelTimetokens = incomingParams.channelTimetokens;
        var config = modules.config;
        if (!channels)
            return 'Missing channel';
        if (timetoken && channelTimetokens)
            return 'timetoken and channelTimetokens are incompatible together';
        if (timetoken && channelTimetokens && channelTimetokens.length > 1 && channels.length !== channelTimetokens.length) {
            return 'Length of channelTimetokens and channels do not match';
        }
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function getURL$3(modules, incomingParams) {
        var channels = incomingParams.channels;
        var config = modules.config;
        var stringifiedChannels = channels.join(',');
        return "/v3/history/sub-key/".concat(config.subscribeKey, "/message-counts/").concat(utils$5.encodeString(stringifiedChannels));
    }
    function getRequestTimeout$3(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$3() {
        return true;
    }
    function prepareParams$3(modules, incomingParams) {
        var timetoken = incomingParams.timetoken, channelTimetokens = incomingParams.channelTimetokens;
        var outgoingParams = {};
        if (channelTimetokens && channelTimetokens.length === 1) {
            var _a = __read$1(channelTimetokens, 1), tt = _a[0];
            outgoingParams.timetoken = tt;
        }
        else if (channelTimetokens) {
            outgoingParams.channelsTimetoken = channelTimetokens.join(',');
        }
        else if (timetoken) {
            outgoingParams.timetoken = timetoken;
        }
        return outgoingParams;
    }
    function handleResponse$3(modules, serverResponse) {
        return { channels: serverResponse.channels };
    }

    var messageCountsEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$3,
        validateParams: validateParams$3,
        getURL: getURL$3,
        getRequestTimeout: getRequestTimeout$3,
        isAuthSupported: isAuthSupported$3,
        prepareParams: prepareParams$3,
        handleResponse: handleResponse$3
    });

    /*       */
    function __processMessage(modules, message) {
        var config = modules.config, crypto = modules.crypto;
        if (!config.cipherKey)
            return message;
        try {
            return crypto.decrypt(message);
        }
        catch (e) {
            return message;
        }
    }
    function getOperation$2() {
        return OPERATIONS.PNFetchMessagesOperation;
    }
    function validateParams$2(modules, incomingParams) {
        var channels = incomingParams.channels, _a = incomingParams.includeMessageActions, includeMessageActions = _a === void 0 ? false : _a;
        var config = modules.config;
        if (!channels || channels.length === 0)
            return 'Missing channels';
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
        if (includeMessageActions && channels.length > 1) {
            throw new TypeError('History can return actions data for a single channel only. ' +
                'Either pass a single channel or disable the includeMessageActions flag.');
        }
    }
    function getURL$2(modules, incomingParams) {
        var _a = incomingParams.channels, channels = _a === void 0 ? [] : _a, _b = incomingParams.includeMessageActions, includeMessageActions = _b === void 0 ? false : _b;
        var config = modules.config;
        var endpoint = !includeMessageActions ? 'history' : 'history-with-actions';
        var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
        return "/v3/".concat(endpoint, "/sub-key/").concat(config.subscribeKey, "/channel/").concat(utils$5.encodeString(stringifiedChannels));
    }
    function getRequestTimeout$2(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function isAuthSupported$2() {
        return true;
    }
    function prepareParams$2(modules, incomingParams) {
        var channels = incomingParams.channels, start = incomingParams.start, end = incomingParams.end, includeMessageActions = incomingParams.includeMessageActions, count = incomingParams.count, _a = incomingParams.stringifiedTimeToken, stringifiedTimeToken = _a === void 0 ? false : _a, _b = incomingParams.includeMeta, includeMeta = _b === void 0 ? false : _b, includeUuid = incomingParams.includeUuid, _c = incomingParams.includeUUID, includeUUID = _c === void 0 ? true : _c, _d = incomingParams.includeMessageType, includeMessageType = _d === void 0 ? true : _d;
        var outgoingParams = {};
        if (count) {
            outgoingParams.max = count;
        }
        else {
            outgoingParams.max = channels.length > 1 || includeMessageActions === true ? 25 : 100;
        }
        if (start)
            outgoingParams.start = start;
        if (end)
            outgoingParams.end = end;
        if (stringifiedTimeToken)
            outgoingParams.string_message_token = 'true';
        if (includeMeta)
            outgoingParams.include_meta = 'true';
        if (includeUUID && includeUuid !== false)
            outgoingParams.include_uuid = 'true';
        if (includeMessageType)
            outgoingParams.include_message_type = 'true';
        return outgoingParams;
    }
    function handleResponse$2(modules, serverResponse) {
        var response = {
            channels: {},
        };
        Object.keys(serverResponse.channels || {}).forEach(function (channelName) {
            response.channels[channelName] = [];
            (serverResponse.channels[channelName] || []).forEach(function (messageEnvelope) {
                var announce = {};
                announce.channel = channelName;
                announce.timetoken = messageEnvelope.timetoken;
                announce.message = __processMessage(modules, messageEnvelope.message);
                announce.messageType = messageEnvelope.message_type;
                announce.uuid = messageEnvelope.uuid;
                if (messageEnvelope.actions) {
                    announce.actions = messageEnvelope.actions;
                    // This should be kept for few updates for existing clients consistency.
                    announce.data = messageEnvelope.actions;
                }
                if (messageEnvelope.meta) {
                    announce.meta = messageEnvelope.meta;
                }
                response.channels[channelName].push(announce);
            });
        });
        if (serverResponse.more) {
            response.more = serverResponse.more;
        }
        return response;
    }

    var fetchMessagesEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$2,
        validateParams: validateParams$2,
        getURL: getURL$2,
        getRequestTimeout: getRequestTimeout$2,
        isAuthSupported: isAuthSupported$2,
        prepareParams: prepareParams$2,
        handleResponse: handleResponse$2
    });

    /*       */
    function getOperation$1() {
        return OPERATIONS.PNTimeOperation;
    }
    function getURL$1() {
        return '/time/0';
    }
    function getRequestTimeout$1(_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    }
    function prepareParams$1() {
        return {};
    }
    function isAuthSupported$1() {
        return false;
    }
    function handleResponse$1(modules, serverResponse) {
        return {
            timetoken: serverResponse[0],
        };
    }
    function validateParams$1() {
        // pass
    }

    var timeEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation$1,
        getURL: getURL$1,
        getRequestTimeout: getRequestTimeout$1,
        prepareParams: prepareParams$1,
        isAuthSupported: isAuthSupported$1,
        handleResponse: handleResponse$1,
        validateParams: validateParams$1
    });

    /*       */
    function getOperation() {
        return OPERATIONS.PNSubscribeOperation;
    }
    function validateParams(modules) {
        var config = modules.config;
        if (!config.subscribeKey)
            return 'Missing Subscribe Key';
    }
    function getURL(modules, incomingParams) {
        var config = modules.config;
        var _a = incomingParams.channels, channels = _a === void 0 ? [] : _a;
        var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
        return "/v2/subscribe/".concat(config.subscribeKey, "/").concat(utils$5.encodeString(stringifiedChannels), "/0");
    }
    function getRequestTimeout(_a) {
        var config = _a.config;
        return config.getSubscribeTimeout();
    }
    function isAuthSupported() {
        return true;
    }
    function prepareParams(_a, incomingParams) {
        var config = _a.config;
        var state = incomingParams.state, _b = incomingParams.channelGroups, channelGroups = _b === void 0 ? [] : _b, timetoken = incomingParams.timetoken, filterExpression = incomingParams.filterExpression, region = incomingParams.region;
        var params = {
            heartbeat: config.getPresenceTimeout(),
        };
        if (channelGroups.length > 0) {
            params['channel-group'] = channelGroups.join(',');
        }
        if (filterExpression && filterExpression.length > 0) {
            params['filter-expr'] = filterExpression;
        }
        if (Object.keys(state).length) {
            params.state = JSON.stringify(state);
        }
        if (timetoken) {
            params.tt = timetoken;
        }
        if (region) {
            params.tr = region;
        }
        return params;
    }
    function handleResponse(modules, serverResponse) {
        var messages = [];
        serverResponse.m.forEach(function (rawMessage) {
            var publishMetaData = {
                publishTimetoken: rawMessage.p.t,
                region: rawMessage.p.r,
            };
            var parsedMessage = {
                shard: parseInt(rawMessage.a, 10),
                subscriptionMatch: rawMessage.b,
                channel: rawMessage.c,
                messageType: rawMessage.e,
                payload: rawMessage.d,
                flags: rawMessage.f,
                issuingClientId: rawMessage.i,
                subscribeKey: rawMessage.k,
                originationTimetoken: rawMessage.o,
                userMetadata: rawMessage.u,
                publishMetaData: publishMetaData,
            };
            messages.push(parsedMessage);
        });
        var metadata = {
            timetoken: serverResponse.t.t,
            region: serverResponse.t.r,
        };
        return { messages: messages, metadata: metadata };
    }

    var subscribeEndpointConfig = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getOperation: getOperation,
        validateParams: validateParams,
        getURL: getURL,
        getRequestTimeout: getRequestTimeout,
        isAuthSupported: isAuthSupported,
        prepareParams: prepareParams,
        handleResponse: handleResponse
    });

    var endpoint$1 = {
        getOperation: function () { return OPERATIONS.PNHandshakeOperation; },
        validateParams: function (_, params) {
            if (!(params === null || params === void 0 ? void 0 : params.channels) && !(params === null || params === void 0 ? void 0 : params.channelGroups)) {
                return 'channels and channleGroups both should not be empty';
            }
        },
        getURL: function (_a, params) {
            var config = _a.config;
            var channelsString = params.channels ? params.channels.join(',') : ',';
            return "/v2/subscribe/".concat(config.subscribeKey, "/").concat(utils$5.encodeString(channelsString), "/0");
        },
        getRequestTimeout: function (_a) {
            var config = _a.config;
            return config.getSubscribeTimeout();
        },
        isAuthSupported: function () { return true; },
        prepareParams: function (_, params) {
            var outParams = {};
            if (params.channelGroups && params.channelGroups.length > 0) {
                outParams['channel-group'] = params.channelGroups.join(',');
            }
            outParams.tt = 0;
            return outParams;
        },
        handleResponse: function (_, response) { return ({
            region: response.t.r,
            timetoken: response.t.t,
        }); },
    };

    var endpoint = {
        getOperation: function () { return OPERATIONS.PNReceiveMessagesOperation; },
        validateParams: function (_, params) {
            if (!(params === null || params === void 0 ? void 0 : params.channels) && !(params === null || params === void 0 ? void 0 : params.channelGroups)) {
                return 'channels and channleGroups both should not be empty';
            }
            if (!(params === null || params === void 0 ? void 0 : params.timetoken)) {
                return 'timetoken can not be empty';
            }
            if (!(params === null || params === void 0 ? void 0 : params.region)) {
                return 'region can not be empty';
            }
        },
        getURL: function (_a, params) {
            var config = _a.config;
            var channelsString = params.channels ? params.channels.join(',') : ',';
            return "/v2/subscribe/".concat(config.subscribeKey, "/").concat(utils$5.encodeString(channelsString), "/0");
        },
        getRequestTimeout: function (_a) {
            var config = _a.config;
            return config.getSubscribeTimeout();
        },
        isAuthSupported: function () { return true; },
        getAbortSignal: function (_, params) { return params.abortSignal; },
        prepareParams: function (_, params) {
            var outParams = {};
            if (params.channelGroups && params.channelGroups.length > 0) {
                outParams['channel-group'] = params.channelGroups.join(',');
            }
            outParams.tt = params.timetoken;
            outParams.tr = params.region;
            return outParams;
        },
        handleResponse: function (_, response) {
            var parsedMessages = [];
            response.m.forEach(function (envelope) {
                var parsedMessage = {
                    shard: parseInt(envelope.a, 10),
                    subscriptionMatch: envelope.b,
                    channel: envelope.c,
                    messageType: envelope.e,
                    payload: envelope.d,
                    flags: envelope.f,
                    issuingClientId: envelope.i,
                    subscribeKey: envelope.k,
                    originationTimetoken: envelope.o,
                    publishMetaData: {
                        timetoken: envelope.p.t,
                        region: envelope.p.r,
                    },
                };
                parsedMessages.push(parsedMessage);
            });
            return {
                messages: parsedMessages,
                metadata: {
                    region: response.t.r,
                    timetoken: response.t.t,
                },
            };
        },
    };

    var Subject = /** @class */ (function () {
        function Subject(sync) {
            if (sync === void 0) { sync = false; }
            this.sync = sync;
            this.listeners = new Set();
        }
        Subject.prototype.subscribe = function (listener) {
            var _this = this;
            this.listeners.add(listener);
            return function () {
                _this.listeners.delete(listener);
            };
        };
        Subject.prototype.notify = function (event) {
            var _this = this;
            var wrapper = function () {
                _this.listeners.forEach(function (listener) {
                    listener(event);
                });
            };
            if (this.sync) {
                wrapper();
            }
            else {
                setTimeout(wrapper, 0);
            }
        };
        return Subject;
    }());

    /* eslint-disable @typescript-eslint/no-explicit-any */
    var State = /** @class */ (function () {
        function State(label) {
            this.label = label;
            this.transitionMap = new Map();
            this.enterEffects = [];
            this.exitEffects = [];
        }
        State.prototype.transition = function (context, event) {
            var _a;
            if (this.transitionMap.has(event.type)) {
                return (_a = this.transitionMap.get(event.type)) === null || _a === void 0 ? void 0 : _a(context, event);
            }
            return undefined;
        };
        State.prototype.on = function (eventType, transition) {
            this.transitionMap.set(eventType, transition);
            return this;
        };
        State.prototype.with = function (context, effects) {
            return [this, context, effects !== null && effects !== void 0 ? effects : []];
        };
        State.prototype.onEnter = function (effect) {
            this.enterEffects.push(effect);
            return this;
        };
        State.prototype.onExit = function (effect) {
            this.exitEffects.push(effect);
            return this;
        };
        return State;
    }());

    /* eslint-disable @typescript-eslint/no-explicit-any */
    var Engine = /** @class */ (function (_super) {
        __extends(Engine, _super);
        function Engine() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Engine.prototype.describe = function (label) {
            return new State(label);
        };
        Engine.prototype.start = function (initialState, initialContext) {
            this.currentState = initialState;
            this.currentContext = initialContext;
            this.notify({
                type: 'engineStarted',
                state: initialState,
                context: initialContext,
            });
            return;
        };
        Engine.prototype.transition = function (event) {
            var e_1, _a, e_2, _b, e_3, _c;
            if (!this.currentState) {
                throw new Error('Start the engine first');
            }
            this.notify({
                type: 'eventReceived',
                event: event,
            });
            var transition = this.currentState.transition(this.currentContext, event);
            if (transition) {
                var _d = __read$1(transition, 3), newState = _d[0], newContext = _d[1], effects = _d[2];
                try {
                    for (var _e = __values(this.currentState.exitEffects), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var effect = _f.value;
                        this.notify({
                            type: 'invocationDispatched',
                            invocation: effect(this.currentContext),
                        });
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                var oldState = this.currentState;
                this.currentState = newState;
                var oldContext = this.currentContext;
                this.currentContext = newContext;
                this.notify({
                    type: 'transitionDone',
                    fromState: oldState,
                    fromContext: oldContext,
                    toState: newState,
                    toContext: newContext,
                    event: event,
                });
                try {
                    for (var effects_1 = __values(effects), effects_1_1 = effects_1.next(); !effects_1_1.done; effects_1_1 = effects_1.next()) {
                        var effect = effects_1_1.value;
                        this.notify({
                            type: 'invocationDispatched',
                            invocation: effect,
                        });
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (effects_1_1 && !effects_1_1.done && (_b = effects_1.return)) _b.call(effects_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                try {
                    for (var _g = __values(this.currentState.enterEffects), _h = _g.next(); !_h.done; _h = _g.next()) {
                        var effect = _h.value;
                        this.notify({
                            type: 'invocationDispatched',
                            invocation: effect(this.currentContext),
                        });
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_h && !_h.done && (_c = _g.return)) _c.call(_g);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
        };
        return Engine;
    }(Subject));

    /* eslint-disable @typescript-eslint/no-explicit-any */
    var Dispatcher = /** @class */ (function () {
        function Dispatcher(dependencies) {
            this.dependencies = dependencies;
            this.instances = new Map();
            this.handlers = new Map();
        }
        Dispatcher.prototype.on = function (type, handlerCreator) {
            this.handlers.set(type, handlerCreator);
        };
        Dispatcher.prototype.dispatch = function (invocation) {
            if (invocation.type === 'CANCEL') {
                if (this.instances.has(invocation.payload)) {
                    var instance_1 = this.instances.get(invocation.payload);
                    instance_1 === null || instance_1 === void 0 ? void 0 : instance_1.cancel();
                    this.instances.delete(invocation.payload);
                }
                return;
            }
            var handlerCreator = this.handlers.get(invocation.type);
            if (!handlerCreator) {
                throw new Error("Unhandled invocation '".concat(invocation.type, "'"));
            }
            var instance = handlerCreator(invocation.payload, this.dependencies);
            if (invocation.managed) {
                this.instances.set(invocation.type, instance);
            }
            instance.start();
        };
        return Dispatcher;
    }());

    /* eslint-disable @typescript-eslint/no-explicit-any */
    function createEvent(type, fn) {
        var creator = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return {
                type: type,
                payload: fn === null || fn === void 0 ? void 0 : fn.apply(void 0, __spreadArray$1([], __read$1(args), false)),
            };
        };
        creator.type = type;
        return creator;
    }
    function createEffect(type, fn) {
        var creator = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return { type: type, payload: fn.apply(void 0, __spreadArray$1([], __read$1(args), false)), managed: false };
        };
        creator.type = type;
        return creator;
    }
    function createManagedEffect(type, fn) {
        var creator = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return { type: type, payload: fn.apply(void 0, __spreadArray$1([], __read$1(args), false)), managed: true };
        };
        creator.type = type;
        creator.cancel = { type: 'CANCEL', payload: type, managed: false };
        return creator;
    }

    var AbortError = /** @class */ (function (_super) {
        __extends(AbortError, _super);
        function AbortError() {
            var _newTarget = this.constructor;
            var _this = _super.call(this, 'The operation was aborted.') || this;
            _this.name = 'AbortError';
            Object.setPrototypeOf(_this, _newTarget.prototype);
            return _this;
        }
        return AbortError;
    }(Error));
    var AbortSignal = /** @class */ (function (_super) {
        __extends(AbortSignal, _super);
        function AbortSignal() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._aborted = false;
            return _this;
        }
        Object.defineProperty(AbortSignal.prototype, "aborted", {
            get: function () {
                return this._aborted;
            },
            enumerable: false,
            configurable: true
        });
        AbortSignal.prototype.throwIfAborted = function () {
            if (this._aborted) {
                throw new AbortError();
            }
        };
        AbortSignal.prototype.abort = function () {
            this._aborted = true;
            this.notify(new AbortError());
        };
        return AbortSignal;
    }(Subject));

    var Handler = /** @class */ (function () {
        function Handler(payload, dependencies) {
            this.payload = payload;
            this.dependencies = dependencies;
        }
        return Handler;
    }());
    var AsyncHandler = /** @class */ (function (_super) {
        __extends(AsyncHandler, _super);
        function AsyncHandler(payload, dependencies, asyncFunction) {
            var _this = _super.call(this, payload, dependencies) || this;
            _this.asyncFunction = asyncFunction;
            _this.abortSignal = new AbortSignal();
            return _this;
        }
        AsyncHandler.prototype.start = function () {
            this.asyncFunction(this.payload, this.abortSignal, this.dependencies);
        };
        AsyncHandler.prototype.cancel = function () {
            this.abortSignal.abort();
        };
        return AsyncHandler;
    }(Handler));
    var asyncHandler = function (handlerFunction) {
        return function (payload, dependencies) {
            return new AsyncHandler(payload, dependencies, handlerFunction);
        };
    };

    var handshake = createManagedEffect('HANDSHAKE', function (channels, groups) { return ({
        channels: channels,
        groups: groups,
    }); });
    var receiveEvents = createManagedEffect('RECEIVE_EVENTS', function (channels, groups, cursor) { return ({ channels: channels, groups: groups, cursor: cursor }); });
    var emitEvents = createEffect('EMIT_EVENTS', function (events) { return events; });
    var reconnect$1 = createManagedEffect('RECONNECT', function (context) { return context; });
    var handshakeReconnect = createManagedEffect('HANDSHAKE_RECONNECT', function (context) { return context; });

    var subscriptionChange = createEvent('SUBSCRIPTION_CHANGE', function (channels, groups) { return ({
        channels: channels,
        groups: groups,
    }); });
    var disconnect = createEvent('DISCONNECT', function () { return ({}); });
    var reconnect = createEvent('RECONNECT', function () { return ({}); });
    createEvent('RESTORE', function (channels, groups, timetoken, region) { return ({
        channels: channels,
        groups: groups,
        timetoken: timetoken,
        region: region,
    }); });
    var handshakingSuccess = createEvent('HANDSHAKING_SUCCESS', function (cursor) { return cursor; });
    var handshakingFailure = createEvent('HANDSHAKING_FAILURE', function (error) { return error; });
    var handshakingReconnectingSuccess = createEvent('HANDSHAKING_RECONNECTING_SUCCESS', function (cursor) { return ({
        cursor: cursor,
    }); });
    var handshakingReconnectingFailure = createEvent('HANDSHAKING_RECONNECTING_FAILURE', function (error) { return error; });
    var handshakingReconnectingGiveup = createEvent('HANDSHAKING_RECONNECTING_GIVEUP', function () { return ({}); });
    var handshakingReconnectingRetry = createEvent('HANDSHAKING_RECONNECTING_RETRY', function () { return ({}); });
    var receivingSuccess = createEvent('RECEIVING_SUCCESS', function (cursor, events) { return ({
        cursor: cursor,
        events: events,
    }); });
    var receivingFailure = createEvent('RECEIVING_FAILURE', function (error) { return error; });
    var reconnectingSuccess = createEvent('RECONNECTING_SUCCESS', function (cursor, events) { return ({
        cursor: cursor,
        events: events,
    }); });
    var reconnectingFailure = createEvent('RECONNECTING_FAILURE', function (error) { return error; });
    var reconnectingGiveup = createEvent('RECONNECTING_GIVEUP', function () { return ({}); });
    var reconnectingRetry = createEvent('RECONNECTING_RETRY', function () { return ({}); });

    var EventEngineDispatcher = /** @class */ (function (_super) {
        __extends(EventEngineDispatcher, _super);
        function EventEngineDispatcher(engine, dependencies) {
            var _this = _super.call(this, dependencies) || this;
            _this.on(handshake.type, asyncHandler(function (payload, abortSignal, _a) {
                var handshake = _a.handshake;
                return __awaiter(_this, void 0, void 0, function () {
                    var result, e_1;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                abortSignal.throwIfAborted();
                                _b.label = 1;
                            case 1:
                                _b.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, handshake({
                                        abortSignal: abortSignal,
                                        channels: payload.channels,
                                        channelGroups: payload.groups,
                                    })];
                            case 2:
                                result = _b.sent();
                                engine.transition(handshakingSuccess(result));
                                return [3 /*break*/, 4];
                            case 3:
                                e_1 = _b.sent();
                                if (e_1 instanceof Error && e_1.message === 'Aborted') {
                                    return [2 /*return*/];
                                }
                                if (e_1 instanceof PubNubError) {
                                    return [2 /*return*/, engine.transition(handshakingFailure(e_1))];
                                }
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                });
            }));
            _this.on(receiveEvents.type, asyncHandler(function (payload, abortSignal, _a) {
                var receiveEvents = _a.receiveEvents;
                return __awaiter(_this, void 0, void 0, function () {
                    var result, error_1;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                abortSignal.throwIfAborted();
                                _b.label = 1;
                            case 1:
                                _b.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, receiveEvents({
                                        abortSignal: abortSignal,
                                        channels: payload.channels,
                                        channelGroups: payload.groups,
                                        timetoken: payload.cursor.timetoken,
                                        region: payload.cursor.region,
                                    })];
                            case 2:
                                result = _b.sent();
                                engine.transition(receivingSuccess(result.metadata, result.messages));
                                return [3 /*break*/, 4];
                            case 3:
                                error_1 = _b.sent();
                                if (error_1 instanceof Error && error_1.message === 'Aborted') {
                                    return [2 /*return*/];
                                }
                                if (error_1 instanceof PubNubError) {
                                    return [2 /*return*/, engine.transition(receivingFailure(error_1))];
                                }
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                });
            }));
            _this.on(emitEvents.type, asyncHandler(function (payload, abortSignal, _a) {
                _a.receiveEvents;
                return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_b) {
                        if (payload.length > 0) {
                            console.log(payload);
                        }
                        return [2 /*return*/];
                    });
                });
            }));
            _this.on(reconnect$1.type, asyncHandler(function (payload, abortSignal, _a) {
                var receiveEvents = _a.receiveEvents, shouldRetry = _a.shouldRetry, getRetryDelay = _a.getRetryDelay, delay = _a.delay;
                return __awaiter(_this, void 0, void 0, function () {
                    var result, error_2;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (!shouldRetry(payload.reason, payload.attempts)) {
                                    return [2 /*return*/, engine.transition(reconnectingGiveup())];
                                }
                                abortSignal.throwIfAborted();
                                return [4 /*yield*/, delay(getRetryDelay(payload.attempts))];
                            case 1:
                                _b.sent();
                                abortSignal.throwIfAborted();
                                _b.label = 2;
                            case 2:
                                _b.trys.push([2, 4, , 5]);
                                return [4 /*yield*/, receiveEvents({
                                        abortSignal: abortSignal,
                                        channels: payload.channels,
                                        channelGroups: payload.groups,
                                        timetoken: payload.cursor.timetoken,
                                        region: payload.cursor.region,
                                    })];
                            case 3:
                                result = _b.sent();
                                return [2 /*return*/, engine.transition(reconnectingSuccess(result.metadata, result.messages))];
                            case 4:
                                error_2 = _b.sent();
                                if (error_2 instanceof Error && error_2.message === 'Aborted') {
                                    return [2 /*return*/];
                                }
                                if (error_2 instanceof PubNubError) {
                                    return [2 /*return*/, engine.transition(reconnectingFailure(error_2))];
                                }
                                return [3 /*break*/, 5];
                            case 5: return [2 /*return*/];
                        }
                    });
                });
            }));
            _this.on(handshakeReconnect.type, asyncHandler(function (payload, abortSignal, _a) {
                var handshake = _a.handshake, shouldRetry = _a.shouldRetry, getRetryDelay = _a.getRetryDelay, delay = _a.delay;
                return __awaiter(_this, void 0, void 0, function () {
                    var result, error_3;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (!shouldRetry(payload.reason, payload.attempts)) {
                                    return [2 /*return*/, engine.transition(handshakingReconnectingGiveup())];
                                }
                                abortSignal.throwIfAborted();
                                return [4 /*yield*/, delay(getRetryDelay(payload.attempts))];
                            case 1:
                                _b.sent();
                                abortSignal.throwIfAborted();
                                _b.label = 2;
                            case 2:
                                _b.trys.push([2, 4, , 5]);
                                return [4 /*yield*/, handshake({
                                        abortSignal: abortSignal,
                                        channels: payload.channels,
                                        channelGroups: payload.groups,
                                    })];
                            case 3:
                                result = _b.sent();
                                return [2 /*return*/, engine.transition(handshakingReconnectingSuccess(result.metadata))];
                            case 4:
                                error_3 = _b.sent();
                                if (error_3 instanceof Error && error_3.message === 'Aborted') {
                                    return [2 /*return*/];
                                }
                                if (error_3 instanceof PubNubError) {
                                    return [2 /*return*/, engine.transition(handshakingReconnectingFailure(error_3))];
                                }
                                return [3 /*break*/, 5];
                            case 5: return [2 /*return*/];
                        }
                    });
                });
            }));
            return _this;
        }
        return EventEngineDispatcher;
    }(Dispatcher));

    var HandshakeStoppedState = new State('STOPPED');
    HandshakeStoppedState.on(subscriptionChange.type, function (_context, event) {
        return HandshakeStoppedState.with({
            channels: event.payload.channels,
            groups: event.payload.groups,
        });
    });
    HandshakeStoppedState.on(reconnect.type, function (context) { return HandshakingState.with(__assign({}, context)); });

    var HandshakeFailureState = new State('HANDSHAKE_FAILURE');
    HandshakeFailureState.on(handshakingReconnectingRetry.type, function (context) {
        return HandshakeReconnectingState.with(__assign(__assign({}, context), { attempts: 0 }));
    });
    HandshakeFailureState.on(disconnect.type, function (context) {
        return HandshakeStoppedState.with({
            channels: context.channels,
            groups: context.groups,
        });
    });

    var ReceiveStoppedState = new State('STOPPED');
    ReceiveStoppedState.on(subscriptionChange.type, function (context, event) {
        return ReceiveStoppedState.with({
            channels: event.payload.channels,
            groups: event.payload.groups,
            cursor: context.cursor,
        });
    });
    ReceiveStoppedState.on(reconnect.type, function (context) { return ReceivingState.with(__assign({}, context)); });

    var ReceiveFailureState = new State('RECEIVE_FAILURE');
    ReceiveFailureState.on(reconnectingRetry.type, function (context) {
        return ReceiveReconnectingState.with(__assign(__assign({}, context), { attempts: 0 }));
    });
    ReceiveFailureState.on(disconnect.type, function (context) {
        return ReceiveStoppedState.with({
            channels: context.channels,
            groups: context.groups,
            cursor: context.cursor,
        });
    });

    var ReceiveReconnectingState = new State('RECEIVE_RECONNECTING');
    ReceiveReconnectingState.onEnter(function (context) { return reconnect$1(context); });
    ReceiveReconnectingState.onExit(function () { return reconnect$1.cancel; });
    ReceiveReconnectingState.on(reconnectingSuccess.type, function (context, event) {
        return ReceivingState.with({
            channels: context.channels,
            groups: context.groups,
            cursor: event.payload.cursor,
        }, [emitEvents(event.payload.events)]);
    });
    ReceiveReconnectingState.on(reconnectingFailure.type, function (context, event) {
        return ReceiveReconnectingState.with(__assign(__assign({}, context), { attempts: context.attempts + 1, reason: event.payload }));
    });
    ReceiveReconnectingState.on(reconnectingGiveup.type, function (context) {
        return ReceiveFailureState.with({
            groups: context.groups,
            channels: context.channels,
            cursor: context.cursor,
            reason: context.reason,
        });
    });
    ReceiveReconnectingState.on(disconnect.type, function (context) {
        return ReceiveStoppedState.with({
            channels: context.channels,
            groups: context.groups,
            cursor: context.cursor,
        });
    });

    var ReceivingState = new State('RECEIVING');
    ReceivingState.onEnter(function (context) { return receiveEvents(context.channels, context.groups, context.cursor); });
    ReceivingState.onExit(function () { return receiveEvents.cancel; });
    ReceivingState.on(receivingSuccess.type, function (context, event) {
        return ReceivingState.with(__assign(__assign({}, context), { cursor: event.payload.cursor }), [emitEvents(event.payload.events)]);
    });
    ReceivingState.on(subscriptionChange.type, function (context, event) {
        if (event.payload.channels.length === 0 && event.payload.groups.length === 0) {
            return UnsubscribedState.with(undefined);
        }
        return ReceivingState.with(__assign(__assign({}, context), { channels: event.payload.channels, groups: event.payload.groups }));
    });
    ReceivingState.on(receivingFailure.type, function (context, event) {
        return ReceiveReconnectingState.with(__assign(__assign({}, context), { attempts: 0, reason: event.payload }));
    });
    ReceivingState.on(disconnect.type, function (context) {
        return ReceiveStoppedState.with({
            channels: context.channels,
            groups: context.groups,
            cursor: context.cursor,
        });
    });

    var HandshakeReconnectingState = new State('HANDSHAKE_RECONNECTING');
    HandshakeReconnectingState.onEnter(function (context) { return handshakeReconnect(context); });
    HandshakeReconnectingState.onExit(function () { return reconnect$1.cancel; });
    HandshakeReconnectingState.on(reconnectingSuccess.type, function (context, event) {
        return ReceivingState.with({
            channels: context.channels,
            groups: context.groups,
            cursor: event.payload.cursor,
        }, [emitEvents(event.payload.events)]);
    });
    HandshakeReconnectingState.on(reconnectingFailure.type, function (context, event) {
        return HandshakeReconnectingState.with(__assign(__assign({}, context), { attempts: context.attempts + 1, reason: event.payload }));
    });
    HandshakeReconnectingState.on(reconnectingGiveup.type, function (context) {
        return HandshakeFailureState.with({
            groups: context.groups,
            channels: context.channels,
            reason: context.reason,
        });
    });
    HandshakeReconnectingState.on(disconnect.type, function (context) {
        return HandshakeStoppedState.with({
            channels: context.channels,
            groups: context.groups,
        });
    });

    var HandshakingState = new State('HANDSHAKING');
    HandshakingState.onEnter(function (context) { return handshake(context.channels, context.groups); });
    HandshakingState.onExit(function () { return handshake.cancel; });
    HandshakingState.on(subscriptionChange.type, function (context, event) {
        if (event.payload.channels.length === 0 && event.payload.groups.length === 0) {
            return UnsubscribedState.with(undefined);
        }
        return HandshakingState.with({ channels: event.payload.channels, groups: event.payload.groups });
    });
    HandshakingState.on(handshakingSuccess.type, function (context, event) {
        return ReceivingState.with({
            channels: context.channels,
            groups: context.groups,
            cursor: event.payload,
        });
    });
    HandshakingState.on(handshakingFailure.type, function (context, event) {
        return HandshakeReconnectingState.with(__assign(__assign({}, context), { attempts: 0, reason: event.payload }));
    });
    HandshakingState.on(disconnect.type, function (context) {
        return HandshakeStoppedState.with({
            channels: context.channels,
            groups: context.groups,
        });
    });

    var UnsubscribedState = new State('UNSUBSCRIBED');
    UnsubscribedState.on(subscriptionChange.type, function (_, event) {
        return HandshakingState.with({ channels: event.payload.channels, groups: event.payload.groups });
    });

    var EventEngine = /** @class */ (function () {
        function EventEngine(dependencies) {
            var _this = this;
            this.engine = new Engine();
            this.channels = [];
            this.groups = [];
            this.dispatcher = new EventEngineDispatcher(this.engine, dependencies);
            this.engine.subscribe(function (change) {
                if (change.type === 'invocationDispatched') {
                    _this.dispatcher.dispatch(change.invocation);
                }
            });
            this.engine.start(UnsubscribedState, undefined);
        }
        Object.defineProperty(EventEngine.prototype, "_engine", {
            get: function () {
                return this.engine;
            },
            enumerable: false,
            configurable: true
        });
        EventEngine.prototype.subscribe = function (_a) {
            var channels = _a.channels, groups = _a.groups;
            this.channels = __spreadArray$1(__spreadArray$1([], __read$1(this.channels), false), __read$1((channels !== null && channels !== void 0 ? channels : [])), false);
            this.groups = __spreadArray$1(__spreadArray$1([], __read$1(this.groups), false), __read$1((groups !== null && groups !== void 0 ? groups : [])), false);
            this.engine.transition(subscriptionChange(this.channels, this.groups));
        };
        EventEngine.prototype.unsubscribe = function (_a) {
            var channels = _a.channels, groups = _a.groups;
            this.channels = this.channels.filter(function (channel) { var _a; return (_a = !(channels === null || channels === void 0 ? void 0 : channels.includes(channel))) !== null && _a !== void 0 ? _a : true; });
            this.groups = this.groups.filter(function (group) { var _a; return (_a = !(groups === null || groups === void 0 ? void 0 : groups.includes(group))) !== null && _a !== void 0 ? _a : true; });
            this.engine.transition(subscriptionChange(this.channels.slice(0), this.groups.slice(0)));
        };
        EventEngine.prototype.unsubscribeAll = function () {
            this.channels = [];
            this.groups = [];
            this.engine.transition(subscriptionChange(this.channels.slice(0), this.groups.slice(0)));
        };
        EventEngine.prototype.reconnect = function () {
            this.engine.transition(reconnect());
        };
        EventEngine.prototype.disconnect = function () {
            this.engine.transition(disconnect());
        };
        return EventEngine;
    }());

    var default_1$3 = /** @class */ (function () {
        //
        function default_1(setup) {
            var _this = this;
            var networking = setup.networking, cbor = setup.cbor;
            var config = new default_1$b({ setup: setup });
            this._config = config;
            var crypto = new default_1$a({ config: config }); // LEGACY
            var cryptography = setup.cryptography;
            networking.init(config);
            var tokenManager = new default_1$4(config, cbor);
            this._tokenManager = tokenManager;
            var telemetryManager = new default_1$6({
                maximumSamplesCount: 60000,
            });
            this._telemetryManager = telemetryManager;
            var modules = {
                config: config,
                networking: networking,
                crypto: crypto,
                cryptography: cryptography,
                tokenManager: tokenManager,
                telemetryManager: telemetryManager,
                PubNubFile: setup.PubNubFile,
            };
            this.File = setup.PubNubFile;
            this.encryptFile = function (key, file) { return cryptography.encryptFile(key, file, _this.File); };
            this.decryptFile = function (key, file) { return cryptography.decryptFile(key, file, _this.File); };
            var timeEndpoint = endpointCreator.bind(this, modules, timeEndpointConfig);
            var leaveEndpoint = endpointCreator.bind(this, modules, presenceLeaveEndpointConfig);
            var heartbeatEndpoint = endpointCreator.bind(this, modules, presenceHeartbeatEndpointConfig);
            var setStateEndpoint = endpointCreator.bind(this, modules, presenceSetStateConfig);
            var subscribeEndpoint = endpointCreator.bind(this, modules, subscribeEndpointConfig);
            // managers
            var listenerManager = new default_1$5();
            this._listenerManager = listenerManager;
            this.iAmHere = endpointCreator.bind(this, modules, presenceHeartbeatEndpointConfig);
            this.iAmAway = endpointCreator.bind(this, modules, presenceLeaveEndpointConfig);
            this.setPresenceState = endpointCreator.bind(this, modules, presenceSetStateConfig);
            this.handshake = endpointCreator.bind(this, modules, endpoint$1);
            this.receiveMessages = endpointCreator.bind(this, modules, endpoint);
            if (config.enableSubscribeBeta === true) {
                var eventEngine = new EventEngine({ handshake: this.handshake, receiveEvents: this.receiveMessages });
                this.subscribe = eventEngine.subscribe.bind(eventEngine);
                this.unsubscribe = eventEngine.unsubscribe.bind(eventEngine);
                this.eventEngine = eventEngine;
            }
            else {
                var subscriptionManager_1 = new default_1$7({
                    timeEndpoint: timeEndpoint,
                    leaveEndpoint: leaveEndpoint,
                    heartbeatEndpoint: heartbeatEndpoint,
                    setStateEndpoint: setStateEndpoint,
                    subscribeEndpoint: subscribeEndpoint,
                    crypto: modules.crypto,
                    config: modules.config,
                    listenerManager: listenerManager,
                    getFileUrl: function (params) { return getFileUrlFunction(modules, params); },
                });
                this.subscribe = subscriptionManager_1.adaptSubscribeChange.bind(subscriptionManager_1);
                this.unsubscribe = subscriptionManager_1.adaptUnsubscribeChange.bind(subscriptionManager_1);
                this.disconnect = subscriptionManager_1.disconnect.bind(subscriptionManager_1);
                this.reconnect = subscriptionManager_1.reconnect.bind(subscriptionManager_1);
                this.unsubscribeAll = subscriptionManager_1.unsubscribeAll.bind(subscriptionManager_1);
                this.getSubscribedChannels = subscriptionManager_1.getSubscribedChannels.bind(subscriptionManager_1);
                this.getSubscribedChannelGroups = subscriptionManager_1.getSubscribedChannelGroups.bind(subscriptionManager_1);
                this.setState = subscriptionManager_1.adaptStateChange.bind(subscriptionManager_1);
                this.presence = subscriptionManager_1.adaptPresenceChange.bind(subscriptionManager_1);
                this.destroy = function (isOffline) {
                    subscriptionManager_1.unsubscribeAll(isOffline);
                    subscriptionManager_1.disconnect();
                };
            }
            this.addListener = listenerManager.addListener.bind(listenerManager);
            this.removeListener = listenerManager.removeListener.bind(listenerManager);
            this.removeAllListeners = listenerManager.removeAllListeners.bind(listenerManager);
            this.parseToken = tokenManager.parseToken.bind(tokenManager);
            this.setToken = tokenManager.setToken.bind(tokenManager);
            this.getToken = tokenManager.getToken.bind(tokenManager);
            /* channel groups */
            this.channelGroups = {
                listGroups: endpointCreator.bind(this, modules, listChannelGroupsConfig),
                listChannels: endpointCreator.bind(this, modules, listChannelsInChannelGroupConfig),
                addChannels: endpointCreator.bind(this, modules, addChannelsChannelGroupConfig),
                removeChannels: endpointCreator.bind(this, modules, removeChannelsChannelGroupConfig),
                deleteGroup: endpointCreator.bind(this, modules, deleteChannelGroupConfig),
            };
            /* push */
            this.push = {
                addChannels: endpointCreator.bind(this, modules, addPushChannelsConfig),
                removeChannels: endpointCreator.bind(this, modules, removePushChannelsConfig),
                deleteDevice: endpointCreator.bind(this, modules, removeDevicePushConfig),
                listChannels: endpointCreator.bind(this, modules, listPushChannelsConfig),
            };
            /* presence */
            this.hereNow = endpointCreator.bind(this, modules, presenceHereNowConfig);
            this.whereNow = endpointCreator.bind(this, modules, presenceWhereNowEndpointConfig);
            this.getState = endpointCreator.bind(this, modules, presenceGetStateConfig);
            /* PAM */
            this.grant = endpointCreator.bind(this, modules, grantEndpointConfig);
            this.grantToken = endpointCreator.bind(this, modules, grantTokenEndpointConfig);
            this.audit = endpointCreator.bind(this, modules, auditEndpointConfig);
            this.revokeToken = endpointCreator.bind(this, modules, endpoint$2);
            this.publish = endpointCreator.bind(this, modules, publishEndpointConfig);
            this.fire = function (args, callback) {
                args.replicate = false;
                args.storeInHistory = false;
                return _this.publish(args, callback);
            };
            this.signal = endpointCreator.bind(this, modules, signalEndpointConfig);
            this.history = endpointCreator.bind(this, modules, historyEndpointConfig);
            this.deleteMessages = endpointCreator.bind(this, modules, deleteMessagesEndpointConfig);
            this.messageCounts = endpointCreator.bind(this, modules, messageCountsEndpointConfig);
            this.fetchMessages = endpointCreator.bind(this, modules, fetchMessagesEndpointConfig);
            // Actions API
            this.addMessageAction = endpointCreator.bind(this, modules, addMessageActionEndpointConfig);
            this.removeMessageAction = endpointCreator.bind(this, modules, removeMessageActionEndpointConfig);
            this.getMessageActions = endpointCreator.bind(this, modules, getMessageActionEndpointConfig);
            // File Upload API v1
            this.listFiles = endpointCreator.bind(this, modules, endpoint$j);
            var generateUploadUrl = endpointCreator.bind(this, modules, endpoint$i);
            this.publishFile = endpointCreator.bind(this, modules, endpoint$h);
            this.sendFile = sendFileFunction({
                generateUploadUrl: generateUploadUrl,
                publishFile: this.publishFile,
                modules: modules,
            });
            this.getFileUrl = function (params) { return getFileUrlFunction(modules, params); };
            this.downloadFile = endpointCreator.bind(this, modules, endpoint$g);
            this.deleteFile = endpointCreator.bind(this, modules, endpoint$f);
            // Objects API v2
            this.objects = {
                getAllUUIDMetadata: endpointCreator.bind(this, modules, endpoint$e),
                getUUIDMetadata: endpointCreator.bind(this, modules, endpoint$d),
                setUUIDMetadata: endpointCreator.bind(this, modules, endpoint$c),
                removeUUIDMetadata: endpointCreator.bind(this, modules, endpoint$b),
                getAllChannelMetadata: endpointCreator.bind(this, modules, endpoint$a),
                getChannelMetadata: endpointCreator.bind(this, modules, endpoint$9),
                setChannelMetadata: endpointCreator.bind(this, modules, endpoint$8),
                removeChannelMetadata: endpointCreator.bind(this, modules, endpoint$7),
                getChannelMembers: endpointCreator.bind(this, modules, endpoint$6),
                setChannelMembers: function (parameters) {
                    var rest = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        rest[_i - 1] = arguments[_i];
                    }
                    return endpointCreator.call.apply(endpointCreator, __spreadArray$1([_this,
                        modules,
                        endpoint$5, __assign({ type: 'set' }, parameters)], __read$1(rest), false));
                },
                removeChannelMembers: function (parameters) {
                    var rest = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        rest[_i - 1] = arguments[_i];
                    }
                    return endpointCreator.call.apply(endpointCreator, __spreadArray$1([_this,
                        modules,
                        endpoint$5, __assign({ type: 'delete' }, parameters)], __read$1(rest), false));
                },
                getMemberships: endpointCreator.bind(this, modules, endpoint$4),
                setMemberships: function (parameters) {
                    var rest = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        rest[_i - 1] = arguments[_i];
                    }
                    return endpointCreator.call.apply(endpointCreator, __spreadArray$1([_this,
                        modules,
                        endpoint$3, __assign({ type: 'set' }, parameters)], __read$1(rest), false));
                },
                removeMemberships: function (parameters) {
                    var rest = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        rest[_i - 1] = arguments[_i];
                    }
                    return endpointCreator.call.apply(endpointCreator, __spreadArray$1([_this,
                        modules,
                        endpoint$3, __assign({ type: 'delete' }, parameters)], __read$1(rest), false));
                },
            };
            // Objects API
            this.createUser = utils$5.deprecated(endpointCreator.bind(this, modules, createUserEndpointConfig));
            this.updateUser = utils$5.deprecated(endpointCreator.bind(this, modules, updateUserEndpointConfig));
            this.deleteUser = utils$5.deprecated(endpointCreator.bind(this, modules, deleteUserEndpointConfig));
            this.getUser = utils$5.deprecated(endpointCreator.bind(this, modules, getUserEndpointConfig));
            this.getUsers = utils$5.deprecated(endpointCreator.bind(this, modules, getUsersEndpointConfig));
            this.createSpace = utils$5.deprecated(endpointCreator.bind(this, modules, createSpaceEndpointConfig));
            this.updateSpace = utils$5.deprecated(endpointCreator.bind(this, modules, updateSpaceEndpointConfig));
            this.deleteSpace = utils$5.deprecated(endpointCreator.bind(this, modules, deleteSpaceEndpointConfig));
            this.getSpaces = utils$5.deprecated(endpointCreator.bind(this, modules, getSpacesEndpointConfig));
            this.getSpace = utils$5.deprecated(endpointCreator.bind(this, modules, getSpaceEndpointConfig));
            this.addMembers = utils$5.deprecated(endpointCreator.bind(this, modules, addMembersEndpointConfig));
            this.updateMembers = utils$5.deprecated(endpointCreator.bind(this, modules, updateMembersEndpointConfig));
            this.removeMembers = utils$5.deprecated(endpointCreator.bind(this, modules, removeMembersEndpointConfig));
            this.getMembers = utils$5.deprecated(endpointCreator.bind(this, modules, getMembersEndpointConfig));
            this.getMemberships = utils$5.deprecated(endpointCreator.bind(this, modules, getMembershipsEndpointConfig));
            this.joinSpaces = utils$5.deprecated(endpointCreator.bind(this, modules, joinSpacesEndpointConfig));
            this.updateMemberships = utils$5.deprecated(endpointCreator.bind(this, modules, updateMembershipsEndpointConfig));
            this.leaveSpaces = utils$5.deprecated(endpointCreator.bind(this, modules, leaveSpacesEndpointConfig));
            this.time = timeEndpoint;
            // --- deprecated  ------------------
            this.stop = this.destroy; // --------
            // --- deprecated  ------------------
            // mount crypto
            this.encrypt = crypto.encrypt.bind(crypto);
            this.decrypt = crypto.decrypt.bind(crypto);
            /* config */
            this.getAuthKey = modules.config.getAuthKey.bind(modules.config);
            this.setAuthKey = modules.config.setAuthKey.bind(modules.config);
            this.setCipherKey = modules.config.setCipherKey.bind(modules.config);
            this.getUUID = modules.config.getUUID.bind(modules.config);
            this.setUUID = modules.config.setUUID.bind(modules.config);
            this.getFilterExpression = modules.config.getFilterExpression.bind(modules.config);
            this.setFilterExpression = modules.config.setFilterExpression.bind(modules.config);
            this.setHeartbeatInterval = modules.config.setHeartbeatInterval.bind(modules.config);
            if (networking.hasModule('proxy')) {
                this.setProxy = function (proxy) {
                    modules.config.setProxy(proxy);
                    _this.reconnect();
                };
            }
        }
        default_1.prototype.getVersion = function () {
            return this._config.getVersion();
        };
        default_1.prototype._addPnsdkSuffix = function (name, suffix) {
            this._config._addPnsdkSuffix(name, suffix);
        };
        // network hooks to indicate network changes
        default_1.prototype.networkDownDetected = function () {
            this._listenerManager.announceNetworkDown();
            if (this._config.restore) {
                this.disconnect();
            }
            else {
                this.destroy(true);
            }
        };
        default_1.prototype.networkUpDetected = function () {
            this._listenerManager.announceNetworkUp();
            this.reconnect();
        };
        default_1.notificationPayload = function (title, body) {
            return new NotificationsPayload(title, body);
        };
        default_1.generateUUID = function () {
            return uuidGenerator.createUUID();
        };
        default_1.OPERATIONS = OPERATIONS;
        default_1.CATEGORIES = categories;
        return default_1;
    }());

    /*       */
    var default_1$2 = /** @class */ (function () {
        function default_1(modules) {
            var _this = this;
            this._modules = {};
            Object.keys(modules).forEach(function (key) {
                _this._modules[key] = modules[key].bind(_this);
            });
        }
        default_1.prototype.init = function (config) {
            this._config = config;
            if (Array.isArray(this._config.origin)) {
                this._currentSubDomain = Math.floor(Math.random() * this._config.origin.length);
            }
            else {
                this._currentSubDomain = 0;
            }
            this._coreParams = {};
            // create initial origins
            this.shiftStandardOrigin();
        };
        default_1.prototype.nextOrigin = function () {
            var protocol = this._config.secure ? 'https://' : 'http://';
            if (typeof this._config.origin === 'string') {
                return "".concat(protocol).concat(this._config.origin);
            }
            this._currentSubDomain += 1;
            if (this._currentSubDomain >= this._config.origin.length) {
                this._currentSubDomain = 0;
            }
            var origin = this._config.origin[this._currentSubDomain];
            return "".concat(protocol).concat(origin);
        };
        default_1.prototype.hasModule = function (name) {
            return name in this._modules;
        };
        // origin operations
        default_1.prototype.shiftStandardOrigin = function () {
            this._standardOrigin = this.nextOrigin();
            return this._standardOrigin;
        };
        default_1.prototype.getStandardOrigin = function () {
            return this._standardOrigin;
        };
        default_1.prototype.POSTFILE = function (url, fields, file) {
            return this._modules.postfile(url, fields, file);
        };
        default_1.prototype.GETFILE = function (params, endpoint, callback) {
            return this._modules.getfile(params, endpoint, callback);
        };
        default_1.prototype.POST = function (params, body, endpoint, callback) {
            return this._modules.post(params, body, endpoint, callback);
        };
        default_1.prototype.PATCH = function (params, body, endpoint, callback) {
            return this._modules.patch(params, body, endpoint, callback);
        };
        default_1.prototype.GET = function (params, endpoint, callback) {
            return this._modules.get(params, endpoint, callback);
        };
        default_1.prototype.DELETE = function (params, endpoint, callback) {
            return this._modules.del(params, endpoint, callback);
        };
        default_1.prototype._detectErrorCategory = function (err) {
            if (err.code === 'ENOTFOUND') {
                return categories.PNNetworkIssuesCategory;
            }
            if (err.code === 'ECONNREFUSED') {
                return categories.PNNetworkIssuesCategory;
            }
            if (err.code === 'ECONNRESET') {
                return categories.PNNetworkIssuesCategory;
            }
            if (err.code === 'EAI_AGAIN') {
                return categories.PNNetworkIssuesCategory;
            }
            if (err.status === 0 || (err.hasOwnProperty('status') && typeof err.status === 'undefined')) {
                return categories.PNNetworkIssuesCategory;
            }
            if (err.timeout)
                return categories.PNTimeoutCategory;
            if (err.code === 'ETIMEDOUT') {
                return categories.PNNetworkIssuesCategory;
            }
            if (err.response) {
                if (err.response.badRequest) {
                    return categories.PNBadRequestCategory;
                }
                if (err.response.forbidden) {
                    return categories.PNAccessDeniedCategory;
                }
            }
            return categories.PNUnknownCategory;
        };
        return default_1;
    }());

    /*       */
    /* global localStorage */
    var db = {
        get: function (key) {
            // try catch for operating within iframes which disable localStorage
            try {
                return localStorage.getItem(key);
            }
            catch (e) {
                return null;
            }
        },
        set: function (key, data) {
            // try catch for operating within iframes which disable localStorage
            try {
                return localStorage.setItem(key, data);
            }
            catch (e) {
                return null;
            }
        },
    };

    var default_1$1 = /** @class */ (function () {
        function default_1(decode, base64ToBinary) {
            this._base64ToBinary = base64ToBinary;
            this._decode = decode;
        }
        default_1.prototype.decodeToken = function (tokenString) {
            var padding = '';
            if (tokenString.length % 4 === 3) {
                padding = '=';
            }
            else if (tokenString.length % 4 === 2) {
                padding = '==';
            }
            var cleaned = tokenString.replace(/-/gi, '+').replace(/_/gi, '/') + padding;
            var result = this._decode(this._base64ToBinary(cleaned));
            if (typeof result === 'object') {
                return result;
            }
            return undefined;
        };
        return default_1;
    }());

    var client = {exports: {}};

    var componentEmitter = {exports: {}};

    (function (module) {
    /**
     * Expose `Emitter`.
     */

    {
      module.exports = Emitter;
    }

    /**
     * Initialize a new `Emitter`.
     *
     * @api public
     */

    function Emitter(obj) {
      if (obj) return mixin(obj);
    }
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

      // Remove event specific arrays for event types that no
      // one is subscribed for to avoid memory leak.
      if (callbacks.length === 0) {
        delete this._callbacks['$' + event];
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

      var args = new Array(arguments.length - 1)
        , callbacks = this._callbacks['$' + event];

      for (var i = 1; i < arguments.length; i++) {
        args[i - 1] = arguments[i];
      }

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
    }(componentEmitter));

    var fastSafeStringify = stringify$2;
    stringify$2.default = stringify$2;
    stringify$2.stable = deterministicStringify;
    stringify$2.stableStringify = deterministicStringify;

    var LIMIT_REPLACE_NODE = '[...]';
    var CIRCULAR_REPLACE_NODE = '[Circular]';

    var arr = [];
    var replacerStack = [];

    function defaultOptions () {
      return {
        depthLimit: Number.MAX_SAFE_INTEGER,
        edgesLimit: Number.MAX_SAFE_INTEGER
      }
    }

    // Regular stringify
    function stringify$2 (obj, replacer, spacer, options) {
      if (typeof options === 'undefined') {
        options = defaultOptions();
      }

      decirc(obj, '', 0, [], undefined, 0, options);
      var res;
      try {
        if (replacerStack.length === 0) {
          res = JSON.stringify(obj, replacer, spacer);
        } else {
          res = JSON.stringify(obj, replaceGetterValues(replacer), spacer);
        }
      } catch (_) {
        return JSON.stringify('[unable to serialize, circular reference is too complex to analyze]')
      } finally {
        while (arr.length !== 0) {
          var part = arr.pop();
          if (part.length === 4) {
            Object.defineProperty(part[0], part[1], part[3]);
          } else {
            part[0][part[1]] = part[2];
          }
        }
      }
      return res
    }

    function setReplace (replace, val, k, parent) {
      var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k);
      if (propertyDescriptor.get !== undefined) {
        if (propertyDescriptor.configurable) {
          Object.defineProperty(parent, k, { value: replace });
          arr.push([parent, k, val, propertyDescriptor]);
        } else {
          replacerStack.push([val, k, replace]);
        }
      } else {
        parent[k] = replace;
        arr.push([parent, k, val]);
      }
    }

    function decirc (val, k, edgeIndex, stack, parent, depth, options) {
      depth += 1;
      var i;
      if (typeof val === 'object' && val !== null) {
        for (i = 0; i < stack.length; i++) {
          if (stack[i] === val) {
            setReplace(CIRCULAR_REPLACE_NODE, val, k, parent);
            return
          }
        }

        if (
          typeof options.depthLimit !== 'undefined' &&
          depth > options.depthLimit
        ) {
          setReplace(LIMIT_REPLACE_NODE, val, k, parent);
          return
        }

        if (
          typeof options.edgesLimit !== 'undefined' &&
          edgeIndex + 1 > options.edgesLimit
        ) {
          setReplace(LIMIT_REPLACE_NODE, val, k, parent);
          return
        }

        stack.push(val);
        // Optimize for Arrays. Big arrays could kill the performance otherwise!
        if (Array.isArray(val)) {
          for (i = 0; i < val.length; i++) {
            decirc(val[i], i, i, stack, val, depth, options);
          }
        } else {
          var keys = Object.keys(val);
          for (i = 0; i < keys.length; i++) {
            var key = keys[i];
            decirc(val[key], key, i, stack, val, depth, options);
          }
        }
        stack.pop();
      }
    }

    // Stable-stringify
    function compareFunction (a, b) {
      if (a < b) {
        return -1
      }
      if (a > b) {
        return 1
      }
      return 0
    }

    function deterministicStringify (obj, replacer, spacer, options) {
      if (typeof options === 'undefined') {
        options = defaultOptions();
      }

      var tmp = deterministicDecirc(obj, '', 0, [], undefined, 0, options) || obj;
      var res;
      try {
        if (replacerStack.length === 0) {
          res = JSON.stringify(tmp, replacer, spacer);
        } else {
          res = JSON.stringify(tmp, replaceGetterValues(replacer), spacer);
        }
      } catch (_) {
        return JSON.stringify('[unable to serialize, circular reference is too complex to analyze]')
      } finally {
        // Ensure that we restore the object as it was.
        while (arr.length !== 0) {
          var part = arr.pop();
          if (part.length === 4) {
            Object.defineProperty(part[0], part[1], part[3]);
          } else {
            part[0][part[1]] = part[2];
          }
        }
      }
      return res
    }

    function deterministicDecirc (val, k, edgeIndex, stack, parent, depth, options) {
      depth += 1;
      var i;
      if (typeof val === 'object' && val !== null) {
        for (i = 0; i < stack.length; i++) {
          if (stack[i] === val) {
            setReplace(CIRCULAR_REPLACE_NODE, val, k, parent);
            return
          }
        }
        try {
          if (typeof val.toJSON === 'function') {
            return
          }
        } catch (_) {
          return
        }

        if (
          typeof options.depthLimit !== 'undefined' &&
          depth > options.depthLimit
        ) {
          setReplace(LIMIT_REPLACE_NODE, val, k, parent);
          return
        }

        if (
          typeof options.edgesLimit !== 'undefined' &&
          edgeIndex + 1 > options.edgesLimit
        ) {
          setReplace(LIMIT_REPLACE_NODE, val, k, parent);
          return
        }

        stack.push(val);
        // Optimize for Arrays. Big arrays could kill the performance otherwise!
        if (Array.isArray(val)) {
          for (i = 0; i < val.length; i++) {
            deterministicDecirc(val[i], i, i, stack, val, depth, options);
          }
        } else {
          // Create a temporary object in the required way
          var tmp = {};
          var keys = Object.keys(val).sort(compareFunction);
          for (i = 0; i < keys.length; i++) {
            var key = keys[i];
            deterministicDecirc(val[key], key, i, stack, val, depth, options);
            tmp[key] = val[key];
          }
          if (typeof parent !== 'undefined') {
            arr.push([parent, k, val]);
            parent[k] = tmp;
          } else {
            return tmp
          }
        }
        stack.pop();
      }
    }

    // wraps replacer function to handle values we couldn't replace
    // and mark them as replaced value
    function replaceGetterValues (replacer) {
      replacer =
        typeof replacer !== 'undefined'
          ? replacer
          : function (k, v) {
            return v
          };
      return function (key, val) {
        if (replacerStack.length > 0) {
          for (var i = 0; i < replacerStack.length; i++) {
            var part = replacerStack[i];
            if (part[1] === key && part[0] === val) {
              val = part[2];
              replacerStack.splice(i, 1);
              break
            }
          }
        }
        return replacer.call(this, key, val)
      }
    }

    var replace = String.prototype.replace;
    var percentTwenties = /%20/g;

    var Format = {
        RFC1738: 'RFC1738',
        RFC3986: 'RFC3986'
    };

    var formats$3 = {
        'default': Format.RFC3986,
        formatters: {
            RFC1738: function (value) {
                return replace.call(value, percentTwenties, '+');
            },
            RFC3986: function (value) {
                return String(value);
            }
        },
        RFC1738: Format.RFC1738,
        RFC3986: Format.RFC3986
    };

    var formats$2 = formats$3;

    var has$2 = Object.prototype.hasOwnProperty;
    var isArray$2 = Array.isArray;

    var hexTable = (function () {
        var array = [];
        for (var i = 0; i < 256; ++i) {
            array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
        }

        return array;
    }());

    var compactQueue = function compactQueue(queue) {
        while (queue.length > 1) {
            var item = queue.pop();
            var obj = item.obj[item.prop];

            if (isArray$2(obj)) {
                var compacted = [];

                for (var j = 0; j < obj.length; ++j) {
                    if (typeof obj[j] !== 'undefined') {
                        compacted.push(obj[j]);
                    }
                }

                item.obj[item.prop] = compacted;
            }
        }
    };

    var arrayToObject = function arrayToObject(source, options) {
        var obj = options && options.plainObjects ? Object.create(null) : {};
        for (var i = 0; i < source.length; ++i) {
            if (typeof source[i] !== 'undefined') {
                obj[i] = source[i];
            }
        }

        return obj;
    };

    var merge = function merge(target, source, options) {
        /* eslint no-param-reassign: 0 */
        if (!source) {
            return target;
        }

        if (typeof source !== 'object') {
            if (isArray$2(target)) {
                target.push(source);
            } else if (target && typeof target === 'object') {
                if ((options && (options.plainObjects || options.allowPrototypes)) || !has$2.call(Object.prototype, source)) {
                    target[source] = true;
                }
            } else {
                return [target, source];
            }

            return target;
        }

        if (!target || typeof target !== 'object') {
            return [target].concat(source);
        }

        var mergeTarget = target;
        if (isArray$2(target) && !isArray$2(source)) {
            mergeTarget = arrayToObject(target, options);
        }

        if (isArray$2(target) && isArray$2(source)) {
            source.forEach(function (item, i) {
                if (has$2.call(target, i)) {
                    var targetItem = target[i];
                    if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
                        target[i] = merge(targetItem, item, options);
                    } else {
                        target.push(item);
                    }
                } else {
                    target[i] = item;
                }
            });
            return target;
        }

        return Object.keys(source).reduce(function (acc, key) {
            var value = source[key];

            if (has$2.call(acc, key)) {
                acc[key] = merge(acc[key], value, options);
            } else {
                acc[key] = value;
            }
            return acc;
        }, mergeTarget);
    };

    var assign = function assignSingleSource(target, source) {
        return Object.keys(source).reduce(function (acc, key) {
            acc[key] = source[key];
            return acc;
        }, target);
    };

    var decode = function (str, decoder, charset) {
        var strWithoutPlus = str.replace(/\+/g, ' ');
        if (charset === 'iso-8859-1') {
            // unescape never throws, no try...catch needed:
            return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
        }
        // utf-8
        try {
            return decodeURIComponent(strWithoutPlus);
        } catch (e) {
            return strWithoutPlus;
        }
    };

    var encode = function encode(str, defaultEncoder, charset, kind, format) {
        // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
        // It has been adapted here for stricter adherence to RFC 3986
        if (str.length === 0) {
            return str;
        }

        var string = str;
        if (typeof str === 'symbol') {
            string = Symbol.prototype.toString.call(str);
        } else if (typeof str !== 'string') {
            string = String(str);
        }

        if (charset === 'iso-8859-1') {
            return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
                return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
            });
        }

        var out = '';
        for (var i = 0; i < string.length; ++i) {
            var c = string.charCodeAt(i);

            if (
                c === 0x2D // -
                || c === 0x2E // .
                || c === 0x5F // _
                || c === 0x7E // ~
                || (c >= 0x30 && c <= 0x39) // 0-9
                || (c >= 0x41 && c <= 0x5A) // a-z
                || (c >= 0x61 && c <= 0x7A) // A-Z
                || (format === formats$2.RFC1738 && (c === 0x28 || c === 0x29)) // ( )
            ) {
                out += string.charAt(i);
                continue;
            }

            if (c < 0x80) {
                out = out + hexTable[c];
                continue;
            }

            if (c < 0x800) {
                out = out + (hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)]);
                continue;
            }

            if (c < 0xD800 || c >= 0xE000) {
                out = out + (hexTable[0xE0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
                continue;
            }

            i += 1;
            c = 0x10000 + (((c & 0x3FF) << 10) | (string.charCodeAt(i) & 0x3FF));
            /* eslint operator-linebreak: [2, "before"] */
            out += hexTable[0xF0 | (c >> 18)]
                + hexTable[0x80 | ((c >> 12) & 0x3F)]
                + hexTable[0x80 | ((c >> 6) & 0x3F)]
                + hexTable[0x80 | (c & 0x3F)];
        }

        return out;
    };

    var compact = function compact(value) {
        var queue = [{ obj: { o: value }, prop: 'o' }];
        var refs = [];

        for (var i = 0; i < queue.length; ++i) {
            var item = queue[i];
            var obj = item.obj[item.prop];

            var keys = Object.keys(obj);
            for (var j = 0; j < keys.length; ++j) {
                var key = keys[j];
                var val = obj[key];
                if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
                    queue.push({ obj: obj, prop: key });
                    refs.push(val);
                }
            }
        }

        compactQueue(queue);

        return value;
    };

    var isRegExp = function isRegExp(obj) {
        return Object.prototype.toString.call(obj) === '[object RegExp]';
    };

    var isBuffer = function isBuffer(obj) {
        if (!obj || typeof obj !== 'object') {
            return false;
        }

        return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
    };

    var combine = function combine(a, b) {
        return [].concat(a, b);
    };

    var maybeMap = function maybeMap(val, fn) {
        if (isArray$2(val)) {
            var mapped = [];
            for (var i = 0; i < val.length; i += 1) {
                mapped.push(fn(val[i]));
            }
            return mapped;
        }
        return fn(val);
    };

    var utils$4 = {
        arrayToObject: arrayToObject,
        assign: assign,
        combine: combine,
        compact: compact,
        decode: decode,
        encode: encode,
        isBuffer: isBuffer,
        isRegExp: isRegExp,
        maybeMap: maybeMap,
        merge: merge
    };

    var utils$3 = utils$4;
    var formats$1 = formats$3;
    var has$1 = Object.prototype.hasOwnProperty;

    var arrayPrefixGenerators = {
        brackets: function brackets(prefix) {
            return prefix + '[]';
        },
        comma: 'comma',
        indices: function indices(prefix, key) {
            return prefix + '[' + key + ']';
        },
        repeat: function repeat(prefix) {
            return prefix;
        }
    };

    var isArray$1 = Array.isArray;
    var split = String.prototype.split;
    var push = Array.prototype.push;
    var pushToArray = function (arr, valueOrArray) {
        push.apply(arr, isArray$1(valueOrArray) ? valueOrArray : [valueOrArray]);
    };

    var toISO = Date.prototype.toISOString;

    var defaultFormat = formats$1['default'];
    var defaults$1 = {
        addQueryPrefix: false,
        allowDots: false,
        charset: 'utf-8',
        charsetSentinel: false,
        delimiter: '&',
        encode: true,
        encoder: utils$3.encode,
        encodeValuesOnly: false,
        format: defaultFormat,
        formatter: formats$1.formatters[defaultFormat],
        // deprecated
        indices: false,
        serializeDate: function serializeDate(date) {
            return toISO.call(date);
        },
        skipNulls: false,
        strictNullHandling: false
    };

    var isNonNullishPrimitive = function isNonNullishPrimitive(v) {
        return typeof v === 'string'
            || typeof v === 'number'
            || typeof v === 'boolean'
            || typeof v === 'symbol'
            || typeof v === 'bigint';
    };

    var stringify$1 = function stringify(
        object,
        prefix,
        generateArrayPrefix,
        strictNullHandling,
        skipNulls,
        encoder,
        filter,
        sort,
        allowDots,
        serializeDate,
        format,
        formatter,
        encodeValuesOnly,
        charset
    ) {
        var obj = object;
        if (typeof filter === 'function') {
            obj = filter(prefix, obj);
        } else if (obj instanceof Date) {
            obj = serializeDate(obj);
        } else if (generateArrayPrefix === 'comma' && isArray$1(obj)) {
            obj = utils$3.maybeMap(obj, function (value) {
                if (value instanceof Date) {
                    return serializeDate(value);
                }
                return value;
            });
        }

        if (obj === null) {
            if (strictNullHandling) {
                return encoder && !encodeValuesOnly ? encoder(prefix, defaults$1.encoder, charset, 'key', format) : prefix;
            }

            obj = '';
        }

        if (isNonNullishPrimitive(obj) || utils$3.isBuffer(obj)) {
            if (encoder) {
                var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults$1.encoder, charset, 'key', format);
                if (generateArrayPrefix === 'comma' && encodeValuesOnly) {
                    var valuesArray = split.call(String(obj), ',');
                    var valuesJoined = '';
                    for (var i = 0; i < valuesArray.length; ++i) {
                        valuesJoined += (i === 0 ? '' : ',') + formatter(encoder(valuesArray[i], defaults$1.encoder, charset, 'value', format));
                    }
                    return [formatter(keyValue) + '=' + valuesJoined];
                }
                return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults$1.encoder, charset, 'value', format))];
            }
            return [formatter(prefix) + '=' + formatter(String(obj))];
        }

        var values = [];

        if (typeof obj === 'undefined') {
            return values;
        }

        var objKeys;
        if (generateArrayPrefix === 'comma' && isArray$1(obj)) {
            // we need to join elements in
            objKeys = [{ value: obj.length > 0 ? obj.join(',') || null : void undefined }];
        } else if (isArray$1(filter)) {
            objKeys = filter;
        } else {
            var keys = Object.keys(obj);
            objKeys = sort ? keys.sort(sort) : keys;
        }

        for (var j = 0; j < objKeys.length; ++j) {
            var key = objKeys[j];
            var value = typeof key === 'object' && typeof key.value !== 'undefined' ? key.value : obj[key];

            if (skipNulls && value === null) {
                continue;
            }

            var keyPrefix = isArray$1(obj)
                ? typeof generateArrayPrefix === 'function' ? generateArrayPrefix(prefix, key) : prefix
                : prefix + (allowDots ? '.' + key : '[' + key + ']');

            pushToArray(values, stringify(
                value,
                keyPrefix,
                generateArrayPrefix,
                strictNullHandling,
                skipNulls,
                encoder,
                filter,
                sort,
                allowDots,
                serializeDate,
                format,
                formatter,
                encodeValuesOnly,
                charset
            ));
        }

        return values;
    };

    var normalizeStringifyOptions = function normalizeStringifyOptions(opts) {
        if (!opts) {
            return defaults$1;
        }

        if (opts.encoder !== null && typeof opts.encoder !== 'undefined' && typeof opts.encoder !== 'function') {
            throw new TypeError('Encoder has to be a function.');
        }

        var charset = opts.charset || defaults$1.charset;
        if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
            throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
        }

        var format = formats$1['default'];
        if (typeof opts.format !== 'undefined') {
            if (!has$1.call(formats$1.formatters, opts.format)) {
                throw new TypeError('Unknown format option provided.');
            }
            format = opts.format;
        }
        var formatter = formats$1.formatters[format];

        var filter = defaults$1.filter;
        if (typeof opts.filter === 'function' || isArray$1(opts.filter)) {
            filter = opts.filter;
        }

        return {
            addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults$1.addQueryPrefix,
            allowDots: typeof opts.allowDots === 'undefined' ? defaults$1.allowDots : !!opts.allowDots,
            charset: charset,
            charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults$1.charsetSentinel,
            delimiter: typeof opts.delimiter === 'undefined' ? defaults$1.delimiter : opts.delimiter,
            encode: typeof opts.encode === 'boolean' ? opts.encode : defaults$1.encode,
            encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults$1.encoder,
            encodeValuesOnly: typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults$1.encodeValuesOnly,
            filter: filter,
            format: format,
            formatter: formatter,
            serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults$1.serializeDate,
            skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults$1.skipNulls,
            sort: typeof opts.sort === 'function' ? opts.sort : null,
            strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults$1.strictNullHandling
        };
    };

    var stringify_1 = function (object, opts) {
        var obj = object;
        var options = normalizeStringifyOptions(opts);

        var objKeys;
        var filter;

        if (typeof options.filter === 'function') {
            filter = options.filter;
            obj = filter('', obj);
        } else if (isArray$1(options.filter)) {
            filter = options.filter;
            objKeys = filter;
        }

        var keys = [];

        if (typeof obj !== 'object' || obj === null) {
            return '';
        }

        var arrayFormat;
        if (opts && opts.arrayFormat in arrayPrefixGenerators) {
            arrayFormat = opts.arrayFormat;
        } else if (opts && 'indices' in opts) {
            arrayFormat = opts.indices ? 'indices' : 'repeat';
        } else {
            arrayFormat = 'indices';
        }

        var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

        if (!objKeys) {
            objKeys = Object.keys(obj);
        }

        if (options.sort) {
            objKeys.sort(options.sort);
        }

        for (var i = 0; i < objKeys.length; ++i) {
            var key = objKeys[i];

            if (options.skipNulls && obj[key] === null) {
                continue;
            }
            pushToArray(keys, stringify$1(
                obj[key],
                key,
                generateArrayPrefix,
                options.strictNullHandling,
                options.skipNulls,
                options.encode ? options.encoder : null,
                options.filter,
                options.sort,
                options.allowDots,
                options.serializeDate,
                options.format,
                options.formatter,
                options.encodeValuesOnly,
                options.charset
            ));
        }

        var joined = keys.join(options.delimiter);
        var prefix = options.addQueryPrefix === true ? '?' : '';

        if (options.charsetSentinel) {
            if (options.charset === 'iso-8859-1') {
                // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
                prefix += 'utf8=%26%2310003%3B&';
            } else {
                // encodeURIComponent('✓')
                prefix += 'utf8=%E2%9C%93&';
            }
        }

        return joined.length > 0 ? prefix + joined : '';
    };

    var utils$2 = utils$4;

    var has = Object.prototype.hasOwnProperty;
    var isArray = Array.isArray;

    var defaults = {
        allowDots: false,
        allowPrototypes: false,
        arrayLimit: 20,
        charset: 'utf-8',
        charsetSentinel: false,
        comma: false,
        decoder: utils$2.decode,
        delimiter: '&',
        depth: 5,
        ignoreQueryPrefix: false,
        interpretNumericEntities: false,
        parameterLimit: 1000,
        parseArrays: true,
        plainObjects: false,
        strictNullHandling: false
    };

    var interpretNumericEntities = function (str) {
        return str.replace(/&#(\d+);/g, function ($0, numberStr) {
            return String.fromCharCode(parseInt(numberStr, 10));
        });
    };

    var parseArrayValue = function (val, options) {
        if (val && typeof val === 'string' && options.comma && val.indexOf(',') > -1) {
            return val.split(',');
        }

        return val;
    };

    // This is what browsers will submit when the ✓ character occurs in an
    // application/x-www-form-urlencoded body and the encoding of the page containing
    // the form is iso-8859-1, or when the submitted form has an accept-charset
    // attribute of iso-8859-1. Presumably also with other charsets that do not contain
    // the ✓ character, such as us-ascii.
    var isoSentinel = 'utf8=%26%2310003%3B'; // encodeURIComponent('&#10003;')

    // These are the percent-encoded utf-8 octets representing a checkmark, indicating that the request actually is utf-8 encoded.
    var charsetSentinel = 'utf8=%E2%9C%93'; // encodeURIComponent('✓')

    var parseValues = function parseQueryStringValues(str, options) {
        var obj = {};
        var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
        var limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
        var parts = cleanStr.split(options.delimiter, limit);
        var skipIndex = -1; // Keep track of where the utf8 sentinel was found
        var i;

        var charset = options.charset;
        if (options.charsetSentinel) {
            for (i = 0; i < parts.length; ++i) {
                if (parts[i].indexOf('utf8=') === 0) {
                    if (parts[i] === charsetSentinel) {
                        charset = 'utf-8';
                    } else if (parts[i] === isoSentinel) {
                        charset = 'iso-8859-1';
                    }
                    skipIndex = i;
                    i = parts.length; // The eslint settings do not allow break;
                }
            }
        }

        for (i = 0; i < parts.length; ++i) {
            if (i === skipIndex) {
                continue;
            }
            var part = parts[i];

            var bracketEqualsPos = part.indexOf(']=');
            var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;

            var key, val;
            if (pos === -1) {
                key = options.decoder(part, defaults.decoder, charset, 'key');
                val = options.strictNullHandling ? null : '';
            } else {
                key = options.decoder(part.slice(0, pos), defaults.decoder, charset, 'key');
                val = utils$2.maybeMap(
                    parseArrayValue(part.slice(pos + 1), options),
                    function (encodedVal) {
                        return options.decoder(encodedVal, defaults.decoder, charset, 'value');
                    }
                );
            }

            if (val && options.interpretNumericEntities && charset === 'iso-8859-1') {
                val = interpretNumericEntities(val);
            }

            if (part.indexOf('[]=') > -1) {
                val = isArray(val) ? [val] : val;
            }

            if (has.call(obj, key)) {
                obj[key] = utils$2.combine(obj[key], val);
            } else {
                obj[key] = val;
            }
        }

        return obj;
    };

    var parseObject = function (chain, val, options, valuesParsed) {
        var leaf = valuesParsed ? val : parseArrayValue(val, options);

        for (var i = chain.length - 1; i >= 0; --i) {
            var obj;
            var root = chain[i];

            if (root === '[]' && options.parseArrays) {
                obj = [].concat(leaf);
            } else {
                obj = options.plainObjects ? Object.create(null) : {};
                var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
                var index = parseInt(cleanRoot, 10);
                if (!options.parseArrays && cleanRoot === '') {
                    obj = { 0: leaf };
                } else if (
                    !isNaN(index)
                    && root !== cleanRoot
                    && String(index) === cleanRoot
                    && index >= 0
                    && (options.parseArrays && index <= options.arrayLimit)
                ) {
                    obj = [];
                    obj[index] = leaf;
                } else if (cleanRoot !== '__proto__') {
                    obj[cleanRoot] = leaf;
                }
            }

            leaf = obj;
        }

        return leaf;
    };

    var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
        if (!givenKey) {
            return;
        }

        // Transform dot notation to bracket notation
        var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

        // The regex chunks

        var brackets = /(\[[^[\]]*])/;
        var child = /(\[[^[\]]*])/g;

        // Get the parent

        var segment = options.depth > 0 && brackets.exec(key);
        var parent = segment ? key.slice(0, segment.index) : key;

        // Stash the parent if it exists

        var keys = [];
        if (parent) {
            // If we aren't using plain objects, optionally prefix keys that would overwrite object prototype properties
            if (!options.plainObjects && has.call(Object.prototype, parent)) {
                if (!options.allowPrototypes) {
                    return;
                }
            }

            keys.push(parent);
        }

        // Loop through children appending to the array until we hit depth

        var i = 0;
        while (options.depth > 0 && (segment = child.exec(key)) !== null && i < options.depth) {
            i += 1;
            if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
                if (!options.allowPrototypes) {
                    return;
                }
            }
            keys.push(segment[1]);
        }

        // If there's a remainder, just add whatever is left

        if (segment) {
            keys.push('[' + key.slice(segment.index) + ']');
        }

        return parseObject(keys, val, options, valuesParsed);
    };

    var normalizeParseOptions = function normalizeParseOptions(opts) {
        if (!opts) {
            return defaults;
        }

        if (opts.decoder !== null && opts.decoder !== undefined && typeof opts.decoder !== 'function') {
            throw new TypeError('Decoder has to be a function.');
        }

        if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
            throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
        }
        var charset = typeof opts.charset === 'undefined' ? defaults.charset : opts.charset;

        return {
            allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
            allowPrototypes: typeof opts.allowPrototypes === 'boolean' ? opts.allowPrototypes : defaults.allowPrototypes,
            arrayLimit: typeof opts.arrayLimit === 'number' ? opts.arrayLimit : defaults.arrayLimit,
            charset: charset,
            charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
            comma: typeof opts.comma === 'boolean' ? opts.comma : defaults.comma,
            decoder: typeof opts.decoder === 'function' ? opts.decoder : defaults.decoder,
            delimiter: typeof opts.delimiter === 'string' || utils$2.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
            // eslint-disable-next-line no-implicit-coercion, no-extra-parens
            depth: (typeof opts.depth === 'number' || opts.depth === false) ? +opts.depth : defaults.depth,
            ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
            interpretNumericEntities: typeof opts.interpretNumericEntities === 'boolean' ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
            parameterLimit: typeof opts.parameterLimit === 'number' ? opts.parameterLimit : defaults.parameterLimit,
            parseArrays: opts.parseArrays !== false,
            plainObjects: typeof opts.plainObjects === 'boolean' ? opts.plainObjects : defaults.plainObjects,
            strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
        };
    };

    var parse$1 = function (str, opts) {
        var options = normalizeParseOptions(opts);

        if (str === '' || str === null || typeof str === 'undefined') {
            return options.plainObjects ? Object.create(null) : {};
        }

        var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
        var obj = options.plainObjects ? Object.create(null) : {};

        // Iterate over the keys and setup the new object

        var keys = Object.keys(tempObj);
        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            var newObj = parseKeys(key, tempObj[key], options, typeof str === 'string');
            obj = utils$2.merge(obj, newObj, options);
        }

        return utils$2.compact(obj);
    };

    var stringify = stringify_1;
    var parse = parse$1;
    var formats = formats$3;

    var lib = {
        formats: formats,
        parse: parse,
        stringify: stringify
    };

    function _typeof$1(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$1 = function _typeof(obj) { return typeof obj; }; } else { _typeof$1 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$1(obj); }

    /**
     * Check if `obj` is an object.
     *
     * @param {Object} obj
     * @return {Boolean}
     * @api private
     */
    function isObject$1(obj) {
      return obj !== null && _typeof$1(obj) === 'object';
    }

    var isObject_1 = isObject$1;

    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    /**
     * Module of mixed-in functions shared between node and client code
     */
    var isObject = isObject_1;
    /**
     * Expose `RequestBase`.
     */


    var requestBase = RequestBase;
    /**
     * Initialize a new `RequestBase`.
     *
     * @api public
     */

    function RequestBase(object) {
      if (object) return mixin$1(object);
    }
    /**
     * Mixin the prototype properties.
     *
     * @param {Object} obj
     * @return {Object}
     * @api private
     */


    function mixin$1(object) {
      for (var key in RequestBase.prototype) {
        if (Object.prototype.hasOwnProperty.call(RequestBase.prototype, key)) object[key] = RequestBase.prototype[key];
      }

      return object;
    }
    /**
     * Clear previous timeout.
     *
     * @return {Request} for chaining
     * @api public
     */


    RequestBase.prototype.clearTimeout = function () {
      clearTimeout(this._timer);
      clearTimeout(this._responseTimeoutTimer);
      clearTimeout(this._uploadTimeoutTimer);
      delete this._timer;
      delete this._responseTimeoutTimer;
      delete this._uploadTimeoutTimer;
      return this;
    };
    /**
     * Override default response body parser
     *
     * This function will be called to convert incoming data into request.body
     *
     * @param {Function}
     * @api public
     */


    RequestBase.prototype.parse = function (fn) {
      this._parser = fn;
      return this;
    };
    /**
     * Set format of binary response body.
     * In browser valid formats are 'blob' and 'arraybuffer',
     * which return Blob and ArrayBuffer, respectively.
     *
     * In Node all values result in Buffer.
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


    RequestBase.prototype.responseType = function (value) {
      this._responseType = value;
      return this;
    };
    /**
     * Override default request body serializer
     *
     * This function will be called to convert data set via .send or .attach into payload to send
     *
     * @param {Function}
     * @api public
     */


    RequestBase.prototype.serialize = function (fn) {
      this._serializer = fn;
      return this;
    };
    /**
     * Set timeouts.
     *
     * - response timeout is time between sending request and receiving the first byte of the response. Includes DNS and connection time.
     * - deadline is the time from start of the request to receiving response body in full. If the deadline is too short large files may not load at all on slow connections.
     * - upload is the time  since last bit of data was sent or received. This timeout works only if deadline timeout is off
     *
     * Value of 0 or false means no timeout.
     *
     * @param {Number|Object} ms or {response, deadline}
     * @return {Request} for chaining
     * @api public
     */


    RequestBase.prototype.timeout = function (options) {
      if (!options || _typeof(options) !== 'object') {
        this._timeout = options;
        this._responseTimeout = 0;
        this._uploadTimeout = 0;
        return this;
      }

      for (var option in options) {
        if (Object.prototype.hasOwnProperty.call(options, option)) {
          switch (option) {
            case 'deadline':
              this._timeout = options.deadline;
              break;

            case 'response':
              this._responseTimeout = options.response;
              break;

            case 'upload':
              this._uploadTimeout = options.upload;
              break;

            default:
              console.warn('Unknown timeout option', option);
          }
        }
      }

      return this;
    };
    /**
     * Set number of retry attempts on error.
     *
     * Failed requests will be retried 'count' times if timeout or err.code >= 500.
     *
     * @param {Number} count
     * @param {Function} [fn]
     * @return {Request} for chaining
     * @api public
     */


    RequestBase.prototype.retry = function (count, fn) {
      // Default to 1 if no count passed or true
      if (arguments.length === 0 || count === true) count = 1;
      if (count <= 0) count = 0;
      this._maxRetries = count;
      this._retries = 0;
      this._retryCallback = fn;
      return this;
    }; //
    // NOTE: we do not include ESOCKETTIMEDOUT because that is from `request` package
    //       <https://github.com/sindresorhus/got/pull/537>
    //
    // NOTE: we do not include EADDRINFO because it was removed from libuv in 2014
    //       <https://github.com/libuv/libuv/commit/02e1ebd40b807be5af46343ea873331b2ee4e9c1>
    //       <https://github.com/request/request/search?q=ESOCKETTIMEDOUT&unscoped_q=ESOCKETTIMEDOUT>
    //
    //
    // TODO: expose these as configurable defaults
    //


    var ERROR_CODES = new Set(['ETIMEDOUT', 'ECONNRESET', 'EADDRINUSE', 'ECONNREFUSED', 'EPIPE', 'ENOTFOUND', 'ENETUNREACH', 'EAI_AGAIN']);
    var STATUS_CODES = new Set([408, 413, 429, 500, 502, 503, 504, 521, 522, 524]); // TODO: we would need to make this easily configurable before adding it in (e.g. some might want to add POST)
    // const METHODS = new Set(['GET', 'PUT', 'HEAD', 'DELETE', 'OPTIONS', 'TRACE']);

    /**
     * Determine if a request should be retried.
     * (Inspired by https://github.com/sindresorhus/got#retry)
     *
     * @param {Error} err an error
     * @param {Response} [res] response
     * @returns {Boolean} if segment should be retried
     */

    RequestBase.prototype._shouldRetry = function (err, res) {
      if (!this._maxRetries || this._retries++ >= this._maxRetries) {
        return false;
      }

      if (this._retryCallback) {
        try {
          var override = this._retryCallback(err, res);

          if (override === true) return true;
          if (override === false) return false; // undefined falls back to defaults
        } catch (err_) {
          console.error(err_);
        }
      } // TODO: we would need to make this easily configurable before adding it in (e.g. some might want to add POST)

      /*
      if (
        this.req &&
        this.req.method &&
        !METHODS.has(this.req.method.toUpperCase())
      )
        return false;
      */


      if (res && res.status && STATUS_CODES.has(res.status)) return true;

      if (err) {
        if (err.code && ERROR_CODES.has(err.code)) return true; // Superagent timeout

        if (err.timeout && err.code === 'ECONNABORTED') return true;
        if (err.crossDomain) return true;
      }

      return false;
    };
    /**
     * Retry request
     *
     * @return {Request} for chaining
     * @api private
     */


    RequestBase.prototype._retry = function () {
      this.clearTimeout(); // node

      if (this.req) {
        this.req = null;
        this.req = this.request();
      }

      this._aborted = false;
      this.timedout = false;
      this.timedoutError = null;
      return this._end();
    };
    /**
     * Promise support
     *
     * @param {Function} resolve
     * @param {Function} [reject]
     * @return {Request}
     */


    RequestBase.prototype.then = function (resolve, reject) {
      var _this = this;

      if (!this._fullfilledPromise) {
        var self = this;

        if (this._endCalled) {
          console.warn('Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises');
        }

        this._fullfilledPromise = new Promise(function (resolve, reject) {
          self.on('abort', function () {
            if (_this._maxRetries && _this._maxRetries > _this._retries) {
              return;
            }

            if (_this.timedout && _this.timedoutError) {
              reject(_this.timedoutError);
              return;
            }

            var err = new Error('Aborted');
            err.code = 'ABORTED';
            err.status = _this.status;
            err.method = _this.method;
            err.url = _this.url;
            reject(err);
          });
          self.end(function (err, res) {
            if (err) reject(err);else resolve(res);
          });
        });
      }

      return this._fullfilledPromise.then(resolve, reject);
    };

    RequestBase.prototype.catch = function (cb) {
      return this.then(undefined, cb);
    };
    /**
     * Allow for extension
     */


    RequestBase.prototype.use = function (fn) {
      fn(this);
      return this;
    };

    RequestBase.prototype.ok = function (cb) {
      if (typeof cb !== 'function') throw new Error('Callback required');
      this._okCallback = cb;
      return this;
    };

    RequestBase.prototype._isResponseOK = function (res) {
      if (!res) {
        return false;
      }

      if (this._okCallback) {
        return this._okCallback(res);
      }

      return res.status >= 200 && res.status < 300;
    };
    /**
     * Get request header `field`.
     * Case-insensitive.
     *
     * @param {String} field
     * @return {String}
     * @api public
     */


    RequestBase.prototype.get = function (field) {
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


    RequestBase.prototype.getHeader = RequestBase.prototype.get;
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

    RequestBase.prototype.set = function (field, value) {
      if (isObject(field)) {
        for (var key in field) {
          if (Object.prototype.hasOwnProperty.call(field, key)) this.set(key, field[key]);
        }

        return this;
      }

      this._header[field.toLowerCase()] = value;
      this.header[field] = value;
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
     * @param {String} field field name
     */


    RequestBase.prototype.unset = function (field) {
      delete this._header[field.toLowerCase()];
      delete this.header[field];
      return this;
    };
    /**
     * Write the field `name` and `val`, or multiple fields with one object
     * for "multipart/form-data" request bodies.
     *
     * ``` js
     * request.post('/upload')
     *   .field('foo', 'bar')
     *   .end(callback);
     *
     * request.post('/upload')
     *   .field({ foo: 'bar', baz: 'qux' })
     *   .end(callback);
     * ```
     *
     * @param {String|Object} name name of field
     * @param {String|Blob|File|Buffer|fs.ReadStream} val value of field
     * @return {Request} for chaining
     * @api public
     */


    RequestBase.prototype.field = function (name, value) {
      // name should be either a string or an object.
      if (name === null || undefined === name) {
        throw new Error('.field(name, val) name can not be empty');
      }

      if (this._data) {
        throw new Error(".field() can't be used if .send() is used. Please use only .send() or only .field() & .attach()");
      }

      if (isObject(name)) {
        for (var key in name) {
          if (Object.prototype.hasOwnProperty.call(name, key)) this.field(key, name[key]);
        }

        return this;
      }

      if (Array.isArray(value)) {
        for (var i in value) {
          if (Object.prototype.hasOwnProperty.call(value, i)) this.field(name, value[i]);
        }

        return this;
      } // val should be defined now


      if (value === null || undefined === value) {
        throw new Error('.field(name, val) val can not be empty');
      }

      if (typeof value === 'boolean') {
        value = String(value);
      }

      this._getFormData().append(name, value);

      return this;
    };
    /**
     * Abort the request, and clear potential timeout.
     *
     * @return {Request} request
     * @api public
     */


    RequestBase.prototype.abort = function () {
      if (this._aborted) {
        return this;
      }

      this._aborted = true;
      if (this.xhr) this.xhr.abort(); // browser

      if (this.req) this.req.abort(); // node

      this.clearTimeout();
      this.emit('abort');
      return this;
    };

    RequestBase.prototype._auth = function (user, pass, options, base64Encoder) {
      switch (options.type) {
        case 'basic':
          this.set('Authorization', "Basic ".concat(base64Encoder("".concat(user, ":").concat(pass))));
          break;

        case 'auto':
          this.username = user;
          this.password = pass;
          break;

        case 'bearer':
          // usage would be .auth(accessToken, { type: 'bearer' })
          this.set('Authorization', "Bearer ".concat(user));
          break;
      }

      return this;
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


    RequestBase.prototype.withCredentials = function (on) {
      // This is browser-only functionality. Node side is no-op.
      if (on === undefined) on = true;
      this._withCredentials = on;
      return this;
    };
    /**
     * Set the max redirects to `n`. Does nothing in browser XHR implementation.
     *
     * @param {Number} n
     * @return {Request} for chaining
     * @api public
     */


    RequestBase.prototype.redirects = function (n) {
      this._maxRedirects = n;
      return this;
    };
    /**
     * Maximum size of buffered response body, in bytes. Counts uncompressed size.
     * Default 200MB.
     *
     * @param {Number} n number of bytes
     * @return {Request} for chaining
     */


    RequestBase.prototype.maxResponseSize = function (n) {
      if (typeof n !== 'number') {
        throw new TypeError('Invalid argument');
      }

      this._maxResponseSize = n;
      return this;
    };
    /**
     * Convert to a plain javascript object (not JSON string) of scalar properties.
     * Note as this method is designed to return a useful non-this value,
     * it cannot be chained.
     *
     * @return {Object} describing method, url, and data of this request
     * @api public
     */


    RequestBase.prototype.toJSON = function () {
      return {
        method: this.method,
        url: this.url,
        data: this._data,
        headers: this._header
      };
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
    // eslint-disable-next-line complexity


    RequestBase.prototype.send = function (data) {
      var isObject_ = isObject(data);
      var type = this._header['content-type'];

      if (this._formData) {
        throw new Error(".send() can't be used if .attach() or .field() is used. Please use only .send() or only .field() & .attach()");
      }

      if (isObject_ && !this._data) {
        if (Array.isArray(data)) {
          this._data = [];
        } else if (!this._isHost(data)) {
          this._data = {};
        }
      } else if (data && this._data && this._isHost(this._data)) {
        throw new Error("Can't merge these send calls");
      } // merge


      if (isObject_ && isObject(this._data)) {
        for (var key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) this._data[key] = data[key];
        }
      } else if (typeof data === 'string') {
        // default to x-www-form-urlencoded
        if (!type) this.type('form');
        type = this._header['content-type'];
        if (type) type = type.toLowerCase().trim();

        if (type === 'application/x-www-form-urlencoded') {
          this._data = this._data ? "".concat(this._data, "&").concat(data) : data;
        } else {
          this._data = (this._data || '') + data;
        }
      } else {
        this._data = data;
      }

      if (!isObject_ || this._isHost(data)) {
        return this;
      } // default to json


      if (!type) this.type('json');
      return this;
    };
    /**
     * Sort `querystring` by the sort function
     *
     *
     * Examples:
     *
     *       // default order
     *       request.get('/user')
     *         .query('name=Nick')
     *         .query('search=Manny')
     *         .sortQuery()
     *         .end(callback)
     *
     *       // customized sort function
     *       request.get('/user')
     *         .query('name=Nick')
     *         .query('search=Manny')
     *         .sortQuery(function(a, b){
     *           return a.length - b.length;
     *         })
     *         .end(callback)
     *
     *
     * @param {Function} sort
     * @return {Request} for chaining
     * @api public
     */


    RequestBase.prototype.sortQuery = function (sort) {
      // _sort default to true but otherwise can be a function or boolean
      this._sort = typeof sort === 'undefined' ? true : sort;
      return this;
    };
    /**
     * Compose querystring to append to req.url
     *
     * @api private
     */


    RequestBase.prototype._finalizeQueryString = function () {
      var query = this._query.join('&');

      if (query) {
        this.url += (this.url.includes('?') ? '&' : '?') + query;
      }

      this._query.length = 0; // Makes the call idempotent

      if (this._sort) {
        var index = this.url.indexOf('?');

        if (index >= 0) {
          var queryArray = this.url.slice(index + 1).split('&');

          if (typeof this._sort === 'function') {
            queryArray.sort(this._sort);
          } else {
            queryArray.sort();
          }

          this.url = this.url.slice(0, index) + '?' + queryArray.join('&');
        }
      }
    }; // For backwards compat only


    RequestBase.prototype._appendQueryString = function () {
      console.warn('Unsupported');
    };
    /**
     * Invoke callback with timeout error.
     *
     * @api private
     */


    RequestBase.prototype._timeoutError = function (reason, timeout, errno) {
      if (this._aborted) {
        return;
      }

      var err = new Error("".concat(reason + timeout, "ms exceeded"));
      err.timeout = timeout;
      err.code = 'ECONNABORTED';
      err.errno = errno;
      this.timedout = true;
      this.timedoutError = err;
      this.abort();
      this.callback(err);
    };

    RequestBase.prototype._setTimeouts = function () {
      var self = this; // deadline

      if (this._timeout && !this._timer) {
        this._timer = setTimeout(function () {
          self._timeoutError('Timeout of ', self._timeout, 'ETIME');
        }, this._timeout);
      } // response timeout


      if (this._responseTimeout && !this._responseTimeoutTimer) {
        this._responseTimeoutTimer = setTimeout(function () {
          self._timeoutError('Response timeout of ', self._responseTimeout, 'ETIMEDOUT');
        }, this._responseTimeout);
      }
    };

    var utils$1 = {};

    function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$1(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

    function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }

    function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

    /**
     * Return the mime type for the given `str`.
     *
     * @param {String} str
     * @return {String}
     * @api private
     */
    utils$1.type = function (str) {
      return str.split(/ *; */).shift();
    };
    /**
     * Return header field parameters.
     *
     * @param {String} str
     * @return {Object}
     * @api private
     */


    utils$1.params = function (val) {
      var obj = {};

      var _iterator = _createForOfIteratorHelper(val.split(/ *; */)),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var str = _step.value;
          var parts = str.split(/ *= */);
          var key = parts.shift();

          var _val = parts.shift();

          if (key && _val) obj[key] = _val;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return obj;
    };
    /**
     * Parse Link header fields.
     *
     * @param {String} str
     * @return {Object}
     * @api private
     */


    utils$1.parseLinks = function (val) {
      var obj = {};

      var _iterator2 = _createForOfIteratorHelper(val.split(/ *, */)),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var str = _step2.value;
          var parts = str.split(/ *; */);
          var url = parts[0].slice(1, -1);
          var rel = parts[1].split(/ *= */)[1].slice(1, -1);
          obj[rel] = url;
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      return obj;
    };
    /**
     * Strip content related fields from `header`.
     *
     * @param {Object} header
     * @return {Object} header
     * @api private
     */


    utils$1.cleanHeader = function (header, changesOrigin) {
      delete header['content-type'];
      delete header['content-length'];
      delete header['transfer-encoding'];
      delete header.host; // secuirty

      if (changesOrigin) {
        delete header.authorization;
        delete header.cookie;
      }

      return header;
    };

    /**
     * Module dependencies.
     */
    var utils = utils$1;
    /**
     * Expose `ResponseBase`.
     */


    var responseBase = ResponseBase;
    /**
     * Initialize a new `ResponseBase`.
     *
     * @api public
     */

    function ResponseBase(obj) {
      if (obj) return mixin(obj);
    }
    /**
     * Mixin the prototype properties.
     *
     * @param {Object} obj
     * @return {Object}
     * @api private
     */


    function mixin(obj) {
      for (var key in ResponseBase.prototype) {
        if (Object.prototype.hasOwnProperty.call(ResponseBase.prototype, key)) obj[key] = ResponseBase.prototype[key];
      }

      return obj;
    }
    /**
     * Get case-insensitive `field` value.
     *
     * @param {String} field
     * @return {String}
     * @api public
     */


    ResponseBase.prototype.get = function (field) {
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


    ResponseBase.prototype._setHeaderProperties = function (header) {
      // TODO: moar!
      // TODO: make this a util
      // content-type
      var ct = header['content-type'] || '';
      this.type = utils.type(ct); // params

      var params = utils.params(ct);

      for (var key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) this[key] = params[key];
      }

      this.links = {}; // links

      try {
        if (header.link) {
          this.links = utils.parseLinks(header.link);
        }
      } catch (_unused) {// ignore
      }
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


    ResponseBase.prototype._setStatusProperties = function (status) {
      var type = status / 100 | 0; // status / class

      this.statusCode = status;
      this.status = this.statusCode;
      this.statusType = type; // basics

      this.info = type === 1;
      this.ok = type === 2;
      this.redirect = type === 3;
      this.clientError = type === 4;
      this.serverError = type === 5;
      this.error = type === 4 || type === 5 ? this.toError() : false; // sugar

      this.created = status === 201;
      this.accepted = status === 202;
      this.noContent = status === 204;
      this.badRequest = status === 400;
      this.unauthorized = status === 401;
      this.notAcceptable = status === 406;
      this.forbidden = status === 403;
      this.notFound = status === 404;
      this.unprocessableEntity = status === 422;
    };

    function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

    function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

    function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

    function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

    function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

    function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

    function Agent() {
      this._defaults = [];
    }

    ['use', 'on', 'once', 'set', 'query', 'type', 'accept', 'auth', 'withCredentials', 'sortQuery', 'retry', 'ok', 'redirects', 'timeout', 'buffer', 'serialize', 'parse', 'ca', 'key', 'pfx', 'cert', 'disableTLSCerts'].forEach(function (fn) {
      // Default setting for all requests from this agent
      Agent.prototype[fn] = function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        this._defaults.push({
          fn: fn,
          args: args
        });

        return this;
      };
    });

    Agent.prototype._setDefaults = function (req) {
      this._defaults.forEach(function (def) {
        req[def.fn].apply(req, _toConsumableArray(def.args));
      });
    };

    var agentBase = Agent;

    (function (module, exports) {

    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    /**
     * Root reference for iframes.
     */
    var root;

    if (typeof window !== 'undefined') {
      // Browser window
      root = window;
    } else if (typeof self === 'undefined') {
      // Other environments
      console.warn('Using browser-only version of superagent in non-browser environment');
      root = void 0;
    } else {
      // Web Worker
      root = self;
    }

    var Emitter = componentEmitter.exports;

    var safeStringify = fastSafeStringify;

    var qs = lib;

    var RequestBase = requestBase;

    var isObject = isObject_1;

    var ResponseBase = responseBase;

    var Agent = agentBase;
    /**
     * Noop.
     */


    function noop() {}
    /**
     * Expose `request`.
     */


    module.exports = function (method, url) {
      // callback
      if (typeof url === 'function') {
        return new exports.Request('GET', method).end(url);
      } // url first


      if (arguments.length === 1) {
        return new exports.Request('GET', method);
      }

      return new exports.Request(method, url);
    };

    exports = module.exports;
    var request = exports;
    exports.Request = Request;
    /**
     * Determine XHR.
     */

    request.getXHR = function () {
      if (root.XMLHttpRequest && (!root.location || root.location.protocol !== 'file:' || !root.ActiveXObject)) {
        return new XMLHttpRequest();
      }

      try {
        return new ActiveXObject('Microsoft.XMLHTTP');
      } catch (_unused) {}

      try {
        return new ActiveXObject('Msxml2.XMLHTTP.6.0');
      } catch (_unused2) {}

      try {
        return new ActiveXObject('Msxml2.XMLHTTP.3.0');
      } catch (_unused3) {}

      try {
        return new ActiveXObject('Msxml2.XMLHTTP');
      } catch (_unused4) {}

      throw new Error('Browser-only version of superagent could not find XHR');
    };
    /**
     * Removes leading and trailing whitespace, added to support IE.
     *
     * @param {String} s
     * @return {String}
     * @api private
     */


    var trim = ''.trim ? function (s) {
      return s.trim();
    } : function (s) {
      return s.replace(/(^\s*|\s*$)/g, '');
    };
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
        if (Object.prototype.hasOwnProperty.call(obj, key)) pushEncodedKeyValuePair(pairs, key, obj[key]);
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
      if (val === undefined) return;

      if (val === null) {
        pairs.push(encodeURI(key));
        return;
      }

      if (Array.isArray(val)) {
        val.forEach(function (v) {
          pushEncodedKeyValuePair(pairs, key, v);
        });
      } else if (isObject(val)) {
        for (var subkey in val) {
          if (Object.prototype.hasOwnProperty.call(val, subkey)) pushEncodedKeyValuePair(pairs, "".concat(key, "[").concat(subkey, "]"), val[subkey]);
        }
      } else {
        pairs.push(encodeURI(key) + '=' + encodeURIComponent(val));
      }
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
      var pair;
      var pos;

      for (var i = 0, len = pairs.length; i < len; ++i) {
        pair = pairs[i];
        pos = pair.indexOf('=');

        if (pos === -1) {
          obj[decodeURIComponent(pair)] = '';
        } else {
          obj[decodeURIComponent(pair.slice(0, pos))] = decodeURIComponent(pair.slice(pos + 1));
        }
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
      xml: 'text/xml',
      urlencoded: 'application/x-www-form-urlencoded',
      form: 'application/x-www-form-urlencoded',
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
      'application/x-www-form-urlencoded': qs.stringify,
      'application/json': safeStringify
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

      for (var i = 0, len = lines.length; i < len; ++i) {
        line = lines[i];
        index = line.indexOf(':');

        if (index === -1) {
          // could be empty line, just skip it
          continue;
        }

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
      // should match /json or +json
      // but not /json-seq
      return /[/+]json($|[^-\w])/i.test(mime);
    }
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


    function Response(req) {
      this.req = req;
      this.xhr = this.req.xhr; // responseText is accessible only if responseType is '' or 'text' and on older browsers

      this.text = this.req.method !== 'HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text') || typeof this.xhr.responseType === 'undefined' ? this.xhr.responseText : null;
      this.statusText = this.req.xhr.statusText;
      var status = this.xhr.status; // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request

      if (status === 1223) {
        status = 204;
      }

      this._setStatusProperties(status);

      this.headers = parseHeader(this.xhr.getAllResponseHeaders());
      this.header = this.headers; // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
      // getResponseHeader still works. so we get content-type even if getting
      // other headers fails.

      this.header['content-type'] = this.xhr.getResponseHeader('content-type');

      this._setHeaderProperties(this.header);

      if (this.text === null && req._responseType) {
        this.body = this.xhr.response;
      } else {
        this.body = this.req.method === 'HEAD' ? null : this._parseBody(this.text ? this.text : this.xhr.response);
      }
    } // eslint-disable-next-line new-cap


    ResponseBase(Response.prototype);
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

    Response.prototype._parseBody = function (str) {
      var parse = request.parse[this.type];

      if (this.req._parser) {
        return this.req._parser(this, str);
      }

      if (!parse && isJSON(this.type)) {
        parse = request.parse['application/json'];
      }

      return parse && str && (str.length > 0 || str instanceof Object) ? parse(str) : null;
    };
    /**
     * Return an `Error` representative of this response.
     *
     * @return {Error}
     * @api public
     */


    Response.prototype.toError = function () {
      var req = this.req;
      var method = req.method;
      var url = req.url;
      var msg = "cannot ".concat(method, " ").concat(url, " (").concat(this.status, ")");
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

      this.on('end', function () {
        var err = null;
        var res = null;

        try {
          res = new Response(self);
        } catch (err_) {
          err = new Error('Parser is unable to parse the response');
          err.parse = true;
          err.original = err_; // issue #675: return the raw response if the response parsing fails

          if (self.xhr) {
            // ie9 doesn't have 'response' property
            err.rawResponse = typeof self.xhr.responseType === 'undefined' ? self.xhr.responseText : self.xhr.response; // issue #876: return the http status code if the response parsing fails

            err.status = self.xhr.status ? self.xhr.status : null;
            err.statusCode = err.status; // backwards-compat only
          } else {
            err.rawResponse = null;
            err.status = null;
          }

          return self.callback(err);
        }

        self.emit('response', res);
        var new_err;

        try {
          if (!self._isResponseOK(res)) {
            new_err = new Error(res.statusText || res.text || 'Unsuccessful HTTP response');
          }
        } catch (err_) {
          new_err = err_; // ok() callback can throw
        } // #1000 don't catch errors from the callback to avoid double calling it


        if (new_err) {
          new_err.original = err;
          new_err.response = res;
          new_err.status = res.status;
          self.callback(new_err, res);
        } else {
          self.callback(null, res);
        }
      });
    }
    /**
     * Mixin `Emitter` and `RequestBase`.
     */
    // eslint-disable-next-line new-cap


    Emitter(Request.prototype); // eslint-disable-next-line new-cap

    RequestBase(Request.prototype);
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

    Request.prototype.type = function (type) {
      this.set('Content-Type', request.types[type] || type);
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


    Request.prototype.accept = function (type) {
      this.set('Accept', request.types[type] || type);
      return this;
    };
    /**
     * Set Authorization field value with `user` and `pass`.
     *
     * @param {String} user
     * @param {String} [pass] optional in case of using 'bearer' as type
     * @param {Object} options with 'type' property 'auto', 'basic' or 'bearer' (default 'basic')
     * @return {Request} for chaining
     * @api public
     */


    Request.prototype.auth = function (user, pass, options) {
      if (arguments.length === 1) pass = '';

      if (_typeof(pass) === 'object' && pass !== null) {
        // pass is optional and can be replaced with options
        options = pass;
        pass = '';
      }

      if (!options) {
        options = {
          type: typeof btoa === 'function' ? 'basic' : 'auto'
        };
      }

      var encoder = function encoder(string) {
        if (typeof btoa === 'function') {
          return btoa(string);
        }

        throw new Error('Cannot use basic auth, btoa is not a function');
      };

      return this._auth(user, pass, options, encoder);
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


    Request.prototype.query = function (val) {
      if (typeof val !== 'string') val = serialize(val);
      if (val) this._query.push(val);
      return this;
    };
    /**
     * Queue the given `file` as an attachment to the specified `field`,
     * with optional `options` (or filename).
     *
     * ``` js
     * request.post('/upload')
     *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
     *   .end(callback);
     * ```
     *
     * @param {String} field
     * @param {Blob|File} file
     * @param {String|Object} options
     * @return {Request} for chaining
     * @api public
     */


    Request.prototype.attach = function (field, file, options) {
      if (file) {
        if (this._data) {
          throw new Error("superagent can't mix .send() and .attach()");
        }

        this._getFormData().append(field, file, options || file.name);
      }

      return this;
    };

    Request.prototype._getFormData = function () {
      if (!this._formData) {
        this._formData = new root.FormData();
      }

      return this._formData;
    };
    /**
     * Invoke the callback with `err` and `res`
     * and handle arity check.
     *
     * @param {Error} err
     * @param {Response} res
     * @api private
     */


    Request.prototype.callback = function (err, res) {
      if (this._shouldRetry(err, res)) {
        return this._retry();
      }

      var fn = this._callback;
      this.clearTimeout();

      if (err) {
        if (this._maxRetries) err.retries = this._retries - 1;
        this.emit('error', err);
      }

      fn(err, res);
    };
    /**
     * Invoke callback with x-domain error.
     *
     * @api private
     */


    Request.prototype.crossDomainError = function () {
      var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
      err.crossDomain = true;
      err.status = this.status;
      err.method = this.method;
      err.url = this.url;
      this.callback(err);
    }; // This only warns, because the request is still likely to work


    Request.prototype.agent = function () {
      console.warn('This is not supported in browser version of superagent');
      return this;
    };

    Request.prototype.ca = Request.prototype.agent;
    Request.prototype.buffer = Request.prototype.ca; // This throws, because it can't send/receive data as expected

    Request.prototype.write = function () {
      throw new Error('Streaming is not supported in browser version of superagent');
    };

    Request.prototype.pipe = Request.prototype.write;
    /**
     * Check if `obj` is a host object,
     * we don't want to serialize these :)
     *
     * @param {Object} obj host object
     * @return {Boolean} is a host object
     * @api private
     */

    Request.prototype._isHost = function (obj) {
      // Native objects stringify to [object File], [object Blob], [object FormData], etc.
      return obj && _typeof(obj) === 'object' && !Array.isArray(obj) && Object.prototype.toString.call(obj) !== '[object Object]';
    };
    /**
     * Initiate request, invoking callback `fn(res)`
     * with an instanceof `Response`.
     *
     * @param {Function} fn
     * @return {Request} for chaining
     * @api public
     */


    Request.prototype.end = function (fn) {
      if (this._endCalled) {
        console.warn('Warning: .end() was called twice. This is not supported in superagent');
      }

      this._endCalled = true; // store callback

      this._callback = fn || noop; // querystring

      this._finalizeQueryString();

      this._end();
    };

    Request.prototype._setUploadTimeout = function () {
      var self = this; // upload timeout it's wokrs only if deadline timeout is off

      if (this._uploadTimeout && !this._uploadTimeoutTimer) {
        this._uploadTimeoutTimer = setTimeout(function () {
          self._timeoutError('Upload timeout of ', self._uploadTimeout, 'ETIMEDOUT');
        }, this._uploadTimeout);
      }
    }; // eslint-disable-next-line complexity


    Request.prototype._end = function () {
      if (this._aborted) return this.callback(new Error('The request has been aborted even before .end() was called'));
      var self = this;
      this.xhr = request.getXHR();
      var xhr = this.xhr;
      var data = this._formData || this._data;

      this._setTimeouts(); // state change


      xhr.onreadystatechange = function () {
        var readyState = xhr.readyState;

        if (readyState >= 2 && self._responseTimeoutTimer) {
          clearTimeout(self._responseTimeoutTimer);
        }

        if (readyState !== 4) {
          return;
        } // In IE9, reads to any property (e.g. status) off of an aborted XHR will
        // result in the error "Could not complete the operation due to error c00c023f"


        var status;

        try {
          status = xhr.status;
        } catch (_unused5) {
          status = 0;
        }

        if (!status) {
          if (self.timedout || self._aborted) return;
          return self.crossDomainError();
        }

        self.emit('end');
      }; // progress


      var handleProgress = function handleProgress(direction, e) {
        if (e.total > 0) {
          e.percent = e.loaded / e.total * 100;

          if (e.percent === 100) {
            clearTimeout(self._uploadTimeoutTimer);
          }
        }

        e.direction = direction;
        self.emit('progress', e);
      };

      if (this.hasListeners('progress')) {
        try {
          xhr.addEventListener('progress', handleProgress.bind(null, 'download'));

          if (xhr.upload) {
            xhr.upload.addEventListener('progress', handleProgress.bind(null, 'upload'));
          }
        } catch (_unused6) {// Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
          // Reported here:
          // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
        }
      }

      if (xhr.upload) {
        this._setUploadTimeout();
      } // initiate request


      try {
        if (this.username && this.password) {
          xhr.open(this.method, this.url, true, this.username, this.password);
        } else {
          xhr.open(this.method, this.url, true);
        }
      } catch (err) {
        // see #1149
        return this.callback(err);
      } // CORS


      if (this._withCredentials) xhr.withCredentials = true; // body

      if (!this._formData && this.method !== 'GET' && this.method !== 'HEAD' && typeof data !== 'string' && !this._isHost(data)) {
        // serialize stuff
        var contentType = this._header['content-type'];

        var _serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];

        if (!_serialize && isJSON(contentType)) {
          _serialize = request.serialize['application/json'];
        }

        if (_serialize) data = _serialize(data);
      } // set header fields


      for (var field in this.header) {
        if (this.header[field] === null) continue;
        if (Object.prototype.hasOwnProperty.call(this.header, field)) xhr.setRequestHeader(field, this.header[field]);
      }

      if (this._responseType) {
        xhr.responseType = this._responseType;
      } // send stuff


      this.emit('request', this); // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
      // We need null here if data is undefined

      xhr.send(typeof data === 'undefined' ? null : data);
    };

    request.agent = function () {
      return new Agent();
    };

    ['GET', 'POST', 'OPTIONS', 'PATCH', 'PUT', 'DELETE'].forEach(function (method) {
      Agent.prototype[method.toLowerCase()] = function (url, fn) {
        var req = new request.Request(method, url);

        this._setDefaults(req);

        if (fn) {
          req.end(fn);
        }

        return req;
      };
    });
    Agent.prototype.del = Agent.prototype.delete;
    /**
     * GET `url` with optional callback `fn(res)`.
     *
     * @param {String} url
     * @param {Mixed|Function} [data] or fn
     * @param {Function} [fn]
     * @return {Request}
     * @api public
     */

    request.get = function (url, data, fn) {
      var req = request('GET', url);

      if (typeof data === 'function') {
        fn = data;
        data = null;
      }

      if (data) req.query(data);
      if (fn) req.end(fn);
      return req;
    };
    /**
     * HEAD `url` with optional callback `fn(res)`.
     *
     * @param {String} url
     * @param {Mixed|Function} [data] or fn
     * @param {Function} [fn]
     * @return {Request}
     * @api public
     */


    request.head = function (url, data, fn) {
      var req = request('HEAD', url);

      if (typeof data === 'function') {
        fn = data;
        data = null;
      }

      if (data) req.query(data);
      if (fn) req.end(fn);
      return req;
    };
    /**
     * OPTIONS query to `url` with optional callback `fn(res)`.
     *
     * @param {String} url
     * @param {Mixed|Function} [data] or fn
     * @param {Function} [fn]
     * @return {Request}
     * @api public
     */


    request.options = function (url, data, fn) {
      var req = request('OPTIONS', url);

      if (typeof data === 'function') {
        fn = data;
        data = null;
      }

      if (data) req.send(data);
      if (fn) req.end(fn);
      return req;
    };
    /**
     * DELETE `url` with optional `data` and callback `fn(res)`.
     *
     * @param {String} url
     * @param {Mixed} [data]
     * @param {Function} [fn]
     * @return {Request}
     * @api public
     */


    function del(url, data, fn) {
      var req = request('DELETE', url);

      if (typeof data === 'function') {
        fn = data;
        data = null;
      }

      if (data) req.send(data);
      if (fn) req.end(fn);
      return req;
    }

    request.del = del;
    request.delete = del;
    /**
     * PATCH `url` with optional `data` and callback `fn(res)`.
     *
     * @param {String} url
     * @param {Mixed} [data]
     * @param {Function} [fn]
     * @return {Request}
     * @api public
     */

    request.patch = function (url, data, fn) {
      var req = request('PATCH', url);

      if (typeof data === 'function') {
        fn = data;
        data = null;
      }

      if (data) req.send(data);
      if (fn) req.end(fn);
      return req;
    };
    /**
     * POST `url` with optional `data` and callback `fn(res)`.
     *
     * @param {String} url
     * @param {Mixed} [data]
     * @param {Function} [fn]
     * @return {Request}
     * @api public
     */


    request.post = function (url, data, fn) {
      var req = request('POST', url);

      if (typeof data === 'function') {
        fn = data;
        data = null;
      }

      if (data) req.send(data);
      if (fn) req.end(fn);
      return req;
    };
    /**
     * PUT `url` with optional `data` and callback `fn(res)`.
     *
     * @param {String} url
     * @param {Mixed|Function} [data] or fn
     * @param {Function} [fn]
     * @return {Request}
     * @api public
     */


    request.put = function (url, data, fn) {
      var req = request('PUT', url);

      if (typeof data === 'function') {
        fn = data;
        data = null;
      }

      if (data) req.send(data);
      if (fn) req.end(fn);
      return req;
    };

    }(client, client.exports));

    var superagent = client.exports;

    /*       */
    function log(req) {
        var _pickLogger = function () {
            if (console && console.log)
                return console; // eslint-disable-line no-console
            if (window && window.console && window.console.log)
                return window.console;
            return console;
        };
        var start = new Date().getTime();
        var timestamp = new Date().toISOString();
        var logger = _pickLogger();
        logger.log('<<<<<');
        logger.log("[".concat(timestamp, "]"), '\n', req.url, '\n', req.qs);
        logger.log('-----');
        req.on('response', function (res) {
            var now = new Date().getTime();
            var elapsed = now - start;
            var timestampDone = new Date().toISOString();
            logger.log('>>>>>>');
            logger.log("[".concat(timestampDone, " / ").concat(elapsed, "]"), '\n', req.url, '\n', req.qs, '\n', res.text);
            logger.log('-----');
        });
    }
    function xdr(superagentConstruct, endpoint, callback) {
        var _this = this;
        if (this._config.logVerbosity) {
            superagentConstruct = superagentConstruct.use(log);
        }
        if (this._config.proxy && this._modules.proxy) {
            superagentConstruct = this._modules.proxy.call(this, superagentConstruct);
        }
        if (this._config.keepAlive && this._modules.keepAlive) {
            superagentConstruct = this._modules.keepAlive(superagentConstruct);
        }
        var sc = superagentConstruct;
        if (endpoint.abortSignal) {
            var unsubscribe_1 = endpoint.abortSignal.subscribe(function () {
                sc.abort();
                unsubscribe_1();
            });
        }
        if (endpoint.forceBuffered === true) {
            if (typeof Blob === 'undefined') {
                sc = sc.buffer().responseType('arraybuffer');
            }
            else {
                sc = sc.responseType('arraybuffer');
            }
        }
        else if (endpoint.forceBuffered === false) {
            sc = sc.buffer(false);
        }
        sc = sc.timeout(endpoint.timeout);
        sc.on('abort', function () {
            return callback({
                category: categories.PNUnknownCategory,
                error: true,
                operation: endpoint.operation,
                errorData: new Error('Aborted'),
            }, null);
        });
        sc.end(function (err, resp) {
            var parsedResponse;
            var status = {};
            status.error = err !== null;
            status.operation = endpoint.operation;
            if (resp && resp.status) {
                status.statusCode = resp.status;
            }
            if (err) {
                if (err.response && err.response.text && !_this._config.logVerbosity) {
                    try {
                        status.errorData = JSON.parse(err.response.text);
                    }
                    catch (e) {
                        status.errorData = err;
                    }
                }
                else {
                    status.errorData = err;
                }
                status.category = _this._detectErrorCategory(err);
                return callback(status, null);
            }
            if (endpoint.ignoreBody) {
                parsedResponse = {
                    headers: resp.headers,
                    redirects: resp.redirects,
                    response: resp,
                };
            }
            else {
                try {
                    parsedResponse = JSON.parse(resp.text);
                }
                catch (e) {
                    status.errorData = resp;
                    status.error = true;
                    return callback(status, null);
                }
            }
            if (parsedResponse.error &&
                parsedResponse.error === 1 &&
                parsedResponse.status &&
                parsedResponse.message &&
                parsedResponse.service) {
                status.errorData = parsedResponse;
                status.statusCode = parsedResponse.status;
                status.error = true;
                status.category = _this._detectErrorCategory(status);
                return callback(status, null);
            }
            if (parsedResponse.error && parsedResponse.error.message) {
                status.errorData = parsedResponse.error;
            }
            return callback(status, parsedResponse);
        });
        return sc;
    }
    function postfile(url, fields, fileInput) {
        return __awaiter(this, void 0, void 0, function () {
            var agent, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        agent = superagent.post(url);
                        fields.forEach(function (_a) {
                            var key = _a.key, value = _a.value;
                            agent = agent.field(key, value);
                        });
                        agent.attach('file', fileInput, { contentType: 'application/octet-stream' });
                        return [4 /*yield*/, agent];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    }
    function getfile(params, endpoint, callback) {
        var superagentConstruct = superagent
            .get(this.getStandardOrigin() + endpoint.url)
            .set(endpoint.headers)
            .query(params);
        return xdr.call(this, superagentConstruct, endpoint, callback);
    }
    function get(params, endpoint, callback) {
        var superagentConstruct = superagent
            .get(this.getStandardOrigin() + endpoint.url)
            .set(endpoint.headers)
            .query(params);
        return xdr.call(this, superagentConstruct, endpoint, callback);
    }
    function post(params, body, endpoint, callback) {
        var superagentConstruct = superagent
            .post(this.getStandardOrigin() + endpoint.url)
            .query(params)
            .set(endpoint.headers)
            .send(body);
        return xdr.call(this, superagentConstruct, endpoint, callback);
    }
    function patch(params, body, endpoint, callback) {
        var superagentConstruct = superagent
            .patch(this.getStandardOrigin() + endpoint.url)
            .query(params)
            .set(endpoint.headers)
            .send(body);
        return xdr.call(this, superagentConstruct, endpoint, callback);
    }
    function del(params, endpoint, callback) {
        var superagentConstruct = superagent
            .delete(this.getStandardOrigin() + endpoint.url)
            .set(endpoint.headers)
            .query(params);
        return xdr.call(this, superagentConstruct, endpoint, callback);
    }

    /* global crypto */
    function concatArrayBuffer(ab1, ab2) {
        var tmp = new Uint8Array(ab1.byteLength + ab2.byteLength);
        tmp.set(new Uint8Array(ab1), 0);
        tmp.set(new Uint8Array(ab2), ab1.byteLength);
        return tmp.buffer;
    }
    var WebCryptography = /** @class */ (function () {
        function WebCryptography() {
        }
        Object.defineProperty(WebCryptography.prototype, "algo", {
            get: function () {
                return 'aes-256-cbc';
            },
            enumerable: false,
            configurable: true
        });
        WebCryptography.prototype.encrypt = function (key, input) {
            return __awaiter(this, void 0, void 0, function () {
                var cKey;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getKey(key)];
                        case 1:
                            cKey = _a.sent();
                            if (input instanceof ArrayBuffer) {
                                return [2 /*return*/, this.encryptArrayBuffer(cKey, input)];
                            }
                            if (typeof input === 'string') {
                                return [2 /*return*/, this.encryptString(cKey, input)];
                            }
                            throw new Error('Cannot encrypt this file. In browsers file encryption supports only string or ArrayBuffer');
                    }
                });
            });
        };
        WebCryptography.prototype.decrypt = function (key, input) {
            return __awaiter(this, void 0, void 0, function () {
                var cKey;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getKey(key)];
                        case 1:
                            cKey = _a.sent();
                            if (input instanceof ArrayBuffer) {
                                return [2 /*return*/, this.decryptArrayBuffer(cKey, input)];
                            }
                            if (typeof input === 'string') {
                                return [2 /*return*/, this.decryptString(cKey, input)];
                            }
                            throw new Error('Cannot decrypt this file. In browsers file decryption supports only string or ArrayBuffer');
                    }
                });
            });
        };
        WebCryptography.prototype.encryptFile = function (key, file, File) {
            return __awaiter(this, void 0, void 0, function () {
                var bKey, abPlaindata, abCipherdata;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getKey(key)];
                        case 1:
                            bKey = _a.sent();
                            return [4 /*yield*/, file.toArrayBuffer()];
                        case 2:
                            abPlaindata = _a.sent();
                            return [4 /*yield*/, this.encryptArrayBuffer(bKey, abPlaindata)];
                        case 3:
                            abCipherdata = _a.sent();
                            return [2 /*return*/, File.create({
                                    name: file.name,
                                    mimeType: 'application/octet-stream',
                                    data: abCipherdata,
                                })];
                    }
                });
            });
        };
        WebCryptography.prototype.decryptFile = function (key, file, File) {
            return __awaiter(this, void 0, void 0, function () {
                var bKey, abCipherdata, abPlaindata;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getKey(key)];
                        case 1:
                            bKey = _a.sent();
                            return [4 /*yield*/, file.toArrayBuffer()];
                        case 2:
                            abCipherdata = _a.sent();
                            return [4 /*yield*/, this.decryptArrayBuffer(bKey, abCipherdata)];
                        case 3:
                            abPlaindata = _a.sent();
                            return [2 /*return*/, File.create({
                                    name: file.name,
                                    data: abPlaindata,
                                })];
                    }
                });
            });
        };
        WebCryptography.prototype.getKey = function (key) {
            return __awaiter(this, void 0, void 0, function () {
                var bKey, abHash, abKey;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            bKey = Buffer.from(key);
                            return [4 /*yield*/, crypto.subtle.digest('SHA-256', bKey.buffer)];
                        case 1:
                            abHash = _a.sent();
                            abKey = Buffer.from(Buffer.from(abHash).toString('hex').slice(0, 32), 'utf8').buffer;
                            return [2 /*return*/, crypto.subtle.importKey('raw', abKey, 'AES-CBC', true, ['encrypt', 'decrypt'])];
                    }
                });
            });
        };
        WebCryptography.prototype.encryptArrayBuffer = function (key, plaintext) {
            return __awaiter(this, void 0, void 0, function () {
                var abIv, _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            abIv = crypto.getRandomValues(new Uint8Array(16));
                            _a = concatArrayBuffer;
                            _b = [abIv.buffer];
                            return [4 /*yield*/, crypto.subtle.encrypt({ name: 'AES-CBC', iv: abIv }, key, plaintext)];
                        case 1: return [2 /*return*/, _a.apply(void 0, _b.concat([_c.sent()]))];
                    }
                });
            });
        };
        WebCryptography.prototype.decryptArrayBuffer = function (key, ciphertext) {
            return __awaiter(this, void 0, void 0, function () {
                var abIv;
                return __generator(this, function (_a) {
                    abIv = ciphertext.slice(0, 16);
                    return [2 /*return*/, crypto.subtle.decrypt({ name: 'AES-CBC', iv: abIv }, key, ciphertext.slice(16))];
                });
            });
        };
        WebCryptography.prototype.encryptString = function (key, plaintext) {
            return __awaiter(this, void 0, void 0, function () {
                var abIv, abPlaintext, abPayload, ciphertext;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            abIv = crypto.getRandomValues(new Uint8Array(16));
                            abPlaintext = Buffer.from(plaintext).buffer;
                            return [4 /*yield*/, crypto.subtle.encrypt({ name: 'AES-CBC', iv: abIv }, key, abPlaintext)];
                        case 1:
                            abPayload = _a.sent();
                            ciphertext = concatArrayBuffer(abIv.buffer, abPayload);
                            return [2 /*return*/, Buffer.from(ciphertext).toString('utf8')];
                    }
                });
            });
        };
        WebCryptography.prototype.decryptString = function (key, ciphertext) {
            return __awaiter(this, void 0, void 0, function () {
                var abCiphertext, abIv, abPayload, abPlaintext;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            abCiphertext = Buffer.from(ciphertext);
                            abIv = abCiphertext.slice(0, 16);
                            abPayload = abCiphertext.slice(16);
                            return [4 /*yield*/, crypto.subtle.decrypt({ name: 'AES-CBC', iv: abIv }, key, abPayload)];
                        case 1:
                            abPlaintext = _a.sent();
                            return [2 /*return*/, Buffer.from(abPlaintext).toString('utf8')];
                    }
                });
            });
        };
        WebCryptography.IV_LENGTH = 16;
        return WebCryptography;
    }());

    /* global File, FileReader */
    var _a;
    var PubNubFile = (_a = /** @class */ (function () {
            function PubNubFile(config) {
                if (config instanceof File) {
                    this.data = config;
                    this.name = this.data.name;
                    this.mimeType = this.data.type;
                }
                else if (config.data) {
                    var contents = config.data;
                    this.data = new File([contents], config.name, { type: config.mimeType });
                    this.name = config.name;
                    if (config.mimeType) {
                        this.mimeType = config.mimeType;
                    }
                }
                if (this.data === undefined) {
                    throw new Error("Couldn't construct a file out of supplied options.");
                }
                if (this.name === undefined) {
                    throw new Error("Couldn't guess filename out of the options. Please provide one.");
                }
            }
            PubNubFile.create = function (config) {
                return new this(config);
            };
            PubNubFile.prototype.toBuffer = function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        throw new Error('This feature is only supported in Node.js environments.');
                    });
                });
            };
            PubNubFile.prototype.toStream = function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        throw new Error('This feature is only supported in Node.js environments.');
                    });
                });
            };
            PubNubFile.prototype.toFileUri = function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        throw new Error('This feature is only supported in react native environments.');
                    });
                });
            };
            PubNubFile.prototype.toBlob = function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, this.data];
                    });
                });
            };
            PubNubFile.prototype.toArrayBuffer = function () {
                return __awaiter(this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var reader = new FileReader();
                                reader.addEventListener('load', function () {
                                    if (reader.result instanceof ArrayBuffer) {
                                        return resolve(reader.result);
                                    }
                                });
                                reader.addEventListener('error', function () {
                                    reject(reader.error);
                                });
                                reader.readAsArrayBuffer(_this.data);
                            })];
                    });
                });
            };
            PubNubFile.prototype.toString = function () {
                return __awaiter(this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var reader = new FileReader();
                                reader.addEventListener('load', function () {
                                    if (typeof reader.result === 'string') {
                                        return resolve(reader.result);
                                    }
                                });
                                reader.addEventListener('error', function () {
                                    reject(reader.error);
                                });
                                reader.readAsBinaryString(_this.data);
                            })];
                    });
                });
            };
            PubNubFile.prototype.toFile = function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, this.data];
                    });
                });
            };
            return PubNubFile;
        }()),
        _a.supportsFile = typeof File !== 'undefined',
        _a.supportsBlob = typeof Blob !== 'undefined',
        _a.supportsArrayBuffer = typeof ArrayBuffer !== 'undefined',
        _a.supportsBuffer = false,
        _a.supportsStream = false,
        _a.supportsString = true,
        _a.supportsEncryptFile = true,
        _a.supportsFileUri = false,
        _a);

    /*       */
    function sendBeacon(url) {
        if (navigator && navigator.sendBeacon) {
            navigator.sendBeacon(url);
        }
        else {
            return false;
        }
    }
    function base64ToBinary(base64String) {
        var parsedWordArray = hmacSha256.enc.Base64.parse(base64String).words;
        var arrayBuffer = new ArrayBuffer(parsedWordArray.length * 4);
        var view = new Uint8Array(arrayBuffer);
        var filledArrayBuffer = null;
        var zeroBytesCount = 0;
        var byteOffset = 0;
        for (var wordIdx = 0; wordIdx < parsedWordArray.length; wordIdx += 1) {
            var word = parsedWordArray[wordIdx];
            byteOffset = wordIdx * 4;
            view[byteOffset] = (word & 0xff000000) >> 24;
            view[byteOffset + 1] = (word & 0x00ff0000) >> 16;
            view[byteOffset + 2] = (word & 0x0000ff00) >> 8;
            view[byteOffset + 3] = word & 0x000000ff;
        }
        for (var byteIdx = byteOffset + 3; byteIdx >= byteOffset; byteIdx -= 1) {
            if (view[byteIdx] === 0 && zeroBytesCount < 3) {
                zeroBytesCount += 1;
            }
        }
        if (zeroBytesCount > 0) {
            filledArrayBuffer = view.buffer.slice(0, view.byteLength - zeroBytesCount);
        }
        else {
            filledArrayBuffer = view.buffer;
        }
        return filledArrayBuffer;
    }
    function stringifyBufferKeys(obj) {
        var isObject = function (value) { return value && typeof value === 'object' && value.constructor === Object; };
        var isString = function (value) { return typeof value === 'string' || value instanceof String; };
        var isNumber = function (value) { return typeof value === 'number' && isFinite(value); };
        if (!isObject(obj)) {
            return obj;
        }
        var normalizedObject = {};
        Object.keys(obj).forEach(function (key) {
            var keyIsString = isString(key);
            var stringifiedKey = key;
            var value = obj[key];
            if (Array.isArray(key) || (keyIsString && key.indexOf(',') >= 0)) {
                var bytes = keyIsString ? key.split(',') : key;
                stringifiedKey = bytes.reduce(function (string, byte) {
                    string += String.fromCharCode(byte);
                    return string;
                }, '');
            }
            else if (isNumber(key) || (keyIsString && !isNaN(key))) {
                stringifiedKey = String.fromCharCode(keyIsString ? parseInt(key, 10) : 10);
            }
            normalizedObject[stringifiedKey] = isObject(value) ? stringifyBufferKeys(value) : value;
        });
        return normalizedObject;
    }
    var default_1 = /** @class */ (function (_super) {
        __extends(default_1, _super);
        function default_1(setup) {
            var _this = this;
            // extract config.
            var _a = setup.listenToBrowserNetworkEvents, listenToBrowserNetworkEvents = _a === void 0 ? true : _a;
            setup.db = db;
            setup.sdkFamily = 'Web';
            setup.networking = new default_1$2({
                del: del,
                get: get,
                post: post,
                patch: patch,
                sendBeacon: sendBeacon,
                getfile: getfile,
                postfile: postfile,
            });
            setup.cbor = new default_1$1(function (arrayBuffer) { return stringifyBufferKeys(CborReader.decode(arrayBuffer)); }, base64ToBinary);
            setup.PubNubFile = PubNubFile;
            setup.cryptography = new WebCryptography();
            _this = _super.call(this, setup) || this;
            if (listenToBrowserNetworkEvents) {
                // mount network events.
                window.addEventListener('offline', function () {
                    _this.networkDownDetected();
                });
                window.addEventListener('online', function () {
                    _this.networkUpDetected();
                });
            }
            return _this;
        }
        return default_1;
    }(default_1$3));

    return default_1;

}));
