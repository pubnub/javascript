/**       */

import operationConstants from '../../../constants/operations';

import utils from '../../../utils';

const endpoint = {
  getOperation: () => operationConstants.PNRemoveUUIDMetadataOperation,

  validateParams: () => {
    // No required parameters.
  },

  getURL: ({ config }, params) =>
    `/v2/objects/${config.subscribeKey}/uuids/${utils.encodeString(params?.uuid ?? config.getUUID())}`,
  useDelete: () => true,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  prepareParams: ({ config }, params) => ({
    uuid: params?.uuid ?? config.getUUID(),
  }),

  handleResponse: (_, response) => ({
    status: response.status,
    data: response.data,
  }),
};

export default endpoint;
