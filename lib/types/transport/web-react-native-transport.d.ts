/**
 * Common browser and React Native Transport provider module.
 */
import { CancellationController, TransportRequest } from '../core/types/transport-request';
import { TransportResponse } from '../core/types/transport-response';
import { Transport } from '../core/interfaces/transport';
/**
 * Class representing a `fetch`-based browser and React Native transport provider.
 */
export declare class WebReactNativeTransport implements Transport {
    private keepAlive;
    private readonly logVerbosity;
    /**
     * Service {@link ArrayBuffer} response decoder.
     */
    protected static decoder: TextDecoder;
    constructor(keepAlive: boolean, logVerbosity: boolean);
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
     * Log out request processing progress and result.
     *
     * @param request - Platform-specific
     * @param [elapsed] - How many seconds passed since request processing started.
     * @param [body] - Service response (if available).
     */
    protected logRequestProcessProgress(request: Request, elapsed?: number, body?: ArrayBuffer): void;
}
