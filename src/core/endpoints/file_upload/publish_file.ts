/**
 * Publish File Message REST API module.
 *
 * @internal
 */

import { TransportResponse } from '../../types/transport-response';
import { ICryptoModule } from '../../interfaces/crypto-module';
import { AbstractRequest } from '../../components/request';
import * as FileSharing from '../../types/api/file-sharing';
import RequestOperation from '../../constants/operations';
import { KeySet, Payload, Query } from '../../types/api';
import { encodeString, encryptMessagePayload } from '../../utils';

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
  crypto?: ICryptoModule;
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
export class PublishFileMessageRequest extends AbstractRequest<
  FileSharing.PublishFileMessageResponse,
  ServiceResponse
> {
  /**
   * Stringified encrypted file message (computed by {@link prepare} when `crypto` is set).
   */
  private encryptedPayload?: string;

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

  prepare(): Promise<void> | void {
    const { crypto } = this.parameters;
    if (!crypto) return;

    return encryptMessagePayload(crypto, this.fileMessage).then((encrypted) => {
      this.encryptedPayload = encrypted;
    });
  }

  async parse(response: TransportResponse): Promise<FileSharing.PublishFileMessageResponse> {
    return { timetoken: this.deserializeResponse(response)[2] };
  }

  protected get path(): string {
    const {
      channel,
      keySet: { publishKey, subscribeKey },
    } = this.parameters;

    return `/v1/files/publish-file/${publishKey}/${subscribeKey}/0/${encodeString(channel)}/0/${encodeString(
      this.prepareMessagePayload(this.fileMessage),
    )}`;
  }

  /**
   * File message which should be published.
   *
   * @returns File message payload.
   */
  private get fileMessage(): Payload {
    const { message, fileId, fileName } = this.parameters;

    return {
      file: {
        name: fileName,
        id: fileId,
      },
      ...(message ? { message } : {}),
    };
  }

  protected get queryParameters(): Query {
    const { customMessageType, storeInHistory, ttl, meta } = this.parameters;
    return {
      store: storeInHistory! ? '1' : '0',
      ...(customMessageType ? { custom_message_type: customMessageType } : {}),
      ...(ttl ? { ttl } : {}),
      ...(meta && typeof meta === 'object' ? { meta: JSON.stringify(meta) } : {}),
    };
  }

  /**
   * Pre-process provided data.
   *
   * Data will be "normalized" and use encrypted payload computed by {@link prepare} if `cryptoModule` has
   * been provided.
   *
   * @param payload - User-provided data which should be pre-processed before use.
   *
   * @returns Payload which can be used as part of request URL or body.
   *
   * @throws {Error} in case if provided `payload` can't be stringified or request hasn't been prepared.
   */
  private prepareMessagePayload(payload: Payload): string {
    if (!this.parameters.crypto) return JSON.stringify(payload) || '';
    if (this.encryptedPayload === undefined) throw new Error('Encryption error: request payload not prepared');

    return this.encryptedPayload;
  }
}
