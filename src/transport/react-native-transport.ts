/**
 * Common browser and React Native Transport provider module.
 *
 * @internal
 */

import { gzipSync } from 'fflate';

import { CancellationController, TransportRequest } from '../core/types/transport-request';
import { TransportResponse } from '../core/types/transport-response';
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
   * @param [keepAlive] - Whether client should try to keep connections open for reuse or not.
   * @param logVerbosity - Whether verbose logs should be printed or not.
   *
   * @internal
   */
  constructor(
    private keepAlive: boolean = false,
    private readonly logVerbosity: boolean = false,
  ) {}

  makeSendable(req: TransportRequest): [Promise<TransportResponse>, CancellationController | undefined] {
    const abortController = new AbortController();
    const controller = {
      // Storing controller inside to prolong object lifetime.
      abortController,
      abort: (reason) => !abortController.signal.aborted && abortController.abort(reason),
    } as CancellationController;

    return [
      this.requestFromTransportRequest(req).then((request) => {
        const start = new Date().getTime();

        this.logRequestProcessProgress(request, req.body);

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

            if (status >= 400) throw PubNubAPIError.create(transportResponse);

            this.logRequestProcessProgress(request, undefined, new Date().getTime() - start, responseBody);

            return transportResponse;
          })
          .catch((error) => {
            let fetchError = error;

            if (typeof error === 'string') {
              const errorMessage = error.toLowerCase();
              if (errorMessage.includes('timeout') || !errorMessage.includes('cancel')) fetchError = new Error(error);
              else if (errorMessage.includes('cancel')) {
                fetchError = new Error('Aborted');
                fetchError.name = 'AbortError';
              }
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

    // Create multipart request body.
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
        body = gzipSync(
          typeof req.body === 'string' ? ReactNativeTransport.encoder.encode(req.body) : new Uint8Array(req.body),
        );
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

  /**
   * Log out request processing progress and result.
   *
   * @param request - Platform-specific
   * @param [requestBody] - POST / PATCH body.
   * @param [elapsed] - How many seconds passed since request processing started.
   * @param [body] - Service response (if available).
   *
   * @internal
   */
  protected logRequestProcessProgress(
    request: Request,
    requestBody: TransportRequest['body'],
    elapsed?: number,
    body?: ArrayBuffer,
  ) {
    if (!this.logVerbosity) return;

    const { protocol, host, pathname, search } = new URL(request.url);
    const timestamp = new Date().toISOString();

    if (!elapsed) {
      let outgoing = `[${timestamp}]\n${protocol}//${host}${pathname}\n${search}`;
      if (requestBody && (typeof requestBody === 'string' || requestBody instanceof ArrayBuffer)) {
        if (typeof requestBody === 'string') outgoing += `\n\n${requestBody}`;
        else outgoing += `\n\n${ReactNativeTransport.decoder.decode(requestBody)}`;
      }

      console.log(`<<<<<`);
      console.log(outgoing);
      console.log('-----');
    } else {
      let outgoing = `[${timestamp} / ${elapsed}]\n${protocol}//${host}${pathname}\n${search}`;
      if (body) outgoing += `\n\n${ReactNativeTransport.decoder.decode(body)}`;

      console.log('>>>>>>');
      console.log(outgoing);
      console.log('-----');
    }
  }
}
