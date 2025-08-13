import { TransportRequest } from '../../../core/types/transport-request';
import uuidGenerator from '../../../core/components/uuid';
import { BasePubNubRequest } from './request';
import { Payload } from '../../../core/types/api';
import { AccessToken } from './access-token';

export class HeartbeatRequest extends BasePubNubRequest {
  // --------------------------------------------------------
  // ---------------------- Information ---------------------
  // --------------------------------------------------------
  // region Information

  /**
   * Presence state associated with `userID` on {@link PubNubSharedWorkerRequest.channels|channels} and
   * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups}.
   */
  readonly state: Record<string, Payload> | undefined;
  // endregion

  // --------------------------------------------------------
  // --------------------- Constructors ---------------------
  // --------------------------------------------------------
  // region Constructors

  /**
   * Create heartbeat request from received _transparent_ transport request.
   *
   * @param request - Object with heartbeat transport request.
   * @param subscriptionKey - Subscribe REST API access key.
   * @param [accessToken] - Access token with permissions to announce presence on
   * {@link PubNubSharedWorkerRequest.channels|channels} and
   * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups}.
   * @returns Initialized and ready to use heartbeat request.
   */
  static fromTransportRequest(request: TransportRequest, subscriptionKey: string, accessToken?: AccessToken) {
    return new HeartbeatRequest(request, subscriptionKey, accessToken);
  }

  /**
   * Create heartbeat request from previously cached data.
   *
   * @param request - Object with subscribe transport request.
   * @param subscriptionKey - Subscribe REST API access key.
   * @param [aggregatedChannelGroups] - List of aggregated channel groups for the same user.
   * @param [aggregatedChannels] - List of aggregated channels for the same user.
   * @param [aggregatedState] - State aggregated for the same user.
   * @param [accessToken] - Access token with read permissions on
   * {@link PubNubSharedWorkerRequest.channels|channels} and
   * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups}.
   * @retusns Initialized and ready to use heartbeat request.
   */
  static fromCachedState(
    request: TransportRequest,
    subscriptionKey: string,
    aggregatedChannelGroups: string[],
    aggregatedChannels: string[],
    aggregatedState?: Record<string, Payload>,
    accessToken?: AccessToken,
  ) {
    // Update request channels list (if required).
    if (aggregatedChannels.length || aggregatedChannelGroups.length) {
      const pathComponents = request.path.split('/');
      pathComponents[6] = aggregatedChannels.length ? [...aggregatedChannels].sort().join(',') : ',';
      request.path = pathComponents.join('/');
    }

    // Update request channel groups list (if required).
    if (aggregatedChannelGroups.length)
      request.queryParameters!['channel-group'] = [...aggregatedChannelGroups].sort().join(',');

    // Update request `state` (if required).
    if (aggregatedState && Object.keys(aggregatedState).length)
      request.queryParameters!.state = JSON.stringify(aggregatedState);
    else delete request.queryParameters!.aggregatedState;

    if (accessToken) request.queryParameters!.auth = accessToken.toString();
    request.identifier = uuidGenerator.createUUID();

    return new HeartbeatRequest(request, subscriptionKey, accessToken);
  }

  /**
   * Create heartbeat request from received _transparent_ transport request.
   *
   * @param request - Object with heartbeat transport request.
   * @param subscriptionKey - Subscribe REST API access key.
   * @param [accessToken] - Access token with permissions to announce presence on
   * {@link PubNubSharedWorkerRequest.channels|channels} and
   * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups}.
   */
  private constructor(request: TransportRequest, subscriptionKey: string, accessToken?: AccessToken) {
    const channelGroups = HeartbeatRequest.channelGroupsFromRequest(request).filter(
      (group) => !group.endsWith('-pnpres'),
    );
    const channels = HeartbeatRequest.channelsFromRequest(request).filter((channel) => !channel.endsWith('-pnpres'));

    super(request, subscriptionKey, request.queryParameters!.uuid as string, channels, channelGroups, accessToken);

    // Clean up `state` from objects which is not used with request (if needed).
    if (!request.queryParameters!.state || (request.queryParameters!.state as string).length === 0) return;

    const state = JSON.parse(request.queryParameters!.state as string) as Record<string, Payload>;
    for (const objectName of Object.keys(state))
      if (!this.channels.includes(objectName) && !this.channelGroups.includes(objectName)) delete state[objectName];

    this.state = state;
  }
  // endregion

  // --------------------------------------------------------
  // ---------------------- Properties ----------------------
  // --------------------------------------------------------
  // region Properties

  /**
   * Represent heartbeat request as identifier.
   *
   * Generated identifier will be identical for requests created for the same user.
   */
  get asIdentifier() {
    const auth = this.accessToken ? this.accessToken.asIdentifier : undefined;
    return `${this.userId}-${this.subscribeKey}${auth ? `-${auth}` : ''}`;
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Helpers ------------------------
  // --------------------------------------------------------
  // region Helpers

  /**
   * Serialize request for easier representation in logs.
   *
   * @returns Stringified `heartbeat` request.
   */
  toString() {
    return `HeartbeatRequest { channels: [${
      this.channels.length ? this.channels.map((channel) => `'${channel}'`).join(', ') : ''
    }], channelGroups: [${
      this.channelGroups.length ? this.channelGroups.map((group) => `'${group}'`).join(', ') : ''
    }] }`;
  }

  /**
   * Serialize request to "typed" JSON string.
   *
   * @returns "Typed" JSON string.
   */
  toJSON() {
    return this.toString();
  }

  /**
   * Extract list of channels for presence announcement from request URI path.
   *
   * @param request - Transport request from which should be extracted list of channels for presence announcement.
   *
   * @returns List of channel names (not percent-decoded) for which `heartbeat` has been called.
   */
  private static channelsFromRequest(request: TransportRequest): string[] {
    const channels = request.path.split('/')[6];
    return channels === ',' ? [] : channels.split(',').filter((name) => name.length > 0);
  }

  /**
   * Extract list of channel groups for presence announcement from request query.
   *
   * @param request - Transport request from which should be extracted list of channel groups for presence announcement.
   *
   * @returns List of channel group names (not percent-decoded) for which `heartbeat` has been called.
   */
  private static channelGroupsFromRequest(request: TransportRequest): string[] {
    if (!request.queryParameters || !request.queryParameters['channel-group']) return [];
    const group = request.queryParameters['channel-group'] as string;
    return group.length === 0 ? [] : group.split(',').filter((name) => name.length > 0);
  }
  // endregion
}
