import { CancellationController, TransportRequest } from '../types/transport-request';
import { TransportResponse } from '../types/transport-response';
/**
 * Represents the configuration options for keeping the transport connection alive.
 */
export type TransportKeepAlive = {
    /**
     * The time interval in milliseconds for keeping the connection alive.
     *
     * @default 1000
     */
    keepAliveMsecs?: number;
    /**
     * The maximum number of sockets allowed per host.
     *
     * @default Infinity
     */
    maxSockets?: number;
    /**
     * The maximum number of open and free sockets in the pool per host.
     *
     * @default 256
     */
    maxFreeSockets?: number;
    /**
     * Timeout in milliseconds, after which the `idle` socket will be closed.
     *
     * @default 30000
     */
    timeout?: number;
};
/**
 * This interface is used to send requests to the PubNub API.
 *
 * You can implement this interface for your types, or use one of the provided modules to use a
 * transport library.
 *
 * @interface
 */
export interface Transport {
    /**
     * Make request sendable.
     *
     * @param req - The transport request to be processed.
     *
     * @returns - A promise that resolves to a transport response and request cancellation
     * controller (if required).
     */
    makeSendable(req: TransportRequest): [Promise<TransportResponse>, CancellationController | undefined];
    /**
     * Pre-processed request.
     *
     * Transport implementation may pre-process original transport requests before making
     * platform-specific request objects from it.
     *
     * @param req - Transport request provided by the PubNub client.
     *
     * @returns Transport request with updated properties (if it was required).
     */
    request(req: TransportRequest): TransportRequest;
}
