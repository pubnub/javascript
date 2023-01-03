"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FCMNotificationPayload = exports.MPNSNotificationPayload = exports.APNSNotificationPayload = void 0;
var BaseNotificationPayload = /** @class */ (function () {
    function BaseNotificationPayload(payload, title, body) {
        this._payload = payload;
        this._setDefaultPayloadStructure();
        this.title = title;
        this.body = body;
    }
    Object.defineProperty(BaseNotificationPayload.prototype, "payload", {
        get: function () {
            return this._payload;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseNotificationPayload.prototype, "title", {
        set: function (value) {
            this._title = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseNotificationPayload.prototype, "subtitle", {
        set: function (value) {
            this._subtitle = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseNotificationPayload.prototype, "body", {
        set: function (value) {
            this._body = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseNotificationPayload.prototype, "badge", {
        set: function (value) {
            this._badge = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseNotificationPayload.prototype, "sound", {
        set: function (value) {
            this._sound = value;
        },
        enumerable: false,
        configurable: true
    });
    BaseNotificationPayload.prototype._setDefaultPayloadStructure = function () {
        // Empty.
    };
    BaseNotificationPayload.prototype.toObject = function () {
        return {};
    };
    return BaseNotificationPayload;
}());
var APNSNotificationPayload = /** @class */ (function (_super) {
    __extends(APNSNotificationPayload, _super);
    function APNSNotificationPayload() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(APNSNotificationPayload.prototype, "configurations", {
        set: function (value) {
            if (!value || !value.length)
                return;
            this._configurations = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(APNSNotificationPayload.prototype, "notification", {
        get: function () {
            return this._payload.aps;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(APNSNotificationPayload.prototype, "title", {
        get: function () {
            return this._title;
        },
        set: function (value) {
            if (!value || !value.length)
                return;
            this._payload.aps.alert.title = value;
            this._title = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(APNSNotificationPayload.prototype, "subtitle", {
        get: function () {
            return this._subtitle;
        },
        set: function (value) {
            if (!value || !value.length)
                return;
            this._payload.aps.alert.subtitle = value;
            this._subtitle = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(APNSNotificationPayload.prototype, "body", {
        get: function () {
            return this._body;
        },
        set: function (value) {
            if (!value || !value.length)
                return;
            this._payload.aps.alert.body = value;
            this._body = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(APNSNotificationPayload.prototype, "badge", {
        get: function () {
            return this._badge;
        },
        set: function (value) {
            if (value === undefined || value === null)
                return;
            this._payload.aps.badge = value;
            this._badge = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(APNSNotificationPayload.prototype, "sound", {
        get: function () {
            return this._sound;
        },
        set: function (value) {
            if (!value || !value.length)
                return;
            this._payload.aps.sound = value;
            this._sound = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(APNSNotificationPayload.prototype, "silent", {
        set: function (value) {
            this._isSilent = value;
        },
        enumerable: false,
        configurable: true
    });
    APNSNotificationPayload.prototype._setDefaultPayloadStructure = function () {
        this._payload.aps = { alert: {} };
    };
    APNSNotificationPayload.prototype.toObject = function () {
        var _this = this;
        var payload = __assign({}, this._payload);
        /** @type {{alert: Object, badge: number, sound: string}} */
        var aps = payload.aps;
        var alert = aps.alert;
        if (this._isSilent) {
            aps['content-available'] = 1;
        }
        if (this._apnsPushType === 'apns2') {
            if (!this._configurations || !this._configurations.length) {
                throw new ReferenceError('APNS2 configuration is missing');
            }
            var configurations_1 = [];
            this._configurations.forEach(function (configuration) {
                configurations_1.push(_this._objectFromAPNS2Configuration(configuration));
            });
            if (configurations_1.length) {
                payload.pn_push = configurations_1;
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
    };
    APNSNotificationPayload.prototype._objectFromAPNS2Configuration = function (configuration) {
        var _this = this;
        if (!configuration.targets || !configuration.targets.length) {
            throw new ReferenceError('At least one APNS2 target should be provided');
        }
        var targets = [];
        configuration.targets.forEach(function (target) {
            targets.push(_this._objectFromAPNSTarget(target));
        });
        var collapseId = configuration.collapseId, expirationDate = configuration.expirationDate;
        var objectifiedConfiguration = { auth_method: 'token', targets: targets, version: 'v2' };
        if (collapseId && collapseId.length) {
            objectifiedConfiguration.collapse_id = collapseId;
        }
        if (expirationDate) {
            objectifiedConfiguration.expiration = expirationDate.toISOString();
        }
        return objectifiedConfiguration;
    };
    APNSNotificationPayload.prototype._objectFromAPNSTarget = function (target) {
        if (!target.topic || !target.topic.length) {
            throw new TypeError("Target 'topic' undefined.");
        }
        var topic = target.topic, _a = target.environment, environment = _a === void 0 ? 'development' : _a, _b = target.excludedDevices, excludedDevices = _b === void 0 ? [] : _b;
        var objectifiedTarget = { topic: topic, environment: environment };
        if (excludedDevices.length) {
            objectifiedTarget.excluded_devices = excludedDevices;
        }
        return objectifiedTarget;
    };
    return APNSNotificationPayload;
}(BaseNotificationPayload));
exports.APNSNotificationPayload = APNSNotificationPayload;
var MPNSNotificationPayload = /** @class */ (function (_super) {
    __extends(MPNSNotificationPayload, _super);
    function MPNSNotificationPayload() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(MPNSNotificationPayload.prototype, "backContent", {
        get: function () {
            return this._backContent;
        },
        set: function (value) {
            if (!value || !value.length)
                return;
            this._payload.back_content = value;
            this._backContent = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MPNSNotificationPayload.prototype, "backTitle", {
        get: function () {
            return this._backTitle;
        },
        set: function (value) {
            if (!value || !value.length)
                return;
            this._payload.back_title = value;
            this._backTitle = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MPNSNotificationPayload.prototype, "count", {
        get: function () {
            return this._count;
        },
        set: function (value) {
            if (value === undefined || value === null)
                return;
            this._payload.count = value;
            this._count = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MPNSNotificationPayload.prototype, "title", {
        get: function () {
            return this._title;
        },
        set: function (value) {
            if (!value || !value.length)
                return;
            this._payload.title = value;
            this._title = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MPNSNotificationPayload.prototype, "type", {
        get: function () {
            return this._type;
        },
        set: function (value) {
            if (!value || !value.length)
                return;
            this._payload.type = value;
            this._type = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MPNSNotificationPayload.prototype, "subtitle", {
        get: function () {
            return this.backTitle;
        },
        set: function (value) {
            this.backTitle = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MPNSNotificationPayload.prototype, "body", {
        get: function () {
            return this.backContent;
        },
        set: function (value) {
            this.backContent = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MPNSNotificationPayload.prototype, "badge", {
        get: function () {
            return this.count;
        },
        set: function (value) {
            this.count = value;
        },
        enumerable: false,
        configurable: true
    });
    MPNSNotificationPayload.prototype.toObject = function () {
        return Object.keys(this._payload).length ? __assign({}, this._payload) : null;
    };
    return MPNSNotificationPayload;
}(BaseNotificationPayload));
exports.MPNSNotificationPayload = MPNSNotificationPayload;
var FCMNotificationPayload = /** @class */ (function (_super) {
    __extends(FCMNotificationPayload, _super);
    function FCMNotificationPayload() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(FCMNotificationPayload.prototype, "notification", {
        get: function () {
            return this._payload.notification;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FCMNotificationPayload.prototype, "data", {
        get: function () {
            return this._payload.data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FCMNotificationPayload.prototype, "title", {
        get: function () {
            return this._title;
        },
        set: function (value) {
            if (!value || !value.length)
                return;
            this._payload.notification.title = value;
            this._title = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FCMNotificationPayload.prototype, "body", {
        get: function () {
            return this._body;
        },
        set: function (value) {
            if (!value || !value.length)
                return;
            this._payload.notification.body = value;
            this._body = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FCMNotificationPayload.prototype, "sound", {
        get: function () {
            return this._sound;
        },
        set: function (value) {
            if (!value || !value.length)
                return;
            this._payload.notification.sound = value;
            this._sound = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FCMNotificationPayload.prototype, "icon", {
        get: function () {
            return this._icon;
        },
        set: function (value) {
            if (!value || !value.length)
                return;
            this._payload.notification.icon = value;
            this._icon = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FCMNotificationPayload.prototype, "tag", {
        get: function () {
            return this._tag;
        },
        set: function (value) {
            if (!value || !value.length)
                return;
            this._payload.notification.tag = value;
            this._tag = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FCMNotificationPayload.prototype, "silent", {
        set: function (value) {
            this._isSilent = value;
        },
        enumerable: false,
        configurable: true
    });
    FCMNotificationPayload.prototype._setDefaultPayloadStructure = function () {
        this._payload.notification = {};
        this._payload.data = {};
    };
    FCMNotificationPayload.prototype.toObject = function () {
        var data = __assign({}, this._payload.data);
        var notification = null;
        var payload = {};
        /**
         * Check whether additional data has been passed outside of 'data' object
         * and put it into it if required.
         */
        if (Object.keys(this._payload).length > 2) {
            var _a = this._payload, initialNotification = _a.notification, initialData = _a.data, additionalData = __rest(_a, ["notification", "data"]);
            data = __assign(__assign({}, data), additionalData);
        }
        if (this._isSilent) {
            data.notification = this._payload.notification;
        }
        else {
            notification = this._payload.notification;
        }
        if (Object.keys(data).length) {
            payload.data = data;
        }
        if (notification && Object.keys(notification).length) {
            payload.notification = notification;
        }
        return Object.keys(payload).length ? payload : null;
    };
    return FCMNotificationPayload;
}(BaseNotificationPayload));
exports.FCMNotificationPayload = FCMNotificationPayload;
var NotificationsPayload = /** @class */ (function () {
    function NotificationsPayload(title, body) {
        this._payload = { apns: {}, mpns: {}, fcm: {} };
        this._title = title;
        this._body = body;
        this.apns = new APNSNotificationPayload(this._payload.apns, title, body);
        this.mpns = new MPNSNotificationPayload(this._payload.mpns, title, body);
        this.fcm = new FCMNotificationPayload(this._payload.fcm, title, body);
    }
    Object.defineProperty(NotificationsPayload.prototype, "debugging", {
        set: function (value) {
            this._debugging = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NotificationsPayload.prototype, "title", {
        get: function () {
            return this._title;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NotificationsPayload.prototype, "body", {
        get: function () {
            return this._body;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NotificationsPayload.prototype, "subtitle", {
        get: function () {
            return this._subtitle;
        },
        set: function (value) {
            this._subtitle = value;
            this.apns.subtitle = value;
            this.mpns.subtitle = value;
            this.fcm.subtitle = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NotificationsPayload.prototype, "badge", {
        get: function () {
            return this._badge;
        },
        set: function (value) {
            this._badge = value;
            this.apns.badge = value;
            this.mpns.badge = value;
            this.fcm.badge = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NotificationsPayload.prototype, "sound", {
        get: function () {
            return this._sound;
        },
        set: function (value) {
            this._sound = value;
            this.apns.sound = value;
            this.mpns.sound = value;
            this.fcm.sound = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Build notifications platform for requested platforms.
     *
     * @param {Array<string>} platforms - List of platforms for which payload
     * should be added to final dictionary. Supported values: gcm, apns, apns2,
     * mpns.
     *
     * @returns {Object} Object with data, which can be sent with publish method
     * call and trigger remote notifications for specified platforms.
     */
    NotificationsPayload.prototype.buildPayload = function (platforms) {
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
    };
    return NotificationsPayload;
}());
exports.default = NotificationsPayload;
