import operationConstants from '../../constants/operations';

import utils from '../../utils';

const endpoint = {
  getOperation: () => operationConstants.PNRemoveUserOperation,

  validateParams: () => {
    // No required parameters.
  },

  getURL: ({ config }, params) =>
    `/v3/objects/${config.subscribeKey}/uuids/${utils.encodeString(params?.userId ?? config.getUserId())}`,

  useDelete: () => true,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  prepareParams: ({ config }, params) => ({
    uuid: params?.userId ?? config.getUserId(),
  }),

  handleResponse: (_, response) => ({
    status: response.status,
    data: response.data,
  }),
};

export default endpoint;
