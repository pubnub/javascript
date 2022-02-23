/*       */

import {
  SingleSpaceInput,
  SpacesResponse,
  ModulesInject,
} from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

export function getOperation()         {
  return operationConstants.PNGetSpaceOperation;
}

export function validateParams(modules               , incomingParams                  ) {
  let { spaceId } = incomingParams;

  if (!spaceId) return 'Missing spaceId';
}

export function getURL(
  modules               ,
  incomingParams                  
)         {
  let { config } = modules;
  return `/v1/objects/${config.subscribeKey}/spaces/${utils.encodeString(incomingParams.spaceId)}`;
}

export function getRequestTimeout({ config }               ) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(
  modules               ,
  incomingParams                  
)         {
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

export function handleResponse(
  modules               ,
  spacesResponse        
)                 {
  return spacesResponse;
}
