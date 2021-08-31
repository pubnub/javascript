/** @flow */

import type { EndpointConfig } from '../endpoint';
import operationConstants from '../../constants/operations';
import type { GenerateUploadUrlParams, GenerateUploadUrlResult } from './types';
import utils from '../../utils';

const endpoint: EndpointConfig<GenerateUploadUrlParams, GenerateUploadUrlResult> = {
  getOperation: () => operationConstants.PNGenerateUploadUrlOperation,

  validateParams: (_, params) => {
    if (!params?.channel) {
      return 'channel can\'t be empty';
    }

    if (!params?.name) {
      return 'name can\'t be empty';
    }
  },

  usePost: () => true,
  postURL: ({ config }, params) => `/v1/files/${config.subscribeKey}/channels/${utils.encodeString(params.channel)}/generate-upload-url`,

  postPayload: (_, params) => ({
    name: params.name
  }),

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  prepareParams: () => ({}),

  handleResponse: (_, response): GenerateUploadUrlResult => ({
    status: response.status,
    data: response.data,
    file_upload_request: response.file_upload_request,
  }),
};

export default endpoint;
