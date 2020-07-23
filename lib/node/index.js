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

var _cborSync = _interopRequireDefault(require("cbor-sync"));

var _pubnubCommon = _interopRequireDefault(require("../core/pubnub-common"));

var _networking = _interopRequireDefault(require("../networking"));

var _common = _interopRequireDefault(require("../db/common"));

var _common2 = _interopRequireDefault(require("../cbor/common"));

var _file = _interopRequireDefault(require("./file"));

var _webNode = require("../networking/modules/web-node");

var _node = require("../networking/modules/node");

var _flow_interfaces = require("../core/flow_interfaces");

var _default = function (_PubNubCore) {
  (0, _inherits2["default"])(_default, _PubNubCore);

  function _default(setup) {
    var _this;

    (0, _classCallCheck2["default"])(this, _default);
    setup.db = new _common["default"]();
    setup.cbor = new _common2["default"](_cborSync["default"].decode, function (base64String) {
      return new Buffer.from(base64String, 'base64');
    });
    setup.networking = new _networking["default"]({
      keepAlive: _node.keepAlive,
      del: _webNode.del,
      get: _webNode.get,
      post: _webNode.post,
      patch: _webNode.patch,
      proxy: _node.proxy,
      file: _webNode.file
    });
    setup.sdkFamily = 'Nodejs';

    if (!('ssl' in setup)) {
      setup.ssl = true;
    }

    _this = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(_default).call(this, setup));
    _this.File = _file["default"];
    return _this;
  }

  return _default;
}(_pubnubCommon["default"]);

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=index.js.map
