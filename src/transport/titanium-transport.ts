/** global Ti */

/**
 * Titanium Transport provider module.
 */

import { CancellationController, TransportRequest } from '../core/types/transport-request';
import { TransportResponse } from '../core/types/transport-response';
import { LoggerManager } from '../core/components/logger-manager';
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
   * @param logger - Registered loggers' manager.
   * @param keepAlive - Indicates whether keep-alive should be enabled.
   *
   * @returns Transport for performing network requests.
   */
  constructor(
    private readonly logger: LoggerManager,
    private readonly keepAlive: boolean = false,
  ) {
    logger.debug(this.constructor.name, `Create with configuration:\n  - keep-alive: ${keepAlive}`);
  }

  makeSendable(req: TransportRequest): [Promise<TransportResponse>, CancellationController | undefined] {
    const [xhr, url, body] = this.requestFromTransportRequest(req);
    let controller: CancellationController | undefined;
    let aborted = false;

    if (req.cancellable) {
      controller = {
        abort: () => {
          if (!aborted) {
            this.logger.trace(this.constructor.name, 'On-demand request aborting.');
            aborted = true;
            xhr.abort();
          }
        },
      };
    }

    return [
      new Promise<TransportResponse>((resolve, reject) => {
        const start = new Date().getTime();

        this.logger.debug(this.constructor.name, () => ({ messageType: 'network-request', message: req }));

        xhr.onload = () => {
          const response = this.transportResponseFromXHR(url, xhr);

          this.logger.debug(this.constructor.name, () => ({
            messageType: 'network-response',
            message: response,
          }));

          resolve(response);
        };

        xhr.onerror = () => {
          const elapsed = new Date().getTime() - start;
          let error: PubNubAPIError;

          if (aborted) {
            this.logger.debug(this.constructor.name, () => ({
              messageType: 'network-request',
              message: req,
              details: 'Aborted',
              canceled: true,
            }));

            error = PubNubAPIError.create(new Error('Aborted'));
          } else if (xhr.timeout >= elapsed - 100) {
            this.logger.warn(this.constructor.name, () => ({
              messageType: 'network-request',
              message: req,
              details: 'Timeout',
              canceled: true,
            }));

            error = PubNubAPIError.create(new Error('Request timeout'));
          } else if (xhr.status === 0) {
            this.logger.warn(this.constructor.name, () => ({
              messageType: 'network-request',
              message: req,
              details: 'Network error',
              failed: true,
            }));

            error = PubNubAPIError.create(new Error('Request failed because of network issues'));
          } else {
            const response = this.transportResponseFromXHR(url, xhr);
            error = PubNubAPIError.create(response);

            this.logger.warn(this.constructor.name, () => ({
              messageType: 'network-request',
              message: req,
              details: error.message,
              failed: true,
            }));
          }

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
}
