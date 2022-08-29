import operationConstants from '../../constants/operations';

import utils from '../../utils';

const endpoint = {
  getOperation: () => operationConstants.PNUpsertUserOperation,

  validateParams: (_, params) => {
    if (!params?.data) {
      return 'Data cannot be empty';
    }
  },

  usePut: () => true,

  putURL: ({ config }, params) =>
    `/v3/objects/${config.subscribeKey}/users/${utils.encodeString(params.userId ?? config.getUserId())}`,

  putPayload: (_, params) => params.data,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  prepareParams: ({ config }, params) => {
    const queryParams = {};

    queryParams.uuid = params?.userId ?? config.getUserId();

    return queryParams;
  },

  handleResponse: (_, response) => ({
    status: response.status,
    data: response.data,
  }),
};

export default endpoint;
