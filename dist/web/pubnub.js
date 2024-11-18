(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.PubNub = factory());
})(this, (function () { 'use strict';

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

		if (module.exports)
		  module.exports = obj;
		else if (!global.CBOR)
		  global.CBOR = obj;

		})(commonjsGlobal); 
	} (cbor));

	var cborExports = cbor.exports;
	var CborReader = /*@__PURE__*/getDefaultExportFromCjs(cborExports);

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
	/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


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

	typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
	    var e = new Error(message);
	    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
	};

	/**
	 * Crypto module.
	 */
	class AbstractCryptoModule {
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
	    static legacyCryptoModule(config) {
	        throw new Error('Should be implemented by concrete crypto module implementation.');
	    }
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
	    static aesCbcCryptoModule(config) {
	        throw new Error('Should be implemented by concrete crypto module implementation.');
	    }
	    // endregion
	    constructor(configuration) {
	        var _a;
	        this.defaultCryptor = configuration.default;
	        this.cryptors = (_a = configuration.cryptors) !== null && _a !== void 0 ? _a : [];
	    }
	    // endregion
	    // --------------------------------------------------------
	    // ----------------------- Helpers ------------------------
	    // --------------------------------------------------------
	    // region Helpers
	    /**
	     * Retrieve list of module's cryptors.
	     *
	     * @internal
	     */
	    getAllCryptors() {
	        return [this.defaultCryptor, ...this.cryptors];
	    }
	}
	/**
	 * `String` to {@link ArrayBuffer} response decoder.
	 *
	 * @internal
	 */
	AbstractCryptoModule.encoder = new TextEncoder();
	/**
	 *  {@link ArrayBuffer} to {@link string} decoder.
	 *
	 * @internal
	 */
	AbstractCryptoModule.decoder = new TextDecoder();

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
	class PubNubFile {
	    // endregion
	    static create(file) {
	        return new PubNubFile(file);
	    }
	    constructor(file) {
	        let contentLength;
	        let fileMimeType;
	        let fileName;
	        let fileData;
	        if (file instanceof File) {
	            fileData = file;
	            fileName = file.name;
	            fileMimeType = file.type;
	            contentLength = file.size;
	        }
	        else if ('data' in file) {
	            const contents = file.data;
	            fileMimeType = file.mimeType;
	            fileName = file.name;
	            fileData = new File([contents], fileName, { type: fileMimeType });
	            contentLength = fileData.size;
	        }
	        if (fileData === undefined)
	            throw new Error("Couldn't construct a file out of supplied options.");
	        if (fileName === undefined)
	            throw new Error("Couldn't guess filename out of the options. Please provide one.");
	        if (contentLength)
	            this.contentLength = contentLength;
	        this.mimeType = fileMimeType;
	        this.data = fileData;
	        this.name = fileName;
	    }
	    /**
	     * Convert {@link PubNub} File object content to {@link Buffer}.
	     *
	     * @throws Error because {@link Buffer} not available in browser environment.
	     */
	    toBuffer() {
	        return __awaiter(this, void 0, void 0, function* () {
	            throw new Error('This feature is only supported in Node.js environments.');
	        });
	    }
	    /**
	     * Convert {@link PubNub} File object content to {@link ArrayBuffer}.
	     *
	     * @returns Asynchronous results of conversion to the {@link ArrayBuffer}.
	     */
	    toArrayBuffer() {
	        return __awaiter(this, void 0, void 0, function* () {
	            return new Promise((resolve, reject) => {
	                const reader = new FileReader();
	                reader.addEventListener('load', () => {
	                    if (reader.result instanceof ArrayBuffer)
	                        return resolve(reader.result);
	                });
	                reader.addEventListener('error', () => reject(reader.error));
	                reader.readAsArrayBuffer(this.data);
	            });
	        });
	    }
	    /**
	     * Convert {@link PubNub} File object content to {@link string}.
	     *
	     * @returns Asynchronous results of conversion to the {@link string}.
	     */
	    toString() {
	        return __awaiter(this, void 0, void 0, function* () {
	            return new Promise((resolve, reject) => {
	                const reader = new FileReader();
	                reader.addEventListener('load', () => {
	                    if (typeof reader.result === 'string') {
	                        return resolve(reader.result);
	                    }
	                });
	                reader.addEventListener('error', () => {
	                    reject(reader.error);
	                });
	                reader.readAsBinaryString(this.data);
	            });
	        });
	    }
	    /**
	     * Convert {@link PubNub} File object content to {@link Readable} stream.
	     *
	     * @throws Error because {@link Readable} stream not available in browser environment.
	     */
	    toStream() {
	        return __awaiter(this, void 0, void 0, function* () {
	            throw new Error('This feature is only supported in Node.js environments.');
	        });
	    }
	    /**
	     * Convert {@link PubNub} File object content to {@link File}.
	     *
	     * @returns Asynchronous results of conversion to the {@link File}.
	     */
	    toFile() {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this.data;
	        });
	    }
	    /**
	     * Convert {@link PubNub} File object content to file `Uri`.
	     *
	     * @throws Error because file `Uri` not available in browser environment.
	     */
	    toFileUri() {
	        return __awaiter(this, void 0, void 0, function* () {
	            throw new Error('This feature is only supported in React Native environments.');
	        });
	    }
	    /**
	     * Convert {@link PubNub} File object content to {@link Blob}.
	     *
	     * @returns Asynchronous results of conversion to the {@link Blob}.
	     */
	    toBlob() {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this.data;
	        });
	    }
	}
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

	/**
	 * Base64 support module.
	 *
	 * @internal
	 */
	const BASE64_CHARMAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	/**
	 * Decode a Base64 encoded string.
	 *
	 * @param paddedInput Base64 string with padding
	 * @returns ArrayBuffer with decoded data
	 *
	 * @internal
	 */
	function decode(paddedInput) {
	    // Remove up to last two equal signs.
	    const input = paddedInput.replace(/==?$/, '');
	    const outputLength = Math.floor((input.length / 4) * 3);
	    // Prepare output buffer.
	    const data = new ArrayBuffer(outputLength);
	    const view = new Uint8Array(data);
	    let cursor = 0;
	    /**
	     * Returns the next integer representation of a sixtet of bytes from the input
	     * @returns sixtet of bytes
	     */
	    function nextSixtet() {
	        const char = input.charAt(cursor++);
	        const index = BASE64_CHARMAP.indexOf(char);
	        if (index === -1) {
	            throw new Error(`Illegal character at ${cursor}: ${input.charAt(cursor - 1)}`);
	        }
	        return index;
	    }
	    for (let i = 0; i < outputLength; i += 3) {
	        // Obtain four sixtets
	        const sx1 = nextSixtet();
	        const sx2 = nextSixtet();
	        const sx3 = nextSixtet();
	        const sx4 = nextSixtet();
	        // Encode them as three octets
	        const oc1 = ((sx1 & 0b00111111) << 2) | (sx2 >> 4);
	        const oc2 = ((sx2 & 0b00001111) << 4) | (sx3 >> 2);
	        const oc3 = ((sx3 & 0b00000011) << 6) | (sx4 >> 0);
	        view[i] = oc1;
	        // Skip padding bytes.
	        if (sx3 != 64)
	            view[i + 1] = oc2;
	        if (sx4 != 64)
	            view[i + 2] = oc3;
	    }
	    return data;
	}
	/**
	 * Encode `ArrayBuffer` as a Base64 encoded string.
	 *
	 * @param input ArrayBuffer with source data.
	 * @returns Base64 string with padding.
	 *
	 * @internal
	 */
	function encode(input) {
	    let base64 = '';
	    const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	    const bytes = new Uint8Array(input);
	    const byteLength = bytes.byteLength;
	    const byteRemainder = byteLength % 3;
	    const mainLength = byteLength - byteRemainder;
	    let a, b, c, d;
	    let chunk;
	    // Main loop deals with bytes in chunks of 3
	    for (let i = 0; i < mainLength; i = i + 3) {
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
	     * Incomplete parameters provided for used endpoint.
	     */
	    StatusCategory["PNValidationErrorCategory"] = "PNValidationErrorCategory";
	    /**
	     * PubNub request acknowledgment status.
	     *
	     * Some API endpoints respond with request processing status w/o useful data.
	     */
	    StatusCategory["PNAcknowledgmentCategory"] = "PNAcknowledgmentCategory";
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

	/**
	 * PubNub operation error module.
	 */
	/**
	 * PubNub operation error.
	 *
	 * When an operation can't be performed or there is an error from the server, this object will be returned.
	 */
	class PubNubError extends Error {
	    /**
	     * Create PubNub operation error.
	     *
	     * @param message - Message with details about why operation failed.
	     * @param [status] - Additional information about performed operation.
	     *
	     * @returns Configured and ready to use PubNub operation error.
	     *
	     * @internal
	     */
	    constructor(message, status) {
	        super(message);
	        this.status = status;
	        this.name = 'PubNubError';
	        this.message = message;
	        Object.setPrototypeOf(this, new.target.prototype);
	    }
	}
	/**
	 * Create error status object.
	 *
	 * @param errorPayload - Additional information which should be attached to the error status object.
	 *
	 * @returns Error status object.
	 *
	 * @internal
	 */
	function createError(errorPayload) {
	    var _a;
	    (_a = errorPayload.statusCode) !== null && _a !== void 0 ? _a : (errorPayload.statusCode = 0);
	    return Object.assign(Object.assign({}, errorPayload), { statusCode: errorPayload.statusCode, category: StatusCategory$1.PNValidationErrorCategory, error: true });
	}
	/**
	 * Create operation arguments validation error status object.
	 *
	 * @param message - Information about failed validation requirement.
	 * @param [statusCode] - Operation HTTP status code.
	 *
	 * @returns Operation validation error status object.
	 *
	 * @internal
	 */
	function createValidationError(message, statusCode) {
	    return createError(Object.assign({ message }, ({})));
	}

	/**
	 * CryptoJS implementation.
	 *
	 * @internal
	 */

	/*eslint-disable */

	/*
	 CryptoJS v3.1.2
	 code.google.com/p/crypto-js
	 (c) 2009-2013 by Jeff Mott. All rights reserved.
	 code.google.com/p/crypto-js/wiki/License
	 */
	var CryptoJS =
	  CryptoJS ||
	  (function (h, s) {
	    var f = {},
	      g = (f.lib = {}),
	      q = function () {},
	      m = (g.Base = {
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
	        init: function () {},
	        mixIn: function (a) {
	          for (var c in a) a.hasOwnProperty(c) && (this[c] = a[c]);
	          a.hasOwnProperty('toString') && (this.toString = a.toString);
	        },
	        clone: function () {
	          return this.init.prototype.extend(this);
	        },
	      }),
	      r = (g.WordArray = m.extend({
	        init: function (a, c) {
	          a = this.words = a || [];
	          this.sigBytes = c != s ? c : 4 * a.length;
	        },
	        toString: function (a) {
	          return (a || k).stringify(this);
	        },
	        concat: function (a) {
	          var c = this.words,
	            d = a.words,
	            b = this.sigBytes;
	          a = a.sigBytes;
	          this.clamp();
	          if (b % 4)
	            for (var e = 0; e < a; e++)
	              c[(b + e) >>> 2] |= ((d[e >>> 2] >>> (24 - 8 * (e % 4))) & 255) << (24 - 8 * ((b + e) % 4));
	          else if (65535 < d.length) for (e = 0; e < a; e += 4) c[(b + e) >>> 2] = d[e >>> 2];
	          else c.push.apply(c, d);
	          this.sigBytes += a;
	          return this;
	        },
	        clamp: function () {
	          var a = this.words,
	            c = this.sigBytes;
	          a[c >>> 2] &= 4294967295 << (32 - 8 * (c % 4));
	          a.length = h.ceil(c / 4);
	        },
	        clone: function () {
	          var a = m.clone.call(this);
	          a.words = this.words.slice(0);
	          return a;
	        },
	        random: function (a) {
	          for (var c = [], d = 0; d < a; d += 4) c.push((4294967296 * h.random()) | 0);
	          return new r.init(c, a);
	        },
	      })),
	      l = (f.enc = {}),
	      k = (l.Hex = {
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
	      }),
	      n = (l.Latin1 = {
	        stringify: function (a) {
	          var c = a.words;
	          a = a.sigBytes;
	          for (var d = [], b = 0; b < a; b++) d.push(String.fromCharCode((c[b >>> 2] >>> (24 - 8 * (b % 4))) & 255));
	          return d.join('');
	        },
	        parse: function (a) {
	          for (var c = a.length, d = [], b = 0; b < c; b++) d[b >>> 2] |= (a.charCodeAt(b) & 255) << (24 - 8 * (b % 4));
	          return new r.init(d, c);
	        },
	      }),
	      j = (l.Utf8 = {
	        stringify: function (a) {
	          try {
	            return decodeURIComponent(escape(n.stringify(a)));
	          } catch (c) {
	            throw Error('Malformed UTF-8 data');
	          }
	        },
	        parse: function (a) {
	          return n.parse(unescape(encodeURIComponent(a)));
	        },
	      }),
	      u = (g.BufferedBlockAlgorithm = m.extend({
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
	          var c = this._data,
	            d = c.words,
	            b = c.sigBytes,
	            e = this.blockSize,
	            f = b / (4 * e),
	            f = a ? h.ceil(f) : h.max((f | 0) - this._minBufferSize, 0);
	          a = f * e;
	          b = h.min(4 * a, b);
	          if (a) {
	            for (var g = 0; g < a; g += e) this._doProcessBlock(d, g);
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
	  for (
	    var s = CryptoJS,
	      f = s.lib,
	      g = f.WordArray,
	      q = f.Hasher,
	      f = s.algo,
	      m = [],
	      r = [],
	      l = function (a) {
	        return (4294967296 * (a - (a | 0))) | 0;
	      },
	      k = 2,
	      n = 0;
	    64 > n;

	  ) {
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
	  var a = [],
	    f = (f.SHA256 = q.extend({
	      _doReset: function () {
	        this._hash = new g.init(m.slice(0));
	      },
	      _doProcessBlock: function (c, d) {
	        for (
	          var b = this._hash.words,
	            e = b[0],
	            f = b[1],
	            g = b[2],
	            j = b[3],
	            h = b[4],
	            m = b[5],
	            n = b[6],
	            q = b[7],
	            p = 0;
	          64 > p;
	          p++
	        ) {
	          if (16 > p) a[p] = c[d + p] | 0;
	          else {
	            var k = a[p - 15],
	              l = a[p - 2];
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
	        var a = this._data,
	          d = a.words,
	          b = 8 * this._nDataBytes,
	          e = 8 * a.sigBytes;
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
	  var h = CryptoJS,
	    s = h.enc.Utf8;
	  h.algo.HMAC = h.lib.Base.extend({
	    init: function (f, g) {
	      f = this._hasher = new f.init();
	      'string' == typeof g && (g = s.parse(g));
	      var h = f.blockSize,
	        m = 4 * h;
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
	  var u = CryptoJS,
	    p = u.lib.WordArray;
	  u.enc.Base64 = {
	    stringify: function (d) {
	      var l = d.words,
	        p = d.sigBytes,
	        t = this._map;
	      d.clamp();
	      d = [];
	      for (var r = 0; r < p; r += 3)
	        for (
	          var w =
	              (((l[r >>> 2] >>> (24 - 8 * (r % 4))) & 255) << 16) |
	              (((l[(r + 1) >>> 2] >>> (24 - 8 * ((r + 1) % 4))) & 255) << 8) |
	              ((l[(r + 2) >>> 2] >>> (24 - 8 * ((r + 2) % 4))) & 255),
	            v = 0;
	          4 > v && r + 0.75 * v < p;
	          v++
	        )
	          d.push(t.charAt((w >>> (6 * (3 - v))) & 63));
	      if ((l = t.charAt(64))) for (; d.length % 4; ) d.push(l);
	      return d.join('');
	    },
	    parse: function (d) {
	      var l = d.length,
	        s = this._map,
	        t = s.charAt(64);
	      t && ((t = d.indexOf(t)), -1 != t && (l = t));
	      for (var t = [], r = 0, w = 0; w < l; w++)
	        if (w % 4) {
	          var v = s.indexOf(d.charAt(w - 1)) << (2 * (w % 4)),
	            b = s.indexOf(d.charAt(w)) >>> (6 - 2 * (w % 4));
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
	        var c = n + a,
	          e = q[c];
	        q[c] = (((e << 8) | (e >>> 24)) & 16711935) | (((e << 24) | (e >>> 8)) & 4278255360);
	      }
	      var a = this._hash.words,
	        c = q[n + 0],
	        e = q[n + 1],
	        j = q[n + 2],
	        k = q[n + 3],
	        z = q[n + 4],
	        r = q[n + 5],
	        t = q[n + 6],
	        w = q[n + 7],
	        v = q[n + 8],
	        A = q[n + 9],
	        B = q[n + 10],
	        C = q[n + 11],
	        u = q[n + 12],
	        D = q[n + 13],
	        E = q[n + 14],
	        x = q[n + 15],
	        f = a[0],
	        m = a[1],
	        g = a[2],
	        h = a[3],
	        f = p(f, m, g, h, c, 7, b[0]),
	        h = p(h, f, m, g, e, 12, b[1]),
	        g = p(g, h, f, m, j, 17, b[2]),
	        m = p(m, g, h, f, k, 22, b[3]),
	        f = p(f, m, g, h, z, 7, b[4]),
	        h = p(h, f, m, g, r, 12, b[5]),
	        g = p(g, h, f, m, t, 17, b[6]),
	        m = p(m, g, h, f, w, 22, b[7]),
	        f = p(f, m, g, h, v, 7, b[8]),
	        h = p(h, f, m, g, A, 12, b[9]),
	        g = p(g, h, f, m, B, 17, b[10]),
	        m = p(m, g, h, f, C, 22, b[11]),
	        f = p(f, m, g, h, u, 7, b[12]),
	        h = p(h, f, m, g, D, 12, b[13]),
	        g = p(g, h, f, m, E, 17, b[14]),
	        m = p(m, g, h, f, x, 22, b[15]),
	        f = d(f, m, g, h, e, 5, b[16]),
	        h = d(h, f, m, g, t, 9, b[17]),
	        g = d(g, h, f, m, C, 14, b[18]),
	        m = d(m, g, h, f, c, 20, b[19]),
	        f = d(f, m, g, h, r, 5, b[20]),
	        h = d(h, f, m, g, B, 9, b[21]),
	        g = d(g, h, f, m, x, 14, b[22]),
	        m = d(m, g, h, f, z, 20, b[23]),
	        f = d(f, m, g, h, A, 5, b[24]),
	        h = d(h, f, m, g, E, 9, b[25]),
	        g = d(g, h, f, m, k, 14, b[26]),
	        m = d(m, g, h, f, v, 20, b[27]),
	        f = d(f, m, g, h, D, 5, b[28]),
	        h = d(h, f, m, g, j, 9, b[29]),
	        g = d(g, h, f, m, w, 14, b[30]),
	        m = d(m, g, h, f, u, 20, b[31]),
	        f = l(f, m, g, h, r, 4, b[32]),
	        h = l(h, f, m, g, v, 11, b[33]),
	        g = l(g, h, f, m, C, 16, b[34]),
	        m = l(m, g, h, f, E, 23, b[35]),
	        f = l(f, m, g, h, e, 4, b[36]),
	        h = l(h, f, m, g, z, 11, b[37]),
	        g = l(g, h, f, m, w, 16, b[38]),
	        m = l(m, g, h, f, B, 23, b[39]),
	        f = l(f, m, g, h, D, 4, b[40]),
	        h = l(h, f, m, g, c, 11, b[41]),
	        g = l(g, h, f, m, k, 16, b[42]),
	        m = l(m, g, h, f, t, 23, b[43]),
	        f = l(f, m, g, h, A, 4, b[44]),
	        h = l(h, f, m, g, u, 11, b[45]),
	        g = l(g, h, f, m, x, 16, b[46]),
	        m = l(m, g, h, f, j, 23, b[47]),
	        f = s(f, m, g, h, c, 6, b[48]),
	        h = s(h, f, m, g, w, 10, b[49]),
	        g = s(g, h, f, m, E, 15, b[50]),
	        m = s(m, g, h, f, r, 21, b[51]),
	        f = s(f, m, g, h, u, 6, b[52]),
	        h = s(h, f, m, g, k, 10, b[53]),
	        g = s(g, h, f, m, B, 15, b[54]),
	        m = s(m, g, h, f, e, 21, b[55]),
	        f = s(f, m, g, h, v, 6, b[56]),
	        h = s(h, f, m, g, x, 10, b[57]),
	        g = s(g, h, f, m, t, 15, b[58]),
	        m = s(m, g, h, f, D, 21, b[59]),
	        f = s(f, m, g, h, z, 6, b[60]),
	        h = s(h, f, m, g, C, 10, b[61]),
	        g = s(g, h, f, m, j, 15, b[62]),
	        m = s(m, g, h, f, A, 21, b[63]);
	      a[0] = (a[0] + f) | 0;
	      a[1] = (a[1] + m) | 0;
	      a[2] = (a[2] + g) | 0;
	      a[3] = (a[3] + h) | 0;
	    },
	    _doFinalize: function () {
	      var b = this._data,
	        n = b.words,
	        a = 8 * this._nDataBytes,
	        c = 8 * b.sigBytes;
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
	  var u = CryptoJS,
	    p = u.lib,
	    d = p.Base,
	    l = p.WordArray,
	    p = u.algo,
	    s = (p.EvpKDF = d.extend({
	      cfg: d.extend({ keySize: 4, hasher: p.MD5, iterations: 1 }),
	      init: function (d) {
	        this.cfg = this.cfg.extend(d);
	      },
	      compute: function (d, r) {
	        for (
	          var p = this.cfg, s = p.hasher.create(), b = l.create(), u = b.words, q = p.keySize, p = p.iterations;
	          u.length < q;

	        ) {
	          n && s.update(n);
	          var n = s.update(d).finalize(r);
	          s.reset();
	          for (var a = 1; a < p; a++) (n = s.finalize(n)), s.reset();
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
	    var p = CryptoJS,
	      d = p.lib,
	      l = d.Base,
	      s = d.WordArray,
	      t = d.BufferedBlockAlgorithm,
	      r = p.enc.Base64,
	      w = p.algo.EvpKDF,
	      v = (d.Cipher = t.extend({
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
	    var b = (p.mode = {}),
	      x = function (e, a, b) {
	        var c = this._iv;
	        c ? (this._iv = u) : (c = this._prevBlock);
	        for (var d = 0; d < b; d++) e[a + d] ^= c[d];
	      },
	      q = (d.BlockCipherMode = l.extend({
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
	        var b = this._cipher,
	          c = b.blockSize;
	        x.call(this, e, a, c);
	        b.encryptBlock(e, a);
	        this._prevBlock = e.slice(a, a + c);
	      },
	    });
	    q.Decryptor = q.extend({
	      processBlock: function (e, a) {
	        var b = this._cipher,
	          c = b.blockSize,
	          d = e.slice(a, a + c);
	        b.decryptBlock(e, a);
	        x.call(this, e, a, c);
	        this._prevBlock = d;
	      },
	    });
	    b = b.CBC = q;
	    q = (p.pad = {}).Pkcs7 = {
	      pad: function (a, b) {
	        for (
	          var c = 4 * b, c = c - (a.sigBytes % c), d = (c << 24) | (c << 16) | (c << 8) | c, l = [], n = 0;
	          n < c;
	          n += 4
	        )
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
	        var a = this.cfg,
	          b = a.iv,
	          a = a.mode;
	        if (this._xformMode == this._ENC_XFORM_MODE) var c = a.createEncryptor;
	        else (c = a.createDecryptor), (this._minBufferSize = 1);
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
	        } else (b = this._process(!0)), a.unpad(b);
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
	      })),
	      b = ((p.format = {}).OpenSSL = {
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
	      }),
	      a = (d.SerializableCipher = l.extend({
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
	      })),
	      p = ((p.kdf = {}).OpenSSL = {
	        execute: function (a, b, c, d) {
	          d || (d = s.random(8));
	          a = w.create({ keySize: b + c }).compute(a, d);
	          c = s.create(a.words.slice(b), 4 * c);
	          a.sigBytes = 4 * b;
	          return n.create({ key: a, iv: c, salt: d });
	        },
	      }),
	      c = (d.PasswordBasedCipher = a.extend({
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
	  for (
	    var u = CryptoJS,
	      p = u.lib.BlockCipher,
	      d = u.algo,
	      l = [],
	      s = [],
	      t = [],
	      r = [],
	      w = [],
	      v = [],
	      b = [],
	      x = [],
	      q = [],
	      n = [],
	      a = [],
	      c = 0;
	    256 > c;
	    c++
	  )
	    a[c] = 128 > c ? c << 1 : (c << 1) ^ 283;
	  for (var e = 0, j = 0, c = 0; 256 > c; c++) {
	    var k = j ^ (j << 1) ^ (j << 2) ^ (j << 3) ^ (j << 4),
	      k = (k >>> 8) ^ (k & 255) ^ 99;
	    l[e] = k;
	    s[k] = e;
	    var z = a[e],
	      F = a[z],
	      G = a[F],
	      y = (257 * a[k]) ^ (16843008 * k);
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
	  var H = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
	    d = (d.AES = p.extend({
	      _doReset: function () {
	        for (
	          var a = this._key,
	            c = a.words,
	            d = a.sigBytes / 4,
	            a = 4 * ((this._nRounds = d + 6) + 1),
	            e = (this._keySchedule = []),
	            j = 0;
	          j < a;
	          j++
	        )
	          if (j < d) e[j] = c[j];
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
	        for (
	          var m = this._nRounds,
	            g = a[b] ^ c[0],
	            h = a[b + 1] ^ c[1],
	            k = a[b + 2] ^ c[2],
	            n = a[b + 3] ^ c[3],
	            p = 4,
	            r = 1;
	          r < m;
	          r++
	        )
	          var q = d[g >>> 24] ^ e[(h >>> 16) & 255] ^ j[(k >>> 8) & 255] ^ l[n & 255] ^ c[p++],
	            s = d[h >>> 24] ^ e[(k >>> 16) & 255] ^ j[(n >>> 8) & 255] ^ l[g & 255] ^ c[p++],
	            t = d[k >>> 24] ^ e[(n >>> 16) & 255] ^ j[(g >>> 8) & 255] ^ l[h & 255] ^ c[p++],
	            n = d[n >>> 24] ^ e[(g >>> 16) & 255] ^ j[(h >>> 8) & 255] ^ l[k & 255] ^ c[p++],
	            g = q,
	            h = s,
	            k = t;
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
	class AesCbcCryptor {
	    constructor({ cipherKey }) {
	        this.cipherKey = cipherKey;
	        this.CryptoJS = CryptoJS$1;
	        this.encryptedKey = this.CryptoJS.SHA256(cipherKey);
	    }
	    // --------------------------------------------------------
	    // --------------------- Encryption -----------------------
	    // --------------------------------------------------------
	    // region Encryption
	    encrypt(data) {
	        const stringData = typeof data === 'string' ? data : AesCbcCryptor.decoder.decode(data);
	        if (stringData.length === 0)
	            throw new Error('encryption error. empty content');
	        const abIv = this.getIv();
	        return {
	            metadata: abIv,
	            data: decode(this.CryptoJS.AES.encrypt(data, this.encryptedKey, {
	                iv: this.bufferToWordArray(abIv),
	                mode: this.CryptoJS.mode.CBC,
	            }).ciphertext.toString(this.CryptoJS.enc.Base64)),
	        };
	    }
	    encryptFileData(data) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const key = yield this.getKey();
	            const iv = this.getIv();
	            return {
	                data: yield crypto.subtle.encrypt({ name: this.algo, iv: iv }, key, data),
	                metadata: iv,
	            };
	        });
	    }
	    // endregion
	    // --------------------------------------------------------
	    // --------------------- Decryption -----------------------
	    // --------------------------------------------------------
	    // region Decryption
	    decrypt(encryptedData) {
	        if (typeof encryptedData.data === 'string')
	            throw new Error('Decryption error: data for decryption should be ArrayBuffed.');
	        const iv = this.bufferToWordArray(new Uint8ClampedArray(encryptedData.metadata));
	        const data = this.bufferToWordArray(new Uint8ClampedArray(encryptedData.data));
	        return AesCbcCryptor.encoder.encode(this.CryptoJS.AES.decrypt({ ciphertext: data }, this.encryptedKey, {
	            iv,
	            mode: this.CryptoJS.mode.CBC,
	        }).toString(this.CryptoJS.enc.Utf8)).buffer;
	    }
	    decryptFileData(encryptedData) {
	        return __awaiter(this, void 0, void 0, function* () {
	            if (typeof encryptedData.data === 'string')
	                throw new Error('Decryption error: data for decryption should be ArrayBuffed.');
	            const key = yield this.getKey();
	            return crypto.subtle.decrypt({ name: this.algo, iv: encryptedData.metadata }, key, encryptedData.data);
	        });
	    }
	    // endregion
	    // --------------------------------------------------------
	    // ----------------------- Helpers ------------------------
	    // --------------------------------------------------------
	    // region Helpers
	    get identifier() {
	        return 'ACRH';
	    }
	    /**
	     * Cryptor algorithm.
	     *
	     * @returns Cryptor module algorithm.
	     */
	    get algo() {
	        return 'AES-CBC';
	    }
	    /**
	     * Generate random initialization vector.
	     *
	     * @returns Random initialization vector.
	     */
	    getIv() {
	        return crypto.getRandomValues(new Uint8Array(AesCbcCryptor.BLOCK_SIZE));
	    }
	    /**
	     * Convert cipher key to the {@link Buffer}.
	     *
	     * @returns SHA256 encoded cipher key {@link Buffer}.
	     */
	    getKey() {
	        return __awaiter(this, void 0, void 0, function* () {
	            const bKey = AesCbcCryptor.encoder.encode(this.cipherKey);
	            const abHash = yield crypto.subtle.digest('SHA-256', bKey.buffer);
	            return crypto.subtle.importKey('raw', abHash, this.algo, true, ['encrypt', 'decrypt']);
	        });
	    }
	    /**
	     * Convert bytes array to words array.
	     *
	     * @param b - Bytes array (buffer) which should be converted.
	     *
	     * @returns Word sized array.
	     */
	    bufferToWordArray(b) {
	        const wa = [];
	        let i;
	        for (i = 0; i < b.length; i += 1) {
	            wa[(i / 4) | 0] |= b[i] << (24 - 8 * i);
	        }
	        return this.CryptoJS.lib.WordArray.create(wa, b.length);
	    }
	}
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

	/**
	 * Legacy cryptography module.
	 *
	 * @internal
	 */
	/**
	 * Convert bytes array to words array.
	 *
	 * @param b - Bytes array (buffer) which should be converted.
	 *
	 * @returns Word sized array.
	 *
	 * @internal
	 */
	/* eslint-disable  @typescript-eslint/no-explicit-any */
	function bufferToWordArray(b) {
	    const wa = [];
	    let i;
	    for (i = 0; i < b.length; i += 1) {
	        wa[(i / 4) | 0] |= b[i] << (24 - 8 * i);
	    }
	    // @ts-expect-error Bundled library without types.
	    return CryptoJS$1.lib.WordArray.create(wa, b.length);
	}
	/**
	 * Legacy cryptography module for files and signature.
	 *
	 * @internal
	 */
	class Crypto {
	    constructor(configuration) {
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
	    HMACSHA256(data) {
	        // @ts-expect-error Bundled library without types.
	        const hash = CryptoJS$1.HmacSHA256(data, this.configuration.secretKey);
	        // @ts-expect-error Bundled library without types.
	        return hash.toString(CryptoJS$1.enc.Base64);
	    }
	    /**
	     * Generate SHA256 hash from input data.
	     *
	     * @param data - Data from which hash should be generated.
	     *
	     * @returns SHA256 hash from provided `data`.
	     */
	    SHA256(data) {
	        // @ts-expect-error Bundled library without types.
	        return CryptoJS$1.SHA256(data).toString(CryptoJS$1.enc.Hex);
	    }
	    /**
	     * Encrypt provided data.
	     *
	     * @param data - Source data which should be encrypted.
	     * @param [customCipherKey] - Custom cipher key (different from defined on client level).
	     * @param [options] - Specific crypto configuration options.
	     *
	     * @returns Encrypted `data`.
	     */
	    encrypt(data, customCipherKey, options) {
	        if (this.configuration.customEncrypt)
	            return this.configuration.customEncrypt(data);
	        return this.pnEncrypt(data, customCipherKey, options);
	    }
	    /**
	     * Decrypt provided data.
	     *
	     * @param data - Encrypted data which should be decrypted.
	     * @param [customCipherKey] - Custom cipher key (different from defined on client level).
	     * @param [options] - Specific crypto configuration options.
	     *
	     * @returns Decrypted `data`.
	     */
	    decrypt(data, customCipherKey, options) {
	        if (this.configuration.customDecrypt)
	            return this.configuration.customDecrypt(data);
	        return this.pnDecrypt(data, customCipherKey, options);
	    }
	    /**
	     * Encrypt provided data.
	     *
	     * @param data - Source data which should be encrypted.
	     * @param [customCipherKey] - Custom cipher key (different from defined on client level).
	     * @param [options] - Specific crypto configuration options.
	     *
	     * @returns Encrypted `data` as string.
	     */
	    pnEncrypt(data, customCipherKey, options) {
	        const decidedCipherKey = customCipherKey !== null && customCipherKey !== void 0 ? customCipherKey : this.configuration.cipherKey;
	        if (!decidedCipherKey)
	            return data;
	        options = this.parseOptions(options);
	        const mode = this.getMode(options);
	        const cipherKey = this.getPaddedKey(decidedCipherKey, options);
	        if (this.configuration.useRandomIVs) {
	            const waIv = this.getRandomIV();
	            // @ts-expect-error Bundled library without types.
	            const waPayload = CryptoJS$1.AES.encrypt(data, cipherKey, { iv: waIv, mode }).ciphertext;
	            // @ts-expect-error Bundled library without types.
	            return waIv.clone().concat(waPayload.clone()).toString(CryptoJS$1.enc.Base64);
	        }
	        const iv = this.getIV(options);
	        // @ts-expect-error Bundled library without types.
	        const encryptedHexArray = CryptoJS$1.AES.encrypt(data, cipherKey, { iv, mode }).ciphertext;
	        // @ts-expect-error Bundled library without types.
	        const base64Encrypted = encryptedHexArray.toString(CryptoJS$1.enc.Base64);
	        return base64Encrypted || data;
	    }
	    /**
	     * Decrypt provided data.
	     *
	     * @param data - Encrypted data which should be decrypted.
	     * @param [customCipherKey] - Custom cipher key (different from defined on client level).
	     * @param [options] - Specific crypto configuration options.
	     *
	     * @returns Decrypted `data`.
	     */
	    pnDecrypt(data, customCipherKey, options) {
	        const decidedCipherKey = customCipherKey !== null && customCipherKey !== void 0 ? customCipherKey : this.configuration.cipherKey;
	        if (!decidedCipherKey)
	            return data;
	        options = this.parseOptions(options);
	        const mode = this.getMode(options);
	        const cipherKey = this.getPaddedKey(decidedCipherKey, options);
	        if (this.configuration.useRandomIVs) {
	            const ciphertext = new Uint8ClampedArray(decode(data));
	            const iv = bufferToWordArray(ciphertext.slice(0, 16));
	            const payload = bufferToWordArray(ciphertext.slice(16));
	            try {
	                // @ts-expect-error Bundled library without types.
	                const plainJSON = CryptoJS$1.AES.decrypt({ ciphertext: payload }, cipherKey, { iv, mode }).toString(
	                // @ts-expect-error Bundled library without types.
	                CryptoJS$1.enc.Utf8);
	                return JSON.parse(plainJSON);
	            }
	            catch (e) {
	                return null;
	            }
	        }
	        else {
	            const iv = this.getIV(options);
	            try {
	                // @ts-expect-error Bundled library without types.
	                const ciphertext = CryptoJS$1.enc.Base64.parse(data);
	                // @ts-expect-error Bundled library without types.
	                const plainJSON = CryptoJS$1.AES.decrypt({ ciphertext }, cipherKey, { iv, mode }).toString(CryptoJS$1.enc.Utf8);
	                return JSON.parse(plainJSON);
	            }
	            catch (e) {
	                return null;
	            }
	        }
	    }
	    /**
	     * Pre-process provided custom crypto configuration.
	     *
	     * @param incomingOptions - Configuration which should be pre-processed before use.
	     *
	     * @returns Normalized crypto configuration options.
	     */
	    parseOptions(incomingOptions) {
	        var _a, _b, _c, _d;
	        if (!incomingOptions)
	            return this.defaultOptions;
	        // Defaults
	        const options = {
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
	    }
	    /**
	     * Decode provided cipher key.
	     *
	     * @param key - Key in `encoding` provided by `options`.
	     * @param options - Crypto configuration options with cipher key details.
	     *
	     * @returns Array buffer with decoded key.
	     */
	    decodeKey(key, options) {
	        // @ts-expect-error Bundled library without types.
	        if (options.keyEncoding === 'base64')
	            return CryptoJS$1.enc.Base64.parse(key);
	        // @ts-expect-error Bundled library without types.
	        if (options.keyEncoding === 'hex')
	            return CryptoJS$1.enc.Hex.parse(key);
	        return key;
	    }
	    /**
	     * Add padding to the cipher key.
	     *
	     * @param key - Key which should be padded.
	     * @param options - Crypto configuration options with cipher key details.
	     *
	     * @returns Properly padded cipher key.
	     */
	    getPaddedKey(key, options) {
	        key = this.decodeKey(key, options);
	        // @ts-expect-error Bundled library without types.
	        if (options.encryptKey)
	            return CryptoJS$1.enc.Utf8.parse(this.SHA256(key).slice(0, 32));
	        return key;
	    }
	    /**
	     * Cipher mode.
	     *
	     * @param options - Crypto configuration with information about cipher mode.
	     *
	     * @returns Crypto cipher mode.
	     */
	    getMode(options) {
	        // @ts-expect-error Bundled library without types.
	        if (options.mode === 'ecb')
	            return CryptoJS$1.mode.ECB;
	        // @ts-expect-error Bundled library without types.
	        return CryptoJS$1.mode.CBC;
	    }
	    /**
	     * Cipher initialization vector.
	     *
	     * @param options - Crypto configuration with information about cipher mode.
	     *
	     * @returns Initialization vector.
	     */
	    getIV(options) {
	        // @ts-expect-error Bundled library without types.
	        return options.mode === 'cbc' ? CryptoJS$1.enc.Utf8.parse(this.iv) : null;
	    }
	    /**
	     * Random initialization vector.
	     *
	     * @returns Generated random initialization vector.
	     */
	    getRandomIV() {
	        // @ts-expect-error Bundled library without types.
	        return CryptoJS$1.lib.WordArray.random(16);
	    }
	}

	/**
	 * Legacy browser cryptography module.
	 *
	 * @internal
	 */
	/* global crypto */
	/**
	 * Legacy cryptography implementation for browser-based {@link PubNub} client.
	 *
	 * @internal
	 */
	class WebCryptography {
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
	    encrypt(key, input) {
	        return __awaiter(this, void 0, void 0, function* () {
	            if (!(input instanceof ArrayBuffer) && typeof input !== 'string')
	                throw new Error('Cannot encrypt this file. In browsers file encryption supports only string or ArrayBuffer');
	            const cKey = yield this.getKey(key);
	            return input instanceof ArrayBuffer ? this.encryptArrayBuffer(cKey, input) : this.encryptString(cKey, input);
	        });
	    }
	    /**
	     * Encrypt provided source {@link Buffer} using specific encryption {@link ArrayBuffer}.
	     *
	     * @param key - Data encryption key. <br/>**Note:** Same key should be used to `decrypt` {@link ArrayBuffer}.
	     * @param buffer - Source {@link ArrayBuffer} for encryption.
	     *
	     * @returns Encrypted data as {@link ArrayBuffer} object.
	     */
	    encryptArrayBuffer(key, buffer) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const abIv = crypto.getRandomValues(new Uint8Array(16));
	            return this.concatArrayBuffer(abIv.buffer, yield crypto.subtle.encrypt({ name: 'AES-CBC', iv: abIv }, key, buffer));
	        });
	    }
	    /**
	     * Encrypt provided source {@link string} using specific encryption {@link key}.
	     *
	     * @param key - Data encryption key. <br/>**Note:** Same key should be used to `decrypt` {@link string}.
	     * @param text - Source {@link string} for encryption.
	     *
	     * @returns Encrypted data as byte {@link string}.
	     */
	    encryptString(key, text) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const abIv = crypto.getRandomValues(new Uint8Array(16));
	            const abPlaintext = WebCryptography.encoder.encode(text).buffer;
	            const abPayload = yield crypto.subtle.encrypt({ name: 'AES-CBC', iv: abIv }, key, abPlaintext);
	            const ciphertext = this.concatArrayBuffer(abIv.buffer, abPayload);
	            return WebCryptography.decoder.decode(ciphertext);
	        });
	    }
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
	    encryptFile(key, file, File) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a, _b;
	            if (((_a = file.contentLength) !== null && _a !== void 0 ? _a : 0) <= 0)
	                throw new Error('encryption error. empty content');
	            const bKey = yield this.getKey(key);
	            const abPlaindata = yield file.toArrayBuffer();
	            const abCipherdata = yield this.encryptArrayBuffer(bKey, abPlaindata);
	            return File.create({
	                name: file.name,
	                mimeType: (_b = file.mimeType) !== null && _b !== void 0 ? _b : 'application/octet-stream',
	                data: abCipherdata,
	            });
	        });
	    }
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
	    decrypt(key, input) {
	        return __awaiter(this, void 0, void 0, function* () {
	            if (!(input instanceof ArrayBuffer) && typeof input !== 'string')
	                throw new Error('Cannot decrypt this file. In browsers file decryption supports only string or ArrayBuffer');
	            const cKey = yield this.getKey(key);
	            return input instanceof ArrayBuffer ? this.decryptArrayBuffer(cKey, input) : this.decryptString(cKey, input);
	        });
	    }
	    /**
	     * Decrypt provided encrypted {@link ArrayBuffer} using specific decryption {@link key}.
	     *
	     * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` {@link ArrayBuffer}.
	     * @param buffer - Encrypted {@link ArrayBuffer} for decryption.
	     *
	     * @returns Decrypted data as {@link ArrayBuffer} object.
	     */
	    decryptArrayBuffer(key, buffer) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const abIv = buffer.slice(0, 16);
	            if (buffer.slice(WebCryptography.IV_LENGTH).byteLength <= 0)
	                throw new Error('decryption error: empty content');
	            return yield crypto.subtle.decrypt({ name: 'AES-CBC', iv: abIv }, key, buffer.slice(WebCryptography.IV_LENGTH));
	        });
	    }
	    /**
	     * Decrypt provided encrypted {@link string} using specific decryption {@link key}.
	     *
	     * @param key - Data decryption key. <br/>**Note:** Should be the same as used to `encrypt` {@link string}.
	     * @param text - Encrypted {@link string} for decryption.
	     *
	     * @returns Decrypted data as byte {@link string}.
	     */
	    decryptString(key, text) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const abCiphertext = WebCryptography.encoder.encode(text).buffer;
	            const abIv = abCiphertext.slice(0, 16);
	            const abPayload = abCiphertext.slice(16);
	            const abPlaintext = yield crypto.subtle.decrypt({ name: 'AES-CBC', iv: abIv }, key, abPayload);
	            return WebCryptography.decoder.decode(abPlaintext);
	        });
	    }
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
	    decryptFile(key, file, File) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const bKey = yield this.getKey(key);
	            const abCipherdata = yield file.toArrayBuffer();
	            const abPlaindata = yield this.decryptArrayBuffer(bKey, abCipherdata);
	            return File.create({
	                name: file.name,
	                mimeType: file.mimeType,
	                data: abPlaindata,
	            });
	        });
	    }
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
	    getKey(key) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const digest = yield crypto.subtle.digest('SHA-256', WebCryptography.encoder.encode(key));
	            const hashHex = Array.from(new Uint8Array(digest))
	                .map((b) => b.toString(16).padStart(2, '0'))
	                .join('');
	            const abKey = WebCryptography.encoder.encode(hashHex.slice(0, 32)).buffer;
	            return crypto.subtle.importKey('raw', abKey, 'AES-CBC', true, ['encrypt', 'decrypt']);
	        });
	    }
	    /**
	     * Join two `ArrayBuffer`s.
	     *
	     * @param ab1 - `ArrayBuffer` to which other buffer should be appended.
	     * @param ab2 - `ArrayBuffer` which should appended to the other buffer.
	     *
	     * @returns Buffer which starts with `ab1` elements and appended `ab2`.
	     */
	    concatArrayBuffer(ab1, ab2) {
	        const tmp = new Uint8Array(ab1.byteLength + ab2.byteLength);
	        tmp.set(new Uint8Array(ab1), 0);
	        tmp.set(new Uint8Array(ab2), ab1.byteLength);
	        return tmp.buffer;
	    }
	}
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

	/**
	 * Legacy cryptor module.
	 */
	/**
	 * Legacy cryptor.
	 */
	class LegacyCryptor {
	    constructor(config) {
	        this.config = config;
	        this.cryptor = new Crypto(Object.assign({}, config));
	        this.fileCryptor = new WebCryptography();
	    }
	    // --------------------------------------------------------
	    // --------------------- Encryption -----------------------
	    // --------------------------------------------------------
	    // region Encryption
	    encrypt(data) {
	        const stringData = typeof data === 'string' ? data : LegacyCryptor.decoder.decode(data);
	        return {
	            data: this.cryptor.encrypt(stringData),
	            metadata: null,
	        };
	    }
	    encryptFile(file, File) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a;
	            if (!this.config.cipherKey)
	                throw new PubNubError('File encryption error: cipher key not set.');
	            return this.fileCryptor.encryptFile((_a = this.config) === null || _a === void 0 ? void 0 : _a.cipherKey, file, File);
	        });
	    }
	    // endregion
	    // --------------------------------------------------------
	    // --------------------- Decryption -----------------------
	    // --------------------------------------------------------
	    // region Decryption
	    decrypt(encryptedData) {
	        const data = typeof encryptedData.data === 'string' ? encryptedData.data : encode(encryptedData.data);
	        return this.cryptor.decrypt(data);
	    }
	    decryptFile(file, File) {
	        return __awaiter(this, void 0, void 0, function* () {
	            if (!this.config.cipherKey)
	                throw new PubNubError('File encryption error: cipher key not set.');
	            return this.fileCryptor.decryptFile(this.config.cipherKey, file, File);
	        });
	    }
	    // endregion
	    // --------------------------------------------------------
	    // ----------------------- Helpers ------------------------
	    // --------------------------------------------------------
	    // region Helpers
	    get identifier() {
	        return '';
	    }
	}
	/**
	 * `string` to {@link ArrayBuffer} response decoder.
	 */
	LegacyCryptor.encoder = new TextEncoder();
	/**
	 *  {@link ArrayBuffer} to {@link string} decoder.
	 */
	LegacyCryptor.decoder = new TextDecoder();

	/**
	 * Browser crypto module.
	 */
	/**
	 * CryptoModule for browser platform.
	 */
	class WebCryptoModule extends AbstractCryptoModule {
	    // --------------------------------------------------------
	    // --------------- Convenience functions ------------------
	    // -------------------------------------------------------
	    // region Convenience functions
	    static legacyCryptoModule(config) {
	        var _a;
	        if (!config.cipherKey)
	            throw new PubNubError('Crypto module error: cipher key not set.');
	        return new WebCryptoModule({
	            default: new LegacyCryptor(Object.assign(Object.assign({}, config), { useRandomIVs: (_a = config.useRandomIVs) !== null && _a !== void 0 ? _a : true })),
	            cryptors: [new AesCbcCryptor({ cipherKey: config.cipherKey })],
	        });
	    }
	    static aesCbcCryptoModule(config) {
	        var _a;
	        if (!config.cipherKey)
	            throw new PubNubError('Crypto module error: cipher key not set.');
	        return new WebCryptoModule({
	            default: new AesCbcCryptor({ cipherKey: config.cipherKey }),
	            cryptors: [
	                new LegacyCryptor(Object.assign(Object.assign({}, config), { useRandomIVs: (_a = config.useRandomIVs) !== null && _a !== void 0 ? _a : true })),
	            ],
	        });
	    }
	    /**
	     * Construct crypto module with `cryptor` as default for data encryption and decryption.
	     *
	     * @param defaultCryptor - Default cryptor for data encryption and decryption.
	     *
	     * @returns Crypto module with pre-configured default cryptor.
	     */
	    static withDefaultCryptor(defaultCryptor) {
	        return new this({ default: defaultCryptor });
	    }
	    // endregion
	    // --------------------------------------------------------
	    // --------------------- Encryption -----------------------
	    // --------------------------------------------------------
	    // region Encryption
	    encrypt(data) {
	        // Encrypt data.
	        const encrypted = data instanceof ArrayBuffer && this.defaultCryptor.identifier === WebCryptoModule.LEGACY_IDENTIFIER
	            ? this.defaultCryptor.encrypt(WebCryptoModule.decoder.decode(data))
	            : this.defaultCryptor.encrypt(data);
	        if (!encrypted.metadata)
	            return encrypted.data;
	        else if (typeof encrypted.data === 'string')
	            throw new Error('Encryption error: encrypted data should be ArrayBuffed.');
	        const headerData = this.getHeaderData(encrypted);
	        return this.concatArrayBuffer(headerData, encrypted.data);
	    }
	    encryptFile(file, File) {
	        return __awaiter(this, void 0, void 0, function* () {
	            /**
	             * Files handled differently in case of Legacy cryptor.
	             * (as long as we support legacy need to check on instance type)
	             */
	            if (this.defaultCryptor.identifier === CryptorHeader.LEGACY_IDENTIFIER)
	                return this.defaultCryptor.encryptFile(file, File);
	            const fileData = yield this.getFileData(file);
	            const encrypted = yield this.defaultCryptor.encryptFileData(fileData);
	            if (typeof encrypted.data === 'string')
	                throw new Error('Encryption error: encrypted data should be ArrayBuffed.');
	            return File.create({
	                name: file.name,
	                mimeType: 'application/octet-stream',
	                data: this.concatArrayBuffer(this.getHeaderData(encrypted), encrypted.data),
	            });
	        });
	    }
	    // endregion
	    // --------------------------------------------------------
	    // --------------------- Decryption -----------------------
	    // --------------------------------------------------------
	    // region Decryption
	    decrypt(data) {
	        const encryptedData = typeof data === 'string' ? decode(data) : data;
	        const header = CryptorHeader.tryParse(encryptedData);
	        const cryptor = this.getCryptor(header);
	        const metadata = header.length > 0
	            ? encryptedData.slice(header.length - header.metadataLength, header.length)
	            : null;
	        if (encryptedData.slice(header.length).byteLength <= 0)
	            throw new Error('Decryption error: empty content');
	        return cryptor.decrypt({
	            data: encryptedData.slice(header.length),
	            metadata: metadata,
	        });
	    }
	    decryptFile(file, File) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const data = yield file.data.arrayBuffer();
	            const header = CryptorHeader.tryParse(data);
	            const cryptor = this.getCryptor(header);
	            /**
	             * Files handled differently in case of Legacy cryptor.
	             * (as long as we support legacy need to check on instance type)
	             */
	            if ((cryptor === null || cryptor === void 0 ? void 0 : cryptor.identifier) === CryptorHeader.LEGACY_IDENTIFIER)
	                return cryptor.decryptFile(file, File);
	            const fileData = yield this.getFileData(data);
	            const metadata = fileData.slice(header.length - header.metadataLength, header.length);
	            return File.create({
	                name: file.name,
	                data: yield this.defaultCryptor.decryptFileData({
	                    data: data.slice(header.length),
	                    metadata: metadata,
	                }),
	            });
	        });
	    }
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
	    getCryptorFromId(id) {
	        const cryptor = this.getAllCryptors().find((cryptor) => id === cryptor.identifier);
	        if (cryptor)
	            return cryptor;
	        throw Error('Unknown cryptor error');
	    }
	    /**
	     * Retrieve cryptor by its identifier.
	     *
	     * @param header - Header with cryptor-defined data or raw cryptor identifier.
	     *
	     * @returns Cryptor which correspond to provided {@link header}.
	     */
	    getCryptor(header) {
	        if (typeof header === 'string') {
	            const cryptor = this.getAllCryptors().find((cryptor) => cryptor.identifier === header);
	            if (cryptor)
	                return cryptor;
	            throw new Error('Unknown cryptor error');
	        }
	        else if (header instanceof CryptorHeaderV1) {
	            return this.getCryptorFromId(header.identifier);
	        }
	    }
	    /**
	     * Create cryptor header data.
	     *
	     * @param encrypted - Encryption data object as source for header data.
	     *
	     * @returns Binary representation of the cryptor header data.
	     */
	    getHeaderData(encrypted) {
	        if (!encrypted.metadata)
	            return;
	        const header = CryptorHeader.from(this.defaultCryptor.identifier, encrypted.metadata);
	        const headerData = new Uint8Array(header.length);
	        let pos = 0;
	        headerData.set(header.data, pos);
	        pos += header.length - encrypted.metadata.byteLength;
	        headerData.set(new Uint8Array(encrypted.metadata), pos);
	        return headerData.buffer;
	    }
	    /**
	     * Merge two {@link ArrayBuffer} instances.
	     *
	     * @param ab1 - First {@link ArrayBuffer}.
	     * @param ab2 - Second {@link ArrayBuffer}.
	     *
	     * @returns Merged data as {@link ArrayBuffer}.
	     */
	    concatArrayBuffer(ab1, ab2) {
	        const tmp = new Uint8Array(ab1.byteLength + ab2.byteLength);
	        tmp.set(new Uint8Array(ab1), 0);
	        tmp.set(new Uint8Array(ab2), ab1.byteLength);
	        return tmp.buffer;
	    }
	    /**
	     * Retrieve file content.
	     *
	     * @param file - Content of the {@link PubNub} File object.
	     *
	     * @returns Normalized file {@link data} as {@link ArrayBuffer};
	     */
	    getFileData(file) {
	        return __awaiter(this, void 0, void 0, function* () {
	            if (file instanceof ArrayBuffer)
	                return file;
	            else if (file instanceof PubNubFile)
	                return file.toArrayBuffer();
	            throw new Error('Cannot decrypt/encrypt file. In browsers file encrypt/decrypt supported for string, ArrayBuffer or Blob');
	        });
	    }
	}
	/**
	 * {@link LegacyCryptor|Legacy} cryptor identifier.
	 */
	WebCryptoModule.LEGACY_IDENTIFIER = '';
	/**
	 * CryptorHeader Utility
	 */
	class CryptorHeader {
	    static from(id, metadata) {
	        if (id === CryptorHeader.LEGACY_IDENTIFIER)
	            return;
	        return new CryptorHeaderV1(id, metadata.byteLength);
	    }
	    static tryParse(data) {
	        const encryptedData = new Uint8Array(data);
	        let sentinel;
	        let version = null;
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
	        let identifier;
	        let pos = 5 + CryptorHeader.IDENTIFIER_LENGTH;
	        if (encryptedData.byteLength >= pos)
	            identifier = encryptedData.slice(5, pos);
	        else
	            throw new Error('Decryption error: invalid crypto identifier');
	        let metadataLength = null;
	        if (encryptedData.byteLength >= pos + 1)
	            metadataLength = encryptedData[pos];
	        else
	            throw new Error('Decryption error: invalid metadata length');
	        pos += 1;
	        if (metadataLength === 255 && encryptedData.byteLength >= pos + 2) {
	            metadataLength = new Uint16Array(encryptedData.slice(pos, pos + 2)).reduce((acc, val) => (acc << 8) + val, 0);
	        }
	        return new CryptorHeaderV1(this.decoder.decode(identifier), metadataLength);
	    }
	}
	CryptorHeader.SENTINEL = 'PNED';
	CryptorHeader.LEGACY_IDENTIFIER = '';
	CryptorHeader.IDENTIFIER_LENGTH = 4;
	CryptorHeader.VERSION = 1;
	CryptorHeader.MAX_VERSION = 1;
	CryptorHeader.decoder = new TextDecoder();
	// v1 CryptorHeader
	class CryptorHeaderV1 {
	    constructor(id, metadataLength) {
	        this._identifier = id;
	        this._metadataLength = metadataLength;
	    }
	    get identifier() {
	        return this._identifier;
	    }
	    set identifier(value) {
	        this._identifier = value;
	    }
	    get metadataLength() {
	        return this._metadataLength;
	    }
	    set metadataLength(value) {
	        this._metadataLength = value;
	    }
	    get version() {
	        return CryptorHeader.VERSION;
	    }
	    get length() {
	        return (CryptorHeader.SENTINEL.length +
	            1 +
	            CryptorHeader.IDENTIFIER_LENGTH +
	            (this.metadataLength < 255 ? 1 : 3) +
	            this.metadataLength);
	    }
	    get data() {
	        let pos = 0;
	        const header = new Uint8Array(this.length);
	        const encoder = new TextEncoder();
	        header.set(encoder.encode(CryptorHeader.SENTINEL));
	        pos += CryptorHeader.SENTINEL.length;
	        header[pos] = this.version;
	        pos++;
	        if (this.identifier)
	            header.set(encoder.encode(this.identifier), pos);
	        const metadataLength = this.metadataLength;
	        pos += CryptorHeader.IDENTIFIER_LENGTH;
	        if (metadataLength < 255)
	            header[pos] = metadataLength;
	        else
	            header.set([255, metadataLength >> 8, metadataLength & 0xff], pos);
	        return header;
	    }
	}
	CryptorHeaderV1.IDENTIFIER_LENGTH = 4;
	CryptorHeaderV1.SENTINEL = 'PNED';

	/**
	 * REST API endpoint use error module.
	 *
	 * @internal
	 */
	/**
	 * PubNub REST API call error.
	 *
	 * @internal
	 */
	class PubNubAPIError extends Error {
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
	    static create(errorOrResponse, data) {
	        if (errorOrResponse instanceof Error)
	            return PubNubAPIError.createFromError(errorOrResponse);
	        else
	            return PubNubAPIError.createFromServiceResponse(errorOrResponse, data);
	    }
	    /**
	     * Create API error instance from other error object.
	     *
	     * @param error - `Error` object provided by network provider (mostly) or other {@link PubNub} client components.
	     *
	     * @returns `PubNubAPIError` object with known error category and additional information (if
	     * available).
	     */
	    static createFromError(error) {
	        let category = StatusCategory$1.PNUnknownCategory;
	        let message = 'Unknown error';
	        let errorName = 'Error';
	        if (!error)
	            return new PubNubAPIError(message, category, 0);
	        else if (error instanceof PubNubAPIError)
	            return error;
	        if (error instanceof Error) {
	            message = error.message;
	            errorName = error.name;
	        }
	        if (errorName === 'AbortError' || message.indexOf('Aborted') !== -1) {
	            category = StatusCategory$1.PNCancelledCategory;
	            message = 'Request cancelled';
	        }
	        else if (message.indexOf('timeout') !== -1) {
	            category = StatusCategory$1.PNTimeoutCategory;
	            message = 'Request timeout';
	        }
	        else if (message.indexOf('network') !== -1) {
	            category = StatusCategory$1.PNNetworkIssuesCategory;
	            message = 'Network issues';
	        }
	        else if (errorName === 'TypeError') {
	            category = StatusCategory$1.PNBadRequestCategory;
	        }
	        else if (errorName === 'FetchError') {
	            const errorCode = error.code;
	            if (['ECONNREFUSED', 'ENETUNREACH', 'ENOTFOUND', 'ECONNRESET', 'EAI_AGAIN'].includes(errorCode))
	                category = StatusCategory$1.PNNetworkIssuesCategory;
	            if (errorCode === 'ECONNREFUSED')
	                message = 'Connection refused';
	            else if (errorCode === 'ENETUNREACH')
	                message = 'Network not reachable';
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
	                message = `Unknown system error: ${error}`;
	        }
	        else if (message === 'Request timeout')
	            category = StatusCategory$1.PNTimeoutCategory;
	        return new PubNubAPIError(message, category, 0, error);
	    }
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
	    static createFromServiceResponse(response, data) {
	        let category = StatusCategory$1.PNUnknownCategory;
	        let errorData;
	        let message = 'Unknown error';
	        let { status } = response;
	        data !== null && data !== void 0 ? data : (data = response.body);
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
	        // Try to get more information about error from service response.
	        if (data && data.byteLength > 0) {
	            const decoded = new TextDecoder().decode(data);
	            if (response.headers['content-type'].indexOf('text/javascript') !== -1 ||
	                response.headers['content-type'].indexOf('application/json') !== -1) {
	                try {
	                    const errorResponse = JSON.parse(decoded);
	                    if (typeof errorResponse === 'object' && !Array.isArray(errorResponse)) {
	                        if ('error' in errorResponse &&
	                            (errorResponse.error === 1 || errorResponse.error === true) &&
	                            'status' in errorResponse &&
	                            typeof errorResponse.status === 'number' &&
	                            'message' in errorResponse &&
	                            'service' in errorResponse) {
	                            errorData = errorResponse;
	                            status = errorResponse.status;
	                        }
	                        else
	                            errorData = errorResponse;
	                        if ('error' in errorResponse && errorResponse.error instanceof Error)
	                            errorData = errorResponse.error;
	                    }
	                }
	                catch (_) {
	                    errorData = decoded;
	                }
	            }
	            else if (response.headers['content-type'].indexOf('xml') !== -1) {
	                const reason = /<Message>(.*)<\/Message>/gi.exec(decoded);
	                message = reason ? `Upload to bucket failed: ${reason[1]}` : 'Upload to bucket failed.';
	            }
	            else {
	                errorData = decoded;
	            }
	        }
	        return new PubNubAPIError(message, category, status, errorData);
	    }
	    /**
	     * Construct PubNub endpoint error.
	     *
	     * @param message - Short API call error description.
	     * @param category - Error category.
	     * @param statusCode - Response HTTP status code.
	     * @param errorData - Error information.
	     */
	    constructor(message, category, statusCode, errorData) {
	        super(message);
	        this.category = category;
	        this.statusCode = statusCode;
	        this.errorData = errorData;
	        this.name = 'PubNubAPIError';
	    }
	    /**
	     * Convert API error object to API callback status object.
	     *
	     * @param operation - Request operation during which error happened.
	     *
	     * @returns Pre-formatted API callback status object.
	     */
	    toStatus(operation) {
	        return {
	            error: true,
	            category: this.category,
	            operation,
	            statusCode: this.statusCode,
	            errorData: this.errorData,
	        };
	    }
	    /**
	     * Convert API error object to PubNub client error object.
	     *
	     * @param operation - Request operation during which error happened.
	     * @param message - Custom error message.
	     *
	     * @returns Client-facing pre-formatted endpoint call error.
	     */
	    toPubNubError(operation, message) {
	        return new PubNubError(message !== null && message !== void 0 ? message : this.message, this.toStatus(operation));
	    }
	}

	/**
	 * Subscription Worker transport middleware module.
	 *
	 * Middleware optimize subscription feature requests utilizing `Subscription Worker` if available and not disabled
	 * by user.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Subscription Worker transport middleware.
	 */
	class SubscriptionWorkerMiddleware {
	    constructor(configuration) {
	        this.configuration = configuration;
	        /**
	         * Whether subscription worker has been initialized and ready to handle events.
	         */
	        this.subscriptionWorkerReady = false;
	        this.workerEventsQueue = [];
	        this.callbacks = new Map();
	        this.setupSubscriptionWorker();
	    }
	    makeSendable(req) {
	        // Use default request flow for non-subscribe / presence leave requests.
	        if (!req.path.startsWith('/v2/subscribe') && !req.path.endsWith('/leave'))
	            return this.configuration.transport.makeSendable(req);
	        let controller;
	        const sendRequestEvent = {
	            type: 'send-request',
	            clientIdentifier: this.configuration.clientIdentifier,
	            subscriptionKey: this.configuration.subscriptionKey,
	            logVerbosity: this.configuration.logVerbosity,
	            request: req,
	        };
	        if (req.cancellable) {
	            controller = {
	                abort: () => {
	                    const cancelRequest = {
	                        type: 'cancel-request',
	                        clientIdentifier: this.configuration.clientIdentifier,
	                        subscriptionKey: this.configuration.subscriptionKey,
	                        logVerbosity: this.configuration.logVerbosity,
	                        identifier: req.identifier,
	                    };
	                    // Cancel active request with specified identifier.
	                    this.scheduleEventPost(cancelRequest);
	                },
	            };
	        }
	        return [
	            new Promise((resolve, reject) => {
	                // Associate Promise resolution / reject with request identifier for future usage in
	                // `onmessage` handler block to return results.
	                this.callbacks.set(req.identifier, { resolve, reject });
	                // Trigger request processing by Service Worker.
	                this.scheduleEventPost(sendRequestEvent);
	            }),
	            controller,
	        ];
	    }
	    request(req) {
	        return req;
	    }
	    /**
	     * Schedule {@link event} publish to the subscription worker.
	     *
	     * Subscription worker may not be ready for events processing and this method build queue for the time when worker
	     * will be ready.
	     *
	     * @param event - Event payload for the subscription worker.
	     * @param outOfOrder - Whether event should be processed first then enqueued queue.
	     */
	    scheduleEventPost(event, outOfOrder = false) {
	        // Trigger request processing by subscription worker.
	        const subscriptionWorker = this.sharedSubscriptionWorker;
	        if (subscriptionWorker)
	            subscriptionWorker.port.postMessage(event);
	        else {
	            if (outOfOrder)
	                this.workerEventsQueue.splice(0, 0, event);
	            else
	                this.workerEventsQueue.push(event);
	        }
	    }
	    /**
	     * Dequeue and post events from the queue to the subscription worker.
	     */
	    flushScheduledEvents() {
	        // Trigger request processing by subscription worker.
	        const subscriptionWorker = this.sharedSubscriptionWorker;
	        if (!subscriptionWorker || this.workerEventsQueue.length === 0)
	            return;
	        // Clean up from cancelled events.
	        const outdatedEvents = [];
	        for (let i = 0; i < this.workerEventsQueue.length; i++) {
	            const event = this.workerEventsQueue[i];
	            // Check whether found request cancel event to search for request send event it cancels.
	            if (event.type !== 'cancel-request' || i === 0)
	                continue;
	            for (let j = 0; j < i; j++) {
	                const otherEvent = this.workerEventsQueue[j];
	                if (otherEvent.type !== 'send-request')
	                    continue;
	                // Collect outdated events if identifiers match.
	                if (otherEvent.request.identifier === event.identifier) {
	                    outdatedEvents.push(event, otherEvent);
	                    break;
	                }
	            }
	        }
	        // Actualizing events queue.
	        this.workerEventsQueue = this.workerEventsQueue.filter((event) => !outdatedEvents.includes(event));
	        this.workerEventsQueue.forEach((event) => subscriptionWorker.port.postMessage(event));
	        this.workerEventsQueue = [];
	    }
	    /**
	     * Subscription worker.
	     *
	     * @returns Worker which has been registered by the PubNub SDK.
	     */
	    get sharedSubscriptionWorker() {
	        return this.subscriptionWorkerReady ? this.subscriptionWorker : null;
	    }
	    setupSubscriptionWorker() {
	        if (typeof SharedWorker === 'undefined')
	            return;
	        this.subscriptionWorker = new SharedWorker(this.configuration.workerUrl, `/pubnub-${this.configuration.sdkVersion}`);
	        this.subscriptionWorker.port.start();
	        // Register PubNub client within subscription worker.
	        this.scheduleEventPost({
	            type: 'client-register',
	            clientIdentifier: this.configuration.clientIdentifier,
	            subscriptionKey: this.configuration.subscriptionKey,
	            userId: this.configuration.userId,
	            logVerbosity: this.configuration.logVerbosity,
	            workerLogVerbosity: this.configuration.workerLogVerbosity,
	        }, true);
	        this.subscriptionWorker.port.onmessage = (event) => this.handleWorkerEvent(event);
	    }
	    handleWorkerEvent(event) {
	        const { data } = event;
	        // Ignoring updates not related to this instance.
	        if (data.type !== 'shared-worker-ping' &&
	            data.type !== 'shared-worker-connected' &&
	            data.type !== 'shared-worker-console-log' &&
	            data.type !== 'shared-worker-console-dir' &&
	            data.clientIdentifier !== this.configuration.clientIdentifier)
	            return;
	        if (data.type === 'shared-worker-connected') {
	            this.subscriptionWorkerReady = true;
	            this.flushScheduledEvents();
	        }
	        else if (data.type === 'shared-worker-console-log') {
	            console.log(`[SharedWorker] ${data.message}`);
	        }
	        else if (data.type === 'shared-worker-console-dir') {
	            if (data.message)
	                console.log(`[SharedWorker] ${data.message}`);
	            console.dir(data.data);
	        }
	        else if (data.type === 'shared-worker-ping') {
	            const { logVerbosity, subscriptionKey, clientIdentifier } = this.configuration;
	            this.scheduleEventPost({
	                type: 'client-pong',
	                subscriptionKey,
	                clientIdentifier,
	                logVerbosity,
	            });
	        }
	        else if (data.type === 'request-progress-start' || data.type === 'request-progress-end') {
	            this.logRequestProgress(data);
	        }
	        else if (data.type === 'request-process-success' || data.type === 'request-process-error') {
	            const { resolve, reject } = this.callbacks.get(data.identifier);
	            if (data.type === 'request-process-success') {
	                resolve({
	                    status: data.response.status,
	                    url: data.url,
	                    headers: data.response.headers,
	                    body: data.response.body,
	                });
	            }
	            else {
	                let category = StatusCategory$1.PNUnknownCategory;
	                let message = 'Unknown error';
	                // Handle client-side issues (if any).
	                if (data.error) {
	                    if (data.error.type === 'NETWORK_ISSUE')
	                        category = StatusCategory$1.PNNetworkIssuesCategory;
	                    else if (data.error.type === 'TIMEOUT')
	                        category = StatusCategory$1.PNTimeoutCategory;
	                    else if (data.error.type === 'ABORTED')
	                        category = StatusCategory$1.PNCancelledCategory;
	                    message = `${data.error.message} (${data.identifier})`;
	                }
	                // Handle service error response.
	                else if (data.response) {
	                    return reject(PubNubAPIError.create({
	                        url: data.url,
	                        headers: data.response.headers,
	                        body: data.response.body,
	                        status: data.response.status,
	                    }, data.response.body));
	                }
	                reject(new PubNubAPIError(message, category, 0, new Error(message)));
	            }
	        }
	    }
	    /**
	     * Print request progress information.
	     *
	     * @param information - Request progress information from worker.
	     */
	    logRequestProgress(information) {
	        var _a, _b;
	        if (information.type === 'request-progress-start') {
	            console.log('<<<<<');
	            console.log(`[${information.timestamp}] ${information.url}\n${JSON.stringify((_a = information.query) !== null && _a !== void 0 ? _a : {})}`);
	            console.log('-----');
	        }
	        else {
	            console.log('>>>>>>');
	            console.log(`[${information.timestamp} / ${information.duration}] ${information.url}\n${JSON.stringify((_b = information.query) !== null && _b !== void 0 ? _b : {})}\n${information.response}`);
	            console.log('-----');
	        }
	    }
	}

	/**
	 * PubNub package utilities module.
	 *
	 * @internal
	 */
	/**
	 * Percent-encode input string.
	 *
	 * **Note:** Encode content in accordance of the `PubNub` service requirements.
	 *
	 * @param input - Source string or number for encoding.
	 *
	 * @returns Percent-encoded string.
	 *
	 * @internal
	 */
	const encodeString = (input) => {
	    return encodeURIComponent(input).replace(/[!~*'()]/g, (x) => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
	};
	/**
	 * Percent-encode list of names (channels).
	 *
	 * @param names - List of names which should be encoded.
	 *
	 * @param [defaultString] - String which should be used in case if {@link names} is empty.
	 *
	 * @returns String which contains encoded names joined by non-encoded `,`.
	 *
	 * @internal
	 */
	const encodeNames = (names, defaultString) => {
	    const encodedNames = names.map((name) => encodeString(name));
	    return encodedNames.length ? encodedNames.join(',') : (defaultString !== null && defaultString !== void 0 ? defaultString : '');
	};
	/**
	 * @internal
	 */
	const removeSingleOccurrence = (source, elementsToRemove) => {
	    const removed = Object.fromEntries(elementsToRemove.map((prop) => [prop, false]));
	    return source.filter((e) => {
	        if (elementsToRemove.includes(e) && !removed[e]) {
	            removed[e] = true;
	            return false;
	        }
	        return true;
	    });
	};
	/**
	 * @internal
	 */
	const findUniqueCommonElements = (a, b) => {
	    return [...a].filter((value) => b.includes(value) && a.indexOf(value) === a.lastIndexOf(value) && b.indexOf(value) === b.lastIndexOf(value));
	};
	/**
	 * Transform query key / value pairs to the string.
	 *
	 * @param query - Key / value pairs of the request query parameters.
	 *
	 * @returns Stringified query key / value pairs.
	 *
	 * @internal
	 */
	const queryStringFromObject = (query) => {
	    return Object.keys(query)
	        .map((key) => {
	        const queryValue = query[key];
	        if (!Array.isArray(queryValue))
	            return `${key}=${encodeString(queryValue)}`;
	        return queryValue.map((value) => `${key}=${encodeString(value)}`).join('&');
	    })
	        .join('&');
	};

	/**
	 * Common browser and React Native Transport provider module.
	 *
	 * @internal
	 */
	/**
	 * Class representing a `fetch`-based browser and React Native transport provider.
	 *
	 * @internal
	 */
	class WebReactNativeTransport {
	    /**
	     * Create and configure transport provider for Web and Rect environments.
	     *
	     * @param [keepAlive] - Whether client should try to keep connections open for reuse or not.
	     * @param logVerbosity - Whether verbose logs should be printed or not.
	     *
	     * @internal
	     */
	    constructor(keepAlive = false, logVerbosity) {
	        this.keepAlive = keepAlive;
	        this.logVerbosity = logVerbosity;
	    }
	    makeSendable(req) {
	        let controller;
	        let abortController;
	        if (req.cancellable) {
	            abortController = new AbortController();
	            controller = {
	                // Storing controller inside to prolong object lifetime.
	                abortController,
	                abort: () => abortController === null || abortController === void 0 ? void 0 : abortController.abort(),
	            };
	        }
	        return [
	            this.requestFromTransportRequest(req).then((request) => {
	                const start = new Date().getTime();
	                this.logRequestProcessProgress(request);
	                /**
	                 * Setup request timeout promise.
	                 *
	                 * **Note:** Native Fetch API doesn't support `timeout` out-of-box.
	                 */
	                const requestTimeout = new Promise((_, reject) => {
	                    const timeoutId = setTimeout(() => {
	                        // Clean up.
	                        clearTimeout(timeoutId);
	                        reject(new Error('Request timeout'));
	                    }, req.timeout * 1000);
	                });
	                return Promise.race([
	                    fetch(request, { signal: abortController === null || abortController === void 0 ? void 0 : abortController.signal, credentials: 'omit', cache: 'no-cache' }),
	                    requestTimeout,
	                ])
	                    .then((response) => response.arrayBuffer().then((arrayBuffer) => [response, arrayBuffer]))
	                    .then((response) => {
	                    const responseBody = response[1].byteLength > 0 ? response[1] : undefined;
	                    const { status, headers: requestHeaders } = response[0];
	                    const headers = {};
	                    // Copy Headers object content into plain Record.
	                    requestHeaders.forEach((value, key) => (headers[key] = value.toLowerCase()));
	                    const transportResponse = {
	                        status,
	                        url: request.url,
	                        headers,
	                        body: responseBody,
	                    };
	                    if (status >= 400)
	                        throw PubNubAPIError.create(transportResponse);
	                    this.logRequestProcessProgress(request, new Date().getTime() - start, responseBody);
	                    return transportResponse;
	                })
	                    .catch((error) => {
	                    throw PubNubAPIError.create(error);
	                });
	            }),
	            controller,
	        ];
	    }
	    request(req) {
	        return req;
	    }
	    /**
	     * Creates a Request object from a given {@link TransportRequest} object.
	     *
	     * @param req - The {@link TransportRequest} object containing request information.
	     *
	     * @returns Request object generated from the {@link TransportRequest} object.
	     *
	     * @internal
	     */
	    requestFromTransportRequest(req) {
	        return __awaiter(this, void 0, void 0, function* () {
	            let body;
	            let path = req.path;
	            // Create multipart request body.
	            if (req.formData && req.formData.length > 0) {
	                // Reset query parameters to conform to signed URL
	                req.queryParameters = {};
	                const file = req.body;
	                const formData = new FormData();
	                for (const { key, value } of req.formData)
	                    formData.append(key, value);
	                try {
	                    const fileData = yield file.toArrayBuffer();
	                    formData.append('file', new Blob([fileData], { type: 'application/octet-stream' }), file.name);
	                }
	                catch (_) {
	                    try {
	                        const fileData = yield file.toFileUri();
	                        // @ts-expect-error React Native File Uri support.
	                        formData.append('file', fileData, file.name);
	                    }
	                    catch (_) { }
	                }
	                body = formData;
	            }
	            // Handle regular body payload (if passed).
	            else if (req.body && (typeof req.body === 'string' || req.body instanceof ArrayBuffer))
	                body = req.body;
	            if (req.queryParameters && Object.keys(req.queryParameters).length !== 0)
	                path = `${path}?${queryStringFromObject(req.queryParameters)}`;
	            return new Request(`${req.origin}${path}`, {
	                method: req.method,
	                headers: req.headers,
	                redirect: 'follow',
	                body,
	            });
	        });
	    }
	    /**
	     * Log out request processing progress and result.
	     *
	     * @param request - Platform-specific
	     * @param [elapsed] - How many seconds passed since request processing started.
	     * @param [body] - Service response (if available).
	     *
	     * @internal
	     */
	    logRequestProcessProgress(request, elapsed, body) {
	        if (!this.logVerbosity)
	            return;
	        const { protocol, host, pathname, search } = new URL(request.url);
	        const timestamp = new Date().toISOString();
	        if (!elapsed) {
	            console.log('<<<<<');
	            console.log(`[${timestamp}]`, `\n${protocol}//${host}${pathname}`, `\n${search}`);
	            console.log('-----');
	        }
	        else {
	            const stringifiedBody = body ? WebReactNativeTransport.decoder.decode(body) : undefined;
	            console.log('>>>>>>');
	            console.log(`[${timestamp} / ${elapsed}]`, `\n${protocol}//${host}${pathname}`, `\n${search}`, `\n${stringifiedBody}`);
	            console.log('-----');
	        }
	    }
	}
	/**
	 * Service {@link ArrayBuffer} response decoder.
	 *
	 * @internal
	 */
	WebReactNativeTransport.decoder = new TextDecoder();

	/**
	 * CBOR support module.
	 *
	 * @internal
	 */
	/**
	 * Re-map CBOR object keys from potentially C buffer strings to actual strings.
	 *
	 * @param obj CBOR which should be remapped to stringified keys.
	 *
	 * @returns Dictionary with stringified keys.
	 *
	 * @internal
	 */
	function stringifyBufferKeys(obj) {
	    const isObject = (value) => typeof value === 'object' && value !== null && value.constructor === Object;
	    const isString = (value) => typeof value === 'string' || value instanceof String;
	    const isNumber = (value) => typeof value === 'number' && isFinite(value);
	    if (!isObject(obj))
	        return obj;
	    const normalizedObject = {};
	    Object.keys(obj).forEach((key) => {
	        const keyIsString = isString(key);
	        let stringifiedKey = key;
	        const value = obj[key];
	        if (keyIsString && key.indexOf(',') >= 0) {
	            const bytes = key.split(',').map(Number);
	            stringifiedKey = bytes.reduce((string, byte) => {
	                return string + String.fromCharCode(byte);
	            }, '');
	        }
	        else if (isNumber(key) || (keyIsString && !isNaN(Number(key)))) {
	            stringifiedKey = String.fromCharCode(isNumber(key) ? key : parseInt(key, 10));
	        }
	        normalizedObject[stringifiedKey] = isObject(value) ? stringifyBufferKeys(value) : value;
	    });
	    return normalizedObject;
	}

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
	const USE_SSL = true;
	/**
	 * Whether PubNub client should catch up subscription after network issues.
	 */
	const RESTORE = false;
	/**
	 * Whether network availability change should be announced with `PNNetworkDownCategory` and
	 * `PNNetworkUpCategory` state or not.
	 */
	const AUTO_NETWORK_DETECTION = false;
	/**
	 * Whether messages should be de-duplicated before announcement or not.
	 */
	const DEDUPE_ON_SUBSCRIBE = false;
	/**
	 * Maximum cache which should be used for message de-duplication functionality.
	 */
	const DEDUPE_CACHE_SIZE = 100;
	/**
	 * Maximum number of file message publish retries.
	 */
	const FILE_PUBLISH_RETRY_LIMIT = 5;
	/**
	 * Whether subscription event engine should be used or not.
	 */
	const ENABLE_EVENT_ENGINE = false;
	/**
	 * Whether configured user presence state should be maintained by the PubNub client or not.
	 */
	const MAINTAIN_PRESENCE_STATE = true;
	/**
	 * Whether PubNub client should try to utilize existing TCP connection for new requests or not.
	 */
	const KEEP_ALIVE$1 = false;
	/**
	 * Whether verbose logging should be enabled or not.
	 */
	const USE_VERBOSE_LOGGING = false;
	/**
	 * Whether leave events should be suppressed or not.
	 */
	const SUPPRESS_LEAVE_EVENTS = false;
	/**
	 * Whether heartbeat request failure should be announced or not.
	 */
	const ANNOUNCE_HEARTBEAT_FAILURE = true;
	/**
	 * Whether heartbeat request success should be announced or not.
	 */
	const ANNOUNCE_HEARTBEAT_SUCCESS = false;
	/**
	 * Whether PubNub client instance id should be added to the requests or not.
	 */
	const USE_INSTANCE_ID = false;
	/**
	 * Whether unique identifier should be added to the request or not.
	 */
	const USE_REQUEST_ID = true;
	/**
	 * Transactional requests timeout.
	 */
	const TRANSACTIONAL_REQUEST_TIMEOUT = 15;
	/**
	 * Subscription request timeout.
	 */
	const SUBSCRIBE_REQUEST_TIMEOUT = 310;
	/**
	 * Default user presence timeout.
	 */
	const PRESENCE_TIMEOUT = 300;
	/**
	 * Minimum user presence timeout.
	 */
	const PRESENCE_TIMEOUT_MINIMUM = 20;
	/**
	 * Apply configuration default values.
	 *
	 * @param configuration - User-provided configuration.
	 *
	 * @internal
	 */
	const setDefaults$1 = (configuration) => {
	    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
	    // Copy configuration.
	    const configurationCopy = Object.assign({}, configuration);
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
	    if (configurationCopy.userId && configurationCopy.uuid)
	        throw new PubNubError("PubNub client configuration error: use only 'userId'");
	    (_o = configurationCopy.userId) !== null && _o !== void 0 ? _o : (configurationCopy.userId = configurationCopy.uuid);
	    if (!configurationCopy.userId)
	        throw new PubNubError("PubNub client configuration error: 'userId' not set");
	    else if (((_p = configurationCopy.userId) === null || _p === void 0 ? void 0 : _p.trim().length) === 0)
	        throw new PubNubError("PubNub client configuration error: 'userId' is empty");
	    // Generate default origin subdomains.
	    if (!configurationCopy.origin)
	        configurationCopy.origin = Array.from({ length: 20 }, (_, i) => `ps${i + 1}.pndsn.com`);
	    const keySet = {
	        subscribeKey: configurationCopy.subscribeKey,
	        publishKey: configurationCopy.publishKey,
	        secretKey: configurationCopy.secretKey,
	    };
	    if (configurationCopy.presenceTimeout !== undefined && configurationCopy.presenceTimeout < PRESENCE_TIMEOUT_MINIMUM) {
	        configurationCopy.presenceTimeout = PRESENCE_TIMEOUT_MINIMUM;
	        // eslint-disable-next-line no-console
	        console.log('WARNING: Presence timeout is less than the minimum. Using minimum value: ', PRESENCE_TIMEOUT_MINIMUM);
	    }
	    if (configurationCopy.presenceTimeout !== undefined)
	        configurationCopy.heartbeatInterval = configurationCopy.presenceTimeout / 2 - 1;
	    else
	        configurationCopy.presenceTimeout = PRESENCE_TIMEOUT;
	    // Apply extended configuration defaults.
	    let announceSuccessfulHeartbeats = ANNOUNCE_HEARTBEAT_SUCCESS;
	    let announceFailedHeartbeats = ANNOUNCE_HEARTBEAT_FAILURE;
	    let fileUploadPublishRetryLimit = FILE_PUBLISH_RETRY_LIMIT;
	    let dedupeOnSubscribe = DEDUPE_ON_SUBSCRIBE;
	    let maximumCacheSize = DEDUPE_CACHE_SIZE;
	    let useRequestId = USE_REQUEST_ID;
	    // @ts-expect-error Not documented legacy configuration options.
	    if (configurationCopy.dedupeOnSubscribe !== undefined && typeof configurationCopy.dedupeOnSubscribe === 'boolean') {
	        // @ts-expect-error Not documented legacy configuration options.
	        dedupeOnSubscribe = configurationCopy.dedupeOnSubscribe;
	    }
	    // @ts-expect-error Not documented legacy configuration options.
	    if (configurationCopy.maximumCacheSize !== undefined && typeof configurationCopy.maximumCacheSize === 'number') {
	        // @ts-expect-error Not documented legacy configuration options.
	        maximumCacheSize = configurationCopy.maximumCacheSize;
	    }
	    // @ts-expect-error Not documented legacy configuration options.
	    if (configurationCopy.useRequestId !== undefined && typeof configurationCopy.useRequestId === 'boolean') {
	        // @ts-expect-error Not documented legacy configuration options.
	        useRequestId = configurationCopy.useRequestId;
	    }
	    if (
	    // @ts-expect-error Not documented legacy configuration options.
	    configurationCopy.announceSuccessfulHeartbeats !== undefined &&
	        // @ts-expect-error Not documented legacy configuration options.
	        typeof configurationCopy.announceSuccessfulHeartbeats === 'boolean') {
	        // @ts-expect-error Not documented legacy configuration options.
	        announceSuccessfulHeartbeats = configurationCopy.announceSuccessfulHeartbeats;
	    }
	    if (
	    // @ts-expect-error Not documented legacy configuration options.
	    configurationCopy.announceFailedHeartbeats !== undefined &&
	        // @ts-expect-error Not documented legacy configuration options.
	        typeof configurationCopy.announceFailedHeartbeats === 'boolean') {
	        // @ts-expect-error Not documented legacy configuration options.
	        announceFailedHeartbeats = configurationCopy.announceFailedHeartbeats;
	    }
	    if (
	    // @ts-expect-error Not documented legacy configuration options.
	    configurationCopy.fileUploadPublishRetryLimit !== undefined &&
	        // @ts-expect-error Not documented legacy configuration options.
	        typeof configurationCopy.fileUploadPublishRetryLimit === 'number') {
	        // @ts-expect-error Not documented legacy configuration options.
	        fileUploadPublishRetryLimit = configurationCopy.fileUploadPublishRetryLimit;
	    }
	    return Object.assign(Object.assign({}, configurationCopy), { keySet,
	        dedupeOnSubscribe,
	        maximumCacheSize,
	        useRequestId,
	        announceSuccessfulHeartbeats,
	        announceFailedHeartbeats,
	        fileUploadPublishRetryLimit });
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
	const LISTEN_TO_BROWSER_NETWORK_EVENTS = true;
	/**
	 * Whether verbose logging should be enabled for `Subscription` worker to print debug messages or not.
	 */
	const SUBSCRIPTION_WORKER_LOG_VERBOSITY = false;
	/**
	 * Whether PubNub client should try to utilize existing TCP connection for new requests or not.
	 */
	const KEEP_ALIVE = true;
	/**
	 * Apply configuration default values.
	 *
	 * @param configuration - User-provided configuration.
	 *
	 * @internal
	 */
	const setDefaults = (configuration) => {
	    var _a, _b, _c;
	    // Force disable service workers if environment doesn't support them.
	    if (configuration.subscriptionWorkerUrl && typeof SharedWorker === 'undefined')
	        configuration.subscriptionWorkerUrl = null;
	    return Object.assign(Object.assign({}, setDefaults$1(configuration)), { 
	        // Set platform-specific options.
	        listenToBrowserNetworkEvents: (_a = configuration.listenToBrowserNetworkEvents) !== null && _a !== void 0 ? _a : LISTEN_TO_BROWSER_NETWORK_EVENTS, subscriptionWorkerUrl: configuration.subscriptionWorkerUrl, subscriptionWorkerLogVerbosity: (_b = configuration.subscriptionWorkerLogVerbosity) !== null && _b !== void 0 ? _b : SUBSCRIPTION_WORKER_LOG_VERBOSITY, keepAlive: (_c = configuration.keepAlive) !== null && _c !== void 0 ? _c : KEEP_ALIVE });
	};

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

	/**
	 * Random identifier generator helper module.
	 *
	 * @internal
	 */
	/** @internal */
	var uuidGenerator = {
	    createUUID() {
	        if (uuidGenerator$1.uuid) {
	            return uuidGenerator$1.uuid();
	        }
	        // @ts-expect-error Depending on module type it may be callable.
	        return uuidGenerator$1();
	    },
	};

	/**
	 * {@link PubNub} client configuration module.
	 *
	 * @internal
	 */
	// --------------------------------------------------------
	// ----------------------- Defaults -----------------------
	// --------------------------------------------------------
	// region Defaults
	/**
	 * Whether encryption (if set) should use random initialization vector or not.
	 *
	 * @internal
	 */
	const USE_RANDOM_INITIALIZATION_VECTOR = true;
	/**
	 * Create {@link PubNub} client private configuration object.
	 *
	 * @param base - User- and platform-provided configuration.
	 * @param setupCryptoModule - Platform-provided {@link ICryptoModule} configuration block.
	 *
	 * @returns `PubNub` client private configuration.
	 *
	 * @internal
	 */
	const makeConfiguration = (base, setupCryptoModule) => {
	    var _a, _b, _c;
	    // Ensure that retry policy has proper configuration (if has been set).
	    (_a = base.retryConfiguration) === null || _a === void 0 ? void 0 : _a.validate();
	    (_b = base.useRandomIVs) !== null && _b !== void 0 ? _b : (base.useRandomIVs = USE_RANDOM_INITIALIZATION_VECTOR);
	    // Override origin value.
	    base.origin = standardOrigin((_c = base.ssl) !== null && _c !== void 0 ? _c : false, base.origin);
	    const cryptoModule = base.cryptoModule;
	    if (cryptoModule)
	        delete base.cryptoModule;
	    const clientConfiguration = Object.assign(Object.assign({}, base), { _pnsdkSuffix: {}, _instanceId: `pn-${uuidGenerator.createUUID()}`, _cryptoModule: undefined, _cipherKey: undefined, _setupCryptoModule: setupCryptoModule, get instanceId() {
	            if (this.useInstanceId)
	                return this._instanceId;
	            return undefined;
	        },
	        getUserId() {
	            return this.userId;
	        },
	        setUserId(value) {
	            if (!value || typeof value !== 'string' || value.trim().length === 0)
	                throw new Error('Missing or invalid userId parameter. Provide a valid string userId');
	            this.userId = value;
	        },
	        getAuthKey() {
	            return this.authKey;
	        },
	        setAuthKey(authKey) {
	            this.authKey = authKey;
	        },
	        getFilterExpression() {
	            return this.filterExpression;
	        },
	        setFilterExpression(expression) {
	            this.filterExpression = expression;
	        },
	        getCipherKey() {
	            return this._cipherKey;
	        },
	        setCipherKey(key) {
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
	                customEncrypt: this.getCustomEncrypt(),
	                customDecrypt: this.getCustomDecrypt(),
	            });
	        },
	        getCryptoModule() {
	            return this._cryptoModule;
	        },
	        getUseRandomIVs() {
	            return base.useRandomIVs;
	        },
	        setPresenceTimeout(value) {
	            this.heartbeatInterval = value / 2 - 1;
	            this.presenceTimeout = value;
	        },
	        getPresenceTimeout() {
	            return this.presenceTimeout;
	        },
	        getHeartbeatInterval() {
	            return this.heartbeatInterval;
	        },
	        setHeartbeatInterval(interval) {
	            this.heartbeatInterval = interval;
	        },
	        getTransactionTimeout() {
	            return this.transactionalRequestTimeout;
	        },
	        getSubscribeTimeout() {
	            return this.subscribeRequestTimeout;
	        },
	        get PubNubFile() {
	            return base.PubNubFile;
	        },
	        get version() {
	            return '8.3.1';
	        },
	        getVersion() {
	            return this.version;
	        },
	        _addPnsdkSuffix(name, suffix) {
	            this._pnsdkSuffix[name] = `${suffix}`;
	        },
	        _getPnsdkSuffix(separator) {
	            const sdk = Object.values(this._pnsdkSuffix).join(separator);
	            return sdk.length > 0 ? separator + sdk : '';
	        },
	        // --------------------------------------------------------
	        // ---------------------- Deprecated ----------------------
	        // --------------------------------------------------------
	        // region Deprecated
	        getUUID() {
	            return this.getUserId();
	        },
	        setUUID(value) {
	            this.setUserId(value);
	        },
	        getCustomEncrypt() {
	            return base.customEncrypt;
	        },
	        getCustomDecrypt() {
	            return base.customDecrypt;
	        } });
	    // Setup `CryptoModule` if possible.
	    if (base.cipherKey)
	        clientConfiguration.setCipherKey(base.cipherKey);
	    else if (cryptoModule)
	        clientConfiguration._cryptoModule = cryptoModule;
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
	const standardOrigin = (secure, origin) => {
	    const protocol = secure ? 'https://' : 'http://';
	    if (typeof origin === 'string')
	        return `${protocol}${origin}`;
	    return `${protocol}${origin[Math.floor(Math.random() * origin.length)]}`;
	};

	/**
	 * PubNub Access Token Manager module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * REST API access token manager.
	 *
	 * Manager maintains active access token and let parse it to get information about permissions.
	 *
	 * @internal
	 */
	class TokenManager {
	    constructor(cbor) {
	        this.cbor = cbor;
	    }
	    /**
	     * Update REST API access token.
	     *
	     * **Note:** Token will be applied only for next requests and won't affect ongoing requests.
	     *
	     * @param [token] - Access token which should be used to access PubNub REST API.
	     */
	    setToken(token) {
	        if (token && token.length > 0)
	            this.token = token;
	        else
	            this.token = undefined;
	    }
	    /**
	     * REST API access token.
	     *
	     * @returns Previously configured REST API access token.
	     */
	    getToken() {
	        return this.token;
	    }
	    /**
	     * Parse Base64-encoded access token.
	     *
	     * @param tokenString - Base64-encoded access token.
	     *
	     * @returns Information about resources and permissions which has been granted for them.
	     */
	    parseToken(tokenString) {
	        const parsed = this.cbor.decodeToken(tokenString);
	        if (parsed !== undefined) {
	            const uuidResourcePermissions = parsed.res.uuid ? Object.keys(parsed.res.uuid) : [];
	            const channelResourcePermissions = Object.keys(parsed.res.chan);
	            const groupResourcePermissions = Object.keys(parsed.res.grp);
	            const uuidPatternPermissions = parsed.pat.uuid ? Object.keys(parsed.pat.uuid) : [];
	            const channelPatternPermissions = Object.keys(parsed.pat.chan);
	            const groupPatternPermissions = Object.keys(parsed.pat.grp);
	            const result = {
	                version: parsed.v,
	                timestamp: parsed.t,
	                ttl: parsed.ttl,
	                authorized_uuid: parsed.uuid,
	                signature: parsed.sig,
	            };
	            const uuidResources = uuidResourcePermissions.length > 0;
	            const channelResources = channelResourcePermissions.length > 0;
	            const groupResources = groupResourcePermissions.length > 0;
	            if (uuidResources || channelResources || groupResources) {
	                result.resources = {};
	                if (uuidResources) {
	                    const uuids = (result.resources.uuids = {});
	                    uuidResourcePermissions.forEach((id) => (uuids[id] = this.extractPermissions(parsed.res.uuid[id])));
	                }
	                if (channelResources) {
	                    const channels = (result.resources.channels = {});
	                    channelResourcePermissions.forEach((id) => (channels[id] = this.extractPermissions(parsed.res.chan[id])));
	                }
	                if (groupResources) {
	                    const groups = (result.resources.groups = {});
	                    groupResourcePermissions.forEach((id) => (groups[id] = this.extractPermissions(parsed.res.grp[id])));
	                }
	            }
	            const uuidPatterns = uuidPatternPermissions.length > 0;
	            const channelPatterns = channelPatternPermissions.length > 0;
	            const groupPatterns = groupPatternPermissions.length > 0;
	            if (uuidPatterns || channelPatterns || groupPatterns) {
	                result.patterns = {};
	                if (uuidPatterns) {
	                    const uuids = (result.patterns.uuids = {});
	                    uuidPatternPermissions.forEach((id) => (uuids[id] = this.extractPermissions(parsed.pat.uuid[id])));
	                }
	                if (channelPatterns) {
	                    const channels = (result.patterns.channels = {});
	                    channelPatternPermissions.forEach((id) => (channels[id] = this.extractPermissions(parsed.pat.chan[id])));
	                }
	                if (groupPatterns) {
	                    const groups = (result.patterns.groups = {});
	                    groupPatternPermissions.forEach((id) => (groups[id] = this.extractPermissions(parsed.pat.grp[id])));
	                }
	            }
	            if (parsed.meta && Object.keys(parsed.meta).length > 0)
	                result.meta = parsed.meta;
	            return result;
	        }
	        return undefined;
	    }
	    /**
	     * Extract resource access permission information.
	     *
	     * @param permissions - Bit-encoded resource permissions.
	     *
	     * @returns Human-readable resource permissions.
	     */
	    extractPermissions(permissions) {
	        const permissionsResult = {
	            read: false,
	            write: false,
	            manage: false,
	            delete: false,
	            get: false,
	            update: false,
	            join: false,
	        };
	        if ((permissions & 128) === 128)
	            permissionsResult.join = true;
	        if ((permissions & 64) === 64)
	            permissionsResult.update = true;
	        if ((permissions & 32) === 32)
	            permissionsResult.get = true;
	        if ((permissions & 8) === 8)
	            permissionsResult.delete = true;
	        if ((permissions & 4) === 4)
	            permissionsResult.manage = true;
	        if ((permissions & 2) === 2)
	            permissionsResult.write = true;
	        if ((permissions & 1) === 1)
	            permissionsResult.read = true;
	        return permissionsResult;
	    }
	}

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
	 * Common PubNub Network Provider middleware module.
	 *
	 * @internal
	 */
	/**
	 * Request signature generator.
	 *
	 * @internal
	 */
	class RequestSignature {
	    constructor(publishKey, secretKey, hasher) {
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
	    signature(req) {
	        const method = req.path.startsWith('/publish') ? TransportMethod.GET : req.method;
	        let signatureInput = `${method}\n${this.publishKey}\n${req.path}\n${this.queryParameters(req.queryParameters)}\n`;
	        if (method === TransportMethod.POST || method === TransportMethod.PATCH) {
	            const body = req.body;
	            let payload;
	            if (body && body instanceof ArrayBuffer) {
	                payload = RequestSignature.textDecoder.decode(body);
	            }
	            else if (body && typeof body !== 'object') {
	                payload = body;
	            }
	            if (payload)
	                signatureInput += payload;
	        }
	        return `v2.${this.hasher(signatureInput, this.secretKey)}`
	            .replace(/\+/g, '-')
	            .replace(/\//g, '_')
	            .replace(/=+$/, '');
	    }
	    /**
	     * Prepare request query parameters for signature.
	     *
	     * @param query - Key / value pair of the request query parameters.
	     * @private
	     */
	    queryParameters(query) {
	        return Object.keys(query)
	            .sort()
	            .map((key) => {
	            const queryValue = query[key];
	            if (!Array.isArray(queryValue))
	                return `${key}=${encodeString(queryValue)}`;
	            return queryValue
	                .sort()
	                .map((value) => `${key}=${encodeString(value)}`)
	                .join('&');
	        })
	            .join('&');
	    }
	}
	RequestSignature.textDecoder = new TextDecoder('utf-8');
	/**
	 * Common PubNub Network Provider middleware.
	 *
	 * @internal
	 */
	class PubNubMiddleware {
	    constructor(configuration) {
	        this.configuration = configuration;
	        const { clientConfiguration: { keySet }, shaHMAC, } = configuration;
	        {
	            if (keySet.secretKey && shaHMAC)
	                this.signatureGenerator = new RequestSignature(keySet.publishKey, keySet.secretKey, shaHMAC);
	        }
	    }
	    makeSendable(req) {
	        return this.configuration.transport.makeSendable(this.request(req));
	    }
	    request(req) {
	        var _a;
	        const { clientConfiguration } = this.configuration;
	        // Get request patched by transport provider.
	        req = this.configuration.transport.request(req);
	        if (!req.queryParameters)
	            req.queryParameters = {};
	        // Modify request with required information.
	        if (clientConfiguration.useInstanceId)
	            req.queryParameters['instanceid'] = clientConfiguration.instanceId;
	        if (!req.queryParameters['uuid'])
	            req.queryParameters['uuid'] = clientConfiguration.userId;
	        if (clientConfiguration.useRequestId)
	            req.queryParameters['requestid'] = req.identifier;
	        req.queryParameters['pnsdk'] = this.generatePNSDK();
	        (_a = req.origin) !== null && _a !== void 0 ? _a : (req.origin = clientConfiguration.origin);
	        // Authenticate request if required.
	        this.authenticateRequest(req);
	        // Sign request if it is required.
	        this.signRequest(req);
	        return req;
	    }
	    authenticateRequest(req) {
	        var _a;
	        // Access management endpoints doesn't need authentication (signature required instead).
	        if (req.path.startsWith('/v2/auth/') || req.path.startsWith('/v3/pam/') || req.path.startsWith('/time'))
	            return;
	        const { clientConfiguration, tokenManager } = this.configuration;
	        const accessKey = (_a = (tokenManager && tokenManager.getToken())) !== null && _a !== void 0 ? _a : clientConfiguration.authKey;
	        if (accessKey)
	            req.queryParameters['auth'] = accessKey;
	    }
	    /**
	     * Compute and append request signature.
	     *
	     * @param req - Transport request with information which should be used to generate signature.
	     */
	    signRequest(req) {
	        if (!this.signatureGenerator || req.path.startsWith('/time'))
	            return;
	        req.queryParameters['timestamp'] = String(Math.floor(new Date().getTime() / 1000));
	        req.queryParameters['signature'] = this.signatureGenerator.signature(req);
	    }
	    /**
	     * Compose `pnsdk` query parameter.
	     *
	     * SDK provides ability to set custom name or append vendor information to the `pnsdk` query
	     * parameter.
	     *
	     * @returns Finalized `pnsdk` query parameter value.
	     */
	    generatePNSDK() {
	        const { clientConfiguration } = this.configuration;
	        if (clientConfiguration.sdkName)
	            return clientConfiguration.sdkName;
	        let base = `PubNub-JS-${clientConfiguration.sdkFamily}`;
	        if (clientConfiguration.partnerId)
	            base += `-${clientConfiguration.partnerId}`;
	        base += `/${clientConfiguration.getVersion()}`;
	        const pnsdkSuffix = clientConfiguration._getPnsdkSuffix(' ');
	        if (pnsdkSuffix.length > 0)
	            base += pnsdkSuffix;
	        return base;
	    }
	}

	/**
	 * Events listener manager module.
	 */
	/**
	 * Real-time listeners' manager.
	 *
	 * @internal
	 */
	class ListenerManager {
	    constructor() {
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
	    addListener(listener) {
	        if (this.listeners.includes(listener))
	            return;
	        this.listeners.push(listener);
	    }
	    /**
	     * Remove real-time event listener.
	     *
	     * @param listener - Event listeners which should be removed.
	     */
	    removeListener(listener) {
	        this.listeners = this.listeners.filter((storedListener) => storedListener !== listener);
	    }
	    /**
	     * Clear all real-time event listeners.
	     */
	    removeAllListeners() {
	        this.listeners = [];
	    }
	    /**
	     * Announce PubNub client status change event.
	     *
	     * @param status - PubNub client status.
	     */
	    announceStatus(status) {
	        this.listeners.forEach((listener) => {
	            if (listener.status)
	                listener.status(status);
	        });
	    }
	    /**
	     * Announce channel presence change event.
	     *
	     * @param presence - Channel presence change information.
	     */
	    announcePresence(presence) {
	        this.listeners.forEach((listener) => {
	            if (listener.presence)
	                listener.presence(presence);
	        });
	    }
	    /**
	     * Announce real-time message event.
	     *
	     * @param message - Received real-time message.
	     */
	    announceMessage(message) {
	        this.listeners.forEach((listener) => {
	            if (listener.message)
	                listener.message(message);
	        });
	    }
	    /**
	     * Announce real-time signal event.
	     *
	     * @param signal - Received real-time signal.
	     */
	    announceSignal(signal) {
	        this.listeners.forEach((listener) => {
	            if (listener.signal)
	                listener.signal(signal);
	        });
	    }
	    /**
	     * Announce message actions change event.
	     *
	     * @param messageAction - Message action change information.
	     */
	    announceMessageAction(messageAction) {
	        this.listeners.forEach((listener) => {
	            if (listener.messageAction)
	                listener.messageAction(messageAction);
	        });
	    }
	    /**
	     * Announce fie share event.
	     *
	     * @param file - Shared file information.
	     */
	    announceFile(file) {
	        this.listeners.forEach((listener) => {
	            if (listener.file)
	                listener.file(file);
	        });
	    }
	    /**
	     * Announce App Context Object change event.
	     *
	     * @param object - App Context change information.
	     */
	    announceObjects(object) {
	        this.listeners.forEach((listener) => {
	            if (listener.objects)
	                listener.objects(object);
	        });
	    }
	    /**
	     * Announce network up status.
	     */
	    announceNetworkUp() {
	        this.listeners.forEach((listener) => {
	            if (listener.status) {
	                listener.status({
	                    category: StatusCategory$1.PNNetworkUpCategory,
	                });
	            }
	        });
	    }
	    /**
	     * Announce network down status.
	     */
	    announceNetworkDown() {
	        this.listeners.forEach((listener) => {
	            if (listener.status) {
	                listener.status({
	                    category: StatusCategory$1.PNNetworkDownCategory,
	                });
	            }
	        });
	    }
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
	    announceUser(user) {
	        this.listeners.forEach((listener) => {
	            if (listener.user)
	                listener.user(user);
	        });
	    }
	    /**
	     * Announce Space App Context Object change event.
	     *
	     * @param space - Space App Context change information.
	     *
	     * @deprecated Use {@link announceObjects} method instead.
	     */
	    announceSpace(space) {
	        this.listeners.forEach((listener) => {
	            if (listener.space)
	                listener.space(space);
	        });
	    }
	    /**
	     * Announce VSP Membership App Context Object change event.
	     *
	     * @param membership - VSP Membership App Context change information.
	     *
	     * @deprecated Use {@link announceObjects} method instead.
	     */
	    announceMembership(membership) {
	        this.listeners.forEach((listener) => {
	            if (listener.membership)
	                listener.membership(membership);
	        });
	    }
	}

	/**
	 * Subscription reconnection-manager.
	 *
	 * **Note:** Reconnection manger rely on legacy time-based availability check.
	 *
	 * @internal
	 */
	/**
	 * Network "discovery" manager.
	 *
	 * Manager perform periodic `time` API calls to identify network availability.
	 *
	 * @internal
	 */
	class ReconnectionManager {
	    constructor(time) {
	        this.time = time;
	    }
	    /**
	     * Configure reconnection handler.
	     *
	     * @param callback - Successful availability check notify callback.
	     */
	    onReconnect(callback) {
	        this.callback = callback;
	    }
	    /**
	     * Start periodic "availability" check.
	     */
	    startPolling() {
	        this.timeTimer = setInterval(() => this.callTime(), 3000);
	    }
	    /**
	     * Stop periodic "availability" check.
	     */
	    stopPolling() {
	        if (this.timeTimer)
	            clearInterval(this.timeTimer);
	        this.timeTimer = null;
	    }
	    callTime() {
	        this.time((status) => {
	            if (!status.error) {
	                this.stopPolling();
	                if (this.callback)
	                    this.callback();
	            }
	        });
	    }
	}

	/**
	 * Messages de-duplication manager module.
	 *
	 * @internal
	 */
	/**
	 * Real-time events deduplication manager.
	 *
	 * @internal
	 */
	class DedupingManager {
	    /**
	     * Create and configure real-time events de-duplication manager.
	     *
	     * @param config - PubNub client configuration object.
	     */
	    constructor({ maximumCacheSize }) {
	        this.maximumCacheSize = maximumCacheSize;
	        this.hashHistory = [];
	    }
	    /**
	     * Compute unique real-time event payload key.
	     *
	     * @param message - Received real-time event payload for which unique key should be computed.
	     * @returns Unique real-time event payload key in messages cache.
	     */
	    getKey(message) {
	        var _a;
	        return `${message.timetoken}-${this.hashCode(JSON.stringify((_a = message.message) !== null && _a !== void 0 ? _a : '')).toString()}`;
	    }
	    /**
	     * Check whether there is similar message already received or not.
	     *
	     * @param message - Received real-time event payload which should be checked for duplicates.
	     * @returns `true` in case if similar payload already has been received before.
	     */
	    isDuplicate(message) {
	        return this.hashHistory.includes(this.getKey(message));
	    }
	    /**
	     * Store received message to be used later for duplicate detection.
	     *
	     * @param message - Received real-time event payload.
	     */
	    addEntry(message) {
	        if (this.hashHistory.length >= this.maximumCacheSize) {
	            this.hashHistory.shift();
	        }
	        this.hashHistory.push(this.getKey(message));
	    }
	    /**
	     * Clean up cached messages.
	     */
	    clearHistory() {
	        this.hashHistory = [];
	    }
	    /**
	     * Compute message hash sum.
	     *
	     * @param payload - Received payload for which hash sum should be computed.
	     * @returns {number} - Resulting hash sum.
	     */
	    hashCode(payload) {
	        let hash = 0;
	        if (payload.length === 0)
	            return hash;
	        for (let i = 0; i < payload.length; i += 1) {
	            const character = payload.charCodeAt(i);
	            hash = (hash << 5) - hash + character; // eslint-disable-line
	            hash = hash & hash; // eslint-disable-line
	        }
	        return hash;
	    }
	}

	/**
	 * Subscription manager module.
	 *
	 * @internal
	 */
	/**
	 * Subscription loop manager.
	 *
	 * @internal
	 */
	class SubscriptionManager {
	    constructor(configuration, listenerManager, eventEmitter, subscribeCall, heartbeatCall, leaveCall, time) {
	        this.configuration = configuration;
	        this.listenerManager = listenerManager;
	        this.eventEmitter = eventEmitter;
	        this.subscribeCall = subscribeCall;
	        this.heartbeatCall = heartbeatCall;
	        this.leaveCall = leaveCall;
	        this.reconnectionManager = new ReconnectionManager(time);
	        this.dedupingManager = new DedupingManager(this.configuration);
	        this.heartbeatChannelGroups = {};
	        this.heartbeatChannels = {};
	        this.presenceChannelGroups = {};
	        this.presenceChannels = {};
	        this.heartbeatTimer = null;
	        this.presenceState = {};
	        this.pendingChannelGroupSubscriptions = new Set();
	        this.pendingChannelSubscriptions = new Set();
	        this.channelGroups = {};
	        this.channels = {};
	        this.currentTimetoken = '0';
	        this.lastTimetoken = '0';
	        this.storedTimetoken = null;
	        this.subscriptionStatusAnnounced = false;
	        this.isOnline = true;
	    }
	    // region Information
	    get subscribedChannels() {
	        return Object.keys(this.channels);
	    }
	    get subscribedChannelGroups() {
	        return Object.keys(this.channelGroups);
	    }
	    get abort() {
	        return this._subscribeAbort;
	    }
	    set abort(call) {
	        this._subscribeAbort = call;
	    }
	    // endregion
	    // region Subscription
	    disconnect() {
	        this.stopSubscribeLoop();
	        this.stopHeartbeatTimer();
	        this.reconnectionManager.stopPolling();
	    }
	    reconnect() {
	        this.startSubscribeLoop();
	        this.startHeartbeatTimer();
	    }
	    /**
	     * Update channels and groups used in subscription loop.
	     *
	     * @param parameters - Subscribe configuration parameters.
	     */
	    subscribe(parameters) {
	        const { channels, channelGroups, timetoken, withPresence = false, withHeartbeats = false } = parameters;
	        if (timetoken) {
	            this.lastTimetoken = this.currentTimetoken;
	            this.currentTimetoken = timetoken;
	        }
	        if (this.currentTimetoken !== '0' && this.currentTimetoken !== 0) {
	            this.storedTimetoken = this.currentTimetoken;
	            this.currentTimetoken = 0;
	        }
	        channels === null || channels === void 0 ? void 0 : channels.forEach((channel) => {
	            this.pendingChannelSubscriptions.add(channel);
	            this.channels[channel] = {};
	            if (withPresence)
	                this.presenceChannels[channel] = {};
	            if (withHeartbeats || this.configuration.getHeartbeatInterval())
	                this.heartbeatChannels[channel] = {};
	        });
	        channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.forEach((group) => {
	            this.pendingChannelGroupSubscriptions.add(group);
	            this.channelGroups[group] = {};
	            if (withPresence)
	                this.presenceChannelGroups[group] = {};
	            if (withHeartbeats || this.configuration.getHeartbeatInterval())
	                this.heartbeatChannelGroups[group] = {};
	        });
	        this.subscriptionStatusAnnounced = false;
	        this.reconnect();
	    }
	    unsubscribe(parameters, isOffline) {
	        let { channels, channelGroups } = parameters;
	        const actualChannelGroups = new Set();
	        const actualChannels = new Set();
	        channels === null || channels === void 0 ? void 0 : channels.forEach((channel) => {
	            if (channel in this.channels) {
	                delete this.channels[channel];
	                actualChannels.add(channel);
	                if (channel in this.heartbeatChannels)
	                    delete this.heartbeatChannels[channel];
	            }
	            if (channel in this.presenceState)
	                delete this.presenceState[channel];
	            if (channel in this.presenceChannels) {
	                delete this.presenceChannels[channel];
	                actualChannels.add(channel);
	            }
	        });
	        channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.forEach((group) => {
	            if (group in this.channelGroups) {
	                delete this.channelGroups[group];
	                actualChannelGroups.add(group);
	                if (group in this.heartbeatChannelGroups)
	                    delete this.heartbeatChannelGroups[group];
	            }
	            if (group in this.presenceState)
	                delete this.presenceState[group];
	            if (group in this.presenceChannelGroups) {
	                delete this.presenceChannelGroups[group];
	                actualChannelGroups.add(group);
	            }
	        });
	        // There is no need to unsubscribe to empty list of data sources.
	        if (actualChannels.size === 0 && actualChannelGroups.size === 0)
	            return;
	        if (this.configuration.suppressLeaveEvents === false && !isOffline) {
	            channelGroups = Array.from(actualChannelGroups);
	            channels = Array.from(actualChannels);
	            this.leaveCall({ channels, channelGroups }, (status) => {
	                const { error } = status, restOfStatus = __rest(status, ["error"]);
	                let errorMessage;
	                if (error) {
	                    if (status.errorData &&
	                        typeof status.errorData === 'object' &&
	                        'message' in status.errorData &&
	                        typeof status.errorData.message === 'string')
	                        errorMessage = status.errorData.message;
	                    else if ('message' in status && typeof status.message === 'string')
	                        errorMessage = status.message;
	                }
	                this.listenerManager.announceStatus(Object.assign(Object.assign({}, restOfStatus), { error: errorMessage !== null && errorMessage !== void 0 ? errorMessage : false, affectedChannels: channels, affectedChannelGroups: channelGroups, currentTimetoken: this.currentTimetoken, lastTimetoken: this.lastTimetoken }));
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
	    }
	    unsubscribeAll(isOffline) {
	        this.unsubscribe({
	            channels: this.subscribedChannels,
	            channelGroups: this.subscribedChannelGroups,
	        }, isOffline);
	    }
	    startSubscribeLoop() {
	        this.stopSubscribeLoop();
	        const channelGroups = [...Object.keys(this.channelGroups)];
	        const channels = [...Object.keys(this.channels)];
	        Object.keys(this.presenceChannelGroups).forEach((group) => channelGroups.push(`${group}-pnpres`));
	        Object.keys(this.presenceChannels).forEach((channel) => channels.push(`${channel}-pnpres`));
	        // There is no need to start subscription loop for empty list of data sources.
	        if (channels.length === 0 && channelGroups.length === 0)
	            return;
	        this.subscribeCall({
	            channels,
	            channelGroups,
	            state: this.presenceState,
	            heartbeat: this.configuration.getPresenceTimeout(),
	            timetoken: this.currentTimetoken,
	            region: this.region !== null ? this.region : undefined,
	            filterExpression: this.configuration.filterExpression,
	        }, (status, result) => {
	            this.processSubscribeResponse(status, result);
	        });
	    }
	    stopSubscribeLoop() {
	        if (this._subscribeAbort) {
	            this._subscribeAbort();
	            this._subscribeAbort = null;
	        }
	    }
	    /**
	     * Process subscribe REST API endpoint response.
	     */
	    processSubscribeResponse(status, result) {
	        if (status.error) {
	            // Ignore aborted request.
	            if ((typeof status.errorData === 'object' &&
	                'name' in status.errorData &&
	                status.errorData.name === 'AbortError') ||
	                status.category === StatusCategory$1.PNCancelledCategory)
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
	                this.reconnectionManager.onReconnect(() => {
	                    if (this.configuration.autoNetworkDetection && !this.isOnline) {
	                        this.isOnline = true;
	                        this.listenerManager.announceNetworkUp();
	                    }
	                    this.reconnect();
	                    this.subscriptionStatusAnnounced = true;
	                    const reconnectedAnnounce = {
	                        category: StatusCategory$1.PNReconnectedCategory,
	                        operation: status.operation,
	                        lastTimetoken: this.lastTimetoken,
	                        currentTimetoken: this.currentTimetoken,
	                    };
	                    this.listenerManager.announceStatus(reconnectedAnnounce);
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
	            const connected = {
	                category: StatusCategory$1.PNConnectedCategory,
	                operation: status.operation,
	                affectedChannels: Array.from(this.pendingChannelSubscriptions),
	                subscribedChannels: this.subscribedChannels,
	                affectedChannelGroups: Array.from(this.pendingChannelGroupSubscriptions),
	                lastTimetoken: this.lastTimetoken,
	                currentTimetoken: this.currentTimetoken,
	            };
	            this.subscriptionStatusAnnounced = true;
	            this.listenerManager.announceStatus(connected);
	            // Clear pending channels and groups.
	            this.pendingChannelGroupSubscriptions.clear();
	            this.pendingChannelSubscriptions.clear();
	        }
	        const { messages } = result;
	        const { requestMessageCountThreshold, dedupeOnSubscribe } = this.configuration;
	        if (requestMessageCountThreshold && messages.length >= requestMessageCountThreshold) {
	            this.listenerManager.announceStatus({
	                category: StatusCategory$1.PNRequestMessageCountExceededCategory,
	                operation: status.operation,
	            });
	        }
	        try {
	            messages.forEach((message) => {
	                if (dedupeOnSubscribe && 'message' in message.data && 'timetoken' in message.data) {
	                    if (this.dedupingManager.isDuplicate(message.data))
	                        return;
	                    this.dedupingManager.addEntry(message.data);
	                }
	                this.eventEmitter.emitEvent(message);
	            });
	        }
	        catch (e) {
	            const errorStatus = {
	                error: true,
	                category: StatusCategory$1.PNUnknownCategory,
	                errorData: e,
	                statusCode: 0,
	            };
	            this.listenerManager.announceStatus(errorStatus);
	        }
	        this.region = result.cursor.region;
	        this.startSubscribeLoop();
	    }
	    // endregion
	    // region Presence
	    /**
	     * Update `uuid` state which should be sent with subscribe request.
	     *
	     * @param parameters - Channels and groups with state which should be associated to `uuid`.
	     */
	    setState(parameters) {
	        const { state, channels, channelGroups } = parameters;
	        channels === null || channels === void 0 ? void 0 : channels.forEach((channel) => channel in this.channels && (this.presenceState[channel] = state));
	        channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.forEach((group) => group in this.channelGroups && (this.presenceState[group] = state));
	    }
	    /**
	     * Manual presence management.
	     *
	     * @param parameters - Desired presence state for provided list of channels and groups.
	     */
	    changePresence(parameters) {
	        const { connected, channels, channelGroups } = parameters;
	        if (connected) {
	            channels === null || channels === void 0 ? void 0 : channels.forEach((channel) => (this.heartbeatChannels[channel] = {}));
	            channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.forEach((group) => (this.heartbeatChannelGroups[group] = {}));
	        }
	        else {
	            channels === null || channels === void 0 ? void 0 : channels.forEach((channel) => {
	                if (channel in this.heartbeatChannels)
	                    delete this.heartbeatChannels[channel];
	            });
	            channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.forEach((group) => {
	                if (group in this.heartbeatChannelGroups)
	                    delete this.heartbeatChannelGroups[group];
	            });
	            if (this.configuration.suppressLeaveEvents === false) {
	                this.leaveCall({ channels, channelGroups }, (status) => this.listenerManager.announceStatus(status));
	            }
	        }
	        this.reconnect();
	    }
	    startHeartbeatTimer() {
	        this.stopHeartbeatTimer();
	        const heartbeatInterval = this.configuration.getHeartbeatInterval();
	        if (!heartbeatInterval || heartbeatInterval === 0)
	            return;
	        this.sendHeartbeat();
	        this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), heartbeatInterval * 1000);
	    }
	    /**
	     * Stop heartbeat.
	     *
	     * Stop timer which trigger {@link HeartbeatRequest} sending with configured presence intervals.
	     */
	    stopHeartbeatTimer() {
	        if (!this.heartbeatTimer)
	            return;
	        clearInterval(this.heartbeatTimer);
	        this.heartbeatTimer = null;
	    }
	    /**
	     * Send heartbeat request.
	     */
	    sendHeartbeat() {
	        const heartbeatChannelGroups = Object.keys(this.heartbeatChannelGroups);
	        const heartbeatChannels = Object.keys(this.heartbeatChannels);
	        // There is no need to start heartbeat loop if there is no channels and groups to use.
	        if (heartbeatChannels.length === 0 && heartbeatChannelGroups.length === 0)
	            return;
	        this.heartbeatCall({
	            channels: heartbeatChannels,
	            channelGroups: heartbeatChannelGroups,
	            heartbeat: this.configuration.getPresenceTimeout(),
	            state: this.presenceState,
	        }, (status) => {
	            if (status.error && this.configuration.announceFailedHeartbeats)
	                this.listenerManager.announceStatus(status);
	            if (status.error && this.configuration.autoNetworkDetection && this.isOnline) {
	                this.isOnline = false;
	                this.disconnect();
	                this.listenerManager.announceNetworkDown();
	                this.reconnect();
	            }
	            if (!status.error && this.configuration.announceSuccessfulHeartbeats)
	                this.listenerManager.announceStatus(status);
	        });
	    }
	}

	// --------------------------------------------------------
	// ------------------------ Types -------------------------
	// --------------------------------------------------------
	// region Types
	// endregion
	// endregion
	/**
	 * Base notification payload object.
	 */
	class BaseNotificationPayload {
	    /**
	     * Base notification provider payload object.
	     *
	     * @internal
	     *
	     * @param payload - Object which contains vendor-specific preformatted push notification payload.
	     * @param title - Notification main title.
	     * @param body - Notification body (main messages).
	     */
	    constructor(payload, title, body) {
	        this._payload = payload;
	        this.setDefaultPayloadStructure();
	        this.title = title;
	        this.body = body;
	    }
	    /**
	     * Retrieve resulting notification payload content for message.
	     *
	     * @returns Preformatted push notification payload data.
	     */
	    get payload() {
	        return this._payload;
	    }
	    /**
	     * Update notification title.
	     *
	     * @param value - New notification title.
	     */
	    set title(value) {
	        this._title = value;
	    }
	    /**
	     * Update notification subtitle.
	     *
	     * @param value - New second-line notification title.
	     */
	    set subtitle(value) {
	        this._subtitle = value;
	    }
	    /**
	     * Update notification body.
	     *
	     * @param value - Update main notification message (shown when expanded).
	     */
	    set body(value) {
	        this._body = value;
	    }
	    /**
	     * Update application badge number.
	     *
	     * @param value - Number which should be shown in application badge upon receiving notification.
	     */
	    set badge(value) {
	        this._badge = value;
	    }
	    /**
	     * Update notification sound.
	     *
	     * @param value - Name of the sound file which should be played upon notification receive.
	     */
	    set sound(value) {
	        this._sound = value;
	    }
	    /**
	     * Platform-specific structure initialization.
	     *
	     * @internal
	     */
	    setDefaultPayloadStructure() { }
	    /**
	     * Translate data object into PubNub push notification payload object.
	     *
	     * @internal
	     *
	     * @returns Preformatted push notification payload.
	     */
	    toObject() {
	        return {};
	    }
	}
	/**
	 * Message payload for Apple Push Notification Service.
	 */
	class APNSNotificationPayload extends BaseNotificationPayload {
	    constructor() {
	        super(...arguments);
	        /**
	         * Type of push notification service for which payload will be created.
	         *
	         * @internal
	         */
	        this._apnsPushType = 'apns';
	        /**
	         * Whether resulting payload should trigger silent notification or not.
	         *
	         * @internal
	         */
	        this._isSilent = false;
	    }
	    get payload() {
	        return this._payload;
	    }
	    /**
	     * Update notification receivers configuration.
	     *
	     * @param value - New APNS2 configurations.
	     */
	    set configurations(value) {
	        if (!value || !value.length)
	            return;
	        this._configurations = value;
	    }
	    /**
	     * Notification payload.
	     *
	     * @returns Platform-specific part of PubNub notification payload.
	     */
	    get notification() {
	        return this.payload.aps;
	    }
	    /**
	     * Notification title.
	     *
	     * @returns Main notification title.
	     */
	    get title() {
	        return this._title;
	    }
	    /**
	     * Update notification title.
	     *
	     * @param value - New notification title.
	     */
	    set title(value) {
	        if (!value || !value.length)
	            return;
	        this.payload.aps.alert.title = value;
	        this._title = value;
	    }
	    /**
	     * Notification subtitle.
	     *
	     * @returns Second-line notification title.
	     */
	    get subtitle() {
	        return this._subtitle;
	    }
	    /**
	     * Update notification subtitle.
	     *
	     * @param value - New second-line notification title.
	     */
	    set subtitle(value) {
	        if (!value || !value.length)
	            return;
	        this.payload.aps.alert.subtitle = value;
	        this._subtitle = value;
	    }
	    /**
	     * Notification body.
	     *
	     * @returns Main notification message (shown when expanded).
	     */
	    get body() {
	        return this._body;
	    }
	    /**
	     * Update notification body.
	     *
	     * @param value - Update main notification message (shown when expanded).
	     */
	    set body(value) {
	        if (!value || !value.length)
	            return;
	        this.payload.aps.alert.body = value;
	        this._body = value;
	    }
	    /**
	     * Retrieve unread notifications number.
	     *
	     * @returns Number of unread notifications which should be shown on application badge.
	     */
	    get badge() {
	        return this._badge;
	    }
	    /**
	     * Update application badge number.
	     *
	     * @param value - Number which should be shown in application badge upon receiving notification.
	     */
	    set badge(value) {
	        if (value === undefined || value === null)
	            return;
	        this.payload.aps.badge = value;
	        this._badge = value;
	    }
	    /**
	     * Retrieve notification sound file.
	     *
	     * @returns Notification sound file name from resource bundle.
	     */
	    get sound() {
	        return this._sound;
	    }
	    /**
	     * Update notification sound.
	     *
	     * @param value - Name of the sound file which should be played upon notification receive.
	     */
	    set sound(value) {
	        if (!value || !value.length)
	            return;
	        this.payload.aps.sound = value;
	        this._sound = value;
	    }
	    /**
	     * Set whether notification should be silent or not.
	     *
	     * `content-available` notification type will be used to deliver silent notification if set to `true`.
	     *
	     * @param value - Whether notification should be sent as silent or not.
	     */
	    set silent(value) {
	        this._isSilent = value;
	    }
	    /**
	     * Setup push notification payload default content.
	     *
	     * @internal
	     */
	    setDefaultPayloadStructure() {
	        this.payload.aps = { alert: {} };
	    }
	    /**
	     * Translate data object into PubNub push notification payload object.
	     *
	     * @internal
	     *
	     * @returns Preformatted push notification payload.
	     */
	    toObject() {
	        const payload = Object.assign({}, this.payload);
	        const { aps } = payload;
	        let { alert } = aps;
	        if (this._isSilent)
	            aps['content-available'] = 1;
	        if (this._apnsPushType === 'apns2') {
	            if (!this._configurations || !this._configurations.length)
	                throw new ReferenceError('APNS2 configuration is missing');
	            const configurations = [];
	            this._configurations.forEach((configuration) => {
	                configurations.push(this.objectFromAPNS2Configuration(configuration));
	            });
	            if (configurations.length)
	                payload.pn_push = configurations;
	        }
	        if (!alert || !Object.keys(alert).length)
	            delete aps.alert;
	        if (this._isSilent) {
	            delete aps.alert;
	            delete aps.badge;
	            delete aps.sound;
	            alert = {};
	        }
	        return this._isSilent || (alert && Object.keys(alert).length) ? payload : null;
	    }
	    /**
	     * Create PubNub push notification service APNS2 configuration information object.
	     *
	     * @internal
	     *
	     * @param configuration - Source user-provided APNS2 configuration.
	     *
	     * @returns Preformatted for PubNub service APNS2 configuration information.
	     */
	    objectFromAPNS2Configuration(configuration) {
	        if (!configuration.targets || !configuration.targets.length)
	            throw new ReferenceError('At least one APNS2 target should be provided');
	        const { collapseId, expirationDate } = configuration;
	        const objectifiedConfiguration = {
	            auth_method: 'token',
	            targets: configuration.targets.map((target) => this.objectFromAPNSTarget(target)),
	            version: 'v2',
	        };
	        if (collapseId && collapseId.length)
	            objectifiedConfiguration.collapse_id = collapseId;
	        if (expirationDate)
	            objectifiedConfiguration.expiration = expirationDate.toISOString();
	        return objectifiedConfiguration;
	    }
	    /**
	     * Create PubNub push notification service APNS2 target information object.
	     *
	     * @internal
	     *
	     * @param target - Source user-provided data.
	     *
	     * @returns Preformatted for PubNub service APNS2 target information.
	     */
	    objectFromAPNSTarget(target) {
	        if (!target.topic || !target.topic.length)
	            throw new TypeError("Target 'topic' undefined.");
	        const { topic, environment = 'development', excludedDevices = [] } = target;
	        const objectifiedTarget = { topic, environment };
	        if (excludedDevices.length)
	            objectifiedTarget.excluded_devices = excludedDevices;
	        return objectifiedTarget;
	    }
	}
	/**
	 * Message payload for Firebase Cloud Messaging service.
	 */
	class FCMNotificationPayload extends BaseNotificationPayload {
	    get payload() {
	        return this._payload;
	    }
	    /**
	     * Notification payload.
	     *
	     * @returns Platform-specific part of PubNub notification payload.
	     */
	    get notification() {
	        return this.payload.notification;
	    }
	    /**
	     * Silent notification payload.
	     *
	     * @returns Silent notification payload (data notification).
	     */
	    get data() {
	        return this.payload.data;
	    }
	    /**
	     * Notification title.
	     *
	     * @returns Main notification title.
	     */
	    get title() {
	        return this._title;
	    }
	    /**
	     * Update notification title.
	     *
	     * @param value - New notification title.
	     */
	    set title(value) {
	        if (!value || !value.length)
	            return;
	        this.payload.notification.title = value;
	        this._title = value;
	    }
	    /**
	     * Notification body.
	     *
	     * @returns Main notification message (shown when expanded).
	     */
	    get body() {
	        return this._body;
	    }
	    /**
	     * Update notification body.
	     *
	     * @param value - Update main notification message (shown when expanded).
	     */
	    set body(value) {
	        if (!value || !value.length)
	            return;
	        this.payload.notification.body = value;
	        this._body = value;
	    }
	    /**
	     * Retrieve notification sound file.
	     *
	     * @returns Notification sound file name from resource bundle.
	     */
	    get sound() {
	        return this._sound;
	    }
	    /**
	     * Update notification sound.
	     *
	     * @param value - Name of the sound file which should be played upon notification receive.
	     */
	    set sound(value) {
	        if (!value || !value.length)
	            return;
	        this.payload.notification.sound = value;
	        this._sound = value;
	    }
	    /**
	     * Retrieve notification icon file.
	     *
	     * @returns Notification icon file name from resource bundle.
	     */
	    get icon() {
	        return this._icon;
	    }
	    /**
	     * Update notification icon.
	     *
	     * @param value - Name of the icon file which should be shown on notification.
	     */
	    set icon(value) {
	        if (!value || !value.length)
	            return;
	        this.payload.notification.icon = value;
	        this._icon = value;
	    }
	    /**
	     * Retrieve notifications grouping tag.
	     *
	     * @returns Notifications grouping tag.
	     */
	    get tag() {
	        return this._tag;
	    }
	    /**
	     * Update notifications grouping tag.
	     *
	     * @param value - String which will be used to group similar notifications in notification center.
	     */
	    set tag(value) {
	        if (!value || !value.length)
	            return;
	        this.payload.notification.tag = value;
	        this._tag = value;
	    }
	    /**
	     * Set whether notification should be silent or not.
	     *
	     * All notification data will be sent under `data` field if set to `true`.
	     *
	     * @param value - Whether notification should be sent as silent or not.
	     */
	    set silent(value) {
	        this._isSilent = value;
	    }
	    /**
	     * Setup push notification payload default content.
	     *
	     * @internal
	     */
	    setDefaultPayloadStructure() {
	        this.payload.notification = {};
	        this.payload.data = {};
	    }
	    /**
	     * Translate data object into PubNub push notification payload object.
	     *
	     * @internal
	     *
	     * @returns Preformatted push notification payload.
	     */
	    toObject() {
	        let data = Object.assign({}, this.payload.data);
	        let notification = null;
	        const payload = {};
	        // Check whether additional data has been passed outside 'data' object and put it into it if required.
	        if (Object.keys(this.payload).length > 2) {
	            const _a = this.payload, additionalData = __rest(_a, ["notification", "data"]);
	            data = Object.assign(Object.assign({}, data), additionalData);
	        }
	        if (this._isSilent)
	            data.notification = this.payload.notification;
	        else
	            notification = this.payload.notification;
	        if (Object.keys(data).length)
	            payload.data = data;
	        if (notification && Object.keys(notification).length)
	            payload.notification = notification;
	        return Object.keys(payload).length ? payload : null;
	    }
	}
	class NotificationsPayload {
	    /**
	     * Create push notification payload holder.
	     *
	     * @internal
	     *
	     * @param title - String which will be shown at the top of the notification (below app name).
	     * @param body - String with message which should be shown when user will check notification.
	     */
	    constructor(title, body) {
	        this._payload = { apns: {}, fcm: {} };
	        this._title = title;
	        this._body = body;
	        this.apns = new APNSNotificationPayload(this._payload.apns, title, body);
	        this.fcm = new FCMNotificationPayload(this._payload.fcm, title, body);
	    }
	    /**
	     * Enable or disable push notification debugging message.
	     *
	     * @param value - Whether debug message from push notification scheduler should be published to the specific
	     * channel or not.
	     */
	    set debugging(value) {
	        this._debugging = value;
	    }
	    /**
	     * Notification title.
	     *
	     * @returns Main notification title.
	     */
	    get title() {
	        return this._title;
	    }
	    /**
	     * Notification subtitle.
	     *
	     * @returns Second-line notification title.
	     */
	    get subtitle() {
	        return this._subtitle;
	    }
	    /**
	     * Update notification subtitle.
	     *
	     * @param value - New second-line notification title.
	     */
	    set subtitle(value) {
	        this._subtitle = value;
	        this.apns.subtitle = value;
	        this.fcm.subtitle = value;
	    }
	    /**
	     * Notification body.
	     *
	     * @returns Main notification message (shown when expanded).
	     */
	    get body() {
	        return this._body;
	    }
	    /**
	     * Retrieve unread notifications number.
	     *
	     * @returns Number of unread notifications which should be shown on application badge.
	     */
	    get badge() {
	        return this._badge;
	    }
	    /**
	     * Update application badge number.
	     *
	     * @param value - Number which should be shown in application badge upon receiving notification.
	     */
	    set badge(value) {
	        this._badge = value;
	        this.apns.badge = value;
	        this.fcm.badge = value;
	    }
	    /**
	     * Retrieve notification sound file.
	     *
	     * @returns Notification sound file name from resource bundle.
	     */
	    get sound() {
	        return this._sound;
	    }
	    /**
	     * Update notification sound.
	     *
	     * @param value - Name of the sound file which should be played upon notification receive.
	     */
	    set sound(value) {
	        this._sound = value;
	        this.apns.sound = value;
	        this.fcm.sound = value;
	    }
	    /**
	     * Build notifications platform for requested platforms.
	     *
	     * @param platforms - List of platforms for which payload should be added to final dictionary. Supported values:
	     * fcm, apns, and apns2.
	     *
	     * @returns Object with data, which can be sent with publish method call and trigger remote notifications for
	     * specified platforms.
	     */
	    buildPayload(platforms) {
	        const payload = {};
	        if (platforms.includes('apns') || platforms.includes('apns2')) {
	            // @ts-expect-error Override APNS version.
	            this.apns._apnsPushType = platforms.includes('apns') ? 'apns' : 'apns2';
	            const apnsPayload = this.apns.toObject();
	            if (apnsPayload && Object.keys(apnsPayload).length)
	                payload.pn_apns = apnsPayload;
	        }
	        if (platforms.includes('fcm')) {
	            const fcmPayload = this.fcm.toObject();
	            if (fcmPayload && Object.keys(fcmPayload).length)
	                payload.pn_gcm = fcmPayload;
	        }
	        if (Object.keys(payload).length && this._debugging)
	            payload.pn_debug = true;
	        return payload;
	    }
	}

	/**
	 * Network request module.
	 *
	 * @internal
	 */
	/**
	 * Base REST API request class.
	 *
	 * @internal
	 */
	class AbstractRequest {
	    /**
	     * Construct base request.
	     *
	     * Constructed request by default won't be cancellable and performed using `GET` HTTP method.
	     *
	     * @param params - Request configuration parameters.
	     */
	    constructor(params) {
	        this.params = params;
	        /**
	         * Unique request identifier.
	         */
	        this.requestIdentifier = uuidGenerator.createUUID();
	        this._cancellationController = null;
	    }
	    /**
	     * Retrieve configured cancellation controller.
	     *
	     * @returns Cancellation controller.
	     */
	    get cancellationController() {
	        return this._cancellationController;
	    }
	    /**
	     * Update request cancellation controller.
	     *
	     * Controller itself provided by transport provider implementation and set only when request
	     * sending has been scheduled.
	     *
	     * @param controller - Cancellation controller or `null` to reset it.
	     */
	    set cancellationController(controller) {
	        this._cancellationController = controller;
	    }
	    /**
	     * Abort request if possible.
	     */
	    abort() {
	        if (this && this.cancellationController)
	            this.cancellationController.abort();
	    }
	    /**
	     * Target REST API endpoint operation type.
	     */
	    operation() {
	        throw Error('Should be implemented by subclass.');
	    }
	    /**
	     * Validate user-provided data before scheduling request.
	     *
	     * @returns Error message if request can't be sent without missing or malformed parameters.
	     */
	    validate() {
	        return undefined;
	    }
	    /**
	     * Parse service response.
	     *
	     * @param _response - Raw service response which should be parsed.
	     */
	    parse(_response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            throw Error('Should be implemented by subclass.');
	        });
	    }
	    /**
	     * Create platform-agnostic request object.
	     *
	     * @returns Request object which can be processed using platform-specific requirements.
	     */
	    request() {
	        var _a, _b, _c, _d;
	        const request = {
	            method: (_b = (_a = this.params) === null || _a === void 0 ? void 0 : _a.method) !== null && _b !== void 0 ? _b : TransportMethod.GET,
	            path: this.path,
	            queryParameters: this.queryParameters,
	            cancellable: (_d = (_c = this.params) === null || _c === void 0 ? void 0 : _c.cancellable) !== null && _d !== void 0 ? _d : false,
	            timeout: 10000,
	            identifier: this.requestIdentifier,
	        };
	        // Attach headers (if required).
	        const headers = this.headers;
	        if (headers)
	            request.headers = headers;
	        // Attach body (if required).
	        if (request.method === TransportMethod.POST || request.method === TransportMethod.PATCH) {
	            const [body, formData] = [this.body, this.formData];
	            if (formData)
	                request.formData = formData;
	            if (body)
	                request.body = body;
	        }
	        return request;
	    }
	    /**
	     * Target REST API endpoint request headers getter.
	     *
	     * @returns Key/value headers which should be used with request.
	     */
	    get headers() {
	        return undefined;
	    }
	    /**
	     * Target REST API endpoint request path getter.
	     *
	     * @returns REST API path.
	     */
	    get path() {
	        throw Error('`path` getter should be implemented by subclass.');
	    }
	    /**
	     * Target REST API endpoint request query parameters getter.
	     *
	     * @returns Key/value pairs which should be appended to the REST API path.
	     */
	    get queryParameters() {
	        return {};
	    }
	    get formData() {
	        return undefined;
	    }
	    /**
	     * Target REST API Request body payload getter.
	     *
	     * @returns Buffer of stringified data which should be sent with `POST` or `PATCH` request.
	     */
	    get body() {
	        return undefined;
	    }
	    /**
	     * Deserialize service response.
	     *
	     * @param response - Transparent response object with headers and body information.
	     *
	     * @returns Deserialized data or `undefined` in case of `JSON.parse(..)` error.
	     */
	    deserializeResponse(response) {
	        const contentType = response.headers['content-type'];
	        if (!contentType || (contentType.indexOf('javascript') === -1 && contentType.indexOf('json') === -1))
	            return undefined;
	        const json = AbstractRequest.decoder.decode(response.body);
	        try {
	            const parsedJson = JSON.parse(json);
	            return parsedJson;
	        }
	        catch (error) {
	            console.error('Error parsing JSON response:', error);
	            return undefined;
	        }
	    }
	}
	/**
	 * Service `ArrayBuffer` response decoder.
	 */
	AbstractRequest.decoder = new TextDecoder();

	/**
	 * Endpoint API operation types.
	 */
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
	     * Fetch global presence information REST API operation.
	     */
	    RequestOperation["PNGlobalHereNowOperation"] = "PNGlobalHereNowOperation";
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
	    /**
	     * Initial event engine subscription handshake operation.
	     *
	     * @internal
	     */
	    RequestOperation["PNHandshakeOperation"] = "PNHandshakeOperation";
	    /**
	     * Event engine subscription loop operation.
	     *
	     * @internal
	     */
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
	const WITH_PRESENCE = false;
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
	 *
	 * @internal
	 */
	class BaseSubscribeRequest extends AbstractRequest {
	    constructor(parameters) {
	        var _a, _b, _c;
	        var _d, _e, _f;
	        super({ cancellable: true });
	        this.parameters = parameters;
	        // Apply default request parameters.
	        (_a = (_d = this.parameters).withPresence) !== null && _a !== void 0 ? _a : (_d.withPresence = WITH_PRESENCE);
	        (_b = (_e = this.parameters).channelGroups) !== null && _b !== void 0 ? _b : (_e.channelGroups = []);
	        (_c = (_f = this.parameters).channels) !== null && _c !== void 0 ? _c : (_f.channels = []);
	    }
	    operation() {
	        return RequestOperation$1.PNSubscribeOperation;
	    }
	    validate() {
	        const { keySet: { subscribeKey }, channels, channelGroups, } = this.parameters;
	        if (!subscribeKey)
	            return 'Missing Subscribe Key';
	        if (!channels && !channelGroups)
	            return '`channels` and `channelGroups` both should not be empty';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            let serviceResponse;
	            try {
	                const json = AbstractRequest.decoder.decode(response.body);
	                const parsedJson = JSON.parse(json);
	                serviceResponse = parsedJson;
	            }
	            catch (error) {
	                console.error('Error parsing JSON response:', error);
	            }
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            const events = serviceResponse.m
	                .filter((envelope) => {
	                const subscribable = envelope.b === undefined ? envelope.c : envelope.b;
	                return ((this.parameters.channels && this.parameters.channels.includes(subscribable)) ||
	                    (this.parameters.channelGroups && this.parameters.channelGroups.includes(subscribable)));
	            })
	                .map((envelope) => {
	                let { e: eventType } = envelope;
	                // Resolve missing event type.
	                eventType !== null && eventType !== void 0 ? eventType : (eventType = envelope.c.endsWith('-pnpres') ? PubNubEventType.Presence : PubNubEventType.Message);
	                // Check whether payload is string (potentially encrypted data).
	                if (eventType != PubNubEventType.Signal && typeof envelope.d === 'string') {
	                    if (eventType == PubNubEventType.Message) {
	                        return {
	                            type: PubNubEventType.Message,
	                            data: this.messageFromEnvelope(envelope),
	                        };
	                    }
	                    return {
	                        type: PubNubEventType.Files,
	                        data: this.fileFromEnvelope(envelope),
	                    };
	                }
	                else if (eventType == PubNubEventType.Message) {
	                    return {
	                        type: PubNubEventType.Message,
	                        data: this.messageFromEnvelope(envelope),
	                    };
	                }
	                else if (eventType === PubNubEventType.Presence) {
	                    return {
	                        type: PubNubEventType.Presence,
	                        data: this.presenceEventFromEnvelope(envelope),
	                    };
	                }
	                else if (eventType == PubNubEventType.Signal) {
	                    return {
	                        type: PubNubEventType.Signal,
	                        data: this.signalFromEnvelope(envelope),
	                    };
	                }
	                else if (eventType === PubNubEventType.AppContext) {
	                    return {
	                        type: PubNubEventType.AppContext,
	                        data: this.appContextFromEnvelope(envelope),
	                    };
	                }
	                else if (eventType === PubNubEventType.MessageAction) {
	                    return {
	                        type: PubNubEventType.MessageAction,
	                        data: this.messageActionFromEnvelope(envelope),
	                    };
	                }
	                return {
	                    type: PubNubEventType.Files,
	                    data: this.fileFromEnvelope(envelope),
	                };
	            });
	            return {
	                cursor: { timetoken: serviceResponse.t.t, region: serviceResponse.t.r },
	                messages: events,
	            };
	        });
	    }
	    get headers() {
	        return { accept: 'text/javascript' };
	    }
	    // --------------------------------------------------------
	    // ------------------ Envelope parsing --------------------
	    // --------------------------------------------------------
	    // region Envelope parsing
	    presenceEventFromEnvelope(envelope) {
	        const { d: payload } = envelope;
	        const [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);
	        // Clean up channel and subscription name from presence suffix.
	        const trimmedChannel = channel.replace('-pnpres', '');
	        // Backward compatibility with deprecated properties.
	        const actualChannel = subscription !== null ? trimmedChannel : null;
	        const subscribedChannel = subscription !== null ? subscription : trimmedChannel;
	        if (typeof payload !== 'string' && 'data' in payload) {
	            // @ts-expect-error This is `state-change` object which should have `state` field.
	            payload['state'] = payload.data;
	            delete payload.data;
	        }
	        return Object.assign({ channel: trimmedChannel, subscription,
	            actualChannel,
	            subscribedChannel, timetoken: envelope.p.t }, payload);
	    }
	    messageFromEnvelope(envelope) {
	        const [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);
	        const [message, decryptionError] = this.decryptedData(envelope.d);
	        // Backward compatibility with deprecated properties.
	        const actualChannel = subscription !== null ? channel : null;
	        const subscribedChannel = subscription !== null ? subscription : channel;
	        // Basic message event payload.
	        const event = {
	            channel,
	            subscription,
	            actualChannel,
	            subscribedChannel,
	            timetoken: envelope.p.t,
	            publisher: envelope.i,
	            message,
	        };
	        if (envelope.u)
	            event.userMetadata = envelope.u;
	        if (envelope.cmt)
	            event.customMessageType = envelope.cmt;
	        if (decryptionError)
	            event.error = decryptionError;
	        return event;
	    }
	    signalFromEnvelope(envelope) {
	        const [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);
	        const event = {
	            channel,
	            subscription,
	            timetoken: envelope.p.t,
	            publisher: envelope.i,
	            message: envelope.d,
	        };
	        if (envelope.u)
	            event.userMetadata = envelope.u;
	        if (envelope.cmt)
	            event.customMessageType = envelope.cmt;
	        return event;
	    }
	    messageActionFromEnvelope(envelope) {
	        const [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);
	        const action = envelope.d;
	        return {
	            channel,
	            subscription,
	            timetoken: envelope.p.t,
	            publisher: envelope.i,
	            event: action.event,
	            data: Object.assign(Object.assign({}, action.data), { uuid: envelope.i }),
	        };
	    }
	    appContextFromEnvelope(envelope) {
	        const [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);
	        const object = envelope.d;
	        return {
	            channel,
	            subscription,
	            timetoken: envelope.p.t,
	            message: object,
	        };
	    }
	    fileFromEnvelope(envelope) {
	        const [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);
	        const [file, decryptionError] = this.decryptedData(envelope.d);
	        let errorMessage = decryptionError;
	        // Basic file event payload.
	        const event = {
	            channel,
	            subscription,
	            timetoken: envelope.p.t,
	            publisher: envelope.i,
	        };
	        if (envelope.u)
	            event.userMetadata = envelope.u;
	        if (!file)
	            errorMessage !== null && errorMessage !== void 0 ? errorMessage : (errorMessage = `File information payload is missing.`);
	        else if (typeof file === 'string')
	            errorMessage !== null && errorMessage !== void 0 ? errorMessage : (errorMessage = `Unexpected file information payload data type.`);
	        else {
	            event.message = file.message;
	            if (file.file) {
	                event.file = {
	                    id: file.file.id,
	                    name: file.file.name,
	                    url: this.parameters.getFileUrl({ id: file.file.id, name: file.file.name, channel }),
	                };
	            }
	        }
	        if (envelope.cmt)
	            event.customMessageType = envelope.cmt;
	        if (errorMessage)
	            event.error = errorMessage;
	        return event;
	    }
	    // endregion
	    subscriptionChannelFromEnvelope(envelope) {
	        return [envelope.c, envelope.b === undefined ? envelope.c : envelope.b];
	    }
	    /**
	     * Decrypt provided `data`.
	     *
	     * @param [data] - Message or file information which should be decrypted if possible.
	     *
	     * @returns Tuple with decrypted data and decryption error (if any).
	     */
	    decryptedData(data) {
	        if (!this.parameters.crypto || typeof data !== 'string')
	            return [data, undefined];
	        let payload;
	        let error;
	        try {
	            const decryptedData = this.parameters.crypto.decrypt(data);
	            payload =
	                decryptedData instanceof ArrayBuffer
	                    ? JSON.parse(SubscribeRequest.decoder.decode(decryptedData))
	                    : decryptedData;
	        }
	        catch (err) {
	            payload = null;
	            error = `Error while decrypting message content: ${err.message}`;
	        }
	        return [(payload !== null && payload !== void 0 ? payload : data), error];
	    }
	}
	/**
	 * Subscribe request.
	 *
	 * @internal
	 */
	class SubscribeRequest extends BaseSubscribeRequest {
	    get path() {
	        var _a;
	        const { keySet: { subscribeKey }, channels, } = this.parameters;
	        return `/v2/subscribe/${subscribeKey}/${encodeNames((_a = channels === null || channels === void 0 ? void 0 : channels.sort()) !== null && _a !== void 0 ? _a : [], ',')}/0`;
	    }
	    get queryParameters() {
	        const { channelGroups, filterExpression, heartbeat, state, timetoken, region } = this.parameters;
	        const query = {};
	        if (channelGroups && channelGroups.length > 0)
	            query['channel-group'] = channelGroups.sort().join(',');
	        if (filterExpression && filterExpression.length > 0)
	            query['filter-expr'] = filterExpression;
	        if (heartbeat)
	            query.heartbeat = heartbeat;
	        if (state && Object.keys(state).length > 0)
	            query['state'] = JSON.stringify(state);
	        if (timetoken !== undefined && typeof timetoken === 'string') {
	            if (timetoken.length > 0 && timetoken !== '0')
	                query['tt'] = timetoken;
	        }
	        else if (timetoken !== undefined && timetoken > 0)
	            query['tt'] = timetoken;
	        if (region)
	            query['tr'] = region;
	        return query;
	    }
	}

	/**
	 * Real-time events emitter module.
	 *
	 * @internal
	 */
	/**
	 * Real-time events' emitter.
	 *
	 * Emitter responsible for forwarding received real-time events to the closures which has been
	 * registered for specific events handling.
	 *
	 * @internal
	 */
	class EventEmitter {
	    constructor(listenerManager) {
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
	    emitEvent(event) {
	        var _a;
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
	            this.announce('presence', event.data, (_a = event.data.subscription) !== null && _a !== void 0 ? _a : event.data.channel, event.data.subscription);
	        }
	        else if (event.type === PubNubEventType.AppContext) {
	            const { data: objectEvent } = event;
	            const { message: object } = objectEvent;
	            this.listenerManager.announceObjects(objectEvent);
	            this.announce('objects', objectEvent, objectEvent.channel, objectEvent.subscription);
	            if (object.type === 'uuid') {
	                const { message, channel } = objectEvent, restEvent = __rest(objectEvent, ["message", "channel"]);
	                const { event, type } = object, restObject = __rest(object, ["event", "type"]);
	                const userEvent = Object.assign(Object.assign({}, restEvent), { spaceId: channel, message: Object.assign(Object.assign({}, restObject), { event: event === 'set' ? 'updated' : 'removed', type: 'user' }) });
	                this.listenerManager.announceUser(userEvent);
	                this.announce('user', userEvent, userEvent.spaceId, userEvent.subscription);
	            }
	            else if (object.type === 'channel') {
	                const { message, channel } = objectEvent, restEvent = __rest(objectEvent, ["message", "channel"]);
	                const { event, type } = object, restObject = __rest(object, ["event", "type"]);
	                const spaceEvent = Object.assign(Object.assign({}, restEvent), { spaceId: channel, message: Object.assign(Object.assign({}, restObject), { event: event === 'set' ? 'updated' : 'removed', type: 'space' }) });
	                this.listenerManager.announceSpace(spaceEvent);
	                this.announce('space', spaceEvent, spaceEvent.spaceId, spaceEvent.subscription);
	            }
	            else if (object.type === 'membership') {
	                const { message, channel } = objectEvent, restEvent = __rest(objectEvent, ["message", "channel"]);
	                const { event, data } = object, restObject = __rest(object, ["event", "data"]);
	                const { uuid, channel: channelMeta } = data, restData = __rest(data, ["uuid", "channel"]);
	                const membershipEvent = Object.assign(Object.assign({}, restEvent), { spaceId: channel, message: Object.assign(Object.assign({}, restObject), { event: event === 'set' ? 'updated' : 'removed', data: Object.assign(Object.assign({}, restData), { user: uuid, space: channelMeta }) }) });
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
	    }
	    /**
	     * Register real-time event listener for specific channels and groups.
	     *
	     * @param listener - Listener with event callbacks to handle different types of events.
	     * @param channels - List of channels for which listener should be registered.
	     * @param groups - List of channel groups for which listener should be registered.
	     */
	    addListener(listener, channels, groups) {
	        // Register event-listener listener globally.
	        if (!(channels && groups)) {
	            this.listenerManager.addListener(listener);
	        }
	        else {
	            channels === null || channels === void 0 ? void 0 : channels.forEach((channel) => {
	                if (this.channelListenerMap.has(channel)) {
	                    const channelListeners = this.channelListenerMap.get(channel);
	                    if (!channelListeners.includes(listener))
	                        channelListeners.push(listener);
	                }
	                else
	                    this.channelListenerMap.set(channel, [listener]);
	            });
	            groups === null || groups === void 0 ? void 0 : groups.forEach((group) => {
	                if (this.groupListenerMap.has(group)) {
	                    const groupListeners = this.groupListenerMap.get(group);
	                    if (!groupListeners.includes(listener))
	                        groupListeners.push(listener);
	                }
	                else
	                    this.groupListenerMap.set(group, [listener]);
	            });
	        }
	    }
	    /**
	     * Remove real-time event listener.
	     *
	     * @param listener - Event listeners which should be removed.
	     * @param channels - List of channels for which listener should be removed.
	     * @param groups - List of channel groups for which listener should be removed.
	     */
	    removeListener(listener, channels, groups) {
	        if (!(channels && groups)) {
	            this.listenerManager.removeListener(listener);
	        }
	        else {
	            channels === null || channels === void 0 ? void 0 : channels.forEach((channel) => {
	                if (this.channelListenerMap.has(channel)) {
	                    this.channelListenerMap.set(channel, this.channelListenerMap.get(channel).filter((channelListener) => channelListener !== listener));
	                }
	            });
	            groups === null || groups === void 0 ? void 0 : groups.forEach((group) => {
	                if (this.groupListenerMap.has(group)) {
	                    this.groupListenerMap.set(group, this.groupListenerMap.get(group).filter((groupListener) => groupListener !== listener));
	                }
	            });
	        }
	    }
	    /**
	     * Clear all real-time event listeners.
	     */
	    removeAllListeners() {
	        this.listenerManager.removeAllListeners();
	        this.channelListenerMap.clear();
	        this.groupListenerMap.clear();
	    }
	    /**
	     * Announce real-time event to all listeners.
	     *
	     * @param type - Type of event which should be announced.
	     * @param event - Announced real-time event payload.
	     * @param channel - Name of the channel for which registered listeners should be notified.
	     * @param group - Name of the channel group for which registered listeners should be notified.
	     */
	    announce(type, event, channel, group) {
	        if (event && this.channelListenerMap.has(channel))
	            this.channelListenerMap.get(channel).forEach((listener) => {
	                const typedListener = listener[type];
	                // @ts-expect-error Dynamic events mapping.
	                if (typedListener)
	                    typedListener(event);
	            });
	        if (group && this.groupListenerMap.has(group))
	            this.groupListenerMap.get(group).forEach((listener) => {
	                const typedListener = listener[type];
	                // @ts-expect-error Dynamic events mapping.
	                if (typedListener)
	                    typedListener(event);
	            });
	    }
	}

	/**
	 * Event Engine terminate signal listener module.
	 *
	 * @internal
	 */
	/**
	 * @internal
	 */
	class Subject {
	    constructor(sync = false) {
	        this.sync = sync;
	        this.listeners = new Set();
	    }
	    subscribe(listener) {
	        this.listeners.add(listener);
	        return () => {
	            this.listeners.delete(listener);
	        };
	    }
	    notify(event) {
	        const wrapper = () => {
	            this.listeners.forEach((listener) => {
	                listener(event);
	            });
	        };
	        if (this.sync) {
	            wrapper();
	        }
	        else {
	            setTimeout(wrapper, 0);
	        }
	    }
	}

	/**
	 * Event Engine Core state module.
	 *
	 * @internal
	 */
	/**
	 * Event engine current state object.
	 *
	 * State contains current context and list of invocations which should be performed by the Event Engine.
	 *
	 * @internal
	 */
	class State {
	    transition(context, event) {
	        var _a;
	        if (this.transitionMap.has(event.type)) {
	            return (_a = this.transitionMap.get(event.type)) === null || _a === void 0 ? void 0 : _a(context, event);
	        }
	        return undefined;
	    }
	    constructor(label) {
	        this.label = label;
	        this.transitionMap = new Map();
	        this.enterEffects = [];
	        this.exitEffects = [];
	    }
	    on(eventType, transition) {
	        this.transitionMap.set(eventType, transition);
	        return this;
	    }
	    with(context, effects) {
	        return [this, context, effects !== null && effects !== void 0 ? effects : []];
	    }
	    onEnter(effect) {
	        this.enterEffects.push(effect);
	        return this;
	    }
	    onExit(effect) {
	        this.exitEffects.push(effect);
	        return this;
	    }
	}

	/**
	 * Event Engine Core module.
	 *
	 * @internal
	 */
	/* eslint-disable @typescript-eslint/no-explicit-any */
	/**
	 * Generic event engine.
	 *
	 * @internal
	 */
	class Engine extends Subject {
	    describe(label) {
	        return new State(label);
	    }
	    start(initialState, initialContext) {
	        this.currentState = initialState;
	        this.currentContext = initialContext;
	        this.notify({
	            type: 'engineStarted',
	            state: initialState,
	            context: initialContext,
	        });
	        return;
	    }
	    transition(event) {
	        if (!this.currentState) {
	            throw new Error('Start the engine first');
	        }
	        this.notify({
	            type: 'eventReceived',
	            event: event,
	        });
	        const transition = this.currentState.transition(this.currentContext, event);
	        if (transition) {
	            const [newState, newContext, effects] = transition;
	            for (const effect of this.currentState.exitEffects) {
	                this.notify({
	                    type: 'invocationDispatched',
	                    invocation: effect(this.currentContext),
	                });
	            }
	            const oldState = this.currentState;
	            this.currentState = newState;
	            const oldContext = this.currentContext;
	            this.currentContext = newContext;
	            this.notify({
	                type: 'transitionDone',
	                fromState: oldState,
	                fromContext: oldContext,
	                toState: newState,
	                toContext: newContext,
	                event: event,
	            });
	            for (const effect of effects) {
	                this.notify({
	                    type: 'invocationDispatched',
	                    invocation: effect,
	                });
	            }
	            for (const effect of this.currentState.enterEffects) {
	                this.notify({
	                    type: 'invocationDispatched',
	                    invocation: effect(this.currentContext),
	                });
	            }
	        }
	    }
	}

	/**
	 * Event Engine Core Effects dispatcher module.
	 *
	 * @internal
	 */
	/**
	 * Event Engine effects dispatcher.
	 *
	 * Dispatcher responsible for invocation enqueue and dequeue for processing.
	 *
	 * @internal
	 */
	class Dispatcher {
	    constructor(dependencies) {
	        this.dependencies = dependencies;
	        this.instances = new Map();
	        this.handlers = new Map();
	    }
	    on(type, handlerCreator) {
	        this.handlers.set(type, handlerCreator);
	    }
	    dispatch(invocation) {
	        if (invocation.type === 'CANCEL') {
	            if (this.instances.has(invocation.payload)) {
	                const instance = this.instances.get(invocation.payload);
	                instance === null || instance === void 0 ? void 0 : instance.cancel();
	                this.instances.delete(invocation.payload);
	            }
	            return;
	        }
	        const handlerCreator = this.handlers.get(invocation.type);
	        if (!handlerCreator) {
	            throw new Error(`Unhandled invocation '${invocation.type}'`);
	        }
	        const instance = handlerCreator(invocation.payload, this.dependencies);
	        if (invocation.managed) {
	            this.instances.set(invocation.type, instance);
	        }
	        instance.start();
	    }
	    dispose() {
	        for (const [key, instance] of this.instances.entries()) {
	            instance.cancel();
	            this.instances.delete(key);
	        }
	    }
	}

	/**
	 * Event Engine Core types module.
	 *
	 * @internal
	 */
	/**
	 * Create and configure event engine event.
	 *
	 * @internal
	 */
	function createEvent(type, fn) {
	    const creator = function (...args) {
	        return {
	            type,
	            payload: fn === null || fn === void 0 ? void 0 : fn(...args),
	        };
	    };
	    creator.type = type;
	    return creator;
	}
	/**
	 * Create and configure short-term effect invocation.
	 *
	 * @internal
	 */
	function createEffect(type, fn) {
	    const creator = (...args) => {
	        return { type, payload: fn(...args), managed: false };
	    };
	    creator.type = type;
	    return creator;
	}
	/**
	 * Create and configure long-running effect invocation.
	 *
	 * @internal
	 */
	function createManagedEffect(type, fn) {
	    const creator = (...args) => {
	        return { type, payload: fn(...args), managed: true };
	    };
	    creator.type = type;
	    creator.cancel = { type: 'CANCEL', payload: type, managed: false };
	    return creator;
	}

	/**
	 * Event Engine managed effects terminate signal module.
	 *
	 * @internal
	 */
	class AbortError extends Error {
	    constructor() {
	        super('The operation was aborted.');
	        this.name = 'AbortError';
	        Object.setPrototypeOf(this, new.target.prototype);
	    }
	}
	/**
	 * Event Engine stored effect processing cancellation signal.
	 *
	 * @internal
	 */
	class AbortSignal extends Subject {
	    constructor() {
	        super(...arguments);
	        this._aborted = false;
	    }
	    get aborted() {
	        return this._aborted;
	    }
	    throwIfAborted() {
	        if (this._aborted) {
	            throw new AbortError();
	        }
	    }
	    abort() {
	        this._aborted = true;
	        this.notify(new AbortError());
	    }
	}

	/**
	 * Event Engine Core Effects handler module.
	 *
	 * @internal
	 */
	/**
	 * Synchronous (short-term) effect invocation handler.
	 *
	 * Handler manages effect execution on behalf of effect dispatcher.
	 *
	 * @internal
	 */
	class Handler {
	    constructor(payload, dependencies) {
	        this.payload = payload;
	        this.dependencies = dependencies;
	    }
	}
	/**
	 * Asynchronous (long-running) effect invocation handler.
	 *
	 * Handler manages effect execution on behalf of effect dispatcher.
	 *
	 * @internal
	 */
	class AsyncHandler extends Handler {
	    constructor(payload, dependencies, asyncFunction) {
	        super(payload, dependencies);
	        this.asyncFunction = asyncFunction;
	        this.abortSignal = new AbortSignal();
	    }
	    start() {
	        this.asyncFunction(this.payload, this.abortSignal, this.dependencies).catch((error) => {
	            // console.log('Unhandled error:', error);
	            // swallow the error
	        });
	    }
	    cancel() {
	        this.abortSignal.abort();
	    }
	}
	/**
	 * Asynchronous effect invocation handler constructor.
	 *
	 * @param handlerFunction - Function which performs asynchronous action and should be called on `start`.
	 *
	 * @internal
	 */
	const asyncHandler = (handlerFunction) => (payload, dependencies) => new AsyncHandler(payload, dependencies, handlerFunction);

	/**
	 * Presence Event Engine events module.
	 *
	 * @internal
	 */
	/**
	 * Reconnect event.
	 *
	 * Event is sent each time when user restores real-time updates processing and notifies other present subscribers
	 * about joining back.
	 *
	 * @internal
	 */
	const reconnect$1 = createEvent('RECONNECT', () => ({}));
	/**
	 * Disconnect event.
	 *
	 * Event is sent when user wants to temporarily stop real-time updates processing and notifies other present
	 * subscribers about leaving.
	 *
	 * @internal
	 */
	const disconnect$1 = createEvent('DISCONNECT', () => ({}));
	/**
	 * Channel / group join event.
	 *
	 * Event is sent when user adds new channels / groups to the active channels / groups list and notifies other present
	 * subscribers about joining.
	 *
	 * @internal
	 */
	const joined = createEvent('JOINED', (channels, groups) => ({
	    channels,
	    groups,
	}));
	/**
	 * Channel / group leave event.
	 *
	 * Event is sent when user removes channels / groups from the active channels / groups list and notifies other present
	 * subscribers about leaving.
	 *
	 * @internal
	 */
	const left = createEvent('LEFT', (channels, groups) => ({
	    channels,
	    groups,
	}));
	/**
	 * Leave all event.
	 *
	 * Event is sent when user doesn't want to receive any real-time updates anymore and notifies other
	 * subscribers on previously active channels / groups about leaving.
	 *
	 * @internal
	 */
	const leftAll = createEvent('LEFT_ALL', () => ({}));
	/**
	 * Presence heartbeat success event.
	 *
	 * Event is sent by corresponding effect handler if REST API call was successful.
	 *
	 * @internal
	 */
	const heartbeatSuccess = createEvent('HEARTBEAT_SUCCESS', (statusCode) => ({ statusCode }));
	/**
	 * Presence heartbeat did fail event.
	 *
	 * Event is sent by corresponding effect handler if REST API call failed.
	 *
	 * @internal
	 */
	const heartbeatFailure = createEvent('HEARTBEAT_FAILURE', (error) => error);
	/**
	 * Presence heartbeat impossible event.
	 *
	 * Event is sent by corresponding effect handler if REST API call exhausted all retry attempt and won't try again.
	 *
	 * @internal
	 */
	const heartbeatGiveup = createEvent('HEARTBEAT_GIVEUP', () => ({}));
	/**
	 * Delayed presence heartbeat event.
	 *
	 * Event is sent by corresponding effect handler when delay timer between heartbeat calls fired.
	 *
	 * @internal
	 */
	const timesUp = createEvent('TIMES_UP', () => ({}));

	/**
	 * Presence Event Engine effects module.
	 *
	 * @internal
	 */
	/**
	 * Presence heartbeat effect.
	 *
	 * Performs presence heartbeat REST API call.
	 *
	 * @internal
	 */
	const heartbeat = createEffect('HEARTBEAT', (channels, groups) => ({
	    channels,
	    groups,
	}));
	/**
	 * Presence leave effect.
	 *
	 * Performs presence leave REST API call.
	 *
	 * @internal
	 */
	const leave = createEffect('LEAVE', (channels, groups) => ({
	    channels,
	    groups,
	}));
	/**
	 * Emit presence heartbeat REST API call result status effect.
	 *
	 * Notify status change event listeners.
	 *
	 * @internal
	 */
	/* eslint-disable  @typescript-eslint/no-explicit-any */
	const emitStatus$1 = createEffect('EMIT_STATUS', (status) => status);
	/**
	 * Heartbeat delay effect.
	 *
	 * Delay of configured length (heartbeat interval) before another heartbeat REST API call will be done.
	 *
	 * @internal
	 */
	const wait = createManagedEffect('WAIT', () => ({}));
	/**
	 * Delayed heartbeat effect.
	 *
	 * Similar to the {@link wait} effect but used in case if previous heartbeat call did fail.
	 *
	 * @internal
	 */
	const delayedHeartbeat = createManagedEffect('DELAYED_HEARTBEAT', (context) => context);

	/**
	 * Presence Event Engine effects dispatcher.
	 *
	 * @internal
	 */
	/**
	 * Presence Event Engine dispatcher.
	 *
	 * Dispatcher responsible for presence events handling and corresponding effects execution.
	 *
	 * @internal
	 */
	class PresenceEventEngineDispatcher extends Dispatcher {
	    constructor(engine, dependencies) {
	        super(dependencies);
	        this.on(heartbeat.type, asyncHandler((payload_1, _1, _a) => __awaiter(this, [payload_1, _1, _a], void 0, function* (payload, _, { heartbeat, presenceState, config }) {
	            try {
	                const result = yield heartbeat(Object.assign(Object.assign({ channels: payload.channels, channelGroups: payload.groups }, (config.maintainPresenceState && { state: presenceState })), { heartbeat: config.presenceTimeout }));
	                engine.transition(heartbeatSuccess(200));
	            }
	            catch (e) {
	                if (e instanceof PubNubError) {
	                    if (e.status && e.status.category == StatusCategory$1.PNCancelledCategory)
	                        return;
	                    return engine.transition(heartbeatFailure(e));
	                }
	            }
	        })));
	        this.on(leave.type, asyncHandler((payload_1, _1, _a) => __awaiter(this, [payload_1, _1, _a], void 0, function* (payload, _, { leave, config }) {
	            if (!config.suppressLeaveEvents) {
	                try {
	                    leave({
	                        channels: payload.channels,
	                        channelGroups: payload.groups,
	                    });
	                }
	                catch (e) { }
	            }
	        })));
	        this.on(wait.type, asyncHandler((_1, abortSignal_1, _a) => __awaiter(this, [_1, abortSignal_1, _a], void 0, function* (_, abortSignal, { heartbeatDelay }) {
	            abortSignal.throwIfAborted();
	            yield heartbeatDelay();
	            abortSignal.throwIfAborted();
	            return engine.transition(timesUp());
	        })));
	        this.on(delayedHeartbeat.type, asyncHandler((payload_1, abortSignal_1, _a) => __awaiter(this, [payload_1, abortSignal_1, _a], void 0, function* (payload, abortSignal, { heartbeat, retryDelay, presenceState, config }) {
	            if (config.retryConfiguration && config.retryConfiguration.shouldRetry(payload.reason, payload.attempts)) {
	                abortSignal.throwIfAborted();
	                yield retryDelay(config.retryConfiguration.getDelay(payload.attempts, payload.reason));
	                abortSignal.throwIfAborted();
	                try {
	                    const result = yield heartbeat(Object.assign(Object.assign({ channels: payload.channels, channelGroups: payload.groups }, (config.maintainPresenceState && { state: presenceState })), { heartbeat: config.presenceTimeout }));
	                    return engine.transition(heartbeatSuccess(200));
	                }
	                catch (e) {
	                    if (e instanceof PubNubError) {
	                        if (e.status && e.status.category == StatusCategory$1.PNCancelledCategory)
	                            return;
	                        return engine.transition(heartbeatFailure(e));
	                    }
	                }
	            }
	            else {
	                return engine.transition(heartbeatGiveup());
	            }
	        })));
	        this.on(emitStatus$1.type, asyncHandler((payload_1, _1, _a) => __awaiter(this, [payload_1, _1, _a], void 0, function* (payload, _, { emitStatus, config }) {
	            var _b;
	            if (config.announceFailedHeartbeats && ((_b = payload === null || payload === void 0 ? void 0 : payload.status) === null || _b === void 0 ? void 0 : _b.error) === true) {
	                emitStatus(payload.status);
	            }
	            else if (config.announceSuccessfulHeartbeats && payload.statusCode === 200) {
	                emitStatus(Object.assign(Object.assign({}, payload), { operation: RequestOperation$1.PNHeartbeatOperation, error: false }));
	            }
	        })));
	    }
	}

	/**
	 * Heartbeat stopped state module.
	 *
	 * @internal
	 */
	/**
	 * Heartbeat stopped state.
	 *
	 * State in which Presence Event Engine still has information about active channels / groups, but doesn't wait for
	 * delayed heartbeat request sending.
	 *
	 * @internal
	 */
	const HeartbeatStoppedState = new State('HEARTBEAT_STOPPED');
	HeartbeatStoppedState.on(joined.type, (context, event) => HeartbeatStoppedState.with({
	    channels: [...context.channels, ...event.payload.channels],
	    groups: [...context.groups, ...event.payload.groups],
	}));
	HeartbeatStoppedState.on(left.type, (context, event) => HeartbeatStoppedState.with({
	    channels: context.channels.filter((channel) => !event.payload.channels.includes(channel)),
	    groups: context.groups.filter((group) => !event.payload.groups.includes(group)),
	}));
	HeartbeatStoppedState.on(reconnect$1.type, (context, _) => HeartbeatingState.with({
	    channels: context.channels,
	    groups: context.groups,
	}));
	HeartbeatStoppedState.on(leftAll.type, (context, _) => HeartbeatInactiveState.with(undefined));

	/**
	 * Waiting next heartbeat state module.
	 *
	 * @internal
	 */
	/**
	 * Waiting next heartbeat state.
	 *
	 * State in which Presence Event Engine is waiting when delay will run out and next heartbeat call should be done.
	 *
	 * @internal
	 */
	const HeartbeatCooldownState = new State('HEARTBEAT_COOLDOWN');
	HeartbeatCooldownState.onEnter(() => wait());
	HeartbeatCooldownState.onExit(() => wait.cancel);
	HeartbeatCooldownState.on(timesUp.type, (context, _) => HeartbeatingState.with({
	    channels: context.channels,
	    groups: context.groups,
	}));
	HeartbeatCooldownState.on(joined.type, (context, event) => HeartbeatingState.with({
	    channels: [...context.channels, ...event.payload.channels],
	    groups: [...context.groups, ...event.payload.groups],
	}));
	HeartbeatCooldownState.on(left.type, (context, event) => HeartbeatingState.with({
	    channels: context.channels.filter((channel) => !event.payload.channels.includes(channel)),
	    groups: context.groups.filter((group) => !event.payload.groups.includes(group)),
	}, [leave(event.payload.channels, event.payload.groups)]));
	HeartbeatCooldownState.on(disconnect$1.type, (context) => HeartbeatStoppedState.with({
	    channels: context.channels,
	    groups: context.groups,
	}, [leave(context.channels, context.groups)]));
	HeartbeatCooldownState.on(leftAll.type, (context, _) => HeartbeatInactiveState.with(undefined, [leave(context.channels, context.groups)]));

	/**
	 * Failed to heartbeat state module.
	 *
	 * @internal
	 */
	/**
	 * Failed to heartbeat state.
	 *
	 * State in which Subscription Event Engine waits for user to try to reconnect after all retry attempts has been
	 * exhausted.
	 *
	 * @internal
	 */
	const HeartbeatFailedState = new State('HEARTBEAT_FAILED');
	HeartbeatFailedState.on(joined.type, (context, event) => HeartbeatingState.with({
	    channels: [...context.channels, ...event.payload.channels],
	    groups: [...context.groups, ...event.payload.groups],
	}));
	HeartbeatFailedState.on(left.type, (context, event) => HeartbeatingState.with({
	    channels: context.channels.filter((channel) => !event.payload.channels.includes(channel)),
	    groups: context.groups.filter((group) => !event.payload.groups.includes(group)),
	}, [leave(event.payload.channels, event.payload.groups)]));
	HeartbeatFailedState.on(reconnect$1.type, (context, _) => HeartbeatingState.with({
	    channels: context.channels,
	    groups: context.groups,
	}));
	HeartbeatFailedState.on(disconnect$1.type, (context, _) => HeartbeatStoppedState.with({
	    channels: context.channels,
	    groups: context.groups,
	}, [leave(context.channels, context.groups)]));
	HeartbeatFailedState.on(leftAll.type, (context, _) => HeartbeatInactiveState.with(undefined, [leave(context.channels, context.groups)]));

	/**
	 * Retry heartbeat state module.
	 *
	 * @internal
	 */
	/**
	 * Retry heartbeat state.
	 *
	 * State in which Presence Event Engine tries to recover after error which happened before.
	 *
	 * @internal
	 */
	const HearbeatReconnectingState = new State('HEARBEAT_RECONNECTING');
	HearbeatReconnectingState.onEnter((context) => delayedHeartbeat(context));
	HearbeatReconnectingState.onExit(() => delayedHeartbeat.cancel);
	HearbeatReconnectingState.on(joined.type, (context, event) => HeartbeatingState.with({
	    channels: [...context.channels, ...event.payload.channels],
	    groups: [...context.groups, ...event.payload.groups],
	}));
	HearbeatReconnectingState.on(left.type, (context, event) => HeartbeatingState.with({
	    channels: context.channels.filter((channel) => !event.payload.channels.includes(channel)),
	    groups: context.groups.filter((group) => !event.payload.groups.includes(group)),
	}, [leave(event.payload.channels, event.payload.groups)]));
	HearbeatReconnectingState.on(disconnect$1.type, (context, _) => {
	    HeartbeatStoppedState.with({
	        channels: context.channels,
	        groups: context.groups,
	    }, [leave(context.channels, context.groups)]);
	});
	HearbeatReconnectingState.on(heartbeatSuccess.type, (context, event) => {
	    return HeartbeatCooldownState.with({
	        channels: context.channels,
	        groups: context.groups,
	    });
	});
	HearbeatReconnectingState.on(heartbeatFailure.type, (context, event) => HearbeatReconnectingState.with(Object.assign(Object.assign({}, context), { attempts: context.attempts + 1, reason: event.payload })));
	HearbeatReconnectingState.on(heartbeatGiveup.type, (context, event) => {
	    return HeartbeatFailedState.with({
	        channels: context.channels,
	        groups: context.groups,
	    });
	});
	HearbeatReconnectingState.on(leftAll.type, (context, _) => HeartbeatInactiveState.with(undefined, [leave(context.channels, context.groups)]));

	/**
	 * Heartbeating state module.
	 *
	 * @internal
	 */
	/**
	 * Heartbeating state module.
	 *
	 * State in which Presence Event Engine send heartbeat REST API call.
	 *
	 * @internal
	 */
	const HeartbeatingState = new State('HEARTBEATING');
	HeartbeatingState.onEnter((context) => heartbeat(context.channels, context.groups));
	HeartbeatingState.on(heartbeatSuccess.type, (context, event) => {
	    return HeartbeatCooldownState.with({
	        channels: context.channels,
	        groups: context.groups,
	    });
	});
	HeartbeatingState.on(joined.type, (context, event) => HeartbeatingState.with({
	    channels: [...context.channels, ...event.payload.channels],
	    groups: [...context.groups, ...event.payload.groups],
	}));
	HeartbeatingState.on(left.type, (context, event) => {
	    return HeartbeatingState.with({
	        channels: context.channels.filter((channel) => !event.payload.channels.includes(channel)),
	        groups: context.groups.filter((group) => !event.payload.groups.includes(group)),
	    }, [leave(event.payload.channels, event.payload.groups)]);
	});
	HeartbeatingState.on(heartbeatFailure.type, (context, event) => {
	    return HearbeatReconnectingState.with(Object.assign(Object.assign({}, context), { attempts: 0, reason: event.payload }));
	});
	HeartbeatingState.on(disconnect$1.type, (context) => HeartbeatStoppedState.with({
	    channels: context.channels,
	    groups: context.groups,
	}, [leave(context.channels, context.groups)]));
	HeartbeatingState.on(leftAll.type, (context, _) => HeartbeatInactiveState.with(undefined, [leave(context.channels, context.groups)]));

	/**
	 * Inactive heratbeating state module.
	 *
	 * @internal
	 */
	/**
	 * Inactive heratbeating state
	 *
	 * State in which Presence Event Engine doesn't process any heartbeat requests (initial state).
	 *
	 * @internal
	 */
	const HeartbeatInactiveState = new State('HEARTBEAT_INACTIVE');
	HeartbeatInactiveState.on(joined.type, (_, event) => HeartbeatingState.with({
	    channels: event.payload.channels,
	    groups: event.payload.groups,
	}));

	/**
	 * Presence Event Engine module.
	 *
	 * @internal
	 */
	/**
	 * Presence Event Engine Core.
	 *
	 * @internal
	 */
	class PresenceEventEngine {
	    get _engine() {
	        return this.engine;
	    }
	    constructor(dependencies) {
	        this.dependencies = dependencies;
	        this.engine = new Engine();
	        this.channels = [];
	        this.groups = [];
	        this.dispatcher = new PresenceEventEngineDispatcher(this.engine, dependencies);
	        this._unsubscribeEngine = this.engine.subscribe((change) => {
	            if (change.type === 'invocationDispatched') {
	                this.dispatcher.dispatch(change.invocation);
	            }
	        });
	        this.engine.start(HeartbeatInactiveState, undefined);
	    }
	    join({ channels, groups }) {
	        this.channels = [...this.channels, ...(channels !== null && channels !== void 0 ? channels : [])];
	        this.groups = [...this.groups, ...(groups !== null && groups !== void 0 ? groups : [])];
	        this.engine.transition(joined(this.channels.slice(0), this.groups.slice(0)));
	    }
	    leave({ channels, groups }) {
	        if (this.dependencies.presenceState) {
	            channels === null || channels === void 0 ? void 0 : channels.forEach((c) => delete this.dependencies.presenceState[c]);
	            groups === null || groups === void 0 ? void 0 : groups.forEach((g) => delete this.dependencies.presenceState[g]);
	        }
	        this.engine.transition(left(channels !== null && channels !== void 0 ? channels : [], groups !== null && groups !== void 0 ? groups : []));
	    }
	    leaveAll() {
	        this.engine.transition(leftAll());
	    }
	    dispose() {
	        this._unsubscribeEngine();
	        this.dispatcher.dispose();
	    }
	}

	/**
	 * Failed request retry policy.
	 */
	class RetryPolicy {
	    static LinearRetryPolicy(configuration) {
	        return {
	            delay: configuration.delay,
	            maximumRetry: configuration.maximumRetry,
	            /* eslint-disable  @typescript-eslint/no-explicit-any */
	            shouldRetry(error, attempt) {
	                var _a;
	                if (((_a = error === null || error === void 0 ? void 0 : error.status) === null || _a === void 0 ? void 0 : _a.statusCode) === 403) {
	                    return false;
	                }
	                return this.maximumRetry > attempt;
	            },
	            getDelay(_, reason) {
	                var _a;
	                const delay = (_a = reason.retryAfter) !== null && _a !== void 0 ? _a : this.delay;
	                return (delay + Math.random()) * 1000;
	            },
	            /* eslint-disable  @typescript-eslint/no-explicit-any */
	            getGiveupReason(error, attempt) {
	                var _a;
	                if (this.maximumRetry <= attempt) {
	                    return 'retry attempts exhaused.';
	                }
	                if (((_a = error === null || error === void 0 ? void 0 : error.status) === null || _a === void 0 ? void 0 : _a.statusCode) === 403) {
	                    return 'forbidden operation.';
	                }
	                return 'unknown error';
	            },
	            validate() {
	                if (this.maximumRetry > 10)
	                    throw new Error('Maximum retry for linear retry policy can not be more than 10');
	            },
	        };
	    }
	    static ExponentialRetryPolicy(configuration) {
	        return {
	            minimumDelay: configuration.minimumDelay,
	            maximumDelay: configuration.maximumDelay,
	            maximumRetry: configuration.maximumRetry,
	            shouldRetry(reason, attempt) {
	                var _a;
	                if (((_a = reason === null || reason === void 0 ? void 0 : reason.status) === null || _a === void 0 ? void 0 : _a.statusCode) === 403) {
	                    return false;
	                }
	                return this.maximumRetry > attempt;
	            },
	            getDelay(attempt, reason) {
	                var _a;
	                const delay = (_a = reason.retryAfter) !== null && _a !== void 0 ? _a : Math.min(Math.pow(2, attempt), this.maximumDelay);
	                return (delay + Math.random()) * 1000;
	            },
	            getGiveupReason(reason, attempt) {
	                var _a;
	                if (this.maximumRetry <= attempt) {
	                    return 'retry attempts exhausted.';
	                }
	                if (((_a = reason === null || reason === void 0 ? void 0 : reason.status) === null || _a === void 0 ? void 0 : _a.statusCode) === 403) {
	                    return 'forbidden operation.';
	                }
	                return 'unknown error';
	            },
	            validate() {
	                if (this.minimumDelay < 2)
	                    throw new Error('Minimum delay can not be set less than 2 seconds for retry');
	                else if (this.maximumDelay)
	                    throw new Error('Maximum delay can not be set more than 150 seconds for retry');
	                else if (this.maximumRetry > 6)
	                    throw new Error('Maximum retry for exponential retry policy can not be more than 6');
	            },
	        };
	    }
	}

	/**
	 * Subscribe Event Engine effects module.
	 *
	 * @internal
	 */
	/**
	 * Initial subscription effect.
	 *
	 * Performs subscribe REST API call with `tt=0`.
	 *
	 * @internal
	 */
	const handshake = createManagedEffect('HANDSHAKE', (channels, groups) => ({
	    channels,
	    groups,
	}));
	/**
	 * Real-time updates receive effect.
	 *
	 * Performs sequential subscribe REST API call with `tt` set to the value received from the previous subscribe
	 * REST API call.
	 *
	 * @internal
	 */
	const receiveMessages = createManagedEffect('RECEIVE_MESSAGES', (channels, groups, cursor) => ({ channels, groups, cursor }));
	/**
	 * Emit real-time updates effect.
	 *
	 * Notify event listeners about updates for which listener handlers has been provided.
	 *
	 * @internal
	 */
	const emitMessages = createEffect('EMIT_MESSAGES', (events) => events);
	/**
	 * Emit subscription status change effect.
	 *
	 * Notify status change event listeners.
	 *
	 * @internal
	 */
	const emitStatus = createEffect('EMIT_STATUS', (status) => status);
	/**
	 * Real-time updates receive restore effect.
	 *
	 * Performs subscribe REST API call with `tt` which has been received before disconnection or error.
	 *
	 * @internal
	 */
	const receiveReconnect = createManagedEffect('RECEIVE_RECONNECT', (context) => context);
	/**
	 * Initial subscription restore effect.
	 *
	 * Performs subscribe REST API call with `tt=0` after error.
	 *
	 * @internal
	 */
	const handshakeReconnect = createManagedEffect('HANDSHAKE_RECONNECT', (context) => context);

	/**
	 * Subscribe Event Engine events module.
	 *
	 * @internal
	 */
	/**
	 * Subscription list change event.
	 *
	 * Event is sent each time when user would like to change list of active channels / groups.
	 *
	 * @internal
	 */
	const subscriptionChange = createEvent('SUBSCRIPTION_CHANGED', (channels, groups) => ({
	    channels,
	    groups,
	}));
	/**
	 * Subscription loop restore.
	 *
	 * Event is sent when user would like to try catch up on missed updates by providing specific timetoken.
	 *
	 * @internal
	 */
	const restore = createEvent('SUBSCRIPTION_RESTORED', (channels, groups, timetoken, region) => ({
	    channels,
	    groups,
	    cursor: {
	        timetoken: timetoken,
	        region: region !== null && region !== void 0 ? region : 0,
	    },
	}));
	/**
	 * Initial subscription handshake success event.
	 *
	 * Event is sent by corresponding effect handler if REST API call was successful.
	 *
	 * @internal
	 */
	const handshakeSuccess = createEvent('HANDSHAKE_SUCCESS', (cursor) => cursor);
	/**
	 * Initial subscription handshake did fail event.
	 *
	 * Event is sent by corresponding effect handler if REST API call failed.
	 *
	 * @internal
	 */
	const handshakeFailure = createEvent('HANDSHAKE_FAILURE', (error) => error);
	/**
	 * Initial subscription handshake reconnect success event.
	 *
	 * Event is sent by corresponding effect handler if REST API call was successful after transition to the failed state.
	 *
	 * @internal
	 */
	const handshakeReconnectSuccess = createEvent('HANDSHAKE_RECONNECT_SUCCESS', (cursor) => ({
	    cursor,
	}));
	/**
	 * Initial subscription handshake reconnect did fail event.
	 *
	 * Event is sent by corresponding effect handler if REST API call did fail while tried to enter to the success state.
	 *
	 * @internal
	 */
	const handshakeReconnectFailure = createEvent('HANDSHAKE_RECONNECT_FAILURE', (error) => error);
	/**
	 * Initial subscription handshake impossible event.
	 *
	 * Event is sent by corresponding effect handler if REST API call exhausted all retry attempt and won't try again.
	 *
	 * @internal
	 */
	const handshakeReconnectGiveup = createEvent('HANDSHAKE_RECONNECT_GIVEUP', (error) => error);
	/**
	 * Subscription successfully received real-time updates event.
	 *
	 * Event is sent by corresponding effect handler if REST API call was successful.
	 *
	 * @internal
	 */
	const receiveSuccess = createEvent('RECEIVE_SUCCESS', (cursor, events) => ({
	    cursor,
	    events,
	}));
	/**
	 * Subscription did fail to receive real-time updates event.
	 *
	 * Event is sent by corresponding effect handler if REST API call failed.
	 *
	 * @internal
	 */
	const receiveFailure = createEvent('RECEIVE_FAILURE', (error) => error);
	/**
	 * Subscription successfully received real-time updates on reconnection attempt event.
	 *
	 * Event is sent by corresponding effect handler if REST API call was successful after transition to the failed state.
	 *
	 * @internal
	 */
	const receiveReconnectSuccess = createEvent('RECEIVE_RECONNECT_SUCCESS', (cursor, events) => ({
	    cursor,
	    events,
	}));
	/**
	 * Subscription did fail to receive real-time updates on reconnection attempt event.
	 *
	 * Event is sent by corresponding effect handler if REST API call did fail while tried to enter to the success state.
	 *
	 * @internal
	 */
	const receiveReconnectFailure = createEvent('RECEIVE_RECONNECT_FAILURE', (error) => error);
	/**
	 * Subscription real-time updates received impossible event.
	 *
	 * Event is sent by corresponding effect handler if REST API call exhausted all retry attempt and won't try again.
	 *
	 * @internal
	 */
	const receiveReconnectGiveup = createEvent('RECEIVING_RECONNECT_GIVEUP', (error) => error);
	/**
	 * Client disconnect event.
	 *
	 * Event is sent when user wants to temporarily stop real-time updates receive.
	 *
	 * @internal
	 */
	const disconnect = createEvent('DISCONNECT', () => ({}));
	/**
	 * Client reconnect event.
	 *
	 * Event is sent when user wants to restore real-time updates receive.
	 *
	 * @internal
	 */
	const reconnect = createEvent('RECONNECT', (timetoken, region) => ({
	    cursor: {
	        timetoken: timetoken !== null && timetoken !== void 0 ? timetoken : '',
	        region: region !== null && region !== void 0 ? region : 0,
	    },
	}));
	/**
	 * Completely stop real-time updates receive event.
	 *
	 * Event is sent when user doesn't want to receive any real-time updates anymore.
	 *
	 * @internal
	 */
	const unsubscribeAll = createEvent('UNSUBSCRIBE_ALL', () => ({}));

	/**
	 * Subscribe Event Engine effects dispatcher.
	 *
	 * @internal
	 */
	/**
	 * Subscribe Event Engine dispatcher.
	 *
	 * Dispatcher responsible for subscription events handling and corresponding effects execution.
	 *
	 * @internal
	 */
	class EventEngineDispatcher extends Dispatcher {
	    constructor(engine, dependencies) {
	        super(dependencies);
	        this.on(handshake.type, asyncHandler((payload_1, abortSignal_1, _a) => __awaiter(this, [payload_1, abortSignal_1, _a], void 0, function* (payload, abortSignal, { handshake, presenceState, config }) {
	            abortSignal.throwIfAborted();
	            try {
	                const result = yield handshake(Object.assign({ abortSignal: abortSignal, channels: payload.channels, channelGroups: payload.groups, filterExpression: config.filterExpression }, (config.maintainPresenceState && { state: presenceState })));
	                return engine.transition(handshakeSuccess(result));
	            }
	            catch (e) {
	                if (e instanceof PubNubError) {
	                    if (e.status && e.status.category == StatusCategory$1.PNCancelledCategory)
	                        return;
	                    return engine.transition(handshakeFailure(e));
	                }
	            }
	        })));
	        this.on(receiveMessages.type, asyncHandler((payload_1, abortSignal_1, _a) => __awaiter(this, [payload_1, abortSignal_1, _a], void 0, function* (payload, abortSignal, { receiveMessages, config }) {
	            abortSignal.throwIfAborted();
	            try {
	                const result = yield receiveMessages({
	                    abortSignal: abortSignal,
	                    channels: payload.channels,
	                    channelGroups: payload.groups,
	                    timetoken: payload.cursor.timetoken,
	                    region: payload.cursor.region,
	                    filterExpression: config.filterExpression,
	                });
	                engine.transition(receiveSuccess(result.cursor, result.messages));
	            }
	            catch (error) {
	                if (error instanceof PubNubError) {
	                    if (error.status && error.status.category == StatusCategory$1.PNCancelledCategory)
	                        return;
	                    if (!abortSignal.aborted)
	                        return engine.transition(receiveFailure(error));
	                }
	            }
	        })));
	        this.on(emitMessages.type, asyncHandler((payload_1, _1, _a) => __awaiter(this, [payload_1, _1, _a], void 0, function* (payload, _, { emitMessages }) {
	            if (payload.length > 0) {
	                emitMessages(payload);
	            }
	        })));
	        this.on(emitStatus.type, asyncHandler((payload_1, _1, _a) => __awaiter(this, [payload_1, _1, _a], void 0, function* (payload, _, { emitStatus }) {
	            emitStatus(payload);
	        })));
	        this.on(receiveReconnect.type, asyncHandler((payload_1, abortSignal_1, _a) => __awaiter(this, [payload_1, abortSignal_1, _a], void 0, function* (payload, abortSignal, { receiveMessages, delay, config }) {
	            if (config.retryConfiguration && config.retryConfiguration.shouldRetry(payload.reason, payload.attempts)) {
	                abortSignal.throwIfAborted();
	                yield delay(config.retryConfiguration.getDelay(payload.attempts, payload.reason));
	                abortSignal.throwIfAborted();
	                try {
	                    const result = yield receiveMessages({
	                        abortSignal: abortSignal,
	                        channels: payload.channels,
	                        channelGroups: payload.groups,
	                        timetoken: payload.cursor.timetoken,
	                        region: payload.cursor.region,
	                        filterExpression: config.filterExpression,
	                    });
	                    return engine.transition(receiveReconnectSuccess(result.cursor, result.messages));
	                }
	                catch (error) {
	                    if (error instanceof PubNubError) {
	                        if (error.status && error.status.category == StatusCategory$1.PNCancelledCategory)
	                            return;
	                        return engine.transition(receiveReconnectFailure(error));
	                    }
	                }
	            }
	            else {
	                return engine.transition(receiveReconnectGiveup(new PubNubError(config.retryConfiguration
	                    ? config.retryConfiguration.getGiveupReason(payload.reason, payload.attempts)
	                    : 'Unable to complete subscribe messages receive.')));
	            }
	        })));
	        this.on(handshakeReconnect.type, asyncHandler((payload_1, abortSignal_1, _a) => __awaiter(this, [payload_1, abortSignal_1, _a], void 0, function* (payload, abortSignal, { handshake, delay, presenceState, config }) {
	            if (config.retryConfiguration && config.retryConfiguration.shouldRetry(payload.reason, payload.attempts)) {
	                abortSignal.throwIfAborted();
	                yield delay(config.retryConfiguration.getDelay(payload.attempts, payload.reason));
	                abortSignal.throwIfAborted();
	                try {
	                    const result = yield handshake(Object.assign({ abortSignal: abortSignal, channels: payload.channels, channelGroups: payload.groups, filterExpression: config.filterExpression }, (config.maintainPresenceState && { state: presenceState })));
	                    return engine.transition(handshakeReconnectSuccess(result));
	                }
	                catch (error) {
	                    if (error instanceof PubNubError) {
	                        if (error.status && error.status.category == StatusCategory$1.PNCancelledCategory)
	                            return;
	                        return engine.transition(handshakeReconnectFailure(error));
	                    }
	                }
	            }
	            else {
	                return engine.transition(handshakeReconnectGiveup(new PubNubError(config.retryConfiguration
	                    ? config.retryConfiguration.getGiveupReason(payload.reason, payload.attempts)
	                    : 'Unable to complete subscribe handshake')));
	            }
	        })));
	    }
	}

	/**
	 * Failed initial subscription handshake (disconnected) state.
	 *
	 * @internal
	 */
	/**
	 * Failed initial subscription handshake (disconnected) state.
	 *
	 * State in which Subscription Event Engine waits for user to try to reconnect after all retry attempts has been
	 * exhausted.
	 *
	 * @internal
	 */
	const HandshakeFailedState = new State('HANDSHAKE_FAILED');
	HandshakeFailedState.on(subscriptionChange.type, (context, event) => HandshakingState.with({
	    channels: event.payload.channels,
	    groups: event.payload.groups,
	    cursor: context.cursor,
	}));
	HandshakeFailedState.on(reconnect.type, (context, event) => HandshakingState.with({
	    channels: context.channels,
	    groups: context.groups,
	    cursor: event.payload.cursor || context.cursor,
	}));
	HandshakeFailedState.on(restore.type, (context, event) => {
	    var _a, _b;
	    return HandshakingState.with({
	        channels: event.payload.channels,
	        groups: event.payload.groups,
	        cursor: {
	            timetoken: event.payload.cursor.timetoken,
	            region: event.payload.cursor.region ? event.payload.cursor.region : ((_b = (_a = context === null || context === void 0 ? void 0 : context.cursor) === null || _a === void 0 ? void 0 : _a.region) !== null && _b !== void 0 ? _b : 0),
	        },
	    });
	});
	HandshakeFailedState.on(unsubscribeAll.type, (_) => UnsubscribedState.with());

	/**
	 * Stopped initial subscription handshake (disconnected) state.
	 *
	 * @internal
	 */
	/**
	 * Stopped initial subscription handshake (disconnected) state.
	 *
	 * State in which Subscription Event Engine still has information about subscription but doesn't have subscription
	 * cursor for next sequential subscribe REST API call.
	 *
	 * @internal
	 */
	const HandshakeStoppedState = new State('HANDSHAKE_STOPPED');
	HandshakeStoppedState.on(subscriptionChange.type, (context, event) => HandshakeStoppedState.with({
	    channels: event.payload.channels,
	    groups: event.payload.groups,
	    cursor: context.cursor,
	}));
	HandshakeStoppedState.on(reconnect.type, (context, event) => HandshakingState.with(Object.assign(Object.assign({}, context), { cursor: event.payload.cursor || context.cursor })));
	HandshakeStoppedState.on(restore.type, (context, event) => {
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
	HandshakeStoppedState.on(unsubscribeAll.type, (_) => UnsubscribedState.with());

	/**
	 * Failed to receive real-time updates (disconnected) state.
	 *
	 * @internal
	 */
	/**
	 * Failed to receive real-time updates (disconnected) state.
	 *
	 * State in which Subscription Event Engine waits for user to try to reconnect after all retry attempts has been
	 * exhausted.
	 *
	 * @internal
	 */
	const ReceiveFailedState = new State('RECEIVE_FAILED');
	ReceiveFailedState.on(reconnect.type, (context, event) => {
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
	ReceiveFailedState.on(subscriptionChange.type, (context, event) => HandshakingState.with({
	    channels: event.payload.channels,
	    groups: event.payload.groups,
	    cursor: context.cursor,
	}));
	ReceiveFailedState.on(restore.type, (context, event) => HandshakingState.with({
	    channels: event.payload.channels,
	    groups: event.payload.groups,
	    cursor: {
	        timetoken: event.payload.cursor.timetoken,
	        region: event.payload.cursor.region || context.cursor.region,
	    },
	}));
	ReceiveFailedState.on(unsubscribeAll.type, (_) => UnsubscribedState.with(undefined));

	/**
	 * Stopped real-time updates (disconnected) state module.
	 *
	 * @internal
	 */
	/**
	 * Stopped real-time updates (disconnected) state.
	 *
	 * State in which Subscription Event Engine still has information about subscription but doesn't process real-time
	 * updates.
	 *
	 * @internal
	 */
	const ReceiveStoppedState = new State('RECEIVE_STOPPED');
	ReceiveStoppedState.on(subscriptionChange.type, (context, event) => ReceiveStoppedState.with({
	    channels: event.payload.channels,
	    groups: event.payload.groups,
	    cursor: context.cursor,
	}));
	ReceiveStoppedState.on(restore.type, (context, event) => ReceiveStoppedState.with({
	    channels: event.payload.channels,
	    groups: event.payload.groups,
	    cursor: {
	        timetoken: event.payload.cursor.timetoken,
	        region: event.payload.cursor.region || context.cursor.region,
	    },
	}));
	ReceiveStoppedState.on(reconnect.type, (context, event) => {
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
	ReceiveStoppedState.on(unsubscribeAll.type, () => UnsubscribedState.with(undefined));

	/**
	 * Reconnect to receive real-time updates (disconnected) state.
	 *
	 * @internal
	 */
	/**
	 * Reconnect to receive real-time updates (disconnected) state.
	 *
	 * State in which Subscription Event Engine tries to recover after error which happened before.
	 *
	 * @internal
	 */
	const ReceiveReconnectingState = new State('RECEIVE_RECONNECTING');
	ReceiveReconnectingState.onEnter((context) => receiveReconnect(context));
	ReceiveReconnectingState.onExit(() => receiveReconnect.cancel);
	ReceiveReconnectingState.on(receiveReconnectSuccess.type, (context, event) => ReceivingState.with({
	    channels: context.channels,
	    groups: context.groups,
	    cursor: event.payload.cursor,
	}, [emitMessages(event.payload.events)]));
	ReceiveReconnectingState.on(receiveReconnectFailure.type, (context, event) => ReceiveReconnectingState.with(Object.assign(Object.assign({}, context), { attempts: context.attempts + 1, reason: event.payload })));
	ReceiveReconnectingState.on(receiveReconnectGiveup.type, (context, event) => {
	    var _a;
	    return ReceiveFailedState.with({
	        groups: context.groups,
	        channels: context.channels,
	        cursor: context.cursor,
	        reason: event.payload,
	    }, [emitStatus({ category: StatusCategory$1.PNDisconnectedUnexpectedlyCategory, error: (_a = event.payload) === null || _a === void 0 ? void 0 : _a.message })]);
	});
	ReceiveReconnectingState.on(disconnect.type, (context) => ReceiveStoppedState.with({
	    channels: context.channels,
	    groups: context.groups,
	    cursor: context.cursor,
	}, [emitStatus({ category: StatusCategory$1.PNDisconnectedCategory })]));
	ReceiveReconnectingState.on(restore.type, (context, event) => ReceivingState.with({
	    channels: event.payload.channels,
	    groups: event.payload.groups,
	    cursor: {
	        timetoken: event.payload.cursor.timetoken,
	        region: event.payload.cursor.region || context.cursor.region,
	    },
	}));
	ReceiveReconnectingState.on(subscriptionChange.type, (context, event) => ReceivingState.with({
	    channels: event.payload.channels,
	    groups: event.payload.groups,
	    cursor: context.cursor,
	}));
	ReceiveReconnectingState.on(unsubscribeAll.type, (_) => UnsubscribedState.with(undefined, [emitStatus({ category: StatusCategory$1.PNDisconnectedCategory })]));

	/**
	 * Receiving real-time updates (connected) state module.
	 *
	 * @internal
	 */
	/**
	 * Receiving real-time updates (connected) state.
	 *
	 * State in which Subscription Event Engine processes any real-time updates.
	 *
	 * @internal
	 */
	const ReceivingState = new State('RECEIVING');
	ReceivingState.onEnter((context) => receiveMessages(context.channels, context.groups, context.cursor));
	ReceivingState.onExit(() => receiveMessages.cancel);
	ReceivingState.on(receiveSuccess.type, (context, event) => {
	    return ReceivingState.with({ channels: context.channels, groups: context.groups, cursor: event.payload.cursor }, [
	        emitMessages(event.payload.events),
	    ]);
	});
	ReceivingState.on(subscriptionChange.type, (context, event) => {
	    if (event.payload.channels.length === 0 && event.payload.groups.length === 0) {
	        return UnsubscribedState.with(undefined);
	    }
	    return ReceivingState.with({
	        cursor: context.cursor,
	        channels: event.payload.channels,
	        groups: event.payload.groups,
	    });
	});
	ReceivingState.on(restore.type, (context, event) => {
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
	ReceivingState.on(receiveFailure.type, (context, event) => {
	    return ReceiveReconnectingState.with(Object.assign(Object.assign({}, context), { attempts: 0, reason: event.payload }));
	});
	ReceivingState.on(disconnect.type, (context) => {
	    return ReceiveStoppedState.with({
	        channels: context.channels,
	        groups: context.groups,
	        cursor: context.cursor,
	    }, [emitStatus({ category: StatusCategory$1.PNDisconnectedCategory })]);
	});
	ReceivingState.on(unsubscribeAll.type, (_) => UnsubscribedState.with(undefined, [emitStatus({ category: StatusCategory$1.PNDisconnectedCategory })]));

	/**
	 * Retry initial subscription handshake (disconnected) state.
	 *
	 * @internal
	 */
	/**
	 * Retry initial subscription handshake (disconnected) state.
	 *
	 * State in which Subscription Event Engine tries to recover after error which happened before.
	 *
	 * @internal
	 */
	const HandshakeReconnectingState = new State('HANDSHAKE_RECONNECTING');
	HandshakeReconnectingState.onEnter((context) => handshakeReconnect(context));
	HandshakeReconnectingState.onExit(() => handshakeReconnect.cancel);
	HandshakeReconnectingState.on(handshakeReconnectSuccess.type, (context, event) => {
	    var _a, _b;
	    const cursor = {
	        timetoken: !!((_a = context.cursor) === null || _a === void 0 ? void 0 : _a.timetoken) ? (_b = context.cursor) === null || _b === void 0 ? void 0 : _b.timetoken : event.payload.cursor.timetoken,
	        region: event.payload.cursor.region,
	    };
	    return ReceivingState.with({
	        channels: context.channels,
	        groups: context.groups,
	        cursor: cursor,
	    }, [emitStatus({ category: StatusCategory$1.PNConnectedCategory })]);
	});
	HandshakeReconnectingState.on(handshakeReconnectFailure.type, (context, event) => HandshakeReconnectingState.with(Object.assign(Object.assign({}, context), { attempts: context.attempts + 1, reason: event.payload })));
	HandshakeReconnectingState.on(handshakeReconnectGiveup.type, (context, event) => {
	    var _a;
	    return HandshakeFailedState.with({
	        groups: context.groups,
	        channels: context.channels,
	        cursor: context.cursor,
	        reason: event.payload,
	    }, [emitStatus({ category: StatusCategory$1.PNConnectionErrorCategory, error: (_a = event.payload) === null || _a === void 0 ? void 0 : _a.message })]);
	});
	HandshakeReconnectingState.on(disconnect.type, (context) => HandshakeStoppedState.with({
	    channels: context.channels,
	    groups: context.groups,
	    cursor: context.cursor,
	}));
	HandshakeReconnectingState.on(subscriptionChange.type, (context, event) => HandshakingState.with({
	    channels: event.payload.channels,
	    groups: event.payload.groups,
	    cursor: context.cursor,
	}));
	HandshakeReconnectingState.on(restore.type, (context, event) => {
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
	HandshakeReconnectingState.on(unsubscribeAll.type, (_) => UnsubscribedState.with(undefined));

	/**
	 * Initial subscription handshake (disconnected) state.
	 *
	 * @internal
	 */
	/**
	 * Initial subscription handshake (disconnected) state.
	 *
	 * State in which Subscription Event Engine tries to receive subscription cursor for next sequential subscribe REST
	 * API calls.
	 *
	 * @internal
	 */
	const HandshakingState = new State('HANDSHAKING');
	HandshakingState.onEnter((context) => handshake(context.channels, context.groups));
	HandshakingState.onExit(() => handshake.cancel);
	HandshakingState.on(subscriptionChange.type, (context, event) => {
	    if (event.payload.channels.length === 0 && event.payload.groups.length === 0) {
	        return UnsubscribedState.with(undefined);
	    }
	    return HandshakingState.with({
	        channels: event.payload.channels,
	        groups: event.payload.groups,
	        cursor: context.cursor,
	    });
	});
	HandshakingState.on(handshakeSuccess.type, (context, event) => {
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
	HandshakingState.on(handshakeFailure.type, (context, event) => {
	    return HandshakeReconnectingState.with({
	        channels: context.channels,
	        groups: context.groups,
	        cursor: context.cursor,
	        attempts: 0,
	        reason: event.payload,
	    });
	});
	HandshakingState.on(disconnect.type, (context) => HandshakeStoppedState.with({
	    channels: context.channels,
	    groups: context.groups,
	    cursor: context.cursor,
	}));
	HandshakingState.on(restore.type, (context, event) => {
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
	HandshakingState.on(unsubscribeAll.type, (_) => UnsubscribedState.with());

	/**
	 * Unsubscribed / disconnected state module.
	 *
	 * @internal
	 */
	/**
	 * Unsubscribed / disconnected state.
	 *
	 * State in which Subscription Event Engine doesn't process any real-time updates.
	 *
	 * @internal
	 */
	const UnsubscribedState = new State('UNSUBSCRIBED');
	UnsubscribedState.on(subscriptionChange.type, (_, event) => HandshakingState.with({
	    channels: event.payload.channels,
	    groups: event.payload.groups,
	}));
	UnsubscribedState.on(restore.type, (_, event) => {
	    return HandshakingState.with({
	        channels: event.payload.channels,
	        groups: event.payload.groups,
	        cursor: event.payload.cursor,
	    });
	});

	/**
	 * Subscribe Event Engine module.
	 *
	 * @internal
	 */
	/**
	 * Subscribe Event Engine Core.
	 *
	 * @internal
	 */
	class EventEngine {
	    get _engine() {
	        return this.engine;
	    }
	    constructor(dependencies) {
	        this.engine = new Engine();
	        this.channels = [];
	        this.groups = [];
	        this.dependencies = dependencies;
	        this.dispatcher = new EventEngineDispatcher(this.engine, dependencies);
	        this._unsubscribeEngine = this.engine.subscribe((change) => {
	            if (change.type === 'invocationDispatched') {
	                this.dispatcher.dispatch(change.invocation);
	            }
	        });
	        this.engine.start(UnsubscribedState, undefined);
	    }
	    subscribe({ channels, channelGroups, timetoken, withPresence, }) {
	        this.channels = [...this.channels, ...(channels !== null && channels !== void 0 ? channels : [])];
	        this.groups = [...this.groups, ...(channelGroups !== null && channelGroups !== void 0 ? channelGroups : [])];
	        if (withPresence) {
	            this.channels.map((c) => this.channels.push(`${c}-pnpres`));
	            this.groups.map((g) => this.groups.push(`${g}-pnpres`));
	        }
	        if (timetoken) {
	            this.engine.transition(restore(Array.from(new Set([...this.channels, ...(channels !== null && channels !== void 0 ? channels : [])])), Array.from(new Set([...this.groups, ...(channelGroups !== null && channelGroups !== void 0 ? channelGroups : [])])), timetoken));
	        }
	        else {
	            this.engine.transition(subscriptionChange(Array.from(new Set([...this.channels, ...(channels !== null && channels !== void 0 ? channels : [])])), Array.from(new Set([...this.groups, ...(channelGroups !== null && channelGroups !== void 0 ? channelGroups : [])]))));
	        }
	        if (this.dependencies.join) {
	            this.dependencies.join({
	                channels: Array.from(new Set(this.channels.filter((c) => !c.endsWith('-pnpres')))),
	                groups: Array.from(new Set(this.groups.filter((g) => !g.endsWith('-pnpres')))),
	            });
	        }
	    }
	    unsubscribe({ channels = [], channelGroups = [] }) {
	        const filteredChannels = removeSingleOccurrence(this.channels, [
	            ...channels,
	            ...channels.map((c) => `${c}-pnpres`),
	        ]);
	        const filteredGroups = removeSingleOccurrence(this.groups, [
	            ...channelGroups,
	            ...channelGroups.map((c) => `${c}-pnpres`),
	        ]);
	        if (new Set(this.channels).size !== new Set(filteredChannels).size ||
	            new Set(this.groups).size !== new Set(filteredGroups).size) {
	            const channelsToLeave = findUniqueCommonElements(this.channels, channels);
	            const groupstoLeave = findUniqueCommonElements(this.groups, channelGroups);
	            if (this.dependencies.presenceState) {
	                channelsToLeave === null || channelsToLeave === void 0 ? void 0 : channelsToLeave.forEach((c) => delete this.dependencies.presenceState[c]);
	                groupstoLeave === null || groupstoLeave === void 0 ? void 0 : groupstoLeave.forEach((g) => delete this.dependencies.presenceState[g]);
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
	    }
	    unsubscribeAll() {
	        this.channels = [];
	        this.groups = [];
	        if (this.dependencies.presenceState) {
	            Object.keys(this.dependencies.presenceState).forEach((objectName) => {
	                delete this.dependencies.presenceState[objectName];
	            });
	        }
	        this.engine.transition(subscriptionChange(this.channels.slice(0), this.groups.slice(0)));
	        if (this.dependencies.leaveAll) {
	            this.dependencies.leaveAll();
	        }
	    }
	    reconnect({ timetoken, region }) {
	        this.engine.transition(reconnect(timetoken, region));
	    }
	    disconnect() {
	        this.engine.transition(disconnect());
	        if (this.dependencies.leaveAll) {
	            this.dependencies.leaveAll();
	        }
	    }
	    getSubscribedChannels() {
	        return Array.from(new Set(this.channels.slice(0)));
	    }
	    getSubscribedChannelGroups() {
	        return Array.from(new Set(this.groups.slice(0)));
	    }
	    dispose() {
	        this.disconnect();
	        this._unsubscribeEngine();
	        this.dispatcher.dispose();
	    }
	}

	/**
	 * Publish REST API module.
	 */
	// --------------------------------------------------------
	// ----------------------- Defaults -----------------------
	// --------------------------------------------------------
	// region Defaults
	/**
	 * Whether data is published used `POST` body or not.
	 */
	const SEND_BY_POST = false;
	// endregion
	/**
	 * Data publish request.
	 *
	 * Request will normalize and encrypt (if required) provided data and push it to the specified
	 * channel.
	 *
	 * @internal
	 */
	class PublishRequest extends AbstractRequest {
	    /**
	     * Construct data publish request.
	     *
	     * @param parameters - Request configuration.
	     */
	    constructor(parameters) {
	        var _a;
	        var _b;
	        super({ method: parameters.sendByPost ? TransportMethod.POST : TransportMethod.GET });
	        this.parameters = parameters;
	        // Apply default request parameters.
	        (_a = (_b = this.parameters).sendByPost) !== null && _a !== void 0 ? _a : (_b.sendByPost = SEND_BY_POST);
	    }
	    operation() {
	        return RequestOperation$1.PNPublishOperation;
	    }
	    validate() {
	        const { message, channel, keySet: { publishKey }, } = this.parameters;
	        if (!channel)
	            return "Missing 'channel'";
	        if (!message)
	            return "Missing 'message'";
	        if (!publishKey)
	            return "Missing 'publishKey'";
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse)
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            return { timetoken: serviceResponse[2] };
	        });
	    }
	    get path() {
	        const { message, channel, keySet } = this.parameters;
	        const stringifiedPayload = this.prepareMessagePayload(message);
	        return `/publish/${keySet.publishKey}/${keySet.subscribeKey}/0/${encodeString(channel)}/0${!this.parameters.sendByPost ? `/${encodeString(stringifiedPayload)}` : ''}`;
	    }
	    get queryParameters() {
	        const { customMessageType, meta, replicate, storeInHistory, ttl } = this.parameters;
	        const query = {};
	        if (customMessageType)
	            query.custom_message_type = customMessageType;
	        if (storeInHistory !== undefined)
	            query.store = storeInHistory ? '1' : '0';
	        if (ttl !== undefined)
	            query.ttl = ttl;
	        if (replicate !== undefined && !replicate)
	            query.norep = 'true';
	        if (meta && typeof meta === 'object')
	            query.meta = JSON.stringify(meta);
	        return query;
	    }
	    get headers() {
	        return { 'Content-Type': 'application/json' };
	    }
	    get body() {
	        return this.prepareMessagePayload(this.parameters.message);
	    }
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
	    prepareMessagePayload(payload) {
	        const { crypto } = this.parameters;
	        if (!crypto)
	            return JSON.stringify(payload) || '';
	        const encrypted = crypto.encrypt(JSON.stringify(payload));
	        return JSON.stringify(typeof encrypted === 'string' ? encrypted : encode(encrypted));
	    }
	}

	/**
	 * Signal REST API module.
	 */
	// endregion
	/**
	 * Signal data (size-limited) publish request.
	 *
	 * @internal
	 */
	class SignalRequest extends AbstractRequest {
	    constructor(parameters) {
	        super();
	        this.parameters = parameters;
	    }
	    operation() {
	        return RequestOperation$1.PNSignalOperation;
	    }
	    validate() {
	        const { message, channel, keySet: { publishKey }, } = this.parameters;
	        if (!channel)
	            return "Missing 'channel'";
	        if (!message)
	            return "Missing 'message'";
	        if (!publishKey)
	            return "Missing 'publishKey'";
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse)
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            return { timetoken: serviceResponse[2] };
	        });
	    }
	    get path() {
	        const { keySet: { publishKey, subscribeKey }, channel, message, } = this.parameters;
	        const stringifiedPayload = JSON.stringify(message);
	        return `/signal/${publishKey}/${subscribeKey}/0/${encodeString(channel)}/0/${encodeString(stringifiedPayload)}`;
	    }
	    get queryParameters() {
	        const { customMessageType } = this.parameters;
	        const query = {};
	        if (customMessageType)
	            query.custom_message_type = customMessageType;
	        return query;
	    }
	}

	/**
	 * Receive messages subscribe REST API module.
	 *
	 * @internal
	 */
	/**
	 * Receive messages subscribe request.
	 *
	 * @internal
	 */
	class ReceiveMessagesSubscribeRequest extends BaseSubscribeRequest {
	    operation() {
	        return RequestOperation$1.PNReceiveMessagesOperation;
	    }
	    validate() {
	        const validationResult = super.validate();
	        if (validationResult)
	            return validationResult;
	        if (!this.parameters.timetoken)
	            return 'timetoken can not be empty';
	        if (!this.parameters.region)
	            return 'region can not be empty';
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channels = [], } = this.parameters;
	        return `/v2/subscribe/${subscribeKey}/${encodeNames(channels.sort(), ',')}/0`;
	    }
	    get queryParameters() {
	        const { channelGroups, filterExpression, timetoken, region } = this.parameters;
	        const query = { ee: '' };
	        if (channelGroups && channelGroups.length > 0)
	            query['channel-group'] = channelGroups.sort().join(',');
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
	    }
	}

	/**
	 * Handshake subscribe REST API module.
	 *
	 * @internal
	 */
	/**
	 * Handshake subscribe request.
	 *
	 * Separate subscribe request required by Event Engine.
	 *
	 * @internal
	 */
	class HandshakeSubscribeRequest extends BaseSubscribeRequest {
	    operation() {
	        return RequestOperation$1.PNHandshakeOperation;
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channels = [], } = this.parameters;
	        return `/v2/subscribe/${subscribeKey}/${encodeNames(channels.sort(), ',')}/0`;
	    }
	    get queryParameters() {
	        const { channelGroups, filterExpression, state } = this.parameters;
	        const query = { tt: 0, ee: '' };
	        if (channelGroups && channelGroups.length > 0)
	            query['channel-group'] = channelGroups.sort().join(',');
	        if (filterExpression && filterExpression.length > 0)
	            query['filter-expr'] = filterExpression;
	        if (state && Object.keys(state).length > 0)
	            query['state'] = JSON.stringify(state);
	        return query;
	    }
	}

	/**
	 * Get Presence State REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Get `uuid` presence state request.
	 *
	 * @internal
	 */
	class GetPresenceStateRequest extends AbstractRequest {
	    constructor(parameters) {
	        var _a, _b;
	        var _c, _d;
	        super();
	        this.parameters = parameters;
	        // Apply defaults.
	        (_a = (_c = this.parameters).channels) !== null && _a !== void 0 ? _a : (_c.channels = []);
	        (_b = (_d = this.parameters).channelGroups) !== null && _b !== void 0 ? _b : (_d.channelGroups = []);
	    }
	    operation() {
	        return RequestOperation$1.PNGetStateOperation;
	    }
	    validate() {
	        const { keySet: { subscribeKey }, channels, channelGroups, } = this.parameters;
	        if (!subscribeKey)
	            return 'Missing Subscribe Key';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            const { channels = [], channelGroups = [] } = this.parameters;
	            const state = { channels: {} };
	            if (channels.length === 1 && channelGroups.length === 0)
	                state.channels[channels[0]] = serviceResponse.payload;
	            else
	                state.channels = serviceResponse.payload;
	            return state;
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, uuid, channels, } = this.parameters;
	        return `/v2/presence/sub-key/${subscribeKey}/channel/${encodeNames(channels !== null && channels !== void 0 ? channels : [], ',')}/uuid/${uuid}`;
	    }
	    get queryParameters() {
	        const { channelGroups } = this.parameters;
	        if (!channelGroups || channelGroups.length === 0)
	            return {};
	        return { 'channel-group': channelGroups.join(',') };
	    }
	}

	/**
	 * Set Presence State REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Set `uuid` presence state request.
	 *
	 * @internal
	 */
	class SetPresenceStateRequest extends AbstractRequest {
	    constructor(parameters) {
	        super();
	        this.parameters = parameters;
	    }
	    operation() {
	        return RequestOperation$1.PNSetStateOperation;
	    }
	    validate() {
	        const { keySet: { subscribeKey }, state, channels = [], channelGroups = [], } = this.parameters;
	        if (!subscribeKey)
	            return 'Missing Subscribe Key';
	        if (!state)
	            return 'Missing State';
	        if ((channels === null || channels === void 0 ? void 0 : channels.length) === 0 && (channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.length) === 0)
	            return 'Please provide a list of channels and/or channel-groups';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return { state: serviceResponse.payload };
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, uuid, channels, } = this.parameters;
	        return `/v2/presence/sub-key/${subscribeKey}/channel/${encodeNames(channels !== null && channels !== void 0 ? channels : [], ',')}/uuid/${encodeString(uuid)}/data`;
	    }
	    get queryParameters() {
	        const { channelGroups, state } = this.parameters;
	        const query = { state: JSON.stringify(state) };
	        if (channelGroups && channelGroups.length !== 0)
	            query['channel-group'] = channelGroups.join(',');
	        return query;
	    }
	}

	/**
	 * Announce heartbeat REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Announce `uuid` presence request.
	 *
	 * @internal
	 */
	class HeartbeatRequest extends AbstractRequest {
	    constructor(parameters) {
	        super();
	        this.parameters = parameters;
	    }
	    operation() {
	        return RequestOperation$1.PNHeartbeatOperation;
	    }
	    validate() {
	        const { keySet: { subscribeKey }, channels = [], channelGroups = [], } = this.parameters;
	        if (!subscribeKey)
	            return 'Missing Subscribe Key';
	        if (channels.length === 0 && channelGroups.length === 0)
	            return 'Please provide a list of channels and/or channel-groups';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return {};
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channels, } = this.parameters;
	        return `/v2/presence/sub-key/${subscribeKey}/channel/${encodeNames(channels !== null && channels !== void 0 ? channels : [], ',')}/heartbeat`;
	    }
	    get queryParameters() {
	        const { channelGroups, state, heartbeat } = this.parameters;
	        const query = { heartbeat: `${heartbeat}` };
	        if (channelGroups && channelGroups.length !== 0)
	            query['channel-group'] = channelGroups.join(',');
	        if (state)
	            query.state = JSON.stringify(state);
	        return query;
	    }
	}

	/**
	 * Announce leave REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Announce user leave request.
	 *
	 * @internal
	 */
	class PresenceLeaveRequest extends AbstractRequest {
	    constructor(parameters) {
	        super();
	        this.parameters = parameters;
	        if (this.parameters.channelGroups)
	            this.parameters.channelGroups = Array.from(new Set(this.parameters.channelGroups));
	        if (this.parameters.channels)
	            this.parameters.channels = Array.from(new Set(this.parameters.channels));
	    }
	    operation() {
	        return RequestOperation$1.PNUnsubscribeOperation;
	    }
	    validate() {
	        const { keySet: { subscribeKey }, channels = [], channelGroups = [], } = this.parameters;
	        if (!subscribeKey)
	            return 'Missing Subscribe Key';
	        if (channels.length === 0 && channelGroups.length === 0)
	            return 'At least one `channel` or `channel group` should be provided.';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return {};
	        });
	    }
	    get path() {
	        var _a;
	        const { keySet: { subscribeKey }, channels, } = this.parameters;
	        return `/v2/presence/sub-key/${subscribeKey}/channel/${encodeNames((_a = channels === null || channels === void 0 ? void 0 : channels.sort()) !== null && _a !== void 0 ? _a : [], ',')}/leave`;
	    }
	    get queryParameters() {
	        const { channelGroups } = this.parameters;
	        if (!channelGroups || channelGroups.length === 0)
	            return {};
	        return { 'channel-group': channelGroups.sort().join(',') };
	    }
	}

	/**
	 * `uuid` presence REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Get `uuid` presence request.
	 *
	 * @internal
	 */
	class WhereNowRequest extends AbstractRequest {
	    constructor(parameters) {
	        super();
	        this.parameters = parameters;
	    }
	    operation() {
	        return RequestOperation$1.PNWhereNowOperation;
	    }
	    validate() {
	        if (!this.parameters.keySet.subscribeKey)
	            return 'Missing Subscribe Key';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            if (!serviceResponse.payload)
	                return { channels: [] };
	            return { channels: serviceResponse.payload.channels };
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, uuid, } = this.parameters;
	        return `/v2/presence/sub-key/${subscribeKey}/uuid/${encodeString(uuid)}`;
	    }
	}

	/**
	 * Channels / channel groups presence REST API module.
	 *
	 * @internal
	 */
	// --------------------------------------------------------
	// ----------------------- Defaults -----------------------
	// --------------------------------------------------------
	// region Defaults
	/**
	 * Whether `uuid` should be included in response or not.
	 */
	const INCLUDE_UUID$1 = true;
	/**
	 * Whether state associated with `uuid` should be included in response or not.
	 */
	const INCLUDE_STATE = false;
	// endregion
	/**
	 * Channel presence request.
	 *
	 * @internal
	 */
	class HereNowRequest extends AbstractRequest {
	    constructor(parameters) {
	        var _a, _b, _c;
	        var _d, _e, _f;
	        super();
	        this.parameters = parameters;
	        // Apply defaults.
	        (_a = (_d = this.parameters).queryParameters) !== null && _a !== void 0 ? _a : (_d.queryParameters = {});
	        (_b = (_e = this.parameters).includeUUIDs) !== null && _b !== void 0 ? _b : (_e.includeUUIDs = INCLUDE_UUID$1);
	        (_c = (_f = this.parameters).includeState) !== null && _c !== void 0 ? _c : (_f.includeState = INCLUDE_STATE);
	    }
	    operation() {
	        const { channels = [], channelGroups = [] } = this.parameters;
	        return channels.length === 0 && channelGroups.length === 0
	            ? RequestOperation$1.PNGlobalHereNowOperation
	            : RequestOperation$1.PNHereNowOperation;
	    }
	    validate() {
	        if (!this.parameters.keySet.subscribeKey)
	            return 'Missing Subscribe Key';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a, _b;
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            // Extract general presence information.
	            const totalChannels = 'occupancy' in serviceResponse ? 1 : serviceResponse.payload.total_channels;
	            const totalOccupancy = 'occupancy' in serviceResponse ? serviceResponse.occupancy : serviceResponse.payload.total_channels;
	            const channelsPresence = {};
	            let channels = {};
	            // Remap single channel presence to multiple channels presence response.
	            if ('occupancy' in serviceResponse) {
	                const channel = this.parameters.channels[0];
	                channels[channel] = { uuids: (_a = serviceResponse.uuids) !== null && _a !== void 0 ? _a : [], occupancy: totalOccupancy };
	            }
	            else
	                channels = (_b = serviceResponse.payload.channels) !== null && _b !== void 0 ? _b : {};
	            Object.keys(channels).forEach((channel) => {
	                const channelEntry = channels[channel];
	                channelsPresence[channel] = {
	                    occupants: this.parameters.includeUUIDs
	                        ? channelEntry.uuids.map((uuid) => {
	                            if (typeof uuid === 'string')
	                                return { uuid, state: null };
	                            return uuid;
	                        })
	                        : [],
	                    name: channel,
	                    occupancy: channelEntry.occupancy,
	                };
	            });
	            return {
	                totalChannels,
	                totalOccupancy,
	                channels: channelsPresence,
	            };
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channels, channelGroups, } = this.parameters;
	        let path = `/v2/presence/sub-key/${subscribeKey}`;
	        if ((channels && channels.length > 0) || (channelGroups && channelGroups.length > 0))
	            path += `/channel/${encodeNames(channels !== null && channels !== void 0 ? channels : [], ',')}`;
	        return path;
	    }
	    get queryParameters() {
	        const { channelGroups, includeUUIDs, includeState, queryParameters } = this.parameters;
	        return Object.assign(Object.assign(Object.assign(Object.assign({}, (!includeUUIDs ? { disable_uuids: '1' } : {})), ((includeState !== null && includeState !== void 0 ? includeState : false) ? { state: '1' } : {})), (channelGroups && channelGroups.length > 0 ? { 'channel-group': channelGroups.join(',') } : {})), queryParameters);
	    }
	}

	/**
	 * Delete messages REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Delete messages from channel history.
	 *
	 * @internal
	 */
	class DeleteMessageRequest extends AbstractRequest {
	    constructor(parameters) {
	        super({ method: TransportMethod.DELETE });
	        this.parameters = parameters;
	    }
	    operation() {
	        return RequestOperation$1.PNDeleteMessagesOperation;
	    }
	    validate() {
	        if (!this.parameters.keySet.subscribeKey)
	            return 'Missing Subscribe Key';
	        if (!this.parameters.channel)
	            return 'Missing channel';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return {};
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channel, } = this.parameters;
	        return `/v3/history/sub-key/${subscribeKey}/channel/${encodeString(channel)}`;
	    }
	    get queryParameters() {
	        const { start, end } = this.parameters;
	        return Object.assign(Object.assign({}, (start ? { start } : {})), (end ? { end } : {}));
	    }
	}

	/**
	 * Messages count REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Count messages request.
	 *
	 * @internal
	 */
	class MessageCountRequest extends AbstractRequest {
	    constructor(parameters) {
	        super();
	        this.parameters = parameters;
	    }
	    operation() {
	        return RequestOperation$1.PNMessageCounts;
	    }
	    validate() {
	        const { keySet: { subscribeKey }, channels, timetoken, channelTimetokens, } = this.parameters;
	        if (!subscribeKey)
	            return 'Missing Subscribe Key';
	        if (!channels)
	            return 'Missing channels';
	        if (timetoken && channelTimetokens)
	            return '`timetoken` and `channelTimetokens` are incompatible together';
	        if (!timetoken && !channelTimetokens)
	            return '`timetoken` or `channelTimetokens` need to be set';
	        if (channelTimetokens && channelTimetokens.length > 1 && channelTimetokens.length !== channels.length)
	            return 'Length of `channelTimetokens` and `channels` do not match';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return { channels: serviceResponse.channels };
	        });
	    }
	    get path() {
	        return `/v3/history/sub-key/${this.parameters.keySet.subscribeKey}/message-counts/${encodeNames(this.parameters.channels)}`;
	    }
	    get queryParameters() {
	        let { channelTimetokens } = this.parameters;
	        if (this.parameters.timetoken)
	            channelTimetokens = [this.parameters.timetoken];
	        return Object.assign(Object.assign({}, (channelTimetokens.length === 1 ? { timetoken: channelTimetokens[0] } : {})), (channelTimetokens.length > 1 ? { channelsTimetoken: channelTimetokens.join(',') } : {}));
	    }
	}

	/**
	 * Get history REST API module.
	 *
	 * @internal
	 */
	// --------------------------------------------------------
	// ---------------------- Defaults ------------------------
	// --------------------------------------------------------
	// region Defaults
	/**
	 * Whether verbose logging enabled or not.
	 */
	const LOG_VERBOSITY$1 = false;
	/**
	 * Whether associated message metadata should be returned or not.
	 */
	const INCLUDE_METADATA = false;
	/**
	 * Whether timetokens should be returned as strings by default or not.
	 */
	const STRINGIFY_TIMETOKENS$1 = false;
	/**
	 * Default and maximum number of messages which should be returned.
	 */
	const MESSAGES_COUNT = 100;
	// endregion
	/**
	 * Get single channel messages request.
	 *
	 * @internal
	 */
	class GetHistoryRequest extends AbstractRequest {
	    constructor(parameters) {
	        var _a, _b, _c;
	        super();
	        this.parameters = parameters;
	        // Apply defaults.
	        if (parameters.count)
	            parameters.count = Math.min(parameters.count, MESSAGES_COUNT);
	        else
	            parameters.count = MESSAGES_COUNT;
	        (_a = parameters.stringifiedTimeToken) !== null && _a !== void 0 ? _a : (parameters.stringifiedTimeToken = STRINGIFY_TIMETOKENS$1);
	        (_b = parameters.includeMeta) !== null && _b !== void 0 ? _b : (parameters.includeMeta = INCLUDE_METADATA);
	        (_c = parameters.logVerbosity) !== null && _c !== void 0 ? _c : (parameters.logVerbosity = LOG_VERBOSITY$1);
	    }
	    operation() {
	        return RequestOperation$1.PNHistoryOperation;
	    }
	    validate() {
	        if (!this.parameters.keySet.subscribeKey)
	            return 'Missing Subscribe Key';
	        if (!this.parameters.channel)
	            return 'Missing channel';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse)
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            const messages = serviceResponse[0];
	            const startTimeToken = serviceResponse[1];
	            const endTimeToken = serviceResponse[2];
	            // Handle malformed get history response.
	            if (!Array.isArray(messages))
	                return { messages: [], startTimeToken, endTimeToken };
	            return {
	                messages: messages.map((payload) => {
	                    const processedPayload = this.processPayload(payload.message);
	                    const item = {
	                        entry: processedPayload.payload,
	                        timetoken: payload.timetoken,
	                    };
	                    if (processedPayload.error)
	                        item.error = processedPayload.error;
	                    if (payload.meta)
	                        item.meta = payload.meta;
	                    return item;
	                }),
	                startTimeToken,
	                endTimeToken,
	            };
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channel, } = this.parameters;
	        return `/v2/history/sub-key/${subscribeKey}/channel/${encodeString(channel)}`;
	    }
	    get queryParameters() {
	        const { start, end, reverse, count, stringifiedTimeToken, includeMeta } = this.parameters;
	        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ count: count, include_token: 'true' }, (start ? { start } : {})), (end ? { end } : {})), (stringifiedTimeToken ? { string_message_token: 'true' } : {})), (reverse !== undefined && reverse !== null ? { reverse: reverse.toString() } : {})), (includeMeta ? { include_meta: 'true' } : {}));
	    }
	    processPayload(payload) {
	        const { crypto, logVerbosity } = this.parameters;
	        if (!crypto || typeof payload !== 'string')
	            return { payload };
	        let decryptedPayload;
	        let error;
	        try {
	            const decryptedData = crypto.decrypt(payload);
	            decryptedPayload =
	                decryptedData instanceof ArrayBuffer
	                    ? JSON.parse(GetHistoryRequest.decoder.decode(decryptedData))
	                    : decryptedData;
	        }
	        catch (err) {
	            if (logVerbosity)
	                console.log(`decryption error`, err.message);
	            decryptedPayload = payload;
	            error = `Error while decrypting message content: ${err.message}`;
	        }
	        return {
	            payload: decryptedPayload,
	            error,
	        };
	    }
	}

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
	 *
	 * @internal
	 */
	// --------------------------------------------------------
	// ---------------------- Defaults ------------------------
	// --------------------------------------------------------
	// region Defaults
	/**
	 * Whether verbose logging enabled or not.
	 */
	const LOG_VERBOSITY = false;
	/**
	 * Whether message type should be returned or not.
	 */
	const INCLUDE_MESSAGE_TYPE = true;
	/**
	 * Whether timetokens should be returned as strings by default or not.
	 */
	const STRINGIFY_TIMETOKENS = false;
	/**
	 * Whether message publisher `uuid` should be returned or not.
	 */
	const INCLUDE_UUID = true;
	/**
	 * Default number of messages which can be returned for single channel, and it is maximum as well.
	 */
	const SINGLE_CHANNEL_MESSAGES_COUNT = 100;
	/**
	 * Default number of messages which can be returned for multiple channels or when fetched
	 * message actions.
	 */
	const MULTIPLE_CHANNELS_MESSAGES_COUNT = 25;
	// endregion
	/**
	 * Fetch messages from channels request.
	 *
	 * @internal
	 */
	class FetchMessagesRequest extends AbstractRequest {
	    constructor(parameters) {
	        var _a, _b, _c, _d, _e;
	        super();
	        this.parameters = parameters;
	        // Apply defaults.
	        const includeMessageActions = (_a = parameters.includeMessageActions) !== null && _a !== void 0 ? _a : false;
	        const defaultCount = parameters.channels.length > 1 || includeMessageActions
	            ? MULTIPLE_CHANNELS_MESSAGES_COUNT
	            : SINGLE_CHANNEL_MESSAGES_COUNT;
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
	        (_e = parameters.logVerbosity) !== null && _e !== void 0 ? _e : (parameters.logVerbosity = LOG_VERBOSITY);
	    }
	    operation() {
	        return RequestOperation$1.PNFetchMessagesOperation;
	    }
	    validate() {
	        const { keySet: { subscribeKey }, channels, includeMessageActions, } = this.parameters;
	        if (!subscribeKey)
	            return 'Missing Subscribe Key';
	        if (!channels)
	            return 'Missing channels';
	        if (includeMessageActions !== undefined && includeMessageActions && channels.length > 1)
	            return ('History can return actions data for a single channel only. Either pass a single channel ' +
	                'or disable the includeMessageActions flag.');
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a;
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            const responseChannels = (_a = serviceResponse.channels) !== null && _a !== void 0 ? _a : {};
	            const channels = {};
	            Object.keys(responseChannels).forEach((channel) => {
	                // Map service response to expected data object type structure.
	                channels[channel] = responseChannels[channel].map((payload) => {
	                    // `null` message type means regular message.
	                    if (payload.message_type === null)
	                        payload.message_type = PubNubMessageType.Message;
	                    const processedPayload = this.processPayload(channel, payload);
	                    const item = Object.assign(Object.assign({ channel, timetoken: payload.timetoken, message: processedPayload.payload, messageType: payload.message_type }, (payload.custom_message_type ? { customMessageType: payload.custom_message_type } : {})), { uuid: payload.uuid });
	                    if (payload.actions) {
	                        const itemWithActions = item;
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
	                return { channels, more: serviceResponse.more };
	            return { channels };
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channels, includeMessageActions, } = this.parameters;
	        const endpoint = !includeMessageActions ? 'history' : 'history-with-actions';
	        return `/v3/${endpoint}/sub-key/${subscribeKey}/channel/${encodeNames(channels)}`;
	    }
	    get queryParameters() {
	        const { start, end, count, includeCustomMessageType, includeMessageType, includeMeta, includeUUID, stringifiedTimeToken, } = this.parameters;
	        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ max: count }, (start ? { start } : {})), (end ? { end } : {})), (stringifiedTimeToken ? { string_message_token: 'true' } : {})), (includeMeta !== undefined && includeMeta ? { include_meta: 'true' } : {})), (includeUUID ? { include_uuid: 'true' } : {})), (includeCustomMessageType !== undefined && includeCustomMessageType !== null
	            ? { include_custom_message_type: includeCustomMessageType ? 'true' : 'false' }
	            : {})), (includeMessageType ? { include_message_type: 'true' } : {}));
	    }
	    /**
	     * Parse single channel data entry.
	     *
	     * @param channel - Channel for which {@link payload} should be processed.
	     * @param payload - Source payload which should be processed and parsed to expected type.
	     *
	     * @returns
	     */
	    processPayload(channel, payload) {
	        const { crypto, logVerbosity } = this.parameters;
	        if (!crypto || typeof payload.message !== 'string')
	            return { payload: payload.message };
	        let decryptedPayload;
	        let error;
	        try {
	            const decryptedData = crypto.decrypt(payload.message);
	            decryptedPayload =
	                decryptedData instanceof ArrayBuffer
	                    ? JSON.parse(FetchMessagesRequest.decoder.decode(decryptedData))
	                    : decryptedData;
	        }
	        catch (err) {
	            if (logVerbosity)
	                console.log(`decryption error`, err.message);
	            decryptedPayload = payload.message;
	            error = `Error while decrypting message content: ${err.message}`;
	        }
	        if (!error &&
	            decryptedPayload &&
	            payload.message_type == PubNubMessageType.Files &&
	            typeof decryptedPayload === 'object' &&
	            this.isFileMessage(decryptedPayload)) {
	            const fileMessage = decryptedPayload;
	            return {
	                payload: {
	                    message: fileMessage.message,
	                    file: Object.assign(Object.assign({}, fileMessage.file), { url: this.parameters.getFileUrl({ channel, id: fileMessage.file.id, name: fileMessage.file.name }) }),
	                },
	                error,
	            };
	        }
	        return { payload: decryptedPayload, error };
	    }
	    /**
	     * Check whether `payload` potentially represents file message.
	     *
	     * @param payload - Fetched message payload.
	     *
	     * @returns `true` if payload can be {@link History#FileMessage|FileMessage}.
	     */
	    isFileMessage(payload) {
	        return payload.file !== undefined;
	    }
	}

	/**
	 * Get Message Actions REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Fetch channel message actions request.
	 *
	 * @internal
	 */
	class GetMessageActionsRequest extends AbstractRequest {
	    constructor(parameters) {
	        super();
	        this.parameters = parameters;
	    }
	    operation() {
	        return RequestOperation$1.PNGetMessageActionsOperation;
	    }
	    validate() {
	        if (!this.parameters.keySet.subscribeKey)
	            return 'Missing Subscribe Key';
	        if (!this.parameters.channel)
	            return 'Missing message channel';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            let start = null;
	            let end = null;
	            if (serviceResponse.data.length > 0) {
	                start = serviceResponse.data[0].actionTimetoken;
	                end = serviceResponse.data[serviceResponse.data.length - 1].actionTimetoken;
	            }
	            return {
	                data: serviceResponse.data,
	                more: serviceResponse.more,
	                start,
	                end,
	            };
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channel, } = this.parameters;
	        return `/v1/message-actions/${subscribeKey}/channel/${encodeString(channel)}`;
	    }
	    get queryParameters() {
	        const { limit, start, end } = this.parameters;
	        return Object.assign(Object.assign(Object.assign({}, (start ? { start } : {})), (end ? { end } : {})), (limit ? { limit } : {}));
	    }
	}

	/**
	 * Add Message Action REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Add Message Reaction request.
	 *
	 * @internal
	 */
	class AddMessageActionRequest extends AbstractRequest {
	    constructor(parameters) {
	        super({ method: TransportMethod.POST });
	        this.parameters = parameters;
	    }
	    operation() {
	        return RequestOperation$1.PNAddMessageActionOperation;
	    }
	    validate() {
	        const { keySet: { subscribeKey }, action, channel, messageTimetoken, } = this.parameters;
	        if (!subscribeKey)
	            return 'Missing Subscribe Key';
	        if (!channel)
	            return 'Missing message channel';
	        if (!messageTimetoken)
	            return 'Missing message timetoken';
	        if (!action)
	            return 'Missing Action';
	        if (!action.value)
	            return 'Missing Action.value';
	        if (!action.type)
	            return 'Missing Action.type';
	        if (action.type.length > 15)
	            return 'Action.type value exceed maximum length of 15';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return { data: serviceResponse.data };
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channel, messageTimetoken, } = this.parameters;
	        return `/v1/message-actions/${subscribeKey}/channel/${encodeString(channel)}/message/${messageTimetoken}`;
	    }
	    get headers() {
	        return { 'Content-Type': 'application/json' };
	    }
	    get body() {
	        return JSON.stringify(this.parameters.action);
	    }
	}

	/**
	 * Remove Message Action REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Remove specific message action request.
	 *
	 * @internal
	 */
	class RemoveMessageAction extends AbstractRequest {
	    constructor(parameters) {
	        super({ method: TransportMethod.DELETE });
	        this.parameters = parameters;
	    }
	    operation() {
	        return RequestOperation$1.PNRemoveMessageActionOperation;
	    }
	    validate() {
	        const { keySet: { subscribeKey }, channel, messageTimetoken, actionTimetoken, } = this.parameters;
	        if (!subscribeKey)
	            return 'Missing Subscribe Key';
	        if (!channel)
	            return 'Missing message action channel';
	        if (!messageTimetoken)
	            return 'Missing message timetoken';
	        if (!actionTimetoken)
	            return 'Missing action timetoken';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return { data: serviceResponse.data };
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channel, actionTimetoken, messageTimetoken, } = this.parameters;
	        return `/v1/message-actions/${subscribeKey}/channel/${encodeString(channel)}/message/${messageTimetoken}/action/${actionTimetoken}`;
	    }
	}

	/**
	 * Publish File Message REST API module.
	 *
	 * @internal
	 */
	// --------------------------------------------------------
	// ----------------------- Defaults -----------------------
	// --------------------------------------------------------
	// region Defaults
	/**
	 * Whether published file messages should be stored in the channel's history.
	 */
	const STORE_IN_HISTORY = true;
	// endregion
	/**
	 * Publish shared file information request.
	 *
	 * @internal
	 */
	class PublishFileMessageRequest extends AbstractRequest {
	    constructor(parameters) {
	        var _a;
	        var _b;
	        super();
	        this.parameters = parameters;
	        // Apply default request parameters.
	        (_a = (_b = this.parameters).storeInHistory) !== null && _a !== void 0 ? _a : (_b.storeInHistory = STORE_IN_HISTORY);
	    }
	    operation() {
	        return RequestOperation$1.PNPublishFileMessageOperation;
	    }
	    validate() {
	        const { channel, fileId, fileName } = this.parameters;
	        if (!channel)
	            return "channel can't be empty";
	        if (!fileId)
	            return "file id can't be empty";
	        if (!fileName)
	            return "file name can't be empty";
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse)
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            return { timetoken: serviceResponse[2] };
	        });
	    }
	    get path() {
	        const { message, channel, keySet: { publishKey, subscribeKey }, fileId, fileName, } = this.parameters;
	        const fileMessage = Object.assign({ file: {
	                name: fileName,
	                id: fileId,
	            } }, (message ? { message } : {}));
	        return `/v1/files/publish-file/${publishKey}/${subscribeKey}/0/${encodeString(channel)}/0/${encodeString(this.prepareMessagePayload(fileMessage))}`;
	    }
	    get queryParameters() {
	        const { customMessageType, storeInHistory, ttl, meta } = this.parameters;
	        return Object.assign(Object.assign(Object.assign({ store: storeInHistory ? '1' : '0' }, (customMessageType ? { custom_message_type: customMessageType } : {})), (ttl ? { ttl } : {})), (meta && typeof meta === 'object' ? { meta: JSON.stringify(meta) } : {}));
	    }
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
	    prepareMessagePayload(payload) {
	        const { crypto } = this.parameters;
	        if (!crypto)
	            return JSON.stringify(payload) || '';
	        const encrypted = crypto.encrypt(JSON.stringify(payload));
	        return JSON.stringify(typeof encrypted === 'string' ? encrypted : encode(encrypted));
	    }
	}

	/**
	 * File sharing REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * File download Url generation request.
	 *
	 * Local request which generates Url to download shared file from the specific channel.
	 *
	 * @internal
	 */
	class GetFileDownloadUrlRequest extends AbstractRequest {
	    /**
	     * Construct file download Url generation request.
	     *
	     * @param parameters - Request configuration.
	     */
	    constructor(parameters) {
	        super({ method: TransportMethod.LOCAL });
	        this.parameters = parameters;
	    }
	    operation() {
	        return RequestOperation$1.PNGetFileUrlOperation;
	    }
	    validate() {
	        const { channel, id, name } = this.parameters;
	        if (!channel)
	            return "channel can't be empty";
	        if (!id)
	            return "file id can't be empty";
	        if (!name)
	            return "file name can't be empty";
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return response.url;
	        });
	    }
	    get path() {
	        const { channel, id, name, keySet: { subscribeKey }, } = this.parameters;
	        return `/v1/files/${subscribeKey}/channels/${encodeString(channel)}/files/${id}/${name}`;
	    }
	}

	/**
	 * Delete file REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Delete File request.
	 *
	 * @internal
	 */
	class DeleteFileRequest extends AbstractRequest {
	    constructor(parameters) {
	        super({ method: TransportMethod.DELETE });
	        this.parameters = parameters;
	    }
	    operation() {
	        return RequestOperation$1.PNDeleteFileOperation;
	    }
	    validate() {
	        const { channel, id, name } = this.parameters;
	        if (!channel)
	            return "channel can't be empty";
	        if (!id)
	            return "file id can't be empty";
	        if (!name)
	            return "file name can't be empty";
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return serviceResponse;
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, id, channel, name, } = this.parameters;
	        return `/v1/files/${subscribeKey}/channels/${encodeString(channel)}/files/${id}/${name}`;
	    }
	}

	/**
	 * List Files REST API module.
	 *
	 * @internal
	 */
	// --------------------------------------------------------
	// ----------------------- Defaults -----------------------
	// --------------------------------------------------------
	// region Defaults
	/**
	 * Number of files to return in response.
	 */
	const LIMIT$6 = 100;
	// endregion
	/**
	 * Files List request.
	 *
	 * @internal
	 */
	class FilesListRequest extends AbstractRequest {
	    constructor(parameters) {
	        var _a;
	        var _b;
	        super();
	        this.parameters = parameters;
	        // Apply default request parameters.
	        (_a = (_b = this.parameters).limit) !== null && _a !== void 0 ? _a : (_b.limit = LIMIT$6);
	    }
	    operation() {
	        return RequestOperation$1.PNListFilesOperation;
	    }
	    validate() {
	        if (!this.parameters.channel)
	            return "channel can't be empty";
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return serviceResponse;
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channel, } = this.parameters;
	        return `/v1/files/${subscribeKey}/channels/${encodeString(channel)}/files`;
	    }
	    get queryParameters() {
	        const { limit, next } = this.parameters;
	        return Object.assign({ limit: limit }, (next ? { next } : {}));
	    }
	}

	/**
	 * Generate file upload URL REST API request.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Generate File Upload Url request.
	 *
	 * @internal
	 */
	class GenerateFileUploadUrlRequest extends AbstractRequest {
	    constructor(parameters) {
	        super({ method: TransportMethod.POST });
	        this.parameters = parameters;
	    }
	    operation() {
	        return RequestOperation$1.PNGenerateUploadUrlOperation;
	    }
	    validate() {
	        if (!this.parameters.channel)
	            return "channel can't be empty";
	        if (!this.parameters.name)
	            return "'name' can't be empty";
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return {
	                id: serviceResponse.data.id,
	                name: serviceResponse.data.name,
	                url: serviceResponse.file_upload_request.url,
	                formFields: serviceResponse.file_upload_request.form_fields,
	            };
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channel, } = this.parameters;
	        return `/v1/files/${subscribeKey}/channels/${encodeString(channel)}/generate-upload-url`;
	    }
	    get headers() {
	        return { 'Content-Type': 'application/json' };
	    }
	    get body() {
	        return JSON.stringify({ name: this.parameters.name });
	    }
	}

	/**
	 * Upload file REST API request.
	 *
	 * @internal
	 */
	/**
	 * File Upload request.
	 *
	 * @internal
	 */
	class UploadFileRequest extends AbstractRequest {
	    constructor(parameters) {
	        super({ method: TransportMethod.POST });
	        this.parameters = parameters;
	        // Use file's actual mime type if available.
	        const mimeType = parameters.file.mimeType;
	        if (mimeType) {
	            parameters.formFields = parameters.formFields.map((entry) => {
	                if (entry.name === 'Content-Type')
	                    return { name: entry.name, value: mimeType };
	                return entry;
	            });
	        }
	    }
	    operation() {
	        return RequestOperation$1.PNPublishFileOperation;
	    }
	    validate() {
	        const { fileId, fileName, file, uploadUrl } = this.parameters;
	        if (!fileId)
	            return "Validation failed: file 'id' can't be empty";
	        if (!fileName)
	            return "Validation failed: file 'name' can't be empty";
	        if (!file)
	            return "Validation failed: 'file' can't be empty";
	        if (!uploadUrl)
	            return "Validation failed: file upload 'url' can't be empty";
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return {
	                status: response.status,
	                message: response.body ? UploadFileRequest.decoder.decode(response.body) : 'OK',
	            };
	        });
	    }
	    request() {
	        return Object.assign(Object.assign({}, super.request()), { origin: new URL(this.parameters.uploadUrl).origin, timeout: 300 });
	    }
	    get path() {
	        const { pathname, search } = new URL(this.parameters.uploadUrl);
	        return `${pathname}${search}`;
	    }
	    get body() {
	        return this.parameters.file;
	    }
	    get formData() {
	        return this.parameters.formFields;
	    }
	}

	/**
	 * Share File API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Send file composed request.
	 *
	 * @internal
	 */
	class SendFileRequest {
	    constructor(parameters) {
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
	    process() {
	        return __awaiter(this, void 0, void 0, function* () {
	            let fileName;
	            let fileId;
	            return this.generateFileUploadUrl()
	                .then((result) => {
	                fileName = result.name;
	                fileId = result.id;
	                return this.uploadFile(result);
	            })
	                .then((result) => {
	                if (result.status !== 204) {
	                    throw new PubNubError('Upload to bucket was unsuccessful', {
	                        error: true,
	                        statusCode: result.status,
	                        category: StatusCategory$1.PNUnknownCategory,
	                        operation: RequestOperation$1.PNPublishFileOperation,
	                        errorData: { message: result.message },
	                    });
	                }
	            })
	                .then(() => this.publishFileMessage(fileId, fileName))
	                .catch((error) => {
	                if (error instanceof PubNubError)
	                    throw error;
	                const apiError = !(error instanceof PubNubAPIError) ? PubNubAPIError.create(error) : error;
	                throw new PubNubError('File upload error.', apiError.toStatus(RequestOperation$1.PNPublishFileOperation));
	            });
	        });
	    }
	    /**
	     * Generate pre-signed file upload Url.
	     *
	     * @returns File upload credentials.
	     */
	    generateFileUploadUrl() {
	        return __awaiter(this, void 0, void 0, function* () {
	            const request = new GenerateFileUploadUrlRequest(Object.assign(Object.assign({}, this.parameters), { name: this.file.name, keySet: this.parameters.keySet }));
	            return this.parameters.sendRequest(request);
	        });
	    }
	    /**
	     * Prepare and upload {@link PubNub} File object to remote storage.
	     *
	     * @param uploadParameters - File upload request parameters.
	     *
	     * @returns
	     */
	    uploadFile(uploadParameters) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const { cipherKey, PubNubFile, crypto, cryptography } = this.parameters;
	            const { id, name, url, formFields } = uploadParameters;
	            // Encrypt file if possible.
	            if (this.parameters.PubNubFile.supportsEncryptFile) {
	                if (!cipherKey && crypto)
	                    this.file = (yield crypto.encryptFile(this.file, PubNubFile));
	                else if (cipherKey && cryptography)
	                    this.file = (yield cryptography.encryptFile(cipherKey, this.file, PubNubFile));
	            }
	            return this.parameters.sendRequest(new UploadFileRequest({
	                fileId: id,
	                fileName: name,
	                file: this.file,
	                uploadUrl: url,
	                formFields,
	            }));
	        });
	    }
	    publishFileMessage(fileId, fileName) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a, _b, _c, _d;
	            let result = { timetoken: '0' };
	            let retries = this.parameters.fileUploadPublishRetryLimit;
	            let publishError;
	            let wasSuccessful = false;
	            do {
	                try {
	                    result = yield this.parameters.publishFile(Object.assign(Object.assign({}, this.parameters), { fileId, fileName }));
	                    wasSuccessful = true;
	                }
	                catch (error) {
	                    if (error instanceof PubNubError)
	                        publishError = error;
	                    retries -= 1;
	                }
	            } while (!wasSuccessful && retries > 0);
	            if (!wasSuccessful) {
	                throw new PubNubError('Publish failed. You may want to execute that operation manually using pubnub.publishFile', {
	                    error: true,
	                    category: (_b = (_a = publishError.status) === null || _a === void 0 ? void 0 : _a.category) !== null && _b !== void 0 ? _b : StatusCategory$1.PNUnknownCategory,
	                    statusCode: (_d = (_c = publishError.status) === null || _c === void 0 ? void 0 : _c.statusCode) !== null && _d !== void 0 ? _d : 0,
	                    channel: this.parameters.channel,
	                    id: fileId,
	                    name: fileName,
	                });
	            }
	            else
	                return { status: 200, timetoken: result.timetoken, id: fileId, name: fileName };
	        });
	    }
	}

	class SubscribeCapable {
	    /**
	     * Start receiving real-time updates.
	     *
	     * @param subscribeParameters - Additional subscription configuration options which should be used
	     * for request.
	     */
	    subscribe(subscribeParameters) {
	        const timetoken = subscribeParameters === null || subscribeParameters === void 0 ? void 0 : subscribeParameters.timetoken;
	        this.pubnub.subscribe(Object.assign({ channels: this.channelNames, channelGroups: this.groupNames }, (timetoken !== null && timetoken !== '' && { timetoken: timetoken })));
	    }
	    /**
	     * Stop real-time events processing.
	     */
	    unsubscribe() {
	        this.pubnub.unsubscribe({
	            channels: this.channelNames,
	            channelGroups: this.groupNames,
	        });
	    }
	    /**
	     * Set new message handler.
	     *
	     * @param onMessageListener - Listener function, which will be called each time when a new message
	     * is received from the real-time network.
	     */
	    set onMessage(onMessageListener) {
	        this.listener.message = onMessageListener;
	    }
	    /**
	     * Set new presence events handler.
	     *
	     * @param onPresenceListener - Listener function, which will be called each time when a new
	     * presence event is received from the real-time network.
	     */
	    set onPresence(onPresenceListener) {
	        this.listener.presence = onPresenceListener;
	    }
	    /**
	     * Set new signal handler.
	     *
	     * @param onSignalListener - Listener function, which will be called each time when a new signal
	     * is received from the real-time network.
	     */
	    set onSignal(onSignalListener) {
	        this.listener.signal = onSignalListener;
	    }
	    /**
	     * Set new app context event handler.
	     *
	     * @param onObjectsListener - Listener function, which will be called each time when a new
	     * app context event is received from the real-time network.
	     */
	    set onObjects(onObjectsListener) {
	        this.listener.objects = onObjectsListener;
	    }
	    /**
	     * Set new message reaction event handler.
	     *
	     * @param messageActionEventListener - Listener function, which will be called each time when a
	     * new message reaction event is received from the real-time network.
	     */
	    set onMessageAction(messageActionEventListener) {
	        this.listener.messageAction = messageActionEventListener;
	    }
	    /**
	     * Set new file handler.
	     *
	     * @param fileEventListener - Listener function, which will be called each time when a new file
	     * is received from the real-time network.
	     */
	    set onFile(fileEventListener) {
	        this.listener.file = fileEventListener;
	    }
	    /**
	     * Set events handler.
	     *
	     * @param listener - Events listener configuration object, which lets specify handlers for multiple
	     * types of events.
	     */
	    addListener(listener) {
	        this.eventEmitter.addListener(listener, this.channelNames, this.groupNames);
	    }
	    /**
	     * Remove events handler.
	     *
	     * @param listener - Event listener configuration, which should be removed from the list of notified
	     * listeners. **Important:** Should be the same object which has been passed to the
	     * {@link addListener}.
	     */
	    removeListener(listener) {
	        this.eventEmitter.removeListener(listener, this.channelNames, this.groupNames);
	    }
	    /**
	     * Get list of channels which is used for subscription.
	     *
	     * @returns List of channel names.
	     */
	    get channels() {
	        return this.channelNames.slice(0);
	    }
	    /**
	     * Get list of channel groups which is used for subscription.
	     *
	     * @returns List of channel group names.
	     */
	    get channelGroups() {
	        return this.groupNames.slice(0);
	    }
	}

	/**
	 * Multiple entities subscription set object which can be used to receive and handle real-time
	 * updates.
	 *
	 * Subscription set object represent collection of per-entity subscription objects and allow
	 * processing them at once for subscription loop and events handling.
	 */
	class SubscriptionSet extends SubscribeCapable {
	    /**
	     * Create entities' subscription set object.
	     *
	     * Subscription set object represent collection of per-entity subscription objects and allow
	     * processing them at once for subscription loop and events handling.
	     *
	     * @param channels - List of channels which should be used in subscription loop.
	     * @param channelGroups - List of channel groups which should be used in subscription loop.
	     * @param subscriptionOptions - Entities' subscription object configuration.
	     * @param eventEmitter - Event emitter, which will notify listeners about updates received for
	     * entities' channels / groups.
	     * @param pubnub - PubNub instance which will perform subscribe / unsubscribe requests for
	     * entities.
	     *
	     * @returns Ready to use entities' subscription set object.
	     *
	     * @internal
	     */
	    constructor({ channels = [], channelGroups = [], subscriptionOptions, eventEmitter, pubnub, }) {
	        super();
	        /**
	         * List of channel names for subscription loop.
	         *
	         * List of entities' names which can have additional entries depending on from configuration
	         * options. Presence events observing adds additional name to be used along with entity name.
	         *
	         * **Note:** Depending on from the entities' type, they may provide a list of channels which are
	         * used to receive real-time updates for it.
	         *
	         * @internal
	         */
	        this.channelNames = [];
	        /**
	         * List of channel group names for subscription loop.
	         *
	         * List of entities' names which can have additional entries depending on from configuration
	         * options. Presence events observing adds additional name to be used along with entity name.
	         *
	         * **Note:** Depending on from the entities' type, they may provide a list of channels which are
	         * used to receive real-time updates for it.
	         *
	         * @internal
	         */
	        this.groupNames = [];
	        /**
	         * List of per-entity subscription objects.
	         *
	         * @internal
	         */
	        this.subscriptionList = [];
	        this.options = subscriptionOptions;
	        this.eventEmitter = eventEmitter;
	        this.pubnub = pubnub;
	        channels.forEach((c) => {
	            const subscription = this.pubnub.channel(c).subscription(this.options);
	            this.channelNames = [...this.channelNames, ...subscription.channels];
	            this.subscriptionList.push(subscription);
	        });
	        channelGroups.forEach((cg) => {
	            const subscription = this.pubnub.channelGroup(cg).subscription(this.options);
	            this.groupNames = [...this.groupNames, ...subscription.channelGroups];
	            this.subscriptionList.push(subscription);
	        });
	        this.listener = {};
	        eventEmitter.addListener(this.listener, this.channelNames, this.groupNames);
	    }
	    /**
	     * Add additional entity's subscription to the subscription set.
	     *
	     * **Important:** Changes will be effective only after {@link SubscribeCapable#subscribe} call or
	     * next subscription loop.
	     *
	     * @param subscription - Other entity's subscription object, which should be added.
	     */
	    addSubscription(subscription) {
	        this.subscriptionList.push(subscription);
	        this.channelNames = [...this.channelNames, ...subscription.channels];
	        this.groupNames = [...this.groupNames, ...subscription.channelGroups];
	        this.eventEmitter.addListener(this.listener, subscription.channels, subscription.channelGroups);
	    }
	    /**
	     * Remove entity's subscription object from the set.
	     *
	     * **Important:** Changes will be effective only after {@link SubscribeCapable#unsubscribe} call or
	     * next subscription loop.
	     *
	     * @param subscription - Other entity's subscription object, which should be removed.
	     */
	    removeSubscription(subscription) {
	        const channelsToRemove = subscription.channels;
	        const groupsToRemove = subscription.channelGroups;
	        this.channelNames = this.channelNames.filter((c) => !channelsToRemove.includes(c));
	        this.groupNames = this.groupNames.filter((cg) => !groupsToRemove.includes(cg));
	        this.subscriptionList = this.subscriptionList.filter((s) => s !== subscription);
	        this.eventEmitter.removeListener(this.listener, channelsToRemove, groupsToRemove);
	    }
	    /**
	     * Merge with other subscription set object.
	     *
	     * **Important:** Changes will be effective only after {@link SubscribeCapable#subscribe} call or
	     * next subscription loop.
	     *
	     * @param subscriptionSet - Other entities' subscription set, which should be joined.
	     */
	    addSubscriptionSet(subscriptionSet) {
	        this.subscriptionList = [...this.subscriptionList, ...subscriptionSet.subscriptions];
	        this.channelNames = [...this.channelNames, ...subscriptionSet.channels];
	        this.groupNames = [...this.groupNames, ...subscriptionSet.channelGroups];
	        this.eventEmitter.addListener(this.listener, subscriptionSet.channels, subscriptionSet.channelGroups);
	    }
	    /**
	     * Subtract other subscription set object.
	     *
	     * **Important:** Changes will be effective only after {@link SubscribeCapable#unsubscribe} call or
	     * next subscription loop.
	     *
	     * @param subscriptionSet - Other entities' subscription set, which should be subtracted.
	     */
	    removeSubscriptionSet(subscriptionSet) {
	        const channelsToRemove = subscriptionSet.channels;
	        const groupsToRemove = subscriptionSet.channelGroups;
	        this.channelNames = this.channelNames.filter((c) => !channelsToRemove.includes(c));
	        this.groupNames = this.groupNames.filter((cg) => !groupsToRemove.includes(cg));
	        this.subscriptionList = this.subscriptionList.filter((s) => !subscriptionSet.subscriptions.includes(s));
	        this.eventEmitter.removeListener(this.listener, channelsToRemove, groupsToRemove);
	    }
	    /**
	     * Get list of entities' subscription objects registered in subscription set.
	     *
	     * @returns Entities' subscription objects list.
	     */
	    get subscriptions() {
	        return this.subscriptionList.slice(0);
	    }
	}

	/**
	 * Single-entity subscription object which can be used to receive and handle real-time updates.
	 */
	class Subscription extends SubscribeCapable {
	    /**
	     * Create entity's subscription object.
	     *
	     * @param channels - List of channels which should be used in subscription loop.
	     * @param channelGroups - List of channel groups which should be used in subscription loop.
	     * @param subscriptionOptions - Per-entity subscription object configuration.
	     * @param eventEmitter - Event emitter, which will notify listeners about updates received for
	     * entity channels / groups.
	     * @param pubnub - PubNub instance which will perform subscribe / unsubscribe requests for entity.
	     *
	     * @returns Ready to use entity's subscription object.
	     *
	     * @internal
	     */
	    constructor({ channels, channelGroups, subscriptionOptions, eventEmitter, pubnub, }) {
	        super();
	        /**
	         * List of channel names for subscription loop.
	         *
	         * Entity may have few because of subscription configuration options. Presence events observing
	         * adds additional name to be used along with entity name.
	         *
	         * **Note:** Depending on from the entity type, it may provide a list of channels which are used
	         * to receive real-time updates for it.
	         *
	         * @internal
	         */
	        this.channelNames = [];
	        /**
	         * List of channel group names for subscription loop.
	         *
	         * Entity may have few because of subscription configuration options. Presence events observing
	         * adds additional name to be used along with entity name.
	         *
	         * **Note:** Depending on from the entity type, it may provide a list of channel groups which is
	         * sed to receive real-time updates for it.
	         *
	         * @internal
	         */
	        this.groupNames = [];
	        this.channelNames = channels;
	        this.groupNames = channelGroups;
	        this.options = subscriptionOptions;
	        this.pubnub = pubnub;
	        this.eventEmitter = eventEmitter;
	        this.listener = {};
	        eventEmitter.addListener(this.listener, this.channelNames, this.groupNames);
	    }
	    /**
	     * Merge entities' subscription objects into subscription set.
	     *
	     * @param subscription - Other entity's subscription object to be merged with receiver.
	     * @return Subscription set which contains both receiver and other entities' subscription objects.
	     */
	    addSubscription(subscription) {
	        return new SubscriptionSet({
	            channels: [...this.channelNames, ...subscription.channels],
	            channelGroups: [...this.groupNames, ...subscription.channelGroups],
	            subscriptionOptions: Object.assign(Object.assign({}, this.options), subscription === null || subscription === void 0 ? void 0 : subscription.options),
	            eventEmitter: this.eventEmitter,
	            pubnub: this.pubnub,
	        });
	    }
	}

	/**
	 * First-class objects which provides access to the channel app context object-specific APIs.
	 */
	class ChannelMetadata {
	    /**
	     * Create channel app context object entity.
	     *
	     * @param id - Channel app context object identifier which will be used with subscription loop.
	     * @param eventEmitter - Event emitter, which will notify listeners about updates received on
	     * channel's subscription.
	     * @param pubnub - PubNub instance which will use this entity.
	     *
	     * @returns Ready to use channel app context object entity.
	     *
	     * @internal
	     */
	    constructor(id, eventEmitter, pubnub) {
	        this.eventEmitter = eventEmitter;
	        this.pubnub = pubnub;
	        this.id = id;
	    }
	    /**
	     * Create channel's app context subscription object for real-time updates.
	     *
	     * Create subscription object which can be used to subscribe to the real-time updates sent to the specific channel
	     * app context object.
	     *
	     * @param [subscriptionOptions] - Channel's app context subscription object behavior customization options.
	     *
	     * @returns Configured and ready to use channel's app context subscription object.
	     */
	    subscription(subscriptionOptions) {
	        {
	            return new Subscription({
	                channels: [this.id],
	                channelGroups: [],
	                subscriptionOptions: subscriptionOptions,
	                eventEmitter: this.eventEmitter,
	                pubnub: this.pubnub,
	            });
	        }
	    }
	}

	/**
	 * First-class objects which provides access to the channel group-specific APIs.
	 */
	class ChannelGroup {
	    /**
	     * Create simple channel entity.
	     *
	     * @param name - Name of the channel group which will be used with subscription loop.
	     * @param eventEmitter - Event emitter, which will notify listeners about updates received on
	     * channel group's subscription.
	     * @param pubnub - PubNub instance which will use this entity.
	     *
	     * @returns Ready to use channel group entity.
	     *
	     * @internal
	     */
	    constructor(name, eventEmitter, pubnub) {
	        this.eventEmitter = eventEmitter;
	        this.pubnub = pubnub;
	        this.name = name;
	    }
	    /**
	     * Create channel group's subscription object for real-time updates.
	     *
	     * Create subscription object which can be used to subscribe to the real-time updates sent to the channels in
	     * specific channel group.
	     *
	     * @param [subscriptionOptions] - Channel group's subscription object behavior customization options.
	     *
	     * @returns Configured and ready to use channel group's subscription object.
	     */
	    subscription(subscriptionOptions) {
	        {
	            const channelGroups = [this.name];
	            if ((subscriptionOptions === null || subscriptionOptions === void 0 ? void 0 : subscriptionOptions.receivePresenceEvents) && !this.name.endsWith('-pnpres'))
	                channelGroups.push(`${this.name}-pnpres`);
	            return new Subscription({
	                channels: [],
	                channelGroups,
	                subscriptionOptions: subscriptionOptions,
	                eventEmitter: this.eventEmitter,
	                pubnub: this.pubnub,
	            });
	        }
	    }
	}

	/**
	 * First-class objects which provides access to the user app context object-specific APIs.
	 */
	class UserMetadata {
	    /**
	     * Create user app context object entity.
	     *
	     * @param id - User app context object identifier which will be used with subscription loop.
	     * @param eventEmitter - Event emitter, which will notify listeners about updates received on
	     * channel's subscription.
	     * @param pubnub - PubNub instance which will use this entity.
	     *
	     * @returns Ready to use user app context object entity.
	     *
	     * @internal
	     */
	    constructor(id, eventEmitter, pubnub) {
	        this.eventEmitter = eventEmitter;
	        this.pubnub = pubnub;
	        this.id = id;
	    }
	    /**
	     * Create user's app context subscription object for real-time updates.
	     *
	     * Create subscription object which can be used to subscribe to the real-time updates sent to the specific user
	     * app context object.
	     *
	     * @param [subscriptionOptions] - User's app context subscription object behavior customization options.
	     *
	     * @returns Configured and ready to use user's app context subscription object.
	     */
	    subscription(subscriptionOptions) {
	        {
	            return new Subscription({
	                channels: [this.id],
	                channelGroups: [],
	                subscriptionOptions: subscriptionOptions,
	                eventEmitter: this.eventEmitter,
	                pubnub: this.pubnub,
	            });
	        }
	    }
	}

	/**
	 * First-class objects which provides access to the channel-specific APIs.
	 */
	class Channel {
	    /**
	     * Create simple channel entity.
	     *
	     * @param name - Name of the channel which will be used with subscription loop.
	     * @param eventEmitter - Event emitter, which will notify listeners about updates received on
	     * channel's subscription.
	     * @param pubnub - PubNub instance which will use this entity.
	     *
	     * @returns Ready to use channel entity.
	     *
	     * @internal
	     */
	    constructor(name, eventEmitter, pubnub) {
	        this.eventEmitter = eventEmitter;
	        this.pubnub = pubnub;
	        this.name = name;
	    }
	    /**
	     * Create channel's subscription object for real-time updates.
	     *
	     * Create subscription object which can be used to subscribe to the real-time updates sent to the specific channel.
	     *
	     * @param [subscriptionOptions] - Channel's subscription object behavior customization options.
	     *
	     * @returns Configured and ready to use channel's subscription object.
	     */
	    subscription(subscriptionOptions) {
	        {
	            const channels = [this.name];
	            if ((subscriptionOptions === null || subscriptionOptions === void 0 ? void 0 : subscriptionOptions.receivePresenceEvents) && !this.name.endsWith('-pnpres'))
	                channels.push(`${this.name}-pnpres`);
	            return new Subscription({
	                channels,
	                channelGroups: [],
	                subscriptionOptions: subscriptionOptions,
	                eventEmitter: this.eventEmitter,
	                pubnub: this.pubnub,
	            });
	        }
	    }
	}

	/**
	 * Remove channel group channels REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Remove channel group channels request.
	 *
	 * @internal
	 */
	// prettier-ignore
	class RemoveChannelGroupChannelsRequest extends AbstractRequest {
	    constructor(parameters) {
	        super();
	        this.parameters = parameters;
	    }
	    operation() {
	        return RequestOperation$1.PNRemoveChannelsFromGroupOperation;
	    }
	    validate() {
	        const { keySet: { subscribeKey }, channels, channelGroup, } = this.parameters;
	        if (!subscribeKey)
	            return 'Missing Subscribe Key';
	        if (!channelGroup)
	            return 'Missing Channel Group';
	        if (!channels)
	            return 'Missing channels';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return {};
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channelGroup, } = this.parameters;
	        return `/v1/channel-registration/sub-key/${subscribeKey}/channel-group/${encodeString(channelGroup)}`;
	    }
	    get queryParameters() {
	        return { remove: this.parameters.channels.join(',') };
	    }
	}

	/**
	 * Add channel group channels REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Add channel group channels request.
	 *
	 * @internal
	 */
	class AddChannelGroupChannelsRequest extends AbstractRequest {
	    constructor(parameters) {
	        super();
	        this.parameters = parameters;
	    }
	    operation() {
	        return RequestOperation$1.PNAddChannelsToGroupOperation;
	    }
	    validate() {
	        const { keySet: { subscribeKey }, channels, channelGroup, } = this.parameters;
	        if (!subscribeKey)
	            return 'Missing Subscribe Key';
	        if (!channelGroup)
	            return 'Missing Channel Group';
	        if (!channels)
	            return 'Missing channels';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return {};
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channelGroup, } = this.parameters;
	        return `/v1/channel-registration/sub-key/${subscribeKey}/channel-group/${encodeString(channelGroup)}`;
	    }
	    get queryParameters() {
	        return { add: this.parameters.channels.join(',') };
	    }
	}

	/**
	 * List channel group channels REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * List Channel Group Channels request.
	 *
	 * @internal
	 */
	class ListChannelGroupChannels extends AbstractRequest {
	    constructor(parameters) {
	        super();
	        this.parameters = parameters;
	    }
	    operation() {
	        return RequestOperation$1.PNChannelsForGroupOperation;
	    }
	    validate() {
	        if (!this.parameters.keySet.subscribeKey)
	            return 'Missing Subscribe Key';
	        if (!this.parameters.channelGroup)
	            return 'Missing Channel Group';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return { channels: serviceResponse.payload.channels };
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channelGroup, } = this.parameters;
	        return `/v1/channel-registration/sub-key/${subscribeKey}/channel-group/${encodeString(channelGroup)}`;
	    }
	}

	/**
	 * Delete channel group REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Channel group delete request.
	 *
	 * @internal
	 */
	class DeleteChannelGroupRequest extends AbstractRequest {
	    constructor(parameters) {
	        super();
	        this.parameters = parameters;
	    }
	    operation() {
	        return RequestOperation$1.PNRemoveGroupOperation;
	    }
	    validate() {
	        if (!this.parameters.keySet.subscribeKey)
	            return 'Missing Subscribe Key';
	        if (!this.parameters.channelGroup)
	            return 'Missing Channel Group';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return {};
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channelGroup, } = this.parameters;
	        return `/v1/channel-registration/sub-key/${subscribeKey}/channel-group/${encodeString(channelGroup)}/remove`;
	    }
	}

	/**
	 * List All Channel Groups REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * List all channel groups request.
	 *
	 * @internal
	 */
	class ListChannelGroupsRequest extends AbstractRequest {
	    constructor(parameters) {
	        super();
	        this.parameters = parameters;
	    }
	    operation() {
	        return RequestOperation$1.PNChannelGroupsOperation;
	    }
	    validate() {
	        if (!this.parameters.keySet.subscribeKey)
	            return 'Missing Subscribe Key';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return { groups: serviceResponse.payload.groups };
	        });
	    }
	    get path() {
	        return `/v1/channel-registration/sub-key/${this.parameters.keySet.subscribeKey}/channel-group`;
	    }
	}

	/**
	 * PubNub Channel Groups API module.
	 */
	/**
	 * PubNub Stream / Channel group API interface.
	 */
	class PubNubChannelGroups {
	    /**
	     * Create stream / channel group API access object.
	     *
	     * @param keySet - PubNub account keys set which should be used for REST API calls.
	     * @param sendRequest - Function which should be used to send REST API calls.
	     *
	     * @internal
	     */
	    constructor(keySet, 
	    /* eslint-disable  @typescript-eslint/no-explicit-any */
	    sendRequest) {
	        this.sendRequest = sendRequest;
	        this.keySet = keySet;
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
	    listChannels(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const request = new ListChannelGroupChannels(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
	    /**
	     * Fetch all channel groups.
	     *
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous get all channel groups response or `void` in case if `callback` provided.
	     *
	     * @deprecated
	     */
	    listGroups(callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const request = new ListChannelGroupsRequest({ keySet: this.keySet });
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
	    /**
	     * Add channels to the channel group.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous add channels to the channel group response or `void` in case if
	     * `callback` provided.
	     */
	    addChannels(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const request = new AddChannelGroupChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
	    /**
	     * Remove channels from the channel group.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous remove channels from the channel group response or `void` in
	     * case if `callback` provided.
	     */
	    removeChannels(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const request = new RemoveChannelGroupChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
	    /**
	     * Remove channel group.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous remove channel group response or `void` in case if `callback` provided.
	     */
	    deleteGroup(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const request = new DeleteChannelGroupRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
	}

	/**
	 * Manage channels enabled for device push REST API module.
	 *
	 * @internal
	 */
	// --------------------------------------------------------
	// ----------------------- Defaults -----------------------
	// --------------------------------------------------------
	// region Defaults
	/**
	 * Environment for which APNS2 notifications
	 */
	const ENVIRONMENT = 'development';
	/**
	 * Maximum number of channels in `list` response.
	 */
	const MAX_COUNT = 1000;
	// endregion
	/**
	 * Base push notification request.
	 *
	 * @internal
	 */
	class BasePushNotificationChannelsRequest extends AbstractRequest {
	    constructor(parameters) {
	        var _a;
	        var _b;
	        super();
	        this.parameters = parameters;
	        // Apply request defaults
	        if (this.parameters.pushGateway === 'apns2')
	            (_a = (_b = this.parameters).environment) !== null && _a !== void 0 ? _a : (_b.environment = ENVIRONMENT);
	        if (this.parameters.count && this.parameters.count > MAX_COUNT)
	            this.parameters.count = MAX_COUNT;
	    }
	    operation() {
	        throw Error('Should be implemented in subclass.');
	    }
	    validate() {
	        const { keySet: { subscribeKey }, action, device, pushGateway, } = this.parameters;
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
	    }
	    parse(_response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            throw Error('Should be implemented in subclass.');
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, action, device, pushGateway, } = this.parameters;
	        let path = pushGateway === 'apns2'
	            ? `/v2/push/sub-key/${subscribeKey}/devices-apns2/${device}`
	            : `/v1/push/sub-key/${subscribeKey}/devices/${device}`;
	        if (action === 'remove-device')
	            path = `${path}/remove`;
	        return path;
	    }
	    get queryParameters() {
	        const { start, count } = this.parameters;
	        let query = Object.assign(Object.assign({ type: this.parameters.pushGateway }, (start ? { start } : {})), (count && count > 0 ? { count } : {}));
	        if ('channels' in this.parameters)
	            query[this.parameters.action] = this.parameters.channels.join(',');
	        if (this.parameters.pushGateway === 'apns2') {
	            const { environment, topic } = this.parameters;
	            query = Object.assign(Object.assign({}, query), { environment: environment, topic });
	        }
	        return query;
	    }
	}

	/**
	 * Unregister Channels from Device push REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Unregister channels from device push request.
	 *
	 * @internal
	 */
	// prettier-ignore
	class RemoveDevicePushNotificationChannelsRequest extends BasePushNotificationChannelsRequest {
	    constructor(parameters) {
	        super(Object.assign(Object.assign({}, parameters), { action: 'remove' }));
	    }
	    operation() {
	        return RequestOperation$1.PNRemovePushNotificationEnabledChannelsOperation;
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse)
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            return {};
	        });
	    }
	}

	/**
	 * List Device push enabled channels REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * List device push enabled channels request.
	 *
	 * @internal
	 */
	// prettier-ignore
	class ListDevicePushNotificationChannelsRequest extends BasePushNotificationChannelsRequest {
	    constructor(parameters) {
	        super(Object.assign(Object.assign({}, parameters), { action: 'list' }));
	    }
	    operation() {
	        return RequestOperation$1.PNPushNotificationEnabledChannelsOperation;
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse)
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            return { channels: serviceResponse };
	        });
	    }
	}

	/**
	 * Register Channels with Device push REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Register channels with device push request.
	 *
	 * @internal
	 */
	// prettier-ignore
	class AddDevicePushNotificationChannelsRequest extends BasePushNotificationChannelsRequest {
	    constructor(parameters) {
	        super(Object.assign(Object.assign({}, parameters), { action: 'add' }));
	    }
	    operation() {
	        return RequestOperation$1.PNAddPushNotificationEnabledChannelsOperation;
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse)
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            return {};
	        });
	    }
	}

	/**
	 * Unregister Device push REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Unregister device push notifications request.
	 *
	 * @internal
	 */
	// prettier-ignore
	class RemoveDevicePushNotificationRequest extends BasePushNotificationChannelsRequest {
	    constructor(parameters) {
	        super(Object.assign(Object.assign({}, parameters), { action: 'remove-device' }));
	    }
	    operation() {
	        return RequestOperation$1.PNRemoveAllPushNotificationsOperation;
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse)
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            return {};
	        });
	    }
	}

	/**
	 * PubNub Push Notifications API module.
	 */
	/**
	 * PubNub Push Notifications API interface.
	 */
	class PubNubPushNotifications {
	    /**
	     * Create mobile push notifications API access object.
	     *
	     * @param keySet - PubNub account keys set which should be used for REST API calls.
	     * @param sendRequest - Function which should be used to send REST API calls.
	     *
	     * @internal
	     */
	    constructor(keySet, 
	    /* eslint-disable  @typescript-eslint/no-explicit-any */
	    sendRequest) {
	        this.sendRequest = sendRequest;
	        this.keySet = keySet;
	    }
	    /**
	     * Fetch device's push notification enabled channels.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous get device channels response or `void` in case if `callback` provided.
	     */
	    listChannels(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const request = new ListDevicePushNotificationChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
	    /**
	     * Enable push notifications on channels for device.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     */
	    addChannels(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const request = new AddDevicePushNotificationChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
	    /**
	     * Disable push notifications on channels for device.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     */
	    removeChannels(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const request = new RemoveDevicePushNotificationChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
	    /**
	     * Disable push notifications for device.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     */
	    deleteDevice(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const request = new RemoveDevicePushNotificationRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
	}

	/**
	 * Get All Channel Metadata REST API module.
	 *
	 * @internal
	 */
	// --------------------------------------------------------
	// ----------------------- Defaults -----------------------
	// --------------------------------------------------------
	// region Defaults
	/**
	 * Whether `Channel` custom fields should be included in response or not.
	 */
	const INCLUDE_CUSTOM_FIELDS$9 = false;
	/**
	 * Whether total number of channels should be included in response or not.
	 */
	const INCLUDE_TOTAL_COUNT$4 = false;
	/**
	 * Number of objects to return in response.
	 */
	const LIMIT$5 = 100;
	// endregion
	/**
	 * Get All Channels Metadata request.
	 *
	 * @internal
	 */
	class GetAllChannelsMetadataRequest extends AbstractRequest {
	    constructor(parameters) {
	        var _a, _b, _c, _d;
	        var _e, _f;
	        super();
	        this.parameters = parameters;
	        // Apply default request parameters.
	        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
	        (_b = (_e = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_e.customFields = INCLUDE_CUSTOM_FIELDS$9);
	        (_c = (_f = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_f.totalCount = INCLUDE_TOTAL_COUNT$4);
	        (_d = parameters.limit) !== null && _d !== void 0 ? _d : (parameters.limit = LIMIT$5);
	    }
	    operation() {
	        return RequestOperation$1.PNGetAllChannelMetadataOperation;
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return serviceResponse;
	        });
	    }
	    get path() {
	        return `/v2/objects/${this.parameters.keySet.subscribeKey}/channels`;
	    }
	    get queryParameters() {
	        const { include, page, filter, sort, limit } = this.parameters;
	        let sorting = '';
	        if (typeof sort === 'string')
	            sorting = sort;
	        else
	            sorting = Object.entries(sort !== null && sort !== void 0 ? sort : {}).map(([option, order]) => (order !== null ? `${option}:${order}` : option));
	        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ include: ['status', 'type', ...(include.customFields ? ['custom'] : [])].join(','), count: `${include.totalCount}` }, (filter ? { filter } : {})), ((page === null || page === void 0 ? void 0 : page.next) ? { start: page.next } : {})), ((page === null || page === void 0 ? void 0 : page.prev) ? { end: page.prev } : {})), (limit ? { limit } : {})), (sorting.length ? { sort: sorting } : {}));
	    }
	}

	/**
	 * Remove Channel Metadata REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Remove Channel Metadata request.
	 *
	 * @internal
	 */
	class RemoveChannelMetadataRequest extends AbstractRequest {
	    constructor(parameters) {
	        super({ method: TransportMethod.DELETE });
	        this.parameters = parameters;
	    }
	    operation() {
	        return RequestOperation$1.PNRemoveChannelMetadataOperation;
	    }
	    validate() {
	        if (!this.parameters.channel)
	            return 'Channel cannot be empty';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return serviceResponse;
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channel, } = this.parameters;
	        return `/v2/objects/${subscribeKey}/channels/${encodeString(channel)}`;
	    }
	}

	/**
	 * Get UUID Memberships REST API module.
	 *
	 * @internal
	 */
	// --------------------------------------------------------
	// ----------------------- Defaults -----------------------
	// --------------------------------------------------------
	// region Defaults
	/**
	 * Whether `Membership` custom field should be included in response or not.
	 */
	const INCLUDE_CUSTOM_FIELDS$8 = false;
	/**
	 * Whether membership's status field should be included in response or not.
	 */
	const INCLUDE_STATUS$1 = false;
	/**
	 * Whether total number of memberships should be included in response or not.
	 */
	const INCLUDE_TOTAL_COUNT$3 = false;
	/**
	 * Whether `Channel` fields should be included in response or not.
	 */
	const INCLUDE_CHANNEL_FIELDS$1 = false;
	/**
	 * Whether `Channel` status field should be included in response or not.
	 */
	const INCLUDE_CHANNEL_STATUS_FIELD = false;
	/**
	 * Whether `Channel` type field should be included in response or not.
	 */
	const INCLUDE_CHANNEL_TYPE_FIELD = false;
	/**
	 * Whether `Channel` custom field should be included in response or not.
	 */
	const INCLUDE_CHANNEL_CUSTOM_FIELDS$1 = false;
	/**
	 * Number of objects to return in response.
	 */
	const LIMIT$4 = 100;
	// endregion
	/**
	 * Get UUID Memberships request.
	 *
	 * @internal
	 */
	class GetUUIDMembershipsRequest extends AbstractRequest {
	    constructor(parameters) {
	        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
	        var _k, _l, _m, _o, _p, _q, _r;
	        super();
	        this.parameters = parameters;
	        // Apply default request parameters.
	        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
	        (_b = (_k = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_k.customFields = INCLUDE_CUSTOM_FIELDS$8);
	        (_c = (_l = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_l.totalCount = INCLUDE_TOTAL_COUNT$3);
	        (_d = (_m = parameters.include).statusField) !== null && _d !== void 0 ? _d : (_m.statusField = INCLUDE_STATUS$1);
	        (_e = (_o = parameters.include).channelFields) !== null && _e !== void 0 ? _e : (_o.channelFields = INCLUDE_CHANNEL_FIELDS$1);
	        (_f = (_p = parameters.include).customChannelFields) !== null && _f !== void 0 ? _f : (_p.customChannelFields = INCLUDE_CHANNEL_CUSTOM_FIELDS$1);
	        (_g = (_q = parameters.include).channelStatusField) !== null && _g !== void 0 ? _g : (_q.channelStatusField = INCLUDE_CHANNEL_STATUS_FIELD);
	        (_h = (_r = parameters.include).channelTypeField) !== null && _h !== void 0 ? _h : (_r.channelTypeField = INCLUDE_CHANNEL_TYPE_FIELD);
	        (_j = parameters.limit) !== null && _j !== void 0 ? _j : (parameters.limit = LIMIT$4);
	        // Remap for backward compatibility.
	        if (this.parameters.userId)
	            this.parameters.uuid = this.parameters.userId;
	    }
	    operation() {
	        return RequestOperation$1.PNGetMembershipsOperation;
	    }
	    validate() {
	        if (!this.parameters.uuid)
	            return "'uuid' cannot be empty";
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return serviceResponse;
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, uuid, } = this.parameters;
	        return `/v2/objects/${subscribeKey}/uuids/${encodeString(uuid)}/channels`;
	    }
	    get queryParameters() {
	        const { include, page, filter, sort, limit } = this.parameters;
	        let sorting = '';
	        if (typeof sort === 'string')
	            sorting = sort;
	        else
	            sorting = Object.entries(sort !== null && sort !== void 0 ? sort : {}).map(([option, order]) => (order !== null ? `${option}:${order}` : option));
	        const includeFlags = [];
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
	        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ count: `${include.totalCount}` }, (includeFlags.length > 0 ? { include: includeFlags.join(',') } : {})), (filter ? { filter } : {})), ((page === null || page === void 0 ? void 0 : page.next) ? { start: page.next } : {})), ((page === null || page === void 0 ? void 0 : page.prev) ? { end: page.prev } : {})), (limit ? { limit } : {})), (sorting.length ? { sort: sorting } : {}));
	    }
	}

	/**
	 * Set UUID Memberships REST API module.
	 *
	 * @internal
	 */
	// --------------------------------------------------------
	// ----------------------- Defaults -----------------------
	// --------------------------------------------------------
	// region Defaults
	/**
	 * Whether `Membership` custom field should be included in response or not.
	 */
	const INCLUDE_CUSTOM_FIELDS$7 = false;
	/**
	 * Whether total number of memberships should be included in response or not.
	 */
	const INCLUDE_TOTAL_COUNT$2 = false;
	/**
	 * Whether `Channel` fields should be included in response or not.
	 */
	const INCLUDE_CHANNEL_FIELDS = false;
	/**
	 * Whether `Channel` custom field should be included in response or not.
	 */
	const INCLUDE_CHANNEL_CUSTOM_FIELDS = false;
	/**
	 * Number of objects to return in response.
	 */
	const LIMIT$3 = 100;
	// endregion
	/**
	 * Set UUID Memberships request.
	 *
	 * @internal
	 */
	class SetUUIDMembershipsRequest extends AbstractRequest {
	    constructor(parameters) {
	        var _a, _b, _c, _d, _e, _f;
	        var _g, _h, _j, _k;
	        super({ method: TransportMethod.PATCH });
	        this.parameters = parameters;
	        // Apply default request parameters.
	        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
	        (_b = (_g = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_g.customFields = INCLUDE_CUSTOM_FIELDS$7);
	        (_c = (_h = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_h.totalCount = INCLUDE_TOTAL_COUNT$2);
	        (_d = (_j = parameters.include).channelFields) !== null && _d !== void 0 ? _d : (_j.channelFields = INCLUDE_CHANNEL_FIELDS);
	        (_e = (_k = parameters.include).customChannelFields) !== null && _e !== void 0 ? _e : (_k.customChannelFields = INCLUDE_CHANNEL_CUSTOM_FIELDS);
	        (_f = parameters.limit) !== null && _f !== void 0 ? _f : (parameters.limit = LIMIT$3);
	        // Remap for backward compatibility.
	        if (this.parameters.userId)
	            this.parameters.uuid = this.parameters.userId;
	    }
	    operation() {
	        return RequestOperation$1.PNSetMembershipsOperation;
	    }
	    validate() {
	        const { uuid, channels } = this.parameters;
	        if (!uuid)
	            return "'uuid' cannot be empty";
	        if (!channels || channels.length === 0)
	            return 'Channels cannot be empty';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return serviceResponse;
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, uuid, } = this.parameters;
	        return `/v2/objects/${subscribeKey}/uuids/${encodeString(uuid)}/channels`;
	    }
	    get queryParameters() {
	        const { include, page, filter, sort, limit } = this.parameters;
	        let sorting = '';
	        if (typeof sort === 'string')
	            sorting = sort;
	        else
	            sorting = Object.entries(sort !== null && sort !== void 0 ? sort : {}).map(([option, order]) => (order !== null ? `${option}:${order}` : option));
	        const includeFlags = ['channel.status', 'channel.type', 'status'];
	        if (include.customFields)
	            includeFlags.push('custom');
	        if (include.channelFields)
	            includeFlags.push('channel');
	        if (include.customChannelFields)
	            includeFlags.push('channel.custom');
	        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ count: `${include.totalCount}` }, (includeFlags.length > 0 ? { include: includeFlags.join(',') } : {})), (filter ? { filter } : {})), ((page === null || page === void 0 ? void 0 : page.next) ? { start: page.next } : {})), ((page === null || page === void 0 ? void 0 : page.prev) ? { end: page.prev } : {})), (limit ? { limit } : {})), (sorting.length ? { sort: sorting } : {}));
	    }
	    get body() {
	        const { channels, type } = this.parameters;
	        return JSON.stringify({
	            [`${type}`]: channels.map((channel) => {
	                if (typeof channel === 'string') {
	                    return { channel: { id: channel } };
	                }
	                else {
	                    return { channel: { id: channel.id }, status: channel.status, custom: channel.custom };
	                }
	            }),
	        });
	    }
	}

	/**
	 * Get All UUID Metadata REST API module.
	 *
	 * @internal
	 */
	// --------------------------------------------------------
	// ----------------------- Defaults -----------------------
	// --------------------------------------------------------
	// region Defaults
	/**
	 * Whether `Channel` custom field should be included by default or not.
	 */
	const INCLUDE_CUSTOM_FIELDS$6 = false;
	/**
	 * Number of objects to return in response.
	 */
	const LIMIT$2 = 100;
	// endregion
	/**
	 * Get All UUIDs Metadata request.
	 *
	 * @internal
	 */
	class GetAllUUIDMetadataRequest extends AbstractRequest {
	    constructor(parameters) {
	        var _a, _b, _c;
	        var _d;
	        super();
	        this.parameters = parameters;
	        // Apply default request parameters.
	        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
	        (_b = (_d = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_d.customFields = INCLUDE_CUSTOM_FIELDS$6);
	        (_c = parameters.limit) !== null && _c !== void 0 ? _c : (parameters.limit = LIMIT$2);
	    }
	    operation() {
	        return RequestOperation$1.PNGetAllUUIDMetadataOperation;
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return serviceResponse;
	        });
	    }
	    get path() {
	        return `/v2/objects/${this.parameters.keySet.subscribeKey}/uuids`;
	    }
	    get queryParameters() {
	        const { include, page, filter, sort, limit } = this.parameters;
	        let sorting = '';
	        if (typeof sort === 'string')
	            sorting = sort;
	        else
	            sorting = Object.entries(sort !== null && sort !== void 0 ? sort : {}).map(([option, order]) => (order !== null ? `${option}:${order}` : option));
	        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ include: ['status', 'type', ...(include.customFields ? ['custom'] : [])].join(',') }, (include.totalCount !== undefined ? { count: `${include.totalCount}` } : {})), (filter ? { filter } : {})), ((page === null || page === void 0 ? void 0 : page.next) ? { start: page.next } : {})), ((page === null || page === void 0 ? void 0 : page.prev) ? { end: page.prev } : {})), (limit ? { limit } : {})), (sorting.length ? { sort: sorting } : {}));
	    }
	}

	/**
	 * Get Channel Metadata REST API module.
	 *
	 * @internal
	 */
	// --------------------------------------------------------
	// ----------------------- Defaults -----------------------
	// --------------------------------------------------------
	// region Defaults
	/**
	 * Whether `Channel` custom field should be included by default or not.
	 */
	const INCLUDE_CUSTOM_FIELDS$5 = true;
	// endregion
	/**
	 * Get Channel Metadata request.
	 *
	 * @internal
	 */
	class GetChannelMetadataRequest extends AbstractRequest {
	    constructor(parameters) {
	        var _a, _b;
	        var _c;
	        super();
	        this.parameters = parameters;
	        // Apply default request parameters.
	        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
	        (_b = (_c = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_c.customFields = INCLUDE_CUSTOM_FIELDS$5);
	    }
	    operation() {
	        return RequestOperation$1.PNGetChannelMetadataOperation;
	    }
	    validate() {
	        if (!this.parameters.channel)
	            return 'Channel cannot be empty';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return serviceResponse;
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channel, } = this.parameters;
	        return `/v2/objects/${subscribeKey}/channels/${encodeString(channel)}`;
	    }
	    get queryParameters() {
	        return {
	            include: ['status', 'type', ...(this.parameters.include.customFields ? ['custom'] : [])].join(','),
	        };
	    }
	}

	/**
	 * Set Channel Metadata REST API module.
	 *
	 * @internal
	 */
	// --------------------------------------------------------
	// ----------------------- Defaults -----------------------
	// --------------------------------------------------------
	// region Defaults
	/**
	 * Whether `Channel` custom field should be included by default or not.
	 */
	const INCLUDE_CUSTOM_FIELDS$4 = true;
	// endregion
	/**
	 * Set Channel Metadata request.
	 *
	 * @internal
	 */
	class SetChannelMetadataRequest extends AbstractRequest {
	    constructor(parameters) {
	        var _a, _b;
	        var _c;
	        super({ method: TransportMethod.PATCH });
	        this.parameters = parameters;
	        // Apply default request parameters.
	        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
	        (_b = (_c = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_c.customFields = INCLUDE_CUSTOM_FIELDS$4);
	    }
	    operation() {
	        return RequestOperation$1.PNSetChannelMetadataOperation;
	    }
	    validate() {
	        if (!this.parameters.channel)
	            return 'Channel cannot be empty';
	        if (!this.parameters.data)
	            return 'Data cannot be empty';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return serviceResponse;
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channel, } = this.parameters;
	        return `/v2/objects/${subscribeKey}/channels/${encodeString(channel)}`;
	    }
	    get queryParameters() {
	        return {
	            include: ['status', 'type', ...(this.parameters.include.customFields ? ['custom'] : [])].join(','),
	        };
	    }
	    get body() {
	        return JSON.stringify(this.parameters.data);
	    }
	}

	/**
	 * Remove UUID Metadata REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Remove UUID Metadata request.
	 *
	 * @internal
	 */
	class RemoveUUIDMetadataRequest extends AbstractRequest {
	    constructor(parameters) {
	        super({ method: TransportMethod.DELETE });
	        this.parameters = parameters;
	        // Remap for backward compatibility.
	        if (this.parameters.userId)
	            this.parameters.uuid = this.parameters.userId;
	    }
	    operation() {
	        return RequestOperation$1.PNRemoveUUIDMetadataOperation;
	    }
	    validate() {
	        if (!this.parameters.uuid)
	            return "'uuid' cannot be empty";
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return serviceResponse;
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, uuid, } = this.parameters;
	        return `/v2/objects/${subscribeKey}/uuids/${encodeString(uuid)}`;
	    }
	}

	/**
	 * Get Channel Members REST API module.
	 *
	 * @internal
	 */
	// --------------------------------------------------------
	// ----------------------- Defaults -----------------------
	// --------------------------------------------------------
	// region Defaults
	/**
	 * Whether `Member` custom field should be included in response or not.
	 */
	const INCLUDE_CUSTOM_FIELDS$3 = false;
	/**
	 * Whether member's status field should be included in response or not.
	 */
	const INCLUDE_STATUS = false;
	/**
	 * Whether total number of members should be included in response or not.
	 */
	const INCLUDE_TOTAL_COUNT$1 = false;
	/**
	 * Whether `UUID` fields should be included in response or not.
	 */
	const INCLUDE_UUID_FIELDS$1 = false;
	/**
	 * Whether `UUID` status field should be included in response or not.
	 */
	const INCLUDE_UUID_STATUS_FIELD = false;
	/**
	 * Whether `UUID` type field should be included in response or not.
	 */
	const INCLUDE_UUID_TYPE_FIELD = false;
	/**
	 * Whether `UUID` custom field should be included in response or not.
	 */
	const INCLUDE_UUID_CUSTOM_FIELDS$1 = false;
	/**
	 * Number of objects to return in response.
	 */
	const LIMIT$1 = 100;
	// endregion
	/**
	 * Get Channel Members request.
	 *
	 * @internal
	 */
	class GetChannelMembersRequest extends AbstractRequest {
	    constructor(parameters) {
	        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
	        var _k, _l, _m, _o, _p, _q, _r;
	        super();
	        this.parameters = parameters;
	        // Apply default request parameters.
	        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
	        (_b = (_k = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_k.customFields = INCLUDE_CUSTOM_FIELDS$3);
	        (_c = (_l = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_l.totalCount = INCLUDE_TOTAL_COUNT$1);
	        (_d = (_m = parameters.include).statusField) !== null && _d !== void 0 ? _d : (_m.statusField = INCLUDE_STATUS);
	        (_e = (_o = parameters.include).UUIDFields) !== null && _e !== void 0 ? _e : (_o.UUIDFields = INCLUDE_UUID_FIELDS$1);
	        (_f = (_p = parameters.include).customUUIDFields) !== null && _f !== void 0 ? _f : (_p.customUUIDFields = INCLUDE_UUID_CUSTOM_FIELDS$1);
	        (_g = (_q = parameters.include).UUIDStatusField) !== null && _g !== void 0 ? _g : (_q.UUIDStatusField = INCLUDE_UUID_STATUS_FIELD);
	        (_h = (_r = parameters.include).UUIDTypeField) !== null && _h !== void 0 ? _h : (_r.UUIDTypeField = INCLUDE_UUID_TYPE_FIELD);
	        (_j = parameters.limit) !== null && _j !== void 0 ? _j : (parameters.limit = LIMIT$1);
	    }
	    operation() {
	        return RequestOperation$1.PNSetMembersOperation;
	    }
	    validate() {
	        if (!this.parameters.channel)
	            return 'Channel cannot be empty';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return serviceResponse;
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channel, } = this.parameters;
	        return `/v2/objects/${subscribeKey}/channels/${encodeString(channel)}/uuids`;
	    }
	    get queryParameters() {
	        const { include, page, filter, sort, limit } = this.parameters;
	        let sorting = '';
	        if (typeof sort === 'string')
	            sorting = sort;
	        else
	            sorting = Object.entries(sort !== null && sort !== void 0 ? sort : {}).map(([option, order]) => (order !== null ? `${option}:${order}` : option));
	        const includeFlags = [];
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
	        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ count: `${include.totalCount}` }, (includeFlags.length > 0 ? { include: includeFlags.join(',') } : {})), (filter ? { filter } : {})), ((page === null || page === void 0 ? void 0 : page.next) ? { start: page.next } : {})), ((page === null || page === void 0 ? void 0 : page.prev) ? { end: page.prev } : {})), (limit ? { limit } : {})), (sorting.length ? { sort: sorting } : {}));
	    }
	}

	/**
	 * Set Channel Members REST API module.
	 *
	 * @internal
	 */
	// --------------------------------------------------------
	// ----------------------- Defaults -----------------------
	// --------------------------------------------------------
	// region Defaults
	/**
	 * Whether `Member` custom field should be included in response or not.
	 */
	const INCLUDE_CUSTOM_FIELDS$2 = false;
	/**
	 * Whether total number of members should be included in response or not.
	 */
	const INCLUDE_TOTAL_COUNT = false;
	/**
	 * Whether `UUID` fields should be included in response or not.
	 */
	const INCLUDE_UUID_FIELDS = false;
	/**
	 * Whether `UUID` custom field should be included in response or not.
	 */
	const INCLUDE_UUID_CUSTOM_FIELDS = false;
	/**
	 * Number of objects to return in response.
	 */
	const LIMIT = 100;
	// endregion
	/**
	 * Set Channel Members request.
	 *
	 * @internal
	 */
	class SetChannelMembersRequest extends AbstractRequest {
	    constructor(parameters) {
	        var _a, _b, _c, _d, _e, _f;
	        var _g, _h, _j, _k;
	        super({ method: TransportMethod.PATCH });
	        this.parameters = parameters;
	        // Apply default request parameters.
	        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
	        (_b = (_g = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_g.customFields = INCLUDE_CUSTOM_FIELDS$2);
	        (_c = (_h = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_h.totalCount = INCLUDE_TOTAL_COUNT);
	        (_d = (_j = parameters.include).UUIDFields) !== null && _d !== void 0 ? _d : (_j.UUIDFields = INCLUDE_UUID_FIELDS);
	        (_e = (_k = parameters.include).customUUIDFields) !== null && _e !== void 0 ? _e : (_k.customUUIDFields = INCLUDE_UUID_CUSTOM_FIELDS);
	        (_f = parameters.limit) !== null && _f !== void 0 ? _f : (parameters.limit = LIMIT);
	    }
	    operation() {
	        return RequestOperation$1.PNSetMembersOperation;
	    }
	    validate() {
	        const { channel, uuids } = this.parameters;
	        if (!channel)
	            return 'Channel cannot be empty';
	        if (!uuids || uuids.length === 0)
	            return 'UUIDs cannot be empty';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return serviceResponse;
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channel, } = this.parameters;
	        return `/v2/objects/${subscribeKey}/channels/${encodeString(channel)}/uuids`;
	    }
	    get queryParameters() {
	        const { include, page, filter, sort, limit } = this.parameters;
	        let sorting = '';
	        if (typeof sort === 'string')
	            sorting = sort;
	        else
	            sorting = Object.entries(sort !== null && sort !== void 0 ? sort : {}).map(([option, order]) => (order !== null ? `${option}:${order}` : option));
	        const includeFlags = ['uuid.status', 'uuid.type', 'type'];
	        if (include.customFields)
	            includeFlags.push('custom');
	        if (include.UUIDFields)
	            includeFlags.push('uuid');
	        if (include.customUUIDFields)
	            includeFlags.push('uuid.custom');
	        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ count: `${include.totalCount}` }, (includeFlags.length > 0 ? { include: includeFlags.join(',') } : {})), (filter ? { filter } : {})), ((page === null || page === void 0 ? void 0 : page.next) ? { start: page.next } : {})), ((page === null || page === void 0 ? void 0 : page.prev) ? { end: page.prev } : {})), (limit ? { limit } : {})), (sorting.length ? { sort: sorting } : {}));
	    }
	    get body() {
	        const { uuids, type } = this.parameters;
	        return JSON.stringify({
	            [`${type}`]: uuids.map((uuid) => {
	                if (typeof uuid === 'string') {
	                    return { uuid: { id: uuid } };
	                }
	                else {
	                    return { uuid: { id: uuid.id }, status: uuid.status, custom: uuid.custom };
	                }
	            }),
	        });
	    }
	}

	/**
	 * Get UUID Metadata REST API module.
	 *
	 * @internal
	 */
	// --------------------------------------------------------
	// ----------------------- Defaults -----------------------
	// --------------------------------------------------------
	// region Defaults
	/**
	 * Whether UUID custom field should be included by default or not.
	 */
	const INCLUDE_CUSTOM_FIELDS$1 = true;
	// endregion
	/**
	 * Get UUID Metadata request.
	 *
	 * @internal
	 */
	class GetUUIDMetadataRequest extends AbstractRequest {
	    constructor(parameters) {
	        var _a, _b;
	        var _c;
	        super();
	        this.parameters = parameters;
	        // Apply default request parameters.
	        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
	        (_b = (_c = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_c.customFields = INCLUDE_CUSTOM_FIELDS$1);
	        // Remap for backward compatibility.
	        if (this.parameters.userId)
	            this.parameters.uuid = this.parameters.userId;
	    }
	    operation() {
	        return RequestOperation$1.PNGetUUIDMetadataOperation;
	    }
	    validate() {
	        if (!this.parameters.uuid)
	            return "'uuid' cannot be empty";
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return serviceResponse;
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, uuid, } = this.parameters;
	        return `/v2/objects/${subscribeKey}/uuids/${encodeString(uuid)}`;
	    }
	    get queryParameters() {
	        const { include } = this.parameters;
	        return { include: ['status', 'type', ...(include.customFields ? ['custom'] : [])].join(',') };
	    }
	}

	/**
	 * Set UUID Metadata REST API module.
	 *
	 * @internal
	 */
	// --------------------------------------------------------
	// ----------------------- Defaults -----------------------
	// --------------------------------------------------------
	// region Defaults
	/**
	 * Whether `Channel` custom field should be included by default or not.
	 */
	const INCLUDE_CUSTOM_FIELDS = true;
	// endregion
	/**
	 * Set UUID Metadata request.
	 *
	 * @internal
	 */
	class SetUUIDMetadataRequest extends AbstractRequest {
	    constructor(parameters) {
	        var _a, _b;
	        var _c;
	        super({ method: TransportMethod.PATCH });
	        this.parameters = parameters;
	        // Apply default request parameters.
	        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
	        (_b = (_c = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_c.customFields = INCLUDE_CUSTOM_FIELDS);
	        // Remap for backward compatibility.
	        if (this.parameters.userId)
	            this.parameters.uuid = this.parameters.userId;
	    }
	    operation() {
	        return RequestOperation$1.PNSetUUIDMetadataOperation;
	    }
	    validate() {
	        if (!this.parameters.uuid)
	            return "'uuid' cannot be empty";
	        if (!this.parameters.data)
	            return 'Data cannot be empty';
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            }
	            else if (serviceResponse.status >= 400)
	                throw PubNubAPIError.create(response);
	            return serviceResponse;
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, uuid, } = this.parameters;
	        return `/v2/objects/${subscribeKey}/uuids/${encodeString(uuid)}`;
	    }
	    get queryParameters() {
	        return {
	            include: ['status', 'type', ...(this.parameters.include.customFields ? ['custom'] : [])].join(','),
	        };
	    }
	    get body() {
	        return JSON.stringify(this.parameters.data);
	    }
	}

	/**
	 * PubNub Objects API module.
	 */
	/**
	 * PubNub App Context API interface.
	 */
	class PubNubObjects {
	    /**
	     * Create app context API access object.
	     *
	     * @param configuration - Extended PubNub client configuration object.
	     * @param sendRequest - Function which should be used to send REST API calls.
	     *
	     * @internal
	     */
	    constructor(configuration, 
	    /* eslint-disable  @typescript-eslint/no-explicit-any */
	    sendRequest) {
	        this.keySet = configuration.keySet;
	        this.configuration = configuration;
	        this.sendRequest = sendRequest;
	    }
	    /**
	     * Fetch a paginated list of UUID Metadata objects.
	     *
	     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous get all UUID metadata response or `void` in case if `callback` provided.
	     */
	    getAllUUIDMetadata(parametersOrCallback, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this._getAllUUIDMetadata(parametersOrCallback, callback);
	        });
	    }
	    /**
	     * Fetch a paginated list of UUID Metadata objects.
	     *
	     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous get all UUID metadata response or `void` in case if `callback` provided.
	     *
	     * @internal
	     */
	    _getAllUUIDMetadata(parametersOrCallback, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            // Get user request parameters.
	            const parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
	            callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
	            const request = new GetAllUUIDMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
	    /**
	     * Fetch a specific UUID Metadata object.
	     *
	     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous get UUID metadata response or `void` in case if `callback` provided.
	     */
	    getUUIDMetadata(parametersOrCallback, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this._getUUIDMetadata(parametersOrCallback, callback);
	        });
	    }
	    /**
	     * Fetch a specific UUID Metadata object.
	     *
	     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous get UUID metadata response or `void` in case if `callback` provided.
	     *
	     * @internal
	     */
	    _getUUIDMetadata(parametersOrCallback, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a;
	            // Get user request parameters.
	            const parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
	            callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
	            if (parameters.userId)
	                parameters.uuid = parameters.userId;
	            (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
	            const request = new GetUUIDMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
	    /**
	     * Update specific UUID Metadata object.
	     *
	     * @param parameters - Request configuration parameters. Will set UUID metadata for currently
	     * configured PubNub client `uuid` if not set.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous set UUID metadata response or `void` in case if `callback` provided.
	     */
	    setUUIDMetadata(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this._setUUIDMetadata(parameters, callback);
	        });
	    }
	    /**
	     * Update specific UUID Metadata object.
	     *
	     * @internal
	     *
	     * @param parameters - Request configuration parameters. Will set UUID metadata for currently
	     * configured PubNub client `uuid` if not set.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous set UUID metadata response or `void` in case if `callback` provided.
	     */
	    _setUUIDMetadata(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a;
	            if (parameters.userId)
	                parameters.uuid = parameters.userId;
	            (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
	            const request = new SetUUIDMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
	    /**
	     * Remove a specific UUID Metadata object.
	     *
	     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous UUID metadata remove response or `void` in case if `callback` provided.
	     */
	    removeUUIDMetadata(parametersOrCallback, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this._removeUUIDMetadata(parametersOrCallback, callback);
	        });
	    }
	    /**
	     * Remove a specific UUID Metadata object.
	     *
	     * @internal
	     *
	     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous UUID metadata remove response or `void` in case if `callback` provided.
	     */
	    _removeUUIDMetadata(parametersOrCallback, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a;
	            // Get user request parameters.
	            const parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
	            callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
	            if (parameters.userId)
	                parameters.uuid = parameters.userId;
	            (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
	            const request = new RemoveUUIDMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
	    /**
	     * Fetch a paginated list of Channel Metadata objects.
	     *
	     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous get all Channel metadata response or `void` in case if `callback`
	     * provided.
	     */
	    getAllChannelMetadata(parametersOrCallback, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this._getAllChannelMetadata(parametersOrCallback, callback);
	        });
	    }
	    /**
	     * Fetch a paginated list of Channel Metadata objects.
	     *
	     * @internal
	     *
	     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous get all Channel metadata response or `void` in case if `callback`
	     * provided.
	     */
	    _getAllChannelMetadata(parametersOrCallback, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            // Get user request parameters.
	            const parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
	            callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
	            const request = new GetAllChannelsMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
	    /**
	     * Fetch Channel Metadata object.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous get Channel metadata response or `void` in case if `callback` provided.
	     */
	    getChannelMetadata(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this._getChannelMetadata(parameters, callback);
	        });
	    }
	    /**
	     * Fetch Channel Metadata object.
	     *
	     * @internal
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous get Channel metadata response or `void` in case if `callback` provided.
	     */
	    _getChannelMetadata(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const request = new GetChannelMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
	    /**
	     * Update specific Channel Metadata object.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous set Channel metadata response or `void` in case if `callback` provided.
	     */
	    setChannelMetadata(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this._setChannelMetadata(parameters, callback);
	        });
	    }
	    /**
	     * Update specific Channel Metadata object.
	     *
	     * @internal
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous set Channel metadata response or `void` in case if `callback` provided.
	     */
	    _setChannelMetadata(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const request = new SetChannelMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
	    /**
	     * Remove a specific Channel Metadata object.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous Channel metadata remove response or `void` in case if `callback`
	     * provided.
	     */
	    removeChannelMetadata(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this._removeChannelMetadata(parameters, callback);
	        });
	    }
	    /**
	     * Remove a specific Channel Metadata object.
	     *
	     * @internal
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous Channel metadata remove response or `void` in case if `callback`
	     * provided.
	     */
	    _removeChannelMetadata(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const request = new RemoveChannelMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
	    /**
	     * Fetch a paginated list of Channel Member objects.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous get Channel Members response or `void` in case if `callback` provided.
	     */
	    getChannelMembers(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const request = new GetChannelMembersRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
	    /**
	     * Update specific Channel Members list.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous update Channel members list response or `void` in case if `callback`
	     * provided.
	     */
	    setChannelMembers(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const request = new SetChannelMembersRequest(Object.assign(Object.assign({}, parameters), { type: 'set', keySet: this.keySet }));
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
	    /**
	     * Remove Members from the Channel.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous Channel Members remove response or `void` in case if `callback` provided.
	     */
	    removeChannelMembers(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const request = new SetChannelMembersRequest(Object.assign(Object.assign({}, parameters), { type: 'delete', keySet: this.keySet }));
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
	    /**
	     * Fetch a specific UUID Memberships list.
	     *
	     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous get UUID Memberships response or `void` in case if `callback` provided.
	     */
	    getMemberships(parametersOrCallback, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a;
	            // Get user request parameters.
	            const parameters = parametersOrCallback && typeof parametersOrCallback !== 'function' ? parametersOrCallback : {};
	            callback !== null && callback !== void 0 ? callback : (callback = typeof parametersOrCallback === 'function' ? parametersOrCallback : undefined);
	            if (parameters.userId)
	                parameters.uuid = parameters.userId;
	            (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
	            const request = new GetUUIDMembershipsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
	    /**
	     * Update specific UUID Memberships list.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous update UUID Memberships list response or `void` in case if `callback`
	     * provided.
	     */
	    setMemberships(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a;
	            if (parameters.userId)
	                parameters.uuid = parameters.userId;
	            (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
	            const request = new SetUUIDMembershipsRequest(Object.assign(Object.assign({}, parameters), { type: 'set', keySet: this.keySet }));
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
	    /**
	     * Remove a specific UUID Memberships.
	     *
	     * @param parameters - Request configuration parameters or callback from overload.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous UUID Memberships remove response or `void` in case if `callback`
	     * provided.
	     */
	    removeMemberships(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a;
	            if (parameters.userId)
	                parameters.uuid = parameters.userId;
	            (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
	            const request = new SetUUIDMembershipsRequest(Object.assign(Object.assign({}, parameters), { type: 'delete', keySet: this.keySet }));
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
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
	    fetchMemberships(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a, _b;
	            if ('spaceId' in parameters) {
	                const spaceParameters = parameters;
	                const mappedParameters = {
	                    channel: (_a = spaceParameters.spaceId) !== null && _a !== void 0 ? _a : spaceParameters.channel,
	                    filter: spaceParameters.filter,
	                    limit: spaceParameters.limit,
	                    page: spaceParameters.page,
	                    include: Object.assign({}, spaceParameters.include),
	                    sort: spaceParameters.sort
	                        ? Object.fromEntries(Object.entries(spaceParameters.sort).map(([key, value]) => [key.replace('user', 'uuid'), value]))
	                        : undefined,
	                };
	                // Map Members object to the older version.
	                const mapMembers = (response) => ({
	                    status: response.status,
	                    data: response.data.map((members) => ({
	                        user: members.uuid,
	                        custom: members.custom,
	                        updated: members.updated,
	                        eTag: members.eTag,
	                    })),
	                    totalCount: response.totalCount,
	                    next: response.next,
	                    prev: response.prev,
	                });
	                if (callback)
	                    return this.getChannelMembers(mappedParameters, (status, result) => {
	                        callback(status, result ? mapMembers(result) : result);
	                    });
	                return this.getChannelMembers(mappedParameters).then(mapMembers);
	            }
	            const userParameters = parameters;
	            const mappedParameters = {
	                uuid: (_b = userParameters.userId) !== null && _b !== void 0 ? _b : userParameters.uuid,
	                filter: userParameters.filter,
	                limit: userParameters.limit,
	                page: userParameters.page,
	                include: Object.assign({}, userParameters.include),
	                sort: userParameters.sort
	                    ? Object.fromEntries(Object.entries(userParameters.sort).map(([key, value]) => [key.replace('space', 'channel'), value]))
	                    : undefined,
	            };
	            // Map Memberships object to the older version.
	            const mapMemberships = (response) => ({
	                status: response.status,
	                data: response.data.map((membership) => ({
	                    space: membership.channel,
	                    custom: membership.custom,
	                    updated: membership.updated,
	                    eTag: membership.eTag,
	                })),
	                totalCount: response.totalCount,
	                next: response.next,
	                prev: response.prev,
	            });
	            if (callback)
	                return this.getMemberships(mappedParameters, (status, result) => {
	                    callback(status, result ? mapMemberships(result) : result);
	                });
	            return this.getMemberships(mappedParameters).then(mapMemberships);
	        });
	    }
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
	    addMemberships(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a, _b, _c, _d, _e, _f;
	            if ('spaceId' in parameters) {
	                const spaceParameters = parameters;
	                const mappedParameters = {
	                    channel: (_a = spaceParameters.spaceId) !== null && _a !== void 0 ? _a : spaceParameters.channel,
	                    uuids: (_c = (_b = spaceParameters.users) === null || _b === void 0 ? void 0 : _b.map((user) => {
	                        if (typeof user === 'string')
	                            return user;
	                        return { id: user.userId, custom: user.custom };
	                    })) !== null && _c !== void 0 ? _c : spaceParameters.uuids,
	                    limit: 0,
	                };
	                if (callback)
	                    return this.setChannelMembers(mappedParameters, callback);
	                return this.setChannelMembers(mappedParameters);
	            }
	            const userParameters = parameters;
	            const mappedParameters = {
	                uuid: (_d = userParameters.userId) !== null && _d !== void 0 ? _d : userParameters.uuid,
	                channels: (_f = (_e = userParameters.spaces) === null || _e === void 0 ? void 0 : _e.map((space) => {
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
	                return this.setMemberships(mappedParameters, callback);
	            return this.setMemberships(mappedParameters);
	        });
	    }
	}

	/**
	 * Time REST API module.
	 */
	// endregion
	/**
	 * Get current PubNub high-precision time request.
	 *
	 * @internal
	 */
	class TimeRequest extends AbstractRequest {
	    constructor() {
	        super();
	    }
	    operation() {
	        return RequestOperation$1.PNTimeOperation;
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const serviceResponse = this.deserializeResponse(response);
	            if (!serviceResponse)
	                throw new PubNubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
	            return { timetoken: serviceResponse[0] };
	        });
	    }
	    get path() {
	        return '/time/0';
	    }
	}

	/**
	 * Download File REST API module.
	 *
	 * @internal
	 */
	// endregion
	/**
	 * Download File request.
	 *
	 * @internal
	 */
	class DownloadFileRequest extends AbstractRequest {
	    constructor(parameters) {
	        super();
	        this.parameters = parameters;
	    }
	    operation() {
	        return RequestOperation$1.PNDownloadFileOperation;
	    }
	    validate() {
	        const { channel, id, name } = this.parameters;
	        if (!channel)
	            return "channel can't be empty";
	        if (!id)
	            return "file id can't be empty";
	        if (!name)
	            return "file name can't be empty";
	    }
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const { cipherKey, crypto, cryptography, name, PubNubFile } = this.parameters;
	            const mimeType = response.headers['content-type'];
	            let decryptedFile;
	            let body = response.body;
	            if (PubNubFile.supportsEncryptFile && (cipherKey || crypto)) {
	                if (cipherKey && cryptography)
	                    body = yield cryptography.decrypt(cipherKey, body);
	                else if (!cipherKey && crypto)
	                    decryptedFile = yield crypto.decryptFile(PubNubFile.create({ data: body, name: name, mimeType }), PubNubFile);
	            }
	            return (decryptedFile
	                ? decryptedFile
	                : PubNubFile.create({
	                    data: body,
	                    name,
	                    mimeType,
	                }));
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channel, id, name, } = this.parameters;
	        return `/v1/files/${subscribeKey}/channels/${encodeString(channel)}/files/${id}/${name}`;
	    }
	}

	/**
	 * Core PubNub API module.
	 */
	// endregion
	/**
	 * Platform-agnostic PubNub client core.
	 */
	class PubNubCore {
	    /**
	     * Construct notification payload which will trigger push notification.
	     *
	     * @param title - Title which will be shown on notification.
	     * @param body - Payload which will be sent as part of notification.
	     *
	     * @returns Pre-formatted message payload which will trigger push notification.
	     */
	    static notificationPayload(title, body) {
	        {
	            return new NotificationsPayload(title, body);
	        }
	    }
	    /**
	     * Generate unique identifier.
	     *
	     * @returns Unique identifier.
	     */
	    static generateUUID() {
	        return uuidGenerator.createUUID();
	    }
	    // endregion
	    /**
	     * Create and configure PubNub client core.
	     *
	     * @param configuration - PubNub client core configuration.
	     * @returns Configured and ready to use PubNub client.
	     *
	     * @internal
	     */
	    constructor(configuration) {
	        this._configuration = configuration.configuration;
	        this.cryptography = configuration.cryptography;
	        this.tokenManager = configuration.tokenManager;
	        this.transport = configuration.transport;
	        this.crypto = configuration.crypto;
	        // API group entry points initialization.
	        this._objects = new PubNubObjects(this._configuration, this.sendRequest.bind(this));
	        this._channelGroups = new PubNubChannelGroups(this._configuration.keySet, this.sendRequest.bind(this));
	        this._push = new PubNubPushNotifications(this._configuration.keySet, this.sendRequest.bind(this));
	        {
	            // Prepare for real-time events announcement.
	            this.listenerManager = new ListenerManager();
	            this.eventEmitter = new EventEmitter(this.listenerManager);
	            if (this._configuration.enableEventEngine) {
	                {
	                    let heartbeatInterval = this._configuration.getHeartbeatInterval();
	                    this.presenceState = {};
	                    {
	                        if (heartbeatInterval) {
	                            this.presenceEventEngine = new PresenceEventEngine({
	                                heartbeat: this.heartbeat.bind(this),
	                                leave: (parameters) => this.makeUnsubscribe(parameters, () => { }),
	                                heartbeatDelay: () => new Promise((resolve, reject) => {
	                                    heartbeatInterval = this._configuration.getHeartbeatInterval();
	                                    if (!heartbeatInterval)
	                                        reject(new PubNubError('Heartbeat interval has been reset.'));
	                                    else
	                                        setTimeout(resolve, heartbeatInterval * 1000);
	                                }),
	                                retryDelay: (amount) => new Promise((resolve) => setTimeout(resolve, amount)),
	                                emitStatus: (status) => this.listenerManager.announceStatus(status),
	                                config: this._configuration,
	                                presenceState: this.presenceState,
	                            });
	                        }
	                    }
	                    this.eventEngine = new EventEngine({
	                        handshake: this.subscribeHandshake.bind(this),
	                        receiveMessages: this.subscribeReceiveMessages.bind(this),
	                        delay: (amount) => new Promise((resolve) => setTimeout(resolve, amount)),
	                        join: this.join.bind(this),
	                        leave: this.leave.bind(this),
	                        leaveAll: this.leaveAll.bind(this),
	                        presenceState: this.presenceState,
	                        config: this._configuration,
	                        emitMessages: (events) => {
	                            try {
	                                events.forEach((event) => this.eventEmitter.emitEvent(event));
	                            }
	                            catch (e) {
	                                const errorStatus = {
	                                    error: true,
	                                    category: StatusCategory$1.PNUnknownCategory,
	                                    errorData: e,
	                                    statusCode: 0,
	                                };
	                                this.listenerManager.announceStatus(errorStatus);
	                            }
	                        },
	                        emitStatus: (status) => this.listenerManager.announceStatus(status),
	                    });
	                }
	            }
	            else {
	                {
	                    this.subscriptionManager = new SubscriptionManager(this._configuration, this.listenerManager, this.eventEmitter, this.makeSubscribe.bind(this), this.heartbeat.bind(this), this.makeUnsubscribe.bind(this), this.time.bind(this));
	                }
	            }
	        }
	    }
	    // --------------------------------------------------------
	    // -------------------- Configuration ----------------------
	    // --------------------------------------------------------
	    // region Configuration
	    /**
	     * PubNub client configuration.
	     *
	     * @returns Currently user PubNub client configuration.
	     */
	    get configuration() {
	        return this._configuration;
	    }
	    /**
	     * Current PubNub client configuration.
	     *
	     * @returns Currently user PubNub client configuration.
	     *
	     * @deprecated Use {@link configuration} getter instead.
	     */
	    get _config() {
	        return this.configuration;
	    }
	    /**
	     * REST API endpoint access authorization key.
	     *
	     * It is required to have `authorization key` with required permissions to access REST API
	     * endpoints when `PAM` enabled for user key set.
	     */
	    get authKey() {
	        var _a;
	        return (_a = this._configuration.authKey) !== null && _a !== void 0 ? _a : undefined;
	    }
	    /**
	     * REST API endpoint access authorization key.
	     *
	     * It is required to have `authorization key` with required permissions to access REST API
	     * endpoints when `PAM` enabled for user key set.
	     */
	    getAuthKey() {
	        return this.authKey;
	    }
	    /**
	     * Change REST API endpoint access authorization key.
	     *
	     * @param authKey - New authorization key which should be used with new requests.
	     */
	    setAuthKey(authKey) {
	        this._configuration.setAuthKey(authKey);
	    }
	    /**
	     * Get a PubNub client user identifier.
	     *
	     * @returns Current PubNub client user identifier.
	     */
	    get userId() {
	        return this._configuration.userId;
	    }
	    /**
	     * Change the current PubNub client user identifier.
	     *
	     * **Important:** Change won't affect ongoing REST API calls.
	     *
	     * @param value - New PubNub client user identifier.
	     *
	     * @throws Error empty user identifier has been provided.
	     */
	    set userId(value) {
	        if (!value || typeof value !== 'string' || value.trim().length === 0)
	            throw new Error('Missing or invalid userId parameter. Provide a valid string userId');
	        this._configuration.userId = value;
	    }
	    /**
	     * Get a PubNub client user identifier.
	     *
	     * @returns Current PubNub client user identifier.
	     */
	    getUserId() {
	        return this._configuration.userId;
	    }
	    /**
	     * Change the current PubNub client user identifier.
	     *
	     * **Important:** Change won't affect ongoing REST API calls.
	     *
	     * @param value - New PubNub client user identifier.
	     *
	     * @throws Error empty user identifier has been provided.
	     */
	    setUserId(value) {
	        if (!value || typeof value !== 'string' || value.trim().length === 0)
	            throw new Error('Missing or invalid userId parameter. Provide a valid string userId');
	        this._configuration.userId = value;
	    }
	    /**
	     * Real-time updates filtering expression.
	     *
	     * @returns Filtering expression.
	     */
	    get filterExpression() {
	        var _a;
	        return (_a = this._configuration.getFilterExpression()) !== null && _a !== void 0 ? _a : undefined;
	    }
	    /**
	     * Real-time updates filtering expression.
	     *
	     * @returns Filtering expression.
	     */
	    getFilterExpression() {
	        return this.filterExpression;
	    }
	    /**
	     * Update real-time updates filtering expression.
	     *
	     * @param expression - New expression which should be used or `undefined` to disable filtering.
	     */
	    set filterExpression(expression) {
	        this._configuration.setFilterExpression(expression);
	    }
	    /**
	     * Update real-time updates filtering expression.
	     *
	     * @param expression - New expression which should be used or `undefined` to disable filtering.
	     */
	    setFilterExpression(expression) {
	        this.filterExpression = expression;
	    }
	    /**
	     * Dta encryption / decryption key.
	     *
	     * @returns Currently used key for data encryption / decryption.
	     */
	    get cipherKey() {
	        return this._configuration.getCipherKey();
	    }
	    /**
	     * Change data encryption / decryption key.
	     *
	     * @param key - New key which should be used for data encryption / decryption.
	     */
	    set cipherKey(key) {
	        this._configuration.setCipherKey(key);
	    }
	    /**
	     * Change data encryption / decryption key.
	     *
	     * @param key - New key which should be used for data encryption / decryption.
	     */
	    setCipherKey(key) {
	        this.cipherKey = key;
	    }
	    /**
	     * Change heartbeat requests interval.
	     *
	     * @param interval - New presence request heartbeat intervals.
	     */
	    set heartbeatInterval(interval) {
	        this._configuration.setHeartbeatInterval(interval);
	    }
	    /**
	     * Change heartbeat requests interval.
	     *
	     * @param interval - New presence request heartbeat intervals.
	     */
	    setHeartbeatInterval(interval) {
	        this.heartbeatInterval = interval;
	    }
	    /**
	     * Get PubNub SDK version.
	     *
	     * @returns Current SDK version.
	     */
	    getVersion() {
	        return this._configuration.getVersion();
	    }
	    /**
	     * Add framework's prefix.
	     *
	     * @param name - Name of the framework which would want to add own data into `pnsdk` suffix.
	     * @param suffix - Suffix with information about framework.
	     */
	    _addPnsdkSuffix(name, suffix) {
	        this._configuration._addPnsdkSuffix(name, suffix);
	    }
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
	    getUUID() {
	        return this.userId;
	    }
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
	    setUUID(value) {
	        this.userId = value;
	    }
	    /**
	     * Custom data encryption method.
	     *
	     * @deprecated Instead use {@link cryptoModule} for data encryption.
	     */
	    get customEncrypt() {
	        return this._configuration.getCustomEncrypt();
	    }
	    /**
	     * Custom data decryption method.
	     *
	     * @deprecated Instead use {@link cryptoModule} for data decryption.
	     */
	    get customDecrypt() {
	        return this._configuration.getCustomDecrypt();
	    }
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
	    channel(name) {
	        return new Channel(name, this.eventEmitter, this);
	    }
	    /**
	     * Create a `ChannelGroup` entity.
	     *
	     * Entity can be used for the interaction with the following API:
	     * - `subscribe`
	     *
	     * @param name - Unique channel group name.
	     * @returns `ChannelGroup` entity.
	     */
	    channelGroup(name) {
	        return new ChannelGroup(name, this.eventEmitter, this);
	    }
	    /**
	     * Create a `ChannelMetadata` entity.
	     *
	     * Entity can be used for the interaction with the following API:
	     * - `subscribe`
	     *
	     * @param id - Unique channel metadata object identifier.
	     * @returns `ChannelMetadata` entity.
	     */
	    channelMetadata(id) {
	        return new ChannelMetadata(id, this.eventEmitter, this);
	    }
	    /**
	     * Create a `UserMetadata` entity.
	     *
	     * Entity can be used for the interaction with the following API:
	     * - `subscribe`
	     *
	     * @param id - Unique user metadata object identifier.
	     * @returns `UserMetadata` entity.
	     */
	    userMetadata(id) {
	        return new UserMetadata(id, this.eventEmitter, this);
	    }
	    /**
	     * Create subscriptions set object.
	     *
	     * @param parameters - Subscriptions set configuration parameters.
	     */
	    subscriptionSet(parameters) {
	        {
	            return new SubscriptionSet(Object.assign(Object.assign({}, parameters), { eventEmitter: this.eventEmitter, pubnub: this }));
	        }
	    }
	    /**
	     * Schedule request execution.
	     *
	     * @internal
	     *
	     * @param request - REST API request.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous request execution and response parsing result or `void` in case if
	     * `callback` provided.
	     *
	     * @throws PubNubError in case of request processing error.
	     */
	    sendRequest(request, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            // Validate user-input.
	            const validationResult = request.validate();
	            if (validationResult) {
	                if (callback)
	                    return callback(createValidationError(validationResult), null);
	                throw new PubNubError('Validation failed, check status for details', createValidationError(validationResult));
	            }
	            // Complete request configuration.
	            const transportRequest = request.request();
	            if (transportRequest.formData && transportRequest.formData.length > 0) {
	                // Set 300 seconds file upload request delay.
	                transportRequest.timeout = 300;
	            }
	            else {
	                if (request.operation() === RequestOperation$1.PNSubscribeOperation)
	                    transportRequest.timeout = this._configuration.getSubscribeTimeout();
	                else
	                    transportRequest.timeout = this._configuration.getTransactionTimeout();
	            }
	            // API request processing status.
	            const status = {
	                error: false,
	                operation: request.operation(),
	                category: StatusCategory$1.PNAcknowledgmentCategory,
	                statusCode: 0,
	            };
	            const [sendableRequest, cancellationController] = this.transport.makeSendable(transportRequest);
	            /**
	             * **Important:** Because of multiple environments where JS SDK can be used control over
	             * cancellation had to be inverted to let transport provider solve request cancellation task
	             * more efficiently. As result, cancellation controller can be retrieved and used only after
	             * request will be scheduled by transport provider.
	             */
	            request.cancellationController = cancellationController ? cancellationController : null;
	            return sendableRequest
	                .then((response) => {
	                status.statusCode = response.status;
	                // Handle special case when request completed but not fully processed by PubNub service.
	                if (response.status !== 200 && response.status !== 204) {
	                    const contentType = response.headers['content-type'];
	                    if (contentType || contentType.indexOf('javascript') !== -1 || contentType.indexOf('json') !== -1) {
	                        const json = JSON.parse(PubNubCore.decoder.decode(response.body));
	                        if (typeof json === 'object' && 'error' in json && json.error && typeof json.error === 'object')
	                            status.errorData = json.error;
	                    }
	                }
	                return request.parse(response);
	            })
	                .then((parsed) => {
	                // Notify callback (if possible).
	                if (callback)
	                    return callback(status, parsed);
	                return parsed;
	            })
	                .catch((error) => {
	                const apiError = !(error instanceof PubNubAPIError) ? PubNubAPIError.create(error) : error;
	                // Notify callback (if possible).
	                if (callback)
	                    return callback(apiError.toStatus(request.operation()), null);
	                throw apiError.toPubNubError(request.operation(), 'REST API request processing error, check status for details');
	            });
	        });
	    }
	    /**
	     * Unsubscribe from all channels and groups.
	     *
	     * @param [isOffline] - Whether `offline` presence should be notified or not.
	     */
	    destroy(isOffline) {
	        {
	            if (this.subscriptionManager) {
	                this.subscriptionManager.unsubscribeAll(isOffline);
	                this.subscriptionManager.disconnect();
	            }
	            else if (this.eventEngine)
	                this.eventEngine.dispose();
	        }
	    }
	    /**
	     * Unsubscribe from all channels and groups.
	     *
	     * @deprecated Use {@link destroy} method instead.
	     */
	    stop() {
	        this.destroy();
	    }
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
	    addListener(listener) {
	        this.listenerManager.addListener(listener);
	    }
	    /**
	     * Remove real-time event listener.
	     *
	     * @param listener - Event listeners which should be removed.
	     */
	    removeListener(listener) {
	        this.listenerManager.removeListener(listener);
	    }
	    /**
	     * Clear all real-time event listeners.
	     */
	    removeAllListeners() {
	        this.listenerManager.removeAllListeners();
	    }
	    /**
	     * Publish data to a specific channel.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous publish data response or `void` in case if `callback` provided.
	     */
	    publish(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                const request = new PublishRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule() }));
	                if (callback)
	                    return this.sendRequest(request, callback);
	                return this.sendRequest(request);
	            }
	        });
	    }
	    /**
	     * Signal data to a specific channel.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous signal data response or `void` in case if `callback` provided.
	     */
	    signal(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                const request = new SignalRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
	                if (callback)
	                    return this.sendRequest(request, callback);
	                return this.sendRequest(request);
	            }
	        });
	    }
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
	    fire(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            callback !== null && callback !== void 0 ? callback : (callback = () => { });
	            return this.publish(Object.assign(Object.assign({}, parameters), { replicate: false, storeInHistory: false }), callback);
	        });
	    }
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
	    getSubscribedChannels() {
	        {
	            if (this.subscriptionManager)
	                return this.subscriptionManager.subscribedChannels;
	            else if (this.eventEngine)
	                return this.eventEngine.getSubscribedChannels();
	        }
	        return [];
	    }
	    /**
	     * Get list of channel groups on which PubNub client currently subscribed.
	     *
	     * @returns List of active channel groups.
	     */
	    getSubscribedChannelGroups() {
	        {
	            if (this.subscriptionManager)
	                return this.subscriptionManager.subscribedChannelGroups;
	            else if (this.eventEngine)
	                return this.eventEngine.getSubscribedChannelGroups();
	        }
	        return [];
	    }
	    /**
	     * Subscribe to specified channels and groups real-time events.
	     *
	     * @param parameters - Request configuration parameters.
	     */
	    subscribe(parameters) {
	        {
	            if (this.subscriptionManager)
	                this.subscriptionManager.subscribe(parameters);
	            else if (this.eventEngine)
	                this.eventEngine.subscribe(parameters);
	        }
	    }
	    /**
	     * Perform subscribe request.
	     *
	     * **Note:** Method passed into managers to let them use it when required.
	     *
	     * @internal
	     *
	     * @param parameters - Request configuration parameters.
	     * @param callback - Request completion handler callback.
	     */
	    makeSubscribe(parameters, callback) {
	        {
	            const request = new SubscribeRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule(), getFileUrl: this.getFileUrl.bind(this) }));
	            this.sendRequest(request, (status, result) => {
	                var _a;
	                if (this.subscriptionManager && ((_a = this.subscriptionManager.abort) === null || _a === void 0 ? void 0 : _a.identifier) === request.requestIdentifier)
	                    this.subscriptionManager.abort = null;
	                callback(status, result);
	            });
	            /**
	             * Allow subscription cancellation.
	             *
	             * **Note:** Had to be done after scheduling because transport provider return cancellation
	             * controller only when schedule new request.
	             */
	            if (this.subscriptionManager) {
	                // Creating identifiable abort caller.
	                const callableAbort = () => request.abort();
	                callableAbort.identifier = request.requestIdentifier;
	                this.subscriptionManager.abort = callableAbort;
	            }
	        }
	    }
	    /**
	     * Unsubscribe from specified channels and groups real-time events.
	     *
	     * @param parameters - Request configuration parameters.
	     */
	    unsubscribe(parameters) {
	        {
	            if (this.subscriptionManager)
	                this.subscriptionManager.unsubscribe(parameters);
	            else if (this.eventEngine)
	                this.eventEngine.unsubscribe(parameters);
	        }
	    }
	    /**
	     * Perform unsubscribe request.
	     *
	     * **Note:** Method passed into managers to let them use it when required.
	     *
	     * @internal
	     *
	     * @param parameters - Request configuration parameters.
	     * @param callback - Request completion handler callback.
	     */
	    makeUnsubscribe(parameters, callback) {
	        {
	            this.sendRequest(new PresenceLeaveRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet })), callback);
	        }
	    }
	    /**
	     * Unsubscribe from all channels and groups.
	     */
	    unsubscribeAll() {
	        {
	            if (this.subscriptionManager)
	                this.subscriptionManager.unsubscribeAll();
	            else if (this.eventEngine)
	                this.eventEngine.unsubscribeAll();
	        }
	    }
	    /**
	     * Temporarily disconnect from real-time events stream.
	     */
	    disconnect() {
	        {
	            if (this.subscriptionManager)
	                this.subscriptionManager.disconnect();
	            else if (this.eventEngine)
	                this.eventEngine.disconnect();
	        }
	    }
	    /**
	     * Restore connection to the real-time events stream.
	     *
	     * @param parameters - Reconnection catch up configuration. **Note:** available only with
	     * enabled event engine.
	     */
	    reconnect(parameters) {
	        {
	            if (this.subscriptionManager)
	                this.subscriptionManager.reconnect();
	            else if (this.eventEngine)
	                this.eventEngine.reconnect(parameters !== null && parameters !== void 0 ? parameters : {});
	        }
	    }
	    /**
	     * Event engine handshake subscribe.
	     *
	     * @internal
	     *
	     * @param parameters - Request configuration parameters.
	     */
	    subscribeHandshake(parameters) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                const request = new HandshakeSubscribeRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule(), getFileUrl: this.getFileUrl.bind(this) }));
	                const abortUnsubscribe = parameters.abortSignal.subscribe((err) => {
	                    request.abort();
	                });
	                /**
	                 * Allow subscription cancellation.
	                 *
	                 * **Note:** Had to be done after scheduling because transport provider return cancellation
	                 * controller only when schedule new request.
	                 */
	                const handshakeResponse = this.sendRequest(request);
	                return handshakeResponse.then((response) => {
	                    abortUnsubscribe();
	                    return response.cursor;
	                });
	            }
	        });
	    }
	    /**
	     * Event engine receive messages subscribe.
	     *
	     * @internal
	     *
	     * @param parameters - Request configuration parameters.
	     */
	    subscribeReceiveMessages(parameters) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                const request = new ReceiveMessagesSubscribeRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule(), getFileUrl: this.getFileUrl.bind(this) }));
	                const abortUnsubscribe = parameters.abortSignal.subscribe((err) => {
	                    request.abort();
	                });
	                /**
	                 * Allow subscription cancellation.
	                 *
	                 * **Note:** Had to be done after scheduling because transport provider return cancellation
	                 * controller only when schedule new request.
	                 */
	                const handshakeResponse = this.sendRequest(request);
	                return handshakeResponse.then((response) => {
	                    abortUnsubscribe();
	                    return response;
	                });
	            }
	        });
	    }
	    /**
	     * Get reactions to a specific message.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous get reactions response or `void` in case if `callback` provided.
	     */
	    getMessageActions(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                const request = new GetMessageActionsRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
	                if (callback)
	                    return this.sendRequest(request, callback);
	                return this.sendRequest(request);
	            }
	        });
	    }
	    /**
	     * Add a reaction to a specific message.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous add a reaction response or `void` in case if `callback` provided.
	     */
	    addMessageAction(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                const request = new AddMessageActionRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
	                if (callback)
	                    return this.sendRequest(request, callback);
	                return this.sendRequest(request);
	            }
	        });
	    }
	    /**
	     * Remove a reaction from a specific message.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous remove a reaction response or `void` in case if `callback` provided.
	     */
	    removeMessageAction(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                const request = new RemoveMessageAction(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
	                if (callback)
	                    return this.sendRequest(request, callback);
	                return this.sendRequest(request);
	            }
	        });
	    }
	    /**
	     * Fetch messages history for channels.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous fetch messages response or `void` in case if `callback` provided.
	     */
	    fetchMessages(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                const request = new FetchMessagesRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule(), getFileUrl: this.getFileUrl.bind(this) }));
	                if (callback)
	                    return this.sendRequest(request, callback);
	                return this.sendRequest(request);
	            }
	        });
	    }
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
	    deleteMessages(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                const request = new DeleteMessageRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
	                if (callback)
	                    return this.sendRequest(request, callback);
	                return this.sendRequest(request);
	            }
	        });
	    }
	    /**
	     * Count messages from the channels' history.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous count messages response or `void` in case if `callback` provided.
	     */
	    messageCounts(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                const request = new MessageCountRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
	                if (callback)
	                    return this.sendRequest(request, callback);
	                return this.sendRequest(request);
	            }
	        });
	    }
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
	    history(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                const request = new GetHistoryRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule() }));
	                if (callback)
	                    return this.sendRequest(request, callback);
	                return this.sendRequest(request);
	            }
	        });
	    }
	    /**
	     * Get channel's presence information.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous get channel's presence response or `void` in case if `callback` provided.
	     */
	    hereNow(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                const request = new HereNowRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
	                if (callback)
	                    return this.sendRequest(request, callback);
	                return this.sendRequest(request);
	            }
	        });
	    }
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
	    whereNow(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a;
	            {
	                const request = new WhereNowRequest({
	                    uuid: (_a = parameters.uuid) !== null && _a !== void 0 ? _a : this._configuration.userId,
	                    keySet: this._configuration.keySet,
	                });
	                if (callback)
	                    return this.sendRequest(request, callback);
	                return this.sendRequest(request);
	            }
	        });
	    }
	    /**
	     * Get associated user's data for channels and groups.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous get user's data response or `void` in case if `callback` provided.
	     */
	    getState(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a;
	            {
	                const request = new GetPresenceStateRequest(Object.assign(Object.assign({}, parameters), { uuid: (_a = parameters.uuid) !== null && _a !== void 0 ? _a : this._configuration.userId, keySet: this._configuration.keySet }));
	                if (callback)
	                    return this.sendRequest(request, callback);
	                return this.sendRequest(request);
	            }
	        });
	    }
	    /**
	     * Set associated user's data for channels and groups.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous set user's data response or `void` in case if `callback` provided.
	     */
	    setState(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a, _b;
	            {
	                const { keySet, userId: userId } = this._configuration;
	                const heartbeat = this._configuration.getPresenceTimeout();
	                let request;
	                // Maintain presence information (if required).
	                if (this._configuration.enableEventEngine && this.presenceState) {
	                    const presenceState = this.presenceState;
	                    (_a = parameters.channels) === null || _a === void 0 ? void 0 : _a.forEach((channel) => (presenceState[channel] = parameters.state));
	                    if ('channelGroups' in parameters) {
	                        (_b = parameters.channelGroups) === null || _b === void 0 ? void 0 : _b.forEach((group) => (presenceState[group] = parameters.state));
	                    }
	                }
	                // Check whether state should be set with heartbeat or not.
	                if ('withHeartbeat' in parameters) {
	                    request = new HeartbeatRequest(Object.assign(Object.assign({}, parameters), { keySet, heartbeat }));
	                }
	                else {
	                    request = new SetPresenceStateRequest(Object.assign(Object.assign({}, parameters), { keySet, uuid: userId }));
	                }
	                // Update state used by subscription manager.
	                if (this.subscriptionManager)
	                    this.subscriptionManager.setState(parameters);
	                if (callback)
	                    return this.sendRequest(request, callback);
	                return this.sendRequest(request);
	            }
	        });
	    }
	    // endregion
	    // region Change presence state
	    /**
	     * Manual presence management.
	     *
	     * @param parameters - Desired presence state for provided list of channels and groups.
	     */
	    presence(parameters) {
	        var _a;
	        (_a = this.subscriptionManager) === null || _a === void 0 ? void 0 : _a.changePresence(parameters);
	    }
	    // endregion
	    // region Heartbeat
	    /**
	     * Announce user presence
	     *
	     * @internal
	     *
	     * @param parameters - Desired presence state for provided list of channels and groups.
	     * @param callback - Request completion handler callback.
	     */
	    heartbeat(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                const request = new HeartbeatRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
	                if (callback)
	                    return this.sendRequest(request, callback);
	                return this.sendRequest(request);
	            }
	        });
	    }
	    // endregion
	    // region Join
	    /**
	     * Announce user `join` on specified list of channels and groups.
	     *
	     * @internal
	     *
	     * @param parameters - List of channels and groups where `join` event should be sent.
	     */
	    join(parameters) {
	        var _a;
	        (_a = this.presenceEventEngine) === null || _a === void 0 ? void 0 : _a.join(parameters);
	    }
	    // endregion
	    // region Leave
	    /**
	     * Announce user `leave` on specified list of channels and groups.
	     *
	     * @internal
	     *
	     * @param parameters - List of channels and groups where `leave` event should be sent.
	     */
	    leave(parameters) {
	        var _a;
	        (_a = this.presenceEventEngine) === null || _a === void 0 ? void 0 : _a.leave(parameters);
	    }
	    /**
	     * Announce user `leave` on all subscribed channels.
	     *
	     * @internal
	     */
	    leaveAll() {
	        var _a;
	        (_a = this.presenceEventEngine) === null || _a === void 0 ? void 0 : _a.leaveAll();
	    }
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
	    grantToken(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            throw new Error('Grant Token error: PAM module disabled');
	        });
	    }
	    /**
	     * Revoke token permission.
	     *
	     * @param token - Access token for which permissions should be revoked.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous revoke token response or `void` in case if `callback` provided.
	     */
	    revokeToken(token, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            throw new Error('Revoke Token error: PAM module disabled');
	        });
	    }
	    // endregion
	    // region Token Manipulation
	    /**
	     * Get current access token.
	     *
	     * @returns Previously configured access token using {@link setToken} method.
	     */
	    get token() {
	        return this.tokenManager && this.tokenManager.getToken();
	    }
	    /**
	     * Get current access token.
	     *
	     * @returns Previously configured access token using {@link setToken} method.
	     */
	    getToken() {
	        return this.token;
	    }
	    /**
	     * Set current access token.
	     *
	     * @param token - New access token which should be used with next REST API endpoint calls.
	     */
	    set token(token) {
	        if (this.tokenManager)
	            this.tokenManager.setToken(token);
	    }
	    /**
	     * Set current access token.
	     *
	     * @param token - New access token which should be used with next REST API endpoint calls.
	     */
	    setToken(token) {
	        this.token = token;
	    }
	    /**
	     * Parse access token.
	     *
	     * Parse token to see what permissions token owner has.
	     *
	     * @param token - Token which should be parsed.
	     *
	     * @returns Token's permissions information for the resources.
	     */
	    parseToken(token) {
	        return this.tokenManager && this.tokenManager.parseToken(token);
	    }
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
	    grant(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            throw new Error('Grant error: PAM module disabled');
	        });
	    }
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
	    audit(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            throw new Error('Grant Permissions error: PAM module disabled');
	        });
	    }
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
	    get objects() {
	        return this._objects;
	    }
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
	    fetchUsers(parametersOrCallback, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this.objects._getAllUUIDMetadata(parametersOrCallback, callback);
	        });
	    }
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
	    fetchUser(parametersOrCallback, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this.objects._getUUIDMetadata(parametersOrCallback, callback);
	        });
	    }
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
	    createUser(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this.objects._setUUIDMetadata(parameters, callback);
	        });
	    }
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
	    updateUser(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this.objects._setUUIDMetadata(parameters, callback);
	        });
	    }
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
	    removeUser(parametersOrCallback, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this.objects._removeUUIDMetadata(parametersOrCallback, callback);
	        });
	    }
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
	    fetchSpaces(parametersOrCallback, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this.objects._getAllChannelMetadata(parametersOrCallback, callback);
	        });
	    }
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
	    fetchSpace(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this.objects._getChannelMetadata(parameters, callback);
	        });
	    }
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
	    createSpace(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this.objects._setChannelMetadata(parameters, callback);
	        });
	    }
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
	    updateSpace(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this.objects._setChannelMetadata(parameters, callback);
	        });
	    }
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
	    removeSpace(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this.objects._removeChannelMetadata(parameters, callback);
	        });
	    }
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
	    fetchMemberships(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this.objects.fetchMemberships(parameters, callback);
	        });
	    }
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
	    addMemberships(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this.objects.addMemberships(parameters, callback);
	        });
	    }
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
	    updateMemberships(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this.objects.addMemberships(parameters, callback);
	        });
	    }
	    /**
	     * Remove User membership.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous memberships modification response or `void` in case if `callback` provided.
	     *
	     * @deprecated Use {@link PubNubCore#objects.removeMemberships} or {@link PubNubCore#objects.removeChannelMembers}
	     * methods instead from `objects` API group.
	     */
	    removeMemberships(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a, _b, _c;
	            {
	                if ('spaceId' in parameters) {
	                    const spaceParameters = parameters;
	                    const requestParameters = {
	                        channel: (_a = spaceParameters.spaceId) !== null && _a !== void 0 ? _a : spaceParameters.channel,
	                        uuids: (_b = spaceParameters.userIds) !== null && _b !== void 0 ? _b : spaceParameters.uuids,
	                        limit: 0,
	                    };
	                    if (callback)
	                        return this.objects.removeChannelMembers(requestParameters, callback);
	                    return this.objects.removeChannelMembers(requestParameters);
	                }
	                const userParameters = parameters;
	                const requestParameters = {
	                    uuid: userParameters.userId,
	                    channels: (_c = userParameters.spaceIds) !== null && _c !== void 0 ? _c : userParameters.channels,
	                    limit: 0,
	                };
	                if (callback)
	                    return this.objects.removeMemberships(requestParameters, callback);
	                return this.objects.removeMemberships(requestParameters);
	            }
	        });
	    }
	    // endregion
	    // endregion
	    // --------------------------------------------------------
	    // ----------------- Channel Groups API -------------------
	    // --------------------------------------------------------
	    // region Channel Groups API
	    /**
	     * PubNub Channel Groups API group.
	     */
	    get channelGroups() {
	        return this._channelGroups;
	    }
	    // endregion
	    // --------------------------------------------------------
	    // ---------------- Push Notifications API -----------------
	    // --------------------------------------------------------
	    // region Push Notifications API
	    /**
	     * PubNub Push Notifications API group.
	     */
	    get push() {
	        return this._push;
	    }
	    /**
	     * Share file to a specific channel.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous file sharing response or `void` in case if `callback` provided.
	     */
	    sendFile(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                if (!this._configuration.PubNubFile)
	                    throw new Error("Validation failed: 'PubNubFile' not configured or file upload not supported by the platform.");
	                const sendFileRequest = new SendFileRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, PubNubFile: this._configuration.PubNubFile, fileUploadPublishRetryLimit: this._configuration.fileUploadPublishRetryLimit, file: parameters.file, sendRequest: this.sendRequest.bind(this), publishFile: this.publishFile.bind(this), crypto: this._configuration.getCryptoModule(), cryptography: this.cryptography ? this.cryptography : undefined }));
	                const status = {
	                    error: false,
	                    operation: RequestOperation$1.PNPublishFileOperation,
	                    category: StatusCategory$1.PNAcknowledgmentCategory,
	                    statusCode: 0,
	                };
	                return sendFileRequest
	                    .process()
	                    .then((response) => {
	                    status.statusCode = response.status;
	                    if (callback)
	                        return callback(status, response);
	                    return response;
	                })
	                    .catch((error) => {
	                    let errorStatus;
	                    if (error instanceof PubNubError)
	                        errorStatus = error.status;
	                    else if (error instanceof PubNubAPIError)
	                        errorStatus = error.toStatus(status.operation);
	                    // Notify callback (if possible).
	                    if (callback && errorStatus)
	                        callback(errorStatus, null);
	                    throw new PubNubError('REST API request processing error, check status for details', errorStatus);
	                });
	            }
	        });
	    }
	    /**
	     * Publish file message to a specific channel.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous publish file message response or `void` in case if `callback` provided.
	     */
	    publishFile(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                if (!this._configuration.PubNubFile)
	                    throw new Error("Validation failed: 'PubNubFile' not configured or file upload not supported by the platform.");
	                const request = new PublishFileMessageRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule() }));
	                if (callback)
	                    return this.sendRequest(request, callback);
	                return this.sendRequest(request);
	            }
	        });
	    }
	    /**
	     * Retrieve list of shared files in specific channel.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous shared files list response or `void` in case if `callback` provided.
	     */
	    listFiles(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                const request = new FilesListRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
	                if (callback)
	                    return this.sendRequest(request, callback);
	                return this.sendRequest(request);
	            }
	        });
	    }
	    // endregion
	    // region Get Download Url
	    /**
	     * Get file download Url.
	     *
	     * @param parameters - Request configuration parameters.
	     *
	     * @returns File download Url.
	     */
	    getFileUrl(parameters) {
	        var _a;
	        {
	            const request = this.transport.request(new GetFileDownloadUrlRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet })).request());
	            const query = (_a = request.queryParameters) !== null && _a !== void 0 ? _a : {};
	            const queryString = Object.keys(query)
	                .map((key) => {
	                const queryValue = query[key];
	                if (!Array.isArray(queryValue))
	                    return `${key}=${encodeString(queryValue)}`;
	                return queryValue.map((value) => `${key}=${encodeString(value)}`).join('&');
	            })
	                .join('&');
	            return `${request.origin}${request.path}?${queryString}`;
	        }
	    }
	    /**
	     * Download shared file from specific channel.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous download shared file response or `void` in case if `callback` provided.
	     */
	    downloadFile(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                if (!this._configuration.PubNubFile)
	                    throw new Error("Validation failed: 'PubNubFile' not configured or file upload not supported by the platform.");
	                const request = new DownloadFileRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, PubNubFile: this._configuration.PubNubFile, cryptography: this.cryptography ? this.cryptography : undefined, crypto: this._configuration.getCryptoModule() }));
	                if (callback)
	                    return this.sendRequest(request, callback);
	                return (yield this.sendRequest(request));
	            }
	        });
	    }
	    /**
	     * Delete shared file from specific channel.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous delete shared file response or `void` in case if `callback` provided.
	     */
	    deleteFile(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                const request = new DeleteFileRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
	                if (callback)
	                    return this.sendRequest(request, callback);
	                return this.sendRequest(request);
	            }
	        });
	    }
	    /**
	     Get current high-precision timetoken.
	     *
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous get current timetoken response or `void` in case if `callback` provided.
	     */
	    time(callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const request = new TimeRequest();
	            if (callback)
	                return this.sendRequest(request, callback);
	            return this.sendRequest(request);
	        });
	    }
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
	    encrypt(data, customCipherKey) {
	        const cryptoModule = this._configuration.getCryptoModule();
	        if (!customCipherKey && cryptoModule && typeof data === 'string') {
	            const encrypted = cryptoModule.encrypt(data);
	            return typeof encrypted === 'string' ? encrypted : encode(encrypted);
	        }
	        if (!this.crypto)
	            throw new Error('Encryption error: cypher key not set');
	        {
	            return this.crypto.encrypt(data, customCipherKey);
	        }
	    }
	    /**
	     * Decrypt data.
	     *
	     * @param data - Stringified data which should be encrypted using `CryptoModule`.
	     * @param [customCipherKey] - Cipher key which should be used to decrypt data. **Deprecated:**
	     * use {@link Configuration#cryptoModule|cryptoModule} instead.
	     *
	     * @returns Data decryption result as an object.
	     */
	    decrypt(data, customCipherKey) {
	        const cryptoModule = this._configuration.getCryptoModule();
	        if (!customCipherKey && cryptoModule) {
	            const decrypted = cryptoModule.decrypt(data);
	            return decrypted instanceof ArrayBuffer ? JSON.parse(new TextDecoder().decode(decrypted)) : decrypted;
	        }
	        if (!this.crypto)
	            throw new Error('Decryption error: cypher key not set');
	        {
	            return this.crypto.decrypt(data, customCipherKey);
	        }
	    }
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
	    encryptFile(keyOrFile, file) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a;
	            if (typeof keyOrFile !== 'string')
	                file = keyOrFile;
	            if (!file)
	                throw new Error('File encryption error. Source file is missing.');
	            if (!this._configuration.PubNubFile)
	                throw new Error('File encryption error. File constructor not configured.');
	            if (typeof keyOrFile !== 'string' && !this._configuration.getCryptoModule())
	                throw new Error('File encryption error. Crypto module not configured.');
	            if (typeof keyOrFile === 'string') {
	                if (!this.cryptography)
	                    throw new Error('File encryption error. File encryption not available');
	                return this.cryptography.encryptFile(keyOrFile, file, this._configuration.PubNubFile);
	            }
	            return (_a = this._configuration.getCryptoModule()) === null || _a === void 0 ? void 0 : _a.encryptFile(file, this._configuration.PubNubFile);
	        });
	    }
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
	    decryptFile(keyOrFile, file) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a;
	            if (typeof keyOrFile !== 'string')
	                file = keyOrFile;
	            if (!file)
	                throw new Error('File encryption error. Source file is missing.');
	            if (!this._configuration.PubNubFile)
	                throw new Error('File decryption error. File constructor' + ' not configured.');
	            if (typeof keyOrFile === 'string' && !this._configuration.getCryptoModule())
	                throw new Error('File decryption error. Crypto module not configured.');
	            if (typeof keyOrFile === 'string') {
	                if (!this.cryptography)
	                    throw new Error('File decryption error. File decryption not available');
	                return this.cryptography.decryptFile(keyOrFile, file, this._configuration.PubNubFile);
	            }
	            return (_a = this._configuration.getCryptoModule()) === null || _a === void 0 ? void 0 : _a.decryptFile(file, this._configuration.PubNubFile);
	        });
	    }
	}
	/**
	 * {@link ArrayBuffer} to {@link string} decoder.
	 *
	 * @internal
	 */
	PubNubCore.decoder = new TextDecoder();
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

	/**
	 * Cbor decoder module.
	 *
	 * @internal
	 */
	/**
	 * CBOR data decoder.
	 *
	 * @internal
	 */
	class Cbor {
	    constructor(decode, base64ToBinary) {
	        this.decode = decode;
	        this.base64ToBinary = base64ToBinary;
	    }
	    /**
	     * Decode CBOR base64-encoded object.
	     *
	     * @param tokenString - Base64-encoded token.
	     *
	     * @returns Token object decoded from CBOR.
	     */
	    decodeToken(tokenString) {
	        let padding = '';
	        if (tokenString.length % 4 === 3)
	            padding = '=';
	        else if (tokenString.length % 4 === 2)
	            padding = '==';
	        const cleaned = tokenString.replace(/-/gi, '+').replace(/_/gi, '/') + padding;
	        const result = this.decode(this.base64ToBinary(cleaned));
	        return typeof result === 'object' ? result : undefined;
	    }
	}

	/* eslint no-bitwise: ["error", { "allow": ["~", "&", ">>"] }] */
	/* global navigator */
	/**
	 * PubNub client for browser platform.
	 */
	class PubNub extends PubNubCore {
	    /**
	     * Create and configure PubNub client core.
	     *
	     * @param configuration - User-provided PubNub client configuration.
	     *
	     * @returns Configured and ready to use PubNub client.
	     */
	    constructor(configuration) {
	        var _a;
	        const configurationCopy = setDefaults(configuration);
	        const platformConfiguration = Object.assign(Object.assign({}, configurationCopy), { sdkFamily: 'Web' });
	        platformConfiguration.PubNubFile = PubNubFile;
	        // Prepare full client configuration.
	        const clientConfiguration = makeConfiguration(platformConfiguration, (cryptoConfiguration) => {
	            if (!cryptoConfiguration.cipherKey)
	                return undefined;
	            {
	                return new WebCryptoModule({
	                    default: new LegacyCryptor(Object.assign({}, cryptoConfiguration)),
	                    cryptors: [new AesCbcCryptor({ cipherKey: cryptoConfiguration.cipherKey })],
	                });
	            }
	        });
	        // Prepare Token manager.
	        let tokenManager;
	        {
	            tokenManager = new TokenManager(new Cbor((arrayBuffer) => stringifyBufferKeys(CborReader.decode(arrayBuffer)), decode));
	        }
	        // Legacy crypto (legacy data encryption / decryption and request signature support).
	        let crypto;
	        {
	            if (clientConfiguration.getCipherKey() || clientConfiguration.secretKey) {
	                crypto = new Crypto({
	                    secretKey: clientConfiguration.secretKey,
	                    cipherKey: clientConfiguration.getCipherKey(),
	                    useRandomIVs: clientConfiguration.getUseRandomIVs(),
	                    customEncrypt: clientConfiguration.getCustomEncrypt(),
	                    customDecrypt: clientConfiguration.getCustomDecrypt(),
	                });
	            }
	        }
	        let cryptography;
	        cryptography = new WebCryptography();
	        // Setup transport provider.
	        let transport = new WebReactNativeTransport(clientConfiguration.keepAlive, clientConfiguration.logVerbosity);
	        {
	            if (configurationCopy.subscriptionWorkerUrl) {
	                // Inject subscription worker into transport provider stack.
	                transport = new SubscriptionWorkerMiddleware({
	                    clientIdentifier: clientConfiguration._instanceId,
	                    subscriptionKey: clientConfiguration.subscribeKey,
	                    userId: clientConfiguration.getUserId(),
	                    workerUrl: configurationCopy.subscriptionWorkerUrl,
	                    sdkVersion: clientConfiguration.getVersion(),
	                    logVerbosity: clientConfiguration.logVerbosity,
	                    workerLogVerbosity: platformConfiguration.subscriptionWorkerLogVerbosity,
	                    transport,
	                });
	            }
	        }
	        const transportMiddleware = new PubNubMiddleware({
	            clientConfiguration,
	            tokenManager,
	            transport,
	        });
	        super({
	            configuration: clientConfiguration,
	            transport: transportMiddleware,
	            cryptography,
	            tokenManager,
	            crypto,
	        });
	        if ((_a = configuration.listenToBrowserNetworkEvents) !== null && _a !== void 0 ? _a : true) {
	            window.addEventListener('offline', () => {
	                this.networkDownDetected();
	            });
	            window.addEventListener('online', () => {
	                this.networkUpDetected();
	            });
	        }
	    }
	    networkDownDetected() {
	        this.listenerManager.announceNetworkDown();
	        if (this._configuration.restore)
	            this.disconnect();
	        else
	            this.destroy(true);
	    }
	    networkUpDetected() {
	        this.listenerManager.announceNetworkUp();
	        this.reconnect();
	    }
	}
	/**
	 * Data encryption / decryption module constructor.
	 */
	// @ts-expect-error Allowed to simplify interface when module can be disabled.
	PubNub.CryptoModule = WebCryptoModule ;

	return PubNub;

}));
