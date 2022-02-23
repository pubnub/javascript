/**       */

import operationConstants from '../../constants/operations';
import utils from '../../utils';

const endpoint = {
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
