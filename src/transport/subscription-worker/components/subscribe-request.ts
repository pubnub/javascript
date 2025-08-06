import { TransportRequest } from '../../../core/types/transport-request';
import uuidGenerator from '../../../core/components/uuid';
import { PubNubSharedWorkerRequest } from './request';
import { Payload } from '../../../core/types/api';
import { AccessToken } from './access-token';

export class SubscribeRequest extends PubNubSharedWorkerRequest {
  // --------------------------------------------------------
  // ---------------------- Information ---------------------
  // --------------------------------------------------------
  // region Information

  /**
   * Presence state associated with `userID` on {@link PubNubSharedWorkerRequest.channels|channels} and
   * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups}.
   */
  readonly state: Record<string, Payload> | undefined;

  /**
   * Request creation timestamp.
   */
  readonly creationDate = Date.now();

  /**
   * Timetoken region which should be used to patch timetoken origin in initial response.
   */
  public timetokenRegionOverride: string = '0';

  /**
   * Timetoken which should be used to patch timetoken in initial response.
   */
  public timetokenOverride?: string;

  /**
   * Subscription loop timetoken.
   */
  readonly timetoken: string;

  /**
   * Subscription loop timetoken's region.
   */
  readonly region?: string;

  /**
   * Whether request requires client's cached subscription state reset or not.
   */
  readonly requireCachedStateReset: boolean;

  /**
   * Real-time events filtering expression.
   */
  private readonly filterExpression?: string;
  // endregion

  // --------------------------------------------------------
  // --------------------- Constructors ---------------------
  // --------------------------------------------------------
  // region Constructors

  /**
   * Create subscribe request from received _transparent_ transport request.
   *
   * @param request - Object with subscribe transport request.
   * @param subscriptionKey - Subscribe REST API access key.
   * @param [accessToken] - Access token with read permissions on
   * {@link PubNubSharedWorkerRequest.channels|channels} and
   * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups}.
   * @returns Initialized and ready to use subscribe request.
   */
  static fromTransportRequest(request: TransportRequest, subscriptionKey: string, accessToken?: AccessToken) {
    return new SubscribeRequest(request, subscriptionKey, accessToken);
  }

  /**
   * Create subscribe request from previously cached data.
   *
   * @param request - Object with subscribe transport request.
   * @param subscriptionKey - Subscribe REST API access key.
   * @param [cachedChannelGroups] - Previously cached list of channel groups for subscription.
   * @param [cachedChannels] - Previously cached list of channels for subscription.
   * @param [cachedState] - Previously cached user's presence state for channels and groups.
   * @param [accessToken] - Access token with read permissions on
   * {@link PubNubSharedWorkerRequest.channels|channels} and
   * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups}.
   * @retusns Initialized and ready to use subscribe request.
   */
  static fromCachedState(
    request: TransportRequest,
    subscriptionKey: string,
    cachedChannelGroups: string[],
    cachedChannels: string[],
    cachedState?: Record<string, Payload>,
    accessToken?: AccessToken,
  ): SubscribeRequest {
    return new SubscribeRequest(
      request,
      subscriptionKey,
      accessToken,
      cachedChannels,
      cachedChannelGroups,
      cachedState,
    );
  }

  /**
   * Create aggregated subscribe request.
   *
   * @param requests - List of subscribe requests for same the user.
   * @param [accessToken] - Access token with permissions to announce presence on
   * {@link PubNubSharedWorkerRequest.channels|channels} and
   * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups}.
   * @param timetokenOverride - Timetoken which should be used to patch timetoken in initial response.
   * @param timetokenRegionOverride - Timetoken origin which should be used to patch timetoken origin in initial
   * response.
   * @returns Aggregated subscribe request which will be sent.
   */
  static fromRequests(
    requests: SubscribeRequest[],
    accessToken?: AccessToken,
    timetokenOverride?: string,
    timetokenRegionOverride?: string,
  ) {
    const baseRequest = requests[Math.floor(Math.random() * requests.length)];
    const aggregatedRequest = { ...baseRequest.request };
    let state: Record<string, Payload> = {};
    const channelGroups = new Set<string>();
    const channels = new Set<string>();

    for (const request of requests) {
      if (request.state) state = { ...state, ...request.state };
      request.channelGroups.forEach(channelGroups.add, channelGroups);
      request.channels.forEach(channels.add, channels);
    }

    // Update request channels list (if required).
    if (channels.size || channelGroups.size) {
      const pathComponents = aggregatedRequest.path.split('/');
      pathComponents[4] = channels.size ? [...channels].sort().join(',') : ',';
      aggregatedRequest.path = pathComponents.join('/');
    }

    // Update request channel groups list (if required).
    if (channelGroups.size) aggregatedRequest.queryParameters!['channel-group'] = [...channelGroups].sort().join(',');

    // Update request `state` (if required).
    if (Object.keys(state).length) aggregatedRequest.queryParameters!.state = JSON.stringify(state);
    else delete aggregatedRequest.queryParameters!.state;

    if (accessToken) aggregatedRequest.queryParameters!.auth = accessToken.toString();
    aggregatedRequest.identifier = uuidGenerator.createUUID();

    // Create service request and link to its result other requests used in aggregation.
    const request = new SubscribeRequest(aggregatedRequest, baseRequest.subscribeKey, accessToken);
    for (const clientRequest of requests) clientRequest.serviceRequest = request;

    if (request.isInitialSubscribe && timetokenOverride && timetokenOverride !== '0') {
      request.timetokenOverride = timetokenOverride;
      if (timetokenRegionOverride) request.timetokenRegionOverride = timetokenRegionOverride;
    }

    return request;
  }

  /**
   * Create subscribe request from received _transparent_ transport request.
   *
   * @param request - Object with subscribe transport request.
   * @param subscriptionKey - Subscribe REST API access key.
   * @param [accessToken] - Access token with read permissions on
   * {@link PubNubSharedWorkerRequest.channels|channels} and
   * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups}.
   * @param [cachedChannels] - Previously cached list of channels for subscription.
   * @param [cachedChannelGroups] - Previously cached list of channel groups for subscription.
   * @param [cachedState] - Previously cached user's presence state for channels and groups.
   */
  private constructor(
    request: TransportRequest,
    subscriptionKey: string,
    accessToken?: AccessToken,
    cachedChannelGroups?: string[],
    cachedChannels?: string[],
    cachedState?: Record<string, Payload>,
  ) {
    // Retrieve information about request's origin (who initiated it).
    const requireCachedStateReset = !!request.queryParameters && 'on-demand' in request.queryParameters;
    if (requireCachedStateReset) delete request.queryParameters!['on-demand'];

    super(
      request,
      subscriptionKey,
      cachedChannelGroups ?? SubscribeRequest.channelGroupsFromRequest(request),
      cachedChannels ?? SubscribeRequest.channelsFromRequest(request),
      request.queryParameters!.uuid as string,
      accessToken,
    );

    this.requireCachedStateReset = requireCachedStateReset;

    if (request.queryParameters!['filter-expr'])
      this.filterExpression = request.queryParameters!['filter-expr'] as string;
    this.timetoken = (request.queryParameters!.tt ?? '0') as string;
    if (request.queryParameters!.tr) this.region = request.queryParameters!.tr as string;
    if (cachedState) this.state = cachedState;

    // Clean up `state` from objects which is not used with request (if needed).
    if (this.state || !request.queryParameters!.state || (request.queryParameters!.state as string).length === 0)
      return;

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
   * Represent subscribe request as identifier.
   *
   * Generated identifier will be identical for requests created for the same user.
   */
  get asIdentifier() {
    const auth = this.accessToken ? this.accessToken.asIdentifier : undefined;
    const id = `${this.userId}-${this.subscribeKey}${auth ? `-${auth}` : ''}`;
    return this.filterExpression ? `${id}-${this.filterExpression}` : id;
  }

  /**
   * Retrieve whether this is initial subscribe request or not.
   *
   * @returns `true` if subscribe REST API called with missing or `tt=0` query parameter.
   */
  get isInitialSubscribe() {
    return this.timetoken === '0';
  }
  // endregion

  // --------------------------------------------------------
  // ----------------------- Helpers ------------------------
  // --------------------------------------------------------
  // region Helpers

  /**
   * Check whether client's subscription state cache can be used for new request or not.
   *
   * @param request - Transport request from the core PubNub client module with request origin information.
   * @returns `true` if request created not by user (subscription loop).
   */
  static useCachedState(request: TransportRequest) {
    return !!request.queryParameters && 'on-demand' in request.queryParameters;
  }

  /**
   * Check whether received is subset of another `subscribe` request.
   *
   * @param request - Request which should be checked to be superset for received.
   * @retuns `true` in case if receiver is subset of another `subscribe` request.
   */
  isSubsetOf(request: SubscribeRequest): boolean {
    if (request.channelGroups.length && !this.includesStrings(this.channelGroups, request.channelGroups)) return false;
    if (request.channels.length && !this.includesStrings(this.channels, request.channels)) return false;

    return this.filterExpression === request.filterExpression;
  }

  /**
   * Extract list of channels for subscription from request URI path.
   *
   * @param request - Transport request from which should be extracted list of channels for presence announcement.
   *
   * @returns List of channel names (not percent-decoded) for which `subscribe` has been called.
   */
  private static channelsFromRequest(request: TransportRequest): string[] {
    const channels = request.path.split('/')[4];
    return channels === ',' ? [] : channels.split(',').filter((name) => name.length > 0);
  }

  /**
   * Extract list of channel groups for subscription from request query.
   *
   * @param request - Transport request from which should be extracted list of channel groups for presence announcement.
   *
   * @returns List of channel group names (not percent-decoded) for which `subscribe` has been called.
   */
  private static channelGroupsFromRequest(request: TransportRequest): string[] {
    if (!request.queryParameters || !request.queryParameters['channel-group']) return [];
    const group = request.queryParameters['channel-group'] as string;
    return group.length === 0 ? [] : group.split(',').filter((name) => name.length > 0);
  }

  /**
   * Check whether {@link main} array contains all entries from {@link sub} array.
   *
   * @param main - Main array with which `intersection` with {@link sub} should be checked.
   * @param sub - Sub-array whose values should be checked in {@link main}.
   *
   * @returns `true` if all entries from {@link sub} is present in {@link main}.
   */
  private includesStrings(main: string[], sub: string[]) {
    const set = new Set(main);
    return sub.every(set.has, set);
  }
  // endregion
}
