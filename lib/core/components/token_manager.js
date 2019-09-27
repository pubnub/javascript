"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = _interopRequireDefault(require("./config"));

var _flow_interfaces = require("../flow_interfaces");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = function () {
  function _default(config, cbor) {
    _classCallCheck(this, _default);

    _defineProperty(this, "_config", void 0);

    _defineProperty(this, "_cbor", void 0);

    _defineProperty(this, "_userTokens", void 0);

    _defineProperty(this, "_spaceTokens", void 0);

    _defineProperty(this, "_userToken", void 0);

    _defineProperty(this, "_spaceToken", void 0);

    this._config = config;
    this._cbor = cbor;

    this._initializeTokens();
  }

  _createClass(_default, [{
    key: "_initializeTokens",
    value: function _initializeTokens() {
      this._userTokens = {};
      this._spaceTokens = {};
      this._userToken = undefined;
      this._spaceToken = undefined;
    }
  }, {
    key: "_setToken",
    value: function _setToken(token) {
      var _this = this;

      var tokenObject = this.parseToken(token);

      if (tokenObject && tokenObject.resources) {
        if (tokenObject.resources.users) {
          Object.keys(tokenObject.resources.users).forEach(function (id) {
            _this._userTokens[id] = token;
          });
        }

        if (tokenObject.resources.spaces) {
          Object.keys(tokenObject.resources.spaces).forEach(function (id) {
            _this._spaceTokens[id] = token;
          });
        }
      }

      if (tokenObject && tokenObject.patterns) {
        if (tokenObject.patterns.users && Object.keys(tokenObject.patterns.users).length > 0) {
          this._userToken = token;
        }

        if (tokenObject.patterns.spaces && Object.keys(tokenObject.patterns.spaces).length > 0) {
          this._spaceToken = token;
        }
      }
    }
  }, {
    key: "setToken",
    value: function setToken(token) {
      if (token && token.length > 0) {
        this._setToken(token);
      }
    }
  }, {
    key: "setTokens",
    value: function setTokens(tokens) {
      var _this2 = this;

      if (tokens && tokens.length && _typeof(tokens) === 'object') {
        tokens.forEach(function (token) {
          _this2.setToken(token);
        });
      }
    }
  }, {
    key: "getTokens",
    value: function getTokens(tokenDef) {
      var _this3 = this;

      var result = {
        users: {},
        spaces: {}
      };

      if (tokenDef) {
        if (tokenDef.user) {
          result.user = this._userToken;
        }

        if (tokenDef.space) {
          result.space = this._spaceToken;
        }

        if (tokenDef.users) {
          tokenDef.users.forEach(function (user) {
            result.users[user] = _this3._userTokens[user];
          });
        }

        if (tokenDef.space) {
          tokenDef.spaces.forEach(function (space) {
            result.spaces[space] = _this3._spaceTokens[space];
          });
        }
      } else {
        if (this._userToken) {
          result.user = this._userToken;
        }

        if (this._spaceToken) {
          result.space = this._spaceToken;
        }

        Object.keys(this._userTokens).forEach(function (user) {
          result.users[user] = _this3._userTokens[user];
        });
        Object.keys(this._spaceTokens).forEach(function (space) {
          result.spaces[space] = _this3._spaceTokens[space];
        });
      }

      return result;
    }
  }, {
    key: "getToken",
    value: function getToken(type, id) {
      var result;

      if (id) {
        if (type === 'user') {
          result = this._userTokens[id];
        } else if (type === 'space') {
          result = this._spaceTokens[id];
        }
      } else if (type === 'user') {
        result = this._userToken;
      } else if (type === 'space') {
        result = this._spaceToken;
      }

      return result;
    }
  }, {
    key: "extractPermissions",
    value: function extractPermissions(permissions) {
      var permissionsResult = {
        create: false,
        read: false,
        write: false,
        manage: false,
        "delete": false
      };

      if ((permissions & 16) === 16) {
        permissionsResult.create = true;
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
      var _this4 = this;

      var parsed = this._cbor.decodeToken(tokenString);

      if (parsed !== undefined) {
        var userResourcePermissions = Object.keys(parsed.res.usr);
        var spaceResourcePermissions = Object.keys(parsed.res.spc);
        var userPatternPermissions = Object.keys(parsed.pat.usr);
        var spacePatternPermissions = Object.keys(parsed.pat.spc);
        var result = {
          version: parsed.v,
          timestamp: parsed.t,
          ttl: parsed.ttl
        };
        var userResources = userResourcePermissions.length > 0;
        var spaceResources = spaceResourcePermissions.length > 0;

        if (userResources || spaceResources) {
          result.resources = {};

          if (userResources) {
            result.resources.users = {};
            userResourcePermissions.forEach(function (id) {
              result.resources.users[id] = _this4.extractPermissions(parsed.res.usr[id]);
            });
          }

          if (spaceResources) {
            result.resources.spaces = {};
            spaceResourcePermissions.forEach(function (id) {
              result.resources.spaces[id] = _this4.extractPermissions(parsed.res.spc[id]);
            });
          }
        }

        var userPatterns = userPatternPermissions.length > 0;
        var spacePatterns = spacePatternPermissions.length > 0;

        if (userPatterns || spacePatterns) {
          result.patterns = {};

          if (userPatterns) {
            result.patterns.users = {};
            userPatternPermissions.forEach(function (id) {
              result.patterns.users[id] = _this4.extractPermissions(parsed.pat.usr[id]);
            });
          }

          if (spacePatterns) {
            result.patterns.spaces = {};
            spacePatternPermissions.forEach(function (id) {
              result.patterns.spaces[id] = _this4.extractPermissions(parsed.pat.spc[id]);
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
  }, {
    key: "clearTokens",
    value: function clearTokens() {
      this._initializeTokens();
    }
  }]);

  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=token_manager.js.map
