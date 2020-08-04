/** @flow */

import { PubNubError, createValidationError } from '../../components/endpoint';
import type { Modules } from '../endpoint';
import type { GetFileUrlParams, GetFileUrlResult } from './types';

export default ({ config }: Modules, { channel, id, name }: GetFileUrlParams): GetFileUrlResult => {
  if (!channel) {
    throw new PubNubError(
      'Validation failed, check status for details',
      createValidationError("channel can't be empty")
    );
  }

  if (!id) {
    throw new PubNubError(
      'Validation failed, check status for details',
      createValidationError("file id can't be empty")
    );
  }

  if (!name) {
    throw new PubNubError(
      'Validation failed, check status for details',
      createValidationError("file name can't be empty")
    );
  }

  return `${config.origin}/v1/files/${config.subscribeKey}/channels/${channel}/files/${id}/${name}`;
};
