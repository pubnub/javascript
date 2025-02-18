/**
 * Common browser and React Native Transport provider module.
 *
 * @internal
 */

import { CancellationController, TransportRequest } from '../core/types/transport-request';
import { TransportResponse } from '../core/types/transport-response';
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
   * Service {@link ArrayBuffer} response decoder.
   *
   * @internal
   */
  protected static decoder = new TextDecoder();

  /**
   * Create and configure transport provider for Web and Rect environments.
   *
   * @param [transport] - API which should be used to make network requests.
   * @param [keepAlive] - Whether client should try to keep connections open for reuse or not.
   * @param logVerbosity - Whether verbose logs should be printed or not.
   *
   * @internal
   */
  constructor(
    private readonly transport: 'fetch' | 'xhr' = 'fetch',
    private keepAlive: boolean = false,
    private readonly logVerbosity: boolean = false,
  ) {
    if (transport === 'fetch' && (!window || !window.fetch)) this.transport = 'xhr';
    if (this.transport !== 'fetch') return;

    // Keeping reference on current `window.fetch` function.
    WebTransport.originalFetch = fetch.bind(window);

    // Check whether `fetch` has been monkey patched or not.
    if (this.isFetchMonkeyPatched()) {
      WebTransport.originalFetch = WebTransport.getOriginalFetch();

      if (!logVerbosity) return;

      console.warn("[PubNub] Native Web Fetch API 'fetch' function monkey patched.");

      if (!this.isFetchMonkeyPatched(WebTransport.originalFetch))
        console.info("[PubNub] Use native Web Fetch API 'fetch' implementation from iframe as APM workaround.");
      else
        console.warn(
          '[PubNub] Unable receive native Web Fetch API. There can be issues with subscribe long-poll cancellation',
        );
    }
  }

  makeSendable(req: TransportRequest): [Promise<TransportResponse>, CancellationController | undefined] {
    const abortController = new AbortController();
    const cancellation: WebCancellationController = {
      abortController,
      abort: (reason) => !abortController.signal.aborted && abortController.abort(reason),
    };

    return [
      this.webTransportRequestFromTransportRequest(req).then((request) => {
        const start = new Date().getTime();

        this.logRequestProcessProgress(request, req.body);

        return this.sendRequest(request, cancellation)
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
              else if (errorMessage.includes('cancel')) fetchError = new DOMException('Aborted', 'AbortError');
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

      // Setup request
      xhr.responseType = 'arraybuffer';
      xhr.timeout = req.timeout * 1000;

      controller.abortController.signal.onabort = () => {
        if (xhr.readyState == XMLHttpRequest.DONE || xhr.readyState == XMLHttpRequest.UNSENT) return;
        xhr.abort();
      };

      Object.entries(req.headers ?? {}).forEach(([key, value]) => xhr.setRequestHeader(key, value));

      // Setup handlers to match `fetch` results handling.
      xhr.onabort = () => reject(new Error('Aborted'));
      xhr.ontimeout = () => reject(new Error('Request timeout'));
      xhr.onerror = () => reject(new Error('Request timeout'));

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
    else if (req.body && (typeof req.body === 'string' || req.body instanceof ArrayBuffer)) body = req.body;

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
    request: WebTransportRequest,
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
        else outgoing += `\n\n${WebTransport.decoder.decode(requestBody)}`;
      }

      console.log(`<<<<<`);
      console.log(outgoing);
      console.log('-----');
    } else {
      let outgoing = `[${timestamp} / ${elapsed}]\n${protocol}//${host}${pathname}\n${search}`;
      if (body) outgoing += `\n\n${WebTransport.decoder.decode(body)}`;

      console.log('>>>>>>');
      console.log(outgoing);
      console.log('-----');
    }
  }

  /**
   * Check whether original `fetch` has been monkey patched or not.
   *
   * @returns `true` if original `fetch` has been patched.
   */
  private isFetchMonkeyPatched(oFetch?: typeof fetch): boolean {
    const fetchString = (oFetch ?? fetch).toString();

    return !fetchString.includes('[native code]') && fetch.name !== 'fetch';
  }

  /**
   * Retrieve original `fetch` implementation.
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
