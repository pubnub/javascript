"use strict";
/**
 * Node.js Transport provider module.
 *
 * @internal
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeTransport = void 0;
const undici_1 = require("undici");
const buffer_1 = require("buffer");
const zlib = __importStar(require("zlib"));
const abort_signal_1 = require("../core/components/abort_signal");
const categories_1 = __importDefault(require("../core/constants/categories"));
const pubnub_api_error_1 = require("../errors/pubnub-api-error");
const utils_1 = require("../core/utils");
/**
 * Class representing a `fetch`-based Node.js transport provider.
 *
 * Requests are issued through the global {@link fetch} (so that HTTP mocking libraries which patch
 * the global stay effective in tests), while connection management and HTTP/2 negotiation are driven
 * by an `undici` dispatcher passed via the `dispatcher` request option.
 *
 * @internal
 */
class NodeTransport {
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
    constructor(logger, keepAlive = false, keepAliveSettings = { timeout: 30000 }) {
        this.logger = logger;
        this.keepAlive = keepAlive;
        this.keepAliveSettings = keepAliveSettings;
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
    setProxy(configuration) {
        if (configuration)
            this.logger.debug('NodeTransport', 'Proxy configuration has been set.');
        else
            this.logger.debug('NodeTransport', 'Proxy configuration has been removed.');
        this.proxyConfiguration = configuration;
        // Invalidate the cached proxy dispatcher so the new configuration takes effect on the next
        // request. Sockets held by the previous dispatcher are released asynchronously.
        if (this.proxyAgent) {
            void this.proxyAgent.close().catch(() => { });
            this.proxyAgent = undefined;
        }
    }
    makeSendable(req) {
        let controller = undefined;
        let abortController;
        // `undici`'s `fetch` has no per-request `timeout` option (unlike `node-fetch`), so the timeout is
        // expressed as an abort signal. The signal is created at fetch time (inside the `.then` below),
        // NOT here: `node-fetch`'s `{timeout}` started counting at the `fetch()` call, so charging the
        // async body-building work in `requestFromTransportRequest` (e.g. reading a large upload into
        // memory via `file.toArrayBuffer()`) against the request timeout would be a behaviour change.
        // Declared here so the `.catch` classifier can read its `.aborted` state.
        let timeoutSignal;
        if (req.cancellable) {
            abortController = new AbortController();
            controller = {
                // Storing a controller inside to prolong object lifetime.
                abortController,
                abort: (reason) => {
                    if (!abortController || abortController.signal.aborted)
                        return;
                    this.logger.trace('NodeTransport', `On-demand request aborting: ${reason}`);
                    abortController === null || abortController === void 0 ? void 0 : abortController.abort(reason);
                },
            };
        }
        return [
            this.requestFromTransportRequest(req)
                .then((request) => {
                this.logger.debug('NodeTransport', () => ({ messageType: 'network-request', message: req }));
                // Start the timeout clock now, at fetch time (see note above). `AbortSignal.timeout` schedules
                // an unref-ed timer, so it does not keep the event loop alive on its own.
                timeoutSignal = AbortSignal.timeout(req.timeout * 1000);
                // The request must abort on whichever happens first: user cancellation or timeout.
                const signal = abortController
                    ? AbortSignal.any([abortController.signal, timeoutSignal])
                    : timeoutSignal;
                return fetch(request, {
                    signal,
                    // The `undici` dispatcher carries connection-pool / proxy settings and the `allowH2` flag.
                    // It is set on the `fetch` init (not on the `Request`) and is not part of the standard
                    // `RequestInit`, hence the cast.
                    dispatcher: this.dispatcherForTransportRequest(),
                })
                    .then((response) => response.arrayBuffer().then((arrayBuffer) => [response, arrayBuffer]))
                    .then((response) => {
                    const responseBody = response[1].byteLength > 0 ? response[1] : undefined;
                    const { status, headers: requestHeaders } = response[0];
                    const headers = {};
                    // Copy Headers object content into plain Record.
                    requestHeaders.forEach((value, key) => (headers[key] = value.toLowerCase()));
                    const transportResponse = {
                        status,
                        url: request.url,
                        headers,
                        body: responseBody,
                    };
                    this.logger.debug('NodeTransport', () => {
                        var _a;
                        return ({
                            messageType: 'network-response',
                            message: transportResponse,
                            // Most-recently negotiated application-layer protocol (e.g. `h2` / `http/1.1`). See
                            // `lastNegotiatedProtocol`. `unknown` when the connection went through a proxy
                            // dispatcher (whose sockets the keep-alive connector does not observe) or over plain
                            // HTTP (no TLS, hence no ALPN).
                            details: `Negotiated protocol: ${(_a = this.lastNegotiatedProtocol) !== null && _a !== void 0 ? _a : 'unknown'}`,
                        });
                    });
                    if (status >= 400)
                        throw pubnub_api_error_1.PubNubAPIError.create(transportResponse);
                    return transportResponse;
                });
            })
                .catch((error) => {
                // The `.catch` is attached to the OUTER promise (not the inner `fetch` chain) so it also
                // classifies rejections from `requestFromTransportRequest` — e.g. `file.toArrayBuffer()`
                // throwing on an unreadable upload, or `new Request(...)` rejecting a malformed URL/header —
                // instead of letting them escape unclassified.
                //
                // Classification relies on signal state rather than parsing the rejection value, because
                // an aborted `fetch` may reject with the abort *reason* (which can be an arbitrary string)
                // instead of an `Error`.
                // Timeout takes priority: the timeout signal fires regardless of whether the request was
                // also user-cancellable. Re-shape it as a `timeout` message so the shared classifier maps
                // it to `PNTimeoutCategory`.
                if (timeoutSignal === null || timeoutSignal === void 0 ? void 0 : timeoutSignal.aborted) {
                    this.logger.warn('NodeTransport', () => ({
                        messageType: 'network-request',
                        message: req,
                        details: 'Timeout',
                        canceled: true,
                    }));
                    throw pubnub_api_error_1.PubNubAPIError.create(new Error('Request timeout'));
                }
                // User-requested cancellation. An `AbortError` (name `'AbortError'`) is what downstream
                // code keys off to recognise a cancelled request.
                if (abortController === null || abortController === void 0 ? void 0 : abortController.signal.aborted) {
                    this.logger.debug('NodeTransport', () => ({
                        messageType: 'network-request',
                        message: req,
                        details: 'Aborted',
                        canceled: true,
                    }));
                    throw pubnub_api_error_1.PubNubAPIError.create(new abort_signal_1.AbortError());
                }
                // Network failure or an already-classified service error (HTTP >= 400 thrown above).
                const apiError = pubnub_api_error_1.PubNubAPIError.create(NodeTransport.normalizeNetworkError(error));
                if (apiError.category === categories_1.default.PNNetworkIssuesCategory) {
                    this.logger.warn('NodeTransport', () => ({
                        messageType: 'network-request',
                        message: req,
                        details: 'Network error',
                        failed: true,
                    }));
                }
                else {
                    this.logger.warn('NodeTransport', () => ({
                        messageType: 'network-request',
                        message: req,
                        details: apiError.message,
                        failed: true,
                    }));
                }
                throw apiError;
            }),
            controller,
        ];
    }
    request(req) {
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
    requestFromTransportRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            let headers = req.headers;
            let body;
            let path = req.path;
            // Create multipart request body.
            if (req.formData && req.formData.length > 0) {
                // Reset query parameters to conform to signed URL
                req.queryParameters = {};
                const file = req.body;
                const fileData = yield file.toArrayBuffer();
                const formData = new FormData();
                for (const { key, value } of req.formData)
                    formData.append(key, value);
                // The Web `FormData` understood by `fetch` accepts a `Blob`/`File`, unlike the old `form-data`
                // package which took a `Buffer` plus `{ contentType, filename }` metadata.
                formData.append('file', new Blob([fileData], { type: 'application/octet-stream' }), file.name);
                body = formData;
                // Let `fetch` derive `Content-Type: multipart/form-data; boundary=...` from the FormData body.
                // A pre-existing Content-Type header would override the generated boundary and corrupt the
                // request, so any incoming Content-Type is stripped here.
                if (headers) {
                    headers = Object.assign({}, headers);
                    for (const key of Object.keys(headers))
                        if (key.toLowerCase() === 'content-type')
                            delete headers[key];
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
                        const compressedSize = body.byteLength;
                        const ratio = (compressedSize / initialBodySize).toFixed(2);
                        return {
                            messageType: 'text',
                            message: `Body of ${initialBodySize} bytes, compressed by ${ratio}x to ${compressedSize} bytes.`,
                        };
                    });
                }
            }
            if (req.queryParameters && Object.keys(req.queryParameters).length !== 0)
                path = `${path}?${(0, utils_1.queryStringFromObject)(req.queryParameters)}`;
            return new Request(`${req.origin}${path}`, {
                method: req.method,
                headers,
                redirect: 'follow',
                body: body,
            });
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
    dispatcherForTransportRequest() {
        var _a, _b;
        if (this.proxyConfiguration)
            return ((_a = this.proxyAgent) !== null && _a !== void 0 ? _a : (this.proxyAgent = new undici_1.ProxyAgent(NodeTransport.proxyAgentOptions(this.proxyConfiguration))));
        return ((_b = this.keepAliveAgent) !== null && _b !== void 0 ? _b : (this.keepAliveAgent = this.makeKeepAliveAgent()));
    }
    /**
     * Builds the keep-alive {@link Agent}, mapping the public {@link TransportKeepAlive} options (which
     * use Node `http.Agent` semantics) onto `undici`'s connection-pool options.
     *
     * @returns Configured multi-origin dispatcher.
     *
     * @internal
     */
    makeKeepAliveAgent() {
        // `allowH2` is the single HTTP/2-facing switch: it lets `undici` speak HTTP/2 over a socket whose
        // TLS ALPN negotiated `h2`. When an origin only advertises HTTP/1.1, `undici` transparently falls
        // back, so this is safe for every origin and does not change behaviour against HTTP/1.1-only
        // endpoints. (It must ALSO be set on the connector — see `makeConnector` — so the ALPN list
        // actually advertises `h2`.)
        const options = Object.assign({ allowH2: true }, NodeTransport.disabledInternalTimeouts());
        const settings = this.keepAliveSettings;
        let keepAliveInitialDelay;
        if (this.keepAlive) {
            // Map TransportKeepAlive (`http.Agent` semantics) -> undici:
            //  - `timeout` (ms before an idle socket is closed)   -> `keepAliveTimeout`
            //  - `maxSockets` (max sockets per host)              -> `connections`
            //  - `keepAliveMsecs` (TCP keep-alive probe delay ms) -> connector `keepAliveInitialDelay`
            //  - `maxFreeSockets` has NO undici equivalent (undici manages free sockets internally) and is
            //    intentionally left unmapped.
            if (typeof settings.timeout === 'number')
                options.keepAliveTimeout = settings.timeout;
            if (typeof settings.maxSockets === 'number')
                options.connections = settings.maxSockets;
            if (typeof settings.keepAliveMsecs === 'number')
                keepAliveInitialDelay = settings.keepAliveMsecs;
        }
        else {
            // Keep-alive disabled. `pipelining: 0` disables HTTP/1.1 request pipelining (undici's documented
            // replacement for the removed `keepAlive: false`).
            //
            // unlike `node-fetch`'s `http.Agent({keepAlive:
            // false})` — which sent `Connection: close` and used a fresh socket per request — `undici`
            // always pools and reuses sockets. We intentionally accept this connection reuse: it is a
            // transparent latency improvement with no observable effect on the SDK's public API. We do NOT
            // try to force per-request socket teardown.
            options.pipelining = 0;
        }
        // A custom connector lets us observe the ALPN-negotiated protocol for logging. It REPLACES
        // undici's built-in connector, so `makeConnector` re-applies `allowH2`, the disabled connect
        // timeout, and the keep-alive probe delay that undici would otherwise have set itself.
        options.connect = this.makeConnector(keepAliveInitialDelay);
        return new undici_1.Agent(options);
    }
    /**
     * Builds a TLS/TCP connector that records the application-layer protocol negotiated via ALPN.
     *
     * The WHATWG `fetch` `Response` carries no HTTP version, so the only place to read the negotiated
     * protocol is the freshly-connected TLS socket's `alpnProtocol`. Supplying a custom `connect`
     * function makes `undici` bypass its own `buildConnector`, so this connector must itself set the
     * options undici would otherwise have applied: `allowH2: true` (so the ALPN list advertises `h2` —
     * omitting it silently downgrades every connection to HTTP/1.1), `timeout: 0` (connect timeout
     * disabled, matching {@link disabledInternalTimeouts}), and the keep-alive probe delay.
     *
     * The connector only fires on NEW connections; pooled/reused sockets keep the previously-recorded
     * value, which is what we want to log.
     *
     * @param keepAliveInitialDelay - TCP keep-alive probe delay (ms), when keep-alive is configured.
     *
     * @returns Connector that populates {@link negotiatedProtocolByOrigin}.
     *
     * @internal
     */
    makeConnector(keepAliveInitialDelay) {
        const base = (0, undici_1.buildConnector)(Object.assign({ allowH2: true, 
            // The connect timeout lives HERE, and only here. undici only feeds the `Agent`'s
            // `connectTimeout` into its own built-in connector; when a custom `connect` function is
            // supplied (as it is here) undici skips that wiring entirely (see undici client.js: the
            // `connectTimeout -> buildConnector({timeout})` branch runs only when `connect` is not a
            // function). So `timeout: 0` below is what actually disables the connect timeout — do not
            // remove it expecting the Agent's `connectTimeout` to cover it.
            timeout: 0, 
            // node-fetch's `http.Agent({keepAlive:false})` did not enable OS-level TCP keep-alive probes;
            // undici's `buildConnector` turns them on by default. Mirror the keep-alive setting onto the
            // socket so the disabled case keeps node-fetch's "no SO_KEEPALIVE" behaviour.
            keepAlive: this.keepAlive }, (typeof keepAliveInitialDelay === 'number' ? { keepAliveInitialDelay } : {})));
        return (options, callback) => base(options, (error, socket) => {
            if (!error && socket && 'alpnProtocol' in socket) {
                // `alpnProtocol` is `'h2'`, `'http/1.1'`, or `false` when the server did not select a
                // protocol via ALPN (e.g. an older TLS server). Normalise the `false` case to `http/1.x`.
                const alpn = socket.alpnProtocol;
                this.lastNegotiatedProtocol = alpn ? alpn : 'http/1.x';
            }
            // Forward undici's two-arm callback contract unchanged (`[null, socket]` | `[Error, null]`).
            if (error)
                callback(error, null);
            else
                callback(null, socket);
        });
    }
    /**
     * `undici` introduces internal headers / body timeouts that `node-fetch` never had (300s / 300s by
     * default). These can fire *before* the SDK's own per-request timeout and surface as failure timing
     * that did not exist under `node-fetch`. They are disabled here so that the SDK's
     * `AbortSignal(req.timeout)` (see {@link makeSendable}) remains the single source of timeout truth,
     * matching `node-fetch`'s single `{timeout}` option. `0` disables each timeout entirely.
     *
     * The connect timeout (undici's 10s default) is NOT included here: on the keep-alive `Agent` it is
     * owned by the custom connector (`buildConnector({ timeout: 0 })` in {@link makeConnector}), because
     * undici ignores the `Agent`'s `connectTimeout` whenever a custom `connect` function is supplied. The
     * proxy path, which has no custom connector, sets `connectTimeout: 0` explicitly (see
     * {@link proxyAgentOptions}).
     *
     * @returns Partial dispatcher options that switch the undici-internal headers/body timeouts off.
     *
     * @internal
     */
    static disabledInternalTimeouts() {
        return { headersTimeout: 0, bodyTimeout: 0 };
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
    static proxyAgentOptions(configuration) {
        var _a, _b, _c;
        // `ProxyAgent.Options extends Agent.Options`, so the same internal-timeout switches apply: proxied
        // requests must also defer solely to the SDK `AbortSignal` for timeout (see
        // {@link disabledInternalTimeouts}). The proxy path uses undici's built-in connector (no custom
        // `connect` function), so `connectTimeout: 0` IS honoured here and is set explicitly to disable
        // undici's 10s connect timeout.
        const timeouts = Object.assign(Object.assign({}, NodeTransport.disabledInternalTimeouts()), { connectTimeout: 0 });
        // A fully-formed proxy URI is used as-is.
        if (typeof configuration === 'string')
            return Object.assign({ uri: configuration }, timeouts);
        const protocol = ((_a = configuration.protocol) !== null && _a !== void 0 ? _a : 'http').replace(/:$/, '');
        const host = (_c = (_b = configuration.hostname) !== null && _b !== void 0 ? _b : configuration.host) !== null && _c !== void 0 ? _c : '';
        const port = configuration.port;
        const uri = `${protocol}://${host}${port != null ? `:${port}` : ''}`;
        const options = Object.assign({ uri }, timeouts);
        // Convert `user:password` credentials into a Basic-auth proxy token.
        if (configuration.auth)
            options.token = `Basic ${buffer_1.Buffer.from(configuration.auth).toString('base64')}`;
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
     * @returns Original error, or a re-shaped error (`FetchError` with POSIX `code`, a `timeout`
     * message, or a `network` message) that the shared classifier maps to the right category.
     *
     * @internal
     */
    static normalizeNetworkError(error) {
        // Only `fetch`'s `TypeError: fetch failed` wrapper carries a low-level `cause`. A `TypeError`
        // WITHOUT a cause is a genuine request-construction / validation error and must keep falling
        // through to `PNBadRequestCategory` (the classifier's `TypeError` branch) — do not reshape it.
        const cause = error instanceof TypeError ? error.cause : undefined;
        if (cause && typeof cause === 'object') {
            const { message } = cause;
            // Resolve the most specific POSIX/undici error code available. When connecting to a host that
            // resolves to several addresses, undici/Node surface a single `AggregateError` whose top-level
            // `code` is often absent while each wrapped error in `.errors` carries the real code (e.g. every
            // address refused -> `ECONNREFUSED`). Reach into the wrapped errors so these still classify on
            // their real code rather than falling through to the generic branch below.
            const code = NodeTransport.networkErrorCode(cause);
            if (typeof code === 'string') {
                // undici expresses its internal connect / headers / body timeouts with `UND_ERR_*_TIMEOUT`
                // codes (not the POSIX `ETIMEDOUT` the classifier knows). Map them to a timeout-shaped error
                // so they classify as `PNTimeoutCategory`, matching `node-fetch`'s `ETIMEDOUT` -> timeout.
                // (With undici's internal timeouts disabled these are rare, but the mapping keeps any that do
                // surface — e.g. a server-aborted stream — correctly categorised.)
                if (code === 'UND_ERR_CONNECT_TIMEOUT' || code === 'UND_ERR_HEADERS_TIMEOUT' || code === 'UND_ERR_BODY_TIMEOUT')
                    return new Error('Request timeout');
                const normalized = new Error(message !== null && message !== void 0 ? message : error.message);
                normalized.name = 'FetchError';
                normalized.code = code;
                return normalized;
            }
            // A `fetch failed` whose cause carries no resolvable `code` (e.g. a TLS handshake failure that
            // surfaces only a message). This is still a transport-layer failure — `fetch` only throws
            // `fetch failed` once the request has left request construction — so it was a `node-fetch`
            // `FetchError` -> network issue, not a request bug. The classifier's bare `TypeError` branch
            // would otherwise mislabel it as a (non-retryable) `PNBadRequestCategory`, so reshape it into a
            // network-issues error to preserve `PNNetworkIssuesCategory`. The SDK's retry policy bounds the
            // resulting retries (capped attempts + exponential backoff), so a persistent failure does not
            // retry forever.
            return new Error('Network issues');
        }
        return error;
    }
    /**
     * Resolves the most specific error `code` from an undici/Node `fetch` cause, unwrapping a single
     * level of `AggregateError` (multi-address connect failures expose the real code on the wrapped
     * errors rather than the aggregate itself).
     *
     * @param cause - `error.cause` attached to a `TypeError: fetch failed`.
     *
     * @returns POSIX/undici error code, or `undefined` when none is present.
     *
     * @internal
     */
    static networkErrorCode(cause) {
        const { code, errors } = cause;
        if (typeof code === 'string')
            return code;
        if (Array.isArray(errors)) {
            for (const inner of errors) {
                const innerCode = inner != null ? inner.code : undefined;
                if (typeof innerCode === 'string')
                    return innerCode;
            }
        }
        return undefined;
    }
}
exports.NodeTransport = NodeTransport;
/**
 * {@link string|String} to {@link ArrayBuffer} response decoder.
 */
NodeTransport.encoder = new TextEncoder();
