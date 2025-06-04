/**
 * Node.js Transport provider module.
 *
 * @internal
 */

import fetch, { Request, Response, RequestInit, AbortError } from 'node-fetch';
import { ProxyAgent, ProxyAgentOptions } from 'proxy-agent';
import { Agent as HttpsAgent } from 'https';
import { Agent as HttpAgent } from 'http';
import FormData from 'form-data';
import { Buffer } from 'buffer';
import * as zlib from 'zlib';

import { CancellationController, TransportRequest } from '../core/types/transport-request';
import { Transport, TransportKeepAlive } from '../core/interfaces/transport';
import { TransportResponse } from '../core/types/transport-response';
import { LoggerManager } from '../core/components/logger-manager';
import { PubNubAPIError } from '../errors/pubnub-api-error';
import { PubNubFileInterface } from '../core/types/file';
import { queryStringFromObject } from '../core/utils';

/**
 * Class representing a fetch-based Node.js transport provider.
 *
 * @internal
 */
export class NodeTransport implements Transport {
  /**
   * Service {@link ArrayBuffer} response decoder.
   *
   * @internal
   */
  protected static decoder = new TextDecoder();

  /**
   * {@link string|String} to {@link ArrayBuffer} response decoder.
   */
  protected static encoder = new TextEncoder();

  /**
   * Request proxy configuration.
   *
   * @internal
   */
  private proxyConfiguration?: ProxyAgentOptions;

  /** @internal */
  private proxyAgent?: ProxyAgent;
  /** @internal */
  private httpsAgent?: HttpsAgent;
  /** @internal */
  private httpAgent?: HttpAgent;

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
    logger.debug(this.constructor.name, () => ({
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
  public setProxy(configuration?: ProxyAgentOptions) {
    if (configuration) this.logger.debug(this.constructor.name, 'Proxy configuration has been set.');
    else this.logger.debug(this.constructor.name, 'Proxy configuration has been removed.');
    this.proxyConfiguration = configuration;
  }

  makeSendable(req: TransportRequest): [Promise<TransportResponse>, CancellationController | undefined] {
    let controller: CancellationController | undefined = undefined;
    let abortController: AbortController | undefined;

    if (req.cancellable) {
      abortController = new AbortController();
      controller = {
        // Storing a controller inside to prolong object lifetime.
        abortController,
        abort: (reason) => {
          if (!abortController || abortController.signal.aborted) return;
          this.logger.trace(this.constructor.name, `On-demand request aborting: ${reason}`);
          abortController?.abort(reason);
        },
      } as CancellationController;
    }

    return [
      this.requestFromTransportRequest(req).then((request) => {
        this.logger.debug(this.constructor.name, () => ({ messageType: 'network-request', message: req }));

        return fetch(request, {
          signal: abortController?.signal,
          timeout: req.timeout * 1000,
        } as RequestInit)
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

            this.logger.debug(this.constructor.name, () => ({
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
              this.logger.warn(this.constructor.name, () => ({
                messageType: 'network-request',
                message: req,
                details: 'Timeout',
                canceled: true,
              }));
            } else if (errorMessage.includes('cancel') || errorMessage.includes('abort')) {
              this.logger.debug(this.constructor.name, () => ({
                messageType: 'network-request',
                message: req,
                details: 'Aborted',
                canceled: true,
              }));

              fetchError = new AbortError('Aborted');
            } else if (errorMessage.includes('network')) {
              this.logger.warn(this.constructor.name, () => ({
                messageType: 'network-request',
                message: req,
                details: 'Network error',
                failed: true,
              }));
            } else {
              this.logger.warn(this.constructor.name, () => ({
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
    let headers: Record<string, string> | undefined = req.headers;
    let body: string | ArrayBuffer | FormData | undefined;
    let path = req.path;

    // Create multipart request body.
    if (req.formData && req.formData.length > 0) {
      // Reset query parameters to conform to signed URL
      req.queryParameters = {};

      const file = req.body as PubNubFileInterface;
      const fileData = await file.toArrayBuffer();
      const formData = new FormData();
      for (const { key, value } of req.formData) formData.append(key, value);

      formData.append('file', Buffer.from(fileData), { contentType: 'application/octet-stream', filename: file.name });
      body = formData;

      headers = formData.getHeaders(headers ?? {});
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
        this.logger.trace(this.constructor.name, () => {
          const compressedSize = (body! as ArrayBuffer).byteLength;
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
      agent: this.agentForTransportRequest(req),
      method: req.method,
      headers,
      redirect: 'follow',
      body,
    } as RequestInit);
  }

  /**
   * Determines and returns the appropriate agent for a given transport request.
   *
   * If keep alive is not requested, returns undefined.
   *
   * @param req - The transport request object.
   *
   * @returns {HttpAgent | HttpsAgent | undefined} - The appropriate agent for the request, or
   * undefined if keep alive or proxy not requested.
   *
   * @internal
   */
  private agentForTransportRequest(req: TransportRequest): HttpAgent | HttpsAgent | undefined {
    // Create a proxy agent (if possible).
    if (this.proxyConfiguration)
      return this.proxyAgent ? this.proxyAgent : (this.proxyAgent = new ProxyAgent(this.proxyConfiguration));

    // Create keep alive agent.
    const useSecureAgent = req.origin!.startsWith('https:');

    const agentOptions = { keepAlive: this.keepAlive, ...(this.keepAlive ? this.keepAliveSettings : {}) };
    if (useSecureAgent && this.httpsAgent === undefined) this.httpsAgent = new HttpsAgent(agentOptions);
    else if (!useSecureAgent && this.httpAgent === undefined) this.httpAgent = new HttpAgent(agentOptions);

    return useSecureAgent ? this.httpsAgent : this.httpAgent;
  }
}
