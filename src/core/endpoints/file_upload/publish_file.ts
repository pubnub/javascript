/**
 * Publish File Message REST API module.
 */

import { createValidationError, PubNubError } from '../../../errors/pubnub-error';
import { TransportResponse } from '../../types/transport-response';
import { CryptoModule } from '../../interfaces/crypto-module';
import { AbstractRequest } from '../../components/request';
import * as FileSharing from '../../types/api/file-sharing';
import RequestOperation from '../../constants/operations';
import { KeySet, Payload, Query } from '../../types/api';
import { encode } from '../../components/base64_codec';
import { encodeString } from '../../utils';

// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults

/**
 * Whether published file messages should be stored in the channel's history.
 */
const STORE_IN_HISTORY = true;
// endregion

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = FileSharing.PublishFileMessageParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;

  /**
   * Published data encryption module.
   */
  crypto?: CryptoModule;
};

/**
 * Service success response.
 */
type ServiceResponse = [0 | 1, string, string];
// endregion

/**
 * Publish shared file information request.
 *
 * @internal
 */
export class PublishFileMessageRequest extends AbstractRequest<FileSharing.PublishFileMessageResponse> {
  constructor(private readonly parameters: RequestParameters) {
    super();

    // Apply default request parameters.
    this.parameters.storeInHistory ??= STORE_IN_HISTORY;
  }

  operation(): RequestOperation {
    return RequestOperation.PNPublishFileMessageOperation;
  }

  validate(): string | undefined {
    const { channel, fileId, fileName } = this.parameters;

    if (!channel) return "channel can't be empty";
    if (!fileId) return "file id can't be empty";
    if (!fileName) return "file name can't be empty";
  }

  async parse(response: TransportResponse): Promise<FileSharing.PublishFileMessageResponse> {
    const serviceResponse = this.deserializeResponse<ServiceResponse>(response);

    if (!serviceResponse)
      throw new PubNubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );

    return { timetoken: serviceResponse[2] };
  }

  protected get path(): string {
    const {
      message,
      channel,
      keySet: { publishKey, subscribeKey },
      fileId,
      fileName,
    } = this.parameters;

    const fileMessage = {
      file: {
        name: fileName,
        id: fileId,
      },
      ...(message ? { message } : {}),
    };

    return `/v1/files/publish-file/${publishKey}/${subscribeKey}/0/${encodeString(channel)}/0/${encodeString(
      this.prepareMessagePayload(fileMessage),
    )}`;
  }

  protected get queryParameters(): Query {
    const { storeInHistory, ttl, meta } = this.parameters;
    return {
      store: storeInHistory! ? '1' : '0',
      ...(ttl ? { ttl } : {}),
      ...(meta && typeof meta === 'object' ? { meta: JSON.stringify(meta) } : {}),
    };
  }

  /**
   * Pre-process provided data.
   *
   * Data will be "normalized" and encrypted if `cryptoModule` has been provided.
   *
   * @param payload - User-provided data which should be pre-processed before use.
   *
   * @returns Payload which can be used as part of request URL or body.
   *
   * @throws {Error} in case if provided `payload` or results of `encryption` can't be stringified.
   */
  private prepareMessagePayload(payload: Payload): string {
    const { crypto } = this.parameters;
    if (!crypto) return JSON.stringify(payload) || '';

    const encrypted = crypto.encrypt(JSON.stringify(payload));

    return JSON.stringify(typeof encrypted === 'string' ? encrypted : encode(encrypted));
  }
}
