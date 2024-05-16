/**
 * Partial nullability helper type.
 */
type PartialNullable<T> = {
    [P in keyof T]?: T[P] | null;
};
/**
 * Custom data which should be associated with metadata objects or their relation.
 */
export type CustomData = {
    [key: string]: string | number | boolean | null;
};
/**
 * Type provides shape of App Context parameters which is common to the all objects types to
 * be updated.
 */
type ObjectParameters<Custom extends CustomData> = {
    custom?: Custom;
};
/**
 * Type provides shape of App Context object which is common to the all objects types received
 * from the PubNub service.
 */
export type ObjectData<Custom extends CustomData> = {
    /**
     * Unique App Context object identifier.
     *
     * **Important:** For channel it is different from the channel metadata object name.
     */
    id: string;
    /**
     * Last date and time when App Context object has been updated.
     *
     * String built from date using ISO 8601.
     */
    updated: string;
    /**
     * App Context version hash.
     */
    eTag: string;
    /**
     * Additional data associated with App Context object.
     *
     * **Important:** Values must be scalars; only arrays or objects are supported.
     * {@link /docs/sdks/javascript/api-reference/objects#app-context-filtering-language-definition|App Context
     * filtering language} doesn’t support filtering by custom properties.
     */
    custom?: Custom | null;
};
/**
 * Type provides shape of object which let establish relation between metadata objects.
 */
type ObjectsRelation<Custom extends CustomData> = {
    /**
     * App Context object unique identifier.
     */
    id: string;
    /**
     * App Context objects relation status.
     */
    status?: string;
    /**
     * Additional data associated with App Context object relation (membership or members).
     *
     * **Important:** Values must be scalars; only arrays or objects are supported.
     * {@link /docs/sdks/javascript/api-reference/objects#app-context-filtering-language-definition|App Context
     * filtering language} doesn’t support filtering by custom properties.
     */
    custom?: Custom;
};
/**
 * Response page cursor.
 */
type Page = {
    /**
     * Random string returned from the server, indicating a specific position in a data set.
     *
     * Used for forward pagination, it fetches the next page, allowing you to continue from where
     * you left off.
     */
    next?: string;
    /**
     * Random string returned from the server, indicating a specific position in a data set.
     *
     * Used for backward pagination, it fetches the previous page, enabling access to earlier
     * data.
     *
     * **Important:** Ignored if the `next` parameter is supplied.
     */
    prev?: string;
};
/**
 * Metadata objects include options.
 *
 * Allows to configure what additional information should be included into service response.
 */
type IncludeOptions = {
    /**
     * Whether to include total number of App Context objects in the response.
     *
     * @default `false`
     */
    totalCount?: boolean;
    /**
     * Whether to include App Context object `custom` field in the response.
     *
     * @default `false`
     */
    customFields?: boolean;
};
/**
 * Membership objects include options.
 *
 * Allows to configure what additional information should be included into service response.
 */
type MembershipsIncludeOptions = IncludeOptions & {
    /**
     * Whether to include all {@link ChannelMetadata} fields in the response.
     *
     * @default `false`
     */
    channelFields?: boolean;
    /**
     * Whether to include {@link ChannelMetadata} `custom` field in the response.
     *
     * @default `false`
     */
    customChannelFields?: boolean;
    /**
     * Whether to include the membership's status field in the response.
     *
     * @default `false`
     */
    statusField?: boolean;
    /**
     * Whether to include the channel's status field in the response.
     *
     * @default `false`
     */
    channelStatusField?: boolean;
    /**
     * Whether to include channel's type fields in the response.
     *
     * @default `false`
     */
    channelTypeField?: boolean;
};
/**
 * Members objects include options.
 *
 * Allows to configure what additional information should be included into service response.
 */
type MembersIncludeOptions = IncludeOptions & {
    /**
     * Whether to include all {@link UUIMetadata} fields in the response.
     *
     * @default `false`
     */
    UUIDFields?: boolean;
    /**
     * Whether to include {@link UUIMetadata} `custom` field in the response.
     *
     * @default `false`
     */
    customUUIDFields?: boolean;
    /**
     * Whether to include the members's status field in the response.
     *
     * @default `false`
     */
    statusField?: boolean;
    /**
     * Whether to include the user's status field in the response.
     *
     * @default `false`
     */
    UUIDStatusField?: boolean;
    /**
     * Whether to include user's type fields in the response.
     *
     * @default `false`
     */
    UUIDTypeField?: boolean;
};
/**
 * Type provides shape of App Context parameters which is common to the all objects types to
 * fetch them by pages.
 */
type PagedRequestParameters<Include, Sort> = {
    /**
     * Fields which can be additionally included into response.
     */
    include?: Include;
    /**
     * Expression used to filter the results.
     *
     * Only objects whose properties satisfy the given expression are returned. The filter language is
     * {@link /docs/sdks/javascript/api-reference/objects#app-context-filtering-language-definition|defined here}.
     */
    filter?: string;
    /**
     * Fetched App Context objects sorting options.
     */
    sort?: Sort;
    /**
     * Number of objects to return in response.
     *
     * **Important:** Maximum for this API is `100` objects per-response.
     *
     * @default `100`
     */
    limit?: number;
    /**
     * Response pagination configuration.
     */
    page?: Page;
};
/**
 * Type provides shape of App Context object fetch response which is common to the all objects
 * types received from the PubNub service.
 */
type ObjectResponse<ObjectType> = {
    /**
     * App Context objects list fetch result status code.
     */
    status: number;
    /**
     * Received App Context object information.
     */
    data: ObjectType;
};
/**
 * Type provides shape of App Context objects fetch response which is common to the all
 * objects types received from the PubNub service.
 */
type PagedResponse<ObjectType> = ObjectResponse<ObjectType[]> & {
    /**
     * Total number of App Context objects in the response.
     */
    totalCount?: number;
    /**
     * Random string returned from the server, indicating a specific position in a data set.
     *
     * Used for forward pagination, it fetches the next page, allowing you to continue from where
     * you left off.
     */
    next?: string;
    /**
     * Random string returned from the server, indicating a specific position in a data set.
     *
     * Used for backward pagination, it fetches the previous page, enabling access to earlier
     * data.
     *
     * **Important:** Ignored if the `next` parameter is supplied.
     */
    prev?: string;
};
/**
 * Key-value pair of a property to sort by, and a sort direction.
 */
type MetadataSortingOptions<T> = keyof Omit<T, 'id' | 'custom' | 'eTag'> | ({
    [K in keyof Omit<T, 'id' | 'custom' | 'eTag'>]?: 'asc' | 'desc' | null;
} & {
    [key: `custom.${string}`]: 'asc' | 'desc' | null;
});
/**
 * Key-value pair of a property to sort by, and a sort direction.
 */
type MembershipsSortingOptions = 'channel.id' | 'channel.name' | 'channel.description' | 'channel.updated' | 'space.id' | 'space.name' | 'space.description' | 'space.updated' | 'updated' | {
    /**
     * Sort results by channel's `id` in ascending (`asc`) or descending (`desc`) order.
     *
     * Specify `null` for default sorting direction (ascending).
     */
    'channel.id'?: 'asc' | 'desc' | null;
    /**
     * Sort results by channel's `name` in ascending (`asc`) or descending (`desc`) order.
     *
     * Specify `null` for default sorting direction (ascending).
     */
    'channel.name'?: 'asc' | 'desc' | null;
    /**
     * Sort results by channel's `description` in ascending (`asc`) or descending (`desc`) order.
     *
     * Specify `null` for default sorting direction (ascending).
     */
    'channel.description'?: 'asc' | 'desc' | null;
    /**
     * Sort results by channel's `update` in ascending (`asc`) or descending (`desc`) order.
     *
     * Specify `null` for default sorting direction (ascending).
     */
    'channel.updated'?: 'asc' | 'desc' | null;
    /**
     * Sort results by channel's `id` in ascending (`asc`) or descending (`desc`) order.
     *
     * Specify `null` for default sorting direction (ascending).
     *
     * @deprecated Use `channel.id` instead.
     */
    'space.id'?: 'asc' | 'desc' | null;
    /**
     * Sort results by channel's `name` in ascending (`asc`) or descending (`desc`) order.
     *
     * Specify `null` for default sorting direction (ascending).
     *
     * @deprecated Use `channel.name` instead.
     */
    'space.name'?: 'asc' | 'desc' | null;
    /**
     * Sort results by channel's `description` in ascending (`asc`) or descending (`desc`) order.
     *
     * Specify `null` for default sorting direction (ascending).
     *
     * @deprecated Use `channel.name` instead.
     */
    'space.description'?: 'asc' | 'desc' | null;
    /**
     * Sort results by channel's `update` in ascending (`asc`) or descending (`desc`) order.
     *
     * Specify `null` for default sorting direction (ascending).
     *
     * @deprecated Use `channel.updated` instead.
     */
    'space.updated'?: 'asc' | 'desc' | null;
    /**
     * Sort results by `updated` in ascending (`asc`) or descending (`desc`) order.
     *
     * Specify `null` for default sorting direction (ascending).
     */
    updated?: 'asc' | 'desc' | null;
};
/**
 * Key-value pair of a property to sort by, and a sort direction.
 */
type MembersSortingOptions = 'uuid.id' | 'uuid.name' | 'uuid.updated' | 'user.id' | 'user.name' | 'user.updated' | 'updated' | {
    /**
     * Sort results by user's `id` in ascending (`asc`) or descending (`desc`) order.
     *
     * Specify `null` for default sorting direction (ascending).
     */
    'uuid.id'?: 'asc' | 'desc' | null;
    /**
     * Sort results by user's `name` in ascending (`asc`) or descending (`desc`) order.
     *
     * Specify `null` for default sorting direction (ascending).
     */
    'uuid.name'?: 'asc' | 'desc' | null;
    /**
     * Sort results by user's `update` in ascending (`asc`) or descending (`desc`) order.
     *
     * Specify `null` for default sorting direction (ascending).
     */
    'uuid.updated'?: 'asc' | 'desc' | null;
    /**
     * Sort results by user's `id` in ascending (`asc`) or descending (`desc`) order.
     *
     * Specify `null` for default sorting direction (ascending).
     *
     * @deprecated Use `uuid.id` instead.
     */
    'user.id'?: 'asc' | 'desc' | null;
    /**
     * Sort results by user's `name` in ascending (`asc`) or descending (`desc`) order.
     *
     * Specify `null` for default sorting direction (ascending).
     *
     * @deprecated Use `uuid.name` instead.
     */
    'user.name'?: 'asc' | 'desc' | null;
    /**
     * Sort results by user's `update` in ascending (`asc`) or descending (`desc`) order.
     *
     * Specify `null` for default sorting direction (ascending).
     *
     * @deprecated Use `uuid.updated` instead.
     */
    'user.updated'?: 'asc' | 'desc' | null;
    /**
     * Sort results by `updated` in ascending (`asc`) or descending (`desc`) order.
     *
     * Specify `null` for default sorting direction (ascending).
     */
    updated?: 'asc' | 'desc' | null;
};
/**
 * Fetch All UUID or Channel Metadata request parameters.
 */
export type GetAllMetadataParameters<AppContextObject> = PagedRequestParameters<IncludeOptions, MetadataSortingOptions<AppContextObject>>;
/**
 * Type which describes own UUID metadata object fields.
 */
type UUIDMetadataFields = {
    /**
     * Display name for the user.
     */
    name?: string;
    /**
     * The user's email address.
     */
    email?: string;
    /**
     * User's identifier in an external system.
     */
    externalId?: string;
    /**
     * The URL of the user's profile picture.
     */
    profileUrl?: string;
    /**
     * User's object type information.
     */
    type?: string;
    /**
     * User's object status.
     */
    status?: string;
};
/**
 * Updated UUID metadata object.
 *
 * Type represents updated UUID metadata object which will be pushed to the PubNub service.
 */
type UUIDMetadata<Custom extends CustomData> = ObjectParameters<Custom> & Partial<UUIDMetadataFields>;
/**
 * Received UUID metadata object.
 *
 * Type represents UUID metadata retrieved from the PubNub service.
 */
export type UUIDMetadataObject<Custom extends CustomData> = ObjectData<Custom> & PartialNullable<UUIDMetadataFields>;
/**
 * Response with fetched page of UUID metadata objects.
 */
export type GetAllUUIDMetadataResponse<Custom extends CustomData> = PagedResponse<UUIDMetadataObject<Custom>>;
/**
 * Fetch UUID Metadata request parameters.
 */
export type GetUUIDMetadataParameters = {
    /**
     * Unique user identifier.
     *
     * **Important:** If not supplied then current user's uuid is used.
     *
     * @default Current `uuid`.
     */
    uuid?: string;
    /**
     * Unique user identifier.
     *
     * **Important:** If not supplied then current user's uuid is used.
     *
     * @default Current `userId`.
     *
     * @deprecated Use `getUUIDMetadata()` method instead.
     */
    userId?: string;
    /**
     * Fields which can be additionally included into response.
     */
    include?: Omit<IncludeOptions, 'totalCount'>;
};
/**
 * Response with requested UUID metadata object.
 */
export type GetUUIDMetadataResponse<Custom extends CustomData> = ObjectResponse<UUIDMetadataObject<Custom>>;
/**
 * Update UUID Metadata request parameters.
 */
export type SetUUIDMetadataParameters<Custom extends CustomData> = {
    /**
     * Unique user identifier.
     *
     * **Important:** If not supplied then current user's uuid is used.
     *
     * @default Current `uuid`.
     */
    uuid?: string;
    /**
     * Unique user identifier.
     *
     * **Important:** If not supplied then current user's uuid is used.
     *
     * @default Current `userId`.
     *
     * @deprecated Use `setUUIDMetadata()` method instead.
     */
    userId?: string;
    /**
     * Metadata, which should be associated with UUID.
     */
    data: UUIDMetadata<Custom>;
    /**
     * Fields which can be additionally included into response.
     */
    include?: Omit<IncludeOptions, 'totalCount'>;
};
/**
 * Response with result of the UUID metadata object update.
 */
export type SetUUIDMetadataResponse<Custom extends CustomData> = ObjectResponse<UUIDMetadataObject<Custom>>;
/**
 * Remove UUID Metadata request parameters.
 */
export type RemoveUUIDMetadataParameters = {
    /**
     * Unique user identifier.
     *
     * **Important:** If not supplied then current user's uuid is used.
     *
     * @default Current `uuid`.
     */
    uuid?: string;
    /**
     * Unique user identifier.
     *
     * **Important:** If not supplied then current user's uuid is used.
     *
     * @default Current `userId`.
     *
     * @deprecated Use `removeUUIDMetadata()` method instead.
     */
    userId?: string;
};
/**
 * Response with result of the UUID metadata removal.
 */
export type RemoveUUIDMetadataResponse = ObjectResponse<Record<string, unknown>>;
/**
 * Type which describes own Channel metadata object fields.
 */
type ChannelMetadataFields = {
    /**
     * Name of a channel.
     */
    name?: string;
    /**
     * Description of a channel.
     */
    description?: string;
    /**
     * Channel's object type information.
     */
    type?: string;
    /**
     * Channel's object status.
     */
    status?: string;
};
/**
 * Updated channel metadata object.
 *
 * Type represents updated channel metadata object which will be pushed to the PubNub service.
 */
type ChannelMetadata<Custom extends CustomData> = ObjectParameters<Custom> & Partial<ChannelMetadataFields>;
/**
 * Received channel metadata object.
 *
 * Type represents chanel metadata retrieved from the PubNub service.
 */
export type ChannelMetadataObject<Custom extends CustomData> = ObjectData<Custom> & PartialNullable<ChannelMetadataFields>;
/**
 * Response with fetched page of channel metadata objects.
 */
export type GetAllChannelMetadataResponse<Custom extends CustomData> = PagedResponse<ChannelMetadataObject<Custom>>;
/**
 * Fetch Channel Metadata request parameters.
 */
export type GetChannelMetadataParameters = {
    /**
     * Channel name.
     */
    channel: string;
    /**
     * Space identifier.
     *
     * @deprecated Use `getChannelMetadata()` method instead.
     */
    spaceId?: string;
    /**
     * Fields which can be additionally included into response.
     */
    include?: Omit<IncludeOptions, 'totalCount'>;
};
/**
 * Response with requested channel metadata object.
 */
export type GetChannelMetadataResponse<Custom extends CustomData> = ObjectResponse<ChannelMetadataObject<Custom>>;
/**
 * Update Channel Metadata request parameters.
 */
export type SetChannelMetadataParameters<Custom extends CustomData> = {
    /**
     * Channel name.
     */
    channel: string;
    /**
     * Space identifier.
     *
     * @deprecated Use `setChannelMetadata()` method instead.
     */
    spaceId?: string;
    /**
     * Metadata, which should be associated with UUID.
     */
    data: ChannelMetadata<Custom>;
    /**
     * Fields which can be additionally included into response.
     */
    include?: Omit<IncludeOptions, 'totalCount'>;
};
/**
 * Response with result of the channel metadata object update.
 */
export type SetChannelMetadataResponse<Custom extends CustomData> = ObjectResponse<ChannelMetadataObject<Custom>>;
/**
 * Remove Channel Metadata request parameters.
 */
export type RemoveChannelMetadataParameters = {
    /**
     * Channel name.
     */
    channel: string;
    /**
     * Space identifier.
     *
     * @deprecated Use `removeChannelMetadata()` method instead.
     */
    spaceId?: string;
};
/**
 * Response with result of the channel metadata removal.
 */
export type RemoveChannelMetadataResponse = ObjectResponse<Record<string, unknown>>;
/**
 * Related channel metadata object.
 *
 * Type represents chanel metadata which has been used to create membership relation with UUID.
 */
type MembershipsObject<MembershipCustom extends CustomData, ChannelCustom extends CustomData> = Omit<ObjectData<MembershipCustom>, 'id'> & {
    channel: ChannelMetadataObject<ChannelCustom> | {
        id: string;
    };
};
/**
 * Response with fetched page of UUID membership objects.
 */
type MembershipsResponse<MembershipCustom extends CustomData, ChannelCustom extends CustomData> = PagedResponse<MembershipsObject<MembershipCustom, ChannelCustom>>;
/**
 * Fetch Memberships request parameters.
 */
export type GetMembershipsParameters = PagedRequestParameters<MembershipsIncludeOptions, MembershipsSortingOptions> & {
    /**
     * Unique user identifier.
     *
     * **Important:** If not supplied then current user's uuid is used.
     *
     * @default Current `uuid`.
     */
    uuid?: string;
    /**
     * Unique user identifier.
     *
     * **Important:** If not supplied then current user's uuid is used.
     *
     * @default Current `uuidId`.
     *
     * @deprecated Use `uuid` field instead.
     */
    userId?: string;
};
/**
 * Response with requested channel memberships information.
 */
export type GetMembershipsResponse<MembershipCustom extends CustomData, ChannelCustom extends CustomData> = MembershipsResponse<MembershipCustom, ChannelCustom>;
/**
 * Update Memberships request parameters.
 */
export type SetMembershipsParameters<Custom extends CustomData> = PagedRequestParameters<Omit<MembershipsIncludeOptions, 'statusField' | 'channelStatusField' | 'channelTypeField'>, MembershipsSortingOptions> & {
    /**
     * Unique user identifier.
     *
     * **Important:** If not supplied then current user's uuid is used.
     *
     * @default Current `uuid`.
     */
    uuid?: string;
    /**
     * Unique user identifier.
     *
     * **Important:** If not supplied then current user's uuid is used.
     *
     * @default Current `userId`.
     *
     * @deprecated Use `uuid` field instead.
     */
    userId?: string;
    /**
     * List of channels with which UUID membership should be established.
     */
    channels: Array<string | ObjectsRelation<Custom>>;
    /**
     * List of channels with which UUID membership should be established.
     *
     * @deprecated Use `channels` field instead.
     */
    spaces?: Array<string | (Omit<ObjectsRelation<Custom>, 'id'> & {
        /**
         * Unique Space object identifier.
         */
        spaceId: string;
    })>;
};
/**
 * Response with requested channel memberships information change.
 */
export type SetMembershipsResponse<MembershipCustom extends CustomData, ChannelCustom extends CustomData> = MembershipsResponse<MembershipCustom, ChannelCustom>;
/**
 * Remove Memberships request parameters.
 */
export type RemoveMembershipsParameters = PagedRequestParameters<MembershipsIncludeOptions, MembershipsSortingOptions> & {
    /**
     * Unique user identifier.
     *
     * **Important:** If not supplied then current user's uuid is used.
     *
     * @default Current `uuid`.
     */
    uuid?: string;
    /**
     * Unique user identifier.
     *
     * **Important:** If not supplied then current user's uuid is used.
     *
     * @default Current `userId`.
     *
     * @deprecated Use {@link uuid} field instead.
     */
    userId?: string;
    /**
     * List of channels for which membership which UUID should be removed.
     */
    channels: string[];
    /**
     * List of space names for which membership which UUID should be removed.
     *
     * @deprecated Use {@link channels} field instead.
     */
    spaceIds?: string[];
};
/**
 * Response with remaining memberships.
 */
export type RemoveMembershipsResponse<MembershipCustom extends CustomData, ChannelCustom extends CustomData> = MembershipsResponse<MembershipCustom, ChannelCustom>;
/**
 * Related UUID metadata object.
 *
 * Type represents UUID metadata which has been used to when added members to the channel.
 */
type MembersObject<MemberCustom extends CustomData, UUIDCustom extends CustomData> = Omit<ObjectData<MemberCustom>, 'id'> & {
    uuid: UUIDMetadataObject<UUIDCustom> | {
        id: string;
    };
};
/**
 * Response with fetched page of channel member objects.
 */
type MembersResponse<MemberCustom extends CustomData, UUIDCustom extends CustomData> = PagedResponse<MembersObject<MemberCustom, UUIDCustom>>;
/**
 * Fetch Members request parameters.
 */
export type GetMembersParameters = PagedRequestParameters<MembersIncludeOptions, MembersSortingOptions> & {
    /**
     * Channel name.
     */
    channel: string;
    /**
     * Space identifier.
     *
     * @deprecated Use `channel` field instead.
     */
    spaceId?: string;
};
/**
 * Response with requested channel memberships information.
 */
export type GetMembersResponse<MembersCustom extends CustomData, UUIDCustom extends CustomData> = MembersResponse<MembersCustom, UUIDCustom>;
/**
 * Update Members request parameters.
 */
export type SetChannelMembersParameters<Custom extends CustomData> = PagedRequestParameters<Omit<MembersIncludeOptions, 'statusField' | 'UUIDStatusField' | 'UUIDTypeField'>, MembersSortingOptions> & {
    /**
     * Channel name.
     */
    channel: string;
    /**
     * Space identifier.
     *
     * @deprecated Use `channel` field instead.
     */
    spaceId?: string;
    /**
     * List of UUIDs which should be added as `channel` members.
     */
    uuids: Array<string | ObjectsRelation<Custom>>;
    /**
     * List of UUIDs which should be added as `channel` members.
     *
     * @deprecated Use `uuids` field instead.
     */
    users?: Array<string | (Omit<ObjectsRelation<Custom>, 'id'> & {
        /**
         * Unique User object identifier.
         */
        userId: string;
    })>;
};
/**
 * Response with requested channel members information change.
 */
export type SetMembersResponse<MemberCustom extends CustomData, UUIDCustom extends CustomData> = MembersResponse<MemberCustom, UUIDCustom>;
/**
 * Remove Members request parameters.
 */
export type RemoveMembersParameters = PagedRequestParameters<MembersIncludeOptions, MembersSortingOptions> & {
    /**
     * Channel name.
     */
    channel: string;
    /**
     * Space identifier.
     *
     * @deprecated Use {@link channel} field instead.
     */
    spaceId?: string;
    /**
     * List of UUIDs which should be removed from the `channel` members list.
     * removed.
     */
    uuids: string[];
    /**
     * List of user identifiers which should be removed from the `channel` members list.
     * removed.
     *
     * @deprecated Use {@link uuids} field instead.
     */
    userIds?: string[];
};
/**
 * Response with remaining members.
 */
export type RemoveMembersResponse<MemberCustom extends CustomData, UUIDCustom extends CustomData> = MembersResponse<MemberCustom, UUIDCustom>;
/**
 * Related User metadata object.
 *
 * Type represents User metadata which has been used to when added members to the Space.
 */
type UserMembersObject<MemberCustom extends CustomData, UUIDCustom extends CustomData> = Omit<ObjectData<MemberCustom>, 'id'> & {
    user: UUIDMetadataObject<UUIDCustom> | {
        id: string;
    };
};
/**
 * Response with fetched page of Space member objects.
 */
export type UserMembersResponse<MemberCustom extends CustomData, UUIDCustom extends CustomData> = PagedResponse<UserMembersObject<MemberCustom, UUIDCustom>>;
type SpaceMembershipObject<MembershipCustom extends CustomData, ChannelCustom extends CustomData> = Omit<ObjectData<MembershipCustom>, 'id'> & {
    space: ChannelMetadataObject<ChannelCustom> | {
        id: string;
    };
};
/**
 * Response with fetched page of User membership objects.
 */
export type SpaceMembershipsResponse<MembershipCustom extends CustomData, ChannelCustom extends CustomData> = PagedResponse<SpaceMembershipObject<MembershipCustom, ChannelCustom>>;
export {};
