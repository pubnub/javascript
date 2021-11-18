"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _cborSync = _interopRequireDefault(require("cbor-sync"));

var _pubnubCommon = _interopRequireDefault(require("../core/pubnub-common"));

var _networking = _interopRequireDefault(require("../networking"));

var _common = _interopRequireDefault(require("../db/common"));

var _common2 = _interopRequireDefault(require("../cbor/common"));

var _webNode = require("../networking/modules/web-node");

var _node = require("../networking/modules/node");

var _flow_interfaces = require("../core/flow_interfaces");

var _node2 = _interopRequireDefault(require("../crypto/modules/node"));

var _node3 = _interopRequireDefault(require("../file/modules/node"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var _default = function (_PubNubCore) {
  (0, _inherits2["default"])(_default, _PubNubCore);

  var _super = _createSuper(_default);

  function _default(setup) {
    (0, _classCallCheck2["default"])(this, _default);
    setup.db = new _common["default"]();
    setup.cbor = new _common2["default"](_cborSync["default"].decode, function (base64String) {
      return Buffer.from(base64String, 'base64');
    });
    setup.networking = new _networking["default"]({
      keepAlive: _node.keepAlive,
      del: _webNode.del,
      get: _webNode.get,
      post: _webNode.post,
      patch: _webNode.patch,
      proxy: _node.proxy,
      getfile: _webNode.getfile,
      postfile: _webNode.postfile
    });
    setup.sdkFamily = 'Nodejs';
    setup.PubNubFile = _node3["default"];
    setup.cryptography = new _node2["default"]();

    if (!('ssl' in setup)) {
      setup.ssl = true;
    }

    return _super.call(this, setup);
  }

  return _default;
}(_pubnubCommon["default"]);

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=index.js.map
