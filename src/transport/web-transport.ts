/**
 * Common browser and React Native Transport provider module.
 *
 * @internal
 */

import { CancellationController, TransportRequest } from '../core/types/transport-request';
import { TransportResponse } from '../core/types/transport-response';
import { LoggerManager } from '../core/components/logger-manager';
import { PubNubAPIError } from '../errors/pubnub-api-error';
import { Transport } from '../core/interfaces/transport';
import { PubNubFileInterface } from '../core/types/file';
import { queryStringFromObject } from '../core/utils';

/**
 * Object represent a request to be sent with API available in browser.
 *
 * @internal
 */
type WebTransportRequest = {
  /**
   * Full URL to the remote resource.
   */
  url: string;

  /**
   * For how long (in seconds) request should wait response from the server.
   */
  timeout: number;

  /**
   * Transport request HTTP method.
   */
  method: TransportRequest['method'];

  /**
   * Headers to be sent with the request.
   */
  headers?: Record<string, string> | undefined;

  /**
   * Body to be sent with the request.
   */
  body: string | ArrayBuffer | FormData | undefined;
};

/**
 * Web request cancellation controller.
 */
type WebCancellationController = CancellationController & {
  /**
   * Abort controller object which provides abort signal.
   */
  abortController: AbortController;
};

/**
 * Class representing a `fetch`-based browser and React Native transport provider.
 *
 * @internal
 */
export class WebTransport implements Transport {
  /**
   * Pointer to the "clean" `fetch` function.
   *
   * This protects against APM which overload implementation and may break crucial functionality.
   *
   * @internal
   */
  private static originalFetch: typeof fetch;

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
   * @param [transport] - API, which should be used to make network requests.
   *
   * @internal
   */
  constructor(
    private readonly logger: LoggerManager,
    private readonly transport: 'fetch' | 'xhr' = 'fetch',
  ) {
    logger.debug('WebTransport', `Create with configuration:\n  - transport: ${transport}`);

    if (transport === 'fetch' && (!window || !window.fetch)) {
      logger.warn('WebTransport', `'${transport}' not supported in this browser. Fallback to the 'xhr' transport.`);

      this.transport = 'xhr';
    }

    if (this.transport !== 'fetch') return;

    // Keeping reference on current `window.fetch` function.
    WebTransport.originalFetch = fetch.bind(window);

    // Check whether `fetch` has been monkey patched or not.
    if (this.isFetchMonkeyPatched()) {
      WebTransport.originalFetch = WebTransport.getOriginalFetch();

      logger.warn('WebTransport', "Native Web Fetch API 'fetch' function monkey patched.");

      if (!this.isFetchMonkeyPatched(WebTransport.originalFetch)) {
        logger.info('WebTransport', "Use native Web Fetch API 'fetch' implementation from iframe as APM workaround.");
      } else {
        logger.warn(
          'WebTransport',
          'Unable receive native Web Fetch API. There can be issues with subscribe long-poll  cancellation',
        );
      }
    }
  }

  makeSendable(req: TransportRequest): [Promise<TransportResponse>, CancellationController | undefined] {
    const abortController = new AbortController();
    const cancellation: WebCancellationController = {
      abortController,
      abort: (reason) => {
        if (!abortController.signal.aborted) {
          this.logger.trace('WebTransport', `On-demand request aborting: ${reason}`);
          abortController.abort(reason);
        }
      },
    };

    return [
      this.webTransportRequestFromTransportRequest(req).then((request) => {
        this.logger.debug('WebTransport', () => ({ messageType: 'network-request', message: req }));

        return this.sendRequest(request, cancellation)
          .then((response): Promise<[Response, ArrayBuffer]> | [Response, ArrayBuffer] =>
            response.arrayBuffer().then((arrayBuffer) => [response, arrayBuffer]),
          )
          .then((response) => {
            const body = response[1].byteLength > 0 ? response[1] : undefined;
            const { status, headers: requestHeaders } = response[0];
            const headers: Record<string, string> = {};

            // Copy Headers object content into plain Record.
            requestHeaders.forEach((value, key) => (headers[key] = value.toLowerCase()));

            const transportResponse: TransportResponse = { status, url: request.url, headers, body };

            this.logger.debug('WebTransport', () => ({
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
              this.logger.warn('WebTransport', () => ({
                messageType: 'network-request',
                message: req,
                details: 'Timeout',
                canceled: true,
              }));
            } else if (errorMessage.includes('cancel') || errorMessage.includes('abort')) {
              this.logger.debug('WebTransport', () => ({
                messageType: 'network-request',
                message: req,
                details: 'Aborted',
                canceled: true,
              }));

              fetchError = new Error('Aborted');
              fetchError.name = 'AbortError';
            } else if (errorMessage.includes('network')) {
              this.logger.warn('WebTransport', () => ({
                messageType: 'network-request',
                message: req,
                details: 'Network error',
                failed: true,
              }));
            } else {
              this.logger.warn('WebTransport', () => ({
                messageType: 'network-request',
                message: req,
                details: PubNubAPIError.create(fetchError).message,
                failed: true,
              }));
            }

            throw PubNubAPIError.create(fetchError);
          });
      }),
      cancellation,
    ];
  }

  request(req: TransportRequest): TransportRequest {
    return req;
  }

  /**
   * Send network request using preferred API.
   *
   * @param req - Transport API agnostic request object with prepared body and URL.
   * @param controller - Request cancellation controller (for long-poll requests).
   *
   * @returns Promise which will be resolved or rejected at the end of network request processing.
   *
   * @internal
   */
  private async sendRequest(req: WebTransportRequest, controller: WebCancellationController): Promise<Response> {
    if (this.transport === 'fetch') return this.sendFetchRequest(req, controller);
    return this.sendXHRRequest(req, controller);
  }

  /**
   * Send network request using legacy XMLHttpRequest API.
   *
   * @param req - Transport API agnostic request object with prepared body and URL.
   * @param controller - Request cancellation controller (for long-poll requests).
   *
   * @returns Promise which will be resolved or rejected at the end of network request processing.
   *
   * @internal
   */
  private async sendFetchRequest(req: WebTransportRequest, controller: WebCancellationController): Promise<Response> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const requestTimeout = new Promise<Response>((_, reject) => {
      timeoutId = setTimeout(() => {
        clearTimeout(timeoutId);

        reject(new Error('Request timeout'));
        controller.abort('Cancel because of timeout');
      }, req.timeout * 1000);
    });

    const request = new Request(req.url, {
      method: req.method,
      headers: req.headers,
      redirect: 'follow',
      body: req.body,
    });

    return Promise.race([
      WebTransport.originalFetch(request, {
        signal: controller.abortController.signal,
        credentials: 'omit',
        cache: 'no-cache',
      }).then((response) => {
        if (timeoutId) clearTimeout(timeoutId);
        return response;
      }),
      requestTimeout,
    ]);
  }

  /**
   * Send network request using legacy XMLHttpRequest API.
   *
   * @param req - Transport API agnostic request object with prepared body and URL.
   * @param controller - Request cancellation controller (for long-poll requests).
   *
   * @returns Promise which will be resolved or rejected at the end of network request processing.
   *
   * @internal
   */
  private async sendXHRRequest(req: WebTransportRequest, controller: WebCancellationController): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(req.method, req.url, true);
      let aborted = false;

      // Setup request
      xhr.responseType = 'arraybuffer';
      xhr.timeout = req.timeout * 1000;

      controller.abortController.signal.onabort = () => {
        if (xhr.readyState == XMLHttpRequest.DONE || xhr.readyState == XMLHttpRequest.UNSENT) return;
        aborted = true;
        xhr.abort();
      };

      Object.entries(req.headers ?? {}).forEach(([key, value]) => xhr.setRequestHeader(key, value));

      // Setup handlers to match `fetch` results handling.
      xhr.onabort = () => {
        reject(new Error('Aborted'));
      };
      xhr.ontimeout = () => {
        reject(new Error('Request timeout'));
      };
      xhr.onerror = () => {
        if (!aborted) {
          const response = this.transportResponseFromXHR(req.url, xhr);
          reject(new Error(PubNubAPIError.create(response).message));
        }
      };

      xhr.onload = () => {
        const headers = new Headers();
        xhr
          .getAllResponseHeaders()
          .split('\r\n')
          .forEach((header) => {
            const [key, value] = header.split(': ');
            if (key.length > 1 && value.length > 1) headers.append(key, value);
          });

        resolve(new Response(xhr.response, { status: xhr.status, headers, statusText: xhr.statusText }));
      };

      xhr.send(req.body);
    });
  }

  /**
   * Creates a Web Request object from a given {@link TransportRequest} object.
   *
   * @param req - The {@link TransportRequest} object containing request information.
   *
   * @returns Request object generated from the {@link TransportRequest} object.
   *
   * @internal
   */
  private async webTransportRequestFromTransportRequest(req: TransportRequest): Promise<WebTransportRequest> {
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
      } catch (toBufferError) {
        this.logger.warn('WebTransport', () => ({ messageType: 'error', message: toBufferError }));

        try {
          const fileData = await file.toFileUri();
          // @ts-expect-error React Native File Uri support.
          formData.append('file', fileData, file.name);
        } catch (toFileURLError) {
          this.logger.error('WebTransport', () => ({ messageType: 'error', message: toFileURLError }));
        }
      }

      body = formData;
    }
    // Handle regular body payload (if passed).
    else if (req.body && (typeof req.body === 'string' || req.body instanceof ArrayBuffer)) {
      // Compressing body if the browser has native support.
      if (req.compressible && typeof CompressionStream !== 'undefined') {
        const bodyArrayBuffer = typeof req.body === 'string' ? WebTransport.encoder.encode(req.body) : req.body;
        const initialBodySize = bodyArrayBuffer.byteLength;
        const bodyStream = new ReadableStream({
          start(controller) {
            controller.enqueue(bodyArrayBuffer);
            controller.close();
          },
        });

        body = await new Response(bodyStream.pipeThrough(new CompressionStream('deflate'))).arrayBuffer();
        this.logger.trace('WebTransport', () => {
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

    return {
      url: `${req.origin!}${path}`,
      method: req.method,
      headers: req.headers,
      timeout: req.timeout,
      body,
    };
  }

  /**
   * Check whether the original ` fetch ` has been monkey patched or not.
   *
   * @returns `true` if original `fetch` has been patched.
   */
  private isFetchMonkeyPatched(oFetch?: typeof fetch): boolean {
    const fetchString = (oFetch ?? fetch).toString();

    return !fetchString.includes('[native code]') && fetch.name !== 'fetch';
  }

  /**
   * Create service response from {@link XMLHttpRequest} processing result.
   *
   * @param url - Used endpoint url.
   * @param xhr - `HTTPClient`, which has been used to make a request.
   *
   * @returns  Pre-processed transport response.
   */
  private transportResponseFromXHR(url: string, xhr: XMLHttpRequest): TransportResponse {
    const allHeaders = xhr.getAllResponseHeaders().split('\n');
    const headers: Record<string, string> = {};

    for (const header of allHeaders) {
      const [key, value] = header.trim().split(':');
      if (key && value) headers[key.toLowerCase()] = value.trim();
    }

    return { status: xhr.status, url, headers, body: xhr.response as ArrayBuffer };
  }

  /**
   * Retrieve the original ` fetch ` implementation.
   *
   * Retrieve implementation which hasn't been patched by APM tools.
   *
   * @returns Reference to the `fetch` function.
   */
  private static getOriginalFetch(): typeof fetch {
    let iframe = document.querySelector<HTMLIFrameElement>('iframe[name="pubnub-context-unpatched-fetch"]');

    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.name = 'pubnub-context-unpatched-fetch';
      iframe.src = 'about:blank';
      document.body.appendChild(iframe);
    }

    if (iframe.contentWindow) return iframe.contentWindow.fetch.bind(iframe.contentWindow);
    return fetch;
  }
}
