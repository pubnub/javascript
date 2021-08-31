/** @flow */

import type { EndpointConfig } from '../endpoint';
import operationConstants from '../../constants/operations';
import type { DeleteFileParams, DeleteFileResult } from './types';
import utils from '../../utils';

const endpoint: EndpointConfig<DeleteFileParams, DeleteFileResult> = {
  getOperation: () => operationConstants.PNListFilesOperation,

  validateParams: (_, params) => {
    if (!params?.channel) {
      return "channel can't be empty";
    }

    if (!params?.id) {
      return "file id can't be empty";
    }

    if (!params?.name) {
      return "file name can't be empty";
    }
  },

  useDelete: () => true,
  getURL: ({ config }, params) => `/v1/files/${config.subscribeKey}/channels/${utils.encodeString(params.channel)}/files/${params.id}/${params.name}`,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  prepareParams: () => ({}),

  handleResponse: (_, response): DeleteFileResult => ({
    status: response.status,
  }),
};

export default endpoint;
