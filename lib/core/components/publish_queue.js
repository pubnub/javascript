'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('./networking');

var _networking2 = _interopRequireDefault(_networking);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// disable one-at-a-time publishing queue and publish on call.

var PublishItem = function PublishItem() {
  _classCallCheck(this, PublishItem);
};

var _class = function () {
  function _class(_ref) {
    var networking = _ref.networking;
    var _ref$parallelPublish = _ref.parallelPublish;
    var parallelPublish = _ref$parallelPublish === undefined ? false : _ref$parallelPublish;

    _classCallCheck(this, _class);

    this._publishQueue = [];
    this._networking = networking;
    this._parallelPublish = parallelPublish;
    this._isSending = false;
  }

  _createClass(_class, [{
    key: 'newQueueable',
    value: function newQueueable() {
      return new PublishItem();
    }
  }, {
    key: 'queueItem',
    value: function queueItem(publishItem) {
      this._publishQueue.push(publishItem);
      this._sendNext();
    }
  }, {
    key: '_sendNext',
    value: function _sendNext() {
      // if we have nothing to send, return right away.
      if (this._publishQueue.length === 0) {
        return;
      }

      // if parallel publish is enabled, always send.
      if (this._parallelPublish) {
        return this.__publishNext();
      }

      // if something is sending, wait for it to finish up.
      if (this._isSending) {
        return;
      }

      this._isSending = true;
      this.__publishNext();
    }
  }, {
    key: '__publishNext',
    value: function __publishNext() {
      var _this = this;

      var _publishQueue$shift = this._publishQueue.shift();

      var channel = _publishQueue$shift.channel;
      var payload = _publishQueue$shift.payload;
      var params = _publishQueue$shift.params;
      var httpMethod = _publishQueue$shift.httpMethod;
      var callback = _publishQueue$shift.callback;


      var onPublish = function onPublish(err, response) {
        _this._isSending = false;
        _this._sendNext();
        callback(err, response);
      };

      this._networking.performPublish(channel, payload, params, httpMethod, onPublish);
    }
  }]);

  return _class;
}();

exports.default = _class;