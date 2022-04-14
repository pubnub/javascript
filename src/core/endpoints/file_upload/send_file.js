import { PubNubError, createValidationError } from '../../components/endpoint';

const getErrorFromResponse = (response) =>
  new Promise((resolve) => {
    let result = '';

    response.on('data', (data) => {
      result += data.toString('utf8');
    });

    response.on('end', () => {
      resolve(result);
    });
  });

const sendFile = function ({
  generateUploadUrl,
  publishFile,
  modules: { PubNubFile, config, cryptography, networking },
}) {
  return async ({ channel, file: input, message, cipherKey, meta, ttl, storeInHistory }) => {
    if (!channel) {
      throw new PubNubError(
        'Validation failed, check status for details',
        createValidationError("channel can't be empty"),
      );
    }

    if (!input) {
      throw new PubNubError(
        'Validation failed, check status for details',
        createValidationError("file can't be empty"),
      );
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
        return entry;
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
      const errorBody = await getErrorFromResponse(e.response);

      const reason = /<Message>(.*)<\/Message>/gi.exec(errorBody);

      throw new PubNubError(reason ? `Upload to bucket failed: ${reason[1]}` : 'Upload to bucket failed.', e);
    }

    if (result.status !== 204) {
      throw new PubNubError('Upload to bucket was unsuccessful', result);
    }

    let retries = config.fileUploadPublishRetryLimit;
    let wasSuccessful = false;

    let publishResult = { timetoken: '0' };

    do {
      try {
        /* eslint-disable-next-line no-await-in-loop */
        publishResult = await publishFile({
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
    } while (!wasSuccessful && retries > 0);

    if (!wasSuccessful) {
      throw new PubNubError(
        'Publish failed. You may want to execute that operation manually using pubnub.publishFile',
        {
          channel,
          id,
          name,
        },
      );
    } else {
      return {
        timetoken: publishResult.timetoken,
        id,
        name,
      };
    }
  };
};

export default (deps) => {
  const f = sendFile(deps);

  return (params, cb) => {
    const resultP = f(params);

    if (typeof cb === 'function') {
      resultP.then((result) => cb(null, result)).catch((error) => cb(error, null));

      return resultP;
    }
    return resultP;
  };
};
