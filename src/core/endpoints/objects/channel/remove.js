/** @flow */

import type { EndpointConfig } from '../../endpoint';
import operationConstants from '../../../constants/operations';
import type { ChannelMetadata } from './channel';

export type RemoveChannelMetadataParams = {|
  channel: string,
|};

export type RemoveChannelMetadataResult = {|
  status: 200,
  data: ChannelMetadata,
|};

const endpoint: EndpointConfig<RemoveChannelMetadataParams, RemoveChannelMetadataResult> = {
  getOperation: () => operationConstants.PNRemoveChannelMetadataOperation,

  validateParams: (_, params) => {
    if (!params?.channel) {
      return 'Channel cannot be empty';
    }
  },

  getURL: ({ config }, params) => `/v2/objects/${config.subscribeKey}/channels/${params.channel}`,
  useDelete: () => true,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  getAuthToken: ({ tokenManager }) => tokenManager.getToken('channel'),

  prepareParams: () => ({}),

  handleResponse: (_, response) => ({
    status: response.status,
    data: response.data,
  }),
};

export default endpoint;
