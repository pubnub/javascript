"use strict";
/* eslint no-bitwise: ["error", { "allow": ["~", "&", ">>"] }] */
/* global navigator, window */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var cbor_js_1 = require("cbor-js");
var pubnub_common_1 = require("../core/pubnub-common");
var networking_1 = require("../networking");
var hmac_sha256_1 = require("../core/components/cryptography/hmac-sha256");
var common_1 = require("../cbor/common");
var web_node_1 = require("../networking/modules/web-node");
var web_1 = require("../crypto/modules/web");
var web_2 = require("../file/modules/web");
function sendBeacon(url) {
    if (navigator && navigator.sendBeacon) {
        navigator.sendBeacon(url);
    }
    else {
        return false;
    }
}
function base64ToBinary(base64String) {
    var parsedWordArray = hmac_sha256_1.default.enc.Base64.parse(base64String).words;
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
        setup.sdkFamily = 'Web';
        setup.networking = new networking_1.default({
            del: web_node_1.del,
            get: web_node_1.get,
            post: web_node_1.post,
            patch: web_node_1.patch,
            sendBeacon: sendBeacon,
            getfile: web_node_1.getfile,
            postfile: web_node_1.postfile,
        });
        setup.cbor = new common_1.default(function (arrayBuffer) { return stringifyBufferKeys(cbor_js_1.default.decode(arrayBuffer)); }, base64ToBinary);
        setup.PubNubFile = web_2.default;
        setup.cryptography = new web_1.default();
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
}(pubnub_common_1.default));
exports.default = default_1;
