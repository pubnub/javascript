/** @flow */

import type { EndpointConfig } from '../../endpoint';
import operationConstants from '../../../constants/operations';
import type { Membership, PaginatedResultParams } from './membership';
import utils from '../../../utils';

type CommonParams = {|
  uuid?: string,
|};

export type RemoveMembershipsParams = {|
  type: 'delete',
  channels: (string | { id: string, custom?: empty })[],
|} & CommonParams &
  PaginatedResultParams;

export type UpsertMembershipsParams = {|
  type: 'set',
  channels: (string | { id: string, custom?: any })[],
|} & CommonParams &
  PaginatedResultParams;

export type SetMembershipsParams = RemoveMembershipsParams | UpsertMembershipsParams;

export type SetMembershipsResult = {|
  status: 200,
  data: Membership,
  totalCount?: number,
  prev?: string,
  next?: string,
|};

const endpoint: EndpointConfig<SetMembershipsParams, SetMembershipsResult> = {
  getOperation: () => operationConstants.PNSetMembershipsOperation,

  validateParams: (_, params) => {
    if (!params?.channels || params?.channels.length === 0) {
      return 'Channels cannot be empty';
    }
  },

  usePatch: () => true,

  patchURL: ({ config }, params) =>
    `/v2/objects/${config.subscribeKey}/uuids/${utils.encodeString(params.uuid ?? config.getUUID())}/channels`,

  patchPayload: (_, params) => ({
    set: [],
    remove: [],
    [params.type]: params.channels.map((channel) => {
      if (typeof channel === 'string') {
        return {
          channel: {
            id: channel,
          },
        };
      } else {
        return {
          channel: { id: channel.id },
          custom: channel.custom,
        };
      }
    }),
  }),

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
      queryParams.count = true;
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

    if (params?.limit) {
      queryParams.limit = params.limit;
    }

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

  handleResponse: (_, response) => ({
    status: response.status,
    data: response.data,
    totalCount: response.totalCount,
    prev: response.prev,
    next: response.next,
  }),
};

export default endpoint;
