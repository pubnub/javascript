import { Transport } from '../core/interfaces/transport';
import { TransportRequest } from '../core/types/transport-request';
import { TransportResponse } from '../core/types/transport-response';

export class TitaniumTransport implements Transport {
  async send(req: TransportRequest): Promise<TransportResponse> {
    return Promise.resolve(undefined);
  }
}
