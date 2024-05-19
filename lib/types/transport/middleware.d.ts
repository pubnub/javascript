import { TransportRequest } from '../core/types/transport-request';
import { PrivateClientConfiguration } from '../core/interfaces/configuration';
import { TokenManager } from '../core/components/token_manager';
import { Transport } from '../core/interfaces/transport';
/**
 * Transport middleware configuration options.
 */
type PubNubMiddlewareConfiguration = {
    /**
     * Private client configuration.
     */
    clientConfiguration: PrivateClientConfiguration;
    /**
     * REST API endpoints access tokens manager.
     */
    tokenManager?: TokenManager;
    /**
     * HMAC-SHA256 hash generator from provided `data`.
     */
    shaHMAC?: (data: string) => string;
    /**
     * Platform-specific transport for requests processing.
     */
    transport: Transport;
};
export declare class PubNubMiddleware implements Transport {
    private configuration;
    /**
     * Request signature generator.
     */
    signatureGenerator?: RequestSignature;
    constructor(configuration: PubNubMiddlewareConfiguration);
    makeSendable(req: TransportRequest): [Promise<import("../core/types/transport-response").TransportResponse>, import("../core/types/transport-request").CancellationController | undefined];
    request(req: TransportRequest): TransportRequest;
    private authenticateRequest;
    /**
     * Compute and append request signature.
     *
     * @param req - Transport request with information which should be used to generate signature.
     */
    private signRequest;
    /**
     * Compose `pnsdk` query parameter.
     *
     * SDK provides ability to set custom name or append vendor information to the `pnsdk` query
     * parameter.
     *
     * @returns Finalized `pnsdk` query parameter value.
     */
    private generatePNSDK;
}
export {};
