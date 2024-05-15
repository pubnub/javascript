"use strict";
// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types
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
exports.FCMNotificationPayload = exports.APNSNotificationPayload = void 0;
// endregion
// endregion
/**
 * Base notification payload object.
 */
class BaseNotificationPayload {
    constructor(payload, title, body) {
        this._payload = payload;
        this.setDefaultPayloadStructure();
        this.title = title;
        this.body = body;
    }
    /**
     * Retrieve resulting notification payload content for message.
     *
     * @returns Preformatted push notification payload data.
     */
    get payload() {
        return this._payload;
    }
    /**
     * Update notification title.
     *
     * @param value - New notification title.
     */
    set title(value) {
        this._title = value;
    }
    /**
     * Update notification subtitle.
     *
     * @param value - New second-line notification title.
     */
    set subtitle(value) {
        this._subtitle = value;
    }
    /**
     * Update notification body.
     *
     * @param value - Update main notification message (shown when expanded).
     */
    set body(value) {
        this._body = value;
    }
    /**
     * Update application badge number.
     *
     * @param value - Number which should be shown in application badge upon receiving notification.
     */
    set badge(value) {
        this._badge = value;
    }
    /**
     * Update notification sound.
     *
     * @param value - Name of the sound file which should be played upon notification receive.
     */
    set sound(value) {
        this._sound = value;
    }
    /**
     * Platform-specific structure initialization.
     */
    setDefaultPayloadStructure() { }
    /**
     * Translate data object into PubNub push notification payload object.
     *
     * @returns Preformatted push notification payload.
     */
    toObject() {
        return {};
    }
}
/**
 * Message payload for Apple Push Notification Service.
 */
class APNSNotificationPayload extends BaseNotificationPayload {
    constructor() {
        super(...arguments);
        /**
         * Type of push notification service for which payload will be created.
         */
        this._apnsPushType = 'apns';
        /**
         * Whether resulting payload should trigger silent notification or not.
         */
        this._isSilent = false;
    }
    get payload() {
        return this._payload;
    }
    /**
     * Update notification receivers configuration.
     *
     * @param value - New APNS2 configurations.
     */
    set configurations(value) {
        if (!value || !value.length)
            return;
        this._configurations = value;
    }
    /**
     * Notification payload.
     *
     * @returns Platform-specific part of PubNub notification payload.
     */
    get notification() {
        return this.payload.aps;
    }
    /**
     * Notification title.
     *
     * @returns Main notification title.
     */
    get title() {
        return this._title;
    }
    /**
     * Update notification title.
     *
     * @param value - New notification title.
     */
    set title(value) {
        if (!value || !value.length)
            return;
        this.payload.aps.alert.title = value;
        this._title = value;
    }
    /**
     * Notification subtitle.
     *
     * @returns Second-line notification title.
     */
    get subtitle() {
        return this._subtitle;
    }
    /**
     * Update notification subtitle.
     *
     * @param value - New second-line notification title.
     */
    set subtitle(value) {
        if (!value || !value.length)
            return;
        this.payload.aps.alert.subtitle = value;
        this._subtitle = value;
    }
    /**
     * Notification body.
     *
     * @returns Main notification message (shown when expanded).
     */
    get body() {
        return this._body;
    }
    /**
     * Update notification body.
     *
     * @param value - Update main notification message (shown when expanded).
     */
    set body(value) {
        if (!value || !value.length)
            return;
        this.payload.aps.alert.body = value;
        this._body = value;
    }
    /**
     * Retrieve unread notifications number.
     *
     * @returns Number of unread notifications which should be shown on application badge.
     */
    get badge() {
        return this._badge;
    }
    /**
     * Update application badge number.
     *
     * @param value - Number which should be shown in application badge upon receiving notification.
     */
    set badge(value) {
        if (value === undefined || value === null)
            return;
        this.payload.aps.badge = value;
        this._badge = value;
    }
    /**
     * Retrieve notification sound file.
     *
     * @returns Notification sound file name from resource bundle.
     */
    get sound() {
        return this._sound;
    }
    /**
     * Update notification sound.
     *
     * @param value - Name of the sound file which should be played upon notification receive.
     */
    set sound(value) {
        if (!value || !value.length)
            return;
        this.payload.aps.sound = value;
        this._sound = value;
    }
    /**
     * Set whether notification should be silent or not.
     *
     * `content-available` notification type will be used to deliver silent notification if set to `true`.
     *
     * @param value - Whether notification should be sent as silent or not.
     */
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
    /**
     * Create PubNub push notification service APNS2 configuration information object.
     *
     * @param configuration - Source user-provided APNS2 configuration.
     *
     * @returns Preformatted for PubNub service APNS2 configuration information.
     */
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
    /**
     * Create PubNub push notification service APNS2 target information object.
     *
     * @param target - Source user-provided data.
     *
     * @returns Preformatted for PubNub service APNS2 target information.
     */
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
exports.APNSNotificationPayload = APNSNotificationPayload;
/**
 * Message payload for Firebase Clouse Messaging service.
 */
class FCMNotificationPayload extends BaseNotificationPayload {
    get payload() {
        return this._payload;
    }
    /**
     * Notification payload.
     *
     * @returns Platform-specific part of PubNub notification payload.
     */
    get notification() {
        return this.payload.notification;
    }
    /**
     * Silent notification payload.
     *
     * @returns Silent notification payload (data notification).
     */
    get data() {
        return this.payload.data;
    }
    /**
     * Notification title.
     *
     * @returns Main notification title.
     */
    get title() {
        return this._title;
    }
    /**
     * Update notification title.
     *
     * @param value - New notification title.
     */
    set title(value) {
        if (!value || !value.length)
            return;
        this.payload.notification.title = value;
        this._title = value;
    }
    /**
     * Notification body.
     *
     * @returns Main notification message (shown when expanded).
     */
    get body() {
        return this._body;
    }
    /**
     * Update notification body.
     *
     * @param value - Update main notification message (shown when expanded).
     */
    set body(value) {
        if (!value || !value.length)
            return;
        this.payload.notification.body = value;
        this._body = value;
    }
    /**
     * Retrieve notification sound file.
     *
     * @returns Notification sound file name from resource bundle.
     */
    get sound() {
        return this._sound;
    }
    /**
     * Update notification sound.
     *
     * @param value - Name of the sound file which should be played upon notification receive.
     */
    set sound(value) {
        if (!value || !value.length)
            return;
        this.payload.notification.sound = value;
        this._sound = value;
    }
    /**
     * Retrieve notification icon file.
     *
     * @returns Notification icon file name from resource bundle.
     */
    get icon() {
        return this._icon;
    }
    /**
     * Update notification icon.
     *
     * @param value - Name of the icon file which should be shown on notification.
     */
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
    /**
     * Set whether notification should be silent or not.
     *
     * All notification data will be sent under `data` field if set to `true`.
     *
     * @param value - Whether notification should be sent as silent or not.
     */
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
        // Check whether additional data has been passed outside 'data' object and put it into it if required.
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
exports.FCMNotificationPayload = FCMNotificationPayload;
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
    /**
     * Notification title.
     *
     * @returns Main notification title.
     */
    get title() {
        return this._title;
    }
    /**
     * Notification subtitle.
     *
     * @returns Second-line notification title.
     */
    get subtitle() {
        return this._subtitle;
    }
    /**
     * Update notification subtitle.
     *
     * @param value - New second-line notification title.
     */
    set subtitle(value) {
        this._subtitle = value;
        this.apns.subtitle = value;
        this.fcm.subtitle = value;
    }
    /**
     * Notification body.
     *
     * @returns Main notification message (shown when expanded).
     */
    get body() {
        return this._body;
    }
    /**
     * Retrieve unread notifications number.
     *
     * @returns Number of unread notifications which should be shown on application badge.
     */
    get badge() {
        return this._badge;
    }
    /**
     * Update application badge number.
     *
     * @param value - Number which should be shown in application badge upon receiving notification.
     */
    set badge(value) {
        this._badge = value;
        this.apns.badge = value;
        this.fcm.badge = value;
    }
    /**
     * Retrieve notification sound file.
     *
     * @returns Notification sound file name from resource bundle.
     */
    get sound() {
        return this._sound;
    }
    /**
     * Update notification sound.
     *
     * @param value - Name of the sound file which should be played upon notification receive.
     */
    set sound(value) {
        this._sound = value;
        this.apns.sound = value;
        this.fcm.sound = value;
    }
    /**
     * Build notifications platform for requested platforms.
     *
     * @param platforms - List of platforms for which payload should be added to final dictionary. Supported values:
     * gcm, apns, and apns2.
     *
     * @returns Object with data, which can be sent with publish method call and trigger remote notifications for
     * specified platforms.
     */
    buildPayload(platforms) {
        const payload = {};
        if (platforms.includes('apns') || platforms.includes('apns2')) {
            // @ts-expect-error Override APNS version.
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
exports.default = NotificationsPayload;
