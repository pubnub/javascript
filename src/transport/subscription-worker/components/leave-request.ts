import { TransportRequest } from '../../../core/types/transport-request';
import { PubNubSharedWorkerRequest } from './request';
import { AccessToken } from './access-token';

export class LeaveRequest extends PubNubSharedWorkerRequest {
  // --------------------------------------------------------
  // ---------------------- Information ---------------------
  // --------------------------------------------------------
  // region Information

  /**
   * Not filtered list of channel groups for which user's presence will be announced.
   */
  readonly allChannelGroups: string[];

  /**
   * Not filtered list of channels for which user's presence will be announced.
   */
  readonly allChannels: string[];
  // endregion

  // --------------------------------------------------------
  // --------------------- Constructors ---------------------
  // --------------------------------------------------------
  // region Constructors

  /**
   * Create `leave` request from received _transparent_ transport request.
   *
   * @param request - Object with heartbeat transport request.
   * @param subscriptionKey - Subscribe REST API access key.
   * @param [accessToken] - Access token with permissions to announce presence on
   * {@link PubNubSharedWorkerRequest.channels|channels} and
   * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups}.
   * @returns Initialized and ready to use `leave` request.
   */
  static fromTransportRequest(request: TransportRequest, subscriptionKey: string, accessToken?: AccessToken) {
    return new LeaveRequest(request, subscriptionKey, accessToken);
  }

  /**
   * Create `leave` request from received _transparent_ transport request.
   *
   * @param request - Object with heartbeat transport request.
   * @param subscriptionKey - Subscribe REST API access key.
   * @param [accessToken] - Access token with permissions to announce presence on
   * {@link PubNubSharedWorkerRequest.channels|channels} and
   * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups}.
   */
  private constructor(request: TransportRequest, subscriptionKey: string, accessToken?: AccessToken) {
    const allChannelGroups = LeaveRequest.channelGroupsFromRequest(request);
    const allChannels = LeaveRequest.channelsFromRequest(request);
    const channelGroups = allChannelGroups.filter((group) => !group.endsWith('-pnpres'));
    const channels = allChannels.filter((channel) => !channel.endsWith('-pnpres'));

    super(request, subscriptionKey, channelGroups, channels, request.queryParameters!.uuid as string, accessToken);

    this.allChannelGroups = allChannelGroups;
    this.allChannels = allChannels;
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Helpers ------------------------
  // --------------------------------------------------------
  // region Helpers

  /**
   * Extract list of channels for presence announcement from request URI path.
   *
   * @param request - Transport request from which should be extracted list of channels for presence announcement.
   *
   * @returns List of channel names (not percent-decoded) for which `leave` has been called.
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
   * @returns List of channel group names (not percent-decoded) for which `leave` has been called.
   */
  private static channelGroupsFromRequest(request: TransportRequest): string[] {
    if (!request.queryParameters || !request.queryParameters['channel-group']) return [];
    const group = request.queryParameters['channel-group'] as string;
    return group.length === 0 ? [] : group.split(',').filter((name) => name.length > 0);
  }
  // endregion
}
