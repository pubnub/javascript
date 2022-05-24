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
exports.default = void 0;
var cbor_sync_1 = __importDefault(require("cbor-sync"));
var pubnub_common_1 = __importDefault(require("../core/pubnub-common"));
var networking_1 = __importDefault(require("../networking"));
var common_1 = __importDefault(require("../cbor/common"));
var titanium_1 = require("../networking/modules/titanium");
var PubNub = /** @class */ (function (_super) {
    __extends(PubNub, _super);
    function PubNub(setup) {
        var _this = this;
        setup.cbor = new common_1.default(cbor_sync_1.default.decode, function (base64String) { return Buffer.from(base64String, 'base64'); });
        setup.sdkFamily = 'TitaniumSDK';
        setup.networking = new networking_1.default({
            del: titanium_1.del,
            get: titanium_1.get,
            post: titanium_1.post,
            patch: titanium_1.patch,
        });
        _this = _super.call(this, setup) || this;
        return _this;
    }
    return PubNub;
}(pubnub_common_1.default));
exports.default = PubNub;
