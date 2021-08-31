/** @flow */

import type { EndpointConfig } from '../../endpoint';
import operationConstants from '../../../constants/operations';
import type { UUIDMetadata } from './uuid';

export type GetAllUUIDMetadataParams = {|
  filter?: string,
  sort?: { [key: string]: 'asc' | 'desc' | null },
  limit?: number,
  page?: {|
    next?: string,
    prev?: string,
  |},
  include?: {|
    totalCount?: boolean,
    customFields?: boolean,
  |},
|};

export type GetAllUUIDMetadataResult = {|
  status: 200,
  data: UUIDMetadata[],
  totalCount?: number,
  prev?: string,
  next?: string,
|};

const endpoint: EndpointConfig<GetAllUUIDMetadataParams, GetAllUUIDMetadataResult> = {
  getOperation: () => operationConstants.PNGetAllUUIDMetadataOperation,

  // No required parameters.
  validateParams: () => {},

  getURL: ({ config }) => `/v2/objects/${config.subscribeKey}/uuids`,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  prepareParams: (_modules, params) => {
    const queryParams = {};

    if (params?.include?.customFields) {
      queryParams.include = 'custom';
    }

    if (params?.include?.totalCount) {
      queryParams.count = params.include?.totalCount;
    }

    if (params?.page?.next) {
      queryParams.start = params.page?.next;
    }

    if (params?.page?.prev) {
      queryParams.end = params.page?.prev;
    }

    if (params?.filter) {
      queryParams.filter = params.filter;
    }

    queryParams.limit = params?.limit ?? 100;

    if (params?.sort) {
      queryParams.sort = Object.entries(params.sort ?? {}).map(([key, value]) => {
        if (value === 'asc' || value === 'desc') {
          return `${key}:${value}`;
        } else {
          return key;
        }
      });
    }

    return queryParams;
  },

  handleResponse: (_, response): GetAllUUIDMetadataResult => ({
    status: response.status,
    data: response.data,
    totalCount: response.totalCount,
    next: response.next,
    prev: response.prev,
  }),
};

export default endpoint;
