import { Request } from 'node-fetch';
import { ProxyAgentOptions } from 'proxy-agent';
import { CancellationController, TransportRequest } from '../core/types/transport-request';
import { Transport, TransportKeepAlive } from '../core/interfaces/transport';
import { TransportResponse } from '../core/types/transport-response';
export declare class NodeTransport implements Transport {
    private readonly keepAlive;
    private readonly keepAliveSettings;
    private readonly logVerbosity;
    protected static decoder: TextDecoder;
    private proxyConfiguration?;
    private proxyAgent?;
    private httpsAgent?;
    private httpAgent?;
    constructor(keepAlive?: boolean, keepAliveSettings?: TransportKeepAlive, logVerbosity?: boolean);
    setProxy(configuration?: ProxyAgentOptions): void;
    makeSendable(req: TransportRequest): [Promise<TransportResponse>, CancellationController | undefined];
    request(req: TransportRequest): TransportRequest;
    private requestFromTransportRequest;
    private agentForTransportRequest;
    protected logRequestProcessProgress(request: Request, elapsed?: number, body?: ArrayBuffer): void;
}
