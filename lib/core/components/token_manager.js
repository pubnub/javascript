"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _config = _interopRequireDefault(require("./config"));

var _flow_interfaces = require("../flow_interfaces");

var _default = function () {
  function _default(config, cbor) {
    (0, _classCallCheck2["default"])(this, _default);
    (0, _defineProperty2["default"])(this, "_config", void 0);
    (0, _defineProperty2["default"])(this, "_cbor", void 0);
    (0, _defineProperty2["default"])(this, "_token", void 0);
    this._config = config;
    this._cbor = cbor;
  }

  (0, _createClass2["default"])(_default, [{
    key: "setToken",
    value: function setToken(token) {
      if (token && token.length > 0) {
        this._token = token;
      } else {
        this._token = undefined;
      }
    }
  }, {
    key: "getToken",
    value: function getToken() {
      return this._token;
    }
  }, {
    key: "extractPermissions",
    value: function extractPermissions(permissions) {
      var permissionsResult = {
        read: false,
        write: false,
        manage: false,
        "delete": false,
        get: false,
        update: false,
        join: false
      };

      if ((permissions & 128) === 128) {
        permissionsResult.join = true;
      }

      if ((permissions & 64) === 64) {
        permissionsResult.update = true;
      }

      if ((permissions & 32) === 32) {
        permissionsResult.get = true;
      }

      if ((permissions & 8) === 8) {
        permissionsResult["delete"] = true;
      }

      if ((permissions & 4) === 4) {
        permissionsResult.manage = true;
      }

      if ((permissions & 2) === 2) {
        permissionsResult.write = true;
      }

      if ((permissions & 1) === 1) {
        permissionsResult.read = true;
      }

      return permissionsResult;
    }
  }, {
    key: "parseToken",
    value: function parseToken(tokenString) {
      var _this = this;

      var parsed = this._cbor.decodeToken(tokenString);

      if (parsed !== undefined) {
        var uuidResourcePermissions = parsed.res.uuid ? Object.keys(parsed.res.uuid) : [];
        var channelResourcePermissions = Object.keys(parsed.res.chan);
        var groupResourcePermissions = Object.keys(parsed.res.grp);
        var uuidPatternPermissions = parsed.pat.uuid ? Object.keys(parsed.pat.uuid) : [];
        var channelPatternPermissions = Object.keys(parsed.pat.chan);
        var groupPatternPermissions = Object.keys(parsed.pat.grp);
        var result = {
          version: parsed.v,
          timestamp: parsed.t,
          ttl: parsed.ttl,
          authorized_uuid: parsed.uuid
        };
        var uuidResources = uuidResourcePermissions.length > 0;
        var channelResources = channelResourcePermissions.length > 0;
        var groupResources = groupResourcePermissions.length > 0;

        if (uuidResources || channelResources || groupResources) {
          result.resources = {};

          if (uuidResources) {
            result.resources.uuids = {};
            uuidResourcePermissions.forEach(function (id) {
              result.resources.uuids[id] = _this.extractPermissions(parsed.res.uuid[id]);
            });
          }

          if (channelResources) {
            result.resources.channels = {};
            channelResourcePermissions.forEach(function (id) {
              result.resources.channels[id] = _this.extractPermissions(parsed.res.chan[id]);
            });
          }

          if (groupResources) {
            result.resources.groups = {};
            groupResourcePermissions.forEach(function (id) {
              result.resources.groups[id] = _this.extractPermissions(parsed.res.grp[id]);
            });
          }
        }

        var uuidPatterns = uuidPatternPermissions.length > 0;
        var channelPatterns = channelPatternPermissions.length > 0;
        var groupPatterns = groupPatternPermissions.length > 0;

        if (uuidPatterns || channelPatterns || groupPatterns) {
          result.patterns = {};

          if (uuidPatterns) {
            result.patterns.uuids = {};
            uuidPatternPermissions.forEach(function (id) {
              result.patterns.uuids[id] = _this.extractPermissions(parsed.pat.uuid[id]);
            });
          }

          if (channelPatterns) {
            result.patterns.channels = {};
            channelPatternPermissions.forEach(function (id) {
              result.patterns.channels[id] = _this.extractPermissions(parsed.pat.chan[id]);
            });
          }

          if (groupPatterns) {
            result.patterns.groups = {};
            groupPatternPermissions.forEach(function (id) {
              result.patterns.groups[id] = _this.extractPermissions(parsed.pat.grp[id]);
            });
          }
        }

        if (Object.keys(parsed.meta).length > 0) {
          result.meta = parsed.meta;
        }

        result.signature = parsed.sig;
        return result;
      } else {
        return undefined;
      }
    }
  }]);
  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=token_manager.js.map
