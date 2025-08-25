/**
 * Handshake subscribe REST API module.
 *
 * @internal
 */

import * as Subscription from '../../types/api/subscription';
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
    const { channelGroups, filterExpression, state, onDemand } = this
      .parameters as unknown as Subscription.CancelableSubscribeParameters;
    const query: Query = { ee: '' };

    if (onDemand) query['on-demand'] = 1;
    if (channelGroups && channelGroups.length > 0) query['channel-group'] = channelGroups.sort().join(',');
    if (filterExpression && filterExpression.length > 0) query['filter-expr'] = filterExpression;
    if (state && Object.keys(state).length > 0) query['state'] = JSON.stringify(state);

    return query;
  }
}
