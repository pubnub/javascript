"use strict";
/*       */
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
var pubnub_common_1 = __importDefault(require("../core/pubnub-common"));
var networking_1 = __importDefault(require("../networking"));
var common_1 = __importDefault(require("../db/common"));
var nativescript_1 = require("../networking/modules/nativescript");
var default_1 = /** @class */ (function (_super) {
    __extends(default_1, _super);
    function default_1(setup) {
        var _this = this;
        setup.db = new common_1.default();
        setup.networking = new networking_1.default({
            del: nativescript_1.del,
            get: nativescript_1.get,
            post: nativescript_1.post,
            patch: nativescript_1.patch,
        });
        setup.sdkFamily = 'NativeScript';
        _this = _super.call(this, setup) || this;
        return _this;
    }
    return default_1;
}(pubnub_common_1.default));
exports.default = default_1;
