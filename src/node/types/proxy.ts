/**
 * Node.js proxy configuration types.
 */

// The object fields below are the historical `proxy-agent` `ProxyAgentOptions` subset that callers
// actually used (`hostname`/`host`, `port`, `protocol`, `auth`). Node transport maps them onto an
// `undici` `ProxyAgent` URI. Unlike `proxy-agent`, `undici` does not support SOCKS proxies, PAC
// files, or `HTTP(S)_PROXY`/`NO_PROXY` environment-variable auto-detection.

/**
 * Proxy configuration accepted by {@link PubNub.setProxy}.
 *
 * Provide an `http://` or `https://` proxy URI, or an object with host, port, protocol, and optional
 * basic-auth credentials. Only explicit HTTP and HTTPS proxies are supported.
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
      /** Proxy protocol (`http` or `https`). Defaults to `http`. */
      protocol?: string;
      /** Basic-auth credentials in `user:password` form. */
      auth?: string;
    };
