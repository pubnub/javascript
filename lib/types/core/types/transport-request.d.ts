import { PubNubFileInterface } from './file';
import { Query } from './api';
export declare enum TransportMethod {
    GET = "GET",
    POST = "POST",
    PATCH = "PATCH",
    DELETE = "DELETE",
    LOCAL = "LOCAL"
}
export type CancellationController = {
    abort: () => void;
};
export type TransportRequest = {
    origin?: string;
    path: string;
    queryParameters?: Query;
    method: TransportMethod;
    headers?: Record<string, string>;
    formData?: Record<string, string>[];
    body?: ArrayBuffer | PubNubFileInterface | string;
    timeout: number;
    cancellable: boolean;
    identifier: string;
};
