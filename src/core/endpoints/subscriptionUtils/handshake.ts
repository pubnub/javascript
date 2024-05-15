/**
 * Handshake subscribe REST API module.
 */

import RequestOperation from '../../constants/operations';
import { BaseSubscribeRequest } from '../subscribe';
import { encodeNames } from '../../utils';
import { Query } from '../../types/api';

/**
 * Handshake subscribe request.
 *
 * Separate subscribe request required by Event Engine.
 *
 * @internal
 */
export class HandshakeSubscribeRequest extends BaseSubscribeRequest {
  operation(): RequestOperation {
    return RequestOperation.PNHandshakeOperation;
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      channels = [],
    } = this.parameters;

    return `/v2/subscribe/${subscribeKey}/${encodeNames(channels.sort(), ',')}/0`;
  }

  protected get queryParameters(): Query {
    const { channelGroups, filterExpression, state } = this.parameters;
    const query: Query = { tt: 0, ee: '' };

    if (channelGroups && channelGroups.length > 0) query['channel-group'] = channelGroups.sort().join(',');
    if (filterExpression && filterExpression.length > 0) query['filter-expr'] = filterExpression;
    if (state && Object.keys(state).length > 0) query['state'] = JSON.stringify(state);

    return query;
  }
}
