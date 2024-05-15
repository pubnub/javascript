import { CancellationController, TransportRequest } from '../core/types/transport-request';
import { TransportResponse } from '../core/types/transport-response';
import { Transport } from '../core/interfaces/transport';
export declare class WebReactNativeTransport implements Transport {
    private keepAlive;
    private readonly logVerbosity;
    protected static decoder: TextDecoder;
    constructor(keepAlive: boolean, logVerbosity: boolean);
    makeSendable(req: TransportRequest): [Promise<TransportResponse>, CancellationController | undefined];
    request(req: TransportRequest): TransportRequest;
    private requestFromTransportRequest;
    protected logRequestProcessProgress(request: Request, elapsed?: number, body?: ArrayBuffer): void;
}
