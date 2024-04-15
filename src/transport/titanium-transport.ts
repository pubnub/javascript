/** global Ti */

/**
 * Titanium Transport provider module.
 */

import { CancellationController, TransportRequest } from '../core/types/transport-request';
import { TransportResponse } from '../core/types/transport-response';
import { PubNubAPIError } from '../errors/pubnub-api-error';
import { Transport } from '../core/interfaces/transport';
import { queryStringFromObject } from '../core/utils';

/**
 * Class representing a {@link Ti.Network.HTTPClient|HTTPClient}-based Titanium transport provider.
 */
export class TitaniumTransport implements Transport {
  /**
   * Service {@link ArrayBuffer} response decoder.
   */
  protected static decoder = new TextDecoder();

  /**
   * Create a new `Ti.Network.HTTPClient`-based transport instance.
   *
   * @param keepAlive - Indicates whether keep-alive should be enabled.
   * @param [logVerbosity] - Whether verbose logging enabled or not.
   *
   * @returns Transport for performing network requests.
   */
  constructor(
    private readonly keepAlive: boolean = false,
    private readonly logVerbosity: boolean = false,
  ) {}

  makeSendable(req: TransportRequest): [Promise<TransportResponse>, CancellationController | undefined] {
    const [xhr, url, body] = this.requestFromTransportRequest(req);
    let controller: CancellationController | undefined;
    let aborted = false;

    if (req.cancellable) {
      controller = {
        abort: () => {
          aborted = true;
          xhr.abort();
        },
      };
    }

    return [
      new Promise<TransportResponse>((resolve, reject) => {
        const start = new Date().getTime();

        this.logRequestProcessProgress(url);

        xhr.onload = () => {
          const response = this.transportResponseFromXHR(url, xhr);

          this.logRequestProcessProgress(url, new Date().getTime() - start, response.body);
          resolve(response);
        };

        xhr.onerror = () => {
          const elapsed = new Date().getTime() - start;
          let body: ArrayBuffer | undefined;
          let error: PubNubAPIError;

          if (aborted) {
            error = PubNubAPIError.create(new Error('Aborted'));
          } else if (xhr.timeout >= elapsed - 100) {
            error = PubNubAPIError.create(new Error('Request timeout'));
          } else if (xhr.status === 0) {
            error = PubNubAPIError.create(new Error('Request failed because of network issues'));
          } else {
            const response = this.transportResponseFromXHR(url, xhr);
            error = PubNubAPIError.create(response);
            body = response.body;
          }

          this.logRequestProcessProgress(url, elapsed, body);

          reject(error);
        };

        xhr.send(body);
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
   * @param request - The {@link TransportRequest} object containing request information.
   *
   * @returns Request object generated from the {@link TransportRequest} object.
   */
  private requestFromTransportRequest(
    request: TransportRequest,
  ): [Ti.Network.HTTPClient, string, string | ArrayBuffer | undefined] {
    const xhr = Ti.Network.createHTTPClient({ timeout: request.timeout * 1000, enableKeepAlive: this.keepAlive });
    let body: string | ArrayBuffer | undefined;
    let path = request.path;

    if (request.queryParameters && Object.keys(request.queryParameters).length !== 0)
      path = `${path}?${queryStringFromObject(request.queryParameters)}`;
    const url = `${request.origin!}${path}`;

    // Initiate XHR request.
    xhr.open(request.method, url, true);

    // Append HTTP headers (if required).
    for (const [key, value] of Object.entries(request.headers ?? {})) xhr.setRequestHeader(key, value);

    if (request.body && (typeof request.body === 'string' || request.body instanceof ArrayBuffer)) body = request.body;

    return [xhr, url, body];
  }

  /**
   * Create service response from {@link Ti.Network.HTTPClient|HTTPClient} processing result.
   *
   * @param url - Used endpoint url.
   * @param xhr - `HTTPClient` which has been used to make a request.
   *
   * @returns  Pre-processed transport response.
   */
  private transportResponseFromXHR(url: string, xhr: Ti.Network.HTTPClient): TransportResponse {
    const allHeaders = xhr.getAllResponseHeaders().split('\n');
    const headers: Record<string, string> = {};

    for (const header of allHeaders) {
      const [key, value] = header.trim().split(':');
      if (key && value) headers[key.toLowerCase()] = value.trim();
    }

    return { status: xhr.status, url, headers, body: xhr.responseData.toArrayBuffer() };
  }

  /**
   * Log out request processing progress and result.
   *
   * @param url - Endpoint Url used by {@link Ti.Network.HTTPClient|HTTPClient}.
   * @param [elapsed] - How many times passed since request processing started.
   * @param [body] - Service response (if available).
   */
  private logRequestProcessProgress(url: string, elapsed?: number, body?: ArrayBuffer) {
    if (!this.logVerbosity) return;

    const { protocol, host, pathname, search } = new URL(url);
    const timestamp = new Date().toISOString();

    if (!elapsed) {
      Ti.API.info('<<<<<');
      Ti.API.info([`[${timestamp}]`, `\n${protocol}//${host}${pathname}`, `\n${search}`]);
      Ti.API.info('-----');
    } else {
      const stringifiedBody = body ? TitaniumTransport.decoder.decode(body) : undefined;

      Ti.API.info('>>>>>>');
      Ti.API.info([
        `[${timestamp} / ${elapsed}]`,
        `\n${protocol}//${host}${pathname}`,
        `\n${search}`,
        `\n${stringifiedBody}`,
      ]);
      Ti.API.info('-----');
    }
  }
}
