"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _flow_interfaces = require("../flow_interfaces");

var _categories = _interopRequireDefault(require("../constants/categories"));

var _default = function () {
  function _default() {
    (0, _classCallCheck2["default"])(this, _default);
    (0, _defineProperty2["default"])(this, "_listeners", void 0);
    this._listeners = [];
  }

  (0, _createClass2["default"])(_default, [{
    key: "addListener",
    value: function addListener(newListeners) {
      this._listeners.push(newListeners);
    }
  }, {
    key: "removeListener",
    value: function removeListener(deprecatedListener) {
      var newListeners = [];

      this._listeners.forEach(function (listener) {
        if (listener !== deprecatedListener) newListeners.push(listener);
      });

      this._listeners = newListeners;
    }
  }, {
    key: "removeAllListeners",
    value: function removeAllListeners() {
      this._listeners = [];
    }
  }, {
    key: "announcePresence",
    value: function announcePresence(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.presence) listener.presence(announce);
      });
    }
  }, {
    key: "announceStatus",
    value: function announceStatus(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.status) listener.status(announce);
      });
    }
  }, {
    key: "announceMessage",
    value: function announceMessage(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.message) listener.message(announce);
      });
    }
  }, {
    key: "announceSignal",
    value: function announceSignal(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.signal) listener.signal(announce);
      });
    }
  }, {
    key: "announceMessageAction",
    value: function announceMessageAction(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.messageAction) listener.messageAction(announce);
      });
    }
  }, {
    key: "announceFile",
    value: function announceFile(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.file) listener.file(announce);
      });
    }
  }, {
    key: "announceObjects",
    value: function announceObjects(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.objects) listener.objects(announce);
      });
    }
  }, {
    key: "announceUser",
    value: function announceUser(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.user) listener.user(announce);
      });
    }
  }, {
    key: "announceSpace",
    value: function announceSpace(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.space) listener.space(announce);
      });
    }
  }, {
    key: "announceMembership",
    value: function announceMembership(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.membership) listener.membership(announce);
      });
    }
  }, {
    key: "announceNetworkUp",
    value: function announceNetworkUp() {
      var networkStatus = {};
      networkStatus.category = _categories["default"].PNNetworkUpCategory;
      this.announceStatus(networkStatus);
    }
  }, {
    key: "announceNetworkDown",
    value: function announceNetworkDown() {
      var networkStatus = {};
      networkStatus.category = _categories["default"].PNNetworkDownCategory;
      this.announceStatus(networkStatus);
    }
  }]);
  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=listener_manager.js.map
