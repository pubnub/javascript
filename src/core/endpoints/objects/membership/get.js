/** @flow */

import type { EndpointConfig } from '../../endpoint';
import operationConstants from '../../../constants/operations';
import type { Membership, PaginatedResultParams } from './membership';
import utils from '../../../utils';

export type GetMembershipsParams = {
  uuid: string,
} & PaginatedResultParams;

export type GetMembershipsResult = {|
  status: 200,
  data: Membership[],
  totalCount?: number,
  prev?: string,
  next?: string,
|};

const endpoint: EndpointConfig<GetMembershipsParams, GetMembershipsResult> = {
  getOperation: () => operationConstants.PNGetMembershipsOperation,

  // No required parameters.
  validateParams: () => {},

  getURL: ({ config }, params) => `/v2/objects/${config.subscribeKey}/uuids/${utils.encodeString(params?.uuid ?? config.getUUID())}/channels`,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  prepareParams: (_modules, params) => {
    const queryParams = {};

    if (params?.include) {
      queryParams.include = [];

      if (params.include?.customFields) {
        queryParams.include.push('custom');
      }

      if (params.include?.customChannelFields) {
        queryParams.include.push('channel.custom');
      }

      if (params.include?.channelFields) {
        queryParams.include.push('channel');
      }

      queryParams.include = queryParams.include.join(',');
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

  handleResponse: (_, response): GetMembershipsResult => ({
    status: response.status,
    data: response.data,
    totalCount: response.totalCount,
    prev: response.prev,
    next: response.next,
  }),
};

export default endpoint;
