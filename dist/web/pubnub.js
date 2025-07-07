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
	    /**
	     * Assign registered loggers' manager.
	     *
	     * @param _logger - Registered loggers' manager.
	     *
	     * @internal
	     */
	    set logger(_logger) {
	        throw new Error('Method not implemented.');
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
	    // endregion
	    /**
	     * Serialize crypto module information to string.
	     *
	     * @returns Serialized crypto module information.
	     */
	    toString() {
	        return `AbstractCryptoModule { default: ${this.defaultCryptor.toString()}, cryptors: [${this.cryptors.map((c) => c.toString()).join(', ')}]}`;
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
	     * PubNub service or intermediate "actor" returned unexpected response.
	     *
	     * There can be few sources of unexpected return with success code:
	     * - proxy server / VPN;
	     * - Wi-Fi hotspot authorization page.
	     */
	    StatusCategory["PNMalformedResponseCategory"] = "PNMalformedResponseCategory";
	    /**
	     * Server can't process request.
	     *
	     * There can be few sources of unexpected return with success code:
	     * - potentially an ongoing incident;
	     * - proxy server / VPN.
	     */
	    StatusCategory["PNServerErrorCategory"] = "PNServerErrorCategory";
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
	     * Set of active channels and groups has been changed.
	     */
	    StatusCategory["PNSubscriptionChangedCategory"] = "PNSubscriptionChangedCategory";
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
	 * @param category - Occurred error category.
	 *
	 * @returns Error status object.
	 *
	 * @internal
	 */
	function createError(errorPayload, category) {
	    var _a;
	    (_a = errorPayload.statusCode) !== null && _a !== void 0 ? _a : (errorPayload.statusCode = 0);
	    return Object.assign(Object.assign({}, errorPayload), { statusCode: errorPayload.statusCode, category, error: true });
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
	    return createError(Object.assign({ message }, ({})), StatusCategory$1.PNValidationErrorCategory);
	}
	/**
	 * Create malformed service response error status object.
	 *
	 * @param [responseText] - Stringified original service response.
	 * @param [statusCode] - Operation HTTP status code.
	 */
	function createMalformedResponseError(responseText, statusCode) {
	    return createError(Object.assign(Object.assign({ message: 'Unable to deserialize service response' }, (responseText !== undefined ? { responseText } : {})), (statusCode !== undefined ? { statusCode } : {})), StatusCategory$1.PNMalformedResponseCategory);
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
	    /**
	     * Serialize cryptor information to string.
	     *
	     * @returns Serialized cryptor information.
	     */
	    toString() {
	        return `AesCbcCryptor { cipherKey: ${this.cipherKey} }`;
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
	        this.logger = configuration.logger;
	        this.defaultOptions = {
	            encryptKey: true,
	            keyEncoding: 'utf8',
	            keyLength: 256,
	            mode: 'cbc',
	        };
	    }
	    /**
	     * Update registered loggers' manager.
	     *
	     * @param [logger] - Logger, which crypto should use.
	     */
	    set logger(logger) {
	        this._logger = logger;
	        if (this.logger) {
	            this.logger.debug('Crypto', () => ({
	                messageType: 'object',
	                message: this.configuration,
	                details: 'Create with configuration:',
	                ignoredKeys(key, obj) {
	                    return typeof obj[key] === 'function' || key === 'logger';
	                },
	            }));
	        }
	    }
	    /**
	     * Get loggers' manager.
	     *
	     * @returns Loggers' manager (if set).
	     */
	    get logger() {
	        return this._logger;
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
	        if (this.configuration.customEncrypt) {
	            if (this.logger)
	                this.logger.warn('Crypto', "'customEncrypt' is deprecated. Consult docs for better alternative.");
	            return this.configuration.customEncrypt(data);
	        }
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
	        if (this.configuration.customDecrypt) {
	            if (this.logger)
	                this.logger.warn('Crypto', "'customDecrypt' is deprecated. Consult docs for better alternative.");
	            return this.configuration.customDecrypt(data);
	        }
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
	        if (this.logger) {
	            this.logger.debug('Crypto', () => ({
	                messageType: 'object',
	                message: Object.assign({ data, cipherKey: decidedCipherKey }, (options !== null && options !== void 0 ? options : {})),
	                details: 'Encrypt with parameters:',
	            }));
	        }
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
	        if (this.logger) {
	            this.logger.debug('Crypto', () => ({
	                messageType: 'object',
	                message: Object.assign({ data, cipherKey: decidedCipherKey }, (options !== null && options !== void 0 ? options : {})),
	                details: 'Decrypt with parameters:',
	            }));
	        }
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
	                if (this.logger)
	                    this.logger.error('Crypto', () => ({ messageType: 'error', message: e }));
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
	                if (this.logger)
	                    this.logger.error('Crypto', () => ({ messageType: 'error', message: e }));
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
	    /**
	     * Update registered loggers' manager.
	     *
	     * @param [logger] - Logger, which crypto should use.
	     */
	    set logger(logger) {
	        this.cryptor.logger = logger;
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
	    // endregion
	    /**
	     * Serialize cryptor information to string.
	     *
	     * @returns Serialized cryptor information.
	     */
	    toString() {
	        const configurationEntries = Object.entries(this.config).reduce((acc, [key, value]) => {
	            if (key === 'logger')
	                return acc;
	            acc.push(`${key}: ${typeof value === 'function' ? '<function>' : value}`);
	            return acc;
	        }, []);
	        return `AesCbcCryptor { ${configurationEntries.join(', ')} }`;
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
	    /**
	     * Assign registered loggers' manager.
	     *
	     * @param logger - Registered loggers' manager.
	     *
	     * @internal
	     */
	    set logger(logger) {
	        if (this.defaultCryptor.identifier === WebCryptoModule.LEGACY_IDENTIFIER)
	            this.defaultCryptor.logger = logger;
	        else {
	            const cryptor = this.cryptors.find((cryptor) => cryptor.identifier === WebCryptoModule.LEGACY_IDENTIFIER);
	            if (cryptor)
	                cryptor.logger = logger;
	        }
	    }
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
	     * @param [data] - Preprocessed service error response.
	     *
	     * @returns `PubNubAPIError` object with known error category and additional information (if
	     * available).
	     */
	    static create(errorOrResponse, data) {
	        if (PubNubAPIError.isErrorObject(errorOrResponse))
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
	        if (PubNubAPIError.isErrorObject(error)) {
	            message = error.message;
	            errorName = error.name;
	        }
	        if (errorName === 'AbortError' || message.indexOf('Aborted') !== -1) {
	            category = StatusCategory$1.PNCancelledCategory;
	            message = 'Request cancelled';
	        }
	        else if (message.toLowerCase().indexOf('timeout') !== -1) {
	            category = StatusCategory$1.PNTimeoutCategory;
	            message = 'Request timeout';
	        }
	        else if (message.toLowerCase().indexOf('network') !== -1) {
	            category = StatusCategory$1.PNNetworkIssuesCategory;
	            message = 'Network issues';
	        }
	        else if (errorName === 'TypeError') {
	            if (message.indexOf('Load failed') !== -1 || message.indexOf('Failed to fetch') != -1)
	                category = StatusCategory$1.PNNetworkIssuesCategory;
	            else
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
	     * @param [data] - Preprocessed service error response.
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
	        else if (status >= 500) {
	            category = StatusCategory$1.PNServerErrorCategory;
	            message = 'Internal server error';
	        }
	        if (typeof response === 'object' && Object.keys(response).length === 0) {
	            category = StatusCategory$1.PNMalformedResponseCategory;
	            message = 'Malformed response (network issues)';
	            status = 400;
	        }
	        // Try to get more information about error from service response.
	        if (data && data.byteLength > 0) {
	            const decoded = new TextDecoder().decode(data);
	            if (response.headers['content-type'].indexOf('text/javascript') !== -1 ||
	                response.headers['content-type'].indexOf('application/json') !== -1) {
	                try {
	                    const errorResponse = JSON.parse(decoded);
	                    if (typeof errorResponse === 'object') {
	                        if (!Array.isArray(errorResponse)) {
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
	                        else {
	                            // Handling Publish API payload error.
	                            if (typeof errorResponse[0] === 'number' && errorResponse[0] === 0) {
	                                if (errorResponse.length > 1 && typeof errorResponse[1] === 'string')
	                                    errorData = errorResponse[1];
	                            }
	                        }
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
	     * @param [errorData] - Error information.
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
	            // @ts-expect-error Inner helper for JSON.stringify.
	            toJSON: function () {
	                let normalizedErrorData;
	                const errorData = this.errorData;
	                if (errorData) {
	                    try {
	                        if (typeof errorData === 'object') {
	                            const errorObject = Object.assign(Object.assign(Object.assign(Object.assign({}, ('name' in errorData ? { name: errorData.name } : {})), ('message' in errorData ? { message: errorData.message } : {})), ('stack' in errorData ? { stack: errorData.stack } : {})), errorData);
	                            normalizedErrorData = JSON.parse(JSON.stringify(errorObject, PubNubAPIError.circularReplacer()));
	                        }
	                        else
	                            normalizedErrorData = errorData;
	                    }
	                    catch (_) {
	                        normalizedErrorData = { error: 'Could not serialize the error object' };
	                    }
	                }
	                // Make sure to exclude `toJSON` function from the final object.
	                const _a = this, status = __rest(_a, ["toJSON"]);
	                return JSON.stringify(Object.assign(Object.assign({}, status), { errorData: normalizedErrorData }));
	            },
	        };
	    }
	    /**
	     * Convert API error object to PubNub client error object.
	     *
	     * @param operation - Request operation during which error happened.
	     * @param [message] - Custom error message.
	     *
	     * @returns Client-facing pre-formatted endpoint call error.
	     */
	    toPubNubError(operation, message) {
	        return new PubNubError(message !== null && message !== void 0 ? message : this.message, this.toStatus(operation));
	    }
	    /**
	     * Function which handles circular references in serialized JSON.
	     *
	     * @returns Circular reference replacer function.
	     *
	     * @internal
	     */
	    static circularReplacer() {
	        const visited = new WeakSet();
	        return function (_, value) {
	            if (typeof value === 'object' && value !== null) {
	                if (visited.has(value))
	                    return '[Circular]';
	                visited.add(value);
	            }
	            return value;
	        };
	    }
	    /**
	     * Check whether provided `object` is an `Error` or not.
	     *
	     * This check is required because the error object may be tied to a different execution context (global
	     * environment) and won't pass `instanceof Error` from the main window.
	     * To protect against monkey-patching, the `fetch` function is taken from an invisible `iframe` and, as a result,
	     * it is bind to the separate execution context. Errors generated by `fetch` won't pass the simple
	     * `instanceof Error` test.
	     *
	     * @param object - Object which should be checked.
	     *
	     * @returns `true` if `object` looks like an `Error` object.
	     *
	     * @internal
	     */
	    static isErrorObject(object) {
	        if (!object || typeof object !== 'object')
	            return false;
	        if (object instanceof Error)
	            return true;
	        if ('name' in object &&
	            'message' in object &&
	            typeof object.name === 'string' &&
	            typeof object.message === 'string') {
	            return true;
	        }
	        return Object.prototype.toString.call(object) === '[object Error]';
	    }
	}

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
	        /**
	         * Map of base64-encoded access tokens to their parsed representations.
	         */
	        this.accessTokensMap = {};
	        this.workerEventsQueue = [];
	        this.callbacks = new Map();
	        this.setupSubscriptionWorker();
	    }
	    /**
	     * Set status emitter from the PubNub client.
	     *
	     * @param emitter - Function which should be used to emit events.
	     */
	    set emitStatus(emitter) {
	        this._emitStatus = emitter;
	    }
	    /**
	     * Update client's `userId`.
	     *
	     * @param userId - User ID which will be used by the PubNub client further.
	     */
	    onUserIdChange(userId) {
	        this.configuration.userId = userId;
	        this.scheduleEventPost({
	            type: 'client-update',
	            heartbeatInterval: this.configuration.heartbeatInterval,
	            clientIdentifier: this.configuration.clientIdentifier,
	            subscriptionKey: this.configuration.subscriptionKey,
	            userId: this.configuration.userId,
	        });
	    }
	    /**
	     * Update client's heartbeat interval change.
	     *
	     * @param interval - Interval which should be used by timers for _backup_ heartbeat calls created in `SharedWorker`.
	     */
	    onHeartbeatIntervalChange(interval) {
	        this.configuration.heartbeatInterval = interval;
	        this.scheduleEventPost({
	            type: 'client-update',
	            heartbeatInterval: this.configuration.heartbeatInterval,
	            clientIdentifier: this.configuration.clientIdentifier,
	            subscriptionKey: this.configuration.subscriptionKey,
	            userId: this.configuration.userId,
	        });
	    }
	    /**
	     * Handle authorization key / token change.
	     *
	     * @param [token] - Authorization token which should be used.
	     */
	    onTokenChange(token) {
	        const updateEvent = {
	            type: 'client-update',
	            heartbeatInterval: this.configuration.heartbeatInterval,
	            clientIdentifier: this.configuration.clientIdentifier,
	            subscriptionKey: this.configuration.subscriptionKey,
	            userId: this.configuration.userId,
	        };
	        // Trigger request processing by Service Worker.
	        this.parsedAccessToken(token)
	            .then((accessToken) => {
	            updateEvent.preProcessedToken = accessToken;
	            updateEvent.accessToken = token;
	        })
	            .then(() => this.scheduleEventPost(updateEvent));
	    }
	    /**
	     * Terminate all ongoing long-poll requests.
	     */
	    terminate() {
	        this.scheduleEventPost({
	            type: 'client-unregister',
	            clientIdentifier: this.configuration.clientIdentifier,
	            subscriptionKey: this.configuration.subscriptionKey,
	        });
	    }
	    makeSendable(req) {
	        // Use default request flow for non-subscribe / presence leave requests.
	        if (!req.path.startsWith('/v2/subscribe') && !req.path.endsWith('/heartbeat') && !req.path.endsWith('/leave'))
	            return this.configuration.transport.makeSendable(req);
	        this.configuration.logger.debug('SubscriptionWorkerMiddleware', 'Process request with SharedWorker transport.');
	        let controller;
	        const sendRequestEvent = {
	            type: 'send-request',
	            clientIdentifier: this.configuration.clientIdentifier,
	            subscriptionKey: this.configuration.subscriptionKey,
	            request: req,
	        };
	        if (req.cancellable) {
	            controller = {
	                abort: () => {
	                    const cancelRequest = {
	                        type: 'cancel-request',
	                        clientIdentifier: this.configuration.clientIdentifier,
	                        subscriptionKey: this.configuration.subscriptionKey,
	                        identifier: req.identifier,
	                    };
	                    // Cancel active request with specified identifier.
	                    this.scheduleEventPost(cancelRequest);
	                },
	            };
	        }
	        return [
	            new Promise((resolve, reject) => {
	                // Associate Promise resolution / reject with a request identifier for future usage in
	                //  the `onmessage ` handler block to return results.
	                this.callbacks.set(req.identifier, { resolve, reject });
	                // Trigger request processing by Service Worker.
	                this.parsedAccessTokenForRequest(req)
	                    .then((accessToken) => (sendRequestEvent.preProcessedToken = accessToken))
	                    .then(() => this.scheduleEventPost(sendRequestEvent));
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
	        // Trigger request processing by a subscription worker.
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
	        // Trigger request processing by a subscription worker.
	        const subscriptionWorker = this.sharedSubscriptionWorker;
	        if (!subscriptionWorker || this.workerEventsQueue.length === 0)
	            return;
	        // Clean up from canceled events.
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
	        try {
	            this.subscriptionWorker = new SharedWorker(this.configuration.workerUrl, `/pubnub-${this.configuration.sdkVersion}`);
	        }
	        catch (error) {
	            this.configuration.logger.error('SubscriptionWorkerMiddleware', () => ({
	                messageType: 'error',
	                message: error,
	            }));
	            throw error;
	        }
	        this.subscriptionWorker.port.start();
	        // Register PubNub client within subscription worker.
	        this.scheduleEventPost({
	            type: 'client-register',
	            clientIdentifier: this.configuration.clientIdentifier,
	            subscriptionKey: this.configuration.subscriptionKey,
	            userId: this.configuration.userId,
	            heartbeatInterval: this.configuration.heartbeatInterval,
	            workerOfflineClientsCheckInterval: this.configuration.workerOfflineClientsCheckInterval,
	            workerUnsubscribeOfflineClients: this.configuration.workerUnsubscribeOfflineClients,
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
	            this.configuration.logger.trace('SharedWorker', 'Ready for events processing.');
	            this.subscriptionWorkerReady = true;
	            this.flushScheduledEvents();
	        }
	        else if (data.type === 'shared-worker-console-log') {
	            this.configuration.logger.debug('SharedWorker', () => {
	                if (typeof data.message === 'string' || typeof data.message === 'number' || typeof data.message === 'boolean') {
	                    return {
	                        messageType: 'text',
	                        message: data.message,
	                    };
	                }
	                return data.message;
	            });
	        }
	        else if (data.type === 'shared-worker-console-dir') {
	            this.configuration.logger.debug('SharedWorker', () => {
	                return {
	                    messageType: 'object',
	                    message: data.data,
	                    details: data.message ? data.message : undefined,
	                };
	            });
	        }
	        else if (data.type === 'shared-worker-ping') {
	            const { subscriptionKey, clientIdentifier } = this.configuration;
	            this.scheduleEventPost({ type: 'client-pong', subscriptionKey, clientIdentifier });
	        }
	        else if (data.type === 'request-process-success' || data.type === 'request-process-error') {
	            if (this.callbacks.has(data.identifier)) {
	                const { resolve, reject } = this.callbacks.get(data.identifier);
	                if (data.type === 'request-process-success') {
	                    resolve({
	                        status: data.response.status,
	                        url: data.url,
	                        headers: data.response.headers,
	                        body: data.response.body,
	                    });
	                }
	                else
	                    reject(this.errorFromRequestSendingError(data));
	            }
	            // Handling "backup" heartbeat which doesn't have registered callbacks.
	            else if (this._emitStatus && data.url.indexOf('/v2/presence') >= 0 && data.url.indexOf('/heartbeat') >= 0) {
	                if (data.type === 'request-process-success' && this.configuration.announceSuccessfulHeartbeats) {
	                    this._emitStatus({
	                        statusCode: data.response.status,
	                        error: false,
	                        operation: RequestOperation$1.PNHeartbeatOperation,
	                        category: StatusCategory$1.PNAcknowledgmentCategory,
	                    });
	                }
	                else if (data.type === 'request-process-error' && this.configuration.announceFailedHeartbeats)
	                    this._emitStatus(this.errorFromRequestSendingError(data).toStatus(RequestOperation$1.PNHeartbeatOperation));
	            }
	        }
	    }
	    /**
	     * Get parsed access token object from request.
	     *
	     * @param req - Transport request which may contain access token for processing.
	     *
	     * @returns Object with stringified access token information and expiration date information.
	     */
	    parsedAccessTokenForRequest(req) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a;
	            return this.parsedAccessToken(req.queryParameters ? ((_a = req.queryParameters.auth) !== null && _a !== void 0 ? _a : '') : undefined);
	        });
	    }
	    /**
	     * Get parsed access token object.
	     *
	     * @param accessToken - Access token for processing.
	     *
	     * @returns Object with stringified access token information and expiration date information.
	     */
	    parsedAccessToken(accessToken) {
	        return __awaiter(this, void 0, void 0, function* () {
	            if (!accessToken)
	                return undefined;
	            else if (this.accessTokensMap[accessToken])
	                return this.accessTokensMap[accessToken];
	            return this.stringifyAccessToken(accessToken).then(([token, stringifiedToken]) => {
	                if (!token || !stringifiedToken)
	                    return undefined;
	                return (this.accessTokensMap = {
	                    [accessToken]: { token: stringifiedToken, expiration: token.timestamp * token.ttl * 60 },
	                })[accessToken];
	            });
	        });
	    }
	    /**
	     * Stringify access token content.
	     *
	     * Stringify information about resources with permissions.
	     *
	     * @param tokenString - Base64-encoded access token which should be parsed and stringified.
	     *
	     * @returns Tuple with parsed access token and its stringified content hash string.
	     */
	    stringifyAccessToken(tokenString) {
	        return __awaiter(this, void 0, void 0, function* () {
	            if (!this.configuration.tokenManager)
	                return [undefined, undefined];
	            const token = this.configuration.tokenManager.parseToken(tokenString);
	            if (!token)
	                return [undefined, undefined];
	            // Translate permission to short string built from first chars of enabled permission.
	            const stringifyPermissions = (permission) => Object.entries(permission)
	                .filter(([_, v]) => v)
	                .map(([k]) => k[0])
	                .sort()
	                .join('');
	            const stringifyResources = (resource) => resource
	                ? Object.entries(resource)
	                    .sort(([a], [b]) => a.localeCompare(b))
	                    .map(([type, entries]) => Object.entries(entries || {})
	                    .sort(([a], [b]) => a.localeCompare(b))
	                    .map(([name, perms]) => `${type}:${name}=${perms ? stringifyPermissions(perms) : ''}`)
	                    .join(','))
	                    .join(';')
	                : '';
	            let accessToken = [stringifyResources(token.resources), stringifyResources(token.patterns), token.authorized_uuid]
	                .filter(Boolean)
	                .join('|');
	            if (typeof crypto !== 'undefined' && crypto.subtle) {
	                const hash = yield crypto.subtle.digest('SHA-256', new TextEncoder().encode(accessToken));
	                accessToken = String.fromCharCode(...Array.from(new Uint8Array(hash)));
	            }
	            return [token, typeof btoa !== 'undefined' ? btoa(accessToken) : accessToken];
	        });
	    }
	    /**
	     * Create error from failure received from the `SharedWorker`.
	     *
	     * @param sendingError - Request sending error received from the `SharedWorker`.
	     *
	     * @returns `PubNubAPIError` instance with request processing failure information.
	     */
	    errorFromRequestSendingError(sendingError) {
	        let category = StatusCategory$1.PNUnknownCategory;
	        let message = 'Unknown error';
	        // Handle client-side issues (if any).
	        if (sendingError.error) {
	            if (sendingError.error.type === 'NETWORK_ISSUE')
	                category = StatusCategory$1.PNNetworkIssuesCategory;
	            else if (sendingError.error.type === 'TIMEOUT')
	                category = StatusCategory$1.PNTimeoutCategory;
	            else if (sendingError.error.type === 'ABORTED')
	                category = StatusCategory$1.PNCancelledCategory;
	            message = `${sendingError.error.message} (${sendingError.identifier})`;
	        }
	        // Handle service error response.
	        else if (sendingError.response) {
	            const { url, response } = sendingError;
	            return PubNubAPIError.create({ url, headers: response.headers, body: response.body, status: response.status }, response.body);
	        }
	        return new PubNubAPIError(message, category, 0, new Error(message));
	    }
	}

	/**
	 * CBOR support module.
	 *
	 * @internal
	 */
	/**
	 * Re-map CBOR object keys from potentially C buffer strings to actual strings.
	 *
	 * @param obj CBOR which should be remapped to stringified keys.
	 * @param nestingLevel PAM token structure nesting level.
	 *
	 * @returns Dictionary with stringified keys.
	 *
	 * @internal
	 */
	function stringifyBufferKeys(obj, nestingLevel = 0) {
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
	        if (nestingLevel < 2) {
	            if (keyIsString && key.indexOf(',') >= 0) {
	                const bytes = key.split(',').map(Number);
	                stringifiedKey = bytes.reduce((string, byte) => {
	                    return string + String.fromCharCode(byte);
	                }, '');
	            }
	            else if (isNumber(key) || (keyIsString && !isNaN(Number(key)))) {
	                stringifiedKey = String.fromCharCode(isNumber(key) ? key : parseInt(key, 10));
	            }
	        }
	        normalizedObject[stringifiedKey] = isObject(value) ? stringifyBufferKeys(value, nestingLevel + 1) : value;
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
	 * Whether heartbeat should be postponed on successful subscribe response or not.
	 */
	const USE_SMART_HEARTBEAT = false;
	/**
	 * Whether PubNub client should try to utilize existing TCP connection for new requests or not.
	 */
	const KEEP_ALIVE$1 = false;
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
	 * File upload / download request timeout.
	 */
	const FILE_REQUEST_TIMEOUT = 300;
	/**
	 * Default user presence timeout.
	 */
	const PRESENCE_TIMEOUT = 300;
	/**
	 * Maximum user presence timeout.
	 */
	const PRESENCE_TIMEOUT_MAXIMUM = 320;
	/**
	 * Apply configuration default values.
	 *
	 * @param configuration - User-provided configuration.
	 *
	 * @internal
	 */
	const setDefaults$1 = (configuration) => {
	    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
	    // Copy configuration.
	    const configurationCopy = Object.assign({}, configuration);
	    (_a = configurationCopy.ssl) !== null && _a !== void 0 ? _a : (configurationCopy.ssl = USE_SSL);
	    (_b = configurationCopy.transactionalRequestTimeout) !== null && _b !== void 0 ? _b : (configurationCopy.transactionalRequestTimeout = TRANSACTIONAL_REQUEST_TIMEOUT);
	    (_c = configurationCopy.subscribeRequestTimeout) !== null && _c !== void 0 ? _c : (configurationCopy.subscribeRequestTimeout = SUBSCRIBE_REQUEST_TIMEOUT);
	    (_d = configurationCopy.fileRequestTimeout) !== null && _d !== void 0 ? _d : (configurationCopy.fileRequestTimeout = FILE_REQUEST_TIMEOUT);
	    (_e = configurationCopy.restore) !== null && _e !== void 0 ? _e : (configurationCopy.restore = RESTORE);
	    (_f = configurationCopy.useInstanceId) !== null && _f !== void 0 ? _f : (configurationCopy.useInstanceId = USE_INSTANCE_ID);
	    (_g = configurationCopy.suppressLeaveEvents) !== null && _g !== void 0 ? _g : (configurationCopy.suppressLeaveEvents = SUPPRESS_LEAVE_EVENTS);
	    (_h = configurationCopy.requestMessageCountThreshold) !== null && _h !== void 0 ? _h : (configurationCopy.requestMessageCountThreshold = DEDUPE_CACHE_SIZE);
	    (_j = configurationCopy.autoNetworkDetection) !== null && _j !== void 0 ? _j : (configurationCopy.autoNetworkDetection = AUTO_NETWORK_DETECTION);
	    (_k = configurationCopy.enableEventEngine) !== null && _k !== void 0 ? _k : (configurationCopy.enableEventEngine = ENABLE_EVENT_ENGINE);
	    (_l = configurationCopy.maintainPresenceState) !== null && _l !== void 0 ? _l : (configurationCopy.maintainPresenceState = MAINTAIN_PRESENCE_STATE);
	    (_m = configurationCopy.useSmartHeartbeat) !== null && _m !== void 0 ? _m : (configurationCopy.useSmartHeartbeat = USE_SMART_HEARTBEAT);
	    (_o = configurationCopy.keepAlive) !== null && _o !== void 0 ? _o : (configurationCopy.keepAlive = KEEP_ALIVE$1);
	    if (configurationCopy.userId && configurationCopy.uuid)
	        throw new PubNubError("PubNub client configuration error: use only 'userId'");
	    (_p = configurationCopy.userId) !== null && _p !== void 0 ? _p : (configurationCopy.userId = configurationCopy.uuid);
	    if (!configurationCopy.userId)
	        throw new PubNubError("PubNub client configuration error: 'userId' not set");
	    else if (((_q = configurationCopy.userId) === null || _q === void 0 ? void 0 : _q.trim().length) === 0)
	        throw new PubNubError("PubNub client configuration error: 'userId' is empty");
	    // Generate default origin subdomains.
	    if (!configurationCopy.origin)
	        configurationCopy.origin = Array.from({ length: 20 }, (_, i) => `ps${i + 1}.pndsn.com`);
	    const keySet = {
	        subscribeKey: configurationCopy.subscribeKey,
	        publishKey: configurationCopy.publishKey,
	        secretKey: configurationCopy.secretKey,
	    };
	    if (configurationCopy.presenceTimeout !== undefined) {
	        if (configurationCopy.presenceTimeout > PRESENCE_TIMEOUT_MAXIMUM) {
	            configurationCopy.presenceTimeout = PRESENCE_TIMEOUT_MAXIMUM;
	            // eslint-disable-next-line no-console
	            console.warn('WARNING: Presence timeout is larger than the maximum. Using maximum value: ', PRESENCE_TIMEOUT_MAXIMUM);
	        }
	        else if (configurationCopy.presenceTimeout <= 0) {
	            // eslint-disable-next-line no-console
	            console.warn('WARNING: Presence timeout should be larger than zero.');
	            delete configurationCopy.presenceTimeout;
	        }
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
	 * Interval at which Shared Worker should check whether PubNub instances which used it still active or not.
	 */
	const SUBSCRIPTION_WORKER_OFFLINE_CLIENTS_CHECK_INTERVAL = 10;
	/**
	 * Whether `leave` request should be sent for _offline_ PubNub client or not.
	 */
	const SUBSCRIPTION_WORKER_UNSUBSCRIBE_OFFLINE_CLIENTS = false;
	/**
	 * Use modern Web Fetch API for network requests by default.
	 */
	const TRANSPORT = 'fetch';
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
	    var _a, _b, _c, _d, _e, _f;
	    // Force to disable service workers if the environment doesn't support them.
	    if (configuration.subscriptionWorkerUrl && typeof SharedWorker === 'undefined') {
	        configuration.subscriptionWorkerUrl = null;
	    }
	    return Object.assign(Object.assign({}, setDefaults$1(configuration)), { 
	        // Set platform-specific options.
	        listenToBrowserNetworkEvents: (_a = configuration.listenToBrowserNetworkEvents) !== null && _a !== void 0 ? _a : LISTEN_TO_BROWSER_NETWORK_EVENTS, subscriptionWorkerUrl: configuration.subscriptionWorkerUrl, subscriptionWorkerOfflineClientsCheckInterval: (_b = configuration.subscriptionWorkerOfflineClientsCheckInterval) !== null && _b !== void 0 ? _b : SUBSCRIPTION_WORKER_OFFLINE_CLIENTS_CHECK_INTERVAL, subscriptionWorkerUnsubscribeOfflineClients: (_c = configuration.subscriptionWorkerUnsubscribeOfflineClients) !== null && _c !== void 0 ? _c : SUBSCRIPTION_WORKER_UNSUBSCRIBE_OFFLINE_CLIENTS, subscriptionWorkerLogVerbosity: (_d = configuration.subscriptionWorkerLogVerbosity) !== null && _d !== void 0 ? _d : SUBSCRIPTION_WORKER_LOG_VERBOSITY, transport: (_e = configuration.transport) !== null && _e !== void 0 ? _e : TRANSPORT, keepAlive: (_f = configuration.keepAlive) !== null && _f !== void 0 ? _f : KEEP_ALIVE });
	};

	/**
	 * Enum with available log levels.
	 */
	var LogLevel;
	(function (LogLevel) {
	    /**
	     * Used to notify about every last detail:
	     * - function calls,
	     * - full payloads,
	     * - internal variables,
	     * - state-machine hops.
	     */
	    LogLevel[LogLevel["Trace"] = 0] = "Trace";
	    /**
	     * Used to notify about broad strokes of your SDK’s logic:
	     * - inputs/outputs to public methods,
	     * - network request
	     * - network response
	     * - decision branches.
	     */
	    LogLevel[LogLevel["Debug"] = 1] = "Debug";
	    /**
	     * Used to notify summary of what the SDK is doing under the hood:
	     * - initialized,
	     * - connected,
	     * - entity created.
	     */
	    LogLevel[LogLevel["Info"] = 2] = "Info";
	    /**
	     * Used to notify about non-fatal events:
	     * - deprecations,
	     * - request retries.
	     */
	    LogLevel[LogLevel["Warn"] = 3] = "Warn";
	    /**
	     * Used to notify about:
	     * - exceptions,
	     * - HTTP failures,
	     * - invalid states.
	     */
	    LogLevel[LogLevel["Error"] = 4] = "Error";
	    /**
	     * Logging disabled.
	     */
	    LogLevel[LogLevel["None"] = 5] = "None";
	})(LogLevel || (LogLevel = {}));

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
	 * Adjust `timetoken` to represent current time in PubNub's high-precision time format.
	 *
	 * @param timetoken - Timetoken recently used for subscribe long-poll request.
	 * @param [referenceTimetoken] - Previously computed reference timetoken.
	 *
	 * @returns Adjusted timetoken if recent timetoken available.
	 */
	const subscriptionTimetokenFromReference = (timetoken, referenceTimetoken) => {
	    if (referenceTimetoken === '0' || timetoken === '0')
	        return undefined;
	    const timetokenDiff = adjustedTimetokenBy(`${Date.now()}0000`, referenceTimetoken, false);
	    return adjustedTimetokenBy(timetoken, timetokenDiff, true);
	};
	/**
	 * Create reference timetoken based on subscribe timetoken and the user's local time.
	 *
	 * Subscription-based reference timetoken allows later computing approximate timetoken at any point in time.
	 *
	 * @param [serviceTimetoken] - Timetoken received from the PubNub subscribe service.
	 * @param [catchUpTimetoken] - Previously stored or user-provided catch-up timetoken.
	 * @param [referenceTimetoken] - Previously computed reference timetoken. **Important:** This value should be used
	 * in the case of restore because the actual time when service and catch-up timetokens are received is really
	 * different from the current local time.
	 *
	 * @returns Reference timetoken.
	 */
	const referenceSubscribeTimetoken = (serviceTimetoken, catchUpTimetoken, referenceTimetoken) => {
	    if (!serviceTimetoken || serviceTimetoken.length === 0)
	        return undefined;
	    if (catchUpTimetoken && catchUpTimetoken.length > 0 && catchUpTimetoken !== '0') {
	        // Compensate reference timetoken because catch-up timetoken has been used.
	        const timetokensDiff = adjustedTimetokenBy(serviceTimetoken, catchUpTimetoken, false);
	        return adjustedTimetokenBy(referenceTimetoken !== null && referenceTimetoken !== void 0 ? referenceTimetoken : `${Date.now()}0000`, timetokensDiff.replace('-', ''), Number(timetokensDiff) < 0);
	    }
	    else if (referenceTimetoken && referenceTimetoken.length > 0 && referenceTimetoken !== '0')
	        return referenceTimetoken;
	    else
	        return `${Date.now()}0000`;
	};
	/**
	 * High-precision time token adjustment.
	 *
	 * @param timetoken - Source timetoken which should be adjusted.
	 * @param value - Value in nanoseconds which should be used for source timetoken adjustment.
	 * @param increment - Whether source timetoken should be incremented or decremented.
	 *
	 * @returns Adjusted high-precision PubNub timetoken.
	 */
	const adjustedTimetokenBy = (timetoken, value, increment) => {
	    // Normalize value to the PubNub's high-precision time format.
	    value = value.padStart(17, '0');
	    const secA = timetoken.slice(0, 10);
	    const tickA = timetoken.slice(10, 17);
	    const secB = value.slice(0, 10);
	    const tickB = value.slice(10, 17);
	    let seconds = Number(secA);
	    let ticks = Number(tickA);
	    seconds += Number(secB) * (increment ? 1 : -1);
	    ticks += Number(tickB) * (increment ? 1 : -1);
	    if (ticks >= 10000000) {
	        seconds += Math.floor(ticks / 10000000);
	        ticks %= 10000000;
	    }
	    else if (ticks < 0) {
	        if (seconds > 0) {
	            seconds -= 1;
	            ticks += 10000000;
	        }
	        else if (seconds < 0)
	            ticks *= -1;
	    }
	    return seconds !== 0 ? `${seconds}${`${ticks}`.padStart(7, '0')}` : `${ticks}`;
	};
	/**
	 * Compute received update (message, event) fingerprint.
	 *
	 * @param input - Data payload from subscribe API response.
	 *
	 * @returns Received update fingerprint.
	 */
	const messageFingerprint = (input) => {
	    const msg = typeof input !== 'string' ? JSON.stringify(input) : input;
	    const mfp = new Uint32Array(1);
	    let walk = 0;
	    let len = msg.length;
	    while (len-- > 0)
	        mfp[0] = (mfp[0] << 5) - mfp[0] + msg.charCodeAt(walk++);
	    return mfp[0].toString(16).padStart(8, '0');
	};

	/**
	 * Default console-based logger.
	 *
	 * **Important:** This logger is always added as part of {@link LoggerManager} instance configuration and can't be
	 * removed.
	 *
	 * @internal
	 */
	/**
	 * Custom {@link Logger} implementation to show a message in the native console.
	 */
	class ConsoleLogger {
	    /**
	     * Process a `trace` level message.
	     *
	     * @param message - Message which should be handled by custom logger implementation.
	     */
	    debug(message) {
	        this.log(message);
	    }
	    /**
	     * Process a `debug` level message.
	     *
	     * @param message - Message which should be handled by custom logger implementation.
	     */
	    error(message) {
	        this.log(message);
	    }
	    /**
	     * Process an `info` level message.
	     *
	     * @param message - Message which should be handled by custom logger implementation.
	     */
	    info(message) {
	        this.log(message);
	    }
	    /**
	     * Process a `warn` level message.
	     *
	     * @param message - Message which should be handled by custom logger implementation.
	     */
	    trace(message) {
	        this.log(message);
	    }
	    /**
	     * Process an `error` level message.
	     *
	     * @param message - Message which should be handled by custom logger implementation.
	     */
	    warn(message) {
	        this.log(message);
	    }
	    /**
	     * Process log message object.
	     *
	     * @param message - Object with information which can be used to identify level and prepare log entry payload.
	     */
	    log(message) {
	        const logLevelString = LogLevel[message.level];
	        const level = logLevelString.toLowerCase();
	        console[level === 'trace' ? 'debug' : level](`${message.timestamp.toISOString()} PubNub-${message.pubNubId} ${logLevelString.padEnd(5, ' ')}${message.location ? ` ${message.location}` : ''} ${this.logMessage(message)}`);
	    }
	    /**
	     * Get a pre-formatted log message.
	     *
	     * @param message - Log message which should be stringified.
	     *
	     * @returns String formatted for log entry in console.
	     */
	    logMessage(message) {
	        if (message.messageType === 'text')
	            return message.message;
	        else if (message.messageType === 'object')
	            return `${message.details ? `${message.details}\n` : ''}${this.formattedObject(message)}`;
	        else if (message.messageType === 'network-request') {
	            const showOnlyBasicInfo = !!message.canceled || !!message.failed;
	            const headersList = message.minimumLevel === LogLevel.Trace && !showOnlyBasicInfo ? this.formattedHeaders(message) : undefined;
	            const request = message.message;
	            const queryString = request.queryParameters && Object.keys(request.queryParameters).length > 0
	                ? queryStringFromObject(request.queryParameters)
	                : undefined;
	            const url = `${request.origin}${request.path}${queryString ? `?${queryString}` : ''}`;
	            const formattedBody = !showOnlyBasicInfo ? this.formattedBody(message) : undefined;
	            let action = 'Sending';
	            if (showOnlyBasicInfo)
	                action = `${!!message.canceled ? 'Canceled' : 'Failed'}${message.details ? ` (${message.details})` : ''}`;
	            const padding = ((formattedBody === null || formattedBody === void 0 ? void 0 : formattedBody.formData) ? 'FormData' : 'Method').length;
	            return `${action} HTTP request:\n  ${this.paddedString('Method', padding)}: ${request.method}\n  ${this.paddedString('URL', padding)}: ${url}${headersList ? `\n  ${this.paddedString('Headers', padding)}:\n${headersList}` : ''}${(formattedBody === null || formattedBody === void 0 ? void 0 : formattedBody.formData) ? `\n  ${this.paddedString('FormData', padding)}:\n${formattedBody.formData}` : ''}${(formattedBody === null || formattedBody === void 0 ? void 0 : formattedBody.body) ? `\n  ${this.paddedString('Body', padding)}:\n${formattedBody.body}` : ''}`;
	        }
	        else if (message.messageType === 'network-response') {
	            const headersList = message.minimumLevel === LogLevel.Trace ? this.formattedHeaders(message) : undefined;
	            const formattedBody = this.formattedBody(message);
	            const padding = ((formattedBody === null || formattedBody === void 0 ? void 0 : formattedBody.formData) ? 'Headers' : 'Status').length;
	            const response = message.message;
	            return `Received HTTP response:\n  ${this.paddedString('URL', padding)}: ${response.url}\n  ${this.paddedString('Status', padding)}: ${response.status}${headersList ? `\n  ${this.paddedString('Headers', padding)}:\n${headersList}` : ''}${(formattedBody === null || formattedBody === void 0 ? void 0 : formattedBody.body) ? `\n  ${this.paddedString('Body', padding)}:\n${formattedBody.body}` : ''}`;
	        }
	        else if (message.messageType === 'error') {
	            const formattedStatus = this.formattedErrorStatus(message);
	            const error = message.message;
	            return `${error.name}: ${error.message}${formattedStatus ? `\n${formattedStatus}` : ''}`;
	        }
	        return '<unknown log message data>';
	    }
	    /**
	     * Get a pre-formatted object (dictionary / array).
	     *
	     * @param message - Log message which may contain an object for formatting.
	     *
	     * @returns String formatted for log entry in console or `undefined` if a log message doesn't have suitable data.
	     */
	    formattedObject(message) {
	        const stringify = (obj, level = 1, skipIndentOnce = false) => {
	            const maxIndentReached = level === 10;
	            const targetIndent = ' '.repeat(level * 2);
	            const lines = [];
	            const isIgnored = (key, obj) => {
	                if (!message.ignoredKeys)
	                    return false;
	                if (typeof message.ignoredKeys === 'function')
	                    return message.ignoredKeys(key, obj);
	                return message.ignoredKeys.includes(key);
	            };
	            if (typeof obj === 'string')
	                lines.push(`${targetIndent}- ${obj}`);
	            else if (typeof obj === 'number')
	                lines.push(`${targetIndent}- ${obj}`);
	            else if (typeof obj === 'boolean')
	                lines.push(`${targetIndent}- ${obj}`);
	            else if (obj === null)
	                lines.push(`${targetIndent}- null`);
	            else if (obj === undefined)
	                lines.push(`${targetIndent}- undefined`);
	            else if (typeof obj === 'function')
	                lines.push(`${targetIndent}- <function>`);
	            else if (typeof obj === 'object') {
	                if (!Array.isArray(obj) && typeof obj.toString === 'function' && obj.toString().indexOf('[object') !== 0) {
	                    lines.push(`${skipIndentOnce ? '' : targetIndent}${obj.toString()}`);
	                    skipIndentOnce = false;
	                }
	                else if (Array.isArray(obj)) {
	                    for (const element of obj) {
	                        const indent = skipIndentOnce ? '' : targetIndent;
	                        if (element === null)
	                            lines.push(`${indent}- null`);
	                        else if (element === undefined)
	                            lines.push(`${indent}- undefined`);
	                        else if (typeof element === 'function')
	                            lines.push(`${indent}- <function>`);
	                        else if (typeof element === 'object') {
	                            const isArray = Array.isArray(element);
	                            const entry = maxIndentReached ? '...' : stringify(element, level + 1, !isArray);
	                            lines.push(`${indent}-${isArray && !maxIndentReached ? '\n' : ' '}${entry}`);
	                        }
	                        else
	                            lines.push(`${indent}- ${element}`);
	                        skipIndentOnce = false;
	                    }
	                }
	                else {
	                    const object = obj;
	                    const keys = Object.keys(object);
	                    const maxKeyLen = keys.reduce((max, key) => Math.max(max, isIgnored(key, object) ? max : key.length), 0);
	                    for (const key of keys) {
	                        if (isIgnored(key, object))
	                            continue;
	                        const indent = skipIndentOnce ? '' : targetIndent;
	                        const raw = object[key];
	                        const paddedKey = key.padEnd(maxKeyLen, ' ');
	                        if (raw === null)
	                            lines.push(`${indent}${paddedKey}: null`);
	                        else if (raw === undefined)
	                            lines.push(`${indent}${paddedKey}: undefined`);
	                        else if (typeof raw === 'function')
	                            lines.push(`${indent}${paddedKey}: <function>`);
	                        else if (typeof raw === 'object') {
	                            const isArray = Array.isArray(raw);
	                            const isEmptyArray = isArray && raw.length === 0;
	                            const isEmptyObject = !isArray && !(raw instanceof String) && Object.keys(raw).length === 0;
	                            const hasToString = !isArray && typeof raw.toString === 'function' && raw.toString().indexOf('[object') !== 0;
	                            const entry = maxIndentReached
	                                ? '...'
	                                : isEmptyArray
	                                    ? '[]'
	                                    : isEmptyObject
	                                        ? '{}'
	                                        : stringify(raw, level + 1, hasToString);
	                            lines.push(`${indent}${paddedKey}:${maxIndentReached || hasToString || isEmptyArray || isEmptyObject ? ' ' : '\n'}${entry}`);
	                        }
	                        else
	                            lines.push(`${indent}${paddedKey}: ${raw}`);
	                        skipIndentOnce = false;
	                    }
	                }
	            }
	            return lines.join('\n');
	        };
	        return stringify(message.message);
	    }
	    /**
	     * Get a pre-formatted headers list.
	     *
	     * @param message - Log message which may contain an object with headers to be used for formatting.
	     *
	     * @returns String formatted for log entry in console or `undefined` if a log message not related to the network data.
	     */
	    formattedHeaders(message) {
	        if (!message.message.headers)
	            return undefined;
	        const headers = message.message.headers;
	        const maxHeaderLength = Object.keys(headers).reduce((max, key) => Math.max(max, key.length), 0);
	        return Object.keys(headers)
	            .map((key) => `    - ${key.toLowerCase().padEnd(maxHeaderLength, ' ')}: ${headers[key]}`)
	            .join('\n');
	    }
	    /**
	     * Get a pre-formatted body.
	     *
	     * @param message - Log message which may contain an object with `body` (request or response).
	     *
	     * @returns Object with formatted string of form data and / or body for log entry in console or `undefined` if a log
	     * message not related to the network data.
	     */
	    formattedBody(message) {
	        var _a;
	        if (!message.message.headers)
	            return undefined;
	        let stringifiedFormData;
	        let stringifiedBody;
	        const headers = message.message.headers;
	        const contentType = (_a = headers['content-type']) !== null && _a !== void 0 ? _a : headers['Content-Type'];
	        const formData = 'formData' in message.message ? message.message.formData : undefined;
	        const body = message.message.body;
	        // The presence of this object means that we are sending `multipart/form-data` (potentially uploading a file).
	        if (formData) {
	            const maxFieldLength = formData.reduce((max, { key }) => Math.max(max, key.length), 0);
	            stringifiedFormData = formData
	                .map(({ key, value }) => `    - ${key.padEnd(maxFieldLength, ' ')}: ${value}`)
	                .join('\n');
	        }
	        if (!body)
	            return { formData: stringifiedFormData };
	        if (typeof body === 'string') {
	            stringifiedBody = `    ${body}`;
	        }
	        else if (body instanceof ArrayBuffer || Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
	            if (contentType && (contentType.indexOf('javascript') !== -1 || contentType.indexOf('json') !== -1))
	                stringifiedBody = `    ${ConsoleLogger.decoder.decode(body)}`;
	            else
	                stringifiedBody = `    ArrayBuffer { byteLength: ${body.byteLength} }`;
	        }
	        else {
	            stringifiedBody = `    File { name: ${body.name}${body.contentLength ? `, contentLength: ${body.contentLength}` : ''}${body.mimeType ? `, mimeType: ${body.mimeType}` : ''} }`;
	        }
	        return { body: stringifiedBody, formData: stringifiedFormData };
	    }
	    /**
	     * Get a pre-formatted status object.
	     *
	     * @param message - Log message which may contain a {@link Status} object.
	     *
	     * @returns String formatted for log entry in console or `undefined` if a log message doesn't have {@link Status}
	     * object.
	     */
	    formattedErrorStatus(message) {
	        if (!message.message.status)
	            return undefined;
	        const status = message.message.status;
	        const errorData = status.errorData;
	        let stringifiedErrorData;
	        if (ConsoleLogger.isError(errorData)) {
	            stringifiedErrorData = `    ${errorData.name}: ${errorData.message}`;
	            if (errorData.stack) {
	                stringifiedErrorData += `\n${errorData.stack
                    .split('\n')
                    .map((line) => `      ${line}`)
                    .join('\n')}`;
	            }
	        }
	        else if (errorData) {
	            try {
	                stringifiedErrorData = `    ${JSON.stringify(errorData)}`;
	            }
	            catch (_) {
	                stringifiedErrorData = `    ${errorData}`;
	            }
	        }
	        return `  Category  : ${status.category}\n  Operation : ${status.operation}\n  Status    : ${status.statusCode}${stringifiedErrorData ? `\n  Error data:\n${stringifiedErrorData}` : ''}`;
	    }
	    /**
	     * Append the required amount of space to provide proper padding.
	     *
	     * @param str - Source string which should be appended with necessary number of spaces.
	     * @param maxLength - Maximum length of the string to which source string should be padded.
	     * @returns End-padded string.
	     */
	    paddedString(str, maxLength) {
	        return str.padEnd(maxLength - str.length, ' ');
	    }
	    /**
	     * Check whether passed object is {@link Error} instance.
	     *
	     * @param errorData - Object which should be checked.
	     *
	     * @returns `true` in case if an object actually {@link Error}.
	     */
	    static isError(errorData) {
	        if (!errorData)
	            return false;
	        return errorData instanceof Error || Object.prototype.toString.call(errorData) === '[object Error]';
	    }
	}
	/**
	 * Binary data decoder.
	 */
	ConsoleLogger.decoder = new TextDecoder();

	// --------------------------------------------------------
	// ------------------------ Types -------------------------
	// --------------------------------------------------------
	// region Types
	/**
	 * List of known endpoint groups (by context).
	 */
	var Endpoint;
	(function (Endpoint) {
	    /**
	     * Unknown endpoint.
	     *
	     * @internal
	     */
	    Endpoint["Unknown"] = "UnknownEndpoint";
	    /**
	     * The endpoints to send messages.
	     *
	     * This is related to the following functionality:
	     * - `publish`
	     * - `signal`
	     * - `publish file`
	     * - `fire`
	     */
	    Endpoint["MessageSend"] = "MessageSendEndpoint";
	    /**
	     * The endpoint for real-time update retrieval.
	     *
	     * This is related to the following functionality:
	     * - `subscribe`
	     */
	    Endpoint["Subscribe"] = "SubscribeEndpoint";
	    /**
	     * The endpoint to access and manage `user_id` presence and fetch channel presence information.
	     *
	     * This is related to the following functionality:
	     * - `get presence state`
	     * - `set presence state`
	     * - `here now`
	     * - `where now`
	     * - `heartbeat`
	     */
	    Endpoint["Presence"] = "PresenceEndpoint";
	    /**
	     * The endpoint to access and manage files in channel-specific storage.
	     *
	     * This is related to the following functionality:
	     * - `send file`
	     * - `download file`
	     * - `list files`
	     * - `delete file`
	     */
	    Endpoint["Files"] = "FilesEndpoint";
	    /**
	     * The endpoint to access and manage messages for a specific channel(s) in the persistent storage.
	     *
	     * This is related to the following functionality:
	     * - `fetch messages / message actions`
	     * - `delete messages`
	     * - `messages count`
	     */
	    Endpoint["MessageStorage"] = "MessageStorageEndpoint";
	    /**
	     * The endpoint to access and manage channel groups.
	     *
	     * This is related to the following functionality:
	     * - `add channels to group`
	     * - `list channels in group`
	     * - `remove channels from group`
	     * - `list channel groups`
	     */
	    Endpoint["ChannelGroups"] = "ChannelGroupsEndpoint";
	    /**
	     * The endpoint to access and manage device registration for channel push notifications.
	     *
	     * This is related to the following functionality:
	     * - `enable channels for push notifications`
	     * - `list push notification enabled channels`
	     * - `disable push notifications for channels`
	     * - `disable push notifications for all channels`
	     */
	    Endpoint["DevicePushNotifications"] = "DevicePushNotificationsEndpoint";
	    /**
	     * The endpoint to access and manage App Context objects.
	     *
	     * This is related to the following functionality:
	     * - `set UUID metadata`
	     * - `get UUID metadata`
	     * - `remove UUID metadata`
	     * - `get all UUID metadata`
	     * - `set Channel metadata`
	     * - `get Channel metadata`
	     * - `remove Channel metadata`
	     * - `get all Channel metadata`
	     * - `manage members`
	     * - `list members`
	     * - `manage memberships`
	     * - `list memberships`
	     */
	    Endpoint["AppContext"] = "AppContextEndpoint";
	    /**
	     * The endpoint to access and manage reactions for a specific message.
	     *
	     * This is related to the following functionality:
	     * - `add message action`
	     * - `get message actions`
	     * - `remove message action`
	     */
	    Endpoint["MessageReactions"] = "MessageReactionsEndpoint";
	})(Endpoint || (Endpoint = {}));
	// endregion
	/**
	 * Failed request retry policy.
	 */
	class RetryPolicy {
	    static None() {
	        return {
	            shouldRetry(_request, _response, _errorCategory, _attempt) {
	                return false;
	            },
	            getDelay(_attempt, _response) {
	                return -1;
	            },
	            validate() {
	                return true;
	            },
	        };
	    }
	    static LinearRetryPolicy(configuration) {
	        var _a;
	        return {
	            delay: configuration.delay,
	            maximumRetry: configuration.maximumRetry,
	            excluded: (_a = configuration.excluded) !== null && _a !== void 0 ? _a : [],
	            shouldRetry(request, response, error, attempt) {
	                return isRetriableRequest(request, response, error, attempt !== null && attempt !== void 0 ? attempt : 0, this.maximumRetry, this.excluded);
	            },
	            getDelay(_, response) {
	                let delay = -1;
	                if (response && response.headers['retry-after'] !== undefined)
	                    delay = parseInt(response.headers['retry-after'], 10);
	                if (delay === -1)
	                    delay = this.delay;
	                return (delay + Math.random()) * 1000;
	            },
	            validate() {
	                if (this.delay < 2)
	                    throw new Error('Delay can not be set less than 2 seconds for retry');
	                if (this.maximumRetry > 10)
	                    throw new Error('Maximum retry for linear retry policy can not be more than 10');
	            },
	        };
	    }
	    static ExponentialRetryPolicy(configuration) {
	        var _a;
	        return {
	            minimumDelay: configuration.minimumDelay,
	            maximumDelay: configuration.maximumDelay,
	            maximumRetry: configuration.maximumRetry,
	            excluded: (_a = configuration.excluded) !== null && _a !== void 0 ? _a : [],
	            shouldRetry(request, response, error, attempt) {
	                return isRetriableRequest(request, response, error, attempt !== null && attempt !== void 0 ? attempt : 0, this.maximumRetry, this.excluded);
	            },
	            getDelay(attempt, response) {
	                let delay = -1;
	                if (response && response.headers['retry-after'] !== undefined)
	                    delay = parseInt(response.headers['retry-after'], 10);
	                if (delay === -1)
	                    delay = Math.min(Math.pow(2, attempt), this.maximumDelay);
	                return (delay + Math.random()) * 1000;
	            },
	            validate() {
	                if (this.minimumDelay < 2)
	                    throw new Error('Minimum delay can not be set less than 2 seconds for retry');
	                else if (this.maximumDelay > 150)
	                    throw new Error('Maximum delay can not be set more than 150 seconds for' + ' retry');
	                else if (this.maximumRetry > 6)
	                    throw new Error('Maximum retry for exponential retry policy can not be more than 6');
	            },
	        };
	    }
	}
	/**
	 * Check whether request can be retried or not.
	 *
	 * @param req - Request for which retry ability is checked.
	 * @param res - Service response which should be taken into consideration.
	 * @param errorCategory - Request processing error category.
	 * @param retryAttempt - Current retry attempt.
	 * @param maximumRetry - Maximum retry attempts count according to the retry policy.
	 * @param excluded - List of endpoints for which retry policy won't be applied.
	 *
	 * @return `true` if request can be retried.
	 *
	 * @internal
	 */
	const isRetriableRequest = (req, res, errorCategory, retryAttempt, maximumRetry, excluded) => {
	    if (errorCategory) {
	        if (errorCategory === StatusCategory$1.PNCancelledCategory ||
	            errorCategory === StatusCategory$1.PNBadRequestCategory ||
	            errorCategory === StatusCategory$1.PNAccessDeniedCategory)
	            return false;
	    }
	    if (isExcludedRequest(req, excluded))
	        return false;
	    else if (retryAttempt > maximumRetry)
	        return false;
	    return res ? res.status === 429 || res.status >= 500 : true;
	};
	/**
	 * Check whether the provided request is in the list of endpoints for which retry is not allowed or not.
	 *
	 * @param req - Request which will be tested.
	 * @param excluded - List of excluded endpoints configured for retry policy.
	 *
	 * @returns `true` if request has been excluded and shouldn't be retried.
	 *
	 * @internal
	 */
	const isExcludedRequest = (req, excluded) => excluded && excluded.length > 0 ? excluded.includes(endpointFromRequest(req)) : false;
	/**
	 * Identify API group from transport request.
	 *
	 * @param req - Request for which `path` will be analyzed to identify REST API group.
	 *
	 * @returns Endpoint group to which request belongs.
	 *
	 * @internal
	 */
	const endpointFromRequest = (req) => {
	    let endpoint = Endpoint.Unknown;
	    if (req.path.startsWith('/v2/subscribe'))
	        endpoint = Endpoint.Subscribe;
	    else if (req.path.startsWith('/publish/') || req.path.startsWith('/signal/'))
	        endpoint = Endpoint.MessageSend;
	    else if (req.path.startsWith('/v2/presence'))
	        endpoint = Endpoint.Presence;
	    else if (req.path.startsWith('/v2/history') || req.path.startsWith('/v3/history'))
	        endpoint = Endpoint.MessageStorage;
	    else if (req.path.startsWith('/v1/message-actions/'))
	        endpoint = Endpoint.MessageReactions;
	    else if (req.path.startsWith('/v1/channel-registration/'))
	        endpoint = Endpoint.ChannelGroups;
	    else if (req.path.startsWith('/v2/objects/'))
	        endpoint = Endpoint.ChannelGroups;
	    else if (req.path.startsWith('/v1/push/') || req.path.startsWith('/v2/push/'))
	        endpoint = Endpoint.DevicePushNotifications;
	    else if (req.path.startsWith('/v1/files/'))
	        endpoint = Endpoint.Files;
	    return endpoint;
	};

	/**
	 * Logging module manager.
	 *
	 * Manager responsible for log requests handling and forwarding to the registered {@link Logger logger} implementations.
	 */
	class LoggerManager {
	    /**
	     * Create and configure loggers' manager.
	     *
	     * @param pubNubId - Unique identifier of PubNub instance which will use this logger.
	     * @param minLogLevel - Minimum messages log level to be logged.
	     * @param loggers - List of additional loggers which should be used along with user-provided custom loggers.
	     *
	     * @internal
	     */
	    constructor(pubNubId, minLogLevel, loggers) {
	        this.pubNubId = pubNubId;
	        this.minLogLevel = minLogLevel;
	        this.loggers = loggers;
	    }
	    /**
	     * Get current log level.
	     *
	     * @returns Current log level.
	     *
	     * @internal
	     */
	    get logLevel() {
	        return this.minLogLevel;
	    }
	    /**
	     * Process a `trace` level message.
	     *
	     * @param location - Call site from which a log message has been sent.
	     * @param messageFactory - Lazy message factory function or string for a text log message.
	     *
	     * @internal
	     */
	    trace(location, messageFactory) {
	        this.log(LogLevel.Trace, location, messageFactory);
	    }
	    /**
	     * Process a `debug` level message.
	     *
	     * @param location - Call site from which a log message has been sent.
	     * @param messageFactory - Lazy message factory function or string for a text log message.
	     *
	     * @internal
	     */
	    debug(location, messageFactory) {
	        this.log(LogLevel.Debug, location, messageFactory);
	    }
	    /**
	     * Process an `info` level message.
	     *
	     * @param location - Call site from which a log message has been sent.
	     * @param messageFactory - Lazy message factory function or string for a text log message.
	     *
	     * @internal
	     */
	    info(location, messageFactory) {
	        this.log(LogLevel.Info, location, messageFactory);
	    }
	    /**
	     * Process a `warn` level message.
	     *
	     * @param location - Call site from which a log message has been sent.
	     * @param messageFactory - Lazy message factory function or string for a text log message.
	     *
	     * @internal
	     */
	    warn(location, messageFactory) {
	        this.log(LogLevel.Warn, location, messageFactory);
	    }
	    /**
	     * Process an `error` level message.
	     *
	     * @param location - Call site from which a log message has been sent.
	     * @param messageFactory - Lazy message factory function or string for a text log message.
	     *
	     * @internal
	     */
	    error(location, messageFactory) {
	        this.log(LogLevel.Error, location, messageFactory);
	    }
	    /**
	     * Process log message.
	     *
	     * @param logLevel - Logged message level.
	     * @param location - Call site from which a log message has been sent.
	     * @param messageFactory - Lazy message factory function or string for a text log message.
	     *
	     * @internal
	     */
	    log(logLevel, location, messageFactory) {
	        // Check whether a log message should be handled at all or not.
	        if (logLevel < this.minLogLevel || this.loggers.length === 0)
	            return;
	        const level = LogLevel[logLevel].toLowerCase();
	        const message = Object.assign({ timestamp: new Date(), pubNubId: this.pubNubId, level: logLevel, minimumLevel: this.minLogLevel, location }, (typeof messageFactory === 'function' ? messageFactory() : { messageType: 'text', message: messageFactory }));
	        this.loggers.forEach((logger) => logger[level](message));
	    }
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
	    var _a, _b, _c, _d;
	    // Set the default retry policy for subscribing (if new subscribe logic not used).
	    if (!base.retryConfiguration && base.enableEventEngine) {
	        base.retryConfiguration = RetryPolicy.ExponentialRetryPolicy({
	            minimumDelay: 2,
	            maximumDelay: 150,
	            maximumRetry: 6,
	            excluded: [
	                Endpoint.MessageSend,
	                Endpoint.Presence,
	                Endpoint.Files,
	                Endpoint.MessageStorage,
	                Endpoint.ChannelGroups,
	                Endpoint.DevicePushNotifications,
	                Endpoint.AppContext,
	                Endpoint.MessageReactions,
	            ],
	        });
	    }
	    const instanceId = `pn-${uuidGenerator.createUUID()}`;
	    if (base.logVerbosity)
	        base.logLevel = LogLevel.Debug;
	    else if (base.logLevel === undefined)
	        base.logLevel = LogLevel.None;
	    // Prepare loggers manager.
	    const loggerManager = new LoggerManager(hashFromString(instanceId), base.logLevel, [
	        ...((_a = base.loggers) !== null && _a !== void 0 ? _a : []),
	        new ConsoleLogger(),
	    ]);
	    if (base.logVerbosity !== undefined)
	        loggerManager.warn('Configuration', "'logVerbosity' is deprecated. Use 'logLevel' instead.");
	    // Ensure that retry policy has proper configuration (if has been set).
	    (_b = base.retryConfiguration) === null || _b === void 0 ? void 0 : _b.validate();
	    (_c = base.useRandomIVs) !== null && _c !== void 0 ? _c : (base.useRandomIVs = USE_RANDOM_INITIALIZATION_VECTOR);
	    if (base.useRandomIVs)
	        loggerManager.warn('Configuration', "'useRandomIVs' is deprecated. Use 'cryptoModule' instead.");
	    // Override origin value.
	    base.origin = standardOrigin((_d = base.ssl) !== null && _d !== void 0 ? _d : false, base.origin);
	    const cryptoModule = base.cryptoModule;
	    if (cryptoModule)
	        delete base.cryptoModule;
	    const clientConfiguration = Object.assign(Object.assign({}, base), { _pnsdkSuffix: {}, _loggerManager: loggerManager, _instanceId: instanceId, _cryptoModule: undefined, _cipherKey: undefined, _setupCryptoModule: setupCryptoModule, get instanceId() {
	            if (base.useInstanceId)
	                return this._instanceId;
	            return undefined;
	        },
	        getInstanceId() {
	            if (base.useInstanceId)
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
	        logger() {
	            return this._loggerManager;
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
	                logger: this.logger(),
	            });
	        },
	        getCryptoModule() {
	            return this._cryptoModule;
	        },
	        getUseRandomIVs() {
	            return base.useRandomIVs;
	        },
	        getKeepPresenceChannelsInPresenceRequests() {
	            // @ts-expect-error: Access field from web-based SDK configuration.
	            return base.sdkFamily === 'Web' && base['subscriptionWorkerUrl'];
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
	        getFileTimeout() {
	            return this.fileRequestTimeout;
	        },
	        get PubNubFile() {
	            return base.PubNubFile;
	        },
	        get version() {
	            return '9.7.0';
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
	    if (base.cipherKey) {
	        loggerManager.warn('Configuration', "'cipherKey' is deprecated. Use 'cryptoModule' instead.");
	        clientConfiguration.setCipherKey(base.cipherKey);
	    }
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
	 * Compute 32bit hash string from source value.
	 *
	 * @param value - String from which hash string should be computed.
	 *
	 * @returns Computed hash.
	 */
	const hashFromString = (value) => {
	    let basis = 0x811c9dc5;
	    for (let i = 0; i < value.length; i++) {
	        basis ^= value.charCodeAt(i);
	        basis = (basis + ((basis << 1) + (basis << 4) + (basis << 7) + (basis << 8) + (basis << 24))) >>> 0;
	    }
	    return basis.toString(16).padStart(8, '0');
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
	    constructor(publishKey, secretKey, hasher, logger) {
	        this.publishKey = publishKey;
	        this.secretKey = secretKey;
	        this.hasher = hasher;
	        this.logger = logger;
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
	        this.logger.trace('RequestSignature', () => ({
	            messageType: 'text',
	            message: `Request signature input:\n${signatureInput}`,
	        }));
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
	                this.signatureGenerator = new RequestSignature(keySet.publishKey, keySet.secretKey, shaHMAC, this.logger);
	        }
	    }
	    /**
	     * Retrieve registered loggers' manager.
	     *
	     * @returns Registered loggers' manager.
	     */
	    get logger() {
	        return this.configuration.clientConfiguration.logger();
	    }
	    makeSendable(req) {
	        const retryPolicy = this.configuration.clientConfiguration.retryConfiguration;
	        const transport = this.configuration.transport;
	        // Make requests retryable.
	        if (retryPolicy !== undefined) {
	            let retryTimeout;
	            let activeCancellation;
	            let canceled = false;
	            let attempt = 0;
	            const cancellation = {
	                abort: (reason) => {
	                    canceled = true;
	                    if (retryTimeout)
	                        clearTimeout(retryTimeout);
	                    if (activeCancellation)
	                        activeCancellation.abort(reason);
	                },
	            };
	            const retryableRequest = new Promise((resolve, reject) => {
	                const trySendRequest = () => {
	                    // Check whether the request already has been canceled and there is no retry should proceed.
	                    if (canceled)
	                        return;
	                    const [attemptPromise, attemptCancellation] = transport.makeSendable(this.request(req));
	                    activeCancellation = attemptCancellation;
	                    const responseHandler = (res, error) => {
	                        const retriableError = error ? error.category !== StatusCategory$1.PNCancelledCategory : true;
	                        const retriableStatusCode = !res || res.status >= 400;
	                        let delay = -1;
	                        if (retriableError &&
	                            retriableStatusCode &&
	                            retryPolicy.shouldRetry(req, res, error === null || error === void 0 ? void 0 : error.category, attempt + 1))
	                            delay = retryPolicy.getDelay(attempt, res);
	                        if (delay > 0) {
	                            attempt++;
	                            this.logger.warn('PubNubMiddleware', `HTTP request retry #${attempt} in ${delay}ms.`);
	                            retryTimeout = setTimeout(() => trySendRequest(), delay);
	                        }
	                        else {
	                            if (res)
	                                resolve(res);
	                            else if (error)
	                                reject(error);
	                        }
	                    };
	                    attemptPromise
	                        .then((res) => responseHandler(res))
	                        .catch((err) => responseHandler(undefined, err));
	                };
	                trySendRequest();
	            });
	            return [retryableRequest, activeCancellation ? cancellation : undefined];
	        }
	        return transport.makeSendable(this.request(req));
	    }
	    request(req) {
	        var _a;
	        const { clientConfiguration } = this.configuration;
	        // Get request patched by transport provider.
	        req = this.configuration.transport.request(req);
	        if (!req.queryParameters)
	            req.queryParameters = {};
	        // Modify the request with required information.
	        if (clientConfiguration.useInstanceId)
	            req.queryParameters['instanceid'] = clientConfiguration.getInstanceId();
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
	        // Access management endpoints don't need authentication (signature required instead).
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
	 * Common browser and React Native Transport provider module.
	 *
	 * @internal
	 */
	/**
	 * Class representing a `fetch`-based browser and React Native transport provider.
	 *
	 * @internal
	 */
	class WebTransport {
	    /**
	     * Create and configure transport provider for Web and Rect environments.
	     *
	     * @param logger - Registered loggers' manager.
	     * @param [transport] - API, which should be used to make network requests.
	     *
	     * @internal
	     */
	    constructor(logger, transport = 'fetch') {
	        this.logger = logger;
	        this.transport = transport;
	        logger.debug('WebTransport', `Create with configuration:\n  - transport: ${transport}`);
	        if (transport === 'fetch' && (!window || !window.fetch)) {
	            logger.warn('WebTransport', `'${transport}' not supported in this browser. Fallback to the 'xhr' transport.`);
	            this.transport = 'xhr';
	        }
	        if (this.transport !== 'fetch')
	            return;
	        // Keeping reference on current `window.fetch` function.
	        WebTransport.originalFetch = fetch.bind(window);
	        // Check whether `fetch` has been monkey patched or not.
	        if (this.isFetchMonkeyPatched()) {
	            WebTransport.originalFetch = WebTransport.getOriginalFetch();
	            logger.warn('WebTransport', "Native Web Fetch API 'fetch' function monkey patched.");
	            if (!this.isFetchMonkeyPatched(WebTransport.originalFetch)) {
	                logger.info('WebTransport', "Use native Web Fetch API 'fetch' implementation from iframe as APM workaround.");
	            }
	            else {
	                logger.warn('WebTransport', 'Unable receive native Web Fetch API. There can be issues with subscribe long-poll  cancellation');
	            }
	        }
	    }
	    makeSendable(req) {
	        const abortController = new AbortController();
	        const cancellation = {
	            abortController,
	            abort: (reason) => {
	                if (!abortController.signal.aborted) {
	                    this.logger.trace('WebTransport', `On-demand request aborting: ${reason}`);
	                    abortController.abort(reason);
	                }
	            },
	        };
	        return [
	            this.webTransportRequestFromTransportRequest(req).then((request) => {
	                this.logger.debug('WebTransport', () => ({ messageType: 'network-request', message: req }));
	                return this.sendRequest(request, cancellation)
	                    .then((response) => response.arrayBuffer().then((arrayBuffer) => [response, arrayBuffer]))
	                    .then((response) => {
	                    const body = response[1].byteLength > 0 ? response[1] : undefined;
	                    const { status, headers: requestHeaders } = response[0];
	                    const headers = {};
	                    // Copy Headers object content into plain Record.
	                    requestHeaders.forEach((value, key) => (headers[key] = value.toLowerCase()));
	                    const transportResponse = { status, url: request.url, headers, body };
	                    this.logger.debug('WebTransport', () => ({
	                        messageType: 'network-response',
	                        message: transportResponse,
	                    }));
	                    if (status >= 400)
	                        throw PubNubAPIError.create(transportResponse);
	                    return transportResponse;
	                })
	                    .catch((error) => {
	                    const errorMessage = (typeof error === 'string' ? error : error.message).toLowerCase();
	                    let fetchError = typeof error === 'string' ? new Error(error) : error;
	                    if (errorMessage.includes('timeout')) {
	                        this.logger.warn('WebTransport', () => ({
	                            messageType: 'network-request',
	                            message: req,
	                            details: 'Timeout',
	                            canceled: true,
	                        }));
	                    }
	                    else if (errorMessage.includes('cancel') || errorMessage.includes('abort')) {
	                        this.logger.debug('WebTransport', () => ({
	                            messageType: 'network-request',
	                            message: req,
	                            details: 'Aborted',
	                            canceled: true,
	                        }));
	                        fetchError = new Error('Aborted');
	                        fetchError.name = 'AbortError';
	                    }
	                    else if (errorMessage.includes('network')) {
	                        this.logger.warn('WebTransport', () => ({
	                            messageType: 'network-request',
	                            message: req,
	                            details: 'Network error',
	                            failed: true,
	                        }));
	                    }
	                    else {
	                        this.logger.warn('WebTransport', () => ({
	                            messageType: 'network-request',
	                            message: req,
	                            details: PubNubAPIError.create(fetchError).message,
	                            failed: true,
	                        }));
	                    }
	                    throw PubNubAPIError.create(fetchError);
	                });
	            }),
	            cancellation,
	        ];
	    }
	    request(req) {
	        return req;
	    }
	    /**
	     * Send network request using preferred API.
	     *
	     * @param req - Transport API agnostic request object with prepared body and URL.
	     * @param controller - Request cancellation controller (for long-poll requests).
	     *
	     * @returns Promise which will be resolved or rejected at the end of network request processing.
	     *
	     * @internal
	     */
	    sendRequest(req, controller) {
	        return __awaiter(this, void 0, void 0, function* () {
	            if (this.transport === 'fetch')
	                return this.sendFetchRequest(req, controller);
	            return this.sendXHRRequest(req, controller);
	        });
	    }
	    /**
	     * Send network request using legacy XMLHttpRequest API.
	     *
	     * @param req - Transport API agnostic request object with prepared body and URL.
	     * @param controller - Request cancellation controller (for long-poll requests).
	     *
	     * @returns Promise which will be resolved or rejected at the end of network request processing.
	     *
	     * @internal
	     */
	    sendFetchRequest(req, controller) {
	        return __awaiter(this, void 0, void 0, function* () {
	            let timeoutId;
	            const requestTimeout = new Promise((_, reject) => {
	                timeoutId = setTimeout(() => {
	                    clearTimeout(timeoutId);
	                    reject(new Error('Request timeout'));
	                    controller.abort('Cancel because of timeout');
	                }, req.timeout * 1000);
	            });
	            const request = new Request(req.url, {
	                method: req.method,
	                headers: req.headers,
	                redirect: 'follow',
	                body: req.body,
	            });
	            return Promise.race([
	                WebTransport.originalFetch(request, {
	                    signal: controller.abortController.signal,
	                    credentials: 'omit',
	                    cache: 'no-cache',
	                }).then((response) => {
	                    if (timeoutId)
	                        clearTimeout(timeoutId);
	                    return response;
	                }),
	                requestTimeout,
	            ]);
	        });
	    }
	    /**
	     * Send network request using legacy XMLHttpRequest API.
	     *
	     * @param req - Transport API agnostic request object with prepared body and URL.
	     * @param controller - Request cancellation controller (for long-poll requests).
	     *
	     * @returns Promise which will be resolved or rejected at the end of network request processing.
	     *
	     * @internal
	     */
	    sendXHRRequest(req, controller) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return new Promise((resolve, reject) => {
	                var _a;
	                const xhr = new XMLHttpRequest();
	                xhr.open(req.method, req.url, true);
	                let aborted = false;
	                // Setup request
	                xhr.responseType = 'arraybuffer';
	                xhr.timeout = req.timeout * 1000;
	                controller.abortController.signal.onabort = () => {
	                    if (xhr.readyState == XMLHttpRequest.DONE || xhr.readyState == XMLHttpRequest.UNSENT)
	                        return;
	                    aborted = true;
	                    xhr.abort();
	                };
	                Object.entries((_a = req.headers) !== null && _a !== void 0 ? _a : {}).forEach(([key, value]) => xhr.setRequestHeader(key, value));
	                // Setup handlers to match `fetch` results handling.
	                xhr.onabort = () => {
	                    reject(new Error('Aborted'));
	                };
	                xhr.ontimeout = () => {
	                    reject(new Error('Request timeout'));
	                };
	                xhr.onerror = () => {
	                    if (!aborted) {
	                        const response = this.transportResponseFromXHR(req.url, xhr);
	                        reject(new Error(PubNubAPIError.create(response).message));
	                    }
	                };
	                xhr.onload = () => {
	                    const headers = new Headers();
	                    xhr
	                        .getAllResponseHeaders()
	                        .split('\r\n')
	                        .forEach((header) => {
	                        const [key, value] = header.split(': ');
	                        if (key.length > 1 && value.length > 1)
	                            headers.append(key, value);
	                    });
	                    resolve(new Response(xhr.response, { status: xhr.status, headers, statusText: xhr.statusText }));
	                };
	                xhr.send(req.body);
	            });
	        });
	    }
	    /**
	     * Creates a Web Request object from a given {@link TransportRequest} object.
	     *
	     * @param req - The {@link TransportRequest} object containing request information.
	     *
	     * @returns Request object generated from the {@link TransportRequest} object.
	     *
	     * @internal
	     */
	    webTransportRequestFromTransportRequest(req) {
	        return __awaiter(this, void 0, void 0, function* () {
	            let body;
	            let path = req.path;
	            // Create a multipart request body.
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
	                catch (toBufferError) {
	                    this.logger.warn('WebTransport', () => ({ messageType: 'error', message: toBufferError }));
	                    try {
	                        const fileData = yield file.toFileUri();
	                        // @ts-expect-error React Native File Uri support.
	                        formData.append('file', fileData, file.name);
	                    }
	                    catch (toFileURLError) {
	                        this.logger.error('WebTransport', () => ({ messageType: 'error', message: toFileURLError }));
	                    }
	                }
	                body = formData;
	            }
	            // Handle regular body payload (if passed).
	            else if (req.body && (typeof req.body === 'string' || req.body instanceof ArrayBuffer)) {
	                // Compressing body if the browser has native support.
	                if (req.compressible && typeof CompressionStream !== 'undefined') {
	                    const bodyArrayBuffer = typeof req.body === 'string' ? WebTransport.encoder.encode(req.body) : req.body;
	                    const initialBodySize = bodyArrayBuffer.byteLength;
	                    const bodyStream = new ReadableStream({
	                        start(controller) {
	                            controller.enqueue(bodyArrayBuffer);
	                            controller.close();
	                        },
	                    });
	                    body = yield new Response(bodyStream.pipeThrough(new CompressionStream('deflate'))).arrayBuffer();
	                    this.logger.trace('WebTransport', () => {
	                        const compressedSize = body.byteLength;
	                        const ratio = (compressedSize / initialBodySize).toFixed(2);
	                        return {
	                            messageType: 'text',
	                            message: `Body of ${initialBodySize} bytes, compressed by ${ratio}x to ${compressedSize} bytes.`,
	                        };
	                    });
	                }
	                else
	                    body = req.body;
	            }
	            if (req.queryParameters && Object.keys(req.queryParameters).length !== 0)
	                path = `${path}?${queryStringFromObject(req.queryParameters)}`;
	            return {
	                url: `${req.origin}${path}`,
	                method: req.method,
	                headers: req.headers,
	                timeout: req.timeout,
	                body,
	            };
	        });
	    }
	    /**
	     * Check whether the original ` fetch ` has been monkey patched or not.
	     *
	     * @returns `true` if original `fetch` has been patched.
	     */
	    isFetchMonkeyPatched(oFetch) {
	        const fetchString = (oFetch !== null && oFetch !== void 0 ? oFetch : fetch).toString();
	        return !fetchString.includes('[native code]') && fetch.name !== 'fetch';
	    }
	    /**
	     * Create service response from {@link XMLHttpRequest} processing result.
	     *
	     * @param url - Used endpoint url.
	     * @param xhr - `HTTPClient`, which has been used to make a request.
	     *
	     * @returns  Pre-processed transport response.
	     */
	    transportResponseFromXHR(url, xhr) {
	        const allHeaders = xhr.getAllResponseHeaders().split('\n');
	        const headers = {};
	        for (const header of allHeaders) {
	            const [key, value] = header.trim().split(':');
	            if (key && value)
	                headers[key.toLowerCase()] = value.trim();
	        }
	        return { status: xhr.status, url, headers, body: xhr.response };
	    }
	    /**
	     * Retrieve the original ` fetch ` implementation.
	     *
	     * Retrieve implementation which hasn't been patched by APM tools.
	     *
	     * @returns Reference to the `fetch` function.
	     */
	    static getOriginalFetch() {
	        let iframe = document.querySelector('iframe[name="pubnub-context-unpatched-fetch"]');
	        if (!iframe) {
	            iframe = document.createElement('iframe');
	            iframe.style.display = 'none';
	            iframe.name = 'pubnub-context-unpatched-fetch';
	            iframe.src = 'about:blank';
	            document.body.appendChild(iframe);
	        }
	        if (iframe.contentWindow)
	            return iframe.contentWindow.fetch.bind(iframe.contentWindow);
	        return fetch;
	    }
	}
	/**
	 * Request body decoder.
	 *
	 * @internal
	 */
	WebTransport.encoder = new TextEncoder();
	/**
	 * Service {@link ArrayBuffer} response decoder.
	 *
	 * @internal
	 */
	WebTransport.decoder = new TextDecoder();

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
	     *
	     * @param [reason] Information about why request has been cancelled.
	     */
	    abort(reason) {
	        if (this && this.cancellationController)
	            this.cancellationController.abort(reason);
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
	     * @param response - Raw service response which should be parsed.
	     */
	    parse(response) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return this.deserializeResponse(response);
	        });
	    }
	    /**
	     * Create platform-agnostic request object.
	     *
	     * @returns Request object which can be processed using platform-specific requirements.
	     */
	    request() {
	        var _a, _b, _c, _d, _e, _f;
	        const request = {
	            method: (_b = (_a = this.params) === null || _a === void 0 ? void 0 : _a.method) !== null && _b !== void 0 ? _b : TransportMethod.GET,
	            path: this.path,
	            queryParameters: this.queryParameters,
	            cancellable: (_d = (_c = this.params) === null || _c === void 0 ? void 0 : _c.cancellable) !== null && _d !== void 0 ? _d : false,
	            compressible: (_f = (_e = this.params) === null || _e === void 0 ? void 0 : _e.compressible) !== null && _f !== void 0 ? _f : false,
	            timeout: 10,
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
	        var _a, _b;
	        return Object.assign({ 'Accept-Encoding': 'gzip, deflate' }, (((_b = (_a = this.params) === null || _a === void 0 ? void 0 : _a.compressible) !== null && _b !== void 0 ? _b : false) ? { 'Content-Encoding': 'deflate' } : {}));
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
	     * @returns Deserialized service response data.
	     *
	     * @throws {Error} if received service response can't be processed (has unexpected content-type or can't be parsed as
	     * JSON).
	     */
	    deserializeResponse(response) {
	        const responseText = AbstractRequest.decoder.decode(response.body);
	        const contentType = response.headers['content-type'];
	        let parsedJson;
	        if (!contentType || (contentType.indexOf('javascript') === -1 && contentType.indexOf('json') === -1))
	            throw new PubNubError('Service response error, check status for details', createMalformedResponseError(responseText, response.status));
	        try {
	            parsedJson = JSON.parse(responseText);
	        }
	        catch (error) {
	            console.error('Error parsing JSON response:', error);
	            throw new PubNubError('Service response error, check status for details', createMalformedResponseError(responseText, response.status));
	        }
	        // Throw and exception in case of client / server error.
	        if ('status' in parsedJson && typeof parsedJson.status === 'number' && parsedJson.status >= 400)
	            throw PubNubAPIError.create(response);
	        return parsedJson;
	    }
	}
	/**
	 * Service `ArrayBuffer` response decoder.
	 */
	AbstractRequest.decoder = new TextDecoder();

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
	            let responseText;
	            try {
	                responseText = AbstractRequest.decoder.decode(response.body);
	                const parsedJson = JSON.parse(responseText);
	                serviceResponse = parsedJson;
	            }
	            catch (error) {
	                console.error('Error parsing JSON response:', error);
	            }
	            if (!serviceResponse) {
	                throw new PubNubError('Service response error, check status for details', createMalformedResponseError(responseText, response.status));
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
	        var _a;
	        return Object.assign(Object.assign({}, ((_a = super.headers) !== null && _a !== void 0 ? _a : {})), { accept: 'text/javascript' });
	    }
	    // --------------------------------------------------------
	    // ------------------ Envelope parsing --------------------
	    // --------------------------------------------------------
	    // region Envelope parsing
	    presenceEventFromEnvelope(envelope) {
	        var _a;
	        const { d: payload } = envelope;
	        const [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);
	        // Clean up channel and subscription name from presence suffix.
	        const trimmedChannel = channel.replace('-pnpres', '');
	        // Backward compatibility with deprecated properties.
	        const actualChannel = subscription !== null ? trimmedChannel : null;
	        const subscribedChannel = subscription !== null ? subscription : trimmedChannel;
	        if (typeof payload !== 'string') {
	            if ('data' in payload) {
	                // @ts-expect-error This is `state-change` object which should have `state` field.
	                payload['state'] = payload.data;
	                delete payload.data;
	            }
	            else if ('action' in payload && payload.action === 'interval') {
	                payload.hereNowRefresh = (_a = payload.here_now_refresh) !== null && _a !== void 0 ? _a : false;
	                delete payload.here_now_refresh;
	            }
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
	 * Events dispatcher module.
	 */
	/**
	 * Real-time events dispatcher.
	 *
	 * Class responsible for listener management and invocation.
	 *
	 * @internal
	 */
	class EventDispatcher {
	    constructor() {
	        /**
	         * Whether listeners has been added or not.
	         */
	        this.hasListeners = false;
	        /**
	         * List of registered event handlers.
	         *
	         * **Note:** the First element is reserved for type-based event handlers.
	         */
	        this.listeners = [{ count: -1, listener: {} }];
	    }
	    /**
	     * Set a connection status change event handler.
	     *
	     * @param listener - Listener function, which will be called each time when the connection status changes.
	     */
	    set onStatus(listener) {
	        this.updateTypeOrObjectListener({ add: !!listener, listener, type: 'status' });
	    }
	    /**
	     * Set a new message handler.
	     *
	     * @param listener - Listener function, which will be called each time when a new message
	     * is received from the real-time network.
	     */
	    set onMessage(listener) {
	        this.updateTypeOrObjectListener({ add: !!listener, listener, type: 'message' });
	    }
	    /**
	     * Set a new presence events handler.
	     *
	     * @param listener - Listener function, which will be called each time when a new
	     * presence event is received from the real-time network.
	     */
	    set onPresence(listener) {
	        this.updateTypeOrObjectListener({ add: !!listener, listener, type: 'presence' });
	    }
	    /**
	     * Set a new signal handler.
	     *
	     * @param listener - Listener function, which will be called each time when a new signal
	     * is received from the real-time network.
	     */
	    set onSignal(listener) {
	        this.updateTypeOrObjectListener({ add: !!listener, listener, type: 'signal' });
	    }
	    /**
	     * Set a new app context event handler.
	     *
	     * @param listener - Listener function, which will be called each time when a new
	     * app context event is received from the real-time network.
	     */
	    set onObjects(listener) {
	        this.updateTypeOrObjectListener({ add: !!listener, listener, type: 'objects' });
	    }
	    /**
	     * Set a new message reaction event handler.
	     *
	     * @param listener - Listener function, which will be called each time when a
	     * new message reaction event is received from the real-time network.
	     */
	    set onMessageAction(listener) {
	        this.updateTypeOrObjectListener({ add: !!listener, listener, type: 'messageAction' });
	    }
	    /**
	     * Set a new file handler.
	     *
	     * @param listener - Listener function, which will be called each time when a new file
	     * is received from the real-time network.
	     */
	    set onFile(listener) {
	        this.updateTypeOrObjectListener({ add: !!listener, listener, type: 'file' });
	    }
	    /**
	     * Dispatch received a real-time update.
	     *
	     * @param event - A real-time event from multiplexed subscription.
	     */
	    handleEvent(event) {
	        if (!this.hasListeners)
	            return;
	        if (event.type === PubNubEventType.Message)
	            this.announce('message', event.data);
	        else if (event.type === PubNubEventType.Signal)
	            this.announce('signal', event.data);
	        else if (event.type === PubNubEventType.Presence)
	            this.announce('presence', event.data);
	        else if (event.type === PubNubEventType.AppContext) {
	            const { data: objectEvent } = event;
	            const { message: object } = objectEvent;
	            this.announce('objects', objectEvent);
	            if (object.type === 'uuid') {
	                const { message, channel } = objectEvent, restEvent = __rest(objectEvent, ["message", "channel"]);
	                const { event, type } = object, restObject = __rest(object, ["event", "type"]);
	                const userEvent = Object.assign(Object.assign({}, restEvent), { spaceId: channel, message: Object.assign(Object.assign({}, restObject), { event: event === 'set' ? 'updated' : 'removed', type: 'user' }) });
	                this.announce('user', userEvent);
	            }
	            else if (object.type === 'channel') {
	                const { message, channel } = objectEvent, restEvent = __rest(objectEvent, ["message", "channel"]);
	                const { event, type } = object, restObject = __rest(object, ["event", "type"]);
	                const spaceEvent = Object.assign(Object.assign({}, restEvent), { spaceId: channel, message: Object.assign(Object.assign({}, restObject), { event: event === 'set' ? 'updated' : 'removed', type: 'space' }) });
	                this.announce('space', spaceEvent);
	            }
	            else if (object.type === 'membership') {
	                const { message, channel } = objectEvent, restEvent = __rest(objectEvent, ["message", "channel"]);
	                const { event, data } = object, restObject = __rest(object, ["event", "data"]);
	                const { uuid, channel: channelMeta } = data, restData = __rest(data, ["uuid", "channel"]);
	                const membershipEvent = Object.assign(Object.assign({}, restEvent), { spaceId: channel, message: Object.assign(Object.assign({}, restObject), { event: event === 'set' ? 'updated' : 'removed', data: Object.assign(Object.assign({}, restData), { user: uuid, space: channelMeta }) }) });
	                this.announce('membership', membershipEvent);
	            }
	        }
	        else if (event.type === PubNubEventType.MessageAction)
	            this.announce('messageAction', event.data);
	        else if (event.type === PubNubEventType.Files)
	            this.announce('file', event.data);
	    }
	    /**
	     * Dispatch received connection status change.
	     *
	     * @param status - Status object which should be emitter for all status listeners.
	     */
	    handleStatus(status) {
	        if (!this.hasListeners)
	            return;
	        this.announce('status', status);
	    }
	    /**
	     * Add events handler.
	     *
	     * @param listener - Events listener configuration object, which lets specify handlers for multiple types of events.
	     */
	    addListener(listener) {
	        this.updateTypeOrObjectListener({ add: true, listener });
	    }
	    removeListener(listener) {
	        this.updateTypeOrObjectListener({ add: false, listener });
	    }
	    removeAllListeners() {
	        this.listeners = [{ count: -1, listener: {} }];
	        this.hasListeners = false;
	    }
	    updateTypeOrObjectListener(parameters) {
	        if (parameters.type) {
	            if (typeof parameters.listener === 'function')
	                this.listeners[0].listener[parameters.type] = parameters.listener;
	            else
	                delete this.listeners[0].listener[parameters.type];
	        }
	        else if (parameters.listener && typeof parameters.listener !== 'function') {
	            let listenerObject;
	            let listenerExists = false;
	            for (listenerObject of this.listeners) {
	                if (listenerObject.listener === parameters.listener) {
	                    if (parameters.add) {
	                        listenerObject.count++;
	                        listenerExists = true;
	                    }
	                    else {
	                        listenerObject.count--;
	                        if (listenerObject.count === 0)
	                            this.listeners.splice(this.listeners.indexOf(listenerObject), 1);
	                    }
	                    break;
	                }
	            }
	            if (parameters.add && !listenerExists)
	                this.listeners.push({ count: 1, listener: parameters.listener });
	        }
	        this.hasListeners = this.listeners.length > 1 || Object.keys(this.listeners[0]).length > 0;
	    }
	    /**
	     * Announce a real-time event to all listeners.
	     *
	     * @param type - Type of event which should be announced.
	     * @param event - Announced real-time event payload.
	     */
	    announce(type, event) {
	        this.listeners.forEach(({ listener }) => {
	            const typedListener = listener[type];
	            // @ts-expect-error Dynamic events mapping.
	            if (typedListener)
	                typedListener(event);
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
	    constructor(config) {
	        this.config = config;
	        config.logger().debug('DedupingManager', () => ({
	            messageType: 'object',
	            message: { maximumCacheSize: config.maximumCacheSize },
	            details: 'Create with configuration:',
	        }));
	        this.maximumCacheSize = config.maximumCacheSize;
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
	    constructor(configuration, emitEvent, emitStatus, subscribeCall, heartbeatCall, leaveCall, time) {
	        this.configuration = configuration;
	        this.emitEvent = emitEvent;
	        this.emitStatus = emitStatus;
	        this.subscribeCall = subscribeCall;
	        this.heartbeatCall = heartbeatCall;
	        this.leaveCall = leaveCall;
	        configuration.logger().trace('SubscriptionManager', 'Create manager.');
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
	        this.referenceTimetoken = null;
	        this.subscriptionStatusAnnounced = false;
	        this.isOnline = true;
	    }
	    // region Information
	    /**
	     * Subscription-based current timetoken.
	     *
	     * @returns Timetoken based on current timetoken plus diff between current and loop start time.
	     */
	    get subscriptionTimetoken() {
	        var _a;
	        return subscriptionTimetokenFromReference(this.currentTimetoken, (_a = this.referenceTimetoken) !== null && _a !== void 0 ? _a : '0');
	    }
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
	    /**
	     * Restart subscription loop with current state.
	     *
	     * @param forUnsubscribe - Whether restarting subscription loop as part of channels list change on
	     * unsubscribe or not.
	     */
	    reconnect(forUnsubscribe = false) {
	        this.startSubscribeLoop(forUnsubscribe);
	        // Starting heartbeat loop for provided channels and groups.
	        if (!forUnsubscribe && !this.configuration.useSmartHeartbeat)
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
	            this.currentTimetoken = `${timetoken}`;
	        }
	        if (this.currentTimetoken !== '0') {
	            this.storedTimetoken = this.currentTimetoken;
	            this.currentTimetoken = '0';
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
	    unsubscribe(parameters, isOffline = false) {
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
	                this.emitStatus(Object.assign(Object.assign({}, restOfStatus), { error: errorMessage !== null && errorMessage !== void 0 ? errorMessage : false, affectedChannels: channels, affectedChannelGroups: channelGroups, currentTimetoken: this.currentTimetoken, lastTimetoken: this.lastTimetoken }));
	            });
	        }
	        if (Object.keys(this.channels).length === 0 &&
	            Object.keys(this.presenceChannels).length === 0 &&
	            Object.keys(this.channelGroups).length === 0 &&
	            Object.keys(this.presenceChannelGroups).length === 0) {
	            this.lastTimetoken = '0';
	            this.currentTimetoken = '0';
	            this.referenceTimetoken = null;
	            this.storedTimetoken = null;
	            this.region = null;
	            this.reconnectionManager.stopPolling();
	        }
	        this.reconnect(true);
	    }
	    unsubscribeAll(isOffline = false) {
	        this.unsubscribe({
	            channels: this.subscribedChannels,
	            channelGroups: this.subscribedChannelGroups,
	        }, isOffline);
	    }
	    /**
	     * Start next subscription loop.
	     *
	     * @param restartOnUnsubscribe - Whether restarting subscription loop as part of channels list change on
	     * unsubscribe or not.
	     *
	     * @internal
	     */
	    startSubscribeLoop(restartOnUnsubscribe = false) {
	        this.stopSubscribeLoop();
	        const channelGroups = [...Object.keys(this.channelGroups)];
	        const channels = [...Object.keys(this.channels)];
	        Object.keys(this.presenceChannelGroups).forEach((group) => channelGroups.push(`${group}-pnpres`));
	        Object.keys(this.presenceChannels).forEach((channel) => channels.push(`${channel}-pnpres`));
	        // There is no need to start subscription loop for an empty list of data sources.
	        if (channels.length === 0 && channelGroups.length === 0)
	            return;
	        this.subscribeCall(Object.assign(Object.assign({ channels,
	            channelGroups, state: this.presenceState, heartbeat: this.configuration.getPresenceTimeout(), timetoken: this.currentTimetoken }, (this.region !== null ? { region: this.region } : {})), (this.configuration.filterExpression ? { filterExpression: this.configuration.filterExpression } : {})), (status, result) => {
	            this.processSubscribeResponse(status, result);
	        });
	        if (!restartOnUnsubscribe && this.configuration.useSmartHeartbeat)
	            this.startHeartbeatTimer();
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
	            else if (status.category === StatusCategory$1.PNNetworkIssuesCategory ||
	                status.category === StatusCategory$1.PNMalformedResponseCategory) {
	                this.disconnect();
	                if (status.error && this.configuration.autoNetworkDetection && this.isOnline) {
	                    this.isOnline = false;
	                    this.emitStatus({ category: StatusCategory$1.PNNetworkDownCategory });
	                }
	                this.reconnectionManager.onReconnect(() => {
	                    if (this.configuration.autoNetworkDetection && !this.isOnline) {
	                        this.isOnline = true;
	                        this.emitStatus({ category: StatusCategory$1.PNNetworkUpCategory });
	                    }
	                    this.reconnect();
	                    this.subscriptionStatusAnnounced = true;
	                    const reconnectedAnnounce = {
	                        category: StatusCategory$1.PNReconnectedCategory,
	                        operation: status.operation,
	                        lastTimetoken: this.lastTimetoken,
	                        currentTimetoken: this.currentTimetoken,
	                    };
	                    this.emitStatus(reconnectedAnnounce);
	                });
	                this.reconnectionManager.startPolling();
	                this.emitStatus(Object.assign(Object.assign({}, status), { category: StatusCategory$1.PNNetworkIssuesCategory }));
	            }
	            else if (status.category === StatusCategory$1.PNBadRequestCategory) {
	                this.stopHeartbeatTimer();
	                this.emitStatus(status);
	            }
	            else
	                this.emitStatus(status);
	            return;
	        }
	        this.referenceTimetoken = referenceSubscribeTimetoken(result.cursor.timetoken, this.storedTimetoken);
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
	            this.emitStatus(connected);
	            // Clear pending channels and groups.
	            this.pendingChannelGroupSubscriptions.clear();
	            this.pendingChannelSubscriptions.clear();
	        }
	        const { messages } = result;
	        const { requestMessageCountThreshold, dedupeOnSubscribe } = this.configuration;
	        if (requestMessageCountThreshold && messages.length >= requestMessageCountThreshold) {
	            this.emitStatus({
	                category: StatusCategory$1.PNRequestMessageCountExceededCategory,
	                operation: status.operation,
	            });
	        }
	        try {
	            const cursor = {
	                timetoken: this.currentTimetoken,
	                region: this.region ? this.region : undefined,
	            };
	            this.configuration.logger().debug('SubscriptionManager', () => {
	                const hashedEvents = messages.map((event) => {
	                    const pn_mfp = event.type === PubNubEventType.Message || event.type === PubNubEventType.Signal
	                        ? messageFingerprint(event.data.message)
	                        : undefined;
	                    return pn_mfp ? { type: event.type, data: Object.assign(Object.assign({}, event.data), { pn_mfp }) } : event;
	                });
	                return { messageType: 'object', message: hashedEvents, details: 'Received events:' };
	            });
	            messages.forEach((message) => {
	                if (dedupeOnSubscribe && 'message' in message.data && 'timetoken' in message.data) {
	                    if (this.dedupingManager.isDuplicate(message.data)) {
	                        this.configuration.logger().warn('SubscriptionManager', () => ({
	                            messageType: 'object',
	                            message: message.data,
	                            details: 'Duplicate message detected (skipped):',
	                        }));
	                        return;
	                    }
	                    this.dedupingManager.addEntry(message.data);
	                }
	                this.emitEvent(cursor, message);
	            });
	        }
	        catch (e) {
	            const errorStatus = {
	                error: true,
	                category: StatusCategory$1.PNUnknownCategory,
	                errorData: e,
	                statusCode: 0,
	            };
	            this.emitStatus(errorStatus);
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
	                this.leaveCall({ channels, channelGroups }, (status) => this.emitStatus(status));
	            }
	        }
	        this.reconnect();
	    }
	    startHeartbeatTimer() {
	        this.stopHeartbeatTimer();
	        const heartbeatInterval = this.configuration.getHeartbeatInterval();
	        if (!heartbeatInterval || heartbeatInterval === 0)
	            return;
	        // Sending immediate heartbeat only if not working as a smart heartbeat.
	        if (!this.configuration.useSmartHeartbeat)
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
	                this.emitStatus(status);
	            if (status.error && this.configuration.autoNetworkDetection && this.isOnline) {
	                this.isOnline = false;
	                this.disconnect();
	                this.emitStatus({ category: StatusCategory$1.PNNetworkDownCategory });
	                this.reconnect();
	            }
	            if (!status.error && this.configuration.announceSuccessfulHeartbeats)
	                this.emitStatus(status);
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
	/**
	 * Generic event engine.
	 *
	 * @internal
	 */
	class Engine extends Subject {
	    constructor(logger) {
	        super(true);
	        this.logger = logger;
	        this._pendingEvents = [];
	        this._inTransition = false;
	    }
	    get currentState() {
	        return this._currentState;
	    }
	    get currentContext() {
	        return this._currentContext;
	    }
	    describe(label) {
	        return new State(label);
	    }
	    start(initialState, initialContext) {
	        this._currentState = initialState;
	        this._currentContext = initialContext;
	        this.notify({
	            type: 'engineStarted',
	            state: initialState,
	            context: initialContext,
	        });
	        return;
	    }
	    transition(event) {
	        if (!this._currentState) {
	            this.logger.error('Engine', 'Finite state machine is not started');
	            throw new Error('Start the engine first');
	        }
	        if (this._inTransition) {
	            this.logger.trace('Engine', () => ({
	                messageType: 'object',
	                message: event,
	                details: 'Event engine in transition. Enqueue received event:',
	            }));
	            this._pendingEvents.push(event);
	            return;
	        }
	        else
	            this._inTransition = true;
	        this.logger.trace('Engine', () => ({
	            messageType: 'object',
	            message: event,
	            details: 'Event engine received event:',
	        }));
	        this.notify({
	            type: 'eventReceived',
	            event: event,
	        });
	        const transition = this._currentState.transition(this._currentContext, event);
	        if (transition) {
	            const [newState, newContext, effects] = transition;
	            this.logger.trace('Engine', `Exiting state: ${this._currentState.label}`);
	            for (const effect of this._currentState.exitEffects) {
	                this.notify({
	                    type: 'invocationDispatched',
	                    invocation: effect(this._currentContext),
	                });
	            }
	            this.logger.trace('Engine', () => ({
	                messageType: 'object',
	                details: `Entering '${newState.label}' state with context:`,
	                message: newContext,
	            }));
	            const oldState = this._currentState;
	            this._currentState = newState;
	            const oldContext = this._currentContext;
	            this._currentContext = newContext;
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
	            for (const effect of this._currentState.enterEffects) {
	                this.notify({
	                    type: 'invocationDispatched',
	                    invocation: effect(this._currentContext),
	                });
	            }
	        }
	        else
	            this.logger.warn('Engine', `No transition from '${this._currentState.label}' found for event: ${event.type}`);
	        this._inTransition = false;
	        // Check whether a pending task should be dequeued.
	        if (this._pendingEvents.length > 0) {
	            const nextEvent = this._pendingEvents.shift();
	            if (nextEvent) {
	                this.logger.trace('Engine', () => ({
	                    messageType: 'object',
	                    message: nextEvent,
	                    details: 'De-queueing pending event:',
	                }));
	                this.transition(nextEvent);
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
	    constructor(dependencies, logger) {
	        this.dependencies = dependencies;
	        this.logger = logger;
	        this.instances = new Map();
	        this.handlers = new Map();
	    }
	    on(type, handlerCreator) {
	        this.handlers.set(type, handlerCreator);
	    }
	    dispatch(invocation) {
	        this.logger.trace('Dispatcher', `Process invocation: ${invocation.type}`);
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
	            this.logger.error('Dispatcher', `Unhandled invocation '${invocation.type}'`);
	            throw new Error(`Unhandled invocation '${invocation.type}'`);
	        }
	        const instance = handlerCreator(invocation.payload, this.dependencies);
	        this.logger.trace('Dispatcher', () => ({
	            messageType: 'object',
	            details: 'Call invocation handler with parameters:',
	            message: invocation.payload,
	            ignoredKeys: ['abortSignal'],
	        }));
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
	const heartbeat = createManagedEffect('HEARTBEAT', (channels, groups) => ({
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
	const disconnect$1 = createEvent('DISCONNECT', (isOffline = false) => ({ isOffline }));
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
	const leftAll = createEvent('LEFT_ALL', (isOffline = false) => ({ isOffline }));
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
	 * Delayed presence heartbeat event.
	 *
	 * Event is sent by corresponding effect handler when delay timer between heartbeat calls fired.
	 *
	 * @internal
	 */
	const timesUp = createEvent('TIMES_UP', () => ({}));

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
	        super(dependencies, dependencies.config.logger());
	        this.on(heartbeat.type, asyncHandler((payload_1, abortSignal_1, _a) => __awaiter(this, [payload_1, abortSignal_1, _a], void 0, function* (payload, abortSignal, { heartbeat, presenceState, config }) {
	            abortSignal.throwIfAborted();
	            try {
	                const result = yield heartbeat(Object.assign(Object.assign({ abortSignal: abortSignal, channels: payload.channels, channelGroups: payload.groups }, (config.maintainPresenceState && { state: presenceState })), { heartbeat: config.presenceTimeout }));
	                engine.transition(heartbeatSuccess(200));
	            }
	            catch (e) {
	                if (e instanceof PubNubError) {
	                    if (e.status && e.status.category == StatusCategory$1.PNCancelledCategory)
	                        return;
	                    engine.transition(heartbeatFailure(e));
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
	        this.on(emitStatus$1.type, asyncHandler((payload_1, _1, _a) => __awaiter(this, [payload_1, _1, _a], void 0, function* (payload, _, { emitStatus, config }) {
	            if (config.announceFailedHeartbeats && (payload === null || payload === void 0 ? void 0 : payload.error) === true) {
	                emitStatus(Object.assign(Object.assign({}, payload), { operation: RequestOperation$1.PNHeartbeatOperation }));
	            }
	            else if (config.announceSuccessfulHeartbeats && payload.statusCode === 200) {
	                emitStatus(Object.assign(Object.assign({}, payload), { error: false, operation: RequestOperation$1.PNHeartbeatOperation, category: StatusCategory$1.PNAcknowledgmentCategory }));
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
	    channels: [...context.channels, ...event.payload.channels.filter((channel) => !context.channels.includes(channel))],
	    groups: [...context.groups, ...event.payload.groups.filter((group) => !context.groups.includes(group))],
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
	    channels: [...context.channels, ...event.payload.channels.filter((channel) => !context.channels.includes(channel))],
	    groups: [...context.groups, ...event.payload.groups.filter((group) => !context.groups.includes(group))],
	}));
	HeartbeatCooldownState.on(left.type, (context, event) => HeartbeatingState.with({
	    channels: context.channels.filter((channel) => !event.payload.channels.includes(channel)),
	    groups: context.groups.filter((group) => !event.payload.groups.includes(group)),
	}, [leave(event.payload.channels, event.payload.groups)]));
	HeartbeatCooldownState.on(disconnect$1.type, (context, event) => HeartbeatStoppedState.with({ channels: context.channels, groups: context.groups }, [
	    ...(!event.payload.isOffline ? [leave(context.channels, context.groups)] : []),
	]));
	HeartbeatCooldownState.on(leftAll.type, (context, event) => HeartbeatInactiveState.with(undefined, [
	    ...(!event.payload.isOffline ? [leave(context.channels, context.groups)] : []),
	]));

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
	    channels: [...context.channels, ...event.payload.channels.filter((channel) => !context.channels.includes(channel))],
	    groups: [...context.groups, ...event.payload.groups.filter((group) => !context.groups.includes(group))],
	}));
	HeartbeatFailedState.on(left.type, (context, event) => HeartbeatingState.with({
	    channels: context.channels.filter((channel) => !event.payload.channels.includes(channel)),
	    groups: context.groups.filter((group) => !event.payload.groups.includes(group)),
	}, [leave(event.payload.channels, event.payload.groups)]));
	HeartbeatFailedState.on(reconnect$1.type, (context, _) => HeartbeatingState.with({
	    channels: context.channels,
	    groups: context.groups,
	}));
	HeartbeatFailedState.on(disconnect$1.type, (context, event) => HeartbeatStoppedState.with({ channels: context.channels, groups: context.groups }, [
	    ...(!event.payload.isOffline ? [leave(context.channels, context.groups)] : []),
	]));
	HeartbeatFailedState.on(leftAll.type, (context, event) => HeartbeatInactiveState.with(undefined, [
	    ...(!event.payload.isOffline ? [leave(context.channels, context.groups)] : []),
	]));

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
	HeartbeatingState.onExit(() => heartbeat.cancel);
	HeartbeatingState.on(heartbeatSuccess.type, (context, event) => HeartbeatCooldownState.with({ channels: context.channels, groups: context.groups }, [
	    emitStatus$1(Object.assign({}, event.payload)),
	]));
	HeartbeatingState.on(joined.type, (context, event) => HeartbeatingState.with({
	    channels: [...context.channels, ...event.payload.channels.filter((channel) => !context.channels.includes(channel))],
	    groups: [...context.groups, ...event.payload.groups.filter((group) => !context.groups.includes(group))],
	}));
	HeartbeatingState.on(left.type, (context, event) => {
	    return HeartbeatingState.with({
	        channels: context.channels.filter((channel) => !event.payload.channels.includes(channel)),
	        groups: context.groups.filter((group) => !event.payload.groups.includes(group)),
	    }, [leave(event.payload.channels, event.payload.groups)]);
	});
	HeartbeatingState.on(heartbeatFailure.type, (context, event) => HeartbeatFailedState.with(Object.assign({}, context), [
	    ...(event.payload.status ? [emitStatus$1(Object.assign({}, event.payload.status))] : []),
	]));
	HeartbeatingState.on(disconnect$1.type, (context, event) => HeartbeatStoppedState.with({ channels: context.channels, groups: context.groups }, [
	    ...(!event.payload.isOffline ? [leave(context.channels, context.groups)] : []),
	]));
	HeartbeatingState.on(leftAll.type, (context, event) => HeartbeatInactiveState.with(undefined, [
	    ...(!event.payload.isOffline ? [leave(context.channels, context.groups)] : []),
	]));

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
	        this.channels = [];
	        this.groups = [];
	        this.engine = new Engine(dependencies.config.logger());
	        this.dispatcher = new PresenceEventEngineDispatcher(this.engine, dependencies);
	        dependencies.config.logger().debug('PresenceEventEngine', 'Create presence event engine.');
	        this._unsubscribeEngine = this.engine.subscribe((change) => {
	            if (change.type === 'invocationDispatched') {
	                this.dispatcher.dispatch(change.invocation);
	            }
	        });
	        this.engine.start(HeartbeatInactiveState, undefined);
	    }
	    join({ channels, groups }) {
	        this.channels = [...this.channels, ...(channels !== null && channels !== void 0 ? channels : []).filter((channel) => !this.channels.includes(channel))];
	        this.groups = [...this.groups, ...(groups !== null && groups !== void 0 ? groups : []).filter((group) => !this.groups.includes(group))];
	        // Don't make any transitions if there is no channels and groups.
	        if (this.channels.length === 0 && this.groups.length === 0)
	            return;
	        this.engine.transition(joined(this.channels.slice(0), this.groups.slice(0)));
	    }
	    leave({ channels, groups }) {
	        if (this.dependencies.presenceState) {
	            channels === null || channels === void 0 ? void 0 : channels.forEach((c) => delete this.dependencies.presenceState[c]);
	            groups === null || groups === void 0 ? void 0 : groups.forEach((g) => delete this.dependencies.presenceState[g]);
	        }
	        this.engine.transition(left(channels !== null && channels !== void 0 ? channels : [], groups !== null && groups !== void 0 ? groups : []));
	    }
	    leaveAll(isOffline = false) {
	        this.engine.transition(leftAll(isOffline));
	    }
	    reconnect() {
	        this.engine.transition(reconnect$1());
	    }
	    disconnect(isOffline = false) {
	        this.engine.transition(disconnect$1(isOffline));
	    }
	    dispose() {
	        this.disconnect(true);
	        this._unsubscribeEngine();
	        this.dispatcher.dispose();
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
	const emitMessages = createEffect('EMIT_MESSAGES', (cursor, events) => ({
	    cursor,
	    events,
	}));
	/**
	 * Emit subscription status change effect.
	 *
	 * Notify status change event listeners.
	 *
	 * @internal
	 */
	const emitStatus = createEffect('EMIT_STATUS', (status) => status);

	/**
	 * Subscribe Event Engine events module.
	 *
	 * @internal
	 */
	/**
	 * Subscription list change event.
	 *
	 * Event is sent each time when the user would like to change a list of active channels / groups.
	 *
	 * @internal
	 */
	const subscriptionChange = createEvent('SUBSCRIPTION_CHANGED', (channels, groups, isOffline = false) => ({
	    channels,
	    groups,
	    isOffline,
	}));
	/**
	 * Subscription loop restore.
	 *
	 * Event is sent when a user would like to try to catch up on missed updates by providing specific timetoken.
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
	 * Event is sent by the corresponding effect handler if the REST API call was successful.
	 *
	 * @internal
	 */
	const handshakeSuccess = createEvent('HANDSHAKE_SUCCESS', (cursor) => cursor);
	/**
	 * The initial subscription handshake did fail event.
	 *
	 * Event is sent by the corresponding effect handler if the REST API call failed.
	 *
	 * @internal
	 */
	const handshakeFailure = createEvent('HANDSHAKE_FAILURE', (error) => error);
	/**
	 * Subscription successfully received real-time updates event.
	 *
	 * Event is sent by the corresponding effect handler if the REST API call was successful.
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
	 * Event is sent by the corresponding effect handler if the REST API call failed.
	 *
	 * @internal
	 */
	const receiveFailure = createEvent('RECEIVE_FAILURE', (error) => error);
	/**
	 * Client disconnect event.
	 *
	 * Event is sent when the user wants to temporarily stop real-time updates receive.
	 *
	 * @internal
	 */
	const disconnect = createEvent('DISCONNECT', (isOffline = false) => ({ isOffline }));
	/**
	 * Client reconnect event.
	 *
	 * Event is sent when the user wants to restore real-time updates receive.
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
	 * Event is sent when the user doesn't want to receive any real-time updates anymore.
	 *
	 * @internal
	 */
	const unsubscribeAll = createEvent('UNSUBSCRIBE_ALL', () => ({}));

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
	UnsubscribedState.on(subscriptionChange.type, (_, { payload }) => {
	    if (payload.channels.length === 0 && payload.groups.length === 0)
	        return UnsubscribedState.with(undefined);
	    return HandshakingState.with({ channels: payload.channels, groups: payload.groups });
	});
	UnsubscribedState.on(restore.type, (_, { payload }) => {
	    if (payload.channels.length === 0 && payload.groups.length === 0)
	        return UnsubscribedState.with(undefined);
	    return HandshakingState.with({
	        channels: payload.channels,
	        groups: payload.groups,
	        cursor: { timetoken: `${payload.cursor.timetoken}`, region: payload.cursor.region },
	    });
	});

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
	HandshakeStoppedState.on(subscriptionChange.type, (context, { payload }) => {
	    if (payload.channels.length === 0 && payload.groups.length === 0)
	        return UnsubscribedState.with(undefined);
	    return HandshakeStoppedState.with({ channels: payload.channels, groups: payload.groups, cursor: context.cursor });
	});
	HandshakeStoppedState.on(reconnect.type, (context, { payload }) => HandshakingState.with(Object.assign(Object.assign({}, context), { cursor: payload.cursor || context.cursor })));
	HandshakeStoppedState.on(restore.type, (context, { payload }) => {
	    var _a;
	    if (payload.channels.length === 0 && payload.groups.length === 0)
	        return UnsubscribedState.with(undefined);
	    return HandshakeStoppedState.with({
	        channels: payload.channels,
	        groups: payload.groups,
	        cursor: { timetoken: `${payload.cursor.timetoken}`, region: payload.cursor.region || ((_a = context.cursor) === null || _a === void 0 ? void 0 : _a.region) || 0 },
	    });
	});
	HandshakeStoppedState.on(unsubscribeAll.type, (_) => UnsubscribedState.with());

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
	HandshakeFailedState.on(subscriptionChange.type, (context, { payload }) => {
	    if (payload.channels.length === 0 && payload.groups.length === 0)
	        return UnsubscribedState.with(undefined);
	    return HandshakingState.with({ channels: payload.channels, groups: payload.groups, cursor: context.cursor });
	});
	HandshakeFailedState.on(reconnect.type, (context, { payload }) => HandshakingState.with(Object.assign(Object.assign({}, context), { cursor: payload.cursor || context.cursor })));
	HandshakeFailedState.on(restore.type, (context, { payload }) => {
	    var _a, _b;
	    if (payload.channels.length === 0 && payload.groups.length === 0)
	        return UnsubscribedState.with(undefined);
	    return HandshakingState.with({
	        channels: payload.channels,
	        groups: payload.groups,
	        cursor: {
	            timetoken: `${payload.cursor.timetoken}`,
	            region: payload.cursor.region ? payload.cursor.region : ((_b = (_a = context === null || context === void 0 ? void 0 : context.cursor) === null || _a === void 0 ? void 0 : _a.region) !== null && _b !== void 0 ? _b : 0),
	        },
	    });
	});
	HandshakeFailedState.on(unsubscribeAll.type, (_) => UnsubscribedState.with());

	/**
	 * Initial subscription handshake (disconnected) state.
	 *
	 * @internal
	 */
	/**
	 * Initial subscription handshake (disconnected) state.
	 *
	 * State in which Subscription Event Engine tries to receive the subscription cursor for the next sequential
	 * subscribe REST API calls.
	 *
	 * @internal
	 */
	const HandshakingState = new State('HANDSHAKING');
	HandshakingState.onEnter((context) => handshake(context.channels, context.groups));
	HandshakingState.onExit(() => handshake.cancel);
	HandshakingState.on(subscriptionChange.type, (context, { payload }) => {
	    if (payload.channels.length === 0 && payload.groups.length === 0)
	        return UnsubscribedState.with(undefined);
	    return HandshakingState.with({ channels: payload.channels, groups: payload.groups, cursor: context.cursor });
	});
	HandshakingState.on(handshakeSuccess.type, (context, { payload }) => {
	    var _a, _b, _c, _d, _e;
	    return ReceivingState.with({
	        channels: context.channels,
	        groups: context.groups,
	        cursor: {
	            timetoken: !!((_a = context.cursor) === null || _a === void 0 ? void 0 : _a.timetoken) ? (_b = context.cursor) === null || _b === void 0 ? void 0 : _b.timetoken : payload.timetoken,
	            region: payload.region,
	        },
	        referenceTimetoken: referenceSubscribeTimetoken(payload.timetoken, (_c = context.cursor) === null || _c === void 0 ? void 0 : _c.timetoken),
	    }, [
	        emitStatus({
	            category: StatusCategory$1.PNConnectedCategory,
	            affectedChannels: context.channels.slice(0),
	            affectedChannelGroups: context.groups.slice(0),
	            currentTimetoken: !!((_d = context.cursor) === null || _d === void 0 ? void 0 : _d.timetoken) ? (_e = context.cursor) === null || _e === void 0 ? void 0 : _e.timetoken : payload.timetoken,
	        }),
	    ]);
	});
	HandshakingState.on(handshakeFailure.type, (context, event) => {
	    var _a;
	    return HandshakeFailedState.with(Object.assign(Object.assign({}, context), { reason: event.payload }), [
	        emitStatus({ category: StatusCategory$1.PNConnectionErrorCategory, error: (_a = event.payload.status) === null || _a === void 0 ? void 0 : _a.category }),
	    ]);
	});
	HandshakingState.on(disconnect.type, (context, event) => {
	    var _a;
	    if (!event.payload.isOffline)
	        return HandshakeStoppedState.with(Object.assign({}, context));
	    else {
	        const errorReason = PubNubAPIError.create(new Error('Network connection error')).toPubNubError(RequestOperation$1.PNSubscribeOperation);
	        return HandshakeFailedState.with(Object.assign(Object.assign({}, context), { reason: errorReason }), [
	            emitStatus({
	                category: StatusCategory$1.PNConnectionErrorCategory,
	                error: (_a = errorReason.status) === null || _a === void 0 ? void 0 : _a.category,
	            }),
	        ]);
	    }
	});
	HandshakingState.on(restore.type, (context, { payload }) => {
	    var _a;
	    if (payload.channels.length === 0 && payload.groups.length === 0)
	        return UnsubscribedState.with(undefined);
	    return HandshakingState.with({
	        channels: payload.channels,
	        groups: payload.groups,
	        cursor: { timetoken: `${payload.cursor.timetoken}`, region: payload.cursor.region || ((_a = context === null || context === void 0 ? void 0 : context.cursor) === null || _a === void 0 ? void 0 : _a.region) || 0 },
	    });
	});
	HandshakingState.on(unsubscribeAll.type, (_) => UnsubscribedState.with());

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
	ReceiveStoppedState.on(subscriptionChange.type, (context, { payload }) => {
	    if (payload.channels.length === 0 && payload.groups.length === 0)
	        return UnsubscribedState.with(undefined);
	    return ReceiveStoppedState.with({ channels: payload.channels, groups: payload.groups, cursor: context.cursor });
	});
	ReceiveStoppedState.on(restore.type, (context, { payload }) => {
	    if (payload.channels.length === 0 && payload.groups.length === 0)
	        return UnsubscribedState.with(undefined);
	    return ReceiveStoppedState.with({
	        channels: payload.channels,
	        groups: payload.groups,
	        cursor: { timetoken: `${payload.cursor.timetoken}`, region: payload.cursor.region || context.cursor.region },
	    });
	});
	ReceiveStoppedState.on(reconnect.type, (context, { payload }) => {
	    var _a;
	    return HandshakingState.with({
	        channels: context.channels,
	        groups: context.groups,
	        cursor: {
	            timetoken: !!payload.cursor.timetoken ? (_a = payload.cursor) === null || _a === void 0 ? void 0 : _a.timetoken : context.cursor.timetoken,
	            region: payload.cursor.region || context.cursor.region,
	        },
	    });
	});
	ReceiveStoppedState.on(unsubscribeAll.type, () => UnsubscribedState.with(undefined));

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
	ReceiveFailedState.on(reconnect.type, (context, { payload }) => {
	    var _a;
	    return HandshakingState.with({
	        channels: context.channels,
	        groups: context.groups,
	        cursor: {
	            timetoken: !!payload.cursor.timetoken ? (_a = payload.cursor) === null || _a === void 0 ? void 0 : _a.timetoken : context.cursor.timetoken,
	            region: payload.cursor.region || context.cursor.region,
	        },
	    });
	});
	ReceiveFailedState.on(subscriptionChange.type, (context, { payload }) => {
	    if (payload.channels.length === 0 && payload.groups.length === 0)
	        return UnsubscribedState.with(undefined);
	    return HandshakingState.with({ channels: payload.channels, groups: payload.groups, cursor: context.cursor });
	});
	ReceiveFailedState.on(restore.type, (context, { payload }) => {
	    if (payload.channels.length === 0 && payload.groups.length === 0)
	        return UnsubscribedState.with(undefined);
	    return HandshakingState.with({
	        channels: payload.channels,
	        groups: payload.groups,
	        cursor: { timetoken: `${payload.cursor.timetoken}`, region: payload.cursor.region || context.cursor.region },
	    });
	});
	ReceiveFailedState.on(unsubscribeAll.type, (_) => UnsubscribedState.with(undefined));

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
	ReceivingState.on(receiveSuccess.type, (context, { payload }) => ReceivingState.with({
	    channels: context.channels,
	    groups: context.groups,
	    cursor: payload.cursor,
	    referenceTimetoken: referenceSubscribeTimetoken(payload.cursor.timetoken),
	}, [emitMessages(context.cursor, payload.events)]));
	ReceivingState.on(subscriptionChange.type, (context, { payload }) => {
	    var _a;
	    if (payload.channels.length === 0 && payload.groups.length === 0) {
	        let errorCategory;
	        if (payload.isOffline)
	            errorCategory = (_a = PubNubAPIError.create(new Error('Network connection error')).toPubNubError(RequestOperation$1.PNSubscribeOperation).status) === null || _a === void 0 ? void 0 : _a.category;
	        return UnsubscribedState.with(undefined, [
	            emitStatus(Object.assign({ category: !payload.isOffline
	                    ? StatusCategory$1.PNDisconnectedCategory
	                    : StatusCategory$1.PNDisconnectedUnexpectedlyCategory }, (errorCategory ? { error: errorCategory } : {}))),
	        ]);
	    }
	    return ReceivingState.with({
	        channels: payload.channels,
	        groups: payload.groups,
	        cursor: context.cursor,
	        referenceTimetoken: context.referenceTimetoken,
	    }, [
	        emitStatus({
	            category: StatusCategory$1.PNSubscriptionChangedCategory,
	            affectedChannels: payload.channels.slice(0),
	            affectedChannelGroups: payload.groups.slice(0),
	            currentTimetoken: context.cursor.timetoken,
	        }),
	    ]);
	});
	ReceivingState.on(restore.type, (context, { payload }) => {
	    if (payload.channels.length === 0 && payload.groups.length === 0)
	        return UnsubscribedState.with(undefined, [emitStatus({ category: StatusCategory$1.PNDisconnectedCategory })]);
	    return ReceivingState.with({
	        channels: payload.channels,
	        groups: payload.groups,
	        cursor: { timetoken: `${payload.cursor.timetoken}`, region: payload.cursor.region || context.cursor.region },
	        referenceTimetoken: referenceSubscribeTimetoken(context.cursor.timetoken, `${payload.cursor.timetoken}`, context.referenceTimetoken),
	    }, [
	        emitStatus({
	            category: StatusCategory$1.PNSubscriptionChangedCategory,
	            affectedChannels: payload.channels.slice(0),
	            affectedChannelGroups: payload.groups.slice(0),
	            currentTimetoken: payload.cursor.timetoken,
	        }),
	    ]);
	});
	ReceivingState.on(receiveFailure.type, (context, { payload }) => {
	    var _a;
	    return ReceiveFailedState.with(Object.assign(Object.assign({}, context), { reason: payload }), [
	        emitStatus({ category: StatusCategory$1.PNDisconnectedUnexpectedlyCategory, error: (_a = payload.status) === null || _a === void 0 ? void 0 : _a.category }),
	    ]);
	});
	ReceivingState.on(disconnect.type, (context, event) => {
	    var _a;
	    if (!event.payload.isOffline) {
	        return ReceiveStoppedState.with(Object.assign({}, context), [
	            emitStatus({ category: StatusCategory$1.PNDisconnectedCategory }),
	        ]);
	    }
	    else {
	        const errorReason = PubNubAPIError.create(new Error('Network connection error')).toPubNubError(RequestOperation$1.PNSubscribeOperation);
	        return ReceiveFailedState.with(Object.assign(Object.assign({}, context), { reason: errorReason }), [
	            emitStatus({
	                category: StatusCategory$1.PNDisconnectedUnexpectedlyCategory,
	                error: (_a = errorReason.status) === null || _a === void 0 ? void 0 : _a.category,
	            }),
	        ]);
	    }
	});
	ReceivingState.on(unsubscribeAll.type, (_) => UnsubscribedState.with(undefined, [emitStatus({ category: StatusCategory$1.PNDisconnectedCategory })]));

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
	        super(dependencies, dependencies.config.logger());
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
	        this.on(emitMessages.type, asyncHandler((_a, _1, _b) => __awaiter(this, [_a, _1, _b], void 0, function* ({ cursor, events }, _, { emitMessages }) {
	            if (events.length > 0)
	                emitMessages(cursor, events);
	        })));
	        this.on(emitStatus.type, asyncHandler((payload_1, _1, _a) => __awaiter(this, [payload_1, _1, _a], void 0, function* (payload, _, { emitStatus }) { return emitStatus(payload); })));
	    }
	}

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
	        this.channels = [];
	        this.groups = [];
	        this.dependencies = dependencies;
	        this.engine = new Engine(dependencies.config.logger());
	        this.dispatcher = new EventEngineDispatcher(this.engine, dependencies);
	        dependencies.config.logger().debug('EventEngine', 'Create subscribe event engine.');
	        this._unsubscribeEngine = this.engine.subscribe((change) => {
	            if (change.type === 'invocationDispatched') {
	                this.dispatcher.dispatch(change.invocation);
	            }
	        });
	        this.engine.start(UnsubscribedState, undefined);
	    }
	    /**
	     * Subscription-based current timetoken.
	     *
	     * @returns Timetoken based on current timetoken plus diff between current and loop start time.
	     */
	    get subscriptionTimetoken() {
	        const currentState = this.engine.currentState;
	        if (!currentState)
	            return undefined;
	        let referenceTimetoken;
	        let currentTimetoken = '0';
	        if (currentState.label === ReceivingState.label) {
	            const context = this.engine.currentContext;
	            currentTimetoken = context.cursor.timetoken;
	            referenceTimetoken = context.referenceTimetoken;
	        }
	        return subscriptionTimetokenFromReference(currentTimetoken, referenceTimetoken !== null && referenceTimetoken !== void 0 ? referenceTimetoken : '0');
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
	            const groupsToLeave = findUniqueCommonElements(this.groups, channelGroups);
	            if (this.dependencies.presenceState) {
	                channelsToLeave === null || channelsToLeave === void 0 ? void 0 : channelsToLeave.forEach((c) => delete this.dependencies.presenceState[c]);
	                groupsToLeave === null || groupsToLeave === void 0 ? void 0 : groupsToLeave.forEach((g) => delete this.dependencies.presenceState[g]);
	            }
	            this.channels = filteredChannels;
	            this.groups = filteredGroups;
	            this.engine.transition(subscriptionChange(Array.from(new Set(this.channels.slice(0))), Array.from(new Set(this.groups.slice(0)))));
	            if (this.dependencies.leave) {
	                this.dependencies.leave({
	                    channels: channelsToLeave.slice(0),
	                    groups: groupsToLeave.slice(0),
	                });
	            }
	        }
	    }
	    unsubscribeAll(isOffline = false) {
	        const channelGroups = this.getSubscribedChannelGroups();
	        const channels = this.getSubscribedChannels();
	        this.channels = [];
	        this.groups = [];
	        if (this.dependencies.presenceState) {
	            Object.keys(this.dependencies.presenceState).forEach((objectName) => {
	                delete this.dependencies.presenceState[objectName];
	            });
	        }
	        this.engine.transition(subscriptionChange(this.channels.slice(0), this.groups.slice(0), isOffline));
	        if (this.dependencies.leaveAll)
	            this.dependencies.leaveAll({ channels, groups: channelGroups, isOffline });
	    }
	    reconnect({ timetoken, region }) {
	        const channelGroups = this.getSubscribedChannels();
	        const channels = this.getSubscribedChannels();
	        this.engine.transition(reconnect(timetoken, region));
	        if (this.dependencies.presenceReconnect)
	            this.dependencies.presenceReconnect({ channels, groups: channelGroups });
	    }
	    disconnect(isOffline = false) {
	        const channelGroups = this.getSubscribedChannels();
	        const channels = this.getSubscribedChannels();
	        this.engine.transition(disconnect(isOffline));
	        if (this.dependencies.presenceDisconnect)
	            this.dependencies.presenceDisconnect({ channels, groups: channelGroups, isOffline });
	    }
	    getSubscribedChannels() {
	        return Array.from(new Set(this.channels.slice(0)));
	    }
	    getSubscribedChannelGroups() {
	        return Array.from(new Set(this.groups.slice(0)));
	    }
	    dispose() {
	        this.disconnect(true);
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
	        const sendByPost = (_a = parameters.sendByPost) !== null && _a !== void 0 ? _a : SEND_BY_POST;
	        super({ method: sendByPost ? TransportMethod.POST : TransportMethod.GET, compressible: sendByPost });
	        this.parameters = parameters;
	        // Apply default request parameters.
	        this.parameters.sendByPost = sendByPost;
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
	            return { timetoken: this.deserializeResponse(response)[2] };
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
	        var _a;
	        if (!this.parameters.sendByPost)
	            return super.headers;
	        return Object.assign(Object.assign({}, ((_a = super.headers) !== null && _a !== void 0 ? _a : {})), { 'Content-Type': 'application/json' });
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
	            return { timetoken: this.deserializeResponse(response)[2] };
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
	            if (timetoken && timetoken !== '0' && timetoken.length > 0)
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
	        const query = { ee: '' };
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
	 * SubscriptionCapable entity type.
	 *
	 * @internal
	 */
	var SubscriptionType;
	(function (SubscriptionType) {
	    /**
	     * Channel identifier, which is part of the URI path.
	     */
	    SubscriptionType[SubscriptionType["Channel"] = 0] = "Channel";
	    /**
	     * Channel group identifiers, which is part of the query parameters.
	     */
	    SubscriptionType[SubscriptionType["ChannelGroup"] = 1] = "ChannelGroup";
	})(SubscriptionType || (SubscriptionType = {}));

	/**
	 * User-provided channels and groups for subscription.
	 *
	 * Object contains information about channels and groups for which real-time updates should be retrieved from the
	 * PubNub network.
	 *
	 * @internal
	 */
	class SubscriptionInput {
	    /**
	     * Create a subscription input object.
	     *
	     * @param channels - List of channels which will be used with subscribe REST API to receive real-time updates.
	     * @param channelGroups - List of channel groups which will be used with subscribe REST API to receive real-time
	     * updates.
	     */
	    constructor({ channels, channelGroups }) {
	        /**
	         * Whether the user input is empty or not.
	         */
	        this.isEmpty = true;
	        this._channelGroups = new Set((channelGroups !== null && channelGroups !== void 0 ? channelGroups : []).filter((value) => value.length > 0));
	        this._channels = new Set((channels !== null && channels !== void 0 ? channels : []).filter((value) => value.length > 0));
	        this.isEmpty = this._channels.size === 0 && this._channelGroups.size === 0;
	    }
	    /**
	     * Retrieve total length of subscription input.
	     *
	     * @returns Number of channels and groups in subscription input.
	     */
	    get length() {
	        if (this.isEmpty)
	            return 0;
	        return this._channels.size + this._channelGroups.size;
	    }
	    /**
	     * Retrieve a list of user-provided channel names.
	     *
	     * @returns List of user-provided channel names.
	     */
	    get channels() {
	        if (this.isEmpty)
	            return [];
	        return Array.from(this._channels);
	    }
	    /**
	     * Retrieve a list of user-provided channel group names.
	     *
	     * @returns List of user-provided channel group names.
	     */
	    get channelGroups() {
	        if (this.isEmpty)
	            return [];
	        return Array.from(this._channelGroups);
	    }
	    /**
	     * Check if the given name is contained in the channel or channel group.
	     *
	     * @param name - Containing the name to be checked.
	     *
	     * @returns `true` if the name is found in the channel or channel group, `false` otherwise.
	     */
	    contains(name) {
	        if (this.isEmpty)
	            return false;
	        return this._channels.has(name) || this._channelGroups.has(name);
	    }
	    /**
	     * Create a new subscription input which will contain all channels and channel groups from both inputs.
	     *
	     * @param input - Another subscription input that should be used to aggregate data in new instance.
	     *
	     * @returns New subscription input instance with combined channels and channel groups.
	     */
	    with(input) {
	        return new SubscriptionInput({
	            channels: [...this._channels, ...input._channels],
	            channelGroups: [...this._channelGroups, ...input._channelGroups],
	        });
	    }
	    /**
	     * Create a new subscription input which will contain only channels and groups which not present in the input.
	     *
	     * @param input - Another subscription input which should be used to filter data in new instance.
	     *
	     * @returns New subscription input instance with filtered channels and channel groups.
	     */
	    without(input) {
	        return new SubscriptionInput({
	            channels: [...this._channels].filter((value) => !input._channels.has(value)),
	            channelGroups: [...this._channelGroups].filter((value) => !input._channelGroups.has(value)),
	        });
	    }
	    /**
	     * Add data from another subscription input to the receiver.
	     *
	     * @param input - Another subscription input whose data should be added to the receiver.
	     *
	     * @returns Receiver instance with updated channels and channel groups.
	     */
	    add(input) {
	        if (input._channelGroups.size > 0)
	            this._channelGroups = new Set([...this._channelGroups, ...input._channelGroups]);
	        if (input._channels.size > 0)
	            this._channels = new Set([...this._channels, ...input._channels]);
	        this.isEmpty = this._channels.size === 0 && this._channelGroups.size === 0;
	        return this;
	    }
	    /**
	     * Remove data from another subscription input from the receiver.
	     *
	     * @param input - Another subscription input whose data should be removed from the receiver.
	     *
	     * @returns Receiver instance with updated channels and channel groups.
	     */
	    remove(input) {
	        if (input._channelGroups.size > 0)
	            this._channelGroups = new Set([...this._channelGroups].filter((value) => !input._channelGroups.has(value)));
	        if (input._channels.size > 0)
	            this._channels = new Set([...this._channels].filter((value) => !input._channels.has(value)));
	        return this;
	    }
	    /**
	     * Remove all data from subscription input.
	     *
	     * @returns Receiver instance with updated channels and channel groups.
	     */
	    removeAll() {
	        this._channels.clear();
	        this._channelGroups.clear();
	        this.isEmpty = true;
	        return this;
	    }
	    /**
	     * Serialize a subscription input to string.
	     *
	     * @returns Printable string representation of a subscription input.
	     */
	    toString() {
	        return `SubscriptionInput { channels: [${this.channels.join(', ')}], channelGroups: [${this.channelGroups.join(', ')}], is empty: ${this.isEmpty ? 'true' : 'false'}} }`;
	    }
	}
	// endregion

	/**
	 * Subscription state object.
	 *
	 * State object used across multiple subscription object clones.
	 *
	 * @internal
	 */
	class SubscriptionBaseState {
	    /**
	     * Create a base subscription state object.
	     *
	     * @param client - PubNub client which will work with a subscription object.
	     * @param subscriptionInput - User's input to be used with subscribe REST API.
	     * @param options - Subscription behavior options.
	     * @param referenceTimetoken - High-precision timetoken of the moment when subscription was created for entity.
	     */
	    constructor(client, subscriptionInput, options, referenceTimetoken) {
	        /**
	         * Whether a subscribable object subscribed or not.
	         */
	        this._isSubscribed = false;
	        /**
	         * The list of references to all {@link SubscriptionBase} clones created for this reference.
	         */
	        this.clones = {};
	        /**
	         * List of a parent subscription state objects list.
	         *
	         * List is used to track usage of a subscription object in other subscription object sets.
	         *
	         * **Important:** Tracking is required to prevent unexpected unsubscriptions if an object still has a parent.
	         */
	        this.parents = [];
	        /**
	         * Unique subscription object identifier.
	         */
	        this._id = uuidGenerator.createUUID();
	        this.referenceTimetoken = referenceTimetoken;
	        this.subscriptionInput = subscriptionInput;
	        this.options = options;
	        this.client = client;
	    }
	    /**
	     * Get unique subscription object identifier.
	     *
	     * @returns Unique subscription object identifier.
	     */
	    get id() {
	        return this._id;
	    }
	    /**
	     * Check whether a subscription object is the last clone or not.
	     *
	     * @returns `true` if a subscription object is the last clone.
	     */
	    get isLastClone() {
	        return Object.keys(this.clones).length === 1;
	    }
	    /**
	     * Get whether a subscribable object subscribed or not.
	     *
	     * **Warning:** This method shouldn't be overridden by {@link SubscriptionSet}.
	     *
	     * @returns Whether a subscribable object subscribed or not.
	     */
	    get isSubscribed() {
	        if (this._isSubscribed)
	            return true;
	        // Checking whether any of "parents" is subscribed.
	        return this.parents.length > 0 && this.parents.some((state) => state.isSubscribed);
	    }
	    /**
	     * Update active subscription state.
	     *
	     * @param value - New subscription state.
	     */
	    set isSubscribed(value) {
	        if (this.isSubscribed === value)
	            return;
	        this._isSubscribed = value;
	    }
	    /**
	     * Add a parent subscription state object to mark the linkage.
	     *
	     * @param parent - Parent subscription state object.
	     *
	     * @internal
	     */
	    addParentState(parent) {
	        if (!this.parents.includes(parent))
	            this.parents.push(parent);
	    }
	    /**
	     * Remove a parent subscription state object.
	     *
	     * @param parent - Parent object for which linkage should be broken.
	     *
	     * @internal
	     */
	    removeParentState(parent) {
	        const parentStateIndex = this.parents.indexOf(parent);
	        if (parentStateIndex !== -1)
	            this.parents.splice(parentStateIndex, 1);
	    }
	    /**
	     * Store a clone of a {@link SubscriptionBase} instance with a given instance ID.
	     *
	     * @param id - The instance ID to associate with clone.
	     * @param instance - Reference to the subscription instance to store as a clone.
	     */
	    storeClone(id, instance) {
	        if (!this.clones[id])
	            this.clones[id] = instance;
	    }
	}
	/**
	 * Base subscribe object.
	 *
	 * Implementation of base functionality used by {@link SubscriptionObject Subscription} and {@link SubscriptionSet}.
	 */
	class SubscriptionBase {
	    /**
	     * Create a subscription object from the state.
	     *
	     * @param state - Subscription state object.
	     *
	     * @internal
	     */
	    constructor(state) {
	        /**
	         * Unique subscription object identifier.
	         *
	         * @internal
	         */
	        this.id = uuidGenerator.createUUID();
	        /**
	         * Event emitter, which will notify listeners about updates received for channels / groups.
	         *
	         * @internal
	         */
	        this.eventDispatcher = new EventDispatcher();
	        this._state = state;
	    }
	    /**
	     * Retrieve subscription type.
	     *
	     * There is two types:
	     * - Subscription
	     * - SubscriptionSet
	     *
	     * @returns One of subscription types.
	     *
	     * @internal
	     */
	    get subscriptionType() {
	        return 'Subscription';
	    }
	    /**
	     * Subscription state.
	     *
	     * @returns Subscription state object.
	     *
	     * @internal
	     */
	    get state() {
	        return this._state;
	    }
	    /**
	     * Get a list of channels which is used for subscription.
	     *
	     * @returns List of channel names.
	     */
	    get channels() {
	        return this.state.subscriptionInput.channels.slice(0);
	    }
	    /**
	     * Get a list of channel groups which is used for subscription.
	     *
	     * @returns List of channel group names.
	     */
	    get channelGroups() {
	        return this.state.subscriptionInput.channelGroups.slice(0);
	    }
	    // --------------------------------------------------------
	    // -------------------- Event emitter ---------------------
	    // --------------------------------------------------------
	    // region Event emitter
	    /**
	     * Set a new message handler.
	     *
	     * @param listener - Listener function, which will be called each time when a new message
	     * is received from the real-time network.
	     */
	    set onMessage(listener) {
	        this.eventDispatcher.onMessage = listener;
	    }
	    /**
	     * Set a new presence events handler.
	     *
	     * @param listener - Listener function, which will be called each time when a new
	     * presence event is received from the real-time network.
	     */
	    set onPresence(listener) {
	        this.eventDispatcher.onPresence = listener;
	    }
	    /**
	     * Set a new signal handler.
	     *
	     * @param listener - Listener function, which will be called each time when a new signal
	     * is received from the real-time network.
	     */
	    set onSignal(listener) {
	        this.eventDispatcher.onSignal = listener;
	    }
	    /**
	     * Set a new app context event handler.
	     *
	     * @param listener - Listener function, which will be called each time when a new
	     * app context event is received from the real-time network.
	     */
	    set onObjects(listener) {
	        this.eventDispatcher.onObjects = listener;
	    }
	    /**
	     * Set a new message reaction event handler.
	     *
	     * @param listener - Listener function, which will be called each time when a
	     * new message reaction event is received from the real-time network.
	     */
	    set onMessageAction(listener) {
	        this.eventDispatcher.onMessageAction = listener;
	    }
	    /**
	     * Set a new file handler.
	     *
	     * @param listener - Listener function, which will be called each time when a new file
	     * is received from the real-time network.
	     */
	    set onFile(listener) {
	        this.eventDispatcher.onFile = listener;
	    }
	    /**
	     * Set events handler.
	     *
	     * @param listener - Events listener configuration object, which lets specify handlers for multiple
	     * types of events.
	     */
	    addListener(listener) {
	        this.eventDispatcher.addListener(listener);
	    }
	    /**
	     * Remove events handler.
	     *
	     * @param listener - Event listener configuration, which should be removed from the list of notified
	     * listeners. **Important:** Should be the same object which has been passed to the {@link addListener}.
	     */
	    removeListener(listener) {
	        this.eventDispatcher.removeListener(listener);
	    }
	    /**
	     * Remove all events listeners.
	     */
	    removeAllListeners() {
	        this.eventDispatcher.removeAllListeners();
	    }
	    /**
	     * Dispatch received a real-time update.
	     *
	     * @param cursor - A time cursor for the next portion of events.
	     * @param event - A real-time event from multiplexed subscription.
	     *
	     * @return `true` if receiver has consumed event.
	     *
	     * @internal
	     */
	    handleEvent(cursor, event) {
	        var _a;
	        if (!this.state.cursor || cursor > this.state.cursor)
	            this.state.cursor = cursor;
	        // Check whether this is an old `old` event and it should be ignored or not.
	        if (this.state.referenceTimetoken && event.data.timetoken < this.state.referenceTimetoken) {
	            this.state.client.logger.trace(this.subscriptionType, () => ({
	                messageType: 'text',
	                message: `Event timetoken (${event.data.timetoken}) is older than reference timetoken (${this.state.referenceTimetoken}) for ${this.id} subscription object. Ignoring event.`,
	            }));
	            return;
	        }
	        // Don't pass events which are filtered out by the user-provided function.
	        if (((_a = this.state.options) === null || _a === void 0 ? void 0 : _a.filter) && !this.state.options.filter(event)) {
	            this.state.client.logger.trace(this.subscriptionType, `Event filtered out by filter function for ${this.id} subscription object. Ignoring event.`);
	            return;
	        }
	        const clones = Object.values(this.state.clones);
	        if (clones.length > 0) {
	            this.state.client.logger.trace(this.subscriptionType, `Notify ${this.id} subscription object clones (count: ${clones.length}) about received event.`);
	        }
	        clones.forEach((subscription) => subscription.eventDispatcher.handleEvent(event));
	    }
	    /**
	     * Graceful object destruction.
	     *
	     * This is an instance destructor, which will properly deinitialize it:
	     * - remove and unset all listeners,
	     * - try to unsubscribe (if subscribed and there are no more instances interested in the same data stream).
	     *
	     * **Important:** {@link SubscriptionBase#dispose dispose} won't have any effect if a subscription object is part of
	     * set. To gracefully dispose an object, it should be removed from the set using
	     * {@link SubscriptionSet#removeSubscription removeSubscription} (in this case call of
	     * {@link SubscriptionBase#dispose dispose} not required.
	     *
	     * **Note:** Disposed instance won't call the dispatcher to deliver updates to the listeners.
	     */
	    dispose() {
	        const keys = Object.keys(this.state.clones);
	        if (keys.length > 1) {
	            this.state.client.logger.debug(this.subscriptionType, `Remove subscription object clone on dispose: ${this.id}`);
	            delete this.state.clones[this.id];
	        }
	        else if (keys.length === 1 && this.state.clones[this.id]) {
	            this.state.client.logger.debug(this.subscriptionType, `Unsubscribe subscription object on dispose: ${this.id}`);
	            this.unsubscribe();
	        }
	    }
	    /**
	     * Invalidate subscription object.
	     *
	     * Clean up resources used by a subscription object.
	     *
	     * **Note:** An invalidated instance won't call the dispatcher to deliver updates to the listeners.
	     *
	     * @param forDestroy - Whether subscription object invalidated as part of PubNub client destroy process or not.
	     *
	     * @internal
	     */
	    invalidate(forDestroy = false) {
	        this.state._isSubscribed = false;
	        if (forDestroy) {
	            delete this.state.clones[this.id];
	            if (Object.keys(this.state.clones).length === 0) {
	                this.state.client.logger.trace(this.subscriptionType, 'Last clone removed. Reset shared subscription state.');
	                this.state.subscriptionInput.removeAll();
	                this.state.parents = [];
	            }
	        }
	    }
	    /**
	     * Start receiving real-time updates.
	     *
	     * @param parameters - Additional subscription configuration options which should be used
	     * for request.
	     */
	    subscribe(parameters) {
	        if (this.state.isSubscribed) {
	            this.state.client.logger.trace(this.subscriptionType, 'Already subscribed. Ignoring subscribe request.');
	            return;
	        }
	        this.state.client.logger.debug(this.subscriptionType, () => {
	            if (!parameters)
	                return { messageType: 'text', message: 'Subscribe' };
	            return { messageType: 'object', message: parameters, details: 'Subscribe with parameters:' };
	        });
	        this.state.isSubscribed = true;
	        this.updateSubscription({ subscribing: true, timetoken: parameters === null || parameters === void 0 ? void 0 : parameters.timetoken });
	    }
	    /**
	     * Stop real-time events processing.
	     *
	     * **Important:** {@link SubscriptionBase#unsubscribe unsubscribe} won't have any effect if a subscription object
	     * is part of active (subscribed) set. To unsubscribe an object, it should be removed from the set using
	     * {@link SubscriptionSet#removeSubscription removeSubscription} (in this case call of
	     * {@link SubscriptionBase#unsubscribe unsubscribe} not required.
	     *
	     * **Note:** Unsubscribed instance won't call the dispatcher to deliver updates to the listeners.
	     */
	    unsubscribe() {
	        // Check whether an instance-level subscription flag not set or parent has active subscription.
	        if (!this.state._isSubscribed || this.state.isSubscribed) {
	            // Warn if a user tries to unsubscribe using specific subscription which subscribed as part of a subscription set.
	            if (!this.state._isSubscribed && this.state.parents.length > 0 && this.state.isSubscribed) {
	                this.state.client.logger.warn(this.subscriptionType, () => ({
	                    messageType: 'object',
	                    details: 'Subscription is subscribed as part of a subscription set. Remove from active sets to unsubscribe:',
	                    message: this.state.parents.filter((subscriptionSet) => subscriptionSet.isSubscribed),
	                }));
	                return;
	            }
	            else if (!this.state._isSubscribed) {
	                this.state.client.logger.trace(this.subscriptionType, 'Not subscribed. Ignoring unsubscribe request.');
	                return;
	            }
	        }
	        this.state.client.logger.debug(this.subscriptionType, 'Unsubscribe');
	        this.state.isSubscribed = false;
	        delete this.state.cursor;
	        this.updateSubscription({ subscribing: false });
	    }
	    /**
	     * Update channels and groups used by subscription loop.
	     *
	     * @param parameters - Subscription loop update parameters.
	     * @param parameters.subscribing - Whether subscription updates as part of subscription or unsubscription.
	     * @param [parameters.timetoken] - Subscription catch-up timetoken.
	     * @param [parameters.subscriptions] - List of subscriptions which should be used to modify a subscription loop
	     * object.
	     *
	     * @internal
	     */
	    updateSubscription(parameters) {
	        var _a, _b;
	        if (parameters === null || parameters === void 0 ? void 0 : parameters.timetoken) {
	            if (((_a = this.state.cursor) === null || _a === void 0 ? void 0 : _a.timetoken) && ((_b = this.state.cursor) === null || _b === void 0 ? void 0 : _b.timetoken) !== '0') {
	                if (parameters.timetoken !== '0' && parameters.timetoken > this.state.cursor.timetoken)
	                    this.state.cursor.timetoken = parameters.timetoken;
	            }
	            else
	                this.state.cursor = { timetoken: parameters.timetoken };
	        }
	        const subscriptions = parameters.subscriptions && parameters.subscriptions.length > 0 ? parameters.subscriptions : undefined;
	        if (parameters.subscribing) {
	            this.register(Object.assign(Object.assign({}, (parameters.timetoken ? { cursor: this.state.cursor } : {})), (subscriptions ? { subscriptions } : {})));
	        }
	        else
	            this.unregister(subscriptions);
	    }
	}

	/**
	 * {@link SubscriptionSet} state object.
	 *
	 * State object used across multiple {@link SubscriptionSet} object clones.
	 *
	 * @internal
	 */
	class SubscriptionSetState extends SubscriptionBaseState {
	    /**
	     * Create a subscription state object.
	     *
	     * @param parameters - State configuration options
	     * @param parameters.client - PubNub client which will work with a subscription object.
	     * @param parameters.subscriptions - List of subscriptions managed by set.
	     * @param [parameters.options] - Subscription behavior options.
	     */
	    constructor(parameters) {
	        const subscriptionInput = new SubscriptionInput({});
	        parameters.subscriptions.forEach((subscription) => subscriptionInput.add(subscription.state.subscriptionInput));
	        super(parameters.client, subscriptionInput, parameters.options, parameters.client.subscriptionTimetoken);
	        this.subscriptions = parameters.subscriptions;
	    }
	    /**
	     * Retrieve subscription type.
	     *
	     * There is two types:
	     * - Subscription
	     * - SubscriptionSet
	     *
	     * @returns One of subscription types.
	     *
	     * @internal
	     */
	    get subscriptionType() {
	        return 'SubscriptionSet';
	    }
	    /**
	     * Add a single subscription object to the set.
	     *
	     * @param subscription - Another entity's subscription object, which should be added.
	     */
	    addSubscription(subscription) {
	        if (this.subscriptions.includes(subscription))
	            return;
	        subscription.state.addParentState(this);
	        this.subscriptions.push(subscription);
	        // Update subscription input.
	        this.subscriptionInput.add(subscription.state.subscriptionInput);
	    }
	    /**
	     * Remove a single subscription object from the set.
	     *
	     * @param subscription - Another entity's subscription object, which should be removed.
	     * @param clone - Whether a target subscription is a clone.
	     */
	    removeSubscription(subscription, clone) {
	        const index = this.subscriptions.indexOf(subscription);
	        if (index === -1)
	            return;
	        this.subscriptions.splice(index, 1);
	        if (!clone)
	            subscription.state.removeParentState(this);
	        // Update subscription input.
	        this.subscriptionInput.remove(subscription.state.subscriptionInput);
	    }
	    /**
	     * Remove any registered subscription object.
	     */
	    removeAllSubscriptions() {
	        this.subscriptions.forEach((subscription) => subscription.state.removeParentState(this));
	        this.subscriptions.splice(0, this.subscriptions.length);
	        this.subscriptionInput.removeAll();
	    }
	}
	/**
	 * Multiple entities subscription set object which can be used to receive and handle real-time
	 * updates.
	 *
	 * Subscription set object represents a collection of per-entity subscription objects and allows
	 * processing them at once for subscription loop and events handling.
	 */
	class SubscriptionSet extends SubscriptionBase {
	    /**
	     * Create entities' subscription set object.
	     *
	     * Subscription set object represents a collection of per-entity subscription objects and allows
	     * processing them at once for subscription loop and events handling.
	     *
	     * @param parameters - Subscription set object configuration.
	     *
	     * @returns Ready to use entities' subscription set object.
	     *
	     * @internal
	     */
	    constructor(parameters) {
	        let state;
	        if ('client' in parameters) {
	            let subscriptions = [];
	            if (!parameters.subscriptions && parameters.entities) {
	                parameters.entities.forEach((entity) => subscriptions.push(entity.subscription(parameters.options)));
	            }
	            else if (parameters.subscriptions)
	                subscriptions = parameters.subscriptions;
	            state = new SubscriptionSetState({ client: parameters.client, subscriptions, options: parameters.options });
	            subscriptions.forEach((subscription) => subscription.state.addParentState(state));
	            state.client.logger.debug('SubscriptionSet', () => ({
	                messageType: 'object',
	                details: 'Create subscription set with parameters:',
	                message: Object.assign({ subscriptions: state.subscriptions }, (parameters.options ? parameters.options : {})),
	            }));
	        }
	        else {
	            state = parameters.state;
	            state.client.logger.debug('SubscriptionSet', 'Create subscription set clone');
	        }
	        super(state);
	        this.state.storeClone(this.id, this);
	        // Update a parent sets list for original set subscriptions.
	        state.subscriptions.forEach((subscription) => subscription.addParentSet(this));
	    }
	    /**
	     * Get a {@link SubscriptionSet} object state.
	     *
	     * @returns: {@link SubscriptionSet} object state.
	     *
	     * @internal
	     */
	    get state() {
	        return super.state;
	    }
	    /**
	     * Get a list of entities' subscription objects registered in a subscription set.
	     *
	     * @returns Entities' subscription objects list.
	     */
	    get subscriptions() {
	        return this.state.subscriptions.slice(0);
	    }
	    // --------------------------------------------------------
	    // -------------------- Event handler ---------------------
	    // --------------------------------------------------------
	    // region Event handler
	    /**
	     * Dispatch received a real-time update.
	     *
	     * @param cursor - A time cursor for the next portion of events.
	     * @param event - A real-time event from multiplexed subscription.
	     *
	     * @return `true` if receiver has consumed event.
	     *
	     * @internal
	     */
	    handleEvent(cursor, event) {
	        var _a;
	        // Check whether an event is not designated for this subscription set.
	        if (!this.state.subscriptionInput.contains((_a = event.data.subscription) !== null && _a !== void 0 ? _a : event.data.channel))
	            return;
	        // Check whether `event` can be processed or not.
	        if (!this.state._isSubscribed) {
	            this.state.client.logger.trace(this.subscriptionType, `Subscription set ${this.id} is not subscribed. Ignoring event.`);
	            return;
	        }
	        super.handleEvent(cursor, event);
	        if (this.state.subscriptions.length > 0) {
	            this.state.client.logger.trace(this.subscriptionType, `Notify ${this.id} subscription set subscriptions (count: ${this.state.subscriptions.length}) about received event.`);
	        }
	        this.state.subscriptions.forEach((subscription) => subscription.handleEvent(cursor, event));
	    }
	    // endregion
	    /**
	     User-provided subscription input associated with this {@link SubscriptionSet} object.
	     *
	     * @param forUnsubscribe - Whether list subscription input created for unsubscription (means entity should be free).
	     *
	     * @returns Subscription input object.
	     *
	     * @internal
	     */
	    subscriptionInput(forUnsubscribe = false) {
	        let subscriptionInput = this.state.subscriptionInput;
	        this.state.subscriptions.forEach((subscription) => {
	            if (forUnsubscribe && subscription.state.entity.subscriptionsCount > 0)
	                subscriptionInput = subscriptionInput.without(subscription.state.subscriptionInput);
	        });
	        return subscriptionInput;
	    }
	    /**
	     * Make a bare copy of the {@link SubscriptionSet} object.
	     *
	     * Copy won't have any type-specific listeners or added listener objects but will have the same internal state as
	     * the source object.
	     *
	     * @returns Bare copy of a {@link SubscriptionSet} object.
	     */
	    cloneEmpty() {
	        return new SubscriptionSet({ state: this.state });
	    }
	    /**
	     * Graceful {@link SubscriptionSet} destruction.
	     *
	     * This is an instance destructor, which will properly deinitialize it:
	     * - remove and unset all listeners,
	     * - try to unsubscribe (if subscribed and there are no more instances interested in the same data stream).
	     *
	     * **Note:** Disposed instance won't call the dispatcher to deliver updates to the listeners.
	     */
	    dispose() {
	        const isLastClone = this.state.isLastClone;
	        this.state.subscriptions.forEach((subscription) => {
	            subscription.removeParentSet(this);
	            if (isLastClone)
	                subscription.state.removeParentState(this.state);
	        });
	        super.dispose();
	    }
	    /**
	     * Invalidate {@link SubscriptionSet} object.
	     *
	     * Clean up resources used by a subscription object. All {@link SubscriptionObject subscription} objects will be
	     * removed.
	     *
	     * **Important:** This method is used only when a global subscription set is used (backward compatibility).
	     *
	     * **Note:** An invalidated instance won't call the dispatcher to deliver updates to the listeners.
	     *
	     * @param forDestroy - Whether subscription object invalidated as part of PubNub client destroy process or not.
	     *
	     * @internal
	     */
	    invalidate(forDestroy = false) {
	        const subscriptions = forDestroy ? this.state.subscriptions.slice(0) : this.state.subscriptions;
	        subscriptions.forEach((subscription) => {
	            if (forDestroy) {
	                subscription.state.entity.decreaseSubscriptionCount(this.state.id);
	                subscription.removeParentSet(this);
	            }
	            subscription.invalidate(forDestroy);
	        });
	        if (forDestroy)
	            this.state.removeAllSubscriptions();
	        super.invalidate();
	    }
	    /**
	     * Add an entity's subscription to the subscription set.
	     *
	     * **Important:** Changes will be effective immediately if {@link SubscriptionSet} already subscribed.
	     *
	     * @param subscription - Another entity's subscription object, which should be added.
	     */
	    addSubscription(subscription) {
	        this.addSubscriptions([subscription]);
	    }
	    /**
	     * Add an entity's subscriptions to the subscription set.
	     *
	     * **Important:** Changes will be effective immediately if {@link SubscriptionSet} already subscribed.
	     *
	     * @param subscriptions - List of entity's subscription objects, which should be added.
	     */
	    addSubscriptions(subscriptions) {
	        const inactiveSubscriptions = [];
	        const activeSubscriptions = [];
	        this.state.client.logger.debug(this.subscriptionType, () => {
	            const ignoredSubscriptions = [];
	            const subscriptionsToAdd = [];
	            subscriptions.forEach((subscription) => {
	                if (!this.state.subscriptions.includes(subscription))
	                    subscriptionsToAdd.push(subscription);
	                else
	                    ignoredSubscriptions.push(subscription);
	            });
	            return {
	                messageType: 'object',
	                details: `Add subscriptions to ${this.id} (subscriptions count: ${this.state.subscriptions.length + subscriptionsToAdd.length}):`,
	                message: { addedSubscriptions: subscriptionsToAdd, ignoredSubscriptions },
	            };
	        });
	        subscriptions
	            .filter((subscription) => !this.state.subscriptions.includes(subscription))
	            .forEach((subscription) => {
	            if (subscription.state.isSubscribed)
	                activeSubscriptions.push(subscription);
	            else
	                inactiveSubscriptions.push(subscription);
	            subscription.addParentSet(this);
	            this.state.addSubscription(subscription);
	        });
	        // Check whether there are any subscriptions for which the subscription loop should be changed or not.
	        if ((activeSubscriptions.length === 0 && inactiveSubscriptions.length === 0) || !this.state.isSubscribed)
	            return;
	        activeSubscriptions.forEach(({ state }) => state.entity.increaseSubscriptionCount(this.state.id));
	        if (inactiveSubscriptions.length > 0)
	            this.updateSubscription({ subscribing: true, subscriptions: inactiveSubscriptions });
	    }
	    /**
	     * Remove an entity's subscription object from the set.
	     *
	     * **Important:** Changes will be effective immediately if {@link SubscriptionSet} already subscribed.
	     *
	     * @param subscription - Another entity's subscription object, which should be removed.
	     */
	    removeSubscription(subscription) {
	        this.removeSubscriptions([subscription]);
	    }
	    /**
	     * Remove an entity's subscription objects from the set.
	     *
	     * **Important:** Changes will be effective immediately if {@link SubscriptionSet} already subscribed.
	     *
	     * @param subscriptions - List entity's subscription objects, which should be removed.
	     */
	    removeSubscriptions(subscriptions) {
	        const activeSubscriptions = [];
	        this.state.client.logger.debug(this.subscriptionType, () => {
	            const ignoredSubscriptions = [];
	            const subscriptionsToRemove = [];
	            subscriptions.forEach((subscription) => {
	                if (this.state.subscriptions.includes(subscription))
	                    subscriptionsToRemove.push(subscription);
	                else
	                    ignoredSubscriptions.push(subscription);
	            });
	            return {
	                messageType: 'object',
	                details: `Remove subscriptions from ${this.id} (subscriptions count: ${this.state.subscriptions.length}):`,
	                message: { removedSubscriptions: subscriptionsToRemove, ignoredSubscriptions },
	            };
	        });
	        subscriptions
	            .filter((subscription) => this.state.subscriptions.includes(subscription))
	            .forEach((subscription) => {
	            if (subscription.state.isSubscribed)
	                activeSubscriptions.push(subscription);
	            subscription.removeParentSet(this);
	            this.state.removeSubscription(subscription, subscription.parentSetsCount > 1);
	        });
	        // Check whether there are any subscriptions for which the subscription loop should be changed or not.
	        if (activeSubscriptions.length === 0 || !this.state.isSubscribed)
	            return;
	        this.updateSubscription({ subscribing: false, subscriptions: activeSubscriptions });
	    }
	    /**
	     * Merge with another {@link SubscriptionSet} object.
	     *
	     * **Important:** Changes will be effective immediately if {@link SubscriptionSet} already subscribed.
	     *
	     * @param subscriptionSet - Other entities' subscription set, which should be joined.
	     */
	    addSubscriptionSet(subscriptionSet) {
	        this.addSubscriptions(subscriptionSet.subscriptions);
	    }
	    /**
	     * Subtract another {@link SubscriptionSet} object.
	     *
	     * **Important:** Changes will be effective immediately if {@link SubscriptionSet} already subscribed.
	     *
	     * @param subscriptionSet - Other entities' subscription set, which should be subtracted.
	     */
	    removeSubscriptionSet(subscriptionSet) {
	        this.removeSubscriptions(subscriptionSet.subscriptions);
	    }
	    /**
	     * Register {@link SubscriptionSet} object for real-time events' retrieval.
	     *
	     * @param parameters - Object registration parameters.
	     * @param [parameters.cursor] - Subscription real-time events catch-up cursor.
	     * @param [parameters.subscriptions] - List of subscription objects which should be registered (in case of partial
	     * modification).
	     *
	     * @internal
	     */
	    register(parameters) {
	        var _a;
	        const subscriptions = ((_a = parameters.subscriptions) !== null && _a !== void 0 ? _a : this.state.subscriptions);
	        subscriptions.forEach(({ state }) => state.entity.increaseSubscriptionCount(this.state.id));
	        this.state.client.logger.trace(this.subscriptionType, () => ({
	            messageType: 'text',
	            message: `Register subscription for real-time events: ${this}`,
	        }));
	        this.state.client.registerEventHandleCapable(this, parameters.cursor, subscriptions);
	    }
	    /**
	     * Unregister {@link SubscriptionSet} object from real-time events' retrieval.
	     *
	     * @param [subscriptions] - List of subscription objects which should be unregistered (in case of partial
	     * modification).
	     *
	     * @internal
	     */
	    unregister(subscriptions) {
	        const activeSubscriptions = (subscriptions !== null && subscriptions !== void 0 ? subscriptions : this.state.subscriptions);
	        activeSubscriptions.forEach(({ state }) => state.entity.decreaseSubscriptionCount(this.state.id));
	        this.state.client.logger.trace(this.subscriptionType, () => ({
	            messageType: 'text',
	            message: `Unregister subscription from real-time events: ${this}`,
	        }));
	        this.state.client.unregisterEventHandleCapable(this, activeSubscriptions);
	    }
	    /**
	     * Stringify subscription object.
	     *
	     * @returns Serialized subscription object.
	     */
	    toString() {
	        const state = this.state;
	        return `${this.subscriptionType} { id: ${this.id}, stateId: ${state.id}, clonesCount: ${Object.keys(this.state.clones).length}, isSubscribed: ${state.isSubscribed}, subscriptions: [${state.subscriptions
            .map((sub) => sub.toString())
            .join(', ')}] }`;
	    }
	}

	/**
	 * {@link Subscription} state object.
	 *
	 * State object used across multiple {@link Subscription} object clones.
	 *
	 * @internal
	 */
	class SubscriptionState extends SubscriptionBaseState {
	    /**
	     * Create a subscription state object.
	     *
	     * @param parameters - State configuration options
	     * @param parameters.client - PubNub client which will work with a subscription object.
	     * @param parameters.entity - Entity for which a subscription object has been created.
	     * @param [parameters.options] - Subscription behavior options.
	     */
	    constructor(parameters) {
	        var _a, _b;
	        const names = parameters.entity.subscriptionNames((_b = (_a = parameters.options) === null || _a === void 0 ? void 0 : _a.receivePresenceEvents) !== null && _b !== void 0 ? _b : false);
	        const subscriptionInput = new SubscriptionInput({
	            [parameters.entity.subscriptionType == SubscriptionType.Channel ? 'channels' : 'channelGroups']: names,
	        });
	        super(parameters.client, subscriptionInput, parameters.options, parameters.client.subscriptionTimetoken);
	        this.entity = parameters.entity;
	    }
	}
	/**
	 * Single-entity subscription object which can be used to receive and handle real-time updates.
	 */
	class Subscription extends SubscriptionBase {
	    /**
	     * Create a subscribing capable object for entity.
	     *
	     * @param parameters - Subscription object configuration.
	     *
	     * @internal
	     */
	    constructor(parameters) {
	        if ('client' in parameters) {
	            parameters.client.logger.debug('Subscription', () => ({
	                messageType: 'object',
	                details: 'Create subscription with parameters:',
	                message: Object.assign({ entity: parameters.entity }, (parameters.options ? parameters.options : {})),
	            }));
	        }
	        else
	            parameters.state.client.logger.debug('Subscription', 'Create subscription clone');
	        super('state' in parameters ? parameters.state : new SubscriptionState(parameters));
	        /**
	         * List of subscription {@link SubscriptionSet sets} which contains {@link Subscription subscription}.
	         *
	         * List if used to track usage of a specific {@link Subscription subscription} in other subscription
	         * {@link SubscriptionSet sets}.
	         *
	         * **Important:** Tracking is required to prevent cloned instance dispose if there are sets that still use it.
	         *
	         * @internal
	         */
	        this.parents = [];
	        /**
	         * List of fingerprints from updates which has been handled already.
	         *
	         * **Important:** Tracking is required to avoid repetitive call of the subscription object's listener when the object
	         * is part of multiple subscribed sets. Handler will be called once, and then the fingerprint will be stored in this
	         * list to avoid another listener call for it.
	         *
	         * @internal
	         */
	        this.handledUpdates = [];
	        this.state.storeClone(this.id, this);
	    }
	    /**
	     * Get a {@link Subscription} object state.
	     *
	     * @returns: {@link Subscription} object state.
	     *
	     * @internal
	     */
	    get state() {
	        return super.state;
	    }
	    /**
	     * Get number of {@link SubscriptionSet} which use this subscription object.
	     *
	     * @returns Number of {@link SubscriptionSet} which use this subscription object.
	     *
	     * @internal
	     */
	    get parentSetsCount() {
	        return this.parents.length;
	    }
	    // --------------------------------------------------------
	    // -------------------- Event handler ---------------------
	    // --------------------------------------------------------
	    // region Event handler
	    /**
	     * Dispatch received a real-time update.
	     *
	     * @param cursor - A time cursor for the next portion of events.
	     * @param event - A real-time event from multiplexed subscription.
	     *
	     * @return `true` if receiver has consumed event.
	     *
	     * @internal
	     */
	    handleEvent(cursor, event) {
	        var _a;
	        if (!this.state.isSubscribed)
	            return;
	        if (this.parentSetsCount > 0) {
	            // Creating from whole payload (not only for published messages).
	            const fingerprint = messageFingerprint(event.data);
	            if (this.handledUpdates.includes(fingerprint)) {
	                this.state.client.logger.trace(this.subscriptionType, `Message (${fingerprint}) already handled. Ignoring.`);
	                return;
	            }
	            // Update a list of tracked messages and shrink it if too big.
	            this.handledUpdates.push(fingerprint);
	            if (this.handledUpdates.length > 10)
	                this.handledUpdates.shift();
	        }
	        // Check whether an event is not designated for this subscription set.
	        if (!this.state.subscriptionInput.contains((_a = event.data.subscription) !== null && _a !== void 0 ? _a : event.data.channel))
	            return;
	        super.handleEvent(cursor, event);
	    }
	    // endregion
	    /**
	     * User-provided subscription input associated with this {@link Subscription} object.
	     *
	     * @param forUnsubscribe - Whether list subscription input created for unsubscription (means entity should be free).
	     *
	     * @returns Subscription input object.
	     *
	     * @internal
	     */
	    subscriptionInput(forUnsubscribe = false) {
	        if (forUnsubscribe && this.state.entity.subscriptionsCount > 0)
	            return new SubscriptionInput({});
	        return this.state.subscriptionInput;
	    }
	    /**
	     * Make a bare copy of the {@link Subscription} object.
	     *
	     * Copy won't have any type-specific listeners or added listener objects but will have the same internal state as
	     * the source object.
	     *
	     * @returns Bare copy of a {@link Subscription} object.
	     */
	    cloneEmpty() {
	        return new Subscription({ state: this.state });
	    }
	    /**
	     * Graceful {@link Subscription} object destruction.
	     *
	     * This is an instance destructor, which will properly deinitialize it:
	     * - remove and unset all listeners,
	     * - try to unsubscribe (if subscribed and there are no more instances interested in the same data stream).
	     *
	     * **Important:** {@link Subscription#dispose dispose} won't have any effect if a subscription object is part of
	     * {@link SubscriptionSet set}. To gracefully dispose an object, it should be removed from the set using
	     * {@link SubscriptionSet#removeSubscription removeSubscription} (in this case call of
	     * {@link Subscription#dispose dispose} not required).
	     *
	     * **Note:** Disposed instance won't call the dispatcher to deliver updates to the listeners.
	     */
	    dispose() {
	        if (this.parentSetsCount > 0) {
	            this.state.client.logger.debug(this.subscriptionType, () => ({
	                messageType: 'text',
	                message: `'${this.state.entity.subscriptionNames()}' subscription still in use. Ignore dispose request.`,
	            }));
	            return;
	        }
	        this.handledUpdates.splice(0, this.handledUpdates.length);
	        super.dispose();
	    }
	    /**
	     * Invalidate subscription object.
	     *
	     * Clean up resources used by a subscription object.
	     *
	     * **Note:** An invalidated instance won't call the dispatcher to deliver updates to the listeners.
	     *
	     * @param forDestroy - Whether subscription object invalidated as part of PubNub client destroy process or not.
	     *
	     * @internal
	     */
	    invalidate(forDestroy = false) {
	        if (forDestroy)
	            this.state.entity.decreaseSubscriptionCount(this.state.id);
	        this.handledUpdates.splice(0, this.handledUpdates.length);
	        super.invalidate(forDestroy);
	    }
	    /**
	     * Add another {@link SubscriptionSet} into which subscription has been added.
	     *
	     * @param parent - {@link SubscriptionSet} which has been modified.
	     *
	     * @internal
	     */
	    addParentSet(parent) {
	        if (!this.parents.includes(parent)) {
	            this.parents.push(parent);
	            this.state.client.logger.trace(this.subscriptionType, `Add parent subscription set for ${this.id}: ${parent.id}. Parent subscription set count: ${this.parentSetsCount}`);
	        }
	    }
	    /**
	     * Remove {@link SubscriptionSet} upon subscription removal from it.
	     *
	     * @param parent - {@link SubscriptionSet} which has been modified.
	     *
	     * @internal
	     */
	    removeParentSet(parent) {
	        const parentIndex = this.parents.indexOf(parent);
	        if (parentIndex !== -1) {
	            this.parents.splice(parentIndex, 1);
	            this.state.client.logger.trace(this.subscriptionType, `Remove parent subscription set from ${this.id}: ${parent.id}. Parent subscription set count: ${this.parentSetsCount}`);
	        }
	        if (this.parentSetsCount === 0)
	            this.handledUpdates.splice(0, this.handledUpdates.length);
	    }
	    /**
	     * Merge entities' subscription objects into {@link SubscriptionSet}.
	     *
	     * @param subscription - Another entity's subscription object to be merged with receiver.
	     *
	     * @return {@link SubscriptionSet} which contains both receiver and other entities' subscription objects.
	     */
	    addSubscription(subscription) {
	        this.state.client.logger.debug(this.subscriptionType, () => ({
	            messageType: 'text',
	            message: `Create set with subscription: ${subscription}`,
	        }));
	        const subscriptionSet = new SubscriptionSet({
	            client: this.state.client,
	            subscriptions: [this, subscription],
	            options: this.state.options,
	        });
	        // Check whether a source subscription is already subscribed or not.
	        if (!this.state.isSubscribed && !subscription.state.isSubscribed)
	            return subscriptionSet;
	        this.state.client.logger.trace(this.subscriptionType, 'Subscribe resulting set because the receiver is already subscribed.');
	        // Subscribing resulting subscription set because source subscription was subscribed.
	        subscriptionSet.subscribe();
	        return subscriptionSet;
	    }
	    /**
	     * Register {@link Subscription} object for real-time events' retrieval.
	     *
	     * **Note:** Superclass calls this method only in response to a {@link Subscription.subscribe subscribe} method call.
	     *
	     * @param parameters - Object registration parameters.
	     * @param [parameters.cursor] - Subscription real-time events catch-up cursor.
	     * @param [parameters.subscriptions] - List of subscription objects which should be registered (in case of partial
	     * modification).
	     *
	     * @internal
	     */
	    register(parameters) {
	        this.state.entity.increaseSubscriptionCount(this.state.id);
	        this.state.client.logger.trace(this.subscriptionType, () => ({
	            messageType: 'text',
	            message: `Register subscription for real-time events: ${this}`,
	        }));
	        this.state.client.registerEventHandleCapable(this, parameters.cursor);
	    }
	    /**
	     * Unregister {@link Subscription} object from real-time events' retrieval.
	     *
	     * **Note:** Superclass calls this method only in response to a {@link Subscription.unsubscribe unsubscribe} method
	     * call.
	     *
	     * @param [_subscriptions] - List of subscription objects which should be unregistered (in case of partial
	     * modification).
	     *
	     * @internal
	     */
	    unregister(_subscriptions) {
	        this.state.entity.decreaseSubscriptionCount(this.state.id);
	        this.state.client.logger.trace(this.subscriptionType, () => ({
	            messageType: 'text',
	            message: `Unregister subscription from real-time events: ${this}`,
	        }));
	        this.handledUpdates.splice(0, this.handledUpdates.length);
	        this.state.client.unregisterEventHandleCapable(this);
	    }
	    /**
	     * Stringify subscription object.
	     *
	     * @returns Serialized subscription object.
	     */
	    toString() {
	        const state = this.state;
	        return `${this.subscriptionType} { id: ${this.id}, stateId: ${state.id}, entity: ${state.entity
            .subscriptionNames(false)
            .pop()}, clonesCount: ${Object.keys(state.clones).length}, isSubscribed: ${state.isSubscribed}, parentSetsCount: ${this.parentSetsCount}, cursor: ${state.cursor ? state.cursor.timetoken : 'not set'}, referenceTimetoken: ${state.referenceTimetoken ? state.referenceTimetoken : 'not set'} }`;
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
	            return { state: this.deserializeResponse(response).payload };
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
	        super({ cancellable: true });
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
	        const _super = Object.create(null, {
	            parse: { get: () => super.parse }
	        });
	        return __awaiter(this, void 0, void 0, function* () {
	            return _super.parse.call(this, response).then((_) => ({}));
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
	        const _super = Object.create(null, {
	            parse: { get: () => super.parse }
	        });
	        return __awaiter(this, void 0, void 0, function* () {
	            return _super.parse.call(this, response).then((_) => ({}));
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
	            // Extract general presence information.
	            const totalChannels = 'occupancy' in serviceResponse ? 1 : serviceResponse.payload.total_channels;
	            const totalOccupancy = 'occupancy' in serviceResponse ? serviceResponse.occupancy : serviceResponse.payload.total_occupancy;
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
	        const _super = Object.create(null, {
	            parse: { get: () => super.parse }
	        });
	        return __awaiter(this, void 0, void 0, function* () {
	            return _super.parse.call(this, response).then((_) => ({}));
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
	            return { channels: this.deserializeResponse(response).channels };
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
	        const _super = Object.create(null, {
	            parse: { get: () => super.parse }
	        });
	        return __awaiter(this, void 0, void 0, function* () {
	            return _super.parse.call(this, response).then(({ data }) => ({ data }));
	        });
	    }
	    get path() {
	        const { keySet: { subscribeKey }, channel, messageTimetoken, } = this.parameters;
	        return `/v1/message-actions/${subscribeKey}/channel/${encodeString(channel)}/message/${messageTimetoken}`;
	    }
	    get headers() {
	        var _a;
	        return Object.assign(Object.assign({}, ((_a = super.headers) !== null && _a !== void 0 ? _a : {})), { 'Content-Type': 'application/json' });
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
	        const _super = Object.create(null, {
	            parse: { get: () => super.parse }
	        });
	        return __awaiter(this, void 0, void 0, function* () {
	            return _super.parse.call(this, response).then(({ data }) => ({ data }));
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
	            return { timetoken: this.deserializeResponse(response)[2] };
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
	        var _a;
	        return Object.assign(Object.assign({}, ((_a = super.headers) !== null && _a !== void 0 ? _a : {})), { 'Content-Type': 'application/json' });
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

	/**
	 * Common entity interface.
	 */
	class Entity {
	    /**
	     * Create an entity instance.
	     *
	     * @param nameOrId - Identifier which will be used with subscription loop.
	     * @param client - PubNub instance which has been used to create this entity.
	     *
	     * @internal
	     */
	    constructor(nameOrId, client) {
	        /**
	         * List of subscription state object IDs which are using this entity.
	         *
	         * @internal
	         */
	        this.subscriptionStateIds = [];
	        this.client = client;
	        this._nameOrId = nameOrId;
	    }
	    /**
	     * Retrieve entity type.
	     *
	     * There is four types:
	     * - Channel
	     * - ChannelGroups
	     * - ChannelMetadata
	     * - UserMetadata
	     *
	     * @return One of known entity types.
	     *
	     * @internal
	     */
	    get entityType() {
	        return 'Channel';
	    }
	    /**
	     * Type of subscription entity.
	     *
	     * Type defines where it will be used with multiplexed subscribe REST API calls.
	     *
	     * @retuerns One of {@link SubscriptionType} enum fields.
	     *
	     * @internal
	     */
	    get subscriptionType() {
	        return SubscriptionType.Channel;
	    }
	    /**
	     * Names for an object to be used in subscription.
	     *
	     * Provided strings will be used with multiplexed subscribe REST API calls.
	     *
	     * @param receivePresenceEvents - Whether presence events should be observed or not.
	     *
	     * @returns List of names with multiplexed subscribe REST API calls (may include additional names to receive presence
	     * updates).
	     *
	     * @internal
	     */
	    subscriptionNames(receivePresenceEvents) {
	        {
	            return [
	                this._nameOrId,
	                ...(receivePresenceEvents && !this._nameOrId.endsWith('-pnpres') ? [`${this._nameOrId}-pnpres`] : []),
	            ];
	        }
	    }
	    /**
	     * Create a subscribable's subscription object for real-time updates.
	     *
	     * Create a subscription object which can be used to subscribe to the real-time updates sent to the specific data
	     * stream.
	     *
	     * @param [subscriptionOptions] - Subscription object behavior customization options.
	     *
	     * @returns Configured and ready to use subscribable's subscription object.
	     */
	    subscription(subscriptionOptions) {
	        {
	            return new Subscription({
	                client: this.client,
	                entity: this,
	                options: subscriptionOptions,
	            });
	        }
	    }
	    /**
	     * How many active subscriptions use this entity.
	     *
	     * @internal
	     */
	    get subscriptionsCount() {
	        return this.subscriptionStateIds.length;
	    }
	    /**
	     * Increase the number of active subscriptions.
	     *
	     * @param subscriptionStateId - Unique identifier of the subscription state object which doesn't use entity anymore.
	     *
	     * @internal
	     */
	    increaseSubscriptionCount(subscriptionStateId) {
	        {
	            if (!this.subscriptionStateIds.includes(subscriptionStateId))
	                this.subscriptionStateIds.push(subscriptionStateId);
	        }
	    }
	    /**
	     * Decrease the number of active subscriptions.
	     *
	     * **Note:** As long as the entity is used by at least one subscription, it can't be removed from the subscription.
	     *
	     * @param subscriptionStateId - Unique identifier of the subscription state object which doesn't use entity anymore.
	     *
	     * @internal
	     */
	    decreaseSubscriptionCount(subscriptionStateId) {
	        {
	            const index = this.subscriptionStateIds.indexOf(subscriptionStateId);
	            if (index >= 0)
	                this.subscriptionStateIds.splice(index, 1);
	        }
	    }
	    /**
	     * Stringify entity object.
	     *
	     * @returns Serialized entity object.
	     */
	    toString() {
	        return `${this.entityType} { nameOrId: ${this._nameOrId}, subscriptionsCount: ${this.subscriptionsCount} }`;
	    }
	}

	/**
	 * First-class objects which provides access to the channel app context object-specific APIs.
	 */
	class ChannelMetadata extends Entity {
	    /**
	     * Retrieve entity type.
	     *
	     * There is four types:
	     * - Channel
	     * - ChannelGroups
	     * - ChannelMetadata
	     * - UserMetadata
	     *
	     * @return One of known entity types.
	     *
	     * @internal
	     */
	    get entityType() {
	        return 'ChannelMetadata';
	    }
	    /**
	     * Get unique channel metadata object identifier.
	     *
	     * @returns Channel metadata identifier.
	     */
	    get id() {
	        return this._nameOrId;
	    }
	    /**
	     * Names for an object to be used in subscription.
	     *
	     * Provided strings will be used with multiplexed subscribe REST API calls.
	     *
	     * @param _receivePresenceEvents - Whether presence events should be observed or not.
	     *
	     * @returns List of names with multiplexed subscribe REST API calls (may include additional names to receive presence
	     * updates).
	     *
	     * @internal
	     */
	    subscriptionNames(_receivePresenceEvents) {
	        return [this.id];
	    }
	}

	/**
	 * First-class objects which provides access to the channel group-specific APIs.
	 */
	class ChannelGroup extends Entity {
	    /**
	     * Retrieve entity type.
	     *
	     * There is four types:
	     * - Channel
	     * - ChannelGroups
	     * - ChannelMetadata
	     * - UserMetadata
	     *
	     * @return One of known entity types.
	     *
	     * @internal
	     */
	    get entityType() {
	        return 'ChannelGroups';
	    }
	    /**
	     * Get a unique channel group name.
	     *
	     * @returns Channel group name.
	     */
	    get name() {
	        return this._nameOrId;
	    }
	    /**
	     * Type of subscription entity.
	     *
	     * Type defines where it will be used with multiplexed subscribe REST API calls.
	     *
	     * @retuerns One of {@link SubscriptionType} enum fields.
	     *
	     * @internal
	     */
	    get subscriptionType() {
	        return SubscriptionType.ChannelGroup;
	    }
	}

	/**
	 * First-class objects which provides access to the user app context object-specific APIs.
	 */
	class UserMetadata extends Entity {
	    /**
	     * Retrieve entity type.
	     *
	     * There is four types:
	     * - Channel
	     * - ChannelGroups
	     * - ChannelMetadata
	     * - UserMetadata
	     *
	     * @return One of known entity types.
	     *
	     * @internal
	     */
	    get entityType() {
	        return 'UserMetadata';
	    }
	    /**
	     * Get unique user metadata object identifier.
	     *
	     * @returns User metadata identifier.
	     */
	    get id() {
	        return this._nameOrId;
	    }
	    /**
	     * Names for an object to be used in subscription.
	     *
	     * Provided strings will be used with multiplexed subscribe REST API calls.
	     *
	     * @param _receivePresenceEvents - Whether presence events should be observed or not.
	     *
	     * @returns List of names with multiplexed subscribe REST API calls (may include additional names to receive presence
	     * updates).
	     *
	     * @internal
	     */
	    subscriptionNames(_receivePresenceEvents) {
	        return [this.id];
	    }
	}

	/**
	 * First-class objects which provides access to the channel-specific APIs.
	 */
	class Channel extends Entity {
	    /**
	     * Retrieve entity type.
	     *
	     * There is four types:
	     * - Channel
	     * - ChannelGroups
	     * - ChannelMetadata
	     * - UserMetadata
	     *
	     * @return One of known entity types.
	     *
	     * @internal
	     */
	    get entityType() {
	        return 'Channel';
	    }
	    /**
	     * Get a unique channel name.
	     *
	     * @returns Channel name.
	     */
	    get name() {
	        return this._nameOrId;
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
	        const _super = Object.create(null, {
	            parse: { get: () => super.parse }
	        });
	        return __awaiter(this, void 0, void 0, function* () {
	            return _super.parse.call(this, response).then((_) => ({}));
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
	        const _super = Object.create(null, {
	            parse: { get: () => super.parse }
	        });
	        return __awaiter(this, void 0, void 0, function* () {
	            return _super.parse.call(this, response).then((_) => ({}));
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
	            return { channels: this.deserializeResponse(response).payload.channels };
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
	        const _super = Object.create(null, {
	            parse: { get: () => super.parse }
	        });
	        return __awaiter(this, void 0, void 0, function* () {
	            return _super.parse.call(this, response).then((_) => ({}));
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
	            return { groups: this.deserializeResponse(response).payload.groups };
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
	     * @param logger - Registered loggers' manager.
	     * @param keySet - PubNub account keys set which should be used for REST API calls.
	     * @param sendRequest - Function which should be used to send REST API calls.
	     *
	     * @internal
	     */
	    constructor(logger, keySet, 
	    /* eslint-disable  @typescript-eslint/no-explicit-any */
	    sendRequest) {
	        this.sendRequest = sendRequest;
	        this.logger = logger;
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
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: 'List channel group channels with parameters:',
	            }));
	            const request = new ListChannelGroupChannels(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            const logResponse = (response) => {
	                if (!response)
	                    return;
	                this.logger.info('PubNub', `List channel group channels success. Received ${response.channels.length} channels.`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status, response) => {
	                    logResponse(response);
	                    callback(status, response);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse(response);
	                return response;
	            });
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
	            this.logger.debug('PubNub', 'List all channel groups.');
	            const request = new ListChannelGroupsRequest({ keySet: this.keySet });
	            const logResponse = (response) => {
	                if (!response)
	                    return;
	                this.logger.info('PubNub', `List all channel groups success. Received ${response.groups.length} groups.`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status, response) => {
	                    logResponse(response);
	                    callback(status, response);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse(response);
	                return response;
	            });
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
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: 'Add channels to the channel group with parameters:',
	            }));
	            const request = new AddChannelGroupChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            const logResponse = () => {
	                this.logger.info('PubNub', `Add channels to the channel group success.`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status) => {
	                    if (!status.error)
	                        logResponse();
	                    callback(status);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse();
	                return response;
	            });
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
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: 'Remove channels from the channel group with parameters:',
	            }));
	            const request = new RemoveChannelGroupChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            const logResponse = () => {
	                this.logger.info('PubNub', `Remove channels from the channel group success.`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status) => {
	                    if (!status.error)
	                        logResponse();
	                    callback(status);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse();
	                return response;
	            });
	        });
	    }
	    /**
	     * Remove a channel group.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous remove channel group response or `void` in case if `callback` provided.
	     */
	    deleteGroup(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: 'Remove a channel group with parameters:',
	            }));
	            const request = new DeleteChannelGroupRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            const logResponse = () => {
	                this.logger.info('PubNub', `Remove a channel group success. Removed '${parameters.channelGroup}' channel group.'`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status) => {
	                    if (!status.error)
	                        logResponse();
	                    callback(status);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse();
	                return response;
	            });
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
	        const _super = Object.create(null, {
	            parse: { get: () => super.parse }
	        });
	        return __awaiter(this, void 0, void 0, function* () {
	            return _super.parse.call(this, response).then((_) => ({}));
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
	            return { channels: this.deserializeResponse(response) };
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
	        const _super = Object.create(null, {
	            parse: { get: () => super.parse }
	        });
	        return __awaiter(this, void 0, void 0, function* () {
	            return _super.parse.call(this, response).then((_) => ({}));
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
	        const _super = Object.create(null, {
	            parse: { get: () => super.parse }
	        });
	        return __awaiter(this, void 0, void 0, function* () {
	            return _super.parse.call(this, response).then((_) => ({}));
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
	     * @param logger - Registered loggers' manager.
	     * @param keySet - PubNub account keys set which should be used for REST API calls.
	     * @param sendRequest - Function which should be used to send REST API calls.
	     *
	     * @internal
	     */
	    constructor(logger, keySet, 
	    /* eslint-disable  @typescript-eslint/no-explicit-any */
	    sendRequest) {
	        this.sendRequest = sendRequest;
	        this.logger = logger;
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
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: `List push-enabled channels with parameters:`,
	            }));
	            const request = new ListDevicePushNotificationChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            const logResponse = (response) => {
	                if (!response)
	                    return;
	                this.logger.debug('PubNub', `List push-enabled channels success. Received ${response.channels.length} channels.`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status, response) => {
	                    logResponse(response);
	                    callback(status, response);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse(response);
	                return response;
	            });
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
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: `Add push-enabled channels with parameters:`,
	            }));
	            const request = new AddDevicePushNotificationChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            const logResponse = () => {
	                this.logger.debug('PubNub', `Add push-enabled channels success.`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status) => {
	                    if (!status.error)
	                        logResponse();
	                    callback(status);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse();
	                return response;
	            });
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
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: `Remove push-enabled channels with parameters:`,
	            }));
	            const request = new RemoveDevicePushNotificationChannelsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            const logResponse = () => {
	                this.logger.debug('PubNub', `Remove push-enabled channels success.`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status) => {
	                    if (!status.error)
	                        logResponse();
	                    callback(status);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse();
	                return response;
	            });
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
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: `Remove push notifications for device with parameters:`,
	            }));
	            const request = new RemoveDevicePushNotificationRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            const logResponse = () => {
	                this.logger.debug('PubNub', `Remove push notifications for device success.`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status) => {
	                    if (!status.error)
	                        logResponse();
	                    callback(status);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse();
	                return response;
	            });
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
	 * Whether membership's `status` field should be included in response or not.
	 */
	const INCLUDE_STATUS$3 = false;
	/**
	 * Whether membership's `type` field should be included in response or not.
	 */
	const INCLUDE_TYPE$3 = false;
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
	const INCLUDE_CHANNEL_STATUS_FIELD$1 = false;
	/**
	 * Whether `Channel` type field should be included in response or not.
	 */
	const INCLUDE_CHANNEL_TYPE_FIELD$1 = false;
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
	        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
	        var _l, _m, _o, _p, _q, _r, _s, _t;
	        super();
	        this.parameters = parameters;
	        // Apply default request parameters.
	        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
	        (_b = (_l = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_l.customFields = INCLUDE_CUSTOM_FIELDS$8);
	        (_c = (_m = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_m.totalCount = INCLUDE_TOTAL_COUNT$3);
	        (_d = (_o = parameters.include).statusField) !== null && _d !== void 0 ? _d : (_o.statusField = INCLUDE_STATUS$3);
	        (_e = (_p = parameters.include).typeField) !== null && _e !== void 0 ? _e : (_p.typeField = INCLUDE_TYPE$3);
	        (_f = (_q = parameters.include).channelFields) !== null && _f !== void 0 ? _f : (_q.channelFields = INCLUDE_CHANNEL_FIELDS$1);
	        (_g = (_r = parameters.include).customChannelFields) !== null && _g !== void 0 ? _g : (_r.customChannelFields = INCLUDE_CHANNEL_CUSTOM_FIELDS$1);
	        (_h = (_s = parameters.include).channelStatusField) !== null && _h !== void 0 ? _h : (_s.channelStatusField = INCLUDE_CHANNEL_STATUS_FIELD$1);
	        (_j = (_t = parameters.include).channelTypeField) !== null && _j !== void 0 ? _j : (_t.channelTypeField = INCLUDE_CHANNEL_TYPE_FIELD$1);
	        (_k = parameters.limit) !== null && _k !== void 0 ? _k : (parameters.limit = LIMIT$4);
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
	        if (include.typeField)
	            includeFlags.push('type');
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
	 * Whether membership's `status` field should be included in response or not.
	 */
	const INCLUDE_STATUS$2 = false;
	/**
	 * Whether membership's `type` field should be included in response or not.
	 */
	const INCLUDE_TYPE$2 = false;
	/**
	 * Whether total number of memberships should be included in response or not.
	 */
	const INCLUDE_TOTAL_COUNT$2 = false;
	/**
	 * Whether `Channel` fields should be included in response or not.
	 */
	const INCLUDE_CHANNEL_FIELDS = false;
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
	        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
	        var _l, _m, _o, _p, _q, _r, _s, _t;
	        super({ method: TransportMethod.PATCH });
	        this.parameters = parameters;
	        // Apply default request parameters.
	        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
	        (_b = (_l = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_l.customFields = INCLUDE_CUSTOM_FIELDS$7);
	        (_c = (_m = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_m.totalCount = INCLUDE_TOTAL_COUNT$2);
	        (_d = (_o = parameters.include).statusField) !== null && _d !== void 0 ? _d : (_o.statusField = INCLUDE_STATUS$2);
	        (_e = (_p = parameters.include).typeField) !== null && _e !== void 0 ? _e : (_p.typeField = INCLUDE_TYPE$2);
	        (_f = (_q = parameters.include).channelFields) !== null && _f !== void 0 ? _f : (_q.channelFields = INCLUDE_CHANNEL_FIELDS);
	        (_g = (_r = parameters.include).customChannelFields) !== null && _g !== void 0 ? _g : (_r.customChannelFields = INCLUDE_CHANNEL_CUSTOM_FIELDS);
	        (_h = (_s = parameters.include).channelStatusField) !== null && _h !== void 0 ? _h : (_s.channelStatusField = INCLUDE_CHANNEL_STATUS_FIELD);
	        (_j = (_t = parameters.include).channelTypeField) !== null && _j !== void 0 ? _j : (_t.channelTypeField = INCLUDE_CHANNEL_TYPE_FIELD);
	        (_k = parameters.limit) !== null && _k !== void 0 ? _k : (parameters.limit = LIMIT$3);
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
	        if (include.statusField)
	            includeFlags.push('status');
	        if (include.typeField)
	            includeFlags.push('type');
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
	    get headers() {
	        var _a;
	        return Object.assign(Object.assign({}, ((_a = super.headers) !== null && _a !== void 0 ? _a : {})), { 'Content-Type': 'application/json' });
	    }
	    get body() {
	        const { channels, type } = this.parameters;
	        return JSON.stringify({
	            [`${type}`]: channels.map((channel) => {
	                if (typeof channel === 'string') {
	                    return { channel: { id: channel } };
	                }
	                else {
	                    return { channel: { id: channel.id }, status: channel.status, type: channel.type, custom: channel.custom };
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
	    get headers() {
	        var _a;
	        let headers = (_a = super.headers) !== null && _a !== void 0 ? _a : {};
	        if (this.parameters.ifMatchesEtag)
	            headers = Object.assign(Object.assign({}, headers), { 'If-Match': this.parameters.ifMatchesEtag });
	        return Object.assign(Object.assign({}, headers), { 'Content-Type': 'application/json' });
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
	 * Whether member's `status` field should be included in response or not.
	 */
	const INCLUDE_STATUS$1 = false;
	/**
	 * Whether member's `type` field should be included in response or not.
	 */
	const INCLUDE_TYPE$1 = false;
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
	const INCLUDE_UUID_STATUS_FIELD$1 = false;
	/**
	 * Whether `UUID` type field should be included in response or not.
	 */
	const INCLUDE_UUID_TYPE_FIELD$1 = false;
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
	        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
	        var _l, _m, _o, _p, _q, _r, _s, _t;
	        super();
	        this.parameters = parameters;
	        // Apply default request parameters.
	        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
	        (_b = (_l = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_l.customFields = INCLUDE_CUSTOM_FIELDS$3);
	        (_c = (_m = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_m.totalCount = INCLUDE_TOTAL_COUNT$1);
	        (_d = (_o = parameters.include).statusField) !== null && _d !== void 0 ? _d : (_o.statusField = INCLUDE_STATUS$1);
	        (_e = (_p = parameters.include).typeField) !== null && _e !== void 0 ? _e : (_p.typeField = INCLUDE_TYPE$1);
	        (_f = (_q = parameters.include).UUIDFields) !== null && _f !== void 0 ? _f : (_q.UUIDFields = INCLUDE_UUID_FIELDS$1);
	        (_g = (_r = parameters.include).customUUIDFields) !== null && _g !== void 0 ? _g : (_r.customUUIDFields = INCLUDE_UUID_CUSTOM_FIELDS$1);
	        (_h = (_s = parameters.include).UUIDStatusField) !== null && _h !== void 0 ? _h : (_s.UUIDStatusField = INCLUDE_UUID_STATUS_FIELD$1);
	        (_j = (_t = parameters.include).UUIDTypeField) !== null && _j !== void 0 ? _j : (_t.UUIDTypeField = INCLUDE_UUID_TYPE_FIELD$1);
	        (_k = parameters.limit) !== null && _k !== void 0 ? _k : (parameters.limit = LIMIT$1);
	    }
	    operation() {
	        return RequestOperation$1.PNSetMembersOperation;
	    }
	    validate() {
	        if (!this.parameters.channel)
	            return 'Channel cannot be empty';
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
	        if (include.typeField)
	            includeFlags.push('type');
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
	 * Whether member's `status` field should be included in response or not.
	 */
	const INCLUDE_STATUS = false;
	/**
	 * Whether member's `type` field should be included in response or not.
	 */
	const INCLUDE_TYPE = false;
	/**
	 * Whether total number of members should be included in response or not.
	 */
	const INCLUDE_TOTAL_COUNT = false;
	/**
	 * Whether `UUID` fields should be included in response or not.
	 */
	const INCLUDE_UUID_FIELDS = false;
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
	        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
	        var _l, _m, _o, _p, _q, _r, _s, _t;
	        super({ method: TransportMethod.PATCH });
	        this.parameters = parameters;
	        // Apply default request parameters.
	        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
	        (_b = (_l = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_l.customFields = INCLUDE_CUSTOM_FIELDS$2);
	        (_c = (_m = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_m.totalCount = INCLUDE_TOTAL_COUNT);
	        (_d = (_o = parameters.include).statusField) !== null && _d !== void 0 ? _d : (_o.statusField = INCLUDE_STATUS);
	        (_e = (_p = parameters.include).typeField) !== null && _e !== void 0 ? _e : (_p.typeField = INCLUDE_TYPE);
	        (_f = (_q = parameters.include).UUIDFields) !== null && _f !== void 0 ? _f : (_q.UUIDFields = INCLUDE_UUID_FIELDS);
	        (_g = (_r = parameters.include).customUUIDFields) !== null && _g !== void 0 ? _g : (_r.customUUIDFields = INCLUDE_UUID_CUSTOM_FIELDS);
	        (_h = (_s = parameters.include).UUIDStatusField) !== null && _h !== void 0 ? _h : (_s.UUIDStatusField = INCLUDE_UUID_STATUS_FIELD);
	        (_j = (_t = parameters.include).UUIDTypeField) !== null && _j !== void 0 ? _j : (_t.UUIDTypeField = INCLUDE_UUID_TYPE_FIELD);
	        (_k = parameters.limit) !== null && _k !== void 0 ? _k : (parameters.limit = LIMIT);
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
	        if (include.statusField)
	            includeFlags.push('status');
	        if (include.typeField)
	            includeFlags.push('type');
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
	    get headers() {
	        var _a;
	        return Object.assign(Object.assign({}, ((_a = super.headers) !== null && _a !== void 0 ? _a : {})), { 'Content-Type': 'application/json' });
	    }
	    get body() {
	        const { uuids, type } = this.parameters;
	        return JSON.stringify({
	            [`${type}`]: uuids.map((uuid) => {
	                if (typeof uuid === 'string') {
	                    return { uuid: { id: uuid } };
	                }
	                else {
	                    return { uuid: { id: uuid.id }, status: uuid.status, type: uuid.type, custom: uuid.custom };
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
	    get headers() {
	        var _a;
	        let headers = (_a = super.headers) !== null && _a !== void 0 ? _a : {};
	        if (this.parameters.ifMatchesEtag)
	            headers = Object.assign(Object.assign({}, headers), { 'If-Match': this.parameters.ifMatchesEtag });
	        return Object.assign(Object.assign({}, headers), { 'Content-Type': 'application/json' });
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
	     * Get registered loggers' manager.
	     *
	     * @returns Registered loggers' manager.
	     *
	     * @internal
	     */
	    get logger() {
	        return this.configuration.logger();
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
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: !parametersOrCallback || typeof parametersOrCallback === 'function' ? {} : parametersOrCallback,
	                details: `Get all UUID metadata objects with parameters:`,
	            }));
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
	            const logResponse = (response) => {
	                if (!response)
	                    return;
	                this.logger.debug('PubNub', `Get all UUID metadata success. Received ${response.totalCount} UUID metadata objects.`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status, response) => {
	                    logResponse(response);
	                    callback(status, response);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse(response);
	                return response;
	            });
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
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: !parametersOrCallback || typeof parametersOrCallback === 'function'
	                    ? { uuid: this.configuration.userId }
	                    : parametersOrCallback,
	                details: `Get ${!parametersOrCallback || typeof parametersOrCallback === 'function' ? ' current' : ''} UUID metadata object with parameters:`,
	            }));
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
	            if (parameters.userId) {
	                this.logger.warn('PubNub', `'userId' parameter is deprecated. Use 'uuid' instead.`);
	                parameters.uuid = parameters.userId;
	            }
	            (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
	            const request = new GetUUIDMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            const logResponse = (response) => {
	                if (!response)
	                    return;
	                this.logger.debug('PubNub', `Get UUID metadata object success. Received '${parameters.uuid}' UUID metadata object.`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status, response) => {
	                    logResponse(response);
	                    callback(status, response);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse(response);
	                return response;
	            });
	        });
	    }
	    /**
	     * Update a specific UUID Metadata object.
	     *
	     * @param parameters - Request configuration parameters. Will set UUID metadata for currently
	     * configured PubNub client `uuid` if not set.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous set UUID metadata response or `void` in case if `callback` provided.
	     */
	    setUUIDMetadata(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: `Set UUID metadata object with parameters:`,
	            }));
	            return this._setUUIDMetadata(parameters, callback);
	        });
	    }
	    /**
	     * Update a specific UUID Metadata object.
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
	            if (parameters.userId) {
	                this.logger.warn('PubNub', `'userId' parameter is deprecated. Use 'uuid' instead.`);
	                parameters.uuid = parameters.userId;
	            }
	            (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
	            const request = new SetUUIDMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            const logResponse = (response) => {
	                if (!response)
	                    return;
	                this.logger.debug('PubNub', `Set UUID metadata object success. Updated '${parameters.uuid}' UUID metadata object.'`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status, response) => {
	                    logResponse(response);
	                    callback(status, response);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse(response);
	                return response;
	            });
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
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: !parametersOrCallback || typeof parametersOrCallback === 'function'
	                    ? { uuid: this.configuration.userId }
	                    : parametersOrCallback,
	                details: `Remove${!parametersOrCallback || typeof parametersOrCallback === 'function' ? ' current' : ''} UUID metadata object with parameters:`,
	            }));
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
	            if (parameters.userId) {
	                this.logger.warn('PubNub', `'userId' parameter is deprecated. Use 'uuid' instead.`);
	                parameters.uuid = parameters.userId;
	            }
	            (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
	            const request = new RemoveUUIDMetadataRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            const logResponse = (response) => {
	                if (!response)
	                    return;
	                this.logger.debug('PubNub', `Remove UUID metadata object success. Removed '${parameters.uuid}' UUID metadata object.`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status, response) => {
	                    logResponse(response);
	                    callback(status, response);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse(response);
	                return response;
	            });
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
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: !parametersOrCallback || typeof parametersOrCallback === 'function' ? {} : parametersOrCallback,
	                details: `Get all Channel metadata objects with parameters:`,
	            }));
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
	            const logResponse = (response) => {
	                if (!response)
	                    return;
	                this.logger.debug('PubNub', `Get all Channel metadata objects success. Received ${response.totalCount} Channel metadata objects.`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status, response) => {
	                    logResponse(response);
	                    callback(status, response);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse(response);
	                return response;
	            });
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
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: `Get Channel metadata object with parameters:`,
	            }));
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
	            const logResponse = (response) => {
	                if (!response)
	                    return;
	                this.logger.debug('PubNub', `Get Channel metadata object success. Received '${parameters.channel}' Channel metadata object.'`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status, response) => {
	                    logResponse(response);
	                    callback(status, response);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse(response);
	                return response;
	            });
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
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: `Set Channel metadata object with parameters:`,
	            }));
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
	            const logResponse = (response) => {
	                if (!response)
	                    return;
	                this.logger.debug('PubNub', `Set Channel metadata object success. Updated '${parameters.channel}' Channel metadata object.`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status, response) => {
	                    logResponse(response);
	                    callback(status, response);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse(response);
	                return response;
	            });
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
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: `Remove Channel metadata object with parameters:`,
	            }));
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
	            const logResponse = (response) => {
	                if (!response)
	                    return;
	                this.logger.debug('PubNub', `Remove Channel metadata object success. Removed '${parameters.channel}' Channel metadata object.`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status, response) => {
	                    logResponse(response);
	                    callback(status, response);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse(response);
	                return response;
	            });
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
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: `Get channel members with parameters:`,
	            }));
	            const request = new GetChannelMembersRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            const logResponse = (response) => {
	                if (!response)
	                    return;
	                this.logger.debug('PubNub', `Get channel members success. Received ${response.totalCount} channel members.`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status, response) => {
	                    logResponse(response);
	                    callback(status, response);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse(response);
	                return response;
	            });
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
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: `Set channel members with parameters:`,
	            }));
	            const request = new SetChannelMembersRequest(Object.assign(Object.assign({}, parameters), { type: 'set', keySet: this.keySet }));
	            const logResponse = (response) => {
	                if (!response)
	                    return;
	                this.logger.debug('PubNub', `Set channel members success. There are ${response.totalCount} channel members now.`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status, response) => {
	                    logResponse(response);
	                    callback(status, response);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse(response);
	                return response;
	            });
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
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: `Remove channel members with parameters:`,
	            }));
	            const request = new SetChannelMembersRequest(Object.assign(Object.assign({}, parameters), { type: 'delete', keySet: this.keySet }));
	            const logResponse = (response) => {
	                if (!response)
	                    return;
	                this.logger.debug('PubNub', `Remove channel members success. There are ${response.totalCount} channel members now.`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status, response) => {
	                    logResponse(response);
	                    callback(status, response);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse(response);
	                return response;
	            });
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
	            if (parameters.userId) {
	                this.logger.warn('PubNub', `'userId' parameter is deprecated. Use 'uuid' instead.`);
	                parameters.uuid = parameters.userId;
	            }
	            (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: `Get memberships with parameters:`,
	            }));
	            const request = new GetUUIDMembershipsRequest(Object.assign(Object.assign({}, parameters), { keySet: this.keySet }));
	            const logResponse = (response) => {
	                if (!response)
	                    return;
	                this.logger.debug('PubNub', `Get memberships success. Received ${response.totalCount} memberships.`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status, response) => {
	                    logResponse(response);
	                    callback(status, response);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse(response);
	                return response;
	            });
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
	            if (parameters.userId) {
	                this.logger.warn('PubNub', `'userId' parameter is deprecated. Use 'uuid' instead.`);
	                parameters.uuid = parameters.userId;
	            }
	            (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: `Set memberships with parameters:`,
	            }));
	            const request = new SetUUIDMembershipsRequest(Object.assign(Object.assign({}, parameters), { type: 'set', keySet: this.keySet }));
	            const logResponse = (response) => {
	                if (!response)
	                    return;
	                this.logger.debug('PubNub', `Set memberships success. There are ${response.totalCount} memberships now.`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status, response) => {
	                    logResponse(response);
	                    callback(status, response);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse(response);
	                return response;
	            });
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
	            if (parameters.userId) {
	                this.logger.warn('PubNub', `'userId' parameter is deprecated. Use 'uuid' instead.`);
	                parameters.uuid = parameters.userId;
	            }
	            (_a = parameters.uuid) !== null && _a !== void 0 ? _a : (parameters.uuid = this.configuration.userId);
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: `Remove memberships with parameters:`,
	            }));
	            const request = new SetUUIDMembershipsRequest(Object.assign(Object.assign({}, parameters), { type: 'delete', keySet: this.keySet }));
	            const logResponse = (response) => {
	                if (!response)
	                    return;
	                this.logger.debug('PubNub', `Remove memberships success. There are ${response.totalCount} memberships now.`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status, response) => {
	                    logResponse(response);
	                    callback(status, response);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse(response);
	                return response;
	            });
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
	     * @deprecated Use {@link PubNubObjects#getChannelMembers getChannelMembers} or
	     * {@link PubNubObjects#getMemberships getMemberships} methods instead.
	     */
	    fetchMemberships(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a, _b;
	            this.logger.warn('PubNub', "'fetchMemberships' is deprecated. Use 'pubnub.objects.getChannelMembers' or 'pubnub.objects.getMemberships'" +
	                ' instead.');
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: `Fetch memberships with parameters:`,
	            }));
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
	     * @deprecated Use {@link PubNubObjects#setChannelMembers setChannelMembers} or
	     * {@link PubNubObjects#setMemberships setMemberships} methods instead.
	     */
	    addMemberships(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a, _b, _c, _d, _e, _f;
	            this.logger.warn('PubNub', "'addMemberships' is deprecated. Use 'pubnub.objects.setChannelMembers' or 'pubnub.objects.setMemberships'" +
	                ' instead.');
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: `Add memberships with parameters:`,
	            }));
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
	            return { timetoken: this.deserializeResponse(response)[0] };
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
	        /**
	         * List of subscribe capable objects with active subscriptions.
	         *
	         * Track list of {@link Subscription} and {@link SubscriptionSet} objects with active
	         * subscription.
	         *
	         * @internal
	         */
	        this.eventHandleCapable = {};
	        /**
	         * Created entities.
	         *
	         * Map of entities which have been created to access.
	         *
	         * @internal
	         */
	        this.entities = {};
	        this._configuration = configuration.configuration;
	        this.cryptography = configuration.cryptography;
	        this.tokenManager = configuration.tokenManager;
	        this.transport = configuration.transport;
	        this.crypto = configuration.crypto;
	        this.logger.debug('PubNub', () => ({
	            messageType: 'object',
	            message: configuration.configuration,
	            details: 'Create with configuration:',
	            ignoredKeys(key, obj) {
	                return typeof obj[key] === 'function' || key.startsWith('_');
	            },
	        }));
	        // API group entry points initialization.
	        this._objects = new PubNubObjects(this._configuration, this.sendRequest.bind(this));
	        this._channelGroups = new PubNubChannelGroups(this._configuration.logger(), this._configuration.keySet, this.sendRequest.bind(this));
	        this._push = new PubNubPushNotifications(this._configuration.logger(), this._configuration.keySet, this.sendRequest.bind(this));
	        {
	            // Prepare for a real-time events announcement.
	            this.eventDispatcher = new EventDispatcher();
	            if (this._configuration.enableEventEngine) {
	                {
	                    this.logger.debug('PubNub', 'Using new subscription loop management.');
	                    let heartbeatInterval = this._configuration.getHeartbeatInterval();
	                    this.presenceState = {};
	                    {
	                        if (heartbeatInterval) {
	                            this.presenceEventEngine = new PresenceEventEngine({
	                                heartbeat: (parameters, callback) => {
	                                    this.logger.trace('PresenceEventEngine', () => ({
	                                        messageType: 'object',
	                                        message: Object.assign({}, parameters),
	                                        details: 'Heartbeat with parameters:',
	                                    }));
	                                    return this.heartbeat(parameters, callback);
	                                },
	                                leave: (parameters) => {
	                                    this.logger.trace('PresenceEventEngine', () => ({
	                                        messageType: 'object',
	                                        message: Object.assign({}, parameters),
	                                        details: 'Leave with parameters:',
	                                    }));
	                                    this.makeUnsubscribe(parameters, () => { });
	                                },
	                                heartbeatDelay: () => new Promise((resolve, reject) => {
	                                    heartbeatInterval = this._configuration.getHeartbeatInterval();
	                                    if (!heartbeatInterval)
	                                        reject(new PubNubError('Heartbeat interval has been reset.'));
	                                    else
	                                        setTimeout(resolve, heartbeatInterval * 1000);
	                                }),
	                                emitStatus: (status) => this.emitStatus(status),
	                                config: this._configuration,
	                                presenceState: this.presenceState,
	                            });
	                        }
	                    }
	                    this.eventEngine = new EventEngine({
	                        handshake: (parameters) => {
	                            this.logger.trace('EventEngine', () => ({
	                                messageType: 'object',
	                                message: Object.assign({}, parameters),
	                                details: 'Handshake with parameters:',
	                                ignoredKeys: ['abortSignal', 'crypto', 'timeout', 'keySet', 'getFileUrl'],
	                            }));
	                            return this.subscribeHandshake(parameters);
	                        },
	                        receiveMessages: (parameters) => {
	                            this.logger.trace('EventEngine', () => ({
	                                messageType: 'object',
	                                message: Object.assign({}, parameters),
	                                details: 'Receive messages with parameters:',
	                                ignoredKeys: ['abortSignal', 'crypto', 'timeout', 'keySet', 'getFileUrl'],
	                            }));
	                            return this.subscribeReceiveMessages(parameters);
	                        },
	                        delay: (amount) => new Promise((resolve) => setTimeout(resolve, amount)),
	                        join: (parameters) => {
	                            var _a, _b;
	                            this.logger.trace('EventEngine', () => ({
	                                messageType: 'object',
	                                message: Object.assign({}, parameters),
	                                details: 'Join with parameters:',
	                            }));
	                            if (parameters && ((_a = parameters.channels) !== null && _a !== void 0 ? _a : []).length === 0 && ((_b = parameters.groups) !== null && _b !== void 0 ? _b : []).length === 0) {
	                                this.logger.trace('EventEngine', "Ignoring 'join' announcement request.");
	                                return;
	                            }
	                            this.join(parameters);
	                        },
	                        leave: (parameters) => {
	                            var _a, _b;
	                            this.logger.trace('EventEngine', () => ({
	                                messageType: 'object',
	                                message: Object.assign({}, parameters),
	                                details: 'Leave with parameters:',
	                            }));
	                            if (parameters && ((_a = parameters.channels) !== null && _a !== void 0 ? _a : []).length === 0 && ((_b = parameters.groups) !== null && _b !== void 0 ? _b : []).length === 0) {
	                                this.logger.trace('EventEngine', "Ignoring 'leave' announcement request.");
	                                return;
	                            }
	                            this.leave(parameters);
	                        },
	                        leaveAll: (parameters) => {
	                            this.logger.trace('EventEngine', () => ({
	                                messageType: 'object',
	                                message: Object.assign({}, parameters),
	                                details: 'Leave all with parameters:',
	                            }));
	                            this.leaveAll(parameters);
	                        },
	                        presenceReconnect: (parameters) => {
	                            this.logger.trace('EventEngine', () => ({
	                                messageType: 'object',
	                                message: Object.assign({}, parameters),
	                                details: 'Reconnect with parameters:',
	                            }));
	                            this.presenceReconnect(parameters);
	                        },
	                        presenceDisconnect: (parameters) => {
	                            this.logger.trace('EventEngine', () => ({
	                                messageType: 'object',
	                                message: Object.assign({}, parameters),
	                                details: 'Disconnect with parameters:',
	                            }));
	                            this.presenceDisconnect(parameters);
	                        },
	                        presenceState: this.presenceState,
	                        config: this._configuration,
	                        emitMessages: (cursor, events) => {
	                            try {
	                                this.logger.debug('EventEngine', () => {
	                                    const hashedEvents = events.map((event) => {
	                                        const pn_mfp = event.type === PubNubEventType.Message || event.type === PubNubEventType.Signal
	                                            ? messageFingerprint(event.data.message)
	                                            : undefined;
	                                        return pn_mfp ? { type: event.type, data: Object.assign(Object.assign({}, event.data), { pn_mfp }) } : event;
	                                    });
	                                    return { messageType: 'object', message: hashedEvents, details: 'Received events:' };
	                                });
	                                events.forEach((event) => this.emitEvent(cursor, event));
	                            }
	                            catch (e) {
	                                const errorStatus = {
	                                    error: true,
	                                    category: StatusCategory$1.PNUnknownCategory,
	                                    errorData: e,
	                                    statusCode: 0,
	                                };
	                                this.emitStatus(errorStatus);
	                            }
	                        },
	                        emitStatus: (status) => this.emitStatus(status),
	                    });
	                }
	            }
	            else {
	                {
	                    this.logger.debug('PubNub', 'Using legacy subscription loop management.');
	                    this.subscriptionManager = new SubscriptionManager(this._configuration, (cursor, event) => {
	                        try {
	                            this.emitEvent(cursor, event);
	                        }
	                        catch (e) {
	                            const errorStatus = {
	                                error: true,
	                                category: StatusCategory$1.PNUnknownCategory,
	                                errorData: e,
	                                statusCode: 0,
	                            };
	                            this.emitStatus(errorStatus);
	                        }
	                    }, this.emitStatus.bind(this), (parameters, callback) => {
	                        this.logger.trace('SubscriptionManager', () => ({
	                            messageType: 'object',
	                            message: Object.assign({}, parameters),
	                            details: 'Subscribe with parameters:',
	                            ignoredKeys: ['crypto', 'timeout', 'keySet', 'getFileUrl'],
	                        }));
	                        this.makeSubscribe(parameters, callback);
	                    }, (parameters, callback) => {
	                        this.logger.trace('SubscriptionManager', () => ({
	                            messageType: 'object',
	                            message: Object.assign({}, parameters),
	                            details: 'Heartbeat with parameters:',
	                            ignoredKeys: ['crypto', 'timeout', 'keySet', 'getFileUrl'],
	                        }));
	                        return this.heartbeat(parameters, callback);
	                    }, (parameters, callback) => {
	                        this.logger.trace('SubscriptionManager', () => ({
	                            messageType: 'object',
	                            message: Object.assign({}, parameters),
	                            details: 'Leave with parameters:',
	                        }));
	                        this.makeUnsubscribe(parameters, callback);
	                    }, this.time.bind(this));
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
	        this.logger.debug('PubNub', `Set auth key: ${authKey}`);
	        this._configuration.setAuthKey(authKey);
	        if (this.onAuthenticationChange)
	            this.onAuthenticationChange(authKey);
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
	        if (!value || typeof value !== 'string' || value.trim().length === 0) {
	            const error = new Error('Missing or invalid userId parameter. Provide a valid string userId');
	            this.logger.error('PubNub', () => ({ messageType: 'error', message: error }));
	            throw error;
	        }
	        this.logger.debug('PubNub', `Set user ID: ${value}`);
	        this._configuration.userId = value;
	        if (this.onUserIdChange)
	            this.onUserIdChange(this._configuration.userId);
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
	        this.userId = value;
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
	        this.logger.debug('PubNub', `Set filter expression: ${expression}`);
	        this._configuration.setFilterExpression(expression);
	    }
	    /**
	     * Update real-time updates filtering expression.
	     *
	     * @param expression - New expression which should be used or `undefined` to disable filtering.
	     */
	    setFilterExpression(expression) {
	        this.logger.debug('PubNub', `Set filter expression: ${expression}`);
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
	        this.logger.debug('PubNub', `Set cipher key: ${key}`);
	        this.cipherKey = key;
	    }
	    /**
	     * Change a heartbeat requests interval.
	     *
	     * @param interval - New presence request heartbeat intervals.
	     */
	    set heartbeatInterval(interval) {
	        var _a;
	        this.logger.debug('PubNub', `Set heartbeat interval: ${interval}`);
	        this._configuration.setHeartbeatInterval(interval);
	        if (this.onHeartbeatIntervalChange)
	            this.onHeartbeatIntervalChange((_a = this._configuration.getHeartbeatInterval()) !== null && _a !== void 0 ? _a : 0);
	    }
	    /**
	     * Change a heartbeat requests interval.
	     *
	     * @param interval - New presence request heartbeat intervals.
	     */
	    setHeartbeatInterval(interval) {
	        this.heartbeatInterval = interval;
	    }
	    /**
	     * Get registered loggers' manager.
	     *
	     * @returns Registered loggers' manager.
	     */
	    get logger() {
	        return this._configuration.logger();
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
	     * @param suffix - Suffix with information about a framework.
	     */
	    _addPnsdkSuffix(name, suffix) {
	        this.logger.debug('PubNub', `Add '${name}' 'pnsdk' suffix: ${suffix}`);
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
	     * @deprecated Use the {@link PubNubCore#setUserId setUserId} or {@link PubNubCore#userId userId} setter instead.
	     */
	    setUUID(value) {
	        this.logger.warn('PubNub', "'setUserId` is deprecated, please use 'setUserId' or 'userId' setter instead.");
	        this.logger.debug('PubNub', `Set UUID: ${value}`);
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
	        let channel = this.entities[`${name}_ch`];
	        if (!channel)
	            channel = this.entities[`${name}_ch`] = new Channel(name, this);
	        return channel;
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
	        let channelGroup = this.entities[`${name}_chg`];
	        if (!channelGroup)
	            channelGroup = this.entities[`${name}_chg`] = new ChannelGroup(name, this);
	        return channelGroup;
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
	        let metadata = this.entities[`${id}_chm`];
	        if (!metadata)
	            metadata = this.entities[`${id}_chm`] = new ChannelMetadata(id, this);
	        return metadata;
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
	        let metadata = this.entities[`${id}_um`];
	        if (!metadata)
	            metadata = this.entities[`${id}_um`] = new UserMetadata(id, this);
	        return metadata;
	    }
	    /**
	     * Create subscriptions set object.
	     *
	     * @param parameters - Subscriptions set configuration parameters.
	     */
	    subscriptionSet(parameters) {
	        var _a, _b;
	        {
	            // Prepare a list of entities for a set.
	            const entities = [];
	            (_a = parameters.channels) === null || _a === void 0 ? void 0 : _a.forEach((name) => entities.push(this.channel(name)));
	            (_b = parameters.channelGroups) === null || _b === void 0 ? void 0 : _b.forEach((name) => entities.push(this.channelGroup(name)));
	            return new SubscriptionSet({ client: this, entities, options: parameters.subscriptionOptions });
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
	                const validationError = createValidationError(validationResult);
	                this.logger.error('PubNub', () => ({ messageType: 'error', message: validationError }));
	                if (callback)
	                    return callback(validationError, null);
	                throw new PubNubError('Validation failed, check status for details', validationError);
	            }
	            // Complete request configuration.
	            const transportRequest = request.request();
	            const operation = request.operation();
	            if ((transportRequest.formData && transportRequest.formData.length > 0) ||
	                operation === RequestOperation$1.PNDownloadFileOperation) {
	                // Set file upload / download request delay.
	                transportRequest.timeout = this._configuration.getFileTimeout();
	            }
	            else {
	                if (operation === RequestOperation$1.PNSubscribeOperation ||
	                    operation === RequestOperation$1.PNReceiveMessagesOperation)
	                    transportRequest.timeout = this._configuration.getSubscribeTimeout();
	                else
	                    transportRequest.timeout = this._configuration.getTransactionTimeout();
	            }
	            // API request processing status.
	            const status = {
	                error: false,
	                operation,
	                category: StatusCategory$1.PNAcknowledgmentCategory,
	                statusCode: 0,
	            };
	            const [sendableRequest, cancellationController] = this.transport.makeSendable(transportRequest);
	            /**
	             * **Important:** Because of multiple environments where JS SDK can be used, control over
	             * cancellation had to be inverted to let the transport provider solve a request cancellation task
	             * more efficiently. As a result, cancellation controller can be retrieved and used only after
	             *  the request will be scheduled by the transport provider.
	             */
	            request.cancellationController = cancellationController ? cancellationController : null;
	            return sendableRequest
	                .then((response) => {
	                status.statusCode = response.status;
	                // Handle a special case when request completed but not fully processed by PubNub service.
	                if (response.status !== 200 && response.status !== 204) {
	                    const responseText = PubNubCore.decoder.decode(response.body);
	                    const contentType = response.headers['content-type'];
	                    if (contentType || contentType.indexOf('javascript') !== -1 || contentType.indexOf('json') !== -1) {
	                        const json = JSON.parse(responseText);
	                        if (typeof json === 'object' && 'error' in json && json.error && typeof json.error === 'object')
	                            status.errorData = json.error;
	                    }
	                    else
	                        status.responseText = responseText;
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
	                if (callback) {
	                    if (apiError.category !== StatusCategory$1.PNCancelledCategory) {
	                        this.logger.error('PubNub', () => ({
	                            messageType: 'error',
	                            message: apiError.toPubNubError(operation, 'REST API request processing error, check status for details'),
	                        }));
	                    }
	                    return callback(apiError.toStatus(operation), null);
	                }
	                const pubNubError = apiError.toPubNubError(operation, 'REST API request processing error, check status for details');
	                if (apiError.category !== StatusCategory$1.PNCancelledCategory)
	                    this.logger.error('PubNub', () => ({ messageType: 'error', message: pubNubError }));
	                throw pubNubError;
	            });
	        });
	    }
	    /**
	     * Unsubscribe from all channels and groups.
	     *
	     * @param [isOffline] - Whether `offline` presence should be notified or not.
	     */
	    destroy(isOffline = false) {
	        this.logger.info('PubNub', 'Destroying PubNub client.');
	        {
	            if (this._globalSubscriptionSet) {
	                this._globalSubscriptionSet.invalidate(true);
	                this._globalSubscriptionSet = undefined;
	            }
	            Object.values(this.eventHandleCapable).forEach((subscription) => subscription.invalidate(true));
	            this.eventHandleCapable = {};
	            if (this.subscriptionManager) {
	                this.subscriptionManager.unsubscribeAll(isOffline);
	                this.subscriptionManager.disconnect();
	            }
	            else if (this.eventEngine)
	                this.eventEngine.unsubscribeAll(isOffline);
	        }
	        {
	            if (this.presenceEventEngine)
	                this.presenceEventEngine.leaveAll(isOffline);
	        }
	    }
	    /**
	     * Unsubscribe from all channels and groups.
	     *
	     * @deprecated Use {@link destroy} method instead.
	     */
	    stop() {
	        this.logger.warn('PubNub', "'stop' is deprecated, please use 'destroy' instead.");
	        this.destroy();
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
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: 'Publish with parameters:',
	                }));
	                const isFireRequest = parameters.replicate === false && parameters.storeInHistory === false;
	                const request = new PublishRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule() }));
	                const logResponse = (response) => {
	                    if (!response)
	                        return;
	                    this.logger.debug('PubNub', `${isFireRequest ? 'Fire' : 'Publish'} success with timetoken: ${response.timetoken}`);
	                };
	                if (callback)
	                    return this.sendRequest(request, (status, response) => {
	                        logResponse(response);
	                        callback(status, response);
	                    });
	                return this.sendRequest(request).then((response) => {
	                    logResponse(response);
	                    return response;
	                });
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
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: 'Signal with parameters:',
	                }));
	                const request = new SignalRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
	                const logResponse = (response) => {
	                    if (!response)
	                        return;
	                    this.logger.debug('PubNub', `Publish success with timetoken: ${response.timetoken}`);
	                };
	                if (callback)
	                    return this.sendRequest(request, (status, response) => {
	                        logResponse(response);
	                        callback(status, response);
	                    });
	                return this.sendRequest(request).then((response) => {
	                    logResponse(response);
	                    return response;
	                });
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
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: 'Fire with parameters:',
	            }));
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
	     * Global subscription set which supports legacy subscription interface.
	     *
	     * @returns Global subscription set.
	     *
	     * @internal
	     */
	    get globalSubscriptionSet() {
	        if (!this._globalSubscriptionSet)
	            this._globalSubscriptionSet = this.subscriptionSet({});
	        return this._globalSubscriptionSet;
	    }
	    /**
	     * Subscription-based current timetoken.
	     *
	     * @returns Timetoken based on current timetoken plus diff between current and loop start time.
	     *
	     * @internal
	     */
	    get subscriptionTimetoken() {
	        {
	            if (this.subscriptionManager)
	                return this.subscriptionManager.subscriptionTimetoken;
	            else if (this.eventEngine)
	                return this.eventEngine.subscriptionTimetoken;
	        }
	        return undefined;
	    }
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
	     * Register an events handler object ({@link Subscription} or {@link SubscriptionSet}) with an active subscription.
	     *
	     * @param subscription - {@link Subscription} or {@link SubscriptionSet} object.
	     * @param [cursor] - Subscription catchup timetoken.
	     * @param [subscriptions] - List of subscriptions for partial subscription loop update.
	     *
	     * @internal
	     */
	    registerEventHandleCapable(subscription, cursor, subscriptions) {
	        {
	            this.logger.trace('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign(Object.assign({ subscription: subscription }, (cursor ? { cursor } : [])), (subscriptions ? { subscriptions } : {})),
	                details: `Register event handle capable:`,
	            }));
	            if (!this.eventHandleCapable[subscription.state.id])
	                this.eventHandleCapable[subscription.state.id] = subscription;
	            let subscriptionInput;
	            if (!subscriptions || subscriptions.length === 0)
	                subscriptionInput = subscription.subscriptionInput(false);
	            else {
	                subscriptionInput = new SubscriptionInput({});
	                subscriptions.forEach((subscription) => subscriptionInput.add(subscription.subscriptionInput(false)));
	            }
	            const parameters = {};
	            parameters.channels = subscriptionInput.channels;
	            parameters.channelGroups = subscriptionInput.channelGroups;
	            if (cursor)
	                parameters.timetoken = cursor.timetoken;
	            if (this.subscriptionManager)
	                this.subscriptionManager.subscribe(parameters);
	            else if (this.eventEngine)
	                this.eventEngine.subscribe(parameters);
	        }
	    }
	    /**
	     * Unregister an events handler object ({@link Subscription} or {@link SubscriptionSet}) with inactive subscription.
	     *
	     * @param subscription - {@link Subscription} or {@link SubscriptionSet} object.
	     * @param [subscriptions] - List of subscriptions for partial subscription loop update.
	     *
	     * @internal
	     */
	    unregisterEventHandleCapable(subscription, subscriptions) {
	        {
	            if (!this.eventHandleCapable[subscription.state.id])
	                return;
	            const inUseSubscriptions = [];
	            this.logger.trace('PubNub', () => ({
	                messageType: 'object',
	                message: { subscription: subscription, subscriptions },
	                details: `Unregister event handle capable:`,
	            }));
	            if ((!subscriptions ||
	                subscriptions.length === 0) &&
	                (subscriptions && subscription instanceof SubscriptionSet && subscriptions === subscriptions))
	                delete this.eventHandleCapable[subscription.state.id];
	            let subscriptionInput;
	            if (!subscriptions || subscriptions.length === 0) {
	                subscriptionInput = subscription.subscriptionInput(true);
	                if (subscriptionInput.isEmpty)
	                    inUseSubscriptions.push(subscription);
	            }
	            else {
	                subscriptionInput = new SubscriptionInput({});
	                subscriptions.forEach((subscription) => {
	                    const input = subscription.subscriptionInput(true);
	                    if (input.isEmpty)
	                        inUseSubscriptions.push(subscription);
	                    else
	                        subscriptionInput.add(input);
	                });
	            }
	            if (inUseSubscriptions.length > 0) {
	                this.logger.trace('PubNub', () => {
	                    const entities = [];
	                    if (inUseSubscriptions[0] instanceof SubscriptionSet) {
	                        inUseSubscriptions[0].subscriptions.forEach((subscription) => entities.push(subscription.state.entity));
	                    }
	                    else
	                        inUseSubscriptions.forEach((subscription) => entities.push(subscription.state.entity));
	                    return {
	                        messageType: 'object',
	                        message: { entities },
	                        details: `Can't unregister event handle capable because entities still in use:`,
	                    };
	                });
	            }
	            if (subscriptionInput.isEmpty)
	                return;
	            else {
	                const _channelGroupsInUse = [];
	                const _channelsInUse = [];
	                Object.values(this.eventHandleCapable).forEach((_subscription) => {
	                    const _subscriptionInput = _subscription.subscriptionInput(false);
	                    const _subscriptionChannelGroups = _subscriptionInput.channelGroups;
	                    const _subscriptionChannels = _subscriptionInput.channels;
	                    _channelGroupsInUse.push(...subscriptionInput.channelGroups.filter((channel) => _subscriptionChannelGroups.includes(channel)));
	                    _channelsInUse.push(...subscriptionInput.channels.filter((channel) => _subscriptionChannels.includes(channel)));
	                });
	                if (_channelsInUse.length > 0 || _channelGroupsInUse.length > 0) {
	                    this.logger.trace('PubNub', () => {
	                        const _entitiesInUse = [];
	                        const addEntityIfInUse = (entity) => {
	                            const namesOrIds = entity.subscriptionNames(true);
	                            const checkList = entity.subscriptionType === SubscriptionType.Channel ? _channelsInUse : _channelGroupsInUse;
	                            if (namesOrIds.some((id) => checkList.includes(id)))
	                                _entitiesInUse.push(entity);
	                        };
	                        Object.values(this.eventHandleCapable).forEach((_subscription) => {
	                            if (_subscription instanceof SubscriptionSet) {
	                                _subscription.subscriptions.forEach((_subscriptionInSet) => {
	                                    addEntityIfInUse(_subscriptionInSet.state.entity);
	                                });
	                            }
	                            else if (_subscription instanceof Subscription)
	                                addEntityIfInUse(_subscription.state.entity);
	                        });
	                        let details = 'Some entities still in use:';
	                        if (_channelsInUse.length + _channelGroupsInUse.length === subscriptionInput.length)
	                            details = "Can't unregister event handle capable because entities still in use:";
	                        return { messageType: 'object', message: { entities: _entitiesInUse }, details };
	                    });
	                    subscriptionInput.remove(new SubscriptionInput({ channels: _channelsInUse, channelGroups: _channelGroupsInUse }));
	                    if (subscriptionInput.isEmpty)
	                        return;
	                }
	            }
	            const parameters = {};
	            parameters.channels = subscriptionInput.channels;
	            parameters.channelGroups = subscriptionInput.channelGroups;
	            if (this.subscriptionManager)
	                this.subscriptionManager.unsubscribe(parameters);
	            else if (this.eventEngine)
	                this.eventEngine.unsubscribe(parameters);
	        }
	    }
	    /**
	     * Subscribe to specified channels and groups real-time events.
	     *
	     * @param parameters - Request configuration parameters.
	     */
	    subscribe(parameters) {
	        {
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: 'Subscribe with parameters:',
	            }));
	            // The addition of a new subscription set into the subscribed global subscription set will update the active
	            // subscription loop with new channels and groups.
	            const subscriptionSet = this.subscriptionSet(Object.assign(Object.assign({}, parameters), { subscriptionOptions: { receivePresenceEvents: parameters.withPresence } }));
	            this.globalSubscriptionSet.addSubscriptionSet(subscriptionSet);
	            subscriptionSet.dispose();
	            const timetoken = typeof parameters.timetoken === 'number' ? `${parameters.timetoken}` : parameters.timetoken;
	            this.globalSubscriptionSet.subscribe({ timetoken });
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
	             * **Note:** Had to be done after scheduling because the transport provider returns the cancellation
	             * controller only when schedule new request.
	             */
	            if (this.subscriptionManager) {
	                // Creating an identifiable abort caller.
	                const callableAbort = () => request.abort('Cancel long-poll subscribe request');
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
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: 'Unsubscribe with parameters:',
	            }));
	            if (!this._globalSubscriptionSet) {
	                this.logger.debug('PubNub', 'There are no active subscriptions. Ignore.');
	                return;
	            }
	            const subscriptions = this.globalSubscriptionSet.subscriptions.filter((subscription) => {
	                var _a, _b;
	                const subscriptionInput = subscription.subscriptionInput(false);
	                if (subscriptionInput.isEmpty)
	                    return false;
	                for (const channel of (_a = parameters.channels) !== null && _a !== void 0 ? _a : [])
	                    if (subscriptionInput.contains(channel))
	                        return true;
	                for (const group of (_b = parameters.channelGroups) !== null && _b !== void 0 ? _b : [])
	                    if (subscriptionInput.contains(group))
	                        return true;
	            });
	            // Removal from the active subscription also will cause `unsubscribe`.
	            if (subscriptions.length > 0)
	                this.globalSubscriptionSet.removeSubscriptions(subscriptions);
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
	            // Filtering out presence channels and groups.
	            let { channels, channelGroups } = parameters;
	            // Remove `-pnpres` channels / groups if they not acceptable in the current PubNub client configuration.
	            if (!this._configuration.getKeepPresenceChannelsInPresenceRequests()) {
	                if (channelGroups)
	                    channelGroups = channelGroups.filter((channelGroup) => !channelGroup.endsWith('-pnpres'));
	                if (channels)
	                    channels = channels.filter((channel) => !channel.endsWith('-pnpres'));
	            }
	            // Complete immediately request only for presence channels.
	            if ((channelGroups !== null && channelGroups !== void 0 ? channelGroups : []).length === 0 && (channels !== null && channels !== void 0 ? channels : []).length === 0) {
	                return callback({
	                    error: false,
	                    operation: RequestOperation$1.PNUnsubscribeOperation,
	                    category: StatusCategory$1.PNAcknowledgmentCategory,
	                    statusCode: 200,
	                });
	            }
	            this.sendRequest(new PresenceLeaveRequest({ channels, channelGroups, keySet: this._configuration.keySet }), callback);
	        }
	    }
	    /**
	     * Unsubscribe from all channels and groups.
	     */
	    unsubscribeAll() {
	        {
	            this.logger.debug('PubNub', 'Unsubscribe all channels and groups');
	            // Keeping a subscription set instance after invalidation so to make it possible to deliver the expected
	            // disconnection status.
	            if (this._globalSubscriptionSet)
	                this._globalSubscriptionSet.invalidate(false);
	            Object.values(this.eventHandleCapable).forEach((subscription) => subscription.invalidate(false));
	            this.eventHandleCapable = {};
	            if (this.subscriptionManager)
	                this.subscriptionManager.unsubscribeAll();
	            else if (this.eventEngine)
	                this.eventEngine.unsubscribeAll();
	        }
	    }
	    /**
	     * Temporarily disconnect from the real-time events stream.
	     *
	     * **Note:** `isOffline` is set to `true` only when a client experiences network issues.
	     *
	     * @param [isOffline] - Whether `offline` presence should be notified or not.
	     */
	    disconnect(isOffline = false) {
	        {
	            this.logger.debug('PubNub', `Disconnect (while offline? ${!!isOffline ? 'yes' : 'no'}`);
	            if (this.subscriptionManager)
	                this.subscriptionManager.disconnect();
	            else if (this.eventEngine)
	                this.eventEngine.disconnect(isOffline);
	        }
	    }
	    /**
	     * Restore connection to the real-time events stream.
	     *
	     * @param parameters - Reconnection catch-up configuration. **Note:** available only with the enabled event engine.
	     */
	    reconnect(parameters) {
	        {
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: 'Reconnect with parameters:',
	            }));
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
	                    request.abort('Cancel subscribe handshake request');
	                });
	                /**
	                 * Allow subscription cancellation.
	                 *
	                 * **Note:** Had to be done after scheduling because the transport provider returns the cancellation
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
	                    request.abort('Cancel long-poll subscribe request');
	                });
	                /**
	                 * Allow subscription cancellation.
	                 *
	                 * **Note:** Had to be done after scheduling because the transport provider returns the cancellation
	                 * controller only when schedule new request.
	                 */
	                const receiveResponse = this.sendRequest(request);
	                return receiveResponse.then((response) => {
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
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: 'Get message actions with parameters:',
	                }));
	                const request = new GetMessageActionsRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
	                const logResponse = (response) => {
	                    if (!response)
	                        return;
	                    this.logger.debug('PubNub', `Get message actions success. Received ${response.data.length} message actions.`);
	                };
	                if (callback)
	                    return this.sendRequest(request, (status, response) => {
	                        logResponse(response);
	                        callback(status, response);
	                    });
	                return this.sendRequest(request).then((response) => {
	                    logResponse(response);
	                    return response;
	                });
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
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: 'Add message action with parameters:',
	                }));
	                const request = new AddMessageActionRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
	                const logResponse = (response) => {
	                    if (!response)
	                        return;
	                    this.logger.debug('PubNub', `Message action add success. Message action added with timetoken: ${response.data.actionTimetoken}`);
	                };
	                if (callback)
	                    return this.sendRequest(request, (status, response) => {
	                        logResponse(response);
	                        callback(status, response);
	                    });
	                return this.sendRequest(request).then((response) => {
	                    logResponse(response);
	                    return response;
	                });
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
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: 'Remove message action with parameters:',
	                }));
	                const request = new RemoveMessageAction(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
	                const logResponse = (response) => {
	                    if (!response)
	                        return;
	                    this.logger.debug('PubNub', `Message action remove success. Removed message action with ${parameters.actionTimetoken} timetoken.`);
	                };
	                if (callback)
	                    return this.sendRequest(request, (status, response) => {
	                        logResponse(response);
	                        callback(status, response);
	                    });
	                return this.sendRequest(request).then((response) => {
	                    logResponse(response);
	                    return response;
	                });
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
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: 'Fetch messages with parameters:',
	                }));
	                const request = new FetchMessagesRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule(), getFileUrl: this.getFileUrl.bind(this) }));
	                const logResponse = (response) => {
	                    if (!response)
	                        return;
	                    const messagesCount = Object.values(response.channels).reduce((acc, message) => acc + message.length, 0);
	                    this.logger.debug('PubNub', `Fetch messages success. Received ${messagesCount} messages.`);
	                };
	                if (callback)
	                    return this.sendRequest(request, (status, response) => {
	                        logResponse(response);
	                        callback(status, response);
	                    });
	                return this.sendRequest(request).then((response) => {
	                    logResponse(response);
	                    return response;
	                });
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
	     */
	    deleteMessages(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: 'Delete messages with parameters:',
	                }));
	                const request = new DeleteMessageRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
	                const logResponse = (response) => {
	                    if (!response)
	                        return;
	                    this.logger.debug('PubNub', `Delete messages success.`);
	                };
	                if (callback)
	                    return this.sendRequest(request, (status, response) => {
	                        logResponse(response);
	                        callback(status, response);
	                    });
	                return this.sendRequest(request).then((response) => {
	                    logResponse(response);
	                    return response;
	                });
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
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: 'Get messages count with parameters:',
	                }));
	                const request = new MessageCountRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
	                const logResponse = (response) => {
	                    if (!response)
	                        return;
	                    const messagesCount = Object.values(response.channels).reduce((acc, messagesCount) => acc + messagesCount, 0);
	                    this.logger.debug('PubNub', `Get messages count success. There are ${messagesCount} messages since provided reference timetoken${parameters.channelTimetokens ? parameters.channelTimetokens.join(',') : ''.length > 1 ? 's' : ''}.`);
	                };
	                if (callback)
	                    return this.sendRequest(request, (status, response) => {
	                        logResponse(response);
	                        callback(status, response);
	                    });
	                return this.sendRequest(request).then((response) => {
	                    logResponse(response);
	                    return response;
	                });
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
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: 'Fetch history with parameters:',
	                }));
	                const request = new GetHistoryRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule() }));
	                const logResponse = (response) => {
	                    if (!response)
	                        return;
	                    this.logger.debug('PubNub', `Fetch history success. Received ${response.messages.length} messages.`);
	                };
	                if (callback)
	                    return this.sendRequest(request, (status, response) => {
	                        logResponse(response);
	                        callback(status, response);
	                    });
	                return this.sendRequest(request).then((response) => {
	                    logResponse(response);
	                    return response;
	                });
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
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: 'Here now with parameters:',
	                }));
	                const request = new HereNowRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
	                const logResponse = (response) => {
	                    if (!response)
	                        return;
	                    this.logger.debug('PubNub', `Here now success. There are ${response.totalOccupancy} participants in ${response.totalChannels} channels.`);
	                };
	                if (callback)
	                    return this.sendRequest(request, (status, response) => {
	                        logResponse(response);
	                        callback(status, response);
	                    });
	                return this.sendRequest(request).then((response) => {
	                    logResponse(response);
	                    return response;
	                });
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
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: 'Where now with parameters:',
	                }));
	                const request = new WhereNowRequest({
	                    uuid: (_a = parameters.uuid) !== null && _a !== void 0 ? _a : this._configuration.userId,
	                    keySet: this._configuration.keySet,
	                });
	                const logResponse = (response) => {
	                    if (!response)
	                        return;
	                    this.logger.debug('PubNub', `Where now success. Currently present in ${response.channels.length} channels.`);
	                };
	                if (callback)
	                    return this.sendRequest(request, (status, response) => {
	                        logResponse(response);
	                        callback(status, response);
	                    });
	                return this.sendRequest(request).then((response) => {
	                    logResponse(response);
	                    return response;
	                });
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
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: 'Get presence state with parameters:',
	                }));
	                const request = new GetPresenceStateRequest(Object.assign(Object.assign({}, parameters), { uuid: (_a = parameters.uuid) !== null && _a !== void 0 ? _a : this._configuration.userId, keySet: this._configuration.keySet }));
	                const logResponse = (response) => {
	                    if (!response)
	                        return;
	                    this.logger.debug('PubNub', `Get presence state success. Received presence state for ${Object.keys(response.channels).length} channels.`);
	                };
	                if (callback)
	                    return this.sendRequest(request, (status, response) => {
	                        logResponse(response);
	                        callback(status, response);
	                    });
	                return this.sendRequest(request).then((response) => {
	                    logResponse(response);
	                    return response;
	                });
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
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: 'Set presence state with parameters:',
	                }));
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
	                // Check whether the state should be set with heartbeat or not.
	                if ('withHeartbeat' in parameters && parameters.withHeartbeat) {
	                    request = new HeartbeatRequest(Object.assign(Object.assign({}, parameters), { keySet, heartbeat }));
	                }
	                else {
	                    request = new SetPresenceStateRequest(Object.assign(Object.assign({}, parameters), { keySet, uuid: userId }));
	                }
	                const logResponse = (response) => {
	                    if (!response)
	                        return;
	                    this.logger.debug('PubNub', `Set presence state success.${request instanceof HeartbeatRequest ? ' Presence state has been set using heartbeat endpoint.' : ''}`);
	                };
	                // Update state used by subscription manager.
	                if (this.subscriptionManager)
	                    this.subscriptionManager.setState(parameters);
	                if (callback)
	                    return this.sendRequest(request, (status, response) => {
	                        logResponse(response);
	                        callback(status, response);
	                    });
	                return this.sendRequest(request).then((response) => {
	                    logResponse(response);
	                    return response;
	                });
	            }
	        });
	    }
	    // endregion
	    // region Change presence state
	    /**
	     * Manual presence management.
	     *
	     * @param parameters - Desired presence state for a provided list of channels and groups.
	     */
	    presence(parameters) {
	        var _a;
	        {
	            this.logger.debug('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: 'Change presence with parameters:',
	            }));
	            (_a = this.subscriptionManager) === null || _a === void 0 ? void 0 : _a.changePresence(parameters);
	        }
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
	            var _a;
	            {
	                this.logger.trace('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: 'Heartbeat with parameters:',
	                }));
	                // Filtering out presence channels and groups.
	                let { channels, channelGroups } = parameters;
	                // Remove `-pnpres` channels / groups if they not acceptable in the current PubNub client configuration.
	                if (!this._configuration.getKeepPresenceChannelsInPresenceRequests()) {
	                    if (channelGroups)
	                        channelGroups = channelGroups.filter((channelGroup) => !channelGroup.endsWith('-pnpres'));
	                    if (channels)
	                        channels = channels.filter((channel) => !channel.endsWith('-pnpres'));
	                }
	                // Complete immediately request only for presence channels.
	                if ((channelGroups !== null && channelGroups !== void 0 ? channelGroups : []).length === 0 && (channels !== null && channels !== void 0 ? channels : []).length === 0) {
	                    const responseStatus = {
	                        error: false,
	                        operation: RequestOperation$1.PNHeartbeatOperation,
	                        category: StatusCategory$1.PNAcknowledgmentCategory,
	                        statusCode: 200,
	                    };
	                    this.logger.trace('PubNub', 'There are no active subscriptions. Ignore.');
	                    if (callback)
	                        return callback(responseStatus, {});
	                    return Promise.resolve(responseStatus);
	                }
	                const request = new HeartbeatRequest(Object.assign(Object.assign({}, parameters), { channels,
	                    channelGroups, keySet: this._configuration.keySet }));
	                const logResponse = (response) => {
	                    if (!response)
	                        return;
	                    this.logger.trace('PubNub', 'Heartbeat success.');
	                };
	                const abortUnsubscribe = (_a = parameters.abortSignal) === null || _a === void 0 ? void 0 : _a.subscribe((err) => {
	                    request.abort('Cancel long-poll subscribe request');
	                });
	                if (callback)
	                    return this.sendRequest(request, (status, response) => {
	                        logResponse(response);
	                        if (abortUnsubscribe)
	                            abortUnsubscribe();
	                        callback(status, response);
	                    });
	                return this.sendRequest(request).then((response) => {
	                    logResponse(response);
	                    if (abortUnsubscribe)
	                        abortUnsubscribe();
	                    return response;
	                });
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
	        var _a, _b;
	        {
	            this.logger.trace('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: 'Join with parameters:',
	            }));
	            if (parameters && ((_a = parameters.channels) !== null && _a !== void 0 ? _a : []).length === 0 && ((_b = parameters.groups) !== null && _b !== void 0 ? _b : []).length === 0) {
	                this.logger.trace('PubNub', "Ignoring 'join' announcement request.");
	                return;
	            }
	            if (this.presenceEventEngine)
	                this.presenceEventEngine.join(parameters);
	            else {
	                this.heartbeat(Object.assign(Object.assign({ channels: parameters.channels, channelGroups: parameters.groups }, (this._configuration.maintainPresenceState &&
	                    this.presenceState &&
	                    Object.keys(this.presenceState).length > 0 && { state: this.presenceState })), { heartbeat: this._configuration.getPresenceTimeout() }), () => { });
	            }
	        }
	    }
	    /**
	     * Reconnect presence event engine after network issues.
	     *
	     * @param parameters - List of channels and groups where `join` event should be sent.
	     *
	     * @internal
	     */
	    presenceReconnect(parameters) {
	        {
	            this.logger.trace('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: 'Presence reconnect with parameters:',
	            }));
	            if (this.presenceEventEngine)
	                this.presenceEventEngine.reconnect();
	            else {
	                this.heartbeat(Object.assign(Object.assign({ channels: parameters.channels, channelGroups: parameters.groups }, (this._configuration.maintainPresenceState && { state: this.presenceState })), { heartbeat: this._configuration.getPresenceTimeout() }), () => { });
	            }
	        }
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
	        var _a, _b, _c;
	        {
	            this.logger.trace('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: 'Leave with parameters:',
	            }));
	            if (parameters && ((_a = parameters.channels) !== null && _a !== void 0 ? _a : []).length === 0 && ((_b = parameters.groups) !== null && _b !== void 0 ? _b : []).length === 0) {
	                this.logger.trace('PubNub', "Ignoring 'leave' announcement request.");
	                return;
	            }
	            if (this.presenceEventEngine)
	                (_c = this.presenceEventEngine) === null || _c === void 0 ? void 0 : _c.leave(parameters);
	            else
	                this.makeUnsubscribe({ channels: parameters.channels, channelGroups: parameters.groups }, () => { });
	        }
	    }
	    /**
	     * Announce user `leave` on all subscribed channels.
	     *
	     * @internal
	     *
	     * @param parameters - List of channels and groups where `leave` event should be sent.
	     */
	    leaveAll(parameters = {}) {
	        {
	            this.logger.trace('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: 'Leave all with parameters:',
	            }));
	            if (this.presenceEventEngine)
	                this.presenceEventEngine.leaveAll(!!parameters.isOffline);
	            else if (!parameters.isOffline)
	                this.makeUnsubscribe({ channels: parameters.channels, channelGroups: parameters.groups }, () => { });
	        }
	    }
	    /**
	     * Announce user `leave` on disconnection.
	     *
	     * @internal
	     *
	     * @param parameters - List of channels and groups where `leave` event should be sent.
	     */
	    presenceDisconnect(parameters) {
	        {
	            this.logger.trace('PubNub', () => ({
	                messageType: 'object',
	                message: Object.assign({}, parameters),
	                details: 'Presence disconnect parameters:',
	            }));
	            if (this.presenceEventEngine)
	                this.presenceEventEngine.disconnect(!!parameters.isOffline);
	            else if (!parameters.isOffline)
	                this.makeUnsubscribe({ channels: parameters.channels, channelGroups: parameters.groups }, () => { });
	        }
	    }
	    /**
	     * Grant token permission.
	     *
	     * Generate an access token with requested permissions.
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
	     * Get a current access token.
	     *
	     * @returns Previously configured access token using {@link setToken} method.
	     */
	    get token() {
	        return this.tokenManager && this.tokenManager.getToken();
	    }
	    /**
	     * Get a current access token.
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
	        if (this.onAuthenticationChange)
	            this.onAuthenticationChange(token);
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
	     * @deprecated Use {@link PubNubCore#objects.getAllUUIDMetadata getAllUUIDMetadata} method instead.
	     */
	    fetchUsers(parametersOrCallback, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                this.logger.warn('PubNub', "'fetchUsers' is deprecated. Use 'pubnub.objects.getAllUUIDMetadata' instead.");
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: !parametersOrCallback || typeof parametersOrCallback === 'function' ? {} : parametersOrCallback,
	                    details: `Fetch all User objects with parameters:`,
	                }));
	                return this.objects._getAllUUIDMetadata(parametersOrCallback, callback);
	            }
	        });
	    }
	    /**
	     * Fetch User object for a currently configured PubNub client `uuid`.
	     *
	     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous get User object response or `void` in case if `callback` provided.
	     *
	     * @deprecated Use {@link PubNubCore#objects.getUUIDMetadata getUUIDMetadata} method instead.
	     */
	    fetchUser(parametersOrCallback, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                this.logger.warn('PubNub', "'fetchUser' is deprecated. Use 'pubnub.objects.getUUIDMetadata' instead.");
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: !parametersOrCallback || typeof parametersOrCallback === 'function'
	                        ? { uuid: this.userId }
	                        : parametersOrCallback,
	                    details: `Fetch${!parametersOrCallback || typeof parametersOrCallback === 'function' ? ' current' : ''} User object with parameters:`,
	                }));
	                return this.objects._getUUIDMetadata(parametersOrCallback, callback);
	            }
	        });
	    }
	    /**
	     * Create a User object.
	     *
	     * @param parameters - Request configuration parameters. Will create a User object for a currently
	     * configured PubNub client `uuid` if not set.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous create User object response or `void` in case if `callback` provided.
	     *
	     * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata setUUIDMetadata} method instead.
	     */
	    createUser(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                this.logger.warn('PubNub', "'createUser' is deprecated. Use 'pubnub.objects.setUUIDMetadata' instead.");
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: `Create User object with parameters:`,
	                }));
	                return this.objects._setUUIDMetadata(parameters, callback);
	            }
	        });
	    }
	    /**
	     * Update a User object.
	     *
	     * @param parameters - Request configuration parameters. Will update a User object for a currently
	     * configured PubNub client `uuid` if not set.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous update User object response or `void` in case if `callback` provided.
	     *
	     * @deprecated Use {@link PubNubCore#objects.setUUIDMetadata setUUIDMetadata} method instead.
	     */
	    updateUser(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            this.logger.warn('PubNub', "'updateUser' is deprecated. Use 'pubnub.objects.setUUIDMetadata' instead.");
	            {
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: `Update User object with parameters:`,
	                }));
	                return this.objects._setUUIDMetadata(parameters, callback);
	            }
	        });
	    }
	    /**
	     * Remove a specific User object.
	     *
	     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous User object removes response or `void` in case if `callback` provided.
	     *
	     * @deprecated Use {@link PubNubCore#objects.removeUUIDMetadata removeUUIDMetadata} method instead.
	     */
	    removeUser(parametersOrCallback, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                this.logger.warn('PubNub', "'removeUser' is deprecated. Use 'pubnub.objects.removeUUIDMetadata' instead.");
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: !parametersOrCallback || typeof parametersOrCallback === 'function'
	                        ? { uuid: this.userId }
	                        : parametersOrCallback,
	                    details: `Remove${!parametersOrCallback || typeof parametersOrCallback === 'function' ? ' current' : ''} User object with parameters:`,
	                }));
	                return this.objects._removeUUIDMetadata(parametersOrCallback, callback);
	            }
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
	     * @deprecated Use {@link PubNubCore#objects.getAllChannelMetadata getAllChannelMetadata} method instead.
	     */
	    fetchSpaces(parametersOrCallback, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                this.logger.warn('PubNub', "'fetchSpaces' is deprecated. Use 'pubnub.objects.getAllChannelMetadata' instead.");
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: !parametersOrCallback || typeof parametersOrCallback === 'function' ? {} : parametersOrCallback,
	                    details: `Fetch all Space objects with parameters:`,
	                }));
	                return this.objects._getAllChannelMetadata(parametersOrCallback, callback);
	            }
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
	     * @deprecated Use {@link PubNubCore#objects.getChannelMetadata getChannelMetadata} method instead.
	     */
	    fetchSpace(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                this.logger.warn('PubNub', "'fetchSpace' is deprecated. Use 'pubnub.objects.getChannelMetadata' instead.");
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: `Fetch Space object with parameters:`,
	                }));
	                return this.objects._getChannelMetadata(parameters, callback);
	            }
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
	     * @deprecated Use {@link PubNubCore#objects.setChannelMetadata setChannelMetadata} method instead.
	     */
	    createSpace(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                this.logger.warn('PubNub', "'createSpace' is deprecated. Use 'pubnub.objects.setChannelMetadata' instead.");
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: `Create Space object with parameters:`,
	                }));
	                return this.objects._setChannelMetadata(parameters, callback);
	            }
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
	     * @deprecated Use {@link PubNubCore#objects.setChannelMetadata setChannelMetadata} method instead.
	     */
	    updateSpace(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                this.logger.warn('PubNub', "'updateSpace' is deprecated. Use 'pubnub.objects.setChannelMetadata' instead.");
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: `Update Space object with parameters:`,
	                }));
	                return this.objects._setChannelMetadata(parameters, callback);
	            }
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
	     * @deprecated Use {@link PubNubCore#objects.removeChannelMetadata removeChannelMetadata} method instead.
	     */
	    removeSpace(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                this.logger.warn('PubNub', "'removeSpace' is deprecated. Use 'pubnub.objects.removeChannelMetadata' instead.");
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: `Remove Space object with parameters:`,
	                }));
	                return this.objects._removeChannelMetadata(parameters, callback);
	            }
	        });
	    }
	    /**
	     * Fetch a paginated list of specific Space members or specific User memberships.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous get specific Space members or specific User memberships response or
	     * `void` in case if `callback` provided.
	     *
	     * @deprecated Use {@link PubNubCore#objects.getChannelMembers getChannelMembers} or
	     * {@link PubNubCore#objects.getMemberships getMemberships} methods instead.
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
	     * @deprecated Use {@link PubNubCore#objects.setChannelMembers setChannelMembers} or
	     * {@link PubNubCore#objects.setMemberships setMemberships} methods instead.
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
	     * @deprecated Use {@link PubNubCore#objects.setChannelMembers setChannelMembers} or
	     * {@link PubNubCore#objects.setMemberships setMemberships} methods instead.
	     */
	    updateMemberships(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                this.logger.warn('PubNub', "'addMemberships' is deprecated. Use 'pubnub.objects.setChannelMembers' or 'pubnub.objects.setMemberships'" +
	                    ' instead.');
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: `Update memberships with parameters:`,
	                }));
	                return this.objects.addMemberships(parameters, callback);
	            }
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
	     * @deprecated Use {@link PubNubCore#objects.removeMemberships removeMemberships} or
	     * {@link PubNubCore#objects.removeChannelMembers removeChannelMembers} methods instead from `objects` API group.
	     */
	    removeMemberships(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            var _a, _b, _c;
	            {
	                this.logger.warn('PubNub', "'removeMemberships' is deprecated. Use 'pubnub.objects.removeMemberships' or" +
	                    " 'pubnub.objects.removeChannelMembers' instead.");
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: `Remove memberships with parameters:`,
	                }));
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
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: `Send file with parameters:`,
	                }));
	                const sendFileRequest = new SendFileRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, PubNubFile: this._configuration.PubNubFile, fileUploadPublishRetryLimit: this._configuration.fileUploadPublishRetryLimit, file: parameters.file, sendRequest: this.sendRequest.bind(this), publishFile: this.publishFile.bind(this), crypto: this._configuration.getCryptoModule(), cryptography: this.cryptography ? this.cryptography : undefined }));
	                const status = {
	                    error: false,
	                    operation: RequestOperation$1.PNPublishFileOperation,
	                    category: StatusCategory$1.PNAcknowledgmentCategory,
	                    statusCode: 0,
	                };
	                const logResponse = (response) => {
	                    if (!response)
	                        return;
	                    this.logger.debug('PubNub', `Send file success. File shared with ${response.id} ID.`);
	                };
	                return sendFileRequest
	                    .process()
	                    .then((response) => {
	                    status.statusCode = response.status;
	                    logResponse(response);
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
	                    this.logger.error('PubNub', () => ({
	                        messageType: 'error',
	                        message: new PubNubError('File sending error. Check status for details', errorStatus),
	                    }));
	                    // Notify callback (if possible).
	                    if (callback && errorStatus)
	                        callback(errorStatus, null);
	                    throw new PubNubError('REST API request processing error. Check status for details', errorStatus);
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
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: `Publish file message with parameters:`,
	                }));
	                const request = new PublishFileMessageRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, crypto: this._configuration.getCryptoModule() }));
	                const logResponse = (response) => {
	                    if (!response)
	                        return;
	                    this.logger.debug('PubNub', `Publish file message success. File message published with timetoken: ${response.timetoken}`);
	                };
	                if (callback)
	                    return this.sendRequest(request, (status, response) => {
	                        logResponse(response);
	                        callback(status, response);
	                    });
	                return this.sendRequest(request).then((response) => {
	                    logResponse(response);
	                    return response;
	                });
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
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: `List files with parameters:`,
	                }));
	                const request = new FilesListRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
	                const logResponse = (response) => {
	                    if (!response)
	                        return;
	                    this.logger.debug('PubNub', `List files success. There are ${response.count} uploaded files.`);
	                };
	                if (callback)
	                    return this.sendRequest(request, (status, response) => {
	                        logResponse(response);
	                        callback(status, response);
	                    });
	                return this.sendRequest(request).then((response) => {
	                    logResponse(response);
	                    return response;
	                });
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
	     * Download a shared file from a specific channel.
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
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: `Download file with parameters:`,
	                }));
	                const request = new DownloadFileRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet, PubNubFile: this._configuration.PubNubFile, cryptography: this.cryptography ? this.cryptography : undefined, crypto: this._configuration.getCryptoModule() }));
	                const logResponse = (response) => {
	                    if (!response)
	                        return;
	                    this.logger.debug('PubNub', `Download file success.`);
	                };
	                if (callback)
	                    return this.sendRequest(request, (status, response) => {
	                        logResponse(response);
	                        callback(status, response);
	                    });
	                return (yield this.sendRequest(request).then((response) => {
	                    logResponse(response);
	                    return response;
	                }));
	            }
	        });
	    }
	    /**
	     * Delete a shared file from a specific channel.
	     *
	     * @param parameters - Request configuration parameters.
	     * @param [callback] - Request completion handler callback.
	     *
	     * @returns Asynchronous delete shared file response or `void` in case if `callback` provided.
	     */
	    deleteFile(parameters, callback) {
	        return __awaiter(this, void 0, void 0, function* () {
	            {
	                this.logger.debug('PubNub', () => ({
	                    messageType: 'object',
	                    message: Object.assign({}, parameters),
	                    details: `Delete file with parameters:`,
	                }));
	                const request = new DeleteFileRequest(Object.assign(Object.assign({}, parameters), { keySet: this._configuration.keySet }));
	                const logResponse = (response) => {
	                    if (!response)
	                        return;
	                    this.logger.debug('PubNub', `Delete file success. Deleted file with ${parameters.id} ID.`);
	                };
	                if (callback)
	                    return this.sendRequest(request, (status, response) => {
	                        logResponse(response);
	                        callback(status, response);
	                    });
	                return this.sendRequest(request).then((response) => {
	                    logResponse(response);
	                    return response;
	                });
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
	            this.logger.debug('PubNub', 'Get service time.');
	            const request = new TimeRequest();
	            const logResponse = (response) => {
	                if (!response)
	                    return;
	                this.logger.debug('PubNub', `Get service time success. Current timetoken: ${response.timetoken}`);
	            };
	            if (callback)
	                return this.sendRequest(request, (status, response) => {
	                    logResponse(response);
	                    callback(status, response);
	                });
	            return this.sendRequest(request).then((response) => {
	                logResponse(response);
	                return response;
	            });
	        });
	    }
	    // endregion
	    // --------------------------------------------------------
	    // -------------------- Event emitter ---------------------
	    // --------------------------------------------------------
	    // region Event emitter
	    /**
	     * Emit received a status update.
	     *
	     * Use global and local event dispatchers to deliver a status object.
	     *
	     * @param status - Status object which should be emitted through the listeners.
	     *
	     * @internal
	     */
	    emitStatus(status) {
	        var _a;
	        (_a = this.eventDispatcher) === null || _a === void 0 ? void 0 : _a.handleStatus(status);
	    }
	    /**
	     * Emit receiver real-time event.
	     *
	     * Use global and local event dispatchers to deliver an event object.
	     *
	     * @param cursor - Next subscription loop timetoken.
	     * @param event - Event object which should be emitted through the listeners.
	     *
	     * @internal
	     */
	    emitEvent(cursor, event) {
	        var _a;
	        {
	            if (this._globalSubscriptionSet)
	                this._globalSubscriptionSet.handleEvent(cursor, event);
	            (_a = this.eventDispatcher) === null || _a === void 0 ? void 0 : _a.handleEvent(event);
	            Object.values(this.eventHandleCapable).forEach((eventHandleCapable) => {
	                eventHandleCapable.handleEvent(cursor, event);
	            });
	        }
	    }
	    /**
	     * Set a connection status change event handler.
	     *
	     * @param listener - Listener function, which will be called each time when the connection status changes.
	     */
	    set onStatus(listener) {
	        {
	            if (this.eventDispatcher)
	                this.eventDispatcher.onStatus = listener;
	        }
	    }
	    /**
	     * Set a new message handler.
	     *
	     * @param listener - Listener function, which will be called each time when a new message
	     * is received from the real-time network.
	     */
	    set onMessage(listener) {
	        {
	            if (this.eventDispatcher)
	                this.eventDispatcher.onMessage = listener;
	        }
	    }
	    /**
	     * Set a new presence events handler.
	     *
	     * @param listener - Listener function, which will be called each time when a new
	     * presence event is received from the real-time network.
	     */
	    set onPresence(listener) {
	        {
	            if (this.eventDispatcher)
	                this.eventDispatcher.onPresence = listener;
	        }
	    }
	    /**
	     * Set a new signal handler.
	     *
	     * @param listener - Listener function, which will be called each time when a new signal
	     * is received from the real-time network.
	     */
	    set onSignal(listener) {
	        {
	            if (this.eventDispatcher)
	                this.eventDispatcher.onSignal = listener;
	        }
	    }
	    /**
	     * Set a new app context event handler.
	     *
	     * @param listener - Listener function, which will be called each time when a new
	     * app context event is received from the real-time network.
	     */
	    set onObjects(listener) {
	        {
	            if (this.eventDispatcher)
	                this.eventDispatcher.onObjects = listener;
	        }
	    }
	    /**
	     * Set a new message reaction event handler.
	     *
	     * @param listener - Listener function, which will be called each time when a
	     * new message reaction event is received from the real-time network.
	     */
	    set onMessageAction(listener) {
	        {
	            if (this.eventDispatcher)
	                this.eventDispatcher.onMessageAction = listener;
	        }
	    }
	    /**
	     * Set a new file handler.
	     *
	     * @param listener - Listener function, which will be called each time when a new file
	     * is received from the real-time network.
	     */
	    set onFile(listener) {
	        {
	            if (this.eventDispatcher)
	                this.eventDispatcher.onFile = listener;
	        }
	    }
	    /**
	     * Set events handler.
	     *
	     * @param listener - Events listener configuration object, which lets specify handlers for multiple
	     * types of events.
	     */
	    addListener(listener) {
	        {
	            if (this.eventDispatcher) {
	                this.eventDispatcher.addListener(listener);
	            }
	        }
	    }
	    /**
	     * Remove real-time event listener.
	     *
	     * @param listener - Event listener configuration, which should be removed from the list of notified
	     * listeners. **Important:** Should be the same object which has been passed to the
	     * {@link addListener}.
	     */
	    removeListener(listener) {
	        {
	            if (this.eventDispatcher)
	                this.eventDispatcher.removeListener(listener);
	        }
	    }
	    /**
	     * Clear all real-time event listeners.
	     */
	    removeAllListeners() {
	        {
	            if (this.eventDispatcher)
	                this.eventDispatcher.removeAllListeners();
	        }
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
	     * @param [customCipherKey] - Cipher key which should be used to encrypt data. **Deprecated:**
	     * use {@link Configuration#cryptoModule|cryptoModule} instead.
	     *
	     * @returns Data encryption result as a string.
	     *
	     * @deprecated Use {@link Configuration#cryptoModule|cryptoModule} instead.
	     */
	    encrypt(data, customCipherKey) {
	        this.logger.warn('PubNub', "'encrypt' is deprecated. Use cryptoModule instead.");
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
	     *
	     * @deprecated Use {@link Configuration#cryptoModule|cryptoModule} instead.
	     */
	    decrypt(data, customCipherKey) {
	        this.logger.warn('PubNub', "'decrypt' is deprecated. Use cryptoModule instead.");
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
	     * @throws Error if a source file isn't provided.
	     * @throws File constructor not provided.
	     * @throws Crypto module is missing (if non-legacy flow used).
	     *
	     * @deprecated Use {@link Configuration#cryptoModule|cryptoModule} instead.
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
	     * @throws Error if source file isn't provided.
	     * @throws File constructor not provided.
	     * @throws Crypto module is missing (if non-legacy flow used).
	     *
	     * @deprecated Use {@link Configuration#cryptoModule|cryptoModule} instead.
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
	 * Enum with API endpoint groups which can be used with retry policy to set up exclusions (which shouldn't be
	 * retried).
	 */
	PubNubCore.Endpoint = Endpoint;
	/**
	 * Exponential retry policy constructor.
	 */
	PubNubCore.ExponentialRetryPolicy = RetryPolicy.ExponentialRetryPolicy;
	/**
	 * Linear retry policy constructor.
	 */
	PubNubCore.LinearRetryPolicy = RetryPolicy.LinearRetryPolicy;
	/**
	 * Disabled / inactive retry policy.
	 *
	 * **Note:** By default `ExponentialRetryPolicy` is set for subscribe requests and this one can be used to disable
	 * retry policy for all requests (setting `undefined` for retry configuration will set default policy).
	 */
	PubNubCore.NoneRetryPolicy = RetryPolicy.None;
	/**
	 * Available minimum log levels.
	 */
	PubNubCore.LogLevel = LogLevel;

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
	     * Create and configure the PubNub client core.
	     *
	     * @param configuration - User-provided PubNub client configuration.
	     *
	     * @returns Configured and ready to use PubNub client.
	     */
	    constructor(configuration) {
	        var _a;
	        const sharedWorkerRequested = configuration.subscriptionWorkerUrl !== undefined;
	        const configurationCopy = setDefaults(configuration);
	        const platformConfiguration = Object.assign(Object.assign({}, configurationCopy), { sdkFamily: 'Web' });
	        platformConfiguration.PubNubFile = PubNubFile;
	        // Prepare full client configuration.
	        const clientConfiguration = makeConfiguration(platformConfiguration, (cryptoConfiguration) => {
	            if (!cryptoConfiguration.cipherKey)
	                return undefined;
	            {
	                const cryptoModule = new WebCryptoModule({
	                    default: new LegacyCryptor(Object.assign(Object.assign({}, cryptoConfiguration), (!cryptoConfiguration.logger ? { logger: clientConfiguration.logger() } : {}))),
	                    cryptors: [new AesCbcCryptor({ cipherKey: cryptoConfiguration.cipherKey })],
	                });
	                return cryptoModule;
	            }
	        });
	        {
	            // Ensure that the logger has been passed to the user-provided crypto module.
	            if (clientConfiguration.getCryptoModule())
	                clientConfiguration.getCryptoModule().logger = clientConfiguration.logger();
	        }
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
	                    logger: clientConfiguration.logger(),
	                });
	            }
	        }
	        // Settings change handlers
	        let heartbeatIntervalChangeHandler = () => { };
	        let authenticationChangeHandler = () => { };
	        let userIdChangeHandler = () => { };
	        let cryptography;
	        cryptography = new WebCryptography();
	        // Setup transport provider.
	        let transport = new WebTransport(clientConfiguration.logger(), platformConfiguration.transport);
	        {
	            if (configurationCopy.subscriptionWorkerUrl) {
	                try {
	                    // Inject subscription worker into the transport provider stack.
	                    const middleware = new SubscriptionWorkerMiddleware({
	                        clientIdentifier: clientConfiguration._instanceId,
	                        subscriptionKey: clientConfiguration.subscribeKey,
	                        userId: clientConfiguration.getUserId(),
	                        workerUrl: configurationCopy.subscriptionWorkerUrl,
	                        sdkVersion: clientConfiguration.getVersion(),
	                        heartbeatInterval: clientConfiguration.getHeartbeatInterval(),
	                        announceSuccessfulHeartbeats: clientConfiguration.announceSuccessfulHeartbeats,
	                        announceFailedHeartbeats: clientConfiguration.announceFailedHeartbeats,
	                        workerOfflineClientsCheckInterval: platformConfiguration.subscriptionWorkerOfflineClientsCheckInterval,
	                        workerUnsubscribeOfflineClients: platformConfiguration.subscriptionWorkerUnsubscribeOfflineClients,
	                        workerLogVerbosity: platformConfiguration.subscriptionWorkerLogVerbosity,
	                        tokenManager,
	                        transport,
	                        logger: clientConfiguration.logger(),
	                    });
	                    heartbeatIntervalChangeHandler = (interval) => middleware.onHeartbeatIntervalChange(interval);
	                    authenticationChangeHandler = (auth) => middleware.onTokenChange(auth);
	                    userIdChangeHandler = (userId) => middleware.onUserIdChange(userId);
	                    transport = middleware;
	                    window.onpagehide = (event) => {
	                        if (!event.persisted)
	                            middleware.terminate();
	                    };
	                }
	                catch (e) {
	                    clientConfiguration.logger().error('PubNub', () => ({
	                        messageType: 'error',
	                        message: e,
	                    }));
	                }
	            }
	            else if (sharedWorkerRequested) {
	                clientConfiguration
	                    .logger()
	                    .warn('PubNub', 'SharedWorker not supported in this browser. Fallback to the original transport.');
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
	        this.onHeartbeatIntervalChange = heartbeatIntervalChangeHandler;
	        this.onAuthenticationChange = authenticationChangeHandler;
	        this.onUserIdChange = userIdChangeHandler;
	        {
	            if (transport instanceof SubscriptionWorkerMiddleware)
	                transport.emitStatus = this.emitStatus.bind(this);
	        }
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
	        this.logger.debug('PubNub', 'Network down detected');
	        this.emitStatus({ category: PubNub.CATEGORIES.PNNetworkDownCategory });
	        if (this._configuration.restore)
	            this.disconnect(true);
	        else
	            this.destroy(true);
	    }
	    networkUpDetected() {
	        this.logger.debug('PubNub', 'Network up detected');
	        this.emitStatus({ category: PubNub.CATEGORIES.PNNetworkUpCategory });
	        this.reconnect();
	    }
	}
	/**
	 * Data encryption / decryption module constructor.
	 */
	PubNub.CryptoModule = WebCryptoModule ;

	return PubNub;

}));
