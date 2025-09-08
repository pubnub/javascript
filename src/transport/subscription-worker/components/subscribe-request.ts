import { TransportRequest } from '../../../core/types/transport-request';
import uuidGenerator from '../../../core/components/uuid';
import { Payload } from '../../../core/types/api';
import { BasePubNubRequest } from './request';
import { AccessToken } from './access-token';

export class SubscribeRequest extends BasePubNubRequest {
  // --------------------------------------------------------
  // ---------------------- Information ---------------------
  // --------------------------------------------------------
  // region Information

  /**
   * Global subscription request creation date tracking.
   *
   * Tracking is required to handle about rapid requests receive and need to know which of them were earlier.
   */
  private static lastCreationDate = 0;

  /**
   * Presence state associated with `userID` on {@link SubscribeRequest.channels|channels} and
   * {@link SubscribeRequest.channelGroups|channelGroups}.
   */
  readonly state: Record<string, Payload> | undefined;

  /**
   * Request creation timestamp.
   */
  private readonly _creationDate = Date.now();

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
  private _timetoken: string;

  /**
   * Subscription loop timetoken's region.
   */
  private _region?: string;

  /**
   * Whether request requires client's cached subscription state reset or not.
   */
  private _requireCachedStateReset: boolean;

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
   * {@link SubscribeRequest.channels|channels} and {@link SubscribeRequest.channelGroups|channelGroups}.
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
      cachedChannelGroups,
      cachedChannels,
      cachedState,
    );
  }

  /**
   * Create aggregated subscribe request.
   *
   * @param requests - List of subscribe requests for same the user.
   * @param [accessToken] - Access token with permissions to announce presence on
   * {@link SubscribeRequest.channels|channels} and {@link SubscribeRequest.channelGroups|channelGroups}.
   * @param timetokenOverride - Timetoken which should be used to patch timetoken in initial response.
   * @param timetokenRegionOverride - Timetoken origin which should be used to patch timetoken origin in initial
   * response.
   * @param [cachedState] - Previously cached user's presence state for channels and groups.
   * @returns Aggregated subscribe request which will be sent.
   */
  static fromRequests(
    requests: SubscribeRequest[],
    accessToken?: AccessToken,
    timetokenOverride?: string,
    timetokenRegionOverride?: string,
    cachedState?: Record<string, Payload>,
  ) {
    const baseRequest = requests[Math.floor(Math.random() * requests.length)];
    const isInitialSubscribe = (baseRequest.request.queryParameters!.tt ?? '0') === '0';
    const state: Record<string, Payload> = isInitialSubscribe ? (cachedState ?? {}) : {};
    const aggregatedRequest = { ...baseRequest.request };
    const channelGroups = new Set<string>();
    const channels = new Set<string>();

    for (const request of requests) {
      if (isInitialSubscribe && !cachedState && request.state) Object.assign(state, request.state);
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
    const request = new SubscribeRequest(
      aggregatedRequest,
      baseRequest.subscribeKey,
      accessToken,
      [...channelGroups],
      [...channels],
      state,
    );
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
   * @param [accessToken] - Access token with read permissions on {@link SubscribeRequest.channels|channels} and
   * {@link SubscribeRequest.channelGroups|channelGroups}.
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
    delete request.queryParameters!['on-demand'];

    super(
      request,
      subscriptionKey,
      request.queryParameters!.uuid as string,
      cachedChannels ?? SubscribeRequest.channelsFromRequest(request),
      cachedChannelGroups ?? SubscribeRequest.channelGroupsFromRequest(request),
      accessToken,
    );

    // Shift on millisecond creation timestamp for two sequential requests.
    if (this._creationDate <= SubscribeRequest.lastCreationDate) {
      SubscribeRequest.lastCreationDate++;
      this._creationDate = SubscribeRequest.lastCreationDate;
    } else SubscribeRequest.lastCreationDate = this._creationDate;

    this._requireCachedStateReset = requireCachedStateReset;

    if (request.queryParameters!['filter-expr'])
      this.filterExpression = request.queryParameters!['filter-expr'] as string;
    this._timetoken = (request.queryParameters!.tt ?? '0') as string;
    if (this._timetoken === '0') {
      delete request.queryParameters!.tt;
      delete request.queryParameters!.tr;
    }
    if (request.queryParameters!.tr) this._region = request.queryParameters!.tr as string;
    if (cachedState) this.state = cachedState;

    // Clean up `state` from objects which is not used with request (if needed).
    if (
      this.state ||
      !request.queryParameters!.state ||
      (request.queryParameters!.state as string).length <= 2 ||
      this._timetoken !== '0'
    )
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
   * Retrieve `subscribe` request creation timestamp.
   *
   * @returns `Subscribe` request creation timestamp.
   */
  get creationDate() {
    return this._creationDate;
  }

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
    return this._timetoken === '0';
  }

  /**
   * Retrieve subscription loop timetoken.
   *
   * @returns Subscription loop timetoken.
   */
  get timetoken() {
    return this._timetoken;
  }

  /**
   * Update subscription loop timetoken.
   *
   * @param value - New timetoken that should be used in PubNub REST API calls.
   */
  set timetoken(value: string) {
    this._timetoken = value;

    // Update value for transport request object.
    this.request.queryParameters!.tt = value;
  }

  /**
   * Retrieve subscription loop timetoken's region.
   *
   * @returns Subscription loop timetoken's region.
   */
  get region() {
    return this._region;
  }

  /**
   * Update subscription loop timetoken's region.
   *
   * @param value - New timetoken's region that should be used in PubNub REST API calls.
   */
  set region(value: string | undefined) {
    this._region = value;

    // Update value for transport request object.
    if (value) this.request.queryParameters!.tr = value;
    else delete this.request.queryParameters!.tr;
  }

  /**
   * Retrieve whether the request requires the client's cached subscription state reset or not.
   *
   * @returns `true` if a subscribe request has been created on user request (`subscribe()` call) or not.
   */
  get requireCachedStateReset() {
    return this._requireCachedStateReset;
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
    return !!request.queryParameters && !('on-demand' in request.queryParameters);
  }

  /**
   * Reset the inner state of the `subscribe` request object to the one that `initial` requests.
   */
  resetToInitialRequest() {
    this._requireCachedStateReset = true;
    this._timetoken = '0';
    this._region = undefined;

    delete this.request.queryParameters!.tt;
  }

  /**
   * Check whether received is a subset of another `subscribe` request.
   *
   * If the receiver is a subset of another means:
   * - list of channels of another `subscribe` request includes all channels from the receiver,
   * - list of channel groups of another `subscribe` request includes all channel groups from the receiver,
   * - receiver's timetoken equal to `0` or another request `timetoken`.
   *
   * @param request - Request that should be checked to be a superset of received.
   * @retuns `true` in case if the receiver is a subset of another `subscribe` request.
   */
  isSubsetOf(request: SubscribeRequest): boolean {
    if (request.channelGroups.length && !this.includesStrings(request.channelGroups, this.channelGroups)) return false;
    if (request.channels.length && !this.includesStrings(request.channels, this.channels)) return false;

    return this.timetoken === '0' || this.timetoken === request.timetoken || request.timetoken === '0';
  }

  /**
   * Serialize request for easier representation in logs.
   *
   * @returns Stringified `subscribe` request.
   */
  toString() {
    return `SubscribeRequest { clientIdentifier: ${
      this.client ? this.client.identifier : 'service request'
    }, requestIdentifier: ${this.identifier}, serviceRequestIdentified: ${
      this.client ? (this.serviceRequest ? this.serviceRequest.identifier : "'not set'") : "'is service request"
    }, channels: [${
      this.channels.length ? this.channels.map((channel) => `'${channel}'`).join(', ') : ''
    }], channelGroups: [${
      this.channelGroups.length ? this.channelGroups.map((group) => `'${group}'`).join(', ') : ''
    }], timetoken: ${this.timetoken}, region: ${this.region}, reset: ${
      this._requireCachedStateReset ? "'reset'" : "'do not reset'"
    } }`;
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
