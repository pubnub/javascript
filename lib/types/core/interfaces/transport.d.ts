import { CancellationController, TransportRequest } from '../types/transport-request';
import { TransportResponse } from '../types/transport-response';
export type TransportKeepAlive = {
    keepAliveMsecs?: number;
    maxSockets?: number;
    maxFreeSockets?: number;
    timeout?: number;
};
export interface Transport {
    makeSendable(req: TransportRequest): [Promise<TransportResponse>, CancellationController | undefined];
    request(req: TransportRequest): TransportRequest;
}
