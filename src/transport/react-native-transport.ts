/**
 * React Native Transport provider module.
 */

import { CancellationController, TransportRequest } from '../core/types/transport-request';
import { TransportResponse } from '../core/types/transport-response';
import { Transport } from '../core/interfaces/transport';
import { queryStringFromObject } from '../core/utils';
import { PubNubAPIError } from '../errors/pubnub-api-error';

/**
 * Class representing a fetch-based React Native transport provider.
 */
export class ReactNativeTransport implements Transport {
  /**
   * Service {@link ArrayBuffer} response decoder.
   */
  protected static decoder = new TextDecoder();

  constructor(
    private keepAlive: boolean = false,
    private readonly logVerbosity: boolean,
  ) {}

  makeSendable(req: TransportRequest): [Promise<TransportResponse>, CancellationController | undefined] {
    let controller: CancellationController | undefined;
    let abortController: AbortController | undefined;

    if (req.cancellable) {
      abortController = new AbortController();
      controller = {
        // Storing controller inside to prolong object lifetime.
        abortController,
        abort: () => abortController?.abort(),
      } as CancellationController;
    }

    return [
      this.requestFromTransportRequest(req).then((request) => {
        const start = new Date().getTime();

        this.logRequestProcessProgress(request);

        /**
         * Setup request timeout promise.
         *
         * **Note:** Native Fetch API doesn't support `timeout` out-of-box.
         */
        const requestTimeout = new Promise<Response>((_, reject) => {
          const timeoutId = setTimeout(() => {
            // Clean up.
            clearTimeout(timeoutId);

            reject(new Error('Request timeout'));
          }, req.timeout * 1000);
        });

        return Promise.race([
          fetch(request, {
            signal: abortController?.signal,
            timeout: req.timeout * 1000,
            keepalive: this.keepAlive,
          } as RequestInit),
          requestTimeout,
        ])
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

            this.logRequestProcessProgress(request, new Date().getTime() - start, responseBody);

            return transportResponse;
          })
          .catch((error) => {
            throw PubNubAPIError.create(error);
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
   */
  private async requestFromTransportRequest(req: TransportRequest): Promise<Request> {
    let headers: Record<string, string> | undefined = undefined;
    let body: string | ArrayBuffer | FormData | undefined;
    let path = req.path;

    if (req.headers) {
      headers = {};
      for (const [key, value] of Object.entries(req.headers)) headers[key] = value;
    }

    if (req.queryParameters && Object.keys(req.queryParameters).length !== 0)
      path = `${path}?${queryStringFromObject(req.queryParameters)}`;

    if (req.body && typeof req.body === 'object') {
      if (req.body instanceof ArrayBuffer) body = req.body;
      else {
        // Create multipart request body.
        const fileData = await req.body.toArrayBuffer();
        const formData = new FormData();
        for (const [key, value] of Object.entries(req.formData ?? {})) formData.append(key, value);

        formData.append('file', new Blob([fileData], { type: req.body.mimeType }), req.body.name);
        body = formData;
      }
    } else body = req.body;

    return new Request(`${req.origin!}${path}`, {
      method: req.method,
      headers,
      redirect: 'follow',
      body,
    });
  }

  /**
   * Log out request processing progress and result.
   *
   * @param request - Platform-specific
   * @param [elapsed] - How many time passed since request processing started.
   * @param [body] - Service response (if available).
   */
  protected logRequestProcessProgress(request: Request, elapsed?: number, body?: ArrayBuffer) {
    if (!this.logVerbosity) return;

    const { protocol, host, pathname, search } = new URL(request.url);
    const timestamp = new Date().toISOString();

    if (!elapsed) {
      console.log('<<<<<');
      console.log(`[${timestamp}]`, `\n${protocol}//${host}${pathname}`, `\n${search}`);
      console.log('-----');
    } else {
      const stringifiedBody = body ? ReactNativeTransport.decoder.decode(body) : undefined;

      console.log('>>>>>>');
      console.log(
        `[${timestamp} / ${elapsed}]`,
        `\n${protocol}//${host}${pathname}`,
        `\n${search}`,
        `\n${stringifiedBody}`,
      );
      console.log('-----');
    }
  }
}
