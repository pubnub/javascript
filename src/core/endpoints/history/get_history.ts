/**
 * Get history REST API module.
 */

import { createValidationError, PubNubError } from '../../../errors/pubnub-error';
import { TransportResponse } from '../../types/transport-response';
import { CryptoModule } from '../../interfaces/crypto-module';
import { AbstractRequest } from '../../components/request';
import RequestOperation from '../../constants/operations';
import { KeySet, Payload, Query } from '../../types/api';
import * as History from '../../types/api/history';
import { encodeString } from '../../utils';

// --------------------------------------------------------
// ---------------------- Defaults ------------------------
// --------------------------------------------------------
// region Defaults

/**
 * Whether verbose logging enabled or not.
 */
const LOG_VERBOSITY = false;

/**
 * Whether associated message metadata should be returned or not.
 */
const INCLUDE_METADATA = false;

/**
 * Whether timetokens should be returned as strings by default or not.
 */
const STRINGIFY_TIMETOKENS = false;

/**
 * Default and maximum number of messages which should be returned.
 */
const MESSAGES_COUNT = 100;
// endregion

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = History.GetHistoryParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;

  /**
   * Published data encryption module.
   */
  crypto?: CryptoModule;

  /**
   * Whether verbose logging enabled or not.
   *
   * @default `false`
   */
  logVerbosity?: boolean;
};

/**
 * Service success response.
 */
type ServiceResponse = [
  /**
   * List of previously published messages.
   */
  {
    /**
     * Message payload (decrypted).
     */
    message: Payload;

    /**
     * When message has been received by PubNub service.
     */
    timetoken: string | number;

    /**
     * Additional data which has been published along with message to be used with real-time
     * events filter expression.
     */
    meta?: Payload;
  }[],

  /**
   * Received messages timeline start.
   */
  string | number,

  /**
   * Received messages timeline end.
   */
  string | number,
];
// endregion

/**
 * Get single channel messages request.
 *
 * @internal
 */
export class GetHistoryRequest extends AbstractRequest<History.GetHistoryResponse> {
  constructor(private readonly parameters: RequestParameters) {
    super();

    // Apply defaults.
    if (parameters.count) parameters.count = Math.min(parameters.count, MESSAGES_COUNT);
    else parameters.count = MESSAGES_COUNT;

    parameters.stringifiedTimeToken ??= STRINGIFY_TIMETOKENS;
    parameters.includeMeta ??= INCLUDE_METADATA;
    parameters.logVerbosity ??= LOG_VERBOSITY;
  }

  operation(): RequestOperation {
    return RequestOperation.PNHistoryOperation;
  }

  validate(): string | undefined {
    if (!this.parameters.keySet.subscribeKey) return 'Missing Subscribe Key';
    if (!this.parameters.channel) return 'Missing channel';
  }

  async parse(response: TransportResponse): Promise<History.GetHistoryResponse> {
    const serviceResponse = this.deserializeResponse<ServiceResponse>(response);

    if (!serviceResponse)
      throw new PubNubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );

    const messages = serviceResponse[0];
    const startTimeToken = serviceResponse[1];
    const endTimeToken = serviceResponse[2];

    // Handle malformed get history response.
    if (!Array.isArray(messages)) return { messages: [], startTimeToken, endTimeToken };

    return {
      messages: messages.map((payload) => {
        const processedPayload = this.processPayload(payload.message);
        const item: History.GetHistoryResponse['messages'][number] = {
          entry: processedPayload.payload,
          timetoken: payload.timetoken,
        };

        if (processedPayload.error) item.error = processedPayload.error;
        if (payload.meta) item.meta = payload.meta;

        return item;
      }),
      startTimeToken,
      endTimeToken,
    };
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      channel,
    } = this.parameters;

    return `/v2/history/sub-key/${subscribeKey}/channel/${encodeString(channel)}`;
  }

  protected get queryParameters(): Query {
    const { start, end, reverse, count, stringifiedTimeToken, includeMeta } = this.parameters;

    return {
      count: count!,
      include_token: 'true',
      ...(start ? { start } : {}),
      ...(end ? { end } : {}),
      ...(stringifiedTimeToken! ? { string_message_token: 'true' } : {}),
      ...(reverse !== undefined && reverse !== null ? { reverse: reverse.toString() } : {}),
      ...(includeMeta! ? { include_meta: 'true' } : {}),
    };
  }

  private processPayload(payload: Payload): { payload: Payload; error?: string } {
    const { crypto, logVerbosity } = this.parameters;
    if (!crypto || typeof payload !== 'string') return { payload };

    let decryptedPayload: string;
    let error: string | undefined;

    try {
      const decryptedData = crypto.decrypt(payload);
      decryptedPayload =
        decryptedData instanceof ArrayBuffer
          ? JSON.parse(GetHistoryRequest.decoder.decode(decryptedData))
          : decryptedData;
    } catch (err) {
      if (logVerbosity!) console.log(`decryption error`, (err as Error).message);
      decryptedPayload = payload;
      error = `Error while decrypting message content: ${(err as Error).message}`;
    }

    return {
      payload: decryptedPayload,
      error,
    };
  }
}
