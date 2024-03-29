(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.PubNub = factory());
})(this, (function () { 'use strict';

    /******************************************************************************
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
    /* global Reflect, Promise, SuppressedError, Symbol */

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
            while (g && (g = 0, op[0] && (_ = 0)), _) try {
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

    function __read(o, n) {
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

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

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
    	(function(global, undefined$1) {	var POW_2_24 = Math.pow(2, -24),
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
    } (cbor));

    var cborExports = cbor.exports;
    var CborReader = /*@__PURE__*/getDefaultExportFromCjs(cborExports);

    /**
     * Crypto module.
     */
    var AbstractCryptoModule = /** @class */ (function () {
        // endregion
        function AbstractCryptoModule(configuration) {
            var _a;
            this.defaultCryptor = configuration.default;
            this.cryptors = (_a = configuration.cryptors) !== null && _a !== void 0 ? _a : [];
        }
        // --------------------------------------------------------
        // --------------- Convenience functions ------------------
        // --------------------------------------------------------
        // region Convenience functions
        /**
         * Construct crypto module with legacy cryptor for encryption and both legacy and AES-CBC
         * cryptors for decryption.
         *
         * @param config Cryptors configuration options.
         *
         * @returns Crypto module which encrypts data using legacy cryptor.
         *
         * @throws Error if `config.cipherKey` not set.
         */
        AbstractCryptoModule.legacyCryptoModule = function (config) {
            throw new Error('Should be implemented by concrete crypto module implementation.');
        };
        /**
         * Construct crypto module with AES-CBC cryptor for encryption and both AES-CBC and legacy
         * cryptors for decryption.
         *
         * @param config Cryptors configuration options.
         *
         * @returns Crypto module which encrypts data using AES-CBC cryptor.
         *
         * @throws Error if `config.cipherKey` not set.
         */
        AbstractCryptoModule.aesCbcCryptoModule = function (config) {
            throw new Error('Should be implemented by concrete crypto module implementation.');
        };
        // endregion
        // --------------------------------------------------------
        // ----------------------- Helpers ------------------------
        // --------------------------------------------------------
        // region Helpers
        /**
         * Retrieve list of module's cryptors.
         */
        AbstractCryptoModule.prototype.getAllCryptors = function () {
            return __spreadArray([this.defaultCryptor], __read(this.cryptors), false);
        };
        /**
         * `String` to {@link ArrayBuffer} response decoder.
         */
        AbstractCryptoModule.encoder = new TextEncoder();
        /**
         *  {@link ArrayBuffer} to {@link string} decoder.
         */
        AbstractCryptoModule.decoder = new TextDecoder();
        return AbstractCryptoModule;
    }());

    /* global File, FileReader */
    /**
     * Browser {@link PubNub} File object module.
     */
    // endregion
    /**
     * Web implementation for {@link PubNub} File object.
     *
     * **Important:** Class should implement constructor and class fields from {@link PubNubFileConstructor}.
     */
    var PubNubFile = /** @class */ (function () {
        function PubNubFile(file) {
            var fileMimeType;
            var fileName;
            var fileData;
            if (file instanceof File) {
                fileData = file;
                fileName = file.name;
                fileMimeType = file.type;
            }
            else if ('data' in file) {
                var contents = file.data;
                fileMimeType = file.mimeType;
                fileName = file.name;
                fileData = new File([contents], fileName, { type: fileMimeType });
            }
            if (fileData === undefined)
                throw new Error("Couldn't construct a file out of supplied options.");
            if (fileName === undefined)
                throw new Error("Couldn't guess filename out of the options. Please provide one.");
            this.mimeType = fileMimeType;
            this.data = fileData;
            this.name = fileName;
        }
        // endregion
        PubNubFile.create = function (file) {
            return new PubNubFile(file);
        };
        /**
         * Convert {@link PubNub} File object content to {@link Buffer}.
         *
         * @throws Error because {@link Buffer} not available in browser environment.
         */
        PubNubFile.prototype.toBuffer = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    throw new Error('This feature is only supported in Node.js environments.');
                });
            });
        };
        /**
         * Convert {@link PubNub} File object content to {@link ArrayBuffer}.
         *
         * @returns Asynchronous results of conversion to the {@link ArrayBuffer}.
         */
        PubNubFile.prototype.toArrayBuffer = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var reader = new FileReader();
                            reader.addEventListener('load', function () {
                                if (reader.result instanceof ArrayBuffer)
                                    return resolve(reader.result);
                            });
                            reader.addEventListener('error', function () { return reject(reader.error); });
                            reader.readAsArrayBuffer(_this.data);
                        })];
                });
            });
        };
        /**
         * Convert {@link PubNub} File object content to {@link string}.
         *
         * @returns Asynchronous results of conversion to the {@link string}.
         */
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
        /**
         * Convert {@link PubNub} File object content to {@link Readable} stream.
         *
         * @throws Error because {@link Readable} stream not available in browser environment.
         */
        PubNubFile.prototype.toStream = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    throw new Error('This feature is only supported in Node.js environments.');
                });
            });
        };
        /**
         * Convert {@link PubNub} File object content to {@link File}.
         *
         * @returns Asynchronous results of conversion to the {@link File}.
         */
        PubNubFile.prototype.toFile = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.data];
                });
            });
        };
        /**
         * Convert {@link PubNub} File object content to file `Uri`.
         *
         * @throws Error because file `Uri` not available in browser environment.
         */
        PubNubFile.prototype.toFileUri = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    throw new Error('This feature is only supported in React Native environments.');
                });
            });
        };
        /**
         * Convert {@link PubNub} File object content to {@link Blob}.
         *
         * @returns Asynchronous results of conversion to the {@link Blob}.
         */
        PubNubFile.prototype.toBlob = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.data];
                });
            });
        };
        // region Class properties
        /**
         * Whether {@link Blob} data supported by platform or not.
         */
        PubNubFile.supportsBlob = typeof Blob !== 'undefined';
        /**
         * Whether {@link File} data supported by platform or not.
         */
        PubNubFile.supportsFile = typeof File !== 'undefined';
        /**
         * Whether {@link Buffer} data supported by platform or not.
         */
        PubNubFile.supportsBuffer = false;
        /**
         * Whether {@link Stream} data supported by platform or not.
         */
        PubNubFile.supportsStream = false;
        /**
         * Whether {@link String} data supported by platform or not.
         */
        PubNubFile.supportsString = true;
        /**
         * Whether {@link ArrayBuffer} supported by platform or not.
         */
        PubNubFile.supportsArrayBuffer = true;
        /**
         * Whether {@link PubNub} File object encryption supported or not.
         */
        PubNubFile.supportsEncryptFile = true;
        /**
         * Whether `File Uri` data supported by platform or not.
         */
        PubNubFile.supportsFileUri = false;
        return PubNubFile;
    }());

    var BASE64_CHARMAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    /**
     * Decode a Base64 encoded string.
     *
     * @param paddedInput Base64 string with padding
     * @returns ArrayBuffer with decoded data
     */
    function decode(paddedInput) {
        // Remove up to last two equal signs.
        var input = paddedInput.replace(/==?$/, '');
        var outputLength = Math.floor((input.length / 4) * 3);
        // Prepare output buffer.
        var data = new ArrayBuffer(outputLength);
        var view = new Uint8Array(data);
        var cursor = 0;
        /**
         * Returns the next integer representation of a sixtet of bytes from the input
         * @returns sixtet of bytes
         */
        function nextSixtet() {
            var char = input.charAt(cursor++);
            var index = BASE64_CHARMAP.indexOf(char);
            if (index === -1) {
                throw new Error("Illegal character at ".concat(cursor, ": ").concat(input.charAt(cursor - 1)));
            }
            return index;
        }
        for (var i = 0; i < outputLength; i += 3) {
            // Obtain four sixtets
            var sx1 = nextSixtet();
            var sx2 = nextSixtet();
            var sx3 = nextSixtet();
            var sx4 = nextSixtet();
            // Encode them as three octets
            var oc1 = ((sx1 & 63) << 2) | (sx2 >> 4);
            var oc2 = ((sx2 & 15) << 4) | (sx3 >> 2);
            var oc3 = ((sx3 & 3) << 6) | (sx4 >> 0);
            view[i] = oc1;
            // Skip padding bytes.
            if (sx3 != 64)
                view[i + 1] = oc2;
            if (sx4 != 64)
                view[i + 2] = oc3;
        }
        return data;
    }
    function encode(input) {
        var base64 = '';
        var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var bytes = new Uint8Array(input);
        var byteLength = bytes.byteLength;
        var byteRemainder = byteLength % 3;
        var mainLength = byteLength - byteRemainder;
        var a, b, c, d;
        var chunk;
        // Main loop deals with bytes in chunks of 3
        for (var i = 0; i < mainLength; i = i + 3) {
            // Combine the three bytes into a single integer
            chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
            // Use bitmasks to extract 6-bit segments from the triplet
            a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
            b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
            c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
            d = chunk & 63; // 63       = 2^6 - 1
            // Convert the raw binary segments to the appropriate ASCII encoding
            base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
        }
        // Deal with the remaining bytes and padding
        if (byteRemainder == 1) {
            chunk = bytes[mainLength];
            a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2
            // Set the 4 least significant bits to zero
            b = (chunk & 3) << 4; // 3   = 2^2 - 1
            base64 += encodings[a] + encodings[b] + '==';
        }
        else if (byteRemainder == 2) {
            chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
            a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
            b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4
            // Set the 2 least significant bits to zero
            c = (chunk & 15) << 2; // 15    = 2^4 - 1
            base64 += encodings[a] + encodings[b] + encodings[c] + '=';
        }
        return base64;
    }

    var PubNubError = /** @class */ (function (_super) {
        __extends(PubNubError, _super);
        function PubNubError(message, status) {
            var _newTarget = this.constructor;
            var _this = _super.call(this, message) || this;
            _this.status = status;
            _this.name = _this.constructor.name;
            _this.message = message;
            Object.setPrototypeOf(_this, _newTarget.prototype);
            return _this;
        }
        return PubNubError;
    }(Error));
    function createError(errorPayload, type) {
        var _a;
        (_a = errorPayload.statusCode) !== null && _a !== void 0 ? _a : (errorPayload.statusCode = 0);
        return __assign(__assign({}, errorPayload), { statusCode: errorPayload.statusCode, error: true, type: type });
    }
    function createValidationError(message, statusCode) {
        return createError(__assign({ message: message }, (statusCode !== undefined ? { statusCode: statusCode } : {})), 'validationError');
    }

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


    var CryptoJS$1 = /*@__PURE__*/getDefaultExportFromCjs(hmacSha256);

    /**
     * AES-CBC cryptor module.
     */
    /**
     * AES-CBC cryptor.
     *
     * AES-CBC cryptor with enhanced cipher strength.
     */
    var AesCbcCryptor = /** @class */ (function () {
        function AesCbcCryptor(_a) {
            var cipherKey = _a.cipherKey;
            this.cipherKey = cipherKey;
            this.CryptoJS = CryptoJS$1;
            this.encryptedKey = this.CryptoJS.SHA256(cipherKey);
        }
        // --------------------------------------------------------
        // --------------------- Encryption -----------------------
        // --------------------------------------------------------
        // region Encryption
        AesCbcCryptor.prototype.encrypt = function (data) {
            var stringData = typeof data === 'string' ? data : AesCbcCryptor.decoder.decode(data);
            if (stringData.length === 0)
                throw new Error('encryption error. empty content');
            var abIv = this.getIv();
            return {
                metadata: abIv,
                data: decode(this.CryptoJS.AES.encrypt(data, this.encryptedKey, {
                    iv: this.bufferToWordArray(abIv),
                    mode: this.CryptoJS.mode.CBC,
                }).ciphertext.toString(this.CryptoJS.enc.Base64)),
            };
        };
        AesCbcCryptor.prototype.encryptFileData = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var key, iv;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.getKey()];
                        case 1:
                            key = _b.sent();
                            iv = this.getIv();
                            _a = {};
                            return [4 /*yield*/, crypto.subtle.encrypt({ name: this.algo, iv: iv }, key, data)];
                        case 2: return [2 /*return*/, (_a.data = _b.sent(),
                                _a.metadata = iv,
                                _a)];
                    }
                });
            });
        };
        // endregion
        // --------------------------------------------------------
        // --------------------- Decryption -----------------------
        // --------------------------------------------------------
        // region Decryption
        AesCbcCryptor.prototype.decrypt = function (encryptedData) {
            var iv = this.bufferToWordArray(new Uint8ClampedArray(encryptedData.metadata));
            var data = this.bufferToWordArray(new Uint8ClampedArray(encryptedData.data));
            return AesCbcCryptor.encoder.encode(this.CryptoJS.AES.decrypt({ ciphertext: data }, this.encryptedKey, {
                iv: iv,
                mode: this.CryptoJS.mode.CBC,
            }).toString(this.CryptoJS.enc.Utf8)).buffer;
        };
        AesCbcCryptor.prototype.decryptFileData = function (encryptedData) {
            return __awaiter(this, void 0, void 0, function () {
                var key;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getKey()];
                        case 1:
                            key = _a.sent();
                            return [2 /*return*/, crypto.subtle.decrypt({ name: this.algo, iv: encryptedData.metadata }, key, encryptedData.data)];
                    }
                });
            });
        };
        Object.defineProperty(AesCbcCryptor.prototype, "identifier", {
            // endregion
            // --------------------------------------------------------
            // ----------------------- Helpers ------------------------
            // --------------------------------------------------------
            // region Helpers
            get: function () {
                return 'ACRH';
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AesCbcCryptor.prototype, "algo", {
            /**
             * Cryptor algorithm.
             *
             * @returns Cryptor module algorithm.
             */
            get: function () {
                return 'AES-CBC';
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Generate random initialization vector.
         *
         * @returns Random initialization vector.
         */
        AesCbcCryptor.prototype.getIv = function () {
            return crypto.getRandomValues(new Uint8Array(AesCbcCryptor.BLOCK_SIZE));
        };
        /**
         * Convert cipher key to the {@link Buffer}.
         *
         * @returns SHA256 encoded cipher key {@link Buffer}.
         */
        AesCbcCryptor.prototype.getKey = function () {
            return __awaiter(this, void 0, void 0, function () {
                var bKey, abHash;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            bKey = AesCbcCryptor.encoder.encode(this.cipherKey);
                            return [4 /*yield*/, crypto.subtle.digest('SHA-256', bKey.buffer)];
                        case 1:
                            abHash = _a.sent();
                            return [2 /*return*/, crypto.subtle.importKey('raw', abHash, this.algo, true, ['encrypt', 'decrypt'])];
                    }
                });
            });
        };
        /**
         * Convert bytes array to words array.
         *
         * @param b - Bytes array (buffer) which should be converted.
         *
         * @returns Word sized array.
         */
        AesCbcCryptor.prototype.bufferToWordArray = function (b) {
            var wa = [];
            var i;
            for (i = 0; i < b.length; i += 1) {
                wa[(i / 4) | 0] |= b[i] << (24 - 8 * i);
            }
            return this.CryptoJS.lib.WordArray.create(wa, b.length);
        };
        /**
         * Cryptor block size.
         */
        AesCbcCryptor.BLOCK_SIZE = 16;
        /**
         * {@link string|String} to {@link ArrayBuffer} response decoder.
         */
        AesCbcCryptor.encoder = new TextEncoder();
        /**
         *  {@link ArrayBuffer} to {@link string} decoder.
         */
        AesCbcCryptor.decoder = new TextDecoder();
        return AesCbcCryptor;
    }());

    /**
     * Legacy cryptography module.
     */
    /**
     * Convert bytes array to words array.
     *
     * @param b - Bytes array (buffer) which should be converted.
     *
     * @returns Word sized array.
     */
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    function bufferToWordArray(b) {
        var wa = [];
        var i;
        for (i = 0; i < b.length; i += 1) {
            wa[(i / 4) | 0] |= b[i] << (24 - 8 * i);
        }
        // @ts-expect-error Bundled library without types.
        return CryptoJS$1.lib.WordArray.create(wa, b.length);
    }
    var default_1$3 = /** @class */ (function () {
        function default_1(configuration) {
            this.configuration = configuration;
            /**
             * Crypto initialization vector.
             */
            this.iv = '0123456789012345';
            /**
             * List os allowed cipher key encodings.
             */
            this.allowedKeyEncodings = ['hex', 'utf8', 'base64', 'binary'];
            /**
             * Allowed cipher key lengths.
             */
            this.allowedKeyLengths = [128, 256];
            /**
             * Allowed crypto modes.
             */
            this.allowedModes = ['ecb', 'cbc'];
            this.defaultOptions = {
                encryptKey: true,
                keyEncoding: 'utf8',
                keyLength: 256,
                mode: 'cbc',
            };
        }
        /**
         * Generate HMAC-SHA256 hash from input data.
         *
         * @param data - Data from which hash should be generated.
         *
         * @returns HMAC-SHA256 hash from provided `data`.
         */
        default_1.prototype.HMACSHA256 = function (data) {
            // @ts-expect-error Bundled library without types.
            var hash = CryptoJS$1.HmacSHA256(data, this.configuration.secretKey);
            // @ts-expect-error Bundled library without types.
            return hash.toString(CryptoJS$1.enc.Base64);
        };
        /**
         * Generate SHA256 hash from input data.
         *
         * @param data - Data from which hash should be generated.
         *
         * @returns SHA256 hash from provided `data`.
         */
        default_1.prototype.SHA256 = function (data) {
            // @ts-expect-error Bundled library without types.
            return CryptoJS$1.SHA256(data).toString(CryptoJS$1.enc.Hex);
        };
        /**
         * Encrypt provided data.
         *
         * @param data - Source data which should be encrypted.
         * @param [customCipherKey] - Custom cipher key (different from defined on client level).
         * @param [options] - Specific crypto configuration options.
         *
         * @returns Encrypted `data`.
         */
        default_1.prototype.encrypt = function (data, customCipherKey, options) {
            if (this.configuration.customEncrypt)
                return this.configuration.customEncrypt(data);
            return this.pnEncrypt(data, customCipherKey, options);
        };
        /**
         * Decrypt provided data.
         *
         * @param data - Encrypted data which should be decrypted.
         * @param [customCipherKey] - Custom cipher key (different from defined on client level).
         * @param [options] - Specific crypto configuration options.
         *
         * @returns Decrypted `data`.
         */
        default_1.prototype.decrypt = function (data, customCipherKey, options) {
            if (this.configuration.customDecrypt)
                return this.configuration.customDecrypt(data);
            return this.pnDecrypt(data, customCipherKey, options);
        };
        /**
         * Encrypt provided data.
         *
         * @param data - Source data which should be encrypted.
         * @param [customCipherKey] - Custom cipher key (different from defined on client level).
         * @param [options] - Specific crypto configuration options.
         *
         * @returns Encrypted `data` as string.
         */
        default_1.prototype.pnEncrypt = function (data, customCipherKey, options) {
            var decidedCipherKey = customCipherKey !== null && customCipherKey !== void 0 ? customCipherKey : this.configuration.cipherKey;
            if (!decidedCipherKey)
                return data;
            options = this.parseOptions(options);
            var mode = this.getMode(options);
            var cipherKey = this.getPaddedKey(decidedCipherKey, options);
            if (this.configuration.useRandomIVs) {
                var waIv = this.getRandomIV();
                // @ts-expect-error Bundled library without types.
                var waPayload = CryptoJS$1.AES.encrypt(data, cipherKey, { iv: waIv, mode: mode }).ciphertext;
                // @ts-expect-error Bundled library without types.
                return waIv.clone().concat(waPayload.clone()).toString(CryptoJS$1.enc.Base64);
            }
            var iv = this.getIV(options);
            // @ts-expect-error Bundled library without types.
            var encryptedHexArray = CryptoJS$1.AES.encrypt(data, cipherKey, { iv: iv, mode: mode }).ciphertext;
            // @ts-expect-error Bundled library without types.
            var base64Encrypted = encryptedHexArray.toString(CryptoJS$1.enc.Base64);
            return base64Encrypted || data;
        };
        /**
         * Decrypt provided data.
         *
         * @param data - Encrypted data which should be decrypted.
         * @param [customCipherKey] - Custom cipher key (different from defined on client level).
         * @param [options] - Specific crypto configuration options.
         *
         * @returns Decrypted `data`.
         */
        default_1.prototype.pnDecrypt = function (data, customCipherKey, options) {
            var decidedCipherKey = customCipherKey !== null && customCipherKey !== void 0 ? customCipherKey : this.configuration.cipherKey;
            if (!decidedCipherKey)
                return data;
            options = this.parseOptions(options);
            var mode = this.getMode(options);
            var cipherKey = this.getPaddedKey(decidedCipherKey, options);
            if (this.configuration.useRandomIVs) {
                var ciphertext = new Uint8ClampedArray(decode(data));
                var iv = bufferToWordArray(ciphertext.slice(0, 16));
                var payload = bufferToWordArray(ciphertext.slice(16));
                try {
                    // @ts-expect-error Bundled library without types.
                    var plainJSON = CryptoJS$1.AES.decrypt({ ciphertext: payload }, cipherKey, { iv: iv, mode: mode }).toString(
                    // @ts-expect-error Bundled library without types.
                    CryptoJS$1.enc.Utf8);
                    return JSON.parse(plainJSON);
                }
                catch (e) {
                    return null;
                }
            }
            else {
                var iv = this.getIV(options);
                try {
                    // @ts-expect-error Bundled library without types.
                    var ciphertext = CryptoJS$1.enc.Base64.parse(data);
                    // @ts-expect-error Bundled library without types.
                    var plainJSON = CryptoJS$1.AES.decrypt({ ciphertext: ciphertext }, cipherKey, { iv: iv, mode: mode }).toString(CryptoJS$1.enc.Utf8);
                    return JSON.parse(plainJSON);
                }
                catch (e) {
                    return null;
                }
            }
        };
        /**
         * Pre-process provided custom crypto configuration.
         *
         * @param incomingOptions - Configuration which should be pre-processed before use.
         *
         * @returns Normalized crypto configuration options.
         */
        default_1.prototype.parseOptions = function (incomingOptions) {
            var _a, _b, _c, _d;
            if (!incomingOptions)
                return this.defaultOptions;
            // Defaults
            var options = {
                encryptKey: (_a = incomingOptions.encryptKey) !== null && _a !== void 0 ? _a : this.defaultOptions.encryptKey,
                keyEncoding: (_b = incomingOptions.keyEncoding) !== null && _b !== void 0 ? _b : this.defaultOptions.keyEncoding,
                keyLength: (_c = incomingOptions.keyLength) !== null && _c !== void 0 ? _c : this.defaultOptions.keyLength,
                mode: (_d = incomingOptions.mode) !== null && _d !== void 0 ? _d : this.defaultOptions.mode,
            };
            // Validation
            if (this.allowedKeyEncodings.indexOf(options.keyEncoding.toLowerCase()) === -1)
                options.keyEncoding = this.defaultOptions.keyEncoding;
            if (this.allowedKeyLengths.indexOf(options.keyLength) === -1)
                options.keyLength = this.defaultOptions.keyLength;
            if (this.allowedModes.indexOf(options.mode.toLowerCase()) === -1)
                options.mode = this.defaultOptions.mode;
            return options;
        };
        /**
         * Decode provided cipher key.
         *
         * @param key - Key in `encoding` provided by `options`.
         * @param options - Crypto configuration options with cipher key details.
         *
         * @returns Array buffer with decoded key.
         */
        default_1.prototype.decodeKey = function (key, options) {
            // @ts-expect-error Bundled library without types.
            if (options.keyEncoding === 'base64')
                return CryptoJS$1.enc.Base64.parse(key);
            // @ts-expect-error Bundled library without types.
            if (options.keyEncoding === 'hex')
                return CryptoJS$1.enc.Hex.parse(key);
            return key;
        };
        /**
         * Add padding to the cipher key.
         *
         * @param key - Key which should be padded.
         * @param options - Crypto configuration options with cipher key details.
         *
         * @returns Properly padded cipher key.
         */
        default_1.prototype.getPaddedKey = function (key, options) {
            key = this.decodeKey(key, options);
            // @ts-expect-error Bundled library without types.
            if (options.encryptKey)
                return CryptoJS$1.enc.Utf8.parse(this.SHA256(key).slice(0, 32));
            return key;
        };
        /**
         * Cipher mode.
         *
         * @param options - Crypto configuration with information about cipher mode.
         *
         * @returns Crypto cipher mode.
         */
        default_1.prototype.getMode = function (options) {
            // @ts-expect-error Bundled library without types.
            if (options.mode === 'ecb')
                return CryptoJS$1.mode.ECB;
            // @ts-expect-error Bundled library without types.
            return CryptoJS$1.mode.CBC;
        };
        /**
         * Cipher initialization vector.
         *
         * @param options - Crypto configuration with information about cipher mode.
         *
         * @returns Initialization vector.
         */
        default_1.prototype.getIV = function (options) {
            // @ts-expect-error Bundled library without types.
            return options.mode === 'cbc' ? CryptoJS$1.enc.Utf8.parse(this.iv) : null;
        };
        /**
         * Random initialization vector.
         *
         * @returns Generated random initialization vector.
         */
        default_1.prototype.getRandomIV = function () {
            // @ts-expect-error Bundled library without types.
            return CryptoJS$1.lib.WordArray.random(16);
        };
        return default_1;
    }());

    /* global crypto */
    /**
     * Legacy browser cryptography module.
     */
    function concatArrayBuffer(ab1, ab2) {
        var tmp = new Uint8Array(ab1.byteLength + ab2.byteLength);
        tmp.set(new Uint8Array(ab1), 0);
        tmp.set(new Uint8Array(ab2), ab1.byteLength);
        return tmp.buffer;
    }
    /**
     * Legacy cryptography implementation for browser-based {@link PubNub} client.
     */
    var WebCryptography = /** @class */ (function () {
        function WebCryptography() {
        }
        // --------------------------------------------------------
        // --------------------- Encryption -----------------------
        // --------------------------------------------------------
        // region Encryption
        /**
         * Encrypt provided source data using specific encryption {@link key}.
         *
         * @param key - Data encryption key. <br/>**Note:** Same key should be used to `decrypt` data.
         * @param input - Source data for encryption.
         *
         * @returns Encrypted data as object or stream (depending on from source data type).
         *
         * @throws Error if unknown data type has been passed.
         */
        WebCryptography.prototype.encrypt = function (key, input) {
            return __awaiter(this, void 0, void 0, function () {
                var cKey;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(input instanceof ArrayBuffer) && typeof input !== 'string')
                                throw new Error('Cannot encrypt this file. In browsers file encryption supports only string or ArrayBuffer');
                            return [4 /*yield*/, this.getKey(key)];
                        case 1:
                            cKey = _a.sent();
                            return [2 /*return*/, input instanceof ArrayBuffer ? this.encryptArrayBuffer(cKey, input) : this.encryptString(cKey, input)];
                    }
                });
            });
        };
        /**
         * Encrypt provided source {@link Buffer} using specific encryption {@link ArrayBuffer}.
         *
         * @param key - Data encryption key. <br/>**Note:** Same key should be used to `decrypt` {@link ArrayBuffer}.
         * @param buffer - Source {@link ArrayBuffer} for encryption.
         *
         * @returns Encrypted data as {@link ArrayBuffer} object.
         */
        WebCryptography.prototype.encryptArrayBuffer = function (key, buffer) {
            return __awaiter(this, void 0, void 0, function () {
                var abIv, _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            abIv = crypto.getRandomValues(new Uint8Array(16));
                            _a = concatArrayBuffer;
                            _b = [abIv.buffer];
                            return [4 /*yield*/, crypto.subtle.encrypt({ name: 'AES-CBC', iv: abIv }, key, buffer)];
                        case 1: return [2 /*return*/, _a.apply(void 0, _b.concat([_c.sent()]))];
                    }
                });
            });
        };
        /**
         * Encrypt provided source {@link string} using specific encryption {@link key}.
         *
         * @param key - Data encryption key. <br/>**Note:** Same key should be used to `decrypt` {@link string}.
         * @param text - Source {@link string} for encryption.
         *
         * @returns Encrypted data as byte {@link string}.
         */
        WebCryptography.prototype.encryptString = function (key, text) {
            return __awaiter(this, void 0, void 0, function () {
                var abIv, abPlaintext, abPayload, ciphertext;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            abIv = crypto.getRandomValues(new Uint8Array(16));
                            abPlaintext = WebCryptography.encoder.encode(text).buffer;
                            return [4 /*yield*/, crypto.subtle.encrypt({ name: 'AES-CBC', iv: abIv }, key, abPlaintext)];
                        case 1:
                            abPayload = _a.sent();
                            ciphertext = concatArrayBuffer(abIv.buffer, abPayload);
                            return [2 /*return*/, WebCryptography.decoder.decode(ciphertext)];
                    }
                });
            });
        };
        /**
         * Encrypt provided {@link PubNub} File object using specific encryption {@link key}.
         *
         * @param key - Key for {@link PubNub} File object encryption. <br/>**Note:** Same key should be
         * used to `decrypt` data.
         * @param file - Source {@link PubNub} File object for encryption.
         * @param File - Class constructor for {@link PubNub} File object.
         *
         * @returns Encrypted data as {@link PubNub} File object.
         *
         * @throws Error if file is empty or contains unsupported data type.
         */
        WebCryptography.prototype.encryptFile = function (key, file, File) {
            return __awaiter(this, void 0, void 0, function () {
                var bKey, abPlaindata, abCipherdata;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if ((_a = file.contentLength) !== null && _a !== void 0 ? _a : 0 <= 0)
                                throw new Error('encryption error. empty content');
                            return [4 /*yield*/, this.getKey(key)];
                        case 1:
                            bKey = _c.sent();
                            return [4 /*yield*/, file.toArrayBuffer()];
                        case 2:
                            abPlaindata = _c.sent();
                            return [4 /*yield*/, this.encryptArrayBuffer(bKey, abPlaindata)];
                        case 3:
                            abCipherdata = _c.sent();
                            return [2 /*return*/, File.create({
                                    name: file.name,
                                    mimeType: (_b = file.mimeType) !== null && _b !== void 0 ? _b : 'application/octet-stream',
                                    data: abCipherdata,
                                })];
                    }
                });
            });
        };
        // endregion
        // --------------------------------------------------------
        // --------------------- Decryption -----------------------
        // --------------------------------------------------------
        // region Decryption
        /**
         * Decrypt provided encrypted data using specific decryption {@link key}.
         *
         * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` data.
         * @param input - Encrypted data for decryption.
         *
         * @returns Decrypted data as object or stream (depending on from encrypted data type).
         *
         * @throws Error if unknown data type has been passed.
         */
        WebCryptography.prototype.decrypt = function (key, input) {
            return __awaiter(this, void 0, void 0, function () {
                var cKey;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(input instanceof ArrayBuffer) && typeof input !== 'string')
                                throw new Error('Cannot decrypt this file. In browsers file decryption supports only string or ArrayBuffer');
                            return [4 /*yield*/, this.getKey(key)];
                        case 1:
                            cKey = _a.sent();
                            return [2 /*return*/, input instanceof ArrayBuffer ? this.decryptArrayBuffer(cKey, input) : this.decryptString(cKey, input)];
                    }
                });
            });
        };
        /**
         * Decrypt provided encrypted {@link ArrayBuffer} using specific decryption {@link key}.
         *
         * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` {@link ArrayBuffer}.
         * @param buffer - Encrypted {@link ArrayBuffer} for decryption.
         *
         * @returns Decrypted data as {@link ArrayBuffer} object.
         */
        WebCryptography.prototype.decryptArrayBuffer = function (key, buffer) {
            return __awaiter(this, void 0, void 0, function () {
                var abIv;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            abIv = buffer.slice(0, 16);
                            if (buffer.slice(WebCryptography.IV_LENGTH).byteLength <= 0)
                                throw new Error('decryption error: empty content');
                            return [4 /*yield*/, crypto.subtle.decrypt({ name: 'AES-CBC', iv: abIv }, key, buffer.slice(WebCryptography.IV_LENGTH))];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        /**
         * Decrypt provided encrypted {@link string} using specific decryption {@link key}.
         *
         * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` {@link string}.
         * @param text - Encrypted {@link string} for decryption.
         *
         * @returns Decrypted data as byte {@link string}.
         */
        WebCryptography.prototype.decryptString = function (key, text) {
            return __awaiter(this, void 0, void 0, function () {
                var abCiphertext, abIv, abPayload, abPlaintext;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            abCiphertext = WebCryptography.encoder.encode(text).buffer;
                            abIv = abCiphertext.slice(0, 16);
                            abPayload = abCiphertext.slice(16);
                            return [4 /*yield*/, crypto.subtle.decrypt({ name: 'AES-CBC', iv: abIv }, key, abPayload)];
                        case 1:
                            abPlaintext = _a.sent();
                            return [2 /*return*/, WebCryptography.decoder.decode(abPlaintext)];
                    }
                });
            });
        };
        /**
         * Decrypt provided {@link PubNub} File object using specific decryption {@link key}.
         *
         * @param key - Key for {@link PubNub} File object decryption. <br/>**Note:** Should be the same
         * as used to `encrypt` data.
         * @param file - Encrypted {@link PubNub} File object for decryption.
         * @param File - Class constructor for {@link PubNub} File object.
         *
         * @returns Decrypted data as {@link PubNub} File object.
         *
         * @throws Error if file is empty or contains unsupported data type.
         */
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
                                    mimeType: file.mimeType,
                                    data: abPlaindata,
                                })];
                    }
                });
            });
        };
        // endregion
        // --------------------------------------------------------
        // ----------------------- Helpers ------------------------
        // --------------------------------------------------------
        // region Helpers
        /**
         * Convert cipher key to the {@link Buffer}.
         *
         * @param key - String cipher key.
         *
         * @returns SHA256 HEX encoded cipher key {@link CryptoKey}.
         */
        WebCryptography.prototype.getKey = function (key) {
            return __awaiter(this, void 0, void 0, function () {
                var digest, hashHex, abKey;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, crypto.subtle.digest('SHA-256', WebCryptography.encoder.encode(key))];
                        case 1:
                            digest = _a.sent();
                            hashHex = Array.from(new Uint8Array(digest))
                                .map(function (b) { return b.toString(16).padStart(2, '0'); })
                                .join('');
                            abKey = WebCryptography.encoder.encode(hashHex.slice(0, 32)).buffer;
                            return [2 /*return*/, crypto.subtle.importKey('raw', abKey, 'AES-CBC', true, ['encrypt', 'decrypt'])];
                    }
                });
            });
        };
        /**
         * Random initialization vector size.
         */
        WebCryptography.IV_LENGTH = 16;
        /**
         * {@link string|String} to {@link ArrayBuffer} response decoder.
         */
        WebCryptography.encoder = new TextEncoder();
        /**
         *  {@link ArrayBuffer} to {@link string} decoder.
         */
        WebCryptography.decoder = new TextDecoder();
        return WebCryptography;
    }());

    /**
     * Legacy cryptor module.
     */
    /**
     * Legacy cryptor.
     */
    var LegacyCryptor = /** @class */ (function () {
        function LegacyCryptor(config) {
            this.config = config;
            this.cryptor = new default_1$3(__assign({}, config));
            this.fileCryptor = new WebCryptography();
        }
        // --------------------------------------------------------
        // --------------------- Encryption -----------------------
        // --------------------------------------------------------
        // region Encryption
        LegacyCryptor.prototype.encrypt = function (data) {
            var stringData = typeof data === 'string' ? data : LegacyCryptor.decoder.decode(data);
            return {
                data: LegacyCryptor.encoder.encode(this.cryptor.encrypt(stringData)),
                metadata: null,
            };
        };
        LegacyCryptor.prototype.encryptFile = function (file, File) {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    if (!this.config.cipherKey)
                        throw new PubNubError('File encryption error: cipher key not set.');
                    return [2 /*return*/, this.fileCryptor.encryptFile((_a = this.config) === null || _a === void 0 ? void 0 : _a.cipherKey, file, File)];
                });
            });
        };
        // endregion
        // --------------------------------------------------------
        // --------------------- Decryption -----------------------
        // --------------------------------------------------------
        // region Decryption
        LegacyCryptor.prototype.decrypt = function (encryptedData) {
            var data = typeof encryptedData.data === 'string' ? encryptedData.data : encode(encryptedData.data);
            return this.cryptor.decrypt(data);
        };
        LegacyCryptor.prototype.decryptFile = function (file, File) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (!this.config.cipherKey)
                        throw new PubNubError('File encryption error: cipher key not set.');
                    return [2 /*return*/, this.fileCryptor.decryptFile(this.config.cipherKey, file, File)];
                });
            });
        };
        Object.defineProperty(LegacyCryptor.prototype, "identifier", {
            // endregion
            // --------------------------------------------------------
            // ----------------------- Helpers ------------------------
            // --------------------------------------------------------
            // region Helpers
            get: function () {
                return '';
            },
            enumerable: false,
            configurable: true
        });
        /**
         * `string` to {@link ArrayBuffer} response decoder.
         */
        LegacyCryptor.encoder = new TextEncoder();
        /**
         *  {@link ArrayBuffer} to {@link string} decoder.
         */
        LegacyCryptor.decoder = new TextDecoder();
        return LegacyCryptor;
    }());

    /**
     * Browser crypto module.
     */
    /**
     * CryptoModule for browser platform.
     */
    var WebCryptoModule = /** @class */ (function (_super) {
        __extends(WebCryptoModule, _super);
        function WebCryptoModule() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        // --------------------------------------------------------
        // --------------- Convenience functions ------------------
        // -------------------------------------------------------
        // region Convenience functions
        WebCryptoModule.legacyCryptoModule = function (config) {
            var _a;
            if (!config.cipherKey)
                throw new PubNubError('Crypto module error: cipher key not set.');
            return new WebCryptoModule({
                default: new LegacyCryptor(__assign(__assign({}, config), { useRandomIVs: (_a = config.useRandomIVs) !== null && _a !== void 0 ? _a : true })),
                cryptors: [new AesCbcCryptor({ cipherKey: config.cipherKey })],
            });
        };
        WebCryptoModule.aesCbcCryptoModule = function (config) {
            var _a;
            if (!config.cipherKey)
                throw new PubNubError('Crypto module error: cipher key not set.');
            return new WebCryptoModule({
                default: new AesCbcCryptor({ cipherKey: config.cipherKey }),
                cryptors: [
                    new LegacyCryptor(__assign(__assign({}, config), { useRandomIVs: (_a = config.useRandomIVs) !== null && _a !== void 0 ? _a : true })),
                ],
            });
        };
        /**
         * Construct crypto module with `cryptor` as default for data encryption and decryption.
         *
         * @param defaultCryptor - Default cryptor for data encryption and decryption.
         *
         * @returns Crypto module with pre-configured default cryptor.
         */
        WebCryptoModule.withDefaultCryptor = function (defaultCryptor) {
            return new this({ default: defaultCryptor });
        };
        // endregion
        // --------------------------------------------------------
        // --------------------- Encryption -----------------------
        // --------------------------------------------------------
        // region Encryption
        WebCryptoModule.prototype.encrypt = function (data) {
            // Encrypt data.
            var encrypted = data instanceof ArrayBuffer && this.defaultCryptor.identifier === WebCryptoModule.LEGACY_IDENTIFIER
                ? this.defaultCryptor.encrypt(WebCryptoModule.decoder.decode(data))
                : this.defaultCryptor.encrypt(data);
            if (!encrypted.metadata)
                return encrypted.data;
            var headerData = this.getHeaderData(encrypted);
            return this.concatArrayBuffer(headerData, encrypted.data);
        };
        WebCryptoModule.prototype.encryptFile = function (file, File) {
            return __awaiter(this, void 0, void 0, function () {
                var fileData, encrypted;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            /**
                             * Files handled differently in case of Legacy cryptor.
                             * (as long as we support legacy need to check on instance type)
                             */
                            if (this.defaultCryptor.identifier === CryptorHeader.LEGACY_IDENTIFIER)
                                return [2 /*return*/, this.defaultCryptor.encryptFile(file, File)];
                            return [4 /*yield*/, this.getFileData(file)];
                        case 1:
                            fileData = _a.sent();
                            return [4 /*yield*/, this.defaultCryptor.encryptFileData(fileData)];
                        case 2:
                            encrypted = _a.sent();
                            return [2 /*return*/, File.create({
                                    name: file.name,
                                    mimeType: 'application/octet-stream',
                                    data: this.concatArrayBuffer(this.getHeaderData(encrypted), encrypted.data),
                                })];
                    }
                });
            });
        };
        // endregion
        // --------------------------------------------------------
        // --------------------- Decryption -----------------------
        // --------------------------------------------------------
        // region Decryption
        WebCryptoModule.prototype.decrypt = function (data) {
            var encryptedData = typeof data === 'string' ? decode(data) : data;
            var header = CryptorHeader.tryParse(encryptedData);
            var cryptor = this.getCryptor(header);
            var metadata = header.length > 0
                ? encryptedData.slice(header.length - header.metadataLength, header.length)
                : null;
            if (encryptedData.slice(header.length).byteLength <= 0)
                throw new Error('Decryption error: empty content');
            return cryptor.decrypt({
                data: encryptedData.slice(header.length),
                metadata: metadata,
            });
        };
        WebCryptoModule.prototype.decryptFile = function (file, File) {
            return __awaiter(this, void 0, void 0, function () {
                var data, header, cryptor, fileData, metadata, _a, _b;
                var _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, file.data.arrayBuffer()];
                        case 1:
                            data = _d.sent();
                            header = CryptorHeader.tryParse(data);
                            cryptor = this.getCryptor(header);
                            /**
                             * Files handled differently in case of Legacy cryptor.
                             * (as long as we support legacy need to check on instance type)
                             */
                            if ((cryptor === null || cryptor === void 0 ? void 0 : cryptor.identifier) === CryptorHeader.LEGACY_IDENTIFIER)
                                return [2 /*return*/, cryptor.decryptFile(file, File)];
                            return [4 /*yield*/, this.getFileData(data)];
                        case 2:
                            fileData = _d.sent();
                            metadata = fileData.slice(header.length - header.metadataLength, header.length);
                            _b = (_a = File).create;
                            _c = {
                                name: file.name
                            };
                            return [4 /*yield*/, this.defaultCryptor.decryptFileData({
                                    data: data.slice(header.length),
                                    metadata: metadata,
                                })];
                        case 3: return [2 /*return*/, _b.apply(_a, [(_c.data = _d.sent(),
                                    _c)])];
                    }
                });
            });
        };
        // endregion
        // --------------------------------------------------------
        // ----------------------- Helpers ------------------------
        // --------------------------------------------------------
        // region Helpers
        /**
         * Retrieve registered cryptor by its identifier.
         *
         * @param id - Unique cryptor identifier.
         *
         * @returns Registered cryptor with specified identifier.
         *
         * @throws Error if cryptor with specified {@link id} can't be found.
         */
        WebCryptoModule.prototype.getCryptorFromId = function (id) {
            var cryptor = this.getAllCryptors().find(function (cryptor) { return id === cryptor.identifier; });
            if (cryptor)
                return cryptor;
            throw Error('Unknown cryptor error');
        };
        /**
         * Retrieve cryptor by its identifier.
         *
         * @param header - Header with cryptor-defined data or raw cryptor identifier.
         *
         * @returns Cryptor which correspond to provided {@link header}.
         */
        WebCryptoModule.prototype.getCryptor = function (header) {
            if (typeof header === 'string') {
                var cryptor = this.getAllCryptors().find(function (cryptor) { return cryptor.identifier === header; });
                if (cryptor)
                    return cryptor;
                throw new Error('Unknown cryptor error');
            }
            else if (header instanceof CryptorHeaderV1) {
                return this.getCryptorFromId(header.identifier);
            }
        };
        /**
         * Create cryptor header data.
         *
         * @param encrypted - Encryption data object as source for header data.
         *
         * @returns Binary representation of the cryptor header data.
         */
        WebCryptoModule.prototype.getHeaderData = function (encrypted) {
            if (!encrypted.metadata)
                return;
            var header = CryptorHeader.from(this.defaultCryptor.identifier, encrypted.metadata);
            var headerData = new Uint8Array(header.length);
            var pos = 0;
            headerData.set(header.data, pos);
            pos += header.length - encrypted.metadata.byteLength;
            headerData.set(new Uint8Array(encrypted.metadata), pos);
            return headerData.buffer;
        };
        /**
         * Merge two {@link ArrayBuffer} instances.
         *
         * @param ab1 - First {@link ArrayBuffer}.
         * @param ab2 - Second {@link ArrayBuffer}.
         *
         * @returns Merged data as {@link ArrayBuffer}.
         */
        WebCryptoModule.prototype.concatArrayBuffer = function (ab1, ab2) {
            var tmp = new Uint8Array(ab1.byteLength + ab2.byteLength);
            tmp.set(new Uint8Array(ab1), 0);
            tmp.set(new Uint8Array(ab2), ab1.byteLength);
            return tmp.buffer;
        };
        /**
         * Retrieve file content.
         *
         * @param file - Content of the {@link PubNub} File object.
         *
         * @returns Normalized file {@link data} as {@link ArrayBuffer};
         */
        WebCryptoModule.prototype.getFileData = function (file) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (file instanceof ArrayBuffer)
                        return [2 /*return*/, file];
                    else if (file instanceof PubNubFile)
                        return [2 /*return*/, file.toArrayBuffer()];
                    throw new Error('Cannot decrypt/encrypt file. In browsers file encrypt/decrypt supported for string, ArrayBuffer or Blob');
                });
            });
        };
        /**
         * {@link LegacyCryptor|Legacy} cryptor identifier.
         */
        WebCryptoModule.LEGACY_IDENTIFIER = '';
        return WebCryptoModule;
    }(AbstractCryptoModule));
    /**
     * CryptorHeader Utility
     */
    var CryptorHeader = /** @class */ (function () {
        function CryptorHeader() {
        }
        CryptorHeader.from = function (id, metadata) {
            if (id === CryptorHeader.LEGACY_IDENTIFIER)
                return;
            return new CryptorHeaderV1(id, metadata.byteLength);
        };
        CryptorHeader.tryParse = function (data) {
            var encryptedData = new Uint8Array(data);
            var sentinel;
            var version = null;
            if (encryptedData.byteLength >= 4) {
                sentinel = encryptedData.slice(0, 4);
                if (this.decoder.decode(sentinel) !== CryptorHeader.SENTINEL)
                    return WebCryptoModule.LEGACY_IDENTIFIER;
            }
            if (encryptedData.byteLength >= 5)
                version = encryptedData[4];
            else
                throw new Error('Decryption error: invalid header version');
            if (version > CryptorHeader.MAX_VERSION)
                throw new Error('Decryption error: Unknown cryptor error');
            var identifier;
            var pos = 5 + CryptorHeader.IDENTIFIER_LENGTH;
            if (encryptedData.byteLength >= pos)
                identifier = encryptedData.slice(5, pos);
            else
                throw new Error('Decryption error: invalid crypto identifier');
            var metadataLength = null;
            if (encryptedData.byteLength >= pos + 1)
                metadataLength = encryptedData[pos];
            else
                throw new Error('Decryption error: invalid metadata length');
            pos += 1;
            if (metadataLength === 255 && encryptedData.byteLength >= pos + 2) {
                metadataLength = new Uint16Array(encryptedData.slice(pos, pos + 2)).reduce(function (acc, val) { return (acc << 8) + val; }, 0);
            }
            return new CryptorHeaderV1(this.decoder.decode(identifier), metadataLength);
        };
        CryptorHeader.SENTINEL = 'PNED';
        CryptorHeader.LEGACY_IDENTIFIER = '';
        CryptorHeader.IDENTIFIER_LENGTH = 4;
        CryptorHeader.VERSION = 1;
        CryptorHeader.MAX_VERSION = 1;
        CryptorHeader.decoder = new TextDecoder();
        return CryptorHeader;
    }());
    // v1 CryptorHeader
    var CryptorHeaderV1 = /** @class */ (function () {
        function CryptorHeaderV1(id, metadataLength) {
            this._identifier = id;
            this._metadataLength = metadataLength;
        }
        Object.defineProperty(CryptorHeaderV1.prototype, "identifier", {
            get: function () {
                return this._identifier;
            },
            set: function (value) {
                this._identifier = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(CryptorHeaderV1.prototype, "metadataLength", {
            get: function () {
                return this._metadataLength;
            },
            set: function (value) {
                this._metadataLength = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(CryptorHeaderV1.prototype, "version", {
            get: function () {
                return CryptorHeader.VERSION;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(CryptorHeaderV1.prototype, "length", {
            get: function () {
                return (CryptorHeader.SENTINEL.length +
                    1 +
                    CryptorHeader.IDENTIFIER_LENGTH +
                    (this.metadataLength < 255 ? 1 : 3) +
                    this.metadataLength);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(CryptorHeaderV1.prototype, "data", {
            get: function () {
                var pos = 0;
                var header = new Uint8Array(this.length);
                var encoder = new TextEncoder();
                header.set(encoder.encode(CryptorHeader.SENTINEL));
                pos += CryptorHeader.SENTINEL.length;
                header[pos] = this.version;
                pos++;
                if (this.identifier)
                    header.set(encoder.encode(this.identifier), pos);
                var metadataLength = this.metadataLength;
                pos += CryptorHeader.IDENTIFIER_LENGTH;
                if (metadataLength < 255)
                    header[pos] = metadataLength;
                else
                    header.set([255, metadataLength >> 8, metadataLength & 0xff], pos);
                return header;
            },
            enumerable: false,
            configurable: true
        });
        CryptorHeaderV1.IDENTIFIER_LENGTH = 4;
        CryptorHeaderV1.SENTINEL = 'PNED';
        return CryptorHeaderV1;
    }());

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

    var uuid = {exports: {}};

    /*! lil-uuid - v0.1 - MIT License - https://github.com/lil-js/uuid */
    uuid.exports;

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
    } (uuid, uuid.exports));

    var uuidExports = uuid.exports;
    var uuidGenerator$1 = /*@__PURE__*/getDefaultExportFromCjs(uuidExports);

    var uuidGenerator = {
        createUUID: function () {
            if (uuidGenerator$1.uuid) {
                return uuidGenerator$1.uuid();
            }
            return uuidGenerator$1();
        },
    };

    /**
     * {@link PubNub} client configuration module.
     */
    // --------------------------------------------------------
    // ----------------------- Defaults -----------------------
    // --------------------------------------------------------
    // region Defaults
    /**
     * Whether encryption (if set) should use random initialization vector or not.
     */
    var USE_RANDOM_INITIALIZATION_VECTOR = true;
    /**
     * Create {@link PubNub} client private configuration object.
     *
     * @param base - User- and platform-provided configuration.
     * @param setupCryptoModule - Platform-provided {@link CryptoModule} configuration block.
     *
     * @returns `PubNub` client private configuration.
     */
    var makeConfiguration = function (base, setupCryptoModule) {
        var _a, _b, _c;
        // Ensure that retry policy has proper configuration (if has been set).
        (_a = base.retryConfiguration) === null || _a === void 0 ? void 0 : _a.validate();
        (_b = base.useRandomIVs) !== null && _b !== void 0 ? _b : (base.useRandomIVs = USE_RANDOM_INITIALIZATION_VECTOR);
        // Override origin value.
        base.origin = standardOrigin((_c = base.ssl) !== null && _c !== void 0 ? _c : false, base.origin);
        var clientConfiguration = __assign(__assign({}, base), { _pnsdkSuffix: {}, _instanceId: "pn-".concat(uuidGenerator.createUUID()), _cryptoModule: undefined, _cipherKey: undefined, _setupCryptoModule: setupCryptoModule, get instanceId() {
                if (this.useInstanceId)
                    return this._instanceId;
                return undefined;
            }, getUserId: function () {
                return this.userId;
            }, setUserId: function (value) {
                if (!value || typeof value !== 'string' || value.trim().length === 0)
                    throw new Error('Missing or invalid userId parameter. Provide a valid string userId');
                this.userId = value;
            }, getAuthKey: function () {
                return this.authKey;
            }, setAuthKey: function (authKey) {
                this.authKey = authKey;
            }, getFilterExpression: function () {
                return this.filterExpression;
            }, setFilterExpression: function (expression) {
                this.filterExpression = expression;
            }, get cipherKey() {
                return this._cipherKey;
            }, setCipherKey: function (key) {
                this._cipherKey = key;
                if (!key && this._cryptoModule) {
                    this._cryptoModule = undefined;
                    return;
                }
                else if (!key || !this._setupCryptoModule)
                    return;
                this._cryptoModule = this._setupCryptoModule({
                    cipherKey: key,
                    useRandomIVs: base.useRandomIVs,
                    customEncrypt: this.customEncrypt,
                    customDecrypt: this.customDecrypt,
                });
            }, get cryptoModule() {
                return this._cryptoModule;
            },
            get useRandomIVs() {
                return base.useRandomIVs;
            }, getPresenceTimeout: function () {
                return this.presenceTimeout;
            }, getHeartbeatInterval: function () {
                return this.heartbeatInterval;
            }, setHeartbeatInterval: function (interval) {
                this.heartbeatInterval = interval;
            }, getTransactionTimeout: function () {
                return this.transactionalRequestTimeout;
            }, getSubscribeTimeout: function () {
                return this.subscribeRequestTimeout;
            }, get PubNubFile() {
                return base.PubNubFile;
            },
            get version() {
                return '7.6.0';
            }, getVersion: function () {
                return this.version;
            }, _addPnsdkSuffix: function (name, suffix) {
                this._pnsdkSuffix[name] = "".concat(suffix);
            }, _getPnsdkSuffix: function (separator) {
                return Object.values(this._pnsdkSuffix).join(separator);
            }, 
            // --------------------------------------------------------
            // ---------------------- Deprecated ----------------------
            // --------------------------------------------------------
            // region Deprecated
            getUUID: function () {
                return this.getUserId();
            }, setUUID: function (value) {
                this.setUserId(value);
            }, get customEncrypt() {
                return base.customEncrypt;
            },
            get customDecrypt() {
                return base.customDecrypt;
            } });
        // Setup `CryptoModule` if possible.
        if (base.cipherKey)
            clientConfiguration.setCipherKey(base.cipherKey);
        return clientConfiguration;
    };
    /**
     * Decide {@lin PubNub} service REST API origin.
     *
     * @param secure - Whether preferred to use secured connection or not.
     * @param origin - User-provided or default origin.
     *
     * @returns `PubNub` REST API endpoints origin.
     */
    var standardOrigin = function (secure, origin) {
        var protocol = secure ? 'https://' : 'http://';
        if (typeof origin === 'string')
            return "".concat(protocol).concat(origin);
        return "".concat(protocol).concat(origin[Math.floor(Math.random() * origin.length)]);
    };

    /**
     * {@link PubNub} client configuration module.
     */
    // --------------------------------------------------------
    // ----------------------- Defaults -----------------------
    // --------------------------------------------------------
    // region Defaults
    /**
     * Whether secured connection should be used by or not.
     */
    var USE_SSL = true;
    /**
     * Whether PubNub client should catch up subscription after network issues.
     */
    var RESTORE = false;
    /**
     * Whether network availability change should be announced with `PNNetworkDownCategory` and
     * `PNNetworkUpCategory` state or not.
     */
    var AUTO_NETWORK_DETECTION = false;
    /**
     * Whether messages should be de-duplicated before announcement or not.
     */
    var DEDUPE_ON_SUBSCRIBE = false;
    /**
     * Maximum cache which should be used for message de-duplication functionality.
     */
    var DEDUPE_CACHE_SIZE = 100;
    /**
     * Maximum number of file message publish retries.
     */
    var FILE_PUBLISH_RETRY_LIMIT = 5;
    /**
     * Whether subscription event engine should be used or not.
     */
    var ENABLE_EVENT_ENGINE = false;
    /**
     * Whether configured user presence state should be maintained by the PubNub client or not.
     */
    var MAINTAIN_PRESENCE_STATE = true;
    /**
     * Whether PubNub client should try to utilize existing TCP connection for new requests or not.
     */
    var KEEP_ALIVE$1 = false;
    /**
     * Whether verbose logging should be enabled or not.
     */
    var USE_VERBOSE_LOGGING = false;
    /**
     * Whether leave events should be suppressed or not.
     */
    var SUPPRESS_LEAVE_EVENTS = false;
    /**
     * Whether heartbeat request failure should be announced or not.
     */
    var ANNOUNCE_HEARTBEAT_FAILURE = true;
    /**
     * Whether heartbeat request success should be announced or not.
     */
    var ANNOUNCE_HEARTBEAT_SUCCESS = false;
    /**
     * Whether PubNub client instance id should be added to the requests or not.
     */
    var USE_INSTANCE_ID = false;
    /**
     * Whether unique identifier should be added to the request or not.
     */
    var USE_REQUEST_ID = false;
    /**
     * Transactional requests timeout.
     */
    var TRANSACTIONAL_REQUEST_TIMEOUT = 15;
    /**
     * Subscription request timeout.
     */
    var SUBSCRIBE_REQUEST_TIMEOUT = 310;
    /**
     * Default user presence timeout.
     */
    var PRESENCE_TIMEOUT = 300;
    /**
     * Minimum user presence timeout.
     */
    var PRESENCE_TIMEOUT_MINIMUM = 20;
    /**
     * Apply configuration default values.
     *
     * @param configuration - User-provided configuration.
     */
    var setDefaults$1 = function (configuration) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        // Copy configuration.
        var configurationCopy = __assign({}, configuration);
        (_a = configurationCopy.logVerbosity) !== null && _a !== void 0 ? _a : (configurationCopy.logVerbosity = USE_VERBOSE_LOGGING);
        (_b = configurationCopy.ssl) !== null && _b !== void 0 ? _b : (configurationCopy.ssl = USE_SSL);
        (_c = configurationCopy.transactionalRequestTimeout) !== null && _c !== void 0 ? _c : (configurationCopy.transactionalRequestTimeout = TRANSACTIONAL_REQUEST_TIMEOUT);
        (_d = configurationCopy.subscribeRequestTimeout) !== null && _d !== void 0 ? _d : (configurationCopy.subscribeRequestTimeout = SUBSCRIBE_REQUEST_TIMEOUT);
        (_e = configurationCopy.restore) !== null && _e !== void 0 ? _e : (configurationCopy.restore = RESTORE);
        (_f = configurationCopy.useInstanceId) !== null && _f !== void 0 ? _f : (configurationCopy.useInstanceId = USE_INSTANCE_ID);
        (_g = configurationCopy.suppressLeaveEvents) !== null && _g !== void 0 ? _g : (configurationCopy.suppressLeaveEvents = SUPPRESS_LEAVE_EVENTS);
        (_h = configurationCopy.requestMessageCountThreshold) !== null && _h !== void 0 ? _h : (configurationCopy.requestMessageCountThreshold = DEDUPE_CACHE_SIZE);
        (_j = configurationCopy.autoNetworkDetection) !== null && _j !== void 0 ? _j : (configurationCopy.autoNetworkDetection = AUTO_NETWORK_DETECTION);
        (_k = configurationCopy.enableEventEngine) !== null && _k !== void 0 ? _k : (configurationCopy.enableEventEngine = ENABLE_EVENT_ENGINE);
        (_l = configurationCopy.maintainPresenceState) !== null && _l !== void 0 ? _l : (configurationCopy.maintainPresenceState = MAINTAIN_PRESENCE_STATE);
        (_m = configurationCopy.keepAlive) !== null && _m !== void 0 ? _m : (configurationCopy.keepAlive = KEEP_ALIVE$1);
        // Generate default origin subdomains.
        if (!configurationCopy.origin)
            configurationCopy.origin = Array.from({ length: 20 }, function (_, i) { return "ps".concat(i + 1, ".pndsn.com"); });
        var keySet = {
            subscribeKey: configurationCopy.subscribeKey,
            publishKey: configurationCopy.publishKey,
            secretKey: configurationCopy.secretKey,
        };
        if (configurationCopy.presenceTimeout && configurationCopy.presenceTimeout < PRESENCE_TIMEOUT_MINIMUM) {
            configurationCopy.presenceTimeout = PRESENCE_TIMEOUT_MINIMUM;
            // eslint-disable-next-line no-console
            console.log('WARNING: Presence timeout is less than the minimum. Using minimum value: ', PRESENCE_TIMEOUT_MINIMUM);
        }
        if (configurationCopy.presenceTimeout) {
            configurationCopy.heartbeatInterval = configurationCopy.presenceTimeout / 2 - 1;
        }
        else
            configurationCopy.presenceTimeout = PRESENCE_TIMEOUT;
        // Apply extended configuration defaults.
        var announceSuccessfulHeartbeats = ANNOUNCE_HEARTBEAT_SUCCESS;
        var announceFailedHeartbeats = ANNOUNCE_HEARTBEAT_FAILURE;
        var fileUploadPublishRetryLimit = FILE_PUBLISH_RETRY_LIMIT;
        var dedupeOnSubscribe = DEDUPE_ON_SUBSCRIBE;
        var maximumCacheSize = DEDUPE_CACHE_SIZE;
        var useRequestId = USE_REQUEST_ID;
        // @ts-expect-error Not documented legacy configuration options.
        if (configurationCopy.dedupeOnSubscribe && typeof configurationCopy.dedupeOnSubscribe === 'boolean') {
            // @ts-expect-error Not documented legacy configuration options.
            dedupeOnSubscribe = configurationCopy.dedupeOnSubscribe;
        }
        // @ts-expect-error Not documented legacy configuration options.
        if (configurationCopy.useRequestId && typeof configurationCopy.useRequestId === 'boolean') {
            // @ts-expect-error Not documented legacy configuration options.
            useRequestId = configurationCopy.useRequestId;
        }
        if (
        // @ts-expect-error Not documented legacy configuration options.
        configurationCopy.announceSuccessfulHeartbeats &&
            // @ts-expect-error Not documented legacy configuration options.
            typeof configurationCopy.announceSuccessfulHeartbeats === 'boolean') {
            // @ts-expect-error Not documented legacy configuration options.
            announceSuccessfulHeartbeats = configurationCopy.announceSuccessfulHeartbeats;
        }
        // @ts-expect-error Not documented legacy configuration options.
        if (configurationCopy.announceFailedHeartbeats && typeof configurationCopy.announceFailedHeartbeats === 'boolean') {
            // @ts-expect-error Not documented legacy configuration options.
            announceFailedHeartbeats = configurationCopy.announceFailedHeartbeats;
        }
        if (
        // @ts-expect-error Not documented legacy configuration options.
        configurationCopy.fileUploadPublishRetryLimit &&
            // @ts-expect-error Not documented legacy configuration options.
            typeof configurationCopy.fileUploadPublishRetryLimit === 'number') {
            // @ts-expect-error Not documented legacy configuration options.
            fileUploadPublishRetryLimit = configurationCopy.fileUploadPublishRetryLimit;
        }
        return __assign(__assign({}, configurationCopy), { keySet: keySet, dedupeOnSubscribe: dedupeOnSubscribe, maximumCacheSize: maximumCacheSize, useRequestId: useRequestId, announceSuccessfulHeartbeats: announceSuccessfulHeartbeats, announceFailedHeartbeats: announceFailedHeartbeats, fileUploadPublishRetryLimit: fileUploadPublishRetryLimit });
    };

    // --------------------------------------------------------
    // ----------------------- Defaults -----------------------
    // --------------------------------------------------------
    // region Defaults
    /**
     * Whether PubNub client should update its state using browser's reachability events or not.
     *
     * If the browser fails to detect the network changes from Wi-Fi to LAN and vice versa, or you get
     * reconnection issues, set the flag to `false`. This allows the SDK reconnection logic to take over.
     */
    var LISTEN_TO_BROWSER_NETWORK_EVENTS = true;
    /**
     * Whether PubNub client should try utilize existing TCP connection for new requests or not.
     */
    var KEEP_ALIVE = true;
    /**
     * Apply configuration default values.
     *
     * @param configuration - User-provided configuration.
     */
    var setDefaults = function (configuration) {
        var _a, _b;
        return __assign(__assign({}, setDefaults$1(configuration)), { 
            // Set platform-specific options.
            listenToBrowserNetworkEvents: (_a = configuration.listenToBrowserNetworkEvents) !== null && _a !== void 0 ? _a : LISTEN_TO_BROWSER_NETWORK_EVENTS, keepAlive: (_b = configuration.keepAlive) !== null && _b !== void 0 ? _b : KEEP_ALIVE });
    };

    var default_1$2 = /** @class */ (function () {
        function default_1(cbor) {
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

    /**
     * Enum representing possible transport methods for HTTP requests.
     *
     * @enum {number}
     */
    var TransportMethod;
    (function (TransportMethod) {
        /**
         * Request will be sent using `GET` method.
         */
        TransportMethod["GET"] = "GET";
        /**
         * Request will be sent using `POST` method.
         */
        TransportMethod["POST"] = "POST";
        /**
         * Request will be sent using `PATCH` method.
         */
        TransportMethod["PATCH"] = "PATCH";
        /**
         * Request will be sent using `DELETE` method.
         */
        TransportMethod["DELETE"] = "DELETE";
        /**
         * Local request.
         *
         * Request won't be sent to the service and probably used to compute URL.
         */
        TransportMethod["LOCAL"] = "LOCAL";
    })(TransportMethod || (TransportMethod = {}));

    /**
     * Percent-encode input string.
     *
     * **Note:** Encode content in accordance of the `PubNub` service requirements.
     *
     * @param input - Source string or number for encoding.
     *
     * @returns Percent-encoded string.
     */
    var encodeString = function (input) {
        return encodeURIComponent(input).replace(/[!~*'()]/g, function (x) { return "%".concat(x.charCodeAt(0).toString(16).toUpperCase()); });
    };
    var removeSingleOccurance = function (source, elementsToRemove) {
        var removed = Object.fromEntries(elementsToRemove.map(function (prop) { return [prop, false]; }));
        return source.filter(function (e) {
            if (elementsToRemove.includes(e) && !removed[e]) {
                removed[e] = true;
                return false;
            }
            return true;
        });
    };
    var findUniqueCommonElements = function (a, b) {
        return __spreadArray([], __read(a), false).filter(function (value) {
            return b.includes(value) && a.indexOf(value) === a.lastIndexOf(value) && b.indexOf(value) === b.lastIndexOf(value);
        });
    };

    var RequestSignature = /** @class */ (function () {
        function RequestSignature(publishKey, secretKey, hasher) {
            this.publishKey = publishKey;
            this.secretKey = secretKey;
            this.hasher = hasher;
        }
        /**
         * Compute request signature.
         *
         * @param req - Request which will be used to compute signature.
         * @returns {string} `v2` request signature.
         */
        RequestSignature.prototype.signature = function (req) {
            var method = req.path.startsWith('/publish') ? TransportMethod.GET : req.method;
            var signatureInput = "".concat(method, "\n").concat(this.publishKey, "\n").concat(req.path, "\n").concat(this.queryParameters(req.queryParameters), "\n");
            if (method === TransportMethod.POST || method === TransportMethod.PATCH) {
                var body = req.body;
                var payload = void 0;
                if (body && body instanceof ArrayBuffer) {
                    payload = RequestSignature.textDecoder.decode(body);
                }
                else if (body && typeof body !== 'object') {
                    payload = body;
                }
                if (payload)
                    signatureInput += payload;
            }
            return "v2.".concat(this.hasher(signatureInput, this.secretKey))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
        };
        /**
         * Prepare request query parameters for signature.
         *
         * @param query - Key / value pair of the request query parameters.
         * @private
         */
        RequestSignature.prototype.queryParameters = function (query) {
            return Object.keys(query)
                .sort()
                .map(function (key) {
                var queryValue = query[key];
                if (!Array.isArray(queryValue))
                    return "".concat(key, "=").concat(encodeString(queryValue));
                return queryValue
                    .sort()
                    .map(function (value) { return "".concat(key, "=").concat(encodeString(value)); })
                    .join('&');
            })
                .join('&');
        };
        RequestSignature.textDecoder = new TextDecoder('utf-8');
        return RequestSignature;
    }());
    var PubNubMiddleware = /** @class */ (function () {
        function PubNubMiddleware(configuration) {
            this.configuration = configuration;
            var keySet = configuration.clientConfiguration.keySet, shaHMAC = configuration.shaHMAC;
            if (keySet.secretKey && shaHMAC)
                this.signatureGenerator = new RequestSignature(keySet.publishKey, keySet.secretKey, shaHMAC);
        }
        PubNubMiddleware.prototype.makeSendable = function (req) {
            return this.configuration.transport.makeSendable(this.request(req));
        };
        PubNubMiddleware.prototype.request = function (req) {
            var _a;
            var clientConfiguration = this.configuration.clientConfiguration;
            if (!req.queryParameters)
                req.queryParameters = {};
            // Modify request with required information.
            if (clientConfiguration.useInstanceId)
                req.queryParameters['instanceid'] = clientConfiguration.instanceId;
            if (!req.queryParameters['uuid'])
                req.queryParameters['uuid'] = clientConfiguration.userId;
            req.queryParameters['requestid'] = req.identifier;
            req.queryParameters['pnsdk'] = this.generatePNSDK();
            (_a = req.origin) !== null && _a !== void 0 ? _a : (req.origin = clientConfiguration.origin);
            // Authenticate request if required.
            this.authenticateRequest(req);
            // Sign request if it is required.
            this.signRequest(req);
            return req;
        };
        PubNubMiddleware.prototype.authenticateRequest = function (req) {
            var _a;
            // Access management endpoints doesn't need authentication (signature required instead).
            if (req.path.startsWith('/v2/auth/') || req.path.startsWith('/v3/pam/') || req.path.startsWith('/time'))
                return;
            var _b = this.configuration, clientConfiguration = _b.clientConfiguration, tokenManager = _b.tokenManager;
            var accessKey = (_a = tokenManager.getToken()) !== null && _a !== void 0 ? _a : clientConfiguration.authKey;
            if (accessKey)
                req.queryParameters['auth'] = accessKey;
        };
        /**
         * Compute and append request signature.
         *
         * @param req - Transport request with information which should be used to generate signature.
         */
        PubNubMiddleware.prototype.signRequest = function (req) {
            if (!this.signatureGenerator || req.path.startsWith('/time'))
                return;
            req.queryParameters['timestamp'] = String(Math.floor(new Date().getTime() / 1000));
            req.queryParameters['signature'] = this.signatureGenerator.signature(req);
        };
        /**
         * Compose `pnsdk` query parameter.
         *
         * SDK provides ability to set custom name or append vendor information to the `pnsdk` query
         * parameter.
         *
         * @returns Finalized `pnsdk` query parameter value.
         */
        PubNubMiddleware.prototype.generatePNSDK = function () {
            var clientConfiguration = this.configuration.clientConfiguration;
            if (clientConfiguration.sdkName)
                return clientConfiguration.sdkName;
            var base = "PubNub-JS-".concat(clientConfiguration.sdkFamily);
            if (clientConfiguration.partnerId)
                base += "-".concat(clientConfiguration.partnerId);
            base += "/".concat(clientConfiguration.version);
            var pnsdkSuffix = clientConfiguration._getPnsdkSuffix(' ');
            if (pnsdkSuffix.length > 0)
                base += pnsdkSuffix;
            return base;
        };
        return PubNubMiddleware;
    }());

    /**
     * Request processing status categories.
     */
    var StatusCategory;
    (function (StatusCategory) {
        /**
         * Call failed when network was unable to complete the call.
         */
        StatusCategory["PNNetworkIssuesCategory"] = "PNNetworkIssuesCategory";
        /**
         * Network call timed out.
         */
        StatusCategory["PNTimeoutCategory"] = "PNTimeoutCategory";
        /**
         * Request has been cancelled.
         */
        StatusCategory["PNCancelledCategory"] = "PNCancelledCategory";
        /**
         * Server responded with bad response.
         */
        StatusCategory["PNBadRequestCategory"] = "PNBadRequestCategory";
        /**
         * Server responded with access denied.
         */
        StatusCategory["PNAccessDeniedCategory"] = "PNAccessDeniedCategory";
        /**
         * Something strange happened; please check the logs.
         */
        StatusCategory["PNUnknownCategory"] = "PNUnknownCategory";
        // --------------------------------------------------------
        // --------------------- Network status -------------------
        // --------------------------------------------------------
        /**
         * SDK will announce when the network appears to be connected again.
         */
        StatusCategory["PNNetworkUpCategory"] = "PNNetworkUpCategory";
        /**
         * SDK will announce when the network appears to down.
         */
        StatusCategory["PNNetworkDownCategory"] = "PNNetworkDownCategory";
        // --------------------------------------------------------
        // -------------------- Real-time events ------------------
        // --------------------------------------------------------
        /**
         * PubNub client reconnected to the real-time updates stream.
         */
        StatusCategory["PNReconnectedCategory"] = "PNReconnectedCategory";
        /**
         * PubNub client connected to the real-time updates stream.
         */
        StatusCategory["PNConnectedCategory"] = "PNConnectedCategory";
        /**
         * Received real-time updates exceed specified threshold.
         *
         * After temporary disconnection and catchup, this category means that potentially some
         * real-time updates have been pushed into `storage` and need to be requested separately.
         */
        StatusCategory["PNRequestMessageCountExceededCategory"] = "PNRequestMessageCountExceededCategory";
        /**
         * PubNub client disconnected from the real-time updates streams.
         */
        StatusCategory["PNDisconnectedCategory"] = "PNDisconnectedCategory";
        /**
         * PubNub client wasn't able to connect to the real-time updates streams.
         */
        StatusCategory["PNConnectionErrorCategory"] = "PNConnectionErrorCategory";
        /**
         * PubNub client unexpectedly disconnected from the real-time updates streams.
         */
        StatusCategory["PNDisconnectedUnexpectedlyCategory"] = "PNDisconnectedUnexpectedlyCategory";
    })(StatusCategory || (StatusCategory = {}));
    var StatusCategory$1 = StatusCategory;

    // PubNub client API common types.
    /**
     * PubNub REST API call error.
     */
    var PubNubAPIError = /** @class */ (function (_super) {
        __extends(PubNubAPIError, _super);
        /**
         * Construct PubNub endpoint error.
         *
         * @param message - Short API call error description.
         * @param category - Error category.
         * @param statusCode - Response HTTP status code.
         * @param errorData - Error information.
         */
        function PubNubAPIError(message, category, statusCode, errorData) {
            var _this = _super.call(this, message) || this;
            _this.category = category;
            _this.statusCode = statusCode;
            _this.errorData = errorData;
            _this.name = _this.constructor.name;
            return _this;
        }
        /**
         * Construct API from known error object or {@link PubNub} service error response.
         *
         * @param errorOrResponse - `Error` or service error response object from which error information
         * should be extracted.
         * @param data - Preprocessed service error response.
         *
         * @returns `PubNubAPIError` object with known error category and additional information (if
         * available).
         */
        PubNubAPIError.create = function (errorOrResponse, data) {
            if (errorOrResponse instanceof Error)
                return PubNubAPIError.createFromError(errorOrResponse);
            else
                return PubNubAPIError.createFromServiceResponse(errorOrResponse, data);
        };
        /**
         * Create API error instance from other error object.
         *
         * @param error - `Error` object provided by network provider (mostly) or other {@link PubNub} client components.
         *
         * @returns `PubNubAPIError` object with known error category and additional information (if
         * available).
         */
        PubNubAPIError.createFromError = function (error) {
            var category = StatusCategory$1.PNUnknownCategory;
            var message = 'Unknown error';
            var errorName = 'Error';
            if (!error)
                return new PubNubAPIError(message, category, 0);
            if (error instanceof Error) {
                message = error.message;
                errorName = error.name;
            }
            if (errorName === 'AbortError') {
                category = StatusCategory$1.PNCancelledCategory;
                message = 'Request cancelled';
            }
            else if (errorName === 'FetchError') {
                var errorCode = error.code;
                if (errorCode in ['ECONNREFUSED', 'ENOTFOUND', 'ECONNRESET', 'EAI_AGAIN'])
                    category = StatusCategory$1.PNNetworkIssuesCategory;
                if (errorCode === 'ECONNREFUSED')
                    message = 'Connection refused';
                else if (errorCode === 'ENOTFOUND')
                    message = 'Server not found';
                else if (errorCode === 'ECONNRESET')
                    message = 'Connection reset by peer';
                else if (errorCode === 'EAI_AGAIN')
                    message = 'Name resolution error';
                else if (errorCode === 'ETIMEDOUT') {
                    category = StatusCategory$1.PNTimeoutCategory;
                    message = 'Request timeout';
                }
                else
                    message = "Unknown system error: ".concat(error);
            }
            else if (message === 'Request timeout')
                category = StatusCategory$1.PNTimeoutCategory;
            return new PubNubAPIError(message, category, 0, error);
        };
        /**
         * Construct API from known {@link PubNub} service error response.
         *
         * @param response - Service error response object from which error information should be
         * extracted.
         * @param data - Preprocessed service error response.
         *
         * @returns `PubNubAPIError` object with known error category and additional information (if
         * available).
         */
        PubNubAPIError.createFromServiceResponse = function (response, data) {
            var category = StatusCategory$1.PNUnknownCategory;
            var errorData;
            var message = 'Unknown error';
            var status = response.status;
            if (status === 402)
                message = 'Not available for used key set. Contact support@pubnub.com';
            else if (status === 400) {
                category = StatusCategory$1.PNBadRequestCategory;
                message = 'Bad request';
            }
            else if (status === 403) {
                category = StatusCategory$1.PNAccessDeniedCategory;
                message = 'Access denied';
            }
            // Try get more information about error from service response.
            if (data && data.byteLength > 0) {
                var decoded = new TextDecoder().decode(data);
                if (response.headers['content-type'].includes('application/json')) {
                    try {
                        var errorResponse = JSON.parse(decoded);
                        if (typeof errorResponse === 'object' && !Array.isArray(errorResponse)) {
                            if ('error' in errorResponse &&
                                errorResponse.error === 1 &&
                                'status' in errorResponse &&
                                typeof errorResponse.status === 'number' &&
                                'message' in errorResponse &&
                                'service' in errorResponse) {
                                errorData = errorResponse;
                                status = errorResponse.status;
                            }
                            if ('error' in errorResponse &&
                                typeof errorResponse.error === 'object' &&
                                !Array.isArray(errorResponse.error) &&
                                'message' in errorResponse.error) {
                                errorData = errorResponse.error;
                            }
                        }
                    }
                    catch (_) {
                        errorData = decoded;
                    }
                }
                else
                    errorData = decoded;
            }
            return new PubNubAPIError(message, category, status, errorData);
        };
        /**
         * Convert API error object to API callback status object.
         *
         * @param operation - Request operation during which error happened.
         *
         * @returns Pre-formatted API callback status object.
         */
        PubNubAPIError.prototype.toStatus = function (operation) {
            return {
                error: true,
                category: this.category,
                operation: operation,
                statusCode: this.statusCode,
                errorData: this.errorData,
            };
        };
        return PubNubAPIError;
    }(Error));

    /* global window */
    /**
     * Web Transport provider module.
     */
    /**
     * Class representing a fetch-based Web Worker transport provider.
     */
    var WebTransport = /** @class */ (function () {
        function WebTransport(keepAlive, logVerbosity) {
            if (keepAlive === void 0) { keepAlive = false; }
            this.keepAlive = keepAlive;
            this.logVerbosity = logVerbosity;
            this.setupWorker();
        }
        WebTransport.prototype.makeSendable = function (req) {
            var _this = this;
            var controller;
            var sendRequestEvent = {
                type: 'send-request',
                request: req,
            };
            if (req.cancellable) {
                controller = {
                    abort: function () {
                        var cancelRequest = {
                            type: 'cancel-request',
                            identifier: req.identifier,
                        };
                        // Cancel active request with specified identifier.
                        _this.worker.postMessage(cancelRequest);
                    },
                };
            }
            return [
                new Promise(function (resolve, reject) {
                    // Associate Promise resolution / reject with request identifier for future usage in
                    // `onmessage` handler block to return results.
                    _this.callbacks.set(req.identifier, { resolve: resolve, reject: reject });
                    // Trigger request processing by Web Worker.
                    _this.worker.postMessage(sendRequestEvent);
                }),
                controller,
            ];
        };
        WebTransport.prototype.request = function (req) {
            return req;
        };
        /**
         * Complete PubNub Web Worker setup.
         */
        WebTransport.prototype.setupWorker = function () {
            var _this = this;
            this.worker = new Worker(URL.createObjectURL(new Blob(["/**\n * Web Worker module.\n */\nvar __assign = (this && this.__assign) || function () {\n    __assign = Object.assign || function(t) {\n        for (var s, i = 1, n = arguments.length; i < n; i++) {\n            s = arguments[i];\n            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))\n                t[p] = s[p];\n        }\n        return t;\n    };\n    return __assign.apply(this, arguments);\n};\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nvar __generator = (this && this.__generator) || function (thisArg, body) {\n    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;\n    return g = { next: verb(0), \"throw\": verb(1), \"return\": verb(2) }, typeof Symbol === \"function\" && (g[Symbol.iterator] = function() { return this; }), g;\n    function verb(n) { return function (v) { return step([n, v]); }; }\n    function step(op) {\n        if (f) throw new TypeError(\"Generator is already executing.\");\n        while (g && (g = 0, op[0] && (_ = 0)), _) try {\n            if (f = 1, y && (t = op[0] & 2 ? y[\"return\"] : op[0] ? y[\"throw\"] || ((t = y[\"return\"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;\n            if (y = 0, t) op = [op[0] & 2, t.value];\n            switch (op[0]) {\n                case 0: case 1: t = op; break;\n                case 4: _.label++; return { value: op[1], done: false };\n                case 5: _.label++; y = op[1]; op = [0]; continue;\n                case 7: op = _.ops.pop(); _.trys.pop(); continue;\n                default:\n                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }\n                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }\n                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }\n                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }\n                    if (t[2]) _.ops.pop();\n                    _.trys.pop(); continue;\n            }\n            op = body.call(thisArg, _);\n        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }\n        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };\n    }\n};\n// endregion\n// endregion\n/**\n * Map of request identifiers to their abort controllers.\n *\n * **Note:** Because of message-based nature of interaction it will be impossible to pass actual {@link AbortController}\n * to the transport provider code.\n */\nvar abortControllers = new Map();\n/**\n * Service `ArrayBuffer` response decoder.\n */\nvar decoder = new TextDecoder();\n/**\n * Whether verbose logging enabled or not.\n */\nvar logVerbosity = false;\n/**\n * If set to `true`, SDK will use the same TCP connection for each HTTP request, instead of\n * opening a new one for each new request.\n *\n * @default `true`\n */\nvar keepAlive = true;\n// --------------------------------------------------------\n// ------------------- Event Handlers ---------------------\n// --------------------------------------------------------\n// region Event Handlers\n/**\n * Handle signals from the PubNub core.\n *\n * @param event - Event object from the PubNub Core with instructions for worker.\n */\nself.onmessage = function (event) {\n    var data = event.data;\n    if (data.type === 'setup') {\n        logVerbosity = data.logVerbosity;\n        keepAlive = data.keepAlive;\n    }\n    else if (data.type === 'send-request') {\n        sendRequestEventHandler(data.request);\n    }\n    if (data.type === 'cancel-request') {\n        var controller = abortControllers.get(data.identifier);\n        // Abort request if possible.\n        if (controller) {\n            abortControllers.delete(data.identifier);\n            controller.abort();\n        }\n    }\n    event.data;\n};\n/**\n * Handle request send event.\n *\n * @param req - Data for {@link Request} creation and scheduling.\n */\nvar sendRequestEventHandler = function (req) {\n    (function () { return __awaiter(void 0, void 0, void 0, function () {\n        var request, timestamp, start, requestTimeout;\n        var _a;\n        return __generator(this, function (_b) {\n            switch (_b.label) {\n                case 0: return [4 /*yield*/, requestFromTransportRequest(req)];\n                case 1:\n                    request = _b.sent();\n                    timestamp = new Date().toISOString();\n                    start = new Date().getTime();\n                    if (req.cancellable)\n                        abortControllers.set(req.identifier, new AbortController());\n                    requestTimeout = new Promise(function (_, reject) {\n                        var timeoutId = setTimeout(function () {\n                            // Clean up.\n                            abortControllers.delete(req.identifier);\n                            clearTimeout(timeoutId);\n                            reject(new Error('Request timeout'));\n                        }, req.timeout * 1000);\n                    });\n                    if (logVerbosity)\n                        notifyRequestProcessing('start', request, timestamp, req.queryParameters);\n                    Promise.race([\n                        fetch(request, { signal: (_a = abortControllers.get(req.identifier)) === null || _a === void 0 ? void 0 : _a.signal, keepalive: keepAlive }),\n                        requestTimeout,\n                    ])\n                        .then(function (response) {\n                        if (parseInt(response.headers.get('Content-Length'), 10) > 0) {\n                            return response.arrayBuffer().then(function (buffer) { return [response, buffer]; });\n                        }\n                        return [response, undefined];\n                    })\n                        .then(function (response) {\n                        if (logVerbosity) {\n                            var contentType = response[0].headers.get('Content-Type');\n                            var timestampDone = new Date().toISOString();\n                            var now = new Date().getTime();\n                            var elapsed = now - start;\n                            var body = void 0;\n                            if (contentType &&\n                                (contentType.includes('application/json') ||\n                                    contentType.includes('text/plain') ||\n                                    contentType.includes('text/html'))) {\n                                body = decoder.decode(response[1]);\n                            }\n                            notifyRequestProcessing('end', request, timestampDone, req.queryParameters, body, elapsed);\n                        }\n                        // Treat 4xx and 5xx status codes as errors.\n                        if (response[0].status >= 400)\n                            postMessage(requestProcessingError(req.identifier, request.url, undefined, response));\n                        else\n                            postMessage(requestProcessingSuccess(req.identifier, request.url, response));\n                    })\n                        .catch(function (error) { return postMessage(requestProcessingError(error, request.url)); });\n                    return [2 /*return*/];\n            }\n        });\n    }); })();\n};\n// endregion\n// --------------------------------------------------------\n// ----------------------- Helpers ------------------------\n// --------------------------------------------------------\n// region Helpers\nvar notifyRequestProcessing = function (type, request, timestamp, query, response, duration) {\n    var event;\n    var url = request.url.split('?')[0];\n    if (type === 'start') {\n        event = {\n            type: 'request-progress-start',\n            url: url,\n            query: query,\n            timestamp: timestamp,\n        };\n    }\n    else {\n        event = {\n            type: 'request-progress-end',\n            url: url,\n            query: query,\n            response: response,\n            timestamp: timestamp,\n            duration: duration,\n        };\n    }\n    postMessage(event);\n};\n/**\n * Create processing success event from service response.\n *\n * @param identifier - Identifier of the processed request.\n * @param url - Url which has been used to perform request.\n * @param res - Service response for used REST API endpoint along with response body.\n *\n * @returns Request processing success event object.\n */\nvar requestProcessingSuccess = function (identifier, url, res) {\n    var response = res[0], body = res[1];\n    var contentLength = parseInt(response.headers.get('Content-Length'), 10);\n    var contentType = response.headers.get('Content-Type');\n    var headers = {};\n    // Copy Headers object content into plain Record.\n    response.headers.forEach(function (value, key) { return (headers[key] = value.toLowerCase()); });\n    return {\n        type: 'request-process-success',\n        identifier: identifier,\n        url: url,\n        response: {\n            contentLength: contentLength,\n            contentType: contentType,\n            headers: headers,\n            status: response.status,\n            body: body,\n        },\n    };\n};\n/**\n * Create processing error event from service response.\n *\n * @param identifier - Identifier of the failed request.\n * @param url - Url which has been used to perform request.\n * @param [error] - Client-side request processing error (for example network issues).\n * @param [res] - Service error response (for example permissions error or malformed\n * payload) along with service body.\n *\n * @returns Request processing error event object.\n */\nvar requestProcessingError = function (identifier, url, error, res) {\n    // User service response as error information source.\n    if (res) {\n        return __assign(__assign({}, requestProcessingSuccess(identifier, url, res)), { type: 'request-process-error' });\n    }\n    var type = 'NETWORK_ISSUE';\n    var message = 'Unknown error';\n    var name = 'Error';\n    if (error && error instanceof Error) {\n        message = error.message;\n        name = error.name;\n    }\n    if (name === 'AbortError') {\n        message = 'Request aborted';\n        type = 'ABORTED';\n    }\n    else if (message === 'Request timeout')\n        type = 'TIMEOUT';\n    return {\n        type: 'request-process-error',\n        identifier: identifier,\n        url: url,\n        error: { name: name, type: type, message: message },\n    };\n};\n/**\n * Creates a Request object from a given {@link TransportRequest} object.\n *\n * @param req - The {@link TransportRequest} object containing request information.\n *\n * @returns {@link Request} object generated from the {@link TransportRequest} object.\n */\nvar requestFromTransportRequest = function (req) { return __awaiter(void 0, void 0, Promise, function () {\n    var headers, body, path, _i, _a, _b, key, value, fileData, formData, _c, _d, _e, key, value;\n    var _f;\n    return __generator(this, function (_g) {\n        switch (_g.label) {\n            case 0:\n                headers = undefined;\n                path = req.path;\n                if (req.headers) {\n                    headers = {};\n                    for (_i = 0, _a = Object.entries(req.headers); _i < _a.length; _i++) {\n                        _b = _a[_i], key = _b[0], value = _b[1];\n                        headers[key] = value;\n                    }\n                }\n                if (req.queryParameters && Object.keys(req.queryParameters).length !== 0)\n                    path = \"\".concat(path, \"?\").concat(queryStringFromObject(req.queryParameters));\n                if (!(req.body && typeof req.body === 'object')) return [3 /*break*/, 4];\n                if (!(req.body instanceof ArrayBuffer)) return [3 /*break*/, 1];\n                body = req.body;\n                return [3 /*break*/, 3];\n            case 1: return [4 /*yield*/, req.body.toArrayBuffer()];\n            case 2:\n                fileData = _g.sent();\n                formData = new FormData();\n                for (_c = 0, _d = Object.entries((_f = req.formData) !== null && _f !== void 0 ? _f : {}); _c < _d.length; _c++) {\n                    _e = _d[_c], key = _e[0], value = _e[1];\n                    formData.append(key, value);\n                }\n                formData.append('file', new Blob([fileData], { type: req.body.mimeType }), req.body.name);\n                body = formData;\n                _g.label = 3;\n            case 3: return [3 /*break*/, 5];\n            case 4:\n                body = req.body;\n                _g.label = 5;\n            case 5: return [2 /*return*/, new Request(\"\".concat(req.origin).concat(path), {\n                    method: req.method,\n                    headers: headers,\n                    redirect: 'follow',\n                    body: body,\n                })];\n        }\n    });\n}); };\nvar queryStringFromObject = function (query) {\n    return Object.keys(query)\n        .map(function (key) {\n        var queryValue = query[key];\n        if (!Array.isArray(queryValue))\n            return \"\".concat(key, \"=\").concat(encodeString(queryValue));\n        return queryValue.map(function (value) { return \"\".concat(key, \"=\").concat(encodeString(value)); }).join('&');\n    })\n        .join('&');\n};\n/**\n * Percent-encode input string.\n *\n * **Note:** Encode content in accordance of the `PubNub` service requirements.\n *\n * @param input - Source string or number for encoding.\n *\n * @returns Percent-encoded string.\n */\nvar encodeString = function (input) {\n    return encodeURIComponent(input).replace(/[!~*'()]/g, function (x) { return \"%\".concat(x.charCodeAt(0).toString(16).toUpperCase()); });\n};\nexport {};\n// endregion\n"], { type: 'application/javascript' })), {
                name: '/pubnub',
                type: 'module',
            });
            this.callbacks = new Map();
            // Complete Web Worker initialization.
            var setupEvent = {
                type: 'setup',
                logVerbosity: this.logVerbosity,
                keepAlive: this.keepAlive,
            };
            this.worker.postMessage(setupEvent);
            this.worker.onmessage = function (event) {
                var data = event.data;
                if (data.type === 'request-progress-start' || data.type === 'request-progress-end') {
                    _this.logRequestProgress(data);
                }
                else if (data.type === 'request-process-success' || data.type === 'request-process-error') {
                    var _a = _this.callbacks.get(data.identifier), resolve = _a.resolve, reject = _a.reject;
                    if (data.type === 'request-process-success') {
                        resolve({
                            status: data.response.status,
                            url: data.url,
                            headers: data.response.headers,
                            body: data.response.body,
                        });
                    }
                    else {
                        var category = StatusCategory$1.PNUnknownCategory;
                        var message = 'Unknown error';
                        // Handle client-side issues (if any).
                        if (data.error) {
                            if (data.error.type === 'NETWORK_ISSUE')
                                category = StatusCategory$1.PNNetworkIssuesCategory;
                            else if (data.error.type === 'TIMEOUT')
                                category = StatusCategory$1.PNTimeoutCategory;
                            message = data.error.message;
                        }
                        // Handle service error response.
                        else if (data.response) {
                            return reject(PubNubAPIError.create({
                                url: data.url,
                                headers: data.response.headers,
                                body: data.response.body,
                                status: data.response.status,
                            }));
                        }
                        reject(new PubNubAPIError(message, category, 0));
                    }
                }
            };
        };
        /**
         * Print request progress information.
         *
         * @param information - Request progress information from Web Worker.
         */
        WebTransport.prototype.logRequestProgress = function (information) {
            var _a, _b;
            if (information.type === 'request-progress-start') {
                console.log('<<<<<');
                console.log("[".concat(information.timestamp, "]"), '\n', information.url, '\n', JSON.stringify((_a = information.query) !== null && _a !== void 0 ? _a : {}));
                console.log('-----');
            }
            else {
                console.log('>>>>>>');
                console.log("[".concat(information.timestamp, " / ").concat(information.duration, "]"), '\n', information.url, '\n', JSON.stringify((_b = information.query) !== null && _b !== void 0 ? _b : {}), '\n', information.response);
                console.log('-----');
            }
        };
        return WebTransport;
    }());

    /**
     * Events listener manager module.
     */
    /**
     * Real-time listeners' manager.
     */
    var ListenerManager = /** @class */ (function () {
        function ListenerManager() {
            /**
             * List of registered event listeners.
             */
            this.listeners = [];
            // endregion
        }
        /**
         * Register new real-time events listener.
         *
         * @param listener - Listener with event callbacks to handle different types of events.
         */
        ListenerManager.prototype.addListener = function (listener) {
            if (this.listeners.includes(listener))
                return;
            this.listeners.push(listener);
        };
        /**
         * Remove real-time event listener.
         *
         * @param listener - Event listeners which should be removed.
         */
        ListenerManager.prototype.removeListener = function (listener) {
            this.listeners = this.listeners.filter(function (storedListener) { return storedListener !== listener; });
        };
        /**
         * Clear all real-time event listeners.
         */
        ListenerManager.prototype.removeAllListeners = function () {
            this.listeners = [];
        };
        /**
         * Announce PubNub client status change event.
         *
         * @param status - PubNub client status.
         */
        ListenerManager.prototype.announceStatus = function (status) {
            this.listeners.forEach(function (listener) {
                if (listener.status)
                    listener.status(status);
            });
        };
        /**
         * Announce channel presence change event.
         *
         * @param presence - Channel presence change information.
         */
        ListenerManager.prototype.announcePresence = function (presence) {
            this.listeners.forEach(function (listener) {
                if (listener.presence)
                    listener.presence(presence);
            });
        };
        /**
         * Announce real-time message event.
         *
         * @param message - Received real-time message.
         */
        ListenerManager.prototype.announceMessage = function (message) {
            this.listeners.forEach(function (listener) {
                if (listener.message)
                    listener.message(message);
            });
        };
        /**
         * Announce real-time signal event.
         *
         * @param signal - Received real-time signal.
         */
        ListenerManager.prototype.announceSignal = function (signal) {
            this.listeners.forEach(function (listener) {
                if (listener.signal)
                    listener.signal(signal);
            });
        };
        /**
         * Announce message actions change event.
         *
         * @param messageAction - Message action change information.
         */
        ListenerManager.prototype.announceMessageAction = function (messageAction) {
            this.listeners.forEach(function (listener) {
                if (listener.messageAction)
                    listener.messageAction(messageAction);
            });
        };
        /**
         * Announce fie share event.
         *
         * @param file - Shared file information.
         */
        ListenerManager.prototype.announceFile = function (file) {
            this.listeners.forEach(function (listener) {
                if (listener.file)
                    listener.file(file);
            });
        };
        /**
         * Announce App Context Object change event.
         *
         * @param object - App Context change information.
         */
        ListenerManager.prototype.announceObjects = function (object) {
            this.listeners.forEach(function (listener) {
                if (listener.objects)
                    listener.objects(object);
            });
        };
        /**
         * Announce network up status.
         */
        ListenerManager.prototype.announceNetworkUp = function () {
            this.listeners.forEach(function (listener) {
                if (listener.status) {
                    listener.status({
                        category: StatusCategory$1.PNNetworkUpCategory,
                    });
                }
            });
        };
        /**
         * Announce network down status.
         */
        ListenerManager.prototype.announceNetworkDown = function () {
            this.listeners.forEach(function (listener) {
                if (listener.status) {
                    listener.status({
                        category: StatusCategory$1.PNNetworkDownCategory,
                    });
                }
            });
        };
        // --------------------------------------------------------
        // ---------------------- Deprecated ----------------------
        // --------------------------------------------------------
        // region Deprecated
        /**
         * Announce User App Context Object change event.
         *
         * @param user - User App Context change information.
         *
         * @deprecated Use {@link announceObjects} method instead.
         */
        ListenerManager.prototype.announceUser = function (user) {
            this.listeners.forEach(function (listener) {
                if (listener.user)
                    listener.user(user);
            });
        };
        /**
         * Announce Space App Context Object change event.
         *
         * @param space - Space App Context change information.
         *
         * @deprecated Use {@link announceObjects} method instead.
         */
        ListenerManager.prototype.announceSpace = function (space) {
            this.listeners.forEach(function (listener) {
                if (listener.space)
                    listener.space(space);
            });
        };
        /**
         * Announce VSP Membership App Context Object change event.
         *
         * @param membership - VSP Membership App Context change information.
         *
         * @deprecated Use {@link announceObjects} method instead.
         */
        ListenerManager.prototype.announceMembership = function (membership) {
            this.listeners.forEach(function (listener) {
                if (listener.membership)
                    listener.membership(membership);
            });
        };
        return ListenerManager;
    }());

    /**
     * Subscription reconnection-manager.
     *
     * **Note:** Reconnection manger rely on legacy time-based availability check.
     */
    var ReconnectionManager = /** @class */ (function () {
        function ReconnectionManager(time) {
            this.time = time;
        }
        /**
         * Configure reconnection handler.
         *
         * @param callback - Successful availability check notify callback.
         */
        ReconnectionManager.prototype.onReconnect = function (callback) {
            this.callback = callback;
        };
        /**
         * Start periodic "availability" check.
         */
        ReconnectionManager.prototype.startPolling = function () {
            var _this = this;
            this.timeTimer = setInterval(function () { return _this.callTime(); }, 3000);
        };
        /**
         * Stop periodic "availability" check.
         */
        ReconnectionManager.prototype.stopPolling = function () {
            if (this.timeTimer)
                clearInterval(this.timeTimer);
            this.timeTimer = null;
        };
        ReconnectionManager.prototype.callTime = function () {
            var _this = this;
            this.time(function (status) {
                if (!status.error) {
                    _this.stopPolling();
                    if (_this.callback)
                        _this.callback();
                }
            });
        };
        return ReconnectionManager;
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
    var default_1$1 = /** @class */ (function () {
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

    /**
     * Subscription manager module.
     */
    /**
     * Subscription loop manager.
     */
    var SubscriptionManager = /** @class */ (function () {
        function SubscriptionManager(configuration, listenerManager, eventEmitter, subscribeCall, heartbeatCall, leaveCall, time) {
            this.configuration = configuration;
            this.listenerManager = listenerManager;
            this.eventEmitter = eventEmitter;
            this.subscribeCall = subscribeCall;
            this.heartbeatCall = heartbeatCall;
            this.leaveCall = leaveCall;
            this.reconnectionManager = new ReconnectionManager(time);
            this.dedupingManager = new default_1$1({ config: this.configuration });
            this.heartbeatChannelGroups = {};
            this.heartbeatChannels = {};
            this.presenceChannelGroups = {};
            this.presenceChannels = {};
            this.heartbeatTimer = null;
            this.presenceState = {};
            this.pendingChannelGroupSubscriptions = [];
            this.pendingChannelSubscriptions = [];
            this.channelGroups = {};
            this.channels = {};
            this.currentTimetoken = '0';
            this.lastTimetoken = '0';
            this.storedTimetoken = null;
            this.subscriptionStatusAnnounced = false;
            this.isOnline = true;
        }
        Object.defineProperty(SubscriptionManager.prototype, "subscribedChannels", {
            // region Information
            get: function () {
                return Object.keys(this.channels);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SubscriptionManager.prototype, "subscribedChannelGroups", {
            get: function () {
                return Object.keys(this.channelGroups);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SubscriptionManager.prototype, "abort", {
            set: function (call) {
                this._subscribeAbort = call;
            },
            enumerable: false,
            configurable: true
        });
        // endregion
        // region Subscription
        SubscriptionManager.prototype.disconnect = function () {
            this.stopSubscribeLoop();
            this.stopHeartbeatTimer();
            this.reconnectionManager.stopPolling();
        };
        SubscriptionManager.prototype.reconnect = function () {
            this.startSubscribeLoop();
            this.startHeartbeatTimer();
        };
        /**
         * Update channels and groups used in subscription loop.
         *
         * @param parameters - Subscribe configuration parameters.
         */
        SubscriptionManager.prototype.subscribe = function (parameters) {
            var _this = this;
            var channels = parameters.channels, channelGroups = parameters.channelGroups, timetoken = parameters.timetoken, _a = parameters.withPresence, withPresence = _a === void 0 ? false : _a, _b = parameters.withHeartbeats, withHeartbeats = _b === void 0 ? false : _b;
            if (timetoken) {
                this.lastTimetoken = this.currentTimetoken;
                this.currentTimetoken = timetoken;
            }
            if (this.currentTimetoken !== '0' && this.currentTimetoken !== 0) {
                this.storedTimetoken = this.currentTimetoken;
                this.currentTimetoken = 0;
            }
            channels === null || channels === void 0 ? void 0 : channels.forEach(function (channel) {
                _this.pendingChannelSubscriptions.push(channel);
                _this.channels[channel] = {};
                if (withPresence)
                    _this.presenceChannels[channel] = {};
                if (withHeartbeats || _this.configuration.getHeartbeatInterval())
                    _this.heartbeatChannels[channel] = {};
            });
            channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.forEach(function (group) {
                _this.pendingChannelGroupSubscriptions.push(group);
                _this.channelGroups[group] = {};
                if (withPresence)
                    _this.presenceChannelGroups[group] = {};
                if (withHeartbeats || _this.configuration.getHeartbeatInterval())
                    _this.heartbeatChannelGroups[group] = {};
            });
            this.subscriptionStatusAnnounced = false;
            this.reconnect();
        };
        SubscriptionManager.prototype.unsubscribe = function (parameters, isOffline) {
            var _this = this;
            var channels = parameters.channels, channelGroups = parameters.channelGroups;
            var actualChannelGroups = [];
            var actualChannels = [];
            channels === null || channels === void 0 ? void 0 : channels.forEach(function (channel) {
                if (channel in _this.channels) {
                    delete _this.channels[channel];
                    actualChannels.push(channel);
                    if (channel in _this.heartbeatChannels)
                        delete _this.heartbeatChannels[channel];
                }
                if (channel in _this.presenceState)
                    delete _this.presenceState[channel];
                if (channel in _this.presenceChannels) {
                    delete _this.presenceChannels[channel];
                    actualChannels.push(channel);
                }
            });
            channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.forEach(function (group) {
                if (group in _this.channelGroups) {
                    delete _this.channelGroups[group];
                    actualChannelGroups.push(group);
                    if (group in _this.heartbeatChannelGroups)
                        delete _this.heartbeatChannelGroups[group];
                }
                if (group in _this.presenceState)
                    delete _this.presenceState[group];
                if (group in _this.presenceChannelGroups) {
                    delete _this.presenceChannelGroups[group];
                    actualChannelGroups.push(group);
                }
            });
            // There is no need to unsubscribe to empty list of data sources.
            if (actualChannels.length === 0 && actualChannelGroups.length === 0)
                return;
            if (this.configuration.suppressLeaveEvents === false && !isOffline) {
                this.leaveCall({ channels: actualChannels, channelGroups: actualChannelGroups }, function (status) {
                    _this.listenerManager.announceStatus(__assign(__assign({}, status), { affectedChannels: actualChannels, affectedChannelGroups: actualChannelGroups, currentTimetoken: _this.currentTimetoken, lastTimetoken: _this.lastTimetoken }));
                });
            }
            if (Object.keys(this.channels).length === 0 &&
                Object.keys(this.presenceChannels).length === 0 &&
                Object.keys(this.channelGroups).length === 0 &&
                Object.keys(this.presenceChannelGroups).length === 0) {
                this.lastTimetoken = 0;
                this.currentTimetoken = 0;
                this.storedTimetoken = null;
                this.region = null;
                this.reconnectionManager.stopPolling();
            }
            this.reconnect();
        };
        SubscriptionManager.prototype.unsubscribeAll = function (isOffline) {
            this.unsubscribe({
                channels: this.subscribedChannels,
                channelGroups: this.subscribedChannelGroups,
            }, isOffline);
        };
        SubscriptionManager.prototype.startSubscribeLoop = function () {
            var _this = this;
            this.stopSubscribeLoop();
            var channelGroups = __spreadArray([], __read(Object.keys(this.channelGroups)), false);
            var channels = __spreadArray([], __read(Object.keys(this.channels)), false);
            Object.keys(this.presenceChannelGroups).forEach(function (group) { return channelGroups.push("".concat(group, "-pnpres")); });
            Object.keys(this.presenceChannels).forEach(function (channel) { return channels.push("".concat(channel, "-pnpres")); });
            // There is no need to start subscription loop for empty list of data sources.
            if (channels.length === 0 && channelGroups.length === 0)
                return;
            this.subscribeCall({
                channels: channels,
                channelGroups: channelGroups,
                state: this.presenceState,
                timetoken: this.currentTimetoken,
                region: this.region !== null ? this.region : undefined,
                filterExpression: this.configuration.filterExpression,
            }, function (status, result) {
                _this.processSubscribeResponse(status, result);
            });
        };
        SubscriptionManager.prototype.stopSubscribeLoop = function () {
            if (this._subscribeAbort) {
                this._subscribeAbort();
                this._subscribeAbort = null;
            }
        };
        /**
         * Process subscribe REST API endpoint response.
         */
        SubscriptionManager.prototype.processSubscribeResponse = function (status, result) {
            var _this = this;
            if (status.error) {
                // Ignore aborted request.
                if (typeof status.errorData === 'object' && 'name' in status.errorData && status.errorData.name === 'AbortError')
                    return;
                if (status.category === StatusCategory$1.PNTimeoutCategory) {
                    this.startSubscribeLoop();
                }
                else if (status.category === StatusCategory$1.PNNetworkIssuesCategory) {
                    this.disconnect();
                    if (status.error && this.configuration.autoNetworkDetection && this.isOnline) {
                        this.isOnline = false;
                        this.listenerManager.announceNetworkDown();
                    }
                    this.reconnectionManager.onReconnect(function () {
                        if (_this.configuration.autoNetworkDetection && !_this.isOnline) {
                            _this.isOnline = true;
                            _this.listenerManager.announceNetworkUp();
                        }
                        _this.reconnect();
                        _this.subscriptionStatusAnnounced = true;
                        var reconnectedAnnounce = {
                            category: StatusCategory$1.PNReconnectedCategory,
                            operation: status.operation,
                            lastTimetoken: _this.lastTimetoken,
                            currentTimetoken: _this.currentTimetoken,
                        };
                        _this.listenerManager.announceStatus(reconnectedAnnounce);
                    });
                    this.reconnectionManager.startPolling();
                    this.listenerManager.announceStatus(status);
                }
                else if (status.category === StatusCategory$1.PNBadRequestCategory) {
                    this.stopHeartbeatTimer();
                    this.listenerManager.announceStatus(status);
                }
                else {
                    this.listenerManager.announceStatus(status);
                }
                return;
            }
            if (this.storedTimetoken) {
                this.currentTimetoken = this.storedTimetoken;
                this.storedTimetoken = null;
            }
            else {
                this.lastTimetoken = this.currentTimetoken;
                this.currentTimetoken = result.cursor.timetoken;
            }
            if (!this.subscriptionStatusAnnounced) {
                var connected = {
                    category: StatusCategory$1.PNConnectedCategory,
                    operation: status.operation,
                    affectedChannels: this.pendingChannelSubscriptions,
                    subscribedChannels: this.subscribedChannels,
                    affectedChannelGroups: this.pendingChannelGroupSubscriptions,
                    lastTimetoken: this.lastTimetoken,
                    currentTimetoken: this.currentTimetoken,
                };
                this.subscriptionStatusAnnounced = true;
                this.listenerManager.announceStatus(connected);
                // Clear pending channels and groups.
                this.pendingChannelGroupSubscriptions = [];
                this.pendingChannelSubscriptions = [];
            }
            var messages = result.messages;
            var _a = this.configuration, requestMessageCountThreshold = _a.requestMessageCountThreshold, dedupeOnSubscribe = _a.dedupeOnSubscribe;
            if (requestMessageCountThreshold && messages.length >= requestMessageCountThreshold) {
                this.listenerManager.announceStatus({
                    category: StatusCategory$1.PNRequestMessageCountExceededCategory,
                    operation: status.operation,
                });
            }
            messages.forEach(function (message) {
                if (dedupeOnSubscribe) {
                    if (_this.dedupingManager.isDuplicate(message))
                        return;
                    _this.dedupingManager.addEntry(message);
                }
                _this.eventEmitter.emitEvent(message);
            });
            this.region = result.cursor.region;
            this.startSubscribeLoop();
        };
        // endregion
        // region Presence
        /**
         * Update `uuid` state which should be sent with subscribe request.
         *
         * @param parameters - Channels and groups with state which should be associated to `uuid`.
         */
        SubscriptionManager.prototype.setState = function (parameters) {
            var _this = this;
            var state = parameters.state, channels = parameters.channels, channelGroups = parameters.channelGroups;
            channels === null || channels === void 0 ? void 0 : channels.forEach(function (channel) { return channel in _this.channels && (_this.presenceState[channel] = state); });
            channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.forEach(function (group) { return group in _this.channelGroups && (_this.presenceState[group] = state); });
        };
        /**
         * Manual presence management.
         *
         * @param parameters - Desired presence state for provided list of channels and groups.
         */
        SubscriptionManager.prototype.changePresence = function (parameters) {
            var _this = this;
            var connected = parameters.connected, channels = parameters.channels, channelGroups = parameters.channelGroups;
            if (connected) {
                channels === null || channels === void 0 ? void 0 : channels.forEach(function (channel) { return (_this.heartbeatChannels[channel] = {}); });
                channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.forEach(function (group) { return (_this.heartbeatChannelGroups[group] = {}); });
            }
            else {
                channels === null || channels === void 0 ? void 0 : channels.forEach(function (channel) {
                    if (channel in _this.heartbeatChannels)
                        delete _this.heartbeatChannels[channel];
                });
                channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.forEach(function (group) {
                    if (group in _this.heartbeatChannelGroups)
                        delete _this.heartbeatChannelGroups[group];
                });
                if (this.configuration.suppressLeaveEvents === false) {
                    this.leaveCall({ channels: channels, channelGroups: channelGroups }, function (status) { return _this.listenerManager.announceStatus(status); });
                }
            }
            this.reconnect();
        };
        SubscriptionManager.prototype.startHeartbeatTimer = function () {
            var _this = this;
            this.stopHeartbeatTimer();
            var heartbeatInterval = this.configuration.getHeartbeatInterval();
            if (!heartbeatInterval || heartbeatInterval === 0)
                return;
            this.sendHeartbeat();
            this.heartbeatTimer = setInterval(function () { return _this.sendHeartbeat(); }, heartbeatInterval * 1000);
        };
        /**
         * Stop heartbeat.
         *
         * Stop timer which trigger {@link HeartbeatRequest} sending with configured presence intervals.
         */
        SubscriptionManager.prototype.stopHeartbeatTimer = function () {
            if (!this.heartbeatTimer)
                return;
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        };
        /**
         * Send heartbeat request.
         */
        SubscriptionManager.prototype.sendHeartbeat = function () {
            var _this = this;
            var heartbeatChannelGroups = Object.keys(this.heartbeatChannelGroups);
            var heartbeatChannels = Object.keys(this.heartbeatChannels);
            // There is no need to start heartbeat loop if there is no channels and groups to use.
            if (heartbeatChannels.length === 0 && heartbeatChannelGroups.length === 0)
                return;
            this.heartbeatCall({
                channels: heartbeatChannels,
                channelGroups: heartbeatChannelGroups,
                heartbeat: this.configuration.getPresenceTimeout(),
                state: this.presenceState,
            }, function (status) {
                if (status.error && _this.configuration.announceFailedHeartbeats)
                    _this.listenerManager.announceStatus(status);
                if (status.error && _this.configuration.autoNetworkDetection && _this.isOnline) {
                    _this.isOnline = false;
                    _this.disconnect();
                    _this.listenerManager.announceNetworkDown();
                    _this.reconnect();
                }
                if (!status.error && _this.configuration.announceSuccessfulHeartbeats)
                    _this.listenerManager.announceNetworkUp();
            });
        };
        return SubscriptionManager;
    }());

    /*       */
    /* eslint max-classes-per-file: ["error", 5] */
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

    /**
     * Base REST API request class.
     */
    var AbstractRequest = /** @class */ (function () {
        /**
         * Construct base request.
         *
         * Constructed request by default won't be cancellable and performed using `GET` HTTP method.
         *
         * @param params - Request configuration parameters.
         */
        function AbstractRequest(params) {
            this.params = params;
            this._cancellationController = null;
        }
        Object.defineProperty(AbstractRequest.prototype, "cancellationController", {
            /**
             * Retrieve configured cancellation controller.
             *
             * @returns Cancellation controller.
             */
            get: function () {
                return this._cancellationController;
            },
            /**
             * Update request cancellation controller.
             *
             * Controller itself provided by transport provider implementation and set only when request
             * sending has been scheduled.
             *
             * @param controller - Cancellation controller or `null` to reset it.
             */
            set: function (controller) {
                this._cancellationController = controller;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Abort request if possible.
         */
        AbstractRequest.prototype.abort = function () {
            if (this.cancellationController)
                this.cancellationController.abort();
        };
        /**
         * Target REST API endpoint operation type.
         */
        AbstractRequest.prototype.operation = function () {
            throw Error('Should be implemented by subclass.');
        };
        /**
         * Validate user-provided data before scheduling request.
         *
         * @returns Error message if request can't be sent without missing or malformed parameters.
         */
        AbstractRequest.prototype.validate = function () {
            return undefined;
        };
        /**
         * Parse service response.
         *
         * @param _response - Raw service response which should be parsed.
         */
        AbstractRequest.prototype.parse = function (_response) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    throw Error('Should be implemented by subclass.');
                });
            });
        };
        /**
         * Create platform-agnostic request object.
         *
         * @returns Request object which can be processed using platform-specific requirements.
         */
        AbstractRequest.prototype.request = function () {
            var _a, _b, _c, _d;
            var request = {
                method: (_b = (_a = this.params) === null || _a === void 0 ? void 0 : _a.method) !== null && _b !== void 0 ? _b : TransportMethod.GET,
                path: this.path,
                queryParameters: this.queryParameters,
                cancellable: (_d = (_c = this.params) === null || _c === void 0 ? void 0 : _c.cancellable) !== null && _d !== void 0 ? _d : false,
                timeout: 10000,
                identifier: uuidGenerator.createUUID(),
            };
            // Attach headers (if required).
            var headers = this.headers;
            if (headers)
                request.headers = headers;
            // Attach body (if required).
            if (request.method === TransportMethod.POST || request.method === TransportMethod.PATCH) {
                var _e = __read([this.body, this.formData], 2), body = _e[0], formData = _e[1];
                if (formData)
                    request.formData = formData;
                if (body)
                    request.body = body;
            }
            return request;
        };
        Object.defineProperty(AbstractRequest.prototype, "headers", {
            /**
             * Target REST API endpoint request headers getter.
             *
             * @returns Key/value headers which should be used with request.
             */
            get: function () {
                return undefined;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AbstractRequest.prototype, "path", {
            /**
             * Target REST API endpoint request path getter.
             *
             * @returns REST API path.
             */
            get: function () {
                throw Error('`path` getter should be implemented by subclass.');
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AbstractRequest.prototype, "queryParameters", {
            /**
             * Target REST API endpoint request query parameters getter.
             *
             * @returns Key/value pairs which should be appended to the REST API path.
             */
            get: function () {
                return {};
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AbstractRequest.prototype, "formData", {
            get: function () {
                return undefined;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AbstractRequest.prototype, "body", {
            /**
             * Target REST API Request body payload getter.
             *
             * @returns Buffer of stringified data which should be sent with `POST` or `PATCH` request.
             */
            get: function () {
                return undefined;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Deserialize service response.
         *
         * @param response - Transparent response object with headers and body information.
         *
         * @returns Deserialized data or `undefined` in case of `JSON.parse(..)` error.
         */
        AbstractRequest.prototype.deserializeResponse = function (response) {
            var contentType = response.headers['content-type'];
            if (contentType.indexOf('javascript') === -1 || contentType.indexOf('json') === -1)
                return undefined;
            var json = AbstractRequest.decoder.decode(response.body);
            try {
                var parsedJson = JSON.parse(json);
                return parsedJson;
            }
            catch (error) {
                console.error('Error parsing JSON response:', error);
                return undefined;
            }
        };
        /**
         * Service `ArrayBuffer` response decoder.
         */
        AbstractRequest.decoder = new TextDecoder();
        return AbstractRequest;
    }());

    /*       */
    var RequestOperation;
    (function (RequestOperation) {
        // --------------------------------------------------------
        // ---------------------- Publish API ---------------------
        // --------------------------------------------------------
        /**
         * Data publish REST API operation.
         */
        RequestOperation["PNPublishOperation"] = "PNPublishOperation";
        /**
         * Signal sending REST API operation.
         */
        RequestOperation["PNSignalOperation"] = "PNSignalOperation";
        // --------------------------------------------------------
        // --------------------- Subscribe API --------------------
        // --------------------------------------------------------
        /**
         * Subscribe for real-time updates REST API operation.
         *
         * User's presence change on specified entities will trigger `join` event.
         */
        RequestOperation["PNSubscribeOperation"] = "PNSubscribeOperation";
        /**
         * Unsubscribe from real-time updates REST API operation.
         *
         * User's presence change on specified entities will trigger `leave` event.
         */
        RequestOperation["PNUnsubscribeOperation"] = "PNUnsubscribeOperation";
        // --------------------------------------------------------
        // --------------------- Presence API ---------------------
        // --------------------------------------------------------
        /**
         * Fetch user's presence information REST API operation.
         */
        RequestOperation["PNWhereNowOperation"] = "PNWhereNowOperation";
        /**
         * Fetch channel's presence information REST API operation.
         */
        RequestOperation["PNHereNowOperation"] = "PNHereNowOperation";
        /**
         * Update user's information associated with specified channel REST API operation.
         */
        RequestOperation["PNSetStateOperation"] = "PNSetStateOperation";
        /**
         * Fetch user's information associated with the specified channel REST API operation.
         */
        RequestOperation["PNGetStateOperation"] = "PNGetStateOperation";
        /**
         * Announce presence on managed channels REST API operation.
         */
        RequestOperation["PNHeartbeatOperation"] = "PNHeartbeatOperation";
        // --------------------------------------------------------
        // ----------------- Message Reaction API -----------------
        // --------------------------------------------------------
        /**
         * Add a reaction to the specified message REST API operation.
         */
        RequestOperation["PNAddMessageActionOperation"] = "PNAddActionOperation";
        /**
         * Remove reaction from the specified message REST API operation.
         */
        RequestOperation["PNRemoveMessageActionOperation"] = "PNRemoveMessageActionOperation";
        /**
         * Fetch reactions for specific message REST API operation.
         */
        RequestOperation["PNGetMessageActionsOperation"] = "PNGetMessageActionsOperation";
        RequestOperation["PNTimeOperation"] = "PNTimeOperation";
        // --------------------------------------------------------
        // ---------------------- Storage API ---------------------
        // --------------------------------------------------------
        /**
         * Channel history REST API operation.
         */
        RequestOperation["PNHistoryOperation"] = "PNHistoryOperation";
        /**
         * Delete messages from channel history REST API operation.
         */
        RequestOperation["PNDeleteMessagesOperation"] = "PNDeleteMessagesOperation";
        /**
         * History for channels REST API operation.
         */
        RequestOperation["PNFetchMessagesOperation"] = "PNFetchMessagesOperation";
        /**
         * Number of messages for channels in specified time frame REST API operation.
         */
        RequestOperation["PNMessageCounts"] = "PNMessageCountsOperation";
        // --------------------------------------------------------
        // -------------------- App Context API -------------------
        // --------------------------------------------------------
        /**
         * Fetch users metadata REST API operation.
         */
        RequestOperation["PNGetAllUUIDMetadataOperation"] = "PNGetAllUUIDMetadataOperation";
        /**
         * Fetch user metadata REST API operation.
         */
        RequestOperation["PNGetUUIDMetadataOperation"] = "PNGetUUIDMetadataOperation";
        /**
         * Set user metadata REST API operation.
         */
        RequestOperation["PNSetUUIDMetadataOperation"] = "PNSetUUIDMetadataOperation";
        /**
         * Remove user metadata REST API operation.
         */
        RequestOperation["PNRemoveUUIDMetadataOperation"] = "PNRemoveUUIDMetadataOperation";
        /**
         * Fetch channels metadata REST API operation.
         */
        RequestOperation["PNGetAllChannelMetadataOperation"] = "PNGetAllChannelMetadataOperation";
        /**
         * Fetch channel metadata REST API operation.
         */
        RequestOperation["PNGetChannelMetadataOperation"] = "PNGetChannelMetadataOperation";
        /**
         * Set channel metadata REST API operation.
         */
        RequestOperation["PNSetChannelMetadataOperation"] = "PNSetChannelMetadataOperation";
        /**
         * Remove channel metadata REST API operation.
         */
        RequestOperation["PNRemoveChannelMetadataOperation"] = "PNRemoveChannelMetadataOperation";
        /**
         * Fetch channel members REST API operation.
         */
        RequestOperation["PNGetMembersOperation"] = "PNGetMembersOperation";
        /**
         * Update channel members REST API operation.
         */
        RequestOperation["PNSetMembersOperation"] = "PNSetMembersOperation";
        /**
         * Fetch channel memberships REST API operation.
         */
        RequestOperation["PNGetMembershipsOperation"] = "PNGetMembershipsOperation";
        /**
         * Update channel memberships REST API operation.
         */
        RequestOperation["PNSetMembershipsOperation"] = "PNSetMembershipsOperation";
        // --------------------------------------------------------
        // -------------------- File Upload API -------------------
        // --------------------------------------------------------
        /**
         * Fetch list of files sent to the channel REST API operation.
         */
        RequestOperation["PNListFilesOperation"] = "PNListFilesOperation";
        /**
         * Retrieve file upload URL REST API operation.
         */
        RequestOperation["PNGenerateUploadUrlOperation"] = "PNGenerateUploadUrlOperation";
        /**
         * Upload file to the channel REST API operation.
         */
        RequestOperation["PNPublishFileOperation"] = "PNPublishFileOperation";
        /**
         * Publish File Message to the channel REST API operation.
         */
        RequestOperation["PNPublishFileMessageOperation"] = "PNPublishFileMessageOperation";
        /**
         * Retrieve file download URL REST API operation.
         */
        RequestOperation["PNGetFileUrlOperation"] = "PNGetFileUrlOperation";
        /**
         * Download file from the channel REST API operation.
         */
        RequestOperation["PNDownloadFileOperation"] = "PNDownloadFileOperation";
        /**
         * Delete file sent to the channel REST API operation.
         */
        RequestOperation["PNDeleteFileOperation"] = "PNDeleteFileOperation";
        // --------------------------------------------------------
        // -------------------- Mobile Push API -------------------
        // --------------------------------------------------------
        /**
         * Register channels with device push notifications REST API operation.
         */
        RequestOperation["PNAddPushNotificationEnabledChannelsOperation"] = "PNAddPushNotificationEnabledChannelsOperation";
        /**
         * Unregister channels with device push notifications REST API operation.
         */
        RequestOperation["PNRemovePushNotificationEnabledChannelsOperation"] = "PNRemovePushNotificationEnabledChannelsOperation";
        /**
         * Fetch list of channels with enabled push notifications for device REST API operation.
         */
        RequestOperation["PNPushNotificationEnabledChannelsOperation"] = "PNPushNotificationEnabledChannelsOperation";
        /**
         * Disable push notifications for device REST API operation.
         */
        RequestOperation["PNRemoveAllPushNotificationsOperation"] = "PNRemoveAllPushNotificationsOperation";
        // --------------------------------------------------------
        // ------------------ Channel Groups API ------------------
        // --------------------------------------------------------
        /**
         * Fetch channels groups list REST API operation.
         */
        RequestOperation["PNChannelGroupsOperation"] = "PNChannelGroupsOperation";
        /**
         * Remove specified channel group REST API operation.
         */
        RequestOperation["PNRemoveGroupOperation"] = "PNRemoveGroupOperation";
        /**
         * Fetch list of channels for the specified channel group REST API operation.
         */
        RequestOperation["PNChannelsForGroupOperation"] = "PNChannelsForGroupOperation";
        /**
         * Add list of channels to the specified channel group REST API operation.
         */
        RequestOperation["PNAddChannelsToGroupOperation"] = "PNAddChannelsToGroupOperation";
        /**
         * Remove list of channels from the specified channel group REST API operation.
         */
        RequestOperation["PNRemoveChannelsFromGroupOperation"] = "PNRemoveChannelsFromGroupOperation";
        // --------------------------------------------------------
        // ----------------------- PAM API ------------------------
        // --------------------------------------------------------
        /**
         * Generate authorized token REST API operation.
         */
        RequestOperation["PNAccessManagerGrant"] = "PNAccessManagerGrant";
        /**
         * Generate authorized token REST API operation.
         */
        RequestOperation["PNAccessManagerGrantToken"] = "PNAccessManagerGrantToken";
        RequestOperation["PNAccessManagerAudit"] = "PNAccessManagerAudit";
        /**
         * Revoke authorized token REST API operation.
         */
        RequestOperation["PNAccessManagerRevokeToken"] = "PNAccessManagerRevokeToken";
        //
        // --------------------------------------------------------
        // ---------------- Subscription Utility ------------------
        // --------------------------------------------------------
        RequestOperation["PNHandshakeOperation"] = "PNHandshakeOperation";
        RequestOperation["PNReceiveMessagesOperation"] = "PNReceiveMessagesOperation";
    })(RequestOperation || (RequestOperation = {}));
    var RequestOperation$1 = RequestOperation;

    /**
     * Subscription REST API module.
     */
    // --------------------------------------------------------
    // ---------------------- Defaults ------------------------
    // --------------------------------------------------------
    // region Defaults
    /**
     * Whether should subscribe to channels / groups presence announcements or not.
     */
    var WITH_PRESENCE = false;
    // endregion
    // --------------------------------------------------------
    // ------------------------ Types -------------------------
    // --------------------------------------------------------
    // region Types
    /**
     * PubNub-defined event types by payload.
     */
    var PubNubEventType;
    (function (PubNubEventType) {
        /**
         * Presence change event.
         */
        PubNubEventType[PubNubEventType["Presence"] = -2] = "Presence";
        /**
         * Regular message event.
         *
         * **Note:** This is default type assigned for non-presence events if `e` field is missing.
         */
        PubNubEventType[PubNubEventType["Message"] = -1] = "Message";
        /**
         * Signal data event.
         */
        PubNubEventType[PubNubEventType["Signal"] = 1] = "Signal";
        /**
         * App Context object event.
         */
        PubNubEventType[PubNubEventType["AppContext"] = 2] = "AppContext";
        /**
         * Message reaction event.
         */
        PubNubEventType[PubNubEventType["MessageAction"] = 3] = "MessageAction";
        /**
         * Files event.
         */
        PubNubEventType[PubNubEventType["Files"] = 4] = "Files";
    })(PubNubEventType || (PubNubEventType = {}));
    // endregion
    /**
     * Base subscription request implementation.
     *
     * Subscription request used in small variations in two cases:
     * - subscription manager
     * - event engine
     */
    var BaseSubscribeRequest = /** @class */ (function (_super) {
        __extends(BaseSubscribeRequest, _super);
        function BaseSubscribeRequest(parameters) {
            var _a, _b, _c;
            var _d, _e, _f;
            var _this = _super.call(this, { cancellable: true }) || this;
            _this.parameters = parameters;
            // Apply default request parameters.
            (_a = (_d = _this.parameters).withPresence) !== null && _a !== void 0 ? _a : (_d.withPresence = WITH_PRESENCE);
            (_b = (_e = _this.parameters).channelGroups) !== null && _b !== void 0 ? _b : (_e.channelGroups = []);
            (_c = (_f = _this.parameters).channels) !== null && _c !== void 0 ? _c : (_f.channels = []);
            return _this;
        }
        BaseSubscribeRequest.prototype.operation = function () {
            return RequestOperation$1.PNSubscribeOperation;
        };
        BaseSubscribeRequest.prototype.validate = function () {
            var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channels = _a.channels, channelGroups = _a.channelGroups;
            if (!subscribeKey)
                return 'Missing Subscribe Key';
            if (!channels && !channelGroups)
                return '`channels` and `channelGroups` both should not be empty';
        };
        BaseSubscribeRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse, events;
                var _this = this;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    events = serviceResponse.m.map(function (envelope) {
                        var eventType = envelope.e;
                        // Resolve missing event type.
                        eventType !== null && eventType !== void 0 ? eventType : (eventType = envelope.c.endsWith('-pnpres') ? PubNubEventType.Presence : PubNubEventType.Message);
                        // Check whether payload is string (potentially encrypted data).
                        if (typeof envelope.d === 'string') {
                            if (eventType == PubNubEventType.Message) {
                                return {
                                    type: PubNubEventType.Message,
                                    data: _this.messageFromEnvelope(envelope),
                                };
                            }
                            return {
                                type: PubNubEventType.Files,
                                data: _this.fileFromEnvelope(envelope),
                            };
                        }
                        else if (eventType === PubNubEventType.Presence) {
                            return {
                                type: PubNubEventType.Presence,
                                data: _this.presenceEventFromEnvelope(envelope),
                            };
                        }
                        else if (eventType == PubNubEventType.Signal) {
                            return {
                                type: PubNubEventType.Signal,
                                data: _this.signalFromEnvelope(envelope),
                            };
                        }
                        else if (eventType === PubNubEventType.AppContext) {
                            return {
                                type: PubNubEventType.AppContext,
                                data: _this.appContextFromEnvelope(envelope),
                            };
                        }
                        else if (eventType === PubNubEventType.MessageAction) {
                            return {
                                type: PubNubEventType.MessageAction,
                                data: _this.messageActionFromEnvelope(envelope),
                            };
                        }
                        return {
                            type: PubNubEventType.Files,
                            data: _this.fileFromEnvelope(envelope),
                        };
                    });
                    return [2 /*return*/, {
                            cursor: { timetoken: serviceResponse.t.t, region: serviceResponse.t.r },
                            messages: events,
                        }];
                });
            });
        };
        // --------------------------------------------------------
        // ------------------ Envelope parsing --------------------
        // --------------------------------------------------------
        // region Envelope parsing
        BaseSubscribeRequest.prototype.presenceEventFromEnvelope = function (envelope) {
            var payload = envelope.d;
            var _a = __read(this.subscriptionChannelFromEnvelope(envelope), 2), channel = _a[0], subscription = _a[1];
            // Clean up channel and subscription name from presence suffix.
            channel = channel.replace('-pnpres', '');
            if (subscription)
                subscription = subscription.replace('-pnpres', '');
            // Backward compatibility with deprecated properties.
            var actualChannel = subscription !== null ? channel : null;
            var subscribedChannel = subscription !== null ? subscription : channel;
            return __assign({ channel: channel, subscription: subscription, actualChannel: actualChannel, subscribedChannel: subscribedChannel, timetoken: envelope.p.t }, payload);
        };
        BaseSubscribeRequest.prototype.messageFromEnvelope = function (envelope) {
            var _a = __read(this.subscriptionChannelFromEnvelope(envelope), 2), channel = _a[0], subscription = _a[1];
            var _b = __read(this.decryptedData(envelope.d), 2), message = _b[0], decryptionError = _b[1];
            // Backward compatibility with deprecated properties.
            var actualChannel = subscription !== null ? channel : null;
            var subscribedChannel = subscription !== null ? subscription : channel;
            // Basic message event payload.
            var event = {
                channel: channel,
                subscription: subscription,
                actualChannel: actualChannel,
                subscribedChannel: subscribedChannel,
                timetoken: envelope.p.t,
                publisher: envelope.i,
                userMetadata: envelope.u,
                message: message,
            };
            if (decryptionError)
                event.error = decryptionError;
            return event;
        };
        BaseSubscribeRequest.prototype.signalFromEnvelope = function (envelope) {
            var _a = __read(this.subscriptionChannelFromEnvelope(envelope), 2), channel = _a[0], subscription = _a[1];
            return {
                channel: channel,
                subscription: subscription,
                timetoken: envelope.p.t,
                publisher: envelope.i,
                userMetadata: envelope.u,
                message: envelope.d,
            };
        };
        BaseSubscribeRequest.prototype.messageActionFromEnvelope = function (envelope) {
            var _a = __read(this.subscriptionChannelFromEnvelope(envelope), 2), channel = _a[0], subscription = _a[1];
            var action = envelope.d;
            return {
                channel: channel,
                subscription: subscription,
                timetoken: envelope.p.t,
                publisher: envelope.i,
                event: action.event,
                data: __assign(__assign({}, action.data), { uuid: envelope.i }),
            };
        };
        BaseSubscribeRequest.prototype.appContextFromEnvelope = function (envelope) {
            var _a = __read(this.subscriptionChannelFromEnvelope(envelope), 2), channel = _a[0], subscription = _a[1];
            var object = envelope.d;
            return {
                channel: channel,
                subscription: subscription,
                timetoken: envelope.p.t,
                message: object,
            };
        };
        BaseSubscribeRequest.prototype.fileFromEnvelope = function (envelope) {
            var _a = __read(this.subscriptionChannelFromEnvelope(envelope), 2), channel = _a[0], subscription = _a[1];
            var _b = __read(this.decryptedData(envelope.d), 2), file = _b[0], decryptionError = _b[1];
            var errorMessage = decryptionError;
            // Basic file event payload.
            var event = {
                channel: channel,
                subscription: subscription,
                timetoken: envelope.p.t,
                publisher: envelope.i,
                userMetadata: envelope.u,
            };
            if (!file)
                errorMessage !== null && errorMessage !== void 0 ? errorMessage : (errorMessage = "File information payload is missing.");
            else if (typeof file === 'string')
                errorMessage !== null && errorMessage !== void 0 ? errorMessage : (errorMessage = "Unexpected file information payload data type.");
            else {
                event.message = file.message;
                if (file.file) {
                    event.file = {
                        id: file.file.id,
                        name: file.file.name,
                        url: this.parameters.getFileUrl({ id: file.file.id, name: file.file.name, channel: channel }),
                    };
                }
            }
            if (errorMessage)
                event.error = errorMessage;
            return event;
        };
        // endregion
        BaseSubscribeRequest.prototype.subscriptionChannelFromEnvelope = function (envelope) {
            return [envelope.c, envelope.b === undefined || envelope.b === envelope.c ? null : envelope.b];
        };
        /**
         * Decrypt provided `data`.
         *
         * @param [data] - Message or file information which should be decrypted if possible.
         *
         * @returns Tuple with decrypted data and decryption error (if any).
         */
        BaseSubscribeRequest.prototype.decryptedData = function (data) {
            if (!this.parameters.crypto || typeof data !== 'string')
                return [data, undefined];
            var payload;
            var error;
            try {
                var decryptedData = this.parameters.crypto.decrypt(data);
                payload =
                    decryptedData instanceof ArrayBuffer
                        ? JSON.parse(SubscribeRequest.decoder.decode(decryptedData))
                        : decryptedData;
            }
            catch (err) {
                payload = null;
                error = "Error while decrypting file message content: ".concat(err.message);
            }
            return [(payload !== null && payload !== void 0 ? payload : data), error];
        };
        return BaseSubscribeRequest;
    }(AbstractRequest));
    /**
     * Subscribe request.
     */
    var SubscribeRequest = /** @class */ (function (_super) {
        __extends(SubscribeRequest, _super);
        function SubscribeRequest() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(SubscribeRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channels = _a.channels;
                return "/v2/subscribe/".concat(subscribeKey, "/").concat(encodeString(channels.length > 0 ? channels.join(',') : ','), "/0");
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SubscribeRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, channelGroups = _a.channelGroups, filterExpression = _a.filterExpression, state = _a.state, timetoken = _a.timetoken, region = _a.region;
                var query = {};
                if (channelGroups && channelGroups.length > 0)
                    query['channel-group'] = channelGroups.join(',');
                if (filterExpression && filterExpression.length > 0)
                    query['filter-expr'] = filterExpression;
                if (state && Object.keys(state).length > 0)
                    query['state'] = JSON.stringify(state);
                if (typeof timetoken === 'string') {
                    if (timetoken && timetoken.length > 0)
                        query['tt'] = timetoken;
                }
                else if (timetoken && timetoken > 0)
                    query['tt'] = timetoken;
                if (region)
                    query['tr'] = region;
                return query;
            },
            enumerable: false,
            configurable: true
        });
        return SubscribeRequest;
    }(BaseSubscribeRequest));

    var EventEmitter = /** @class */ (function () {
        function EventEmitter(listenerManager) {
            this.listenerManager = listenerManager;
            /**
             * Map of channels to listener callbacks for them.
             */
            this.channelListenerMap = new Map();
            /**
             * Map of channel group names to the listener callbacks for them.
             */
            this.groupListenerMap = new Map();
        }
        /**
         * Emit specific real-time event.
         *
         * Proper listener will be notified basing on event `type`.
         *
         * @param event - Received real-time event.
         */
        EventEmitter.prototype.emitEvent = function (event) {
            if (event.type === PubNubEventType.Message) {
                this.listenerManager.announceMessage(event.data);
                this.announce('message', event.data, event.data.channel, event.data.subscription);
            }
            else if (event.type === PubNubEventType.Signal) {
                this.listenerManager.announceSignal(event.data);
                this.announce('signal', event.data, event.data.channel, event.data.subscription);
            }
            else if (event.type === PubNubEventType.Presence) {
                this.listenerManager.announcePresence(event.data);
                this.announce('presence', event.data, event.data.channel, event.data.subscription);
            }
            else if (event.type === PubNubEventType.AppContext) {
                var objectEvent = event.data;
                var object = objectEvent.message;
                this.listenerManager.announceObjects(objectEvent);
                this.announce('objects', objectEvent, objectEvent.channel, objectEvent.subscription);
                if (object.type === 'uuid') {
                    objectEvent.message; var channel = objectEvent.channel, restEvent = __rest(objectEvent, ["message", "channel"]);
                    var event_1 = object.event; object.type; var restObject = __rest(object, ["event", "type"]);
                    var userEvent = __assign(__assign({}, restEvent), { spaceId: channel, message: __assign(__assign({}, restObject), { event: event_1 === 'set' ? 'updated' : 'removed', type: 'user' }) });
                    this.listenerManager.announceUser(userEvent);
                    this.announce('user', userEvent, userEvent.spaceId, userEvent.subscription);
                }
                else if (object.type === 'channel') {
                    objectEvent.message; var channel = objectEvent.channel, restEvent = __rest(objectEvent, ["message", "channel"]);
                    var event_2 = object.event; object.type; var restObject = __rest(object, ["event", "type"]);
                    var spaceEvent = __assign(__assign({}, restEvent), { spaceId: channel, message: __assign(__assign({}, restObject), { event: event_2 === 'set' ? 'updated' : 'removed', type: 'space' }) });
                    this.listenerManager.announceSpace(spaceEvent);
                    this.announce('space', spaceEvent, spaceEvent.spaceId, spaceEvent.subscription);
                }
                else if (object.type === 'membership') {
                    objectEvent.message; var channel = objectEvent.channel, restEvent = __rest(objectEvent, ["message", "channel"]);
                    var event_3 = object.event, data = object.data, restObject = __rest(object, ["event", "data"]);
                    var uuid = data.uuid, channelMeta = data.channel, restData = __rest(data, ["uuid", "channel"]);
                    var membershipEvent = __assign(__assign({}, restEvent), { spaceId: channel, message: __assign(__assign({}, restObject), { event: event_3 === 'set' ? 'updated' : 'removed', data: __assign(__assign({}, restData), { user: uuid, space: channelMeta }) }) });
                    this.listenerManager.announceMembership(membershipEvent);
                    this.announce('membership', membershipEvent, membershipEvent.spaceId, membershipEvent.subscription);
                }
            }
            else if (event.type === PubNubEventType.MessageAction) {
                this.listenerManager.announceMessageAction(event.data);
                this.announce('messageAction', event.data, event.data.channel, event.data.subscription);
            }
            else if (event.type === PubNubEventType.Files) {
                this.listenerManager.announceFile(event.data);
                this.announce('file', event.data, event.data.channel, event.data.subscription);
            }
        };
        /**
         * Register real-time event listener for specific channels and groups.
         *
         * @param listener - Listener with event callbacks to handle different types of events.
         * @param channels - List of channels for which listener should be registered.
         * @param groups - List of channel groups for which listener should be registered.
         */
        EventEmitter.prototype.addListener = function (listener, channels, groups) {
            var _this = this;
            // Register event-listener listener globally.
            if (!(channels && groups)) {
                this.listenerManager.addListener(listener);
            }
            else {
                channels === null || channels === void 0 ? void 0 : channels.forEach(function (channel) {
                    if (_this.channelListenerMap.has(channel)) {
                        var channelListeners = _this.channelListenerMap.get(channel);
                        if (!channelListeners.includes(listener))
                            channelListeners.push(listener);
                    }
                    else
                        _this.channelListenerMap.set(channel, [listener]);
                });
                groups === null || groups === void 0 ? void 0 : groups.forEach(function (group) {
                    if (_this.groupListenerMap.has(group)) {
                        var groupListeners = _this.groupListenerMap.get(group);
                        if (!groupListeners.includes(listener))
                            groupListeners.push(listener);
                    }
                    else
                        _this.groupListenerMap.set(group, [listener]);
                });
            }
        };
        /**
         * Remove real-time event listener.
         *
         * @param listener - Event listeners which should be removed.
         * @param channels - List of channels for which listener should be removed.
         * @param groups - List of channel groups for which listener should be removed.
         */
        EventEmitter.prototype.removeListener = function (listener, channels, groups) {
            var _this = this;
            if (!(channels && groups)) {
                this.listenerManager.removeListener(listener);
            }
            else {
                channels === null || channels === void 0 ? void 0 : channels.forEach(function (channel) {
                    if (_this.channelListenerMap.has(channel)) {
                        _this.channelListenerMap.set(channel, _this.channelListenerMap.get(channel).filter(function (channelListener) { return channelListener !== listener; }));
                    }
                });
                groups === null || groups === void 0 ? void 0 : groups.forEach(function (group) {
                    if (_this.groupListenerMap.has(group)) {
                        _this.groupListenerMap.set(group, _this.groupListenerMap.get(group).filter(function (groupListener) { return groupListener !== listener; }));
                    }
                });
            }
        };
        /**
         * Clear all real-time event listeners.
         */
        EventEmitter.prototype.removeAllListeners = function () {
            this.listenerManager.removeAllListeners();
            this.channelListenerMap.clear();
            this.groupListenerMap.clear();
        };
        /**
         * Announce real-time event to all listeners.
         *
         * @param type - Type of event which should be announced.
         * @param event - Announced real-time event payload.
         * @param channel - Name of the channel for which registered listeners should be notified.
         * @param group - Name of the channel group for which registered listeners should be notified.
         */
        EventEmitter.prototype.announce = function (type, event, channel, group) {
            if (event && this.channelListenerMap.has(channel))
                this.channelListenerMap.get(channel).forEach(function (listener) {
                    var typedListener = listener[type];
                    // @ts-expect-error Dynamic events mapping.
                    if (typedListener)
                        typedListener(event);
                });
            if (group && this.groupListenerMap.has(group))
                this.groupListenerMap.get(group).forEach(function (listener) {
                    var typedListener = listener[type];
                    // @ts-expect-error Dynamic events mapping.
                    if (typedListener)
                        typedListener(event);
                });
        };
        return EventEmitter;
    }());

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
                var _d = __read(transition, 3), newState = _d[0], newContext = _d[1], effects = _d[2];
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
        Dispatcher.prototype.dispose = function () {
            var e_1, _a;
            try {
                for (var _b = __values(this.instances.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), key = _d[0], instance = _d[1];
                    instance.cancel();
                    this.instances.delete(key);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
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
                payload: fn === null || fn === void 0 ? void 0 : fn.apply(void 0, __spreadArray([], __read(args), false)),
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
            return { type: type, payload: fn.apply(void 0, __spreadArray([], __read(args), false)), managed: false };
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
            return { type: type, payload: fn.apply(void 0, __spreadArray([], __read(args), false)), managed: true };
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
            var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
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
            this.asyncFunction(this.payload, this.abortSignal, this.dependencies).catch(function (error) {
                // console.log('Unhandled error:', error);
                // swallow the error
            });
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

    var reconnect$1 = createEvent('RECONNECT', function () { return ({}); });
    var disconnect$1 = createEvent('DISCONNECT', function () { return ({}); });
    var joined = createEvent('JOINED', function (channels, groups) { return ({
        channels: channels,
        groups: groups,
    }); });
    var left = createEvent('LEFT', function (channels, groups) { return ({
        channels: channels,
        groups: groups,
    }); });
    var leftAll = createEvent('LEFT_ALL', function () { return ({}); });
    var heartbeatSuccess = createEvent('HEARTBEAT_SUCCESS', function (statusCode) { return ({ statusCode: statusCode }); });
    var heartbeatFailure = createEvent('HEARTBEAT_FAILURE', function (error) { return error; });
    var heartbeatGiveup = createEvent('HEARTBEAT_GIVEUP', function () { return ({}); });
    var timesUp = createEvent('TIMES_UP', function () { return ({}); });

    var heartbeat = createEffect('HEARTBEAT', function (channels, groups) { return ({
        channels: channels,
        groups: groups,
    }); });
    var leave = createEffect('LEAVE', function (channels, groups) { return ({
        channels: channels,
        groups: groups,
    }); });
    // TODO: Find out actual `status` type.
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    var emitStatus$1 = createEffect('EMIT_STATUS', function (status) { return status; });
    var wait = createManagedEffect('WAIT', function () { return ({}); });
    var delayedHeartbeat = createManagedEffect('DELAYED_HEARTBEAT', function (context) { return context; });

    var PresenceEventEngineDispatcher = /** @class */ (function (_super) {
        __extends(PresenceEventEngineDispatcher, _super);
        function PresenceEventEngineDispatcher(engine, dependencies) {
            var _this = _super.call(this, dependencies) || this;
            _this.on(heartbeat.type, asyncHandler(function (payload_1, _1, _a) { return __awaiter(_this, [payload_1, _1, _a], void 0, function (payload, _, _b) {
                var e_1;
                var heartbeat = _b.heartbeat, presenceState = _b.presenceState, config = _b.config;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, heartbeat(__assign(__assign({ channels: payload.channels, channelGroups: payload.groups }, (config.maintainPresenceState && { state: presenceState })), { heartbeat: config.presenceTimeout }))];
                        case 1:
                            _c.sent();
                            engine.transition(heartbeatSuccess(200));
                            return [3 /*break*/, 3];
                        case 2:
                            e_1 = _c.sent();
                            if (e_1 instanceof PubNubError) {
                                return [2 /*return*/, engine.transition(heartbeatFailure(e_1))];
                            }
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); }));
            _this.on(leave.type, asyncHandler(function (payload_1, _1, _a) { return __awaiter(_this, [payload_1, _1, _a], void 0, function (payload, _, _b) {
                var leave = _b.leave, config = _b.config;
                return __generator(this, function (_c) {
                    if (!config.suppressLeaveEvents) {
                        try {
                            leave({
                                channels: payload.channels,
                                channelGroups: payload.groups,
                            });
                        }
                        catch (e) { }
                    }
                    return [2 /*return*/];
                });
            }); }));
            _this.on(wait.type, asyncHandler(function (_1, abortSignal_1, _a) { return __awaiter(_this, [_1, abortSignal_1, _a], void 0, function (_, abortSignal, _b) {
                var heartbeatDelay = _b.heartbeatDelay;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            abortSignal.throwIfAborted();
                            return [4 /*yield*/, heartbeatDelay()];
                        case 1:
                            _c.sent();
                            abortSignal.throwIfAborted();
                            return [2 /*return*/, engine.transition(timesUp())];
                    }
                });
            }); }));
            _this.on(delayedHeartbeat.type, asyncHandler(function (payload_1, abortSignal_1, _a) { return __awaiter(_this, [payload_1, abortSignal_1, _a], void 0, function (payload, abortSignal, _b) {
                var e_2;
                var heartbeat = _b.heartbeat, retryDelay = _b.retryDelay, presenceState = _b.presenceState, config = _b.config;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!(config.retryConfiguration && config.retryConfiguration.shouldRetry(payload.reason, payload.attempts))) return [3 /*break*/, 6];
                            abortSignal.throwIfAborted();
                            return [4 /*yield*/, retryDelay(config.retryConfiguration.getDelay(payload.attempts, payload.reason))];
                        case 1:
                            _c.sent();
                            abortSignal.throwIfAborted();
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, heartbeat(__assign(__assign({ channels: payload.channels, channelGroups: payload.groups }, (config.maintainPresenceState && { state: presenceState })), { heartbeat: config.presenceTimeout }))];
                        case 3:
                            _c.sent();
                            return [2 /*return*/, engine.transition(heartbeatSuccess(200))];
                        case 4:
                            e_2 = _c.sent();
                            if (e_2 instanceof Error && e_2.message === 'Aborted') {
                                return [2 /*return*/];
                            }
                            if (e_2 instanceof PubNubError) {
                                return [2 /*return*/, engine.transition(heartbeatFailure(e_2))];
                            }
                            return [3 /*break*/, 5];
                        case 5: return [3 /*break*/, 7];
                        case 6: return [2 /*return*/, engine.transition(heartbeatGiveup())];
                        case 7: return [2 /*return*/];
                    }
                });
            }); }));
            _this.on(emitStatus$1.type, asyncHandler(function (payload_1, _1, _a) { return __awaiter(_this, [payload_1, _1, _a], void 0, function (payload, _, _b) {
                var _c;
                var emitStatus = _b.emitStatus, config = _b.config;
                return __generator(this, function (_d) {
                    if (config.announceFailedHeartbeats && ((_c = payload === null || payload === void 0 ? void 0 : payload.status) === null || _c === void 0 ? void 0 : _c.error) === true) {
                        emitStatus(payload.status);
                    }
                    else if (config.announceSuccessfulHeartbeats && payload.statusCode === 200) {
                        emitStatus(__assign(__assign({}, payload), { operation: RequestOperation$1.PNHeartbeatOperation, error: false }));
                    }
                    return [2 /*return*/];
                });
            }); }));
            return _this;
        }
        return PresenceEventEngineDispatcher;
    }(Dispatcher));

    var HeartbeatStoppedState = new State('HEARTBEAT_STOPPED');
    HeartbeatStoppedState.on(joined.type, function (context, event) {
        return HeartbeatStoppedState.with({
            channels: __spreadArray(__spreadArray([], __read(context.channels), false), __read(event.payload.channels), false),
            groups: __spreadArray(__spreadArray([], __read(context.groups), false), __read(event.payload.groups), false),
        });
    });
    HeartbeatStoppedState.on(left.type, function (context, event) {
        return HeartbeatStoppedState.with({
            channels: context.channels.filter(function (channel) { return !event.payload.channels.includes(channel); }),
            groups: context.groups.filter(function (group) { return !event.payload.groups.includes(group); }),
        });
    });
    HeartbeatStoppedState.on(reconnect$1.type, function (context, _) {
        return HeartbeatingState.with({
            channels: context.channels,
            groups: context.groups,
        });
    });
    HeartbeatStoppedState.on(leftAll.type, function (context, _) { return HeartbeatInactiveState.with(undefined); });

    var HeartbeatCooldownState = new State('HEARTBEAT_COOLDOWN');
    HeartbeatCooldownState.onEnter(function () { return wait(); });
    HeartbeatCooldownState.onExit(function () { return wait.cancel; });
    HeartbeatCooldownState.on(timesUp.type, function (context, _) {
        return HeartbeatingState.with({
            channels: context.channels,
            groups: context.groups,
        });
    });
    HeartbeatCooldownState.on(joined.type, function (context, event) {
        return HeartbeatingState.with({
            channels: __spreadArray(__spreadArray([], __read(context.channels), false), __read(event.payload.channels), false),
            groups: __spreadArray(__spreadArray([], __read(context.groups), false), __read(event.payload.groups), false),
        });
    });
    HeartbeatCooldownState.on(left.type, function (context, event) {
        return HeartbeatingState.with({
            channels: context.channels.filter(function (channel) { return !event.payload.channels.includes(channel); }),
            groups: context.groups.filter(function (group) { return !event.payload.groups.includes(group); }),
        }, [leave(event.payload.channels, event.payload.groups)]);
    });
    HeartbeatCooldownState.on(disconnect$1.type, function (context) {
        return HeartbeatStoppedState.with({
            channels: context.channels,
            groups: context.groups,
        }, [leave(context.channels, context.groups)]);
    });
    HeartbeatCooldownState.on(leftAll.type, function (context, _) {
        return HeartbeatInactiveState.with(undefined, [leave(context.channels, context.groups)]);
    });

    var HeartbeatFailedState = new State('HEARTBEAT_FAILED');
    HeartbeatFailedState.on(joined.type, function (context, event) {
        return HeartbeatingState.with({
            channels: __spreadArray(__spreadArray([], __read(context.channels), false), __read(event.payload.channels), false),
            groups: __spreadArray(__spreadArray([], __read(context.groups), false), __read(event.payload.groups), false),
        });
    });
    HeartbeatFailedState.on(left.type, function (context, event) {
        return HeartbeatingState.with({
            channels: context.channels.filter(function (channel) { return !event.payload.channels.includes(channel); }),
            groups: context.groups.filter(function (group) { return !event.payload.groups.includes(group); }),
        }, [leave(event.payload.channels, event.payload.groups)]);
    });
    HeartbeatFailedState.on(reconnect$1.type, function (context, _) {
        return HeartbeatingState.with({
            channels: context.channels,
            groups: context.groups,
        });
    });
    HeartbeatFailedState.on(disconnect$1.type, function (context, _) {
        return HeartbeatStoppedState.with({
            channels: context.channels,
            groups: context.groups,
        }, [leave(context.channels, context.groups)]);
    });
    HeartbeatFailedState.on(leftAll.type, function (context, _) {
        return HeartbeatInactiveState.with(undefined, [leave(context.channels, context.groups)]);
    });

    var HearbeatReconnectingState = new State('HEARBEAT_RECONNECTING');
    HearbeatReconnectingState.onEnter(function (context) { return delayedHeartbeat(context); });
    HearbeatReconnectingState.onExit(function () { return delayedHeartbeat.cancel; });
    HearbeatReconnectingState.on(joined.type, function (context, event) {
        return HeartbeatingState.with({
            channels: __spreadArray(__spreadArray([], __read(context.channels), false), __read(event.payload.channels), false),
            groups: __spreadArray(__spreadArray([], __read(context.groups), false), __read(event.payload.groups), false),
        });
    });
    HearbeatReconnectingState.on(left.type, function (context, event) {
        return HeartbeatingState.with({
            channels: context.channels.filter(function (channel) { return !event.payload.channels.includes(channel); }),
            groups: context.groups.filter(function (group) { return !event.payload.groups.includes(group); }),
        }, [leave(event.payload.channels, event.payload.groups)]);
    });
    HearbeatReconnectingState.on(disconnect$1.type, function (context, _) {
        HeartbeatStoppedState.with({
            channels: context.channels,
            groups: context.groups,
        }, [leave(context.channels, context.groups)]);
    });
    HearbeatReconnectingState.on(heartbeatSuccess.type, function (context, event) {
        return HeartbeatCooldownState.with({
            channels: context.channels,
            groups: context.groups,
        });
    });
    HearbeatReconnectingState.on(heartbeatFailure.type, function (context, event) {
        return HearbeatReconnectingState.with(__assign(__assign({}, context), { attempts: context.attempts + 1, reason: event.payload }));
    });
    HearbeatReconnectingState.on(heartbeatGiveup.type, function (context, event) {
        return HeartbeatFailedState.with({
            channels: context.channels,
            groups: context.groups,
        });
    });
    HearbeatReconnectingState.on(leftAll.type, function (context, _) {
        return HeartbeatInactiveState.with(undefined, [leave(context.channels, context.groups)]);
    });

    var HeartbeatingState = new State('HEARTBEATING');
    HeartbeatingState.onEnter(function (context) { return heartbeat(context.channels, context.groups); });
    HeartbeatingState.on(heartbeatSuccess.type, function (context, event) {
        return HeartbeatCooldownState.with({
            channels: context.channels,
            groups: context.groups,
        });
    });
    HeartbeatingState.on(joined.type, function (context, event) {
        return HeartbeatingState.with({
            channels: __spreadArray(__spreadArray([], __read(context.channels), false), __read(event.payload.channels), false),
            groups: __spreadArray(__spreadArray([], __read(context.groups), false), __read(event.payload.groups), false),
        });
    });
    HeartbeatingState.on(left.type, function (context, event) {
        return HeartbeatingState.with({
            channels: context.channels.filter(function (channel) { return !event.payload.channels.includes(channel); }),
            groups: context.groups.filter(function (group) { return !event.payload.groups.includes(group); }),
        }, [leave(event.payload.channels, event.payload.groups)]);
    });
    HeartbeatingState.on(heartbeatFailure.type, function (context, event) {
        return HearbeatReconnectingState.with(__assign(__assign({}, context), { attempts: 0, reason: event.payload }));
    });
    HeartbeatingState.on(disconnect$1.type, function (context) {
        return HeartbeatStoppedState.with({
            channels: context.channels,
            groups: context.groups,
        }, [leave(context.channels, context.groups)]);
    });
    HeartbeatingState.on(leftAll.type, function (context, _) {
        return HeartbeatInactiveState.with(undefined, [leave(context.channels, context.groups)]);
    });

    var HeartbeatInactiveState = new State('HEARTBEAT_INACTIVE');
    HeartbeatInactiveState.on(joined.type, function (_, event) {
        return HeartbeatingState.with({
            channels: event.payload.channels,
            groups: event.payload.groups,
        });
    });

    var PresenceEventEngine = /** @class */ (function () {
        function PresenceEventEngine(dependencies) {
            var _this = this;
            this.dependencies = dependencies;
            this.engine = new Engine();
            this.channels = [];
            this.groups = [];
            this.dispatcher = new PresenceEventEngineDispatcher(this.engine, dependencies);
            this._unsubscribeEngine = this.engine.subscribe(function (change) {
                if (change.type === 'invocationDispatched') {
                    _this.dispatcher.dispatch(change.invocation);
                }
            });
            this.engine.start(HeartbeatInactiveState, undefined);
        }
        Object.defineProperty(PresenceEventEngine.prototype, "_engine", {
            get: function () {
                return this.engine;
            },
            enumerable: false,
            configurable: true
        });
        PresenceEventEngine.prototype.join = function (_a) {
            var channels = _a.channels, groups = _a.groups;
            this.channels = __spreadArray(__spreadArray([], __read(this.channels), false), __read((channels !== null && channels !== void 0 ? channels : [])), false);
            this.groups = __spreadArray(__spreadArray([], __read(this.groups), false), __read((groups !== null && groups !== void 0 ? groups : [])), false);
            this.engine.transition(joined(this.channels.slice(0), this.groups.slice(0)));
        };
        PresenceEventEngine.prototype.leave = function (_a) {
            var _this = this;
            var channels = _a.channels, groups = _a.groups;
            if (this.dependencies.presenceState) {
                channels === null || channels === void 0 ? void 0 : channels.forEach(function (c) { return delete _this.dependencies.presenceState[c]; });
                groups === null || groups === void 0 ? void 0 : groups.forEach(function (g) { return delete _this.dependencies.presenceState[g]; });
            }
            this.engine.transition(left(channels !== null && channels !== void 0 ? channels : [], groups !== null && groups !== void 0 ? groups : []));
        };
        PresenceEventEngine.prototype.leaveAll = function () {
            this.engine.transition(leftAll());
        };
        PresenceEventEngine.prototype.dispose = function () {
            this._unsubscribeEngine();
            this.dispatcher.dispose();
        };
        return PresenceEventEngine;
    }());

    var RetryPolicy = /** @class */ (function () {
        function RetryPolicy() {
        }
        RetryPolicy.LinearRetryPolicy = function (configuration) {
            return {
                delay: configuration.delay,
                maximumRetry: configuration.maximumRetry,
                // TODO: Find out actual `error` type.
                /* eslint-disable  @typescript-eslint/no-explicit-any */
                shouldRetry: function (error, attempt) {
                    var _a;
                    if (((_a = error === null || error === void 0 ? void 0 : error.status) === null || _a === void 0 ? void 0 : _a.statusCode) === 403) {
                        return false;
                    }
                    return this.maximumRetry > attempt;
                },
                getDelay: function (_, reason) {
                    var _a;
                    var delay = (_a = reason.retryAfter) !== null && _a !== void 0 ? _a : this.delay;
                    return (delay + Math.random()) * 1000;
                },
                // TODO: Find out actual `error` type.
                /* eslint-disable  @typescript-eslint/no-explicit-any */
                getGiveupReason: function (error, attempt) {
                    var _a;
                    if (this.maximumRetry <= attempt) {
                        return 'retry attempts exhaused.';
                    }
                    if (((_a = error === null || error === void 0 ? void 0 : error.status) === null || _a === void 0 ? void 0 : _a.statusCode) === 403) {
                        return 'forbidden operation.';
                    }
                    return 'unknown error';
                },
                validate: function () {
                    if (this.maximumRetry > 10)
                        throw new Error('Maximum retry for linear retry policy can not be more than 10');
                },
            };
        };
        RetryPolicy.ExponentialRetryPolicy = function (configuration) {
            return {
                minimumDelay: configuration.minimumDelay,
                maximumDelay: configuration.maximumDelay,
                maximumRetry: configuration.maximumRetry,
                shouldRetry: function (reason, attempt) {
                    var _a;
                    if (((_a = reason === null || reason === void 0 ? void 0 : reason.status) === null || _a === void 0 ? void 0 : _a.statusCode) === 403) {
                        return false;
                    }
                    return this.maximumRetry > attempt;
                },
                getDelay: function (attempt, reason) {
                    var _a;
                    var delay = (_a = reason.retryAfter) !== null && _a !== void 0 ? _a : Math.min(Math.pow(2, attempt), this.maximumDelay);
                    return (delay + Math.random()) * 1000;
                },
                getGiveupReason: function (reason, attempt) {
                    var _a;
                    if (this.maximumRetry <= attempt) {
                        return 'retry attempts exhausted.';
                    }
                    if (((_a = reason === null || reason === void 0 ? void 0 : reason.status) === null || _a === void 0 ? void 0 : _a.statusCode) === 403) {
                        return 'forbidden operation.';
                    }
                    return 'unknown error';
                },
                validate: function () {
                    if (this.minimumDelay < 2)
                        throw new Error('Minimum delay can not be set less than 2 seconds for retry');
                    else if (this.maximumDelay)
                        throw new Error('Maximum delay can not be set more than 150 seconds for retry');
                    else if (this.maximumRetry > 6)
                        throw new Error('Maximum retry for exponential retry policy can not be more than 6');
                },
            };
        };
        return RetryPolicy;
    }());

    var handshake = createManagedEffect('HANDSHAKE', function (channels, groups) { return ({
        channels: channels,
        groups: groups,
    }); });
    var receiveMessages = createManagedEffect('RECEIVE_MESSAGES', function (channels, groups, cursor) { return ({ channels: channels, groups: groups, cursor: cursor }); });
    var emitMessages = createEffect('EMIT_MESSAGES', function (events) { return events; });
    // TODO: Find out actual `status` type.
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    var emitStatus = createEffect('EMIT_STATUS', function (status) { return status; });
    var receiveReconnect = createManagedEffect('RECEIVE_RECONNECT', function (context) { return context; });
    var handshakeReconnect = createManagedEffect('HANDSHAKE_RECONNECT', function (context) { return context; });

    var subscriptionChange = createEvent('SUBSCRIPTION_CHANGED', function (channels, groups) { return ({
        channels: channels,
        groups: groups,
    }); });
    var restore = createEvent('SUBSCRIPTION_RESTORED', function (channels, groups, timetoken, region) { return ({
        channels: channels,
        groups: groups,
        cursor: {
            timetoken: timetoken,
            region: region !== null && region !== void 0 ? region : 0,
        },
    }); });
    var handshakeSuccess = createEvent('HANDSHAKE_SUCCESS', function (cursor) { return cursor; });
    var handshakeFailure = createEvent('HANDSHAKE_FAILURE', function (error) { return error; });
    var handshakeReconnectSuccess = createEvent('HANDSHAKE_RECONNECT_SUCCESS', function (cursor) { return ({
        cursor: cursor,
    }); });
    var handshakeReconnectFailure = createEvent('HANDSHAKE_RECONNECT_FAILURE', function (error) { return error; });
    var handshakeReconnectGiveup = createEvent('HANDSHAKE_RECONNECT_GIVEUP', function (error) { return error; });
    var receiveSuccess = createEvent('RECEIVE_SUCCESS', function (cursor, events) { return ({
        cursor: cursor,
        events: events,
    }); });
    var receiveFailure = createEvent('RECEIVE_FAILURE', function (error) { return error; });
    var receiveReconnectSuccess = createEvent('RECEIVE_RECONNECT_SUCCESS', function (cursor, events) { return ({
        cursor: cursor,
        events: events,
    }); });
    var receiveReconnectFailure = createEvent('RECEIVE_RECONNECT_FAILURE', function (error) { return error; });
    var receiveReconnectGiveup = createEvent('RECEIVING_RECONNECT_GIVEUP', function (error) { return error; });
    var disconnect = createEvent('DISCONNECT', function () { return ({}); });
    var reconnect = createEvent('RECONNECT', function (timetoken, region) { return ({
        cursor: {
            timetoken: timetoken !== null && timetoken !== void 0 ? timetoken : '',
            region: region !== null && region !== void 0 ? region : 0,
        },
    }); });
    var unsubscribeAll = createEvent('UNSUBSCRIBE_ALL', function () { return ({}); });

    var EventEngineDispatcher = /** @class */ (function (_super) {
        __extends(EventEngineDispatcher, _super);
        function EventEngineDispatcher(engine, dependencies) {
            var _this = _super.call(this, dependencies) || this;
            _this.on(handshake.type, asyncHandler(function (payload_1, abortSignal_1, _a) { return __awaiter(_this, [payload_1, abortSignal_1, _a], void 0, function (payload, abortSignal, _b) {
                var result, e_1;
                var handshake = _b.handshake, presenceState = _b.presenceState, config = _b.config;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            abortSignal.throwIfAborted();
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, handshake(__assign({ abortSignal: abortSignal, channels: payload.channels, channelGroups: payload.groups, filterExpression: config.filterExpression }, (config.maintainPresenceState && { state: presenceState })))];
                        case 2:
                            result = _c.sent();
                            return [2 /*return*/, engine.transition(handshakeSuccess(result))];
                        case 3:
                            e_1 = _c.sent();
                            if (e_1 instanceof Error && e_1.message === 'Aborted') {
                                return [2 /*return*/];
                            }
                            if (e_1 instanceof PubNubError) {
                                return [2 /*return*/, engine.transition(handshakeFailure(e_1))];
                            }
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); }));
            _this.on(receiveMessages.type, asyncHandler(function (payload_1, abortSignal_1, _a) { return __awaiter(_this, [payload_1, abortSignal_1, _a], void 0, function (payload, abortSignal, _b) {
                var result, error_1;
                var receiveMessages = _b.receiveMessages, config = _b.config;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            abortSignal.throwIfAborted();
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, receiveMessages({
                                    abortSignal: abortSignal,
                                    channels: payload.channels,
                                    channelGroups: payload.groups,
                                    timetoken: payload.cursor.timetoken,
                                    region: payload.cursor.region,
                                    filterExpression: config.filterExpression,
                                })];
                        case 2:
                            result = _c.sent();
                            engine.transition(receiveSuccess(result.cursor, result.messages));
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _c.sent();
                            if (error_1 instanceof Error && error_1.message === 'Aborted') {
                                return [2 /*return*/];
                            }
                            if (error_1 instanceof PubNubError && !abortSignal.aborted) {
                                return [2 /*return*/, engine.transition(receiveFailure(error_1))];
                            }
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); }));
            _this.on(emitMessages.type, asyncHandler(function (payload_1, _1, _a) { return __awaiter(_this, [payload_1, _1, _a], void 0, function (payload, _, _b) {
                var emitMessages = _b.emitMessages;
                return __generator(this, function (_c) {
                    if (payload.length > 0) {
                        emitMessages(payload);
                    }
                    return [2 /*return*/];
                });
            }); }));
            _this.on(emitStatus.type, asyncHandler(function (payload_1, _1, _a) { return __awaiter(_this, [payload_1, _1, _a], void 0, function (payload, _, _b) {
                var emitStatus = _b.emitStatus;
                return __generator(this, function (_c) {
                    emitStatus(payload);
                    return [2 /*return*/];
                });
            }); }));
            _this.on(receiveReconnect.type, asyncHandler(function (payload_1, abortSignal_1, _a) { return __awaiter(_this, [payload_1, abortSignal_1, _a], void 0, function (payload, abortSignal, _b) {
                var result, error_2;
                var receiveMessages = _b.receiveMessages, delay = _b.delay, config = _b.config;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!(config.retryConfiguration && config.retryConfiguration.shouldRetry(payload.reason, payload.attempts))) return [3 /*break*/, 6];
                            abortSignal.throwIfAborted();
                            return [4 /*yield*/, delay(config.retryConfiguration.getDelay(payload.attempts, payload.reason))];
                        case 1:
                            _c.sent();
                            abortSignal.throwIfAborted();
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, receiveMessages({
                                    abortSignal: abortSignal,
                                    channels: payload.channels,
                                    channelGroups: payload.groups,
                                    timetoken: payload.cursor.timetoken,
                                    region: payload.cursor.region,
                                    filterExpression: config.filterExpression,
                                })];
                        case 3:
                            result = _c.sent();
                            return [2 /*return*/, engine.transition(receiveReconnectSuccess(result.cursor, result.messages))];
                        case 4:
                            error_2 = _c.sent();
                            if (error_2 instanceof Error && error_2.message === 'Aborted') {
                                return [2 /*return*/];
                            }
                            if (error_2 instanceof PubNubError) {
                                return [2 /*return*/, engine.transition(receiveReconnectFailure(error_2))];
                            }
                            return [3 /*break*/, 5];
                        case 5: return [3 /*break*/, 7];
                        case 6: return [2 /*return*/, engine.transition(receiveReconnectGiveup(new PubNubError(config.retryConfiguration
                                ? config.retryConfiguration.getGiveupReason(payload.reason, payload.attempts)
                                : 'Unable to complete subscribe messages receive.')))];
                        case 7: return [2 /*return*/];
                    }
                });
            }); }));
            _this.on(handshakeReconnect.type, asyncHandler(function (payload_1, abortSignal_1, _a) { return __awaiter(_this, [payload_1, abortSignal_1, _a], void 0, function (payload, abortSignal, _b) {
                var result, error_3;
                var handshake = _b.handshake, delay = _b.delay, presenceState = _b.presenceState, config = _b.config;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!(config.retryConfiguration && config.retryConfiguration.shouldRetry(payload.reason, payload.attempts))) return [3 /*break*/, 6];
                            abortSignal.throwIfAborted();
                            return [4 /*yield*/, delay(config.retryConfiguration.getDelay(payload.attempts, payload.reason))];
                        case 1:
                            _c.sent();
                            abortSignal.throwIfAborted();
                            _c.label = 2;
                        case 2:
                            _c.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, handshake(__assign({ abortSignal: abortSignal, channels: payload.channels, channelGroups: payload.groups, filterExpression: config.filterExpression }, (config.maintainPresenceState && { state: presenceState })))];
                        case 3:
                            result = _c.sent();
                            return [2 /*return*/, engine.transition(handshakeReconnectSuccess(result))];
                        case 4:
                            error_3 = _c.sent();
                            if (error_3 instanceof Error && error_3.message === 'Aborted') {
                                return [2 /*return*/];
                            }
                            if (error_3 instanceof PubNubError) {
                                return [2 /*return*/, engine.transition(handshakeReconnectFailure(error_3))];
                            }
                            return [3 /*break*/, 5];
                        case 5: return [3 /*break*/, 7];
                        case 6: return [2 /*return*/, engine.transition(handshakeReconnectGiveup(new PubNubError(config.retryConfiguration
                                ? config.retryConfiguration.getGiveupReason(payload.reason, payload.attempts)
                                : 'Unable to complete subscribe handshake')))];
                        case 7: return [2 /*return*/];
                    }
                });
            }); }));
            return _this;
        }
        return EventEngineDispatcher;
    }(Dispatcher));

    var HandshakeFailedState = new State('HANDSHAKE_FAILED');
    HandshakeFailedState.on(subscriptionChange.type, function (context, event) {
        return HandshakingState.with({
            channels: event.payload.channels,
            groups: event.payload.groups,
            cursor: context.cursor,
        });
    });
    HandshakeFailedState.on(reconnect.type, function (context, event) {
        return HandshakingState.with({
            channels: context.channels,
            groups: context.groups,
            cursor: event.payload.cursor || context.cursor,
        });
    });
    HandshakeFailedState.on(restore.type, function (context, event) {
        var _a, _b;
        return HandshakingState.with({
            channels: event.payload.channels,
            groups: event.payload.groups,
            cursor: {
                timetoken: event.payload.cursor.timetoken,
                region: event.payload.cursor.region ? event.payload.cursor.region : (_b = (_a = context === null || context === void 0 ? void 0 : context.cursor) === null || _a === void 0 ? void 0 : _a.region) !== null && _b !== void 0 ? _b : 0,
            },
        });
    });
    HandshakeFailedState.on(unsubscribeAll.type, function (_) { return UnsubscribedState.with(); });

    var HandshakeStoppedState = new State('HANDSHAKE_STOPPED');
    HandshakeStoppedState.on(subscriptionChange.type, function (context, event) {
        return HandshakeStoppedState.with({
            channels: event.payload.channels,
            groups: event.payload.groups,
            cursor: context.cursor,
        });
    });
    HandshakeStoppedState.on(reconnect.type, function (context, event) {
        return HandshakingState.with(__assign(__assign({}, context), { cursor: event.payload.cursor || context.cursor }));
    });
    HandshakeStoppedState.on(restore.type, function (context, event) {
        var _a;
        return HandshakeStoppedState.with({
            channels: event.payload.channels,
            groups: event.payload.groups,
            cursor: {
                timetoken: event.payload.cursor.timetoken,
                region: event.payload.cursor.region || ((_a = context === null || context === void 0 ? void 0 : context.cursor) === null || _a === void 0 ? void 0 : _a.region) || 0,
            },
        });
    });
    HandshakeStoppedState.on(unsubscribeAll.type, function (_) { return UnsubscribedState.with(); });

    var ReceiveFailedState = new State('RECEIVE_FAILED');
    ReceiveFailedState.on(reconnect.type, function (context, event) {
        var _a;
        return HandshakingState.with({
            channels: context.channels,
            groups: context.groups,
            cursor: {
                timetoken: !!event.payload.cursor.timetoken ? (_a = event.payload.cursor) === null || _a === void 0 ? void 0 : _a.timetoken : context.cursor.timetoken,
                region: event.payload.cursor.region || context.cursor.region,
            },
        });
    });
    ReceiveFailedState.on(subscriptionChange.type, function (context, event) {
        return HandshakingState.with({
            channels: event.payload.channels,
            groups: event.payload.groups,
            cursor: context.cursor,
        });
    });
    ReceiveFailedState.on(restore.type, function (context, event) {
        return HandshakingState.with({
            channels: event.payload.channels,
            groups: event.payload.groups,
            cursor: {
                timetoken: event.payload.cursor.timetoken,
                region: event.payload.cursor.region || context.cursor.region,
            },
        });
    });
    ReceiveFailedState.on(unsubscribeAll.type, function (_) { return UnsubscribedState.with(undefined); });

    var ReceiveStoppedState = new State('RECEIVE_STOPPED');
    ReceiveStoppedState.on(subscriptionChange.type, function (context, event) {
        return ReceiveStoppedState.with({
            channels: event.payload.channels,
            groups: event.payload.groups,
            cursor: context.cursor,
        });
    });
    ReceiveStoppedState.on(restore.type, function (context, event) {
        return ReceiveStoppedState.with({
            channels: event.payload.channels,
            groups: event.payload.groups,
            cursor: {
                timetoken: event.payload.cursor.timetoken,
                region: event.payload.cursor.region || context.cursor.region,
            },
        });
    });
    ReceiveStoppedState.on(reconnect.type, function (context, event) {
        var _a;
        return HandshakingState.with({
            channels: context.channels,
            groups: context.groups,
            cursor: {
                timetoken: !!event.payload.cursor.timetoken ? (_a = event.payload.cursor) === null || _a === void 0 ? void 0 : _a.timetoken : context.cursor.timetoken,
                region: event.payload.cursor.region || context.cursor.region,
            },
        });
    });
    ReceiveStoppedState.on(unsubscribeAll.type, function () { return UnsubscribedState.with(undefined); });

    var ReceiveReconnectingState = new State('RECEIVE_RECONNECTING');
    ReceiveReconnectingState.onEnter(function (context) { return receiveReconnect(context); });
    ReceiveReconnectingState.onExit(function () { return receiveReconnect.cancel; });
    ReceiveReconnectingState.on(receiveReconnectSuccess.type, function (context, event) {
        return ReceivingState.with({
            channels: context.channels,
            groups: context.groups,
            cursor: event.payload.cursor,
        }, [emitMessages(event.payload.events)]);
    });
    ReceiveReconnectingState.on(receiveReconnectFailure.type, function (context, event) {
        return ReceiveReconnectingState.with(__assign(__assign({}, context), { attempts: context.attempts + 1, reason: event.payload }));
    });
    ReceiveReconnectingState.on(receiveReconnectGiveup.type, function (context, event) {
        var _a;
        return ReceiveFailedState.with({
            groups: context.groups,
            channels: context.channels,
            cursor: context.cursor,
            reason: event.payload,
        }, [emitStatus({ category: StatusCategory$1.PNDisconnectedUnexpectedlyCategory, error: (_a = event.payload) === null || _a === void 0 ? void 0 : _a.message })]);
    });
    ReceiveReconnectingState.on(disconnect.type, function (context) {
        return ReceiveStoppedState.with({
            channels: context.channels,
            groups: context.groups,
            cursor: context.cursor,
        }, [emitStatus({ category: StatusCategory$1.PNDisconnectedCategory })]);
    });
    ReceiveReconnectingState.on(restore.type, function (context, event) {
        return ReceivingState.with({
            channels: event.payload.channels,
            groups: event.payload.groups,
            cursor: {
                timetoken: event.payload.cursor.timetoken,
                region: event.payload.cursor.region || context.cursor.region,
            },
        });
    });
    ReceiveReconnectingState.on(subscriptionChange.type, function (context, event) {
        return ReceivingState.with({
            channels: event.payload.channels,
            groups: event.payload.groups,
            cursor: context.cursor,
        });
    });
    ReceiveReconnectingState.on(unsubscribeAll.type, function (_) {
        return UnsubscribedState.with(undefined, [emitStatus({ category: StatusCategory$1.PNDisconnectedCategory })]);
    });

    var ReceivingState = new State('RECEIVING');
    ReceivingState.onEnter(function (context) { return receiveMessages(context.channels, context.groups, context.cursor); });
    ReceivingState.onExit(function () { return receiveMessages.cancel; });
    ReceivingState.on(receiveSuccess.type, function (context, event) {
        return ReceivingState.with({ channels: context.channels, groups: context.groups, cursor: event.payload.cursor }, [
            emitMessages(event.payload.events),
        ]);
    });
    ReceivingState.on(subscriptionChange.type, function (context, event) {
        if (event.payload.channels.length === 0 && event.payload.groups.length === 0) {
            return UnsubscribedState.with(undefined);
        }
        return ReceivingState.with({
            cursor: context.cursor,
            channels: event.payload.channels,
            groups: event.payload.groups,
        });
    });
    ReceivingState.on(restore.type, function (context, event) {
        if (event.payload.channels.length === 0 && event.payload.groups.length === 0) {
            return UnsubscribedState.with(undefined);
        }
        return ReceivingState.with({
            channels: event.payload.channels,
            groups: event.payload.groups,
            cursor: {
                timetoken: event.payload.cursor.timetoken,
                region: event.payload.cursor.region || context.cursor.region,
            },
        });
    });
    ReceivingState.on(receiveFailure.type, function (context, event) {
        return ReceiveReconnectingState.with(__assign(__assign({}, context), { attempts: 0, reason: event.payload }));
    });
    ReceivingState.on(disconnect.type, function (context) {
        return ReceiveStoppedState.with({
            channels: context.channels,
            groups: context.groups,
            cursor: context.cursor,
        }, [emitStatus({ category: StatusCategory$1.PNDisconnectedCategory })]);
    });
    ReceivingState.on(unsubscribeAll.type, function (_) {
        return UnsubscribedState.with(undefined, [emitStatus({ category: StatusCategory$1.PNDisconnectedCategory })]);
    });

    var HandshakeReconnectingState = new State('HANDSHAKE_RECONNECTING');
    HandshakeReconnectingState.onEnter(function (context) { return handshakeReconnect(context); });
    HandshakeReconnectingState.onExit(function () { return handshakeReconnect.cancel; });
    HandshakeReconnectingState.on(handshakeReconnectSuccess.type, function (context, event) {
        var _a, _b;
        var cursor = {
            timetoken: !!((_a = context.cursor) === null || _a === void 0 ? void 0 : _a.timetoken) ? (_b = context.cursor) === null || _b === void 0 ? void 0 : _b.timetoken : event.payload.cursor.timetoken,
            region: event.payload.cursor.region,
        };
        return ReceivingState.with({
            channels: context.channels,
            groups: context.groups,
            cursor: cursor,
        }, [emitStatus({ category: StatusCategory$1.PNConnectedCategory })]);
    });
    HandshakeReconnectingState.on(handshakeReconnectFailure.type, function (context, event) {
        return HandshakeReconnectingState.with(__assign(__assign({}, context), { attempts: context.attempts + 1, reason: event.payload }));
    });
    HandshakeReconnectingState.on(handshakeReconnectGiveup.type, function (context, event) {
        var _a;
        return HandshakeFailedState.with({
            groups: context.groups,
            channels: context.channels,
            cursor: context.cursor,
            reason: event.payload,
        }, [emitStatus({ category: StatusCategory$1.PNConnectionErrorCategory, error: (_a = event.payload) === null || _a === void 0 ? void 0 : _a.message })]);
    });
    HandshakeReconnectingState.on(disconnect.type, function (context) {
        return HandshakeStoppedState.with({
            channels: context.channels,
            groups: context.groups,
            cursor: context.cursor,
        });
    });
    HandshakeReconnectingState.on(subscriptionChange.type, function (context, event) {
        return HandshakingState.with({
            channels: event.payload.channels,
            groups: event.payload.groups,
            cursor: context.cursor,
        });
    });
    HandshakeReconnectingState.on(restore.type, function (context, event) {
        var _a, _b;
        return HandshakingState.with({
            channels: event.payload.channels,
            groups: event.payload.groups,
            cursor: {
                timetoken: event.payload.cursor.timetoken,
                region: ((_a = event.payload.cursor) === null || _a === void 0 ? void 0 : _a.region) || ((_b = context === null || context === void 0 ? void 0 : context.cursor) === null || _b === void 0 ? void 0 : _b.region) || 0,
            },
        });
    });
    HandshakeReconnectingState.on(unsubscribeAll.type, function (_) { return UnsubscribedState.with(undefined); });

    var HandshakingState = new State('HANDSHAKING');
    HandshakingState.onEnter(function (context) { return handshake(context.channels, context.groups); });
    HandshakingState.onExit(function () { return handshake.cancel; });
    HandshakingState.on(subscriptionChange.type, function (context, event) {
        if (event.payload.channels.length === 0 && event.payload.groups.length === 0) {
            return UnsubscribedState.with(undefined);
        }
        return HandshakingState.with({
            channels: event.payload.channels,
            groups: event.payload.groups,
            cursor: context.cursor,
        });
    });
    HandshakingState.on(handshakeSuccess.type, function (context, event) {
        var _a, _b;
        return ReceivingState.with({
            channels: context.channels,
            groups: context.groups,
            cursor: {
                timetoken: !!((_a = context === null || context === void 0 ? void 0 : context.cursor) === null || _a === void 0 ? void 0 : _a.timetoken) ? (_b = context === null || context === void 0 ? void 0 : context.cursor) === null || _b === void 0 ? void 0 : _b.timetoken : event.payload.timetoken,
                region: event.payload.region,
            },
        }, [
            emitStatus({
                category: StatusCategory$1.PNConnectedCategory,
            }),
        ]);
    });
    HandshakingState.on(handshakeFailure.type, function (context, event) {
        return HandshakeReconnectingState.with({
            channels: context.channels,
            groups: context.groups,
            cursor: context.cursor,
            attempts: 0,
            reason: event.payload,
        });
    });
    HandshakingState.on(disconnect.type, function (context) {
        return HandshakeStoppedState.with({
            channels: context.channels,
            groups: context.groups,
            cursor: context.cursor,
        });
    });
    HandshakingState.on(restore.type, function (context, event) {
        var _a;
        return HandshakingState.with({
            channels: event.payload.channels,
            groups: event.payload.groups,
            cursor: {
                timetoken: event.payload.cursor.timetoken,
                region: event.payload.cursor.region || ((_a = context === null || context === void 0 ? void 0 : context.cursor) === null || _a === void 0 ? void 0 : _a.region) || 0,
            },
        });
    });
    HandshakingState.on(unsubscribeAll.type, function (_) { return UnsubscribedState.with(); });

    var UnsubscribedState = new State('UNSUBSCRIBED');
    UnsubscribedState.on(subscriptionChange.type, function (_, event) {
        return HandshakingState.with({
            channels: event.payload.channels,
            groups: event.payload.groups,
        });
    });
    UnsubscribedState.on(restore.type, function (_, event) {
        return HandshakingState.with({
            channels: event.payload.channels,
            groups: event.payload.groups,
            cursor: event.payload.cursor,
        });
    });

    var EventEngine = /** @class */ (function () {
        function EventEngine(dependencies) {
            var _this = this;
            this.engine = new Engine();
            this.channels = [];
            this.groups = [];
            this.dependencies = dependencies;
            this.dispatcher = new EventEngineDispatcher(this.engine, dependencies);
            this._unsubscribeEngine = this.engine.subscribe(function (change) {
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
            var _this = this;
            var channels = _a.channels, channelGroups = _a.channelGroups, timetoken = _a.timetoken, withPresence = _a.withPresence;
            this.channels = __spreadArray(__spreadArray([], __read(this.channels), false), __read((channels !== null && channels !== void 0 ? channels : [])), false);
            this.groups = __spreadArray(__spreadArray([], __read(this.groups), false), __read((channelGroups !== null && channelGroups !== void 0 ? channelGroups : [])), false);
            if (withPresence) {
                this.channels.map(function (c) { return _this.channels.push("".concat(c, "-pnpres")); });
                this.groups.map(function (g) { return _this.groups.push("".concat(g, "-pnpres")); });
            }
            if (timetoken) {
                this.engine.transition(restore(Array.from(new Set(__spreadArray(__spreadArray([], __read(this.channels), false), __read((channels !== null && channels !== void 0 ? channels : [])), false))), Array.from(new Set(__spreadArray(__spreadArray([], __read(this.groups), false), __read((channelGroups !== null && channelGroups !== void 0 ? channelGroups : [])), false))), timetoken));
            }
            else {
                this.engine.transition(subscriptionChange(Array.from(new Set(__spreadArray(__spreadArray([], __read(this.channels), false), __read((channels !== null && channels !== void 0 ? channels : [])), false))), Array.from(new Set(__spreadArray(__spreadArray([], __read(this.groups), false), __read((channelGroups !== null && channelGroups !== void 0 ? channelGroups : [])), false)))));
            }
            if (this.dependencies.join) {
                this.dependencies.join({
                    channels: Array.from(new Set(this.channels.filter(function (c) { return !c.endsWith('-pnpres'); }))),
                    groups: Array.from(new Set(this.groups.filter(function (g) { return !g.endsWith('-pnpres'); }))),
                });
            }
        };
        EventEngine.prototype.unsubscribe = function (_a) {
            var _this = this;
            var _b = _a.channels, channels = _b === void 0 ? [] : _b, _c = _a.channelGroups, channelGroups = _c === void 0 ? [] : _c;
            var filteredChannels = removeSingleOccurance(this.channels, __spreadArray(__spreadArray([], __read(channels), false), __read(channels.map(function (c) { return "".concat(c, "-pnpres"); })), false));
            var filteredGroups = removeSingleOccurance(this.groups, __spreadArray(__spreadArray([], __read(channelGroups), false), __read(channelGroups.map(function (c) { return "".concat(c, "-pnpres"); })), false));
            if (new Set(this.channels).size !== new Set(filteredChannels).size ||
                new Set(this.groups).size !== new Set(filteredGroups).size) {
                var channelsToLeave = findUniqueCommonElements(this.channels, channels);
                var groupstoLeave = findUniqueCommonElements(this.groups, channelGroups);
                if (this.dependencies.presenceState) {
                    channelsToLeave === null || channelsToLeave === void 0 ? void 0 : channelsToLeave.forEach(function (c) { return delete _this.dependencies.presenceState[c]; });
                    groupstoLeave === null || groupstoLeave === void 0 ? void 0 : groupstoLeave.forEach(function (g) { return delete _this.dependencies.presenceState[g]; });
                }
                this.channels = filteredChannels;
                this.groups = filteredGroups;
                this.engine.transition(subscriptionChange(Array.from(new Set(this.channels.slice(0))), Array.from(new Set(this.groups.slice(0)))));
                if (this.dependencies.leave) {
                    this.dependencies.leave({
                        channels: channelsToLeave.slice(0),
                        groups: groupstoLeave.slice(0),
                    });
                }
            }
        };
        EventEngine.prototype.unsubscribeAll = function () {
            this.channels = [];
            this.groups = [];
            if (this.dependencies.presenceState) {
                this.dependencies.presenceState = {};
            }
            this.engine.transition(subscriptionChange(this.channels.slice(0), this.groups.slice(0)));
            if (this.dependencies.leaveAll) {
                this.dependencies.leaveAll();
            }
        };
        EventEngine.prototype.reconnect = function (_a) {
            var timetoken = _a.timetoken, region = _a.region;
            this.engine.transition(reconnect(timetoken, region));
        };
        EventEngine.prototype.disconnect = function () {
            this.engine.transition(disconnect());
            if (this.dependencies.leaveAll) {
                this.dependencies.leaveAll();
            }
        };
        EventEngine.prototype.getSubscribedChannels = function () {
            return Array.from(new Set(this.channels.slice(0)));
        };
        EventEngine.prototype.getSubscribedChannelGroups = function () {
            return Array.from(new Set(this.groups.slice(0)));
        };
        EventEngine.prototype.dispose = function () {
            this.disconnect();
            this._unsubscribeEngine();
            this.dispatcher.dispose();
        };
        return EventEngine;
    }());

    /**
     * Publish REST API module.
     */
    // --------------------------------------------------------
    // ----------------------- Defaults -----------------------
    // --------------------------------------------------------
    // region Defaults
    /**
     * Whether published data should be stored in history or not.
     */
    var STORE_IN_HISTORY$1 = true;
    /**
     * Whether data is published used `POST` body or not.
     */
    var SEND_BY_POST = false;
    /**
     * Whether published data should be replicated across all data centers or not.
     */
    var SHOULD_REPLICATE = true;
    // endregion
    /**
     * Data publish request.
     *
     * Request will normalize and encrypt (if required) provided data and push it to the specified
     * channel.
     */
    var PublishRequest = /** @class */ (function (_super) {
        __extends(PublishRequest, _super);
        /**
         * Construct data publish request.
         *
         * @param parameters - Request configuration.
         */
        function PublishRequest(parameters) {
            var _a, _b, _c;
            var _d, _e, _f;
            var _this = _super.call(this, { method: parameters.sendByPost ? TransportMethod.POST : TransportMethod.GET }) || this;
            _this.parameters = parameters;
            // Apply default request parameters.
            (_a = (_d = _this.parameters).storeInHistory) !== null && _a !== void 0 ? _a : (_d.storeInHistory = STORE_IN_HISTORY$1);
            (_b = (_e = _this.parameters).sendByPost) !== null && _b !== void 0 ? _b : (_e.sendByPost = SEND_BY_POST);
            // Apply defaults to the deprecated parameter.
            (_c = (_f = _this.parameters).replicate) !== null && _c !== void 0 ? _c : (_f.replicate = SHOULD_REPLICATE);
            return _this;
        }
        PublishRequest.prototype.operation = function () {
            return RequestOperation$1.PNPublishOperation;
        };
        PublishRequest.prototype.validate = function () {
            var _a = this.parameters, message = _a.message, channel = _a.channel, publishKey = _a.keySet.publishKey;
            if (!channel)
                return "Missing 'channel''";
            if (!message)
                return "Missing 'message'";
            if (!publishKey)
                return "Missing 'publishKey'";
        };
        PublishRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, { timetoken: serviceResponse[2] }];
                });
            });
        };
        Object.defineProperty(PublishRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, message = _a.message, channel = _a.channel, keySet = _a.keySet;
                var stringifiedPayload = this.prepareMessagePayload(message);
                return "/publish/".concat(keySet.publishKey, "/").concat(keySet.subscribeKey, "/0/").concat(encodeString(channel), "/0").concat(!this.parameters.sendByPost ? "/".concat(encodeString(stringifiedPayload)) : '');
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PublishRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, meta = _a.meta, replicate = _a.replicate, storeInHistory = _a.storeInHistory, ttl = _a.ttl;
                return __assign(__assign(__assign({ store: storeInHistory ? '1' : '0' }, (ttl !== undefined ? { ttl: ttl } : {})), (!replicate ? { norep: 'true' } : {})), (meta && typeof meta === 'object' ? { meta: JSON.stringify(meta) } : {}));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PublishRequest.prototype, "body", {
            get: function () {
                return this.prepareMessagePayload(this.parameters.message);
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Pre-process provided data.
         *
         * Data will be "normalized" and encrypted if `cryptoModule` has been provided.
         *
         * @param payload - User-provided data which should be pre-processed before use.
         *
         * @returns Payload which can be used as part of request URL or body.
         *
         * @throws {Error} in case if provided `payload` or results of `encryption` can't be stringified.
         */
        PublishRequest.prototype.prepareMessagePayload = function (payload) {
            var crypto = this.parameters.crypto;
            if (!crypto)
                return JSON.stringify(payload) || '';
            var encrypted = crypto.encrypt(JSON.stringify(payload));
            return JSON.stringify(typeof encrypted === 'string' ? encrypted : encode(encrypted));
        };
        return PublishRequest;
    }(AbstractRequest));

    /**
     * Signal REST API module.
     */
    // endregion
    var SignalRequest = /** @class */ (function (_super) {
        __extends(SignalRequest, _super);
        function SignalRequest(parameters) {
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            return _this;
        }
        SignalRequest.prototype.operation = function () {
            return RequestOperation$1.PNSignalOperation;
        };
        SignalRequest.prototype.validate = function () {
            var _a = this.parameters, message = _a.message, channel = _a.channel, publishKey = _a.keySet.publishKey;
            if (!channel)
                return "Missing 'channel''";
            if (!message)
                return "Missing 'message'";
            if (!publishKey)
                return "Missing 'publishKey'";
        };
        SignalRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, { timetoken: serviceResponse[2] }];
                });
            });
        };
        Object.defineProperty(SignalRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, _b = _a.keySet, publishKey = _b.publishKey, subscribeKey = _b.subscribeKey, channel = _a.channel, message = _a.message;
                var stringifiedPayload = JSON.stringify(message);
                return "/signal/".concat(publishKey, "/").concat(subscribeKey, "/0/").concat(encodeString(channel), "/0/").concat(encodeString(stringifiedPayload));
            },
            enumerable: false,
            configurable: true
        });
        return SignalRequest;
    }(AbstractRequest));

    /**
     * Receive messages subscribe REST API module.
     */
    /**
     * Receive messages subscribe request.
     */
    var ReceiveMessagesSubscribeRequest = /** @class */ (function (_super) {
        __extends(ReceiveMessagesSubscribeRequest, _super);
        function ReceiveMessagesSubscribeRequest() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ReceiveMessagesSubscribeRequest.prototype.operation = function () {
            return RequestOperation$1.PNReceiveMessagesOperation;
        };
        ReceiveMessagesSubscribeRequest.prototype.validate = function () {
            var validationResult = _super.prototype.validate.call(this);
            if (validationResult)
                return validationResult;
            if (!this.parameters.timetoken)
                return 'timetoken can not be empty';
            if (!this.parameters.region)
                return 'region can not be empty';
        };
        Object.defineProperty(ReceiveMessagesSubscribeRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channels = _a.channels;
                return "/v2/subscribe/".concat(subscribeKey, "/").concat(encodeString(channels.length > 0 ? channels.join(',') : ','), "/0");
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ReceiveMessagesSubscribeRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, channelGroups = _a.channelGroups, filterExpression = _a.filterExpression, timetoken = _a.timetoken, region = _a.region;
                var query = { ee: '' };
                if (channelGroups && channelGroups.length > 0)
                    query['channel-group'] = channelGroups.join(',');
                if (filterExpression && filterExpression.length > 0)
                    query['filter-expr'] = filterExpression;
                if (typeof timetoken === 'string') {
                    if (timetoken && timetoken.length > 0)
                        query['tt'] = timetoken;
                }
                else if (timetoken && timetoken > 0)
                    query['tt'] = timetoken;
                if (region)
                    query['tr'] = region;
                return query;
            },
            enumerable: false,
            configurable: true
        });
        return ReceiveMessagesSubscribeRequest;
    }(BaseSubscribeRequest));

    /**
     * Handshake subscribe REST API module.
     */
    /**
     * Handshake subscribe request.
     *
     * Separate subscribe request required by Event Engine.
     */
    var HandshakeSubscribeRequest = /** @class */ (function (_super) {
        __extends(HandshakeSubscribeRequest, _super);
        function HandshakeSubscribeRequest() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        HandshakeSubscribeRequest.prototype.operation = function () {
            return RequestOperation$1.PNHandshakeOperation;
        };
        Object.defineProperty(HandshakeSubscribeRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channels = _a.channels;
                return "/v2/subscribe/".concat(subscribeKey, "/").concat(encodeString(channels.length > 0 ? channels.join(',') : ','), "/0");
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(HandshakeSubscribeRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, channelGroups = _a.channelGroups, filterExpression = _a.filterExpression, state = _a.state;
                var query = { tt: 0, ee: '' };
                if (channelGroups && channelGroups.length > 0)
                    query['channel-group'] = channelGroups.join(',');
                if (filterExpression && filterExpression.length > 0)
                    query['filter-expr'] = filterExpression;
                if (state && Object.keys(state).length > 0)
                    query['state'] = JSON.stringify(state);
                return query;
            },
            enumerable: false,
            configurable: true
        });
        return HandshakeSubscribeRequest;
    }(BaseSubscribeRequest));

    /**
     * Get Presence State REST API module.
     */
    // endregion
    /**
     * Get `uuid` presence state request.
     */
    var GetPresenceStateRequest = /** @class */ (function (_super) {
        __extends(GetPresenceStateRequest, _super);
        function GetPresenceStateRequest(parameters) {
            var _a, _b;
            var _c, _d;
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            // Apply defaults.
            (_a = (_c = _this.parameters).channels) !== null && _a !== void 0 ? _a : (_c.channels = []);
            (_b = (_d = _this.parameters).channelGroups) !== null && _b !== void 0 ? _b : (_d.channelGroups = []);
            return _this;
        }
        GetPresenceStateRequest.prototype.operation = function () {
            return RequestOperation$1.PNGetStateOperation;
        };
        GetPresenceStateRequest.prototype.validate = function () {
            var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channels = _a.channels, channelGroups = _a.channelGroups;
            if (!subscribeKey)
                return 'Missing Subscribe Key';
            if (channels && channels.length > 0 && channelGroups && channelGroups.length > 0)
                return 'Only `channels` or `channelGroups` can be specified at once.';
        };
        GetPresenceStateRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse, _a, channels, channelGroups, state;
                return __generator(this, function (_b) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    _a = this.parameters, channels = _a.channels, channelGroups = _a.channelGroups;
                    state = { channels: {} };
                    if ((channels === null || channels === void 0 ? void 0 : channels.length) === 1 && (channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.length) === 0)
                        state.channels[channels[0]] = serviceResponse.payload;
                    else
                        state.channels = serviceResponse.payload;
                    return [2 /*return*/, state];
                });
            });
        };
        Object.defineProperty(GetPresenceStateRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, uuid = _a.uuid, channels = _a.channels;
                var stringifiedChannels = channels && channels.length > 0 ? encodeString(channels.join(',')) : ',';
                return "/v2/presence/sub-key/".concat(subscribeKey, "/channel/").concat(stringifiedChannels, "/uuid/").concat(uuid);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GetPresenceStateRequest.prototype, "queryParameters", {
            get: function () {
                var channelGroups = this.parameters.channelGroups;
                if (!channelGroups || channelGroups.length === 0)
                    return {};
                return { 'channel-group': channelGroups.join(',') };
            },
            enumerable: false,
            configurable: true
        });
        return GetPresenceStateRequest;
    }(AbstractRequest));

    /**
     * Set Presence State REST API module.
     */
    // endregion
    /**
     * Set `uuid` presence state request.
     */
    var SetPresenceStateRequest = /** @class */ (function (_super) {
        __extends(SetPresenceStateRequest, _super);
        function SetPresenceStateRequest(parameters) {
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            return _this;
        }
        SetPresenceStateRequest.prototype.operation = function () {
            return RequestOperation$1.PNSetStateOperation;
        };
        SetPresenceStateRequest.prototype.validate = function () {
            var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, state = _a.state, channels = _a.channels, channelGroups = _a.channelGroups;
            if (!subscribeKey)
                return 'Missing Subscribe Key';
            if (!state)
                return 'Missing State';
            if ((channels === null || channels === void 0 ? void 0 : channels.length) === 0 && (channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.length) === 0)
                return 'Please provide a list of channels and/or channel-groups';
        };
        SetPresenceStateRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, { state: serviceResponse.payload }];
                });
            });
        };
        Object.defineProperty(SetPresenceStateRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, uuid = _a.uuid, channels = _a.channels;
                var stringifiedChannels = channels && channels.length > 0 ? encodeString(channels.join(',')) : ',';
                return "/v2/presence/sub-key/".concat(subscribeKey, "/channel/").concat(stringifiedChannels, "/uuid/").concat(uuid, "/data");
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SetPresenceStateRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, channelGroups = _a.channelGroups, state = _a.state;
                var query = { state: JSON.stringify(state) };
                if (channelGroups && channelGroups.length === 0)
                    query['channel-group'] = channelGroups.join(',');
                return query;
            },
            enumerable: false,
            configurable: true
        });
        return SetPresenceStateRequest;
    }(AbstractRequest));

    /**
     * Announce heartbeat REST API module.
     */
    // endregion
    var HeartbeatRequest = /** @class */ (function (_super) {
        __extends(HeartbeatRequest, _super);
        function HeartbeatRequest(parameters) {
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            return _this;
        }
        HeartbeatRequest.prototype.operation = function () {
            return RequestOperation$1.PNHeartbeatOperation;
        };
        HeartbeatRequest.prototype.validate = function () {
            var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channels = _a.channels, channelGroups = _a.channelGroups;
            if (!subscribeKey)
                return 'Missing Subscribe Key';
            if ((channels === null || channels === void 0 ? void 0 : channels.length) === 0 && (channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.length) === 0)
                return 'Please provide a list of channels and/or channel-groups';
        };
        HeartbeatRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, {}];
                });
            });
        };
        Object.defineProperty(HeartbeatRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channels = _a.channels;
                var stringifiedChannels = channels && channels.length > 0 ? encodeString(channels.join(',')) : ',';
                return "/v2/presence/sub-key/".concat(subscribeKey, "/channel/").concat(stringifiedChannels, "/heartbeat");
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(HeartbeatRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, channelGroups = _a.channelGroups, state = _a.state, heartbeat = _a.heartbeat;
                var query = { heartbeat: "".concat(heartbeat) };
                if (channelGroups && channelGroups.length === 0)
                    query['channel-group'] = channelGroups.join(',');
                if (state)
                    query.state = JSON.stringify(state);
                return query;
            },
            enumerable: false,
            configurable: true
        });
        return HeartbeatRequest;
    }(AbstractRequest));

    /**
     * Announce leave REST API module.
     */
    // endregion
    var PresenceLeaveRequest = /** @class */ (function (_super) {
        __extends(PresenceLeaveRequest, _super);
        function PresenceLeaveRequest(parameters) {
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            return _this;
        }
        PresenceLeaveRequest.prototype.operation = function () {
            return RequestOperation$1.PNUnsubscribeOperation;
        };
        PresenceLeaveRequest.prototype.validate = function () {
            var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channels = _a.channels, channelGroups = _a.channelGroups;
            if (!subscribeKey)
                return 'Missing Subscribe Key';
            if ((channels === null || channels === void 0 ? void 0 : channels.length) === 0 && (channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.length) === 0)
                return 'At least one `channel` or `channel group` should be provided.';
        };
        PresenceLeaveRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, {}];
                });
            });
        };
        Object.defineProperty(PresenceLeaveRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channels = _a.channels;
                var stringifiedChannels = channels && channels.length > 0 ? encodeString(channels.join(',')) : ',';
                return "/v2/presence/sub-key/".concat(subscribeKey, "/channel/").concat(stringifiedChannels, "/leave");
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PresenceLeaveRequest.prototype, "queryParameters", {
            get: function () {
                var channelGroups = this.parameters.channelGroups;
                if (!channelGroups || channelGroups.length === 0)
                    return {};
                return { 'channel-group': channelGroups.join(',') };
            },
            enumerable: false,
            configurable: true
        });
        return PresenceLeaveRequest;
    }(AbstractRequest));

    /**
     * `uuid` presence REST API module.
     */
    // endregion
    var WhereNowRequest = /** @class */ (function (_super) {
        __extends(WhereNowRequest, _super);
        function WhereNowRequest(parameters) {
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            return _this;
        }
        WhereNowRequest.prototype.operation = function () {
            return RequestOperation$1.PNWhereNowOperation;
        };
        WhereNowRequest.prototype.validate = function () {
            if (!this.parameters.keySet.subscribeKey)
                return 'Missing Subscribe Key';
        };
        WhereNowRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    if (!serviceResponse.payload)
                        return [2 /*return*/, { channels: [] }];
                    return [2 /*return*/, { channels: serviceResponse.payload.channels }];
                });
            });
        };
        Object.defineProperty(WhereNowRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, uuid = _a.uuid;
                return "/v2/presence/sub-key/".concat(subscribeKey, "/uuid/").concat(encodeString(uuid));
            },
            enumerable: false,
            configurable: true
        });
        return WhereNowRequest;
    }(AbstractRequest));

    /**
     * Channels / channel groups presence REST API module.
     */
    // --------------------------------------------------------
    // ----------------------- Defaults -----------------------
    // --------------------------------------------------------
    // region Defaults
    /**
     * Whether `uuid` should be included in response or not.
     */
    var INCLUDE_UUID$1 = true;
    /**
     * Whether state associated with `uuid` should be included in response or not.
     */
    var INCLUDE_STATE = false;
    // endregion
    var HereNowRequest = /** @class */ (function (_super) {
        __extends(HereNowRequest, _super);
        function HereNowRequest(parameters) {
            var _a, _b, _c;
            var _d, _e, _f;
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            // Apply defaults.
            (_a = (_d = _this.parameters).queryParameters) !== null && _a !== void 0 ? _a : (_d.queryParameters = {});
            (_b = (_e = _this.parameters).includeUUIDs) !== null && _b !== void 0 ? _b : (_e.includeUUIDs = INCLUDE_UUID$1);
            (_c = (_f = _this.parameters).includeState) !== null && _c !== void 0 ? _c : (_f.includeState = INCLUDE_STATE);
            return _this;
        }
        HereNowRequest.prototype.operation = function () {
            return RequestOperation$1.PNHereNowOperation;
        };
        HereNowRequest.prototype.validate = function () {
            if (!this.parameters.keySet.subscribeKey)
                return 'Missing Subscribe Key';
        };
        HereNowRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse, totalChannels, totalOccupancy, channelsPresence, channels, channel;
                var _a, _b;
                return __generator(this, function (_c) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    totalChannels = 'occupancy' in serviceResponse ? 1 : serviceResponse.payload.total_channels;
                    totalOccupancy = 'occupancy' in serviceResponse ? serviceResponse.occupancy : serviceResponse.payload.total_channels;
                    channelsPresence = {};
                    channels = {};
                    // Remap single channel presence to multiple channels presence response.
                    if ('occupancy' in serviceResponse) {
                        channel = this.parameters.channels[0];
                        channels[channel] = { uuids: (_a = serviceResponse.uuids) !== null && _a !== void 0 ? _a : [], occupancy: totalOccupancy };
                    }
                    else
                        channels = (_b = serviceResponse.payload.channels) !== null && _b !== void 0 ? _b : {};
                    Object.keys(channels).forEach(function (channel) {
                        var channelEntry = channels[channel];
                        channelsPresence[channel] = {
                            occupants: channelEntry.uuids.map(function (uuid) {
                                if (typeof uuid === 'string')
                                    return { uuid: uuid, state: null };
                                return uuid;
                            }),
                            name: channel,
                            occupancy: channelEntry.occupancy,
                        };
                    });
                    return [2 /*return*/, {
                            totalChannels: totalChannels,
                            totalOccupancy: totalOccupancy,
                            channels: channelsPresence,
                        }];
                });
            });
        };
        Object.defineProperty(HereNowRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channels = _a.channels, channelGroups = _a.channelGroups;
                var path = "/v2/presence/sub-key/".concat(subscribeKey);
                if ((channels && channels.length > 0) || (channelGroups && channelGroups.length > 0)) {
                    var stringifiedChannels = channels && channels.length > 0 ? encodeString(channels.join(',')) : ',';
                    path += "/channel/".concat(stringifiedChannels);
                }
                return path;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(HereNowRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, channelGroups = _a.channelGroups, includeUUIDs = _a.includeUUIDs, includeState = _a.includeState, queryParameters = _a.queryParameters;
                return __assign(__assign(__assign(__assign({}, (!includeUUIDs ? { disable_uuids: '1' } : {})), ((includeState !== null && includeState !== void 0 ? includeState : false) ? { state: '1' } : {})), (channelGroups && channelGroups.length > 0 ? { 'channel-group': channelGroups.join(',') } : {})), queryParameters);
            },
            enumerable: false,
            configurable: true
        });
        return HereNowRequest;
    }(AbstractRequest));

    /**
     * Delete messages REST API module.
     */
    // endregion
    /**
     * Delete messages from channel history.
     */
    var DeleteMessageRequest = /** @class */ (function (_super) {
        __extends(DeleteMessageRequest, _super);
        function DeleteMessageRequest(parameters) {
            var _this = _super.call(this, { method: TransportMethod.DELETE }) || this;
            _this.parameters = parameters;
            return _this;
        }
        DeleteMessageRequest.prototype.operation = function () {
            return RequestOperation$1.PNDeleteMessagesOperation;
        };
        DeleteMessageRequest.prototype.validate = function () {
            if (!this.parameters.keySet.subscribeKey)
                return 'Missing Subscribe Key';
            if (!this.parameters.channel)
                return 'Missing channel';
        };
        DeleteMessageRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, {}];
                });
            });
        };
        Object.defineProperty(DeleteMessageRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channel = _a.channel;
                return "/v3/history/sub-key/".concat(subscribeKey, "/channel/").concat(encodeString(channel));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(DeleteMessageRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, start = _a.start, end = _a.end;
                return __assign(__assign({}, (start ? { start: start } : {})), (end ? { end: end } : {}));
            },
            enumerable: false,
            configurable: true
        });
        return DeleteMessageRequest;
    }(AbstractRequest));

    /**
     * Messages count REST API module.
     */
    // endregion
    var MessageCountRequest = /** @class */ (function (_super) {
        __extends(MessageCountRequest, _super);
        function MessageCountRequest(parameters) {
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            return _this;
        }
        MessageCountRequest.prototype.operation = function () {
            return RequestOperation$1.PNMessageCounts;
        };
        MessageCountRequest.prototype.validate = function () {
            var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channels = _a.channels, timetoken = _a.timetoken, channelTimetokens = _a.channelTimetokens;
            if (!subscribeKey)
                return 'Missing Subscribe Key';
            if (!channels)
                return 'Missing channels';
            if (timetoken && channelTimetokens)
                return '`timetoken` and `channelTimetokens` are incompatible together';
            if (!timetoken && !channelTimetokens)
                return '`timetoken` or `channelTimetokens` need to be set';
            if (channelTimetokens && channelTimetokens.length && channelTimetokens.length !== channels.length)
                return 'Length of `channelTimetokens` and `channels` do not match';
        };
        MessageCountRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, { channels: serviceResponse.channels }];
                });
            });
        };
        Object.defineProperty(MessageCountRequest.prototype, "path", {
            get: function () {
                return "/v3/history/sub-key/".concat(this.parameters.keySet.subscribeKey, "/message-counts/").concat(encodeString(this.parameters.channels.join(',')));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MessageCountRequest.prototype, "queryParameters", {
            get: function () {
                var channelTimetokens = this.parameters.channelTimetokens;
                if (this.parameters.timetoken)
                    channelTimetokens = [this.parameters.timetoken];
                return __assign(__assign({}, (channelTimetokens.length === 1 ? { timetoken: channelTimetokens[0] } : {})), (channelTimetokens.length > 1 ? { channelsTimetoken: channelTimetokens.join(',') } : {}));
            },
            enumerable: false,
            configurable: true
        });
        return MessageCountRequest;
    }(AbstractRequest));

    /**
     * Get history REST API module.
     */
    // --------------------------------------------------------
    // ---------------------- Defaults ------------------------
    // --------------------------------------------------------
    // region Defaults
    /**
     * Whether verbose logging enabled or not.
     */
    var LOG_VERBOSITY$1 = false;
    /**
     * Whether associated message metadata should be returned or not.
     */
    var INCLUDE_METADATA$1 = false;
    /**
     * Whether timetokens should be returned as strings by default or not.
     */
    var STRINGIFY_TIMETOKENS$1 = false;
    /**
     * Default and maximum number of messages which should be returned.
     */
    var MESSAGES_COUNT = 100;
    // endregion
    /**
     * Get single channel messages request.
     */
    var GetHistoryRequest = /** @class */ (function (_super) {
        __extends(GetHistoryRequest, _super);
        function GetHistoryRequest(parameters) {
            var _a, _b, _c;
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            // Apply defaults.
            if (parameters.count)
                parameters.count = Math.min(parameters.count, MESSAGES_COUNT);
            else
                parameters.count = MESSAGES_COUNT;
            (_a = parameters.stringifiedTimeToken) !== null && _a !== void 0 ? _a : (parameters.stringifiedTimeToken = STRINGIFY_TIMETOKENS$1);
            (_b = parameters.includeMeta) !== null && _b !== void 0 ? _b : (parameters.includeMeta = INCLUDE_METADATA$1);
            (_c = parameters.logVerbosity) !== null && _c !== void 0 ? _c : (parameters.logVerbosity = LOG_VERBOSITY$1);
            return _this;
        }
        GetHistoryRequest.prototype.operation = function () {
            return RequestOperation$1.PNHistoryOperation;
        };
        GetHistoryRequest.prototype.validate = function () {
            if (!this.parameters.keySet.subscribeKey)
                return 'Missing Subscribe Key';
            if (!this.parameters.channel)
                return 'Missing channel';
        };
        GetHistoryRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse, messages, startTimeToken, endTimeToken;
                var _this = this;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    messages = serviceResponse[0];
                    startTimeToken = serviceResponse[1];
                    endTimeToken = serviceResponse[2];
                    // Handle malformed get history response.
                    if (!Array.isArray(messages))
                        return [2 /*return*/, { messages: [], startTimeToken: startTimeToken, endTimeToken: endTimeToken }];
                    return [2 /*return*/, {
                            messages: messages.map(function (payload) {
                                var processedPayload = _this.processPayload(payload.message);
                                var item = {
                                    entry: processedPayload.payload,
                                    timetoken: payload.timetoken,
                                };
                                if (processedPayload.error)
                                    item.error = processedPayload.error;
                                if (payload.meta)
                                    item.meta = payload.meta;
                                return item;
                            }),
                            startTimeToken: startTimeToken,
                            endTimeToken: endTimeToken,
                        }];
                });
            });
        };
        Object.defineProperty(GetHistoryRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channel = _a.channel;
                return "/v2/history/sub-key/".concat(subscribeKey, "/channel/").concat(encodeString(channel));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GetHistoryRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, start = _a.start, end = _a.end, reverse = _a.reverse, count = _a.count, stringifiedTimeToken = _a.stringifiedTimeToken, includeMeta = _a.includeMeta;
                return __assign(__assign(__assign(__assign(__assign({ count: count, include_token: 'true' }, (start ? { start: start } : {})), (end ? { end: end } : {})), (stringifiedTimeToken ? { string_message_token: 'true' } : {})), (reverse !== undefined && reverse !== null ? { reverse: reverse.toString() } : {})), (includeMeta ? { include_meta: 'true' } : {}));
            },
            enumerable: false,
            configurable: true
        });
        GetHistoryRequest.prototype.processPayload = function (payload) {
            var _a = this.parameters, crypto = _a.crypto, logVerbosity = _a.logVerbosity;
            if (!crypto || typeof payload !== 'string')
                return { payload: payload };
            var decryptedPayload;
            var error;
            try {
                var decryptedData = crypto.decrypt(payload);
                decryptedPayload =
                    decryptedData instanceof ArrayBuffer
                        ? JSON.parse(GetHistoryRequest.decoder.decode(decryptedData))
                        : decryptedData;
            }
            catch (err) {
                if (logVerbosity)
                    console.log("decryption error", err.message);
                decryptedPayload = payload;
                error = "Error while decrypting message content: ".concat(err.message);
            }
            return {
                payload: decryptedPayload,
                error: error,
            };
        };
        return GetHistoryRequest;
    }(AbstractRequest));

    // endregion
    // --------------------------------------------------------
    // -------------------- Fetch Messages --------------------
    // --------------------------------------------------------
    // region Fetch Messages
    /**
     * PubNub-defined message type.
     *
     * Types of messages which can be retrieved with fetch messages REST API.
     */
    var PubNubMessageType;
    (function (PubNubMessageType) {
        /**
         * Regular message.
         */
        PubNubMessageType[PubNubMessageType["Message"] = -1] = "Message";
        /**
         * File message.
         */
        PubNubMessageType[PubNubMessageType["Files"] = 4] = "Files";
    })(PubNubMessageType || (PubNubMessageType = {}));
    // endregion

    /**
     * Fetch messages REST API module.
     */
    // --------------------------------------------------------
    // ---------------------- Defaults ------------------------
    // --------------------------------------------------------
    // region Defaults
    /**
     * Whether verbose logging enabled or not.
     */
    var LOG_VERBOSITY = false;
    /**
     * Whether associated message metadata should be returned or not.
     */
    var INCLUDE_METADATA = true;
    /**
     * Whether message type should be returned or not.
     */
    var INCLUDE_MESSAGE_TYPE = true;
    /**
     * Whether timetokens should be returned as strings by default or not.
     */
    var STRINGIFY_TIMETOKENS = false;
    /**
     * Whether message publisher `uuid` should be returned or not.
     */
    var INCLUDE_UUID = true;
    /**
     * Default number of messages which can be returned for single channel, and it is maximum as well.
     */
    var SINGLE_CHANNEL_MESSAGES_COUNT = 100;
    /**
     * Default number of messages which can be returned for multiple channels or when fetched
     * message actions.
     */
    var MULTIPLE_CHANNELS_MESSAGES_COUNT = 25;
    // endregion
    /**
     * Fetch messages from channels request.
     */
    var FetchMessagesRequest = /** @class */ (function (_super) {
        __extends(FetchMessagesRequest, _super);
        function FetchMessagesRequest(parameters) {
            var _a, _b, _c, _d, _e, _f;
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            // Apply defaults.
            var includeMessageActions = (_a = parameters.includeMessageActions) !== null && _a !== void 0 ? _a : false;
            var defaultCount = parameters.channels.length === 1 && includeMessageActions
                ? SINGLE_CHANNEL_MESSAGES_COUNT
                : MULTIPLE_CHANNELS_MESSAGES_COUNT;
            if (!parameters.count)
                parameters.count = defaultCount;
            else
                parameters.count = Math.min(parameters.count, defaultCount);
            if (parameters.includeUuid)
                parameters.includeUUID = parameters.includeUuid;
            else
                (_b = parameters.includeUUID) !== null && _b !== void 0 ? _b : (parameters.includeUUID = INCLUDE_UUID);
            (_c = parameters.stringifiedTimeToken) !== null && _c !== void 0 ? _c : (parameters.stringifiedTimeToken = STRINGIFY_TIMETOKENS);
            (_d = parameters.includeMessageType) !== null && _d !== void 0 ? _d : (parameters.includeMessageType = INCLUDE_MESSAGE_TYPE);
            (_e = parameters.includeMeta) !== null && _e !== void 0 ? _e : (parameters.includeMeta = INCLUDE_METADATA);
            (_f = parameters.logVerbosity) !== null && _f !== void 0 ? _f : (parameters.logVerbosity = LOG_VERBOSITY);
            return _this;
        }
        FetchMessagesRequest.prototype.operation = function () {
            return RequestOperation$1.PNFetchMessagesOperation;
        };
        FetchMessagesRequest.prototype.validate = function () {
            var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channels = _a.channels, includeMessageActions = _a.includeMessageActions;
            if (!subscribeKey)
                return 'Missing Subscribe Key';
            if (!channels)
                return 'Missing channels';
            if (includeMessageActions && channels.length > 1)
                return ('History can return actions data for a single channel only. Either pass a single channel ' +
                    'or disable the includeMessageActions flag.');
        };
        FetchMessagesRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse, responseChannels, channels;
                var _this = this;
                var _a;
                return __generator(this, function (_b) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    responseChannels = (_a = serviceResponse.channels) !== null && _a !== void 0 ? _a : {};
                    channels = {};
                    Object.keys(responseChannels).forEach(function (channel) {
                        // Map service response to expected data object type structure.
                        channels[channel] = responseChannels[channel].map(function (payload) {
                            // `null` message type means regular message.
                            if (payload.message_type === null)
                                payload.message_type = PubNubMessageType.Message;
                            var processedPayload = _this.processPayload(channel, payload);
                            var item = {
                                channel: channel,
                                timetoken: payload.timetoken,
                                message: processedPayload.payload,
                                messageType: payload.message_type,
                                uuid: payload.uuid,
                            };
                            if (payload.actions) {
                                var itemWithActions = item;
                                itemWithActions.actions = payload.actions;
                                // Backward compatibility for existing users.
                                // TODO: Remove in next release.
                                itemWithActions.data = payload.actions;
                            }
                            if (payload.meta)
                                item.meta = payload.meta;
                            if (processedPayload.error)
                                item.error = processedPayload.error;
                            return item;
                        });
                    });
                    if (serviceResponse.more)
                        return [2 /*return*/, { channels: responseChannels, more: serviceResponse.more }];
                    return [2 /*return*/, { channels: responseChannels }];
                });
            });
        };
        Object.defineProperty(FetchMessagesRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channels = _a.channels, includeMessageActions = _a.includeMessageActions;
                var endpoint = !includeMessageActions ? 'history' : 'history-with-actions';
                return "/v3/".concat(endpoint, "/sub-key/").concat(subscribeKey, "/channel/").concat(encodeString(channels.join(',')));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FetchMessagesRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, start = _a.start, end = _a.end, count = _a.count, includeMessageType = _a.includeMessageType, includeMeta = _a.includeMeta, includeUUID = _a.includeUUID, stringifiedTimeToken = _a.stringifiedTimeToken;
                return __assign(__assign(__assign(__assign(__assign(__assign({ max: count }, (start ? { start: start } : {})), (end ? { end: end } : {})), (stringifiedTimeToken ? { string_message_token: 'true' } : {})), (includeMeta ? { include_meta: 'true' } : {})), (includeUUID ? { include_uuid: 'true' } : {})), (includeMessageType ? { include_message_type: 'true' } : {}));
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Parse single channel data entry.
         *
         * @param channel - Channel for which {@link payload} should be processed.
         * @param payload - Source payload which should be processed and parsed to expected type.
         *
         * @returns
         */
        FetchMessagesRequest.prototype.processPayload = function (channel, payload) {
            var _a = this.parameters, crypto = _a.crypto, logVerbosity = _a.logVerbosity;
            if (!crypto || typeof payload.message !== 'string')
                return { payload: payload.message };
            var decryptedPayload;
            var error;
            try {
                var decryptedData = crypto.decrypt(payload.message);
                decryptedPayload =
                    decryptedData instanceof ArrayBuffer
                        ? JSON.parse(FetchMessagesRequest.decoder.decode(decryptedData))
                        : decryptedData;
            }
            catch (err) {
                if (logVerbosity)
                    console.log("decryption error", err.message);
                decryptedPayload = payload.message;
                error = "Error while decrypting message content: ".concat(err.message);
            }
            if (!error &&
                decryptedPayload &&
                payload.message_type == PubNubMessageType.Files &&
                typeof decryptedPayload === 'object' &&
                this.isFileMessage(decryptedPayload)) {
                var fileMessage = decryptedPayload;
                return {
                    payload: {
                        message: fileMessage.message,
                        file: __assign(__assign({}, fileMessage.file), { url: this.parameters.getFileUrl({ channel: channel, id: fileMessage.file.id, name: fileMessage.file.name }) }),
                    },
                    error: error,
                };
            }
            return { payload: decryptedPayload, error: error };
        };
        /**
         * Check whether `payload` potentially represents file message.
         *
         * @param payload - Fetched message payload.
         *
         * @returns `true` if payload can be {@link History#FileMessage|FileMessage}.
         */
        FetchMessagesRequest.prototype.isFileMessage = function (payload) {
            return payload.file !== undefined;
        };
        return FetchMessagesRequest;
    }(AbstractRequest));

    /**
     * Get Message Actions REST API module.
     */
    // endregion
    /**
     * Fetch channel message actions request.
     */
    var GetMessageActionsRequest = /** @class */ (function (_super) {
        __extends(GetMessageActionsRequest, _super);
        function GetMessageActionsRequest(parameters) {
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            return _this;
        }
        GetMessageActionsRequest.prototype.operation = function () {
            return RequestOperation$1.PNGetMessageActionsOperation;
        };
        GetMessageActionsRequest.prototype.validate = function () {
            if (!this.parameters.keySet.subscribeKey)
                return 'Missing Subscribe Key';
            if (!this.parameters.channel)
                return 'Missing message channel';
        };
        GetMessageActionsRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse, start, end;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    start = null;
                    end = null;
                    if (serviceResponse.data.length > 0) {
                        start = serviceResponse.data[0].actionTimetoken;
                        end = serviceResponse.data[serviceResponse.data.length - 1].actionTimetoken;
                    }
                    return [2 /*return*/, {
                            data: serviceResponse.data,
                            more: serviceResponse.more,
                            start: start,
                            end: end,
                        }];
                });
            });
        };
        Object.defineProperty(GetMessageActionsRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channel = _a.channel;
                return "/v1/message-actions/".concat(subscribeKey, "/channel/").concat(encodeString(channel));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GetMessageActionsRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, limit = _a.limit, start = _a.start, end = _a.end;
                return __assign(__assign(__assign({}, (start ? { start: start } : {})), (end ? { end: end } : {})), (limit ? { limit: limit } : {}));
            },
            enumerable: false,
            configurable: true
        });
        return GetMessageActionsRequest;
    }(AbstractRequest));

    /**
     * Add Message Action REST API module.
     */
    // endregion
    /**
     * Add Message Reaction request.
     */
    var AddMessageActionRequest = /** @class */ (function (_super) {
        __extends(AddMessageActionRequest, _super);
        function AddMessageActionRequest(parameters) {
            var _this = _super.call(this, { method: TransportMethod.POST }) || this;
            _this.parameters = parameters;
            return _this;
        }
        AddMessageActionRequest.prototype.operation = function () {
            return RequestOperation$1.PNAddMessageActionOperation;
        };
        AddMessageActionRequest.prototype.validate = function () {
            var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, action = _a.action, channel = _a.channel, messageTimetoken = _a.messageTimetoken;
            if (!subscribeKey)
                return 'Missing Subscribe Key';
            if (!channel)
                return 'Missing message channel';
            if (!messageTimetoken)
                return 'Missing message timetoken';
            if (!action)
                return 'Missing Action.value';
            if (!action.value)
                return 'Missing Action.value';
            if (!action.type)
                return 'Missing Action.type';
            if (action.type.length > 15)
                return 'Action.type value exceed maximum length of 15';
        };
        AddMessageActionRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, { data: serviceResponse.data }];
                });
            });
        };
        Object.defineProperty(AddMessageActionRequest.prototype, "headers", {
            get: function () {
                return { 'Content-Type': 'application/json' };
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AddMessageActionRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channel = _a.channel, messageTimetoken = _a.messageTimetoken;
                return "/v1/message-actions/".concat(subscribeKey, "/channel/").concat(encodeString(channel), "/message/").concat(messageTimetoken);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AddMessageActionRequest.prototype, "body", {
            get: function () {
                return JSON.stringify(this.parameters.action);
            },
            enumerable: false,
            configurable: true
        });
        return AddMessageActionRequest;
    }(AbstractRequest));

    /**
     * Remove Message Action REST API module.
     */
    // endregion
    /**
     * Remove specific message action request.
     */
    var RemoveMessageAction = /** @class */ (function (_super) {
        __extends(RemoveMessageAction, _super);
        function RemoveMessageAction(parameters) {
            var _this = _super.call(this, { method: TransportMethod.DELETE }) || this;
            _this.parameters = parameters;
            return _this;
        }
        RemoveMessageAction.prototype.operation = function () {
            return RequestOperation$1.PNRemoveMessageActionOperation;
        };
        RemoveMessageAction.prototype.validate = function () {
            var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channel = _a.channel, messageTimetoken = _a.messageTimetoken, actionTimetoken = _a.actionTimetoken;
            if (!subscribeKey)
                return 'Missing Subscribe Key';
            if (!channel)
                return 'Missing message action channel';
            if (!messageTimetoken)
                return 'Missing message timetoken';
            if (!actionTimetoken)
                return 'Missing action timetoken';
        };
        RemoveMessageAction.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, { data: serviceResponse.data }];
                });
            });
        };
        Object.defineProperty(RemoveMessageAction.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channel = _a.channel, actionTimetoken = _a.actionTimetoken, messageTimetoken = _a.messageTimetoken;
                return "/v1/message-actions/".concat(subscribeKey, "/channel/").concat(encodeString(channel), "/message/").concat(messageTimetoken, "/action/").concat(actionTimetoken);
            },
            enumerable: false,
            configurable: true
        });
        return RemoveMessageAction;
    }(AbstractRequest));

    /**
     * Publish File Message REST API module.
     */
    // --------------------------------------------------------
    // ----------------------- Defaults -----------------------
    // --------------------------------------------------------
    // region Defaults
    /**
     * Whether published file messages should be stored in the channel's history.
     */
    var STORE_IN_HISTORY = true;
    // endregion
    var PublishFileMessageRequest = /** @class */ (function (_super) {
        __extends(PublishFileMessageRequest, _super);
        function PublishFileMessageRequest(parameters) {
            var _a;
            var _b;
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            // Apply default request parameters.
            (_a = (_b = _this.parameters).storeInHistory) !== null && _a !== void 0 ? _a : (_b.storeInHistory = STORE_IN_HISTORY);
            return _this;
        }
        PublishFileMessageRequest.prototype.operation = function () {
            return RequestOperation$1.PNPublishFileMessageOperation;
        };
        PublishFileMessageRequest.prototype.validate = function () {
            var _a = this.parameters, channel = _a.channel, fileId = _a.fileId, fileName = _a.fileName;
            if (!channel)
                return "channel can't be empty";
            if (!fileId)
                return "file id can't be empty";
            if (!fileName)
                return "file name can't be empty";
        };
        PublishFileMessageRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, { timetoken: serviceResponse[2] }];
                });
            });
        };
        Object.defineProperty(PublishFileMessageRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, message = _a.message, channel = _a.channel, _b = _a.keySet, publishKey = _b.publishKey, subscribeKey = _b.subscribeKey, fileId = _a.fileId, fileName = _a.fileName;
                var fileMessage = __assign({ file: {
                        name: fileName,
                        id: fileId,
                    } }, (message ? { message: message } : {}));
                return "/v1/files/publish-file/".concat(publishKey, "/").concat(subscribeKey, "/0/").concat(encodeString(channel), "/0/").concat(encodeString(this.prepareMessagePayload(fileMessage)));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PublishFileMessageRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, storeInHistory = _a.storeInHistory, ttl = _a.ttl, meta = _a.meta;
                return __assign(__assign({ store: storeInHistory ? '1' : '0' }, (ttl ? { ttl: ttl } : {})), (meta && typeof meta === 'object' ? { meta: JSON.stringify(meta) } : {}));
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Pre-process provided data.
         *
         * Data will be "normalized" and encrypted if `cryptoModule` has been provided.
         *
         * @param payload - User-provided data which should be pre-processed before use.
         *
         * @returns Payload which can be used as part of request URL or body.
         *
         * @throws {Error} in case if provided `payload` or results of `encryption` can't be stringified.
         */
        PublishFileMessageRequest.prototype.prepareMessagePayload = function (payload) {
            var crypto = this.parameters.crypto;
            if (!crypto)
                return JSON.stringify(payload) || '';
            var encrypted = crypto.encrypt(JSON.stringify(payload));
            return JSON.stringify(typeof encrypted === 'string' ? encrypted : encode(encrypted));
        };
        return PublishFileMessageRequest;
    }(AbstractRequest));

    /**
     * File sharing REST API module.
     */
    // endregion
    /**
     * File download Url generation request.
     *
     * Local request which generates Url to download shared file from the specific channel.
     */
    var GetFileDownloadUrlRequest = /** @class */ (function (_super) {
        __extends(GetFileDownloadUrlRequest, _super);
        /**
         * Construct file download Url generation request.
         *
         * @param parameters - Request configuration.
         */
        function GetFileDownloadUrlRequest(parameters) {
            var _this = _super.call(this, { method: TransportMethod.LOCAL }) || this;
            _this.parameters = parameters;
            return _this;
        }
        GetFileDownloadUrlRequest.prototype.operation = function () {
            return RequestOperation$1.PNGetFileUrlOperation;
        };
        GetFileDownloadUrlRequest.prototype.validate = function () {
            var _a = this.parameters, channel = _a.channel, id = _a.id, name = _a.name;
            if (!channel)
                return "channel can't be empty";
            if (!id)
                return "file id can't be empty";
            if (!name)
                return "file name can't be empty";
        };
        GetFileDownloadUrlRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, response.url];
                });
            });
        };
        Object.defineProperty(GetFileDownloadUrlRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, channel = _a.channel, id = _a.id, name = _a.name, subscribeKey = _a.keySet.subscribeKey;
                return "/v1/files/".concat(subscribeKey, "/channels/").concat(encodeString(channel), "/files/").concat(id, "/").concat(name);
            },
            enumerable: false,
            configurable: true
        });
        return GetFileDownloadUrlRequest;
    }(AbstractRequest));

    /**
     * Delete file REST API module.
     */
    // endregion
    /**
     * Delete File request.
     */
    var DeleteFileRequest = /** @class */ (function (_super) {
        __extends(DeleteFileRequest, _super);
        function DeleteFileRequest(parameters) {
            var _this = _super.call(this, { method: TransportMethod.DELETE }) || this;
            _this.parameters = parameters;
            return _this;
        }
        DeleteFileRequest.prototype.operation = function () {
            return RequestOperation$1.PNDeleteFileOperation;
        };
        DeleteFileRequest.prototype.validate = function () {
            var _a = this.parameters, channel = _a.channel, id = _a.id, name = _a.name;
            if (!channel)
                return "channel can't be empty";
            if (!id)
                return "file id can't be empty";
            if (!name)
                return "file name can't be empty";
        };
        DeleteFileRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, serviceResponse];
                });
            });
        };
        Object.defineProperty(DeleteFileRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, id = _a.id, channel = _a.channel, name = _a.name;
                return "/v1/files/".concat(subscribeKey, "/channels/").concat(encodeString(channel), "/files/").concat(id, "/").concat(name);
            },
            enumerable: false,
            configurable: true
        });
        return DeleteFileRequest;
    }(AbstractRequest));

    /**
     * List Files REST API module.
     */
    // --------------------------------------------------------
    // ----------------------- Defaults -----------------------
    // --------------------------------------------------------
    // region Defaults
    /**
     * Number of files to return in response.
     */
    var LIMIT$6 = 100;
    // endregion
    /**
     * Files List request.
     */
    var FilesListRequest = /** @class */ (function (_super) {
        __extends(FilesListRequest, _super);
        function FilesListRequest(parameters) {
            var _a;
            var _b;
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            // Apply default request parameters.
            (_a = (_b = _this.parameters).limit) !== null && _a !== void 0 ? _a : (_b.limit = LIMIT$6);
            return _this;
        }
        FilesListRequest.prototype.operation = function () {
            return RequestOperation$1.PNListFilesOperation;
        };
        FilesListRequest.prototype.validate = function () {
            if (!this.parameters.channel)
                return "channel can't be empty";
        };
        FilesListRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, serviceResponse];
                });
            });
        };
        Object.defineProperty(FilesListRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channel = _a.channel;
                return "/v1/files/".concat(subscribeKey, "/channels/").concat(encodeString(channel), "/files");
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FilesListRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, limit = _a.limit, next = _a.next;
                return __assign({ limit: limit }, (next ? { next: next } : {}));
            },
            enumerable: false,
            configurable: true
        });
        return FilesListRequest;
    }(AbstractRequest));

    /**
     * Generate file upload URL REST API request.
     */
    // endregion
    /**
     * Generate File Upload Url request.
     */
    var GenerateFileUploadUrlRequest = /** @class */ (function (_super) {
        __extends(GenerateFileUploadUrlRequest, _super);
        function GenerateFileUploadUrlRequest(parameters) {
            var _this = _super.call(this, { method: TransportMethod.POST }) || this;
            _this.parameters = parameters;
            return _this;
        }
        GenerateFileUploadUrlRequest.prototype.operation = function () {
            return RequestOperation$1.PNGenerateUploadUrlOperation;
        };
        GenerateFileUploadUrlRequest.prototype.validate = function () {
            if (!this.parameters.channel)
                return "channel can't be empty";
            if (!this.parameters.name)
                return "'name' can't be empty";
        };
        GenerateFileUploadUrlRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, {
                            id: serviceResponse.data.id,
                            name: serviceResponse.data.name,
                            url: serviceResponse.file_upload_request.url,
                            formFields: serviceResponse.file_upload_request.form_fields,
                        }];
                });
            });
        };
        Object.defineProperty(GenerateFileUploadUrlRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channel = _a.channel;
                return "/v1/files/".concat(subscribeKey, "/channels/").concat(encodeString(channel), "/generate-upload-url");
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GenerateFileUploadUrlRequest.prototype, "body", {
            get: function () {
                return JSON.stringify({ name: this.parameters.name });
            },
            enumerable: false,
            configurable: true
        });
        return GenerateFileUploadUrlRequest;
    }(AbstractRequest));

    /**
     * Upload file REST API request.
     */
    /**
     * File Upload request.
     */
    var UploadFileRequest = /** @class */ (function (_super) {
        __extends(UploadFileRequest, _super);
        function UploadFileRequest(parameters) {
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            // Use file's actual mime type if available.
            var mimeType = parameters.file.mimeType;
            if (mimeType) {
                parameters.formFields = parameters.formFields.map(function (entry) {
                    if (entry.name === 'Content-Type')
                        return { name: entry.name, value: mimeType };
                    return entry;
                });
            }
            return _this;
        }
        UploadFileRequest.prototype.operation = function () {
            return RequestOperation$1.PNPublishFileOperation;
        };
        UploadFileRequest.prototype.validate = function () {
            var _a = this.parameters, fileId = _a.fileId, fileName = _a.fileName, file = _a.file, uploadUrl = _a.uploadUrl;
            if (!fileId)
                return "Validation failed: file 'id' can't be empty";
            if (!fileName)
                return "Validation failed: file 'name' can't be empty";
            if (!file)
                return "Validation failed: 'file' can't be empty";
            if (!uploadUrl)
                return "Validation failed: file upload 'url' can't be empty";
        };
        UploadFileRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, {
                            status: response.status,
                            message: response.body ? UploadFileRequest.decoder.decode(response.body) : 'OK',
                        }];
                });
            });
        };
        UploadFileRequest.prototype.request = function () {
            return __assign(__assign({}, _super.prototype.request.call(this)), { origin: new URL(this.parameters.uploadUrl).origin });
        };
        Object.defineProperty(UploadFileRequest.prototype, "path", {
            get: function () {
                var _a = new URL(this.parameters.uploadUrl), pathname = _a.pathname, search = _a.search;
                return "".concat(pathname).concat(search);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(UploadFileRequest.prototype, "body", {
            get: function () {
                return this.parameters.file;
            },
            enumerable: false,
            configurable: true
        });
        return UploadFileRequest;
    }(AbstractRequest));

    // endregion
    /**
     * Send file composed request.
     */
    var SendFileRequest = /** @class */ (function () {
        function SendFileRequest(parameters) {
            var _a;
            this.parameters = parameters;
            this.file = (_a = this.parameters.PubNubFile) === null || _a === void 0 ? void 0 : _a.create(parameters.file);
            if (!this.file)
                throw new Error('File upload error: unable to create File object.');
        }
        /**
         * Process user-input and upload file.
         *
         * @returns File upload request response.
         */
        SendFileRequest.prototype.process = function () {
            return __awaiter(this, void 0, void 0, function () {
                var fileName, fileId;
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.generateFileUploadUrl()
                            .then(function (result) {
                            fileName = result.name;
                            fileId = result.id;
                            return _this.uploadFile(result);
                        })
                            .then(function () { return _this.publishFileMessage(fileId, fileName); })
                            .catch(function (error) {
                            var errorStatus = PubNubAPIError.create(error).toStatus(RequestOperation$1.PNPublishFileOperation);
                            throw new PubNubError('File upload error.', errorStatus);
                        })];
                });
            });
        };
        /**
         * Generate pre-signed file upload Url.
         *
         * @returns File upload credentials.
         */
        SendFileRequest.prototype.generateFileUploadUrl = function () {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new GenerateFileUploadUrlRequest(__assign(__assign({}, this.parameters), { name: this.file.name, keySet: this.parameters.keySet }));
                    return [2 /*return*/, this.parameters.sendRequest(request)];
                });
            });
        };
        /**
         * Prepare and upload {@link PubNub} File object to remote storage.
         *
         * @param uploadParameters - File upload request parameters.
         *
         * @returns
         */
        SendFileRequest.prototype.uploadFile = function (uploadParameters) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, cipherKey, PubNubFile, crypto, cryptography, id, name, url, formFields, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _a = this.parameters, cipherKey = _a.cipherKey, PubNubFile = _a.PubNubFile, crypto = _a.crypto, cryptography = _a.cryptography;
                            id = uploadParameters.id, name = uploadParameters.name, url = uploadParameters.url, formFields = uploadParameters.formFields;
                            if (!this.parameters.PubNubFile.supportsEncryptFile) return [3 /*break*/, 4];
                            if (!(!cipherKey && crypto)) return [3 /*break*/, 2];
                            _b = this;
                            return [4 /*yield*/, crypto.encryptFile(this.file, PubNubFile)];
                        case 1:
                            _b.file = (_d.sent());
                            return [3 /*break*/, 4];
                        case 2:
                            if (!(cipherKey && cryptography)) return [3 /*break*/, 4];
                            _c = this;
                            return [4 /*yield*/, cryptography.encryptFile(cipherKey, this.file, PubNubFile)];
                        case 3:
                            _c.file = (_d.sent());
                            _d.label = 4;
                        case 4: return [2 /*return*/, this.parameters.sendRequest(new UploadFileRequest({
                                fileId: id,
                                fileName: name,
                                file: this.file,
                                uploadUrl: url,
                                formFields: formFields,
                            }))];
                    }
                });
            });
        };
        SendFileRequest.prototype.publishFileMessage = function (fileId, fileName) {
            return __awaiter(this, void 0, void 0, function () {
                var result, retries, wasSuccessful;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            result = { timetoken: '0' };
                            retries = this.parameters.fileUploadPublishRetryLimit;
                            wasSuccessful = false;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.parameters.publishFile(__assign(__assign({}, this.parameters), { fileId: fileId, fileName: fileName }))];
                        case 2:
                            result = _a.sent();
                            wasSuccessful = true;
                            return [3 /*break*/, 4];
                        case 3:
                            _a.sent();
                            retries -= 1;
                            return [3 /*break*/, 4];
                        case 4:
                            if (!wasSuccessful && retries > 0) return [3 /*break*/, 1];
                            _a.label = 5;
                        case 5:
                            if (!wasSuccessful) {
                                throw new PubNubError('Publish failed. You may want to execute that operation manually using pubnub.publishFile', { error: true, channel: this.parameters.channel, id: fileId, name: fileName });
                            }
                            else
                                return [2 /*return*/, { status: 200, timetoken: result.timetoken, id: fileId, name: fileName }];
                    }
                });
            });
        };
        return SendFileRequest;
    }());

    /**
     * PAM Revoke Token REST API module.
     */
    // endregion
    /**
     * Access token revoke request.
     *
     * Invalidate token and permissions which has been granted for it.
     */
    var RevokeTokenRequest = /** @class */ (function (_super) {
        __extends(RevokeTokenRequest, _super);
        function RevokeTokenRequest(parameters) {
            var _this = _super.call(this, { method: TransportMethod.DELETE }) || this;
            _this.parameters = parameters;
            return _this;
        }
        RevokeTokenRequest.prototype.operation = function () {
            return RequestOperation$1.PNAccessManagerRevokeToken;
        };
        RevokeTokenRequest.prototype.validate = function () {
            if (!this.parameters.keySet.secretKey)
                return 'Missing Secret Key';
            if (!this.parameters.token)
                return "token can't be empty";
        };
        RevokeTokenRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, {}];
                });
            });
        };
        Object.defineProperty(RevokeTokenRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, token = _a.token;
                return "/v3/pam/".concat(subscribeKey, "/grant/").concat(encodeString(token));
            },
            enumerable: false,
            configurable: true
        });
        return RevokeTokenRequest;
    }(AbstractRequest));

    /**
     * PAM Grant Token REST API module.
     */
    // endregion
    /**
     * Grant token permissions request.
     */
    var GrantTokenRequest = /** @class */ (function (_super) {
        __extends(GrantTokenRequest, _super);
        function GrantTokenRequest(parameters) {
            var _a, _b;
            var _c, _d;
            var _this = _super.call(this, { method: TransportMethod.POST }) || this;
            _this.parameters = parameters;
            // Apply defaults.
            (_a = (_c = _this.parameters).resources) !== null && _a !== void 0 ? _a : (_c.resources = {});
            (_b = (_d = _this.parameters).patterns) !== null && _b !== void 0 ? _b : (_d.patterns = {});
            return _this;
        }
        GrantTokenRequest.prototype.operation = function () {
            return RequestOperation$1.PNAccessManagerGrantToken;
        };
        GrantTokenRequest.prototype.validate = function () {
            var _a, _b, _c, _d, _e, _f;
            var _g = this.parameters, _h = _g.keySet, subscribeKey = _h.subscribeKey, publishKey = _h.publishKey, secretKey = _h.secretKey, resources = _g.resources, patterns = _g.patterns;
            if (!subscribeKey)
                return 'Missing Subscribe Key';
            if (!publishKey)
                return 'Missing Publish Key';
            if (!secretKey)
                return 'Missing Secret Key';
            if (!resources && !patterns)
                return 'Missing either Resources or Patterns';
            if (this.isVspPermissions(this.parameters) &&
                ('channels' in ((_a = this.parameters.resources) !== null && _a !== void 0 ? _a : {}) ||
                    'uuids' in ((_b = this.parameters.resources) !== null && _b !== void 0 ? _b : {}) ||
                    'groups' in ((_c = this.parameters.resources) !== null && _c !== void 0 ? _c : {}) ||
                    'channels' in ((_d = this.parameters.patterns) !== null && _d !== void 0 ? _d : {}) ||
                    'uuids' in ((_e = this.parameters.patterns) !== null && _e !== void 0 ? _e : {}) ||
                    'groups' in ((_f = this.parameters.patterns) !== null && _f !== void 0 ? _f : {})))
                return ('Cannot mix `users`, `spaces` and `authorizedUserId` with `uuids`, `channels`,' +
                    ' `groups` and `authorized_uuid`');
            var permissionsEmpty = true;
            [this.parameters.resources, this.parameters.patterns].forEach(function (refPerm) {
                Object.keys(refPerm !== null && refPerm !== void 0 ? refPerm : {}).forEach(function (scope) {
                    var _a;
                    // @ts-expect-error Permissions with backward compatibility.
                    if (refPerm && permissionsEmpty && Object.keys((_a = refPerm[scope]) !== null && _a !== void 0 ? _a : {}).length > 0) {
                        permissionsEmpty = false;
                    }
                });
            });
            if (permissionsEmpty)
                return 'Missing values for either Resources or Patterns';
        };
        GrantTokenRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, serviceResponse.data.token];
                });
            });
        };
        Object.defineProperty(GrantTokenRequest.prototype, "path", {
            get: function () {
                return "/v3/pam/".concat(this.parameters.keySet.subscribeKey, "/grant");
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GrantTokenRequest.prototype, "body", {
            get: function () {
                var _this = this;
                var _a = this.parameters, ttl = _a.ttl, meta = _a.meta;
                var body = __assign({}, (ttl || ttl === 0 ? { ttl: ttl } : {}));
                var uuid = this.isVspPermissions(this.parameters)
                    ? this.parameters.authorizedUserId
                    : this.parameters.authorized_uuid;
                var permissions = {};
                var resourcePermissions = {};
                var patternPermissions = {};
                var mapPermissions = function (name, permissionBit, type, permissions) {
                    if (!permissions[type])
                        permissions[type] = {};
                    permissions[type][name] = permissionBit;
                };
                var _b = this.parameters, resources = _b.resources, patterns = _b.patterns;
                [resources, patterns].forEach(function (refPerm, idx) {
                    var _a, _b, _c, _d, _e;
                    var target = idx === 0 ? resourcePermissions : patternPermissions;
                    var channelsPermissions = {};
                    var channelGroupsPermissions = {};
                    var uuidsPermissions = {};
                    if (refPerm) {
                        // Check whether working with legacy Objects permissions.
                        if ('spaces' in refPerm || 'users' in refPerm) {
                            channelsPermissions = (_a = refPerm.spaces) !== null && _a !== void 0 ? _a : {};
                            uuidsPermissions = (_b = refPerm.users) !== null && _b !== void 0 ? _b : {};
                        }
                        else if ('channels' in refPerm || 'uuids' in refPerm || 'groups' in refPerm) {
                            channelsPermissions = (_c = refPerm.channels) !== null && _c !== void 0 ? _c : {};
                            channelGroupsPermissions = (_d = refPerm.groups) !== null && _d !== void 0 ? _d : {};
                            uuidsPermissions = (_e = refPerm.uuids) !== null && _e !== void 0 ? _e : {};
                        }
                    }
                    Object.keys(channelsPermissions).forEach(function (channel) {
                        return mapPermissions(channel, _this.extractPermissions(channelsPermissions[channel]), 'channels', target);
                    });
                    Object.keys(channelGroupsPermissions).forEach(function (groups) {
                        return mapPermissions(groups, _this.extractPermissions(channelGroupsPermissions[groups]), 'groups', target);
                    });
                    Object.keys(uuidsPermissions).forEach(function (uuids) {
                        return mapPermissions(uuids, _this.extractPermissions(uuidsPermissions[uuids]), 'uuids', target);
                    });
                });
                if (uuid)
                    permissions.uuid = "".concat(uuid);
                if (meta)
                    permissions.meta = meta;
                body.permissions = permissions;
                return JSON.stringify(body);
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Extract permissions bit from permission configuration object.
         *
         * @param permissions - User provided scope-based permissions.
         *
         * @returns Permissions bit.
         */
        GrantTokenRequest.prototype.extractPermissions = function (permissions) {
            var permissionsResult = 0;
            if ('join' in permissions && permissions.join)
                permissionsResult |= 128;
            if ('update' in permissions && permissions.update)
                permissionsResult |= 64;
            if ('get' in permissions && permissions.get)
                permissionsResult |= 32;
            if ('delete' in permissions && permissions.delete)
                permissionsResult |= 8;
            if ('manage' in permissions && permissions.manage)
                permissionsResult |= 4;
            if ('write' in permissions && permissions.write)
                permissionsResult |= 2;
            if ('read' in permissions && permissions.read)
                permissionsResult |= 1;
            return permissionsResult;
        };
        /**
         * Check whether provided parameters is part of legacy VSP access token configuration.
         *
         * @param parameters - Parameters which should be checked.
         *
         * @returns VSP request parameters if it is legacy configuration.
         */
        GrantTokenRequest.prototype.isVspPermissions = function (parameters) {
            var _a, _b, _c, _d;
            return ('authorizedUserId' in parameters ||
                'spaces' in ((_a = parameters.resources) !== null && _a !== void 0 ? _a : {}) ||
                'users' in ((_b = parameters.resources) !== null && _b !== void 0 ? _b : {}) ||
                'spaces' in ((_c = parameters.patterns) !== null && _c !== void 0 ? _c : {}) ||
                'users' in ((_d = parameters.patterns) !== null && _d !== void 0 ? _d : {}));
        };
        return GrantTokenRequest;
    }(AbstractRequest));

    /**
     * PAM Grant REST API module.
     */
    // --------------------------------------------------------
    // ----------------------- Defaults -----------------------
    // --------------------------------------------------------
    // region Defaults
    /**
     * Resources `read` permission.
     */
    var READ_PERMISSION = false;
    /**
     * Resources `write` permission.
     */
    var WRITE_PERMISSION = false;
    /**
     * Resources `delete` permission.
     */
    var DELETE_PERMISSION = false;
    /**
     * Resources `get` permission.
     */
    var GET_PERMISSION = false;
    /**
     * Resources `update` permission.
     */
    var UPDATE_PERMISSION = false;
    /**
     * Resources `manage` permission.
     */
    var MANAGE_PERMISSION = false;
    /**
     * Resources `join` permission.
     */
    var JOIN_PERMISSION = false;
    // endregion
    /**
     * Grant permissions request.
     */
    var GrantRequest = /** @class */ (function (_super) {
        __extends(GrantRequest, _super);
        function GrantRequest(parameters) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            var _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            // Apply defaults.
            (_a = (_l = _this.parameters).channels) !== null && _a !== void 0 ? _a : (_l.channels = []);
            (_b = (_m = _this.parameters).channelGroups) !== null && _b !== void 0 ? _b : (_m.channelGroups = []);
            (_c = (_o = _this.parameters).uuids) !== null && _c !== void 0 ? _c : (_o.uuids = []);
            (_d = (_p = _this.parameters).read) !== null && _d !== void 0 ? _d : (_p.read = READ_PERMISSION);
            (_e = (_q = _this.parameters).write) !== null && _e !== void 0 ? _e : (_q.write = WRITE_PERMISSION);
            (_f = (_r = _this.parameters).delete) !== null && _f !== void 0 ? _f : (_r.delete = DELETE_PERMISSION);
            (_g = (_s = _this.parameters).get) !== null && _g !== void 0 ? _g : (_s.get = GET_PERMISSION);
            (_h = (_t = _this.parameters).update) !== null && _h !== void 0 ? _h : (_t.update = UPDATE_PERMISSION);
            (_j = (_u = _this.parameters).manage) !== null && _j !== void 0 ? _j : (_u.manage = MANAGE_PERMISSION);
            (_k = (_v = _this.parameters).join) !== null && _k !== void 0 ? _k : (_v.join = JOIN_PERMISSION);
            return _this;
        }
        GrantRequest.prototype.operation = function () {
            return RequestOperation$1.PNAccessManagerGrant;
        };
        GrantRequest.prototype.validate = function () {
            var _a;
            var _b = this.parameters, _c = _b.keySet, subscribeKey = _c.subscribeKey, publishKey = _c.publishKey, secretKey = _c.secretKey, uuids = _b.uuids, channels = _b.channels, channelGroups = _b.channelGroups;
            if (!subscribeKey)
                return 'Missing Subscribe Key';
            if (!publishKey)
                return 'Missing Publish Key';
            if (!secretKey)
                return 'Missing Secret Key';
            if ((uuids === null || uuids === void 0 ? void 0 : uuids.length) !== 0 && ((_a = this.parameters.authKeys) === null || _a === void 0 ? void 0 : _a.length) === 0)
                return 'authKeys are required for grant request on uuids';
            if ((uuids === null || uuids === void 0 ? void 0 : uuids.length) && ((channels === null || channels === void 0 ? void 0 : channels.length) !== 0 || (channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.length) !== 0))
                return 'Both channel/channel group and uuid cannot be used in the same request';
        };
        GrantRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, serviceResponse.payload];
                });
            });
        };
        Object.defineProperty(GrantRequest.prototype, "path", {
            get: function () {
                return "/v2/auth/grant/sub-key/".concat(this.parameters.keySet.subscribeKey);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GrantRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, channels = _a.channels, channelGroups = _a.channelGroups, authKeys = _a.authKeys, uuids = _a.uuids, read = _a.read, write = _a.write, manage = _a.manage, del = _a.delete, get = _a.get, join = _a.join, update = _a.update, ttl = _a.ttl;
                return __assign(__assign(__assign(__assign(__assign(__assign({}, (channels && (channels === null || channels === void 0 ? void 0 : channels.length) > 0 ? { channel: channels.join(',') } : {})), (channelGroups && (channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.length) > 0 ? { 'channel-group': channelGroups.join(',') } : {})), (authKeys && (authKeys === null || authKeys === void 0 ? void 0 : authKeys.length) > 0 ? { auth: authKeys.join(',') } : {})), (uuids && (uuids === null || uuids === void 0 ? void 0 : uuids.length) > 0 ? { 'target-uuid': uuids.join(',') } : {})), { r: read ? '1' : '0', w: write ? '1' : '0', m: manage ? '1' : '0', d: del ? '1' : '0', g: get ? '1' : '0', j: join ? '1' : '0', u: update ? '1' : '0' }), (ttl || ttl === 0 ? { ttl: ttl } : {}));
            },
            enumerable: false,
            configurable: true
        });
        return GrantRequest;
    }(AbstractRequest));

    /**
     * PAM Audit REST API module.
     */
    // --------------------------------------------------------
    // ----------------------- Defaults -----------------------
    // --------------------------------------------------------
    // region Defaults
    /**
     * Auth keys for which permissions should be audited.
     */
    var AUTH_KEYS = [];
    // endregion
    /**
     * Permissions audit request.
     */
    var AuditRequest = /** @class */ (function (_super) {
        __extends(AuditRequest, _super);
        function AuditRequest(parameters) {
            var _a;
            var _b;
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            // Apply default request parameters.
            (_a = (_b = _this.parameters).authKeys) !== null && _a !== void 0 ? _a : (_b.authKeys = AUTH_KEYS);
            return _this;
        }
        AuditRequest.prototype.operation = function () {
            return RequestOperation$1.PNAccessManagerAudit;
        };
        AuditRequest.prototype.validate = function () {
            if (!this.parameters.keySet.subscribeKey)
                return 'Missing Subscribe Key';
        };
        AuditRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, serviceResponse.payload];
                });
            });
        };
        Object.defineProperty(AuditRequest.prototype, "path", {
            get: function () {
                return "/v2/auth/audit/sub-key/".concat(this.parameters.keySet.subscribeKey);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AuditRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, channel = _a.channel, channelGroup = _a.channelGroup, authKeys = _a.authKeys;
                return __assign(__assign(__assign({}, (channel ? { channel: channel } : {})), (channelGroup ? { 'channel-group': channelGroup } : {})), (authKeys && authKeys.length ? { auth: authKeys.join(',') } : {}));
            },
            enumerable: false,
            configurable: true
        });
        return AuditRequest;
    }(AbstractRequest));

    var SubscribeCapable = /** @class */ (function () {
        function SubscribeCapable() {
        }
        SubscribeCapable.prototype.subscribe = function () {
            var _a, _b;
            this.pubnub.subscribe(__assign({ channels: this.channelNames, channelGroups: this.groupNames }, (((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.cursor) === null || _b === void 0 ? void 0 : _b.timetoken) && { timetoken: this.options.cursor.timetoken })));
        };
        SubscribeCapable.prototype.unsubscribe = function () {
            this.pubnub.unsubscribe({
                channels: this.channelNames.filter(function (c) { return !c.endsWith('-pnpres'); }),
                channelGroups: this.groupNames.filter(function (cg) { return !cg.endsWith('-pnpres'); }),
            });
        };
        Object.defineProperty(SubscribeCapable.prototype, "onMessage", {
            set: function (onMessageListener) {
                this.listener.message = onMessageListener;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SubscribeCapable.prototype, "onPresence", {
            set: function (onPresenceListener) {
                this.listener.presence = onPresenceListener;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SubscribeCapable.prototype, "onSignal", {
            set: function (onSignalListener) {
                this.listener.signal = onSignalListener;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SubscribeCapable.prototype, "onObjects", {
            set: function (onObjectsListener) {
                this.listener.objects = onObjectsListener;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SubscribeCapable.prototype, "onMessageAction", {
            set: function (messageActionEventListener) {
                this.listener.messageAction = messageActionEventListener;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SubscribeCapable.prototype, "onFile", {
            set: function (fileEventListener) {
                this.listener.file = fileEventListener;
            },
            enumerable: false,
            configurable: true
        });
        SubscribeCapable.prototype.addListener = function (listener) {
            this.eventEmitter.addListener(listener, this.channelNames.filter(function (c) { return !c.endsWith('-pnpres'); }), this.groupNames.filter(function (cg) { return !cg.endsWith('-pnpres'); }));
        };
        SubscribeCapable.prototype.removeListener = function (listener) {
            this.eventEmitter.removeListener(listener, this.channelNames, this.groupNames);
        };
        Object.defineProperty(SubscribeCapable.prototype, "channels", {
            get: function () {
                return this.channelNames.slice(0);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SubscribeCapable.prototype, "channelGroups", {
            get: function () {
                return this.groupNames.slice(0);
            },
            enumerable: false,
            configurable: true
        });
        return SubscribeCapable;
    }());

    var SubscriptionSet = /** @class */ (function (_super) {
        __extends(SubscriptionSet, _super);
        function SubscriptionSet(_a) {
            var _b = _a.channels, channels = _b === void 0 ? [] : _b, _c = _a.channelGroups, channelGroups = _c === void 0 ? [] : _c, subscriptionOptions = _a.subscriptionOptions, eventEmitter = _a.eventEmitter, pubnub = _a.pubnub;
            var _this = _super.call(this) || this;
            _this.channelNames = [];
            _this.groupNames = [];
            _this.subscriptionList = [];
            _this.options = subscriptionOptions;
            _this.eventEmitter = eventEmitter;
            _this.pubnub = pubnub;
            channels.forEach(function (c) {
                var subscription = _this.pubnub.channel(c).subscription(_this.options);
                _this.channelNames = __spreadArray(__spreadArray([], __read(_this.channelNames), false), __read(subscription.channels), false);
                _this.subscriptionList.push(subscription);
            });
            channelGroups.forEach(function (cg) {
                var subscription = _this.pubnub.channelGroup(cg).subscription(_this.options);
                _this.groupNames = __spreadArray(__spreadArray([], __read(_this.groupNames), false), __read(subscription.channelGroups), false);
                _this.subscriptionList.push(subscription);
            });
            _this.listener = {};
            eventEmitter.addListener(_this.listener, _this.channelNames.filter(function (c) { return !c.endsWith('-pnpres'); }), _this.groupNames.filter(function (cg) { return !cg.endsWith('-pnpres'); }));
            return _this;
        }
        SubscriptionSet.prototype.addSubscription = function (subscription) {
            this.subscriptionList.push(subscription);
            this.channelNames = __spreadArray(__spreadArray([], __read(this.channelNames), false), __read(subscription.channels), false);
            this.groupNames = __spreadArray(__spreadArray([], __read(this.groupNames), false), __read(subscription.channelGroups), false);
        };
        SubscriptionSet.prototype.removeSubscription = function (subscription) {
            var channelsToRemove = subscription.channels;
            var groupsToRemove = subscription.channelGroups;
            this.channelNames = this.channelNames.filter(function (c) { return !channelsToRemove.includes(c); });
            this.groupNames = this.groupNames.filter(function (cg) { return !groupsToRemove.includes(cg); });
            this.subscriptionList = this.subscriptionList.filter(function (s) { return s !== subscription; });
        };
        SubscriptionSet.prototype.addSubscriptionSet = function (subscriptionSet) {
            this.subscriptionList = __spreadArray(__spreadArray([], __read(this.subscriptionList), false), __read(subscriptionSet.subscriptions), false);
            this.channelNames = __spreadArray(__spreadArray([], __read(this.channelNames), false), __read(subscriptionSet.channels), false);
            this.groupNames = __spreadArray(__spreadArray([], __read(this.groupNames), false), __read(subscriptionSet.channelGroups), false);
        };
        SubscriptionSet.prototype.removeSubscriptionSet = function (subscriptionSet) {
            var channelsToRemove = subscriptionSet.channels;
            var groupsToRemove = subscriptionSet.channelGroups;
            this.channelNames = this.channelNames.filter(function (c) { return !channelsToRemove.includes(c); });
            this.groupNames = this.groupNames.filter(function (cg) { return !groupsToRemove.includes(cg); });
            this.subscriptionList = this.subscriptionList.filter(function (s) { return !subscriptionSet.subscriptions.includes(s); });
        };
        Object.defineProperty(SubscriptionSet.prototype, "subscriptions", {
            get: function () {
                return this.subscriptionList.slice(0);
            },
            enumerable: false,
            configurable: true
        });
        return SubscriptionSet;
    }(SubscribeCapable));

    var Subscription = /** @class */ (function (_super) {
        __extends(Subscription, _super);
        function Subscription(_a) {
            var channels = _a.channels, channelGroups = _a.channelGroups, subscriptionOptions = _a.subscriptionOptions, eventEmitter = _a.eventEmitter, pubnub = _a.pubnub;
            var _this = _super.call(this) || this;
            _this.channelNames = [];
            _this.groupNames = [];
            _this.channelNames = channels;
            _this.groupNames = channelGroups;
            _this.options = subscriptionOptions;
            _this.pubnub = pubnub;
            _this.eventEmitter = eventEmitter;
            _this.listener = {};
            eventEmitter.addListener(_this.listener, _this.channelNames.filter(function (c) { return !c.endsWith('-pnpres'); }), _this.groupNames.filter(function (cg) { return !cg.endsWith('-pnpres'); }));
            return _this;
        }
        Subscription.prototype.addSubscription = function (subscription) {
            return new SubscriptionSet({
                channels: __spreadArray(__spreadArray([], __read(this.channelNames), false), __read(subscription.channels), false),
                channelGroups: __spreadArray(__spreadArray([], __read(this.groupNames), false), __read(subscription.channelGroups), false),
                subscriptionOptions: __assign(__assign({}, this.options), subscription === null || subscription === void 0 ? void 0 : subscription.options),
                eventEmitter: this.eventEmitter,
                pubnub: this.pubnub,
            });
        };
        return Subscription;
    }(SubscribeCapable));

    var ChannelMetadata = /** @class */ (function () {
        function ChannelMetadata(id, eventEmitter, pubnub) {
            this.id = id;
            this.eventEmitter = eventEmitter;
            this.pubnub = pubnub;
        }
        ChannelMetadata.prototype.subscription = function (subscriptionOptions) {
            return new Subscription({
                channels: [this.id],
                channelGroups: [],
                subscriptionOptions: subscriptionOptions,
                eventEmitter: this.eventEmitter,
                pubnub: this.pubnub,
            });
        };
        return ChannelMetadata;
    }());

    var ChannelGroup = /** @class */ (function () {
        function ChannelGroup(channelGroup, eventEmitter, pubnub) {
            this.eventEmitter = eventEmitter;
            this.pubnub = pubnub;
            this.name = channelGroup;
        }
        ChannelGroup.prototype.subscription = function (subscriptionOptions) {
            return new Subscription({
                channels: [],
                channelGroups: (subscriptionOptions === null || subscriptionOptions === void 0 ? void 0 : subscriptionOptions.receivePresenceEvents) ? [this.name, "".concat(this.name, "-pnpres")] : [this.name],
                subscriptionOptions: subscriptionOptions,
                eventEmitter: this.eventEmitter,
                pubnub: this.pubnub,
            });
        };
        return ChannelGroup;
    }());

    var UserMetadata = /** @class */ (function () {
        function UserMetadata(id, eventEmitter, pubnub) {
            this.id = id;
            this.eventEmitter = eventEmitter;
            this.pubnub = pubnub;
        }
        UserMetadata.prototype.subscription = function (subscriptionOptions) {
            return new Subscription({
                channels: [this.id],
                channelGroups: [],
                subscriptionOptions: subscriptionOptions,
                eventEmitter: this.eventEmitter,
                pubnub: this.pubnub,
            });
        };
        return UserMetadata;
    }());

    var Channel = /** @class */ (function () {
        function Channel(channelName, eventEmitter, pubnub) {
            this.eventEmitter = eventEmitter;
            this.pubnub = pubnub;
            this.name = channelName;
        }
        Channel.prototype.subscription = function (subscriptionOptions) {
            return new Subscription({
                channels: (subscriptionOptions === null || subscriptionOptions === void 0 ? void 0 : subscriptionOptions.receivePresenceEvents) ? [this.name, "".concat(this.name, "-pnpres")] : [this.name],
                channelGroups: [],
                subscriptionOptions: subscriptionOptions,
                eventEmitter: this.eventEmitter,
                pubnub: this.pubnub,
            });
        };
        return Channel;
    }());

    /**
     * Remove channel group channels REST API module.
     */
    // endregion
    /**
     * Remove channel group channels request.
     */
    // prettier-ignore
    var RemoveChannelGroupChannelsRequest = /** @class */ (function (_super) {
        __extends(RemoveChannelGroupChannelsRequest, _super);
        function RemoveChannelGroupChannelsRequest(parameters) {
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            return _this;
        }
        RemoveChannelGroupChannelsRequest.prototype.operation = function () {
            return RequestOperation$1.PNRemoveChannelsFromGroupOperation;
        };
        RemoveChannelGroupChannelsRequest.prototype.validate = function () {
            var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channels = _a.channels, channelGroup = _a.channelGroup;
            if (!subscribeKey)
                return 'Missing Subscribe Key';
            if (!channelGroup)
                return 'Missing Channel Group';
            if (!channels)
                return 'Missing channels';
        };
        RemoveChannelGroupChannelsRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, {}];
                });
            });
        };
        Object.defineProperty(RemoveChannelGroupChannelsRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channelGroup = _a.channelGroup;
                return "/v1/channel-registration/sub-key/".concat(subscribeKey, "/channel-group/").concat(encodeString(channelGroup));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(RemoveChannelGroupChannelsRequest.prototype, "queryParameters", {
            get: function () {
                return { remove: this.parameters.channels.join(',') };
            },
            enumerable: false,
            configurable: true
        });
        return RemoveChannelGroupChannelsRequest;
    }(AbstractRequest));

    /**
     * Add channel group channels REST API module.
     */
    // endregion
    /**
     * Add channel group channels request.
     */
    var AddChannelGroupChannelsRequest = /** @class */ (function (_super) {
        __extends(AddChannelGroupChannelsRequest, _super);
        function AddChannelGroupChannelsRequest(parameters) {
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            return _this;
        }
        AddChannelGroupChannelsRequest.prototype.operation = function () {
            return RequestOperation$1.PNAddChannelsToGroupOperation;
        };
        AddChannelGroupChannelsRequest.prototype.validate = function () {
            var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channels = _a.channels, channelGroup = _a.channelGroup;
            if (!subscribeKey)
                return 'Missing Subscribe Key';
            if (!channelGroup)
                return 'Missing Channel Group';
            if (!channels)
                return 'Missing channels';
        };
        AddChannelGroupChannelsRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, {}];
                });
            });
        };
        Object.defineProperty(AddChannelGroupChannelsRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channelGroup = _a.channelGroup;
                return "/v1/channel-registration/sub-key/".concat(subscribeKey, "/channel-group/").concat(encodeString(channelGroup));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AddChannelGroupChannelsRequest.prototype, "queryParameters", {
            get: function () {
                return { add: this.parameters.channels.join(',') };
            },
            enumerable: false,
            configurable: true
        });
        return AddChannelGroupChannelsRequest;
    }(AbstractRequest));

    /**
     * List channel group channels REST API module.
     */
    // endregion
    /**
     * List Channel Group Channels request.
     */
    var ListChannelGroupChannels = /** @class */ (function (_super) {
        __extends(ListChannelGroupChannels, _super);
        function ListChannelGroupChannels(parameters) {
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            return _this;
        }
        ListChannelGroupChannels.prototype.operation = function () {
            return RequestOperation$1.PNChannelsForGroupOperation;
        };
        ListChannelGroupChannels.prototype.validate = function () {
            if (!this.parameters.keySet.subscribeKey)
                return 'Missing Subscribe Key';
            if (!this.parameters.channelGroup)
                return 'Missing Channel Group';
        };
        ListChannelGroupChannels.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, { channels: serviceResponse.payload.channels }];
                });
            });
        };
        Object.defineProperty(ListChannelGroupChannels.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channelGroup = _a.channelGroup;
                return "/v1/channel-registration/sub-key/".concat(subscribeKey, "/channel-group/").concat(encodeString(channelGroup));
            },
            enumerable: false,
            configurable: true
        });
        return ListChannelGroupChannels;
    }(AbstractRequest));

    /**
     * Delete channel group REST API module.
     */
    // endregion
    /**
     * Channel group delete request.
     */
    var DeleteChannelGroupRequest = /** @class */ (function (_super) {
        __extends(DeleteChannelGroupRequest, _super);
        function DeleteChannelGroupRequest(parameters) {
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            return _this;
        }
        DeleteChannelGroupRequest.prototype.operation = function () {
            return RequestOperation$1.PNRemoveGroupOperation;
        };
        DeleteChannelGroupRequest.prototype.validate = function () {
            if (!this.parameters.keySet.subscribeKey)
                return 'Missing Subscribe Key';
            if (!this.parameters.channelGroup)
                return 'Missing Channel Group';
        };
        DeleteChannelGroupRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, {}];
                });
            });
        };
        Object.defineProperty(DeleteChannelGroupRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channelGroup = _a.channelGroup;
                return "/v1/channel-registration/sub-key/".concat(subscribeKey, "/channel-group/").concat(encodeString(channelGroup), "/remove");
            },
            enumerable: false,
            configurable: true
        });
        return DeleteChannelGroupRequest;
    }(AbstractRequest));

    /**
     * List All Channel Groups REST API module.
     */
    // endregion
    /**
     * List all channel groups request.
     */
    var ListChannelGroupsRequest = /** @class */ (function (_super) {
        __extends(ListChannelGroupsRequest, _super);
        function ListChannelGroupsRequest(parameters) {
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            return _this;
        }
        ListChannelGroupsRequest.prototype.operation = function () {
            return RequestOperation$1.PNChannelGroupsOperation;
        };
        ListChannelGroupsRequest.prototype.validate = function () {
            if (!this.parameters.keySet.subscribeKey)
                return 'Missing Subscribe Key';
        };
        ListChannelGroupsRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, { groups: serviceResponse.payload.groups }];
                });
            });
        };
        Object.defineProperty(ListChannelGroupsRequest.prototype, "path", {
            get: function () {
                return "/v1/channel-registration/sub-key/".concat(this.parameters.keySet.subscribeKey, "/channel-group");
            },
            enumerable: false,
            configurable: true
        });
        return ListChannelGroupsRequest;
    }(AbstractRequest));

    /**
     * PubNub Channel Groups API module.
     */
    var PubnubChannelGroups = /** @class */ (function () {
        function PubnubChannelGroups(keySet, 
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        sendRequest) {
            this.keySet = keySet;
            this.sendRequest = sendRequest;
        }
        /**
         * Fetch channel group channels.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get channel group channels response or `void` in case if `callback`
         * provided.
         */
        PubnubChannelGroups.prototype.listChannels = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new ListChannelGroupChannels(__assign(__assign({}, parameters), { keySet: this.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Fetch all channel groups.
         *
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get all channel groups response or `void` in case if `callback` provided.
         *
         * @deprecated
         */
        PubnubChannelGroups.prototype.listGroups = function (callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new ListChannelGroupsRequest({ keySet: this.keySet });
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Add channels to the channel group.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous add channels to the channel group response or `void` in case if
         * `callback` provided.
         */
        PubnubChannelGroups.prototype.addChannels = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new AddChannelGroupChannelsRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Remove channels from the channel group.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous remove channels from the channel group response or `void` in
         * case if `callback` provided.
         */
        PubnubChannelGroups.prototype.removeChannels = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new RemoveChannelGroupChannelsRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Remove channel group.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous remove channel group response or `void` in case if `callback` provided.
         */
        PubnubChannelGroups.prototype.deleteGroup = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new DeleteChannelGroupRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        return PubnubChannelGroups;
    }());

    /**
     * Manage channels enabled for device push REST API module.
     */
    // --------------------------------------------------------
    // ----------------------- Defaults -----------------------
    // --------------------------------------------------------
    // region Defaults
    /**
     * Environment for which APNS2 notifications
     */
    var ENVIRONMENT = 'development';
    /**
     * Maximum number of channels in `list` response.
     */
    var MAX_COUNT = 1000;
    // endregion
    /**
     * Base push notification request.
     */
    var BasePushNotificationChannelsRequest = /** @class */ (function (_super) {
        __extends(BasePushNotificationChannelsRequest, _super);
        function BasePushNotificationChannelsRequest(parameters) {
            var _a;
            var _b;
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            // Apply request defaults
            if (_this.parameters.pushGateway === 'apns2')
                (_a = (_b = _this.parameters).environment) !== null && _a !== void 0 ? _a : (_b.environment = ENVIRONMENT);
            if (_this.parameters.count && _this.parameters.count > MAX_COUNT)
                _this.parameters.count = MAX_COUNT;
            return _this;
        }
        BasePushNotificationChannelsRequest.prototype.operation = function () {
            throw Error('Should be implemented in subclass.');
        };
        BasePushNotificationChannelsRequest.prototype.validate = function () {
            var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, action = _a.action, device = _a.device, pushGateway = _a.pushGateway;
            if (!subscribeKey)
                return 'Missing Subscribe Key';
            if (!device)
                return 'Missing Device ID (device)';
            if ((action === 'add' || action === 'remove') &&
                (!('channels' in this.parameters) || this.parameters.channels.length === 0))
                return 'Missing Channels';
            if (!pushGateway)
                return 'Missing GW Type (pushGateway: gcm or apns2)';
            if (this.parameters.pushGateway === 'apns2' && !this.parameters.topic)
                return 'Missing APNS2 topic';
        };
        BasePushNotificationChannelsRequest.prototype.parse = function (_response) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    throw Error('Should be implemented in subclass.');
                });
            });
        };
        Object.defineProperty(BasePushNotificationChannelsRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, action = _a.action, device = _a.device, pushGateway = _a.pushGateway;
                var path = pushGateway === 'apns2'
                    ? "/v2/push/sub-key/".concat(subscribeKey, "/devices-apns2/").concat(device)
                    : "/v1/push/sub-key/".concat(subscribeKey, "/devices/").concat(device);
                if (action === 'remove-device')
                    path = "".concat(path, "/remove");
                return path;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BasePushNotificationChannelsRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, start = _a.start, count = _a.count;
                var query = __assign(__assign({ type: this.parameters.pushGateway }, (start ? { start: start } : {})), (count && count > 0 ? { count: count } : {}));
                if ('channels' in this.parameters)
                    query[this.parameters.action] = this.parameters.channels.join(',');
                if (this.parameters.pushGateway === 'apns2') {
                    var _b = this.parameters, environment = _b.environment, topic = _b.topic;
                    query = __assign(__assign({}, query), { environment: environment, topic: topic });
                }
                return query;
            },
            enumerable: false,
            configurable: true
        });
        return BasePushNotificationChannelsRequest;
    }(AbstractRequest));

    /**
     * Unregister Channels from Device push REST API module.
     */
    // endregion
    /**
     * Unregister channels from device push request.
     */
    // prettier-ignore
    var RemoveDevicePushNotificationChannelsRequest = /** @class */ (function (_super) {
        __extends(RemoveDevicePushNotificationChannelsRequest, _super);
        function RemoveDevicePushNotificationChannelsRequest(parameters) {
            return _super.call(this, __assign(__assign({}, parameters), { action: 'remove' })) || this;
        }
        RemoveDevicePushNotificationChannelsRequest.prototype.operation = function () {
            return RequestOperation$1.PNRemovePushNotificationEnabledChannelsOperation;
        };
        RemoveDevicePushNotificationChannelsRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, {}];
                });
            });
        };
        return RemoveDevicePushNotificationChannelsRequest;
    }(BasePushNotificationChannelsRequest));

    /**
     * List Device push enabled channels REST API module.
     */
    // endregion
    /**
     * List device push enabled channels request.
     */
    // prettier-ignore
    var ListDevicePushNotificationChannelsRequest = /** @class */ (function (_super) {
        __extends(ListDevicePushNotificationChannelsRequest, _super);
        function ListDevicePushNotificationChannelsRequest(parameters) {
            return _super.call(this, __assign(__assign({}, parameters), { action: 'list' })) || this;
        }
        ListDevicePushNotificationChannelsRequest.prototype.operation = function () {
            return RequestOperation$1.PNPushNotificationEnabledChannelsOperation;
        };
        ListDevicePushNotificationChannelsRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, { channels: serviceResponse }];
                });
            });
        };
        return ListDevicePushNotificationChannelsRequest;
    }(BasePushNotificationChannelsRequest));

    /**
     * Register Channels with Device push REST API module.
     */
    // endregion
    /**
     * Register channels with device push request.
     */
    // prettier-ignore
    var AddDevicePushNotificationChannelsRequest = /** @class */ (function (_super) {
        __extends(AddDevicePushNotificationChannelsRequest, _super);
        function AddDevicePushNotificationChannelsRequest(parameters) {
            return _super.call(this, __assign(__assign({}, parameters), { action: 'add' })) || this;
        }
        AddDevicePushNotificationChannelsRequest.prototype.operation = function () {
            return RequestOperation$1.PNAddPushNotificationEnabledChannelsOperation;
        };
        AddDevicePushNotificationChannelsRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, {}];
                });
            });
        };
        return AddDevicePushNotificationChannelsRequest;
    }(BasePushNotificationChannelsRequest));

    /**
     * Unregister Device push REST API module.
     */
    // endregion
    /**
     * Unregister device push notifications request.
     */
    // prettier-ignore
    var RemoveDevicePushNotificationRequest = /** @class */ (function (_super) {
        __extends(RemoveDevicePushNotificationRequest, _super);
        function RemoveDevicePushNotificationRequest(parameters) {
            return _super.call(this, __assign(__assign({}, parameters), { action: 'remove-device' })) || this;
        }
        RemoveDevicePushNotificationRequest.prototype.operation = function () {
            return RequestOperation$1.PNRemoveAllPushNotificationsOperation;
        };
        RemoveDevicePushNotificationRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, {}];
                });
            });
        };
        return RemoveDevicePushNotificationRequest;
    }(BasePushNotificationChannelsRequest));

    /**
     * PubNub Push Notifications API module.
     */
    var PubNubPushNotifications = /** @class */ (function () {
        function PubNubPushNotifications(keySet, 
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        sendRequest) {
            this.keySet = keySet;
            this.sendRequest = sendRequest;
        }
        /**
         * Fetch device's push notification enabled channels.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get device channels response or `void` in case if `callback` provided.
         */
        PubNubPushNotifications.prototype.listChannels = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new ListDevicePushNotificationChannelsRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Enable push notifications on channels for device.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         */
        PubNubPushNotifications.prototype.addChannels = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new AddDevicePushNotificationChannelsRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Disable push notifications on channels for device.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         */
        PubNubPushNotifications.prototype.removeChannels = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new RemoveDevicePushNotificationChannelsRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Disable push notifications for device.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         */
        PubNubPushNotifications.prototype.deleteDevice = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new RemoveDevicePushNotificationRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        return PubNubPushNotifications;
    }());

    /**
     * Get All Channel Metadata REST API module.
     */
    // --------------------------------------------------------
    // ----------------------- Defaults -----------------------
    // --------------------------------------------------------
    // region Defaults
    /**
     * Whether `Channel` custom fields should be included in response or not.
     */
    var INCLUDE_CUSTOM_FIELDS$8 = false;
    /**
     * Whether total number of channels should be included in response or not.
     */
    var INCLUDE_TOTAL_COUNT$5 = false;
    /**
     * Number of objects to return in response.
     */
    var LIMIT$5 = 100;
    // endregion
    /**
     * Get All Channels Metadata request.
     */
    var GetAllChannelsMetadataRequest = /** @class */ (function (_super) {
        __extends(GetAllChannelsMetadataRequest, _super);
        function GetAllChannelsMetadataRequest(parameters) {
            var _a, _b, _c, _d;
            var _e, _f;
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            // Apply default request parameters.
            (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
            (_b = (_e = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_e.customFields = INCLUDE_CUSTOM_FIELDS$8);
            (_c = (_f = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_f.totalCount = INCLUDE_TOTAL_COUNT$5);
            (_d = parameters.limit) !== null && _d !== void 0 ? _d : (parameters.limit = LIMIT$5);
            return _this;
        }
        GetAllChannelsMetadataRequest.prototype.operation = function () {
            return RequestOperation$1.PNGetAllChannelMetadataOperation;
        };
        GetAllChannelsMetadataRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, serviceResponse];
                });
            });
        };
        Object.defineProperty(GetAllChannelsMetadataRequest.prototype, "path", {
            get: function () {
                return "/v2/objects/".concat(this.parameters.keySet.subscribeKey, "/channels");
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GetAllChannelsMetadataRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, include = _a.include, page = _a.page, filter = _a.filter, sort = _a.sort, limit = _a.limit;
                var sorting = Object.entries(sort !== null && sort !== void 0 ? sort : {}).map(function (_a) {
                    var _b = __read(_a, 2), option = _b[0], order = _b[1];
                    return order !== null ? "".concat(option, ":").concat(order) : option;
                });
                return __assign(__assign(__assign(__assign(__assign({ include: __spreadArray(['status', 'type'], __read((include.customFields ? ['custom'] : [])), false).join(','), count: "".concat(include.totalCount) }, (filter ? { filter: filter } : {})), ((page === null || page === void 0 ? void 0 : page.next) ? { start: page.next } : {})), ((page === null || page === void 0 ? void 0 : page.prev) ? { end: page.prev } : {})), (limit ? { limit: limit } : {})), (sorting.length ? { sort: sorting } : {}));
            },
            enumerable: false,
            configurable: true
        });
        return GetAllChannelsMetadataRequest;
    }(AbstractRequest));

    /**
     * Remove Channel Metadata REST API module.
     */
    // endregion
    /**
     * Remove Channel Metadata request.
     */
    var RemoveChannelMetadataRequest = /** @class */ (function (_super) {
        __extends(RemoveChannelMetadataRequest, _super);
        function RemoveChannelMetadataRequest(parameters) {
            var _this = _super.call(this, { method: TransportMethod.DELETE }) || this;
            _this.parameters = parameters;
            return _this;
        }
        RemoveChannelMetadataRequest.prototype.operation = function () {
            return RequestOperation$1.PNRemoveChannelMetadataOperation;
        };
        RemoveChannelMetadataRequest.prototype.validate = function () {
            if (!this.parameters.channel)
                return 'Channel cannot be empty';
        };
        RemoveChannelMetadataRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, serviceResponse];
                });
            });
        };
        Object.defineProperty(RemoveChannelMetadataRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channel = _a.channel;
                return "/v2/objects/".concat(subscribeKey, "/channels/").concat(encodeString(channel));
            },
            enumerable: false,
            configurable: true
        });
        return RemoveChannelMetadataRequest;
    }(AbstractRequest));

    /**
     * Get UUID Memberships REST API module.
     */
    // --------------------------------------------------------
    // ----------------------- Defaults -----------------------
    // --------------------------------------------------------
    // region Defaults
    /**
     * Whether `Membership` custom field should be included in response or not.
     */
    var INCLUDE_CUSTOM_FIELDS$7 = false;
    /**
     * Whether membership's status field should be included in response or not.
     */
    var INCLUDE_STATUS$1 = false;
    /**
     * Whether total number of memberships should be included in response or not.
     */
    var INCLUDE_TOTAL_COUNT$4 = false;
    /**
     * Whether `Channel` fields should be included in response or not.
     */
    var INCLUDE_CHANNEL_FIELDS$1 = false;
    /**
     * Whether `Channel` status field should be included in response or not.
     */
    var INCLUDE_CHANNEL_STATUS_FIELD = false;
    /**
     * Whether `Channel` type field should be included in response or not.
     */
    var INCLUDE_CHANNEL_TYPE_FIELD = false;
    /**
     * Whether `Channel` custom field should be included in response or not.
     */
    var INCLUDE_CHANNEL_CUSTOM_FIELDS$1 = false;
    /**
     * Number of objects to return in response.
     */
    var LIMIT$4 = 100;
    // endregion
    /**
     * Get UUID Memberships request.
     */
    var GetUUIDMembershipsRequest = /** @class */ (function (_super) {
        __extends(GetUUIDMembershipsRequest, _super);
        function GetUUIDMembershipsRequest(parameters) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            var _k, _l, _m, _o, _p, _q, _r;
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            // Apply default request parameters.
            (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
            (_b = (_k = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_k.customFields = INCLUDE_CUSTOM_FIELDS$7);
            (_c = (_l = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_l.totalCount = INCLUDE_TOTAL_COUNT$4);
            (_d = (_m = parameters.include).statusField) !== null && _d !== void 0 ? _d : (_m.statusField = INCLUDE_STATUS$1);
            (_e = (_o = parameters.include).channelFields) !== null && _e !== void 0 ? _e : (_o.channelFields = INCLUDE_CHANNEL_FIELDS$1);
            (_f = (_p = parameters.include).customChannelFields) !== null && _f !== void 0 ? _f : (_p.customChannelFields = INCLUDE_CHANNEL_CUSTOM_FIELDS$1);
            (_g = (_q = parameters.include).channelStatusField) !== null && _g !== void 0 ? _g : (_q.channelStatusField = INCLUDE_CHANNEL_STATUS_FIELD);
            (_h = (_r = parameters.include).channelTypeField) !== null && _h !== void 0 ? _h : (_r.channelTypeField = INCLUDE_CHANNEL_TYPE_FIELD);
            (_j = parameters.limit) !== null && _j !== void 0 ? _j : (parameters.limit = LIMIT$4);
            // Remap for backward compatibility.
            if (_this.parameters.userId)
                _this.parameters.uuid = _this.parameters.userId;
            return _this;
        }
        GetUUIDMembershipsRequest.prototype.operation = function () {
            return RequestOperation$1.PNGetMembershipsOperation;
        };
        GetUUIDMembershipsRequest.prototype.validate = function () {
            if (!this.parameters.uuid)
                return "'uuid' cannot be empty";
        };
        GetUUIDMembershipsRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, serviceResponse];
                });
            });
        };
        Object.defineProperty(GetUUIDMembershipsRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, uuid = _a.uuid;
                return "/v2/objects/".concat(subscribeKey, "/uuids/").concat(encodeString(uuid), "/channels");
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GetUUIDMembershipsRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, include = _a.include, page = _a.page, filter = _a.filter, sort = _a.sort, limit = _a.limit;
                var sorting = Object.entries(sort !== null && sort !== void 0 ? sort : {}).map(function (_a) {
                    var _b = __read(_a, 2), option = _b[0], order = _b[1];
                    return order !== null ? "".concat(option, ":").concat(order) : option;
                });
                var includeFlags = [];
                if (include.statusField)
                    includeFlags.push('status');
                if (include.customFields)
                    includeFlags.push('custom');
                if (include.channelFields)
                    includeFlags.push('channel');
                if (include.channelStatusField)
                    includeFlags.push('channel.status');
                if (include.channelTypeField)
                    includeFlags.push('channel.type');
                if (include.customChannelFields)
                    includeFlags.push('channel.custom');
                return __assign(__assign(__assign(__assign(__assign(__assign({ count: "".concat(include.totalCount) }, (includeFlags.length > 0 ? { include: includeFlags.join(',') } : {})), (filter ? { filter: filter } : {})), ((page === null || page === void 0 ? void 0 : page.next) ? { start: page.next } : {})), ((page === null || page === void 0 ? void 0 : page.prev) ? { end: page.prev } : {})), (limit ? { limit: limit } : {})), (sorting.length ? { sort: sorting } : {}));
            },
            enumerable: false,
            configurable: true
        });
        return GetUUIDMembershipsRequest;
    }(AbstractRequest));

    /**
     * Set UUID Memberships REST API module.
     */
    // --------------------------------------------------------
    // ----------------------- Defaults -----------------------
    // --------------------------------------------------------
    // region Defaults
    /**
     * Whether `Membership` custom field should be included in response or not.
     */
    var INCLUDE_CUSTOM_FIELDS$6 = false;
    /**
     * Whether total number of memberships should be included in response or not.
     */
    var INCLUDE_TOTAL_COUNT$3 = false;
    /**
     * Whether `Channel` fields should be included in response or not.
     */
    var INCLUDE_CHANNEL_FIELDS = false;
    /**
     * Whether `Channel` custom field should be included in response or not.
     */
    var INCLUDE_CHANNEL_CUSTOM_FIELDS = false;
    /**
     * Number of objects to return in response.
     */
    var LIMIT$3 = 100;
    // endregion
    /**
     * Set UUID Memberships request.
     */
    var SetUUIDMembershipsRequest = /** @class */ (function (_super) {
        __extends(SetUUIDMembershipsRequest, _super);
        function SetUUIDMembershipsRequest(parameters) {
            var _a, _b, _c, _d, _e, _f;
            var _g, _h, _j, _k;
            var _this = _super.call(this, { method: TransportMethod.PATCH }) || this;
            _this.parameters = parameters;
            // Apply default request parameters.
            (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
            (_b = (_g = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_g.customFields = INCLUDE_CUSTOM_FIELDS$6);
            (_c = (_h = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_h.totalCount = INCLUDE_TOTAL_COUNT$3);
            (_d = (_j = parameters.include).channelFields) !== null && _d !== void 0 ? _d : (_j.channelFields = INCLUDE_CHANNEL_FIELDS);
            (_e = (_k = parameters.include).customChannelFields) !== null && _e !== void 0 ? _e : (_k.customChannelFields = INCLUDE_CHANNEL_CUSTOM_FIELDS);
            (_f = parameters.limit) !== null && _f !== void 0 ? _f : (parameters.limit = LIMIT$3);
            // Remap for backward compatibility.
            if (_this.parameters.userId)
                _this.parameters.uuid = _this.parameters.userId;
            return _this;
        }
        SetUUIDMembershipsRequest.prototype.operation = function () {
            return RequestOperation$1.PNSetMembershipsOperation;
        };
        SetUUIDMembershipsRequest.prototype.validate = function () {
            var _a = this.parameters, uuid = _a.uuid, channels = _a.channels;
            if (!uuid)
                return "'uuid' cannot be empty";
            if (!channels || channels.length === 0)
                return 'Channels cannot be empty';
        };
        SetUUIDMembershipsRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, serviceResponse];
                });
            });
        };
        Object.defineProperty(SetUUIDMembershipsRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, uuid = _a.uuid;
                return "/v2/objects/".concat(subscribeKey, "/uuids/").concat(encodeString(uuid), "/channels");
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SetUUIDMembershipsRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, include = _a.include, page = _a.page, filter = _a.filter, sort = _a.sort, limit = _a.limit;
                var sorting = Object.entries(sort !== null && sort !== void 0 ? sort : {}).map(function (_a) {
                    var _b = __read(_a, 2), option = _b[0], order = _b[1];
                    return order !== null ? "".concat(option, ":").concat(order) : option;
                });
                var includeFlags = ['channel.status', 'channel.type', 'status'];
                if (include.customFields)
                    includeFlags.push('custom');
                if (include.channelFields)
                    includeFlags.push('channel');
                if (include.customChannelFields)
                    includeFlags.push('channel.custom');
                return __assign(__assign(__assign(__assign(__assign(__assign({ count: "".concat(include.totalCount) }, (includeFlags.length > 0 ? { include: includeFlags.join(',') } : {})), (filter ? { filter: filter } : {})), ((page === null || page === void 0 ? void 0 : page.next) ? { start: page.next } : {})), ((page === null || page === void 0 ? void 0 : page.prev) ? { end: page.prev } : {})), (limit ? { limit: limit } : {})), (sorting.length ? { sort: sorting } : {}));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SetUUIDMembershipsRequest.prototype, "body", {
            get: function () {
                var _a;
                var _b = this.parameters, channels = _b.channels, type = _b.type;
                return JSON.stringify((_a = {},
                    _a["".concat(type)] = channels.map(function (channel) {
                        if (typeof channel === 'string') {
                            return { channel: { id: channel } };
                        }
                        else {
                            return { channel: { id: channel.id }, status: channel.status, custom: channel.custom };
                        }
                    }),
                    _a));
            },
            enumerable: false,
            configurable: true
        });
        return SetUUIDMembershipsRequest;
    }(AbstractRequest));

    /**
     * Get All UUID Metadata REST API module.
     */
    // --------------------------------------------------------
    // ----------------------- Defaults -----------------------
    // --------------------------------------------------------
    // region Defaults
    /**
     * Whether `Channel` custom field should be included by default or not.
     */
    var INCLUDE_CUSTOM_FIELDS$5 = false;
    /**
     * Whether to fetch total count or not.
     */
    var INCLUDE_TOTAL_COUNT$2 = false;
    /**
     * Number of objects to return in response.
     */
    var LIMIT$2 = 100;
    // endregion
    var GetAllUUIDMetadataRequest = /** @class */ (function (_super) {
        __extends(GetAllUUIDMetadataRequest, _super);
        function GetAllUUIDMetadataRequest(parameters) {
            var _a, _b, _c, _d;
            var _e, _f;
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            // Apply default request parameters.
            (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
            (_b = (_e = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_e.customFields = INCLUDE_CUSTOM_FIELDS$5);
            (_c = (_f = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_f.totalCount = INCLUDE_TOTAL_COUNT$2);
            (_d = parameters.limit) !== null && _d !== void 0 ? _d : (parameters.limit = LIMIT$2);
            return _this;
        }
        GetAllUUIDMetadataRequest.prototype.operation = function () {
            return RequestOperation$1.PNGetAllUUIDMetadataOperation;
        };
        GetAllUUIDMetadataRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, serviceResponse];
                });
            });
        };
        Object.defineProperty(GetAllUUIDMetadataRequest.prototype, "path", {
            get: function () {
                return "/v2/objects/".concat(this.parameters.keySet.subscribeKey, "/uuids");
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GetAllUUIDMetadataRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, include = _a.include, page = _a.page, filter = _a.filter, sort = _a.sort, limit = _a.limit;
                var sorting = Object.entries(sort !== null && sort !== void 0 ? sort : {}).map(function (_a) {
                    var _b = __read(_a, 2), option = _b[0], order = _b[1];
                    return order !== null ? "".concat(option, ":").concat(order) : option;
                });
                return __assign(__assign(__assign(__assign(__assign({ include: __spreadArray(['status', 'type'], __read((include.customFields ? ['custom'] : [])), false).join(','), count: "".concat(include.totalCount) }, (filter ? { filter: filter } : {})), ((page === null || page === void 0 ? void 0 : page.next) ? { start: page.next } : {})), ((page === null || page === void 0 ? void 0 : page.prev) ? { end: page.prev } : {})), (limit ? { limit: limit } : {})), (sorting.length ? { sort: sorting } : {}));
            },
            enumerable: false,
            configurable: true
        });
        return GetAllUUIDMetadataRequest;
    }(AbstractRequest));

    /**
     * Get Channel Metadata REST API module.
     */
    // --------------------------------------------------------
    // ----------------------- Defaults -----------------------
    // --------------------------------------------------------
    // region Defaults
    /**
     * Whether `Channel` custom field should be included by default or not.
     */
    var INCLUDE_CUSTOM_FIELDS$4 = true;
    // endregion
    /**
     * Get Channel Metadata request.
     */
    var GetChannelMetadataRequest = /** @class */ (function (_super) {
        __extends(GetChannelMetadataRequest, _super);
        function GetChannelMetadataRequest(parameters) {
            var _a, _b;
            var _c;
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            // Apply default request parameters.
            (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
            (_b = (_c = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_c.customFields = INCLUDE_CUSTOM_FIELDS$4);
            return _this;
        }
        GetChannelMetadataRequest.prototype.operation = function () {
            return RequestOperation$1.PNGetChannelMetadataOperation;
        };
        GetChannelMetadataRequest.prototype.validate = function () {
            if (!this.parameters.channel)
                return 'Channel cannot be empty';
        };
        GetChannelMetadataRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, serviceResponse];
                });
            });
        };
        Object.defineProperty(GetChannelMetadataRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channel = _a.channel;
                return "/v2/objects/".concat(subscribeKey, "/channels/").concat(encodeString(channel));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GetChannelMetadataRequest.prototype, "queryParameters", {
            get: function () {
                return {
                    include: __spreadArray(['status', 'type'], __read((this.parameters.include.customFields ? ['custom'] : [])), false).join(','),
                };
            },
            enumerable: false,
            configurable: true
        });
        return GetChannelMetadataRequest;
    }(AbstractRequest));

    /**
     * Set Channel Metadata REST API module.
     */
    // --------------------------------------------------------
    // ----------------------- Defaults -----------------------
    // --------------------------------------------------------
    // region Defaults
    /**
     * Whether `Channel` custom field should be included by default or not.
     */
    var INCLUDE_CUSTOM_FIELDS$3 = true;
    // endregion
    /**
     * Set Channel Metadata request.
     */
    var SetChannelMetadataRequest = /** @class */ (function (_super) {
        __extends(SetChannelMetadataRequest, _super);
        function SetChannelMetadataRequest(parameters) {
            var _a, _b;
            var _c;
            var _this = _super.call(this, { method: TransportMethod.PATCH }) || this;
            _this.parameters = parameters;
            // Apply default request parameters.
            (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
            (_b = (_c = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_c.customFields = INCLUDE_CUSTOM_FIELDS$3);
            return _this;
        }
        SetChannelMetadataRequest.prototype.operation = function () {
            return RequestOperation$1.PNSetChannelMetadataOperation;
        };
        SetChannelMetadataRequest.prototype.validate = function () {
            if (!this.parameters.channel)
                return 'Channel cannot be empty';
            if (!this.parameters.data)
                return 'Data cannot be empty';
        };
        SetChannelMetadataRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, serviceResponse];
                });
            });
        };
        Object.defineProperty(SetChannelMetadataRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channel = _a.channel;
                return "/v2/objects/".concat(subscribeKey, "/channels/").concat(encodeString(channel));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SetChannelMetadataRequest.prototype, "queryParameters", {
            get: function () {
                return {
                    include: __spreadArray(['status', 'type'], __read((this.parameters.include.customFields ? ['custom'] : [])), false).join(','),
                };
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SetChannelMetadataRequest.prototype, "body", {
            get: function () {
                return JSON.stringify(this.parameters.data);
            },
            enumerable: false,
            configurable: true
        });
        return SetChannelMetadataRequest;
    }(AbstractRequest));

    /**
     * Remove UUID Metadata REST API module.
     */
    // endregion
    /**
     * Remove UUID Metadata request.
     */
    var RemoveUUIDMetadataRequest = /** @class */ (function (_super) {
        __extends(RemoveUUIDMetadataRequest, _super);
        function RemoveUUIDMetadataRequest(parameters) {
            var _this = _super.call(this, { method: TransportMethod.DELETE }) || this;
            _this.parameters = parameters;
            // Remap for backward compatibility.
            if (_this.parameters.userId)
                _this.parameters.uuid = _this.parameters.userId;
            return _this;
        }
        RemoveUUIDMetadataRequest.prototype.operation = function () {
            return RequestOperation$1.PNRemoveUUIDMetadataOperation;
        };
        RemoveUUIDMetadataRequest.prototype.validate = function () {
            if (!this.parameters.uuid)
                return "'uuid' cannot be empty";
        };
        RemoveUUIDMetadataRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, serviceResponse];
                });
            });
        };
        Object.defineProperty(RemoveUUIDMetadataRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, uuid = _a.uuid;
                return "/v2/objects/".concat(subscribeKey, "/uuids/").concat(encodeString(uuid));
            },
            enumerable: false,
            configurable: true
        });
        return RemoveUUIDMetadataRequest;
    }(AbstractRequest));

    /**
     * Get Channel Members REST API module.
     */
    // --------------------------------------------------------
    // ----------------------- Defaults -----------------------
    // --------------------------------------------------------
    // region Defaults
    /**
     * Whether `Member` custom field should be included in response or not.
     */
    var INCLUDE_CUSTOM_FIELDS$2 = false;
    /**
     * Whether member's status field should be included in response or not.
     */
    var INCLUDE_STATUS = false;
    /**
     * Whether total number of members should be included in response or not.
     */
    var INCLUDE_TOTAL_COUNT$1 = false;
    /**
     * Whether `UUID` fields should be included in response or not.
     */
    var INCLUDE_UUID_FIELDS$1 = false;
    /**
     * Whether `UUID` status field should be included in response or not.
     */
    var INCLUDE_UUID_STATUS_FIELD = false;
    /**
     * Whether `UUID` type field should be included in response or not.
     */
    var INCLUDE_UUID_TYPE_FIELD = false;
    /**
     * Whether `UUID` custom field should be included in response or not.
     */
    var INCLUDE_UUID_CUSTOM_FIELDS$1 = false;
    /**
     * Number of objects to return in response.
     */
    var LIMIT$1 = 100;
    // endregion
    /**
     * Get Channel Members request.
     */
    var GetChannelMembersRequest = /** @class */ (function (_super) {
        __extends(GetChannelMembersRequest, _super);
        function GetChannelMembersRequest(parameters) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            var _k, _l, _m, _o, _p, _q, _r;
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            // Apply default request parameters.
            (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
            (_b = (_k = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_k.customFields = INCLUDE_CUSTOM_FIELDS$2);
            (_c = (_l = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_l.totalCount = INCLUDE_TOTAL_COUNT$1);
            (_d = (_m = parameters.include).statusField) !== null && _d !== void 0 ? _d : (_m.statusField = INCLUDE_STATUS);
            (_e = (_o = parameters.include).UUIDFields) !== null && _e !== void 0 ? _e : (_o.UUIDFields = INCLUDE_UUID_FIELDS$1);
            (_f = (_p = parameters.include).customUUIDFields) !== null && _f !== void 0 ? _f : (_p.customUUIDFields = INCLUDE_UUID_CUSTOM_FIELDS$1);
            (_g = (_q = parameters.include).UUIDStatusField) !== null && _g !== void 0 ? _g : (_q.UUIDStatusField = INCLUDE_UUID_STATUS_FIELD);
            (_h = (_r = parameters.include).UUIDTypeField) !== null && _h !== void 0 ? _h : (_r.UUIDTypeField = INCLUDE_UUID_TYPE_FIELD);
            (_j = parameters.limit) !== null && _j !== void 0 ? _j : (parameters.limit = LIMIT$1);
            return _this;
        }
        GetChannelMembersRequest.prototype.operation = function () {
            return RequestOperation$1.PNSetMembersOperation;
        };
        GetChannelMembersRequest.prototype.validate = function () {
            if (!this.parameters.channel)
                return 'Channel cannot be empty';
        };
        GetChannelMembersRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, serviceResponse];
                });
            });
        };
        Object.defineProperty(GetChannelMembersRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channel = _a.channel;
                return "/v2/objects/".concat(subscribeKey, "/channels/").concat(encodeString(channel), "/uuids");
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GetChannelMembersRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, include = _a.include, page = _a.page, filter = _a.filter, sort = _a.sort, limit = _a.limit;
                var sorting = Object.entries(sort !== null && sort !== void 0 ? sort : {}).map(function (_a) {
                    var _b = __read(_a, 2), option = _b[0], order = _b[1];
                    return order !== null ? "".concat(option, ":").concat(order) : option;
                });
                var includeFlags = [];
                if (include.statusField)
                    includeFlags.push('status');
                if (include.customFields)
                    includeFlags.push('custom');
                if (include.UUIDFields)
                    includeFlags.push('uuid');
                if (include.UUIDStatusField)
                    includeFlags.push('uuid.status');
                if (include.UUIDTypeField)
                    includeFlags.push('uuid.type');
                if (include.customUUIDFields)
                    includeFlags.push('uuid.custom');
                return __assign(__assign(__assign(__assign(__assign(__assign({ count: "".concat(include.totalCount) }, (includeFlags.length > 0 ? { include: includeFlags.join(',') } : {})), (filter ? { filter: filter } : {})), ((page === null || page === void 0 ? void 0 : page.next) ? { start: page.next } : {})), ((page === null || page === void 0 ? void 0 : page.prev) ? { end: page.prev } : {})), (limit ? { limit: limit } : {})), (sorting.length ? { sort: sorting } : {}));
            },
            enumerable: false,
            configurable: true
        });
        return GetChannelMembersRequest;
    }(AbstractRequest));

    /**
     * Set Channel Members REST API module.
     */
    // --------------------------------------------------------
    // ----------------------- Defaults -----------------------
    // --------------------------------------------------------
    // region Defaults
    /**
     * Whether `Member` custom field should be included in response or not.
     */
    var INCLUDE_CUSTOM_FIELDS$1 = false;
    /**
     * Whether total number of members should be included in response or not.
     */
    var INCLUDE_TOTAL_COUNT = false;
    /**
     * Whether `UUID` fields should be included in response or not.
     */
    var INCLUDE_UUID_FIELDS = false;
    /**
     * Whether `UUID` custom field should be included in response or not.
     */
    var INCLUDE_UUID_CUSTOM_FIELDS = false;
    /**
     * Number of objects to return in response.
     */
    var LIMIT = 100;
    // endregion
    /**
     * Set Channel Members request.
     */
    var SetChannelMembersRequest = /** @class */ (function (_super) {
        __extends(SetChannelMembersRequest, _super);
        function SetChannelMembersRequest(parameters) {
            var _a, _b, _c, _d, _e, _f;
            var _g, _h, _j, _k;
            var _this = _super.call(this, { method: TransportMethod.PATCH }) || this;
            _this.parameters = parameters;
            // Apply default request parameters.
            (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
            (_b = (_g = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_g.customFields = INCLUDE_CUSTOM_FIELDS$1);
            (_c = (_h = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_h.totalCount = INCLUDE_TOTAL_COUNT);
            (_d = (_j = parameters.include).UUIDFields) !== null && _d !== void 0 ? _d : (_j.UUIDFields = INCLUDE_UUID_FIELDS);
            (_e = (_k = parameters.include).customUUIDFields) !== null && _e !== void 0 ? _e : (_k.customUUIDFields = INCLUDE_UUID_CUSTOM_FIELDS);
            (_f = parameters.limit) !== null && _f !== void 0 ? _f : (parameters.limit = LIMIT);
            return _this;
        }
        SetChannelMembersRequest.prototype.operation = function () {
            return RequestOperation$1.PNSetMembersOperation;
        };
        SetChannelMembersRequest.prototype.validate = function () {
            var _a = this.parameters, channel = _a.channel, uuids = _a.uuids;
            if (!channel)
                return 'Channel cannot be empty';
            if (!uuids || uuids.length === 0)
                return 'UUIDs cannot be empty';
        };
        SetChannelMembersRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, serviceResponse];
                });
            });
        };
        Object.defineProperty(SetChannelMembersRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channel = _a.channel;
                return "/v2/objects/".concat(subscribeKey, "/channels/").concat(encodeString(channel), "/uuids");
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SetChannelMembersRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, include = _a.include, page = _a.page, filter = _a.filter, sort = _a.sort, limit = _a.limit;
                var sorting = Object.entries(sort !== null && sort !== void 0 ? sort : {}).map(function (_a) {
                    var _b = __read(_a, 2), option = _b[0], order = _b[1];
                    return order !== null ? "".concat(option, ":").concat(order) : option;
                });
                var includeFlags = ['uuid.status', 'uuid.type', 'type'];
                if (include.customFields)
                    includeFlags.push('custom');
                if (include.UUIDFields)
                    includeFlags.push('uuid');
                if (include.customUUIDFields)
                    includeFlags.push('uuid.custom');
                return __assign(__assign(__assign(__assign(__assign(__assign({ count: "".concat(include.totalCount) }, (includeFlags.length > 0 ? { include: includeFlags.join(',') } : {})), (filter ? { filter: filter } : {})), ((page === null || page === void 0 ? void 0 : page.next) ? { start: page.next } : {})), ((page === null || page === void 0 ? void 0 : page.prev) ? { end: page.prev } : {})), (limit ? { limit: limit } : {})), (sorting.length ? { sort: sorting } : {}));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SetChannelMembersRequest.prototype, "body", {
            get: function () {
                var _a;
                var _b = this.parameters, uuids = _b.uuids, type = _b.type;
                return JSON.stringify((_a = {},
                    _a["".concat(type)] = uuids.map(function (uuid) {
                        if (typeof uuid === 'string') {
                            return { uuid: { id: uuid } };
                        }
                        else {
                            return { uuid: { id: uuid.id }, status: uuid.status, custom: uuid.custom };
                        }
                    }),
                    _a));
            },
            enumerable: false,
            configurable: true
        });
        return SetChannelMembersRequest;
    }(AbstractRequest));

    /**
     * Get UUID Metadata REST API module.
     */
    // --------------------------------------------------------
    // ----------------------- Defaults -----------------------
    // --------------------------------------------------------
    // region Defaults
    /**
     * Whether UUID custom field should be included by default or not.
     */
    var INCLUDE_CUSTOM_FIELDS = true;
    // endregion
    /**
     * Get UUID Metadata request.
     */
    var GetUUIDMetadataRequest = /** @class */ (function (_super) {
        __extends(GetUUIDMetadataRequest, _super);
        function GetUUIDMetadataRequest(parameters) {
            var _a, _b;
            var _c;
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            // Apply default request parameters.
            (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
            (_b = (_c = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_c.customFields = INCLUDE_CUSTOM_FIELDS);
            // Remap for backward compatibility.
            if (_this.parameters.userId)
                _this.parameters.uuid = _this.parameters.userId;
            return _this;
        }
        GetUUIDMetadataRequest.prototype.operation = function () {
            return RequestOperation$1.PNGetUUIDMetadataOperation;
        };
        GetUUIDMetadataRequest.prototype.validate = function () {
            if (!this.parameters.uuid)
                return "'uuid' cannot be empty";
        };
        GetUUIDMetadataRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, serviceResponse];
                });
            });
        };
        Object.defineProperty(GetUUIDMetadataRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, uuid = _a.uuid;
                return "/v2/objects/".concat(subscribeKey, "/uuids/").concat(encodeString(uuid));
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GetUUIDMetadataRequest.prototype, "queryParameters", {
            get: function () {
                var _a = this.parameters, uuid = _a.uuid; _a.include;
                return {
                    uuid: uuid,
                    include: __spreadArray(['status', 'type'], __read((this.parameters.include.customFields ? ['custom'] : [])), false).join(','),
                };
            },
            enumerable: false,
            configurable: true
        });
        return GetUUIDMetadataRequest;
    }(AbstractRequest));

    /**
     * PubNub Objects API module.
     */
    var PubNubObjects = /** @class */ (function () {
        function PubNubObjects(configuration, 
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        sendRequest) {
            this.configuration = configuration;
            this.sendRequest = sendRequest;
            this.keySet = configuration.keySet;
        }
        /**
         * Fetch a paginated list of UUID Metadata objects.
         *
         * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get all UUID metadata response or `void` in case if `callback` provided.
         */
        PubNubObjects.prototype.getAllUUIDMetadata = function (parametersOrCallback, callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._getAllUUIDMetadata(parametersOrCallback, callback)];
                });
            });
        };
        /**
         * Fetch a paginated list of UUID Metadata objects.
         *
         *
         * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get all UUID metadata response or `void` in case if `callback` provided.
         */
        PubNubObjects.prototype._getAllUUIDMetadata = function (parametersOrCallback, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var parameters, request;
                return __generator(this, function (_a) {
                    parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
                    callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
                    request = new GetAllUUIDMetadataRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Fetch a specific UUID Metadata object.
         *
         * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get UUID metadata response or `void` in case if `callback` provided.
         */
        PubNubObjects.prototype.getUUIDMetadata = function (parametersOrCallback, callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._getUUIDMetadata(parametersOrCallback, callback)];
                });
            });
        };
        /**
         * Fetch a specific UUID Metadata object.
         *
         * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get UUID metadata response or `void` in case if `callback` provided.
         */
        PubNubObjects.prototype._getUUIDMetadata = function (parametersOrCallback, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var parameters, request;
                var _a;
                return __generator(this, function (_b) {
                    parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
                    callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
                    if (parameters.userId)
                        parameters.uuid = parameters.userId;
                    (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
                    request = new GetUUIDMetadataRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Update specific UUID Metadata object.
         *
         * @param parameters - Request configuration parameters. Will set UUID metadata for currently
         * configured PubNub client `uuid` if not set.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous set UUID metadata response or `void` in case if `callback` provided.
         */
        PubNubObjects.prototype.setUUIDMetadata = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._setUUIDMetadata(parameters, callback)];
                });
            });
        };
        /**
         * Update specific UUID Metadata object.
         *
         * @param parameters - Request configuration parameters. Will set UUID metadata for currently
         * configured PubNub client `uuid` if not set.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous set UUID metadata response or `void` in case if `callback` provided.
         */
        PubNubObjects.prototype._setUUIDMetadata = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                var _a;
                return __generator(this, function (_b) {
                    if (parameters.userId)
                        parameters.uuid = parameters.userId;
                    (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
                    request = new GetUUIDMetadataRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Remove a specific UUID Metadata object.
         *
         * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous UUID metadata remove response or `void` in case if `callback` provided.
         */
        PubNubObjects.prototype.removeUUIDMetadata = function (parametersOrCallback, callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._removeUUIDMetadata(parametersOrCallback, callback)];
                });
            });
        };
        /**
         * Remove a specific UUID Metadata object.
         *
         * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous UUID metadata remove response or `void` in case if `callback` provided.
         */
        PubNubObjects.prototype._removeUUIDMetadata = function (parametersOrCallback, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var parameters, request;
                var _a;
                return __generator(this, function (_b) {
                    parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
                    callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
                    if (parameters.userId)
                        parameters.uuid = parameters.userId;
                    (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
                    request = new RemoveUUIDMetadataRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Fetch a paginated list of Channel Metadata objects.
         *
         * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get all Channel metadata response or `void` in case if `callback`
         * provided.
         */
        PubNubObjects.prototype.getAllChannelMetadata = function (parametersOrCallback, callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._getAllChannelMetadata(parametersOrCallback, callback)];
                });
            });
        };
        /**
         * Fetch a paginated list of Channel Metadata objects.
         *
         * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get all Channel metadata response or `void` in case if `callback`
         * provided.
         */
        PubNubObjects.prototype._getAllChannelMetadata = function (parametersOrCallback, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var parameters, request;
                return __generator(this, function (_a) {
                    parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
                    callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
                    request = new GetAllChannelsMetadataRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Fetch Channel Metadata object.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get Channel metadata response or `void` in case if `callback` provided.
         */
        PubNubObjects.prototype.getChannelMetadata = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._getChannelMetadata(parameters, callback)];
                });
            });
        };
        /**
         * Fetch Channel Metadata object.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get Channel metadata response or `void` in case if `callback` provided.
         */
        PubNubObjects.prototype._getChannelMetadata = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new GetChannelMetadataRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Update specific Channel Metadata object.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous set Channel metadata response or `void` in case if `callback` provided.
         */
        PubNubObjects.prototype.setChannelMetadata = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._setChannelMetadata(parameters, callback)];
                });
            });
        };
        /**
         * Update specific Channel Metadata object.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous set Channel metadata response or `void` in case if `callback` provided.
         */
        PubNubObjects.prototype._setChannelMetadata = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new SetChannelMetadataRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Remove a specific Channel Metadata object.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous Channel metadata remove response or `void` in case if `callback`
         * provided.
         */
        PubNubObjects.prototype.removeChannelMetadata = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._removeChannelMetadata(parameters, callback)];
                });
            });
        };
        /**
         * Remove a specific Channel Metadata object.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous Channel metadata remove response or `void` in case if `callback`
         * provided.
         */
        PubNubObjects.prototype._removeChannelMetadata = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new RemoveChannelMetadataRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Fetch a paginated list of Channel Member objects.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get Channel Members response or `void` in case if `callback` provided.
         */
        PubNubObjects.prototype.getChannelMembers = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new GetChannelMembersRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Update specific Channel Members list.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous update Channel members list response or `void` in case if `callback`
         * provided.
         */
        PubNubObjects.prototype.setChannelMembers = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new SetChannelMembersRequest(__assign(__assign({}, parameters), { type: 'set', keySet: this.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Remove Members from the Channel.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous Channel Members remove response or `void` in case if `callback` provided.
         */
        PubNubObjects.prototype.removeChannelMembers = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new SetChannelMembersRequest(__assign(__assign({}, parameters), { type: 'delete', keySet: this.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Fetch a specific UUID Memberships list.
         *
         * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get UUID Memberships response or `void` in case if `callback` provided.
         */
        PubNubObjects.prototype.getMemberships = function (parametersOrCallback, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var parameters, request;
                var _a;
                return __generator(this, function (_b) {
                    parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
                    callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
                    if (parameters.userId)
                        parameters.uuid = parameters.userId;
                    (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
                    request = new GetUUIDMembershipsRequest(__assign(__assign({}, parameters), { keySet: this.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Update specific UUID Memberships list.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous update UUID Memberships list response or `void` in case if `callback`
         * provided.
         */
        PubNubObjects.prototype.setMemberships = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                var _a;
                return __generator(this, function (_b) {
                    if (parameters.userId)
                        parameters.uuid = parameters.userId;
                    (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
                    request = new SetUUIDMembershipsRequest(__assign(__assign({}, parameters), { type: 'set', keySet: this.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Remove a specific UUID Memberships.
         *
         * @param parameters - Request configuration parameters or callback from overload.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous UUID Memberships remove response or `void` in case if `callback`
         * provided.
         */
        PubNubObjects.prototype.removeMemberships = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                var _a;
                return __generator(this, function (_b) {
                    if (parameters.userId)
                        parameters.uuid = parameters.userId;
                    (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
                    request = new SetUUIDMembershipsRequest(__assign(__assign({}, parameters), { type: 'delete', keySet: this.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        // endregion
        // endregion
        // --------------------------------------------------------
        // --------------------- Deprecated API -------------------
        // --------------------------------------------------------
        // region Deprecated
        /**
         * Fetch paginated list of specific Space members or specific User memberships.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get specific Space members or specific User memberships response.
         *
         * @deprecated Use {@link PubNubObjects#getChannelMembers} or {@link PubNubObjects#getMemberships} methods instead.
         */
        PubNubObjects.prototype.fetchMemberships = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var spaceParameters, mappedParameters_1, mapMembers_1, userParameters, mappedParameters, mapMemberships;
                var _a, _b;
                return __generator(this, function (_c) {
                    if ('spaceId' in parameters) {
                        spaceParameters = parameters;
                        mappedParameters_1 = {
                            channel: (_a = spaceParameters.spaceId) !== null && _a !== void 0 ? _a : spaceParameters.channel,
                            filter: spaceParameters.filter,
                            limit: spaceParameters.limit,
                            page: spaceParameters.page,
                            include: __assign({}, spaceParameters.include),
                            sort: spaceParameters.sort
                                ? Object.fromEntries(Object.entries(spaceParameters.sort).map(function (_a) {
                                    var _b = __read(_a, 2), key = _b[0], value = _b[1];
                                    return [key.replace('user', 'uuid'), value];
                                }))
                                : undefined,
                        };
                        mapMembers_1 = function (response) {
                            return ({
                                status: response.status,
                                data: response.data.map(function (members) { return ({
                                    user: members.uuid,
                                    custom: members.custom,
                                    updated: members.updated,
                                    eTag: members.eTag,
                                }); }),
                                totalCount: response.totalCount,
                                next: response.next,
                                prev: response.prev,
                            });
                        };
                        if (callback)
                            return [2 /*return*/, this.getChannelMembers(mappedParameters_1, function (status, result) {
                                    callback(status, result ? mapMembers_1(result) : result);
                                })];
                        return [2 /*return*/, this.getChannelMembers(mappedParameters_1).then(mapMembers_1)];
                    }
                    userParameters = parameters;
                    mappedParameters = {
                        uuid: (_b = userParameters.userId) !== null && _b !== void 0 ? _b : userParameters.uuid,
                        filter: userParameters.filter,
                        limit: userParameters.limit,
                        page: userParameters.page,
                        include: __assign({}, userParameters.include),
                        sort: userParameters.sort
                            ? Object.fromEntries(Object.entries(userParameters.sort).map(function (_a) {
                                var _b = __read(_a, 2), key = _b[0], value = _b[1];
                                return [key.replace('space', 'channel'), value];
                            }))
                            : undefined,
                    };
                    mapMemberships = function (response) {
                        return ({
                            status: response.status,
                            data: response.data.map(function (membership) { return ({
                                space: membership.channel,
                                custom: membership.custom,
                                updated: membership.updated,
                                eTag: membership.eTag,
                            }); }),
                            totalCount: response.totalCount,
                            next: response.next,
                            prev: response.prev,
                        });
                    };
                    if (callback)
                        return [2 /*return*/, this.getMemberships(mappedParameters, function (status, result) {
                                callback(status, result ? mapMemberships(result) : result);
                            })];
                    return [2 /*return*/, this.getMemberships(mappedParameters).then(mapMemberships)];
                });
            });
        };
        /**
         * Add members to specific Space or memberships specific User.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous add members to specific Space or memberships specific User response or
         * `void` in case if `callback` provided.
         *
         * @deprecated Use {@link PubNubObjects#setChannelMembers} or {@link PubNubObjects#setMemberships} methods instead.
         */
        PubNubObjects.prototype.addMemberships = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var spaceParameters, mappedParameters_2, userParameters, mappedParameters;
                var _a, _b, _c, _d, _e, _f;
                return __generator(this, function (_g) {
                    if ('spaceId' in parameters) {
                        spaceParameters = parameters;
                        mappedParameters_2 = {
                            channel: (_a = spaceParameters.spaceId) !== null && _a !== void 0 ? _a : spaceParameters.channel,
                            uuids: (_c = (_b = spaceParameters.users) === null || _b === void 0 ? void 0 : _b.map(function (user) {
                                if (typeof user === 'string')
                                    return user;
                                user.userId;
                                return { id: user.userId, custom: user.custom };
                            })) !== null && _c !== void 0 ? _c : spaceParameters.uuids,
                            limit: 0,
                        };
                        if (callback)
                            return [2 /*return*/, this.setChannelMembers(mappedParameters_2, callback)];
                        return [2 /*return*/, this.setChannelMembers(mappedParameters_2)];
                    }
                    userParameters = parameters;
                    mappedParameters = {
                        uuid: (_d = userParameters.userId) !== null && _d !== void 0 ? _d : userParameters.uuid,
                        channels: (_f = (_e = userParameters.spaces) === null || _e === void 0 ? void 0 : _e.map(function (space) {
                            if (typeof space === 'string')
                                return space;
                            return {
                                id: space.spaceId,
                                custom: space.custom,
                            };
                        })) !== null && _f !== void 0 ? _f : userParameters.channels,
                        limit: 0,
                    };
                    if (callback)
                        return [2 /*return*/, this.setMemberships(mappedParameters, callback)];
                    return [2 /*return*/, this.setMemberships(mappedParameters)];
                });
            });
        };
        return PubNubObjects;
    }());

    /**
     * Time REST API module.
     */
    // endregion
    var TimeRequest = /** @class */ (function (_super) {
        __extends(TimeRequest, _super);
        function TimeRequest() {
            return _super.call(this) || this;
        }
        TimeRequest.prototype.operation = function () {
            return RequestOperation$1.PNTimeOperation;
        };
        TimeRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var serviceResponse;
                return __generator(this, function (_a) {
                    serviceResponse = this.deserializeResponse(response);
                    if (!serviceResponse)
                        throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
                    return [2 /*return*/, { timetoken: serviceResponse[0] }];
                });
            });
        };
        Object.defineProperty(TimeRequest.prototype, "path", {
            get: function () {
                return '/time/0';
            },
            enumerable: false,
            configurable: true
        });
        return TimeRequest;
    }(AbstractRequest));

    /**
     * Download File REST API module.
     */
    // endregion
    /**
     * Download File request.
     */
    var DownloadFileRequest = /** @class */ (function (_super) {
        __extends(DownloadFileRequest, _super);
        function DownloadFileRequest(parameters) {
            var _this = _super.call(this) || this;
            _this.parameters = parameters;
            return _this;
        }
        DownloadFileRequest.prototype.operation = function () {
            return RequestOperation$1.PNDownloadFileOperation;
        };
        DownloadFileRequest.prototype.validate = function () {
            var _a = this.parameters, channel = _a.channel, id = _a.id, name = _a.name;
            if (!channel)
                return "channel can't be empty";
            if (!id)
                return "file id can't be empty";
            if (!name)
                return "file name can't be empty";
        };
        DownloadFileRequest.prototype.parse = function (response) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, cipherKey, crypto, cryptography, name, PubNubFile, mimeType, decryptedFile, body;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = this.parameters, cipherKey = _a.cipherKey, crypto = _a.crypto, cryptography = _a.cryptography, name = _a.name, PubNubFile = _a.PubNubFile;
                            mimeType = response.headers['content-type'];
                            body = response.body;
                            if (!(PubNubFile.supportsEncryptFile && (cipherKey || crypto))) return [3 /*break*/, 4];
                            if (!(cipherKey && cryptography)) return [3 /*break*/, 2];
                            return [4 /*yield*/, cryptography.decrypt(cipherKey, body)];
                        case 1:
                            body = _b.sent();
                            return [3 /*break*/, 4];
                        case 2:
                            if (!(!cipherKey && crypto)) return [3 /*break*/, 4];
                            return [4 /*yield*/, crypto.decryptFile(PubNubFile.create({ data: body, name: name, mimeType: mimeType }), PubNubFile)];
                        case 3:
                            decryptedFile = _b.sent();
                            _b.label = 4;
                        case 4: return [2 /*return*/, (decryptedFile
                                ? decryptedFile
                                : PubNubFile.create({
                                    data: body,
                                    name: name,
                                    mimeType: mimeType,
                                }))];
                    }
                });
            });
        };
        Object.defineProperty(DownloadFileRequest.prototype, "path", {
            get: function () {
                var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channel = _a.channel, id = _a.id, name = _a.name;
                return "/v1/files/".concat(subscribeKey, "/channels/").concat(encodeString(channel), "/files/").concat(id, "/").concat(name);
            },
            enumerable: false,
            configurable: true
        });
        return DownloadFileRequest;
    }(AbstractRequest));

    // endregion
    /**
     * Platform-agnostic PubNub client core.
     */
    var PubNubCore = /** @class */ (function () {
        // endregion
        function PubNubCore(configuration) {
            var _this = this;
            var _a, _b, _c;
            this._configuration = configuration.configuration;
            this.cryptography = configuration.cryptography;
            this.tokenManager = configuration.tokenManager;
            this.transport = configuration.transport;
            this.crypto = configuration.crypto;
            // API group entry points initialization.
            this._objects = new PubNubObjects(this._configuration, this.sendRequest);
            this._channelGroups = new PubnubChannelGroups(this._configuration.keySet, this.sendRequest);
            this._push = new PubNubPushNotifications(this._configuration.keySet, this.sendRequest);
            // Prepare for real-time events announcement.
            this.listenerManager = new ListenerManager();
            this.eventEmitter = new EventEmitter(this.listenerManager);
            if (this._configuration.enableEventEngine) {
                var heartbeatInterval_1 = this._configuration.getHeartbeatInterval();
                this.presenceState = {};
                if (heartbeatInterval_1) {
                    this.presenceEventEngine = new PresenceEventEngine({
                        heartbeat: this.heartbeat,
                        leave: this.unsubscribe,
                        heartbeatDelay: function () {
                            return new Promise(function (resolve, reject) {
                                heartbeatInterval_1 = _this._configuration.getHeartbeatInterval();
                                if (!heartbeatInterval_1)
                                    reject(new PubNubError('Heartbeat interval has been reset.'));
                                else
                                    setTimeout(resolve, heartbeatInterval_1 * 1000);
                            });
                        },
                        retryDelay: function (amount) { return new Promise(function (resolve) { return setTimeout(resolve, amount); }); },
                        emitStatus: function (status) { return _this.listenerManager.announceStatus(status); },
                        config: this._configuration,
                        presenceState: this.presenceState,
                    });
                }
                this.eventEngine = new EventEngine({
                    handshake: this.subscribeHandshake,
                    receiveMessages: this.subscribeReceiveMessages,
                    delay: function (amount) { return new Promise(function (resolve) { return setTimeout(resolve, amount); }); },
                    join: (_a = this.presenceEventEngine) === null || _a === void 0 ? void 0 : _a.join,
                    leave: (_b = this.presenceEventEngine) === null || _b === void 0 ? void 0 : _b.leave,
                    leaveAll: (_c = this.presenceEventEngine) === null || _c === void 0 ? void 0 : _c.leaveAll,
                    presenceState: this.presenceState,
                    config: this._configuration,
                    emitMessages: function (events) { return events.forEach(function (event) { return _this.eventEmitter.emitEvent(event); }); },
                    emitStatus: function (status) { return _this.listenerManager.announceStatus(status); },
                });
            }
            else {
                this.subscriptionManager = new SubscriptionManager(this._configuration, this.listenerManager, this.eventEmitter, this.makeSubscribe, this.heartbeat, this.makeUnsubscribe, this.time);
            }
        }
        /**
         * Construct notification payload which will trigger push notification.
         *
         * @param title - Title which will be shown on notification.
         * @param body - Payload which will be sent as part of notification.
         *
         * @returns Pre-formatted message payload which will trigger push notification.
         */
        PubNubCore.notificationPayload = function (title, body) {
            return new NotificationsPayload(title, body);
        };
        /**
         * Generate unique identifier.
         *
         * @returns Unique identifier.
         */
        PubNubCore.generateUUID = function () {
            return uuidGenerator.createUUID();
        };
        Object.defineProperty(PubNubCore.prototype, "configuration", {
            // --------------------------------------------------------
            // -------------------- Configuration ----------------------
            // --------------------------------------------------------
            // region Configuration
            /**
             * PubNub client configuration.
             *
             * @returns Currently user PubNub client configuration.
             */
            get: function () {
                return this._configuration;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PubNubCore.prototype, "_config", {
            /**
             * Current PubNub client configuration.
             *
             * @returns Currently user PubNub client configuration.
             *
             * @deprecated Use {@link configuration} getter instead.
             */
            get: function () {
                return this.configuration;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PubNubCore.prototype, "authKey", {
            /**
             * REST API endpoint access authorization key.
             *
             * It is required to have `authorization key` with required permissions to access REST API
             * endpoints when `PAM` enabled for user key set.
             */
            get: function () {
                var _a;
                return (_a = this._configuration.authKey) !== null && _a !== void 0 ? _a : undefined;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * REST API endpoint access authorization key.
         *
         * It is required to have `authorization key` with required permissions to access REST API
         * endpoints when `PAM` enabled for user key set.
         */
        PubNubCore.prototype.getAuthKey = function () {
            return this.authKey;
        };
        /**
         * Change REST API endpoint access authorization key.
         *
         * @param authKey - New authorization key which should be used with new requests.
         */
        PubNubCore.prototype.setAuthKey = function (authKey) {
            this._configuration.setAuthKey(authKey);
        };
        Object.defineProperty(PubNubCore.prototype, "userId", {
            /**
             * Get a PubNub client user identifier.
             *
             * @returns Current PubNub client user identifier.
             */
            get: function () {
                return this._configuration.userId;
            },
            /**
             * Change the current PubNub client user identifier.
             *
             * **Important:** Change won't affect ongoing REST API calls.
             *
             * @param value - New PubNub client user identifier.
             *
             * @throws Error empty user identifier has been provided.
             */
            set: function (value) {
                this._configuration.userId = value;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Get a PubNub client user identifier.
         *
         * @returns Current PubNub client user identifier.
         */
        PubNubCore.prototype.getUserId = function () {
            return this._configuration.userId;
        };
        /**
         * Change the current PubNub client user identifier.
         *
         * **Important:** Change won't affect ongoing REST API calls.
         *
         * @param value - New PubNub client user identifier.
         *
         * @throws Error empty user identifier has been provided.
         */
        PubNubCore.prototype.setUserId = function (value) {
            this._configuration.userId = value;
        };
        Object.defineProperty(PubNubCore.prototype, "filterExpression", {
            /**
             * Real-time updates filtering expression.
             *
             * @returns Filtering expression.
             */
            get: function () {
                var _a;
                return (_a = this._configuration.getFilterExpression()) !== null && _a !== void 0 ? _a : undefined;
            },
            /**
             * Update real-time updates filtering expression.
             *
             * @param expression - New expression which should be used or `undefined` to disable filtering.
             */
            set: function (expression) {
                this._configuration.setFilterExpression(expression);
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Real-time updates filtering expression.
         *
         * @returns Filtering expression.
         */
        PubNubCore.prototype.getFilterExpression = function () {
            return this.filterExpression;
        };
        /**
         * Update real-time updates filtering expression.
         *
         * @param expression - New expression which should be used or `undefined` to disable filtering.
         */
        PubNubCore.prototype.setFilterExpression = function (expression) {
            this.filterExpression = expression;
        };
        Object.defineProperty(PubNubCore.prototype, "cipherKey", {
            /**
             * Dta encryption / decryption key.
             *
             * @returns Currently used key for data encryption / decryption.
             */
            get: function () {
                return this._configuration.cipherKey;
            },
            /**
             * Change data encryption / decryption key.
             *
             * @param key - New key which should be used for data encryption / decryption.
             */
            set: function (key) {
                this._configuration.setCipherKey(key);
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Change data encryption / decryption key.
         *
         * @param key - New key which should be used for data encryption / decryption.
         */
        PubNubCore.prototype.setCipherKey = function (key) {
            this.cipherKey = key;
        };
        Object.defineProperty(PubNubCore.prototype, "heartbeatInterval", {
            /**
             * Change heartbeat requests interval.
             *
             * @param interval - New presence request heartbeat intervals.
             */
            set: function (interval) {
                this._configuration.setHeartbeatInterval(interval);
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Change heartbeat requests interval.
         *
         * @param interval - New presence request heartbeat intervals.
         */
        PubNubCore.prototype.setHeartbeatInterval = function (interval) {
            this.heartbeatInterval = interval;
        };
        /**
         * Get PubNub SDK version.
         *
         * @returns Current SDK version.
         */
        PubNubCore.prototype.getVersion = function () {
            return this._configuration.version;
        };
        /**
         * Add framework's prefix.
         *
         * @param name - Name of the framework which would want to add own data into `pnsdk` suffix.
         * @param suffix - Suffix with information about framework.
         */
        PubNubCore.prototype._addPnsdkSuffix = function (name, suffix) {
            this._configuration._addPnsdkSuffix(name, suffix);
        };
        // --------------------------------------------------------
        // ---------------------- Deprecated ----------------------
        // --------------------------------------------------------
        // region Deprecated
        /**
         * Get a PubNub client user identifier.
         *
         * @returns Current PubNub client user identifier.
         *
         * @deprecated Use the {@link getUserId} or {@link userId} getter instead.
         */
        PubNubCore.prototype.getUUID = function () {
            return this.userId;
        };
        /**
         * Change the current PubNub client user identifier.
         *
         * **Important:** Change won't affect ongoing REST API calls.
         *
         * @param value - New PubNub client user identifier.
         *
         * @throws Error empty user identifier has been provided.
         *
         * @deprecated Use the {@link PubNubCore#setUserId} or {@link PubNubCore#userId} setter instead.
         */
        PubNubCore.prototype.setUUID = function (value) {
            this.userId = value;
        };
        Object.defineProperty(PubNubCore.prototype, "customEncrypt", {
            /**
             * Custom data encryption method.
             *
             * @deprecated Instead use {@link cryptoModule} for data encryption.
             */
            get: function () {
                return this._configuration.customEncrypt;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PubNubCore.prototype, "customDecrypt", {
            /**
             * Custom data decryption method.
             *
             * @deprecated Instead use {@link cryptoModule} for data decryption.
             */
            get: function () {
                return this._configuration.customDecrypt;
            },
            enumerable: false,
            configurable: true
        });
        // endregion
        // endregion
        // --------------------------------------------------------
        // ---------------------- Entities ------------------------
        // --------------------------------------------------------
        // region Entities
        /**
         * Create a `Channel` entity.
         *
         * Entity can be used for the interaction with the following API:
         * - `subscribe`
         *
         * @param name - Unique channel name.
         * @returns `Channel` entity.
         */
        PubNubCore.prototype.channel = function (name) {
            return new Channel(name, this.eventEmitter, this);
        };
        /**
         * Create a `ChannelGroup` entity.
         *
         * Entity can be used for the interaction with the following API:
         * - `subscribe`
         *
         * @param name - Unique channel group name.
         * @returns `ChannelGroup` entity.
         */
        PubNubCore.prototype.channelGroup = function (name) {
            return new ChannelGroup(name, this.eventEmitter, this);
        };
        /**
         * Create a `ChannelMetadata` entity.
         *
         * Entity can be used for the interaction with the following API:
         * - `subscribe`
         *
         * @param id - Unique channel metadata object identifier.
         * @returns `ChannelMetadata` entity.
         */
        PubNubCore.prototype.channelMetadata = function (id) {
            return new ChannelMetadata(id, this.eventEmitter, this);
        };
        /**
         * Create a `UserMetadata` entity.
         *
         * Entity can be used for the interaction with the following API:
         * - `subscribe`
         *
         * @param id - Unique user metadata object identifier.
         * @returns `UserMetadata` entity.
         */
        PubNubCore.prototype.userMetadata = function (id) {
            return new UserMetadata(id, this.eventEmitter, this);
        };
        /**
         * Create subscriptions set object.
         *
         * @param parameters - Subscriptions set configuration parameters.
         */
        PubNubCore.prototype.subscriptionSet = function (parameters) {
            return new SubscriptionSet(__assign(__assign({}, parameters), { eventEmitter: this.eventEmitter, pubnub: this }));
        };
        /**
         * Schedule request execution.
         *
         * @param request - REST API request.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous request execution and response parsing result or `void` in case if
         * `callback` provided.
         *
         * @throws PubNubError in case of request processing error.
         */
        PubNubCore.prototype.sendRequest = function (request, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var validationResult, transportRequest, status, _a, sendableRequest, cancellationController;
                return __generator(this, function (_b) {
                    validationResult = request.validate();
                    if (validationResult) {
                        if (callback)
                            return [2 /*return*/, callback(createValidationError(validationResult), null)];
                        throw new PubNubError('Validation failed, check status for details', createValidationError(validationResult));
                    }
                    transportRequest = request.request();
                    if (transportRequest.body &&
                        typeof transportRequest.body === 'object' &&
                        'toArrayBuffer' in transportRequest.body) {
                        // Set 300 seconds file upload request delay.
                        transportRequest.timeout = 300;
                    }
                    else {
                        if (request.operation() === RequestOperation$1.PNSubscribeOperation)
                            transportRequest.timeout = this._configuration.getSubscribeTimeout();
                        else
                            transportRequest.timeout = this._configuration.getTransactionTimeout();
                    }
                    status = {
                        error: false,
                        operation: request.operation(),
                        statusCode: 0,
                    };
                    _a = __read(this.transport.makeSendable(transportRequest), 2), sendableRequest = _a[0], cancellationController = _a[1];
                    /**
                     * **Important:** Because of multiple environments where JS SDK can be used control over
                     * cancellation had to be inverted to let transport provider solve request cancellation task
                     * more efficiently. As result, cancellation controller can be retrieved and used only after
                     * request will be scheduled by transport provider.
                     */
                    request.cancellationController = cancellationController ? cancellationController : null;
                    return [2 /*return*/, sendableRequest
                            .then(function (response) {
                            status.statusCode = response.status;
                            return request.parse(response);
                        })
                            .then(function (parsed) {
                            // Notify callback (if possible).
                            if (callback)
                                return callback(status, parsed);
                            return parsed;
                        })
                            .catch(function (error) {
                            console.log("~~~~~~~> WHAT HERE?:", error);
                            if (error instanceof PubNubError) {
                                console.log("~~~~~~> OH, WE ARE REGULAR PUBNUB ERROR");
                                // @ts-expect-error I allow this for debug
                                console.log("~~~~~~~~> WHAT IN STATUS?: ", error['status']);
                            }
                            // const errorStatus = error.toStatus(request.operation());
                            var errorStatus = { error: true };
                            // Notify callback (if possible).
                            if (callback)
                                callback(errorStatus, null);
                            throw new PubNubError('REST API request processing error, check status for details', errorStatus);
                        })];
                });
            });
        };
        /**
         * Unsubscribe from all channels and groups.
         *
         * @param isOffline - Whether `offline` presence should be notified or not.
         */
        PubNubCore.prototype.destroy = function (isOffline) {
            if (this.subscriptionManager) {
                this.subscriptionManager.unsubscribeAll(isOffline);
                this.subscriptionManager.disconnect();
            }
            else if (this.eventEngine)
                this.eventEngine.dispose();
        };
        // endregion
        // --------------------------------------------------------
        // ----------------------- Listener -----------------------
        // --------------------------------------------------------
        // region Listener
        /**
         * Register real-time events listener.
         *
         * @param listener - Listener with event callbacks to handle different types of events.
         */
        PubNubCore.prototype.addListener = function (listener) {
            this.listenerManager.addListener(listener);
        };
        /**
         * Remove real-time event listener.
         *
         * @param listener - Event listeners which should be removed.
         */
        PubNubCore.prototype.removeListener = function (listener) {
            this.listenerManager.removeListener(listener);
        };
        /**
         * Clear all real-time event listeners.
         */
        PubNubCore.prototype.removeAllListeners = function () {
            this.listenerManager.removeAllListeners();
        };
        /**
         * Publish data to a specific channel.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous publish data response or `void` in case if `callback` provided.
         */
        PubNubCore.prototype.publish = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new PublishRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.cryptoModule }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Signal data to a specific channel.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous signal data response or `void` in case if `callback` provided.
         */
        PubNubCore.prototype.signal = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new SignalRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * `Fire` a data to a specific channel.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous signal data response or `void` in case if `callback` provided.
         *
         * @deprecated Use {@link publish} method instead.
         */
        PubNubCore.prototype.fire = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    callback !== null && callback !== void 0 ? callback : (callback = function () { });
                    return [2 /*return*/, this.publish(__assign(__assign({}, parameters), { replicate: false, storeInHistory: false }), callback)];
                });
            });
        };
        // endregion
        // --------------------------------------------------------
        // -------------------- Subscribe API ---------------------
        // --------------------------------------------------------
        // region Subscribe API
        /**
         * Get list of channels on which PubNub client currently subscribed.
         *
         * @returns List of active channels.
         */
        PubNubCore.prototype.getSubscribedChannels = function () {
            if (this.subscriptionManager)
                return this.subscriptionManager.subscribedChannels;
            else if (this.eventEngine)
                return this.eventEngine.getSubscribedChannels();
            return [];
        };
        /**
         * Get list of channel groups on which PubNub client currently subscribed.
         *
         * @returns List of active channel groups.
         */
        PubNubCore.prototype.getSubscribedChannelGroups = function () {
            if (this.subscriptionManager)
                return this.subscriptionManager.subscribedChannelGroups;
            else if (this.eventEngine)
                return this.eventEngine.getSubscribedChannelGroups();
            return [];
        };
        /**
         * Subscribe to specified channels and groups real-time events.
         *
         * @param parameters - Request configuration parameters.
         */
        PubNubCore.prototype.subscribe = function (parameters) {
            if (this.subscriptionManager)
                this.subscriptionManager.subscribe(parameters);
            else if (this.eventEngine)
                this.eventEngine.subscribe(parameters);
        };
        /**
         * Perform subscribe request.
         *
         * **Note:** Method passed into managers to let them use it when required.
         *
         * @param parameters - Request configuration parameters.
         * @param callback - Request completion handler callback.
         */
        PubNubCore.prototype.makeSubscribe = function (parameters, callback) {
            var _this = this;
            var request = new SubscribeRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet, getFileUrl: this.getFileUrl }));
            this.sendRequest(request, function (status, result) {
                if (_this.subscriptionManager && _this.subscriptionManager.abort === request.abort)
                    _this.subscriptionManager.abort = null;
                callback(status, result);
            });
            /**
             * Allow subscription cancellation.
             *
             * **Note:** Had to be done after scheduling because transport provider return cancellation
             * controller only when schedule new request.
             */
            if (this.subscriptionManager)
                this.subscriptionManager.abort = request.abort;
        };
        /**
         * Unsubscribe from specified channels and groups real-time events.
         *
         * @param parameters - Request configuration parameters.
         */
        PubNubCore.prototype.unsubscribe = function (parameters) {
            if (this.subscriptionManager)
                this.subscriptionManager.unsubscribe(parameters);
            else if (this.eventEngine)
                this.eventEngine.unsubscribe(parameters);
        };
        /**
         * Perform unsubscribe request.
         *
         * **Note:** Method passed into managers to let them use it when required.
         *
         * @param parameters - Request configuration parameters.
         * @param callback - Request completion handler callback.
         */
        PubNubCore.prototype.makeUnsubscribe = function (parameters, callback) {
            this.sendRequest(new PresenceLeaveRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet })), callback);
        };
        /**
         * Unsubscribe from all channels and groups.
         */
        PubNubCore.prototype.unsubscribeAll = function () {
            if (this.subscriptionManager)
                this.subscriptionManager.unsubscribeAll();
            else if (this.eventEngine)
                this.eventEngine.unsubscribeAll();
        };
        /**
         * Temporarily disconnect from real-time events stream.
         */
        PubNubCore.prototype.disconnect = function () {
            if (this.subscriptionManager)
                this.subscriptionManager.disconnect();
            else if (this.eventEngine)
                this.eventEngine.disconnect();
        };
        /**
         * Restore connection to the real-time events stream.
         *
         * @param parameters - Reconnection catch up configuration. **Note:** available only with
         * enabled event engine.
         */
        PubNubCore.prototype.reconnect = function (parameters) {
            if (this.subscriptionManager)
                this.subscriptionManager.reconnect();
            else if (this.eventEngine)
                this.eventEngine.reconnect(parameters !== null && parameters !== void 0 ? parameters : {});
        };
        /**
         * Event engine handshake subscribe.
         *
         * @param parameters - Request configuration parameters.
         */
        PubNubCore.prototype.subscribeHandshake = function (parameters) {
            return __awaiter(this, void 0, void 0, function () {
                var request, abortUnsubscribe, handshakeResponse;
                return __generator(this, function (_a) {
                    request = new HandshakeSubscribeRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.cryptoModule, getFileUrl: this.getFileUrl }));
                    abortUnsubscribe = parameters.abortSignal.subscribe(request.abort);
                    handshakeResponse = this.sendRequest(request);
                    return [2 /*return*/, handshakeResponse.then(function (response) {
                            abortUnsubscribe();
                            return response.cursor;
                        })];
                });
            });
        };
        /**
         * Event engine receive messages subscribe.
         *
         * @param parameters - Request configuration parameters.
         */
        PubNubCore.prototype.subscribeReceiveMessages = function (parameters) {
            return __awaiter(this, void 0, void 0, function () {
                var request, abortUnsubscribe, handshakeResponse;
                return __generator(this, function (_a) {
                    request = new ReceiveMessagesSubscribeRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.cryptoModule, getFileUrl: this.getFileUrl }));
                    abortUnsubscribe = parameters.abortSignal.subscribe(request.abort);
                    handshakeResponse = this.sendRequest(request);
                    return [2 /*return*/, handshakeResponse.then(function (response) {
                            abortUnsubscribe();
                            return response;
                        })];
                });
            });
        };
        /**
         * Get reactions to a specific message.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get reactions response or `void` in case if `callback` provided.
         */
        PubNubCore.prototype.getMessageActions = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new GetMessageActionsRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Add a reaction to a specific message.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous add a reaction response or `void` in case if `callback` provided.
         */
        PubNubCore.prototype.addMessageAction = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new AddMessageActionRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Remove a reaction from a specific message.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous remove a reaction response or `void` in case if `callback` provided.
         */
        PubNubCore.prototype.removeMessageAction = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new RemoveMessageAction(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Fetch messages history for channels.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous fetch messages response or `void` in case if `callback` provided.
         *
         * @deprecated
         */
        PubNubCore.prototype.fetchMessages = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new FetchMessagesRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.cryptoModule, getFileUrl: this.getFileUrl }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Delete messages from the channel history.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous delete messages response or `void` in case if `callback` provided.
         *
         * @deprecated
         */
        PubNubCore.prototype.deleteMessages = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new DeleteMessageRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Count messages from the channels' history.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous count messages response or `void` in case if `callback` provided.
         *
         * @deprecated
         */
        PubNubCore.prototype.messageCounts = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new MessageCountRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Fetch single channel history.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous fetch channel history response or `void` in case if `callback` provided.
         *
         * @deprecated
         */
        PubNubCore.prototype.history = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new GetHistoryRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.cryptoModule }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Get channel's presence information.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get channel's presence response or `void` in case if `callback` provided.
         */
        PubNubCore.prototype.hereNow = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new HereNowRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Get user's presence information.
         *
         * Get list of channels to which `uuid` currently subscribed.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get user's presence response or `void` in case if `callback` provided.
         */
        PubNubCore.prototype.whereNow = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                var _a;
                return __generator(this, function (_b) {
                    request = new WhereNowRequest({
                        uuid: (_a = parameters.uuid) !== null && _a !== void 0 ? _a : this._configuration.userId,
                        keySet: this._configuration.keySet,
                    });
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Get associated user's data for channels and groups.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get user's data response or `void` in case if `callback` provided.
         */
        PubNubCore.prototype.getState = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                var _a;
                return __generator(this, function (_b) {
                    request = new GetPresenceStateRequest(__assign(__assign({}, parameters), { uuid: (_a = parameters.uuid) !== null && _a !== void 0 ? _a : this._configuration.userId, keySet: this._configuration.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Set associated user's data for channels and groups.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous set user's data response or `void` in case if `callback` provided.
         */
        PubNubCore.prototype.setState = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, keySet, uuid, heartbeat, request, presenceState_1;
                var _b, _c;
                return __generator(this, function (_d) {
                    _a = this._configuration, keySet = _a.keySet, uuid = _a.userId;
                    heartbeat = this._configuration.getPresenceTimeout();
                    // Maintain presence information (if required).
                    if (this._configuration.enableEventEngine && this.presenceState) {
                        presenceState_1 = this.presenceState;
                        (_b = parameters.channels) === null || _b === void 0 ? void 0 : _b.forEach(function (channel) { return (presenceState_1[channel] = parameters.state); });
                        if ('channelGroups' in parameters) {
                            (_c = parameters.channelGroups) === null || _c === void 0 ? void 0 : _c.forEach(function (group) { return (presenceState_1[group] = parameters.state); });
                        }
                    }
                    // Check whether state should be set with heartbeat or not.
                    if ('withHeartbeat' in parameters) {
                        request = new HeartbeatRequest(__assign(__assign({}, parameters), { keySet: keySet, heartbeat: heartbeat }));
                    }
                    else {
                        request = new SetPresenceStateRequest(__assign(__assign({}, parameters), { keySet: keySet, uuid: uuid }));
                    }
                    // Update state used by subscription manager.
                    if (this.subscriptionManager)
                        this.subscriptionManager.setState(parameters);
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        // endregion
        // region Change presence state
        /**
         * Manual presence management.
         *
         * @param parameters - Desired presence state for provided list of channels and groups.
         */
        PubNubCore.prototype.presence = function (parameters) {
            var _a;
            (_a = this.subscriptionManager) === null || _a === void 0 ? void 0 : _a.changePresence(parameters);
        };
        // endregion
        // region Heartbeat
        /**
         * Announce user presence
         *
         * @param parameters - Desired presence state for provided list of channels and groups.
         */
        PubNubCore.prototype.heartbeat = function (parameters) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    // Manual presence management possible only with subscription manager.
                    if (!this.subscriptionManager)
                        return [2 /*return*/];
                    request = new HeartbeatRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Grant token permission.
         *
         * Generate access token with requested permissions.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous grant token response or `void` in case if `callback` provided.
         */
        PubNubCore.prototype.grantToken = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new GrantTokenRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Revoke token permission.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous revoke token response or `void` in case if `callback` provided.
         */
        PubNubCore.prototype.revokeToken = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new RevokeTokenRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        Object.defineProperty(PubNubCore.prototype, "token", {
            // endregion
            // region Token Manipulation
            /**
             * Get current access token.
             *
             * @returns Previously configured access token using {@link setToken} method.
             */
            get: function () {
                return this.tokenManager.getToken();
            },
            /**
             * Set current access token.
             *
             * @param token - New access token which should be used with next REST API endpoint calls.
             */
            set: function (token) {
                this.tokenManager.setToken(token);
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Get current access token.
         *
         * @returns Previously configured access token using {@link setToken} method.
         */
        PubNubCore.prototype.getToken = function () {
            return this.token;
        };
        /**
         * Set current access token.
         *
         * @param token - New access token which should be used with next REST API endpoint calls.
         */
        PubNubCore.prototype.setToken = function (token) {
            this.token = token;
        };
        /**
         * Parse access token.
         *
         * Parse token to see what permissions token owner has.
         *
         * @param token - Token which should be parsed.
         *
         * @returns Token's permissions information for the resources.
         */
        PubNubCore.prototype.parseToken = function (token) {
            return this.tokenManager.parseToken(token);
        };
        /**
         * Grant auth key(s) permission.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous grant auth key(s) permissions or `void` in case if `callback` provided.
         *
         * @deprecated Use {@link grantToken} and {@link setToken} methods instead.
         */
        PubNubCore.prototype.grant = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new GrantRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Audit auth key(s) permission.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @deprecated
         *
         * @deprecated Use {@link grantToken} and {@link setToken} methods instead.
         */
        PubNubCore.prototype.audit = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new AuditRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        Object.defineProperty(PubNubCore.prototype, "objects", {
            // endregion
            // endregion
            // endregion
            // --------------------------------------------------------
            // ------------------- App Context API --------------------
            // --------------------------------------------------------
            // region App Context API
            /**
             * PubNub App Context API group.
             */
            get: function () {
                return this._objects;
            },
            enumerable: false,
            configurable: true
        });
        /**
         Fetch a paginated list of User objects.
         *
         * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get all User objects response or `void` in case if `callback` provided.
         *
         * @deprecated Use {@link PubNubCore#objects.getAllUUIDMetadata} method instead.
         */
        PubNubCore.prototype.fetchUsers = function (parametersOrCallback, callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.objects._getAllUUIDMetadata(parametersOrCallback, callback)];
                });
            });
        };
        /**
         * Fetch User object for currently configured PubNub client `uuid`.
         *
         * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get User object response or `void` in case if `callback` provided.
         *
         * @deprecated Use {@link PubNubCore#objects.getUUIDMetadata} method instead.
         */
        PubNubCore.prototype.fetchUser = function (parametersOrCallback, callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.objects._getUUIDMetadata(parametersOrCallback, callback)];
                });
            });
        };
        /**
         * Create User object.
         *
         * @param parameters - Request configuration parameters. Will create User object for currently
         * configured PubNub client `uuid` if not set.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous create User object response or `void` in case if `callback` provided.
         *
         * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata} method instead.
         */
        PubNubCore.prototype.createUser = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.objects._setUUIDMetadata(parameters, callback)];
                });
            });
        };
        /**
         * Update User object.
         *
         * @param parameters - Request configuration parameters. Will update User object for currently
         * configured PubNub client `uuid` if not set.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous update User object response or `void` in case if `callback` provided.
         *
         * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata} method instead.
         */
        PubNubCore.prototype.updateUser = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.objects._setUUIDMetadata(parameters, callback)];
                });
            });
        };
        /**
         * Remove a specific User object.
         *
         * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous User object remove response or `void` in case if `callback` provided.
         *
         * @deprecated Use {@link PubNubCore#objects.removeUUIDMetadata} method instead.
         */
        PubNubCore.prototype.removeUser = function (parametersOrCallback, callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.objects._removeUUIDMetadata(parametersOrCallback, callback)];
                });
            });
        };
        /**
         * Fetch a paginated list of Space objects.
         *
         * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get all Space objects response or `void` in case if `callback`
         * provided.
         *
         * @deprecated Use {@link PubNubCore#objects.getAllChannelMetadata} method instead.
         */
        PubNubCore.prototype.fetchSpaces = function (parametersOrCallback, callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.objects._getAllChannelMetadata(parametersOrCallback, callback)];
                });
            });
        };
        /**
         * Fetch a specific Space object.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get Space object response or `void` in case if `callback` provided.
         *
         * @deprecated Use {@link PubNubCore#objects.getChannelMetadata} method instead.
         */
        PubNubCore.prototype.fetchSpace = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.objects._getChannelMetadata(parameters, callback)];
                });
            });
        };
        /**
         * Create specific Space object.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous create Space object response or `void` in case if `callback` provided.
         *
         * @deprecated Use {@link PubNubCore#objects.setChannelMetadata} method instead.
         */
        PubNubCore.prototype.createSpace = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.objects._setChannelMetadata(parameters, callback)];
                });
            });
        };
        /**
         * Update specific Space object.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous update Space object response or `void` in case if `callback` provided.
         *
         * @deprecated Use {@link PubNubCore#objects.setChannelMetadata} method instead.
         */
        PubNubCore.prototype.updateSpace = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.objects._setChannelMetadata(parameters, callback)];
                });
            });
        };
        /**
         * Remove a specific Space object.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous Space object remove response or `void` in case if `callback`
         * provided.
         *
         * @deprecated Use {@link PubNubCore#objects.removeChannelMetadata} method instead.
         */
        PubNubCore.prototype.removeSpace = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.objects._removeChannelMetadata(parameters, callback)];
                });
            });
        };
        /**
         * Fetch paginated list of specific Space members or specific User memberships.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get specific Space members or specific User memberships response or
         * `void` in case if `callback` provided.
         *
         * @deprecated Use {@link PubNubCore#objects.getChannelMembers} or {@link PubNubCore#objects.getMemberships}
         * methods instead.
         */
        PubNubCore.prototype.fetchMemberships = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.objects.fetchMemberships(parameters, callback)];
                });
            });
        };
        /**
         * Add members to specific Space or memberships specific User.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous add members to specific Space or memberships specific User response or
         * `void` in case if `callback` provided.
         *
         * @deprecated Use {@link PubNubCore#objects.setChannelMembers} or {@link PubNubCore#objects.setMemberships}
         * methods instead.
         */
        PubNubCore.prototype.addMemberships = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.objects.addMemberships(parameters, callback)];
                });
            });
        };
        /**
         * Update specific Space members or User memberships.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous update Space members or User memberships response or `void` in case
         * if `callback` provided.
         *
         * @deprecated Use {@link PubNubCore#objects.setChannelMembers} or {@link PubNubCore#objects.setMemberships}
         * methods instead.
         */
        PubNubCore.prototype.updateMemberships = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.objects.addMemberships(parameters, callback)];
                });
            });
        };
        /**
         * Remove User membership.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous memberships modification response or `void` in case if `callback` provided.
         *
         * @deprecated Use {@link PubNubCore#objects.removeMemberships} or {@link PubNubCore#objects.removeChannelMembers}
         * methods instead
         * from `objects` API group..
         */
        PubNubCore.prototype.removeMemberships = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var spaceParameters, requestParameters_1, userParameters, requestParameters;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    if ('spaceId' in parameters) {
                        spaceParameters = parameters;
                        requestParameters_1 = {
                            channel: (_a = spaceParameters.spaceId) !== null && _a !== void 0 ? _a : spaceParameters.channel,
                            uuids: (_b = spaceParameters.userIds) !== null && _b !== void 0 ? _b : spaceParameters.uuids,
                            limit: 0,
                        };
                        if (callback)
                            return [2 /*return*/, this.objects.removeChannelMembers(requestParameters_1, callback)];
                        return [2 /*return*/, this.objects.removeChannelMembers(requestParameters_1)];
                    }
                    userParameters = parameters;
                    requestParameters = {
                        uuid: userParameters.userId,
                        channels: (_c = userParameters.spaceIds) !== null && _c !== void 0 ? _c : userParameters.channels,
                        limit: 0,
                    };
                    if (callback)
                        return [2 /*return*/, this.objects.removeMemberships(requestParameters, callback)];
                    return [2 /*return*/, this.objects.removeMemberships(requestParameters)];
                });
            });
        };
        Object.defineProperty(PubNubCore.prototype, "channelGroups", {
            // endregion
            // endregion
            // --------------------------------------------------------
            // ----------------- Channel Groups API -------------------
            // --------------------------------------------------------
            // region Channel Groups API
            /**
             * PubNub Channel Groups API group.
             */
            get: function () {
                return this._channelGroups;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(PubNubCore.prototype, "push", {
            // endregion
            // --------------------------------------------------------
            // ---------------- Push Notifications API -----------------
            // --------------------------------------------------------
            // region Push Notifications API
            /**
             * PubNub Push Notifications API group.
             */
            get: function () {
                return this._push;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Share file to a specific channel.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous file sharing response or `void` in case if `callback` provided.
         */
        PubNubCore.prototype.sendFile = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var sendFileRequest, status;
                var _a;
                return __generator(this, function (_b) {
                    if (!this._configuration.PubNubFile)
                        throw new Error("Validation failed: 'PubNubFile' not configured or file upload not supported by the platform.");
                    sendFileRequest = new SendFileRequest(__assign(__assign({}, parameters), { cipherKey: (_a = parameters.cipherKey) !== null && _a !== void 0 ? _a : this._configuration.cipherKey, keySet: this._configuration.keySet, PubNubFile: this._configuration.PubNubFile, fileUploadPublishRetryLimit: this._configuration.fileUploadPublishRetryLimit, file: parameters.file, sendRequest: this.sendRequest, publishFile: this.publishFile, crypto: this._configuration.cryptoModule, cryptography: this.cryptography ? this.cryptography : undefined }));
                    status = {
                        error: false,
                        operation: RequestOperation$1.PNPublishFileOperation,
                        statusCode: 0,
                    };
                    return [2 /*return*/, sendFileRequest
                            .process()
                            .then(function (response) {
                            status.statusCode = response.status;
                            if (callback)
                                return callback(status, response);
                            return response;
                        })
                            .catch(function (error) {
                            var errorStatus = error.toStatus(status.operation);
                            // Notify callback (if possible).
                            if (callback)
                                callback(errorStatus, null);
                            throw new PubNubError('REST API request processing error, check status for details', errorStatus);
                        })];
                });
            });
        };
        /**
         * Publish file message to a specific channel.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous publish file message response or `void` in case if `callback` provided.
         */
        PubNubCore.prototype.publishFile = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    if (!this._configuration.PubNubFile)
                        throw new Error("Validation failed: 'PubNubFile' not configured or file upload not supported by the platform.");
                    request = new PublishFileMessageRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.cryptoModule }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         * Retrieve list of shared files in specific channel.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous shared files list response or `void` in case if `callback` provided.
         */
        PubNubCore.prototype.listFiles = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new FilesListRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        // endregion
        // region Get Download Url
        /**
         * Get file download Url.
         *
         * @param parameters - Request configuration parameters.
         *
         * @returns File download Url.
         */
        PubNubCore.prototype.getFileUrl = function (parameters) {
            var _a;
            var request = this.transport.request(new GetFileDownloadUrlRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet })).request());
            var query = (_a = request.queryParameters) !== null && _a !== void 0 ? _a : {};
            var queryString = Object.keys(query)
                .map(function (key) {
                var queryValue = query[key];
                if (!Array.isArray(queryValue))
                    return "".concat(key, "=").concat(encodeString(queryValue));
                return queryValue.map(function (value) { return "".concat(key, "=").concat(encodeString(value)); }).join('&');
            })
                .join('&');
            return "".concat(request.origin).concat(request.path, "?").concat(queryString);
        };
        /**
         * Download shared file from specific channel.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous download shared file response or `void` in case if `callback` provided.
         */
        PubNubCore.prototype.downloadFile = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!this._configuration.PubNubFile)
                                throw new Error("Validation failed: 'PubNubFile' not configured or file upload not supported by the platform.");
                            request = new DownloadFileRequest(__assign(__assign({}, parameters), { cipherKey: (_a = parameters.cipherKey) !== null && _a !== void 0 ? _a : this._configuration.cipherKey, keySet: this._configuration.keySet, PubNubFile: this._configuration.PubNubFile, cryptography: this.cryptography ? this.cryptography : undefined, crypto: this._configuration.cryptoModule }));
                            if (callback)
                                return [2 /*return*/, this.sendRequest(request, callback)];
                            return [4 /*yield*/, this.sendRequest(request)];
                        case 1: return [2 /*return*/, (_b.sent())];
                    }
                });
            });
        };
        /**
         * Delete shared file from specific channel.
         *
         * @param parameters - Request configuration parameters.
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous delete shared file response or `void` in case if `callback` provided.
         */
        PubNubCore.prototype.deleteFile = function (parameters, callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new DeleteFileRequest(__assign(__assign({}, parameters), { keySet: this._configuration.keySet }));
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        /**
         Get current high-precision timetoken.
         *
         * @param [callback] - Request completion handler callback.
         *
         * @returns Asynchronous get current timetoken response or `void` in case if `callback` provided.
         */
        PubNubCore.prototype.time = function (callback) {
            return __awaiter(this, void 0, void 0, function () {
                var request;
                return __generator(this, function (_a) {
                    request = new TimeRequest();
                    if (callback)
                        return [2 /*return*/, this.sendRequest(request, callback)];
                    return [2 /*return*/, this.sendRequest(request)];
                });
            });
        };
        // endregion
        // --------------------------------------------------------
        // ------------------ Cryptography API --------------------
        // --------------------------------------------------------
        // region Cryptography
        // region Common
        /**
         * Encrypt data.
         *
         * @param data - Stringified data which should be encrypted using `CryptoModule`.
         * @deprecated
         * @param [customCipherKey] - Cipher key which should be used to encrypt data. **Deprecated:**
         * use {@link Configuration#cryptoModule|cryptoModule} instead.
         *
         * @returns Data encryption result as a string.
         */
        PubNubCore.prototype.encrypt = function (data, customCipherKey) {
            if (typeof customCipherKey === 'undefined' && this._configuration.cryptoModule) {
                var encrypted = this._configuration.cryptoModule.encrypt(data);
                return typeof encrypted === 'string' ? encrypted : encode(encrypted);
            }
            if (!this.crypto)
                throw new Error('Encryption error: cypher key not set');
            return this.crypto.encrypt(data, customCipherKey);
        };
        /**
         * Decrypt data.
         *
         * @param data - Stringified data which should be encrypted using `CryptoModule`.
         * @param [customCipherKey] - Cipher key which should be used to decrypt data. **Deprecated:**
         * use {@link Configuration#cryptoModule|cryptoModule} instead.
         *
         * @returns Data decryption result as an object.
         */
        PubNubCore.prototype.decrypt = function (data, customCipherKey) {
            if (typeof customCipherKey === 'undefined' && this._configuration.cryptoModule) {
                var decrypted = this._configuration.cryptoModule.decrypt(data);
                return decrypted instanceof ArrayBuffer ? JSON.parse(new TextDecoder().decode(decrypted)) : decrypted;
            }
            if (!this.crypto)
                throw new Error('Decryption error: cypher key not set');
            return this.crypto.decrypt(data, customCipherKey);
        };
        /**
         * Encrypt file content.
         *
         * @param keyOrFile - Cipher key which should be used to encrypt data or file which should be
         * encrypted using `CryptoModule`.
         * @param [file] - File which should be encrypted using legacy cryptography.
         *
         * @returns Asynchronous file encryption result.
         *
         * @throws Error if source file not provided.
         * @throws File constructor not provided.
         * @throws Crypto module is missing (if non-legacy flow used).
         */
        PubNubCore.prototype.encryptFile = function (keyOrFile, file) {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    if (typeof keyOrFile !== 'string')
                        file = keyOrFile;
                    if (!file)
                        throw new Error('File encryption error. Source file is missing.');
                    if (!this._configuration.PubNubFile)
                        throw new Error('File encryption error. File constructor not configured.');
                    if (typeof keyOrFile !== 'string' && !this._configuration.cryptoModule)
                        throw new Error('File encryption error. Crypto module not configured.');
                    if (typeof keyOrFile === 'string') {
                        if (!this.cryptography)
                            throw new Error('File encryption error. File encryption not available');
                        return [2 /*return*/, this.cryptography.encryptFile(keyOrFile, file, this._configuration.PubNubFile)];
                    }
                    return [2 /*return*/, (_a = this._configuration.cryptoModule) === null || _a === void 0 ? void 0 : _a.encryptFile(file, this._configuration.PubNubFile)];
                });
            });
        };
        /**
         * Decrypt file content.
         *
         * @param keyOrFile - Cipher key which should be used to decrypt data or file which should be
         * decrypted using `CryptoModule`.
         * @param [file] - File which should be decrypted using legacy cryptography.
         *
         * @returns Asynchronous file decryption result.
         *
         * @throws Error if source file not provided.
         * @throws File constructor not provided.
         * @throws Crypto module is missing (if non-legacy flow used).
         */
        PubNubCore.prototype.decryptFile = function (keyOrFile, file) {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    if (typeof keyOrFile !== 'string')
                        file = keyOrFile;
                    if (!file)
                        throw new Error('File encryption error. Source file is missing.');
                    if (!this._configuration.PubNubFile)
                        throw new Error('File decryption error. File constructor' + ' not configured.');
                    if (typeof keyOrFile === 'string' && !this._configuration.cryptoModule)
                        throw new Error('File decryption error. Crypto module not configured.');
                    if (typeof keyOrFile === 'string') {
                        if (!this.cryptography)
                            throw new Error('File decryption error. File decryption not available');
                        return [2 /*return*/, this.cryptography.decryptFile(keyOrFile, file, this._configuration.PubNubFile)];
                    }
                    return [2 /*return*/, (_a = this._configuration.cryptoModule) === null || _a === void 0 ? void 0 : _a.decryptFile(file, this._configuration.PubNubFile)];
                });
            });
        };
        // --------------------------------------------------------
        // ----------------------- Static -------------------------
        // --------------------------------------------------------
        // region Static
        /**
         * Type of REST API endpoint which reported status.
         */
        PubNubCore.OPERATIONS = RequestOperation$1;
        /**
         * API call status category.
         */
        PubNubCore.CATEGORIES = StatusCategory$1;
        /**
         * Exponential retry policy constructor.
         */
        PubNubCore.ExponentialRetryPolicy = RetryPolicy.ExponentialRetryPolicy;
        /**
         * Linear retry policy constructor.
         */
        PubNubCore.LinearRetryPolicy = RetryPolicy.LinearRetryPolicy;
        return PubNubCore;
    }());

    var default_1 = /** @class */ (function () {
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

    /* eslint no-bitwise: ["error", { "allow": ["~", "&", ">>"] }] */
    /* global navigator, window */
    /**
     * PubNub client for browser platform.
     */
    var PubNub = /** @class */ (function (_super) {
        __extends(PubNub, _super);
        function PubNub(configuration) {
            var _this = this;
            var _a;
            var configurationCopy = setDefaults(configuration);
            var platformConfiguration = __assign(__assign({}, configurationCopy), { sdkFamily: 'Nodejs', PubNubFile: PubNubFile });
            // Prepare full client configuration.
            var clientConfiguration = makeConfiguration(platformConfiguration, function (cryptoConfiguration) {
                if (!cryptoConfiguration.cipherKey)
                    return undefined;
                return new WebCryptoModule({
                    default: new LegacyCryptor(__assign({}, cryptoConfiguration)),
                    cryptors: [new AesCbcCryptor({ cipherKey: cryptoConfiguration.cipherKey })],
                });
            });
            // Prepare Token manager.
            var tokenManager = new default_1$2(new default_1(function (arrayBuffer) { return stringifyBufferKeys(CborReader.decode(arrayBuffer)); }, decode));
            // Legacy crypto (legacy data encryption / decryption and request signature support).
            var crypto;
            if (clientConfiguration.cipherKey || clientConfiguration.secretKey) {
                var secretKey = clientConfiguration.secretKey, cipherKey = clientConfiguration.cipherKey, useRandomIVs = clientConfiguration.useRandomIVs, customEncrypt = clientConfiguration.customEncrypt, customDecrypt = clientConfiguration.customDecrypt;
                crypto = new default_1$3({ secretKey: secretKey, cipherKey: cipherKey, useRandomIVs: useRandomIVs, customEncrypt: customEncrypt, customDecrypt: customDecrypt });
            }
            // Setup transport provider.
            var transportMiddleware = new PubNubMiddleware({
                clientConfiguration: clientConfiguration,
                tokenManager: tokenManager,
                transport: new WebTransport(clientConfiguration.keepAlive, clientConfiguration.logVerbosity),
            });
            _this = _super.call(this, {
                configuration: clientConfiguration,
                transport: transportMiddleware,
                cryptography: new WebCryptography(),
                tokenManager: tokenManager,
                crypto: crypto,
            }) || this;
            if ((_a = configuration.listenToBrowserNetworkEvents) !== null && _a !== void 0 ? _a : true) {
                window.addEventListener('offline', function () {
                    _this.networkDownDetected();
                });
                window.addEventListener('online', function () {
                    _this.networkUpDetected();
                });
            }
            return _this;
        }
        PubNub.prototype.networkDownDetected = function () {
            this.listenerManager.announceNetworkDown();
            if (this._configuration.restore)
                this.disconnect();
            else
                this.destroy(true);
        };
        PubNub.prototype.networkUpDetected = function () {
            this.listenerManager.announceNetworkUp();
            this.reconnect();
        };
        /**
         * Data encryption / decryption module constructor.
         */
        PubNub.CryptoModule = WebCryptoModule;
        return PubNub;
    }(PubNubCore));

    return PubNub;

}));
