"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {

  /*
    if requestId config is true, the SDK will pass a unique request identifier
    with each request as request_id=<UUID>
  */

  function _class() {
    _classCallCheck(this, _class);

    this._instanceId = false;
    this._requestId = false;
  }

  /*
    TODO: fill readme
  */


  /*
    if instanceId config is true, the SDK will pass the unique instance
    identifier to the server as instanceId=<UUID>
  */


  _createClass(_class, [{
    key: "setInstanceIdConfig",
    value: function setInstanceIdConfig(configValue) {
      this._instanceId = configValue;
      return this;
    }
  }, {
    key: "setRequestIdConfig",
    value: function setRequestIdConfig(configValue) {
      this._requestId = configValue;
      return this;
    }
  }, {
    key: "setCloakConfig",
    value: function setCloakConfig(configValue) {
      this._cloak = configValue;
      return this;
    }
  }, {
    key: "isInstanceIdEnabled",
    value: function isInstanceIdEnabled() {
      return this._instanceId;
    }
  }, {
    key: "isRequestIdEnabled",
    value: function isRequestIdEnabled() {
      return this._requestId;
    }
  }, {
    key: "isCloakEnabled",
    value: function isCloakEnabled() {
      return this._cloak;
    }
  }]);

  return _class;
}();

exports.default = _class;
//# sourceMappingURL=config.js.map
