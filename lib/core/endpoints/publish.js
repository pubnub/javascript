'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('../components/networking');

var _networking2 = _interopRequireDefault(_networking);

var _responders = require('../presenters/responders');

var _responders2 = _interopRequireDefault(_responders);

var _logger = require('../components/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var networking = _ref.networking;

    _classCallCheck(this, _class);

    this._networking = networking;
    this._r = new _responders2.default('#endpoints/publish');
    this._l = _logger2.default.getLogger('#endpoints/publish');
  }

  _createClass(_class, [{
    key: 'publish',
    value: function publish(args, callback) {
      var message = args.message;
      var channel = args.channel;
      var meta = args.meta;
      var _args$sendByPost = args.sendByPost;
      var sendByPost = _args$sendByPost === undefined ? false : _args$sendByPost;
      var storeInHistory = args.storeInHistory;


      if (!message) return callback(this._r.validationError('Missing Message'));
      if (!channel) return callback(this._r.validationError('Missing Channel'));

      var params = {};

      if (!storeInHistory) {
        params.store = '0';
      }

      if (meta && (typeof meta === 'undefined' ? 'undefined' : _typeof(meta)) === 'object') {
        params.meta = JSON.stringify(meta);
      }

      publishItem.payload = message;
      publishItem.channel = channel;
      publishItem.params = params;
      publishItem.httpMethod = sendByPost ? 'POST' : 'GET';
      publishItem.callback = callback;

      this._publishQueue.queueItem(publishItem);
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];