"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _time = _interopRequireDefault(require("../endpoints/time"));

var _flow_interfaces = require("../flow_interfaces");

var _default = function () {
  function _default(_ref) {
    var timeEndpoint = _ref.timeEndpoint;
    (0, _classCallCheck2["default"])(this, _default);
    (0, _defineProperty2["default"])(this, "_reconnectionCallback", void 0);
    (0, _defineProperty2["default"])(this, "_timeEndpoint", void 0);
    (0, _defineProperty2["default"])(this, "_timeTimer", void 0);
    this._timeEndpoint = timeEndpoint;
  }

  (0, _createClass2["default"])(_default, [{
    key: "onReconnection",
    value: function onReconnection(reconnectionCallback) {
      this._reconnectionCallback = reconnectionCallback;
    }
  }, {
    key: "startPolling",
    value: function startPolling() {
      this._timeTimer = setInterval(this._performTimeLoop.bind(this), 3000);
    }
  }, {
    key: "stopPolling",
    value: function stopPolling() {
      clearInterval(this._timeTimer);
    }
  }, {
    key: "_performTimeLoop",
    value: function _performTimeLoop() {
      var _this = this;

      this._timeEndpoint(function (status) {
        if (!status.error) {
          clearInterval(_this._timeTimer);

          _this._reconnectionCallback();
        }
      });
    }
  }]);
  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=reconnection_manager.js.map
