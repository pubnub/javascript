import { Transport } from '../core/interfaces/transport';
import { TransportRequest } from '../core/types/transport-request';
import { TransportResponse } from '../core/types/transport-response';
import { BaseTransport } from './transport';

/**
 * Class representing a fetch-based web transport provider.
 */
export class WebTransport extends BaseTransport implements Transport {
  async send(req: TransportRequest): Promise<TransportResponse> {
    const request = this.requestFromTransportRequest(req);
    return this.transportResponseFromResponse(await fetch(request));
  }

  private requestFromTransportRequest(req: TransportRequest): Request {
    let headers: Record<string, string> | undefined = undefined;

    if (req.headers) {
      headers = {};
      for (const [key, value] of Object.entries(req.headers)) {
        headers[key] = value;
      }
    }

    return new Request(req.url, {
      method: req.method,
      headers,
      redirect: 'follow',
      body: req.body,
    });
  }
}
