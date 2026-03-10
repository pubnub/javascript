import type { Payload } from '../types/api';

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
type FCMNotification = {
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
   * URL of the image to be displayed in the notification.
   */
  image?: string;
};

/**
 * Android-specific notification fields for FCM HTTP v1 API.
 *
 * These fields are only applicable to Android devices and are nested under `android.notification`.
 */
type FCMAndroidNotification = {
  /**
   * Notification title override for Android.
   */
  title?: string;

  /**
   * Notification body override for Android.
   */
  body?: string;

  /**
   * Name of the icon file from resource bundle which should be shown on notification.
   */
  icon?: string;

  /**
   * URL of the image to be displayed in the notification.
   */
  image?: string;

  /**
   * Name of the file from resource bundle which should be played when notification received.
   */
  sound?: string;

  /**
   * Identifier used to group notifications in the notification center.
   */
  tag?: string;

  /**
   * Number of active notifications associated with the application shown on the device badge.
   */
  notification_count?: number;
} & Record<string, Payload | null>;

/**
 * Android platform configuration for FCM HTTP v1 API.
 */
type FCMAndroidConfig = {
  /**
   * Identifier for a group of messages that can be collapsed.
   *
   * Only the last message gets sent when delivery resumes. Maximum of 4 different collapse keys at any given time.
   */
  collapse_key?: string;

  /**
   * Android-specific notification fields.
   */
  notification?: FCMAndroidNotification;

  /**
   * Arbitrary key/value payload.
   *
   * Values must be strings. Delivered as intent extras when the app is in the foreground.
   */
  data?: Record<string, string>;
} & Record<string, Payload | null>;

/**
 * Payload for `pn_fcm` field in published message.
 *
 * Follows the FCM HTTP v1 API message structure.
 */
type FCMPayload = {
  /**
   * Cross-platform notification payload.
   */
  notification?: FCMNotification;

  /**
   * Android-specific message configuration.
   */
  android?: FCMAndroidConfig;

  /**
   * Cross-platform arbitrary key/value payload.
   *
   * All values must be strings. If the app is in the background, the data payload is used to determine which callback
   * is fired — notification or data.
   */
  data?: Record<string, string>;

  /**
   * APNS-specific options for notification delivery.
   */
  apns?: Record<string, Payload | null>;

  /**
   * Web Push-specific options for notification delivery.
   */
  webpush?: Record<string, Payload | null>;

  /**
   * List of device tokens that should be excluded from receiving the notification.
   */
  pn_exceptions?: string[];
};
// endregion

/**
 * Base notification payload object.
 */
class BaseNotificationPayload {
  /**
   * Notification main title.
   *
   * @internal
   */
  protected _title?: string;

  /**
   * Notification second-line title.
   *
   * @internal
   */
  protected _subtitle?: string;

  /**
   * Name of the sound which should be played for received notification.
   *
   * @internal
   */
  protected _sound?: string;

  /**
   * Value which should be placed on application badge (if required).
   *
   * @internal
   */
  protected _badge?: number | null;

  /**
   * Notification main body message.
   *
   * @internal
   */
  protected _body?: string;

  /**
   * Object in resulting message where notification payload should be added.
   *
   * @internal
   */
  protected _payload: unknown;

  /**
   * Base notification provider payload object.
   *
   * @internal
   *
   * @param payload - Object which contains vendor-specific preformatted push notification payload.
   * @param title - Notification main title.
   * @param body - Notification body (main messages).
   */
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
   *
   * @internal
   */
  protected setDefaultPayloadStructure() {}

  /**
   * Translate data object into PubNub push notification payload object.
   *
   * @internal
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
   *
   * @internal
   */
  private _configurations?: APNS2Configuration[];

  /**
   * Type of push notification service for which payload will be created.
   *
   * @internal
   */
  private _apnsPushType: 'apns' | 'apns2' = 'apns';

  /**
   * Whether resulting payload should trigger silent notification or not.
   *
   * @internal
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

  /**
   * Setup push notification payload default content.
   *
   * @internal
   */
  protected setDefaultPayloadStructure() {
    this.payload.aps = { alert: {} };
  }

  /**
   * Translate data object into PubNub push notification payload object.
   *
   * @internal
   *
   * @returns Preformatted push notification payload.
   */
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
   * @internal
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
   * @internal
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
 * Message payload for Firebase Cloud Messaging service.
 */
export class FCMNotificationPayload extends BaseNotificationPayload {
  /**
   * Whether resulting payload should trigger silent notification or not.
   *
   * @internal
   */
  private _isSilent?: boolean;

  /**
   * Name of the icon file from resource bundle which should be shown on notification.
   *
   * @internal
   */
  private _icon?: string;

  /**
   * Notifications grouping tag.
   *
   * @internal
   */
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
   * Retrieve Android notification payload and initialize required structure.
   *
   * @returns Android specific notification payload.
   */
  private get androidNotification() {
    return this.payload.android?.notification;
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
    this.androidNotification!.title = value;
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
    this.androidNotification!.body = value;
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
    this.androidNotification!.notification_count = value;
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

    this.androidNotification!.sound = value;
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
   * @param value - Name of the icon file set for `android.notification.icon`.
   */
  set icon(value) {
    if (!value || !value.length) return;

    this.androidNotification!.icon = value;
    this._icon = value;
  }

  /**
   * Retrieve notifications grouping tag.
   *
   * @returns Notifications grouping tag.
   */
  get tag() {
    return this._tag;
  }

  /**
   * Update notifications grouping tag.
   *
   * @param value - String set for `android.notification.tag` to group similar notifications.
   */
  set tag(value) {
    if (!value || !value.length) return;
    this.androidNotification!.tag = value;
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

  /**
   * Setup push notification payload default content.
   *
   * @internal
   */
  protected setDefaultPayloadStructure() {
    this.payload.notification = {};
    this.payload.data = {};
    this.payload.android = { notification: {} };
  }

  /**
   * Translate data object into PubNub push notification payload object.
   *
   * @internal
   *
   * @returns Preformatted push notification payload.
   */
  public toObject(): FCMPayload | null {
    const payload: FCMPayload = {};

    const notification = { ...this.payload.notification };
    const android = { ...this.payload.android };
    const androidNotification = { ...(android.notification ?? {}) };

    // Strip title/body from android.notification — they belong in top-level notification (or data for silent).
    const { title: _t, body: _b, ...androidSpecificFields } = androidNotification;

    if (this._isSilent) {
      // For silent (data-only) notifications, strip all `notification` fields
      // (both root and android) and move everything into the root `data` object.
      const data: Record<string, string> = {};

      if (this._title) data.title = this._title;
      if (this._body) data.body = this._body;

      // Merge android-specific notification fields (sound, icon, tag, etc.) into data.
      for (const [key, value] of Object.entries(androidSpecificFields)) {
        if (value !== undefined && value !== null) data[key] = String(value);
      }

      // Merge any existing user-provided custom data.
      if (this.payload.data) Object.assign(data, this.payload.data);

      if (Object.keys(data).length) payload.data = data;

      // Exclude `notification` entirely from android — only keep non-notification android fields.
      delete android.notification;
      if (Object.keys(android).length) {
        payload.android = android;
      }
    } else {
      if (Object.keys(notification).length) payload.notification = notification;

      // Include top-level data if present.
      if (this.payload.data && Object.keys(this.payload.data).length) payload.data = { ...this.payload.data };

      // android.notification should only contain android-specific fields (sound, icon, tag, etc.).
      if (Object.keys(androidSpecificFields).length) {
        const { notification: _, ...androidWithoutNotification } = android;
        payload.android = {
          ...androidWithoutNotification,
          notification: androidSpecificFields as FCMAndroidNotification,
        };
      } else {
        const { notification: _, ...androidWithoutNotification } = android;
        if (Object.keys(androidWithoutNotification).length) {
          payload.android = androidWithoutNotification;
        }
      }
    }

    // Preserve other top-level FCM fields (apns, webpush, fcm_options, etc.).
    const { notification: _n, android: _a, data: _d, pn_exceptions: _pe, ...otherFields } = this.payload;
    Object.assign(payload, otherFields);

    if (this.payload.pn_exceptions?.length) payload.pn_exceptions = this.payload.pn_exceptions;

    return Object.keys(payload).length ? payload : null;
  }
}

class NotificationsPayload {
  /**
   * Resulting message payload for notification services.
   *
   * @internal
   */
  private readonly _payload;

  /**
   * Whether notifications debugging session should be used or not.
   *
   * @internal
   */
  private _debugging?: boolean;

  /**
   * First line title.
   *
   * Title which is shown in bold on the first line of notification bubble.
   *
   * @internal
   */
  private readonly _title: string;

  /**
   * Second line title.
   *
   * Subtitle which is shown under main title with smaller font.
   *
   * @internal
   */
  private _subtitle?: string;

  /**
   * Notification main body message.
   *
   * @internal
   */
  private readonly _body: string;

  /**
   * Value which should be placed on application badge (if required).
   *
   * @internal
   */
  private _badge?: number;

  /**
   * Name of the file from resource bundle which should be played when notification received.
   *
   * @internal
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

  /**
   * Create push notification payload holder.
   *
   * @internal
   *
   * @param title - String which will be shown at the top of the notification (below app name).
   * @param body - String with message which should be shown when user will check notification.
   */
  constructor(title: string, body: string) {
    this._payload = { apns: {}, fcm: {} };
    this._title = title;
    this._body = body;

    this.apns = new APNSNotificationPayload(this._payload.apns, title, body);
    this.fcm = new FCMNotificationPayload(this._payload.fcm, title, body);
  }

  /**
   * Enable or disable push notification debugging message.
   *
   * @param value - Whether debug message from push notification scheduler should be published to the specific
   * channel or not.
   */
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
   * fcm, apns, and apns2.
   *
   * @returns Object with data, which can be sent with publish method call and trigger remote notifications for
   * specified platforms.
   */
  buildPayload(platforms: ('apns' | 'apns2' | 'fcm')[]) {
    const payload: { pn_apns?: APNSPayload; pn_fcm?: FCMPayload; pn_debug?: boolean } = {};

    if (platforms.includes('apns') || platforms.includes('apns2')) {
      // @ts-expect-error Override APNS version.
      this.apns._apnsPushType = platforms.includes('apns') ? 'apns' : 'apns2';
      const apnsPayload = this.apns.toObject();

      if (apnsPayload && Object.keys(apnsPayload).length) payload.pn_apns = apnsPayload;
    }

    if (platforms.includes('fcm')) {
      const fcmPayload = this.fcm.toObject();

      if (fcmPayload && Object.keys(fcmPayload).length) payload.pn_fcm = fcmPayload;
    }

    if (Object.keys(payload).length && this._debugging) payload.pn_debug = true;

    return payload;
  }
}

export default NotificationsPayload;
