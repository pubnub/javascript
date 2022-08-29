import operationConstants from '../../constants/operations';

import utils from '../../utils';

const endpoint = {
  getOperation: () => operationConstants.PNCreateSpaceOperation,

  validateParams: (_, params) => {
    if (!params?.spaceId) {
      return 'spaceId cannot be empty';
    }

    if (!params?.data) {
      return 'Space data cannot be empty';
    }
  },

  usePost: () => true,

  postURL: ({ config }, params) => `/v3/objects/${config.subscribeKey}/spaces/${utils.encodeString(params.spaceId)}`,

  postPayload: (_, params) => params.data,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  prepareParams: () => ({}),

  handleResponse: (_, response) => ({
    status: response.status,
    data: response.data,
  }),
};

export default endpoint;
