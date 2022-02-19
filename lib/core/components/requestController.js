"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var Signal = function () {
  function Signal() {
    (0, _classCallCheck2["default"])(this, Signal);
    this._events = {};
    this.aborted = false;
  }

  (0, _createClass2["default"])(Signal, [{
    key: "on",
    value: function on(name, listener) {
      if (!this._events[name]) {
        this._events[name] = [];
      }

      this._events[name].push(listener);
    }
  }, {
    key: "emit",
    value: function emit(name) {
      var fireCallbacks = function fireCallbacks(callback) {
        callback();
      };

      this._events[name].forEach(fireCallbacks);
    }
  }]);
  return Signal;
}();

var RequestController = function () {
  function RequestController() {
    (0, _classCallCheck2["default"])(this, RequestController);
    this.signal = new Signal();
  }

  (0, _createClass2["default"])(RequestController, [{
    key: "abort",
    value: function abort() {
      if (this.signal.aborted) return;
      this.signal.aborted = true;
      this.signal.emit('abort');
    }
  }]);
  return RequestController;
}();

exports["default"] = RequestController;
module.exports = exports.default;
//# sourceMappingURL=requestController.js.map
