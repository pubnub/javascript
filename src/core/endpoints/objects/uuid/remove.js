/** @flow */

import type { EndpointConfig } from '../../endpoint';
import operationConstants from '../../../constants/operations';
import type { UUIDMetadata } from './uuid';
import utils from '../../../utils';

export type RemoveUUIDMetadataParams = {|
  uuid?: string,
|};

export type RemoveUUIDMetadataResult = {|
  status: 200,
  data: UUIDMetadata,
|};

const endpoint: EndpointConfig<RemoveUUIDMetadataParams, RemoveUUIDMetadataResult> = {
  getOperation: () => operationConstants.PNRemoveUUIDMetadataOperation,

  // No required parameters.
  validateParams: () => {},

  getURL: ({ config }, params) => `/v2/objects/${config.subscribeKey}/uuids/${utils.encodeString(params?.uuid ?? config.getUUID())}`,
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
