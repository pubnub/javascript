import { Agent as HttpsAgent } from 'https';
import { Agent as HttpAgent } from 'http';
import fetch, { Headers, Request, Response } from 'node-fetch';

import { Transport, TransportKeepAlive } from '../core/interfaces/transport';
import { TransportRequest } from '../core/types/transport-request';
import { TransportResponse } from '../core/types/transport-response';
import { BaseTransport } from './transport';

/**
 * Class representing a fetch-based Node.JS transport provider.
 */
export class NodeTransport extends BaseTransport implements Transport {
  private httpsAgent?: HttpsAgent;
  private httpAgent?: HttpAgent;

  /**
   * Creates a new `fetch`-based transport instance.
   *
   * @param keepAlive - Indicates whether keep-alive should be enabled.
   * @param [keepAliveSettings] - Optional settings for keep-alive.
   *
   * @returns Transport for performing network requests.
   */
  constructor(private keepAlive: boolean = false, private keepAliveSettings: TransportKeepAlive = { timeout: 30000 }) {
    super();
  }

  async send(req: TransportRequest): Promise<TransportResponse> {
    const request = this.requestFromTransportRequest(req);
    return this.transportResponseFromResponse(await fetch(request));
  }

  /**
   * Creates a Request object from a given TransportRequest object.
   *
   * @param req - The TransportRequest object containing request information.
   * @returns {Request} - The Request object generated from the TransportRequest object.
   * @private
   */
  private requestFromTransportRequest(req: TransportRequest): Request {
    let headers: Record<string, string> | undefined = undefined;

    if (req.headers) {
      headers = {};
      for (const [key, value] of Object.entries(req.headers)) {
        headers[key] = value;
      }
    }

    return new Request(req.url, {
      agent: this.agentForTransportRequest(req),
      method: req.method,
      headers,
      redirect: 'follow',
      body: req.body,
    });
  }

  /**
   * Determines and returns the appropriate agent for a given transport request.
   *
   * If keep alive is not requested, returns undefined.
   *
   * @param req - The transport request object.
   * @returns {HttpAgent | HttpsAgent | undefined} - The appropriate agent for the request, or
   * undefined if keep alive is not requested.
   * @private
   */
  private agentForTransportRequest(req: TransportRequest): HttpAgent | HttpsAgent | undefined {
    // Don't configure any agents if keep alive not requested.
    if (!this.keepAlive) return undefined;

    const useSecureAgent = req.url.startsWith('https:');

    if (useSecureAgent && this.httpsAgent === undefined)
      this.httpsAgent = new HttpsAgent({ keepAlive: true, ...this.keepAliveSettings });
    else if (!useSecureAgent && this.httpAgent === undefined) {
      this.httpAgent = new HttpAgent({ keepAlive: true, ...this.keepAliveSettings });
    }

    return useSecureAgent ? this.httpsAgent : this.httpAgent;
  }
}
