/** @flow */

import type { EndpointConfig } from '../endpoint';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

export type RevokeTokenParams = string;

export type RevokeTokenResult = {|
  status: 200,
  data: string
|}

const endpoint: EndpointConfig<RevokeTokenParams, RevokeTokenResult> = {
  getOperation: () => operationConstants.PNAccessManagerRevokeToken,

  validateParams: (modules, token) => {
    const { secretKey } = modules.config;
    if (!secretKey) {
      return 'Missing Secret Key';
    }

    if (!token) {
      return "token can't be empty";
    }
  },

  getURL: ({ config }, token) => `/v3/pam/${config.subscribeKey}/grant/${utils.encodeString(token)}`,
  useDelete: () => true,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => false,

  prepareParams: ({ config }) => ({
    uuid: config.getUUID(),
  }),

  handleResponse: (_, response) => ({
    status: response.status,
    data: response.data,
  }),
};

export default endpoint;
