type APNSPayload = {
    aps: {
        alert?: {
            title?: string;
            subtitle?: string;
            body?: string;
        };
        badge?: number | null;
        sound?: string;
        'content-available'?: 1;
    };
    pn_push: PubNubAPNS2Configuration[];
};
type APNS2Configuration = {
    collapseId?: string;
    expirationDate?: Date;
    targets: APNS2Target[];
};
type PubNubAPNS2Configuration = {
    auth_method: 'token';
    targets: PubNubAPNS2Target[];
    collapse_id?: string;
    expiration?: string;
    version: 'v2';
};
type APNS2Target = {
    topic: string;
    environment?: 'development' | 'production';
    excludedDevices?: string[];
};
type PubNubAPNS2Target = Omit<APNS2Target, 'excludedDevices'> & {
    excluded_devices?: string[];
};
type FCMPayload = {
    notification?: {
        title?: string;
        body?: string;
        icon?: string;
        sound?: string;
        tag?: string;
    };
    data?: {
        notification?: FCMPayload['notification'];
    };
};
declare class BaseNotificationPayload {
    protected _title?: string;
    protected _subtitle?: string;
    protected _sound?: string;
    protected _badge?: number | null;
    protected _body?: string;
    protected _payload: unknown;
    constructor(payload: unknown, title?: string, body?: string);
    get payload(): unknown;
    set title(value: string | undefined);
    set subtitle(value: string | undefined);
    set body(value: string | undefined);
    set badge(value: number | null | undefined);
    set sound(value: string | undefined);
    protected setDefaultPayloadStructure(): void;
    toObject(): unknown;
}
export declare class APNSNotificationPayload extends BaseNotificationPayload {
    private _configurations?;
    private _apnsPushType;
    private _isSilent;
    get payload(): APNSPayload;
    set configurations(value: APNS2Configuration[]);
    get notification(): {
        alert?: {
            title?: string | undefined;
            subtitle?: string | undefined;
            body?: string | undefined;
        } | undefined;
        badge?: number | null | undefined;
        sound?: string | undefined;
        'content-available'?: 1 | undefined;
    };
    get title(): string | undefined;
    set title(value: string | undefined);
    get subtitle(): string | undefined;
    set subtitle(value: string | undefined);
    get body(): string | undefined;
    set body(value: string | undefined);
    get badge(): number | null | undefined;
    set badge(value: number | null | undefined);
    get sound(): string | undefined;
    set sound(value: string | undefined);
    set silent(value: boolean);
    protected setDefaultPayloadStructure(): void;
    toObject(): APNSPayload | null;
    private objectFromAPNS2Configuration;
    private objectFromAPNSTarget;
}
export declare class FCMNotificationPayload extends BaseNotificationPayload {
    private _isSilent?;
    private _icon?;
    private _tag?;
    get payload(): FCMPayload;
    get notification(): {
        title?: string | undefined;
        body?: string | undefined;
        icon?: string | undefined;
        sound?: string | undefined;
        tag?: string | undefined;
    } | undefined;
    get data(): {
        notification?: {
            title?: string | undefined;
            body?: string | undefined;
            icon?: string | undefined;
            sound?: string | undefined;
            tag?: string | undefined;
        } | undefined;
    } | undefined;
    get title(): string | undefined;
    set title(value: string | undefined);
    get body(): string | undefined;
    set body(value: string | undefined);
    get sound(): string | undefined;
    set sound(value: string | undefined);
    get icon(): string | undefined;
    set icon(value: string | undefined);
    get tag(): string | undefined;
    set tag(value: string | undefined);
    set silent(value: boolean);
    protected setDefaultPayloadStructure(): void;
    toObject(): FCMPayload | null;
}
declare class NotificationsPayload {
    private readonly _payload;
    private _debugging?;
    private readonly _title;
    private _subtitle?;
    private readonly _body;
    private _badge?;
    private _sound?;
    apns: APNSNotificationPayload;
    fcm: FCMNotificationPayload;
    constructor(title: string, body: string);
    set debugging(value: boolean);
    get title(): string;
    get subtitle(): string | undefined;
    set subtitle(value: string | undefined);
    get body(): string;
    get badge(): number | undefined;
    set badge(value: number | undefined);
    get sound(): string | undefined;
    set sound(value: string | undefined);
    buildPayload(platforms: string[]): {
        pn_apns?: APNSPayload | undefined;
        pn_gcm?: FCMPayload | undefined;
        pn_debug?: boolean | undefined;
    };
}
export default NotificationsPayload;
