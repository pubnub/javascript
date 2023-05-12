import { Endpoint } from '../../components/_endpoint';
import operationConstants from '../../constants/operations';

import utils from '../../utils';

const endpoint: Endpoint<{ data: any; userId: string }, { status: number; data: any }> = {
  getOperation: () => operationConstants.PNCreateUserOperation,

  validateParams: (_, params) => {
    if (!params?.data) {
      return 'Data cannot be empty';
    }
  },

  usePost: () => true,

  postURL: ({ config }, params) =>
    `/v3/objects/${config.subscribeKey}/users/${utils.encodeString(params.userId ?? config.getUserId())}`,

  postPayload: (_, params) => params.data,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  prepareParams: ({ config }, params) => {
    const queryParams = {
      uuid: params?.userId ?? config.getUserId(),
    };

    return queryParams;
  },

  handleResponse: (_, response) => ({
    status: response.status,
    data: response.data,
  }),
};

export default endpoint;
