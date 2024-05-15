"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*       */
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
    RequestOperation["PNHandshakeOperation"] = "PNHandshakeOperation";
    RequestOperation["PNReceiveMessagesOperation"] = "PNReceiveMessagesOperation";
})(RequestOperation || (RequestOperation = {}));
exports.default = RequestOperation;
