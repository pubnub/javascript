'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var moduleLogger = function () {
  function moduleLogger() {
    _classCallCheck(this, moduleLogger);
  }

  _createClass(moduleLogger, [{
    key: '__commonLogger',
    value: function __commonLogger(level, payload) {
      _loglevel2.default[level]({
        component: this._moduleName,
        data: payload,
        timestamp: new Date()
      });
    }
  }, {
    key: 'error',
    value: function error(payload) {
      this.__commonLogger('error', payload);
    }
  }, {
    key: 'debug',
    value: function debug(payload) {
      this.__commonLogger('debug', payload);
    }
  }]);

  return moduleLogger;
}();

exports.default = {
  getLogger: function getLogger(moduleName) {
    return new moduleLogger(moduleName);
  }
};