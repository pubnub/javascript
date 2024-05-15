export type Metadata = Record<string, string | number | boolean | null>;
export type ChannelTokenPermissions = {
    read?: boolean;
    write?: boolean;
    get?: boolean;
    manage?: boolean;
    update?: boolean;
    join?: boolean;
    delete?: boolean;
};
type SpaceTokenPermissions = ChannelTokenPermissions;
export type ChannelGroupTokenPermissions = {
    read?: boolean;
    manage?: boolean;
};
export type UuidTokenPermissions = {
    get?: boolean;
    update?: boolean;
    delete?: boolean;
};
type UserTokenPermissions = UuidTokenPermissions;
export type ObjectsGrantTokenParameters = {
    ttl: number;
    resources?: {
        spaces?: Record<string, SpaceTokenPermissions>;
        users?: Record<string, UserTokenPermissions>;
    };
    patterns?: {
        spaces?: Record<string, SpaceTokenPermissions>;
        users?: Record<string, UserTokenPermissions>;
    };
    meta?: Metadata;
    authorizedUserId?: string;
};
export type GrantTokenParameters = {
    ttl: number;
    resources?: {
        uuids?: Record<string, UuidTokenPermissions>;
        channels?: Record<string, ChannelTokenPermissions>;
        groups?: Record<string, ChannelGroupTokenPermissions>;
    };
    patterns?: {
        uuids?: Record<string, UuidTokenPermissions>;
        channels?: Record<string, ChannelTokenPermissions>;
        groups?: Record<string, ChannelGroupTokenPermissions>;
    };
    meta?: Metadata;
    authorized_uuid?: string;
};
export type GrantTokenResponse = string;
export type RevokeParameters = {
    token: string;
};
export type RevokeTokenResponse = Record<string, unknown>;
type ChannelPermissions = {
    r?: 0 | 1;
    w?: 0 | 1;
    d?: 0 | 1;
    g?: 0 | 1;
    u?: 0 | 1;
    m?: 0 | 1;
    j?: 0 | 1;
    ttl?: number;
};
type ChannelGroupPermissions = {
    r?: 0 | 1;
    m?: 0 | 1;
    ttl?: number;
};
type UserPermissions = {
    g?: 0 | 1;
    u?: 0 | 1;
    d?: 0 | 1;
    ttl?: number;
};
type BaseAuditResponse<Level extends 'channel' | 'channel+auth' | 'channel-group' | 'channel-group+auth' | 'user' | 'subkey'> = {
    level: Level;
    subscribe_key: string;
    ttl?: number;
};
type AuthKeysPermissions<LevelPermissions> = {
    auths: Record<string, LevelPermissions>;
};
type ChannelPermissionsResponse = BaseAuditResponse<'channel+auth'> & {
    channel: string;
} & AuthKeysPermissions<ChannelPermissions>;
type ChannelsPermissionsResponse = BaseAuditResponse<'channel'> & {
    channels: Record<string, ChannelPermissions & AuthKeysPermissions<ChannelPermissions>>;
};
type ChannelGroupPermissionsResponse = BaseAuditResponse<'channel-group+auth'> & {
    'channel-group': string;
} & AuthKeysPermissions<ChannelGroupPermissions>;
type ChannelGroupsPermissionsResponse = BaseAuditResponse<'channel'> & {
    'channel-groups': Record<string, ChannelGroupPermissions & AuthKeysPermissions<ChannelGroupPermissions>>;
};
type UserPermissionsResponse = BaseAuditResponse<'user'> & {
    channel: string;
} & AuthKeysPermissions<UserPermissions>;
type SubKeyPermissionsResponse = BaseAuditResponse<'subkey'> & {
    channels: Record<string, ChannelPermissions & AuthKeysPermissions<ChannelPermissions>>;
    'channel-groups': Record<string, ChannelGroupPermissions & AuthKeysPermissions<ChannelGroupPermissions>>;
    objects: Record<string, UserPermissions & AuthKeysPermissions<UserPermissions>>;
};
export type PermissionsResponse = ChannelPermissionsResponse | ChannelsPermissionsResponse | ChannelGroupPermissionsResponse | ChannelGroupsPermissionsResponse | UserPermissionsResponse | SubKeyPermissionsResponse;
export type AuditParameters = {
    channel?: string;
    channelGroup?: string;
    authKeys?: string[];
};
export type GrantParameters = {
    channels?: string[];
    channelGroups?: string[];
    uuids?: string[];
    authKeys?: string[];
    read?: boolean;
    write?: boolean;
    delete?: boolean;
    get?: boolean;
    update?: boolean;
    manage?: boolean;
    join?: boolean;
    ttl?: number;
};
export {};
