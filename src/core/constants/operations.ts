export enum Operation {
  Time = 'PNTimeOperation',

  History = 'PNHistoryOperation',
  DeleteMessages = 'PNDeleteMessagesOperation',
  FetchMessages = 'PNFetchMessagesOperation',
  MessageCounts = 'PNMessageCountsOperation',

  Subscribe = 'PNSubscribeOperation',
  Unsubscribe = 'PNUnsubscribeOperation',
  Publish = 'PNPublishOperation',
  Signal = 'PNSignalOperation',

  AddMessageAction = 'PNAddActionOperation',
  RemoveMessageAction = 'PNRemoveMessageActionOperation',
  GetMessageActions = 'PNGetMessageActionsOperation',

  CreateUser = 'PNCreateUserOperation',
  UpdateUser = 'PNUpdateUserOperation',
  RemoveUser = 'PNRemoveUserOperation',
  FetchUser = 'PNFetchUserOperation',
  GetUsers = 'PNGetUsersOperation',
  CreateSpace = 'PNCreateSpaceOperation',
  UpdateSpace = 'PNUpdateSpaceOperation',
  RemoveSpace = 'PNRemoveSpaceOperation',
  FetchSpace = 'PNFetchSpaceOperation',
  GetSpaces = 'PNGetSpacesOperation',
  GetMembers = 'PNGetMembersOperation',
  UpdateMembers = 'PNUpdateMembersOperation',
  GetMemberships = 'PNGetMembershipsOperation',
  UpdateMemberships = 'PNUpdateMembershipsOperation',

  ListFiles = 'PNListFilesOperation',
  GenerateUploadUrl = 'PNGenerateUploadUrlOperation',
  PublishFile = 'PNPublishFileOperation',
  GetFileUrl = 'PNGetFileUrlOperation',
  DownloadFile = 'PNDownloadFileOperation',

  GetAllUUIDMetadata = 'PNGetAllUUIDMetadataOperation',
  GetUUIDMetadata = 'PNGetUUIDMetadataOperation',
  SetUUIDMetadata = 'PNSetUUIDMetadataOperation',
  RemoveUUIDMetadata = 'PNRemoveUUIDMetadataOperation',
  GetAllChannelMetadata = 'PNGetAllChannelMetadataOperation',
  GetChannelMetadata = 'PNGetChannelMetadataOperation',
  SetChannelMetadata = 'PNSetChannelMetadataOperation',
  RemoveChannelMetadata = 'PNRemoveChannelMetadataOperation',
  SetMembers = 'PNSetMembersOperation',
  SetMemberships = 'PNSetMembershipsOperation',

  PushNotificationEnabledChannels = 'PNPushNotificationEnabledChannelsOperation',
  RemoveAllPushNotifications = 'PNRemoveAllPushNotificationsOperation',

  WhereNow = 'PNWhereNowOperation',
  SetState = 'PNSetStateOperation',
  HereNow = 'PNHereNowOperation',
  GetState = 'PNGetStateOperation',
  Heartbeat = 'PNHeartbeatOperation',

  ChannelGroups = 'PNChannelGroupsOperation',
  RemoveGroup = 'PNRemoveGroupOperation',
  ChannelsForGroup = 'PNChannelsForGroupOperation',
  AddChannelsToGroup = 'PNAddChannelsToGroupOperation',
  RemoveChannelsFromGroup = 'PNRemoveChannelsFromGroupOperation',

  AccessManagerGrant = 'PNAccessManagerGrant',
  AccessManagerGrantToken = 'PNAccessManagerGrantToken',
  AccessManagerAudit = 'PNAccessManagerAudit',
  AccessManagerRevokeToken = 'PNAccessManagerRevokeToken',

  Handshake = 'PNHandshakeOperation',
  ReceiveMessages = 'PNReceiveMessagesOperation',
}

export default {
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
} as const;
