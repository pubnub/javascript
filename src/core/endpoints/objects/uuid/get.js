/** @flow */

import type { EndpointConfig } from '../../endpoint';
import operationConstants from '../../../constants/operations';
import type { UUIDMetadata } from './uuid';
import utils from '../../../utils';

export type GetUUIDMetadataParams = {|
  uuid?: string,
  include?: {|
    customFields: ?boolean,
  |},
|};

export type GetUUIDMetadataResult = {|
  status: 200,
  data: UUIDMetadata,
|};

const endpoint: EndpointConfig<GetUUIDMetadataParams, GetUUIDMetadataResult> = {
  getOperation: () => operationConstants.PNGetUUIDMetadataOperation,

  // No required parameters.
  validateParams: () => {},

  getURL: ({ config }, params) => `/v2/objects/${config.subscribeKey}/uuids/${utils.encodeString(params?.uuid ?? config.getUUID())}`,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  prepareParams: ({ config }, params) => ({
    uuid: params?.uuid ?? config.getUUID(),
    include: (params?.include?.customFields ?? true) && 'custom',
  }),

  handleResponse: (_, response) => ({
    status: response.status,
    data: response.data,
  }),
};

export default endpoint;
