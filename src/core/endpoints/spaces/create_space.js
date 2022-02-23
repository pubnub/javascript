/*       */

import { SpacesObjectInput, SpacesResponse, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';

function prepareMessagePayload(modules, incomingParams) {
  return incomingParams;
}

export function getOperation() {
  return operationConstants.PNCreateSpaceOperation;
}

export function validateParams({ config }, incomingParams) {
  const { id, name, custom } = incomingParams;

  if (!id) return 'Missing Space.id';
  if (!name) return 'Missing Space.name';
  if (!config.subscribeKey) return 'Missing Subscribe Key';

  if (custom) {
    if (
      !Object.values(custom).every(
        (value) => typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean',
      )
    ) {
      return 'Invalid custom type, only string, number and boolean values are allowed.';
    }
  }
}

export function usePost() {
  return true;
}

export function getURL(modules) {
  const { config } = modules;
  return `/v1/objects/${config.subscribeKey}/spaces`;
}

export function postURL(modules) {
  const { config } = modules;
  return `/v1/objects/${config.subscribeKey}/spaces`;
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
    const includes = [];

    if (include.customFields) {
      includes.push('custom');
    }

    const includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  return params;
}

export function postPayload(modules, incomingParams) {
  return prepareMessagePayload(modules, incomingParams);
}

export function handleResponse(modules, spacesResponse) {
  return spacesResponse;
}
