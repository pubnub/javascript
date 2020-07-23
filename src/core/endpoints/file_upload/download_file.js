/** @flow */

import type { EndpointConfig } from '../endpoint';
import operationConstants from '../../constants/operations';
import type { DownloadFileParams, DownloadFileResult } from './types';

const endpoint: EndpointConfig<DownloadFileParams, DownloadFileResult> = {
  getOperation: () => operationConstants.PNDownloadFileOperation,

  validateParams: (_, params) => {
    if (!params?.channel) {
      return "channel can't be empty";
    }

    if (!params?.name) {
      return "name can't be empty";
    }

    if (!params?.id) {
      return "id can't be empty";
    }
  },

  getURL: ({ config }, params) => `/v1/files/${config.subscribeKey}/channels/${params.channel}/files/${params.id}/${params.name}`,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,
  ignoreBody: () => true,

  getAuthToken: ({ tokenManager }) => tokenManager.getToken('fileUpload'),

  prepareParams: () => ({}),

  handleResponse: ({ getFile }, response, params): DownloadFileResult => getFile().create({
    stream: response.response.res,
    name: params.name,
    mimeType: response.headers['content-type'],
    response: response.response,
  }),
};

export default endpoint;
