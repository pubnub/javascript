/** @flow */

import type { EndpointConfig, Modules } from '../endpoint';
import operationConstants from '../../constants/operations';
import type { PublishFileParams, PublishFileResult } from './types';

const preparePayload = ({ crypto, config }: Modules, payload: any): string => {
  let stringifiedPayload = JSON.stringify(payload);

  if (config.cipherKey) {
    stringifiedPayload = crypto.encrypt(stringifiedPayload);
    stringifiedPayload = JSON.stringify(stringifiedPayload);
  }

  return stringifiedPayload;
};

const endpoint: EndpointConfig<PublishFileParams, PublishFileResult> = {
  getOperation: () => operationConstants.PNPublishFileOperation,

  validateParams: (_, params) => {
    if (!params?.channel) {
      return "channel can't be empty";
    }
  },

  getURL: (modules, params) => {
    const { publishKey, subscribeKey } = modules.config;
    const payload = preparePayload(modules, params.message);

    return `/v1/files/publish-file/${publishKey}/${subscribeKey}/0/${params.channel}/0/${payload}`;
  },

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  getAuthToken: ({ tokenManager }) => tokenManager.getToken('fileUpload'),

  prepareParams: () => ({}),

  handleResponse: (_, response): PublishFileResult => ({
    timetoken: response['2'],
  }),
};

export default endpoint;
