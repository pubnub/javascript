import { Request } from 'node-fetch';
import { ProxyAgentOptions } from 'proxy-agent';
import { CancellationController, TransportRequest } from '../core/types/transport-request';
import { Transport, TransportKeepAlive } from '../core/interfaces/transport';
import { TransportResponse } from '../core/types/transport-response';
/**
 * Class representing a fetch-based Node.js transport provider.
 */
export declare class NodeTransport implements Transport {
    private readonly keepAlive;
    private readonly keepAliveSettings;
    private readonly logVerbosity;
    /**
     * Service {@link ArrayBuffer} response decoder.
     */
    protected static decoder: TextDecoder;
    /**
     * Request proxy configuration.
     */
    private proxyConfiguration?;
    private proxyAgent?;
    private httpsAgent?;
    private httpAgent?;
    /**
     * Creates a new `fetch`-based transport instance.
     *
     * @param keepAlive - Indicates whether keep-alive should be enabled.
     * @param [keepAliveSettings] - Optional settings for keep-alive.
     * @param [logVerbosity] - Whether verbose logging enabled or not.
     *
     * @returns Transport for performing network requests.
     */
    constructor(keepAlive?: boolean, keepAliveSettings?: TransportKeepAlive, logVerbosity?: boolean);
    /**
     * Update request proxy configuration.
     *
     * @param configuration - New proxy configuration.
     */
    setProxy(configuration?: ProxyAgentOptions): void;
    makeSendable(req: TransportRequest): [Promise<TransportResponse>, CancellationController | undefined];
    request(req: TransportRequest): TransportRequest;
    /**
     * Creates a Request object from a given {@link TransportRequest} object.
     *
     * @param req - The {@link TransportRequest} object containing request information.
     *
     * @returns Request object generated from the {@link TransportRequest} object.
     */
    private requestFromTransportRequest;
    /**
     * Determines and returns the appropriate agent for a given transport request.
     *
     * If keep alive is not requested, returns undefined.
     *
     * @param req - The transport request object.
     *
     * @returns {HttpAgent | HttpsAgent | undefined} - The appropriate agent for the request, or
     * undefined if keep alive or proxy not requested.
     */
    private agentForTransportRequest;
    /**
     * Log out request processing progress and result.
     *
     * @param request - Platform-specific request object.
     * @param [elapsed] - How many times passed since request processing started.
     * @param [body] - Service response (if available).
     */
    protected logRequestProcessProgress(request: Request, elapsed?: number, body?: ArrayBuffer): void;
}
