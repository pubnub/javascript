/** @flow */

import type { EndpointConfig } from '../../endpoint';
import operationConstants from '../../../constants/operations';
import type { ChannelMetadata } from './channel';
import utils from '../../../utils';

export type SetChannelMetadataParams = {|
  channel: string,
  include?: {|
    customFields: ?boolean,
  |},
  data: $Shape<ChannelMetadata>,
|};

export type SetChannelMetadataResult = {|
  status: 200,
  data: ChannelMetadata,
|};

const endpoint: EndpointConfig<SetChannelMetadataParams, SetChannelMetadataResult> = {
  getOperation: () => operationConstants.PNSetChannelMetadataOperation,

  validateParams: (_, params) => {
    if (!params?.channel) {
      return 'Channel cannot be empty';
    }

    if (!params?.data) {
      return 'Data cannot be empty';
    }
  },

  usePatch: () => true,

  patchURL: ({ config }, params) => `/v2/objects/${config.subscribeKey}/channels/${utils.encodeString(params.channel)}`,

  patchPayload: (_, params) => params.data,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  prepareParams: (_, params) => ({
    include: (params?.include?.customFields ?? true) && 'custom',
  }),

  handleResponse: (_, response) => ({
    status: response.status,
    data: response.data,
  }),
};

export default endpoint;
