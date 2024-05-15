import { TransportRequest } from '../core/types/transport-request';
import { PrivateClientConfiguration } from '../core/interfaces/configuration';
import { TokenManager } from '../core/components/token_manager';
import { Transport } from '../core/interfaces/transport';
type PubNubMiddlewareConfiguration = {
    clientConfiguration: PrivateClientConfiguration;
    tokenManager: TokenManager;
    shaHMAC?: (data: string) => string;
    transport: Transport;
};
export declare class RequestSignature {
    private publishKey;
    private secretKey;
    private hasher;
    private static textDecoder;
    constructor(publishKey: string, secretKey: string, hasher: (input: string, secret: string) => string);
    signature(req: TransportRequest): string;
    private queryParameters;
}
export declare class PubNubMiddleware implements Transport {
    private configuration;
    signatureGenerator?: RequestSignature;
    constructor(configuration: PubNubMiddlewareConfiguration);
    makeSendable(req: TransportRequest): [Promise<import("../core/types/transport-response").TransportResponse>, import("../core/types/transport-request").CancellationController | undefined];
    request(req: TransportRequest): TransportRequest;
    private authenticateRequest;
    private signRequest;
    private generatePNSDK;
}
export {};
