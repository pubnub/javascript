/* @flow */

import {
  SpacesObjectInput,
  SpacesResponse,
  ModulesInject,
} from '../../flow_interfaces';
import operationConstants from '../../constants/operations';

function prepareMessagePayload(modules, incomingParams) {
  return incomingParams;
}

export function getOperation(): string {
  return operationConstants.PNCreateSpaceOperation;
}

export function validateParams(
  { config }: ModulesInject,
  incomingParams: SpacesObjectInput
) {
  let { id, name, custom } = incomingParams;

  if (!id) return 'Missing Space.id';
  if (!name) return 'Missing Space.name';
  if (!config.subscribeKey) return 'Missing Subscribe Key';

  if (custom) {
    if (
      !Object.values(custom).every(
        (value) => typeof value === 'string' ||
                   typeof value === 'number' ||
                   typeof value === 'boolean'
      )
    ) {
      return 'Invalid custom type, only string, number and boolean values are allowed.';
    }
  }
}

export function usePost() {
  return true;
}

export function getURL(modules: ModulesInject): string {
  let { config } = modules;
  return `/v1/objects/${config.subscribeKey}/spaces`;
}

export function postURL(modules: ModulesInject): string {
  const { config } = modules;
  return `/v1/objects/${config.subscribeKey}/spaces`;
}

export function getRequestTimeout({ config }: ModulesInject) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(
  modules: ModulesInject,
  incomingParams: SpacesObjectInput
): Object {
  let { include } = incomingParams;
  const params = {};

  // default to include custom fields in response
  if (!include) {
    include = {
      customFields: true
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

export function postPayload(
  modules: ModulesInject,
  incomingParams: SpacesObjectInput
): Object {
  return prepareMessagePayload(modules, incomingParams);
}

export function handleResponse(
  modules: ModulesInject,
  spacesResponse: Object
): SpacesResponse {
  return spacesResponse;
}
