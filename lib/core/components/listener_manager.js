'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _flow_interfaces = require('../flow_interfaces');

var _categories = require('../constants/categories');

var _categories2 = _interopRequireDefault(_categories);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class() {
    _classCallCheck(this, _class);

    this._listeners = [];
  }

  _createClass(_class, [{
    key: 'addListener',
    value: function addListener(newListeners) {
      this._listeners.push(newListeners);
    }
  }, {
    key: 'removeListener',
    value: function removeListener(deprecatedListener) {
      var newListeners = [];

      this._listeners.forEach(function (listener) {
        if (listener !== deprecatedListener) newListeners.push(listener);
      });

      this._listeners = newListeners;
    }
  }, {
    key: 'removeAllListeners',
    value: function removeAllListeners() {
      this._listeners = [];
    }
  }, {
    key: 'announcePresence',
    value: function announcePresence(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.presence) listener.presence(announce);
      });
    }
  }, {
    key: 'announceStatus',
    value: function announceStatus(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.status) listener.status(announce);
      });
    }
  }, {
    key: 'announceMessage',
    value: function announceMessage(announce) {
      this._listeners.forEach(function (listener) {
        if (listener.message) listener.message(announce);
      });
    }
  }, {
    key: 'announceNetworkUp',
    value: function announceNetworkUp() {
      var networkStatus = {};
      networkStatus.category = _categories2.default.PNNetworkUpCategory;
      this.announceStatus(networkStatus);
    }
  }, {
    key: 'announceNetworkDown',
    value: function announceNetworkDown() {
      var networkStatus = {};
      networkStatus.category = _categories2.default.PNNetworkDownCategory;
      this.announceStatus(networkStatus);
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=listener_manager.js.map
