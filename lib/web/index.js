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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyBufferKeys = void 0;
var cbor_js_1 = __importDefault(require("cbor-js"));
var pubnub_common_1 = __importDefault(require("../core/pubnub-common"));
var networking_1 = __importDefault(require("../networking"));
var base64_codec_1 = require("../core/components/base64_codec");
var common_1 = __importDefault(require("../cbor/common"));
var web_node_1 = require("../networking/modules/web-node");
var web_1 = __importDefault(require("../crypto/modules/web"));
var web_2 = __importDefault(require("../file/modules/web"));
function sendBeacon(url) {
    if (navigator && navigator.sendBeacon) {
        navigator.sendBeacon(url);
    }
    else {
        return false;
    }
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
exports.stringifyBufferKeys = stringifyBufferKeys;
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
        setup.cbor = new common_1.default(function (arrayBuffer) { return stringifyBufferKeys(cbor_js_1.default.decode(arrayBuffer)); }, base64_codec_1.decode);
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
