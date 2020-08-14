/** @flow */

import type { EndpointConfig } from '../endpoint';
import operationConstants from '../../constants/operations';
import type { ListFilesParams, ListFilesResult } from './types';

const endpoint: EndpointConfig<ListFilesParams, ListFilesResult> = {
  getOperation: () => operationConstants.PNListFilesOperation,

  validateParams: (_, params) => {
    if (!params?.channel) {
      return 'channel can\'t be empty';
    }
  },

  getURL: ({ config }, params) => `/v1/files/${config.subscribeKey}/channels/${params.channel}/files`,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  getAuthToken: ({ tokenManager }) => tokenManager.getToken('fileUpload'),

  prepareParams: (_, params) => {
    const outParams = {};

    if (params.limit) {
      outParams.limit = params.limit;
    }

    if (params.next) {
      outParams.next = params.next;
    }

    return outParams;
  },

  handleResponse: (_, response): ListFilesResult => ({
    status: response.status,
    data: response.data,
    next: response.next,
    count: response.count,
  }),
};

export default endpoint;
