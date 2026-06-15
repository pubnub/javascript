/**
 * Node.js Transport provider module.
 *
 * @internal
 */

import { Agent, ProxyAgent, Dispatcher } from 'undici';
import { Buffer } from 'buffer';
import * as zlib from 'zlib';

import { CancellationController, TransportRequest } from '../core/types/transport-request';
import { Transport, TransportKeepAlive } from '../core/interfaces/transport';
import { TransportResponse } from '../core/types/transport-response';
import { AbortError } from '../core/components/abort_signal';
import { LoggerManager } from '../core/components/logger-manager';
import StatusCategory from '../core/constants/categories';
import { PubNubAPIError } from '../errors/pubnub-api-error';
import { PubNubFileInterface } from '../core/types/file';
import { queryStringFromObject } from '../core/utils';

/**
 * Proxy configuration accepted by {@link NodeTransport.setProxy}.
 *
 * This replaces the `proxy-agent` package's `ProxyAgentOptions`. The common fields used by callers
 * (`hostname`/`host`, `port`, `protocol`, `auth`) are mapped onto an `undici` {@link ProxyAgent} URI
 * by {@link NodeTransport.proxyAgentOptions}. A fully-formed proxy URI string is also accepted.
 *
 * **Known limitation (deferred to a later iteration):** unlike `proxy-agent`, `undici`'s `ProxyAgent`
 * does not support SOCKS proxies, PAC files, or `HTTP(S)_PROXY`/`NO_PROXY` environment-variable
 * auto-detection. Only explicit HTTP/HTTPS proxies are handled here.
 */
export type NodeTransportProxyConfiguration =
  | string
  | {
      /** Proxy host name (alias of {@link host}). */
      hostname?: string;
      /** Proxy host name. */
      host?: string;
      /** Proxy port. */
      port?: number;
      /** Proxy protocol (`'http'` / `'https'`). Defaults to `http`. */
      protocol?: string;
      /** Basic-auth credentials in `user:password` form. */
      auth?: string;
    };

/**
 * Class representing a `fetch`-based Node.js transport provider.
 *
 * Requests are issued through the global {@link fetch} (so that HTTP mocking libraries which patch
 * the global stay effective in tests), while connection management and HTTP/2 negotiation are driven
 * by an `undici` dispatcher passed via the `dispatcher` request option.
 *
 * @internal
 */
export class NodeTransport implements Transport {
  /**
   * {@link string|String} to {@link ArrayBuffer} response decoder.
   */
  protected static encoder = new TextEncoder();

  /**
   * Request proxy configuration.
   *
   * @internal
   */
  private proxyConfiguration?: NodeTransportProxyConfiguration;

  /**
   * Cached proxy dispatcher (created lazily from {@link proxyConfiguration}).
   *
   * @internal
   */
  private proxyAgent?: ProxyAgent;

  /**
   * Cached keep-alive dispatcher.
   *
   * A single multi-origin {@link Agent} replaces the previous per-scheme `http.Agent`/`https.Agent`
   * pair: `undici`'s `Agent` maintains a connection pool per origin internally.
   *
   * @internal
   */
  private keepAliveAgent?: Agent;

  /**
   * Creates a new `fetch`-based transport instance.
   *
   * @param logger - Registered loggers' manager.
   * @param keepAlive - Indicates whether keep-alive should be enabled.
   * @param [keepAliveSettings] - Optional settings for keep-alive.
   *
   * @returns Transport for performing network requests.
   *
   * @internal
   */
  constructor(
    private readonly logger: LoggerManager,
    private readonly keepAlive: boolean = false,
    private readonly keepAliveSettings: TransportKeepAlive = { timeout: 30000 },
  ) {
    logger.debug('NodeTransport', () => ({
      messageType: 'object',
      message: { keepAlive, keepAliveSettings },
      details: 'Create with configuration:',
    }));
  }

  /**
   * Update request proxy configuration.
   *
   * @param configuration - New proxy configuration.
   *
   * @internal
   */
  public setProxy(configuration?: NodeTransportProxyConfiguration) {
    if (configuration) this.logger.debug('NodeTransport', 'Proxy configuration has been set.');
    else this.logger.debug('NodeTransport', 'Proxy configuration has been removed.');

    this.proxyConfiguration = configuration;

    // Invalidate the cached proxy dispatcher so the new configuration takes effect on the next
    // request. Sockets held by the previous dispatcher are released asynchronously.
    if (this.proxyAgent) {
      void this.proxyAgent.close().catch(() => {});
      this.proxyAgent = undefined;
    }
  }

  makeSendable(req: TransportRequest): [Promise<TransportResponse>, CancellationController | undefined] {
    let controller: CancellationController | undefined = undefined;
    let abortController: AbortController | undefined;

    // `undici`'s `fetch` has no per-request `timeout` option (unlike `node-fetch`), so the timeout is
    // expressed as an abort signal. `AbortSignal.timeout` schedules an unref-ed timer, so it does not
    // keep the event loop alive on its own.
    const timeoutSignal = AbortSignal.timeout(req.timeout * 1000);
    let signal: AbortSignal = timeoutSignal;

    if (req.cancellable) {
      abortController = new AbortController();
      controller = {
        // Storing a controller inside to prolong object lifetime.
        abortController,
        abort: (reason) => {
          if (!abortController || abortController.signal.aborted) return;
          this.logger.trace('NodeTransport', `On-demand request aborting: ${reason}`);
          abortController?.abort(reason);
        },
      } as CancellationController;

      // The request must abort on whichever happens first: user cancellation or timeout.
      signal = AbortSignal.any([abortController.signal, timeoutSignal]);
    }

    return [
      this.requestFromTransportRequest(req).then((request) => {
        this.logger.debug('NodeTransport', () => ({ messageType: 'network-request', message: req }));

        return fetch(request, {
          signal,
          // The `undici` dispatcher carries connection-pool / proxy settings and the `allowH2` flag.
          // It is set on the `fetch` init (not on the `Request`) and is not part of the standard
          // `RequestInit`, hence the cast.
          dispatcher: this.dispatcherForTransportRequest(),
        } as RequestInit & { dispatcher: Dispatcher })
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

            this.logger.debug('NodeTransport', () => ({
              messageType: 'network-response',
              message: transportResponse,
            }));

            if (status >= 400) throw PubNubAPIError.create(transportResponse);

            return transportResponse;
          })
          .catch((error) => {
            // Classification relies on signal state rather than parsing the rejection value, because
            // an aborted `fetch` may reject with the abort *reason* (which can be an arbitrary string)
            // instead of an `Error`.

            // Timeout takes priority: the timeout signal fires regardless of whether the request was
            // also user-cancellable. Re-shape it as a `timeout` message so the shared classifier maps
            // it to `PNTimeoutCategory`.
            if (timeoutSignal.aborted) {
              this.logger.warn('NodeTransport', () => ({
                messageType: 'network-request',
                message: req,
                details: 'Timeout',
                canceled: true,
              }));

              throw PubNubAPIError.create(new Error('Request timeout'));
            }

            // User-requested cancellation. An `AbortError` (name `'AbortError'`) is what downstream
            // code keys off to recognise a cancelled request.
            if (abortController?.signal.aborted) {
              this.logger.debug('NodeTransport', () => ({
                messageType: 'network-request',
                message: req,
                details: 'Aborted',
                canceled: true,
              }));

              throw PubNubAPIError.create(new AbortError());
            }

            // Network failure or an already-classified service error (HTTP >= 400 thrown above).
            const apiError = PubNubAPIError.create(NodeTransport.normalizeNetworkError(error));

            if (apiError.category === StatusCategory.PNNetworkIssuesCategory) {
              this.logger.warn('NodeTransport', () => ({
                messageType: 'network-request',
                message: req,
                details: 'Network error',
                failed: true,
              }));
            } else {
              this.logger.warn('NodeTransport', () => ({
                messageType: 'network-request',
                message: req,
                details: apiError.message,
                failed: true,
              }));
            }

            throw apiError;
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
    let headers: Record<string, string> | undefined = req.headers;
    let body: string | ArrayBuffer | Uint8Array | FormData | undefined;
    let path = req.path;

    // Create multipart request body.
    if (req.formData && req.formData.length > 0) {
      // Reset query parameters to conform to signed URL
      req.queryParameters = {};

      const file = req.body as PubNubFileInterface;
      const fileData = await file.toArrayBuffer();
      const formData = new FormData();
      for (const { key, value } of req.formData) formData.append(key, value);

      // The Web `FormData` understood by `fetch` accepts a `Blob`/`File`, unlike the old `form-data`
      // package which took a `Buffer` plus `{ contentType, filename }` metadata.
      formData.append('file', new Blob([fileData], { type: 'application/octet-stream' }), file.name);
      body = formData;

      // Let `fetch` derive `Content-Type: multipart/form-data; boundary=...` from the FormData body.
      // A pre-existing Content-Type header would override the generated boundary and corrupt the
      // request, so any incoming Content-Type is stripped here.
      if (headers) {
        headers = { ...headers };
        for (const key of Object.keys(headers)) if (key.toLowerCase() === 'content-type') delete headers[key];
      }
    }
    // Handle regular body payload (if passed).
    else if (req.body && (typeof req.body === 'string' || req.body instanceof ArrayBuffer)) {
      let initialBodySize = 0;
      if (req.compressible) {
        initialBodySize =
          typeof req.body === 'string' ? NodeTransport.encoder.encode(req.body).byteLength : req.body.byteLength;
      }
      // Compressing body (if required).
      body = req.compressible ? zlib.deflateSync(req.body) : req.body;

      if (req.compressible) {
        this.logger.trace('NodeTransport', () => {
          const compressedSize = (body! as Uint8Array).byteLength;
          const ratio = (compressedSize / initialBodySize).toFixed(2);

          return {
            messageType: 'text',
            message: `Body of ${initialBodySize} bytes, compressed by ${ratio}x to ${compressedSize} bytes.`,
          };
        });
      }
    }

    if (req.queryParameters && Object.keys(req.queryParameters).length !== 0)
      path = `${path}?${queryStringFromObject(req.queryParameters)}`;

    return new Request(`${req.origin!}${path}`, {
      method: req.method,
      headers,
      redirect: 'follow',
      body: body as BodyInit | undefined,
    });
  }

  /**
   * Determines the `undici` dispatcher to use for outgoing requests.
   *
   * A proxy dispatcher (when configured) takes precedence over the keep-alive dispatcher — the same
   * precedence the previous `proxy-agent` implementation had over the keep-alive `http.Agent`.
   *
   * @returns Dispatcher carrying connection-pool / proxy settings and the HTTP/2 negotiation flag.
   *
   * @internal
   */
  private dispatcherForTransportRequest(): Dispatcher {
    if (this.proxyConfiguration)
      return (this.proxyAgent ??= new ProxyAgent(NodeTransport.proxyAgentOptions(this.proxyConfiguration)));

    return (this.keepAliveAgent ??= this.makeKeepAliveAgent());
  }

  /**
   * Builds the keep-alive {@link Agent}, mapping the public {@link TransportKeepAlive} options (which
   * use Node `http.Agent` semantics) onto `undici`'s connection-pool options.
   *
   * @returns Configured multi-origin dispatcher.
   *
   * @internal
   */
  private makeKeepAliveAgent(): Agent {
    // `allowH2` is the single HTTP/2-facing switch: it enables ALPN negotiation during the TLS
    // handshake. When an origin only advertises HTTP/1.1, `undici` transparently falls back, so this
    // is safe for every origin and does not change behaviour against HTTP/1.1-only endpoints.
    const options: Agent.Options = { allowH2: true };
    const settings = this.keepAliveSettings;

    if (this.keepAlive) {
      // Map TransportKeepAlive (`http.Agent` semantics) -> undici:
      //  - `timeout` (ms before an idle socket is closed)   -> `keepAliveTimeout`
      //  - `maxSockets` (max sockets per host)              -> `connections`
      //  - `keepAliveMsecs` (TCP keep-alive probe delay ms) -> `connect.keepAliveInitialDelay`
      //  - `maxFreeSockets` has NO undici equivalent (undici manages free sockets internally) and is
      //    intentionally left unmapped.
      if (typeof settings.timeout === 'number') options.keepAliveTimeout = settings.timeout;
      if (typeof settings.maxSockets === 'number') options.connections = settings.maxSockets;
      if (typeof settings.keepAliveMsecs === 'number')
        options.connect = { keepAliveInitialDelay: settings.keepAliveMsecs };
    } else {
      // Keep-alive disabled. `undici` always pools connections, so "do not deliberately reuse
      // connections" is emulated by disabling HTTP/1.1 keep-alive via `pipelining: 0` (undici's
      // documented replacement for the removed `keepAlive: false`). This only affects HTTP/1.1; once
      // HTTP/2 is negotiated, concurrency is governed by `maxConcurrentStreams`, not pipelining.
      options.pipelining = 0;
    }

    return new Agent(options);
  }

  /**
   * Adapts a {@link NodeTransportProxyConfiguration} to `undici` {@link ProxyAgent} options.
   *
   * @param configuration - Proxy configuration provided through {@link setProxy}.
   *
   * @returns `undici` `ProxyAgent` options.
   *
   * @internal
   */
  private static proxyAgentOptions(configuration: NodeTransportProxyConfiguration): ProxyAgent.Options {
    // A fully-formed proxy URI is used as-is.
    if (typeof configuration === 'string') return { uri: configuration };

    const protocol = (configuration.protocol ?? 'http').replace(/:$/, '');
    const host = configuration.hostname ?? configuration.host ?? '';
    const port = configuration.port;
    const uri = `${protocol}://${host}${port != null ? `:${port}` : ''}`;

    const options: ProxyAgent.Options = { uri };

    // Convert `user:password` credentials into a Basic-auth proxy token.
    if (configuration.auth) options.token = `Basic ${Buffer.from(configuration.auth).toString('base64')}`;

    return options;
  }

  /**
   * Re-shapes a low-level network error into a form the shared {@link PubNubAPIError} classifier
   * understands.
   *
   * The global `fetch` (backed by `undici`) reports connection-level failures as
   * `TypeError: fetch failed` with the real cause — including the POSIX error `code` — attached to
   * `error.cause`. {@link PubNubAPIError} historically recognises `node-fetch`'s `FetchError` (matched
   * by `name` + `code`), so undici's error is normalised into that shape to preserve network-error
   * categorisation (e.g. `ECONNREFUSED` -> `PNNetworkIssuesCategory`, `ETIMEDOUT` -> timeout).
   *
   * @param error - Error thrown by `fetch`.
   *
   * @returns Original error, or a `FetchError`-shaped error carrying the POSIX `code`.
   *
   * @internal
   */
  private static normalizeNetworkError(error: unknown): Error | TransportResponse {
    const cause = error instanceof TypeError ? (error as { cause?: unknown }).cause : undefined;

    if (cause && typeof cause === 'object') {
      const { code, message } = cause as { code?: string; message?: string };

      if (typeof code === 'string') {
        const normalized = new Error(message ?? (error as Error).message) as Error & { code?: string };
        normalized.name = 'FetchError';
        normalized.code = code;
        return normalized;
      }
    }

    return error as Error;
  }
}
