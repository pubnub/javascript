/** @flow */

import type { EndpointConfig } from '../endpoint';
import operationConstants from '../../constants/operations';
import type { HandshakeParams, HandshakeResult } from './types';
import utils from '../../utils';

const endpoint: EndpointConfig<HandshakeParams, HandshakeResult> = {
  getOperation: () => operationConstants.PNHandshakeOperation,

  validateParams: (_, params) => {
    if (!params?.channels && !params?.channelGroups) {
      return 'channels and channleGroups both should not be empty';
    }
  },

  getURL: ({ config }, params) => {
    let channelsString = params.channels ? params.channels.join(',') : ',';
    return `/v2/subscribe/${config.subscribeKey}/${utils.encodeString(channelsString)}/0`;
  },

  getRequestTimeout: ({ config }) => config.getSubscribeTimeout(),

  isAuthSupported: () => true,

  prepareParams: (_, params) => {
    const outParams = {};
    if (params.channelGroups) {
      outParams['channel-group'] = params.channelGroups.join(',');
    }
    outParams.tt = 0;
    return outParams;
  },

  handleResponse: (_, response): HandshakeResult => ({
    region: response.t.r,
    timetoken: response.t.t
  })
};

export default endpoint;
