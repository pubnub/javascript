import RequestOperation from '../../constants/operations';
import { BaseSubscribeRequest } from '../subscribe';
import { encodeNames } from '../../utils';
export class HandshakeSubscribeRequest extends BaseSubscribeRequest {
    operation() {
        return RequestOperation.PNHandshakeOperation;
    }
    get path() {
        const { keySet: { subscribeKey }, channels = [], } = this.parameters;
        return `/v2/subscribe/${subscribeKey}/${encodeNames(channels.sort(), ',')}/0`;
    }
    get queryParameters() {
        const { channelGroups, filterExpression, state } = this.parameters;
        const query = { tt: 0, ee: '' };
        if (channelGroups && channelGroups.length > 0)
            query['channel-group'] = channelGroups.sort().join(',');
        if (filterExpression && filterExpression.length > 0)
            query['filter-expr'] = filterExpression;
        if (state && Object.keys(state).length > 0)
            query['state'] = JSON.stringify(state);
        return query;
    }
}
