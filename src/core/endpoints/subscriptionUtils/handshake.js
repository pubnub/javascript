import operationConstants from '../../constants/operations';
import utils from '../../utils';

const endpoint = {
  getOperation: () => operationConstants.PNSubscribeOperation,

  validateParams: (_, params) => {
    if (!params?.channels && !params?.channelGroups) {
      return 'channels and channleGroups both should not be empty';
    }
  },

  getURL: ({ config }, params) => {
    const { channels = [] } = params;
    const stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
    return `/v2/subscribe/${config.subscribeKey}/${utils.encodeString(stringifiedChannels)}/0`;
  },

  getRequestTimeout: ({ config }) => config.getSubscribeTimeout(),

  isAuthSupported: () => true,

  prepareParams: (_, params) => {
    const outParams = {};
    if (params.channelGroups && params.channelGroups.length > 0) {
      outParams['channel-group'] = params.channelGroups.join(',');
    }
    outParams.tt = 0;
    if (params.state) {
      outParams.state = JSON.stringify(params.state);
    }
    if (params.filterExpression && params.filterExpression.length > 0) {
      outParams['filter-expr'] = params.filterExpression;
    }
    outParams.ee = '';
    return outParams;
  },

  handleResponse: (_, response) => ({
    region: response.t.r,
    timetoken: response.t.t,
  }),
};

export default endpoint;
