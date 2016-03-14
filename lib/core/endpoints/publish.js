'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _publish_queue = require('../components/publish_queue');

var _publish_queue2 = _interopRequireDefault(_publish_queue);

var _responders = require('../presenters/responders');

var _responders2 = _interopRequireDefault(_responders);

var _logger = require('../components/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// store the published message in remote history

var _class = function () {
  function _class(_ref) {
    var encrypt = _ref.encrypt;
    var publishQueue = _ref.publishQueue;

    _classCallCheck(this, _class);

    this._encrypt = encrypt;
    this._publishQueue = publishQueue;
    this._r = new _responders2.default('#endpoints/publish');
    this._l = _logger2.default.getLogger('#endpoints/publish');
  }

  _createClass(_class, [{
    key: 'publish',
    value: function publish(args, callback) {
      var message = args.message;
      var channel = args.channel;
      var cipherKey = args.cipherKey;
      var _args$sendByPost = args.sendByPost;
      var sendByPost = _args$sendByPost === undefined ? false : _args$sendByPost;
      var _args$storeInHistory = args.storeInHistory;
      var storeInHistory = _args$storeInHistory === undefined ? true : _args$storeInHistory;


      if (!message) {
        return callback(this._r.validationError('Missing Message'));
      }

      if (!channel) {
        return callback(this._r.validationError('Missing Channel'));
      }

      var params = {};
      var publishItem = this._publishQueue.newQueueable();

      if (!storeInHistory) {
        params.store = '0';
      }

      publishItem.payload = JSON.stringify(this._encrypt(message, cipherKey));
      publishItem.channel = channel;
      publishItem.params = params;
      publishItem.httpMethod = sendByPost ? 'POST' : 'GET';
      publishItem.callback = callback;

      // Queue Message Send
      this._publishQueue.queueItem(publishItem);
    }
  }]);

  return _class;
}();

exports.default = _class;