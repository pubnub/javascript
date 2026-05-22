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
  PNCreateEntityOperation = 'PNCreateEntityOperation',

  /**
   * Get entity REST API operation.
   */
  PNGetEntityOperation = 'PNGetEntityOperation',

  /**
   * Get all entities REST API operation.
   */
  PNGetAllEntitiesOperation = 'PNGetAllEntitiesOperation',

  /**
   * Update entity REST API operation.
   */
  PNUpdateEntityOperation = 'PNUpdateEntityOperation',

  /**
   * Patch entity REST API operation.
   */
  PNPatchEntityOperation = 'PNPatchEntityOperation',

  /**
   * Remove entity REST API operation.
   */
  PNRemoveEntityOperation = 'PNRemoveEntityOperation',

  /**
   * Create relationship REST API operation.
   */
  PNCreateRelationshipOperation = 'PNCreateRelationshipOperation',

  /**
   * Get relationship REST API operation.
   */
  PNGetRelationshipOperation = 'PNGetRelationshipOperation',

  /**
   * Get all relationships REST API operation.
   */
  PNGetAllRelationshipsOperation = 'PNGetAllRelationshipsOperation',

  /**
   * Update relationship REST API operation.
   */
  PNUpdateRelationshipOperation = 'PNUpdateRelationshipOperation',

  /**
   * Patch relationship REST API operation.
   */
  PNPatchRelationshipOperation = 'PNPatchRelationshipOperation',

  /**
   * Remove relationship REST API operation.
   */
  PNRemoveRelationshipOperation = 'PNRemoveRelationshipOperation',

  /**
   * Create user REST API operation.
   */
  PNCreateUserOperation = 'PNCreateUserOperation',

  /**
   * Get user REST API operation.
   */
  PNGetUserOperation = 'PNGetUserOperation',

  /**
   * Get all users REST API operation.
   */
  PNGetAllUsersOperation = 'PNGetAllUsersOperation',

  /**
   * Update user REST API operation.
   */
  PNUpdateUserOperation = 'PNUpdateUserOperation',

  /**
   * Patch user REST API operation.
   */
  PNPatchUserOperation = 'PNPatchUserOperation',

  /**
   * Remove user REST API operation.
   */
  PNRemoveUserOperation = 'PNRemoveUserOperation',

  /**
   * Create channel REST API operation.
   */
  PNCreateChannelOperation = 'PNCreateChannelOperation',

  /**
   * Get channel REST API operation.
   */
  PNGetChannelOperation = 'PNGetChannelOperation',

  /**
   * Get all channels REST API operation.
   */
  PNGetAllChannelsOperation = 'PNGetAllChannelsOperation',

  /**
   * Update channel REST API operation.
   */
  PNUpdateChannelOperation = 'PNUpdateChannelOperation',

  /**
   * Patch channel REST API operation.
   */
  PNPatchChannelOperation = 'PNPatchChannelOperation',

  /**
   * Remove channel REST API operation.
   */
  PNRemoveChannelOperation = 'PNRemoveChannelOperation',

  /**
   * Create membership REST API operation.
   */
  PNCreateMembershipOperation = 'PNCreateMembershipOperation',

  /**
   * Get membership REST API operation.
   */
  PNGetMembershipOperation = 'PNGetMembershipOperation',

  /**
   * Get all memberships REST API operation.
   */
  PNGetAllMembershipsOperation = 'PNGetAllMembershipsOperation',

  /**
   * Update membership REST API operation.
   */
  PNUpdateMembershipOperation = 'PNUpdateMembershipOperation',

  /**
   * Patch membership REST API operation.
   */
  PNPatchMembershipOperation = 'PNPatchMembershipOperation',

  /**
   * Remove membership REST API operation.
   */
  PNRemoveMembershipOperation = 'PNRemoveMembershipOperation',

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
