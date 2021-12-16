/* @flow */
import operationConstants from '../constants/operations';

type TelemetryManagerConstruct = {
  maximumSamplesCount: number,
};

export default class {
  _maximumSamplesCount: number = 100;
  _trackedLatencies = {};
  _latencies = {};

  constructor(configuration: TelemetryManagerConstruct) {
    this._maximumSamplesCount = configuration.maximumSamplesCount || this._maximumSamplesCount;
  }

  /**
   * Compose object with latency information of recently used API endpoints.
   *
   * @return {Object} Object with request query key/value pairs.
   */
  operationsLatencyForRequest(): Object {
    let latencies = {};

    Object.keys(this._latencies).forEach((endpointName) => {
      const operationLatencies = this._latencies[endpointName];
      const averageLatency = this._averageLatency(operationLatencies);

      if (averageLatency > 0) {
        latencies[`l_${endpointName}`] = averageLatency;
      }
    });

    return latencies;
  }

  startLatencyMeasure(operationType: String, identifier: string) {
    if (operationType === operationConstants.PNSubscribeOperation || !identifier) {
      return;
    }

    this._trackedLatencies[identifier] = Date.now();
  }

  stopLatencyMeasure(operationType: String, identifier: string) {
    if (operationType === operationConstants.PNSubscribeOperation || !identifier) {
      return;
    }

    const endpointName = this._endpointName(operationType);
    /** @type Array<Number> */
    let endpointLatencies = this._latencies[endpointName];
    const startDate = this._trackedLatencies[identifier];

    if (!endpointLatencies) {
      endpointLatencies = (this._latencies[endpointName] = []);
    }

    endpointLatencies.push((Date.now() - startDate));

    // Truncate samples count if there is more then configured.
    if (endpointLatencies.length > this._maximumSamplesCount) {
      endpointLatencies.splice(0, (endpointLatencies.length - this._maximumSamplesCount));
    }

    delete this._trackedLatencies[identifier];
  }

  _averageLatency(latencies: Array<number>) {
    const arrayReduce = (accumulatedLatency: number, latency: number) => accumulatedLatency + latency;

    return Math.floor(latencies.reduce(arrayReduce, 0) / latencies.length);
  }

  _endpointName(operationType: String) {
    let operation = null;

    switch (operationType) {
      case operationConstants.PNPublishOperation:
        operation = 'pub';
        break;
      case operationConstants.PNSignalOperation:
        operation = 'sig';
        break;
      case operationConstants.PNHistoryOperation:
      case operationConstants.PNFetchMessagesOperation:
      case operationConstants.PNDeleteMessagesOperation:
      case operationConstants.PNMessageCounts:
        operation = 'hist';
        break;
      case operationConstants.PNUnsubscribeOperation:
      case operationConstants.PNWhereNowOperation:
      case operationConstants.PNHereNowOperation:
      case operationConstants.PNHeartbeatOperation:
      case operationConstants.PNSetStateOperation:
      case operationConstants.PNGetStateOperation:
        operation = 'pres';
        break;
      case operationConstants.PNAddChannelsToGroupOperation:
      case operationConstants.PNRemoveChannelsFromGroupOperation:
      case operationConstants.PNChannelGroupsOperation:
      case operationConstants.PNRemoveGroupOperation:
      case operationConstants.PNChannelsForGroupOperation:
        operation = 'cg';
        break;
      case operationConstants.PNPushNotificationEnabledChannelsOperation:
      case operationConstants.PNRemoveAllPushNotificationsOperation:
        operation = 'push';
        break;
      case operationConstants.PNCreateUserOperation:
      case operationConstants.PNUpdateUserOperation:
      case operationConstants.PNDeleteUserOperation:
      case operationConstants.PNGetUserOperation:
      case operationConstants.PNGetUsersOperation:
      case operationConstants.PNCreateSpaceOperation:
      case operationConstants.PNUpdateSpaceOperation:
      case operationConstants.PNDeleteSpaceOperation:
      case operationConstants.PNGetSpaceOperation:
      case operationConstants.PNGetSpacesOperation:
      case operationConstants.PNGetMembersOperation:
      case operationConstants.PNUpdateMembersOperation:
      case operationConstants.PNGetMembershipsOperation:
      case operationConstants.PNUpdateMembershipsOperation:
        operation = 'obj';
        break;
      case operationConstants.PNAddMessageActionOperation:
      case operationConstants.PNRemoveMessageActionOperation:
      case operationConstants.PNGetMessageActionsOperation:
        operation = 'msga';
        break;
      case operationConstants.PNAccessManagerGrant:
      case operationConstants.PNAccessManagerAudit:
        operation = 'pam';
        break;
      case operationConstants.PNAccessManagerGrantToken:
      case operationConstants.PNAccessManagerRevokeToken:
        operation = 'pamv3';
        break;
      default:
        operation = 'time';
        break;
    }

    return operation;
  }
}
