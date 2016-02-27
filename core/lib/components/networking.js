'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var utils = require('../utils');

var _class = function () {
  function _class(xdr) {
    var ssl = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
    var origin = arguments.length <= 2 || arguments[2] === undefined ? 'pubsub.pubnub.com' : arguments[2];

    _classCallCheck(this, _class);

    this._xdr = xdr;

    this._maxSubDomain = 20;
    this._currentSubDomain = Math.floor(Math.random() * this._maxSubDomain);

    this._providedFQDN = (ssl ? 'https://' : 'http://') + origin;

    // create initial origins
    this.shiftStandardOrigin(false);
    this.shiftSubscribeOrigin(false);
  }

  _createClass(_class, [{
    key: 'nextOrigin',
    value: function nextOrigin(failover) {
      // if a custom origin is supplied, use do not bother with shuffling subdomains
      if (this._providedFQDN.indexOf('pubsub.') === -1) {
        return this._providedFQDN;
      }

      var newSubDomain = undefined;

      if (failover) {
        newSubDomain = utils.generateUUID().split('-')[0];
      } else {
        this._currentSubDomain = this._currentSubDomain + 1;

        if (this._currentSubDomain >= this._maxSubDomain) {
          this._currentSubDomain = 1;
        }

        newSubDomain = this._currentSubDomain.toString();
      }

      return this._providedFQDN.replace('pubsub', 'ps' + newSubDomain);
    }

    // origin operations

  }, {
    key: 'shiftStandardOrigin',
    value: function shiftStandardOrigin() {
      var failover = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      this._standardOrigin = this.nextOrigin(failover);

      return this._standardOrigin;
    }
  }, {
    key: 'shiftSubscribeOrigin',
    value: function shiftSubscribeOrigin() {
      var failover = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      this._subscribeOrigin = this.nextOrigin(failover);

      return this._subscribeOrigin;
    }

    // method based URL's

  }, {
    key: 'fetchHistory',
    value: function fetchHistory(channel, _ref) {
      var data = _ref.data;
      var callback = _ref.callback;
      var success = _ref.success;
      var fail = _ref.fail;

      var url = [this.getStandardOrigin(), 'v2', 'history', 'sub-key', this.getSubscribeKey(), 'channel', utils.encode(channel)];

      this._xdr({ data: data, callback: callback, success: success, fail: fail, url: url });
    }
  }, {
    key: 'fetchReplay',
    value: function fetchReplay(source, destination, _ref2) {
      var data = _ref2.data;
      var callback = _ref2.callback;
      var success = _ref2.success;
      var fail = _ref2.fail;

      var url = [this.getStandardOrigin(), 'v1', 'replay', this.getPublishKey(), this.getSubscribeKey(), source, destination];

      this._xdr({ data: data, callback: callback, success: success, fail: fail, url: url });
    }
  }, {
    key: 'fetchTime',
    value: function fetchTime(jsonp, _ref3) {
      var data = _ref3.data;
      var callback = _ref3.callback;
      var success = _ref3.success;
      var fail = _ref3.fail;

      var url = [this.getStandardOrigin(), 'time', jsonp];

      this._xdr({ data: data, callback: callback, success: success, fail: fail, url: url });
    }

    // setters

  }, {
    key: 'setSubscribeKey',
    value: function setSubscribeKey(subscribeKey) {
      this._subscribeKey = subscribeKey;
    }
  }, {
    key: 'setPublishKey',
    value: function setPublishKey(publishKey) {
      this._publishKey = publishKey;
    }
  }, {
    key: 'getOrigin',
    value: function getOrigin() {
      return this._providedFQDN;
    }

    // getters

  }, {
    key: 'getSubscribeKey',
    value: function getSubscribeKey() {
      return this._subscribeKey;
    }
  }, {
    key: 'getPublishKey',
    value: function getPublishKey() {
      return this._publishKey;
    }
  }, {
    key: 'getStandardOrigin',
    value: function getStandardOrigin() {
      return this._standardOrigin;
    }
  }, {
    key: 'getSubscribeOrigin',
    value: function getSubscribeOrigin() {
      return this._subscribeOrigin;
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=networking.js.map
