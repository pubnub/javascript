"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {

  /*
    how often (in seconds) the client should announce its presence to server
  */


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
    configuration to supress leave events; when a presence leave is performed
    this configuration will disallow the leave event from happening
  */


  /*
    how long the server will wait before declaring that the client is gone.
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
    key: "setHeartbeatInterval",
    value: function setHeartbeatInterval(configValue) {
      this._heartbeatInterval = configValue;
      return this;
    }
  }, {
    key: "setPresenceTimeout",
    value: function setPresenceTimeout(configValue) {
      this._presenceTimeout = configValue;
      return this;
    }
  }, {
    key: "setSupressLeaveEvents",
    value: function setSupressLeaveEvents(configValue) {
      this._suppressLeaveEvents = configValue;
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
    key: "isSuppressingLeaveEvents",
    value: function isSuppressingLeaveEvents() {
      return this._suppressLeaveEvents;
    }
  }, {
    key: "getHeartbeatInterval",
    value: function getHeartbeatInterval() {
      return this._heartbeatInterval;
    }
  }, {
    key: "getPresenceTimeout",
    value: function getPresenceTimeout() {
      return this._presenceTimeout;
    }
  }]);

  return _class;
}();

exports.default = _class;