// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

// region APNS2
/**
 * Payload for `pn_apns` field in published message.
 */
type APNSPayload = {
  /**
   * Payload for Apple Push Notification Service.
   */
  aps: {
    /**
     * Configuration of visual notification representation.
     */
    alert?: {
      /**
       * First line title.
       *
       * Title which is shown in bold on the first line of notification bubble.
       */
      title?: string;

      /**
       * Second line title.
       *
       * Subtitle which is shown under main title with smaller font.
       */
      subtitle?: string;

      /**
       * Notification body.
       *
       * Body which is shown to the user after interaction with notification.
       */
      body?: string;
    };

    /**
     * Unread notifications count badge value.
     */
    badge?: number | null;

    /**
     * Name of the file from resource bundle which should be played when notification received.
     */
    sound?: string;

    /**
     * Silent notification flag.
     */
    'content-available'?: 1;
  };

  /**
   * APNS2 payload recipients information.
   */
  pn_push: PubNubAPNS2Configuration[];
};

/**
 * APNS2 configuration type.
 */
type APNS2Configuration = {
  /**
   * Notification group / collapse identifier. Value will be used in APNS POST request as `apns-collapse-id` header
   * value.
   */
  collapseId?: string;

  /**
   * Date till which APNS will try to deliver notification to target device. Value will be used in APNS POST request as
   * `apns-expiration` header value.
   */
  expirationDate?: Date;

  /**
   * List of topics which should receive this notification.
   */
  targets: APNS2Target[];
};

/**
 * Preformatted for PubNub service `APNS2` configuration type.
 */
type PubNubAPNS2Configuration = {
  /**
   * PubNub service authentication method for APNS.
   */
  auth_method: 'token';

  /**
   * Target entities which should receive notification.
   */
  targets: PubNubAPNS2Target[];

  /**
   * Notifications group collapse identifier.
   */
  collapse_id?: string;

  /**
   * Notification receive expiration date.
   *
   * Date after which notification won't be delivered.
   */
  expiration?: string;

  /**
   * APNS protocol version.
   */
  version: 'v2';
};

/**
 * APNS2 configuration target type.
 */
type APNS2Target = {
  /**
   * Notifications topic name (usually it is bundle identifier of application for Apple platform).
   *
   * **Important:** Required only if `pushGateway` is set to `apns2`.
   */
  topic: string;

  /**
   * Environment within which registered devices to which notifications should be delivered.
   *
   * Available:
   * - `development`
   * - `production`
   *
   * @default `development`
   */
  environment?: 'development' | 'production';

  /**
   * List of devices (their push tokens) to which this notification shouldn't be delivered.
   */
  excludedDevices?: string[];
};

/**
 * Preformatted for PubNub service `APNS2` configuration target type.
 */
type PubNubAPNS2Target = Omit<APNS2Target, 'excludedDevices'> & {
  /**
   * List of devices (their push tokens) to which this notification shouldn't be delivered.
   */
  excluded_devices?: string[];
};
// endregion

// region FCM
/**
 * Payload for `pn_gcm` field in published message.
 */
type FCMPayload = {
  /**
   * Configuration of visual notification representation.
   */
  notification?: {
    /**
     * First line title.
     *
     * Title which is shown in bold on the first line of notification bubble.
     */
    title?: string;

    /**
     * Notification body.
     *
     * Body which is shown to the user after interaction with notification.
     */
    body?: string;

    /**
     * Name of the icon file from resource bundle which should be shown on notification.
     */
    icon?: string;

    /**
     * Name of the file from resource bundle which should be played when notification received.
     */
    sound?: string;

    tag?: string;
  };

  /**
   * Configuration of data notification.
   *
   * Silent notification configuration.
   */
  data?: { notification?: FCMPayload['notification'] };
};
// endregion
// endregion

/**
 * Base notification payload object.
 */
class BaseNotificationPayload {
  /**
   * Notification main title.
   */
  protected _title?: string;

  /**
   * Notification second-line title.
   */
  protected _subtitle?: string;

  /**
   * Name of the sound which should be played for received notification.
   */
  protected _sound?: string;

  /**
   * Value which should be placed on application badge (if required).
   */
  protected _badge?: number | null;

  /**
   * Notification main body message.
   */
  protected _body?: string;

  /**
   * Object in resulting message where notification payload should be added.
   */
  protected _payload: unknown;

  constructor(payload: unknown, title?: string, body?: string) {
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
  get payload(): unknown {
    return this._payload;
  }

  /**
   * Update notification title.
   *
   * @param value - New notification title.
   */
  set title(value: string | undefined) {
    this._title = value;
  }

  /**
   * Update notification subtitle.
   *
   * @param value - New second-line notification title.
   */
  set subtitle(value: string | undefined) {
    this._subtitle = value;
  }

  /**
   * Update notification body.
   *
   * @param value - Update main notification message (shown when expanded).
   */
  set body(value: string | undefined) {
    this._body = value;
  }

  /**
   * Update application badge number.
   *
   * @param value - Number which should be shown in application badge upon receiving notification.
   */
  set badge(value: number | null | undefined) {
    this._badge = value;
  }

  /**
   * Update notification sound.
   *
   * @param value - Name of the sound file which should be played upon notification receive.
   */
  set sound(value: string | undefined) {
    this._sound = value;
  }

  /**
   * Platform-specific structure initialization.
   */
  protected setDefaultPayloadStructure() {}

  /**
   * Translate data object into PubNub push notification payload object.
   *
   * @returns Preformatted push notification payload.
   */
  public toObject(): unknown {
    return {};
  }
}

/**
 * Message payload for Apple Push Notification Service.
 */
export class APNSNotificationPayload extends BaseNotificationPayload {
  /**
   * List with notification receivers information.
   */
  private _configurations?: APNS2Configuration[];

  /**
   * Type of push notification service for which payload will be created.
   */
  private _apnsPushType: 'apns' | 'apns2' = 'apns';

  /**
   * Whether resulting payload should trigger silent notification or not.
   */
  private _isSilent: boolean = false;

  get payload(): APNSPayload {
    return this._payload as APNSPayload;
  }

  /**
   * Update notification receivers configuration.
   *
   * @param value - New APNS2 configurations.
   */
  set configurations(value: APNS2Configuration[]) {
    if (!value || !value.length) return;

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
    if (!value || !value.length) return;

    this.payload.aps.alert!.title = value;
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
    if (!value || !value.length) return;

    this.payload.aps.alert!.subtitle = value;
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
    if (!value || !value.length) return;

    this.payload.aps.alert!.body = value;
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
    if (value === undefined || value === null) return;

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
    if (!value || !value.length) return;

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
  set silent(value: boolean) {
    this._isSilent = value;
  }

  protected setDefaultPayloadStructure() {
    this.payload.aps = { alert: {} };
  }

  public toObject(): APNSPayload | null {
    const payload = { ...this.payload };
    const { aps } = payload;
    let { alert } = aps;

    if (this._isSilent) aps['content-available'] = 1;

    if (this._apnsPushType === 'apns2') {
      if (!this._configurations || !this._configurations.length)
        throw new ReferenceError('APNS2 configuration is missing');

      const configurations: PubNubAPNS2Configuration[] = [];
      this._configurations.forEach((configuration) => {
        configurations.push(this.objectFromAPNS2Configuration(configuration));
      });

      if (configurations.length) payload.pn_push = configurations;
    }

    if (!alert || !Object.keys(alert).length) delete aps.alert;

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
  private objectFromAPNS2Configuration(configuration: APNS2Configuration): PubNubAPNS2Configuration {
    if (!configuration.targets || !configuration.targets.length)
      throw new ReferenceError('At least one APNS2 target should be provided');

    const { collapseId, expirationDate } = configuration;
    const objectifiedConfiguration: PubNubAPNS2Configuration = {
      auth_method: 'token',
      targets: configuration.targets.map((target) => this.objectFromAPNSTarget(target)),
      version: 'v2',
    };

    if (collapseId && collapseId.length) objectifiedConfiguration.collapse_id = collapseId;
    if (expirationDate) objectifiedConfiguration.expiration = expirationDate.toISOString();

    return objectifiedConfiguration;
  }

  /**
   * Create PubNub push notification service APNS2 target information object.
   *
   * @param target - Source user-provided data.
   *
   * @returns Preformatted for PubNub service APNS2 target information.
   */
  private objectFromAPNSTarget(target: APNS2Target): PubNubAPNS2Target {
    if (!target.topic || !target.topic.length) throw new TypeError("Target 'topic' undefined.");

    const { topic, environment = 'development', excludedDevices = [] } = target;
    const objectifiedTarget: PubNubAPNS2Target = { topic, environment };

    if (excludedDevices.length) objectifiedTarget.excluded_devices = excludedDevices;

    return objectifiedTarget;
  }
}

/**
 * Message payload for Firebase Clouse Messaging service.
 */
export class FCMNotificationPayload extends BaseNotificationPayload {
  /**
   * Whether resulting payload should trigger silent notification or not.
   */
  private _isSilent?: boolean;

  /**
   * Name of the icon file from resource bundle which should be shown on notification.
   */
  private _icon?: string;

  private _tag?: string;

  get payload(): FCMPayload {
    return this._payload as FCMPayload;
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
    if (!value || !value.length) return;

    this.payload.notification!.title = value;
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
    if (!value || !value.length) return;

    this.payload.notification!.body = value;
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
    if (!value || !value.length) return;

    this.payload.notification!.sound = value;
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
    if (!value || !value.length) return;

    this.payload.notification!.icon = value;
    this._icon = value;
  }

  get tag() {
    return this._tag;
  }

  set tag(value) {
    if (!value || !value.length) return;

    this.payload.notification!.tag = value;
    this._tag = value;
  }

  /**
   * Set whether notification should be silent or not.
   *
   * All notification data will be sent under `data` field if set to `true`.
   *
   * @param value - Whether notification should be sent as silent or not.
   */
  set silent(value: boolean) {
    this._isSilent = value;
  }

  protected setDefaultPayloadStructure() {
    this.payload.notification = {};
    this.payload.data = {};
  }

  public toObject(): FCMPayload | null {
    let data = { ...this.payload.data };
    let notification = null;
    const payload: FCMPayload = {};

    // Check whether additional data has been passed outside 'data' object and put it into it if required.
    if (Object.keys(this.payload).length > 2) {
      const { notification: initialNotification, data: initialData, ...additionalData } = this.payload;

      data = { ...data, ...additionalData };
    }

    if (this._isSilent) data.notification = this.payload.notification;
    else notification = this.payload.notification;

    if (Object.keys(data).length) payload.data = data;
    if (notification && Object.keys(notification).length) payload.notification = notification;

    return Object.keys(payload).length ? payload : null;
  }
}

class NotificationsPayload {
  /**
   * Resulting message payload for notification services.
   */
  private readonly _payload;

  /**
   * Whether notifications debugging session should be used or not.
   */
  private _debugging?: boolean;
  /**
   * First line title.
   *
   * Title which is shown in bold on the first line of notification bubble.
   */
  private readonly _title: string;

  /**
   * Second line title.
   *
   * Subtitle which is shown under main title with smaller font.
   */
  private _subtitle?: string;

  /**
   * Notification main body message.
   */
  private readonly _body: string;

  /**
   * Value which should be placed on application badge (if required).
   */
  private _badge?: number;

  /**
   * Name of the file from resource bundle which should be played when notification received.
   */
  private _sound?: string;

  /**
   * APNS-specific message payload.
   */
  public apns;

  /**
   * FCM-specific message payload.
   */
  public fcm;

  constructor(title: string, body: string) {
    this._payload = { apns: {}, fcm: {} };
    this._title = title;
    this._body = body;

    this.apns = new APNSNotificationPayload(this._payload.apns, title, body);
    this.fcm = new FCMNotificationPayload(this._payload.fcm, title, body);
  }

  set debugging(value: boolean) {
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
  set badge(value: number | undefined) {
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
  buildPayload(platforms: string[]) {
    const payload: { pn_apns?: APNSPayload; pn_gcm?: FCMPayload; pn_debug?: boolean } = {};

    if (platforms.includes('apns') || platforms.includes('apns2')) {
      // @ts-expect-error Override APNS version.
      this.apns._apnsPushType = platforms.includes('apns') ? 'apns' : 'apns2';
      const apnsPayload = this.apns.toObject();

      if (apnsPayload && Object.keys(apnsPayload).length) payload.pn_apns = apnsPayload;
    }

    if (platforms.includes('fcm')) {
      const fcmPayload = this.fcm.toObject();

      if (fcmPayload && Object.keys(fcmPayload).length) payload.pn_gcm = fcmPayload;
    }

    if (Object.keys(payload).length && this._debugging) payload.pn_debug = true;

    return payload;
  }
}

export default NotificationsPayload;
