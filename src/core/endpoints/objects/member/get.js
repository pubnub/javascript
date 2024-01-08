/**       */

import operationConstants from '../../../constants/operations';

import utils from '../../../utils';

const endpoint = {
  getOperation: () => operationConstants.PNGetMembersOperation,

  validateParams: (_, params) => {
    if (!params?.channel) {
      return 'channel cannot be empty';
    }
  },

  getURL: ({ config }, params) =>
    `/v2/objects/${config.subscribeKey}/channels/${utils.encodeString(params.channel)}/uuids`,

  getRequestTimeout: ({ config }) => config.getTransactionTimeout(),

  isAuthSupported: () => true,

  prepareParams: (_modules, params) => {
    const queryParams = {};
    queryParams.include = [];

    if (params?.include) {
      if (params.include?.statusField) {
        queryParams.include.push('status');
      }

      if (params.include?.customFields) {
        queryParams.include.push('custom');
      }

      if (params.include?.UUIDFields) {
        queryParams.include.push('uuid');
      }

      if (params.include?.customUUIDFields) {
        queryParams.include.push('uuid.custom');
      }

      if (params.include?.UUIDStatusField) {
        queryParams.include.push('uuid.status');
      }

      if (params.include?.UUIDTypeField) {
        queryParams.include.push('uuid.type');
      }
    }
    queryParams.include = queryParams.include.join(',');

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
