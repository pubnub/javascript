/**       */

import { PubNubError, createValidationError, signRequest, generatePNSDK } from '../../components/endpoint';

import utils from '../../utils';

export default (modules, { channel, id, name }) => {
  const { config, networking } = modules;

  if (!channel) {
    throw new PubNubError(
      'Validation failed, check status for details',
      createValidationError("channel can't be empty"),
    );
  }

  if (!id) {
    throw new PubNubError(
      'Validation failed, check status for details',
      createValidationError("file id can't be empty"),
    );
  }

  if (!name) {
    throw new PubNubError(
      'Validation failed, check status for details',
      createValidationError("file name can't be empty"),
    );
  }

  const url = `/v1/files/${config.subscribeKey}/channels/${utils.encodeString(channel)}/files/${id}/${name}`;
  const params = {};

  params.uuid = config.getUUID();
  params.pnsdk = generatePNSDK(config);

  if (config.getAuthKey()) {
    params.auth = config.getAuthKey();
  }

  if (config.secretKey) {
    signRequest(
      modules,
      url,
      params,
      {},
      {
        getOperation: () => 'PubNubGetFileUrlOperation',
      },
    );
  }

  const queryParams = Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  if (queryParams !== '') {
    return `${networking.getStandardOrigin()}${url}?${queryParams}`;
  }

  return `${networking.getStandardOrigin()}${url}`;
};
