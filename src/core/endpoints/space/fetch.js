import operationConstants from '../../constants/operations';

import utils from '../../utils';

const endpoint = {
  getOperation: () => operationConstants.PNFetchSpaceOperation,

  validateParams: (_, params) => {
    if (!params?.spaceId) {
      return 'spaceId cannot be empty';
    }
  },

  getURL: ({ config }, params) => `/v3/objects/${config.subscribeKey}/spaces/${utils.encodeString(params.spaceId)}`,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  prepareParams: () => ({}),

  handleResponse: (_, response) => ({
    status: response.status,
    data: response.data,
  }),
};

export default endpoint;
