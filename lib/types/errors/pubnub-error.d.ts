import { Status } from '../core/types/api';
export declare class PubNubError extends Error {
    status?: Status | undefined;
    constructor(message: string, status?: Status | undefined);
}
export declare function createValidationError(message: string, statusCode?: number): Status;
