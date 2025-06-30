/**
 * Common browser and React Native Transport provider module.
 *
 * @internal
 */

import { gzipSync } from 'fflate';

import { CancellationController, TransportRequest } from '../core/types/transport-request';
import { TransportResponse } from '../core/types/transport-response';
import { LoggerManager } from '../core/components/logger-manager';
import { PubNubAPIError } from '../errors/pubnub-api-error';
import { Transport } from '../core/interfaces/transport';
import { PubNubFileInterface } from '../core/types/file';
import { queryStringFromObject } from '../core/utils';

/**
 * Class representing a React Native transport provider.
 *
 * @internal
 */
export class ReactNativeTransport implements Transport {
  /**
   * Request body decoder.
   *
   * @internal
   */
  protected static encoder = new TextEncoder();

  /**
   * Service {@link ArrayBuffer} response decoder.
   *
   * @internal
   */
  protected static decoder = new TextDecoder();

  /**
   * Create and configure transport provider for Web and Rect environments.
   *
   * @param logger - Registered loggers' manager.
   * @param [keepAlive] - Whether client should try to keep connections open for reuse or not.
   *
   * @internal
   */
  constructor(
    private readonly logger: LoggerManager,
    private keepAlive: boolean = false,
  ) {
    logger.debug('ReactNativeTransport', `Create with configuration:\n  - keep-alive: ${keepAlive}`);
  }

  makeSendable(req: TransportRequest): [Promise<TransportResponse>, CancellationController | undefined] {
    const abortController = new AbortController();
    const controller = {
      // Storing a controller inside to prolong object lifetime.
      abortController,
      abort: (reason) => {
        if (!abortController.signal.aborted) {
          this.logger.trace('ReactNativeTransport', `On-demand request aborting: ${reason}`);
          abortController.abort(reason);
        }
      },
    } as CancellationController;

    return [
      this.requestFromTransportRequest(req).then((request) => {
        this.logger.debug('ReactNativeTransport', () => ({ messageType: 'network-request', message: req }));

        /**
         * Setup request timeout promise.
         *
         * **Note:** Native Fetch API doesn't support `timeout` out-of-box.
         */
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        const requestTimeout = new Promise<Response>((_, reject) => {
          timeoutId = setTimeout(() => {
            clearTimeout(timeoutId);

            reject(new Error('Request timeout'));
            controller.abort('Cancel because of timeout');
          }, req.timeout * 1000);
        });

        return Promise.race([
          fetch(request, {
            signal: abortController.signal,
            credentials: 'omit',
            cache: 'no-cache',
          }),
          requestTimeout,
        ])
          .then((response) => {
            if (timeoutId) clearTimeout(timeoutId);
            return response;
          })
          .then((response): Promise<[Response, ArrayBuffer]> | [Response, ArrayBuffer] =>
            response.arrayBuffer().then((arrayBuffer) => [response, arrayBuffer]),
          )
          .then((response) => {
            const responseBody = response[1].byteLength > 0 ? response[1] : undefined;
            const { status, headers: requestHeaders } = response[0];
            const headers: Record<string, string> = {};

            // Copy Headers object content into plain Record.
            requestHeaders.forEach((value, key) => (headers[key] = value.toLowerCase()));

            const transportResponse: TransportResponse = {
              status,
              url: request.url,
              headers,
              body: responseBody,
            };

            this.logger.debug('ReactNativeTransport', () => ({
              messageType: 'network-response',
              message: transportResponse,
            }));

            if (status >= 400) throw PubNubAPIError.create(transportResponse);

            return transportResponse;
          })
          .catch((error) => {
            const errorMessage = (typeof error === 'string' ? error : (error as Error).message).toLowerCase();
            let fetchError = typeof error === 'string' ? new Error(error) : (error as Error);

            if (errorMessage.includes('timeout')) {
              this.logger.warn('ReactNativeTransport', () => ({
                messageType: 'network-request',
                message: req,
                details: 'Timeout',
                canceled: true,
              }));
            } else if (errorMessage.includes('cancel') || errorMessage.includes('abort')) {
              this.logger.debug('ReactNativeTransport', () => ({
                messageType: 'network-request',
                message: req,
                details: 'Aborted',
                canceled: true,
              }));

              fetchError = new Error('Aborted');
              fetchError.name = 'AbortError';
            } else if (errorMessage.includes('network')) {
              this.logger.warn('ReactNativeTransport', () => ({
                messageType: 'network-request',
                message: req,
                details: 'Network error',
                failed: true,
              }));
            } else {
              this.logger.warn('ReactNativeTransport', () => ({
                messageType: 'network-request',
                message: req,
                details: PubNubAPIError.create(fetchError).message,
                failed: true,
              }));
            }

            throw PubNubAPIError.create(fetchError);
          });
      }),
      controller,
    ];
  }

  request(req: TransportRequest): TransportRequest {
    return req;
  }

  /**
   * Creates a Request object from a given {@link TransportRequest} object.
   *
   * @param req - The {@link TransportRequest} object containing request information.
   *
   * @returns Request object generated from the {@link TransportRequest} object.
   *
   * @internal
   */
  private async requestFromTransportRequest(req: TransportRequest): Promise<Request> {
    let body: string | ArrayBuffer | FormData | undefined;
    let path = req.path;

    // Create a multipart request body.
    if (req.formData && req.formData.length > 0) {
      // Reset query parameters to conform to signed URL
      req.queryParameters = {};

      const file = req.body as PubNubFileInterface;
      const formData = new FormData();
      for (const { key, value } of req.formData) formData.append(key, value);
      try {
        const fileData = await file.toArrayBuffer();
        formData.append('file', new Blob([fileData], { type: 'application/octet-stream' }), file.name);
      } catch (_) {
        try {
          const fileData = await file.toFileUri();
          // @ts-expect-error React Native File Uri support.
          formData.append('file', fileData, file.name);
        } catch (_) {}
      }

      body = formData;
    }
    // Handle regular body payload (if passed).
    else if (req.body && (typeof req.body === 'string' || req.body instanceof ArrayBuffer)) {
      if (req.compressible) {
        const bodyArrayBuffer =
          typeof req.body === 'string' ? ReactNativeTransport.encoder.encode(req.body) : new Uint8Array(req.body);
        const initialBodySize = bodyArrayBuffer.byteLength;
        body = gzipSync(bodyArrayBuffer);
        this.logger.trace('ReactNativeTransport', () => {
          const compressedSize = (body! as ArrayBuffer).byteLength;
          const ratio = (compressedSize / initialBodySize).toFixed(2);

          return {
            messageType: 'text',
            message: `Body of ${initialBodySize} bytes, compressed by ${ratio}x to ${compressedSize} bytes.`,
          };
        });
      } else body = req.body;
    }

    if (req.queryParameters && Object.keys(req.queryParameters).length !== 0)
      path = `${path}?${queryStringFromObject(req.queryParameters)}`;

    return new Request(`${req.origin!}${path}`, {
      method: req.method,
      headers: req.headers,
      redirect: 'follow',
      body,
    });
  }
}
