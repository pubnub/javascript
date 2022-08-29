import operationConstants from '../../constants/operations';

import utils from '../../utils';

const endpoint = {
  getOperation: () => operationConstants.PNUpdateSpaceOperation,

  validateParams: (_, params) => {
    if (!params?.spaceId) {
      return 'SpaceId cannot be empty';
    }

    if (!params?.data) {
      return 'Data cannot be empty';
    }
  },

  usePatch: () => true,

  patchURL: ({ config }, params) => `/v3/objects/${config.subscribeKey}/spaces/${utils.encodeString(params.spaceId)}`,

  patchPayload: (_, params) => params.data,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  prepareParams: () => ({}),

  handleResponse: (_, response) => ({
    status: response.status,
    data: response.data,
  }),
};

export default endpoint;
