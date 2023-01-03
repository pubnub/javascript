/**       */

import operationConstants from '../../../constants/operations';

import utils from '../../../utils';

const endpoint = {
  getOperation: () => operationConstants.PNSetUUIDMetadataOperation,

  validateParams: (_, params) => {
    if (!params?.data) {
      return 'Data cannot be empty';
    }
  },

  usePatch: () => true,

  patchURL: ({ config }, params) =>
    `/v2/objects/${config.subscribeKey}/uuids/${utils.encodeString(params.uuid ?? config.getUUID())}`,

  patchPayload: (_, params) => params.data,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  prepareParams: ({ config }, params) => {
    const queryParams = {};

    queryParams.uuid = params?.uuid ?? config.getUUID();
    queryParams.include = ['status', 'type', 'custom'];

    if (params?.include) {
      if (params.include?.customFields === false) {
        queryParams.include.pop();
      }
    }

    queryParams.include = queryParams.include.join(',');

    return queryParams;
  },

  handleResponse: (_, response) => ({
    status: response.status,
    data: response.data,
  }),
};

export default endpoint;
