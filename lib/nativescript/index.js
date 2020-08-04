"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _pubnubCommon = _interopRequireDefault(require("../core/pubnub-common"));

var _networking = _interopRequireDefault(require("../networking"));

var _common = _interopRequireDefault(require("../db/common"));

var _nativescript = require("../networking/modules/nativescript");

var _flow_interfaces = require("../core/flow_interfaces");

var _default = function (_PubNubCore) {
  (0, _inherits2["default"])(_default, _PubNubCore);

  function _default(setup) {
    (0, _classCallCheck2["default"])(this, _default);
    setup.db = new _common["default"]();
    setup.networking = new _networking["default"]({
      del: _nativescript.del,
      get: _nativescript.get,
      post: _nativescript.post,
      patch: _nativescript.patch
    });
    setup.sdkFamily = 'NativeScript';
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(_default).call(this, setup));
  }

  return _default;
}(_pubnubCommon["default"]);

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=index.js.map
