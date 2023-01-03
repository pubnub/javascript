"use strict";
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
var cbor_js_1 = __importDefault(require("cbor-js"));
var buffer_1 = require("buffer");
var pubnub_common_1 = __importDefault(require("../core/pubnub-common"));
var networking_1 = __importDefault(require("../networking"));
var base64_codec_1 = require("../core/components/base64_codec");
var stringify_buffer_keys_1 = require("../core/components/stringify_buffer_keys");
var common_1 = __importDefault(require("../cbor/common"));
var web_node_1 = require("../networking/modules/web-node");
var react_native_1 = require("../networking/modules/react_native");
var react_native_2 = __importDefault(require("../file/modules/react-native"));
global.Buffer = global.Buffer || buffer_1.Buffer;
var default_1 = /** @class */ (function (_super) {
    __extends(default_1, _super);
    function default_1(setup) {
        var _this = this;
        setup.cbor = new common_1.default(function (arrayBuffer) { return (0, stringify_buffer_keys_1.stringifyBufferKeys)(cbor_js_1.default.decode(arrayBuffer)); }, base64_codec_1.decode);
        setup.PubNubFile = react_native_2.default;
        setup.networking = new networking_1.default({
            del: web_node_1.del,
            get: web_node_1.get,
            post: web_node_1.post,
            patch: web_node_1.patch,
            getfile: react_native_1.getfile,
            postfile: react_native_1.postfile,
        });
        setup.sdkFamily = 'ReactNative';
        setup.ssl = true;
        _this = _super.call(this, setup) || this;
        return _this;
    }
    return default_1;
}(pubnub_common_1.default));
exports.default = default_1;
