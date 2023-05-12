"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Operation = void 0;
var Operation;
(function (Operation) {
    Operation["Time"] = "PNTimeOperation";
    Operation["History"] = "PNHistoryOperation";
    Operation["DeleteMessages"] = "PNDeleteMessagesOperation";
    Operation["FetchMessages"] = "PNFetchMessagesOperation";
    Operation["MessageCounts"] = "PNMessageCountsOperation";
    Operation["Subscribe"] = "PNSubscribeOperation";
    Operation["Unsubscribe"] = "PNUnsubscribeOperation";
    Operation["Publish"] = "PNPublishOperation";
    Operation["Signal"] = "PNSignalOperation";
    Operation["AddMessageAction"] = "PNAddActionOperation";
    Operation["RemoveMessageAction"] = "PNRemoveMessageActionOperation";
    Operation["GetMessageActions"] = "PNGetMessageActionsOperation";
    Operation["CreateUser"] = "PNCreateUserOperation";
    Operation["UpdateUser"] = "PNUpdateUserOperation";
    Operation["RemoveUser"] = "PNRemoveUserOperation";
    Operation["FetchUser"] = "PNFetchUserOperation";
    Operation["GetUsers"] = "PNGetUsersOperation";
    Operation["CreateSpace"] = "PNCreateSpaceOperation";
    Operation["UpdateSpace"] = "PNUpdateSpaceOperation";
    Operation["RemoveSpace"] = "PNRemoveSpaceOperation";
    Operation["FetchSpace"] = "PNFetchSpaceOperation";
    Operation["GetSpaces"] = "PNGetSpacesOperation";
    Operation["GetMembers"] = "PNGetMembersOperation";
    Operation["UpdateMembers"] = "PNUpdateMembersOperation";
    Operation["GetMemberships"] = "PNGetMembershipsOperation";
    Operation["UpdateMemberships"] = "PNUpdateMembershipsOperation";
    Operation["ListFiles"] = "PNListFilesOperation";
    Operation["GenerateUploadUrl"] = "PNGenerateUploadUrlOperation";
    Operation["PublishFile"] = "PNPublishFileOperation";
    Operation["GetFileUrl"] = "PNGetFileUrlOperation";
    Operation["DownloadFile"] = "PNDownloadFileOperation";
    Operation["GetAllUUIDMetadata"] = "PNGetAllUUIDMetadataOperation";
    Operation["GetUUIDMetadata"] = "PNGetUUIDMetadataOperation";
    Operation["SetUUIDMetadata"] = "PNSetUUIDMetadataOperation";
    Operation["RemoveUUIDMetadata"] = "PNRemoveUUIDMetadataOperation";
    Operation["GetAllChannelMetadata"] = "PNGetAllChannelMetadataOperation";
    Operation["GetChannelMetadata"] = "PNGetChannelMetadataOperation";
    Operation["SetChannelMetadata"] = "PNSetChannelMetadataOperation";
    Operation["RemoveChannelMetadata"] = "PNRemoveChannelMetadataOperation";
    Operation["SetMembers"] = "PNSetMembersOperation";
    Operation["SetMemberships"] = "PNSetMembershipsOperation";
    Operation["PushNotificationEnabledChannels"] = "PNPushNotificationEnabledChannelsOperation";
    Operation["RemoveAllPushNotifications"] = "PNRemoveAllPushNotificationsOperation";
    Operation["WhereNow"] = "PNWhereNowOperation";
    Operation["SetState"] = "PNSetStateOperation";
    Operation["HereNow"] = "PNHereNowOperation";
    Operation["GetState"] = "PNGetStateOperation";
    Operation["Heartbeat"] = "PNHeartbeatOperation";
    Operation["ChannelGroups"] = "PNChannelGroupsOperation";
    Operation["RemoveGroup"] = "PNRemoveGroupOperation";
    Operation["ChannelsForGroup"] = "PNChannelsForGroupOperation";
    Operation["AddChannelsToGroup"] = "PNAddChannelsToGroupOperation";
    Operation["RemoveChannelsFromGroup"] = "PNRemoveChannelsFromGroupOperation";
    Operation["AccessManagerGrant"] = "PNAccessManagerGrant";
    Operation["AccessManagerGrantToken"] = "PNAccessManagerGrantToken";
    Operation["AccessManagerAudit"] = "PNAccessManagerAudit";
    Operation["AccessManagerRevokeToken"] = "PNAccessManagerRevokeToken";
    Operation["Handshake"] = "PNHandshakeOperation";
    Operation["ReceiveMessages"] = "PNReceiveMessagesOperation";
})(Operation = exports.Operation || (exports.Operation = {}));
exports.default = {
    PNTimeOperation: 'PNTimeOperation',
    PNHistoryOperation: 'PNHistoryOperation',
    PNDeleteMessagesOperation: 'PNDeleteMessagesOperation',
    PNFetchMessagesOperation: 'PNFetchMessagesOperation',
    PNMessageCounts: 'PNMessageCountsOperation',
    // pubsub
    PNSubscribeOperation: 'PNSubscribeOperation',
    PNUnsubscribeOperation: 'PNUnsubscribeOperation',
    PNPublishOperation: 'PNPublishOperation',
    PNSignalOperation: 'PNSignalOperation',
    // Actions API
    PNAddMessageActionOperation: 'PNAddActionOperation',
    PNRemoveMessageActionOperation: 'PNRemoveMessageActionOperation',
    PNGetMessageActionsOperation: 'PNGetMessageActionsOperation',
    // Objects API
    PNCreateUserOperation: 'PNCreateUserOperation',
    PNUpdateUserOperation: 'PNUpdateUserOperation',
    PNRemoveUserOperation: 'PNRemoveUserOperation',
    PNFetchUserOperation: 'PNFetchUserOperation',
    PNGetUsersOperation: 'PNGetUsersOperation',
    PNCreateSpaceOperation: 'PNCreateSpaceOperation',
    PNUpdateSpaceOperation: 'PNUpdateSpaceOperation',
    PNRemoveSpaceOperation: 'PNRemoveSpaceOperation',
    PNFetchSpaceOperation: 'PNFetchSpaceOperation',
    PNGetSpacesOperation: 'PNGetSpacesOperation',
    PNGetMembersOperation: 'PNGetMembersOperation',
    PNUpdateMembersOperation: 'PNUpdateMembersOperation',
    PNGetMembershipsOperation: 'PNGetMembershipsOperation',
    PNUpdateMembershipsOperation: 'PNUpdateMembershipsOperation',
    // File Upload API v1
    PNListFilesOperation: 'PNListFilesOperation',
    PNGenerateUploadUrlOperation: 'PNGenerateUploadUrlOperation',
    PNPublishFileOperation: 'PNPublishFileOperation',
    PNGetFileUrlOperation: 'PNGetFileUrlOperation',
    PNDownloadFileOperation: 'PNDownloadFileOperation',
    // Objects API v2
    //   UUID
    PNGetAllUUIDMetadataOperation: 'PNGetAllUUIDMetadataOperation',
    PNGetUUIDMetadataOperation: 'PNGetUUIDMetadataOperation',
    PNSetUUIDMetadataOperation: 'PNSetUUIDMetadataOperation',
    PNRemoveUUIDMetadataOperation: 'PNRemoveUUIDMetadataOperation',
    //   channel
    PNGetAllChannelMetadataOperation: 'PNGetAllChannelMetadataOperation',
    PNGetChannelMetadataOperation: 'PNGetChannelMetadataOperation',
    PNSetChannelMetadataOperation: 'PNSetChannelMetadataOperation',
    PNRemoveChannelMetadataOperation: 'PNRemoveChannelMetadataOperation',
    //   member
    // PNGetMembersOperation: 'PNGetMembersOperation',
    PNSetMembersOperation: 'PNSetMembersOperation',
    // PNGetMembershipsOperation: 'PNGetMembersOperation',
    PNSetMembershipsOperation: 'PNSetMembershipsOperation',
    // push
    PNPushNotificationEnabledChannelsOperation: 'PNPushNotificationEnabledChannelsOperation',
    PNRemoveAllPushNotificationsOperation: 'PNRemoveAllPushNotificationsOperation',
    //
    // presence
    PNWhereNowOperation: 'PNWhereNowOperation',
    PNSetStateOperation: 'PNSetStateOperation',
    PNHereNowOperation: 'PNHereNowOperation',
    PNGetStateOperation: 'PNGetStateOperation',
    PNHeartbeatOperation: 'PNHeartbeatOperation',
    //
    // channel group
    PNChannelGroupsOperation: 'PNChannelGroupsOperation',
    PNRemoveGroupOperation: 'PNRemoveGroupOperation',
    PNChannelsForGroupOperation: 'PNChannelsForGroupOperation',
    PNAddChannelsToGroupOperation: 'PNAddChannelsToGroupOperation',
    PNRemoveChannelsFromGroupOperation: 'PNRemoveChannelsFromGroupOperation',
    //
    // PAM
    PNAccessManagerGrant: 'PNAccessManagerGrant',
    PNAccessManagerGrantToken: 'PNAccessManagerGrantToken',
    PNAccessManagerAudit: 'PNAccessManagerAudit',
    PNAccessManagerRevokeToken: 'PNAccessManagerRevokeToken',
    //
    // subscription utilities
    PNHandshakeOperation: 'PNHandshakeOperation',
    PNReceiveMessagesOperation: 'PNReceiveMessagesOperation',
};
