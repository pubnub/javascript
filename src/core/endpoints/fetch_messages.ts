/**
 * Fetch messages REST API module.
 */

import { createValidationError, PubNubError } from '../../errors/pubnub-error';
import { TransportResponse } from '../types/transport-response';
import { PubNubAPIError } from '../../errors/pubnub-api-error';
import { CryptoModule } from '../interfaces/crypto-module';
import { AbstractRequest } from '../components/request';
import * as FileSharing from '../types/api/file-sharing';
import RequestOperation from '../constants/operations';
import { KeySet, Payload, Query } from '../types/api';
import * as History from '../types/api/history';
import { encodeNames } from '../utils';

// --------------------------------------------------------
// ---------------------- Defaults ------------------------
// --------------------------------------------------------
// region Defaults

/**
 * Whether verbose logging enabled or not.
 */
const LOG_VERBOSITY = false;

/**
 * Whether message type should be returned or not.
 */
const INCLUDE_MESSAGE_TYPE = true;

/**
 * Whether timetokens should be returned as strings by default or not.
 */
const STRINGIFY_TIMETOKENS = false;

/**
 * Whether message publisher `uuid` should be returned or not.
 */
const INCLUDE_UUID = true;

/**
 * Default number of messages which can be returned for single channel, and it is maximum as well.
 */
const SINGLE_CHANNEL_MESSAGES_COUNT = 100;

/**
 * Default number of messages which can be returned for multiple channels or when fetched
 * message actions.
 */
const MULTIPLE_CHANNELS_MESSAGES_COUNT = 25;
// endregion

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Request configuration parameters.
 */
type RequestParameters = History.FetchMessagesParameters & {
  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;

  /**
   * Published data encryption module.
   */
  crypto?: CryptoModule;

  /**
   * File download Url generation function.
   *
   * @param parameters - File download Url request configuration parameters.
   *
   * @returns File download Url.
   */
  getFileUrl: (parameters: FileSharing.FileUrlParameters) => string;

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
type ServiceResponse = {
  /**
   * Request result status code.
   */
  status: number;

  /**
   * Whether service response represent error or not.
   */
  error: boolean;

  /**
   * Human-readable error explanation.
   */
  error_message: string;

  /**
   * List of previously published messages per requested channel.
   */
  channels: {
    [p: string]: {
      /**
       * Message payload (decrypted).
       */
      message: History.FetchedMessage['message'];

      /**
       * When message has been received by PubNub service.
       */
      timetoken: string;

      /**
       * Message publisher unique identifier.
       */
      uuid?: string;

      /**
       * PubNub-defined message type.
       */
      message_type?: History.PubNubMessageType | null;

      /**
       * Additional data which has been published along with message to be used with real-time
       * events filter expression.
       */
      meta?: Payload;

      /**
       * List of message reactions.
       */
      actions?: History.Actions;

      /**
       * Custom published data type (user-provided).
       */
      type?: string;

      /**
       * Space in which message has been received.
       */
      space_id?: string;
    }[];
  };

  /**
   * Additional message actions fetch information.
   */
  more?: History.MoreActions;
};
// endregion

/**
 * Fetch messages from channels request.
 *
 * @internal
 */
export class FetchMessagesRequest extends AbstractRequest<History.FetchMessagesResponse> {
  constructor(private readonly parameters: RequestParameters) {
    super();

    // Apply defaults.
    const includeMessageActions = parameters.includeMessageActions ?? false;
    const defaultCount =
      parameters.channels.length > 1 || includeMessageActions
        ? MULTIPLE_CHANNELS_MESSAGES_COUNT
        : SINGLE_CHANNEL_MESSAGES_COUNT;
    if (!parameters.count) parameters.count = defaultCount;
    else parameters.count = Math.min(parameters.count, defaultCount);

    if (parameters.includeUuid) parameters.includeUUID = parameters.includeUuid;
    else parameters.includeUUID ??= INCLUDE_UUID;
    parameters.stringifiedTimeToken ??= STRINGIFY_TIMETOKENS;
    parameters.includeMessageType ??= INCLUDE_MESSAGE_TYPE;
    parameters.logVerbosity ??= LOG_VERBOSITY;
  }

  operation(): RequestOperation {
    return RequestOperation.PNFetchMessagesOperation;
  }

  validate(): string | undefined {
    const {
      keySet: { subscribeKey },
      channels,
      includeMessageActions,
    } = this.parameters;

    if (!subscribeKey) return 'Missing Subscribe Key';
    if (!channels) return 'Missing channels';
    if (includeMessageActions !== undefined && includeMessageActions && channels.length > 1)
      return (
        'History can return actions data for a single channel only. Either pass a single channel ' +
        'or disable the includeMessageActions flag.'
      );
  }

  async parse(response: TransportResponse): Promise<History.FetchMessagesResponse> {
    const serviceResponse = this.deserializeResponse<ServiceResponse>(response);

    if (!serviceResponse) {
      throw new PubNubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );
    } else if (serviceResponse.status >= 400) throw PubNubAPIError.create(response);

    const responseChannels = serviceResponse.channels ?? {};
    const channels: History.FetchMessagesResponse['channels'] = {};

    Object.keys(responseChannels).forEach((channel) => {
      // Map service response to expected data object type structure.
      channels[channel] = responseChannels[channel].map((payload) => {
        // `null` message type means regular message.
        if (payload.message_type === null) payload.message_type = History.PubNubMessageType.Message;
        const processedPayload = this.processPayload(channel, payload);

        const item = {
          channel,
          timetoken: payload.timetoken,
          message: processedPayload.payload,
          messageType: payload.message_type,
          uuid: payload.uuid,
        };

        if (payload.actions) {
          const itemWithActions = item as unknown as History.FetchedMessageWithActions;
          itemWithActions.actions = payload.actions;

          // Backward compatibility for existing users.
          // TODO: Remove in next release.
          itemWithActions.data = payload.actions;
        }

        if (payload.meta) (item as History.FetchedMessage).meta = payload.meta;
        if (processedPayload.error) (item as History.FetchedMessage).error = processedPayload.error;

        return item as History.FetchedMessage;
      });
    });

    if (serviceResponse.more)
      return { channels, more: serviceResponse.more } as History.FetchMessagesWithActionsResponse;

    return { channels } as History.FetchMessagesResponse;
  }

  protected get path(): string {
    const {
      keySet: { subscribeKey },
      channels,
      includeMessageActions,
    } = this.parameters;
    const endpoint = !includeMessageActions! ? 'history' : 'history-with-actions';

    return `/v3/${endpoint}/sub-key/${subscribeKey}/channel/${encodeNames(channels)}`;
  }

  protected get queryParameters(): Query {
    const { start, end, count, includeMessageType, includeMeta, includeUUID, stringifiedTimeToken } = this.parameters;

    return {
      max: count!,
      ...(start ? { start } : {}),
      ...(end ? { end } : {}),
      ...(stringifiedTimeToken! ? { string_message_token: 'true' } : {}),
      ...(includeMeta !== undefined && includeMeta ? { include_meta: 'true' } : {}),
      ...(includeUUID! ? { include_uuid: 'true' } : {}),
      ...(includeMessageType! ? { include_message_type: 'true' } : {}),
    };
  }

  /**
   * Parse single channel data entry.
   *
   * @param channel - Channel for which {@link payload} should be processed.
   * @param payload - Source payload which should be processed and parsed to expected type.
   *
   * @returns
   */
  private processPayload(
    channel: string,
    payload: ServiceResponse['channels'][string][number],
  ): {
    payload: History.FetchedMessage['message'];
    error?: string;
  } {
    const { crypto, logVerbosity } = this.parameters;
    if (!crypto || typeof payload.message !== 'string') return { payload: payload.message };

    let decryptedPayload: History.FetchedMessage['message'];
    let error: string | undefined;

    try {
      const decryptedData = crypto.decrypt(payload.message);
      decryptedPayload =
        decryptedData instanceof ArrayBuffer
          ? JSON.parse(FetchMessagesRequest.decoder.decode(decryptedData))
          : decryptedData;
    } catch (err) {
      if (logVerbosity!) console.log(`decryption error`, (err as Error).message);
      decryptedPayload = payload.message;
      error = `Error while decrypting message content: ${(err as Error).message}`;
    }

    if (
      !error &&
      decryptedPayload &&
      payload.message_type == History.PubNubMessageType.Files &&
      typeof decryptedPayload === 'object' &&
      this.isFileMessage(decryptedPayload)
    ) {
      const fileMessage = decryptedPayload;
      return {
        payload: {
          message: fileMessage.message,
          file: {
            ...fileMessage.file,
            url: this.parameters.getFileUrl({ channel, id: fileMessage.file.id, name: fileMessage.file.name }),
          },
        },
        error,
      };
    }

    return { payload: decryptedPayload, error };
  }

  /**
   * Check whether `payload` potentially represents file message.
   *
   * @param payload - Fetched message payload.
   *
   * @returns `true` if payload can be {@link History#FileMessage|FileMessage}.
   */
  private isFileMessage(payload: History.FetchedMessage['message']): payload is History.FileMessage['message'] {
    return (payload as History.FileMessage['message']).file !== undefined;
  }
}
