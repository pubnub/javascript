"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _flow_interfaces = require("../flow_interfaces");

var _categories = _interopRequireDefault(require("../constants/categories"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = function () {
  function _default() {
    _classCallCheck(this, _default);

    _defineProperty(this, "_listeners", void 0);

    this._listeners = [];
  }

  _createClass(_default, [{
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
