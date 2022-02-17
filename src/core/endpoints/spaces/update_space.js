/*       */

import {
  SpacesObjectInput,
  SpacesResponse,
  ModulesInject,
} from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

function prepareMessagePayload(modules, incomingParams) {
  return incomingParams;
}

export function getOperation() {
  return operationConstants.PNUpdateSpaceOperation;
}

export function validateParams({ config }, incomingParams) {
  let { id, name, custom } = incomingParams;

  if (!id) return 'Missing Space.id';
  if (!name) return 'Missing Space.name';
  if (!config.subscribeKey) return 'Missing Subscribe Key';

  if (custom) {
    if (
      !Object.values(custom).every(
        (value) =>
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean'
      )
    ) {
      return 'Invalid custom type, only string, number and boolean values are allowed.';
    }
  }
}

export function usePatch() {
  return true;
}

export function getURL(modules, incomingParams) {
  let { config } = modules;
  const { id } = incomingParams;
  return `/v1/objects/${config.subscribeKey}/spaces/${utils.encodeString(id)}`;
}

export function patchURL(modules, incomingParams) {
  const { config } = modules;
  const { id } = incomingParams;
  return `/v1/objects/${config.subscribeKey}/spaces/${utils.encodeString(id)}`;
}

export function getRequestTimeout({ config }) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(modules, incomingParams) {
  let { include } = incomingParams;
  const params = {};

  // default to include custom fields in response
  if (!include) {
    include = {
      customFields: true,
    };
  } else if (include.customFields === undefined) {
    include.customFields = true;
  }

  if (include) {
    let includes = [];

    if (include.customFields) {
      includes.push('custom');
    }

    let includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  return params;
}

export function patchPayload(modules, incomingParams) {
  return prepareMessagePayload(modules, incomingParams);
}

export function handleResponse(modules, spacesResponse) {
  return spacesResponse;
}
