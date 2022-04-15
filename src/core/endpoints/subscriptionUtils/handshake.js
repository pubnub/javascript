import operationConstants from '../../constants/operations';
import utils from '../../utils';

const endpoint = {
  getOperation: () => operationConstants.PNHandshakeOperation,

  validateParams: (_, params) => {
    if (!params?.channels && !params?.channelGroups) {
      return 'channels and channleGroups both should not be empty';
    }
  },

  getURL: ({ config }, params) => {
    const channelsString = params.channels ? params.channels.join(',') : ',';
    return `/v2/subscribe/${config.subscribeKey}/${utils.encodeString(channelsString)}/0`;
  },

  getRequestTimeout: ({ config }) => config.getSubscribeTimeout(),

  isAuthSupported: () => true,

  prepareParams: (_, params) => {
    const outParams = {};
    if (params.channelGroups && params.channelGroups.length > 0) {
      outParams['channel-group'] = params.channelGroups.join(',');
    }
    outParams.tt = 0;
    return outParams;
  },

  handleResponse: (_, response) => ({
    region: response.t.r,
    timetoken: response.t.t,
  }),
};

export default endpoint;
