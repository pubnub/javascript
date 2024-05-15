import { TransportResponse } from '../core/types/transport-response';
import RequestOperation from '../core/constants/operations';
import StatusCategory from '../core/constants/categories';
import { Payload, Status } from '../core/types/api';
import { PubNubError } from './pubnub-error';
export declare class PubNubAPIError extends Error {
    readonly category: StatusCategory;
    readonly statusCode: number;
    readonly errorData?: Error | Payload | undefined;
    static create(errorOrResponse: Error | TransportResponse, data?: ArrayBuffer): PubNubAPIError;
    private static createFromError;
    private static createFromServiceResponse;
    constructor(message: string, category: StatusCategory, statusCode: number, errorData?: Error | Payload | undefined);
    toStatus(operation: RequestOperation): Status;
    toPubNubError(operation: RequestOperation, message?: string): PubNubError;
}
