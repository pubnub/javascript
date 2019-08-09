"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _time = _interopRequireDefault(require("../endpoints/time"));

var _flow_interfaces = require("../flow_interfaces");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = function () {
  function _default(_ref) {
    var timeEndpoint = _ref.timeEndpoint;

    _classCallCheck(this, _default);

    _defineProperty(this, "_reconnectionCallback", void 0);

    _defineProperty(this, "_timeEndpoint", void 0);

    _defineProperty(this, "_timeTimer", void 0);

    this._timeEndpoint = timeEndpoint;
  }

  _createClass(_default, [{
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
