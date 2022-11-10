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
var cbor_sync_1 = __importDefault(require("cbor-sync"));
var pubnub_common_1 = __importDefault(require("../core/pubnub-common"));
var networking_1 = __importDefault(require("../networking"));
var common_1 = __importDefault(require("../cbor/common"));
var base64_codec_1 = require("../core/components/base64_codec");
var web_node_1 = require("../networking/modules/web-node");
var node_1 = require("../networking/modules/node");
var node_2 = __importDefault(require("../crypto/modules/node"));
var node_3 = __importDefault(require("../file/modules/node"));
module.exports = /** @class */ (function (_super) {
    __extends(class_1, _super);
    function class_1(setup) {
        var _this = this;
        setup.cbor = new common_1.default(function (buffer) { return cbor_sync_1.default.decode(Buffer.from(buffer)); }, base64_codec_1.decode);
        setup.networking = new networking_1.default({
            keepAlive: node_1.keepAlive,
            del: web_node_1.del,
            get: web_node_1.get,
            post: web_node_1.post,
            patch: web_node_1.patch,
            proxy: node_1.proxy,
            getfile: web_node_1.getfile,
            postfile: web_node_1.postfile,
        });
        setup.sdkFamily = 'Nodejs';
        setup.PubNubFile = node_3.default;
        setup.cryptography = new node_2.default();
        if (!('ssl' in setup)) {
            setup.ssl = true;
        }
        _this = _super.call(this, setup) || this;
        return _this;
    }
    return class_1;
}(pubnub_common_1.default));
