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
    data?: {
        notification?: FCMPayload['notification'];
    };
};
/**
 * Base notification payload object.
 */
declare class BaseNotificationPayload {
    /**
     * Retrieve resulting notification payload content for message.
     *
     * @returns Preformatted push notification payload data.
     */
    get payload(): unknown;
    /**
     * Update notification title.
     *
     * @param value - New notification title.
     */
    set title(value: string | undefined);
    /**
     * Update notification subtitle.
     *
     * @param value - New second-line notification title.
     */
    set subtitle(value: string | undefined);
    /**
     * Update notification body.
     *
     * @param value - Update main notification message (shown when expanded).
     */
    set body(value: string | undefined);
    /**
     * Update application badge number.
     *
     * @param value - Number which should be shown in application badge upon receiving notification.
     */
    set badge(value: number | null | undefined);
    /**
     * Update notification sound.
     *
     * @param value - Name of the sound file which should be played upon notification receive.
     */
    set sound(value: string | undefined);
}
/**
 * Message payload for Apple Push Notification Service.
 */
export declare class APNSNotificationPayload extends BaseNotificationPayload {
    get payload(): APNSPayload;
    /**
     * Update notification receivers configuration.
     *
     * @param value - New APNS2 configurations.
     */
    set configurations(value: APNS2Configuration[]);
    /**
     * Notification payload.
     *
     * @returns Platform-specific part of PubNub notification payload.
     */
    get notification(): {
        /**
         * Configuration of visual notification representation.
         */
        alert?: {
            /**
             * First line title.
             *
             * Title which is shown in bold on the first line of notification bubble.
             */
            title?: string | undefined;
            /**
             * Second line title.
             *
             * Subtitle which is shown under main title with smaller font.
             */
            subtitle?: string | undefined;
            /**
             * Notification body.
             *
             * Body which is shown to the user after interaction with notification.
             */
            body?: string | undefined;
        } | undefined;
        /**
         * Unread notifications count badge value.
         */
        badge?: number | null | undefined;
        /**
         * Name of the file from resource bundle which should be played when notification received.
         */
        sound?: string | undefined;
        /**
         * Silent notification flag.
         */
        'content-available'?: 1 | undefined;
    };
    /**
     * Notification title.
     *
     * @returns Main notification title.
     */
    get title(): string | undefined;
    /**
     * Update notification title.
     *
     * @param value - New notification title.
     */
    set title(value: string | undefined);
    /**
     * Notification subtitle.
     *
     * @returns Second-line notification title.
     */
    get subtitle(): string | undefined;
    /**
     * Update notification subtitle.
     *
     * @param value - New second-line notification title.
     */
    set subtitle(value: string | undefined);
    /**
     * Notification body.
     *
     * @returns Main notification message (shown when expanded).
     */
    get body(): string | undefined;
    /**
     * Update notification body.
     *
     * @param value - Update main notification message (shown when expanded).
     */
    set body(value: string | undefined);
    /**
     * Retrieve unread notifications number.
     *
     * @returns Number of unread notifications which should be shown on application badge.
     */
    get badge(): number | null | undefined;
    /**
     * Update application badge number.
     *
     * @param value - Number which should be shown in application badge upon receiving notification.
     */
    set badge(value: number | null | undefined);
    /**
     * Retrieve notification sound file.
     *
     * @returns Notification sound file name from resource bundle.
     */
    get sound(): string | undefined;
    /**
     * Update notification sound.
     *
     * @param value - Name of the sound file which should be played upon notification receive.
     */
    set sound(value: string | undefined);
    /**
     * Set whether notification should be silent or not.
     *
     * `content-available` notification type will be used to deliver silent notification if set to `true`.
     *
     * @param value - Whether notification should be sent as silent or not.
     */
    set silent(value: boolean);
}
/**
 * Message payload for Firebase Clouse Messaging service.
 */
export declare class FCMNotificationPayload extends BaseNotificationPayload {
    get payload(): FCMPayload;
    /**
     * Notification payload.
     *
     * @returns Platform-specific part of PubNub notification payload.
     */
    get notification(): {
        /**
         * First line title.
         *
         * Title which is shown in bold on the first line of notification bubble.
         */
        title?: string | undefined;
        /**
         * Notification body.
         *
         * Body which is shown to the user after interaction with notification.
         */
        body?: string | undefined;
        /**
         * Name of the icon file from resource bundle which should be shown on notification.
         */
        icon?: string | undefined;
        /**
         * Name of the file from resource bundle which should be played when notification received.
         */
        sound?: string | undefined;
        tag?: string | undefined;
    } | undefined;
    /**
     * Silent notification payload.
     *
     * @returns Silent notification payload (data notification).
     */
    get data(): {
        notification?: {
            /**
             * First line title.
             *
             * Title which is shown in bold on the first line of notification bubble.
             */
            title?: string | undefined;
            /**
             * Notification body.
             *
             * Body which is shown to the user after interaction with notification.
             */
            body?: string | undefined;
            /**
             * Name of the icon file from resource bundle which should be shown on notification.
             */
            icon?: string | undefined;
            /**
             * Name of the file from resource bundle which should be played when notification received.
             */
            sound?: string | undefined;
            tag?: string | undefined;
        } | undefined;
    } | undefined;
    /**
     * Notification title.
     *
     * @returns Main notification title.
     */
    get title(): string | undefined;
    /**
     * Update notification title.
     *
     * @param value - New notification title.
     */
    set title(value: string | undefined);
    /**
     * Notification body.
     *
     * @returns Main notification message (shown when expanded).
     */
    get body(): string | undefined;
    /**
     * Update notification body.
     *
     * @param value - Update main notification message (shown when expanded).
     */
    set body(value: string | undefined);
    /**
     * Retrieve notification sound file.
     *
     * @returns Notification sound file name from resource bundle.
     */
    get sound(): string | undefined;
    /**
     * Update notification sound.
     *
     * @param value - Name of the sound file which should be played upon notification receive.
     */
    set sound(value: string | undefined);
    /**
     * Retrieve notification icon file.
     *
     * @returns Notification icon file name from resource bundle.
     */
    get icon(): string | undefined;
    /**
     * Update notification icon.
     *
     * @param value - Name of the icon file which should be shown on notification.
     */
    set icon(value: string | undefined);
    /**
     * Retrieve notifications grouping tag.
     *
     * @returns Notifications grouping tag.
     */
    get tag(): string | undefined;
    /**
     * Update notifications grouping tag.
     *
     * @param value - String which will be used to group similar notifications in notification center.
     */
    set tag(value: string | undefined);
    /**
     * Set whether notification should be silent or not.
     *
     * All notification data will be sent under `data` field if set to `true`.
     *
     * @param value - Whether notification should be sent as silent or not.
     */
    set silent(value: boolean);
}
declare class NotificationsPayload {
    /**
     * APNS-specific message payload.
     */
    apns: APNSNotificationPayload;
    /**
     * FCM-specific message payload.
     */
    fcm: FCMNotificationPayload;
    /**
     * Enable or disable push notification debugging message.
     *
     * @param value - Whether debug message from push notification scheduler should be published to the specific
     * channel or not.
     */
    set debugging(value: boolean);
    /**
     * Notification title.
     *
     * @returns Main notification title.
     */
    get title(): string;
    /**
     * Notification subtitle.
     *
     * @returns Second-line notification title.
     */
    get subtitle(): string | undefined;
    /**
     * Update notification subtitle.
     *
     * @param value - New second-line notification title.
     */
    set subtitle(value: string | undefined);
    /**
     * Notification body.
     *
     * @returns Main notification message (shown when expanded).
     */
    get body(): string;
    /**
     * Retrieve unread notifications number.
     *
     * @returns Number of unread notifications which should be shown on application badge.
     */
    get badge(): number | undefined;
    /**
     * Update application badge number.
     *
     * @param value - Number which should be shown in application badge upon receiving notification.
     */
    set badge(value: number | undefined);
    /**
     * Retrieve notification sound file.
     *
     * @returns Notification sound file name from resource bundle.
     */
    get sound(): string | undefined;
    /**
     * Update notification sound.
     *
     * @param value - Name of the sound file which should be played upon notification receive.
     */
    set sound(value: string | undefined);
    /**
     * Build notifications platform for requested platforms.
     *
     * @param platforms - List of platforms for which payload should be added to final dictionary. Supported values:
     * fcm, apns, and apns2.
     *
     * @returns Object with data, which can be sent with publish method call and trigger remote notifications for
     * specified platforms.
     */
    buildPayload(platforms: ('apns' | 'apns2' | 'fcm')[]): {
        pn_apns?: APNSPayload | undefined;
        pn_gcm?: FCMPayload | undefined;
        pn_debug?: boolean | undefined;
    };
}
export default NotificationsPayload;
