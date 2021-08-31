/** @flow */

import type { EndpointConfig } from '../endpoint';
import operationConstants from '../../constants/operations';
import type { DownloadFileParams, DownloadFileResult } from './types';
import utils from '../../utils';

const endpoint: EndpointConfig<DownloadFileParams, DownloadFileResult> = {
  getOperation: () => operationConstants.PNDownloadFileOperation,

  validateParams: (_, params) => {
    if (!params?.channel) {
      return "channel can't be empty";
    }

    if (!params?.name) {
      return "name can't be empty";
    }

    if (!params?.id) {
      return "id can't be empty";
    }
  },

  useGetFile: () => true,

  getFileURL: ({ config }, params) =>
    `/v1/files/${config.subscribeKey}/channels/${utils.encodeString(params.channel)}/files/${params.id}/${params.name}`,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,
  ignoreBody: () => true,
  forceBuffered: () => true,

  prepareParams: () => ({}),

  handleResponse: async ({ PubNubFile, config, cryptography }, res, params): Promise<DownloadFileResult> => {
    let body = res.response.body;

    if (PubNubFile.supportsEncryptFile && (params.cipherKey ?? config.cipherKey)) {
      body = await cryptography.decrypt(params.cipherKey ?? config.cipherKey, body);
    }

    return PubNubFile.create({
      data: body,
      name: res.response.name ?? params.name,
      mimeType: res.response.type,
    });
  },
};

export default endpoint;
