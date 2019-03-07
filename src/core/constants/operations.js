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
  PNAccessManagerAudit: 'PNAccessManagerAudit',
  //

};
