import operationConstants from '../../../constants/operations';

import utils from '../../../utils';

const endpoint = {
  getOperation: () => operationConstants.PNSetMembersOperation,

  validateParams: (_, params) => {
    if (!params?.channel) {
      return 'Channel cannot be empty';
    }

    if (!params?.uuids || params?.uuids.length === 0) {
      return 'UUIDs cannot be empty';
    }
  },

  usePatch: () => true,

  patchURL: ({ config }, params) =>
    `/v2/objects/${config.subscribeKey}/channels/${utils.encodeString(params.channel)}/uuids`,

  patchPayload: (_, params) => ({
    set: [],
    delete: [],
    [params.type]: params.uuids.map((uuid) => {
      if (typeof uuid === 'string') {
        return {
          uuid: {
            id: uuid,
          },
        };
      }
      return {
        uuid: { id: uuid.id },
        custom: uuid.custom,
        status: uuid.status,
      };
    }),
  }),

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  prepareParams: (_modules, params) => {
    const queryParams = {};
    queryParams.include = ['uuid.status', 'uuid.type', 'type'];

    if (params?.include) {
      if (params.include?.customFields) {
        queryParams.include.push('custom');
      }

      if (params.include?.customUUIDFields) {
        queryParams.include.push('uuid.custom');
      }

      if (params.include?.UUIDFields) {
        queryParams.include.push('uuid');
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
