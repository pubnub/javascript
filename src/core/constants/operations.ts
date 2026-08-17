/**
 * Endpoint API operation types.
 */
enum RequestOperation {
  // --------------------------------------------------------
  // ---------------------- Publish API ---------------------
  // --------------------------------------------------------
  /**
   * Data publish REST API operation.
   */
  PNPublishOperation = 'PNPublishOperation',

  /**
   * Signal sending REST API operation.
   */
  PNSignalOperation = 'PNSignalOperation',

  // --------------------------------------------------------
  // --------------------- Subscribe API --------------------
  // --------------------------------------------------------
  /**
   * Subscribe for real-time updates REST API operation.
   *
   * User's presence change on specified entities will trigger `join` event.
   */
  PNSubscribeOperation = 'PNSubscribeOperation',

  /**
   * Unsubscribe from real-time updates REST API operation.
   *
   * User's presence change on specified entities will trigger `leave` event.
   */
  PNUnsubscribeOperation = 'PNUnsubscribeOperation',

  // --------------------------------------------------------
  // --------------------- Presence API ---------------------
  // --------------------------------------------------------

  /**
   * Fetch user's presence information REST API operation.
   */
  PNWhereNowOperation = 'PNWhereNowOperation',

  /**
   * Fetch channel's presence information REST API operation.
   */
  PNHereNowOperation = 'PNHereNowOperation',

  /**
   * Fetch global presence information REST API operation.
   */
  PNGlobalHereNowOperation = 'PNGlobalHereNowOperation',

  /**
   * Update user's information associated with specified channel REST API operation.
   */
  PNSetStateOperation = 'PNSetStateOperation',

  /**
   * Fetch user's information associated with the specified channel REST API operation.
   */
  PNGetStateOperation = 'PNGetStateOperation',

  /**
   * Announce presence on managed channels REST API operation.
   */
  PNHeartbeatOperation = 'PNHeartbeatOperation',

  // --------------------------------------------------------
  // ----------------- Message Reaction API -----------------
  // --------------------------------------------------------

  /**
   * Add a reaction to the specified message REST API operation.
   */
  PNAddMessageActionOperation = 'PNAddActionOperation',

  /**
   * Remove reaction from the specified message REST API operation.
   */
  PNRemoveMessageActionOperation = 'PNRemoveMessageActionOperation',

  /**
   * Fetch reactions for specific message REST API operation.
   */
  PNGetMessageActionsOperation = 'PNGetMessageActionsOperation',

  PNTimeOperation = 'PNTimeOperation',

  // --------------------------------------------------------
  // ---------------------- Storage API ---------------------
  // --------------------------------------------------------

  /**
   * Channel history REST API operation.
   */
  PNHistoryOperation = 'PNHistoryOperation',

  /**
   * Delete messages from channel history REST API operation.
   */
  PNDeleteMessagesOperation = 'PNDeleteMessagesOperation',

  /**
   * History for channels REST API operation.
   */
  PNFetchMessagesOperation = 'PNFetchMessagesOperation',

  /**
   * Number of messages for channels in specified time frame REST API operation.
   */
  PNMessageCounts = 'PNMessageCountsOperation',

  // --------------------------------------------------------
  // -------------------- App Context API -------------------
  // --------------------------------------------------------

  /**
   * Fetch users metadata REST API operation.
   */
  PNGetAllUUIDMetadataOperation = 'PNGetAllUUIDMetadataOperation',

  /**
   * Fetch user metadata REST API operation.
   */
  PNGetUUIDMetadataOperation = 'PNGetUUIDMetadataOperation',

  /**
   * Set user metadata REST API operation.
   */
  PNSetUUIDMetadataOperation = 'PNSetUUIDMetadataOperation',

  /**
   * Remove user metadata REST API operation.
   */
  PNRemoveUUIDMetadataOperation = 'PNRemoveUUIDMetadataOperation',

  /**
   * Fetch channels metadata REST API operation.
   */
  PNGetAllChannelMetadataOperation = 'PNGetAllChannelMetadataOperation',

  /**
   * Fetch channel metadata REST API operation.
   */
  PNGetChannelMetadataOperation = 'PNGetChannelMetadataOperation',

  /**
   * Set channel metadata REST API operation.
   */
  PNSetChannelMetadataOperation = 'PNSetChannelMetadataOperation',

  /**
   * Remove channel metadata REST API operation.
   */
  PNRemoveChannelMetadataOperation = 'PNRemoveChannelMetadataOperation',

  /**
   * Fetch channel members REST API operation.
   */
  PNGetMembersOperation = 'PNGetMembersOperation',

  /**
   * Update channel members REST API operation.
   */
  PNSetMembersOperation = 'PNSetMembersOperation',

  /**
   * Fetch channel memberships REST API operation.
   */
  PNGetMembershipsOperation = 'PNGetMembershipsOperation',

  /**
   * Update channel memberships REST API operation.
   */
  PNSetMembershipsOperation = 'PNSetMembershipsOperation',

  // --------------------------------------------------------
  // ------------------- DataSync API ----------------------
  // --------------------------------------------------------

  /**
   * Create entity REST API operation.
   */
  PNCreateDataSyncEntityOperation = 'PNCreateDataSyncEntityOperation',

  /**
   * Get entity REST API operation.
   */
  PNGetDataSyncEntityOperation = 'PNGetDataSyncEntityOperation',

  /**
   * Get all entities REST API operation.
   */
  PNGetDataSyncEntitiesOperation = 'PNGetDataSyncEntitiesOperation',

  /**
   * Set entity REST API operation (full replacement via PUT).
   */
  PNSetDataSyncEntityOperation = 'PNSetDataSyncEntityOperation',

  /**
   * Update entity REST API operation (partial update via PATCH).
   */
  PNUpdateDataSyncEntityOperation = 'PNUpdateDataSyncEntityOperation',

  /**
   * Remove entity REST API operation.
   */
  PNRemoveDataSyncEntityOperation = 'PNRemoveDataSyncEntityOperation',

  /**
   * Create relationship REST API operation.
   */
  PNCreateDataSyncRelationshipOperation = 'PNCreateDataSyncRelationshipOperation',

  /**
   * Get relationship REST API operation.
   */
  PNGetDataSyncRelationshipOperation = 'PNGetDataSyncRelationshipOperation',

  /**
   * Get all relationships REST API operation.
   */
  PNGetDataSyncRelationshipsOperation = 'PNGetDataSyncRelationshipsOperation',

  /**
   * Set relationship REST API operation (full replacement via PUT).
   */
  PNSetDataSyncRelationshipOperation = 'PNSetDataSyncRelationshipOperation',

  /**
   * Update relationship REST API operation (partial update via PATCH).
   */
  PNUpdateDataSyncRelationshipOperation = 'PNUpdateDataSyncRelationshipOperation',

  /**
   * Remove relationship REST API operation.
   */
  PNRemoveDataSyncRelationshipOperation = 'PNRemoveDataSyncRelationshipOperation',

  /**
   * Create user REST API operation.
   */
  PNCreateDataSyncUserOperation = 'PNCreateDataSyncUserOperation',

  /**
   * Get user REST API operation.
   */
  PNGetDataSyncUserOperation = 'PNGetDataSyncUserOperation',

  /**
   * Get all users REST API operation.
   */
  PNGetDataSyncUsersOperation = 'PNGetDataSyncUsersOperation',

  /**
   * Set user REST API operation (full replacement via PUT).
   */
  PNSetDataSyncUserOperation = 'PNSetDataSyncUserOperation',

  /**
   * Update user REST API operation (partial update via PATCH).
   */
  PNUpdateDataSyncUserOperation = 'PNUpdateDataSyncUserOperation',

  /**
   * Remove user REST API operation.
   */
  PNRemoveDataSyncUserOperation = 'PNRemoveDataSyncUserOperation',

  /**
   * Create channel REST API operation.
   */
  PNCreateDataSyncChannelOperation = 'PNCreateDataSyncChannelOperation',

  /**
   * Get channel REST API operation.
   */
  PNGetDataSyncChannelOperation = 'PNGetDataSyncChannelOperation',

  /**
   * Get all channels REST API operation.
   */
  PNGetDataSyncChannelsOperation = 'PNGetDataSyncChannelsOperation',

  /**
   * Set channel REST API operation (full replacement via PUT).
   */
  PNSetDataSyncChannelOperation = 'PNSetDataSyncChannelOperation',

  /**
   * Update channel REST API operation (partial update via PATCH).
   */
  PNUpdateDataSyncChannelOperation = 'PNUpdateDataSyncChannelOperation',

  /**
   * Remove channel REST API operation.
   */
  PNRemoveDataSyncChannelOperation = 'PNRemoveDataSyncChannelOperation',

  /**
   * Create membership REST API operation.
   */
  PNCreateDataSyncMembershipOperation = 'PNCreateDataSyncMembershipOperation',

  /**
   * Get membership REST API operation.
   */
  PNGetDataSyncMembershipOperation = 'PNGetDataSyncMembershipOperation',

  /**
   * Get all memberships REST API operation.
   */
  PNGetDataSyncMembershipsOperation = 'PNGetDataSyncMembershipsOperation',

  /**
   * Set membership REST API operation (full replacement via PUT).
   */
  PNSetDataSyncMembershipOperation = 'PNSetDataSyncMembershipOperation',

  /**
   * Update membership REST API operation (partial update via PATCH).
   */
  PNUpdateDataSyncMembershipOperation = 'PNUpdateDataSyncMembershipOperation',

  /**
   * Remove membership REST API operation.
   */
  PNRemoveDataSyncMembershipOperation = 'PNRemoveDataSyncMembershipOperation',

  // --------------------------------------------------------
  // -------------------- File Upload API -------------------
  // --------------------------------------------------------

  /**
   * Fetch list of files sent to the channel REST API operation.
   */
  PNListFilesOperation = 'PNListFilesOperation',

  /**
   * Retrieve file upload URL REST API operation.
   */
  PNGenerateUploadUrlOperation = 'PNGenerateUploadUrlOperation',

  /**
   * Upload file to the channel REST API operation.
   */
  PNPublishFileOperation = 'PNPublishFileOperation',

  /**
   * Publish File Message to the channel REST API operation.
   */
  PNPublishFileMessageOperation = 'PNPublishFileMessageOperation',

  /**
   * Retrieve file download URL REST API operation.
   */
  PNGetFileUrlOperation = 'PNGetFileUrlOperation',

  /**
   * Download file from the channel REST API operation.
   */
  PNDownloadFileOperation = 'PNDownloadFileOperation',

  /**
   * Delete file sent to the channel REST API operation.
   */
  PNDeleteFileOperation = 'PNDeleteFileOperation',

  // --------------------------------------------------------
  // -------------------- Mobile Push API -------------------
  // --------------------------------------------------------

  /**
   * Register channels with device push notifications REST API operation.
   */
  PNAddPushNotificationEnabledChannelsOperation = 'PNAddPushNotificationEnabledChannelsOperation',

  /**
   * Unregister channels with device push notifications REST API operation.
   */
  PNRemovePushNotificationEnabledChannelsOperation = 'PNRemovePushNotificationEnabledChannelsOperation',

  /**
   * Fetch list of channels with enabled push notifications for device REST API operation.
   */
  PNPushNotificationEnabledChannelsOperation = 'PNPushNotificationEnabledChannelsOperation',

  /**
   * Disable push notifications for device REST API operation.
   */
  PNRemoveAllPushNotificationsOperation = 'PNRemoveAllPushNotificationsOperation',

  // --------------------------------------------------------
  // ------------------ Channel Groups API ------------------
  // --------------------------------------------------------

  /**
   * Fetch channels groups list REST API operation.
   */
  PNChannelGroupsOperation = 'PNChannelGroupsOperation',

  /**
   * Remove specified channel group REST API operation.
   */
  PNRemoveGroupOperation = 'PNRemoveGroupOperation',

  /**
   * Fetch list of channels for the specified channel group REST API operation.
   */
  PNChannelsForGroupOperation = 'PNChannelsForGroupOperation',

  /**
   * Add list of channels to the specified channel group REST API operation.
   */
  PNAddChannelsToGroupOperation = 'PNAddChannelsToGroupOperation',

  /**
   * Remove list of channels from the specified channel group REST API operation.
   */
  PNRemoveChannelsFromGroupOperation = 'PNRemoveChannelsFromGroupOperation',

  // --------------------------------------------------------
  // ----------------------- PAM API ------------------------
  // --------------------------------------------------------

  /**
   * Generate authorized token REST API operation.
   */
  PNAccessManagerGrant = 'PNAccessManagerGrant',

  /**
   * Generate authorized token REST API operation.
   */
  PNAccessManagerGrantToken = 'PNAccessManagerGrantToken',

  PNAccessManagerAudit = 'PNAccessManagerAudit',

  /**
   * Revoke authorized token REST API operation.
   */
  PNAccessManagerRevokeToken = 'PNAccessManagerRevokeToken',
  //

  // --------------------------------------------------------
  // ---------------- Subscription Utility ------------------
  // --------------------------------------------------------

  /**
   * Initial event engine subscription handshake operation.
   *
   * @internal
   */
  PNHandshakeOperation = 'PNHandshakeOperation',

  /**
   * Event engine subscription loop operation.
   *
   * @internal
   */
  PNReceiveMessagesOperation = 'PNReceiveMessagesOperation',
}

export default RequestOperation;
