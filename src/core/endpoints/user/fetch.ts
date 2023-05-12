import { Endpoint } from '../../components/_endpoint';
import operationConstants from '../../constants/operations';

import utils from '../../utils';

const endpoint: Endpoint<{ userId?: string }, { status: number; data: any }> = {
  getOperation: () => operationConstants.PNFetchUserOperation,

  validateParams: () => {
    // No required parameters.
  },

  getURL: ({ config }, params) =>
    `/v3/objects/${config.subscribeKey}/users/${utils.encodeString(params?.userId ?? config.getUserId())}`,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  prepareParams: ({ config }, params) => {
    const queryParams = { uuid: params?.userId ?? config.getUserId() };

    return queryParams;
  },

  handleResponse: (_, response) => ({
    status: response.status,
    data: response.data,
  }),
};

export default endpoint;
