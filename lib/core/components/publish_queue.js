'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('./networking');

var _networking2 = _interopRequireDefault(_networking);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PublishItem = function PublishItem() {
  _classCallCheck(this, PublishItem);
};

var _class = function () {
  function _class(_ref) {
    var networking = _ref.networking;

    _classCallCheck(this, _class);

    this._publishQueue = [];
    this._networking = networking;
  }

  _createClass(_class, [{
    key: 'createQueueable',
    value: function createQueueable() {
      return new PublishItem();
    }
  }, {
    key: 'queuePublishItem',
    value: function queuePublishItem(publishItem) {
      this._publishQueue.push(publishItem);
    }
  }, {
    key: 'sendOneMessage',
    value: function sendOneMessage() {
      var publish = this._publishQueue.shift();

      this._networking.performPublish(publish.channel, publish.payload, {
        mode: publish.httpMethod,
        success: publish.onSuccess,
        fail: publish.onFail,
        data: this._networking.prepareParams(publish.params)
      });
    }

    //

  }, {
    key: 'getQueueLength',
    value: function getQueueLength() {
      return this._publishQueue.length;
    }
  }, {
    key: 'setIsSending',
    value: function setIsSending(sendingValue) {
      this._isSending = sendingValue;
      return this;
    }
  }, {
    key: 'isSending',
    value: function isSending() {
      return this._isSending;
    }
  }]);

  return _class;
}();

exports.default = _class;