/**
 * Set Presence State REST API module.
 */

import { createValidationError, PubNubError } from '../../../errors/pubnub-error';
import { TransportResponse } from '../../types/transport-response';
import { PubNubAPIError } from '../../../errors/pubnub-api-error';
import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import { KeySet, Payload, Query } from '../../types/api';
import { encodeNames, encodeString } from '../../utils';
import * as Presence from '../../types/api/presence';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = Presence.SetPresenceStateParameters & {
  /**
   * The subscriber uuid to associate state with.
   */
  uuid: string;

  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;
};

/**
 * Service success response.
 */
type ServiceResponse = {
  /**
   * Request result status code.
   */
  status: number;

  /**
   * Set presence state human-readable result.
   */
  message: string;

  /**
   * Name of the service which provided response.
   */
  service: string;

  /**
   * Associated presence state.
   */
  payload: Payload;
};
// endregion

/**
 * Set `uuid` presence state request.
 *
 * @internal
 */
export class SetPresenceStateRequest extends AbstractRequest<Presence.SetPresenceStateResponse> {
  constructor(private readonly parameters: RequestParameters) {
    super();
  }

  operation(): RequestOperation {
    return RequestOperation.PNSetStateOperation;
  }

  validate(): string | undefined {
    const {
      keySet: { subscribeKey },
      state,
      channels = [],
      channelGroups = [],
    } = this.parameters;

    if (!subscribeKey) return 'Missing Subscribe Key';
    if (!state) return 'Missing State';
    if (channels?.length === 0 && channelGroups?.length === 0)
      return 'Please provide a list of channels and/or channel-groups';
  }

  async parse(response: TransportResponse): Promise<Presence.SetPresenceStateResponse> {
    const serviceResponse = this.deserializeResponse<ServiceResponse>(response);

    if (!serviceResponse) {
      throw new PubNubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );
    } else if (serviceResponse.status >= 400) throw PubNubAPIError.create(response);

    return { state: serviceResponse.payload };
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      uuid,
      channels,
    } = this.parameters;
    return `/v2/presence/sub-key/${subscribeKey}/channel/${encodeNames(
      channels ?? [],
      ',',
    )}/uuid/${encodeString(uuid)}/data`;
  }

  protected get queryParameters(): Query {
    const { channelGroups, state } = this.parameters;
    const query: Query = { state: JSON.stringify(state) };

    if (channelGroups && channelGroups.length !== 0) query['channel-group'] = channelGroups.join(',');

    return query;
  }
}
