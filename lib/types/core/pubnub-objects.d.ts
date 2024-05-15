/**
 * PubNub Objects API module.
 */
import { ResultCallback, SendRequestFunction } from './types/api';
import { PrivateClientConfiguration } from './interfaces/configuration';
import * as AppContext from './types/api/app-context';
export default class PubNubObjects {
    private readonly configuration;
    private readonly sendRequest;
    /**
     * REST API endpoints access credentials.
     */
    private readonly keySet;
    constructor(configuration: PrivateClientConfiguration, sendRequest: SendRequestFunction<any>);
    /**
     * Fetch a paginated list of UUID Metadata objects.
     *
     * @param callback - Request completion handler callback.
     */
    getAllUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(callback: ResultCallback<AppContext.GetAllUUIDMetadataResponse<Custom>>): void;
    /**
     * Fetch a paginated list of UUID Metadata objects.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    getAllUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.GetAllMetadataParameters<AppContext.UUIDMetadataObject<Custom>>, callback: ResultCallback<AppContext.GetAllUUIDMetadataResponse<Custom>>): void;
    /**
     * Fetch a paginated list of UUID Metadata objects.
     *
     * @param [parameters] - Request configuration parameters.
     *
     * @returns Asynchronous get all UUID metadata response.
     */
    getAllUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters?: AppContext.GetAllMetadataParameters<AppContext.UUIDMetadataObject<Custom>>): Promise<AppContext.GetAllUUIDMetadataResponse<Custom>>;
    /**
     * Fetch a paginated list of UUID Metadata objects.
     *
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get all UUID metadata response or `void` in case if `callback` provided.
     */
    _getAllUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(parametersOrCallback?: AppContext.GetAllMetadataParameters<AppContext.UUIDMetadataObject<Custom>> | ResultCallback<AppContext.GetAllUUIDMetadataResponse<Custom>>, callback?: ResultCallback<AppContext.GetAllUUIDMetadataResponse<Custom>>): Promise<AppContext.GetAllUUIDMetadataResponse<Custom> | void>;
    /**
     * Fetch UUID Metadata object for currently configured PubNub client `uuid`.
     *
     * @param callback - Request completion handler callback.
     */
    getUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(callback: ResultCallback<AppContext.GetUUIDMetadataResponse<Custom>>): void;
    /**
     * Fetch a specific UUID Metadata object.
     *
     * @param parameters - Request configuration parameters. Will fetch UUID metadata object for
     * currently configured PubNub client `uuid` if not set.
     * @param callback - Request completion handler callback.
     */
    getUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.GetUUIDMetadataParameters, callback: ResultCallback<AppContext.GetUUIDMetadataResponse<Custom>>): void;
    /**
     * Fetch a specific UUID Metadata object.
     *
     * @param [parameters] - Request configuration parameters. Will fetch UUID Metadata object for
     * currently configured PubNub client `uuid` if not set.
     *
     * @returns Asynchronous get UUID metadata response.
     */
    getUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters?: AppContext.GetUUIDMetadataParameters): Promise<AppContext.GetUUIDMetadataResponse<Custom>>;
    /**
     * Fetch a specific UUID Metadata object.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get UUID metadata response or `void` in case if `callback` provided.
     */
    _getUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(parametersOrCallback?: AppContext.GetUUIDMetadataParameters | ResultCallback<AppContext.GetUUIDMetadataResponse<Custom>>, callback?: ResultCallback<AppContext.GetUUIDMetadataResponse<Custom>>): Promise<AppContext.GetUUIDMetadataResponse<Custom> | void>;
    /**
     * Update specific UUID Metadata object.
     *
     * @param parameters - Request configuration parameters. Will set UUID metadata for currently
     * configured PubNub client `uuid` if not set.
     * @param callback - Request completion handler callback.
     */
    setUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetUUIDMetadataParameters<Custom>, callback: ResultCallback<AppContext.SetUUIDMetadataResponse<Custom>>): void;
    /**
     * Update specific UUID Metadata object.
     *
     * @param parameters - Request configuration parameters. Will set UUID metadata for currently
     * configured PubNub client `uuid` if not set.
     *
     * @returns Asynchronous set UUID metadata response.
     */
    setUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetUUIDMetadataParameters<Custom>): Promise<AppContext.SetUUIDMetadataResponse<Custom>>;
    /**
     * Update specific UUID Metadata object.
     *
     * @param parameters - Request configuration parameters. Will set UUID metadata for currently
     * configured PubNub client `uuid` if not set.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous set UUID metadata response or `void` in case if `callback` provided.
     */
    _setUUIDMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetUUIDMetadataParameters<Custom>, callback?: ResultCallback<AppContext.SetUUIDMetadataResponse<Custom>>): Promise<AppContext.SetUUIDMetadataResponse<Custom> | void>;
    /**
     * Remove UUID Metadata object for currently configured PubNub client `uuid`.
     *
     * @param callback - Request completion handler callback.
     */
    removeUUIDMetadata(callback: ResultCallback<AppContext.RemoveUUIDMetadataResponse>): void;
    /**
     * Remove a specific UUID Metadata object.
     *
     * @param parameters - Request configuration parameters. Will remove UUID metadata for currently
     * configured PubNub client `uuid` if not set.
     * @param callback - Request completion handler callback.
     */
    removeUUIDMetadata(parameters: AppContext.RemoveUUIDMetadataParameters, callback: ResultCallback<AppContext.RemoveUUIDMetadataResponse>): void;
    /**
     * Remove a specific UUID Metadata object.
     *
     * @param [parameters] - Request configuration parameters. Will remove UUID metadata for currently
     * configured PubNub client `uuid` if not set.
     *
     * @returns Asynchronous UUID metadata remove response.
     */
    removeUUIDMetadata(parameters?: AppContext.RemoveUUIDMetadataParameters): Promise<AppContext.RemoveUUIDMetadataResponse>;
    /**
     * Remove a specific UUID Metadata object.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous UUID metadata remove response or `void` in case if `callback` provided.
     */
    _removeUUIDMetadata(parametersOrCallback?: AppContext.RemoveUUIDMetadataParameters | ResultCallback<AppContext.RemoveUUIDMetadataResponse>, callback?: ResultCallback<AppContext.RemoveUUIDMetadataResponse>): Promise<AppContext.RemoveUUIDMetadataResponse | void>;
    /**
     * Fetch a paginated list of Channel Metadata objects.
     *
     * @param callback - Request completion handler callback.
     */
    getAllChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(callback: ResultCallback<AppContext.GetAllChannelMetadataResponse<Custom>>): void;
    /**
     * Fetch a paginated list of Channel Metadata objects.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    getAllChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.GetAllMetadataParameters<AppContext.ChannelMetadataObject<Custom>>, callback: ResultCallback<AppContext.GetAllChannelMetadataResponse<Custom>>): void;
    /**
     * Fetch a paginated list of Channel Metadata objects.
     *
     * @param [parameters] - Request configuration parameters.
     *
     * @returns Asynchronous get all Channel metadata response.
     */
    getAllChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters?: AppContext.GetAllMetadataParameters<AppContext.ChannelMetadataObject<Custom>>): Promise<AppContext.GetAllChannelMetadataResponse<Custom>>;
    /**
     * Fetch a paginated list of Channel Metadata objects.
     *
     * @param [parametersOrCallback] - Request configuration parameters or callback from overload.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get all Channel metadata response or `void` in case if `callback`
     * provided.
     */
    _getAllChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(parametersOrCallback?: AppContext.GetAllMetadataParameters<AppContext.ChannelMetadataObject<Custom>> | ResultCallback<AppContext.GetAllChannelMetadataResponse<Custom>>, callback?: ResultCallback<AppContext.GetAllChannelMetadataResponse<Custom>>): Promise<AppContext.GetAllChannelMetadataResponse<Custom> | void>;
    /**
     * Fetch Channel Metadata object.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    getChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.GetChannelMetadataParameters, callback: ResultCallback<AppContext.GetChannelMetadataResponse<Custom>>): void;
    /**
     * Fetch a specific Channel Metadata object.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous get Channel metadata response.
     */
    getChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.GetChannelMetadataParameters): Promise<AppContext.GetChannelMetadataResponse<Custom>>;
    /**
     * Fetch Channel Metadata object.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get Channel metadata response or `void` in case if `callback` provided.
     */
    _getChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.GetChannelMetadataParameters, callback?: ResultCallback<AppContext.GetChannelMetadataResponse<Custom>>): Promise<AppContext.GetChannelMetadataResponse<Custom> | void>;
    /**
     * Update specific Channel Metadata object.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    setChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetChannelMetadataParameters<Custom>, callback: ResultCallback<AppContext.SetChannelMetadataResponse<Custom>>): void;
    /**
     * Update specific Channel Metadata object.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous set Channel metadata response.
     */
    setChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetChannelMetadataParameters<Custom>): Promise<AppContext.SetChannelMetadataResponse<Custom>>;
    /**
     * Update specific Channel Metadata object.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous set Channel metadata response or `void` in case if `callback` provided.
     */
    _setChannelMetadata<Custom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetChannelMetadataParameters<Custom>, callback?: ResultCallback<AppContext.SetChannelMetadataResponse<Custom>>): Promise<AppContext.SetChannelMetadataResponse<Custom> | void>;
    /**
     * Remove Channel Metadata object.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    removeChannelMetadata(parameters: AppContext.RemoveChannelMetadataParameters, callback: ResultCallback<AppContext.RemoveChannelMetadataResponse>): void;
    /**
     * Remove a specific Channel Metadata object.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous Channel metadata remove response.
     */
    removeChannelMetadata(parameters: AppContext.RemoveChannelMetadataParameters): Promise<AppContext.RemoveChannelMetadataResponse>;
    /**
     * Remove a specific Channel Metadata object.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous Channel metadata remove response or `void` in case if `callback`
     * provided.
     */
    _removeChannelMetadata(parameters: AppContext.RemoveChannelMetadataParameters, callback?: ResultCallback<AppContext.RemoveChannelMetadataResponse>): Promise<AppContext.RemoveChannelMetadataResponse | void>;
    /**
     * Fetch a paginated list of Channel Member objects.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    getChannelMembers<MemberCustom extends AppContext.CustomData = AppContext.CustomData, UUIDCustom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.GetMembersParameters, callback: ResultCallback<AppContext.GetMembersResponse<MemberCustom, UUIDCustom>>): void;
    /**
     * Fetch a paginated list of Channel Member objects.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous get Channel Members response.
     */
    getChannelMembers<MemberCustom extends AppContext.CustomData = AppContext.CustomData, UUIDCustom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.GetMembersParameters): Promise<AppContext.GetMembersResponse<MemberCustom, UUIDCustom>>;
    /**
     * Update specific Channel Members list.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    setChannelMembers<MemberCustom extends AppContext.CustomData = AppContext.CustomData, UUIDCustom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetChannelMembersParameters<MemberCustom>, callback: ResultCallback<AppContext.SetMembersResponse<MemberCustom, UUIDCustom>>): void;
    /**
     * Update specific Channel Members list.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous update Channel Members list response.
     */
    setChannelMembers<MemberCustom extends AppContext.CustomData = AppContext.CustomData, UUIDCustom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetChannelMembersParameters<MemberCustom>): Promise<AppContext.SetMembersResponse<MemberCustom, UUIDCustom>>;
    /**
     * Remove Members from the Channel.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    removeChannelMembers<MemberCustom extends AppContext.CustomData = AppContext.CustomData, UUIDCustom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.RemoveMembersParameters, callback: ResultCallback<AppContext.RemoveMembersResponse<MemberCustom, UUIDCustom>>): void;
    /**
     * Remove Members from the Channel.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous Channel Members remove response.
     */
    removeChannelMembers<MemberCustom extends AppContext.CustomData = AppContext.CustomData, UUIDCustom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.RemoveMembersParameters): Promise<AppContext.RemoveMembersResponse<MemberCustom, UUIDCustom>>;
    /**
     * Fetch a specific UUID Memberships list for currently configured PubNub client `uuid`.
     *
     * @param callback - Request completion handler callback.
     *
     * @returns Asynchronous get UUID Memberships list response or `void` in case if `callback`
     * provided.
     */
    getMemberships<MembershipCustom extends AppContext.CustomData = AppContext.CustomData, ChannelCustom extends AppContext.CustomData = AppContext.CustomData>(callback: ResultCallback<AppContext.GetMembershipsResponse<MembershipCustom, ChannelCustom>>): void;
    /**
     * Fetch a specific UUID Memberships list.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    getMemberships<MembershipCustom extends AppContext.CustomData = AppContext.CustomData, ChannelCustom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.GetMembershipsParameters, callback: ResultCallback<AppContext.GetMembershipsResponse<MembershipCustom, ChannelCustom>>): void;
    /**
     * Fetch a specific UUID Memberships list.
     *
     * @param [parameters] - Request configuration parameters. Will fetch UUID Memberships list for
     * currently configured PubNub client `uuid` if not set.
     *
     * @returns Asynchronous get UUID Memberships list response.
     */
    getMemberships<MembershipCustom extends AppContext.CustomData = AppContext.CustomData, ChannelCustom extends AppContext.CustomData = AppContext.CustomData>(parameters?: AppContext.GetMembershipsParameters): Promise<AppContext.GetMembershipsResponse<MembershipCustom, ChannelCustom>>;
    /**
     * Update specific UUID Memberships list.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    setMemberships<MembershipCustom extends AppContext.CustomData = AppContext.CustomData, ChannelCustom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetMembershipsParameters<MembershipCustom>, callback: ResultCallback<AppContext.SetMembershipsResponse<MembershipCustom, ChannelCustom>>): void;
    /**
     * Update specific UUID Memberships list.
     *
     * @param parameters - Request configuration parameters or callback from overload.
     *
     * @returns Asynchronous update UUID Memberships list response.
     */
    setMemberships<MembershipCustom extends AppContext.CustomData = AppContext.CustomData, ChannelCustom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetMembershipsParameters<MembershipCustom>): Promise<AppContext.SetMembershipsResponse<MembershipCustom, ChannelCustom>>;
    /**
     * Remove a specific UUID Memberships.
     *
     * @param parameters - Request configuration parameters.
     * @param callback - Request completion handler callback.
     */
    removeMemberships<MembershipCustom extends AppContext.CustomData = AppContext.CustomData, ChannelCustom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.RemoveMembershipsParameters, callback: ResultCallback<AppContext.RemoveMembershipsResponse<MembershipCustom, ChannelCustom>>): void;
    /**
     * Remove a specific UUID Memberships.
     *
     * @param parameters - Request configuration parameters.
     *
     * @returns Asynchronous UUID Memberships remove response.
     */
    removeMemberships<MembershipCustom extends AppContext.CustomData = AppContext.CustomData, ChannelCustom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.RemoveMembershipsParameters): Promise<AppContext.RemoveMembershipsResponse<MembershipCustom, ChannelCustom>>;
    /**
     * Fetch paginated list of specific Space members or specific User memberships.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous get specific Space members or specific User memberships response.
     *
     * @deprecated Use {@link PubNubObjects#getChannelMembers} or {@link PubNubObjects#getMemberships} methods instead.
     */
    fetchMemberships<RelationCustom extends AppContext.CustomData = AppContext.CustomData, MetadataCustom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.GetMembershipsParameters | AppContext.GetMembersParameters, callback?: ResultCallback<AppContext.SpaceMembershipsResponse<RelationCustom, MetadataCustom> | AppContext.UserMembersResponse<RelationCustom, MetadataCustom>>): Promise<AppContext.SpaceMembershipsResponse<RelationCustom, MetadataCustom> | AppContext.UserMembersResponse<RelationCustom, MetadataCustom> | void>;
    /**
     * Add members to specific Space or memberships specific User.
     *
     * @param parameters - Request configuration parameters.
     * @param [callback] - Request completion handler callback.
     *
     * @returns Asynchronous add members to specific Space or memberships specific User response or
     * `void` in case if `callback` provided.
     *
     * @deprecated Use {@link PubNubObjects#setChannelMembers} or {@link PubNubObjects#setMemberships} methods instead.
     */
    addMemberships<Custom extends AppContext.CustomData = AppContext.CustomData, MetadataCustom extends AppContext.CustomData = AppContext.CustomData>(parameters: AppContext.SetMembershipsParameters<Custom> | AppContext.SetChannelMembersParameters<Custom>, callback?: ResultCallback<AppContext.SetMembershipsResponse<Custom, MetadataCustom> | AppContext.SetMembersResponse<Custom, MetadataCustom>>): Promise<AppContext.SetMembershipsResponse<Custom, MetadataCustom> | AppContext.SetMembersResponse<Custom, MetadataCustom> | void>;
}
