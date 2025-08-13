import { TransportMethod, TransportRequest } from '../../../core/types/transport-request';
import uuidGenerator from '../../../core/components/uuid';
import { Query } from '../../../core/types/api';
import { LeaveRequest } from './leave-request';
import { PubNubClient } from './pubnub-client';

/**
 * Create service `leave` request for a specific PubNub client with channels and groups for removal.
 *
 * @param client - Reference to the PubNub client whose credentials should be used for new request.
 * @param channels - List of channels that are not used by any other clients and can be left.
 * @param channelGroups - List of channel groups that are not used by any other clients and can be left.
 * @returns Service `leave` request.
 */
export const leaveRequest = (client: PubNubClient, channels: string[], channelGroups: string[]) => {
  channels = channels
    .filter((channel) => !channel.endsWith('-pnpres'))
    .map((channel) => encodeString(channel))
    .sort();
  channelGroups = channelGroups
    .filter((channelGroup) => !channelGroup.endsWith('-pnpres'))
    .map((channelGroup) => encodeString(channelGroup))
    .sort();

  if (channels.length === 0 && channelGroups.length === 0) return undefined;

  const channelGroupsString: string | undefined = channelGroups.length > 0 ? channelGroups.join(',') : undefined;
  const channelsString = channels.length === 0 ? ',' : channels.join(',');

  const query: Query = {
    instanceid: client.identifier,
    uuid: client.userId,
    requestid: uuidGenerator.createUUID(),
    ...(client.accessToken ? { auth: client.accessToken.toString() } : {}),
    ...(channelGroupsString ? { 'channel-group': channelGroupsString } : {}),
  };

  const transportRequest: TransportRequest = {
    origin: client.origin,
    path: `/v2/presence/sub-key/${client.subKey}/channel/${channelsString}/leave`,
    queryParameters: query,
    method: TransportMethod.GET,
    headers: {},
    timeout: 10,
    cancellable: false,
    compressible: false,
    identifier: query.requestid as string,
  };

  return LeaveRequest.fromTransportRequest(transportRequest, client.subKey, client.accessToken);
};

/**
 * Stringify request query key/value pairs.
 *
 * @param query - Request query object.
 * @returns Stringified query object.
 */
export const queryStringFromObject = (query: Query) => {
  return Object.keys(query)
    .map((key) => {
      const queryValue = query[key];
      if (!Array.isArray(queryValue)) return `${key}=${encodeString(queryValue)}`;

      return queryValue.map((value) => `${key}=${encodeString(value)}`).join('&');
    })
    .join('&');
};

/**
 * Percent-encode input string.
 *
 * **Note:** Encode content in accordance of the `PubNub` service requirements.
 *
 * @param input - Source string or number for encoding.
 * @returns Percent-encoded string.
 */
export const encodeString = (input: string | number) => {
  return encodeURIComponent(input).replace(/[!~*'()]/g, (x) => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
};
