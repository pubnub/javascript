"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Endpoint API operation types.
 */
var RequestOperation;
(function (RequestOperation) {
    // --------------------------------------------------------
    // ---------------------- Publish API ---------------------
    // --------------------------------------------------------
    /**
     * Data publish REST API operation.
     */
    RequestOperation["PNPublishOperation"] = "PNPublishOperation";
    /**
     * Signal sending REST API operation.
     */
    RequestOperation["PNSignalOperation"] = "PNSignalOperation";
    // --------------------------------------------------------
    // --------------------- Subscribe API --------------------
    // --------------------------------------------------------
    /**
     * Subscribe for real-time updates REST API operation.
     *
     * User's presence change on specified entities will trigger `join` event.
     */
    RequestOperation["PNSubscribeOperation"] = "PNSubscribeOperation";
    /**
     * Unsubscribe from real-time updates REST API operation.
     *
     * User's presence change on specified entities will trigger `leave` event.
     */
    RequestOperation["PNUnsubscribeOperation"] = "PNUnsubscribeOperation";
    // --------------------------------------------------------
    // --------------------- Presence API ---------------------
    // --------------------------------------------------------
    /**
     * Fetch user's presence information REST API operation.
     */
    RequestOperation["PNWhereNowOperation"] = "PNWhereNowOperation";
    /**
     * Fetch channel's presence information REST API operation.
     */
    RequestOperation["PNHereNowOperation"] = "PNHereNowOperation";
    /**
     * Fetch global presence information REST API operation.
     */
    RequestOperation["PNGlobalHereNowOperation"] = "PNGlobalHereNowOperation";
    /**
     * Update user's information associated with specified channel REST API operation.
     */
    RequestOperation["PNSetStateOperation"] = "PNSetStateOperation";
    /**
     * Fetch user's information associated with the specified channel REST API operation.
     */
    RequestOperation["PNGetStateOperation"] = "PNGetStateOperation";
    /**
     * Announce presence on managed channels REST API operation.
     */
    RequestOperation["PNHeartbeatOperation"] = "PNHeartbeatOperation";
    // --------------------------------------------------------
    // ----------------- Message Reaction API -----------------
    // --------------------------------------------------------
    /**
     * Add a reaction to the specified message REST API operation.
     */
    RequestOperation["PNAddMessageActionOperation"] = "PNAddActionOperation";
    /**
     * Remove reaction from the specified message REST API operation.
     */
    RequestOperation["PNRemoveMessageActionOperation"] = "PNRemoveMessageActionOperation";
    /**
     * Fetch reactions for specific message REST API operation.
     */
    RequestOperation["PNGetMessageActionsOperation"] = "PNGetMessageActionsOperation";
    RequestOperation["PNTimeOperation"] = "PNTimeOperation";
    // --------------------------------------------------------
    // ---------------------- Storage API ---------------------
    // --------------------------------------------------------
    /**
     * Channel history REST API operation.
     */
    RequestOperation["PNHistoryOperation"] = "PNHistoryOperation";
    /**
     * Delete messages from channel history REST API operation.
     */
    RequestOperation["PNDeleteMessagesOperation"] = "PNDeleteMessagesOperation";
    /**
     * History for channels REST API operation.
     */
    RequestOperation["PNFetchMessagesOperation"] = "PNFetchMessagesOperation";
    /**
     * Number of messages for channels in specified time frame REST API operation.
     */
    RequestOperation["PNMessageCounts"] = "PNMessageCountsOperation";
    // --------------------------------------------------------
    // -------------------- App Context API -------------------
    // --------------------------------------------------------
    /**
     * Fetch users metadata REST API operation.
     */
    RequestOperation["PNGetAllUUIDMetadataOperation"] = "PNGetAllUUIDMetadataOperation";
    /**
     * Fetch user metadata REST API operation.
     */
    RequestOperation["PNGetUUIDMetadataOperation"] = "PNGetUUIDMetadataOperation";
    /**
     * Set user metadata REST API operation.
     */
    RequestOperation["PNSetUUIDMetadataOperation"] = "PNSetUUIDMetadataOperation";
    /**
     * Remove user metadata REST API operation.
     */
    RequestOperation["PNRemoveUUIDMetadataOperation"] = "PNRemoveUUIDMetadataOperation";
    /**
     * Fetch channels metadata REST API operation.
     */
    RequestOperation["PNGetAllChannelMetadataOperation"] = "PNGetAllChannelMetadataOperation";
    /**
     * Fetch channel metadata REST API operation.
     */
    RequestOperation["PNGetChannelMetadataOperation"] = "PNGetChannelMetadataOperation";
    /**
     * Set channel metadata REST API operation.
     */
    RequestOperation["PNSetChannelMetadataOperation"] = "PNSetChannelMetadataOperation";
    /**
     * Remove channel metadata REST API operation.
     */
    RequestOperation["PNRemoveChannelMetadataOperation"] = "PNRemoveChannelMetadataOperation";
    /**
     * Fetch channel members REST API operation.
     */
    RequestOperation["PNGetMembersOperation"] = "PNGetMembersOperation";
    /**
     * Update channel members REST API operation.
     */
    RequestOperation["PNSetMembersOperation"] = "PNSetMembersOperation";
    /**
     * Fetch channel memberships REST API operation.
     */
    RequestOperation["PNGetMembershipsOperation"] = "PNGetMembershipsOperation";
    /**
     * Update channel memberships REST API operation.
     */
    RequestOperation["PNSetMembershipsOperation"] = "PNSetMembershipsOperation";
    // --------------------------------------------------------
    // ------------------- DataSync API ----------------------
    // --------------------------------------------------------
    /**
     * Create entity REST API operation.
     */
    RequestOperation["PNCreateDataSyncEntityOperation"] = "PNCreateDataSyncEntityOperation";
    /**
     * Get entity REST API operation.
     */
    RequestOperation["PNGetDataSyncEntityOperation"] = "PNGetDataSyncEntityOperation";
    /**
     * Get all entities REST API operation.
     */
    RequestOperation["PNGetDataSyncEntitiesOperation"] = "PNGetDataSyncEntitiesOperation";
    /**
     * Set entity REST API operation (full replacement via PUT).
     */
    RequestOperation["PNSetDataSyncEntityOperation"] = "PNSetDataSyncEntityOperation";
    /**
     * Update entity REST API operation (partial update via PATCH).
     */
    RequestOperation["PNUpdateDataSyncEntityOperation"] = "PNUpdateDataSyncEntityOperation";
    /**
     * Remove entity REST API operation.
     */
    RequestOperation["PNRemoveDataSyncEntityOperation"] = "PNRemoveDataSyncEntityOperation";
    /**
     * Create relationship REST API operation.
     */
    RequestOperation["PNCreateDataSyncRelationshipOperation"] = "PNCreateDataSyncRelationshipOperation";
    /**
     * Get relationship REST API operation.
     */
    RequestOperation["PNGetDataSyncRelationshipOperation"] = "PNGetDataSyncRelationshipOperation";
    /**
     * Get all relationships REST API operation.
     */
    RequestOperation["PNGetDataSyncRelationshipsOperation"] = "PNGetDataSyncRelationshipsOperation";
    /**
     * Set relationship REST API operation (full replacement via PUT).
     */
    RequestOperation["PNSetDataSyncRelationshipOperation"] = "PNSetDataSyncRelationshipOperation";
    /**
     * Update relationship REST API operation (partial update via PATCH).
     */
    RequestOperation["PNUpdateDataSyncRelationshipOperation"] = "PNUpdateDataSyncRelationshipOperation";
    /**
     * Remove relationship REST API operation.
     */
    RequestOperation["PNRemoveDataSyncRelationshipOperation"] = "PNRemoveDataSyncRelationshipOperation";
    /**
     * Create user REST API operation.
     */
    RequestOperation["PNCreateDataSyncUserOperation"] = "PNCreateDataSyncUserOperation";
    /**
     * Get user REST API operation.
     */
    RequestOperation["PNGetDataSyncUserOperation"] = "PNGetDataSyncUserOperation";
    /**
     * Get all users REST API operation.
     */
    RequestOperation["PNGetDataSyncUsersOperation"] = "PNGetDataSyncUsersOperation";
    /**
     * Set user REST API operation (full replacement via PUT).
     */
    RequestOperation["PNSetDataSyncUserOperation"] = "PNSetDataSyncUserOperation";
    /**
     * Update user REST API operation (partial update via PATCH).
     */
    RequestOperation["PNUpdateDataSyncUserOperation"] = "PNUpdateDataSyncUserOperation";
    /**
     * Remove user REST API operation.
     */
    RequestOperation["PNRemoveDataSyncUserOperation"] = "PNRemoveDataSyncUserOperation";
    /**
     * Create channel REST API operation.
     */
    RequestOperation["PNCreateDataSyncChannelOperation"] = "PNCreateDataSyncChannelOperation";
    /**
     * Get channel REST API operation.
     */
    RequestOperation["PNGetDataSyncChannelOperation"] = "PNGetDataSyncChannelOperation";
    /**
     * Get all channels REST API operation.
     */
    RequestOperation["PNGetDataSyncChannelsOperation"] = "PNGetDataSyncChannelsOperation";
    /**
     * Set channel REST API operation (full replacement via PUT).
     */
    RequestOperation["PNSetDataSyncChannelOperation"] = "PNSetDataSyncChannelOperation";
    /**
     * Update channel REST API operation (partial update via PATCH).
     */
    RequestOperation["PNUpdateDataSyncChannelOperation"] = "PNUpdateDataSyncChannelOperation";
    /**
     * Remove channel REST API operation.
     */
    RequestOperation["PNRemoveDataSyncChannelOperation"] = "PNRemoveDataSyncChannelOperation";
    /**
     * Create membership REST API operation.
     */
    RequestOperation["PNCreateDataSyncMembershipOperation"] = "PNCreateDataSyncMembershipOperation";
    /**
     * Get membership REST API operation.
     */
    RequestOperation["PNGetDataSyncMembershipOperation"] = "PNGetDataSyncMembershipOperation";
    /**
     * Get all memberships REST API operation.
     */
    RequestOperation["PNGetDataSyncMembershipsOperation"] = "PNGetDataSyncMembershipsOperation";
    /**
     * Set membership REST API operation (full replacement via PUT).
     */
    RequestOperation["PNSetDataSyncMembershipOperation"] = "PNSetDataSyncMembershipOperation";
    /**
     * Update membership REST API operation (partial update via PATCH).
     */
    RequestOperation["PNUpdateDataSyncMembershipOperation"] = "PNUpdateDataSyncMembershipOperation";
    /**
     * Remove membership REST API operation.
     */
    RequestOperation["PNRemoveDataSyncMembershipOperation"] = "PNRemoveDataSyncMembershipOperation";
    // --------------------------------------------------------
    // -------------------- File Upload API -------------------
    // --------------------------------------------------------
    /**
     * Fetch list of files sent to the channel REST API operation.
     */
    RequestOperation["PNListFilesOperation"] = "PNListFilesOperation";
    /**
     * Retrieve file upload URL REST API operation.
     */
    RequestOperation["PNGenerateUploadUrlOperation"] = "PNGenerateUploadUrlOperation";
    /**
     * Upload file to the channel REST API operation.
     */
    RequestOperation["PNPublishFileOperation"] = "PNPublishFileOperation";
    /**
     * Publish File Message to the channel REST API operation.
     */
    RequestOperation["PNPublishFileMessageOperation"] = "PNPublishFileMessageOperation";
    /**
     * Retrieve file download URL REST API operation.
     */
    RequestOperation["PNGetFileUrlOperation"] = "PNGetFileUrlOperation";
    /**
     * Download file from the channel REST API operation.
     */
    RequestOperation["PNDownloadFileOperation"] = "PNDownloadFileOperation";
    /**
     * Delete file sent to the channel REST API operation.
     */
    RequestOperation["PNDeleteFileOperation"] = "PNDeleteFileOperation";
    // --------------------------------------------------------
    // -------------------- Mobile Push API -------------------
    // --------------------------------------------------------
    /**
     * Register channels with device push notifications REST API operation.
     */
    RequestOperation["PNAddPushNotificationEnabledChannelsOperation"] = "PNAddPushNotificationEnabledChannelsOperation";
    /**
     * Unregister channels with device push notifications REST API operation.
     */
    RequestOperation["PNRemovePushNotificationEnabledChannelsOperation"] = "PNRemovePushNotificationEnabledChannelsOperation";
    /**
     * Fetch list of channels with enabled push notifications for device REST API operation.
     */
    RequestOperation["PNPushNotificationEnabledChannelsOperation"] = "PNPushNotificationEnabledChannelsOperation";
    /**
     * Disable push notifications for device REST API operation.
     */
    RequestOperation["PNRemoveAllPushNotificationsOperation"] = "PNRemoveAllPushNotificationsOperation";
    // --------------------------------------------------------
    // ------------------ Channel Groups API ------------------
    // --------------------------------------------------------
    /**
     * Fetch channels groups list REST API operation.
     */
    RequestOperation["PNChannelGroupsOperation"] = "PNChannelGroupsOperation";
    /**
     * Remove specified channel group REST API operation.
     */
    RequestOperation["PNRemoveGroupOperation"] = "PNRemoveGroupOperation";
    /**
     * Fetch list of channels for the specified channel group REST API operation.
     */
    RequestOperation["PNChannelsForGroupOperation"] = "PNChannelsForGroupOperation";
    /**
     * Add list of channels to the specified channel group REST API operation.
     */
    RequestOperation["PNAddChannelsToGroupOperation"] = "PNAddChannelsToGroupOperation";
    /**
     * Remove list of channels from the specified channel group REST API operation.
     */
    RequestOperation["PNRemoveChannelsFromGroupOperation"] = "PNRemoveChannelsFromGroupOperation";
    // --------------------------------------------------------
    // ----------------------- PAM API ------------------------
    // --------------------------------------------------------
    /**
     * Generate authorized token REST API operation.
     */
    RequestOperation["PNAccessManagerGrant"] = "PNAccessManagerGrant";
    /**
     * Generate authorized token REST API operation.
     */
    RequestOperation["PNAccessManagerGrantToken"] = "PNAccessManagerGrantToken";
    RequestOperation["PNAccessManagerAudit"] = "PNAccessManagerAudit";
    /**
     * Revoke authorized token REST API operation.
     */
    RequestOperation["PNAccessManagerRevokeToken"] = "PNAccessManagerRevokeToken";
    //
    // --------------------------------------------------------
    // ---------------- Subscription Utility ------------------
    // --------------------------------------------------------
    /**
     * Initial event engine subscription handshake operation.
     *
     * @internal
     */
    RequestOperation["PNHandshakeOperation"] = "PNHandshakeOperation";
    /**
     * Event engine subscription loop operation.
     *
     * @internal
     */
    RequestOperation["PNReceiveMessagesOperation"] = "PNReceiveMessagesOperation";
})(RequestOperation || (RequestOperation = {}));
exports.default = RequestOperation;
