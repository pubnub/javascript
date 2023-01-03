/**       */

import operationConstants from '../../../constants/operations';

import utils from '../../../utils';

const endpoint = {
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
    delete: [],
    [params.type]: params.channels.map((channel) => {
      if (typeof channel === 'string') {
        return {
          channel: {
            id: channel,
          },
        };
      }
      return {
        channel: { id: channel.id },
        custom: channel.custom,
        status: channel.status,
      };
    }),
  }),

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  prepareParams: (_modules, params) => {
    const queryParams = {};
    queryParams.include = ['channel.status', 'channel.type', 'status'];

    if (params?.include) {
      if (params.include?.customFields) {
        queryParams.include.push('custom');
      }

      if (params.include?.customChannelFields) {
        queryParams.include.push('channel.custom');
      }

      if (params.include?.channelFields) {
        queryParams.include.push('channel');
      }
    }

    queryParams.include = queryParams.include.join(',');

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

    if (params.limit != null) {
      queryParams.limit = params.limit;
    }

    if (params?.sort) {
      queryParams.sort = Object.entries(params.sort ?? {}).map(([key, value]) => {
        if (value === 'asc' || value === 'desc') {
          return `${key}:${value}`;
        }
        return key;
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
