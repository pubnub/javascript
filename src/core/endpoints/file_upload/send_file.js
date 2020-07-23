/** @flow */

import { PubNubError, createValidationError } from '../../components/endpoint';
import type {
  SendFileParams,
  SendFileResult,
  GenerateUploadUrlParams,
  GenerateUploadUrlResult,
  PublishFileParams,
  PublishFileResult,
} from './types';

import type { Modules } from '../endpoint';

type Dependencies = {|
  generateUploadUrl: (params: GenerateUploadUrlParams) => Promise<GenerateUploadUrlResult>,
  publishFile: (params: PublishFileParams) => Promise<PublishFileResult>,
  modules: Modules,
|};

const sendFile = ({ generateUploadUrl, publishFile, modules }: Dependencies) => async ({
  channel,
  file: input,
  message,
}: SendFileParams): Promise<SendFileResult> => {
  if (!channel) {
    throw new PubNubError(
      'Validation failed, check status for details',
      createValidationError("channel can't be empty")
    );
  }

  if (!input) {
    throw new PubNubError(
      'Validation failed, check status for details',
      createValidationError("file can't be empty")
    );
  }

  const file = modules.getFile().create(input);

  const {
    file_upload_request: { url, form_fields: formFields },
    data: { id, name },
  } = await generateUploadUrl({ channel, name: file.name });

  const res = await modules.networking.FILE(url, formFields, file.input);

  if (res.status !== 204) {
    throw new Error('upload failed');
  }

  await publishFile({
    channel,
    message: {
      message,
      file: {
        id,
        name,
      },
    },
  });

  return {
    id,
    name,
  };
};

export default (deps: Dependencies) => {
  const f = sendFile(deps);

  return (
    params: SendFileParams,
    cb?: (error: any, params: SendFileResult) => void
  ): Promise<SendFileResult> => {
    const resultP = f(params);

    if (typeof cb === 'function') {
      resultP.then((result) => cb(null, result)).catch((error) => cb(error, (null: any)));

      return resultP;
    } else {
      return resultP;
    }
  };
};
