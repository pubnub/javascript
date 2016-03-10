'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pick2 = require('lodash/pick');

var _pick3 = _interopRequireDefault(_pick2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class() {
    _classCallCheck(this, _class);
  }

  _createClass(_class, null, [{
    key: 'callback',
    value: function callback(response, _callback, err) {
      if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object') {
        if (response.error) {
          var preparedData = (0, _pick3.default)(response, ['message', 'payload']);
          if (err) err(preparedData);
          return;
        }
        if (response.payload) {
          if (response.next_page) {
            if (_callback) _callback(response.payload, response.next_page);
          } else {
            if (_callback) _callback(response.payload);
          }
          return;
        }
      }
      if (_callback) _callback(response);
    }
  }, {
    key: 'error',
    value: function error(response, err) {
      if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object' && response.error) {
        var preparedData = (0, _pick3.default)(response, ['message', 'payload']);
        if (err) return err(preparedData);
      } else {
        if (err) return err(response);
      }
    }
  }]);

  return _class;
}();

exports.default = _class;