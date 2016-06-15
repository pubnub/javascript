'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(componenetName) {
    _classCallCheck(this, _class);

    this._componentName = componenetName;
  }

  _createClass(_class, [{
    key: 'callback',
    value: function callback(response, _callback) {
      if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object') {
        if (response.error) {
          this.error(response, _callback);
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
    value: function error(response, callback) {
      if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object' && response.error) {
        var preparedData = _pick(response, ['message', 'payload']);
        return this._createError(callback, preparedData, 'httpResultError');
      } else {
        return this._createError(callback, { message: response }, 'httpResultError');
      }
    }
  }, {
    key: 'validationError',
    value: function validationError(message) {
      return this._createError({ message: message }, 'validationError');
    }
  }, {
    key: '_createError',
    value: function _createError(errorPayload, type) {
      errorPayload.component = this._componentName;
      errorPayload.type = type;
      return errorPayload;
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=responders.js.map
