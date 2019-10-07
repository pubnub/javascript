/* @flow */
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
  PNDeleteUserOperation: 'PNDeleteUserOperation',
  PNGetUserOperation: 'PNGetUsersOperation',
  PNGetUsersOperation: 'PNGetUsersOperation',
  PNCreateSpaceOperation: 'PNCreateSpaceOperation',
  PNUpdateSpaceOperation: 'PNUpdateSpaceOperation',
  PNDeleteSpaceOperation: 'PNDeleteSpaceOperation',
  PNGetSpaceOperation: 'PNGetSpacesOperation',
  PNGetSpacesOperation: 'PNGetSpacesOperation',
  PNGetMembersOperation: 'PNGetMembersOperation',
  PNUpdateMembersOperation: 'PNUpdateMembersOperation',
  PNGetMembershipsOperation: 'PNGetMembershipsOperation',
  PNUpdateMembershipsOperation: 'PNUpdateMembershipsOperation',

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
  //

};
