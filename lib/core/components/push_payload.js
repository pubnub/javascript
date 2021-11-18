"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.MPNSNotificationPayload = exports.FCMNotificationPayload = exports.APNSNotificationPayload = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _flow_interfaces = require("../flow_interfaces");

var _excluded = ["notification", "data"];

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var BaseNotificationPayload = function () {
  function BaseNotificationPayload(payload, title, body) {
    (0, _classCallCheck2["default"])(this, BaseNotificationPayload);
    (0, _defineProperty2["default"])(this, "_subtitle", void 0);
    (0, _defineProperty2["default"])(this, "_payload", void 0);
    (0, _defineProperty2["default"])(this, "_badge", void 0);
    (0, _defineProperty2["default"])(this, "_sound", void 0);
    (0, _defineProperty2["default"])(this, "_title", void 0);
    (0, _defineProperty2["default"])(this, "_body", void 0);
    this._payload = payload;

    this._setDefaultPayloadStructure();

    this.title = title;
    this.body = body;
  }

  (0, _createClass2["default"])(BaseNotificationPayload, [{
    key: "payload",
    get: function get() {
      return this._payload;
    }
  }, {
    key: "title",
    set: function set(value) {
      this._title = value;
    }
  }, {
    key: "subtitle",
    set: function set(value) {
      this._subtitle = value;
    }
  }, {
    key: "body",
    set: function set(value) {
      this._body = value;
    }
  }, {
    key: "badge",
    set: function set(value) {
      this._badge = value;
    }
  }, {
    key: "sound",
    set: function set(value) {
      this._sound = value;
    }
  }, {
    key: "_setDefaultPayloadStructure",
    value: function _setDefaultPayloadStructure() {}
  }, {
    key: "toObject",
    value: function toObject() {
      return {};
    }
  }]);
  return BaseNotificationPayload;
}();

var APNSNotificationPayload = function (_BaseNotificationPayl) {
  (0, _inherits2["default"])(APNSNotificationPayload, _BaseNotificationPayl);

  var _super = _createSuper(APNSNotificationPayload);

  function APNSNotificationPayload() {
    var _this;

    (0, _classCallCheck2["default"])(this, APNSNotificationPayload);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_configurations", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_apnsPushType", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_isSilent", void 0);
    return _this;
  }

  (0, _createClass2["default"])(APNSNotificationPayload, [{
    key: "configurations",
    set: function set(value) {
      if (!value || !value.length) return;
      this._configurations = value;
    }
  }, {
    key: "notification",
    get: function get() {
      return this._payload.aps;
    }
  }, {
    key: "title",
    get: function get() {
      return this._title;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.aps.alert.title = value;
      this._title = value;
    }
  }, {
    key: "subtitle",
    get: function get() {
      return this._subtitle;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.aps.alert.subtitle = value;
      this._subtitle = value;
    }
  }, {
    key: "body",
    get: function get() {
      return this._body;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.aps.alert.body = value;
      this._body = value;
    }
  }, {
    key: "badge",
    get: function get() {
      return this._badge;
    },
    set: function set(value) {
      if (value === undefined || value === null) return;
      this._payload.aps.badge = value;
      this._badge = value;
    }
  }, {
    key: "sound",
    get: function get() {
      return this._sound;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.aps.sound = value;
      this._sound = value;
    }
  }, {
    key: "silent",
    set: function set(value) {
      this._isSilent = value;
    }
  }, {
    key: "_setDefaultPayloadStructure",
    value: function _setDefaultPayloadStructure() {
      this._payload.aps = {
        alert: {}
      };
    }
  }, {
    key: "toObject",
    value: function toObject() {
      var _this2 = this;

      var payload = _objectSpread({}, this._payload);

      var aps = payload.aps;
      var alert = aps.alert;

      if (this._isSilent) {
        aps['content-available'] = 1;
      }

      if (this._apnsPushType === 'apns2') {
        if (!this._configurations || !this._configurations.length) {
          throw new ReferenceError('APNS2 configuration is missing');
        }

        var configurations = [];

        this._configurations.forEach(function (configuration) {
          configurations.push(_this2._objectFromAPNS2Configuration(configuration));
        });

        if (configurations.length) {
          payload.pn_push = configurations;
        }
      }

      if (!alert || !Object.keys(alert).length) {
        delete aps.alert;
      }

      if (this._isSilent) {
        delete aps.alert;
        delete aps.badge;
        delete aps.sound;
        alert = {};
      }

      return this._isSilent || Object.keys(alert).length ? payload : null;
    }
  }, {
    key: "_objectFromAPNS2Configuration",
    value: function _objectFromAPNS2Configuration(configuration) {
      var _this3 = this;

      if (!configuration.targets || !configuration.targets.length) {
        throw new ReferenceError('At least one APNS2 target should be provided');
      }

      var targets = [];
      configuration.targets.forEach(function (target) {
        targets.push(_this3._objectFromAPNSTarget(target));
      });
      var collapseId = configuration.collapseId,
          expirationDate = configuration.expirationDate;
      var objectifiedConfiguration = {
        auth_method: 'token',
        targets: targets,
        version: 'v2'
      };

      if (collapseId && collapseId.length) {
        objectifiedConfiguration.collapse_id = collapseId;
      }

      if (expirationDate) {
        objectifiedConfiguration.expiration = expirationDate.toISOString();
      }

      return objectifiedConfiguration;
    }
  }, {
    key: "_objectFromAPNSTarget",
    value: function _objectFromAPNSTarget(target) {
      if (!target.topic || !target.topic.length) {
        throw new TypeError('Target \'topic\' undefined.');
      }

      var topic = target.topic,
          _target$environment = target.environment,
          environment = _target$environment === void 0 ? 'development' : _target$environment,
          _target$excludedDevic = target.excludedDevices,
          excludedDevices = _target$excludedDevic === void 0 ? [] : _target$excludedDevic;
      var objectifiedTarget = {
        topic: topic,
        environment: environment
      };

      if (excludedDevices.length) {
        objectifiedTarget.excluded_devices = excludedDevices;
      }

      return objectifiedTarget;
    }
  }]);
  return APNSNotificationPayload;
}(BaseNotificationPayload);

exports.APNSNotificationPayload = APNSNotificationPayload;

var MPNSNotificationPayload = function (_BaseNotificationPayl2) {
  (0, _inherits2["default"])(MPNSNotificationPayload, _BaseNotificationPayl2);

  var _super2 = _createSuper(MPNSNotificationPayload);

  function MPNSNotificationPayload() {
    var _this4;

    (0, _classCallCheck2["default"])(this, MPNSNotificationPayload);

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    _this4 = _super2.call.apply(_super2, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this4), "_backContent", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this4), "_backTitle", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this4), "_count", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this4), "_type", void 0);
    return _this4;
  }

  (0, _createClass2["default"])(MPNSNotificationPayload, [{
    key: "backContent",
    get: function get() {
      return this._backContent;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.back_content = value;
      this._backContent = value;
    }
  }, {
    key: "backTitle",
    get: function get() {
      return this._backTitle;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.back_title = value;
      this._backTitle = value;
    }
  }, {
    key: "count",
    get: function get() {
      return this._count;
    },
    set: function set(value) {
      if (value === undefined || value === null) return;
      this._payload.count = value;
      this._count = value;
    }
  }, {
    key: "title",
    get: function get() {
      return this._title;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.title = value;
      this._title = value;
    }
  }, {
    key: "type",
    get: function get() {
      return this._type;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.type = value;
      this._type = value;
    }
  }, {
    key: "subtitle",
    get: function get() {
      return this.backTitle;
    },
    set: function set(value) {
      this.backTitle = value;
    }
  }, {
    key: "body",
    get: function get() {
      return this.backContent;
    },
    set: function set(value) {
      this.backContent = value;
    }
  }, {
    key: "badge",
    get: function get() {
      return this.count;
    },
    set: function set(value) {
      this.count = value;
    }
  }, {
    key: "toObject",
    value: function toObject() {
      return Object.keys(this._payload).length ? _objectSpread({}, this._payload) : null;
    }
  }]);
  return MPNSNotificationPayload;
}(BaseNotificationPayload);

exports.MPNSNotificationPayload = MPNSNotificationPayload;

var FCMNotificationPayload = function (_BaseNotificationPayl3) {
  (0, _inherits2["default"])(FCMNotificationPayload, _BaseNotificationPayl3);

  var _super3 = _createSuper(FCMNotificationPayload);

  function FCMNotificationPayload() {
    var _this5;

    (0, _classCallCheck2["default"])(this, FCMNotificationPayload);

    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    _this5 = _super3.call.apply(_super3, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this5), "_isSilent", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this5), "_icon", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this5), "_tag", void 0);
    return _this5;
  }

  (0, _createClass2["default"])(FCMNotificationPayload, [{
    key: "notification",
    get: function get() {
      return this._payload.notification;
    }
  }, {
    key: "data",
    get: function get() {
      return this._payload.data;
    }
  }, {
    key: "title",
    get: function get() {
      return this._title;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.notification.title = value;
      this._title = value;
    }
  }, {
    key: "body",
    get: function get() {
      return this._body;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.notification.body = value;
      this._body = value;
    }
  }, {
    key: "sound",
    get: function get() {
      return this._sound;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.notification.sound = value;
      this._sound = value;
    }
  }, {
    key: "icon",
    get: function get() {
      return this._icon;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.notification.icon = value;
      this._icon = value;
    }
  }, {
    key: "tag",
    get: function get() {
      return this._tag;
    },
    set: function set(value) {
      if (!value || !value.length) return;
      this._payload.notification.tag = value;
      this._tag = value;
    }
  }, {
    key: "silent",
    set: function set(value) {
      this._isSilent = value;
    }
  }, {
    key: "_setDefaultPayloadStructure",
    value: function _setDefaultPayloadStructure() {
      this._payload.notification = {};
      this._payload.data = {};
    }
  }, {
    key: "toObject",
    value: function toObject() {
      var data = _objectSpread({}, this._payload.data);

      var notification = null;
      var payload = {};

      if (Object.keys(this._payload).length > 2) {
        var _this$_payload = this._payload,
            initialNotification = _this$_payload.notification,
            initialData = _this$_payload.data,
            additionalData = (0, _objectWithoutProperties2["default"])(_this$_payload, _excluded);
        data = _objectSpread(_objectSpread({}, data), additionalData);
      }

      if (this._isSilent) {
        data.notification = this._payload.notification;
      } else {
        notification = this._payload.notification;
      }

      if (Object.keys(data).length) {
        payload.data = data;
      }

      if (notification && Object.keys(notification).length) {
        payload.notification = notification;
      }

      return Object.keys(payload).length ? payload : null;
    }
  }]);
  return FCMNotificationPayload;
}(BaseNotificationPayload);

exports.FCMNotificationPayload = FCMNotificationPayload;

var NotificationsPayload = function () {
  function NotificationsPayload(title, body) {
    (0, _classCallCheck2["default"])(this, NotificationsPayload);
    (0, _defineProperty2["default"])(this, "_payload", void 0);
    (0, _defineProperty2["default"])(this, "_debugging", void 0);
    (0, _defineProperty2["default"])(this, "_subtitle", void 0);
    (0, _defineProperty2["default"])(this, "_badge", void 0);
    (0, _defineProperty2["default"])(this, "_sound", void 0);
    (0, _defineProperty2["default"])(this, "_title", void 0);
    (0, _defineProperty2["default"])(this, "_body", void 0);
    (0, _defineProperty2["default"])(this, "apns", void 0);
    (0, _defineProperty2["default"])(this, "mpns", void 0);
    (0, _defineProperty2["default"])(this, "fcm", void 0);
    this._payload = {
      apns: {},
      mpns: {},
      fcm: {}
    };
    this._title = title;
    this._body = body;
    this.apns = new APNSNotificationPayload(this._payload.apns, title, body);
    this.mpns = new MPNSNotificationPayload(this._payload.mpns, title, body);
    this.fcm = new FCMNotificationPayload(this._payload.fcm, title, body);
  }

  (0, _createClass2["default"])(NotificationsPayload, [{
    key: "debugging",
    set: function set(value) {
      this._debugging = value;
    }
  }, {
    key: "title",
    get: function get() {
      return this._title;
    }
  }, {
    key: "body",
    get: function get() {
      return this._body;
    }
  }, {
    key: "subtitle",
    get: function get() {
      return this._subtitle;
    },
    set: function set(value) {
      this._subtitle = value;
      this.apns.subtitle = value;
      this.mpns.subtitle = value;
      this.fcm.subtitle = value;
    }
  }, {
    key: "badge",
    get: function get() {
      return this._badge;
    },
    set: function set(value) {
      this._badge = value;
      this.apns.badge = value;
      this.mpns.badge = value;
      this.fcm.badge = value;
    }
  }, {
    key: "sound",
    get: function get() {
      return this._sound;
    },
    set: function set(value) {
      this._sound = value;
      this.apns.sound = value;
      this.mpns.sound = value;
      this.fcm.sound = value;
    }
  }, {
    key: "buildPayload",
    value: function buildPayload(platforms) {
      var payload = {};

      if (platforms.includes('apns') || platforms.includes('apns2')) {
        this.apns._apnsPushType = platforms.includes('apns') ? 'apns' : 'apns2';
        var apnsPayload = this.apns.toObject();

        if (apnsPayload && Object.keys(apnsPayload).length) {
          payload.pn_apns = apnsPayload;
        }
      }

      if (platforms.includes('mpns')) {
        var mpnsPayload = this.mpns.toObject();

        if (mpnsPayload && Object.keys(mpnsPayload).length) {
          payload.pn_mpns = mpnsPayload;
        }
      }

      if (platforms.includes('fcm')) {
        var fcmPayload = this.fcm.toObject();

        if (fcmPayload && Object.keys(fcmPayload).length) {
          payload.pn_gcm = fcmPayload;
        }
      }

      if (Object.keys(payload).length && this._debugging) {
        payload.pn_debug = true;
      }

      return payload;
    }
  }]);
  return NotificationsPayload;
}();

var _default = NotificationsPayload;
exports["default"] = _default;
//# sourceMappingURL=push_payload.js.map
