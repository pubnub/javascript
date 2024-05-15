type PartialNullable<T> = {
    [P in keyof T]?: T[P] | null;
};
export type CustomData = {
    [key: string]: string | number | boolean | null;
};
type ObjectParameters<Custom extends CustomData> = {
    custom?: Custom;
};
export type ObjectData<Custom extends CustomData> = {
    id: string;
    updated: string;
    eTag: string;
    custom?: Custom | null;
};
type ObjectsRelation<Custom extends CustomData> = {
    id: string;
    status?: string;
    custom?: Custom;
};
type Page = {
    next?: string;
    prev?: string;
};
type IncludeOptions = {
    totalCount?: boolean;
    customFields?: boolean;
};
type MembershipsIncludeOptions = IncludeOptions & {
    channelFields?: boolean;
    customChannelFields?: boolean;
    statusField?: boolean;
    channelStatusField?: boolean;
    channelTypeField?: boolean;
};
type MembersIncludeOptions = IncludeOptions & {
    UUIDFields?: boolean;
    customUUIDFields?: boolean;
    statusField?: boolean;
    UUIDStatusField?: boolean;
    UUIDTypeField?: boolean;
};
type PagedRequestParameters<Include, Sort> = {
    include?: Include;
    filter?: string;
    sort?: Sort;
    limit?: number;
    page?: Page;
};
type ObjectResponse<ObjectType> = {
    status: number;
    data: ObjectType;
};
type PagedResponse<ObjectType> = ObjectResponse<ObjectType[]> & {
    totalCount?: number;
    next?: string;
    prev?: string;
};
type MetadataSortingOptions<T> = keyof Omit<T, 'id' | 'custom' | 'eTag'> | ({
    [K in keyof Omit<T, 'id' | 'custom' | 'eTag'>]?: 'asc' | 'desc' | null;
} & {
    [key: `custom.${string}`]: 'asc' | 'desc' | null;
});
type MembershipsSortingOptions = 'channel.id' | 'channel.name' | 'channel.description' | 'channel.updated' | 'space.id' | 'space.name' | 'space.description' | 'space.updated' | 'updated' | {
    'channel.id'?: 'asc' | 'desc' | null;
    'channel.name'?: 'asc' | 'desc' | null;
    'channel.description'?: 'asc' | 'desc' | null;
    'channel.updated'?: 'asc' | 'desc' | null;
    'space.id'?: 'asc' | 'desc' | null;
    'space.name'?: 'asc' | 'desc' | null;
    'space.description'?: 'asc' | 'desc' | null;
    'space.updated'?: 'asc' | 'desc' | null;
    updated?: 'asc' | 'desc' | null;
};
type MembersSortingOptions = 'uuid.id' | 'uuid.name' | 'uuid.updated' | 'user.id' | 'user.name' | 'user.updated' | 'updated' | {
    'uuid.id'?: 'asc' | 'desc' | null;
    'uuid.name'?: 'asc' | 'desc' | null;
    'uuid.updated'?: 'asc' | 'desc' | null;
    'user.id'?: 'asc' | 'desc' | null;
    'user.name'?: 'asc' | 'desc' | null;
    'user.updated'?: 'asc' | 'desc' | null;
    updated?: 'asc' | 'desc' | null;
};
export type GetAllMetadataParameters<AppContextObject> = PagedRequestParameters<IncludeOptions, MetadataSortingOptions<AppContextObject>>;
type UUIDMetadataFields = {
    name?: string;
    email?: string;
    externalId?: string;
    profileUrl?: string;
    type?: string;
    status?: string;
};
type UUIDMetadata<Custom extends CustomData> = ObjectParameters<Custom> & Partial<UUIDMetadataFields>;
export type UUIDMetadataObject<Custom extends CustomData> = ObjectData<Custom> & PartialNullable<UUIDMetadataFields>;
export type GetAllUUIDMetadataResponse<Custom extends CustomData> = PagedResponse<UUIDMetadataObject<Custom>>;
export type GetUUIDMetadataParameters = {
    uuid?: string;
    userId?: string;
    include?: Omit<IncludeOptions, 'totalCount'>;
};
export type GetUUIDMetadataResponse<Custom extends CustomData> = ObjectResponse<UUIDMetadataObject<Custom>>;
export type SetUUIDMetadataParameters<Custom extends CustomData> = {
    uuid?: string;
    userId?: string;
    data: UUIDMetadata<Custom>;
    include?: Omit<IncludeOptions, 'totalCount'>;
};
export type SetUUIDMetadataResponse<Custom extends CustomData> = ObjectResponse<UUIDMetadataObject<Custom>>;
export type RemoveUUIDMetadataParameters = {
    uuid?: string;
    userId?: string;
};
export type RemoveUUIDMetadataResponse = ObjectResponse<Record<string, unknown>>;
type ChannelMetadataFields = {
    name?: string;
    description?: string;
    type?: string;
    status?: string;
};
type ChannelMetadata<Custom extends CustomData> = ObjectParameters<Custom> & Partial<ChannelMetadataFields>;
export type ChannelMetadataObject<Custom extends CustomData> = ObjectData<Custom> & PartialNullable<ChannelMetadataFields>;
export type GetAllChannelMetadataResponse<Custom extends CustomData> = PagedResponse<ChannelMetadataObject<Custom>>;
export type GetChannelMetadataParameters = {
    channel: string;
    spaceId?: string;
    include?: Omit<IncludeOptions, 'totalCount'>;
};
export type GetChannelMetadataResponse<Custom extends CustomData> = ObjectResponse<ChannelMetadataObject<Custom>>;
export type SetChannelMetadataParameters<Custom extends CustomData> = {
    channel: string;
    spaceId?: string;
    data: ChannelMetadata<Custom>;
    include?: Omit<IncludeOptions, 'totalCount'>;
};
export type SetChannelMetadataResponse<Custom extends CustomData> = ObjectResponse<ChannelMetadataObject<Custom>>;
export type RemoveChannelMetadataParameters = {
    channel: string;
    spaceId?: string;
};
export type RemoveChannelMetadataResponse = ObjectResponse<Record<string, unknown>>;
type MembershipsObject<MembershipCustom extends CustomData, ChannelCustom extends CustomData> = Omit<ObjectData<MembershipCustom>, 'id'> & {
    channel: ChannelMetadataObject<ChannelCustom> | {
        id: string;
    };
};
type MembershipsResponse<MembershipCustom extends CustomData, ChannelCustom extends CustomData> = PagedResponse<MembershipsObject<MembershipCustom, ChannelCustom>>;
export type GetMembershipsParameters = PagedRequestParameters<MembershipsIncludeOptions, MembershipsSortingOptions> & {
    uuid?: string;
    userId?: string;
};
export type GetMembershipsResponse<MembershipCustom extends CustomData, ChannelCustom extends CustomData> = MembershipsResponse<MembershipCustom, ChannelCustom>;
export type SetMembershipsParameters<Custom extends CustomData> = PagedRequestParameters<Omit<MembershipsIncludeOptions, 'statusField' | 'channelStatusField' | 'channelTypeField'>, MembershipsSortingOptions> & {
    uuid?: string;
    userId?: string;
    channels: Array<string | ObjectsRelation<Custom>>;
    spaces?: Array<string | (Omit<ObjectsRelation<Custom>, 'id'> & {
        spaceId: string;
    })>;
};
export type SetMembershipsResponse<MembershipCustom extends CustomData, ChannelCustom extends CustomData> = MembershipsResponse<MembershipCustom, ChannelCustom>;
export type RemoveMembershipsParameters = PagedRequestParameters<MembershipsIncludeOptions, MembershipsSortingOptions> & {
    uuid?: string;
    userId?: string;
    channels: string[];
    spaceIds?: string[];
};
export type RemoveMembershipsResponse<MembershipCustom extends CustomData, ChannelCustom extends CustomData> = MembershipsResponse<MembershipCustom, ChannelCustom>;
type MembersObject<MemberCustom extends CustomData, UUIDCustom extends CustomData> = Omit<ObjectData<MemberCustom>, 'id'> & {
    uuid: UUIDMetadataObject<UUIDCustom> | {
        id: string;
    };
};
type MembersResponse<MemberCustom extends CustomData, UUIDCustom extends CustomData> = PagedResponse<MembersObject<MemberCustom, UUIDCustom>>;
export type GetMembersParameters = PagedRequestParameters<MembersIncludeOptions, MembersSortingOptions> & {
    channel: string;
    spaceId?: string;
};
export type GetMembersResponse<MembersCustom extends CustomData, UUIDCustom extends CustomData> = MembersResponse<MembersCustom, UUIDCustom>;
export type SetChannelMembersParameters<Custom extends CustomData> = PagedRequestParameters<Omit<MembersIncludeOptions, 'statusField' | 'UUIDStatusField' | 'UUIDTypeField'>, MembersSortingOptions> & {
    channel: string;
    spaceId?: string;
    uuids: Array<string | ObjectsRelation<Custom>>;
    users?: Array<string | (Omit<ObjectsRelation<Custom>, 'id'> & {
        userId: string;
    })>;
};
export type SetMembersResponse<MemberCustom extends CustomData, UUIDCustom extends CustomData> = MembersResponse<MemberCustom, UUIDCustom>;
export type RemoveMembersParameters = PagedRequestParameters<MembersIncludeOptions, MembersSortingOptions> & {
    channel: string;
    spaceId?: string;
    uuids: string[];
    userIds?: string[];
};
export type RemoveMembersResponse<MemberCustom extends CustomData, UUIDCustom extends CustomData> = MembersResponse<MemberCustom, UUIDCustom>;
type UserMembersObject<MemberCustom extends CustomData, UUIDCustom extends CustomData> = Omit<ObjectData<MemberCustom>, 'id'> & {
    user: UUIDMetadataObject<UUIDCustom> | {
        id: string;
    };
};
export type UserMembersResponse<MemberCustom extends CustomData, UUIDCustom extends CustomData> = PagedResponse<UserMembersObject<MemberCustom, UUIDCustom>>;
type SpaceMembershipObject<MembershipCustom extends CustomData, ChannelCustom extends CustomData> = Omit<ObjectData<MembershipCustom>, 'id'> & {
    space: ChannelMetadataObject<ChannelCustom> | {
        id: string;
    };
};
export type SpaceMembershipsResponse<MembershipCustom extends CustomData, ChannelCustom extends CustomData> = PagedResponse<SpaceMembershipObject<MembershipCustom, ChannelCustom>>;
export {};
