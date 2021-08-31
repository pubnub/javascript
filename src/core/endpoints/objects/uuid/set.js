/** @flow */

import type { EndpointConfig } from '../../endpoint';
import operationConstants from '../../../constants/operations';
import type { UUIDMetadata } from './uuid';
import utils from '../../../utils';

export type SetUUIDMetadataParams = {|
  uuid?: string,
  include?: {|
    customFields: ?boolean,
  |},
  data: $Shape<UUIDMetadata>,
|};

export type SetUUIDMetadataResult = {|
  status: 200,
  data: UUIDMetadata,
|};

const endpoint: EndpointConfig<SetUUIDMetadataParams, SetUUIDMetadataResult> = {
  getOperation: () => operationConstants.PNSetUUIDMetadataOperation,

  validateParams: (_, params) => {
    if (!params?.data) {
      return 'Data cannot be empty';
    }
  },

  usePatch: () => true,

  patchURL: ({ config }, params) => `/v2/objects/${config.subscribeKey}/uuids/${utils.encodeString(params.uuid ?? config.getUUID())}`,

  patchPayload: (_, params) => params.data,

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
