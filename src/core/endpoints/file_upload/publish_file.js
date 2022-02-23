/**       */

import operationConstants from '../../constants/operations';

import utils from '../../utils';

const preparePayload = ({ crypto, config }, payload) => {
  let stringifiedPayload = JSON.stringify(payload);

  if (config.cipherKey) {
    stringifiedPayload = crypto.encrypt(stringifiedPayload);
    stringifiedPayload = JSON.stringify(stringifiedPayload);
  }

  return stringifiedPayload || '';
};

const endpoint = {
  getOperation: () => operationConstants.PNPublishFileOperation,

  validateParams: (_, params) => {
    if (!params?.channel) {
      return "channel can't be empty";
    }

    if (!params?.fileId) {
      return "file id can't be empty";
    }

    if (!params?.fileName) {
      return "file name can't be empty";
    }
  },

  getURL: (modules, params) => {
    const { publishKey, subscribeKey } = modules.config;

    const message = {
      message: params.message,
      file: {
        name: params.fileName,
        id: params.fileId,
      },
    };

    const payload = preparePayload(modules, message);

    return `/v1/files/publish-file/${publishKey}/${subscribeKey}/0/${utils.encodeString(
      params.channel,
    )}/0/${utils.encodeString(payload)}`;
  },

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  prepareParams: (_, params) => {
    const outParams = {};

    if (params.ttl) {
      outParams.ttl = params.ttl;
    }

    if (params.storeInHistory !== undefined) {
      outParams.store = params.storeInHistory ? '1' : '0';
    }

    if (params.meta && typeof params.meta === 'object') {
      outParams.meta = JSON.stringify(params.meta);
    }

    return outParams;
  },

  handleResponse: (_, response) => ({
    timetoken: response['2'],
  }),
};

export default endpoint;
