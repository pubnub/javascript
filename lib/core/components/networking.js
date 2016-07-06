'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _index = require('./cryptography/index');

var _index2 = _interopRequireDefault(_index);

var _config = require('./config.js');

var _config2 = _interopRequireDefault(_config);

var _flow_interfaces = require('../flow_interfaces');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var config = _ref.config;
    var crypto = _ref.crypto;
    var sendBeacon = _ref.sendBeacon;

    _classCallCheck(this, _class);

    this._config = config;
    this._crypto = crypto;
    this._sendBeacon = sendBeacon;

    this._maxSubDomain = 20;
    this._currentSubDomain = Math.floor(Math.random() * this._maxSubDomain);

    this._providedFQDN = (this._config.secure ? 'https://' : 'http://') + this._config.origin;
    this._coreParams = {};

    this.shiftStandardOrigin();
  }

  _createClass(_class, [{
    key: 'nextOrigin',
    value: function nextOrigin() {
      if (this._providedFQDN.indexOf('pubsub.') === -1) {
        return this._providedFQDN;
      }

      var newSubDomain = void 0;

      this._currentSubDomain = this._currentSubDomain + 1;

      if (this._currentSubDomain >= this._maxSubDomain) {
        this._currentSubDomain = 1;
      }

      newSubDomain = this._currentSubDomain.toString();

      return this._providedFQDN.replace('pubsub', 'ps' + newSubDomain);
    }
  }, {
    key: 'shiftStandardOrigin',
    value: function shiftStandardOrigin() {
      var failover = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      this._standardOrigin = this.nextOrigin(failover);

      return this._standardOrigin;
    }
  }, {
    key: 'getStandardOrigin',
    value: function getStandardOrigin() {
      return this._standardOrigin;
    }
  }, {
    key: 'POST',
    value: function POST(params, body, endpoint, callback) {
      var superagentConstruct = _superagent2.default.post(this.getStandardOrigin() + endpoint.url).query(params).send(body);
      return this._abstractedXDR(superagentConstruct, endpoint.timeout, callback);
    }
  }, {
    key: 'GET',
    value: function GET(params, endpoint, callback) {
      var superagentConstruct = _superagent2.default.get(this.getStandardOrigin() + endpoint.url).query(params);
      return this._abstractedXDR(superagentConstruct, endpoint.timeout, callback);
    }
  }, {
    key: '_abstractedXDR',
    value: function _abstractedXDR(superagentConstruct, timeout, callback) {
      var _this = this;

      if (this._config.logVerbosity) {
        superagentConstruct = superagentConstruct.use(this._logger());
      }

      return superagentConstruct.type('json').timeout(timeout || this._config.getTransactionTimeout()).end(function (err, resp) {
        var status = {};
        status.error = err !== null;

        if (resp && resp.status) {
          status.statusCode = resp.status;
        }

        if (err) {
          status.errorData = err;
          status.category = _this._detectErrorCategory(err);

          return callback(status, null);
        }

        var parsedResponse = JSON.parse(resp.text);
        return callback(status, parsedResponse);
      });
    }
  }, {
    key: '_detectErrorCategory',
    value: function _detectErrorCategory(err) {
      if (err.code === 'ENOTFOUND') return 'PNNetworkIssuesCategory';
      if (err.timeout) return 'PNTimeoutCategory';

      if (err.response) {
        if (err.response.badRequest) return 'PNBadRequestCategory';
        if (err.response.forbidden) return 'PNAccessDeniedCategory';
      }

      return 'PNUnknownCategory';
    }
  }, {
    key: '_logger',
    value: function _logger(options) {
      if (!options) options = {};
      return this._attachSuperagentLogger.bind(null, options);
    }
  }, {
    key: '_attachSuperagentLogger',
    value: function _attachSuperagentLogger(options, req) {
      var start = new Date().getTime();
      var timestamp = new Date().toISOString();
      console.log('<<<<<');
      console.log('[' + timestamp + ']', '\n', req.url, '\n', req.qs);
      console.log('-----');

      req.on('response', function (res) {
        var now = new Date().getTime();
        var elapsed = now - start;
        var timestampDone = new Date().toISOString();

        console.log('>>>>>>');
        console.log('[' + timestampDone + ' / ' + elapsed + ']', '\n', req.url, '\n', req.qs, '\n', res.text);
        console.log('-----');
      });
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=networking.js.map
