import StatusCategory from '../core/constants/categories';
import { PubNubError } from './pubnub-error';
export class PubNubAPIError extends Error {
    static create(errorOrResponse, data) {
        if (errorOrResponse instanceof Error)
            return PubNubAPIError.createFromError(errorOrResponse);
        else
            return PubNubAPIError.createFromServiceResponse(errorOrResponse, data);
    }
    static createFromError(error) {
        let category = StatusCategory.PNUnknownCategory;
        let message = 'Unknown error';
        let errorName = 'Error';
        if (!error)
            return new PubNubAPIError(message, category, 0);
        else if (error instanceof PubNubAPIError)
            return error;
        if (error instanceof Error) {
            message = error.message;
            errorName = error.name;
        }
        if (errorName === 'AbortError' || message.indexOf('Aborted') !== -1) {
            category = StatusCategory.PNCancelledCategory;
            message = 'Request cancelled';
        }
        else if (message.indexOf('timeout') !== -1) {
            category = StatusCategory.PNTimeoutCategory;
            message = 'Request timeout';
        }
        else if (message.indexOf('network') !== -1) {
            category = StatusCategory.PNNetworkIssuesCategory;
            message = 'Network issues';
        }
        else if (errorName === 'FetchError') {
            const errorCode = error.code;
            if (['ECONNREFUSED', 'ENETUNREACH', 'ENOTFOUND', 'ECONNRESET', 'EAI_AGAIN'].includes(errorCode))
                category = StatusCategory.PNNetworkIssuesCategory;
            if (errorCode === 'ECONNREFUSED')
                message = 'Connection refused';
            else if (errorCode === 'ENETUNREACH')
                message = 'Network not reachable';
            else if (errorCode === 'ENOTFOUND')
                message = 'Server not found';
            else if (errorCode === 'ECONNRESET')
                message = 'Connection reset by peer';
            else if (errorCode === 'EAI_AGAIN')
                message = 'Name resolution error';
            else if (errorCode === 'ETIMEDOUT') {
                category = StatusCategory.PNTimeoutCategory;
                message = 'Request timeout';
            }
            else
                message = `Unknown system error: ${error}`;
        }
        else if (message === 'Request timeout')
            category = StatusCategory.PNTimeoutCategory;
        return new PubNubAPIError(message, category, 0, error);
    }
    static createFromServiceResponse(response, data) {
        let category = StatusCategory.PNUnknownCategory;
        let errorData;
        let message = 'Unknown error';
        let { status } = response;
        data !== null && data !== void 0 ? data : (data = response.body);
        if (status === 402)
            message = 'Not available for used key set. Contact support@pubnub.com';
        else if (status === 400) {
            category = StatusCategory.PNBadRequestCategory;
            message = 'Bad request';
        }
        else if (status === 403) {
            category = StatusCategory.PNAccessDeniedCategory;
            message = 'Access denied';
        }
        if (data && data.byteLength > 0) {
            const decoded = new TextDecoder().decode(data);
            if (response.headers['content-type'].indexOf('text/javascript') !== -1 ||
                response.headers['content-type'].indexOf('application/json') !== -1) {
                try {
                    const errorResponse = JSON.parse(decoded);
                    if (typeof errorResponse === 'object' && !Array.isArray(errorResponse)) {
                        if ('error' in errorResponse &&
                            (errorResponse.error === 1 || errorResponse.error === true) &&
                            'status' in errorResponse &&
                            typeof errorResponse.status === 'number' &&
                            'message' in errorResponse &&
                            'service' in errorResponse) {
                            errorData = errorResponse;
                            status = errorResponse.status;
                        }
                        if ('error' in errorResponse &&
                            typeof errorResponse.error === 'object' &&
                            !Array.isArray(errorResponse.error) &&
                            'message' in errorResponse.error) {
                            errorData = errorResponse.error;
                        }
                    }
                }
                catch (_) {
                    errorData = decoded;
                }
            }
            else if (response.headers['content-type'].indexOf('xml') !== -1) {
                const reason = /<Message>(.*)<\/Message>/gi.exec(decoded);
                message = reason ? `Upload to bucket failed: ${reason[1]}` : 'Upload to bucket failed.';
            }
            else {
                errorData = decoded;
            }
        }
        return new PubNubAPIError(message, category, status, errorData);
    }
    constructor(message, category, statusCode, errorData) {
        super(message);
        this.category = category;
        this.statusCode = statusCode;
        this.errorData = errorData;
        this.name = 'PubNubAPIError';
    }
    toStatus(operation) {
        return {
            error: true,
            category: this.category,
            operation,
            statusCode: this.statusCode,
            errorData: this.errorData,
        };
    }
    toPubNubError(operation, message) {
        return new PubNubError(message !== null && message !== void 0 ? message : this.message, this.toStatus(operation));
    }
}
