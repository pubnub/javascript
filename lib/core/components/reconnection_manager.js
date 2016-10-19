'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _time = require('../endpoints/time');

var _time2 = _interopRequireDefault(_time);

var _flow_interfaces = require('../flow_interfaces');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var timeEndpoint = _ref.timeEndpoint;

    _classCallCheck(this, _class);

    this._timeEndpoint = timeEndpoint;
  }

  _createClass(_class, [{
    key: 'onReconnection',
    value: function onReconnection(reconnectionCallback) {
      this._reconnectionCallback = reconnectionCallback;
    }
  }, {
    key: 'startPolling',
    value: function startPolling() {
      this._timeTimer = setInterval(this._performTimeLoop.bind(this), 3000);
    }
  }, {
    key: '_performTimeLoop',
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

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=reconnection_manager.js.map
