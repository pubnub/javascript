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

const sendFile = ({
  generateUploadUrl,
  publishFile,
  modules: { PubNubFile, config, cryptography, networking },
}: Dependencies) => async ({
  channel,
  file: input,
  message,
  cipherKey,
  meta,
  ttl,
  storeInHistory,
}: SendFileParams): Promise<SendFileResult> => {
  if (!channel) {
    throw new PubNubError(
      'Validation failed, check status for details',
      createValidationError("channel can't be empty")
    );
  }

  if (!input) {
    throw new PubNubError('Validation failed, check status for details', createValidationError("file can't be empty"));
  }

  let file = PubNubFile.create(input);

  const {
    file_upload_request: { url, form_fields: formFields },
    data: { id, name },
  } = await generateUploadUrl({ channel, name: file.name });

  if (PubNubFile.supportsEncryptFile && (cipherKey ?? config.cipherKey)) {
    file = await cryptography.encryptFile(cipherKey ?? config.cipherKey, file, PubNubFile);
  }

  let formFieldsWithMimeType = formFields;

  if (file.mimeType) {
    formFieldsWithMimeType = formFields.map((entry) => {
      if (entry.key === 'Content-Type') return { key: entry.key, value: file.mimeType };
      else return entry;
    });
  }

  let result;

  try {
    if (PubNubFile.supportsFileUri && input.uri) {
      result = await networking.POSTFILE(url, formFieldsWithMimeType, await file.toFileUri());
    } else if (PubNubFile.supportsFile) {
      result = await networking.POSTFILE(url, formFieldsWithMimeType, await file.toFile());
    } else if (PubNubFile.supportsBuffer) {
      result = await networking.POSTFILE(url, formFieldsWithMimeType, await file.toBuffer());
    } else if (PubNubFile.supportsBlob) {
      result = await networking.POSTFILE(url, formFieldsWithMimeType, await file.toBlob());
    } else {
      throw new Error('Unsupported environment');
    }
  } catch (e) {
    throw new PubNubError('Upload to bucket failed', e);
  }

  if (result.status !== 204) {
    throw new PubNubError('Upload to bucket was unsuccessful', result);
  }

  let retries = 5;
  let wasSuccessful = false;

  while (!wasSuccessful && retries > 0) {
    try {
      await publishFile({
        channel,
        message,
        fileId: id,
        fileName: name,
        meta,
        storeInHistory,
        ttl,
      });

      wasSuccessful = true;
    } catch (e) {
      retries -= 1;
    }
  }
  if (!wasSuccessful) {
    throw new PubNubError('Publish failed. You may want to execute that operation manually using pubnub.publishFile', {
      channel,
      id,
      name,
    });
  } else {
    return {
      id,
      name,
    };
  }
};

export default (deps: Dependencies) => {
  const f = sendFile(deps);

  return (params: SendFileParams, cb?: (error: any, params: SendFileResult) => void): Promise<SendFileResult> => {
    const resultP = f(params);

    if (typeof cb === 'function') {
      resultP.then((result) => cb(null, result)).catch((error) => cb(error, (null: any)));

      return resultP;
    } else {
      return resultP;
    }
  };
};
