"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _pubnubCommon = _interopRequireDefault(require("../core/pubnub-common"));

var _networking = _interopRequireDefault(require("../networking"));

var _common = _interopRequireDefault(require("../db/common"));

var _nativescript = require("../networking/modules/nativescript");

var _flow_interfaces = require("../core/flow_interfaces");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var _default = function (_PubNubCore) {
  _inherits(_default, _PubNubCore);

  function _default(setup) {
    _classCallCheck(this, _default);

    setup.db = new _common["default"]();
    setup.networking = new _networking["default"]({
      del: _nativescript.del,
      get: _nativescript.get,
      post: _nativescript.post,
      patch: _nativescript.patch
    });
    setup.sdkFamily = 'NativeScript';
    return _possibleConstructorReturn(this, _getPrototypeOf(_default).call(this, setup));
  }

  return _default;
}(_pubnubCommon["default"]);

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=index.js.map
