/*       */
/* eslint max-classes-per-file: ["error", 5] */
import { APNS2Configuration, APNS2Target } from '../flow_interfaces';

class BaseNotificationPayload {
  _subtitle;

  _payload;

  _badge;

  _sound;

  _title;

  _body;

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

  constructor(payload, title, body) {
    this._payload = payload;

    this._setDefaultPayloadStructure();
    this.title = title;
    this.body = body;
  }

  _setDefaultPayloadStructure() {
    // Empty.
  }

  toObject() {
    return {};
  }
}

export class APNSNotificationPayload extends BaseNotificationPayload {
  _configurations;

  _apnsPushType;

  _isSilent;

  set configurations(value) {
    if (!value || !value.length) return;

    this._configurations = value;
  }

  get notification() {
    return this._payload.aps;
  }

  get title() {
    return this._title;
  }

  set title(value) {
    if (!value || !value.length) return;

    this._payload.aps.alert.title = value;
    this._title = value;
  }

  get subtitle() {
    return this._subtitle;
  }

  set subtitle(value) {
    if (!value || !value.length) return;

    this._payload.aps.alert.subtitle = value;
    this._subtitle = value;
  }

  get body() {
    return this._body;
  }

  set body(value) {
    if (!value || !value.length) return;

    this._payload.aps.alert.body = value;
    this._body = value;
  }

  get badge() {
    return this._badge;
  }

  set badge(value) {
    if (value === undefined || value === null) return;

    this._payload.aps.badge = value;
    this._badge = value;
  }

  get sound() {
    return this._sound;
  }

  set sound(value) {
    if (!value || !value.length) return;

    this._payload.aps.sound = value;
    this._sound = value;
  }

  set silent(value) {
    this._isSilent = value;
  }

  _setDefaultPayloadStructure() {
    this._payload.aps = { alert: {} };
  }

  toObject() {
    const payload = { ...this._payload };
    /** @type {{alert: Object, badge: number, sound: string}} */
    const { aps } = payload;
    let { alert } = aps;

    if (this._isSilent) {
      aps['content-available'] = 1;
    }

    if (this._apnsPushType === 'apns2') {
      if (!this._configurations || !this._configurations.length) {
        throw new ReferenceError('APNS2 configuration is missing');
      }

      const configurations = [];
      this._configurations.forEach((configuration) => {
        configurations.push(this._objectFromAPNS2Configuration(configuration));
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

  _objectFromAPNS2Configuration(configuration) {
    if (!configuration.targets || !configuration.targets.length) {
      throw new ReferenceError('At least one APNS2 target should be provided');
    }

    const targets = [];
    configuration.targets.forEach((target) => {
      targets.push(this._objectFromAPNSTarget(target));
    });

    const { collapseId, expirationDate } = configuration;
    const objectifiedConfiguration = { auth_method: 'token', targets, version: 'v2' };

    if (collapseId && collapseId.length) {
      objectifiedConfiguration.collapse_id = collapseId;
    }

    if (expirationDate) {
      objectifiedConfiguration.expiration = expirationDate.toISOString();
    }

    return objectifiedConfiguration;
  }

  _objectFromAPNSTarget(target) {
    if (!target.topic || !target.topic.length) {
      throw new TypeError("Target 'topic' undefined.");
    }

    const { topic, environment = 'development', excludedDevices = [] } = target;

    const objectifiedTarget = { topic, environment };

    if (excludedDevices.length) {
      objectifiedTarget.excluded_devices = excludedDevices;
    }

    return objectifiedTarget;
  }
}

export class MPNSNotificationPayload extends BaseNotificationPayload {
  _backContent;

  _backTitle;

  _count;

  _type;

  get backContent() {
    return this._backContent;
  }

  set backContent(value) {
    if (!value || !value.length) return;

    this._payload.back_content = value;
    this._backContent = value;
  }

  get backTitle() {
    return this._backTitle;
  }

  set backTitle(value) {
    if (!value || !value.length) return;

    this._payload.back_title = value;
    this._backTitle = value;
  }

  get count() {
    return this._count;
  }

  set count(value) {
    if (value === undefined || value === null) return;

    this._payload.count = value;
    this._count = value;
  }

  get title() {
    return this._title;
  }

  set title(value) {
    if (!value || !value.length) return;

    this._payload.title = value;
    this._title = value;
  }

  get type() {
    return this._type;
  }

  set type(value) {
    if (!value || !value.length) return;

    this._payload.type = value;
    this._type = value;
  }

  get subtitle() {
    return this.backTitle;
  }

  set subtitle(value) {
    this.backTitle = value;
  }

  get body() {
    return this.backContent;
  }

  set body(value) {
    this.backContent = value;
  }

  get badge() {
    return this.count;
  }

  set badge(value) {
    this.count = value;
  }

  toObject() {
    return Object.keys(this._payload).length ? { ...this._payload } : null;
  }
}

export class FCMNotificationPayload extends BaseNotificationPayload {
  _isSilent;

  _icon;

  _tag;

  get notification() {
    return this._payload.notification;
  }

  get data() {
    return this._payload.data;
  }

  get title() {
    return this._title;
  }

  set title(value) {
    if (!value || !value.length) return;

    this._payload.notification.title = value;
    this._title = value;
  }

  get body() {
    return this._body;
  }

  set body(value) {
    if (!value || !value.length) return;

    this._payload.notification.body = value;
    this._body = value;
  }

  get sound() {
    return this._sound;
  }

  set sound(value) {
    if (!value || !value.length) return;

    this._payload.notification.sound = value;
    this._sound = value;
  }

  get icon() {
    return this._icon;
  }

  set icon(value) {
    if (!value || !value.length) return;

    this._payload.notification.icon = value;
    this._icon = value;
  }

  get tag() {
    return this._tag;
  }

  set tag(value) {
    if (!value || !value.length) return;

    this._payload.notification.tag = value;
    this._tag = value;
  }

  set silent(value) {
    this._isSilent = value;
  }

  _setDefaultPayloadStructure() {
    this._payload.notification = {};
    this._payload.data = {};
  }

  toObject() {
    let data = { ...this._payload.data };
    let notification = null;
    const payload = {};

    /**
     * Check whether additional data has been passed outside of 'data' object
     * and put it into it if required.
     */
    if (Object.keys(this._payload).length > 2) {
      const { notification: initialNotification, data: initialData, ...additionalData } = this._payload;

      data = { ...data, ...additionalData };
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
}

class NotificationsPayload {
  _payload;

  _debugging;

  _subtitle;

  _badge;

  _sound;

  _title;

  _body;

  apns;

  mpns;

  fcm;

  set debugging(value) {
    this._debugging = value;
  }

  get title() {
    return this._title;
  }

  get body() {
    return this._body;
  }

  get subtitle() {
    return this._subtitle;
  }

  set subtitle(value) {
    this._subtitle = value;
    this.apns.subtitle = value;
    this.mpns.subtitle = value;
    this.fcm.subtitle = value;
  }

  get badge() {
    return this._badge;
  }

  set badge(value) {
    this._badge = value;
    this.apns.badge = value;
    this.mpns.badge = value;
    this.fcm.badge = value;
  }

  get sound() {
    return this._sound;
  }

  set sound(value) {
    this._sound = value;
    this.apns.sound = value;
    this.mpns.sound = value;
    this.fcm.sound = value;
  }

  constructor(title, body) {
    this._payload = { apns: {}, mpns: {}, fcm: {} };
    this._title = title;
    this._body = body;

    this.apns = new APNSNotificationPayload(this._payload.apns, title, body);
    this.mpns = new MPNSNotificationPayload(this._payload.mpns, title, body);
    this.fcm = new FCMNotificationPayload(this._payload.fcm, title, body);
  }

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
  buildPayload(platforms) {
    const payload = {};

    if (platforms.includes('apns') || platforms.includes('apns2')) {
      this.apns._apnsPushType = platforms.includes('apns') ? 'apns' : 'apns2';
      const apnsPayload = this.apns.toObject();

      if (apnsPayload && Object.keys(apnsPayload).length) {
        payload.pn_apns = apnsPayload;
      }
    }

    if (platforms.includes('mpns')) {
      const mpnsPayload = this.mpns.toObject();

      if (mpnsPayload && Object.keys(mpnsPayload).length) {
        payload.pn_mpns = mpnsPayload;
      }
    }

    if (platforms.includes('fcm')) {
      const fcmPayload = this.fcm.toObject();

      if (fcmPayload && Object.keys(fcmPayload).length) {
        payload.pn_gcm = fcmPayload;
      }
    }

    if (Object.keys(payload).length && this._debugging) {
      payload.pn_debug = true;
    }

    return payload;
  }
}

export default NotificationsPayload;
