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
class BaseNotificationPayload {
    constructor(payload, title, body) {
        this._payload = payload;
        this.setDefaultPayloadStructure();
        this.title = title;
        this.body = body;
    }
    get payload() {
        return this._payload;
    }
    set title(value) {
        this._title = value;
    }
    set subtitle(value) {
        this._subtitle = value;
    }
    set body(value) {
        this._body = value;
    }
    set badge(value) {
        this._badge = value;
    }
    set sound(value) {
        this._sound = value;
    }
    setDefaultPayloadStructure() { }
    toObject() {
        return {};
    }
}
export class APNSNotificationPayload extends BaseNotificationPayload {
    constructor() {
        super(...arguments);
        this._apnsPushType = 'apns';
        this._isSilent = false;
    }
    get payload() {
        return this._payload;
    }
    set configurations(value) {
        if (!value || !value.length)
            return;
        this._configurations = value;
    }
    get notification() {
        return this.payload.aps;
    }
    get title() {
        return this._title;
    }
    set title(value) {
        if (!value || !value.length)
            return;
        this.payload.aps.alert.title = value;
        this._title = value;
    }
    get subtitle() {
        return this._subtitle;
    }
    set subtitle(value) {
        if (!value || !value.length)
            return;
        this.payload.aps.alert.subtitle = value;
        this._subtitle = value;
    }
    get body() {
        return this._body;
    }
    set body(value) {
        if (!value || !value.length)
            return;
        this.payload.aps.alert.body = value;
        this._body = value;
    }
    get badge() {
        return this._badge;
    }
    set badge(value) {
        if (value === undefined || value === null)
            return;
        this.payload.aps.badge = value;
        this._badge = value;
    }
    get sound() {
        return this._sound;
    }
    set sound(value) {
        if (!value || !value.length)
            return;
        this.payload.aps.sound = value;
        this._sound = value;
    }
    set silent(value) {
        this._isSilent = value;
    }
    setDefaultPayloadStructure() {
        this.payload.aps = { alert: {} };
    }
    toObject() {
        const payload = Object.assign({}, this.payload);
        const { aps } = payload;
        let { alert } = aps;
        if (this._isSilent)
            aps['content-available'] = 1;
        if (this._apnsPushType === 'apns2') {
            if (!this._configurations || !this._configurations.length)
                throw new ReferenceError('APNS2 configuration is missing');
            const configurations = [];
            this._configurations.forEach((configuration) => {
                configurations.push(this.objectFromAPNS2Configuration(configuration));
            });
            if (configurations.length)
                payload.pn_push = configurations;
        }
        if (!alert || !Object.keys(alert).length)
            delete aps.alert;
        if (this._isSilent) {
            delete aps.alert;
            delete aps.badge;
            delete aps.sound;
            alert = {};
        }
        return this._isSilent || (alert && Object.keys(alert).length) ? payload : null;
    }
    objectFromAPNS2Configuration(configuration) {
        if (!configuration.targets || !configuration.targets.length)
            throw new ReferenceError('At least one APNS2 target should be provided');
        const { collapseId, expirationDate } = configuration;
        const objectifiedConfiguration = {
            auth_method: 'token',
            targets: configuration.targets.map((target) => this.objectFromAPNSTarget(target)),
            version: 'v2',
        };
        if (collapseId && collapseId.length)
            objectifiedConfiguration.collapse_id = collapseId;
        if (expirationDate)
            objectifiedConfiguration.expiration = expirationDate.toISOString();
        return objectifiedConfiguration;
    }
    objectFromAPNSTarget(target) {
        if (!target.topic || !target.topic.length)
            throw new TypeError("Target 'topic' undefined.");
        const { topic, environment = 'development', excludedDevices = [] } = target;
        const objectifiedTarget = { topic, environment };
        if (excludedDevices.length)
            objectifiedTarget.excluded_devices = excludedDevices;
        return objectifiedTarget;
    }
}
export class FCMNotificationPayload extends BaseNotificationPayload {
    get payload() {
        return this._payload;
    }
    get notification() {
        return this.payload.notification;
    }
    get data() {
        return this.payload.data;
    }
    get title() {
        return this._title;
    }
    set title(value) {
        if (!value || !value.length)
            return;
        this.payload.notification.title = value;
        this._title = value;
    }
    get body() {
        return this._body;
    }
    set body(value) {
        if (!value || !value.length)
            return;
        this.payload.notification.body = value;
        this._body = value;
    }
    get sound() {
        return this._sound;
    }
    set sound(value) {
        if (!value || !value.length)
            return;
        this.payload.notification.sound = value;
        this._sound = value;
    }
    get icon() {
        return this._icon;
    }
    set icon(value) {
        if (!value || !value.length)
            return;
        this.payload.notification.icon = value;
        this._icon = value;
    }
    get tag() {
        return this._tag;
    }
    set tag(value) {
        if (!value || !value.length)
            return;
        this.payload.notification.tag = value;
        this._tag = value;
    }
    set silent(value) {
        this._isSilent = value;
    }
    setDefaultPayloadStructure() {
        this.payload.notification = {};
        this.payload.data = {};
    }
    toObject() {
        let data = Object.assign({}, this.payload.data);
        let notification = null;
        const payload = {};
        if (Object.keys(this.payload).length > 2) {
            const _a = this.payload, { notification: initialNotification, data: initialData } = _a, additionalData = __rest(_a, ["notification", "data"]);
            data = Object.assign(Object.assign({}, data), additionalData);
        }
        if (this._isSilent)
            data.notification = this.payload.notification;
        else
            notification = this.payload.notification;
        if (Object.keys(data).length)
            payload.data = data;
        if (notification && Object.keys(notification).length)
            payload.notification = notification;
        return Object.keys(payload).length ? payload : null;
    }
}
class NotificationsPayload {
    constructor(title, body) {
        this._payload = { apns: {}, fcm: {} };
        this._title = title;
        this._body = body;
        this.apns = new APNSNotificationPayload(this._payload.apns, title, body);
        this.fcm = new FCMNotificationPayload(this._payload.fcm, title, body);
    }
    set debugging(value) {
        this._debugging = value;
    }
    get title() {
        return this._title;
    }
    get subtitle() {
        return this._subtitle;
    }
    set subtitle(value) {
        this._subtitle = value;
        this.apns.subtitle = value;
        this.fcm.subtitle = value;
    }
    get body() {
        return this._body;
    }
    get badge() {
        return this._badge;
    }
    set badge(value) {
        this._badge = value;
        this.apns.badge = value;
        this.fcm.badge = value;
    }
    get sound() {
        return this._sound;
    }
    set sound(value) {
        this._sound = value;
        this.apns.sound = value;
        this.fcm.sound = value;
    }
    buildPayload(platforms) {
        const payload = {};
        if (platforms.includes('apns') || platforms.includes('apns2')) {
            this.apns._apnsPushType = platforms.includes('apns') ? 'apns' : 'apns2';
            const apnsPayload = this.apns.toObject();
            if (apnsPayload && Object.keys(apnsPayload).length)
                payload.pn_apns = apnsPayload;
        }
        if (platforms.includes('fcm')) {
            const fcmPayload = this.fcm.toObject();
            if (fcmPayload && Object.keys(fcmPayload).length)
                payload.pn_gcm = fcmPayload;
        }
        if (Object.keys(payload).length && this._debugging)
            payload.pn_debug = true;
        return payload;
    }
}
export default NotificationsPayload;
