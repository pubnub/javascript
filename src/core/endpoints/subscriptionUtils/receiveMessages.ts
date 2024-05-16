/**
 * Receive messages subscribe REST API module.
 */

import RequestOperation from '../../constants/operations';
import { BaseSubscribeRequest } from '../subscribe';
import { encodeNames } from '../../utils';
import { Query } from '../../types/api';

/**
 * Receive messages subscribe request.
 *
 * @internal
 */
export class ReceiveMessagesSubscribeRequest extends BaseSubscribeRequest {
  operation(): RequestOperation {
    return RequestOperation.PNReceiveMessagesOperation;
  }

  validate(): string | undefined {
    const validationResult = super.validate();

    if (validationResult) return validationResult;
    if (!this.parameters.timetoken) return 'timetoken can not be empty';
    if (!this.parameters.region) return 'region can not be empty';
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      channels = [],
    } = this.parameters;

    return `/v2/subscribe/${subscribeKey}/${encodeNames(channels.sort(), ',')}/0`;
  }

  protected get queryParameters(): Query {
    const { channelGroups, filterExpression, timetoken, region } = this.parameters;
    const query: Query = { ee: '' };

    if (channelGroups && channelGroups.length > 0) query['channel-group'] = channelGroups.sort().join(',');
    if (filterExpression && filterExpression.length > 0) query['filter-expr'] = filterExpression;
    if (typeof timetoken === 'string') {
      if (timetoken && timetoken.length > 0) query['tt'] = timetoken;
    } else if (timetoken && timetoken > 0) query['tt'] = timetoken;
    if (region) query['tr'] = region;

    return query;
  }
}
