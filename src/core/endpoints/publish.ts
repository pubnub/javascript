/**
 * Publish REST API module.
 */

import { createValidationError, PubNubError } from '../../errors/pubnub-error';
import { TransportResponse } from '../types/transport-response';
import { TransportMethod } from '../types/transport-request';
import { CryptoModule } from '../interfaces/crypto-module';
import { AbstractRequest } from '../components/request';
import RequestOperation from '../constants/operations';
import { KeySet, Payload, Query } from '../types/api';
import { encode } from '../components/base64_codec';
import { encodeString } from '../utils';

// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults

/**
 * Whether data is published used `POST` body or not.
 */
const SEND_BY_POST = false;
// endregion

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
export type PublishParameters = {
  /**
   * Channel name to publish messages to.
   */
  channel: string;

  /**
   * Data which should be sent to the `channel`.
   *
   * The message may be any valid JSON type including objects, arrays, strings, and numbers.
   */
  message: Payload;

  /**
   * Whether published data should be available with `Storage API` later or not.
   *
   * @default `true`
   */
  storeInHistory?: boolean;

  /**
   * Whether message should be sent as part of request POST body or not.
   *
   * @default `false`
   */
  sendByPost?: boolean;

  /**
   * Metadata, which should be associated with published data.
   *
   * Associated metadata can be utilized by message filtering feature.
   */
  meta?: Payload;

  /**
   * Specify duration during which data will be available with `Storage API`.
   *
   * - If `storeInHistory` = `true`, and `ttl` = `0`, the `message` is stored with no expiry time.
   * - If `storeInHistory` = `true` and `ttl` = `X` (`X` is an Integer value), the `message` is
   * stored with an expiry time of `X` hours.
   * - If `storeInHistory` = `false`, the `ttl` parameter is ignored.
   * - If `ttl` is not specified, then expiration of the `message` defaults back to the expiry value
   * for the key.
   */
  ttl?: number;

  /**
   * Whether published data should be replicated across all data centers or not.
   *
   * @default `true`
   * @deprecated
   */
  replicate?: boolean;

  /**
   * Indexed signature for deprecated parameters.
   */
  [key: string]: string | number | boolean | undefined | Payload | CryptoModule;
};

/**
 * Service success response.
 */
export type PublishResponse = {
  /**
   * High-precision time when published data has been received by the PubNub service.
   */
  timetoken: string;
};

/**
 * Request configuration parameters.
 */
type RequestParameters = PublishParameters & {
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
 * Data publish request.
 *
 * Request will normalize and encrypt (if required) provided data and push it to the specified
 * channel.
 *
 * @internal
 */
export class PublishRequest extends AbstractRequest<PublishResponse> {
  /**
   * Construct data publish request.
   *
   * @param parameters - Request configuration.
   */
  constructor(private readonly parameters: RequestParameters) {
    super({ method: parameters.sendByPost ? TransportMethod.POST : TransportMethod.GET });

    // Apply default request parameters.
    this.parameters.sendByPost ??= SEND_BY_POST;
  }

  operation(): RequestOperation {
    return RequestOperation.PNPublishOperation;
  }

  validate(): string | undefined {
    const {
      message,
      channel,
      keySet: { publishKey },
    } = this.parameters;

    if (!channel) return "Missing 'channel'";
    if (!message) return "Missing 'message'";
    if (!publishKey) return "Missing 'publishKey'";
  }

  async parse(response: TransportResponse): Promise<PublishResponse> {
    const serviceResponse = this.deserializeResponse<ServiceResponse>(response);

    if (!serviceResponse)
      throw new PubNubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );

    return { timetoken: serviceResponse[2] };
  }

  protected get path(): string {
    const { message, channel, keySet } = this.parameters;
    const stringifiedPayload = this.prepareMessagePayload(message);

    return `/publish/${keySet.publishKey}/${keySet.subscribeKey}/0/${encodeString(channel)}/0${
      !this.parameters.sendByPost ? `/${encodeString(stringifiedPayload)}` : ''
    }`;
  }

  protected get queryParameters(): Query {
    const { meta, replicate, storeInHistory, ttl } = this.parameters;
    const query: Query = {};

    if (storeInHistory !== undefined) query.store = storeInHistory ? '1' : '0';
    if (ttl !== undefined) query.ttl = ttl;
    if (replicate !== undefined && !replicate) query.norep = 'true';
    if (meta && typeof meta === 'object') query.meta = JSON.stringify(meta);

    return query;
  }

  protected get headers(): Record<string, string> | undefined {
    return { 'Content-Type': 'application/json' };
  }

  protected get body(): ArrayBuffer | string | undefined {
    return this.prepareMessagePayload(this.parameters.message);
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
