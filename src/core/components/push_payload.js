/* @flow */
/* eslint max-classes-per-file: ["error", 5] */
import { APNS2Configuration, APNS2Target } from '../flow_interfaces';

class BaseNotificationPayload {
  _subtitle: ?string;
  _payload: Object;
  _badge: ?number;
  _sound: ?string;
  _title: ?string;
  _body: ?string;

  get payload() {
    return this._payload;
  }

  set title(value: ?string) {
    this._title = value;
  }

  set subtitle(value: ?string) {
    this._subtitle = value;
  }

  set body(value: ?string) {
    this._body = value;
  }

  set badge(value: ?number) {
    this._badge = value;
  }

  set sound(value: ?string) {
    this._sound = value;
  }

  constructor(payload: Object, title: ?string, body: ?string) {
    this._payload = payload;

    this._setDefaultPayloadStructure();
    this.title = title;
    this.body = body;
  }

  _setDefaultPayloadStructure() {
  }

  toObject() {
    return {};
  }
}

export class APNSNotificationPayload extends BaseNotificationPayload {
  _configurations: Array<APNS2Configuration>;
  _apnsPushType: ?string;
  _isSilent: boolean;

  set configurations(value: Array<APNS2Configuration>) {
    if (!value || !value.length) return;

    this._configurations = value;
  }

  get notification() {
    return this._payload.aps;
  }

  get title() {
    return this._title;
  }

  set title(value: ?string) {
    if (!value || !value.length) return;

    this._payload.aps.alert.title = value;
    this._title = value;
  }

  get subtitle() {
    return this._subtitle;
  }

  set subtitle(value: ?string) {
    if (!value || !value.length) return;

    this._payload.aps.alert.subtitle = value;
    this._subtitle = value;
  }

  get body() {
    return this._body;
  }

  set body(value: ?string) {
    if (!value || !value.length) return;

    this._payload.aps.alert.body = value;
    this._body = value;
  }

  get badge() {
    return this._badge;
  }

  set badge(value: ?number) {
    if (value === undefined || value === null) return;

    this._payload.aps.badge = value;
    this._badge = value;
  }

  get sound() {
    return this._sound;
  }

  set sound(value: ?string) {
    if (!value || !value.length) return;

    this._payload.aps.sound = value;
    this._sound = value;
  }

  set silent(value: boolean) {
    this._isSilent = value;
  }

  _setDefaultPayloadStructure() {
    this._payload.aps = { alert: {} };
  }

  toObject(): ?Object {
    let payload = { ...this._payload };
    /** @type {{alert: Object, badge: number, sound: string}} */
    let aps = payload.aps;
    let alert = aps.alert;

    if (this._isSilent) {
      aps['content-available'] = 1;
    }

    if (this._apnsPushType === 'apns2') {
      if (!this._configurations || !this._configurations.length) {
        throw new ReferenceError('APNS2 configuration is missing');
      }

      let configurations = [];
      this._configurations.forEach((configuration: APNS2Configuration) => {
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

  _objectFromAPNS2Configuration(configuration: APNS2Configuration) {
    if (!configuration.targets || !configuration.targets.length) {
      throw new ReferenceError('At least one APNS2 target should be provided');
    }

    let targets = [];
    configuration.targets.forEach((target: APNS2Target) => {
      targets.push(this._objectFromAPNSTarget(target));
    });

    const { collapseId, expirationDate } = configuration;
    let objectifiedConfiguration: {
      auth_method: string,
      targets: Array<Object>,
      version: string,
      collapse_id?: string,
      expiration?: string
    } = { auth_method: 'token', targets, version: 'v2' };

    if (collapseId && collapseId.length) {
      objectifiedConfiguration.collapse_id = collapseId;
    }

    if (expirationDate) {
      objectifiedConfiguration.expiration = expirationDate.toISOString();
    }

    return objectifiedConfiguration;
  }

  _objectFromAPNSTarget(target: APNS2Target) {
    if (!target.topic || !target.topic.length) {
      throw new TypeError('Target \'topic\' undefined.');
    }

    const {
      topic,
      environment = 'development',
      excludedDevices = []
    } = target;

    let objectifiedTarget: {
      topic: string,
      environment: string,
      excluded_devices?: Array<string>
    } = { topic, environment };

    if (excludedDevices.length) {
      objectifiedTarget.excluded_devices = excludedDevices;
    }

    return objectifiedTarget;
  }
}

export class MPNSNotificationPayload extends BaseNotificationPayload  {
  _backContent: ?string;
  _backTitle: ?string;
  _count: ?number;
  _type: ?string;

  get backContent() {
    return this._backContent;
  }

  set backContent(value: ?string) {
    if (!value || !value.length) return;

    this._payload.back_content = value;
    this._backContent = value;
  }

  get backTitle() {
    return this._backTitle;
  }

  set backTitle(value: ?string) {
    if (!value || !value.length) return;

    this._payload.back_title = value;
    this._backTitle = value;
  }

  get count() {
    return this._count;
  }

  set count(value: ?number) {
    if (value === undefined || value === null) return;

    this._payload.count = value;
    this._count = value;
  }

  get title() {
    return this._title;
  }

  set title(value: ?string) {
    if (!value || !value.length) return;

    this._payload.title = value;
    this._title = value;
  }

  get type() {
    return this._type;
  }

  set type(value: ?string) {
    if (!value || !value.length) return;

    this._payload.type = value;
    this._type = value;
  }

  get subtitle() {
    return this.backTitle;
  }

  set subtitle(value: ?string) {
    this.backTitle = value;
  }

  get body() {
    return this.backContent;
  }

  set body(value: ?string) {
    this.backContent = value;
  }

  get badge() {
    return this.count;
  }

  set badge(value: ?number) {
    this.count = value;
  }

  toObject(): ?Object {
    return Object.keys(this._payload).length ? { ...this._payload } : null;
  }
}

export class FCMNotificationPayload extends BaseNotificationPayload  {
  _isSilent: boolean;
  _icon: ?string;
  _tag: ?string;

  get notification() {
    return this._payload.notification;
  }

  get data() {
    return this._payload.data;
  }

  get title() {
    return this._title;
  }

  set title(value: ?string) {
    if (!value || !value.length) return;

    this._payload.notification.title = value;
    this._title = value;
  }

  get body() {
    return this._body;
  }

  set body(value: ?string) {
    if (!value || !value.length) return;

    this._payload.notification.body = value;
    this._body = value;
  }

  get sound() {
    return this._sound;
  }

  set sound(value: ?string) {
    if (!value || !value.length) return;

    this._payload.notification.sound = value;
    this._sound = value;
  }

  get icon() {
    return this._icon;
  }

  set icon(value: ?string) {
    if (!value || !value.length) return;

    this._payload.notification.icon = value;
    this._icon = value;
  }

  get tag() {
    return this._tag;
  }

  set tag(value: ?string) {
    if (!value || !value.length) return;

    this._payload.notification.tag = value;
    this._tag = value;
  }

  set silent(value: boolean) {
    this._isSilent = value;
  }

  _setDefaultPayloadStructure() {
    this._payload.notification = {};
    this._payload.data = {};
  }

  toObject(): ?Object {
    let data = { ...this._payload.data };
    let notification = null;
    let payload = {};

    /**
     * Check whether additional data has been passed outside of 'data' object
     * and put it into it if required.
     */
    if (Object.keys(this._payload).length > 2) {
      let { notification: initialNotification, data: initialData, ...additionalData } = this._payload;

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
  _payload: {apns: Object, mpns: Object, fcm: Object};
  _debugging: boolean;
  _subtitle: ?string;
  _badge: ?number;
  _sound: ?string;
  _title: ?string;
  _body: ?string;
  apns: APNSNotificationPayload;
  mpns: MPNSNotificationPayload;
  fcm: FCMNotificationPayload;

  set debugging(value: boolean) {
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

  set subtitle(value: ?string) {
    this._subtitle = value;
    this.apns.subtitle = value;
    this.mpns.subtitle = value;
    this.fcm.subtitle = value;
  }

  get badge() {
    return this._badge;
  }

  set badge(value: ?number) {
    this._badge = value;
    this.apns.badge = value;
    this.mpns.badge = value;
    this.fcm.badge = value;
  }

  get sound() {
    return this._sound;
  }

  set sound(value: ?string) {
    this._sound = value;
    this.apns.sound = value;
    this.mpns.sound = value;
    this.fcm.sound = value;
  }

  constructor(title: ?string, body: ?string) {
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
  buildPayload(platforms: Array<string>) {
    let payload = {};

    if (platforms.includes('apns') || platforms.includes('apns2')) {
      this.apns._apnsPushType = platforms.includes('apns') ? 'apns' : 'apns2';
      let apnsPayload = this.apns.toObject();

      if (apnsPayload && Object.keys(apnsPayload).length) {
        payload.pn_apns = apnsPayload;
      }
    }

    if (platforms.includes('mpns')) {
      let mpnsPayload = this.mpns.toObject();

      if (mpnsPayload && Object.keys(mpnsPayload).length) {
        payload.pn_mpns = mpnsPayload;
      }
    }

    if (platforms.includes('fcm')) {
      let fcmPayload = this.fcm.toObject();

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
