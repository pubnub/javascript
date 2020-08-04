/** @flow */

import type { EndpointConfig } from '../../endpoint';
import operationConstants from '../../../constants/operations';
import type { ChannelMetadata } from './channel';

export type GetChannelMetadataParams = {|
  channel: string,
  include?: {|
    customFields: ?boolean,
  |},
|};

export type GetChannelMetadataResult = {|
  status: 200,
  data: ChannelMetadata,
|};

const endpoint: EndpointConfig<GetChannelMetadataParams, GetChannelMetadataResult> = {
  getOperation: () => operationConstants.PNGetChannelMetadataOperation,

  // No required parameters.
  validateParams: (_, params) => {
    if (!params?.channel) {
      return 'Channel cannot be empty';
    }
  },

  getURL: ({ config }, params) => `/v2/objects/${config.subscribeKey}/channels/${params.channel}`,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  getAuthToken: ({ tokenManager }) => tokenManager.getToken('channel'),

  prepareParams: (_, params) => ({
    include: (params?.include?.customFields ?? true) && 'custom',
  }),

  handleResponse: (_, response) => ({
    status: response.status,
    data: response.data,
  }),
};

export default endpoint;
