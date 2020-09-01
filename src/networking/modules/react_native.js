/* @flow */
/* global FormData */
/* global fetch */

import superagent from 'superagent';
import { EndpointDefinition } from '../../core/flow_interfaces';
import { xdr, postfile as postfilewebnode } from './web-node';

async function postfileuri(
  url: string,
  fields: $ReadOnlyArray<{ key: string, value: string }>,
  fileInput: any
): Promise<any> {
  const formData = new FormData();

  fields.forEach(({ key, value }) => {
    formData.append(key, value);
  });

  formData.append('file', fileInput);

  const result = await fetch(url, {
    method: 'POST',
    body: formData
  });

  return result;
}

export async function postfile(
  url: string,
  fields: $ReadOnlyArray<{ key: string, value: string }>,
  fileInput: any
): Promise<any> {
  if (!fileInput.uri) {
    return postfilewebnode(url, fields, fileInput);
  } else {
    return postfileuri(url, fields, fileInput);
  }
}

export function getfile(params: Object, endpoint: EndpointDefinition, callback: Function): Promise<any> {
  let superagentConstruct = superagent
    .get(this.getStandardOrigin() + endpoint.url)
    .set(endpoint.headers)
    .query(params);
  return xdr.call(this, superagentConstruct, endpoint, callback);
}
